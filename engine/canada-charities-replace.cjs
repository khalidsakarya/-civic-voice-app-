/**
 * Replace the provincial / territorial CRA charity documents with the corrected CRA "2024 List of charities".
 *
 *   node engine/canada-charities-replace.cjs --only=CA-YT              # DRY RUN: reads only the target document(s)
 *   node engine/canada-charities-replace.cjs --offline                 # DRY RUN, all 13, NO Firestore access at all
 *   node engine/canada-charities-replace.cjs --only=CA-YT --write      # the guarded replacement (one document)
 *   node engine/canada-charities-replace.cjs --only=CA-NT --write --allow-create   # create a document that does not exist
 *
 * DRY RUN IS THE DEFAULT. A write needs an explicit --write AND an explicit --only (there is no implicit "all").
 * Arguments are validated strictly: anything unsupported stops the run before anything happens.
 *
 * Safeguards: Firebase project guard (civic-voice-5ea94) before the first read; the CRA package metadata and
 * CSV headers are validated before anything is built; each target must be one of the 13 charity documents; the
 * existing document is refused if it belongs to another jurisdiction or holds fields this process does not own;
 * a FULL backup of the existing document is saved outside the repository and verified BEFORE it is replaced
 * (a failed backup aborts that document); the replacement uses set(..., { mergeFields }) so the whole `records`
 * array and every placeholder rawValue are replaced; the stored document is re-read and verified. No delete,
 * no collection query, no scheduler, nothing runs on import.
 *
 * Restore: node engine/canada-charities-restore.cjs --file=<backup .json> [--write]   (see docs in that file)
 */

'use strict';

const fs = require('fs');
const path = require('path');

const { parseArgs, buildPayload, replaceOne, JURISDICTIONS, COLLECTION } = require('./lib/charities-replacement.cjs');
const CRA = require('./lib/cra-list-of-charities-2024.cjs');
const { createLocalBackupWriter } = require('./lib/firestore-doc-backup.cjs');

const REPORTS_DIR = path.join(__dirname, 'reports');

/**
 * The whole run, with every external dependency injectable so it is testable with stubs.
 * @returns {Promise<{ results: any[], summaries: any[], exitCode: number }>}
 */
async function run({
  argv,
  getDb = () => require('./firebase-admin-init.cjs').tryGetFirestore(),
  verifyProject = () => require('./lib/firestore-project-guard.cjs').verifyFirestoreProject(),
  loadDataset = () => CRA.loadDataset(),
  writeBackup = createLocalBackupWriter(),
  now = new Date(),
  log = console.log,
  warn = console.warn,
  saveReport = null,
} = {}) {
  const args = parseArgs(argv); // throws on anything unsupported, before anything else happens
  const targets = args.only ? JURISDICTIONS.filter((j) => args.only.has(j.id)) : JURISDICTIONS;

  log('============================================');
  log(args.write ? '!!! WRITE MODE: matching charity documents will be replaced (after a verified backup) !!!' : `DRY RUN — no Firestore writes${args.offline ? ', no Firestore access at all (offline)' : ''}`);
  log(`Targets: ${targets.map((t) => t.id).join(', ')}`);
  log('============================================');

  let db = null;
  let projectId = null;
  if (!args.offline) {
    db = getDb();
    if (!db && args.write) throw new Error('Firebase credentials not found; nothing was written.');
    if (db) {
      projectId = await verifyProject(); // refuses unless the SDK is bound to civic-voice-5ea94; before the first read
      log(`Firebase project verified: ${projectId}`);
    } else {
      warn('No Firebase credentials: continuing as an OFFLINE dry run (target documents will not be read).');
    }
  }

  const dataset = await loadDataset(); // validates the CRA metadata and CSV headers; throws if the source changed
  log(`Source confirmed: "${dataset.meta.title}" (CRA, coverage ${dataset.meta.coverage_start}..${dataset.meta.coverage_end}, published ${dataset.meta.published}, ${dataset.identRows.length} charities)`);

  // Build EVERY payload before any write, so a problem in one jurisdiction cannot surface after others were written.
  const prepared = targets.map((jurisdiction) => {
    const doc = CRA.buildDocFromDataset(dataset, jurisdiction.id);
    return { jurisdiction, doc, payload: buildPayload(doc, jurisdiction, { now, identificationResourceId: dataset.meta.resources.identification.id }), summary: CRA.summarizeDoc(doc) };
  });

  const results = [];
  for (const p of prepared) {
    // eslint-disable-next-line no-await-in-loop
    const r = await replaceOne({ db, jurisdiction: p.jurisdiction, payload: p.payload, write: args.write, allowCreate: args.allowCreate, writeBackup, projectId });
    r.summary = p.summary;
    results.push(r);
    const s = p.summary;
    log(`  ${r.status.padEnd(26)} ${p.jurisdiction.id}  ${s.selected} of ${s.total_in_source} charities, revenue ${s.revenue_min_cad} .. ${s.revenue_max_cad}${r.backup ? `  backup: ${r.backup.path}` : ''}${r.error ? `  — ${r.error}` : ''}`);
  }

  if (db && typeof db.terminate === 'function') await db.terminate();

  const failed = results.filter((r) => /^(FAILED|ABORTED|WRITTEN_VERIFICATION_FAILED)/.test(r.status)).length;
  const report = {
    run_type: args.write ? 'FIRESTORE_REPLACE' : 'DRY_RUN',
    run_at: now.toISOString(),
    firebase_project: projectId,
    source: dataset.meta,
    results,
  };
  if (args.write && saveReport) saveReport(report); // a dry run leaves no files behind
  log(`\nDone. ${args.write ? 'Replaced' : 'Dry-ran'} ${results.length} document(s); problems: ${failed}.${args.write ? '' : ' Firestore writes: 0.'}`);
  return { results, summaries: prepared.map((p) => p.summary), report, exitCode: failed ? 1 : 0 };
}

function writeReports(report) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
  const ts = report.run_at.replace(/[:.]/g, '-').replace('T', '_').slice(0, 19);
  const body = JSON.stringify(report, null, 2);
  fs.writeFileSync(path.join(REPORTS_DIR, `canada-charities-replace-${ts}.json`), body, 'utf8');
  fs.writeFileSync(path.join(REPORTS_DIR, 'canada-charities-replace-latest.json'), body, 'utf8');
}

if (require.main === module) {
  (async () => {
    try {
      const { exitCode, report, results } = await run({ argv: process.argv.slice(2), saveReport: writeReports });
      if (process.argv.includes('--write') === false) console.log(`\n${JSON.stringify({ ...report, source: undefined, results: results.map((r) => ({ ...r, summary: undefined })) }, null, 2)}`);
      process.exitCode = exitCode;
    } catch (err) {
      console.error(`[canada-charities-replace] ${err.message}`);
      process.exit(1);
    }
  })();
}

module.exports = { run, COLLECTION };
