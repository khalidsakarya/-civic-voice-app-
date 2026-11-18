import fs from 'fs';
import path from 'path';
import {
  APPLY_TIMEOUT_MS,
  CHECK_INTERVAL_MS,
  RELOAD_GUARD_KEY,
  RELOAD_GUARD_MS,
  SW_UPDATE_STATUS as S,
  createUpdateController,
} from './swUpdate';

// Pure tests with fake service-worker objects: no browser worker, no network, no Firebase.

const makeWorker = (state = 'installed') => {
  const w = new EventTarget();
  w.state = state;
  w.postMessage = jest.fn();
  w.setState = (next) => { w.state = next; w.dispatchEvent(new Event('statechange')); };
  return w;
};
const makeRegistration = ({ waiting = null, installing = null } = {}) => {
  const r = new EventTarget();
  r.waiting = waiting;
  r.installing = installing;
  r.update = jest.fn(() => Promise.resolve());
  r.startInstall = (worker) => { r.installing = worker; r.dispatchEvent(new Event('updatefound')); };
  return r;
};
const makeContainer = (controller = {}) => {
  const c = new EventTarget();
  c.controller = controller;
  c.changeController = () => { c.controller = {}; c.dispatchEvent(new Event('controllerchange')); };
  return c;
};
const makeDoc = (visibilityState = 'hidden') => {
  const d = new EventTarget();
  d.visibilityState = visibilityState;
  d.show = () => { d.visibilityState = 'visible'; d.dispatchEvent(new Event('visibilitychange')); };
  d.hide = () => { d.visibilityState = 'hidden'; d.dispatchEvent(new Event('visibilitychange')); };
  return d;
};
const makeStorage = (initial = {}) => {
  const m = new Map(Object.entries(initial));
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), map: m };
};

const MIN = 60 * 1000;

function setup(over = {}) {
  const clock = { t: 1_000_000_000 };
  const online = { value: true };
  const reload = jest.fn();
  const container = 'container' in over ? over.container : makeContainer();
  const doc = makeDoc();
  const storage = 'storage' in over ? over.storage : makeStorage();
  const logger = { debug: jest.fn() };
  const controller = createUpdateController({ serviceWorker: container, document: doc, storage, reload, now: () => clock.t, isOnline: () => online.value, logger, ...(over.opts || {}) });
  return { clock, online, reload, container, doc, storage, logger, controller };
}
const waitingSetup = (over) => {
  const ctx = setup(over);
  const waiting = makeWorker('installed');
  const registration = makeRegistration({ waiting });
  ctx.controller.attach(registration);
  return { ...ctx, waiting, registration };
};

beforeEach(() => { jest.useFakeTimers(); });
afterEach(() => { jest.useRealTimers(); });

describe('waiting-worker detection', () => {
  test('a worker already waiting at registration (with an existing controller) makes an update available — and activates nothing', () => {
    const { controller, waiting } = waitingSetup();
    expect(controller.getState().status).toBe(S.AVAILABLE);
    expect(waiting.postMessage).not.toHaveBeenCalled();
  });

  test('a new worker that finishes installing later (updatefound -> installed) makes an update available', () => {
    const { controller } = setup();
    const registration = makeRegistration();
    controller.attach(registration);
    expect(controller.getState().status).toBe(S.IDLE);
    const worker = makeWorker('installing');
    registration.startInstall(worker);
    expect(controller.getState().status).toBe(S.IDLE); // still installing
    worker.setState('installed');
    expect(controller.getState().status).toBe(S.AVAILABLE);
  });

  test('the very first install (no controller yet) is NOT an update: no prompt, and the clientsClaim controllerchange neither prompts nor reloads', () => {
    const { controller, container, reload } = setup({ container: makeContainer(null) });
    const registration = makeRegistration();
    controller.attach(registration);
    const worker = makeWorker('installing');
    registration.startInstall(worker);
    worker.setState('installed');
    expect(controller.getState().status).toBe(S.IDLE);
    container.changeController(); // the first worker claiming the page
    expect(controller.getState().status).toBe(S.IDLE);
    expect(reload).not.toHaveBeenCalled();
    // later updates are still detected once the page is controlled
    const next = makeWorker('installing');
    registration.startInstall(next);
    next.setState('installed');
    expect(controller.getState().status).toBe(S.AVAILABLE);
  });

  test('a waiting worker that becomes redundant withdraws the prompt', () => {
    const { controller, waiting } = waitingSetup();
    waiting.setState('redundant');
    expect(controller.getState().status).toBe(S.IDLE);
  });

  test('NO waiting worker: idle, and refresh() does nothing (no message, no reload)', () => {
    const { controller, reload } = setup();
    controller.attach(makeRegistration());
    expect(controller.getState().status).toBe(S.IDLE);
    controller.refresh();
    expect(controller.getState().status).toBe(S.IDLE);
    expect(reload).not.toHaveBeenCalled();
  });

  test('a dismissed prompt reappears for a NEWER waiting worker, not for the same one', () => {
    const { controller, registration, waiting } = waitingSetup();
    controller.dismiss();
    expect(controller.getState().dismissed).toBe(true);
    waiting.setState('installed'); // the same worker reporting again
    expect(controller.getState().dismissed).toBe(true);
    const newer = makeWorker('installing');
    registration.startInstall(newer);
    newer.setState('installed');
    expect(controller.getState().dismissed).toBe(false);
    expect(controller.getState().status).toBe(S.AVAILABLE);
  });

  test('an environment without service workers is inert and never throws', () => {
    const c = createUpdateController({ serviceWorker: null, document: null, storage: null, reload: jest.fn() });
    expect(c.getState().status).toBe(S.IDLE);
    expect(() => { c.attach(undefined); c.refresh(); c.dismiss(); c.destroy(); }).not.toThrow();
  });
});

describe('user-triggered activation', () => {
  test('nothing is activated on load, on visibility, or with the passage of time — only the visitor\'s click sends SKIP_WAITING', () => {
    const { controller, waiting, doc, clock } = waitingSetup();
    clock.t += 10 * 60 * MIN;
    doc.show(); doc.hide(); doc.show();
    jest.advanceTimersByTime(24 * 60 * MIN);
    expect(waiting.postMessage).not.toHaveBeenCalled();
    controller.refresh();
    expect(waiting.postMessage).toHaveBeenCalledTimes(1);
    expect(waiting.postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' });
    expect(controller.getState().status).toBe(S.APPLYING);
  });

  test('clicking twice sends only one message', () => {
    const { controller, waiting } = waitingSetup();
    controller.refresh();
    controller.refresh();
    expect(waiting.postMessage).toHaveBeenCalledTimes(1);
  });

  test('the click activates the CURRENT waiting worker (a newer update may have replaced the one first reported)', () => {
    const { controller, registration, waiting } = waitingSetup();
    const newer = makeWorker('installed');
    registration.waiting = newer;
    controller.refresh();
    expect(newer.postMessage).toHaveBeenCalledTimes(1);
    expect(waiting.postMessage).not.toHaveBeenCalled();
  });

  test('if the waiting worker vanished before the click, an error is shown and nothing reloads', () => {
    const { controller, registration, reload } = waitingSetup();
    registration.waiting = null;
    // the candidate reference is the only remaining one: make it fail like a dead worker
    const dead = makeWorker('installed');
    dead.postMessage = jest.fn(() => { throw new Error('InvalidStateError'); });
    registration.waiting = dead;
    controller.refresh();
    expect(controller.getState().status).toBe(S.ERROR);
    expect(controller.getState().message).toMatch(/no longer available/i);
    expect(reload).not.toHaveBeenCalled();
  });
});

describe('controller changes', () => {
  test('after the visitor\'s click, the controller change reloads the page exactly once and records the reload guard', () => {
    const { controller, container, reload, storage, clock } = waitingSetup();
    controller.refresh();
    expect(reload).not.toHaveBeenCalled(); // not before the controller actually changes
    container.changeController();
    expect(reload).toHaveBeenCalledTimes(1);
    expect(storage.map.get(RELOAD_GUARD_KEY)).toBe(String(clock.t));
  });

  test('repeated controllerchange events still reload once', () => {
    const { controller, container, reload } = waitingSetup();
    controller.refresh();
    container.changeController();
    container.changeController();
    container.changeController();
    expect(reload).toHaveBeenCalledTimes(1);
  });

  test('a controller change this tab did NOT ask for (another tab updated) never reloads by itself: it shows the prompt, and reloads only on click', () => {
    const { controller, container, reload } = waitingSetup();
    container.changeController();
    expect(controller.getState().status).toBe(S.STALE);
    expect(reload).not.toHaveBeenCalled();
    controller.refresh();
    expect(reload).toHaveBeenCalledTimes(1);
    controller.refresh();
    expect(reload).toHaveBeenCalledTimes(1);
  });
});

describe('reload-loop prevention', () => {
  test('a reload recorded moments ago blocks another one: manual-reload message, no reload; allowed again after the guard window', () => {
    const { controller, container, reload, clock } = waitingSetup({ storage: makeStorage({ [RELOAD_GUARD_KEY]: String(1_000_000_000 - 1000) }) });
    controller.refresh();
    container.changeController();
    expect(reload).not.toHaveBeenCalled();
    expect(controller.getState().status).toBe(S.ERROR);
    expect(controller.getState().message).toMatch(/reload this page manually/i);
    clock.t += RELOAD_GUARD_MS + 1000;
    controller.refresh(); // retry from the error state
    container.changeController();
    expect(reload).toHaveBeenCalledTimes(1);
  });

  test('a guard timestamp in the FUTURE (the clock was moved back) does not block a legitimate update (found in a real-browser run)', () => {
    const { controller, container, reload } = waitingSetup({ storage: makeStorage({ [RELOAD_GUARD_KEY]: String(1_000_000_000 + 60 * MIN) }) });
    controller.refresh();
    container.changeController();
    expect(controller.getState().status).toBe(S.APPLYING);
    expect(reload).toHaveBeenCalledTimes(1);
  });

  test('with sessionStorage unavailable (throws) the page still reloads at most once', () => {
    const storage = { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); } };
    const { controller, container, reload } = waitingSetup({ storage });
    controller.refresh();
    expect(() => { container.changeController(); container.changeController(); }).not.toThrow();
    expect(reload).toHaveBeenCalledTimes(1);
  });

  test('a stale tab whose Refresh is clicked repeatedly reloads once, even when sessionStorage is blocked or missing', () => {
    for (const storage of [null, { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); } }]) {
      const { controller, container, reload } = waitingSetup({ storage });
      container.changeController(); // another tab updated
      expect(controller.getState().status).toBe(S.STALE);
      controller.refresh();
      controller.refresh();
      controller.refresh();
      expect(reload).toHaveBeenCalledTimes(1);
    }
  });

  test('with no storage at all the page still reloads at most once', () => {
    const { controller, container, reload } = waitingSetup({ storage: null });
    controller.refresh();
    container.changeController();
    container.changeController();
    expect(reload).toHaveBeenCalledTimes(1);
  });

  test('if the controller never changes the apply times out with a clear message, nothing reloads, and the visitor can retry', () => {
    const { controller, container, waiting, reload } = waitingSetup();
    controller.refresh();
    jest.advanceTimersByTime(APPLY_TIMEOUT_MS + 1);
    expect(controller.getState().status).toBe(S.ERROR);
    expect(controller.getState().message).toMatch(/close other tabs/i);
    expect(reload).not.toHaveBeenCalled();
    controller.refresh(); // retry
    expect(waiting.postMessage).toHaveBeenCalledTimes(2);
    container.changeController();
    expect(reload).toHaveBeenCalledTimes(1);
  });

  test('a successful apply cancels the timeout (no late error after the reload was requested)', () => {
    const { controller, container } = waitingSetup();
    controller.refresh();
    container.changeController();
    jest.advanceTimersByTime(APPLY_TIMEOUT_MS * 5);
    expect(controller.getState().status).toBe(S.APPLYING);
    expect(controller.getState().message).toBeNull();
  });
});

describe('multiple tabs', () => {
  test('tab A applies: A reloads once; tab B (sharing the worker) is told to refresh but does NOT reload until its visitor clicks', () => {
    const container = makeContainer();
    const mk = () => {
      const ctx = setup({ container });
      const waiting = makeWorker('installed');
      ctx.controller.attach(makeRegistration({ waiting }));
      return { ...ctx, waiting };
    };
    const A = mk();
    const B = mk();
    expect(A.controller.getState().status).toBe(S.AVAILABLE);
    expect(B.controller.getState().status).toBe(S.AVAILABLE);
    A.controller.refresh();
    container.changeController(); // the shared worker took over: every tab sees it
    expect(A.reload).toHaveBeenCalledTimes(1);
    expect(B.reload).not.toHaveBeenCalled();
    expect(B.controller.getState().status).toBe(S.STALE);
    B.controller.refresh();
    expect(B.reload).toHaveBeenCalledTimes(1);
    expect(B.waiting.postMessage).not.toHaveBeenCalled(); // B never needed to message the worker
  });
});

describe('update checks (visibility only, throttled, no polling)', () => {
  test('a tab becoming visible checks for an update at most once per interval; hidden tabs and early returns do not', async () => {
    const { registration, doc, clock } = waitingSetup();
    doc.show();
    expect(registration.update).not.toHaveBeenCalled(); // registering just checked; wait one interval
    clock.t += CHECK_INTERVAL_MS - MIN;
    doc.hide(); doc.show();
    expect(registration.update).not.toHaveBeenCalled();
    clock.t += 2 * MIN;
    doc.hide();
    expect(registration.update).not.toHaveBeenCalled(); // hiding never checks
    doc.show();
    expect(registration.update).toHaveBeenCalledTimes(1);
    clock.t += 5 * MIN;
    doc.hide(); doc.show();
    expect(registration.update).toHaveBeenCalledTimes(1);
    clock.t += CHECK_INTERVAL_MS;
    doc.hide(); doc.show();
    expect(registration.update).toHaveBeenCalledTimes(2);
    await Promise.resolve();
  });

  test('no timer or interval is ever created for polling', () => {
    const { doc, clock } = waitingSetup();
    for (let i = 0; i < 20; i += 1) { clock.t += 3 * 60 * MIN; doc.hide(); doc.show(); }
    expect(jest.getTimerCount()).toBe(0);
    const src = fs.readFileSync(path.join(__dirname, 'swUpdate.js'), 'utf8');
    expect(/setInterval/.test(src.split('\n').filter((l) => !/^\s*(\*|\/\/|\/\*)/.test(l)).join('\n'))).toBe(false);
  });

  test('offline: no check is attempted (and offline use stays quiet); back online, the next visibility check runs', () => {
    const { registration, doc, clock, online } = waitingSetup();
    clock.t += 2 * CHECK_INTERVAL_MS;
    online.value = false;
    doc.show();
    expect(registration.update).not.toHaveBeenCalled();
    online.value = true;
    doc.hide(); doc.show();
    expect(registration.update).toHaveBeenCalledTimes(1);
  });

  test('a failing update check is swallowed, logged quietly, leaves the state alone, and backs off exponentially', async () => {
    const { controller, registration, clock, logger } = waitingSetup();
    registration.update.mockRejectedValueOnce(new Error('network down'));
    clock.t += CHECK_INTERVAL_MS + 1;
    const first = await controller.checkForUpdate();
    expect(first).toBe(false);
    expect(logger.debug).toHaveBeenCalled();
    expect(controller.getState().status).toBe(S.AVAILABLE); // an unrelated available update is unaffected
    clock.t += CHECK_INTERVAL_MS + 1; // one normal interval is no longer enough after a failure
    expect(await controller.checkForUpdate()).toBe(false);
    expect(registration.update).toHaveBeenCalledTimes(1);
    clock.t += CHECK_INTERVAL_MS; // two intervals since the failure
    expect(await controller.checkForUpdate()).toBe(true);
    expect(registration.update).toHaveBeenCalledTimes(2);
    clock.t += CHECK_INTERVAL_MS + 1; // success reset the back-off
    expect(await controller.checkForUpdate()).toBe(true);
    expect(registration.update).toHaveBeenCalledTimes(3);
  });

  test('update() throwing synchronously is handled too', async () => {
    const { controller, registration, clock } = waitingSetup();
    registration.update.mockImplementationOnce(() => { throw new Error('boom'); });
    clock.t += CHECK_INTERVAL_MS + 1;
    await expect(controller.checkForUpdate()).resolves.toBe(false);
  });

  test('no check while an update is being applied, or after another tab already updated', async () => {
    const a = waitingSetup();
    a.controller.refresh();
    a.clock.t += 5 * CHECK_INTERVAL_MS;
    await a.controller.checkForUpdate();
    expect(a.registration.update).not.toHaveBeenCalled();
    const b = waitingSetup();
    b.container.changeController();
    b.clock.t += 5 * CHECK_INTERVAL_MS;
    await b.controller.checkForUpdate();
    expect(b.registration.update).not.toHaveBeenCalled();
  });

  test('destroy() removes every listener: later visibility or controller events do nothing', () => {
    const { controller, registration, doc, container, clock, reload } = waitingSetup();
    controller.destroy();
    clock.t += 3 * CHECK_INTERVAL_MS;
    doc.show();
    container.changeController();
    expect(registration.update).not.toHaveBeenCalled();
    expect(reload).not.toHaveBeenCalled();
  });
});

describe('wiring and safety (static)', () => {
  const read = (rel) => fs.readFileSync(path.join(__dirname, rel), 'utf8').replace(/\r\n/g, '\n');
  const code = (rel) => read(rel).split('\n').filter((l) => !/^\s*(\*|\/\/|\/\*)/.test(l)).join('\n');

  test('the page registers with the update controller and never calls skipWaiting itself', () => {
    const index = code('index.js');
    expect(index.includes('serviceWorkerRegistration.register({ onRegistration: swUpdate.attach });')).toBe(true);
    expect(/skipWaiting|SKIP_WAITING/.test(index)).toBe(false);
    expect(read('serviceWorkerRegistration.js').includes('config.onRegistration(registration)')).toBe(true);
  });

  test('SKIP_WAITING is posted from exactly ONE place in the app (the visitor-click path), and the worker only skips waiting on that message', () => {
    const files = fs.readdirSync(__dirname).filter((f) => /\.(js|jsx)$/.test(f) && !/\.test\./.test(f));
    const posters = files.filter((f) => /postMessage\(\s*\{\s*type:\s*'SKIP_WAITING'/.test(code(f)));
    expect(posters).toEqual(['swUpdate.js']);
    const sw = code('service-worker.js');
    expect((sw.match(/skipWaiting\(\)/g) || []).length).toBe(1);
    expect(/addEventListener\('message',[\s\S]*SKIP_WAITING[\s\S]*self\.skipWaiting\(\)/.test(sw)).toBe(true);
  });

  test('Workbox precaching, navigation routing and the offline image cache are untouched by the update logic', () => {
    const sw = code('service-worker.js');
    expect(sw.includes('precacheAndRoute(self.__WB_MANIFEST);')).toBe(true);
    expect(sw.includes('createHandlerBoundToURL')).toBe(true);
    expect(sw.includes("cacheName: 'civic-voice-images'")).toBe(true);
    expect(/update\(\)|swUpdate/.test(sw)).toBe(false);
  });

  test('the push-notification worker and registration code are not touched by this change', () => {
    const swUpdateSrc = code('swUpdate.js') + code('UpdatePrompt.js');
    expect(/firebase|fcm|getToken|Notification|firebase-messaging-sw/i.test(swUpdateSrc)).toBe(false);
  });
});
