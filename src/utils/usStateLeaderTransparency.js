/**
 * US state governor transparency — UI helpers (Firestore `subnational_leader_transparency/US-XX`).
 * Summary-first display for framework/status, news, and contact fields.
 */

export const US_STATE_FRAMEWORK_NOTE =
  'Official framework available; detailed filings require manual review.';

const STATUS_LABELS = Object.freeze({
  official_framework: 'Official framework',
  needs_manual_review: 'Needs manual review',
  source_blocked: 'Source blocked',
  no_official_records_found: 'No official records found',
  official_bulk_register_pdf: 'Official bulk register (PDF)',
  no_public_endpoint: 'No public online endpoint',
  filed: 'Filed',
  pending_batch: 'Pending configuration',
});

/** @param {unknown} v */
function trim(v) {
  if (v == null) return '';
  return String(v).trim();
}

/** @param {unknown} status */
export function formatTransparencyStatus(status) {
  const key = trim(status);
  if (!key) return '';
  return STATUS_LABELS[key] || key.replace(/_/g, ' ');
}

/**
 * @param {Record<string, unknown>|null|undefined} section
 */
export function usStateSectionHasRowData(section) {
  if (!section || typeof section !== 'object') return false;
  if (Array.isArray(section)) return section.length > 0;
  const rows = section.rows || section.items;
  if (Array.isArray(rows) && rows.length > 0) return true;
  const rowCount = Number(section.row_count);
  return Number.isFinite(rowCount) && rowCount > 0;
}

/**
 * @param {Record<string, unknown>|null|undefined} section
 */
export function usStateSectionIsFrameworkOnly(section) {
  if (!section || typeof section !== 'object' || Array.isArray(section)) return false;
  if (usStateSectionHasRowData(section)) return false;
  const status = trim(section.status);
  return (
    !status ||
    status === 'official_framework' ||
    status === 'needs_manual_review' ||
    status === 'source_blocked' ||
    status === 'no_official_records_found' ||
    status === 'official_bulk_register_pdf' ||
    status === 'no_public_endpoint'
  );
}

/**
 * @param {Record<string, unknown>|null|undefined} row
 */
export function hasUsStateLeaderTransparency(row) {
  if (!row || typeof row !== 'object') return false;
  if (row.transparency_live === true) return true;
  const avail = row.sections_available;
  return Array.isArray(avail) && avail.length > 0;
}

/**
 * @param {Record<string, unknown>|null|undefined} row
 * @param {string} key
 */
export function usStateTransparencySourceUrl(row, key) {
  const fs = row?.field_sources;
  if (fs && typeof fs === 'object' && fs[key]) return trim(fs[key]);
  const section = row?.[key];
  if (section && typeof section === 'object' && !Array.isArray(section)) {
    return trim(section.source_url || section.portal);
  }
  return '';
}
