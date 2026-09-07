/**
 * Dry-run reliability test for the new StatCan WDS fetch helper
 * (statcanWdsPostJson) in engine/lib/subnational-unemployment-monthly.cjs.
 *
 * Tests ONLY the unemployment fetch path — does NOT touch CRA charities,
 * does NOT touch grants, and does NOT write Firestore. Every province/
 * territory unemployment fetch that has previously hit ECONNRESET in this
 * environment is exercised here, including the 4 coordinates explicitly
 * required by the task:
 *   - CA-AB: 10.7.1.1.1.1.0.0.0.0
 *   - CA-QC: 6.7.1.1.1.1.0.0.0.0
 *   - CA-SK: 9.7.1.1.1.1.0.0.0.0
 *   - CA-YT (territorial table 14-10-0292-01): 1.8.1.1.1.1.0.0.0.0
 *
 * Usage:
 *   node engine/test-statcan-wds-reliability.cjs
 */

'use strict';

const fs = require('fs');
const path = require('path');

const {
  statcanProvincialUnemployment,
  statcanTerritorialUnemployment,
  getWdsFetchTelemetry,
  STATCAN_CA_COORD,
} = require('./lib/subnational-unemployment-monthly.cjs');

const REPORTS_DIR = path.join(__dirname, 'reports');
const RUN_AT = new Date().toISOString();

// All 9 jurisdictions named in the task, plus the 4 explicitly-required test
// coordinates (AB/QC/SK/YT are both in the "affected" list AND the required
// list — tested once, flagged as required_test: true).
const PROVINCIAL_CASES = [
  { id: 'CA-AB', label: 'Alberta', coord: '10.7.1.1.1.1.0.0.0.0', required_test: true },
  { id: 'CA-QC', label: 'Quebec', coord: '6.7.1.1.1.1.0.0.0.0', required_test: true },
  { id: 'CA-SK', label: 'Saskatchewan', coord: '9.7.1.1.1.1.0.0.0.0', required_test: true },
  { id: 'CA-MB', label: 'Manitoba', coord: '8.7.1.1.1.1.0.0.0.0', required_test: false },
  { id: 'CA-NS', label: 'Nova Scotia', coord: '4.7.1.1.1.1.0.0.0.0', required_test: false },
  { id: 'CA-NB', label: 'New Brunswick', coord: '5.7.1.1.1.1.0.0.0.0', required_test: false },
  { id: 'CA-NL', label: 'Newfoundland and Labrador', coord: '2.7.1.1.1.1.0.0.0.0', required_test: false },
  { id: 'CA-PE', label: 'Prince Edward Island', coord: '3.7.1.1.1.1.0.0.0.0', required_test: false },
];

const TERRITORIAL_CASES = [
  { id: 'CA-YT', label: 'Yukon', coord: '1.8.1.1.1.1.0.0.0.0', required_test: true },
];

function sample(series, n = 3) {
  if (!Array.isArray(series)) return [];
  return series.slice(-n);
}

async function testProvincial(c) {
  const result = {
    jurisdiction_id: c.id,
    label: c.label,
    coordinate: c.coord,
    statcan_table: '14-10-0287-01',
    required_test: c.required_test,
    status: null,
    error: null,
    latest_rate: null,
    latest_period: null,
    sample_points: [],
  };
  const telemetryBefore = getWdsFetchTelemetry().length;
  try {
    console.log(`[test-statcan-wds] ${c.id} (${c.label}) — coord ${c.coord}, Table 14-10-0287-01 …`);
    const doc = await statcanProvincialUnemployment(c.coord, STATCAN_CA_COORD, c.label, 'CA Average', 6);
    if (!doc || doc.unemployment_latest_rate == null) {
      result.status = 'BLOCKED';
      result.error = 'No unemployment payload returned';
      return result;
    }
    result.status = 'OK';
    result.latest_rate = doc.unemployment_latest_rate;
    result.latest_period = doc.unemployment_latest_period;
    result.sample_points = sample(doc.unemployment_series_monthly).map((p) => ({
      period: p.period_label || p.period,
      rate: p.jurisdiction,
    }));
    result.wds_fetch_telemetry = getWdsFetchTelemetry().slice(telemetryBefore);
    console.log(`[test-statcan-wds] ${c.id} OK — latest: ${result.latest_rate}% (${result.latest_period}) — resolved via: ${result.wds_fetch_telemetry.map((t) => t.strategy).join(', ')}`);
  } catch (err) {
    result.status = 'BLOCKED';
    result.error = err.message || String(err);
    console.log(`[test-statcan-wds] ${c.id} BLOCKED — ${result.error.slice(0, 200)}`);
  }
  return result;
}

async function testTerritorial(c) {
  const result = {
    jurisdiction_id: c.id,
    label: c.label,
    coordinate: c.coord,
    statcan_table: '14-10-0292-01',
    required_test: c.required_test,
    status: null,
    error: null,
    latest_rate: null,
    latest_period: null,
    sample_points: [],
  };
  const telemetryBefore = getWdsFetchTelemetry().length;
  try {
    console.log(`[test-statcan-wds] ${c.id} (${c.label}) — coord ${c.coord}, Table 14-10-0292-01 (territorial) …`);
    const doc = await statcanTerritorialUnemployment(c.coord, STATCAN_CA_COORD, c.label, 'CA Average', 6);
    if (!doc || doc.unemployment_latest_rate == null) {
      result.status = 'BLOCKED';
      result.error = 'No unemployment payload returned';
      return result;
    }
    result.status = 'OK';
    result.latest_rate = doc.unemployment_latest_rate;
    result.latest_period = doc.unemployment_latest_period;
    result.sample_points = sample(doc.unemployment_series_rolling_3_month).map((p) => ({
      period: p.period_label || p.period,
      rate: p.jurisdiction,
    }));
    result.wds_fetch_telemetry = getWdsFetchTelemetry().slice(telemetryBefore);
    console.log(`[test-statcan-wds] ${c.id} OK — latest: ${result.latest_rate}% (${result.latest_period}) — resolved via: ${result.wds_fetch_telemetry.map((t) => t.strategy).join(', ')}`);
  } catch (err) {
    result.status = 'BLOCKED';
    result.error = err.message || String(err);
    console.log(`[test-statcan-wds] ${c.id} BLOCKED — ${result.error.slice(0, 200)}`);
  }
  return result;
}

async function main() {
  console.log('[test-statcan-wds] ============================================');
  console.log('[test-statcan-wds] StatCan WDS fetch reliability test — DRY RUN ONLY');
  console.log('[test-statcan-wds] Unemployment fetch path only. No CRA charities. No Firestore writes.');
  console.log(`[test-statcan-wds] Started: ${RUN_AT}`);
  console.log('[test-statcan-wds] ============================================\n');

  const provincialResults = [];
  for (const c of PROVINCIAL_CASES) {
    // eslint-disable-next-line no-await-in-loop
    provincialResults.push(await testProvincial(c));
  }

  const territorialResults = [];
  for (const c of TERRITORIAL_CASES) {
    // eslint-disable-next-line no-await-in-loop
    territorialResults.push(await testTerritorial(c));
  }

  const allResults = [...provincialResults, ...territorialResults];

  const allTelemetry = getWdsFetchTelemetry();
  const strategyBreakdown = allTelemetry.reduce((acc, t) => {
    acc[t.strategy || 'none'] = (acc[t.strategy || 'none'] || 0) + 1;
    return acc;
  }, {});
  const httpsFailuresObserved = allTelemetry.filter((t) => (t.priorFailures || []).some((f) => f.startsWith('https#'))).length;

  const report = {
    run_type: 'DRY_RUN_RELIABILITY_TEST',
    run_at: RUN_AT,
    scope: 'Unemployment fetch only (subnational_economic_social_stats). No CRA charities, no grants, no Firestore writes.',
    fetch_helper: 'statcanWdsPostJson (engine/lib/subnational-unemployment-monthly.cjs) — https retry -> fetch retry -> curl fallback',
    results: allResults,
    total_wds_requests_made: allTelemetry.length,
    strategy_breakdown: strategyBreakdown,
    requests_where_https_failed_before_success: httpsFailuresObserved,
    summary: {
      total: allResults.length,
      ok: allResults.filter((r) => r.status === 'OK').length,
      blocked: allResults.filter((r) => r.status === 'BLOCKED').length,
      required_test_coordinates: allResults.filter((r) => r.required_test),
      required_test_all_ok: allResults.filter((r) => r.required_test).every((r) => r.status === 'OK'),
    },
  };

  if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });
  const latestPath = path.join(REPORTS_DIR, 'statcan-wds-reliability-test-latest.json');
  fs.writeFileSync(latestPath, JSON.stringify(report, null, 2), 'utf8');

  console.log('\n[test-statcan-wds] ============ SUMMARY ============');
  for (const r of allResults) {
    const icon = r.status === 'OK' ? '✓' : '✗';
    const req = r.required_test ? ' [REQUIRED]' : '';
    console.log(`  ${icon} ${r.jurisdiction_id} (${r.label})${req} — ${r.status}${r.error ? ` — ${r.error.slice(0, 100)}` : ''}`);
  }
  console.log(`\n  Total: ${report.summary.ok}/${report.summary.total} OK`);
  console.log(`  Required test coordinates all OK: ${report.summary.required_test_all_ok}`);
  console.log(`\n  Report: ${latestPath}`);
  console.log('\n[test-statcan-wds] done. No Firestore writes performed. No CRA charities touched.');
}

main().catch((err) => {
  console.error('[test-statcan-wds] fatal:', err);
  process.exit(1);
});
