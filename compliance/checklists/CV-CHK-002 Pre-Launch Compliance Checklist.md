# CV-CHK-002 — Pre-Launch Compliance Checklist

| Field | Value |
|---|---|
| **Document ID** | CV-CHK-002 |
| **Version** | 0.1 |
| **Status** | Draft |
| **Owner** | Founder / Compliance Lead |
| **Effective Date** | TBD — pending review |
| **Scope** | Civic Voice Canada only |
| **Related Documents** | CV-IDX-001 · CV-COMP-001 · CV-REG-001 · CV-REG-002 · CV-POL-001 · CV-POL-002 · CV-POL-003 · CV-POL-004 · CV-POL-005 · CV-SOP-001 · CV-SOP-002 · CV-SOP-003 · CV-SOP-004 · CV-SOP-005 · CV-CHK-001 |
| **Review Frequency** | Before public launch; before App Store submission; before major public releases |

---

> ⚠️ **DRAFT — NOT YET COMPLETED**
>
> This checklist has not yet been reviewed against the live app or the finalised
> compliance package. All Pass/Fail/NA fields are blank. This checklist must be
> completed in full and signed off before:
>
> 1. Civic Voice Canada is released to the public,
> 2. The app is submitted to the Apple App Store or Google Play, and
> 3. Any public launch is announced.

---

## 1. Purpose

This checklist defines the minimum compliance, privacy, source-control, accessibility,
security, and public-disclaimer checks that must be completed before Civic Voice Canada
is released publicly or submitted to an app store.

It is the final gate that confirms the full compliance package is in place — not a
substitute for completing the individual policies, procedures, registers, and checklists
it references.

---

## 2. Scope

This checklist applies to the Canadian launch of Civic Voice Canada only. It covers:

- Legal and public-facing documents (privacy, terms, disclaimers, accessibility)
- Data source and attribution readiness
- Privacy and user data readiness
- Firebase and security readiness
- Accessibility
- Communications and CASL readiness
- App Store submission requirements
- Public UI disclaimer wording
- Correction request and monthly update process readiness

A separate checklist will be required for US, UK, or Australian launches.

---

## 3. Priority Definitions

| Priority | Definition |
|---|---|
| **Critical** | Must be complete before public launch or App Store submission. A Critical item that is not complete is a launch blocker. It may not be deferred or risk-accepted without explicit Founder approval and a documented plan. |
| **High** | Should be complete before public launch. May be accepted as an open risk item with Founder sign-off if a plan to resolve it within 30 days of launch is documented. |
| **Medium** | May be completed shortly after launch if the risk is formally accepted. Must not remain open indefinitely. |
| **Low** | Improvement item. Does not block launch. |

---

## 4. Launch Readiness Status

> Complete this table at the end of the checklist, after all sections are reviewed.

| Section | Total Items | Pass | Fail | NA | Open / TBD |
|---|---|---|---|---|---|
| 4. Legal / Public-Facing Documents | | | | | |
| 5. Data Source and Attribution Readiness | | | | | |
| 6. Privacy Readiness | | | | | |
| 7. User Data and Firebase Readiness | | | | | |
| 8. Security and Access Readiness | | | | | |
| 9. Accessibility Readiness | | | | | |
| 10. Communications / CASL Readiness | | | | | |
| 11. App Store Readiness | | | | | |
| 12. Public UI Disclaimer Readiness | | | | | |
| 13. Correction Request Readiness | | | | | |
| 14. Monthly Update Readiness | | | | | |
| **Total** | | | | | |

**Critical items failing:** ___
**High items failing:** ___
**Launch decision (Section 15):** ___

---

## 5. Legal / Public-Facing Documents

| Item ID | Requirement | Related Document | Priority | Pass / Fail / NA | Evidence | Owner | Reviewer | Date | Notes |
|---|---|---|---|---|---|---|---|---|---|
| LGL-01 | Operator legal name confirmed and filled in all public-facing documents (CV-POL-001, CV-POL-003, CV-POL-004, CV-POL-005) | CV-POL-001 · CV-POL-003 · CV-POL-004 · CV-POL-005 | Critical | | | Founder | | | Replace all `[OPERATOR LEGAL NAME — TBD]` placeholders |
| LGL-02 | Contact / support email address confirmed and filled in all public-facing documents | CV-POL-001 · CV-POL-003 · CV-POL-004 · CV-POL-005 · CV-SOP-003 · CV-SOP-005 | Critical | | | Founder | | | Replace all `[CONTACT EMAIL — TBD]` placeholders |
| LGL-03 | Mailing address confirmed and filled in all documents that require it (Terms of Use, CASL identification) | CV-POL-003 · CV-POL-005 · CV-SOP-005 | Critical | | | Founder | | | Required for CASL sender identification |
| LGL-04 | Governing province confirmed in Terms of Use §22 | CV-POL-003 | Critical | | | Founder | | | Determines applicable provincial law and jurisdiction |
| LGL-05 | Privacy Policy (CV-POL-001) reviewed by legal counsel or founder; status set to Approved | CV-POL-001 | Critical | | | Founder / Privacy Lead | | | Must be Approved before App Store submission |
| LGL-06 | Terms of Use (CV-POL-003) reviewed by legal counsel or founder; status set to Approved | CV-POL-003 | Critical | | | Founder / Compliance Lead | | | Must be Approved before App Store submission |
| LGL-07 | Public Disclaimer and Non-Affiliation Statement (CV-POL-004) reviewed and approved; standard wording finalised | CV-POL-004 | Critical | | | Founder / Compliance Lead | | | Short and full disclaimer wording must be locked before UI copy is published |
| LGL-08 | Accessibility Statement (CV-POL-005) reviewed; Known Limitations table updated to reflect actual app state | CV-POL-005 · CV-CHK-001 | High | | | Founder / Product Lead | | | Must be completed after CV-CHK-001 is done |
| LGL-09 | Effective Date set on all public-facing documents before publication | CV-POL-001 · CV-POL-003 · CV-POL-004 · CV-POL-005 | Critical | | | Founder | | | Effective Date must not remain TBD on published documents |
| LGL-10 | Document version numbers incremented to reflect Approved status | CV-IDX-001 | High | | | Founder / Compliance Lead | | | Version 0.1 is a draft designation; consider incrementing to 1.0 on approval |

---

## 6. Data Source and Attribution Readiness

| Item ID | Requirement | Related Document | Priority | Pass / Fail / NA | Evidence | Owner | Reviewer | Date | Notes |
|---|---|---|---|---|---|---|---|---|---|
| SRC-01 | CV-REG-001 contains an entry for every dataset displayed in the Canadian launch | CV-REG-001 · CV-POL-002 | Critical | | | Data Lead | | | No data may be displayed without a CV-REG-001 entry |
| SRC-02 | Every CV-REG-001 entry has a confirmed source URL, source owner, licence/terms status, reporting period, and fetched date | CV-REG-001 | Critical | | | Data Lead | | | No TBD fields in critical columns for any active source |
| SRC-03 | Every CV-REG-001 entry has Licence Status of Approved, Public Registry, or Manual Review Only — not Review Required | CV-REG-001 · CV-POL-002 | Critical | | | Data Lead | | | Review Required = not cleared for public display |
| SRC-04 | Every displayed factual number, chart, and public official profile has been spot-checked against the registered source (CV-SOP-001 §7) | CV-SOP-001 | Critical | | | Data Lead | | | Verification Checklists must exist for each dataset |
| SRC-05 | Verification Status in CV-REG-001 is set to Verified or Partial (not Needs Review, Blocked, or Unavailable) for all active sources | CV-REG-001 | Critical | | | Data Lead | | | Unverified sources must be labelled or removed |
| SRC-06 | All transformation methods for derived data are documented in CV-REG-001 (CV-POL-002 §10) | CV-REG-001 · CV-POL-002 | High | | | Data Lead | | | Undocumented transformations must not be displayed without a manual review flag |
| SRC-07 | Source attribution (source name, reporting period, fetched date) is visible in the app for all major datasets | CV-POL-002 · CV-POL-004 | Critical | | | Developer | | | Check each section of the Canadian launch UI |
| SRC-08 | OGL-Canada 2.0 attribution notice appears on the Data Sources page or equivalent public attribution page | CV-POL-002 | Critical | | | Developer | | | Required by OGL-Canada 2.0 licence terms |
| SRC-09 | App does not display US, UK, or Australia jurisdiction data or UI sections in the Canadian launch | CV-COMP-001 | Critical | | | Developer | | | Non-Canadian jurisdictions must be hidden, not deleted |
| SRC-10 | Hidden (non-Canadian) jurisdictions and their data are confirmed hidden — not deleted — from the app | CV-COMP-001 | Critical | | | Developer | | | Deletion would remove data needed for future jurisdiction launches |
| SRC-11 | No fake, demo, generated, or placeholder factual data appears in the Canadian launch UI | CV-POL-002 · CV-SOP-001 | Critical | | | Developer · Data Lead | | | Every displayed value must trace to a registered official source |
| SRC-12 | No unsupported corruption claims, voting recommendations, legal conclusions, investment recommendations, or party endorsements appear in the app | CV-POL-004 | Critical | | | Founder · Compliance Lead | | | Review all cards, modals, chart labels, and status messages |
| SRC-13 | Approved status labels are used for all unavailable, blocked, or pending-review data (not blank fields, "N/A", or "0") | CV-SOP-001 · CV-SOP-002 | Critical | | | Developer · Data Lead | | | Check all sections where data may be unavailable |
| SRC-14 | Data Sources page (civicvoice.ca/sources or equivalent) is live or linked from the app before launch | CV-POL-002 | High | | | Developer | | | Required for OGL attribution and user transparency |

---

## 7. Privacy Readiness

| Item ID | Requirement | Related Document | Priority | Pass / Fail / NA | Evidence | Owner | Reviewer | Date | Notes |
|---|---|---|---|---|---|---|---|---|---|
| PRV-01 | Privacy Data Map (CV-REG-002) matches the actual data collection behaviour of the current app build | CV-REG-002 · CV-POL-001 | Critical | | | Privacy Lead | | | Confirm every row in CV-REG-002 against the live code |
| PRV-02 | Precise GPS coordinates are confirmed not stored — only the derived province/territory label is persisted | CV-REG-002 · CV-POL-001 | Critical | | | Developer · Privacy Lead | | | Confirm in Firestore schema and in-memory handling |
| PRV-03 | Anonymous vote Firestore schema is confirmed: `{ province, voteType, timestamp }` only — no UID, no IP, no device ID | CV-REG-002 · CV-POL-001 | Critical | | | Developer · Privacy Lead | | | Check Firestore collection directly |
| PRV-04 | App preferences (dark mode, follow state, home province) are stored in localStorage only — confirmed no server-side copy | CV-REG-002 | Critical | | | Developer | | | |
| PRV-05 | No analytics SDK is deployed unless documented in CV-REG-002 and disclosed in CV-POL-001 | CV-REG-002 · CV-POL-001 | Critical | | | Developer · Privacy Lead | | | If deployed, must be disclosed before launch |
| PRV-06 | No crash reporting SDK is deployed unless documented in CV-REG-002 and disclosed in CV-POL-001 | CV-REG-002 · CV-POL-001 | Critical | | | Developer · Privacy Lead | | | If deployed, must be disclosed before launch |
| PRV-07 | No push notification tokens registered without user device permission (CV-SOP-005 §11.2) | CV-SOP-005 · CV-REG-002 | Critical | | | Developer | | | Not currently deployed — confirm feature status |
| PRV-08 | No user accounts or email addresses stored without the account/privacy controls defined in CV-POL-001 §4.4 | CV-POL-001 · CV-REG-002 | Critical | | | Developer · Privacy Lead | | | Accounts not currently enabled — confirm status |
| PRV-09 | Data processing agreements (DPAs) confirmed or in progress with Vercel and Firebase/Google | CV-POL-001 | High | | | Founder | | | Required for cross-border transfer disclosure in CV-POL-001 §17 |
| PRV-10 | User data retention periods confirmed and documented in CV-POL-001 §12 and CV-REG-002 | CV-POL-001 · CV-REG-002 | High | | | Privacy Lead | | | TBD periods in CV-POL-001 must be resolved before publication |

---

## 8. User Data and Firebase Readiness

| Item ID | Requirement | Related Document | Priority | Pass / Fail / NA | Evidence | Owner | Reviewer | Date | Notes |
|---|---|---|---|---|---|---|---|---|---|
| FBS-01 | Firestore security rules reviewed per CV-SOP-004 §7 before public launch | CV-SOP-004 | Critical | | | Technical Lead | | | Firestore Rules Review Record must exist |
| FBS-02 | No Firestore collection containing government data is bulk-readable by unauthenticated clients | CV-SOP-004 | Critical | | | Technical Lead · Developer | | | Test rules with Firebase Rules Playground or equivalent |
| FBS-03 | Client-side writes are limited to `citizen_votes` (or equivalent) per security rules — no client writes to government data collections | CV-SOP-004 | Critical | | | Technical Lead · Developer | | | |
| FBS-04 | All government data in Firestore was written via authenticated Admin SDK — not client-side | CV-SOP-004 · CV-SOP-002 | Critical | | | Technical Lead · Developer | | | Confirm write method in Monthly Update Log |
| FBS-05 | Monthly update process has been executed at least once end-to-end in production (or a production-equivalent environment) before public launch | CV-SOP-002 | High | | | Data Lead | | | Untested pipeline is a launch risk |
| FBS-06 | Pre-update snapshot / rollback plan confirmed and documented | CV-SOP-002 | High | | | Technical Lead | | | Required before any live data write |

---

## 9. Security and Access Readiness

| Item ID | Requirement | Related Document | Priority | Pass / Fail / NA | Evidence | Owner | Reviewer | Date | Notes |
|---|---|---|---|---|---|---|---|---|---|
| SEC-01 | Firebase / Vercel / GCP / GitHub admin access reviewed; least-privilege confirmed for all team members | CV-SOP-004 | Critical | | | Technical Lead | | | Access Review Record must exist |
| SEC-02 | No service account keys committed to GitHub — confirmed via GitHub secret scanning or manual audit | CV-SOP-004 | Critical | | | Technical Lead | | | |
| SEC-03 | No `.env` files committed to GitHub — `.gitignore` confirmed to cover all `.env*` patterns | CV-SOP-004 | Critical | | | Technical Lead | | | |
| SEC-04 | No API keys or credentials hardcoded in source code committed to the repository | CV-SOP-004 | Critical | | | Technical Lead | | | |
| SEC-05 | All production secrets stored in Vercel environment variables, GCP Secret Manager, or GitHub repository secrets | CV-SOP-004 | Critical | | | Technical Lead | | | |
| SEC-06 | Branch protection enabled on `main` — direct pushes disallowed; force push disallowed | CV-SOP-004 | High | | | Technical Lead | | | |
| SEC-07 | Local development confirmed to use Firebase emulator or separate development project — not production credentials | CV-SOP-004 | High | | | Technical Lead · Developer | | | |
| SEC-08 | Secrets / Environment Variable Register (CV-SOP-004 §19.3) created and current | CV-SOP-004 | High | | | Technical Lead | | | Register must document metadata — not secret values |

---

## 10. Accessibility Readiness

| Item ID | Requirement | Related Document | Priority | Pass / Fail / NA | Evidence | Owner | Reviewer | Date | Notes |
|---|---|---|---|---|---|---|---|---|---|
| ACC-01 | Accessibility Checklist (CV-CHK-001) completed for all core launch screens | CV-CHK-001 | High | | | Product Lead · Developer | | | All Fail items resolved or documented as known limitations |
| ACC-02 | Colour contrast checked on all primary text, interactive controls, and focus indicators | CV-CHK-001 §3 | High | | | Product Lead | | | Minimum 4.5:1 for normal text; 3:1 for large text and UI components |
| ACC-03 | Screen reader test completed on at least one platform (iOS VoiceOver or Android TalkBack) | CV-CHK-001 §6 | High | | | Product Lead · Developer | | | |
| ACC-04 | Approved status labels (e.g., "Manual review required", "Source unavailable") are readable by screen readers | CV-CHK-001 §11 | High | | | Developer | | | |
| ACC-05 | Charts and data visualisations have text labels, axis labels, and text summaries or linked data alternatives | CV-CHK-001 §9 | High | | | Developer | | | |
| ACC-06 | All interactive elements reachable by keyboard; no keyboard traps | CV-CHK-001 §5 | High | | | Developer | | | |
| ACC-07 | No critical information available only through hover — tap/click equivalent exists | CV-CHK-001 §10 | High | | | Developer | | | |
| ACC-08 | App usable on 375px wide screen without horizontal page-body scrolling | CV-CHK-001 §10 | High | | | Developer | | | |
| ACC-09 | Accessibility Statement (CV-POL-005) Known Limitations table updated to reflect CV-CHK-001 Fail items | CV-POL-005 | High | | | Product Lead | | | Statement must not claim compliance for unresolved failures |
| ACC-10 | CV-CHK-001 signed off by Product Lead and Developer | CV-CHK-001 §14 | High | | | Product Lead | | | |

---

## 11. Communications / CASL Readiness

| Item ID | Requirement | Related Document | Priority | Pass / Fail / NA | Evidence | Owner | Reviewer | Date | Notes |
|---|---|---|---|---|---|---|---|---|---|
| CAS-01 | If email newsletter or promotional email is deployed at launch: express consent capture, sender ID, and unsubscribe mechanism are confirmed before first send | CV-SOP-005 | Critical | | | Compliance Lead | | | If not deployed at launch: NA |
| CAS-02 | If push notifications are deployed at launch: device permission prompt used; notification token not registered before permission granted | CV-SOP-005 §11 | Critical | | | Developer · Compliance Lead | | | If not deployed at launch: NA |
| CAS-03 | If donation or fundraising messages are deployed at launch: separate consent and legal review confirmed | CV-SOP-005 §13 | Critical | | | Founder · Compliance Lead | | | If not deployed at launch: NA |
| CAS-04 | No pre-checked consent boxes exist anywhere in the app UI | CV-SOP-005 §15 | Critical | | | Developer · Compliance Lead | | | Applies even if communication features are not yet active |
| CAS-05 | No communication feature sends a message to users without a valid Consent Record | CV-SOP-005 §8 | Critical | | | Compliance Lead | | | If no communication features deployed: NA |
| CAS-06 | Functional messages (correction request responses, security alerts) confirmed to contain no promotional content | CV-SOP-005 §14 | High | | | Compliance Lead | | | If no messages deployed: NA |
| CAS-07 | In-app Follow feature confirmed as in-app UI only — no device push notifications, no email, no notification token registered | CV-POL-001 · CV-SOP-005 | Critical | | | Developer | | | |

---

## 12. App Store Readiness

| Item ID | Requirement | Related Document | Priority | Pass / Fail / NA | Evidence | Owner | Reviewer | Date | Notes |
|---|---|---|---|---|---|---|---|---|---|
| APP-01 | Apple App Store privacy nutrition labels accurately reflect CV-REG-002 (Privacy Data Map) | CV-REG-002 · CV-POL-001 | Critical | | | Founder · Developer | | | Labels must match actual data collection — not aspirational |
| APP-02 | Google Play Data Safety section accurately reflects CV-REG-002 | CV-REG-002 · CV-POL-001 | Critical | | | Founder · Developer | | | |
| APP-03 | Privacy Policy URL (CV-POL-001) confirmed and working before App Store submission | CV-POL-001 | Critical | | | Developer | | | Apple and Google require a working privacy policy URL |
| APP-04 | App Store listing description does not contain prohibited claims (CV-POL-004 §11) | CV-POL-004 | Critical | | | Founder · Compliance Lead | | | No "official", "government verified", "real-time official truth", or similar claims |
| APP-05 | App Store listing includes the approved short disclaimer or equivalent non-affiliation statement | CV-POL-004 §9 | Critical | | | Founder · Compliance Lead | | | |
| APP-06 | Support URL (App Store listing) links to Terms of Use or a page with Terms, Privacy Policy, and Accessibility Statement | CV-POL-003 · CV-POL-001 · CV-POL-005 | Critical | | | Developer | | | |
| APP-07 | App age rating confirmed and appropriate for civic/informational content | CV-POL-001 §16 | High | | | Founder | | | Intended: 4+ / Everyone — confirm against actual content |
| APP-08 | App Store listing category and sub-category confirmed as appropriate (not politics / voting category) | — | High | | | Founder | | | Civic/informational category avoids political app review scrutiny |

---

## 13. Public UI Disclaimer Readiness

| Item ID | Requirement | Related Document | Priority | Pass / Fail / NA | Evidence | Owner | Reviewer | Date | Notes |
|---|---|---|---|---|---|---|---|---|---|
| DIS-01 | Short disclaimer appears in the persistent app footer on all screens | CV-POL-004 §5 | Critical | | | Developer · Compliance Lead | | | Wording must match approved CV-POL-004 §3 text |
| DIS-02 | Full disclaimer appears on the About page or About screen | CV-POL-004 §4 | Critical | | | Developer · Compliance Lead | | | |
| DIS-03 | Full disclaimer or Data Sources page disclaimer appears on the Data Sources page / screen | CV-POL-004 §6 | Critical | | | Developer | | | |
| DIS-04 | Province / territory page disclaimer appears on pages showing named public official profiles or public records | CV-POL-004 §7 | High | | | Developer | | | |
| DIS-05 | Modal / chart source note appears in charts and modals showing transformed or calculated data | CV-POL-004 §8 | High | | | Developer | | | Must include transformation note where applicable |
| DIS-06 | No prohibited claims from CV-POL-004 §11 appear anywhere in the app UI, labels, or status messages | CV-POL-004 | Critical | | | Developer · Compliance Lead | | | Review all screens, cards, modals, and chart labels |
| DIS-07 | OGL-Canada 2.0 attribution notice appears on the Data Sources page | CV-POL-002 · CV-POL-004 | Critical | | | Developer | | | |

---

## 14. Correction Request Readiness

| Item ID | Requirement | Related Document | Priority | Pass / Fail / NA | Evidence | Owner | Reviewer | Date | Notes |
|---|---|---|---|---|---|---|---|---|---|
| COR-01 | Correction request contact path is confirmed and working (email address or in-app form) | CV-SOP-003 | Critical | | | Compliance Lead | | | Required before users can report data errors |
| COR-02 | Correction request intake email or form is monitored — at minimum weekly | CV-SOP-003 §5 | Critical | | | Compliance Lead | | | Unmonitored inbox = no correction process |
| COR-03 | Correction Request Record template (CV-SOP-003 §17.1) is ready for use | CV-SOP-003 | High | | | Compliance Lead | | | |
| COR-04 | Manual Review Register is set up and ready to receive entries | CV-SOP-001 · CV-SOP-003 | High | | | Compliance Lead · Data Lead | | | |

---

## 15. Monthly Update Readiness

| Item ID | Requirement | Related Document | Priority | Pass / Fail / NA | Evidence | Owner | Reviewer | Date | Notes |
|---|---|---|---|---|---|---|---|---|---|
| UPD-01 | Monthly data update process has been executed at least once end-to-end before public launch | CV-SOP-002 | High | | | Data Lead | | | Untested pipeline is a launch risk |
| UPD-02 | CV-SOP-002 Monthly Update Checklist has been completed at least once | CV-SOP-002 §18 | High | | | Data Lead | | | |
| UPD-03 | All active CV-REG-001 entries have a recorded Last Fetched Date | CV-REG-001 | Critical | | | Data Lead | | | No dataset should be in the app without a fetch record |
| UPD-04 | Firestore backup taken before the first public-launch data write | CV-SOP-004 §14 | High | | | Technical Lead | | | |
| UPD-05 | At least one CV-SOP-001 Data Verification Checklist completed for each launch dataset | CV-SOP-001 | Critical | | | Data Lead | | | |

---

## 16. Final Launch Decision

Complete this section after all checklist sections above are reviewed.

### 16.1 Summary

| Item | Count |
|---|---|
| Total Critical items | |
| Critical items — Pass | |
| Critical items — Fail | |
| Critical items — NA | |
| Total High items | |
| High items — Pass | |
| High items — Fail | |
| High items — NA | |
| Open items accepted as risk (High or Medium only) | |

### 16.2 Open Items Register

If any item is marked Fail or left incomplete at the time of the launch decision, list
it here with an owner, resolution plan, and acceptance rationale.

| Item ID | Description | Priority | Owner | Resolution Plan | Target Date | Risk Accepted By | Date |
|---|---|---|---|---|---|---|---|
| | | | | | | | |

### 16.3 Launch Decision

Select one:

- [ ] **Approved for public launch** — all Critical items pass; no unresolved Critical failures.
- [ ] **Approved with open items** — all Critical items pass; one or more High items are open with a documented resolution plan and Founder risk acceptance.
- [ ] **Not approved for launch** — one or more Critical items fail. Launch is blocked until Critical failures are resolved.
- [ ] **Deferred** — launch decision is deferred pending resolution of specific items listed above.

**Decision rationale:**

> _(Enter rationale here when checklist is completed.)_

---

## 17. Approval

This checklist is considered complete when the Compliance Lead and Founder have
reviewed all sections and recorded a launch decision in Section 16.

| Role | Name | Date | Signature / Confirmation |
|---|---|---|---|
| Compliance Lead | TBD | TBD | |
| Data Lead | TBD | TBD | |
| Technical Lead | TBD | TBD | |
| Product Lead | TBD | TBD | |
| Founder | TBD | TBD | |
| Legal Reviewer (if applicable) | TBD | TBD | |

**Checklist completion date:** TBD

**App version reviewed:** TBD

**Build / commit reference:** TBD

---

## 18. Records Generated

The following records are produced as part of completing this checklist.

| Record | When Generated | Retained By | Retention Period |
|---|---|---|---|
| **Completed Pre-Launch Compliance Checklist** (this document, with all fields filled) | On checklist completion | Compliance Lead | Minimum 3 years |
| **Open Issues Register entries** (Section 16.2) | For any Fail or open item at launch decision | Compliance Lead | Until resolved; minimum 3 years |
| **Approval record** (Section 17 sign-offs) | On launch decision | Compliance Lead | Minimum 3 years |
| **Deviation / risk acceptance record** | If launching with open High items formally risk-accepted | Founder · Compliance Lead | Minimum 3 years |

---

## Related Documents

| Document | Status |
|---|---|
| [CV-IDX-001 Canadian Compliance Package Index](../CV-IDX-001%20Canadian%20Compliance%20Package%20Index.md) | Draft |
| [CV-COMP-001 Compliance Position Statement](../CV-COMP-001%20Compliance%20Position%20Statement.md) | Draft |
| [CV-REG-001 Data Source Register](../registers/CV-REG-001%20Data%20Source%20Register.md) | Draft |
| [CV-REG-002 Privacy Data Map](../registers/CV-REG-002%20Privacy%20Data%20Map.md) | Draft |
| [CV-POL-001 Privacy Policy](../policies/CV-POL-001%20Privacy%20Policy.md) | Draft |
| [CV-POL-002 Data Sources and Attribution Policy](../policies/CV-POL-002%20Data%20Sources%20and%20Attribution%20Policy.md) | Draft |
| [CV-POL-003 Terms of Use](../policies/CV-POL-003%20Terms%20of%20Use.md) | Draft |
| [CV-POL-004 Public Disclaimer and Non-Affiliation Statement](../policies/CV-POL-004%20Public%20Disclaimer%20and%20Non-Affiliation%20Statement.md) | Draft |
| [CV-POL-005 Accessibility Statement](../policies/CV-POL-005%20Accessibility%20Statement.md) | Draft |
| [CV-SOP-001 Data Verification SOP](../procedures/CV-SOP-001%20Data%20Verification%20SOP.md) | Draft |
| [CV-SOP-002 Monthly Data Update SOP](../procedures/CV-SOP-002%20Monthly%20Data%20Update%20SOP.md) | Draft |
| [CV-SOP-003 Correction Request Procedure](../procedures/CV-SOP-003%20Correction%20Request%20Procedure.md) | Draft |
| [CV-SOP-004 Security and Firebase Access Procedure](../procedures/CV-SOP-004%20Security%20and%20Firebase%20Access%20Procedure.md) | Draft |
| [CV-SOP-005 CASL Communications Procedure](../procedures/CV-SOP-005%20CASL%20Communications%20Procedure.md) | Draft |
| [CV-CHK-001 Accessibility Checklist](CV-CHK-001%20Accessibility%20Checklist.md) | Draft |

---

> **Final Note:** This checklist is a draft and must be reviewed before public launch
> or App Store submission. The Compliance Lead and Founder should walk through the
> checklist together. Any Critical item that cannot be confirmed as Pass before launch
> must be resolved — it cannot be deferred or risk-accepted.

---

## Change Log

| Version | Date | Author | Change |
|---|---|---|---|
| 0.1 | 2026-08-02 | Founder / Compliance Lead | Initial draft — Canadian launch scope |
