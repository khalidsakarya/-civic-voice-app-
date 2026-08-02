# CV-SOP-002 — Monthly Data Update SOP

| Field | Value |
|---|---|
| **Document ID** | CV-SOP-002 |
| **Version** | 0.1 |
| **Status** | Draft |
| **Owner** | Founder / Data Lead |
| **Effective Date** | TBD — pending review |
| **Scope** | Civic Voice Canada only |
| **Related Documents** | CV-SOP-001 Data Verification SOP · CV-REG-001 Data Source Register (TBD) · CV-POL-002 Data Sources and Attribution Policy · CV-POL-004 Public Disclaimer and Non-Affiliation Statement |
| **Review Frequency** | Monthly; or when the data pipeline, app features, or data sources change |

---

> ⚠️ **DRAFT — NOT YET IN EFFECT**
>
> This SOP is a working draft prepared for internal review. It has **not** been formally
> adopted and is **not** yet in operation. It must be reviewed and approved by the Data
> Lead before public launch.

---

## 1. Purpose

This SOP defines how Civic Voice Canada performs monthly Canadian data updates, verifies
update results, handles blocked or unavailable sources, and records evidence before
updated data is displayed in the app.

Its goals are to:

- Ensure that every monthly data update uses only sources registered in CV-REG-001 or
  explicitly approved for addition to CV-REG-001 before use.
- Prevent empty, null, failed-fetch, or unverified data from overwriting valid existing
  data in Firestore.
- Ensure that failed or blocked sources result in honest status labels rather than stale
  factual data displayed without qualification.
- Require a documented review before any high-risk data category is updated in the
  public-facing app.
- Produce a Monthly Update Log that records what was checked, updated, failed, flagged,
  and approved.
- Integrate with CV-SOP-001 (Data Verification SOP) so that the monthly update process
  does not bypass verification requirements.

---

## 2. Scope

This SOP applies to all monthly data update activities for Civic Voice Canada, including:

- Scheduled monthly data fetches from official Canadian government sources
- Manual data refreshes triggered outside the normal monthly cycle (e.g., following an
  election, a federal budget, a new Parliament)
- Addition of new data sources to the app as part of a monthly update cycle
- Removal or replacement of existing data sources
- Firestore write operations that update public-facing data
- Post-write verification of data displayed in the app

This SOP does **not** govern:

- Emergency corrections to incorrect published data — those follow CV-SOP-001 Section 16
  (Post-Publication Correction).
- Changes to app code, data schemas, or Firestore security rules — those require a
  separate development review.
- Anonymous citizen-opinion vote counts, which are written by users in real time and
  are not part of the monthly update cycle.

---

## 3. Definitions

| Term | Definition |
|---|---|
| **Monthly Update** | The scheduled monthly cycle in which Civic Voice Canada fetches, verifies, and publishes refreshed data from registered official sources. |
| **Data Fetch** | The process of retrieving data from an official source — via API, CSV/XLSX download, web scrape, or manual download — for use in the app. |
| **Firestore Write** | A write operation to the Firebase Firestore database that creates or updates a document displayed in the app. |
| **Merge Write** | A Firestore write that updates only specified fields in an existing document, leaving all other fields unchanged. Preferred for monthly updates. |
| **Overwrite** | A Firestore write that replaces an entire document. Requires explicit approval — see Section 11. |
| **Failed Fetch** | A data fetch that returned an error, an empty result, an HTTP failure, or data that cannot be parsed or validated. |
| **Blocked Source** | A source that is online but prevents automated access (e.g., CAPTCHA, login wall, PDF-only format with no machine-readable equivalent). |
| **Manual Review Flag** | A status applied to a data element that cannot yet be verified or published, displayed to users with an approved status label. |
| **High-Risk Data** | Data categories where errors, inaccuracies, or unsupported claims carry elevated legal, reputational, or harm risk — see Section 10.2. |
| **Approved Status Label** | A standardised wording string used when data is unavailable, blocked, incomplete, or pending review — see Section 14. |
| **CV-REG-001** | The Data Source Register — the master list of all approved sources, their licences, reporting periods, fetched dates, and transformation notes. |
| **Monthly Update Log** | The record produced at the end of each monthly update cycle, documenting sources checked, records updated, failures, manual-review flags, and reviewer approval. |

---

## 4. Roles and Responsibilities

| Role | Responsibility |
|---|---|
| **Data Lead** | Plans and oversees each monthly update; reviews the Monthly Update Log; approves high-risk data for publication; escalates unresolved issues to the Founder; maintains CV-REG-001 |
| **Developer** | Runs data fetch scripts or manual downloads; performs Firestore writes; applies approved status labels in the app UI; flags any new source or schema change to the Data Lead before proceeding |
| **Reviewer** | Performs post-write verification for high-risk data categories; signs off on the Monthly Update Checklist |
| **Founder** | Final escalation point for unresolved update issues, deviations, or decisions to publish data of uncertain provenance |

---

## 5. Monthly Update Planning

The Data Lead must complete a planning review at the start of each monthly update cycle,
before any data fetch begins.

**Step 5.1 — Set the update scope.**
Review CV-REG-001 and confirm which datasets are due for refresh in the current cycle.
For each dataset, note:

- Source name and URL
- Reporting period expected
- Freshness tier (from CV-SOP-001 Section 12.1)
- Whether this is a routine refresh or a special update (e.g., post-election, post-budget)
- Whether any new data sources are being added this cycle

**Step 5.2 — Identify known source changes.**
Check whether any registered source has changed since the last cycle — for example, a
URL redirect, a format change, an API deprecation, or a licence update. Update CV-REG-001
before the fetch if a change is confirmed.

**Step 5.3 — Flag high-risk datasets.**
Identify which datasets in the update scope are high-risk (Section 10.2). Confirm that
a reviewer is available to perform a second review before those datasets are published.

**Step 5.4 — Set the update window.**
Record the planned start date and expected completion date for the update cycle. If the
update is expected to take more than one day, record interim milestones.

---

## 6. Pre-Update Checks

Before any data fetch begins, complete the following checks.

**Step 6.1 — Confirm CV-REG-001 is current.**
Verify that CV-REG-001 contains a current, complete entry for every source in the update
scope. If any source is missing a required field (URL, licence, reporting period, or
fetched date), update CV-REG-001 before fetching.

**Step 6.2 — Confirm Firestore security rules are in place.**
Verify that Firestore security rules prevent unauthenticated client writes to any
collection that holds government data. Firestore writes during the monthly update must
occur via authenticated server-side operations only (e.g., Admin SDK or a secured
server function), not from the client-side app.

**Step 6.3 — Confirm the rollback position.**
Before writing any data to Firestore, confirm:

- The current state of affected Firestore collections is documented (e.g., record counts,
  key field values for a sample of documents).
- A rollback plan exists if the write produces incorrect results — see Section 15.

**Step 6.4 — Confirm no new sources are being used without CV-REG-001 entries.**
New sources must not be used in the fetch until a CV-REG-001 entry is created and
source eligibility is confirmed per CV-SOP-001 Section 5. If a new source is being added
this cycle, confirm that the eligibility check and CV-REG-001 entry are complete before
proceeding.

---

## 7. Source Register Review

Before fetching each dataset, perform the following source register checks.

**Step 7.1 — Confirm the source URL is current.**
Verify that the source URL in CV-REG-001 still resolves to the expected dataset. If
the URL has changed, update CV-REG-001 before fetching.

**Step 7.2 — Confirm the licence or terms of use has not changed.**
Check the source's licence or terms of use page. If the licence has changed since the
last "Licence Last Confirmed" date in CV-REG-001, review the new terms before fetching.
Do not use the source if the new terms prohibit the intended use.

**Step 7.3 — Confirm the expected reporting period.**
Identify the reporting period expected for this fetch — for example, "Q1 FY 2025–26",
"45th Parliament", or "as of July 2026". If the source has not yet published the
expected period, note this and plan to apply the `Latest official reporting period shown`
label until the new data is available.

**Step 7.4 — Record the pre-fetch status.**
Record in the Monthly Update Log that the source register review was completed, the
URL confirmed, the licence confirmed, and the expected reporting period noted.

---

## 8. Data Fetch / Extraction

**Step 8.1 — Fetch from the registered source URL only.**
The data fetch must retrieve data from the URL listed in CV-REG-001. Do not substitute
a cached copy, mirror, aggregator, or third-party proxy.

**Step 8.2 — Record the fetch.**
For each successful fetch, record:

- Source name
- Source URL fetched
- Date and time of fetch
- Format retrieved (API JSON, CSV, XLSX, PDF, manual copy)
- Record count or file size (where applicable)
- Reporting period of the retrieved data

Update CV-REG-001 with the new fetched date immediately after a successful fetch.

**Step 8.3 — Validate the raw data before processing.**
Before parsing or transforming the retrieved data:

- Confirm the file format is as expected (e.g., CSV with expected columns, JSON with
  expected schema).
- Confirm the record count is plausible — a result that is significantly lower than
  expected (e.g., 0 records, or 90% fewer records than the previous fetch) must be
  treated as a failed fetch and investigated before processing.
- Confirm that key fields (e.g., official names, dollar amounts, dates) are populated
  and not uniformly null or empty.

**Step 8.4 — If the raw data fails validation.**
If the raw data fails any validation check in Step 8.3, treat this as a Failed Fetch
and follow Section 9.

**Step 8.5 — Parse and transform.**
Parse and transform the raw data per the transformation method documented in CV-REG-001.
If a new transformation step is required that is not yet documented, document it in
CV-REG-001 before applying it.

---

## 9. Failed, Blocked, or Unavailable Sources

If a source fetch fails, is blocked, or returns unusable data, the following steps apply.

**Step 9.1 — Classify the failure.**

| Failure Type | Description |
|---|---|
| **HTTP error** | The source URL returned a 4xx or 5xx error |
| **Empty result** | The source returned 0 records or an empty file |
| **Schema change** | The source format changed and data cannot be parsed |
| **Significantly reduced data** | Record count is materially lower than expected without explanation |
| **Blocked — CAPTCHA / login wall** | The source requires human interaction or authentication |
| **Blocked — PDF only** | Data is published only as a non-machine-readable PDF |
| **Source offline** | The source URL is unreachable |
| **Licence change** | The source licence no longer permits the intended use |

**Step 9.2 — Do not overwrite existing valid data with a failed fetch result.**
If a fetch fails, the existing Firestore data for that source must not be updated. Leave
the existing data in place and apply an approved status label to the UI instead.

**Step 9.3 — Apply the appropriate approved status label.**
Use the label from Section 14 that best describes the situation. The label must be
applied to all UI elements that display data from the failed source.

**Step 9.4 — Check for an alternative official source.**
Determine whether an equivalent official source is available. If an alternative is found,
complete a source eligibility check (CV-SOP-001 Section 5) and create a CV-REG-001 entry
before using it.

**Step 9.5 — Log the failure.**
Record the failure in the Monthly Update Log and in CV-REG-001, including:

- Failure type
- Date and time of the failed fetch
- Steps taken to investigate
- Whether an alternative source was found
- Approved status label applied
- Expected resolution date (if any)

**Step 9.6 — Escalate persistent failures.**
If a source has been unavailable or blocked for two or more consecutive monthly cycles,
escalate to the Data Lead and Founder to decide whether to remove the data element from
the app, seek an alternative source, or maintain the status label indefinitely.

---

## 10. Data Verification Before Firestore Write

Before writing any updated data to Firestore, complete the verification steps defined
in CV-SOP-001. This section summarises the minimum verification required as part of the
monthly update cycle.

**Step 10.1 — Complete the Data Verification Checklist.**
For each dataset being updated, complete the verification checklist defined in CV-SOP-001
Section 18.1. The checklist must be signed off by the Data Lead before any Firestore
write begins.

### 10.2 High-Risk Data — Second Review Required

The following data categories are high-risk and require a second review before any
Firestore write:

- Named public official profiles (MPs, Senators, Cabinet Ministers, Premiers, other named
  individuals in public roles)
- Salary, compensation, and expense disclosure records
- Financial disclosure and conflict-of-interest records
- Lobbying registration and communication records
- Campaign finance and political contribution records
- Government contract records where a named individual or company is identified
- Departmental grant and contribution records
- Charity or non-profit records where registration status is revoked or annulled
- Any dataset being added to the app for the first time

For high-risk data:

1. The Data Lead completes the standard verification steps.
2. A second reviewer independently checks the source URL, reporting period, fetched date,
   and key values, and confirms no prohibited claims are made.
3. The second reviewer signs the verification checklist.
4. The Data Lead approves the Firestore write.

**Step 10.3 — Confirm no prohibited content.**
Before writing, confirm that no data element to be written contains:

- Corruption findings, misconduct allegations, or legal conclusions not drawn from an
  official finding, court decision, or published official report.
- Net worth estimates or personal financial information not from an official disclosure filing.
- Political opinions, party-preference signals, or candidate endorsements.
- Data sourced from Wikipedia, news articles, social media, or any prohibited source.
- AI-generated or inferred facts that are not directly traceable to an approved source.
- Voting recommendations, investment signals, or professional advice of any kind.

---

## 11. Firestore Write Controls

**Step 11.1 — Use merge writes by default.**
All Firestore writes during monthly updates must be merge writes (using `{merge: true}`
or equivalent) unless an explicit overwrite has been approved by the Data Lead.

Merge writes update only specified fields. This prevents a failed or partial fetch from
erasing valid existing data in unaffected fields.

**Step 11.2 — Overwrite requires explicit approval.**
A full document overwrite (replacing an entire Firestore document) must be explicitly
approved by the Data Lead before execution, and the approval must be recorded in the
Monthly Update Log. The following must be confirmed before an overwrite:

- The new data is complete and has passed all verification checks.
- The overwrite will not delete valid fields not included in the new data.
- A rollback plan is in place (Section 15).

**Step 11.3 — No writes from empty, null, or failed-fetch data.**
If a fetch returned an empty result, null values, or failed validation, no Firestore
write shall be made for that source's data elements. Existing data must be preserved
and a status label applied.

**Step 11.4 — Write in batches where possible.**
Where a dataset produces multiple Firestore documents, use Firestore batch writes or
transactions to ensure atomicity. A partial write (some documents updated, some not)
must be treated as a deviation and investigated.

**Step 11.5 — Record all writes.**
For each Firestore write operation, record:

- Collection(s) and document(s) written
- Fields updated
- Write type (merge or overwrite)
- Date and time of write
- Developer who performed the write
- Data Verification Checklist reference

---

## 12. Post-Write Verification

After Firestore writes are complete, verify that the data was written correctly before
it is displayed to users.

**Step 12.1 — Confirm record counts.**
Query the updated Firestore collection and confirm that the record count is consistent
with the number of records written. A significant discrepancy must be investigated
before the data is made public.

**Step 12.2 — Spot-check key field values.**
For each updated dataset, manually verify at least 3–5 key field values in Firestore
against the source data. Record the values checked and the outcome in the Monthly Update
Log.

**Step 12.3 — Confirm fetched date and reporting period fields are updated.**
Check that the `fetchedDate` and `reportingPeriod` fields (or equivalent) in the written
documents reflect the current fetch. If these fields were not updated, the UI may display
stale attribution data.

**Step 12.4 — Confirm no null or empty overwrites occurred.**
Check a sample of documents to confirm that no previously populated fields have been
overwritten with null or empty values. If null overwrites are found, treat this as a
Critical error under CV-SOP-001 Section 16.1 and initiate a rollback.

---

## 13. Public Display Verification

After post-write verification, verify the data as it appears in the live app before
closing the monthly update cycle.

**Step 13.1 — Open the app and navigate to each updated section.**
For each dataset updated this cycle, open the app (or a staging version) and confirm:

- The updated data is displayed, not cached stale data.
- The source attribution, reporting period, and fetched date shown in the UI match what
  was written to Firestore.
- Approved status labels are displayed where expected (for any failed or blocked source).
- No null, empty, or generic placeholder values are visible in data fields.

**Step 13.2 — Confirm attribution wording.**
Verify that the attribution wording displayed in the app matches the approved format
defined in CV-POL-002 Section 6.2. In particular:

- Source name and URL are present.
- Reporting period is present.
- Fetched date is present (where shown in the UI).
- Transformation note is present where the data was grouped, aggregated, or calculated.
- Non-endorsement statement is present where required by CV-POL-004.

**Step 13.3 — Confirm no prohibited claims are visible.**
Review the updated sections for any text, label, or implicit claim that is prohibited
under CV-POL-004 Section 11. If any prohibited claim is found, remove or correct it
before the update cycle is closed.

**Step 13.4 — Confirm manual review flags are visible where applied.**
For any data element flagged as manual review required, confirm that the correct
approved status label is displayed in the app UI and not hidden or suppressed.

---

## 14. Manual Review Flags and Approved Status Labels

If official data is unavailable, blocked, incomplete, outdated, or not machine-readable,
the app must display an approved status label. **Do not display a blank field, "N/A",
"0", or "No data" for missing official data.**

**Approved label set for monthly updates:**

| Situation | Approved Label |
|---|---|
| Official data not yet fetched or ingested this cycle | `Official data not loaded yet` |
| Data requires manual check before display | `Manual review required` |
| A field is not disclosed in the official source | `Not disclosed in official source` |
| Source URL unreachable or file unavailable | `Source unavailable` |
| Source blocks automated access | `Source blocked automated access` |
| Data available but reporting period is from a prior cycle | `Latest official reporting period shown` |
| Partial data available — some records missing from source | `Partial official data available` |
| New data pending entry in CV-REG-001 | `Pending official source review` |
| Data is a modelled or estimated figure, not official | `Estimated — not official data` |

**Step 14.1 — Applying a manual review flag.**
When a manual review flag is applied to any data element during a monthly update:

1. Apply the approved status label to the UI element.
2. Add an entry to the Manual Review Register (Section 17.4) recording the data element,
   the reason for the flag, the label applied, and the expected resolution date.
3. Review the flag at the next monthly update cycle.

---

## 15. Correction and Rollback

### 15.1 Correction

If incorrect data is published during a monthly update, follow CV-SOP-001 Section 16
(Post-Publication Correction). In summary:

1. Classify the severity (Critical, Significant, or Minor).
2. Apply an approved status label immediately if the error is Critical or Significant.
3. Correct the data as soon as the correct verified value is available.
4. Record the error and correction in a Correction Request Record (Section 17.5).
5. Update CV-REG-001 if the error reveals a gap in source documentation.

### 15.2 Rollback

If a Firestore write produced incorrect, incomplete, or corrupt data that cannot be
corrected by a targeted re-write, a rollback may be required.

**Rollback steps:**

1. **Immediately apply approved status labels** to all affected UI elements to prevent
   users from seeing incorrect data while the rollback is prepared.
2. **Identify the rollback target.** Confirm the last known good state of the affected
   Firestore documents (from the pre-update snapshot documented in Step 6.3).
3. **Obtain Data Lead approval** before executing the rollback.
4. **Execute the rollback** by re-writing the last known good values to the affected
   documents.
5. **Verify the rollback** using the post-write verification steps in Section 12.
6. **Remove status labels** once the rollback is verified.
7. **Record the rollback** in the Monthly Update Log and as a Deviation Record
   (Section 17.6).

---

## 16. Monthly Update Log

The Data Lead must produce a Monthly Update Log at the end of each update cycle. The
log must be completed before the cycle is closed and retained for at least 2 years.

**Required fields in the Monthly Update Log:**

| Field | Description |
|---|---|
| Update cycle | Month and year (e.g., July 2026) |
| Date started | Date the update cycle began |
| Date completed | Date the update cycle was closed |
| Data Lead | Name of the Data Lead who oversaw the cycle |
| Reviewer(s) | Names of any second reviewers who participated |
| Sources checked | List of all sources reviewed this cycle |
| Successful fetches | List of sources fetched successfully, with reporting periods and fetched dates |
| Failed or blocked sources | List of sources that failed or were blocked, with failure type and status label applied |
| New sources added | Any new sources registered in CV-REG-001 this cycle |
| Records updated | Summary of Firestore collections and approximate record counts updated |
| High-risk reviews | List of high-risk datasets reviewed and second reviewers who signed off |
| Manual review flags opened | Data elements newly flagged this cycle and approved status labels applied |
| Manual review flags resolved | Previously open flags resolved this cycle |
| Corrections made | Any post-publication corrections completed this cycle |
| Deviations | Any deviations from this SOP and how they were resolved |
| Data Lead sign-off | Signature or name and date confirming the log is complete and accurate |

---

## 17. Records Generated

The following records must be maintained as part of this SOP. Records must be
accessible to the Data Lead and any reviewer and retained for at least 2 years.

---

### 17.1 Monthly Update Log

Produced at the end of each update cycle. See Section 16 for required fields.

---

### 17.2 Data Verification Checklist

Completed for each dataset updated this cycle, per CV-SOP-001 Section 18.1. One
checklist per dataset; retained with the Monthly Update Log.

---

### 17.3 Data Source Register Update

Any addition, change, or removal of a source in CV-REG-001 must be recorded in the
register's change log, including the date of change, the nature of the change, and the
name of the reviewer who made the change.

---

### 17.4 Manual Review Register Update

For each manual review flag opened or resolved during the monthly update, update the
running Manual Review Register with:

- Data element or dataset flagged or resolved
- Approved status label applied
- Reason for the flag or basis for resolution
- Date flagged or resolved
- Expected or actual resolution date
- Reviewer

---

### 17.5 Correction Request Record

For each post-publication correction that arose from this update cycle, record:

- Data element corrected
- Nature of the error
- Correct value and official source
- Date error identified and date corrected
- Reviewer who identified and approved the correction

---

### 17.6 Deviation Record

For each deviation from this SOP, record:

- Nature of the deviation
- Why the deviation occurred
- How it was resolved
- Whether a SOP update is required
- Data Lead or Founder sign-off

---

## 18. Monthly Update Checklist

The following checklist must be completed and signed off by the Data Lead before the
monthly update cycle is closed. One row per major activity; additional rows may be added
for dataset-specific checks.

| Step | Activity | Evidence Required | Pass / Fail | Reviewer | Date | Notes |
|---|---|---|---|---|---|---|
| 5 | Update scope confirmed; datasets identified | Update scope list; CV-REG-001 entries confirmed current | | | | |
| 5.3 | High-risk datasets identified; reviewer available | High-risk dataset list; reviewer name confirmed | | | | |
| 6.1 | CV-REG-001 current for all sources in scope | CV-REG-001 reviewed; all required fields complete | | | | |
| 6.2 | Firestore security rules confirmed | Server-side write confirmed; no client-side writes | | | | |
| 6.3 | Rollback position documented | Pre-update snapshot or record counts noted | | | | |
| 7 | Source register review complete for each source | URL confirmed; licence confirmed; reporting period noted | | | | |
| 8 | Data fetched from registered source URLs only | Fetch log; source URLs match CV-REG-001 | | | | |
| 8.2 | Fetched date updated in CV-REG-001 | CV-REG-001 fetched date column updated | | | | |
| 8.3 | Raw data validated before processing | Record count plausible; key fields populated; format correct | | | | |
| 9 | Failed/blocked sources handled; status labels applied | Failure log; approved status labels applied; no overwrites from failed fetches | | | | |
| 10 | Data Verification Checklist completed for each dataset | Signed verification checklist per dataset | | | | |
| 10.2 | High-risk second review complete | Second reviewer sign-off on verification checklist | | | | |
| 10.3 | No prohibited content in data to be written | Prohibited content check passed | | | | |
| 11.1 | Merge writes used (or overwrite explicitly approved) | Write log; overwrite approval recorded if applicable | | | | |
| 11.3 | No writes from empty/null/failed-fetch data | Write log confirms no failed-data writes | | | | |
| 11.5 | All writes recorded | Write log complete with collection, fields, type, time, developer | | | | |
| 12 | Post-write verification complete | Record count confirmed; spot-check values recorded; fetched date fields updated | | | | |
| 12.4 | No null overwrites found | Null overwrite check passed | | | | |
| 13 | Public display verified in app | App navigation confirmed; attribution wording correct; status labels visible | | | | |
| 13.3 | No prohibited claims visible in app | Prohibited claims check passed | | | | |
| 14 | Manual review flags applied and logged | Manual Review Register updated | | | | |
| 16 | Monthly Update Log complete and signed | Monthly Update Log filed | | | | |
| — | Data Lead final sign-off | Monthly Update Log signed | | | | |

---

## 19. Deviations and Escalation

If any step in this SOP cannot be completed as written, the following escalation path
applies:

1. **Data Lead** — first point of resolution for any deviation. The Data Lead may
   approve a documented exception where the intent of the SOP is met by an alternative
   approach.
2. **Founder** — escalation if the Data Lead cannot resolve the issue, or if the
   deviation involves a prohibited source, a legal question, a rollback, or a
   reputational risk.
3. **Legal Counsel (TBD)** — escalation for any deviation involving potential legal
   liability, a regulatory question, or a data subject complaint.

All deviations must be documented in a Deviation Record (Section 17.6) and noted in the
Monthly Update Log for the cycle in which they occurred.

---

## 20. Approval

This SOP is approved when the Data Lead and Founder have reviewed it and confirmed it
accurately reflects the monthly data update process for Civic Voice Canada at the time
of public launch.

| Role | Name | Date |
|---|---|---|
| Data Lead | TBD | TBD |
| Founder | TBD | TBD |
| Legal Reviewer (if applicable) | TBD | TBD |

---

## Related Documents

| Document | Status |
|---|---|
| [CV-SOP-001 Data Verification SOP](CV-SOP-001%20Data%20Verification%20SOP.md) | Draft |
| CV-REG-001 Data Source Register | TBD — to be created |
| [CV-POL-002 Data Sources and Attribution Policy](../policies/CV-POL-002%20Data%20Sources%20and%20Attribution%20Policy.md) | Draft |
| [CV-POL-004 Public Disclaimer and Non-Affiliation Statement](../policies/CV-POL-004%20Public%20Disclaimer%20and%20Non-Affiliation%20Statement.md) | Draft |
| [CV-POL-001 Privacy Policy](../policies/CV-POL-001%20Privacy%20Policy.md) | Draft |
| [CV-REG-002 Privacy Data Map](../registers/CV-REG-002%20Privacy%20Data%20Map.md) | Draft |

---

> **Final Note:** This SOP is a draft and must be reviewed by the Data Lead and Founder
> before public launch of Civic Voice Canada. The Monthly Update Checklist and Firestore
> write controls should be tested against the actual data pipeline and Firestore schema
> in use at the time of launch and updated to reflect any steps that differ in practice.

---

## Change Log

| Version | Date | Author | Change |
|---|---|---|---|
| 0.1 | 2026-07-26 | Founder / Data Lead | Initial draft — Canadian launch scope |
