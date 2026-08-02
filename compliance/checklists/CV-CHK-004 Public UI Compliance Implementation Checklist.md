# CV-CHK-004 — Public UI Compliance Implementation Checklist

| Field | Value |
|---|---|
| **Document ID** | CV-CHK-004 |
| **Version** | 0.1 |
| **Status** | Draft |
| **Owner** | Founder / Product Lead |
| **Effective Date** | TBD — pending review |
| **Scope** | Civic Voice Canada only |
| **Related Documents** | CV-PLAN-001 Public Legal Pages Implementation Plan · CV-PLAN-002 Canadian Launch Scope Control Plan · CV-POL-001 Privacy Policy · CV-POL-002 Data Sources and Attribution Policy · CV-POL-003 Terms of Use · CV-POL-004 Public Disclaimer and Non-Affiliation Statement · CV-POL-005 Accessibility Statement · CV-CHK-002 Pre-Launch Compliance Checklist · CV-REG-003 Open Issues Register |
| **Review Frequency** | Before public launch; before App Store submission; before any major UI change that affects legal links, disclaimers, navigation scope, or data display labels |

---

> ⚠️ **DRAFT — NOT YET COMPLETED**
>
> This checklist has not been completed against the live app. All Pass/Fail/NA fields
> are blank. This checklist must be completed, evidenced, and signed off before
> Civic Voice Canada is launched publicly or submitted to the App Store.
>
> This checklist verifies UI implementation only. It does not substitute for the
> content readiness gates in CV-PLAN-001 §9 (legal documents must be Approved before
> links go live) or the data readiness checks in CV-CHK-002.

---

## 1. Purpose

This checklist defines the public UI compliance items that must be implemented and
verified before Civic Voice Canada is launched publicly.

Its goals are to:

- Confirm that all public legal links are present and functional in the app footer
  and About/Settings screen.
- Confirm that disclaimer wording appears in all required locations.
- Confirm that the app's public UI reflects the Canadian-only launch scope defined
  in CV-PLAN-002.
- Confirm that non-Canadian jurisdictions are hidden from navigation and that direct
  routes to hidden content are handled gracefully.
- Confirm that data display labels, source attribution, and status labels use approved
  wording only and contain no prohibited claims.
- Confirm that privacy and consent UI controls are in place for any enabled feature
  that requires them.
- Confirm that public legal pages and core UI are accessible on mobile and meet
  minimum accessibility requirements.
- Confirm that App Store screenshots and marketing materials accurately represent
  the Canadian-only launch scope.
- Produce a signed evidence record that supports the CV-CHK-002 pre-launch gate and
  satisfies the implementation obligations in CV-PLAN-001 and CV-PLAN-002.

---

## 2. Scope

This checklist covers:

- App footer and in-app navigation legal links
- Disclaimer wording placement and accuracy
- Homepage, menu, selector, and dashboard card scope (Canada-only)
- Hidden jurisdiction UI handling and direct-route fallback
- Source attribution labels on charts, modals, and data tables
- Data freshness and reporting period display
- Manual review and missing data status labels
- Prohibited claims audit across all public UI surfaces
- Privacy and consent UI for enabled features
- Mobile usability and accessibility of legal and core pages
- App Store screenshot and marketing scope accuracy

This checklist does **not** cover:

- Legal content review of the policy documents themselves — that is governed by the
  content readiness gates in CV-PLAN-001 §9 and requires legal counsel sign-off.
- Backend data pipeline verification — that is covered by CV-SOP-001 and CV-SOP-002.
- Full WCAG 2.1 AA accessibility audit — that is covered by CV-CHK-001.
- App Store privacy label declarations — that is covered by CV-CHK-003.

---

## 3. Public Legal Link Requirements

All public legal links must be present, functional, and pointing to live Approved
pages before public launch.

> **Dependency:** All linked pages must have passed the content readiness gates in
> CV-PLAN-001 §9 before these items can be marked Pass. A link to a page containing
> TBD placeholders or Draft warnings does not pass.

| Item ID | UI Area | Requirement | Related Document | Priority | Pass / Fail / NA | Evidence | Owner | Reviewer | Date | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| LL-01 | App footer | Footer contains a **Privacy** link pointing to `/privacy` or equivalent live page | CV-POL-001 · CV-PLAN-001 | Critical | | | | | | |
| LL-02 | App footer | Footer contains a **Terms** link pointing to `/terms` or equivalent live page | CV-POL-003 · CV-PLAN-001 | Critical | | | | | | |
| LL-03 | App footer | Footer contains an **Accessibility** link pointing to `/accessibility` or equivalent live page | CV-POL-005 · CV-PLAN-001 | Critical | | | | | | |
| LL-04 | App footer | Footer contains a **Sources** link pointing to `/sources` or equivalent live page | CV-POL-002 · CV-PLAN-001 | Critical | | | | | | |
| LL-05 | App footer | Footer contains a **Disclaimer** link pointing to `/disclaimer` or equivalent live page | CV-POL-004 · CV-PLAN-001 | Critical | | | | | | |
| LL-06 | App footer | Footer contains a **Contact** or **Corrections** link pointing to `/corrections`, `/contact`, or a confirmed intake email | CV-SOP-003 · CV-PLAN-001 | Critical | | | | | | |
| LL-07 | About / Settings screen | About or Settings screen includes links to Privacy, Terms, Accessibility, and Contact/Corrections | CV-PLAN-001 | High | | | | | | |
| LL-08 | All legal link targets | All linked legal pages are live, publicly accessible, and contain no TBD placeholders or Draft warnings | CV-PLAN-001 §9 | Critical | | | | | | |
| LL-09 | All legal link targets | All legal page URLs are confirmed and entered in App Store Connect privacy URL and support URL fields | CV-CHK-002 · CV-CHK-003 | Critical | | | | | | |
| LL-10 | Mobile | All footer legal links are tappable on mobile viewports (320px and above) with adequate tap target size | CV-POL-005 · CV-PLAN-001 | High | | | | | | |

---

## 4. Disclaimer Display Requirements

The short-form and full-form disclaimer from CV-POL-004 must appear in all required
locations.

| Item ID | UI Area | Requirement | Related Document | Priority | Pass / Fail / NA | Evidence | Owner | Reviewer | Date | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| DIS-01 | App footer | Footer displays the short-form non-affiliation disclaimer from CV-POL-004 §6.1 | CV-POL-004 | Critical | | | | | | Exact wording must match CV-POL-004 §6.1 approved text |
| DIS-02 | About / Info page | About page displays the full-form disclaimer from CV-POL-004 §6.2 or a clearly visible link to `/disclaimer` | CV-POL-004 | Critical | | | | | | |
| DIS-03 | Data display pages | Each page that displays official civic data (MP profiles, senator profiles, vote records, government body pages) displays the short-form disclaimer as a footer note or tap-accessible information element | CV-POL-004 · CV-PLAN-001 | Critical | | | | | | At minimum one of: inline footer note, sticky disclaimer bar, or tap-accessible info tooltip |
| DIS-04 | App Store listing | App Store listing description includes the short-form disclaimer or an approved non-affiliation statement | CV-POL-004 · CV-PLAN-002 | High | | | | | | |
| DIS-05 | Disclaimer wording accuracy | Disclaimer wording in the UI exactly matches the approved wording in CV-POL-004 — no paraphrasing, shortening, or modification without approval | CV-POL-004 | Critical | | | | | | Any wording change requires CV-POL-004 update and re-approval |

---

## 5. Canada-Only Scope Display Requirements

The public UI must reflect the Canadian-only launch scope defined in CV-PLAN-002.

| Item ID | UI Area | Requirement | Related Document | Priority | Pass / Fail / NA | Evidence | Owner | Reviewer | Date | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| CAN-01 | Homepage | Homepage shows only Canadian jurisdiction content — federal, provincial, and territorial. No US, UK, or Australian jurisdiction cards, links, or entry points are visible. | CV-PLAN-002 | Critical | | | | | | |
| CAN-02 | Navigation menus | Navigation menus and top-level app navigation contain only Canadian jurisdictions. No non-Canadian jurisdiction navigation items are visible to users. | CV-PLAN-002 | Critical | | | | | | |
| CAN-03 | Jurisdiction selector | If a jurisdiction selector or country/region picker exists, it lists only Canadian provinces and territories. No non-Canadian options are present. | CV-PLAN-002 | Critical | | | | | | |
| CAN-04 | Dashboard cards | Dashboard cards, feature highlights, and any grid or list of coverage areas show only Canadian federal, provincial, and territorial content. | CV-PLAN-002 | Critical | | | | | | |
| CAN-05 | Explorer entry points | Explorer, browse-by-jurisdiction, and category-based entry points show only Canadian content. | CV-PLAN-002 | Critical | | | | | | |
| CAN-06 | Province / territory selector (vote gate) | The province/territory selector used for the citizen-opinion vote gate lists only Canadian provinces and territories. No non-Canadian options are present. | CV-PLAN-002 | Critical | | | | | | |
| CAN-07 | Onboarding | If the app includes an onboarding flow with a jurisdiction or location prompt, it offers only Canadian options. | CV-PLAN-002 | High | | | | | | Mark NA if no onboarding flow exists |
| CAN-08 | Search | If a search feature exists, search results do not surface hidden jurisdiction content in the Canadian launch UI. | CV-PLAN-002 | High | | | | | | Mark NA if no search feature exists |

---

## 6. Hidden Jurisdiction Handling

Non-Canadian jurisdictions must be hidden and direct routes must be handled gracefully.

| Item ID | UI Area | Requirement | Related Document | Priority | Pass / Fail / NA | Evidence | Owner | Reviewer | Date | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| HID-01 | US routes | Navigating directly to a US jurisdiction route shows a calm unavailable message and a link back to Canadian content. The message does not expose internal details, does not render US data, and does not return a bare 404 or unhandled error. | CV-PLAN-002 §8 | Critical | | | | | | |
| HID-02 | UK routes | Navigating directly to a UK jurisdiction route shows the same unavailable message treatment as HID-01. | CV-PLAN-002 §8 | Critical | | | | | | |
| HID-03 | Australia routes | Navigating directly to an Australian jurisdiction route shows the same unavailable message treatment as HID-01. | CV-PLAN-002 §8 | Critical | | | | | | |
| HID-04 | Unavailable message wording | The unavailable message wording is calm, non-alarming, and consistent with CV-POL-004 (no prohibited claims, no commitment to a specific reactivation date unless confirmed). | CV-PLAN-002 §8.2 · CV-POL-004 | High | | | | | | |
| HID-05 | No data leakage | The unavailable page does not render any names, titles, data, or metadata from the hidden jurisdiction — even partially. | CV-PLAN-002 §8.3 | Critical | | | | | | |
| HID-06 | Hide-not-delete — code | Non-Canadian jurisdiction source files, components, and engine logic are present in the codebase and have not been deleted. Feature flagging or conditional rendering is used to hide them. | CV-PLAN-002 §6 | High | | | | | | Verify in codebase; not a UI item |
| HID-07 | Hide-not-delete — Firestore | Non-Canadian Firestore collections and documents have not been deleted. Data is retained and access-controlled, not removed. | CV-PLAN-002 §6.2 | High | | | | | | Verify in Firestore; not a UI item |

---

## 7. Source Attribution Display Requirements

Data sourced from official Canadian government datasets must display attribution
consistently with CV-POL-002 and CV-REG-001.

| Item ID | UI Area | Requirement | Related Document | Priority | Pass / Fail / NA | Evidence | Owner | Reviewer | Date | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| SRC-01 | Charts and data modals | Charts, data modals, and detail views for official data display the **source name** (e.g., "Source: Parliament of Canada Open Data") where practical | CV-POL-002 · CV-REG-001 | High | | | | | | "Where practical" means at minimum on detail views and charts; brief dashboard cards may use a footer-level attribution |
| SRC-02 | Charts and data modals | Charts and data modals display the **reporting period** for the underlying data where this is available and meaningful | CV-POL-002 · CV-REG-001 | High | | | | | | |
| SRC-03 | Charts and data modals | Charts and data modals display the **fetched date** or last-updated date where this is available | CV-POL-002 · CV-SOP-002 | High | | | | | | |
| SRC-04 | Charts and data modals | If a **transformation note** applies to the data (e.g., calculated totals, aggregated categories, normalised figures), this is disclosed in the data view or a tap-accessible note | CV-POL-002 | Medium | | | | | | |
| SRC-05 | /sources page | The `/sources` page (or equivalent) is live, publicly accessible, and lists only approved source entries from CV-REG-001 — no entries with Licence Status: Review Required or TBD | CV-POL-002 · CV-REG-001 · CV-PLAN-001 | Critical | | | | | | |
| SRC-06 | /sources page | The `/sources` page does not expose the full CV-REG-001 internal register — only the public fields: source name, jurisdiction, licence name, and attribution wording | CV-PLAN-001 §10.8 | Critical | | | | | | |

---

## 8. Data Freshness Display Requirements

Users must be able to identify how current the displayed data is.

| Item ID | UI Area | Requirement | Related Document | Priority | Pass / Fail / NA | Evidence | Owner | Reviewer | Date | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| FRESH-01 | Data display pages | Data display pages show a "last updated" or equivalent freshness indicator where the underlying data has a known fetch date | CV-SOP-002 · CV-POL-002 | High | | | | | | |
| FRESH-02 | Data display pages | The freshness indicator accurately reflects the date the data was last fetched from the source — not the date the page was built or deployed | CV-SOP-002 | High | | | | | | |
| FRESH-03 | Data display pages | The label "Latest official reporting period shown" or equivalent approved wording is used where the data reflects the most recent available official period, not a real-time feed | CV-POL-004 | Medium | | | | | | |

---

## 9. Manual Review / Missing Data Label Requirements

Data that has not yet been verified or loaded must use approved status labels only.

| Item ID | UI Area | Requirement | Related Document | Priority | Pass / Fail / NA | Evidence | Owner | Reviewer | Date | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| LABEL-01 | Any data field not yet loaded | Data fields or sections where official data has not yet been loaded display the label **"Official data not loaded yet"** or an approved equivalent — not blank, not a placeholder number, not "N/A" used as a data value | CV-SOP-001 · CV-POL-004 | Critical | | | | | | |
| LABEL-02 | Any data field under review | Data fields or sections where the loaded data is pending verification display the label **"Manual review required"** or an approved equivalent | CV-SOP-001 · CV-POL-004 | Critical | | | | | | |
| LABEL-03 | Any source temporarily unavailable | If a data source is temporarily unavailable or a scheduled fetch has not yet completed, the affected display shows **"Source unavailable"** or an approved equivalent — not an empty card or a stale cached value without a staleness notice | CV-SOP-002 · CV-POL-004 | High | | | | | | |
| LABEL-04 | Status label consistency | All status labels across the app use the same approved wording set. There are no ad-hoc or developer-authored status strings that have not been reviewed. | CV-SOP-001 · CV-POL-004 | High | | | | | | |
| LABEL-05 | No fake or demo data | No Canadian launch page displays fake, demo, generated, or placeholder data as if it were real civic information. All data visible to users in the Canadian launch UI is sourced from a cleared CV-REG-001 entry. | CV-PLAN-002 §10 (REACT-09) · CV-POL-004 | Critical | | | | | | |

---

## 10. Prohibited Claims UI Check

The app UI must not contain any of the following prohibited claims in any visible
text, label, tooltip, onboarding copy, marketing panel, or metadata.

| Item ID | UI Area | Prohibited Claim | Related Document | Priority | Pass / Fail / NA | Evidence | Owner | Reviewer | Date | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| PROH-01 | All UI surfaces | **"Corruption score"** or any wording that scores, ranks, or implies a corruption determination for an individual official or government body | CV-POL-004 §5 | Critical | | | | | | |
| PROH-02 | All UI surfaces | **"Detects corruption"** or any wording that implies the app identifies, detects, or flags corrupt behaviour | CV-POL-004 §5 | Critical | | | | | | |
| PROH-03 | All UI surfaces | **"Tells you who to vote for"** or any wording that makes a voting recommendation, endorsement, or partisan suggestion | CV-POL-004 §5 | Critical | | | | | | |
| PROH-04 | All UI surfaces | **"Legal determination"** or any wording that implies the app makes legal findings, liability assessments, or determinations of wrongdoing | CV-POL-004 §5 | Critical | | | | | | |
| PROH-05 | All UI surfaces | **"Investment signal"** or any wording that implies the app provides investment advice, financial signals, or market-relevant assessments | CV-POL-004 §5 | Critical | | | | | | |
| PROH-06 | All UI surfaces | **"Guaranteed accurate"** or any wording that represents data as certified, guaranteed, or error-free | CV-POL-004 §5 | Critical | | | | | | |
| PROH-07 | All UI surfaces | **"Official government app"** or any wording that implies government endorsement, official government status, or affiliation with any government body | CV-POL-004 §5 | Critical | | | | | | |
| PROH-08 | All UI surfaces | Any **government seal, crest, logo, or official identifier** used in a way that implies government authorship or endorsement | CV-POL-004 §5 | Critical | | | | | | |
| PROH-09 | All UI surfaces | Any claim of **exclusive or proprietary access** to public civic data (e.g., "only available here", "our exclusive government data") | CV-POL-004 §5 | High | | | | | | |
| PROH-10 | All UI surfaces | Any claim that civic opinion data reflects a **statistically representative sample** or constitutes an **official poll or survey** | CV-POL-004 §5 | High | | | | | | |

---

## 11. Privacy and Consent UI Check

Privacy and consent UI controls must be present for any feature that requires them.

| Item ID | UI Area | Requirement | Related Document | Priority | Pass / Fail / NA | Evidence | Owner | Reviewer | Date | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| PRIV-01 | Follow / save feature | If a follow or save feature exists, it is clearly presented as UI-only (device-local storage) unless accounts or push notifications are actually enabled. There is no implication that followed items are synced, persisted cross-device, or tied to a user identity when they are not. | CV-POL-001 · CV-REG-002 | High | | | | | | |
| PRIV-02 | Accounts feature | If user accounts are enabled, a privacy notice or link to the Privacy Policy is displayed at the account creation or sign-in screen before data is collected | CV-POL-001 · CV-REG-002 | Critical | | | | | | Mark NA if accounts are not enabled at launch |
| PRIV-03 | Push notifications | If push notifications are enabled, the app requests device permission before registering a notification token, and the purpose of notifications is explained at the permission prompt | CV-POL-001 · CV-SOP-005 · CV-REG-002 | Critical | | | | | | Mark NA if push notifications are not enabled at launch |
| PRIV-04 | Analytics | If an analytics SDK is enabled (e.g., Firebase Analytics), the Privacy Policy discloses analytics data collection before the SDK is active in the live app | CV-POL-001 · CV-REG-002 · CV-CHK-003 | Critical | | | | | | Mark NA if no analytics SDK is deployed; depends on CV-ISS-006 |
| PRIV-05 | Crash reporting | If a crash reporting SDK is enabled (e.g., Crashlytics), the Privacy Policy discloses crash data collection | CV-POL-001 · CV-REG-002 · CV-CHK-003 | Critical | | | | | | Mark NA if no crash reporting SDK is deployed; depends on CV-ISS-007 |
| PRIV-06 | Feedback / correction form | If an in-app feedback or correction request form is deployed, a privacy notice or link to the Privacy Policy is displayed before the form is submitted | CV-POL-001 · CV-SOP-003 | High | | | | | | Mark NA if no in-app form is deployed at launch |
| PRIV-07 | Location permission | If the app requests GPS location permission to resolve the user's province/territory, the purpose is explained at the permission prompt before the request is made | CV-POL-001 · CV-REG-002 | Critical | | | | | | |
| PRIV-08 | CASL consent | No push notification, email, or other electronic communication is sent before CASL-compliant express consent is obtained, as defined in CV-SOP-005 | CV-SOP-005 · CV-POL-001 | Critical | | | | | | Mark NA if no communication features are deployed at launch |

---

## 12. Accessibility UI Check

This section covers minimum accessibility requirements for the public UI. For the full
WCAG 2.1 AA audit, see CV-CHK-001.

| Item ID | UI Area | Requirement | Related Document | Priority | Pass / Fail / NA | Evidence | Owner | Reviewer | Date | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| ACC-01 | All public pages | App is usable on mobile viewports (320px and above). Core navigation, legal links, and data pages do not require horizontal scrolling on standard mobile widths. | CV-POL-005 · CV-PLAN-001 | Critical | | | | | | |
| ACC-02 | Legal pages | All public legal pages (`/privacy`, `/terms`, `/accessibility`, `/disclaimer`, `/sources`, `/corrections`) are readable on mobile without horizontal scrolling and with text that can be enlarged by the user's OS accessibility settings | CV-POL-005 · CV-PLAN-001 | Critical | | | | | | |
| ACC-03 | Footer links | Footer legal links are accessible via screen reader and have descriptive link text (not "click here" or bare URLs) | CV-POL-005 · CV-CHK-001 | High | | | | | | |
| ACC-04 | Charts | Charts and data visualisations have accessible labels, ARIA descriptions, or text summaries where practical so that screen reader users can access the underlying information | CV-POL-005 · CV-CHK-001 | High | | | | | | Mark NA if no charts are present in the Canadian launch build |
| ACC-05 | Tables | Data tables use proper `<th>` headers or ARIA table roles so that screen reader users can navigate them | CV-CHK-001 | High | | | | | | Mark NA if no tables are present |
| ACC-06 | Colour contrast | Text and interactive elements meet WCAG 2.1 AA colour contrast ratios (4.5:1 for normal text, 3:1 for large text and UI components) | CV-CHK-001 | High | | | | | | Full contrast audit is in CV-CHK-001; this item is a spot-check for legal pages and key data pages |
| ACC-07 | Tap targets | Interactive tap targets (buttons, links, form fields) on mobile meet minimum size requirements (44×44 CSS pixels or equivalent) | CV-CHK-001 | High | | | | | | |

---

## 13. App Store Screenshot / Marketing UI Check

App Store assets and marketing materials must accurately represent the Canadian-only
launch scope.

| Item ID | UI Area | Requirement | Related Document | Priority | Pass / Fail / NA | Evidence | Owner | Reviewer | Date | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| MKT-01 | App Store screenshots | App Store screenshots show only Canadian federal, provincial, or territorial content. No US, UK, or Australian jurisdiction content appears in any screenshot. | CV-PLAN-002 · CV-CHK-002 | Critical | | | | | | |
| MKT-02 | App Store screenshots | App Store screenshots do not display any prohibited claim from Section 10 of this checklist. | CV-POL-004 · CV-PLAN-002 | Critical | | | | | | |
| MKT-03 | App Store screenshots | App Store screenshots do not display fake, demo, or placeholder data as if it were real civic information. | CV-PLAN-002 §10 (REACT-09) | Critical | | | | | | |
| MKT-04 | App Store description | App Store listing description accurately represents the Canadian scope and does not claim coverage of jurisdictions that are hidden at launch. | CV-PLAN-002 · CV-POL-004 | Critical | | | | | | |
| MKT-05 | App Store description | App Store listing description includes the approved short-form disclaimer or non-affiliation statement from CV-POL-004 §6.1. | CV-POL-004 | High | | | | | | |
| MKT-06 | App Store description | App Store listing description does not contain any prohibited claim from CV-POL-004 §5. | CV-POL-004 | Critical | | | | | | |
| MKT-07 | Launch marketing | All launch marketing materials (website, social, press, in-app onboarding) accurately represent the Canadian-only scope and contain no prohibited claims. | CV-POL-004 · CV-PLAN-002 | High | | | | | | |

---

## 14. Implementation Verification Checklist

Before this checklist can be signed off, the following cross-cutting verifications
must be completed.

| Item ID | Verification | Related Sections | Pass / Fail / NA | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|---|---|
| VER-01 | All Critical items in Sections 3–13 are Pass or NA | All | | | | | No Critical item may be Fail at launch |
| VER-02 | All content readiness gates in CV-PLAN-001 §9 are resolved | Section 3 | | | | | Legal pages must be Approved before LL-01 through LL-09 can pass |
| VER-03 | CV-CHK-002 App Store submission section is complete | Section 13 | | | | | |
| VER-04 | CV-CHK-003 App Store Privacy Labels Checklist is signed off | Section 11 | | | | | |
| VER-05 | CV-CHK-001 Accessibility Checklist is completed for the live app | Section 12 | | | | | |
| VER-06 | CV-PLAN-002 Launch Scope Decision Record and Feature Flag / UI Visibility Review Record are generated | Sections 5, 6 | | | | | |
| VER-07 | CV-REG-003 Open Issues Register reviewed — no Critical issues remain open that affect public UI | All | | | | | |
| VER-08 | Screenshot evidence for footer/legal links captured and retained | Section 3 | | | | | See Section 15 |
| VER-09 | Screenshot evidence for Canada-only navigation captured and retained | Section 5 | | | | | See Section 15 |
| VER-10 | Screenshot evidence for hidden jurisdiction route handling captured and retained | Section 6 | | | | | See Section 15 |
| VER-11 | Screenshot evidence for source attribution labels captured and retained | Section 7 | | | | | See Section 15 |

---

## 15. Records Generated

| Record | When Generated | Retained By | Retention Period |
|---|---|---|---|
| **Completed Public UI Compliance Implementation Checklist** (this document, all fields filled) | On checklist completion before public launch | Product Lead | Minimum 3 years |
| **Screenshot evidence — footer and legal links** | On completion of Section 3 items | Product Lead | Minimum 3 years |
| **Screenshot evidence — Canada-only navigation** | On completion of Section 5 items | Product Lead | Minimum 3 years |
| **Screenshot evidence — hidden jurisdiction route handling** (showing unavailable message for US, UK, Australia routes) | On completion of Section 6 items | Product Lead | Minimum 3 years |
| **Screenshot evidence — source attribution labels** (showing source name, reporting period, fetched date on data display pages) | On completion of Section 7 items | Product Lead | Minimum 3 years |
| **Open Issues Register updates** (CV-REG-003) | For any item that cannot be passed before launch — must be recorded as a known open issue with a resolution plan | Compliance Lead | Until issue is closed |

---

## 16. Approval

This checklist is considered complete when:

1. All Critical items in Sections 3–13 are marked Pass or NA with evidence recorded.
2. All verification items in Section 14 are confirmed.
3. All records in Section 15 have been generated and retained.
4. The Product Lead and Founder have signed off below.

Any item marked Fail at the time of sign-off must be recorded as an open issue in
CV-REG-003 with a resolution plan and target date.

| Role | Name | Date | Confirmation |
|---|---|---|---|
| Product Lead | TBD | TBD | |
| Privacy Lead | TBD | TBD | |
| Developer | TBD | TBD | |
| Founder | TBD | TBD | |

**Checklist completion date:** TBD

**App version / build reviewed:** TBD

---

## Related Documents

| Document | Status |
|---|---|
| [CV-PLAN-001 Public Legal Pages Implementation Plan](../plans/CV-PLAN-001%20Public%20Legal%20Pages%20Implementation%20Plan.md) | Draft |
| [CV-PLAN-002 Canadian Launch Scope Control Plan](../plans/CV-PLAN-002%20Canadian%20Launch%20Scope%20Control%20Plan.md) | Draft |
| [CV-POL-001 Privacy Policy](../policies/CV-POL-001%20Privacy%20Policy.md) | Draft |
| [CV-POL-002 Data Sources and Attribution Policy](../policies/CV-POL-002%20Data%20Sources%20and%20Attribution%20Policy.md) | Draft |
| [CV-POL-003 Terms of Use](../policies/CV-POL-003%20Terms%20of%20Use.md) | Draft |
| [CV-POL-004 Public Disclaimer and Non-Affiliation Statement](../policies/CV-POL-004%20Public%20Disclaimer%20and%20Non-Affiliation%20Statement.md) | Draft |
| [CV-POL-005 Accessibility Statement](../policies/CV-POL-005%20Accessibility%20Statement.md) | Draft |
| [CV-CHK-001 Accessibility Checklist](CV-CHK-001%20Accessibility%20Checklist.md) | Draft |
| [CV-CHK-002 Pre-Launch Compliance Checklist](CV-CHK-002%20Pre-Launch%20Compliance%20Checklist.md) | Draft |
| [CV-CHK-003 App Store Privacy Labels Checklist](CV-CHK-003%20App%20Store%20Privacy%20Labels%20Checklist.md) | Draft |
| [CV-REG-003 Open Issues Register](../registers/CV-REG-003%20Open%20Issues%20Register.md) | Draft |
| [CV-IDX-001 Canadian Compliance Package Index](../CV-IDX-001%20Canadian%20Compliance%20Package%20Index.md) | Draft |

---

## Change Log

| Version | Date | Author | Change |
|---|---|---|---|
| 0.1 | 2026-08-02 | Founder / Product Lead | Initial draft — Canadian launch scope |
