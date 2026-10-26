/**
 * Safeguards shared by the provincial / territorial Firestore write scripts
 * (engine/canada-yt-write-charities.cjs, engine/canada-unemployment-batch-write.cjs).
 *
 *  - parseStrictArgs      unsupported / malformed / repeated flags are REJECTED, never ignored. (A typo such
 *                         as `--dryrun` must not turn an intended rehearsal into a real write.)
 *  - assertTarget         the collection is on an allow-list, the document id is `CA-<province or territory>`,
 *                         and the document the builder produced declares that same jurisdiction.
 *  - refuseUnrelatedRecord  passed to mergeTransparencyDoc as `beforeWrite`: if the target document already
 *                         exists and says it belongs to another jurisdiction, the run aborts before any write.
 *  - the Firebase project guard is engine/lib/firestore-project-guard.cjs (civic-voice-5ea94).
 *
 * Writes themselves stay merge-only (mergeTransparencyDoc: get + set(..., { merge: true })); nothing here
 * can delete or replace a document.
 */

'use strict';

const ALLOWED_COLLECTIONS = new Set(['subnational_economic_social_stats', 'subnational_tax_exempt_entities']);
const JURISDICTION_ID_RE = /^CA-(AB|BC|MB|NB|NL|NS|NT|NU|ON|PE|QC|SK|YT)$/;

/**
 * @param {string[]} argv arguments after the script name
 * @param {{ flags?: string[], values?: string[] }} spec  flags: exact `--name`; values: `--name=value` (non-empty)
 * @returns {{ flags: Set<string>, values: Record<string,string> }}
 * @throws Error listing every problem
 */
function parseStrictArgs(argv, spec = {}) {
  const flags = new Set();
  const values = {};
  const problems = [];
  const flagSet = new Set(spec.flags || []);
  const valueSet = new Set(spec.values || []);
  for (const arg of argv) {
    if (flagSet.has(arg)) {
      if (flags.has(arg)) problems.push(`repeated flag ${arg}`);
      flags.add(arg);
      continue;
    }
    const m = /^(--[a-z][a-z0-9-]*)=(.*)$/.exec(arg);
    if (m && valueSet.has(m[1])) {
      if (m[1] in values) problems.push(`repeated flag ${m[1]}`);
      else if (!m[2].trim()) problems.push(`${m[1]} needs a value`);
      else values[m[1]] = m[2].trim();
      continue;
    }
    problems.push(`unsupported argument "${arg}"`);
  }
  if (problems.length) {
    const supported = [...flagSet, ...[...valueSet].map((v) => `${v}=<value>`)].join(', ') || '(none)';
    throw new Error(`${problems.join('; ')}. Supported: ${supported}. Nothing was run.`);
  }
  return { flags, values };
}

/** Throws unless (collection, jurisdictionId, doc) is an intended target. */
function assertTarget({ collection, jurisdictionId, doc }) {
  if (!ALLOWED_COLLECTIONS.has(collection)) throw new Error(`Refusing to write: collection "${collection}" is not an approved provincial/territorial collection.`);
  if (!JURISDICTION_ID_RE.test(String(jurisdictionId))) throw new Error(`Refusing to write: "${jurisdictionId}" is not a valid Canadian province/territory document id (expected CA-XX).`);
  if (!doc || typeof doc !== 'object') throw new Error('Refusing to write: the builder returned no document.');
  if (doc.jurisdiction_id !== jurisdictionId) throw new Error(`Refusing to write: the built document declares jurisdiction "${doc.jurisdiction_id}", expected "${jurisdictionId}".`);
}

/**
 * `beforeWrite` hook: abort if the existing document at the target path belongs to somebody else.
 * A missing document, or one that does not yet declare a jurisdiction, is fine (merge adds to it).
 */
function refuseUnrelatedRecord(jurisdictionId) {
  return (snap) => {
    if (!snap || !snap.exists) return;
    const data = (typeof snap.data === 'function' ? snap.data() : null) || {};
    if (data.jurisdiction_id != null && data.jurisdiction_id !== jurisdictionId) {
      throw new Error(`Refusing to write ${jurisdictionId}: the existing document declares jurisdiction "${data.jurisdiction_id}" (unrelated record). Nothing was written.`);
    }
    if (data.country != null && data.country !== 'CA') {
      throw new Error(`Refusing to write ${jurisdictionId}: the existing document declares country "${data.country}" (unrelated record). Nothing was written.`);
    }
  };
}

module.exports = { ALLOWED_COLLECTIONS, JURISDICTION_ID_RE, parseStrictArgs, assertTarget, refuseUnrelatedRecord };
