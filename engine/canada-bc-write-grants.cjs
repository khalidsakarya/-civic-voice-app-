/**
 * CA-BC (British Columbia) — CV-DATA-BC-003 Public Payments write ONLY.
 *
 * Writes the BC CRF Detailed Schedules of Payments — Other Supplier Payments dataset
 * to Firestore using merge-only. Does NOT touch CV-DATA-BC-001 (unemployment) or
 * CV-DATA-BC-002 (CRA charities) — those were already written in a prior run.
 *
 * Reviewer-approved exclusion (accounting-category aggregate rows, not real payees):
 *   PUBLIC DEBT SERVICING COSTS, REVENUE REFUNDS, MISCELLANEOUS
 * Enforced in engine/lib/subnational-transparency-ca-bc.cjs via
 * isBcAccountingAggregatePayee(). This script re-checks the built payload before
 * writing as a defensive guard and refuses to write if any excluded name is present.
 *
 * Verification record:
 *   CV-REC-001-2026-08-23-CV-DATA-BC-003 (BC Public Payments)
 *
 * Usage:
 *   node engine/canada-bc-write-grants.cjs
 */

'use strict';

const fs = require('fs');
const path = require('path');

const { tryGetFirestore, describeCredentialSource } = require('./firebase-admin-init.cjs');
const caBc = require('./lib/subnational-transparency-ca-bc.cjs');
const { mergeTransparencyDoc, hasGrantsPayload } = require('./lib/subnational-transparency-shared.cjs');

const REPORTS_DIR = path.join(__dirname, 'reports');
const WRITE_AT = new Date().toISOString();

const COLLECTION = 'subnational_grants';
const JURISDICTION_ID = 'CA-BC';
const VERIFICATION_ID = 'CV-REC-001-2026-08-23-CV-DATA-BC-003';
const MODAL_LABEL = 'Public Payments';

// Reviewer-approved exclusion list — re-checked here as a defensive guard.
const FORBIDDEN_AGGREGATE_NAMES = new Set([
  'PUBLIC DEBT SERVICING COSTS',
  'REVENUE REFUNDS',
  'MISCELLANEOUS',
]);

async function writeBcPublicPayments(db) {
  const result = {
    dataset_id: 'CV-DATA-BC-003',
    dataset_name: 'BC Government Public Payments (BC Data Catalogue — CRF Other Supplier Payments)',
    verification_id: VERIFICATION_ID,
    firestore_path: `${COLLECTION}/${JURISDICTION_ID}`,
    write_mode: 'merge',
    write_at: WRITE_AT,
    status: null,
    error: null,
    reporting_period: null,
    records_written: null,
    aggregate_rows_excluded_count: null,
    aggregate_rows_excluded: null,
    fields_written: [],
    sample_written: [],
    warnings: [],
    ui_renderable: true,
    modal_label: MODAL_LABEL,
  };

  try {
    console.log('[canada-bc-write-grants] CV-DATA-BC-003: fetching…');
    const doc = await caBc.buildGrants();

    if (!hasGrantsPayload(doc)) {
      throw new Error('No grants payload (records array empty) — refusing to write');
    }

    // Defensive guard: refuse to write if any reviewer-excluded aggregate name slipped through.
    const violators = doc.records.filter((r) => FORBIDDEN_AGGREGATE_NAMES.has(String(r.recipientName || '').trim().toUpperCase()));
    if (violators.length) {
      throw new Error(
        `Refusing to write: ${violators.length} accounting-aggregate row(s) present in top records despite exclusion filter: ` +
        violators.map((v) => v.recipientName).join(', '),
      );
    }

    // Metadata required by this task: source URL, licence, reporting period, fetched date,
    // transformation note, filter note, verification, modal label.
    doc.verification_status = VERIFICATION_ID;
    doc.licence_note = `${doc.licence || 'Open Government Licence - British Columbia'}. Attribution: "Government of British Columbia — ${doc.data_source ? doc.data_source.split(' — ')[0].replace('Government of British Columbia — ', '') : 'CRF Detailed Schedules of Payments - Other Supplier Payments'}."`;
    doc.cv_data_id = 'CV-DATA-BC-003';
    doc.modal_label = MODAL_LABEL;
    doc.filter_note =
      'Reviewer-approved filter (2026-08-23): excludes accounting-category aggregate rows that are not real ' +
      'recipients/payees — "PUBLIC DEBT SERVICING COSTS", "REVENUE REFUNDS", "MISCELLANEOUS". ' +
      `${doc.aggregate_rows_excluded_count || 0} row(s) excluded from this fetch: ${(doc.aggregate_rows_excluded || []).join(', ') || 'none present in this fetch'}.`;
    doc.fetched_at_write = WRITE_AT;

    console.log('[canada-bc-write-grants] CV-DATA-BC-003: writing to Firestore (merge)…');
    const wr = await mergeTransparencyDoc(db, COLLECTION, JURISDICTION_ID, doc, 'grants');
    if (!wr.written) throw new Error(`mergeTransparencyDoc returned written=false: ${wr.reason}`);

    result.status = 'WRITTEN';
    result.reporting_period = doc.reporting_period || `FY ${doc.fiscal_year}` || null;
    result.source_url = doc.source_url || null;
    result.resource_url = doc.resource_url || null;
    result.licence = doc.licence || null;
    result.records_written = doc.records_stored || doc.records.length;
    result.aggregate_rows_excluded_count = doc.aggregate_rows_excluded_count ?? 0;
    result.aggregate_rows_excluded = doc.aggregate_rows_excluded || [];
    result.sample_written = doc.records.slice(0, 10);
    result.fields_written = Object.keys(doc).filter((k) => doc[k] != null);

    console.log(`[canada-bc-write-grants] CV-DATA-BC-003 written (${result.records_written} records, ${result.aggregate_rows_excluded_count} aggregate rows excluded).`);
  } catch (err) {
    result.status = 'FAILED';
    result.error = err.message || String(err);
  }

  return result;
}

async function main() {
  console.log('[canada-bc-write-grants] ============================================');
  console.log('[canada-bc-write-grants] CA-BC — CV-DATA-BC-003 Public Payments Firestore write');
  console.log('[canada-bc-write-grants] CV-DATA-BC-001 and CV-DATA-BC-002 are NOT touched by this script');
  console.log(`[canada-bc-write-grants] Started: ${WRITE_AT}`);
  console.log('[canada-bc-write-grants] ============================================');

  const db = tryGetFirestore();
  if (!db) {
    console.error('[canada-bc-write-grants] FATAL: Firebase credentials not found.');
    console.error('[canada-bc-write-grants] Credential source:', describeCredentialSource());
    process.exit(1);
  }
  console.log(`[canada-bc-write-grants] Firebase connected (${describeCredentialSource()})`);

  const result = await writeBcPublicPayments(db);

  await db.terminate();

  // ─── Write standalone report ────────────────────────────────────────────────
  if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });
  const ts = WRITE_AT.replace(/[:.]/g, '-').replace('T', '_').slice(0, 19);
  const reportPath = path.join(REPORTS_DIR, `canada-bc-write-grants-${ts}.json`);
  const report = { run_type: 'FIRESTORE_WRITE', write_at: WRITE_AT, jurisdiction: 'CA-BC', dataset: result };
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');

  // ─── Merge into the shared canada-bc-write-latest.json ──────────────────────
  const sharedLatestPath = path.join(REPORTS_DIR, 'canada-bc-write-latest.json');
  let shared;
  try {
    shared = JSON.parse(fs.readFileSync(sharedLatestPath, 'utf8'));
  } catch (_) {
    shared = { run_type: 'FIRESTORE_WRITE', jurisdiction: 'CA-BC', datasets: [], deliberately_excluded: [] };
  }
  shared.datasets = (shared.datasets || []).filter((d) => d.dataset_id !== 'CV-DATA-BC-003');
  shared.datasets.push({ ...result, write_at: WRITE_AT });
  shared.deliberately_excluded = (shared.deliberately_excluded || []).filter(
    (s) => !String(s).startsWith('CV-DATA-BC-003'),
  );
  shared.last_updated = WRITE_AT;
  shared.summary = {
    total_attempted: shared.datasets.length,
    written: shared.datasets.filter((d) => d.status === 'WRITTEN').length,
    failed: shared.datasets.filter((d) => d.status === 'FAILED').length,
    warnings_total: shared.datasets.reduce((s, d) => s + (d.warnings?.length || 0), 0),
  };
  fs.writeFileSync(sharedLatestPath, JSON.stringify(shared, null, 2), 'utf8');

  // ─── Console summary ─────────────────────────────────────────────────────────
  console.log('\n[canada-bc-write-grants] ============ WRITE SUMMARY ============');
  const icon = result.status === 'WRITTEN' ? '✓' : '✗';
  console.log(`\n  ${icon} ${result.dataset_id} — ${result.dataset_name}`);
  console.log(`    status:            ${result.status}`);
  if (result.error) console.log(`    error:             ${result.error}`);
  if (result.reporting_period) console.log(`    period:            ${result.reporting_period}`);
  if (result.records_written != null) console.log(`    records written:   ${result.records_written}`);
  if (result.aggregate_rows_excluded_count != null)
    console.log(`    aggregate excluded: ${result.aggregate_rows_excluded_count} (${(result.aggregate_rows_excluded || []).join(', ') || 'none'})`);
  console.log(`    firestore path:    ${result.firestore_path}`);
  console.log(`    verification:      ${result.verification_id}`);
  console.log(`    modal label:       ${result.modal_label}`);
  console.log(`\n  Report:        ${reportPath}`);
  console.log(`  Shared latest: ${sharedLatestPath}`);
  console.log('\n[canada-bc-write-grants] done.');

  if (result.status !== 'WRITTEN') process.exit(1);
}

main().catch((err) => {
  console.error('[canada-bc-write-grants] fatal:', err);
  process.exit(1);
});
