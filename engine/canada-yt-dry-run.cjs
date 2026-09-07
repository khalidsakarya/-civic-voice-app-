/**
 * CA-YT (Yukon) dataset dry-run.
 *
 * Fetches and transforms Yukon datasets. Does NOT write Firestore. Writes
 * structured JSON report to engine/reports/canada-yt-dry-run-latest.json
 *
 * Datasets:
 *   Stats Can LFS unemployment   → subnational_economic_social_stats/CA-YT
 *   CRA Charities (YT filter)    → subnational_tax_exempt_entities/CA-YT
 *   YT Grants/Payments           → subnational_grants/CA-YT — NOT FOUND (see report)
 *
 * Note: Yukon is NOT covered by Table 14-10-0287-01 (that table's geography
 * dimension is Canada + the 10 provinces only — confirmed via
 * getCubeMetadata). Yukon has its own dedicated territorial table,
 * 14-10-0292-01, used here instead.
 *
 * Usage:
 *   node engine/canada-yt-dry-run.cjs
 */

'use strict';

const fs = require('fs');
const path = require('path');

const caYt = require('./lib/subnational-transparency-ca-yt.cjs');
const {
  hasEconomicPayload,
  hasTaxPayload,
} = require('./lib/subnational-transparency-shared.cjs');

const REPORTS_DIR = path.join(__dirname, 'reports');
const FETCHED_AT = new Date().toISOString();

// ─── Helpers ──────────────────────────────────────────────────────────────────

function topKeys(obj, n = 20) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return [];
  return Object.keys(obj).slice(0, n);
}

function sample(arr, n = 3) {
  if (!Array.isArray(arr)) return [];
  return arr.slice(0, n);
}

function trimValue(v) {
  if (v == null) return v;
  if (typeof v === 'string') return v.slice(0, 120);
  return v;
}

function trimRecord(rec) {
  if (!rec || typeof rec !== 'object') return rec;
  const out = {};
  for (const [k, v] of Object.entries(rec)) {
    out[k] = trimValue(v);
  }
  return out;
}

// ─── Statistics Canada unemployment (territorial table) ──────────────────────

async function runUnemployment() {
  const result = {
    dataset_id: 'CV-DATA-YT-001',
    dataset_name: 'Statistics Canada — Yukon Unemployment (Table 14-10-0292-01, territorial LFS)',
    statcan_coord_used: caYt.STATCAN_YT_COORD,
    statcan_table_note: 'Table 14-10-0287-01 (used for the 10 provinces) does NOT cover territories — confirmed via ' +
      'getCubeMetadata (geo dimension = Canada + 10 provinces only). Yukon has a dedicated table, 14-10-0292-01 ' +
      '("Labour force characteristics by territory, three-month moving average, seasonally adjusted and ' +
      'unadjusted"), where a valid Yukon coordinate DOES exist and was confirmed via getSeriesInfoFromCubePidCoord ' +
      '(SeriesTitleEn: "Yukon;Unemployment rate;Total - Gender;15 years and over;Estimate;Seasonally adjusted").',
    firestore_target: {
      collection: 'subnational_economic_social_stats',
      doc_id: 'CA-YT',
      path: 'subnational_economic_social_stats/CA-YT',
      write_mode: 'merge',
    },
    source_url: caYt.SOURCES.unemployment,
    fetched_at: FETCHED_AT,
    status: null,
    error: null,
    reporting_period: null,
    records_fetched: null,
    records_transformed: null,
    fields_to_write: [],
    sample_records: [],
    warnings: [],
    ui_renderable: false,
    safe_to_write_after_review: false,
  };

  try {
    console.log('[canada-yt-dry-run] Stats Can unemployment (territorial table 14-10-0292-01): fetching coord', caYt.STATCAN_YT_COORD, '…');
    const doc = await caYt.buildEconomic();
    const valid = hasEconomicPayload(doc);
    const notes = doc?.data_status?.notes || [];
    if (notes.length) result.warnings.push(...notes);

    if (!valid) {
      result.status = 'BLOCKED';
      result.error = 'No economic payload returned — coordinate may be wrong or API returned no data';
      result.warnings.push(`Coord attempted: ${caYt.STATCAN_YT_COORD} (Table 14-10-0292-01)`);
      if (notes.some((n) => /ECONNRESET/i.test(n))) {
        result.warnings.push('Transient Node-level connection reset against the Stats Can API — same class of issue observed for every province processed so far in this environment (confirmed independently working via direct curl for this exact coordinate). Report separately; do not write.');
      }
      return result;
    }

    result.status = 'DRY_RUN_OK';
    result.reporting_period = doc.unemployment_reporting_period || doc.reporting_period || null;
    result.source_url = doc.unemployment_source_url || caYt.SOURCES.unemployment;
    result.unemployment_latest_rate = doc.unemployment_latest_rate ?? null;
    result.unemployment_latest_period = doc.unemployment_latest_period ?? null;

    const series = doc.unemployment_series_monthly || doc.unemployment_series_rolling_3_month || [];
    result.records_fetched = series.length;
    result.records_transformed = series.length;
    result.sample_records = sample(series, 3).map(trimRecord);
    result.fields_to_write = [
      'unemployment_latest_rate',
      'unemployment_latest_period',
      'unemployment_frequency',
      'unemployment_series_rolling_3_month',
      'unemployment_series_monthly',
      'unemployment_source_url',
      'unemployment_source',
      'unemployment_url',
      'unemployment_reporting_period',
      'unemployment_rate',
      'reporting_period',
      'data_status',
    ].filter((k) => doc[k] != null);

    result.ui_renderable = true;
    result.safe_to_write_after_review = !result.warnings.length;

    if (!result.reporting_period) result.warnings.push('reporting_period not set');
    if (doc.unemployment_latest_rate == null) result.warnings.push('unemployment_latest_rate is null');
  } catch (err) {
    result.status = 'BLOCKED';
    result.error = err.message || String(err);
  }

  return result;
}

// ─── CRA Charities ────────────────────────────────────────────────────────────

async function runCharities() {
  const result = {
    dataset_id: 'CV-DATA-YT-002',
    dataset_name: 'CRA Charities Registry — YT org-level extract',
    firestore_target: {
      collection: 'subnational_tax_exempt_entities',
      doc_id: 'CA-YT',
      path: 'subnational_tax_exempt_entities/CA-YT',
      write_mode: 'merge',
    },
    source_url: caYt.SOURCES.charities,
    fetched_at: FETCHED_AT,
    status: null,
    error: null,
    reporting_period: null,
    records_fetched: null,
    records_transformed: null,
    fields_to_write: [],
    sample_records: [],
    warnings: [],
    ui_renderable: false,
    safe_to_write_after_review: false,
    mvp_note: 'Name/type/category only — no dollar values per MVP product decision.',
  };

  try {
    console.log('[canada-yt-dry-run] CRA Charities: fetching (YT filter)…');
    const doc = await caYt.buildTax();
    const valid = hasTaxPayload(doc);

    if (!valid || !doc) {
      result.status = 'BLOCKED';
      result.error = 'No tax/charities payload returned';
      return result;
    }

    result.status = 'DRY_RUN_OK';
    result.reporting_period = doc.data_source || 'CRA Charities Registry latest extract';
    result.source_url = doc.source_url || caYt.SOURCES.charities;
    result.records_fetched = doc.total_in_source;
    result.records_transformed = doc.records_stored;
    result.sample_records = sample(doc.records, 3).map(trimRecord);
    result.fields_to_write = topKeys(doc);
    result.ui_renderable = true;
    result.safe_to_write_after_review = true;

    if (doc.records.some((r) => r.rawValue > 0)) {
      result.warnings.push('rawValue > 0 on some records — unexpected (should be 0 per MVP)');
    }
    if (doc.total_in_source < 5) {
      result.warnings.push(`Only ${doc.total_in_source} YT charities found — confirm province/territory filter 'YT' matches CSV column`);
    }
  } catch (err) {
    result.status = 'BLOCKED';
    result.error = err.message || String(err);
  }

  return result;
}

// ─── Yukon Grants / Payments — NOT FOUND ──────────────────────────────────────

async function runGrants() {
  const result = {
    dataset_id: 'CV-DATA-YT-003',
    dataset_name: 'Yukon Grants / Public Payments — NOT FOUND',
    firestore_target: {
      collection: 'subnational_grants',
      doc_id: 'CA-YT',
      path: 'subnational_grants/CA-YT',
      write_mode: 'merge',
    },
    source_url: null,
    fetched_at: FETCHED_AT,
    status: 'NOT_FOUND',
    error: null,
    reporting_period: null,
    records_fetched: null,
    records_transformed: null,
    fields_to_write: [],
    sample_records: [],
    warnings: [],
    ui_renderable: false,
    safe_to_write_after_review: false,
    recommended_modal_label: null,
    sources_checked: [
      {
        source: 'yukon.ca (task primary candidate domain)',
        result: 'Returns HTTP 403 on direct request — confirmed via curl. Bot-protected. Not scraped, per project ' +
          'rules against anti-bot-blocked sources.',
      },
      {
        source: 'open.yukon.ca (Yukon\'s official CKAN open data portal, licence "Open Government Licence - Yukon")',
        result: 'Resolves and is fully browsable/searchable via the CKAN API. Full-text search across "grants" ' +
          '(647 results), "payments" (28), "supplier" (9), "expenditure" (80), "public accounts" (81), "transfer ' +
          'payments" (4), "spending" (20), "disclosure" (36) performed.',
      },
      {
        source: '"Yukon Government Supplier Directory"',
        result: 'A self-reported, UNVERIFIED business directory of vendors who WANT to do business with the ' +
          'Yukon government — not a disclosure of actual payments made, no payment amounts. Explicit CKAN notes: ' +
          '"Government of Yukon does not verify this information." Rejected: not a payments record.',
      },
      {
        source: 'Narrow single-program grant datasets (Pioneer Utility Grant, Spark Tourism Micro Grant, Crown ' +
          'grants - 50k, Community Development Fund/Economic Development Fund/Media Development funding ' +
          'programs annual reports)',
        result: 'All single-program in scope (not whole-of-government) and the "fund annual report" datasets are ' +
          'PDF-only. Rejected: wrong scope and/or wrong format.',
      },
      {
        source: 'Yukon Public Accounts (fiscal years 2001-02 through 2024-25, on open.yukon.ca under organization ' +
          '"finance") — INCLUDING Schedule 8 (Schedule of legislated grants) and Schedule 9 (Schedule of other ' +
          'government transfers), which would be exactly the payee-level data needed',
        result: 'Genuinely current (2024-25 Public Accounts package last modified 2025-11-05) and comprehensive ' +
          '(whole-of-government) — BUT confirmed via a full organization-wide resource-format scan (170 Finance-' +
          'org datasets, every resource inspected) to be 100% PDF, 0% CSV/XLSX/JSON. PDF extraction was not ' +
          'authorized for this task, so this otherwise-ideal source could not be used.',
      },
    ],
  };

  try {
    console.log('[canada-yt-dry-run] YT Grants: attempting discovery (expected to be NOT FOUND — see sources_checked)…');
    await caYt.buildGrants();
    // Should never reach here — buildGrants() always throws for YT.
    result.status = 'DRY_RUN_OK';
  } catch (err) {
    result.status = 'NOT_FOUND';
    result.error = err.message || String(err);
    console.log('[canada-yt-dry-run] YT Grants: confirmed not found —', result.error.slice(0, 120), '…');
  }

  return result;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('[canada-yt-dry-run] ============================================');
  console.log('[canada-yt-dry-run] CA-YT (Yukon) dataset dry-run');
  console.log('[canada-yt-dry-run] DRY-RUN ONLY — no Firestore writes');
  console.log(`[canada-yt-dry-run] Started: ${FETCHED_AT}`);
  console.log('[canada-yt-dry-run] ============================================');

  const [unemp, charities, grants] = await Promise.allSettled([
    runUnemployment(),
    runCharities(),
    runGrants(),
  ]);

  const results = [unemp, charities, grants].map((r) => {
    if (r.status === 'rejected') {
      return { status: 'BLOCKED', error: r.reason?.message || String(r.reason), fetched_at: FETCHED_AT };
    }
    return r.value;
  });

  const report = {
    run_type: 'DRY_RUN',
    run_at: FETCHED_AT,
    jurisdiction: 'CA-YT',
    datasets: results,
    summary: {
      total: results.length,
      dry_run_ok: results.filter((r) => r.status === 'DRY_RUN_OK').length,
      blocked: results.filter((r) => r.status === 'BLOCKED').length,
      not_found: results.filter((r) => r.status === 'NOT_FOUND').length,
      warnings_total: results.reduce((s, r) => s + (r.warnings?.length || 0), 0),
    },
  };

  if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });

  const ts = FETCHED_AT.replace(/[:.]/g, '-').replace('T', '_').slice(0, 19);
  const reportPath = path.join(REPORTS_DIR, `canada-yt-dry-run-${ts}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');

  const latestPath = path.join(REPORTS_DIR, 'canada-yt-dry-run-latest.json');
  fs.writeFileSync(latestPath, JSON.stringify(report, null, 2), 'utf8');

  console.log('\n[canada-yt-dry-run] ============ SUMMARY ============');
  for (const r of results) {
    const icon = r.status === 'DRY_RUN_OK' ? '✓' : r.status === 'NOT_FOUND' ? '⚠' : '✗';
    console.log(`\n  ${icon} ${r.dataset_id || '?'} — ${r.dataset_name || '?'}`);
    console.log(`    status:     ${r.status}`);
    if (r.error) console.log(`    error:      ${r.error}`);
    if (r.reporting_period) console.log(`    period:     ${r.reporting_period}`);
    if (r.records_transformed != null)
      console.log(`    records:    ${r.records_fetched} fetched → ${r.records_transformed} transformed`);
    if (r.warnings?.length) console.log(`    warnings:   ${r.warnings.join(' | ')}`);
    console.log(`    ui render:  ${r.ui_renderable ? 'yes' : 'no'}`);
    console.log(`    safe write: ${r.safe_to_write_after_review ? 'yes (after review)' : 'no'}`);
    console.log(`    firestore:  ${r.firestore_target?.path || 'n/a'}`);
  }

  console.log(`\n  Total: ${report.summary.dry_run_ok}/${report.summary.total} OK, ${report.summary.blocked} blocked, ${report.summary.not_found} not found`);
  console.log(`\n  Report: ${reportPath}`);
  console.log(`  Latest: ${latestPath}`);
  console.log('\n[canada-yt-dry-run] done. No Firestore writes performed.');
}

main().catch((err) => {
  console.error('[canada-yt-dry-run] fatal:', err);
  process.exit(1);
});
