/**
 * ============================================================================
 * ⚠️  THIS SCRIPT WRITES TO FIRESTORE WHEN EXECUTED.  ⚠️
 * ============================================================================
 *
 * Batch unemployment write for all 11 provinces/territories whose StatCan
 * fetch was confirmed working via the WDS reliability helper
 * (engine/lib/subnational-unemployment-monthly.cjs, statcanWdsPostJson —
 * see engine/reports/statcan-wds-reliability-test-latest.json) but whose
 * Firestore write is still pending because the project's Firestore quota was
 * exhausted (RESOURCE_EXHAUSTED) at the time each was dry-run tested.
 *
 * PREPARED IN ADVANCE — NOT RUN YET. Do not execute this script until the
 * Firestore quota has been confirmed clear (e.g. via a single lightweight
 * read probe). See engine/reports/canada-pending-write-queue-latest.json
 * for the full context this script was built from.
 *
 * Jurisdictions written (CV-DATA-XX-001, target
 * subnational_economic_social_stats/CA-XX, merge-only):
 *   CA-AB, CA-QC, CA-SK, CA-MB, CA-NS, CA-NB, CA-NL, CA-PE  (Table 14-10-0287-01)
 *   CA-YT, CA-NT, CA-NU                                     (Table 14-10-0292-01, territorial)
 *
 * Safety:
 *   - This module does NOT execute on require()/import — main() only runs
 *     when this file is invoked directly (`node engine/canada-unemployment-batch-write.cjs`).
 *   - Each jurisdiction's fetch+write is independently wrapped: a failure
 *     (fetch error, ECONNRESET recurrence, Firestore error, etc.) marks that
 *     jurisdiction FAILED and the batch continues to the next one — one bad
 *     jurisdiction never aborts the whole run.
 *   - merge-only writes via mergeTransparencyDoc(..., 'economic') — never
 *     overwrites unrelated fields already on each CA-XX economic doc (e.g.
 *     any existing non-unemployment fields), and never writes charities or
 *     grants collections.
 *
 * Usage (only after Firestore quota is confirmed clear):
 *   node engine/canada-unemployment-batch-write.cjs
 *
 * Optional: restrict to a subset for a smaller/safer first batch, e.g. after
 * confirming quota with a single write:
 *   node engine/canada-unemployment-batch-write.cjs --only=CA-YT
 *   node engine/canada-unemployment-batch-write.cjs --only=CA-AB,CA-QC,CA-SK
 */

'use strict';

const fs = require('fs');
const path = require('path');

const { tryGetFirestore, describeCredentialSource } = require('./firebase-admin-init.cjs');
const { mergeTransparencyDoc, hasEconomicPayload } = require('./lib/subnational-transparency-shared.cjs');

const REPORTS_DIR = path.join(__dirname, 'reports');
const COLLECTION = 'subnational_economic_social_stats';
const VERIFICATION_DATE = '2026-09-07';

/**
 * One entry per jurisdiction. `mod` is lazily required inside runOne() so
 * that importing this file never triggers any of the province/territory
 * modules' own module-load side effects beyond a plain require() (none of
 * them have any — this is just extra caution).
 */
const JURISDICTIONS = [
  { id: 'CA-AB', code: 'AB', modPath: './lib/subnational-transparency-ca-ab.cjs', datasetId: 'CV-DATA-AB-001', table: '14-10-0287-01' },
  { id: 'CA-QC', code: 'QC', modPath: './lib/subnational-transparency-ca-qc.cjs', datasetId: 'CV-DATA-QC-001', table: '14-10-0287-01' },
  { id: 'CA-SK', code: 'SK', modPath: './lib/subnational-transparency-ca-sk.cjs', datasetId: 'CV-DATA-SK-001', table: '14-10-0287-01' },
  { id: 'CA-MB', code: 'MB', modPath: './lib/subnational-transparency-ca-mb.cjs', datasetId: 'CV-DATA-MB-001', table: '14-10-0287-01' },
  { id: 'CA-NS', code: 'NS', modPath: './lib/subnational-transparency-ca-ns.cjs', datasetId: 'CV-DATA-NS-001', table: '14-10-0287-01' },
  { id: 'CA-NB', code: 'NB', modPath: './lib/subnational-transparency-ca-nb.cjs', datasetId: 'CV-DATA-NB-001', table: '14-10-0287-01' },
  { id: 'CA-NL', code: 'NL', modPath: './lib/subnational-transparency-ca-nl.cjs', datasetId: 'CV-DATA-NL-001', table: '14-10-0287-01' },
  { id: 'CA-PE', code: 'PE', modPath: './lib/subnational-transparency-ca-pe.cjs', datasetId: 'CV-DATA-PE-001', table: '14-10-0287-01' },
  { id: 'CA-YT', code: 'YT', modPath: './lib/subnational-transparency-ca-yt.cjs', datasetId: 'CV-DATA-YT-001', table: '14-10-0292-01' },
  { id: 'CA-NT', code: 'NT', modPath: './lib/subnational-transparency-ca-nt.cjs', datasetId: 'CV-DATA-NT-001', table: '14-10-0292-01' },
  { id: 'CA-NU', code: 'NU', modPath: './lib/subnational-transparency-ca-nu.cjs', datasetId: 'CV-DATA-NU-001', table: '14-10-0292-01' },
];

function parseOnlyFilter(argv) {
  const arg = argv.find((a) => a.startsWith('--only='));
  if (!arg) return null;
  const ids = arg.slice('--only='.length).split(',').map((s) => s.trim().toUpperCase()).filter(Boolean);
  return ids.length ? new Set(ids) : null;
}

/**
 * Fetch + merge-write one jurisdiction's unemployment doc. Never throws —
 * always returns a result object with status WRITTEN or FAILED, so the
 * caller's batch loop never needs its own try/catch.
 */
async function runOne(db, entry, writeAt) {
  const result = {
    dataset_id: entry.datasetId,
    jurisdiction_id: entry.id,
    dataset_name: `Statistics Canada — ${entry.id} Unemployment (Table ${entry.table})`,
    verification_id: `CV-REC-001-${VERIFICATION_DATE}-${entry.datasetId}`,
    firestore_path: `${COLLECTION}/${entry.id}`,
    write_mode: 'merge',
    write_at: writeAt,
    statcan_table: entry.table,
    coordinate: null,
    source_url: null,
    status: null,
    error: null,
    reporting_period: null,
    records_written: null,
    latest_rate: null,
    latest_period: null,
    fields_written: [],
    sample_written: [],
    warnings: [],
    ui_renderable: true,
  };

  try {
    // eslint-disable-next-line global-require, import/no-dynamic-require
    const mod = require(entry.modPath);
    const coordKey = `STATCAN_${entry.code}_COORD`;
    result.coordinate = mod[coordKey] || null;

    console.log(`[canada-unemployment-batch-write] ${entry.id} (${entry.datasetId}): fetching coord ${result.coordinate} (Table ${entry.table})…`);
    const doc = await mod.buildEconomic();

    const notes = doc?.data_status?.notes || [];
    if (notes.length) result.warnings.push(...notes);

    if (!hasEconomicPayload(doc)) {
      throw new Error(`No economic payload (unemployment series empty) — refusing to write. Notes: ${notes.join('; ') || 'none'}`);
    }

    doc.verification_status = result.verification_id;
    doc.licence_note = `Statistics Canada Open Licence. Attribution: "Statistics Canada. Table ${entry.table}."`;
    doc.cv_data_id = entry.datasetId;

    console.log(`[canada-unemployment-batch-write] ${entry.id} (${entry.datasetId}): writing to Firestore (merge)…`);
    const wr = await mergeTransparencyDoc(db, COLLECTION, entry.id, doc, 'economic');
    if (!wr.written) throw new Error(`mergeTransparencyDoc returned written=false: ${wr.reason}`);

    result.status = 'WRITTEN';
    result.reporting_period = doc.unemployment_reporting_period || doc.reporting_period || null;
    result.source_url = doc.unemployment_source_url || mod.SOURCES?.unemployment || null;
    result.latest_rate = doc.unemployment_latest_rate ?? null;
    result.latest_period = doc.unemployment_latest_period ?? null;

    const series = doc.unemployment_series_monthly || doc.unemployment_series_rolling_3_month || [];
    result.records_written = series.length;
    result.sample_written = series.slice(-3);
    result.fields_written = Object.keys(doc).filter((k) => doc[k] != null);

    console.log(`[canada-unemployment-batch-write] ${entry.id} WRITTEN — ${result.latest_rate}% (${result.latest_period}), ${series.length} monthly points.`);
  } catch (err) {
    result.status = 'FAILED';
    result.error = err.message || String(err);
    console.log(`[canada-unemployment-batch-write] ${entry.id} FAILED — ${result.error.slice(0, 160)}`);
  }

  return result;
}

async function runBatch(only) {
  const writeAt = new Date().toISOString();
  const targets = only ? JURISDICTIONS.filter((j) => only.has(j.id)) : JURISDICTIONS;

  console.log('[canada-unemployment-batch-write] ============================================');
  console.log('[canada-unemployment-batch-write] ⚠️  THIS RUN WILL WRITE TO FIRESTORE  ⚠️');
  console.log(`[canada-unemployment-batch-write] Jurisdictions in this run: ${targets.map((t) => t.id).join(', ')}`);
  console.log(`[canada-unemployment-batch-write] Started: ${writeAt}`);
  console.log('[canada-unemployment-batch-write] ============================================');

  const db = tryGetFirestore();
  if (!db) {
    console.error('[canada-unemployment-batch-write] FATAL: Firebase credentials not found.');
    console.error('[canada-unemployment-batch-write] Credential source:', describeCredentialSource());
    process.exit(1);
  }
  console.log(`[canada-unemployment-batch-write] Firebase connected (${describeCredentialSource()})`);

  const results = [];
  for (const entry of targets) {
    // Sequential, not Promise.all — keeps StatCan WDS load gentle and keeps
    // per-jurisdiction console output readable; a slow/failed jurisdiction
    // never blocks the others since runOne() never throws.
    // eslint-disable-next-line no-await-in-loop
    results.push(await runOne(db, entry, writeAt));
  }

  await db.terminate();

  const report = {
    run_type: 'FIRESTORE_WRITE_BATCH',
    write_at: writeAt,
    scope: 'Unemployment only (subnational_economic_social_stats), merge-only, all provinces/territories confirmed working via the StatCan WDS reliability helper',
    jurisdictions_attempted: targets.map((t) => t.id),
    datasets: results,
    summary: {
      total_attempted: results.length,
      written: results.filter((r) => r.status === 'WRITTEN').length,
      failed: results.filter((r) => r.status === 'FAILED').length,
      warnings_total: results.reduce((s, r) => s + (r.warnings?.length || 0), 0),
    },
  };

  if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });
  const ts = writeAt.replace(/[:.]/g, '-').replace('T', '_').slice(0, 19);
  const reportPath = path.join(REPORTS_DIR, `canada-unemployment-batch-write-${ts}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
  const latestPath = path.join(REPORTS_DIR, 'canada-unemployment-batch-write-latest.json');
  fs.writeFileSync(latestPath, JSON.stringify(report, null, 2), 'utf8');

  console.log('\n[canada-unemployment-batch-write] ============ BATCH SUMMARY ============');
  for (const r of results) {
    const icon = r.status === 'WRITTEN' ? '✓' : '✗';
    console.log(`  ${icon} ${r.jurisdiction_id.padEnd(6)} ${r.dataset_id}  ${r.status}${r.latest_rate != null ? `  ${r.latest_rate}% (${r.latest_period})` : ''}${r.error ? `  — ${r.error.slice(0, 100)}` : ''}`);
  }
  console.log(`\n  Written: ${report.summary.written}/${report.summary.total_attempted}`);
  console.log(`  Report: ${reportPath}`);
  console.log(`  Latest: ${latestPath}`);
  console.log('\n[canada-unemployment-batch-write] done.');

  return report;
}

// Only executes when run directly (`node engine/canada-unemployment-batch-write.cjs`).
// require()-ing this module elsewhere never triggers a Firestore write.
if (require.main === module) {
  const only = parseOnlyFilter(process.argv.slice(2));
  runBatch(only).catch((err) => {
    console.error('[canada-unemployment-batch-write] fatal:', err);
    process.exit(1);
  });
}

module.exports = { runBatch, JURISDICTIONS };
