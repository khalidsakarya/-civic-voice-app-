# CV-SRC-REV-003 — Government of Canada Budget Review

| Field | Value |
|---|---|
| **Review Record ID** | CV-SRC-REV-003 |
| **Related Source ID (CV-REG-001)** | SRC-003 |
| **Source Name** | Government of Canada — Federal Budget |
| **Jurisdiction** | Canada Federal |
| **Data Category** | Federal budget · Fiscal plan · Government expenditure |
| **Review Status** | Draft |
| **Reviewer** | Founder / Data Lead |
| **Review Date** | TBD |
| **Related Documents** | CV-REG-001 Data Source Register · CV-CHK-005 Canadian Source Review Checklist · CV-SOP-001 Data Verification SOP · CV-POL-002 Data Sources and Attribution Policy |

---

> ⚠️ **DRAFT — PENDING REVIEW**
>
> This record has not been completed. All checklist items are unconfirmed.
> The final source decision is **Pending Review**.

---

## 1. Purpose

This record documents the source review for federal budget data published by the
Government of Canada. Federal budget documents and open fiscal data are used in
Civic Voice Canada to provide civic context on government spending and priorities.

---

## 2. Source Identification

| Field | Value |
|---|---|
| **Source owner / publisher** | Department of Finance Canada (Government of Canada) |
| **Source URL** | TBD — confirm: budget.canada.ca or open.canada.ca fiscal datasets |
| **Source format** | TBD — Federal Budget is published as official PDF; fiscal datasets may be available as CSV via open.canada.ca |
| **Data type** | Budget totals, expenditure by department, revenue projections, fiscal year summary |
| **Reporting period** | TBD — confirm which budget year(s) are in scope |
| **Fetched date** | TBD |
| **Licence / terms reference** | TBD — expected: Open Government Licence — Canada (for open.canada.ca data); confirm for official PDF source |
| **Review trigger** | Pre-launch review |

---

## 3. Source Eligibility Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| ELG-01: Source is an approved type | Needs Review | | | | Official government publication — eligible; confirm whether structured data or PDF |
| ELG-02: Source is not a prohibited type | Needs Review | | | | Expected Pass |
| ELG-03: Source owner identified | Needs Review | | | | Department of Finance Canada |
| ELG-04: Source URL recorded | Needs Review | | | | TBD |
| ELG-05: Source publicly accessible | Needs Review | | | | Federal Budget documents are publicly available — confirm URL |
| ELG-06: Data relevant | Needs Review | | | | Federal budget data is core civic accountability information |

---

## 4. Licence / Terms Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| LIC-01: Licence identified | Needs Review | | | | TBD — OGL-Canada expected for open.canada.ca datasets; confirm for official PDF |
| LIC-02: Licence permits reuse | Needs Review | | | | |
| LIC-03: Attribution required | Needs Review | | | | |
| LIC-04: No prohibited uses | Needs Review | | | | |
| LIC-05: Licence Status assigned | Needs Review | | | | Expected: **Approved** — pending confirmation |
| LIC-06: Licence version noted | Needs Review | | | | |
| LIC-07: Terms change monitoring | Needs Review | | | | |

---

## 5. Attribution Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| ATT-01: Attribution wording drafted | Needs Review | | | | Draft: "Source: Department of Finance Canada — Federal Budget [year]. Licensed under the Open Government Licence – Canada." |
| ATT-02–ATT-04 | Needs Review | | | | |

---

## 6. Reporting Period Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| RPT-01: Reporting period identified | Needs Review | | | | TBD — confirm fiscal year (e.g., 2024–25 Budget) |
| RPT-02–RPT-05 | Needs Review | | | | Annual release; staleness risk is low for historical budget data |

---

## 7. Machine-Readability Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| MR-01: Classified | Needs Review | | | | TBD — if sourced from official PDF, classify as Partial; if from open.canada.ca CSV, classify as Yes |
| MR-02: Partial/No risk | Needs Review | | | | If PDF: note transformation effort required |
| MR-03: Fetch method | Needs Review | | | | TBD |

---

## 8. Privacy / Personal Information Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| PRI-01–PRI-05 | Needs Review | | | | Budget data is aggregate fiscal data — expected low personal information risk; confirm no named-individual salary data in scope (see CV-SRC-REV-010 for salary disclosure) |

---

## 9. Public Official / High-Risk Data Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| HRD-01: High-risk flag | Not flagged | | | | Aggregate fiscal data — not a named-official or reputational-risk source |
| HRD-02–HRD-05 | NA | | | | |

---

## 10. Transformation Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| TRF-01–TRF-05 | Needs Review | | | | TBD — budget data likely requires extraction from PDF tables or normalisation of CSV data for charting |

---

## 11. App Display Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| DSP-01–DSP-06 | Needs Review | | | | TBD |

---

## 12. Firestore Mapping Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| FS-01–FS-04 | Needs Review | | | | TBD |

---

## 13. Final Source Decision

| Field | Value |
|---|---|
| **Final decision** | **Pending Review** |
| **Decision rationale** | Source URL, format (PDF vs CSV), licence confirmation, reporting period, and Firestore mapping are all TBD. |
| **CV-REG-001 Licence Status** | Review Required |
| **CV-REC-001 required before Firestore write** | Yes |

---

## 14. Open Issues

| Issue | Priority | Owner | Target Date |
|---|---|---|---|
| Confirm source URL and whether structured data is available from open.canada.ca | High | Data Lead | TBD |
| Confirm licence for chosen source format | High | Data Lead | TBD |
| Confirm fiscal year(s) in scope | High | Data Lead | TBD |
| Confirm app display location and chart/data design | High | Product Lead | TBD |
| Confirm Firestore collection and schema | High | Technical Lead | TBD |
| Document transformation approach if PDF source is used | Medium | Data Lead | TBD |

---

## 15. Approval

| Role | Name | Date | Decision |
|---|---|---|---|
| Primary Reviewer | TBD | TBD | Pending Review |
| Data Lead | TBD | TBD | Pending Review |

---

## Change Log

| Version | Date | Author | Change |
|---|---|---|---|
| 0.1 | 2026-08-02 | Founder / Data Lead | Initial draft — all items Needs Review; Pending Review decision |
