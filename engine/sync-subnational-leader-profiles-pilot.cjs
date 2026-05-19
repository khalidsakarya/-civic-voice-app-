/**
 * Pilot sync: official leader profile fields → Firestore `subnational_jurisdictions`.
 *
 * Jurisdictions: CA-ON, US-CA, UK-ENG-LON, AU-NSW (official government sources only).
 *
 * Usage:
 *   node engine/sync-subnational-leader-profiles-pilot.cjs
 *   node engine/sync-subnational-leader-profiles-pilot.cjs --write
 *   node engine/sync-subnational-leader-profiles-pilot.cjs --write --only=US-CA,CA-ON
 */

const {
  tryGetFirestore,
  describeCredentialSource,
  formatPlaceholderCredentialMessage,
  assertFirebaseCredentialsForWrite,
  tryLoadDotenv,
} = require('./firebase-admin-init.cjs');
const { buildNonEmptyMergePatch } = require('./lib/subnational-leader-profile-shared.cjs');
const {
  PILOT_IDS,
  fetchOfficialLeaderProfile,
} = require('./lib/subnational-leader-profile-pilot.cjs');

const COLLECTION = 'subnational_jurisdictions';

function parseArgs(argv) {
  const write = argv.includes('--write');
  const onlyArg = argv.find((a) => a.startsWith('--only='));
  const only = onlyArg
    ? onlyArg
        .slice('--only='.length)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : [...PILOT_IDS];
  return { write, only };
}

function printVerificationReport(results) {
  console.log('\n=== Official field verification (pilot) ===\n');
  for (const r of results) {
    console.log(`--- ${r.jurisdictionId} ---`);
    for (const row of r.report.rows) {
      const mark = row.verified ? '✓' : '—';
      const src = row.source ? ` (${row.source})` : '';
      console.log(`  ${mark} ${row.field}${src}`);
    }
    console.log('');
  }
}

async function main() {
  tryLoadDotenv();
  const { write, only } = parseArgs(process.argv.slice(2));
  const fetchedAt = new Date().toISOString();

  console.log('[leader-profile-pilot] Civic Voice — official leader profiles');
  console.log(`[leader-profile-pilot] Mode: ${write ? 'WRITE (merge)' : 'DRY-RUN'}`);
  console.log(`[leader-profile-pilot] Jurisdictions: ${only.join(', ')}`);
  console.log(`[leader-profile-pilot] Credential: ${describeCredentialSource()}\n`);

  const results = [];
  const patches = [];

  for (const id of only) {
    if (!PILOT_IDS.includes(id)) {
      console.warn(`[leader-profile-pilot] Skip unknown id: ${id}`);
      continue;
    }
    try {
      const result = await fetchOfficialLeaderProfile(id);
      const profile = {
        ...result.profile,
        leader_profile_fetched_at: fetchedAt,
        leader_profile_live: true,
      };
      result.verified.leader_profile_fetched_at = result.profile.leader_profile_source_url || id;
      const patch = buildNonEmptyMergePatch(profile);
      patches.push({ id, patch, report: result.report });
      results.push(result);
      console.log(
        `[leader-profile-pilot] ${id}: ${Object.keys(patch).length} non-empty field(s) ready to merge`,
      );
    } catch (err) {
      console.error(`[leader-profile-pilot] ${id} FAILED:`, err.message || err);
      process.exitCode = 1;
    }
  }

  printVerificationReport(results);

  if (!write) {
    console.log('[leader-profile-pilot] Dry-run complete — no Firestore writes.');
    return;
  }

  if (process.exitCode) {
    console.error('[leader-profile-pilot] Aborting write due to fetch errors.');
    return;
  }

  assertFirebaseCredentialsForWrite();
  const db = tryGetFirestore();
  if (!db) {
    console.error(formatPlaceholderCredentialMessage());
    process.exit(1);
  }

  let batch = db.batch();
  let ops = 0;
  let written = 0;

  for (const { id, patch } of patches) {
    if (!Object.keys(patch).length) continue;
    batch.set(db.collection(COLLECTION).doc(id), patch, { merge: true });
    ops += 1;
    written += 1;
    if (ops >= 450) {
      await batch.commit();
      batch = db.batch();
      ops = 0;
    }
  }
  if (ops > 0) await batch.commit();

  console.log(
    `\n[leader-profile-pilot] Wrote merge patches to ${written} document(s) in \`${COLLECTION}\` (merge-only, no deletes).`,
  );
}

main().catch((err) => {
  console.error('[leader-profile-pilot] Fatal:', err);
  process.exit(1);
});
