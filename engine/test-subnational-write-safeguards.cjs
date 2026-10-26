/**
 * Tests for the safeguards on the provincial / territorial write scripts:
 *   - engine/canada-yt-write-charities.cjs
 *   - engine/canada-unemployment-batch-write.cjs
 *   - engine/lib/subnational-write-safeguards.cjs and the opts added to mergeTransparencyDoc
 *
 * Stub databases and injected builders only: zero Firestore, zero network. The two command-line tests
 * run the real scripts with an unsupported argument and assert they stop before connecting to anything.
 *
 *   node engine/test-subnational-write-safeguards.cjs
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const SG = require('./lib/subnational-write-safeguards.cjs');
const SHARED = require('./lib/subnational-transparency-shared.cjs');
const YT = require('./canada-yt-write-charities.cjs');
const BATCH = require('./canada-unemployment-batch-write.cjs');

let passed = 0;
let failed = 0;
const queue = [];
const test = (name, fn) => queue.push({ name, fn });
async function runQueue() {
  for (const { name, fn } of queue) {
    try { await fn(); passed += 1; console.log(`  ok - ${name}`); } catch (err) { failed += 1; console.log(`  FAIL - ${name}\n    ${String(err.stack || err.message).split('\n').slice(0, 4).join('\n    ')}`); }
  }
}
console.log('engine/test-subnational-write-safeguards.cjs (stub databases; zero Firestore, zero network)\n');

// ─── helpers ────────────────────────────────────────────────────────────────
const quiet = (fn) => async (...a) => {
  const log = console.log; const warn = console.warn;
  console.log = () => {}; console.warn = () => {};
  try { return await fn(...a); } finally { console.log = log; console.warn = warn; }
};

/** In-memory Firestore that records every operation and implements merge semantics. `existing`: path -> data. */
function recordingDb(existing = {}) {
  const ops = [];
  const store = { ...Object.fromEntries(Object.entries(existing).map(([k, v]) => [k, JSON.parse(JSON.stringify(v))])) };
  const tripwire = (what) => () => { ops.push([`FORBIDDEN ${what}`]); throw new Error(`${what} is forbidden`); };
  return {
    ops, store,
    collection: (name) => ({
      doc: (id) => {
        const p = `${name}/${id}`;
        return {
          path: p,
          get: async () => { ops.push(['get', p]); return { exists: p in store, data: () => (p in store ? JSON.parse(JSON.stringify(store[p])) : undefined) }; },
          set: async (data, opts) => { ops.push(['set', p, opts]); store[p] = opts && opts.merge ? { ...(store[p] || {}), ...data } : { ...data }; },
          update: tripwire('update'), delete: tripwire('delete'),
        };
      },
      add: tripwire('add'), where: tripwire('where'), get: tripwire('collection get'), listDocuments: tripwire('listDocuments'),
    }),
    batch: tripwire('batch'),
    terminate: async () => { ops.push(['terminate']); },
  };
}
const kinds = (db) => db.ops.map((o) => o[0]);
const okProject = async () => 'civic-voice-5ea94';
const badProject = async () => { throw new Error('Refusing to touch Firestore: expected project "civic-voice-5ea94" but credential is bound to "other".'); };

const taxDoc = (id = 'CA-YT', extra = {}) => ({ jurisdiction_id: id, data_source: 'CRA', source_url: 'https://x', note: 'n', total_in_source: 111, records_stored: 3, records: [{ name: 'A', rawValue: 0 }, { name: 'B', rawValue: 0 }, { name: 'C', rawValue: 0 }], ...extra });
const econDoc = (id, extra = {}) => ({ jurisdiction_id: id, reporting_period: 'Sep 2026', unemployment_latest_rate: 4.6, unemployment_latest_period: 'Sep 2026', unemployment_series_rolling_3_month: [{ period: '2026-08', jurisdiction: 4.4 }, { period: '2026-09', jurisdiction: 4.6 }], unemployment_reporting_period: 'x', ...extra });
const fakeModules = (build) => (modPath) => {
  const code = /ca-([a-z]{2})\.cjs$/.exec(modPath)[1].toUpperCase();
  return { [`STATCAN_${code}_COORD`]: '1.1', SOURCES: { unemployment: 'https://statcan' }, buildEconomic: async () => build(`CA-${code}`) };
};
// the batch writes report files; capture them instead of touching engine/reports
async function withCapturedFs(fn) {
  const w = fs.writeFileSync; const m = fs.mkdirSync; const captured = [];
  fs.writeFileSync = (p, ...rest) => { captured.push(String(p)); };
  fs.mkdirSync = () => {};
  try { return { result: await fn(), captured }; } finally { fs.writeFileSync = w; fs.mkdirSync = m; }
}

// ─── 1. strict arguments ────────────────────────────────────────────────────
test('YT: only --dry-run (or nothing) is accepted; typos, values, repeats, positionals and other scripts\' flags all throw', () => {
  assert.deepStrictEqual(YT.parseArgs([]), { dryRun: false });
  assert.deepStrictEqual(YT.parseArgs(['--dry-run']), { dryRun: true });
  for (const bad of [['--dryrun'], ['--dry-run=true'], ['--dry-run', '--dry-run'], ['--write'], ['CA-YT'], ['--only=CA-YT'], ['-n'], ['--dry-run', '--force'], ['']]) {
    assert.throws(() => YT.parseArgs(bad), /Nothing was run/, JSON.stringify(bad));
  }
});

test('batch: --dry-run and --only=<known ids> are accepted; everything else throws', () => {
  assert.deepStrictEqual(BATCH.parseArgs([]), { dryRun: false, only: null });
  const a = BATCH.parseArgs(['--dry-run', '--only=CA-YT']);
  assert.strictEqual(a.dryRun, true);
  assert.deepStrictEqual([...a.only], ['CA-YT']);
  assert.deepStrictEqual([...BATCH.parseArgs(['--only=ca-nt, CA-NU']).only], ['CA-NT', 'CA-NU']);
  for (const bad of [['--dryrun'], ['--only'], ['--only='], ['--only=CA-XX'], ['--only=CA-ON'], ['--only=CA-YT,,CA-NT'], ['--only=CA-YT', '--only=CA-NT'], ['--dry-run', '--dry-run'], ['--write'], ['CA-YT'], ['--only=CA-YT,CA-BC']]) {
    assert.throws(() => BATCH.parseArgs(bad), /Nothing was run/, JSON.stringify(bad));
  }
});

/**
 * HERMETIC child-process runs. These tests start the REAL scripts, so every child is launched with a preload
 * that (a) replaces firebase-admin with a stub whose every call throws and (b) blocks all network, fetch and
 * child processes. Even if a safeguard were broken (or mutated away), the script cannot reach Firestore or any
 * other live service: it fails inside the stub instead. (The scripts' dotenv loading would otherwise re-load the
 * real service-account credentials from the sibling .env and a "rejected" argument could become a real write.)
 */
function hermeticPreload() {
  const dir = fs.mkdtempSync(path.join(require('os').tmpdir(), 'cv-hermetic-'));
  const file = path.join(dir, 'block-live-access.cjs');
  fs.writeFileSync(file, `
    'use strict';
    const Module = require('module');
    const orig = Module._load;
    const blocked = (what) => { throw new Error('LIVE-ACCESS-BLOCKED: ' + what); };
    Module._load = function (request, ...rest) {
      if (request === 'firebase-admin') return new Proxy({}, { get: (_t, k) => (k === 'apps' ? [] : (typeof k === 'string' ? new Proxy(function () { blocked('firebase-admin.' + k); }, { get: () => () => blocked('firebase-admin.' + k) }) : undefined)) });
      if (/^@google-cloud\\//.test(request) || /^firebase-admin\\//.test(request) || /^firebase\\//.test(request)) blocked(request);
      return orig.call(this, request, ...rest);
    };
    require('net').Socket.prototype.connect = function () { blocked('network'); };
    globalThis.fetch = async () => blocked('fetch');
    for (const m of ['http', 'https']) { const x = require(m); x.request = () => blocked(m); x.get = () => blocked(m); }
    const cp = require('child_process');
    for (const f of ['exec', 'execFile', 'spawn', 'fork', 'execSync', 'execFileSync', 'spawnSync']) cp[f] = () => blocked('child_process.' + f);
  `);
  return { file, dir };
}

test('the real scripts stop on an unsupported argument before connecting to Firebase or fetching anything (hermetic)', () => {
  const { file, dir } = hermeticPreload();
  try {
    for (const [script, args] of [['canada-yt-write-charities.cjs', ['--dryrun']], ['canada-unemployment-batch-write.cjs', ['--only=CA-ZZ', '--dry-run']], ['canada-unemployment-batch-write.cjs', ['--dry-runn']]]) {
      const r = spawnSync(process.execPath, ['--require', file, path.join(__dirname, script), ...args], { encoding: 'utf8', cwd: dir, timeout: 60000 });
      const out = `${r.stdout}\n${r.stderr}`;
      assert.strictEqual(r.status, 1, `${script} ${args.join(' ')}\n${out}`);
      assert.match(out, /Nothing was run/, out);
      assert.ok(!/LIVE-ACCESS-BLOCKED|Firebase connected|writing to Firestore|DRY RUN|fetching/i.test(out), out);
    }
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test('hermetic harness self-check: with a VALID argument the same real script is stopped by the tripwire, never reaching Firestore', () => {
  const { file, dir } = hermeticPreload();
  try {
    const r = spawnSync(process.execPath, ['--require', file, path.join(__dirname, 'canada-yt-write-charities.cjs'), '--dry-run'], { encoding: 'utf8', cwd: dir, timeout: 60000 });
    const out = `${r.stdout}\n${r.stderr}`;
    assert.notStrictEqual(r.status, 0, out);
    assert.ok(!/WRITTEN|Firebase connected/.test(out), out);
    assert.ok(!/Nothing was run/.test(out), 'a valid argument is accepted by the parser');
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

// ─── 2. target validation ───────────────────────────────────────────────────
test('assertTarget: approved collection, a real CA-XX id and a builder that declares the same jurisdiction', () => {
  assert.doesNotThrow(() => SG.assertTarget({ collection: 'subnational_tax_exempt_entities', jurisdictionId: 'CA-YT', doc: taxDoc('CA-YT') }));
  assert.doesNotThrow(() => SG.assertTarget({ collection: 'subnational_economic_social_stats', jurisdictionId: 'CA-NU', doc: econDoc('CA-NU') }));
  assert.throws(() => SG.assertTarget({ collection: 'government_contracts', jurisdictionId: 'CA-YT', doc: taxDoc() }), /not an approved/);
  assert.throws(() => SG.assertTarget({ collection: 'social_stats', jurisdictionId: 'CA-YT', doc: taxDoc() }), /not an approved/);
  for (const id of ['CA-XX', 'ca-yt', 'CA-YT/x', '../CA-YT', 'US-CA', 'CA', '', undefined]) {
    assert.throws(() => SG.assertTarget({ collection: 'subnational_tax_exempt_entities', jurisdictionId: id, doc: taxDoc('CA-YT') }), /valid Canadian|not a valid/, String(id));
  }
  assert.throws(() => SG.assertTarget({ collection: 'subnational_tax_exempt_entities', jurisdictionId: 'CA-YT', doc: taxDoc('CA-NT') }), /declares jurisdiction "CA-NT"/);
  assert.throws(() => SG.assertTarget({ collection: 'subnational_tax_exempt_entities', jurisdictionId: 'CA-YT', doc: { records: [1] } }), /declares jurisdiction/);
  assert.throws(() => SG.assertTarget({ collection: 'subnational_tax_exempt_entities', jurisdictionId: 'CA-YT', doc: null }), /no document/);
});

test('every id the batch can target is a valid approved province/territory id', () => {
  assert.strictEqual(BATCH.JURISDICTIONS.length, 11);
  BATCH.JURISDICTIONS.forEach((j) => assert.match(j.id, SG.JURISDICTION_ID_RE));
  assert.strictEqual(BATCH.COLLECTION, 'subnational_economic_social_stats');
  assert.strictEqual(YT.COLLECTION, 'subnational_tax_exempt_entities');
  assert.strictEqual(YT.JURISDICTION_ID, 'CA-YT');
});

// ─── 3. Yukon charities script ──────────────────────────────────────────────
test('YT dry run: project verified, then exactly ONE get of the target and ZERO writes (tripwire db)', quiet(async () => {
  const db = recordingDb();
  const r = await YT.writeYtCharities(db, { dryRun: true, build: async () => taxDoc(), verifyProject: okProject });
  assert.strictEqual(r.status, 'DRY_RUN');
  assert.deepStrictEqual(db.ops, [['get', 'subnational_tax_exempt_entities/CA-YT']]);
  assert.strictEqual(r.firebase_project, 'civic-voice-5ea94');
  assert.strictEqual(r.existing_document.existed, false);
  assert.strictEqual(r.records_written, 0);
  assert.strictEqual(r.records_that_would_be_written, 3);
  assert.deepStrictEqual(db.store, {}, 'nothing stored');
}));

test('YT dry run reports how an EXISTING document would be merged (preserved vs replaced vs new fields)', quiet(async () => {
  const db = recordingDb({ 'subnational_tax_exempt_entities/CA-YT': { jurisdiction_id: 'CA-YT', records: [{ name: 'old' }], editor_note: 'keep me' } });
  const r = await YT.writeYtCharities(db, { dryRun: true, build: async () => taxDoc(), verifyProject: okProject });
  assert.strictEqual(r.existing_document.existed, true);
  assert.deepStrictEqual(r.existing_document.keysThatWouldBePreserved, ['editor_note']);
  assert.ok(r.existing_document.keysThatWouldBeReplaced.includes('records'));
  assert.ok(r.existing_document.newKeys.includes('verification_status'));
  assert.deepStrictEqual(kinds(db), ['get']);
  assert.strictEqual(db.store['subnational_tax_exempt_entities/CA-YT'].records.length, 1, 'untouched');
}));

test('YT dry run without credentials (db null) fetches and validates but reads nothing', quiet(async () => {
  const r = await YT.writeYtCharities(null, { dryRun: true, build: async () => taxDoc(), verifyProject: badProject });
  assert.strictEqual(r.status, 'DRY_RUN');
  assert.match(r.existing_document, /not checked/);
}));

test('YT real run: one get, then ONE set with { merge: true } on the one document; unrelated fields survive', quiet(async () => {
  const p = 'subnational_tax_exempt_entities/CA-YT';
  const db = recordingDb({ [p]: { jurisdiction_id: 'CA-YT', editor_note: 'keep me' } });
  const r = await YT.writeYtCharities(db, { build: async () => taxDoc(), verifyProject: okProject });
  assert.strictEqual(r.status, 'WRITTEN');
  assert.deepStrictEqual(db.ops, [['get', p], ['set', p, { merge: true }]]);
  assert.strictEqual(db.store[p].editor_note, 'keep me');
  assert.strictEqual(db.store[p].records.length, 3);
  assert.strictEqual(db.store[p].jurisdiction_id, 'CA-YT');
  assert.strictEqual(db.store[p].cv_data_id, 'CV-DATA-YT-002');
}));

test('YT: a wrong project aborts before the fetch, any read and any write', quiet(async () => {
  const db = recordingDb();
  let built = 0;
  for (const dryRun of [true, false]) {
    const r = await YT.writeYtCharities(db, { dryRun, build: async () => { built += 1; return taxDoc(); }, verifyProject: badProject });
    assert.strictEqual(r.status, 'FAILED');
    assert.match(r.error, /expected project "civic-voice-5ea94"/);
  }
  assert.strictEqual(built, 0);
  assert.deepStrictEqual(db.ops, []);
}));

test('YT: an existing document that belongs to ANOTHER jurisdiction (or country) is never written', quiet(async () => {
  const p = 'subnational_tax_exempt_entities/CA-YT';
  for (const stray of [{ jurisdiction_id: 'CA-NT' }, { jurisdiction_id: 'US-CA' }, { country: 'US' }]) {
    const db = recordingDb({ [p]: stray });
    for (const dryRun of [true, false]) {
      const r = await YT.writeYtCharities(db, { dryRun, build: async () => taxDoc(), verifyProject: okProject });
      assert.strictEqual(r.status, 'FAILED', JSON.stringify(stray));
      assert.match(r.error, /unrelated record/);
    }
    assert.ok(!kinds(db).includes('set'));
    assert.deepStrictEqual(db.store[p], stray);
  }
}));

test('YT: a builder that declares a different jurisdiction fails before the document is even read', quiet(async () => {
  const db = recordingDb();
  const r = await YT.writeYtCharities(db, { build: async () => taxDoc('CA-NT'), verifyProject: okProject });
  assert.strictEqual(r.status, 'FAILED');
  assert.match(r.error, /declares jurisdiction "CA-NT"/);
  assert.deepStrictEqual(db.ops, []);
}));

test('YT: empty records are refused and dollar values are still zeroed (existing behaviour kept)', quiet(async () => {
  const db = recordingDb();
  const empty = await YT.writeYtCharities(db, { build: async () => taxDoc('CA-YT', { records: [] }), verifyProject: okProject });
  assert.strictEqual(empty.status, 'FAILED');
  const priced = await YT.writeYtCharities(db, { build: async () => taxDoc('CA-YT', { records: [{ name: 'A', rawValue: 50 }] }), verifyProject: okProject });
  assert.strictEqual(priced.status, 'WRITTEN');
  assert.strictEqual(db.store['subnational_tax_exempt_entities/CA-YT'].records[0].rawValue, 0);
}));

// ─── 4. unemployment batch script ───────────────────────────────────────────
const only = (...ids) => new Set(ids);

test('batch dry run --only=CA-YT: project verified, ONE get, ZERO writes, no report files, other modules never loaded', quiet(async () => {
  const db = recordingDb();
  const loaded = [];
  const loadModule = (p) => { loaded.push(p); return fakeModules((id) => econDoc(id))(p); };
  const { result, captured } = await withCapturedFs(() => BATCH.runBatch(only('CA-YT'), { dryRun: true, getDb: () => db, verifyProject: okProject, loadModule }));
  assert.strictEqual(result.run_type, 'DRY_RUN');
  assert.strictEqual(result.summary.dry_run_ok, 1);
  assert.strictEqual(result.datasets[0].status, 'DRY_RUN');
  assert.strictEqual(result.datasets[0].firestore_path, 'subnational_economic_social_stats/CA-YT');
  assert.deepStrictEqual(db.ops, [['get', 'subnational_economic_social_stats/CA-YT'], ['terminate']]);
  assert.deepStrictEqual(captured, [], 'a dry run writes no report files');
  assert.deepStrictEqual(loaded, ['./lib/subnational-transparency-ca-yt.cjs']);
  assert.deepStrictEqual(db.store, {});
}));

test('batch real run for two jurisdictions: a get and a { merge: true } set for EACH, nothing else', quiet(async () => {
  const db = recordingDb();
  const { result, captured } = await withCapturedFs(() => BATCH.runBatch(only('CA-NT', 'CA-NU'), { getDb: () => db, verifyProject: okProject, loadModule: fakeModules((id) => econDoc(id)) }));
  assert.strictEqual(result.summary.written, 2);
  assert.deepStrictEqual(db.ops, [
    ['get', 'subnational_economic_social_stats/CA-NT'], ['set', 'subnational_economic_social_stats/CA-NT', { merge: true }],
    ['get', 'subnational_economic_social_stats/CA-NU'], ['set', 'subnational_economic_social_stats/CA-NU', { merge: true }],
    ['terminate'],
  ]);
  assert.ok(captured.some((p) => /canada-unemployment-batch-write-latest\.json$/.test(p)), 'the existing write report is still produced');
}));

test('batch: a wrong project aborts before any read or write, in a real run AND a dry run', quiet(async () => {
  for (const dryRun of [true, false]) {
    const db = recordingDb();
    await assert.rejects(() => withCapturedFs(() => BATCH.runBatch(only('CA-YT'), { dryRun, getDb: () => db, verifyProject: badProject, loadModule: fakeModules((id) => econDoc(id)) })), /expected project "civic-voice-5ea94"/);
    assert.deepStrictEqual(db.ops, []);
  }
}));

test('batch: a builder that declares the wrong jurisdiction fails ONLY that jurisdiction, before any read; the others still run', quiet(async () => {
  const db = recordingDb();
  const build = (id) => econDoc(id === 'CA-NT' ? 'CA-AB' : id);
  const { result } = await withCapturedFs(() => BATCH.runBatch(only('CA-NT', 'CA-NU'), { getDb: () => db, verifyProject: okProject, loadModule: fakeModules(build) }));
  const byId = Object.fromEntries(result.datasets.map((d) => [d.jurisdiction_id, d]));
  assert.strictEqual(byId['CA-NT'].status, 'FAILED');
  assert.match(byId['CA-NT'].error, /declares jurisdiction "CA-AB"/);
  assert.strictEqual(byId['CA-NU'].status, 'WRITTEN');
  assert.ok(!db.ops.some((o) => /CA-NT/.test(String(o[1]))), 'the mismatching jurisdiction was never read or written');
}));

test('batch: an existing document that belongs to another jurisdiction is not written; other jurisdictions are unaffected', quiet(async () => {
  const stray = { jurisdiction_id: 'CA-QC', unemployment_latest_rate: 1 };
  const db = recordingDb({ 'subnational_economic_social_stats/CA-NT': stray });
  const { result } = await withCapturedFs(() => BATCH.runBatch(only('CA-NT', 'CA-NU'), { getDb: () => db, verifyProject: okProject, loadModule: fakeModules((id) => econDoc(id)) }));
  const byId = Object.fromEntries(result.datasets.map((d) => [d.jurisdiction_id, d.status]));
  assert.deepStrictEqual(byId, { 'CA-NT': 'FAILED', 'CA-NU': 'WRITTEN' });
  assert.deepStrictEqual(db.store['subnational_economic_social_stats/CA-NT'], stray);
  assert.strictEqual(db.ops.filter((o) => o[0] === 'set').length, 1);
}));

test('batch: existing fields on the target document (e.g. a budget breakdown) are preserved by the merge', quiet(async () => {
  const p = 'subnational_economic_social_stats/CA-YT';
  const db = recordingDb({ [p]: { jurisdiction_id: 'CA-YT', budget_distribution: [{ x: 1 }] } });
  await withCapturedFs(() => BATCH.runBatch(only('CA-YT'), { getDb: () => db, verifyProject: okProject, loadModule: fakeModules((id) => econDoc(id)) }));
  assert.deepStrictEqual(db.store[p].budget_distribution, [{ x: 1 }]);
  assert.strictEqual(db.store[p].unemployment_latest_rate, 4.6);
}));

test('batch: nothing but the approved collection is ever touched, and no delete/update/add/query exists', quiet(async () => {
  const db = recordingDb();
  await withCapturedFs(() => BATCH.runBatch(null, { getDb: () => db, verifyProject: okProject, loadModule: fakeModules((id) => econDoc(id)) }));
  const paths = db.ops.filter((o) => o[0] === 'get' || o[0] === 'set').map((o) => o[1]);
  assert.strictEqual(paths.length, 22); // 11 jurisdictions x (get + set)
  paths.forEach((p) => assert.match(p, /^subnational_economic_social_stats\/CA-(AB|QC|SK|MB|NS|NB|NL|PE|YT|NT|NU)$/));
  assert.ok(!kinds(db).some((k) => /FORBIDDEN/.test(k)));
}));

// ─── 5. the shared helper ───────────────────────────────────────────────────
test('mergeTransparencyDoc without opts behaves exactly as before: get, then set with { merge: true }', async () => {
  const db = recordingDb();
  const wr = await SHARED.mergeTransparencyDoc(db, 'subnational_tax_exempt_entities', 'CA-YT', taxDoc(), 'tax');
  assert.strictEqual(wr.written, true);
  assert.deepStrictEqual(db.ops, [['get', 'subnational_tax_exempt_entities/CA-YT'], ['set', 'subnational_tax_exempt_entities/CA-YT', { merge: true }]]);
});

test('static: neither script (nor the safeguards lib) can delete, update, add, query, batch or replace without merge', () => {
  const libSrc = fs.readFileSync(path.join(__dirname, 'lib/subnational-write-safeguards.cjs'), 'utf8').split('\n').filter((l) => !/^\s*(\*|\/\/|\/\*)/.test(l)).join('\n');
  assert.ok(!/\.collection\(|\.doc\(|firebase-admin|\.get\(\)|\.set\(/.test(libSrc), 'the safeguards lib has no database access at all');
  for (const f of ['canada-yt-write-charities.cjs', 'canada-unemployment-batch-write.cjs']) {
    const src = fs.readFileSync(path.join(__dirname, f), 'utf8');
    const code = src.split('\n').filter((l) => !/^\s*(\*|\/\/|\/\*)/.test(l)).join('\n');
    assert.ok(!/\.delete\(|\.update\(|\.add\(|\.where\(|\.listDocuments\(|\.batch\(|runTransaction|collectionGroup|recursiveDelete|\.set\(/.test(code), `${f} must only write through mergeTransparencyDoc`);
    assert.ok(!/\.collection\([^)]*\)\.get\(/.test(code), `${f} must never scan a collection`);
  }
  const shared = fs.readFileSync(path.join(__dirname, 'lib/subnational-transparency-shared.cjs'), 'utf8');
  const sets = shared.split('\n').filter((l) => /\bref\.set\(/.test(l)); // Firestore document writes (Map/URLSearchParams .set are unrelated)
  assert.ok(sets.length === 1 && /\{ merge: true \}/.test(sets[0]), `the only Firestore write in the shared helper is merge-only: ${sets.join(' | ')}`);
  assert.ok(!/\.delete\(|\.update\(|batch\(\)/.test(shared.replace(/byYear\.[a-z]+\(/g, '')), 'the shared helper has no delete/update/batch');
});

test('static: both scripts verify the Firebase project before the first read or write, and only execute when run directly', () => {
  const yt = fs.readFileSync(path.join(__dirname, 'canada-yt-write-charities.cjs'), 'utf8');
  assert.ok(yt.indexOf('await verifyProject()') > 0 && yt.indexOf('await verifyProject()') < yt.indexOf('await build()'));
  assert.ok(/require\.main === module/.test(yt));
  const b = fs.readFileSync(path.join(__dirname, 'canada-unemployment-batch-write.cjs'), 'utf8');
  assert.ok(b.indexOf('await verifyProject()') > 0 && b.indexOf('await verifyProject()') < b.indexOf('await runOne(db, entry'));
  assert.ok(/require\.main === module/.test(b));
});

runQueue().then(() => {
  console.log(`\n${passed} passed, ${failed} failed (zero Firestore, zero network)`);
  if (failed > 0) process.exitCode = 1;
});
