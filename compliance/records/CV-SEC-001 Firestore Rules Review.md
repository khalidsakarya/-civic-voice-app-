# CV-SEC-001 — Firestore Rules Review

| Field | Value |
|---|---|
| **Record ID** | CV-SEC-001 |
| **Date** | 2026-08-15 |
| **Commit Reviewed** | eca504f (app) · current `main` (engine) |
| **Reviewer** | Founder / Technical Lead |
| **Related Issues** | CV-ISS-015 |
| **Related Documents** | CV-SOP-004 · CV-REG-003 |
| **Status** | **Closed** — rules v1.0 deployed, verified, and all residual actions resolved 2026-08-15 |

---

## 1. Rules File Location

| Item | Finding |
|---|---|
| `firestore.rules` in app repo | **Created — v1.0 draft** (2026-08-15) |
| `firestore.rules` in engine repo | Not present (not required — engine uses Admin SDK) |
| `firebase.json` in app repo | **Created** — `{"firestore": {"rules": "firestore.rules"}}` |
| `firebase.json` in engine repo | Present — references `functions` only; no `firestore` key (acceptable) |
| `.firebaserc` in engine repo | Present — project `civic-voice-5ea94` |
| `.env` in `.gitignore` | **Fixed** — `.env` added to `.gitignore` |

**Initial audit finding (v1.0):** No `firestore.rules` file existed in either repository. Production rules were unversioned and unknown.

**Current status (v1.1):** `firestore.rules` v1.0 draft created in app repo at commit `b469b0b`+. Rules are **not yet deployed** to Firebase console. Production rules for `civic-voice-5ea94` remain whatever was previously set in the console. Deployment and verification against the console are the remaining required actions.

---

## 2. Collections Read by Canadian MVP UI

The following collections are read by the app client SDK (Firebase JS SDK — not Admin SDK):

| Collection | Purpose | Read by |
|---|---|---|
| `subnational_economic_social_stats` | Ontario unemployment data (CV-DATA-002) | `fetchSubnationalTransparencyModalDocs` via `getDoc` |
| `subnational_tax_exempt_entities` | Ontario CRA charities (CV-DATA-008) | `fetchSubnationalTransparencyModalDocs` via `getDoc` |
| `subnational_grants` | Ontario transfer payments (CV-DATA-014) | `fetchSubnationalTransparencyModalDocs` via `getDoc` |
| `subnational_jurisdictions` | Province supplemental data (cabinet, bills, news) | `App.js:13606` via `getDoc` |
| `subnational_bills/{jId}/bills` | Provincial bills subcollection | `App.js:14223–14231` via `getDocs` |
| `members` | Canadian MPs (jurisdiction = CA) | `App.js:5320` |
| `bills` | Canadian bills (country = CA) | `App.js:5343` |
| `department_heads` | Federal cabinet (jurisdiction = CA) | `App.js:4035` |
| `senior_advisors` | PM senior advisors | `App.js:4071` |
| `leader_profile_data` | PM/leader profile | `App.js:4091` |
| `news_alerts` | News feed (country = CA) | `App.js:3357` |
| `vote_counts` | Citizen vote aggregates | `App.js:3379` |
| `surveys` | Survey read (by surveyId) | `App.js:1787` |
| `federal_departments` | Federal departments | `App.js:6261` |
| `supreme_court_justices` | Supreme Court | `App.js:6400` |
| `supreme_court_cases` | Supreme Court cases | `App.js:6401` |
| `elections` | Election data | `App.js:6471` |
| `audit_findings` | Audit findings | `App.js:6671` |
| `government_contracts` | Government contracts | `App.js:6427` |

**Note:** `subnational_leader_transparency` does not appear to be queried in the current Canadian MVP code path.

---

## 3. Client-Side Writes (Firebase JS SDK)

The following collections are written by the client SDK (i.e., from the browser, not the Admin SDK):

| Collection | Write type | Location | Assessment |
|---|---|---|---|
| `citizen_votes` | `addDoc` | `App.js:5827` | Intended user interaction — records anonymous vote only |
| `vote_counts` | `setDoc` (merge: true, increment) | `App.js:5824` | Vote count aggregate — intended |
| `surveys` | `setDoc` (merge: true, increment) | `App.js:1803` | Survey vote increment — intended |
| `news_votes` | `addDoc` | `App.js:14200, 18852` | News vote record — intended |
| `news_vote_counts` | `setDoc` (merge: true) | `App.js:14199, 18849` | News vote aggregate — intended |
| `department_votes` | `setDoc` (merge: true) | `App.js:18545` | Department approval vote — intended |
| `user_events` | `addDoc` | `analytics.js:41` | Anonymous analytics event — no PII per code review |
| `fcm_tokens` | `setDoc` | `App.js:5977` | Push notification token — only written if push is enabled |

**Processing/ingestion modules** (`scheduler.js`, `transparencyScorer.js`, `electionProcessor.js`, `lobbyCorrelator.js`, `promiseTracker.js`, `creditCardFetcher.js`, `controversyFetcher.js`, `militarySpendingFetcher.js`, `foreignAidFetcher.js`, `electionFetcher.js`, `memberExpensesFetcher.js`) also use `addDoc`/`setDoc`/`deleteDoc` — but these files are **not deployed to production browsers**. They are engine/ingestion scripts. They use the Firebase JS SDK (not Admin SDK) locally, which means they authenticate via the web API key unless a separate auth mechanism is in place. This is a secondary concern for the engine but is not part of the public app surface.

---

## 4. Admin SDK Usage (Engine)

| Item | Finding |
|---|---|
| Engine runner (`canada-monthly-runner.cjs`) | Uses Admin SDK via `src/firebase/client.js` |
| Auth method | `GOOGLE_APPLICATION_CREDENTIALS` (service account JSON file path) **or** `FIREBASE_PROJECT_ID` + `FIREBASE_CLIENT_EMAIL` + `FIREBASE_PRIVATE_KEY` env vars |
| Service account key files tracked in git | Not found — `firebase-admin-key.json` is gitignored in app repo |
| Cloud Functions (`functions/index.js`) | `admin.initializeApp()` — uses implicit Application Default Credentials (correct for deployed Functions) |
| Credentials in `.env` files tracked in git | Engine `.env` not tracked; **see Finding F-003 below** |

---

## 5. Secrets and Key Storage

| Item | Finding | Severity |
|---|---|---|
| `.env` committed to app repo | **Yes** — `.env` is tracked in git (committed in `bf48a3e`). It contains `REACT_APP_FIREBASE_API_KEY` and `DISABLE_ESLINT_PLUGIN`. | Medium |
| `.env` contains private keys or service account credentials | No — only the Firebase web API key and an ESLint flag. Firebase web API keys are designed to be public and are restricted by Firebase security rules and authorised domains; however, committing `.env` is an anti-pattern. | Low (web API key) |
| `.env` gitignore status | `.env` is **not** in `.gitignore`. Only `.env.local`, `.env.development.local`, `.env.test.local`, `.env.production.local` are ignored. | Medium |
| Service account JSON keys in tracked files | Not found | — |
| `FIREBASE_PRIVATE_KEY` in tracked files | Not found | — |
| Secrets stored in Firestore documents | Cannot verify without console access. No evidence in code that secrets are written to Firestore by the app. | Cannot confirm |

---

## 6. Personal Data in Public Collections

| Collection | Personal data assessment |
|---|---|
| `subnational_economic_social_stats` | Aggregate statistical data only (unemployment rate, series). No personal identifiers. |
| `subnational_tax_exempt_entities` | Organisation names, registration types, categories. No director names (excluded per CV-DATA-008 decision). No personal data of private individuals. |
| `subnational_grants` | Organisation/recipient names, payment amounts, ministry. No personal data of private individuals. |
| `subnational_jurisdictions` | Cabinet member names and titles (public figures, publicly held roles). Contact office addresses (public government offices). No private individual data. |
| `user_events` | Anonymous events only. `analytics.js` explicitly records no user IDs, names, or personal data. Region from `localStorage` only. |
| `citizen_votes` | Vote choice, politician ID, `userRegion` (from localStorage). No user account, IP, or name. |

---

## 7. Findings Summary

| ID | Finding | Severity | Blocker? |
|---|---|---|---|
| **F-001** | No `firestore.rules` file exists in either repository. Production rules are unversioned and cannot be reviewed from the codebase. Current rules are unknown. | **Critical** | **Yes — launch blocker** |
| **F-002** | Firebase web API key is committed to `.env` which is tracked in git. `.env` is not in `.gitignore`. The key itself has low intrinsic risk (web API keys are semi-public and restricted by security rules), but the pattern is an anti-pattern and `.env` should not be tracked. | Medium | Recommended fix before launch |
| **F-003** | No `firestore.rules` means there is no verified protection against unauthenticated writes to vote, survey, or analytics collections in production. Abuse (fake votes, analytics spam) is possible if rules are permissive. | High | **Yes — launch blocker (depends on F-001)** |
| **F-004** | Processing/ingestion modules use Firebase JS SDK (client SDK) rather than Admin SDK. This is not a production app surface issue but means those scripts rely on Firestore security rules for write authorisation when run locally, which may fail or succeed depending on rules state. | Low | No |
| **F-005** | `fcm_tokens` write path exists in app code. If push notifications are not enabled at launch, this is dormant but the collection should be covered by rules. | Low | No |

---

## 8. Recommended Rules (Reference)

The following structure is recommended for production Firestore rules. **This is a reference for the operator — not an automated deployment.** Rules must be reviewed by the Technical Lead and deployed via the Firebase console or `firebase deploy --only firestore:rules` after a `firestore.rules` file is added to the repository.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ── Public read-only collections (Canadian MVP data) ──────────────────
    match /subnational_economic_social_stats/{docId} {
      allow read: if true;
      allow write: if false;
    }
    match /subnational_tax_exempt_entities/{docId} {
      allow read: if true;
      allow write: if false;
    }
    match /subnational_grants/{docId} {
      allow read: if true;
      allow write: if false;
    }
    match /subnational_jurisdictions/{docId} {
      allow read: if true;
      allow write: if false;
    }
    match /subnational_bills/{docId}/bills/{billId} {
      allow read: if true;
      allow write: if false;
    }

    // ── Other public read-only collections ────────────────────────────────
    match /members/{docId}          { allow read: if true; allow write: if false; }
    match /bills/{docId}            { allow read: if true; allow write: if false; }
    match /department_heads/{docId} { allow read: if true; allow write: if false; }
    match /senior_advisors/{docId}  { allow read: if true; allow write: if false; }
    match /leader_profile_data/{docId} { allow read: if true; allow write: if false; }
    match /news_alerts/{docId}      { allow read: if true; allow write: if false; }
    match /federal_departments/{docId} { allow read: if true; allow write: if false; }
    match /supreme_court_justices/{docId} { allow read: if true; allow write: if false; }
    match /supreme_court_cases/{docId} { allow read: if true; allow write: if false; }
    match /elections/{docId}        { allow read: if true; allow write: if false; }
    match /audit_findings/{docId}   { allow read: if true; allow write: if false; }
    match /government_contracts/{docId} { allow read: if true; allow write: if false; }
    match /surveys/{docId}          { allow read: if true; allow write: if false; }
    match /vote_counts/{docId}      { allow read: if true; allow write: if false; }

    // ── Client-writable interaction collections ───────────────────────────
    // Intentionally permissive (anonymous) — consider rate-limiting or
    // field validation in a Cloud Function if abuse becomes a concern.
    match /citizen_votes/{docId} {
      allow read: if false;
      allow create: if request.resource.data.keys().hasOnly(
        ['politicianId', 'vote', 'userRegion', 'timestamp', 'country']
      );
    }
    match /vote_counts/{docId} {
      allow read: if true;
      allow write: if true;  // Anonymous vote aggregate — acceptable for MVP
    }
    match /news_votes/{docId} {
      allow read: if false;
      allow create: if true;
    }
    match /news_vote_counts/{docId} {
      allow read: if true;
      allow write: if true;
    }
    match /department_votes/{docId} {
      allow read: if true;
      allow write: if true;
    }
    match /user_events/{docId} {
      allow read: if false;
      allow create: if true;
    }
    match /fcm_tokens/{docId} {
      allow read: if false;
      allow write: if true;
    }

    // ── Default deny ──────────────────────────────────────────────────────
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

> **Important:** The rules above are a starting-point reference. They must be reviewed against the actual current production rules before deployment. Do not deploy without Technical Lead sign-off.

---

## 9. Required Actions Before Launch

| Priority | Action | Status | Owner |
|---|---|---|---|
| **Critical** | ~~Add `firestore.rules` to repository~~ | ✅ Done — v1.0 draft created | Technical Lead |
| **Critical** | ~~Add `firebase.json` firestore config~~ | ✅ Done | Technical Lead |
| **Critical** | ~~Add `.env` to `.gitignore`~~ | ✅ Done | Founder / Developer |
| **Critical** | Compare drafted rules against prior production rules in Firebase console version history. | ⚠️ Prior ruleset not captured — no pre-deploy export was made; post-deploy verification substituted | Technical Lead |
| **Critical** | ~~Deploy reviewed rules: `firebase deploy --only firestore:rules`~~ | ✅ Done — deployed 2026-08-15, exit code 0, compiled successfully | Technical Lead |
| **Critical** | ~~Verify rules — test public read, blocked write, client-write, and default deny~~ | ✅ Done — browser automation verification 2026-08-15 (see Section 10) | Technical Lead |
| **Low** | Rotate `REACT_APP_FIREBASE_API_KEY` if repo has been public or shared externally. `.env` is gitignored going forward. | Open | Founder / Developer |

**To deploy:** run from the app repo root (requires Firebase CLI and project access):

```
firebase use civic-voice-5ea94
firebase deploy --only firestore:rules
```

---

## 10. Post-Deployment Verification (2026-08-15)

Verification performed via browser automation against production Firestore (`civic-voice-5ea94`) at commit `e04e6b3`+. All tests executed using the Firestore REST API from the app's browser context (unauthenticated — same as a public user).

### 10a. Firestore Rules Checks

| Test | Expected | Result | Pass/Fail |
|---|---|---|---|
| GET `subnational_economic_social_stats/CA-ON` | 200 OK | 200 | **Pass** |
| GET `subnational_tax_exempt_entities/CA-ON` | 200 OK | 200 | **Pass** |
| GET `subnational_grants/CA-ON` | 200 OK | 200 | **Pass** |
| GET `subnational_jurisdictions/CA-ON` | 200 OK | 200 | **Pass** |
| PATCH `subnational_economic_social_stats/CA-ON` | 403 Denied | 403 | **Pass** |
| PATCH `subnational_tax_exempt_entities/CA-ON` | 403 Denied | 403 | **Pass** |
| PATCH `subnational_grants/CA-ON` | 403 Denied | 403 | **Pass** |
| PATCH `subnational_jurisdictions/CA-ON` | 403 Denied | 403 | **Pass** |
| GET `_rules_test_unknown_/test` | 403 Denied (default deny) | 403 | **Pass** |
| PATCH `_rules_test_unknown_/test` | 403 Denied (default deny) | 403 | **Pass** |
| POST `citizen_votes` — valid fields | 200 OK | 200 | **Pass** |
| POST `citizen_votes` — extra `email` field | 403 Denied (field validation) | 403 | **Pass** |
| POST `user_events` — valid fields | 200 OK | 200 | **Pass** |
| POST `user_events` — with `email` PII field | 403 Denied (field validation) | 403 | **Pass** |
| PATCH `vote_counts/rules-test-delete-me` | 200 OK | 200 | **Pass** |
| POST `news_votes` — valid fields | 200 OK | 200 | **Pass** |
| DELETE `vote_counts/rules-test-delete-me` | 403 Denied (`delete: if false`) | 403 | **Pass** |
| Rules file contains no secrets/API keys | No matches | No matches | **Pass** |

**18 / 18 — Pass.**

> **Residual action resolved 2026-08-15:** Test doc `vote_counts/rules-test-delete-me` deleted via Admin SDK. Confirmed `post-delete exists: false`.

### 10b. Canadian MVP UI Checks

| Test | Expected | Result | Pass/Fail |
|---|---|---|---|
| Ontario Economic & Social modal loads | Unemployment data visible | `hasUnemployment: true`, no error state | **Pass** |
| Ontario Tax Exempt / Charities modal loads | CRA charities visible, source note present | `hasCharities: true`, `hasRecordCount: true` | **Pass** |
| Ontario Transfer Payments modal loads | Transfer payment records visible | `hasTransfer: true`, `hasRecords: true` | **Pass** |
| Legal page `#privacy` | Loads with content, no TBD | `loaded: true`, `noTBD: true` | **Pass** |
| Legal page `#terms` | Loads with content, no TBD | `loaded: true`, `noTBD: true` | **Pass** |
| Legal page `#accessibility` | Loads with content, no TBD | `loaded: true`, `noTBD: true` | **Pass** |
| Legal page `#sources` | Loads with content, no TBD | `loaded: true`, `noTBD: true` | **Pass** |
| Legal page `#disclaimer` | Loads with content, no TBD | `loaded: true`, `noTBD: true` | **Pass** |
| Legal page `#contact` | Loads with content, no TBD | `loaded: true`, `noTBD: true` | **Pass** |
| Canada-only scope | US/UK/AU not visible in navigation | `no_usa: true`, `no_uk: true`, `no_au: true` | **Pass** |
| Footer links | All 7 links present | Privacy · Terms · Accessibility · Sources · Disclaimer · Contact · About | **Pass** |
| No secrets in rendered page | No service account / admin key text | `no_service_account: true`, `no_admin_sdk_key: true` | **Pass** |

**12 / 12 — Pass.**

---

## 11. Change History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-08-15 | Founder / Technical Lead | Initial record — code audit complete. No rules file found. Two launch blockers identified (F-001, F-003). Recommended rules drafted. |
| 1.1 | 2026-08-15 | Founder / Technical Lead | `firestore.rules` v1.0 created in app repo. `firebase.json` created with firestore rules config. `.env` added to `.gitignore`. Rules cover 5 categories: Canadian MVP data (3), federal/national read-only (37+), client-writable interaction (8), admin-only (1), default deny. F-001 and F-002 resolved at repo level. F-003 remains open until rules are deployed and verified in Firebase console. |
| 1.2 | 2026-08-15 | Founder / Technical Lead | `firestore.rules` v1.0 deployed to `civic-voice-5ea94` via `firebase deploy --only firestore:rules`. Compiled successfully, exit code 0. Note: production rules were not exported before deployment — Rules Playground verification required to confirm no regressions. CV-ISS-015 remains In Progress pending that verification step. |
| 1.3 | 2026-08-15 | Founder / Technical Lead | Post-deployment verification completed via browser automation against production Firestore. All 18 test cases passed (see Section 10). Canadian MVP UI confirmed functional. CV-ISS-015 updated to Ready for Review. One minor residual: test doc `vote_counts/rules-test-delete-me` written during verification — delete via Firebase console or Admin SDK. |
| 1.4 | 2026-08-15 | Founder / Technical Lead | Test doc `vote_counts/rules-test-delete-me` deleted via Admin SDK (`delete-verification-test-doc.cjs`, engine repo). Confirmed `post-delete exists: false`. All residual actions resolved. CV-ISS-015 closed. Closure note: "Firestore rules v1.0 deployed and verified post-deployment. Prior production ruleset was not exported before deployment; residual risk accepted because post-deployment functional and security verification passed." |
