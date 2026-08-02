# CV-REG-003 — Open Issues Register

| Field | Value |
|---|---|
| **Document ID** | CV-REG-003 |
| **Version** | 0.1 |
| **Status** | Draft |
| **Owner** | Founder / Compliance Lead |
| **Effective Date** | 2026-08-02 |
| **Scope** | Civic Voice Canada only |
| **Related Documents** | CV-IDX-001 Canadian Compliance Package Index · CV-CHK-002 Pre-Launch Compliance Checklist · CV-SOP-003 Correction Request Procedure · CV-SOP-004 Security and Firebase Access Procedure |
| **Review Frequency** | Weekly before public launch; monthly after public launch |

---

## 1. Purpose

This register tracks open compliance, privacy, data-source, security, accessibility,
App Store, and launch-readiness issues for Civic Voice Canada.

Its goals are to:

- Maintain a single live list of every unresolved compliance issue that must be addressed
  before or after public launch.
- Make it immediately clear which issues are launch blockers, which are in progress, and
  which are awaiting a decision or external review.
- Provide an audit trail for how each issue was identified, tracked, and closed.
- Support weekly pre-launch reviews and monthly post-launch reviews.
- Integrate with CV-CHK-002 (Pre-Launch Compliance Checklist) so that checklist Fail
  items and open items translate directly into tracked issues.

---

## 2. Scope

This register covers compliance issues arising from:

- Pre-launch compliance checklist items (CV-CHK-002)
- Pre-launch open items in CV-IDX-001 Section 10
- Post-publication correction requests that reveal systemic compliance gaps
- Security incidents or access control gaps (CV-SOP-004)
- Accessibility failures identified in CV-CHK-001
- Data source licence, verification, or attribution gaps (CV-REG-001 / CV-POL-002)
- Privacy or CASL compliance gaps (CV-POL-001 / CV-SOP-005)
- App Store submission issues

This register does **not** track:

- Individual user correction requests — those are tracked in CV-SOP-003 Correction
  Request Records.
- Monthly data update failures — those are tracked in CV-SOP-002 Monthly Update Logs.
- Security incident response steps — those are tracked in CV-SOP-004 Security Incident
  Records.

---

## 3. Issue Status Definitions

| Status | Definition |
|---|---|
| **Open** | Issue identified and logged. No action taken yet. |
| **In Progress** | Action has been started. An owner is actively working toward resolution. |
| **Pending Decision** | Resolution requires a decision from the Founder or another named decision-maker. Issue is blocked pending that decision. |
| **Pending External Review** | Resolution requires input from an external party — legal counsel, App Store review, a vendor, or a regulator. Issue is blocked pending that input. |
| **Closed** | Issue fully resolved. Resolution evidence confirmed. Closure decision recorded. |
| **Deferred** | Issue is acknowledged but deliberately deferred to a later date or release. Deferral must be documented with a reason and a target date. Critical issues may not be Deferred without Founder sign-off. |
| **Risk Accepted** | Issue is known and unresolved, but the Founder has formally accepted the residual risk and documented the rationale. Critical issues may be Risk Accepted only in exceptional circumstances with written Founder approval and a documented mitigation. |

---

## 4. Priority Definitions

| Priority | Definition |
|---|---|
| **Critical** | Launch blocker. Must be Closed or formally Risk Accepted before public launch or App Store submission. Cannot be Deferred without Founder sign-off and a documented mitigation. |
| **High** | Should be Closed before public launch. May be Deferred or Risk Accepted with Founder sign-off and a documented plan to resolve within 30 days of launch. |
| **Medium** | May be resolved shortly after launch. Must not remain open indefinitely. Target resolution within 60 days of launch. |
| **Low** | Improvement item. Does not block launch. Target resolution within 90 days of opening. |

---

## 5. Open Issues Register

> **How to read this table:** Each row is one issue. Add new rows at the bottom of the
> table in sequence (CV-ISS-017, CV-ISS-018, …). Do not delete rows — set Status to
> Closed and record the Closed Date and Closure Decision. Update this table at each
> weekly or monthly review.

---

| Issue ID | Date Opened | Issue Title | Description | Related Document | Priority | Status | Owner | Target Resolution Date | Resolution Evidence Required | Closure Decision | Closed Date | Reviewer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **CV-ISS-001** | 2026-08-02 | Operator legal name TBD | The registered legal name of the entity operating Civic Voice Canada has not been confirmed. All public-facing documents contain the placeholder `[OPERATOR LEGAL NAME — TBD]`. No document can reach Approved status or be published until this is resolved. | CV-POL-001 · CV-POL-003 · CV-POL-004 · CV-POL-005 · CV-SOP-004 · CV-SOP-005 | Critical | Open | Founder | TBD | Confirmed legal name recorded; all `[OPERATOR LEGAL NAME — TBD]` placeholders replaced in all affected documents; document versions incremented | | | | Prerequisite for CV-ISS-013 (legal review). Must be resolved before any public-facing document is finalised. |
| **CV-ISS-002** | 2026-08-02 | Contact / support email TBD | No contact or support email address has been confirmed. Placeholder `[CONTACT EMAIL — TBD]` appears in all public-facing documents and in correction request intake. | CV-POL-001 · CV-POL-003 · CV-POL-004 · CV-POL-005 · CV-SOP-003 · CV-SOP-005 | Critical | Open | Founder | TBD | Confirmed email address recorded; all `[CONTACT EMAIL — TBD]` placeholders replaced; inbox confirmed as monitored | | | | Also unblocks CV-ISS-010 (correction request intake). |
| **CV-ISS-003** | 2026-08-02 | Mailing address TBD | No mailing address has been confirmed for CASL sender identification and Terms of Use. | CV-POL-003 · CV-POL-005 · CV-SOP-005 | Critical | Open | Founder | TBD | Confirmed mailing address or P.O. Box recorded; placeholder replaced in all affected documents | | | | Required for CASL compliance — every commercial electronic message must identify a mailing address. |
| **CV-ISS-004** | 2026-08-02 | Governing province TBD | The governing province for Terms of Use (§22) has not been confirmed. This determines which provincial law applies to disputes and user rights. | CV-POL-003 | Critical | Open | Founder | TBD | Confirmed governing province recorded; §22 of CV-POL-003 updated; legal counsel briefed on applicable provincial law | | | | Must be confirmed before legal review (CV-ISS-013) can be completed. |
| **CV-ISS-005** | 2026-08-02 | Firebase / Vercel DPA confirmation | Data processing agreement (DPA) status with Vercel and Google/Firebase has not been confirmed. CV-POL-001 §8 and §17 disclose cross-border processing to the US — the DPA is the contractual basis for this transfer. | CV-POL-001 · CV-REG-002 | High | In Progress | Founder | TBD | DPA status confirmed for Vercel and Firebase/Google; DPA reference or URL recorded; CV-POL-001 §8 updated if needed | | | | Firebase standard terms include a DPA — confirm current URL and version. Vercel also publishes a DPA. |
| **CV-ISS-006** | 2026-08-02 | Analytics SDK decision | No decision has been made on whether an analytics SDK will be deployed at launch. If deployed, CV-POL-001 and CV-REG-002 must be updated before launch to disclose data collection. | CV-POL-001 · CV-REG-002 · CV-SOP-004 | High | Pending Decision | Founder | TBD | Decision recorded (deploy / do not deploy); if deploying: CV-REG-002 updated, CV-POL-001 §9 updated, SDK selected reviewed for PIPEDA compliance | | | | Options: Firebase Analytics, Plausible, PostHog, or none. Decision affects PRV-05 in CV-CHK-002. |
| **CV-ISS-007** | 2026-08-02 | Crash reporting decision | No decision has been made on whether a crash reporting SDK (e.g., Firebase Crashlytics) will be deployed at launch. If deployed, disclosure and data-minimisation controls are required. | CV-POL-001 · CV-REG-002 | High | Pending Decision | Founder | TBD | Decision recorded (deploy / do not deploy); if deploying: CV-REG-002 updated, CV-POL-001 §9 updated, confirmed no PII in crash log payloads | | | | If not deploying at launch, close as NA. |
| **CV-ISS-008** | 2026-08-02 | Account creation decision | No decision has been made on whether optional user accounts will be available at launch. If yes, account-related sections across CV-POL-001, CV-POL-003, and CV-REG-002 require full review. | CV-POL-001 · CV-POL-003 · CV-REG-002 | High | Pending Decision | Founder | TBD | Decision recorded (enable accounts at launch / not at launch); if enabling: CV-REG-002 updated, CV-POL-001 §4.4 updated, Firebase Authentication consent flow reviewed | | | | Current assumption: no accounts at launch. If that remains the case, close as confirmed-NA at launch decision. |
| **CV-ISS-009** | 2026-08-02 | Data retention periods decision | User data retention periods, particularly for anonymous vote records in Firestore, have not been confirmed. TBD placeholders remain in CV-POL-001 §12 and CV-REG-002. | CV-POL-001 · CV-REG-002 | High | Pending Decision | Founder · Privacy Lead | TBD | Retention periods confirmed for all data categories in CV-REG-002; TBD placeholders in CV-POL-001 §12 replaced with confirmed periods | | | | Key decision: how long are individual `citizen_votes` records retained before deletion or aggregation? |
| **CV-ISS-010** | 2026-08-02 | Correction request intake channel | No correction request intake email address or in-app form has been confirmed. Users have no way to submit data correction requests until this is in place. Depends on CV-ISS-002 (contact email). | CV-SOP-003 · CV-POL-003 · CV-CHK-002 | Medium | Open | Compliance Lead | TBD | Intake channel confirmed and working (email or form); channel linked from app UI or About page; inbox confirmed as monitored at least weekly | | | | Unblocked once CV-ISS-002 (contact email) is resolved. May use the same email address. |
| **CV-ISS-011** | 2026-08-02 | Public Data Sources page route | The URL at which the public Data Sources page (civicvoice.ca/sources or equivalent) will be published has not been confirmed. OGL-Canada 2.0 attribution and source transparency depend on this page being live before launch. | CV-POL-002 · CV-POL-004 · CV-CHK-002 | Medium | Pending Decision | Founder · Developer | TBD | Route confirmed; Data Sources page live and accessible; OGL-Canada attribution notice present; source list from CV-REG-001 reflected on page | | | | Attribution wording from CV-POL-002 §6.2 and CV-POL-004 §6 to be used on this page. |
| **CV-ISS-012** | 2026-08-02 | App Store privacy labels | Apple App Store privacy nutrition labels and Google Play Data Safety section have not been completed. These must accurately reflect CV-REG-002 (Privacy Data Map). Inaccurate labels are an App Store rejection risk. | CV-REG-002 · CV-POL-001 · CV-CHK-002 | Critical | Open | Founder · Developer | TBD | App Store privacy labels completed and confirmed to match CV-REG-002; Google Play Data Safety section completed; discrepancies between labels and actual data collection resolved | | | | Cannot close until CV-REG-002 reflects actual app behaviour (CV-ISS-009 retention periods must also be resolved). |
| **CV-ISS-013** | 2026-08-02 | Legal review of public-facing documents | Legal counsel review of CV-POL-001 (Privacy Policy), CV-POL-003 (Terms of Use), CV-POL-004 (Public Disclaimer), and CV-POL-005 (Accessibility Statement) has not been conducted. All four documents remain Draft. | CV-POL-001 · CV-POL-003 · CV-POL-004 · CV-POL-005 | Critical | Pending External Review | Founder | TBD | Legal counsel review completed; all four public-facing documents updated with counsel's recommendations; documents set to Approved status; Effective Dates set | | | | Blocked by CV-ISS-001 (legal name), CV-ISS-002 (contact email), CV-ISS-003 (mailing address), CV-ISS-004 (governing province) — these must be resolved before legal review can be completed. |
| **CV-ISS-014** | 2026-08-02 | Accessibility review | CV-CHK-001 (Accessibility Checklist) has not been completed against the live app. The Accessibility Statement (CV-POL-005) Known Limitations table cannot be finalised until the review is done. | CV-CHK-001 · CV-POL-005 · CV-CHK-002 | High | Open | Product Lead · Developer | TBD | CV-CHK-001 completed and signed off; all Fail items either resolved or documented as known limitations in CV-POL-005 §5; CV-POL-005 Known Limitations table updated | | | | Requires access to the live app or a production-equivalent build. Separate from legal review. |
| **CV-ISS-015** | 2026-08-02 | Firestore security rules review | The Firestore security rules review defined in CV-SOP-004 §7 has not been conducted. No Firestore Rules Review Record exists. Production rules have not been validated against intended read/write behaviour. | CV-SOP-004 | High | Open | Technical Lead | TBD | Firestore Rules Review Record created and signed off; all collections reviewed against CV-SOP-004 §7.2 checklist; no unintended public read or write access confirmed | | | | Cannot close until production rules are reviewed — not dev/emulator rules. |
| **CV-ISS-016** | 2026-08-02 | Data Source Register licence review | All 11 current CV-REG-001 entries are at Licence Status: Review Required. No source has been cleared for public display. Sources must reach Approved or Public Registry status before the data they provide can be shown to users. | CV-REG-001 · CV-POL-002 · CV-CHK-002 | Critical | Open | Data Lead | TBD | All active launch sources in CV-REG-001 updated to Licence Status: Approved or Public Registry; source URL, source owner, reporting period, fetched date, and verification status confirmed for each; no source at Review Required status used for public display | | | | Review each source against CV-POL-002 §7. OGL-Canada 2.0, Statistics Canada Open Licence, and provincial open licences are the primary frameworks to confirm. |

---

## 6. Issue Review Rules

**Pre-launch (weekly review):**

1. The Compliance Lead reviews the register weekly and updates Status for all open issues.
2. Any issue that has not progressed in two consecutive weekly reviews is escalated to
   the Founder.
3. New issues identified during development, testing, or checklist reviews must be added
   within 2 business days of identification.
4. The register summary (total open / Critical open / High open) must be reported to
   the Founder at each weekly review.

**Post-launch (monthly review):**

1. The Compliance Lead reviews the register monthly as part of the CV-SOP-002 monthly
   update cycle.
2. Any issue opened since the last review is triaged and assigned an owner and target
   date.
3. Any issue that has been In Progress or Pending Decision for more than 60 days without
   progress is escalated to the Founder.

---

## 7. Closure Rules

An issue may only be set to **Closed** when:

1. The Resolution Evidence Required has been produced and confirmed.
2. The Closure Decision is documented in the issue row.
3. The Closed Date is recorded.
4. The Reviewer has confirmed the closure.

**Specific closure dependencies:**

| Issue | Cannot Close Until |
|---|---|
| CV-ISS-013 (Legal review) | CV-ISS-001 (legal name), CV-ISS-002 (contact email), CV-ISS-003 (mailing address), and CV-ISS-004 (governing province) are all Closed |
| CV-ISS-012 (App Store labels) | CV-REG-002 reflects actual app behaviour; CV-ISS-009 (data retention) is Closed or confirmed-NA |
| CV-ISS-016 (Licence review) | All active launch sources in CV-REG-001 have confirmed source URL, source owner, licence/terms status, reporting period, fetched date, and verification status; no source remains at Licence Status: Review Required |
| CV-ISS-015 (Firestore rules review) | Production Firestore rules have been reviewed against CV-SOP-004 §7.2; Firestore Rules Review Record exists and is signed off |
| CV-ISS-010 (Correction request intake) | CV-ISS-002 (contact email) is Closed; intake channel is live and monitored |

**Risk Accepted closure:**

A Critical issue may be closed as Risk Accepted only if:

1. The Founder provides written approval.
2. A documented mitigation is in place.
3. A target date for full resolution is recorded.
4. The risk acceptance is noted in the Closure Decision field.

---

## 8. Escalation Rules

| Situation | Escalation |
|---|---|
| Any Critical issue is unresolved 14 days before the planned launch date | Founder — launch must not proceed until resolved or formally risk-accepted |
| Any Critical issue has had no status change for 14 consecutive days | Founder |
| Legal review (CV-ISS-013) has not begun 30 days before planned launch | Founder — engage legal counsel immediately |
| Firestore rules review (CV-ISS-015) identifies a security gap | Technical Lead and Founder immediately; do not launch until resolved |
| App Store submission is rejected due to a compliance issue in this register | Founder and Compliance Lead; treat as a new issue or update the relevant existing issue |
| A new Critical issue is identified at any time | Founder notified within 1 business day |

---

## 9. Change History

| Version | Date | Author | Change |
|---|---|---|---|
| 0.1 | 2026-08-02 | Founder / Compliance Lead | Initial register created — 16 open issues from CV-IDX-001 pre-launch open items |

---

## 10. Approval

This register is live from the date it is created and does not require formal approval
to operate — issues may be added, updated, and closed by the Compliance Lead at any
time. The register as a whole is reviewed and signed off as part of the CV-CHK-002
Pre-Launch Compliance Checklist.

| Role | Name | Date |
|---|---|---|
| Compliance Lead | TBD | TBD |
| Founder | TBD | TBD |

---

## Related Documents

| Document | Status |
|---|---|
| [CV-IDX-001 Canadian Compliance Package Index](../CV-IDX-001%20Canadian%20Compliance%20Package%20Index.md) | Draft |
| [CV-CHK-002 Pre-Launch Compliance Checklist](../checklists/CV-CHK-002%20Pre-Launch%20Compliance%20Checklist.md) | Draft |
| [CV-SOP-003 Correction Request Procedure](../procedures/CV-SOP-003%20Correction%20Request%20Procedure.md) | Draft |
| [CV-SOP-004 Security and Firebase Access Procedure](../procedures/CV-SOP-004%20Security%20and%20Firebase%20Access%20Procedure.md) | Draft |
| [CV-REG-001 Data Source Register](CV-REG-001%20Data%20Source%20Register.md) | Draft |
| [CV-REG-002 Privacy Data Map](CV-REG-002%20Privacy%20Data%20Map.md) | Draft |
