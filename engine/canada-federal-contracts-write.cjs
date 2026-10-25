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
 * NOT done by this script: it does not delete any pre-existing
 * `jurisdiction == 'CA'` documents. In --write mode it only COUNTS them
 * (one aggregate read) and reports the number so a human can decide.
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
} = require('./lib/canada-federal-contracts.cjs');

// CV_REPORTS_DIR lets tests write their report somewhere else than engine/reports.
const REPORTS_DIR = process.env.CV_REPORTS_DIR || path.join(__dirname, 'reports');
const COLLECTION = 'government_contracts';

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
  try {
    let legacy = null;
    try {
      const agg = await db.collection(COLLECTION).where('jurisdiction', '==', 'CA').count().get();
      legacy = agg.data().count;
    } catch (e) {
      legacy = `count failed: ${String(e.message || e).slice(0, 120)}`;
    }
    console.log(`Existing documents with jurisdiction == 'CA' before this write: ${legacy} (not deleted by this script)`);
    const batch = db.batch();
    docs.forEach((d) => batch.set(db.collection(COLLECTION).doc(d.id), d.data));
    await batch.commit();
    report.write_result = { status: 'WRITTEN', documents: docs.length, existing_ca_documents_before_write: legacy };
    console.log(`\nWRITTEN: ${docs.length} documents to ${COLLECTION}`);
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

module.exports = { parseArgs };
