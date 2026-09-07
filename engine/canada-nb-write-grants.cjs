/**
 * CA-NB (New Brunswick) — CV-DATA-NB-003 Public Payments write ONLY.
 *
 * Writes the New Brunswick "Combined Supplier and Grant Payments" dataset
 * (gnb.socrata.com) to Firestore using merge-only. Does NOT touch
 * CV-DATA-NB-001 (unemployment — automated fetch still blocked by a
 * transient network issue) or CV-DATA-NB-002 (CRA Charities — written
 * separately by canada-nb-write-charities.cjs).
 *
 * Approval (2026-09-07): write CA-NB-003 Public Payments.
 *   Target: subnational_grants/CA-NB, merge-only.
 *   Public label: "Public Payments" (NOT "Grants") — the source dataset
 *   combines supplier payments, grants/contributions, AND purchase-card
 *   spending (confirmed via a full-dataset payment-type breakdown query:
 *   5,901 "Payments & Grants" rows + 111 "Purchase Cards" rows across all
 *   6,012 rows), so "Grants" alone would misrepresent scope.
 *
 * Verification record:
 *   CV-REC-001-2026-09-07-CV-DATA-NB-003 (NB Public Payments)
 *
 * Usage:
 *   node engine/canada-nb-write-grants.cjs
 */

'use strict';

const fs = require('fs');
const path = require('path');

const { tryGetFirestore, describeCredentialSource } = require('./firebase-admin-init.cjs');
const caNb = require('./lib/subnational-transparency-ca-nb.cjs');
const { mergeTransparencyDoc, hasGrantsPayload } = require('./lib/subnational-transparency-shared.cjs');

const REPORTS_DIR = path.join(__dirname, 'reports');
const WRITE_AT = new Date().toISOString();

const COLLECTION = 'subnational_grants';
const JURISDICTION_ID = 'CA-NB';
const VERIFICATION_ID = 'CV-REC-001-2026-09-07-CV-DATA-NB-003';
const MODAL_LABEL = 'Public Payments';

async function writeNbGrants(db) {
  const result = {
    dataset_id: 'CV-DATA-NB-003',
    dataset_name: 'New Brunswick Combined Supplier and Grant Payments (labelled "Public Payments")',
    verification_id: VERIFICATION_ID,
    firestore_path: `${COLLECTION}/${JURISDICTION_ID}`,
    write_mode: 'merge',
    write_at: WRITE_AT,
    status: null,
    error: null,
    reporting_period: null,
    records_written: null,
    fields_written: [],
    sample_written: [],
    warnings: [],
    ui_renderable: true,
    modal_label: MODAL_LABEL,
    label_reason: 'Source dataset spans supplier payments, grants/contributions, AND purchase-card spending — broader than grants alone, so "Public Payments" is the accurate label rather than "Grants".',
  };

  try {
    console.log('[canada-nb-write-grants] CV-DATA-NB-003: fetching…');
    const doc = await caNb.buildGrants();

    if (!hasGrantsPayload(doc)) {
      throw new Error('No grants payload (records array empty) — refusing to write');
    }

    doc.verification_status = VERIFICATION_ID;
    doc.licence_note = 'Government of New Brunswick Open Data Licence. Source: New Brunswick Combined Supplier and Grant Payments (gnb.socrata.com).';
    doc.cv_data_id = 'CV-DATA-NB-003';
    doc.modal_label = MODAL_LABEL;
    doc.fetched_at_write = WRITE_AT;

    console.log('[canada-nb-write-grants] CV-DATA-NB-003: writing to Firestore (merge)…');
    const wr = await mergeTransparencyDoc(db, COLLECTION, JURISDICTION_ID, doc, 'grants');
    if (!wr.written) throw new Error(`mergeTransparencyDoc returned written=false: ${wr.reason}`);

    result.status = 'WRITTEN';
    result.reporting_period = doc.fiscalYear || doc.data_source || 'Latest published NB Combined Supplier and Grant Payments extract';
    result.source_url = doc.source_url || caNb.SOURCES.nbCkanSearch;
    result.records_written = doc.records_stored || doc.records.length;
    result.sample_written = doc.records.slice(0, 10);
    result.fields_written = Object.keys(doc).filter((k) => doc[k] != null);

    console.log(`[canada-nb-write-grants] CV-DATA-NB-003 written (${result.records_written} records).`);
  } catch (err) {
    result.status = 'FAILED';
    result.error = err.message || String(err);
  }

  return result;
}

async function main() {
  console.log('[canada-nb-write-grants] ============================================');
  console.log('[canada-nb-write-grants] CA-NB — CV-DATA-NB-003 Public Payments Firestore write');
  console.log('[canada-nb-write-grants] CV-DATA-NB-001 (unemployment) and CV-DATA-NB-002 (charities) are NOT touched by this script');
  console.log(`[canada-nb-write-grants] Started: ${WRITE_AT}`);
  console.log('[canada-nb-write-grants] ============================================');

  const db = tryGetFirestore();
  if (!db) {
    console.error('[canada-nb-write-grants] FATAL: Firebase credentials not found.');
    console.error('[canada-nb-write-grants] Credential source:', describeCredentialSource());
    process.exit(1);
  }
  console.log(`[canada-nb-write-grants] Firebase connected (${describeCredentialSource()})`);

  const result = await writeNbGrants(db);

  await db.terminate();

  if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });
  const ts = WRITE_AT.replace(/[:.]/g, '-').replace('T', '_').slice(0, 19);
  const reportPath = path.join(REPORTS_DIR, `canada-nb-write-grants-${ts}.json`);
  const report = { run_type: 'FIRESTORE_WRITE', write_at: WRITE_AT, jurisdiction: 'CA-NB', dataset: result };
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');

  const sharedLatestPath = path.join(REPORTS_DIR, 'canada-nb-write-latest.json');
  let shared;
  try {
    shared = JSON.parse(fs.readFileSync(sharedLatestPath, 'utf8'));
  } catch (_) {
    shared = { run_type: 'FIRESTORE_WRITE', jurisdiction: 'CA-NB', datasets: [], deliberately_excluded: [] };
  }
  shared.datasets = (shared.datasets || []).filter((d) => d.dataset_id !== 'CV-DATA-NB-003');
  shared.datasets.push({ ...result, write_at: WRITE_AT });
  if (!(shared.deliberately_excluded || []).some((s) => String(s).startsWith('CV-DATA-NB-001'))) {
    shared.deliberately_excluded = [
      ...(shared.deliberately_excluded || []),
      'CV-DATA-NB-001 — Unemployment — automated Node fetch pipeline hit a transient ECONNRESET against the Stats Can API; coordinate independently confirmed correct via curl; write only after a clean automated fetch succeeds.',
    ];
  }
  shared.last_updated = WRITE_AT;
  shared.summary = {
    total_attempted: shared.datasets.length,
    written: shared.datasets.filter((d) => d.status === 'WRITTEN').length,
    failed: shared.datasets.filter((d) => d.status === 'FAILED').length,
    warnings_total: shared.datasets.reduce((s, d) => s + (d.warnings?.length || 0), 0),
  };
  fs.writeFileSync(sharedLatestPath, JSON.stringify(shared, null, 2), 'utf8');

  console.log('\n[canada-nb-write-grants] ============ WRITE SUMMARY ============');
  const icon = result.status === 'WRITTEN' ? '✓' : '✗';
  console.log(`\n  ${icon} ${result.dataset_id} — ${result.dataset_name}`);
  console.log(`    status:          ${result.status}`);
  if (result.error) console.log(`    error:           ${result.error}`);
  if (result.reporting_period) console.log(`    period:          ${result.reporting_period}`);
  if (result.records_written != null) console.log(`    records written: ${result.records_written}`);
  console.log(`    firestore path:  ${result.firestore_path}`);
  console.log(`    modal label:     ${result.modal_label}`);
  console.log(`    verification:    ${result.verification_id}`);
  console.log(`\n  Report:        ${reportPath}`);
  console.log(`  Shared latest: ${sharedLatestPath}`);
  console.log('\n[canada-nb-write-grants] done.');

  if (result.status !== 'WRITTEN') process.exit(1);
}

main().catch((err) => {
  console.error('[canada-nb-write-grants] fatal:', err);
  process.exit(1);
});
