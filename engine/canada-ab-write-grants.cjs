/**
 * CA-AB (Alberta) — CV-DATA-AB-003 Grants write ONLY.
 *
 * Writes the Alberta Grant Payments Disclosure dataset to Firestore using
 * merge-only. Does NOT touch CV-DATA-AB-001 (unemployment — still blocked by a
 * transient network issue) or CV-DATA-AB-002 (CRA charities — already written in
 * a prior run).
 *
 * Reviewer-approved transformation (2026-08-24): aggregate repeated payment
 * installments by recipient + program before publication. Real payment amounts
 * are summed, not deleted or invented; installment counts are preserved. Rows
 * with no named recipient (Alberta's own privacy-protected program-level totals
 * for individual assistance/benefit programs) are excluded — not written.
 * Implemented in engine/lib/subnational-transparency-ca-ab.cjs buildGrants().
 *
 * Verification record:
 *   CV-REC-001-2026-08-24-CV-DATA-AB-003 (AB Grants)
 *
 * Usage:
 *   node engine/canada-ab-write-grants.cjs
 */

'use strict';

const fs = require('fs');
const path = require('path');

const { tryGetFirestore, describeCredentialSource } = require('./firebase-admin-init.cjs');
const caAb = require('./lib/subnational-transparency-ca-ab.cjs');
const { mergeTransparencyDoc, hasGrantsPayload } = require('./lib/subnational-transparency-shared.cjs');

const REPORTS_DIR = path.join(__dirname, 'reports');
const WRITE_AT = new Date().toISOString();

const COLLECTION = 'subnational_grants';
const JURISDICTION_ID = 'CA-AB';
const VERIFICATION_ID = 'CV-REC-001-2026-08-24-CV-DATA-AB-003';
const MODAL_LABEL = 'Grants';

async function writeAbGrants(db) {
  const result = {
    dataset_id: 'CV-DATA-AB-003',
    dataset_name: 'Alberta Grant Payments Disclosure (Alberta Open Government) — aggregated by recipient+program',
    verification_id: VERIFICATION_ID,
    firestore_path: `${COLLECTION}/${JURISDICTION_ID}`,
    write_mode: 'merge',
    write_at: WRITE_AT,
    status: null,
    error: null,
    reporting_period: null,
    records_written: null,
    raw_row_count: null,
    aggregated_group_count: null,
    fields_written: [],
    sample_written: [],
    warnings: [],
    ui_renderable: true,
    modal_label: MODAL_LABEL,
  };

  try {
    console.log('[canada-ab-write-grants] CV-DATA-AB-003: fetching…');
    const doc = await caAb.buildGrants();

    if (!hasGrantsPayload(doc)) {
      throw new Error('No grants payload (records array empty) — refusing to write');
    }

    // Defensive guard: refuse to write if any record has no recipient name or a
    // non-positive installment count — both would indicate the aggregation step
    // did not run as expected.
    const malformed = doc.records.filter(
      (r) => !r.recipientName || !Number.isFinite(r.installmentCount) || r.installmentCount < 1,
    );
    if (malformed.length) {
      throw new Error(
        `Refusing to write: ${malformed.length} record(s) missing recipientName or a valid installmentCount — ` +
        `aggregation may not have run correctly.`,
      );
    }

    // Metadata required by this task: source URL, licence, reporting period,
    // fetched date, transformation note, raw/aggregated row counts, filter note.
    doc.verification_status = VERIFICATION_ID;
    doc.licence_note = `${doc.licence || 'Open Government Licence - Alberta'}. Attribution: "Government of Alberta — Grant payments disclosure."`;
    doc.cv_data_id = 'CV-DATA-AB-003';
    doc.modal_label = MODAL_LABEL;
    doc.filter_note =
      `Rows with no named recipient are excluded — these are Alberta's own privacy-protected program-level totals ` +
      `for individual assistance/benefit programs (e.g. AISH, income support, seniors benefits), not identifiable ` +
      `payees. ${doc.blank_recipient_rows_excluded || 0} of ${doc.total_rows_in_source || 0} source rows excluded on this basis.`;
    // doc.transformation_note is already set by buildGrants() to the exact reviewer-required wording.
    doc.fetched_at_write = WRITE_AT;

    console.log('[canada-ab-write-grants] CV-DATA-AB-003: writing to Firestore (merge)…');
    const wr = await mergeTransparencyDoc(db, COLLECTION, JURISDICTION_ID, doc, 'grants');
    if (!wr.written) throw new Error(`mergeTransparencyDoc returned written=false: ${wr.reason}`);

    result.status = 'WRITTEN';
    result.reporting_period = doc.reporting_period || `FY ${doc.fiscal_year}` || null;
    result.source_url = doc.source_url || null;
    result.resource_url = doc.resource_url || null;
    result.licence = doc.licence || null;
    result.records_written = doc.records_stored || doc.records.length;
    result.raw_row_count = doc.raw_row_count ?? null;
    result.aggregated_group_count = doc.aggregated_group_count ?? null;
    result.blank_recipient_rows_excluded = doc.blank_recipient_rows_excluded ?? null;
    result.transformation_note = doc.transformation_note || null;
    result.filter_note = doc.filter_note || null;
    result.sample_written = doc.records.slice(0, 10);
    result.fields_written = Object.keys(doc).filter((k) => doc[k] != null);

    console.log(`[canada-ab-write-grants] CV-DATA-AB-003 written (${result.records_written} aggregated records from ${result.raw_row_count} raw rows / ${result.aggregated_group_count} distinct groups).`);
  } catch (err) {
    result.status = 'FAILED';
    result.error = err.message || String(err);
  }

  return result;
}

async function main() {
  console.log('[canada-ab-write-grants] ============================================');
  console.log('[canada-ab-write-grants] CA-AB — CV-DATA-AB-003 Grants Firestore write');
  console.log('[canada-ab-write-grants] CV-DATA-AB-001 (unemployment) and CV-DATA-AB-002 (CRA charities) are NOT touched by this script');
  console.log(`[canada-ab-write-grants] Started: ${WRITE_AT}`);
  console.log('[canada-ab-write-grants] ============================================');

  const db = tryGetFirestore();
  if (!db) {
    console.error('[canada-ab-write-grants] FATAL: Firebase credentials not found.');
    console.error('[canada-ab-write-grants] Credential source:', describeCredentialSource());
    process.exit(1);
  }
  console.log(`[canada-ab-write-grants] Firebase connected (${describeCredentialSource()})`);

  const result = await writeAbGrants(db);

  await db.terminate();

  // ─── Write standalone report ────────────────────────────────────────────────
  if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });
  const ts = WRITE_AT.replace(/[:.]/g, '-').replace('T', '_').slice(0, 19);
  const reportPath = path.join(REPORTS_DIR, `canada-ab-write-grants-${ts}.json`);
  const report = { run_type: 'FIRESTORE_WRITE', write_at: WRITE_AT, jurisdiction: 'CA-AB', dataset: result };
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');

  // ─── Merge into the shared canada-ab-write-latest.json ──────────────────────
  const sharedLatestPath = path.join(REPORTS_DIR, 'canada-ab-write-latest.json');
  let shared;
  try {
    shared = JSON.parse(fs.readFileSync(sharedLatestPath, 'utf8'));
  } catch (_) {
    shared = { run_type: 'FIRESTORE_WRITE', jurisdiction: 'CA-AB', datasets: [], deliberately_excluded: [] };
  }
  shared.datasets = (shared.datasets || []).filter((d) => d.dataset_id !== 'CV-DATA-AB-003');
  shared.datasets.push({ ...result, write_at: WRITE_AT });
  shared.deliberately_excluded = (shared.deliberately_excluded || []).filter(
    (s) => !String(s).startsWith('CV-DATA-AB-003'),
  );
  if (!shared.deliberately_excluded.some((s) => String(s).startsWith('CV-DATA-AB-001'))) {
    shared.deliberately_excluded.push(
      'CV-DATA-AB-001 — Unemployment — automated Node fetch pipeline hit a transient ECONNRESET against the Stats Can API; coordinate independently confirmed correct via curl; write only after a clean automated fetch succeeds.',
    );
  }
  shared.last_updated = WRITE_AT;
  shared.summary = {
    total_attempted: shared.datasets.length,
    written: shared.datasets.filter((d) => d.status === 'WRITTEN').length,
    failed: shared.datasets.filter((d) => d.status === 'FAILED').length,
    warnings_total: shared.datasets.reduce((s, d) => s + (d.warnings?.length || 0), 0),
  };
  fs.writeFileSync(sharedLatestPath, JSON.stringify(shared, null, 2), 'utf8');

  // ─── Console summary ─────────────────────────────────────────────────────────
  console.log('\n[canada-ab-write-grants] ============ WRITE SUMMARY ============');
  const icon = result.status === 'WRITTEN' ? '✓' : '✗';
  console.log(`\n  ${icon} ${result.dataset_id} — ${result.dataset_name}`);
  console.log(`    status:            ${result.status}`);
  if (result.error) console.log(`    error:             ${result.error}`);
  if (result.reporting_period) console.log(`    period:            ${result.reporting_period}`);
  if (result.records_written != null) console.log(`    records written:   ${result.records_written}`);
  if (result.raw_row_count != null)
    console.log(`    aggregation:       ${result.raw_row_count} raw rows → ${result.aggregated_group_count} distinct groups → ${result.records_written} stored`);
  console.log(`    firestore path:    ${result.firestore_path}`);
  console.log(`    verification:      ${result.verification_id}`);
  console.log(`    modal label:       ${result.modal_label}`);
  console.log(`\n  Report:        ${reportPath}`);
  console.log(`  Shared latest: ${sharedLatestPath}`);
  console.log('\n[canada-ab-write-grants] done.');

  if (result.status !== 'WRITTEN') process.exit(1);
}

main().catch((err) => {
  console.error('[canada-ab-write-grants] fatal:', err);
  process.exit(1);
});
