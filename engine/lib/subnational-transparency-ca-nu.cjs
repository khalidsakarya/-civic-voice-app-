/**
 * CA-NU (Nunavut) — official economic sources.
 *
 * unemployment  → subnational_economic_social_stats/CA-NU
 * CRA Charities → subnational_tax_exempt_entities/CA-NU
 * NU Grants     → subnational_grants/CA-NU — NOT AVAILABLE (see buildGrants()).
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

const JURISDICTION_ID = 'CA-NU';

// Statistics Canada Table 14-10-0292-01 (territorial LFS) — Nunavut
// geography dimension = 3 (1=Yukon, 2=Northwest Territories, 3=Nunavut).
// Confirmed via getSeriesInfoFromCubePidCoord:
// "Nunavut;Unemployment rate;Total - Gender;15 years and over;Estimate;
// Seasonally adjusted". Table 14-10-0287-01 (the 10-province table) does
// not cover territories at all — see subnational-transparency-ca-yt.cjs
// for the full explanation, which applies identically here.
const STATCAN_NU_COORD = '3.8.1.1.1.1.0.0.0.0';

const SOURCES = {
  unemployment: 'https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=1410029201',
  // CRA Charities — same package as all provinces/territories, filtered to NU
  charities: 'https://open.canada.ca/data/en/dataset/51c68b86-33f0-46fe-9b51-0a786d0088f5',
  charitiesCkanPkg:
    'https://open.canada.ca/data/api/3/action/package_show?id=51c68b86-33f0-46fe-9b51-0a786d0088f5',
  // Nunavut has no open data portal — no current, comprehensive,
  // machine-readable whole-of-government grants/payments dataset was found.
  // See buildGrants() note.
  nuGov: 'https://www.gov.nu.ca',
  nuLegislativeAssembly: 'https://www.assembly.nu.ca',
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
      STATCAN_NU_COORD,
      STATCAN_CA_COORD,
      'Nunavut',
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
    if (prov !== 'NU' && prov !== 'NUNAVUT') continue;
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
      'NU registered charities only. Name, type, and category displayed (MVP). No dollar values in this version. OGL-Canada.',
    total_in_source: candidates.length,
    records_stored: records.length,
    records,
  };
}

// ─── Grants / Public Payments — NOT AVAILABLE ─────────────────────────────────

/**
 * Nunavut has no dedicated open data portal at all — confirmed via direct
 * DNS/HTTP checks (opendata.gov.nu.ca and data.gov.nu.ca do not resolve)
 * and via web search ("The Government of Nunavut doesn't provide an open
 * data portal per se."). This is the most complete "not found" case among
 * all Canadian jurisdictions processed so far — unlike Yukon, Northwest
 * Territories, or Newfoundland and Labrador, there isn't even a CKAN-style
 * portal to search.
 *
 * Checked and exhausted before concluding "not usable":
 *   1. gov.nu.ca (the territory's main government domain, and the task's
 *      candidate) — returns HTTP 403 on direct request (bot-protection),
 *      confirmed via curl. This includes subpaths such as
 *      /eia/information/nunavut-bureau-statistics, which redirect back
 *      into the same bot-blocked domain. Not scraped, per project rules
 *      against anti-bot-blocked sources.
 *   2. opendata.gov.nu.ca and data.gov.nu.ca — neither resolves (no such
 *      host). Nunavut has no open data portal.
 *   3. Federal open.canada.ca CKAN aggregator, organization "nu" — 0
 *      datasets. The only dataset titled "Nunavut" found via search is an
 *      unrelated Natural Resources Canada political boundary map, not a
 *      Government of Nunavut financial dataset.
 *   4. Nunavut's Public Accounts ARE published and reasonably current
 *      (e.g. "Public Accounts of the Government of Nunavut for the Year
 *      Ended March 31, 2024" was located, tabled at the Legislative
 *      Assembly) — but exclusively as PDF, hosted on gov.nu.ca (bot-
 *      blocked) and mirrored on assembly.nu.ca (accessible, but still
 *      PDF-only — no CSV/XLSX/open-data version exists). Per project
 *      rules, PDF extraction is not used, so even though this source is
 *      current, it cannot be used in this format.
 *   5. No dedicated, machine-readable Nunavut supplier/grant-payments
 *      disclosure dataset was found anywhere.
 *
 * Per project rules (no scraping of bot-blocked sources, no PDF
 * extraction, no estimated/generated data), this module does not
 * fabricate, approximate, or misrepresent a Nunavut grants/payments
 * dataset. buildGrants() throws a descriptive error so the dry-run
 * correctly reports BLOCKED / not-found rather than silently returning
 * empty, invented, or wrongly-sourced data.
 */
async function buildGrants() {
  throw new Error(
    'NU Grants: no current, machine-readable, whole-of-government Nunavut grants/payments/public-accounts source ' +
    'exists. Nunavut has no open data portal at all — opendata.gov.nu.ca and data.gov.nu.ca do not resolve, and ' +
    'gov.nu.ca (the main government domain) returns HTTP 403 to automated requests (bot-protected, not scraped). ' +
    'Nunavut is not mirrored on the federal open.canada.ca CKAN aggregator (0 datasets under organization "nu"; ' +
    'the sole dataset titled "Nunavut" there is an unrelated NRCan political map). Nunavut\'s Public Accounts are ' +
    'reasonably current but published exclusively as PDF (hosted on the bot-blocked gov.nu.ca and mirrored on ' +
    'assembly.nu.ca, still PDF-only) — PDF extraction was not authorized for this task. This is a genuine data-' +
    'availability/format gap, not a fetch failure — see module header comment for the full search performed.',
  );
}

module.exports = {
  JURISDICTION_ID,
  STATCAN_NU_COORD,
  SOURCES,
  buildEconomic,
  buildTax,
  buildGrants,
};
