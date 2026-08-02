# CV-SRC-REV-003 — Government of Canada Budget Review

| Field | Value |
|---|---|
| **Review Record ID** | CV-SRC-REV-003 |
| **Related Source ID (CV-REG-001)** | SRC-FED-003 |
| **Source Name** | Government of Canada — Federal Budget |
| **Jurisdiction** | Canada Federal |
| **Data Category** | Federal budget · Fiscal plan · Government expenditure |
| **Review Status** | Draft |
| **Reviewer** | Founder / Data Lead |
| **Review Date** | 2026-08-02 |
| **Related Documents** | CV-REG-001 Data Source Register · CV-CHK-005 Canadian Source Review Checklist · CV-SOP-001 Data Verification SOP · CV-POL-002 Data Sources and Attribution Policy |

---

> ℹ️ **DRAFT — APPROVED WITH LIMITATIONS**
>
> **Source owner confirmed. Licence confirmed (OGL-Canada 2.0). Attribution confirmed.**
>
> **Remaining limitations** (must be resolved before data is written to Firestore or displayed):
> - Specific budget year / edition for the app has not been confirmed
> - Format decision (PDF budget vs Fiscal Reference Tables XLSX vs open.canada.ca CSV) not finalised
> - Fetched date: not yet fetched
> - Transformation approach: TBD
> - App display location: TBD
> - Firestore collection and schema: TBD

---

## 1. Purpose

This record documents the source review for federal budget data published by the
Department of Finance Canada. Federal budget documents and open fiscal data are used in
Civic Voice Canada to provide civic context on government spending and priorities.

**Preferred source path:** The Fiscal Reference Tables (XLSX, updated annually) published
by the Department of Finance Canada on canada.ca are the recommended machine-readable
source for federal fiscal data. The official Budget document is PDF-only and requires
manual extraction. Open-data fiscal datasets on open.canada.ca may supplement or replace
the XLSX path; confirm at data fetch time.

---

## 2. Source Identification

| Field | Value |
|---|---|
| **Source owner / publisher** | Department of Finance Canada (Government of Canada) |
| **Source URL — budget page** | https://www.canada.ca/en/department-finance/services/publications/federal-budget.html |
| **Source URL — Fiscal Reference Tables** | https://www.canada.ca/en/department-finance/services/publications/fiscal-reference-tables.html |
| **Source URL — Department of Finance open data** | https://open.canada.ca/data/en/organization/fin (confirm applicable dataset IDs) |
| **Source format** | XLSX (Fiscal Reference Tables — recommended); PDF (official Budget document); CSV (open.canada.ca datasets where available) |
| **Data type** | Federal fiscal aggregates: revenues, expenditures, deficit/surplus, debt, departmental spending, major transfers |
| **Reporting period** | TBD — confirm which budget year/edition will be displayed in the app (most recently available at launch) |
| **Fetched date** | Not yet fetched |
| **Licence / terms reference** | Open Government Licence – Canada 2.0 — https://open.canada.ca/en/open-government-licence-canada |
| **Review trigger** | Pre-launch review (Step 23) |

---

## 3. Source Eligibility Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| ELG-01: Source is an approved type | **Pass** | Department of Finance Canada is the official federal fiscal authority. Fiscal Reference Tables (XLSX) and open.canada.ca datasets are official Government of Canada publications. Approved types under CV-POL-002 §3. | Founder / Data Lead | 2026-08-02 | |
| ELG-02: Source is not a prohibited type | **Pass** | Official government publication — not a news site, Wikipedia, or unofficial aggregator. | Founder / Data Lead | 2026-08-02 | |
| ELG-03: Source owner identified | **Pass** | Department of Finance Canada — confirmed. Federal government ministry responsible for fiscal policy and budget. | Founder / Data Lead | 2026-08-02 | |
| ELG-04: Source URL recorded | **Pass** | Primary URLs confirmed: budget page, Fiscal Reference Tables, open.canada.ca/fin. Specific open.canada.ca dataset IDs to be confirmed at data fetch time. | Founder / Data Lead | 2026-08-02 | Confirm specific dataset ID on open.canada.ca if that path is used |
| ELG-05: Source publicly accessible | **Pass** | All identified URLs are publicly accessible without login or paywall. XLSX download from Fiscal Reference Tables page is free. | Founder / Data Lead | 2026-08-02 | |
| ELG-06: Data relevant to civic purpose | **Pass** | Federal budget and fiscal data is core civic accountability information — government revenue, expenditure, deficit, major transfers. | Founder / Data Lead | 2026-08-02 | |

---

## 4. Licence / Terms Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| LIC-01: Licence identified | **Pass** | Open Government Licence – Canada 2.0 — https://open.canada.ca/en/open-government-licence-canada. Applies to Government of Canada open data and information publications. | Founder / Data Lead | 2026-08-02 | |
| LIC-02: Licence permits reuse | **Pass** | OGL-Canada 2.0: "You are free to copy, modify, publish, translate, adapt, distribute or otherwise use the Information in any medium, mode or format for any lawful purpose." | Founder / Data Lead | 2026-08-02 | |
| LIC-03: Attribution required | **Pass** | OGL-Canada 2.0 requires: "Contains information licensed under the Open Government Licence – Canada." | Founder / Data Lead | 2026-08-02 | See Section 5 for confirmed wording |
| LIC-04: No prohibited uses | **Pass** | No prohibited uses applicable to non-commercial civic information display of aggregate fiscal data. | Founder / Data Lead | 2026-08-02 | |
| LIC-05: Licence Status | **Approved** | OGL-Canada 2.0 reviewed and confirmed to permit display, transformation, and attribution as intended. | Founder / Data Lead | 2026-08-02 | Update CV-REG-001 SRC-FED-003 Licence Status to Approved |
| LIC-06: Licence version noted | **Pass** | Open Government Licence – Canada, version 2.0. | Founder / Data Lead | 2026-08-02 | |
| LIC-07: Terms change monitoring noted | **Pass** | Monitor open.canada.ca/en/open-government-licence-canada at each annual data update cycle per CV-SOP-002. | Founder / Data Lead | 2026-08-02 | |

---

## 5. Attribution Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| ATT-01: Attribution wording confirmed | **Pass** | **Confirmed wording:** "Source: Department of Finance Canada — Federal Budget [year], Government of Canada. Contains information licensed under the Open Government Licence – Canada. Fetched [date]." | Founder / Data Lead | 2026-08-02 | Fill in [year] and [date] at time of fetch |
| ATT-02: Attribution recorded in CV-REG-001 | **Pass** | Attribution wording recorded in CV-REG-001 SRC-FED-003 Notes and Attribution Statements section. | Founder / Data Lead | 2026-08-02 | |
| ATT-03: Attribution placement in UI | **Needs Review** | App display location not yet confirmed — attribution placement TBD. | | | |
| ATT-04: Attribution consistent with licence | **Pass** | Wording in ATT-01 meets OGL-Canada 2.0 attribution requirement. | Founder / Data Lead | 2026-08-02 | |

---

## 6. Reporting Period Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| RPT-01: Reporting period identified | **Needs Review** | Annual federal budget; specific year/edition (e.g., Budget 2024, Budget 2025) not yet confirmed for the app. Confirm which year will be displayed at launch. | | | Confirm at data fetch time |
| RPT-02: Reporting period accurate | **Needs Review** | Confirm against Department of Finance publications at fetch time. | | | |
| RPT-03: Source update frequency known | **Pass** | Annual — tabled on Budget Day each spring. Fiscal Reference Tables updated annually after budget. | Founder / Data Lead | 2026-08-02 | |
| RPT-04: App update frequency defined | **Needs Review** | Expected: annual update following each federal budget. Confirm in CV-SOP-002 update schedule. | | | |
| RPT-05: Staleness risk noted | **Pass** | Annual data with a clear release date. Staleness risk is low once reporting year is confirmed and update schedule is set. Display a "Budget [year]" label in the app to make the period visible to users. | Founder / Data Lead | 2026-08-02 | |

---

## 7. Machine-Readability Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| MR-01: Machine-readability classified | **Yes (Fiscal Reference Tables path) / Partial (PDF path)** | Fiscal Reference Tables (XLSX): machine-readable — Yes. Official Budget document (PDF): machine-readable — Partial (requires manual extraction or PDF parsing). Recommended path: XLSX. | Founder / Data Lead | 2026-08-02 | |
| MR-02: Partial path risk noted | **Pass** | If PDF path is used, note: manual extraction is required; data must be verified against source before Firestore write per CV-SOP-001. | Founder / Data Lead | 2026-08-02 | |
| MR-03: Fetch method documented | **Partial** | Recommended fetch method: download XLSX from Fiscal Reference Tables page (canada.ca/en/department-finance/services/publications/fiscal-reference-tables.html). Confirm exact file URL and column structure at first fetch. | Founder / Data Lead | 2026-08-02 | Confirm at data fetch time |

---

## 8. Privacy / Personal Information Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| PRI-01: Personal information assessment | **Pass** | Federal budget and fiscal data is aggregate financial information — no individual-level personal information. | Founder / Data Lead | 2026-08-02 | |
| PRI-02: Public official personal information | **Pass** | N/A — fiscal data is not a named-official source. | Founder / Data Lead | 2026-08-02 | |
| PRI-03: Non-official personal information | **Pass** | Aggregate data only — no individual names or identifiers. | Founder / Data Lead | 2026-08-02 | |
| PRI-04: Sensitive personal information | **Pass** | No sensitive personal information in aggregate fiscal data. | Founder / Data Lead | 2026-08-02 | |
| PRI-05: CV-REG-002 update required | **Pass — no update required** | Aggregate fiscal data — not personal information. CV-REG-002 update not required. | Founder / Data Lead | 2026-08-02 | |

---

## 9. Public Official / High-Risk Data Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| HRD-01: High-risk flag | **Not flagged** | Aggregate fiscal data — no named officials, salaries, lobbying records, or ethics findings. | Founder / Data Lead | 2026-08-02 | |
| HRD-02 through HRD-05 | **N/A** | Not applicable. | Founder / Data Lead | 2026-08-02 | |

---

## 10. Transformation Review

| Review Item | Status | Notes |
|---|---|---|
| TRF-01 through TRF-05 | **Needs Review** | Transformation approach (e.g., departmental spending grouping, revenue vs expenditure split, chart preparation) has not been defined. Confirm at data design stage. |

---

## 11. App Display Review

| Review Item | Status | Notes |
|---|---|---|
| DSP-01 through DSP-06 | **Needs Review** | App display location ("Federal Budget section" per CV-REG-001) is a placeholder. Specific screen, status label, freshness indicator, and /sources page entry are TBD. |

---

## 12. Firestore Mapping Review

| Review Item | Status | Notes |
|---|---|---|
| FS-01 through FS-04 | **Needs Review** | Firestore collection, schema, write access, and public read field review are TBD pending app display design. |

---

## 13. Final Source Decision

| Field | Value |
|---|---|
| **Final decision** | **Approved with Limitations** |
| **Decision rationale** | Source owner confirmed (Department of Finance Canada). Official source URLs confirmed. Licence confirmed (OGL-Canada 2.0 — Approved). Attribution wording confirmed. Privacy risk confirmed low. Source is not high-risk. **Limitations:** Specific reporting year not confirmed; fetched date not available; format decision (XLSX vs PDF) not finalised; transformation, app display location, and Firestore collection all TBD. Data must not be written to Firestore or displayed in the app until all limitations are resolved and a CV-REC-001 Data Verification Checklist is completed for the fetch event. |
| **CV-REG-001 Licence Status** | **Approved** — update CV-REG-001 SRC-FED-003 |
| **Remaining before Approved for Public Display** | (1) Confirm reporting year; (2) First data fetch with fetched date recorded; (3) Confirm XLSX vs PDF format; (4) Complete transformation design; (5) Confirm app display location; (6) Confirm Firestore collection; (7) Complete CV-REC-001 verification checklist |
| **Manual review flag required** | Yes if PDF path is used — manual extraction required. No if XLSX path is used. |
| **CV-REC-001 required before Firestore write** | Yes |

---

## 14. Open Issues

| # | Issue | Priority | Owner | Status | Target Date |
|---|---|---|---|---|---|
| 1 | Confirm which budget year/edition will be displayed at launch | High | Data Lead / Product Lead | Open | Before data fetch |
| 2 | Confirm format: XLSX (Fiscal Reference Tables) vs PDF vs open.canada.ca CSV — and record exact file URL | High | Data Lead | Open | Before data fetch |
| 3 | Define transformation approach (departmental grouping, chart data structure) | High | Data Lead | Open | Before Firestore design |
| 4 | Confirm app display location and screen design | High | Product Lead | Open | |
| 5 | Confirm Firestore collection name and schema | High | Technical Lead | Open | |
| 6 | Record fetched date when data is first fetched | High | Data Lead | Open | At first fetch |
| 7 | Complete CV-REC-001 Data Verification Checklist at first fetch | High | Data Lead | Open | At first fetch |
| 8 | If open.canada.ca CSV path is used, confirm applicable dataset ID | Medium | Data Lead | Open | |

**Issues resolved in this review:**
- ~~Confirm source owner~~ — **Resolved 2026-08-02**: Department of Finance Canada.
- ~~Confirm source URL~~ — **Resolved 2026-08-02**: Budget page, Fiscal Reference Tables, open.canada.ca/fin confirmed.
- ~~Confirm licence~~ — **Resolved 2026-08-02**: OGL-Canada 2.0 confirmed Approved.
- ~~Draft attribution wording~~ — **Resolved 2026-08-02**: Confirmed in Section 5.
- ~~Confirm machine-readability~~ — **Resolved 2026-08-02**: Yes (XLSX path) / Partial (PDF path).
- ~~Confirm aggregate data — low privacy risk~~ — **Resolved 2026-08-02**: Confirmed.

---

## 15. Approval

| Role | Name | Date | Decision |
|---|---|---|---|
| Primary Reviewer | Founder / Data Lead | 2026-08-02 | Approved with Limitations — limitations listed in Section 13 |
| Data Lead sign-off | TBD | TBD | Pending — required before Firestore write |

---

## Change Log

| Version | Date | Author | Change |
|---|---|---|---|
| 0.1 | 2026-08-02 | Founder / Data Lead | Initial draft — all items Needs Review; Pending Review decision |
| 0.2 | 2026-08-02 | Founder / Data Lead | Step 23 review: source owner, URLs, OGL-Canada 2.0 licence, attribution, machine-readability, privacy, and high-risk status all confirmed. Source ID corrected from SRC-003 to SRC-FED-003. Licence Status updated to Approved. Final decision: Approved with Limitations. |
