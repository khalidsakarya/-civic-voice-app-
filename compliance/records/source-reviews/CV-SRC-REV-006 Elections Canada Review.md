# CV-SRC-REV-006 — Elections Canada Review

| Field | Value |
|---|---|
| **Review Record ID** | CV-SRC-REV-006 |
| **Related Source ID (CV-REG-001)** | SRC-006 |
| **Source Name** | Elections Canada — Election Results and Campaign Finance Data |
| **Jurisdiction** | Canada Federal |
| **Data Category** | Federal election results · Candidate and party campaign finance · Riding data |
| **Review Status** | Draft |
| **Reviewer** | Founder / Data Lead |
| **Review Date** | TBD |
| **Related Documents** | CV-REG-001 Data Source Register · CV-CHK-005 Canadian Source Review Checklist · CV-SOP-001 Data Verification SOP · CV-POL-002 Data Sources and Attribution Policy |

---

> ⚠️ **DRAFT — PENDING REVIEW**
>
> This record has not been completed. All checklist items are unconfirmed.
> The final source decision is **Pending Review**.
>
> **Note on campaign finance data:** Campaign finance filings include named candidates
> and named donors above the disclosure threshold. This makes campaign finance data
> a **high-risk sub-category** within this source. Confirm intended use before
> approving any named-donor display.

---

## 1. Purpose

This record documents the source review for Elections Canada election results and
campaign finance data. Elections Canada is the independent non-partisan agency
responsible for conducting federal elections under the *Canada Elections Act*.

---

## 2. Source Identification

| Field | Value |
|---|---|
| **Source owner / publisher** | Elections Canada |
| **Source URL** | TBD — confirm: elections.ca open data portal (enr.elections.ca for results; elections.ca/content.aspx?section=fin for finance) |
| **Source format** | TBD — Elections Canada publishes election results as open CSV/XML; campaign finance data is available via elections.ca search and open data |
| **Data type** | Riding-level election results, candidate vote counts, party results, campaign finance filings (contributions, expenses) |
| **Reporting period** | TBD — confirm election cycle (e.g., 45th federal general election) and campaign finance fiscal year |
| **Fetched date** | TBD |
| **Licence / terms reference** | TBD — expected: Open Government Licence — Canada; confirm for Elections Canada data specifically |
| **Review trigger** | Pre-launch review |

---

## 3. Source Eligibility Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| ELG-01: Approved type | Needs Review | | | | Elections Canada is an independent federal agency and official source for election data — eligible |
| ELG-02: Not prohibited | Needs Review | | | | Expected Pass |
| ELG-03: Owner identified | Needs Review | | | | Elections Canada |
| ELG-04: URL recorded | Needs Review | | | | TBD |
| ELG-05: Publicly accessible | Needs Review | | | | Elections Canada open data is publicly available — confirm |
| ELG-06: Relevant | Needs Review | | | | Federal election results and campaign finance are core civic accountability data |

---

## 4. Licence / Terms Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| LIC-01–LIC-07 | Needs Review | | | | Expected: OGL-Canada; confirm for elections.ca open data |

---

## 5. Attribution Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| ATT-01–ATT-04 | Needs Review | | | | Draft: "Source: Elections Canada. Licensed under the Open Government Licence – Canada." |

---

## 6. Reporting Period Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| RPT-01–RPT-05 | Needs Review | | | | TBD — confirm election cycle and campaign finance reporting period in scope |

---

## 7. Machine-Readability Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| MR-01: Classified | Needs Review | | | | Expected: Yes — Elections Canada publishes open CSV/XML data |
| MR-02–MR-03 | Needs Review | | | | |

---

## 8. Privacy / Personal Information Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| PRI-01: Personal information assessment | Needs Review | | | | Election results: named candidates — public figures acting in public role; campaign finance: named donors above threshold — publicly disclosed under *Canada Elections Act* |
| PRI-02: Public official/candidate | Needs Review | | | | Candidate names and results are public — confirm intended display is limited to election outcomes, not personal details |
| PRI-03: Named donors | Needs Review | | | | Named donor data is publicly disclosed under *Canada Elections Act* — confirm display is limited to disclosed amounts and is not used to profile individuals |
| PRI-04: Sensitive data | Needs Review | | | | |
| PRI-05: CV-REG-002 update | Needs Review | | | | If named candidate or donor data is displayed, update CV-REG-002 |

---

## 9. Public Official / High-Risk Data Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| HRD-01: High-risk flag | **Flagged — High-Risk (campaign finance sub-category)** | | | | Election results with named candidates: High-risk. Campaign finance with named donors: High-risk. Second reviewer required for campaign finance display. |
| HRD-02: Second reviewer | **Required for campaign finance** | | | | |
| HRD-03: Official source | Needs Review | | | | Must confirm data is from official Elections Canada source, not third-party aggregator |
| HRD-04: Spot-check | Needs Review | | | | |
| HRD-05: Disclaimer placement | Needs Review | | | | |

---

## 10–12. Transformation, App Display, Firestore Mapping

| Review Item | Status | Notes |
|---|---|---|
| TRF-01–TRF-05 | Needs Review | TBD — confirm whether vote counts are displayed raw or as percentages; confirm riding-level aggregation approach |
| DSP-01–DSP-06 | Needs Review | TBD — confirm app display; ensure no "who to vote for" or voting recommendation framing |
| FS-01–FS-04 | Needs Review | TBD |

---

## 13. Final Source Decision

| Field | Value |
|---|---|
| **Final decision** | **Pending Review** |
| **Decision rationale** | Source URL, campaign finance privacy assessment, second reviewer for campaign finance, app display framing, and Firestore mapping all TBD. |
| **CV-REG-001 Licence Status** | Review Required |
| **Second review required** | Yes — for campaign finance sub-category |
| **CV-REC-001 required before Firestore write** | Yes |

---

## 14. Open Issues

| Issue | Priority | Owner | Target Date |
|---|---|---|---|
| Confirm Elections Canada open data URLs for results and finance | High | Data Lead | TBD |
| Confirm OGL-Canada licence applies | High | Data Lead | TBD |
| Confirm election cycle and campaign finance period in scope | High | Data Lead | TBD |
| Confirm treatment of named candidates and donors — privacy assessment | High | Privacy Lead | TBD |
| Assign second reviewer for campaign finance display | High | Data Lead | TBD |
| Confirm app display framing — no voting recommendation language | High | Product Lead | TBD |
| Confirm Firestore collection and schema | High | Technical Lead | TBD |

---

## 15. Approval

| Role | Name | Date | Decision |
|---|---|---|---|
| Primary Reviewer | TBD | TBD | Pending Review |
| **Second Reviewer (campaign finance — required)** | TBD | TBD | Pending Review |
| Data Lead | TBD | TBD | Pending Review |

---

## Change Log

| Version | Date | Author | Change |
|---|---|---|---|
| 0.1 | 2026-08-02 | Founder / Data Lead | Initial draft — high-risk flag (campaign finance); second reviewer required; all items Needs Review |
