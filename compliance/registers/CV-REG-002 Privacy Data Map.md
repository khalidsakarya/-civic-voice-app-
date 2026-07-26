# CV-REG-002 — Privacy Data Map

| Field              | Value                                                                 |
|--------------------|-----------------------------------------------------------------------|
| **Document ID**    | CV-REG-002                                                            |
| **Version**        | 0.1                                                                   |
| **Status**         | Draft                                                                 |
| **Owner**          | Founder / Privacy Lead                                                |
| **Review Frequency** | Quarterly, or whenever app data collection changes                  |
| **Last Reviewed**  | TBD                                                                   |
| **Scope**          | Civic Voice Canada only                                               |

---

## Purpose

This register maps all personal information, identifiers, analytics, diagnostics, feedback,
notification tokens, and user-submitted content collected or processed by Civic Voice Canada.

It is a living document. It must be kept up to date as the app evolves.

---

## Governing Rule

> **No new personal information, analytics SDK, tracking SDK, login provider, feedback form,
> push notification feature, or user account feature shall be added to Civic Voice unless
> this Privacy Data Map and the Privacy Policy (CV-POL-001) are reviewed and updated first.**

Any proposed change that would add or materially alter a row in the table below requires:

1. An update to this register (CV-REG-002), and
2. A corresponding update to CV-POL-001 (Privacy Policy), and
3. Sign-off by the Privacy Lead before the feature is deployed to production.

---

## Data Map Table

> **Column guide**
> - **Personal Information?** — Yes / No / Potentially / Not Collected
> - **Legal / Consent Basis** — the lawful reason the data is processed (e.g., Legitimate Interest, Consent, Contract, Legal Obligation under PIPEDA / Bill C-27)
> - **User Control** — what a user can do (delete, opt-out, access request, etc.)

| Data Element | Personal Information? | Source | Purpose | Legal / Consent Basis | Stored Where | Shared With | Retention Period | User Control | Safeguards | Privacy Policy Section | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **Firebase UID / user account ID** | Yes — if accounts are enabled | Firebase Authentication (future feature) | Identify returning user; link saved preferences to account | Consent (account creation) | Firebase Authentication (Google infrastructure) | Firebase / Google (processor) | Until account deletion requested, or 2 years of inactivity | User can request deletion via in-app settings or email | Firebase security rules; TLS in transit | §4, §12, §14 | **Not currently collected — accounts not enabled. TBD if/when optional accounts are added.** |
| **Email address** | Yes — if accounts or feedback form are enabled | User-provided at account creation or feedback form submission | Account recovery; reply to feedback/correction requests | Consent | TBD (Firebase Auth or Firestore if accounts; email provider if feedback form) | TBD — email provider (processor) if used | Until account deletion or feedback resolved; max 2 years | User can request deletion | TLS in transit; access-restricted collection | §4, §10, §14 | **Not currently collected.** TBD when accounts or feedback form are added. |
| **User feedback / correction request text** | Potentially — if user includes personal details in free-text | User-submitted via in-app feedback or "Report an Error" form (future feature) | Respond to accuracy correction requests; improve data quality | Consent (user initiates) | TBD (email inbox or Firestore) | TBD | Until request resolved; max 2 years | User may request deletion of their submission | Access-restricted inbox/collection | §10, §14 | **Not currently collected — no feedback form deployed.** TBD. |
| **App usage analytics events** (e.g., screen views, feature taps) | Potentially — if analytics SDK is added | Analytics SDK (future — e.g., Firebase Analytics, Plausible, or similar) | Understand feature usage; improve app | Legitimate interest OR consent, depending on SDK and jurisdiction | TBD — analytics provider infrastructure | TBD — analytics provider (processor) | TBD — typically 14 months (Firebase Analytics default) | Opt-out TBD; depends on SDK chosen | Aggregation; IP masking if available | §9 | **Not currently collected.** No analytics SDK is deployed in the current build. If added, SDK choice must be reviewed for PIPEDA compliance. |
| **Crash logs / diagnostic logs** | Potentially — device type, OS version, stack trace may be present | Platform crash reporting (future — e.g., Firebase Crashlytics) | Diagnose and fix app crashes | Legitimate interest | TBD — crash reporting provider infrastructure | TBD — crash reporting provider (processor) | TBD — typically 90 days | Limited control; opt-out TBD | Data minimisation; no user content in logs | §9 | **Not currently collected.** No crash SDK deployed. If added, review for data minimisation (ensure no PII in log payloads). |
| **Device / browser identifiers** (e.g., advertising ID, browser fingerprint) | Yes — if collected by analytics or platform services | Analytics or advertising SDK (future) | Attribution; session continuity | Consent (required for advertising IDs under PIPEDA and App Store rules) | TBD — SDK provider infrastructure | TBD — SDK provider (processor) | TBD | Opt-out / reset via device settings | Apple App Tracking Transparency / Google consent API | §9 | **Not currently collected.** Civic Voice does not use advertising identifiers or cross-app tracking as of this version. |
| **Push notification token** | Yes — if push notifications are enabled | Device OS (iOS APNs / Android FCM) at notification opt-in | Deliver in-app update notifications to opted-in users | Consent (explicit opt-in to notifications) | TBD — Firebase Cloud Messaging infrastructure | Firebase / Google (processor) | Until user unsubscribes or token expires | Opt-out via device notification settings or in-app toggle | TLS; Firebase security | §11 | **Not currently collected.** Push notifications not yet implemented. If added, explicit opt-in consent must be obtained before token registration. |
| **Local saved preferences** (dark mode, followed sections, follow state, home province/territory) | No — stored only on the user's own device; not transmitted to any server | App (localStorage / AsyncStorage) | Persist user UI preferences and follow selections between sessions | No consent required — local storage only; no transmission | User's device only (browser localStorage) | Not shared | Until user clears app data or uninstalls; no server-side copy | User can clear by clearing app/browser data | No transmission; never leaves device | §4, §6 | **Currently implemented.** Preferences stored in localStorage only. Confirmed: no server-side copy created. |
| **Home province / territory** (coarse location) | Potentially — province/territory is not precise but narrows geography | User-granted location permission (iOS/Android GPS → resolved to province/territory label only) | Gate citizen-opinion vote buttons to Canadian residents; record province alongside anonymous vote | Consent (runtime location permission) | Province/territory string stored in localStorage on device; province label written to Firestore `citizen_votes` document alongside vote | Firebase Firestore (Google infrastructure) | LocalStorage: until app data cleared. Firestore vote record: TBD — retained indefinitely as aggregate; individual deletion request honoured | User can revoke location permission in device settings at any time | Precise GPS coordinates are NOT stored — only derived province/territory label; TLS in transit to Firestore | §4, §6, §8 | **Currently implemented.** Confirmed: coordinates discarded after province resolution. Only province label persists. |
| **Precise GPS coordinates** | Not Collected | — | — | — | — | — | — | — | — | — | Coordinates are used transiently in-memory to resolve province/territory only. They are never logged, stored, or transmitted. |
| **Anonymous citizen-opinion vote record** (`{ province, voteType, timestamp }`) | No — no user identifier, IP, or device ID is stored with the vote | App (on vote submission) | Aggregate citizen-opinion counts displayed in the app | Legitimate interest (anonymous aggregated civic data) | Firebase Firestore (`citizen_votes` collection) | Firebase / Google (processor) | TBD — retained indefinitely as aggregate; individual vote deletion on request if linkable to user | No user control required (anonymous); deletion request honoured if user can identify their record | No PII in document schema; Firestore security rules restrict client read of individual votes | §4, §6, §8 | **Currently implemented.** Confirmed Firestore schema: `{ province, voteType, timestamp }` — no UID, no IP, no device ID. |
| **IP address / server-side request logs** | Yes — IP address is personal information | Vercel (hosting) and Firebase (backend) infrastructure | Security, DDoS protection, abuse detection | Legitimate interest | Vercel and Firebase infrastructure logs | Vercel (processor); Firebase / Google (processor) | TBD — platform default (typically 30–90 days) | Limited — platform-level; deletion request forwarded to processor | Platform-managed; not accessible to Civic Voice operators in raw form | §8, §12 | **Passively collected by hosting infrastructure.** Civic Voice does not actively log or process IP addresses at the application level. Review Vercel and Firebase data processing agreements (DPAs). |
| **Political profiling / voting intention / party affiliation** | Not Collected | — | — | — | — | — | — | — | — | — | Civic Voice does not create, infer, or store political profiles. Vote buttons are anonymous and not linked to identifiable users. |

---

## Related Documents

- [CV-POL-001 Privacy Policy](../policies/CV-POL-001%20Privacy%20Policy.md)
- CV-REG-001 Data Source Register (TBD)
- CV-POL-002 Data Breach Response Plan (TBD)

---

## Change Log

| Version | Date | Author | Change |
|---------|------|--------|--------|
| 0.1 | 2026-07-26 | Founder / Privacy Lead | Initial draft — Canadian launch scope |
