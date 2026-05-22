/**
 * Client read helper for `subnational_leader_transparency` (pilot jurisdictions).
 */

import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { applyCaOnLeaderTransparencyFields } from '../utils/caOnLeaderTransparency';
import { applyUsCaLeaderTransparencyFields } from '../utils/usCaLeaderTransparency';
import { applyAuNswLeaderTransparencyFields } from '../utils/auNswLeaderTransparency';
import { applyUkLonLeaderTransparencyFields } from '../utils/ukLonLeaderTransparency';
import { applyLeaderTransparencyFieldsFromFirestore } from '../utils/subnationalLeaderTransparency';

export const SUBNATIONAL_LEADER_TRANSPARENCY_COLLECTION = 'subnational_leader_transparency';

/**
 * @param {string} jurisdictionId e.g. US-CA, CA-ON
 * @returns {Promise<Record<string, unknown>|null>}
 */
export async function fetchSubnationalLeaderTransparency(jurisdictionId) {
  const id = String(jurisdictionId || '').trim();
  if (!id) return null;
  try {
    const snap = await getDoc(doc(db, SUBNATIONAL_LEADER_TRANSPARENCY_COLLECTION, id));
    if (!snap.exists()) return null;
    const raw = snap.data();
    const rec = { id: snap.id, subnationalId: snap.id };
    applyLeaderTransparencyFieldsFromFirestore(rec, raw);
    if (id === 'CA-ON') {
      applyCaOnLeaderTransparencyFields(rec, raw);
    }
    if (id === 'US-CA') {
      applyUsCaLeaderTransparencyFields(rec, raw);
    }
    if (id === 'AU-NSW') {
      applyAuNswLeaderTransparencyFields(rec, raw);
    }
    if (id === 'UK-ENG-LON') {
      applyUkLonLeaderTransparencyFields(rec, raw);
    }
    return rec;
  } catch (err) {
    console.warn('[subnational-leader-transparency] fetch failed:', err.message || err);
    return null;
  }
}
