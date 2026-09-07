/**
 * CA-NU (Nunavut) dataset dry-run.
 *
 * Fetches and transforms Nunavut datasets. Does NOT write Firestore, does
 * NOT read Firestore, does NOT probe Firestore in any way (Firestore quota
 * is currently exhausted — this script has zero Firestore dependency by
 * design). Writes structured JSON report to
 * engine/reports/canada-nu-dry-run-latest.json
 *
 * Datasets:
 *   Stats Can LFS unemployment   → subnational_economic_social_stats/CA-NU
 *   CRA Charities (NU filter)    → subnational_tax_exempt_entities/CA-NU
 *   NU Grants/Payments           → subnational_grants/CA-NU — NOT FOUND (see report)
 *
 * Note: Nunavut is NOT covered by Table 14-10-0287-01 (that table's
 * geography dimension is Canada + the 10 provinces only). Nunavut uses the
 * dedicated territorial table 14-10-0292-01, same as Yukon and Northwest
 * Territories.
 *
 * Usage:
 *   node engine/canada-nu-dry-run.cjs
 */

'use strict';

const fs = require('fs');
const path = require('path');

const caNu = require('./lib/subnational-transparency-ca-nu.cjs');
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
    dataset_id: 'CV-DATA-NU-001',
    dataset_name: 'Statistics Canada — Nunavut Unemployment (Table 14-10-0292-01, territorial LFS)',
    statcan_coord_used: caNu.STATCAN_NU_COORD,
    statcan_table_note: 'Table 14-10-0287-01 (used for the 10 provinces) does NOT cover territories — its geo ' +
      'dimension is Canada + 10 provinces only. Nunavut has a dedicated table, 14-10-0292-01 ("Labour force ' +
      'characteristics by territory, three-month moving average, seasonally adjusted and unadjusted"), where a ' +
      'valid Nunavut coordinate DOES exist and was confirmed via getSeriesInfoFromCubePidCoord (SeriesTitleEn: ' +
      '"Nunavut;Unemployment rate;Total - Gender;15 years and over;Estimate;Seasonally adjusted"). Fetched via the ' +
      'statcanTerritorialUnemployment() helper, which itself uses the hardened statcanWdsPostJson() reliability ' +
      'fetch helper (https retry -> fetch retry -> curl fallback).',
    firestore_target: {
      collection: 'subnational_economic_social_stats',
      doc_id: 'CA-NU',
      path: 'subnational_economic_social_stats/CA-NU',
      write_mode: 'merge',
    },
    source_url: caNu.SOURCES.unemployment,
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
    console.log('[canada-nu-dry-run] Stats Can unemployment (territorial table 14-10-0292-01): fetching coord', caNu.STATCAN_NU_COORD, '…');
    const doc = await caNu.buildEconomic();
    const valid = hasEconomicPayload(doc);
    const notes = doc?.data_status?.notes || [];
    if (notes.length) result.warnings.push(...notes);

    if (!valid) {
      result.status = 'BLOCKED';
      result.error = 'No economic payload returned — coordinate may be wrong or API returned no data';
      result.warnings.push(`Coord attempted: ${caNu.STATCAN_NU_COORD} (Table 14-10-0292-01)`);
      return result;
    }

    result.status = 'DRY_RUN_OK';
    result.reporting_period = doc.unemployment_reporting_period || doc.reporting_period || null;
    result.source_url = doc.unemployment_source_url || caNu.SOURCES.unemployment;
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
    dataset_id: 'CV-DATA-NU-002',
    dataset_name: 'CRA Charities Registry — NU org-level extract',
    firestore_target: {
      collection: 'subnational_tax_exempt_entities',
      doc_id: 'CA-NU',
      path: 'subnational_tax_exempt_entities/CA-NU',
      write_mode: 'merge',
    },
    source_url: caNu.SOURCES.charities,
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
    console.log('[canada-nu-dry-run] CRA Charities: fetching (NU filter)…');
    const doc = await caNu.buildTax();
    const valid = hasTaxPayload(doc);

    if (!valid || !doc) {
      result.status = 'BLOCKED';
      result.error = 'No tax/charities payload returned';
      return result;
    }

    result.status = 'DRY_RUN_OK';
    result.reporting_period = doc.data_source || 'CRA Charities Registry latest extract';
    result.source_url = doc.source_url || caNu.SOURCES.charities;
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
      result.warnings.push(`Only ${doc.total_in_source} NU charities found — confirm province/territory filter 'NU' matches CSV column`);
    }
  } catch (err) {
    result.status = 'BLOCKED';
    result.error = err.message || String(err);
  }

  return result;
}

// ─── Nunavut Grants / Payments — NOT FOUND ────────────────────────────────────

async function runGrants() {
  const result = {
    dataset_id: 'CV-DATA-NU-003',
    dataset_name: 'Nunavut Grants / Public Payments — NOT FOUND',
    firestore_target: {
      collection: 'subnational_grants',
      doc_id: 'CA-NU',
      path: 'subnational_grants/CA-NU',
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
        source: 'gov.nu.ca (task primary candidate domain, and its subpaths e.g. /eia/information/nunavut-bureau-statistics)',
        result: 'Returns HTTP 403 on direct request — confirmed via curl. Bot-protected. Not scraped, per project ' +
          'rules against anti-bot-blocked sources.',
      },
      {
        source: 'opendata.gov.nu.ca and data.gov.nu.ca',
        result: 'Neither resolves (no such host). Nunavut has no dedicated open data portal — confirmed via DNS ' +
          'lookup and via web search ("The Government of Nunavut doesn\'t provide an open data portal per se.").',
      },
      {
        source: 'Federal open.canada.ca CKAN aggregator, organization "nu"',
        result: '0 datasets found. The only dataset titled "Nunavut" found via general search is an unrelated ' +
          'Natural Resources Canada political boundary map, not a Government of Nunavut financial dataset.',
      },
      {
        source: 'Nunavut Public Accounts (e.g. "Public Accounts of the Government of Nunavut for the Year Ended ' +
          'March 31, 2024", tabled at the Legislative Assembly)',
        result: 'Reasonably current and exists — but published exclusively as PDF, hosted on the bot-blocked ' +
          'gov.nu.ca and mirrored on assembly.nu.ca (accessible, but still PDF-only, no CSV/XLSX/open-data ' +
          'version). PDF extraction was not authorized for this task, so this source could not be used despite ' +
          'being current.',
      },
    ],
  };

  try {
    console.log('[canada-nu-dry-run] NU Grants: attempting discovery (expected to be NOT FOUND — see sources_checked)…');
    await caNu.buildGrants();
    // Should never reach here — buildGrants() always throws for NU.
    result.status = 'DRY_RUN_OK';
  } catch (err) {
    result.status = 'NOT_FOUND';
    result.error = err.message || String(err);
    console.log('[canada-nu-dry-run] NU Grants: confirmed not found —', result.error.slice(0, 120), '…');
  }

  return result;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('[canada-nu-dry-run] ============================================');
  console.log('[canada-nu-dry-run] CA-NU (Nunavut) dataset dry-run');
  console.log('[canada-nu-dry-run] DRY-RUN ONLY — no Firestore reads, no Firestore writes, no Firestore probes');
  console.log(`[canada-nu-dry-run] Started: ${FETCHED_AT}`);
  console.log('[canada-nu-dry-run] ============================================');

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
    jurisdiction: 'CA-NU',
    firestore_interaction: 'none — no reads, no writes, no probes (Firestore quota exhausted at time of this run)',
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
  const reportPath = path.join(REPORTS_DIR, `canada-nu-dry-run-${ts}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');

  const latestPath = path.join(REPORTS_DIR, 'canada-nu-dry-run-latest.json');
  fs.writeFileSync(latestPath, JSON.stringify(report, null, 2), 'utf8');

  console.log('\n[canada-nu-dry-run] ============ SUMMARY ============');
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
  console.log('\n[canada-nu-dry-run] done. No Firestore reads, writes, or probes performed.');
}

main().catch((err) => {
  console.error('[canada-nu-dry-run] fatal:', err);
  process.exit(1);
});
