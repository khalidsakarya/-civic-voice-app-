/**
 * CA-QC (Québec) — official economic sources.
 *
 * unemployment  → subnational_economic_social_stats/CA-QC
 * CRA Charities → subnational_tax_exempt_entities/CA-QC
 * QC Transfers  → subnational_grants/CA-QC
 */

'use strict';

const {
  MAX_RECORDS,
  INDUSTRY_BADGE,
  trim,
  fmtCompact,
  fetchText,
  fetchJson,
  parseCsv,
} = require('./subnational-transparency-shared.cjs');
const {
  statcanProvincialUnemployment,
  STATCAN_CA_COORD,
} = require('./subnational-unemployment-monthly.cjs');

const JURISDICTION_ID = 'CA-QC';

// Statistics Canada Table 14-10-0287-01 — Québec geography dimension = 6
const STATCAN_QC_COORD = '6.7.1.1.1.1.0.0.0.0';

// Données Québec CKAN base URL
const QC_CKAN_BASE = 'https://www.donneesquebec.ca/recherche/api/3/action';

const SOURCES = {
  unemployment: 'https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=1410028701',
  // CRA Charities — same package as all provinces, filtered to QC
  charities: 'https://open.canada.ca/data/en/dataset/51c68b86-33f0-46fe-9b51-0a786d0088f5',
  charitiesCkanPkg:
    'https://open.canada.ca/data/api/3/action/package_show?id=51c68b86-33f0-46fe-9b51-0a786d0088f5',
  // Québec transfer expenses — discovered dynamically from données Québec CKAN
  qcCkanSearch: `${QC_CKAN_BASE}/package_search`,
  qcCkanBase: QC_CKAN_BASE,
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
      STATCAN_QC_COORD,
      STATCAN_CA_COORD,
      'Quebec',
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
    if (prov !== 'QC' && prov !== 'QUEBEC' && prov !== 'QUÉBEC') continue;
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
      'QC registered charities only. Name, type, and category displayed (MVP). No dollar values in this version. OGL-Canada.',
    total_in_source: candidates.length,
    records_stored: records.length,
    records,
  };
}

// ─── Transfer expenses (Comptes publics du Québec — Volume 2) ────────────────

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
 * Québec's Ministère des Finances CSVs use `;` delimiters (French/European
 * convention), not `,`. The shared parseCsv() assumes comma-delimited files, so
 * this module uses its own delimiter-aware parser instead of touching the
 * shared helper (which is relied on by CA-ON/CA-BC/CA-AB and CRA charities).
 */
function parseSemicolonCsv(text) {
  const lines = text.replace(/^﻿/, '').split(/\r?\n/).filter((l) => l.length);
  if (!lines.length) return { headers: [], rows: [] };
  const splitLine = (line) => {
    const out = [];
    let cur = '';
    let inQ = false;
    for (let i = 0; i < line.length; i += 1) {
      const ch = line[i];
      if (ch === '"') {
        if (inQ && line[i + 1] === '"') {
          cur += '"';
          i += 1;
        } else inQ = !inQ;
      } else if (ch === ';' && !inQ) {
        out.push(cur);
        cur = '';
      } else cur += ch;
    }
    out.push(cur);
    return out.map((s) => s.trim());
  };
  const headers = splitLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i += 1) {
    const cols = splitLine(lines[i]);
    if (!cols.length || cols.every((c) => !trim(c))) continue;
    const row = {};
    for (let j = 0; j < headers.length; j += 1) row[headers[j]] = cols[j] ?? '';
    rows.push(row);
  }
  return { headers, rows };
}

/** Québec amounts use plain ASCII spaces as thousands separators, e.g. "2 590 002 000". */
function parseQcMoney(s) {
  const t = trim(s).replace(/[^0-9.-]/g, '');
  if (!t) return 0;
  const n = Number(t);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Discover the Québec "Comptes publics du gouvernement – Volume 2" dataset
 * (Ministère des Finances du Québec) from données Québec CKAN, and pick the
 * most recent "par bénéficiaires" (by-beneficiary) CSV resource. Filters out
 * municipal datasets (e.g. Ville de Montréal, prefixed "vmtl-") that share
 * similar keywords ("subventions") but are not the provincial source.
 */
async function discoverQcTransfersSource() {
  const searches = [
    { q: 'comptes publics gouvernement Québec dépenses de transfert', label: 'comptes publics transfert' },
    { q: 'dépenses de transfert bénéficiaires', label: 'depenses transfert beneficiaires' },
    { q: 'comptes publics volume 2', label: 'comptes publics volume 2' },
  ];

  const allSearchResults = [];
  const allCsvCandidates = [];

  for (const search of searches) {
    const searchUrl =
      `${QC_CKAN_BASE}/package_search?q=${encodeURIComponent(search.q)}&rows=15&sort=score+desc`;
    let searchRes;
    try {
      searchRes = await fetchJson(searchUrl);
    } catch (err) {
      continue;
    }

    const packages = searchRes?.result?.results || [];
    for (const p of packages) {
      allSearchResults.push({
        id: p.id, name: p.name, title: p.title, org: p.organization?.title || '', query: search.label,
      });
    }

    for (const pkg of packages) {
      // Require the provincial Ministry of Finance as publisher — excludes
      // municipal (Ville de Montréal "vmtl-…") and other organizations whose
      // datasets happen to match on similar keywords.
      const orgTitle = trim(pkg.organization?.title || '');
      if (!/finances/i.test(orgTitle) || !/qu[ée]bec/i.test(orgTitle)) continue;
      if (!/comptes publics/i.test(trim(pkg.title))) continue;

      const resources = pkg.resources || [];
      // Prefer the "par bénéficiaires" (by-beneficiary) resource, most recent
      // fiscal year first (données Québec lists newest resources first).
      const csvRes = resources.find(
        (r) => isActualCsvResource(r) && /par\s*b[ée]n[ée]ficiaires/i.test(trim(r.name)),
      );
      if (csvRes && trim(csvRes.url)) {
        allCsvCandidates.push({ pkg, resource: csvRes, searchQuery: search.q, searchLabel: search.label });
      }
    }

    if (allCsvCandidates.length > 0) {
      const best = allCsvCandidates[0];
      const licence = trim(best.pkg.license_title) || trim(best.pkg.license_id) || 'Unknown';
      return {
        pkg: best.pkg,
        resource: best.resource,
        resourceUrl: trim(best.resource.url),
        resourceName: trim(best.resource.name || ''),
        packageTitle: trim(best.pkg.title),
        packageId: trim(best.pkg.id || best.pkg.name),
        packageUrl: `https://www.donneesquebec.ca/recherche/dataset/${trim(best.pkg.name || best.pkg.id)}`,
        licence,
        licenceUrl: trim(best.pkg.license_url || ''),
        organization: trim(best.pkg.organization?.title || ''),
        searchQuery: best.searchQuery,
        note: `Discovered via CKAN search "${best.searchLabel}" — publisher confirmed as Ministère des Finances du Québec, verified CSV resource "par bénéficiaires" (not XLSX/PDF, not a municipal dataset)`,
        allSearchResults,
        allCsvCandidates: allCsvCandidates.map((c) => ({
          title: c.pkg.title, id: c.pkg.id, org: c.pkg.organization?.title,
          resourceUrl: trim(c.resource.url), searchLabel: c.searchLabel,
        })),
      };
    }
  }

  throw new Error(
    `QC Transfers: no genuine CSV-backed "Comptes publics" dataset from Ministère des Finances du Québec found ` +
    `after ${searches.length} CKAN searches. ${allSearchResults.length} packages found. ` +
    `Packages found: ${allSearchResults.slice(0, 8).map((p) => `"${p.title}" (${p.org})`).join('; ')}`,
  );
}

async function buildGrants() {
  const discovered = await discoverQcTransfersSource();

  const csvText = await fetchText(discovered.resourceUrl, 10 * 1024 * 1024);
  const { headers, rows } = parseSemicolonCsv(csvText);

  // Known schema: Portefeuille;Beneficiaire;Montant
  const portfolioCol = headers.find((h) => /portefeuille/i.test(trim(h))) || headers[0];
  const beneficiaryCol = headers.find((h) => /b[ée]n[ée]ficiaire/i.test(trim(h))) || headers[1];
  const amountCol = headers.find((h) => /montant/i.test(trim(h))) || headers[headers.length - 1];

  if (!beneficiaryCol || !amountCol) {
    throw new Error(
      `QC Transfers CSV: expected columns not found. Headers: ${headers.join(', ')}. Source: ${discovered.resourceUrl}`,
    );
  }

  const withBeneficiary = rows.filter((r) => trim(r[beneficiaryCol]));
  const blankBeneficiaryCount = rows.length - withBeneficiary.length;

  withBeneficiary.sort((a, b) => parseQcMoney(b[amountCol]) - parseQcMoney(a[amountCol]));

  const top = withBeneficiary.slice(0, MAX_RECORDS);
  let totalRaw = 0;
  const records = top.map((row) => {
    const amt = parseQcMoney(row[amountCol]);
    totalRaw += amt;
    const beneficiary = trim(row[beneficiaryCol]) || 'Non spécifié';
    const portfolio = portfolioCol ? trim(row[portfolioCol]) : '';
    return {
      recipientName: beneficiary,
      typeLabel: 'Transfer',
      typeColor: 'bg-green-100 text-green-700',
      purpose: portfolio || 'Dépense de transfert',
      dept: portfolio || 'Gouvernement du Québec',
      fmtAmount: fmtCompact(amt),
      rawAmount: amt,
      date: '',
    };
  });

  const fiscalYearMatch = discovered.resourceName.match(/(\d{4}-\d{4}|\d{2}-\d{2})/);
  const inferredFiscalYear = fiscalYearMatch ? fiscalYearMatch[0] : 'latest';

  const warnings = [];
  warnings.push(
    'IMPORTANT DATA-SHAPE DIFFERENCE from CA-ON/CA-BC/CA-AB: this dataset is aggregated by ministry portfolio × ' +
    'beneficiary CATEGORY (e.g. "Municipalités", "Organismes à but non lucratif", "Personnes"), not by individual ' +
    'named organization/company. Québec\'s Comptes publics Volume 2 does not publish an itemized by-recipient-name ' +
    'schedule at the provincial level (a broad search of données Québec found no such dataset). The "Recipient" ' +
    'field therefore shows a beneficiary category, not a specific payee name, for every record in this dataset. ' +
    'This is real, official, unaltered government data — not fabricated — but it is structurally different from ' +
    'the other three provinces and should be reviewed before deciding how (or whether) to publish it under the ' +
    'same UI pattern used for named-recipient data.',
  );
  if (blankBeneficiaryCount > 0) {
    warnings.push(`${blankBeneficiaryCount} row(s) had no beneficiary category and were excluded.`);
  }

  return {
    jurisdiction_id: JURISDICTION_ID,
    fiscal_year: inferredFiscalYear,
    reporting_period: `QC ${discovered.packageTitle} — ${discovered.resourceName}`,
    data_source: `${discovered.organization} — ${discovered.packageTitle} (${discovered.resourceName}). Licence ${discovered.licence}.`,
    data_source_fr: `${discovered.organization} — ${discovered.packageTitle} (${discovered.resourceName})`,
    data_source_en: 'Ministère des Finances du Québec — Public Accounts of the Government, Volume 2 — Transfer expenses by beneficiary',
    source_url: discovered.packageUrl,
    resource_url: discovered.resourceUrl,
    discovery_note: discovered.note,
    licence: discovered.licence,
    licence_url: discovered.licenceUrl,
    note: `All ${records.length} beneficiary-category transfer expense rows for Québec, sorted by amount. Aggregated ` +
      `by ministry portfolio × beneficiary category (see warnings — not itemized by individual recipient name). ` +
      `Source: ${discovered.packageTitle}. Licence ${discovered.licence}.`,
    total_rows_in_source: rows.length,
    blank_beneficiary_rows_excluded: blankBeneficiaryCount,
    total_after_filter: withBeneficiary.length,
    records_stored: records.length,
    total_raw_top100: totalRaw,
    fmt_total_top100: fmtCompact(totalRaw),
    detected_columns: {
      portfolio: portfolioCol || null,
      beneficiary_category: beneficiaryCol || null,
      amount: amountCol || null,
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
  STATCAN_QC_COORD,
  SOURCES,
  buildEconomic,
  buildTax,
  buildGrants,
  discoverQcTransfersSource,
};
