/**
 * CA-BC (British Columbia) dataset write — unemployment and CRA charities only.
 *
 * Writes verified datasets to Firestore using merge-only. Does NOT write
 * BC Public Payments (CV-DATA-BC-003) — pending reviewer decision on
 * accounting-aggregate rows (PUBLIC DEBT SERVICING COSTS, REVENUE REFUNDS).
 *
 * Verification records:
 *   CV-REC-001-2026-08-16-CV-DATA-BC-001 (unemployment)
 *   CV-REC-001-2026-08-16-CV-DATA-BC-002 (CRA Charities)
 *
 * Usage:
 *   node engine/canada-bc-write.cjs
 */

'use strict';

const fs = require('fs');
const path = require('path');

const { tryGetFirestore, describeCredentialSource } = require('./firebase-admin-init.cjs');
const caBc = require('./lib/subnational-transparency-ca-bc.cjs');
const {
  mergeTransparencyDoc,
  hasEconomicPayload,
  hasTaxPayload,
} = require('./lib/subnational-transparency-shared.cjs');

const REPORTS_DIR = path.join(__dirname, 'reports');
const WRITE_AT = new Date().toISOString();

const COLLECTIONS = {
  economic: 'subnational_economic_social_stats',
  tax: 'subnational_tax_exempt_entities',
};

const VERIFICATION_IDS = {
  UNEMPLOYMENT: 'CV-REC-001-2026-08-16-CV-DATA-BC-001',
  CHARITIES: 'CV-REC-001-2026-08-16-CV-DATA-BC-002',
};

// ─── Unemployment ──────────────────────────────────────────────────────────────

async function writeUnemployment(db) {
  const result = {
    dataset_id: 'CV-DATA-BC-001',
    dataset_name: 'Statistics Canada — British Columbia Unemployment (Table 14-10-0287-01)',
    verification_id: VERIFICATION_IDS.UNEMPLOYMENT,
    firestore_path: `${COLLECTIONS.economic}/CA-BC`,
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
  };

  try {
    console.log('[canada-bc-write] CV-DATA-BC-001: fetching…');
    const doc = await caBc.buildEconomic();

    const notes = doc?.data_status?.notes || [];
    if (notes.length) result.warnings.push(...notes);

    if (!hasEconomicPayload(doc)) {
      throw new Error('No economic payload (unemployment series empty) — refusing to write');
    }

    doc.verification_status = VERIFICATION_IDS.UNEMPLOYMENT;
    doc.licence_note = 'Statistics Canada Open Licence. Attribution: "Statistics Canada. Table 14-10-0287-01."';
    doc.cv_data_id = 'CV-DATA-BC-001';

    console.log('[canada-bc-write] CV-DATA-BC-001: writing to Firestore (merge)…');
    const wr = await mergeTransparencyDoc(db, COLLECTIONS.economic, 'CA-BC', doc, 'economic');
    if (!wr.written) throw new Error(`mergeTransparencyDoc returned written=false: ${wr.reason}`);

    result.status = 'WRITTEN';
    result.reporting_period = doc.unemployment_reporting_period || doc.reporting_period || null;
    result.source_url = doc.unemployment_source_url || caBc.SOURCES.unemployment;

    const series = doc.unemployment_series_monthly || doc.unemployment_series_rolling_3_month || [];
    result.records_written = series.length;
    result.sample_written = series.slice(0, 3);
    result.fields_written = Object.keys(doc).filter((k) => doc[k] != null);

    console.log(`[canada-bc-write] CV-DATA-BC-001 written (${series.length} monthly points).`);
  } catch (err) {
    result.status = 'FAILED';
    result.error = err.message || String(err);
  }

  return result;
}

// ─── CRA Charities ──────────────────────────────────────────────────────────────

async function writeCharities(db) {
  const result = {
    dataset_id: 'CV-DATA-BC-002',
    dataset_name: 'CRA Charities Registry — British Columbia org-level extract (MVP: name/type/category)',
    verification_id: VERIFICATION_IDS.CHARITIES,
    firestore_path: `${COLLECTIONS.tax}/CA-BC`,
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
    console.log('[canada-bc-write] CV-DATA-BC-002: fetching…');
    const doc = await caBc.buildTax();

    if (!hasTaxPayload(doc)) {
      throw new Error('No tax payload (records array empty) — refusing to write');
    }

    // Enforce MVP constraint: no dollar values leave this process
    const violators = doc.records.filter((r) => r.rawValue > 0);
    if (violators.length) {
      result.warnings.push(`${violators.length} records had rawValue>0 — zeroed before write`);
      doc.records = doc.records.map((r) => ({ ...r, rawValue: 0 }));
    }

    doc.verification_status = VERIFICATION_IDS.CHARITIES;
    doc.licence_note = 'Open Government Licence — Canada (OGL-Canada). Attribution: "Contains information licensed under the Open Government Licence — Canada. Source: Canada Revenue Agency Charities Directorate."';
    doc.cv_data_id = 'CV-DATA-BC-002';

    console.log('[canada-bc-write] CV-DATA-BC-002: writing to Firestore (merge)…');
    const wr = await mergeTransparencyDoc(db, COLLECTIONS.tax, 'CA-BC', doc, 'tax');
    if (!wr.written) throw new Error(`mergeTransparencyDoc returned written=false: ${wr.reason}`);

    result.status = 'WRITTEN';
    result.reporting_period = doc.data_source || 'CRA Charities Registry latest extract';
    result.source_url = doc.source_url || caBc.SOURCES.charities;
    result.records_written = doc.records_stored || doc.records.length;
    result.sample_written = doc.records.slice(0, 3);
    result.fields_written = Object.keys(doc).filter((k) => doc[k] != null);

    console.log(`[canada-bc-write] CV-DATA-BC-002 written (${result.records_written} records).`);
  } catch (err) {
    result.status = 'FAILED';
    result.error = err.message || String(err);
  }

  return result;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('[canada-bc-write] ============================================');
  console.log('[canada-bc-write] CA-BC (British Columbia) Firestore write');
  console.log('[canada-bc-write] Datasets: CV-DATA-BC-001, CV-DATA-BC-002 only');
  console.log('[canada-bc-write] CV-DATA-BC-003 (Public Payments) deliberately excluded');
  console.log(`[canada-bc-write] Started: ${WRITE_AT}`);
  console.log('[canada-bc-write] ============================================');

  const db = tryGetFirestore();
  if (!db) {
    console.error('[canada-bc-write] FATAL: Firebase credentials not found.');
    console.error('[canada-bc-write] Credential source:', describeCredentialSource());
    process.exit(1);
  }
  console.log(`[canada-bc-write] Firebase connected (${describeCredentialSource()})`);

  const results = [];
  results.push(await writeUnemployment(db));
  results.push(await writeCharities(db));

  await db.terminate();

  const report = {
    run_type: 'FIRESTORE_WRITE',
    write_at: WRITE_AT,
    jurisdiction: 'CA-BC',
    deliberately_excluded: [
      'CV-DATA-BC-003 — BC Public Payments — top records include accounting aggregates ' +
      '(PUBLIC DEBT SERVICING COSTS, REVENUE REFUNDS); needs reviewer decision/filter before write',
    ],
    datasets: results,
    summary: {
      total_attempted: results.length,
      written: results.filter((r) => r.status === 'WRITTEN').length,
      failed: results.filter((r) => r.status === 'FAILED').length,
      warnings_total: results.reduce((s, r) => s + (r.warnings?.length || 0), 0),
    },
  };

  if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });
  const ts = WRITE_AT.replace(/[:.]/g, '-').replace('T', '_').slice(0, 19);
  const reportPath = path.join(REPORTS_DIR, `canada-bc-write-${ts}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
  const latestPath = path.join(REPORTS_DIR, 'canada-bc-write-latest.json');
  fs.writeFileSync(latestPath, JSON.stringify(report, null, 2), 'utf8');

  console.log('\n[canada-bc-write] ============ WRITE SUMMARY ============');
  for (const r of results) {
    const icon = r.status === 'WRITTEN' ? '✓' : '✗';
    console.log(`\n  ${icon} ${r.dataset_id} — ${r.dataset_name}`);
    console.log(`    status:          ${r.status}`);
    if (r.error) console.log(`    error:           ${r.error}`);
    if (r.reporting_period) console.log(`    period:          ${r.reporting_period}`);
    if (r.records_written != null) console.log(`    records written: ${r.records_written}`);
    if (r.warnings?.length) console.log(`    warnings:        ${r.warnings.join('; ')}`);
    console.log(`    firestore path:  ${r.firestore_path}`);
    console.log(`    verification:    ${r.verification_id}`);
    console.log(`    ui renderable:   ${r.ui_renderable ? 'yes (no app code changes needed)' : 'no'}`);
  }
  console.log(`\n  Written: ${report.summary.written}/${report.summary.total_attempted}`);
  console.log('  Excluded: CV-DATA-BC-003 (BC Public Payments — pending reviewer filter decision)');
  console.log(`\n  Report: ${reportPath}`);
  console.log(`  Latest: ${latestPath}`);
  console.log('\n[canada-bc-write] done.');
}

main().catch((err) => {
  console.error('[canada-bc-write] fatal:', err);
  process.exit(1);
});
