/**
 * CA-BC (British Columbia) dataset dry-run.
 *
 * Fetches and transforms 3 BC datasets. Does NOT write Firestore.
 * Writes structured JSON report to engine/reports/canada-bc-dry-run-latest.json
 *
 * Datasets:
 *   Stats Can LFS unemployment    → subnational_economic_social_stats/CA-BC
 *   CRA Charities (BC filter)     → subnational_tax_exempt_entities/CA-BC
 *   BC Grants (BC Data Catalogue) → subnational_grants/CA-BC
 *
 * Usage:
 *   node engine/canada-bc-dry-run.cjs
 */

'use strict';

const fs = require('fs');
const path = require('path');

const caBc = require('./lib/subnational-transparency-ca-bc.cjs');
const {
  hasEconomicPayload,
  hasTaxPayload,
  hasGrantsPayload,
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

// ─── Statistics Canada unemployment ──────────────────────────────────────────

async function runUnemployment() {
  const result = {
    dataset_id: 'CV-DATA-BC-001',
    dataset_name: 'Statistics Canada — BC Unemployment (Table 14-10-0287-01)',
    statcan_coord_used: caBc.STATCAN_BC_COORD,
    firestore_target: {
      collection: 'subnational_economic_social_stats',
      doc_id: 'CA-BC',
      path: 'subnational_economic_social_stats/CA-BC',
      write_mode: 'merge',
    },
    source_url: caBc.SOURCES.unemployment,
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
    console.log('[canada-bc-dry-run] Stats Can unemployment: fetching coord', caBc.STATCAN_BC_COORD, '…');
    const doc = await caBc.buildEconomic();
    const valid = hasEconomicPayload(doc);
    const notes = doc?.data_status?.notes || [];
    if (notes.length) result.warnings.push(...notes);

    if (!valid) {
      result.status = 'BLOCKED';
      result.error = 'No economic payload returned — coordinate may be wrong or API returned no data';
      result.warnings.push(`Coord attempted: ${caBc.STATCAN_BC_COORD}`);
      return result;
    }

    result.status = 'DRY_RUN_OK';
    result.reporting_period = doc.unemployment_reporting_period || doc.reporting_period || null;
    result.source_url = doc.unemployment_source_url || caBc.SOURCES.unemployment;
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
    dataset_id: 'CV-DATA-BC-002',
    dataset_name: 'CRA Charities Registry — BC org-level extract',
    firestore_target: {
      collection: 'subnational_tax_exempt_entities',
      doc_id: 'CA-BC',
      path: 'subnational_tax_exempt_entities/CA-BC',
      write_mode: 'merge',
    },
    source_url: caBc.SOURCES.charities,
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
    console.log('[canada-bc-dry-run] CRA Charities: fetching (BC filter)…');
    const doc = await caBc.buildTax();
    const valid = hasTaxPayload(doc);

    if (!valid || !doc) {
      result.status = 'BLOCKED';
      result.error = 'No tax/charities payload returned';
      return result;
    }

    result.status = 'DRY_RUN_OK';
    result.reporting_period = doc.data_source || 'CRA Charities Registry latest extract';
    result.source_url = doc.source_url || caBc.SOURCES.charities;
    result.records_fetched = doc.total_in_source;
    result.records_transformed = doc.records_stored;
    result.sample_records = sample(doc.records, 3).map(trimRecord);
    result.fields_to_write = topKeys(doc);
    result.ui_renderable = true;
    result.safe_to_write_after_review = true;

    if (doc.records.some((r) => r.rawValue > 0)) {
      result.warnings.push('rawValue > 0 on some records — unexpected (should be 0 per MVP)');
    }
    if (doc.total_in_source < 10) {
      result.warnings.push(`Only ${doc.total_in_source} BC charities found — confirm province filter 'BC' matches CSV column`);
    }
  } catch (err) {
    result.status = 'BLOCKED';
    result.error = err.message || String(err);
  }

  return result;
}

// ─── BC Grants ────────────────────────────────────────────────────────────────

async function runGrants() {
  const result = {
    dataset_id: 'CV-DATA-BC-003',
    dataset_name: 'BC Government Grants / Payments (BC Data Catalogue)',
    firestore_target: {
      collection: 'subnational_grants',
      doc_id: 'CA-BC',
      path: 'subnational_grants/CA-BC',
      write_mode: 'merge',
    },
    source_url: caBc.SOURCES.bcCkanSearch,
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
    discovered_source: null,
    detected_columns: null,
    all_headers: null,
    recommended_modal_label: null,
    total_before_aggregate_filter: null,
    aggregate_rows_excluded_count: null,
    aggregate_rows_excluded: null,
    top_20_after_filter: [],
  };

  try {
    console.log('[canada-bc-dry-run] BC Grants: discovering source via BC Data Catalogue CKAN…');
    // Run discovery separately first so we can surface metadata even if CSV parsing fails
    let discoveryMeta = null;
    try {
      discoveryMeta = await caBc.discoverBcGrantsSource();
      result.discovered_source = {
        package_title: discoveryMeta.packageTitle,
        source_url: discoveryMeta.packageUrl,
        resource_url: discoveryMeta.resourceUrl,
        resource_name: discoveryMeta.resourceName,
        licence: discoveryMeta.licence,
        discovery_note: discoveryMeta.note,
        all_csv_candidates: discoveryMeta.allCsvCandidates || [],
        all_search_results: (discoveryMeta.allSearchResults || []).map((p) => ({
          title: p.title, id: p.id, query: p.query,
        })),
      };
    } catch (discErr) {
      result.status = 'BLOCKED';
      result.error = discErr.message || String(discErr);
      result.discovered_source = { error: result.error };
      return result;
    }

    const doc = await caBc.buildGrants();
    const valid = hasGrantsPayload(doc);

    // Surface discovery metadata regardless of payload validity
    result.discovered_source = {
      package_title: doc.data_source || null,
      source_url: doc.source_url || null,
      resource_url: doc.resource_url || null,
      licence: doc.licence || null,
      discovery_note: doc.discovery_note || null,
    };
    result.detected_columns = doc.detected_columns || null;
    result.all_headers = doc.all_headers || null;

    if (!valid || !doc) {
      result.status = 'BLOCKED';
      result.error = 'No grants payload returned (hasGrantsPayload check failed)';
      return result;
    }

    result.status = 'DRY_RUN_OK';
    result.reporting_period = doc.reporting_period || `FY ${doc.fiscal_year}` || null;
    result.source_url = doc.source_url || null;
    result.records_fetched = doc.total_after_filter || doc.records.length;
    result.records_transformed = doc.records_stored || doc.records.length;
    result.sample_records = sample(doc.records, 3).map(trimRecord);
    result.fields_to_write = topKeys(doc);
    result.ui_renderable = true;
    result.safe_to_write_after_review = true;

    result.total_before_aggregate_filter = doc.total_before_aggregate_filter ?? null;
    result.aggregate_rows_excluded_count = doc.aggregate_rows_excluded_count ?? null;
    result.aggregate_rows_excluded = doc.aggregate_rows_excluded || [];
    result.top_20_after_filter = doc.records.slice(0, 20).map(trimRecord);

    // Recommend modal label based on discovered dataset title
    const titleLower = (doc.data_source || '').toLowerCase();
    if (/transfer.payment/i.test(titleLower)) {
      result.recommended_modal_label = 'Transfer Payments';
    } else if (/grant/i.test(titleLower)) {
      result.recommended_modal_label = 'Grants';
    } else if (/payment|expenditure/i.test(titleLower)) {
      result.recommended_modal_label = 'Public Payments';
    } else {
      result.recommended_modal_label = 'Public Accounts Payments';
      result.warnings.push('Could not determine precise modal label from dataset title — review recommended_modal_label');
    }

    if (!doc.fiscal_year || doc.fiscal_year === 'latest') {
      result.warnings.push('fiscal_year could not be inferred — confirm reporting period before write');
    }
    if (doc.records.some((r) => !r.rawAmount)) {
      result.warnings.push('Some records have rawAmount = 0 — amount column mapping may need review');
    }
  } catch (err) {
    result.status = 'BLOCKED';
    result.error = err.message || String(err);
    // If discovery failed, include what was attempted
    if (!result.discovered_source) {
      result.discovered_source = { error: err.message };
    }
  }

  return result;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('[canada-bc-dry-run] ============================================');
  console.log('[canada-bc-dry-run] CA-BC (British Columbia) dataset dry-run');
  console.log('[canada-bc-dry-run] DRY-RUN ONLY — no Firestore writes');
  console.log(`[canada-bc-dry-run] Started: ${FETCHED_AT}`);
  console.log('[canada-bc-dry-run] ============================================');

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
    jurisdiction: 'CA-BC',
    datasets: results,
    summary: {
      total: results.length,
      dry_run_ok: results.filter((r) => r.status === 'DRY_RUN_OK').length,
      blocked: results.filter((r) => r.status === 'BLOCKED').length,
      warnings_total: results.reduce((s, r) => s + (r.warnings?.length || 0), 0),
    },
  };

  if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });

  const ts = FETCHED_AT.replace(/[:.]/g, '-').replace('T', '_').slice(0, 19);
  const reportPath = path.join(REPORTS_DIR, `canada-bc-dry-run-${ts}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');

  const latestPath = path.join(REPORTS_DIR, 'canada-bc-dry-run-latest.json');
  fs.writeFileSync(latestPath, JSON.stringify(report, null, 2), 'utf8');

  console.log('\n[canada-bc-dry-run] ============ SUMMARY ============');
  for (const r of results) {
    const icon = r.status === 'DRY_RUN_OK' ? '✓' : '✗';
    console.log(`\n  ${icon} ${r.dataset_id || '?'} — ${r.dataset_name || '?'}`);
    console.log(`    status:     ${r.status}`);
    if (r.error) console.log(`    error:      ${r.error}`);
    if (r.reporting_period) console.log(`    period:     ${r.reporting_period}`);
    if (r.records_transformed != null)
      console.log(`    records:    ${r.records_fetched} fetched → ${r.records_transformed} transformed`);
    if (r.discovered_source?.package_title)
      console.log(`    source:     ${r.discovered_source.package_title}`);
    if (r.recommended_modal_label)
      console.log(`    modal label: ${r.recommended_modal_label}`);
    if (r.total_before_aggregate_filter != null)
      console.log(`    aggregate filter: ${r.total_before_aggregate_filter} before → ${r.aggregate_rows_excluded_count} excluded (${(r.aggregate_rows_excluded || []).join(', ')})`);
    if (r.warnings?.length) console.log(`    warnings:   ${r.warnings.join('; ')}`);
    console.log(`    ui render:  ${r.ui_renderable ? 'yes' : 'no'}`);
    console.log(`    safe write: ${r.safe_to_write_after_review ? 'yes (after review)' : 'no'}`);
    console.log(`    firestore:  ${r.firestore_target?.path || 'n/a'}`);
  }

  console.log(`\n  Total: ${report.summary.dry_run_ok}/${report.summary.total} OK, ${report.summary.blocked} blocked`);
  console.log(`\n  Report: ${reportPath}`);
  console.log(`  Latest: ${latestPath}`);
  console.log('\n[canada-bc-dry-run] done. No Firestore writes performed.');
}

main().catch((err) => {
  console.error('[canada-bc-dry-run] fatal:', err);
  process.exit(1);
});
