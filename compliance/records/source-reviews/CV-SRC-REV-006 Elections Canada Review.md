# CV-SRC-REV-006 — Elections Canada Review

| Field | Value |
|---|---|
| **Review Record ID** | CV-SRC-REV-006 |
| **Related Source ID (CV-REG-001)** | SRC-FED-006 |
| **Source Name** | Elections Canada — Election Results and Campaign Finance Data |
| **Jurisdiction** | Canada Federal |
| **Data Category** | Federal election results · Candidate and party campaign finance · Riding data |
| **Review Status** | Draft |
| **Reviewer** | Founder / Data Lead |
| **Review Date** | 2026-08-02 |
| **Related Documents** | CV-REG-001 Data Source Register · CV-CHK-005 Canadian Source Review Checklist · CV-SOP-001 Data Verification SOP · CV-POL-002 Data Sources and Attribution Policy |

---

> ⚠️ **DRAFT — PUBLIC REGISTRY — USE WITH ATTRIBUTION — HIGH-RISK (campaign finance sub-category)**
>
> **Source owner confirmed (Elections Canada). Licence confirmed (OGL-Canada 2.0). Attribution confirmed.**
>
> This source spans two distinct data categories with different risk levels:
>
> **A. Federal election results (candidate names, riding results, vote counts):**
> High-risk because candidate names are personal information about public figures in
> their official electoral role. Suitable for display as factual public registry data
> with attribution and strict factual framing.
>
> **B. Campaign finance (financial returns for candidates and parties, named donors):**
> High-risk because named donors are personal information, and financial return
> data involves specific monetary amounts tied to named individuals. A second reviewer
> is required before campaign finance data involving named donors is displayed.
>
> **Mandatory display rules:**
> - Display election results as factual outcomes only (votes cast, votes received, elected/not elected)
> - Do not imply endorsement, voting recommendations, or electoral misconduct
> - Display campaign finance as factual filed return data only
> - Do not imply illegality, misconduct, or undue influence from campaign finance records
> - Named donors may only be displayed if their donation amount is above the *Canada Elections Act* public disclosure threshold and is sourced directly from official Elections Canada filings
> - A second reviewer must approve any display of named donor data
>
> **Remaining limitations before Firestore write or public display:**
> - Specific election results dataset file URL to be confirmed (45th General Election)
> - Campaign finance return availability for most recent election to be confirmed
> - Named donor display scope and second reviewer: TBD
> - Transformation, app display location, and Firestore collection: TBD

---

## 1. Purpose

This record documents the source review for Elections Canada election results and
campaign finance data. Elections Canada is the independent non-partisan agency
responsible for administering federal elections under the *Canada Elections Act*.

This source covers two sub-categories that must be treated separately:

1. **Election results:** Riding-level vote counts and candidate results from the most
   recent federal general election. Machine-readable open data files available on
   elections.ca. Suitable as public registry data with attribution.

2. **Campaign finance:** Financial returns filed by candidates, registered parties, and
   electoral district associations. Includes revenues, expenses, and — above the
   statutory disclosure threshold — named contributors. Named contributor data is
   high-risk and requires second review before display.

---

## 2. Source Identification

| Field | Value |
|---|---|
| **Source owner / publisher** | Elections Canada (independent federal agency under the *Canada Elections Act*) |
| **Source URL — elections.ca** | https://www.elections.ca |
| **Source URL — election results open data** | https://elections.ca/content.aspx?section=res (confirm specific election data path for most recent general election at time of fetch) |
| **Source URL — campaign finance** | https://elections.ca/content.aspx?section=fin (Political Entities Financial Returns) |
| **Source format** | CSV / XML (election results open data — machine-readable: Yes); PDF and structured files (campaign finance returns — Partial) |
| **Data type** | Riding-level vote counts and results; candidate names; elected/not elected status; party financial returns; named contributions above disclosure threshold |
| **Reporting period** | Election results: most recent federal general election (45th General Election, April 2025). Campaign finance: financial returns for most recent election — confirm filing deadline and availability at time of fetch. |
| **Fetched date** | Not yet fetched |
| **Licence / terms reference** | OGL-Canada 2.0 — https://open.canada.ca/en/open-government-licence-canada (confirmed for elections.ca open data) |
| **Review trigger** | Pre-launch review (Step 24) |

---

## 3. Source Eligibility Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| ELG-01: Source is an approved type | **Pass** | Elections Canada is an independent federal agency; election results and campaign finance data are statutory public disclosures under the *Canada Elections Act*. Approved type: statutory public registry / official government open data. | Founder / Data Lead | 2026-08-02 | |
| ELG-02: Source is not a prohibited type | **Pass** | Official federal agency source — not a news site or unofficial aggregator. | Founder / Data Lead | 2026-08-02 | |
| ELG-03: Source owner identified | **Pass** | Elections Canada — confirmed. Independent non-partisan agency responsible for federal elections. | Founder / Data Lead | 2026-08-02 | |
| ELG-04: Source URL recorded | **Partial** | elections.ca main URL confirmed. Specific open data file path for 45th General Election results and campaign finance returns to be confirmed at time of fetch. | Founder / Data Lead | 2026-08-02 | Confirm specific file URLs for most recent election |
| ELG-05: Source publicly accessible | **Pass** | elections.ca election results open data and campaign finance returns are publicly accessible. | Founder / Data Lead | 2026-08-02 | |
| ELG-06: Data relevant | **Pass** | Federal election results and campaign finance data are core civic accountability information. | Founder / Data Lead | 2026-08-02 | Limit display to factual electoral outcomes and official financial return data |

---

## 4. Licence / Terms Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| LIC-01: Licence identified | **Pass** | OGL-Canada 2.0 — confirmed for elections.ca open data. | Founder / Data Lead | 2026-08-02 | |
| LIC-02: Licence permits reuse | **Pass** | OGL-Canada 2.0 permits reproduction, modification, distribution for any lawful purpose. | Founder / Data Lead | 2026-08-02 | |
| LIC-03: Attribution required | **Pass** | OGL-Canada 2.0 requires "Contains information licensed under the Open Government Licence – Canada." | Founder / Data Lead | 2026-08-02 | |
| LIC-04: No prohibited uses | **Pass** | No prohibited uses for displaying factual election results and campaign finance data with attribution. Must not imply endorsement, voting recommendations, illegality, or misconduct. | Founder / Data Lead | 2026-08-02 | |
| LIC-05: Licence Status | **Approved** | OGL-Canada 2.0 confirmed. | Founder / Data Lead | 2026-08-02 | Update CV-REG-001 SRC-FED-006 to Approved |
| LIC-06: Licence version | **Pass** | OGL-Canada 2.0. | Founder / Data Lead | 2026-08-02 | |
| LIC-07: Terms change monitoring | **Pass** | Monitor open.canada.ca/en/open-government-licence-canada at each update cycle. | Founder / Data Lead | 2026-08-02 | |

---

## 5. Attribution Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| ATT-01: Attribution wording confirmed | **Pass** | **Confirmed wording (election results):** "Source: Elections Canada — [Election name] results (elections.ca). Contains information licensed under the Open Government Licence – Canada. Fetched [date]." **Confirmed wording (campaign finance):** "Source: Elections Canada — Political Entities Financial Returns (elections.ca). Contains information licensed under the Open Government Licence – Canada. Financial return data for [election/fiscal year]. Fetched [date]." | Founder / Data Lead | 2026-08-02 | Use sub-category-appropriate wording |
| ATT-02: Attribution recorded in CV-REG-001 | **Pass** | Attribution wording recorded in CV-REG-001 SRC-FED-006 Notes. | Founder / Data Lead | 2026-08-02 | |
| ATT-03: Attribution placement | **Needs Review** | App display location TBD. | | | |
| ATT-04: Attribution consistent with licence | **Pass** | Wording meets OGL-Canada 2.0 requirement. | Founder / Data Lead | 2026-08-02 | |

---

## 6. Reporting Period Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| RPT-01: Reporting period identified | **Partial** | Election results: 45th General Election (April 2025) — results available on elections.ca. Campaign finance: financial return filing deadline is approximately 6 months post-election; confirm availability for 45th GE returns at time of fetch. | Founder / Data Lead | 2026-08-02 | Confirm campaign finance return availability at fetch |
| RPT-02: Reporting period accurate | **Needs Review** | Confirm at data fetch. | | | |
| RPT-03: Source update frequency | **Pass** | Election results: published post-election; stable thereafter. Campaign finance returns: filed over ~6 months post-election; updated as filings are received. | Founder / Data Lead | 2026-08-02 | |
| RPT-04: App update frequency | **Needs Review** | Election results: update post-election only. Campaign finance: may require periodic refresh as returns are filed. | | | |
| RPT-05: Staleness risk | **Pass** | Display "Election results from [election name, date]" and "Campaign finance returns as of [fetched date]" clearly in UI. | Founder / Data Lead | 2026-08-02 | |

---

## 7. Machine-Readability Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| MR-01: Machine-readability classified | **Yes (election results) / Partial (campaign finance)** | Election results: Elections Canada publishes open data files (CSV/XML) for each general election — machine-readable: Yes. Campaign finance: financial returns are available as structured files on elections.ca, but some filings may be PDF — machine-readable: Partial. | Founder / Data Lead | 2026-08-02 | Confirm specific file format for campaign finance at fetch |
| MR-02: Partial path risk | **Pass** | If campaign finance data includes PDF filings: manual extraction required; verify before Firestore write. | Founder / Data Lead | 2026-08-02 | |
| MR-03: Fetch method | **Partial** | Election results: download open data CSV/XML file from elections.ca (confirm specific file path for 45th GE). Campaign finance: confirm structured file format and URL at fetch. | Founder / Data Lead | 2026-08-02 | |

---

## 8. Privacy / Personal Information Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| PRI-01: Personal information assessment | **Partial** | Candidate names: personal information about individuals acting in a public electoral role — suitable for display as factual public registry data. Named donors above disclosure threshold: personal information about private individuals — higher risk; requires second reviewer. | Founder / Data Lead | 2026-08-02 | |
| PRI-02: Public official / candidate | **Pass — with display rules** | Candidate names and results are disclosed under the *Canada Elections Act* as part of the statutory public electoral record. Display of candidate names with their riding results is permitted as factual civic data. Must not add editorial content about individual candidates beyond the electoral record. | Founder / Data Lead | 2026-08-02 | |
| PRI-03: Named donors | **Partial — second review required** | Named donors above the *Canada Elections Act* disclosure threshold are publicly disclosed in official financial returns. Display is permitted for factual reporting of the disclosed amount. However: (a) Do not display donors below the statutory threshold. (b) Do not combine donor records with other sources to create profiles. (c) Second reviewer required before any named donor display. | Founder / Data Lead | 2026-08-02 | Named donor display requires second reviewer |
| PRI-04: Sensitive information | **Pass** | No sensitive personal information (health, ethnic, etc.) in standard electoral results and campaign finance return fields. | Founder / Data Lead | 2026-08-02 | |
| PRI-05: CV-REG-002 update required | **Yes — update CV-REG-002** | Named candidates and named donors are personal information. Update CV-REG-002 before Firestore write. | Founder / Data Lead | 2026-08-02 | |

---

## 9. Public Official / High-Risk Data Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| HRD-01: High-risk flag | **Flagged — High-Risk** | Named candidates (election results): high-risk (public figures — electoral context). Named donors (campaign finance): high-risk (private individuals with disclosed contribution amounts). | Founder / Data Lead | 2026-08-02 | |
| HRD-02: Second reviewer required | **Yes — required for campaign finance / named donor display** | Second review mandatory before any named-donor campaign finance data is displayed publicly. | Founder / Data Lead | 2026-08-02 | Second reviewer not yet assigned |
| HRD-03: Official source confirmed | **Pass** | elections.ca is the official Elections Canada source — confirmed. | Founder / Data Lead | 2026-08-02 | |
| HRD-04: Accuracy spot-check | **Needs Review** | At first fetch: spot-check 3–5 riding results against official elections.ca returns. | | | |
| HRD-05: Disclaimer placement | **Needs Review** | Required disclaimer: "Electoral results and campaign finance data from Elections Canada (elections.ca). This data reflects official filed returns. Civic Voice Canada does not imply endorsement, recommend candidates or parties, or suggest electoral misconduct." | | | |

---

## 10. Transformation Review

| Review Item | Status | Notes |
|---|---|---|
| TRF-01: Transformation identified | **Needs Review** | TBD — confirm whether results are displayed as riding-level detail, aggregated by party nationally, or both. |
| TRF-02: No distortion | **Needs Review** | Critical: vote percentage calculations must be accurate. Do not aggregate in ways that misrepresent outcomes. No "swing" or "momentum" calculations unless methodology is documented and reviewed. |
| TRF-03 through TRF-05 | **Needs Review** | TBD |

---

## 11. App Display Review

| Review Item | Status | Notes |
|---|---|---|
| DSP-01 through DSP-05 | **Needs Review** | App display location TBD. Must not include voting recommendations, implied endorsements, or editorial content about candidates or parties. |
| DSP-06 | **Needs Review** | /sources page entry to be drafted. |

---

## 12. Firestore Mapping Review

| Review Item | Status | Notes |
|---|---|---|
| FS-01 through FS-04 | **Needs Review** | TBD. Confirm named candidate and donor data handling in Firestore public read fields. |

---

## 13. Final Source Decision

| Field | Value |
|---|---|
| **Final decision** | **Public Registry — Use with Attribution** |
| **Decision rationale** | Elections Canada is the official source for federal election data under the *Canada Elections Act*. Source owner confirmed. Licence confirmed (OGL-Canada 2.0 — Approved). Attribution confirmed. Machine-readable: Yes (election results), Partial (campaign finance). Suitable for display with attribution and strict factual framing. **High-risk controls:** (1) Named candidate display is permitted as factual public electoral record with attribution; (2) Named donor display requires second reviewer; (3) No voting recommendations, implied endorsements, or electoral misconduct implications. **Remaining limitations:** specific file URLs, campaign finance return availability, second reviewer, named donor scope, transformation, app display location, and Firestore collection TBD. |
| **CV-REG-001 Licence Status** | **Approved** — update CV-REG-001 SRC-FED-006 |
| **Second review required** | **Yes** — required for named donor / campaign finance display |
| **CV-REG-002 update required** | **Yes** — named candidates and named donors are personal information |
| **CV-REC-001 required before Firestore write** | Yes |

---

## 14. Open Issues

| # | Issue | Priority | Owner | Status | Target Date |
|---|---|---|---|---|---|
| 1 | Confirm specific open data file URL(s) for 45th General Election results on elections.ca | High | Data Lead | Open | Before data fetch |
| 2 | Confirm campaign finance return availability for 45th GE and structured file format | High | Data Lead | Open | Before data fetch |
| 3 | Assign second reviewer for named donor / campaign finance display | **Critical** | Data Lead / Founder | Open | Before app design |
| 4 | Confirm whether named donors will be displayed — if yes, complete separate privacy assessment | **Critical** | Privacy Lead | Open | Before app design |
| 5 | Update CV-REG-002 for named candidate and donor personal information | High | Privacy Lead | Open | Before Firestore write |
| 6 | Define transformation approach (riding-level vs national aggregation; vote % calculation) | High | Data Lead | Open | Before Firestore design |
| 7 | Confirm app display location and ensure no voting recommendation language | High | Product Lead | Open | |
| 8 | Confirm Firestore collection and schema | High | Technical Lead | Open | |
| 9 | Draft disclaimer text and confirm placement | High | Product Lead | Open | |
| 10 | Complete CV-REC-001 at first data fetch | High | Data Lead | Open | At first fetch |

**Issues resolved in this review:**
- ~~Confirm source owner~~ — **Resolved 2026-08-02**: Elections Canada confirmed.
- ~~Confirm source URL~~ — **Resolved 2026-08-02**: elections.ca confirmed; specific file paths TBD.
- ~~Confirm OGL-Canada 2.0 licence~~ — **Resolved 2026-08-02**: Confirmed Approved.
- ~~Draft attribution wording~~ — **Resolved 2026-08-02**: Confirmed (two sub-category wordings).
- ~~Confirm machine-readability~~ — **Resolved 2026-08-02**: Yes (results), Partial (campaign finance).

---

## 15. Approval

| Role | Name | Date | Decision |
|---|---|---|---|
| Primary Reviewer | Founder / Data Lead | 2026-08-02 | Public Registry — Use with Attribution (high-risk controls apply) |
| **Second Reviewer (required — campaign finance)** | TBD | TBD | Not yet assigned |
| Data Lead sign-off | TBD | TBD | Pending — required before Firestore write |

---

## Change Log

| Version | Date | Author | Change |
|---|---|---|---|
| 0.1 | 2026-08-02 | Founder / Data Lead | Initial draft — all items Needs Review; Pending Review decision |
| 0.2 | 2026-08-02 | Founder / Data Lead | Step 24 review: source owner, elections.ca URL, OGL-Canada 2.0 licence, attribution, machine-readability (Yes for results/Partial for campaign finance), candidate and donor privacy treatment, and display rules confirmed. High-risk flag maintained; second reviewer required for campaign finance/named donors. CV-REG-002 update required. Final decision: Public Registry — Use with Attribution. |
