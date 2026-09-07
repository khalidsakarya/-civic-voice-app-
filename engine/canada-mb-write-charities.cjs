/**
 * CA-MB (Manitoba) — CV-DATA-MB-002 CRA Charities write ONLY.
 *
 * Writes the CRA Charities Registry (Manitoba filter) dataset to Firestore
 * using merge-only. Does NOT touch CV-DATA-MB-001 (unemployment — automated
 * fetch still blocked by a transient network issue) or CV-DATA-MB-003
 * (grants/payments — no official machine-readable Manitoba source exists; see
 * canada-mb-dry-run.cjs and the shared write report for the full search
 * performed. Manitoba's "Contract Disclosure" tool was identified but NOT
 * scraped — it is an interactive/search-only web app with no bulk CSV/API
 * export, and scraping was not authorized for this data pipeline).
 *
 * Approval (2026-08-24): write CA-MB-002 CRA Charities.
 *   Target: subnational_tax_exempt_entities/CA-MB, merge-only.
 *   Store name/type/status/category only — no dollar values (rawValue: 0
 *   placeholder, same pattern already used for CA-ON, CA-BC, CA-AB, CA-QC, CA-SK).
 *
 * Verification record:
 *   CV-REC-001-2026-08-24-CV-DATA-MB-002 (MB CRA Charities)
 *
 * Usage:
 *   node engine/canada-mb-write-charities.cjs
 */

'use strict';

const fs = require('fs');
const path = require('path');

const { tryGetFirestore, describeCredentialSource } = require('./firebase-admin-init.cjs');
const caMb = require('./lib/subnational-transparency-ca-mb.cjs');
const { mergeTransparencyDoc, hasTaxPayload } = require('./lib/subnational-transparency-shared.cjs');

const REPORTS_DIR = path.join(__dirname, 'reports');
const WRITE_AT = new Date().toISOString();

const COLLECTION = 'subnational_tax_exempt_entities';
const JURISDICTION_ID = 'CA-MB';
const VERIFICATION_ID = 'CV-REC-001-2026-08-24-CV-DATA-MB-002';

async function writeMbCharities(db) {
  const result = {
    dataset_id: 'CV-DATA-MB-002',
    dataset_name: 'CRA Charities Registry — Manitoba org-level extract (MVP: name/type/category)',
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
    console.log('[canada-mb-write-charities] CV-DATA-MB-002: fetching…');
    const doc = await caMb.buildTax();

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
    doc.cv_data_id = 'CV-DATA-MB-002';

    console.log('[canada-mb-write-charities] CV-DATA-MB-002: writing to Firestore (merge)…');
    const wr = await mergeTransparencyDoc(db, COLLECTION, JURISDICTION_ID, doc, 'tax');
    if (!wr.written) throw new Error(`mergeTransparencyDoc returned written=false: ${wr.reason}`);

    result.status = 'WRITTEN';
    result.reporting_period = doc.data_source || 'CRA Charities Registry latest extract';
    result.source_url = doc.source_url || caMb.SOURCES.charities;
    result.records_written = doc.records_stored || doc.records.length;
    result.sample_written = doc.records.slice(0, 10);
    result.fields_written = Object.keys(doc).filter((k) => doc[k] != null);

    console.log(`[canada-mb-write-charities] CV-DATA-MB-002 written (${result.records_written} records).`);
  } catch (err) {
    result.status = 'FAILED';
    result.error = err.message || String(err);
  }

  return result;
}

async function main() {
  console.log('[canada-mb-write-charities] ============================================');
  console.log('[canada-mb-write-charities] CA-MB — CV-DATA-MB-002 CRA Charities Firestore write');
  console.log('[canada-mb-write-charities] CV-DATA-MB-001 (unemployment) and CV-DATA-MB-003 (grants) are NOT touched by this script');
  console.log(`[canada-mb-write-charities] Started: ${WRITE_AT}`);
  console.log('[canada-mb-write-charities] ============================================');

  const db = tryGetFirestore();
  if (!db) {
    console.error('[canada-mb-write-charities] FATAL: Firebase credentials not found.');
    console.error('[canada-mb-write-charities] Credential source:', describeCredentialSource());
    process.exit(1);
  }
  console.log(`[canada-mb-write-charities] Firebase connected (${describeCredentialSource()})`);

  const result = await writeMbCharities(db);

  await db.terminate();

  if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });
  const ts = WRITE_AT.replace(/[:.]/g, '-').replace('T', '_').slice(0, 19);
  const reportPath = path.join(REPORTS_DIR, `canada-mb-write-charities-${ts}.json`);
  const report = { run_type: 'FIRESTORE_WRITE', write_at: WRITE_AT, jurisdiction: 'CA-MB', dataset: result };
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');

  const sharedLatestPath = path.join(REPORTS_DIR, 'canada-mb-write-latest.json');
  let shared;
  try {
    shared = JSON.parse(fs.readFileSync(sharedLatestPath, 'utf8'));
  } catch (_) {
    shared = { run_type: 'FIRESTORE_WRITE', jurisdiction: 'CA-MB', datasets: [], deliberately_excluded: [] };
  }
  shared.datasets = (shared.datasets || []).filter((d) => d.dataset_id !== 'CV-DATA-MB-002');
  shared.datasets.push({ ...result, write_at: WRITE_AT });
  shared.deliberately_excluded = [
    'CV-DATA-MB-001 — Unemployment — automated Node fetch pipeline hit a transient ECONNRESET against the Stats Can API; coordinate independently confirmed correct via curl; write only after a clean automated fetch succeeds.',
    'CV-DATA-MB-003 — Grants/Public Payments — no official machine-readable Manitoba source exists. opendata.gov.mb.ca does not resolve; geoportal.gov.mb.ca ("Data MB") is geospatial only; federal open.canada.ca aggregator has no financial datasets for organization=mb beyond public-sector compensation (salary) disclosure, a different category. Manitoba\'s "Contract Disclosure" proactive-disclosure page (contracts >=$10,000/month) was identified but NOT used — it links only to an interactive/search-only web app (web.gov.mb.ca/DisclosureOfContracts/, ASP.NET MVC + Knockout.js/AJAX) with no bulk CSV or documented API export. Extracting it would require scraping rendered results or an undocumented internal endpoint, which was not authorized for this data pipeline. This dataset cannot be written until Manitoba publishes a structured (CSV/XLSX/API) source, or scraping/PDF extraction is explicitly authorized as a separate decision.',
  ];
  shared.last_updated = WRITE_AT;
  shared.summary = {
    total_attempted: shared.datasets.length,
    written: shared.datasets.filter((d) => d.status === 'WRITTEN').length,
    failed: shared.datasets.filter((d) => d.status === 'FAILED').length,
    warnings_total: shared.datasets.reduce((s, d) => s + (d.warnings?.length || 0), 0),
  };
  fs.writeFileSync(sharedLatestPath, JSON.stringify(shared, null, 2), 'utf8');

  console.log('\n[canada-mb-write-charities] ============ WRITE SUMMARY ============');
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
  console.log('\n[canada-mb-write-charities] done.');

  if (result.status !== 'WRITTEN') process.exit(1);
}

main().catch((err) => {
  console.error('[canada-mb-write-charities] fatal:', err);
  process.exit(1);
});
