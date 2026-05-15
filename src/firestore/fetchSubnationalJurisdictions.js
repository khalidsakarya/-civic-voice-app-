/**
 * Client-side read helper for `subnational_jurisdictions`.
 * Callers merge with local seeds; treat narrative fields as unverified in UI until engine-sourced documents replace demo content.
 */

import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { SUBNATIONAL_JURISDICTIONS_COLLECTION } from '../constants/firestoreCollections';

/**
 * @typedef {Object} SubnationalJurisdictionRecord
 * @property {string} id
 * @property {string} country
 * @property {string} countryName
 * @property {string} jurisdictionType
 * @property {string} name
 * @property {string} abbreviation
 * @property {string} slug
 * @property {string[]} aliases
 * @property {string} capital
 * @property {string} leaderTitle
 * @property {string} legislatureName
 * @property {string|null} officialWebsite
 * @property {string} legislatureWebsite
 * @property {string} population_display
 * @property {number=} area_km2
 * @property {number=} population
 * @property {number=} populationRaw
 * @property {string} leader_name
 * @property {string} leader_party
 * @property {string} leader_party_short
 * @property {string=} leader_bio
 * @property {string=} leader_since
 * @property {string=} deputy_leader_title
 * @property {string=} deputy_leader_name
 * @property {string=} deputy_leader_party
 * @property {string=} deputy_leader_since
 * @property {string=} deputy_leader_bio
 * @property {number=} legislature_total_seats
 * @property {unknown[]=} legislature_party_breakdown
 * @property {string=} flagUrl
 * @property {string} source_name
 * @property {string} source_url
 * @property {string} last_updated
 * @property {string} dataStatus
 * @property {string[]=} needs_manual_review_fields Field keys the engine marked for manual review (subset of Firestore shapes).
 * @property {string[]=} needs_manual_review_primary_field_keys Keys from `needs_manual_review` / `needsManualReview`, plus Firestore `needs_manual_review_fields` **only when** the primary field yields no keys (canonical array fallback; still excludes per-field `*_needs_manual_review` / `*_data_status` expansions).
 */

/**
 * Expected document counts per country code after seed (reference for callers/tests).
 */
export const SUBNATIONAL_JURISDICTION_EXPECTED_COUNTS = Object.freeze({
  US: 51,
  CA: 13,
  AU: 8,
  UK: 13,
});

/**
 * @param {unknown} countryCode
 * @returns {string | null} Uppercase ISO-style country key used in Firestore (`US`, `CA`, `AU`, `UK`)
 */
function normalizeCountryCode(countryCode) {
  if (countryCode == null) return null;
  const s = String(countryCode).trim().toUpperCase();
  if (!s) return null;
  return s;
}

/** @param {unknown} v */
function truthyNeedsManualReviewValue(v) {
  if (v === true || v === 1) return true;
  const s = String(v).trim().toLowerCase();
  return s === 'needs_manual_review' || s === 'true' || s === '1' || s === 'yes';
}

/**
 * Keys listed only on Firestore `needs_manual_review` / `needsManualReview` (array or map).
 * Does not merge `leader_name_needs_manual_review`-style flags (those stay in {@link collectNeedsManualReviewFieldKeys} only).
 *
 * @param {Record<string, unknown>} raw
 * @returns {string[]}
 */
function collectPrimaryNeedsManualReviewFieldKeys(raw) {
  if (!raw || typeof raw !== 'object') return [];
  const out = new Set();

  const nmr = raw.needs_manual_review ?? raw.needsManualReview;
  if (Array.isArray(nmr)) {
    for (let i = 0; i < nmr.length; i += 1) {
      const k = String(nmr[i]).trim();
      if (k) out.add(k);
    }
  } else if (nmr && typeof nmr === 'object' && !Array.isArray(nmr)) {
    const entries = Object.entries(nmr);
    for (let i = 0; i < entries.length; i += 1) {
      const [k, v] = entries[i];
      if (!k) continue;
      if (v && typeof v === 'object' && !Array.isArray(v)) {
        const st = v.status != null ? String(v.status).trim().toLowerCase() : '';
        if (st === 'needs_manual_review' || truthyNeedsManualReviewValue(v)) out.add(k);
      } else if (truthyNeedsManualReviewValue(v)) {
        out.add(k);
      }
    }
  }

  // When verification stores the canonical list only on `needs_manual_review_fields` (array) and
  // `needs_manual_review` is absent/empty, still surface those keys — without merging per-field
  // `leader_name_needs_manual_review` (handled only in collectNeedsManualReviewFieldKeys).
  if (out.size === 0) {
    const fsList = raw.needs_manual_review_fields;
    if (Array.isArray(fsList)) {
      for (let i = 0; i < fsList.length; i += 1) {
        const k = String(fsList[i]).trim();
        if (k) out.add(k);
      }
    }
  }

  return [...out].sort((a, b) => a.localeCompare(b));
}

/**
 * Normalize Firestore manual-review signals into stable field keys (primary NMR plus per-field flags).
 *
 * @param {Record<string, unknown>} raw
 * @returns {string[]}
 */
function collectNeedsManualReviewFieldKeys(raw) {
  if (!raw || typeof raw !== 'object') return [];
  const out = new Set(collectPrimaryNeedsManualReviewFieldKeys(raw));

  const optionalFieldKeys = ['leader_name', 'leader_party', 'leader_since', 'leader_party_short'];
  for (let i = 0; i < optionalFieldKeys.length; i += 1) {
    const fk = optionalFieldKeys[i];
    if (truthyNeedsManualReviewValue(raw[`${fk}_needs_manual_review`])) out.add(fk);
    const st = raw[`${fk}_data_status`] != null ? String(raw[`${fk}_data_status`]).trim().toLowerCase() : '';
    if (st === 'needs_manual_review') out.add(fk);
  }

  return [...out].sort((a, b) => a.localeCompare(b));
}

/**
 * @param {string} docId
 * @param {Record<string, unknown>} raw
 * @returns {SubnationalJurisdictionRecord}
 */
function normalizeRecord(docId, raw) {
  const aliasesRaw = raw.aliases;
  const aliases = Array.isArray(aliasesRaw)
    ? aliasesRaw.map((a) => (a == null ? '' : String(a))).filter(Boolean)
    : [];

  const optTrim = (v) => {
    if (v == null) return '';
    const s = String(v).trim();
    return s;
  };

  /** @type {Record<string, unknown>} */
  const rec = {
    id: typeof raw.id === 'string' && raw.id ? raw.id : docId,
    country: raw.country != null ? String(raw.country) : '',
    countryName: raw.countryName != null ? String(raw.countryName) : '',
    jurisdictionType:
      raw.jurisdictionType != null ? String(raw.jurisdictionType) : '',
    name: raw.name != null ? String(raw.name) : '',
    abbreviation: raw.abbreviation != null ? String(raw.abbreviation) : '',
    slug: raw.slug != null ? String(raw.slug) : '',
    aliases,
    capital: raw.capital != null ? String(raw.capital) : '',
    leaderTitle: raw.leaderTitle != null ? String(raw.leaderTitle) : '',
    legislatureName:
      raw.legislatureName != null ? String(raw.legislatureName) : '',
    officialWebsite:
      raw.officialWebsite === undefined || raw.officialWebsite === null
        ? null
        : String(raw.officialWebsite),
    legislatureWebsite:
      raw.legislatureWebsite != null ? String(raw.legislatureWebsite) : '',
    population_display:
      raw.population_display != null ? String(raw.population_display) : '',
    leader_name: raw.leader_name != null ? String(raw.leader_name) : '',
    leader_party: raw.leader_party != null ? String(raw.leader_party) : '',
    leader_party_short:
      raw.leader_party_short != null ? String(raw.leader_party_short) : '',
    source_name: raw.source_name != null ? String(raw.source_name) : '',
    source_url: raw.source_url != null ? String(raw.source_url) : '',
    last_updated:
      raw.last_updated != null ? String(raw.last_updated) : '',
    dataStatus: raw.dataStatus != null ? String(raw.dataStatus) : '',
  };

  const lb = optTrim(raw.leader_bio);
  if (lb) rec.leader_bio = lb;
  const ls = optTrim(raw.leader_since);
  if (ls) rec.leader_since = ls;
  const dlt = optTrim(raw.deputy_leader_title);
  if (dlt) rec.deputy_leader_title = dlt;
  const dln = optTrim(raw.deputy_leader_name);
  if (dln) rec.deputy_leader_name = dln;
  const dlp = optTrim(raw.deputy_leader_party);
  if (dlp) rec.deputy_leader_party = dlp;
  const dls = optTrim(raw.deputy_leader_since);
  if (dls) rec.deputy_leader_since = dls;
  const dlb = optTrim(raw.deputy_leader_bio);
  if (dlb) rec.deputy_leader_bio = dlb;

  const totalSeatsRaw = Number(raw.legislature_total_seats);
  if (Number.isFinite(totalSeatsRaw) && totalSeatsRaw > 0) {
    rec.legislature_total_seats = Math.round(totalSeatsRaw);
  }

  if (Array.isArray(raw.legislature_party_breakdown) && raw.legislature_party_breakdown.length) {
    rec.legislature_party_breakdown = raw.legislature_party_breakdown.slice();
  }

  const flagFromDoc = optTrim(raw.flagUrl) || optTrim(raw.flag_url);
  if (flagFromDoc) rec.flagUrl = flagFromDoc;

  const areaKm2 = Number(raw.area_km2);
  if (Number.isFinite(areaKm2) && areaKm2 > 0) {
    rec.area_km2 = areaKm2;
  }

  const popNum = Number(raw.population);
  if (Number.isFinite(popNum) && popNum > 0) {
    rec.population = popNum;
  }

  const popRawNum = Number(raw.populationRaw);
  if (Number.isFinite(popRawNum) && popRawNum > 0) {
    rec.populationRaw = popRawNum;
  }

  const nmrFields = collectNeedsManualReviewFieldKeys(raw);
  if (nmrFields.length) {
    rec.needs_manual_review_fields = nmrFields;
  }

  rec.needs_manual_review_primary_field_keys = collectPrimaryNeedsManualReviewFieldKeys(raw);

  return /** @type {SubnationalJurisdictionRecord} */ (rec);
}

/**
 * Fetch subnational jurisdictions for a single country from Firestore.
 * Sorts by display name (locale `en`). On any error, returns an empty array (no throw).
 *
 * @param {string} countryCode e.g. `US`, `CA`, `AU`, `UK`
 * @returns {Promise<SubnationalJurisdictionRecord[]>}
 */
export async function fetchSubnationalJurisdictions(countryCode) {
  const country = normalizeCountryCode(countryCode);
  if (!country) return [];

  try {
    const q = query(
      collection(db, SUBNATIONAL_JURISDICTIONS_COLLECTION),
      where('country', '==', country),
    );
    const snap = await getDocs(q);
    const rows = [];
    snap.forEach((d) => {
      rows.push(normalizeRecord(d.id, d.data() || {}));
    });
    rows.sort((a, b) =>
      (a.name || '').localeCompare(b.name || '', 'en', { sensitivity: 'base' }),
    );
    return rows;
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.warn('[fetchSubnationalJurisdictions]', err);
    }
    return [];
  }
}
