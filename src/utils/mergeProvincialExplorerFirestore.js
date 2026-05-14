/**
 * Provincial/state explorer — merge helpers for Firestore `subnational_jurisdictions`.
 * When present, `leader_party_short` overrides badge text (`partyShort`); otherwise hardcoded values remain.
 */

/** @param {unknown} v */
function trimString(v) {
  if (v == null) return '';
  const s = String(v).trim();
  return s;
}

/**
 * @param {Record<string, unknown>} fsRow
 * @returns {{ name: string, totalSeats: number, parties: { name: string, seats: number, color: string }[] } | null}
 */
export function buildLegislatureFromSubnationalFirestore(fsRow) {
  if (!fsRow || typeof fsRow !== 'object') return null;
  const rawBreakdown = fsRow.legislature_party_breakdown;
  if (!Array.isArray(rawBreakdown) || rawBreakdown.length === 0) return null;

  const parties = [];
  for (let i = 0; i < rawBreakdown.length; i += 1) {
    const entry = rawBreakdown[i];
    if (!entry || typeof entry !== 'object') continue;
    const o = /** @type {Record<string, unknown>} */ (entry);
    const seats = Number(o.seats);
    if (!Number.isFinite(seats) || seats < 0) continue;
    const name = trimString(o.name || o.party || o.label);
    if (!name) continue;
    const colorRaw = trimString(o.color);
    const color = colorRaw || '#6B7280';
    parties.push({ name, seats: Math.round(seats), color });
  }
  if (!parties.length) return null;

  const totalFromDoc = Number(fsRow.legislature_total_seats);
  const summed = parties.reduce((s, p) => s + p.seats, 0);
  const totalSeats =
    Number.isFinite(totalFromDoc) && totalFromDoc > 0 ? Math.round(totalFromDoc) : summed;
  if (!totalSeats) return null;

  const legName = trimString(fsRow.legislatureName) || 'Legislature';
  return { name: legName, totalSeats, parties };
}

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
      out.partyShort = fsPartyShort || String(hardcoded.partyShort || '');
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

  const flagFs = trimString(fsRow.flagUrl);
  if (flagFs) out.flagUrl = flagFs;

  const bioFs = trimString(fsRow.leader_bio);
  if (bioFs) out.bio = bioFs;

  const sinceFs = trimString(fsRow.leader_since);
  if (sinceFs) out.since = sinceFs;

  const dlt = trimString(fsRow.deputy_leader_title);
  if (dlt) out.ltGovTitle = dlt;
  const dln = trimString(fsRow.deputy_leader_name);
  if (dln) out.ltGovernor = dln;
  const dlp = trimString(fsRow.deputy_leader_party);
  if (dlp) out.ltGovParty = dlp;
  const dls = trimString(fsRow.deputy_leader_since);
  if (dls) out.ltGovSince = dls;
  const dlb = trimString(fsRow.deputy_leader_bio);
  if (dlb) out.ltGovBio = dlb;

  const legFs = buildLegislatureFromSubnationalFirestore(fsRow);
  if (legFs) out.legislature = legFs;

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

/**
 * US/CA provincial explorer row: Firestore `subnational_jurisdictions` is primary; hardcoded seed fills gaps.
 *
 * @param {Record<string, unknown>} fsRow
 * @param {Record<string, unknown>} hardcoded
 * @param {boolean} isUSA
 */
export function buildProvincialExplorerRowFromFirestoreWithHardcodedFallback(
  fsRow,
  hardcoded,
  isUSA,
) {
  if (!hardcoded) return hardcoded;
  if (!fsRow || typeof fsRow !== 'object') return { ...hardcoded };

  const ts = trimString;

  const abbrFs =
    fsRow.abbreviation != null && String(fsRow.abbreviation).trim()
      ? String(fsRow.abbreviation).trim().toUpperCase()
      : '';
  const abbrFromFlag = abbreviationFromExplorerFlagCode(String(hardcoded.flagCode || ''));

  const out = {
    name: ts(fsRow.name) || String(hardcoded.name || ''),
    capital: ts(fsRow.capital) || String(hardcoded.capital || ''),
    flagCode: String(hardcoded.flagCode || ''),
  };

  if (isUSA) {
    out.governor = ts(fsRow.leader_name) || String(hardcoded.governor || '');
    const lp = ts(fsRow.leader_party) || String(hardcoded.govParty || '');
    out.govParty = lp;
    out.partyShort =
      ts(fsRow.leader_party_short) ||
      usPartyShortFromLeaderParty(lp, String(hardcoded.partyShort || ''));
    const pop =
      fsRow.population_display != null && String(fsRow.population_display).trim()
        ? String(fsRow.population_display).trim()
        : '';
    if (pop) out.population = pop;
    else if (hardcoded.population) out.population = hardcoded.population;
  } else {
    out.population =
      fsRow.population_display != null && String(fsRow.population_display).trim()
        ? String(fsRow.population_display).trim()
        : String(hardcoded.population || '');
    out.premier = ts(fsRow.leader_name) || String(hardcoded.premier || '');
    out.party = ts(fsRow.leader_party) || String(hardcoded.party || '');
    out.partyShort =
      ts(fsRow.leader_party_short) || String(hardcoded.partyShort || '');
  }

  out.since = ts(fsRow.leader_since) || String(hardcoded.since || '');
  out.bio = ts(fsRow.leader_bio) || String(hardcoded.bio || '');
  out.ltGovTitle = ts(fsRow.deputy_leader_title) || String(hardcoded.ltGovTitle || '');
  out.ltGovernor = ts(fsRow.deputy_leader_name) || String(hardcoded.ltGovernor || '');
  out.ltGovParty = ts(fsRow.deputy_leader_party) || String(hardcoded.ltGovParty || '');
  out.ltGovSince = ts(fsRow.deputy_leader_since) || String(hardcoded.ltGovSince || '');
  out.ltGovBio = ts(fsRow.deputy_leader_bio) || String(hardcoded.ltGovBio || '');

  if (fsRow.id) out.subnationalId = fsRow.id;
  if (fsRow.country) out.subnationalCountry = fsRow.country;
  if (fsRow.jurisdictionType) out.jurisdictionType = fsRow.jurisdictionType;

  out.displayName =
    ts(fsRow.name) || String(hardcoded.displayName || hardcoded.name || '');
  out.subnationalAbbreviation =
    abbrFs ||
    String(hardcoded.subnationalAbbreviation || abbrFromFlag || '').toUpperCase();

  if (fsRow.officialWebsite !== undefined && fsRow.officialWebsite !== null) {
    out.officialWebsite = fsRow.officialWebsite;
  } else if (hardcoded.officialWebsite !== undefined) {
    out.officialWebsite = hardcoded.officialWebsite;
  }

  const legWs = ts(fsRow.legislatureWebsite);
  if (legWs) out.legislatureWebsite = legWs;
  else if (hardcoded.legislatureWebsite) out.legislatureWebsite = hardcoded.legislatureWebsite;

  const fsLt = ts(fsRow.leaderTitle);
  if (fsLt) out.leaderTitle = fsLt;
  else if (hardcoded.leaderTitle) out.leaderTitle = hardcoded.leaderTitle;

  const fsLegNameOnly = ts(fsRow.legislatureName);
  if (fsLegNameOnly) out.legislatureName = fsLegNameOnly;
  else if (hardcoded.legislatureName) out.legislatureName = hardcoded.legislatureName;

  const legFs = buildLegislatureFromSubnationalFirestore(fsRow);
  if (legFs && legFs.parties && legFs.parties.length) {
    out.legislature = legFs;
  } else if (hardcoded.legislature && typeof hardcoded.legislature === 'object') {
    out.legislature = { ...hardcoded.legislature };
    if (fsLegNameOnly) {
      out.legislature = { ...out.legislature, name: fsLegNameOnly };
    }
  }

  const flagFs = ts(fsRow.flagUrl);
  if (flagFs) out.flagUrl = flagFs;

  return out;
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

/** Label fallback when neither Firestore nor seed supplies `leaderTitle` (states vs territories). */
function defaultAustralianExplorerLeaderTitle(abbr) {
  const u = String(abbr || '').trim().toUpperCase();
  if (u === 'ACT' || u === 'NT') return 'Chief Minister';
  if (
    u === 'NSW' ||
    u === 'VIC' ||
    u === 'QLD' ||
    u === 'WA' ||
    u === 'SA' ||
    u === 'TAS'
  ) {
    return 'Premier';
  }
  return '';
}

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
  const abbrForLt = String(
    (fsRow.abbreviation != null && String(fsRow.abbreviation).trim()
      ? String(fsRow.abbreviation).trim()
      : String(hardcoded.abbr || '')),
  ).toUpperCase();
  out.leaderTitle =
    fsLt ||
    String(hardcoded.leaderTitle || '') ||
    defaultAustralianExplorerLeaderTitle(abbrForLt);

  const fsLegName =
    fsRow.legislatureName != null && String(fsRow.legislatureName).trim()
      ? String(fsRow.legislatureName).trim()
      : '';

  const flagFs = trimString(fsRow.flagUrl);
  if (flagFs) out.flagUrl = flagFs;

  const bioFs = trimString(fsRow.leader_bio);
  if (bioFs) out.bio = bioFs;

  const sinceFs = trimString(fsRow.leader_since);
  if (sinceFs) out.since = sinceFs;

  const dlt = trimString(fsRow.deputy_leader_title);
  if (dlt) out.deputyTitle = dlt;
  const dln = trimString(fsRow.deputy_leader_name);
  if (dln) out.deputy = dln;
  const dlp = trimString(fsRow.deputy_leader_party);
  if (dlp) out.deputyParty = dlp;
  const dls = trimString(fsRow.deputy_leader_since);
  if (dls) out.deputySince = dls;
  const dlb = trimString(fsRow.deputy_leader_bio);
  if (dlb) out.deputyBio = dlb;

  const legFs = buildLegislatureFromSubnationalFirestore(fsRow);
  if (legFs) {
    out.legislature = legFs;
  } else if (fsLegName && out.legislature && typeof out.legislature === 'object') {
    out.legislature = { ...out.legislature, name: fsLegName };
  }

  const fsPartyShort =
    fsRow.leader_party_short != null && String(fsRow.leader_party_short).trim()
      ? String(fsRow.leader_party_short).trim()
      : '';
  out.partyShort = fsPartyShort || String(hardcoded.partyShort || '');

  return out;
}

/**
 * Australian explorer row with Firestore as the primary source: each UI field prefers
 * normalized `subnational_jurisdictions` values; the hardcoded seed row fills only gaps.
 *
 * @param {Record<string, unknown>} fsRow
 * @param {Record<string, unknown>} hardcoded
 */
export function buildAustralianExplorerRowFromFirestoreWithHardcodedFallback(
  fsRow,
  hardcoded,
) {
  if (!hardcoded) return hardcoded;
  if (!fsRow || typeof fsRow !== 'object') return { ...hardcoded };

  const ts = trimString;

  const abbrFs =
    fsRow.abbreviation != null && String(fsRow.abbreviation).trim()
      ? String(fsRow.abbreviation).trim().toUpperCase()
      : '';
  const abbr = abbrFs || String(hardcoded.abbr || '').toUpperCase();

  const out = {
    name: ts(fsRow.name) || String(hardcoded.name || ''),
    abbr,
    capital: ts(fsRow.capital) || String(hardcoded.capital || ''),
    population:
      fsRow.population_display != null && String(fsRow.population_display).trim()
        ? String(fsRow.population_display).trim()
        : String(hardcoded.population || ''),
    leader: ts(fsRow.leader_name) || String(hardcoded.leader || ''),
    leaderTitle:
      ts(fsRow.leaderTitle) ||
      String(hardcoded.leaderTitle || '') ||
      defaultAustralianExplorerLeaderTitle(abbr),
    party: ts(fsRow.leader_party) || String(hardcoded.party || ''),
    partyShort:
      ts(fsRow.leader_party_short) || String(hardcoded.partyShort || ''),
    since: ts(fsRow.leader_since) || String(hardcoded.since || ''),
    bio: ts(fsRow.leader_bio) || String(hardcoded.bio || ''),
    deputyTitle: ts(fsRow.deputy_leader_title) || String(hardcoded.deputyTitle || ''),
    deputy: ts(fsRow.deputy_leader_name) || String(hardcoded.deputy || ''),
    deputyParty: ts(fsRow.deputy_leader_party) || String(hardcoded.deputyParty || ''),
    deputySince: ts(fsRow.deputy_leader_since) || String(hardcoded.deputySince || ''),
    deputyBio: ts(fsRow.deputy_leader_bio) || String(hardcoded.deputyBio || ''),
  };

  if (fsRow.id) out.subnationalId = fsRow.id;
  if (fsRow.country) out.subnationalCountry = fsRow.country;
  if (fsRow.jurisdictionType) out.jurisdictionType = fsRow.jurisdictionType;

  const dn = ts(fsRow.name);
  out.displayName = dn || String(hardcoded.displayName || hardcoded.name || '');
  out.subnationalAbbreviation =
    abbrFs || String(hardcoded.subnationalAbbreviation || hardcoded.abbr || '').toUpperCase();

  if (fsRow.officialWebsite !== undefined && fsRow.officialWebsite !== null) {
    out.officialWebsite = fsRow.officialWebsite;
  } else if (hardcoded.officialWebsite !== undefined) {
    out.officialWebsite = hardcoded.officialWebsite;
  }

  const legWs = ts(fsRow.legislatureWebsite);
  if (legWs) out.legislatureWebsite = legWs;
  else if (hardcoded.legislatureWebsite) out.legislatureWebsite = hardcoded.legislatureWebsite;

  const legFs = buildLegislatureFromSubnationalFirestore(fsRow);
  if (legFs && legFs.parties && legFs.parties.length) {
    out.legislature = legFs;
  } else if (hardcoded.legislature && typeof hardcoded.legislature === 'object') {
    out.legislature = { ...hardcoded.legislature };
    const fsLegName = ts(fsRow.legislatureName);
    if (fsLegName) {
      out.legislature = { ...out.legislature, name: fsLegName };
    }
  }

  const flagFs = ts(fsRow.flagUrl);
  if (flagFs) out.flagUrl = flagFs;

  if (out.legislature === undefined && hardcoded.legislature) {
    out.legislature = { ...hardcoded.legislature };
  }

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

/** App `id` order for England region explorer cards (matches `englandRegions` array order). */
export const UK_EXPLORER_APP_REGION_IDS = Object.freeze([
  'north-east',
  'north-west',
  'yorkshire',
  'east-midlands',
  'west-midlands',
  'east-of-england',
  'london',
  'south-east',
  'south-west',
]);

/** UI label when `leaderTitle` is missing from Firestore and seed (England regions without a regional mayor). */
function defaultUkEnglandNonMayorLeaderTitle(hardcoded) {
  if (!hardcoded || hardcoded.hasRegionalMayor) return '';
  const id = String(hardcoded.id || '');
  if (id === 'north-west' || id === 'yorkshire') return 'Combined Authority Mayors';
  if (id === 'east-of-england' || id === 'south-east' || id === 'south-west') return 'No Regional Mayor';
  return '';
}

/**
 * England region explorer row: Firestore is primary; hardcoded `englandRegions` fills gaps.
 * When `hasRegionalMayor` is false, head-of-region name/party/since stay from hardcoded (same as merge).
 *
 * @param {Record<string, unknown>} fsRow
 * @param {Record<string, unknown>} hardcoded
 */
export function buildUkEnglandRegionRowFromFirestoreWithHardcodedFallback(
  fsRow,
  hardcoded,
) {
  if (!hardcoded) return hardcoded;
  if (!fsRow || typeof fsRow !== 'object') return { ...hardcoded };

  const ts = trimString;
  const mayor = !!hardcoded.hasRegionalMayor;
  const out = { ...hardcoded };

  out.capital = ts(fsRow.capital) || String(hardcoded.capital || '');

  const popFs =
    fsRow.population_display != null && String(fsRow.population_display).trim()
      ? String(fsRow.population_display).trim()
      : '';
  out.population = popFs || String(hardcoded.population || '');

  if (mayor) {
    out.leader = ts(fsRow.leader_name) || String(hardcoded.leader || '');
    out.leaderParty = ts(fsRow.leader_party) || String(hardcoded.leaderParty || '');
    out.leaderSince = ts(fsRow.leader_since) || String(hardcoded.leaderSince || '');
  }

  out.leaderBio = ts(fsRow.leader_bio) || String(hardcoded.leaderBio || '');
  out.leaderTitle =
    ts(fsRow.leaderTitle) ||
    String(hardcoded.leaderTitle || '') ||
    defaultUkEnglandNonMayorLeaderTitle(hardcoded);
  out.displayName = ts(fsRow.name) || String(hardcoded.displayName || hardcoded.name || '');

  const abbrFs =
    fsRow.abbreviation != null && String(fsRow.abbreviation).trim()
      ? String(fsRow.abbreviation).trim().toUpperCase()
      : '';
  out.subnationalAbbreviation =
    abbrFs || String(hardcoded.subnationalAbbreviation || hardcoded.abbr || '').trim();

  out.legislatureName =
    ts(fsRow.legislatureName) || String(hardcoded.legislatureName || '');

  if (fsRow.id) out.subnationalId = fsRow.id;
  if (fsRow.country) out.subnationalCountry = fsRow.country;
  if (fsRow.jurisdictionType) out.jurisdictionType = fsRow.jurisdictionType;

  if (fsRow.officialWebsite !== undefined && fsRow.officialWebsite !== null) {
    out.officialWebsite = fsRow.officialWebsite;
  } else if (hardcoded.officialWebsite !== undefined) {
    out.officialWebsite = hardcoded.officialWebsite;
  }

  out.legislatureWebsite =
    ts(fsRow.legislatureWebsite) || String(hardcoded.legislatureWebsite || '');

  const legFs = buildLegislatureFromSubnationalFirestore(fsRow);
  if (legFs && legFs.parties && legFs.parties.length) {
    out.legislature = legFs;
  }

  const flagFs = ts(fsRow.flagUrl);
  if (flagFs) out.flagUrl = flagFs;

  return out;
}

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
  if (!fsRow) {
    const out = { ...hardcoded };
    out.leaderTitle =
      String(hardcoded.leaderTitle || '') ||
      defaultUkEnglandNonMayorLeaderTitle(hardcoded);
    return out;
  }

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
  out.leaderTitle =
    fsLt ||
    String(hardcoded.leaderTitle || '') ||
    defaultUkEnglandNonMayorLeaderTitle(hardcoded);

  const fsLegName =
    fsRow.legislatureName != null && String(fsRow.legislatureName).trim()
      ? String(fsRow.legislatureName).trim()
      : '';
  if (fsLegName) out.legislatureName = fsLegName;

  const bioFs = trimString(fsRow.leader_bio);
  if (bioFs) out.leaderBio = bioFs;

  if (mayor) {
    const sinceFs = trimString(fsRow.leader_since);
    if (sinceFs) out.leaderSince = sinceFs;
  }

  const legFs = buildLegislatureFromSubnationalFirestore(fsRow);
  if (legFs) out.legislature = legFs;

  return out;
}
