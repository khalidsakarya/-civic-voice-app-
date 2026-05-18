/**
 * Sync official leader transparency data → Firestore `subnational_leader_transparency`.
 *
 * Pilot: CA-ON, US-CA, AU-NSW, UK-ENG-LON (official government / disclosure sources only).
 *
 * Usage:
 *   node engine/sync-subnational-leader-transparency.cjs
 *   node engine/sync-subnational-leader-transparency.cjs --write
 *   node engine/sync-subnational-leader-transparency.cjs --write --only=US-CA,CA-ON
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
const {
  PILOT_IDS,
  SECTION_KEYS,
  buildTransparencyMergePatch,
} = require('./lib/subnational-leader-transparency-shared.cjs');
const usCa = require('./lib/subnational-leader-transparency-us-ca.cjs');
const caOn = require('./lib/subnational-leader-transparency-ca-on.cjs');
const auNsw = require('./lib/subnational-leader-transparency-au-nsw.cjs');
const ukLon = require('./lib/subnational-leader-transparency-uk-lon.cjs');

const COLLECTION = 'subnational_leader_transparency';
const REPORT_PATH = path.join(__dirname, 'reports', 'subnational-leader-transparency-latest.json');

const MODULES = {
  'US-CA': usCa,
  'CA-ON': caOn,
  'AU-NSW': auNsw,
  'UK-ENG-LON': ukLon,
};

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

function sectionReport(payload) {
  const rows = [];
  for (const key of SECTION_KEYS) {
    const val = payload[key];
    let count = 0;
    if (Array.isArray(val)) count = val.length;
    else if (val && typeof val === 'object') count = Object.keys(val).length;
    else if (val) count = 1;
    rows.push({
      section: key,
      loaded: count > 0,
      count,
      source: payload.field_sources && payload.field_sources[key] ? payload.field_sources[key] : null,
    });
  }
  return rows;
}

async function main() {
  tryLoadDotenv();
  const { write, only } = parseArgs(process.argv.slice(2));
  const fetchedAt = new Date().toISOString();

  console.log('[leader-transparency] Official leader transparency sync (pilot)');
  console.log(`[leader-transparency] Mode: ${write ? 'WRITE (merge)' : 'DRY-RUN'}`);
  console.log(`[leader-transparency] Jurisdictions: ${only.join(', ')}`);
  console.log(`[leader-transparency] Credential: ${describeCredentialSource()}\n`);

  /** @type {object[]} */
  const reports = [];

  for (const id of only) {
    const mod = MODULES[id];
    if (!mod) {
      console.warn(`[leader-transparency] Skip unknown id: ${id}`);
      continue;
    }
    try {
      const result = await mod.buildLeaderTransparency();
      const patch = buildTransparencyMergePatch({
        ...result.payload,
        transparency_fetched_at: fetchedAt,
      });
      const sections = sectionReport(result.payload);
      const loaded = sections.filter((s) => s.loaded);
      console.log(
        `[leader-transparency] ${id}: ${loaded.length}/${SECTION_KEYS.length} section(s) with data — ${loaded.map((s) => s.section).join(', ') || '(none)'}`,
      );
      reports.push({
        jurisdictionId: id,
        patch,
        sections,
        field_sources: result.payload.field_sources || {},
        transparency_live: result.payload.transparency_live === true,
      });
    } catch (err) {
      console.error(`[leader-transparency] ${id} FAILED:`, err.message || err);
      reports.push({
        jurisdictionId: id,
        error: err.message || String(err),
        sections: SECTION_KEYS.map((section) => ({ section, loaded: false, count: 0, source: null })),
      });
      process.exitCode = 1;
    }
  }

  const summary = {
    generatedAt: fetchedAt,
    mode: write ? 'write' : 'dry-run',
    jurisdictions: reports.map((r) => ({
      id: r.jurisdictionId,
      transparency_live: r.transparency_live === true,
      error: r.error || null,
      sections: r.sections,
      field_sources: r.field_sources || {},
    })),
  };

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');

  console.log('\n=== Section coverage ===\n');
  for (const r of reports) {
    console.log(`--- ${r.jurisdictionId} ---`);
    for (const row of r.sections) {
      const mark = row.loaded ? '✓' : '—';
      const src = row.source ? ` (${row.source})` : '';
      const extra = row.count > 1 ? ` [${row.count} records]` : row.count === 1 ? '' : '';
      console.log(`  ${mark} ${row.section}${extra}${src}`);
    }
    console.log('');
  }
  console.log(`Report: ${REPORT_PATH}`);

  if (!write) {
    console.log('\n[leader-transparency] Dry-run complete — no Firestore writes.');
    return;
  }

  if (process.exitCode) {
    console.error('[leader-transparency] Aborting write due to fetch errors.');
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
    `\n[leader-transparency] Wrote merge patches to ${written} document(s) in \`${COLLECTION}\` (merge-only, no deletes).`,
  );
}

main().catch((err) => {
  console.error('[leader-transparency] Fatal:', err);
  process.exit(1);
});
