# CV-RPT-002 — App Approval Readiness Report

| Field | Value |
|---|---|
| **Document ID** | CV-RPT-002 |
| **Version** | 1.0 |
| **Status** | Final |
| **Author** | Founder / Technical Lead |
| **Date** | 2026-08-16 |
| **Scope** | Canadian MVP — public launch and App Store submission readiness |
| **Tested Commit** | `dd75ad1` (Firestore rules verification closure — last commit at time of hardening pass) |
| **Build Ref** | `REACT_APP_VERSION=dev npx react-scripts build` — exit code 0, compiled successfully |
| **Related Documents** | CV-REG-003 Open Issues Register · CV-SEC-001 Firestore Rules Review · CV-UI-VER-002 Public Legal Pages Verification · CV-SOP-004 Security Procedure |

---

## 1. Purpose

This report records the findings of a comprehensive approval-readiness hardening pass conducted
against the Canadian MVP build. It covers navigation scope, data display, legal pages, privacy and
App Store readiness, security, build output, and mobile display. It concludes with an overall
approval recommendation and a list of remaining blockers.

---

## 2. Tested Commit and Build Result

| Item | Result |
|---|---|
| Commit | `dd75ad1` |
| Build command | `REACT_APP_VERSION=dev npx react-scripts build` |
| Exit code | 0 |
| Compiler output | "Compiled successfully." |
| Warnings | One Node.js deprecation warning (`DEP0040 punycode`) from a transitive dependency — not a compile error, no action required |
| Errors | None |

---

## 3. Navigation and Scope Result

All navigation and scope checks passed.

| Check | Result | Evidence |
|---|---|---|
| `LAUNCH_FLAGS.SHOW_CANADA` | `true` — Canada visible | App.js line 6857 |
| `LAUNCH_FLAGS.SHOW_US` | `false` — US not visible | App.js line 6858 |
| `LAUNCH_FLAGS.SHOW_AUSTRALIA` | `false` — Australia not visible | App.js line 6859 |
| `LAUNCH_FLAGS.SHOW_UK` | `false` — UK not visible | App.js line 6860 |
| Direct US/AU/UK routes | Render `renderRegionUnavailable()` — "Region Not Available" message | App.js lines 12863–12865 |
| "Grants Given" label | Inside `US:${selectedDepartment.name}` gate — not visible with SHOW_US=false | App.js line 7288 |
| Australian placeholder warning | Inside `renderAustralianParliament()` — not reachable with SHOW_AUSTRALIA=false | App.js line 24935 |
| Home page | Canada only visible — no US, UK, or Australia content | Browser verification |
| Footer links | All 7 present: Privacy, Terms, Accessibility, Sources, Disclaimer, Contact, About | Browser verification |
| No raw TBD visible | Confirmed — safe wording used throughout | Browser verification |

---

## 4. Data Display Result

All three active MVP dataset modals load correctly with real production data.

| Modal | Heading | Dataset | Firestore Path | Result |
|---|---|---|---|---|
| Economic & Social | "Ontario — Economic & Social Stats" | CV-DATA-002 (Statistics Canada Table 14-10-0287-01) | `subnational_economic_social_stats/CA-ON` | Pass — unemployment rate and series load |
| Tax Exempt Entities | "Ontario — Tax Exempt Entities" | CV-DATA-008 (CRA Charities Register) | `subnational_tax_exempt_entities/CA-ON` | Pass — 100 charity records; "Financial value not displayed in MVP" shown (not $0) |
| Transfer Payments | "Ontario — Transfer Payments" | CV-DATA-014 (Ontario Public Accounts) | `subnational_grants/CA-ON` | Pass — transfer payment records load; heading confirmed (not "Grants Given") |

No corruption language, no placeholder data, no fake values, no raw TBD in any modal.

---

## 5. Legal Page Result

All six legal page routes verified at desktop and mobile (375 px). See CV-UI-VER-002 for full
evidence record.

| Route | Content | Desktop | Mobile (375 px) | No Raw TBD |
|---|---|---|---|---|
| `#privacy` | Privacy Policy | Pass | Pass | Pass |
| `#terms` | Terms of Use | Pass | Pass | Pass |
| `#accessibility` | Accessibility Statement | Pass | Pass | Pass |
| `#sources` | Data Sources | Pass | Pass | Pass |
| `#disclaimer` | Disclaimer | Pass | Pass | Pass |
| `#contact` | Contact | Pass | Pass | Pass |

Safe wording used for unresolved operator details (CV-ISS-001–004):
- Operator name: "Operator details will be finalised before public launch."
- Contact email: "Public contact channel will be posted before public launch."
- No placeholder email addresses, phone numbers, or postal addresses shown to users.

---

## 6. Privacy and App Store Readiness Result

### 6.1 Data Collection Summary (Actual Behaviour)

| Data Type | Collected | Storage | User-Identifiable | Notes |
|---|---|---|---|---|
| Anonymous vote events | Yes | Firestore `citizen_votes` | No | Fields: politicianId, voteType, userRegion, country, timestamp — no userId/email/IP |
| Custom analytics events | Yes | Firestore `user_events` | No | Fields: event_type, country, region, item_id, timestamp, meta — no userId/email/IP/name |
| FCM push tokens | If user grants permission | Firestore `fcm_tokens` | Device-linked (not user-linked) | Stored only if user approves notification permission |
| Geographic location | Transient only | Not stored | No | `navigator.geolocation` used for province detection; not persisted |
| User accounts | Not collected | n/a | n/a | No Firebase Authentication; no account creation |
| Third-party analytics | Not used | n/a | n/a | No Firebase Analytics SDK; no third-party SDK (GA, Amplitude, etc.) |
| Crash reporting | Not used | n/a | n/a | No Crashlytics or equivalent |

### 6.2 Push Notification Permission

- `Notification.requestPermission()` called at App.js line 5924
- FCM token stored in `fcm_tokens/{token}` only after user grants permission
- App does not use notifications without permission

### 6.3 App Store Privacy Label Inputs (Draft)

These inputs are derived from actual app behaviour. They are suitable for use in the
Apple App Store privacy nutrition labels and Google Play Data Safety section.

> **Note:** CV-ISS-012 (App Store privacy labels) remains Open. These inputs are a
> draft — they must be reviewed against the final CV-REG-002 Privacy Data Map and
> confirmed by the Founder before submission.

**Apple App Store — Privacy Nutrition Label**

| Category | Subcategory | Collected | Linked to Identity | Used for Tracking |
|---|---|---|---|---|
| Identifiers | Device ID | Yes (FCM token — if notifications enabled) | No | No |
| Usage Data | Other usage data | Yes (anonymous civic interaction events) | No | No |
| Location | Coarse location | Transient only — not sent to Apple's definition of "collected" | n/a | No |

Data not collected: Name, Email, Phone, Address, Health, Financial, Contacts, Browsing history, Search history, Diagnostics/crash data, User-generated content, Sensitive info.

**Google Play — Data Safety Section**

| Data Type | Collected | Shared | Required / Optional | Notes |
|---|---|---|---|---|
| Device or other identifiers | Yes | No | Optional | FCM token — only if user enables notifications |
| App interactions | Yes | No | Required | Anonymous civic interaction events |
| Location (approximate) | No | n/a | n/a | Geolocation is transient — not transmitted or stored |

---

## 7. Security Result

| Check | Result | Evidence |
|---|---|---|
| `.env` not tracked in git | Pass | `git rm --cached .env` run; `.env` in `.gitignore` (commits `2030ccf`, `8a3d74d`) |
| No server/service account keys in repo | Pass | Code audit — no `firebase-adminsdk` JSON or service account file in app repo |
| Firestore rules deployed | Pass | `firebase deploy --only firestore:rules` — exit code 0 (2026-08-15) |
| Firestore rules post-deployment verification | Pass | 18/18 rule checks; 12/12 UI checks (CV-SEC-001 §10) |
| `public/firebase-messaging-sw.js` — hardcoded web API key | Noted — not a blocker | Web API key `AIzaSyCPSMre1p20P7P7O5QyI7w8VZZuW6pilo8` is a client-side web key, not a server secret. Firebase project-level security controls (Firestore rules, App Check if enabled) are the relevant mitigations. |
| Firebase Admin SDK credentials | Not in app repo | Engine uses `GOOGLE_APPLICATION_CREDENTIALS` env var — separate from app repo |

### 7.1 Console Warnings at Runtime

| Warning | Source | Assessment |
|---|---|---|
| `permission-denied` on `summary_stats` | `fetchSummaryStatsDashboard` tries to read `summary_stats` | **Expected and intentional.** `summary_stats` is admin-only in Firestore rules v1.0. App handles silently with `console.warn`. Not user-visible. |
| `The query requires an index` on `news_alerts` | `[CA:notifs]` news feed query | **Functional gap.** Canada news feed fails silently due to missing composite Firestore index on `(country, timestamp)`. See CV-ISS-020. |

---

## 8. Mobile Display Result

Tested at 375 px viewport width.

| Check | Result |
|---|---|
| No horizontal overflow on home page | Pass |
| All 3 modal buttons visible | Pass |
| Modal opens without overflow | Pass |
| Close button present and accessible | Pass |
| Data loads in modal at 375 px | Pass |
| Legal pages load at 375 px | Pass |
| Footer all 7 links readable at 375 px | Pass |
| No raw TBD at 375 px | Pass |

---

## 9. App Store Metadata — Approval-Safe Wording

The following wording is prepared for App Store submission. It avoids claims that are
prohibited by Apple and Google review guidelines: no claims of official government status,
no "detects corruption", no voting advice, no legal advice, no "guaranteed accurate", no
"real-time official truth".

### 9.1 App Name

**Civic Voice**

### 9.2 Subtitle (30 characters max)

**Canadian Government Data**

*(29 characters)*

### 9.3 Short Description / Promotional Text (170 characters max — Google Play)

> Explore publicly available Canadian government data — spending, charities, elected
> representatives, and legislation — in one place.

### 9.4 Full App Description

> **Civic Voice** brings together publicly available Canadian government data so you can
> explore what governments report about spending, registered charities, and elected
> representatives.
>
> **What you can do:**
> - Browse Ontario provincial spending data, including transfer payments and economic statistics
> - Search registered charities and tax-exempt entities from the CRA
> - View publicly reported information about federal and provincial elected officials
> - Read publicly available legislation summaries
>
> **Data sources:**
> All data is sourced from official open-data portals including Statistics Canada, the
> Canada Revenue Agency open data registry, and Ontario government open data. Data is not
> real-time and may not reflect the most recent reporting period. Civic Voice aggregates
> and presents published government data — it does not generate, verify, or guarantee the
> accuracy of any figure.
>
> **Privacy:**
> No account is required. No personal information is collected. Anonymous interaction
> events are recorded to improve the app. See our Privacy Policy for full details.
>
> **Not an official government app.** Civic Voice is an independent app that uses publicly
> available government open data. It is not affiliated with, endorsed by, or operated by
> any government body.

### 9.5 Support URL Requirement

A support URL is required by both Apple and Google. This URL must:
- Be a live, publicly accessible web page before submission
- Provide a way for users to contact support or report issues
- Not be a placeholder or 404

**Pending:** CV-ISS-002 (contact email) and CV-ISS-011 (public URL) must be resolved
before a support URL can be confirmed.

Suggested path: `https://civicvoice.ca/contact` (routes to in-app `#contact` page or
a static page with the confirmed support email).

### 9.6 Privacy Policy URL Requirement

A publicly accessible Privacy Policy URL is required before submission.

**Pending:** CV-ISS-001 (operator legal name) and CV-ISS-002 (contact email) must be
resolved, and CV-ISS-013 (legal review) must be complete, before the Privacy Policy
can be published.

Suggested path: `https://civicvoice.ca/privacy` (routes to in-app `#privacy` page or
a static hosted version of CV-POL-001).

### 9.7 Review Notes for Apple (App Store Connect — Notes for Reviewer)

> This app displays publicly available Canadian government data aggregated from open-data
> portals (Statistics Canada, CRA, Ontario Open Data).
>
> **Demo account:** No account is required. The app is fully functional without sign-in.
>
> **Push notifications:** The app requests notification permission to deliver Canadian
> government news alerts. You can decline the permission prompt — all core features
> remain accessible without notifications.
>
> **Location:** The app uses device location briefly to detect province (Ontario) and
> does not store or transmit location data.
>
> **Data accuracy:** All displayed data is sourced from official open-data portals and
> is presented as published. The app does not make claims about data accuracy beyond
> what the source agencies publish.

---

## 10. Remaining Blockers

### 10.1 Critical — Launch Blockers (must be resolved before submission)

| Issue | Title | Blocks |
|---|---|---|
| CV-ISS-001 | Operator legal name TBD | Legal pages, privacy policy URL, App Store developer name |
| CV-ISS-002 | Contact / support email TBD | Support URL requirement (Apple/Google require live support URL) |
| CV-ISS-003 | Mailing address TBD | CASL compliance, Terms of Use |
| CV-ISS-004 | Governing province TBD | Terms of Use §22 |
| CV-ISS-012 | App Store privacy labels not completed | App Store submission |
| CV-ISS-013 | Legal review of public-facing documents not conducted | Approval of Privacy Policy, Terms of Use, Disclaimer, Accessibility Statement |

### 10.2 High — Should be resolved before submission

| Issue | Title | Notes |
|---|---|---|
| CV-ISS-020 | Canada news feed — missing Firestore composite index | `news_alerts` query on `(country, timestamp)` requires a composite index. News feed fails silently for Canadian users. Create index in Firebase console using the link in the browser error message. |
| CV-ISS-011 | Public Data Sources page route | Production URL for sources page not yet confirmed |

### 10.3 Known Issues — Accepted / Not Blockers

| Item | Status |
|---|---|
| `summary_stats` permission-denied console warning | Intentional — admin-only collection; not user-visible |
| `.env` double-entry in `.gitignore` | Harmless — git deduplicates ignore rules |
| FCM web API key in `firebase-messaging-sw.js` | Web client key — not a server secret; acceptable |
| Pre-deployment Firestore rules export not available | Residual risk accepted (CV-ISS-015 closure note) |

---

## 11. Approval Recommendation

**READY WITH BLOCKERS**

The Canadian MVP build is technically stable, correctly scoped to Canada only, and
displays real production data with no fake, placeholder, or misleading values. Security
rules are deployed and verified. Legal pages are implemented with appropriate safe wording
for unresolved operator details. The app is functional and safe to demonstrate.

The app is **not yet ready for App Store submission** due to the following unresolved
blockers:

1. Operator legal name, contact email, mailing address, and governing province (CV-ISS-001–004) must be confirmed.
2. Privacy Policy and Terms of Use must undergo legal review and be published at a live URL (CV-ISS-013).
3. App Store privacy labels must be completed accurately (CV-ISS-012).
4. A live support URL must be available before App Store submission (requires CV-ISS-002).
5. Canada news feed composite Firestore index should be created before public launch (CV-ISS-020).

Once CV-ISS-001–004 are resolved and CV-ISS-012 and CV-ISS-013 follow, the app is
expected to be ready for App Store submission.

---

## 12. Change History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-08-16 | Founder / Technical Lead | Initial report — approval-readiness hardening pass complete |
