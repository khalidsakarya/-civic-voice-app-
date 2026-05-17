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
  crime:
    'http://library.metatab.org/openjustice.doj.ca.gov-datasets-1.1.1/data/crimes_clearances.csv',
  crimePage: 'https://openjustice.doj.ca.gov/',
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

async function fetchFredSeries(seriesId) {
  const text = await fetchText(FRED(seriesId), 0);
  if (!text.startsWith('observation')) {
    throw new Error(`FRED series ${seriesId} unavailable`);
  }
  return parseFredCsv(text, seriesId);
}

async function buildEconomic() {
  const notes = [];
  const out = {
    jurisdiction_id: JURISDICTION_ID,
    crime_source: 'California DOJ OpenJustice — crimes and clearances',
    crime_url: SOURCES.crimePage,
    crime_reporting_period: 'Annual (latest year in OpenJustice extract)',
    unemployment_source: 'U.S. Bureau of Labor Statistics via FRED (CAUR, UNRATE)',
    unemployment_url: SOURCES.unemployment,
    unemployment_reporting_period: 'Monthly series, annual averages (seasonally adjusted)',
    gdp_source: 'U.S. Bureau of Economic Analysis via FRED (CANGSP)',
    gdp_url: SOURCES.gdp,
    gdp_reporting_period: 'Annual nominal GDP, year-over-year growth',
    reporting_period:
      'Crime: OpenJustice annual (latest year in extract); unemployment: BLS CAUR/UNRATE annual averages; GDP: BEA CANGSP YoY',
  };

  try {
    const crimeCsv = await fetchText(SOURCES.crime, 80 * 1024 * 1024);
    const { rows } = parseCsv(crimeCsv);
    const byYear = new Map();
    for (let i = 0; i < rows.length; i += 1) {
      const year = trim(rows[i].year);
      if (!year) continue;
      const violent = num(rows[i].violent_sum) || 0;
      const property = num(rows[i].property_sum) || 0;
      if (!byYear.has(year)) byYear.set(year, { violent: 0, property: 0 });
      const b = byYear.get(year);
      b.violent += violent;
      b.property += property;
    }
    const years = [...byYear.keys()].sort().slice(-6);
    out.crime_rate = years.map((year) => ({
      year,
      'Violent Crime': byYear.get(year).violent,
      'Property Crime': byYear.get(year).property,
    }));
  } catch (err) {
    notes.push(`crime: ${err.message}`);
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
};
