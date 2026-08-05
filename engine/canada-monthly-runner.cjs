'use strict';

/**
 * Canadian MVP monthly data runner — Ontario datasets.
 *
 * Default: dry-run only. No Firestore writes without --write.
 * Merge-only writes. No empty/null overwrites. No fake/inferred data.
 * If a source fails, the dataset is marked BLOCKED and no write occurs.
 *
 * Usage:
 *   node engine/canada-monthly-runner.cjs
 *   node engine/canada-monthly-runner.cjs --write
 *   node engine/canada-monthly-runner.cjs --only=CV-DATA-001,CV-DATA-013
 *
 * Datasets:
 *   CV-DATA-001  Ontario population      → subnational_jurisdictions/CA-ON
 *   CV-DATA-002  Ontario unemployment    → subnational_economic_social_stats/CA-ON
 *   CV-DATA-008  CRA charities           → subnational_tax_exempt_entities/CA-ON
 *   CV-DATA-013  Public Accounts budget  → subnational_economic_social_stats/CA-ON
 *   CV-DATA-014  Ontario transfer pmnts  → subnational_grants/CA-ON
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const {
  tryGetFirestore,
  describeCredentialSource,
  tryLoadDotenv,
} = require('./firebase-admin-init.cjs');

const caOn = require('./lib/subnational-transparency-ca-on.cjs');
const {
  mergeTransparencyDoc,
  hasTaxPayload,
  fetchJson,
  fetchText,
  trim,
} = require('./lib/subnational-transparency-shared.cjs');

// ─── Constants ────────────────────────────────────────────────────────────────

const JURISDICTION = 'CA-ON';
const REPORTS_DIR = path.join(__dirname, 'reports');
const TMP_DIR = path.join(REPORTS_DIR, '_tmp');

const RUN_AT = new Date();
const RUN_AT_ISO = RUN_AT.toISOString();
const RUN_DATE = RUN_AT_ISO.slice(0, 10);
const RUN_STAMP = RUN_AT_ISO.replace(/[:.]/g, '-').slice(0, 19);

const STATSCAN_CSV_URL = 'https://www150.statcan.gc.ca/n1/tbl/csv/17100005-eng.zip';
const STATSCAN_TABLE_ID = '17-10-0005-01';
const STATSCAN_TABLE_DOI = 'https://doi.org/10.25318/1710000501-eng';

const BUDGET_CKAN_PKG_URL =
  'https://data.ontario.ca/api/3/action/package_show?id=public-accounts-annual-report';
const BUDGET_SOURCE_URL = 'https://data.ontario.ca/dataset/public-accounts-annual-report';

const COLOURS = [
  '#6366f1', '#10b981', '#f59e0b', '#ef4444',
  '#3b82f6', '#8b5cf6', '#14b8a6',
];

// ─── Argument parsing ─────────────────────────────────────────────────────────

function parseArgs(argv) {
  const write = argv.includes('--write');
  const onlyArg = argv.find((a) => a.startsWith('--only='));
  const only = onlyArg
    ? new Set(onlyArg.slice('--only='.length).split(',').map((s) => s.trim()).filter(Boolean))
    : null;
  return { write, only };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function verificationId(datasetId) {
  return `CV-REC-${RUN_DATE}-${datasetId}`;
}

function log(prefix, msg) {
  console.log(`[${prefix}] ${msg}`);
}

function formatPopulationDisplay(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  return n.toLocaleString('en-CA');
}

function downloadZip(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    https.get(url, { headers: { 'User-Agent': 'CivicVoice-MonthlyRunner/1.0' } }, (res) => {
      if (res.statusCode !== 200) {
        res.resume();
        reject(new Error(`HTTP ${res.statusCode} from ${url}`));
        return;
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
      file.on('error', reject);
    }).on('error', reject);
  });
}

function extractZipCsv(zipPath) {
  return new Promise((resolve, reject) => {
    const AdmZip = (() => { try { return require('adm-zip'); } catch { return null; } })();
    if (AdmZip) {
      const zip = new AdmZip(zipPath);
      const entry = zip.getEntries().find((e) => e.entryName.endsWith('.csv') && !e.entryName.includes('MetaData'));
      if (!entry) { reject(new Error('No data CSV in zip')); return; }
      resolve(entry.getData().toString('utf8').replace(/^\uFEFF/, ''));
      return;
    }
    // System fallback
    const { execSync } = require('child_process');
    try {
      execSync(`"C:/Program Files/Git/usr/bin/unzip.exe" -o "${zipPath}" -d "${TMP_DIR}"`, { stdio: 'pipe' });
    } catch {
      execSync(`powershell -Command "Expand-Archive -Force -Path '${zipPath}' -DestinationPath '${TMP_DIR}'"`, { stdio: 'pipe' });
    }
    const csvFiles = fs.readdirSync(TMP_DIR).filter((f) => f.endsWith('.csv') && !f.includes('MetaData'));
    if (!csvFiles.length) { reject(new Error('No data CSV after system unzip')); return; }
    resolve(fs.readFileSync(path.join(TMP_DIR, csvFiles[0]), 'utf8').replace(/^\uFEFF/, ''));
  });
}

function parseStatsCsvRows(csvText, targetGeo, targetSex, targetAge) {
  const lines = csvText.split('\n');
  if (lines.length < 2) throw new Error('Stats Can CSV: too short');
  const header = lines[0].split(',').map((h) => h.replace(/^"|"$/g, '').trim());
  const idx = (name) => header.findIndex((h) => h.toLowerCase() === name.toLowerCase());
  const geoIdx = idx('GEO');
  const dateIdx = idx('REF_DATE');
  const sexIdx = idx('Gender');
  const ageIdx = idx('Age group');
  const valIdx = idx('VALUE');
  if ([geoIdx, dateIdx, sexIdx, ageIdx, valIdx].includes(-1)) {
    throw new Error(`Stats Can CSV: missing columns. Found: ${header.join(', ')}`);
  }
  const matched = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const cols = line.match(/(".*?"|[^,]+|(?<=,)(?=,)|(?<=,)$|^(?=,))/g) || line.split(',');
    const clean = cols.map((c) => (c || '').replace(/^"|"$/g, '').trim());
    if (
      clean[geoIdx] === targetGeo &&
      clean[sexIdx] === targetSex &&
      clean[ageIdx] === targetAge &&
      clean[valIdx] && clean[valIdx] !== '..'
    ) {
      const n = parseInt(clean[valIdx].replace(/,/g, ''), 10);
      if (!isNaN(n) && n > 100_000) matched.push({ date: clean[dateIdx], value: n });
    }
  }
  return matched;
}

function parseBudgetCsv(csvText, targetYear, targetType) {
  const clean = csvText.replace(/^\uFEFF/, '');
  const lines = clean.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) throw new Error('Budget CSV: too short');
  function splitLine(line) {
    const out = [];
    let field = '';
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { inQ = !inQ; continue; }
      if (ch === ',' && !inQ) { out.push(field.trim()); field = ''; continue; }
      field += ch;
    }
    out.push(field.trim());
    return out;
  }
  const header = splitLine(lines[0]).map((h) => h.replace(/^\uFEFF/, '').trim());
  const idxF = (frag) => header.findIndex((h) => h.toLowerCase().includes(frag.toLowerCase()));
  const yearIdx = idxF('year');
  const amtIdx = idxF('amount');
  const typeIdx = idxF('revenue/expense/deficit');
  const detailIdx = header.findIndex((h, i) => h.toLowerCase().includes('revenue/expense/deficit') && i > typeIdx);
  if ([yearIdx, amtIdx, typeIdx, detailIdx].includes(-1)) {
    throw new Error(`Budget CSV: missing columns. Header: ${header.join(' | ')}`);
  }
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = splitLine(lines[i]);
    if (cols.length < 4) continue;
    const year = (cols[yearIdx] || '').trim();
    const type = (cols[typeIdx] || '').trim();
    const detail = (cols[detailIdx] || '').trim();
    const amount = parseFloat((cols[amtIdx] || '').replace(/,/g, '').trim());
    if (year !== targetYear) continue;
    if (!type.toLowerCase().startsWith(targetType.toLowerCase())) continue;
    if (!detail || isNaN(amount)) continue;
    rows.push({ detail, amount });
  }
  return rows;
}

// ─── Dataset runners ──────────────────────────────────────────────────────────

/** CV-DATA-001: Statistics Canada population (Table 17-10-0005-01) */
async function runPopulation() {
  const tag = 'CV-DATA-001';
  log(tag, 'Fetching Statistics Canada Table 17-10-0005-01 (population)…');

  fs.mkdirSync(TMP_DIR, { recursive: true });
  const zipPath = path.join(TMP_DIR, '17100005-eng.zip');

  await downloadZip(STATSCAN_CSV_URL, zipPath);
  log(tag, `Downloaded zip: ${zipPath}`);

  const csvText = await extractZipCsv(zipPath);
  log(tag, `Extracted CSV (${Math.round(csvText.length / 1024)} KB)`);

  const rows = parseStatsCsvRows(csvText, 'Ontario', 'Total - gender', 'All ages');
  if (!rows.length) throw new Error('No Ontario/Total-gender/All ages rows in Stats Can CSV');

  rows.sort((a, b) => b.date.localeCompare(a.date));
  const latest = rows[0];
  log(tag, `Latest: ${latest.date} — ${latest.value.toLocaleString('en-CA')} persons`);

  const populationDisplay = formatPopulationDisplay(latest.value);

  const payload = {
    population_display: populationDisplay,
    population: latest.value,
    population_source_url: STATSCAN_TABLE_DOI,
    population_reporting_period: latest.date,
    population_source_note: `Statistics Canada. Table ${STATSCAN_TABLE_ID}. Population estimates on July 1st, by age and sex. GEO=Ontario, Sex=Total-gender, Age=All ages.`,
    population_fetched_date: RUN_AT_ISO,
    population_verification_status: verificationId(tag),
    cv_data_id: tag,
  };

  return {
    tag,
    collection: 'subnational_jurisdictions',
    writeMode: 'direct',
    meta: {
      chosen_date: latest.date,
      raw_value: latest.value,
      population_display: populationDisplay,
      total_matched_rows: rows.length,
    },
    payload,
  };
}

/** CV-DATA-002: Statistics Canada unemployment (Table 14-10-0287-01) */
async function runUnemployment() {
  const tag = 'CV-DATA-002';
  log(tag, 'Fetching Statistics Canada Table 14-10-0287-01 (unemployment)…');

  const data = await caOn.buildEconomic();
  if (!data || !data.unemployment_latest_rate) {
    throw new Error('buildEconomic() returned no unemployment_latest_rate');
  }

  const payload = {
    ...data,
    cv_data_id: tag,
    unemployment_verification_status: verificationId(tag),
  };
  delete payload.jurisdiction_id;
  delete payload.data_status;

  const seriesCount = (payload.unemployment_series_monthly || []).length;
  log(tag, `Latest rate: ${payload.unemployment_latest_rate}% (${payload.unemployment_latest_period}), ${seriesCount} monthly points`);

  return {
    tag,
    collection: 'subnational_economic_social_stats',
    writeMode: 'direct',
    meta: {
      latest_rate: payload.unemployment_latest_rate,
      latest_period: payload.unemployment_latest_period,
      monthly_points: seriesCount,
    },
    payload,
  };
}

/** CV-DATA-008: CRA Charities (open.canada.ca) */
async function runCharities() {
  const tag = 'CV-DATA-008';
  log(tag, 'Fetching CRA Charities (ident_updated.csv)…');

  const data = await caOn.buildTax();
  if (!hasTaxPayload(data)) throw new Error('buildTax() returned no tax payload');

  // Enforce MVP: no dollar values
  if (data.records) data.records = data.records.map((r) => ({ ...r, rawValue: 0 }));

  const payload = {
    ...data,
    cv_data_id: tag,
    verification_status: verificationId(tag),
    licence_note: 'Open Government Licence — Canada (OGL-Canada). Source: Canada Revenue Agency Charities Directorate.',
  };
  delete payload.jurisdiction_id;

  log(tag, `Records: ${data.records_stored} (Ontario), total in source: ${data.total_in_source}`);

  return {
    tag,
    collection: 'subnational_tax_exempt_entities',
    writeMode: 'tax',
    meta: {
      records_stored: data.records_stored,
      total_in_source: data.total_in_source,
    },
    payload,
  };
}

/** CV-DATA-013: Ontario Public Accounts — Statement of operations (auto-discover latest FY) */
async function runBudget() {
  const tag = 'CV-DATA-013';
  log(tag, 'Discovering latest Statement of operations from data.ontario.ca…');

  // Auto-discover latest English Statement of operations CSV via CKAN
  let csvUrl = null;
  let discoveredFy = null;
  try {
    const pkg = await fetchJson(BUDGET_CKAN_PKG_URL);
    const resources = pkg?.result?.resources || [];
    // Find Statement of operations resources (English CSVs)
    const stmtRes = resources.filter(
      (r) =>
        /statement.of.operations/i.test(trim(r.name) + ' ' + trim(r.url)) &&
        trim(r.format).toUpperCase() === 'CSV' &&
        /en[-_]fr|english/i.test(trim(r.name) + ' ' + trim(r.url)),
    );
    // Sort by name desc to pick most recent fiscal year
    stmtRes.sort((a, b) => trim(b.name).localeCompare(trim(a.name)));
    if (stmtRes[0]) {
      csvUrl = trim(stmtRes[0].url);
      // Extract FY from URL (e.g. "...-2024-25-en-fr.csv") — url is more reliable than name
      // Use negative lookahead to avoid matching "2024-20" from "2024-2025"
      const fyMatch = trim(stmtRes[0].url).match(/(\d{4}-\d{2})(?!\d)/);
      discoveredFy = fyMatch ? fyMatch[1] : null;
    }
  } catch (err) {
    log(tag, `CKAN discovery failed: ${err.message} — falling back to cached CSV if available`);
  }

  // Fall back to known FY 2024-25 cache if CKAN discovery fails or returns no URL
  const localCache = path.join(TMP_DIR, 'statement-of-operations-2024-25.csv');
  let csvText;

  if (csvUrl) {
    log(tag, `Discovered CSV: ${csvUrl} (FY ${discoveredFy || 'unknown'})`);
    try {
      csvText = await fetchText(csvUrl, 5 * 1024 * 1024);
      log(tag, `Fetched CSV (${Math.round(csvText.length / 1024)} KB)`);
    } catch (err) {
      if (err.message.includes('429') && fs.existsSync(localCache)) {
        log(tag, `Rate limited (429) — using cached CSV: ${localCache}`);
        csvText = fs.readFileSync(localCache, 'utf8');
      } else {
        throw new Error(`Failed to fetch budget CSV: ${err.message}`);
      }
    }
  } else if (fs.existsSync(localCache)) {
    log(tag, `CKAN discovery returned no URL — using cached CSV: ${localCache}`);
    csvText = fs.readFileSync(localCache, 'utf8');
    discoveredFy = '2024-25';
  } else {
    throw new Error('No budget CSV URL from CKAN and no local cache. Mark BLOCKED.');
  }

  // Detect the actual FY from the CSV Year column — more reliable than parsing the CKAN URL.
  // The CSV has rows like: "2024-25","123,456","Expense","...","Health"
  // We find all unique year values and pick the most recent (lexicographic desc sort).
  function detectFyFromCsv(text) {
    const cleanText = text.replace(/^﻿/, '');
    const lines = cleanText.split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) return null;
    function splitLine(line) {
      const out = [];
      let field = '';
      let inQ = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') { inQ = !inQ; continue; }
        if (ch === ',' && !inQ) { out.push(field.trim()); field = ''; continue; }
        field += ch;
      }
      out.push(field.trim());
      return out;
    }
    const header = splitLine(lines[0]).map((h) => h.replace(/^﻿/, '').trim());
    const yearIdx = header.findIndex((h) => h.toLowerCase().includes('year'));
    if (yearIdx < 0) return null;
    const years = new Set();
    for (let i = 1; i < Math.min(lines.length, 200); i++) {
      const cols = splitLine(lines[i]);
      const y = (cols[yearIdx] || '').trim();
      if (/^\d{4}-\d{2}$/.test(y)) years.add(y);
    }
    if (!years.size) return null;
    return [...years].sort().reverse()[0]; // most recent
  }

  const targetFy = detectFyFromCsv(csvText) || discoveredFy || '2024-25';
  log(tag, `Using FY: ${targetFy}`);
  const expenseRows = parseBudgetCsv(csvText, targetFy, 'Expense');

  if (!expenseRows.length) {
    throw new Error(`No Expense rows for FY "${targetFy}" in budget CSV`);
  }

  const total = expenseRows.reduce((s, r) => s + r.amount, 0);
  expenseRows.sort((a, b) => b.amount - a.amount);

  const budgetDistribution = expenseRows.map((r, i) => ({
    name: r.detail,
    value: Math.round((r.amount / total) * 1000) / 10,
    color: COLOURS[i % COLOURS.length],
  }));

  log(tag, `FY ${targetFy}: ${expenseRows.length} expense categories, total $${Math.round(total).toLocaleString('en-CA')}M`);

  const payload = {
    budget_distribution: budgetDistribution,
    budget_reporting_period: `FY ${targetFy}`,
    budget_distribution_source:
      `Ontario Public Accounts: Statement of operations, FY ${targetFy} actual expenses. ` +
      'Source: Treasury Board Secretariat. This is actual spending by sector, not an approved budget plan.',
    budget_distribution_url: BUDGET_SOURCE_URL,
    budget_distribution_fetched_date: RUN_AT_ISO,
    budget_distribution_transformation_note:
      `Filtered to Expense rows for year "${targetFy}". ` +
      `${expenseRows.length} sector categories (total $${Math.round(total).toLocaleString('en-CA')}M). ` +
      `Expressed as % of total actual expenses, rounded to 1 decimal place. Actuals — not the Ontario Budget plan.`,
    budget_verification_status: verificationId(tag),
    cv_data_id: tag,
  };

  return {
    tag,
    collection: 'subnational_economic_social_stats',
    writeMode: 'direct',
    meta: {
      fiscal_year: targetFy,
      expense_categories: expenseRows.length,
      total_expenses_millions: Math.round(total),
      csv_url: csvUrl || localCache,
    },
    payload,
  };
}

/** CV-DATA-014: Ontario Transfer Payments (with enforced purpose filter) */
async function runGrants() {
  const tag = 'CV-DATA-014';
  log(tag, 'Fetching Ontario transfer payments (Detailed Schedule of Payments)…');

  const data = await caOn.buildGrants();

  if (!data.purpose_filter_applied) {
    throw new Error('buildGrants() purpose filter not applied — Payment Detail column missing. Mark BLOCKED.');
  }

  if (!data.records || data.records.length === 0) {
    throw new Error('buildGrants() returned zero records after purpose filter — no write.');
  }

  log(tag, `Records: ${data.records.length} (after purpose filter), total in filtered pool: ${data.total_after_filter}`);

  const payload = {
    ...data,
    cv_data_id: tag,
    verification_status: verificationId(tag),
  };
  delete payload.jurisdiction_id;

  return {
    tag,
    collection: 'subnational_grants',
    writeMode: 'grants',
    meta: {
      records_stored: data.records.length,
      total_after_filter: data.total_after_filter,
      fiscal_year: data.fiscal_year,
      purpose_filter_applied: data.purpose_filter_applied,
      approved_purposes: data.approved_purposes,
    },
    payload,
  };
}

// ─── Write helpers ────────────────────────────────────────────────────────────

async function writeDataset(db, result) {
  const { tag, collection, writeMode, payload } = result;

  if (writeMode === 'direct') {
    // Direct merge — used for population and economic fields
    const ref = db.collection(collection).doc(JURISDICTION);
    // Guard: skip if all values are null/empty
    const nonNullValues = Object.values(payload).filter((v) => v != null && v !== '');
    if (!nonNullValues.length) throw new Error('All payload values are null/empty — write skipped');
    await ref.set(payload, { merge: true });
    return { written: true, firestore_path: `${collection}/${JURISDICTION}` };
  }

  // mergeTransparencyDoc — used for tax, grants
  const wr = await mergeTransparencyDoc(db, collection, JURISDICTION, payload, writeMode);
  if (!wr.written) throw new Error(`mergeTransparencyDoc returned written=false: ${wr.reason}`);
  return { written: true, firestore_path: `${collection}/${JURISDICTION}` };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const ALL_DATASETS = [
  { id: 'CV-DATA-001', fn: runPopulation },
  { id: 'CV-DATA-002', fn: runUnemployment },
  { id: 'CV-DATA-008', fn: runCharities },
  { id: 'CV-DATA-013', fn: runBudget },
  { id: 'CV-DATA-014', fn: runGrants },
];

async function main() {
  tryLoadDotenv();
  const { write, only } = parseArgs(process.argv.slice(2));

  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║  Civic Voice — Canadian MVP monthly data runner              ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log(`Mode:      ${write ? 'WRITE (merge to Firestore)' : 'DRY-RUN (no Firestore writes)'}`);
  console.log(`Run at:    ${RUN_AT_ISO}`);
  console.log(`Firebase:  ${describeCredentialSource()}`);
  if (only) console.log(`Only:      ${[...only].join(', ')}`);
  console.log('');

  fs.mkdirSync(REPORTS_DIR, { recursive: true });
  fs.mkdirSync(TMP_DIR, { recursive: true });

  // Initialise Firestore once — shared across all dataset writes; terminated after the loop.
  const db = write ? tryGetFirestore() : null;
  if (write && !db) {
    console.error('[runner] FATAL: Firestore credentials not available.');
    process.exit(1);
  }

  const targets = only
    ? ALL_DATASETS.filter((d) => only.has(d.id))
    : ALL_DATASETS;

  const datasetResults = [];

  for (const { id, fn } of targets) {
    console.log(`\n── ${id} ${'─'.repeat(50 - id.length)}`);
    const ds = { id, status: 'UNKNOWN', meta: {}, error: null };
    try {
      const result = await fn();
      ds.status = 'READY';
      ds.meta = result.meta;
      ds.collection = result.collection;
      ds.payload_keys = Object.keys(result.payload);
      ds.verification_id = verificationId(id);

      if (write) {
        if (!db) throw new Error('Firestore credentials not available');
        const wr = await writeDataset(db, result);
        ds.status = 'WRITTEN';
        ds.firestore_path = wr.firestore_path;
        log(id, `Written → ${wr.firestore_path}`);
      } else {
        ds.status = 'DRY-RUN';
        ds.firestore_path = `${result.collection}/${JURISDICTION}`;
        log(id, `Dry-run — would write to ${result.collection}/${JURISDICTION}`);
        log(id, `Payload keys: ${Object.keys(result.payload).join(', ')}`);
      }
    } catch (err) {
      ds.status = 'BLOCKED';
      ds.error = err.message;
      log(id, `BLOCKED: ${err.message}`);
    }
    datasetResults.push(ds);
  }

  // ── Summary ────────────────────────────────────────────────────────────────

  console.log('\n\n══════════════════════════════════════════════════════════════════');
  console.log('  RUN SUMMARY');
  console.log('══════════════════════════════════════════════════════════════════');
  console.log(`  Mode:           ${write ? 'WRITE' : 'DRY-RUN'}`);
  console.log(`  Run at:         ${RUN_AT_ISO}`);
  console.log(`  Grants filter:  ${datasetResults.find((d) => d.id === 'CV-DATA-014')?.meta?.purpose_filter_applied === true ? 'ENFORCED' : 'N/A (not included or blocked)'}`);
  console.log(`  Firestore:      ${write ? 'WRITES OCCURRED' : 'NO WRITES (dry-run)'}`);
  console.log('');
  console.log('  Dataset          Status        Firestore path');
  console.log('  ─────────────────────────────────────────────────────────────');
  for (const ds of datasetResults) {
    const status = ds.status.padEnd(12);
    const fp = ds.firestore_path || '—';
    console.log(`  ${ds.id.padEnd(16)} ${status}  ${fp}`);
    if (ds.error) console.log(`    ERROR: ${ds.error}`);
  }
  console.log('');

  const blockedCount = datasetResults.filter((d) => d.status === 'BLOCKED').length;
  const writtenCount = datasetResults.filter((d) => d.status === 'WRITTEN').length;
  const dryRunCount = datasetResults.filter((d) => d.status === 'DRY-RUN').length;

  console.log(`  Completed: ${writtenCount + dryRunCount}  Blocked: ${blockedCount}`);

  // ── Report ─────────────────────────────────────────────────────────────────

  const report = {
    run_at: RUN_AT_ISO,
    mode: write ? 'write' : 'dry-run',
    jurisdiction: JURISDICTION,
    datasets_requested: targets.map((d) => d.id),
    grants_purpose_filter: datasetResults.find((d) => d.id === 'CV-DATA-014')?.meta?.purpose_filter_applied ?? null,
    firestore_writes_occurred: write && writtenCount > 0,
    summary: {
      total: datasetResults.length,
      written: writtenCount,
      dry_run: dryRunCount,
      blocked: blockedCount,
    },
    datasets: datasetResults,
  };

  const reportPath = path.join(REPORTS_DIR, `canada-monthly-runner-${RUN_STAMP}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
  console.log(`\n  Report: ${reportPath}`);

  if (db) await db.terminate();

  if (blockedCount > 0) {
    console.log('\n  WARNING: Some datasets were blocked — review errors above before writing.');
  }
  if (!write) {
    console.log('\n  This was a dry-run. To write to Firestore: add --write');
    console.log('  Await user approval before running with --write.');
  }
  console.log('');
}

main().catch((err) => {
  console.error('[runner] FATAL:', err);
  process.exit(1);
});
