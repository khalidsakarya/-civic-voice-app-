'use strict';

/**
 * READ-ONLY audit of subnational_grants/CA-ON.
 * No writes. No modifications. Audit only.
 */

const fs = require('fs');
const path = require('path');
const { tryGetFirestore } = require('./firebase-admin-init.cjs');

const REPORTS_DIR = path.join(__dirname, 'reports');

async function main() {
  console.log('[audit-grants] READ-ONLY audit: subnational_grants/CA-ON');

  const db = tryGetFirestore();
  if (!db) { console.error('[audit-grants] FATAL: no Firebase credentials'); process.exit(1); }

  const snap = await db.collection('subnational_grants').doc('CA-ON').get();

  if (!snap.exists) {
    console.log('[audit-grants] Document does NOT exist in Firestore.');
    await db.terminate();
    return;
  }

  const data = snap.data();

  // Top-level metadata fields
  const meta = {};
  for (const key of Object.keys(data)) {
    if (key !== 'records') meta[key] = data[key];
  }

  const records = Array.isArray(data.records) ? data.records : [];

  // Category distribution
  const catDist = {};
  for (const r of records) {
    const cat = r.category || r.type || r.paymentType || r.ministry || '(none)';
    catDist[cat] = (catDist[cat] || 0) + 1;
  }

  const report = {
    firestore_path: 'subnational_grants/CA-ON',
    document_exists: true,
    audit_at: new Date().toISOString(),
    metadata: meta,
    record_count: records.length,
    category_distribution: catDist,
    top_20_records: records.slice(0, 20),
    all_fields_on_records: records.length > 0
      ? [...new Set(records.flatMap(r => Object.keys(r)))]
      : [],
  };

  if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });
  const out = path.join(REPORTS_DIR, 'audit-grants-ca-on.json');
  fs.writeFileSync(out, JSON.stringify(report, null, 2), 'utf8');

  console.log('\n[audit-grants] ============ AUDIT RESULTS ============');
  console.log('  document exists:   YES');
  console.log('  record count:      ' + records.length);
  console.log('\n  TOP-LEVEL METADATA:');
  for (const [k, v] of Object.entries(meta)) {
    const display = typeof v === 'object' ? JSON.stringify(v).slice(0, 120) : String(v).slice(0, 120);
    console.log(`    ${k.padEnd(30)} ${display}`);
  }
  console.log('\n  RECORD FIELDS: ' + report.all_fields_on_records.join(', '));
  console.log('\n  CATEGORY DISTRIBUTION:');
  for (const [cat, count] of Object.entries(catDist)) {
    console.log(`    ${String(count).padStart(4)}  ${cat}`);
  }
  console.log('\n  TOP 20 RECORDS:');
  for (let i = 0; i < Math.min(20, records.length); i++) {
    const r = records[i];
    console.log(`  [${String(i+1).padStart(2)}] ${JSON.stringify(r)}`);
  }
  console.log(`\n  Full report: ${out}`);
  console.log('[audit-grants] done. No writes performed.');

  await db.terminate();
}

main().catch(err => { console.error('[audit-grants] fatal:', err); process.exit(1); });
