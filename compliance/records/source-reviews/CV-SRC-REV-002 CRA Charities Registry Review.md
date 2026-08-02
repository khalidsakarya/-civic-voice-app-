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
| **Review Date** | 2026-08-02 |
| **Related Documents** | CV-REG-001 Data Source Register · CV-CHK-005 Canadian Source Review Checklist · CV-SOP-001 Data Verification SOP · CV-POL-002 Data Sources and Attribution Policy |

---

> ℹ️ **DRAFT — PUBLIC REGISTRY — USE WITH ATTRIBUTION**
>
> **Source owner confirmed (CRA / Government of Canada). Licence confirmed (OGL-Canada 2.0 for open.canada.ca dataset). Attribution confirmed.**
>
> This source is a **statutory public registry** — the Registered Charities database
> is maintained under the *Income Tax Act* and is authoritative for Canadian registered
> charity status. It is suitable for display with attribution and appropriate status labels.
>
> **Remaining limitations before Firestore write or public display:**
> - Exact open.canada.ca dataset URL / dataset ID to be confirmed at data fetch
> - Specific reporting period / T3010 filing year to be confirmed
> - Fetched date: not yet fetched
> - Whether director names will be displayed: assess privacy before including
> - Transformation approach: TBD
> - App display location: TBD
> - Firestore collection: TBD
>
> **Display rule:** Display only factual registered status, registration number, charity
> name, and category. Do not display director names without a separate privacy assessment.
> Do not editorialize about charity effectiveness, spending ratios, or ratings.

---

## 1. Purpose

This record documents the source review for the Canada Revenue Agency Registered
Charities database. The CRA Registered Charities database is a statutory public
register of all charities registered under the *Income Tax Act*. It includes registration
numbers, names, categories, charitable purpose categories, and T3010 annual return data
(revenues, expenditures, assets, directors).

---

## 2. Source Identification

| Field | Value |
|---|---|
| **Source owner / publisher** | Canada Revenue Agency (Government of Canada) |
| **Source URL — web search** | https://apps.cra-arc.gc.ca/ebci/hacc/srch/pub/dsplyBscSrch |
| **Source URL — open data (preferred)** | https://open.canada.ca — search "registered charities" to confirm exact dataset ID and URL |
| **Source format** | CSV (open.canada.ca open data — preferred); HTML search interface (web only — Partial) |
| **Data type** | Registered charity name, BN/registration number, status (registered / revoked / annulled), category, fiscal year-end, T3010 financial summaries, directors (if in scope) |
| **Reporting period** | TBD — confirm most recent T3010 filing year available at time of data fetch (filings are processed on lag; not all charities file for the current year) |
| **Fetched date** | Not yet fetched |
| **Licence / terms reference** | OGL-Canada 2.0 for open.canada.ca dataset — https://open.canada.ca/en/open-government-licence-canada. CRA web search interface: CRA web terms — confirm separately if web interface is used. |
| **Review trigger** | Pre-launch review (Step 24) |

---

## 3. Source Eligibility Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| ELG-01: Source is an approved type | **Pass** | CRA Registered Charities database is a statutory public registry under the *Income Tax Act*. open.canada.ca is the official Government of Canada open-data portal. Approved types under CV-POL-002 §3. | Founder / Data Lead | 2026-08-02 | |
| ELG-02: Source is not a prohibited type | **Pass** | Official federal statutory registry — not a news site, Wikipedia, or unofficial aggregator. | Founder / Data Lead | 2026-08-02 | |
| ELG-03: Source owner identified | **Pass** | Canada Revenue Agency (Government of Canada) — confirmed. | Founder / Data Lead | 2026-08-02 | |
| ELG-04: Source URL recorded | **Partial** | Web search URL confirmed. open.canada.ca dataset URL confirmed at portal level; exact dataset ID to be confirmed at data fetch. | Founder / Data Lead | 2026-08-02 | Confirm exact dataset ID on open.canada.ca |
| ELG-05: Source publicly accessible | **Pass** | CRA charity search and open.canada.ca datasets are publicly accessible without login or paywall. | Founder / Data Lead | 2026-08-02 | |
| ELG-06: Data relevant to civic purpose | **Pass** | Registered charity status and accountability data is civic accountability information — informs users about whether an organisation is a registered charity in good standing. | Founder / Data Lead | 2026-08-02 | Limit display to status, registration number, name, and category; do not add editorial ratings |

---

## 4. Licence / Terms Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| LIC-01: Licence identified | **Pass** | OGL-Canada 2.0 for open.canada.ca registered charities dataset — https://open.canada.ca/en/open-government-licence-canada. If CRA web search interface is used instead, CRA web terms apply — confirm separately. | Founder / Data Lead | 2026-08-02 | Preferred path: open.canada.ca CSV (OGL-Canada 2.0) |
| LIC-02: Licence permits reuse | **Pass** | OGL-Canada 2.0 permits reproduction, modification, distribution for any lawful purpose. | Founder / Data Lead | 2026-08-02 | |
| LIC-03: Attribution required | **Pass** | OGL-Canada 2.0 requires: "Contains information licensed under the Open Government Licence – Canada." | Founder / Data Lead | 2026-08-02 | See Section 5 for confirmed wording |
| LIC-04: No prohibited uses | **Pass** | No prohibited uses for displaying factual registered status and charity names. Do not use as a source for charity effectiveness ratings or donation recommendations. | Founder / Data Lead | 2026-08-02 | |
| LIC-05: Licence Status | **Approved (open.canada.ca path)** | OGL-Canada 2.0 confirmed for open.canada.ca dataset. If CRA web interface is used, reassess. | Founder / Data Lead | 2026-08-02 | Update CV-REG-001 SRC-FED-002 to Approved |
| LIC-06: Licence version | **Pass** | OGL-Canada 2.0. | Founder / Data Lead | 2026-08-02 | |
| LIC-07: Terms change monitoring | **Pass** | Monitor open.canada.ca/en/open-government-licence-canada at each update cycle per CV-SOP-002. | Founder / Data Lead | 2026-08-02 | |

---

## 5. Attribution Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| ATT-01: Attribution wording confirmed | **Pass** | **Confirmed wording:** "Source: Canada Revenue Agency — Registered Charities database, Government of Canada (open.canada.ca). Contains information licensed under the Open Government Licence – Canada. Data reflects T3010 filings for [fiscal year]. Fetched [date]." | Founder / Data Lead | 2026-08-02 | Fill in fiscal year and fetch date at first fetch |
| ATT-02: Attribution recorded in CV-REG-001 | **Pass** | Attribution wording recorded in CV-REG-001 SRC-FED-002 Notes. | Founder / Data Lead | 2026-08-02 | |
| ATT-03: Attribution placement in UI | **Needs Review** | App display location TBD. | | | |
| ATT-04: Attribution consistent with licence | **Pass** | Wording meets OGL-Canada 2.0 requirement. | Founder / Data Lead | 2026-08-02 | |

---

## 6. Reporting Period Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| RPT-01: Reporting period identified | **Needs Review** | T3010 filings are submitted annually by registered charities within 6 months of their fiscal year-end. Data on open.canada.ca reflects filings processed by CRA as of the dataset's last update. Specific year to be confirmed at data fetch. | | | Note: not all charities file for the same year; dataset is a rolling register |
| RPT-02: Reporting period accurate | **Needs Review** | Confirm dataset metadata at fetch time. | | | |
| RPT-03: Source update frequency known | **Pass** | open.canada.ca registered charities dataset is updated periodically by CRA as filings are processed. Confirm update cadence at first fetch. | Founder / Data Lead | 2026-08-02 | |
| RPT-04: App update frequency defined | **Needs Review** | TBD — recommend annual or semi-annual refresh given filing lag. | | | |
| RPT-05: Staleness risk noted | **Pass** | Display "Data current as of [fetched date]. T3010 filings reflect prior fiscal year." to manage user expectations around update lag. | Founder / Data Lead | 2026-08-02 | |

---

## 7. Machine-Readability Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| MR-01: Machine-readability classified | **Yes (open.canada.ca CSV path) / Partial (CRA web search)** | open.canada.ca registered charities dataset: downloadable CSV — machine-readable (Yes). CRA web search interface (apps.cra-arc.gc.ca): HTML interface — machine-readable (Partial; HTML scraping only). Recommended path: open.canada.ca CSV. | Founder / Data Lead | 2026-08-02 | |
| MR-02: Partial path risk | **Pass** | If CRA web interface is used: HTML scraping may be prohibited by CRA terms — confirm before use. | Founder / Data Lead | 2026-08-02 | |
| MR-03: Fetch method | **Partial** | Recommended: CSV download from open.canada.ca registered charities dataset. Confirm exact dataset ID and URL. | Founder / Data Lead | 2026-08-02 | Confirm at data fetch time |

---

## 8. Privacy / Personal Information Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| PRI-01: Personal information assessment | **Partial** | Registered charity names and financial summaries: not personal information (organisations). Director names in T3010 filings: **personal information** about individuals. Assess separately before including director names in any display. | Founder / Data Lead | 2026-08-02 | Director name use requires separate privacy assessment |
| PRI-02: Public official personal information | **Pass** | N/A — charity directors are not elected officials. | Founder / Data Lead | 2026-08-02 | |
| PRI-03: Non-official personal information | **Partial** | Director names are personal information about private individuals (not public figures). If director names are to be displayed, confirm: (a) they appear in the official T3010 public filing; (b) display is limited to name and title in charity governance role only; (c) no home addresses or personal contact details. | Founder / Data Lead | 2026-08-02 | Do not display director names without completing this assessment |
| PRI-04: Sensitive personal information | **Pass** | No sensitive personal information in charity name, registration number, status, and financial summary fields. | Founder / Data Lead | 2026-08-02 | |
| PRI-05: CV-REG-002 update required | **Needs Review** | If director names are displayed: update CV-REG-002. If only organisation-level data is displayed: not required. | | | Determine based on app display scope |

---

## 9. Public Official / High-Risk Data Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| HRD-01: High-risk flag | **Low-risk (organisation data) / Medium-risk (if director names displayed)** | Organisation registration data is low-risk. If charity status (revoked/annulled) is displayed prominently, ensure it is factual and sourced directly from CRA. Director names: medium-risk if displayed. | Founder / Data Lead | 2026-08-02 | |
| HRD-02: Second reviewer required | **No — unless director names are displayed** | Second review not required for organisation-level charity status data. Required if director names are displayed alongside revocation or misconduct findings. | Founder / Data Lead | 2026-08-02 | |
| HRD-03: Official source confirmed | **Pass** | CRA Registered Charities database is the official statutory source — confirmed. | Founder / Data Lead | 2026-08-02 | |
| HRD-04: Accuracy spot-check | **Needs Review** | At first data fetch, spot-check 3–5 charity records against the CRA web search (apps.cra-arc.gc.ca) to confirm CSV accuracy. | | | |
| HRD-05: Disclaimer placement | **Needs Review** | Short disclaimer on charity data pages: "Charity registration status and financial data from the Canada Revenue Agency. Civic Voice Canada does not provide charity effectiveness ratings or donation recommendations." | | | |

---

## 10. Transformation Review

| Review Item | Status | Notes |
|---|---|---|
| TRF-01 through TRF-05 | **Needs Review** | Transformation approach (filtering by province/category, financial summary display) not yet defined. Note: do not calculate or display derived ratios (e.g., "program spending ratio") without confirming methodology — misleading ratios are a known risk with charity financial data. |

---

## 11. App Display Review

| Review Item | Status | Notes |
|---|---|---|
| DSP-01 through DSP-06 | **Needs Review** | App display location TBD. Must not display editorial ratings, effectiveness scores, or donation recommendations alongside CRA data. |

---

## 12. Firestore Mapping Review

| Review Item | Status | Notes |
|---|---|---|
| FS-01 through FS-04 | **Needs Review** | TBD pending app display design. |

---

## 13. Final Source Decision

| Field | Value |
|---|---|
| **Final decision** | **Public Registry — Use with Attribution** |
| **Decision rationale** | CRA Registered Charities database is a statutory public registry under the *Income Tax Act*. Source owner confirmed (CRA). Licence confirmed (OGL-Canada 2.0 for open.canada.ca path — Approved). Attribution wording confirmed. Machine-readability: Yes for open.canada.ca CSV. This source is suitable for display with attribution, appropriate status labels ("data from CRA Registered Charities"), and the display rules below. **Display rules:** (1) Display only factual registered status, registration number, name, and category. (2) Do not display director names without a separate privacy assessment. (3) Do not add charity effectiveness ratings, spending ratios, or donation recommendations. (4) Display fetched date and T3010 fiscal year clearly. **Remaining limitations:** exact dataset URL, reporting period, director name scope, transformation, app display location, and Firestore collection all TBD. |
| **CV-REG-001 Licence Status** | **Approved** — update CV-REG-001 SRC-FED-002 |
| **Second review required** | No (unless director names are displayed) |
| **CV-REC-001 required before Firestore write** | Yes |

---

## 14. Open Issues

| # | Issue | Priority | Owner | Status | Target Date |
|---|---|---|---|---|---|
| 1 | Confirm exact dataset ID and URL for registered charities on open.canada.ca | High | Data Lead | Open | Before data fetch |
| 2 | Confirm whether T3010 director names are in scope for display — if yes, complete privacy assessment | High | Privacy Lead | Open | Before app design |
| 3 | Confirm most recent T3010 filing year available in dataset at time of fetch | High | Data Lead | Open | At first fetch |
| 4 | Confirm dataset column structure and identify display fields | High | Data Lead | Open | Before Firestore design |
| 5 | Define transformation approach — no derived ratios without confirmed methodology | High | Data Lead | Open | Before app design |
| 6 | Spot-check 3–5 charity records against CRA web search at first fetch | High | Data Lead | Open | At first fetch |
| 7 | Confirm app display location and disclaimer placement | High | Product Lead | Open | |
| 8 | Confirm Firestore collection name and schema | High | Technical Lead | Open | |
| 9 | Complete CV-REC-001 at first data fetch | High | Data Lead | Open | At first fetch |
| 10 | If director names are displayed: update CV-REG-002; require second reviewer | Medium | Privacy Lead | Open | Conditional |

**Issues resolved in this review:**
- ~~Confirm source owner~~ — **Resolved 2026-08-02**: Canada Revenue Agency confirmed.
- ~~Confirm source URL~~ — **Resolved 2026-08-02**: Web search and open.canada.ca portal confirmed; exact dataset ID TBD.
- ~~Confirm licence~~ — **Resolved 2026-08-02**: OGL-Canada 2.0 (open.canada.ca path) Approved.
- ~~Draft attribution wording~~ — **Resolved 2026-08-02**: Confirmed in Section 5.
- ~~Confirm machine-readability~~ — **Resolved 2026-08-02**: Yes (open.canada.ca CSV).
- ~~Confirm public registry eligibility~~ — **Resolved 2026-08-02**: Statutory public registry under Income Tax Act.

---

## 15. Approval

| Role | Name | Date | Decision |
|---|---|---|---|
| Primary Reviewer | Founder / Data Lead | 2026-08-02 | Public Registry — Use with Attribution |
| Data Lead sign-off | TBD | TBD | Pending — required before Firestore write |

---

## Change Log

| Version | Date | Author | Change |
|---|---|---|---|
| 0.1 | 2026-08-02 | Founder / Data Lead | Initial draft — all items Needs Review; Pending Review decision |
| 0.2 | 2026-08-02 | Founder / Data Lead | Step 24 review: source owner, URLs, OGL-Canada 2.0 licence, attribution, machine-readability, public registry eligibility confirmed. Privacy assessment for director names flagged as conditional open issue. Final decision: Public Registry — Use with Attribution. |
