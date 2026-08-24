/**
 * CA-SK (Saskatchewan) — official economic sources.
 *
 * unemployment  → subnational_economic_social_stats/CA-SK
 * CRA Charities → subnational_tax_exempt_entities/CA-SK
 * SK Grants     → subnational_grants/CA-SK — NOT AVAILABLE (see buildGrants()).
 */

'use strict';

const {
  MAX_RECORDS,
  INDUSTRY_BADGE,
  trim,
  fetchText,
  fetchJson,
  parseCsv,
} = require('./subnational-transparency-shared.cjs');
const {
  statcanProvincialUnemployment,
  STATCAN_CA_COORD,
} = require('./subnational-unemployment-monthly.cjs');

const JURISDICTION_ID = 'CA-SK';

// Statistics Canada Table 14-10-0287-01 — Saskatchewan geography dimension = 9
const STATCAN_SK_COORD = '9.7.1.1.1.1.0.0.0.0';

const SOURCES = {
  unemployment: 'https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=1410028701',
  // CRA Charities — same package as all provinces, filtered to SK
  charities: 'https://open.canada.ca/data/en/dataset/51c68b86-33f0-46fe-9b51-0a786d0088f5',
  charitiesCkanPkg:
    'https://open.canada.ca/data/api/3/action/package_show?id=51c68b86-33f0-46fe-9b51-0a786d0088f5',
  // No Saskatchewan grants/payments source was found — see buildGrants() note.
  federalCkanSearch: 'https://open.canada.ca/data/en/api/3/action/package_search',
};

// ─── Economic (Statistics Canada LFS unemployment) ────────────────────────────

async function buildEconomic() {
  const out = {
    jurisdiction_id: JURISDICTION_ID,
    reporting_period: 'Monthly provincial unemployment (Statistics Canada LFS)',
  };
  const notes = [];

  try {
    const unemp = await statcanProvincialUnemployment(
      STATCAN_SK_COORD,
      STATCAN_CA_COORD,
      'Saskatchewan',
      'CA Average',
      24,
    );
    if (unemp) Object.assign(out, unemp);
  } catch (err) {
    notes.push(`unemployment: ${err.message}`);
  }

  out.data_status = { notes };
  return out;
}

// ─── Tax / Charities (CRA Charities Registry) ─────────────────────────────────

/** Map CRA category-of-activity text to existing INDUSTRY_BADGE keys. */
function industryFromCraCat(category) {
  const c = trim(category).toLowerCase();
  if (/educ/i.test(c)) return { label: 'Education', color: INDUSTRY_BADGE.Education };
  if (/health|santé|sante|medical/i.test(c)) return { label: 'Health', color: INDUSTRY_BADGE.Health };
  if (/relig/i.test(c)) return { label: 'Religion', color: INDUSTRY_BADGE.Religion };
  if (/environ/i.test(c)) return { label: 'Environment', color: INDUSTRY_BADGE.Environment };
  if (/art|cultur/i.test(c)) return { label: 'Arts/Culture', color: INDUSTRY_BADGE['Arts/Culture'] };
  if (/service|human|social|welfare|community/i.test(c))
    return { label: 'Human Services', color: INDUSTRY_BADGE['Human Services'] };
  return { label: 'Other', color: INDUSTRY_BADGE.Other };
}

async function buildTax() {
  const pkg = await fetchJson(SOURCES.charitiesCkanPkg);
  const resources = pkg?.result?.resources || [];
  const csvRes =
    resources.find((r) => /ident/i.test(trim(r.name)) && trim(r.format).toUpperCase() === 'CSV') ||
    resources.find((r) => /ident/i.test(trim(r.url).toLowerCase())) ||
    resources.find((r) => trim(r.format).toUpperCase() === 'CSV');
  if (!csvRes || !trim(csvRes.url)) {
    throw new Error(
      `CRA Charities: no CSV resource found. Resources: ${resources.map((r) => `${r.name || r.id} (${r.format})`).join(', ')}`,
    );
  }

  const csvUrl = trim(csvRes.url);
  const csvText = await fetchText(csvUrl, 50 * 1024 * 1024);
  const { headers, rows } = parseCsv(csvText);

  const provCol = headers.find((h) => /^province$/i.test(trim(h))) ||
    headers.find((h) => /province/i.test(h));
  const nameCol = headers.find((h) => /legal.name/i.test(trim(h))) ||
    headers.find((h) => /^name$/i.test(trim(h))) ||
    headers.find((h) => /name|nom/i.test(h) && !/province|contact|account/i.test(h));
  const catCol = headers.find((h) => /categ/i.test(h));
  const desigCol = headers.find((h) => /designat/i.test(h));

  if (!provCol || !nameCol) {
    throw new Error(
      `CRA Charities CSV: required columns not found. Headers: ${headers.slice(0, 20).join(', ')}`,
    );
  }

  const candidates = [];
  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    const prov = trim(row[provCol]).toUpperCase();
    if (prov !== 'SK' && prov !== 'SASKATCHEWAN') continue;
    candidates.push(row);
  }

  const CRA_DESIG = {
    A: 'Public Foundation',
    B: 'Private Foundation',
    C: 'Charitable Organization',
    PF: 'Private Foundation',
    PBF: 'Public Foundation',
    QD: 'Qualified Donee',
  };

  const picked = candidates.slice(0, MAX_RECORDS);
  const records = picked.map((row) => {
    const cat = catCol ? trim(row[catCol]) : '';
    const ind = industryFromCraCat(cat);
    const desigCode = desigCol ? trim(row[desigCol]).toUpperCase() : '';
    const desigLabel = CRA_DESIG[desigCode] || (desigCode ? `CRA Type: ${desigCode}` : 'Registered Charity');
    return {
      name: trim(row[nameCol]) || 'Registered charity',
      industry: ind.label,
      industryColor: ind.color,
      exemType: desigLabel,
      rawValue: 0,
    };
  });

  return {
    jurisdiction_id: JURISDICTION_ID,
    data_source:
      'Canada Revenue Agency — Charities Directorate. Source: open.canada.ca. Licensed under Open Government Licence — Canada.',
    source_url: SOURCES.charities,
    note:
      'SK registered charities only. Name, type, and category displayed (MVP). No dollar values in this version. OGL-Canada.',
    total_in_source: candidates.length,
    records_stored: records.length,
    records,
  };
}

// ─── Grants / Public Payments — NOT AVAILABLE ─────────────────────────────────

/**
 * Saskatchewan has no CKAN-based open data portal comparable to BC
 * (data.gov.bc.ca), Alberta (open.alberta.ca), or Québec (donneesquebec.ca).
 * `data.saskatchewan.ca` (the task's candidate URL) does not resolve — verified
 * by direct DNS lookup and confirmed by web search: Saskatchewan does not yet
 * operate an official open data portal.
 *
 * Checked and exhausted before concluding "not found":
 *   1. data.saskatchewan.ca — DNS does not resolve (no such host).
 *   2. Federal aggregator open.canada.ca, filtered to organization=sk (413
 *      datasets indexed) — searched for "grants payments", "public accounts",
 *      "transfer payments", "subventions", "supplier payments", "government
 *      spending": zero results for all six queries. The 413 SK-tagged datasets
 *      on the federal portal are geospatial/geological (oil & gas structure
 *      maps, environmental sites, wildlife data) — none are financial.
 *   3. Saskatchewan's own Public Accounts Volume 2 ("General Revenue Fund
 *      Details" — the provincial equivalent of BC's/Alberta's/Ontario's
 *      detailed-schedule-of-payments) is published only as PDF
 *      (e.g. saskatchewan.ca/-/media/news-release-backgrounders/2025/.../
 *      2024-25-public-accounts-volume-2.pdf) — not CSV/XLSX/open data.
 *   4. No dedicated Saskatchewan grant-disclosure dataset (comparable to
 *      Alberta's separate "Grant payments disclosure" CSV) was found anywhere.
 *
 * Per project rules (no estimated values, no scraping news/Wikipedia/PDF text
 * as a substitute for structured official data), this module does not fabricate
 * or approximate a Saskatchewan grants/payments dataset. buildGrants() throws a
 * descriptive error so the dry-run correctly reports BLOCKED / not-found rather
 * than silently returning empty or invented data.
 */
async function buildGrants() {
  throw new Error(
    'SK Grants: no official machine-readable Saskatchewan grants/payments/public-accounts source exists. ' +
    'Saskatchewan has no CKAN open data portal (data.saskatchewan.ca does not resolve). The federal open.canada.ca ' +
    'aggregator indexes 413 SK-tagged datasets but none are financial (all geospatial/geological). Saskatchewan\'s ' +
    'own Public Accounts Volume 2 (General Revenue Fund Details) is published as PDF only, not CSV/XLSX. ' +
    'This is a genuine data-availability gap, not a fetch failure — see module header comment for the full search performed.',
  );
}

module.exports = {
  JURISDICTION_ID,
  STATCAN_SK_COORD,
  SOURCES,
  buildEconomic,
  buildTax,
  buildGrants,
};
