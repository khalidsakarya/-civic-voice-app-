/**
 * Sync official subnational leader profiles → Firestore `subnational_jurisdictions`.
 *
 * Official government / parliament pages only. Merge-only writes; no deletes; no empty overwrites.
 *
 * Usage:
 *   node engine/sync-subnational-leader-profiles.cjs
 *   node engine/sync-subnational-leader-profiles.cjs --write
 *   node engine/sync-subnational-leader-profiles.cjs --only=US-TX,CA-BC
 *   node engine/sync-subnational-leader-profiles.cjs --concurrency=4
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
const { buildNonEmptyMergePatch } = require('./lib/subnational-leader-profile-shared.cjs');
const {
  buildLeaderProfileRegistry,
  listSyncableIds,
  listUnresolvedNoPortal,
} = require('./lib/subnational-leader-profile-registry.cjs');
const { fetchLeaderProfileForRegistryEntry } = require('./lib/subnational-leader-profile-fetch.cjs');

const COLLECTION = 'subnational_jurisdictions';
const REPORT_PATH = path.join(__dirname, 'reports', 'subnational-leader-profiles-latest.json');

function parseArgs(argv) {
  const write = argv.includes('--write');
  const onlyArg = argv.find((a) => a.startsWith('--only='));
  const only = onlyArg
    ? onlyArg
        .slice('--only='.length)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : null;
  const concArg = argv.find((a) => a.startsWith('--concurrency='));
  const concurrency = concArg ? Math.max(1, Math.min(8, Number(concArg.slice('--concurrency='.length)) || 3)) : 3;
  return { write, only, concurrency };
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function mapPool(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next;
      next += 1;
      results[i] = await fn(items[i], i);
      await sleep(200);
    }
  }
  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

function printVerificationReport(updated) {
  console.log('\n=== Official field verification (sample) ===\n');
  for (const r of updated.slice(0, 8)) {
    console.log(`--- ${r.jurisdictionId} ---`);
    for (const row of r.report.rows) {
      const mark = row.verified ? '✓' : '—';
      const src = row.source ? ` (${row.source})` : '';
      console.log(`  ${mark} ${row.field}${src}`);
    }
    console.log('');
  }
  if (updated.length > 8) {
    console.log(`… and ${updated.length - 8} more updated jurisdictions (see ${REPORT_PATH})\n`);
  }
}

async function main() {
  tryLoadDotenv();
  const { write, only, concurrency } = parseArgs(process.argv.slice(2));
  const fetchedAt = new Date().toISOString();
  const registry = buildLeaderProfileRegistry(fetchedAt);
  const syncable = registry.filter((r) => r.officialWebsite && r.fetchUrls.length);
  const noPortal = listUnresolvedNoPortal(registry);

  let targets = syncable;
  if (only && only.length) {
    const set = new Set(only);
    targets = syncable.filter((r) => set.has(r.id));
  }

  console.log('[leader-profile] Civic Voice — official subnational leader profiles (full scale)');
  console.log(`[leader-profile] Mode: ${write ? 'WRITE (merge)' : 'DRY-RUN'}`);
  console.log(`[leader-profile] Targets: ${targets.length} / ${syncable.length} syncable (${registry.length} in registry)`);
  console.log(`[leader-profile] Excluded (no regional portal): ${noPortal.length}`);
  console.log(`[leader-profile] Concurrency: ${concurrency}`);
  console.log(`[leader-profile] Credential: ${describeCredentialSource()}\n`);

  /** @type {{ id: string, patch: Record<string, unknown>, report: object }[]} */
  const patches = [];
  /** @type {object[]} */
  const updated = [];
  /** @type {{ id: string, reason: string }[]} */
  const unresolved = [...noPortal];

  const results = await mapPool(targets, concurrency, async (entry) => {
    try {
      const result = await fetchLeaderProfileForRegistryEntry(entry);
      const profile = {
        ...result.profile,
        leader_profile_fetched_at: fetchedAt,
        leader_profile_live: true,
      };
      result.verified.leader_profile_fetched_at =
        result.profile.leader_profile_source_url || entry.officialWebsite || entry.id;
      const patch = buildNonEmptyMergePatch(profile);
      console.log(
        `[leader-profile] ${entry.id}: OK — ${Object.keys(patch).length} field(s) (${result.profile.leader_name || '?'})`,
      );
      return { ok: true, id: entry.id, patch, report: result.report, profile: result.profile };
    } catch (err) {
      const reason = err.message || String(err);
      console.warn(`[leader-profile] ${entry.id}: UNRESOLVED — ${reason}`);
      return { ok: false, id: entry.id, reason };
    }
  });

  for (const r of results) {
    if (r.ok) {
      patches.push({ id: r.id, patch: r.patch, report: r.report });
      updated.push({ jurisdictionId: r.id, report: r.report, fields: Object.keys(r.patch) });
    } else {
      unresolved.push({ id: r.id, reason: r.reason });
    }
  }

  printVerificationReport(updated);

  const report = {
    generatedAt: fetchedAt,
    mode: write ? 'write' : 'dry-run',
    summary: {
      registryTotal: registry.length,
      syncable: syncable.length,
      attempted: targets.length,
      updated: updated.length,
      unresolved: unresolved.length,
    },
    updated: updated.map((u) => ({
      id: u.jurisdictionId,
      fields: u.fields,
    })),
    unresolved,
  };

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  console.log('\n=== Summary ===');
  console.log(`Updated: ${updated.length}`);
  console.log(`Unresolved: ${unresolved.length}`);
  console.log(`Report: ${REPORT_PATH}`);
  if (unresolved.length) {
    console.log('\nUnresolved jurisdictions:');
    for (const u of unresolved) {
      console.log(`  - ${u.id}: ${u.reason}`);
    }
  }

  if (!write) {
    console.log('\n[leader-profile] Dry-run complete — no Firestore writes.');
    return;
  }

  if (!patches.length) {
    console.warn('[leader-profile] Nothing to write.');
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
    `\n[leader-profile] Wrote merge patches to ${written} document(s) in \`${COLLECTION}\` (merge-only, no deletes).`,
  );
}

main().catch((err) => {
  console.error('[leader-profile] Fatal:', err);
  process.exit(1);
});
