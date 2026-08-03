/**
 * Canadian MVP dataset dry-run.
 *
 * Fetches and transforms 3 Canadian launch datasets. Does NOT write Firestore.
 * Writes structured JSON reports to engine/reports/.
 *
 * Datasets:
 *   CV-DATA-002  Stats Can unemployment  → subnational_economic_social_stats/CA-ON
 *   CV-DATA-008  CRA Charities           → subnational_tax_exempt_entities/CA-ON
 *   CV-DATA-014  Ontario Transfer Pmts   → subnational_grants/CA-ON
 *
 * Usage:
 *   node engine/canada-mvp-dry-run.cjs
 */

'use strict';

const fs = require('fs');
const path = require('path');

const caOn = require('./lib/subnational-transparency-ca-on.cjs');
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

// ─── CV-DATA-002: Statistics Canada unemployment ──────────────────────────────

async function runUnemployment() {
  const result = {
    dataset_id: 'CV-DATA-002',
    dataset_name: 'Statistics Canada — Ontario Unemployment (Table 14-10-0287-01)',
    firestore_target: {
      collection: 'subnational_economic_social_stats',
      doc_id: 'CA-ON',
      path: 'subnational_economic_social_stats/CA-ON',
      write_mode: 'merge',
    },
    source_url: caOn.SOURCES.unemployment,
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
    console.log('[canada-mvp-dry-run] CV-DATA-002: fetching Statistics Canada unemployment…');
    const doc = await caOn.buildEconomic();
    const valid = hasEconomicPayload(doc);

    const notes = doc?.data_status?.notes || [];
    if (notes.length) result.warnings.push(...notes);

    if (!valid) {
      result.status = 'BLOCKED';
      result.error = 'No economic payload returned (no unemployment series parsed)';
      return result;
    }

    result.status = 'DRY_RUN_OK';
    result.reporting_period = doc.unemployment_reporting_period || doc.reporting_period || null;
    result.source_url = doc.unemployment_source_url || caOn.SOURCES.unemployment;

    // Count monthly series points
    const series =
      doc.unemployment_series_monthly ||
      doc.unemployment_series_rolling_3_month ||
      [];
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

    if (!result.reporting_period) {
      result.warnings.push('reporting_period field not set in output');
    }
    if (doc.unemployment_latest_rate == null) {
      result.warnings.push('unemployment_latest_rate is null — latest month may be missing');
    }
  } catch (err) {
    result.status = 'BLOCKED';
    result.error = err.message || String(err);
  }

  return result;
}

// ─── CV-DATA-008: CRA Charities Registry ─────────────────────────────────────

async function runCharities() {
  const result = {
    dataset_id: 'CV-DATA-008',
    dataset_name: 'CRA Charities Registry — Ontario org-level extract',
    firestore_target: {
      collection: 'subnational_tax_exempt_entities',
      doc_id: 'CA-ON',
      path: 'subnational_tax_exempt_entities/CA-ON',
      write_mode: 'merge',
    },
    source_url: caOn.SOURCES.charities,
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
    console.log('[canada-mvp-dry-run] CV-DATA-008: fetching CRA Charities…');
    const doc = await caOn.buildTax();
    const valid = hasTaxPayload(doc);

    if (!valid || !doc) {
      result.status = 'BLOCKED';
      result.error = 'No tax/charities payload returned';
      return result;
    }

    result.status = 'DRY_RUN_OK';
    result.reporting_period = doc.data_source || 'CRA Charities Registry latest extract';
    result.source_url = doc.source_url || caOn.SOURCES.charities;
    result.records_fetched = doc.total_in_source || doc.records.length;
    result.records_transformed = doc.records_stored || doc.records.length;
    result.sample_records = sample(doc.records, 3).map(trimRecord);

    result.fields_to_write = topKeys(doc);

    result.ui_renderable = true;
    result.safe_to_write_after_review = true;

    if (doc.records.some((r) => r.rawValue > 0)) {
      result.warnings.push('rawValue > 0 on some records — unexpected for MVP (should be 0)');
    }
  } catch (err) {
    result.status = 'BLOCKED';
    result.error = err.message || String(err);
  }

  return result;
}

// ─── CV-DATA-014: Ontario Transfer Payments ───────────────────────────────────

async function runTransferPayments() {
  const result = {
    dataset_id: 'CV-DATA-014',
    dataset_name: 'Ontario Transfer Payments and Grants (data.ontario.ca)',
    firestore_target: {
      collection: 'subnational_grants',
      doc_id: 'CA-ON',
      path: 'subnational_grants/CA-ON',
      write_mode: 'merge',
    },
    source_url: caOn.SOURCES.transferPayments,
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
    console.log('[canada-mvp-dry-run] CV-DATA-014: fetching Ontario Transfer Payments…');
    const doc = await caOn.buildGrants();
    const valid = hasGrantsPayload(doc);

    if (!valid || !doc) {
      result.status = 'BLOCKED';
      result.error = 'No grants payload returned';
      return result;
    }

    result.status = 'DRY_RUN_OK';
    result.reporting_period = doc.reporting_period || `FY ${doc.fiscal_year}` || null;
    result.source_url = doc.source_url || caOn.SOURCES.transferPayments;
    result.records_fetched = doc.total_in_source || doc.records.length;
    result.records_transformed = doc.records_stored || doc.records.length;
    result.sample_records = sample(doc.records, 3).map(trimRecord);

    result.fields_to_write = topKeys(doc);

    result.ui_renderable = true;
    result.safe_to_write_after_review = true;

    if (!doc.fiscal_year || doc.fiscal_year === 'latest') {
      result.warnings.push(
        'fiscal_year could not be inferred from CSV — confirm reporting period before Firestore write',
      );
    }
    if (doc.records.some((r) => !r.rawAmount)) {
      result.warnings.push(
        'Some records have rawAmount = 0 — amount column may not have mapped correctly',
      );
    }
  } catch (err) {
    result.status = 'BLOCKED';
    result.error = err.message || String(err);
  }

  return result;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('[canada-mvp-dry-run] ============================================');
  console.log('[canada-mvp-dry-run] Canadian MVP dataset dry-run');
  console.log('[canada-mvp-dry-run] DRY-RUN ONLY — no Firestore writes');
  console.log(`[canada-mvp-dry-run] Started: ${FETCHED_AT}`);
  console.log('[canada-mvp-dry-run] ============================================');

  const [unemp, charities, transfers] = await Promise.allSettled([
    runUnemployment(),
    runCharities(),
    runTransferPayments(),
  ]);

  const results = [unemp, charities, transfers].map((r) => {
    if (r.status === 'rejected') {
      return {
        status: 'BLOCKED',
        error: r.reason?.message || String(r.reason),
        fetched_at: FETCHED_AT,
      };
    }
    return r.value;
  });

  const report = {
    run_type: 'DRY_RUN',
    run_at: FETCHED_AT,
    jurisdiction: 'CA-ON',
    datasets: results,
    summary: {
      total: results.length,
      dry_run_ok: results.filter((r) => r.status === 'DRY_RUN_OK').length,
      blocked: results.filter((r) => r.status === 'BLOCKED').length,
      warnings_total: results.reduce((s, r) => s + (r.warnings?.length || 0), 0),
    },
  };

  if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });

  const reportPath = path.join(
    REPORTS_DIR,
    `canada-mvp-dry-run-${FETCHED_AT.replace(/[:.]/g, '-').replace('T', '_').slice(0, 19)}.json`,
  );
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');

  // Also overwrite the "latest" file for easy access
  const latestPath = path.join(REPORTS_DIR, 'canada-mvp-dry-run-latest.json');
  fs.writeFileSync(latestPath, JSON.stringify(report, null, 2), 'utf8');

  // ─── Console summary ───────────────────────────────────────────────────────
  console.log('\n[canada-mvp-dry-run] ============ SUMMARY ============');
  for (const r of results) {
    const icon = r.status === 'DRY_RUN_OK' ? '✓' : '✗';
    console.log(`\n  ${icon} ${r.dataset_id || '?'} — ${r.dataset_name || '?'}`);
    console.log(`    status:     ${r.status}`);
    if (r.error) console.log(`    error:      ${r.error}`);
    if (r.reporting_period) console.log(`    period:     ${r.reporting_period}`);
    if (r.records_transformed != null) console.log(`    records:    ${r.records_fetched} fetched → ${r.records_transformed} transformed`);
    if (r.warnings?.length) console.log(`    warnings:   ${r.warnings.join('; ')}`);
    console.log(`    ui render:  ${r.ui_renderable ? 'yes (no app code changes needed)' : 'no'}`);
    console.log(`    safe write: ${r.safe_to_write_after_review ? 'yes (after CV-REC-001 review)' : 'no'}`);
    console.log(`    firestore:  ${r.firestore_target?.path || 'n/a'}`);
  }

  console.log(`\n  Total: ${report.summary.dry_run_ok}/${report.summary.total} OK, ${report.summary.blocked} blocked`);
  console.log(`\n  Report: ${reportPath}`);
  console.log(`  Latest: ${latestPath}`);
  console.log('\n[canada-mvp-dry-run] done. No Firestore writes performed.');
}

main().catch((err) => {
  console.error('[canada-mvp-dry-run] fatal:', err);
  process.exit(1);
});
