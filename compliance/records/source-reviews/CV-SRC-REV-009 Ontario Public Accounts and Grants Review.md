# CV-SRC-REV-009 — Ontario Public Accounts and Grants Review

| Field | Value |
|---|---|
| **Review Record ID** | CV-SRC-REV-009 |
| **Related Source ID (CV-REG-001)** | SRC-ONT-002 |
| **Source Name** | Government of Ontario — Public Accounts and Grants/Transfer Payments |
| **Jurisdiction** | Ontario |
| **Data Category** | Ontario public accounts · Transfer payments · Grants to organisations |
| **Review Status** | Draft |
| **Reviewer** | Founder / Data Lead |
| **Review Date** | 2026-08-02 |
| **Related Documents** | CV-REG-001 Data Source Register · CV-CHK-005 Canadian Source Review Checklist · CV-SOP-001 Data Verification SOP · CV-POL-002 Data Sources and Attribution Policy |

---

> ℹ️ **DRAFT — APPROVED WITH LIMITATIONS**
>
> **Source owner confirmed. Licence confirmed (Open Government Licence – Ontario). Attribution confirmed.**
> **Machine-readability confirmed: Yes — data.ontario.ca provides CSV transfer payment datasets.**
>
> **Remaining limitations** (must be resolved before data is written to Firestore or displayed):
> - Exact data.ontario.ca dataset URL(s) to be confirmed at data fetch time
> - Specific fiscal year for the app has not been confirmed
> - Fetched date: not yet fetched
> - Transformation approach: TBD
> - App display location: TBD
> - Firestore collection and schema: TBD

---

## 1. Purpose

This record documents the source review for Ontario Public Accounts and grants/transfer
payment data. The Government of Ontario publishes transfer payment and grant recipient
data through data.ontario.ca as open CSV datasets. This data supports civic accountability
transparency by showing Ontario government spending to organisations.

**Preferred source path:** Ontario Transfer Payments and Grants datasets on data.ontario.ca
(CSV — machine-readable: Yes). The Data Lead must confirm the exact dataset URL at the
time of first data fetch.

The formal Ontario Public Accounts (PDF volumes published annually) are an additional
source for departmental summary figures if needed; however, the data.ontario.ca CSV
path is preferred as it is machine-readable and does not require manual extraction.

---

## 2. Source Identification

| Field | Value |
|---|---|
| **Source owner / publisher** | Treasury Board Secretariat of Ontario / Ministry of Finance |
| **Source URL — Ontario Public Accounts** | https://www.ontario.ca/page/public-accounts |
| **Source URL — data.ontario.ca transfer payments portal** | https://data.ontario.ca (search "transfer payments grants"; confirm exact dataset URL) |
| **Source format** | CSV (data.ontario.ca transfer payments datasets — preferred); PDF (Public Accounts volumes) |
| **Data type** | Ontario transfer payment recipients and amounts by ministry; grants to organisations; departmental expenditure summaries |
| **Reporting period** | TBD — confirm fiscal year at data fetch time (Public Accounts tabled annually in fall; data.ontario.ca datasets updated as published) |
| **Fetched date** | Not yet fetched |
| **Licence / terms reference** | Open Government Licence – Ontario — https://www.ontario.ca/page/open-government-licence-ontario |
| **Review trigger** | Pre-launch review (Step 23) |

---

## 3. Source Eligibility Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| ELG-01: Source is an approved type | **Pass** | Treasury Board Secretariat of Ontario / Ministry of Finance is the official provincial fiscal authority. data.ontario.ca is the official Ontario government open-data portal. Approved types under CV-POL-002 §3. | Founder / Data Lead | 2026-08-02 | |
| ELG-02: Source is not a prohibited type | **Pass** | Official government open-data portal — not a news site or unofficial aggregator. | Founder / Data Lead | 2026-08-02 | |
| ELG-03: Source owner identified | **Pass** | Treasury Board Secretariat of Ontario / Ministry of Finance — confirmed. | Founder / Data Lead | 2026-08-02 | |
| ELG-04: Source URL recorded | **Pass** | Primary URLs confirmed: ontario.ca/page/public-accounts and data.ontario.ca portal. Specific dataset URL to be confirmed at data fetch time. | Founder / Data Lead | 2026-08-02 | Confirm specific dataset URL on data.ontario.ca |
| ELG-05: Source publicly accessible | **Pass** | ontario.ca/page/public-accounts and data.ontario.ca are publicly accessible without login or paywall. CSV downloads are free. | Founder / Data Lead | 2026-08-02 | |
| ELG-06: Data relevant to civic purpose | **Pass** | Ontario government transfer payments and grants to organisations are core civic accountability data — shows how provincial funds are distributed. | Founder / Data Lead | 2026-08-02 | |

---

## 4. Licence / Terms Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| LIC-01: Licence identified | **Pass** | Open Government Licence – Ontario — https://www.ontario.ca/page/open-government-licence-ontario. Applies to all data.ontario.ca datasets and ontario.ca publications. | Founder / Data Lead | 2026-08-02 | |
| LIC-02: Licence permits reuse | **Pass** | OGL-Ontario permits reproduction, modification, distribution in any medium for any lawful purpose. | Founder / Data Lead | 2026-08-02 | |
| LIC-03: Attribution required | **Pass** | OGL-Ontario requires: "Contains information licensed under the Open Government Licence – Ontario." | Founder / Data Lead | 2026-08-02 | See Section 5 for confirmed wording |
| LIC-04: No prohibited uses | **Pass** | No prohibited uses applicable to non-commercial civic display of aggregate transfer payment and grants data. | Founder / Data Lead | 2026-08-02 | |
| LIC-05: Licence Status | **Approved** | OGL-Ontario reviewed and confirmed to permit display, transformation, and attribution as intended. | Founder / Data Lead | 2026-08-02 | Update CV-REG-001 SRC-ONT-002 Licence Status to Approved |
| LIC-06: Licence version | **Pass** | Open Government Licence – Ontario (no numbered version; current edition). | Founder / Data Lead | 2026-08-02 | |
| LIC-07: Terms change monitoring | **Pass** | Monitor ontario.ca/page/open-government-licence-ontario at each annual data update cycle per CV-SOP-002. | Founder / Data Lead | 2026-08-02 | |

---

## 5. Attribution Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| ATT-01: Attribution wording confirmed | **Pass** | **Confirmed wording:** "Source: Government of Ontario — Transfer Payments and Grants [fiscal year], data.ontario.ca. Contains information licensed under the Open Government Licence – Ontario. Fetched [date]." For Public Accounts path: "Source: Ontario Ministry of Finance — Public Accounts of Ontario [fiscal year]. Contains information licensed under the Open Government Licence – Ontario. Fetched [date]." | Founder / Data Lead | 2026-08-02 | Use path-appropriate wording |
| ATT-02: Attribution recorded in CV-REG-001 | **Pass** | Attribution wording recorded in CV-REG-001 SRC-ONT-002 Notes and Attribution Statements section. | Founder / Data Lead | 2026-08-02 | |
| ATT-03: Attribution placement in UI | **Needs Review** | App display location TBD — attribution placement depends on where Ontario spending data appears. | | | |
| ATT-04: Attribution consistent with licence | **Pass** | Wording in ATT-01 meets OGL-Ontario attribution requirement. | Founder / Data Lead | 2026-08-02 | |

---

## 6. Reporting Period Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| RPT-01: Reporting period identified | **Needs Review** | Annual public accounts and transfer payment data. Specific fiscal year for app not yet confirmed. | | | Confirm at data fetch time |
| RPT-02: Reporting period accurate | **Needs Review** | Confirm against data.ontario.ca dataset metadata at fetch time. | | | |
| RPT-03: Source update frequency known | **Pass** | data.ontario.ca transfer payment datasets: updated as published, typically annually following Public Accounts tabling in fall. | Founder / Data Lead | 2026-08-02 | |
| RPT-04: App update frequency defined | **Needs Review** | Expected: annual update. Confirm in CV-SOP-002. | | | |
| RPT-05: Staleness risk noted | **Pass** | Annual data; staleness risk is low once reporting year is confirmed. Display "Fiscal year [year]" label in app. | Founder / Data Lead | 2026-08-02 | |

---

## 7. Machine-Readability Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| MR-01: Machine-readability classified | **Yes (data.ontario.ca CSV path)** | data.ontario.ca publishes Ontario transfer payment datasets as downloadable CSV files — machine-readable (Yes). This is the preferred and recommended path. The PDF Public Accounts volumes are Partial only. | Founder / Data Lead | 2026-08-02 | |
| MR-02: Partial path risk | **Pass** | If PDF path is used for departmental summaries: manual extraction required; verify before Firestore write per CV-SOP-001. | Founder / Data Lead | 2026-08-02 | |
| MR-03: Fetch method | **Partial** | Recommended fetch method: CSV download from data.ontario.ca transfer payments dataset. Confirm exact dataset URL and column structure at first fetch. | Founder / Data Lead | 2026-08-02 | Confirm at data fetch time |

---

## 8. Privacy / Personal Information Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| PRI-01: Personal information assessment | **Pass** | Ontario transfer payment recipients are organisations (service providers, municipalities, health agencies, etc.) — not named individuals. Aggregate expenditure data — no individual-level personal information. | Founder / Data Lead | 2026-08-02 | |
| PRI-02: Public official personal information | **Pass** | N/A — transfer payment data lists recipient organisations, not named officials. | Founder / Data Lead | 2026-08-02 | |
| PRI-03: Non-official personal information | **Pass** | Recipients are organisations — no individual personal information in the transfer payment CSV datasets. | Founder / Data Lead | 2026-08-02 | Confirm: if any recipient is a named individual rather than an organisation, assess separately |
| PRI-04: Sensitive personal information | **Pass** | No sensitive personal information — organisation names and grant amounts. | Founder / Data Lead | 2026-08-02 | |
| PRI-05: CV-REG-002 update required | **Pass — no update required** | Organisation-level data — not personal information. CV-REG-002 update not required. | Founder / Data Lead | 2026-08-02 | |

---

## 9. Public Official / High-Risk Data Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| HRD-01: High-risk flag | **Not flagged** | Aggregate transfer payment and grants-to-organisations data — not a named-official or reputational-risk source. | Founder / Data Lead | 2026-08-02 | |
| HRD-02 through HRD-05 | **N/A** | Not applicable. | Founder / Data Lead | 2026-08-02 | |

---

## 10. Transformation Review

| Review Item | Status | Notes |
|---|---|---|
| TRF-01 through TRF-05 | **Needs Review** | Transformation approach (grouping by ministry/category, filtering by threshold, chart preparation) not yet defined. Confirm at data design stage. |

---

## 11. App Display Review

| Review Item | Status | Notes |
|---|---|---|
| DSP-01 through DSP-06 | **Needs Review** | App display location ("Ontario Spending / Grants section" per CV-REG-001) is a placeholder. Specific screen, status label, freshness indicator, and /sources page entry are TBD. |

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
| **Decision rationale** | Source owner confirmed (Treasury Board Secretariat / Ministry of Finance). Official source URLs confirmed. Licence confirmed (OGL-Ontario — Approved). Attribution wording confirmed. Machine-readability confirmed: Yes for data.ontario.ca CSV transfer payments path. Privacy risk confirmed low (organisation-level data). Not a high-risk source. **Limitations:** Exact data.ontario.ca dataset URL not yet confirmed; specific fiscal year not confirmed; fetched date not available; transformation, app display location, and Firestore collection all TBD. Data must not be written to Firestore or displayed until all limitations are resolved and CV-REC-001 is completed. |
| **CV-REG-001 Licence Status** | **Approved** — update CV-REG-001 SRC-ONT-002 |
| **Remaining before Approved for Public Display** | (1) Confirm exact data.ontario.ca dataset URL; (2) Confirm fiscal year; (3) First data fetch with fetched date; (4) Complete transformation design; (5) Confirm app display location; (6) Confirm Firestore collection; (7) Complete CV-REC-001 |
| **Manual review flag required** | No — data.ontario.ca CSV path does not require manual review. Flag as Yes only if PDF Public Accounts path is used for any data element. |
| **CV-REC-001 required before Firestore write** | Yes |

---

## 14. Open Issues

| # | Issue | Priority | Owner | Status | Target Date |
|---|---|---|---|---|---|
| 1 | Confirm exact data.ontario.ca dataset URL for Ontario transfer payments / grants | High | Data Lead | Open | Before data fetch |
| 2 | Confirm fiscal year that will be displayed at launch | High | Data Lead / Product Lead | Open | Before data fetch |
| 3 | Review data.ontario.ca dataset column structure and confirm which fields map to app display | High | Data Lead | Open | Before data fetch |
| 4 | Define transformation approach (ministry grouping, category filtering, chart structure) | High | Data Lead | Open | Before Firestore design |
| 5 | Confirm app display location and screen design | High | Product Lead | Open | |
| 6 | Confirm Firestore collection name and schema | High | Technical Lead | Open | |
| 7 | Record fetched date when data is first fetched | High | Data Lead | Open | At first fetch |
| 8 | Complete CV-REC-001 Data Verification Checklist at first fetch | High | Data Lead | Open | At first fetch |

**Issues resolved in this review:**
- ~~Confirm source owner~~ — **Resolved 2026-08-02**: Treasury Board Secretariat / Ministry of Finance confirmed.
- ~~Confirm source URL~~ — **Resolved 2026-08-02**: ontario.ca/page/public-accounts and data.ontario.ca confirmed.
- ~~Confirm OGL-Ontario licence~~ — **Resolved 2026-08-02**: Confirmed Approved.
- ~~Draft attribution wording~~ — **Resolved 2026-08-02**: Confirmed for both source paths.
- ~~Confirm machine-readability~~ — **Resolved 2026-08-02**: Yes — data.ontario.ca CSV.
- ~~Confirm privacy risk~~ — **Resolved 2026-08-02**: Low — organisation-level data, no personal information.

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
| 0.2 | 2026-08-02 | Founder / Data Lead | Step 23 review: source owner, URLs, OGL-Ontario licence, attribution, machine-readability (data.ontario.ca CSV confirmed Yes), privacy, and high-risk status all confirmed. Source ID corrected from SRC-009 to SRC-ONT-002. Licence Status updated to Approved. Final decision: Approved with Limitations. |
