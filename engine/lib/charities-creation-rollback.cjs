/**
 * ROLLBACK of a charity document that THIS rollout created (CA-NT or CA-NU only).
 *
 * This is the ONLY code in the project that can delete a Firestore document, and it can only ever delete
 * subnational_tax_exempt_entities/CA-NT or /CA-NU, and only when ALL of these hold:
 *   1. a valid creation receipt (written by the creation run, outside the repository) names that document;
 *   2. the live project is the receipt's project (civic-voice-5ea94);
 *   3. the document exists, and its createTime AND updateTime equal the receipt's (it is the same document
 *      instance, never deleted/re-created, never modified since creation);
 *   4. the SHA-256 of its current data equals the receipt's, and verification_status / fetched_at match;
 *   5. it holds no field this process does not own;
 *   6. a human supplied the exact confirmation token (id + first 12 hex of the data hash) together with --write;
 *   7. a full-document backup of it was saved and verified first (the restore command can bring it back).
 * The delete itself carries a lastUpdateTime precondition, so Firestore refuses it server-side if the document
 * changed between the check and the delete.
 *
 * Dry run is the default. Nothing runs on import. No collection query, no other document is ever read or deleted.
 */

'use strict';

const { COLLECTION, validateReceipt, dataSha256, timestampToParts, sameTimestamp, confirmationToken } = require('./charities-creation-receipt.cjs');
const { OWNED_FIELDS } = require('./charities-replacement.cjs');

const flagError = (msg) => new Error(`${msg}. Nothing was run.`);

/** Strict arguments: --receipt=<file> (required), --write, --confirm=<token>. --write needs --confirm. */
function parseRollbackArgs(argv) {
  let receipt = null;
  let write = false;
  let confirm = null;
  for (const arg of argv) {
    if (arg === '--write') { if (write) throw flagError('repeated flag --write'); write = true; continue; }
    let m = /^--receipt=(.+)$/.exec(arg);
    if (m) { if (receipt) throw flagError('repeated flag --receipt'); receipt = m[1]; continue; }
    m = /^--confirm=(.+)$/.exec(arg);
    if (m) { if (confirm) throw flagError('repeated flag --confirm'); confirm = m[1]; continue; }
    throw flagError(`unsupported argument "${arg}". Supported: --receipt=<receipt.json>, --write, --confirm=<token>`);
  }
  if (!receipt) throw flagError('--receipt=<receipt.json> is required');
  if (write && !confirm) throw flagError('--write requires --confirm=<token> (run without --write first: it prints the token)');
  if (confirm && !write) throw flagError('--confirm only makes sense with --write');
  return { receipt, write, confirm };
}

/** Pure check of the live document against the receipt. Returns the list of reasons to refuse (empty = it is the untouched created document). */
function assessCreated(receipt, snap) {
  if (!snap || !snap.exists) return ['the document does not exist (nothing to roll back)'];
  const problems = [];
  const data = snap.data() || {};
  if (!sameTimestamp(timestampToParts(snap.createTime), receipt.firestore.create_time)) problems.push('createTime differs from the receipt: this is not the document this rollout created (it was deleted and re-created)');
  if (!sameTimestamp(timestampToParts(snap.updateTime), receipt.firestore.update_time)) problems.push('updateTime differs from the receipt: the document was modified after it was created');
  if (dataSha256(data) !== receipt.data_sha256) problems.push('the stored data differs from the data hash in the receipt');
  if (data.verification_status !== receipt.stored.verification_status || data.fetched_at !== receipt.stored.fetched_at) problems.push('verification_status / fetched_at do not match the receipt');
  const unknown = Object.keys(data).filter((k) => !OWNED_FIELDS.has(k));
  if (unknown.length) problems.push(`the document has fields this process does not own: [${unknown.join(', ')}]`);
  return problems;
}

/**
 * @param {object} p
 * @param {any} p.db Firestore handle
 * @param {object} p.receipt parsed receipt
 * @param {boolean} p.write
 * @param {string|null} p.confirm
 * @param {Function} [p.writeBackup]
 * @param {(parts: {seconds:number, nanoseconds:number}) => any} p.toTimestamp builds a Firestore Timestamp
 * @param {string|null} [p.projectId] project the live SDK is bound to (already guard-verified by the caller)
 */
async function rollbackCreated({ db, receipt, write, confirm = null, writeBackup, toTimestamp, projectId = null }) {
  const result = { path: receipt && receipt.document && receipt.document.path, mode: write ? 'DELETE' : 'DRY_RUN', status: null, error: null, problems: [], confirmation_token: null, safety_backup: null, verification: null };
  try {
    const bad = validateReceipt(receipt);
    if (bad.length) { result.status = 'REFUSED_BAD_RECEIPT'; result.problems = bad; result.error = `refusing: ${bad.join('; ')}`; return result; }
    if (projectId !== receipt.firebase_project) { result.status = 'REFUSED_WRONG_PROJECT'; result.error = `refusing: the live project is "${projectId}", the receipt is for "${receipt.firebase_project}"`; return result; }
    if (!db) throw new Error('rollback needs Firestore access');
    const id = receipt.document.id; // validated: CA-NT or CA-NU
    const ref = db.collection(COLLECTION).doc(id);
    const snap = await ref.get();
    const problems = assessCreated(receipt, snap);
    result.confirmation_token = confirmationToken(receipt);
    if (problems.length) {
      result.problems = problems;
      result.status = snap && snap.exists ? 'REFUSED_CHANGED' : 'REFUSED_MISSING';
      result.error = `refusing to delete ${result.path}: ${problems.join('; ')}`;
      return result;
    }
    if (!write) { result.status = 'DRY_RUN'; return result; }
    if (confirm !== result.confirmation_token) { result.status = 'REFUSED_NOT_AUTHORIZED'; result.error = 'the confirmation token does not match; nothing was deleted'; return result; }
    if (typeof writeBackup !== 'function') { result.status = 'ABORTED_NO_BACKUP'; result.error = 'no backup writer configured; nothing was deleted'; return result; }
    try {
      result.safety_backup = await writeBackup({ collection: COLLECTION, docId: id, data: snap.data(), projectId });
    } catch (e) {
      result.status = 'ABORTED_BACKUP_FAILED';
      result.error = `the pre-delete backup failed (${String(e.message || e).slice(0, 200)}); nothing was deleted`;
      return result;
    }
    // server-enforced: Firestore refuses the delete if the document was modified after the receipt's updateTime
    await ref.delete({ lastUpdateTime: toTimestamp(receipt.firestore.update_time) });
    const after = await ref.get();
    result.verification = { document_gone: !after.exists };
    result.status = after.exists ? 'DELETE_VERIFICATION_FAILED' : 'DELETED';
    if (after.exists) result.error = 'the delete was issued but the document is still there';
    return result;
  } catch (e) {
    result.status = 'FAILED';
    result.error = String(e.message || e).slice(0, 300);
    return result;
  }
}

module.exports = { parseRollbackArgs, assessCreated, rollbackCreated };
