/**
 * CA-PE (Prince Edward Island) — CV-DATA-PE-002 CRA Charities write ONLY.
 *
 * Writes the CRA Charities Registry (PE filter) dataset to Firestore using
 * merge-only. Does NOT touch CV-DATA-PE-001 (unemployment — automated fetch
 * still blocked by a transient network issue) or CV-DATA-PE-003 (grants/
 * payments — no current, comprehensive, payee-level, machine-readable PEI
 * source exists; the only candidate found, "PEI Consolidated Expenses", is
 * category-level (department totals, no recipient names) AND stale (data
 * stops at fiscal year 2018/19) and is deliberately NOT used — publishing
 * aggregate/stale data as a payee-level "Grants" dataset would misrepresent
 * it. PEI Public Accounts are PDF-only and were not used, per the
 * no-PDF-extraction rule. See canada-pe-dry-run.cjs and the shared write
 * report for the full search performed).
 *
 * Approval (2026-09-07): write CA-PE-002 CRA Charities.
 *   Target: subnational_tax_exempt_entities/CA-PE, merge-only.
 *   Store name/type/status/category only — no dollar values (rawValue: 0
 *   placeholder, same pattern already used for CA-ON, CA-BC, CA-AB, CA-QC,
 *   CA-SK, CA-MB, CA-NS, CA-NB, CA-NL).
 *
 * Verification record:
 *   CV-REC-001-2026-09-07-CV-DATA-PE-002 (PE CRA Charities)
 *
 * Usage:
 *   node engine/canada-pe-write-charities.cjs
 */

'use strict';

const fs = require('fs');
const path = require('path');

const { tryGetFirestore, describeCredentialSource } = require('./firebase-admin-init.cjs');
const caPe = require('./lib/subnational-transparency-ca-pe.cjs');
const { mergeTransparencyDoc, hasTaxPayload } = require('./lib/subnational-transparency-shared.cjs');

const REPORTS_DIR = path.join(__dirname, 'reports');
const WRITE_AT = new Date().toISOString();

const COLLECTION = 'subnational_tax_exempt_entities';
const JURISDICTION_ID = 'CA-PE';
const VERIFICATION_ID = 'CV-REC-001-2026-09-07-CV-DATA-PE-002';

async function writePeCharities(db) {
  const result = {
    dataset_id: 'CV-DATA-PE-002',
    dataset_name: 'CRA Charities Registry — Prince Edward Island org-level extract (MVP: name/type/category)',
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
    console.log('[canada-pe-write-charities] CV-DATA-PE-002: fetching…');
    const doc = await caPe.buildTax();

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
    doc.cv_data_id = 'CV-DATA-PE-002';

    console.log('[canada-pe-write-charities] CV-DATA-PE-002: writing to Firestore (merge)…');
    const wr = await mergeTransparencyDoc(db, COLLECTION, JURISDICTION_ID, doc, 'tax');
    if (!wr.written) throw new Error(`mergeTransparencyDoc returned written=false: ${wr.reason}`);

    result.status = 'WRITTEN';
    result.reporting_period = doc.data_source || 'CRA Charities Registry latest extract';
    result.source_url = doc.source_url || caPe.SOURCES.charities;
    result.records_written = doc.records_stored || doc.records.length;
    result.sample_written = doc.records.slice(0, 10);
    result.fields_written = Object.keys(doc).filter((k) => doc[k] != null);

    console.log(`[canada-pe-write-charities] CV-DATA-PE-002 written (${result.records_written} records).`);
  } catch (err) {
    result.status = 'FAILED';
    result.error = err.message || String(err);
  }

  return result;
}

async function main() {
  console.log('[canada-pe-write-charities] ============================================');
  console.log('[canada-pe-write-charities] CA-PE — CV-DATA-PE-002 CRA Charities Firestore write');
  console.log('[canada-pe-write-charities] CV-DATA-PE-001 (unemployment) and CV-DATA-PE-003 (grants) are NOT touched by this script');
  console.log(`[canada-pe-write-charities] Started: ${WRITE_AT}`);
  console.log('[canada-pe-write-charities] ============================================');

  const db = tryGetFirestore();
  if (!db) {
    console.error('[canada-pe-write-charities] FATAL: Firebase credentials not found.');
    console.error('[canada-pe-write-charities] Credential source:', describeCredentialSource());
    process.exit(1);
  }
  console.log(`[canada-pe-write-charities] Firebase connected (${describeCredentialSource()})`);

  const result = await writePeCharities(db);

  await db.terminate();

  if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });
  const ts = WRITE_AT.replace(/[:.]/g, '-').replace('T', '_').slice(0, 19);
  const reportPath = path.join(REPORTS_DIR, `canada-pe-write-charities-${ts}.json`);
  const report = { run_type: 'FIRESTORE_WRITE', write_at: WRITE_AT, jurisdiction: 'CA-PE', dataset: result };
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');

  const sharedLatestPath = path.join(REPORTS_DIR, 'canada-pe-write-latest.json');
  let shared;
  try {
    shared = JSON.parse(fs.readFileSync(sharedLatestPath, 'utf8'));
  } catch (_) {
    shared = { run_type: 'FIRESTORE_WRITE', jurisdiction: 'CA-PE', datasets: [], deliberately_excluded: [] };
  }
  shared.datasets = (shared.datasets || []).filter((d) => d.dataset_id !== 'CV-DATA-PE-002');
  shared.datasets.push({ ...result, write_at: WRITE_AT });
  shared.deliberately_excluded = [
    'CV-DATA-PE-001 — Unemployment — automated Node fetch pipeline hit a transient ECONNRESET against the Stats Can API; coordinate 3.7.1.1.1.1.0.0.0.0 independently confirmed correct via curl (7.6%, 6.8%, 7.9% for Jun-Aug 2026); write only after a clean automated fetch succeeds.',
    'CV-DATA-PE-003 — Grants/Public Payments — not written. No current, comprehensive, payee-level, machine-readable whole-of-government Prince Edward Island grants/payments/public-accounts source was found. PEI\'s ArcGIS Hub open data portal (data.princeedwardisland.ca) was searched across 9 financial-related terms (grants, payments, supplier, expenditure, disclosure, transfer payment, public accounts, vendor, spending). The only candidate resembling a whole-of-government dataset, "PEI Consolidated Expenses" (OD0031), was identified but deliberately REJECTED — confirmed via direct FeatureServer schema/query inspection to be CATEGORY-LEVEL only (Area_of_Expenditure / Financial_Year / Value — department totals, no recipient names) AND stale (data stops at fiscal year 2018/19, 7+ years out of date). Publishing aggregate, stale department-level totals as a payee-level "Grants" dataset would misrepresent it to users, so it was not written. Two other narrow single-program PEI datasets ("Expenditure Budget Estimates And Forecasts", "Student Loan Grant Assessments and Awards", "Seniors Home Repair Program Activity") were also found and rejected for the same reasons (aggregate statistics with no recipient names, and/or stale to FY2018-19). PEI is not mirrored on the federal open.canada.ca CKAN aggregator (0 datasets under organization "pe"/"pei"). Prince Edward Island Public Accounts were identified as published by the Department of Finance, but only as PDF volumes (Volume I, Volume III), not CSV/XLSX/open data — PDF extraction was not authorized for this task, so Public Accounts were not used. This is a genuine data-availability/granularity gap, not a fetch failure — see engine/lib/subnational-transparency-ca-pe.cjs module header and engine/reports/canada-pe-dry-run-latest.json for the full search performed.',
  ];
  shared.last_updated = WRITE_AT;
  shared.summary = {
    total_attempted: shared.datasets.length,
    written: shared.datasets.filter((d) => d.status === 'WRITTEN').length,
    failed: shared.datasets.filter((d) => d.status === 'FAILED').length,
    warnings_total: shared.datasets.reduce((s, d) => s + (d.warnings?.length || 0), 0),
  };
  fs.writeFileSync(sharedLatestPath, JSON.stringify(shared, null, 2), 'utf8');

  console.log('\n[canada-pe-write-charities] ============ WRITE SUMMARY ============');
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
  console.log('\n[canada-pe-write-charities] done.');

  if (result.status !== 'WRITTEN') process.exit(1);
}

main().catch((err) => {
  console.error('[canada-pe-write-charities] fatal:', err);
  process.exit(1);
});
