/**
 * Monthly (or on-demand) sync: U.S. executive orders from the Federal Register API → Firestore `executive_orders`.
 *
 * Firestore target: same GCP project as the web app (`src/firebase.js` → projectId). Client SDK uses the web API key;
 * this script MUST use Firebase Admin + a service account for that project (never embed private keys in React).
 *
 * Prerequisites:
 *   npm install firebase-admin   (devDependency in this repo)
 *
 * Authentication (pick one):
 *   export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
 *   OR export FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'
 *
 * Usage:
 *   node engine/sync-us-executive-orders.cjs
 *
 * Environment:
 *   PRESIDENT_SLUG=donald-trump              — FR API president slug (see federalregister.gov developers docs)
 *   PRESIDENT_DISPLAY_NAME=Donald J. Trump   — Stored on each doc
 *   FIRESTORE_COLLECTION=executive_orders
 *   MAX_DETAIL_FETCHES=50                     — Optional cap for testing (0 = no cap)
 *   DETAIL_DELAY_MS=40                        — Delay between Federal Register detail requests
 */

const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

/** If env is unset, use a service-account JSON file in the project root (local dev only). */
function resolveCredentialsFromDisk() {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.FIREBASE_SERVICE_ACCOUNT_JSON) return;
  const root = path.join(__dirname, '..');
  const candidates = [
    'firebase-admin-key.json',
    'service-account.json',
    'civic-voice-5ea94-firebase-adminsdk.json',
  ];
  for (const name of candidates) {
    const p = path.join(root, name);
    if (fs.existsSync(p)) {
      process.env.GOOGLE_APPLICATION_CREDENTIALS = p;
      console.log('[sync-eo] Using GOOGLE_APPLICATION_CREDENTIALS from file:', p);
      return;
    }
  }
}

/** Must match `projectId` in `src/firebase.js` — Admin writes go to this project's Firestore. */
const APP_FIREBASE_PROJECT_ID = 'civic-voice-5ea94';

/** Default must match `src/constants/firestoreCollections.js` (`EXECUTIVE_ORDERS_COLLECTION`). Override only with care. */
const DEFAULT_EXECUTIVE_ORDERS_COLLECTION = 'executive_orders';

const LIST_URL = 'https://www.federalregister.gov/api/v1/documents.json';
const COLLECTION = process.env.FIRESTORE_COLLECTION || DEFAULT_EXECUTIVE_ORDERS_COLLECTION;
const PRESIDENT_SLUG = process.env.PRESIDENT_SLUG || 'donald-trump';
const PRESIDENT_NAME = process.env.PRESIDENT_DISPLAY_NAME || 'Donald J. Trump';
const MAX_DETAIL_FETCHES = parseInt(process.env.MAX_DETAIL_FETCHES || '0', 10);
const DETAIL_DELAY_MS = parseInt(process.env.DETAIL_DELAY_MS || '40', 10);

function initFirebase() {
  if (admin.apps.length) return;
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    if (sa.project_id && sa.project_id !== APP_FIREBASE_PROJECT_ID) {
      console.error(
        `[sync-eo] Service account project_id "${sa.project_id}" does not match app project "${APP_FIREBASE_PROJECT_ID}" (see src/firebase.js). Use a key from the same Firebase/GCP project.`,
      );
      process.exit(1);
    }
    admin.initializeApp({
      credential: admin.credential.cert(sa),
      projectId: APP_FIREBASE_PROJECT_ID,
    });
    return;
  }
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: APP_FIREBASE_PROJECT_ID,
    });
    return;
  }
  console.error('[sync-eo] Set GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_SERVICE_ACCOUNT_JSON');
  process.exit(1);
}

/** Collect unique Federal Register document numbers from paginated list API. */
async function fetchAllDocumentNumbers() {
  const numbers = [];
  const seen = new Set();
  let page = 1;
  let totalPages = 1;
  const perPage = 100;

  do {
    const url = new URL(LIST_URL);
    url.searchParams.set('per_page', String(perPage));
    url.searchParams.set('page', String(page));
    url.searchParams.set('order', 'newest');
    url.searchParams.set('conditions[type]', 'PRESDOCU');
    url.searchParams.set('conditions[presidential_document_type]', 'executive_order');
    url.searchParams.set('conditions[president]', PRESIDENT_SLUG);

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Federal Register list failed HTTP ${res.status}`);
    const data = await res.json();
    totalPages = data.total_pages || 1;

    for (const r of data.results || []) {
      if (r.document_number && !seen.has(r.document_number)) {
        seen.add(r.document_number);
        numbers.push(r.document_number);
      }
    }
    console.log(`[sync-eo] list page ${page}/${totalPages} · ${numbers.length} unique document numbers`);
    page += 1;
  } while (page <= totalPages);

  return numbers;
}

async function fetchDetail(documentNumber) {
  const url = `https://www.federalregister.gov/api/v1/documents/${encodeURIComponent(documentNumber)}.json`;
  const res = await fetch(url);
  if (!res.ok) {
    console.warn(`[sync-eo] detail ${documentNumber} → HTTP ${res.status}`);
    return null;
  }
  return res.json();
}

function docIdForDetail(d) {
  const eo = d.executive_order_number || d.presidential_document_number;
  if (eo != null && String(eo).trim() !== '') {
    const digits = String(eo).replace(/\D/g, '');
    if (digits) return `US-EO-${digits}`;
  }
  return `US-FR-${d.document_number}`;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  resolveCredentialsFromDisk();
  initFirebase();
  const db = admin.firestore();

  const documentNumbers = await fetchAllDocumentNumbers();
  const toProcess = MAX_DETAIL_FETCHES > 0 ? documentNumbers.slice(0, MAX_DETAIL_FETCHES) : documentNumbers;
  console.log(`[sync-eo] fetching ${toProcess.length} detail records from Federal Register…`);

  let processed = 0;
  const BATCH_MAX = 450;
  let batch = db.batch();
  let batchWrites = 0;
  const fetchedAt = admin.firestore.FieldValue.serverTimestamp();

  for (const documentNumber of toProcess) {
    const d = await fetchDetail(documentNumber);
    if (DETAIL_DELAY_MS > 0) await sleep(DETAIL_DELAY_MS);

    if (!d) continue;

    const id = docIdForDetail(d);
    const ref = db.collection(COLLECTION).doc(id);
    const eoDigits = d.executive_order_number != null
      ? String(d.executive_order_number).replace(/\D/g, '')
      : (d.presidential_document_number != null ? String(d.presidential_document_number).replace(/\D/g, '') : null);

    const payload = {
      jurisdiction: 'US',
      president: PRESIDENT_NAME,
      eoNumber: eoDigits || null,
      title: d.title || '',
      signingDate: d.signing_date || null,
      publicationDate: d.publication_date || null,
      documentNumber: d.document_number || documentNumber,
      citation: d.citation || null,
      source: 'Federal Register',
      sourceUrl: d.html_url || null,
      pdfUrl: d.pdf_url || null,
      abstract: d.abstract != null ? d.abstract : null,
      dataStatus: 'official_source',
      lastFetchedAt: fetchedAt,
      rawSourcePayload: d,
    };

    batch.set(ref, payload, { merge: true });
    batchWrites += 1;
    processed += 1;

    if (batchWrites >= BATCH_MAX) {
      await batch.commit();
      console.log(`[sync-eo] committed batch · ${processed} documents upserted`);
      batch = db.batch();
      batchWrites = 0;
    }
  }

  if (batchWrites > 0) await batch.commit();

  console.log(`[sync-eo] complete · ${processed} documents upserted into Firestore collection "${COLLECTION}"`);
}

main().catch((err) => {
  console.error('[sync-eo] fatal:', err);
  process.exit(1);
});
