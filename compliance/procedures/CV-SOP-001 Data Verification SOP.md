# CV-SOP-001 — Data Verification SOP

| Field | Value |
|---|---|
| **Document ID** | CV-SOP-001 |
| **Version** | 0.1 |
| **Status** | Draft |
| **Owner** | Founder / Data Lead |
| **Effective Date** | TBD — pending review |
| **Scope** | Civic Voice Canada only |
| **Related Documents** | CV-REG-001 Data Source Register (TBD) · CV-POL-002 Data Sources and Attribution Policy · CV-POL-004 Public Disclaimer and Non-Affiliation Statement |
| **Review Frequency** | Monthly; or when the data pipeline, app features, or data sources change |

---

> ⚠️ **DRAFT — NOT YET IN EFFECT**
>
> This SOP is a working draft prepared for internal review. It has **not** been formally
> adopted and is **not** yet in operation. It must be reviewed and approved by the Data
> Lead before public launch.

---

## 1. Purpose

This SOP defines how Civic Voice Canada verifies Canadian public-sector, open-government,
public registry, and official-source data before it is displayed in the app.

Its goals are to:

- Ensure every factual data point displayed in the app is traceable to a documented,
  legitimate, official source registered in CV-REG-001.
- Prevent inaccurate, unsourced, AI-inferred, or misrepresented data from being published.
- Define consistent verification steps for every data category used in the app.
- Establish a second-review requirement for high-risk data categories.
- Create a records trail that supports correction, audit, and legal review.
- Ensure that data that cannot be verified is labelled honestly rather than suppressed
  silently or displayed without qualification.

---

## 2. Scope

This SOP applies to all data displayed in Civic Voice Canada, including but not limited to:

- Federal public official profiles (MPs, Senators, Cabinet Ministers, PM, Officers of Parliament)
- Provincial public official profiles (Premiers, MLAs, MPPs, MNAs — if added in future)
- Government budget and spending figures
- Government contract and procurement records
- Departmental grant and contribution records
- Proactive disclosure records (travel, hospitality, contracts, reclassification)
- Charity and non-profit registry records
- Tax-exempt organisation records
- Legislative records (bills, laws, parliamentary votes, Orders in Council)
- Election and campaign finance records
- Lobbying disclosure records
- Salary, expense, and compensation disclosure records
- Economic, fiscal, and statistical figures
- Any chart, summary, calculation, or visualisation derived from the above

This SOP does **not** govern:

- Anonymous citizen-opinion vote counts, which are user-generated and not sourced from
  government data.
- App preferences stored locally on the user's device.
- Internal documents, planning files, or compliance documentation.

---

## 3. Definitions

| Term | Definition |
|---|---|
| **Data Source** | An official government website, open-data portal, API, published report, or public registry from which Civic Voice Canada sources factual data. |
| **CV-REG-001** | The Data Source Register — the master list of all approved sources, their licences, reporting periods, fetched dates, and transformation notes. |
| **Reporting Period** | The time period to which a dataset or record applies (e.g., FY 2024–25, 44th Parliament, Q4 2025). |
| **Fetched Date** | The date on which Civic Voice Canada retrieved the data from the source. |
| **Transformed Data** | Any data that has been grouped, aggregated, summarised, charted, calculated, converted, merged, or filtered from a source dataset. |
| **Manual Review Flag** | A status applied to a data point that cannot yet be verified or published — displayed to users with an approved status label. |
| **High-Risk Data** | Data categories where errors, inaccuracies, or unsupported claims carry elevated legal, reputational, or harm risk. See Section 15.1. |
| **Approved Status Label** | A standardised wording string (see Section 13) used when data is unavailable, blocked, incomplete, or pending review. |
| **Second Review** | A separate review by a second team member (or by the Data Lead if the team is one person) required before high-risk data is published. |

---

## 4. Roles and Responsibilities

| Role | Responsibility |
|---|---|
| **Data Lead** | Overall accountability for this SOP; approves new data sources; signs off on high-risk data second review; maintains CV-REG-001; escalates unresolved issues to the Founder |
| **Developer** | Implements data display, labels, and source attribution in the app UI; flags any new data source or data category to the Data Lead before adding to the app; applies manual review flags in code |
| **Reviewer (Second Review)** | Performs the second review for high-risk data categories — may be the Data Lead, a second team member, or an external reviewer where the team has only one member |
| **Founder** | Final escalation point for unresolved data verification disputes, prohibited-source exceptions, or data that cannot be verified but is requested by users |

---

## 5. Source Eligibility Check

Before any new data source is used in the app, the Data Lead must verify that the
source meets the eligibility criteria defined in CV-POL-002.

**Step 5.1 — Confirm source type.**
The source must be one of the following:

- An official Government of Canada website (e.g., parl.ca, canada.ca, elections.ca)
- A Government of Canada open-data portal dataset (open.canada.ca)
- A proactive disclosure database (CanadaBuys, TBS disclosure portal)
- An official statutory report (Public Accounts, Estimates, Departmental Plans)
- An official API published by a federal government agency
- A statutory commissioner or agency record (Lobbying Commissioner, Conflict of Interest
  Commissioner, Elections Canada)
- A Statistics Canada dataset under the Statistics Canada Open Licence
- An official published court decision (CanLII, Supreme Court of Canada)
- A Hansard transcript from parl.ca

**Step 5.2 — Confirm the source is not prohibited.**
Check the source against the prohibited-source list in CV-POL-002 Section 4. The
following are always prohibited without written approval:

- Wikipedia or Wikimedia
- News articles or editorial content
- Social media posts
- Estimated net worth websites
- Unofficial aggregators
- AI-generated content without traceable source links
- Third-party rankings or scorecards not separately approved
- Paywalled content
- Anonymous or unattributed files

**Step 5.3 — Record the eligibility outcome.**
If the source is eligible, proceed to Step 6. If the source is not eligible, do not use
it. Document the outcome in the verification record.

---

## 6. Source Registration Check

Before displaying any data from a source, verify that the source is registered in
CV-REG-001.

**Step 6.1 — Check CV-REG-001.**
Confirm that the source has a current entry in CV-REG-001 that includes:

- Source name and owner
- Source URL or document reference
- Licence or terms of use (confirmed date)
- Reporting period(s) covered
- Fetched date
- Data elements sourced from this source
- App sections where data is displayed
- Transformation notes (if any)
- Review status and next review date

**Step 6.2 — If no entry exists.**
If the source does not have a CV-REG-001 entry:

1. Do not publish the data without a CV-REG-001 entry.
2. Apply the "Pending official source review" label to any UI element that would display
   the data.
3. Create the CV-REG-001 entry before publishing.

**Step 6.3 — If the entry is stale.**
If the CV-REG-001 entry exists but the fetched date or licence confirmation date is more
than 12 months old for a regularly updated dataset, treat the entry as requiring refresh.
Update the fetched date and licence confirmation before republishing.

---

## 7. Data Extraction Verification

After confirming source eligibility and registration, verify the extracted data itself.

**Step 7.1 — Confirm the data was retrieved from the registered source URL.**
Check that the data was pulled from the URL listed in CV-REG-001, not a cached copy,
mirror, or proxy.

**Step 7.2 — Confirm the reporting period.**
Verify that the data corresponds to the reporting period shown in the app. If the source
has been updated since the last fetch, confirm whether the app display needs to be updated.

**Step 7.3 — Confirm the fetched date.**
Record the date the data was retrieved. Update CV-REG-001 if this is a refresh.

**Step 7.4 — Spot-check key values against the source.**
For quantitative data (dollar figures, vote counts, dates, counts), manually verify at
least 3–5 key values against the original source document before publication. Record the
values checked and the source document or URL in the verification record.

**Step 7.5 — Confirm no prohibited source content is mixed in.**
Confirm that the displayed data comes entirely from registered official sources. If any
data element was derived from a prohibited source (even partially), remove it and apply
an approved status label.

---

## 8. Transformation Verification

For any data that has been transformed — grouped, aggregated, summarised, calculated,
converted, merged, or filtered — the following additional steps are required.

**Step 8.1 — Document the transformation.**
Record the transformation method in CV-REG-001 and in the app's source attribution
display. Examples:

- "Records grouped by department."
- "Totals calculated by Civic Voice Canada from individual contract records."
- "Percentage calculated as department total ÷ total government expenditure."

**Step 8.2 — Confirm the formula or method is documented.**
If the transformation involves a material methodological choice (e.g., which fiscal year,
how missing values are handled, which exchange rate is used), that choice must be
documented in CV-REG-001 before publication.

**Step 8.3 — Verify the calculation.**
Manually recalculate at least one key derived figure from the raw source data before
publication. Record the calculation and result in the verification record.

**Step 8.4 — Confirm no unsupported conclusions are implied.**
The transformation must not create rankings, scores, or grades for public officials
unless the methodology is published and reviewed. The transformation must not imply a
conclusion (e.g., correlation, causation, misconduct) that is not stated in the original
official source.

---

## 9. Public Figure / Official Data Verification

Before publishing any profile, record, or data point about a named public official
(MP, Senator, Cabinet Minister, Premier, MLA/MPP, or other individual in a public role),
complete the following checks.

**Step 9.1 — Verify name and current title.**
Confirm the individual's full name and current official title against the official source
(parl.ca, elections.ca, or equivalent). Note the source URL and the date confirmed.

**Step 9.2 — Verify party or affiliation (if displayed).**
Confirm the individual's current party or affiliation against the official source. Note
that party affiliation can change (floor-crossing, resignation, expulsion). Confirm the
status as of the reporting period shown.

**Step 9.3 — Verify start date and current status (if displayed).**
Confirm start date, constituency, and current serving status (active, resigned, not
re-elected, defeated). Note the source and date confirmed.

**Step 9.4 — Verify official biography source URL.**
Confirm that the profile links to or cites an official biography page (e.g., the
individual's official parl.ca profile). Record the URL in CV-REG-001.

**Step 9.5 — Confirm no unsupported claims are made.**
The profile must not include:
- Corruption findings, misconduct allegations, or legal conclusions not drawn from an
  official finding, court decision, or published official report.
- Net worth estimates, personal financial information, or asset details not from an
  official proactive disclosure or conflict-of-interest filing.
- Political opinions, party-preference signals, or candidate endorsements.
- Information sourced from Wikipedia, news articles, or social media.

---

## 10. Financial / Budget / Grant / Lobbying Data Verification

Before publishing any financial disclosure, salary, budget, grant, contract, lobbying,
or campaign finance record, complete the following checks.

**Step 10.1 — Confirm the exact official source.**
Identify the specific report, database, or API that is the source of the figure. Record
in CV-REG-001. The source must be an official government publication — estimated figures,
news reports, and third-party estimates are not acceptable.

**Step 10.2 — Confirm the reporting period.**
Financial figures must be tied to a specific reporting period. Figures without a reporting
period must not be published. If the reporting period is unclear, apply the "Latest
official reporting period shown" label.

**Step 10.3 — Confirm the scope of the figure.**
Verify what the figure includes and excludes. For example:

- Does a "total contract value" include amendments or only the base contract?
- Does a "total lobbying" figure include all communication types or only oral communications?
- Is a salary figure a base salary or total compensation?

Document the scope in CV-REG-001 and in the app's source attribution.

**Step 10.4 — If a calculation is required, document the formula.**
If Civic Voice Canada calculates a derived figure (e.g., a department's share of total
spending), document the exact formula, the source data, and the result in the verification
record. See Section 8 for transformation verification requirements.

**Step 10.5 — Apply second review.**
All financial data is high-risk. A second review is required before publication.
See Section 15.

---

## 11. Charities and Registry Data Verification

Before publishing any record from a charity, non-profit, or tax-exempt organisation
registry, complete the following checks.

**Step 11.1 — Confirm the source is an official registry.**
For Canadian charities, the source must be the Canada Revenue Agency (CRA) Charities
Listings or a CRA-published data file. For other registries (e.g., provincial societies
registers), the source must be the official provincial registry.

**Step 11.2 — Confirm the registration status.**
Confirm whether the organisation is currently registered, revoked, or annulled. A
revoked or annulled organisation must be labelled clearly. Do not display a revoked
organisation as active.

**Step 11.3 — Confirm the reporting period for financial data.**
CRA T3010 filing data is published on a lag. Confirm the fiscal year the data covers
and display it clearly.

**Step 11.4 — Confirm no unsupported conclusions.**
Registry data must not be used to imply that an organisation is fraudulent, corrupt, or
operating improperly unless this is stated in an official CRA notice or court decision.

---

## 12. Data Freshness Verification

**Step 12.1 — Assign a freshness tier to each dataset.**
Each dataset in CV-REG-001 must be assigned one of the following freshness tiers:

| Tier | Description | Maximum Age Before Refresh Label Required |
|---|---|---|
| **Live / Continuous** | Data that changes frequently (e.g., active legislation, current MPs) | 30 days |
| **Periodic** | Data that updates on a known schedule (e.g., quarterly proactive disclosure, annual budgets) | 90 days after the expected publication date |
| **Point-in-time** | Data that is fixed to a specific event (e.g., election results, a specific budget) | No expiry — but reporting period must be shown |
| **Archived** | Historical data that is no longer updated | No expiry — must be labelled as historical |

**Step 12.2 — Apply the freshness label if data is stale.**
If a dataset has exceeded its maximum age threshold without a refresh, the app must
display:

> "Latest official reporting period shown — [period]. This data may not reflect recent changes."

**Step 12.3 — Log the refresh.**
When data is refreshed, update the fetched date in CV-REG-001 and record the refresh in
the Monthly Update Log.

---

## 13. Manual Review Flags and Approved Status Labels

If official data is unavailable, blocked, incomplete, outdated, or not machine-readable,
the app must display an approved status label. **Do not display a blank field, "N/A",
"0", or "No data" for missing official data** — these may be mistaken for confirmed zero
values or absent records.

**Approved label set:**

| Situation | Approved Label |
|---|---|
| Official data not yet loaded or ingested | `Official data not loaded yet` |
| Data requires manual check before display | `Manual review required` |
| A field is not disclosed in the official source | `Not disclosed in official source` |
| Source URL unreachable or file unavailable | `Source unavailable` |
| Data available but reporting period may be outdated | `Latest official reporting period shown` |
| Source blocks automated access (e.g., no API, PDF only) | `Source blocked automated access` |
| Partial data available — some records missing | `Partial official data available` |
| Data pending entry into CV-REG-001 | `Pending official source review` |
| Data is a modelled or estimated figure, not official | `Estimated — not official data` |

**Step 13.1 — Applying a manual review flag.**
When a manual review flag is applied to any data element:

1. Record the flag in the Manual Review Register (see Section 18).
2. Include the data element, reason for the flag, and expected resolution date.
3. Review the flag at least monthly — see Section 17.

---

## 14. Blocked or Unavailable Sources

If an official source is blocked, offline, paywalled, changed, or no longer accessible
in a machine-readable format:

**Step 14.1 — Apply the appropriate approved status label.**
Use `Source unavailable` or `Source blocked automated access` as applicable.

**Step 14.2 — Check for an alternative official source.**
Determine whether an equivalent official source is available (e.g., a different
government portal that publishes the same dataset). If an alternative is found, complete
a new source eligibility check (Section 5) and create a CV-REG-001 entry before
switching.

**Step 14.3 — Do not substitute a non-official source.**
If no alternative official source is available, the data must remain labelled with the
approved status label. It must not be replaced with data from a news article, Wikipedia,
or any prohibited source.

**Step 14.4 — Log the blocked source.**
Record the blocked source, the date it was found to be unavailable, and any steps taken
in CV-REG-001 and the Monthly Update Log.

---

## 15. Pre-Publication Review

### 15.1 High-Risk Data Categories

The following data categories are considered high-risk and require a second review
before publication:

- Financial disclosure records (salary, expense, compensation)
- Conflict-of-interest or ethics disclosure records
- Lobbying registration and communication records
- Campaign finance and political contribution records
- Named public official profiles (any data about a named individual)
- Government contract records where a named individual or specific company is identified
- Charity or non-profit records where the registration status is revoked or annulled
- Any data derived from a transformation where the methodology has not been previously
  reviewed

### 15.2 Second Review Process

For high-risk data:

1. The Data Lead completes the standard verification steps (Sections 5–14).
2. A second reviewer independently checks:
   - That the source URL in CV-REG-001 matches the actual source used.
   - That the reporting period and fetched date are correct.
   - That no prohibited claims are made (see CV-POL-004 Section 11).
   - That the approved status label, if applied, is the correct label.
   - That the transformation is documented if applicable.
3. The second reviewer signs off on the verification checklist (Section 18).
4. The Data Lead approves publication.

### 15.3 If the Team Has Only One Person

If Civic Voice Canada is operated by a single person at the time of publication, the
second review must be deferred to a 24-hour self-review period — the Data Lead must
review the verification record again, independently of the initial check, before
approving high-risk data for publication.

---

## 16. Post-Publication Correction

If a data error is identified after publication:

**Step 16.1 — Assess severity.**

| Severity | Definition | Required Action |
|---|---|---|
| **Critical** | Factually incorrect data about a named individual; incorrect financial figure; data from a prohibited source | Remove or correct immediately; apply approved status label until corrected; notify Data Lead |
| **Significant** | Incorrect reporting period; stale data beyond threshold; missing transformation note | Correct within 5 business days; update CV-REG-001 |
| **Minor** | Formatting error; label wording inconsistency; missing fetched date in UI | Correct within 30 days |

**Step 16.2 — Apply an approved status label if the error cannot be corrected immediately.**
While a critical or significant error is under correction, apply `Manual review required`
or remove the data element from display.

**Step 16.3 — Record the correction.**
Create a Correction Request Record (see Section 18) documenting:

- The data element affected
- The nature of the error
- The correct value and its official source
- The date the error was identified and the date it was corrected
- The reviewer who identified and approved the correction

**Step 16.4 — Update CV-REG-001.**
If the correction reveals a gap in CV-REG-001 (e.g., missing source entry, wrong URL,
wrong reporting period), update CV-REG-001 as part of the correction.

---

## 17. Monthly Verification Review

The Data Lead must conduct a monthly review that covers:

1. **Open manual review flags** — review all entries in the Manual Review Register
   (Section 18). For each open flag, determine whether the official source has become
   available, and either resolve the flag or update the expected resolution date.

2. **Data freshness** — check CV-REG-001 for datasets whose fetched date has exceeded
   the freshness threshold (Section 12). Refresh stale datasets or apply the freshness
   label.

3. **Source licence confirmation** — check CV-REG-001 for any source whose
   "Licence Last Confirmed" date is more than 12 months old. Re-confirm the licence.

4. **New source proposals** — review any new data sources proposed by the developer
   since the last monthly review. Complete source eligibility checks (Section 5) and
   create CV-REG-001 entries as required.

5. **Correction requests received** — review any user-submitted correction requests
   received since the last monthly review. Investigate and action as per Section 16.

6. **SOP currency** — confirm that this SOP remains accurate for the current state of
   the app's data pipeline. Update the SOP if required.

Record the outcomes of the monthly review in the Monthly Update Log (Section 18).

---

## 18. Records Generated

The following records must be maintained as part of this SOP. Records may be kept as
files in the compliance directory, a shared document, or a project management tool,
provided they are accessible to the Data Lead and any reviewer.

---

### 18.1 Data Verification Checklist

A checklist must be completed for each dataset or data element before it is published
or refreshed. The checklist must be retained for at least 2 years.

| Verification Item | Required Evidence | Pass / Fail | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| Source eligibility confirmed (CV-POL-002 §3) | Source type matches approved list; no prohibited source type | | | | |
| Source registered in CV-REG-001 | CV-REG-001 row exists with complete fields | | | | |
| Source URL confirmed | URL retrieved matches URL in CV-REG-001 | | | | |
| Reporting period confirmed | Reporting period matches source and UI display | | | | |
| Fetched date recorded | Date recorded in CV-REG-001 and UI attribution | | | | |
| Licence / terms confirmed | Licence type recorded; attribution wording applied | | | | |
| Spot-check of key values | At least 3–5 values verified against source | | | | |
| No prohibited sources used | All data elements trace to registered official sources only | | | | |
| Transformation documented (if applicable) | Method recorded in CV-REG-001; attribution note in UI | | | | |
| Transformation formula verified (if applicable) | At least one derived figure manually recalculated | | | | |
| No unsupported claims | No corruption findings, rankings, advice, or voting recommendations | | | | |
| Public figure checks complete (if applicable) | Name, title, party, status, bio URL confirmed | | | | |
| Financial data scope documented (if applicable) | Scope of figure (inclusions/exclusions) documented | | | | |
| Manual review flag applied where needed | Approved status label applied to any unverified element | | | | |
| Approved status labels correct | Label wording matches approved set in Section 13 | | | | |
| High-risk second review complete (if applicable) | Second reviewer signed off | | | | |
| CV-REG-001 updated | Fetched date, reporting period, and any new notes updated | | | | |
| Data Lead sign-off | Data Lead approved for publication | | | | |

---

### 18.2 Data Source Register Update

Any addition, change, or removal of a source in CV-REG-001 must be recorded in the
register's change log, including the date of change, the nature of the change, and the
name of the reviewer who made the change.

---

### 18.3 Manual Review Register

A running log of all open and resolved manual review flags, including:

- Data element or dataset flagged
- Approved status label applied
- Reason for the flag
- Date flagged
- Expected resolution date
- Date resolved (if resolved)
- Resolution action taken

---

### 18.4 Correction Request Record

For each post-publication correction, record:

- Data element corrected
- Nature of the error
- Correct value and official source
- Date error identified
- Date correction applied
- Reviewer who identified and approved the correction

---

### 18.5 Monthly Update Log

For each monthly review, record:

- Date of review
- Reviewer
- Open manual review flags reviewed and outcomes
- Datasets refreshed
- Licences re-confirmed
- New sources approved or rejected
- Correction requests actioned
- SOP changes made, if any

---

## 19. Deviations and Escalation

If any step in this SOP cannot be completed as written — for example, because a source
is temporarily unavailable, a second reviewer is unavailable, or an edge case arises
that the SOP does not cover — the following escalation path applies:

1. **Data Lead** — first point of resolution for any deviation from this SOP.
2. **Founder** — escalation if the Data Lead cannot resolve the issue, or if the
   deviation involves a prohibited source, a legal question, or a reputational risk.
3. **Legal Counsel (TBD)** — escalation for any deviation involving potential legal
   liability, a regulatory question, or a data subject complaint.

All deviations must be documented in the Monthly Update Log, including the nature of
the deviation, the resolution, and any SOP update required.

---

## 20. Approval

This SOP is approved when the Data Lead and Founder have reviewed it and confirmed it
accurately reflects the data verification process for Civic Voice Canada at the time of
public launch.

| Role | Name | Date |
|---|---|---|
| Data Lead | TBD | TBD |
| Founder | TBD | TBD |
| Legal Reviewer (if applicable) | TBD | TBD |

---

## Related Documents

| Document | Status |
|---|---|
| CV-REG-001 Data Source Register | TBD — to be created |
| [CV-POL-002 Data Sources and Attribution Policy](../policies/CV-POL-002%20Data%20Sources%20and%20Attribution%20Policy.md) | Draft |
| [CV-POL-004 Public Disclaimer and Non-Affiliation Statement](../policies/CV-POL-004%20Public%20Disclaimer%20and%20Non-Affiliation%20Statement.md) | Draft |
| [CV-POL-001 Privacy Policy](../policies/CV-POL-001%20Privacy%20Policy.md) | Draft |
| [CV-REG-002 Privacy Data Map](../registers/CV-REG-002%20Privacy%20Data%20Map.md) | Draft |

---

> **Final Note:** This SOP is a draft and must be reviewed by the Data Lead and Founder
> before public launch of Civic Voice Canada. The verification checklist, approved status
> labels, and second-review requirements should be tested against the actual data pipeline
> in use at the time of launch and updated to reflect any steps that differ in practice.

---

## Change Log

| Version | Date | Author | Change |
|---|---|---|---|
| 0.1 | 2026-07-26 | Founder / Data Lead | Initial draft — Canadian launch scope |
