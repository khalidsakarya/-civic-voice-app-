/**
 * Provincial/state explorer — merge helpers for Firestore `subnational_jurisdictions`.
 * When present, `leader_party_short` overrides badge text (`partyShort`); otherwise hardcoded values remain.
 */

/** @param {string} partyStr @param {string} fallback */
export function usPartyShortFromLeaderParty(partyStr, fallback) {
  const u = (partyStr || '').toLowerCase();
  if (u.includes('republican')) return 'R';
  if (u.includes('democrat')) return 'D';
  return fallback;
}

/**
 * @param {Record<string, unknown>} hardcoded
 * @param {Record<string, unknown>} fsRow
 * @param {boolean} isUSA
 */
export function mergeProvincialExplorerRow(hardcoded, fsRow, isUSA) {
  if (!hardcoded) return hardcoded;
  if (!fsRow) return { ...hardcoded };

  const out = { ...hardcoded };

  const cap = typeof fsRow.capital === 'string' ? fsRow.capital.trim() : '';
  if (cap) out.capital = cap;

  const pop =
    fsRow.population_display != null && String(fsRow.population_display).trim()
      ? String(fsRow.population_display).trim()
      : '';
  if (pop) out.population = pop;

  const ln =
    fsRow.leader_name != null && String(fsRow.leader_name).trim()
      ? String(fsRow.leader_name).trim()
      : '';
  if (ln) {
    if (isUSA) out.governor = ln;
    else out.premier = ln;
  }

  const lp =
    fsRow.leader_party != null && String(fsRow.leader_party).trim()
      ? String(fsRow.leader_party).trim()
      : '';
  const fsPartyShort =
    fsRow.leader_party_short != null && String(fsRow.leader_party_short).trim()
      ? String(fsRow.leader_party_short).trim()
      : '';

  if (lp) {
    if (isUSA) {
      out.govParty = lp;
      out.partyShort = fsPartyShort || usPartyShortFromLeaderParty(lp, hardcoded.partyShort);
    } else {
      out.party = lp;
      if (fsPartyShort) out.partyShort = fsPartyShort;
    }
  } else if (fsPartyShort) {
    out.partyShort = fsPartyShort;
  }

  if (fsRow.id) out.subnationalId = fsRow.id;
  if (fsRow.country) out.subnationalCountry = fsRow.country;
  if (fsRow.jurisdictionType) out.jurisdictionType = fsRow.jurisdictionType;

  const dn = fsRow.name != null && String(fsRow.name).trim() ? String(fsRow.name).trim() : '';
  if (dn) out.displayName = dn;

  if (fsRow.abbreviation) out.subnationalAbbreviation = String(fsRow.abbreviation);

  if (fsRow.officialWebsite) out.officialWebsite = fsRow.officialWebsite;
  if (fsRow.legislatureWebsite) out.legislatureWebsite = String(fsRow.legislatureWebsite);

  const fsLt =
    fsRow.leaderTitle != null && String(fsRow.leaderTitle).trim()
      ? String(fsRow.leaderTitle).trim()
      : '';
  if (fsLt) out.leaderTitle = fsLt;

  const fsLegName =
    fsRow.legislatureName != null && String(fsRow.legislatureName).trim()
      ? String(fsRow.legislatureName).trim()
      : '';
  if (fsLegName) out.legislatureName = fsLegName;

  return out;
}

/**
 * @param {string} flagCode e.g. `ca-on`, `us-tx`
 * @returns {string} Uppercase postal abbreviation
 */
export function abbreviationFromExplorerFlagCode(flagCode) {
  if (!flagCode || typeof flagCode !== 'string') return '';
  const parts = flagCode.split('-');
  return (parts[parts.length - 1] || '').toUpperCase();
}

/** Postal abbreviations required for Australian state/territory explorer overlay (must match hardcoded rows). */
export const AU_EXPLORER_REQUIRED_ABBR = Object.freeze([
  'NSW',
  'VIC',
  'QLD',
  'WA',
  'SA',
  'TAS',
  'ACT',
  'NT',
]);

/**
 * Merge Firestore AU row into hardcoded Australian explorer row (`leader` / `party`; keep `partyShort` for badges).
 *
 * @param {Record<string, unknown>} hardcoded
 * @param {Record<string, unknown>} fsRow
 */
export function mergeAustralianExplorerRow(hardcoded, fsRow) {
  if (!hardcoded) return hardcoded;
  if (!fsRow) return { ...hardcoded };

  const out = { ...hardcoded };

  const cap = typeof fsRow.capital === 'string' ? fsRow.capital.trim() : '';
  if (cap) out.capital = cap;

  const pop =
    fsRow.population_display != null && String(fsRow.population_display).trim()
      ? String(fsRow.population_display).trim()
      : '';
  if (pop) out.population = pop;

  const ln =
    fsRow.leader_name != null && String(fsRow.leader_name).trim()
      ? String(fsRow.leader_name).trim()
      : '';
  if (ln) out.leader = ln;

  const lp =
    fsRow.leader_party != null && String(fsRow.leader_party).trim()
      ? String(fsRow.leader_party).trim()
      : '';
  if (lp) out.party = lp;

  if (fsRow.id) out.subnationalId = fsRow.id;
  if (fsRow.country) out.subnationalCountry = fsRow.country;
  if (fsRow.jurisdictionType) out.jurisdictionType = fsRow.jurisdictionType;

  const dn = fsRow.name != null && String(fsRow.name).trim() ? String(fsRow.name).trim() : '';
  if (dn) out.displayName = dn;

  if (fsRow.abbreviation) out.subnationalAbbreviation = String(fsRow.abbreviation);

  if (fsRow.officialWebsite) out.officialWebsite = fsRow.officialWebsite;
  if (fsRow.legislatureWebsite) out.legislatureWebsite = String(fsRow.legislatureWebsite);

  const fsLt =
    fsRow.leaderTitle != null && String(fsRow.leaderTitle).trim()
      ? String(fsRow.leaderTitle).trim()
      : '';
  if (fsLt) out.leaderTitle = fsLt;

  const fsLegName =
    fsRow.legislatureName != null && String(fsRow.legislatureName).trim()
      ? String(fsRow.legislatureName).trim()
      : '';
  if (fsLegName && out.legislature && typeof out.legislature === 'object') {
    out.legislature = { ...out.legislature, name: fsLegName };
  }

  const fsPartyShort =
    fsRow.leader_party_short != null && String(fsRow.leader_party_short).trim()
      ? String(fsRow.leader_party_short).trim()
      : '';
  if (fsPartyShort) out.partyShort = fsPartyShort;

  return out;
}

/** Document ids expected for `country === 'UK'` (4 nations + 9 England regions) — matches seed layout. */
export const UK_FIRESTORE_REQUIRED_IDS = Object.freeze([
  'UK-SCT',
  'UK-WLS',
  'UK-NIR',
  'UK-ENG',
  'UK-ENG-NE',
  'UK-ENG-NW',
  'UK-ENG-YOR',
  'UK-ENG-EM',
  'UK-ENG-WM',
  'UK-ENG-EE',
  'UK-ENG-LON',
  'UK-ENG-SE',
  'UK-ENG-SW',
]);

/** Maps hardcoded England statistical region `id` → Firestore document id. */
export const UK_APP_REGION_ID_TO_FIRESTORE_ID = Object.freeze({
  'north-east': 'UK-ENG-NE',
  'north-west': 'UK-ENG-NW',
  yorkshire: 'UK-ENG-YOR',
  'east-midlands': 'UK-ENG-EM',
  'west-midlands': 'UK-ENG-WM',
  'east-of-england': 'UK-ENG-EE',
  london: 'UK-ENG-LON',
  'south-east': 'UK-ENG-SE',
  'south-west': 'UK-ENG-SW',
});

/**
 * Resolve Firestore row for a hardcoded England region card (id match first, then name / aliases).
 *
 * @param {Record<string, unknown>} region
 * @param {Record<string, unknown>|null} byIdMap
 * @param {unknown[]} ukRows
 */
export function findUkEnglandRegionFirestoreRow(region, byIdMap, ukRows) {
  if (!region || !byIdMap || !Array.isArray(ukRows)) return null;
  const pref = UK_APP_REGION_ID_TO_FIRESTORE_ID[region.id];
  if (pref && byIdMap[pref]) return byIdMap[pref];

  const norm = (s) => String(s).trim().toLowerCase();
  const rn = norm(region.name);
  const ra = region.abbr != null ? String(region.abbr).trim().toUpperCase() : '';

  for (let i = 0; i < ukRows.length; i += 1) {
    const row = ukRows[i];
    if (!row || typeof row !== 'object') continue;
    const rid = row.id != null ? String(row.id) : '';
    if (!rid.startsWith('UK-ENG-')) continue;
    if (row.slug != null && norm(row.slug) === norm(region.id)) return row;
    const fab = row.abbreviation != null ? String(row.abbreviation).trim().toUpperCase() : '';
    if (ra && fab && fab === ra) return row;
  }

  for (let i = 0; i < ukRows.length; i += 1) {
    const row = ukRows[i];
    if (!row || typeof row !== 'object') continue;
    const rid = row.id != null ? String(row.id) : '';
    if (!rid.startsWith('UK-ENG-')) continue;
    if (norm(row.name || '') === rn) return row;
    const aliases = Array.isArray(row.aliases) ? row.aliases : [];
    if (aliases.some((a) => norm(a) === rn)) return row;
    if (
      row.name &&
      region.name &&
      String(row.name).localeCompare(String(region.name), 'en', { sensitivity: 'base' }) === 0
    ) {
      return row;
    }
  }
  return null;
}

/**
 * Merge Firestore UK England-region row into hardcoded explorer object.
 * Does not overlay leader fields when there is no elected regional mayor (avoids PM/Westminster proxy replacing curated copy).
 *
 * @param {Record<string, unknown>} hardcoded
 * @param {Record<string, unknown>|null|undefined} fsRow
 */
export function mergeUkEnglandRegionRow(hardcoded, fsRow) {
  if (!hardcoded) return hardcoded;
  if (!fsRow) return { ...hardcoded };

  const out = { ...hardcoded };

  const cap = typeof fsRow.capital === 'string' ? fsRow.capital.trim() : '';
  if (cap) out.capital = cap;

  const pop =
    fsRow.population_display != null && String(fsRow.population_display).trim()
      ? String(fsRow.population_display).trim()
      : '';
  if (pop) out.population = pop;

  const mayor = !!hardcoded.hasRegionalMayor;
  if (mayor) {
    const ln =
      fsRow.leader_name != null && String(fsRow.leader_name).trim()
        ? String(fsRow.leader_name).trim()
        : '';
    if (ln) out.leader = ln;

    const lp =
      fsRow.leader_party != null && String(fsRow.leader_party).trim()
        ? String(fsRow.leader_party).trim()
        : '';
    if (lp) out.leaderParty = lp;
  }

  if (fsRow.id) out.subnationalId = fsRow.id;
  if (fsRow.country) out.subnationalCountry = fsRow.country;
  if (fsRow.jurisdictionType) out.jurisdictionType = fsRow.jurisdictionType;

  const dn = fsRow.name != null && String(fsRow.name).trim() ? String(fsRow.name).trim() : '';
  if (dn) out.displayName = dn;

  if (fsRow.abbreviation) out.subnationalAbbreviation = String(fsRow.abbreviation);

  if (fsRow.officialWebsite) out.officialWebsite = fsRow.officialWebsite;
  if (fsRow.legislatureWebsite) out.legislatureWebsite = String(fsRow.legislatureWebsite);

  const fsLt =
    fsRow.leaderTitle != null && String(fsRow.leaderTitle).trim()
      ? String(fsRow.leaderTitle).trim()
      : '';
  if (fsLt) out.leaderTitle = fsLt;

  const fsLegName =
    fsRow.legislatureName != null && String(fsRow.legislatureName).trim()
      ? String(fsRow.legislatureName).trim()
      : '';
  if (fsLegName) out.legislatureName = fsLegName;

  return out;
}
