import React, { useCallback, useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { EXECUTIVE_ACTIONS_COLLECTION } from '../constants/firestoreCollections';
import { FEDERAL_REGISTER_SOURCE_NAME } from '../constants/executiveOrderDocumentTypes';
import { X } from 'lucide-react';

/**
 * Read-only Firestore audit using the web SDK (no Admin JSON).
 * Visible when NODE_ENV === 'development' OR REACT_APP_EXECUTIVE_ACTIONS_DEBUG=true.
 */
export const EXECUTIVE_ACTIONS_FIRESTORE_DEBUG_ENABLED =
  process.env.NODE_ENV === 'development' ||
  process.env.REACT_APP_EXECUTIVE_ACTIONS_DEBUG === 'true';

function typeLabel(data) {
  const v = data?.type;
  if (v == null || String(v).trim() === '') return '(empty type)';
  return String(v).trim();
}

function normSource(data) {
  return String(data?.source_name ?? data?.sourceName ?? '').trim();
}

async function loadFilteredRows() {
  try {
    const q = query(
      collection(db, EXECUTIVE_ACTIONS_COLLECTION),
      where('jurisdiction', '==', 'US'),
      where('source_name', '==', FEDERAL_REGISTER_SOURCE_NAME),
    );
    const snap = await getDocs(q);
    const rows = [];
    snap.forEach((doc) => rows.push({ id: doc.id, data: doc.data() || {} }));
    return { rows, loadMode: 'compound', fallbackWarning: null };
  } catch (err) {
    const q2 = query(
      collection(db, EXECUTIVE_ACTIONS_COLLECTION),
      where('jurisdiction', '==', 'US'),
    );
    const snap = await getDocs(q2);
    const rows = [];
    snap.forEach((doc) => {
      const data = doc.data() || {};
      if (normSource(data) === FEDERAL_REGISTER_SOURCE_NAME) {
        rows.push({ id: doc.id, data });
      }
    });
    return {
      rows,
      loadMode: 'fallback',
      fallbackWarning: err?.message || String(err),
    };
  }
}

function aggregateByType(rows) {
  /** @type {Map<string, { count: number, ids: string[], titles: string[] }>} */
  const map = new Map();
  for (const { id, data } of rows) {
    const key = typeLabel(data);
    if (!map.has(key)) {
      map.set(key, { count: 0, ids: [], titles: [] });
    }
    const e = map.get(key);
    e.count += 1;
    if (e.ids.length < 3) e.ids.push(id);
    if (e.titles.length < 3) e.titles.push(data.title || '(no title)');
  }
  return [...map.entries()]
    .map(([typeValue, agg]) => ({ typeValue, ...agg }))
    .sort((a, b) => b.count - a.count);
}

function filterEoHeuristic(rows) {
  return rows.filter(({ id, data }) => {
    const t = String(data?.type || '');
    const typeOk = /executive\s*order/i.test(t);
    const idOk = /eo/i.test(id);
    return typeOk || idOk;
  });
}

export function ExecutiveActionsFirestoreDebugPanel() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadMeta, setLoadMeta] = useState(null);
  const [byType, setByType] = useState([]);
  const [eoRows, setEoRows] = useState([]);
  const [total, setTotal] = useState(0);

  const runLoad = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { rows, loadMode, fallbackWarning } = await loadFilteredRows();
      setTotal(rows.length);
      setLoadMeta({ loadMode, fallbackWarning });
      setByType(aggregateByType(rows));
      setEoRows(filterEoHeuristic(rows));
    } catch (e) {
      setError(e?.message || String(e));
      setByType([]);
      setEoRows([]);
      setTotal(0);
      setLoadMeta(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open || !EXECUTIVE_ACTIONS_FIRESTORE_DEBUG_ENABLED) return undefined;
    runLoad();
    return undefined;
  }, [open, runLoad]);

  if (!EXECUTIVE_ACTIONS_FIRESTORE_DEBUG_ENABLED) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-[300] rounded-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-4 py-2 shadow-lg border border-amber-500"
      >
        FR types (debug)
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[310] flex items-end sm:items-center justify-center p-4 bg-black/50"
          role="dialog"
          aria-modal="true"
          aria-label="Executive actions Firestore debug"
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-amber-200">
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-amber-100 bg-amber-50 rounded-t-2xl flex-shrink-0">
              <div>
                <h2 className="text-lg font-bold text-gray-900">executive_actions · read-only audit</h2>
                <p className="text-xs text-gray-600 mt-0.5">
                  <code className="bg-white px-1 rounded">jurisdiction</code> US ·{' '}
                  <code className="bg-white px-1 rounded">source_name</code> Federal Register
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-2 rounded-lg hover:bg-amber-100 text-gray-600"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto px-4 py-4 space-y-6 text-sm">
              {loading && <p className="text-gray-600">Loading from Firestore…</p>}
              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 text-red-900 px-3 py-2 text-xs">
                  {error}
                </div>
              )}

              {!loading && !error && (
                <>
                  {loadMeta?.fallbackWarning && (
                    <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                      Compound query failed; used jurisdiction-only fetch + in-memory filter. Original:{' '}
                      {loadMeta.fallbackWarning}
                    </p>
                  )}
                  <p className="text-xs text-gray-600">
                    Load mode: <strong>{loadMeta?.loadMode || '—'}</strong> · Total matching documents:{' '}
                    <strong>{total}</strong>
                  </p>

                  <section>
                    <h3 className="font-bold text-gray-900 mb-2">Distinct type values</h3>
                    <div className="overflow-x-auto border border-gray-200 rounded-lg">
                      <table className="min-w-full text-left text-xs">
                        <thead className="bg-gray-50 text-gray-700">
                          <tr>
                            <th className="px-3 py-2">Count</th>
                            <th className="px-3 py-2">type</th>
                            <th className="px-3 py-2">Sample IDs (3)</th>
                            <th className="px-3 py-2">Sample titles (3)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {byType.length === 0 && (
                            <tr>
                              <td colSpan={4} className="px-3 py-4 text-gray-500 text-center">
                                No documents matched the filter.
                              </td>
                            </tr>
                          )}
                          {byType.map((row) => (
                            <tr key={row.typeValue} className="border-t border-gray-100 align-top">
                              <td className="px-3 py-2 font-mono">{row.count}</td>
                              <td className="px-3 py-2 max-w-[200px] break-words">{row.typeValue}</td>
                              <td className="px-3 py-2 font-mono text-[11px] break-all">
                                {row.ids.join(', ') || '—'}
                              </td>
                              <td className="px-3 py-2 text-gray-700">{row.titles.join(' · ') || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>

                  <section>
                    <h3 className="font-bold text-gray-900 mb-2">
                      Heuristic: type contains “Executive Order” OR document ID contains “eo”
                    </h3>
                    <p className="text-xs text-gray-600 mb-2">
                      Matches: <strong>{eoRows.length}</strong> (read-only; tune EO filters from distinct types
                      above)
                    </p>
                    <div className="overflow-x-auto border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
                      <table className="min-w-full text-left text-xs">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="px-3 py-2">Document ID</th>
                            <th className="px-3 py-2">type</th>
                            <th className="px-3 py-2">title</th>
                          </tr>
                        </thead>
                        <tbody>
                          {eoRows.map((r) => (
                            <tr key={r.id} className="border-t border-gray-100 align-top">
                              <td className="px-3 py-2 font-mono text-[11px] break-all">{r.id}</td>
                              <td className="px-3 py-2 max-w-[180px] break-words">{typeLabel(r.data)}</td>
                              <td className="px-3 py-2 text-gray-700">{r.data?.title || '(no title)'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                </>
              )}
            </div>

            <div className="px-4 py-3 border-t border-gray-100 flex justify-end gap-2 flex-shrink-0 rounded-b-2xl">
              <button
                type="button"
                onClick={() => runLoad()}
                disabled={loading}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
              >
                Refresh
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-900 text-white hover:bg-gray-800"
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
