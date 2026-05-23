/**
 * AU-NSW official leader transparency — UI helpers (Firestore `subnational_leader_transparency/AU-NSW`).
 */

export const AU_NSW_JURISDICTION_ID = 'AU-NSW';

/**
 * NSW state explorer / leader detail rows use Firestore id AU-NSW or abbreviation NSW.
 * @param {Record<string, unknown>|null|undefined} item
 */
export function resolveAuNswTransparencyJurisdictionId(item) {
  if (!item || typeof item !== 'object') return '';
  if (trim(item.subnationalId) === AU_NSW_JURISDICTION_ID) return AU_NSW_JURISDICTION_ID;
  if (String(item.abbr || '').toUpperCase() === 'NSW') return AU_NSW_JURISDICTION_ID;
  return '';
}

/**
 * @param {Record<string, unknown>|null|undefined} item
 * @param {{ isDeputy?: boolean }} [opts]
 */
export function shouldShowAuNswLeaderTransparency(item, opts = {}) {
  if (opts.isDeputy) return false;
  return !!resolveAuNswTransparencyJurisdictionId(item);
}

export const FRAMEWORK_ONLY_NOTE =
  'Official register published as NSW Parliament tabled papers; open linked PDFs for full schedules.';

export const NOT_DISCLOSED_LABEL = 'Not disclosed in official filing.';

export const NOT_IN_SOURCE_LABEL = 'Not disclosed in official source.';

export const REPORTED_HOLDINGS_LABEL = 'Reported interests / holdings (Register of Disclosures)';

export const AU_NSW_TRANSPARENCY_SECTIONS = Object.freeze([
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

/** @param {Record<string, unknown>|null|undefined} row */
function sectionListed(row, sectionKey) {
  const avail = row?.sections_available;
  return Array.isArray(avail) && avail.includes(sectionKey);
}

/** @param {Record<string, unknown>|null|undefined} block */
function hasAssetRows(block) {
  if (!block || typeof block !== 'object') return false;
  const rows = block.rows;
  if (Array.isArray(rows) && rows.length > 0) return true;
  const n = Number(block.row_count);
  return Number.isFinite(n) && n > 0;
}

/**
 * @param {Record<string, unknown>} out
 * @param {Record<string, unknown>|null|undefined} fsRow
 */
export function normalizeAuNswTransparencyRow(out, fsRow) {
  if (!out || !fsRow || typeof fsRow !== 'object') return out;

  if (!out.declared_assets && fsRow.declared_assets) out.declared_assets = fsRow.declared_assets;
  if (!out.declared_assets && fsRow.assets) out.declared_assets = fsRow.assets;

  if (!out.lobbying_records && fsRow.lobbying_records) out.lobbying_records = fsRow.lobbying_records;
  if (!out.lobbying_records && fsRow.lobbying_disclosures) {
    out.lobbying_records = fsRow.lobbying_disclosures;
  }

  if (!out.field_sources && fsRow.field_sources) out.field_sources = fsRow.field_sources;

  return out;
}

/**
 * @param {string} sectionKey
 * @param {Record<string, unknown>|null|undefined} row
 */
export function auNswTransparencySectionLoaded(sectionKey, row) {
  if (!row || typeof row !== 'object') return false;
  if (sectionListed(row, sectionKey)) return true;

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
      return hasAssetRows(row.declared_assets) || isNonEmptyObject(row.declared_assets);
    case 'gifts_hospitality':
      return isNonEmptyObject(row.gifts_hospitality);
    case 'lobbying_records':
      return isNonEmptyObject(row.lobbying_records);
    case 'stock_holdings':
      return hasAssetRows(row.stock_holdings) || isNonEmptyObject(row.stock_holdings);
    default:
      return false;
  }
}

/**
 * @param {Record<string, unknown>} out
 * @param {Record<string, unknown>|null|undefined} fsRow
 */
export function applyAuNswLeaderTransparencyFields(out, fsRow) {
  if (!out || !fsRow || typeof fsRow !== 'object') return;
  const keys = [
    'salary',
    'financial_disclosure',
    'declared_assets',
    'gifts_hospitality',
    'lobbying_records',
    'stock_holdings',
    'campaign_finance',
    'recent_official_activity',
    'field_sources',
    'data_completeness_note',
    'data_status',
    'sources_inaccessible',
    'sources_confirmed',
    'last_updated',
    'fetched_at',
    'transparency_live',
    'sections_available',
    'sections_unavailable',
  ];
  for (let i = 0; i < keys.length; i += 1) {
    const k = keys[i];
    const v = fsRow[k];
    if (v === undefined || v === null) continue;
    if (Array.isArray(v) && !v.length) continue;
    if (typeof v === 'object' && !Array.isArray(v) && !Object.keys(v).length) continue;
    out[k] = v;
  }
  normalizeAuNswTransparencyRow(out, fsRow);
}

/** @param {Record<string, unknown>|null|undefined} block */
export function auNswNeedsManualReview(block) {
  if (!block || typeof block !== 'object') return false;
  const list = block.needs_manual_review;
  return Array.isArray(list) && list.length > 0;
}

/** @param {Record<string, unknown>|null|undefined} block */
export function auNswSourceUrl(block) {
  if (!block || typeof block !== 'object') return '';
  return trim(block.source_url || block.portal);
}

/**
 * @param {unknown} value
 * @param {string} [currency]
 */
export function formatMoney(value, currency = 'AUD', fractionDigits = 0) {
  const n = Number(value);
  if (!Number.isFinite(n)) return trim(value);
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(n);
}

/**
 * @param {Record<string, unknown>|null|undefined} row
 */
export function buildAuNswTransparencySummaryCards(row) {
  if (!row || typeof row !== 'object') return [];

  const cards = [];

  if (auNswTransparencySectionLoaded('salary', row)) {
    const sal = row.salary;
    cards.push({
      id: 'salary',
      title: 'Salary',
      highlight: true,
      lines: [
        `${sal?.amount_text || formatMoney(sal?.amount, 'AUD', 2)}`,
        trim(sal?.period) || 'NSW Parliament remuneration determination',
      ],
    });
  }

  if (auNswTransparencySectionLoaded('financial_disclosure', row)) {
    const fd = row.financial_disclosure;
    cards.push({
      id: 'financial_disclosure',
      title: 'Financial disclosure',
      highlight: true,
      lines: [
        fd?.status === 'filed' ? 'Register filed' : trim(fd?.status) || 'Register of Disclosures',
        fd?.latest_filing_year != null ? `As at ${fd.latest_filing_year}` : 'NSW Parliament',
      ],
    });
  }

  if (auNswTransparencySectionLoaded('campaign_finance', row)) {
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
              : 'NSW Electoral Commission efadisclosures',
          ],
    });
  }

  if (auNswTransparencySectionLoaded('gifts_hospitality', row)) {
    const gh = row.gifts_hospitality;
    const g = gh?.gift_count ?? gh?.gifts?.length ?? 0;
    const t = gh?.travel_count ?? gh?.travel_payments?.length ?? 0;
    cards.push({
      id: 'gifts_hospitality',
      title: 'Gifts & hospitality',
      lines: [
        `${g} gift${g === 1 ? '' : 's'} (official register)`,
        t > 0 ? `${t} travel payment${t === 1 ? '' : 's'}` : 'No travel rows in sync',
      ],
    });
  }

  if (auNswTransparencySectionLoaded('lobbying_records', row)) {
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
            `${n} Premier-target registration${n === 1 ? '' : 's'}`,
            'NSW Lobbying Commissioner register',
          ],
    });
  }

  if (auNswTransparencySectionLoaded('recent_official_activity', row)) {
    const n = row.recent_official_activity?.length || 0;
    cards.push({
      id: 'recent_official_activity',
      title: 'Recent activity',
      lines: [`${n} official release${n === 1 ? '' : 's'}`],
    });
  }

  if (auNswTransparencySectionLoaded('declared_assets', row)) {
    const da = row.declared_assets;
    const n = da?.row_count ?? da?.rows?.length ?? 0;
    cards.push({
      id: 'declared_assets',
      title: 'Declared assets',
      lines:
        n > 0
          ? [`${n} reported interest row${n === 1 ? '' : 's'} (Register of Disclosures)`]
          : [da?.status === 'no_official_records_found' ? 'No official records found' : FRAMEWORK_ONLY_NOTE],
    });
  }

  if (auNswTransparencySectionLoaded('stock_holdings', row)) {
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
export function auNswAccordionSubtitle(sectionKey, row) {
  const card = buildAuNswTransparencySummaryCards(row).find((c) => c.id === sectionKey);
  if (card?.lines?.length) return card.lines.join(' · ');
  return '';
}
