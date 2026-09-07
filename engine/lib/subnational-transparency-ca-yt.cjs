/**
 * CA-YT (Yukon) — official economic sources.
 *
 * unemployment  → subnational_economic_social_stats/CA-YT
 * CRA Charities → subnational_tax_exempt_entities/CA-YT
 * YT Grants     → subnational_grants/CA-YT — NOT AVAILABLE (see buildGrants()).
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

const JURISDICTION_ID = 'CA-YT';

// Statistics Canada Table 14-10-0287-01 (seasonally adjusted monthly LFS) does
// NOT cover the territories — its geography dimension is Canada + the 10
// provinces only (confirmed via getCubeMetadata: geo members 1-11 = Canada,
// NL, PE, NS, NB, QC, ON, MB, SK, AB, BC — no YT/NT/NU). Yukon instead has its
// own dedicated table, 14-10-0292-01 ("Labour force characteristics by
// territory, three-month moving average, seasonally adjusted and
// unadjusted"), where Yukon is geography member 1.
const STATCAN_YT_COORD = '1.8.1.1.1.1.0.0.0.0'; // Table 14-10-0292-01, Yukon, Unemployment rate, Total-Gender, 15+, Estimate, Seasonally adjusted

const SOURCES = {
  unemployment: 'https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=1410029201',
  // CRA Charities — same package as all provinces, filtered to YT
  charities: 'https://open.canada.ca/data/en/dataset/51c68b86-33f0-46fe-9b51-0a786d0088f5',
  charitiesCkanPkg:
    'https://open.canada.ca/data/api/3/action/package_show?id=51c68b86-33f0-46fe-9b51-0a786d0088f5',
  // Yukon's official open data portal (CKAN) — no current, comprehensive,
  // machine-readable whole-of-government grants/payments dataset was found
  // there. See buildGrants() note.
  ytOpenDataPortal: 'https://open.yukon.ca',
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
      STATCAN_YT_COORD,
      STATCAN_CA_COORD,
      'Yukon',
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
    if (prov !== 'YT' && prov !== 'YUKON') continue;
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
      'YT registered charities only. Name, type, and category displayed (MVP). No dollar values in this version. OGL-Canada.',
    total_in_source: candidates.length,
    records_stored: records.length,
    records,
  };
}

// ─── Grants / Public Payments — NOT AVAILABLE ─────────────────────────────────

/**
 * Yukon's main government website (yukon.ca) returns HTTP 403 to automated
 * requests — confirmed via direct curl — consistent with the task's
 * instruction to reject anti-bot-blocked sources unless separately
 * authorized. Yukon's dedicated open data portal is a proper CKAN instance at
 * open.yukon.ca (ckan 2.12.0b0), which IS accessible and was thoroughly
 * searched.
 *
 * Checked and exhausted before concluding "not usable":
 *   1. yukon.ca (task's primary candidate domain) — returns HTTP 403 on
 *      direct request (bot-protection). Not used, per project rules against
 *      anti-bot-blocked sources.
 *   2. open.yukon.ca (CKAN, license "Open Government Licence - Yukon") —
 *      full-text catalog search across "grants" (647 results — almost all
 *      irrelevant ATIPP-request-log entries or narrow single-program grants
 *      like "Pioneer Utility Grant", "Spark Tourism Micro Grant", "Crown
 *      grants - 50k"), "payments" (28 results, none a payments disclosure),
 *      "supplier" (9 results — "Yukon Government Supplier Directory" is a
 *      self-reported, UNVERIFIED vendor directory of businesses who WANT to
 *      do business with the government, with no payment amounts — not a
 *      disclosure of actual payments made), "expenditure" (80 results, all
 *      budget/estimates documents), "public accounts" (81 results),
 *      "transfer payments" (4 results, none relevant), "disclosure" (36
 *      results, none a payments disclosure), "spending" (20 results, none
 *      relevant).
 *   3. Yukon DOES publish current Public Accounts on open.yukon.ca (fiscal
 *      years 2001-02 through 2024-25, current and regularly updated — e.g.
 *      the "2024–25 Public Accounts" package was last modified
 *      2025-11-05) — including "Schedule 8 – Schedule of legislated grants"
 *      and "Schedule 9 – Schedule of other government transfers", which
 *      would be exactly the payee-level grants/transfer-payments data
 *      needed. However, EVERY resource across the entire Finance
 *      organization on open.yukon.ca (170 datasets checked, including all
 *      Public Accounts volumes, all annual/supplementary budget estimates)
 *      is published as PDF ONLY — confirmed via a full organization-wide
 *      resource-format scan (100% PDF, zero CSV/XLSX/JSON resources found).
 *      Per project rules, PDF extraction is not used, so this otherwise
 *      ideal source cannot be used.
 *   4. Several narrow single-program "fund annual report" datasets were also
 *      found (Community Development Fund, Economic Development Fund, Media
 *      Development funding programs, Yukon Film & Sound Incentive Program) —
 *      all PDF-only and single-program in scope, not whole-of-government.
 *   5. No dedicated, currently-maintained, machine-readable (CSV/XLSX/JSON)
 *      Yukon supplier/grant-payments disclosure dataset was found anywhere.
 *
 * Per project rules (no scraping of bot-blocked sources, no PDF extraction,
 * no estimated/generated data, no publishing narrow-program data as a
 * whole-of-government dataset), this module does not fabricate, approximate,
 * or misrepresent a Yukon grants/payments dataset. buildGrants() throws a
 * descriptive error so the dry-run correctly reports BLOCKED / not-found
 * rather than silently returning empty, invented, or wrongly-sourced data.
 */
async function buildGrants() {
  throw new Error(
    'YT Grants: no current, machine-readable (CSV/XLSX/JSON), whole-of-government Yukon grants/payments/public-' +
    'accounts source exists. yukon.ca returns HTTP 403 to automated requests (bot-protection) and was not scraped. ' +
    "Yukon's CKAN open data portal (open.yukon.ca) was searched across 8 financial-related terms; the only " +
    'candidates found are either narrow single-program grants (Pioneer Utility Grant, Spark Tourism Micro Grant), an ' +
    'unverified self-reported vendor directory with no payment amounts, or the genuinely comprehensive and current ' +
    'Public Accounts (fiscal years 2001-02 through 2024-25, including "Schedule 8 - Schedule of legislated grants" ' +
    'and "Schedule 9 - Schedule of other government transfers") — but every one of the 170 Finance-organization ' +
    'datasets on open.yukon.ca is published as PDF only (confirmed via a full organization-wide format scan: 100% ' +
    'PDF, zero CSV/XLSX/JSON). PDF extraction was not authorized for this task. This is a genuine data-format gap, ' +
    'not a fetch failure — see module header comment for the full search performed.',
  );
}

module.exports = {
  JURISDICTION_ID,
  STATCAN_YT_COORD,
  SOURCES,
  buildEconomic,
  buildTax,
  buildGrants,
};
