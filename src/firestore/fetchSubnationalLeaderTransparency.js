/**
 * Client read helper for `subnational_leader_transparency` (pilot jurisdictions).
 */

import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
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
    return rec;
  } catch (err) {
    console.warn('[subnational-leader-transparency] fetch failed:', err.message || err);
    return null;
  }
}
