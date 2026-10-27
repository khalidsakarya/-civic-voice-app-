/**
 * CRA "2024 List of charities" — the single source for every provincial / territorial charity document.
 *
 * WHY THIS EXISTS
 * The earlier builders read CRA package 51c68b86-… which is the "1998 List of charities" (coverage
 * 1998-01-01..1998-12-31, frequency "not planned"), yet the app presented it as the latest registry
 * listing, stored the first 100 rows in file order, and stored rawValue 0 as a placeholder. This module
 * replaces that with the latest CRA open-data list and honest, optional financial fields.
 *
 * SOURCE (confirmed at runtime by validatePackage(); the run aborts if any of it changes)
 *   package   80c00cdb-1358-415c-bb8b-0de7f12675b8   "2024 List of charities" (Canada Revenue Agency)
 *   coverage  2024-01-01 .. 2024-12-31 (T3010 returns for fiscal periods ending in 2024)
 *   frequency P1Y, licence Open Government Licence - Canada, date_published 2026-04-30 (refreshed since)
 *   The list only contains charities that filed a T3010 for the period; it is NOT the live registry.
 *
 * FIELD DEFINITIONS (CRA "List of charities data dictionary" v2.0, 2013-2024, and its "Codes Lists")
 *   Identification: BN, Category (official 4-digit category code), Designation (A Public Foundation,
 *                   B Private Foundation, C Charitable Organization), Legal Name, Province
 *   Financial data (T3010 Section D / Schedule 6), amounts in Canadian dollars, line numbers:
 *                   4700 Total revenue · 5100 Total expenditures · 4200 Total assets · FPE fiscal period end
 *                   (4350 Total liabilities and others exist but are not used)
 *   Some fields are blank for "exempt charities": blank means "not reported", never zero.
 *
 * SELECTION: the 100 charities with the highest reported total revenue (line 4700), highest first.
 *   Charities with no reported revenue follow, alphabetically. A reported 0 is a real value and kept.
 *
 * Nothing here touches Firestore. Importing this file runs nothing.
 */

'use strict';

const { fetchJson, fetchText, parseCsv, trim, INDUSTRY_BADGE } = require('./subnational-transparency-shared.cjs');

const SELECTION_SIZE = 100;
const MAX_CSV_BYTES = 150 * 1024 * 1024;

const SOURCE = Object.freeze({
  datasetId: '80c00cdb-1358-415c-bb8b-0de7f12675b8',
  title: '2024 List of charities',
  year: 2024,
  pageUrl: 'https://open.canada.ca/data/en/dataset/80c00cdb-1358-415c-bb8b-0de7f12675b8',
  apiUrl: 'https://open.canada.ca/data/api/3/action/package_show?id=80c00cdb-1358-415c-bb8b-0de7f12675b8',
  organization: 'cra-arc',
  publisher: 'Canada Revenue Agency — Charities Directorate',
  frequency: 'P1Y',
  licence: 'Open Government Licence - Canada',
});

/** Official CRA category codes (Codes Lists, section 2.1) and how each maps to the app's industry badges. */
const OFFICIAL_CATEGORIES = Object.freeze({
  '0001': ['Organizations Relieving Poverty', 'Human Services'],
  '0002': ['Foundations Relieving Poverty', 'Human Services'],
  '0010': ['Teaching Institutions', 'Education'],
  '0011': ['Support of schools and education', 'Education'],
  '0012': ['Education in the arts', 'Education'],
  '0013': ['Educational organizations not elsewhere categorized', 'Education'],
  '0014': ['Research', 'Education'],
  '0015': ['Foundations Advancing Education', 'Education'],
  '0030': ['Christianity', 'Religion'],
  '0040': ['Islam', 'Religion'],
  '0050': ['Judaism', 'Religion'],
  '0060': ['Other Religions', 'Religion'],
  '0070': ['Support of Religion', 'Religion'],
  '0080': ['Ecumenical and Inter-faith Organizations', 'Religion'],
  '0090': ['Foundations Advancing Religions', 'Religion'],
  '0100': ['Core Health Care', 'Health'],
  '0110': ['Supportive Health Care', 'Health'],
  '0120': ['Protective Health Care', 'Health'],
  '0130': ['Health Care Products', 'Health'],
  '0140': ['Complementary or Alternative Health Care', 'Health'],
  '0150': ['Relief of the Aged', 'Human Services'],
  '0155': ['Upholding Human Rights', 'Human Services'],
  '0160': ['Community Resource', 'Human Services'],
  '0170': ['Environment', 'Environment'],
  '0175': ['Agriculture', 'Other'],
  '0180': ['Animal Welfare', 'Other'],
  '0190': ['Arts', 'Arts/Culture'],
  '0200': ['Public Amenities', 'Other'],
  '0210': ['Foundations', 'Other'],
  '0215': ['NASO', 'Other'],
});

const DESIGNATIONS = Object.freeze({ A: 'Public Foundation', B: 'Private Foundation', C: 'Charitable Organization' });

/** Financial line numbers used, per the CRA data dictionary. */
const FINANCIAL_FIELDS = Object.freeze({
  revenue_cad: { line: '4700', meaning: 'Total revenue' },
  expenditures_cad: { line: '5100', meaning: 'Total expenditures' },
  assets_cad: { line: '4200', meaning: 'Total assets' },
});

const REQUIRED_IDENT_HEADERS = ['BN', 'Category', 'Designation', 'Legal Name', 'Province'];
const REQUIRED_FIN_HEADERS = ['BN', 'FPE', '4200', '4700', '5100'];

const PROVINCE_CODE_RE = /^CA-(AB|BC|MB|NB|NL|NS|NT|NU|ON|PE|QC|SK|YT)$/;

/** @param {any} pkg the CKAN package_show `result` */
function validatePackage(pkg) {
  const problems = [];
  const p = pkg || {};
  const titleEn = (p.title_translated && p.title_translated.en) || p.title;
  if (p.id !== SOURCE.datasetId) problems.push(`dataset id is "${p.id}", expected ${SOURCE.datasetId}`);
  if (titleEn !== SOURCE.title) problems.push(`title is "${titleEn}", expected "${SOURCE.title}"`);
  const start = String(p.time_period_coverage_start || '').slice(0, 10);
  const end = String(p.time_period_coverage_end || '').slice(0, 10);
  if (start !== '2024-01-01' || end !== '2024-12-31') problems.push(`coverage is ${start}..${end}, expected 2024-01-01..2024-12-31`);
  if (p.frequency !== SOURCE.frequency) problems.push(`frequency is "${p.frequency}", expected ${SOURCE.frequency}`);
  const published = String(p.date_published || '').slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(published) || published <= end) problems.push(`date_published "${p.date_published}" is missing or not after the coverage end`);
  if (!(p.organization && p.organization.name === SOURCE.organization)) problems.push('organization is not the Canada Revenue Agency (cra-arc)');
  if (!/Open Government Licence/i.test(String(p.license_title || ''))) problems.push(`licence is "${p.license_title}", expected Open Government Licence`);
  const resources = Array.isArray(p.resources) ? p.resources : [];
  const pick = (name) => resources.find((r) => trim(r.name) === name && /csv/i.test(trim(r.format)));
  const ident = pick('Identification');
  const fin = pick('Financial data');
  if (!ident || !trim(ident.url)) problems.push('Identification CSV resource not found');
  if (!fin || !trim(fin.url)) problems.push('Financial data CSV resource not found');
  if (problems.length) throw new Error(`CRA source validation FAILED — nothing may be written: ${problems.join('; ')}`);
  return {
    id: p.id,
    title: titleEn,
    publisher: SOURCE.publisher,
    published,
    metadata_modified: String(p.metadata_modified || '').slice(0, 10) || null,
    coverage_start: start,
    coverage_end: end,
    frequency: p.frequency,
    licence: SOURCE.licence,
    resources: {
      identification: { id: ident.id, url: trim(ident.url) },
      financial: { id: fin.id, url: trim(fin.url) },
    },
  };
}

function parseMoney(v) {
  const s = trim(v).replace(/[$,\s]/g, '');
  if (s === '' || !/^-?\d+(\.\d+)?$/.test(s)) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function normalizeCategory(v) {
  const s = trim(v);
  return /^\d+$/.test(s) ? s.padStart(4, '0') : s;
}

function industryFor(categoryCode) {
  const def = OFFICIAL_CATEGORIES[normalizeCategory(categoryCode)];
  const label = def ? def[1] : 'Other';
  return { label, color: INDUSTRY_BADGE[label] || INDUSTRY_BADGE.Other };
}

/** @returns {{ meta: object, identRows: any[], financialByBn: Map<string, any> }} */
function parseDataset({ meta, identCsv, financialCsv }) {
  const ident = parseCsv(identCsv);
  const fin = parseCsv(financialCsv);
  const missingI = REQUIRED_IDENT_HEADERS.filter((h) => !ident.headers.includes(h));
  const missingF = REQUIRED_FIN_HEADERS.filter((h) => !fin.headers.includes(h));
  if (missingI.length || missingF.length) {
    throw new Error(`CRA CSV headers changed — refusing to continue. Identification missing: [${missingI.join(', ')}]; Financial missing: [${missingF.join(', ')}]`);
  }
  // one financial row per BN: the one with the latest fiscal period end (some BNs appear twice)
  const financialByBn = new Map();
  for (const row of fin.rows) {
    const bn = trim(row.BN);
    if (!bn) continue;
    const prev = financialByBn.get(bn);
    if (!prev || trim(row.FPE) >= trim(prev.FPE)) financialByBn.set(bn, row);
  }
  return { meta, identRows: ident.rows, financialByBn };
}

let datasetPromise = null;

/** Downloads the two CSVs once per process (shared by all 13 jurisdictions). Validates the metadata first. */
async function loadDataset({ fetchJsonFn = fetchJson, fetchTextFn = fetchText, useCache = true } = {}) {
  if (useCache && datasetPromise) return datasetPromise;
  const promise = (async () => {
    const pkgResponse = await fetchJsonFn(SOURCE.apiUrl);
    const meta = validatePackage(pkgResponse && pkgResponse.result);
    const [identCsv, financialCsv] = [
      await fetchTextFn(meta.resources.identification.url, MAX_CSV_BYTES),
      await fetchTextFn(meta.resources.financial.url, MAX_CSV_BYTES),
    ];
    return parseDataset({ meta, identCsv, financialCsv });
  })();
  if (useCache) {
    datasetPromise = promise;
    promise.catch(() => { datasetPromise = null; });
  }
  return promise;
}

/**
 * Pure selection for one jurisdiction.
 * @returns {{ records: object[], totalInSource: number, revenueReportedCount: number }}
 */
function selectCharities(dataset, jurisdictionId, { size = SELECTION_SIZE } = {}) {
  const m = PROVINCE_CODE_RE.exec(String(jurisdictionId));
  if (!m) throw new Error(`"${jurisdictionId}" is not a Canadian province/territory id (CA-XX)`);
  const code = m[1];

  const seen = new Set();
  const candidates = [];
  for (const row of dataset.identRows) {
    if (trim(row.Province).toUpperCase() !== code) continue;
    const bn = trim(row.BN);
    if (!bn || seen.has(bn)) continue;
    seen.add(bn);
    candidates.push(row);
  }

  const enriched = candidates.map((row) => {
    const bn = trim(row.BN);
    const fin = dataset.financialByBn.get(bn);
    const industry = industryFor(row.Category);
    const desig = trim(row.Designation).toUpperCase();
    const record = {
      name: trim(row['Legal Name']) || 'Registered charity',
      industry: industry.label,
      industryColor: industry.color,
      exemType: DESIGNATIONS[desig] || (desig ? `CRA Type: ${desig}` : 'Registered Charity'),
      bn,
    };
    let revenue = null;
    if (fin) {
      revenue = parseMoney(fin['4700']);
      const expenditures = parseMoney(fin['5100']);
      const assets = parseMoney(fin['4200']);
      if (revenue !== null) record.revenue_cad = revenue;
      if (expenditures !== null) record.expenditures_cad = expenditures;
      if (assets !== null) record.assets_cad = assets;
      const fpe = trim(fin.FPE);
      if (/^\d{4}-\d{2}-\d{2}$/.test(fpe)) record.fiscal_period_end = fpe;
    }
    return { record, revenue };
  });

  enriched.sort((a, b) => {
    const ar = a.revenue !== null; const br = b.revenue !== null;
    if (ar !== br) return ar ? -1 : 1;
    if (ar && a.revenue !== b.revenue) return b.revenue - a.revenue;
    return a.record.name.localeCompare(b.record.name) || a.record.bn.localeCompare(b.record.bn);
  });

  return {
    records: enriched.slice(0, size).map((e) => e.record),
    totalInSource: candidates.length,
    revenueReportedCount: enriched.filter((e) => e.revenue !== null).length,
  };
}

/**
 * The corrected charity document for one jurisdiction (what the app reads from
 * subnational_tax_exempt_entities/{id}). No `rawValue` field is ever written.
 */
function buildDocFromDataset(dataset, jurisdictionId) {
  const { meta } = dataset;
  const sel = selectCharities(dataset, jurisdictionId);
  if (!sel.records.length) throw new Error(`No ${SOURCE.year} charities found for ${jurisdictionId} — refusing to build an empty document`);
  return {
    jurisdiction_id: jurisdictionId,
    data_source: `${SOURCE.publisher}, "${meta.title}". Source: open.canada.ca. Licensed under Open Government Licence — Canada.`,
    source_url: SOURCE.pageUrl,
    source_year: SOURCE.year,
    reporting_period: `CRA List of charities — ${SOURCE.year} filing year (fiscal periods ending in ${SOURCE.year}), published ${meta.published}`,
    note: `Charities that filed a T3010 return for fiscal periods ending in ${SOURCE.year}, ranked by total revenue. Financial amounts are stored but not displayed in this version.`,
    selection_basis: 'largest by revenue',
    total_in_source: sel.totalInSource,
    records_stored: sel.records.length,
    financials_reported_count: sel.revenueReportedCount,
    source_dataset: {
      id: meta.id,
      title: meta.title,
      published: meta.published,
      metadata_modified: meta.metadata_modified,
      coverage: `${meta.coverage_start} to ${meta.coverage_end}`,
      frequency: meta.frequency,
    },
    records: sel.records,
  };
}

async function buildCharitiesDoc({ jurisdictionId, dataset, ...loadOpts }) {
  const ds = dataset || (await loadDataset(loadOpts));
  return buildDocFromDataset(ds, jurisdictionId);
}

/** Report-friendly numbers for a built document. */
function summarizeDoc(doc) {
  const recs = doc.records || [];
  const revs = recs.map((r) => r.revenue_cad).filter((v) => typeof v === 'number');
  return {
    jurisdiction_id: doc.jurisdiction_id,
    total_in_source: doc.total_in_source,
    selected: recs.length,
    with_revenue_selected: revs.length,
    without_revenue_selected: recs.length - revs.length,
    charities_without_revenue_in_source: doc.total_in_source - doc.financials_reported_count,
    revenue_max_cad: revs.length ? Math.max(...revs) : null,
    revenue_min_cad: revs.length ? Math.min(...revs) : null,
    zero_revenue_reported_selected: revs.filter((v) => v === 0).length,
    has_rawValue_field: recs.some((r) => 'rawValue' in r),
  };
}

module.exports = {
  SOURCE,
  SELECTION_SIZE,
  OFFICIAL_CATEGORIES,
  DESIGNATIONS,
  FINANCIAL_FIELDS,
  PROVINCE_CODE_RE,
  validatePackage,
  parseMoney,
  industryFor,
  parseDataset,
  loadDataset,
  selectCharities,
  buildDocFromDataset,
  buildCharitiesDoc,
  summarizeDoc,
};
