import React, { useState, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  UK_LON_TRANSPARENCY_SECTIONS,
  FRAMEWORK_ONLY_NOTE,
  NOT_DISCLOSED_LABEL,
  REPORTED_HOLDINGS_LABEL,
  buildUkLonTransparencySummaryCards,
  ukLonAccordionSubtitle,
  ukLonNeedsManualReview,
  ukLonSourceUrl,
  ukLonTransparencySectionLoaded,
  formatMoney,
} from '../utils/ukLonLeaderTransparency';

function pendingNote() {
  return <p className="text-xs text-gray-500 italic py-2">Official data not loaded yet.</p>;
}

function frameworkNote() {
  return (
    <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 leading-relaxed">
      {FRAMEWORK_ONLY_NOTE}
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

function ResultRow({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5 py-2 border-b border-gray-100 last:border-0 sm:flex-row sm:gap-3">
      <span className="text-xs font-medium text-gray-500 sm:w-44 flex-shrink-0">{label}</span>
      <span className="text-xs text-gray-900 leading-relaxed">{value}</span>
    </div>
  );
}

function cell(v) {
  const s = v == null ? '' : String(v).trim();
  return s || '—';
}

function ReportedHoldingsTable({ rows, caption }) {
  if (!Array.isArray(rows) || !rows.length) return null;
  return (
    <div className="mt-2">
      {caption && <p className="text-xs font-semibold text-gray-800 mb-1.5">{caption}</p>}
      <div className="overflow-x-auto -mx-1 px-1">
        <table className="w-full min-w-[640px] text-[11px] sm:text-xs border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="px-2 py-1.5 font-semibold text-gray-700">Asset / entity</th>
              <th className="px-2 py-1.5 font-semibold text-gray-700">Sched.</th>
              <th className="px-2 py-1.5 font-semibold text-gray-700">Type</th>
              <th className="px-2 py-1.5 font-semibold text-gray-700">Value range</th>
              <th className="px-2 py-1.5 font-semibold text-gray-700">Income range</th>
              <th className="px-2 py-1.5 font-semibold text-gray-700">Trust / entity</th>
              <th className="px-2 py-1.5 font-semibold text-gray-700">Pg</th>
              <th className="px-2 py-1.5 font-semibold text-gray-700">Ticker</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {rows.map((r, i) => (
              <tr key={`${r.schedule}-${r.asset_or_entity_name}-${r.page_number}-${i}`} className="align-top">
                <td className="px-2 py-1.5 text-gray-900 max-w-[10rem]">{cell(r.asset_or_entity_name)}</td>
                <td className="px-2 py-1.5 text-gray-700 whitespace-nowrap">{cell(r.schedule)}</td>
                <td className="px-2 py-1.5 text-gray-600 max-w-[8rem]">{cell(r.asset_type)}</td>
                <td className="px-2 py-1.5 text-gray-800 whitespace-nowrap">{cell(r.value_range)}</td>
                <td className="px-2 py-1.5 text-gray-800 whitespace-nowrap">{cell(r.income_range)}</td>
                <td className="px-2 py-1.5 text-gray-600 max-w-[8rem]">{cell(r.trust_entity_name)}</td>
                <td className="px-2 py-1.5 text-gray-500">{r.page_number != null ? r.page_number : '—'}</td>
                <td className="px-2 py-1.5 text-gray-500">{cell(r.ticker)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[10px] text-gray-500 mt-1.5 leading-relaxed">
        Share counts, exact tickers, and purchase amounts: {NOT_DISCLOSED_LABEL} Transaction dates only
        when shown on the official GLA register of interests.
      </p>
    </div>
  );
}

function LobbyingRecordsTable({ rows }) {
  if (!Array.isArray(rows) || !rows.length) return null;
  return (
    <div className="mt-2 overflow-x-auto -mx-1 px-1">
      <table className="w-full min-w-[640px] text-[11px] sm:text-xs border border-gray-200 rounded-lg overflow-hidden">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="px-2 py-1.5 font-semibold text-gray-700">Lobbyist / firm</th>
            <th className="px-2 py-1.5 font-semibold text-gray-700">Client</th>
            <th className="px-2 py-1.5 font-semibold text-gray-700">Target</th>
            <th className="px-2 py-1.5 font-semibold text-gray-700">Issue</th>
            <th className="px-2 py-1.5 font-semibold text-gray-700">Amount</th>
            <th className="px-2 py-1.5 font-semibold text-gray-700">Period</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {rows.map((r, i) => (
            <tr key={`${r.lobbyist_or_firm}-${r.target_office_or_person}-${i}`} className="align-top">
              <td className="px-2 py-1.5 text-gray-900 max-w-[8rem]">{cell(r.lobbyist_or_firm)}</td>
              <td className="px-2 py-1.5 text-gray-700 max-w-[8rem]">{cell(r.client_employer)}</td>
              <td className="px-2 py-1.5 text-gray-800 max-w-[8rem]">{cell(r.target_office_or_person)}</td>
              <td className="px-2 py-1.5 text-gray-600 max-w-[8rem]">{cell(r.issue_area)}</td>
              <td className="px-2 py-1.5 text-gray-500 whitespace-nowrap">{cell(r.amount_paid)}</td>
              <td className="px-2 py-1.5 text-gray-600 whitespace-nowrap">{cell(r.reporting_period)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SummaryCard({ title, lines, highlight }) {
  return (
    <div
      className={`rounded-xl border p-3 sm:p-3.5 ${
        highlight ? 'border-emerald-200 bg-emerald-50/80' : 'border-gray-200 bg-white'
      }`}
    >
      <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wide text-gray-500">{title}</p>
      <div className="mt-1.5 space-y-0.5">
        {lines.map((line, i) => (
          <p key={i} className="text-xs sm:text-sm text-gray-900 leading-snug">
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}

function TransparencyAccordion({ id, title, subtitle, open, onToggle, children, disabled }) {
  const panelId = `uk-lon-transparency-${id}`;
  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <button
        type="button"
        id={`${panelId}-trigger`}
        aria-expanded={open}
        aria-controls={panelId}
        disabled={disabled}
        onClick={onToggle}
        className="w-full flex items-start gap-3 text-left px-3 py-3.5 sm:px-4 sm:py-4 min-h-[3rem] touch-manipulation hover:bg-gray-50 active:bg-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <ChevronDown
          className={`w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
          aria-hidden
        />
        <span className="flex-1 min-w-0">
          <span className="block text-sm font-semibold text-gray-900">{title}</span>
          {!open && subtitle && (
            <span className="block text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
              {subtitle}
            </span>
          )}
        </span>
      </button>
      {open && (
        <div
          id={panelId}
          role="region"
          aria-labelledby={`${panelId}-trigger`}
          className="px-3 pb-4 sm:px-4 sm:pb-5 pt-0 border-t border-gray-100 text-sm"
        >
          {children}
        </div>
      )}
    </div>
  );
}

function DetailSalary({ row }) {
  const sal = row?.salary;
  const src = row?.field_sources?.salary;
  return (
    <div className="pt-3 space-y-2">
      <p className="text-sm font-semibold text-gray-900">
        {sal?.amount_text || (sal?.amount != null ? formatMoney(sal.amount, 'GBP', 2) : '')}
        {sal?.period ? ` · ${sal.period}` : ''}
      </p>
      {sal?.prior_amount_text && (
        <p className="text-xs text-gray-600">
          Prior period ({sal.prior_period}): {sal.prior_amount_text}
        </p>
      )}
      {sal?.description && <p className="text-xs text-gray-600 leading-relaxed">{sal.description}</p>}
      {sourceLink(src, 'View Mayor expenses transparency (london.gov.uk)')}
    </div>
  );
}

function parseFinancialDisclosureSummary(fd, row) {
  if (!fd || typeof fd !== 'object') return null;
  const holdingCount =
    fd.reported_holdings_row_count ??
    row?.declared_assets?.row_count ??
    row?.declared_assets?.rows?.length ??
    0;
  return {
    status: fd.status === 'filed' ? 'Filed' : String(fd.status || 'See london.gov.uk'),
    latestYear: fd.latest_filing_year != null ? String(fd.latest_filing_year) : '—',
    form: 'GLA register of interests (Mayor)',
    publicValues: 'Official register entries (descriptive interests, not exact securities)',
    leaderSpecific:
      holdingCount > 0
        ? `${holdingCount} reported interest rows from official GLA register page`
        : ukLonNeedsManualReview(fd)
          ? 'Open register PDFs on london.gov.uk'
          : 'See Mayor register of interests for schedules',
  };
}

function DetailFinancialDisclosure({ row }) {
  const fd = row?.financial_disclosure;
  const src = ukLonSourceUrl(fd) || row?.field_sources?.financial_disclosure;
  const summary = parseFinancialDisclosureSummary(fd, row);

  return (
    <div className="pt-3 space-y-3">
      {summary && (
        <div className="rounded-lg border border-gray-200 bg-gray-50/90 px-3 py-1">
          <ResultRow label="Status" value={summary.status} />
          <ResultRow label="Latest filing year" value={summary.latestYear} />
          <ResultRow label="Form" value={summary.form} />
          <ResultRow label="Public values" value={summary.publicValues} />
          <ResultRow label="Mayor-specific disclosures" value={summary.leaderSpecific} />
        </div>
      )}

      <details className="rounded-lg border border-gray-200 bg-white">
        <summary className="text-xs font-medium text-gray-700 px-3 py-2.5 cursor-pointer touch-manipulation list-none flex items-center justify-between gap-2">
          <span>Filing history &amp; framework</span>
          <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" aria-hidden />
        </summary>
        <div className="px-3 pb-3 pt-1 space-y-2 border-t border-gray-100">
          {fd?.regulatory_framework && (
            <p className="text-xs text-gray-600">{fd.regulatory_framework}</p>
          )}
          {fd?.filing_status_note && (
            <p className="text-xs text-gray-700 leading-relaxed">{fd.filing_status_note}</p>
          )}
          {fd?.portal_note && (
            <p className="text-xs text-gray-500 italic leading-relaxed">{fd.portal_note}</p>
          )}
          {Array.isArray(fd?.filings) && fd.filings.length > 0 && (
            <ul className="space-y-2">
              {fd.filings.slice(0, 12).map((f, i) => (
                <li key={f.index_id || i} className="text-xs border border-gray-200 rounded-lg p-2.5 bg-gray-50">
                  <p className="font-semibold text-gray-900">
                    {f.filing_year} · {f.position}
                    {f.agency ? ` — ${f.agency}` : ''}
                  </p>
                  <p className="text-gray-600 mt-0.5">
                    {f.filing_type}
                    {f.filed_date ? ` · filed ${f.filed_date}` : ''}
                    {f.is_amendment ? ' · amendment' : ''}
                  </p>
                </li>
              ))}
            </ul>
          )}
          {ukLonNeedsManualReview(fd) && frameworkNote()}
        </div>
      </details>

      {sourceLink(src, 'Mayor register of interests')}
    </div>
  );
}

function DetailDeclaredAssets({ row }) {
  const da = row?.declared_assets;
  const src = ukLonSourceUrl(da);
  const rows = da?.rows || [];
  const pageComments = da?.page_comments || [];

  return (
    <div className="pt-3 space-y-2">
      <p className="text-xs text-gray-700 leading-relaxed">{REPORTED_HOLDINGS_LABEL}</p>
      {rows.length > 0 ? (
        <ReportedHoldingsTable rows={rows} caption={`${rows.length} official register row(s)`} />
      ) : (
        <p className="text-xs text-gray-600 italic">
          {da?.status === 'no_official_records_found'
            ? 'No machine-readable rows extracted; open official register on london.gov.uk.'
            : 'Official rows not loaded yet.'}
        </p>
      )}
      {pageComments.length > 0 && (
        <details className="rounded-lg border border-gray-200 bg-gray-50/80 mt-2">
          <summary className="text-xs font-medium text-gray-700 px-3 py-2 cursor-pointer">
            Filing page comments ({pageComments.length})
          </summary>
          <ul className="px-3 pb-2 space-y-1 text-xs text-gray-600">
            {pageComments.map((c, i) => (
              <li key={i}>
                Page {c.page}: {c.comment}
              </li>
            ))}
          </ul>
        </details>
      )}
      {ukLonNeedsManualReview(da) && frameworkNote()}
      {sourceLink(src, 'Register of interests')}
    </div>
  );
}

function DetailStockHoldings({ row }) {
  const sh = row?.stock_holdings;
  const src = ukLonSourceUrl(sh);
  const rows = sh?.rows || [];

  return (
    <div className="pt-3 space-y-2">
      {sh?.disclosure_note && (
        <p className="text-xs text-gray-600 leading-relaxed">{sh.disclosure_note}</p>
      )}
      {rows.length > 0 ? (
        <ReportedHoldingsTable
          rows={rows}
          caption={`${rows.length} interest row(s) from GLA register (not stock purchases)`}
        />
      ) : (
        <p className="text-xs text-gray-600 italic">
          {sh?.status === 'no_official_records_found'
            ? 'No share/security rows identified in extracted register text.'
            : 'No investment rows loaded.'}
        </p>
      )}
      {ukLonNeedsManualReview(sh) && frameworkNote()}
      {sourceLink(src, 'Register of interests')}
    </div>
  );
}

function DetailGiftsHospitality({ row }) {
  const gh = row?.gifts_hospitality;
  const src = ukLonSourceUrl(gh);
  return (
    <div className="pt-3 space-y-3">
      {gh?.rule_summary && <p className="text-xs text-gray-700 leading-relaxed">{gh.rule_summary}</p>}
      {Array.isArray(gh?.gifts) && gh.gifts.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-800 mb-1">Gifts (Schedule D)</p>
          <ul className="space-y-2 max-h-64 overflow-y-auto">
            {gh.gifts.map((g, i) => (
              <li key={i} className="text-xs border border-gray-200 rounded-lg p-2.5 bg-gray-50">
                <p className="font-medium text-gray-900">{g.source}</p>
                <p className="text-gray-700">{g.description}</p>
                <p className="text-gray-500 mt-0.5">
                  {g.date ? `${g.date} · ` : ''}
                  {g.value_text || (g.value != null ? formatMoney(g.value, 'GBP', 2) : '')}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
      {Array.isArray(gh?.travel_payments) && gh.travel_payments.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-800 mb-1">Travel payments (Schedule E)</p>
          <ul className="space-y-2">
            {gh.travel_payments.map((t, i) => (
              <li key={i} className="text-xs border border-gray-200 rounded-lg p-2.5 bg-gray-50">
                <p className="font-medium text-gray-900">{t.source}</p>
                <p className="text-gray-700">{t.purpose}</p>
                <p className="text-gray-800 mt-0.5">
                  {t.amount_text || (t.amount != null ? formatMoney(t.amount, 'GBP', 2) : '')}
                  {t.travel_destination ? ` · ${t.travel_destination}` : ''}
                </p>
                {t.date_range && <p className="text-gray-500">{t.date_range}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}
      {sourceLink(src, 'Mayor gifts & hospitality register')}
    </div>
  );
}

function DetailCampaignFinance({ row }) {
  const cf = row?.campaign_finance;
  const src = row?.field_sources?.campaign_finance;
  return (
    <div className="pt-3 space-y-2">
      {cf?.summary && <p className="text-xs text-gray-700 leading-relaxed">{cf.summary}</p>}
      {cf?.data_as_of && <p className="text-xs text-gray-500">Data as of {cf.data_as_of}</p>}
      {Array.isArray(cf?.committees) && cf.committees.length > 0 && (
        <ul className="space-y-2">
          {cf.committees.map((c) => (
            <li key={c.committee_id} className="text-xs border border-gray-200 rounded-lg p-2.5 bg-gray-50">
              <p className="font-medium text-gray-900">{c.name}</p>
              <p className="text-gray-700 mt-0.5">
                {c.total_amount_text} · {c.contribution_count?.toLocaleString('en-US')} contributions
              </p>
              {c.source_url && sourceLink(c.source_url, 'View on Electoral Commission')}
            </li>
          ))}
        </ul>
      )}
      {Array.isArray(cf?.items) && cf.items.length > 0 && (
        <>
          <p className="text-xs font-semibold text-gray-800 mt-2">Largest contributors (sample)</p>
          <ul className="space-y-2">
            {cf.items.map((it, i) => (
              <li
                key={i}
                className="text-xs text-gray-700 flex justify-between gap-3 py-1.5 border-b border-gray-100 last:border-0"
              >
                <span className="min-w-0">{it.name || it.contributor}</span>
                <span className="font-medium shrink-0">
                  {it.amount_text || (it.amount != null ? formatMoney(it.amount, 'GBP', 2) : '')}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
      {cf?.top_contributors_note && (
        <p className="text-xs text-gray-500 leading-relaxed">{cf.top_contributors_note}</p>
      )}
      {sourceLink(src, 'Electoral Commission donations search')}
    </div>
  );
}

function DetailLobbyingRecords({ row }) {
  const lr = row?.lobbying_records;
  const src = ukLonSourceUrl(lr);
  const rows = lr?.rows || [];
  const noTarget =
    lr?.status === 'no_official_target_specific_lobbying_records_found' || rows.length === 0;

  return (
    <div className="pt-3 space-y-2">
      {lr?.data_as_of && (
        <p className="text-xs text-gray-500">Data: {lr.data_as_of}</p>
      )}
      {noTarget && !lr?.error ? (
        <p className="text-xs text-gray-800 font-medium">
          No official target-specific lobbying records found.
        </p>
      ) : (
        <>
          {lr?.note && <p className="text-xs text-gray-700 leading-relaxed">{lr.note}</p>}
          <LobbyingRecordsTable rows={rows} />
        </>
      )}
      {lr?.status === 'official_data_requires_manual_review' && (
        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          {lr.error
            ? `GLA meetings data could not be loaded: ${lr.error}`
            : 'Mayor meetings are published on london.gov.uk; automated fetch was not available from this environment.'}
        </p>
      )}
      {rows.length > 0 && (
        <p className="text-[10px] text-gray-500 leading-relaxed">
          There is no UK lobbying register specific to the Mayor; GLA meetings diary rows are shown when available.
        </p>
      )}
      {sourceLink(lr?.portal, 'GLA meetings & decisions')}
      {sourceLink(src)}
    </div>
  );
}

function DetailRecentActivity({ row }) {
  const items = row?.recent_official_activity || [];
  const src = row?.field_sources?.recent_official_activity;
  return (
    <div className="pt-3 space-y-2">
      {items.map((it, i) => (
        <div key={i} className="text-xs border-b border-gray-100 pb-2.5 last:border-0">
          {it.url ? (
            <a
              href={it.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-blue-700 hover:underline leading-snug"
            >
              {it.title}
            </a>
          ) : (
            <p className="font-semibold text-gray-900">{it.title}</p>
          )}
          {it.date && <p className="text-gray-500 mt-0.5">{it.date}</p>}
        </div>
      ))}
      {sourceLink(src, 'Mayor press releases')}
    </div>
  );
}

const DETAIL_COMPONENTS = {
  salary: DetailSalary,
  financial_disclosure: DetailFinancialDisclosure,
  declared_assets: DetailDeclaredAssets,
  stock_holdings: DetailStockHoldings,
  gifts_hospitality: DetailGiftsHospitality,
  campaign_finance: DetailCampaignFinance,
  lobbying_records: DetailLobbyingRecords,
  recent_official_activity: DetailRecentActivity,
};

/**
 * @param {{ transparencyRow: Record<string, unknown>|null, loading: boolean }} props
 */
export default function UkLonLeaderTransparencySections({ transparencyRow, loading }) {
  const [openSections, setOpenSections] = useState(() => ({}));

  const toggleSection = useCallback((key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const summaryCards =
    !loading && transparencyRow ? buildUsCaTransparencySummaryCards(transparencyRow) : [];

  return (
    <section className="uk-lon-leader-transparency">
      <p className="panel-section-label">Official transparency</p>
      {loading && (
        <p className="text-xs text-gray-500 mb-3 flex items-center gap-2">
          <span className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin inline-block" />
          Loading official transparency data…
        </p>
      )}

      {!loading && transparencyRow?.data_completeness_note && (
        <details className="mb-3 rounded-lg border border-slate-200 bg-slate-50/90">
          <summary className="text-xs font-medium text-slate-700 px-3 py-2.5 cursor-pointer touch-manipulation list-none flex items-center justify-between gap-2">
            <span>Data coverage note</span>
            <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0" aria-hidden />
          </summary>
          <p className="text-xs text-gray-600 px-3 pb-3 leading-relaxed border-t border-slate-200">
            {transparencyRow.data_completeness_note}
          </p>
        </details>
      )}

      {!loading && summaryCards.length > 0 && (
        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500 mb-2">Summary</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {summaryCards.map((card) => (
              <SummaryCard
                key={card.id}
                title={card.title}
                lines={card.lines}
                highlight={card.highlight}
              />
            ))}
          </div>
        </div>
      )}

      {!loading && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500 mb-2">Details</p>
          <div className="space-y-2">
            {UK_LON_TRANSPARENCY_SECTIONS.map(({ key, label }) => {
              const loaded = ukLonTransparencySectionLoaded(key, transparencyRow);
              const Detail = DETAIL_COMPONENTS[key];
              const subtitle = loaded ? ukLonAccordionSubtitle(key, transparencyRow) : '';

              return (
                <TransparencyAccordion
                  key={key}
                  id={key}
                  title={label}
                  subtitle={subtitle}
                  open={!!openSections[key]}
                  onToggle={() => toggleSection(key)}
                  disabled={!loaded}
                >
                  {!loaded ? pendingNote() : Detail ? <Detail row={transparencyRow} /> : null}
                </TransparencyAccordion>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
