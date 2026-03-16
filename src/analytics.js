/**
 * Anonymous event logging for Civic Voice.
 *
 * Every event is written to the Firestore collection `user_events` with:
 *   event_type  — what happened
 *   country     — 'CA' | 'UK' | 'US' | 'AU' | null
 *   region      — user's home region from localStorage (e.g. 'Ontario'), or null
 *   item_id     — bill id, politician name, page name, query, etc. (max 200 chars)
 *   timestamp   — ISO-8601 UTC string
 *
 * No user IDs, no names, no personal data of any kind.
 * All writes are fire-and-forget — errors are silently swallowed so analytics
 * never disrupts the UI.
 */

import { collection, addDoc } from 'firebase/firestore';
import { db } from './firebase.js';

/**
 * @param {string} eventType
 * @param {object} [opts]
 * @param {string|null} [opts.country]  - 'CA' | 'UK' | 'US' | 'AU'
 * @param {string|null} [opts.itemId]   - identifier for the subject of the event
 * @param {object|null} [opts.meta]     - optional extra fields (e.g. { durationMs })
 */
export function logEvent(eventType, { country = null, itemId = null, meta = null } = {}) {
  const region = (() => {
    try { return localStorage.getItem('cvHomeRegion') || null; }
    catch (_) { return null; }
  })();

  const event = {
    event_type: eventType,
    country:    country || null,
    region,
    item_id:    itemId ? String(itemId).slice(0, 200) : null,
    timestamp:  new Date().toISOString(),
    ...(meta ? { meta } : {}),
  };

  addDoc(collection(db, 'user_events'), event).catch(() => {});
}
