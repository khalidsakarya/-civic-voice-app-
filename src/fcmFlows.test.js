import {
  DEFAULT_NEWS_TOPIC,
  FCM_TOKENS_COLLECTION,
  FCM_TOKEN_STORAGE_KEY,
  NEWS_NOTIF_TOPICS,
  runLocationFcmFlow,
  runNewsNotifFlow,
} from './fcmFlows';
import { FCM_SW_SCOPE, FCM_VAPID_KEY } from './fcmScope';

// The Firebase SDK is never loaded for real: no token is created, nothing reaches Firebase.
const mockGetMessaging = jest.fn(() => ({ id: 'messaging' }));
const mockGetToken = jest.fn();
jest.mock('firebase/messaging', () => ({
  getMessaging: (...a) => mockGetMessaging(...a),
  getToken: (...a) => mockGetToken(...a),
}));

class FakeWorker extends EventTarget {
  constructor(state) {
    super();
    this.state = state;
  }
  setState(state) {
    this.state = state;
    this.dispatchEvent(new Event('statechange'));
  }
}

/** A service-worker container whose registration activates only when `activate()` is called. */
function containerWithRegistration({ activateImmediately = true } = {}) {
  const worker = new FakeWorker(activateImmediately ? 'activated' : 'installing');
  const registration = Object.assign(new EventTarget(), {
    scope: `http://localhost${FCM_SW_SCOPE}`,
    installing: activateImmediately ? null : worker,
    waiting: null,
    active: activateImmediately ? worker : null,
  });
  return {
    registration,
    activate() {
      registration.installing = null;
      registration.active = worker;
      worker.setState('activated');
    },
    container: {
      register: jest.fn(async () => registration),
      get ready() {
        throw new Error('navigator.serviceWorker.ready must not be used for FCM');
      },
    },
  };
}

function installContainer(container) {
  Object.defineProperty(navigator, 'serviceWorker', { configurable: true, value: container });
}

const flush = () => new Promise((r) => setTimeout(r, 0));
const app = { name: 'civic-app' };
const memoryStorage = () => {
  const data = {};
  return { data, setItem: jest.fn((k, v) => { data[k] = v; }) };
};

afterEach(() => {
  delete navigator.serviceWorker;
  mockGetMessaging.mockClear();
  mockGetToken.mockReset();
});

describe('location flow (requestFcmToken)', () => {
  test('permission denied or dismissed: nothing is registered, no token, nothing stored', async () => {
    const { container } = containerWithRegistration();
    installContainer(container);
    const storage = memoryStorage();
    for (const answer of ['denied', 'default']) {
      await runLocationFcmFlow({ app, requestPermission: async () => answer, storage: () => storage });
    }
    expect(container.register).not.toHaveBeenCalled();
    expect(mockGetToken).not.toHaveBeenCalled();
    expect(storage.setItem).not.toHaveBeenCalled();
  });

  test('permission granted: dedicated-scope registration, token obtained with THAT registration, stored in localStorage only', async () => {
    const { container, registration } = containerWithRegistration();
    installContainer(container);
    mockGetToken.mockResolvedValue('tok-location');
    const storage = memoryStorage();

    await runLocationFcmFlow({ app, requestPermission: async () => 'granted', storage: () => storage });

    expect(container.register).toHaveBeenCalledTimes(1);
    expect(container.register).toHaveBeenCalledWith('/firebase-messaging-sw.js', { scope: FCM_SW_SCOPE });
    expect(mockGetMessaging).toHaveBeenCalledWith(app);
    expect(mockGetToken.mock.calls[0][1]).toEqual({ serviceWorkerRegistration: registration, vapidKey: FCM_VAPID_KEY });
    expect(storage.data).toEqual({ [FCM_TOKEN_STORAGE_KEY]: 'tok-location' });
  });

  test('requests permission exactly once, and only then touches the service worker', async () => {
    const { container } = containerWithRegistration();
    installContainer(container);
    mockGetToken.mockResolvedValue('t');
    const order = [];
    const requestPermission = jest.fn(async () => {
      order.push('permission');
      return 'granted';
    });
    container.register.mockImplementation(async () => {
      order.push('register');
      return containerWithRegistration().registration;
    });
    await runLocationFcmFlow({ app, requestPermission, storage: () => memoryStorage() });
    expect(requestPermission).toHaveBeenCalledTimes(1);
    expect(order).toEqual(['permission', 'register']);
  });

  test('waits for the dedicated registration to be active before asking the SDK for a token', async () => {
    const { container, activate } = containerWithRegistration({ activateImmediately: false });
    installContainer(container);
    mockGetToken.mockResolvedValue('tok-late');
    const storage = memoryStorage();

    const p = runLocationFcmFlow({ app, requestPermission: async () => 'granted', storage: () => storage });
    await flush();
    expect(container.register).toHaveBeenCalledTimes(1);
    expect(mockGetToken).not.toHaveBeenCalled();
    expect(storage.setItem).not.toHaveBeenCalled();

    activate();
    await p;
    expect(mockGetToken).toHaveBeenCalledTimes(1);
    expect(storage.data[FCM_TOKEN_STORAGE_KEY]).toBe('tok-late');
  });

  test('errors are silent and leave nothing stored (registration failure, activation timeout, SDK failure, throwing permission)', async () => {
    const storage = memoryStorage();
    const run = (over) => runLocationFcmFlow({ app, requestPermission: async () => 'granted', storage: () => storage, ...over });

    installContainer({ register: jest.fn().mockRejectedValue(new Error('SecurityError')) });
    await expect(run()).resolves.toBeUndefined();

    jest.useFakeTimers();
    const slow = containerWithRegistration({ activateImmediately: false });
    installContainer(slow.container);
    const pending = run();
    await Promise.resolve();
    await Promise.resolve();
    jest.advanceTimersByTime(10000);
    await expect(pending).resolves.toBeUndefined();
    jest.useRealTimers();

    installContainer(containerWithRegistration().container);
    mockGetToken.mockRejectedValue(new Error('messaging/failed'));
    await expect(run()).resolves.toBeUndefined();

    await expect(run({ requestPermission: async () => { throw new Error('no Notification API'); } })).resolves.toBeUndefined();

    expect(storage.setItem).not.toHaveBeenCalled();
  });

  test('an empty token stores nothing; unsupported browsers fail silently', async () => {
    installContainer(containerWithRegistration().container);
    mockGetToken.mockResolvedValue('');
    const storage = memoryStorage();
    await runLocationFcmFlow({ app, requestPermission: async () => 'granted', storage: () => storage });
    expect(storage.setItem).not.toHaveBeenCalled();

    delete navigator.serviceWorker;
    await expect(
      runLocationFcmFlow({ app, requestPermission: async () => 'granted', storage: () => storage }),
    ).resolves.toBeUndefined();
  });

  test('never writes to Firestore (the flow has no Firestore dependency at all)', async () => {
    installContainer(containerWithRegistration().container);
    mockGetToken.mockResolvedValue('t');
    // would throw if the flow tried to use a firestore dependency
    await expect(
      runLocationFcmFlow({ app, requestPermission: async () => 'granted', storage: () => memoryStorage() }),
    ).resolves.toBeUndefined();
  });
});

describe('news banner flow (requestNewsNotif)', () => {
  const makeFirestore = () => {
    const doc = jest.fn((db, collection, id) => ({ db, collection, id }));
    const setDoc = jest.fn().mockResolvedValue(undefined);
    const serverTimestamp = jest.fn(() => 'SERVER_TS');
    return { db: { name: 'db' }, doc, setDoc, serverTimestamp };
  };

  test('permission denied: banner state becomes "denied", no registration, no token, no document', async () => {
    const { container } = containerWithRegistration();
    installContainer(container);
    const firestore = makeFirestore();
    const onStatus = jest.fn();
    const storage = memoryStorage();

    await runNewsNotifFlow({ cc: 'CA', app, firestore, onStatus, requestPermission: async () => 'denied', storage: () => storage });

    expect(onStatus).toHaveBeenCalledTimes(1);
    expect(onStatus).toHaveBeenCalledWith('denied');
    expect(container.register).not.toHaveBeenCalled();
    expect(mockGetToken).not.toHaveBeenCalled();
    expect(firestore.setDoc).not.toHaveBeenCalled();
    expect(storage.setItem).not.toHaveBeenCalled();
  });

  test('permission granted: dedicated scope, token via that registration, stored locally, existing fcm_tokens document, status "granted"', async () => {
    const { container, registration } = containerWithRegistration();
    installContainer(container);
    mockGetToken.mockResolvedValue('tok-news');
    const firestore = makeFirestore();
    const onStatus = jest.fn();
    const storage = memoryStorage();

    await runNewsNotifFlow({ cc: 'CA', app, firestore, onStatus, requestPermission: async () => 'granted', storage: () => storage });

    expect(container.register).toHaveBeenCalledWith('/firebase-messaging-sw.js', { scope: FCM_SW_SCOPE });
    expect(mockGetToken.mock.calls[0][1].serviceWorkerRegistration).toBe(registration);
    expect(storage.data).toEqual({ [FCM_TOKEN_STORAGE_KEY]: 'tok-news' });
    expect(firestore.doc).toHaveBeenCalledWith(firestore.db, FCM_TOKENS_COLLECTION, 'tok-news');
    expect(firestore.setDoc).toHaveBeenCalledTimes(1);
    expect(firestore.setDoc).toHaveBeenCalledWith(
      { db: firestore.db, collection: 'fcm_tokens', id: 'tok-news' },
      { token: 'tok-news', 'canada-news': true, ts: 'SERVER_TS' },
      { merge: true },
    );
    expect(onStatus).toHaveBeenCalledWith('granted');
  });

  test('the stored document keeps exactly the fields Firestore rules allow (token, ts, one topic boolean)', async () => {
    installContainer(containerWithRegistration().container);
    mockGetToken.mockResolvedValue('t1');
    const allowed = new Set(['token', 'ts', 'canada-news', 'us-news', 'uk-news', 'australia-news', 'general-news']);
    for (const cc of ['CA', 'US', 'UK', 'AU', 'ZZ']) {
      const firestore = makeFirestore();
      await runNewsNotifFlow({ cc, app, firestore, onStatus: jest.fn(), requestPermission: async () => 'granted', storage: () => memoryStorage() });
      const data = firestore.setDoc.mock.calls[0][1];
      expect(Object.keys(data).every((k) => allowed.has(k))).toBe(true);
      expect(Object.keys(data)).toHaveLength(3);
      expect(data.token).toBe('t1');
    }
  });

  test('topic mapping is unchanged (CA/US/UK/AU, anything else falls back to general-news)', async () => {
    expect(NEWS_NOTIF_TOPICS).toEqual({ CA: 'canada-news', US: 'us-news', UK: 'uk-news', AU: 'australia-news' });
    expect(DEFAULT_NEWS_TOPIC).toBe('general-news');
    installContainer(containerWithRegistration().container);
    mockGetToken.mockResolvedValue('t');
    const firestore = makeFirestore();
    await runNewsNotifFlow({ cc: 'FR', app, firestore, onStatus: jest.fn(), requestPermission: async () => 'granted', storage: () => memoryStorage() });
    expect(firestore.setDoc.mock.calls[0][1]['general-news']).toBe(true);
  });

  test('waits for activation: no token and no document until the dedicated registration is active', async () => {
    const { container, activate } = containerWithRegistration({ activateImmediately: false });
    installContainer(container);
    mockGetToken.mockResolvedValue('tok-wait');
    const firestore = makeFirestore();
    const onStatus = jest.fn();

    const p = runNewsNotifFlow({ cc: 'CA', app, firestore, onStatus, requestPermission: async () => 'granted', storage: () => memoryStorage() });
    await flush();
    expect(mockGetToken).not.toHaveBeenCalled();
    expect(firestore.setDoc).not.toHaveBeenCalled();
    expect(onStatus).not.toHaveBeenCalled();

    activate();
    await p;
    expect(firestore.setDoc).toHaveBeenCalledTimes(1);
    expect(onStatus).toHaveBeenCalledWith('granted');
  });

  test('registration failure / activation timeout / SDK failure: warning logged, no document, status NOT set to granted', async () => {
    const run = async (setup) => {
      setup();
      const firestore = makeFirestore();
      const onStatus = jest.fn();
      const logger = { warn: jest.fn() };
      const storage = memoryStorage();
      await runNewsNotifFlow({ cc: 'CA', app, firestore, onStatus, logger, requestPermission: async () => 'granted', storage: () => storage });
      return { firestore, onStatus, logger, storage };
    };

    let r = await run(() => installContainer({ register: jest.fn().mockRejectedValue(new Error('SecurityError')) }));
    expect(r.logger.warn).toHaveBeenCalledWith('[NewsNotif] FCM setup failed:', 'SecurityError');
    expect(r.firestore.setDoc).not.toHaveBeenCalled();
    expect(r.onStatus).not.toHaveBeenCalled();
    expect(r.storage.setItem).not.toHaveBeenCalled();

    r = await run(() => {
      installContainer(containerWithRegistration().container);
      mockGetToken.mockRejectedValue(new Error('messaging/token-subscribe-failed'));
    });
    expect(r.logger.warn).toHaveBeenCalledTimes(1);
    expect(r.firestore.setDoc).not.toHaveBeenCalled();
    expect(r.onStatus).not.toHaveBeenCalled();

    jest.useFakeTimers();
    const slow = containerWithRegistration({ activateImmediately: false });
    installContainer(slow.container);
    const firestore = makeFirestore();
    const onStatus = jest.fn();
    const logger = { warn: jest.fn() };
    const pending = runNewsNotifFlow({ cc: 'CA', app, firestore, onStatus, logger, requestPermission: async () => 'granted', storage: () => memoryStorage() });
    await Promise.resolve();
    await Promise.resolve();
    jest.advanceTimersByTime(10000);
    await pending;
    jest.useRealTimers();
    expect(logger.warn.mock.calls[0][1]).toMatch(/did not activate/);
    expect(firestore.setDoc).not.toHaveBeenCalled();
    expect(onStatus).not.toHaveBeenCalled();
  });

  test('a failed Firestore write keeps today’s behaviour: token already stored locally, warning logged, status not granted (the banner stays, so the visitor can retry)', async () => {
    installContainer(containerWithRegistration().container);
    mockGetToken.mockResolvedValue('tok-write-fails');
    const firestore = makeFirestore();
    firestore.setDoc.mockRejectedValue(new Error('permission-denied'));
    const onStatus = jest.fn();
    const logger = { warn: jest.fn() };
    const storage = memoryStorage();

    await runNewsNotifFlow({ cc: 'CA', app, firestore, onStatus, logger, requestPermission: async () => 'granted', storage: () => storage });

    expect(storage.data[FCM_TOKEN_STORAGE_KEY]).toBe('tok-write-fails');
    expect(logger.warn).toHaveBeenCalledWith('[NewsNotif] FCM setup failed:', 'permission-denied');
    expect(onStatus).not.toHaveBeenCalled();
  });

  test('an empty token writes no document but still reports "granted" (unchanged behaviour)', async () => {
    installContainer(containerWithRegistration().container);
    mockGetToken.mockResolvedValue('');
    const firestore = makeFirestore();
    const onStatus = jest.fn();
    await runNewsNotifFlow({ cc: 'CA', app, firestore, onStatus, requestPermission: async () => 'granted', storage: () => memoryStorage() });
    expect(firestore.setDoc).not.toHaveBeenCalled();
    expect(onStatus).toHaveBeenCalledWith('granted');
  });
});
