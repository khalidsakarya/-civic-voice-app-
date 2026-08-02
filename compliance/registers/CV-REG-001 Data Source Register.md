# CV-REG-001 — Data Source Register

| Field | Value |
|---|---|
| **Document ID** | CV-REG-001 |
| **Version** | 0.1 |
| **Status** | Draft |
| **Owner** | Founder / Data Lead |
| **Effective Date** | TBD — pending review |
| **Scope** | Civic Voice Canada only |
| **Related Documents** | CV-POL-002 Data Sources and Attribution Policy · CV-SOP-001 Data Verification SOP · CV-SOP-002 Monthly Data Update SOP |
| **Review Frequency** | Monthly; or when any source is added, changed, removed, or its licence status changes |

---

> ⚠️ **DRAFT — NOT YET IN EFFECT**
>
> This register is a working draft. Source entries are placeholders pending confirmation
> of exact URLs, reporting periods, Firestore collections, and display locations. All
> entries must be reviewed and verified against the live app before public launch.

---

## Purpose

This register is the master list of every official, public-sector, public registry,
open-government, PDF, CSV, API, website, or dataset source used by Civic Voice Canada
to display factual data.

---

## Core Rule

> **No factual number, public official profile, grant record, charity record, budget
> figure, salary figure, disclosure record, lobbying record, campaign finance record,
> or chart shall be displayed in Civic Voice Canada unless it has a documented entry
> in this register with a confirmed source URL, source owner, reporting period,
> licence/terms status, and fetched date — or is clearly marked as
> `Pending official source review` in the app UI.**
>
> This rule applies regardless of how the data was obtained, formatted, or presented.
> See CV-POL-002 for the full source eligibility and attribution policy.

---

## Definitions

### Licence Status

| Value | Meaning |
|---|---|
| **Approved** | Licence or terms of use reviewed and confirmed to permit display, transformation, and attribution as described. Compliance with attribution requirements documented. |
| **Review Required** | Licence or terms not yet fully reviewed. Source must not be used for public display until status is changed to Approved. |
| **Not Approved** | Licence or terms do not permit the intended use, or source is on the prohibited list in CV-POL-002 §4. Must not be used. |
| **Public Registry** | Source is a statutory public registry (e.g., CRA Charities Listings, Elections Canada). Use governed by public registry terms; confirm attribution requirement. |
| **Manual Review Only** | Source is available but requires manual download, human review, or PDF extraction. Cannot be automated; Data Lead must review each fetch cycle. |

### Verification Status

| Value | Meaning |
|---|---|
| **Verified** | Data extracted from this source has been spot-checked against the source and confirmed accurate for the current reporting period. |
| **Needs Review** | Source entry exists but has not been verified in the current cycle, or the source has been updated since the last verification. |
| **Blocked** | Source is online but blocks automated access (CAPTCHA, login wall, PDF-only, no API). Manual Review Only status applies. |
| **Deprecated** | Source has been replaced by a newer source or the data is no longer published. See Notes for replacement. |
| **Unavailable** | Source URL is unreachable or the dataset has been removed. `Source unavailable` label applied in app. |
| **Partial** | Source is accessible but the dataset is incomplete, covers only some of the expected records, or has known gaps. |

### Machine Readable

| Value | Meaning |
|---|---|
| **Yes** | Data is available via API, structured CSV, XLSX, or JSON that can be parsed without manual intervention. |
| **Partial** | Data is partially machine-readable (e.g., CSV with inconsistent formatting, HTML table requiring scraping, mixed PDF and data). |
| **No** | Data is available only as a PDF, scanned document, or web page with no structured data extract. Manual extraction required. |

---

## Register Table

> **How to read this table:**
> Each row is one data source. A single source may supply data for multiple app sections;
> use the Display Location and Firestore Collection columns to track where its data appears.
> Add a new row when a source is added. Update the row when a URL, licence, reporting period,
> or verification status changes. Do not delete rows — mark deprecated sources as Deprecated
> and add a Notes entry referencing the replacement.

---

### Federal Sources

| Field | SRC-FED-001 | SRC-FED-002 | SRC-FED-003 | SRC-FED-004 | SRC-FED-005 | SRC-FED-006 | SRC-FED-007 |
|---|---|---|---|---|---|---|---|
| **Source ID** | SRC-FED-001 | SRC-FED-002 | SRC-FED-003 | SRC-FED-004 | SRC-FED-005 | SRC-FED-006 | SRC-FED-007 |
| **Jurisdiction** | Federal | Federal | Federal | Federal | Federal | Federal | Federal |
| **Level** | Federal | Federal | Federal | Federal | Federal | Federal | Federal |
| **Data Category** | Economic / Statistical Indicators | Charity / Non-Profit Registry | Federal Budget | Public Accounts | Lobbying Registry | Elections / Campaign Finance | Conflict of Interest / Ethics |
| **Source Name** | Statistics Canada Key Indicators | CRA Charities Listings | Government of Canada Federal Budget | Public Accounts of Canada | Office of the Commissioner of Lobbying — Registry of Lobbyists | Elections Canada — Electoral Results and Campaign Finance | Office of the Conflict of Interest and Ethics Commissioner |
| **Source Owner** | Statistics Canada | Canada Revenue Agency (CRA) | Department of Finance Canada | Office of the Comptroller General | Office of the Commissioner of Lobbying of Canada | Elections Canada | Office of the Conflict of Interest and Ethics Commissioner |
| **Source URL** | Main: https://www.statcan.gc.ca · Open data: https://www150.statcan.gc.ca/n1/en/type/data · API: https://www.statcan.gc.ca/en/developers/wds · **Specific dataset URL: TBD — confirm which indicators are in scope** | [apps.cra-arc.gc.ca/ebci/hacc/srch/pub/dsplyBscSrch](https://apps.cra-arc.gc.ca/ebci/hacc/srch/pub/dsplyBscSrch) / open.canada.ca T3010 dataset | Budget page: https://www.canada.ca/en/department-finance/services/publications/federal-budget.html · Fiscal Reference Tables (XLSX): https://www.canada.ca/en/department-finance/services/publications/fiscal-reference-tables.html · Open data: https://open.canada.ca/data/en/organization/fin | TBS Public Accounts: https://www.canada.ca/en/treasury-board-secretariat/services/reporting-government-spending/public-accounts-canada.html · Proactive disclosure (grants/contributions CSV): https://open.canada.ca — **confirm exact dataset ID** | [lobbycanada.gc.ca](https://lobbycanada.gc.ca) | [elections.ca](https://www.elections.ca) | [ciec-ccie.gc.ca](https://www.ciec-ccie.gc.ca) |
| **Licence / Terms** | Statistics Canada Open Licence — https://www.statcan.gc.ca/en/reference/licence | OGL-Canada 2.0 (open.canada.ca dataset) / CRA public registry terms | OGL-Canada 2.0 — https://open.canada.ca/en/open-government-licence-canada | OGL-Canada 2.0 — https://open.canada.ca/en/open-government-licence-canada | Public registry — confirm terms | Public registry — OGL-Canada 2.0 for open data files | Public registry — confirm terms |
| **Licence Status** | **Approved** (Statistics Canada Open Licence confirmed — CV-SRC-REV-001 v0.2) | Review Required | **Approved** (OGL-Canada 2.0 confirmed — CV-SRC-REV-003 v0.2) | **Approved** (OGL-Canada 2.0 confirmed — CV-SRC-REV-004 v0.2) | Review Required | Review Required | Review Required |
| **Reporting Period** | TBD — varies by indicator | Most recent T3010 filing year available | TBD — confirm budget year (e.g., FY 2024–25) | TBD — most recent Public Accounts year | TBD — rolling / current Parliament | TBD — 45th General Election + historical | TBD — most recent disclosure year |
| **Update Frequency** | Varies — monthly / quarterly / annual by indicator | Annual (T3010 filings published on lag) | Annual (budget day) | Annual (fall tabling) | Continuous (lobbyist registration updates) | Post-election; periodic for campaign finance | Annual / on disclosure |
| **App Update Frequency** | TBD | TBD | Annual | Annual | TBD — monthly check | Post-election; annual campaign finance | Annual |
| **Fetch Method** | Web Data Service API (JSON) or CSV download — **confirm per specific dataset** | TBD — open.canada.ca CSV download or CRA search | Recommended: XLSX download from Fiscal Reference Tables page. Fallback: PDF extraction. Confirm at first fetch. | Recommended: CSV download from open.canada.ca proactive disclosure grants/contributions dataset. Fallback: PDF Public Accounts volumes. | TBD — lobbycanada.gc.ca API or CSV download | TBD — elections.ca open data files | TBD — PDF / web |
| **Machine Readable?** | Yes for most public datasets (API/CSV) — **confirm per specific dataset** | Partial (open.canada.ca CSV; CRA search is HTML) | **Yes (Fiscal Reference Tables XLSX) / Partial (PDF budget)** — recommended path: XLSX | **Yes (proactive disclosure CSV on open.canada.ca) / Partial (Public Accounts PDF)** — recommended path: CSV | Yes (lobbycanada.gc.ca has search and CSV export) | Yes (elections.ca open data files) | No (PDF / web) |
| **Personal Information Risk** | Low — aggregate statistical data | Low — organisation records, not individuals | Low — aggregate | Low — aggregate | Medium — named lobbyists and registrants | Medium — named candidates; financial disclosures | High — named public officials; financial disclosures |
| **Public Figure / Official Data?** | No | No (organisations) | No | No | Yes — named registrants and lobbyists | Yes — named candidates | Yes — named public officials |
| **Transformation Performed** | TBD | TBD — grouping by province/category planned | TBD — departmental spending grouping planned | TBD — departmental grouping planned | TBD | TBD | TBD |
| **Display Location in App** | TBD — Economic Indicators section | TBD — Charities section | TBD — Federal Budget section | TBD — Public Accounts section | TBD — Lobbying section | TBD — Elections section | TBD — Ethics / Disclosures section |
| **Firestore Collection** | TBD | TBD | TBD | TBD | TBD | TBD | TBD |
| **Last Fetched Date** | Not yet fetched | Not yet fetched | Not yet fetched | Not yet fetched | Not yet fetched | Not yet fetched | Not yet fetched |
| **Last Verified Date** | Not yet verified | Not yet verified | Not yet verified | Not yet verified | Not yet verified | Not yet verified | Not yet verified |
| **Verification Status** | Needs Review | Needs Review | Needs Review | Needs Review | Needs Review | Needs Review | Needs Review |
| **Manual Review Flag Needed?** | TBD | TBD | Yes — PDF extraction may require manual review | Yes — PDF extraction may require manual review | TBD | TBD | Yes — PDF / manual extraction required |
| **Notes** | **Step 23 (2026-08-02):** Licence Approved (Statistics Canada Open Licence). Source owner confirmed. Attribution: "Source: Statistics Canada, [Dataset name], [reporting period]. Adapted from Statistics Canada under the Statistics Canada Open Licence." **Blocking:** Specific dataset(s)/indicators not yet defined — source URL at dataset level, reporting period, and fetch method are TBD. See CV-SRC-REV-001 v0.2. | T3010 open data on open.canada.ca is preferred over CRA HTML search. Confirm dataset ID. Charity status (active/revoked) is high-risk — see CV-SOP-001 §11. | **Step 23 (2026-08-02):** Licence Approved (OGL-Canada 2.0). Source URLs confirmed. Preferred path: Fiscal Reference Tables XLSX. Attribution: "Source: Department of Finance Canada — Federal Budget [year], Government of Canada. Contains information licensed under the Open Government Licence – Canada. Fetched [date]." Reporting year and fetch date TBD. See CV-SRC-REV-003 v0.2. | **Step 23 (2026-08-02):** Licence Approved (OGL-Canada 2.0). Source URLs confirmed. Preferred path: proactive disclosure grants/contributions CSV on open.canada.ca (confirm dataset ID). Attribution: "Source: Receiver General for Canada — Public Accounts of Canada [fiscal year], Government of Canada. Contains information licensed under the Open Government Licence – Canada. Fetched [date]." Reporting year and fetch date TBD. See CV-SRC-REV-004 v0.2. | Confirm whether lobbycanada.gc.ca offers a bulk export or API. Named lobbyist data is high-risk — second review required per CV-SOP-001 §10. | Elections Canada open data portal provides structured files. Confirm most recent election dataset URL after 45th General Election. | Named public official financial disclosure data. Manual review only. High-risk — second review required per CV-SOP-001 §10. |

---

### Ontario Sources

| Field | SRC-ONT-001 | SRC-ONT-002 | SRC-ONT-003 | SRC-ONT-004 |
|---|---|---|---|---|
| **Source ID** | SRC-ONT-001 | SRC-ONT-002 | SRC-ONT-003 | SRC-ONT-004 |
| **Jurisdiction** | Ontario | Ontario | Ontario | Ontario |
| **Level** | Provincial | Provincial | Provincial | Provincial |
| **Data Category** | Provincial Budget | Public Accounts / Grants and Contributions | Public Sector Salary Disclosure (Sunshine List) | Conflict of Interest / Ethics |
| **Source Name** | Ontario Budget | Ontario Public Accounts and Grants / Transfer Payments | Ontario Public Sector Salary Disclosure | Ontario Integrity Commissioner |
| **Source Owner** | Ontario Ministry of Finance | Treasury Board Secretariat of Ontario | Treasury Board Secretariat of Ontario | Office of the Integrity Commissioner of Ontario |
| **Source URL** | Budget page: https://www.ontario.ca/page/ontario-budget · Open data: https://data.ontario.ca — **confirm specific dataset URL** | Public Accounts: https://www.ontario.ca/page/public-accounts · Transfer payments CSV: https://data.ontario.ca — **confirm specific dataset URL** | [ontario.ca/page/public-sector-salary-disclosure](https://www.ontario.ca/page/public-sector-salary-disclosure) | [oico.on.ca](https://www.oico.on.ca) |
| **Licence / Terms** | Open Government Licence – Ontario — https://www.ontario.ca/page/open-government-licence-ontario | Open Government Licence – Ontario — https://www.ontario.ca/page/open-government-licence-ontario | Open Government Licence – Ontario — TBD confirm | Public registry — TBD confirm terms |
| **Licence Status** | **Approved** (OGL-Ontario confirmed — CV-SRC-REV-008 v0.2) | **Approved** (OGL-Ontario confirmed — CV-SRC-REV-009 v0.2) | Review Required | Review Required |
| **Reporting Period** | TBD — most recent Ontario budget year | TBD — most recent Public Accounts year | TBD — most recent disclosure year (typically prior calendar year, published March) | TBD — most recent disclosure year |
| **Update Frequency** | Annual (budget day) | Annual (fall) | Annual (March) | Annual / on disclosure |
| **App Update Frequency** | Annual | Annual | Annual | Annual |
| **Fetch Method** | Recommended: data.ontario.ca CSV/XLSX download (confirm availability for applicable year). Fallback: PDF from ontario.ca/page/ontario-budget. | Recommended: CSV download from data.ontario.ca transfer payments dataset. Fallback: PDF Public Accounts volumes. | TBD — CSV / XLSX download from ontario.ca or data.ontario.ca | TBD — PDF / web |
| **Machine Readable?** | **Yes (data.ontario.ca path if available) / Partial (PDF path)** — confirm data.ontario.ca availability for applicable year | **Yes (data.ontario.ca transfer payments CSV)** | Yes (CSV/XLSX available from ontario.ca) | No (PDF / web) |
| **Personal Information Risk** | Low — aggregate | Low — aggregate (grants to organisations) | High — named individuals; salary amounts | High — named public officials; financial disclosures |
| **Public Figure / Official Data?** | No | No (organisations) | Yes — named public-sector employees | Yes — named public officials |
| **Transformation Performed** | TBD | TBD — grouping by ministry/category planned | TBD — employer / salary band grouping planned | TBD |
| **Display Location in App** | TBD — Ontario Budget section | TBD — Ontario Spending / Grants section | TBD — Ontario Salary Disclosure section | TBD — Ontario Ethics / Disclosures section |
| **Firestore Collection** | TBD | TBD | TBD | TBD |
| **Last Fetched Date** | Not yet fetched | Not yet fetched | Not yet fetched | Not yet fetched |
| **Last Verified Date** | Not yet verified | Not yet verified | Not yet verified | Not yet verified |
| **Verification Status** | Needs Review | Needs Review | Needs Review | Needs Review |
| **Manual Review Flag Needed?** | Yes — PDF extraction may require manual review | TBD | TBD — CSV availability reduces manual review need | Yes — PDF / manual extraction required |
| **Notes** | **Step 23 (2026-08-02):** Licence Approved (OGL-Ontario). Source URLs confirmed: ontario.ca/page/ontario-budget and data.ontario.ca. Preferred path: data.ontario.ca CSV/XLSX if available for applicable year; fallback: PDF. Attribution: "Source: Ontario Ministry of Finance — Ontario Budget [year], Government of Ontario. Contains information licensed under the Open Government Licence – Ontario. Fetched [date]." Confirm data.ontario.ca availability for applicable budget year. Reporting year and fetch date TBD. See CV-SRC-REV-008 v0.2. | **Step 23 (2026-08-02):** Licence Approved (OGL-Ontario). Source URLs confirmed: ontario.ca/page/public-accounts and data.ontario.ca. Preferred path: data.ontario.ca transfer payments CSV (machine-readable: Yes). Attribution: "Source: Government of Ontario — Transfer Payments and Grants [fiscal year], data.ontario.ca. Contains information licensed under the Open Government Licence – Ontario. Fetched [date]." Confirm exact dataset URL on data.ontario.ca. Reporting year and fetch date TBD. See CV-SRC-REV-009 v0.2. | The Sunshine List is high-risk — named individuals with salary data. Second review required per CV-SOP-001 §10. Confirm exact CSV URL and column structure. | Named public official financial disclosure data. Manual review only. High-risk — second review required. |

---

## Attribution Statements

The following attribution statements are the approved formats for sources in this
register, consistent with CV-POL-002 Section 6.2. Update the reporting period and
fetched date for each cycle.

**Statistics Canada:** *(Licence: Approved — Statistics Canada Open Licence)*
> "Source: Statistics Canada, [Dataset name], [reporting period]. Adapted from Statistics Canada under the Statistics Canada Open Licence. Fetched [date]."

**CRA Charities:**
> "Source: Canada Revenue Agency Charities Listings (open.canada.ca), [fiscal year],
> fetched [date]. Contains information licensed under the Open Government Licence –
> Canada (OGL-Canada 2.0)."

**Federal Budget:** *(Licence: Approved — OGL-Canada 2.0)*
> "Source: Department of Finance Canada — Federal Budget [year], Government of Canada. Contains information licensed under the Open Government Licence – Canada. Fetched [date]."

**Public Accounts of Canada:** *(Licence: Approved — OGL-Canada 2.0)*
> "Source: Receiver General for Canada — Public Accounts of Canada [fiscal year], Government of Canada. Contains information licensed under the Open Government Licence – Canada. Fetched [date]."
>
> *Proactive disclosure path:* "Source: Government of Canada — Proactive Disclosure: Grants and Contributions [fiscal year], open.canada.ca. Contains information licensed under the Open Government Licence – Canada. Fetched [date]."

**Lobbying Registry:**
> "Source: Office of the Commissioner of Lobbying of Canada (lobbycanada.gc.ca),
> [reporting period], fetched [date]."

**Elections Canada:**
> "Source: Elections Canada (elections.ca), [election / reporting period], fetched
> [date]. Contains information licensed under the Open Government Licence – Canada."

**Conflict of Interest and Ethics Commissioner:**
> "Source: Office of the Conflict of Interest and Ethics Commissioner (ciec-ccie.gc.ca),
> [disclosure year], fetched [date]."

**Ontario Budget:** *(Licence: Approved — OGL-Ontario)*
> "Source: Ontario Ministry of Finance — Ontario Budget [year], Government of Ontario. Contains information licensed under the Open Government Licence – Ontario. Fetched [date]."

**Ontario Public Accounts / Transfer Payments:** *(Licence: Approved — OGL-Ontario)*
> "Source: Government of Ontario — Transfer Payments and Grants [fiscal year], data.ontario.ca. Contains information licensed under the Open Government Licence – Ontario. Fetched [date]."

**Ontario Sunshine List:**
> "Source: Ontario Public Sector Salary Disclosure (ontario.ca), [year], fetched [date].
> Contains information licensed under the Open Government Licence – Ontario."

**Ontario Integrity Commissioner:**
> "Source: Office of the Integrity Commissioner of Ontario (oico.on.ca), [year],
> fetched [date]."

---

## How to Add a New Source

1. Assign the next sequential Source ID in the applicable jurisdiction block
   (e.g., SRC-FED-008, SRC-ONT-005, SRC-BC-001).
2. Complete all fields in the register table. Use `TBD` only for fields that are
   genuinely unknown at the time of entry — resolve TBDs before data from the source
   is displayed in the app.
3. Set Licence Status to `Review Required` until the licence has been confirmed by the
   Data Lead per CV-POL-002 Section 7.
4. Set Verification Status to `Needs Review` until data has been spot-checked per
   CV-SOP-001 Section 7.
5. Do not set Verification Status to `Verified` until at least 3–5 key values have been
   spot-checked against the source.
6. Update this register's Change Log below.
7. Notify the Compliance Lead that a new source has been added.

---

## Related Documents

| Document | Status |
|---|---|
| [CV-POL-002 Data Sources and Attribution Policy](../policies/CV-POL-002%20Data%20Sources%20and%20Attribution%20Policy.md) | Draft |
| [CV-SOP-001 Data Verification SOP](../procedures/CV-SOP-001%20Data%20Verification%20SOP.md) | Draft |
| [CV-SOP-002 Monthly Data Update SOP](../procedures/CV-SOP-002%20Monthly%20Data%20Update%20SOP.md) | Draft |
| [CV-POL-004 Public Disclaimer and Non-Affiliation Statement](../policies/CV-POL-004%20Public%20Disclaimer%20and%20Non-Affiliation%20Statement.md) | Draft |
| [CV-IDX-001 Canadian Compliance Package Index](../CV-IDX-001%20Canadian%20Compliance%20Package%20Index.md) | Draft |

---

> **Final Note:** This register is a draft. All TBD fields must be resolved before the
> corresponding data is displayed in the app. Sources with Licence Status of "Review
> Required" must not be used for public display until the licence is confirmed and the
> status is updated to "Approved" or "Public Registry". Named individual data (salary,
> lobbying, ethics disclosures) is high-risk and requires a second review per CV-SOP-001
> Section 15 before publication.

---

## Change Log

| Version | Date | Author | Change |
|---|---|---|---|
| 0.1 | 2026-07-26 | Founder / Data Lead | Initial draft — 11 placeholder source entries across federal and Ontario scope |
| 0.2 | 2026-08-02 | Founder / Data Lead | Step 23 Source Approval Batch 1: Licence Status updated to Approved for SRC-FED-001 (Statistics Canada Open Licence), SRC-FED-003 (OGL-Canada 2.0), SRC-FED-004 (OGL-Canada 2.0), SRC-ONT-001 (OGL-Ontario), SRC-ONT-002 (OGL-Ontario). Source URLs confirmed for these five sources. Preferred fetch method (XLSX/CSV paths) documented. Attribution statements updated with confirmed wording. Machine-readability updated. SRC-FED-002, 005, 006, 007 and SRC-ONT-003, 004 remain at Review Required. |
