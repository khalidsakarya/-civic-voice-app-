/**
 * The two EXISTING, user-initiated notification flows, moved out of App.js so they can be tested. Behaviour is
 * unchanged except for one thing: the push worker is now registered at its dedicated scope and the registration
 * passed to getToken() is that one (see fcmScope.js).
 *
 * Both flows run only when a visitor clicks something (location flow: after they set a home region; banner flow:
 * the "Allow" button / bell). Neither runs on page load. There is no migration of earlier subscriptions here.
 *
 * No sender or topic-subscription code exists in this repository or in the deployed Cloud Functions; the topic field
 * in `fcm_tokens` is only a stored value. See docs/fcm-notification-scope.md.
 */
import { getFcmToken } from './fcmScope';

export const FCM_TOKEN_STORAGE_KEY = 'cvFCMToken';
export const FCM_TOKENS_COLLECTION = 'fcm_tokens';
export const NEWS_NOTIF_TOPICS = { CA: 'canada-news', US: 'us-news', UK: 'uk-news', AU: 'australia-news' };
export const DEFAULT_NEWS_TOPIC = 'general-news';

const defaultRequestPermission = () => Notification.requestPermission();
const defaultStorage = () => window.localStorage;

/**
 * Location flow (was `requestFcmToken` in App.js): permission, token, token kept in localStorage only.
 * Never writes to Firestore. Failures are silent: notifications are optional.
 */
export async function runLocationFcmFlow({
  app,
  requestPermission = defaultRequestPermission,
  getToken = getFcmToken,
  storage = defaultStorage,
} = {}) {
  try {
    const permission = await requestPermission();
    if (permission !== 'granted') return;
    const token = await getToken(app);
    if (token) storage().setItem(FCM_TOKEN_STORAGE_KEY, token);
  } catch {
    // Notifications are optional — fail silently
  }
}

/**
 * News-banner flow (was `requestNewsNotif` in App.js): permission, token, token in localStorage, then the existing
 * `fcm_tokens/{token}` document `{ token, <topic>: true, ts }` (merge). `onStatus('denied' | 'granted')` lets the
 * caller update the banner state exactly as before.
 *
 * @param {object} o
 * @param {string} o.cc country code (CA | US | UK | AU)
 * @param {{ db: object, doc: Function, setDoc: Function, serverTimestamp: Function }} o.firestore
 */
export async function runNewsNotifFlow({
  cc,
  app,
  firestore,
  onStatus,
  requestPermission = defaultRequestPermission,
  getToken = getFcmToken,
  storage = defaultStorage,
  logger = console,
} = {}) {
  try {
    const permission = await requestPermission();
    if (permission !== 'granted') {
      onStatus('denied');
      return;
    }
    const token = await getToken(app);
    if (token) {
      storage().setItem(FCM_TOKEN_STORAGE_KEY, token);
      // Topic field (e.g. 'canada-news': true). No code in this repository subscribes the token to a topic.
      await firestore.setDoc(
        firestore.doc(firestore.db, FCM_TOKENS_COLLECTION, token),
        {
          token,
          [NEWS_NOTIF_TOPICS[cc] || DEFAULT_NEWS_TOPIC]: true,
          ts: firestore.serverTimestamp(),
        },
        { merge: true },
      );
    }
    onStatus('granted');
  } catch (err) {
    logger.warn('[NewsNotif] FCM setup failed:', err.message);
  }
}
