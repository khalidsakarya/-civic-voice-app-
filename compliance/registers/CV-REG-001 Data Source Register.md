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
| **Source URL** | [statcan.gc.ca](https://www.statcan.gc.ca) — TBD: confirm specific dataset URLs | [apps.cra-arc.gc.ca/ebci/hacc/srch/pub/dsplyBscSrch](https://apps.cra-arc.gc.ca/ebci/hacc/srch/pub/dsplyBscSrch) / open.canada.ca T3010 dataset | [budget.canada.ca](https://www.budget.canada.ca) | [tpsgc-pwgsc.gc.ca — Public Accounts](https://www.tpsgc-pwgsc.gc.ca/recgen/cpc-pac/index-eng.html) | [lobbycanada.gc.ca](https://lobbycanada.gc.ca) | [elections.ca](https://www.elections.ca) | [ciec-ccie.gc.ca](https://www.ciec-ccie.gc.ca) |
| **Licence / Terms** | Statistics Canada Open Licence | OGL-Canada 2.0 (open.canada.ca dataset) / CRA public registry terms | OGL-Canada 2.0 | OGL-Canada 2.0 | Public registry — confirm terms | Public registry — OGL-Canada 2.0 for open data files | Public registry — confirm terms |
| **Licence Status** | Review Required | Review Required | Review Required | Review Required | Review Required | Review Required | Review Required |
| **Reporting Period** | TBD — varies by indicator | Most recent T3010 filing year available | TBD — confirm budget year (e.g., FY 2024–25) | TBD — most recent Public Accounts year | TBD — rolling / current Parliament | TBD — 45th General Election + historical | TBD — most recent disclosure year |
| **Update Frequency** | Varies — monthly / quarterly / annual by indicator | Annual (T3010 filings published on lag) | Annual (budget day) | Annual (fall tabling) | Continuous (lobbyist registration updates) | Post-election; periodic for campaign finance | Annual / on disclosure |
| **App Update Frequency** | TBD | TBD | Annual | Annual | TBD — monthly check | Post-election; annual campaign finance | Annual |
| **Fetch Method** | TBD — Statistics Canada API or CSV download | TBD — open.canada.ca CSV download or CRA search | TBD — PDF / HTML / open data file | TBD — PDF / open data file | TBD — lobbycanada.gc.ca API or CSV download | TBD — elections.ca open data files | TBD — PDF / web |
| **Machine Readable?** | Partial (varies by indicator) | Partial (open.canada.ca CSV; CRA search is HTML) | Partial (PDF primary; some open data available) | Partial (PDF primary; some CSV available) | Yes (lobbycanada.gc.ca has search and CSV export) | Yes (elections.ca open data files) | No (PDF / web) |
| **Personal Information Risk** | Low — aggregate statistical data | Low — organisation records, not individuals | Low — aggregate | Low — aggregate | Medium — named lobbyists and registrants | Medium — named candidates; financial disclosures | High — named public officials; financial disclosures |
| **Public Figure / Official Data?** | No | No (organisations) | No | No | Yes — named registrants and lobbyists | Yes — named candidates | Yes — named public officials |
| **Transformation Performed** | TBD | TBD — grouping by province/category planned | TBD — departmental spending grouping planned | TBD — departmental grouping planned | TBD | TBD | TBD |
| **Display Location in App** | TBD — Economic Indicators section | TBD — Charities section | TBD — Federal Budget section | TBD — Public Accounts section | TBD — Lobbying section | TBD — Elections section | TBD — Ethics / Disclosures section |
| **Firestore Collection** | TBD | TBD | TBD | TBD | TBD | TBD | TBD |
| **Last Fetched Date** | Not yet fetched | Not yet fetched | Not yet fetched | Not yet fetched | Not yet fetched | Not yet fetched | Not yet fetched |
| **Last Verified Date** | Not yet verified | Not yet verified | Not yet verified | Not yet verified | Not yet verified | Not yet verified | Not yet verified |
| **Verification Status** | Needs Review | Needs Review | Needs Review | Needs Review | Needs Review | Needs Review | Needs Review |
| **Manual Review Flag Needed?** | TBD | TBD | Yes — PDF extraction may require manual review | Yes — PDF extraction may require manual review | TBD | TBD | Yes — PDF / manual extraction required |
| **Notes** | Confirm which specific Statistics Canada indicators are displayed (e.g., CPI, GDP, unemployment rate). Separate row per indicator may be needed once confirmed. | T3010 open data on open.canada.ca is preferred over CRA HTML search. Confirm dataset ID. Charity status (active/revoked) is high-risk — see CV-SOP-001 §11. | Confirm if open data file is available for the applicable budget year. PDF-only years require manual extraction. | Confirm open data availability for most recent year. Departmental totals are the primary display need. | Confirm whether lobbycanada.gc.ca offers a bulk export or API. Named lobbyist data is high-risk — second review required per CV-SOP-001 §10. | Elections Canada open data portal provides structured files. Confirm most recent election dataset URL after 45th General Election. | Named public official financial disclosure data. Manual review only. High-risk — second review required per CV-SOP-001 §10. |

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
| **Source URL** | [ontario.ca/page/ontario-budget](https://www.ontario.ca/page/ontario-budget) | [ontario.ca/page/public-accounts](https://www.ontario.ca/page/public-accounts) / ontario.ca grants data — TBD | [ontario.ca/page/public-sector-salary-disclosure](https://www.ontario.ca/page/public-sector-salary-disclosure) | [oico.on.ca](https://www.oico.on.ca) |
| **Licence / Terms** | Open Government Licence – Ontario — TBD confirm | Open Government Licence – Ontario — TBD confirm | Open Government Licence – Ontario — TBD confirm | Public registry — TBD confirm terms |
| **Licence Status** | Review Required | Review Required | Review Required | Review Required |
| **Reporting Period** | TBD — most recent Ontario budget year | TBD — most recent Public Accounts year | TBD — most recent disclosure year (typically prior calendar year, published March) | TBD — most recent disclosure year |
| **Update Frequency** | Annual (budget day) | Annual (fall) | Annual (March) | Annual / on disclosure |
| **App Update Frequency** | Annual | Annual | Annual | Annual |
| **Fetch Method** | TBD — PDF / HTML / open data file | TBD — PDF / open data file | TBD — CSV / XLSX download from ontario.ca | TBD — PDF / web |
| **Machine Readable?** | Partial (PDF primary; some data files available) | Partial (PDF primary; some CSV available) | Yes (CSV/XLSX available from ontario.ca) | No (PDF / web) |
| **Personal Information Risk** | Low — aggregate | Low — aggregate (grants to organisations) | High — named individuals; salary amounts | High — named public officials; financial disclosures |
| **Public Figure / Official Data?** | No | No (organisations) | Yes — named public-sector employees | Yes — named public officials |
| **Transformation Performed** | TBD | TBD — grouping by ministry/category planned | TBD — employer / salary band grouping planned | TBD |
| **Display Location in App** | TBD — Ontario Budget section | TBD — Ontario Spending / Grants section | TBD — Ontario Salary Disclosure section | TBD — Ontario Ethics / Disclosures section |
| **Firestore Collection** | TBD | TBD | TBD | TBD |
| **Last Fetched Date** | Not yet fetched | Not yet fetched | Not yet fetched | Not yet fetched |
| **Last Verified Date** | Not yet verified | Not yet verified | Not yet verified | Not yet verified |
| **Verification Status** | Needs Review | Needs Review | Needs Review | Needs Review |
| **Manual Review Flag Needed?** | Yes — PDF extraction may require manual review | TBD | TBD — CSV availability reduces manual review need | Yes — PDF / manual extraction required |
| **Notes** | Confirm whether Ontario publishes a structured open data file for the budget or whether only a PDF is available. | Confirm grants/transfer payments dataset URL on ontario.ca open data portal. | The Sunshine List is high-risk — named individuals with salary data. Second review required per CV-SOP-001 §10. Confirm exact CSV URL and column structure. | Named public official financial disclosure data. Manual review only. High-risk — second review required. |

---

## Attribution Statements

The following attribution statements are the approved formats for sources in this
register, consistent with CV-POL-002 Section 6.2. Update the reporting period and
fetched date for each cycle.

**Statistics Canada:**
> "Source: Statistics Canada, [indicator name], [reporting period], fetched [date].
> Adapted from Statistics Canada under the Statistics Canada Open Licence."

**CRA Charities:**
> "Source: Canada Revenue Agency Charities Listings (open.canada.ca), [fiscal year],
> fetched [date]. Contains information licensed under the Open Government Licence –
> Canada (OGL-Canada 2.0)."

**Federal Budget / Public Accounts:**
> "Source: [Report name], [fiscal year]. Contains information licensed under the Open
> Government Licence – Canada (OGL-Canada 2.0). Fetched [date]."

**Lobbying Registry:**
> "Source: Office of the Commissioner of Lobbying of Canada (lobbycanada.gc.ca),
> [reporting period], fetched [date]."

**Elections Canada:**
> "Source: Elections Canada (elections.ca), [election / reporting period], fetched
> [date]. Contains information licensed under the Open Government Licence – Canada."

**Conflict of Interest and Ethics Commissioner:**
> "Source: Office of the Conflict of Interest and Ethics Commissioner (ciec-ccie.gc.ca),
> [disclosure year], fetched [date]."

**Ontario Budget / Public Accounts:**
> "Source: [Ontario Ministry / report name], [fiscal year], fetched [date].
> Contains information licensed under the Open Government Licence – Ontario."

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
