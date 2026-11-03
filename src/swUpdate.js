/**
 * User-controlled application updates for the Workbox service worker.
 *
 * Problem: the app is precached by Workbox, and a new worker only takes over after every tab is closed, so returning
 * visitors keep seeing old labels. `register()` was called without any update handling and nothing ever sent the
 * worker its SKIP_WAITING message.
 *
 * Behaviour (each point is covered by src/swUpdate.test.js):
 *   - A waiting worker is detected, both when one already exists at registration and when a new one finishes
 *     installing later. The very first install (no controller yet) is NOT an update and never shows a prompt.
 *   - Nothing is activated automatically. The waiting worker is told to skip waiting ONLY after the visitor clicks
 *     "Refresh" (refresh()). There is no skipWaiting on page load, on a timer, or on visibility.
 *   - After the visitor's click the page reloads once, when the controller actually changes. A reload guard
 *     (sessionStorage timestamp + an in-memory flag) makes a reload loop impossible.
 *   - Another tab that sees the controller change it did not ask for does not reload (it could hold unsaved input);
 *     it shows the same prompt and reloads only when its own visitor clicks.
 *   - Update checks happen only when a tab becomes visible, at most once per interval (default 30 minutes), never on
 *     a timer, never while offline, and never while an update is being applied. A failing check is swallowed and backs
 *     off, so offline use and flaky networks stay quiet.
 *
 * Nothing here touches the Workbox caching, the push-notification worker, Firebase or any data.
 */

export const SW_UPDATE_STATUS = Object.freeze({
  IDLE: 'idle',
  AVAILABLE: 'available',
  APPLYING: 'applying',
  STALE: 'stale', // another tab already activated the new version; this tab only needs a reload
  ERROR: 'error',
});

export const CHECK_INTERVAL_MS = 30 * 60 * 1000;
export const MAX_BACKOFF_MS = 4 * 60 * 60 * 1000;
export const APPLY_TIMEOUT_MS = 8000;
export const RELOAD_GUARD_MS = 15000;
export const RELOAD_GUARD_KEY = 'cv_sw_reload_at';

const MSG_APPLY_TIMEOUT = 'The update could not be applied. Close other tabs of this app, then try again.';
const MSG_NO_WAITING = 'The update is no longer available. Reload the page to check again.';
const MSG_RELOAD_BLOCKED = 'The update is installed. Please reload this page manually.';

const safeStorage = () => {
  try {
    return typeof window !== 'undefined' && window.sessionStorage ? window.sessionStorage : null;
  } catch {
    return null;
  }
};

/**
 * @param {object} [deps] every browser dependency is injectable for tests
 * @param {ServiceWorkerContainer|null} [deps.serviceWorker]
 * @param {Document|null} [deps.document]
 * @param {{ getItem: Function, setItem: Function }|null} [deps.storage]
 * @param {() => void} [deps.reload]
 * @param {() => number} [deps.now]
 * @param {() => boolean} [deps.isOnline]
 * @param {number} [deps.intervalMs]
 * @param {number} [deps.applyTimeoutMs]
 * @param {number} [deps.guardMs]
 * @param {{ debug: Function }} [deps.logger]
 */
export function createUpdateController({
  serviceWorker = typeof navigator !== 'undefined' && 'serviceWorker' in navigator ? navigator.serviceWorker : null,
  document: doc = typeof document !== 'undefined' ? document : null,
  storage = safeStorage(),
  reload = () => window.location.reload(),
  now = () => Date.now(),
  isOnline = () => (typeof navigator === 'undefined' ? true : navigator.onLine !== false),
  intervalMs = CHECK_INTERVAL_MS,
  applyTimeoutMs = APPLY_TIMEOUT_MS,
  guardMs = RELOAD_GUARD_MS,
  logger = console,
} = {}) {
  /** @type {{ status: string, message: string|null, dismissed: boolean }} */
  let state = { status: SW_UPDATE_STATUS.IDLE, message: null, dismissed: false };
  const listeners = new Set();
  let registration = null;
  let candidate = null; // the worker we reported as waiting
  let hadController = Boolean(serviceWorker && serviceWorker.controller);
  let applying = false;
  let reloading = false;
  let applyTimer = null;
  let lastAttemptAt = null;
  let failures = 0;
  let destroyed = false;
  const cleanups = [];

  const set = (patch) => {
    state = { ...state, ...patch };
    listeners.forEach((fn) => fn());
  };
  const getState = () => state;
  const subscribe = (fn) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  };

  const listen = (target, type, handler) => {
    if (!target || typeof target.addEventListener !== 'function') return;
    target.addEventListener(type, handler);
    cleanups.push(() => target.removeEventListener(type, handler));
  };

  const markAvailable = (worker) => {
    if (destroyed || !hadController) return; // the first install is not an update
    const isNew = candidate !== worker;
    candidate = worker;
    if (state.status === SW_UPDATE_STATUS.APPLYING || state.status === SW_UPDATE_STATUS.STALE) return;
    set({ status: SW_UPDATE_STATUS.AVAILABLE, message: null, dismissed: isNew ? false : state.dismissed });
  };

  const watchInstalling = (worker) => {
    if (!worker) return;
    const onState = () => {
      if (worker.state === 'installed') markAvailable(worker);
      else if (worker.state === 'redundant' && candidate === worker && !applying) {
        candidate = null;
        if (state.status === SW_UPDATE_STATUS.AVAILABLE) set({ status: SW_UPDATE_STATUS.IDLE, message: null });
      }
    };
    listen(worker, 'statechange', onState);
    onState();
  };

  /** Call with the registration returned by navigator.serviceWorker.register(). */
  const attach = (reg) => {
    if (destroyed || !reg) return;
    registration = reg;
    lastAttemptAt = now(); // registering already checks for updates; the first visibility check waits one interval
    watchInstalling(reg.waiting); // reports it as available now, and withdraws the prompt if it later becomes redundant
    watchInstalling(reg.installing);
    listen(reg, 'updatefound', () => watchInstalling(reg.installing));
  };

  const reloadOnce = () => {
    if (reloading) return;
    let last = null;
    try {
      last = storage ? Number(storage.getItem(RELOAD_GUARD_KEY)) : null;
    } catch {
      last = null;
    }
    if (last && Number.isFinite(last) && now() - last < guardMs) {
      // an update-triggered reload just happened: never reload again, whatever the browser reports
      set({ status: SW_UPDATE_STATUS.ERROR, message: MSG_RELOAD_BLOCKED, dismissed: false });
      return;
    }
    reloading = true; // in-memory guard, valid even when sessionStorage is unavailable
    try {
      if (storage) storage.setItem(RELOAD_GUARD_KEY, String(now()));
    } catch {
      /* storage may be blocked; the in-memory flag still prevents a second reload in this page */
    }
    reload();
  };

  const clearApplyTimer = () => {
    if (applyTimer !== null) {
      clearTimeout(applyTimer);
      applyTimer = null;
    }
  };

  /** The visitor clicked "Refresh" while an update is available (or retrying after an error). */
  const applyUpdate = () => {
    if (destroyed || applying) return false;
    const waiting = (registration && registration.waiting) || candidate;
    if (!waiting) {
      set({ status: SW_UPDATE_STATUS.ERROR, message: MSG_NO_WAITING, dismissed: false });
      return false;
    }
    applying = true;
    set({ status: SW_UPDATE_STATUS.APPLYING, message: null, dismissed: false });
    clearApplyTimer();
    applyTimer = setTimeout(() => {
      applyTimer = null;
      if (!applying) return;
      applying = false;
      set({ status: SW_UPDATE_STATUS.ERROR, message: MSG_APPLY_TIMEOUT, dismissed: false });
    }, applyTimeoutMs);
    try {
      waiting.postMessage({ type: 'SKIP_WAITING' });
    } catch (e) {
      clearApplyTimer();
      applying = false;
      set({ status: SW_UPDATE_STATUS.ERROR, message: MSG_NO_WAITING, dismissed: false });
      logger.debug('[sw-update] postMessage failed', e && e.message);
      return false;
    }
    return true;
  };

  /** The single entry point for the prompt's button. */
  const refresh = () => {
    if (state.status === SW_UPDATE_STATUS.STALE) {
      reloadOnce();
      return;
    }
    if (state.status === SW_UPDATE_STATUS.AVAILABLE || state.status === SW_UPDATE_STATUS.ERROR) applyUpdate();
  };

  const dismiss = () => {
    if (state.status !== SW_UPDATE_STATUS.IDLE) set({ dismissed: true });
  };

  const onControllerChange = () => {
    if (destroyed) return;
    if (!hadController) {
      hadController = true; // first install claiming the page (clientsClaim): not an update, no prompt, no reload
      return;
    }
    if (applying) {
      applying = false;
      clearApplyTimer();
      reloadOnce();
      return;
    }
    // another tab activated the new version; reloading here could drop unsaved input, so ask this tab's visitor
    candidate = null;
    set({ status: SW_UPDATE_STATUS.STALE, message: null, dismissed: false });
  };

  /** Update check when the tab becomes visible: throttled, offline-aware, failure-tolerant. Never throws. */
  const checkForUpdate = () => {
    if (destroyed || !registration || applying) return Promise.resolve(false);
    if (state.status === SW_UPDATE_STATUS.STALE) return Promise.resolve(false);
    if (!isOnline()) return Promise.resolve(false);
    const wait = Math.min(intervalMs * 2 ** failures, MAX_BACKOFF_MS);
    if (lastAttemptAt !== null && now() - lastAttemptAt < wait) return Promise.resolve(false);
    lastAttemptAt = now();
    let pending;
    try {
      pending = Promise.resolve(registration.update());
    } catch (e) {
      pending = Promise.reject(e);
    }
    return pending.then(
      () => {
        failures = 0;
        return true;
      },
      (e) => {
        failures += 1; // back off: the next attempt waits twice as long (capped)
        logger.debug('[sw-update] update check failed', e && e.message);
        return false;
      },
    );
  };

  listen(serviceWorker, 'controllerchange', onControllerChange);
  listen(doc, 'visibilitychange', () => {
    if (doc && doc.visibilityState === 'visible') checkForUpdate();
  });

  const destroy = () => {
    destroyed = true;
    clearApplyTimer();
    cleanups.splice(0).forEach((fn) => fn());
    listeners.clear();
  };

  return { getState, subscribe, attach, refresh, dismiss, checkForUpdate, destroy };
}
