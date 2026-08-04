'use strict';

/**
 * CV-DATA-013 — Ontario Budget (actual expense distribution) write.
 * Scope: budget_distribution only. No unemployment. No population. No charities. No grants. No UI.
 * Source: Ontario Public Accounts: Statement of operations, FY 2024-25
 * Data type: ACTUAL expenses — not an approved budget plan.
 * Target: subnational_economic_social_stats/CA-ON — budget fields only, merge write.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const { tryGetFirestore } = require('./firebase-admin-init.cjs');

const REPORTS_DIR = path.join(__dirname, 'reports');
const WRITE_AT = new Date().toISOString();
const COLLECTION = 'subnational_economic_social_stats';
const JURISDICTION = 'CA-ON';
const CV_DATA_ID = 'CV-DATA-013';

const SOURCE_URL = 'https://data.ontario.ca/dataset/public-accounts-annual-report';
const CSV_URL =
  'https://data.ontario.ca/dataset/48c75909-67a0-4348-98cd-bf880a361882/resource/' +
  'f3017a27-bf52-48b9-b186-3121e06c6272/download/' +
  'tbs-public-accounts-annual-report-statement-of-operations-2024-25-en-fr.csv';

const TARGET_YEAR = '2024-25';
const TARGET_TYPE = 'Expense'; // exclude Revenue and Annual Surplus/(Deficit)

// Colour palette for budget_distribution chart bars (7 categories max)
const COLOURS = [
  '#6366f1', '#10b981', '#f59e0b', '#ef4444',
  '#3b82f6', '#8b5cf6', '#14b8a6',
];

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} from ${url}`));
        return;
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    }).on('error', reject);
  });
}

function parseCsv(text) {
  // Strip BOM
  const clean = text.replace(/^﻿/, '');
  const lines = clean.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) throw new Error('CSV has no data rows');

  // Header: Year/Année, Amount/Montant, Revenue/Expense/Deficit, [FR], Revenue/Expense/Deficit detail, [FR]
  // Simple split — no embedded commas in these fields except Amount which is quoted
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

  const header = splitLine(lines[0]).map(h => h.replace(/^﻿/, '').trim());

  // Column indices by fuzzy match
  const idx = (fragment) =>
    header.findIndex(h => h.toLowerCase().includes(fragment.toLowerCase()));

  const yearIdx = idx('year');
  const amtIdx  = idx('amount');
  const typeIdx = idx('revenue/expense/deficit');
  // "Revenue/Expense/Deficit detail" is the 5th column (English detail)
  // There are two columns containing "revenue/expense/deficit" — pick the 5th (index 4)
  const detailIdx = header.findIndex((h, i) =>
    h.toLowerCase().includes('revenue/expense/deficit') && i > typeIdx
  );

  if ([yearIdx, amtIdx, typeIdx, detailIdx].includes(-1)) {
    throw new Error(`Missing columns. Header: ${header.join(' | ')}`);
  }

  console.log(`[cv-data-013] Column mapping: year=${yearIdx} amount=${amtIdx} type=${typeIdx} detail=${detailIdx}`);

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = splitLine(lines[i]);
    if (cols.length < 4) continue;
    const year   = (cols[yearIdx] || '').trim();
    const type   = (cols[typeIdx] || '').trim();
    const detail = (cols[detailIdx] || '').trim();
    const rawAmt = (cols[amtIdx] || '').replace(/,/g, '').trim();
    const amount = parseFloat(rawAmt);

    if (year !== TARGET_YEAR) continue;
    if (!type.toLowerCase().startsWith(TARGET_TYPE.toLowerCase())) continue;
    if (!detail || isNaN(amount)) continue;

    rows.push({ detail, amount });
  }

  return rows;
}

async function main() {
  console.log(`[cv-data-013] CV-DATA-013 — Ontario Budget actual expense distribution`);
  console.log(`[cv-data-013] Started: ${WRITE_AT}`);
  console.log(`[cv-data-013] Source: Public Accounts Statement of operations FY 2024-25`);
  console.log(`[cv-data-013] DATA TYPE: actual expenses — NOT an approved budget plan`);

  if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });

  // ── Step 1: Fetch CSV (use local cache if present to avoid rate limiting) ─
  const localCache = path.join(REPORTS_DIR, '_tmp', 'statement-of-operations-2024-25.csv');
  let csvText;
  if (fs.existsSync(localCache)) {
    csvText = fs.readFileSync(localCache, 'utf8');
    console.log(`[cv-data-013] Using cached CSV: ${localCache}`);
  } else {
    console.log(`[cv-data-013] Fetching: ${CSV_URL}`);
    csvText = await fetchText(CSV_URL);
    fs.mkdirSync(path.dirname(localCache), { recursive: true });
    fs.writeFileSync(localCache, csvText, 'utf8');
    console.log(`[cv-data-013] Fetched and cached ${Math.round(csvText.length / 1024)} KB`);
  }

  // ── Step 2: Parse and filter ──────────────────────────────────────────────
  const expenseRows = parseCsv(csvText);

  if (expenseRows.length === 0) {
    throw new Error(`No Expense rows found for year "${TARGET_YEAR}". Check CSV structure.`);
  }

  console.log(`\n[cv-data-013] Expense rows for ${TARGET_YEAR}:`);
  for (const r of expenseRows) {
    console.log(`  ${String(r.amount.toLocaleString('en-CA') + 'M').padStart(12)}  ${r.detail}`);
  }

  // ── Step 3: Compute percentages ───────────────────────────────────────────
  const total = expenseRows.reduce((s, r) => s + r.amount, 0);
  console.log(`\n[cv-data-013] Total expenses: $${total.toLocaleString('en-CA')}M`);

  // Sort descending by amount for visual clarity
  expenseRows.sort((a, b) => b.amount - a.amount);

  const budgetDistribution = expenseRows.map((r, i) => ({
    name: r.detail,
    value: Math.round((r.amount / total) * 1000) / 10, // 1 d.p.
    color: COLOURS[i % COLOURS.length],
  }));

  console.log(`\n[cv-data-013] Budget distribution (% of total actual expenses):`);
  let pctSum = 0;
  for (const row of budgetDistribution) {
    pctSum += row.value;
    console.log(`  ${String(row.value + '%').padStart(7)}  ${row.name}`);
  }
  console.log(`  ${'─'.repeat(30)}`);
  console.log(`  ${String(pctSum.toFixed(1) + '%').padStart(7)}  TOTAL (rounding may cause minor variance from 100%)`);

  // ── Step 4: Write to Firestore ────────────────────────────────────────────
  const db = tryGetFirestore();
  if (!db) {
    console.error('[cv-data-013] FATAL: Firebase credentials not found.');
    process.exit(1);
  }

  const payload = {
    budget_distribution: budgetDistribution,
    budget_reporting_period: 'FY 2024-25',
    budget_distribution_source:
      'Ontario Public Accounts: Statement of operations, FY 2024-25 actual expenses. ' +
      'Source: Treasury Board Secretariat. This is actual spending by sector, not an approved budget plan.',
    budget_distribution_url: SOURCE_URL,
    budget_distribution_fetched_date: WRITE_AT,
    budget_distribution_transformation_note:
      `Filtered to Expense rows for year "${TARGET_YEAR}". ` +
      `Summed ${expenseRows.length} sector categories (total $${Math.round(total).toLocaleString('en-CA')}M). ` +
      `Each category expressed as % of total actual expenses, rounded to 1 decimal place. ` +
      `Data type: actuals from Public Accounts — not the Ontario Budget plan approved by legislature.`,
    budget_verification_status: `Fetched ${WRITE_AT.slice(0, 10)} from Ontario Public Accounts FY 2024-25 CSV`,
    cv_data_id: CV_DATA_ID,
  };

  console.log('\n[cv-data-013] Firestore fields to write (merge):');
  for (const [k, v] of Object.entries(payload)) {
    const display = Array.isArray(v) ? `[array, ${v.length} rows]` : String(v).slice(0, 100);
    console.log(`  ${k.padEnd(40)} ${display}`);
  }

  const ref = db.collection(COLLECTION).doc(JURISDICTION);
  const existing = await ref.get();
  if (existing.exists) {
    const keys = Object.keys(existing.data());
    console.log(`\n[cv-data-013] Existing doc fields (will not be overwritten): ${keys.join(', ')}`);
  } else {
    console.warn('[cv-data-013] WARNING: document does not exist yet — merge write will create it with budget fields only.');
  }

  await ref.set(payload, { merge: true });

  console.log(`\n[cv-data-013] ✓ Written to ${COLLECTION}/${JURISDICTION} (merge)`);
  console.log(`[cv-data-013] Fields written: ${Object.keys(payload).join(', ')}`);

  // ── Step 5: Write report ──────────────────────────────────────────────────
  const report = {
    cv_data_id: CV_DATA_ID,
    source_url: SOURCE_URL,
    csv_url: CSV_URL,
    reporting_period: TARGET_YEAR,
    data_type: 'actual expenses — NOT approved budget plan',
    total_expenses_millions: Math.round(total),
    category_count: expenseRows.length,
    budget_distribution: budgetDistribution,
    pct_sum: pctSum,
    firestore_collection: COLLECTION,
    firestore_doc: JURISDICTION,
    write_mode: 'merge',
    fields_written: Object.keys(payload),
    written_at: WRITE_AT,
    ui_warning:
      'EconomicModalMetricChart renders chartKey="budget" with title "Government Budget Distribution" and ' +
      'desc "Share of total budget per spending category (%)". The headline metric label in ' +
      'buildEconomicTransparencyHeadlines is hardcoded as "Approved Budget". ' +
      'These labels are technically imprecise for actual-spending data from Public Accounts. ' +
      'Post-MVP UI copy fix recommended: change headline to "Actual Spending Distribution" or similar.',
  };

  const reportPath = path.join(REPORTS_DIR, 'cv-data-013-budget-latest.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');

  console.log(`\n[cv-data-013] Report: ${reportPath}`);
  console.log('[cv-data-013] Done. No other datasets touched.');

  await db.terminate();
}

main().catch(err => {
  console.error('[cv-data-013] FATAL:', err);
  process.exit(1);
});
