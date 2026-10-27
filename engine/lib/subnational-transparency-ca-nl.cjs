/**
 * CA-NL (Newfoundland and Labrador) — official economic sources.
 *
 * unemployment  → subnational_economic_social_stats/CA-NL
 * CRA Charities → subnational_tax_exempt_entities/CA-NL
 * NL Grants     → subnational_grants/CA-NL — NOT AVAILABLE (see buildGrants()).
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

const JURISDICTION_ID = 'CA-NL';

// Statistics Canada Table 14-10-0287-01 — Newfoundland and Labrador geography dimension = 2
const STATCAN_NL_COORD = '2.7.1.1.1.1.0.0.0.0';

const SOURCES = {
  unemployment: 'https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=1410028701',
  // CRA Charities — same package as all provinces, filtered to NL
  charities: 'https://open.canada.ca/data/en/dataset/51c68b86-33f0-46fe-9b51-0a786d0088f5',
  charitiesCkanPkg:
    'https://open.canada.ca/data/api/3/action/package_show?id=51c68b86-33f0-46fe-9b51-0a786d0088f5',
  // NL's own open data portal (opendata.gov.nl.ca) — no current whole-of-government
  // grants/payments dataset was found there. See buildGrants() note.
  nlOpenDataPortal: 'https://opendata.gov.nl.ca',
  federalCkanOrgSearch: 'https://open.canada.ca/data/api/3/action/package_search?fq=organization:nl-tnl&rows=200',
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
      STATCAN_NL_COORD,
      STATCAN_CA_COORD,
      'Newfoundland and Labrador',
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

/**
 * SUPERSEDED (2026-10-26). The original builder read CRA package 51c68b86-… ("1998 List of charities"), kept the
 * first 100 rows in file order and stored rawValue 0 as a placeholder. It now delegates to the shared CRA 2024
 * module (engine/lib/cra-list-of-charities-2024.cjs), so no script that calls it can restore the obsolete data.
 */
async function buildTax(opts = {}) {
  // eslint-disable-next-line global-require
  return require('./cra-list-of-charities-2024.cjs').buildCharitiesDoc({ jurisdictionId: 'CA-NL', ...opts });
}

// ─── Grants / Public Payments — NOT AVAILABLE ─────────────────────────────────

/**
 * Newfoundland and Labrador operates its own bespoke (non-CKAN, non-Socrata)
 * open data portal at opendata.gov.nl.ca — mirrored into the federal
 * open.canada.ca CKAN aggregator under organization "nl-tnl" (76 datasets,
 * verified identical listing on both).
 *
 * Checked and exhausted before concluding "not usable":
 *   1. opendata.gov.nl.ca "Explore Open Data" / tabular datasets listing (71
 *      entries) and the mirrored federal CKAN organization "nl-tnl" (76
 *      entries, cross-checked) were both fully enumerated. Datasets matching
 *      financial/grant/payment keywords:
 *        - "Grant payments over $250,000 2014-2015" — Dept. of Finance. The
 *          ONLY dataset resembling a whole-of-government supplier/grant
 *          payments disclosure (comparable to AB's grant disclosure or NB's
 *          Combined Supplier and Grant Payments). Confirmed via its own
 *          metadata: temporal coverage "April 1, 2014 - March 31, 2015",
 *          released 2015-09-28, modified 2015-09-28 — never updated since,
 *          now well over a decade stale. Not a current/maintained dataset;
 *          publishing it as this province's live "Grants" data would
 *          misrepresent it as current when it is not.
 *        - "Municipal Operating Grant Allocations" — single fiscal year
 *          2013-2014 only, not updated since 2015-02-06. Narrow scope
 *          (municipal formula grants only), not whole-of-government.
 *        - "Value of Annual Operating Grants provided to CYFS' Community
 *          Partners" — single fiscal year 2014-15 only, 609-byte file,
 *          not updated since 2016-05-27. Single-department, narrow scope.
 *        - "Community Enhancement Employment Program Annual Project List and
 *          Funding Provided" — single period June 2014-April 2015 only, not
 *          updated since 2015-09-28. Single-program, narrow scope.
 *      All four are stale one-time snapshots (2013-2016), not a live,
 *      maintained, whole-of-government dataset comparable to what is used
 *      for ON/BC/AB/NB.
 *   2. Newfoundland and Labrador's own Public Accounts (the provincial
 *      equivalent of BC's/Alberta's/Ontario's/NB's detailed schedule of
 *      payments) are published by the Department of Finance only as PDF
 *      volumes — not CSV/XLSX/open data. Per project rules, PDF extraction
 *      is not used.
 *   3. No dedicated, currently-maintained NL supplier/grant-payments
 *      disclosure dataset was found anywhere on either portal.
 *
 * Per project rules (no estimated values, no scraping news/Wikipedia/PDF text
 * as a substitute for structured official data, no publishing stale data as
 * current), this module does not fabricate, approximate, or misrepresent a
 * Newfoundland and Labrador grants/payments dataset. buildGrants() throws a
 * descriptive error so the dry-run correctly reports BLOCKED / not-found
 * rather than silently returning empty, invented, or misleadingly-dated data.
 */
async function buildGrants() {
  throw new Error(
    'NL Grants: no current, machine-readable, whole-of-government Newfoundland and Labrador grants/payments/public-' +
    'accounts source exists. The province\'s open data portal (opendata.gov.nl.ca, 71 tabular datasets, mirrored on ' +
    'open.canada.ca under organization "nl-tnl", 76 datasets) contains only stale single-fiscal-year snapshots from ' +
    '2013-2016 (e.g. "Grant payments over $250,000 2014-2015", last modified 2015-09-28 — over a decade stale) — none ' +
    'are current or whole-of-government. NL\'s own Public Accounts are published as PDF only, not CSV/XLSX. This is a ' +
    'genuine data-availability/currency gap, not a fetch failure — see module header comment for the full search performed.',
  );
}

module.exports = {
  JURISDICTION_ID,
  STATCAN_NL_COORD,
  SOURCES,
  buildEconomic,
  buildTax,
  buildGrants,
};
