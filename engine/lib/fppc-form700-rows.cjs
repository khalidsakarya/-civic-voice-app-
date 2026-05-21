/**
 * Flatten official FPPC Form 700 electronic filing schedules into row records.
 * Source: form700search.fppc.ca.gov (official FPPC Statement of Economic Interests data).
 */

const { trim } = require('./subnational-transparency-shared.cjs');

const NOT_DISCLOSED = 'Not disclosed in official filing.';
const REPORTING_KIND = 'reported_holdings_value_ranges';

function formatUsdRange(range) {
  if (!range || typeof range !== 'object') return '';
  const gte = range.gte != null ? Number(range.gte) : null;
  const lte = range.lte != null ? Number(range.lte) : null;
  const fmt = (n) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(
      n,
    );
  if (Number.isFinite(gte) && Number.isFinite(lte) && lte > 0) return `${fmt(gte)} – ${fmt(lte)}`;
  if (Number.isFinite(gte)) return `Over ${fmt(gte)}`;
  if (Number.isFinite(lte) && lte > 0) return `Up to ${fmt(lte)}`;
  return '';
}

function pickAssetType(section) {
  const inv = section?.investmentsAndInterests;
  if (!inv) return '';
  const parts = [
    inv.investmentsAndInterestsType,
    inv.natureOfInterest,
    inv.natureOfInterestOther,
    section.businessEntityOrTrust,
  ];
  return parts.filter(Boolean).join(' · ');
}

function transactionNote(inv) {
  if (!inv) return '';
  const parts = [];
  if (inv.acquiredDate) parts.push(`Acquisition date on filing: ${inv.acquiredDate}`);
  if (inv.disposedDate) parts.push(`Disposition date on filing: ${inv.disposedDate}`);
  return parts.join('; ');
}

function baseRow(schedule, sourceUrl, pageNumber) {
  return {
    schedule,
    page_number: pageNumber != null ? pageNumber : null,
    source_url: sourceUrl || '',
    ticker: NOT_DISCLOSED,
    transaction_date: NOT_DISCLOSED,
    buy_amount: NOT_DISCLOSED,
    reporting_kind: REPORTING_KIND,
  };
}

function pushUnique(rows, seen, row) {
  const key = [
    row.schedule,
    row.asset_or_entity_name,
    row.page_number,
    row.value_range,
    row.income_range,
    row.trust_entity_name,
  ].join('|');
  if (seen.has(key)) return;
  seen.add(key);
  rows.push(row);
}

function rowsFromScheduleA2(sections, sourceUrl, seen, rows) {
  for (const section of sections || []) {
    const inv = section.investmentsAndInterests;
    const trustName =
      section.businessEntityOrTrust === 'Trust' ? trim(section.nameOfBusinessEntityOrTrust) : '';
    const entityName = trim(section.nameOfBusinessEntityOrTrust);
    const valueRange = formatUsdRange(inv?.fairMarketValue || section.businessEntity?.fairMarketValue);
    const incomeRange = formatUsdRange(section.grossIncomeReceived);
    const assetType = pickAssetType(section);
    const txn = transactionNote(inv);

    if (entityName) {
      pushUnique(rows, seen, {
        ...baseRow('A-2', sourceUrl, section.pageNumber),
        asset_or_entity_name: entityName,
        asset_type: assetType || section.businessEntityOrTrust || 'Business entity / trust interest',
        value_range: valueRange || NOT_DISCLOSED,
        income_range: incomeRange || NOT_DISCLOSED,
        trust_entity_name: trustName || NOT_DISCLOSED,
        transaction_note: txn || NOT_DISCLOSED,
      });
    }

    const nested = inv?.investment?.nameofBusinessEntity?.items;
    if (Array.isArray(nested)) {
      for (const name of nested) {
        const n = trim(name);
        if (!n) continue;
        pushUnique(rows, seen, {
          ...baseRow('A-2', sourceUrl, section.pageNumber),
          asset_or_entity_name: n,
          asset_type: inv?.investment?.descriptionOfBusiness
            ? `Related investment — ${inv.investment.descriptionOfBusiness}`
            : 'Related investment (Schedule A-2)',
          value_range: valueRange || NOT_DISCLOSED,
          income_range: incomeRange || NOT_DISCLOSED,
          trust_entity_name: trustName || entityName || NOT_DISCLOSED,
          transaction_note: txn || NOT_DISCLOSED,
        });
      }
    }

    const rp = inv?.realProperty;
    if (rp) {
      const addr =
        (rp.assessorParcelNumberOrStreetAddress?.items || []).join('; ') ||
        trim(rp.city) ||
        'Real property';
      pushUnique(rows, seen, {
        ...baseRow('A-2', sourceUrl, section.pageNumber),
        asset_or_entity_name: addr,
        asset_type: 'Real property (Schedule A-2)',
        value_range: valueRange || NOT_DISCLOSED,
        income_range: incomeRange || NOT_DISCLOSED,
        trust_entity_name: trustName || entityName || NOT_DISCLOSED,
        transaction_note: txn || NOT_DISCLOSED,
      });
    }
  }
}

function rowsFromScheduleC(scheduleC, sourceUrl, seen, rows) {
  for (const s of scheduleC?.incomeSections || []) {
    const name = trim(s.nameOfSource);
    if (!name) continue;
    pushUnique(rows, seen, {
      ...baseRow('C', sourceUrl, s.pageNumber),
      asset_or_entity_name: name,
      asset_type: trim([s.businessActivity, s.businessPosition].filter(Boolean).join(' — ')) || 'Income source',
      value_range: NOT_DISCLOSED,
      income_range: formatUsdRange(s.grossIncomeReceived) || NOT_DISCLOSED,
      trust_entity_name: NOT_DISCLOSED,
      transaction_note: trim(s.considerationOther || s.consideration) || NOT_DISCLOSED,
    });
  }
}

function rowsFromScheduleA1(scheduleA1, sourceUrl, seen, rows) {
  const blocks = scheduleA1?.sections || scheduleA1?.investments || [];
  for (const block of blocks) {
    const investments = block.investments || block.holdings || [block];
    for (const inv of investments) {
      const name =
        trim(inv.nameOfBusinessEntity) ||
        trim(inv.description) ||
        trim(inv.investmentName) ||
        trim(block.nameOfBusinessEntity);
      if (!name) continue;
      pushUnique(rows, seen, {
        ...baseRow('A-1', sourceUrl, block.pageNumber || inv.pageNumber),
        asset_or_entity_name: name,
        asset_type: trim(inv.natureOfInvestment || inv.descriptionOfInvestment) || 'Investment (Schedule A-1)',
        value_range: formatUsdRange(inv.fairMarketValue || inv.value) || NOT_DISCLOSED,
        income_range: NOT_DISCLOSED,
        trust_entity_name: NOT_DISCLOSED,
        transaction_note: transactionNote(inv) || NOT_DISCLOSED,
      });
    }
  }
}

function rowsFromScheduleB(scheduleB, sourceUrl, seen, rows) {
  for (const section of scheduleB?.sections || []) {
    const addr =
      (section.propertyAddress?.items || []).join('; ') ||
      trim(section.streetAddress) ||
      trim(section.nameOfProperty);
    if (!addr) continue;
    pushUnique(rows, seen, {
      ...baseRow('B', sourceUrl, section.pageNumber),
      asset_or_entity_name: addr,
      asset_type: 'Real property (Schedule B)',
      value_range: formatUsdRange(section.fairMarketValue) || NOT_DISCLOSED,
      income_range: formatUsdRange(section.grossIncomeReceived) || NOT_DISCLOSED,
      trust_entity_name: NOT_DISCLOSED,
      transaction_note: NOT_DISCLOSED,
    });
  }
}

function isInvestmentRow(row) {
  const s = `${row.schedule} ${row.asset_type} ${row.asset_or_entity_name}`.toLowerCase();
  if (/^a-[12]\b/.test(row.schedule.toLowerCase())) return true;
  return /investment|partnership|stock|security|trust|llc|corp|leasehold|real property|business entity/.test(s);
}

/**
 * @param {Record<string, unknown>} schedules keyed scheduleA1, scheduleA2, etc.
 * @param {{ source_url?: string, pdf_url?: string, filing_year?: number }} meta
 */
function buildReportedAssetRows(schedules, meta = {}) {
  const sourceUrl = meta.source_url || 'https://form700search.fppc.ca.gov/';
  const rows = [];
  const seen = new Set();

  if (schedules?.scheduleA1) rowsFromScheduleA1(schedules.scheduleA1, sourceUrl, seen, rows);
  if (schedules?.scheduleA2) rowsFromScheduleA2(schedules.scheduleA2.sections, sourceUrl, seen, rows);
  if (schedules?.scheduleB) rowsFromScheduleB(schedules.scheduleB, sourceUrl, seen, rows);
  if (schedules?.scheduleC) rowsFromScheduleC(schedules.scheduleC, sourceUrl, seen, rows);

  const pageComments = [];
  if (schedules?.scheduleA2?.pageComments) {
    for (const c of schedules.scheduleA2.pageComments) {
      if (c.comment) pageComments.push({ page: c.pageNumber, comment: c.comment });
    }
  }

  return {
    rows,
    stock_rows: rows.filter(isInvestmentRow),
    page_comments: pageComments,
    filing_year: meta.filing_year || null,
    pdf_url: meta.pdf_url || '',
    source_url: sourceUrl,
    row_count: rows.length,
    disclosure_note:
      'Rows extracted from official FPPC Form 700 electronic filing data (value ranges as filed; not stock purchases unless a transaction date is shown on the form).',
  };
}

module.exports = {
  NOT_DISCLOSED,
  REPORTING_KIND,
  formatUsdRange,
  buildReportedAssetRows,
  isInvestmentRow,
};
