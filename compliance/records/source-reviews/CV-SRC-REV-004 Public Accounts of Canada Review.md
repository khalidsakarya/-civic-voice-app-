# CV-SRC-REV-004 — Public Accounts of Canada Review

| Field | Value |
|---|---|
| **Review Record ID** | CV-SRC-REV-004 |
| **Related Source ID (CV-REG-001)** | SRC-FED-004 |
| **Source Name** | Government of Canada — Public Accounts of Canada |
| **Jurisdiction** | Canada Federal |
| **Data Category** | Federal expenditure · Government grants and contributions · Public accounts |
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
> - Specific source path: preferred path is proactive disclosure grants/contributions CSV on open.canada.ca — confirm dataset ID
> - Specific fiscal year for the app has not been confirmed
> - Fetched date: not yet fetched
> - Transformation approach: TBD
> - App display location: TBD
> - Firestore collection and schema: TBD

---

## 1. Purpose

This record documents the source review for the Public Accounts of Canada, published
by the Receiver General for Canada. This source covers federal government expenditures,
grants, contributions, and financial results by department.

**Two source paths are available:**

1. **Proactive disclosure — grants and contributions CSV** on open.canada.ca: machine-readable
   (Yes), updated frequently, preferred path for Civic Voice Canada grant/contribution data.
2. **Public Accounts volumes** (official PDF, tabled in Parliament each fall): authoritative
   for departmental summary figures but machine-readable as Partial only (PDF extraction
   required).

The Data Lead should confirm which path will be used and record the exact dataset URL before
the first data fetch.

---

## 2. Source Identification

| Field | Value |
|---|---|
| **Source owner / publisher** | Receiver General for Canada / Treasury Board of Canada Secretariat |
| **Source URL — Public Accounts** | https://www.canada.ca/en/treasury-board-secretariat/services/reporting-government-spending/public-accounts-canada.html |
| **Source URL — proactive disclosure (grants/contributions)** | https://open.canada.ca/data/en/dataset — search "grants contributions proactive disclosure" (confirm exact dataset ID) |
| **Source format** | CSV (proactive disclosure on open.canada.ca — preferred); PDF (Public Accounts volumes) |
| **Data type** | Federal departmental expenditures, grants and contributions to organisations, Public Accounts summary by department |
| **Reporting period** | TBD — confirm fiscal year at time of data fetch (Public Accounts tabled annually in fall; proactive disclosure updated quarterly) |
| **Fetched date** | Not yet fetched |
| **Licence / terms reference** | Open Government Licence – Canada 2.0 — https://open.canada.ca/en/open-government-licence-canada |
| **Review trigger** | Pre-launch review (Step 23) |

---

## 3. Source Eligibility Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| ELG-01: Source is an approved type | **Pass** | Receiver General / TBS is the official publisher of Public Accounts. open.canada.ca proactive disclosure CSV is an official Government of Canada open-data publication. Approved types under CV-POL-002 §3. | Founder / Data Lead | 2026-08-02 | |
| ELG-02: Source is not a prohibited type | **Pass** | Official government publication — not a news site or unofficial aggregator. | Founder / Data Lead | 2026-08-02 | |
| ELG-03: Source owner identified | **Pass** | Receiver General for Canada / Treasury Board of Canada Secretariat — confirmed. | Founder / Data Lead | 2026-08-02 | |
| ELG-04: Source URL recorded | **Pass** | Primary URLs confirmed: TBS Public Accounts page and open.canada.ca proactive disclosure portal. Specific dataset ID on open.canada.ca to be confirmed at data fetch time. | Founder / Data Lead | 2026-08-02 | Confirm proactive disclosure dataset ID |
| ELG-05: Source publicly accessible | **Pass** | Public Accounts page and open.canada.ca proactive disclosure are publicly accessible without login or paywall. | Founder / Data Lead | 2026-08-02 | |
| ELG-06: Data relevant to civic purpose | **Pass** | Federal government expenditure, grants, and contributions are core civic accountability data. | Founder / Data Lead | 2026-08-02 | |

---

## 4. Licence / Terms Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| LIC-01: Licence identified | **Pass** | Open Government Licence – Canada 2.0 — https://open.canada.ca/en/open-government-licence-canada. Applies to all open.canada.ca datasets and Government of Canada open information. | Founder / Data Lead | 2026-08-02 | |
| LIC-02: Licence permits reuse | **Pass** | OGL-Canada 2.0 permits reproduction, modification, distribution in any medium for any lawful purpose. | Founder / Data Lead | 2026-08-02 | |
| LIC-03: Attribution required | **Pass** | OGL-Canada 2.0 requires: "Contains information licensed under the Open Government Licence – Canada." | Founder / Data Lead | 2026-08-02 | See Section 5 for confirmed wording |
| LIC-04: No prohibited uses | **Pass** | No prohibited uses applicable to non-commercial civic display of aggregate expenditure and grants data. | Founder / Data Lead | 2026-08-02 | |
| LIC-05: Licence Status | **Approved** | OGL-Canada 2.0 reviewed and confirmed to permit display, transformation, and attribution as intended. | Founder / Data Lead | 2026-08-02 | Update CV-REG-001 SRC-FED-004 Licence Status to Approved |
| LIC-06: Licence version | **Pass** | OGL-Canada 2.0. | Founder / Data Lead | 2026-08-02 | |
| LIC-07: Terms change monitoring | **Pass** | Monitor open.canada.ca/en/open-government-licence-canada at each annual data update cycle. | Founder / Data Lead | 2026-08-02 | |

---

## 5. Attribution Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| ATT-01: Attribution wording confirmed | **Pass** | **Confirmed wording:** "Source: Receiver General for Canada — Public Accounts of Canada [fiscal year], Government of Canada. Contains information licensed under the Open Government Licence – Canada. Fetched [date]." For proactive disclosure path: "Source: Government of Canada — Proactive Disclosure: Grants and Contributions [fiscal year], open.canada.ca. Contains information licensed under the Open Government Licence – Canada. Fetched [date]." | Founder / Data Lead | 2026-08-02 | Use path-appropriate wording |
| ATT-02: Attribution recorded in CV-REG-001 | **Pass** | Attribution wording recorded in CV-REG-001 SRC-FED-004 Notes and Attribution Statements section. | Founder / Data Lead | 2026-08-02 | |
| ATT-03: Attribution placement in UI | **Needs Review** | App display location TBD — attribution placement depends on where Public Accounts data appears. | | | |
| ATT-04: Attribution consistent with licence | **Pass** | Wording in ATT-01 meets OGL-Canada 2.0 attribution requirement. | Founder / Data Lead | 2026-08-02 | |

---

## 6. Reporting Period Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| RPT-01: Reporting period identified | **Needs Review** | Annual Public Accounts tabled each fall covering the prior fiscal year (April–March). Proactive disclosure updated quarterly. Specific fiscal year for app not yet confirmed. | | | Confirm at data fetch time |
| RPT-02: Reporting period accurate | **Needs Review** | Confirm against TBS publication at fetch time. | | | |
| RPT-03: Source update frequency known | **Pass** | Public Accounts: annual (fall tabling). Proactive disclosure grants/contributions: quarterly updates on open.canada.ca. | Founder / Data Lead | 2026-08-02 | |
| RPT-04: App update frequency defined | **Needs Review** | Expected: annual update following each Public Accounts tabling. Confirm in CV-SOP-002 schedule. | | | |
| RPT-05: Staleness risk noted | **Pass** | Annual data; staleness risk is low once reporting year is confirmed. Display "Fiscal year [year]" label in app. | Founder / Data Lead | 2026-08-02 | |

---

## 7. Machine-Readability Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| MR-01: Machine-readability classified | **Yes (proactive disclosure CSV path) / Partial (Public Accounts PDF path)** | Proactive disclosure on open.canada.ca: CSV — machine-readable (Yes). Public Accounts volumes: PDF — machine-readable (Partial). Recommended path: proactive disclosure CSV. | Founder / Data Lead | 2026-08-02 | |
| MR-02: Partial path risk | **Pass** | If PDF path is used: manual extraction required; verify data against source before Firestore write per CV-SOP-001. | Founder / Data Lead | 2026-08-02 | |
| MR-03: Fetch method | **Partial** | Recommended: download CSV from open.canada.ca proactive disclosure grants and contributions dataset. Confirm exact dataset ID and URL at first fetch. | Founder / Data Lead | 2026-08-02 | Confirm at data fetch time |

---

## 8. Privacy / Personal Information Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| PRI-01: Personal information assessment | **Pass** | Aggregate expenditure data and grants to organisations — no individual-level personal information in the primary scope. | Founder / Data Lead | 2026-08-02 | |
| PRI-02: Public official personal information | **Pass** | N/A — aggregate departmental data and organisation grants, not named officials. | Founder / Data Lead | 2026-08-02 | |
| PRI-03: Non-official personal information | **Pass** | Grants recipients are organisations — no individual personal information in organisation-level grant records. | Founder / Data Lead | 2026-08-02 | Confirm: if any grant recipients are named individuals rather than organisations, assess separately |
| PRI-04: Sensitive personal information | **Pass** | No sensitive personal information in aggregate fiscal and grants-to-organisations data. | Founder / Data Lead | 2026-08-02 | |
| PRI-05: CV-REG-002 update required | **Pass — no update required** | Aggregate data and organisation names — not personal information. CV-REG-002 update not required. | Founder / Data Lead | 2026-08-02 | |

---

## 9. Public Official / High-Risk Data Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| HRD-01: High-risk flag | **Not flagged** | Aggregate expenditure data and grants to organisations — not a named-official or reputational-risk source. | Founder / Data Lead | 2026-08-02 | |
| HRD-02 through HRD-05 | **N/A** | Not applicable. | Founder / Data Lead | 2026-08-02 | |

---

## 10. Transformation Review

| Review Item | Status | Notes |
|---|---|---|
| TRF-01 through TRF-05 | **Needs Review** | Transformation approach (departmental grouping, grant category aggregation, chart preparation) not yet defined. Confirm at data design stage. |

---

## 11. App Display Review

| Review Item | Status | Notes |
|---|---|---|
| DSP-01 through DSP-06 | **Needs Review** | App display location ("Public Accounts section" per CV-REG-001) is a placeholder. Specific screen, status label, freshness indicator, and /sources page entry are TBD. |

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
| **Decision rationale** | Source owner confirmed (Receiver General for Canada / TBS). Official source URLs confirmed. Licence confirmed (OGL-Canada 2.0 — Approved). Attribution wording confirmed. Privacy risk confirmed low (aggregate data and grants to organisations). Not a high-risk source. **Limitations:** Specific source path (proactive disclosure CSV vs PDF volumes) not finalised; proactive disclosure dataset ID not confirmed; specific fiscal year not confirmed; fetched date not available; transformation, app display location, and Firestore collection all TBD. Data must not be written to Firestore or displayed until all limitations are resolved and CV-REC-001 is completed for the fetch event. |
| **CV-REG-001 Licence Status** | **Approved** — update CV-REG-001 SRC-FED-004 |
| **Remaining before Approved for Public Display** | (1) Confirm source path; (2) Confirm proactive disclosure dataset ID on open.canada.ca; (3) Confirm fiscal year; (4) First data fetch with fetched date; (5) Complete transformation design; (6) Confirm app display location; (7) Confirm Firestore collection; (8) Complete CV-REC-001 |
| **Manual review flag required** | Yes if PDF path is used. No if proactive disclosure CSV path is used. |
| **CV-REC-001 required before Firestore write** | Yes |

---

## 14. Open Issues

| # | Issue | Priority | Owner | Status | Target Date |
|---|---|---|---|---|---|
| 1 | Confirm source path: proactive disclosure grants/contributions CSV vs Public Accounts PDF volumes | High | Data Lead | Open | Before data fetch |
| 2 | Confirm exact dataset ID for proactive disclosure grants and contributions on open.canada.ca | High | Data Lead | Open | Before data fetch |
| 3 | Confirm fiscal year that will be displayed at launch | High | Data Lead / Product Lead | Open | Before data fetch |
| 4 | Define transformation approach (departmental grouping, grant category structure) | High | Data Lead | Open | Before Firestore design |
| 5 | Confirm app display location and screen design | High | Product Lead | Open | |
| 6 | Confirm Firestore collection name and schema | High | Technical Lead | Open | |
| 7 | Record fetched date when data is first fetched | High | Data Lead | Open | At first fetch |
| 8 | Complete CV-REC-001 Data Verification Checklist at first fetch | High | Data Lead | Open | At first fetch |

**Issues resolved in this review:**
- ~~Confirm source owner~~ — **Resolved 2026-08-02**: Receiver General for Canada / TBS.
- ~~Confirm preferred source URL~~ — **Resolved 2026-08-02**: TBS Public Accounts page and open.canada.ca confirmed.
- ~~Confirm licence~~ — **Resolved 2026-08-02**: OGL-Canada 2.0 confirmed Approved.
- ~~Draft attribution wording~~ — **Resolved 2026-08-02**: Confirmed for both source paths.
- ~~Confirm machine-readability~~ — **Resolved 2026-08-02**: Yes (proactive disclosure CSV) / Partial (PDF).
- ~~Confirm privacy risk~~ — **Resolved 2026-08-02**: Low — aggregate data and organisation grants.

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
| 0.2 | 2026-08-02 | Founder / Data Lead | Step 23 review: source owner, URLs, OGL-Canada 2.0 licence, attribution, machine-readability (CSV vs PDF paths), privacy, and high-risk status confirmed. Source ID corrected from SRC-004 to SRC-FED-004. Licence Status updated to Approved. Final decision: Approved with Limitations. |
