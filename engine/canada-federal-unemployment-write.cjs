/**
 * Federal Canada unemployment rate -> Firestore `social_stats/CA_unemploymentRate`.
 *
 * DRY-RUN BY DEFAULT. This script touches Firestore ONLY when invoked with
 * `--write`. Without it, it fetches + verifies the Statistics Canada series,
 * builds the document, prints it, and saves a local report — no Firestore
 * client is even created.
 *
 *   node engine/canada-federal-unemployment-write.cjs            # dry-run (default)
 *   node engine/canada-federal-unemployment-write.cjs --write    # writes ONE document
 *
 * What gets written (merge, a single document):
 *   social_stats/CA_unemploymentRate
 *   { country:'CA', statName:'unemploymentRate', value:'6.9%', updated:'Sep 2026',
 *     trend:[12 monthly values], source, sourceUrl, sub, last_updated, ... }
 * This is exactly the shape the existing federal "Government Stats" card reads
 * (see renderGovernmentStatsPage in src/App.js); no other document or
 * collection is touched.
 *
 * Importing this file never runs anything (main() is guarded).
 */

'use strict';

const fs = require('fs');
const path = require('path');

const {
  fetchFederalUnemploymentDoc,
  DOC_ID,
} = require('./lib/canada-federal-unemployment.cjs');

// CV_REPORTS_DIR lets tests write their report somewhere else than engine/reports.
const REPORTS_DIR = process.env.CV_REPORTS_DIR || path.join(__dirname, 'reports');
const COLLECTION = 'social_stats';

function parseArgs(argv) {
  return { write: argv.includes('--write') };
}

function saveReport(name, report) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
  const file = path.join(REPORTS_DIR, name);
  fs.writeFileSync(file, JSON.stringify(report, null, 2) + '\n', 'utf8');
  return file;
}

async function main() {
  const { write } = parseArgs(process.argv.slice(2));
  const startedAt = new Date().toISOString();

  console.log(write
    ? '\n!!! --write given: this run WILL write social_stats/' + DOC_ID + ' to Firestore !!!\n'
    : '\n[dry-run] No Firestore client will be created. Pass --write to write.\n');

  const built = await fetchFederalUnemploymentDoc({ nowIso: startedAt });
  console.log('Series verified against StatCan cube metadata:', built.identity.members.join(' · '));
  console.log(`Cube: ${built.cubeTitle} (latest period ${built.cubeEndDate}); fetched ${built.pointsFetched} monthly points.`);
  console.log(`\n${COLLECTION}/${built.id}:`);
  console.log(JSON.stringify(built.data, null, 2));

  const report = {
    run_type: write ? 'WRITE' : 'DRY_RUN',
    run_at: startedAt,
    target: `${COLLECTION}/${built.id}`,
    firestore_interaction: write ? 'see write_result below' : 'none — dry-run, no Firestore client created',
    series_identity_verified: built.identity,
    cube_title: built.cubeTitle,
    cube_latest_period: built.cubeEndDate,
    document: built.data,
  };

  if (!write) {
    const f = saveReport('canada-federal-unemployment-dry-run-latest.json', report);
    console.log('\nDry-run report saved:', f);
    return;
  }

  const { tryGetFirestore } = require('./firebase-admin-init.cjs');
  const db = tryGetFirestore();
  if (!db) throw new Error('No Firestore credentials available; nothing written.');
  try {
    // The Government Stats card keys live values by `statName`, so another CA document with the
    // same statName under a different id would collide with this one. Report-only: never deleted here.
    const sameStat = await db.collection(COLLECTION)
      .where('country', '==', built.data.country)
      .where('statName', '==', built.data.statName)
      .get();
    const others = sameStat.docs.map((d) => d.id).filter((id) => id !== built.id);
    report.other_documents_with_same_statName = others;
    if (others.length) {
      console.warn(`WARNING: other ${COLLECTION} documents already carry country=CA, statName=${built.data.statName}: ${others.join(', ')}. The UI keeps only one per statName; review before relying on this value.`);
    }
    await db.collection(COLLECTION).doc(built.id).set(built.data, { merge: true });
    report.write_result = { status: 'WRITTEN', doc: `${COLLECTION}/${built.id}` };
    console.log('\nWRITTEN:', report.write_result.doc);
  } catch (err) {
    report.write_result = { status: 'FAILED', code: err.code, message: String(err.message || err).slice(0, 300) };
    console.error('\nWRITE FAILED:', report.write_result.message);
    process.exitCode = 1;
  } finally {
    saveReport('canada-federal-unemployment-write-latest.json', report);
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error('FAILED:', err.message);
    process.exit(1);
  });
}

module.exports = { parseArgs };
