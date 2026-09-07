/**
 * ============================================================================
 * ⚠️  THIS SCRIPT WRITES TO FIRESTORE WHEN EXECUTED.  ⚠️
 * ============================================================================
 *
 * CA-NT (Northwest Territories) — CV-DATA-NT-002 CRA Charities write ONLY.
 *
 * PREPARED IN ADVANCE — NOT RUN YET. The dry-run for this dataset
 * (engine/canada-nt-dry-run.cjs, see engine/reports/canada-nt-dry-run-latest.json)
 * already confirmed DRY_RUN_OK (122 NT charities found, 100 transformed, zero
 * warnings) — this script only adds the actual Firestore write step. It has
 * not been executed because the project's Firestore quota was exhausted
 * (RESOURCE_EXHAUSTED) at the time this script was prepared. Do not run it
 * until the quota has been confirmed clear (e.g. via a single lightweight
 * read probe).
 *
 * Writes the CRA Charities Registry (NT filter) dataset to Firestore using
 * merge-only. Does NOT touch CV-DATA-NT-001 (unemployment — dry-run already
 * confirmed working post-reliability-fix, 7.6% Aug 2026; write separately via
 * engine/canada-unemployment-batch-write.cjs) or CV-DATA-NT-003 (grants/
 * payments — NOT_FOUND; the GNWT Sole Source Contracts Report is stale
 * (last published FY2017-2018) and narrow in scope, and NWT Public Accounts
 * are almost entirely PDF, with the one structured resource found itself
 * being the most recent Public Accounts data published, FY2022-23, ~3
 * fiscal years stale. See canada-nt-dry-run.cjs and the shared write report
 * for the full search performed).
 *
 * Approval basis: same CRA Charities write pattern already approved and
 * executed for CA-ON, CA-BC, CA-AB, CA-QC, CA-SK, CA-MB, CA-NS, CA-NB,
 * CA-NL, CA-PE — name/type/status/category only, no dollar values
 * (rawValue: 0 placeholder).
 *   Target: subnational_tax_exempt_entities/CA-NT, merge-only.
 *
 * Verification record (data field only — no compliance record file created
 * yet; per project rule, verification records are only created once an
 * actual write has occurred):
 *   CV-REC-001-2026-09-07-CV-DATA-NT-002 (NT CRA Charities)
 *
 * Safety:
 *   - This module does NOT execute on require()/import — main() only runs
 *     when this file is invoked directly.
 *
 * Usage (only after Firestore quota is confirmed clear):
 *   node engine/canada-nt-write-charities.cjs
 */

'use strict';

const fs = require('fs');
const path = require('path');

const { tryGetFirestore, describeCredentialSource } = require('./firebase-admin-init.cjs');
const caNt = require('./lib/subnational-transparency-ca-nt.cjs');
const { mergeTransparencyDoc, hasTaxPayload } = require('./lib/subnational-transparency-shared.cjs');

const REPORTS_DIR = path.join(__dirname, 'reports');
const COLLECTION = 'subnational_tax_exempt_entities';
const JURISDICTION_ID = 'CA-NT';
const VERIFICATION_ID = 'CV-REC-001-2026-09-07-CV-DATA-NT-002';

async function writeNtCharities(db, writeAt) {
  const result = {
    dataset_id: 'CV-DATA-NT-002',
    dataset_name: 'CRA Charities Registry — Northwest Territories org-level extract (MVP: name/type/category)',
    verification_id: VERIFICATION_ID,
    firestore_path: `${COLLECTION}/${JURISDICTION_ID}`,
    write_mode: 'merge',
    write_at: writeAt,
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
    console.log('[canada-nt-write-charities] CV-DATA-NT-002: fetching…');
    const doc = await caNt.buildTax();

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
    doc.cv_data_id = 'CV-DATA-NT-002';

    console.log('[canada-nt-write-charities] CV-DATA-NT-002: writing to Firestore (merge)…');
    const wr = await mergeTransparencyDoc(db, COLLECTION, JURISDICTION_ID, doc, 'tax');
    if (!wr.written) throw new Error(`mergeTransparencyDoc returned written=false: ${wr.reason}`);

    result.status = 'WRITTEN';
    result.reporting_period = doc.data_source || 'CRA Charities Registry latest extract';
    result.source_url = doc.source_url || caNt.SOURCES.charities;
    result.records_written = doc.records_stored || doc.records.length;
    result.sample_written = doc.records.slice(0, 10);
    result.fields_written = Object.keys(doc).filter((k) => doc[k] != null);

    console.log(`[canada-nt-write-charities] CV-DATA-NT-002 written (${result.records_written} records).`);
  } catch (err) {
    result.status = 'FAILED';
    result.error = err.message || String(err);
  }

  return result;
}

async function main() {
  const writeAt = new Date().toISOString();

  console.log('[canada-nt-write-charities] ============================================');
  console.log('[canada-nt-write-charities] ⚠️  THIS RUN WILL WRITE TO FIRESTORE  ⚠️');
  console.log('[canada-nt-write-charities] CA-NT — CV-DATA-NT-002 CRA Charities Firestore write');
  console.log('[canada-nt-write-charities] CV-DATA-NT-001 (unemployment) and CV-DATA-NT-003 (grants) are NOT touched by this script');
  console.log(`[canada-nt-write-charities] Started: ${writeAt}`);
  console.log('[canada-nt-write-charities] ============================================');

  const db = tryGetFirestore();
  if (!db) {
    console.error('[canada-nt-write-charities] FATAL: Firebase credentials not found.');
    console.error('[canada-nt-write-charities] Credential source:', describeCredentialSource());
    process.exit(1);
  }
  console.log(`[canada-nt-write-charities] Firebase connected (${describeCredentialSource()})`);

  const result = await writeNtCharities(db, writeAt);

  await db.terminate();

  if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });
  const ts = writeAt.replace(/[:.]/g, '-').replace('T', '_').slice(0, 19);
  const reportPath = path.join(REPORTS_DIR, `canada-nt-write-charities-${ts}.json`);
  const report = { run_type: 'FIRESTORE_WRITE', write_at: writeAt, jurisdiction: 'CA-NT', dataset: result };
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');

  const sharedLatestPath = path.join(REPORTS_DIR, 'canada-nt-write-latest.json');
  let shared;
  try {
    shared = JSON.parse(fs.readFileSync(sharedLatestPath, 'utf8'));
  } catch (_) {
    shared = { run_type: 'FIRESTORE_WRITE', jurisdiction: 'CA-NT', datasets: [], deliberately_excluded: [] };
  }
  shared.datasets = (shared.datasets || []).filter((d) => d.dataset_id !== 'CV-DATA-NT-002');
  shared.datasets.push({ ...result, write_at: writeAt });
  shared.deliberately_excluded = [
    'CV-DATA-NT-001 — Unemployment — not written by this script. Dry-run already confirmed working post-reliability-fix (Table 14-10-0292-01, coordinate 2.8.1.1.1.1.0.0.0.0, 7.6% Aug 2026, no ECONNRESET) — see engine/reports/canada-nt-dry-run-latest.json. Write via engine/canada-unemployment-batch-write.cjs (target subnational_economic_social_stats/CA-NT).',
    'CV-DATA-NT-003 — Grants/Public Payments — not written. No current, machine-readable, payee-level Northwest Territories grants/payments/public-accounts source exists. The GNWT Sole Source Contracts Report is stale (last published for fiscal year 2017-2018, ~8 years out of date) and narrow in scope (sole-source contracts only, excluding competitively-tendered contracts, grants, and regular transfer payments). NWT Public Accounts are almost entirely PDF; the one structured (.xlsx) resource found, "Public Accounts 2022-2023 - Tables", is itself the most recent Public Accounts data published (no FY2023-24/2024-25 found) — roughly 3 fiscal years stale — and is department-level summary tables, not payee-level data. NWT is not mirrored on the federal open.canada.ca CKAN aggregator. This is a genuine data-availability/currency/granularity gap, not a fetch failure — see engine/lib/subnational-transparency-ca-nt.cjs module header and engine/reports/canada-nt-dry-run-latest.json for the full search performed.',
  ];
  shared.last_updated = writeAt;
  shared.summary = {
    total_attempted: shared.datasets.length,
    written: shared.datasets.filter((d) => d.status === 'WRITTEN').length,
    failed: shared.datasets.filter((d) => d.status === 'FAILED').length,
    warnings_total: shared.datasets.reduce((s, d) => s + (d.warnings?.length || 0), 0),
  };
  fs.writeFileSync(sharedLatestPath, JSON.stringify(shared, null, 2), 'utf8');

  console.log('\n[canada-nt-write-charities] ============ WRITE SUMMARY ============');
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
  console.log('\n[canada-nt-write-charities] done.');

  if (result.status !== 'WRITTEN') process.exit(1);
}

// Only executes when run directly (`node engine/canada-nt-write-charities.cjs`).
// require()-ing this module elsewhere never triggers a Firestore write.
if (require.main === module) {
  main().catch((err) => {
    console.error('[canada-nt-write-charities] fatal:', err);
    process.exit(1);
  });
}

module.exports = { writeNtCharities };
