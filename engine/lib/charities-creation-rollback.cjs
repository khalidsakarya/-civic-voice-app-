/**
 * ROLLBACK of a charity document that THIS rollout created (CA-NT or CA-NU only).
 *
 * This is the ONLY code in the project that can delete a Firestore document, and it can only ever delete
 * subnational_tax_exempt_entities/CA-NT or /CA-NU, and only when ALL of these hold:
 *   1. a valid creation receipt (outside the repository) names that document;
 *   2. the live project is the receipt's project (civic-voice-5ea94);
 *   3. a PRIVATE rollback authorization, issued by a separate explicit command for exactly this receipt, document
 *      and project, verifies (random nonce + HMAC under a private key; see charities-rollback-authorization.cjs).
 *      The earlier deterministic "id:hash-prefix" tokens are permanently disclosed and are rejected;
 *   4. the operator confirms the exact Firebase project AND the exact document path on the command line;
 *   5. the document exists, and its createTime AND updateTime equal the receipt's (same instance, never
 *      re-created, never modified);
 *   6. the SHA-256 of its current data equals the receipt's, and verification_status / fetched_at match;
 *   7. it holds no field this process does not own;
 *   8. a full-document backup of it was saved and verified first (the restore command can bring it back).
 * A valid authorization is necessary, never sufficient. The delete carries a lastUpdateTime precondition, so
 * Firestore refuses it server-side if the document changed between the check and the delete.
 *
 * Dry run is the default and needs no authorization. Nothing runs on import. No collection query, no other
 * document is ever read or deleted. No secret value is ever returned, logged or printed from here.
 */

'use strict';

const { COLLECTION, validateReceipt, dataSha256, timestampToParts, sameTimestamp } = require('./charities-creation-receipt.cjs');
const { OWNED_FIELDS } = require('./charities-replacement.cjs');
const { verifyAuthorization: defaultVerifyAuthorization } = require('./charities-rollback-authorization.cjs');

const flagError = (msg) => new Error(`${msg}. Nothing was run.`);

/**
 * Strict arguments: --receipt=<file> (required); to delete: --write plus --authorization-file=<file>,
 * --confirm-project=<project id> and --confirm-document=<collection/id>. Nothing else is accepted
 * (the retired --confirm=<token> is rejected as an unsupported argument).
 */
function parseRollbackArgs(argv) {
  const out = { receipt: null, write: false, authorizationFile: null, confirmProject: null, confirmDocument: null };
  const valueFlags = { '--receipt': 'receipt', '--authorization-file': 'authorizationFile', '--confirm-project': 'confirmProject', '--confirm-document': 'confirmDocument' };
  for (const arg of argv) {
    if (arg === '--write') { if (out.write) throw flagError('repeated flag --write'); out.write = true; continue; }
    const m = /^(--[a-z-]+)=(.+)$/.exec(arg);
    if (m && valueFlags[m[1]]) { if (out[valueFlags[m[1]]]) throw flagError(`repeated flag ${m[1]}`); out[valueFlags[m[1]]] = m[2]; continue; }
    throw flagError(`unsupported argument "${arg.replace(/=.*/, '=…')}". Supported: --receipt=<receipt.json>, and to delete: --write --authorization-file=<file> --confirm-project=<project id> --confirm-document=<collection/id>`);
  }
  if (!out.receipt) throw flagError('--receipt=<receipt.json> is required');
  const given = ['authorizationFile', 'confirmProject', 'confirmDocument'].filter((k) => out[k]);
  if (out.write && given.length !== 3) throw flagError('--write requires --authorization-file, --confirm-project and --confirm-document (a dry run needs none of them)');
  if (!out.write && given.length) throw flagError('--authorization-file / --confirm-project / --confirm-document only make sense with --write');
  return out;
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
 * @param {string} [p.receiptText] the receipt file text (the authorization is bound to its hash)
 * @param {boolean} p.write
 * @param {object|null} [p.authorization] parsed authorization FILE (an object). A string, such as an old token, is refused.
 * @param {string|null} [p.confirmProject] operator-typed Firebase project id
 * @param {string|null} [p.confirmDocument] operator-typed document path
 * @param {Function} [p.writeBackup]
 * @param {(parts: {seconds:number, nanoseconds:number}) => any} p.toTimestamp builds a Firestore Timestamp
 * @param {string|null} [p.projectId] project the live SDK is bound to (already guard-verified by the caller)
 * @param {Function} [p.verifyAuthorization] injectable for tests
 */
async function rollbackCreated({ db, receipt, receiptText, write, authorization = null, confirmProject = null, confirmDocument = null, writeBackup, toTimestamp, projectId = null, verifyAuthorization = defaultVerifyAuthorization }) {
  const result = { path: receipt && receipt.document && receipt.document.path, mode: write ? 'DELETE' : 'DRY_RUN', status: null, error: null, problems: [], safety_backup: null, verification: null };
  try {
    const bad = validateReceipt(receipt);
    if (bad.length) { result.status = 'REFUSED_BAD_RECEIPT'; result.problems = bad; result.error = `refusing: ${bad.join('; ')}`; return result; }
    if (projectId !== receipt.firebase_project) { result.status = 'REFUSED_WRONG_PROJECT'; result.error = `refusing: the live project is "${projectId}", the receipt is for "${receipt.firebase_project}"`; return result; }

    if (write) {
      // authorization and confirmations are checked BEFORE any Firestore read or write
      if (typeof authorization === 'string') {
        result.status = 'REFUSED_NOT_AUTHORIZED';
        result.error = 'refusing: a bare token is not an authorization (the retired, publicly derivable tokens are permanently rejected); an issued authorization file is required';
        return result;
      }
      if (!authorization) { result.status = 'REFUSED_NOT_AUTHORIZED'; result.error = 'refusing: no rollback authorization was supplied; nothing was deleted'; return result; }
      const authProblems = verifyAuthorization({ authorization, receipt, receiptText });
      if (authProblems.length) { result.status = 'REFUSED_NOT_AUTHORIZED'; result.problems = authProblems; result.error = `refusing: the rollback authorization is not valid for this receipt (${authProblems[0]}); nothing was deleted`; return result; }
      if (confirmProject !== receipt.firebase_project || confirmProject !== projectId) { result.status = 'REFUSED_CONFIRMATION'; result.error = 'refusing: --confirm-project does not match the exact Firebase project of the receipt and the live connection; nothing was deleted'; return result; }
      if (confirmDocument !== receipt.document.path) { result.status = 'REFUSED_CONFIRMATION'; result.error = 'refusing: --confirm-document does not match the exact document path of the receipt; nothing was deleted'; return result; }
    }

    if (!db) throw new Error('rollback needs Firestore access');
    const id = receipt.document.id; // validated: CA-NT or CA-NU
    const ref = db.collection(COLLECTION).doc(id);
    const snap = await ref.get();
    const problems = assessCreated(receipt, snap);
    if (problems.length) {
      result.problems = problems;
      result.status = snap && snap.exists ? 'REFUSED_CHANGED' : 'REFUSED_MISSING';
      result.error = `refusing to delete ${result.path}: ${problems.join('; ')}`;
      return result;
    }
    if (!write) { result.status = 'DRY_RUN'; return result; }
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
