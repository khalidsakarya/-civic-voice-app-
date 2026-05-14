/**
 * Read-only: `summary_stats` pre-aggregated docs for hub cards (avoids relying on full collection scans for headline counts).
 * Schema may evolve — extraction tries several common key shapes per doc.
 */

import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { SUMMARY_STATS_COLLECTION } from '../constants/firestoreCollections';

/**
 * @typedef {Object} SummaryStatsDashboardSlice
 * @property {number | null} departmentHeadsUS `department_heads` US roster (cabinet-style count) when present
 * @property {number | null} departmentsUS Federal departments / ministries count US
 * @property {number | null} departmentsCA Federal ministries count CA
 * @property {number | null} memberUSCongress House + Senate (or single congress roster) US
 * @property {number | null} memberCACommons House of Commons CA
 * @property {number | null} memberCASenate Senate CA
 * @property {number | null} memberCAParliament Commons + Senate when only a combined total exists
 * @property {number | null} contractsUS
 * @property {number | null} contractsCA
 * @property {number | null} contractsUK
 * @property {number | null} contractsAU
 * @property {number | null} memberUK Commons / lower-house headline when present
 * @property {number | null} memberAUHouse Representatives (lower house) when present
 * @property {number | null} memberAUTotal Federal parliamentarians / combined headline when present
 * @property {number | null} departmentsAU Federal departments count when present
 * @property {string | null} lastUpdatedIso Best-effort max of doc `last_updated` / `updated_at` fields
 */

/** @param {unknown} v */
function finiteNonNegativeInt(v) {
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0 || n > 5e6) return null;
  return Math.round(n);
}

/** @param {Record<string, unknown>|null|undefined} d @param {string[]} paths dot paths or single keys */
function firstIntFromDoc(d, paths) {
  if (!d || typeof d !== 'object') return null;
  for (let i = 0; i < paths.length; i += 1) {
    const p = paths[i];
    let cur = d;
    const parts = p.split('.');
    let ok = true;
    for (let j = 0; j < parts.length; j += 1) {
      if (!cur || typeof cur !== 'object') {
        ok = false;
        break;
      }
      cur = /** @type {Record<string, unknown>} */ (cur)[parts[j]];
    }
    if (!ok) continue;
    const n = finiteNonNegativeInt(cur);
    if (n != null) return n;
  }
  return null;
}

/** @param {Record<string, unknown>|null|undefined} d @param {string} jur e.g. US */
function intFromJurisdictionBlob(d, jur) {
  if (!d || typeof d !== 'object') return null;
  const U = jur.toUpperCase();
  const u = jur.toLowerCase();
  const blobs = [
    d.by_jurisdiction,
    d.byJurisdiction,
    d.jurisdictions,
    d.counts,
    d.totals,
    d.contracts_by_jurisdiction,
    d.contractsByJurisdiction,
  ];
  for (let i = 0; i < blobs.length; i += 1) {
    const b = blobs[i];
    if (!b || typeof b !== 'object') continue;
    const o = /** @type {Record<string, unknown>} */ (b);
    const n =
      finiteNonNegativeInt(o[U]) ??
      finiteNonNegativeInt(o[u]) ??
      finiteNonNegativeInt(o[`${U}_count`]) ??
      finiteNonNegativeInt(o[`count_${U}`]);
    if (n != null) return n;
  }
  return finiteNonNegativeInt(d[U]) ?? finiteNonNegativeInt(d[u]);
}

/** @param {Record<string, unknown>|null|undefined} d */
function pickLastUpdated(d) {
  if (!d || typeof d !== 'object') return null;
  const v =
    d.last_updated ??
    d.lastUpdated ??
    d.updated_at ??
    d.updatedAt ??
    d.synced_at ??
    d.generated_at;
  if (v == null) return null;
  const s = String(v).trim();
  return s || null;
}

/**
 * @param {import('firebase/firestore').DocumentSnapshot} snap
 * @returns {Record<string, unknown>|null}
 */
function snapData(snap) {
  if (!snap.exists()) return null;
  const d = snap.data();
  return d && typeof d === 'object' ? /** @type {Record<string, unknown>} */ (d) : null;
}

/**
 * Fetch `department_summary`, `member_stats`, and `contract_stats` once. Returns null on any hard failure.
 *
 * @returns {Promise<SummaryStatsDashboardSlice | null>}
 */
export async function fetchSummaryStatsDashboard() {
  try {
    const col = SUMMARY_STATS_COLLECTION;
    const [deptSnap, memberSnap, contractSnap] = await Promise.all([
      getDoc(doc(db, col, 'department_summary')),
      getDoc(doc(db, col, 'member_stats')),
      getDoc(doc(db, col, 'contract_stats')),
    ]);

    const departmentDoc = snapData(deptSnap);
    const memberDoc = snapData(memberSnap);
    const contractDoc = snapData(contractSnap);

    if (!departmentDoc && !memberDoc && !contractDoc) {
      return null;
    }

    const departmentHeadsUS = firstIntFromDoc(departmentDoc, [
      'department_heads_us',
      'departmentHeadsUS',
      'us_department_heads',
      'US_department_heads',
      'cabinet_heads_us',
      'totals.department_heads_us',
      'counts.US.department_heads',
    ]);

    const departmentsUS = firstIntFromDoc(departmentDoc, [
      'US',
      'us',
      'federal_departments_us',
      'federalDepartmentsUS',
      'departments_us',
      'department_count_us',
      'totals.US',
      'counts.departments.US',
    ]);

    const departmentsCA = firstIntFromDoc(departmentDoc, [
      'CA',
      'ca',
      'federal_ministries_ca',
      'ministries_ca',
      'department_count_ca',
      'totals.CA',
    ]);

    const memberUSCongress = firstIntFromDoc(memberDoc, [
      'US',
      'us',
      'us_congress_total',
      'US_congress_total',
      'congress_members_us',
      'congressMembersUS',
      'house_senate_total',
      'totals.US',
      'members.US',
    ]);

    const memberCACommons = firstIntFromDoc(memberDoc, [
      'CA_commons',
      'ca_commons',
      'commons_mps',
      'CA_MPs',
      'mps_ca',
      'house_of_commons',
      'totals.CA.commons',
    ]);

    const memberCASenate = firstIntFromDoc(memberDoc, [
      'CA_senate',
      'ca_senate',
      'senators_ca',
      'CA_senators',
      'senate_ca',
      'totals.CA.senate',
    ]);

    const memberCAParliament = firstIntFromDoc(memberDoc, [
      'CA_parliament',
      'ca_parliament',
      'CA_total',
      'ca_total',
      'parliament_ca',
      'totals.CA',
    ]);

    const memberUK = firstIntFromDoc(memberDoc, [
      'UK',
      'uk',
      'UK_commons',
      'commons_uk',
      'mps_uk',
      'house_of_commons_uk',
      'members.UK',
      'totals.UK',
    ]);

    const memberAUHouse = firstIntFromDoc(memberDoc, [
      'AU_house',
      'house_of_representatives_au',
      'house_reps_au',
      'members.AU.house',
      'totals.AU.house',
    ]);

    const memberAUTotal = firstIntFromDoc(memberDoc, [
      'AU_parliament',
      'AU_parliament_total',
      'AU_total',
      'au_parliament',
      'federal_parliament_au',
      'AU',
      'au',
      'members.AU',
      'totals.AU',
    ]);

    const departmentsAU = firstIntFromDoc(departmentDoc, [
      'AU',
      'au',
      'federal_departments_au',
      'departments_au',
      'department_count_au',
      'totals.AU',
    ]);

    const contractsUS =
      intFromJurisdictionBlob(contractDoc, 'US') ??
      firstIntFromDoc(contractDoc, ['US', 'us', 'contracts_us', 'government_contracts_us', 'total_us']);
    const contractsCA =
      intFromJurisdictionBlob(contractDoc, 'CA') ??
      firstIntFromDoc(contractDoc, ['CA', 'ca', 'contracts_ca', 'government_contracts_ca', 'total_ca']);
    const contractsUK =
      intFromJurisdictionBlob(contractDoc, 'UK') ??
      firstIntFromDoc(contractDoc, ['UK', 'uk', 'contracts_uk', 'total_uk']);
    const contractsAU =
      intFromJurisdictionBlob(contractDoc, 'AU') ??
      firstIntFromDoc(contractDoc, ['AU', 'au', 'contracts_au', 'total_au']);

    const dates = [pickLastUpdated(departmentDoc), pickLastUpdated(memberDoc), pickLastUpdated(contractDoc)].filter(
      Boolean,
    );
    const lastUpdatedIso = dates.length ? dates.sort().slice(-1)[0] : null;

    return {
      departmentHeadsUS,
      departmentsUS,
      departmentsCA,
      memberUSCongress,
      memberCACommons,
      memberCASenate,
      memberCAParliament,
      contractsUS,
      contractsCA,
      contractsUK,
      contractsAU,
      memberUK,
      memberAUHouse,
      memberAUTotal,
      departmentsAU,
      lastUpdatedIso,
    };
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.warn('[fetchSummaryStatsDashboard]', err);
    }
    return null;
  }
}
