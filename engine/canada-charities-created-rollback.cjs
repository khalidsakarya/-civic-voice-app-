/**
 * ROLL BACK a charity document that engine/canada-charities-replace.cjs CREATED (CA-NT or CA-NU only).
 *
 *   1. The creation run prints, and saves outside the repository, a creation receipt:
 *        ~/civic-voice-backups/firestore/created__CA-XX__<timestamp>.receipt.json   (override CIVIC_VOICE_BACKUP_DIR)
 *   2. Rehearse (dry run, reads only that one document):
 *        node engine/canada-charities-created-rollback.cjs --receipt=<receipt.json>
 *      It checks the document is still exactly what the creation run wrote, and prints the confirmation token.
 *   3. Delete (explicit authorization required):
 *        node engine/canada-charities-created-rollback.cjs --receipt=<receipt.json> --write --confirm=<token>
 *      A full backup is saved first (restore it with engine/canada-charities-restore.cjs); the delete carries a
 *      lastUpdateTime precondition; the document is re-read to confirm it is gone.
 *
 * It refuses (and deletes nothing) if the receipt is not valid, the project is not civic-voice-5ea94, the document
 * is missing, was modified or re-created after creation, holds foreign fields, or the token is wrong.
 * It can never touch any document other than CA-NT / CA-NU. Nothing runs on import.
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
  log = console.log,
} = {}) {
  const { receipt: file, write, confirm } = parseRollbackArgs(argv); // throws before anything else happens
  const receipt = JSON.parse(readFile(file));
  const db = getDb();
  if (!db) throw new Error('Firebase credentials not found; nothing was changed.');
  const projectId = await verifyProject(); // refuses unless bound to civic-voice-5ea94, before the first read
  log(`Firebase project verified: ${projectId}`);
  const result = await rollbackCreated({ db, receipt, write, confirm, writeBackup, toTimestamp, projectId });
  if (db.terminate) await db.terminate();
  log(JSON.stringify(result, null, 2));
  return result;
}

if (require.main === module) {
  run({ argv: process.argv.slice(2) })
    .then((r) => { process.exitCode = /^(DRY_RUN|DELETED)$/.test(r.status) ? 0 : 1; })
    .catch((err) => { console.error(`[canada-charities-created-rollback] ${err.message}`); process.exit(1); });
}

module.exports = { run };
