/**
 * UK-ENG-LON (Greater London / GLA) — official sources only.
 */

const {
  MAX_RECORDS,
  trim,
  num,
  fetchText,
  parseCsv,
  fmtCompact,
  parseMoneyish,
} = require('./subnational-transparency-shared.cjs');

const JURISDICTION_ID = 'UK-ENG-LON';

const SOURCES = {
  crimeApi: 'https://data.police.uk/api/',
  crimePage: 'https://data.police.uk/',
  grants:
    'https://london.gov.uk/who-we-are/governance-and-spending/spending-money-wisely/our-spending',
  grantsCsv: 'https://london.gov.uk/media/109386/download?attachment',
  charityZip:
    'https://register-of-charities.charitycommission.gov.uk/documents/35103/416710/RegPlusExtract_September_2020.zip/677e3df7-f511-c9af-1adf-884452b99f26',
  charityPage:
    'https://register-of-charities.charitycommission.gov.uk/register/full-register-download',
};

const VIOLENT_CATS = new Set([
  'violent-crime',
  'violence-and-sexual-offences',
  'robbery',
  'possession-of-weapons',
  'public-order',
]);

const PROPERTY_CATS = new Set([
  'burglary',
  'theft-from-the-person',
  'shoplifting',
  'vehicle-crime',
  'criminal-damage-arson',
  'other-theft',
]);

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchJson(url) {
  const res = await globalThis.fetch(url, {
    headers: { 'User-Agent': 'CivicVoice-SubnationalSync/1.0' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

async function buildEconomic() {
  const out = {
    jurisdiction_id: JURISDICTION_ID,
    crime_source: 'data.police.uk — street-level crime (Greater London area sample)',
    crime_url: SOURCES.crimePage,
    crime_reporting_period: 'December snapshot by year (2019–2024)',
    reporting_period:
      'Crime: data.police.uk street crimes (central London coordinates), December snapshots by year',
  };

  const lat = 51.5074;
  const lng = -0.1278;
  const years = ['2019-12', '2020-12', '2021-12', '2022-12', '2023-12', '2024-12'];
  const crime = [];
  for (let i = 0; i < years.length; i += 1) {
    const date = years[i];
    const url = `${SOURCES.crimeApi}crimes-street/all-crime?lat=${lat}&lng=${lng}&date=${date}`;
    try {
      await sleep(350);
      const data = await fetchJson(url);
      let violent = 0;
      let property = 0;
      for (let j = 0; j < data.length; j += 1) {
        const cat = trim(data[j].category);
        if (VIOLENT_CATS.has(cat)) violent += 1;
        else if (PROPERTY_CATS.has(cat)) property += 1;
      }
      crime.push({
        year: date.slice(0, 4),
        'Violent Crime': violent,
        'Property Crime': property,
      });
    } catch (_) {
      /* skip month */
    }
  }
  if (crime.length) out.crime_rate = crime;
  return out;
}

async function buildTax() {
  return null;
}

async function buildGrants() {
  const text = await fetchText(SOURCES.grantsCsv, 15 * 1024 * 1024);
  const lines = text.split(/\r?\n/);
  const rows = [];
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line.includes('GRANTS TO EXTERNAL')) continue;
    const cols = line.split(',');
    if (cols.length < 8) continue;
    const vendor = trim(cols[3]);
    const desc = trim(cols[5]);
    const amt = parseMoneyish(cols[7]);
    const directorate = trim(cols[9]);
    if (!vendor || amt <= 0) continue;
    rows.push({ vendor, desc, amt, directorate, period: trim(cols[0]) });
  }
  rows.sort((a, b) => b.amt - a.amt);
  const top = rows.slice(0, MAX_RECORDS);
  const records = top.map((row) => ({
    recipientName: row.vendor,
    typeLabel: 'Organization',
    typeColor: 'bg-green-100 text-green-700',
    purpose: row.desc || 'GLA grant / external payment',
    dept: row.directorate || 'Greater London Authority',
    fmtAmount: fmtCompact(row.amt),
    rawAmount: row.amt,
    date: '2024-25',
  }));
  const totalRaw = top.reduce((s, r) => s + r.amt, 0);
  return {
    jurisdiction_id: JURISDICTION_ID,
    fiscal_year: '2024-25',
    reporting_period: 'GLA expenditure over £250 — consolidated P1–P13 (2024/25)',
    data_source:
      'Greater London Authority — Expenditure over £250 (grants to external organisations)',
    source_url: SOURCES.grants,
    note: 'Filtered to expenditure account "GRANTS TO EXTERNAL ORGANISATIONS"',
    total_in_source: rows.length,
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
