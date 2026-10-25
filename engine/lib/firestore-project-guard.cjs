/**
 * Project guard for the engine/ scripts that write to Firestore with the Admin SDK.
 *
 * A write script must prove — BEFORE its first Firestore read or write — that the Admin SDK is bound to
 * the Civic Voice production project, and that no environment hint points anywhere else
 * (firebase-admin falls back to GOOGLE_CLOUD_PROJECT / GCLOUD_PROJECT when a credential carries no
 * project). Learning the project id needs no network: the credential reads it from the local
 * service-account file.
 *
 * Mirrors civic-voice-engine/src/firebase/projectGuard.js.
 */

'use strict';

const EXPECTED_PROJECT_ID = 'civic-voice-5ea94';

/** @returns {Promise<{ credential: string|null, appOptions: string|null, env: Record<string,string> }>} */
async function collectProjectIds(admin, env = process.env) {
  const app = admin.app();
  const options = (app && app.options) || {};
  const cred = options.credential;
  let credential = null;
  if (cred && typeof cred.getProjectId === 'function') {
    try { credential = (await cred.getProjectId()) || null; } catch (_) { credential = null; }
  }
  if (!credential && cred && typeof cred.projectId === 'string' && cred.projectId) credential = cred.projectId;
  const envHints = {};
  for (const k of ['GOOGLE_CLOUD_PROJECT', 'GCLOUD_PROJECT']) {
    if (typeof env[k] === 'string' && env[k].trim()) envHints[k] = env[k].trim();
  }
  return { credential, appOptions: options.projectId || null, env: envHints };
}

/** Throws unless the credential's project is KNOWN and every hint present equals `expected`. */
function assertExpectedProjectIds(ids, expected = EXPECTED_PROJECT_ID) {
  if (!ids.credential) {
    throw new Error(`Refusing to touch Firestore: could not determine the project the credential is bound to (expected ${expected}).`);
  }
  const bad = [];
  if (ids.credential !== expected) bad.push(`credential is bound to "${ids.credential}"`);
  if (ids.appOptions && ids.appOptions !== expected) bad.push(`app options say "${ids.appOptions}"`);
  for (const [k, v] of Object.entries(ids.env || {})) if (v !== expected) bad.push(`${k}="${v}"`);
  if (bad.length) throw new Error(`Refusing to touch Firestore: expected project "${expected}" but ${bad.join('; ')}.`);
  return ids.credential;
}

/** Call AFTER the default app is initialised and BEFORE any read or write. Resolves to the verified project id. */
async function verifyFirestoreProject({ admin = require('firebase-admin'), env = process.env, expected = EXPECTED_PROJECT_ID } = {}) {
  return assertExpectedProjectIds(await collectProjectIds(admin, env), expected);
}

module.exports = { EXPECTED_PROJECT_ID, collectProjectIds, assertExpectedProjectIds, verifyFirestoreProject };
