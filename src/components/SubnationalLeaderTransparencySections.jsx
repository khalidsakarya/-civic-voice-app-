import React from 'react';
import {
  LEADER_TRANSPARENCY_SECTION_LABELS,
  leaderTransparencySectionLoaded,
} from '../utils/subnationalLeaderTransparency';

function formatCurrency(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n);
}

function pendingNote() {
  return <p className="text-xs text-gray-500 italic py-2">Official data not loaded yet.</p>;
}

/** Shown when a section is in sections_unavailable — honest about why data is absent. */
function manualReviewNote(note) {
  return (
    <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 mt-1">
      <p className="text-xs font-semibold text-amber-800">Manual review required</p>
      <p className="text-xs text-amber-700 mt-0.5">
        {note || 'Official data is being validated against source registers. Values will appear once verified.'}
      </p>
    </div>
  );
}

/** Shown inside a loaded section when the section data itself carries needs_manual_review. */
function frameworkNote() {
  return (
    <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1 mt-2">
      Official framework available; individual values require manual review.
    </p>
  );
}

function sourceLink(url, label = 'View official source') {
  if (!url) return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-xs text-blue-600 underline mt-2 inline-block"
    >
      {label}
    </a>
  );
}

function sectionUnavailable(sectionKey, row) {
  const unavail = row?.sections_unavailable;
  return Array.isArray(unavail) && unavail.includes(sectionKey);
}

function sectionNeedsManualReview(data) {
  if (!data || typeof data !== 'object') return false;
  const list = data.needs_manual_review;
  return Array.isArray(list) && list.length > 0;
}

/**
 * @param {{ transparencyRow: Record<string, unknown>|null, loading: boolean }} props
 */
export default function SubnationalLeaderTransparencySections({ transparencyRow, loading }) {
  const sectionOrder = Object.keys(LEADER_TRANSPARENCY_SECTION_LABELS);
  const sourceUrl = (key) => {
    const fs = transparencyRow?.field_sources;
    return fs && typeof fs === 'object' ? fs[key] : '';
  };

  return (
    <section>
      <p className="panel-section-label">Official transparency</p>
      {loading && (
        <p className="text-xs text-gray-500 mb-3 flex items-center gap-2">
          <span className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin inline-block" />
          Loading official transparency data…
        </p>
      )}
      <div className="space-y-5">
        {sectionOrder.map((sectionKey) => {
          const label = LEADER_TRANSPARENCY_SECTION_LABELS[sectionKey];
          const unavailable = !loading && sectionUnavailable(sectionKey, transparencyRow);
          const loaded = !loading && !unavailable && leaderTransparencySectionLoaded(sectionKey, transparencyRow);
          const src = sourceUrl(sectionKey);

          if (sectionKey === 'salary') {
            const sal = transparencyRow?.salary;
            return (
              <div key={sectionKey} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">{label}</p>
                {unavailable ? (
                  manualReviewNote(sal?.review_note)
                ) : !loaded ? (
                  pendingNote()
                ) : (
                  <>
                    <p className="text-sm font-semibold text-gray-900">
                      {sal?.amount_text || (sal?.amount != null ? formatCurrency(sal.amount) : '')}
                      {sal?.period ? ` · ${sal.period}` : ''}
                    </p>
                    {sal?.description && <p className="text-xs text-gray-600 mt-1">{sal.description}</p>}
                    {sectionNeedsManualReview(sal) && frameworkNote()}
                    {sourceLink(src)}
                  </>
                )}
              </div>
            );
          }

          if (sectionKey === 'financial_disclosure') {
            const fd = transparencyRow?.financial_disclosure;
            return (
              <div key={sectionKey} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">{label}</p>
                {unavailable ? (
                  manualReviewNote(fd?.review_note)
                ) : !loaded ? (
                  pendingNote()
                ) : (
                  <>
                    {fd?.summary && <p className="text-sm text-gray-700">{fd.summary}</p>}
                    {fd?.portal && sourceLink(fd.portal, fd?.portal_note || 'View portal')}
                    {fd?.filing_url && sourceLink(fd.filing_url, 'View filing')}
                    {Array.isArray(fd?.items) && fd.items.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {fd.items.slice(0, 8).map((it, i) => (
                          <li key={i} className="text-xs text-gray-700">
                            {it.description || it.type}
                            {it.value_text ? ` — ${it.value_text}` : ''}
                          </li>
                        ))}
                      </ul>
                    )}
                    {sectionNeedsManualReview(fd) && frameworkNote()}
                  </>
                )}
              </div>
            );
          }

          if (sectionKey === 'assets' || sectionKey === 'stock_holdings') {
            const items = transparencyRow?.[sectionKey];
            const reviewNote = items?.review_note;
            return (
              <div key={sectionKey} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">{label}</p>
                {unavailable ? (
                  manualReviewNote(reviewNote)
                ) : !loaded || !Array.isArray(items) ? (
                  pendingNote()
                ) : (
                  <>
                    <ul className="space-y-1">
                      {items.map((it, i) => (
                        <li key={i} className="text-xs text-gray-700">
                          {it.description || it.name || it.type}
                          {it.value_text ? ` — ${it.value_text}` : ''}
                          {it.ticker ? ` (${it.ticker})` : ''}
                        </li>
                      ))}
                    </ul>
                    {sectionNeedsManualReview(transparencyRow?.[sectionKey]) && frameworkNote()}
                  </>
                )}
              </div>
            );
          }

          if (sectionKey === 'campaign_finance') {
            const cf = transparencyRow?.campaign_finance;
            return (
              <div key={sectionKey} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">{label}</p>
                {unavailable ? (
                  manualReviewNote(cf?.review_note)
                ) : !loaded ? (
                  pendingNote()
                ) : (
                  <>
                    {cf?.summary && <p className="text-sm text-gray-700">{cf.summary}</p>}
                    {Array.isArray(cf?.items) && cf.items.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {cf.items.slice(0, 8).map((it, i) => (
                          <li key={i} className="text-xs text-gray-700 flex justify-between gap-2">
                            <span>{it.name || it.contributor}</span>
                            <span className="font-medium">
                              {it.amount_text || (it.amount != null ? formatCurrency(it.amount) : '')}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {sectionNeedsManualReview(cf) && frameworkNote()}
                    {sourceLink(src)}
                  </>
                )}
              </div>
            );
          }

          if (sectionKey === 'lobbying_disclosures') {
            const items = transparencyRow?.lobbying_disclosures;
            return (
              <div key={sectionKey} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">{label}</p>
                {unavailable ? (
                  manualReviewNote()
                ) : !loaded || !Array.isArray(items) ? (
                  pendingNote()
                ) : (
                  <ul className="space-y-1">
                    {items.map((it, i) => (
                      <li key={i} className="text-xs text-gray-700">
                        {it.name || it.lobbyist || it.description}
                        {it.period ? ` · ${it.period}` : ''}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          }

          if (sectionKey === 'conflict_disclosures') {
            const items = transparencyRow?.conflict_disclosures;
            return (
              <div key={sectionKey} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">{label}</p>
                {unavailable ? (
                  manualReviewNote()
                ) : !loaded || !Array.isArray(items) ? (
                  pendingNote()
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {items.slice(0, 12).map((it, i) => (
                      <div key={i} className="text-xs text-gray-700 border-b border-gray-200 pb-2">
                        <p className="font-semibold text-gray-900">
                          {it.date} · {it.donor}
                        </p>
                        <p className="mt-0.5">{it.details}</p>
                        {it.value_text && <p className="text-gray-500 mt-0.5">Value: {it.value_text}</p>}
                      </div>
                    ))}
                    {sourceLink(src, 'View official register')}
                  </div>
                )}
              </div>
            );
          }

          if (sectionKey === 'recent_official_activity') {
            const items = transparencyRow?.recent_official_activity;
            return (
              <div key={sectionKey} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">{label}</p>
                {unavailable ? (
                  manualReviewNote()
                ) : !loaded || !Array.isArray(items) ? (
                  pendingNote()
                ) : (
                  <div className="space-y-2">
                    {items.map((it, i) => (
                      <div key={i} className="text-xs border-b border-gray-200 pb-2 last:border-0">
                        {it.url ? (
                          <a
                            href={it.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-blue-700 hover:underline"
                          >
                            {it.title}
                          </a>
                        ) : (
                          <p className="font-semibold text-gray-900">{it.title}</p>
                        )}
                        {it.date && <p className="text-gray-500 mt-0.5">{it.date}</p>}
                        {it.excerpt && <p className="text-gray-600 mt-0.5 leading-relaxed">{it.excerpt}</p>}
                      </div>
                    ))}
                    {sourceLink(src)}
                  </div>
                )}
              </div>
            );
          }

          return null;
        })}
      </div>
    </section>
  );
}
