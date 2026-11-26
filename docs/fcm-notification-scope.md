# Push-notification worker: dedicated service-worker scope (Phase 1)

Status: **draft for review. Not merged, not deployed.** Independent of PR #2 (the "New version available" prompt).

This change fixes one defect: the push worker and the application worker fought over one registration. It does **not**
migrate existing users, does **not** send notifications and does **not** add any sender, topic-subscription or cleanup
logic (none exists; see section 6). Read section 5 before assuming anything about existing subscribers.

---

## 1. The defect

| Worker | Script | Scope before this change |
|---|---|---|
| Application (Workbox, precache + offline) | `/service-worker.js` | `/` |
| Push (Firebase Cloud Messaging) | `/firebase-messaging-sw.js` | `/` (`register()` was called with no scope option) |

A scope has exactly **one** registration with **one** active worker, so the two scripts replaced each other. Observed
in real Chrome (local production builds, throwaway profiles, all external hosts blocked):

- Registering the push worker left it **waiting** next to Workbox; with PR #2's update prompt this shows a false
  "New version available" (and Refresh cannot work: the push worker ignores `SKIP_WAITING`).
- After every tab was closed the push worker became the **active** worker at `/` and controlled the next page load;
  Workbox sat waiting, so there was no precache or offline handling until the visitor refreshed or closed all tabs.

## 2. What this change does

- `src/fcmScope.js` registers `/firebase-messaging-sw.js` at **`/firebase-cloud-messaging-push-scope`** (Firebase's own
  default scope: below `/`, no pages under it, activates immediately, needs no `Service-Worker-Allowed` header).
- It **waits until that specific registration has an activated worker** before returning it. This matters: the
  Firebase SDK does not wait for a registration it is handed (only for its own default one) and
  `pushManager.subscribe()` needs an active worker (`@firebase/messaging` 0.12.x, `updateSwReg`).
- `getToken()` receives **that registration** (`{ serviceWorkerRegistration, vapidKey }`). `navigator.serviceWorker.ready`
  (the registration at `/`, i.e. Workbox) is never used for FCM.
- `src/fcmFlows.js` holds the two **existing** user-initiated flows, moved out of `App.js` with unchanged behaviour:
  - location flow (`requestFcmToken`, after the visitor sets a home region): permission, token, `localStorage.cvFCMToken`,
    no Firestore;
  - news-banner flow (`requestNewsNotif`, banner "Allow" / bell): permission, token, `localStorage.cvFCMToken`, then the
    existing `fcm_tokens/{token}` document `{ token, <topic>: true, ts }` (merge).
- `src/App.js`: both flows delegate to `fcmFlows.js`; nothing else changed.

**Unchanged:** the Workbox registration at `/`, `src/service-worker.js`, `public/firebase-messaging-sw.js`, the
Firebase/FCM configuration and VAPID key (value pinned by a test), Firestore rules and data, notification permission
prompts (same two places, same moment), token storage keys.

**Not added:** any code that runs on page load, automatic token acquisition or refresh, automatic migration, Firestore
writes outside the two existing clicks, new permission requests, a sender, topic subscription.

## 3. Verification

### Automated (CI steps run locally on the final code; GitHub CI runs when the PR is opened)

| Check | Result |
|---|---|
| New unit tests | 43 (`src/fcmScope.test.js` 28, `src/fcmFlows.test.js` 15), all pass |
| Full UI suite (`react-scripts test --watchAll=false`) | 8 suites, 143 tests, all pass (100 existing + 43 new) |
| Engine tests (the five CI scripts) | 75 + 63 + 28 + 24 + 8 passed, 0 failed |
| Production build (`CI=true`, warnings fail the build) | Compiled successfully |
| Deliberate breakages of the implementation | 10 of 10 caught (scope `/`, no activation wait, accepting an "activating" worker, no scope option, wrong registration passed to `getToken`, changed VAPID key, skipped permission check, wrong topic field, dropped `merge`, scope-less `register` reintroduced in `App.js`) |

What the unit tests cover: dedicated-scope registration; waiting through installing/installed/activating/activated;
timeout, redundant worker, no worker, replacement worker, listener cleanup; registration and SDK failures (flows end
silently / log the same warning as before and write nothing); the exact registration object reaching `getToken`; both
flows (permission denied/dismissed, granted, empty token, document shape against the Firestore rules key list, topic
mapping, failed write); static guards (only `fcmScope.js` names the push worker, `App.js` no longer registers a worker,
the Workbox registration and worker are unchanged, no import-time side effects, push-worker SDK version equals the
installed `firebase` version).

### Real Chrome (local production builds, throwaway profiles, every host except localhost and gstatic unresolvable)

The probe imports the **real** `src/fcmScope.js` into the page and calls `registerFcmWorker()`. It never requests
permission, never calls `getToken`, creates no push subscription, touches no Firebase service.

| State | Result |
|---|---|
| **Fresh browser** (build = PR #2 update prompt + this change) | Two registrations: `/` Workbox active and controlling; the dedicated scope push worker active. **No update prompt**, before and after reload and 4 s later. A second call returns the same registration. |
| **Legacy: push worker waiting at `/`** (left by the old code) | The helper does not touch `/`. The leftover still shows the (false) prompt until healed; after a reload it is replaced by an identical Workbox worker, still prompting. One click on Refresh heals it: Workbox active, no prompt, and nothing re-creates it afterwards. |
| **Legacy: push worker active at `/`** | Page controlled by the push worker, Workbox waiting, prompt shown (truthful here). The helper does not touch `/`. Refresh heals it. |
| **This change alone, legacy waiting** (build without the prompt) | Reload, tab close and reopen: Workbox active at `/`, push worker active at its own scope, stable across a second close/reopen. |
| **This change alone, legacy active** | Same: after all tabs are closed and the app reopened, Workbox is active and controls the page. |

**Answer to "do legacy root-scope FCM registrations still cause contention?"** Yes, until they heal, and this change
cannot remove them: a browser keeps whatever it registered earlier. It stops **creating** them. They heal by closing
all tabs of the app and reopening (verified), or by the prompt's Refresh if PR #2 is merged (verified). Nothing in this
change re-creates them.

### Not verified
Real push delivery (no token, no permission and no message were created or sent), any browser other than Chrome
(Firefox, Safari/iOS, Edge, Android WebView untested), the protected Vercel preview, behaviour with several tabs
clicking "Allow" at once, and the behaviour of `getToken` itself (read from the SDK source, not run).

## 4. Relationship to PR #2

Independent code (PR #2 touches `index.js`, `serviceWorkerRegistration.js`, `swUpdate.js`, `UpdatePrompt.js`; this
change touches `App.js` and new FCM modules). The two branches merge without conflicts (checked locally in a
throwaway worktree, not committed). Recommended order: this change first, because it removes the source of PR #2's false
prompt for every new registration. PR #2 would additionally benefit from ignoring any waiting worker whose script is not
the one the app registered (defence in depth for stale tabs running the old bundle); that is **not** part of this change.

## 5. Limitations: existing users are NOT migrated

- Nothing runs on page load. An existing subscriber keeps a push subscription on the **root** registration, whose worker
  is Workbox and has no push handler. Pushes to that subscription are therefore not displayed.
  (Before this change delivery was already unreliable: it worked only in the windows when the push worker happened to be
  the active worker at `/`.)
- An existing subscriber moves to the dedicated scope only when they run one of the two flows again. The banner is not
  offered to someone whose stored status is already "granted", so most existing subscribers will not re-run it. The
  location flow runs when a home region is set.
- When they do re-run a flow, the SDK sees a different subscription, deletes the old FCM registration (errors
  swallowed) and creates a new token. The previous token cannot be recovered. The old `fcm_tokens/{oldToken}`
  document remains (clients cannot read or delete it).
- The location flow stores a token locally only; it has never written a `fcm_tokens` document.
- Two quick clicks can start two concurrent token requests in one tab (as before). There is no lock and no
  `navigator.locks` use: no background work exists to protect.
- Predicted from the SDK source, **not observed** (nothing can be sent without tokens): a push with a `notification`
  payload is displayed by the SDK **and** by the app's `onBackgroundMessage` handler (two notifications); while any
  window is visible the SDK displays nothing and hands the message to the page, where no `onMessage` handler exists
  (message dropped). Neither is changed here.
- Rolling back: revert the PR. Dedicated registrations already created keep working for their own tokens as long as
  `public/firebase-messaging-sw.js` is still served; the reverted code would register at `/` again and create a new token.

## 6. What exists on the backend (verified 2026-11-25)

Evidence: all four local repositories (all branches, full git history for `subscribeToTopic`, `sendEachForMulticast`,
`sendMulticast`, `admin.messaging`, `onDocumentCreated`, `fcm_tokens`), the three public repositories of the GitHub
account, their workflows, the Firebase CLI's read-only `functions:list` and `ext:list` for project `civic-voice-5ea94`.

- **Deployed Cloud Functions:** only `aggregateContractStats`, `aggregateDepartmentSummary`, `aggregateMemberStats`
  (scheduled, `us-central1`). No Firestore trigger. No extension installed.
- **No code anywhere** subscribes a token to a topic, sends a notification, or removes stale tokens.
  Writing `fcm_tokens/{token}` therefore causes **nothing**. The "Cloud Function subscribes the device to the topic"
  comment in the original commit (`877442e`) describes something that was never built.
- `news_alerts` (written by the engine's scheduler) is an in-app feed; nothing turns it into a push message.
- Firestore rules: clients can create and update (key whitelist) but not read or delete `fcm_tokens`.
- **Cannot be ruled out from here:** messages sent by hand from the Firebase console, resources outside the repositories
  and the Firebase CLI's view (Cloud Run, Cloud Scheduler, another machine).

So: tokens are **collected**; no automated sending, topic subscription or token cleanup exists. Do not read the
`canada-news` etc. fields as a working subscription.

## 7. Privacy and compliance records corrected by this PR

The compliance drafts said push tokens are not collected or not deployed. The code collects them after the visitor
grants notification permission. The records were corrected to state the facts (and to flag, not resolve, the open
questions). They are drafts, the corrections are marked as pending owner / legal review, and they make no compliance
determination:

`CV-REG-002` (data map row), `CV-POL-001` (§4.6, §6 purposes, §11), `CV-CHK-002` (PRV-07, CAS-02), `CV-CHK-003` (ID-01
and the FCM row), `CV-SOP-005` (communication-types table), `CV-SEC-001` (addendum to F-005), `CV-RPT-002`
(addendum), `CV-REG-003` (new issue **CV-ISS-021**). `CV-POL-003` §13 was reviewed and needs no change (it says no token
is registered *without* express opt-in, which is accurate).

Open questions recorded in CV-ISS-021, for the owner: no Consent Record is created at opt-in (CV-SOP-005 §11.3); no
in-app way to unsubscribe or delete a token (§11.5); no suppression of tokens whose owner opted out; no deletion or
expiry of `fcm_tokens` documents; whether anything is ever sent manually; what the App Store review note and privacy
labels should say.

## 8. Manual real-device test (optional, to be run by the owner; creates a real token)

Only on a throwaway device or profile, because the push worker configuration is hard-wired to the production Firebase
project (there is no separate project to test against).

1. Use the **location flow** (set a home region): it stores the token locally only and writes no Firestore document.
   Avoid the news banner, which writes `fcm_tokens/{token}` with a topic field into production.
2. DevTools, Application, Service Workers: two registrations (`/` Workbox, `/firebase-cloud-messaging-push-scope` push
   worker), neither waiting.
3. From the Firebase console "Send test message", target **that one FCM registration token** only. Never a topic or a
   condition. Check: background tab and all tabs closed (one or two notifications? the SDK-plus-handler duplicate is
   predicted), foreground tab (nothing shown, predicted), clicking the notification (URL).
4. Remove the token's document in the console if the banner flow was used (clients cannot delete it).
