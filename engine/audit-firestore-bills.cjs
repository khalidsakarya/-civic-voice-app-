/**
 * Read-only audit: Firestore `bills` collection (project civic-voice-5ea94).
 *
 *   $env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\service-account.json"
 *   npm run audit:firestore-bills
 *   npm run audit:firestore-bills -- --all-jurisdictions
 *
 * Summarizes counts, sample docs, distinct status/action-ish fields, and whether
 * documents look like signed/enacted laws (keyword scan). Does not write data.
 */

const admin = require('firebase-admin');

const PROJECT_ID = 'civic-voice-5ea94';
const COLLECTION = 'bills';

const KEYWORDS = [
  /signed\s+by\s+(the\s+)?president/i,
  /became\s+public\s+law/i,
  /became\s+law/i,
  /public\s+law\s+no\.?\s*\d/i,
  /\bpl\s*\d+\s*-\s*\d+/i,
  /\benacted\b/i,
];

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

function collectStrings(obj, depth = 0, out = []) {
  if (depth > 4 || obj == null) return out;
  if (typeof obj === 'string') {
    out.push(obj);
    return out;
  }
  if (typeof obj !== 'object') return out;
  if (Array.isArray(obj)) {
    obj.forEach((x) => collectStrings(x, depth + 1, out));
    return out;
  }
  for (const k of Object.keys(obj)) {
    collectStrings(obj[k], depth + 1, out);
  }
  return out;
}

function textBlob(data) {
  const priority = [
    data.status,
    data.latestAction,
    data.latest_action,
    data.latestActionText,
    data.latest_action_text,
    data.title,
    data.summary,
    data.plainLanguageSummary,
    data.plain_language_summary,
    data.sourceUrl,
    data.source_url,
    data.sourceId,
    data.source_id,
    data.lawStatusLabel,
    data.publicLawNumber,
    data.public_law_number,
  ]
    .map(normStr)
    .filter(Boolean);
  return `${priority.join(' ')} ${collectStrings(data).join(' ')}`;
}

function matchesKeywordBlob(blob) {
  return KEYWORDS.some((re) => re.test(blob));
}

function congressGovHint(data) {
  const u = normStr(data.sourceUrl || data.source_url || '');
  const sid = normStr(data.sourceId || data.source_id || '');
  const sn = normStr(data.source_name || data.sourceName || '');
  if (/congress\.gov/i.test(u)) return 'url';
  if (/congress\.gov/i.test(sid)) return 'sourceId';
  if (/congress/i.test(sn)) return 'source_name';
  return null;
}

function fieldPresence(data) {
  const title = !!(data.title || data.shortTitle || data.short_title);
  const congress =
    data.congress != null ||
    data.congressNumber != null ||
    data.congress_number != null;
  const billNum =
    !!(data.billNumber ||
      data.bill_number ||
      data.number ||
      data.sourceId ||
      data.source_id);
  const latestAction =
    !!(data.latestAction ||
      data.latest_action ||
      data.latestActionText ||
      data.latest_action_text);
  const actionDate =
    !!(data.actionDate ||
      data.action_date ||
      data.latestAction?.actionDate ||
      data.latest_action?.actionDate);
  const sourceUrl = !!(data.sourceUrl || data.source_url);
  const lawNumber =
    !!(data.publicLawNumber ||
      data.public_law_number ||
      data.lawNumber ||
      data.law_number);

  return {
    title,
    congress,
    billNum,
    latestAction,
    actionDate,
    sourceUrl,
    lawNumber,
  };
}

async function main() {
  const allJurisdictions = process.argv.includes('--all-jurisdictions');
  initAdmin();
  const db = admin.firestore();

  /** @type {FirebaseFirestore.Query} */
  let q = db.collection(COLLECTION);
  if (!allJurisdictions) {
    q = q.where('jurisdiction', '==', 'US');
  }

  console.log(
    `[audit] Loading "${COLLECTION}"${allJurisdictions ? ' (all jurisdictions)' : ' where jurisdiction == US'}…`,
  );

  const snap = await q.get();
  const docs = [];
  snap.forEach((d) => docs.push({ id: d.id, data: d.data() || {} }));

  console.log(`\n=== Count ===`);
  console.log(`Total documents: ${docs.length}`);

  const statusSet = new Set();
  const latestActionSet = new Set();
  const jurisdictionSet = new Set();

  let keywordMatchCount = 0;
  let congressGovCount = 0;
  const presenceAgg = {
    title: 0,
    congress: 0,
    billNum: 0,
    latestAction: 0,
    actionDate: 0,
    sourceUrl: 0,
    lawNumber: 0,
  };

  for (const { id, data } of docs) {
    if (data.jurisdiction != null) jurisdictionSet.add(normStr(data.jurisdiction));

    const st = normStr(data.status);
    if (st) statusSet.add(st.slice(0, 200));

    const la =
      normStr(data.latestAction) ||
      normStr(data.latest_action) ||
      normStr(data.latestActionText) ||
      normStr(data.latest_action_text);
    if (la) latestActionSet.add(la.slice(0, 240));

    if (matchesKeywordBlob(textBlob(data))) keywordMatchCount += 1;
    if (congressGovHint(data)) congressGovCount += 1;

    const p = fieldPresence(data);
    Object.keys(presenceAgg).forEach((k) => {
      if (p[k]) presenceAgg[k] += 1;
    });
  }

  const statusArr = [...statusSet].sort();
  const latestArr = [...latestActionSet].sort();

  console.log(`\n=== Distinct status (truncated to 200 chars, ${statusArr.length} unique) ===`);
  statusArr.slice(0, 80).forEach((s) => console.log(`  - ${s}`));
  if (statusArr.length > 80) console.log(`  … ${statusArr.length - 80} more`);

  console.log(`\n=== Distinct latestAction-style fields (${latestArr.length} unique, truncated) ===`);
  latestArr.slice(0, 80).forEach((s) => console.log(`  - ${s}`));
  if (latestArr.length > 80) console.log(`  … ${latestArr.length - 80} more`);

  if (allJurisdictions || jurisdictionSet.size > 1) {
    console.log(`\n=== Jurisdictions in result (${jurisdictionSet.size}) ===`);
    [...jurisdictionSet].sort().forEach((j) => console.log(`  - ${j}`));
  }

  console.log(`\n=== Signed / law keyword scan (any field) ===`);
  console.log(
    `Documents matching at least one pattern (signed by president, became law, public law no., enacted, PL ##-##): ${keywordMatchCount} / ${docs.length}`,
  );

  console.log(`\n=== Congress.gov hints (URL, sourceId, or source_name) ===`);
  console.log(`Documents with Congress.gov-like reference: ${congressGovCount} / ${docs.length}`);

  console.log(`\n=== Field presence (share of documents with useful fields) ===`);
  Object.entries(presenceAgg).forEach(([k, n]) => {
    const pct = docs.length ? ((n / docs.length) * 100).toFixed(1) : '0';
    console.log(`  ${k}: ${n} (${pct}%)`);
  });

  console.log(`\n=== Sample documents (first 3, top-level keys only) ===`);
  docs.slice(0, 3).forEach((d, i) => {
    console.log(`\n--- [${i + 1}] id=${d.id} ---`);
    console.log(JSON.stringify(Object.keys(d.data).sort(), null, 2));
    console.log(
      JSON.stringify(
        {
          jurisdiction: d.data.jurisdiction,
          status: d.data.status,
          title: d.data.title,
          sourceId: d.data.sourceId || d.data.source_id,
          sourceUrl: d.data.sourceUrl || d.data.source_url,
          latestAction: d.data.latestAction || d.data.latest_action,
        },
        null,
        2,
      ),
    );
  });

  console.log(`\n[audit] Done.`);
}

main().catch((err) => {
  console.error('[audit] Failed:', err);
  process.exit(1);
});
