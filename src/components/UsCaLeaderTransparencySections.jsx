import React, { useState, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  US_CA_TRANSPARENCY_SECTIONS,
  FRAMEWORK_ONLY_NOTE,
  NOT_DISCLOSED_LABEL,
  REPORTED_HOLDINGS_LABEL,
  buildUsCaTransparencySummaryCards,
  buildUsCaQuickStats,
  usCaAccordionSubtitle,
  usCaNeedsManualReview,
  usCaSourceUrl,
  usCaTransparencySectionLoaded,
  formatMoney,
} from '../utils/usCaLeaderTransparency';

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
        when shown on the official Form 700 filing.
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

function QuickStatCard({ value, label, sub }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-3 py-3 sm:px-4">
      <p className="text-lg sm:text-xl font-black text-gray-900 leading-tight truncate">{value}</p>
      <p className="text-[11px] font-semibold text-gray-600 mt-0.5">{label}</p>
      {sub && <p className="text-[10px] text-gray-400 mt-0.5 leading-snug">{sub}</p>}
    </div>
  );
}

function TransparencyAccordion({ id, title, subtitle, open, onToggle, children, disabled }) {
  const panelId = `us-ca-transparency-${id}`;
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
        {sal?.amount_text || (sal?.amount != null ? formatMoney(sal.amount, 'USD', 2) : '')}
        {sal?.period ? ` · ${sal.period}` : ''}
      </p>
      {sal?.prior_amount_text && (
        <p className="text-xs text-gray-600">
          Prior period ({sal.prior_period}): {sal.prior_amount_text}
        </p>
      )}
      {sal?.description && <p className="text-xs text-gray-600 leading-relaxed">{sal.description}</p>}
      {sourceLink(src, 'View Citizens Compensation Commission salaries')}
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
    status: fd.status === 'filed' ? 'Filed' : String(fd.status || 'See FPPC'),
    latestYear: fd.latest_filing_year != null ? String(fd.latest_filing_year) : '—',
    form: 'Form 700 (Statement of Economic Interests)',
    publicValues: 'Official FPPC value ranges (not exact dollar amounts)',
    newsomSpecific:
      holdingCount > 0
        ? `${holdingCount} reported holding rows from official FPPC electronic filing`
        : usCaNeedsManualReview(fd)
          ? 'Requires FPPC filing review'
          : 'See FPPC search for schedules',
  };
}

function DetailFinancialDisclosure({ row }) {
  const fd = row?.financial_disclosure;
  const src = usCaSourceUrl(fd) || row?.field_sources?.financial_disclosure;
  const summary = parseFinancialDisclosureSummary(fd, row);

  return (
    <div className="pt-3 space-y-3">
      {summary && (
        <div className="rounded-lg border border-gray-200 bg-gray-50/90 px-3 py-1">
          <ResultRow label="Status" value={summary.status} />
          <ResultRow label="Latest filing year" value={summary.latestYear} />
          <ResultRow label="Form" value={summary.form} />
          <ResultRow label="Public values" value={summary.publicValues} />
          <ResultRow label="Newsom-specific values" value={summary.newsomSpecific} />
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
          {usCaNeedsManualReview(fd) && frameworkNote()}
        </div>
      </details>

      {sourceLink(src, 'Search FPPC Form 700 filings')}
    </div>
  );
}

// ── Grouping helpers for declared assets / stock holdings ────────────────────

const TRUST_NAMES_CA = [
  'Gavin C. Newsom Blind Trust',
  'Christopher Thomas Trust',
  'Jennifer Siebel Newsom Blind Trust',
];

function isContinuationRow(r) {
  return /\(cont\.\)/i.test(String(r?.asset_or_entity_name ?? ''));
}
function isPlumpJackRow(r) {
  return /plump\s*jack/i.test(String(r?.asset_or_entity_name ?? ''));
}
function isRealEstateRow(r) {
  const type = String(r?.asset_type ?? '');
  const sched = String(r?.schedule ?? '');
  return /real property/i.test(type) || /real estate/i.test(type) || sched === 'A-1';
}
function isTrustRow(r) {
  const combined = `${r?.asset_or_entity_name ?? ''} ${r?.trust_entity_name ?? ''}`;
  return TRUST_NAMES_CA.some((t) =>
    combined.toLowerCase().includes(t.split(' ').slice(0, 2).join(' ').toLowerCase()),
  ) || /blind trust/i.test(combined);
}

function groupHoldingRows(rows) {
  const plumpjack = [], realEstate = [], trusts = [], individual = [];
  const seen = { pj: new Set(), re: new Set(), tr: new Set(), ind: new Set() };

  rows
    .filter((r) => !isContinuationRow(r))
    .forEach((r) => {
      const key = String(r?.asset_or_entity_name ?? '').trim().toLowerCase();
      if (isPlumpJackRow(r)) {
        if (!seen.pj.has(key)) { seen.pj.add(key); plumpjack.push(r); }
      } else if (isTrustRow(r)) {
        const trustKey = TRUST_NAMES_CA.find((t) =>
          key.includes(t.split(' ').slice(0, 2).join(' ').toLowerCase()),
        ) || key;
        if (!seen.tr.has(trustKey)) { seen.tr.add(trustKey); trusts.push(r); }
      } else if (isRealEstateRow(r)) {
        if (!seen.re.has(key)) { seen.re.add(key); realEstate.push(r); }
      } else {
        if (!seen.ind.has(key)) { seen.ind.add(key); individual.push(r); }
      }
    });

  const totalUnique = seen.pj.size + seen.re.size + seen.tr.size + seen.ind.size;
  return { plumpjack, realEstate, trusts, individual, totalUnique };
}

const HOLDINGS_PAGE_SIZE = 10;

function GroupedHoldingsDisplay({ rows, totalRaw, src }) {
  const [showAllInd, setShowAllInd] = useState(false);
  const { plumpjack, realEstate, trusts, individual, totalUnique } = groupHoldingRows(rows);
  const visibleInd = showAllInd ? individual : individual.slice(0, HOLDINGS_PAGE_SIZE);

  const CategorySection = ({ title, items, valueField = 'value_range' }) => (
    <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
      <p className="text-xs font-bold text-gray-700">{title}</p>
      <p className="text-[10px] text-gray-400 mb-1.5">{items.length} {items.length === 1 ? 'entry' : 'entries'}</p>
      <ul className="space-y-0.5">
        {items.map((r, i) => (
          <li key={i} className="text-xs text-gray-700 flex justify-between gap-2">
            <span className="truncate">{r.asset_or_entity_name}</span>
            {r[valueField] && <span className="text-gray-400 shrink-0">{r[valueField]}</span>}
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="space-y-2.5">
      <p className="text-xs text-gray-500">
        <span className="font-semibold text-gray-700">{totalUnique}</span> unique entities
        {totalRaw > totalUnique && (
          <span className="text-gray-400"> · {totalRaw - totalUnique} duplicate / continuation rows removed</span>
        )}
      </p>

      {plumpjack.length > 0 && (
        <CategorySection title="PlumpJack Businesses" items={plumpjack} />
      )}
      {realEstate.length > 0 && (
        <CategorySection title="Real Estate Properties" items={realEstate} />
      )}
      {trusts.length > 0 && (
        <CategorySection title="Blind Trusts" items={trusts} />
      )}

      {individual.length > 0 && (
        <div>
          <p className="text-xs font-bold text-gray-700 mb-1.5">Individual Investments</p>
          <div className="rounded-lg border border-gray-200 bg-white divide-y divide-gray-100">
            {visibleInd.map((r, i) => (
              <div key={i} className="flex items-center justify-between gap-2 px-3 py-1.5">
                <span className="text-xs text-gray-700 truncate">{r.asset_or_entity_name}</span>
                <span className="text-xs text-gray-400 shrink-0">{r.value_range || r.income_range || ''}</span>
              </div>
            ))}
          </div>
          {!showAllInd && individual.length > HOLDINGS_PAGE_SIZE && (
            <button type="button" onClick={() => setShowAllInd(true)} className="text-xs text-blue-600 hover:underline mt-1.5 font-medium">
              Show {individual.length - HOLDINGS_PAGE_SIZE} more →
            </button>
          )}
          {showAllInd && individual.length > HOLDINGS_PAGE_SIZE && (
            <button type="button" onClick={() => setShowAllInd(false)} className="text-xs text-blue-600 hover:underline mt-1.5 font-medium">
              ← Show less
            </button>
          )}
        </div>
      )}

      {sourceLink(src, 'Search FPPC Form 700')}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function DetailDeclaredAssets({ row }) {
  const da = row?.declared_assets;
  const src = usCaSourceUrl(da);
  const rows = da?.rows || [];
  const pageComments = da?.page_comments || [];

  return (
    <div className="pt-3 space-y-2">
      <p className="text-xs text-gray-700 leading-relaxed">{REPORTED_HOLDINGS_LABEL}</p>
      {rows.length > 0 ? (
        <GroupedHoldingsDisplay rows={rows} totalRaw={rows.length} src={src} />
      ) : (
        <p className="text-xs text-gray-600 italic">
          {da?.status === 'no_official_records_found'
            ? 'No official records found in FPPC Form 700 search for this filing.'
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
              <li key={i}>Page {c.page}: {c.comment}</li>
            ))}
          </ul>
        </details>
      )}
      {usCaNeedsManualReview(da) && frameworkNote()}
    </div>
  );
}

function DetailStockHoldings({ row }) {
  const sh = row?.stock_holdings;
  const src = usCaSourceUrl(sh);
  const rows = sh?.rows || [];

  return (
    <div className="pt-3 space-y-2">
      {sh?.disclosure_note && (
        <p className="text-xs text-gray-600 leading-relaxed">{sh.disclosure_note}</p>
      )}
      {rows.length > 0 ? (
        <GroupedHoldingsDisplay rows={rows} totalRaw={rows.length} src={src} />
      ) : (
        <p className="text-xs text-gray-600 italic">
          {sh?.status === 'no_official_records_found'
            ? 'No investment schedule rows in the official FPPC filing data.'
            : 'No investment rows loaded.'}
        </p>
      )}
      {usCaNeedsManualReview(sh) && frameworkNote()}
    </div>
  );
}

function DetailGiftsHospitality({ row }) {
  const gh = row?.gifts_hospitality;
  const src = usCaSourceUrl(gh);

  const gifts = Array.isArray(gh?.gifts)
    ? [...gh.gifts].sort((a, b) => (Number(b.value) || 0) - (Number(a.value) || 0))
    : [];
  const travel = Array.isArray(gh?.travel_payments) ? gh.travel_payments : [];

  const giftCount = gh?.gift_count ?? gifts.length;
  const travelCount = travel.length;
  const headline =
    giftCount > 0
      ? `${giftCount} gift${giftCount === 1 ? '' : 's'} received${gh?.gift_year ? ` in ${gh.gift_year}` : ''}${travelCount > 0 ? `, plus ${travelCount} official travel payment${travelCount === 1 ? '' : 's'}` : ''}`
      : null;

  return (
    <div className="pt-3 space-y-3">
      {headline && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50/80 px-3 py-2.5">
          <p className="text-sm font-semibold text-gray-900">{headline}</p>
        </div>
      )}

      {gifts.length > 0 && (
        <div>
          <p className="text-xs font-bold text-gray-700 mb-1.5">Gifts (Schedule D)</p>
          <div className="rounded-lg border border-gray-200 bg-white divide-y divide-gray-100">
            {gifts.map((g, i) => (
              <div key={i} className="px-3 py-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-semibold text-gray-900 leading-snug min-w-0 truncate">{g.source}</p>
                  <span className="text-xs font-medium text-gray-700 shrink-0">
                    {g.value_text || (g.value != null ? formatMoney(g.value, 'USD', 2) : '')}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-0.5 leading-snug">{g.description}</p>
                {g.date && <p className="text-[11px] text-gray-400 mt-0.5">{g.date}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {travel.length > 0 && (
        <div>
          <p className="text-xs font-bold text-gray-700 mb-1.5">Official travel (Schedule E)</p>
          <div className="space-y-2">
            {travel.map((t, i) => (
              <div key={i} className="rounded-lg border border-blue-100 bg-blue-50/60 px-3 py-2.5">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-semibold text-gray-900 leading-snug">
                    {t.amount_text || (t.amount != null ? formatMoney(t.amount, 'USD', 2) : '')}
                    {t.travel_destination ? ` · ${t.travel_destination}` : ''}
                  </p>
                </div>
                {t.purpose && <p className="text-xs text-gray-700 mt-0.5">{t.purpose}</p>}
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {t.source}
                  {t.date_range ? ` · ${t.date_range}` : ''}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {sourceLink(src, 'Search FPPC Form 700')}
    </div>
  );
}

function DetailCampaignFinance({ row }) {
  const cf = row?.campaign_finance;
  const src = row?.field_sources?.campaign_finance;

  const committees = Array.isArray(cf?.committees) ? cf.committees : [];
  const allItems = Array.isArray(cf?.items) ? cf.items : [];
  const unitemized = allItems.find((it) =>
    /unitemized/i.test(String(it?.name ?? it?.contributor ?? '')),
  );
  const namedItems = allItems
    .filter((it) => !/unitemized/i.test(String(it?.name ?? it?.contributor ?? '')))
    .slice(0, 10);

  const totalContribs =
    cf?.contribution_count ??
    committees.reduce((s, c) => s + (c.contribution_count ?? 0), 0);
  const totalText = cf?.total_amount_text || '';
  const campaignCount = committees.length || null;
  const earliestYear = committees.length
    ? Math.min(...committees.map((c) => parseInt(c.cycle_start_year ?? c.year ?? '9999', 10)))
    : null;

  const bigStat =
    totalContribs && totalText && campaignCount && earliestYear < 9999
      ? `${Number(totalContribs).toLocaleString('en-US')} contributions totaling ${totalText} across ${campaignCount} campaigns since ${earliestYear}`
      : cf?.summary || null;

  return (
    <div className="pt-3 space-y-3">
      {bigStat && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50/80 px-3 py-3">
          <p className="text-sm font-semibold text-gray-900 leading-snug">{bigStat}</p>
          {cf?.data_as_of && <p className="text-[11px] text-gray-500 mt-1">Data as of {cf.data_as_of}</p>}
        </div>
      )}

      {committees.length > 0 && (
        <div>
          <p className="text-xs font-bold text-gray-700 mb-1.5">Campaign committees</p>
          <ul className="space-y-1.5">
            {committees.map((c) => (
              <li key={c.committee_id} className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-semibold text-gray-900 leading-snug">{c.name}</p>
                  {c.cycle_start_year && (
                    <span className="text-[10px] text-gray-400 shrink-0 mt-0.5">{c.cycle_start_year}</span>
                  )}
                </div>
                <p className="text-xs text-gray-600 mt-0.5">
                  {c.total_amount_text}
                  {c.contribution_count != null && ` · ${Number(c.contribution_count).toLocaleString('en-US')} contributions`}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {namedItems.length > 0 && (
        <div>
          <p className="text-xs font-bold text-gray-700 mb-1.5">Top contributors</p>
          <div className="rounded-lg border border-gray-200 bg-white divide-y divide-gray-100">
            {namedItems.map((it, i) => (
              <div key={i} className="flex items-center justify-between gap-3 px-3 py-1.5">
                <span className="text-xs text-gray-700 min-w-0 truncate">{it.name || it.contributor}</span>
                <span className="text-xs font-medium text-gray-900 shrink-0">
                  {it.amount_text || (it.amount != null ? formatMoney(it.amount, 'USD', 2) : '')}
                </span>
              </div>
            ))}
          </div>
          {unitemized && (
            <p className="text-[11px] text-gray-500 mt-1.5">
              + Unitemized contributions:{' '}
              <span className="font-medium text-gray-700">
                {unitemized.amount_text || (unitemized.amount != null ? formatMoney(unitemized.amount, 'USD', 2) : '')}
              </span>
            </p>
          )}
          {cf?.top_contributors_note && (
            <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">{cf.top_contributors_note}</p>
          )}
        </div>
      )}

      {sourceLink(src, 'SOS Power Search (Cal-Access data)')}
    </div>
  );
}

const LOBBYING_ONGOING_LABELS = new Set(['continuing', 'ongoing', 'indefinite']);
const LOBBYING_PAGE_SIZE = 20;

function filterLobbyingRows(rows) {
  return rows.filter((r) => {
    const period = String(r?.reporting_period ?? '').trim();
    if (!period) return false;
    if (LOBBYING_ONGOING_LABELS.has(period.toLowerCase())) return true;
    const years = period.match(/\b(19|20)\d{2}\b/g);
    if (years) return years.some((y) => parseInt(y, 10) >= 2020);
    return false;
  });
}

function DetailLobbyingRecords({ row }) {
  const [showAll, setShowAll] = useState(false);
  const lr = row?.lobbying_records;
  const src = usCaSourceUrl(lr);
  const allRows = lr?.rows || [];
  const noTarget =
    lr?.status === 'no_official_target_specific_lobbying_records_found' || allRows.length === 0;

  const filteredRows = filterLobbyingRows(allRows);
  const hiddenCount = allRows.length - filteredRows.length;
  const displayRows = showAll ? filteredRows : filteredRows.slice(0, LOBBYING_PAGE_SIZE);

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
          {allRows.length > 0 && (
            <p className="text-xs text-gray-500">
              Showing <span className="font-semibold text-gray-700">{filteredRows.length}</span> relevant of{' '}
              <span className="font-semibold text-gray-700">{allRows.length}</span> total records
              {hiddenCount > 0 && (
                <span className="text-gray-400"> · {hiddenCount} stale pre-2020 entries hidden</span>
              )}
            </p>
          )}
          <LobbyingRecordsTable rows={displayRows} />
          {!showAll && filteredRows.length > LOBBYING_PAGE_SIZE && (
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="text-xs text-blue-600 hover:underline font-medium mt-1"
            >
              Show {filteredRows.length - LOBBYING_PAGE_SIZE} more →
            </button>
          )}
          {showAll && filteredRows.length > LOBBYING_PAGE_SIZE && (
            <button
              type="button"
              onClick={() => setShowAll(false)}
              className="text-xs text-blue-600 hover:underline font-medium mt-1"
            >
              ← Show less
            </button>
          )}
        </>
      )}
      {lr?.status === 'official_data_requires_manual_review' && (
        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          {lr.error
            ? `Cal-Access export could not be loaded: ${lr.error}`
            : 'Lobbying filings are published in Cal-Access; automated fetch was not available from this environment.'}
        </p>
      )}
      {allRows.length > 0 && (
        <p className="text-[10px] text-gray-500 leading-relaxed">
          Payment amounts are reported on separate Cal-Access lobbying payment filings when not
          shown in LEMP_CD contract registrations.
        </p>
      )}
      {sourceLink(lr?.portal, 'Cal-Access lobbying')}
      {sourceLink(lr?.raw_data_url, 'Cal-Access raw data downloads')}
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
      {sourceLink(src, 'Governor newsroom')}
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
export default function UsCaLeaderTransparencySections({ transparencyRow, loading }) {
  const [openSections, setOpenSections] = useState(() => ({}));

  const toggleSection = useCallback((key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const summaryCards =
    !loading && transparencyRow ? buildUsCaTransparencySummaryCards(transparencyRow) : [];
  const quickStats =
    !loading && transparencyRow ? buildUsCaQuickStats(transparencyRow) : [];

  return (
    <section className="us-ca-leader-transparency">
      <p className="panel-section-label">Official transparency</p>
      {loading && (
        <p className="text-xs text-gray-500 mb-3 flex items-center gap-2">
          <span className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin inline-block" />
          Loading official transparency data…
        </p>
      )}

      {!loading && quickStats.length > 0 && (
        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500 mb-2">Quick Stats</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {quickStats.map((stat) => (
              <QuickStatCard key={stat.id} value={stat.value} label={stat.label} sub={stat.sub} />
            ))}
          </div>
        </div>
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
            {US_CA_TRANSPARENCY_SECTIONS.map(({ key, label }) => {
              const loaded = usCaTransparencySectionLoaded(key, transparencyRow);
              const Detail = DETAIL_COMPONENTS[key];
              const subtitle = loaded ? usCaAccordionSubtitle(key, transparencyRow) : '';

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
