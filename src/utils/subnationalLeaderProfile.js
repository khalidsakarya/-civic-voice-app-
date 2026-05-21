/**
 * Official subnational leader profiles (government sources only).
 */

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
  if (row.leader_profile_live === true) return true;
  return !!trim(row.leader_profile_source_url);
}

/**
 * @param {Record<string, unknown>|null|undefined} row
 */
export function isSubnationalLeaderProfilePending(row) {
  return !hasLiveOfficialLeaderProfile(row);
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
 * Hide the generic provincial/state explorer illustrative banner when official data is live.
 * US-CA: hide when governor profile is synced from official sources.
 *
 * @param {Record<string, unknown>|null|undefined} item Explorer row (merged Firestore + seed)
 * @returns {boolean}
 */
export function shouldHideSubnationalIllustrativeExplorerNote(item) {
  if (!item || typeof item !== 'object') return false;
  if (item.subnationalId === 'US-CA' && hasLiveOfficialLeaderProfile(item)) return true;
  return false;
}

/**
 * Legislature chart is still the hardcoded seed breakdown (not Firestore party seats).
 *
 * @param {Record<string, unknown>|null|undefined} item
 * @returns {boolean}
 */
export function explorerLegislatureUsesHardcodedFallback(item) {
  if (!item || typeof item !== 'object') return true;
  const parties = item.legislature?.parties;
  return !(Array.isArray(parties) && parties.length > 0);
}

/**
 * @param {Record<string, unknown>|null|undefined} item Explorer detail row
 */
export function leaderProfilePanelPayloadFromExplorerItem(item) {
  if (!item || typeof item !== 'object') return {};
  return {
    subnationalId: trim(item.subnationalId || item.id),
    leader_profile_live: item.leader_profile_live === true,
    leader_profile_source_url: trim(item.leader_profile_source_url),
    leader_profile_fetched_at: trim(item.leader_profile_fetched_at),
    leader_office_contact: trim(item.leader_office_contact),
    leader_office_address: trim(item.leader_office_address),
    officialWebsite: item.officialWebsite != null ? String(item.officialWebsite) : '',
  };
}
