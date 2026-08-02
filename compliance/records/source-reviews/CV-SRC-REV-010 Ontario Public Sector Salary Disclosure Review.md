# CV-SRC-REV-010 — Ontario Public Sector Salary Disclosure Review

| Field | Value |
|---|---|
| **Review Record ID** | CV-SRC-REV-010 |
| **Related Source ID (CV-REG-001)** | SRC-010 |
| **Source Name** | Government of Ontario — Public Sector Salary Disclosure ("Sunshine List") |
| **Jurisdiction** | Ontario |
| **Data Category** | Named public sector salary disclosures · "Sunshine List" |
| **Review Status** | Draft |
| **Reviewer** | Founder / Data Lead |
| **Review Date** | TBD |
| **Related Documents** | CV-REG-001 Data Source Register · CV-CHK-005 Canadian Source Review Checklist · CV-SOP-001 Data Verification SOP · CV-POL-002 Data Sources and Attribution Policy |

---

> ⚠️ **DRAFT — PENDING REVIEW — HIGH-RISK SOURCE**
>
> This source is flagged as **high-risk** because it contains:
> - Named individual public sector employees and their exact salaries and taxable benefits
> - Data published under a statutory disclosure regime (*Public Sector Salary Disclosure Act, 1996*) where each named individual has limited ability to challenge their inclusion
> - A well-known reputational sensitivity — individuals on this list have historically experienced privacy-related concerns
>
> A second reviewer is required before this source is approved for public display.
>
> **Additional caution:** The Ontario Privacy Commissioner has published guidance on
> the privacy implications of the Sunshine List. The intended use of this data in
> Civic Voice Canada must be limited to civic accountability purposes and must not
> facilitate use of salary data to target, profile, or identify private individuals
> beyond their publicly disclosed role.
>
> This record has not been completed. All checklist items are unconfirmed.
> The final source decision is **Pending Review**.

---

## 1. Purpose

This record documents the source review for the Ontario Public Sector Salary
Disclosure Act data (commonly known as the "Sunshine List"). This is a statutory
disclosure register published annually by the Government of Ontario listing public
sector employees earning $100,000 or more.

---

## 2. Source Identification

| Field | Value |
|---|---|
| **Source owner / publisher** | Government of Ontario — Treasury Board Secretariat |
| **Source URL** | TBD — confirm: ontario.ca/page/public-sector-salary-disclosure and/or data.ontario.ca/dataset/public-sector-salary-disclosure |
| **Source format** | TBD — expected: CSV via data.ontario.ca and/or official XLSX on ontario.ca |
| **Data type** | Named public sector employee, employer, job title, salary paid, taxable benefits; calendar year basis |
| **Reporting period** | TBD — confirm calendar year (e.g., 2024 Sunshine List) |
| **Fetched date** | TBD |
| **Licence / terms reference** | TBD — expected: Ontario Open Data Licence for data.ontario.ca version; confirm |
| **Review trigger** | Pre-launch review — high-risk source |

---

## 3. Source Eligibility Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| ELG-01: Approved type | Needs Review | | | | Statutory public disclosure register — eligible as public registry type; confirm source is data.ontario.ca or ontario.ca, not a secondary aggregator |
| ELG-02: Not prohibited | Needs Review | | | | Must not use unofficial Sunshine List websites, scrapers, or aggregators |
| ELG-03: Owner identified | Needs Review | | | | Government of Ontario — Treasury Board Secretariat |
| ELG-04: URL recorded | Needs Review | | | | TBD |
| ELG-05: Publicly accessible | Needs Review | | | | Sunshine List is publicly available annually — confirm URL |
| ELG-06: Relevant | Needs Review | | | | Named public sector salary disclosure is civic accountability data — confirm intended use is limited to public sector accountability, not general income profiling |

---

## 4. Licence / Terms Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| LIC-01: Licence identified | Needs Review | | | | TBD — confirm Ontario Open Data Licence applies to data.ontario.ca version |
| LIC-02: Permits reuse | Needs Review | | | | Ontario Open Data Licence generally permits reuse; confirm for named salary data specifically |
| LIC-03: Attribution required | Needs Review | | | | |
| LIC-04: No prohibited uses | Needs Review | | | | Confirm no restriction on republication of named salary records; confirm Ontario Privacy Commissioner guidance reviewed |
| LIC-05: Licence Status assigned | Needs Review | | | | Expected: **Public Registry** — statutory annual disclosure; pending confirmation |
| LIC-06–LIC-07 | Needs Review | | | | |

---

## 5. Attribution Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| ATT-01: Attribution drafted | Needs Review | | | | Draft: "Source: Government of Ontario — Public Sector Salary Disclosure [year]. Licensed under the Open Government Licence – Ontario." |
| ATT-02–ATT-04 | Needs Review | | | | |

---

## 6. Reporting Period Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| RPT-01–RPT-05 | Needs Review | | | | TBD — confirm calendar year; Sunshine List is published annually (typically March/April for prior calendar year) |

---

## 7. Machine-Readability Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| MR-01: Classified | Needs Review | | | | Expected: Yes — available as CSV on data.ontario.ca |
| MR-02–MR-03 | Needs Review | | | | |

---

## 8. Privacy / Personal Information Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| PRI-01: Personal information | Needs Review | | | | Named individuals with exact salaries and benefits — this IS personal information. Disclosure is justified under the *Public Sector Salary Disclosure Act* but use must be limited to civic accountability purposes. |
| PRI-02: Public official/public sector employee | Needs Review | | | | Not all Sunshine List individuals are elected officials — many are administrators, healthcare workers, educators. Confirm that use is limited to accountability reporting on their publicly disclosed role, not general income profiling. |
| PRI-03: Non-official personal information | Needs Review | | | | Only salary and employer data should be displayed — no home address, personal contact, family information |
| PRI-04: Sensitive information | Needs Review | | | | Salary is financial information. Combined with employer and job title, it identifies individuals. Confirm use is strictly limited to the disclosed accountability purpose. |
| PRI-05: CV-REG-002 update | Needs Review | | | | Update CV-REG-002 — named salary data is personal information; confirm retention and access controls |

---

## 9. Public Official / High-Risk Data Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| HRD-01: High-risk flag | **Flagged — High-Risk** | | | | Named individuals, salaries, benefits. Privacy Commissioner guidance exists. Reputational risk for individuals named. |
| HRD-02: Second reviewer required | **Required** | | | | |
| HRD-03: Official source | Needs Review | | | | Must be data.ontario.ca or ontario.ca — not a secondary aggregator |
| HRD-04: Accuracy spot-check | Needs Review | | | | |
| HRD-05: Disclaimer placement | Needs Review | | | | CV-POL-004 disclaimer must appear on all salary data display pages |

---

## 10. Transformation Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| TRF-01–TRF-05 | Needs Review | | | | TBD — confirm whether individual salary records are displayed, aggregated by employer, or summarised; confirm no transformation creates misleading comparisons |

---

## 11. App Display Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| DSP-01–DSP-06 | Needs Review | | | | TBD — confirm display framing; must not editorialize about individuals' salaries; display limited to publicly disclosed accountability purpose |

---

## 12. Firestore Mapping Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| FS-01–FS-04 | Needs Review | | | | TBD — confirm collection; confirm publicly readable Firestore fields do not expose named salary data without appropriate context |

---

## 13. Final Source Decision

| Field | Value |
|---|---|
| **Final decision** | **Pending Review** |
| **Decision rationale** | High-risk source. Named salary data requires privacy assessment, second reviewer, Ontario Privacy Commissioner guidance review, confirmed display framing, and CV-REG-002 update. All TBD. |
| **CV-REG-001 Licence Status** | Review Required |
| **Second review required** | Yes — mandatory |
| **CV-REC-001 required before Firestore write** | Yes |

---

## 14. Open Issues

| Issue | Priority | Owner | Target Date |
|---|---|---|---|
| Confirm data.ontario.ca dataset URL for Sunshine List | High | Data Lead | TBD |
| Confirm Ontario Open Data Licence applies | High | Data Lead | TBD |
| Review Ontario Privacy Commissioner guidance on Sunshine List reuse | Critical | Privacy Lead | TBD |
| Confirm intended use is limited to public sector accountability — not individual income profiling | Critical | Privacy Lead / Founder | TBD |
| Assign and complete second reviewer | High | Data Lead | TBD |
| Update CV-REG-002 for named salary personal information | High | Privacy Lead | TBD |
| Confirm calendar year in scope | High | Data Lead | TBD |
| Confirm Firestore collection, schema, and access controls for named data | High | Technical Lead | TBD |
| Confirm app display framing | High | Product Lead | TBD |

---

## 15. Approval

| Role | Name | Date | Decision |
|---|---|---|---|
| Primary Reviewer | TBD | TBD | Pending Review |
| **Second Reviewer (required — high-risk)** | TBD | TBD | Pending Review |
| Privacy Lead | TBD | TBD | Pending Review |
| Data Lead | TBD | TBD | Pending Review |

---

## Change Log

| Version | Date | Author | Change |
|---|---|---|---|
| 0.1 | 2026-08-02 | Founder / Data Lead | Initial draft — high-risk flag; second reviewer and Privacy Lead review required; all items Needs Review |
