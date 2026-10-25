/**
 * Pure helpers for the Canadian federal Contracts page.
 *
 * The page shows a bounded selection (the largest disclosed federal
 * contracts for one fiscal year), written by
 * engine/canada-federal-contracts-write.cjs as documents
 * `government_contracts/ca-fed-contract-001 … -100`, in rank order.
 *
 * Reading strategy: the page pages by DOCUMENT ID (a built-in index — no
 * composite index, no rules change) and loads CA_FED_CONTRACTS_PAGE_SIZE
 * documents at a time, so opening the page costs 20 reads, not 100.
 *
 * Every figure the page shows about the selection (its size, its combined
 * value, its fiscal year) is read from the documents' own `selection_*`
 * fields, so the scope is stated by the data and cannot drift from it.
 */

export const CA_FED_CONTRACTS_COLLECTION = 'government_contracts';
export const CA_FED_CONTRACT_ID_FIRST = 'ca-fed-contract-001';
/** Upper bound of the id range; any id in 'ca-fed-contract-001'…'ca-fed-contract-999' is ours. */
export const CA_FED_CONTRACT_ID_LAST = 'ca-fed-contract-999';
export const CA_FED_CONTRACTS_PAGE_SIZE = 20;

const toDate = (v) => {
  if (!v) return null;
  const d = v && typeof v.toDate === 'function' ? v.toDate() : new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
};

/**
 * Active / Completed from the contract's end date (the "delivery date" in the
 * source), computed at view time so a stored status can never go stale.
 * A stored `status` still wins if a document has one. Returns null when
 * neither is available.
 * @param {{ status?: string, end_date?: string }} contract
 * @param {Date} [now]
 * @returns {'active'|'completed'|null}
 */
export function caFederalContractStatus(contract, now = new Date()) {
  const stored = contract && typeof contract.status === 'string' ? contract.status.trim().toLowerCase() : '';
  if (stored === 'active' || stored === 'completed') return stored;
  const end = toDate(contract && contract.end_date);
  if (!end) return null;
  // Compare by calendar day so a contract ending today is still active today.
  const endDay = Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate());
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return endDay >= today ? 'active' : 'completed';
}

/**
 * The selection's stated scope, read from the loaded documents. Null until
 * at least one document with selection metadata has loaded.
 * @param {Array<Record<string, any>>} items
 */
export function caFederalContractsScope(items) {
  const first = (items || []).find((c) => c && c.selection_size != null);
  if (!first) return null;
  const size = Number(first.selection_size);
  const total = Number(first.selection_total_value);
  return {
    label: first.selection_label || null,
    fiscalYear: first.selection_fiscal_year || null,
    period: first.selection_period || null,
    size: Number.isFinite(size) ? size : null,
    totalValue: Number.isFinite(total) ? total : null,
    basis: first.selection_basis || null,
    source: first.source || null,
    sourceUrl: first.source_url || null,
    licence: first.licence || null,
    generatedAt: first.selection_generated_at || null,
  };
}

/**
 * Whether there is nothing further to load: the page came back short, or we
 * have loaded as many documents as the selection says it contains.
 * @param {number} loadedCount documents loaded so far (including this page)
 * @param {number} lastPageCount documents returned by the page just read
 * @param {number|null} selectionSize from the documents' selection_size, if known
 * @param {number} [pageSize]
 */
export function caFederalContractsAllLoaded(loadedCount, lastPageCount, selectionSize, pageSize = CA_FED_CONTRACTS_PAGE_SIZE) {
  if (lastPageCount < pageSize) return true;
  return Number.isFinite(selectionSize) && selectionSize != null && loadedCount >= selectionSize;
}

/** "CA$11.2B" / "CA$109.1M" / "CA$850,000"; null for missing or zero. */
export function formatCadCompact(val) {
  if (val == null) return null;
  const v = Number(val);
  if (Number.isNaN(v) || v === 0) return null;
  if (v >= 1e9) return `CA$${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `CA$${(v / 1e6).toFixed(1)}M`;
  return `CA$${v.toLocaleString()}`;
}
