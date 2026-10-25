/**
 * Federal (Canada-wide) unemployment rate -> `social_stats` document.
 *
 * Source: Statistics Canada, Labour Force Survey, Table 14-10-0287-01
 * ("Labour force characteristics, monthly, seasonally adjusted and
 * trend-cycle"), via the Web Data Service (WDS).
 *
 * The federal "Government Stats" page (renderGovernmentStatsPage in
 * src/App.js) already overlays `social_stats` documents keyed by
 * { country, statName }, reading value / source / sourceUrl / updated / trend /
 * last_updated. This module only builds that document; it never touches
 * Firestore. Pure builders are exported separately from the network fetch so
 * they can be unit-tested without any network or database access.
 */

'use strict';

const { statcanWdsPostJson, formatMonthLabel, periodYmFromRefPer } = require('./subnational-unemployment-monthly.cjs');

const WDS_BASE = 'https://www150.statcan.gc.ca/t1/wds/rest';
const PRODUCT_ID = 14100287;
const TABLE_ID = '14-10-0287-01';
const COORDINATE = '1.7.1.1.1.1.0.0.0.0';
const SOURCE_URL = 'https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=1410028701';
const SOURCE_LABEL = 'Statistics Canada, Labour Force Survey (Table 14-10-0287-01)';
const TREND_POINTS = 12;

/** The series identity we require before trusting a coordinate. */
const EXPECTED_MEMBERS = [
  'Canada',
  'Unemployment rate',
  'Total - Gender',
  '15 years and over',
  'Estimate',
  'Seasonally adjusted',
];

const STAT_NAME = 'unemploymentRate';
const COUNTRY = 'CA';
const DOC_ID = `${COUNTRY}_${STAT_NAME}`;

/**
 * Resolve a WDS coordinate against the cube's dimension metadata and compare
 * the member names to what we expect. Pure.
 * @param {any} cubeMetadataObject `getCubeMetadata` response `[0].object`
 * @param {string} coordinate
 * @param {string[]} [expected]
 * @returns {{ ok: boolean, members: string[], mismatches: string[] }}
 */
function verifySeriesIdentity(cubeMetadataObject, coordinate = COORDINATE, expected = EXPECTED_MEMBERS) {
  const dims = (cubeMetadataObject && cubeMetadataObject.dimension) || [];
  const positions = String(coordinate).split('.').map(Number);
  const members = [];
  const mismatches = [];
  expected.forEach((want, i) => {
    const dim = dims[i];
    const member = dim && (dim.member || []).find((m) => m.memberId === positions[i]);
    const got = member ? String(member.memberNameEn).trim() : '(missing)';
    members.push(got);
    if (got !== want) mismatches.push(`dimension ${i + 1}: expected "${want}", got "${got}"`);
  });
  if (dims.length < expected.length) mismatches.push(`cube has ${dims.length} dimensions, expected at least ${expected.length}`);
  return { ok: mismatches.length === 0, members, mismatches };
}

/**
 * @param {Array<{ period: string, value: number }>} points monthly points, any order, period like "2026-09"
 * @param {{ nowIso?: string, cubeEndDate?: string, releaseTime?: string }} [opts]
 * @returns {{ id: string, data: Record<string, unknown> }}
 */
function buildSocialStatDoc(points, opts = {}) {
  const clean = (points || [])
    .filter((p) => p && /^\d{4}-\d{2}$/.test(String(p.period)) && Number.isFinite(p.value))
    .sort((a, b) => (a.period < b.period ? -1 : a.period > b.period ? 1 : 0));
  if (clean.length === 0) throw new Error('No valid monthly unemployment points to build a document from');
  const latest = clean[clean.length - 1];
  const trendPts = clean.slice(-TREND_POINTS);
  const data = {
    country: COUNTRY,
    statName: STAT_NAME,
    value: `${latest.value.toFixed(1)}%`,
    updated: formatMonthLabel(latest.period),
    trend: trendPts.map((p) => p.value),
    trend_periods: trendPts.map((p) => p.period),
    sub: 'Seasonally adjusted · ages 15 and over',
    source: SOURCE_LABEL,
    sourceUrl: SOURCE_URL,
    table: TABLE_ID,
    coordinate: COORDINATE,
    verified_series: EXPECTED_MEMBERS.join(' · '),
    latest_period: latest.period,
    last_updated: opts.nowIso || new Date().toISOString(),
  };
  if (opts.releaseTime) data.statcan_release_time = opts.releaseTime;
  return { id: DOC_ID, data };
}

async function wdsPost(path, body) {
  return statcanWdsPostJson(`${WDS_BASE}/${path}`, body);
}

/** Fetch + verify + build. Network only; never touches Firestore. */
async function fetchFederalUnemploymentDoc({ latestN = 24, nowIso } = {}) {
  const meta = await wdsPost('getCubeMetadata', [{ productId: PRODUCT_ID }]);
  const obj = meta && meta[0] && meta[0].object;
  if (!obj) throw new Error('StatCan getCubeMetadata returned no object');
  const identity = verifySeriesIdentity(obj);
  if (!identity.ok) throw new Error('StatCan series identity check FAILED: ' + identity.mismatches.join('; '));

  const resp = await wdsPost('getDataFromCubePidCoordAndLatestNPeriods', [{ productId: PRODUCT_ID, coordinate: COORDINATE, latestN }]);
  const raw = (resp && resp[0] && resp[0].object && resp[0].object.vectorDataPoint) || [];
  const points = raw
    .map((p) => ({ period: periodYmFromRefPer(p.refPer), value: Number(p.value) }))
    .filter((p) => p.period && Number.isFinite(p.value));
  const built = buildSocialStatDoc(points, { nowIso, releaseTime: obj.releaseTime });
  return { ...built, identity, cubeTitle: obj.cubeTitleEn, cubeEndDate: obj.cubeEndDate, pointsFetched: points.length };
}

module.exports = {
  PRODUCT_ID,
  TABLE_ID,
  COORDINATE,
  SOURCE_URL,
  SOURCE_LABEL,
  EXPECTED_MEMBERS,
  STAT_NAME,
  COUNTRY,
  DOC_ID,
  TREND_POINTS,
  verifySeriesIdentity,
  buildSocialStatDoc,
  fetchFederalUnemploymentDoc,
};
