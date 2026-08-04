'use strict';

/**
 * CV-DATA-001 — Statistics Canada population write.
 * Scope: Ontario population only. No unemployment. No charities. No grants. No UI.
 * Source: Stats Can Table 17-10-0005-01 (Population estimates on July 1st, by age and sex)
 * Target: subnational_jurisdictions/CA-ON — population_display and related fields only.
 * Write: merge only — no unrelated CA-ON fields touched.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const zlib = require('zlib');
const { createWriteStream, existsSync, mkdirSync } = require('fs');

const { tryGetFirestore, describeCredentialSource } = require('./firebase-admin-init.cjs');

const REPORTS_DIR = path.join(__dirname, 'reports');
const WRITE_AT = new Date().toISOString();
const COLLECTION = 'subnational_jurisdictions';
const JURISDICTION = 'CA-ON';
const CV_DATA_ID = 'CV-DATA-001';

// Stats Can Table 17-10-0005-01 — Population estimates on July 1st, by age and sex
const STATSCAN_TABLE_ID = '17-10-0005-01';
const STATSCAN_TABLE_DOI = 'https://doi.org/10.25318/1710000501-eng';
const STATSCAN_CSV_URL =
  'https://www150.statcan.gc.ca/n1/tbl/csv/17100005-eng.zip';

// Row filter criteria
const TARGET_GEO = 'Ontario';
// CSV column was renamed from "Sex"/"Both sexes" to "Gender"/"Total - gender" in 2025 release
const TARGET_SEX = 'Total - gender';
const TARGET_AGE = 'All ages';
// Prefer July 1 2024; fall back to most recent July 1 available
const PREFERRED_DATE = '2024-07-01';

function formatPopulationDisplay(n) {
  if (n >= 1_000_000) {
    return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  return n.toLocaleString('en-CA');
}

function downloadZip(url, destPath) {
  return new Promise((resolve, reject) => {
    console.log(`[cv-data-001] Downloading: ${url}`);
    const file = createWriteStream(destPath);
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} from ${url}`));
        return;
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', reject);
  });
}

function unzipBuffer(zipPath) {
  return new Promise((resolve, reject) => {
    const AdmZip = (() => {
      try { return require('adm-zip'); } catch { return null; }
    })();
    if (AdmZip) {
      const zip = new AdmZip(zipPath);
      const entries = zip.getEntries().filter(e => e.entryName.endsWith('.csv') && !e.entryName.includes('MetaData'));
      if (entries.length === 0) { reject(new Error('No data CSV in zip')); return; }
      resolve(entries[0].getData().toString('utf8').replace(/^﻿/, ''));
      return;
    }
    // fallback: use zlib on raw zip (won't work for zip, only gz)
    reject(new Error('adm-zip not available — install it or use alternative extraction'));
  });
}

function parseStatsCsv(csvText) {
  const lines = csvText.split('\n');
  if (lines.length < 2) throw new Error('CSV has no data rows');

  // Parse header
  const header = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').trim());
  const idx = (name) => header.findIndex(h => h.toLowerCase() === name.toLowerCase());

  const geoIdx = idx('GEO');
  const dateIdx = idx('REF_DATE');
  const sexIdx = idx('Gender');
  const ageIdx = idx('Age group');
  const valIdx = idx('VALUE');

  if ([geoIdx, dateIdx, sexIdx, ageIdx, valIdx].includes(-1)) {
    throw new Error(`Missing expected columns. Found: ${header.join(', ')}`);
  }

  const matched = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    // Simple CSV split — fields may be quoted
    const cols = line.match(/(".*?"|[^,]+|(?<=,)(?=,)|(?<=,)$|^(?=,))/g) || line.split(',');
    const clean = cols.map(c => (c || '').replace(/^"|"$/g, '').trim());

    const geo = clean[geoIdx] || '';
    const sex = clean[sexIdx] || '';
    const age = clean[ageIdx] || '';
    const val = clean[valIdx] || '';
    const date = clean[dateIdx] || '';

    if (
      geo === TARGET_GEO &&
      sex === TARGET_SEX &&
      age === TARGET_AGE &&
      val !== '' && val !== '..'
    ) {
      const n = parseInt(val.replace(/,/g, ''), 10);
      if (!isNaN(n) && n > 1_000_000) {
        matched.push({ date, value: n });
      }
    }
  }

  return matched;
}

async function main() {
  console.log(`[cv-data-001] CV-DATA-001 — Statistics Canada population write`);
  console.log(`[cv-data-001] Started: ${WRITE_AT}`);
  console.log(`[cv-data-001] Scope: subnational_jurisdictions/CA-ON — population fields only`);

  if (!existsSync(REPORTS_DIR)) mkdirSync(REPORTS_DIR, { recursive: true });

  // ── Step 1: Download zip ──────────────────────────────────────────────────
  const tmpDir = path.join(REPORTS_DIR, '_tmp');
  if (!existsSync(tmpDir)) mkdirSync(tmpDir, { recursive: true });
  const zipPath = path.join(tmpDir, '17100005-eng.zip');

  await downloadZip(STATSCAN_CSV_URL, zipPath);
  console.log(`[cv-data-001] Downloaded zip: ${zipPath}`);

  // ── Step 2: Extract CSV ───────────────────────────────────────────────────
  let csvText;
  try {
    csvText = await unzipBuffer(zipPath);
    console.log(`[cv-data-001] Extracted CSV (${Math.round(csvText.length / 1024)} KB)`);
  } catch (err) {
    // Try system extraction as fallback
    console.log(`[cv-data-001] adm-zip unavailable (${err.message}), trying system extraction...`);
    const { execSync } = require('child_process');
    try {
      // Git Bash unzip (available on Windows with Git for Windows)
      execSync(`"C:/Program Files/Git/usr/bin/unzip.exe" -o "${zipPath}" -d "${tmpDir}"`, { stdio: 'pipe' });
    } catch {
      // PowerShell Expand-Archive fallback
      execSync(`powershell -Command "Expand-Archive -Force -Path '${zipPath}' -DestinationPath '${tmpDir}'"`, { stdio: 'pipe' });
    }
    const csvFiles = fs.readdirSync(tmpDir).filter(f => f.endsWith('.csv') && !f.includes('MetaData'));
    if (csvFiles.length === 0) throw new Error('No data CSV found after system unzip');
    csvText = fs.readFileSync(path.join(tmpDir, csvFiles[0]), 'utf8').replace(/^﻿/, '');
    console.log(`[cv-data-001] Extracted: ${csvFiles[0]}`);
  }

  // ── Step 3: Parse and filter ──────────────────────────────────────────────
  const rows = parseStatsCsv(csvText);
  if (rows.length === 0) {
    throw new Error(`No Ontario/Both sexes/All ages rows found in CSV. Check column names or filter values.`);
  }

  console.log(`[cv-data-001] Matched ${rows.length} Ontario population rows`);

  // Prefer 2024-07-01; fall back to most recent
  rows.sort((a, b) => b.date.localeCompare(a.date));
  const preferred = rows.find(r => r.date === PREFERRED_DATE);
  const chosen = preferred || rows[0];

  console.log(`[cv-data-001] Chosen: ${chosen.date} — ${chosen.value.toLocaleString('en-CA')} persons`);

  const populationDisplay = formatPopulationDisplay(chosen.value);
  const reportingPeriod = chosen.date;

  console.log(`[cv-data-001] population_display: "${populationDisplay}"`);

  // ── Step 4: Write to Firestore ────────────────────────────────────────────
  const db = tryGetFirestore();
  if (!db) {
    console.error('[cv-data-001] FATAL: Firebase credentials not found.');
    console.error('[cv-data-001] Credential source:', describeCredentialSource());
    process.exit(1);
  }

  const payload = {
    population_display: populationDisplay,
    population: chosen.value,
    population_source_url: STATSCAN_TABLE_DOI,
    population_reporting_period: reportingPeriod,
    population_source_note: `Statistics Canada. Table ${STATSCAN_TABLE_ID}. Population estimates on July 1st, by age and sex. Filter: GEO=Ontario, Sex=Both sexes, Age group=All ages.`,
    population_fetched_date: WRITE_AT,
    population_verification_status: `Fetched ${WRITE_AT.slice(0, 10)} from Stats Can Table ${STATSCAN_TABLE_ID}`,
    cv_data_id: CV_DATA_ID,
  };

  console.log('\n[cv-data-001] Fields to write (merge):');
  for (const [k, v] of Object.entries(payload)) {
    console.log(`  ${k.padEnd(34)} ${v}`);
  }

  const ref = db.collection(COLLECTION).doc(JURISDICTION);

  // Read existing doc first to confirm we are not the first writer
  const existing = await ref.get();
  if (!existing.exists) {
    console.warn('[cv-data-001] WARNING: subnational_jurisdictions/CA-ON does not exist yet. Merge write will create it with only population fields — other fields will be absent until a full jurisdiction write runs.');
  } else {
    const existingData = existing.data();
    console.log(`[cv-data-001] Existing doc fields: ${Object.keys(existingData).join(', ')}`);
  }

  await ref.set(payload, { merge: true });

  console.log(`\n[cv-data-001] ✓ Written to ${COLLECTION}/${JURISDICTION} (merge)`);
  console.log(`[cv-data-001] Fields written: ${Object.keys(payload).join(', ')}`);

  // ── Step 5: Write report ──────────────────────────────────────────────────
  const report = {
    cv_data_id: CV_DATA_ID,
    statscan_table_id: STATSCAN_TABLE_ID,
    statscan_table_doi: STATSCAN_TABLE_DOI,
    statscan_csv_url: STATSCAN_CSV_URL,
    filter: { GEO: TARGET_GEO, Sex: TARGET_SEX, 'Age group': TARGET_AGE },
    preferred_date: PREFERRED_DATE,
    chosen_date: chosen.date,
    raw_value: chosen.value,
    population_display: populationDisplay,
    firestore_collection: COLLECTION,
    firestore_doc: JURISDICTION,
    write_mode: 'merge',
    fields_written: Object.keys(payload),
    payload,
    all_matched_dates: rows.map(r => r.date),
    written_at: WRITE_AT,
  };

  const reportPath = path.join(REPORTS_DIR, 'cv-data-001-population-latest.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');

  console.log(`\n[cv-data-001] Report: ${reportPath}`);
  console.log('[cv-data-001] Done. No other datasets touched.');

  await db.terminate();
}

main().catch(err => {
  console.error('[cv-data-001] FATAL:', err);
  process.exit(1);
});
