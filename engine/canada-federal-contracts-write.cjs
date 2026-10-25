/**
 * Federal Canada contracts -> Firestore `government_contracts` (100 largest).
 *
 * DRY-RUN BY DEFAULT. Firestore is touched ONLY with `--write`.
 *
 *   node engine/canada-federal-contracts-write.cjs                      # dry-run, live CKAN fetch
 *   node engine/canada-federal-contracts-write.cjs --rows-file=<json>   # dry-run from a saved download
 *   node engine/canada-federal-contracts-write.cjs --fiscal-year=2025-2026
 *   node engine/canada-federal-contracts-write.cjs --write              # writes exactly 100 documents
 *
 * Selection (see engine/lib/canada-federal-contracts.cjs for the reasoning):
 *   - reporting period: one federal fiscal year, i.e. the four disclosure
 *     quarters <FY>-Q1..Q4 of the TBS "Proactive Publication - Contracts" dataset
 *   - value: disclosed total contract value (original + amendments), > 0
 *   - one row per contract: the most recent disclosure of each
 *     procurement_id + vendor + department
 *   - the 100 largest by that value
 *
 * Documents: government_contracts/ca-fed-contract-001 ... -100 (rank order).
 * Fixed ids mean a refresh overwrites the same 100 documents and can never
 * leave a stale tail. The UI pages by document id (no composite index needed)
 * and reads each document's `selection_*` fields, so the "100 largest" scope is
 * stated by the data itself.
 *
 * Documents carry jurisdiction 'CA-FED-SELECTION' (and country 'CA'), NOT 'CA'.
 * The sibling civic-voice-engine monthly uploader (uploadGovernmentContracts)
 * deletes every government_contracts document with jurisdiction == 'CA' that is
 * not in its own upload, and its weekly aggregateContractStats buckets totals by
 * `jurisdiction`; using 'CA' here would get these 100 deleted as "stale" and
 * blend them into the engine's legacy Canadian totals.
 *
 * NOT done by this script: it never touches any pre-existing `jurisdiction == 'CA'`
 * document (those are written by the sibling engine and the Contracts page no longer
 * reads them). It does not query, count, list or delete anything.
 *
 * WRITE SAFETY (--write), enforced in writeContracts() and covered by tests:
 *   1. the 100 documents must be exactly ca-fed-contract-001 ... -100, each with
 *      jurisdiction CA-FED-SELECTION and country CA — anything else aborts before any I/O;
 *   2. the Admin SDK must be bound to civic-voice-5ea94 (engine/lib/firestore-project-guard.cjs);
 *   3. ONE batched get of exactly those 100 ids: if any already exists and is not a
 *      CA-FED-SELECTION document, the run aborts and nothing is written (no unrelated document
 *      can be overwritten); existing selection documents are simply replaced, so a rerun
 *      never duplicates anything;
 *   4. one batch of 100 set() calls on those ids. No collection query, no delete.
 *
 * Importing this file never runs anything (main() is guarded).
 */

'use strict';

const fs = require('fs');
const path = require('path');

const {
  DATASET,
  SELECTION_SIZE,
  DEFAULT_FISCAL_YEAR,
  fiscalYearPeriods,
  fetchFiscalYearRows,
  selectLargestContracts,
  buildSelectionMeta,
  buildContractDoc,
  docIdForRank,
  FED_SELECTION_JURISDICTION,
} = require('./lib/canada-federal-contracts.cjs');

// CV_REPORTS_DIR lets tests write their report somewhere else than engine/reports.
const REPORTS_DIR = process.env.CV_REPORTS_DIR || path.join(__dirname, 'reports');
const COLLECTION = 'government_contracts';

/** The only document ids this script may ever write: ca-fed-contract-001 ... -100. */
const APPROVED_IDS = Array.from({ length: SELECTION_SIZE }, (_, i) => docIdForRank(i + 1));

/** Throws unless `docs` is exactly the approved 100 selection documents, in rank order. Does no I/O. */
function assertApprovedDocs(docs) {
  if (!Array.isArray(docs) || docs.length !== SELECTION_SIZE) {
    throw new Error(`Refusing to write: expected exactly ${SELECTION_SIZE} documents, got ${Array.isArray(docs) ? docs.length : 'none'}.`);
  }
  docs.forEach((d, i) => {
    if (!d || d.id !== APPROVED_IDS[i]) throw new Error(`Refusing to write: document #${i + 1} has id "${d && d.id}", expected "${APPROVED_IDS[i]}".`);
    const data = d.data || {};
    if (data.jurisdiction !== FED_SELECTION_JURISDICTION) throw new Error(`Refusing to write ${d.id}: jurisdiction is "${data.jurisdiction}", expected "${FED_SELECTION_JURISDICTION}".`);
    if (data.country !== 'CA') throw new Error(`Refusing to write ${d.id}: country is "${data.country}", expected "CA".`);
  });
  if (new Set(docs.map((d) => d.id)).size !== docs.length) throw new Error('Refusing to write: duplicate document ids.');
}

/**
 * The whole write path, with the database and the project check injected so it is testable without
 * Firestore. One batched get of the 100 approved ids (never a collection query), then one batch of
 * 100 set() calls. Aborts, writing nothing, if the project is wrong or an unrelated document already
 * occupies one of the 100 ids.
 * @param {{ collection: Function, getAll: Function, batch: Function }} db
 * @param {Array<{ id: string, data: object }>} docs
 * @param {{ verifyProject: () => Promise<string> }} deps
 */
async function writeContracts(db, docs, { verifyProject }) {
  assertApprovedDocs(docs);
  if (typeof verifyProject !== 'function') throw new Error('Refusing to write: no project verifier was supplied.');
  const projectId = await verifyProject();
  const refs = docs.map((d) => db.collection(COLLECTION).doc(d.id));
  const snaps = await db.getAll(...refs);
  const occupied = snaps.filter((s) => s && s.exists);
  const foreign = occupied.filter((s) => (s.data() || {}).jurisdiction !== FED_SELECTION_JURISDICTION).map((s) => s.id);
  if (foreign.length) {
    throw new Error(`Refusing to overwrite ${foreign.length} existing document(s) that are not federal-selection documents (${foreign.slice(0, 5).join(', ')}). Nothing was written.`);
  }
  const batch = db.batch();
  docs.forEach((d, i) => batch.set(refs[i], d.data));
  await batch.commit();
  return { projectId, documents: docs.length, existing_selection_documents_replaced: occupied.length, newly_created: docs.length - occupied.length };
}

function parseArgs(argv) {
  const get = (name) => {
    const a = argv.find((x) => x.startsWith(`--${name}=`));
    return a ? a.slice(name.length + 3) : null;
  };
  return {
    write: argv.includes('--write'),
    rowsFile: get('rows-file'),
    fiscalYear: get('fiscal-year') || DEFAULT_FISCAL_YEAR,
  };
}

function saveReport(name, report) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
  const file = path.join(REPORTS_DIR, name);
  fs.writeFileSync(file, JSON.stringify(report, null, 2) + '\n', 'utf8');
  return file;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const startedAt = new Date().toISOString();
  console.log(args.write
    ? `\n!!! --write given: this run WILL write ${SELECTION_SIZE} documents to ${COLLECTION} !!!\n`
    : '\n[dry-run] No Firestore client will be created. Pass --write to write.\n');

  let rows;
  let perPeriod = null;
  if (args.rowsFile) {
    rows = JSON.parse(fs.readFileSync(args.rowsFile, 'utf8'));
    console.log(`Loaded ${rows.length} rows from ${args.rowsFile}`);
  } else {
    const fetched = await fetchFiscalYearRows(args.fiscalYear);
    rows = fetched.rows;
    perPeriod = fetched.perPeriod;
    console.log(`Fetched ${rows.length} rows from CKAN:`, JSON.stringify(perPeriod));
  }
  // Defensive: only rows from the requested fiscal year may be ranked.
  const periods = new Set(fiscalYearPeriods(args.fiscalYear));
  const inScope = rows.filter((r) => periods.has(r.reporting_period));
  if (inScope.length !== rows.length) console.log(`Ignoring ${rows.length - inScope.length} rows outside ${args.fiscalYear}`);

  const { selected, stats } = selectLargestContracts(inScope, { size: SELECTION_SIZE });
  const meta = buildSelectionMeta(selected, args.fiscalYear, startedAt);
  const docs = selected.map((r) => buildContractDoc(r, meta));

  console.log('\nSelection statistics:', JSON.stringify(stats, null, 2));
  console.log('\nTop 10:');
  docs.slice(0, 10).forEach((d) => console.log(`  #${d.data.rank} ${(d.data.value / 1e6).toFixed(1)}M  ${d.data.contractor_name}  |  ${d.data.department}  |  ${d.data.procurement_id}`));
  console.log(`  ...\n  #${docs.length} ${(docs[docs.length - 1].data.value / 1e6).toFixed(1)}M  ${docs[docs.length - 1].data.contractor_name}`);
  console.log('\n' + meta.selection_label, '| total', meta.selection_total_value);

  const report = {
    run_type: args.write ? 'WRITE' : 'DRY_RUN',
    run_at: startedAt,
    firestore_interaction: args.write ? 'see write_result below' : 'none — dry-run, no Firestore client created',
    dataset: DATASET,
    selection_criteria: {
      fiscal_year: args.fiscalYear,
      reporting_periods: [...periods],
      value_field: 'contract_value (disclosed total incl. amendments), parsed from text; must be > 0',
      identity_of_a_contract: 'procurement_id + normalized vendor name + owner department; then vendor + original value + award date + delivery date',
      which_row_per_contract: 'most recent disclosure (latest reporting period, then latest source row id) — not the maximum',
      size: SELECTION_SIZE,
      tie_break: 'larger value first, then more recent disclosure',
    },
    source_row_counts_by_period: perPeriod,
    statistics: stats,
    selection_meta: meta,
    target_collection: COLLECTION,
    document_ids: docs.length ? [docs[0].id, '...', docs[docs.length - 1].id] : [],
    documents: docs.map((d) => ({ id: d.id, ...d.data })),
  };

  if (!args.write) {
    const f = saveReport('canada-federal-contracts-dry-run-latest.json', report);
    console.log('\nDry-run report saved:', f);
    return;
  }

  const { tryGetFirestore } = require('./firebase-admin-init.cjs');
  const db = tryGetFirestore();
  if (!db) throw new Error('No Firestore credentials available; nothing written.');
  const { verifyFirestoreProject } = require('./lib/firestore-project-guard.cjs');
  try {
    const result = await writeContracts(db, docs, { verifyProject: () => verifyFirestoreProject() });
    report.write_result = { status: 'WRITTEN', ...result };
    console.log(`\nWRITTEN: ${result.documents} documents to ${COLLECTION} in project ${result.projectId} (${result.newly_created} new, ${result.existing_selection_documents_replaced} existing selection documents replaced)`);
  } catch (err) {
    report.write_result = { status: 'FAILED', code: err.code, message: String(err.message || err).slice(0, 300) };
    console.error('\nWRITE FAILED:', report.write_result.message);
    process.exitCode = 1;
  } finally {
    saveReport('canada-federal-contracts-write-latest.json', report);
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error('FAILED:', err.message);
    process.exit(1);
  });
}

module.exports = { parseArgs, writeContracts, assertApprovedDocs, APPROVED_IDS, COLLECTION };
