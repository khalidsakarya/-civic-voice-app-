/**
 * CA-ON (Ontario) — official economic sources (unemployment v1; merge-only).
 */

const {
  statcanProvincialUnemployment,
  STATCAN_ON_COORD,
  STATCAN_CA_COORD,
} = require('./subnational-unemployment-monthly.cjs');

const JURISDICTION_ID = 'CA-ON';

const SOURCES = {
  unemployment:
    'https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=1410028701',
};

async function buildEconomic() {
  const out = {
    jurisdiction_id: JURISDICTION_ID,
    reporting_period: 'Monthly provincial unemployment (Statistics Canada LFS)',
  };
  const notes = [];

  try {
    const unemp = await statcanProvincialUnemployment(
      STATCAN_ON_COORD,
      STATCAN_CA_COORD,
      'Ontario',
      'CA Average',
      24,
    );
    if (unemp) Object.assign(out, unemp);
  } catch (err) {
    notes.push(`unemployment: ${err.message}`);
  }

  out.data_status = { notes };
  return out;
}

async function buildTax() {
  return null;
}

async function buildGrants() {
  return null;
}

module.exports = {
  JURISDICTION_ID,
  SOURCES,
  buildEconomic,
  buildTax,
  buildGrants,
};
