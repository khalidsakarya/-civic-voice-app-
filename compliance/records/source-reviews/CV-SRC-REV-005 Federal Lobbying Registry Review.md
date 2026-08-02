# CV-SRC-REV-005 — Federal Lobbying Registry Review

| Field | Value |
|---|---|
| **Review Record ID** | CV-SRC-REV-005 |
| **Related Source ID (CV-REG-001)** | SRC-FED-005 |
| **Source Name** | Office of the Commissioner of Lobbying of Canada — Registry of Lobbyists |
| **Jurisdiction** | Canada Federal |
| **Data Category** | Lobbying disclosures · Lobbyist registrations · Communication reports |
| **Review Status** | Draft |
| **Reviewer** | Founder / Data Lead |
| **Review Date** | 2026-08-02 |
| **Related Documents** | CV-REG-001 Data Source Register · CV-CHK-005 Canadian Source Review Checklist · CV-SOP-001 Data Verification SOP · CV-POL-002 Data Sources and Attribution Policy |

---

> ⚠️ **DRAFT — PUBLIC REGISTRY — USE WITH ATTRIBUTION — HIGH-RISK**
>
> **Source owner confirmed. Licence confirmed (OGL-Canada 2.0). Attribution confirmed.**
>
> This source is a **statutory public registry** under the *Lobbying Act*. It is
> suitable for display with attribution, accurate status labels, and the strict
> display rules below.
>
> **This source is high-risk because it:**
> - Names individual registered lobbyists (personal information in a public filing role)
> - Names Designated Public Office Holders (DPOHs) — Ministers, Deputy Ministers, Senators, MPs
> - Contains communication reports linking lobbyists to specific DPOHs by subject matter
> - Could, if displayed inaccurately or editorially, imply influence, improper access,
>   corruption, or misconduct — none of which this source supports
>
> **A second reviewer is required before any named-DPOH or communication-report data is displayed.**
>
> **Mandatory display rules:**
> - Display only what the official registry states: registrant name, client, subject matter, DPOHs contacted, filing date
> - Never infer, imply, or editorialize about influence, access, corruption, or improper conduct
> - Never combine lobbying records with other sources to create composite "influence scores" or reputational rankings
> - Attribute clearly to the Office of the Commissioner of Lobbying of Canada
> - Link to the official registry entry where possible
>
> **Remaining limitations before Firestore write or public display:**
> - Exact bulk data URL on lobbycanada.gc.ca open data confirmed (portal); exact file URL TBD
> - Reporting period / currency of registry: TBD (rolling registry — confirm at fetch)
> - DPOH name privacy treatment: confirm display is limited to official public role only
> - Second reviewer: not yet assigned
> - Transformation approach: TBD
> - App display location: TBD
> - Firestore collection: TBD

---

## 1. Purpose

This record documents the source review for the Office of the Commissioner of Lobbying
of Canada's Registry of Lobbyists. This is a statutory public register under the
*Lobbying Act* (*R.S.C. 1985, c. 44 (4th Supp.)*). Registered lobbyists must file
registration information disclosing their clients, purposes, subject matters, and
communication reports when they communicate with Designated Public Office Holders
(DPOHs).

**Why this source exists:** The *Lobbying Act* is designed to ensure transparency in
government decision-making by requiring disclosure of who is lobbying whom and about
what. Civic Voice Canada may use this data to provide civic accountability context —
who is registered to lobby the federal government and on what subject matters.

**Why this source is high-risk:** This source names private individuals (lobbyists),
named clients (organisations), and named public officials (DPOHs). Displaying this data
requires strict factual accuracy and no editorial framing that implies wrongdoing, undue
influence, or corruption. Lobbying is a legal, regulated activity. The source documents
disclosure of lobbying — not findings of impropriety.

---

## 2. Source Identification

| Field | Value |
|---|---|
| **Source owner / publisher** | Office of the Commissioner of Lobbying of Canada |
| **Source URL — registry search** | https://lobbycanada.gc.ca/en/find-lobbying-activities |
| **Source URL — open data** | https://lobbycanada.gc.ca/en/open-data/ (confirm exact bulk download file URL at time of fetch) |
| **Source format** | CSV bulk download (lobbycanada.gc.ca open data — preferred); HTML search interface (Partial) |
| **Data type** | Registrant names, client organisations, subject matters, DPOHs contacted, communication report dates, registration status (active / closed) |
| **Reporting period** | Rolling registry — registrations are live and updated continuously; communication reports filed monthly. Confirm data currency at time of fetch. |
| **Fetched date** | Not yet fetched |
| **Licence / terms reference** | OGL-Canada 2.0 — https://open.canada.ca/en/open-government-licence-canada (confirmed for lobbycanada.gc.ca open data) |
| **Review trigger** | Pre-launch review (Step 24) |

---

## 3. Source Eligibility Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| ELG-01: Source is an approved type | **Pass** | Registry of Lobbyists is a statutory public registry under the *Lobbying Act*. lobbycanada.gc.ca open data provides CSV bulk download. Approved type under CV-POL-002 §3 (statutory public registry). | Founder / Data Lead | 2026-08-02 | |
| ELG-02: Source is not a prohibited type | **Pass** | Official federal statutory registry — not a news site, unofficial aggregator, or prohibited source. | Founder / Data Lead | 2026-08-02 | |
| ELG-03: Source owner identified | **Pass** | Office of the Commissioner of Lobbying of Canada — independent federal officer responsible for administering the *Lobbying Act*. | Founder / Data Lead | 2026-08-02 | |
| ELG-04: Source URL recorded | **Partial** | Registry search and open data portal URLs confirmed. Exact bulk download file URL to be confirmed at data fetch. | Founder / Data Lead | 2026-08-02 | Confirm bulk download file URL |
| ELG-05: Source publicly accessible | **Pass** | lobbycanada.gc.ca and open data download are publicly accessible without login or paywall. | Founder / Data Lead | 2026-08-02 | |
| ELG-06: Data relevant to civic purpose | **Pass** | Lobbying disclosure data is core civic accountability information — informs users about who is registered to communicate with federal officials and on what subjects. | Founder / Data Lead | 2026-08-02 | Display must be factual; no editorial inference about influence |

---

## 4. Licence / Terms Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| LIC-01: Licence identified | **Pass** | OGL-Canada 2.0 — https://open.canada.ca/en/open-government-licence-canada — confirmed as applicable to lobbycanada.gc.ca open data. | Founder / Data Lead | 2026-08-02 | |
| LIC-02: Licence permits reuse | **Pass** | OGL-Canada 2.0 permits reproduction, modification, distribution for any lawful purpose. | Founder / Data Lead | 2026-08-02 | |
| LIC-03: Attribution required | **Pass** | OGL-Canada 2.0 requires "Contains information licensed under the Open Government Licence – Canada." | Founder / Data Lead | 2026-08-02 | |
| LIC-04: No prohibited uses | **Pass** | No prohibited uses for displaying factual lobbying registration records with attribution. Must not use data in ways that imply unlawful conduct or combine with other sources to make unsupported inferences. | Founder / Data Lead | 2026-08-02 | |
| LIC-05: Licence Status | **Approved** | OGL-Canada 2.0 confirmed for lobbycanada.gc.ca open data. | Founder / Data Lead | 2026-08-02 | Update CV-REG-001 SRC-FED-005 to Approved |
| LIC-06: Licence version | **Pass** | OGL-Canada 2.0. | Founder / Data Lead | 2026-08-02 | |
| LIC-07: Terms change monitoring | **Pass** | Monitor open.canada.ca/en/open-government-licence-canada at each data update cycle. | Founder / Data Lead | 2026-08-02 | |

---

## 5. Attribution Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| ATT-01: Attribution wording confirmed | **Pass** | **Confirmed wording:** "Source: Office of the Commissioner of Lobbying of Canada — Registry of Lobbyists (lobbycanada.gc.ca). Contains information licensed under the Open Government Licence – Canada. Data current as of [fetched date]." | Founder / Data Lead | 2026-08-02 | Fill in fetched date at time of fetch |
| ATT-02: Attribution recorded in CV-REG-001 | **Pass** | Attribution wording recorded in CV-REG-001 SRC-FED-005 Notes. | Founder / Data Lead | 2026-08-02 | |
| ATT-03: Attribution placement in UI | **Needs Review** | App display location TBD. Attribution and disclaimer must appear on every page displaying lobbying data. | | | |
| ATT-04: Attribution consistent with licence | **Pass** | Wording meets OGL-Canada 2.0 requirement. | Founder / Data Lead | 2026-08-02 | |

---

## 6. Reporting Period Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| RPT-01: Reporting period identified | **Partial** | Rolling registry — registrations are continuously active or closed; communication reports are filed within 10 days of communication with a DPOH. No single "reporting year." | Founder / Data Lead | 2026-08-02 | Display "Data current as of [fetched date]" |
| RPT-02: Reporting period accurate | **Needs Review** | Confirm data currency (last bulk download update) at time of fetch. | | | |
| RPT-03: Source update frequency | **Pass** | Rolling / continuous. open data bulk download updated periodically — confirm frequency at fetch. | Founder / Data Lead | 2026-08-02 | |
| RPT-04: App update frequency | **Needs Review** | TBD — recommend monthly or quarterly refresh given rolling nature. | | | |
| RPT-05: Staleness risk | **Pass** | Display "Data current as of [fetched date]" prominently. Lobbying registry data becomes stale quickly for active registrations. | Founder / Data Lead | 2026-08-02 | |

---

## 7. Machine-Readability Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| MR-01: Machine-readability classified | **Yes (CSV bulk download)** | lobbycanada.gc.ca provides a bulk CSV download of registry data through its open data page. Machine-readable: Yes. | Founder / Data Lead | 2026-08-02 | Confirm exact file URL and column structure at first fetch |
| MR-02: Partial path risk | N/A | CSV bulk download is the recommended and only suitable path. Web search interface is HTML only — do not scrape. | Founder / Data Lead | 2026-08-02 | |
| MR-03: Fetch method | **Partial** | Recommended: CSV download from lobbycanada.gc.ca/en/open-data/. Confirm exact file URL at first fetch. | Founder / Data Lead | 2026-08-02 | |

---

## 8. Privacy / Personal Information Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| PRI-01: Personal information assessment | **Partial** | **Registered lobbyist names** are personal information about individuals — however, filing with the Registry is a statutory requirement when lobbying for compensation; the names are publicly disclosed under the *Lobbying Act*. **DPOH names** (Ministers, MPs, Senators, Deputy Ministers) are personal information about individuals in their official public roles. Both categories are suitable for display as factual registry data but require the display rules in Section 2. | Founder / Data Lead | 2026-08-02 | |
| PRI-02: Public official personal information (DPOHs) | **Pass — with display rules** | DPOH names in communication reports are disclosed under the *Lobbying Act* as part of the transparency regime. Display is permitted for the purpose of reporting on official public roles. Must not be combined with other data to create reputational profiles of individual DPOHs beyond what the registry states. | Founder / Data Lead | 2026-08-02 | |
| PRI-03: Non-official personal information (lobbyists) | **Pass — with display rules** | Registered lobbyist names are statutory public filings. Display limited to: registrant name, employer/client, subject matter, filing date, registration status. Do not display home address, personal contact, or personal financial information. | Founder / Data Lead | 2026-08-02 | |
| PRI-04: Sensitive personal information | **Pass** | No sensitive personal information (health, financial, ethnic, etc.) in standard registry fields. | Founder / Data Lead | 2026-08-02 | |
| PRI-05: CV-REG-002 update required | **Yes — update CV-REG-002** | Named lobbyists and DPOHs are personal information. Update CV-REG-002 to note lobbying registry as a source of personal information (names in public role). | Founder / Data Lead | 2026-08-02 | Update CV-REG-002 before Firestore write |

---

## 9. Public Official / High-Risk Data Review

| Review Item | Status | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| HRD-01: High-risk flag | **Flagged — High-Risk** | Named DPOHs and named lobbyists. Risk of misrepresentation as "influence" or "corruption" if display framing is inaccurate. | Founder / Data Lead | 2026-08-02 | |
| HRD-02: Second reviewer required | **Yes — required before display of named DPOHs or communication reports** | A second reviewer must confirm display framing before any named-DPOH or communication-report data goes live. | Founder / Data Lead | 2026-08-02 | Second reviewer not yet assigned — open issue |
| HRD-03: Official source confirmed | **Pass** | lobbycanada.gc.ca is the official Registry of Lobbyists maintained by the Commissioner of Lobbying. Confirmed. | Founder / Data Lead | 2026-08-02 | |
| HRD-04: Accuracy spot-check required | **Needs Review** | At first data fetch: spot-check 3–5 registrant records against the lobbycanada.gc.ca web search to confirm CSV accuracy. | | | |
| HRD-05: Disclaimer placement | **Needs Review** | Required disclaimer on all lobbying data pages: "Lobbying disclosure information from the Registry of Lobbyists (Office of the Commissioner of Lobbying of Canada). Lobbying is a legal, regulated activity. This data reflects statutory disclosure filings and does not imply improper conduct, undue influence, or wrongdoing by any registrant or public official." | | | |

---

## 10. Transformation Review

| Review Item | Status | Notes |
|---|---|---|
| TRF-01: Transformation identified | **Needs Review** | TBD — confirm whether records are displayed as individual registrations, aggregated by subject matter, or aggregated by DPOH contacted. |
| TRF-02: No distortion | **Needs Review** | Critical: no transformation may create "influence scores," aggregate lobbying counts in ways that imply ranking of DPOHs, or combine lobbying data with other sources to produce inferred conclusions. |
| TRF-03 through TRF-05 | **Needs Review** | TBD |

---

## 11. App Display Review

| Review Item | Status | Notes |
|---|---|---|
| DSP-01 through DSP-05 | **Needs Review** | App display location TBD. Confirm no prohibited framing (e.g., "most lobbied minister," "influence network," "suspect activity"). |
| DSP-06 | **Needs Review** | /sources page entry to be drafted. |

---

## 12. Firestore Mapping Review

| Review Item | Status | Notes |
|---|---|---|
| FS-01 through FS-04 | **Needs Review** | TBD. Firestore public read fields must not expose named personal information without appropriate context display. |

---

## 13. Final Source Decision

| Field | Value |
|---|---|
| **Final decision** | **Public Registry — Use with Attribution** |
| **Decision rationale** | Registry of Lobbyists is a statutory public registry under the *Lobbying Act*. Source owner confirmed. Licence confirmed (OGL-Canada 2.0 — Approved). Attribution confirmed. Machine-readable: Yes (CSV bulk download). This source is suitable for display with attribution, factual status labels, and strict display rules. **High-risk controls apply:** (1) Named DPOH and communication-report display requires second reviewer; (2) Mandatory disclaimer on all lobbying data pages; (3) No editorial framing implying influence, corruption, or impropriety; (4) No "influence scores" or aggregations that imply rankings of individuals. **Remaining limitations:** bulk download file URL, reporting period currency, second reviewer, transformation design, app display location, and Firestore collection TBD. |
| **CV-REG-001 Licence Status** | **Approved** — update CV-REG-001 SRC-FED-005 |
| **Second review required** | **Yes** — required before named-DPOH or communication-report data is displayed |
| **CV-REG-002 update required** | **Yes** — named lobbyists and DPOHs are personal information in public filing role |
| **CV-REC-001 required before Firestore write** | Yes |

---

## 14. Open Issues

| # | Issue | Priority | Owner | Status | Target Date |
|---|---|---|---|---|---|
| 1 | Confirm exact bulk download file URL on lobbycanada.gc.ca/en/open-data/ and download format | High | Data Lead | Open | Before data fetch |
| 2 | Assign second reviewer for named-DPOH and communication-report display | **Critical** | Data Lead / Founder | Open | Before app design |
| 3 | Define app display framing — confirm no prohibited editorial language | **Critical** | Product Lead | Open | Before app design |
| 4 | Confirm transformation approach — no "influence scores" or prohibited aggregations | High | Data Lead | Open | Before Firestore design |
| 5 | Update CV-REG-002 to include lobbying registry as source of personal information | High | Privacy Lead | Open | Before Firestore write |
| 6 | Confirm app display location | High | Product Lead | Open | |
| 7 | Confirm Firestore collection and schema | High | Technical Lead | Open | |
| 8 | Confirm disclaimer text and placement on all lobbying data pages | High | Product Lead | Open | |
| 9 | Spot-check 3–5 records at first fetch against lobbycanada.gc.ca web search | High | Data Lead | Open | At first fetch |
| 10 | Complete CV-REC-001 at first data fetch | High | Data Lead | Open | At first fetch |

**Issues resolved in this review:**
- ~~Confirm source owner~~ — **Resolved 2026-08-02**: Office of the Commissioner of Lobbying of Canada confirmed.
- ~~Confirm source URL~~ — **Resolved 2026-08-02**: Registry search and open data portal confirmed; bulk file URL TBD.
- ~~Confirm licence~~ — **Resolved 2026-08-02**: OGL-Canada 2.0 Approved.
- ~~Draft attribution wording~~ — **Resolved 2026-08-02**: Confirmed in Section 5.
- ~~Confirm machine-readability~~ — **Resolved 2026-08-02**: Yes (CSV bulk download).
- ~~Confirm statutory public registry eligibility~~ — **Resolved 2026-08-02**: Confirmed under *Lobbying Act*.

---

## 15. Approval

| Role | Name | Date | Decision |
|---|---|---|---|
| Primary Reviewer | Founder / Data Lead | 2026-08-02 | Public Registry — Use with Attribution (high-risk controls apply) |
| **Second Reviewer (required — high-risk)** | TBD | TBD | Not yet assigned |
| Data Lead sign-off | TBD | TBD | Pending — required before Firestore write |

---

## Change Log

| Version | Date | Author | Change |
|---|---|---|---|
| 0.1 | 2026-08-02 | Founder / Data Lead | Initial draft — all items Needs Review; Pending Review decision |
| 0.2 | 2026-08-02 | Founder / Data Lead | Step 24 review: source owner, URLs, OGL-Canada 2.0 licence, attribution, machine-readability (CSV bulk download), privacy treatment (named lobbyists + DPOHs), and mandatory display rules confirmed. High-risk flag maintained; second reviewer required. CV-REG-002 update required. Final decision: Public Registry — Use with Attribution. |
