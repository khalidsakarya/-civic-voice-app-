/**
 * ROLL BACK a charity document that engine/canada-charities-replace.cjs CREATED (CA-NT or CA-NU only).
 *
 *   1. The creation run saved a creation receipt, outside the repository:
 *        ~/civic-voice-backups/firestore/created__CA-XX__<timestamp>.receipt.json   (override CIVIC_VOICE_BACKUP_DIR)
 *   2. Rehearse (dry run, reads only that one document; needs no authorization):
 *        node engine/canada-charities-created-rollback.cjs --receipt=<receipt.json>
 *   3. To delete, a rollback authorization must first be ISSUED by a separate, deliberate command (it is never
 *      created automatically and no value derived from public data can stand in for it):
 *        node engine/canada-charities-rollback-authorize.cjs --receipt=<receipt.json>
 *      It writes a private file next to the receipt and prints only that file's path.
 *   4. Delete (the exact project and document must be confirmed in addition to the authorization):
 *        node engine/canada-charities-created-rollback.cjs --receipt=<receipt.json> --write \
 *          --authorization-file=<file> --confirm-project=civic-voice-5ea94 --confirm-document=subnational_tax_exempt_entities/CA-XX
 *      A full backup is saved first (restore it with engine/canada-charities-restore.cjs); the delete carries a
 *      lastUpdateTime precondition; the document is re-read to confirm it is gone.
 *
 * It refuses (and deletes nothing) if the receipt is not valid, the project is not civic-voice-5ea94, the
 * authorization is missing, invalid, retired-format or issued for another receipt/document/project, the
 * confirmations do not match exactly, or the document is missing, was modified or re-created after creation,
 * or holds foreign fields. It can never touch any document other than CA-NT / CA-NU. Nothing runs on import.
 * No secret value is ever printed.
 */

'use strict';

const fs = require('fs');

const { parseRollbackArgs, rollbackCreated } = require('./lib/charities-creation-rollback.cjs');
const { createLocalBackupWriter } = require('./lib/firestore-doc-backup.cjs');

async function run({
  argv,
  readFile = (f) => fs.readFileSync(f, 'utf8'),
  getDb = () => require('./firebase-admin-init.cjs').tryGetFirestore(),
  verifyProject = () => require('./lib/firestore-project-guard.cjs').verifyFirestoreProject(),
  writeBackup = createLocalBackupWriter(),
  toTimestamp = ({ seconds, nanoseconds }) => new (require('firebase-admin').firestore.Timestamp)(seconds, nanoseconds),
  verifyAuthorization,
  log = console.log,
} = {}) {
  const args = parseRollbackArgs(argv); // throws before anything else happens
  const receiptText = readFile(args.receipt);
  const receipt = JSON.parse(receiptText);
  let authorization = null;
  if (args.write) authorization = JSON.parse(readFile(args.authorizationFile)); // an object: the issued authorization file
  const db = getDb();
  if (!db) throw new Error('Firebase credentials not found; nothing was changed.');
  const projectId = await verifyProject(); // refuses unless bound to civic-voice-5ea94, before the first read
  log(`Firebase project verified: ${projectId}`);
  const result = await rollbackCreated({ db, receipt, receiptText, write: args.write, authorization, confirmProject: args.confirmProject, confirmDocument: args.confirmDocument, writeBackup, toTimestamp, projectId, ...(verifyAuthorization ? { verifyAuthorization } : {}) });
  if (db.terminate) await db.terminate();
  log(JSON.stringify(result, null, 2)); // contains no authorization material
  return result;
}

if (require.main === module) {
  run({ argv: process.argv.slice(2) })
    .then((r) => { process.exitCode = /^(DRY_RUN|DELETED)$/.test(r.status) ? 0 : 1; })
    .catch((err) => { console.error(`[canada-charities-created-rollback] ${String(err.message).replace(/[0-9a-f]{40,}/gi, '…')}`); process.exit(1); });
}

module.exports = { run };
