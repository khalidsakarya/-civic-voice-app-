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
    { id: 'ident-id', name: 'Identification', format: 'CSV', url: 'https://example/ident.csv' },
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
function recordingDb(existing = {}) {
  const ops = [];
  const store = JSON.parse(JSON.stringify(existing));
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
          get: async () => { ops.push(['get', p]); return { exists: p in store, data: () => (p in store ? clone(store[p]) : undefined) }; },
          set: async (data, opts) => {
            ops.push(['set', p, opts && (opts.mergeFields ? { mergeFields: [...opts.mergeFields] } : opts)]);
            const cur = store[p];
            if (opts && opts.mergeFields) {
              const next = cur ? clone(cur) : {};
              for (const f of opts.mergeFields) { if (data[f] === DELETE) delete next[f]; else next[f] = clone(data[f]); }
              store[p] = next;
            } else if (opts && opts.merge) store[p] = deepMerge(cur || {}, clone(data));
            else store[p] = clone(data);
          },
          update: tripwire('update'), delete: tripwire('delete'),
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

test('a missing document is NOT created unless --allow-create is given (and then needs no backup)', async () => {
  const p = 'subnational_tax_exempt_entities/CA-YT';
  const db = recordingDb();
  const r = await R.replaceOne({ db, jurisdiction: yt, payload: ytPayload(), write: true, writeBackup: memBackup() });
  assert.strictEqual(r.status, 'ABORTED_MISSING_DOCUMENT');
  assert.ok(!(p in db.store));
  const created = await R.replaceOne({ db, jurisdiction: yt, payload: ytPayload(), write: true, allowCreate: true, writeBackup: memBackup() });
  assert.strictEqual(created.status, 'WRITTEN');
  assert.strictEqual(created.backup, null);
  assert.ok(p in db.store);
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
  const src = ['canada-charities-replace.cjs', 'canada-charities-restore.cjs', 'lib/charities-replacement.cjs', 'lib/cra-list-of-charities-2024.cjs', 'lib/firestore-doc-backup.cjs'].map((f) => fs.readFileSync(path.join(__dirname, f), 'utf8').split('\n').filter((l) => !/^\s*(\*|\/\/|\/\*)/.test(l)).join('\n')).join('\n');
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
  const bad = [['--dryrun'], ['--write'], ['--only=CA-YT', '--only=CA-NT'], ['--only='], ['--only=CA-XX'], ['--only=CA-YT,'], ['--only=CA-YT', '--write', '--offline'], ['--allow-create'], ['--only=CA-YT', '--allow-create'], ['CA-YT'], ['--write', '--write', '--only=CA-YT'], ['--only=CA-YT', '--force'], ['--no-backup']];
  bad.forEach((a) => assert.throws(() => R.parseArgs(a), /Nothing was run/, JSON.stringify(a)));
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

// ─── 9. legacy scripts ──────────────────────────────────────────────────────
const LEGACY_SCRIPTS = ['canada-mvp-write.cjs', 'canada-bc-write.cjs', 'canada-ab-write-charities.cjs', 'canada-qc-write-charities.cjs', 'canada-sk-write-charities.cjs', 'canada-mb-write-charities.cjs', 'canada-ns-write-charities.cjs', 'canada-nb-write-charities.cjs', 'canada-nl-write-charities.cjs', 'canada-pe-write-charities.cjs', 'canada-yt-write-charities.cjs', 'canada-nt-write-charities.cjs', 'canada-nu-write-charities.cjs', 'canada-cvdata008-refresh.cjs', 'canada-monthly-runner.cjs', 'canada-unemployment-batch-write.cjs'];
const NEW_SCRIPTS = ['canada-charities-replace.cjs', 'canada-charities-restore.cjs'];
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
    for (const [script, args] of [['canada-charities-replace.cjs', ['--dryrun']], ['canada-charities-replace.cjs', ['--write']], ['canada-charities-replace.cjs', ['--only=CA-XX']], ['canada-charities-restore.cjs', ['--write']], ['canada-charities-restore.cjs', ['--fil=x']]]) {
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

runQueue().then(() => {
  console.log(`\n${passed} passed, ${failed} failed (zero Firestore, zero network)`);
  if (failed > 0) process.exitCode = 1;
});
