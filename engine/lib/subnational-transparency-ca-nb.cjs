/**
 * CA-NB (New Brunswick) — official economic sources.
 *
 * unemployment  → subnational_economic_social_stats/CA-NB
 * CRA Charities → subnational_tax_exempt_entities/CA-NB
 * NB Payments   → subnational_grants/CA-NB
 */

'use strict';

const {
  MAX_RECORDS,
  INDUSTRY_BADGE,
  trim,
  fmtCompact,
  parseMoneyish,
  fetchText,
  fetchJson,
  parseCsv,
} = require('./subnational-transparency-shared.cjs');
const {
  statcanProvincialUnemployment,
  STATCAN_CA_COORD,
} = require('./subnational-unemployment-monthly.cjs');

const JURISDICTION_ID = 'CA-NB';

// Statistics Canada Table 14-10-0287-01 — New Brunswick geography dimension = 5
const STATCAN_NB_COORD = '5.7.1.1.1.1.0.0.0.0';

// New Brunswick's official open data portal is Socrata-hosted at
// gnb.socrata.com — NOT data.gnb.ca (that candidate domain does not resolve).
const NB_SOCRATA_DOMAIN = 'gnb.socrata.com';
const NB_SOCRATA_CATALOG = 'https://api.us.socrata.com/api/catalog/v1';

const SOURCES = {
  unemployment: 'https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=1410028701',
  // CRA Charities — same package as all provinces, filtered to NB
  charities: 'https://open.canada.ca/data/en/dataset/51c68b86-33f0-46fe-9b51-0a786d0088f5',
  charitiesCkanPkg:
    'https://open.canada.ca/data/api/3/action/package_show?id=51c68b86-33f0-46fe-9b51-0a786d0088f5',
  // NB Combined Supplier and Grant Payments — discovered dynamically
  nbCkanSearch: NB_SOCRATA_CATALOG,
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
      STATCAN_NB_COORD,
      STATCAN_CA_COORD,
      'New Brunswick',
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
    if (prov !== 'NB' && prov !== 'NEW BRUNSWICK') continue;
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
      'NB registered charities only. Name, type, and category displayed (MVP). No dollar values in this version. OGL-Canada.',
    total_in_source: candidates.length,
    records_stored: records.length,
    records,
  };
}

// ─── Public Payments (NB Combined Supplier and Grant Payments) ───────────────

/**
 * Returns true if the resource URL and format indicate an actual CSV file.
 */
function isActualCsvResource(r) {
  const url = trim(r.url).toLowerCase();
  const fmt = trim(r.format).toUpperCase();
  if (/\.(xlsx?|zip|pdf|ods|json|xml|kml|geojson|tif|tiff|shp|gdb)$/i.test(url)) return false;
  return url.endsWith('.csv') || fmt === 'CSV' || fmt === 'TEXT/CSV';
}

/**
 * Discover New Brunswick's "Combined Supplier and Grant Payments" dataset —
 * the most recent fiscal year available — from the province's Socrata portal
 * (gnb.socrata.com). Prefers the "Combined" (single flat file, all
 * departments) variant over the "by Department" variant (split across many
 * department-scoped resources) for simpler top-N-by-amount selection.
 */
async function discoverNbPaymentsSource() {
  const searchUrl =
    `${NB_SOCRATA_CATALOG}?domains=${NB_SOCRATA_DOMAIN}&q=${encodeURIComponent('Combined Supplier and Grant Payments')}&limit=20`;
  let searchRes;
  try {
    searchRes = await fetchJson(searchUrl);
  } catch (err) {
    throw new Error(`NB Payments: catalog search failed: ${err.message}`);
  }

  const results = searchRes?.results || [];
  const allFound = results.map((r) => ({
    name: r.resource.name,
    id: r.resource.id,
    updatedAt: r.resource.updatedAt,
  }));

  // Only "Combined" datasets (resource names are like "2025 - Combined Supplier
  // and Grant Payments / ..."), sorted newest-first by updatedAt, to pick the
  // most recent fiscal year automatically without hardcoding a year. Excludes
  // the "by Department" variant (split across many department-scoped
  // resources) — the Combined variant is a single flat file, simpler to use.
  const combined = results
    .filter((r) => /combined supplier and grant payments/i.test(trim(r.resource.name)))
    .sort((a, b) => new Date(b.resource.updatedAt) - new Date(a.resource.updatedAt));

  if (!combined.length) {
    throw new Error(
      `NB Payments: no "Combined Supplier and Grant Payments" dataset found on ${NB_SOCRATA_DOMAIN}. ` +
      `Found ${allFound.length} related results: ${allFound.slice(0, 8).map((f) => `"${f.name}" (${f.id})`).join('; ')}`,
    );
  }

  const best = combined[0];
  const resourceId = best.resource.id;
  const yearMatch = best.resource.name.match(/^\d{4}/);

  return {
    resourceId,
    resourceName: best.resource.name,
    fiscalYear: yearMatch ? yearMatch[0] : 'latest',
    updatedAt: best.resource.updatedAt,
    datasetPageUrl: `https://${NB_SOCRATA_DOMAIN}/d/${resourceId}`,
    sodaCsvUrl: `https://${NB_SOCRATA_DOMAIN}/resource/${resourceId}.csv`,
    sodaJsonUrl: `https://${NB_SOCRATA_DOMAIN}/resource/${resourceId}.json`,
    allFound,
  };
}

async function buildGrants() {
  const discovered = await discoverNbPaymentsSource();

  // Confirm licence/description via the Socrata views metadata API.
  let licence = 'New Brunswick Open Government Licence';
  let description = '';
  try {
    const meta = await fetchJson(`https://${NB_SOCRATA_DOMAIN}/api/views/${discovered.resourceId}.json`);
    licence = meta?.license?.name || licence;
    description = trim(meta?.description || '');
  } catch (err) {
    // Non-fatal — proceed with default licence label; note in warnings below.
  }

  // Fetch the full dataset. Socrata SODA API defaults to a row limit, so
  // request a generous explicit $limit (NB's dataset is a few thousand rows).
  const csvText = await fetchText(`${discovered.sodaCsvUrl}?$limit=50000`, 20 * 1024 * 1024);
  const { headers, rows } = parseCsv(csvText);

  const supplierCol = headers.find((h) => /supplier.name/i.test(trim(h))) || headers[0];
  const amountCol = headers.find((h) => /^payment/i.test(trim(h))) || headers[1];
  const typeCol = headers.find((h) => /payment.type/i.test(trim(h))) || headers[2];

  if (!supplierCol || !amountCol) {
    throw new Error(
      `NB Payments CSV: expected columns not found. Headers: ${headers.join(', ')}. Source: ${discovered.sodaCsvUrl}`,
    );
  }

  const totalRows = rows.length;
  const withSupplier = rows.filter((r) => trim(r[supplierCol]));
  const blankSupplierCount = totalRows - withSupplier.length;

  withSupplier.sort((a, b) => parseMoneyish(b[amountCol] || '0') - parseMoneyish(a[amountCol] || '0'));

  const top = withSupplier.slice(0, MAX_RECORDS);
  let totalRaw = 0;
  const paymentTypeCounts = {};
  const records = top.map((row) => {
    const amt = parseMoneyish(row[amountCol] || '');
    totalRaw += amt;
    const typeRaw = typeCol ? trim(row[typeCol]) : '';
    if (typeRaw) paymentTypeCounts[typeRaw] = (paymentTypeCounts[typeRaw] || 0) + 1;
    return {
      recipientName: trim(row[supplierCol]) || 'Recipient',
      typeLabel: /grant/i.test(typeRaw) ? 'Grant' : 'Payment',
      typeColor: 'bg-green-100 text-green-700',
      purpose: typeRaw || 'Payments & Grants',
      dept: 'Government of New Brunswick',
      fmtAmount: fmtCompact(amt),
      rawAmount: amt,
      date: discovered.fiscalYear,
    };
  });

  const warnings = [];
  if (blankSupplierCount > 0) {
    warnings.push(`${blankSupplierCount} row(s) had no supplier/recipient name and were excluded.`);
  }
  if (!description) {
    warnings.push('Could not confirm dataset description/licence via Socrata views metadata API — using default licence label.');
  }

  return {
    jurisdiction_id: JURISDICTION_ID,
    fiscal_year: discovered.fiscalYear,
    reporting_period: `NB ${discovered.resourceName} — fiscal year ${discovered.fiscalYear}`,
    data_source: `Government of New Brunswick — ${discovered.resourceName}. ${licence}.`,
    source_url: discovered.datasetPageUrl,
    resource_url: discovered.sodaCsvUrl,
    discovery_note: `Discovered via Socrata catalog search on ${NB_SOCRATA_DOMAIN}, filtered to "Combined Supplier and Grant Payments" datasets, sorted by most recently updated to select the current fiscal year automatically (${discovered.updatedAt}).`,
    licence,
    note: `Top ${MAX_RECORDS} New Brunswick supplier and grant payments by amount, fiscal year ${discovered.fiscalYear}. ` +
      'Includes both grants/contributions and general supplier payments for goods and services (threshold: total ' +
      'payments exceeding $25,000/year per recipient) — broader than grants alone, so labelled "Public Payments" ' +
      'rather than "Grants". Purchase card spending is also included where it exceeds the threshold.',
    total_rows_in_source: totalRows,
    blank_recipient_rows_excluded: blankSupplierCount,
    total_after_filter: withSupplier.length,
    records_stored: records.length,
    total_raw_top100: totalRaw,
    fmt_total_top100: fmtCompact(totalRaw),
    payment_type_breakdown_in_top: paymentTypeCounts,
    detected_columns: {
      recipient: supplierCol || null,
      amount: amountCol || null,
      payment_type: typeCol || null,
    },
    all_headers: headers.slice(0, 30),
    raw_first_rows: rows.slice(0, 5).map((r) => Object.fromEntries(
      headers.map((h) => [h, trim(r[h])]),
    )),
    warnings,
    records,
  };
}

module.exports = {
  JURISDICTION_ID,
  STATCAN_NB_COORD,
  SOURCES,
  buildEconomic,
  buildTax,
  buildGrants,
  discoverNbPaymentsSource,
};
