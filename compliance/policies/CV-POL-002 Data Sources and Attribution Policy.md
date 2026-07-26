# CV-POL-002 — Data Sources and Attribution Policy

| Field | Value |
|---|---|
| **Document ID** | CV-POL-002 |
| **Version** | 0.1 |
| **Status** | Draft |
| **Owner** | Founder / Data Lead |
| **Effective Date** | TBD — pending legal review |
| **Scope** | Civic Voice Canada only |
| **Related Register** | CV-REG-001 Data Source Register (TBD) |
| **Review Frequency** | Monthly, or whenever a new data source is added |

---

> ⚠️ **DRAFT — NOT YET IN EFFECT**
>
> This policy is a working draft. It has not been reviewed by legal counsel and is not yet
> formally adopted. It must be reviewed and approved before public launch.

---

## Purpose

This policy defines how Civic Voice Canada selects, documents, attributes, displays, and
reviews official public-sector, public registry, and open-government data sources.

Its goals are to:

- Ensure every factual claim displayed in the App can be traced to a documented, legitimate,
  official source.
- Protect Civic Voice Canada from legal and reputational risk arising from inaccurate,
  unsourced, or misrepresented government data.
- Maintain trust with Canadian users by being transparent about where data comes from,
  when it was retrieved, and how it was processed.
- Comply with open-government licence attribution requirements, including the
  Open Government Licence – Canada (OGL-Canada 2.0).

---

## 1. Scope

This policy applies to all data displayed in Civic Voice Canada, including but not limited to:

- Federal public official profiles (MPs, Senators, Cabinet Ministers, PM)
- Government budget and spending figures
- Government contract records
- Departmental grant and contribution records
- Charity and non-profit records
- Tax-exempt organisation records
- Legislative records (bills, laws, executive orders, parliamentary votes)
- Election results and candidate data
- Lobbying disclosure records
- Salary and expense disclosure records
- Economic, fiscal, and statistical figures
- Court and case records
- Any chart, summary, or visualisation derived from the above

This policy does **not** govern anonymous citizen-opinion votes, which are user-generated
and not sourced from government data.

---

## 2. Core Rule

> **No factual number, chart, public official profile, grant record, charity record,
> proactive disclosure record, budget figure, salary figure, lobbying record, or campaign
> finance record shall be displayed in Civic Voice Canada unless it:**
>
> (a) has a documented source entry in **CV-REG-001 Data Source Register**, or
>
> (b) is clearly marked in the App as **"Pending official source review"** until a source
> entry is created.
>
> This rule applies regardless of how the data was obtained, formatted, or presented.

---

## 3. Source Eligibility

### 3.1 Preferred Sources

The following are preferred sources for Civic Voice Canada data:

| Category | Examples |
|---|---|
| Official government websites | parl.ca, canada.ca, elections.ca, tbs-sct.gc.ca |
| Government open-data portals | open.canada.ca, statcan.gc.ca |
| Proactive disclosure databases | canadabuys.canada.ca, tpsgc-pwgsc.gc.ca |
| Official statutory reports | Public Accounts of Canada, Estimates documents, DPR/Departmental Plans |
| Official PDFs published by government agencies | Annual reports, mandate letters, budget documents |
| Official CSV, XLSX, or JSON datasets published by government | open.canada.ca datasets |
| Official APIs published by government agencies | Parliament of Canada data, Elections Canada |
| Statutory commissioner and agency records | Lobbying Commissioner, Conflict of Interest Commissioner, Info Commissioner |

### 3.2 Acceptable Secondary Sources

The following may be used as secondary or supplementary sources with additional scrutiny:

- Official provincial/territorial government websites, where federal-comparable data is not
  available from federal sources.
- Statistics Canada licensed datasets (governed by the Statistics Canada Open Licence).
- Officially published court decisions (CanLII, Supreme Court of Canada website).
- Hansard transcripts from the Parliament of Canada website.

For all secondary sources, a source entry in CV-REG-001 is still required.

---

## 4. Prohibited Sources

The following sources are **prohibited** for use as factual data in Civic Voice Canada
without separate written approval by the Data Lead:

| Prohibited Source Type | Reason |
|---|---|
| Wikipedia or Wikimedia projects | Crowd-edited; not authoritative for factual public-sector data |
| News articles, opinion columns, or editorial content | Not primary sources; may contain errors, interpretation, or bias |
| Social media posts (Twitter/X, Facebook, LinkedIn, etc.) | Not verifiable primary sources |
| Estimated net worth websites (e.g., CelebrityNetWorth) | Speculative; not based on disclosed data |
| Unofficial politician databases or aggregators | May contain outdated, incorrect, or unsourced information |
| AI-generated content without traceable source links | Cannot be independently verified |
| Third-party summaries, rankings, or scorecards | Unless separately reviewed, approved, and documented in CV-REG-001 |
| Paywalled content | Cannot be verified by users; creates access inequality |
| Anonymous or unattributed data files | No chain of custody; no verification path |

If a data point cannot be sourced to a preferred or acceptable source, it must either be
removed from the App or labelled clearly as described in Section 11.

---

## 5. Data Source Register Requirement

### 5.1 CV-REG-001

Civic Voice Canada shall maintain a **Data Source Register** (CV-REG-001) that records:

- Source name and owner
- Source URL or document reference
- Licence or terms of use
- Reporting period(s) covered
- Fetch/retrieval date(s)
- Data elements sourced from this source
- App sections where data is displayed
- Transformation notes (if any)
- Review status and next review date

CV-REG-001 is a live document. It must be updated whenever:

- A new data source is added
- An existing source URL changes
- A licence or terms of use changes
- A source is removed or replaced
- A data element is moved to a different source

### 5.2 Source Review Before Addition

Before any new data source is added to the App:

1. The Data Lead must confirm source eligibility under Section 3.
2. A new row must be added to CV-REG-001.
3. The licence or terms of use must be reviewed under Section 7.
4. This policy (CV-POL-002) must be reviewed to confirm no rules are violated.

---

## 6. Attribution Requirement

### 6.1 Obligation

Civic Voice Canada must attribute all official and open-government data in accordance with
the terms of the applicable licence, including the Open Government Licence – Canada
(OGL-Canada 2.0), which requires a statement substantially equivalent to:

> "Contains information licensed under the Open Government Licence – Canada."

### 6.2 Standard Attribution Formats

The following attribution formats shall be used in the App, in documentation, and on any
public data source pages:

**Simple attribution:**
> "Source: [Agency / Dataset name], reporting period [period], fetched [date]."

**Transformed data attribution:**
> "Source: [Report name]. Civic Voice Canada grouped records by [method]. Fetched [date]."

**Licence acknowledgement (footer / data sources page):**
> "Contains information licensed under applicable Canadian open-government licences.
> Civic Voice Canada is independent and is not endorsed by the source government body."

### 6.3 Where Attribution Must Appear

Attribution must appear in at least one of the following locations for each data element:

- Directly on the relevant App card or section (preferred for significant datasets)
- On a publicly accessible Data Sources page (civicvoice.ca/sources — TBD)
- In the app's About / Legal section

Attribution may be abbreviated in the UI (e.g., "Source: open.canada.ca") provided the
full attribution is available on the Data Sources page.

---

## 7. Licence and Terms Review

### 7.1 Review Obligation

Before displaying data from any source, the Data Lead must confirm:

1. The licence permits the intended use (display, adaptation, commercial use if applicable).
2. Attribution requirements are understood and will be met.
3. Any restrictions (e.g., no endorsement implication, no modification of certain fields)
   are documented and followed.
4. The licence has not changed since last review.

### 7.2 OGL-Canada 2.0

The Open Government Licence – Canada (OGL-Canada 2.0) is the primary licence governing
most federal open data. It permits: copying, publishing, distributing, adapting, and
exploiting the information commercially or non-commercially. It requires attribution and
prohibits implying government endorsement.

### 7.3 Statistics Canada Open Licence

Statistics Canada datasets are governed by a separate licence. Confirm compatibility with
OGL-Canada 2.0 on a per-dataset basis at statcan.gc.ca/en/reference/licence.

### 7.4 Licence Change Monitoring

CV-REG-001 must record a "Licence Last Confirmed" date for each source. Licences must be
re-confirmed at least annually, or when a data source is updated.

---

## 8. Non-Endorsement Requirement

Civic Voice Canada must not imply, suggest, or create the impression that it is:

- Endorsed by the Government of Canada
- Endorsed by any province or territory
- Endorsed by any federal or provincial agency or regulator
- Endorsed by any public official, MP, Senator, Cabinet Minister, or Premier
- Endorsed by any political party, political campaign, or candidate
- An official government product or service

This applies to:

- App name, branding, and marketing materials
- Data attribution statements
- Push notifications and communications
- Social media content
- App Store and Play Store listings

Where there is any risk of confusion, the following disclaimer must be used:

> "Civic Voice Canada is an independent civic transparency platform. It is not affiliated
> with, endorsed by, or connected to the Government of Canada or any government body."

---

## 9. Reporting Period and Fetched Date Requirement

### 9.1 Reporting Period

Every displayed dataset must show the **reporting period** it covers — for example:
"FY 2024–25", "As of March 31, 2025", "43rd Parliament", or "Last updated: April 2025".

Where a precise reporting period is not available, the App must display the closest
available equivalent, or indicate that the period is unknown.

### 9.2 Fetched Date

Every displayed dataset must record the **date the data was retrieved** from the source.
This date must appear in CV-REG-001 and, where practical, in the App UI.

Fetched date is required because open-government data can be corrected, updated, or
retracted after initial publication. Displaying a fetched date allows users to understand
the currency of the information.

### 9.3 Data Currency

Where data may be significantly out of date (e.g., more than 12 months since fetch for
regularly updated datasets), the App must display a notice such as:

> "Latest official data shown — [reporting period]. This data may not reflect recent changes."

---

## 10. Transformed Data Requirement

### 10.1 Transformation Definition

"Transformed data" means any data that has been:

- Grouped, aggregated, or summarised
- Charted or visualised
- Cleaned, normalised, or reformatted
- Calculated (e.g., totals, percentages, per-capita figures)
- Converted between currencies, units, or periods
- Merged from multiple sources
- Filtered to a subset of a larger dataset

### 10.2 Documentation Obligation

For any transformed data displayed in the App:

1. The transformation method must be documented in CV-REG-001.
2. The attribution statement must disclose the transformation (see Section 6.2).
3. If the transformation involves a material methodological choice (e.g., which fiscal year
   to use, how to handle missing values, exchange rate source), that choice must be documented.

### 10.3 Transformation Limitations

Transformations must not:

- Create rankings, scores, or grades for public officials without a documented, published,
  and reproducible methodology.
- Imply a conclusion that is not supported by the underlying official data.
- Combine data from prohibited sources with official data in a way that obscures the
  non-official origin.

---

## 11. Manual Review and Blocked Sources

If official data is unavailable, blocked, incomplete, outdated, or not machine-readable,
the App must display an honest label. The following approved label set must be used:

| Situation | Approved Label |
|---|---|
| Official data not yet loaded | "Official data not loaded yet" |
| Data requires manual check before display | "Manual review required" |
| A field is not disclosed in the official source | "Not disclosed in official source" |
| The source URL is unreachable or the file is unavailable | "Source unavailable" |
| Data is available but may not reflect the latest period | "Latest official reporting period shown" |
| Data is a modelled or estimated figure, not official | "Estimated — not official data" |
| Data is pending review against CV-REG-001 | "Pending official source review" |

Labels such as "No data", "N/A", "0", or a blank field must not be used to represent
missing or unavailable official data, as they may be mistaken for confirmed zero values or
absent records.

---

## 12. Use of AI or Automated Summaries

### 12.1 Permitted Use

AI-generated or automated summaries may be used in Civic Voice Canada only if:

1. Every factual claim in the summary is traceable to a documented source in CV-REG-001.
2. The summary is labelled as AI-generated or algorithmically produced.
3. The source(s) underlying the summary are disclosed in the UI or in a linked note.

### 12.2 Prohibited Use

AI-generated content must not be used to create or imply:

- Accusations of corruption, fraud, criminality, or misconduct against a named individual
  that are not drawn from official findings, court decisions, or published official reports
- Rankings, scores, or integrity ratings for public officials unless methodology is published
- Voting recommendations or political endorsements
- Legal conclusions about the lawfulness of any government action
- Financial or investment recommendations
- Statements of fact that are not supported by a cited official source

### 12.3 Review

Any AI-generated content displayed in the App must be reviewed by the Data Lead before
publication and re-reviewed whenever the underlying source data is updated.

---

## 13. Public-Facing Source Display Standard

Civic Voice Canada shall maintain a publicly accessible **Data Sources page**
(intended location: civicvoice.ca/sources — TBD) that lists:

- All active data sources used in the App
- Source owner and URL
- Applicable licence or terms of use
- Reporting period(s) and fetched date(s)
- A statement distinguishing official government data from any editorial or modelled content
- The following licence acknowledgement:

> "Contains information licensed under applicable Canadian open-government licences,
> including the Open Government Licence – Canada (OGL-Canada 2.0).
> Civic Voice Canada is an independent platform and is not affiliated with, endorsed by,
> or connected to the Government of Canada or any government body."

The Data Sources page must be linked from:

- The App's About / Settings screen
- The App's legal footer
- The App Store and Play Store listings (as a supplementary URL)

---

## 14. Responsibilities

| Role | Responsibility |
|---|---|
| **Founder / Data Lead** | Overall accountability for this policy; approves new data sources; maintains CV-REG-001; conducts licence reviews |
| **Developer** | Implements attribution display in UI; labels transformed data; flags any new data source to Data Lead before adding to app |
| **Privacy Lead** | Ensures data sourcing practices are consistent with CV-POL-001 (Privacy Policy) and CV-REG-002 (Privacy Data Map) |
| **Legal Reviewer (TBD)** | Reviews this policy and CV-REG-001 before public launch; advises on licence obligations |

---

## 15. Review and Change Control

### 15.1 Review Frequency

This policy shall be reviewed:

- **Monthly** as part of the regular data source review cycle
- Whenever a new data source is proposed for addition to the App
- Whenever a source licence or terms of use changes
- Whenever a significant new App feature is introduced that displays new categories of data
- Whenever a privacy, legal, or reputational incident relates to data sourcing

### 15.2 Change Control

Changes to this policy require:

1. A tracked change in version control (git) with a descriptive commit message
2. Version number increment (MAJOR for substantive policy changes, MINOR for additions,
   PATCH for corrections)
3. Update to the Change Log below
4. Notification to all roles listed in Section 14

### 15.3 Conflicts with App Code

If a developer identifies that existing App code displays data that does not have a
corresponding CV-REG-001 entry, they must:

1. Add the "Pending official source review" label to the relevant UI element, or
2. Remove the data from the UI temporarily, and
3. Raise a source documentation task to create the CV-REG-001 entry

Data must not remain undocumented in production.

---

## Example Attribution Statements

The following examples illustrate compliant attribution wording for common use cases:

```
Source: Parliament of Canada (parl.ca), 44th Parliament, fetched 2025-06-15.
```

```
Source: Government of Canada Open Data Portal (open.canada.ca) — Proactive Disclosure,
reporting period Q4 FY 2024–25, fetched 2025-07-01.
```

```
Source: Public Accounts of Canada 2023–24. Civic Voice Canada grouped expenditures by
department and calculated percentage of total. Fetched 2025-05-20.
```

```
Source: Elections Canada (elections.ca), 45th General Election results, fetched 2025-05-05.
```

```
Contains information licensed under the Open Government Licence – Canada (OGL-Canada 2.0).
Civic Voice Canada is independent and is not endorsed by the source government body.
```

---

## Related Documents

| Document | Status |
|---|---|
| [CV-POL-001 Privacy Policy](CV-POL-001%20Privacy%20Policy.md) | Draft |
| [CV-REG-001 Data Source Register](../registers/CV-REG-001%20Data%20Source%20Register.md) | TBD — to be created |
| [CV-REG-002 Privacy Data Map](../registers/CV-REG-002%20Privacy%20Data%20Map.md) | Draft |
| CV-POL-003 Data Breach Response Plan | TBD |
| CV-POL-004 Accessibility Policy | TBD |
| Canadian Civic App Compliance Plan (CV-COMP-001) | Draft |

---

> **Final Note:** This policy is a draft and must be reviewed by legal counsel and the Data
> Lead before public launch of Civic Voice Canada. In particular, the licence obligations
> under OGL-Canada 2.0, Statistics Canada Open Licence, and any provincial open-data
> licences must be confirmed against the actual sources used in the App at the time of launch.

---

## Change Log

| Version | Date | Author | Change |
|---|---|---|---|
| 0.1 | 2026-07-26 | Founder / Data Lead | Initial draft — Canadian launch scope |
