/**
 * CA-NS (Nova Scotia) dataset dry-run.
 *
 * Fetches and transforms Nova Scotia datasets. Does NOT write Firestore.
 * Writes structured JSON report to engine/reports/canada-ns-dry-run-latest.json
 *
 * Datasets:
 *   Stats Can LFS unemployment              → subnational_economic_social_stats/CA-NS
 *   CRA Charities (NS filter)               → subnational_tax_exempt_entities/CA-NS
 *   NS Agriculture Funding (partial/scope-limited) → subnational_grants/CA-NS
 *
 * Usage:
 *   node engine/canada-ns-dry-run.cjs
 */

'use strict';

const fs = require('fs');
const path = require('path');

const caNs = require('./lib/subnational-transparency-ca-ns.cjs');
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
    dataset_id: 'CV-DATA-NS-001',
    dataset_name: 'Statistics Canada — Nova Scotia Unemployment (Table 14-10-0287-01)',
    statcan_coord_used: caNs.STATCAN_NS_COORD,
    firestore_target: {
      collection: 'subnational_economic_social_stats',
      doc_id: 'CA-NS',
      path: 'subnational_economic_social_stats/CA-NS',
      write_mode: 'merge',
    },
    source_url: caNs.SOURCES.unemployment,
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
    console.log('[canada-ns-dry-run] Stats Can unemployment: fetching coord', caNs.STATCAN_NS_COORD, '…');
    const doc = await caNs.buildEconomic();
    const valid = hasEconomicPayload(doc);
    const notes = doc?.data_status?.notes || [];
    if (notes.length) result.warnings.push(...notes);

    if (!valid) {
      result.status = 'BLOCKED';
      result.error = 'No economic payload returned — coordinate may be wrong or API returned no data';
      result.warnings.push(`Coord attempted: ${caNs.STATCAN_NS_COORD}`);
      if (notes.some((n) => /ECONNRESET/i.test(n))) {
        result.warnings.push('Transient Node-level connection reset against the Stats Can API — same class of issue observed for CA-BC/CA-AB/CA-QC/CA-SK/CA-MB unemployment fetches in this environment. Report separately; do not write.');
      }
      return result;
    }

    result.status = 'DRY_RUN_OK';
    result.reporting_period = doc.unemployment_reporting_period || doc.reporting_period || null;
    result.source_url = doc.unemployment_source_url || caNs.SOURCES.unemployment;
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
    dataset_id: 'CV-DATA-NS-002',
    dataset_name: 'CRA Charities Registry — NS org-level extract',
    firestore_target: {
      collection: 'subnational_tax_exempt_entities',
      doc_id: 'CA-NS',
      path: 'subnational_tax_exempt_entities/CA-NS',
      write_mode: 'merge',
    },
    source_url: caNs.SOURCES.charities,
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
    console.log('[canada-ns-dry-run] CRA Charities: fetching (NS filter)…');
    const doc = await caNs.buildTax();
    const valid = hasTaxPayload(doc);

    if (!valid || !doc) {
      result.status = 'BLOCKED';
      result.error = 'No tax/charities payload returned';
      return result;
    }

    result.status = 'DRY_RUN_OK';
    result.reporting_period = doc.data_source || 'CRA Charities Registry latest extract';
    result.source_url = doc.source_url || caNs.SOURCES.charities;
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
      result.warnings.push(`Only ${doc.total_in_source} NS charities found — confirm province filter 'NS' matches CSV column`);
    }
  } catch (err) {
    result.status = 'BLOCKED';
    result.error = err.message || String(err);
  }

  return result;
}

// ─── Nova Scotia Grants (partial — single department) ────────────────────────

async function runGrants() {
  const result = {
    dataset_id: 'CV-DATA-NS-003',
    dataset_name: 'Nova Scotia Department of Agriculture Funding Programs (PARTIAL — not whole-of-government)',
    firestore_target: {
      collection: 'subnational_grants',
      doc_id: 'CA-NS',
      path: 'subnational_grants/CA-NS',
      write_mode: 'merge',
    },
    source_url: caNs.SOURCES.agricultureFundingDataset,
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
    total_rows_in_source: null,
    blank_recipient_rows_excluded: null,
    top_20_after_filter: [],
    data_shape_warning: null,
    other_ns_narrow_datasets_found: [
      { name: 'Nova Scotia Mineral Resources Development Fund (MRDF) Grant Recipients', id: 'iz26-kkmn', scope: 'Natural Resources — mining sector grants only' },
      { name: 'Age-Friendly Communities Grant Funding Recipients', id: 'izys-5emb', scope: 'Single grant program' },
      { name: 'Applicants and Recipients of Small Business Impact Grant / Small Business Reopening and Support Grant', id: 'xaty-cfpq', scope: 'One-time COVID-era programs' },
      { name: 'Operating Grant Assistance to University and Nova Scotia Community College (NSCC)', id: 'jivi-kv67', scope: 'Post-secondary institutional operating grants only' },
    ],
  };

  try {
    console.log('[canada-ns-dry-run] NS Grants: fetching Department of Agriculture funding dataset (representative sample — see scope warning)…');
    const doc = await caNs.buildGrants();
    const valid = hasGrantsPayload(doc);

    result.discovered_source = {
      package_title: doc.data_source || null,
      scope_note: doc.data_source_scope_note || null,
      source_url: doc.source_url || null,
      resource_url: doc.resource_url || null,
      licence: doc.licence || null,
      licence_url: doc.licence_url || null,
    };
    result.detected_columns = doc.detected_columns || null;
    result.all_headers = doc.all_headers || null;

    if (!valid || !doc) {
      result.status = 'BLOCKED';
      result.error = 'No grants payload returned (hasGrantsPayload check failed)';
      return result;
    }

    result.status = 'DRY_RUN_OK';
    result.reporting_period = doc.reporting_period || null;
    result.source_url = doc.source_url || null;
    result.records_fetched = doc.total_after_filter || doc.records.length;
    result.records_transformed = doc.records_stored || doc.records.length;
    result.sample_records = sample(doc.records, 3).map(trimRecord);
    result.fields_to_write = topKeys(doc);
    result.ui_renderable = true;
    // Not marked safe_to_write_after_review=true by default — this is a single
    // department's dataset, not a comprehensive Nova Scotia grants/payments
    // source. A reviewer must decide whether/how to publish it. See warnings.
    result.safe_to_write_after_review = false;

    result.total_rows_in_source = doc.total_rows_in_source ?? null;
    result.blank_recipient_rows_excluded = doc.blank_recipient_rows_excluded ?? null;
    result.top_20_after_filter = doc.records.slice(0, 20).map(trimRecord);

    if (Array.isArray(doc.warnings) && doc.warnings.length) {
      result.warnings.push(...doc.warnings);
      result.data_shape_warning = doc.warnings[0] || null;
    }

    // No comprehensive Nova Scotia source exists (see module header / warnings).
    // The dataset actually used is agriculture-specific funding programs
    // ("grants" per its own description), so if ever published, "Grants"
    // (scoped/labelled precisely, e.g. "Agriculture Grants") would be accurate
    // — "Transfer Payments" or "Public Accounts Payments" would overstate scope
    // by implying whole-of-government coverage this dataset does not have.
    result.recommended_modal_label = 'Grants (scope-limited — Agriculture only, not recommended for publication as-is)';
  } catch (err) {
    result.status = 'BLOCKED';
    result.error = err.message || String(err);
    if (!result.discovered_source) {
      result.discovered_source = { error: err.message };
    }
  }

  return result;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('[canada-ns-dry-run] ============================================');
  console.log('[canada-ns-dry-run] CA-NS (Nova Scotia) dataset dry-run');
  console.log('[canada-ns-dry-run] DRY-RUN ONLY — no Firestore writes');
  console.log(`[canada-ns-dry-run] Started: ${FETCHED_AT}`);
  console.log('[canada-ns-dry-run] ============================================');

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
    jurisdiction: 'CA-NS',
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
  const reportPath = path.join(REPORTS_DIR, `canada-ns-dry-run-${ts}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');

  const latestPath = path.join(REPORTS_DIR, 'canada-ns-dry-run-latest.json');
  fs.writeFileSync(latestPath, JSON.stringify(report, null, 2), 'utf8');

  console.log('\n[canada-ns-dry-run] ============ SUMMARY ============');
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
    if (r.warnings?.length) console.log(`    warnings:   ${r.warnings.join(' | ')}`);
    console.log(`    ui render:  ${r.ui_renderable ? 'yes' : 'no'}`);
    console.log(`    safe write: ${r.safe_to_write_after_review ? 'yes (after review)' : 'no'}`);
    console.log(`    firestore:  ${r.firestore_target?.path || 'n/a'}`);
  }

  console.log(`\n  Total: ${report.summary.dry_run_ok}/${report.summary.total} OK, ${report.summary.blocked} blocked`);
  console.log(`\n  Report: ${reportPath}`);
  console.log(`  Latest: ${latestPath}`);
  console.log('\n[canada-ns-dry-run] done. No Firestore writes performed.');
}

main().catch((err) => {
  console.error('[canada-ns-dry-run] fatal:', err);
  process.exit(1);
});
