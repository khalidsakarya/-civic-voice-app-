/**
 * Shared row shape helpers for official leader transparency (AU / UK / US).
 */

const NOT_DISCLOSED = 'Not disclosed in official filing.';
const REPORTING_KIND_HOLDINGS = 'reported_holdings_value_ranges';

function baseAssetRow(schedule, sourceUrl, pageNumber) {
  return {
    schedule,
    page_number: pageNumber != null ? pageNumber : null,
    source_url: sourceUrl || '',
    ticker: NOT_DISCLOSED,
    transaction_date: NOT_DISCLOSED,
    buy_amount: NOT_DISCLOSED,
    reporting_kind: REPORTING_KIND_HOLDINGS,
  };
}

function pushUniqueAsset(rows, seen, row) {
  const key = [
    row.schedule,
    row.asset_or_entity_name,
    row.value_range,
    row.income_range,
    row.page_number,
  ].join('|');
  if (seen.has(key)) return;
  seen.add(key);
  rows.push(row);
}

function baseLobbyRow(sourceUrl) {
  return {
    amount_paid: NOT_DISCLOSED,
    source_url: sourceUrl || '',
  };
}

module.exports = {
  NOT_DISCLOSED,
  REPORTING_KIND_HOLDINGS,
  baseAssetRow,
  pushUniqueAsset,
  baseLobbyRow,
};
