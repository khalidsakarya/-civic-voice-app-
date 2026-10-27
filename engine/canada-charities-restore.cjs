/**
 * RESTORE a charity document from a backup written by engine/canada-charities-replace.cjs.
 *
 * ROLLBACK PROCEDURE
 *   1. Find the backup: every replacement prints its path, and records it in
 *      engine/reports/canada-charities-replace-latest.json (results[].backup.path). Default folder:
 *      ~/civic-voice-backups/firestore (override CIVIC_VOICE_BACKUP_DIR), file name
 *      subnational_tax_exempt_entities__CA-XX__<timestamp>.json.
 *   2. Rehearse:   node engine/canada-charities-restore.cjs --file=<backup.json>
 *      (dry run: shows which fields would be restored and which would be removed; reads only that document.)
 *   3. Restore:    node engine/canada-charities-restore.cjs --file=<backup.json> --write
 *      Takes a fresh backup of the CURRENT document first, restores exactly the fields the backup holds,
 *      removes the corrected-only fields the backup did not have, and re-reads to verify.
 *
 * Safeguards: only the 13 charity documents; only backups taken from civic-voice-5ea94; refuses backups that
 * hold fields this process does not own or type-tagged values (restore those by hand); project guard before
 * any read; dry run by default; strict arguments; nothing runs on import.
 */

'use strict';

const fs = require('fs');

const { restoreOne } = require('./lib/charities-replacement.cjs');
const { createLocalBackupWriter } = require('./lib/firestore-doc-backup.cjs');

function parseArgs(argv) {
  let file = null;
  let write = false;
  for (const arg of argv) {
    if (arg === '--write') { if (write) throw new Error('repeated flag --write. Nothing was run.'); write = true; continue; }
    const m = /^--file=(.+)$/.exec(arg);
    if (m) { if (file) throw new Error('repeated flag --file. Nothing was run.'); file = m[1]; continue; }
    throw new Error(`unsupported argument "${arg}". Supported: --file=<backup.json>, --write. Nothing was run.`);
  }
  if (!file) throw new Error('--file=<backup.json> is required. Nothing was run.');
  return { file, write };
}

async function run({
  argv,
  readFile = (f) => fs.readFileSync(f, 'utf8'),
  getDb = () => require('./firebase-admin-init.cjs').tryGetFirestore(),
  verifyProject = () => require('./lib/firestore-project-guard.cjs').verifyFirestoreProject(),
  writeBackup = createLocalBackupWriter(),
  deleteField = () => require('firebase-admin').firestore.FieldValue.delete(),
  log = console.log,
} = {}) {
  const { file, write } = parseArgs(argv);
  const backup = JSON.parse(readFile(file));
  const db = getDb();
  if (!db) throw new Error('Firebase credentials not found; nothing was changed.');
  const projectId = await verifyProject();
  log(`Firebase project verified: ${projectId}`);
  const result = await restoreOne({ db, backup, write, writeBackup, deleteField, projectId });
  if (db.terminate) await db.terminate();
  log(JSON.stringify(result, null, 2));
  return result;
}

if (require.main === module) {
  run({ argv: process.argv.slice(2) })
    .then((r) => { process.exitCode = /^(DRY_RUN|RESTORED)$/.test(r.status) ? 0 : 1; })
    .catch((err) => { console.error(`[canada-charities-restore] ${err.message}`); process.exit(1); });
}

module.exports = { run, parseArgs };
