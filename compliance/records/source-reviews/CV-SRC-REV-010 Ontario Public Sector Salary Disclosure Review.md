# CV-SRC-REV-010 — Ontario Public Sector Salary Disclosure Review

| Field | Value |
|---|---|
| **Review Record ID** | CV-SRC-REV-010 |
| **Related Source ID (CV-REG-001)** | SRC-ONT-003 |
| **Source Name** | Government of Ontario — Public Sector Salary Disclosure ("Sunshine List") |
| **Jurisdiction** | Ontario |
| **Data Category** | Named public sector salary disclosures · "Sunshine List" |
| **Review Status** | Draft |
| **Reviewer** | Founder / Data Lead |
| **Review Date** | 2026-08-02 |
| **Related Documents** | CV-REG-001 Data Source Register · CV-CHK-005 Canadian Source Review Checklist · CV-SOP-001 Data Verification SOP · CV-POL-002 Data Sources and Attribution Policy |

---

> ⚠️ **DRAFT — PUBLIC REGISTRY — USE WITH ATTRIBUTION — HIGH-RISK**
>
> **Source owner confirmed (Government of Ontario). Licence confirmed (OGL-Ontario). Source URLs confirmed. Machine-readable: Yes (data.ontario.ca CSV).**
>
> This source is a **statutory public disclosure register** under the *Public Sector
> Salary Disclosure Act, 1996*. It is suitable for display with attribution, strict
> accuracy, and the mandatory display rules below.
>
> **This source is high-risk because:**
> - It names individual public sector employees with their exact salaries and taxable benefits
> - Individuals on this list are private citizens acting in employment roles, not elected officials
> - The Ontario Privacy Commissioner has published guidance on the privacy implications of reusing Sunshine List data
> - Individuals have experienced privacy-related harm from aggregation, commentary, and editorial framing of this data
>
> **A second reviewer is required before this source is approved for display.**
>
> **Mandatory display rules:**
> - Display only the exact disclosed salary and taxable benefits as published — no rounding, estimation, or modification
> - Display only fields that appear in the official published record: name, employer, job title / position, salary paid, taxable benefits
> - Do not add commentary on the fairness, justification, or appropriateness of any salary
> - Do not compare salaries across individuals in ways that imply editorial judgement
> - Do not combine this data with other sources to create composite profiles of named individuals
> - Do not use this data to profile, target, or identify individuals beyond their public employment disclosure role
> - Use must be limited to Ontario public sector accountability — not general income research or individual profiling
>
> **Remaining limitations before Firestore write or public display:**
> - Exact data.ontario.ca dataset URL: confirm at time of fetch
> - Calendar year in scope: TBD (confirm most recent disclosed year)
> - Ontario Privacy Commissioner guidance: must be reviewed before display
> - Second reviewer: not yet assigned
> - Transformation approach: TBD
> - App display location: TBD
> - Firestore collection: TBD

---

## 1. Purpose

This record documents the source review for the Ontario Public Sector Salary Disclosure
Act data, commonly known as the "Sunshine List." This is an annual statutory disclosure
published by the Government of Ontario listing public sector employees who were paid
$100,000 or more in a given calendar year.

**Why this source exists:** The *Public Sector Salary Disclosure Act, 1996* requires
designated Ontario public sector employers (hospitals, universities, Crown agencies,
municipalities, school boards, etc.) to disclose employees earning $100,000 or more.
The purpose is public sector accountability and transparency.

**Why this source is high-risk:** Unlike elected officials or lobbyists, most individuals
on the Sunshine List are employees (nurses, engineers, educators, administrators) who did
not choose to be public figures. Their inclusion is statutory — they cannot opt out. The
Ontario Privacy Commissioner has noted that while the disclosure is lawful, secondary use
of the data should respect its purpose (public sector accountability) and not extend to
individual profiling, targeting, or stigmatisation.

---

## 2. Source Identification

| Field | Value |
|---|---|
| **Source owner / publisher** | Government of Ontario — Treasury Board Secretariat |
| **Source URL — ontario.ca** | https://www.ontario.ca/page/public-sector-salary-disclosure |
| **Source URL — data.ontario.ca (CSV — preferred)** | https://data.ontario.ca/dataset/public-sector-salary-disclosure (confirm exact dataset URL and most recent year file) |
| **Source format** | CSV (data.ontario.ca — preferred); XLSX (may be available on ontario.ca); the official published PDF is not the preferred path |
| **Data type** | Employee name, employer name, job title/position, salary paid (annual), taxable benefits |
| **Reporting period** | Calendar year — annual disclosure (prior year disclosed approximately March of following year). TBD — confirm which calendar year is in scope at time of fetch. |
| **Fetched date** | Not yet fetched |
| **Licence / terms reference** | Open Government Licence – Ontario — https://www.ontario.ca/page/open-government-licence-ontario |
| **Review trigger** | Pre-launch review (Step 24) |

---

## 3. Source Eligibility Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| ELG-01: Source is an approved type | **Pass** | Statutory disclosure under the *Public Sector Salary Disclosure Act, 1996*. data.ontario.ca is the official Ontario government open-data portal. Approved type: statutory public disclosure register. | Founder / Data Lead | 2026-08-02 | |
| ELG-02: Source is not a prohibited type | **Pass** | Official Government of Ontario publication — not a news site or unofficial aggregator. Must confirm source is data.ontario.ca or ontario.ca — not a secondary Sunshine List aggregator website. | Founder / Data Lead | 2026-08-02 | Must use official source only |
| ELG-03: Source owner identified | **Pass** | Government of Ontario — Treasury Board Secretariat — confirmed. | Founder / Data Lead | 2026-08-02 | |
| ELG-04: Source URL recorded | **Partial** | ontario.ca and data.ontario.ca portal URLs confirmed. Exact CSV dataset URL (data.ontario.ca/dataset/public-sector-salary-disclosure) noted; confirm specific year file URL at fetch. | Founder / Data Lead | 2026-08-02 | |
| ELG-05: Source publicly accessible | **Pass** | data.ontario.ca and ontario.ca are publicly accessible. | Founder / Data Lead | 2026-08-02 | |
| ELG-06: Data relevant | **Pass — with scope limitation** | Ontario public sector salary disclosure is civic accountability data. Use must be limited to public sector accountability purposes — not general income research, individual profiling, or personal interest in specific named individuals. | Founder / Data Lead | 2026-08-02 | |

---

## 4. Licence / Terms Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| LIC-01: Licence identified | **Pass** | Open Government Licence – Ontario — https://www.ontario.ca/page/open-government-licence-ontario — applies to data.ontario.ca datasets. | Founder / Data Lead | 2026-08-02 | |
| LIC-02: Licence permits reuse | **Pass** | OGL-Ontario permits reproduction, modification, distribution for any lawful purpose. | Founder / Data Lead | 2026-08-02 | |
| LIC-03: Attribution required | **Pass** | OGL-Ontario requires "Contains information licensed under the Open Government Licence – Ontario." | Founder / Data Lead | 2026-08-02 | |
| LIC-04: No prohibited uses | **Pass — with Privacy Commissioner guidance caveat** | OGL-Ontario permits reuse; however, the Ontario Privacy Commissioner has published guidance noting that secondary use of Sunshine List data should be limited to its public accountability purpose. This guidance is not a licence restriction but is a strong compliance consideration — review it before display. | Founder / Data Lead | 2026-08-02 | Privacy Commissioner guidance must be reviewed |
| LIC-05: Licence Status | **Approved** | OGL-Ontario confirmed for data.ontario.ca dataset. | Founder / Data Lead | 2026-08-02 | Update CV-REG-001 SRC-ONT-003 to Approved |
| LIC-06: Licence version | **Pass** | Open Government Licence – Ontario (no numbered version; current edition). | Founder / Data Lead | 2026-08-02 | |
| LIC-07: Terms change monitoring | **Pass** | Monitor ontario.ca/page/open-government-licence-ontario at each annual update cycle. | Founder / Data Lead | 2026-08-02 | |

---

## 5. Attribution Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| ATT-01: Attribution wording confirmed | **Pass** | **Confirmed wording:** "Source: Government of Ontario — Public Sector Salary Disclosure [year] (data.ontario.ca). Contains information licensed under the Open Government Licence – Ontario. Fetched [date]." | Founder / Data Lead | 2026-08-02 | Fill in year and fetch date at first fetch |
| ATT-02: Attribution recorded in CV-REG-001 | **Pass** | Attribution wording recorded in CV-REG-001 SRC-ONT-003 Notes. | Founder / Data Lead | 2026-08-02 | |
| ATT-03: Attribution placement | **Needs Review** | App display location TBD. | | | |
| ATT-04: Attribution consistent with licence | **Pass** | Meets OGL-Ontario requirement. | Founder / Data Lead | 2026-08-02 | |

---

## 6. Reporting Period Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| RPT-01: Reporting period identified | **Needs Review** | Calendar year basis; prior year disclosed approximately March of following year. Specific year to be confirmed at fetch. | | | Confirm most recent available year at fetch |
| RPT-02–RPT-04 | **Needs Review** | TBD | | | |
| RPT-05: Staleness risk | **Pass** | Annual disclosure; display "Disclosure year [year]; published [month year]" clearly in UI. | Founder / Data Lead | 2026-08-02 | |

---

## 7. Machine-Readability Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| MR-01: Machine-readability classified | **Yes** | data.ontario.ca provides the Sunshine List as a downloadable CSV file annually — machine-readable: Yes. | Founder / Data Lead | 2026-08-02 | |
| MR-02: N/A | N/A | CSV is the preferred and primary path. | | | |
| MR-03: Fetch method | **Partial** | Recommended: CSV download from data.ontario.ca/dataset/public-sector-salary-disclosure. Confirm exact file URL for most recent year at fetch. | Founder / Data Lead | 2026-08-02 | |

---

## 8. Privacy / Personal Information Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| PRI-01: Personal information assessment | **Pass — this IS personal information; justified by statutory disclosure** | Named individuals with salary and benefit amounts — this is personal information under PIPEDA and FIPPA. Disclosure is justified under the *Public Sector Salary Disclosure Act*. Use must remain limited to its stated purpose: public sector accountability. | Founder / Data Lead | 2026-08-02 | |
| PRI-02: Public official | **Partial** | Many Sunshine List individuals are not elected or appointed public officials — they are employees (healthcare workers, educators, administrators). Treat as personal information about individuals in a public employment disclosure role — not as public figures. Display rules apply (see Section 2). | Founder / Data Lead | 2026-08-02 | |
| PRI-03: Non-official personal information | **Pass — strict display rules apply** | Display only: name, employer, job title, salary paid, taxable benefits — as disclosed in the official record. Do not add personal details, contact information, photos, social media, or any information beyond the official disclosure fields. | Founder / Data Lead | 2026-08-02 | |
| PRI-04: Sensitive information | **Pass — with caution** | Salary is financial information. While publicly disclosed, it remains sensitive. Combined with employer and job title, it identifies individuals. Any aggregation or sorting must serve accountability purposes only. | Founder / Data Lead | 2026-08-02 | |
| PRI-05: CV-REG-002 update required | **Yes — update CV-REG-002** | Named individuals with salary data are personal information. Update CV-REG-002 before Firestore write. | Founder / Data Lead | 2026-08-02 | |

---

## 9. Public Official / High-Risk Data Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| HRD-01: High-risk flag | **Flagged — High-Risk** | Named individuals with exact salary amounts. Ontario Privacy Commissioner guidance applies. Risk of harm from editorial framing, aggregation, or individual profiling. | Founder / Data Lead | 2026-08-02 | |
| HRD-02: Second reviewer required | **Yes** | A second reviewer must confirm display framing and transformation before any named salary data goes live. | Founder / Data Lead | 2026-08-02 | Not yet assigned |
| HRD-03: Official source confirmed | **Pass** | data.ontario.ca and ontario.ca are the official Government of Ontario sources — confirmed. Must not use unofficial Sunshine List aggregator websites. | Founder / Data Lead | 2026-08-02 | |
| HRD-04: Accuracy spot-check | **Needs Review** | At first fetch: spot-check 5 records against ontario.ca/page/public-sector-salary-disclosure to confirm CSV accuracy. | | | |
| HRD-05: Disclaimer placement | **Needs Review** | Required on all salary disclosure pages: "Salary and benefit information from the Ontario Public Sector Salary Disclosure Act. Data is published annually by the Government of Ontario. Civic Voice Canada does not comment on the fairness or appropriateness of any individual's compensation." | | | |

---

## 10. Transformation Review

| Review Item | Status | Notes |
|---|---|---|
| TRF-01: Transformation identified | **Needs Review** | TBD — confirm whether individual records, employer aggregations, or salary-band summaries will be displayed. |
| TRF-02: No distortion | **Critical rule** | No editorial rankings ("highest paid"), no comparison commentary ("X earns more than Y"), no speculation about value or appropriateness. If sorted by salary, display neutrally with no contextual commentary. |
| TRF-03 through TRF-05 | **Needs Review** | TBD |

---

## 11. App Display Review

| Review Item | Status | Notes |
|---|---|---|
| DSP-01 through DSP-05 | **Needs Review** | TBD — confirm display design; mandatory: no editorial commentary on individual salaries; display fetched date and disclosure year. |
| DSP-06 | **Needs Review** | /sources page entry to be drafted. |

---

## 12. Firestore Mapping Review

| Review Item | Status | Notes |
|---|---|---|
| FS-01 through FS-04 | **Needs Review** | TBD. Access controls for named personal information must be confirmed before any Firestore write. |

---

## 13. Final Source Decision

| Field | Value |
|---|---|
| **Final decision** | **Public Registry — Use with Attribution** |
| **Decision rationale** | Sunshine List is a statutory public disclosure register under the *Public Sector Salary Disclosure Act, 1996*. Source owner confirmed (Government of Ontario). Licence confirmed (OGL-Ontario — Approved). Source URL confirmed (data.ontario.ca). Machine-readable: Yes (CSV). Attribution confirmed. This source is suitable for display with attribution, strict factual accuracy, and the mandatory display rules in Section 2. **High-risk controls:** (1) Second reviewer required before display; (2) Ontario Privacy Commissioner guidance must be reviewed; (3) No editorial commentary on salary fairness; (4) No individual profiling beyond official disclosure fields; (5) Display disclaimer on all salary pages. **Remaining limitations:** specific calendar year, transformation design, app display location, Firestore collection, second reviewer, and Privacy Commissioner guidance review all TBD. |
| **CV-REG-001 Licence Status** | **Approved** — update CV-REG-001 SRC-ONT-003 |
| **Second review required** | **Yes** |
| **Ontario Privacy Commissioner guidance review required** | **Yes — before display** |
| **CV-REG-002 update required** | **Yes** |
| **CV-REC-001 required before Firestore write** | Yes |

---

## 14. Open Issues

| # | Issue | Priority | Owner | Status | Target Date |
|---|---|---|---|---|---|
| 1 | Confirm exact data.ontario.ca CSV dataset URL for most recent Sunshine List year | High | Data Lead | Open | Before data fetch |
| 2 | Confirm calendar year in scope | High | Data Lead | Open | Before data fetch |
| 3 | Review Ontario Privacy Commissioner guidance on Sunshine List secondary use | **Critical** | Privacy Lead | Open | Before app design |
| 4 | Assign second reviewer | **Critical** | Founder | Open | Before app design |
| 5 | Define transformation approach — confirm no editorial salary rankings or commentary | High | Data Lead | Open | Before Firestore design |
| 6 | Update CV-REG-002 for named salary personal information | High | Privacy Lead | Open | Before Firestore write |
| 7 | Confirm app display location and disclaimer text | High | Product Lead | Open | |
| 8 | Confirm Firestore collection, schema, and access controls | High | Technical Lead | Open | |
| 9 | Spot-check 5 records at first fetch against ontario.ca official publication | High | Data Lead | Open | At first fetch |
| 10 | Complete CV-REC-001 at first data fetch | High | Data Lead | Open | At first fetch |

**Issues resolved in this review:**
- ~~Confirm source owner~~ — **Resolved 2026-08-02**: Government of Ontario / Treasury Board Secretariat confirmed.
- ~~Confirm source URL~~ — **Resolved 2026-08-02**: ontario.ca and data.ontario.ca confirmed; exact file URL TBD.
- ~~Confirm OGL-Ontario licence~~ — **Resolved 2026-08-02**: Approved.
- ~~Draft attribution wording~~ — **Resolved 2026-08-02**: Confirmed.
- ~~Confirm machine-readability~~ — **Resolved 2026-08-02**: Yes (data.ontario.ca CSV).

---

## 15. Approval

| Role | Name | Date | Decision |
|---|---|---|---|
| Primary Reviewer | Founder / Data Lead | 2026-08-02 | Public Registry — Use with Attribution (high-risk controls apply) |
| **Second Reviewer (required)** | TBD | TBD | Not yet assigned |
| Privacy Lead | TBD | TBD | Pending — Privacy Commissioner guidance review required |
| Data Lead sign-off | TBD | TBD | Pending — required before Firestore write |

---

## Change Log

| Version | Date | Author | Change |
|---|---|---|---|
| 0.1 | 2026-08-02 | Founder / Data Lead | Initial draft — all items Needs Review; Pending Review decision |
| 0.2 | 2026-08-02 | Founder / Data Lead | Step 24 review: source owner, URLs, OGL-Ontario licence, attribution, machine-readability (data.ontario.ca CSV — Yes) confirmed. Mandatory display rules documented. Privacy Commissioner guidance review required. High-risk flag maintained; second reviewer required. CV-REG-002 update required. Final decision: Public Registry — Use with Attribution. |
