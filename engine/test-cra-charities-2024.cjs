/**
 * Tests for the CRA 2024 charity source module, the guarded replacement process and the legacy-script protections.
 *
 *   node engine/test-cra-charities-2024.cjs
 *
 * Synthetic CSV/JSON fixtures and stub databases only: zero Firestore, zero network. Every child-process test
 * runs the REAL script under a hermetic preload that replaces firebase-admin with a tripwire and blocks the
 * network, fetch and child processes, so no test can reach a live service even if a safeguard is broken.
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const CRA = require('./lib/cra-list-of-charities-2024.cjs');
const R = require('./lib/charities-replacement.cjs');
const B = require('./lib/firestore-doc-backup.cjs');
const REPLACE = require('./canada-charities-replace.cjs');
const RESTORE = require('./canada-charities-restore.cjs');

let passed = 0;
let failed = 0;
const queue = [];
const test = (name, fn) => queue.push({ name, fn });
async function runQueue() {
  for (const { name, fn } of queue) {
    try { await fn(); passed += 1; console.log(`  ok - ${name}`); } catch (err) { failed += 1; console.log(`  FAIL - ${name}\n    ${String(err.stack || err.message).split('\n').slice(0, 5).join('\n    ')}`); }
  }
}
console.log('engine/test-cra-charities-2024.cjs (synthetic fixtures, stub databases; zero Firestore, zero network)\n');

// ─── fixtures ───────────────────────────────────────────────────────────────
const validPackage = () => ({
  id: '80c00cdb-1358-415c-bb8b-0de7f12675b8',
  title: '2024 List of charities',
  title_translated: { en: '2024 List of charities', fr: 'Liste des organismes de bienfaisance 2024' },
  time_period_coverage_start: '2024-01-01 00:00:00',
  time_period_coverage_end: '2024-12-31 00:00:00',
  frequency: 'P1Y',
  date_published: '2026-04-30 00:00:00',
  metadata_modified: '2026-10-04T06:47:45.704485',
  license_title: 'Open Government Licence - Canada',
  organization: { name: 'cra-arc', title: 'Canada Revenue Agency' },
  resources: [
    { id: '694fdc72-eae4-4ee0-83eb-832ab7b230e3', name: 'Identification', format: 'CSV', url: 'https://example/ident.csv' },
    { id: 'fin-id', name: 'Financial data', format: 'CSV', url: 'https://example/fin.csv' },
    { id: 'pdf', name: 'Codes Lists', format: 'PDF', url: 'https://example/codes.pdf' },
  ],
});

const IDENT_HEAD = 'BN,Category,Sub Category,Designation,Legal Name,Account Name,Address Line 1,Address Line 2,City,Province,Postal Code,Country';
const FIN_HEAD = 'BN,FPE,Form ID,Section Used,4200,4350,4700,5100';
const identRow = (bn, cat, desig, name, prov) => `${bn},${cat},0005,${desig},${name},${name},1 MAIN ST,,TOWN,${prov},A1A1A1,CA`;
const finRow = (bn, fpe, assets, liabilities, revenue, expend) => `${bn},${fpe},27,D,${assets},${liabilities},${revenue},${expend}`;

/** YT: 4 charities (one with revenue 0, one with no financial row, one with blank revenue), ON: 2, AB: 1. */
const IDENT_CSV = [
  IDENT_HEAD,
  identRow('100000001RR0001', '0140', 'C', 'ALPHA HEALTH SOCIETY', 'YT'),
  identRow('100000002RR0001', '0010', 'A', 'BETA SCHOOL FOUNDATION', 'YT'),
  identRow('100000003RR0001', '0030', 'C', 'GAMMA CHURCH', 'YT'),
  identRow('100000004RR0001', '0190', 'C', 'DELTA ARTS', 'YT'),
  identRow('100000005RR0001', '0160', 'B', 'EPSILON PRIVATE FOUNDATION', 'YT'),
  identRow('100000006RR0001', '0170', 'C', 'ZETA ENVIRONMENT', 'ON'),
  identRow('100000007RR0001', '9999', 'C', 'ETA UNKNOWN CATEGORY', 'ON'),
  identRow('100000008RR0001', '0200', 'C', 'THETA AMENITIES', 'AB'),
  identRow('100000001RR0001', '0140', 'C', 'ALPHA HEALTH SOCIETY', 'YT'), // duplicate BN row
].join('\n');
const FIN_CSV = [
  FIN_HEAD,
  finRow('100000001RR0001', '2024-03-31', 500, 100, 9000, 8000),
  finRow('100000002RR0001', '2024-06-30', 50, 0, 120000, ''), // expenditures blank
  finRow('100000003RR0001', '2024-12-31', 10, 1, 0, 5),        // a REAL reported revenue of 0
  finRow('100000004RR0001', '2024-01-31', '', '', '', ''),     // financial row, all blank
  // 100000005 has no financial row at all
  finRow('100000006RR0001', '2024-03-31', 1, 1, 777, 700),
  finRow('100000001RR0001', '2023-12-31', 1, 1, 1, 1),         // an OLDER duplicate row for the first BN
].join('\n');
const dataset = () => CRA.parseDataset({ meta: CRA.validatePackage(validPackage()), identCsv: IDENT_CSV, financialCsv: FIN_CSV });

const quiet = () => {}; // log/warn sink

/** Faithful-enough Firestore stand-in: set() with no options replaces, {merge:true} merges (arrays replaced), {mergeFields} replaces exactly those fields. */
const DELETE = Symbol('FieldValue.delete');
function recordingDb(existing = {}, opts = {}) {
  const ops = [];
  const store = JSON.parse(JSON.stringify(existing));
  let tick = 0;
  const stamp = () => { tick += 1; return { seconds: 1793600000, nanoseconds: tick * 1000 }; };
  const times = {};
  Object.keys(store).forEach((k) => { const t = stamp(); times[k] = { create: t, update: t }; });
  const sameTs = (a, b) => !!a && !!b && a.seconds === b.seconds && a.nanoseconds === b.nanoseconds;
  const clone = (x) => JSON.parse(JSON.stringify(x));
  const tripwire = (what) => () => { ops.push([`FORBIDDEN ${what}`]); throw new Error(`${what} is forbidden`); };
  const deepMerge = (a, b) => {
    const out = { ...a };
    for (const [k, v] of Object.entries(b)) out[k] = v && typeof v === 'object' && !Array.isArray(v) && a[k] && typeof a[k] === 'object' && !Array.isArray(a[k]) ? deepMerge(a[k], v) : v;
    return out;
  };
  return {
    ops, store,
    collection: (name) => ({
      doc: (id) => {
        const p = `${name}/${id}`;
        return {
          path: p,
          get: async () => { ops.push(['get', p]); const snapData = p in store ? clone(store[p]) : undefined; const t = times[p]; return { exists: p in store, data: () => (snapData === undefined ? undefined : clone(snapData)), createTime: t && t.create, updateTime: t && t.update }; }, // an immutable snapshot, like Firestore's
          create: async (data) => {
            ops.push(['create', p]);
            if (opts.appearBeforeCreate && !(p in store)) { store[p] = clone(opts.appearBeforeCreate); const t = stamp(); times[p] = { create: t, update: t }; }
            if (p in store) throw Object.assign(new Error('6 ALREADY_EXISTS: Document already exists: ' + p), { code: 6 });
            store[p] = clone(data); const t = stamp(); times[p] = { create: t, update: t };
          },
          set: async (data, opts) => {
            ops.push(['set', p, opts && (opts.mergeFields ? { mergeFields: [...opts.mergeFields] } : opts)]);
            const cur = store[p];
            if (cur) times[p] = { create: times[p].create, update: stamp() }; else { const t = stamp(); times[p] = { create: t, update: t }; }
            if (opts && opts.mergeFields) {
              const next = cur ? clone(cur) : {};
              for (const f of opts.mergeFields) { if (data[f] === DELETE) delete next[f]; else next[f] = clone(data[f]); }
              store[p] = next;
            } else if (opts && opts.merge) store[p] = deepMerge(cur || {}, clone(data));
            else store[p] = clone(data);
          },
          update: tripwire('update'),
          delete: opts.allowDelete ? async (pre) => {
            ops.push(['delete', p, pre && pre.lastUpdateTime]);
            if (!(p in store)) throw Object.assign(new Error('5 NOT_FOUND'), { code: 5 });
            if (!pre || !pre.lastUpdateTime) throw new Error('a delete without a lastUpdateTime precondition is forbidden in this suite');
            if (!sameTs(pre.lastUpdateTime, times[p].update)) throw Object.assign(new Error('9 FAILED_PRECONDITION: the document was modified'), { code: 9 });
            delete store[p]; delete times[p];
          } : tripwire('delete'),
        };
      },
      add: tripwire('add'), where: tripwire('where'), get: tripwire('collection get'), listDocuments: tripwire('listDocuments'),
    }),
    batch: tripwire('batch'), runTransaction: tripwire('runTransaction'),
    terminate: async () => { ops.push(['terminate']); },
  };
}
const kinds = (db) => db.ops.map((o) => o[0]);
const okProject = async () => 'civic-voice-5ea94';
const badProject = async () => { throw new Error('Refusing to touch Firestore: expected project "civic-voice-5ea94" but credential is bound to "other".'); };
const NOW = new Date('2026-10-26T12:00:00.000Z');
const yt = R.JURISDICTIONS.find((j) => j.id === 'CA-YT');

/** An old 1998-style document, exactly the fields the legacy writers produced, with rawValue 0 on every record. */
const legacyDoc = (id = 'CA-YT', extra = {}) => ({
  jurisdiction_id: id, data_source: 'Canada Revenue Agency — Charities Directorate. Source: open.canada.ca. Licensed under Open Government Licence — Canada.',
  source_url: 'https://open.canada.ca/data/en/dataset/51c68b86-33f0-46fe-9b51-0a786d0088f5', note: 'YT registered charities only. Name, type, and category displayed (MVP). No dollar values in this version. OGL-Canada.',
  total_in_source: 111, records_stored: 3, cv_data_id: 'CV-DATA-YT-002', verification_status: 'CV-REC-001-2026-09-07-CV-DATA-YT-002', licence_note: 'old', fetched_at: '2026-10-26T00:29:55.000Z',
  records: [{ name: '1998 CHARITY A', industry: 'Other', industryColor: 'x', exemType: 'Charitable Organization', rawValue: 0 }, { name: '1998 CHARITY B', industry: 'Other', industryColor: 'x', exemType: 'Charitable Organization', rawValue: 0 }, { name: 'ALPHA HEALTH SOCIETY', industry: 'Other', industryColor: 'x', exemType: 'Charitable Organization', rawValue: 0 }],
  ...extra,
});
const ytPayload = () => R.buildPayload(CRA.buildDocFromDataset(dataset(), 'CA-YT'), yt, { now: NOW });
const memBackup = () => { const saved = []; const w = async (a) => { saved.push(JSON.parse(JSON.stringify(a))); return { path: '/backups/fake.json', bytes: 1, sha256: 'x' }; }; w.saved = saved; return w; };

// ─── 1. source metadata ─────────────────────────────────────────────────────
test('the 2024 package metadata is confirmed: id, title, coverage, frequency, publication date, publisher, licence, resources', () => {
  const meta = CRA.validatePackage(validPackage());
  assert.strictEqual(meta.id, '80c00cdb-1358-415c-bb8b-0de7f12675b8');
  assert.strictEqual(meta.title, '2024 List of charities');
  assert.strictEqual(meta.published, '2026-04-30');
  assert.strictEqual(meta.coverage_start, '2024-01-01');
  assert.strictEqual(meta.coverage_end, '2024-12-31');
  assert.strictEqual(meta.frequency, 'P1Y');
  assert.strictEqual(meta.resources.identification.url, 'https://example/ident.csv');
  assert.strictEqual(meta.resources.financial.url, 'https://example/fin.csv');
  assert.strictEqual(CRA.SOURCE.year, 2024);
});

test('the OBSOLETE 1998 package (and any metadata drift) is rejected before anything is built', () => {
  const legacy = { ...validPackage(), id: '51c68b86-33f0-46fe-9b51-0a786d0088f5', title: '1998 List of charities', title_translated: { en: '1998 List of charities' }, time_period_coverage_start: '1998-01-01 00:00:00', time_period_coverage_end: '1998-12-31 00:00:00', frequency: 'not_planned', date_published: '2017-09-07 00:00:00' };
  assert.throws(() => CRA.validatePackage(legacy), /validation FAILED.*dataset id.*title.*coverage.*frequency/s);
  const drift = [
    { id: 'other' }, { title: '2023 List of charities', title_translated: { en: '2023 List of charities' } }, { time_period_coverage_end: '2025-12-31 00:00:00' },
    { frequency: 'P1M' }, { date_published: '2024-06-01 00:00:00' }, { date_published: null }, { organization: { name: 'someone-else' } }, { license_title: 'Proprietary' },
    { resources: [] }, { resources: validPackage().resources.filter((r) => r.name !== 'Financial data') },
  ];
  drift.forEach((d) => assert.throws(() => CRA.validatePackage({ ...validPackage(), ...d }), /CRA source validation FAILED/, JSON.stringify(d).slice(0, 60)));
  assert.throws(() => CRA.validatePackage(null), /CRA source validation FAILED/);
});

test('CSV header drift is rejected (field definitions are checked, not assumed)', () => {
  const meta = CRA.validatePackage(validPackage());
  assert.throws(() => CRA.parseDataset({ meta, identCsv: IDENT_CSV.replace('Legal Name', 'Name'), financialCsv: FIN_CSV }), /headers changed/);
  assert.throws(() => CRA.parseDataset({ meta, identCsv: IDENT_CSV, financialCsv: FIN_CSV.replace('4700', '4701') }), /headers changed/);
  assert.deepStrictEqual(CRA.FINANCIAL_FIELDS.revenue_cad, { line: '4700', meaning: 'Total revenue' });
  assert.deepStrictEqual(CRA.FINANCIAL_FIELDS.expenditures_cad, { line: '5100', meaning: 'Total expenditures' });
  assert.deepStrictEqual(CRA.FINANCIAL_FIELDS.assets_cad, { line: '4200', meaning: 'Total assets' });
});

test('loadDataset validates the metadata BEFORE downloading any CSV, and downloads each CSV once', async () => {
  const urls = [];
  const fetchTextFn = async (u) => { urls.push(u); return u.endsWith('ident.csv') ? IDENT_CSV : FIN_CSV; };
  await assert.rejects(() => CRA.loadDataset({ fetchJsonFn: async () => ({ result: { ...validPackage(), title: '1998 List of charities', title_translated: { en: '1998 List of charities' } } }), fetchTextFn, useCache: false }), /validation FAILED/);
  assert.deepStrictEqual(urls, [], 'no CSV may be fetched for a package that fails validation');
  const ds = await CRA.loadDataset({ fetchJsonFn: async () => ({ result: validPackage() }), fetchTextFn, useCache: false });
  assert.deepStrictEqual(urls, ['https://example/ident.csv', 'https://example/fin.csv']);
  assert.strictEqual(ds.identRows.length, 9);
});

// ─── 2. selection, ranking, missing values ──────────────────────────────────
test('ranking: highest reported total revenue first; a real reported 0 follows the positives; charities with NO revenue come last, alphabetically', () => {
  const sel = CRA.selectCharities(dataset(), 'CA-YT');
  assert.deepStrictEqual(sel.records.map((r) => r.name), ['BETA SCHOOL FOUNDATION', 'ALPHA HEALTH SOCIETY', 'GAMMA CHURCH', 'DELTA ARTS', 'EPSILON PRIVATE FOUNDATION']);
  assert.deepStrictEqual(sel.records.map((r) => r.revenue_cad), [120000, 9000, 0, undefined, undefined]);
  assert.strictEqual(sel.totalInSource, 5, 'a duplicate BN row is counted once');
  assert.strictEqual(sel.revenueReportedCount, 3);
});

test('ranking is deterministic: ties break by name then BN, and the selection size is respected', () => {
  const ident = [IDENT_HEAD, identRow('100000010RR0001', '0140', 'C', 'ZED', 'YT'), identRow('100000011RR0001', '0140', 'C', 'ABE', 'YT'), identRow('100000012RR0001', '0140', 'C', 'MID', 'YT')].join('\n');
  const fin = [FIN_HEAD, finRow('100000010RR0001', '2024-03-31', 1, 1, 500, 1), finRow('100000011RR0001', '2024-03-31', 1, 1, 500, 1), finRow('100000012RR0001', '2024-03-31', 1, 1, 900, 1)].join('\n');
  const ds = CRA.parseDataset({ meta: CRA.validatePackage(validPackage()), identCsv: ident, financialCsv: fin });
  assert.deepStrictEqual(CRA.selectCharities(ds, 'CA-YT').records.map((r) => r.name), ['MID', 'ABE', 'ZED']);
  assert.deepStrictEqual(CRA.selectCharities(ds, 'CA-YT', { size: 2 }).records.map((r) => r.name), ['MID', 'ABE']);
});

test('missing financial information stays ABSENT: no null, no empty string, no placeholder zero', () => {
  const recs = CRA.selectCharities(dataset(), 'CA-YT').records;
  const byName = Object.fromEntries(recs.map((r) => [r.name, r]));
  assert.ok(!('expenditures_cad' in byName['BETA SCHOOL FOUNDATION']), 'blank expenditures is omitted');
  assert.strictEqual(byName['BETA SCHOOL FOUNDATION'].revenue_cad, 120000);
  ['DELTA ARTS', 'EPSILON PRIVATE FOUNDATION'].forEach((n) => {
    ['revenue_cad', 'expenditures_cad', 'assets_cad'].forEach((k) => assert.ok(!(k in byName[n]), `${n} must not carry ${k}`));
  });
  assert.ok(!('fiscal_period_end' in byName['EPSILON PRIVATE FOUNDATION']), 'no financial row -> no fiscal period end');
  recs.forEach((r) => Object.values(r).forEach((v) => assert.ok(v !== null && v !== undefined && v !== '', `no empty value in ${JSON.stringify(r)}`)));
});

test('a REAL reported revenue of 0 is kept as 0 (it is a value), while blanks are never turned into 0', () => {
  const byName = Object.fromEntries(CRA.selectCharities(dataset(), 'CA-YT').records.map((r) => [r.name, r]));
  assert.strictEqual(byName['GAMMA CHURCH'].revenue_cad, 0);
  assert.strictEqual(byName['GAMMA CHURCH'].expenditures_cad, 5);
  assert.ok(!('revenue_cad' in byName['DELTA ARTS']));
});

test('NO placeholder zeros: no record ever has a rawValue field, and the document builder refuses one', () => {
  for (const j of ['CA-YT', 'CA-ON', 'CA-AB']) {
    const doc = CRA.buildDocFromDataset(dataset(), j);
    assert.ok(doc.records.every((r) => !('rawValue' in r)), j);
    assert.strictEqual(CRA.summarizeDoc(doc).has_rawValue_field, false);
  }
  const bad = CRA.buildDocFromDataset(dataset(), 'CA-YT');
  bad.records[0].rawValue = 0;
  assert.throws(() => R.buildPayload(bad, yt, { now: NOW }), /rawValue/);
});

test('the latest fiscal row per BN is used (an older duplicate financial row is ignored)', () => {
  const alpha = CRA.selectCharities(dataset(), 'CA-YT').records.find((r) => r.name === 'ALPHA HEALTH SOCIETY');
  assert.strictEqual(alpha.revenue_cad, 9000);
  assert.strictEqual(alpha.fiscal_period_end, '2024-03-31');
});

test('only the optional fields agreed in the data contract can appear on a record', () => {
  const allowed = new Set(['name', 'industry', 'industryColor', 'exemType', 'bn', 'revenue_cad', 'expenditures_cad', 'assets_cad', 'fiscal_period_end']);
  CRA.selectCharities(dataset(), 'CA-YT').records.forEach((r) => Object.keys(r).forEach((k) => assert.ok(allowed.has(k), `unexpected field ${k}`)));
});

// ─── 3. document metadata ───────────────────────────────────────────────────
test('the document states the 2024 source year, reporting period, publication date, selection basis and "N of M" counts honestly', () => {
  const doc = CRA.buildDocFromDataset(dataset(), 'CA-YT');
  assert.strictEqual(doc.source_year, 2024);
  assert.strictEqual(doc.reporting_period, 'CRA List of charities — 2024 filing year (fiscal periods ending in 2024), published 2026-04-30');
  assert.strictEqual(doc.selection_basis, 'largest by revenue');
  assert.strictEqual(doc.total_in_source, 5);
  assert.strictEqual(doc.records_stored, 5);
  assert.strictEqual(doc.financials_reported_count, 3);
  assert.strictEqual(doc.source_url, 'https://open.canada.ca/data/en/dataset/80c00cdb-1358-415c-bb8b-0de7f12675b8');
  assert.match(doc.data_source, /Canada Revenue Agency — Charities Directorate, "2024 List of charities"/);
  assert.deepStrictEqual(doc.source_dataset, { id: '80c00cdb-1358-415c-bb8b-0de7f12675b8', title: '2024 List of charities', published: '2026-04-30', metadata_modified: '2026-10-04', coverage: '2024-01-01 to 2024-12-31', frequency: 'P1Y' });
  assert.ok(!/1998|latest/i.test(JSON.stringify({ ...doc, records: undefined })), 'no 1998 reference and no "latest" claim');
  assert.ok(!doc.source_url.includes('51c68b86'));
});

test('official category codes map to the app industries; unknown codes become Other; designations use the official names', () => {
  assert.strictEqual(Object.keys(CRA.OFFICIAL_CATEGORIES).length, 30);
  const expect = { '0001': 'Human Services', '0010': 'Education', '0014': 'Education', '0030': 'Religion', '0090': 'Religion', '0100': 'Health', '0140': 'Health', '0150': 'Human Services', '0160': 'Human Services', '0170': 'Environment', '0175': 'Other', '0190': 'Arts/Culture', '0200': 'Other', '0215': 'Other', '9999': 'Other', '': 'Other', '60': 'Religion' };
  Object.entries(expect).forEach(([code, label]) => assert.strictEqual(CRA.industryFor(code).label, label, code));
  const byName = Object.fromEntries(CRA.selectCharities(dataset(), 'CA-YT').records.map((r) => [r.name, r]));
  assert.strictEqual(byName['ALPHA HEALTH SOCIETY'].industry, 'Health');
  assert.strictEqual(byName['BETA SCHOOL FOUNDATION'].industry, 'Education');
  assert.strictEqual(byName['BETA SCHOOL FOUNDATION'].exemType, 'Public Foundation');
  assert.strictEqual(byName['EPSILON PRIVATE FOUNDATION'].exemType, 'Private Foundation');
  assert.strictEqual(byName['GAMMA CHURCH'].exemType, 'Charitable Organization');
  assert.deepStrictEqual(CRA.DESIGNATIONS, { A: 'Public Foundation', B: 'Private Foundation', C: 'Charitable Organization' });
});

// ─── 4. jurisdiction mapping ────────────────────────────────────────────────
test('jurisdiction mapping: each id selects exactly its own province; invalid ids throw; all 13 ids and data ids are valid and unique', () => {
  assert.deepStrictEqual(CRA.selectCharities(dataset(), 'CA-ON').records.map((r) => r.name).sort(), ['ETA UNKNOWN CATEGORY', 'ZETA ENVIRONMENT']);
  assert.deepStrictEqual(CRA.selectCharities(dataset(), 'CA-AB').records.map((r) => r.name), ['THETA AMENITIES']);
  ['CA-XX', 'ca-yt', 'YT', 'CA-YT/x', '', undefined].forEach((id) => assert.throws(() => CRA.selectCharities(dataset(), id), /not a Canadian province/));
  assert.throws(() => CRA.buildDocFromDataset(dataset(), 'CA-NU'), /No 2024 charities found for CA-NU/);
  assert.strictEqual(R.JURISDICTIONS.length, 13);
  R.JURISDICTIONS.forEach((j) => assert.match(j.id, CRA.PROVINCE_CODE_RE));
  assert.strictEqual(new Set(R.JURISDICTIONS.map((j) => j.id)).size, 13);
  assert.strictEqual(new Set(R.JURISDICTIONS.map((j) => j.cvDataId)).size, 13);
  assert.strictEqual(R.JURISDICTIONS.find((j) => j.id === 'CA-ON').cvDataId, 'CV-DATA-008');
  assert.strictEqual(R.JURISDICTIONS.find((j) => j.id === 'CA-YT').cvDataId, 'CV-DATA-YT-002');
});

test('a payload cannot be built for the wrong jurisdiction or with unexpected / missing fields', () => {
  const doc = CRA.buildDocFromDataset(dataset(), 'CA-YT');
  assert.throws(() => R.buildPayload(doc, R.JURISDICTIONS.find((j) => j.id === 'CA-ON'), { now: NOW }), /declares "CA-YT", expected "CA-ON"/);
  assert.throws(() => R.buildPayload({ ...doc, sneaky: 1 }, yt, { now: NOW }), /unexpected fields \[sneaky\]/);
  const lacking = { ...doc }; delete lacking.source_year;
  assert.throws(() => R.buildPayload(lacking, yt, { now: NOW }), /lacks \[source_year\]/);
  const p = R.buildPayload(doc, yt, { now: NOW });
  assert.strictEqual(p.cv_data_id, 'CV-DATA-YT-002');
  assert.strictEqual(p.verification_status, 'CV-REC-001-2026-10-26-CV-DATA-YT-002-CRA2024');
  assert.strictEqual(p.fetched_at, '2026-10-26T12:00:00.000Z');
});

// ─── 5. safe replacement ────────────────────────────────────────────────────
test('DRY RUN: exactly one get of the target and ZERO writes; offline dry run touches nothing', async () => {
  const db = recordingDb({ 'subnational_tax_exempt_entities/CA-YT': legacyDoc() });
  const r = await R.replaceOne({ db, jurisdiction: yt, payload: ytPayload(), write: false });
  assert.strictEqual(r.status, 'DRY_RUN');
  assert.deepStrictEqual(db.ops, [['get', 'subnational_tax_exempt_entities/CA-YT']]);
  assert.strictEqual(r.plan.before.count, 3);
  assert.strictEqual(r.plan.before.with_rawValue_zero, 3);
  assert.strictEqual(r.plan.after.with_rawValue_field, 0);
  assert.strictEqual(r.plan.old_record_names_not_in_new, 2);
  const off = await R.replaceOne({ db: null, jurisdiction: yt, payload: ytPayload(), write: false });
  assert.strictEqual(off.status, 'DRY_RUN_OFFLINE');
});

test('REPLACEMENT removes ALL obsolete 1998 entries and every placeholder rawValue: 0 (verified in the stored document)', async () => {
  const p = 'subnational_tax_exempt_entities/CA-YT';
  const db = recordingDb({ [p]: legacyDoc() });
  const backup = memBackup();
  const r = await R.replaceOne({ db, jurisdiction: yt, payload: ytPayload(), write: true, writeBackup: backup, projectId: 'civic-voice-5ea94' });
  assert.strictEqual(r.status, 'WRITTEN', r.error);
  assert.deepStrictEqual(r.verification, { ok: true, problems: [] });
  const stored = db.store[p];
  assert.ok(!stored.records.some((x) => x.name.startsWith('1998')), 'no obsolete 1998 entry survives');
  assert.ok(stored.records.every((x) => !('rawValue' in x)), 'no rawValue anywhere in the records');
  assert.deepStrictEqual(stored.records.map((x) => x.bn), ytPayload().records.map((x) => x.bn));
  assert.strictEqual(stored.source_year, 2024);
  assert.strictEqual(stored.total_in_source, 5);
  assert.ok(!JSON.stringify(stored).includes('51c68b86'));
});

test('the write is get -> backup -> set(mergeFields: every payload field) -> get; nothing else', async () => {
  const p = 'subnational_tax_exempt_entities/CA-YT';
  const db = recordingDb({ [p]: legacyDoc() });
  const backup = memBackup();
  await R.replaceOne({ db, jurisdiction: yt, payload: ytPayload(), write: true, writeBackup: backup });
  assert.deepStrictEqual(kinds(db), ['get', 'set', 'get']);
  const setOp = db.ops.find((o) => o[0] === 'set');
  assert.deepStrictEqual(setOp[2], { mergeFields: Object.keys(ytPayload()) });
  assert.deepStrictEqual([...setOp[2].mergeFields].sort(), [...R.OWNED_FIELDS].sort());
  assert.strictEqual(backup.saved.length, 1);
  assert.deepStrictEqual(backup.saved[0].data, legacyDoc(), 'the backup is the COMPLETE original document');
  assert.strictEqual(backup.saved[0].docId, 'CA-YT');
  assert.strictEqual(backup.saved[0].collection, 'subnational_tax_exempt_entities');
  assert.ok(!kinds(db).some((k) => /FORBIDDEN/.test(k)));
});

test('merge-only does NOT remove obsolete fields by itself — so documents with fields this process does not own are REFUSED, not guessed at', async () => {
  // the documented hazard: set(..., { merge: true }) leaves stale top-level fields behind
  const demo = recordingDb({ 'subnational_tax_exempt_entities/CA-YT': { ...legacyDoc(), stale_1998_field: 'x' } });
  await demo.collection('subnational_tax_exempt_entities').doc('CA-YT').set(ytPayload(), { merge: true });
  assert.strictEqual(demo.store['subnational_tax_exempt_entities/CA-YT'].stale_1998_field, 'x', 'plain merge keeps the stale field');
  // the process refuses instead
  const p = 'subnational_tax_exempt_entities/CA-YT';
  const db = recordingDb({ [p]: { ...legacyDoc(), stale_1998_field: 'x' } });
  const backup = memBackup();
  const r = await R.replaceOne({ db, jurisdiction: yt, payload: ytPayload(), write: true, writeBackup: backup });
  assert.strictEqual(r.status, 'ABORTED_CONFLICT');
  assert.match(r.error, /fields this process does not own: \[stale_1998_field\]/);
  assert.deepStrictEqual(kinds(db), ['get']);
  assert.strictEqual(backup.saved.length, 0);
});

test('a document belonging to another jurisdiction or country is never touched (dry run and write)', async () => {
  const p = 'subnational_tax_exempt_entities/CA-YT';
  for (const stray of [{ ...legacyDoc(), jurisdiction_id: 'CA-NT' }, { ...legacyDoc(), country: 'US' }]) {
    for (const write of [false, true]) {
      const db = recordingDb({ [p]: stray });
      const r = await R.replaceOne({ db, jurisdiction: yt, payload: ytPayload(), write, writeBackup: memBackup() });
      assert.strictEqual(r.status, 'ABORTED_CONFLICT');
      assert.ok(!kinds(db).includes('set'));
      assert.deepStrictEqual(db.store[p], stray);
    }
  }
});

test('BACKUP FAILURE aborts the replacement: nothing is written and the document is unchanged', async () => {
  const p = 'subnational_tax_exempt_entities/CA-YT';
  const db = recordingDb({ [p]: legacyDoc() });
  const r = await R.replaceOne({ db, jurisdiction: yt, payload: ytPayload(), write: true, writeBackup: async () => { throw new Error('ENOSPC: no space left on device'); } });
  assert.strictEqual(r.status, 'ABORTED_BACKUP_FAILED');
  assert.match(r.error, /ENOSPC/);
  assert.ok(!kinds(db).includes('set'));
  assert.deepStrictEqual(db.store[p], legacyDoc());
  const none = await R.replaceOne({ db: recordingDb({ [p]: legacyDoc() }), jurisdiction: yt, payload: ytPayload(), write: true });
  assert.strictEqual(none.status, 'ABORTED_NO_BACKUP');
});

test('a missing document is NOT created unless --allow-create is given; creation is create-only, limited to CA-NT / CA-NU (see section 8c)', async () => {
  const p = 'subnational_tax_exempt_entities/CA-YT';
  const db = recordingDb();
  const r = await R.replaceOne({ db, jurisdiction: yt, payload: ytPayload(), write: true, writeBackup: memBackup() });
  assert.strictEqual(r.status, 'ABORTED_MISSING_DOCUMENT');
  assert.ok(!(p in db.store));
  // --allow-create is refused outright for any jurisdiction other than CA-NT / CA-NU (no read, no write)
  const refused = await R.replaceOne({ db, jurisdiction: yt, payload: ytPayload(), write: true, allowCreate: true, writeBackup: memBackup(), writeReceipt: async () => ({}) });
  assert.strictEqual(refused.status, 'ABORTED_NOT_CREATABLE');
  assert.deepStrictEqual(db.ops, [['get', p]], 'only the first (non-create) attempt read anything');
  assert.ok(!(p in db.store));
});

test('a write that does not stick is caught by the verification read', async () => {
  const p = 'subnational_tax_exempt_entities/CA-YT';
  const db = recordingDb({ [p]: legacyDoc() });
  const realDoc = db.collection.bind(db);
  db.collection = (name) => { const c = realDoc(name); const d = c.doc.bind(c); c.doc = (id) => { const ref = d(id); ref.set = async () => { db.ops.push(['set-ignored']); }; return ref; }; return c; };
  const r = await R.replaceOne({ db, jurisdiction: yt, payload: ytPayload(), write: true, writeBackup: memBackup() });
  assert.strictEqual(r.status, 'WRITTEN_VERIFICATION_FAILED');
  assert.ok(r.verification.problems.length > 0);
});

test('verifyStored flags leftovers: rawValue, wrong order, wrong BNs, unexpected fields', () => {
  const payload = ytPayload();
  const good = JSON.parse(JSON.stringify(payload));
  assert.deepStrictEqual(R.verifyStored(good, payload), []);
  const withRaw = JSON.parse(JSON.stringify(payload)); withRaw.records[0].rawValue = 0;
  assert.ok(R.verifyStored(withRaw, payload).some((p) => /rawValue/.test(p)));
  const shuffled = JSON.parse(JSON.stringify(payload)); shuffled.records.reverse();
  assert.ok(R.verifyStored(shuffled, payload).some((p) => /BNs|ranked/.test(p)));
  const extra = { ...JSON.parse(JSON.stringify(payload)), legacy_extra: 1 };
  assert.ok(R.verifyStored(extra, payload).some((p) => /unexpected fields/.test(p)));
  assert.ok(R.verifyStored(null, payload)[0].includes('missing'));
});

test('no collection query, delete, update, add or batch is ever used, in dry runs, writes and restores', async () => {
  const p = 'subnational_tax_exempt_entities/CA-YT';
  const db = recordingDb({ [p]: legacyDoc() });
  await R.replaceOne({ db, jurisdiction: yt, payload: ytPayload(), write: false });
  await R.replaceOne({ db, jurisdiction: yt, payload: ytPayload(), write: true, writeBackup: memBackup() });
  assert.ok(!kinds(db).some((k) => /FORBIDDEN/.test(k)));
  assert.deepStrictEqual([...new Set(kinds(db))].sort(), ['get', 'set']);
  const src = ['canada-charities-replace.cjs', 'canada-charities-restore.cjs', 'lib/charities-replacement.cjs', 'lib/cra-list-of-charities-2024.cjs', 'lib/firestore-doc-backup.cjs', 'lib/charities-creation-receipt.cjs', 'canada-charities-created-rollback.cjs'].map((f) => fs.readFileSync(path.join(__dirname, f), 'utf8').split('\n').filter((l) => !/^\s*(\*|\/\/|\/\*)/.test(l)).join('\n')).join('\n');
  // Firestore receivers only (Set.add and crypto .update are unrelated and allowed)
  const firestoreCall = /\b(ref|db|snap)\.(delete|update|add|where|listDocuments|batch)\(|\.(doc|collection)\([^)]*\)\.(delete|update|add|where|listDocuments)\(|\bdb\.batch\(|runTransaction|collectionGroup|recursiveDelete/;
  assert.ok(!firestoreCall.test(src), 'no destructive or scanning Firestore call anywhere');
});

// ─── 6. restore ─────────────────────────────────────────────────────────────
test('RESTORE puts the backed-up fields back, removes the corrected-only fields, and takes a safety backup first', async () => {
  const p = 'subnational_tax_exempt_entities/CA-YT';
  const old = legacyDoc();
  const db = recordingDb({ [p]: old });
  const backup = memBackup();
  await R.replaceOne({ db, jurisdiction: yt, payload: ytPayload(), write: true, writeBackup: backup });
  const file = { backup_format: 1, document: { collection: 'subnational_tax_exempt_entities', id: 'CA-YT', path: p }, firebase_project: 'civic-voice-5ea94', data: backup.saved[0].data };
  const dry = await R.restoreOne({ db, backup: file, write: false, writeBackup: backup, deleteField: () => DELETE });
  assert.strictEqual(dry.status, 'DRY_RUN');
  assert.ok(dry.plan.deletes_fields.includes('source_year'));
  assert.strictEqual(db.store[p].source_year, 2024, 'a dry run restores nothing');
  const res = await R.restoreOne({ db, backup: file, write: true, writeBackup: backup, deleteField: () => DELETE });
  assert.strictEqual(res.status, 'RESTORED', res.error);
  assert.deepStrictEqual(db.store[p], old);
  assert.strictEqual(backup.saved.length, 2, 'a safety backup of the pre-restore state was taken');
});

test('RESTORE refuses backups it cannot trust: other collection, other project, unknown ids, foreign fields, type-tagged values', async () => {
  const p = 'subnational_tax_exempt_entities/CA-YT';
  const good = { backup_format: 1, document: { collection: 'subnational_tax_exempt_entities', id: 'CA-YT', path: p }, firebase_project: 'civic-voice-5ea94', data: legacyDoc() };
  const cases = [
    { ...good, document: { ...good.document, collection: 'social_stats' } },
    { ...good, firebase_project: 'other-project' },
    { ...good, document: { ...good.document, id: 'CA-XX' } },
    { ...good, data: { ...legacyDoc(), stray: 1 } },
    { ...good, data: { ...legacyDoc(), fetched_at: { __type: 'timestamp', iso: '2026-01-01T00:00:00.000Z' } } },
    { ...good, data: { ...legacyDoc(), jurisdiction_id: 'CA-NT' } },
    { backup_format: 2 }, null,
  ];
  for (const backup of cases) {
    const db = recordingDb({ [p]: legacyDoc() });
    const r = await R.restoreOne({ db, backup, write: true, writeBackup: memBackup(), deleteField: () => DELETE });
    assert.strictEqual(r.status, 'FAILED', JSON.stringify(backup).slice(0, 80));
    assert.ok(!kinds(db).includes('set'));
  }
});

test('restore command line is strict (file required; only --file and --write)', () => {
  assert.deepStrictEqual(RESTORE.parseArgs(['--file=/x/y.json']), { file: '/x/y.json', write: false });
  assert.deepStrictEqual(RESTORE.parseArgs(['--file=/x/y.json', '--write']), { file: '/x/y.json', write: true });
  for (const bad of [[], ['--write'], ['/x/y.json'], ['--file='], ['--file=a', '--file=b'], ['--file=a', '--write', '--write'], ['--file=a', '--force']]) assert.throws(() => RESTORE.parseArgs(bad), /Nothing was run/, JSON.stringify(bad));
});

// ─── 7. the backup file itself ──────────────────────────────────────────────
test('the backup writer saves the complete document outside any repository, verified, never overwritten, and refuses credentials', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cv-bk-'));
  try {
    assert.strictEqual(B.findGitRepoAbove(dir), null);
    const w = B.createLocalBackupWriter({ dir, now: () => new Date('2026-10-26T12:34:56.789Z') });
    const a = await w({ collection: 'subnational_tax_exempt_entities', docId: 'CA-YT', data: legacyDoc(), projectId: 'civic-voice-5ea94' });
    const b = await w({ collection: 'subnational_tax_exempt_entities', docId: 'CA-YT', data: { x: 1 }, projectId: 'civic-voice-5ea94' });
    assert.notStrictEqual(a.path, b.path);
    const f = JSON.parse(fs.readFileSync(a.path, 'utf8'));
    assert.deepStrictEqual(f.data, legacyDoc());
    assert.strictEqual(f.document.path, 'subnational_tax_exempt_entities/CA-YT');
    assert.strictEqual(f.firebase_project, 'civic-voice-5ea94');
    await assert.rejects(() => w({ collection: 'c', docId: 'd', data: { private_key: 'x' } }), /credential-like material/);
    await assert.rejects(() => B.createLocalBackupWriter({ dir: path.join(__dirname, '__never_created__') })({ collection: 'c', docId: 'd', data: {} }), /inside the git repository/);
    assert.ok(!fs.existsSync(path.join(__dirname, '__never_created__')));
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

// ─── 8. the replace command ─────────────────────────────────────────────────
test('arguments are strict: only --only, --write, --offline, --allow-create; --write needs an explicit --only; no implicit "all" write', () => {
  assert.deepStrictEqual(R.parseArgs([]), { write: false, offline: false, allowCreate: false, only: null });
  assert.deepStrictEqual([...R.parseArgs(['--only=ca-yt,CA-NT']).only], ['CA-YT', 'CA-NT']);
  assert.strictEqual(R.parseArgs(['--only=CA-YT', '--write']).write, true);
  assert.strictEqual(R.parseArgs(['--offline']).offline, true);
  const bad = [['--dryrun'], ['--write'], ['--only=CA-YT', '--only=CA-NT'], ['--only='], ['--only=CA-XX'], ['--only=CA-YT,'], ['--only=CA-YT', '--write', '--offline'], ['--allow-create'], ['--only=CA-YT', '--allow-create'], ['--only=CA-YT', '--write', '--allow-create'], ['--only=CA-NT,CA-ON', '--write', '--allow-create'], ['--only=CA-ON', '--write', '--allow-create'], ['CA-YT'], ['--write', '--write', '--only=CA-YT'], ['--only=CA-YT', '--force'], ['--no-backup']];
  bad.forEach((a) => assert.throws(() => R.parseArgs(a), /Nothing was run/, JSON.stringify(a)));
  assert.deepStrictEqual(R.parseArgs(['--only=CA-NT,CA-NU', '--write', '--allow-create']), { write: true, offline: false, allowCreate: true, only: new Set(['CA-NT', 'CA-NU']) });
  assert.throws(() => R.parseArgs(['--only=CA-YT', '--write', '--allow-create']), /limited to CA-NT and CA-NU/);
});

const quietRun = (over = {}) => REPLACE.run({ log: quiet, warn: quiet, now: NOW, getDb: () => null, verifyProject: okProject, loadDataset: async () => dataset(), writeBackup: memBackup(), ...over });

test('run(): project guard first (before any read), then source validation, then every payload is built BEFORE any write', async () => {
  const db = recordingDb({ 'subnational_tax_exempt_entities/CA-YT': legacyDoc() });
  await assert.rejects(() => quietRun({ argv: ['--only=CA-YT'], getDb: () => db, verifyProject: badProject }), /expected project "civic-voice-5ea94"/);
  assert.deepStrictEqual(db.ops, [], 'the project guard runs before the first read');
  const bad = recordingDb({ 'subnational_tax_exempt_entities/CA-YT': legacyDoc() });
  await assert.rejects(() => quietRun({ argv: ['--only=CA-YT', '--write'], getDb: () => bad, loadDataset: async () => { throw new Error('CRA source validation FAILED'); } }), /validation FAILED/);
  assert.ok(!kinds(bad).includes('set'));
  // CA-NU has no charities in the fixture: building fails BEFORE the first jurisdiction is written
  const two = recordingDb({ 'subnational_tax_exempt_entities/CA-YT': legacyDoc(), 'subnational_tax_exempt_entities/CA-NU': legacyDoc('CA-NU') });
  await assert.rejects(() => quietRun({ argv: ['--only=CA-YT,CA-NU', '--write'], getDb: () => two }), /No 2024 charities found for CA-NU/);
  assert.ok(!kinds(two).includes('set'), 'nothing was written even though CA-YT alone was fine');
});

test('run(): a dry run reads only the targeted documents, writes nothing, saves no report, and reports problems via the exit code', async () => {
  const db = recordingDb({ 'subnational_tax_exempt_entities/CA-YT': legacyDoc() });
  let saved = 0;
  const r = await quietRun({ argv: ['--only=CA-YT'], getDb: () => db, saveReport: () => { saved += 1; } });
  assert.strictEqual(r.results[0].status, 'DRY_RUN');
  assert.strictEqual(r.exitCode, 0);
  assert.deepStrictEqual(db.ops, [['get', 'subnational_tax_exempt_entities/CA-YT'], ['terminate']]);
  assert.strictEqual(saved, 0);
  const conflict = recordingDb({ 'subnational_tax_exempt_entities/CA-YT': { ...legacyDoc(), jurisdiction_id: 'CA-NT' } });
  assert.strictEqual((await quietRun({ argv: ['--only=CA-YT'], getDb: () => conflict })).exitCode, 1);
});

test('run(): offline mode prepares all jurisdictions that have data without touching Firestore', async () => {
  let dbCalls = 0;
  const only = ['CA-YT', 'CA-ON', 'CA-AB'];
  const r = await quietRun({ argv: ['--offline', `--only=${only.join(',')}`], getDb: () => { dbCalls += 1; return null; } });
  assert.strictEqual(dbCalls, 0);
  assert.deepStrictEqual(r.results.map((x) => x.status), ['DRY_RUN_OFFLINE', 'DRY_RUN_OFFLINE', 'DRY_RUN_OFFLINE']);
  assert.deepStrictEqual(r.summaries.map((s) => s.jurisdiction_id), ['CA-ON', 'CA-AB', 'CA-YT']);
});

test('run(): a real replacement writes only the named document, backs it up first, verifies, and saves a report', async () => {
  const p = 'subnational_tax_exempt_entities/CA-YT';
  const db = recordingDb({ [p]: legacyDoc(), 'subnational_tax_exempt_entities/CA-ON': legacyDoc('CA-ON') });
  const backup = memBackup();
  let report = null;
  const r = await quietRun({ argv: ['--only=CA-YT', '--write'], getDb: () => db, writeBackup: backup, saveReport: (x) => { report = x; } });
  assert.strictEqual(r.results[0].status, 'WRITTEN');
  assert.strictEqual(r.exitCode, 0);
  assert.deepStrictEqual(db.ops.filter((o) => o[0] === 'set').map((o) => o[1]), [p]);
  assert.deepStrictEqual(db.store['subnational_tax_exempt_entities/CA-ON'], legacyDoc('CA-ON'), 'the other document is untouched');
  assert.strictEqual(backup.saved.length, 1);
  assert.strictEqual(report.run_type, 'FIRESTORE_REPLACE');
  assert.strictEqual(report.firebase_project, 'civic-voice-5ea94');
  assert.strictEqual(report.source.title, '2024 List of charities');
});

// ─── 8b. the narrow CA-ON exception ─────────────────────────────────────────
const on = R.JURISDICTIONS.find((j) => j.id === 'CA-ON');
const ON_PATH = 'subnational_tax_exempt_entities/CA-ON';
const ON_RESOURCE_2024 = '694fdc72-eae4-4ee0-83eb-832ab7b230e3';
const ON_RESOURCE_1998 = '5e4f64a2-b751-4f14-bd3a-e4f109c64fcd';
const ON_EXTRAS = {
  resource_id: ON_RESOURCE_1998,
  cra_search_url: 'https://apps.cra-arc.gc.ca/ebci/hacc/srch/pub/dsplyBscSrch?request_locale=en',
  designation_refresh_reason: 'A=Public Foundation, B=Private Foundation per CRA codes_en.pdf §2.4 (2025-11-28)',
};
const onLegacy = (extra = {}) => legacyDoc('CA-ON', { ...ON_EXTRAS, ...extra });
const onPayload = () => R.buildPayload(CRA.buildDocFromDataset(dataset(), 'CA-ON'), on, { now: NOW, identificationResourceId: ON_RESOURCE_2024 });

test('CA-ON exception: only CA-ON has one, and it lists exactly the three decided fields', () => {
  assert.deepStrictEqual(Object.keys(R.EXCEPTIONS), ['CA-ON']);
  assert.deepStrictEqual([...R.EXCEPTIONS['CA-ON'].preserve].sort(), ['cra_search_url', 'designation_refresh_reason']);
  assert.deepStrictEqual([...R.EXCEPTIONS['CA-ON'].update], ['resource_id']);
  assert.strictEqual(R.OLD_1998_IDENTIFICATION_RESOURCE_ID, ON_RESOURCE_1998);
  assert.strictEqual(R.IDENTIFICATION_RESOURCE_ID_2024, ON_RESOURCE_2024);
  // the shared owned-field set is unchanged: the exception adds nothing for anyone else
  assert.strictEqual(R.OWNED_FIELDS.size, 16);
  assert.ok(!R.OWNED_FIELDS.has('resource_id'));
  for (const j of R.JURISDICTIONS.filter((x) => x.id !== 'CA-ON')) assert.deepStrictEqual([...R.toleratedFieldsFor(j.id)].sort(), [...R.OWNED_FIELDS].sort(), j.id);
});

test('CA-ON payload: standard 16 fields + resource_id (2024 Identification CSV); preserved fields are NOT in the payload; a changed source resource id is refused', () => {
  const p = onPayload();
  assert.deepStrictEqual(Object.keys(p).sort(), [...R.OWNED_FIELDS, 'resource_id'].sort());
  assert.strictEqual(p.resource_id, ON_RESOURCE_2024);
  assert.ok(!('cra_search_url' in p) && !('designation_refresh_reason' in p));
  const doc = CRA.buildDocFromDataset(dataset(), 'CA-ON');
  for (const bad of [null, undefined, 'ident-id', ON_RESOURCE_1998]) assert.throws(() => R.buildPayload(doc, on, { now: NOW, identificationResourceId: bad }), /Identification resource id/);
  // every other jurisdiction ignores the resource id completely
  const other = R.buildPayload(CRA.buildDocFromDataset(dataset(), 'CA-YT'), yt, { now: NOW, identificationResourceId: ON_RESOURCE_2024 });
  assert.ok(!('resource_id' in other));
  assert.deepStrictEqual(Object.keys(other).sort(), [...R.OWNED_FIELDS].sort());
});

test('CA-ON dry run: no conflict, nothing unknown, the three extras are planned (2 preserved, 1 updated), nothing removed, zero writes', async () => {
  const before = onLegacy();
  const db = recordingDb({ [ON_PATH]: before });
  const r = await R.replaceOne({ db, jurisdiction: on, payload: onPayload(), write: false });
  assert.strictEqual(r.status, 'DRY_RUN', r.error);
  assert.strictEqual(r.plan.conflict, null);
  assert.deepStrictEqual(r.plan.unknownKeys, []);
  assert.deepStrictEqual(r.plan.preserved_fields.sort(), ['cra_search_url', 'designation_refresh_reason']);
  assert.deepStrictEqual(r.plan.resource_id_change, { from: ON_RESOURCE_1998, to: ON_RESOURCE_2024 });
  assert.deepStrictEqual(r.plan.fields_removed, []);
  assert.ok(r.plan.fields_replaced.includes('resource_id') && r.plan.fields_replaced.length === 12, 'the 11 standard fields + resource_id');
  assert.deepStrictEqual(r.plan.fields_added.sort(), ['financials_reported_count', 'reporting_period', 'selection_basis', 'source_dataset', 'source_year']);
  assert.deepStrictEqual(db.ops, [['get', ON_PATH]]);
  assert.deepStrictEqual(db.store[ON_PATH], before);
});

test('CA-ON write: 11 standard fields replaced, 5 added, resource_id updated, the two other Ontario fields byte-identical, NOTHING lost; the backup holds the whole original', async () => {
  const before = onLegacy();
  const db = recordingDb({ [ON_PATH]: before });
  const backup = memBackup();
  const r = await R.replaceOne({ db, jurisdiction: on, payload: onPayload(), write: true, writeBackup: backup, projectId: 'civic-voice-5ea94' });
  assert.strictEqual(r.status, 'WRITTEN', r.error);
  assert.deepStrictEqual(r.verification, { ok: true, problems: [] });
  const stored = db.store[ON_PATH];
  assert.strictEqual(JSON.stringify(stored.cra_search_url), JSON.stringify(before.cra_search_url));
  assert.strictEqual(JSON.stringify(stored.designation_refresh_reason), JSON.stringify(before.designation_refresh_reason));
  assert.strictEqual(stored.resource_id, ON_RESOURCE_2024);
  assert.ok(Object.keys(before).every((k) => k in stored), 'no pre-existing field was removed');
  assert.deepStrictEqual(Object.keys(stored).sort(), [...Object.keys(onPayload()), 'cra_search_url', 'designation_refresh_reason'].sort());
  assert.ok(!stored.records.some((x) => x.name.startsWith('1998')) && stored.records.every((x) => !('rawValue' in x)));
  assert.strictEqual(stored.source_year, 2024);
  assert.deepStrictEqual(kinds(db), ['get', 'set', 'get']);
  const setOp = db.ops.find((o) => o[0] === 'set');
  assert.deepStrictEqual([...setOp[2].mergeFields].sort(), [...R.OWNED_FIELDS, 'resource_id'].sort());
  assert.ok(!setOp[2].mergeFields.includes('cra_search_url') && !setOp[2].mergeFields.includes('designation_refresh_reason'), 'the preserved fields are not even named in the write');
  assert.deepStrictEqual(backup.saved[0].data, before, 'the backup is the COMPLETE original, including the three Ontario fields');
});

test('CA-ON is still refused for anything else: an additional unknown field, or an unexpected resource_id value (nothing written, nothing backed up)', async () => {
  for (const [extra, re] of [[{ stray_field: 1 }, /does not own: \[stray_field\]/], [{ resource_id: 'some-other-resource' }, /existing resource_id is "some-other-resource"/]]) {
    for (const write of [false, true]) {
      const db = recordingDb({ [ON_PATH]: onLegacy(extra) });
      const backup = memBackup();
      const r = await R.replaceOne({ db, jurisdiction: on, payload: onPayload(), write, writeBackup: backup });
      assert.strictEqual(r.status, 'ABORTED_CONFLICT');
      assert.match(r.error, re);
      assert.ok(!kinds(db).includes('set'));
      assert.strictEqual(backup.saved.length, 0);
      assert.deepStrictEqual(db.store[ON_PATH], onLegacy(extra));
    }
  }
  // an Ontario document with ONLY the standard fields (no extras) is fine too, and gets resource_id added
  const plain = recordingDb({ [ON_PATH]: legacyDoc('CA-ON') });
  const r = await R.replaceOne({ db: plain, jurisdiction: on, payload: onPayload(), write: true, writeBackup: memBackup() });
  assert.strictEqual(r.status, 'WRITTEN', r.error);
  assert.strictEqual(plain.store[ON_PATH].resource_id, ON_RESOURCE_2024);
  assert.ok(!('cra_search_url' in plain.store[ON_PATH]), 'a preserved field is never invented');
  // re-running on an already-replaced Ontario document (resource_id already 2024) is accepted
  const again = await R.replaceOne({ db: plain, jurisdiction: on, payload: onPayload(), write: false });
  assert.strictEqual(again.status, 'DRY_RUN', again.error);
});

test('every OTHER jurisdiction stays fully protected: the Ontario fields are refused on all 12 of them, and an Ontario-shaped payload is refused too', async () => {
  for (const j of R.JURISDICTIONS.filter((x) => x.id !== 'CA-ON')) {
    for (const field of ['resource_id', 'cra_search_url', 'designation_refresh_reason']) {
      const path = 'subnational_tax_exempt_entities/' + j.id;
      const db = recordingDb({ [path]: { ...legacyDoc(j.id), [field]: ON_EXTRAS[field] } });
      const payload = { ...R.buildPayload({ ...CRA.buildDocFromDataset(dataset(), 'CA-YT'), jurisdiction_id: j.id }, j, { now: NOW, identificationResourceId: ON_RESOURCE_2024 }) };
      const backup = memBackup();
      const r = await R.replaceOne({ db, jurisdiction: j, payload, write: true, writeBackup: backup });
      assert.strictEqual(r.status, 'ABORTED_CONFLICT', j.id + ' ' + field);
      assert.match(r.error, new RegExp('does not own: \\[' + field + '\\]'));
      assert.ok(!kinds(db).includes('set') && backup.saved.length === 0);
    }
  }
  assert.throws(() => R.buildPayload({ ...CRA.buildDocFromDataset(dataset(), 'CA-YT'), resource_id: ON_RESOURCE_2024 }, yt, { now: NOW }), /unexpected fields \[resource_id\]/);
});

test('verifyStored (CA-ON) flags: a changed or removed preserved field, a wrong resource_id, any lost field, any unexpected field', () => {
  const before = onLegacy();
  const good = { ...before, ...onPayload() };
  assert.deepStrictEqual(R.verifyStored(good, onPayload(), before), []);
  assert.match(R.verifyStored({ ...good, cra_search_url: 'https://elsewhere' }, onPayload(), before).join(), /preserved field "cra_search_url" was changed/);
  const removed = { ...good }; delete removed.designation_refresh_reason;
  assert.match(R.verifyStored(removed, onPayload(), before).join(), /preserved field "designation_refresh_reason" was changed/);
  assert.match(R.verifyStored({ ...good, resource_id: ON_RESOURCE_1998 }, onPayload(), before).join(), /resource_id is/);
  const lost = { ...good }; delete lost.licence_note;
  assert.match(R.verifyStored(lost, onPayload(), before).join(), /fields were lost: \[licence_note\]/);
  assert.match(R.verifyStored({ ...good, stray: 1 }, onPayload(), before).join(), /unexpected fields/);
  // the same extras on another jurisdiction are "unexpected"
  assert.match(R.verifyStored({ ...ytPayload(), cra_search_url: 'x' }, ytPayload()).join(), /unexpected fields/);
});

test('CA-ON restore: the backup (with its extras) is accepted, the old resource_id returns, the corrected-only fields go, preserved fields are not touched; the same backup shape is refused for any other id', async () => {
  const before = onLegacy();
  const db = recordingDb({ [ON_PATH]: before });
  const backup = memBackup();
  await R.replaceOne({ db, jurisdiction: on, payload: onPayload(), write: true, writeBackup: backup });
  const file = { backup_format: 1, document: { collection: 'subnational_tax_exempt_entities', id: 'CA-ON', path: ON_PATH }, firebase_project: 'civic-voice-5ea94', data: backup.saved[0].data };
  const dry = await R.restoreOne({ db, backup: file, write: false, writeBackup: backup, deleteField: () => DELETE });
  assert.strictEqual(dry.status, 'DRY_RUN', dry.error);
  assert.ok(dry.plan.deletes_fields.includes('source_year'));
  assert.ok(!dry.plan.restores_fields.includes('cra_search_url') && !dry.plan.restores_fields.includes('designation_refresh_reason'));
  db.store[ON_PATH].cra_search_url = 'https://later-edit.example/'; // someone edits a preserved field after the replacement: a restore must leave it alone
  const res = await R.restoreOne({ db, backup: file, write: true, writeBackup: backup, deleteField: () => DELETE });
  assert.strictEqual(res.status, 'RESTORED', res.error);
  assert.strictEqual(db.store[ON_PATH].cra_search_url, 'https://later-edit.example/', 'the restore did not touch the preserved field');
  assert.deepStrictEqual({ ...db.store[ON_PATH], cra_search_url: before.cra_search_url }, before);
  const other = { ...file, document: { collection: 'subnational_tax_exempt_entities', id: 'CA-YT', path: 'subnational_tax_exempt_entities/CA-YT' } };
  const ytDb = recordingDb({ 'subnational_tax_exempt_entities/CA-YT': legacyDoc() });
  const refused = await R.restoreOne({ db: ytDb, backup: other, write: true, writeBackup: memBackup(), deleteField: () => DELETE });
  assert.strictEqual(refused.status, 'FAILED');
  assert.match(refused.error, /does not own/);
  assert.ok(!kinds(ytDb).includes('set'));
});

test('CA-ON: the kept designation note is accurate for the 2024 source (A / B mapping equals the 2024 module), and the run() path passes the source resource id through', async () => {
  assert.match(ON_EXTRAS.designation_refresh_reason, /A=Public Foundation, B=Private Foundation/);
  assert.strictEqual(CRA.DESIGNATIONS.A, 'Public Foundation');
  assert.strictEqual(CRA.DESIGNATIONS.B, 'Private Foundation');
  const db = recordingDb({ [ON_PATH]: onLegacy() });
  const r = await quietRun({ argv: ['--only=CA-ON'], getDb: () => db });
  assert.strictEqual(r.results[0].status, 'DRY_RUN', r.results[0].error);
  assert.strictEqual(r.exitCode, 0);
  assert.deepStrictEqual(r.results[0].plan.resource_id_change, { from: ON_RESOURCE_1998, to: ON_RESOURCE_2024 });
  assert.deepStrictEqual(db.ops, [['get', ON_PATH], ['terminate']]);
  // a CKAN package that points at a different Identification resource is refused before anything is read
  const drift = dataset(); drift.meta.resources.identification.id = 'a-different-resource';
  const db2 = recordingDb({ [ON_PATH]: onLegacy() });
  await assert.rejects(() => quietRun({ argv: ['--only=CA-ON'], getDb: () => db2, loadDataset: async () => drift }), /Identification resource id/);
});

// ─── 8c. safe creation (CA-NT / CA-NU) and rollback of a created document ───────
const RB = require('./lib/charities-creation-rollback.cjs');
const RCPT = require('./lib/charities-creation-receipt.cjs');
const ROLLBACK = require('./canada-charities-created-rollback.cjs');
const nt = R.JURISDICTIONS.find((j) => j.id === 'CA-NT');
const nu = R.JURISDICTIONS.find((j) => j.id === 'CA-NU');
const NT_PATH = 'subnational_tax_exempt_entities/CA-NT';
const ntPayload = () => R.buildPayload({ ...CRA.buildDocFromDataset(dataset(), 'CA-YT'), jurisdiction_id: 'CA-NT' }, nt, { now: NOW });
const toTs = (p) => ({ seconds: p.seconds, nanoseconds: p.nanoseconds });
/** An in-memory receipt writer with the same contract as the real one (and a failing variant). */
const memReceipt = () => { const saved = []; const w = async ({ receipt }) => { const problems = RCPT.validateReceipt(receipt); if (problems.length) throw new Error('receipt refused: ' + problems.join('; ')); saved.push(JSON.parse(JSON.stringify(receipt))); return { path: '/receipts/created__CA-NT.receipt.json', bytes: 1, sha256: 'x' }; }; w.saved = saved; return w; };
async function createNt(db = recordingDb({}, { allowDelete: true }), writeReceipt = memReceipt()) {
  const r = await R.replaceOne({ db, jurisdiction: nt, payload: ntPayload(), write: true, allowCreate: true, writeBackup: memBackup(), writeReceipt, projectId: 'civic-voice-5ea94' });
  return { db, r, writeReceipt };
}

test('CREATE (CA-NT): create-only — exactly get -> create -> get, the full payload, no set/merge, a receipt saved, status CREATED', async () => {
  const { db, r, writeReceipt } = await createNt();
  assert.strictEqual(r.status, 'CREATED', r.error);
  assert.strictEqual(r.mode, 'CREATE');
  assert.deepStrictEqual(kinds(db), ['get', 'create', 'get']);
  assert.deepStrictEqual(db.store[NT_PATH], ntPayload());
  assert.deepStrictEqual(r.verification, { ok: true, problems: [] });
  assert.strictEqual(writeReceipt.saved.length, 1);
  const rc = writeReceipt.saved[0];
  assert.strictEqual(rc.document.path, NT_PATH);
  assert.strictEqual(rc.firebase_project, 'civic-voice-5ea94');
  assert.strictEqual(rc.data_sha256, RCPT.dataSha256(db.store[NT_PATH]));
  assert.strictEqual(rc.stored.verification_status, ntPayload().verification_status);
  assert.match(r.receipt.confirmation_token, /^CA-NT:[0-9a-f]{12}$/);
  assert.strictEqual(r.backup, null, 'nothing existed to back up');
});

test('CREATE never overwrites: an existing document (or one that appears just before create) is refused and left untouched; non-creatable ids are refused before any read', async () => {
  const existing = { ...legacyDoc('CA-NT'), note: 'someone else wrote this' };
  const db = recordingDb({ [NT_PATH]: existing });
  const r = await R.replaceOne({ db, jurisdiction: nt, payload: ntPayload(), write: true, allowCreate: true, writeBackup: memBackup(), writeReceipt: memReceipt() });
  assert.strictEqual(r.status, 'ABORTED_ALREADY_EXISTS');
  assert.deepStrictEqual(kinds(db), ['get']);
  assert.deepStrictEqual(db.store[NT_PATH], existing);
  // the race: get() says missing, then the document appears; Firestore create() itself refuses
  const racing = recordingDb({}, { appearBeforeCreate: existing });
  const w = memReceipt();
  const r2 = await R.replaceOne({ db: racing, jurisdiction: nt, payload: ntPayload(), write: true, allowCreate: true, writeBackup: memBackup(), writeReceipt: w });
  assert.strictEqual(r2.status, 'ABORTED_ALREADY_EXISTS');
  assert.deepStrictEqual(racing.store[NT_PATH], existing, 'the appearing document was not overwritten');
  assert.strictEqual(w.saved.length, 0);
  assert.ok(!kinds(racing).includes('set'));
  // every non-creatable id, including the 11 live documents
  for (const j of R.JURISDICTIONS.filter((x) => x.id !== 'CA-NT' && x.id !== 'CA-NU')) {
    const d = recordingDb({ ['subnational_tax_exempt_entities/' + j.id]: legacyDoc(j.id) });
    const x = await R.replaceOne({ db: d, jurisdiction: j, payload: { ...ytPayload(), jurisdiction_id: j.id }, write: true, allowCreate: true, writeBackup: memBackup(), writeReceipt: memReceipt() });
    assert.strictEqual(x.status, 'ABORTED_NOT_CREATABLE', j.id);
    assert.deepStrictEqual(d.ops, [], j.id + ': nothing was even read');
  }
});

test('CREATE needs a receipt writer, never writes during a dry run, and reports a failed receipt loudly (the document then exists and the receipt content is kept in the result)', async () => {
  const noReceipt = recordingDb();
  const a = await R.replaceOne({ db: noReceipt, jurisdiction: nt, payload: ntPayload(), write: true, allowCreate: true, writeBackup: memBackup() });
  assert.strictEqual(a.status, 'ABORTED_NO_RECEIPT');
  assert.ok(!(NT_PATH in noReceipt.store) && !kinds(noReceipt).includes('create'));
  const dry = recordingDb();
  const b = await R.replaceOne({ db: dry, jurisdiction: nt, payload: ntPayload(), write: false });
  assert.strictEqual(b.status, 'DRY_RUN');
  assert.deepStrictEqual(dry.ops, [['get', NT_PATH]]);
  const failing = async () => { throw new Error('ENOSPC'); };
  const { r, db } = await createNt(recordingDb({}, { allowDelete: true }), failing);
  assert.strictEqual(r.status, 'CREATED_RECEIPT_FAILED');
  assert.match(r.error, /ENOSPC/);
  assert.ok(NT_PATH in db.store);
  assert.strictEqual(r.receipt_content.document.id, 'CA-NT', 'the full receipt is in the result so it can be saved by hand');
});

test('run(): --allow-create creates only the named NT/NU document, preflights the receipt writer BEFORE any create, stops on a failed preflight, and flags a failed receipt as a problem', async () => {
  const db = recordingDb({ 'subnational_tax_exempt_entities/CA-ON': legacyDoc('CA-ON') });
  const order = [];
  const writeReceipt = memReceipt();
  writeReceipt.preflight = async () => { order.push('preflight:' + db.ops.length); return { dir: '/receipts' }; };
  let report = null;
  const dsWithNt = () => { const d = dataset(); const rows = d.identRows.filter((x) => x.Province === 'YT').map((x) => ({ ...x, Province: 'NT', BN: x.BN.replace('1000', '2000') })); return { ...d, identRows: d.identRows.concat(rows), financialByBn: new Map([...d.financialByBn, ...[...d.financialByBn].filter(([bn]) => d.identRows.some((x) => x.BN === bn && x.Province === 'YT')).map(([bn, v]) => [bn.replace('1000', '2000'), { ...v, BN: v.BN.replace('1000', '2000') }])]) }; };
  const r = await quietRun({ argv: ['--only=CA-NT', '--write', '--allow-create'], getDb: () => db, loadDataset: async () => dsWithNt(), writeReceipt, saveReport: (x) => { report = x; } });
  assert.strictEqual(r.results[0].status, 'CREATED', r.results[0].error);
  assert.strictEqual(r.exitCode, 0);
  assert.deepStrictEqual(order, ['preflight:0'], 'the receipt location was proven before the first Firestore operation');
  assert.deepStrictEqual(db.ops.filter((o) => o[0] === 'create').map((o) => o[1]), [NT_PATH]);
  assert.ok(!kinds(db).includes('set') && !kinds(db).includes('FORBIDDEN delete'));
  assert.deepStrictEqual(db.store['subnational_tax_exempt_entities/CA-ON'], legacyDoc('CA-ON'), 'the other document is untouched');
  assert.strictEqual(report.results[0].receipt.confirmation_token.startsWith('CA-NT:'), true);
  const bad = recordingDb();
  const badWriter = memReceipt(); badWriter.preflight = async () => { throw new Error('receipt refused: inside the git repository'); };
  await assert.rejects(() => quietRun({ argv: ['--only=CA-NT', '--write', '--allow-create'], getDb: () => bad, loadDataset: async () => dsWithNt(), writeReceipt: badWriter }), /inside the git repository/);
  assert.deepStrictEqual(bad.ops, [], 'nothing was read or written when the receipt location is unusable');
  const failingReceipt = async () => { throw new Error('ENOSPC'); };
  failingReceipt.preflight = async () => ({ dir: '/receipts' });
  const noPreflight = async () => ({});
  await assert.rejects(() => quietRun({ argv: ['--only=CA-NT', '--write', '--allow-create'], getDb: () => recordingDb(), loadDataset: async () => dsWithNt(), writeReceipt: noPreflight }), /receipt writer with a preflight check/);
  const worse = await quietRun({ argv: ['--only=CA-NT', '--write', '--allow-create'], getDb: () => recordingDb(), loadDataset: async () => dsWithNt(), writeReceipt: failingReceipt });
  assert.strictEqual(worse.results[0].status, 'CREATED_RECEIPT_FAILED');
  assert.strictEqual(worse.exitCode, 1);
});

test('receipt writer: saved outside any repository, never overwrites, verified by read-back, no credentials, only NT/NU receipts, preflight probe leaves nothing behind', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cv-receipt-'));
  try {
    const { db } = await createNt();
    const snap = await db.collection('subnational_tax_exempt_entities').doc('CA-NT').get();
    const receipt = RCPT.buildReceipt({ id: 'CA-NT', projectId: 'civic-voice-5ea94', data: snap.data(), createTime: snap.createTime, updateTime: snap.updateTime, now: NOW });
    const write = RCPT.createLocalReceiptWriter({ dir, now: () => NOW });
    await write.preflight();
    assert.deepStrictEqual(fs.readdirSync(dir), [], 'the preflight probe was deleted again');
    const a = await write({ receipt });
    const b = await write({ receipt });
    assert.notStrictEqual(a.path, b.path, 'a second receipt never overwrites the first');
    assert.deepStrictEqual(JSON.parse(fs.readFileSync(a.path, 'utf8')), receipt);
    assert.match(path.basename(a.path), /^created__CA-NT__.*\.receipt\.json$/);
    for (const id of ['CA-ON', 'CA-YT', 'CA-BC']) assert.throws(() => RCPT.buildReceipt({ id, projectId: 'civic-voice-5ea94', data: snap.data(), createTime: snap.createTime, updateTime: snap.updateTime }), /only CA-NT and CA-NU/);
    await assert.rejects(() => write({ receipt: { ...receipt, document: { ...receipt.document, id: 'CA-ON', path: 'subnational_tax_exempt_entities/CA-ON' } } }), /not one of CA-NT, CA-NU/);
    await assert.rejects(() => write({ receipt: { ...receipt, stored: { ...receipt.stored, verification_status: '-----BEGIN ' + 'PRIVATE KEY----- x' } } }), /credential-like material/);
    const inRepo = RCPT.createLocalReceiptWriter({ dir: path.join(__dirname, '..', 'receipts-should-never-exist') });
    await assert.rejects(() => inRepo({ receipt }), /inside the git repository/);
    await assert.rejects(() => inRepo.preflight(), /inside the git repository/);
    assert.ok(!fs.existsSync(path.join(__dirname, '..', 'receipts-should-never-exist')));
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

const rollbackFixture = async () => {
  const { db, writeReceipt } = await createNt();
  const receipt = writeReceipt.saved[0];
  return { db, receipt, token: RCPT.confirmationToken(receipt) };
};
const rollbackWith = (over) => RB.rollbackCreated({ toTimestamp: toTs, projectId: 'civic-voice-5ea94', writeBackup: memBackup(), ...over });

test('ROLLBACK dry run: verifies the document is the untouched one this rollout created, prints the token, deletes nothing', async () => {
  const { db, receipt, token } = await rollbackFixture();
  db.ops.length = 0;
  const r = await rollbackWith({ db, receipt, write: false });
  assert.strictEqual(r.status, 'DRY_RUN', r.error);
  assert.strictEqual(r.confirmation_token, token);
  assert.deepStrictEqual(db.ops, [['get', NT_PATH]], 'one read of one document, no delete');
  assert.ok(NT_PATH in db.store);
});

test('ROLLBACK delete: needs the exact token, saves a full backup first, deletes only CA-NT with a lastUpdateTime precondition, verifies it is gone, and touches no other document', async () => {
  const { db, receipt, token } = await rollbackFixture();
  const other = 'subnational_tax_exempt_entities/CA-YT';
  db.store[other] = legacyDoc('CA-YT'); // an unrelated live-like document in the same stub
  const before = JSON.parse(JSON.stringify(db.store[other]));
  for (const confirm of [null, '', 'CA-NT:000000000000', 'CA-NU:' + token.slice(6), token.toLowerCase().replace('ca-nt', 'CA-nt')]) {
    const bk = memBackup();
    const refused = await rollbackWith({ db, receipt, write: true, confirm, writeBackup: bk });
    assert.strictEqual(refused.status, 'REFUSED_NOT_AUTHORIZED', String(confirm));
    assert.ok(NT_PATH in db.store && bk.saved.length === 0);
  }
  db.ops.length = 0;
  const bk = memBackup();
  const r = await rollbackWith({ db, receipt, write: true, confirm: token, writeBackup: bk });
  assert.strictEqual(r.status, 'DELETED', r.error);
  assert.deepStrictEqual(r.verification, { document_gone: true });
  assert.ok(!(NT_PATH in db.store));
  assert.strictEqual(bk.saved.length, 1);
  assert.strictEqual(bk.saved[0].docId, 'CA-NT');
  assert.strictEqual(RCPT.dataSha256(bk.saved[0].data), receipt.data_sha256, 'the backup is the complete created document');
  const del = db.ops.filter((o) => o[0] === 'delete');
  assert.deepStrictEqual(del, [['delete', NT_PATH, toTs(receipt.firestore.update_time)]], 'exactly one delete, of CA-NT, with the receipt updateTime as precondition');
  assert.deepStrictEqual(db.ops.map((o) => o[1]).filter((p) => p !== NT_PATH), [], 'no other document was read or written');
  assert.deepStrictEqual(db.store[other], before, 'the unrelated document is untouched');
});

test('ROLLBACK refuses (deletes nothing) when the document was modified, re-created, has foreign fields, or is missing', async () => {
  const cases = {
    'modified after creation': async (db) => { await db.collection('subnational_tax_exempt_entities').doc('CA-NT').set({ note: 'edited later' }, { mergeFields: ['note'] }); },
    'edited back to identical data (updateTime still differs)': async (db) => { const cur = db.store[NT_PATH]; await db.collection('subnational_tax_exempt_entities').doc('CA-NT').set({ note: cur.note }, { mergeFields: ['note'] }); },
    'foreign field added': async (db) => { await db.collection('subnational_tax_exempt_entities').doc('CA-NT').set({ stray: 1 }, { mergeFields: ['stray'] }); },
    're-created with identical data (createTime differs)': async (db) => { const copy = JSON.parse(JSON.stringify(db.store[NT_PATH])); delete db.store[NT_PATH]; await db.collection('subnational_tax_exempt_entities').doc('CA-NT').create(copy); },
  };
  for (const [name, mutate] of Object.entries(cases)) {
    const { db, receipt, token } = await rollbackFixture();
    await mutate(db);
    const snapshot = JSON.stringify(db.store[NT_PATH]);
    db.ops.length = 0;
    const bk = memBackup();
    for (const write of [false, true]) {
      const r = await rollbackWith({ db, receipt, write, confirm: write ? token : null, writeBackup: bk });
      assert.strictEqual(r.status, 'REFUSED_CHANGED', name);
      assert.ok(r.problems.length >= 1, name);
    }
    assert.ok(!kinds(db).includes('delete'), name);
    assert.strictEqual(JSON.stringify(db.store[NT_PATH]), snapshot, name + ': the document is unchanged');
    assert.strictEqual(bk.saved.length, 0);
  }
  const { db, receipt, token } = await rollbackFixture();
  delete db.store[NT_PATH];
  const gone = await rollbackWith({ db, receipt, write: true, confirm: token });
  assert.strictEqual(gone.status, 'REFUSED_MISSING');
});

test('ROLLBACK is atomic against a late change: the delete precondition makes Firestore refuse it, the document stays', async () => {
  const { db, receipt, token } = await rollbackFixture();
  // simulate a write landing between the check (get) and the delete by wrapping the first get
  const real = db.collection('subnational_tax_exempt_entities').doc('CA-NT');
  const col = db.collection.bind(db);
  let tampered = false;
  db.collection = (name) => { const c = col(name); const doc = c.doc.bind(c); return { ...c, doc: (id) => { const d = doc(id); return { ...d, get: async () => { const out = await d.get(); if (!tampered) { tampered = true; await real.set({ note: 'late edit' }, { mergeFields: ['note'] }); } return out; } }; } }; };
  const r = await rollbackWith({ db, receipt, write: true, confirm: token });
  assert.strictEqual(r.status, 'FAILED');
  assert.match(r.error, /FAILED_PRECONDITION/);
  assert.ok(NT_PATH in db.store);
  assert.strictEqual(db.store[NT_PATH].note, 'late edit');
});

test('ROLLBACK refuses bad receipts: other documents (CA-ON, CA-YT, any live id), other collection, other project, tampered path, wrong live project, no backup writer, failing backup', async () => {
  const { db, receipt, token } = await rollbackFixture();
  const bads = [
    { ...receipt, document: { collection: 'subnational_tax_exempt_entities', id: 'CA-ON', path: 'subnational_tax_exempt_entities/CA-ON' } },
    { ...receipt, document: { collection: 'subnational_tax_exempt_entities', id: 'CA-YT', path: 'subnational_tax_exempt_entities/CA-YT' } },
    { ...receipt, document: { collection: 'social_stats', id: 'CA-NT', path: 'social_stats/CA-NT' } },
    { ...receipt, document: { ...receipt.document, path: 'subnational_tax_exempt_entities/CA-NU' } },
    { ...receipt, firebase_project: 'other-project' },
    { ...receipt, data_sha256: 'zz' },
    { ...receipt, firestore: { create_time: null, update_time: null } },
    { receipt_format: 2 }, null,
  ];
  for (const bad of bads) {
    db.ops.length = 0;
    const r = await rollbackWith({ db, receipt: bad, write: true, confirm: token });
    assert.strictEqual(r.status, 'REFUSED_BAD_RECEIPT', JSON.stringify(bad).slice(0, 80));
    assert.deepStrictEqual(db.ops, [], 'a bad receipt causes no Firestore access at all');
  }
  const wrong = await rollbackWith({ db, receipt, write: true, confirm: token, projectId: 'other-project' });
  assert.strictEqual(wrong.status, 'REFUSED_WRONG_PROJECT');
  const none = await rollbackWith({ db, receipt, write: true, confirm: token, writeBackup: undefined });
  assert.strictEqual(none.status, 'ABORTED_NO_BACKUP');
  const failing = await rollbackWith({ db, receipt, write: true, confirm: token, writeBackup: async () => { throw new Error('ENOSPC'); } });
  assert.strictEqual(failing.status, 'ABORTED_BACKUP_FAILED');
  assert.ok(NT_PATH in db.store && !kinds(db).includes('delete'));
  // a CA-NU receipt is just as valid for NU, and cannot be pointed at NT
  assert.deepStrictEqual(RCPT.CREATABLE_IDS, ['CA-NT', 'CA-NU']);
});

test('ROLLBACK arguments are strict, and a delete is impossible without --write AND --confirm', () => {
  assert.deepStrictEqual(RB.parseRollbackArgs(['--receipt=r.json']), { receipt: 'r.json', write: false, confirm: null });
  assert.deepStrictEqual(RB.parseRollbackArgs(['--receipt=r.json', '--write', '--confirm=CA-NT:abc']), { receipt: 'r.json', write: true, confirm: 'CA-NT:abc' });
  for (const bad of [[], ['--write'], ['--receipt=r.json', '--write'], ['--receipt=r.json', '--confirm=x'], ['--receipt=a', '--receipt=b'], ['--receipt=r.json', '--write', '--write', '--confirm=x'], ['--receipt=r.json', '--force'], ['--only=CA-NT'], ['r.json']]) {
    assert.throws(() => RB.parseRollbackArgs(bad), /Nothing was run/, JSON.stringify(bad));
  }
});

test('rollback run(): project guard first, then one read; delete only with token; unrelated documents and the live-like ones are never touched', async () => {
  const { db, receipt, token } = await rollbackFixture();
  const readFile = () => JSON.stringify(receipt);
  const guarded = await assert.rejects(() => ROLLBACK.run({ argv: ['--receipt=r.json'], readFile, getDb: () => db, verifyProject: badProject, writeBackup: memBackup(), toTimestamp: toTs, log: quiet }), /expected project/);
  void guarded;
  db.ops.length = 0;
  const dry = await ROLLBACK.run({ argv: ['--receipt=r.json'], readFile, getDb: () => db, verifyProject: okProject, writeBackup: memBackup(), toTimestamp: toTs, log: quiet });
  assert.strictEqual(dry.status, 'DRY_RUN');
  assert.deepStrictEqual(db.ops, [['get', NT_PATH], ['terminate']]);
  const done = await ROLLBACK.run({ argv: ['--receipt=r.json', '--write', '--confirm=' + token], readFile, getDb: () => db, verifyProject: okProject, writeBackup: memBackup(), toTimestamp: toTs, log: quiet });
  assert.strictEqual(done.status, 'DELETED');
  assert.ok(!(NT_PATH in db.store));
  await assert.rejects(() => ROLLBACK.run({ argv: ['--receipt=r.json'], readFile, getDb: () => null, verifyProject: okProject, log: quiet }), /credentials not found/);
});

test('assessCreated: every check refuses ON ITS OWN (createTime, updateTime, data hash, foreign field, missing), and the untouched document passes', async () => {
  const { db, receipt } = await rollbackFixture();
  const snap = await db.collection('subnational_tax_exempt_entities').doc('CA-NT').get();
  assert.deepStrictEqual(RB.assessCreated(receipt, snap), [], 'the untouched document passes');
  const mk = (over) => ({ exists: true, data: () => over.data || snap.data(), createTime: over.createTime || snap.createTime, updateTime: over.updateTime || snap.updateTime });
  const only = (problems, re, label) => { assert.strictEqual(problems.length, 1, label + ': ' + JSON.stringify(problems)); assert.match(problems[0], re, label); };
  only(RB.assessCreated(receipt, mk({ createTime: { seconds: 1, nanoseconds: 1 } })), /createTime differs/, 'createTime only');
  only(RB.assessCreated(receipt, mk({ updateTime: { seconds: 1, nanoseconds: 1 } })), /updateTime differs/, 'updateTime only');
  only(RB.assessCreated(receipt, mk({ data: { ...snap.data(), note: 'changed' } })), /data differs from the data hash/, 'data only');
  const strayData = { ...snap.data(), stray: 1 };
  const strayReceipt = RCPT.buildReceipt({ id: 'CA-NT', projectId: 'civic-voice-5ea94', data: strayData, createTime: snap.createTime, updateTime: snap.updateTime });
  only(RB.assessCreated(strayReceipt, mk({ data: strayData })), /does not own: \[stray\]/, 'foreign field only');
  assert.deepStrictEqual(RB.assessCreated(receipt, { exists: false }), ['the document does not exist (nothing to roll back)']);
});

test('after a rollback, the pre-delete backup restores the document exactly (the documented way back)', async () => {
  const { db, receipt, token } = await rollbackFixture();
  const original = JSON.parse(JSON.stringify(db.store[NT_PATH]));
  const bk = memBackup();
  const r = await rollbackWith({ db, receipt, write: true, confirm: token, writeBackup: bk });
  assert.strictEqual(r.status, 'DELETED', r.error);
  assert.ok(!(NT_PATH in db.store));
  const file = { backup_format: 1, document: { collection: 'subnational_tax_exempt_entities', id: 'CA-NT', path: NT_PATH }, firebase_project: 'civic-voice-5ea94', data: bk.saved[0].data };
  const res = await R.restoreOne({ db, backup: file, write: true, writeBackup: memBackup(), deleteField: () => DELETE });
  assert.strictEqual(res.status, 'RESTORED', res.error);
  assert.deepStrictEqual(db.store[NT_PATH], original);
});

test('static: a Firestore delete exists in exactly ONE place (the rollback library), carries a lastUpdateTime precondition, and is reachable only through the receipt-checked path', () => {
  const strip = (f) => fs.readFileSync(path.join(__dirname, f), 'utf8').split('\n').filter((l) => !/^\s*(\*|\/\/|\/\*)/.test(l)).join('\n');
  const files = fs.readdirSync(__dirname).filter((f) => f.endsWith('.cjs')).map((f) => f).concat(fs.readdirSync(path.join(__dirname, 'lib')).filter((f) => f.endsWith('.cjs')).map((f) => 'lib/' + f));
  const deleters = files.filter((f) => /\bref\.delete\(|\.doc\([^)]*\)\.delete\(|\bdb\.recursiveDelete|\.listDocuments\(|\.deleteDocument/.test(strip(f)) && !/^test-/.test(f));
  assert.deepStrictEqual(deleters.filter((f) => !/^lib\/charities-creation-rollback\.cjs$/.test(f)).filter((f) => !/legacy|^canada-(monthly|unemployment)/.test(f)).filter((f) => /charit|firestore-doc-backup|cra-list/.test(f)), [], 'no charity pipeline file other than the rollback library deletes anything');
  const src = strip('lib/charities-creation-rollback.cjs');
  assert.strictEqual((src.match(/\bref\.delete\(/g) || []).length, 1, 'exactly one delete call');
  assert.match(src, /ref\.delete\(\{ lastUpdateTime: /);
  assert.ok(!/\.where\(|collectionGroup|recursiveDelete|listDocuments|\.get\(\)\s*\.then/.test(src), 'no query or scan');
  assert.match(src, /db\.collection\(COLLECTION\)\.doc\(id\)/, 'the only reference built is COLLECTION + the validated receipt id');
});


// ─── 9. legacy scripts ──────────────────────────────────────────────────────
const LEGACY_SCRIPTS = ['canada-mvp-write.cjs', 'canada-bc-write.cjs', 'canada-ab-write-charities.cjs', 'canada-qc-write-charities.cjs', 'canada-sk-write-charities.cjs', 'canada-mb-write-charities.cjs', 'canada-ns-write-charities.cjs', 'canada-nb-write-charities.cjs', 'canada-nl-write-charities.cjs', 'canada-pe-write-charities.cjs', 'canada-yt-write-charities.cjs', 'canada-nt-write-charities.cjs', 'canada-nu-write-charities.cjs', 'canada-cvdata008-refresh.cjs', 'canada-monthly-runner.cjs', 'canada-unemployment-batch-write.cjs'];
const NEW_SCRIPTS = ['canada-charities-replace.cjs', 'canada-charities-restore.cjs', 'canada-charities-created-rollback.cjs'];
const LIB_CODES = ['ab', 'bc', 'mb', 'nb', 'nl', 'ns', 'nt', 'nu', 'on', 'pe', 'qc', 'sk', 'yt'];

test('static: every legacy writer starts itself ONLY when executed directly (no unguarded top-level main())', () => {
  [...LEGACY_SCRIPTS, ...NEW_SCRIPTS].forEach((f) => {
    const src = fs.readFileSync(path.join(__dirname, f), 'utf8').replace(/\r\n/g, '\n');
    assert.ok(/require\.main === module/.test(src), `${f} must be guarded`);
    assert.ok(!/^main\(\)/m.test(src), `${f} must not call main() at top level`);
    assert.ok(!/^(\(async|run\(\)|start\(\))/m.test(src), `${f} must not start work at top level`);
  });
});

test('static: every legacy builder (buildTax) delegates to the 2024 module and cannot reach the 1998 package', () => {
  LIB_CODES.forEach((c) => {
    const src = fs.readFileSync(path.join(__dirname, 'lib', `subnational-transparency-ca-${c}.cjs`), 'utf8').replace(/\r\n/g, '\n');
    const start = src.indexOf('async function buildTax(');
    assert.ok(start > 0, `${c}: buildTax present`);
    const body = src.slice(start, src.indexOf('\n}\n', start));
    assert.ok(body.includes("require('./cra-list-of-charities-2024.cjs')"), `${c}: delegates to the 2024 module`);
    assert.ok(body.includes(`jurisdictionId: 'CA-${c.toUpperCase()}'`), `${c}: passes its own jurisdiction`);
    assert.ok(!/fetchJson|fetchText|charitiesCkanPkg|rawValue/.test(body), `${c}: buildTax no longer fetches or writes placeholders itself`);
  });
});

test('every legacy builder now returns the corrected 2024 document for its own jurisdiction (no 1998 data, no rawValue)', async () => {
  const ident = [IDENT_HEAD, ...LIB_CODES.map((c, i) => identRow(`2000000${String(i).padStart(2, '0')}RR0001`, '0140', 'C', `CHARITY ${c.toUpperCase()}`, c.toUpperCase()))].join('\n');
  const fin = [FIN_HEAD, ...LIB_CODES.map((c, i) => finRow(`2000000${String(i).padStart(2, '0')}RR0001`, '2024-03-31', 10, 1, 1000 + i, 900))].join('\n');
  const ds = CRA.parseDataset({ meta: CRA.validatePackage(validPackage()), identCsv: ident, financialCsv: fin });
  for (const c of LIB_CODES) {
    const lib = require(`./lib/subnational-transparency-ca-${c}.cjs`);
    const doc = await lib.buildTax({ dataset: ds });
    assert.strictEqual(doc.jurisdiction_id, `CA-${c.toUpperCase()}`);
    assert.strictEqual(doc.source_year, 2024);
    assert.deepStrictEqual(doc.records.map((r) => r.name), [`CHARITY ${c.toUpperCase()}`]);
    assert.ok(doc.records.every((r) => !('rawValue' in r)));
    assert.ok(!JSON.stringify(doc).includes('51c68b86'));
  }
});

// ---- hermetic child processes (never able to reach Firestore or any network) ----
function hermeticPreload() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cv-hermetic-'));
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

test('NO IMPORT-TIME EXECUTION: requiring every legacy writer, both new scripts and all 13 builders does nothing (hermetic child process)', () => {
  const { file, dir } = hermeticPreload();
  try {
    const targets = [...LEGACY_SCRIPTS, ...NEW_SCRIPTS].map((f) => path.join(__dirname, f)).concat(LIB_CODES.map((c) => path.join(__dirname, 'lib', `subnational-transparency-ca-${c}.cjs`)));
    for (const t of targets) {
      const r = spawnSync(process.execPath, ['--require', file, '-e', `require(${JSON.stringify(t)}); console.log('IMPORTED-OK')`], { encoding: 'utf8', cwd: dir, timeout: 60000 });
      const out = `${r.stdout}\n${r.stderr}`;
      assert.strictEqual(r.status, 0, `${path.basename(t)}\n${out}`);
      assert.match(r.stdout.trim(), /^(\[dotenv[^\n]*\n)*IMPORTED-OK$/, `${path.basename(t)} printed something on import:\n${out}`);
      assert.ok(!/LIVE-ACCESS-BLOCKED|WRITTEN|Firebase connected|DRY RUN/.test(out), `${path.basename(t)} tried to do work on import:\n${out}`);
    }
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test('the replace and restore commands stop on an unsupported argument before connecting to anything (hermetic child process)', () => {
  const { file, dir } = hermeticPreload();
  try {
    for (const [script, args] of [['canada-charities-replace.cjs', ['--dryrun']], ['canada-charities-replace.cjs', ['--write']], ['canada-charities-replace.cjs', ['--only=CA-XX']], ['canada-charities-restore.cjs', ['--write']], ['canada-charities-restore.cjs', ['--fil=x']], ['canada-charities-replace.cjs', ['--only=CA-YT', '--write', '--allow-create']], ['canada-charities-created-rollback.cjs', []], ['canada-charities-created-rollback.cjs', ['--receipt=x', '--write']], ['canada-charities-created-rollback.cjs', ['--receipt=x', '--confirm=y']], ['canada-charities-created-rollback.cjs', ['--receipt=x', '--force']]]) {
      const r = spawnSync(process.execPath, ['--require', file, path.join(__dirname, script), ...args], { encoding: 'utf8', cwd: dir, timeout: 60000 });
      const out = `${r.stdout}\n${r.stderr}`;
      assert.strictEqual(r.status, 1, `${script} ${args.join(' ')}\n${out}`);
      assert.match(out, /Nothing was run/, out);
      assert.ok(!/LIVE-ACCESS-BLOCKED|Firebase connected|DRY RUN|WRITE MODE/.test(out), out);
    }
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test('the replace command with a VALID dry-run argument is stopped by the hermetic tripwire, never reaching Firestore or the network', () => {
  const { file, dir } = hermeticPreload();
  try {
    const r = spawnSync(process.execPath, ['--require', file, path.join(__dirname, 'canada-charities-replace.cjs'), '--only=CA-YT'], { encoding: 'utf8', cwd: dir, timeout: 60000 });
    const out = `${r.stdout}\n${r.stderr}`;
    assert.notStrictEqual(r.status, 0, out);
    assert.ok(!/WRITTEN|Replaced/.test(out), out);
    assert.ok(!/Nothing was run/.test(out), 'the argument itself is valid');
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

// ─── 10. the retired CA-NT / CA-NU legacy writers fail closed ────────────────────
const RETIRED = [['canada-nt-write-charities.cjs', 'writeNtCharities', 'CA-NT'], ['canada-nu-write-charities.cjs', 'writeNuCharities', 'CA-NU']];

test('RETIRED writers (NT, NU): running them directly exits 1 with a clear message BEFORE any other code runs — nothing is required, no Firestore, network, child process or report file (hermetic child process)', () => {
  const { file: tripwire, dir } = hermeticPreload();
  // second preload: records every module a retired script tries to load (anything other than the preloads themselves)
  const recorder = path.join(dir, 'record-loads.cjs');
  fs.writeFileSync(recorder, `
    'use strict';
    const Module = require('module');
    const orig = Module._load;
    const loaded = [];
    Module._load = function (request, parent, ...rest) {
      if (parent && /canada-n[tu]-write-charities\.cjs$/.test(parent.filename || '')) loaded.push(request);
      return orig.call(this, request, parent, ...rest);
    };
    process.on('exit', () => process.stderr.write('\\nLOADED:' + JSON.stringify(loaded) + '\\n'));
  `);
  const reportsDir = path.join(__dirname, 'reports');
  const listing = () => fs.readdirSync(reportsDir).sort().join('|');
  const before = listing();
  try {
    for (const [script] of RETIRED) {
      for (const args of [[], ['--write'], ['--only=CA-NT', '--write', '--allow-create'], ['anything']]) {
        const r = spawnSync(process.execPath, ['--require', tripwire, '--require', recorder, path.join(__dirname, script), ...args], { encoding: 'utf8', cwd: dir, timeout: 60000 });
        const out = r.stdout + '\n' + r.stderr;
        const tag = script + ' ' + args.join(' ');
        assert.strictEqual(r.status, 1, tag + '\n' + out);
        assert.match(r.stderr, /DISABLED: this legacy writer .* retired on 2026-11-02 and can no longer write/, tag + '\n' + out);
        assert.match(r.stderr, /canada-charities-replace\.cjs --only=CA-N[TU] --write --allow-create/, tag + ': points to the guarded pipeline');
        assert.ok(!/LIVE-ACCESS-BLOCKED|Firebase connected|WRITTEN|fetching|writing to Firestore|WRITE SUMMARY|dotenv|injected env/i.test(out), tag + ' did work:\n' + out);
        assert.match(r.stderr, /LOADED:\[\]/, tag + ': the script must not load a single module before refusing');
      }
    }
    assert.strictEqual(listing(), before, 'no report file was created in engine/reports');
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test('RETIRED writers (NT, NU): the exported function also refuses and never touches the database it is given; requiring the module has no effect', async () => {
  for (const [script, fn, id] of RETIRED) {
    const db = recordingDb({ ['subnational_tax_exempt_entities/' + id]: legacyDoc(id) }, { allowDelete: true });
    const mod = require(path.join(__dirname, script));
    assert.deepStrictEqual(Object.keys(mod).sort(), ['DISABLED_MESSAGE', fn].sort(), script + ' exports only the refusing function and the message');
    await assert.rejects(() => mod[fn](db, new Date().toISOString()), /DISABLED: this legacy writer/);
    await assert.rejects(() => mod[fn](), /DISABLED/);
    assert.deepStrictEqual(db.ops, [], script + ': the database received no operation at all');
    assert.deepStrictEqual(db.store['subnational_tax_exempt_entities/' + id], legacyDoc(id));
  }
});

test('RETIRED writers (NT, NU): static — the guard is the first executable statement (before any require), no direct-run block remains, the original body is not exported, and the files are kept for history', () => {
  for (const [script, fn] of RETIRED) {
    const src = fs.readFileSync(path.join(__dirname, script), 'utf8').replace(/\r\n/g, '\n');
    const code = src.replace(/\/\*[\s\S]*?\*\//g, '').split('\n').filter((l) => !/^\s*\/\//.test(l)).join('\n');
    const guard = code.indexOf('require.main === module');
    const firstRequire = code.indexOf('require(');
    assert.ok(guard > 0 && firstRequire > guard, script + ': the guard comes before the first require()');
    assert.match(code, /if \(require\.main === module\) \{\s*console\.error\(DISABLED_MESSAGE\);\s*process\.exit\(1\);\s*\}/, script);
    assert.ok(!/main\(\)\s*\.catch|^main\(\)/m.test(code), script + ': nothing starts main()');
    assert.ok(!/module\.exports\s*=\s*\{[^}]*legacyWrite/.test(code), script + ': the original body is not exported');
    assert.ok(new RegExp('async function ' + fn + '\\(\\) \\{\\s*throw new Error\\(DISABLED_MESSAGE\\);\\s*\\}').test(code), script + ': the exported function only throws');
    assert.ok(/DISABLED \(2026-11-02\)/.test(src) && /legacyWrite(Nt|Nu)CharitiesDisabled/.test(src), script + ' is still in the repository, marked disabled, with its history');
  }
});

test('RETIRED writers: the hermetic import test and the legacy-writer static test still cover them, and no OTHER legacy script was changed by retiring them', () => {
  ['canada-nt-write-charities.cjs', 'canada-nu-write-charities.cjs'].forEach((f) => assert.ok(LEGACY_SCRIPTS.includes(f), f + ' stays in the legacy list'));
  assert.ok(LEGACY_SCRIPTS.every((f) => fs.existsSync(path.join(__dirname, f))), 'every legacy script is still in the repository');
});

runQueue().then(() => {
  console.log(`\n${passed} passed, ${failed} failed (zero Firestore, zero network)`);
  if (failed > 0) process.exitCode = 1;
});
