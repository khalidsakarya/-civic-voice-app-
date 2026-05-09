/**
 * Firebase Admin initialization aligned with civic-voice-engine/src/firebase/client.js:
 * - GOOGLE_APPLICATION_CREDENTIALS → applicationDefault()
 * - OR FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY (typical engine .env)
 *
 * Loads dotenv from process.cwd() and common repo paths (including sibling civic-voice-engine/.env).
 */

const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

const PROJECT_ID_FALLBACK = 'civic-voice-5ea94';

/** Last result from {@link sanitizeGoogleApplicationCredentialsEnv} (for CLI messaging). */
let lastGoogleApplicationCredentialsSanitize = null;

function tryLoadDotenv() {
  try {
    require('dotenv').config();
  } catch (_) {
    /* dotenv optional if missing */
  }

  const dirs = [
    process.cwd(),
    path.resolve(__dirname, '..'),
    path.resolve(__dirname, '..', '..', 'civic-voice-engine'),
    path.resolve(__dirname, '..', '..', 'civic-voice-app'),
  ];

  for (const dir of dirs) {
    const envPath = path.join(dir, '.env');
    if (fs.existsSync(envPath)) {
      try {
        require('dotenv').config({ path: envPath });
      } catch (_) {
        /* ignore */
      }
    }
  }
}

/**
 * Detects tutorial / placeholder values that must not be passed to applicationDefault().
 * @param {string} p
 * @returns {boolean}
 */
function isPlaceholderGoogleApplicationCredentialsPath(p) {
  const s = String(p).trim();
  if (!s) return true;
  const up = s.toUpperCase();
  if (up.includes('PASTE_THE_FULL_PATH_HERE')) return true;
  if (up.includes('PASTE_THE_FULL_PATH')) return true;
  if (/path[\\/]+to[\\/]+your-service-account\.json/i.test(s)) return true;
  if (/C:\\path\\to\\/i.test(s) && /\.json$/i.test(s)) return true;
  if (/^\/path\/to\//i.test(s)) return true;
  if (/your-service-account\.json/i.test(s)) return true;
  if (/example.*service-account/i.test(s)) return true;
  return false;
}

function truncateCredentialHint(s, max = 72) {
  const t = String(s);
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
}

/**
 * Removes invalid / placeholder `GOOGLE_APPLICATION_CREDENTIALS` from `process.env`
 * so Firebase can fall back to `FIREBASE_*` inline credentials when present.
 *
 * @returns {{ cleared: boolean, reason: string | null, preview: string | null, wasPlaceholder: boolean }}
 */
function sanitizeGoogleApplicationCredentialsEnv() {
  const raw = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (raw === undefined || raw === null) {
    lastGoogleApplicationCredentialsSanitize = {
      cleared: false,
      reason: null,
      preview: null,
      wasPlaceholder: false,
    };
    return lastGoogleApplicationCredentialsSanitize;
  }

  const t = String(raw).trim();
  if (t === '') {
    delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
    lastGoogleApplicationCredentialsSanitize = {
      cleared: true,
      reason: 'empty',
      preview: '(empty)',
      wasPlaceholder: false,
    };
    return lastGoogleApplicationCredentialsSanitize;
  }

  if (isPlaceholderGoogleApplicationCredentialsPath(t)) {
    delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
    lastGoogleApplicationCredentialsSanitize = {
      cleared: true,
      reason: 'placeholder',
      preview: truncateCredentialHint(t),
      wasPlaceholder: true,
    };
    return lastGoogleApplicationCredentialsSanitize;
  }

  lastGoogleApplicationCredentialsSanitize = {
    cleared: false,
    reason: null,
    preview: truncateCredentialHint(t),
    wasPlaceholder: false,
  };
  return lastGoogleApplicationCredentialsSanitize;
}

function getLastGoogleApplicationCredentialsSanitize() {
  return lastGoogleApplicationCredentialsSanitize;
}

function formatPlaceholderCredentialMessage() {
  const r = lastGoogleApplicationCredentialsSanitize;
  if (!r || !r.wasPlaceholder) return '';
  return (
    'Firebase Admin credential path is still a placeholder (GOOGLE_APPLICATION_CREDENTIALS). ' +
    `Ignored invalid value: ${r.preview}. ` +
    'Replace it with the full path to your service account JSON, or remove the line and use FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY.'
  );
}

/**
 * Inline `.env` private keys copied from templates must not be passed to Admin SDK.
 * @param {string | undefined} k
 */
function isPlaceholderFirebasePrivateKey(k) {
  if (k === undefined || k === null) return true;
  const t = String(k).trim();
  if (!t) return true;
  const up = t.toUpperCase();
  if (up.includes('YOUR_PRIVATE_KEY_HERE')) return true;
  if (up.includes('PASTE')) return true;
  if (!t.includes('BEGIN PRIVATE KEY')) return true;
  return false;
}

/**
 * After {@link sanitizeGoogleApplicationCredentialsEnv}: usable file path or valid inline PEM (not template text).
 * Does not verify network or IAM — only that credentials are present and non-placeholder.
 *
 * @returns {boolean}
 */
function hasValidFirebaseCredentialsForWrite() {
  sanitizeGoogleApplicationCredentialsEnv();
  if (hasApplicationDefaultPath()) {
    const p = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    try {
      if (!p || !fs.existsSync(p)) return false;
      const j = JSON.parse(fs.readFileSync(p, 'utf8'));
      return !!(j && typeof j === 'object' && j.client_email && j.private_key);
    } catch (_) {
      return false;
    }
  }
  if (hasInlineFirebaseCredentials()) {
    return !isPlaceholderFirebasePrivateKey(process.env.FIREBASE_PRIVATE_KEY);
  }
  return false;
}

/**
 * Exit immediately unless credentials look usable for Admin SDK (for `--write` scripts).
 *
 * @param {string} tag Log prefix, e.g. `enrich-3b`
 */
function assertFirebaseCredentialsForWrite(tag) {
  sanitizeGoogleApplicationCredentialsEnv();
  const pm = formatPlaceholderCredentialMessage();
  if (!hasValidFirebaseCredentialsForWrite()) {
    console.error(`[${tag}] --write requires valid Firebase Admin credentials.`);
    if (pm) console.error(`[${tag}] ${pm}`);
    console.error(
      `[${tag}] Set GOOGLE_APPLICATION_CREDENTIALS to a real service account JSON file, or set FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY (see civic-voice-engine/.env.example).`,
    );
    process.exit(1);
  }
}

function hasApplicationDefaultPath() {
  return !!process.env.GOOGLE_APPLICATION_CREDENTIALS;
}

function hasInlineFirebaseCredentials() {
  return !!(
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  );
}

/**
 * @returns {FirebaseFirestore.Firestore | null}
 */
function tryGetFirestore() {
  tryLoadDotenv();
  sanitizeGoogleApplicationCredentialsEnv();

  if (admin.apps.length > 0) {
    return admin.firestore();
  }

  let credential;
  let projectId = PROJECT_ID_FALLBACK;

  try {
    if (hasApplicationDefaultPath()) {
      credential = admin.credential.applicationDefault();
    } else if (hasInlineFirebaseCredentials()) {
      projectId = process.env.FIREBASE_PROJECT_ID || PROJECT_ID_FALLBACK;
      credential = admin.credential.cert({
        projectId,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      });
    } else {
      return null;
    }

    admin.initializeApp({
      credential,
      projectId,
    });

    return admin.firestore();
  } catch (err) {
    console.error('[firebase-admin-init] Firebase Admin initialization failed:', err.message || err);
    return null;
  }
}

function describeCredentialSource() {
  sanitizeGoogleApplicationCredentialsEnv();
  if (hasApplicationDefaultPath()) return 'GOOGLE_APPLICATION_CREDENTIALS';
  if (hasInlineFirebaseCredentials()) {
    return 'FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY (engine-style .env)';
  }
  const r = lastGoogleApplicationCredentialsSanitize;
  if (r && r.wasPlaceholder) {
    return '(placeholder GOOGLE_APPLICATION_CREDENTIALS was ignored — no usable credentials)';
  }
  return '(none)';
}

module.exports = {
  tryLoadDotenv,
  tryGetFirestore,
  describeCredentialSource,
  sanitizeGoogleApplicationCredentialsEnv,
  getLastGoogleApplicationCredentialsSanitize,
  formatPlaceholderCredentialMessage,
  isPlaceholderGoogleApplicationCredentialsPath,
  isPlaceholderFirebasePrivateKey,
  hasValidFirebaseCredentialsForWrite,
  assertFirebaseCredentialsForWrite,
  PROJECT_ID_FALLBACK,
};
