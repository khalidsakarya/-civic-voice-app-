/**
 * CA-ON official leader transparency — UI helpers (Firestore `subnational_leader_transparency/CA-ON`).
 */

export const CA_ON_JURISDICTION_ID = 'CA-ON';

export const FRAMEWORK_ONLY_NOTE =
  'Official framework available; individual values require manual review.';

export const CA_ON_TRANSPARENCY_SECTIONS = Object.freeze([
  { key: 'salary', label: 'Salary' },
  { key: 'conflict_of_interest_filings', label: 'Conflict of interest — OICO reports' },
  { key: 'financial_disclosure', label: 'Financial disclosure' },
  { key: 'declared_assets', label: 'Declared assets' },
  { key: 'stock_holdings', label: 'Stock holdings' },
  { key: 'gifts_hospitality', label: 'Gifts & hospitality' },
  { key: 'campaign_finance', label: 'Campaign finance' },
  { key: 'lobbying_records', label: 'Lobbying records' },
  { key: 'recent_official_activity', label: 'Recent official activity' },
]);

/** @param {unknown} v */
function trim(v) {
  if (v == null) return '';
  return String(v).trim();
}

/** @param {unknown} v */
function isNonEmptyObject(v) {
  return v && typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length > 0;
}

/**
 * @param {string} sectionKey
 * @param {Record<string, unknown>|null|undefined} row
 */
export function caOnTransparencySectionLoaded(sectionKey, row) {
  if (!row || typeof row !== 'object') return false;

  switch (sectionKey) {
    case 'salary':
      return isNonEmptyObject(row.salary);
    case 'campaign_finance':
      return isNonEmptyObject(row.campaign_finance);
    case 'recent_official_activity':
      return Array.isArray(row.recent_official_activity) && row.recent_official_activity.length > 0;
    case 'conflict_of_interest_filings': {
      const inquiries = row.conflict_of_interest_filings?.inquiries;
      return Array.isArray(inquiries) && inquiries.length > 0;
    }
    case 'financial_disclosure':
      return isNonEmptyObject(row.financial_disclosure);
    case 'declared_assets':
      return isNonEmptyObject(row.declared_assets);
    case 'gifts_hospitality':
      return isNonEmptyObject(row.gifts_hospitality);
    case 'lobbying_records':
      return isNonEmptyObject(row.lobbying_records);
    case 'stock_holdings':
      return isNonEmptyObject(row.stock_holdings);
    default:
      return false;
  }
}

/**
 * @param {Record<string, unknown>} out
 * @param {Record<string, unknown>|null|undefined} fsRow
 */
export function applyCaOnLeaderTransparencyFields(out, fsRow) {
  if (!out || !fsRow || typeof fsRow !== 'object') return;
  const keys = [
    'conflict_of_interest_filings',
    'financial_disclosure',
    'declared_assets',
    'gifts_hospitality',
    'lobbying_records',
    'stock_holdings',
    'data_completeness_note',
    'data_status',
    'sources_inaccessible',
    'sources_confirmed',
    'regulatory_act',
    'regulatory_body',
    'last_updated',
    'fetched_at',
  ];
  for (let i = 0; i < keys.length; i += 1) {
    const k = keys[i];
    const v = fsRow[k];
    if (v === undefined || v === null) continue;
    if (Array.isArray(v) && !v.length) continue;
    if (typeof v === 'object' && !Array.isArray(v) && !Object.keys(v).length) continue;
    out[k] = v;
  }
}

/** @param {Record<string, unknown>|null|undefined} block */
export function caOnNeedsManualReview(block) {
  if (!block || typeof block !== 'object') return false;
  const list = block.needs_manual_review;
  return Array.isArray(list) && list.length > 0;
}

/** @param {Record<string, unknown>|null|undefined} block */
export function caOnSourceUrl(block) {
  if (!block || typeof block !== 'object') return '';
  return trim(block.source_url || block.portal);
}

/**
 * @param {unknown} value
 * @param {string} [currency]
 */
export function formatMoney(value, currency = 'CAD', fractionDigits = 0) {
  const n = Number(value);
  if (!Number.isFinite(n)) return trim(value);
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(n);
}

/** Extract calendar year from salary period text. */
export function caOnSalaryYear(row) {
  const period = trim(row?.salary?.period);
  const m = period.match(/\d{4}/);
  return m ? m[0] : '';
}

/** Parse benefits amount from salary amount_text when present. */
export function caOnSalaryBenefitsText(row) {
  const text = trim(row?.salary?.amount_text);
  const m = text.match(/taxable benefits\s*(\$[\d,]+(?:\.\d{2})?)/i);
  return m ? m[1] : '';
}

/**
 * Compact summary lines for the panel header cards.
 * @param {Record<string, unknown>|null|undefined} row
 */
export function buildCaOnTransparencySummaryCards(row) {
  if (!row || typeof row !== 'object') return [];

  const cards = [];

  if (caOnTransparencySectionLoaded('salary', row)) {
    const sal = row.salary;
    const year = caOnSalaryYear(row) || '';
    const benefits = caOnSalaryBenefitsText(row);
    const amount =
      sal?.amount_text?.split('(')[0]?.trim() ||
      (sal?.amount != null ? formatMoney(sal.amount, 'CAD', 2) : '');
    const lines = [amount || 'Official salary record'];
    if (benefits) lines.push(`Benefits ${benefits}`);
    if (year) lines.push(`Calendar year ${year}`);
    cards.push({
      id: 'salary',
      title: 'Salary',
      highlight: true,
      lines,
    });
  }

  if (caOnTransparencySectionLoaded('conflict_of_interest_filings', row)) {
    const block = row.conflict_of_interest_filings;
    const count = block?.inquiries?.length ?? block?.row_count ?? 0;
    cards.push({
      id: 'conflict_of_interest_filings',
      title: 'Conflict of interest',
      highlight: count > 0,
      lines:
        count > 0
          ? [`${count} official commissioner report${count === 1 ? '' : 's'}`]
          : [FRAMEWORK_ONLY_NOTE],
    });
  }

  if (caOnTransparencySectionLoaded('campaign_finance', row)) {
    const cf = row.campaign_finance;
    const summary = trim(cf?.summary);
    cards.push({
      id: 'campaign_finance',
      title: 'Campaign finance',
      highlight: true,
      lines: summary
        ? [summary.replace(/\.$/, '')]
        : ['Contributions from Elections Ontario filed returns'],
    });
  }

  if (caOnTransparencySectionLoaded('lobbying_records', row)) {
    const stats = row.lobbying_records?.registry_statistics_fy_2024_25;
    const lobbyists = stats?.active_registered_lobbyists_march_2025;
    const registrations = stats?.active_registrations_march_2025;
    cards.push({
      id: 'lobbying_records',
      title: 'Lobbying',
      lines: [
        lobbyists != null && registrations != null
          ? `${lobbyists.toLocaleString('en-CA')} active lobbyists · ${registrations.toLocaleString('en-CA')} active registrations`
          : 'Ontario lobbyist registry (aggregate FY 2024–25)',
        'No Premier-specific public records found',
      ],
    });
  }

  if (caOnTransparencySectionLoaded('recent_official_activity', row)) {
    const n = row.recent_official_activity?.length || 0;
    cards.push({
      id: 'recent_official_activity',
      title: 'Recent activity',
      lines: [`${n} official release${n === 1 ? '' : 's'}`],
    });
  }

  if (caOnTransparencySectionLoaded('gifts_hospitality', row)) {
    const gh = row.gifts_hospitality;
    const threshold = gh?.approved_disclosure_threshold_cad;
    const advice = gh?.fy_2024_25_gift_advice_requests_all_mpps;
    cards.push({
      id: 'gifts_hospitality',
      title: 'Gifts & hospitality',
      lines: [
        threshold != null ? `$${threshold} disclosure threshold` : 'Gift disclosure rules apply',
        advice != null
          ? `${advice} aggregate gift-advice requests (all MPPs, FY 2024–25)`
          : 'Aggregate MPP advice requests only',
      ],
    });
  }

  const frameworkIds = [
    { key: 'financial_disclosure', title: 'Financial disclosure' },
    { key: 'declared_assets', title: 'Declared assets' },
    { key: 'stock_holdings', title: 'Stock holdings' },
  ];
  for (const { key, title } of frameworkIds) {
    if (caOnTransparencySectionLoaded(key, row)) {
      cards.push({
        id: key,
        title,
        lines: [FRAMEWORK_ONLY_NOTE],
      });
    }
  }

  return cards;
}

/** One-line accordion subtitle when collapsed. */
export function caOnAccordionSubtitle(sectionKey, row) {
  const card = buildCaOnTransparencySummaryCards(row).find((c) => c.id === sectionKey);
  if (card?.lines?.length) return card.lines.join(' · ');
  return '';
}
