# CV-RPT-001 — Canadian Source Decision Summary

| Field | Value |
|---|---|
| **Document ID** | CV-RPT-001 |
| **Version** | 0.1 |
| **Status** | Draft |
| **Owner** | Founder / Data Lead |
| **Effective Date** | 2026-08-02 |
| **Scope** | Civic Voice Canada only — all 11 Canadian data sources |
| **Review Frequency** | After each Source Approval Batch; before public launch |
| **Related Documents** | CV-REG-001 Data Source Register · CV-CHK-005 Canadian Source Review Checklist · CV-SRC-REV-001 through CV-SRC-REV-011 · CV-IDX-001 Canadian Compliance Package Index · CV-REG-003 Open Issues Register |

---

> ⚠️ **DRAFT — NOT YET IN EFFECT**
>
> This report reflects the source decision state as of 2026-08-02 following Source
> Approval Batch 1 (Step 23) and Source Approval Batch 2 (Step 24). All source review
> decisions are Draft. No source has been fetched, verified, or written to Firestore.
> No source is cleared for public display until the launch blockers in Section 10 are
> resolved for each source individually.

---

## 1. Purpose

This report summarises the launch-readiness state of all 11 Canadian data sources
in CV-REG-001 following the completion of Source Approval Batch 1 and Source Approval
Batch 2. It provides:

- A consolidated source decision table showing the current decision, licence status,
  machine-readability, high-risk flag, and second-review requirement for each source
- Grouped analysis by decision type (Approved with Limitations, Public Registry, Manual
  Review Only, Pending Review)
- A unified high-risk source register with second-review requirements
- A clear statement of remaining launch blockers per source
- A required next actions list for the Data Lead before any source can be used for
  public display

This report is the single reference document for "what is the current source decision
state" and "what must still happen before each source can go live."

---

## 2. Scope

This report covers all 11 sources registered in CV-REG-001 Data Source Register as of
2026-08-02:

**Federal (7 sources):** SRC-FED-001 through SRC-FED-007  
**Ontario (4 sources):** SRC-ONT-001 through SRC-ONT-004

It does not cover sources from other Canadian provinces or territories, which are out
of scope for the current launch. It does not cover US, UK, or Australian sources.

---

## 3. Overall Source Review Status

| Metric | Count | Sources |
|---|---|---|
| **Total sources in register** | 11 | SRC-FED-001–007; SRC-ONT-001–004 |
| **Approved with Limitations** | 4 | SRC-FED-003; SRC-FED-004; SRC-ONT-001; SRC-ONT-002 |
| **Public Registry — Use with Attribution** | 4 | SRC-FED-002; SRC-FED-005; SRC-FED-006; SRC-ONT-003 |
| **Manual Review Only** | 2 | SRC-FED-007; SRC-ONT-004 |
| **Pending Review** | 1 | SRC-FED-001 |
| **Review Required (not yet reviewed)** | 0 | — |
| **High-risk sources** | 5 | SRC-FED-005; SRC-FED-006; SRC-FED-007; SRC-ONT-003; SRC-ONT-004 |
| **Second review required before display** | 5 | SRC-FED-005; SRC-FED-006; SRC-FED-007; SRC-ONT-003; SRC-ONT-004 |
| **Second reviewer assigned** | 0 | All pending assignment |
| **Sources fetched** | 3 | SRC-FED-001 (CV-DATA-002 unemployment), SRC-FED-002 (CV-DATA-008 CRA Charities), SRC-ONT-002 (CV-DATA-014 Ontario Transfer Payments) |
| **Sources verified (CV-REC-001 complete)** | 2 | CV-DATA-002 (CV-REC-001 2026-08-03); CV-DATA-008 (CV-REC-001 2026-08-03). CV-DATA-014 audit completed 2026-08-04 (existing data verified — no separate CV-REC-001 raised as data was previously written). |
| **Sources cleared for public display** | 3 | SRC-FED-001 (unemployment — written, verified); SRC-FED-002 (CRA Charities — written, verified); SRC-ONT-002 (Ontario Transfer Payments — written, audit-confirmed, MVP approved with purpose-filter control) |

> **Key finding:** Licence/terms decisions are confirmed for all 11 sources. However,
> no source is ready for public display because no source has been fetched, verified,
> mapped to a Firestore collection, or confirmed in an app display location.
> All 11 sources have open issues that must be resolved before public display.

---

## 4. Source Decision Summary Table

| Source ID | Source Name | Jurisdiction | Decision | Licence / Terms Status | Verification Status | Machine Readable? | High-Risk? | Second Review Required? | Launch Use Status | Related Source Review Record |
|---|---|---|---|---|---|---|---|---|---|---|
| SRC-FED-001 | Statistics Canada Key Indicators | Federal | **Pending Review** | Approved (Statistics Canada Open Licence) | Not yet fetched | Yes (API / CSV — per specific dataset) | No | No | ❌ Not ready — specific datasets/indicators not defined | CV-SRC-REV-001 |
| SRC-FED-002 | CRA Charities Registry | Federal | **Public Registry — Use with Attribution** | Approved (OGL-Canada 2.0 — open.canada.ca path) | Not yet fetched | Yes (data.ontario.ca CSV) | No (unless director names displayed) | No (unless director names displayed) | ❌ Not ready — dataset URL, reporting period, transformation, Firestore, display TBD | CV-SRC-REV-002 |
| SRC-FED-003 | Government of Canada Federal Budget | Federal | **Approved with Limitations** | Approved (OGL-Canada 2.0) | Not yet fetched | Yes (Fiscal Reference Tables XLSX) / Partial (PDF) | No | No | ❌ Not ready — budget year, fetch date, Firestore, display TBD | CV-SRC-REV-003 |
| SRC-FED-004 | Public Accounts of Canada | Federal | **Approved with Limitations** | Approved (OGL-Canada 2.0) | Not yet fetched | Yes (proactive disclosure CSV) / Partial (PDF) | No | No | ❌ Not ready — fiscal year, dataset ID, Firestore, display TBD | CV-SRC-REV-004 |
| SRC-FED-005 | Registry of Lobbyists | Federal | **Public Registry — Use with Attribution** | Approved (OGL-Canada 2.0) | Not yet fetched | Yes (bulk CSV download) | **Yes — High-Risk** | **Yes — second reviewer required for named-DPOH display** | ❌ Not ready — second reviewer unassigned; bulk CSV file URL, transformation, Firestore, display TBD | CV-SRC-REV-005 |
| SRC-FED-006 | Elections Canada — Results and Campaign Finance | Federal | **Public Registry — Use with Attribution** | Approved (OGL-Canada 2.0) | Not yet fetched | Yes (results CSV/XML) / Partial (campaign finance) | **Yes — High-Risk (campaign finance / named donors)** | **Yes — second reviewer required for named donor / campaign finance display** | ❌ Not ready — second reviewer unassigned; specific file URLs, named donor scope, Firestore, display TBD | CV-SRC-REV-006 |
| SRC-FED-007 | Office of the Conflict of Interest and Ethics Commissioner | Federal | **Manual Review Only** | Public Registry (Parliament website terms — OGL-Canada does not apply) | Not yet fetched | **No — PDF/HTML only** | **Yes — Highest Risk** | **Yes — mandatory per record, no exceptions** | ❌ Not ready — second reviewer unassigned; per-record manual workflow not designed; Parliament terms to confirm; Firestore, display TBD | CV-SRC-REV-007 |
| SRC-ONT-001 | Ontario Budget | Ontario | **Approved with Limitations** | Approved (OGL-Ontario) | Not yet fetched | Yes (data.ontario.ca CSV/XLSX) / Partial (PDF) | No | No | ❌ Not ready — budget year, data.ontario.ca availability, Firestore, display TBD | CV-SRC-REV-008 |
| SRC-ONT-002 | Ontario Public Accounts / Transfer Payments | Ontario | **Approved with Limitations** | Approved (OGL-Ontario) | **Fetched 2026-05-17 · Audit 2026-08-04 · MVP Approved with controls** | Yes (data.ontario.ca Public Accounts Detailed Schedule of Payments CSV) | No | No | ✅ **Written to `subnational_grants/CA-ON`** — FY 2024-25 · 100 records · all transfer payment rows confirmed · purpose-filter control required on future refreshes | CV-SRC-REV-009 |
| SRC-ONT-003 | Ontario Public Sector Salary Disclosure ("Sunshine List") | Ontario | **Public Registry — Use with Attribution** | Approved (OGL-Ontario) | Not yet fetched | Yes (data.ontario.ca CSV) | **Yes — High-Risk** | **Yes — second reviewer required** | ❌ Not ready — second reviewer unassigned; Privacy Commissioner guidance not reviewed; calendar year, Firestore, display TBD | CV-SRC-REV-010 |
| SRC-ONT-004 | Office of the Integrity Commissioner of Ontario | Ontario | **Manual Review Only** | Public Registry (Ontario Legislature / oico.on.ca terms — OGL-Ontario does not automatically apply) | Not yet fetched | **No — PDF/HTML only** | **Yes — Highest Risk** | **Yes — mandatory per record, no exceptions** | ❌ Not ready — second reviewer unassigned; per-record manual workflow not designed; oico.on.ca terms to confirm; Firestore, display TBD | CV-SRC-REV-011 |

---

## 5. Sources: Approved with Limitations (4)

These sources have confirmed OGL-Canada 2.0 or OGL-Ontario licences and are suitable
for display with attribution and the limitations documented in their source review
records. They are not high-risk (no named individuals or sensitive official findings).
They are not cleared for display until fetch, verification, and Firestore mapping are
complete.

### SRC-FED-003 — Government of Canada Federal Budget
- **Licence:** OGL-Canada 2.0 (Approved)
- **Preferred path:** Fiscal Reference Tables XLSX (machine-readable: Yes). PDF budget documents are the fallback (Partial).
- **Attribution:** "Source: Department of Finance Canada — Federal Budget [year], Government of Canada. Contains information licensed under the Open Government Licence – Canada. Fetched [date]."
- **Key open items:** Budget year in scope; exact XLSX URL; transformation design (departmental grouping); Firestore collection; app display location.
- **Limitation:** Aggregate fiscal data only. No named individual data. No editorial commentary on policy effectiveness.

### SRC-FED-004 — Public Accounts of Canada
- **Licence:** OGL-Canada 2.0 (Approved)
- **Preferred path:** Proactive disclosure grants/contributions CSV on open.canada.ca (machine-readable: Yes). PDF Public Accounts volumes are the fallback (Partial).
- **Attribution:** "Source: Receiver General for Canada — Public Accounts of Canada [fiscal year], Government of Canada. Contains information licensed under the Open Government Licence – Canada. Fetched [date]." Proactive disclosure path: "Source: Government of Canada — Proactive Disclosure: Grants and Contributions [fiscal year], open.canada.ca. Contains information licensed under the Open Government Licence – Canada. Fetched [date]."
- **Key open items:** Fiscal year; confirm exact open.canada.ca dataset ID; transformation design (departmental grouping); Firestore collection; app display location.
- **Limitation:** Aggregate financial and grants data only. No named individual data.

### SRC-ONT-001 — Ontario Budget
- **Licence:** OGL-Ontario (Approved)
- **Preferred path:** data.ontario.ca CSV/XLSX if available for the applicable year (machine-readable: Yes). PDF Ontario Budget documents are the fallback (Partial).
- **Attribution:** "Source: Ontario Ministry of Finance — Ontario Budget [year], Government of Ontario. Contains information licensed under the Open Government Licence – Ontario. Fetched [date]."
- **Key open items:** Budget year; confirm data.ontario.ca CSV availability for applicable year; transformation design; Firestore collection; app display location.
- **Limitation:** Aggregate fiscal data only. No named individual data.

### SRC-ONT-002 — Ontario Public Accounts / Transfer Payments
- **Licence:** OGL-Ontario (Approved)
- **Dataset:** Ontario Public Accounts — Detailed Schedule of Payments (data.ontario.ca)
- **Dataset URL:** https://data.ontario.ca/dataset/public-accounts-detailed-schedule-of-payments
- **Resource ID:** `1677dc37-00e5-437a-bb39-c918b243f9a9`
- **Reporting period:** FY 2024-25 (April 2024 – March 2025)
- **Fetched:** 2026-05-17T01:19:15Z
- **Firestore path:** `subnational_grants/CA-ON` — **written**
- **Status:** MVP Approved with controls — written to Firestore, audit confirmed 2026-08-04
- **Attribution:** "Source: Government of Ontario — Ontario Public Accounts, Detailed Schedule of Payments, FY 2024-25 (data.ontario.ca). Contains information licensed under the Open Government Licence – Ontario. Fetched 2026-05-17."
- **Audit result (2026-08-04):** 100 records. Purpose distribution: Government Transfer (62), Operating Transfer Payments (36), Capital Transfer Payments (2). Zero debt service, vendor/procurement, or OHIP/drug benefit rows. All recipients are universities, municipalities, social service organisations, agricultural agencies, or economic development recipients.
- **Refresh control (mandatory):** Future refreshes must filter the raw Public Accounts CSV by `purpose` values: `Government Transfer`, `Operating Transfer Payments`, `Capital Transfer Payments`. Do not use raw top-100 by amount without purpose filter.
- **UI label:** "Grants" is acceptable for MVP. "Transfer Payments" is more precise and may be adopted in a future UI iteration.
- **Limitation:** Aggregate transfers to organisations only. No named individual data. Aggregated bucket row ("Accounts Under $120,000") is present — may be excluded or noted on future refresh per product preference.

---

## 6. Public Registry Sources (4)

These sources are statutory public registries published under open government licences.
They are suitable for display with attribution and the strict display rules documented
in each source review record. Three of the four are high-risk (see Section 9).

### SRC-FED-002 — CRA Charities Registry
- **Licence:** OGL-Canada 2.0 — open.canada.ca path (Approved)
- **Machine-readable:** Yes (open.canada.ca registered charities CSV)
- **Attribution:** "Source: Canada Revenue Agency — Registered Charities database, Government of Canada (open.canada.ca). Contains information licensed under the Open Government Licence – Canada. Data reflects T3010 filings for [fiscal year]. Fetched [date]."
- **Display rules:** Factual registered status, registration number, name, and category only. Do not display director names without a separate privacy assessment. No charity effectiveness ratings, spending ratios, or donation recommendations.
- **Key open items:** Confirm exact open.canada.ca dataset ID and URL; confirm T3010 filing year in scope; determine whether director names are in scope (if yes, complete privacy assessment); transformation design; Firestore collection; app display location.
- **Risk level:** Low (organisation data). Medium if director names are displayed.

### SRC-FED-005 — Registry of Lobbyists *(High-Risk)*
- **Licence:** OGL-Canada 2.0 (Approved)
- **Machine-readable:** Yes (bulk CSV download — lobbycanada.gc.ca/en/open-data/)
- **Attribution:** "Source: Office of the Commissioner of Lobbying of Canada — Registry of Lobbyists (lobbycanada.gc.ca). Contains information licensed under the Open Government Licence – Canada. Data current as of [fetched date]."
- **Display rules:** Display only what the official registry states — registrant name, client, subject matter, DPOHs contacted, filing date. Never infer or imply influence, access, corruption, or improper conduct. Never combine with other sources to create composite influence scores or reputational rankings.
- **Required disclaimer:** "Lobbying disclosure information from the Registry of Lobbyists (Office of the Commissioner of Lobbying of Canada). Lobbying is a legal, regulated activity. This data reflects statutory disclosure filings and does not imply improper conduct, undue influence, or wrongdoing by any registrant or public official."
- **Key open items:** Confirm bulk CSV file URL; assign second reviewer; confirm transformation design (no prohibited aggregations); CV-REG-002 update; Firestore collection; app display location.
- **Second reviewer required:** Yes — before named-DPOH or communication-report data is displayed.

### SRC-FED-006 — Elections Canada *(High-Risk — campaign finance sub-category)*
- **Licence:** OGL-Canada 2.0 (Approved)
- **Machine-readable:** Yes (election results CSV/XML); Partial (campaign finance — some PDF)
- **Attribution (election results):** "Source: Elections Canada — [Election name] results (elections.ca). Contains information licensed under the Open Government Licence – Canada. Fetched [date]."
- **Attribution (campaign finance):** "Source: Elections Canada — Political Entities Financial Returns (elections.ca). Contains information licensed under the Open Government Licence – Canada. Financial return data for [election/fiscal year]. Fetched [date]."
- **Display rules:** Election results as factual outcomes only. Campaign finance as factual filed return data only. No voting recommendations, implied endorsements, or allegations of electoral misconduct. Named donors only above the statutory disclosure threshold, sourced directly from official Elections Canada filings.
- **Required disclaimer:** "Electoral results and campaign finance data from Elections Canada (elections.ca). This data reflects official filed returns. Civic Voice Canada does not imply endorsement, recommend candidates or parties, or suggest electoral misconduct."
- **Key open items:** Confirm specific open data file URL(s) for 45th General Election results; confirm campaign finance return availability and file format; assign second reviewer (required for named-donor/campaign finance display); confirm named donor scope; CV-REG-002 update; Firestore collection; app display location.
- **Second reviewer required:** Yes — before named donor or campaign finance data is displayed.

### SRC-ONT-003 — Ontario Public Sector Salary Disclosure ("Sunshine List") *(High-Risk)*
- **Licence:** OGL-Ontario (Approved)
- **Machine-readable:** Yes (data.ontario.ca CSV)
- **Attribution:** "Source: Government of Ontario — Public Sector Salary Disclosure [year] (data.ontario.ca). Contains information licensed under the Open Government Licence – Ontario. Fetched [date]."
- **Display rules:** Display only the exact disclosed salary and taxable benefits as published — no rounding, estimation, or modification. Display only: name, employer, job title/position, salary paid, taxable benefits. No commentary on salary fairness or appropriateness. No comparison across individuals implying editorial judgement. No combination with other sources to create composite individual profiles.
- **Required disclaimer:** "Salary and benefit information from the Ontario Public Sector Salary Disclosure Act. Data is published annually by the Government of Ontario. Civic Voice Canada does not comment on the fairness or appropriateness of any individual's compensation."
- **Key open items:** Review Ontario Privacy Commissioner guidance on Sunshine List secondary use; assign second reviewer; confirm exact data.ontario.ca dataset URL and calendar year; transformation design (no editorial rankings); CV-REG-002 update; Firestore collection; app display location.
- **Second reviewer required:** Yes — before any named salary data is displayed.

---

## 7. Manual Review Only Sources (2)

These sources are available as PDF and HTML only with no machine-readable export. Every
record must be manually extracted, verified against the official report, and reviewed by
a second reviewer before it is entered into Firestore or displayed in the app. These
sources must not be used in automated data pipelines. They are the highest-risk sources
in the Civic Voice Canada dataset.

### SRC-FED-007 — Office of the Conflict of Interest and Ethics Commissioner *(Highest Risk)*
- **Licence / Terms:** Public Registry — Parliament of Canada website terms apply (OGL-Canada does not automatically apply). Terms permit reproduction of public accountability documents with attribution. Confirm full Parliament terms at parl.gc.ca/SiteInformation/Terms.
- **Machine-readable:** No — PDF/HTML only on ciec-ccie.parl.gc.ca
- **Attribution:** "Source: Office of the Conflict of Interest and Ethics Commissioner of Canada (ciec-ccie.parl.gc.ca). [Report name and date]. [Direct link to official report.]"
- **Display rules:** Display only the exact finding as stated in the official published report. Never paraphrase, summarize, or editorialize a finding. Link to the official report for every displayed finding. CV-POL-004 disclaimer on every page. Never infer guilt, wrongdoing, or misconduct beyond what the report explicitly states.
- **Required disclaimer:** "Ethics and conflict of interest disclosure information from the Office of the Conflict of Interest and Ethics Commissioner of Canada. Findings reflect official reports as published. Civic Voice Canada does not editorialize about or extend the Commissioner's findings."
- **Per-record workflow required:** (1) Navigate to ciec-ccie.parl.gc.ca; (2) identify the relevant official report; (3) extract finding text; (4) verify against original; (5) record official report URL; (6) submit to second reviewer; (7) second reviewer approves; (8) then — and only then — write to Firestore.
- **Key open items:** Confirm Parliament of Canada website terms for reuse; assign second reviewer (mandatory); confirm Parliament session/date range in scope; design per-record extraction workflow; CV-REG-002 update; Firestore schema (official report URL as required field); app display location.
- **Second reviewer required:** Mandatory — no exceptions — per individual record.

### SRC-ONT-004 — Office of the Integrity Commissioner of Ontario *(Highest Risk)*
- **Licence / Terms:** Public Registry — Ontario Legislature / oico.on.ca terms apply (OGL-Ontario does not automatically apply). Confirm oico.on.ca terms of use before any display.
- **Machine-readable:** No — PDF/HTML only on oico.on.ca
- **Attribution:** "Source: Office of the Integrity Commissioner of Ontario (oico.on.ca). [Report name and date]. [Direct link to official report.]"
- **Display rules:** Display only the exact finding as stated in the official published report. Never paraphrase, summarize, or editorialize a finding. Link to the official oico.on.ca report for every displayed finding. CV-POL-004 disclaimer on every page. Never infer guilt, wrongdoing, or misconduct beyond what the report explicitly states.
- **Required disclaimer:** "Integrity inquiry findings and disclosure information from the Office of the Integrity Commissioner of Ontario. Findings reflect official reports as published. Civic Voice Canada does not editorialize about or extend the Commissioner's findings."
- **Per-record workflow required:** (1) Navigate to oico.on.ca; (2) identify the relevant official report; (3) extract finding text; (4) verify against original; (5) record official report URL; (6) submit to second reviewer; (7) second reviewer approves; (8) then — and only then — write to Firestore.
- **Provincial parallel:** This source is the Ontario equivalent of SRC-FED-007. Hold to the same highest-risk standard.
- **Key open items:** Confirm oico.on.ca terms of use; assign second reviewer (mandatory); confirm Legislature session in scope; design per-record extraction workflow; CV-REG-002 update; Firestore schema (oico.on.ca report URL as required field); app display location.
- **Second reviewer required:** Mandatory — no exceptions — per individual record.

---

## 8. Pending Review Sources (1)

### SRC-FED-001 — Statistics Canada Key Indicators *(Pending Review)*

This source is the only source that remains at Pending Review after Batches 1 and 2.

**Why Pending Review despite a confirmed licence:** The Statistics Canada Open Licence
is confirmed Approved (Step 23). The source owner, URL structure (statcan.gc.ca / API),
and machine-readability are confirmed. However, this source is unique among the 11 in
that **no specific dataset(s) or indicator(s) have been selected**. Statistics Canada
publishes thousands of datasets. Without knowing which specific indicators will be
displayed (e.g., CPI, unemployment rate, GDP growth by quarter), it is impossible to:

- Confirm the exact dataset URL and table number
- Confirm the reporting period and update frequency
- Confirm the fetch method (API endpoint vs CSV download)
- Confirm the Firestore collection schema
- Confirm the app display location and metric labels
- Complete ELG-06 (civic relevance eligibility) for the specific dataset

**Required to advance from Pending Review:** The Founder / Product Lead must select
the specific Statistics Canada datasets / indicators that will be displayed in the app.
Once selected, a supplemental review of those specific datasets should be completed
against the CV-CHK-005 framework (the licence review is already done — this would
focus on dataset-level eligibility, reporting period, fetch method, and Firestore mapping).

**This is not a licence or risk issue.** It is a product scope decision that has not
yet been made.

---

## 9. High-Risk Sources and Second Review Requirements

The following 5 sources are flagged as high-risk and require a second reviewer before
any named individual, DPOH, official finding, or salary data is displayed publicly.

**No second reviewer has been assigned for any source as of 2026-08-02.**

| Source ID | Source Name | Risk Level | Why High-Risk | Second Review Trigger | Second Review Scope |
|---|---|---|---|---|---|
| SRC-FED-005 | Registry of Lobbyists | High-Risk | Named lobbyists and Designated Public Office Holders (DPOHs). Risk of misrepresentation as corruption or undue influence if display framing is inaccurate. | Before any named-DPOH or communication-report data is displayed | Second reviewer confirms: display framing is factual; no prohibited editorial language; no "influence scores" or prohibited aggregations; disclaimer placement |
| SRC-FED-006 | Elections Canada | High-Risk (campaign finance / named donors) | Named candidates (election results) and named donors above statutory disclosure threshold (campaign finance). | Before any named-donor or campaign-finance return data is displayed. Election results (no named donors) may proceed without second reviewer if displayed as factual riding-level outcomes only. | Second reviewer confirms: named donor display is above statutory threshold; sourced from official Elections Canada filing; no implied illegality; disclaimer placement |
| SRC-FED-007 | Federal Ethics Commissioner | Highest Risk | Named public office holders in formal examination findings. Inaccurate or misattributed display causes serious irreversible reputational harm. | Before every individual finding is entered into Firestore or displayed | Second reviewer confirms: exact quote matches official published report; official report URL linked; no editorial labels beyond report language; no misattribution |
| SRC-ONT-003 | Ontario Sunshine List | High-Risk | Named public sector employees with exact annual salaries and taxable benefits. Privacy Commissioner guidance on secondary use applies. | Before any named salary data is displayed | Second reviewer confirms: figures match official disclosure exactly; no rounding or estimation; no editorial salary commentary; Ontario Privacy Commissioner guidance reviewed; disclaimer placement |
| SRC-ONT-004 | Ontario Integrity Commissioner | Highest Risk | Named Ontario MPPs in formal integrity inquiry findings. Inaccurate or misattributed display causes serious irreversible reputational harm. | Before every individual finding is entered into Firestore or displayed | Second reviewer confirms: exact quote matches official published report; official oico.on.ca report URL linked; no editorial labels beyond report language; no misattribution |

### Second Reviewer Assignment: Open Action

> **Critical open action:** A second reviewer must be assigned for each of the five
> high-risk sources before any of their data can be displayed. The second reviewer must
> be a named individual (not "TBD") who has confirmed availability and has reviewed the
> display rules for the source they are reviewing.
>
> For SRC-FED-007 and SRC-ONT-004 (Manual Review Only), the second reviewer must be
> present for every individual record — not just a one-time approval of the display
> framework.

---

## 10. Launch Blockers

No source is cleared for public display as of 2026-08-02. For a source to be cleared
for public display, **all of the following must be completed** for that specific source:

| # | Launch-Readiness Condition | Status for All Sources |
|---|---|---|
| 1 | Source decision is Approved with Limitations, Public Registry, or Manual Review Only (not Pending Review) | ✅ 10 of 11 complete (SRC-FED-001 still Pending Review) |
| 2 | Exact launch dataset / table / report URL is confirmed | ❌ None confirmed |
| 3 | Specific reporting period for the launched dataset is confirmed | ❌ None confirmed (all TBD) |
| 4 | First fetch executed and fetch date recorded in CV-REG-001 | ❌ None fetched |
| 5 | Firestore collection name and schema confirmed | ❌ None confirmed |
| 6 | App display location confirmed | ❌ None confirmed |
| 7 | Attribution wording finalised for the specific dataset and populated in the app UI | ❌ None finalised |
| 8 | CV-REC-001 Data Verification Checklist completed for the specific dataset | ❌ None completed |
| 9 | Second review completed by named second reviewer (high-risk sources only) | ❌ No second reviewers assigned (5 sources require this) |
| 10 | For Manual Review Only sources (SRC-FED-007, SRC-ONT-004): per-record extraction workflow designed and documented | ❌ Not yet designed |
| 11 | CV-REG-002 Privacy Data Map updated for sources containing named personal information (SRC-FED-005, 006, 007; SRC-ONT-003, 004) | ❌ Not yet updated |
| 12 | CV-POL-004 disclaimer wording confirmed and implemented in the app UI for applicable pages | ❌ Not yet implemented |

**Additional source-specific launch blockers:**

| Source | Source-Specific Blocker |
|---|---|
| SRC-FED-001 | Specific indicator(s)/dataset(s) not selected — product decision required |
| SRC-FED-002 | Director name scope decision required (if in scope: complete privacy assessment) |
| SRC-FED-005 | Second reviewer not assigned; bulk CSV file URL not confirmed |
| SRC-FED-006 | Second reviewer not assigned; named-donor scope decision; campaign finance return availability confirmation |
| SRC-FED-007 | Second reviewer not assigned; Parliament website terms not confirmed; per-record workflow not designed |
| SRC-ONT-003 | Second reviewer not assigned; Ontario Privacy Commissioner guidance not reviewed |
| SRC-ONT-004 | Second reviewer not assigned; oico.on.ca terms not confirmed; per-record workflow not designed |

---

## 11. Required Next Actions

The following actions are required before any source can move from "not ready" to
"cleared for public display." Actions are listed in priority order.

### Immediate Actions (prerequisite for all sources)

| # | Action | Owner | Depends On |
|---|---|---|---|
| 1 | **Assign second reviewers** for all 5 high-risk sources (SRC-FED-005, 006, 007; SRC-ONT-003, 004) | Founder | — |
| 2 | **Select specific Statistics Canada indicators/datasets** that will be displayed (SRC-FED-001) | Founder / Product Lead | — |
| 3 | **Design per-record manual extraction and verification workflows** for SRC-FED-007 and SRC-ONT-004 | Data Lead | Second reviewer assignment |
| 4 | **Review Ontario Privacy Commissioner guidance** on Sunshine List secondary use (SRC-ONT-003) | Privacy Lead | — |

### Per-Source Pre-Fetch Actions (for each source in launch scope)

| # | Action | Applies To |
|---|---|---|
| 5 | Confirm exact dataset/file URL | All sources |
| 6 | Confirm specific reporting period (year, quarter, filing cycle) | All sources |
| 7 | Confirm data.ontario.ca CSV availability for applicable year (budget sources) | SRC-ONT-001 |
| 8 | Confirm exact open.canada.ca dataset IDs | SRC-FED-002, SRC-FED-004 |
| 9 | Confirm Parliament website terms for reuse | SRC-FED-007 |
| 10 | Confirm oico.on.ca terms of use | SRC-ONT-004 |
| 11 | Determine whether director names are in scope; if yes, complete privacy assessment | SRC-FED-002 |
| 12 | Determine named donor display scope for campaign finance | SRC-FED-006 |

### Per-Source Fetch and Verification Actions

| # | Action | Applies To |
|---|---|---|
| 13 | Execute first data fetch; record fetch date in CV-REG-001 | All sources |
| 14 | Spot-check 3–5 records against official source at first fetch | All sources |
| 15 | Complete CV-REC-001 Data Verification Checklist for each dataset | All sources |
| 16 | Second reviewer reviews data sample and display framing | SRC-FED-005, 006, 007; SRC-ONT-003, 004 |

### App and Firestore Actions

| # | Action | Applies To |
|---|---|---|
| 17 | Confirm Firestore collection name and schema for each source | All sources |
| 18 | Confirm app display location for each source | All sources |
| 19 | Finalise attribution wording for each specific dataset and implement in UI | All sources |
| 20 | Implement CV-POL-004 disclaimer on all high-risk source display pages | SRC-FED-005, 006, 007; SRC-ONT-003, 004 |
| 21 | Update CV-REG-002 Privacy Data Map for named personal information sources | SRC-FED-005, 006, 007; SRC-ONT-003, 004 |
| 22 | Update CV-REG-001 Verification Status from Needs Review to Verified for each dataset after CV-REC-001 is complete | All sources |

---

## 12. Approval

This report is considered complete when:

1. All source decisions in the summary table (Section 4) are confirmed and current.
2. All launch blockers in Section 10 have been assigned an owner and target date.
3. The Data Lead and Founder have signed off below.

This report must be updated after each Source Approval Batch and before public launch.

| Role | Name | Date |
|---|---|---|
| Primary Reviewer | Founder / Data Lead | 2026-08-02 |
| Data Lead sign-off | TBD | TBD |
| Founder | TBD | TBD |

---

## Change Log

| Version | Date | Author | Change |
|---|---|---|---|
| 0.1 | 2026-08-02 | Founder / Data Lead | Initial report — reflects state after Source Approval Batch 1 (Step 23) and Source Approval Batch 2 (Step 24). All 11 sources reviewed; 10 have confirmed decisions; 1 (SRC-FED-001) remains Pending Review. No source is cleared for public display. |
