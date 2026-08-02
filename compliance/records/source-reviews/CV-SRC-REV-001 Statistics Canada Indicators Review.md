# CV-SRC-REV-001 — Statistics Canada Indicators Review

| Field | Value |
|---|---|
| **Review Record ID** | CV-SRC-REV-001 |
| **Related Source ID (CV-REG-001)** | SRC-FED-001 |
| **Source Name** | Statistics Canada — Socioeconomic and Civic Indicators |
| **Jurisdiction** | Canada Federal |
| **Data Category** | Socioeconomic indicators · Demographic data · Civic context data |
| **Review Status** | Draft |
| **Reviewer** | Founder / Data Lead |
| **Review Date** | 2026-08-02 |
| **Related Documents** | CV-REG-001 Data Source Register · CV-CHK-005 Canadian Source Review Checklist · CV-SOP-001 Data Verification SOP · CV-POL-002 Data Sources and Attribution Policy |

---

> ⚠️ **DRAFT — PENDING REVIEW**
>
> **Licence confirmed. Source owner confirmed. Attribution wording confirmed.**
>
> **Blocking issue:** The specific Statistics Canada dataset(s) and indicator(s) to be
> displayed in the app have not been defined. The source review cannot advance further
> until the Data Lead confirms which datasets will be used. Without a confirmed dataset,
> source URL, reporting period, and machine-readability classification cannot be finalised.
>
> This source must not be used in the public app until this record is completed with
> confirmed dataset(s) and a positive final decision is recorded.

---

## 1. Purpose

This record documents the source review for Statistics Canada socioeconomic and civic
indicator data used in Civic Voice Canada. It tracks eligibility, licence, attribution,
reporting period, machine-readability, privacy, transformation, and Firestore mapping
for this source in accordance with CV-CHK-005.

**Scope note:** Statistics Canada publishes hundreds of datasets. This record covers the
Statistics Canada source as a publisher. A separate confirmation of specific dataset(s)
is required before the source can be approved for public display — see Open Issues.

---

## 2. Source Identification

| Field | Value |
|---|---|
| **Source owner / publisher** | Statistics Canada (Government of Canada) |
| **Source URL — main portal** | https://www.statcan.gc.ca |
| **Source URL — open data catalogue** | https://www150.statcan.gc.ca/n1/en/type/data |
| **Source URL — Web Data Service API** | https://www.statcan.gc.ca/en/developers/wds |
| **Source URL — specific dataset(s)** | **TBD — must be confirmed by Data Lead before approval** |
| **Source format** | CSV / JSON via Web Data Service API or dataset download; format varies by dataset |
| **Data type** | Aggregate statistical indicators — socioeconomic, demographic, labour, housing, civic context |
| **Reporting period** | TBD — varies by indicator (annual / quarterly / monthly by dataset) |
| **Fetched date** | Not yet fetched |
| **Licence / terms reference** | Statistics Canada Open Licence — https://www.statcan.gc.ca/en/reference/licence |
| **Review trigger** | Pre-launch review |

---

## 3. Source Eligibility Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| ELG-01: Source is an approved type (official government open-data portal, API, official CSV/JSON) | **Pass** | Statistics Canada is the official federal statistical agency. Open data portal and Web Data Service API are official Government of Canada services. | Founder / Data Lead | 2026-08-02 | Type confirmed as approved under CV-POL-002 §3 |
| ELG-02: Source is not a prohibited type | **Pass** | Statistics Canada is not a news site, Wikipedia, unofficial aggregator, or prohibited source type. | Founder / Data Lead | 2026-08-02 | |
| ELG-03: Source owner identified | **Pass** | Statistics Canada — federal Crown corporation; official publisher of Canada's national statistics. | Founder / Data Lead | 2026-08-02 | |
| ELG-04: Source URL recorded | **Partial** | Main portal and API URLs confirmed (see Section 2). Specific dataset URL(s) not yet confirmed. | Founder / Data Lead | 2026-08-02 | Specific dataset URL is a blocking open issue |
| ELG-05: Source publicly accessible without login or paywall | **Pass** | Statistics Canada open data is freely accessible. Web Data Service API does not require authentication for public datasets. | Founder / Data Lead | 2026-08-02 | Confirm for any specific dataset chosen |
| ELG-06: Data is relevant to civic information purpose | **Needs Review** | Cannot confirm until specific indicators are defined. Aggregate statistical indicators (e.g., CPI, unemployment, housing, population) are relevant to civic context — but confirmation requires knowing which indicators will be displayed. | Founder / Data Lead | 2026-08-02 | Blocking open issue |

---

## 4. Licence / Terms Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| LIC-01: Licence identified | **Pass** | Statistics Canada Open Licence — https://www.statcan.gc.ca/en/reference/licence | Founder / Data Lead | 2026-08-02 | Applies to all Statistics Canada open data products unless a specific dataset page states otherwise |
| LIC-02: Licence permits reuse | **Pass** | Statistics Canada Open Licence: "You are free to copy, modify, publish, translate, adapt, distribute or otherwise use the Information in any medium, mode or format for any lawful purpose." Commercial and non-commercial use permitted. | Founder / Data Lead | 2026-08-02 | |
| LIC-03: Attribution required | **Pass** | Statistics Canada Open Licence requires attribution: "Source: Statistics Canada, [indicator name], [year], [URL]." Adapted/derived works must state they were adapted from Statistics Canada. | Founder / Data Lead | 2026-08-02 | See Section 5 for confirmed wording |
| LIC-04: No prohibited uses | **Pass** | No prohibited uses applicable to non-commercial civic information display of aggregate statistical data. | Founder / Data Lead | 2026-08-02 | Confirm for specific dataset if it carries any additional terms |
| LIC-05: Licence Status | **Approved** | Statistics Canada Open Licence reviewed and confirmed to permit display, transformation, and attribution as intended. | Founder / Data Lead | 2026-08-02 | Update CV-REG-001 SRC-FED-001 Licence Status to Approved |
| LIC-06: Licence version noted | **Pass** | No version number — Statistics Canada Open Licence is referenced as "current" on statcan.gc.ca/en/reference/licence. Monitor for changes. | Founder / Data Lead | 2026-08-02 | |
| LIC-07: Terms change monitoring noted | **Pass** | Monitor statcan.gc.ca/en/reference/licence at each monthly data update cycle per CV-SOP-002. | Founder / Data Lead | 2026-08-02 | |

---

## 5. Attribution Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| ATT-01: Attribution wording confirmed | **Pass** | **Confirmed wording:** "Source: Statistics Canada, [Dataset name], [reporting period]. Adapted from Statistics Canada under the Statistics Canada Open Licence." | Founder / Data Lead | 2026-08-02 | Dataset name and reporting period to be filled in per dataset when confirmed |
| ATT-02: Attribution recorded in CV-REG-001 | **Pass** | Attribution wording recorded in CV-REG-001 SRC-FED-001 Notes and Attribution Statements section. | Founder / Data Lead | 2026-08-02 | Update when specific dataset name is confirmed |
| ATT-03: Attribution placement in UI identified | **Needs Review** | App display location not yet confirmed — attribution placement depends on where Statistics Canada data will appear. | | | |
| ATT-04: Attribution consistent with licence | **Pass** | Wording in ATT-01 is consistent with Statistics Canada Open Licence attribution requirement. | Founder / Data Lead | 2026-08-02 | |

---

## 6. Reporting Period Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| RPT-01: Reporting period identified | **Needs Review** | Cannot confirm until specific dataset(s) are defined. Reporting periods vary: some Statistics Canada indicators are annual, some quarterly, some monthly. | | | Blocking open issue |
| RPT-02: Reporting period accurate | **Needs Review** | | | | Confirm at time of first data fetch |
| RPT-03: Source update frequency known | **Partial** | Statistics Canada releases data on varying schedules. Annual, quarterly, and monthly releases all possible depending on indicator chosen. | Founder / Data Lead | 2026-08-02 | Confirm per dataset |
| RPT-04: App update frequency defined | **Needs Review** | | | | Define after specific datasets are confirmed |
| RPT-05: Staleness risk noted | **Needs Review** | | | | Assess after specific datasets and app update frequency are confirmed |

---

## 7. Machine-Readability Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| MR-01: Machine-readability classified | **Partial** | Statistics Canada open data is generally available as CSV and JSON via the Web Data Service API or direct dataset download — machine-readable (Yes) for most public datasets. However, classification is Partial until specific dataset is confirmed, as some indicators may only be available as XLSX or HTML tables. | Founder / Data Lead | 2026-08-02 | Confirm Yes/Partial per specific dataset |
| MR-02: Partial/No risk noted | N/A | Expected Yes for most datasets | | | |
| MR-03: Fetch method documented | **Needs Review** | Likely: Web Data Service API (JSON) or dataset CSV download. Confirm for specific dataset. | | | Confirm fetch method after dataset is chosen |

---

## 8. Privacy / Personal Information Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| PRI-01: Personal information assessment | **Pass** | Statistics Canada open data products are aggregate statistical summaries — no individual-level personal information in publicly released datasets. Statistics Canada suppresses cells with small counts to protect individual privacy. | Founder / Data Lead | 2026-08-02 | |
| PRI-02: Public official personal information | **Pass** | N/A — Statistics Canada aggregate data does not include named officials. | Founder / Data Lead | 2026-08-02 | |
| PRI-03: Non-official personal information | **Pass** | Aggregate data only — no individual records, names, or identifiers. | Founder / Data Lead | 2026-08-02 | |
| PRI-04: Sensitive personal information | **Pass** | While Statistics Canada collects health, income, and ethnic demographic data, publicly released open data is presented as aggregate statistics — no sensitive personal information about identified individuals. | Founder / Data Lead | 2026-08-02 | Confirm for specific dataset chosen; some datasets may carry sensitivity notes |
| PRI-05: CV-REG-002 update required | **Pass — no update required** | Aggregate statistical data — not personal information within the meaning of PIPEDA. CV-REG-002 update not required. | Founder / Data Lead | 2026-08-02 | |

---

## 9. Public Official / High-Risk Data Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| HRD-01: High-risk flag | **Not flagged** | Aggregate statistical data — no named officials, salaries, lobbying records, or ethics findings. | Founder / Data Lead | 2026-08-02 | |
| HRD-02 through HRD-05 | **N/A** | Not applicable — source is not high-risk. | Founder / Data Lead | 2026-08-02 | |

---

## 10. Transformation Review

| Review Item | Status | Notes |
|---|---|---|
| TRF-01 through TRF-05 | **Needs Review** | Cannot assess until specific dataset(s) and display format are confirmed. |

---

## 11. App Display Review

| Review Item | Status | Notes |
|---|---|---|
| DSP-01 through DSP-06 | **Needs Review** | App display location, status label, freshness indicator, and /sources page entry are all TBD pending dataset confirmation. |

---

## 12. Firestore Mapping Review

| Review Item | Status | Notes |
|---|---|---|
| FS-01 through FS-04 | **Needs Review** | Firestore collection, schema, and access controls cannot be confirmed until specific dataset(s) and app display location are defined. |

---

## 13. Final Source Decision

| Field | Value |
|---|---|
| **Final decision** | **Pending Review** |
| **Decision rationale** | Licence confirmed (Statistics Canada Open Licence — Approved). Source owner confirmed. Attribution wording confirmed. Privacy risk confirmed low. However, the specific Statistics Canada dataset(s) and indicator(s) to be displayed have not been defined. Without this, source URL (dataset-level), relevance (ELG-06), reporting period, fetch method, transformation, and Firestore mapping cannot be confirmed. The source cannot advance to Approved until datasets are defined. |
| **CV-REG-001 Licence Status** | **Approved** — update CV-REG-001 SRC-FED-001 |
| **Remaining blockers before Approved for Public Display** | (1) Confirm specific datasets; (2) Confirm source URLs at dataset level; (3) Confirm reporting periods; (4) Confirm fetch method; (5) Confirm transformation; (6) Confirm app display location; (7) Confirm Firestore collection |
| **Manual review flag required** | No — pending dataset definition |
| **CV-REC-001 required before Firestore write** | Yes |

---

## 14. Open Issues

| # | Issue | Priority | Owner | Status | Target Date |
|---|---|---|---|---|---|
| 1 | **Define which specific Statistics Canada datasets/indicators will be displayed in the app** — this is the primary blocking issue for this record | Critical | Data Lead / Product Lead | Open | Before next review |
| 2 | Confirm dataset-level source URL(s) once datasets are defined | High | Data Lead | Open — depends on Issue 1 | |
| 3 | Confirm reporting period(s) once datasets are defined | High | Data Lead | Open — depends on Issue 1 | |
| 4 | Confirm fetch method (Web Data Service API vs CSV download) per dataset | High | Data Lead | Open — depends on Issue 1 | |
| 5 | Confirm machine-readability classification per dataset | Medium | Data Lead | Open — depends on Issue 1 | |
| 6 | Confirm app display location and section name | High | Product Lead | Open | |
| 7 | Confirm transformation approach (raw indicator vs derived) | Medium | Data Lead | Open — depends on Issue 1 | |
| 8 | Confirm Firestore collection and schema | High | Technical Lead | Open | |
| 9 | Confirm attribution includes correct dataset name (once dataset confirmed) | Medium | Data Lead | Open — depends on Issue 1 | |

**Issues resolved in this review:**
- ~~Confirm Statistics Canada Open Licence applies and permits reuse~~ — **Resolved 2026-08-02**: Confirmed. Licence Approved.
- ~~Draft attribution wording~~ — **Resolved 2026-08-02**: Wording confirmed in Section 5.
- ~~Confirm source owner~~ — **Resolved 2026-08-02**: Statistics Canada confirmed.
- ~~Confirm aggregate data — no individual-level personal information~~ — **Resolved 2026-08-02**: Confirmed. No CV-REG-002 update required.

---

## 15. Approval

| Role | Name | Date | Decision |
|---|---|---|---|
| Primary Reviewer | Founder / Data Lead | 2026-08-02 | Pending Review — licence confirmed; dataset(s) not yet defined |
| Data Lead sign-off | TBD | TBD | Pending |

---

## Change Log

| Version | Date | Author | Change |
|---|---|---|---|
| 0.1 | 2026-08-02 | Founder / Data Lead | Initial draft — all items Needs Review; Pending Review decision |
| 0.2 | 2026-08-02 | Founder / Data Lead | Step 23 review: Statistics Canada Open Licence confirmed Approved; source owner confirmed; attribution wording confirmed; privacy confirmed low-risk; ELG-01/02/03/05, LIC-01–07, ATT-01/02/04, PRI-01–05, HRD-01 marked Pass. Source ID corrected from SRC-001 to SRC-FED-001. Final decision remains Pending Review — specific dataset(s) not yet defined. |
