/**
 * AU-NSW (New South Wales) — official sources only.
 */

const readline = require('readline');
const https = require('https');
const XLSX = require('xlsx');
const {
  MAX_RECORDS,
  trim,
  num,
  fetchBuffer,
  fetchText,
  splitCsvLine,
} = require('./subnational-transparency-shared.cjs');

const JURISDICTION_ID = 'AU-NSW';

const SOURCES = {
  crime:
    'https://bocsar.nsw.gov.au/content/dam/dcj/bocsar/documents/open-datasets/Long_term_trends.xlsx',
  crimePage: 'https://bocsar.nsw.gov.au/statistics-dashboards/open-datasets/trend-data-files.html',
  tax: 'https://data.gov.au/data/dataset/acnc-register',
  taxCsv:
    'https://data.gov.au/data/dataset/b050b242-4487-4306-abf5-07ca073e5594/resource/8fb32972-24e9-4c95-885e-7140be51be8a/download/acnc-register.csv',
  unemploymentAbs:
    'https://www.abs.gov.au/statistics/labour/employment-and-unemployment/labour-force-australia/latest-release',
};

const INDUSTRY_MAP = {
  'Advancing Education': { label: 'Education', color: 'bg-blue-100 text-blue-700' },
  'Advancing Health': { label: 'Health', color: 'bg-green-100 text-green-700' },
  'Advancing Religion': { label: 'Religion', color: 'bg-orange-100 text-orange-700' },
  'Advancing social or public welfare': {
    label: 'Human Services',
    color: 'bg-emerald-100 text-emerald-700',
  },
};

function acncIndustry(row) {
  const keys = Object.keys(INDUSTRY_MAP);
  for (let i = 0; i < keys.length; i += 1) {
    if (trim(row[keys[i]]) === 'Y') return INDUSTRY_MAP[keys[i]];
  }
  return { label: 'Other', color: 'bg-stone-100 text-stone-600' };
}

async function buildEconomic() {
  const out = {
    jurisdiction_id: JURISDICTION_ID,
    crime_source: 'BOCSAR — NSW Recorded Crime Statistics (long-term trends)',
    crime_url: SOURCES.crimePage,
    crime_reporting_period: 'January 1995 – December 2025 (rate per 100,000 population)',
    reporting_period:
      'Crime: BOCSAR NSW recorded crime rates (per 100,000) to December 2025',
  };

  const buf = await fetchBuffer(SOURCES.crime);
  const wb = XLSX.read(buf, { type: 'buffer' });
  const sheet = wb.Sheets['1995-2025 Totals'];
  if (!sheet) throw new Error('BOCSAR totals sheet missing');
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  const crime = [];
  for (let i = 0; i < rows.length; i += 1) {
    const r = rows[i];
    const year = num(r[0]);
    if (!year || year < 1995) continue;
    const violentRate =
      (num(r[12]) || 0) +
      (num(r[13]) || 0) +
      (num(r[14]) || 0) +
      (num(r[15]) || 0) +
      (num(r[16]) || 0) +
      (num(r[17]) || 0) +
      (num(r[18]) || 0);
    const propertyRate =
      (num(r[19]) || 0) + (num(r[20]) || 0) + (num(r[21]) || 0);
    if (violentRate <= 0 && propertyRate <= 0) continue;
    crime.push({
      year: String(Math.round(year)),
      'Violent Crime': Math.round(violentRate * 10) / 10,
      'Property Crime': Math.round(propertyRate * 10) / 10,
    });
  }
  out.crime_rate = crime.slice(-6);

  try {
    const html = await fetchText(SOURCES.unemploymentAbs, 2 * 1024 * 1024);
    const match = html.match(/href="([^"]+6291001\.xlsx)"/i);
    if (match) {
      const xUrl = match[1].startsWith('http')
        ? match[1]
        : `https://www.abs.gov.au${match[1]}`;
      const xBuf = await fetchBuffer(xUrl);
      const xWb = XLSX.read(xBuf, { type: 'buffer' });
      const sheetName =
        xWb.SheetNames.find((n) => /unemployment|table 6/i.test(n)) ||
        xWb.SheetNames[0];
      const tRows = XLSX.utils.sheet_to_json(xWb.Sheets[sheetName], {
        header: 1,
        defval: '',
      });
      const unemp = [];
      for (let i = 0; i < tRows.length; i += 1) {
        const row = tRows[i];
        const label = trim(row[0]).toLowerCase();
        if (label.includes('new south wales') && !label.includes('youth')) {
          const yearMatch = trim(row[0]).match(/(\d{4})/);
          const val = num(row[row.length - 1]);
          if (yearMatch && val != null) {
            unemp.push({ year: yearMatch[1], 'New South Wales': val });
          }
        }
        if (label === 'australia' || label === 'australia ') {
          const val = num(row[row.length - 1]);
          if (val != null && unemp.length) {
            unemp[unemp.length - 1]['AU Average'] = val;
          }
        }
      }
      if (unemp.length) {
        out.unemployment_rate = unemp.slice(-6);
        out.unemployment_source = 'Australian Bureau of Statistics — Labour Force, Australia';
        out.unemployment_url = SOURCES.unemploymentAbs;
        out.unemployment_reporting_period =
          'Latest Labour Force release (Table 6 — unemployment rate by state)';
      }
    }
  } catch (_) {
    /* unemployment optional */
  }

  return out;
}

function streamAcncNswRows(onRow) {
  return new Promise((resolve, reject) => {
    https.get(SOURCES.taxCsv, { headers: { 'User-Agent': 'CivicVoice-SubnationalSync/1.0' } }, (res) => {
      if (res.statusCode !== 200) {
        res.resume();
        reject(new Error(`HTTP ${res.statusCode} ACNC CSV`));
        return;
      }
      let headers = null;
      const rl = readline.createInterface({ input: res, crlfDelay: Infinity });
      rl.on('line', (line) => {
        if (!headers) {
          headers = splitCsvLine(line);
          return;
        }
        const cols = splitCsvLine(line);
        const row = {};
        for (let i = 0; i < headers.length; i += 1) row[headers[i]] = cols[i] ?? '';
        if (trim(row.State).toUpperCase() === 'NSW') onRow(row);
      });
      rl.on('close', resolve);
      rl.on('error', reject);
    }).on('error', reject);
  });
}

async function buildTax() {
  const nsw = [];
  await streamAcncNswRows((row) => {
    if (nsw.length < 8000) nsw.push(row);
  });
  nsw.sort((a, b) => trim(a.Charity_Legal_Name).localeCompare(trim(b.Charity_Legal_Name)));
  const picked = nsw.slice(0, MAX_RECORDS);
  const records = picked.map((row) => {
    const ind = acncIndustry(row);
    const year = num((trim(row.Financial_Year_End) || '').slice(-4));
    return {
      name: trim(row.Charity_Legal_Name) || 'Registered charity',
      industry: ind.label,
      industryColor: ind.color,
      exemType: 'ACNC Registered Charity',
      city: trim(row.Town_City),
      fmtValue: 'Tax-Exempt',
      rawValue: 0,
      year: year || undefined,
      abn: trim(row.ABN),
    };
  });
  return {
    jurisdiction_id: JURISDICTION_ID,
    data_source: 'Australian Charities and Not-for-profits Commission — Registered Charities (data.gov.au)',
    source_url: SOURCES.tax,
    note: 'ACNC register CSV filtered to State=NSW',
    total_in_source: nsw.length,
    records_stored: records.length,
    records,
  };
}

async function buildGrants() {
  return null;
}

module.exports = {
  JURISDICTION_ID,
  SOURCES,
  buildEconomic,
  buildTax,
  buildGrants,
};
