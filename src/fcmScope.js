/**
 * Firebase Cloud Messaging (FCM) worker registration on its OWN service-worker scope.
 *
 * Problem: the application worker (Workbox, `/service-worker.js`) is registered at scope `/`. The push worker
 * (`/firebase-messaging-sw.js`) used to be registered with no scope option, which is ALSO `/`. A scope has exactly one
 * registration with one active worker, so the two scripts replaced each other: the push worker became "waiting" (and
 * made the update prompt claim a new version existed), or became the ACTIVE worker and displaced Workbox's
 * precache/offline handling until every tab was closed.
 *
 * Fix: the push worker lives at Firebase's own default scope. That scope is below `/`, has no pages under it (so it
 * never controls a page and activates immediately) and leaves the Workbox registration at `/` untouched.
 *
 * Two details that matter (both read from @firebase/messaging 0.12.x):
 *   1. A registration handed to `getToken()` is NOT waited on by the SDK (only the SDK's own default registration
 *      is), and `pushManager.subscribe()` needs an ACTIVE worker. So we wait for activation of THIS registration.
 *   2. `navigator.serviceWorker.ready` is the registration at `/` (Workbox). It must never be used for FCM.
 *
 * Nothing in this module runs by itself: it only acts when a user-initiated flow (see fcmFlows.js) calls it, after
 * the visitor has granted notification permission through the existing prompts.
 */

export const FCM_SW_URL = '/firebase-messaging-sw.js';
// Identical to the SDK's default scope (DEFAULT_SW_SCOPE), so a stray getToken() without a registration reuses it
// instead of creating a third one.
export const FCM_SW_SCOPE = '/firebase-cloud-messaging-push-scope';
export const FCM_ACTIVATION_TIMEOUT_MS = 10000;
// Public Web Push (VAPID) key, unchanged: moved here from the two call sites so both use one value.
export const FCM_VAPID_KEY = 'BAuHr-DKvbopzCzk-wVBzlAiYXA0cxuCO_Wq-A3rQJWe2wXwxnVzSk6tuK6VLI0na7kWm9S3Zp6EDud9M_BWvW8';

/**
 * Resolves when `registration` has an activated worker. Rejects on timeout or when no usable worker remains.
 * Watches only this registration (never `navigator.serviceWorker.ready`).
 * @param {ServiceWorkerRegistration} registration
 * @param {number} [timeoutMs]
 * @returns {Promise<void>}
 */
export function waitForActive(registration, timeoutMs = FCM_ACTIVATION_TIMEOUT_MS) {
  return new Promise((resolve, reject) => {
    let done = false;
    const watched = new Set();
    const cleanups = [];
    let timer = null;

    const finish = (settle, value) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      cleanups.splice(0).forEach((fn) => fn());
      settle(value);
    };

    const watch = (worker) => {
      if (!worker || watched.has(worker) || typeof worker.addEventListener !== 'function') return;
      watched.add(worker);
      worker.addEventListener('statechange', check);
      cleanups.push(() => worker.removeEventListener('statechange', check));
    };

    function check() {
      if (done) return;
      const { active, waiting, installing } = registration;
      if (active && active.state === 'activated') {
        finish(resolve);
        return;
      }
      const candidates = [installing, waiting, active].filter((w) => w && w.state !== 'redundant');
      if (candidates.length === 0) {
        finish(reject, new Error('The push service worker has no usable worker (installation failed).'));
        return;
      }
      candidates.forEach(watch);
    }

    timer = setTimeout(
      () => finish(reject, new Error(`The push service worker did not activate within ${timeoutMs} ms.`)),
      timeoutMs,
    );
    if (typeof registration.addEventListener === 'function') {
      registration.addEventListener('updatefound', check);
      cleanups.push(() => registration.removeEventListener('updatefound', check));
    }
    check();
  });
}

/**
 * Registers the push worker at its dedicated scope and waits until it is active.
 * @param {{ serviceWorker?: ServiceWorkerContainer|null, timeoutMs?: number }} [options]
 * @returns {Promise<ServiceWorkerRegistration>} the dedicated registration (never the one at `/`)
 */
export async function registerFcmWorker({
  serviceWorker = typeof navigator !== 'undefined' && 'serviceWorker' in navigator ? navigator.serviceWorker : null,
  timeoutMs = FCM_ACTIVATION_TIMEOUT_MS,
} = {}) {
  if (!serviceWorker || typeof serviceWorker.register !== 'function') {
    throw new Error('Service workers are not available in this browser.');
  }
  const registration = await serviceWorker.register(FCM_SW_URL, { scope: FCM_SW_SCOPE });
  await waitForActive(registration, timeoutMs);
  return registration;
}

/**
 * Registers the dedicated push worker, waits for it to be active, then asks the Firebase SDK for the token using
 * THAT registration. Call only after notification permission has been granted by the visitor.
 * @param {import('firebase/app').FirebaseApp} app
 * @param {object} [deps] injectable for tests
 * @returns {Promise<string>} the FCM token (the SDK may return an empty value)
 */
export async function getFcmToken(
  app,
  {
    registerWorker = registerFcmWorker,
    loadMessaging = () => import('firebase/messaging'),
    vapidKey = FCM_VAPID_KEY,
  } = {},
) {
  const registration = await registerWorker();
  const { getMessaging, getToken } = await loadMessaging();
  return getToken(getMessaging(app), { serviceWorkerRegistration: registration, vapidKey });
}
