/**
 * Official subnational leader transparency (pilot jurisdictions).
 */

export const PILOT_LEADER_TRANSPARENCY_IDS = Object.freeze([
  'CA-ON',
  'US-CA',
  'UK-ENG-LON',
  'AU-NSW',
]);

export const LEADER_TRANSPARENCY_SECTION_LABELS = Object.freeze({
  salary: 'Salary',
  financial_disclosure: 'Financial disclosure',
  assets: 'Declared assets',
  stock_holdings: 'Stock holdings',
  campaign_finance: 'Campaign finance',
  lobbying_disclosures: 'Lobbying disclosures',
  conflict_disclosures: 'Gifts & hospitality (official register)',
  recent_official_activity: 'Recent official activity',
});

/** @param {unknown} v */
function trim(v) {
  if (v == null) return '';
  return String(v).trim();
}

/**
 * @param {Record<string, unknown>|null|undefined} row
 */
export function hasLiveLeaderTransparency(row) {
  if (!row || typeof row !== 'object') return false;
  if (row.transparency_live === true) return true;
  const avail = row.sections_available;
  return Array.isArray(avail) && avail.length > 0;
}

/**
 * @param {string} sectionKey
 * @param {Record<string, unknown>|null|undefined} row
 */
export function leaderTransparencySectionLoaded(sectionKey, row) {
  if (!row || typeof row !== 'object') return false;
  const avail = row.sections_available;
  if (Array.isArray(avail) && avail.includes(sectionKey)) return true;
  const val = row[sectionKey];
  if (Array.isArray(val)) return val.length > 0;
  if (val && typeof val === 'object') return Object.keys(val).length > 0;
  return !!trim(val);
}

/**
 * @param {Record<string, unknown>} out
 * @param {Record<string, unknown>|null|undefined} fsRow
 */
export function applyLeaderTransparencyFieldsFromFirestore(out, fsRow) {
  if (!out || !fsRow || typeof fsRow !== 'object') return;
  const keys = [
    'transparency_live',
    'transparency_fetched_at',
    'sections_available',
    'sections_unavailable',
    'field_sources',
    'data_completeness_note',
    'salary',
    'financial_disclosure',
    'assets',
    'declared_assets',
    'stock_holdings',
    'campaign_finance',
    'lobbying_disclosures',
    'lobbying_records',
    'gifts_hospitality',
    'conflict_disclosures',
    'recent_official_activity',
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

/**
 * @param {Record<string, unknown>|null|undefined} item
 */
export function leaderTransparencyPayloadFromExplorerItem(item) {
  if (!item || typeof item !== 'object') return {};
  const subnationalId = trim(item.subnationalId || item.id);
  return {
    subnationalId,
    transparency_live: item.transparency_live === true,
    transparency_fetched_at: trim(item.transparency_fetched_at),
    sections_available: Array.isArray(item.sections_available) ? item.sections_available : [],
    sections_unavailable: Array.isArray(item.sections_unavailable) ? item.sections_unavailable : [],
    field_sources: item.field_sources && typeof item.field_sources === 'object' ? item.field_sources : {},
    salary: item.salary,
    financial_disclosure: item.financial_disclosure,
    assets: item.assets,
    stock_holdings: item.stock_holdings,
    campaign_finance: item.campaign_finance,
    lobbying_disclosures: item.lobbying_disclosures,
    conflict_disclosures: item.conflict_disclosures,
    recent_official_activity: item.recent_official_activity,
  };
}
