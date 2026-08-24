/**
 * CA-SK (Saskatchewan) — CV-DATA-SK-002 CRA Charities write ONLY.
 *
 * Writes the CRA Charities Registry (Saskatchewan filter) dataset to Firestore
 * using merge-only. Does NOT touch CV-DATA-SK-001 (unemployment — automated
 * fetch still blocked by a transient network issue) or CV-DATA-SK-003
 * (grants/payments — no official machine-readable Saskatchewan source exists;
 * see canada-sk-dry-run.cjs and the shared write report for the full search
 * performed. PDF extraction of Saskatchewan's Public Accounts Volume 2 was
 * identified as a theoretical option but was NOT used — not authorized for
 * this data pipeline).
 *
 * Approval (2026-08-24): write CA-SK-002 CRA Charities.
 *   Target: subnational_tax_exempt_entities/CA-SK, merge-only.
 *   Store name/type/status/category only — no dollar values (rawValue: 0
 *   placeholder, same pattern already used for CA-ON, CA-BC, CA-AB, CA-QC).
 *
 * Verification record:
 *   CV-REC-001-2026-08-24-CV-DATA-SK-002 (SK CRA Charities)
 *
 * Usage:
 *   node engine/canada-sk-write-charities.cjs
 */

'use strict';

const fs = require('fs');
const path = require('path');

const { tryGetFirestore, describeCredentialSource } = require('./firebase-admin-init.cjs');
const caSk = require('./lib/subnational-transparency-ca-sk.cjs');
const { mergeTransparencyDoc, hasTaxPayload } = require('./lib/subnational-transparency-shared.cjs');

const REPORTS_DIR = path.join(__dirname, 'reports');
const WRITE_AT = new Date().toISOString();

const COLLECTION = 'subnational_tax_exempt_entities';
const JURISDICTION_ID = 'CA-SK';
const VERIFICATION_ID = 'CV-REC-001-2026-08-24-CV-DATA-SK-002';

async function writeSkCharities(db) {
  const result = {
    dataset_id: 'CV-DATA-SK-002',
    dataset_name: 'CRA Charities Registry — Saskatchewan org-level extract (MVP: name/type/category)',
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
    console.log('[canada-sk-write-charities] CV-DATA-SK-002: fetching…');
    const doc = await caSk.buildTax();

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
    doc.cv_data_id = 'CV-DATA-SK-002';

    console.log('[canada-sk-write-charities] CV-DATA-SK-002: writing to Firestore (merge)…');
    const wr = await mergeTransparencyDoc(db, COLLECTION, JURISDICTION_ID, doc, 'tax');
    if (!wr.written) throw new Error(`mergeTransparencyDoc returned written=false: ${wr.reason}`);

    result.status = 'WRITTEN';
    result.reporting_period = doc.data_source || 'CRA Charities Registry latest extract';
    result.source_url = doc.source_url || caSk.SOURCES.charities;
    result.records_written = doc.records_stored || doc.records.length;
    result.sample_written = doc.records.slice(0, 10);
    result.fields_written = Object.keys(doc).filter((k) => doc[k] != null);

    console.log(`[canada-sk-write-charities] CV-DATA-SK-002 written (${result.records_written} records).`);
  } catch (err) {
    result.status = 'FAILED';
    result.error = err.message || String(err);
  }

  return result;
}

async function main() {
  console.log('[canada-sk-write-charities] ============================================');
  console.log('[canada-sk-write-charities] CA-SK — CV-DATA-SK-002 CRA Charities Firestore write');
  console.log('[canada-sk-write-charities] CV-DATA-SK-001 (unemployment) and CV-DATA-SK-003 (grants) are NOT touched by this script');
  console.log(`[canada-sk-write-charities] Started: ${WRITE_AT}`);
  console.log('[canada-sk-write-charities] ============================================');

  const db = tryGetFirestore();
  if (!db) {
    console.error('[canada-sk-write-charities] FATAL: Firebase credentials not found.');
    console.error('[canada-sk-write-charities] Credential source:', describeCredentialSource());
    process.exit(1);
  }
  console.log(`[canada-sk-write-charities] Firebase connected (${describeCredentialSource()})`);

  const result = await writeSkCharities(db);

  await db.terminate();

  if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });
  const ts = WRITE_AT.replace(/[:.]/g, '-').replace('T', '_').slice(0, 19);
  const reportPath = path.join(REPORTS_DIR, `canada-sk-write-charities-${ts}.json`);
  const report = { run_type: 'FIRESTORE_WRITE', write_at: WRITE_AT, jurisdiction: 'CA-SK', dataset: result };
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');

  const sharedLatestPath = path.join(REPORTS_DIR, 'canada-sk-write-latest.json');
  let shared;
  try {
    shared = JSON.parse(fs.readFileSync(sharedLatestPath, 'utf8'));
  } catch (_) {
    shared = { run_type: 'FIRESTORE_WRITE', jurisdiction: 'CA-SK', datasets: [], deliberately_excluded: [] };
  }
  shared.datasets = (shared.datasets || []).filter((d) => d.dataset_id !== 'CV-DATA-SK-002');
  shared.datasets.push({ ...result, write_at: WRITE_AT });
  shared.deliberately_excluded = [
    'CV-DATA-SK-001 — Unemployment — automated Node fetch pipeline hit a transient ECONNRESET against the Stats Can API; coordinate independently confirmed correct via curl; write only after a clean automated fetch succeeds.',
    'CV-DATA-SK-003 — Grants/Public Payments — no official machine-readable Saskatchewan source exists. data.saskatchewan.ca does not resolve; no CKAN open data portal; federal open.canada.ca aggregator has zero financial datasets for organization=sk (413 datasets, all geospatial/geological); Saskatchewan Public Accounts Volume 2 (General Revenue Fund Details) is published as PDF only. The PDF was identified but NOT used — PDF extraction is not authorized for this data pipeline. This dataset cannot be written until Saskatchewan publishes a structured (CSV/XLSX/API) source, or PDF extraction is explicitly authorized.',
  ];
  shared.last_updated = WRITE_AT;
  shared.summary = {
    total_attempted: shared.datasets.length,
    written: shared.datasets.filter((d) => d.status === 'WRITTEN').length,
    failed: shared.datasets.filter((d) => d.status === 'FAILED').length,
    warnings_total: shared.datasets.reduce((s, d) => s + (d.warnings?.length || 0), 0),
  };
  fs.writeFileSync(sharedLatestPath, JSON.stringify(shared, null, 2), 'utf8');

  console.log('\n[canada-sk-write-charities] ============ WRITE SUMMARY ============');
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
  console.log('\n[canada-sk-write-charities] done.');

  if (result.status !== 'WRITTEN') process.exit(1);
}

main().catch((err) => {
  console.error('[canada-sk-write-charities] fatal:', err);
  process.exit(1);
});
