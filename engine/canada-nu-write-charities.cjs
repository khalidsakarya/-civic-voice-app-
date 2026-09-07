/**
 * ============================================================================
 * ⚠️  THIS SCRIPT WRITES TO FIRESTORE WHEN EXECUTED.  ⚠️
 * ============================================================================
 *
 * CA-NU (Nunavut) — CV-DATA-NU-002 CRA Charities write ONLY.
 *
 * PREPARED IN ADVANCE — NOT RUN YET. The dry-run for this dataset
 * (engine/canada-nu-dry-run.cjs, see engine/reports/canada-nu-dry-run-latest.json)
 * already confirmed DRY_RUN_OK (26 NU charities found, all 26 transformed,
 * zero warnings) — this script only adds the actual Firestore write step. It
 * has not been executed because the project's Firestore quota was exhausted
 * (RESOURCE_EXHAUSTED) at the time this script was prepared. Do not run it
 * until the quota has been confirmed clear (e.g. via a single lightweight
 * read probe).
 *
 * Writes the CRA Charities Registry (NU filter) dataset to Firestore using
 * merge-only. Does NOT touch CV-DATA-NU-001 (unemployment — dry-run already
 * confirmed working post-reliability-fix, 11.3% Aug 2026; write separately via
 * engine/canada-unemployment-batch-write.cjs) or CV-DATA-NU-003 (grants/
 * payments — NOT_FOUND; Nunavut has no open data portal at all,
 * gov.nu.ca is bot-blocked (HTTP 403), and Public Accounts are current but
 * PDF-only. See canada-nu-dry-run.cjs and the shared write report for the
 * full search performed).
 *
 * Approval basis: same CRA Charities write pattern already approved and
 * executed for CA-ON, CA-BC, CA-AB, CA-QC, CA-SK, CA-MB, CA-NS, CA-NB,
 * CA-NL, CA-PE — name/type/status/category only, no dollar values
 * (rawValue: 0 placeholder).
 *   Target: subnational_tax_exempt_entities/CA-NU, merge-only.
 *
 * Verification record (data field only — no compliance record file created
 * yet; per project rule, verification records are only created once an
 * actual write has occurred):
 *   CV-REC-001-2026-09-07-CV-DATA-NU-002 (NU CRA Charities)
 *
 * Safety:
 *   - This module does NOT execute on require()/import — main() only runs
 *     when this file is invoked directly.
 *
 * Usage (only after Firestore quota is confirmed clear):
 *   node engine/canada-nu-write-charities.cjs
 */

'use strict';

const fs = require('fs');
const path = require('path');

const { tryGetFirestore, describeCredentialSource } = require('./firebase-admin-init.cjs');
const caNu = require('./lib/subnational-transparency-ca-nu.cjs');
const { mergeTransparencyDoc, hasTaxPayload } = require('./lib/subnational-transparency-shared.cjs');

const REPORTS_DIR = path.join(__dirname, 'reports');
const COLLECTION = 'subnational_tax_exempt_entities';
const JURISDICTION_ID = 'CA-NU';
const VERIFICATION_ID = 'CV-REC-001-2026-09-07-CV-DATA-NU-002';

async function writeNuCharities(db, writeAt) {
  const result = {
    dataset_id: 'CV-DATA-NU-002',
    dataset_name: 'CRA Charities Registry — Nunavut org-level extract (MVP: name/type/category)',
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
    console.log('[canada-nu-write-charities] CV-DATA-NU-002: fetching…');
    const doc = await caNu.buildTax();

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
    doc.cv_data_id = 'CV-DATA-NU-002';

    console.log('[canada-nu-write-charities] CV-DATA-NU-002: writing to Firestore (merge)…');
    const wr = await mergeTransparencyDoc(db, COLLECTION, JURISDICTION_ID, doc, 'tax');
    if (!wr.written) throw new Error(`mergeTransparencyDoc returned written=false: ${wr.reason}`);

    result.status = 'WRITTEN';
    result.reporting_period = doc.data_source || 'CRA Charities Registry latest extract';
    result.source_url = doc.source_url || caNu.SOURCES.charities;
    result.records_written = doc.records_stored || doc.records.length;
    result.sample_written = doc.records.slice(0, 10);
    result.fields_written = Object.keys(doc).filter((k) => doc[k] != null);

    console.log(`[canada-nu-write-charities] CV-DATA-NU-002 written (${result.records_written} records).`);
  } catch (err) {
    result.status = 'FAILED';
    result.error = err.message || String(err);
  }

  return result;
}

async function main() {
  const writeAt = new Date().toISOString();

  console.log('[canada-nu-write-charities] ============================================');
  console.log('[canada-nu-write-charities] ⚠️  THIS RUN WILL WRITE TO FIRESTORE  ⚠️');
  console.log('[canada-nu-write-charities] CA-NU — CV-DATA-NU-002 CRA Charities Firestore write');
  console.log('[canada-nu-write-charities] CV-DATA-NU-001 (unemployment) and CV-DATA-NU-003 (grants) are NOT touched by this script');
  console.log(`[canada-nu-write-charities] Started: ${writeAt}`);
  console.log('[canada-nu-write-charities] ============================================');

  const db = tryGetFirestore();
  if (!db) {
    console.error('[canada-nu-write-charities] FATAL: Firebase credentials not found.');
    console.error('[canada-nu-write-charities] Credential source:', describeCredentialSource());
    process.exit(1);
  }
  console.log(`[canada-nu-write-charities] Firebase connected (${describeCredentialSource()})`);

  const result = await writeNuCharities(db, writeAt);

  await db.terminate();

  if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });
  const ts = writeAt.replace(/[:.]/g, '-').replace('T', '_').slice(0, 19);
  const reportPath = path.join(REPORTS_DIR, `canada-nu-write-charities-${ts}.json`);
  const report = { run_type: 'FIRESTORE_WRITE', write_at: writeAt, jurisdiction: 'CA-NU', dataset: result };
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');

  const sharedLatestPath = path.join(REPORTS_DIR, 'canada-nu-write-latest.json');
  let shared;
  try {
    shared = JSON.parse(fs.readFileSync(sharedLatestPath, 'utf8'));
  } catch (_) {
    shared = { run_type: 'FIRESTORE_WRITE', jurisdiction: 'CA-NU', datasets: [], deliberately_excluded: [] };
  }
  shared.datasets = (shared.datasets || []).filter((d) => d.dataset_id !== 'CV-DATA-NU-002');
  shared.datasets.push({ ...result, write_at: writeAt });
  shared.deliberately_excluded = [
    'CV-DATA-NU-001 — Unemployment — not written by this script. Dry-run already confirmed working post-reliability-fix (Table 14-10-0292-01, coordinate 3.8.1.1.1.1.0.0.0.0, 11.3% Aug 2026, no ECONNRESET) — see engine/reports/canada-nu-dry-run-latest.json. Write via engine/canada-unemployment-batch-write.cjs (target subnational_economic_social_stats/CA-NU).',
    'CV-DATA-NU-003 — Grants/Public Payments — not written. No current, machine-readable, whole-of-government Nunavut grants/payments/public-accounts source exists. Nunavut has no open data portal at all — opendata.gov.nu.ca and data.gov.nu.ca do not resolve, and gov.nu.ca (the main government domain) returns HTTP 403 to automated requests (bot-protected, not scraped). Nunavut is not mirrored on the federal open.canada.ca CKAN aggregator (0 datasets under organization "nu"; the sole dataset titled "Nunavut" there is an unrelated NRCan political map). Nunavut\'s Public Accounts are reasonably current but published exclusively as PDF (hosted on the bot-blocked gov.nu.ca and mirrored on assembly.nu.ca, still PDF-only) — PDF extraction was not authorized for this task. This is a genuine data-availability/format gap, not a fetch failure — see engine/lib/subnational-transparency-ca-nu.cjs module header and engine/reports/canada-nu-dry-run-latest.json for the full search performed.',
  ];
  shared.last_updated = writeAt;
  shared.summary = {
    total_attempted: shared.datasets.length,
    written: shared.datasets.filter((d) => d.status === 'WRITTEN').length,
    failed: shared.datasets.filter((d) => d.status === 'FAILED').length,
    warnings_total: shared.datasets.reduce((s, d) => s + (d.warnings?.length || 0), 0),
  };
  fs.writeFileSync(sharedLatestPath, JSON.stringify(shared, null, 2), 'utf8');

  console.log('\n[canada-nu-write-charities] ============ WRITE SUMMARY ============');
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
  console.log('\n[canada-nu-write-charities] done.');

  if (result.status !== 'WRITTEN') process.exit(1);
}

// Only executes when run directly (`node engine/canada-nu-write-charities.cjs`).
// require()-ing this module elsewhere never triggers a Firestore write.
if (require.main === module) {
  main().catch((err) => {
    console.error('[canada-nu-write-charities] fatal:', err);
    process.exit(1);
  });
}

module.exports = { writeNuCharities };
