/**
 * CA-PE (Prince Edward Island) — official economic sources.
 *
 * unemployment  → subnational_economic_social_stats/CA-PE
 * CRA Charities → subnational_tax_exempt_entities/CA-PE
 * PE Grants     → subnational_grants/CA-PE — NOT AVAILABLE (see buildGrants()).
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

const JURISDICTION_ID = 'CA-PE';

// Statistics Canada Table 14-10-0287-01 — Prince Edward Island geography dimension = 3
const STATCAN_PE_COORD = '3.7.1.1.1.1.0.0.0.0';

const SOURCES = {
  unemployment: 'https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=1410028701',
  // CRA Charities — same package as all provinces, filtered to PE
  charities: 'https://open.canada.ca/data/en/dataset/51c68b86-33f0-46fe-9b51-0a786d0088f5',
  charitiesCkanPkg:
    'https://open.canada.ca/data/api/3/action/package_show?id=51c68b86-33f0-46fe-9b51-0a786d0088f5',
  // PEI's own open data portal (ArcGIS Hub, data.princeedwardisland.ca) — no
  // current whole-of-government, payee-level grants/payments dataset was
  // found there. See buildGrants() note.
  peOpenDataPortal: 'https://data.princeedwardisland.ca',
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
      STATCAN_PE_COORD,
      STATCAN_CA_COORD,
      'Prince Edward Island',
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
    if (prov !== 'PE' && prov !== 'PRINCE EDWARD ISLAND' && prov !== 'PEI') continue;
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
      'PE registered charities only. Name, type, and category displayed (MVP). No dollar values in this version. OGL-Canada.',
    total_in_source: candidates.length,
    records_stored: records.length,
    records,
  };
}

// ─── Grants / Public Payments — NOT AVAILABLE ─────────────────────────────────

/**
 * Prince Edward Island's official open data portal is an ArcGIS Hub site at
 * data.princeedwardisland.ca (owner org "pei_enterprise_admin" on
 * arcgis.com). Unlike New Brunswick/Nova Scotia (Socrata) it is not mirrored
 * on the federal open.canada.ca CKAN aggregator (confirmed: 0 datasets under
 * organization "pe" or "pei").
 *
 * Checked and exhausted before concluding "not usable":
 *   1. ArcGIS content search across owner "pei_enterprise_admin" for
 *      "grants", "payments", "supplier", "expenditure", "disclosure",
 *      "transfer payment", "public accounts", "vendor", "spending". Only
 *      financial/grant-adjacent hits:
 *        - "OD0031 PEI Consolidated Expenses" — CATEGORY-LEVEL, not payee-
 *          level: fields are Area_of_Expenditure / Financial_Year / Value
 *          (department totals only, no recipient names). Data spans
 *          2011/12–2018/19 — stale, 7+ years out of date, never updated
 *          since 2024-03-22's one-time catalog sync.
 *        - "OD0047 Expenditure Budget Estimates And Forecasts" —
 *          department/category-level budget ESTIMATES (not actuals), for
 *          fiscal years up to 2018-2019 only. No recipient names.
 *        - "OD0011 Student Loan Grant Assessments And Awards" — aggregate
 *          counts only (Financial_Year, Program_Title, Amount_in_Dollars,
 *          Number_of_Recipients) — no individual recipient names. Single
 *          narrow program (student loans), not whole-of-government.
 *        - "OD0060 Seniors Home Repair Program Activity" — aggregate
 *          program statistics (client counts, average/total expenditure by
 *          region) — no individual recipient names. Single narrow program.
 *      None of these four datasets contain named-recipient grant or
 *      supplier payment records comparable to what is used for
 *      ON/BC/AB/NB (recipientName + amount). All are either aggregate
 *      category/department totals or narrow single-program statistics.
 *   2. Federal open.canada.ca CKAN aggregator: 0 datasets indexed under
 *      organization "pe" or "pei" — PEI's open data is not mirrored there
 *      (unlike Newfoundland and Labrador and New Brunswick).
 *   3. PEI's own Public Accounts (Volume I, Volume III) are published by
 *      the Department of Finance only as PDF — no CSV/XLSX/open-data
 *      version found. Per project rules, PDF extraction is not used.
 *   4. No dedicated, currently-maintained, payee-level PEI supplier/grant-
 *      payments disclosure dataset was found anywhere.
 *
 * Per project rules (no estimated values, no scraping news/Wikipedia/PDF
 * text as a substitute for structured official data, no publishing
 * aggregate/stale data as if it were a current payee-level dataset), this
 * module does not fabricate, approximate, or misrepresent a Prince Edward
 * Island grants/payments dataset. buildGrants() throws a descriptive error
 * so the dry-run correctly reports BLOCKED / not-found rather than silently
 * returning empty, invented, or wrongly-shaped data.
 */
async function buildGrants() {
  throw new Error(
    'PE Grants: no current, machine-readable, whole-of-government, payee-level Prince Edward Island grants/payments/' +
    'public-accounts source exists. The province\'s ArcGIS Hub open data portal (data.princeedwardisland.ca) was ' +
    'searched across "grants", "payments", "supplier", "expenditure", "disclosure", "transfer payment", "public ' +
    'accounts", "vendor", and "spending" — the only financial-adjacent datasets found are either aggregate category/' +
    'department-level totals with no recipient names (e.g. "PEI Consolidated Expenses", stale to 2018/19) or narrow ' +
    'single-program statistics with no recipient names (Student Loan Grant Assessments, Seniors Home Repair Program). ' +
    'PEI is not mirrored on the federal open.canada.ca CKAN aggregator (0 datasets). PEI Public Accounts are PDF only. ' +
    'This is a genuine data-availability/granularity gap, not a fetch failure — see module header comment for the ' +
    'full search performed.',
  );
}

module.exports = {
  JURISDICTION_ID,
  STATCAN_PE_COORD,
  SOURCES,
  buildEconomic,
  buildTax,
  buildGrants,
};
