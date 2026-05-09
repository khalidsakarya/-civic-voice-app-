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

  if (admin.apps.length > 0) {
    return admin.firestore();
  }

  let credential;
  let projectId = PROJECT_ID_FALLBACK;

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
}

function describeCredentialSource() {
  if (hasApplicationDefaultPath()) return 'GOOGLE_APPLICATION_CREDENTIALS';
  if (hasInlineFirebaseCredentials()) {
    return 'FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY (engine-style .env)';
  }
  return '(none)';
}

module.exports = {
  tryLoadDotenv,
  tryGetFirestore,
  describeCredentialSource,
  PROJECT_ID_FALLBACK,
};
