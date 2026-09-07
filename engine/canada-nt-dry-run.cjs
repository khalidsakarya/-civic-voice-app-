/**
 * CA-NT (Northwest Territories) dataset dry-run.
 *
 * Fetches and transforms Northwest Territories datasets. Does NOT write
 * Firestore, does NOT read Firestore, does NOT probe Firestore in any way
 * (Firestore quota is currently exhausted — this script has zero Firestore
 * dependency by design). Writes structured JSON report to
 * engine/reports/canada-nt-dry-run-latest.json
 *
 * Datasets:
 *   Stats Can LFS unemployment   → subnational_economic_social_stats/CA-NT
 *   CRA Charities (NT filter)    → subnational_tax_exempt_entities/CA-NT
 *   NT Grants/Payments           → subnational_grants/CA-NT — NOT FOUND (see report)
 *
 * Note: Northwest Territories is NOT covered by Table 14-10-0287-01 (that
 * table's geography dimension is Canada + the 10 provinces only). NWT uses
 * the dedicated territorial table 14-10-0292-01, same as Yukon.
 *
 * Usage:
 *   node engine/canada-nt-dry-run.cjs
 */

'use strict';

const fs = require('fs');
const path = require('path');

const caNt = require('./lib/subnational-transparency-ca-nt.cjs');
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
    dataset_id: 'CV-DATA-NT-001',
    dataset_name: 'Statistics Canada — Northwest Territories Unemployment (Table 14-10-0292-01, territorial LFS)',
    statcan_coord_used: caNt.STATCAN_NT_COORD,
    statcan_table_note: 'Table 14-10-0287-01 (used for the 10 provinces) does NOT cover territories — its geo ' +
      'dimension is Canada + 10 provinces only. Northwest Territories has a dedicated table, 14-10-0292-01 ' +
      '("Labour force characteristics by territory, three-month moving average, seasonally adjusted and ' +
      'unadjusted"), where a valid NWT coordinate DOES exist and was confirmed via getSeriesInfoFromCubePidCoord ' +
      '(SeriesTitleEn: "Northwest Territories;Unemployment rate;Total - Gender;15 years and over;Estimate;' +
      'Seasonally adjusted"). Fetched via the new statcanTerritorialUnemployment() helper, which itself uses the ' +
      'hardened statcanWdsPostJson() reliability fetch helper (https retry -> fetch retry -> curl fallback).',
    firestore_target: {
      collection: 'subnational_economic_social_stats',
      doc_id: 'CA-NT',
      path: 'subnational_economic_social_stats/CA-NT',
      write_mode: 'merge',
    },
    source_url: caNt.SOURCES.unemployment,
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
    console.log('[canada-nt-dry-run] Stats Can unemployment (territorial table 14-10-0292-01): fetching coord', caNt.STATCAN_NT_COORD, '…');
    const doc = await caNt.buildEconomic();
    const valid = hasEconomicPayload(doc);
    const notes = doc?.data_status?.notes || [];
    if (notes.length) result.warnings.push(...notes);

    if (!valid) {
      result.status = 'BLOCKED';
      result.error = 'No economic payload returned — coordinate may be wrong or API returned no data';
      result.warnings.push(`Coord attempted: ${caNt.STATCAN_NT_COORD} (Table 14-10-0292-01)`);
      return result;
    }

    result.status = 'DRY_RUN_OK';
    result.reporting_period = doc.unemployment_reporting_period || doc.reporting_period || null;
    result.source_url = doc.unemployment_source_url || caNt.SOURCES.unemployment;
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
    dataset_id: 'CV-DATA-NT-002',
    dataset_name: 'CRA Charities Registry — NT org-level extract',
    firestore_target: {
      collection: 'subnational_tax_exempt_entities',
      doc_id: 'CA-NT',
      path: 'subnational_tax_exempt_entities/CA-NT',
      write_mode: 'merge',
    },
    source_url: caNt.SOURCES.charities,
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
    console.log('[canada-nt-dry-run] CRA Charities: fetching (NT filter)…');
    const doc = await caNt.buildTax();
    const valid = hasTaxPayload(doc);

    if (!valid || !doc) {
      result.status = 'BLOCKED';
      result.error = 'No tax/charities payload returned';
      return result;
    }

    result.status = 'DRY_RUN_OK';
    result.reporting_period = doc.data_source || 'CRA Charities Registry latest extract';
    result.source_url = doc.source_url || caNt.SOURCES.charities;
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
      result.warnings.push(`Only ${doc.total_in_source} NT charities found — confirm province/territory filter 'NT' matches CSV column`);
    }
  } catch (err) {
    result.status = 'BLOCKED';
    result.error = err.message || String(err);
  }

  return result;
}

// ─── Northwest Territories Grants / Payments — NOT FOUND ──────────────────────

async function runGrants() {
  const result = {
    dataset_id: 'CV-DATA-NT-003',
    dataset_name: 'Northwest Territories Grants / Public Payments — NOT FOUND',
    firestore_target: {
      collection: 'subnational_grants',
      doc_id: 'CA-NT',
      path: 'subnational_grants/CA-NT',
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
        source: 'opendata.gov.nt.ca (NWT\'s official CKAN open data portal, ckan 2.9.8, Open Government Licence)',
        result: 'Resolves and is fully browsable/searchable via the CKAN API. Full-text search across "grants" ' +
          '(0 results), "payments" (1), "supplier" (0), "expenditure" (13), "public accounts" (0), "transfer ' +
          'payments" (0), "spending" (8), "disclosure" (0), "vendor" (0) performed.',
      },
      {
        source: '"Moose Jaw Payments for North Slave Region" — the sole "payments" hit',
        result: 'A wildlife-harvest remuneration program (Dept. of Environment and Climate Change) to help ' +
          'determine sex/age/location of moose harvested — not a government financial disclosure of any kind. ' +
          'Rejected: wrong subject entirely.',
      },
      {
        source: '"expenditure"/"spending" hits (13 and 8 results)',
        result: 'All are household expenditure SURVEYS (2003-2019, statistical surveys of resident spending ' +
          'habits) or capital expenditure INTENTIONS (industry investment-intention economic indicators) — not ' +
          'government payment/grant records. Rejected: wrong subject entirely.',
      },
      {
        source: 'Federal open.canada.ca CKAN aggregator, organization "nt" / "nwt"',
        result: '0 datasets found under either organization slug — NWT\'s open data is not mirrored on the ' +
          'federal aggregator (unlike Newfoundland and Labrador).',
      },
      {
        source: 'GNWT Sole Source Contracts Report (fin.gov.nt.ca) — the closest candidate, and the only one ' +
          'with a structured (non-PDF) resource found on first inspection',
        result: 'STALE — the most recently published reporting period listed is April 1, 2017 - March 31, 2018 ' +
          '(confirmed via the live page listing), roughly 8 years out of date with no newer report published ' +
          'since. Also NARROW even if current — sole-source (non-competitive) contracts only, excluding ' +
          'competitively-tendered contracts, grants, and regular transfer payments. Rejected on both currency ' +
          'and scope grounds.',
      },
      {
        source: 'NWT Public Accounts (fin.gov.nt.ca/en/public-accounts)',
        result: 'Almost entirely PDF (Sections I-IV per fiscal year). One structured resource found, "Public ' +
          'Accounts 2022-2023 - Tables" (.xlsx) — but fiscal year 2022-2023 is confirmed to be the MOST RECENT ' +
          'Public Accounts data published at all (no FY2023-24 or FY2024-25 listed), making it roughly 3 fiscal ' +
          'years stale as of this dry-run, and it contains department/category-level summary tables rather than ' +
          'payee-level grants/payments data. Rejected: stale AND (even setting staleness aside) wrong granularity.',
      },
    ],
  };

  try {
    console.log('[canada-nt-dry-run] NT Grants: attempting discovery (expected to be NOT FOUND — see sources_checked)…');
    await caNt.buildGrants();
    // Should never reach here — buildGrants() always throws for NT.
    result.status = 'DRY_RUN_OK';
  } catch (err) {
    result.status = 'NOT_FOUND';
    result.error = err.message || String(err);
    console.log('[canada-nt-dry-run] NT Grants: confirmed not found —', result.error.slice(0, 120), '…');
  }

  return result;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('[canada-nt-dry-run] ============================================');
  console.log('[canada-nt-dry-run] CA-NT (Northwest Territories) dataset dry-run');
  console.log('[canada-nt-dry-run] DRY-RUN ONLY — no Firestore reads, no Firestore writes, no Firestore probes');
  console.log(`[canada-nt-dry-run] Started: ${FETCHED_AT}`);
  console.log('[canada-nt-dry-run] ============================================');

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
    jurisdiction: 'CA-NT',
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
  const reportPath = path.join(REPORTS_DIR, `canada-nt-dry-run-${ts}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');

  const latestPath = path.join(REPORTS_DIR, 'canada-nt-dry-run-latest.json');
  fs.writeFileSync(latestPath, JSON.stringify(report, null, 2), 'utf8');

  console.log('\n[canada-nt-dry-run] ============ SUMMARY ============');
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
  console.log('\n[canada-nt-dry-run] done. No Firestore reads, writes, or probes performed.');
}

main().catch((err) => {
  console.error('[canada-nt-dry-run] fatal:', err);
  process.exit(1);
});
