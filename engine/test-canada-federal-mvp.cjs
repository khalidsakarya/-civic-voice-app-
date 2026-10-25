/**
 * Local tests for the Canada federal MVP ingestion logic:
 *   - engine/lib/canada-federal-contracts.cjs    (selection of the 100 largest contracts)
 *   - engine/lib/canada-federal-unemployment.cjs (social_stats document mapping)
 *   - the dry-run safety of engine/canada-federal-contracts-write.cjs
 *
 * Synthetic data only. Zero Firestore, zero network. The dry-run safety test
 * runs the real script in a child process with a hook that THROWS if anything
 * tries to load firebase-admin or the admin-init module.
 *
 *   node engine/test-canada-federal-mvp.cjs
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const C = require('./lib/canada-federal-contracts.cjs');
const U = require('./lib/canada-federal-unemployment.cjs');

let passed = 0;
let failed = 0;
function test(name, fn) {
  try {
    fn();
    passed += 1;
    console.log(`  ok - ${name}`);
  } catch (err) {
    failed += 1;
    console.log(`  FAIL - ${name}\n    ${err.message}`);
  }
}

console.log('engine/test-canada-federal-mvp.cjs (synthetic data; zero Firestore, zero network)\n');

// ─── helpers ────────────────────────────────────────────────────────────────
let idSeq = 1000;
function row(o) {
  idSeq += 1;
  return {
    _id: idSeq,
    reference_number: `C-2025-2026-Q1-${idSeq}`,
    procurement_id: `P${idSeq}`,
    vendor_name: 'Vendor Inc.',
    owner_org: 'dnd-mdn',
    owner_org_title: 'National Defence | Défense nationale',
    reporting_period: '2025-2026-Q1',
    contract_date: '2025-05-01',
    delivery_date: '2027-03-31',
    contract_period_start: '2025-05-01',
    original_value: '1000000',
    amendment_value: '0',
    contract_value: '1000000',
    description_en: 'Services',
    instrument_type: 'C',
    ...o,
  };
}

// ─── contracts: parsing helpers ─────────────────────────────────────────────
test('parseMoney handles numbers, separators, blanks and junk', () => {
  assert.strictEqual(C.parseMoney('11219370646.0'), 11219370646);
  assert.strictEqual(C.parseMoney('$1,234.50'), 1234.5);
  assert.strictEqual(C.parseMoney('-5739988.0'), -5739988);
  assert.strictEqual(C.parseMoney(''), null);
  assert.strictEqual(C.parseMoney(null), null);
  assert.strictEqual(C.parseMoney('n/a'), null);
});

test('englishPart keeps only the English half of a bilingual department name', () => {
  assert.strictEqual(C.englishPart('Public Prosecution Service of Canada | Service des poursuites pénales du Canada'), 'Public Prosecution Service of Canada');
  assert.strictEqual(C.englishPart('Shared Services Canada'), 'Shared Services Canada');
});

test('fiscalYearPeriods builds the four disclosure quarters and rejects bad input', () => {
  assert.deepStrictEqual(C.fiscalYearPeriods('2025-2026'), ['2025-2026-Q1', '2025-2026-Q2', '2025-2026-Q3', '2025-2026-Q4']);
  assert.throws(() => C.fiscalYearPeriods('2025-2027'));
  assert.throws(() => C.fiscalYearPeriods('2025'));
});

test('fiscalYearLabels produce an en-dash short form and the April-March range', () => {
  const l = C.fiscalYearLabels('2025-2026');
  assert.strictEqual(l.short, '2025–26');
  assert.strictEqual(l.range, 'April 1, 2025 – March 31, 2026');
});

// ─── contracts: ranking ─────────────────────────────────────────────────────
test('ranking is numeric, not lexicographic (values are TEXT in the source)', () => {
  // As strings, "900000" > "10000000"; numerically 10,000,000 is larger.
  const rows = [
    row({ procurement_id: 'A', vendor_name: 'Alpha', contract_value: '900000' }),
    row({ procurement_id: 'B', vendor_name: 'Bravo', contract_value: '10000000' }),
    row({ procurement_id: 'C', vendor_name: 'Charlie', contract_value: '2500000' }),
  ];
  const { selected } = C.selectLargestContracts(rows, { size: 3 });
  assert.deepStrictEqual(selected.map((r) => r.procurement_id), ['B', 'C', 'A']);
  assert.deepStrictEqual(selected.map((r) => r.rank), [1, 2, 3]);
});

test('blank, zero, negative and non-numeric values are excluded and counted', () => {
  const rows = [row({ procurement_id: 'A', contract_value: '' }), row({ procurement_id: 'B', contract_value: '0' }), row({ procurement_id: 'C', contract_value: '-100' }),
    row({ procurement_id: 'D', contract_value: 'x' }), row({ procurement_id: 'E', contract_value: '50' })];
  const { selected, stats } = C.selectLargestContracts(rows);
  assert.strictEqual(selected.length, 1);
  assert.strictEqual(selected[0].procurement_id, 'E');
  assert.strictEqual(stats.excluded_non_positive_or_blank_value, 4);
});

test('only `size` contracts are selected, largest first', () => {
  const rows = Array.from({ length: 250 }, (_, i) => row({ procurement_id: `P-${i}`, vendor_name: `Vendor ${i}`, contract_value: String(1000 + i) }));
  const { selected } = C.selectLargestContracts(rows, { size: 100 });
  assert.strictEqual(selected.length, 100);
  assert.strictEqual(selected[0]._value, 1249);
  assert.strictEqual(selected[99]._value, 1150);
});

// ─── contracts: duplicates and amendments ───────────────────────────────────
test('a contract re-reported for each amendment appears once (the old top-N flaw)', () => {
  const same = { procurement_id: 'EW70241166', vendor_name: 'PARSONS INC', original_value: '49810077.55', contract_date: '2017-12-14', delivery_date: '2035-03-31' };
  const rows = [
    row({ ...same, reporting_period: '2025-2026-Q1', contract_value: '1641912605.79' }),
    row({ ...same, reporting_period: '2025-2026-Q2', contract_value: '1655849353.21' }),
    row({ ...same, reporting_period: '2025-2026-Q4', contract_value: '1959064931.86' }),
    row({ procurement_id: 'OTHER', vendor_name: 'Someone Else', contract_value: '1800000000' }),
  ];
  const { selected } = C.selectLargestContracts(rows, { size: 10 });
  assert.strictEqual(selected.length, 2);
  assert.strictEqual(selected.filter((r) => r.procurement_id === 'EW70241166').length, 1);
});

test('the MOST RECENT disclosure is kept, not the maximum (values are not monotonic)', () => {
  const same = { procurement_id: 'P000074033', vendor_name: 'IBM CANADA LTD.' };
  const rows = [
    row({ ...same, reporting_period: '2025-2026-Q4', _id: 5001, contract_value: '804035049.4' }),
    row({ ...same, reporting_period: '2025-2026-Q4', _id: 5004, contract_value: '796203638.17' }),
    row({ ...same, reporting_period: '2025-2026-Q3', _id: 9999, contract_value: '775731955.44' }),
  ];
  const { selected } = C.selectLargestContracts(rows, { size: 5 });
  assert.strictEqual(selected.length, 1);
  assert.strictEqual(selected[0]._value, 796203638.17);
});

test('the same procurement_id reported by two departments is kept as two contracts', () => {
  const rows = [
    row({ procurement_id: '4500043789', vendor_name: 'VANCOUVER SHIPYARDS CO LTD', owner_org: 'dfo-mpo', owner_org_title: 'Fisheries and Oceans Canada | Pêches et Océans Canada', contract_value: '601332130.14', original_value: '162787317.15' }),
    row({ procurement_id: '4500043789', vendor_name: 'VANCOUVER SHIPYARDS CO LTD', owner_org: 'dnd-mdn', owner_org_title: 'National Defence | Défense nationale', contract_value: '628908542.35', original_value: '13727425.15' }),
  ];
  assert.strictEqual(C.selectLargestContracts(rows).selected.length, 2);
});

test('the same procurement_id with two different vendors is kept as two contracts', () => {
  const rows = [row({ procurement_id: 'SHARED', vendor_name: 'Alpha Ltd', contract_value: '500' }), row({ procurement_id: 'SHARED', vendor_name: 'Beta Ltd', contract_value: '400' })];
  assert.strictEqual(C.selectLargestContracts(rows).selected.length, 2);
});

test('vendor-name punctuation differences do not defeat de-duplication', () => {
  const rows = [
    row({ procurement_id: 'X1', vendor_name: 'Irving Shipbuilding Inc.', reporting_period: '2025-2026-Q1', contract_value: '100' }),
    row({ procurement_id: 'X1', vendor_name: 'Irving Shipbuilding Inc', reporting_period: '2025-2026-Q3', contract_value: '120' }),
  ];
  const { selected } = C.selectLargestContracts(rows);
  assert.strictEqual(selected.length, 1);
  assert.strictEqual(selected[0]._value, 120);
});

test('the same contract under a differently formatted procurement_id is caught by the secondary key', () => {
  const base = { vendor_name: 'VANCOUVER SHIPYARDS CO LTD', original_value: '141780627.57', contract_date: '2021-01-29', delivery_date: '2026-03-31' };
  const rows = [
    row({ ...base, procurement_id: 'F7013-180001 (4500077040)', reporting_period: '2025-2026-Q1', contract_value: '800' }),
    row({ ...base, procurement_id: '4500077040', reporting_period: '2025-2026-Q3', contract_value: '900' }),
  ];
  const { selected, stats } = C.selectLargestContracts(rows);
  assert.strictEqual(selected.length, 1);
  assert.strictEqual(selected[0]._value, 900);
  assert.strictEqual(stats.duplicate_disclosure_rows_removed, 1);
});

test('parallel identical contracts in two DIFFERENT departments are never merged by the secondary key', () => {
  const base = { vendor_name: 'Acme Corp', original_value: '5000000', contract_date: '2024-01-01', delivery_date: '2029-01-01', contract_value: '5000000' };
  const rows = [
    row({ ...base, procurement_id: 'P-1', owner_org: 'dnd-mdn', owner_org_title: 'National Defence | Défense nationale' }),
    row({ ...base, procurement_id: 'P-2', owner_org: 'dfo-mpo', owner_org_title: 'Fisheries and Oceans Canada | Pêches et Océans Canada' }),
  ];
  assert.strictEqual(C.selectLargestContracts(rows).selected.length, 2);
});

test('different contracts that merely share a vendor are never merged', () => {
  const rows = Array.from({ length: 5 }, (_, i) => row({ procurement_id: `LM-${i}`, vendor_name: 'Lockheed Martin Canada Inc.', original_value: String(100 + i), contract_value: String(1000 + i) }));
  assert.strictEqual(C.selectLargestContracts(rows).selected.length, 5);
});

test('ties are broken deterministically (value, then more recent disclosure)', () => {
  const rows = [
    row({ procurement_id: 'T1', vendor_name: 'A', reporting_period: '2025-2026-Q1', contract_value: '500' }),
    row({ procurement_id: 'T2', vendor_name: 'B', reporting_period: '2025-2026-Q4', contract_value: '500' }),
  ];
  const a = C.selectLargestContracts(rows).selected.map((r) => r.procurement_id);
  const b = C.selectLargestContracts([...rows].reverse()).selected.map((r) => r.procurement_id);
  assert.deepStrictEqual(a, b);
  assert.strictEqual(a[0], 'T2');
});

// ─── contracts: documents ───────────────────────────────────────────────────
function sampleDocs(n = 100) {
  const rows = Array.from({ length: n + 30 }, (_, i) => row({ procurement_id: `S-${i}`, vendor_name: `Vendor ${i}`, contract_value: String(1_000_000 + i * 1000) }));
  const { selected } = C.selectLargestContracts(rows, { size: n });
  const meta = C.buildSelectionMeta(selected, '2025-2026', '2026-10-25T00:00:00.000Z');
  return { selected, meta, docs: selected.map((r) => C.buildContractDoc(r, meta)) };
}

test('document ids are zero-padded, unique, in rank order, and inside the UI id range', () => {
  const { docs } = sampleDocs();
  assert.strictEqual(docs[0].id, 'ca-fed-contract-001');
  assert.strictEqual(docs[99].id, 'ca-fed-contract-100');
  assert.strictEqual(new Set(docs.map((d) => d.id)).size, 100);
  assert.deepStrictEqual(docs.map((d) => d.id), [...docs.map((d) => d.id)].sort());
  docs.forEach((d) => assert.ok(d.id >= 'ca-fed-contract-001' && d.id <= 'ca-fed-contract-999'));
});

test('every document carries the selection scope, consistent with the documents themselves', () => {
  const { docs, meta } = sampleDocs();
  const sum = docs.reduce((s, d) => s + d.data.value, 0);
  assert.strictEqual(meta.selection_size, 100);
  assert.ok(Math.abs(meta.selection_total_value - sum) < 0.5, 'selection_total_value must equal the sum of the 100 values');
  docs.forEach((d) => {
    assert.strictEqual(d.data.selection_size, 100);
    assert.strictEqual(d.data.selection_total_value, meta.selection_total_value);
    assert.strictEqual(d.data.selection_fiscal_year, '2025-2026');
    assert.match(d.data.selection_label, /100 largest federal contracts disclosed in fiscal year 2025–26/);
  });
});

test('documents contain the fields the existing Contracts UI reads', () => {
  const { docs } = sampleDocs(3);
  const d = docs[0].data;
  assert.strictEqual(d.jurisdiction, 'CA');
  ['contractor_name', 'department', 'value', 'purpose', 'date', 'date_awarded', 'start_date', 'end_date', 'currency', 'contract_value_type', 'source_url', 'last_updated', 'rank'].forEach((k) => assert.ok(k in d, `missing ${k}`));
  assert.strictEqual(d.contract_value_type, 'total');
  assert.strictEqual(d.currency, 'CAD');
  assert.strictEqual(typeof d.value, 'number');
  assert.ok(!('status' in d), 'status is derived at view time, never stored');
});

test('document department is English-only and no undefined values reach Firestore', () => {
  const { docs } = sampleDocs(5);
  docs.forEach((d) => {
    assert.ok(!d.data.department.includes('|'));
    Object.entries(d.data).forEach(([k, v]) => assert.notStrictEqual(v, undefined, `${k} is undefined`));
  });
});

// ─── unemployment mapping ───────────────────────────────────────────────────
function cube(overrides = {}) {
  const names = [['Canada'], ['x', 'x', 'x', 'x', 'x', 'x', 'Unemployment rate'], ['Total - Gender'], ['15 years and over'], ['Estimate'], ['Seasonally adjusted']];
  const dims = names.map((arr, i) => ({ dimensionPositionId: i + 1, member: arr.map((n, j) => ({ memberId: j + 1, memberNameEn: overrides[i] && j === 0 && arr.length === 1 ? overrides[i] : n })) }));
  return { dimension: dims };
}

test('verifySeriesIdentity accepts the expected series', () => {
  const r = U.verifySeriesIdentity(cube());
  assert.strictEqual(r.ok, true, r.mismatches.join('; '));
  assert.deepStrictEqual(r.members, U.EXPECTED_MEMBERS);
});

test('verifySeriesIdentity rejects a coordinate that points at a different series', () => {
  const wrong = cube({ 5: 'Trend-cycle' });
  const r = U.verifySeriesIdentity(wrong);
  assert.strictEqual(r.ok, false);
  assert.match(r.mismatches[0], /Seasonally adjusted/);
  assert.strictEqual(U.verifySeriesIdentity({ dimension: [] }).ok, false);
  assert.strictEqual(U.verifySeriesIdentity(null).ok, false);
});

test('buildSocialStatDoc uses the latest period regardless of input order, and a chronological 12-point trend', () => {
  const pts = [];
  for (let m = 1; m <= 24; m += 1) pts.push({ period: `${m <= 12 ? 2025 : 2026}-${String(((m - 1) % 12) + 1).padStart(2, '0')}`, value: 5 + m / 10 });
  const shuffled = [...pts].sort(() => 0.5 - Math.random());
  const { id, data } = U.buildSocialStatDoc(shuffled, { nowIso: '2026-10-25T00:00:00.000Z' });
  assert.strictEqual(id, 'CA_unemploymentRate');
  assert.strictEqual(data.latest_period, '2026-12');
  assert.strictEqual(data.value, '7.4%');
  assert.strictEqual(data.updated, 'Dec 2026');
  assert.strictEqual(data.trend.length, 12);
  assert.deepStrictEqual(data.trend_periods, [...data.trend_periods].sort());
  assert.strictEqual(data.trend[11], 7.4);
});

test('buildSocialStatDoc matches the shape the Government Stats card reads', () => {
  const { data } = U.buildSocialStatDoc([{ period: '2026-08', value: 6.4 }, { period: '2026-09', value: 6.5 }]);
  assert.strictEqual(data.country, 'CA');
  assert.strictEqual(data.statName, 'unemploymentRate');
  assert.strictEqual(data.value, '6.5%');
  assert.ok(Array.isArray(data.trend) && data.trend.every((n) => typeof n === 'number'));
  assert.match(data.sourceUrl, /^https:\/\/www150\.statcan\.gc\.ca\//);
  assert.match(data.source, /Statistics Canada/);
  assert.ok(data.last_updated && !Number.isNaN(new Date(data.last_updated).getTime()));
});

test('the unemployment card text makes no hardcoded headcount claim', () => {
  const { data } = U.buildSocialStatDoc([{ period: '2026-09', value: 6.5 }]);
  assert.ok(!/million/i.test(data.sub), data.sub);
  const app = fs.readFileSync(path.join(__dirname, '..', 'src', 'App.js'), 'utf8');
  assert.ok(!app.includes('~1.5 million Canadians actively looking for work'));
});

test('buildSocialStatDoc ignores malformed points and refuses to build from nothing', () => {
  const { data } = U.buildSocialStatDoc([{ period: 'bad', value: 1 }, { period: '2026-09', value: NaN }, { period: '2026-08', value: 6.4 }]);
  assert.strictEqual(data.latest_period, '2026-08');
  assert.throws(() => U.buildSocialStatDoc([]));
  assert.throws(() => U.buildSocialStatDoc([{ period: '2026-09', value: NaN }]));
});

// ─── dry-run safety (behavioural) ───────────────────────────────────────────
test('the contracts script in default mode never loads firebase-admin or the admin-init module', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cv-fed-'));
  const rowsFile = path.join(tmp, 'rows.json');
  const rows = Array.from({ length: 160 }, (_, i) => row({ procurement_id: `D-${i}`, vendor_name: `Vendor ${i}`, contract_value: String(2_000_000 + i * 5000) }));
  fs.writeFileSync(rowsFile, JSON.stringify(rows));
  const guard = path.join(tmp, 'block-firebase.cjs');
  fs.writeFileSync(guard, `
    const Module = require('module');
    const orig = Module._load;
    Module._load = function (request, ...rest) {
      if (/firebase-admin|firebase-admin-init|@google-cloud\\/firestore/.test(request)) {
        throw new Error('FORBIDDEN in dry-run: tried to load ' + request);
      }
      return orig.call(this, request, ...rest);
    };
  `);
  const r = spawnSync(process.execPath, ['--require', guard, path.join(__dirname, 'canada-federal-contracts-write.cjs'), `--rows-file=${rowsFile}`], {
    encoding: 'utf8',
    env: { ...process.env, CV_REPORTS_DIR: tmp },
  });
  assert.strictEqual(r.status, 0, `exit ${r.status}\n${r.stdout}\n${r.stderr}`);
  assert.match(r.stdout, /\[dry-run\] No Firestore client will be created/);
  assert.ok(!/FORBIDDEN/.test(r.stdout + r.stderr));
  const report = JSON.parse(fs.readFileSync(path.join(tmp, 'canada-federal-contracts-dry-run-latest.json'), 'utf8'));
  assert.strictEqual(report.run_type, 'DRY_RUN');
  assert.strictEqual(report.documents.length, 100);
  assert.match(report.firestore_interaction, /none/);
  fs.rmSync(tmp, { recursive: true, force: true });
});

test('--write must be explicit: default arguments never enable writing; importing runs nothing', () => {
  const cs = require('./canada-federal-contracts-write.cjs');
  const us = require('./canada-federal-unemployment-write.cjs');
  assert.strictEqual(cs.parseArgs([]).write, false);
  assert.strictEqual(cs.parseArgs(['--rows-file=x']).write, false);
  assert.strictEqual(cs.parseArgs(['--write']).write, true);
  assert.strictEqual(us.parseArgs([]).write, false);
  assert.strictEqual(us.parseArgs(['--write']).write, true);
  assert.ok(!Object.keys(require.cache).some((k) => /firebase-admin-init/.test(k)), 'importing the scripts must not load firebase-admin-init');
});

console.log(`\n${passed} passed, ${failed} failed (zero Firestore, zero network)`);
if (failed > 0) process.exitCode = 1;
