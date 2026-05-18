import React from 'react';
import {
  CA_ON_TRANSPARENCY_SECTIONS,
  FRAMEWORK_ONLY_NOTE,
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
    <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-2 leading-relaxed">
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
      className="text-xs text-blue-600 underline mt-2 inline-block"
    >
      {label}
    </a>
  );
}

function BulletList({ items }) {
  if (!Array.isArray(items) || !items.length) return null;
  return (
    <ul className="mt-2 space-y-1 list-disc list-inside text-xs text-gray-700">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

function SectionCard({ label, children }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">{label}</p>
      {children}
    </div>
  );
}

function renderSalary(row) {
  const sal = row?.salary;
  const src = row?.field_sources?.salary;
  return (
    <SectionCard label="Salary">
      <p className="text-sm font-semibold text-gray-900">
        {sal?.amount_text || (sal?.amount != null ? formatMoney(sal.amount) : '')}
        {sal?.period ? ` · ${sal.period}` : ''}
      </p>
      {sal?.description && <p className="text-xs text-gray-600 mt-1">{sal.description}</p>}
      {sourceLink(src)}
    </SectionCard>
  );
}

function renderConflictFilings(row) {
  const block = row?.conflict_of_interest_filings;
  const inquiries = block?.inquiries || [];
  const src = caOnSourceUrl(block) || row?.field_sources?.conflict_of_interest_filings;

  return (
    <SectionCard label="Conflict of interest — OICO reports">
      {block?.all_outcomes && (
        <p className="text-sm text-gray-700 leading-relaxed">{block.all_outcomes}</p>
      )}
      {block?.reporting_period && (
        <p className="text-xs text-gray-500 mt-1">Reporting period: {block.reporting_period}</p>
      )}
      <div className="mt-3 space-y-3 max-h-80 overflow-y-auto">
        {inquiries.map((inq, i) => (
          <div
            key={inq.source_url || inq.date || i}
            className="text-xs border border-gray-200 rounded-lg p-3 bg-white"
          >
            <p className="font-semibold text-gray-900">
              {inq.date}
              {inq.type ? ` · ${inq.type}` : ''}
            </p>
            <p className="text-gray-800 mt-1 font-medium">{inq.title}</p>
            {inq.subject && <p className="text-gray-600 mt-1 leading-relaxed">{inq.subject}</p>}
            {inq.outcome && (
              <p className="text-gray-700 mt-1.5 leading-relaxed">
                <span className="font-semibold">Outcome: </span>
                {inq.outcome}
              </p>
            )}
            {(inq.witnesses_interviewed != null || inq.documents_reviewed != null) && (
              <p className="text-gray-500 mt-1">
                {inq.witnesses_interviewed != null
                  ? `${inq.witnesses_interviewed} witnesses`
                  : ''}
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
    </SectionCard>
  );
}

function renderFinancialDisclosure(row) {
  const fd = row?.financial_disclosure;
  const src = caOnSourceUrl(fd);

  return (
    <SectionCard label="Financial disclosure">
      {fd?.filing_status_2024 && (
        <p className="text-sm text-gray-700 leading-relaxed">{fd.filing_status_2024}</p>
      )}
      {fd?.regulatory_framework && (
        <p className="text-xs text-gray-600 mt-1">{fd.regulatory_framework}</p>
      )}
      {fd?.reporting_period && (
        <p className="text-xs text-gray-500 mt-1">Period: {fd.reporting_period}</p>
      )}
      {fd?.disclosure_note && (
        <p className="text-xs text-gray-600 mt-2 leading-relaxed">{fd.disclosure_note}</p>
      )}
      {fd?.portal_note && (
        <p className="text-xs text-gray-500 mt-2 italic leading-relaxed">{fd.portal_note}</p>
      )}
      <BulletList items={fd?.what_is_disclosed} />
      <BulletList items={fd?.cabinet_restrictions} />
      {caOnNeedsManualReview(fd) && frameworkNote()}
      {sourceLink(src, 'View OICO guidance')}
      {fd?.portal && sourceLink(fd.portal, 'MPP disclosure portal')}
    </SectionCard>
  );
}

function renderDeclaredAssets(row) {
  const da = row?.declared_assets;
  const src = caOnSourceUrl(da);

  return (
    <SectionCard label="Declared assets">
      {da?.framework && <p className="text-sm text-gray-700">{da.framework}</p>}
      {da?.annual_filing_required && (
        <p className="text-xs text-gray-600 mt-1">Annual filing required under provincial rules.</p>
      )}
      <BulletList items={da?.categories_required} />
      <BulletList items={da?.asset_restrictions_as_premier} />
      {da?.specific_values_available_at && (
        <p className="text-xs text-gray-500 mt-2 leading-relaxed">{da.specific_values_available_at}</p>
      )}
      {caOnNeedsManualReview(da) && frameworkNote()}
      {sourceLink(src)}
      {da?.portal && sourceLink(da.portal, 'MPP disclosure portal')}
    </SectionCard>
  );
}

function renderStockHoldings(row) {
  const sh = row?.stock_holdings;
  const src = caOnSourceUrl(sh);

  return (
    <SectionCard label="Stock holdings">
      {sh?.cabinet_prohibition && (
        <p className="text-sm text-gray-700 leading-relaxed">{sh.cabinet_prohibition}</p>
      )}
      {sh?.compliance_mechanism && (
        <p className="text-xs text-gray-600 mt-1">{sh.compliance_mechanism}</p>
      )}
      {sh?.ford_specific_note && (
        <p className="text-xs text-gray-500 mt-2 italic leading-relaxed">{sh.ford_specific_note}</p>
      )}
      {sh?.ford_specific_holdings === 'no_official_records_found' && (
        <p className="text-xs text-gray-600 mt-1">
          No Ford-specific holdings published in machine-readable official data.
        </p>
      )}
      <BulletList items={sh?.permitted_instruments} />
      <BulletList items={sh?.prohibited_instruments} />
      {sh?.management_trusts_confirmed?.note && (
        <p className="text-xs text-gray-600 mt-2">{sh.management_trusts_confirmed.note}</p>
      )}
      {caOnNeedsManualReview(sh) && frameworkNote()}
      {sourceLink(src, 'View OICO cabinet ministers guidance')}
      {sh?.portal && sourceLink(sh.portal, 'MPP disclosure portal')}
    </SectionCard>
  );
}

function renderGiftsHospitality(row) {
  const gh = row?.gifts_hospitality;
  const src = caOnSourceUrl(gh);

  return (
    <SectionCard label="Gifts & hospitality">
      {gh?.rule_summary && <p className="text-sm text-gray-700 leading-relaxed">{gh.rule_summary}</p>}
      {gh?.regulatory_framework && (
        <p className="text-xs text-gray-600 mt-1">{gh.regulatory_framework}</p>
      )}
      {gh?.approved_disclosure_threshold_cad != null && (
        <p className="text-xs text-gray-600 mt-1">
          Public disclosure threshold: gifts over ${gh.approved_disclosure_threshold_cad} CAD (when
          accepted).
        </p>
      )}
      {gh?.public_disclosure_note && (
        <p className="text-xs text-gray-600 mt-2 leading-relaxed">{gh.public_disclosure_note}</p>
      )}
      {gh?.fy_2024_25_gift_advice_requests_all_mpps != null && (
        <p className="text-xs text-gray-500 mt-1">
          {gh.fy_2024_25_note ||
            `${gh.fy_2024_25_gift_advice_requests_all_mpps} gift-related advice requests (all MPPs, FY 2024–25).`}
        </p>
      )}
      {caOnNeedsManualReview(gh) && frameworkNote()}
      {sourceLink(src, 'View OICO annual report')}
      {gh?.individual_disclosures_portal &&
        sourceLink(gh.individual_disclosures_portal, 'MPP disclosure portal')}
    </SectionCard>
  );
}

function renderCampaignFinance(row) {
  const cf = row?.campaign_finance;
  const src = row?.field_sources?.campaign_finance;

  return (
    <SectionCard label="Campaign finance">
      {cf?.summary && <p className="text-sm text-gray-700 leading-relaxed">{cf.summary}</p>}
      {Array.isArray(cf?.items) && cf.items.length > 0 && (
        <ul className="mt-2 space-y-1">
          {cf.items.slice(0, 8).map((it, i) => (
            <li key={i} className="text-xs text-gray-700 flex justify-between gap-2">
              <span>{it.name || it.contributor}</span>
              <span className="font-medium shrink-0">
                {it.amount_text || (it.amount != null ? formatMoney(it.amount) : '')}
              </span>
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs text-gray-500 mt-2">
        Top contributors by total amount from Elections Ontario filed returns (not a complete donor
        list).
      </p>
      {sourceLink(src, 'Search Elections Ontario contributions')}
    </SectionCard>
  );
}

function renderLobbyingRecords(row) {
  const lr = row?.lobbying_records;
  const stats = lr?.registry_statistics_fy_2024_25;
  const src = caOnSourceUrl(lr);

  return (
    <SectionCard label="Lobbying records">
      {lr?.regulatory_framework && (
        <p className="text-sm text-gray-700">{lr.regulatory_framework}</p>
      )}
      {lr?.premier_office_note && (
        <p className="text-xs text-gray-600 mt-2 leading-relaxed">{lr.premier_office_note}</p>
      )}
      {lr?.premier_office_specific_registrations === 'no_official_records_found' && (
        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-2">
          No official registry records naming the Premier&apos;s office as a lobbying target were
          found in published data.
        </p>
      )}
      {stats && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {stats.active_registered_lobbyists_march_2025 != null && (
            <div className="bg-white border border-gray-200 rounded-lg p-2 text-center">
              <p className="text-base font-bold text-gray-900">
                {stats.active_registered_lobbyists_march_2025.toLocaleString('en-CA')}
              </p>
              <p className="text-[10px] text-gray-500 mt-0.5">Active lobbyists (Mar 2025)</p>
            </div>
          )}
          {stats.active_registrations_march_2025 != null && (
            <div className="bg-white border border-gray-200 rounded-lg p-2 text-center">
              <p className="text-base font-bold text-gray-900">
                {stats.active_registrations_march_2025.toLocaleString('en-CA')}
              </p>
              <p className="text-[10px] text-gray-500 mt-0.5">Active registrations (Mar 2025)</p>
            </div>
          )}
          {stats.investigations_commenced != null && (
            <div className="bg-white border border-gray-200 rounded-lg p-2 text-center">
              <p className="text-base font-bold text-gray-900">{stats.investigations_commenced}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">Investigations commenced (FY 2024–25)</p>
            </div>
          )}
          {stats.compliance_reviews_potential_non_compliance != null && (
            <div className="bg-white border border-gray-200 rounded-lg p-2 text-center">
              <p className="text-base font-bold text-gray-900">
                {stats.compliance_reviews_potential_non_compliance}
              </p>
              <p className="text-[10px] text-gray-500 mt-0.5">Compliance reviews (FY 2024–25)</p>
            </div>
          )}
        </div>
      )}
      {stats?.greenbelt_note && (
        <p className="text-xs text-gray-500 mt-2 leading-relaxed">{stats.greenbelt_note}</p>
      )}
      {lr?.portal_access && (
        <p className="text-xs text-gray-500 mt-2 italic">{lr.portal_access}</p>
      )}
      {frameworkNote()}
      {sourceLink(src, 'View OICO annual report')}
      {lr?.registry_portal && sourceLink(lr.registry_portal, 'Lobbyist registry')}
    </SectionCard>
  );
}

function renderRecentActivity(row) {
  const items = row?.recent_official_activity;
  const src = row?.field_sources?.recent_official_activity;

  return (
    <SectionCard label="Recent official activity">
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
      </div>
      {sourceLink(src)}
    </SectionCard>
  );
}

const RENDERERS = {
  salary: renderSalary,
  conflict_of_interest_filings: renderConflictFilings,
  financial_disclosure: renderFinancialDisclosure,
  declared_assets: renderDeclaredAssets,
  stock_holdings: renderStockHoldings,
  gifts_hospitality: renderGiftsHospitality,
  campaign_finance: renderCampaignFinance,
  lobbying_records: renderLobbyingRecords,
  recent_official_activity: renderRecentActivity,
};

/**
 * @param {{ transparencyRow: Record<string, unknown>|null, loading: boolean }} props
 */
export default function CaOnLeaderTransparencySections({ transparencyRow, loading }) {
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
        <p className="text-xs text-gray-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 mb-4 leading-relaxed">
          {transparencyRow.data_completeness_note}
        </p>
      )}
      <div className="space-y-5">
        {CA_ON_TRANSPARENCY_SECTIONS.map(({ key, label }) => {
          const loaded = !loading && caOnTransparencySectionLoaded(key, transparencyRow);
          const render = RENDERERS[key];
          if (!render) return null;

          if (!loaded) {
            return (
              <div key={key} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">{label}</p>
                {pendingNote()}
              </div>
            );
          }

          return <React.Fragment key={key}>{render(transparencyRow)}</React.Fragment>;
        })}
      </div>
    </section>
  );
}
