import React from 'react';
import {
  US_STATE_FRAMEWORK_NOTE,
  formatTransparencyStatus,
  usStateSectionHasRowData,
  usStateSectionIsFrameworkOnly,
  usStateTransparencySourceUrl,
} from '../utils/usStateLeaderTransparency';

function frameworkNote() {
  return (
    <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 leading-relaxed mt-2">
      {US_STATE_FRAMEWORK_NOTE}
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
      className="text-xs text-blue-600 underline mt-2 inline-block break-all"
    >
      {label}
    </a>
  );
}

function StatusBlock({ status, note, sourceUrl }) {
  const label = formatTransparencyStatus(status);
  return (
    <>
      {label && (
        <p className="text-sm font-semibold text-gray-900">
          Status: <span className="font-medium text-gray-700">{label}</span>
        </p>
      )}
      {note && <p className="text-xs text-gray-600 mt-1 leading-relaxed">{note}</p>}
      {sourceLink(sourceUrl)}
    </>
  );
}

function SectionCard({ title, children }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">{title}</p>
      {children}
    </div>
  );
}

/**
 * @param {{ transparencyRow: Record<string, unknown>|null, loading: boolean }} props
 */
export default function UsStateLeaderTransparencySections({ transparencyRow, loading }) {
  if (loading) {
    return (
      <section>
        <p className="panel-section-label">Official transparency</p>
        <p className="text-xs text-gray-500 mb-3 flex items-center gap-2">
          <span className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin inline-block" />
          Loading official transparency data…
        </p>
      </section>
    );
  }

  if (!transparencyRow) return null;

  const fd = transparencyRow.financial_disclosure;
  const stocks = transparencyRow.stock_holdings;
  const cf = transparencyRow.campaign_finance;
  const activity = transparencyRow.recent_official_activity;
  const contact = transparencyRow.contact_info;
  const sourcesConfirmed = Array.isArray(transparencyRow.sources_confirmed)
    ? transparencyRow.sources_confirmed
    : [];
  const sourcesInaccessible = Array.isArray(transparencyRow.sources_inaccessible)
    ? transparencyRow.sources_inaccessible
    : [];

  const hasFd = fd && typeof fd === 'object';
  const hasStocks = stocks && typeof stocks === 'object';
  const hasCf = cf && typeof cf === 'object';
  const hasActivity = Array.isArray(activity) && activity.length > 0;
  const hasContact = contact && typeof contact === 'object';

  return (
    <section>
      <p className="panel-section-label">Official transparency</p>
      {transparencyRow.data_completeness_note && (
        <p className="text-xs text-gray-600 mb-3 leading-relaxed">{transparencyRow.data_completeness_note}</p>
      )}
      {(transparencyRow.regulatory_body || transparencyRow.regulatory_act) && (
        <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 mb-4 text-xs text-gray-700">
          {transparencyRow.regulatory_body && (
            <p>
              <span className="font-semibold text-gray-900">Authority: </span>
              {transparencyRow.regulatory_body}
            </p>
          )}
          {transparencyRow.regulatory_act && (
            <p className="mt-1">
              <span className="font-semibold text-gray-900">Framework: </span>
              {transparencyRow.regulatory_act}
            </p>
          )}
        </div>
      )}

      <div className="space-y-4">
        {hasFd && (
          <SectionCard title="Financial disclosure">
            <StatusBlock
              status={fd.status}
              note={fd.filing_status_note || fd.portal_note || fd.summary}
              sourceUrl={usStateTransparencySourceUrl(transparencyRow, 'financial_disclosure') || fd.source_url}
            />
            {usStateSectionIsFrameworkOnly(fd) && frameworkNote()}
          </SectionCard>
        )}

        {hasStocks && (
          <SectionCard title="Stock holdings">
            <StatusBlock
              status={stocks.status}
              note={stocks.disclosure_note}
              sourceUrl={usStateTransparencySourceUrl(transparencyRow, 'stock_holdings') || stocks.source_url}
            />
            {usStateSectionIsFrameworkOnly(stocks) && frameworkNote()}
          </SectionCard>
        )}

        {hasCf && (
          <SectionCard title="Campaign finance">
            <StatusBlock
              status={cf.status}
              note={cf.summary}
              sourceUrl={usStateTransparencySourceUrl(transparencyRow, 'campaign_finance') || cf.portal || cf.source_url}
            />
            {usStateSectionHasRowData(cf) && Array.isArray(cf.items) && cf.items.length > 0 && (
              <ul className="mt-2 space-y-1">
                {cf.items.slice(0, 8).map((it, i) => (
                  <li key={i} className="text-xs text-gray-700 flex justify-between gap-2">
                    <span>{it.name || it.contributor}</span>
                    {it.amount_text && <span className="font-medium">{it.amount_text}</span>}
                  </li>
                ))}
              </ul>
            )}
            {usStateSectionIsFrameworkOnly(cf) && frameworkNote()}
          </SectionCard>
        )}

        {hasActivity && (
          <SectionCard title="Recent official activity">
            <div className="space-y-2">
              {activity.map((it, i) => (
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
            </div>
            {sourceLink(usStateTransparencySourceUrl(transparencyRow, 'recent_official_activity'))}
          </SectionCard>
        )}

        {hasContact ? (
          <SectionCard title="Contact">
            {contact.office && <p className="text-sm font-semibold text-gray-900">{contact.office}</p>}
            {contact.phone && !String(contact.phone).toLowerCase().includes('not disclosed') && (
              <p className="text-xs text-gray-700 mt-1">Phone: {contact.phone}</p>
            )}
            {contact.email && !String(contact.email).toLowerCase().includes('not disclosed') && (
              <p className="text-xs text-gray-700 mt-1">Email: {contact.email}</p>
            )}
            {sourceLink(contact.website || contact.source_url, 'Governor official website')}
          </SectionCard>
        ) : null}

        {(sourcesConfirmed.length > 0 || sourcesInaccessible.length > 0) && (
          <SectionCard title="Official sources">
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
                      {note.startsWith('http') ? sourceLink(note, note) : note}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </SectionCard>
        )}
      </div>
    </section>
  );
}
