# CV-SRC-REV-001 — Statistics Canada Indicators Review

| Field | Value |
|---|---|
| **Review Record ID** | CV-SRC-REV-001 |
| **Related Source ID (CV-REG-001)** | SRC-001 |
| **Source Name** | Statistics Canada — Socioeconomic and Civic Indicators |
| **Jurisdiction** | Canada Federal |
| **Data Category** | Socioeconomic indicators · Demographic data · Civic context data |
| **Review Status** | Draft |
| **Reviewer** | Founder / Data Lead |
| **Review Date** | TBD |
| **Related Documents** | CV-REG-001 Data Source Register · CV-CHK-005 Canadian Source Review Checklist · CV-SOP-001 Data Verification SOP · CV-POL-002 Data Sources and Attribution Policy |

---

> ⚠️ **DRAFT — PENDING REVIEW**
>
> This record has not been completed. All checklist items are unconfirmed.
> The final source decision is **Pending Review**. This source must not be used
> in the public app until this record is completed and a positive final decision
> is recorded.

---

## 1. Purpose

This record documents the source review for Statistics Canada socioeconomic and civic
indicator data used in Civic Voice Canada. It tracks eligibility, licence, attribution,
reporting period, machine-readability, privacy, transformation, and Firestore mapping
for this source in accordance with CV-CHK-005.

---

## 2. Source Identification

| Field | Value |
|---|---|
| **Source owner / publisher** | Statistics Canada (Government of Canada) |
| **Source URL** | TBD — confirm exact dataset URL(s) on statcan.gc.ca open data portal |
| **Source format** | TBD — likely open-data portal CSV/XLSX or API (Statistics Canada open data) |
| **Data type** | Socioeconomic indicators, demographic statistics, civic context data |
| **Reporting period** | TBD |
| **Fetched date** | TBD |
| **Licence / terms reference** | TBD — expected: Statistics Canada Open Licence (statcan.gc.ca/eng/reference/licence) |
| **Review trigger** | Pre-launch review |

---

## 3. Source Eligibility Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| ELG-01: Source is an approved type (official government open-data portal, API, official CSV/XLSX) | Needs Review | | | | Statistics Canada is a federal Crown corporation and official statistical agency — type is eligible; exact dataset URL must be confirmed |
| ELG-02: Source is not a prohibited type | Needs Review | | | | Expected Pass — confirm no Wikipedia, news, or unofficial aggregator data |
| ELG-03: Source owner identified | Needs Review | | | | Statistics Canada — confirm dataset page attributes authorship to Statistics Canada |
| ELG-04: Source URL recorded | Needs Review | | | | TBD — exact dataset URL not yet confirmed |
| ELG-05: Source publicly accessible without login or paywall | Needs Review | | | | Statistics Canada open data is publicly accessible — confirm for specific dataset |
| ELG-06: Data is relevant to civic information purpose | Needs Review | | | | Confirm which indicators are used and that they relate to civic context, not personal health or private data |

---

## 4. Licence / Terms Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| LIC-01: Licence or terms identified | Needs Review | | | | Expected: Statistics Canada Open Licence — confirm for specific dataset |
| LIC-02: Licence permits reuse | Needs Review | | | | Statistics Canada Open Licence permits reproduction and distribution — confirm |
| LIC-03: Attribution required | Needs Review | | | | Statistics Canada Open Licence requires attribution — confirm wording |
| LIC-04: No prohibited uses | Needs Review | | | | |
| LIC-05: Licence Status assigned | Needs Review | | | | Expected: **Approved** — pending licence confirmation |
| LIC-06: Licence version noted | Needs Review | | | | |
| LIC-07: Terms change monitoring noted | Needs Review | | | | |

---

## 5. Attribution Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| ATT-01: Attribution wording drafted | Needs Review | | | | Draft: "Source: Statistics Canada. Licensed under the Statistics Canada Open Licence." — confirm exact wording required by licence |
| ATT-02: Attribution wording recorded in CV-REG-001 | Needs Review | | | | Update CV-REG-001 SRC-001 after confirmation |
| ATT-03: Attribution placement in UI identified | Needs Review | | | | TBD — confirm where Statistics Canada data will appear in the app |
| ATT-04: Attribution consistent with licence requirements | Needs Review | | | | |

---

## 6. Reporting Period Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| RPT-01: Reporting period identified | Needs Review | | | | TBD — depends on which indicators are used |
| RPT-02: Reporting period accurate | Needs Review | | | | |
| RPT-03: Source update frequency known | Needs Review | | | | Statistics Canada releases data on varying schedules; confirm for specific dataset |
| RPT-04: App update frequency defined | Needs Review | | | | TBD |
| RPT-05: Staleness risk noted | Needs Review | | | | |

---

## 7. Machine-Readability Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| MR-01: Machine-readability classified | Needs Review | | | | Expected: Yes — Statistics Canada open data is available as CSV and API |
| MR-02: Partial/No risk noted (if applicable) | Needs Review | | | | |
| MR-03: Fetch method documented | Needs Review | | | | TBD — confirm API or CSV download |

---

## 8. Privacy / Personal Information Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| PRI-01: Personal information assessment | Needs Review | | | | Aggregate statistical data — expected low personal information risk; confirm no individual-level data |
| PRI-02: Public official personal information | Needs Review | | | | N/A for aggregate indicators — confirm |
| PRI-03: Non-official personal information | Needs Review | | | | Aggregate data should not include individual personal information — confirm |
| PRI-04: Sensitive personal information check | Needs Review | | | | Statistics Canada data may include health, income, or ethnic demographic aggregates — confirm intended use does not profile individuals |
| PRI-05: CV-REG-002 update required? | Needs Review | | | | |

---

## 9. Public Official / High-Risk Data Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| HRD-01: High-risk flag | Not flagged | | | | Aggregate statistical indicators — not a named-official or reputational-risk source; no second review required unless named-individual data is confirmed |
| HRD-02–HRD-05 | NA | | | | Mark NA unless individual-level or named-official data is confirmed in scope |

---

## 10. Transformation Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| TRF-01: Transformation identified | Needs Review | | | | TBD — confirm whether Statistics Canada raw data requires aggregation, normalisation, or charting preparation |
| TRF-02: Transformation does not distort | Needs Review | | | | |
| TRF-03: Transformation documented | Needs Review | | | | |
| TRF-04: Transformation note for UI | Needs Review | | | | |
| TRF-05: Source join | Needs Review | | | | |

---

## 11. App Display Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| DSP-01: App display location identified | Needs Review | | | | TBD — confirm which app page(s) will use Statistics Canada data |
| DSP-02: Status label identified | Needs Review | | | | |
| DSP-03: Freshness indicator identified | Needs Review | | | | |
| DSP-04: Attribution visible in UI | Needs Review | | | | |
| DSP-05: No prohibited claims in display | Needs Review | | | | |
| DSP-06: /sources page entry drafted | Needs Review | | | | |

---

## 12. Firestore Mapping Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| FS-01: Firestore collection identified | Needs Review | | | | TBD |
| FS-02: Write access confirmed | Needs Review | | | | |
| FS-03: No personal information in public read fields | Needs Review | | | | |
| FS-04: Schema documented | Needs Review | | | | |

---

## 13. Final Source Decision

| Field | Value |
|---|---|
| **Final decision** | **Pending Review** |
| **Decision rationale** | Source URL, exact dataset, reporting period, fetched date, licence confirmation, app display location, and Firestore collection are all TBD. Review must be completed before this source is used. |
| **CV-REG-001 Licence Status** | Review Required |
| **Manual review flag required** | No — pending review completion |
| **CV-REC-001 Data Verification Checklist required before Firestore write** | Yes |

---

## 14. Open Issues

| Issue | Priority | Owner | Target Date |
|---|---|---|---|
| Confirm exact Statistics Canada dataset URL(s) to be used | High | Data Lead | TBD |
| Confirm which indicators are in scope and their reporting periods | High | Data Lead | TBD |
| Confirm Statistics Canada Open Licence applies to chosen datasets | High | Data Lead | TBD |
| Confirm attribution wording required by licence | High | Data Lead | TBD |
| Confirm app display location(s) for Statistics Canada data | High | Product Lead | TBD |
| Confirm Firestore collection and document schema | High | Technical Lead | TBD |
| Confirm fetch method (API endpoint or CSV download URL) | Medium | Data Lead | TBD |
| Confirm aggregate-only data — no individual-level personal information | Medium | Data Lead | TBD |

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
