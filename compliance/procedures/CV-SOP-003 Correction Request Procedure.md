# CV-SOP-003 — Correction Request Procedure

| Field | Value |
|---|---|
| **Document ID** | CV-SOP-003 |
| **Version** | 0.1 |
| **Status** | Draft |
| **Owner** | Founder / Compliance Lead |
| **Effective Date** | TBD — pending review |
| **Scope** | Civic Voice Canada only |
| **Related Documents** | CV-SOP-001 Data Verification SOP · CV-SOP-002 Monthly Data Update SOP · CV-REG-001 Data Source Register (TBD) · CV-POL-002 Data Sources and Attribution Policy · CV-POL-003 Terms of Use · CV-POL-004 Public Disclaimer and Non-Affiliation Statement |
| **Review Frequency** | Quarterly; or when the correction workflow changes |

---

> ⚠️ **DRAFT — NOT YET IN EFFECT**
>
> This procedure is a working draft prepared for internal review. It has **not** been
> formally adopted and is **not** yet in operation. It must be reviewed and approved by
> the Compliance Lead before public launch.

---

## 1. Purpose

This procedure defines how Civic Voice Canada receives, reviews, documents, prioritises,
resolves, and closes correction requests related to app content, public data, source
links, charts, summaries, public official profiles, grants, budgets, disclosures,
charities, or other displayed information.

Its goals are to:

- Ensure every correction request is logged before any action is taken.
- Protect named individuals and organisations from having inaccurate information remain
  in the app longer than necessary.
- Prevent user-submitted claims from overwriting official source data without
  verification.
- Prevent accusations, inferred wrongdoing, or legal conclusions from being created or
  perpetuated based on unverified user reports.
- Ensure that high-risk and critical corrections receive a second review before any
  change is made to the public-facing app.
- Provide requesters with a consistent, documented response to their requests.
- Produce records that support audit, legal review, and ongoing compliance.

---

## 2. Scope

This procedure applies to all correction requests received by Civic Voice Canada,
including requests about:

- Public official profiles (names, titles, party, constituency, status, biography)
- Financial data (salary, expenses, budgets, departmental spending)
- Government contracts and procurement records
- Grants and contributions records
- Proactive disclosure records
- Lobbying registration and communication records
- Campaign finance and political contribution records
- Conflict-of-interest and ethics disclosure records
- Charity and non-profit registry records
- Legislative records (bills, votes, orders)
- Election results and candidate data
- Charts, summaries, calculations, and derived figures
- Source links, reporting periods, and fetched dates
- Approved status labels displayed in the app
- Any other factual data element displayed in the app

This procedure does **not** govern:

- Anonymous citizen-opinion vote counts, which are user-generated.
- Requests to change the app's opinions, design, or features.
- Legal claims, formal complaints to regulators, or notices requiring legal response —
  those are escalated to legal counsel.
- Privacy access or deletion requests — those are handled under CV-POL-001 Section 14.

---

## 3. Definitions

| Term | Definition |
|---|---|
| **Correction Request** | Any communication received by Civic Voice Canada — via email, in-app form, or other channel — asserting that information displayed in the app is inaccurate, outdated, misleading, or missing. |
| **Requester** | The person or organisation who submitted the correction request. May be anonymous or identified. |
| **Correction Request Record** | The structured record created for each correction request — see Section 17.1 for the template. |
| **Risk Level** | A classification of the potential harm if the reported error is real and uncorrected — see Section 8. |
| **Temporary Public Display Action** | An interim measure applied to the affected UI element while the correction is under review — see Section 10. |
| **Second Review** | An independent review by a second team member required before any correction to high-risk or critical data is published. |
| **Official Source** | A source meeting the eligibility criteria in CV-POL-002 Section 3 and registered (or eligible for registration) in CV-REG-001. |
| **No Change Required** | A closure status applied when the original app data is confirmed correct after review. |
| **Approved Status Label** | A standardised wording string used when data is under review, unavailable, or pending correction — see Section 10. |

---

## 4. Roles and Responsibilities

| Role | Responsibility |
|---|---|
| **Compliance Lead** | Receives and logs all correction requests; performs initial triage; assigns risk level; oversees the correction process; communicates with requesters; approves closure |
| **Data Lead** | Performs source evidence review; confirms or refutes the reported error against official sources; updates CV-REG-001 if source changes are required; approves correction implementation |
| **Developer** | Implements approved corrections in Firestore or app code; applies and removes temporary status labels; confirms post-correction display in the app |
| **Reviewer** | Performs second review for high-risk and critical corrections before publication |
| **Founder** | Final escalation for critical corrections, legal complaints, reputational risk decisions, or unresolved disputes |
| **Legal Counsel (TBD)** | Advises on corrections involving potential defamation, privacy law, regulatory obligations, or formal legal complaints |

---

## 5. Correction Request Intake

**Step 5.1 — Receive the request.**
Correction requests may arrive via:

- The designated correction/feedback email address (currently **[CONTACT EMAIL — TBD]**)
- An in-app "Report an error" or "Suggest a correction" form (if deployed)
- Direct contact from a named individual or organisation whose information is displayed
- A formal legal notice or regulatory inquiry (escalate immediately — see Section 19)

All channels must route to the Compliance Lead or a monitored inbox that the Compliance
Lead reviews at least weekly.

**Step 5.2 — Log the request immediately.**
Before taking any action, create a Correction Request Record (Section 17.1) and assign
a Correction ID. The record must be created even if the request is clearly incomplete
or frivolous — the log is the starting point for all subsequent steps.

**Step 5.3 — Acknowledge receipt.**
Send an acknowledgement to the requester within **3 business days** of receipt, if
contact details were provided. The acknowledgement must not commit to a specific outcome.

Example acknowledgement wording:

> "Thank you for contacting Civic Voice Canada. We have received your correction request
> and will review the information you have provided. We aim to respond within [10–30]
> business days depending on the nature of the request. We will contact you if we need
> additional information."

---

## 6. Required Information from Requester

Requesters are encouraged to provide the following information. Requests that lack some
of this information are still accepted and logged, but may take longer to resolve.

| Field | Description |
|---|---|
| **Affected page or section** | Which page, card, or section of the app contains the alleged error (e.g., "MP profile for [name]", "Federal Budget chart", "Lobbying records for [organisation]") |
| **Affected data item** | The specific number, name, date, label, or statement that is alleged to be incorrect |
| **Description of the issue** | What the requester believes is wrong and why |
| **Correct value (if known)** | What the requester believes the correct value should be |
| **Supporting source** | A link to, or description of, an official source that supports the correction |
| **Requester contact** | Email address or other contact method for follow-up (optional — anonymous requests are accepted) |

If supporting source information is not provided, the Compliance Lead will attempt to
locate an official source independently during the source evidence review (Section 9).

---

## 7. Initial Triage

After logging the request, the Compliance Lead performs an initial triage within
**2 business days** of logging.

**Step 7.1 — Confirm the request is within scope.**
Determine whether the request relates to a factual data element displayed in the app
(within scope) or to a design feature, opinion, policy decision, or out-of-scope matter.

- If out of scope: close with a polite explanation. Document the closure reason in the
  Correction Request Record.
- If within scope: proceed to risk classification.

**Step 7.2 — Assess the face validity of the claim.**
Without yet verifying the claim fully, assess whether it is plausible based on general
knowledge of the data category:

- Does the reported error seem plausible given the data source and type?
- Does the requester identify a specific data element (rather than a vague complaint)?
- Is the requester's suggested source (if any) an official or credible source type?

This is a face-validity check only — it does not substitute for source evidence review
(Section 9).

**Step 7.3 — Assign a risk level.**
Assign the risk level per Section 8 and record it in the Correction Request Record.

**Step 7.4 — Determine whether a temporary public display action is needed.**
If the risk level is High or Critical and the claim is facially plausible, apply a
temporary public display action (Section 10) while the source evidence review is
conducted.

---

## 8. Risk Classification

Every correction request must be assigned one of the following risk levels. The risk
level determines the priority, review requirements, and timelines that apply.

### Low

**Definition:** The reported issue is a presentation error with no material impact on
factual accuracy or on any named individual or organisation.

**Examples:**
- Typographical error in a label or description
- Broken or outdated hyperlink to a source
- Formatting issue (e.g., wrong currency symbol, incorrect date format)
- Missing fetched date or reporting period label in the UI
- Incorrect chart colour or legend label that does not affect the underlying data

**Timelines:** Acknowledge within 3 business days; resolve within 30 days.
**Second review:** Not required.
**Temporary display action:** Not required unless the formatting error could be
misleading.

---

### Medium

**Definition:** The reported issue involves a factual error or outdated information that
does not directly name an individual in a sensitive context and does not raise immediate
reputational, legal, or privacy concerns.

**Examples:**
- An outdated statistic (e.g., a budget figure from the wrong fiscal year)
- A missing or incorrect source attribution (wrong URL, wrong agency name)
- A wrong reporting period label
- A summary or chart that uses the wrong dataset but does not affect a named individual
- A missing transformation note

**Timelines:** Acknowledge within 3 business days; resolve within 15 business days.
**Second review:** Not required, but Data Lead must confirm the correct source before
any change.
**Temporary display action:** Apply `Latest official reporting period shown` or
`Manual review required` if the error may mislead users while under review.

---

### High

**Definition:** The reported issue involves a factual error or outdated information
about a named public official, named organisation, or named individual, or involves a
sensitive data category where an error could cause reputational, legal, financial, or
regulatory harm.

**Examples:**
- Incorrect name, title, party, or constituency for a named MP, Senator, or Cabinet Minister
- Wrong salary, expense, or compensation figure for a named individual
- Incorrect financial disclosure, conflict-of-interest, or lobbying record for a named
  individual or organisation
- Wrong campaign finance record or contribution amount
- Incorrect grant or contract record identifying a named recipient
- Incorrect charity registration status (e.g., showing a revoked charity as active)
- Incorrect election result for a named candidate

**Timelines:** Acknowledge within 3 business days; resolve within 10 business days.
**Second review:** Required before any correction is published.
**Temporary display action:** Apply `Manual review required` or `Source under review`
immediately if the claim is facially plausible.

---

### Critical

**Definition:** The reported issue involves a false accusation, serious reputational
harm, a privacy breach, a potential legal complaint, a security issue, or data that
could cause immediate harm to a named individual or organisation.

**Examples:**
- A data element that falsely implies criminal conduct, corruption, fraud, or serious
  misconduct by a named individual
- Incorrect data that has been publicly cited and caused reputational harm to a named
  individual or organisation
- A privacy breach — personal information (e.g., home address, health information,
  non-public financial information) inadvertently displayed about a named individual
- A formal legal notice, defamation complaint, or regulatory inquiry
- A security vulnerability or data breach related to a named individual's information
- A data element that was sourced from a prohibited source and makes a harmful claim

**Timelines:** Acknowledge within 1 business day; apply temporary display action
immediately; resolve within 5 business days or escalate to legal counsel.
**Second review:** Required before any correction is published.
**Escalation:** Escalate to Founder and legal counsel on receipt.
**Temporary display action:** Remove the affected data element or apply `Manual review
required` immediately, before source evidence review is complete.

---

## 9. Source Evidence Review

After initial triage and risk classification, the Data Lead conducts a source evidence
review.

**Step 9.1 — Identify the original source.**
Confirm what source was used for the data element in question. Check CV-REG-001 for the
registered source name, URL, reporting period, and fetched date.

**Step 9.2 — Check the original source.**
Retrieve the original source and verify whether the data element in the app matches the
source as it existed when the data was fetched and as it exists now.

Possible outcomes:

| Outcome | Description |
|---|---|
| **App data matches current source** | The app data is correct based on the registered source. |
| **App data matched source at fetch, but source has since been updated** | The source has been updated since the fetch. The app may need to be refreshed. |
| **App data does not match source** | The app data appears to contain an error introduced during extraction, transformation, or entry. |
| **Source has changed or been removed** | The registered source URL no longer resolves, or the data has been retracted or corrected by the source. |
| **Source is ambiguous or inconsistent** | Different official sources give different values. Document the discrepancy. |

**Step 9.3 — Evaluate the requester's evidence.**
If the requester provided a supporting source:

- Confirm whether the requester's source meets the eligibility criteria in CV-POL-002
  Section 3 (official or approved secondary source).
- If the requester's source is a prohibited source (news article, Wikipedia, social
  media, etc.), do not treat it as authoritative. It may still be useful as a pointer
  to find an official source independently.
- Do not replace official source data with a user-submitted claim that is not supported
  by an official source.

**Step 9.4 — Document the source evidence review outcome.**
Record the outcome in the Correction Request Record under "Verification evidence".

---

## 10. Temporary Public Display Action

For High and Critical risk corrections, and for Medium risk corrections where the
claim is facially plausible and users could be materially misled, the Compliance Lead
must apply a temporary public display action while the source evidence review is
conducted.

**Approved temporary status labels:**

| Situation | Label to Apply |
|---|---|
| Correction is under review; data may be incorrect | `Manual review required` |
| Source is being re-checked | `Source under review` |
| Official source is being verified | `Official source verification pending` |
| Data has been removed pending review | `Content under review` |

**Step 10.1 — Apply the label promptly.**
For Critical risk: apply immediately, before source evidence review begins.
For High risk: apply within 1 business day of the initial triage decision.
For Medium risk: apply at the Data Lead's discretion if the claim is plausible.

**Step 10.2 — Notify the developer.**
The Compliance Lead must notify the developer to apply the approved status label to the
affected UI element. The label must be applied in a way that is visible to users of the
affected page or card.

**Step 10.3 — Remove the label when the correction is resolved.**
When the correction decision is finalised and any correction is implemented and verified,
the temporary label must be removed and replaced with either the corrected data or the
appropriate permanent approved status label (if the source is permanently unavailable).

---

## 11. Correction Decision

After the source evidence review, the Data Lead makes one of the following decisions:

| Decision | Criteria | Action |
|---|---|---|
| **Correct — change required** | The source evidence review confirms that the app data is wrong. The correct value is supported by an official source. | Implement the correction per Section 12. |
| **Correct — source refresh required** | The app data was correct at the time of fetch, but the source has since been updated. The new value is supported by the current official source. | Refresh the data per the monthly update process (CV-SOP-002). Update CV-REG-001 with the new fetched date. |
| **Correct — source unavailable** | The registered source is no longer accessible. The app data cannot be verified. | Apply a permanent approved status label (`Source unavailable` or `Source blocked automated access`). Do not display the data without a label. |
| **Correct — source ambiguous** | Different official sources give different values. The discrepancy cannot be resolved. | Apply `Manual review required` label. Document the discrepancy in CV-REG-001. Escalate if the discrepancy relates to a named individual. |
| **No change required** | The source evidence review confirms that the app data is correct and matches the current official source. | Close the request with "No change required". Document the review in the Correction Request Record. Notify the requester if contact details were provided. |
| **Rejected — no official source** | The requester's claim is not supported by any official source, and no error is found in the original source. | Close the request as "Rejected — unsupported". See Section 15 for required documentation and requester communication. |
| **Escalate** | The correction involves a legal complaint, privacy breach, formal notice, or cannot be resolved by the Data Lead alone. | Escalate to Founder and legal counsel per Section 19. |

---

## 12. Correction Implementation

**Step 12.1 — Document the correction before implementing.**
Record the following in the Correction Request Record before any Firestore write or code
change:

- The incorrect value (as displayed in the app)
- The correct value
- The official source supporting the correct value (URL, document, section)
- The reporting period of the correct value
- The fetched date of the correct value

**Step 12.2 — Update CV-REG-001 if the source changes.**
If the correction involves a new source, a new URL, a new reporting period, or a
discovered error in the original source entry, update CV-REG-001 before or as part of
implementing the correction.

**Step 12.3 — Use controlled change logic.**
All Firestore writes for corrections must follow the write controls in CV-SOP-002
Section 11:

- Merge writes by default.
- No overwrite unless explicitly approved by the Data Lead.
- No write from empty, null, or unverified data.

**Step 12.4 — High-risk and critical corrections require second review.**
Before any Firestore write or code change for a High or Critical risk correction:

1. The Data Lead prepares the corrected value and source evidence.
2. A second reviewer independently confirms the correct value against the official source.
3. The second reviewer signs off on the Correction Request Record.
4. The Data Lead approves the write.

**Step 12.5 — Record the write.**
After implementing the correction, record in the Correction Request Record:

- Date and time of correction
- Developer who performed the write
- Fields corrected
- Firestore collection and document ID (where applicable)

---

## 13. Post-Correction Verification

After implementing the correction, verify the result before closing the request.

**Step 13.1 — Confirm the corrected value is displayed in the app.**
Open the app (or a staging version) and navigate to the affected page or card. Confirm:

- The correct value is displayed.
- The source attribution reflects the updated source, reporting period, and fetched date.
- The temporary status label has been removed.
- No null, empty, or residual incorrect values remain.

**Step 13.2 — Spot-check adjacent data.**
Verify that the correction did not inadvertently affect adjacent fields or documents.

**Step 13.3 — Confirm no prohibited claims were introduced.**
Review the corrected section for any text or label that constitutes a prohibited claim
under CV-POL-004 Section 11.

**Step 13.4 — Record the post-correction verification.**
Record the verification outcome in the Correction Request Record.

---

## 14. Communication to Requester

If the requester provided contact details, send a closure communication once the
correction decision is finalised and implemented.

**If a correction was made:**

> "Thank you for bringing this to our attention. We have reviewed the information you
> reported and confirmed an error. The information has been corrected. The updated data
> is now displayed in the app.
>
> If you have further questions or notice any other issues, please contact us at
> [CONTACT EMAIL — TBD]."

**If no change was required:**

> "Thank you for your correction request. We have reviewed the information you reported
> against the official source and confirmed that the data currently displayed is
> consistent with the official record as of [date/reporting period].
>
> If you believe the official source itself is incorrect, we recommend contacting
> [source agency] directly. If you have further questions, please contact us at
> [CONTACT EMAIL — TBD]."

**If the request was rejected (no official source):**

> "Thank you for your correction request. We have reviewed the information you reported.
> We were unable to find an official source that supports the correction as described.
> Civic Voice Canada displays data sourced from official Canadian government publications
> and open-data sources. We are unable to update data without official source support.
>
> If you are able to provide a link to an official source, please resubmit and we will
> review again. If you have further questions, please contact us at [CONTACT EMAIL — TBD]."

**Communication notes:**
- Do not disclose the names of internal reviewers or details of the internal review
  process in communications to requesters.
- Do not make commitments about the timeline of future updates in requester communications.
- Retain a copy of all communications in the Correction Request Record.

---

## 15. Rejected or Unsupported Requests

A correction request is rejected when:

- The source evidence review confirms the app data is correct, or
- No official source supports the requester's claimed correction after a reasonable search.

**Step 15.1 — Document the rejection.**
Record the following in the Correction Request Record:

- The official source(s) reviewed
- The result of the source evidence review
- The specific reason the requester's claim could not be supported

**Step 15.2 — Do not suppress correct data.**
A rejected correction request must not result in the removal or modification of data
that has been confirmed correct. The temporary status label (if any was applied) must
be removed when the request is rejected.

**Step 15.3 — Communicate the outcome.**
If the requester provided contact details, send the "no change required" or "rejected"
communication per Section 14.

**Step 15.4 — Leave the record open if new evidence is likely.**
If the requester's claim relates to a dataset that is due to be refreshed in the next
monthly update cycle, note in the Correction Request Record that the data will be
re-checked at the next refresh. Do not close the record as "Rejected" if a source
refresh may resolve the issue.

---

## 16. Repeated, Abusive, or Bad-Faith Requests

**Step 16.1 — Identify repeated requests.**
If a requester submits substantially the same correction request more than twice after
receiving a documented response, the Compliance Lead may treat subsequent requests as
repeated and respond by reference to the earlier response record.

**Step 16.2 — Identify abusive or bad-faith requests.**
Requests that are abusive, threatening, harassing, or that appear designed to manipulate
app content rather than correct a genuine error are outside the scope of this procedure.
Such requests must be:

- Logged in the Correction Request Record with a note indicating the basis for the
  bad-faith determination.
- Escalated to the Founder if the request involves a legal threat or potential harassment.
- Not actioned in terms of changing app content.

**Step 16.3 — Do not change data in response to pressure.**
Civic Voice Canada must not change data in response to the volume or persistence of
requests if the source evidence review confirms the data is correct. Corrections are
based on official sources, not on the number or strength of requests.

---

## 17. Records Generated

---

### 17.1 Correction Request Record — Template

One record must be created per correction request. Records must be retained for at
least 3 years from the closure date.

| Field | Value |
|---|---|
| **Correction ID** | CV-COR-[YYYY]-[NNN] (e.g., CV-COR-2026-001) |
| **Date received** | |
| **Requester contact** | (if provided; may be blank for anonymous requests) |
| **Affected page / component** | |
| **Affected data item** | |
| **Jurisdiction** | (Federal / Provincial — specify province if applicable) |
| **Issue description** | |
| **Requester evidence / source** | |
| **Risk level** | Low / Medium / High / Critical |
| **Initial triage decision** | In scope / Out of scope / Escalated |
| **Temporary public display action** | Label applied / None required — specify label if applied |
| **Reviewer** | Name of Data Lead / second reviewer |
| **Verification evidence** | Source URL(s) reviewed; outcome of source evidence review |
| **Decision** | Correct — change required / Source refresh required / Source unavailable / Source ambiguous / No change required / Rejected — unsupported / Escalated |
| **Implementation action** | Description of Firestore write or UI change; collection and document ID if applicable |
| **Date corrected** | |
| **Requester response sent?** | Yes / No / Not applicable (anonymous) |
| **Closure status** | Open / Closed — corrected / Closed — no change required / Closed — rejected / Closed — escalated / Pending monthly refresh |
| **Notes** | Any additional context, linked records, or follow-up items |

---

### 17.2 Manual Review Register Update

If a temporary status label was applied, update the Manual Review Register with:

- Correction ID reference
- Data element flagged
- Label applied
- Date applied
- Date removed (when resolved)

---

### 17.3 Data Source Register Update

If the correction required a change to a registered source (new URL, new reporting
period, corrected licence, or source removal), update CV-REG-001 and record the change
in the register's change log.

---

### 17.4 Deviation Record

If the correction revealed that materially incorrect data was published — particularly
data about a named individual or organisation — create a Deviation Record documenting:

- Nature of the error
- How the error arose (extraction error, transformation error, wrong source, etc.)
- How long the incorrect data was displayed
- Corrective action taken
- Whether a process change is required to prevent recurrence

---

### 17.5 Monthly Update Log Reference

If the correction relates to a data element that is refreshed in the monthly update
cycle, add a reference in the next Monthly Update Log noting that the source or data
was corrected outside the normal cycle and that CV-REG-001 has been updated.

---

## 18. Timelines

| Risk Level | Acknowledge | Apply Temporary Label | Complete Source Review | Resolve / Close |
|---|---|---|---|---|
| **Critical** | Within 1 business day | Immediately (before review) | Within 2 business days | Within 5 business days or escalate |
| **High** | Within 3 business days | Within 1 business day | Within 5 business days | Within 10 business days |
| **Medium** | Within 3 business days | At Data Lead's discretion | Within 10 business days | Within 15 business days |
| **Low** | Within 3 business days | Not required | Within 15 business days | Within 30 business days |

Timelines are measured from the date the request was logged in the Correction Request
Record. If a timeline cannot be met, the Compliance Lead must notify the requester (if
contact details were provided) and record the reason for the delay.

---

## 19. Escalation

| Situation | Escalation Path |
|---|---|
| Critical risk correction | Founder and legal counsel, on receipt |
| Formal legal notice, defamation complaint, or regulatory inquiry | Founder and legal counsel, immediately |
| Privacy breach involving personal information about a named individual | Founder and legal counsel; assess notification obligation under PIPEDA |
| Correction that cannot be resolved by the Data Lead | Founder |
| Requester threatens legal action | Founder and legal counsel; do not communicate further until legal counsel advises |
| Request involves a sitting MP, Senator, or Cabinet Minister and carries reputational risk | Founder; consider legal counsel review |

Escalation does not pause the timeline unless the Founder or legal counsel directs
otherwise. The temporary status label must remain in place during escalation.

---

## 20. Approval

This procedure is approved when the Compliance Lead and Founder have reviewed it and
confirmed it accurately reflects the correction request process for Civic Voice Canada
at the time of public launch.

| Role | Name | Date |
|---|---|---|
| Compliance Lead | TBD | TBD |
| Data Lead | TBD | TBD |
| Founder | TBD | TBD |
| Legal Reviewer (if applicable) | TBD | TBD |

---

## Related Documents

| Document | Status |
|---|---|
| [CV-SOP-001 Data Verification SOP](CV-SOP-001%20Data%20Verification%20SOP.md) | Draft |
| [CV-SOP-002 Monthly Data Update SOP](CV-SOP-002%20Monthly%20Data%20Update%20SOP.md) | Draft |
| CV-REG-001 Data Source Register | TBD — to be created |
| [CV-POL-002 Data Sources and Attribution Policy](../policies/CV-POL-002%20Data%20Sources%20and%20Attribution%20Policy.md) | Draft |
| [CV-POL-003 Terms of Use](../policies/CV-POL-003%20Terms%20of%20Use.md) | Draft |
| [CV-POL-004 Public Disclaimer and Non-Affiliation Statement](../policies/CV-POL-004%20Public%20Disclaimer%20and%20Non-Affiliation%20Statement.md) | Draft |
| [CV-POL-001 Privacy Policy](../policies/CV-POL-001%20Privacy%20Policy.md) | Draft |
| [CV-REG-002 Privacy Data Map](../registers/CV-REG-002%20Privacy%20Data%20Map.md) | Draft |

---

> **Final Note:** This procedure is a draft and must be reviewed by the Compliance Lead
> and Founder before public launch of Civic Voice Canada. In particular, the Critical
> risk timelines, escalation contacts, and requester communication templates should be
> confirmed against available resources and legal counsel's advice before this procedure
> is put into operation.

---

## Change Log

| Version | Date | Author | Change |
|---|---|---|---|
| 0.1 | 2026-07-26 | Founder / Compliance Lead | Initial draft — Canadian launch scope |
