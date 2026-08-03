# CV-LAUNCH-DEC-001 — Minimum Canadian Launch Dataset Scope Decision

| Field | Value |
|---|---|
| **Document ID** | CV-LAUNCH-DEC-001 |
| **Version** | 0.1 |
| **Status** | Draft |
| **Decision Type** | Launch Scope — Minimum Dataset Selection |
| **Owner** | Founder / Product Lead · Founder / Data Lead |
| **Decision Date** | 2026-08-02 |
| **Effective Date** | TBD — pending Statistics Canada table selection and verification |
| **Scope** | Civic Voice Canada — first Canadian public launch only |
| **Related Documents** | CV-PLAN-003 Canadian Launch Dataset Selection Plan · CV-REG-001 Data Source Register · CV-RPT-001 Canadian Source Decision Summary · CV-SRC-REV-001 · CV-SRC-REV-002 · CV-SRC-REV-008 · CV-SRC-REV-009 · CV-REG-003 Open Issues Register · CV-IDX-001 Canadian Compliance Package Index |

---

> ⚠️ **DRAFT — NOT YET IN EFFECT**
>
> This decision record is a working draft. Selected datasets are not yet verified or
> cleared for public display. All verification conditions in Section 8 must be met for
> each dataset individually before it is fetched, written to Firestore, or displayed.
>
> **Selected does not mean ready to display.** It means the dataset is confirmed in
> scope for the first launch and should proceed through the verification pipeline.

---

## 1. Purpose

This record documents the Founder's decision on the minimum dataset scope for the first
Canadian public launch of Civic Voice Canada. It answers the question:

> **Which datasets will be included in the first public launch, and which are
> deliberately deferred to post-launch?**

This decision exists so that:

- The Data Lead has a confirmed, bounded dataset list to prepare for verification.
- High-risk datasets requiring second reviewers do not block the first launch.
- Manual Review Only sources are not part of the initial launch pipeline.
- The first launch proves the source-fetch-verify-display workflow on a small,
  lower-risk dataset set before expanding to more complex sources.
- The compliance package documents this decision explicitly rather than allowing the
  launch scope to drift by default.

---

## 2. Scope

This decision covers all 16 dataset candidates in CV-PLAN-003 (CV-DATA-001 through
CV-DATA-016). Each dataset is assigned one of three statuses:

| Status | Meaning |
|---|---|
| **Selected with Limitations** | Confirmed for first launch. Must complete all verification conditions (Section 8) before display. May have source or display limitations noted. |
| **Pending Dataset Definition** | Intended for first launch but cannot be Selected until an outstanding definition decision is made (specifically: Statistics Canada exact table selection). |
| **Deferred — Post-Launch** | Deliberately excluded from the first launch. May be added after the first launch once the workflow is proven and/or the specific blockers are resolved. |

---

## 3. Launch Dataset Decision

### Summary

| Category | Count | Dataset IDs |
|---|---|---|
| **Selected with Limitations** | 3 | CV-DATA-008, CV-DATA-013, CV-DATA-014 |
| **Pending Dataset Definition (intended for launch)** | 2 | CV-DATA-001, CV-DATA-002 |
| **Deferred — Post-Launch** | 11 | CV-DATA-003–007, CV-DATA-009–012, CV-DATA-015–016 |

**Total launch scope:** 5 datasets (3 confirmed + 2 pending Statistics Canada table selection)

**Deferred:** 11 datasets — all high-risk, all Manual Review Only, all PDF-fallback paths, and all federal non-budget sources except CRA Charities.

---

## 4. Selected Launch Datasets

### CV-DATA-001 — Statistics Canada Population Indicator
**Status: Pending Dataset Definition (intended for launch)**

| Field | Value |
|---|---|
| **Related Source ID** | SRC-FED-001 |
| **Source decision** | Pending Review — licence Approved (Statistics Canada Open Licence); specific table not yet selected |
| **Intended use** | Population or demographic indicator providing civic context |
| **Candidate table** | Table 17-10-0005-01 (Population estimates by province/territory) or equivalent annual population indicator |
| **Why selected** | Low-risk aggregate statistical data. No named individuals. Confirms Statistics Canada integration at launch. |
| **Remaining decision** | **Founder / Product Lead must confirm exact Statistics Canada table number and indicator name before this is marked Selected.** |
| **Fetch method** | Statistics Canada Web Data Service API (preferred) or CSV download |
| **Machine-readable** | Yes |
| **High-risk** | No |
| **Second review** | No |
| **CV-REC-001 required** | Yes |

---

### CV-DATA-002 — Statistics Canada Unemployment / Labour Force Indicator
**Status: Pending Dataset Definition (intended for launch)**

| Field | Value |
|---|---|
| **Related Source ID** | SRC-FED-001 |
| **Source decision** | Pending Review — licence Approved; specific table not yet selected |
| **Intended use** | Labour force context indicator — unemployment rate or employment rate |
| **Candidate table** | Table 14-10-0287-01 (Labour Force Survey — unemployment rate, employment rate, participation rate) or equivalent |
| **Why selected** | Low-risk aggregate statistical data. No named individuals. High civic relevance. |
| **Remaining decision** | **Founder / Product Lead must confirm exact table number before this is marked Selected.** |
| **Fetch method** | Statistics Canada Web Data Service API (preferred) or CSV download |
| **Machine-readable** | Yes |
| **High-risk** | No |
| **Second review** | No |
| **CV-REC-001 required** | Yes |

---

### CV-DATA-008 — CRA Charities Registry Extract
**Status: Selected with Limitations**

| Field | Value |
|---|---|
| **Related Source ID** | SRC-FED-002 |
| **Source decision** | Public Registry — Use with Attribution (OGL-Canada 2.0) |
| **Exact dataset** | Registered Charities database — open.canada.ca CSV extract (confirm exact dataset ID at fetch) |
| **Intended use** | Charity registered status, registration number, name, category — searchable or filterable by province |
| **Why selected** | Public registry data — factual, low-risk at organisation level. No named individuals unless director names are included (explicitly excluded from launch scope — see Limitation). |
| **Limitation** | **Director names are excluded from the first launch scope.** Display only: charity name, registration number, status (active/revoked/annulled), category, fiscal year-end. Director name display requires a separate privacy assessment and is deferred. |
| **Reporting period** | Most recent T3010 filing year available at time of fetch — confirm at fetch |
| **Fetch method** | CSV download from open.canada.ca (confirm exact dataset ID) |
| **Machine-readable** | Yes (CSV) |
| **High-risk** | No (organisation-level data only; director names excluded) |
| **Second review** | No (director names excluded) |
| **CV-REC-001 required** | Yes |
| **Attribution** | "Source: Canada Revenue Agency — Registered Charities database, Government of Canada (open.canada.ca). Contains information licensed under the Open Government Licence – Canada. Data reflects T3010 filings for [fiscal year]. Fetched [date]." |

---

### CV-DATA-013 — Ontario Budget
**Status: Selected with Limitations**

| Field | Value |
|---|---|
| **Related Source ID** | SRC-ONT-001 |
| **Source decision** | Approved with Limitations (OGL-Ontario) |
| **Exact dataset** | Ontario Budget data — data.ontario.ca CSV/XLSX if available; fallback: PDF from ontario.ca |
| **Intended use** | Ontario budget summary figures — revenues, expenditures by ministry or program |
| **Why selected** | Machine-readable open data, OGL-Ontario approved, no named individuals, directly relevant to Ontario civic context. |
| **Limitation** | Confirm data.ontario.ca CSV/XLSX availability for the applicable budget year before fetch. If only PDF is available, assess whether manual extraction is acceptable for launch or defer to post-launch. |
| **Reporting period** | Most recent Ontario budget year — confirm exact year at fetch |
| **Fetch method** | CSV/XLSX from data.ontario.ca (preferred); PDF from ontario.ca (fallback) |
| **Machine-readable** | Yes (data.ontario.ca) / Partial (PDF fallback) |
| **High-risk** | No |
| **Second review** | No |
| **CV-REC-001 required** | Yes |
| **Attribution** | "Source: Ontario Ministry of Finance — Ontario Budget [year], Government of Ontario. Contains information licensed under the Open Government Licence – Ontario. Fetched [date]." |

---

### CV-DATA-014 — Ontario Public Accounts / Transfer Payments
**Status: Selected with Limitations**

| Field | Value |
|---|---|
| **Related Source ID** | SRC-ONT-002 |
| **Source decision** | Approved with Limitations (OGL-Ontario) |
| **Exact dataset** | Transfer Payments and Grants — data.ontario.ca CSV (confirm exact dataset URL at fetch) |
| **Intended use** | Ontario grants and transfer payments to organisations — by ministry, recipient, program |
| **Why selected** | Machine-readable open data, OGL-Ontario approved, no named individuals, useful for civic transparency about provincial spending. |
| **Limitation** | Confirm exact data.ontario.ca dataset URL and most recent fiscal year at fetch. |
| **Reporting period** | Most recent Ontario fiscal year — confirm at fetch |
| **Fetch method** | CSV download from data.ontario.ca (confirm exact dataset URL) |
| **Machine-readable** | Yes (CSV) |
| **High-risk** | No |
| **Second review** | No |
| **CV-REC-001 required** | Yes |
| **Attribution** | "Source: Government of Ontario — Transfer Payments and Grants [fiscal year], data.ontario.ca. Contains information licensed under the Open Government Licence – Ontario. Fetched [date]." |

---

## 5. Deferred Datasets

The following 11 datasets are deliberately excluded from the first Canadian public
launch. They may be added after the first launch once the workflow is proven and/or
their specific blockers are resolved.

| Dataset ID | Source Name | Reason for Deferral | Earliest Re-evaluation |
|---|---|---|---|
| CV-DATA-003 | Statistics Canada — crime/safety indicator | Not confirmed as in launch scope by Founder; requires separate approval | Post-launch; requires Founder approval |
| CV-DATA-004 | Government of Canada Fiscal Reference Tables (Federal Budget XLSX) | Federal budget data deferred for first launch — prove workflow on lower-risk Ontario data first | Post-launch |
| CV-DATA-005 | Government of Canada Federal Budget (PDF fallback) | PDF fallback path; also deferred as CV-DATA-004 is deferred | Post-launch |
| CV-DATA-006 | Public Accounts of Canada — Grants/Contributions CSV | Federal grants/contributions deferred for first launch | Post-launch |
| CV-DATA-007 | Public Accounts of Canada — PDF fallback | PDF fallback path; also deferred as CV-DATA-006 is deferred | Post-launch |
| CV-DATA-009 | Registry of Lobbyists | **High-risk** — named DPOHs and lobbyists; second reviewer not yet assigned; display framing decisions unresolved | Post-launch; second reviewer required |
| CV-DATA-010 | Elections Canada — 45th GE election results | High-risk (public figures in electoral context); defer until workflow proven on lower-risk data | Post-launch |
| CV-DATA-011 | Elections Canada — campaign finance returns | **High-risk** — named donors; second reviewer required; return availability for 45th GE unconfirmed | Post-launch; confirm return availability + second reviewer |
| CV-DATA-012 | Federal Ethics Commissioner records | **Highest risk** — Manual Review Only; named officials; per-record workflow not yet designed; second reviewer mandatory | Post-launch; requires complete per-record workflow and named second reviewer |
| CV-DATA-015 | Ontario Sunshine List | **High-risk** — named individuals with salary data; Privacy Commissioner guidance not yet reviewed; second reviewer required | Post-launch; Privacy Commissioner guidance review required first |
| CV-DATA-016 | Ontario Integrity Commissioner records | **Highest risk** — Manual Review Only; named MPPs; per-record workflow not yet designed; second reviewer mandatory | Post-launch; requires complete per-record workflow and named second reviewer |

---

## 6. Rationale

### Why a minimum launch scope?

1. **Workflow validation first.** The monthly source-fetch-verify-display workflow
   defined in CV-SOP-001 and CV-SOP-002 has never been run against a live dataset.
   Running it first on 5 lower-risk datasets allows the team to identify process gaps
   before applying the workflow to high-risk sources with named individuals.

2. **High-risk datasets require second reviewers not yet assigned.** Four of the 16
   dataset candidates require a named second reviewer before display. No second reviewer
   has been assigned for any source as of 2026-08-02. Deferring these datasets removes
   them as blockers to the first launch.

3. **Manual Review Only sources are not pipeline-compatible.** CV-DATA-012 (Federal
   Ethics Commissioner) and CV-DATA-016 (Ontario Integrity Commissioner) require
   per-record manual extraction and second-reviewer approval. These are appropriate for
   post-launch once the lower-risk pipeline is operational and a second reviewer is in
   place.

4. **The Ontario Sunshine List requires Privacy Commissioner guidance review.** This
   review has not been completed. Deferring CV-DATA-015 removes a critical open action
   from the launch path.

5. **Federal sources beyond CRA Charities are deferred for simplicity.** Federal budget
   and grants data (CV-DATA-004, 006) are low-risk but add complexity. Deferring them
   keeps the first launch focused on Ontario data and one federal public registry
   (CRA Charities), which is directly relevant to the civic context of the app.

6. **Statistics Canada requires a product decision still.** CV-DATA-001 and 002 are
   intended for launch but cannot be fetched until exact table numbers are confirmed.
   They are included as Pending Dataset Definition rather than deferred because they
   are low-risk once the table selection is made.

### Why these five?

| Dataset | Why Included |
|---|---|
| CV-DATA-001 (Statistics Canada population) | Low-risk aggregate; no named individuals; high civic relevance; confirms Statistics Canada integration |
| CV-DATA-002 (Statistics Canada unemployment) | Low-risk aggregate; no named individuals; high civic relevance |
| CV-DATA-008 (CRA Charities) | Public registry; OGL-Canada 2.0; machine-readable CSV; organisation-level only at launch; useful for charity search feature |
| CV-DATA-013 (Ontario Budget) | OGL-Ontario approved; machine-readable; no named individuals; directly relevant to Ontario civic context |
| CV-DATA-014 (Ontario Transfer Payments) | OGL-Ontario approved; machine-readable CSV; organisation-level grants; directly useful for civic transparency |

---

## 7. Risk Controls

The following controls apply to all selected launch datasets:

| Control | Rule |
|---|---|
| No named individual data at launch | Director names (CV-DATA-008) are explicitly excluded. No other selected dataset contains named individuals. |
| Attribution on every display screen | OGL-Canada 2.0 (CV-DATA-008) and OGL-Ontario (CV-DATA-013, 014) require attribution; Statistics Canada Open Licence (CV-DATA-001, 002) requires adapted attribution wording. |
| Data freshness label | Every displayed dataset must show "Data current as of [fetched date]" |
| Reporting period label | Every displayed dataset must show the specific reporting period |
| No prohibited claims | No corruption allegations, no voting recommendations, no legal conclusions, no investment recommendations, no editorial commentary on individual organisations or their funding levels |
| CV-REC-001 required | A Data Verification Checklist must be completed for each dataset before Firestore write |
| Source label in UI | Every data display screen must identify the source ("Source: Canada Revenue Agency — Registered Charities database …") |
| No fetch before conditions met | No fetch may proceed until Section 8 conditions are met for that specific dataset |

---

## 8. Required Verification Before Display

For each selected dataset, **all of the following conditions must be met** before it is
fetched, written to Firestore, or displayed to users:

| # | Condition | CV-DATA-001 | CV-DATA-002 | CV-DATA-008 | CV-DATA-013 | CV-DATA-014 |
|---|---|---|---|---|---|---|
| 1 | Exact table/dataset/URL confirmed | ❌ Pending — table number TBD | ❌ Pending — table number TBD | ❌ Pending — dataset ID TBD | ❌ Pending | ❌ Pending — dataset URL TBD |
| 2 | Reporting period confirmed | ❌ | ❌ | ❌ | ❌ | ❌ |
| 3 | First fetch executed and fetch date recorded in CV-REG-001 | ❌ | ❌ | ❌ | ❌ | ❌ |
| 4 | Firestore collection name confirmed | ❌ | ❌ | ❌ | ❌ | ❌ |
| 5 | App display location confirmed | ❌ | ❌ | ❌ | ❌ | ❌ |
| 6 | Attribution wording finalised and implemented in UI | ❌ | ❌ | ❌ | ❌ | ❌ |
| 7 | CV-REC-001 Data Verification Checklist completed | ❌ | ❌ | ❌ | ❌ | ❌ |
| 8 | Source label visible in app UI | ❌ | ❌ | ❌ | ❌ | ❌ |

> ✅ = complete &nbsp;&nbsp; ❌ = not yet complete
>
> This table must be updated as each condition is met. No dataset may go live until
> all conditions in its column are ✅.

---

## 9. Impact on CV-PLAN-003

This decision record updates the Decision Status of all 16 datasets in CV-PLAN-003
Section 4 as follows:

| Dataset ID | Previous Status | New Status |
|---|---|---|
| CV-DATA-001 | Pending Product Decision | **Pending Dataset Definition (intended for launch)** |
| CV-DATA-002 | Pending Product Decision | **Pending Dataset Definition (intended for launch)** |
| CV-DATA-003 | Candidate | **Deferred — Post-Launch** |
| CV-DATA-004 | Candidate | **Deferred — Post-Launch** |
| CV-DATA-005 | Deferred — use XLSX | **Deferred — Post-Launch** |
| CV-DATA-006 | Candidate | **Deferred — Post-Launch** |
| CV-DATA-007 | Deferred — use CSV | **Deferred — Post-Launch** |
| CV-DATA-008 | Candidate | **Selected with Limitations** (director names excluded) |
| CV-DATA-009 | Candidate | **Deferred — Post-Launch** |
| CV-DATA-010 | Candidate | **Deferred — Post-Launch** |
| CV-DATA-011 | Candidate | **Deferred — Post-Launch** |
| CV-DATA-012 | Manual Review Only | **Deferred — Post-Launch** |
| CV-DATA-013 | Candidate | **Selected with Limitations** |
| CV-DATA-014 | Candidate | **Selected with Limitations** |
| CV-DATA-015 | Candidate | **Deferred — Post-Launch** |
| CV-DATA-016 | Manual Review Only | **Deferred — Post-Launch** |

CV-PLAN-003 Section 4 table and relevant per-source sections must be updated to reflect
these statuses. See the updated CV-PLAN-003 v0.2.

---

## 10. Open Issues

| # | Issue | Priority | Owner | Status | Notes |
|---|---|---|---|---|---|
| 1 | **Confirm exact Statistics Canada table number(s) for CV-DATA-001 (population) and CV-DATA-002 (unemployment/labour force)** | **Critical** | Founder / Product Lead | Open | Must be resolved before CV-DATA-001 and 002 can be marked Selected and fetched. Candidate tables: 17-10-0005-01 (population); 14-10-0287-01 (labour force). Founder / Product Lead must confirm or substitute. |
| 2 | **Confirm exact dataset URLs for CV-DATA-008 (open.canada.ca CRA charities CSV), CV-DATA-013 (data.ontario.ca Ontario Budget), and CV-DATA-014 (data.ontario.ca transfer payments CSV)** | High | Data Lead | Open | Confirm at first data fetch. Dataset URLs may change; confirm at time of fetch and record in CV-REG-001. |
| 3 | **Confirm reporting periods for all 5 selected datasets** | High | Data Lead | Open | Confirm specific fiscal/calendar year for each at first fetch. |
| 4 | **Confirm Firestore collection names for all 5 selected datasets** | High | Technical Lead + Data Lead | Open | Required before any Firestore write. Proposed naming convention: `ca_[source_type]_[jurisdiction]` — confirm with Technical Lead. |
| 5 | **Confirm app display locations for all 5 selected datasets** | High | Product Lead | Open | Required before Firestore write. Which app screen/section/modal will display each dataset? |
| 6 | **Complete CV-REC-001 for each of the 5 selected datasets at first fetch** | High | Data Lead | Open | One CV-REC-001 per dataset fetch event. Must be completed before Firestore write. |
| 7 | **Confirm data.ontario.ca CSV/XLSX availability for applicable Ontario budget year (CV-DATA-013)** | Medium | Data Lead | Open | If only PDF is available, assess whether PDF extraction is acceptable or defer to post-launch. |

---

## 11. Approval

This decision record is considered active when:

1. The Founder has confirmed the launch dataset selection in Section 4.
2. The Statistics Canada table numbers for CV-DATA-001 and CV-DATA-002 have been
   confirmed (at which point those datasets change from Pending Dataset Definition to
   Selected with Limitations).
3. CV-PLAN-003 has been updated to reflect all Decision Status changes in Section 9.
4. The Founder and Data Lead have signed off below.

| Role | Name | Date |
|---|---|---|
| Decision author | Founder / Data Lead | 2026-08-02 |
| Founder confirmation | TBD — required to activate this decision | TBD |
| Data Lead sign-off | TBD — required before first fetch proceeds | TBD |

---

## Change Log

| Version | Date | Author | Change |
|---|---|---|---|
| 0.1 | 2026-08-02 | Founder / Data Lead | Initial decision record — minimum launch scope defined; 5 datasets selected (3 confirmed + 2 pending Statistics Canada table selection); 11 datasets deferred. |
