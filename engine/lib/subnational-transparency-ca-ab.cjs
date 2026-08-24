/**
 * CA-AB (Alberta) — official economic sources.
 *
 * unemployment  → subnational_economic_social_stats/CA-AB
 * CRA Charities → subnational_tax_exempt_entities/CA-AB
 * AB Grants     → subnational_grants/CA-AB
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

const JURISDICTION_ID = 'CA-AB';

// Statistics Canada Table 14-10-0287-01 — Alberta geography dimension = 10
const STATCAN_AB_COORD = '10.7.1.1.1.1.0.0.0.0';

// Alberta Open Government Portal CKAN base URL
const AB_CKAN_BASE = 'https://open.alberta.ca/api/3/action';

const SOURCES = {
  unemployment: 'https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=1410028701',
  // CRA Charities — same package as all provinces, filtered to AB
  charities: 'https://open.canada.ca/data/en/dataset/51c68b86-33f0-46fe-9b51-0a786d0088f5',
  charitiesCkanPkg:
    'https://open.canada.ca/data/api/3/action/package_show?id=51c68b86-33f0-46fe-9b51-0a786d0088f5',
  // Alberta Grants — discovered dynamically from Alberta Open Government CKAN
  abCkanSearch: `${AB_CKAN_BASE}/package_search`,
  abCkanBase: AB_CKAN_BASE,
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
      STATCAN_AB_COORD,
      STATCAN_CA_COORD,
      'Alberta',
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
    if (prov !== 'AB' && prov !== 'ALBERTA') continue;
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
      'AB registered charities only. Name, type, and category displayed (MVP). No dollar values in this version. OGL-Canada.',
    total_in_source: candidates.length,
    records_stored: records.length,
    records,
  };
}

// ─── Grants (Alberta Open Government — Grant payments disclosure) ────────────

/**
 * Returns true if the resource URL and format indicate an actual CSV file.
 * Some Alberta Open Government entries have companion XLSX/PDF resources in the
 * same package — reject those explicitly by URL extension.
 */
function isActualCsvResource(r) {
  const url = trim(r.url).toLowerCase();
  const fmt = trim(r.format).toUpperCase();
  if (/\.(xlsx?|zip|pdf|ods|json|xml|kml|geojson|tif|tiff|shp|gdb)$/i.test(url)) return false;
  return url.endsWith('.csv') || fmt === 'CSV' || fmt === 'TEXT/CSV';
}

/**
 * Discover the Alberta grant payments disclosure dataset from the Alberta Open
 * Government CKAN API. Tries multiple search queries in priority order; skips
 * XLSX/PDF resources.
 * Returns { pkg, resourceUrl, packageTitle, packageId, licence, note } or throws.
 */
async function discoverAbGrantsSource() {
  const searches = [
    { q: 'grant payments disclosure', label: 'grant payments disclosure' },
    { q: 'alberta government grant payments disclosure', label: 'ab grant disclosure' },
    { q: 'grant disclosure ministry recipient', label: 'grant disclosure ministry' },
  ];

  const allSearchResults = [];
  const allCsvCandidates = [];

  for (const search of searches) {
    const searchUrl =
      `${AB_CKAN_BASE}/package_search?q=${encodeURIComponent(search.q)}&rows=15&sort=score+desc`;
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
      // Only consider packages whose title indicates grant/payment disclosure —
      // avoids false positives from unrelated CSV-bearing packages (e.g. crop reports).
      if (!/grant|payment|disclosure/i.test(trim(pkg.title))) continue;

      const resources = pkg.resources || [];
      // Prefer the most recent non-"standardized" CSV resource — Alberta lists
      // current fiscal year first, with older "(standardized)" alt versions later.
      const csvRes =
        resources.find((r) => isActualCsvResource(r) && !/standardized/i.test(trim(r.name))) ||
        resources.find(isActualCsvResource);
      if (csvRes && trim(csvRes.url)) {
        allCsvCandidates.push({ pkg, resource: csvRes, searchQuery: search.q, searchLabel: search.label });
      }
    }

    if (allCsvCandidates.length > 0) {
      const best = allCsvCandidates[0];
      const licence = trim(best.pkg.license_title) || trim(best.pkg.license_id) || 'Unknown';
      return {
        pkg: best.pkg,
        resourceUrl: trim(best.resource.url),
        resourceName: trim(best.resource.name || ''),
        packageTitle: trim(best.pkg.title),
        packageId: trim(best.pkg.id || best.pkg.name),
        packageUrl: `https://open.alberta.ca/publications/${trim(best.pkg.name || best.pkg.id)}`,
        licence,
        searchQuery: best.searchQuery,
        note: `Discovered via CKAN search "${best.searchLabel}" — verified CSV URL (not XLSX/PDF), most recent non-standardized resource`,
        allSearchResults,
        allCsvCandidates: allCsvCandidates.map((c) => ({
          title: c.pkg.title,
          id: c.pkg.id,
          resourceUrl: trim(c.resource.url),
          resourceName: trim(c.resource.name || ''),
          searchLabel: c.searchLabel,
        })),
      };
    }
  }

  throw new Error(
    `AB Grants: no genuine CSV-backed grant/payment dataset found after ${searches.length} CKAN searches. ` +
    `${allSearchResults.length} packages found. ` +
    `Packages found: ${allSearchResults.slice(0, 8).map((p) => `"${p.title}" (${p.id})`).join('; ')}`,
  );
}

async function buildGrants() {
  // 1. Discover source dynamically
  const discovered = await discoverAbGrantsSource();

  // 2. Download CSV — Alberta's annual grant disclosure file is large (~25 MB, ~180K rows)
  const csvText = await fetchText(discovered.resourceUrl, 60 * 1024 * 1024);
  const { headers, rows } = parseCsv(csvText);

  // 3. Detect columns — known Alberta "Grant payments disclosure" schema:
  // Ministry,BUName,Recipient,Program,Amount,Lottery,PaymentDate,FiscalYear,DisplayFiscalYear
  const recipientCol =
    headers.find((h) => /^recipient$/i.test(trim(h))) ||
    headers.find((h) => /recipient|beneficiar|payee/i.test(h)) ||
    (headers.length > 0 ? headers[0] : null);
  const amountCol =
    headers.find((h) => /^amount$/i.test(trim(h))) ||
    headers.find((h) => /amount|montant|\$|value/i.test(h));
  const ministryCol =
    headers.find((h) => /^ministry$/i.test(trim(h))) ||
    headers.find((h) => /ministry|ministère|department|dept/i.test(h));
  const programCol =
    headers.find((h) => /^program$/i.test(trim(h))) ||
    headers.find((h) => /program|programme|grant.name|description/i.test(h));
  const fiscalCol =
    headers.find((h) => /^displayfiscalyear$/i.test(trim(h))) ||
    headers.find((h) => /display.*fiscal|fiscal.*year/i.test(h));
  const dateCol =
    headers.find((h) => /^paymentdate$/i.test(trim(h))) ||
    headers.find((h) => /date/i.test(h));

  if (!recipientCol) {
    throw new Error(
      `AB Grants CSV: recipient column not found. Headers (${headers.length}): ${headers.slice(0, 25).join(', ')}. ` +
      `Source: ${discovered.resourceUrl}`,
    );
  }

  // 4. Filter to rows with a non-blank recipient. Alberta's disclosure intentionally
  // leaves Recipient blank for privacy-protected program-level totals (e.g. income
  // support, AISH, seniors benefits paid to individuals) — these are not identifiable
  // payees and are excluded by the same "must have a name" rule already used for
  // CA-ON and CA-BC (subnationalTransparencyData.js `withRecipient` pattern), not a
  // new judgment call specific to Alberta.
  const totalRows = rows.length;
  const withRecipient = rows.filter((r) => trim(r[recipientCol]));
  const blankRecipientCount = totalRows - withRecipient.length;
  const rawRowCountAfterFilter = withRecipient.length;

  // 5. Reviewer decision (2026-08-24): aggregate repeated payment installments by
  // recipient + program before publication. Alberta discloses each individual
  // payment installment as its own row, so large recurring grants (e.g. a health
  // authority's operating funding paid out across the fiscal year) appear as dozens
  // of near-identical rows and would otherwise dominate a naive "top 100 by amount"
  // list. Aggregation combines installments — it does not delete or alter any
  // underlying payment, and installment counts are preserved and shown.
  const groups = new Map();
  const GROUP_SEP = '␟'; // unlikely to appear in source text
  for (const row of withRecipient) {
    const recipientName = trim(row[recipientCol]) || 'Recipient';
    const programRaw = programCol ? trim(row[programCol]) : '';
    const purpose = programRaw || 'Government Grant';
    const dept = ministryCol ? trim(row[ministryCol]) || 'Government of Alberta' : 'Government of Alberta';
    const amt = amountCol ? parseMoneyish(row[amountCol] || '') : 0;
    const dateVal = dateCol ? trim(row[dateCol]) : '';
    const key = `${recipientName}${GROUP_SEP}${purpose}`;
    let g = groups.get(key);
    if (!g) {
      g = { recipientName, purpose, dept, totalAmount: 0, installmentCount: 0, minDate: null, maxDate: null };
      groups.set(key, g);
    }
    g.totalAmount += amt;
    g.installmentCount += 1;
    if (dateVal) {
      if (!g.minDate || dateVal < g.minDate) g.minDate = dateVal;
      if (!g.maxDate || dateVal > g.maxDate) g.maxDate = dateVal;
    }
  }

  const aggregatedGroups = [...groups.values()];
  const aggregatedGroupCount = aggregatedGroups.length;
  aggregatedGroups.sort((a, b) => b.totalAmount - a.totalAmount);

  const top = aggregatedGroups.slice(0, MAX_RECORDS);
  let totalRaw = 0;
  const records = top.map((g) => {
    totalRaw += g.totalAmount;
    const dateLabel = g.installmentCount > 1
      ? `${g.installmentCount} payments${g.minDate && g.maxDate ? ` (${g.minDate} to ${g.maxDate})` : ''}`
      : (g.minDate || '');
    return {
      recipientName: g.recipientName,
      typeLabel: 'Grant',
      typeColor: 'bg-green-100 text-green-700',
      purpose: g.purpose,
      dept: g.dept,
      fmtAmount: fmtCompact(g.totalAmount),
      rawAmount: g.totalAmount,
      installmentCount: g.installmentCount,
      date: dateLabel,
    };
  });

  const inferredFiscalYear =
    (fiscalCol && rows[0] && trim(rows[0][fiscalCol])) ||
    trim(discovered.resource?.name || '') ||
    'latest';

  const warnings = [];
  const multiInstallmentInTop = top.filter((g) => g.installmentCount > 1).length;
  if (multiInstallmentInTop > 0) {
    warnings.push(
      `${multiInstallmentInTop} of the top ${records.length} aggregated rows combine more than one payment ` +
      `installment (real, unaltered payments to the same recipient/program summed together) — expected given ` +
      `Alberta discloses each installment as a separate row.`,
    );
  }

  const transformationNote =
    'Multiple payment installments to the same recipient/program were aggregated for public display.';

  return {
    jurisdiction_id: JURISDICTION_ID,
    fiscal_year: inferredFiscalYear,
    reporting_period: `AB ${discovered.packageTitle} — ${inferredFiscalYear}`,
    data_source: `Government of Alberta — ${discovered.packageTitle}. ${discovered.licence}.`,
    source_url: discovered.packageUrl,
    resource_url: discovered.resourceUrl,
    discovery_note: discovered.note,
    licence: discovered.licence,
    note: `Top 100 Alberta grants by aggregated total amount, grouped by recipient + program. Excludes rows with ` +
      `no named recipient (privacy-protected program-level totals for individual benefit/assistance recipients). ` +
      `Source: ${discovered.packageTitle}. ${discovered.licence}.`,
    transformation_note: transformationNote,
    total_rows_in_source: totalRows,
    blank_recipient_rows_excluded: blankRecipientCount,
    total_after_filter: rawRowCountAfterFilter,
    raw_row_count: rawRowCountAfterFilter,
    aggregated_group_count: aggregatedGroupCount,
    records_stored: records.length,
    total_raw_top100: totalRaw,
    fmt_total_top100: fmtCompact(totalRaw),
    detected_columns: {
      recipient: recipientCol || null,
      amount: amountCol || null,
      ministry: ministryCol || null,
      program: programCol || null,
      fiscal_year: fiscalCol || null,
      date: dateCol || null,
    },
    all_headers: headers.slice(0, 30),
    raw_first_rows: rows.slice(0, 5).map((r) => Object.fromEntries(
      headers.map((h, i) => [h || `col_${i}`, trim(r[h])]),
    )),
    warnings,
    records,
  };
}

module.exports = {
  JURISDICTION_ID,
  STATCAN_AB_COORD,
  SOURCES,
  buildEconomic,
  buildTax,
  buildGrants,
  discoverAbGrantsSource,
};
