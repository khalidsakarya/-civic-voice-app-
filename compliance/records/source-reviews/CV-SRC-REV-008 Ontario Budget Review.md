# CV-SRC-REV-008 — Ontario Budget Review

| Field | Value |
|---|---|
| **Review Record ID** | CV-SRC-REV-008 |
| **Related Source ID (CV-REG-001)** | SRC-ONT-001 |
| **Source Name** | Government of Ontario — Provincial Budget |
| **Jurisdiction** | Ontario |
| **Data Category** | Provincial budget · Fiscal plan · Ontario government expenditure |
| **Review Status** | Draft |
| **Reviewer** | Founder / Data Lead |
| **Review Date** | 2026-08-02 |
| **Related Documents** | CV-REG-001 Data Source Register · CV-CHK-005 Canadian Source Review Checklist · CV-SOP-001 Data Verification SOP · CV-POL-002 Data Sources and Attribution Policy |

---

> ℹ️ **DRAFT — APPROVED WITH LIMITATIONS**
>
> **Source owner confirmed. Licence confirmed (Open Government Licence – Ontario). Attribution confirmed.**
>
> **Remaining limitations** (must be resolved before data is written to Firestore or displayed):
> - Specific budget year / edition for the app has not been confirmed
> - Format decision (PDF budget vs data.ontario.ca structured data) not finalised; confirm whether machine-readable fiscal datasets are available on data.ontario.ca for the applicable year
> - Fetched date: not yet fetched
> - Transformation approach: TBD
> - App display location: TBD
> - Firestore collection and schema: TBD

---

## 1. Purpose

This record documents the source review for Ontario provincial budget data published
by the Government of Ontario. Provincial budget data is used in Civic Voice Canada
to provide civic context on Ontario government fiscal priorities and expenditure.

**Note on machine-readability:** The Ontario Budget is published primarily as a PDF
document on ontario.ca. Structured open-data fiscal datasets may be available on
data.ontario.ca; the Data Lead should confirm this at the time of data fetch.
If only the PDF is available for the applicable year, machine-readability is Partial
and manual extraction is required.

---

## 2. Source Identification

| Field | Value |
|---|---|
| **Source owner / publisher** | Government of Ontario — Ministry of Finance |
| **Source URL — budget page** | https://www.ontario.ca/page/ontario-budget |
| **Source URL — open data portal** | https://data.ontario.ca (search for applicable fiscal datasets; confirm dataset URL) |
| **Source format** | PDF (official Ontario Budget document); XLSX / CSV (data.ontario.ca datasets where available — confirm) |
| **Data type** | Ontario fiscal aggregates: revenues, expenditures, deficit/surplus, ministry spending, major transfers, economic outlook |
| **Reporting period** | TBD — confirm which Ontario budget year will be displayed in the app |
| **Fetched date** | Not yet fetched |
| **Licence / terms reference** | Open Government Licence – Ontario — https://www.ontario.ca/page/open-government-licence-ontario |
| **Review trigger** | Pre-launch review (Step 23) |

---

## 3. Source Eligibility Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| ELG-01: Source is an approved type | **Pass** | Ontario Ministry of Finance is the official provincial fiscal authority. ontario.ca and data.ontario.ca are official Government of Ontario publications and open-data portal. Approved types under CV-POL-002 §3. | Founder / Data Lead | 2026-08-02 | |
| ELG-02: Source is not a prohibited type | **Pass** | Official government publication — not a news site or unofficial aggregator. | Founder / Data Lead | 2026-08-02 | |
| ELG-03: Source owner identified | **Pass** | Government of Ontario — Ministry of Finance — confirmed. | Founder / Data Lead | 2026-08-02 | |
| ELG-04: Source URL recorded | **Pass** | Primary URLs confirmed: ontario.ca/page/ontario-budget and data.ontario.ca portal. Specific data.ontario.ca dataset URL to be confirmed at data fetch time. | Founder / Data Lead | 2026-08-02 | Confirm specific dataset URL on data.ontario.ca |
| ELG-05: Source publicly accessible | **Pass** | ontario.ca/page/ontario-budget and data.ontario.ca are publicly accessible without login or paywall. | Founder / Data Lead | 2026-08-02 | |
| ELG-06: Data relevant to civic purpose | **Pass** | Ontario provincial budget data is core civic accountability information — ministry spending, revenues, fiscal plan. | Founder / Data Lead | 2026-08-02 | |

---

## 4. Licence / Terms Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| LIC-01: Licence identified | **Pass** | Open Government Licence – Ontario — https://www.ontario.ca/page/open-government-licence-ontario. Applies to ontario.ca publications and data.ontario.ca datasets. | Founder / Data Lead | 2026-08-02 | |
| LIC-02: Licence permits reuse | **Pass** | OGL-Ontario permits reproduction, modification, distribution in any medium for any lawful purpose. | Founder / Data Lead | 2026-08-02 | |
| LIC-03: Attribution required | **Pass** | OGL-Ontario requires: "Contains information licensed under the Open Government Licence – Ontario." | Founder / Data Lead | 2026-08-02 | See Section 5 for confirmed wording |
| LIC-04: No prohibited uses | **Pass** | No prohibited uses applicable to non-commercial civic display of aggregate provincial fiscal data. | Founder / Data Lead | 2026-08-02 | |
| LIC-05: Licence Status | **Approved** | OGL-Ontario reviewed and confirmed to permit display, transformation, and attribution as intended. | Founder / Data Lead | 2026-08-02 | Update CV-REG-001 SRC-ONT-001 Licence Status to Approved |
| LIC-06: Licence version | **Pass** | Open Government Licence – Ontario (no numbered version; current edition at ontario.ca/page/open-government-licence-ontario). | Founder / Data Lead | 2026-08-02 | |
| LIC-07: Terms change monitoring | **Pass** | Monitor ontario.ca/page/open-government-licence-ontario at each annual data update cycle per CV-SOP-002. | Founder / Data Lead | 2026-08-02 | |

---

## 5. Attribution Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| ATT-01: Attribution wording confirmed | **Pass** | **Confirmed wording:** "Source: Ontario Ministry of Finance — Ontario Budget [year], Government of Ontario. Contains information licensed under the Open Government Licence – Ontario. Fetched [date]." | Founder / Data Lead | 2026-08-02 | Fill in [year] and [date] at time of fetch |
| ATT-02: Attribution recorded in CV-REG-001 | **Pass** | Attribution wording recorded in CV-REG-001 SRC-ONT-001 Notes and Attribution Statements section. | Founder / Data Lead | 2026-08-02 | |
| ATT-03: Attribution placement in UI | **Needs Review** | App display location TBD — attribution placement depends on where Ontario Budget data will appear. | | | |
| ATT-04: Attribution consistent with licence | **Pass** | Wording in ATT-01 meets OGL-Ontario attribution requirement. | Founder / Data Lead | 2026-08-02 | |

---

## 6. Reporting Period Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| RPT-01: Reporting period identified | **Needs Review** | Annual Ontario Budget, tabled each spring. Specific year/edition not yet confirmed for the app. | | | Confirm at data fetch time |
| RPT-02: Reporting period accurate | **Needs Review** | Confirm against Ministry of Finance publication at fetch time. | | | |
| RPT-03: Source update frequency known | **Pass** | Annual — Ontario Budget tabled each spring. data.ontario.ca datasets updated following each budget. | Founder / Data Lead | 2026-08-02 | |
| RPT-04: App update frequency defined | **Needs Review** | Expected: annual update following each Ontario Budget. Confirm in CV-SOP-002 update schedule. | | | |
| RPT-05: Staleness risk noted | **Pass** | Annual data; staleness risk is low once reporting year is confirmed. Display "Ontario Budget [year]" label in app. | Founder / Data Lead | 2026-08-02 | |

---

## 7. Machine-Readability Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| MR-01: Machine-readability classified | **Partial (PDF path) / Yes (data.ontario.ca path if available)** | Ontario Budget document is primarily published as PDF — machine-readable: Partial. If structured fiscal data is available on data.ontario.ca (CSV/XLSX), machine-readable: Yes. Confirm data.ontario.ca availability for the applicable budget year. | Founder / Data Lead | 2026-08-02 | data.ontario.ca is the preferred path if available |
| MR-02: Partial path risk noted | **Pass** | If PDF path is used: manual extraction required; verify data against source before Firestore write per CV-SOP-001. Record as Manual Review Required in CV-REG-001. | Founder / Data Lead | 2026-08-02 | |
| MR-03: Fetch method | **Partial** | Preferred: data.ontario.ca dataset CSV/XLSX download (confirm availability and URL). Fallback: PDF extraction from ontario.ca/page/ontario-budget. | Founder / Data Lead | 2026-08-02 | Confirm at data fetch time |

---

## 8. Privacy / Personal Information Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| PRI-01: Personal information assessment | **Pass** | Provincial budget and fiscal data is aggregate financial information — no individual-level personal information. | Founder / Data Lead | 2026-08-02 | |
| PRI-02: Public official personal information | **Pass** | N/A — fiscal data is not a named-official source. | Founder / Data Lead | 2026-08-02 | |
| PRI-03: Non-official personal information | **Pass** | Aggregate data only — no individual names or identifiers. | Founder / Data Lead | 2026-08-02 | |
| PRI-04: Sensitive personal information | **Pass** | No sensitive personal information in aggregate provincial fiscal data. | Founder / Data Lead | 2026-08-02 | |
| PRI-05: CV-REG-002 update required | **Pass — no update required** | Aggregate fiscal data — not personal information. CV-REG-002 update not required. | Founder / Data Lead | 2026-08-02 | |

---

## 9. Public Official / High-Risk Data Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| HRD-01: High-risk flag | **Not flagged** | Aggregate provincial fiscal data — no named officials, salaries, or reputational-risk data. | Founder / Data Lead | 2026-08-02 | |
| HRD-02 through HRD-05 | **N/A** | Not applicable. | Founder / Data Lead | 2026-08-02 | |

---

## 10. Transformation Review

| Review Item | Status | Notes |
|---|---|---|
| TRF-01 through TRF-05 | **Needs Review** | Transformation approach (ministry spending grouping, revenue vs expenditure split, chart preparation) not yet defined. Confirm at data design stage. |

---

## 11. App Display Review

| Review Item | Status | Notes |
|---|---|---|
| DSP-01 through DSP-06 | **Needs Review** | App display location ("Ontario Budget section" per CV-REG-001) is a placeholder. Specific screen, status label, freshness indicator, and /sources page entry are TBD. |

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
| **Decision rationale** | Source owner confirmed (Ontario Ministry of Finance). Official source URLs confirmed. Licence confirmed (OGL-Ontario — Approved). Attribution wording confirmed. Privacy risk confirmed low. Not a high-risk source. **Limitations:** Machine-readability depends on format path chosen (PDF is Partial; data.ontario.ca CSV/XLSX is Yes — availability must be confirmed); specific budget year not confirmed; fetched date not available; transformation, app display location, and Firestore collection all TBD. Data must not be written to Firestore or displayed until all limitations are resolved and CV-REC-001 is completed. |
| **CV-REG-001 Licence Status** | **Approved** — update CV-REG-001 SRC-ONT-001 |
| **Remaining before Approved for Public Display** | (1) Confirm data.ontario.ca structured data availability for applicable budget year; (2) Confirm reporting year; (3) First data fetch with fetched date; (4) Complete transformation design; (5) Confirm app display location; (6) Confirm Firestore collection; (7) Complete CV-REC-001 |
| **Manual review flag required** | Yes if PDF path is used. No if data.ontario.ca CSV/XLSX path is used. |
| **CV-REC-001 required before Firestore write** | Yes |

---

## 14. Open Issues

| # | Issue | Priority | Owner | Status | Target Date |
|---|---|---|---|---|---|
| 1 | Confirm whether structured fiscal data is available on data.ontario.ca for the applicable budget year (CSV/XLSX) | High | Data Lead | Open | Before data fetch |
| 2 | Confirm specific data.ontario.ca dataset URL if structured data is available | High | Data Lead | Open | Before data fetch |
| 3 | Confirm which Ontario budget year will be displayed at launch | High | Data Lead / Product Lead | Open | Before data fetch |
| 4 | Define transformation approach (ministry grouping, chart data structure) | High | Data Lead | Open | Before Firestore design |
| 5 | Confirm app display location and screen design | High | Product Lead | Open | |
| 6 | Confirm Firestore collection name and schema | High | Technical Lead | Open | |
| 7 | Record fetched date when data is first fetched | High | Data Lead | Open | At first fetch |
| 8 | Complete CV-REC-001 Data Verification Checklist at first fetch | High | Data Lead | Open | At first fetch |

**Issues resolved in this review:**
- ~~Confirm source owner~~ — **Resolved 2026-08-02**: Ontario Ministry of Finance confirmed.
- ~~Confirm source URL~~ — **Resolved 2026-08-02**: ontario.ca/page/ontario-budget and data.ontario.ca confirmed.
- ~~Confirm licence~~ — **Resolved 2026-08-02**: OGL-Ontario confirmed Approved.
- ~~Draft attribution wording~~ — **Resolved 2026-08-02**: Confirmed in Section 5.
- ~~Confirm privacy risk~~ — **Resolved 2026-08-02**: Low — aggregate fiscal data.

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
| 0.2 | 2026-08-02 | Founder / Data Lead | Step 23 review: source owner, URLs, OGL-Ontario licence, attribution, machine-readability (PDF vs data.ontario.ca paths), privacy, and high-risk status confirmed. Source ID corrected from SRC-008 to SRC-ONT-001. Licence Status updated to Approved. Final decision: Approved with Limitations. |
