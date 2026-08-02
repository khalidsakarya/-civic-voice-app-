# CV-CHK-003 — App Store Privacy Labels Checklist

| Field | Value |
|---|---|
| **Document ID** | CV-CHK-003 |
| **Version** | 0.1 |
| **Status** | Draft |
| **Owner** | Founder / Privacy Lead |
| **Effective Date** | TBD — pending review |
| **Scope** | Civic Voice Canada only |
| **Related Documents** | CV-REG-002 Privacy Data Map · CV-POL-001 Privacy Policy · CV-POL-003 Terms of Use · CV-SOP-005 CASL Communications Procedure · CV-CHK-002 Pre-Launch Compliance Checklist · CV-REG-003 Open Issues Register |
| **Review Frequency** | Before App Store submission; whenever app data collection or SDK configuration changes |

---

> ⚠️ **DRAFT — NOT YET COMPLETED**
>
> This checklist has not been reviewed against the live app, the current App Store
> Connect privacy questionnaire, or the finalised Privacy Data Map. All Label Decision
> fields are blank or marked Pending Decision. This checklist must be completed and
> signed off before App Store or Google Play submission.
>
> Apple updates its privacy label categories periodically. Before completing this
> checklist, verify the current list of data types and required disclosures at:
> [developer.apple.com/app-store/app-privacy-details](https://developer.apple.com/app-store/app-privacy-details)

---

## 1. Purpose

This checklist maps Civic Voice Canada's actual data collection and third-party SDK
behaviour to App Store privacy label declarations for the Apple App Store and Google
Play Data Safety section.

Its goals are to:

- Ensure that App Store privacy nutrition labels and Google Play data safety declarations
  accurately reflect how the app and its third-party SDKs collect, use, and share data.
- Confirm that privacy labels are consistent with CV-REG-002 (Privacy Data Map) and
  CV-POL-001 (Privacy Policy) before submission.
- Identify any data collection gap that requires a Privacy Data Map or Privacy Policy
  update before submission.
- Produce an evidence record that supports the privacy label decisions made.
- Satisfy CV-ISS-012 (App Store privacy labels) in CV-REG-003 (Open Issues Register).

---

## 2. Scope

This checklist covers:

- All data directly collected by the Civic Voice Canada app code
- All data collected or processed by third-party SDKs integrated into the app —
  including Firebase, Firestore, Vercel, and any analytics, crash reporting, or
  communication SDK
- App Store Connect privacy nutrition labels (Apple)
- Google Play Data Safety section (Android)

This checklist does **not** govern:

- Government data displayed in the app — that is public civic information, not personal
  data collected from users.
- Data processed solely on the user's own device with no transmission to any server.

---

## 3. App Privacy Label Principles

The following principles govern all label decisions in this checklist.

**3.1 Labels must match actual behaviour.**
Privacy labels must reflect what the app and its SDKs actually do — not what the
privacy policy says, and not what was intended during design. If the code does something
different from the policy, fix one or both before submitting.

**3.2 Labels must match CV-REG-002 and CV-POL-001.**
Every data type declared in the labels must have a corresponding row in CV-REG-002.
If a label decision identifies a data type not yet in CV-REG-002, update CV-REG-002
and CV-POL-001 before submission.

**3.3 Third-party SDKs count.**
Apple and Google require disclosure of data collected by third-party SDKs integrated
into the app — not just data collected by first-party code. Firebase, Firestore, Vercel
serverless functions, and any analytics or crash reporting SDK must all be assessed.

**3.4 "Data Not Collected" requires evidence.**
Do not declare a data type as "Not Collected" unless there is positive evidence — code
review, SDK audit, or vendor documentation — confirming that neither the app nor any
integrated SDK collects that type. Assumptions are not sufficient.

**3.5 Transient / on-device processing.**
If data is processed temporarily on-device or in-memory and is never transmitted to a
server or persisted to storage, document the evidence. Apple's current guidance on
transient data should be reviewed at submission time to confirm the correct label
treatment. Do not declare transient processing as "Not Collected" without reviewing
Apple's current definition.

**3.6 Feature not enabled ≠ not collected.**
If a feature (e.g., push notifications, accounts, analytics) is not yet enabled but
the SDK is already integrated, the SDK may still collect data. Audit what is integrated
in the build being submitted — not what is planned.

**3.7 Any change triggers re-review.**
Any change to SDKs, data collection code, or app features requires a re-review of this
checklist, CV-REG-002, and CV-POL-001 before the next App Store update is submitted.

---

## 4. Label Decision Status Definitions

| Decision | Meaning |
|---|---|
| **Declare as Collected** | The app or an integrated SDK collects this data type. It must be disclosed in the privacy label with purpose, linkage, and tracking declarations completed. |
| **Declare as Not Collected** | Confirmed by code review and/or SDK audit that neither the app nor any integrated SDK collects this data type. Evidence must be recorded. |
| **Not Collected — Feature Not Enabled** | The feature that would collect this data type is not deployed in this build. The SDK is not integrated or not initialised. Evidence must be recorded. |
| **Transient / On-Device Only — Evidence Required** | Data is processed temporarily on-device or in-memory and is not stored or transmitted. Apple's current guidance must be reviewed to confirm label treatment. Evidence of in-memory-only handling must be recorded. |
| **Pending Decision** | A feature or SDK decision is outstanding. Label cannot be finalised until the decision is made and the feature status is confirmed. See CV-REG-003 for the related open issue. |
| **Not Applicable** | This data type is not relevant to this app (e.g., health data for a civic information app). A brief rationale must still be recorded. |

---

## 5. Data Collection Inventory — Privacy Label Checklist

> **Column guide:**
> - **Current App Status** — what the app currently does in the submitted build
> - **Label Decision** — one of the six statuses defined in Section 4
> - **Linked to User?** — Yes / No / Potentially — whether this data is linked to the user's identity
> - **Used for Tracking?** — Yes / No — whether this data is used to track the user across apps or websites owned by other companies
> - **Purpose** — the purpose(s) for which the data is collected (App Functionality, Analytics, Developer's Advertising, Third-Party Advertising, Product Personalisation, Other)

---

### 5.1 Identity and Contact

| Item ID | Apple Privacy Area | Data Type / Practice | Current App Status | Evidence | Label Decision | Linked to User? | Used for Tracking? | Purpose | Related Privacy Data Map Row | Reviewer | Date | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| PC-01 | Contact Info | **Name** | No name collected — app does not require accounts or name entry | | Declare as Not Collected | No | No | — | Not in CV-REG-002 | | | Confirm no name field exists in any form, feedback, or correction request flow in submitted build |
| PC-02 | Contact Info | **Email address** | No email collected — accounts not enabled; feedback form not deployed | | Not Collected — Feature Not Enabled | No | No | — | CV-REG-002: Email address row (future only) | | | Re-assess if feedback form or accounts are deployed before submission |
| PC-03 | Contact Info | **Phone number** | Not collected | | Declare as Not Collected | No | No | — | Not in CV-REG-002 | | | Confirm no phone number field exists |
| PC-04 | Identifiers | **User ID / Firebase UID** | Firebase Authentication not enabled — no user accounts | | Not Collected — Feature Not Enabled | No | No | — | CV-REG-002: Firebase UID row (future only) | | | Re-assess if accounts are enabled before submission |
| PC-05 | Identifiers | **Device ID** | No advertising ID or cross-app tracking ID collected; no analytics SDK deployed | | Pending Decision | No | No | — | CV-REG-002: Device/browser identifiers row | | | Confirm no analytics or advertising SDK is integrated in the submitted build. Depends on CV-ISS-006 (analytics) and CV-ISS-007 (crash reporting). |

---

### 5.2 Usage and Diagnostics

| Item ID | Apple Privacy Area | Data Type / Practice | Current App Status | Evidence | Label Decision | Linked to User? | Used for Tracking? | Purpose | Related Privacy Data Map Row | Reviewer | Date | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| UD-01 | Usage Data | **Product interaction / analytics events** | No analytics SDK deployed as of this draft | | Pending Decision | No | No | Analytics | CV-REG-002: App usage analytics events row | | | Depends on CV-ISS-006 (analytics SDK decision). If Firebase Analytics or equivalent is integrated in the submitted build, must be declared. |
| UD-02 | Diagnostics | **Crash data** | No crash reporting SDK deployed as of this draft | | Pending Decision | Potentially | No | App Functionality | CV-REG-002: Crash logs / diagnostic logs row | | | Depends on CV-ISS-007 (crash reporting decision). If Crashlytics or equivalent is integrated, must be declared. |
| UD-03 | Diagnostics | **Performance data** | Vercel and Firebase may log serverless function performance metrics | | Pending Decision | Potentially | No | App Functionality | CV-REG-002: IP address / server-side request logs row | | | Assess whether Vercel/Firebase function logs constitute performance data disclosure. Review vendor DPA and privacy label guidance. |
| UD-04 | Other Diagnostic Data | **Server / infrastructure logs (Vercel, Firebase)** | Vercel and Firebase infrastructure automatically generate request logs including IP address | | Declare as Collected | Potentially — IP address is personal information | No | App Functionality | CV-REG-002: IP address / server-side request logs row | | | Apple may require disclosure of IP address processing by hosting infrastructure. Review current App Store guidance on first-party server logs. Disclose under "Other Diagnostic Data" or "Identifiers" as appropriate. |

---

### 5.3 Location

| Item ID | Apple Privacy Area | Data Type / Practice | Current App Status | Evidence | Label Decision | Linked to User? | Used for Tracking? | Purpose | Related Privacy Data Map Row | Reviewer | Date | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| LOC-01 | Location | **Coarse location / Province or territory** | Province/territory label derived from GPS permission and stored in localStorage and in Firestore `citizen_votes` document alongside anonymous vote | | Declare as Collected | No — province label is stored anonymously with vote; not linked to user identity | No | App Functionality | CV-REG-002: Home province / territory (coarse location) row | | | Declare purpose as App Functionality (gating vote submission to Canadian residents). Province label is not precise location but is location data. |
| LOC-02 | Location | **Precise GPS location** | GPS coordinates may be temporarily processed on-device or in-memory to resolve province/territory label. Coordinates are then discarded. Not stored or transmitted. | | Transient / On-Device Only — Evidence Required | No — coordinates are never stored or transmitted | No | App Functionality | CV-REG-002: Precise GPS coordinates row | | | Review Apple's current definition of "transient" processing for location data. Confirm by code review that coordinates are not written to localStorage, Firestore, or any server log. Evidence of in-memory-only handling must be recorded before label is finalised. |

---

### 5.4 User-Submitted Content

| Item ID | Apple Privacy Area | Data Type / Practice | Current App Status | Evidence | Label Decision | Linked to User? | Used for Tracking? | Purpose | Related Privacy Data Map Row | Reviewer | Date | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| USC-01 | User Content | **User feedback / correction request text** | No feedback form or correction request form deployed in current build | | Not Collected — Feature Not Enabled | No | No | — | CV-REG-002: User feedback / correction request text row | | | Re-assess if an in-app feedback or correction request form is deployed before submission. |
| USC-02 | User Content | **Citizen-opinion votes (Support / Concern / Oppose)** | Anonymous vote records written to Firestore: `{ province, voteType, timestamp }` — no user identifier | | Declare as Collected | No — no UID, IP, or device ID in schema | No | App Functionality | CV-REG-002: Anonymous citizen-opinion vote record row | | | Not linked to user identity. Declare under User Content or Other User Content. Purpose: App Functionality (aggregating public civic opinion counts). |
| USC-03 | User Content | **Followed officials / followed topics (Follow feature)** | Follow state stored in localStorage only — not transmitted to any server | | Declare as Not Collected | No | No | — | CV-REG-002: Local saved preferences row | | | Follow state never leaves the device. Confirm by code review that follow state is not synced to Firestore or any server. |

---

### 5.5 Identifiers and Preferences

| Item ID | Apple Privacy Area | Data Type / Practice | Current App Status | Evidence | Label Decision | Linked to User? | Used for Tracking? | Purpose | Related Privacy Data Map Row | Reviewer | Date | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| ID-01 | Identifiers | **Push notification token (FCM / APNs)** | Push notifications not deployed in current build; no notification token registered | | Not Collected — Feature Not Enabled | No | No | — | CV-REG-002: Push notification token row | | | Re-assess if push notifications are deployed before submission. Depends on CV-ISS-008 (account/notification decision) and CV-SOP-005 §11. |
| ID-02 | Other Data | **Saved app preferences (dark mode, home province, display settings)** | Stored in localStorage on device only — not transmitted to any server | | Declare as Not Collected | No | No | — | CV-REG-002: Local saved preferences row | | | Preferences never leave the device. Confirm by code review. |
| ID-03 | Search and Browsing History | **Search history / in-app search queries** | No search history stored or transmitted | | Declare as Not Collected | No | No | — | Not in CV-REG-002 | | | Confirm no search query logging exists in submitted build. |

---

### 5.6 Communications

| Item ID | Apple Privacy Area | Data Type / Practice | Current App Status | Evidence | Label Decision | Linked to User? | Used for Tracking? | Purpose | Related Privacy Data Map Row | Reviewer | Date | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| COM-01 | Contact Info | **Email address for newsletters or marketing** | No newsletter or email feature deployed | | Not Collected — Feature Not Enabled | No | No | — | CV-REG-002: Email address row | | | Re-assess if any email feature is deployed before submission. See CV-SOP-005 §12. |

---

### 5.7 Financial

| Item ID | Apple Privacy Area | Data Type / Practice | Current App Status | Evidence | Label Decision | Linked to User? | Used for Tracking? | Purpose | Related Privacy Data Map Row | Reviewer | Date | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| FIN-01 | Financial Info | **Purchase / payment data** | No in-app purchases or payments implemented | | Declare as Not Collected | No | No | — | Not in CV-REG-002 | | | |
| FIN-02 | Financial Info | **Donation data** | No donation feature deployed | | Not Collected — Feature Not Enabled | No | No | — | Not in CV-REG-002 | | | Re-assess if a donation feature is deployed. See CV-SOP-005 §13. |

---

### 5.8 Sensitive and Special Category Data

| Item ID | Apple Privacy Area | Data Type / Practice | Current App Status | Evidence | Label Decision | Linked to User? | Used for Tracking? | Purpose | Related Privacy Data Map Row | Reviewer | Date | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| SEN-01 | Sensitive Info | **Advertising identifiers** | No advertising SDK or IDFA/GAID use | | Declare as Not Collected | No | No | — | CV-REG-002: Device/browser identifiers row | | | Confirm by code review and SDK audit that no advertising identifier is accessed |
| SEN-02 | Sensitive Info | **Political profile / voting intention / party affiliation** | Not collected — citizen-opinion votes are anonymous and not linked to identity or party | | Declare as Not Collected | No | No | — | CV-REG-002: Political profiling row | | | CV-POL-001 explicitly states Civic Voice does not create political profiles. Confirm no inferred political data is stored. |
| SEN-03 | Sensitive Info | **Other sensitive information** (race, religion, health, union membership, sexual orientation, immigration status, biometric data) | Not collected | | Declare as Not Collected | No | No | — | Not in CV-REG-002 | | | Confirm by code review. Civic Voice Canada has no features that would collect this data. |
| SEN-04 | Health and Fitness | **Health or fitness data** | Not collected | | Not Applicable | No | No | — | Not in CV-REG-002 | | | Not relevant to a civic information app |
| SEN-05 | Contacts | **Contacts** | Not collected | | Not Applicable | No | No | — | Not in CV-REG-002 | | | App does not access device contacts |
| SEN-06 | Photos and Videos | **Photos or videos** | Not collected | | Not Applicable | No | No | — | Not in CV-REG-002 | | | App does not access camera or photo library |

---

## 6. Third-Party SDK Review

Before finalising label decisions, confirm the following for each third-party SDK or
service integrated into the submitted build.

| SDK / Service | Integrated in Submitted Build? | Data Collected by SDK | Label Impact | Evidence / Vendor Privacy Docs | Reviewer | Date | Notes |
|---|---|---|---|---|---|---|---|
| **Firebase Firestore** | Yes | Writes anonymous vote records `{ province, voteType, timestamp }` to database; server-side processes requests | Declare as Collected — anonymous vote data; server logs (IP) | [firebase.google.com/support/privacy](https://firebase.google.com/support/privacy) | | | |
| **Vercel (hosting / serverless)** | Yes | Server-side request logs including IP address and request metadata | Declare as Collected — server/infrastructure logs | [vercel.com/legal/privacy-policy](https://vercel.com/legal/privacy-policy) | | | |
| **Firebase Analytics** | Confirm | If integrated: device ID, usage events, demographics | Declare as Collected if integrated | TBD | | | Depends on CV-ISS-006. If not integrated in submitted build: Not Collected — Feature Not Enabled. |
| **Firebase Crashlytics** | Confirm | If integrated: crash reports, device info, OS version, stack traces | Declare as Collected if integrated | TBD | | | Depends on CV-ISS-007. If not integrated in submitted build: Not Collected — Feature Not Enabled. |
| **Firebase Cloud Messaging (FCM)** | Confirm | If integrated: push notification token, device info | Declare as Collected if token registered | TBD | | | Depends on CV-ISS-008. If not deployed: Not Collected — Feature Not Enabled. |
| **Firebase Authentication** | Confirm | If enabled: user ID, email, sign-in metadata | Declare as Collected if enabled | TBD | | | Depends on CV-ISS-008. If not enabled in submitted build: Not Collected — Feature Not Enabled. |
| **Any other third-party SDK** | Confirm before submission | TBD | TBD | TBD | | | List all SDKs present in the build — including any UI libraries, charting libraries, or HTTP clients that make network requests |

---

## 7. Location Data Review

Complete this section before finalising LOC-01 and LOC-02 label decisions.

| Check | Requirement | Evidence | Pass / Fail / NA | Reviewer | Date |
|---|---|---|---|---|---|
| LOC-R-01 | Code review confirms GPS coordinates are never written to localStorage | | | | |
| LOC-R-02 | Code review confirms GPS coordinates are never written to Firestore or any database | | | | |
| LOC-R-03 | Code review confirms GPS coordinates are never transmitted to any server or API endpoint | | | | |
| LOC-R-04 | Code review confirms GPS coordinates are discarded after province/territory resolution | | | | |
| LOC-R-05 | Province/territory label is the only location-derived value persisted (localStorage and Firestore `citizen_votes`) | | | | |
| LOC-R-06 | Apple's current guidance on "transient" location data reviewed and label decision updated accordingly | | | | |
| LOC-R-07 | Firestore `citizen_votes` schema confirmed as `{ province, voteType, timestamp }` — no coordinate fields | | | | |

---

## 8. Account Creation and Firebase Auth Review

> Complete this section if Firebase Authentication is enabled in the submitted build.
> If accounts are not enabled, mark all rows NA.

| Check | Requirement | Evidence | Pass / Fail / NA | Reviewer | Date |
|---|---|---|---|---|---|
| AUTH-R-01 | Firebase Authentication enabled / not enabled in submitted build confirmed | | | | |
| AUTH-R-02 | If enabled: user ID and email are declared in privacy labels | | | | |
| AUTH-R-03 | If enabled: CV-REG-002 Firebase UID row updated | | | | |
| AUTH-R-04 | If enabled: CV-POL-001 §4.4 updated and reviewed | | | | |
| AUTH-R-05 | If not enabled: confirmed by build review that Firebase Auth SDK is not initialised | | | | |

---

## 9. Push Notification Review

> Complete this section if push notifications are deployed in the submitted build.
> If push notifications are not deployed, mark all rows NA.

| Check | Requirement | Evidence | Pass / Fail / NA | Reviewer | Date |
|---|---|---|---|---|---|
| PUSH-R-01 | Push notification feature deployed / not deployed in submitted build confirmed | | | | |
| PUSH-R-02 | If deployed: FCM/APNs token declared in privacy labels | | | | |
| PUSH-R-03 | If deployed: device permission prompt used before token registration confirmed | | | | |
| PUSH-R-04 | If deployed: CV-REG-002 push notification token row updated | | | | |
| PUSH-R-05 | If deployed: CV-SOP-005 §11 pre-send review completed | | | | |
| PUSH-R-06 | If not deployed: confirmed by build review that FCM/APNs is not initialised and no token is registered | | | | |

---

## 10. App Store Connect Submission Review

Complete this section immediately before App Store Connect submission.

| Item ID | Requirement | Pass / Fail / NA | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|---|
| ASC-01 | All rows in the Data Collection Inventory (Section 5) have a finalised Label Decision (not Pending Decision) | | | | | All Pending Decision items must be resolved before submission |
| ASC-02 | All third-party SDKs in the submitted build are confirmed and assessed in Section 6 | | | | | |
| ASC-03 | Location data review (Section 7) is complete and LOC-01/LOC-02 decisions are finalised | | | | | |
| ASC-04 | Auth and push notification review sections are completed or marked NA | | | | | |
| ASC-05 | Label decisions are consistent with CV-REG-002 Privacy Data Map | | | | | If discrepancies found, update CV-REG-002 before submission |
| ASC-06 | Label decisions are consistent with CV-POL-001 Privacy Policy | | | | | If discrepancies found, update CV-POL-001 before submission |
| ASC-07 | Privacy Policy URL is live and accessible from App Store Connect privacy policy field | | | | | |
| ASC-08 | App Store Connect privacy nutrition labels entered and saved in App Store Connect | | | | | |
| ASC-09 | Google Play Data Safety section completed to match label decisions | | | | | |
| ASC-10 | CV-ISS-012 (App Store privacy labels) in CV-REG-003 updated to reflect completion | | | | | |
| ASC-11 | CV-CHK-002 item APP-01 and APP-02 confirmed Pass | | | | | |

---

## 11. Records Generated

| Record | When Generated | Retained By | Retention Period |
|---|---|---|---|
| **Completed App Store Privacy Labels Checklist** (this document, all fields filled) | On checklist completion before App Store submission | Privacy Lead | Minimum 3 years |
| **Privacy Data Map update** (CV-REG-002) | If any label decision identifies a data type not yet in CV-REG-002 | Privacy Lead | Indefinitely (living register) |
| **Privacy Policy update** (CV-POL-001) | If any label decision requires disclosure not yet in CV-POL-001 | Privacy Lead | Minimum 3 years per version |
| **Open Issues Register update** (CV-REG-003) | If any Pending Decision item remains unresolved at submission time | Compliance Lead | Until issue is closed |
| **App Store submission evidence** | Screenshot or export of App Store Connect privacy label entries at time of submission | Founder · Privacy Lead | Minimum 3 years |

---

## 12. Approval

This checklist is considered complete when all Label Decision fields are finalised
(no Pending Decision entries remain), all review sub-sections are completed, and the
Privacy Lead and Founder have signed off.

| Role | Name | Date | Confirmation |
|---|---|---|---|
| Privacy Lead | TBD | TBD | |
| Developer | TBD | TBD | |
| Founder | TBD | TBD | |

**Checklist completion date:** TBD

**App version / build reviewed:** TBD

**App Store Connect submission date:** TBD

---

## Related Documents

| Document | Status |
|---|---|
| [CV-REG-002 Privacy Data Map](../registers/CV-REG-002%20Privacy%20Data%20Map.md) | Draft |
| [CV-POL-001 Privacy Policy](../policies/CV-POL-001%20Privacy%20Policy.md) | Draft |
| [CV-POL-003 Terms of Use](../policies/CV-POL-003%20Terms%20of%20Use.md) | Draft |
| [CV-SOP-005 CASL Communications Procedure](../procedures/CV-SOP-005%20CASL%20Communications%20Procedure.md) | Draft |
| [CV-CHK-002 Pre-Launch Compliance Checklist](CV-CHK-002%20Pre-Launch%20Compliance%20Checklist.md) | Draft |
| [CV-REG-003 Open Issues Register](../registers/CV-REG-003%20Open%20Issues%20Register.md) | Draft |

---

> **Final Note:** This checklist is a draft and must be reviewed against Apple's current
> App Store Connect privacy questionnaire before submission. Apple updates its privacy
> label categories and guidance periodically — always verify at
> developer.apple.com/app-store/app-privacy-details before completing the label
> decisions in Section 5. Label decisions based on outdated Apple guidance may result
> in App Store rejection or a required update after submission.

---

## Change Log

| Version | Date | Author | Change |
|---|---|---|---|
| 0.1 | 2026-08-02 | Founder / Privacy Lead | Initial draft — Canadian launch scope |
