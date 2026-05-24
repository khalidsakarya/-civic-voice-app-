/**
 * US-CA official leader transparency — UI helpers (Firestore `subnational_leader_transparency/US-CA`).
 */

export const US_CA_JURISDICTION_ID = 'US-CA';

export const FRAMEWORK_ONLY_NOTE =
  'Official Form 700 ranges available; individual values require FPPC filing review.';

export const NOT_DISCLOSED_LABEL = 'Not disclosed in official filing.';

export const REPORTED_HOLDINGS_LABEL = 'Reported holdings / value ranges (Form 700)';

export const US_CA_TRANSPARENCY_SECTIONS = Object.freeze([
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
export function usCaTransparencySectionLoaded(sectionKey, row) {
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
export function applyUsCaLeaderTransparencyFields(out, fsRow) {
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
export function usCaNeedsManualReview(block) {
  if (!block || typeof block !== 'object') return false;
  const list = block.needs_manual_review;
  return Array.isArray(list) && list.length > 0;
}

/** @param {Record<string, unknown>|null|undefined} block */
export function usCaSourceUrl(block) {
  if (!block || typeof block !== 'object') return '';
  return trim(block.source_url || block.portal);
}

/**
 * @param {unknown} value
 * @param {string} [currency]
 */
export function formatMoney(value, currency = 'USD', fractionDigits = 0) {
  const n = Number(value);
  if (!Number.isFinite(n)) return trim(value);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(n);
}

/**
 * @param {Record<string, unknown>|null|undefined} row
 */
export function buildUsCaTransparencySummaryCards(row) {
  if (!row || typeof row !== 'object') return [];

  const cards = [];

  if (usCaTransparencySectionLoaded('salary', row)) {
    const sal = row.salary;
    cards.push({
      id: 'salary',
      title: 'Salary',
      highlight: true,
      lines: [
        `${sal?.amount_text || formatMoney(sal?.amount, 'USD', 2)}`,
        trim(sal?.period) || 'Citizens Compensation Commission schedule',
      ],
    });
  }

  if (usCaTransparencySectionLoaded('financial_disclosure', row)) {
    const fd = row.financial_disclosure;
    cards.push({
      id: 'financial_disclosure',
      title: 'Financial disclosure',
      highlight: true,
      lines: [
        fd?.status === 'filed' ? 'Form 700 filed' : trim(fd?.status) || 'Form 700',
        fd?.latest_filing_year != null ? `Filing year ${fd.latest_filing_year}` : 'FPPC Form 700',
      ],
    });
  }

  if (usCaTransparencySectionLoaded('campaign_finance', row)) {
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
              : 'Cal-Access contributions (SOS Power Search)',
          ],
    });
  }

  if (usCaTransparencySectionLoaded('gifts_hospitality', row)) {
    const gh = row.gifts_hospitality;
    const g = gh?.gift_count ?? gh?.gifts?.length ?? 0;
    const t = gh?.travel_count ?? gh?.travel_payments?.length ?? 0;
    cards.push({
      id: 'gifts_hospitality',
      title: 'Gifts & hospitality',
      lines: [
        `${g} gift disclosure${g === 1 ? '' : 's'} (Schedule D)`,
        `${t} travel payment${t === 1 ? '' : 's'} (Schedule E)`,
      ],
    });
  }

  if (usCaTransparencySectionLoaded('lobbying_records', row)) {
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
            `${n} Governor-target registration${n === 1 ? '' : 's'}`,
            'Cal-Access LEMP_CD (official SOS export)',
          ],
    });
  }

  if (usCaTransparencySectionLoaded('recent_official_activity', row)) {
    const n = row.recent_official_activity?.length || 0;
    cards.push({
      id: 'recent_official_activity',
      title: 'Recent activity',
      lines: [`${n} official release${n === 1 ? '' : 's'}`],
    });
  }

  if (usCaTransparencySectionLoaded('declared_assets', row)) {
    const da = row.declared_assets;
    const n = da?.row_count ?? da?.rows?.length ?? 0;
    cards.push({
      id: 'declared_assets',
      title: 'Declared assets',
      lines:
        n > 0
          ? [`${n} reported holding${n === 1 ? '' : 's'} (Form 700 schedules)`]
          : [da?.status === 'no_official_records_found' ? 'No official records found' : FRAMEWORK_ONLY_NOTE],
    });
  }

  if (usCaTransparencySectionLoaded('stock_holdings', row)) {
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

/**
 * Compact headline numbers for the Quick Stats grid at the top of the panel.
 * Each stat has: id, value (display string), label, sub (optional sub-label).
 * @param {Record<string, unknown>|null|undefined} row
 */
export function buildUsCaQuickStats(row) {
  if (!row || typeof row !== 'object') return [];
  const stats = [];

  // Salary
  const sal = row.salary;
  if (sal && typeof sal === 'object' && Object.keys(sal).length > 0) {
    const display = trim(sal.amount_text) || (sal.amount != null ? formatMoney(sal.amount, 'USD', 2) : '');
    if (display) {
      stats.push({ id: 'salary', value: display, label: 'Salary', sub: trim(sal.period) || 'Annual' });
    }
  }

  // Total Assets Declared
  const da = row.declared_assets;
  if (da && typeof da === 'object') {
    const n = da.row_count ?? da.rows?.length ?? null;
    if (n != null && n > 0) {
      stats.push({ id: 'declared_assets', value: Number(n).toLocaleString('en-US'), label: 'Assets Declared', sub: 'reported holdings (Form 700)' });
    }
  }

  // Campaign Contributions
  const cf = row.campaign_finance;
  if (cf && typeof cf === 'object') {
    const count = cf.contribution_count ?? cf.committees?.reduce((s, c) => s + (c.contribution_count ?? 0), 0) ?? null;
    const totalText = trim(cf.total_amount_text) || (() => {
      if (!Array.isArray(cf.committees)) return '';
      const totalCents = cf.committees.reduce((s, c) => {
        const n2 = Number(c.total_amount);
        return Number.isFinite(n2) ? s + n2 : s;
      }, 0);
      return totalCents > 0 ? formatMoney(totalCents, 'USD', 0) : '';
    })();
    if (count != null) {
      stats.push({
        id: 'campaign_finance',
        value: Number(count).toLocaleString('en-US'),
        label: 'Campaign Contributions',
        sub: totalText ? `totaling ${totalText}` : 'Cal-Access SOS data',
      });
    }
  }

  // Lobbying Meetings
  const lr = row.lobbying_records;
  if (lr && typeof lr === 'object') {
    const n = lr.row_count ?? lr.rows?.length ?? null;
    if (n != null && n > 0) {
      stats.push({ id: 'lobbying_records', value: Number(n).toLocaleString('en-US'), label: 'Lobbying Meetings', sub: 'Governor-targeted (Cal-Access)' });
    }
  }

  // Gifts Received
  const gh = row.gifts_hospitality;
  if (gh && typeof gh === 'object') {
    const g = gh.gift_count ?? gh.gifts?.length ?? null;
    if (g != null) {
      stats.push({ id: 'gifts_hospitality', value: Number(g).toLocaleString('en-US'), label: 'Gifts Received', sub: 'Schedule D disclosures (Form 700)' });
    }
  }

  // Recent Activity
  const ra = row.recent_official_activity;
  if (Array.isArray(ra) && ra.length > 0) {
    stats.push({ id: 'recent_official_activity', value: ra.length.toLocaleString('en-US'), label: 'Press Releases', sub: 'recent official activity' });
  }

  return stats;
}

/** One-line accordion subtitle when collapsed. */
export function usCaAccordionSubtitle(sectionKey, row) {
  const card = buildUsCaTransparencySummaryCards(row).find((c) => c.id === sectionKey);
  if (card?.lines?.length) return card.lines.join(' · ');
  return '';
}
