/**
 * Provincial/state explorer — merge helpers for Firestore `subnational_jurisdictions`.
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
  if (lp) {
    if (isUSA) {
      out.govParty = lp;
      out.partyShort = usPartyShortFromLeaderParty(lp, hardcoded.partyShort);
    } else {
      out.party = lp;
    }
  }

  if (fsRow.id) out.subnationalId = fsRow.id;
  if (fsRow.country) out.subnationalCountry = fsRow.country;
  if (fsRow.jurisdictionType) out.jurisdictionType = fsRow.jurisdictionType;

  const dn = fsRow.name != null && String(fsRow.name).trim() ? String(fsRow.name).trim() : '';
  if (dn) out.displayName = dn;

  if (fsRow.abbreviation) out.subnationalAbbreviation = String(fsRow.abbreviation);

  if (fsRow.officialWebsite) out.officialWebsite = fsRow.officialWebsite;
  if (fsRow.legislatureWebsite) out.legislatureWebsite = String(fsRow.legislatureWebsite);

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

  return out;
}
