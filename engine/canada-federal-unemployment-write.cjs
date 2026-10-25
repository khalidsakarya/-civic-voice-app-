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
 * OWNERSHIP: the sibling civic-voice-engine is the ongoing scheduled owner of this document
 * (its monthly targeted job writes the identical document from the same series). This script
 * is the one-off bootstrap / manual check. Therefore it REFUSES to touch a document that
 * already exists unless you pass --approve-overwrite=<fingerprint>, where the fingerprint is
 * printed by the refusal and identifies that exact stored state. It is not a boolean flag and
 * stops matching if the document changes. Duplicate documents under other ids are refused with
 * no override. The script never deletes anything.
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
const crypto = require('crypto');

const {
  fetchFederalUnemploymentDoc,
  DOC_ID,
} = require('./lib/canada-federal-unemployment.cjs');

// CV_REPORTS_DIR lets tests write their report somewhere else than engine/reports.
const REPORTS_DIR = process.env.CV_REPORTS_DIR || path.join(__dirname, 'reports');
const COLLECTION = 'social_stats';

const APPROVAL_RE = /^[0-9a-f]{16}$/;

function parseArgs(argv) {
  const a = argv.find((x) => x.startsWith('--approve-overwrite='));
  const token = a ? a.slice('--approve-overwrite='.length).trim().toLowerCase() : '';
  return {
    write: argv.includes('--write'),
    // NOT a boolean flag: approval is a fingerprint of one specific stored document (see
    // fingerprintExistingDocument). Anything that is not exactly 16 hex characters is "no approval".
    approveOverwrite: APPROVAL_RE.test(token) ? token : null,
    // Removed in favour of a hard refusal; main() fails loudly if it is still passed.
    removedDuplicateFlag: argv.includes('--allow-duplicate-stat'),
  };
}

const asIso = (v) => (v && typeof v.toDate === 'function' ? v.toDate().toISOString() : (v == null ? null : String(v)));

/**
 * Fingerprint of ONE stored document's identifying state. An overwrite approval is the
 * fingerprint of the document the operator actually looked at: if the document has since
 * changed (another process rewrote it), the approval no longer matches and the write is
 * refused again. It cannot be baked into a script or passed "just in case".
 */
function fingerprintExistingDocument(id, data) {
  const d = data || {};
  const basis = JSON.stringify([id, d.country ?? null, d.statName ?? null, d.value ?? null, asIso(d.updated), d.source ?? null, d.sourceUrl ?? null, asIso(d.last_updated)]);
  return crypto.createHash('sha256').update(basis).digest('hex').slice(0, 16);
}

/**
 * The write step, with the database passed in so tests can drive it with a stub
 * (no Firestore). Reads FIRST, writes only if every check passes, and never deletes.
 *
 *  1. Other documents with the same country + statName under a DIFFERENT id: the UI keeps only
 *     one value per statName, so a second one would override or be overridden. Hard refusal,
 *     with no override of any kind.
 *  2. The target document ALREADY EXISTS (it may be owned by another pipeline): refuse unless
 *     the caller supplies approveOverwrite equal to that document's current fingerprint.
 *  3. Otherwise write with { merge: true }, so fields this script does not define are preserved.
 *
 * @returns {Promise<{ status: 'WRITTEN'|'REFUSED_DUPLICATE'|'REFUSED_EXISTING', otherDocuments: string[],
 *   reason?: string, existing?: object, fingerprint?: string, overwroteApprovedDocument?: boolean }>}
 */
async function writeFederalUnemployment(db, built, { approveOverwrite = null } = {}) {
  const sameStat = await db.collection(COLLECTION)
    .where('country', '==', built.data.country)
    .where('statName', '==', built.data.statName)
    .get();
  const otherDocuments = sameStat.docs.map((d) => d.id).filter((id) => id !== built.id);
  if (otherDocuments.length) {
    return {
      status: 'REFUSED_DUPLICATE',
      otherDocuments,
      reason: `${COLLECTION} already has other document(s) with country=${built.data.country}, statName=${built.data.statName}: ${otherDocuments.join(', ')}. The UI keeps only one value per statName, so a second document could override or be overridden. Nothing was written or deleted, and there is no override for this: resolve those documents first.`,
    };
  }

  // The query above only finds the target if it carries the matching fields; read it directly too.
  const targetSnap = await db.collection(COLLECTION).doc(built.id).get();
  if (targetSnap.exists) {
    const data = typeof targetSnap.data === 'function' ? targetSnap.data() : {};
    const fingerprint = fingerprintExistingDocument(built.id, data);
    if (approveOverwrite !== fingerprint) {
      const existing = { id: built.id, value: data.value ?? null, updated: asIso(data.updated), source: data.source ?? null, last_updated: asIso(data.last_updated) };
      return {
        status: 'REFUSED_EXISTING',
        otherDocuments: [],
        existing,
        fingerprint,
        reason: `${COLLECTION}/${built.id} already exists (value ${JSON.stringify(existing.value)}, updated ${JSON.stringify(existing.updated)}, source ${JSON.stringify(existing.source)}, last_updated ${existing.last_updated}). It may be owned by another pipeline. ${approveOverwrite ? 'The approval token you supplied does not match its current state (it may have changed since you looked).' : 'No approval was supplied.'} Nothing was written. If, having reviewed exactly this document, you approve overwriting it, re-run with --approve-overwrite=${fingerprint}`,
      };
    }
    await db.collection(COLLECTION).doc(built.id).set(built.data, { merge: true });
    return { status: 'WRITTEN', otherDocuments: [], overwroteApprovedDocument: true, fingerprint };
  }

  await db.collection(COLLECTION).doc(built.id).set(built.data, { merge: true });
  return { status: 'WRITTEN', otherDocuments: [], overwroteApprovedDocument: false };
}

function saveReport(name, report) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
  const file = path.join(REPORTS_DIR, name);
  fs.writeFileSync(file, JSON.stringify(report, null, 2) + '\n', 'utf8');
  return file;
}

async function main() {
  const { write, approveOverwrite, removedDuplicateFlag } = parseArgs(process.argv.slice(2));
  if (removedDuplicateFlag) {
    throw new Error('--allow-duplicate-stat was removed: a duplicate country/statName document is never overridable. Resolve the duplicate first.');
  }
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
    const result = await writeFederalUnemployment(db, built, { approveOverwrite });
    report.other_documents_with_same_statName = result.otherDocuments;
    report.write_result = result.status === 'WRITTEN'
      ? { status: 'WRITTEN', doc: `${COLLECTION}/${built.id}`, overwrote_approved_existing_document: !!result.overwroteApprovedDocument }
      : { status: result.status, reason: result.reason, existing: result.existing || null, fingerprint_needed_for_approval: result.fingerprint || null };
    if (result.status === 'WRITTEN') {
      console.log('\nWRITTEN:', report.write_result.doc);
    } else {
      console.error('\nNOT WRITTEN:', result.reason);
      process.exitCode = 1;
    }
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

module.exports = { parseArgs, writeFederalUnemployment, fingerprintExistingDocument };
