/**
 * CA-NS (Nova Scotia) — CV-DATA-NS-002 CRA Charities write ONLY.
 *
 * Writes the CRA Charities Registry (Nova Scotia filter) dataset to Firestore
 * using merge-only. Does NOT touch CV-DATA-NS-001 (unemployment — automated
 * fetch still blocked by a transient network issue) or CV-DATA-NS-003
 * (grants/payments — no comprehensive machine-readable Nova Scotia source
 * exists; the Agriculture Funding Programs Details dataset was identified but
 * is deliberately deferred — it is single-department/single-sector and would
 * need a precise "Agriculture Grants" label, not the standard province-wide
 * "Grants"/"Transfer Payments" pattern, if it is ever published. See
 * canada-ns-dry-run.cjs and the shared write report for the full search
 * performed).
 *
 * Approval (2026-09-07): write CA-NS-002 CRA Charities.
 *   Target: subnational_tax_exempt_entities/CA-NS, merge-only.
 *   Store name/type/status/category only — no dollar values (rawValue: 0
 *   placeholder, same pattern already used for CA-ON, CA-BC, CA-AB, CA-QC,
 *   CA-SK, CA-MB).
 *
 * Verification record:
 *   CV-REC-001-2026-09-07-CV-DATA-NS-002 (NS CRA Charities)
 *
 * Usage:
 *   node engine/canada-ns-write-charities.cjs
 */

'use strict';

const fs = require('fs');
const path = require('path');

const { tryGetFirestore, describeCredentialSource } = require('./firebase-admin-init.cjs');
const caNs = require('./lib/subnational-transparency-ca-ns.cjs');
const { mergeTransparencyDoc, hasTaxPayload } = require('./lib/subnational-transparency-shared.cjs');

const REPORTS_DIR = path.join(__dirname, 'reports');
const WRITE_AT = new Date().toISOString();

const COLLECTION = 'subnational_tax_exempt_entities';
const JURISDICTION_ID = 'CA-NS';
const VERIFICATION_ID = 'CV-REC-001-2026-09-07-CV-DATA-NS-002';

async function writeNsCharities(db) {
  const result = {
    dataset_id: 'CV-DATA-NS-002',
    dataset_name: 'CRA Charities Registry — Nova Scotia org-level extract (MVP: name/type/category)',
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
    console.log('[canada-ns-write-charities] CV-DATA-NS-002: fetching…');
    const doc = await caNs.buildTax();

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
    doc.cv_data_id = 'CV-DATA-NS-002';

    console.log('[canada-ns-write-charities] CV-DATA-NS-002: writing to Firestore (merge)…');
    const wr = await mergeTransparencyDoc(db, COLLECTION, JURISDICTION_ID, doc, 'tax');
    if (!wr.written) throw new Error(`mergeTransparencyDoc returned written=false: ${wr.reason}`);

    result.status = 'WRITTEN';
    result.reporting_period = doc.data_source || 'CRA Charities Registry latest extract';
    result.source_url = doc.source_url || caNs.SOURCES.charities;
    result.records_written = doc.records_stored || doc.records.length;
    result.sample_written = doc.records.slice(0, 10);
    result.fields_written = Object.keys(doc).filter((k) => doc[k] != null);

    console.log(`[canada-ns-write-charities] CV-DATA-NS-002 written (${result.records_written} records).`);
  } catch (err) {
    result.status = 'FAILED';
    result.error = err.message || String(err);
  }

  return result;
}

async function main() {
  console.log('[canada-ns-write-charities] ============================================');
  console.log('[canada-ns-write-charities] CA-NS — CV-DATA-NS-002 CRA Charities Firestore write');
  console.log('[canada-ns-write-charities] CV-DATA-NS-001 (unemployment) and CV-DATA-NS-003 (grants) are NOT touched by this script');
  console.log(`[canada-ns-write-charities] Started: ${WRITE_AT}`);
  console.log('[canada-ns-write-charities] ============================================');

  const db = tryGetFirestore();
  if (!db) {
    console.error('[canada-ns-write-charities] FATAL: Firebase credentials not found.');
    console.error('[canada-ns-write-charities] Credential source:', describeCredentialSource());
    process.exit(1);
  }
  console.log(`[canada-ns-write-charities] Firebase connected (${describeCredentialSource()})`);

  const result = await writeNsCharities(db);

  await db.terminate();

  if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });
  const ts = WRITE_AT.replace(/[:.]/g, '-').replace('T', '_').slice(0, 19);
  const reportPath = path.join(REPORTS_DIR, `canada-ns-write-charities-${ts}.json`);
  const report = { run_type: 'FIRESTORE_WRITE', write_at: WRITE_AT, jurisdiction: 'CA-NS', dataset: result };
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');

  const sharedLatestPath = path.join(REPORTS_DIR, 'canada-ns-write-latest.json');
  let shared;
  try {
    shared = JSON.parse(fs.readFileSync(sharedLatestPath, 'utf8'));
  } catch (_) {
    shared = { run_type: 'FIRESTORE_WRITE', jurisdiction: 'CA-NS', datasets: [], deliberately_excluded: [] };
  }
  shared.datasets = (shared.datasets || []).filter((d) => d.dataset_id !== 'CV-DATA-NS-002');
  shared.datasets.push({ ...result, write_at: WRITE_AT });
  shared.deliberately_excluded = [
    'CV-DATA-NS-001 — Unemployment — automated Node fetch pipeline hit a transient ECONNRESET against the Stats Can API; coordinate independently confirmed correct via curl; write only after a clean automated fetch succeeds.',
    'CV-DATA-NS-003 — Grants/Public Payments — not written. No comprehensive machine-readable whole-of-government Nova Scotia grants/payments/public-accounts source was found (Nova Scotia runs a Socrata portal, data.novascotia.ca, ~1,277 datasets; a thorough scoped search across 15+ financial/payments/disclosure terms found no comprehensive dataset). The Agriculture Funding Programs Details dataset (jv92-pedy, Dept. of Agriculture, 6,324 rows, real recipients/amounts, Nova Scotia Open Government Licence) was identified and successfully fetched/transformed in the dry-run, but is deliberately DEFERRED, not written — it is single-department/single-sector (agriculture funding only), not a whole-of-government dataset, and would require a precise "Agriculture Grants" label rather than the standard province-wide "Grants"/"Transfer Payments" pattern if published. Awaiting reviewer decision on whether/how to publish it, or combine it with other narrow Nova Scotia datasets, in a future task.',
  ];
  shared.last_updated = WRITE_AT;
  shared.summary = {
    total_attempted: shared.datasets.length,
    written: shared.datasets.filter((d) => d.status === 'WRITTEN').length,
    failed: shared.datasets.filter((d) => d.status === 'FAILED').length,
    warnings_total: shared.datasets.reduce((s, d) => s + (d.warnings?.length || 0), 0),
  };
  fs.writeFileSync(sharedLatestPath, JSON.stringify(shared, null, 2), 'utf8');

  console.log('\n[canada-ns-write-charities] ============ WRITE SUMMARY ============');
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
  console.log('\n[canada-ns-write-charities] done.');

  if (result.status !== 'WRITTEN') process.exit(1);
}

main().catch((err) => {
  console.error('[canada-ns-write-charities] fatal:', err);
  process.exit(1);
});
