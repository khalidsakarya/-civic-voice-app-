import React, { useState, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  CA_ON_TRANSPARENCY_SECTIONS,
  FRAMEWORK_ONLY_NOTE,
  buildCaOnTransparencySummaryCards,
  caOnAccordionSubtitle,
  caOnNeedsManualReview,
  caOnSourceUrl,
  caOnTransparencySectionLoaded,
  formatMoney,
} from '../utils/caOnLeaderTransparency';

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

function BulletList({ items }) {
  if (!Array.isArray(items) || !items.length) return null;
  return (
    <ul className="mt-2 space-y-1.5 list-disc list-outside ml-4 text-xs text-gray-700 leading-relaxed">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

function SummaryCard({ title, lines, highlight }) {
  return (
    <div
      className={`rounded-xl border p-3 sm:p-3.5 ${
        highlight
          ? 'border-emerald-200 bg-emerald-50/80'
          : 'border-gray-200 bg-white'
      }`}
    >
      <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wide text-gray-500">
        {title}
      </p>
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
  const panelId = `ca-on-transparency-${id}`;
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
        {sal?.amount_text || (sal?.amount != null ? formatMoney(sal.amount, 'CAD', 2) : '')}
        {sal?.period ? ` · ${sal.period}` : ''}
      </p>
      {sal?.description && <p className="text-xs text-gray-600 leading-relaxed">{sal.description}</p>}
      {sourceLink(src)}
    </div>
  );
}

function DetailConflictFilings({ row }) {
  const block = row?.conflict_of_interest_filings;
  const inquiries = block?.inquiries || [];
  const src = caOnSourceUrl(block) || row?.field_sources?.conflict_of_interest_filings;

  return (
    <div className="pt-3 space-y-3">
      {block?.all_outcomes && (
        <p className="text-xs text-gray-700 leading-relaxed">{block.all_outcomes}</p>
      )}
      {block?.reporting_period && (
        <p className="text-xs text-gray-500">Reporting period: {block.reporting_period}</p>
      )}
      <div className="space-y-3">
        {inquiries.map((inq, i) => (
          <div
            key={inq.source_url || inq.date || i}
            className="text-xs border border-gray-200 rounded-lg p-3 bg-gray-50"
          >
            <p className="font-semibold text-gray-900">
              {inq.date}
              {inq.type ? ` · ${inq.type}` : ''}
            </p>
            <p className="text-gray-800 mt-1 font-medium leading-snug">{inq.title}</p>
            {inq.subject && <p className="text-gray-600 mt-1 leading-relaxed">{inq.subject}</p>}
            {inq.outcome && (
              <p className="text-gray-700 mt-1.5 leading-relaxed">
                <span className="font-semibold">Outcome: </span>
                {inq.outcome}
              </p>
            )}
            {(inq.witnesses_interviewed != null || inq.documents_reviewed != null) && (
              <p className="text-gray-500 mt-1">
                {inq.witnesses_interviewed != null ? `${inq.witnesses_interviewed} witnesses` : ''}
                {inq.witnesses_interviewed != null && inq.documents_reviewed != null ? ' · ' : ''}
                {inq.documents_reviewed != null
                  ? `${inq.documents_reviewed.toLocaleString('en-CA')} documents reviewed`
                  : ''}
              </p>
            )}
            {inq.source_url && sourceLink(inq.source_url, 'View OICO report (PDF)')}
          </div>
        ))}
      </div>
      {sourceLink(src, 'View all commissioner reports')}
    </div>
  );
}

function parseFinancialDisclosureSummary(fd) {
  if (!fd || typeof fd !== 'object') return null;

  const filingText = String(fd.filing_status_2024 || '');
  const status = /^filed/i.test(filingText)
    ? 'Filed'
    : filingText.split(/[—–-]/)[0]?.trim() || 'See official report';

  const mppCount = filingText.match(/(\d+)\s+sitting\s+Ontario\s+MPPs/i);
  const coverage = mppCount
    ? `${mppCount[1]} / ${mppCount[1]} Ontario MPPs filed annual statements`
    : filingText.includes('124')
      ? '124 / 124 Ontario MPPs filed annual statements'
      : 'All sitting Ontario MPPs filed annual statements';

  const periodFromField = String(fd.reporting_period || '');
  const periodMatch =
    periodFromField.match(/fall\s+20\d{2}/i) || filingText.match(/fall\s+20\d{2}/i);
  const latestPeriod = periodMatch
    ? periodMatch[0].charAt(0).toUpperCase() + periodMatch[0].slice(1)
    : periodFromField.replace(/^annual\s*[—–-]\s*most recent filing:\s*/i, '').trim() ||
      'Fall 2024';

  const publicValues =
    fd.portal_note || fd.disclosure_note ? 'Not machine-readable' : 'See official source';

  return {
    status,
    coverage,
    latestPeriod,
    publicValues,
    fordSpecific: 'Requires manual portal review',
  };
}

function DisclosureResultRow({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5 py-2 border-b border-gray-100 last:border-0 sm:flex-row sm:gap-3">
      <span className="text-xs font-medium text-gray-500 sm:w-44 flex-shrink-0">{label}</span>
      <span className="text-xs text-gray-900 leading-relaxed">{value}</span>
    </div>
  );
}

function DetailFinancialDisclosure({ row }) {
  const [howOpen, setHowOpen] = useState(false);
  const fd = row?.financial_disclosure;
  const src = caOnSourceUrl(fd);
  const summary = parseFinancialDisclosureSummary(fd);

  return (
    <div className="pt-3 space-y-3">
      {summary && (
        <div className="rounded-lg border border-gray-200 bg-gray-50/90 px-3 py-1">
          <DisclosureResultRow label="Status" value={summary.status} />
          <DisclosureResultRow label="Coverage" value={summary.coverage} />
          <DisclosureResultRow label="Latest period" value={summary.latestPeriod} />
          <DisclosureResultRow label="Public values" value={summary.publicValues} />
          <DisclosureResultRow
            label="Doug Ford-specific values"
            value={summary.fordSpecific}
          />
        </div>
      )}

      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        <button
          type="button"
          onClick={() => setHowOpen((o) => !o)}
          className="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-left text-xs font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100 touch-manipulation"
        >
          <span>How disclosure works</span>
          <ChevronDown
            className={`w-4 h-4 text-gray-500 flex-shrink-0 transition-transform duration-200 ${howOpen ? 'rotate-180' : ''}`}
            aria-hidden
          />
        </button>
        {howOpen && (
          <div className="px-3 pb-3 pt-1 space-y-2 border-t border-gray-100">
            {fd?.regulatory_framework && (
              <p className="text-xs text-gray-600">{fd.regulatory_framework}</p>
            )}
            {fd?.filing_status_2024 && (
              <p className="text-xs text-gray-700 leading-relaxed">{fd.filing_status_2024}</p>
            )}
            {fd?.reporting_period && (
              <p className="text-xs text-gray-500">{fd.reporting_period}</p>
            )}
            {fd?.disclosure_note && (
              <p className="text-xs text-gray-600 leading-relaxed">{fd.disclosure_note}</p>
            )}
            {fd?.portal_note && (
              <p className="text-xs text-gray-500 italic leading-relaxed">{fd.portal_note}</p>
            )}
            <BulletList items={fd?.what_is_disclosed} />
            <BulletList items={fd?.cabinet_restrictions} />
            {caOnNeedsManualReview(fd) && frameworkNote()}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1">
        {sourceLink(src, 'View OICO guidance')}
        {fd?.portal && sourceLink(fd.portal, 'MPP disclosure portal')}
      </div>
    </div>
  );
}

function DetailDeclaredAssets({ row }) {
  const da = row?.declared_assets;
  const src = caOnSourceUrl(da);
  return (
    <div className="pt-3 space-y-2">
      {da?.framework && <p className="text-xs text-gray-700">{da.framework}</p>}
      {da?.annual_filing_required && (
        <p className="text-xs text-gray-600">Annual filing required under provincial rules.</p>
      )}
      <BulletList items={da?.categories_required} />
      <BulletList items={da?.asset_restrictions_as_premier} />
      {da?.specific_values_available_at && (
        <p className="text-xs text-gray-500 leading-relaxed">{da.specific_values_available_at}</p>
      )}
      {caOnNeedsManualReview(da) && frameworkNote()}
      {sourceLink(src)}
      {da?.portal && sourceLink(da.portal, 'MPP disclosure portal')}
    </div>
  );
}

function DetailStockHoldings({ row }) {
  const sh = row?.stock_holdings;
  const src = caOnSourceUrl(sh);
  return (
    <div className="pt-3 space-y-2">
      {sh?.cabinet_prohibition && (
        <p className="text-xs text-gray-700 leading-relaxed">{sh.cabinet_prohibition}</p>
      )}
      {sh?.compliance_mechanism && <p className="text-xs text-gray-600">{sh.compliance_mechanism}</p>}
      {sh?.ford_specific_note && (
        <p className="text-xs text-gray-500 italic leading-relaxed">{sh.ford_specific_note}</p>
      )}
      {sh?.ford_specific_holdings === 'no_official_records_found' && (
        <p className="text-xs text-gray-600">
          No Ford-specific holdings published in machine-readable official data.
        </p>
      )}
      <BulletList items={sh?.permitted_instruments} />
      <BulletList items={sh?.prohibited_instruments} />
      {sh?.management_trusts_confirmed?.note && (
        <p className="text-xs text-gray-600">{sh.management_trusts_confirmed.note}</p>
      )}
      {caOnNeedsManualReview(sh) && frameworkNote()}
      {sourceLink(src, 'View OICO cabinet ministers guidance')}
      {sh?.portal && sourceLink(sh.portal, 'MPP disclosure portal')}
    </div>
  );
}

function DetailGiftsHospitality({ row }) {
  const gh = row?.gifts_hospitality;
  const src = caOnSourceUrl(gh);
  return (
    <div className="pt-3 space-y-2">
      {gh?.rule_summary && <p className="text-xs text-gray-700 leading-relaxed">{gh.rule_summary}</p>}
      {gh?.regulatory_framework && <p className="text-xs text-gray-600">{gh.regulatory_framework}</p>}
      {gh?.approved_disclosure_threshold_cad != null && (
        <p className="text-xs text-gray-600">
          Public disclosure threshold: gifts over ${gh.approved_disclosure_threshold_cad} CAD (when
          accepted).
        </p>
      )}
      {gh?.public_disclosure_note && (
        <p className="text-xs text-gray-600 leading-relaxed">{gh.public_disclosure_note}</p>
      )}
      {gh?.fy_2024_25_gift_advice_requests_all_mpps != null && (
        <p className="text-xs text-gray-500">
          {gh.fy_2024_25_note ||
            `${gh.fy_2024_25_gift_advice_requests_all_mpps} gift-related advice requests (all MPPs, FY 2024–25).`}
        </p>
      )}
      {caOnNeedsManualReview(gh) && frameworkNote()}
      {sourceLink(src, 'View OICO annual report')}
      {gh?.individual_disclosures_portal &&
        sourceLink(gh.individual_disclosures_portal, 'MPP disclosure portal')}
    </div>
  );
}

function DetailCampaignFinance({ row }) {
  const cf = row?.campaign_finance;
  const src = row?.field_sources?.campaign_finance;
  return (
    <div className="pt-3 space-y-2">
      {cf?.summary && <p className="text-xs text-gray-700 leading-relaxed">{cf.summary}</p>}
      {Array.isArray(cf?.items) && cf.items.length > 0 && (
        <ul className="space-y-2">
          {cf.items.slice(0, 8).map((it, i) => (
            <li
              key={i}
              className="text-xs text-gray-700 flex justify-between gap-3 py-1.5 border-b border-gray-100 last:border-0"
            >
              <span className="min-w-0">{it.name || it.contributor}</span>
              <span className="font-medium shrink-0">
                {it.amount_text || (it.amount != null ? formatMoney(it.amount, 'CAD', 2) : '')}
              </span>
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs text-gray-500 leading-relaxed">
        Top contributors by total amount from Elections Ontario filed returns (not a complete donor
        list).
      </p>
      {sourceLink(src, 'Search Elections Ontario contributions')}
    </div>
  );
}

function DetailLobbyingRecords({ row }) {
  const lr = row?.lobbying_records;
  const stats = lr?.registry_statistics_fy_2024_25;
  const src = caOnSourceUrl(lr);
  return (
    <div className="pt-3 space-y-2">
      {lr?.regulatory_framework && <p className="text-xs text-gray-700">{lr.regulatory_framework}</p>}
      {lr?.premier_office_note && (
        <p className="text-xs text-gray-600 leading-relaxed">{lr.premier_office_note}</p>
      )}
      {lr?.premier_office_specific_registrations === 'no_official_records_found' && (
        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          No official registry records naming the Premier&apos;s office as a lobbying target were
          found in published data.
        </p>
      )}
      {stats && (
        <div className="grid grid-cols-2 gap-2">
          {stats.active_registered_lobbyists_march_2025 != null && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-center">
              <p className="text-base font-bold text-gray-900">
                {stats.active_registered_lobbyists_march_2025.toLocaleString('en-CA')}
              </p>
              <p className="text-[10px] text-gray-500 mt-0.5">Active lobbyists (Mar 2025)</p>
            </div>
          )}
          {stats.active_registrations_march_2025 != null && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-center">
              <p className="text-base font-bold text-gray-900">
                {stats.active_registrations_march_2025.toLocaleString('en-CA')}
              </p>
              <p className="text-[10px] text-gray-500 mt-0.5">Active registrations (Mar 2025)</p>
            </div>
          )}
          {stats.investigations_commenced != null && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-center">
              <p className="text-base font-bold text-gray-900">{stats.investigations_commenced}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">Investigations (FY 2024–25)</p>
            </div>
          )}
          {stats.compliance_reviews_potential_non_compliance != null && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-center">
              <p className="text-base font-bold text-gray-900">
                {stats.compliance_reviews_potential_non_compliance}
              </p>
              <p className="text-[10px] text-gray-500 mt-0.5">Compliance reviews (FY 2024–25)</p>
            </div>
          )}
        </div>
      )}
      {stats?.greenbelt_note && (
        <p className="text-xs text-gray-500 leading-relaxed">{stats.greenbelt_note}</p>
      )}
      {lr?.portal_access && <p className="text-xs text-gray-500 italic">{lr.portal_access}</p>}
      {frameworkNote()}
      {sourceLink(src, 'View OICO annual report')}
      {lr?.registry_portal && sourceLink(lr.registry_portal, 'Lobbyist registry')}
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
          {it.excerpt && <p className="text-gray-600 mt-0.5 leading-relaxed line-clamp-3">{it.excerpt}</p>}
        </div>
      ))}
      {sourceLink(src)}
    </div>
  );
}

const DETAIL_COMPONENTS = {
  salary: DetailSalary,
  conflict_of_interest_filings: DetailConflictFilings,
  financial_disclosure: DetailFinancialDisclosure,
  declared_assets: DetailDeclaredAssets,
  stock_holdings: DetailStockHoldings,
  gifts_hospitality: DetailGiftsHospitality,
  campaign_finance: DetailCampaignFinance,
  lobbying_records: DetailLobbyingRecords,
  recent_official_activity: DetailRecentActivity,
};

const ACCORDION_LABELS = {
  conflict_of_interest_filings: 'Conflict of interest reports',
};

/**
 * @param {{ transparencyRow: Record<string, unknown>|null, loading: boolean }} props
 */
export default function CaOnLeaderTransparencySections({ transparencyRow, loading }) {
  const [openSections, setOpenSections] = useState(() => ({}));

  const toggleSection = useCallback((key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const summaryCards = !loading && transparencyRow ? buildCaOnTransparencySummaryCards(transparencyRow) : [];

  return (
    <section className="ca-on-leader-transparency">
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
          <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500 mb-2">
            Summary
          </p>
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
          <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500 mb-2">
            Details
          </p>
          <div className="space-y-2">
            {CA_ON_TRANSPARENCY_SECTIONS.map(({ key, label }) => {
              const loaded = caOnTransparencySectionLoaded(key, transparencyRow);
              const Detail = DETAIL_COMPONENTS[key];
              const accordionTitle = ACCORDION_LABELS[key] || label;
              const subtitle = loaded ? caOnAccordionSubtitle(key, transparencyRow) : '';

              return (
                <TransparencyAccordion
                  key={key}
                  id={key}
                  title={accordionTitle}
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
