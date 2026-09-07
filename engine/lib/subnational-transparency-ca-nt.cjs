/**
 * CA-NT (Northwest Territories) — official economic sources.
 *
 * unemployment  → subnational_economic_social_stats/CA-NT
 * CRA Charities → subnational_tax_exempt_entities/CA-NT
 * NT Grants     → subnational_grants/CA-NT — NOT AVAILABLE (see buildGrants()).
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
  statcanTerritorialUnemployment,
  STATCAN_CA_COORD,
} = require('./subnational-unemployment-monthly.cjs');

const JURISDICTION_ID = 'CA-NT';

// Statistics Canada Table 14-10-0292-01 (territorial LFS) — Northwest
// Territories geography dimension = 2 (1=Yukon, 2=Northwest Territories,
// 3=Nunavut). Confirmed via getSeriesInfoFromCubePidCoord:
// "Northwest Territories;Unemployment rate;Total - Gender;15 years and
// over;Estimate;Seasonally adjusted". Table 14-10-0287-01 (the 10-province
// table) does not cover territories at all — see subnational-transparency-
// ca-yt.cjs for the full explanation, which applies identically here.
const STATCAN_NT_COORD = '2.8.1.1.1.1.0.0.0.0';

const SOURCES = {
  unemployment: 'https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=1410029201',
  // CRA Charities — same package as all provinces/territories, filtered to NT
  charities: 'https://open.canada.ca/data/en/dataset/51c68b86-33f0-46fe-9b51-0a786d0088f5',
  charitiesCkanPkg:
    'https://open.canada.ca/data/api/3/action/package_show?id=51c68b86-33f0-46fe-9b51-0a786d0088f5',
  // NWT's official open data portal (CKAN) — no current, comprehensive,
  // machine-readable whole-of-government grants/payments dataset was found
  // there. See buildGrants() note.
  ntOpenDataPortal: 'https://opendata.gov.nt.ca',
  ntFinancePublicAccounts: 'https://www.fin.gov.nt.ca/en/public-accounts',
  ntSoleSourceContracts: 'https://www.fin.gov.nt.ca/en/gnwt-sole-source-contracts-report',
};

// ─── Economic (Statistics Canada LFS unemployment — territorial table) ───────

async function buildEconomic() {
  const out = {
    jurisdiction_id: JURISDICTION_ID,
    reporting_period: 'Monthly territorial unemployment (Statistics Canada LFS, 3-month moving average)',
  };
  const notes = [];

  try {
    const unemp = await statcanTerritorialUnemployment(
      STATCAN_NT_COORD,
      STATCAN_CA_COORD,
      'Northwest Territories',
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
    if (prov !== 'NT' && prov !== 'NORTHWEST TERRITORIES' && prov !== 'NWT') continue;
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
      'NT registered charities only. Name, type, and category displayed (MVP). No dollar values in this version. OGL-Canada.',
    total_in_source: candidates.length,
    records_stored: records.length,
    records,
  };
}

// ─── Grants / Public Payments — NOT AVAILABLE ─────────────────────────────────

/**
 * The Northwest Territories runs a proper CKAN open data portal at
 * opendata.gov.nt.ca (ckan 2.9.8, Open Government Licence). It is
 * accessible and was thoroughly searched.
 *
 * Checked and exhausted before concluding "not usable":
 *   1. opendata.gov.nt.ca — full-text catalog search across "grants" (0
 *      results), "payments" (1 result — see below), "supplier" (0),
 *      "expenditure" (13 — all household expenditure SURVEYS or capital
 *      expenditure INTENTIONS economic indicators, not government
 *      payments), "public accounts" (0), "transfer payments" (0),
 *      "spending" (8 — same household expenditure surveys), "disclosure"
 *      (0), "vendor" (0).
 *   2. The sole "payments" hit, "Moose Jaw Payments for North Slave
 *      Region" (Dept. of Environment and Climate Change), is a wildlife-
 *      harvest remuneration program ("to help determine the sex, age
 *      structure and location of moose harvested") — not a government
 *      financial disclosure of any kind. Rejected: wrong subject entirely.
 *   3. Federal open.canada.ca CKAN aggregator: 0 datasets under
 *      organization "nt" or "nwt" — NWT's open data is not mirrored there
 *      (unlike Newfoundland and Labrador).
 *   4. NWT Department of Finance "GNWT Sole Source Contracts Report"
 *      (fin.gov.nt.ca) — the only NWT government financial-disclosure-
 *      shaped dataset found with a structured (non-PDF) resource. However:
 *      (a) STALE — the most recent reporting period publicly listed is
 *      April 1, 2017 - March 31, 2018, i.e. roughly 8 years out of date,
 *      with no newer report published since; and (b) NARROW even if it
 *      were current — sole-source (non-competitive) contract awards only,
 *      excluding competitively-tendered contracts, grants, and regular
 *      transfer payments. Rejected on both currency and scope grounds.
 *   5. NWT Public Accounts (fin.gov.nt.ca/en/public-accounts) — almost
 *      entirely PDF (Sections I-IV by fiscal year). One structured
 *      resource was found, "Public Accounts 2022-2023 - Tables"
 *      (.xlsx) — but fiscal year 2022-2023 is the MOST RECENT Public
 *      Accounts data published at all (no 2023-24 or 2024-25 found),
 *      making it roughly 3 fiscal years stale as of this dry-run, and it
 *      is department/category-level summary tables rather than payee-
 *      level grants/payments data. Rejected: stale AND (even if current)
 *      wrong granularity.
 *
 * Per project rules (no estimated values, no scraping, no PDF extraction,
 * no publishing stale or narrow-scope data as if it were a current
 * whole-of-government dataset), this module does not fabricate,
 * approximate, or misrepresent a Northwest Territories grants/payments
 * dataset. buildGrants() throws a descriptive error so the dry-run
 * correctly reports BLOCKED / not-found rather than silently returning
 * empty, invented, or wrongly-sourced data.
 */
async function buildGrants() {
  throw new Error(
    'NT Grants: no current, machine-readable, whole-of-government, payee-level Northwest Territories grants/' +
    'payments/public-accounts source exists. The territory\'s CKAN open data portal (opendata.gov.nt.ca) was ' +
    'searched across 9 financial-related terms; the only "payments" hit is an unrelated wildlife-harvest ' +
    'remuneration program (Moose Jaw Payments for North Slave Region). The GNWT Sole Source Contracts Report ' +
    '(fin.gov.nt.ca) is the closest candidate but is stale (last published for FY2017-2018, ~8 years out of date) ' +
    'and narrow in scope (sole-source contracts only). NWT Public Accounts are almost entirely PDF; the one ' +
    'structured (.xlsx) resource found, "Public Accounts 2022-2023 - Tables", is itself the most recent Public ' +
    'Accounts data published (no FY2023-24/2024-25 found) — roughly 3 fiscal years stale — and is department-level ' +
    'summary tables, not payee-level data. NWT is not mirrored on the federal open.canada.ca CKAN aggregator. This ' +
    'is a genuine data-availability/currency/granularity gap, not a fetch failure — see module header comment for ' +
    'the full search performed.',
  );
}

module.exports = {
  JURISDICTION_ID,
  STATCAN_NT_COORD,
  SOURCES,
  buildEconomic,
  buildTax,
  buildGrants,
};
