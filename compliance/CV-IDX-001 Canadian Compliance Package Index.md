# CV-IDX-001 — Canadian Compliance Package Index

| Field | Value |
|---|---|
| **Document ID** | CV-IDX-001 |
| **Version** | 0.3 |
| **Status** | Draft |
| **Owner** | Founder / Compliance Lead |
| **Effective Date** | TBD — pending review |
| **Scope** | Civic Voice Canada only |
| **Review Frequency** | Monthly; or when compliance documents are added, revised, retired, or approved |

---

> ⚠️ **DRAFT — NOT YET IN EFFECT**
>
> This index is a working draft. It has **not** been reviewed by legal counsel and is
> **not** yet formally adopted. It must be reviewed and approved before public launch.

---

## 1. Purpose

This index identifies and controls the Canadian-only Civic Voice compliance document
package, including all policies, procedures, registers, checklists, document owners,
current status, review frequency, and public/internal classification.

Its goals are to:

- Provide a single authoritative list of all compliance documents in the Civic Voice
  Canada package.
- Make it easy to confirm which documents are current, which are open for review, and
  which are not yet created.
- Distinguish documents that will be published publicly from those that are internal
  only.
- Track pre-launch open items that must be resolved before the app goes live.
- Support legal counsel review by providing a structured overview of the full package.

---

## 2. Scope

This index covers all compliance documents prepared for the Canadian launch of Civic
Voice Canada. It does not cover documents prepared for future US, UK, or Australian
launches — those will be tracked in separate jurisdiction-specific indexes.

---

## 3. Compliance Package Status

| Metric | Count |
|---|---|
| Total documents in package | 43 (including this index) |
| Status: Draft | 41 |
| Status: Ready for Review | 0 |
| Status: Approved | 0 |
| Status: Retired | 0 |
| Public-facing documents | 4 |
| Internal documents | 11 |
| Registers | 3 (CV-REG-001 · CV-REG-002 · CV-REG-003) |
| Source Review Records | 11 (CV-SRC-REV-001 through CV-SRC-REV-011) |
| Reports | 1 (CV-RPT-001) |
| Pre-launch open items outstanding | 15 — see Section 10 |

> This table must be updated whenever a document status changes.

---

## 4. Document Index

| Document ID | Document Title | File Path | Document Type | Owner | Status | Review Frequency | Public / Internal | Purpose | Related Documents | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| **CV-IDX-001** | Canadian Compliance Package Index | `compliance/CV-IDX-001 Canadian Compliance Package Index.md` | Index | Founder / Compliance Lead | Draft | Monthly; on any package change | Internal | Single authoritative list of all compliance documents; tracks status, owners, and pre-launch open items | All documents in this package | This document |
| **CV-COMP-001** | Compliance Position Statement | `compliance/CV-COMP-001 Compliance Position Statement.md` | Position Statement | Founder / Compliance Lead | Draft | Before launch; when app scope changes | Internal | Establishes Civic Voice Canada's compliance posture, applicable laws, risk areas, and document framework | All documents | Foundation document for the package |
| **CV-REG-001** | Data Source Register | `compliance/registers/CV-REG-001 Data Source Register.md` | Register | Founder / Data Lead | Draft | Monthly; on any source change | Internal | Master list of all official sources, licences, reporting periods, fetched dates, and transformation notes | CV-POL-002 · CV-SOP-001 · CV-SOP-002 | 11 placeholder source entries (7 federal, 4 Ontario); all TBD fields to be resolved before public display |
| **CV-REG-002** | Privacy Data Map | `compliance/registers/CV-REG-002 Privacy Data Map.md` | Register | Founder / Privacy Lead | Draft | Quarterly; on any data collection change | Internal | Maps all personal information, identifiers, analytics, notifications, and user-submitted content collected or processed | CV-POL-001 · CV-SOP-004 · CV-SOP-005 | |
| **CV-REG-003** | Open Issues Register | `compliance/registers/CV-REG-003 Open Issues Register.md` | Register | Founder / Compliance Lead | Draft | Weekly pre-launch; monthly post-launch | Internal | Tracks all open compliance, privacy, data-source, security, accessibility, App Store, and launch-readiness issues | CV-IDX-001 · CV-CHK-002 · CV-SOP-003 · CV-SOP-004 | 16 initial issues open; 7 Critical, 7 High, 2 Medium |
| **CV-POL-001** | Privacy Policy | `compliance/policies/CV-POL-001 Privacy Policy.md` | Policy | Founder / Privacy Lead | Draft | Before launch; on material feature changes | **Public** | Discloses what personal information is collected, how it is used, user rights, and PIPEDA compliance | CV-REG-002 · CV-POL-003 | Must be published before App Store submission and public launch |
| **CV-POL-002** | Data Sources and Attribution Policy | `compliance/policies/CV-POL-002 Data Sources and Attribution Policy.md` | Policy | Founder / Data Lead | Draft | Monthly; on source changes | Internal (attribution wording adapted for public Data Sources page) | Defines source eligibility, prohibited sources, attribution requirements, OGL-Canada compliance, and transformation rules | CV-REG-001 · CV-SOP-001 · CV-SOP-002 | Attribution wording from §6.2 to be adapted for public civicvoice.ca/sources page |
| **CV-POL-003** | Terms of Use | `compliance/policies/CV-POL-003 Terms of Use.md` | Policy | Founder / Compliance Lead | Draft | Before launch; on material app or feature changes | **Public** | Governs user access, acceptable use, disclaimers, limitation of liability, and governing law | CV-POL-001 · CV-POL-004 | Must be published before App Store submission and public launch |
| **CV-POL-004** | Public Disclaimer and Non-Affiliation Statement | `compliance/policies/CV-POL-004 Public Disclaimer and Non-Affiliation Statement.md` | Policy | Founder / Compliance Lead | Draft | Before launch; when app positioning changes | **Public** | Defines standard short and full disclaimer wording, prohibited claims, and required use locations across all public surfaces | CV-POL-002 · CV-POL-003 · CV-SOP-001 | Wording is copy-paste ready for app UI, App Store listing, and legal documents |
| **CV-POL-005** | Accessibility Statement | `compliance/policies/CV-POL-005 Accessibility Statement.md` | Policy | Founder / Product Lead | Draft | Before launch; after major UI changes | **Public** | States WCAG 2.1 AA accessibility target, known limitations, and accessibility feedback channel | CV-CHK-001 · CV-POL-003 | Must be published or linkable before App Store submission |
| **CV-SOP-001** | Data Verification SOP | `compliance/procedures/CV-SOP-001 Data Verification SOP.md` | SOP | Founder / Data Lead | Draft | Monthly; on pipeline changes | Internal | Defines verification steps, second-review requirements, approved status labels, and records for all data before publication | CV-REG-001 · CV-POL-002 · CV-POL-004 | |
| **CV-SOP-002** | Monthly Data Update SOP | `compliance/procedures/CV-SOP-002 Monthly Data Update SOP.md` | SOP | Founder / Data Lead | Draft | Monthly; on pipeline changes | Internal | Defines monthly fetch, validation, Firestore write controls, post-write verification, and update log requirements | CV-SOP-001 · CV-REG-001 · CV-POL-002 | |
| **CV-SOP-003** | Correction Request Procedure | `compliance/procedures/CV-SOP-003 Correction Request Procedure.md` | SOP | Founder / Compliance Lead | Draft | Quarterly; on workflow changes | Internal | Defines intake, triage, risk classification, source review, temporary labels, correction, and closure for user-submitted correction requests | CV-SOP-001 · CV-SOP-002 · CV-POL-002 · CV-POL-003 | |
| **CV-CHK-001** | Accessibility Checklist | `compliance/checklists/CV-CHK-001 Accessibility Checklist.md` | Checklist | Founder / Product Lead | Draft | Before launch; before App Store submission; after major UI changes | Internal | 79-item WCAG 2.1 AA checklist covering structure, contrast, keyboard navigation, screen readers, charts, mobile layout, status labels, and source links | CV-POL-005 | Must be completed and signed off before CV-POL-005 is published |
| **CV-SOP-004** | Security and Firebase Access Procedure | `compliance/procedures/CV-SOP-004 Security and Firebase Access Procedure.md` | SOP | Founder / Technical Lead | Draft | Quarterly; after security incidents or major infrastructure changes | Internal | Defines access control, Firestore rules review, secrets management, GitHub/Vercel/Firebase access, backups, incident response, and offboarding | CV-POL-001 · CV-REG-002 · CV-SOP-002 | |
| **CV-SOP-005** | CASL Communications Procedure | `compliance/procedures/CV-SOP-005 CASL Communications Procedure.md` | SOP | Founder / Compliance Lead | Draft | Before launch of any email/push/SMS/donation feature | Internal | Defines CASL consent, identification, unsubscribe, consent records, prohibited practices, and pre-send review for all electronic communications | CV-POL-001 · CV-POL-003 · CV-REG-002 | No communication features currently deployed; this SOP activates before any are launched |
| **CV-CHK-002** | Pre-Launch Compliance Checklist | `compliance/checklists/CV-CHK-002 Pre-Launch Compliance Checklist.md` | Checklist | Founder / Compliance Lead | Draft | Before App Store submission; before public launch | Internal | Master pre-launch gate checklist covering App Store submission, public documents, Firebase/Vercel config, CASL, accessibility, data sources, security, and operational readiness | CV-IDX-001 · CV-REG-003 · all policies and SOPs | Must be completed and signed off before public launch |
| **CV-CHK-003** | App Store Privacy Labels Checklist | `compliance/checklists/CV-CHK-003 App Store Privacy Labels Checklist.md` | Checklist | Founder / Privacy Lead | Draft | Before App Store submission; on any SDK or data collection change | Internal | Maps all app and SDK data collection to Apple App Store and Google Play privacy label declarations; confirms labels match CV-REG-002 and CV-POL-001 | CV-REG-002 · CV-POL-001 · CV-POL-003 · CV-SOP-005 · CV-CHK-002 · CV-REG-003 | Satisfies CV-ISS-012 in CV-REG-003; must be completed before App Store submission |
| **CV-PLAN-001** | Public Legal Pages Implementation Plan | `compliance/plans/CV-PLAN-001 Public Legal Pages Implementation Plan.md` | Plan | Founder / Product Lead | Draft | Before public launch; before App Store submission; when public routes, navigation, or legal document content changes materially | Internal | Defines which compliance documents become public app pages, proposed routes, footer link requirements, App Store URL requirements, content readiness gates, and implementation rules | CV-POL-001 · CV-POL-002 · CV-POL-003 · CV-POL-004 · CV-POL-005 · CV-REG-001 · CV-REG-003 · CV-CHK-002 · CV-CHK-003 | No app code to be written until all readiness gates in §9 are resolved and source documents are Approved |
| **CV-PLAN-002** | Canadian Launch Scope Control Plan | `compliance/plans/CV-PLAN-002 Canadian Launch Scope Control Plan.md` | Plan | Founder / Product Lead | Draft | Before public launch; before adding any non-Canadian jurisdiction back into the public UI | Internal | Defines Canadian-only launch scope, hide-not-delete rules for US/UK/AU, direct-route handling, data and code retention, and reactivation criteria for hidden jurisdictions | CV-COMP-001 · CV-POL-002 · CV-POL-004 · CV-CHK-002 · CV-REG-003 | US, UK, and Australia code and Firestore data must not be deleted; hidden jurisdictions must not appear in App Store listing or marketing |
| **CV-PLAN-003** | Canadian Launch Dataset Selection Plan | `compliance/plans/CV-PLAN-003 Canadian Launch Dataset Selection Plan.md` | Plan | Founder / Product Lead · Founder / Data Lead | Draft | Before public launch; when datasets, app pages, or Firestore collections change | Internal | Defines exact Canadian dataset candidates, selection status, reporting periods, Firestore collection targets, and app display locations; controls which datasets are confirmed for launch vs deferred; links to CV-REC-001 verification requirements | CV-REG-001 · CV-RPT-001 · CV-SRC-REV-001–011 · CV-CHK-005 · CV-SOP-001 · CV-REC-001 | 16 dataset candidates (CV-DATA-001–016); all Pending Product Decision / Candidate / Manual Review Only; no dataset selected; 13 open product decisions outstanding |
| **CV-CHK-004** | Public UI Compliance Implementation Checklist | `compliance/checklists/CV-CHK-004 Public UI Compliance Implementation Checklist.md` | Checklist | Founder / Product Lead | Draft | Before public launch; before App Store submission; before major UI changes affecting legal links, disclaimers, navigation scope, or data display labels | Internal | 67-item UI compliance checklist covering legal links, disclaimer placement, Canada-only scope, hidden jurisdiction handling, source attribution, data freshness labels, prohibited claims, privacy controls, accessibility, and App Store screenshots | CV-PLAN-001 · CV-PLAN-002 · CV-POL-001 through CV-POL-005 · CV-CHK-001 · CV-CHK-002 · CV-CHK-003 · CV-REG-003 | Must be completed and signed off before public launch; all Critical items must be Pass or NA |
| **CV-CHK-005** | Canadian Source Review Checklist | `compliance/checklists/CV-CHK-005 Canadian Source Review Checklist.md` | Checklist | Founder / Data Lead | Draft | Before public launch for all active launch sources; monthly for first 3 months post-launch; when any source, licence, or terms change | Internal | Source approval checklist covering eligibility, licence/terms, attribution, reporting period, machine-readability, privacy, high-risk data, transformation, app display, and Firestore mapping; produces CV-REG-001 Licence Status decision | CV-REG-001 · CV-POL-002 · CV-SOP-001 · CV-SOP-002 · CV-CHK-002 · CV-REG-003 | One instance per source per review event; 7 final decision options; must be completed before any source is used in the public app |
| **CV-REC-001** | Data Verification Checklist Template | `compliance/records/templates/CV-REC-001 Data Verification Checklist Template.md` | Record Template | Founder / Data Lead | Draft | When CV-SOP-001 is updated | Internal | Blank template for recording per-dataset verification events: dataset identification, verification checklist, transformation record, reviewer sign-off, and final decision | CV-SOP-001 · CV-POL-002 · CV-REG-001 | Complete one record per verification event; retain minimum 3 years |
| **CV-REC-002** | Monthly Update Log Template | `compliance/records/templates/CV-REC-002 Monthly Update Log Template.md` | Record Template | Founder / Data Lead | Draft | When CV-SOP-002 is updated | Internal | Blank template for recording monthly data update cycles: source summary, records written, manual review flags, Firestore write controls, post-write checks, UI checks, deviations, and approval | CV-SOP-002 · CV-POL-002 · CV-REG-001 | Complete one record per monthly update cycle; retain minimum 3 years |
| **CV-REC-003** | Manual Review Register Template | `compliance/records/templates/CV-REC-003 Manual Review Register Template.md` | Record Template | Founder / Data Lead | Draft | When CV-SOP-001 or CV-SOP-002 is updated | Internal | Living register template for tracking open and closed manual review flags on data items; includes flag ID, jurisdiction, app area, data item, reason, status label, priority, and resolution | CV-SOP-001 · CV-SOP-002 · CV-POL-002 | Living register — do not delete closed rows; retain minimum 3 years from last entry |
| **CV-REC-004** | Correction Request Record Template | `compliance/records/templates/CV-REC-004 Correction Request Record Template.md` | Record Template | Founder / Compliance Lead | Draft | When CV-SOP-003 is updated | Internal | Blank template for recording individual correction requests: all 20 fields from CV-SOP-003 including correction ID, triage decision, verification evidence, implementation action, and closure status | CV-SOP-003 · CV-POL-003 | Complete one record per correction request; retain minimum 3 years from closure |
| **CV-REC-005** | Deviation and Risk Acceptance Record Template | `compliance/records/templates/CV-REC-005 Deviation and Risk Acceptance Record Template.md` | Record Template | Founder / Compliance Lead | Draft | When related SOPs or checklists are updated | Internal | Blank template for recording deviations from compliance procedures and formal risk acceptance decisions: deviation description, severity, root cause, immediate action, risk assessment, acceptance conditions, corrective action, and approval | CV-SOP-002 · CV-SOP-003 · CV-CHK-002 | Complete one record per deviation or risk acceptance; retain minimum 3 years from closure |
| **CV-REC-006** | Access Review Record Template | `compliance/records/templates/CV-REC-006 Access Review Record Template.md` | Record Template | Founder / Technical Lead | Draft | When CV-SOP-004 is updated | Internal | Blank template for recording access reviews across all systems (Firebase, Vercel, GitHub, domain registrar): access inventory, keep/remove/change decisions, service account review, findings, and approval | CV-SOP-004 · CV-POL-001 | Complete one record per access review; retain minimum 3 years |
| **CV-REC-007** | Firestore Rules Review Record Template | `compliance/records/templates/CV-REC-007 Firestore Rules Review Record Template.md` | Record Template | Founder / Technical Lead | Draft | When CV-SOP-004 is updated | Internal | Blank template for recording Firestore security rules reviews: collections reviewed, public read/restricted write confirmations, admin-only actions, test evidence, findings, and approval | CV-SOP-004 · CV-POL-001 · CV-REG-002 | Required before public launch (CV-ISS-015); complete one record per rules review; retain minimum 3 years |
| **CV-REC-008** | Secrets and Environment Variable Register Template | `compliance/records/templates/CV-REC-008 Secrets and Environment Variable Register Template.md` | Record Template | Founder / Technical Lead | Draft | When CV-SOP-004 is updated | Internal | Living register template for tracking secrets and environment variables: name, system, environment, purpose, storage location, access level, rotation frequency, and rotation dates. Never records actual secret values. | CV-SOP-004 | Living register — review quarterly; never store actual secret values; retain minimum 3 years per version |
| **CV-REC-009** | Launch Approval Record Template | `compliance/records/templates/CV-REC-009 Launch Approval Record Template.md` | Record Template | Founder / Compliance Lead | Draft | When CV-CHK-002 is updated | Internal | Blank template for recording the formal launch gate approval: launch overview, checklist completion status, open Critical/High issues, risk acceptances, content readiness gates, final launch decision (Approved / Approved with open items / Not approved / Deferred), and approver sign-offs | CV-CHK-002 · CV-PLAN-001 · CV-PLAN-002 | Complete one record per major public launch; retain minimum 5 years |

| **CV-SRC-REV-001** | Statistics Canada Indicators Review | `compliance/records/source-reviews/CV-SRC-REV-001 Statistics Canada Indicators Review.md` | Source Review Record | Founder / Data Lead | Draft | Before public launch; when source or licence changes | Internal | Pre-launch source review for SRC-001 (Statistics Canada) — eligibility, licence, attribution, privacy, transformation, and Firestore mapping | CV-REG-001 · CV-CHK-005 · CV-SOP-001 · CV-POL-002 | Pending Review — all items TBD |
| **CV-SRC-REV-002** | CRA Charities Registry Review | `compliance/records/source-reviews/CV-SRC-REV-002 CRA Charities Registry Review.md` | Source Review Record | Founder / Data Lead | Draft | Before public launch; when source or licence changes | Internal | Pre-launch source review for SRC-002 (CRA Charities Registry) — director name privacy assessment required | CV-REG-001 · CV-CHK-005 · CV-SOP-001 · CV-POL-002 | Pending Review — director name privacy and licence TBD |
| **CV-SRC-REV-003** | Government of Canada Budget Review | `compliance/records/source-reviews/CV-SRC-REV-003 Government of Canada Budget Review.md` | Source Review Record | Founder / Data Lead | Draft | Before public launch; when source or licence changes | Internal | Pre-launch source review for SRC-003 (Federal Budget) — PDF vs CSV format decision required | CV-REG-001 · CV-CHK-005 · CV-SOP-001 · CV-POL-002 | Pending Review — source format and licence TBD |
| **CV-SRC-REV-004** | Public Accounts of Canada Review | `compliance/records/source-reviews/CV-SRC-REV-004 Public Accounts of Canada Review.md` | Source Review Record | Founder / Data Lead | Draft | Before public launch; when source or licence changes | Internal | Pre-launch source review for SRC-004 (Public Accounts of Canada) | CV-REG-001 · CV-CHK-005 · CV-SOP-001 · CV-POL-002 | Pending Review |
| **CV-SRC-REV-005** | Federal Lobbying Registry Review | `compliance/records/source-reviews/CV-SRC-REV-005 Federal Lobbying Registry Review.md` | Source Review Record | Founder / Data Lead | Draft | Before public launch; when source or licence changes | Internal | Pre-launch source review for SRC-005 (Lobbying Registry) — **HIGH-RISK** — named DPOHs and lobbyists; second reviewer required | CV-REG-001 · CV-CHK-005 · CV-SOP-001 · CV-POL-002 | **High-Risk** — Pending Review — second reviewer required |
| **CV-SRC-REV-006** | Elections Canada Review | `compliance/records/source-reviews/CV-SRC-REV-006 Elections Canada Review.md` | Source Review Record | Founder / Data Lead | Draft | Before public launch; when source or licence changes | Internal | Pre-launch source review for SRC-006 (Elections Canada) — **HIGH-RISK (campaign finance sub-category)** — named donors; second reviewer required for campaign finance | CV-REG-001 · CV-CHK-005 · CV-SOP-001 · CV-POL-002 | **High-Risk (campaign finance)** — Pending Review — second reviewer required |
| **CV-SRC-REV-007** | Federal Conflict of Interest and Ethics Commissioner Review | `compliance/records/source-reviews/CV-SRC-REV-007 Federal Conflict of Interest and Ethics Commissioner Review.md` | Source Review Record | Founder / Data Lead | Draft | Before public launch; when source or licence changes | Internal | Pre-launch source review for SRC-007 (Federal Ethics Commissioner) — **HIGHEST RISK** — named officials, examination findings; second reviewer required | CV-REG-001 · CV-CHK-005 · CV-SOP-001 · CV-POL-002 | **Highest Risk** — Pending Review — second reviewer mandatory |
| **CV-SRC-REV-008** | Ontario Budget Review | `compliance/records/source-reviews/CV-SRC-REV-008 Ontario Budget Review.md` | Source Review Record | Founder / Data Lead | Draft | Before public launch; when source or licence changes | Internal | Pre-launch source review for SRC-008 (Ontario Budget) | CV-REG-001 · CV-CHK-005 · CV-SOP-001 · CV-POL-002 | Pending Review |
| **CV-SRC-REV-009** | Ontario Public Accounts and Grants Review | `compliance/records/source-reviews/CV-SRC-REV-009 Ontario Public Accounts and Grants Review.md` | Source Review Record | Founder / Data Lead | Draft | Before public launch; when source or licence changes | Internal | Pre-launch source review for SRC-009 (Ontario Public Accounts) | CV-REG-001 · CV-CHK-005 · CV-SOP-001 · CV-POL-002 | Pending Review |
| **CV-SRC-REV-010** | Ontario Public Sector Salary Disclosure Review | `compliance/records/source-reviews/CV-SRC-REV-010 Ontario Public Sector Salary Disclosure Review.md` | Source Review Record | Founder / Data Lead | Draft | Before public launch; when source or licence changes | Internal | Pre-launch source review for SRC-010 (Sunshine List) — **HIGH-RISK** — named individuals with salaries; Privacy Commissioner guidance must be reviewed; second reviewer required | CV-REG-001 · CV-CHK-005 · CV-SOP-001 · CV-POL-002 | **High-Risk** — Pending Review — Privacy Commissioner guidance review and second reviewer required |
| **CV-SRC-REV-011** | Ontario Integrity Commissioner Review | `compliance/records/source-reviews/CV-SRC-REV-011 Ontario Integrity Commissioner Review.md` | Source Review Record | Founder / Data Lead | Draft | Before public launch; when source or licence changes | Internal | Pre-launch source review for SRC-011 (Ontario Integrity Commissioner) — **HIGHEST RISK** — named MPPs, ethics findings; second reviewer required | CV-REG-001 · CV-CHK-005 · CV-SOP-001 · CV-POL-002 | **Highest Risk** — Manual Review Only — second reviewer mandatory |

| **CV-RPT-001** | Canadian Source Decision Summary | `compliance/reports/CV-RPT-001 Canadian Source Decision Summary.md` | Report | Founder / Data Lead | Draft | After each Source Approval Batch; before public launch | Internal | Consolidated launch-readiness summary of all 11 Canadian source decisions: decision type, licence status, machine-readability, high-risk flags, second review requirements, launch blockers, and required next actions | CV-REG-001 · CV-SRC-REV-001–011 · CV-REG-003 · CV-IDX-001 | Updated after each Source Approval Batch. As of 2026-08-02: 4 Approved with Limitations, 4 Public Registry, 2 Manual Review Only, 1 Pending Review. No source cleared for public display. |

---

## 5. Document Categories

| Category | Document IDs | Count |
|---|---|---|
| **Index** | CV-IDX-001 | 1 |
| **Position Statement** | CV-COMP-001 | 1 |
| **Registers** | CV-REG-001 · CV-REG-002 · CV-REG-003 | 3 |
| **Policies** | CV-POL-001 · CV-POL-002 · CV-POL-003 · CV-POL-004 · CV-POL-005 | 5 |
| **Standard Operating Procedures (SOPs)** | CV-SOP-001 · CV-SOP-002 · CV-SOP-003 · CV-SOP-004 · CV-SOP-005 | 5 |
| **Checklists** | CV-CHK-001 · CV-CHK-002 · CV-CHK-003 · CV-CHK-004 · CV-CHK-005 | 5 |
| **Plans** | CV-PLAN-001 · CV-PLAN-002 · CV-PLAN-003 | 3 |
| **Records / Templates** | CV-REC-001 · CV-REC-002 · CV-REC-003 · CV-REC-004 · CV-REC-005 · CV-REC-006 · CV-REC-007 · CV-REC-008 · CV-REC-009 | 9 |
| **Source Review Records** | CV-SRC-REV-001 · CV-SRC-REV-002 · CV-SRC-REV-003 · CV-SRC-REV-004 · CV-SRC-REV-005 · CV-SRC-REV-006 · CV-SRC-REV-007 · CV-SRC-REV-008 · CV-SRC-REV-009 · CV-SRC-REV-010 · CV-SRC-REV-011 | 11 |
| **Reports** | CV-RPT-001 | 1 |

---

## 6. Document Owner Responsibilities

Each document has a named owner who is responsible for:

- Keeping the document accurate and up to date.
- Initiating reviews at the required frequency or when a trigger event occurs.
- Escalating proposed changes that have cross-document impact to the Compliance Lead.
- Ensuring the document status in this index is updated when the document changes.

| Owner Role | Documents Owned |
|---|---|
| **Founder / Compliance Lead** | CV-IDX-001 · CV-COMP-001 · CV-POL-003 · CV-POL-004 · CV-SOP-003 · CV-SOP-005 · CV-REC-004 · CV-REC-005 · CV-REC-009 |
| **Founder / Privacy Lead** | CV-POL-001 · CV-REG-002 |
| **Founder / Data Lead** | CV-REG-001 · CV-POL-002 · CV-SOP-001 · CV-SOP-002 · CV-REC-001 · CV-REC-002 · CV-REC-003 · CV-CHK-005 · CV-SRC-REV-001 through CV-SRC-REV-011 · CV-RPT-001 |
| **Founder / Technical Lead** | CV-SOP-004 · CV-REC-006 · CV-REC-007 · CV-REC-008 |
| **Founder / Product Lead** | CV-POL-005 · CV-CHK-001 · CV-PLAN-001 · CV-PLAN-002 · CV-PLAN-003 · CV-CHK-004 |

> Note: In the current single-founder phase, the Founder holds all owner roles. As the
> team grows, ownership should be delegated to named individuals and this table updated.

---

## 7. Review Frequency

| Frequency | Documents |
|---|---|
| **Monthly** (or on source / document changes) | CV-IDX-001 · CV-REG-001 · CV-POL-002 · CV-SOP-001 · CV-SOP-002 · CV-REC-002 · CV-REC-003 · CV-CHK-005 |
| **Quarterly** (or on incident / infrastructure / workflow change) | CV-REG-002 · CV-SOP-003 · CV-SOP-004 · CV-REC-006 · CV-REC-007 · CV-REC-008 |
| **Before launch + major UI changes** | CV-POL-001 · CV-POL-003 · CV-POL-004 · CV-POL-005 · CV-CHK-001 · CV-PLAN-001 · CV-PLAN-002 · CV-PLAN-003 · CV-CHK-004 |
| **Before launch of communication feature** | CV-SOP-005 |
| **When app scope or positioning changes** | CV-COMP-001 · CV-POL-003 · CV-POL-004 |
| **After each Source Approval Batch; before public launch** | CV-RPT-001 |

---

## 8. Draft / Approved Status Rules

| Status | Definition |
|---|---|
| **Draft** | Created but not yet legally reviewed or formally approved. Must not be used as the basis for public-facing statements without Approved status. |
| **Ready for Review** | Internally complete and ready for founder and/or legal counsel review. All TBD placeholders resolved; content considered final pending external review. |
| **Approved** | Reviewed and approved — by the document owner and, where required, legal counsel. Suitable for use in public-facing contexts or as the basis for operational decisions. |
| **Retired** | Replaced by a newer version or no longer applicable. Retained for historical reference but not in active use. |

**Rules:**

1. All documents in this package are currently **Draft**.
2. A document must reach **Approved** status before it is published to users, linked
   from the app, or submitted as part of an App Store review.
3. **Public-facing documents** (CV-POL-001, CV-POL-003, CV-POL-004, CV-POL-005) require
   legal counsel review before reaching Approved status.
4. **Internal documents** require Founder sign-off before reaching Approved status.
5. Any document moved from Draft to Approved must have the version number incremented
   and the Effective Date set.
6. This index must be updated whenever any document changes status.

---

## 9. Public-Facing vs Internal Documents

### Public-Facing (4 documents)

These documents will be published to users before or at launch. They must be **Approved**
before publication and must be linked from the app, the App Store listing, or a public
web page.

| Document ID | Title | Required Publication Location |
|---|---|---|
| CV-POL-001 | Privacy Policy | App About/Settings screen · App Store privacy URL · Google Play privacy URL |
| CV-POL-003 | Terms of Use | App About/Settings screen · App Store support URL · app footer |
| CV-POL-004 | Public Disclaimer and Non-Affiliation Statement | App footer (short form) · About page (full form) · App Store listing · Data Sources page |
| CV-POL-005 | Accessibility Statement | App About/Settings screen · public support URL |

Additionally, attribution wording derived from **CV-POL-002** will be adapted for the
public Data Sources page (civicvoice.ca/sources — TBD). The full policy document
remains internal.

### Internal (11 documents)

These documents are operational and compliance records. They are not published to users
but may be disclosed to legal counsel, regulators, auditors, or in legal proceedings.

CV-IDX-001 · CV-COMP-001 · CV-REG-001 · CV-REG-002 · CV-POL-002 · CV-SOP-001 ·
CV-SOP-002 · CV-SOP-003 · CV-CHK-001 · CV-SOP-004 · CV-SOP-005

---

## 10. Pre-Launch Open Items

The following items must be resolved before public launch of Civic Voice Canada. Each
item is flagged as a TBD placeholder in one or more documents in this package.

**Last status update: 2026-08-02 (Step 25)**

| # | Open Item | Affects | Priority | Status | Notes |
|---|---|---|---|---|---|
| 1 | **Fill operator legal name** — the registered legal name of the entity operating Civic Voice Canada | CV-POL-001 · CV-POL-003 · CV-POL-004 · CV-POL-005 · CV-SOP-004 · CV-SOP-005 | Critical | 🔴 **Open — TBD** | Not yet confirmed. Blocks all public-facing documents from reaching Approved status. |
| 2 | **Fill contact / support email address** | CV-POL-001 · CV-POL-003 · CV-POL-004 · CV-POL-005 · CV-SOP-003 · CV-SOP-005 | Critical | 🔴 **Open — TBD** | Not yet confirmed. Required in all public-facing documents and correction request intake. |
| 3 | **Fill mailing address** (required for CASL identification and Terms of Use) | CV-POL-003 · CV-POL-005 · CV-SOP-005 | Critical | 🔴 **Open — TBD** | Not yet confirmed. Required for CASL sender identification. |
| 4 | **Confirm governing province** for Terms of Use (Section 22) and Privacy Policy | CV-POL-003 | Critical | 🔴 **Open — TBD** | Not yet confirmed. Determines applicable provincial law and jurisdiction. |
| 5 | **Confirm Firebase / Vercel vendor details** — confirm data processing agreement (DPA) status with Vercel and Google/Firebase | CV-POL-001 · CV-REG-002 | High | 🟡 **Open — In Progress** | DPA status not yet confirmed. Review underway. |
| 6 | **Confirm analytics SDK decision** — whether any analytics SDK will be deployed at launch | CV-POL-001 · CV-REG-002 · CV-SOP-004 | High | 🟡 **Open — Pending decision** | If deployed, Privacy Policy and Data Map must be updated before launch. |
| 7 | **Confirm crash reporting decision** — whether Crashlytics or equivalent will be deployed | CV-POL-001 · CV-REG-002 | High | 🟡 **Open — Pending decision** | If deployed, Privacy Policy and Data Map must be updated before launch. |
| 8 | **Confirm account creation decision** — whether optional user accounts will be available at launch | CV-POL-001 · CV-POL-003 · CV-REG-002 | High | 🟡 **Open — Pending decision** | If yes, account-related sections require full review before launch. |
| 9 | **Confirm user data retention periods** — particularly for anonymous vote records in Firestore | CV-POL-001 · CV-REG-002 | High | 🟡 **Open — Pending decision** | TBD placeholders remain in CV-POL-001 §12. |
| 10 | **Confirm correction request intake email or form** — the channel through which users submit correction requests | CV-SOP-003 · CV-POL-003 | Medium | 🔴 **Open — TBD** | No intake channel confirmed. Blocks correction request process from being operational. |
| 11 | **Confirm public Data Sources page route** — the URL at which civicvoice.ca/sources or equivalent will be published | CV-POL-002 · CV-POL-004 | Medium | 🟡 **Open — Pending** | Route not yet confirmed. |
| 12 | **Confirm App Store privacy labels** — Apple App Store and Google Play data safety section must accurately reflect CV-REG-002 | CV-REG-002 · CV-POL-001 | Critical | 🔴 **Open — Pending** | Labels not yet completed. Required before App Store submission. |
| 13 | **Legal review of public-facing documents** before Approved status is set | CV-POL-001 · CV-POL-003 · CV-POL-004 · CV-POL-005 | Critical | 🔴 **Open — Pending** | Legal review not yet conducted. All public-facing documents remain Draft. No document can be published until review is complete and operator legal name / governing province are confirmed. |
| 14 | **Accessibility review** — complete CV-CHK-001 against the live app before CV-POL-005 is published | CV-CHK-001 · CV-POL-005 | High | 🟡 **Open — Not yet started** | CV-CHK-001 not yet completed against live app. |
| 15 | **Firestore security rules review** — complete the review in CV-SOP-004 Section 7 before public launch | CV-SOP-004 | High | 🔴 **Open — Pending** | Review not yet conducted. Required before public launch. Firestore Rules Review Record does not yet exist. |
| 16 | **Data Source Register licence review** — all active CV-REG-001 source entries must reach Licence Status: Approved or Public Registry before public display | CV-REG-001 · CV-POL-002 · CV-RPT-001 | Critical | 🟡 **In Progress** | **2026-08-02:** Source Approval Batches 1 and 2 complete. All 11 sources now have confirmed licence/terms decisions — no source remains at Review Required. Remaining open: dataset URLs, reporting periods, first fetch dates, and CV-REC-001 verification must be confirmed for all active launch sources. Second reviewers required for 5 high-risk sources. See CV-RPT-001 for full launch blocker detail. |

> **15 of 16 items are open.** Item 16 (Data Source Register licence review) has moved
> from Open to In Progress — licence decisions confirmed for all 11 sources; dataset-level
> verification remains open. All other Critical items are unchanged. Items 1–4 (legal name,
> contact email, mailing address, governing province) are the prerequisite for all others —
> no public-facing document can be finalised until these are confirmed.

---

## 11. Change History

This section records significant changes to the compliance package — new documents
added, documents approved, documents retired, and major revisions.

| Date | Change | Document(s) Affected | Author |
|---|---|---|---|
| 2026-07-26 | Initial package created — Steps 1–13 drafted | All documents | Founder / Compliance Lead |
| 2026-08-02 | CV-REG-001 created — status updated from TBD to Draft; 11 placeholder source entries added | CV-REG-001 · CV-IDX-001 | Founder / Data Lead |
| 2026-08-02 | Pre-launch open items status updated — 8 items confirmed open/pending; Status column and item 16 (licence review) added to Section 10 | CV-IDX-001 | Founder / Compliance Lead |
| 2026-08-02 | CV-REG-003 Open Issues Register created — 16 initial issues; index updated to 16 documents, 3 registers | CV-REG-003 · CV-IDX-001 | Founder / Compliance Lead |
| 2026-08-02 | CV-CHK-002 Pre-Launch Compliance Checklist and CV-CHK-003 App Store Privacy Labels Checklist created; index updated to 17 documents, 3 checklists | CV-CHK-002 · CV-CHK-003 · CV-IDX-001 | Founder / Compliance Lead |
| 2026-08-02 | CV-PLAN-001 Public Legal Pages Implementation Plan created; compliance/plans/ directory added; index updated to 18 documents; Plans category added; CV-REG-003 registered in categories table | CV-PLAN-001 · CV-IDX-001 | Founder / Product Lead |
| 2026-08-02 | CV-PLAN-002 Canadian Launch Scope Control Plan created; index updated to 19 documents | CV-PLAN-002 · CV-IDX-001 | Founder / Product Lead |
| 2026-08-02 | CV-CHK-004 Public UI Compliance Implementation Checklist created; index updated to 20 documents, 4 checklists | CV-CHK-004 · CV-IDX-001 | Founder / Product Lead |
| 2026-08-02 | 9 compliance record templates created (CV-REC-001 through CV-REC-009); compliance/records/templates/ directory added; Records / Templates category added to index; index updated to 29 documents | CV-REC-001–009 · CV-IDX-001 | Founder / Compliance Lead |
| 2026-08-02 | CV-CHK-005 Canadian Source Review Checklist created; index updated to 30 documents, 5 checklists | CV-CHK-005 · CV-IDX-001 | Founder / Data Lead |
| 2026-08-02 | 11 source review records created (CV-SRC-REV-001 through CV-SRC-REV-011) — one per CV-REG-001 source; compliance/records/source-reviews/ directory added; Source Review Records category added to index; index updated to 41 documents; 4 sources flagged high-risk (CV-SRC-REV-005, 006, 007, 010, 011) | CV-SRC-REV-001–011 · CV-IDX-001 | Founder / Data Lead |
| 2026-08-02 | Step 25: CV-RPT-001 Canadian Source Decision Summary created; compliance/reports/ directory added; Reports category added to index; index updated to 42 documents. CV-ISS-016 status updated to In Progress in pre-launch open items. CV-REG-003 updated to v0.2. | CV-RPT-001 · CV-REG-003 · CV-IDX-001 | Founder / Data Lead |
| 2026-08-02 | Step 26: CV-PLAN-003 Canadian Launch Dataset Selection Plan created; Plans count updated to 3; document count updated to 43; owner and review frequency tables updated. | CV-PLAN-003 · CV-IDX-001 | Founder / Data Lead |

---

## 12. Approval

This index is considered complete when:

1. All documents listed are at **Approved** status or have a confirmed plan for
   pre-launch review.
2. All pre-launch open items in Section 10 are resolved.
3. The Founder and Compliance Lead have signed off below.

| Role | Name | Date |
|---|---|---|
| Compliance Lead | TBD | TBD |
| Founder | TBD | TBD |
| Legal Reviewer | TBD | TBD |

---

> **Final Note:** This index is a draft and must be reviewed before public launch of
> Civic Voice Canada. Legal counsel should be provided with this index and all linked
> documents as a single package for review. The index is the recommended starting point
> — it gives counsel the full scope of documents, their owners, and their public/internal
> classification before individual document review begins.

---

## Change Log

| Version | Date | Author | Change |
|---|---|---|---|
| 0.1 | 2026-07-26 | Founder / Compliance Lead | Initial draft — Canadian launch scope; 14 documents indexed |
| 0.2 | 2026-08-02 | Founder / Data Lead | Step 25: CV-RPT-001 added; Reports category and compliance/reports/ directory added; document count updated to 42; CV-ISS-016 status updated to In Progress; Review Frequency table updated; owner table updated; change history updated. |
| 0.3 | 2026-08-02 | Founder / Data Lead | Step 26: CV-PLAN-003 Canadian Launch Dataset Selection Plan added; Plans count updated to 3; document count updated to 43; owner table and review frequency table updated. |
