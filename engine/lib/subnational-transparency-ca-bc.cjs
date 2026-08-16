/**
 * CA-BC (British Columbia) — official economic sources.
 *
 * unemployment  → subnational_economic_social_stats/CA-BC
 * CRA Charities → subnational_tax_exempt_entities/CA-BC
 * BC Grants     → subnational_grants/CA-BC
 */

'use strict';

const {
  MAX_RECORDS,
  INDUSTRY_BADGE,
  trim,
  num,
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

const JURISDICTION_ID = 'CA-BC';

// Statistics Canada Table 14-10-0287-01 — BC geography dimension = 11
const STATCAN_BC_COORD = '11.7.1.1.1.1.0.0.0.0';

// BC Data Catalogue CKAN base URL
const BC_CKAN_BASE = 'https://catalogue.data.gov.bc.ca/api/3/action';

const SOURCES = {
  unemployment: 'https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=1410028701',
  // CRA Charities — same package as all provinces, filtered to BC
  charities: 'https://open.canada.ca/data/en/dataset/51c68b86-33f0-46fe-9b51-0a786d0088f5',
  charitiesCkanPkg:
    'https://open.canada.ca/data/api/3/action/package_show?id=51c68b86-33f0-46fe-9b51-0a786d0088f5',
  // BC Grants — discovered dynamically from BC Data Catalogue CKAN
  bcCkanSearch: `${BC_CKAN_BASE}/package_search`,
  bcCkanBase: BC_CKAN_BASE,
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
      STATCAN_BC_COORD,
      STATCAN_CA_COORD,
      'British Columbia',
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

// ��── Tax / Charities (CRA Charities Registry) ─────────��───────────────────────

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
    if (prov !== 'BC' && prov !== 'BRITISH COLUMBIA') continue;
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
      'BC registered charities only. Name, type, and category displayed (MVP). No dollar values in this version. OGL-Canada.',
    total_in_source: candidates.length,
    records_stored: records.length,
    records,
  };
}

// ─── Grants (BC Data Catalogue — grants / public accounts) ───────────────────

/**
 * Returns true if the resource URL and format indicate an actual CSV file.
 * Some BC Data Catalogue entries have format=CSV but URL pointing to an XLSX/ZIP.
 */
function isActualCsvResource(r) {
  const url = trim(r.url).toLowerCase();
  const fmt = trim(r.format).toUpperCase();
  // Reject binary formats by URL extension
  if (/\.(xlsx?|zip|pdf|ods|json|xml|kml|geojson|tif|tiff|shp|gdb)$/i.test(url)) return false;
  // Accept if URL ends in .csv or format claims CSV
  return url.endsWith('.csv') || fmt === 'CSV' || fmt === 'TEXT/CSV';
}

/**
 * Discover the best BC grants/payments dataset from the BC Data Catalogue CKAN API.
 * Tries multiple search queries in priority order; skips XLSX/ZIP resources.
 * Returns { pkg, resourceUrl, packageTitle, packageId, licence, note } or throws.
 */
async function discoverBcGrantsSource() {
  // Priority order: try specific grant/payment dataset searches first
  const searches = [
    { q: 'grants organizations british columbia ministry', label: 'grants organizations' },
    { q: 'bc grants financial assistance organizations', label: 'bc grants financial' },
    { q: 'payments suppliers government british columbia', label: 'payments suppliers' },
    { q: 'public accounts british columbia schedule payments', label: 'public accounts schedule' },
    { q: 'government grants contributions payments bc', label: 'grants contributions' },
  ];

  const allSearchResults = [];
  const allCsvCandidates = [];

  for (const search of searches) {
    const searchUrl =
      `${BC_CKAN_BASE}/package_search?q=${encodeURIComponent(search.q)}&rows=15&sort=score+desc`;
    let searchRes;
    try {
      searchRes = await fetchJson(searchUrl);
    } catch (err) {
      continue;
    }

    const packages = searchRes?.result?.results || [];
    for (const p of packages) {
      allSearchResults.push({ id: p.id, name: p.name, title: p.title, query: search.label });
    }

    for (const pkg of packages) {
      const resources = pkg.resources || [];
      // Find first resource that is genuinely a CSV
      const csvRes = resources.find(isActualCsvResource);
      if (csvRes && trim(csvRes.url)) {
        allCsvCandidates.push({
          pkg,
          resource: csvRes,
          searchQuery: search.q,
          searchLabel: search.label,
        });
      }
    }

    // Return the first candidate from this search round (highest relevance score)
    if (allCsvCandidates.length > 0) {
      const best = allCsvCandidates[0];
      const licence = trim(best.pkg.license_title) || trim(best.pkg.license_id) || 'Unknown';
      return {
        pkg: best.pkg,
        resourceUrl: trim(best.resource.url),
        resourceName: trim(best.resource.name || ''),
        packageTitle: trim(best.pkg.title),
        packageId: trim(best.pkg.id || best.pkg.name),
        packageUrl: `https://catalogue.data.gov.bc.ca/dataset/${trim(best.pkg.name || best.pkg.id)}`,
        licence,
        searchQuery: best.searchQuery,
        note: `Discovered via CKAN search "${best.searchLabel}" — verified CSV URL (not XLSX)`,
        // Attach full list for dry-run debugging
        allSearchResults,
        allCsvCandidates: allCsvCandidates.map((c) => ({
          title: c.pkg.title,
          id: c.pkg.id,
          resourceUrl: trim(c.resource.url),
          searchLabel: c.searchLabel,
        })),
      };
    }
  }

  throw new Error(
    `BC Grants: no genuine CSV-backed dataset found after ${searches.length} CKAN searches. ` +
    `${allSearchResults.length} packages found but none had a .csv resource URL. ` +
    `Packages found: ${allSearchResults.slice(0, 8).map((p) => `"${p.title}" (${p.id})`).join('; ')}`,
  );
}

async function buildGrants() {
  // 1. Discover source dynamically
  const discovered = await discoverBcGrantsSource();

  // 2. Download CSV (up to 20 MB)
  const csvText = await fetchText(discovered.resourceUrl, 20 * 1024 * 1024);
  const { headers, rows } = parseCsv(csvText);

  // 3. Detect columns dynamically — BC datasets vary; map best-effort
  // BC Public Accounts "Other Suppliers" format: ["Other Suppliers", ""] (name + unnamed amount)
  const recipientCol =
    headers.find((h) => /^recipient$/i.test(trim(h))) ||
    headers.find((h) => /recipient|beneficiar|payee/i.test(h)) ||
    headers.find((h) => /organization|org.name|org name/i.test(h)) ||
    headers.find((h) => /supplier|vendor/i.test(h)) ||
    headers.find((h) => /other.supplier/i.test(h)) ||
    (headers.length > 0 ? headers[0] : null); // fallback: first column is recipient

  // Amount column: look for labelled column first, then fall back to second column (may be "")
  // Note: JS || short-circuits on empty string, so use explicit undefined check
  let amountCol = headers.find((h) => /^amount/i.test(trim(h))) ||
    headers.find((h) => /amount|montant|\$|value|total/i.test(h));
  if (amountCol === undefined && headers.length >= 2) {
    amountCol = headers[1]; // BC Public Accounts: second col may be "" (unnamed) but holds amounts
  }

  const ministryCol =
    headers.find((h) => /^ministry$/i.test(trim(h))) ||
    headers.find((h) => /ministry|ministère|department|dept/i.test(h)) ||
    headers.find((h) => /division|branch|sector/i.test(h));
  const programCol = headers.find((h) => /program|programme|grant.name|description/i.test(h));
  const typeCol =
    headers.find((h) => /^category$/i.test(trim(h))) ||
    headers.find((h) => /categ|type|purpose/i.test(h) && !/program/i.test(h));
  const fiscalCol = headers.find((h) => /fiscal.*year|year|fiscal/i.test(h));
  const dateCol = headers.find((h) => /date/i.test(h));

  if (!recipientCol) {
    throw new Error(
      `BC Grants CSV: recipient column not found and no fallback available. ` +
      `Headers (${headers.length}): ${headers.slice(0, 25).join(', ')}. ` +
      `Source: ${discovered.resourceUrl}`,
    );
  }

  // 4. Filter to rows with a recipient — skip blank rows AND embedded BC CSV metadata rows
  // BC Public Accounts CSVs embed title/subtitle rows before actual data.
  // Detected patterns from fye24-other-suppliers.csv:
  //   Row: "for the Fiscal Year Ended March 31, 2024"
  //   Row: "(Details of payees receiving $25,000 or more)"
  //   Row: "Name" [echo of column header mid-file]
  const BC_METADATA_ROW = /^for the fiscal year|^\(details of payees|^name$|^recipient$|^total$/i;
  const withRecipient = rows.filter((r) => {
    const name = trim(r[recipientCol]);
    if (!name) return false;
    if (BC_METADATA_ROW.test(name)) return false;
    return true;
  });

  // 5. Sort by amount descending (if amount column present)
  // Use != null check — amountCol may be "" (empty string header) which is falsy but valid
  if (amountCol != null) {
    withRecipient.sort((a, b) => parseMoneyish(b[amountCol] || '0') - parseMoneyish(a[amountCol] || '0'));
  }

  const top = withRecipient.slice(0, MAX_RECORDS);
  let totalRaw = 0;
  const records = top.map((row) => {
    const amt = (amountCol != null) ? parseMoneyish(row[amountCol] || '') : 0;
    totalRaw += amt;
    const typeRaw = typeCol ? trim(row[typeCol]) : '';
    const purposeRaw = programCol ? trim(row[programCol]) : '';
    return {
      recipientName: trim(row[recipientCol]) || 'Recipient',
      typeLabel: typeRaw || 'Grant',
      typeColor: 'bg-green-100 text-green-700',
      purpose: purposeRaw && !/^no value$/i.test(purposeRaw)
        ? purposeRaw
        : (typeRaw || 'Government Grant'),
      dept: ministryCol ? trim(row[ministryCol]) || 'Government of British Columbia' : 'Government of British Columbia',
      fmtAmount: fmtCompact(amt),
      rawAmount: amt,
      date: (fiscalCol && trim(row[fiscalCol])) || (dateCol && trim(row[dateCol])) || '',
    };
  });

  // Infer fiscal year from data or resource metadata
  const csvRes = discovered.pkg?.resources?.find((r) => trim(r.url) === discovered.resourceUrl) || {};
  const rangeStart = csvRes.data_range_start || '';
  const rangeEnd = csvRes.data_range_end || '';
  const rangeYear = rangeStart
    ? `${rangeStart.slice(0, 4)}-${rangeEnd.slice(2, 4)}`
    : '';
  const inferredFiscalYear =
    (fiscalCol && rows[0] && trim(rows[0][fiscalCol])) ||
    rangeYear ||
    trim(csvRes.name || '') ||
    'latest';

  return {
    jurisdiction_id: JURISDICTION_ID,
    fiscal_year: inferredFiscalYear,
    reporting_period: `BC ${discovered.packageTitle} — ${inferredFiscalYear}`,
    data_source: `Government of British Columbia — ${discovered.packageTitle}. ${discovered.licence}.`,
    source_url: discovered.packageUrl,
    resource_url: discovered.resourceUrl,
    discovery_note: discovered.note,
    licence: discovered.licence,
    note: `Top 100 BC government payments by amount. Source: ${discovered.packageTitle}. ${discovered.licence}.`,
    total_after_filter: withRecipient.length,
    records_stored: records.length,
    total_raw_top100: totalRaw,
    fmt_total_top100: fmtCompact(totalRaw),
    // Surface headers and first raw rows for reviewer confirmation of column mapping
    detected_columns: {
      recipient: recipientCol || null,
      amount: amountCol !== undefined ? (amountCol || '(empty string)') : null,
      ministry: ministryCol || null,
      program: programCol || null,
      type: typeCol || null,
      fiscal_year: fiscalCol || null,
    },
    all_headers: headers.slice(0, 30),
    raw_first_rows: rows.slice(0, 5).map((r) => Object.fromEntries(
      headers.map((h, i) => [h || `col_${i}`, trim(r[h])]),
    )),
    records,
  };
}

module.exports = {
  JURISDICTION_ID,
  STATCAN_BC_COORD,
  SOURCES,
  buildEconomic,
  buildTax,
  buildGrants,
  discoverBcGrantsSource,
};
