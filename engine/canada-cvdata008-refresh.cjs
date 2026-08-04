'use strict';

/**
 * CV-DATA-008 designation label refresh write.
 * Scope: CRA Charities only. No unemployment. No grants. No UI. No compliance docs.
 * Reason: CRA designation codes A/B now correctly mapped (Public/Private Foundation).
 */

const fs = require('fs');
const path = require('path');

const { tryGetFirestore, describeCredentialSource } = require('./firebase-admin-init.cjs');
const caOn = require('./lib/subnational-transparency-ca-on.cjs');
const { mergeTransparencyDoc, hasTaxPayload } = require('./lib/subnational-transparency-shared.cjs');

const REPORTS_DIR = path.join(__dirname, 'reports');
const WRITE_AT = new Date().toISOString();
const COLLECTION = 'subnational_tax_exempt_entities';
const JURISDICTION = 'CA-ON';
const VERIFICATION_ID = 'CV-REC-001-2026-08-03-CV-DATA-008';

async function main() {
  console.log('[cv-data-008-refresh] CV-DATA-008 designation label refresh');
  console.log(`[cv-data-008-refresh] Started: ${WRITE_AT}`);
  console.log('[cv-data-008-refresh] Scope: CRA Charities only — no other datasets touched');

  const db = tryGetFirestore();
  if (!db) {
    console.error('[cv-data-008-refresh] FATAL: Firebase credentials not found.');
    console.error('[cv-data-008-refresh] Credential source:', describeCredentialSource());
    process.exit(1);
  }
  console.log(`[cv-data-008-refresh] Firebase connected (${describeCredentialSource()})`);

  console.log('[cv-data-008-refresh] Fetching CRA charities (ident_updated.csv)…');
  const doc = await caOn.buildTax();

  if (!hasTaxPayload(doc)) {
    console.error('[cv-data-008-refresh] FATAL: No tax payload returned.');
    process.exit(1);
  }

  // Enforce MVP: no dollar values
  const violators = doc.records.filter((r) => r.rawValue > 0);
  if (violators.length) {
    console.warn(`[cv-data-008-refresh] Zeroing ${violators.length} records with rawValue > 0`);
    doc.records = doc.records.map((r) => ({ ...r, rawValue: 0 }));
  }

  doc.verification_status = VERIFICATION_ID;
  doc.licence_note =
    'Open Government Licence — Canada (OGL-Canada). Source: Canada Revenue Agency Charities Directorate.';
  doc.cv_data_id = 'CV-DATA-008';
  doc.designation_refresh_reason =
    'A=Public Foundation, B=Private Foundation per CRA codes_en.pdf §2.4 (2025-11-28)';

  console.log('[cv-data-008-refresh] Writing to Firestore (merge)…');
  const wr = await mergeTransparencyDoc(db, COLLECTION, JURISDICTION, doc, 'tax');

  if (!wr.written) {
    console.error('[cv-data-008-refresh] FATAL: mergeTransparencyDoc returned written=false:', wr.reason);
    process.exit(1);
  }

  await db.terminate();

  // Identify A/B designation records in the written batch
  const abRecords = doc.records.filter((r) =>
    r.exemType === 'Public Foundation' || r.exemType === 'Private Foundation',
  );

  const report = {
    dataset_id: 'CV-DATA-008',
    refresh_reason: 'CRA designation codes A/B corrected to Public Foundation / Private Foundation',
    firestore_path: `${COLLECTION}/${JURISDICTION}`,
    write_mode: 'merge',
    write_at: WRITE_AT,
    status: 'WRITTEN',
    records_written: doc.records_stored || doc.records.length,
    total_in_source: doc.total_in_source,
    source_url: doc.source_url || caOn.SOURCES.charities,
    reporting_period: doc.data_source || 'CRA Charities Registry latest extract',
    designation_mapping_applied: {
      A: 'Public Foundation',
      B: 'Private Foundation',
      C: 'Charitable Organization',
      PF: 'Private Foundation',
      PBF: 'Public Foundation',
      QD: 'Qualified Donee',
    },
    foundation_records_in_batch: abRecords.length,
    sample_foundation_records: abRecords.slice(0, 5).map((r) => ({
      name: r.name,
      exemType: r.exemType,
      industry: r.industry,
      rawValue: r.rawValue,
    })),
    sample_all_records: doc.records.slice(0, 3).map((r) => ({
      name: r.name,
      exemType: r.exemType,
      industry: r.industry,
      rawValue: r.rawValue,
    })),
    other_datasets_touched: 'none',
    mvp_note: 'Name/type/category only. rawValue=0 for all records per CV-LAUNCH-DEC-001.',
  };

  if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });
  const reportPath = path.join(REPORTS_DIR, 'cv-data-008-refresh-latest.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');

  console.log('\n[cv-data-008-refresh] ============ WRITE SUMMARY ============');
  console.log(`  status:                  WRITTEN`);
  console.log(`  firestore path:          ${report.firestore_path}`);
  console.log(`  records written:         ${report.records_written}`);
  console.log(`  total in source:         ${report.total_in_source}`);
  console.log(`  foundation records:      ${report.foundation_records_in_batch} (Public + Private)`);
  if (abRecords.length > 0) {
    console.log('  sample foundation records:');
    for (const r of abRecords.slice(0, 5)) {
      console.log(`    ${r.exemType.padEnd(20)} ${r.name}`);
    }
  }
  console.log(`  other datasets touched:  none`);
  console.log(`  report:                  ${reportPath}`);
  console.log('[cv-data-008-refresh] done.');
}

main().catch((err) => {
  console.error('[cv-data-008-refresh] fatal:', err);
  process.exit(1);
});
