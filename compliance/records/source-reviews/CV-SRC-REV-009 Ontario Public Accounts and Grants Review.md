# CV-SRC-REV-009 — Ontario Public Accounts and Grants Review

| Field | Value |
|---|---|
| **Review Record ID** | CV-SRC-REV-009 |
| **Related Source ID (CV-REG-001)** | SRC-009 |
| **Source Name** | Government of Ontario — Public Accounts and Grants/Transfer Payments |
| **Jurisdiction** | Ontario |
| **Data Category** | Ontario public accounts · Transfer payments · Grants to organisations |
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

This record documents the source review for Ontario Public Accounts and grants/transfer
payment data. Ontario proactive disclosure data on grants and transfer payments is
available through data.ontario.ca. This data supports civic accountability transparency
by showing Ontario government spending to organisations.

---

## 2. Source Identification

| Field | Value |
|---|---|
| **Source owner / publisher** | Government of Ontario — Treasury Board Secretariat / Ministry of Finance |
| **Source URL** | TBD — confirm: data.ontario.ca for public accounts and transfer payment datasets |
| **Source format** | TBD — expected: CSV via data.ontario.ca open data portal |
| **Data type** | Ontario departmental expenditures, transfer payment recipients and amounts, public accounts summaries |
| **Reporting period** | TBD — confirm fiscal year |
| **Fetched date** | TBD |
| **Licence / terms reference** | TBD — expected: Ontario Open Data Licence |
| **Review trigger** | Pre-launch review |

---

## 3. Source Eligibility Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| ELG-01–ELG-06 | Needs Review | | | | Official Ontario government open-data portal — eligible; confirm exact dataset URLs |

---

## 4. Licence / Terms Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| LIC-01–LIC-07 | Needs Review | | | | Expected: Ontario Open Data Licence |

---

## 5. Attribution Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| ATT-01–ATT-04 | Needs Review | | | | Draft: "Source: Government of Ontario — Public Accounts [year]. Licensed under the Open Government Licence – Ontario." |

---

## 6. Reporting Period Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| RPT-01–RPT-05 | Needs Review | | | | TBD — confirm Ontario fiscal year |

---

## 7. Machine-Readability Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| MR-01: Classified | Needs Review | | | | Expected: Yes — data.ontario.ca CSV |
| MR-02–MR-03 | Needs Review | | | | |

---

## 8. Privacy / Personal Information Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| PRI-01–PRI-05 | Needs Review | | | | Transfer payment recipients are organisations — expected low personal information risk; confirm no named-individual recipients appear in the in-scope datasets |

---

## 9. Public Official / High-Risk Data Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| HRD-01: High-risk flag | Not flagged | | | | Aggregate grants and transfer payment data — not a named-official reputational-risk source |
| HRD-02–HRD-05 | NA | | | | |

---

## 10–12. Transformation, App Display, Firestore Mapping

| Review Item | Status | Notes |
|---|---|---|
| TRF-01–TRF-05 | Needs Review | TBD |
| DSP-01–DSP-06 | Needs Review | TBD |
| FS-01–FS-04 | Needs Review | TBD |

---

## 13. Final Source Decision

| Field | Value |
|---|---|
| **Final decision** | **Pending Review** |
| **CV-REG-001 Licence Status** | Review Required |
| **CV-REC-001 required before Firestore write** | Yes |

---

## 14. Open Issues

| Issue | Priority | Owner | Target Date |
|---|---|---|---|
| Confirm exact data.ontario.ca dataset URL(s) for public accounts and transfer payments | High | Data Lead | TBD |
| Confirm Ontario Open Data Licence applies | High | Data Lead | TBD |
| Confirm fiscal year in scope | High | Data Lead | TBD |
| Confirm app display location | High | Product Lead | TBD |
| Confirm Firestore collection and schema | High | Technical Lead | TBD |

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
