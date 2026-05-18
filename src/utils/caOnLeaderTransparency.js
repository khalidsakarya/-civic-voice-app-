/**
 * CA-ON official leader transparency — UI helpers (Firestore `subnational_leader_transparency/CA-ON`).
 */

export const CA_ON_JURISDICTION_ID = 'CA-ON';

export const FRAMEWORK_ONLY_NOTE =
  'Official framework available; individual values require manual review.';

export const CA_ON_TRANSPARENCY_SECTIONS = Object.freeze([
  { key: 'salary', label: 'Salary' },
  { key: 'conflict_of_interest_filings', label: 'Conflict of interest — OICO reports' },
  { key: 'financial_disclosure', label: 'Financial disclosure' },
  { key: 'declared_assets', label: 'Declared assets' },
  { key: 'stock_holdings', label: 'Stock holdings' },
  { key: 'gifts_hospitality', label: 'Gifts & hospitality' },
  { key: 'campaign_finance', label: 'Campaign finance' },
  { key: 'lobbying_records', label: 'Lobbying records' },
  { key: 'recent_official_activity', label: 'Recent official activity' },
]);

/** @param {unknown} v */
function trim(v) {
  if (v == null) return '';
  return String(v).trim();
}

/** @param {unknown} v */
function isNonEmptyObject(v) {
  return v && typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length > 0;
}

/**
 * @param {string} sectionKey
 * @param {Record<string, unknown>|null|undefined} row
 */
export function caOnTransparencySectionLoaded(sectionKey, row) {
  if (!row || typeof row !== 'object') return false;

  switch (sectionKey) {
    case 'salary':
      return isNonEmptyObject(row.salary);
    case 'campaign_finance':
      return isNonEmptyObject(row.campaign_finance);
    case 'recent_official_activity':
      return Array.isArray(row.recent_official_activity) && row.recent_official_activity.length > 0;
    case 'conflict_of_interest_filings': {
      const inquiries = row.conflict_of_interest_filings?.inquiries;
      return Array.isArray(inquiries) && inquiries.length > 0;
    }
    case 'financial_disclosure':
      return isNonEmptyObject(row.financial_disclosure);
    case 'declared_assets':
      return isNonEmptyObject(row.declared_assets);
    case 'gifts_hospitality':
      return isNonEmptyObject(row.gifts_hospitality);
    case 'lobbying_records':
      return isNonEmptyObject(row.lobbying_records);
    case 'stock_holdings':
      return isNonEmptyObject(row.stock_holdings);
    default:
      return false;
  }
}

/**
 * @param {Record<string, unknown>} out
 * @param {Record<string, unknown>|null|undefined} fsRow
 */
export function applyCaOnLeaderTransparencyFields(out, fsRow) {
  if (!out || !fsRow || typeof fsRow !== 'object') return;
  const keys = [
    'conflict_of_interest_filings',
    'financial_disclosure',
    'declared_assets',
    'gifts_hospitality',
    'lobbying_records',
    'stock_holdings',
    'data_completeness_note',
    'data_status',
    'sources_inaccessible',
    'sources_confirmed',
    'regulatory_act',
    'regulatory_body',
    'last_updated',
    'fetched_at',
  ];
  for (let i = 0; i < keys.length; i += 1) {
    const k = keys[i];
    const v = fsRow[k];
    if (v === undefined || v === null) continue;
    if (Array.isArray(v) && !v.length) continue;
    if (typeof v === 'object' && !Array.isArray(v) && !Object.keys(v).length) continue;
    out[k] = v;
  }
}

/** @param {Record<string, unknown>|null|undefined} block */
export function caOnNeedsManualReview(block) {
  if (!block || typeof block !== 'object') return false;
  const list = block.needs_manual_review;
  return Array.isArray(list) && list.length > 0;
}

/** @param {Record<string, unknown>|null|undefined} block */
export function caOnSourceUrl(block) {
  if (!block || typeof block !== 'object') return '';
  return trim(block.source_url || block.portal);
}

/**
 * @param {unknown} value
 * @param {string} [currency]
 */
export function formatMoney(value, currency = 'CAD') {
  const n = Number(value);
  if (!Number.isFinite(n)) return trim(value);
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(n);
}
