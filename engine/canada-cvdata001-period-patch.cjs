'use strict';

// CV-DATA-001 — patch population_reporting_period to ISO date "2025-07-01".
// Merge write. No other fields touched.

const { tryGetFirestore } = require('./firebase-admin-init.cjs');

async function main() {
  const db = tryGetFirestore();
  if (!db) { console.error('FATAL: no Firebase credentials'); process.exit(1); }

  const ref = db.collection('subnational_jurisdictions').doc('CA-ON');
  await ref.set({ population_reporting_period: '2025-07-01' }, { merge: true });

  console.log('✓ population_reporting_period = "2025-07-01" written to subnational_jurisdictions/CA-ON');
  console.log('  No other fields touched.');

  await db.terminate();
}

main().catch(err => { console.error('FATAL:', err); process.exit(1); });
