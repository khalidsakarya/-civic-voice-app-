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

function manualReviewNote(note) {
  return (
    <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 mt-1">
      <p className="text-xs font-semibold text-amber-800">Manual review required</p>
      <p className="text-xs text-amber-700 mt-0.5">
        {note || 'Official data is being validated against source registers.'}
      </p>
    </div>
  );
}

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
    <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 underline mt-2 inline-block break-all">
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

function StatusBlock({ data, sourceUrl: srcUrl }) {
  if (!data || typeof data !== 'object') return pendingNote();
  const status = data.status || '';
  const notes = data.notes || '';

  const statusDisplay = {
    not_publicly_trackable: { label: 'Not publicly trackable', color: 'text-gray-500' },
    not_disclosed: { label: 'Not disclosed', color: 'text-gray-500' },
    requires_manual_portal_review: { label: 'Requires manual portal review', color: 'text-amber-700' },
    source_blocked: { label: 'Source blocked (HTTP 403)', color: 'text-red-600' },
    no_public_endpoint: { label: 'No public endpoint', color: 'text-gray-500' },
    no_official_records_found: { label: 'No official records found', color: 'text-gray-500' },
    official_bulk_register_pdf: { label: 'Available as PDF (manual access)', color: 'text-amber-700' },
    blind_trust: { label: 'Assets held in blind trust', color: 'text-blue-700' },
    confirmed: { label: 'Confirmed', color: 'text-green-700' },
    filed: { label: 'Filed', color: 'text-green-700' },
  };

  const display = statusDisplay[status] || { label: status, color: 'text-gray-600' };

  return (
    <>
      <p className={`text-sm font-semibold ${display.color}`}>{display.label}</p>
      {notes && <p className="text-xs text-gray-600 mt-1">{notes}</p>}
      {srcUrl && sourceLink(srcUrl)}
    </>
  );
}

/**
 * @param {{ transparencyRow: Record<string, unknown>|null, loading: boolean }} props
 */
export default function UsStateLeaderTransparencySections({ transparencyRow, loading }) {
  const sourceUrl = (key) => {
    const fs = transparencyRow?.field_sources;
    return fs && typeof fs === 'object' ? fs[key] : '';
  };

  const sourcesConfirmed = Array.isArray(transparencyRow?.sources_confirmed)
    ? transparencyRow.sources_confirmed
    : [];
  const sourcesInaccessible = Array.isArray(transparencyRow?.sources_inaccessible)
    ? transparencyRow.sources_inaccessible
    : [];

  return (
    <section>
      <p className="panel-section-label">Official transparency</p>
      {loading && (
        <p className="text-xs text-gray-500 mb-3 flex items-center gap-2">
          <span className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin inline-block" />
          Loading official transparency data…
        </p>
      )}

      {!loading && transparencyRow?.data_completeness_note && (
        <p className="text-xs text-gray-600 mb-3 leading-relaxed">{transparencyRow.data_completeness_note}</p>
      )}

      {!loading && (transparencyRow?.regulatory_body || transparencyRow?.regulatory_act) && (
        <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 mb-4 text-xs text-gray-700">
          {transparencyRow.regulatory_body && (
            <p><span className="font-semibold text-gray-900">Authority: </span>{transparencyRow.regulatory_body}</p>
          )}
          {transparencyRow.regulatory_act && (
            <p className="mt-1"><span className="font-semibold text-gray-900">Framework: </span>{transparencyRow.regulatory_act}</p>
          )}
        </div>
      )}

      <div className="space-y-5">
        {/* SALARY */}
        {(() => {
          const sal = transparencyRow?.salary;
          if (!sal && !loading) return null;
          return (
            <div key="salary" className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">Salary</p>
              {loading ? pendingNote() : !sal ? pendingNote() : (
                <>
                  <p className="text-sm font-semibold text-gray-900">
                    {sal.amount_text || (sal.amount != null ? formatCurrency(sal.amount) : '')}
                    {sal.amount_drawn != null && sal.amount_drawn === 0 ? ' · $0 drawn (declined)' : ''}
                    {sal.period ? ` · ${sal.period}` : ''}
                  </p>
                  {sal.notes && <p className="text-xs text-gray-600 mt-1">{sal.notes}</p>}
                  {sal.description && <p className="text-xs text-gray-600 mt-1">{sal.description}</p>}
                  {sectionNeedsManualReview(sal) && frameworkNote()}
                  {sourceLink(sal.source_url || sourceUrl('salary'))}
                </>
              )}
            </div>
          );
        })()}

        {/* FINANCIAL DISCLOSURE */}
        {(() => {
          const fd = transparencyRow?.financial_disclosure;
          if (!fd && !loading) return null;
          const unavailable = sectionUnavailable('financial_disclosure', transparencyRow);
          const loaded = leaderTransparencySectionLoaded('financial_disclosure', transparencyRow);
          return (
            <div key="financial_disclosure" className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">Financial disclosure</p>
              {unavailable ? manualReviewNote(fd?.review_note) : !loaded ? pendingNote() : (
                <>
                  {fd?.summary && <p className="text-sm text-gray-700">{fd.summary}</p>}
                  {fd?.status && !fd?.summary && <StatusBlock data={fd} sourceUrl={sourceUrl('financial_disclosure')} />}
                  {fd?.portal && sourceLink(fd.portal, fd?.portal_note || 'View portal')}
                  {fd?.filing_url && sourceLink(fd.filing_url, 'View filing')}
                  {Array.isArray(fd?.items) && fd.items.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {fd.items.slice(0, 8).map((it, i) => (
                        <li key={i} className="text-xs text-gray-700">
                          {it.description || it.type}{it.value_text ? ` — ${it.value_text}` : ''}
                        </li>
                      ))}
                    </ul>
                  )}
                  {sectionNeedsManualReview(fd) && frameworkNote()}
                </>
              )}
            </div>
          );
        })()}

        {/* STOCK HOLDINGS */}
        {(() => {
          const sh = transparencyRow?.stock_holdings;
          if (!sh && !loading) return null;
          const unavailable = sectionUnavailable('stock_holdings', transparencyRow);
          const isArray = Array.isArray(sh);
          const isStatusObj = sh && typeof sh === 'object' && !isArray && sh.status;
          return (
            <div key="stock_holdings" className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">Stock holdings</p>
              {unavailable ? manualReviewNote(sh?.review_note)
                : isStatusObj ? <StatusBlock data={sh} sourceUrl={sh.source_url || sourceUrl('stock_holdings')} />
                : isArray && sh.length > 0 ? (
                  <>
                    <ul className="space-y-1">
                      {sh.map((it, i) => (
                        <li key={i} className="text-xs text-gray-700">
                          {it.description || it.name || it.type}
                          {it.value_text ? ` — ${it.value_text}` : ''}
                          {it.ticker ? ` (${it.ticker})` : ''}
                        </li>
                      ))}
                    </ul>
                    {sectionNeedsManualReview(transparencyRow?.stock_holdings) && frameworkNote()}
                  </>
                ) : pendingNote()}
            </div>
          );
        })()}

        {/* LOBBYING */}
        {(() => {
          const lob = transparencyRow?.lobbying;
          const lobRecords = transparencyRow?.lobbying_records;
          const data = lob || lobRecords;
          if (!data && !loading) return null;
          const isArray = Array.isArray(data);
          return (
            <div key="lobbying" className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">Lobbying</p>
              {loading ? pendingNote()
                : !isArray && data?.status ? <StatusBlock data={data} sourceUrl={data.source_url || sourceUrl('lobbying_records')} />
                : isArray && data.length > 0 ? (
                  <ul className="space-y-1">
                    {data.map((it, i) => (
                      <li key={i} className="text-xs text-gray-700">
                        {it.name || it.lobbyist || it.description}{it.period ? ` · ${it.period}` : ''}
                      </li>
                    ))}
                  </ul>
                ) : pendingNote()}
            </div>
          );
        })()}

        {/* NET WORTH */}
        {(() => {
          const nw = transparencyRow?.net_worth;
          if (!nw && !loading) return null;
          return (
            <div key="net_worth" className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">Net worth</p>
              {loading ? pendingNote()
                : nw?.status ? <StatusBlock data={nw} sourceUrl={nw.source_url} />
                : nw?.amount != null ? (
                  <p className="text-sm font-semibold text-gray-900">{formatCurrency(nw.amount)}</p>
                ) : pendingNote()}
            </div>
          );
        })()}

        {/* CAMPAIGN FINANCE */}
        {(() => {
          const cf = transparencyRow?.campaign_finance;
          if (!cf && !loading) return null;
          const unavailable = sectionUnavailable('campaign_finance', transparencyRow);
          const loaded = leaderTransparencySectionLoaded('campaign_finance', transparencyRow);
          return (
            <div key="campaign_finance" className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">Campaign finance</p>
              {unavailable ? manualReviewNote(cf?.review_note)
                : !loaded ? pendingNote()
                : (
                  <>
                    {cf?.summary && <p className="text-sm text-gray-700">{cf.summary}</p>}
                    {cf?.status && !cf?.summary && <StatusBlock data={cf} sourceUrl={sourceUrl('campaign_finance')} />}
                    {Array.isArray(cf?.items) && cf.items.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {cf.items.slice(0, 8).map((it, i) => (
                          <li key={i} className="text-xs text-gray-700 flex justify-between gap-2">
                            <span>{it.name || it.contributor}</span>
                            <span className="font-medium">{it.amount_text || (it.amount != null ? formatCurrency(it.amount) : '')}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {sectionNeedsManualReview(cf) && frameworkNote()}
                    {sourceLink(sourceUrl('campaign_finance'))}
                  </>
                )}
            </div>
          );
        })()}

        {/* RECENT OFFICIAL ACTIVITY */}
        {(() => {
          const items = transparencyRow?.recent_official_activity;
          if (!items && !loading) return null;
          const unavailable = sectionUnavailable('recent_official_activity', transparencyRow);
          const loaded = leaderTransparencySectionLoaded('recent_official_activity', transparencyRow);
          return (
            <div key="recent_official_activity" className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">Recent official activity</p>
              {unavailable ? manualReviewNote()
                : !loaded || !Array.isArray(items) ? pendingNote()
                : (
                  <div className="space-y-2">
                    {items.filter(it => it.title && it.title !== 'Skip to main content' && !it.title.startsWith('Skip')).map((it, i) => (
                      <div key={i} className="text-xs border-b border-gray-200 pb-2 last:border-0">
                        {it.url ? (
                          <a href={it.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-700 hover:underline">
                            {it.title}
                          </a>
                        ) : (
                          <p className="font-semibold text-gray-900">{it.title}</p>
                        )}
                        {it.date && <p className="text-gray-500 mt-0.5">{it.date}</p>}
                        {it.excerpt && <p className="text-gray-600 mt-0.5 leading-relaxed">{it.excerpt}</p>}
                      </div>
                    ))}
                    {sourceLink(sourceUrl('recent_official_activity'))}
                  </div>
                )}
            </div>
          );
        })()}

        {/* GIFTS & HOSPITALITY */}
        {(() => {
          const items = transparencyRow?.conflict_disclosures || transparencyRow?.gifts_hospitality;
          if (!items && !loading) return null;
          const unavailable = sectionUnavailable('conflict_disclosures', transparencyRow);
          const isArray = Array.isArray(items);
          return (
            <div key="conflict_disclosures" className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">Gifts & hospitality</p>
              {unavailable ? manualReviewNote()
                : !isArray ? pendingNote()
                : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {items.slice(0, 12).map((it, i) => (
                      <div key={i} className="text-xs text-gray-700 border-b border-gray-200 pb-2">
                        <p className="font-semibold text-gray-900">{it.date} · {it.donor}</p>
                        <p className="mt-0.5">{it.details}</p>
                        {it.value_text && <p className="text-gray-500 mt-0.5">Value: {it.value_text}</p>}
                      </div>
                    ))}
                    {sourceLink(sourceUrl('conflict_disclosures'))}
                  </div>
                )}
            </div>
          );
        })()}

        {/* CONTACT */}
        {(() => {
          const contact = transparencyRow?.contact_info;
          if (!contact || typeof contact !== 'object') return null;
          return (
            <div key="contact" className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">Contact</p>
              {contact.office && <p className="text-sm font-semibold text-gray-900">{contact.office}</p>}
              {contact.phone && !String(contact.phone).toLowerCase().includes('not disclosed') && (
                <p className="text-xs text-gray-700 mt-1">Phone: {contact.phone}</p>
              )}
              {contact.email && !String(contact.email).toLowerCase().includes('not disclosed') && (
                <p className="text-xs text-gray-700 mt-1">Email: {contact.email}</p>
              )}
              {sourceLink(contact.website || contact.source_url, 'Governor official website')}
            </div>
          );
        })()}

        {/* OFFICIAL SOURCES */}
        {(sourcesConfirmed.length > 0 || sourcesInaccessible.length > 0) && (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">Official sources</p>
            {sourcesConfirmed.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-semibold text-gray-800 mb-1">Confirmed</p>
                <ul className="space-y-1">
                  {sourcesConfirmed.map((url, i) => (
                    <li key={`ok-${i}`}>{sourceLink(url, url)}</li>
                  ))}
                </ul>
              </div>
            )}
            {sourcesInaccessible.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-amber-800 mb-1">Blocked or manual review</p>
                <ul className="space-y-1">
                  {sourcesInaccessible.map((note, i) => (
                    <li key={`block-${i}`} className="text-xs text-amber-800 leading-relaxed">
                      {String(note).startsWith('http') ? sourceLink(note, note) : note}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
