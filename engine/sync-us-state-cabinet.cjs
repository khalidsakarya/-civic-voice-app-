/**
 * Sync official US state governor cabinet rosters → Firestore `subnational_jurisdictions/{US-XX}.cabinet`
 *
 * Merge-only. Skips empty cabinet arrays (no empty overwrites).
 *
 * Usage:
 *   node engine/sync-us-state-cabinet.cjs --only=US-TX,US-FL,US-NY,US-IL,US-PA
 *   node engine/sync-us-state-cabinet.cjs --write --only=US-TX,US-FL,US-NY,US-IL,US-PA
 */

const fs = require('fs');
const path = require('path');
const {
  tryGetFirestore,
  describeCredentialSource,
  formatPlaceholderCredentialMessage,
  assertFirebaseCredentialsForWrite,
  tryLoadDotenv,
} = require('./firebase-admin-init.cjs');
const { buildTransparencyMergePatch } = require('./lib/subnational-leader-transparency-shared.cjs');
const { BATCH2_IDS, PHASE1_IDS, getStateConfig } = require('./lib/us-state-leader-transparency-config.cjs');
const { fetchCabinetForState } = require('./lib/us-state-cabinet-fetch.cjs');

const COLLECTION = 'subnational_jurisdictions';
const REPORT_PATH = path.join(__dirname, 'reports', 'us-state-cabinet-latest.json');

function parseArgs(argv) {
  const write = argv.includes('--write');
  const onlyArg = argv.find((a) => a.startsWith('--only='));
  const only = onlyArg
    ? onlyArg
        .slice('--only='.length)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : [...BATCH2_IDS];
  return { write, only };
}

async function main() {
  tryLoadDotenv();
  const { write, only } = parseArgs(process.argv.slice(2));
  const fetchedAt = new Date().toISOString();

  console.log('[us-cabinet] US state governor cabinet sync');
  console.log(`[us-cabinet] Mode: ${write ? 'WRITE (merge)' : 'DRY-RUN'}`);
  console.log(`[us-cabinet] Jurisdictions: ${only.join(', ')}`);
  console.log(`[us-cabinet] Credential: ${describeCredentialSource()}\n`);

  /** @type {object[]} */
  const reports = [];

  for (const id of only) {
    try {
      const result = await fetchCabinetForState(id);
      const patch = buildTransparencyMergePatch({
        cabinet_fetched_at: fetchedAt,
        cabinet_status: result.status,
        cabinet_source_url: result.source_url || '',
      });
      if (result.members?.length) {
        patch.cabinet = result.members;
      }
      if (result.note) patch.cabinet_note = result.note;

      console.log(
        `[us-cabinet] ${id}: ${result.status} — ${result.member_count || result.members?.length || 0} member(s) from ${result.source_url || '(none)'}`,
      );
      reports.push({ jurisdictionId: id, result, patch });
    } catch (err) {
      console.error(`[us-cabinet] ${id} FAILED:`, err.message || err);
      reports.push({ jurisdictionId: id, error: err.message || String(err) });
      process.exitCode = 1;
    }
  }

  const summary = {
    generatedAt: fetchedAt,
    mode: write ? 'write' : 'dry-run',
    jurisdictions: reports.map((r) => ({
      id: r.jurisdictionId,
      error: r.error || null,
      status: r.result?.status || null,
      member_count: r.result?.member_count ?? r.result?.members?.length ?? 0,
      source_url: r.result?.source_url || null,
      note: r.result?.note || null,
      members: r.result?.members || [],
    })),
  };

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
  console.log(`\nReport: ${REPORT_PATH}`);

  if (!write) {
    console.log('\n[us-cabinet] Dry-run complete — no Firestore writes.');
    return;
  }

  if (process.exitCode) {
    console.error('[us-cabinet] Aborting write due to fetch errors.');
    return;
  }

  assertFirebaseCredentialsForWrite();
  const db = tryGetFirestore();
  if (!db) {
    console.error(formatPlaceholderCredentialMessage());
    process.exit(1);
  }

  let written = 0;
  for (const r of reports) {
    if (!r.patch || !Object.keys(r.patch).length) continue;
    await db.collection(COLLECTION).doc(r.jurisdictionId).set(r.patch, { merge: true });
    written += 1;
  }

  console.log(
    `\n[us-cabinet] Wrote merge patches to ${written} document(s) in \`${COLLECTION}\` (merge-only, no deletes).`,
  );
}

main().catch((err) => {
  console.error('[us-cabinet] Fatal:', err);
  process.exit(1);
});
