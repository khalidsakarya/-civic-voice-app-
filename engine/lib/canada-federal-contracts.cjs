/**
 * Federal Canada contracts: select the largest disclosed contracts for one
 * fiscal year and shape them as `government_contracts` documents.
 *
 * Source: Treasury Board of Canada Secretariat, "Proactive Publication -
 * Contracts" (open.canada.ca, Open Government Licence - Canada), CKAN
 * datastore resource fac950c0-00d5-4ec1-a4d3-9cbebf98a305.
 *
 * Why this is more than "sort by value":
 *   - Every column in the source is TEXT, so a server-side numeric sort is
 *     not possible; values are parsed and ranked locally.
 *   - `reference_number` is unique per DISCLOSURE ROW (it embeds the quarter,
 *     e.g. C-2025-2026-Q4-02176), not per contract. A contract is re-reported
 *     each time it is amended, so a naive top-N is full of duplicates (one
 *     Parsons contract occupied 5 of the top 16 slots). The contract identity
 *     is `procurement_id` (never blank), combined with vendor and department
 *     because 322 procurement_ids span several vendors and 381 span several
 *     departments.
 *   - `contract_value` is the CUMULATIVE disclosed value (original +
 *     amendments) and is not monotonic across successive amendments, so the
 *     MOST RECENT disclosure per contract is used, not the maximum.
 *
 * Pure functions are exported for unit tests; the only network function is
 * fetchFiscalYearRows(). Nothing here touches Firestore.
 */

'use strict';

const DATASET = {
  name: 'Proactive Publication - Contracts',
  publisher: 'Treasury Board of Canada Secretariat',
  url: 'https://open.canada.ca/data/en/dataset/d8f85d91-7dec-4fd1-8055-483b77225d8b',
  licence: 'Open Government Licence - Canada',
  resourceId: 'fac950c0-00d5-4ec1-a4d3-9cbebf98a305',
};

const CKAN_ACTION = 'https://open.canada.ca/data/en/api/3/action/datastore_search';
const SELECTION_SIZE = 100;
/** Document ids are rank-ordered so the UI can page by document id (no composite index needed). */
const DOC_ID_PREFIX = 'ca-fed-contract-';
const DEFAULT_FISCAL_YEAR = '2025-2026';
/** Value of `jurisdiction` on the selection documents. Must never equal CA/US/UK/AU (see buildContractDoc). */
const FED_SELECTION_JURISDICTION = 'CA-FED-SELECTION';

const FETCH_FIELDS = [
  '_id', 'reference_number', 'procurement_id', 'vendor_name', 'contract_date', 'contract_period_start', 'delivery_date',
  'contract_value', 'original_value', 'amendment_value', 'description_en', 'owner_org_title', 'owner_org',
  'reporting_period', 'instrument_type',
];

const PAGE_SIZE = 20000;

function docIdForRank(rank) {
  return `${DOC_ID_PREFIX}${String(rank).padStart(3, '0')}`;
}

/** "2025-2026" -> ["2025-2026-Q1", ... "2025-2026-Q4"] */
function fiscalYearPeriods(fiscalYear = DEFAULT_FISCAL_YEAR) {
  const m = String(fiscalYear).match(/^(\d{4})-(\d{4})$/);
  if (!m || Number(m[2]) !== Number(m[1]) + 1) throw new Error(`Invalid fiscal year "${fiscalYear}" (expected e.g. 2025-2026)`);
  return [1, 2, 3, 4].map((q) => `${fiscalYear}-Q${q}`);
}

function fiscalYearLabels(fiscalYear = DEFAULT_FISCAL_YEAR) {
  const [a, b] = String(fiscalYear).split('-').map(Number);
  return {
    short: `${a}–${String(b).slice(2)}`,                       // 2025–26
    range: `April 1, ${a} – March 31, ${b}`,
  };
}

/** Parse a source money string. Returns null for blank / non-numeric. */
function parseMoney(s) {
  if (s == null) return null;
  const t = String(s).replace(/[$,\s]/g, '');
  if (t === '' || !/^-?\d+(\.\d+)?$/.test(t)) return null;
  return Number(t);
}

/** The source publishes bilingual names as "English | Français"; keep the English part. */
function englishPart(s) {
  return String(s == null ? '' : s).split('|')[0].trim();
}

function normalizeVendor(s) {
  return String(s == null ? '' : s).toLowerCase().replace(/[^a-z0-9]+/g, '');
}

/** Ascending order of disclosure recency: reporting period, then source row id. */
function compareDisclosure(a, b) {
  if (a.reporting_period !== b.reporting_period) return a.reporting_period < b.reporting_period ? -1 : 1;
  return Number(a._id) - Number(b._id);
}

/**
 * Keep the most recent disclosure of each contract.
 * Stage 1 key: procurement_id + vendor + department.
 * Stage 2 key (catches the same contract reported under a different
 * procurement_id formatting): vendor + original value + award date + delivery date.
 */
function dedupeLatestDisclosure(rows) {
  const latestBy = (list, keyFn) => {
    const m = new Map();
    for (const r of list) {
      const k = keyFn(r);
      if (k == null) { m.set(Symbol('unkeyed'), r); continue; }
      const prev = m.get(k);
      if (!prev || compareDisclosure(prev, r) < 0) m.set(k, r);
    }
    return [...m.values()];
  };
  const stage1 = latestBy(rows, (r) => `${String(r.procurement_id || '').trim()}|${normalizeVendor(r.vendor_name)}|${r.owner_org || englishPart(r.owner_org_title)}`);
  const stage2 = latestBy(stage1, (r) => {
    const ov = parseMoney(r.original_value);
    if (!ov || ov <= 0 || !r.contract_date || !r.delivery_date) return null;
    // Department is part of the key: this pass only catches a contract re-keyed WITHIN one
    // department. Two departments with parallel, identically-priced contracts stay separate.
    return `${normalizeVendor(r.vendor_name)}|${r.owner_org || englishPart(r.owner_org_title)}|${ov}|${r.contract_date}|${r.delivery_date}`;
  });
  return { rows: stage2, stage1Count: stage1.length, stage2Count: stage2.length };
}

/**
 * @param {any[]} rows raw source rows for the fiscal year
 * @param {{ size?: number }} [opts]
 */
function selectLargestContracts(rows, opts = {}) {
  const size = opts.size || SELECTION_SIZE;
  const parsed = [];
  let excludedNonPositive = 0;
  for (const r of rows) {
    const v = parseMoney(r.contract_value);
    if (v == null || v <= 0) { excludedNonPositive += 1; continue; }
    parsed.push({ ...r, _value: v });
  }
  const deduped = dedupeLatestDisclosure(parsed);
  const ranked = deduped.rows.sort((a, b) => b._value - a._value || compareDisclosure(b, a));
  const selected = ranked.slice(0, size).map((r, i) => ({ ...r, rank: i + 1 }));
  return {
    selected,
    stats: {
      rows_read: rows.length,
      excluded_non_positive_or_blank_value: excludedNonPositive,
      rows_with_positive_value: parsed.length,
      distinct_contracts_after_procurement_id_dedupe: deduped.stage1Count,
      distinct_contracts_after_secondary_dedupe: deduped.stage2Count,
      duplicate_disclosure_rows_removed: parsed.length - deduped.stage2Count,
      selected: selected.length,
      smallest_selected_value: selected.length ? selected[selected.length - 1]._value : null,
      selected_total_value: selected.reduce((s, r) => s + r._value, 0),
    },
  };
}

function buildSelectionMeta(selected, fiscalYear, nowIso) {
  const labels = fiscalYearLabels(fiscalYear);
  return {
    selection_label: `${selected.length} largest federal contracts disclosed in fiscal year ${labels.short}`,
    selection_fiscal_year: fiscalYear,
    selection_period: labels.range,
    selection_size: selected.length,
    selection_total_value: Math.round(selected.reduce((s, r) => s + r._value, 0) * 100) / 100,
    selection_basis: 'Total disclosed contract value (original plus amendments); the most recent disclosure of each contract is used.',
    selection_generated_at: nowIso,
  };
}

/** One `government_contracts` document. Field names match what renderContracts() reads. */
function buildContractDoc(row, meta) {
  const num = (s) => parseMoney(s);
  return {
    id: docIdForRank(row.rank),
    data: {
      // NOT 'CA' — deliberately. The sibling civic-voice-engine's monthly uploader
      // (uploadGovernmentContracts) DELETES every government_contracts document with
      // jurisdiction == 'CA' that is not in its own upload, and its weekly
      // aggregateContractStats function buckets totals by `jurisdiction`. With 'CA' these
      // 100 documents would be deleted as "stale" on the next engine run and would be
      // blended into the legacy Canadian totals. The Contracts page pages by document id
      // and never filters on this field, so a distinct value costs the UI nothing.
      jurisdiction: FED_SELECTION_JURISDICTION,
      country: 'CA',
      contractor_name: String(row.vendor_name || '').trim(),
      department: englishPart(row.owner_org_title),
      value: row._value,
      original_value: num(row.original_value),
      amendment_value: num(row.amendment_value),
      purpose: String(row.description_en || '').trim() || null,
      date: row.contract_date || null,
      // Fields the existing Contracts UI reads: the detail view uses
      // date_awarded/currency, and contract_value_type 'total' makes the list
      // card label the amount "total contract value".
      date_awarded: row.contract_date || null,
      currency: 'CAD',
      contract_value_type: 'total',
      start_date: row.contract_period_start || null,
      end_date: row.delivery_date || null,
      procurement_id: String(row.procurement_id || '').trim(),
      reference_number: row.reference_number || null,
      reporting_period: row.reporting_period || null,
      rank: row.rank,
      ...meta,
      source: `${DATASET.publisher} — ${DATASET.name}`,
      source_url: DATASET.url,
      licence: DATASET.licence,
      last_updated: meta.selection_generated_at,
    },
  };
}

async function getJson(url, fetchImpl) {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const r = await fetchImpl(url, { headers: { 'User-Agent': 'CivicVoice-FederalContracts/1.0' } });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return await r.json();
    } catch (err) {
      if (attempt === 3) throw err;
      await new Promise((res) => setTimeout(res, 1500 * attempt));
    }
  }
  return null;
}

/** Network: every source row for the fiscal year's four reporting quarters. */
async function fetchFiscalYearRows(fiscalYear = DEFAULT_FISCAL_YEAR, fetchImpl = globalThis.fetch) {
  const out = [];
  const perPeriod = {};
  for (const period of fiscalYearPeriods(fiscalYear)) {
    let offset = 0;
    let total = null;
    for (;;) {
      const u = new URL(CKAN_ACTION);
      u.searchParams.set('resource_id', DATASET.resourceId);
      u.searchParams.set('limit', String(PAGE_SIZE));
      u.searchParams.set('offset', String(offset));
      u.searchParams.set('fields', FETCH_FIELDS.join(','));
      u.searchParams.set('filters', JSON.stringify({ reporting_period: period }));
      u.searchParams.set('sort', '_id asc');
      const j = await getJson(u.toString(), fetchImpl);
      if (!j || !j.success) throw new Error(`CKAN returned no success for ${period}`);
      const recs = j.result.records;
      total = j.result.total;
      out.push(...recs);
      if (recs.length < PAGE_SIZE) break;
      offset += PAGE_SIZE;
    }
    perPeriod[period] = { fetched: out.filter((r) => r.reporting_period === period).length, reported_total: total };
    if (perPeriod[period].fetched !== total) throw new Error(`Incomplete fetch for ${period}: got ${perPeriod[period].fetched} of ${total}`);
  }
  return { rows: out, perPeriod };
}

module.exports = {
  DATASET,
  SELECTION_SIZE,
  DOC_ID_PREFIX,
  DEFAULT_FISCAL_YEAR,
  FED_SELECTION_JURISDICTION,
  docIdForRank,
  fiscalYearPeriods,
  fiscalYearLabels,
  parseMoney,
  englishPart,
  normalizeVendor,
  compareDisclosure,
  dedupeLatestDisclosure,
  selectLargestContracts,
  buildSelectionMeta,
  buildContractDoc,
  fetchFiscalYearRows,
};
