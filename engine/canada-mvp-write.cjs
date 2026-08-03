/**
 * Canadian MVP dataset write — CV-DATA-002 and CV-DATA-008 only.
 *
 * Writes verified datasets to Firestore using merge-only. Does NOT write
 * CV-DATA-014 (Ontario grants) — pending product/licence decision.
 *
 * Verification records:
 *   CV-REC-001-2026-08-03-CV-DATA-002 (unemployment)
 *   CV-REC-001-2026-08-03-CV-DATA-008 (CRA Charities)
 *
 * Usage:
 *   node engine/canada-mvp-write.cjs
 */

'use strict';

const fs = require('fs');
const path = require('path');

const { tryGetFirestore, describeCredentialSource } = require('./firebase-admin-init.cjs');
const caOn = require('./lib/subnational-transparency-ca-on.cjs');
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
  CV_DATA_002: 'CV-REC-001-2026-08-03-CV-DATA-002',
  CV_DATA_008: 'CV-REC-001-2026-08-03-CV-DATA-008',
};

// ─── CV-DATA-002: Statistics Canada unemployment ──────────────────────────────

async function writeUnemployment(db) {
  const result = {
    dataset_id: 'CV-DATA-002',
    dataset_name: 'Statistics Canada — Ontario Unemployment (Table 14-10-0287-01)',
    verification_id: VERIFICATION_IDS.CV_DATA_002,
    firestore_path: `${COLLECTIONS.economic}/CA-ON`,
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
    console.log('[canada-mvp-write] CV-DATA-002: fetching…');
    const doc = await caOn.buildEconomic();

    const notes = doc?.data_status?.notes || [];
    if (notes.length) result.warnings.push(...notes);

    if (!hasEconomicPayload(doc)) {
      throw new Error('No economic payload (unemployment series empty)');
    }

    // Augment payload with verification + licence metadata
    doc.verification_status = VERIFICATION_IDS.CV_DATA_002;
    doc.licence_note = 'Statistics Canada Open Licence. Attribution: "Statistics Canada. Table 14-10-0287-01."';
    doc.cv_data_id = 'CV-DATA-002';

    console.log('[canada-mvp-write] CV-DATA-002: writing to Firestore…');
    const writeResult = await mergeTransparencyDoc(db, COLLECTIONS.economic, 'CA-ON', doc, 'economic');

    if (!writeResult.written) {
      throw new Error(`mergeTransparencyDoc returned written=false: ${writeResult.reason}`);
    }

    result.status = 'WRITTEN';
    result.reporting_period = doc.unemployment_reporting_period || doc.reporting_period || null;

    const series = doc.unemployment_series_monthly || doc.unemployment_series_rolling_3_month || [];
    result.records_written = series.length;
    result.sample_written = series.slice(0, 3).map((r) => {
      const s = {};
      for (const [k, v] of Object.entries(r)) s[k] = typeof v === 'string' ? v.slice(0, 80) : v;
      return s;
    });

    result.fields_written = Object.keys(doc).filter((k) => doc[k] != null);
    result.source_url = doc.unemployment_source_url || caOn.SOURCES.unemployment;

  } catch (err) {
    result.status = 'FAILED';
    result.error = err.message || String(err);
  }

  return result;
}

// ─── CV-DATA-008: CRA Charities Registry ─────────────────────────────────────

async function writeCharities(db) {
  const result = {
    dataset_id: 'CV-DATA-008',
    dataset_name: 'CRA Charities Registry — Ontario org-level extract (MVP: name/type/category)',
    verification_id: VERIFICATION_IDS.CV_DATA_008,
    firestore_path: `${COLLECTIONS.tax}/CA-ON`,
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
    mvp_note: 'Name/type/category only. rawValue=0 enforced. No dollar values per CV-LAUNCH-DEC-001.',
  };

  try {
    console.log('[canada-mvp-write] CV-DATA-008: fetching…');
    const doc = await caOn.buildTax();

    if (!hasTaxPayload(doc)) {
      throw new Error('No tax payload (records array empty)');
    }

    // Validate MVP constraint: no dollar values
    const withDollarValues = doc.records.filter((r) => r.rawValue > 0);
    if (withDollarValues.length > 0) {
      result.warnings.push(`${withDollarValues.length} records have rawValue > 0 — stripping to 0 before write`);
      doc.records = doc.records.map((r) => ({ ...r, rawValue: 0 }));
    }

    // Augment with verification + licence metadata
    doc.verification_status = VERIFICATION_IDS.CV_DATA_008;
    doc.licence_note = 'Open Government Licence — Canada (OGL-Canada). Attribution: "Contains information licensed under the Open Government Licence — Canada. Source: Canada Revenue Agency Charities Directorate."';
    doc.cv_data_id = 'CV-DATA-008';

    console.log('[canada-mvp-write] CV-DATA-008: writing to Firestore…');
    const writeResult = await mergeTransparencyDoc(db, COLLECTIONS.tax, 'CA-ON', doc, 'tax');

    if (!writeResult.written) {
      throw new Error(`mergeTransparencyDoc returned written=false: ${writeResult.reason}`);
    }

    result.status = 'WRITTEN';
    result.reporting_period = doc.data_source || 'CRA Charities Registry latest extract';
    result.source_url = doc.source_url || caOn.SOURCES.charities;
    result.records_written = doc.records_stored || doc.records.length;
    result.sample_written = doc.records.slice(0, 3).map((r) => {
      const s = {};
      for (const [k, v] of Object.entries(r)) s[k] = typeof v === 'string' ? v.slice(0, 80) : v;
      return s;
    });
    result.fields_written = Object.keys(doc).filter((k) => doc[k] != null);

  } catch (err) {
    result.status = 'FAILED';
    result.error = err.message || String(err);
  }

  return result;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('[canada-mvp-write] ============================================');
  console.log('[canada-mvp-write] Canadian MVP Firestore write');
  console.log('[canada-mvp-write] Datasets: CV-DATA-002, CV-DATA-008 only');
  console.log('[canada-mvp-write] CV-DATA-014 deliberately excluded');
  console.log(`[canada-mvp-write] Started: ${WRITE_AT}`);
  console.log('[canada-mvp-write] ============================================');

  const db = tryGetFirestore();
  if (!db) {
    console.error('[canada-mvp-write] FATAL: Firebase credentials not found.');
    console.error('[canada-mvp-write] Credential source:', describeCredentialSource());
    process.exit(1);
  }
  console.log(`[canada-mvp-write] Firebase connected (${describeCredentialSource()})`);

  // Run fetches in parallel, writes sequentially (avoid partial state)
  console.log('[canada-mvp-write] Fetching both datasets…');
  const [unempSettled, charitiesSettled] = await Promise.allSettled([
    caOn.buildEconomic(),
    caOn.buildTax(),
  ]);

  // Write sequentially
  const results = [];

  // CV-DATA-002
  const unempResult = {
    dataset_id: 'CV-DATA-002',
    dataset_name: 'Statistics Canada — Ontario Unemployment',
    verification_id: VERIFICATION_IDS.CV_DATA_002,
    firestore_path: `${COLLECTIONS.economic}/CA-ON`,
    write_mode: 'merge',
    write_at: WRITE_AT,
    status: null, error: null, reporting_period: null,
    records_written: null, fields_written: [], sample_written: [],
    warnings: [], ui_renderable: true,
  };
  if (unempSettled.status === 'rejected') {
    unempResult.status = 'FAILED';
    unempResult.error = unempSettled.reason?.message || String(unempSettled.reason);
  } else {
    const doc = unempSettled.value;
    const notes = doc?.data_status?.notes || [];
    if (notes.length) unempResult.warnings.push(...notes);
    if (!hasEconomicPayload(doc)) {
      unempResult.status = 'FAILED';
      unempResult.error = 'No economic payload (unemployment series empty)';
    } else {
      try {
        doc.verification_status = VERIFICATION_IDS.CV_DATA_002;
        doc.licence_note = 'Statistics Canada Open Licence. Attribution: "Statistics Canada. Table 14-10-0287-01."';
        doc.cv_data_id = 'CV-DATA-002';
        console.log('[canada-mvp-write] Writing CV-DATA-002 to Firestore…');
        const wr = await mergeTransparencyDoc(db, COLLECTIONS.economic, 'CA-ON', doc, 'economic');
        if (!wr.written) throw new Error(`written=false: ${wr.reason}`);
        unempResult.status = 'WRITTEN';
        unempResult.reporting_period = doc.unemployment_reporting_period || doc.reporting_period || null;
        unempResult.source_url = doc.unemployment_source_url || caOn.SOURCES.unemployment;
        const series = doc.unemployment_series_monthly || doc.unemployment_series_rolling_3_month || [];
        unempResult.records_written = series.length;
        unempResult.sample_written = series.slice(0, 3);
        unempResult.fields_written = Object.keys(doc).filter((k) => doc[k] != null);
        console.log(`[canada-mvp-write] CV-DATA-002 written (${series.length} data points).`);
      } catch (err) {
        unempResult.status = 'FAILED';
        unempResult.error = err.message || String(err);
      }
    }
  }
  results.push(unempResult);

  // CV-DATA-008
  const charitiesResult = {
    dataset_id: 'CV-DATA-008',
    dataset_name: 'CRA Charities Registry — Ontario (MVP: name/type/category)',
    verification_id: VERIFICATION_IDS.CV_DATA_008,
    firestore_path: `${COLLECTIONS.tax}/CA-ON`,
    write_mode: 'merge',
    write_at: WRITE_AT,
    status: null, error: null, reporting_period: null,
    records_written: null, fields_written: [], sample_written: [],
    warnings: [], ui_renderable: true,
    mvp_note: 'Name/type/category only. rawValue=0 enforced.',
  };
  if (charitiesSettled.status === 'rejected') {
    charitiesResult.status = 'FAILED';
    charitiesResult.error = charitiesSettled.reason?.message || String(charitiesSettled.reason);
  } else {
    const doc = charitiesSettled.value;
    if (!hasTaxPayload(doc)) {
      charitiesResult.status = 'FAILED';
      charitiesResult.error = 'No tax payload (records array empty)';
    } else {
      try {
        // Enforce MVP constraint
        const violators = doc.records.filter((r) => r.rawValue > 0);
        if (violators.length) {
          charitiesResult.warnings.push(`${violators.length} records had rawValue>0 — zeroed before write`);
          doc.records = doc.records.map((r) => ({ ...r, rawValue: 0 }));
        }
        doc.verification_status = VERIFICATION_IDS.CV_DATA_008;
        doc.licence_note = 'Open Government Licence — Canada (OGL-Canada). Source: Canada Revenue Agency Charities Directorate.';
        doc.cv_data_id = 'CV-DATA-008';
        console.log('[canada-mvp-write] Writing CV-DATA-008 to Firestore…');
        const wr = await mergeTransparencyDoc(db, COLLECTIONS.tax, 'CA-ON', doc, 'tax');
        if (!wr.written) throw new Error(`written=false: ${wr.reason}`);
        charitiesResult.status = 'WRITTEN';
        charitiesResult.reporting_period = doc.data_source || 'CRA Charities Registry latest extract';
        charitiesResult.source_url = doc.source_url || caOn.SOURCES.charities;
        charitiesResult.records_written = doc.records_stored || doc.records.length;
        charitiesResult.sample_written = doc.records.slice(0, 3);
        charitiesResult.fields_written = Object.keys(doc).filter((k) => doc[k] != null);
        console.log(`[canada-mvp-write] CV-DATA-008 written (${charitiesResult.records_written} records).`);
      } catch (err) {
        charitiesResult.status = 'FAILED';
        charitiesResult.error = err.message || String(err);
      }
    }
  }
  results.push(charitiesResult);

  await db.terminate();

  // ─── Write report ──────────────────────────────────────────────────────────
  const report = {
    run_type: 'FIRESTORE_WRITE',
    write_at: WRITE_AT,
    jurisdiction: 'CA-ON',
    deliberately_excluded: ['CV-DATA-014 — pending product/licence decision on Ontario Public Accounts scope'],
    datasets: results,
    summary: {
      total_attempted: results.length,
      written: results.filter((r) => r.status === 'WRITTEN').length,
      failed: results.filter((r) => r.status === 'FAILED').length,
      warnings_total: results.reduce((s, r) => s + (r.warnings?.length || 0), 0),
    },
  };

  if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });
  const reportPath = path.join(
    REPORTS_DIR,
    `canada-mvp-write-${WRITE_AT.replace(/[:.]/g, '-').replace('T', '_').slice(0, 19)}.json`,
  );
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
  const latestPath = path.join(REPORTS_DIR, 'canada-mvp-write-latest.json');
  fs.writeFileSync(latestPath, JSON.stringify(report, null, 2), 'utf8');

  // ─── Console summary ───────────────────────────────────────────────────────
  console.log('\n[canada-mvp-write] ============ WRITE SUMMARY ============');
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
  console.log(`  Excluded: CV-DATA-014 (Ontario grants/payments — pending product decision)`);
  console.log(`\n  Report: ${reportPath}`);
  console.log(`  Latest: ${latestPath}`);
  console.log('\n[canada-mvp-write] done.');
}

main().catch((err) => {
  console.error('[canada-mvp-write] fatal:', err);
  process.exit(1);
});
