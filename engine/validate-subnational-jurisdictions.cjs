/**
 * Read-only validation for Firestore `subnational_jurisdictions`.
 *
 * Uses same credentials as civic-voice-engine scheduler (.env with FIREBASE_* or GOOGLE_APPLICATION_CREDENTIALS).
 *
 *   cd civic-voice-engine && npm run validate:subnational-jurisdictions
 *
 * Writes: docs/SUBNATIONAL_JURISDICTIONS_SEED_VALIDATION_REPORT.md
 * No writes to Firestore.
 */

const fs = require('fs');
const path = require('path');
const { tryGetFirestore, describeCredentialSource, formatPlaceholderCredentialMessage } = require('./firebase-admin-init.cjs');

const PROJECT_ID = 'civic-voice-5ea94';
const COLLECTION = 'subnational_jurisdictions';
const REPORT_PATH = path.resolve(__dirname, '../docs/SUBNATIONAL_JURISDICTIONS_SEED_VALIDATION_REPORT.md');

const REQUIRED_FIELDS = [
  'id',
  'country',
  'countryName',
  'jurisdictionType',
  'name',
  'abbreviation',
  'slug',
  'aliases',
  'capital',
  'leaderTitle',
  'legislatureName',
  'officialWebsite',
  'source_name',
  'source_url',
  'last_updated',
  'dataStatus',
];

const EXPECTED_TOTAL = 85;
const EXPECTED_BY_COUNTRY = { US: 51, CA: 13, AU: 8, UK: 13 };

/** Doc IDs that must have non-empty aliases (per seed design). */
const ALIAS_EXPECT_NON_EMPTY = ['US-DC', 'CA-NL', 'CA-QC', 'UK-ENG-YOR'];

function validateDoc(id, data) {
  const issues = [];
  for (const field of REQUIRED_FIELDS) {
    if (!(field in data)) {
      issues.push(`missing field: ${field}`);
      continue;
    }
    if (field === 'aliases' && !Array.isArray(data.aliases)) {
      issues.push('aliases must be an array');
    }
  }
  return issues;
}

async function main() {
  const db = tryGetFirestore();
  if (!db) {
    const pm = formatPlaceholderCredentialMessage();
    console.error(
      '[validate] No Firebase credentials. Run from civic-voice-engine with scheduler .env, or set GOOGLE_APPLICATION_CREDENTIALS / FIREBASE_* vars.',
    );
    if (pm) console.error(`[validate] ${pm}`);
    process.exit(1);
  }
  console.log('[validate] Auth:', describeCredentialSource());

  const snap = await db.collection(COLLECTION).get();

  const docs = [];
  snap.forEach((d) => docs.push({ id: d.id, data: d.data() || {} }));

  const byCountry = {};
  const idDupCheck = new Map();
  const missingFieldsAll = [];
  const aliasIssues = [];

  for (const { id, data } of docs) {
    idDupCheck.set(id, (idDupCheck.get(id) || 0) + 1);
    const c = data.country || '(missing)';
    byCountry[c] = (byCountry[c] || 0) + 1;

    const problems = validateDoc(id, data);
    problems.forEach((p) => missingFieldsAll.push({ id, issue: p }));

    if (ALIAS_EXPECT_NON_EMPTY.includes(id)) {
      const a = data.aliases;
      if (!Array.isArray(a) || a.length === 0) {
        aliasIssues.push({ id, issue: 'expected non-empty aliases' });
      }
    }
  }

  const duplicateIds = [...idDupCheck.entries()].filter(([, n]) => n > 1).map(([id]) => id);

  const countsOk =
    docs.length === EXPECTED_TOTAL &&
    (byCountry.US || 0) === EXPECTED_BY_COUNTRY.US &&
    (byCountry.CA || 0) === EXPECTED_BY_COUNTRY.CA &&
    (byCountry.AU || 0) === EXPECTED_BY_COUNTRY.AU &&
    (byCountry.UK || 0) === EXPECTED_BY_COUNTRY.UK;

  const passed =
    countsOk &&
    duplicateIds.length === 0 &&
    missingFieldsAll.length === 0 &&
    aliasIssues.length === 0;

  const iso = new Date().toISOString();
  const md = [
    '# subnational_jurisdictions — seed validation report',
    '',
    `Generated: ${iso}`,
    `Project: \`${PROJECT_ID}\``,
    `Collection: \`${COLLECTION}\``,
    `Credential mode (hint): ${describeCredentialSource()}`,
    '',
    '## Summary',
    '',
    `- **Collection exists:** ${snap.empty ? 'no documents returned (empty or missing)' : 'yes (query returned docs)'}`,
    `- **Document count:** ${docs.length} (expected ${EXPECTED_TOTAL})`,
    `- **Counts match expected:** ${countsOk ? 'yes' : 'no'}`,
    `- **Duplicate IDs in Firestore:** ${duplicateIds.length ? duplicateIds.join(', ') : 'none'}`,
    `- **Required-field issues:** ${missingFieldsAll.length}`,
    `- **Alias expectations (US-DC, CA-NL, CA-QC, UK-ENG-YOR):** ${aliasIssues.length ? 'fail' : 'pass'}`,
    `- **Overall:** ${passed ? 'PASS' : 'FAIL'}`,
    '',
    '## Country breakdown',
    '',
    '```json',
    JSON.stringify(byCountry, null, 2),
    '```',
    '',
    'Expected: `US` 51, `CA` 13, `AU` 8, `UK` 13.',
    '',
    '## Required-field issues',
    '',
    missingFieldsAll.length
      ? missingFieldsAll.map((x) => `- \`${x.id}\`: ${x.issue}`).join('\n')
      : '(none)',
    '',
    '## Alias expectation issues',
    '',
    aliasIssues.length ? aliasIssues.map((x) => `- \`${x.id}\`: ${x.issue}`).join('\n') : '(none)',
    '',
    '## Sample document IDs (first 15)',
    '',
    docs
      .slice(0, 15)
      .map((d) => `- \`${d.id}\`: ${d.data.name || '(no name)'}`)
      .join('\n'),
    '',
    '## App / UI',
    '',
    '- This report validates Firestore reference data only.',
    '- No app UI migration is implied by this report.',
    '',
  ].join('\n');

  fs.writeFileSync(REPORT_PATH, md, 'utf8');
  console.log(`[validate] Report written: ${REPORT_PATH}`);
  console.log(`[validate] Documents: ${docs.length}, overall: ${passed ? 'PASS' : 'FAIL'}`);
  process.exit(passed ? 0 : 1);
}

main().catch((err) => {
  console.error('[validate] Fatal:', err);
  process.exit(1);
});
