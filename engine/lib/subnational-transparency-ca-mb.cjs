/**
 * CA-MB (Manitoba) — official economic sources.
 *
 * unemployment  → subnational_economic_social_stats/CA-MB
 * CRA Charities → subnational_tax_exempt_entities/CA-MB
 * MB Grants     → subnational_grants/CA-MB — NOT AVAILABLE (see buildGrants()).
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

const JURISDICTION_ID = 'CA-MB';

// Statistics Canada Table 14-10-0287-01 — Manitoba geography dimension = 8
const STATCAN_MB_COORD = '8.7.1.1.1.1.0.0.0.0';

const SOURCES = {
  unemployment: 'https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=1410028701',
  // CRA Charities — same package as all provinces, filtered to MB
  charities: 'https://open.canada.ca/data/en/dataset/51c68b86-33f0-46fe-9b51-0a786d0088f5',
  charitiesCkanPkg:
    'https://open.canada.ca/data/api/3/action/package_show?id=51c68b86-33f0-46fe-9b51-0a786d0088f5',
  // No Manitoba grants/payments source was found — see buildGrants() note.
  federalCkanSearch: 'https://open.canada.ca/data/en/api/3/action/package_search',
  contractDisclosureSearchTool: 'https://web.gov.mb.ca/DisclosureOfContracts/',
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
      STATCAN_MB_COORD,
      STATCAN_CA_COORD,
      'Manitoba',
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
    if (prov !== 'MB' && prov !== 'MANITOBA') continue;
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
      'MB registered charities only. Name, type, and category displayed (MVP). No dollar values in this version. OGL-Canada.',
    total_in_source: candidates.length,
    records_stored: records.length,
    records,
  };
}

// ─── Grants / Public Payments — NOT AVAILABLE ─────────────────────────────────

/**
 * Manitoba has no CKAN-based open data portal comparable to BC
 * (data.gov.bc.ca), Alberta (open.alberta.ca), or Québec (donneesquebec.ca).
 * `opendata.gov.mb.ca` (the task's candidate URL) does not resolve.
 *
 * Checked and exhausted before concluding "not found":
 *   1. opendata.gov.mb.ca — DNS does not resolve (no such host).
 *   2. geoportal.gov.mb.ca ("Data MB") — Manitoba's actual open data platform;
 *      geospatial data only (maps, GIS layers) — no financial/payments datasets.
 *   3. Federal aggregator open.canada.ca, filtered to organization=mb — searched
 *      "grants payments", "public accounts", "transfer payments", "supplier
 *      payments", "contract disclosure", "government spending": 0 results for
 *      4 of 6 queries. "public accounts" returned only "Data MB" (HTML/geospatial,
 *      no CSV). "contract disclosure" returned two Public Sector Compensation
 *      Disclosure datasets (CSV) — these are salary/compensation data, a
 *      different category from grants/payments/transfer-payments to
 *      organizations, and were not used for that reason.
 *   4. Manitoba's own proactive disclosure page (gov.mb.ca/openmb/infomb) lists
 *      a "Contract Disclosure" category — contracts ≥$10,000/month — but it
 *      links to an interactive search-only web application
 *      (web.gov.mb.ca/DisclosureOfContracts/, ASP.NET MVC + Knockout.js/AJAX,
 *      typeahead search by vendor/department/subject) with no visible bulk CSV
 *      export or documented API. Extracting records would require scraping
 *      rendered search results or reverse-engineering an undocumented internal
 *      AJAX endpoint — both are screen-scraping in substance, not consumption
 *      of a published open-data source with clear reuse licence terms, so this
 *      was not used (consistent with "no scraped PDFs / no scraping" scope).
 *
 * Per project rules (no estimated values, no scraping as a substitute for
 * structured official data), this module does not fabricate or approximate a
 * Manitoba grants/payments dataset. buildGrants() throws a descriptive error so
 * the dry-run correctly reports NOT_FOUND rather than silently returning empty
 * or invented data.
 */
async function buildGrants() {
  throw new Error(
    'MB Grants: no official machine-readable Manitoba grants/payments/public-accounts source exists. ' +
    'Manitoba has no CKAN open data portal (opendata.gov.mb.ca does not resolve; geoportal.gov.mb.ca "Data MB" is ' +
    'geospatial only). The federal open.canada.ca aggregator has no financial datasets for organization=mb beyond ' +
    'public-sector compensation (salary) disclosure, a different category. Manitoba\'s own "Contract Disclosure" ' +
    'proactive-disclosure page links only to an interactive AJAX search tool (web.gov.mb.ca/DisclosureOfContracts/) ' +
    'with no bulk CSV/API export — extracting it would require scraping, which is out of scope. ' +
    'This is a genuine data-availability gap, not a fetch failure — see module header comment for the full search performed.',
  );
}

module.exports = {
  JURISDICTION_ID,
  STATCAN_MB_COORD,
  SOURCES,
  buildEconomic,
  buildTax,
  buildGrants,
};
