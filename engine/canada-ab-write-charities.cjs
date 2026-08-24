/**
 * CA-AB (Alberta) — CV-DATA-AB-002 CRA Charities write ONLY.
 *
 * Writes the CRA Charities Registry (Alberta filter) dataset to Firestore using
 * merge-only. Does NOT touch CV-DATA-AB-001 (unemployment — not yet written,
 * automated fetch still blocked by a transient network issue) or CV-DATA-AB-003
 * (grants — reviewer has not yet approved the aggregated preview for write).
 *
 * Reviewer approval (2026-08-24): write CA-AB-002 CRA Charities.
 *   Target: subnational_tax_exempt_entities/CA-AB, merge-only.
 *   Store name/type/status only — no dollar values (rawValue: 0 placeholder,
 *   same pattern already used for CA-ON and CA-BC).
 *
 * Verification record:
 *   CV-REC-001-2026-08-24-CV-DATA-AB-002 (AB CRA Charities)
 *
 * Usage:
 *   node engine/canada-ab-write-charities.cjs
 */

'use strict';

const fs = require('fs');
const path = require('path');

const { tryGetFirestore, describeCredentialSource } = require('./firebase-admin-init.cjs');
const caAb = require('./lib/subnational-transparency-ca-ab.cjs');
const { mergeTransparencyDoc, hasTaxPayload } = require('./lib/subnational-transparency-shared.cjs');

const REPORTS_DIR = path.join(__dirname, 'reports');
const WRITE_AT = new Date().toISOString();

const COLLECTION = 'subnational_tax_exempt_entities';
const JURISDICTION_ID = 'CA-AB';
const VERIFICATION_ID = 'CV-REC-001-2026-08-24-CV-DATA-AB-002';

async function writeAbCharities(db) {
  const result = {
    dataset_id: 'CV-DATA-AB-002',
    dataset_name: 'CRA Charities Registry — Alberta org-level extract (MVP: name/type/category)',
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
    mvp_note: 'Name/type/category only. rawValue=0 enforced. No dollar values written.',
  };

  try {
    console.log('[canada-ab-write-charities] CV-DATA-AB-002: fetching…');
    const doc = await caAb.buildTax();

    if (!hasTaxPayload(doc)) {
      throw new Error('No tax payload (records array empty) — refusing to write');
    }

    // Enforce MVP constraint: no dollar values leave this process
    const violators = doc.records.filter((r) => r.rawValue > 0);
    if (violators.length) {
      result.warnings.push(`${violators.length} records had rawValue>0 — zeroed before write`);
      doc.records = doc.records.map((r) => ({ ...r, rawValue: 0 }));
    }

    doc.verification_status = VERIFICATION_ID;
    doc.licence_note = 'Open Government Licence — Canada (OGL-Canada). Attribution: "Contains information licensed under the Open Government Licence — Canada. Source: Canada Revenue Agency Charities Directorate."';
    doc.cv_data_id = 'CV-DATA-AB-002';

    console.log('[canada-ab-write-charities] CV-DATA-AB-002: writing to Firestore (merge)…');
    const wr = await mergeTransparencyDoc(db, COLLECTION, JURISDICTION_ID, doc, 'tax');
    if (!wr.written) throw new Error(`mergeTransparencyDoc returned written=false: ${wr.reason}`);

    result.status = 'WRITTEN';
    result.reporting_period = doc.data_source || 'CRA Charities Registry latest extract';
    result.source_url = doc.source_url || caAb.SOURCES.charities;
    result.records_written = doc.records_stored || doc.records.length;
    result.sample_written = doc.records.slice(0, 10);
    result.fields_written = Object.keys(doc).filter((k) => doc[k] != null);

    console.log(`[canada-ab-write-charities] CV-DATA-AB-002 written (${result.records_written} records).`);
  } catch (err) {
    result.status = 'FAILED';
    result.error = err.message || String(err);
  }

  return result;
}

async function main() {
  console.log('[canada-ab-write-charities] ============================================');
  console.log('[canada-ab-write-charities] CA-AB — CV-DATA-AB-002 CRA Charities Firestore write');
  console.log('[canada-ab-write-charities] CV-DATA-AB-001 (unemployment) and CV-DATA-AB-003 (grants) are NOT touched by this script');
  console.log(`[canada-ab-write-charities] Started: ${WRITE_AT}`);
  console.log('[canada-ab-write-charities] ============================================');

  const db = tryGetFirestore();
  if (!db) {
    console.error('[canada-ab-write-charities] FATAL: Firebase credentials not found.');
    console.error('[canada-ab-write-charities] Credential source:', describeCredentialSource());
    process.exit(1);
  }
  console.log(`[canada-ab-write-charities] Firebase connected (${describeCredentialSource()})`);

  const result = await writeAbCharities(db);

  await db.terminate();

  if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });
  const ts = WRITE_AT.replace(/[:.]/g, '-').replace('T', '_').slice(0, 19);
  const reportPath = path.join(REPORTS_DIR, `canada-ab-write-charities-${ts}.json`);
  const report = { run_type: 'FIRESTORE_WRITE', write_at: WRITE_AT, jurisdiction: 'CA-AB', dataset: result };
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');

  const sharedLatestPath = path.join(REPORTS_DIR, 'canada-ab-write-latest.json');
  let shared;
  try {
    shared = JSON.parse(fs.readFileSync(sharedLatestPath, 'utf8'));
  } catch (_) {
    shared = { run_type: 'FIRESTORE_WRITE', jurisdiction: 'CA-AB', datasets: [], deliberately_excluded: [] };
  }
  shared.datasets = (shared.datasets || []).filter((d) => d.dataset_id !== 'CV-DATA-AB-002');
  shared.datasets.push({ ...result, write_at: WRITE_AT });
  shared.deliberately_excluded = [
    'CV-DATA-AB-001 — Unemployment — automated Node fetch pipeline hit a transient ECONNRESET against the Stats Can API; coordinate independently confirmed correct via curl; write only after a clean automated fetch succeeds.',
    'CV-DATA-AB-003 — Grants — reviewer approved an aggregated-by-recipient+program transformation (2026-08-24) but has not yet approved the write itself; pending final review of the aggregated preview.',
  ];
  shared.last_updated = WRITE_AT;
  shared.summary = {
    total_attempted: shared.datasets.length,
    written: shared.datasets.filter((d) => d.status === 'WRITTEN').length,
    failed: shared.datasets.filter((d) => d.status === 'FAILED').length,
    warnings_total: shared.datasets.reduce((s, d) => s + (d.warnings?.length || 0), 0),
  };
  fs.writeFileSync(sharedLatestPath, JSON.stringify(shared, null, 2), 'utf8');

  console.log('\n[canada-ab-write-charities] ============ WRITE SUMMARY ============');
  const icon = result.status === 'WRITTEN' ? '✓' : '✗';
  console.log(`\n  ${icon} ${result.dataset_id} — ${result.dataset_name}`);
  console.log(`    status:          ${result.status}`);
  if (result.error) console.log(`    error:           ${result.error}`);
  if (result.reporting_period) console.log(`    period:          ${result.reporting_period}`);
  if (result.records_written != null) console.log(`    records written: ${result.records_written}`);
  console.log(`    firestore path:  ${result.firestore_path}`);
  console.log(`    verification:    ${result.verification_id}`);
  console.log(`\n  Report:        ${reportPath}`);
  console.log(`  Shared latest: ${sharedLatestPath}`);
  console.log('\n[canada-ab-write-charities] done.');

  if (result.status !== 'WRITTEN') process.exit(1);
}

main().catch((err) => {
  console.error('[canada-ab-write-charities] fatal:', err);
  process.exit(1);
});
