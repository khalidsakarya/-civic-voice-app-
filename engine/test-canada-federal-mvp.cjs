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
// Tests are queued and run sequentially at the end so that async tests are really awaited
// (a rejected promise from an un-awaited async test would otherwise be silently "passed").
const queue = [];
function test(name, fn) {
  queue.push({ name, fn });
}
async function runQueue() {
  for (const { name, fn } of queue) {
    try {
      await fn();
      passed += 1;
      console.log(`  ok - ${name}`);
    } catch (err) {
      failed += 1;
      console.log(`  FAIL - ${name}\n    ${err.message}`);
    }
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
  assert.strictEqual(d.jurisdiction, 'CA-FED-SELECTION', "must not be 'CA' — the sibling engine deletes 'CA' documents it did not upload");
  assert.strictEqual(d.country, 'CA');
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

// ─── interaction with the sibling civic-voice-engine contracts pipeline ─────
//
// That engine's monthly uploader writes its own Canadian contracts
// (jurisdiction 'CA', ids "CA-<reference_number>") and DELETES every document
// whose jurisdiction matches one it uploads but is not in its new upload set.
// Our documents must therefore never carry one of its jurisdictions.
const ENGINE_CONTRACT_JURISDICTIONS = ['CA', 'US', 'UK', 'AU'];

test('selection documents never use a jurisdiction the sibling engine cleans up', () => {
  const { docs } = sampleDocs(100);
  assert.strictEqual(C.FED_SELECTION_JURISDICTION, 'CA-FED-SELECTION');
  assert.ok(!ENGINE_CONTRACT_JURISDICTIONS.includes(C.FED_SELECTION_JURISDICTION));
  docs.forEach((d) => {
    assert.ok(!ENGINE_CONTRACT_JURISDICTIONS.includes(d.data.jurisdiction), `jurisdiction ${d.data.jurisdiction} would be deleted by the engine`);
    assert.strictEqual(d.data.country, 'CA');
  });
});

test('engine-written Canadian document ids can never fall inside the UI page range', () => {
  // sanitizeId keeps case; engine ids are "CA-" + reference_number (e.g. C-2025-2026-Q1-01234).
  ['CA-C-2025-2026-Q1-01234', 'CA-C-2025-2026-Q4-00001', 'ca-c-2025-2026-q1-01234'].forEach((id) => {
    assert.ok(!(id >= 'ca-fed-contract-001' && id <= 'ca-fed-contract-999'), id);
  });
});

test('(if the sibling engine repo is present) its contracts cleanup is still keyed on the jurisdiction field', () => {
  const uploader = path.join(__dirname, '..', '..', 'civic-voice-engine', 'src', 'firebase', 'uploader.js');
  if (!fs.existsSync(uploader)) { console.log('    (skipped: sibling civic-voice-engine repo not found)'); return; }
  const src = fs.readFileSync(uploader, 'utf8');
  const i = src.indexOf('async function uploadGovernmentContracts');
  assert.ok(i >= 0, 'uploadGovernmentContracts not found — re-check the isolation reasoning');
  const body = src.slice(i, src.indexOf('async function uploadDepartmentExpenses', i));
  assert.match(body, /where\('jurisdiction', '==', jur\)/, 'cleanup is no longer keyed on jurisdiction — re-verify our documents are safe');
});

// ─── static guardrails on src/App.js (the Contracts page + its reads) ───────
const APP_SRC = fs.readFileSync(path.join(__dirname, '..', 'src', 'App.js'), 'utf8').replace(/\r\n/g, '\n');
const CONTRACTS_PAGE = (() => {
  const a = APP_SRC.indexOf('  const renderContracts = () => {');
  const b = APP_SRC.indexOf('  const renderContractDetail = () => {');
  assert.ok(a > 0 && b > a, 'renderContracts not found');
  return APP_SRC.slice(a, b);
})();

test('the Contracts page states what the figures are and are not', () => {
  [
    'Disclosed in FY',                       // contracts were disclosed in the fiscal year
    'Many were awarded earlier',
    'Values can cover multiple years',       // multi-year values
    'whole term, not one year',
    'Values include reported amendments',    // amendments included
    'A selected subset',                     // 100 are a subset
    'not every federal contract',
    'Not federal spending',                  // $96.05B is not spending
    'not what the government spent during FY',
    'Combined reported contract value, not federal spending in FY',
  ].forEach((s) => assert.ok(CONTRACTS_PAGE.includes(s), `page is missing: "${s}"`));
});

test('the Contracts page no longer presents a stored subset as a national total', () => {
  assert.ok(!CONTRACTS_PAGE.includes('Total Contracts'));
  assert.ok(!CONTRACTS_PAGE.includes('>Total Value<'));
  assert.ok(!CONTRACTS_PAGE.includes('liveContracts.CA'));
});

test('the only Canada contract read is the bounded, paginated one', () => {
  // Every getDocs() over government_contracts in App.js:
  const reads = [...APP_SRC.matchAll(/getDocs\(query\(collection\(db, ([^)]*)\)[^\n]*/g)]
    .filter((m) => /government_contracts|CA_FED_CONTRACTS_COLLECTION/.test(m[1]));
  assert.strictEqual(reads.length, 2, 'expected exactly the paginated CA read and the US/UK/AU read');
  const ca = reads.find((m) => /CA_FED_CONTRACTS_COLLECTION/.test(m[1]));
  const generic = reads.find((m) => /'government_contracts'/.test(m[1]));
  assert.ok(ca && generic);
  // CA read: built from constraints that include a limit of the page size and a document-id range.
  const loader = APP_SRC.slice(APP_SRC.indexOf('const loadCaFederalContracts = useCallback'), APP_SRC.indexOf('const loadCaFederalContracts = useCallback') + 1800);
  assert.match(loader, /where\(documentId\(\), '>=', CA_FED_CONTRACT_ID_FIRST\)/);
  assert.match(loader, /where\(documentId\(\), '<=', CA_FED_CONTRACT_ID_LAST\)/);
  assert.match(loader, /limit\(CA_FED_CONTRACTS_PAGE_SIZE\)/);
  assert.match(loader, /startAfter\(/);
  // The generic (US/UK/AU) read has no limit, so it must be unreachable for Canada: it returns early first.
  const gi = APP_SRC.indexOf("where('jurisdiction', '==', jurisdiction)");
  const effect = APP_SRC.slice(APP_SRC.lastIndexOf('useEffect(() => {', gi), gi);
  const earlyReturn = effect.indexOf("if (jurisdiction === 'CA') return;");
  assert.ok(earlyReturn > 0, 'the generic contracts effect must return early for CA');
  assert.ok(earlyReturn < effect.indexOf('setContractsFetchedJurisdictions'), 'the CA early-return must come before any fetch bookkeeping');
});

test('the Canada hub no longer prefetches or counts contracts', () => {
  assert.ok(!APP_SRC.includes('governmentContractsHubSubtitle(liveContracts.CA'));
  assert.ok(APP_SRC.includes('meta="Largest federal contracts"'));
  // US/UK/AU hub subtitles are untouched
  ['liveContracts.US', 'liveContracts.UK', 'liveContracts.AU'].forEach((s) => assert.ok(APP_SRC.includes(`governmentContractsHubSubtitle(${s}`), s));
});

// ─── unemployment write: ownership guard (stubbed db, no Firestore) ─────────
// The sibling engine is the ongoing scheduled owner of social_stats/CA_unemploymentRate, so this
// one-off script must never overwrite an existing document without an approval that is tied to
// that document's exact current state. These tests drive the real write function with a stub.
function stubDb({ queryDocs = [], target = null } = {}) {
  const calls = [];
  const db = {
    calls,
    collection(name) {
      calls.push(['collection', name]);
      const q = {
        where(f, op, v) { calls.push(['where', f, op, v]); return q; },
        async get() { calls.push(['query.get']); return { docs: queryDocs.map((id) => ({ id })) }; },
        doc(id) {
          return {
            async get() { calls.push(['doc.get', id]); return { exists: !!target && id === 'CA_unemploymentRate', data: () => target }; },
            async set(data, opts) { calls.push(['set', id, data, opts]); },
            async delete() { throw new Error('delete must never be called'); },
          };
        },
      };
      return q;
    },
  };
  return db;
}
const builtUnemp = () => U.buildSocialStatDoc([{ period: '2026-09', value: 6.5 }]);
const US = require('./canada-federal-unemployment-write.cjs');
// The document actually observed in production on 2026-10-25 (written by the engine's manual canonical upload).
const OBSERVED_ENGINE_DOC = {
  country: 'CA', statName: 'unemploymentRate', value: 6.9, updated: '2026-02',
  source: 'Statistics Canada — Labour Force Survey, table 14-10-0017-01',
  sourceUrl: 'https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=1410001701',
  last_updated: '2026-03-23T23:49:58.644Z',
};
const kinds = (db) => db.calls.map((c) => c[0]);

test('guard: with nothing existing, it reads the duplicates and the target BEFORE writing, then merge-writes only the target', async () => {
  const db = stubDb();
  const r = await US.writeFederalUnemployment(db, builtUnemp());
  assert.strictEqual(r.status, 'WRITTEN');
  assert.strictEqual(r.overwroteApprovedDocument, false);
  const k = kinds(db);
  assert.ok(k.indexOf('query.get') >= 0 && k.indexOf('doc.get') > k.indexOf('query.get') && k.indexOf('set') > k.indexOf('doc.get'), `order was ${k.join(' > ')}`);
  assert.deepStrictEqual(db.calls.filter((c) => c[0] === 'where').map((c) => c.slice(1)), [['country', '==', 'CA'], ['statName', '==', 'unemploymentRate']]);
  const sets = db.calls.filter((c) => c[0] === 'set');
  assert.strictEqual(sets.length, 1, 'exactly one document may be written');
  assert.strictEqual(sets[0][1], 'CA_unemploymentRate');
  assert.deepStrictEqual(sets[0][3], { merge: true }, 'merge preserves fields this script does not define');
});

test('guard: a duplicate country/statName document under another id blocks the write, with NO override', async () => {
  const db = stubDb({ queryDocs: ['legacy_ca_unemployment'] });
  const r = await US.writeFederalUnemployment(db, builtUnemp());
  assert.strictEqual(r.status, 'REFUSED_DUPLICATE');
  assert.deepStrictEqual(r.otherDocuments, ['legacy_ca_unemployment']);
  assert.ok(!kinds(db).includes('set'));
  // even a perfectly valid-looking approval token cannot bypass it
  const db2 = stubDb({ queryDocs: ['legacy_ca_unemployment'], target: OBSERVED_ENGINE_DOC });
  const fp = US.fingerprintExistingDocument('CA_unemploymentRate', OBSERVED_ENGINE_DOC);
  const r2 = await US.writeFederalUnemployment(db2, builtUnemp(), { approveOverwrite: fp });
  assert.strictEqual(r2.status, 'REFUSED_DUPLICATE');
  assert.ok(!kinds(db2).includes('set'));
});

test('guard: an EXISTING target document (e.g. the engine\'s) is refused without approval, and the refusal says how to approve THIS state', async () => {
  const db = stubDb({ queryDocs: ['CA_unemploymentRate'], target: OBSERVED_ENGINE_DOC });
  const r = await US.writeFederalUnemployment(db, builtUnemp());
  assert.strictEqual(r.status, 'REFUSED_EXISTING');
  assert.ok(!kinds(db).includes('set'), 'nothing may be written');
  assert.match(r.fingerprint, /^[0-9a-f]{16}$/);
  assert.strictEqual(r.existing.value, 6.9);
  assert.strictEqual(r.existing.updated, '2026-02');
  assert.ok(r.reason.includes(`--approve-overwrite=${r.fingerprint}`));
  assert.ok(r.reason.includes('No approval was supplied'));
});

test('guard: an approval for a DIFFERENT or stale state of the document is refused', async () => {
  const db = stubDb({ queryDocs: ['CA_unemploymentRate'], target: OBSERVED_ENGINE_DOC });
  const stale = US.fingerprintExistingDocument('CA_unemploymentRate', { ...OBSERVED_ENGINE_DOC, value: 6.7 });
  const r = await US.writeFederalUnemployment(db, builtUnemp(), { approveOverwrite: stale });
  assert.strictEqual(r.status, 'REFUSED_EXISTING');
  assert.ok(!kinds(db).includes('set'));
  assert.match(r.reason, /does not match its current state/);
  assert.strictEqual((await US.writeFederalUnemployment(stubDb({ target: OBSERVED_ENGINE_DOC }), builtUnemp(), { approveOverwrite: 'not-a-token' })).status, 'REFUSED_EXISTING');
});

test('guard: an existing document that lacks the country/statName fields is still found (direct read of the target)', async () => {
  // The query returns nothing (the document has no matching fields) but the target exists.
  const db = stubDb({ queryDocs: [], target: { value: 6.9, source: 'x' } });
  const r = await US.writeFederalUnemployment(db, builtUnemp());
  assert.strictEqual(r.status, 'REFUSED_EXISTING');
  assert.ok(!kinds(db).includes('set'));
});

test('guard: the exact fingerprint of the reviewed document approves the write; fields not defined by the script are preserved (merge)', async () => {
  const fp = US.fingerprintExistingDocument('CA_unemploymentRate', OBSERVED_ENGINE_DOC);
  const db = stubDb({ queryDocs: ['CA_unemploymentRate'], target: OBSERVED_ENGINE_DOC });
  const r = await US.writeFederalUnemployment(db, builtUnemp(), { approveOverwrite: fp });
  assert.strictEqual(r.status, 'WRITTEN');
  assert.strictEqual(r.overwroteApprovedDocument, true);
  const set = db.calls.find((c) => c[0] === 'set');
  assert.deepStrictEqual(set[3], { merge: true });
  // the write only carries this script's own fields; it never nulls or deletes anything else
  Object.values(set[2]).forEach((v) => assert.notStrictEqual(v, undefined));
  assert.ok(!Object.keys(set[2]).some((k) => !['country', 'statName', 'value', 'updated', 'trend', 'trend_periods', 'sub', 'source', 'sourceUrl', 'table', 'coordinate', 'verified_series', 'latest_period', 'last_updated', 'statcan_release_time'].includes(k)));
  assert.ok(!kinds(db).includes('delete'));
});

test('fingerprint: stable for the same state, different when anything identifying changes, tolerant of Firestore timestamps', () => {
  const f = (d) => US.fingerprintExistingDocument('CA_unemploymentRate', d);
  assert.strictEqual(f(OBSERVED_ENGINE_DOC), f({ ...OBSERVED_ENGINE_DOC }));
  ['value', 'updated', 'source', 'sourceUrl', 'last_updated'].forEach((k) => assert.notStrictEqual(f({ ...OBSERVED_ENGINE_DOC, [k]: 'changed' }), f(OBSERVED_ENGINE_DOC), k));
  assert.notStrictEqual(US.fingerprintExistingDocument('OTHER', OBSERVED_ENGINE_DOC), f(OBSERVED_ENGINE_DOC));
  const ts = { toDate: () => new Date('2026-03-23T23:49:58.644Z') };
  assert.strictEqual(f({ ...OBSERVED_ENGINE_DOC, last_updated: ts }), f(OBSERVED_ENGINE_DOC));
  // a numeric 6.9 and the string "6.9" are different stored states
  assert.notStrictEqual(f({ ...OBSERVED_ENGINE_DOC, value: '6.9' }), f(OBSERVED_ENGINE_DOC));
});

test('arguments: approval is a 16-hex fingerprint, never a boolean flag; the old duplicate flag is gone', () => {
  assert.strictEqual(US.parseArgs([]).approveOverwrite, null);
  assert.strictEqual(US.parseArgs(['--write']).approveOverwrite, null);
  assert.strictEqual(US.parseArgs(['--write', '--approve-overwrite']).approveOverwrite, null);
  assert.strictEqual(US.parseArgs(['--write', '--approve-overwrite=true']).approveOverwrite, null);
  assert.strictEqual(US.parseArgs(['--write', '--approve-overwrite=1234']).approveOverwrite, null);
  assert.strictEqual(US.parseArgs(['--write', '--approve-overwrite=0123456789ABCDEF']).approveOverwrite, '0123456789abcdef');
  assert.strictEqual(US.parseArgs(['--allow-duplicate-stat']).removedDuplicateFlag, true);
  assert.ok(!('allowDuplicateStat' in US.parseArgs([])));
});

test('script: the removed --allow-duplicate-stat flag fails loudly before any network or Firestore access', () => {
  const r = spawnSync(process.execPath, [path.join(__dirname, 'canada-federal-unemployment-write.cjs'), '--allow-duplicate-stat'], { encoding: 'utf8' });
  assert.notStrictEqual(r.status, 0);
  assert.match(r.stderr + r.stdout, /--allow-duplicate-stat was removed/);
});

// ─── consistency with the sibling engine's implementation ───────────────────
test('(if the sibling engine repo is present) app and engine build the identical Canada unemployment document', () => {
  const engineLib = path.join(__dirname, '..', '..', 'civic-voice-engine', 'src', 'ingestion', 'caUnemploymentMonthly.js');
  if (!fs.existsSync(engineLib)) { console.log('    (skipped: civic-voice-engine not found)'); return; }
  const E = require(engineLib);
  ['PRODUCT_ID', 'TABLE_ID', 'COORDINATE', 'SOURCE_URL', 'SOURCE_LABEL', 'STAT_NAME', 'COUNTRY', 'DOC_ID', 'TREND_POINTS'].forEach((k) => assert.strictEqual(E[k], U[k], `constant ${k} differs`));
  assert.deepStrictEqual(E.EXPECTED_MEMBERS, U.EXPECTED_MEMBERS);
  const pts = [];
  for (let i = 0; i < 24; i += 1) pts.push({ period: `${2024 + Math.floor((9 + i) / 12)}-${String(((9 + i) % 12) + 1).padStart(2, '0')}`, value: 6 + (i % 7) / 10 });
  const a = U.buildSocialStatDoc(pts, { nowIso: '2026-10-25T12:00:00.000Z', releaseTime: '2026-10-09T08:30' });
  const e = E.buildSocialStatDoc(pts, { nowIso: '2026-10-25T12:00:00.000Z', releaseTime: '2026-10-09T08:30' });
  assert.strictEqual(a.id, e.id);
  assert.deepStrictEqual(a.data, e.data);
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

// ─── contracts: vendor-name-variant dedupe (stage 3) ────────────────────────
// The verified case: CBSA procurement 4706465038 was disclosed for years as "Deloitte Inc" and, in
// 2025-26 Q4, as "Deloitte LLP". Each cumulative value is the previous one plus the amendment.
const deloitte = (o) => row({
  procurement_id: '4706465038',
  owner_org: 'cbsa-asfc',
  owner_org_title: 'Canada Border Services Agency | Agence des services frontaliers du Canada',
  original_value: '23476702.59',
  contract_date: '2018-02-07',
  ...o,
});

test('stage 3: the same contract re-reported under a legal-form variant of the vendor name is counted once (latest disclosure kept)', () => {
  const rows = [
    deloitte({ vendor_name: 'Deloitte Inc', reporting_period: '2025-2026-Q1', contract_value: '402355778.47', delivery_date: '2026-02-06' }),
    deloitte({ vendor_name: 'Deloitte LLP', reporting_period: '2025-2026-Q4', contract_value: '454815463.47', delivery_date: '2027-02-06' }),
  ];
  const { selected, stats } = C.selectLargestContracts(rows);
  assert.strictEqual(selected.length, 1);
  assert.strictEqual(selected[0].vendor_name, 'Deloitte LLP');
  assert.strictEqual(selected[0]._value, 454815463.47);
  assert.strictEqual(stats.vendor_name_variant_duplicates_removed, 1);
  assert.strictEqual(stats.selected_total_value, 454815463.47);
});

test('stage 3: the order the rows arrive in never changes which disclosure is kept', () => {
  const rows = [
    deloitte({ vendor_name: 'Deloitte Inc', reporting_period: '2025-2026-Q1', contract_value: '402355778.47' }),
    deloitte({ vendor_name: 'Deloitte LLP', reporting_period: '2025-2026-Q4', contract_value: '454815463.47' }),
  ];
  const a = C.selectLargestContracts(rows).selected.map((r) => r.vendor_name);
  const b = C.selectLargestContracts([...rows].reverse()).selected.map((r) => r.vendor_name);
  assert.deepStrictEqual(a, ['Deloitte LLP']);
  assert.deepStrictEqual(b, a);
});

test('stage 3 is narrow: DIFFERENT companies under one procurement id (multi-vendor award) are never merged', () => {
  const rows = [
    deloitte({ vendor_name: 'Deloitte LLP', reporting_period: '2025-2026-Q1', contract_value: '400' }),
    deloitte({ vendor_name: 'Accenture Inc', reporting_period: '2025-2026-Q4', contract_value: '300' }),
    deloitte({ vendor_name: 'IBM Canada Ltd', reporting_period: '2025-2026-Q3', contract_value: '200' }),
  ];
  assert.strictEqual(C.selectLargestContracts(rows).selected.length, 3);
});

test('stage 3 is narrow: two rows in the SAME reporting period are simultaneous disclosures and are kept', () => {
  const rows = [
    deloitte({ vendor_name: 'Deloitte Inc', reporting_period: '2025-2026-Q4', contract_value: '400' }),
    deloitte({ vendor_name: 'Deloitte LLP', reporting_period: '2025-2026-Q4', contract_value: '500' }),
  ];
  assert.strictEqual(C.selectLargestContracts(rows).selected.length, 2);
});

test('stage 3 is narrow: a different department, original value, award date or procurement id is never merged', () => {
  const mk = (over) => [
    deloitte({ vendor_name: 'Deloitte Inc', reporting_period: '2025-2026-Q1', contract_value: '400' }),
    deloitte({ vendor_name: 'Deloitte LLP', reporting_period: '2025-2026-Q4', contract_value: '500', ...over }),
  ];
  assert.strictEqual(C.selectLargestContracts(mk({ owner_org: 'dnd-mdn', owner_org_title: 'National Defence | Défense nationale' })).selected.length, 2);
  assert.strictEqual(C.selectLargestContracts(mk({ original_value: '23476702.60' })).selected.length, 2);
  assert.strictEqual(C.selectLargestContracts(mk({ contract_date: '2018-02-08' })).selected.length, 2);
  assert.strictEqual(C.selectLargestContracts(mk({ procurement_id: '4706465039' })).selected.length, 2);
});

test('stage 3 is narrow: a vendor name with no distinguishing words ("Canada Inc") never merges anything', () => {
  assert.strictEqual(C.vendorCore('Canada Inc'), '');
  assert.strictEqual(C.vendorCore('Deloitte LLP'), 'deloitte');
  assert.strictEqual(C.vendorCore('DELOITTE Inc.'), 'deloitte');
  const rows = [
    deloitte({ vendor_name: 'Canada Inc', reporting_period: '2025-2026-Q1', contract_value: '400' }),
    deloitte({ vendor_name: 'Canada Ltd', reporting_period: '2025-2026-Q4', contract_value: '500' }),
  ];
  assert.strictEqual(C.selectLargestContracts(rows).selected.length, 2);
});

test('stage 3 is narrow: rows without an original value or award date are never merged', () => {
  const rows = [
    deloitte({ vendor_name: 'Deloitte Inc', reporting_period: '2025-2026-Q1', contract_value: '400', original_value: null }),
    deloitte({ vendor_name: 'Deloitte LLP', reporting_period: '2025-2026-Q4', contract_value: '500', original_value: null }),
  ];
  assert.strictEqual(C.selectLargestContracts(rows).selected.length, 2);
});

test('stage 3 leaves the selection of 100 distinct contracts, and the other stages\' results, unchanged', () => {
  const rows = Array.from({ length: 160 }, (_, i) => row({ procurement_id: `S3-${i}`, vendor_name: `Vendor ${i}`, original_value: String(1000 + i), contract_value: String(2_000_000 + i * 5000) }));
  const { selected, stats } = C.selectLargestContracts(rows);
  assert.strictEqual(selected.length, 100);
  assert.strictEqual(stats.vendor_name_variant_duplicates_removed, 0);
  assert.strictEqual(new Set(selected.map((r) => r.procurement_id)).size, 100);
});

// ─── contracts: the --write path (stub database; zero Firestore) ─────────────
const W = require('./canada-federal-contracts-write.cjs');
const GUARD = require('./lib/firestore-project-guard.cjs');

function approvedDocs() {
  const rows = Array.from({ length: 120 }, (_, i) => row({ procurement_id: `W-${i}`, vendor_name: `Vendor ${i}`, original_value: String(500 + i), contract_value: String(3_000_000 + i * 7000) }));
  const { selected } = C.selectLargestContracts(rows);
  const meta = C.buildSelectionMeta(selected, '2025-2026', '2026-10-25T00:00:00.000Z');
  return selected.map((r) => C.buildContractDoc(r, meta));
}

/** Records every operation. `existing` maps document id -> stored data. */
function recordingDb(existing = {}) {
  const ops = [];
  const refFor = (name, id) => ({ id, path: `${name}/${id}` });
  const db = {
    ops,
    collection: (name) => ({
      doc: (id) => refFor(name, id),
      where: () => { ops.push(['QUERY where']); throw new Error('collection queries are forbidden'); },
      get: () => { ops.push(['QUERY get']); throw new Error('collection queries are forbidden'); },
      count: () => { ops.push(['QUERY count']); throw new Error('collection queries are forbidden'); },
      add: () => { ops.push(['add']); throw new Error('add is forbidden'); },
    }),
    getAll: async (...refs) => {
      ops.push(['getAll', refs.map((r) => r.path)]);
      return refs.map((r) => ({ id: r.id, exists: r.id in existing, data: () => existing[r.id] }));
    },
    batch: () => {
      const staged = [];
      return {
        set: (ref, data, opts) => { ops.push(['set', ref.path, opts]); staged.push([ref, data]); },
        update: () => { ops.push(['update']); throw new Error('update is forbidden'); },
        delete: () => { ops.push(['delete']); throw new Error('delete is forbidden'); },
        commit: async () => { ops.push(['commit', staged.length]); },
      };
    },
    delete: () => { ops.push(['delete']); throw new Error('delete is forbidden'); },
  };
  return db;
}
const okProject = async () => 'civic-voice-5ea94';

test('write: exactly 100 set() calls, one per approved id, in one committed batch', async () => {
  const docs = approvedDocs();
  const db = recordingDb();
  const r = await W.writeContracts(db, docs, { verifyProject: okProject });
  const sets = db.ops.filter((o) => o[0] === 'set');
  assert.strictEqual(sets.length, 100);
  assert.deepStrictEqual(sets.map((o) => o[1]), W.APPROVED_IDS.map((id) => `government_contracts/${id}`));
  assert.strictEqual(W.APPROVED_IDS[0], 'ca-fed-contract-001');
  assert.strictEqual(W.APPROVED_IDS[99], 'ca-fed-contract-100');
  assert.deepStrictEqual(db.ops.filter((o) => o[0] === 'commit'), [['commit', 100]]);
  assert.strictEqual(r.documents, 100);
  assert.strictEqual(r.newly_created, 100);
  assert.strictEqual(r.projectId, 'civic-voice-5ea94');
});

test('write: zero collection queries, zero deletes, zero updates, zero adds; one batched get of exactly the 100 approved ids', async () => {
  const db = recordingDb();
  await W.writeContracts(db, approvedDocs(), { verifyProject: okProject });
  const kinds = db.ops.map((o) => o[0]);
  assert.ok(!kinds.some((k) => /QUERY|delete|update|add/.test(k)), kinds.join(','));
  const gets = db.ops.filter((o) => o[0] === 'getAll');
  assert.strictEqual(gets.length, 1);
  assert.deepStrictEqual(gets[0][1], W.APPROVED_IDS.map((id) => `government_contracts/${id}`));
  assert.deepStrictEqual([...new Set(kinds)].sort(), ['commit', 'getAll', 'set']);
});

test('write: it replaces whole documents (no merge) and touches nothing but government_contracts/ca-fed-contract-NNN', async () => {
  const db = recordingDb();
  await W.writeContracts(db, approvedDocs(), { verifyProject: okProject });
  db.ops.filter((o) => o[0] === 'set').forEach((o) => {
    assert.match(o[1], /^government_contracts\/ca-fed-contract-\d{3}$/);
    assert.strictEqual(o[2], undefined, 'no merge option: a rerun replaces the same 100 documents');
  });
});

test('write: rerunning is safe — existing selection documents are replaced, never duplicated', async () => {
  const docs = approvedDocs();
  const existing = Object.fromEntries(docs.map((d) => [d.id, { jurisdiction: 'CA-FED-SELECTION', value: 1 }]));
  const db = recordingDb(existing);
  const r = await W.writeContracts(db, docs, { verifyProject: okProject });
  assert.strictEqual(r.existing_selection_documents_replaced, 100);
  assert.strictEqual(r.newly_created, 0);
  assert.strictEqual(db.ops.filter((o) => o[0] === 'set').length, 100);
});

test('write: an UNRELATED document already occupying an approved id aborts the run before ANY write', async () => {
  const docs = approvedDocs();
  for (const stray of [{ jurisdiction: 'CA', contractor_name: 'legacy' }, { contractor_name: 'no jurisdiction' }, { jurisdiction: 'US' }]) {
    const db = recordingDb({ 'ca-fed-contract-007': stray });
    await assert.rejects(() => W.writeContracts(db, docs, { verifyProject: okProject }), /Refusing to overwrite 1 existing document\(s\) that are not federal-selection documents \(ca-fed-contract-007\)/);
    assert.ok(!db.ops.some((o) => o[0] === 'set' || o[0] === 'commit'), 'nothing may be written');
  }
});

test('write: a wrong or unknown Firebase project aborts before any read or write', async () => {
  const db = recordingDb();
  await assert.rejects(() => W.writeContracts(db, approvedDocs(), { verifyProject: async () => { throw new Error('credential is bound to "other"'); } }), /credential is bound/);
  await assert.rejects(() => W.writeContracts(db, approvedDocs(), {}), /no project verifier/);
  assert.deepStrictEqual(db.ops, [], 'no Firestore operation of any kind');
});

test('write: anything other than the approved 100 documents aborts before any I/O', async () => {
  const good = approvedDocs();
  const bad = [
    good.slice(0, 99),
    [...good, { ...good[0], id: 'ca-fed-contract-101' }],
    good.map((d, i) => (i === 5 ? { ...d, id: 'ca-fed-contract-006x' } : d)),
    [good[1], good[0], ...good.slice(2)],
    good.map((d, i) => (i === 3 ? { ...d, data: { ...d.data, jurisdiction: 'CA' } } : d)),
    good.map((d, i) => (i === 3 ? { ...d, data: { ...d.data, country: 'US' } } : d)),
    good.map((d, i) => (i === 3 ? { id: 'CA-C-2025-2026-Q1-00001', data: d.data } : d)),
    null,
  ];
  for (const docs of bad) {
    const db = recordingDb();
    await assert.rejects(() => W.writeContracts(db, docs, { verifyProject: okProject }), /Refusing to write/);
    assert.deepStrictEqual(db.ops, []);
  }
});

test('write: the legacy Canadian contracts are never queried, counted or listed (static check of the write script)', () => {
  const src = fs.readFileSync(path.join(__dirname, 'canada-federal-contracts-write.cjs'), 'utf8');
  const code = src.split('\n').filter((l) => !/^\s*(\*|\/\/|\/\*)/.test(l)).join('\n');
  assert.ok(!/\.where\(|\.count\(|\.orderBy\(|\.limit\(|\.listDocuments\(|\.delete\(|\.update\(|\.add\(|runTransaction|collectionGroup/.test(code), 'no query, count, delete, update or add anywhere in the write script');
  assert.ok(!/'CA'\)/.test(code.replace(/country[^\n]*'CA'/g, '')), 'the script never refers to the legacy jurisdiction value CA in a query');
  assert.ok(!/legacy/i.test(code.replace(/\/\/.*$/gm, '')), 'no legacy-count code remains');
});

test('project guard: only civic-voice-5ea94 passes; every conflicting hint is refused', () => {
  const ok = { credential: 'civic-voice-5ea94', appOptions: 'civic-voice-5ea94', env: {} };
  assert.strictEqual(GUARD.assertExpectedProjectIds(ok), 'civic-voice-5ea94');
  assert.throws(() => GUARD.assertExpectedProjectIds({ ...ok, credential: 'other' }), /expected project "civic-voice-5ea94"/);
  assert.throws(() => GUARD.assertExpectedProjectIds({ ...ok, credential: null }), /could not determine/);
  assert.throws(() => GUARD.assertExpectedProjectIds({ ...ok, appOptions: 'other' }), /app options/);
  assert.throws(() => GUARD.assertExpectedProjectIds({ ...ok, env: { GOOGLE_CLOUD_PROJECT: 'other' } }), /GOOGLE_CLOUD_PROJECT/);
  assert.throws(() => GUARD.assertExpectedProjectIds({ ...ok, env: { GCLOUD_PROJECT: 'other' } }), /GCLOUD_PROJECT/);
});

test('project guard: reads the credential locally and honours environment hints', async () => {
  const admin = { app: () => ({ options: { credential: { getProjectId: async () => 'civic-voice-5ea94' }, projectId: 'civic-voice-5ea94' } }) };
  assert.strictEqual(await GUARD.verifyFirestoreProject({ admin, env: {} }), 'civic-voice-5ea94');
  await assert.rejects(() => GUARD.verifyFirestoreProject({ admin, env: { GCLOUD_PROJECT: 'x' } }), /GCLOUD_PROJECT/);
  const wrong = { app: () => ({ options: { credential: { getProjectId: async () => 'other-project' }, projectId: 'civic-voice-5ea94' } }) };
  await assert.rejects(() => GUARD.verifyFirestoreProject({ admin: wrong, env: {} }), /credential is bound to "other-project"/);
});

runQueue().then(() => {
  console.log(`\n${passed} passed, ${failed} failed (zero Firestore, zero network)`);
  if (failed > 0) process.exitCode = 1;
});
