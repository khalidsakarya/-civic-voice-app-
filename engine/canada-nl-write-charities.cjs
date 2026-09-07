/**
 * CA-NL (Newfoundland and Labrador) — CV-DATA-NL-002 CRA Charities write ONLY.
 *
 * Writes the CRA Charities Registry (NL filter) dataset to Firestore using
 * merge-only. Does NOT touch CV-DATA-NL-001 (unemployment — automated fetch
 * still blocked by a transient network issue) or CV-DATA-NL-003 (grants/
 * payments — no current, comprehensive, machine-readable NL source exists;
 * the only candidate found, "Grant payments over $250,000 2014-2015", is a
 * decade-stale one-time snapshot never updated since 2015-09-28 and is
 * deliberately NOT used — publishing it as current data would mislead users.
 * NL Public Accounts are PDF-only and were not used, per the no-PDF-extraction
 * rule. See canada-nl-dry-run.cjs and the shared write report for the full
 * search performed).
 *
 * Approval (2026-09-07): write CA-NL-002 CRA Charities.
 *   Target: subnational_tax_exempt_entities/CA-NL, merge-only.
 *   Store name/type/status/category only — no dollar values (rawValue: 0
 *   placeholder, same pattern already used for CA-ON, CA-BC, CA-AB, CA-QC,
 *   CA-SK, CA-MB, CA-NS, CA-NB).
 *
 * Verification record:
 *   CV-REC-001-2026-09-07-CV-DATA-NL-002 (NL CRA Charities)
 *
 * Usage:
 *   node engine/canada-nl-write-charities.cjs
 */

'use strict';

const fs = require('fs');
const path = require('path');

const { tryGetFirestore, describeCredentialSource } = require('./firebase-admin-init.cjs');
const caNl = require('./lib/subnational-transparency-ca-nl.cjs');
const { mergeTransparencyDoc, hasTaxPayload } = require('./lib/subnational-transparency-shared.cjs');

const REPORTS_DIR = path.join(__dirname, 'reports');
const WRITE_AT = new Date().toISOString();

const COLLECTION = 'subnational_tax_exempt_entities';
const JURISDICTION_ID = 'CA-NL';
const VERIFICATION_ID = 'CV-REC-001-2026-09-07-CV-DATA-NL-002';

async function writeNlCharities(db) {
  const result = {
    dataset_id: 'CV-DATA-NL-002',
    dataset_name: 'CRA Charities Registry — Newfoundland and Labrador org-level extract (MVP: name/type/category)',
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
    console.log('[canada-nl-write-charities] CV-DATA-NL-002: fetching…');
    const doc = await caNl.buildTax();

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
    doc.cv_data_id = 'CV-DATA-NL-002';

    console.log('[canada-nl-write-charities] CV-DATA-NL-002: writing to Firestore (merge)…');
    const wr = await mergeTransparencyDoc(db, COLLECTION, JURISDICTION_ID, doc, 'tax');
    if (!wr.written) throw new Error(`mergeTransparencyDoc returned written=false: ${wr.reason}`);

    result.status = 'WRITTEN';
    result.reporting_period = doc.data_source || 'CRA Charities Registry latest extract';
    result.source_url = doc.source_url || caNl.SOURCES.charities;
    result.records_written = doc.records_stored || doc.records.length;
    result.sample_written = doc.records.slice(0, 10);
    result.fields_written = Object.keys(doc).filter((k) => doc[k] != null);

    console.log(`[canada-nl-write-charities] CV-DATA-NL-002 written (${result.records_written} records).`);
  } catch (err) {
    result.status = 'FAILED';
    result.error = err.message || String(err);
  }

  return result;
}

async function main() {
  console.log('[canada-nl-write-charities] ============================================');
  console.log('[canada-nl-write-charities] CA-NL — CV-DATA-NL-002 CRA Charities Firestore write');
  console.log('[canada-nl-write-charities] CV-DATA-NL-001 (unemployment) and CV-DATA-NL-003 (grants) are NOT touched by this script');
  console.log(`[canada-nl-write-charities] Started: ${WRITE_AT}`);
  console.log('[canada-nl-write-charities] ============================================');

  const db = tryGetFirestore();
  if (!db) {
    console.error('[canada-nl-write-charities] FATAL: Firebase credentials not found.');
    console.error('[canada-nl-write-charities] Credential source:', describeCredentialSource());
    process.exit(1);
  }
  console.log(`[canada-nl-write-charities] Firebase connected (${describeCredentialSource()})`);

  const result = await writeNlCharities(db);

  await db.terminate();

  if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });
  const ts = WRITE_AT.replace(/[:.]/g, '-').replace('T', '_').slice(0, 19);
  const reportPath = path.join(REPORTS_DIR, `canada-nl-write-charities-${ts}.json`);
  const report = { run_type: 'FIRESTORE_WRITE', write_at: WRITE_AT, jurisdiction: 'CA-NL', dataset: result };
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');

  const sharedLatestPath = path.join(REPORTS_DIR, 'canada-nl-write-latest.json');
  let shared;
  try {
    shared = JSON.parse(fs.readFileSync(sharedLatestPath, 'utf8'));
  } catch (_) {
    shared = { run_type: 'FIRESTORE_WRITE', jurisdiction: 'CA-NL', datasets: [], deliberately_excluded: [] };
  }
  shared.datasets = (shared.datasets || []).filter((d) => d.dataset_id !== 'CV-DATA-NL-002');
  shared.datasets.push({ ...result, write_at: WRITE_AT });
  shared.deliberately_excluded = [
    'CV-DATA-NL-001 — Unemployment — automated Node fetch pipeline hit a transient ECONNRESET against the Stats Can API; coordinate 2.7.1.1.1.1.0.0.0.0 independently confirmed correct via curl (8.2%, 9.3%, 8.6% for Jun-Aug 2026); write only after a clean automated fetch succeeds.',
    'CV-DATA-NL-003 — Grants/Public Payments — not written. No current, comprehensive, machine-readable whole-of-government Newfoundland and Labrador grants/payments/public-accounts source was found. NL\'s open data portal (opendata.gov.nl.ca, bespoke non-CKAN/non-Socrata platform, 71 datasets, mirrored 1:1 on open.canada.ca under organization "nl-tnl", 76 datasets) was fully enumerated. The only candidate resembling a whole-of-government payments disclosure, "Grant payments over $250,000 2014-2015" (Dept. of Finance), was identified but deliberately REJECTED — confirmed via its own metadata to be a one-time snapshot covering fiscal year April 2014-March 2015 only, released and modified 2015-09-28, never updated since (over a decade stale). Publishing stale single-year 2014-2015 data as this province\'s current grants/payments dataset would misrepresent it to users, so it was not written. Three other narrow grant-related NL datasets (Municipal Operating Grant Allocations, CYFS Community Partners operating grants, Community Enhancement Employment Program) were also found and rejected for the same reason (single fiscal-year snapshots from 2013-2016, never updated, narrow single-department/single-program scope). Newfoundland and Labrador Public Accounts were identified as published by the Department of Finance, but only as PDF volumes, not CSV/XLSX/open data — PDF extraction was not authorized for this task, so Public Accounts were not used. This is a genuine data-availability/currency gap, not a fetch failure — see engine/lib/subnational-transparency-ca-nl.cjs module header and engine/reports/canada-nl-dry-run-latest.json for the full search performed.',
  ];
  shared.last_updated = WRITE_AT;
  shared.summary = {
    total_attempted: shared.datasets.length,
    written: shared.datasets.filter((d) => d.status === 'WRITTEN').length,
    failed: shared.datasets.filter((d) => d.status === 'FAILED').length,
    warnings_total: shared.datasets.reduce((s, d) => s + (d.warnings?.length || 0), 0),
  };
  fs.writeFileSync(sharedLatestPath, JSON.stringify(shared, null, 2), 'utf8');

  console.log('\n[canada-nl-write-charities] ============ WRITE SUMMARY ============');
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
  console.log('\n[canada-nl-write-charities] done.');

  if (result.status !== 'WRITTEN') process.exit(1);
}

main().catch((err) => {
  console.error('[canada-nl-write-charities] fatal:', err);
  process.exit(1);
});
