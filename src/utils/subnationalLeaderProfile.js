/**
 * Pilot live official leader profiles (CA-ON, US-CA, UK-ENG-LON, AU-NSW).
 */

export const PILOT_LEADER_PROFILE_JURISDICTION_IDS = Object.freeze([
  'CA-ON',
  'US-CA',
  'UK-ENG-LON',
  'AU-NSW',
]);

/** @param {unknown} v */
function trim(v) {
  if (v == null) return '';
  return String(v).trim();
}

/**
 * @param {Record<string, unknown>|null|undefined} row
 */
export function hasLiveOfficialLeaderProfile(row) {
  if (!row || typeof row !== 'object') return false;
  const id = trim(row.subnationalId || row.id);
  if (!id || !PILOT_LEADER_PROFILE_JURISDICTION_IDS.includes(id)) return false;
  if (row.leader_profile_live === true) return true;
  return !!trim(row.leader_profile_source_url);
}

/**
 * Copy official leader profile fields from a Firestore-backed explorer row.
 *
 * @param {Record<string, unknown>} out
 * @param {Record<string, unknown>|null|undefined} fsRow
 */
export function applyLeaderProfileFieldsFromFirestore(out, fsRow) {
  if (!out || !fsRow || typeof fsRow !== 'object') return;
  const keys = [
    'leader_office_contact',
    'leader_office_address',
    'leader_profile_source_url',
    'leader_profile_fetched_at',
    'leader_profile_live',
  ];
  for (let i = 0; i < keys.length; i += 1) {
    const k = keys[i];
    const v = trim(fsRow[k]);
    if (v) out[k] = v;
    else if (fsRow[k] === true) out[k] = true;
  }
}

/**
 * @param {Record<string, unknown>|null|undefined} item Explorer detail row
 */
export function leaderProfilePanelPayloadFromExplorerItem(item) {
  if (!item || typeof item !== 'object') return {};
  return {
    subnationalId: trim(item.subnationalId),
    leader_profile_live: item.leader_profile_live === true,
    leader_profile_source_url: trim(item.leader_profile_source_url),
    leader_profile_fetched_at: trim(item.leader_profile_fetched_at),
    leader_office_contact: trim(item.leader_office_contact),
    leader_office_address: trim(item.leader_office_address),
    officialWebsite: item.officialWebsite != null ? String(item.officialWebsite) : '',
  };
}
