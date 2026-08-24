/**
 * CA-MB (Manitoba) dataset dry-run.
 *
 * Fetches and transforms Manitoba datasets. Does NOT write Firestore.
 * Writes structured JSON report to engine/reports/canada-mb-dry-run-latest.json
 *
 * Datasets:
 *   Stats Can LFS unemployment   → subnational_economic_social_stats/CA-MB
 *   CRA Charities (MB filter)    → subnational_tax_exempt_entities/CA-MB
 *   MB Grants/Payments           → subnational_grants/CA-MB — NOT FOUND (see report)
 *
 * Usage:
 *   node engine/canada-mb-dry-run.cjs
 */

'use strict';

const fs = require('fs');
const path = require('path');

const caMb = require('./lib/subnational-transparency-ca-mb.cjs');
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

// ─── Statistics Canada unemployment ──────────────────────────────────────────

async function runUnemployment() {
  const result = {
    dataset_id: 'CV-DATA-MB-001',
    dataset_name: 'Statistics Canada — Manitoba Unemployment (Table 14-10-0287-01)',
    statcan_coord_used: caMb.STATCAN_MB_COORD,
    firestore_target: {
      collection: 'subnational_economic_social_stats',
      doc_id: 'CA-MB',
      path: 'subnational_economic_social_stats/CA-MB',
      write_mode: 'merge',
    },
    source_url: caMb.SOURCES.unemployment,
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
    console.log('[canada-mb-dry-run] Stats Can unemployment: fetching coord', caMb.STATCAN_MB_COORD, '…');
    const doc = await caMb.buildEconomic();
    const valid = hasEconomicPayload(doc);
    const notes = doc?.data_status?.notes || [];
    if (notes.length) result.warnings.push(...notes);

    if (!valid) {
      result.status = 'BLOCKED';
      result.error = 'No economic payload returned — coordinate may be wrong or API returned no data';
      result.warnings.push(`Coord attempted: ${caMb.STATCAN_MB_COORD}`);
      if (notes.some((n) => /ECONNRESET/i.test(n))) {
        result.warnings.push('Transient Node-level connection reset against the Stats Can API — same class of issue observed for CA-BC/CA-AB/CA-QC/CA-SK unemployment fetches in this environment. Report separately; do not write.');
      }
      return result;
    }

    result.status = 'DRY_RUN_OK';
    result.reporting_period = doc.unemployment_reporting_period || doc.reporting_period || null;
    result.source_url = doc.unemployment_source_url || caMb.SOURCES.unemployment;
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
    dataset_id: 'CV-DATA-MB-002',
    dataset_name: 'CRA Charities Registry — MB org-level extract',
    firestore_target: {
      collection: 'subnational_tax_exempt_entities',
      doc_id: 'CA-MB',
      path: 'subnational_tax_exempt_entities/CA-MB',
      write_mode: 'merge',
    },
    source_url: caMb.SOURCES.charities,
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
    console.log('[canada-mb-dry-run] CRA Charities: fetching (MB filter)…');
    const doc = await caMb.buildTax();
    const valid = hasTaxPayload(doc);

    if (!valid || !doc) {
      result.status = 'BLOCKED';
      result.error = 'No tax/charities payload returned';
      return result;
    }

    result.status = 'DRY_RUN_OK';
    result.reporting_period = doc.data_source || 'CRA Charities Registry latest extract';
    result.source_url = doc.source_url || caMb.SOURCES.charities;
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
      result.warnings.push(`Only ${doc.total_in_source} MB charities found — confirm province filter 'MB' matches CSV column`);
    }
  } catch (err) {
    result.status = 'BLOCKED';
    result.error = err.message || String(err);
  }

  return result;
}

// ─── Manitoba Grants / Payments — NOT FOUND ───────────────────────────────────

async function runGrants() {
  const result = {
    dataset_id: 'CV-DATA-MB-003',
    dataset_name: 'Manitoba Grants / Public Payments — NOT FOUND',
    firestore_target: {
      collection: 'subnational_grants',
      doc_id: 'CA-MB',
      path: 'subnational_grants/CA-MB',
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
        source: 'opendata.gov.mb.ca (task candidate URL)',
        result: 'DNS does not resolve — no such host',
      },
      {
        source: 'geoportal.gov.mb.ca ("Data MB") — Manitoba\'s actual open data platform',
        result: 'Geospatial data only (maps, GIS layers) — no financial/payments datasets.',
      },
      {
        source: 'open.canada.ca federal aggregator, organization=mb',
        result: 'Searched "grants payments", "public accounts", "transfer payments", "supplier payments", ' +
          '"contract disclosure", "government spending" — 0 results for 4 of 6 queries. "public accounts" ' +
          'returned only "Data MB" (HTML/geospatial, no CSV). "contract disclosure" returned two Public Sector ' +
          'Compensation Disclosure datasets (CSV) — salary/compensation data, a different category from ' +
          'grants/payments/transfer-payments to organizations; not used for that reason.',
      },
      {
        source: 'Manitoba proactive disclosure "Contract Disclosure" (gov.mb.ca/openmb/infomb) — contracts ' +
          '≥$10,000/month',
        result: 'Links only to an interactive search-only web application ' +
          '(web.gov.mb.ca/DisclosureOfContracts/, ASP.NET MVC + Knockout.js/AJAX, typeahead search by ' +
          'vendor/department/subject) with no visible bulk CSV export or documented API. Extracting records ' +
          'would require scraping rendered search results or reverse-engineering an undocumented internal AJAX ' +
          'endpoint — both are screen-scraping in substance, not consumption of a published open-data source ' +
          'with clear reuse licence terms. Not used, per the no-scraping scope of this task.',
      },
    ],
  };

  try {
    console.log('[canada-mb-dry-run] MB Grants: attempting discovery (expected to be NOT FOUND — see sources_checked)…');
    await caMb.buildGrants();
    // Should never reach here — buildGrants() always throws for MB.
    result.status = 'DRY_RUN_OK';
  } catch (err) {
    result.status = 'NOT_FOUND';
    result.error = err.message || String(err);
    console.log('[canada-mb-dry-run] MB Grants: confirmed not found —', result.error.slice(0, 120), '…');
  }

  return result;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('[canada-mb-dry-run] ============================================');
  console.log('[canada-mb-dry-run] CA-MB (Manitoba) dataset dry-run');
  console.log('[canada-mb-dry-run] DRY-RUN ONLY — no Firestore writes');
  console.log(`[canada-mb-dry-run] Started: ${FETCHED_AT}`);
  console.log('[canada-mb-dry-run] ============================================');

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
    jurisdiction: 'CA-MB',
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
  const reportPath = path.join(REPORTS_DIR, `canada-mb-dry-run-${ts}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');

  const latestPath = path.join(REPORTS_DIR, 'canada-mb-dry-run-latest.json');
  fs.writeFileSync(latestPath, JSON.stringify(report, null, 2), 'utf8');

  console.log('\n[canada-mb-dry-run] ============ SUMMARY ============');
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
  console.log('\n[canada-mb-dry-run] done. No Firestore writes performed.');
}

main().catch((err) => {
  console.error('[canada-mb-dry-run] fatal:', err);
  process.exit(1);
});
