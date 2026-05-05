/**
 * Read-only audit: Firestore `executive_actions` (project civic-voice-5ea94).
 *
 *   $env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\service-account.json"
 *   npm run audit:executive-actions
 *
 * No keys in repo — uses Application Default Credentials from the JSON path only.
 */

const admin = require('firebase-admin');

const PROJECT_ID = 'civic-voice-5ea94';
const COLLECTION = 'executive_actions';

const frUrlRe = /federalregister\.gov/i;

function initAdmin() {
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.error(
      '[audit] Set GOOGLE_APPLICATION_CREDENTIALS to the path of your service account JSON file.',
    );
    process.exit(1);
  }
  if (admin.apps.length) return;
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: PROJECT_ID,
  });
}

function normStr(v) {
  return v == null ? '' : String(v).trim();
}

function getSubtypeFields(data) {
  return {
    presidential_document_type: data.presidential_document_type,
    presidentialDocumentType: data.presidentialDocumentType,
  };
}

function subtypeIsExecutiveOrder(data) {
  const raw =
    data.presidential_document_type ??
    data.presidentialDocumentType ??
    data.presidential_document_type_slug;
  if (raw == null) return false;
  const s = String(raw).trim().toLowerCase().replace(/-/g, '_');
  return s === 'executive_order';
}

function typeContainsExecutiveOrder(data) {
  const t = normStr(data.type);
  return /executive\s*order/i.test(t);
}

function idContainsEo(docId) {
  return /eo/i.test(docId);
}

function sourceUrlLooksLikeFr(data) {
  const u = normStr(data.source_url || data.sourceUrl);
  return frUrlRe.test(u);
}

function isProclamationLike(data) {
  const t = normStr(data.type).toLowerCase();
  if (t.includes('proclamation')) return true;
  const sub = normStr(
    data.presidential_document_type || data.presidentialDocumentType || '',
  ).toLowerCase();
  return sub.includes('proclamation') || sub === 'proclamation';
}

function pickSampleFields(id, data) {
  return {
    id,
    type: data.type ?? null,
    title: data.title ?? null,
    date: data.date ?? null,
    member_name: data.member_name ?? null,
    politician_slug: data.politician_slug ?? null,
    source_name: data.source_name ?? data.sourceName ?? null,
    source_url: data.source_url ?? data.sourceUrl ?? null,
    ...getSubtypeFields(data),
  };
}

function printDocBlock(label, rows) {
  console.log(`\n--- ${label} ---`);
  if (!rows.length) {
    console.log('(none)');
    return;
  }
  rows.forEach((row, i) => {
    console.log(`\n[${i + 1}] ${JSON.stringify(row, null, 2)}`);
  });
}

/**
 * @returns {Promise<{ id: string, data: object }[]>}
 */
async function loadMatchingDocuments(db) {
  try {
    const snap = await db
      .collection(COLLECTION)
      .where('jurisdiction', '==', 'US')
      .where('source_name', '==', 'Federal Register')
      .get();
    const out = [];
    snap.forEach((doc) => out.push({ id: doc.id, data: doc.data() || {} }));
    return out;
  } catch (err) {
    console.warn(
      '[audit] Compound query failed (index may be missing). Falling back: jurisdiction == US, then in-memory filter for source_name.',
    );
    console.warn('[audit] Error was:', err.message);
    const snap = await db.collection(COLLECTION).where('jurisdiction', '==', 'US').get();
    const out = [];
    snap.forEach((doc) => {
      const data = doc.data() || {};
      const sn = normStr(data.source_name || data.sourceName);
      if (sn === 'Federal Register') out.push({ id: doc.id, data });
    });
    return out;
  }
}

async function main() {
  console.log(`[audit] Project: ${PROJECT_ID}`);
  console.log(`[audit] Collection: ${COLLECTION}`);
  console.log(`[audit] Filter: jurisdiction == "US" AND source_name == "Federal Register"`);
  console.log('[audit] Read-only (no writes).\n');

  initAdmin();
  const db = admin.firestore();

  const docs = await loadMatchingDocuments(db);
  console.log(`Total documents matching filter: ${docs.length}\n`);

  function typeKeyFromData(data) {
    return data.type == null || normStr(data.type) === ''
      ? '(missing or empty type)'
      : normStr(data.type);
  }

  /** @type {Map<string, number>} */
  const typeCounts = new Map();
  /** @type {Map<string, string[]>} */
  const typeToSampleIds = new Map();
  for (const { id, data } of docs) {
    const key = typeKeyFromData(data);
    typeCounts.set(key, (typeCounts.get(key) || 0) + 1);
    if (!typeToSampleIds.has(key)) typeToSampleIds.set(key, []);
    const arr = typeToSampleIds.get(key);
    if (arr.length < 8) arr.push(id);
  }

  const distinctTypes = [...typeCounts.entries()].sort((a, b) => b[1] - a[1]);
  console.log('=== Distinct `type` values (counts) ===');
  for (const [t, count] of distinctTypes) {
    console.log(`  ${count}\t${JSON.stringify(t)}`);
  }

  console.log('\n=== Sample document IDs per `type` (up to 8 each) ===');
  for (const [t] of distinctTypes) {
    const ids = typeToSampleIds.get(t) || [];
    console.log(`\n  ${JSON.stringify(t)}:`);
    ids.forEach((id) => console.log(`    - ${id}`));
  }

  let nTypeEo = 0;
  let nIdEo = 0;
  let nUrlFr = 0;
  let nSubtypeEo = 0;
  const eoByHeuristic = { type: [], id: [], url: [], subtype: [] };

  for (const { id, data } of docs) {
    if (typeContainsExecutiveOrder(data)) {
      nTypeEo++;
      if (eoByHeuristic.type.length < 10) eoByHeuristic.type.push(id);
    }
    if (idContainsEo(id)) {
      nIdEo++;
      if (eoByHeuristic.id.length < 10) eoByHeuristic.id.push(id);
    }
    if (sourceUrlLooksLikeFr(data)) {
      nUrlFr++;
      if (eoByHeuristic.url.length < 10) eoByHeuristic.url.push(id);
    }
    if (subtypeIsExecutiveOrder(data)) {
      nSubtypeEo++;
      if (eoByHeuristic.subtype.length < 10) eoByHeuristic.subtype.push(id);
    }
  }

  console.log('\n=== Executive Order detection (among filtered docs) ===');
  console.log(`  type contains "Executive Order" (regex):     ${nTypeEo} docs`);
  console.log(`  document ID contains "eo" (case-insensitive): ${nIdEo} docs`);
  console.log(`  source_url matches federalregister.gov:       ${nUrlFr} docs`);
  console.log(`  presidential_* field == executive_order:    ${nSubtypeEo} docs`);
  console.log('  (sample IDs per heuristic — first 10):');
  console.log('    type:   ', eoByHeuristic.type.join(', ') || '—');
  console.log('    id eo:  ', eoByHeuristic.id.join(', ') || '—');
  console.log('    url FR: ', eoByHeuristic.url.join(', ') || '—');
  console.log('    subtype:', eoByHeuristic.subtype.join(', ') || '—');

  const eoSamples = docs
    .filter(
      ({ id, data }) =>
        typeContainsExecutiveOrder(data) ||
        subtypeIsExecutiveOrder(data) ||
        (idContainsEo(id) && sourceUrlLooksLikeFr(data)),
    )
    .slice(0, 5)
    .map(({ id, data }) => pickSampleFields(id, data));

  const procSamples = docs
    .filter(({ data }) => isProclamationLike(data))
    .slice(0, 5)
    .map(({ id, data }) => pickSampleFields(id, data));

  printDocBlock('5 sample Executive Order–related rows (fields for app filtering)', eoSamples);
  printDocBlock('5 sample Proclamation rows (should be excluded from EO screen)', procSamples);

  console.log('\n=== Notes ===');
  console.log(
    '- Use distinct `type` and subtype fields above to tune `executiveOrderDocumentTypes.js` and App filters.',
  );
  console.log('- This script does not write to Firestore.\n');
}

main().catch((err) => {
  console.error('[audit] Fatal:', err);
  process.exit(1);
});
