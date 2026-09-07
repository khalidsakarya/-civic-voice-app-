/**
 * CA-YT (Yukon) — CV-DATA-YT-002 CRA Charities write ONLY.
 *
 * Writes the CRA Charities Registry (YT filter) dataset to Firestore using
 * merge-only. Does NOT touch CV-DATA-YT-001 (unemployment — automated fetch
 * still blocked by a transient network issue; also uses a different StatCan
 * table, 14-10-0292-01, since the provincial table 14-10-0287-01 does not
 * cover territories) or CV-DATA-YT-003 (grants/payments — Yukon Public
 * Accounts Schedules 8 and 9, which would contain exactly this data, are
 * PDF-only and PDF extraction was not authorized; yukon.ca is bot-blocked and
 * was not scraped. See canada-yt-dry-run.cjs and the shared write report for
 * the full search performed).
 *
 * Approval (2026-09-07): write CA-YT-002 CRA Charities.
 *   Target: subnational_tax_exempt_entities/CA-YT, merge-only.
 *   Store name/type/status/category only — no dollar values (rawValue: 0
 *   placeholder, same pattern already used for CA-ON, CA-BC, CA-AB, CA-QC,
 *   CA-SK, CA-MB, CA-NS, CA-NB, CA-NL, CA-PE).
 *
 * Verification record:
 *   CV-REC-001-2026-09-07-CV-DATA-YT-002 (YT CRA Charities)
 *
 * Usage:
 *   node engine/canada-yt-write-charities.cjs
 */

'use strict';

const fs = require('fs');
const path = require('path');

const { tryGetFirestore, describeCredentialSource } = require('./firebase-admin-init.cjs');
const caYt = require('./lib/subnational-transparency-ca-yt.cjs');
const { mergeTransparencyDoc, hasTaxPayload } = require('./lib/subnational-transparency-shared.cjs');

const REPORTS_DIR = path.join(__dirname, 'reports');
const WRITE_AT = new Date().toISOString();

const COLLECTION = 'subnational_tax_exempt_entities';
const JURISDICTION_ID = 'CA-YT';
const VERIFICATION_ID = 'CV-REC-001-2026-09-07-CV-DATA-YT-002';

async function writeYtCharities(db) {
  const result = {
    dataset_id: 'CV-DATA-YT-002',
    dataset_name: 'CRA Charities Registry — Yukon org-level extract (MVP: name/type/category)',
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
    console.log('[canada-yt-write-charities] CV-DATA-YT-002: fetching…');
    const doc = await caYt.buildTax();

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
    doc.cv_data_id = 'CV-DATA-YT-002';

    console.log('[canada-yt-write-charities] CV-DATA-YT-002: writing to Firestore (merge)…');
    const wr = await mergeTransparencyDoc(db, COLLECTION, JURISDICTION_ID, doc, 'tax');
    if (!wr.written) throw new Error(`mergeTransparencyDoc returned written=false: ${wr.reason}`);

    result.status = 'WRITTEN';
    result.reporting_period = doc.data_source || 'CRA Charities Registry latest extract';
    result.source_url = doc.source_url || caYt.SOURCES.charities;
    result.records_written = doc.records_stored || doc.records.length;
    result.sample_written = doc.records.slice(0, 10);
    result.fields_written = Object.keys(doc).filter((k) => doc[k] != null);

    console.log(`[canada-yt-write-charities] CV-DATA-YT-002 written (${result.records_written} records).`);
  } catch (err) {
    result.status = 'FAILED';
    result.error = err.message || String(err);
  }

  return result;
}

async function main() {
  console.log('[canada-yt-write-charities] ============================================');
  console.log('[canada-yt-write-charities] CA-YT — CV-DATA-YT-002 CRA Charities Firestore write');
  console.log('[canada-yt-write-charities] CV-DATA-YT-001 (unemployment) and CV-DATA-YT-003 (grants) are NOT touched by this script');
  console.log(`[canada-yt-write-charities] Started: ${WRITE_AT}`);
  console.log('[canada-yt-write-charities] ============================================');

  const db = tryGetFirestore();
  if (!db) {
    console.error('[canada-yt-write-charities] FATAL: Firebase credentials not found.');
    console.error('[canada-yt-write-charities] Credential source:', describeCredentialSource());
    process.exit(1);
  }
  console.log(`[canada-yt-write-charities] Firebase connected (${describeCredentialSource()})`);

  const result = await writeYtCharities(db);

  await db.terminate();

  if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });
  const ts = WRITE_AT.replace(/[:.]/g, '-').replace('T', '_').slice(0, 19);
  const reportPath = path.join(REPORTS_DIR, `canada-yt-write-charities-${ts}.json`);
  const report = { run_type: 'FIRESTORE_WRITE', write_at: WRITE_AT, jurisdiction: 'CA-YT', dataset: result };
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');

  const sharedLatestPath = path.join(REPORTS_DIR, 'canada-yt-write-latest.json');
  let shared;
  try {
    shared = JSON.parse(fs.readFileSync(sharedLatestPath, 'utf8'));
  } catch (_) {
    shared = { run_type: 'FIRESTORE_WRITE', jurisdiction: 'CA-YT', datasets: [], deliberately_excluded: [] };
  }
  shared.datasets = (shared.datasets || []).filter((d) => d.dataset_id !== 'CV-DATA-YT-002');
  shared.datasets.push({ ...result, write_at: WRITE_AT });
  shared.deliberately_excluded = [
    'CV-DATA-YT-001 — Unemployment — automated Node fetch pipeline hit a transient ECONNRESET against the Stats Can API; not written. Note: Yukon unemployment uses Statistics Canada Table 14-10-0292-01 ("Labour force characteristics by territory, three-month moving average, seasonally adjusted and unadjusted"), NOT the provincial Table 14-10-0287-01 used for ON/BC/AB/QC/SK/MB/NS/NB/NL/PE — Table 14-10-0287-01\'s geography dimension is Canada + the 10 provinces only and does not cover territories (confirmed via getCubeMetadata). Coordinate 1.8.1.1.1.1.0.0.0.0 in Table 14-10-0292-01 was independently confirmed correct via curl (Yukon unemployment rate series, 3.9%-7.9% across Mar-Aug 2026, current through the Sep 2026 release). Write only after a clean automated fetch succeeds.',
    'CV-DATA-YT-003 — Grants/Public Payments — not written. No current, machine-readable (CSV/XLSX/JSON), whole-of-government Yukon grants/payments/public-accounts source exists. yukon.ca returns HTTP 403 to automated requests (bot-protected) and was not scraped. Yukon\'s CKAN open data portal (open.yukon.ca) was searched across 8 financial-related terms; found only narrow single-program grants, an unverified self-reported supplier directory with no payment amounts, and Yukon\'s own current, comprehensive Public Accounts (fiscal years 2001-02 through 2024-25) — including exactly the needed Schedule 8 ("Schedule of legislated grants") and Schedule 9 ("Schedule of other government transfers") — but a full organization-wide scan confirmed every one of the 170 Finance-organization datasets on open.yukon.ca is published as PDF only (0% CSV/XLSX/JSON). PDF extraction was not authorized for this task, so Yukon Public Accounts were not used. This is a genuine data-format gap, not a fetch failure — see engine/lib/subnational-transparency-ca-yt.cjs module header and engine/reports/canada-yt-dry-run-latest.json for the full search performed.',
  ];
  shared.last_updated = WRITE_AT;
  shared.summary = {
    total_attempted: shared.datasets.length,
    written: shared.datasets.filter((d) => d.status === 'WRITTEN').length,
    failed: shared.datasets.filter((d) => d.status === 'FAILED').length,
    warnings_total: shared.datasets.reduce((s, d) => s + (d.warnings?.length || 0), 0),
  };
  fs.writeFileSync(sharedLatestPath, JSON.stringify(shared, null, 2), 'utf8');

  console.log('\n[canada-yt-write-charities] ============ WRITE SUMMARY ============');
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
  console.log('\n[canada-yt-write-charities] done.');

  if (result.status !== 'WRITTEN') process.exit(1);
}

main().catch((err) => {
  console.error('[canada-yt-write-charities] fatal:', err);
  process.exit(1);
});
