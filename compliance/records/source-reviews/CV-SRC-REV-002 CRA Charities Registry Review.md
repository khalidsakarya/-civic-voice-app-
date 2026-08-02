# CV-SRC-REV-002 — CRA Charities Registry Review

| Field | Value |
|---|---|
| **Review Record ID** | CV-SRC-REV-002 |
| **Related Source ID (CV-REG-001)** | SRC-FED-002 |
| **Source Name** | Canada Revenue Agency — Charities Registry |
| **Jurisdiction** | Canada Federal |
| **Data Category** | Registered charities · Charitable organization disclosures |
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

This record documents the source review for the Canada Revenue Agency Charities
Registry used in Civic Voice Canada. The CRA Charities Registry is a statutory public
register of registered Canadian charities. This review tracks eligibility, licence,
attribution, reporting period, machine-readability, privacy, transformation, and
Firestore mapping in accordance with CV-CHK-005.

---

## 2. Source Identification

| Field | Value |
|---|---|
| **Source owner / publisher** | Canada Revenue Agency (Government of Canada) |
| **Source URL** | TBD — confirm exact URL: apps.cra-arc.gc.ca/ebci/hacc/srch/pub/rdrctToLtst (search portal) or open data equivalent |
| **Source format** | TBD — CRA Charities Registry is a searchable database; confirm whether an open-data CSV/API export is available |
| **Data type** | Registered charity names, registration numbers, status, financial filings (T3010), directors, charitable purposes |
| **Reporting period** | TBD — confirm fiscal year of latest T3010 filings available |
| **Fetched date** | TBD |
| **Licence / terms reference** | TBD — expected: Open Government Licence — Canada; confirm for CRA Charities Registry data specifically |
| **Review trigger** | Pre-launch review |

---

## 3. Source Eligibility Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| ELG-01: Source is an approved type | Needs Review | | | | CRA Charities Registry is a statutory public register — eligible type under CV-POL-002; confirm format available |
| ELG-02: Source is not a prohibited type | Needs Review | | | | Expected Pass |
| ELG-03: Source owner identified | Needs Review | | | | Canada Revenue Agency — federal government body |
| ELG-04: Source URL recorded | Needs Review | | | | TBD — confirm exact data access URL |
| ELG-05: Source publicly accessible | Needs Review | | | | CRA Charities search is publicly accessible — confirm for programmatic access |
| ELG-06: Data relevant to civic purpose | Needs Review | | | | Charitable organization accountability data is relevant to civic information — confirm intended use case |

---

## 4. Licence / Terms Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| LIC-01: Licence identified | Needs Review | | | | TBD — check CRA open data page for applicable licence |
| LIC-02: Licence permits reuse | Needs Review | | | | OGL-Canada generally permits reuse; confirm for CRA Charities data |
| LIC-03: Attribution required | Needs Review | | | | |
| LIC-04: No prohibited uses | Needs Review | | | | Note: T3010 financial data is public but confirm no CRA terms restrict aggregated republication |
| LIC-05: Licence Status assigned | Needs Review | | | | Expected: **Approved** or **Public Registry** — pending confirmation |
| LIC-06: Licence version noted | Needs Review | | | | |
| LIC-07: Terms change monitoring noted | Needs Review | | | | |

---

## 5. Attribution Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| ATT-01: Attribution wording drafted | Needs Review | | | | Draft: "Source: Canada Revenue Agency — Charities Registry. Government of Canada." — confirm required wording |
| ATT-02: Attribution in CV-REG-001 | Needs Review | | | | |
| ATT-03: Attribution placement in UI identified | Needs Review | | | | TBD |
| ATT-04: Attribution consistent with licence | Needs Review | | | | |

---

## 6. Reporting Period Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| RPT-01: Reporting period identified | Needs Review | | | | T3010 filings are submitted annually; confirm which fiscal year is in scope |
| RPT-02: Reporting period accurate | Needs Review | | | | |
| RPT-03: Source update frequency | Needs Review | | | | CRA updates the registry as filings are processed — confirm lag between filing and publication |
| RPT-04: App update frequency defined | Needs Review | | | | TBD |
| RPT-05: Staleness risk noted | Needs Review | | | | |

---

## 7. Machine-Readability Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| MR-01: Machine-readability classified | Needs Review | | | | TBD — CRA Charities Registry has a web search interface; confirm whether bulk CSV or API access is available through open.canada.ca |
| MR-02: Partial/No risk | Needs Review | | | | If only web scraping is possible, classify as Partial and note risk |
| MR-03: Fetch method documented | Needs Review | | | | TBD |

---

## 8. Privacy / Personal Information Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| PRI-01: Personal information assessment | Needs Review | | | | T3010 filings include director names — these are personal information about individuals acting in a charity governance role; assess disclosure appropriateness |
| PRI-02: Public official personal information | Needs Review | | | | Charity directors are not elected officials but their names are publicly filed — confirm intended use is limited to reporting on public charitable activity |
| PRI-03: Non-official personal information | Needs Review | | | | Director names and addresses in T3010 — confirm that addresses are not displayed; names may be used in the context of reporting on the charity |
| PRI-04: Sensitive personal information | Needs Review | | | | |
| PRI-05: CV-REG-002 update required? | Needs Review | | | | If director names are displayed, update CV-REG-002 |

---

## 9. Public Official / High-Risk Data Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| HRD-01: High-risk flag | Needs Review | | | | Charity director names and financial data — assess whether reputational risk applies; flag if named-individual data is displayed |
| HRD-02: Second reviewer assigned | Needs Review | | | | Required if named director data is displayed |
| HRD-03–HRD-05 | Needs Review | | | | |

---

## 10. Transformation Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| TRF-01–TRF-05 | Needs Review | | | | TBD — confirm whether financial data requires normalisation or aggregation before display |

---

## 11. App Display Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| DSP-01–DSP-06 | Needs Review | | | | TBD — confirm app display location for CRA Charities data |

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
| **Decision rationale** | Source URL, machine-readability format, licence confirmation, director name privacy assessment, app display location, and Firestore collection are all TBD. |
| **CV-REG-001 Licence Status** | Review Required |
| **Manual review flag required** | No — pending review completion |
| **CV-REC-001 required before Firestore write** | Yes |

---

## 14. Open Issues

| Issue | Priority | Owner | Target Date |
|---|---|---|---|
| Confirm whether CRA Charities Registry bulk data is available via open.canada.ca CSV or API | High | Data Lead | TBD |
| Confirm licence for CRA Charities data | High | Data Lead | TBD |
| Assess whether director names will be displayed and confirm privacy treatment | High | Privacy Lead | TBD |
| Confirm reporting period (T3010 fiscal year) in scope | High | Data Lead | TBD |
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
