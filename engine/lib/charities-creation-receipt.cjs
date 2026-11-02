/**
 * Creation receipts for NEWLY CREATED charity documents (CA-NT, CA-NU only).
 *
 * A receipt is what lets a later rollback prove "this exact document was created by this exact rollout and
 * nobody has changed it since". It records the Firestore createTime and updateTime of the document as read
 * back right after creation, plus a SHA-256 over the canonical form of the stored data.
 *
 * Properties (each covered by tests):
 *   - saved OUTSIDE any git repository (same folder rule as the pre-write backups), never overwritten ("wx"),
 *     read back and compared, scanned for credential material;
 *   - only CA-NT / CA-NU documents in subnational_tax_exempt_entities can have a receipt;
 *   - no Firestore access of any kind in this file.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { resolveBackupDir, findGitRepoAbove, assertNoCredentialMaterial } = require('./firestore-doc-backup.cjs');

const RECEIPT_FORMAT = 1;
const RECEIPT_KIND = 'charity-document-creation-receipt';
const COLLECTION = 'subnational_tax_exempt_entities';
/** The only documents this rollout may create (and therefore the only ones a rollback may ever delete). */
const CREATABLE_IDS = Object.freeze(['CA-NT', 'CA-NU']);

/** JSON with every object's keys sorted, so the hash does not depend on field order. */
function canonicalJson(v) {
  if (Array.isArray(v)) return `[${v.map(canonicalJson).join(',')}]`;
  if (v && typeof v === 'object') return `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${canonicalJson(v[k])}`).join(',')}}`;
  return JSON.stringify(v === undefined ? null : v);
}
const sha256 = (text) => crypto.createHash('sha256').update(text).digest('hex');
const dataSha256 = (data) => sha256(canonicalJson(data));

/** Firestore Timestamp (or a stand-in) -> { seconds, nanoseconds } (plain numbers). */
function timestampToParts(ts) {
  if (!ts) return null;
  const seconds = ts.seconds ?? ts._seconds;
  const nanoseconds = ts.nanoseconds ?? ts._nanoseconds;
  if (!Number.isInteger(seconds) || !Number.isInteger(nanoseconds)) return null;
  return { seconds, nanoseconds };
}
const sameTimestamp = (a, b) => !!a && !!b && a.seconds === b.seconds && a.nanoseconds === b.nanoseconds;

/**
 * @param {{ id: string, projectId: string, data: object, createTime: any, updateTime: any, now?: Date }} p
 * `data` is the document AS READ BACK after creation (not the payload that was sent).
 */
function buildReceipt({ id, projectId, data, createTime, updateTime, now = new Date() }) {
  if (!CREATABLE_IDS.includes(id)) throw new Error(`no receipt for "${id}": only ${CREATABLE_IDS.join(' and ')} may be created by this rollout`);
  const create = timestampToParts(createTime);
  const update = timestampToParts(updateTime);
  if (!create || !update) throw new Error('no receipt: Firestore did not return create/update times for the new document');
  const recs = Array.isArray(data && data.records) ? data.records : [];
  return {
    receipt_format: RECEIPT_FORMAT,
    kind: RECEIPT_KIND,
    document: { collection: COLLECTION, id, path: `${COLLECTION}/${id}` },
    firebase_project: projectId,
    receipt_written_at: now.toISOString(),
    created_by: 'civic-voice-app engine/canada-charities-replace.cjs --allow-create',
    firestore: { create_time: create, update_time: update },
    stored: {
      verification_status: data.verification_status,
      fetched_at: data.fetched_at,
      cv_data_id: data.cv_data_id,
      source_year: data.source_year,
      total_in_source: data.total_in_source,
      record_count: recs.length,
      field_names: Object.keys(data).sort(),
    },
    data_sha256: dataSha256(data),
  };
}

/** Structural validation of a receipt read from disk. Returns a list of problems (empty = usable). */
function validateReceipt(r) {
  const problems = [];
  if (!r || typeof r !== 'object') return ['not a receipt'];
  if (r.receipt_format !== RECEIPT_FORMAT || r.kind !== RECEIPT_KIND) problems.push('not a charity creation receipt (format/kind)');
  const d = r.document || {};
  if (d.collection !== COLLECTION) problems.push(`receipt is for collection "${d.collection}", expected ${COLLECTION}`);
  if (!CREATABLE_IDS.includes(d.id)) problems.push(`receipt document id "${d.id}" is not one of ${CREATABLE_IDS.join(', ')}`);
  if (d.path !== `${COLLECTION}/${d.id}`) problems.push('receipt path does not match its collection and id');
  if (r.firebase_project !== 'civic-voice-5ea94') problems.push(`receipt was written for project "${r.firebase_project}"`);
  if (!timestampToParts(r.firestore && r.firestore.create_time) || !timestampToParts(r.firestore && r.firestore.update_time)) problems.push('receipt has no create/update times');
  if (!/^[0-9a-f]{64}$/.test(String(r.data_sha256 || ''))) problems.push('receipt has no valid data hash');
  if (!r.stored || !r.stored.verification_status || !r.stored.fetched_at) problems.push('receipt does not identify the rollout (verification_status / fetched_at)');
  return problems;
}

/** The token a human must type to authorize one specific rollback: id plus the first 12 hex characters of the data hash. */
const confirmationToken = (receipt) => `${receipt.document.id}:${receipt.data_sha256.slice(0, 12)}`;

/**
 * @returns {{ (args: { receipt: object }) => Promise<{ path: string, bytes: number, sha256: string }>, preflight: () => Promise<{ dir: string }> }}
 */
function createLocalReceiptWriter({ dir = resolveBackupDir(), now = () => new Date() } = {}) {
  const resolved = path.resolve(dir);
  const checkDir = () => {
    const repo = findGitRepoAbove(resolved);
    if (repo) throw new Error(`receipt refused: ${resolved} is inside the git repository at ${repo}; receipts must live outside any repository`);
    fs.mkdirSync(resolved, { recursive: true });
  };
  async function writeReceipt({ receipt }) {
    checkDir();
    const problems = validateReceipt(receipt);
    if (problems.length) throw new Error(`receipt refused: ${problems.join('; ')}`);
    const text = JSON.stringify(receipt, null, 2) + '\n';
    assertNoCredentialMaterial(text);
    const base = `created__${receipt.document.id}__${now().toISOString().replace(/[:.]/g, '-')}`;
    let file = null;
    for (let n = 0; n < 20 && !file; n += 1) {
      const candidate = path.join(resolved, `${base}${n ? `__${n}` : ''}.receipt.json`);
      try { fs.writeFileSync(candidate, text, { flag: 'wx', mode: 0o600 }); file = candidate; } catch (e) { if (e.code !== 'EEXIST') throw e; }
    }
    if (!file) throw new Error('receipt failed: could not choose an unused file name');
    let ok = false;
    try { ok = JSON.stringify(JSON.parse(fs.readFileSync(file, 'utf8'))) === JSON.stringify(receipt); } catch { ok = false; }
    if (!ok) { try { fs.unlinkSync(file); } catch { /* best effort */ } throw new Error('receipt failed: the saved file did not verify when read back'); }
    return { path: file, bytes: Buffer.byteLength(text), sha256: sha256(text) };
  }
  /** Proves, BEFORE anything is created, that a receipt can be saved and read back (probe file is deleted again). */
  writeReceipt.preflight = async () => {
    checkDir();
    const probe = path.join(resolved, `.receipt-probe-${process.pid}-${Date.now()}.tmp`);
    fs.writeFileSync(probe, 'probe', { flag: 'wx', mode: 0o600 });
    const ok = fs.readFileSync(probe, 'utf8') === 'probe';
    fs.unlinkSync(probe);
    if (!ok) throw new Error('receipt preflight failed: the probe file did not read back');
    return { dir: resolved };
  };
  return writeReceipt;
}

module.exports = {
  RECEIPT_FORMAT, RECEIPT_KIND, COLLECTION, CREATABLE_IDS,
  canonicalJson, dataSha256, timestampToParts, sameTimestamp,
  buildReceipt, validateReceipt, confirmationToken, createLocalReceiptWriter,
};
