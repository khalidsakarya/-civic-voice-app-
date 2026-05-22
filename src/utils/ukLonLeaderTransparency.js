/**
 * UK-ENG-LON official leader transparency — UI helpers (Firestore `subnational_leader_transparency/UK-ENG-LON`).
 */

export const UK_LON_JURISDICTION_ID = 'UK-ENG-LON';

export const FRAMEWORK_ONLY_NOTE =
  'Official GLA registers on london.gov.uk; open linked pages for full schedules.';

export const NOT_DISCLOSED_LABEL = 'Not disclosed in official filing.';

export const REPORTED_HOLDINGS_LABEL = 'Reported interests (GLA register of interests)';

export const UK_LON_TRANSPARENCY_SECTIONS = Object.freeze([
  { key: 'salary', label: 'Salary' },
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
export function ukLonTransparencySectionLoaded(sectionKey, row) {
  if (!row || typeof row !== 'object') return false;

  switch (sectionKey) {
    case 'salary':
      return isNonEmptyObject(row.salary);
    case 'campaign_finance':
      return isNonEmptyObject(row.campaign_finance);
    case 'recent_official_activity':
      return Array.isArray(row.recent_official_activity) && row.recent_official_activity.length > 0;
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
export function applyUkLonLeaderTransparencyFields(out, fsRow) {
  if (!out || !fsRow || typeof fsRow !== 'object') return;
  const keys = [
    'financial_disclosure',
    'declared_assets',
    'gifts_hospitality',
    'lobbying_records',
    'stock_holdings',
    'data_completeness_note',
    'data_status',
    'sources_inaccessible',
    'sources_confirmed',
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
export function ukLonNeedsManualReview(block) {
  if (!block || typeof block !== 'object') return false;
  const list = block.needs_manual_review;
  return Array.isArray(list) && list.length > 0;
}

/** @param {Record<string, unknown>|null|undefined} block */
export function ukLonSourceUrl(block) {
  if (!block || typeof block !== 'object') return '';
  return trim(block.source_url || block.portal);
}

/**
 * @param {unknown} value
 * @param {string} [currency]
 */
export function formatMoney(value, currency = 'GBP', fractionDigits = 0) {
  const n = Number(value);
  if (!Number.isFinite(n)) return trim(value);
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(n);
}

/**
 * @param {Record<string, unknown>|null|undefined} row
 */
export function buildUkLonTransparencySummaryCards(row) {
  if (!row || typeof row !== 'object') return [];

  const cards = [];

  if (ukLonTransparencySectionLoaded('salary', row)) {
    const sal = row.salary;
    cards.push({
      id: 'salary',
      title: 'Salary',
      highlight: true,
      lines: [
        `${sal?.amount_text || formatMoney(sal?.amount, 'GBP', 2)}`,
        trim(sal?.period) || 'Mayor expenses transparency (london.gov.uk)',
      ],
    });
  }

  if (ukLonTransparencySectionLoaded('financial_disclosure', row)) {
    const fd = row.financial_disclosure;
    cards.push({
      id: 'financial_disclosure',
      title: 'Financial disclosure',
      highlight: true,
      lines: [
        fd?.status === 'filed' ? 'Register published' : trim(fd?.status) || 'Register of interests',
        fd?.latest_filing_year != null ? `Year ${fd.latest_filing_year}` : 'london.gov.uk',
      ],
    });
  }

  if (ukLonTransparencySectionLoaded('campaign_finance', row)) {
    const cf = row.campaign_finance;
    const summary = trim(cf?.summary);
    cards.push({
      id: 'campaign_finance',
      title: 'Campaign finance',
      highlight: true,
      lines: summary
        ? [summary.replace(/\.$/, '')]
        : [
            cf?.contribution_count != null && cf?.total_amount_text
              ? `${Number(cf.contribution_count).toLocaleString('en-US')} contributions · ${cf.total_amount_text} total`
              : 'Electoral Commission regulated-donee search',
          ],
    });
  }

  if (ukLonTransparencySectionLoaded('gifts_hospitality', row)) {
    const gh = row.gifts_hospitality;
    const g = gh?.gift_count ?? gh?.gifts?.length ?? 0;
    const t = gh?.travel_count ?? gh?.travel_payments?.length ?? 0;
    cards.push({
      id: 'gifts_hospitality',
      title: 'Gifts & hospitality',
      lines: [
        `${g} gift${g === 1 ? '' : 's'} (Mayor register)`,
        t > 0 ? `${t} travel row${t === 1 ? '' : 's'}` : 'No travel rows in sync',
      ],
    });
  }

  if (ukLonTransparencySectionLoaded('lobbying_records', row)) {
    const lr = row.lobbying_records;
    const n = lr?.row_count ?? lr?.rows?.length ?? 0;
    const noTarget =
      lr?.status === 'no_official_target_specific_lobbying_records_found' || n === 0;
    cards.push({
      id: 'lobbying_records',
      title: 'Lobbying',
      lines: noTarget
        ? ['No official target-specific lobbying records found']
        : [
            `${n} Mayor-target meeting row${n === 1 ? '' : 's'}`,
            'GLA meetings / decisions',
          ],
    });
  }

  if (ukLonTransparencySectionLoaded('recent_official_activity', row)) {
    const n = row.recent_official_activity?.length || 0;
    cards.push({
      id: 'recent_official_activity',
      title: 'Recent activity',
      lines: [`${n} official release${n === 1 ? '' : 's'}`],
    });
  }

  if (ukLonTransparencySectionLoaded('declared_assets', row)) {
    const da = row.declared_assets;
    const n = da?.row_count ?? da?.rows?.length ?? 0;
    cards.push({
      id: 'declared_assets',
      title: 'Declared assets',
      lines:
        n > 0
          ? [`${n} register interest row${n === 1 ? '' : 's'}`]
          : [da?.status === 'no_official_records_found' ? 'No official records found' : FRAMEWORK_ONLY_NOTE],
    });
  }

  if (ukLonTransparencySectionLoaded('stock_holdings', row)) {
    const sh = row.stock_holdings;
    const n = sh?.row_count ?? sh?.rows?.length ?? 0;
    cards.push({
      id: 'stock_holdings',
      title: 'Stock holdings',
      lines:
        n > 0
          ? [`${n} investment / entity row${n === 1 ? '' : 's'} — value ranges only`]
          : [sh?.status === 'no_official_records_found' ? 'No official records found' : FRAMEWORK_ONLY_NOTE],
    });
  }

  return cards;
}

/** One-line accordion subtitle when collapsed. */
export function ukLonAccordionSubtitle(sectionKey, row) {
  const card = buildUkLonTransparencySummaryCards(row).find((c) => c.id === sectionKey);
  if (card?.lines?.length) return card.lines.join(' · ');
  return '';
}
