import fs from 'fs';
import path from 'path';
import {
  FCM_ACTIVATION_TIMEOUT_MS,
  FCM_SW_SCOPE,
  FCM_SW_URL,
  FCM_VAPID_KEY,
  getFcmToken,
  registerFcmWorker,
  waitForActive,
} from './fcmScope';

// ---- small fakes of the service-worker objects (jsdom has none) ------------------------------------------------
class FakeWorker extends EventTarget {
  constructor(state = 'installing', scriptURL = 'http://localhost/firebase-messaging-sw.js') {
    super();
    this.state = state;
    this.scriptURL = scriptURL;
    this.listeners = 0;
  }
  addEventListener(...args) {
    this.listeners += 1;
    super.addEventListener(...args);
  }
  removeEventListener(...args) {
    this.listeners -= 1;
    super.removeEventListener(...args);
  }
  setState(state) {
    this.state = state;
    this.dispatchEvent(new Event('statechange'));
  }
}

class FakeRegistration extends EventTarget {
  constructor({ installing = null, waiting = null, active = null, scope = `http://localhost${FCM_SW_SCOPE}` } = {}) {
    super();
    this.installing = installing;
    this.waiting = waiting;
    this.active = active;
    this.scope = scope;
  }
}

/** A container whose "root" accessors blow up: FCM must never use the registration at `/`. */
function fakeContainer(registration) {
  const forbidden = (name) => () => {
    throw new Error(`navigator.serviceWorker.${name} must not be used for FCM`);
  };
  return {
    register: jest.fn(async () => registration),
    get ready() {
      throw new Error('navigator.serviceWorker.ready must not be used for FCM');
    },
    getRegistration: jest.fn(forbidden('getRegistration')),
    getRegistrations: jest.fn(forbidden('getRegistrations')),
  };
}

const flush = () => new Promise((r) => setTimeout(r, 0));

describe('constants', () => {
  test('dedicated scope is Firebase’s own default, below "/", never the root scope Workbox owns', () => {
    expect(FCM_SW_URL).toBe('/firebase-messaging-sw.js');
    expect(FCM_SW_SCOPE).toBe('/firebase-cloud-messaging-push-scope');
    expect(FCM_SW_SCOPE).not.toBe('/');
    expect(FCM_SW_SCOPE.startsWith('/')).toBe(true);
  });

  test('the public VAPID key is unchanged from the previous call sites (FCM configuration untouched)', () => {
    expect(FCM_VAPID_KEY).toBe('BAuHr-DKvbopzCzk-wVBzlAiYXA0cxuCO_Wq-A3rQJWe2wXwxnVzSk6tuK6VLI0na7kWm9S3Zp6EDud9M_BWvW8');
  });
});

describe('waitForActive', () => {
  afterEach(() => jest.useRealTimers());

  test('resolves at once when the registration already has an activated worker', async () => {
    const reg = new FakeRegistration({ active: new FakeWorker('activated') });
    await expect(waitForActive(reg)).resolves.toBeUndefined();
  });

  test('waits through installing -> installed -> activating -> activated', async () => {
    const worker = new FakeWorker('installing');
    const reg = new FakeRegistration({ installing: worker });
    let resolved = false;
    const p = waitForActive(reg).then(() => {
      resolved = true;
    });
    await flush();
    expect(resolved).toBe(false);

    reg.installing = null;
    reg.waiting = worker;
    worker.setState('installed');
    await flush();
    expect(resolved).toBe(false);

    reg.waiting = null;
    reg.active = worker;
    worker.setState('activating');
    await flush();
    expect(resolved).toBe(false); // an "activating" worker is not yet usable for pushManager.subscribe()

    worker.setState('activated');
    await p;
    expect(resolved).toBe(true);
  });

  test('waits when an active worker exists but is still activating', async () => {
    const worker = new FakeWorker('activating');
    const reg = new FakeRegistration({ active: worker });
    let resolved = false;
    const p = waitForActive(reg).then(() => {
      resolved = true;
    });
    await flush();
    expect(resolved).toBe(false);
    worker.setState('activated');
    await p;
    expect(resolved).toBe(true);
  });

  test('rejects after the timeout when the worker never activates', async () => {
    jest.useFakeTimers();
    const reg = new FakeRegistration({ installing: new FakeWorker('installing') });
    const p = waitForActive(reg, 5000);
    const assertion = expect(p).rejects.toThrow('did not activate within 5000 ms');
    jest.advanceTimersByTime(5000);
    await assertion;
  });

  test('uses a 10 second default timeout', async () => {
    expect(FCM_ACTIVATION_TIMEOUT_MS).toBe(10000);
    jest.useFakeTimers();
    const reg = new FakeRegistration({ installing: new FakeWorker('installing') });
    const p = waitForActive(reg);
    const assertion = expect(p).rejects.toThrow('10000 ms');
    jest.advanceTimersByTime(9999);
    jest.advanceTimersByTime(1);
    await assertion;
  });

  test('rejects when the only worker becomes redundant (installation failed)', async () => {
    const worker = new FakeWorker('installing');
    const reg = new FakeRegistration({ installing: worker });
    const p = waitForActive(reg);
    const assertion = expect(p).rejects.toThrow('no usable worker');
    reg.installing = null;
    worker.setState('redundant');
    await assertion;
  });

  test('rejects immediately when the registration has no worker at all', async () => {
    await expect(waitForActive(new FakeRegistration())).rejects.toThrow('no usable worker');
  });

  test('follows a replacement worker announced through updatefound', async () => {
    const first = new FakeWorker('installing');
    const second = new FakeWorker('installing');
    const reg = new FakeRegistration({ installing: first });
    let resolved = false;
    const p = waitForActive(reg).then(() => {
      resolved = true;
    });
    // the first worker is superseded; a new one is installing on the same registration
    reg.installing = second;
    first.setState('redundant');
    reg.dispatchEvent(new Event('updatefound'));
    await flush();
    expect(resolved).toBe(false);
    reg.installing = null;
    reg.active = second;
    second.setState('activated');
    await p;
    expect(resolved).toBe(true);
  });

  test('removes every listener it added once it settles', async () => {
    const worker = new FakeWorker('installing');
    const reg = new FakeRegistration({ installing: worker });
    const p = waitForActive(reg);
    expect(worker.listeners).toBeGreaterThan(0);
    reg.installing = null;
    reg.active = worker;
    worker.setState('activated');
    await p;
    expect(worker.listeners).toBe(0);
  });
});

describe('registerFcmWorker', () => {
  afterEach(() => jest.useRealTimers());

  test('registers the push worker at the dedicated scope, never at the root scope, and returns that registration', async () => {
    const reg = new FakeRegistration({ active: new FakeWorker('activated') });
    const container = fakeContainer(reg);

    await expect(registerFcmWorker({ serviceWorker: container })).resolves.toBe(reg);

    expect(container.register).toHaveBeenCalledTimes(1);
    expect(container.register).toHaveBeenCalledWith('/firebase-messaging-sw.js', {
      scope: '/firebase-cloud-messaging-push-scope',
    });
    expect(container.register.mock.calls[0][1].scope).not.toBe('/');
  });

  test('does not resolve until the registration is active', async () => {
    const worker = new FakeWorker('installing');
    const reg = new FakeRegistration({ installing: worker });
    const container = fakeContainer(reg);
    let resolved = false;
    const p = registerFcmWorker({ serviceWorker: container }).then((r) => {
      resolved = true;
      return r;
    });
    await flush();
    expect(resolved).toBe(false);
    reg.installing = null;
    reg.active = worker;
    worker.setState('activated');
    await expect(p).resolves.toBe(reg);
  });

  test('never touches navigator.serviceWorker.ready / getRegistration(s) (the registration at "/" is Workbox)', async () => {
    const reg = new FakeRegistration({ active: new FakeWorker('activated') });
    const container = fakeContainer(reg);
    await registerFcmWorker({ serviceWorker: container });
    expect(container.getRegistration).not.toHaveBeenCalled();
    expect(container.getRegistrations).not.toHaveBeenCalled();
  });

  test('a registration failure (e.g. SecurityError, blocked script) is propagated', async () => {
    const container = { register: jest.fn().mockRejectedValue(new Error('SecurityError: script blocked')) };
    await expect(registerFcmWorker({ serviceWorker: container })).rejects.toThrow('SecurityError');
  });

  test('an activation timeout is propagated', async () => {
    jest.useFakeTimers();
    const reg = new FakeRegistration({ installing: new FakeWorker('installing') });
    const container = fakeContainer(reg);
    const p = registerFcmWorker({ serviceWorker: container, timeoutMs: 3000 });
    const assertion = expect(p).rejects.toThrow('did not activate within 3000 ms');
    await Promise.resolve();
    await Promise.resolve();
    jest.advanceTimersByTime(3000);
    await assertion;
  });

  test('throws a clear error when service workers are unavailable', async () => {
    await expect(registerFcmWorker({ serviceWorker: null })).rejects.toThrow('not available');
    await expect(registerFcmWorker({ serviceWorker: {} })).rejects.toThrow('not available');
  });
});

describe('getFcmToken', () => {
  const app = { name: 'test-app' };

  test('passes THE dedicated registration (same object) and the unchanged VAPID key to getToken', async () => {
    const reg = new FakeRegistration({ active: new FakeWorker('activated') });
    const messaging = { id: 'messaging' };
    const getMessaging = jest.fn(() => messaging);
    const getToken = jest.fn().mockResolvedValue('tok-123');
    const registerWorker = jest.fn().mockResolvedValue(reg);

    const token = await getFcmToken(app, { registerWorker, loadMessaging: async () => ({ getMessaging, getToken }) });

    expect(token).toBe('tok-123');
    expect(getMessaging).toHaveBeenCalledWith(app);
    expect(getToken).toHaveBeenCalledTimes(1);
    const [m, options] = getToken.mock.calls[0];
    expect(m).toBe(messaging);
    expect(options.serviceWorkerRegistration).toBe(reg);
    expect(options.vapidKey).toBe(FCM_VAPID_KEY);
  });

  test('does not call getToken until the dedicated registration is active', async () => {
    const worker = new FakeWorker('installing');
    const reg = new FakeRegistration({ installing: worker });
    const container = fakeContainer(reg);
    const getToken = jest.fn().mockResolvedValue('tok');
    const loadMessaging = async () => ({ getMessaging: () => ({}), getToken });

    const p = getFcmToken(app, { registerWorker: () => registerFcmWorker({ serviceWorker: container }), loadMessaging });
    await flush();
    expect(getToken).not.toHaveBeenCalled();

    reg.installing = null;
    reg.active = worker;
    worker.setState('activated');
    await expect(p).resolves.toBe('tok');
    expect(getToken).toHaveBeenCalledTimes(1);
    expect(getToken.mock.calls[0][1].serviceWorkerRegistration).toBe(reg);
  });

  test('a registration failure means the SDK is never asked for a token', async () => {
    const getToken = jest.fn();
    const loadMessaging = jest.fn();
    await expect(
      getFcmToken(app, { registerWorker: jest.fn().mockRejectedValue(new Error('boom')), loadMessaging }),
    ).rejects.toThrow('boom');
    expect(loadMessaging).not.toHaveBeenCalled();
    expect(getToken).not.toHaveBeenCalled();
  });

  test('a getToken failure is propagated', async () => {
    const reg = new FakeRegistration({ active: new FakeWorker('activated') });
    const getToken = jest.fn().mockRejectedValue(new Error('messaging/token-subscribe-failed'));
    await expect(
      getFcmToken(app, {
        registerWorker: async () => reg,
        loadMessaging: async () => ({ getMessaging: () => ({}), getToken }),
      }),
    ).rejects.toThrow('token-subscribe-failed');
  });

  test('with no service-worker support the real helper rejects before the SDK is loaded', async () => {
    const loadMessaging = jest.fn();
    // jsdom has no navigator.serviceWorker
    await expect(getFcmToken(app, { loadMessaging })).rejects.toThrow('not available');
    expect(loadMessaging).not.toHaveBeenCalled();
  });
});

// ---- static guards: the root scope stays Workbox's, and nothing registers FCM on its own ------------------------
const SRC = __dirname;
const read = (...p) => fs.readFileSync(path.join(SRC, ...p), 'utf8');
function sourceFiles(dir = SRC) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) return sourceFiles(full);
    return /\.(js|jsx)$/.test(e.name) && !/\.test\.jsx?$/.test(e.name) ? [full] : [];
  });
}

describe('static guards', () => {
  test('only fcmScope.js refers to the push worker script', () => {
    const offenders = sourceFiles().filter(
      (f) => path.basename(f) !== 'fcmScope.js' && read(path.relative(SRC, f)).includes('firebase-messaging-sw'),
    );
    expect(offenders).toEqual([]);
  });

  test('App.js no longer registers a service worker itself and uses both flows', () => {
    const app = read('App.js');
    expect(app).not.toMatch(/serviceWorker\.register\(/);
    expect(app).not.toMatch(/from 'firebase\/messaging'|import\('firebase\/messaging'\)/);
    expect(app).toMatch(/import \{ runLocationFcmFlow, runNewsNotifFlow \} from '\.\/fcmFlows'/);
    expect(app).toMatch(/const requestFcmToken = \(\) => runLocationFcmFlow\(\{ app \}\)/);
    expect(app).toMatch(/const requestNewsNotif = \(cc\) => runNewsNotifFlow\(\{/);
  });

  test('FCM modules never use navigator.serviceWorker.ready (the "/" registration) and have no import-time effects', () => {
    for (const f of ['fcmScope.js', 'fcmFlows.js']) {
      const code = read(f).replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
      expect(code).not.toMatch(/serviceWorker\.ready|getRegistrations?\(/);
    }
  });

  test('importing the FCM modules registers nothing and requests no permission', () => {
    const register = jest.fn();
    const requestPermission = jest.fn();
    Object.defineProperty(navigator, 'serviceWorker', { configurable: true, value: { register } });
    const prevNotification = global.Notification;
    global.Notification = { requestPermission, permission: 'default' };
    try {
      jest.isolateModules(() => {
        require('./fcmScope');
        require('./fcmFlows');
      });
      expect(register).not.toHaveBeenCalled();
      expect(requestPermission).not.toHaveBeenCalled();
    } finally {
      global.Notification = prevNotification;
      delete navigator.serviceWorker;
    }
  });

  test('the Workbox registration at "/" is untouched: no scope option, own script, no FCM code', () => {
    const reg = read('serviceWorkerRegistration.js');
    expect(reg).toMatch(/\.register\(swUrl\)/);
    expect(reg).toMatch(/\$\{process\.env\.PUBLIC_URL\}\/service-worker\.js/);
    expect(reg).not.toMatch(/scope/);
    const sw = read('service-worker.js');
    expect(sw).not.toMatch(/firebase|messaging|fcm/i);
    expect(sw).toMatch(/precacheAndRoute\(self\.__WB_MANIFEST\)/);
  });

  test('the Firebase SDK imported by the push worker matches the installed firebase package (no version skew)', () => {
    const worker = fs.readFileSync(path.join(SRC, '..', 'public', 'firebase-messaging-sw.js'), 'utf8');
    const versions = [...worker.matchAll(/firebasejs\/(\d+\.\d+\.\d+)\//g)].map((m) => m[1]);
    expect(versions.length).toBeGreaterThan(0);
    // eslint-disable-next-line global-require
    const installed = require('firebase/package.json').version;
    expect(new Set(versions)).toEqual(new Set([installed]));
  });
});
