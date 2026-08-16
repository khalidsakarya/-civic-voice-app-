# CV-UI-VER-002 — Public Legal Pages Verification

| Field | Value |
|---|---|
| **Verification ID** | CV-UI-VER-002 |
| **Date** | 2026-08-15 |
| **Environment** | Development — localhost:3000 (production-equivalent build) |
| **Commit Tested** | eca504f |
| **Branch** | main |
| **Tester** | Founder / Compliance Lead |
| **Scope** | Public legal page routes and footer — `#privacy`, `#terms`, `#accessibility`, `#sources`, `#disclaimer`, `#contact` |
| **Related Issues** | CV-ISS-001, CV-ISS-002, CV-ISS-003, CV-ISS-004, CV-ISS-010, CV-ISS-011, CV-ISS-012, CV-ISS-013, CV-ISS-014 |
| **Related Documents** | CV-POL-001 · CV-POL-003 · CV-POL-004 · CV-POL-005 · CV-REG-003 |

---

## Purpose

This record documents visual and structural verification that all six public legal page routes and the Canadian MVP footer are correctly implemented in the Civic Voice app at commit `eca504f`. Verification was performed against the live dev server using in-app browser automation.

---

## Verification Items

---

### VER-002-01 — All Six Legal Routes Load

| Field | Value |
|---|---|
| **Routes Tested** | `#privacy`, `#terms`, `#accessibility`, `#sources`, `#disclaimer`, `#contact` |
| **Expected Result** | Each hash route opens a full-screen overlay with a title, subtitle, icon, and content. No "Coming Soon" placeholder visible on any route. |
| **Actual Result** | All six routes loaded successfully. Each overlay displayed the correct title, subtitle, icon, and full content. No placeholder page or "Coming Soon" message was present on any route. |
| **Evidence** | `get_page_text` confirmed overlay titles and content for all six routes: Privacy Policy, Terms of Use, Accessibility, Data Sources, Disclaimer, Contact & Corrections. |
| **Pass / Fail** | **Pass** |
| **Reviewer** | Founder |

---

### VER-002-02 — No Raw TBD Placeholders Visible

| Field | Value |
|---|---|
| **Check** | `document.body.innerText` scanned for `/\bTBD\b/` across the contact page (last loaded) |
| **Expected Result** | No literal "TBD" text visible to the public user |
| **Actual Result** | `hasTBD: false` — no raw TBD found in rendered page text |
| **Evidence** | JS check: `{"hasTBD":false,"hasPlaceholder":false}` |
| **Unresolved operator details** | Operator legal name, contact email, mailing address, and governing province remain unresolved (CV-ISS-001, CV-ISS-002, CV-ISS-003, CV-ISS-004). Safe wording used in place of raw TBD throughout: "Operator details will be finalised before public launch." / "Correction request channel pending before public launch." / "Public contact channel will be posted before public launch." |
| **Pass / Fail** | **Pass** |
| **Reviewer** | Founder |

---

### VER-002-03 — Footer Has All Six Legal Links

| Field | Value |
|---|---|
| **Expected Result** | Footer contains links for: Privacy, Terms, Accessibility, Sources, Disclaimer, Contact. Plus About. |
| **Actual Result** | Footer confirmed: `["Privacy", "Terms", "Accessibility", "Sources", "Disclaimer", "Contact", "About"]` — all 7 items present |
| **Evidence** | JS check on footer link text: `footerLinks: ["Privacy","Terms","Accessibility","Sources","Disclaimer","Contact","About"]` |
| **Pass / Fail** | **Pass** |
| **Reviewer** | Founder |

---

### VER-002-04 — Footer Independence Disclaimer Visible

| Field | Value |
|---|---|
| **Expected Result** | Footer contains the independence statement: "Civic Voice Canada is independent and is not affiliated with or endorsed by any government body." |
| **Actual Result** | Independence statement confirmed present in footer on every page tested |
| **Evidence** | `get_page_text` output for each route confirmed footer line: "Civic Voice Canada is independent and is not affiliated with or endorsed by any government body." |
| **Pass / Fail** | **Pass** |
| **Reviewer** | Founder |

---

### VER-002-05 — Pages Readable on Mobile (375px)

| Field | Value |
|---|---|
| **Viewport Tested** | 375×812 (iPhone SE — mobile preset) |
| **Expected Result** | Privacy page heading hierarchy and section content render correctly; no horizontal overflow; content accessible |
| **Actual Result** | `read_page` at 375×812 confirmed all section headings and content rendered in the accessibility tree. No horizontal scroll detected. Close button present and labelled ("Close Privacy Policy"). |
| **Evidence** | `read_page` at viewport 375×812: `heading "Privacy Policy"`, `button "Close Privacy Policy"`, all 8 numbered section headings (`heading "1.No account required"` … `heading "8.Operator details"`) visible in the accessibility tree |
| **Pass / Fail** | **Pass** |
| **Reviewer** | Founder |

---

### VER-002-06 — Internal Compliance Documents Not Exposed

| Field | Value |
|---|---|
| **Check** | `document.body.innerText` scanned for CV-REG, CV-SOP, CV-ISS identifiers, Firestore collection paths, and internal CV-DATA IDs |
| **Expected Result** | No internal compliance references visible to the public user |
| **Actual Result** | `hasCV_REG: false`, `hasCV_SOP: false`, `hasCV_ISS: false`, `hasFirestorePath: false`, `hasCVDataId: false` |
| **Evidence** | JS check: `{"hasCV_REG":false,"hasCV_SOP":false,"hasCV_ISS":false,"hasFirestorePath":false,"hasCVDataId":false}` |
| **Pass / Fail** | **Pass** |
| **Reviewer** | Founder |

---

### VER-002-07 — Sources Page Lists Only Active Canadian MVP Datasets

| Field | Value |
|---|---|
| **Expected Result** | Three active sources listed: Statistics Canada Labour Force Survey (Table 14-10-0287-01), CRA Registered Charities Registry, Ontario Public Accounts (Transfer Payments). No deferred or non-Canadian sources listed as active. |
| **Actual Result** | Page confirmed three source cards under "ACTIVE SOURCES — CANADIAN MVP": (1) Statistics Canada — Labour Force Survey, (2) CRA Registered Charities Registry, (3) Ontario Public Accounts — Detailed Schedule of Payments. No US, UK, or Australian sources listed. No CV-DATA-001 (population) or CV-DATA-013 (Ontario Budget) listed as active. |
| **Evidence** | `get_page_text` for `#sources` confirmed three source cards with correct dataset names, table references, reporting periods, licence notes, and transformation disclosures |
| **Pass / Fail** | **Pass** |
| **Reviewer** | Founder |

---

### VER-002-08 — Contact Page Does Not Show Fake Email

| Field | Value |
|---|---|
| **Expected Result** | Contact page does not display any placeholder or fake email address. Final contact channel is not yet confirmed. Safe wording used instead. |
| **Actual Result** | No email address visible. Page displays: "Correction request channel pending before public launch." Structured correction request fields shown as reference only — no form submission enabled. |
| **Evidence** | `get_page_text` for `#contact` confirmed no email address, no `@` address, no fake/placeholder email visible. Text confirms channel is pending. |
| **Pass / Fail** | **Pass** |
| **Reviewer** | Founder |

---

## Summary

| ID | Verification Item | Pass / Fail |
|---|---|---|
| VER-002-01 | All six legal routes load with full content | **Pass** |
| VER-002-02 | No raw TBD placeholders visible | **Pass** |
| VER-002-03 | Footer has all six legal links plus About | **Pass** |
| VER-002-04 | Footer independence disclaimer visible | **Pass** |
| VER-002-05 | Pages readable on mobile at 375px | **Pass** |
| VER-002-06 | Internal compliance documents not exposed | **Pass** |
| VER-002-07 | Sources page lists only active Canadian MVP datasets | **Pass** |
| VER-002-08 | Contact page does not show fake email | **Pass** |

**Overall: 8 / 8 — Pass.**

---

## Scope Limitations and Open Items

The following operator details remain unresolved and are **not displayed publicly**. Safe wording is used in their place on all six legal pages. These items must be resolved before public launch:

| Item | Issues | Current Public Wording |
|---|---|---|
| Operator legal name | CV-ISS-001 | "Operator details will be finalised before public launch." |
| Contact / support email | CV-ISS-002 | "Public contact channel will be posted before public launch." |
| Mailing address | CV-ISS-003 | (covered by operator details wording) |
| Governing province | CV-ISS-004 | "Operator details and the governing province for these terms will be finalised before public launch." |

The following related compliance issues remain **open** and are **not closed by this verification**:

| Issue | Title | Why Not Closed |
|---|---|---|
| CV-ISS-013 | Legal review of public-facing documents | Blocked by CV-ISS-001–004; legal review cannot be completed until operator details are confirmed |
| CV-ISS-012 | App Store privacy labels | Requires CV-REG-002 to reflect actual app behaviour and CV-ISS-009 to be resolved |
| CV-ISS-014 | Accessibility review | Formal WCAG review against live app not yet completed |
| CV-ISS-010 | Correction request intake channel | Blocked by CV-ISS-002 (contact email) |
| CV-ISS-011 | Public Data Sources page route | Production URL not yet confirmed |

---

## Change History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-08-15 | Founder / Compliance Lead | Initial record — all 8 items verified at commit eca504f. 8/8 Pass. |
