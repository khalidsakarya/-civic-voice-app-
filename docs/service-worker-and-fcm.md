# Service worker updates and push-notification (FCM) worker — implementation, findings, proposal

Status: **for review. Nothing in this document or PR is merged or deployed.**
This PR implements only the **application-update** part. The notification-worker change is a **proposal** (sections 3–6); no service-worker, Firebase Cloud Messaging, Firestore, or rules code is modified.

---

## 1. What this PR changes (application updates)

### Problem (verified live on 2026-11-03)
The app is precached by Workbox. A new worker installs but stays **waiting** until every tab of the app is closed, and nothing ever sent it `SKIP_WAITING` (`register()` was called with no update handling). Observed on the production origin: the server was serving the new bundle while an existing visitor's active worker kept serving the previous one, with the new worker sitting in the `waiting` state. Returning visitors therefore keep old labels, indefinitely if they keep a tab open.

### Behaviour now
| Situation | Behaviour |
|---|---|
| A waiting worker exists at load, or a new worker finishes installing, **and the page already has a controller** | A small prompt appears: **"New version available — Refresh"** (polite `role="status"` live region, real buttons, visible focus, dismissible). |
| First-ever install (no controller yet) | Not an update: no prompt, no reload (the `clientsClaim` controller change is ignored). |
| Visitor clicks **Refresh** | Only now is `{ type: 'SKIP_WAITING' }` posted to the current waiting worker. The page reloads **once**, when `controllerchange` actually fires. |
| Page load, a timer, a visibility change | **Never** calls `skipWaiting`. There is no timer or interval anywhere. |
| Reload-loop protection | `sessionStorage` timestamp (15 s window) **and** an in-memory once-flag. If a reload just happened, the prompt shows "reload this page manually" instead of reloading again. Works with storage blocked. |
| Another tab applied the update | This tab does **not** reload by itself (it may hold unsaved input). It shows the same prompt and reloads only when its visitor clicks. |
| Tab becomes visible | At most one `registration.update()` per 30 minutes; skipped while offline or while applying; a failure is swallowed (debug log only) and doubles the wait (cap 4 h). |
| Apply does not complete (e.g. an old tab blocks activation) | After 8 s: a clear message ("Close other tabs of this app, then try again") and the button works again. Nothing reloads. |
| Offline | Unchanged: Workbox precache and routing are untouched; update checks are simply skipped. |

### Files
- `src/swUpdate.js` — the controller (pure logic; every browser dependency is injectable).
- `src/UpdatePrompt.js` — the prompt and `mountUpdatePrompt()` (its own React root; `App.js` is untouched).
- `src/serviceWorkerRegistration.js` — +1 line: passes the registration to `config.onRegistration`.
- `src/index.js` — creates the controller, mounts the prompt, registers with `onRegistration`.
- `src/swUpdate.test.js`, `src/UpdatePrompt.test.js` — 40 tests.
- `src/service-worker.js` and `public/firebase-messaging-sw.js` — **unchanged**. (The existing `SKIP_WAITING` message handler in `service-worker.js` is what the click uses.)

### Tests (all pass; 14 deliberate breakages of the controller were each caught)
Waiting-worker detection (present at load, `updatefound`, first install, redundant, none) · user-triggered activation (nothing sent until the click; once only; current waiting worker) · controller changes (reload once after the click; other-tab change does not reload) · reload-loop prevention (guard window, blocked/missing storage, apply timeout and retry) · multiple tabs · update checks (visibility only, throttled, no timers, offline, failure and back-off, sync throw, while applying, `destroy`) · static checks (`SKIP_WAITING` posted from exactly one place; the worker skips waiting only on that message; Workbox precache/routing untouched; no Firebase/FCM code referenced) · the prompt (hidden when idle, accessible status, click activates, "Updating…", error alert, dismiss, keyboard order, separate root).

### Known limitations of this part
- Visitors still on the **old** bundle (which has no update logic) will only receive the prompt after their old worker is replaced once (normally the next time all their tabs are closed). The prompt helps every visit after that.
- The 30-minute interval is a trade-off; the browser also checks on every navigation.
- `controllerchange` can also be caused by DevTools "skip waiting"; in that case the tab shows the prompt (safe) rather than reloading.
- No version number is shown yet (the build version is the constant `1.0.0`); exposing a commit SHA is a follow-up.

---

## 2. FCM architecture findings (read-only investigation)

| Item | Where | Finding |
|---|---|---|
| Notification permission + token (location flow) | `src/App.js:5965` `requestFcmToken`, called from `:6063` and `:6080` after the visitor sets a home region | Asks `Notification.requestPermission()`, registers `/firebase-messaging-sw.js` with **no scope option**, gets a token (`getToken` with `serviceWorkerRegistration`), stores it only in `localStorage` (`cvFCMToken`). **Does not write to Firestore.** |
| Token + topic (news banner) | `src/App.js:5998` `requestNewsNotif(cc)`, triggered from the banner at `:10546` | Same registration (default scope `/`), then `setDoc(doc(db,'fcm_tokens',token), { token, '<topic>': true, ts: serverTimestamp() }, { merge: true })`. Topics: `canada-news`, `us-news`, `uk-news`, `australia-news` (`NEWS_NOTIF_TOPICS`, `:5979`), fallback `general-news`. |
| Persistence | `localStorage`: `cvFCMToken`, `cv_news_notif_status` (per country: granted / denied / skipped), `cv_news_notif_dismissed`; Firestore `fcm_tokens/{token}` | Doc id = token. |
| Firestore schema | Doc fields: `token` (string = doc id), `ts` (timestamp), plus one or more topic booleans | — |
| Security rules | `firestore.rules:215` | `read: false`, `delete: false`; `create` only with keys ⊆ {`token`,`ts`,`canada-news`,`us-news`,`uk-news`,`australia-news`,`general-news`} and `token == tokenId`; `update` with the same key whitelist. **Clients can neither read nor delete tokens.** |
| Background handling | `public/firebase-messaging-sw.js` | Imports Firebase **12.10.0 compat** from gstatic (keep in sync with `package.json` `^12.10.0`); `onBackgroundMessage` always calls `showNotification` (see risks); `notificationclick` opens `event.notification.data?.url ?? '/'`. |
| Foreground handling | — | **None.** No `onMessage` anywhere in `src/`. |
| Existing-permission handling | `src/App.js:2193` | Only reads `Notification.permission` to mark the banner state; the worker/token are **not** re-registered or refreshed on load. |
| **Topic subscription implementation** | — | **NOT FOUND.** The code comment says "Cloud Function subscribe this token", but there is no `functions/` directory, `firebase.json` contains only `firestore` (rules/indexes), there is no `.firebaserc`, and a search of this repo and the sibling repos (`civic-voice-backend`, `civic-voice-engine`, `civic-voice-engine-ca-unemployment`) finds no `subscribeToTopic`, `admin.messaging`, `sendEachForMulticast` or any `fcm_tokens` reader. |
| **Notification sender / Cloud Function** | — | **NOT FOUND** (same search; the only GitHub workflow is `sync-us-executive-orders.yml`, unrelated; `api/` has two unrelated functions). |
| Firebase deployment configuration | `firebase.json`, `firestore.indexes.json`, `firestore.rules` | Firestore rules/indexes only. Whether the rules in the repo match those deployed cannot be verified from here. |

**Limitation:** the sender and the topic-subscription logic live somewhere outside the code I can see (probably a Cloud Function in the Firebase console or a different repository). Nothing below invents or replaces them. Several migration points depend on how they behave and must be confirmed by whoever owns them (section 4).

### Verified: two workers contend for one registration (the consequences below are inferred)
Both `/service-worker.js` (Workbox) and `/firebase-messaging-sw.js` are registered with the default scope `/`. A scope has **one registration** with **one active worker**. Verified on the production origin with the real scripts (no permission prompt, no token, no Firestore writes): after the app's own registration there was one registration (`active: /service-worker.js`); registering `/firebase-messaging-sw.js` left **one** registration (`active: /service-worker.js`, `waiting: /firebase-messaging-sw.js`). The two scripts should therefore take turns as tabs open and close (inferred from how scopes work, not observed over time), so push handling and offline caching cannot reliably coexist, and a push delivered while the Workbox worker is active would not reach Firebase's handler.

### Other risks found
1. **Possible duplicate notifications:** the Firebase SDK displays `notification`-payload messages itself *and* the handler calls `showNotification`. Needs testing with the real sender payload (section 6).
2. **`notificationclick` URL:** for SDK-displayed notifications the link is not in `data.url` (it is under `data.FCM_MSG` / `fcmOptions.link`), so clicks may open `/` instead of the intended page.
3. No token refresh on load; the location flow creates a subscription without a `fcm_tokens` document (so those visitors can never receive topic messages — possibly intended).
4. Tokens cannot be cleaned from the client (rules), so stale tokens accumulate unless the sender prunes `UNREGISTERED` errors.

---

## 3. Proposed notification-worker design (not implemented)

| Aspect | Proposal |
|---|---|
| **Worker script path** | Unchanged: `/firebase-messaging-sw.js` (`public/firebase-messaging-sw.js`). |
| **Dedicated scope** | `/firebase-cloud-messaging-push-scope` (Firebase's own default). It is inside the script's directory, so no `Service-Worker-Allowed` header is needed. The Workbox worker keeps scope `/`. |
| **Registration order** | (1) Page load: Workbox registers, as today. (2) Visitors who have **not** granted permission: nothing at load; on their click → `requestPermission()` → register the messaging worker with `{ scope }` → wait until it is **active** (helper `waitForActive(reg)`) → `getToken`. (3) Visitors who **have** granted permission: after `load` and idle (and after the Workbox registration settles), run the migration/refresh in section 4. |
| **`getToken` registration parameter** | The dedicated registration object returned by `register(script, { scope })` — never `navigator.serviceWorker.ready` (which refers to the `/` registration). |
| **Foreground handling** | Add `onMessage(messaging, handler)` once per page after a token exists. FCM shows nothing while the page is focused, so show a small in-app notice (reusing the style of the update prompt) or call `reg.showNotification`. Product decision needed. |
| **Background handling** | Keep `onBackgroundMessage` in the messaging worker, but (a) avoid double display: only call `showNotification` for **data-only** messages (the SDK shows `notification` payloads), (b) fix `notificationclick` to read the link from `fcmOptions.link` / `data.url`. Both must be validated against the real sender payload. |
| **Existing-token compatibility** | **Old tokens will stop delivering** after the change: their push subscription belongs to the `/` registration, whose worker becomes Workbox-only (no `push` handler), so pushes are dropped. That is the same failure mode as today when Workbox is active, just made permanent. See migration. |
| **Token migration** | On load, when `Notification.permission === 'granted'` and `localStorage.cv_fcm_scope_v2` is unset: register the messaging worker at the dedicated scope, `getToken` → new token **T2**. If `T2 !== cvFCMToken` (old **T1**): if `cv_news_notif_status` shows a granted country, `setDoc(fcm_tokens/T2, { token, '<country topic>': true, ts }, { merge: true })` (topics reconstructed from local state, because rules deny reading the old document); store `cvFCMToken = T2`, keep T1 in `cvFCMTokenLegacy` (never sent), set `cv_fcm_scope_v2 = 1`. Visitors who never had a `fcm_tokens` document do not get one. Failed registration leaves everything as it was and retries next load (capped). |
| **Cleanup** | Existing token documents are **not deleted** by this proposal. Phase 2 (optional, after T2 is persisted): unsubscribe the legacy push subscription on the `/` registration so T1 becomes `UNREGISTERED` deterministically; the sender (or a TTL on `ts`) then prunes it. Never unsubscribe before T2 is stored. |
| **Rules compatibility** | No change needed: T2 is a normal new document (`token == tokenId`, allowed keys). Reads/deletes stay denied. |
| **FCM configuration** | No change to the Firebase project, VAPID key, or web-push certificate. The sender must treat T2 like any new token; if topic subscription is a Firestore trigger on `fcm_tokens` create it works automatically; if it is a batch job it must read the same collection. **Both must be confirmed with the owner of the missing backend code.** |
| **Alternative (fallback)** | Merge instead of split: `importScripts` the Firebase messaging handler inside the Workbox worker so one registration at `/` serves both. Old tokens keep working and no migration is needed, but a messaging error could take down the offline worker and both release cycles couple. Recommended only if the migration proves inadequate. |
| **Rollback** | Revert the PR. The dedicated-scope registration stays in browsers that already created it and keeps delivering to its own token; the next app version registers at `/` again and creates a fresh token. To clean up deliberately, ship a version that unregisters scope `/firebase-cloud-messaging-push-scope`. Nothing in Firestore needs to be rolled back (no documents are deleted or rewritten). The update-prompt part has no persisted state except a `sessionStorage` key and reverts cleanly. |

---

## 4. Constraints for any production use of this plan
- **Do not delete existing token documents. Do not send production notifications. Do not subscribe production users to topics.** The migration code must not run for users who have not granted permission.
- The sender/subscription code must be located and reviewed before the migration is merged.

---

## 5. Manual test plan (throwaway profile, test token only)

**Setup.** A fresh browser profile (e.g. `chrome --user-data-dir=%TEMP%\cv-fcm-test`), normal (non-incognito) window so notifications can be granted, served from a **PR preview or a local production build on `http://localhost`** (a secure context). Use a **separate Firebase project if one exists**. If not, the test will write a token document to the production `fcm_tokens` collection: use a throwaway device, avoid the news-banner flow (it adds a topic field that the unknown backend may subscribe to the real `canada-news` topic), or write a document with **no topic field**; remove the test document in the Firebase console afterwards (clients cannot delete). **Send test messages only from the Firebase console "Send test message" to the specific FCM registration token of the throwaway profile. Never target a topic or a condition.**

| # | Scenario | Steps | Expected |
|---|---|---|---|
| 1 | Baseline (before the change) | On `main`: grant permission, record `navigator.serviceWorker.getRegistrations()` (scope, active, waiting) and the token; send a targeted test message foreground and background | Documents today's behaviour; confirms the single `/` registration and which worker handles pushes |
| 2 | First-time permission | After the change: fresh profile, trigger the flow, grant | Two registrations: `/` (Workbox) and the dedicated scope (messaging worker, active); a token returned using the dedicated registration |
| 3 | Permission already granted | Profile with permission granted and an old (T1) token in `localStorage`; load the new build | Migration runs once at idle: T2 obtained and stored (`cvFCMToken`), `cv_fcm_scope_v2 = 1`, T1 kept as legacy; no second run on reload |
| 4 | New token persistence | After 2/3 (with `cv_news_notif_status` granted) | `fcm_tokens/{T2}` exists with `token`, `ts`, and only the intended topic field(s); no write for a visitor who never had a document |
| 5 | Foreground delivery | Page focused; send a targeted test message to T2 | In-app notice (or the chosen foreground behaviour); no duplicate |
| 6 | Background delivery | Page in a background tab, then all tabs closed; send a targeted message | One OS notification (verify **no duplicate**); click opens the intended URL (verify the link handling) |
| 7 | Browser restart | Quit and reopen the browser | Registrations persist; messages still delivered; no repeated token churn |
| 8 | Multiple tabs | Two tabs open; deliver a message; apply an update in one | One notification; the other tab shows the refresh prompt and does not reload by itself |
| 9 | Application update prompt | Serve build A, open the app; serve build B; wait/trigger a visibility check | "New version available — Refresh" appears; no activation before the click; after the click one reload and the new bundle runs; Dismiss hides it |
| 10 | Offline behaviour | Go offline (DevTools Network → Offline) and reload | App loads from the precache; no errors from update checks; prompt logic silent |
| 11 | Old-token compatibility | Send a targeted test message to the legacy token **T1** after migration | Documented outcome (expected: not delivered, or `UNREGISTERED` after Phase 2); no crash; T2 unaffected |
| 12 | Failed registration recovery | Block `/firebase-messaging-sw.js` (DevTools request blocking) or go offline during the flow, then restore | App works; old state untouched; the next load retries; no partial documents |
| 13 | Rollback | Load the previous build in the same profile | App works; the dedicated registration persists; no errors |

---

## 6. Rollback plan (this PR)
- **Application-update part:** revert the PR. Behaviour returns to today's (no prompt). No data, Firestore, rules or worker changes are involved.
- **Notification part:** not implemented, nothing to roll back.
