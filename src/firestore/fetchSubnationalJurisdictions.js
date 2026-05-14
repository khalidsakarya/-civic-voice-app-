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
