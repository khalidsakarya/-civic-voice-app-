import React, { useCallback, useMemo, useState } from 'react';
import {
  collection,
  getDocs,
  limit as limitFn,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../firebase';
import { EXECUTIVE_ACTIONS_COLLECTION } from '../constants/firestoreCollections';
import { FEDERAL_REGISTER_SOURCE_NAME } from '../constants/executiveOrderDocumentTypes';
import { X, Database } from 'lucide-react';

/**
 * Read-only Firestore inspector for local / flagged debug builds.
 * Uses the web SDK only (same as the app) — no Admin credentials.
 *
 * Visibility:
 *   - NODE_ENV === 'development', OR
 *   - REACT_APP_FIRESTORE_DEBUG === 'true', OR
 *   - REACT_APP_EXECUTIVE_ACTIONS_DEBUG === 'true' (backward compatible)
 */
export const FIRESTORE_DEBUG_ENABLED =
  process.env.NODE_ENV === 'development' ||
  process.env.REACT_APP_FIRESTORE_DEBUG === 'true' ||
  process.env.REACT_APP_EXECUTIVE_ACTIONS_DEBUG === 'true';

const MAX_FETCH = 1000;
const DEFAULT_LIMIT = 300;

/** Preset: bills + US — distinct stats + law-keyword scan (read-only) */
const BILLS_US_PRESET = 'bills_us';
const BILLS_STATUS_LIKE_FIELDS = [
  'status',
  'latestAction',
  'latest_action',
  'action',
  'billStatus',
];
const BILLS_DEBUG_FIELDS = [
  'status',
  'latestAction',
  'latest_action',
  'action',
  'billStatus',
  'lawNumber',
  'publicLawNumber',
  'congress',
  'billType',
  'billNumber',
  'source',
  'source_url',
];

const LAW_SIGNAL_PATTERNS = [
  { label: 'signed by president', re: /signed\s+by\s+(the\s+)?president/i },
  { label: 'became law', re: /\bbecame\s+law\b/i },
  { label: 'public law', re: /\bpublic\s+law\b/i },
  { label: 'enacted', re: /\benacted\b/i },
  { label: 'Public Law No.', re: /public\s+law\s+no\.?/i },
];

function truncateCell(val, max = 120) {
  const s =
    val === undefined || val === null
      ? ''
      : typeof val === 'object'
        ? JSON.stringify(val)
        : String(val);
  if (s.length <= max) return s;
  return `${s.slice(0, max)}…`;
}

/** Text used to detect law signals (status / latest action / title) */
function billLawSignalBlob(data) {
  const chunks = [
    data.status,
    data.latestAction,
    data.latest_action,
    data.latestActionText,
    data.latest_action_text,
    data.title,
    data.action,
    data.billStatus,
  ];
  return chunks.filter((x) => x != null && x !== '').map((x) => String(x)).join(' \n ');
}

function billLawMatchesForRow(data) {
  const blob = billLawSignalBlob(data);
  const hits = [];
  for (const { label, re } of LAW_SIGNAL_PATTERNS) {
    if (re.test(blob)) hits.push(label);
  }
  return hits;
}

/** Resolve debug column: exact path first, then common alternate field names. */
function pickBillDebugValue(data, field) {
  const v0 = getByPath(data, field);
  if (v0 !== undefined && v0 !== null && v0 !== '') return v0;
  const fallbacks = {
    source_url: ['sourceUrl', 'sourceURL'],
    lawNumber: ['law_number', 'lawNo'],
    publicLawNumber: ['public_law_number', 'publicLawNo'],
    billType: ['bill_type'],
    billNumber: ['bill_number', 'number'],
    source: ['sourceName', 'source_name'],
  };
  const alts = fallbacks[field];
  if (alts) {
    for (const a of alts) {
      const v = getByPath(data, a);
      if (v !== undefined && v !== null && v !== '') return v;
    }
  }
  return v0;
}

/** Known collections from docs/DATA_CONTRACTS.md — free text still allowed */
const COLLECTION_PRESETS = [
  EXECUTIVE_ACTIONS_COLLECTION,
  'federal_departments',
  'department_expenses',
  'budget_data',
  'department_heads',
  'government_contracts',
  'vote_counts',
  'foreign_aid',
  'flagged_expenses',
  'supreme_court_cases',
  'supreme_court_justices',
  'member_stock_trades',
  'member_lobbying',
  'lobbying_correlations',
  'audit_findings',
  'bills',
];

function parseScalar(raw) {
  const s = String(raw ?? '').trim();
  if (s === 'true') return true;
  if (s === 'false') return false;
  if (s === '') return '';
  if (/^-?\d+(\.\d+)?$/.test(s)) return Number(s);
  try {
    const j = JSON.parse(s);
    if (typeof j === 'object' && j !== null && !Array.isArray(j)) return s;
    return j;
  } catch {
    return s;
  }
}

function getByPath(obj, path) {
  if (path == null || String(path).trim() === '') return undefined;
  const parts = String(path).split('.').filter(Boolean);
  let cur = obj;
  for (const p of parts) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = cur[p];
  }
  return cur;
}

function distinctKey(val) {
  if (val === undefined) return '(undefined)';
  if (val === null) return '(null)';
  if (typeof val === 'object') {
    try {
      return JSON.stringify(val);
    } catch {
      return String(val);
    }
  }
  return String(val);
}

function aggregateDistinct(rows, fieldPath) {
  if (!fieldPath.trim()) return [];
  const counts = new Map();
  for (const { data } of rows) {
    const v = getByPath(data, fieldPath.trim());
    const k = distinctKey(v);
    counts.set(k, (counts.get(k) || 0) + 1);
  }
  return [...counts.entries()]
    .map(([valueLabel, count]) => ({ valueLabel, count }))
    .sort((a, b) => b.count - a.count);
}

export function FirestoreDebugPanel() {
  const [open, setOpen] = useState(false);
  const [collectionName, setCollectionName] = useState(EXECUTIVE_ACTIONS_COLLECTION);
  const [fetchCap, setFetchCap] = useState(DEFAULT_LIMIT);
  /** equality filters: field + raw string value */
  const [filters, setFilters] = useState([
    { field: 'jurisdiction', value: 'US' },
    { field: 'source_name', value: FEDERAL_REGISTER_SOURCE_NAME },
  ]);
  const [distinctField, setDistinctField] = useState('type');
  /** Set when using “bills (US)” preset — enables distinct + keyword audit UI */
  const [presetTag, setPresetTag] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [warning, setWarning] = useState(null);
  const [rows, setRows] = useState([]);

  const distinctAgg = useMemo(
    () => aggregateDistinct(rows, distinctField),
    [rows, distinctField],
  );

  const billsStatusDistincts = useMemo(() => {
    if (presetTag !== BILLS_US_PRESET || rows.length === 0) return null;
    const out = {};
    for (const field of BILLS_STATUS_LIKE_FIELDS) {
      out[field] = aggregateDistinct(rows, field);
    }
    return out;
  }, [rows, presetTag]);

  const billsLawHits = useMemo(() => {
    if (presetTag !== BILLS_US_PRESET || rows.length === 0) return [];
    return rows
      .map(({ id, data }) => ({
        id,
        data,
        hits: billLawMatchesForRow(data),
      }))
      .filter((r) => r.hits.length > 0);
  }, [rows, presetTag]);

  const runQuery = useCallback(async () => {
    const name = collectionName.trim();
    if (!name) {
      setError('Enter a collection name.');
      return;
    }
    const cap = Math.min(Math.max(1, parseInt(String(fetchCap), 10) || DEFAULT_LIMIT), MAX_FETCH);

    setLoading(true);
    setError(null);
    setWarning(null);
    setRows([]);

    const activeFilters = filters.filter((f) => f.field.trim() && String(f.value).trim() !== '');

    try {
      let colRef = collection(db, name);
      const constraints = activeFilters.map((f) =>
        where(f.field.trim(), '==', parseScalar(f.value)),
      );
      constraints.push(limitFn(cap));
      const qy = query(colRef, ...constraints);
      const snap = await getDocs(qy);
      const out = [];
      snap.forEach((d) => out.push({ id: d.id, data: d.data() || {} }));
      setRows(out);
      if (out.length >= cap) {
        setWarning(
          `Returned ${out.length} documents (at limit ${cap}). Distinct stats are for this sample only, not the full collection.`,
        );
      }
    } catch (err) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }, [collectionName, fetchCap, filters]);

  const addFilterRow = () => {
    setFilters((f) => [...f, { field: '', value: '' }]);
  };

  const updateFilter = (i, key, v) => {
    setFilters((f) => f.map((row, j) => (j === i ? { ...row, [key]: v } : row)));
  };

  const removeFilter = (i) => {
    setFilters((f) => f.filter((_, j) => j !== i));
  };

  const applyPreset = (id) => {
    if (id === 'eo_fr') {
      setPresetTag(null);
      setCollectionName(EXECUTIVE_ACTIONS_COLLECTION);
      setFilters([
        { field: 'jurisdiction', value: 'US' },
        { field: 'source_name', value: FEDERAL_REGISTER_SOURCE_NAME },
      ]);
      setDistinctField('type');
    } else if (id === 'fed_dept_us') {
      setPresetTag(null);
      setCollectionName('federal_departments');
      setFilters([{ field: 'jurisdiction', value: 'US' }]);
      setDistinctField('name');
    } else if (id === 'dept_exp_us') {
      setPresetTag(null);
      setCollectionName('department_expenses');
      setFilters([{ field: 'jurisdiction', value: 'US' }]);
      setDistinctField('department');
    } else if (id === BILLS_US_PRESET) {
      setPresetTag(BILLS_US_PRESET);
      setCollectionName('bills');
      setFilters([{ field: 'jurisdiction', value: 'US' }]);
      setDistinctField('status');
    }
  };

  if (!FIRESTORE_DEBUG_ENABLED) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-[300] flex items-center gap-2 rounded-full bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold px-4 py-2 shadow-lg border border-slate-600"
        title="Read-only Firestore debug (dev or REACT_APP_FIRESTORE_DEBUG)"
      >
        <Database className="w-4 h-4" />
        Firestore
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[310] flex items-end sm:items-center justify-center p-4 bg-black/50"
          role="dialog"
          aria-modal="true"
          aria-label="Firestore debug"
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col border border-slate-200">
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-100 bg-slate-50 rounded-t-2xl flex-shrink-0">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Firestore debug (read-only)</h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  getDocs + optional == filters + limit. No writes. No API keys in the client.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-200 text-slate-600"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto px-4 py-4 space-y-4 text-sm flex-1">
              <div className="flex flex-wrap gap-2 items-center text-xs">
                <span className="text-slate-600 font-medium">Presets:</span>
                <button
                  type="button"
                  className="px-2 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50"
                  onClick={() => applyPreset('eo_fr')}
                >
                  executive_actions (US + Federal Register)
                </button>
                <button
                  type="button"
                  className="px-2 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50"
                  onClick={() => applyPreset('fed_dept_us')}
                >
                  federal_departments (US)
                </button>
                <button
                  type="button"
                  className="px-2 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50"
                  onClick={() => applyPreset('dept_exp_us')}
                >
                  department_expenses (US)
                </button>
                <button
                  type="button"
                  className="px-2 py-1 rounded border border-violet-200 bg-violet-50 hover:bg-violet-100 text-violet-900"
                  onClick={() => applyPreset(BILLS_US_PRESET)}
                >
                  bills (jurisdiction == US)
                </button>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <label className="block text-xs">
                  <span className="text-slate-600 font-medium">Collection</span>
                  <input
                    list="firestore-debug-presets"
                    value={collectionName}
                    onChange={(e) => {
                      setCollectionName(e.target.value);
                      setPresetTag(null);
                    }}
                    className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono"
                    placeholder="collection_id"
                  />
                  <datalist id="firestore-debug-presets">
                    {COLLECTION_PRESETS.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </label>
                <label className="block text-xs">
                  <span className="text-slate-600 font-medium">Max documents (≤ {MAX_FETCH})</span>
                  <input
                    type="number"
                    min={1}
                    max={MAX_FETCH}
                    value={fetchCap}
                    onChange={(e) => setFetchCap(Number(e.target.value))}
                    className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </label>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-700">Equality filters (==)</span>
                  <button
                    type="button"
                    onClick={addFilterRow}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    + Add filter
                  </button>
                </div>
                <div className="space-y-2">
                  {filters.map((f, i) => (
                    <div key={i} className="flex flex-wrap gap-2 items-center">
                      <input
                        value={f.field}
                        onChange={(e) => updateFilter(i, 'field', e.target.value)}
                        placeholder="field"
                        className="flex-1 min-w-[120px] border border-slate-300 rounded px-2 py-1.5 text-xs font-mono"
                      />
                      <span className="text-slate-400">==</span>
                      <input
                        value={f.value}
                        onChange={(e) => updateFilter(i, 'value', e.target.value)}
                        placeholder='value (string, true, false, number, JSON)'
                        className="flex-[2] min-w-[160px] border border-slate-300 rounded px-2 py-1.5 text-xs font-mono"
                      />
                      {filters.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeFilter(i)}
                          className="text-xs text-red-600 hover:underline px-1"
                        >
                          remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 items-center">
                <button
                  type="button"
                  onClick={runQuery}
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 disabled:opacity-50"
                >
                  {loading ? 'Loading…' : 'Run query'}
                </button>
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 text-red-900 px-3 py-2 text-xs whitespace-pre-wrap">
                  {error}
                  <p className="mt-2 text-red-800">
                    Compound queries may need a composite index — use the link from the browser console if
                    Firestore provides one, or reduce filters.
                  </p>
                </div>
              )}
              {warning && (
                <div className="rounded-lg bg-amber-50 border border-amber-200 text-amber-950 px-3 py-2 text-xs">
                  {warning}
                </div>
              )}

              {rows.length > 0 && (
                <>
                  <p className="text-xs text-slate-600">
                    Fetched <strong>{rows.length}</strong> document(s) in this sample.
                    {presetTag === BILLS_US_PRESET && (
                      <span className="text-violet-700 font-medium">
                        {' '}
                        — <code className="text-[11px]">bills</code> US audit preset (read-only)
                      </span>
                    )}
                  </p>

                  {presetTag === BILLS_US_PRESET && billsStatusDistincts && (
                    <div className="space-y-4 border border-violet-200 rounded-xl p-3 bg-violet-50/40">
                      <h3 className="text-sm font-bold text-slate-900">
                        1. Distinct values (status-like fields)
                      </h3>
                      <p className="text-[11px] text-slate-600">
                        Fields: {BILLS_STATUS_LIKE_FIELDS.join(', ')}. Counts apply to this sample only
                        (same limit as “Max documents”).
                      </p>
                      {BILLS_STATUS_LIKE_FIELDS.map((field) => {
                        const agg = billsStatusDistincts[field] || [];
                        return (
                          <div key={field} className="border border-slate-200 rounded-lg bg-white overflow-hidden">
                            <div className="px-2 py-1.5 bg-slate-100 text-[11px] font-mono font-semibold text-slate-800">
                              {field}
                            </div>
                            <div className="overflow-x-auto max-h-40 overflow-y-auto">
                              <table className="min-w-full text-left text-[11px]">
                                <thead className="bg-slate-50 sticky top-0">
                                  <tr>
                                    <th className="px-2 py-1">Count</th>
                                    <th className="px-2 py-1">Value</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {agg.slice(0, 50).map((row) => (
                                    <tr key={`${field}:${row.valueLabel}`} className="border-t border-slate-100">
                                      <td className="px-2 py-1 font-mono whitespace-nowrap">{row.count}</td>
                                      <td className="px-2 py-1 break-all max-w-lg">{row.valueLabel}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            {agg.length > 50 && (
                              <p className="text-[10px] text-slate-500 px-2 py-1">
                                Showing 50 of {agg.length} distinct value(s).
                              </p>
                            )}
                            {agg.length === 0 && (
                              <p className="text-[11px] text-slate-500 px-2 py-2">No values (all missing).</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {presetTag === BILLS_US_PRESET && (
                    <div className="space-y-2 border border-slate-200 rounded-xl p-3">
                      <h3 className="text-sm font-bold text-slate-900">
                        2. Sample rows (debug fields)
                      </h3>
                      <p className="text-[11px] text-slate-600">
                        Columns: {BILLS_DEBUG_FIELDS.join(', ')}. First 15 documents; scroll horizontally.
                      </p>
                      <div className="overflow-x-auto max-h-80 overflow-y-auto border border-slate-200 rounded-lg">
                        <table className="min-w-max text-left text-[10px]">
                          <thead className="bg-slate-50 sticky top-0 z-10">
                            <tr>
                              <th className="px-2 py-1.5 font-mono border-b border-slate-200">id</th>
                              {BILLS_DEBUG_FIELDS.map((f) => (
                                <th
                                  key={f}
                                  className="px-2 py-1.5 font-mono border-b border-slate-200 whitespace-nowrap"
                                >
                                  {f}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {rows.slice(0, 15).map(({ id, data }) => (
                              <tr key={id} className="border-t border-slate-100 align-top">
                                <td className="px-2 py-1 font-mono text-slate-800 whitespace-nowrap">{id}</td>
                                {BILLS_DEBUG_FIELDS.map((f) => (
                                  <td key={f} className="px-2 py-1 text-slate-700 max-w-[14rem]">
                                    {truncateCell(pickBillDebugValue(data, f), 200)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {presetTag === BILLS_US_PRESET && (
                    <div className="space-y-2 border border-slate-200 rounded-xl p-3">
                      <h3 className="text-sm font-bold text-slate-900">
                        3. Law-signal keyword matches
                      </h3>
                      <p className="text-[11px] text-slate-600">
                        Searches combined text from <code className="text-[10px]">status</code>,{' '}
                        <code className="text-[10px]">latestAction</code> / <code className="text-[10px]">latest_action</code>,{' '}
                        <code className="text-[10px]">latestActionText</code> /{' '}
                        <code className="text-[10px]">latest_action_text</code>,{' '}
                        <code className="text-[10px]">title</code>,{' '}
                        <code className="text-[10px]">action</code>,{' '}
                        <code className="text-[10px]">billStatus</code>. Patterns: signed by president,
                        became law, public law, enacted, Public Law No.
                      </p>
                      {billsLawHits.length === 0 ? (
                        <p className="text-xs text-slate-600 italic">
                          No documents in this sample matched any pattern.
                        </p>
                      ) : (
                        <div className="overflow-x-auto max-h-56 overflow-y-auto border border-slate-200 rounded-lg">
                          <table className="min-w-full text-left text-[11px]">
                            <thead className="bg-slate-50 sticky top-0">
                              <tr>
                                <th className="px-2 py-1.5">id</th>
                                <th className="px-2 py-1.5">Matched</th>
                                <th className="px-2 py-1.5">title</th>
                                <th className="px-2 py-1.5">status</th>
                                <th className="px-2 py-1.5">latestAction / latest_action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {billsLawHits.map(({ id, data, hits }) => (
                                <tr key={id} className="border-t border-slate-100 align-top">
                                  <td className="px-2 py-1 font-mono whitespace-nowrap">{id}</td>
                                  <td className="px-2 py-1 text-violet-900 font-medium">{hits.join(', ')}</td>
                                  <td className="px-2 py-1 break-words max-w-xs">
                                    {truncateCell(data?.title, 160)}
                                  </td>
                                  <td className="px-2 py-1 break-words max-w-xs">
                                    {truncateCell(data?.status, 120)}
                                  </td>
                                  <td className="px-2 py-1 break-words max-w-sm">
                                    {truncateCell(
                                      data?.latestAction ?? data?.latest_action ?? data?.latestActionText,
                                      160,
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                      <p className="text-[10px] text-slate-500">
                        {billsLawHits.length} document(s) in this sample matched at least one pattern.
                      </p>
                    </div>
                  )}

                  {presetTag === BILLS_US_PRESET && (
                    <div>
                      <h3 className="text-xs font-bold text-slate-800 mb-2">Raw sample (first 5, expand)</h3>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {rows.slice(0, 5).map(({ id, data }) => (
                          <details
                            key={id}
                            className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50/80"
                          >
                            <summary className="px-3 py-2 cursor-pointer text-xs font-mono font-semibold text-slate-800">
                              {id}
                            </summary>
                            <pre className="px-3 pb-3 text-[11px] overflow-x-auto text-slate-700 border-t border-slate-100 bg-white">
                              {JSON.stringify(data, null, 2)}
                            </pre>
                          </details>
                        ))}
                      </div>
                    </div>
                  )}

                  {presetTag !== BILLS_US_PRESET && (
                    <>
                      <label className="block text-xs">
                        <span className="text-slate-600 font-medium">
                          Distinct values for field (dot paths OK, e.g. meta.type)
                        </span>
                        <input
                          value={distinctField}
                          onChange={(e) => setDistinctField(e.target.value)}
                          className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono"
                        />
                      </label>

                      <div className="overflow-x-auto border border-slate-200 rounded-lg max-h-48 overflow-y-auto">
                        <table className="min-w-full text-left text-xs">
                          <thead className="bg-slate-50 sticky top-0">
                            <tr>
                              <th className="px-3 py-2">Count</th>
                              <th className="px-3 py-2">Value</th>
                            </tr>
                          </thead>
                          <tbody>
                            {distinctAgg.slice(0, 80).map((row) => (
                              <tr key={row.valueLabel} className="border-t border-slate-100">
                                <td className="px-3 py-1.5 font-mono">{row.count}</td>
                                <td className="px-3 py-1.5 break-all max-w-xl">{row.valueLabel}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {distinctAgg.length > 80 && (
                          <p className="text-[11px] text-slate-500 px-3 py-2">
                            Showing top 80 distinct values by count.
                          </p>
                        )}
                      </div>

                      <div>
                        <h3 className="text-xs font-bold text-slate-800 mb-2">Sample documents (first 12)</h3>
                        <div className="space-y-2 max-h-72 overflow-y-auto">
                          {rows.slice(0, 12).map(({ id, data }) => (
                            <details
                              key={id}
                              className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50/80"
                            >
                              <summary className="px-3 py-2 cursor-pointer text-xs font-mono font-semibold text-slate-800">
                                {id}
                              </summary>
                              <pre className="px-3 pb-3 text-[11px] overflow-x-auto text-slate-700 border-t border-slate-100 bg-white">
                                {JSON.stringify(data, null, 2)}
                              </pre>
                            </details>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            <div className="px-4 py-3 border-t border-slate-100 flex justify-end rounded-b-2xl flex-shrink-0">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-sm font-semibold px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
