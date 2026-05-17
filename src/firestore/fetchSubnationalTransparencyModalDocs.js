/**
 * Read transparency modal payloads from dedicated Firestore collections
 * (`subnational_economic_social_stats`, `subnational_tax_exempt_entities`, `subnational_grants`).
 */

import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import {
  SUBNATIONAL_ECONOMIC_SOCIAL_STATS_COLLECTION,
  SUBNATIONAL_GRANTS_COLLECTION,
  SUBNATIONAL_TAX_EXEMPT_ENTITIES_COLLECTION,
} from '../constants/firestoreCollections';
import {
  buildTransparencyFieldsFromModalDocs,
  subnationalTransparencyJurisdictionId,
} from '../utils/subnationalTransparencyData';

/** @param {string} collection @param {string} jurisdictionId */
function docPath(collection, jurisdictionId) {
  return `${collection}/${jurisdictionId}`;
}

/**
 * @param {{
 *   jurisdictionId: string;
 *   regionName: string;
 *   isUSA: boolean;
 * }} params
 * @returns {Promise<Record<string, unknown>>}
 */
export async function fetchSubnationalTransparencyModalDocs({ jurisdictionId, regionName, isUSA }) {
  const id = String(jurisdictionId || '').trim();
  if (!id) return {};

  const economicRef = doc(db, SUBNATIONAL_ECONOMIC_SOCIAL_STATS_COLLECTION, id);
  const taxRef = doc(db, SUBNATIONAL_TAX_EXEMPT_ENTITIES_COLLECTION, id);
  const grantsRef = doc(db, SUBNATIONAL_GRANTS_COLLECTION, id);

  const [economicSnap, taxSnap, grantsSnap] = await Promise.all([
    getDoc(economicRef),
    getDoc(taxRef),
    getDoc(grantsRef),
  ]);

  const economicDoc = economicSnap.exists() ? economicSnap.data() : null;
  const taxDoc = taxSnap.exists() ? taxSnap.data() : null;
  const grantsDoc = grantsSnap.exists() ? grantsSnap.data() : null;

  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.log('[subnational-transparency]', {
      regionName,
      jurisdictionId: id,
      paths: {
        economic: docPath(SUBNATIONAL_ECONOMIC_SOCIAL_STATS_COLLECTION, id),
        tax: docPath(SUBNATIONAL_TAX_EXEMPT_ENTITIES_COLLECTION, id),
        grants: docPath(SUBNATIONAL_GRANTS_COLLECTION, id),
      },
      exists: {
        economic: economicSnap.exists(),
        tax: taxSnap.exists(),
        grants: grantsSnap.exists(),
      },
      keys: {
        economic: economicDoc ? Object.keys(economicDoc) : [],
        tax: taxDoc ? Object.keys(taxDoc) : [],
        grants: grantsDoc ? Object.keys(grantsDoc) : [],
      },
    });
  }

  return buildTransparencyFieldsFromModalDocs(
    { economicDoc, taxDoc, grantsDoc },
    regionName,
    isUSA,
  );
}

/**
 * Resolve jurisdiction id from an explorer row and fetch modal docs.
 * @param {Record<string, unknown>|null|undefined} item
 * @param {boolean} isUSA
 */
export async function fetchSubnationalTransparencyForExplorerItem(item, isUSA) {
  if (!item) return {};
  const jurisdictionId = subnationalTransparencyJurisdictionId(item, isUSA);
  const regionName = String(item.displayName || item.name || '').trim();
  if (!jurisdictionId) return {};
  return fetchSubnationalTransparencyModalDocs({ jurisdictionId, regionName, isUSA });
}
