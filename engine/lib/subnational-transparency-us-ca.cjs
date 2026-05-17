/**
 * US-CA (California) — official sources only.
 */

const readline = require('readline');
const http = require('http');
const https = require('https');
const {
  MAX_RECORDS,
  trim,
  num,
  fetchText,
  fetchBuffer,
  fetchJson,
  parseCsv,
  parseFredCsv,
  annualFromMonthly,
  yoyPercentFromAnnual,
  fmtCompact,
  parseMoneyish,
  industryFromNtee,
  ckanDatastoreSearch,
  splitCsvLine,
} = require('./subnational-transparency-shared.cjs');

const JURISDICTION_ID = 'US-CA';
const FRED = (id, cosd = '2019-01-01') =>
  `https://fred.stlouisfed.org/graph/fredgraph.csv?id=${encodeURIComponent(id)}&cosd=${cosd}`;

const SOURCES = {
  crimePdf:
    'https://data-openjustice.doj.ca.gov/sites/default/files/2025-07/Crime%20In%20CA%202024%20final.pdf',
  crimePage: 'https://oag.ca.gov/crime',
  homelessness:
    'https://data.ca.gov/dataset/ca-system-performance-measures-statewide-and-by-coc',
  homelessnessCsv:
    'https://data.ca.gov/dataset/d3f9ca4d-3e60-434b-9fa3-91ee0befd34d/resource/e02178d9-1d34-4798-9979-f50af9f1742e/download/ca-spms-prior-years-and-last-twelve-months.csv',
  homelessnessResource: 'e02178d9-1d34-4798-9979-f50af9f1742e',
  unemployment: 'https://fred.stlouisfed.org/series/CAUR',
  unemploymentNat: 'https://fred.stlouisfed.org/series/UNRATE',
  gdp: 'https://fred.stlouisfed.org/series/CANGSP',
  budget:
    'https://www.dof.ca.gov/Forecasting/Budget/BudgetSummary/documents/2024-25_Budget_Summary.pdf',
  budgetNote: 'California Department of Finance — 2024-25 Budget Summary (General Fund major programs)',
  tax: 'https://www.irs.gov/pub/irs-soi/eo3.csv',
  taxPage:
    'https://www.irs.gov/charities-non-profits/exempt-organizations-business-master-file-extract-eo-bmf',
  grants: 'https://data.ca.gov/dataset/california-grants-portal-grant-awards-2024-2025',
  grantsResource: '97bbaf09-c935-4897-9529-b8cc56b080a1',
};

/** Table 1 statewide rates (per 100,000) — Crime in California 2024, CA DOJ. */
const CRIME_RATE_FALLBACK = [
  { year: '2019', violent: 433.5, property: 2290.3 },
  { year: '2020', violent: 437.0, property: 2114.4 },
  { year: '2021', violent: 466.2, property: 2178.4 },
  { year: '2022', violent: 494.6, property: 2313.6 },
  { year: '2023', violent: 511.0, property: 2272.7 },
  { year: '2024', violent: 480.3, property: 2082.7 },
];

const SPM_YEAR_COLUMNS = [
  { col: 'Jan 2020 - Dec 2020', year: '2020' },
  { col: 'Jan 2022 - Dec 2022', year: '2022' },
  { col: 'Jan 2023 - Dec 2023', year: '2023' },
  { col: 'Jan 2024 - Dec 2024', year: '2024' },
];

async function fetchFredSeries(seriesId) {
  const text = await fetchText(FRED(seriesId), 0);
  if (!text.startsWith('observation')) {
    throw new Error(`FRED series ${seriesId} unavailable`);
  }
  return parseFredCsv(text, seriesId);
}

/**
 * Parse statewide violent/property crime rates from Crime in California PDF text.
 * Falls back to published Table 1 figures when PDF text layout is not line-oriented.
 */
function parseCrimeRatesFromCaDojPdf(buf) {
  const text = buf.toString('latin1');
  const out = new Map();
  const lineRe =
    /^(\d{4})\.{2,}\s+([\d,]+\.?\d*)\s+([\d,]+\.?\d*)\s+([\d,]+\.?\d*)\s+([\d,]+\.?\d*)\s+([\d,]+\.?\d*)/;
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(lineRe);
    if (!m) continue;
    const year = m[1];
    const violent = parseFloat(m[2].replace(/,/g, ''));
    const property = parseFloat(m[5].replace(/,/g, ''));
    if (
      year >= '2015' &&
      year <= '2030' &&
      violent >= 200 &&
      violent <= 1200 &&
      property >= 1500 &&
      property <= 3500
    ) {
      out.set(year, { year, violent, property });
    }
  }
  for (const row of CRIME_RATE_FALLBACK) {
    if (!out.has(row.year)) out.set(row.year, row);
  }
  return [...out.values()].sort((a, b) => a.year.localeCompare(b.year));
}

async function fetchCaliforniaCrimeRates() {
  const buf = await fetchBuffer(SOURCES.crimePdf, 15 * 1024 * 1024);
  return parseCrimeRatesFromCaDojPdf(buf).slice(-6);
}

function metricRowByName(rows, metric) {
  return rows.find((r) => trim(r.Metric) === metric && trim(r.Location) === 'California') || null;
}

/**
 * California SPM: PIT Count (total) and M1b (unsheltered from CoC PIT counts).
 * Sheltered = PIT total − M1b. 2021 omitted in official SPM (irregular PIT year).
 */
async function fetchCaliforniaHomelessness() {
  const csvText = await fetchText(SOURCES.homelessnessCsv, 8 * 1024 * 1024);
  const { rows } = parseCsv(csvText);
  const pit = metricRowByName(rows, 'PIT Count');
  const unsheltered = metricRowByName(rows, 'M1b');
  if (!pit || !unsheltered) {
    throw new Error('California SPM PIT Count / M1b rows not found');
  }

  const series = [];
  for (let i = 0; i < SPM_YEAR_COLUMNS.length; i += 1) {
    const { col, year } = SPM_YEAR_COLUMNS[i];
    const totalRaw = trim(pit[col]);
    const unshelteredRaw = trim(unsheltered[col]);
    if (!totalRaw || totalRaw === 'N/A' || !unshelteredRaw || unshelteredRaw === 'N/A') continue;
    const total = num(totalRaw);
    const unshelteredN = num(unshelteredRaw);
    if (total == null || unshelteredN == null || unshelteredN > total) continue;
    series.push({
      year,
      Sheltered: Math.round(total - unshelteredN),
      Unsheltered: Math.round(unshelteredN),
    });
  }
  if (!series.length) {
    throw new Error('No usable California PIT homelessness years in SPM extract');
  }
  return series.slice(-6);
}

async function buildEconomic() {
  const notes = [];
  const out = {
    jurisdiction_id: JURISDICTION_ID,
    crime_metric_type: 'incident_rate',
    crime_source:
      'California Department of Justice — Crime in California 2024 (Table 1, rate per 100,000 population)',
    crime_url: SOURCES.crimePdf,
    crime_reporting_period: 'Annual statewide rates, 2019–2024 (Crime in California 2024)',
    homelessness_source:
      'California Department of Housing and Community Development — System Performance Measures (statewide PIT Count and M1b unsheltered)',
    homelessness_url: SOURCES.homelessness,
    homelessness_reporting_period:
      'Point-in-Time counts: 2020, 2022–2024 (2021 not reported in CA SPM due to irregular PIT counts)',
    unemployment_source: 'U.S. Bureau of Labor Statistics via FRED (CAUR, UNRATE)',
    unemployment_url: SOURCES.unemployment,
    unemployment_reporting_period: 'Monthly series, annual averages (seasonally adjusted)',
    gdp_source: 'U.S. Bureau of Economic Analysis via FRED (CANGSP)',
    gdp_url: SOURCES.gdp,
    gdp_reporting_period: 'Annual nominal GDP, year-over-year growth',
    reporting_period:
      'Crime: CA DOJ annual rates 2019–2024; homelessness: CA SPM PIT 2020 & 2022–2024; unemployment: BLS CAUR/UNRATE; GDP: BEA CANGSP YoY',
  };

  try {
    const rates = await fetchCaliforniaCrimeRates();
    out.crime_rate = rates.map((r) => ({
      year: r.year,
      'Violent Crime': r.violent,
      'Property Crime': r.property,
    }));
  } catch (err) {
    notes.push(`crime: ${err.message}`);
  }

  try {
    out.homelessness = await fetchCaliforniaHomelessness();
  } catch (err) {
    notes.push(`homelessness: ${err.message}`);
  }

  try {
    const ca = annualFromMonthly(await fetchFredSeries('CAUR'), 6);
    const us = annualFromMonthly(await fetchFredSeries('UNRATE'), 6);
    const usByYear = new Map(us.map((r) => [r.year, r.value]));
    out.unemployment_rate = ca.map((r) => ({
      year: r.year,
      California: r.value,
      'US Average': usByYear.get(r.year) ?? null,
    }));
  } catch (err) {
    notes.push(`unemployment: ${err.message}`);
  }

  try {
    const levels = annualFromMonthly(
      (await fetchFredSeries('CANGSP')).map((p) => ({ date: `${p.date}-01-01`, value: p.value })),
      8,
    );
    out.gdp_growth = yoyPercentFromAnnual(levels).slice(-6);
  } catch (err) {
    notes.push(`gdp: ${err.message}`);
  }

  if (notes.length) out.data_status = { notes };
  else out.data_status = { notes: [] };
  return out;
}

function streamCsvRows(url, onRow, maxRows = 500000) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const lib = u.protocol === 'https:' ? https : http;
    const req = lib.get(url, { headers: { 'User-Agent': 'CivicVoice-SubnationalSync/1.0' } }, (res) => {
      if (res.statusCode !== 200) {
        res.resume();
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        return;
      }
      let headers = null;
      let count = 0;
      const rl = readline.createInterface({ input: res, crlfDelay: Infinity });
      rl.on('line', (line) => {
        if (count > maxRows) {
          rl.close();
          req.destroy();
          return;
        }
        if (!headers) {
          headers = splitCsvLine(line);
          return;
        }
        count += 1;
        const cols = splitCsvLine(line);
        const row = {};
        for (let i = 0; i < headers.length; i += 1) row[headers[i]] = cols[i] ?? '';
        onRow(row);
      });
      rl.on('close', resolve);
      rl.on('error', reject);
    });
    req.on('error', reject);
  });
}

async function buildTax() {
  const candidates = [];
  await streamCsvRows(SOURCES.tax, (row) => {
    if (trim(row.STATE) !== 'CA') return;
    candidates.push(row);
  });
  candidates.sort((a, b) => (trim(b.ASSET_CD) || '').localeCompare(trim(a.ASSET_CD) || ''));
  const picked = candidates.slice(0, MAX_RECORDS);
  const records = picked.map((row) => {
    const ind = industryFromNtee(row.SUBSECTION, row.CLASSIFICATION);
    const year = num((trim(row.TAX_PERIOD) || '').slice(0, 4)) || null;
    return {
      name: trim(row.NAME) || 'Unknown organization',
      industry: ind.label,
      industryColor: ind.color,
      exemType: `IRS §${trim(row.SUBSECTION) || '?'} Exempt Organization`,
      city: trim(row.CITY),
      fmtValue: 'Tax-Exempt',
      rawValue: 0,
      year: year || undefined,
      ein: trim(row.EIN),
    };
  });
  return {
    jurisdiction_id: JURISDICTION_ID,
    data_source:
      'Internal Revenue Service — Exempt Organizations Business Master File Extract (Region 3, filtered to California)',
    source_url: SOURCES.taxPage,
    note: 'EO BMF Region 3 file; records filtered to STATE=CA',
    total_in_source: candidates.length,
    records_stored: records.length,
    records,
  };
}

async function buildGrants() {
  const all = [];
  let offset = 0;
  const page = 1000;
  while (all.length < 5000 && offset < 20000) {
    const result = await ckanDatastoreSearch('https://data.ca.gov', SOURCES.grantsResource, {
      limit: page,
      offset,
    });
    const batch = result.records || [];
    if (!batch.length) break;
    all.push(...batch);
    offset += batch.length;
    if (batch.length < page) break;
  }
  all.sort((a, b) => parseMoneyish(b.TotalAwardAmount) - parseMoneyish(a.TotalAwardAmount));
  const top = all.slice(0, MAX_RECORDS);
  const records = top.map((row) => {
    const amt = parseMoneyish(row.TotalAwardAmount);
    return {
      recipientName: trim(row.RecipientName) || trim(row.ProjectTitle) || 'Recipient',
      typeLabel: trim(row.RecipientType) || 'Organization',
      typeColor: 'bg-blue-100 text-blue-700',
      purpose: trim(row.ProjectAbstract) || trim(row.ProjectTitle) || 'State grant award',
      dept: trim(row.AgencyDept) || 'State of California',
      fmtAmount: fmtCompact(amt),
      rawAmount: amt,
      date: trim(row.FiscalYear) || '2024-2025',
    };
  });
  const totalRaw = top.reduce((s, r) => s + parseMoneyish(r.TotalAwardAmount), 0);
  return {
    jurisdiction_id: JURISDICTION_ID,
    fiscal_year: '2024-25',
    reporting_period: 'California Grants Portal — FY 2024-25 award data',
    data_source: 'California Grants Portal — Grant Awards 2024-2025 (data.ca.gov)',
    source_url: SOURCES.grants,
    note: 'Top awards by amount from official Grants Portal datastore',
    total_in_source: all.length,
    records_stored: records.length,
    total_raw_top100: totalRaw,
    fmt_total_top100: fmtCompact(totalRaw),
    records,
  };
}

module.exports = {
  JURISDICTION_ID,
  SOURCES,
  buildEconomic,
  buildTax,
  buildGrants,
  parseCrimeRatesFromCaDojPdf,
  fetchCaliforniaHomelessness,
};
