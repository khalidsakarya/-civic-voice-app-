# CV-PLAN-001 — Public Legal Pages Implementation Plan

| Field | Value |
|---|---|
| **Document ID** | CV-PLAN-001 |
| **Version** | 0.1 |
| **Status** | Draft |
| **Owner** | Founder / Product Lead |
| **Effective Date** | TBD — pending review |
| **Scope** | Civic Voice Canada only |
| **Related Documents** | CV-POL-001 Privacy Policy · CV-POL-002 Data Sources and Attribution Policy · CV-POL-003 Terms of Use · CV-POL-004 Public Disclaimer and Non-Affiliation Statement · CV-POL-005 Accessibility Statement · CV-REG-001 Data Source Register · CV-REG-003 Open Issues Register · CV-CHK-002 Pre-Launch Compliance Checklist · CV-CHK-003 App Store Privacy Labels Checklist |
| **Review Frequency** | Before public launch; before App Store submission; when public routes, navigation, or legal document content changes materially |

---

> ⚠️ **DRAFT — NOT YET IN EFFECT**
>
> This plan has not been reviewed by legal counsel and is not yet formally adopted.
> No app code should be written, no routes should be created, and no legal page content
> should be published until:
>
> 1. All content readiness gates in Section 9 are resolved.
> 2. The public-facing source documents (CV-POL-001, CV-POL-003, CV-POL-004,
>    CV-POL-005) have reached **Approved** status.
> 3. The Founder and any legal reviewer have signed off on this plan (Section 12).

---

## 1. Purpose

This plan defines which Civic Voice Canada compliance documents will be converted into
public-facing app pages, where those pages will appear in the app's navigation, what
the App Store and Google Play support / privacy URLs will point to, and what must be
completed before any page is published.

Its goals are to:

- Establish a single authoritative source for the mapping between internal compliance
  documents and public app routes.
- Define the public/internal document boundary so that internal SOPs, registers, and
  checklists are never exposed to users.
- Specify the content readiness gates that each public page must pass before it is
  published.
- Provide implementation rules that ensure public legal pages are accessible, accurate,
  and legally safe.
- Satisfy pre-launch requirements in CV-CHK-002 (App-Store submission section) and
  CV-CHK-003 (privacy label URL requirement).

---

## 2. Scope

This plan covers:

- All app routes intended to host compliance or legal content
- Footer and in-app navigation links to legal pages
- App Store Connect and Google Play support, privacy, and marketing URLs that point to
  live public pages
- The correction/contact intake page for user correction requests

This plan does **not** cover:

- App marketing pages or the main civicvoice.ca website beyond legal page routes
- Implementation of civic content pages (official profiles, vote counts, MP tracker)
- Backend data pipeline, Firestore rules, or infrastructure configuration
- Future US, UK, or Australian launch legal pages

---

## 3. Public vs Internal Document Boundary

### 3.1 Principle

Only documents that are intended for users — and that have been fully reviewed, had all
TBD placeholders resolved, and reached **Approved** status — may be published as public
app pages. All other compliance documents are internal and must never be exposed to
users, linked from public pages, or referenced in a way that suggests they are
publicly available.

### 3.2 Why this boundary matters

Internal documents contain:

- Operational details about data pipelines, security procedures, and Firebase
  configuration that should not be disclosed publicly.
- Open issues and known compliance gaps that have not yet been resolved.
- Draft warnings and TBD placeholders that could mislead users or create legal liability
  if published as authoritative statements.
- Enforcement and incident response procedures that are not intended for user
  consumption.

Publishing an internal document by mistake — even temporarily — could mislead users,
expose security posture, or create liability. This plan's rules in Section 10 are
designed to prevent that.

---

## 4. Planned Public Legal Pages

The following six pages are planned for public deployment. Each page is based on a
specific compliance document and has a proposed route (see Section 6).

| Page | Source Document | Proposed Route | Purpose | Status |
|---|---|---|---|---|
| **Privacy Policy** | CV-POL-001 | `/privacy` | Discloses what personal information is collected, how it is used, and user rights under PIPEDA | Source document: Draft — not yet Approved |
| **Terms of Use** | CV-POL-003 | `/terms` | Governs user access, acceptable use, disclaimers, limitation of liability, and governing law | Source document: Draft — not yet Approved |
| **Accessibility Statement** | CV-POL-005 | `/accessibility` | States WCAG 2.1 AA accessibility target, known limitations, and accessibility feedback channel | Source document: Draft — not yet Approved |
| **Disclaimer and Non-Affiliation** | CV-POL-004 | `/disclaimer` | Full-form disclaimer: no government endorsement, no official affiliation, limitations of civic data | Source document: Draft — not yet Approved |
| **Data Sources** | CV-POL-002 (attribution wording) + approved entries from CV-REG-001 | `/sources` | Public-facing list of civic data sources, licences, and attribution. Not the full CV-REG-001 register — only entries that have cleared the licence review in CV-REG-001. | Source documents: Draft — CV-REG-001 licence review not yet completed |
| **Corrections / Contact** | CV-SOP-003 (public intake instructions only) | `/corrections` or `/contact` | Allows users to submit correction requests or contact Civic Voice Canada. Displays intake channel (email or form) without exposing internal triage or escalation procedure. | Intake channel TBD — CV-SOP-003 §8 open item |

> **Note on `/sources`:** The full CV-REG-001 Data Source Register is internal. The
> `/sources` page must be built from a separate public-facing content layer — approved
> source name, jurisdiction, licence name, and attribution wording only. No internal
> Licence Status, TBD, or Review Required entries may appear on the public page.

> **Note on `/corrections`:** Only the user-facing intake instructions from CV-SOP-003
> should appear on this page — the intake email or form link, what to include in a
> submission, and expected response time. The internal triage, risk classification,
> escalation, and closure procedures in CV-SOP-003 must not be exposed.

---

## 5. Documents That Must Remain Internal

The following documents are internal-only and must never be published, linked, or
referenced in a way that implies public availability.

| Document | Reason |
|---|---|
| **CV-REG-001** Data Source Register (full) | Contains licence review status, TBD fields, and operational source notes not intended for users. Only approved public source summaries may appear on `/sources`. |
| **CV-REG-002** Privacy Data Map | Internal privacy compliance record; contains schema details, retention periods, and open issues not intended for users. |
| **CV-REG-003** Open Issues Register | Lists known compliance gaps, open risks, and unresolved critical items. Must never be public. |
| **CV-SOP-001** Data Verification SOP | Operational procedure for the data pipeline. Not relevant to users. |
| **CV-SOP-002** Monthly Data Update SOP | Operational procedure for monthly data fetches. Not relevant to users. |
| **CV-SOP-003** Correction Request Procedure (full) | Internal triage, escalation, and closure procedure. Only public intake instructions (channel, what to include, response time) may appear on `/corrections`. |
| **CV-SOP-004** Security and Firebase Access Procedure | Security configuration details must not be publicly disclosed. |
| **CV-SOP-005** CASL Communications Procedure | Internal compliance procedure for electronic communications. Not relevant to users. |
| **CV-CHK-001** Accessibility Checklist | Internal audit checklist. CV-POL-005 is the public-facing accessibility statement. |
| **CV-CHK-002** Pre-Launch Compliance Checklist | Internal pre-launch gate record. Not relevant to users. |
| **CV-CHK-003** App Store Privacy Labels Checklist | Internal privacy label audit record. Not relevant to users. |
| **CV-IDX-001** Compliance Package Index | Internal compliance management document. Must never be public. |
| **CV-COMP-001** Compliance Position Statement | Internal compliance posture record. Not relevant to users. |
| **CV-PLAN-001** This document | Internal implementation plan. Not relevant to users. |

---

## 6. Proposed App Routes

> These routes are proposed and have not yet been confirmed. Route names must be agreed
> and implemented before App Store Connect and Google Play privacy / support URL fields
> can be filled in.

| Route | Page | Hosted At | Notes |
|---|---|---|---|
| `/privacy` | Privacy Policy | TBD — civicvoice.ca or in-app route | Required by App Store Connect and Google Play before submission |
| `/terms` | Terms of Use | TBD — civicvoice.ca or in-app route | Should be linkable from the app's About / Settings screen |
| `/accessibility` | Accessibility Statement | TBD — civicvoice.ca or in-app route | Should be linkable from the app's About / Settings screen |
| `/disclaimer` | Disclaimer and Non-Affiliation | TBD — civicvoice.ca or in-app route | Full-form version; short-form wording appears in the app footer and on data display pages |
| `/sources` | Data Sources | TBD — civicvoice.ca or in-app route | Public source list built from approved CV-REG-001 entries; must never expose full register |
| `/corrections` or `/contact` | Corrections / Contact | TBD — civicvoice.ca or in-app route | Correction request intake; exposes only public intake instructions from CV-SOP-003 |

### 6.1 Hosting decision

Civic Voice Canada's public legal pages may be hosted:

- As routes within the main Civic Voice web app / PWA
- As static pages at civicvoice.ca or a subdomain
- As a combination of the above

The hosting decision must be confirmed before App Store Connect URLs can be finalised.
The chosen hosting approach does not change the content rules in this plan.

---

## 7. Footer / Menu Link Requirements

The following links must appear in the app footer or the About / Settings menu before
public launch.

| Link Label | Target Route | Required Location | Notes |
|---|---|---|---|
| Privacy | `/privacy` | App footer · About/Settings screen | Required by Apple App Store and Google Play |
| Terms | `/terms` | App footer · About/Settings screen | |
| Accessibility | `/accessibility` | App footer · About/Settings screen | |
| Sources | `/sources` | App footer or dedicated Data section | Supports transparency obligation |
| Disclaimer | `/disclaimer` | App footer | Short-form wording may appear inline; link must go to full form |
| Corrections / Contact | `/corrections` or `/contact` | App footer · About/Settings screen | Supports correction request obligation in CV-SOP-003 |

### 7.1 Short-form disclaimer placement

In addition to the `/disclaimer` link in the footer, the short-form disclaimer wording
from CV-POL-004 §6.1 must appear:

- On the in-app About page or Settings screen
- On each data display page that shows official information about MPs, senators, or
  government bodies (at minimum as a footer note or tap-accessible tooltip)
- In the App Store listing description

The short-form wording must not be omitted on pages that display civic data, even if
the footer link is present.

### 7.2 No government endorsement language

No footer, menu, or legal page may contain language implying that Civic Voice Canada
is endorsed by, affiliated with, or approved by any government body. The disclaimer
wording in CV-POL-004 is the approved language.

---

## 8. App Store / Support URL Requirements

The following URL fields must be filled in App Store Connect and Google Play before
submission. Each requires a live, publicly accessible page.

| Platform | Field | Required URL | Page Required | Status |
|---|---|---|---|---|
| Apple App Store | Privacy Policy URL | `civicvoice.ca/privacy` (or confirmed equivalent) | `/privacy` page live and Approved | 🔴 TBD — page not yet created |
| Apple App Store | Support URL | `civicvoice.ca/corrections` or `/contact` (or confirmed equivalent) | `/corrections` or `/contact` page live | 🔴 TBD — intake channel not confirmed |
| Apple App Store | Marketing URL | `civicvoice.ca` (or confirmed equivalent) | Main site live | 🔴 TBD |
| Google Play | Privacy Policy URL | Same as Apple or equivalent | `/privacy` page live and Approved | 🔴 TBD |
| Google Play | Data Safety — Privacy Policy link | Same as above | `/privacy` page live and Approved | 🔴 TBD |
| Google Play | App Support email / URL | Same as Apple support URL or support email | Live page or working email | 🔴 TBD |

> All App Store Connect and Google Play URL fields must be filled and verified live
> before submission. CV-CHK-002 App Store submission section confirms this gate.

---

## 9. Content Readiness Gates

No public legal page may be published until all of the following gates are passed for
that page. Gates are cumulative — passing Gate 1 does not allow publication if Gate 3
is still open.

| Gate ID | Gate | Required For | Status | Notes |
|---|---|---|---|---|
| GATE-01 | **Operator legal name filled** — the registered legal name of the entity operating Civic Voice Canada is confirmed and inserted in all relevant documents | All public pages | 🔴 Open — CV-IDX-001 item 1 | Blocks all public-facing documents from reaching Approved status |
| GATE-02 | **Contact / support email filled** — the support or privacy contact email is confirmed | `/privacy` · `/terms` · `/accessibility` · `/corrections` · `/contact` | 🔴 Open — CV-IDX-001 item 2 | Required in Privacy Policy, Terms of Use, Accessibility Statement, and correction intake |
| GATE-03 | **Mailing address confirmed** — CASL-required physical or mailing address for the operator | `/terms` · CASL identification requirement in CV-SOP-005 | 🔴 Open — CV-IDX-001 item 3 | |
| GATE-04 | **Governing province confirmed** — the province or territory whose laws govern the Terms of Use and Privacy Policy | `/privacy` · `/terms` | 🔴 Open — CV-IDX-001 item 4 | |
| GATE-05 | **Legal review completed** for CV-POL-001, CV-POL-003, CV-POL-004, CV-POL-005 | All public pages | 🔴 Open — CV-IDX-001 item 13 | No public-facing document may be published without legal review |
| GATE-06 | **Data Source Register licence review completed** — all active source entries in CV-REG-001 must reach Licence Status: Approved or Public Registry | `/sources` | 🔴 Open — CV-IDX-001 item 16 | No source entry may appear on the public `/sources` page until its licence status is cleared |
| GATE-07 | **Privacy Policy matches Privacy Data Map** — CV-POL-001 disclosures are consistent with CV-REG-002 at the time of publication | `/privacy` | 🟡 Pending — dependent on analytics/crash/account decisions (CV-IDX-001 items 6–8) | Any new SDK or feature deployed before launch must be reflected in both documents |
| GATE-08 | **App Store Privacy Labels Checklist completed** — CV-CHK-003 signed off and label decisions finalised | `/privacy` · App Store Connect | 🔴 Open — CV-ISS-012 in CV-REG-003 | Privacy label URL must point to a live `/privacy` page |
| GATE-09 | **Public disclaimer reviewed and approved** — CV-POL-004 wording approved and consistent with app positioning | `/disclaimer` · all pages carrying short-form disclaimer | 🔴 Open — dependent on GATE-05 | |
| GATE-10 | **Hosting and route decisions confirmed** — `/privacy`, `/terms`, `/accessibility`, `/disclaimer`, `/sources`, `/corrections` routes agreed and live | All public pages | 🔴 Open — TBD in Section 6 | Blocks App Store Connect URL fields |
| GATE-11 | **Correction request intake channel confirmed** — the email address or form that users submit correction requests to is live | `/corrections` · CV-SOP-003 | 🔴 Open — CV-IDX-001 item 10 | |
| GATE-12 | **Accessibility review of public legal pages completed** — the legal pages themselves meet WCAG 2.1 AA before publication | All public pages | 🔴 Open — dependent on pages being built | Public pages must themselves be accessible, not just describe an accessibility commitment |

---

## 10. Implementation Rules

The following rules govern implementation of all public legal pages. They apply to all
developers, designers, and contributors working on these pages.

**10.1 Never expose internal documents.**
No internal SOP, register, checklist, or draft compliance document may be linked from,
embedded in, or referenced as publicly available on any public page. See Section 5 for
the complete list of internal-only documents.

**10.2 No TBD placeholders in published pages.**
A public page must not be published while any TBD, [INSERT], [CONFIRM], or equivalent
placeholder remains in its content. All content readiness gates in Section 9 must be
passed before the page goes live.

**10.3 No draft warnings in final published pages.**
The ⚠️ DRAFT — NOT YET IN EFFECT warning blocks that appear at the top of all current
compliance documents are internal editorial markers. They must not appear in the
published public pages.

**10.4 Plain language.**
Public legal pages must use plain language accessible to a general Canadian audience.
Internal document jargon (e.g., "CV-POL-001", "CV-REG-002", "PIPEDA Article 4.3") must
not appear in the body text of public pages. Legal document references may appear in
document metadata or footers if useful for version tracking, but must not be the
primary navigation mechanism for users.

**10.5 Short-form disclaimer on every data page.**
The short-form disclaimer wording from CV-POL-004 §6.1 must appear on every app page
that displays official civic data — not just the footer. At minimum it should be
accessible as a footer note or tap-accessible information element on data display pages.

**10.6 No government endorsement language.**
No public page may contain any language, branding, seal, logo, or wording that implies
endorsement by, affiliation with, or official status within any government of Canada,
any Canadian province or territory, or any international government body.

**10.7 No prohibited claims.**
All public pages must comply with the prohibited claims list in CV-POL-004 §5, which
includes: claiming to be an official government source, claiming data is certified or
guaranteed accurate, implying proprietary rights over public civic data, and implying
exclusive access to government information.

**10.8 Sources page must be built from approved entries only.**
The `/sources` page must not be a rendered export of CV-REG-001. It must be built from
a separate public-facing content layer that contains only the approved public fields:
source name, jurisdiction, licence name, and attribution wording. A source entry with
Licence Status: Review Required or TBD must not appear on the public page.

**10.9 Corrections page must expose intake only.**
The `/corrections` or `/contact` page must expose only the user-facing intake
instructions from CV-SOP-003: the intake channel (email or form link), what information
to include in a correction request, and the expected response time. The internal triage,
risk classification, escalation, and closure procedure in CV-SOP-003 must not be
visible to users.

**10.10 Mobile accessibility.**
All public legal pages must be readable on mobile viewports (320px and above). Text
must be resizable. Tap targets must meet minimum size requirements. Pages must not
require horizontal scrolling on standard mobile viewports. This is required to satisfy
CV-POL-005 and CV-CHK-001.

**10.11 Versioning and effective dates.**
Each published public page must display or make available the effective date of the
current version. When a public document is updated after launch, the version number
must be incremented, the effective date updated, and the update logged in the document's
change log. Users should be able to identify what version of the policy applies to them.

**10.12 Any change triggers gate re-review.**
If any app feature, SDK, or data collection change occurs after a public page has been
published, the relevant content readiness gates must be re-evaluated before the next
app update is submitted. In particular, Gate 07 (Privacy Policy matches Privacy Data
Map) and Gate 08 (App Store Privacy Labels Checklist) must be re-confirmed before any
App Store update submission that changes data collection behaviour.

---

## 11. Pre-Launch Open Items

The following items are outstanding and must be resolved before any public legal page
can be published. Items are a subset of CV-IDX-001 §10 and CV-REG-003, surfaced here
for implementation tracking.

| Item | Blocks | Priority | Status | CV-IDX-001 / CV-REG-003 Reference |
|---|---|---|---|---|
| Operator legal name confirmed | All public pages · GATE-01 | Critical | 🔴 Open | CV-IDX-001 item 1 · CV-ISS-001 |
| Contact / support email confirmed | `/privacy` · `/terms` · `/corrections` · GATE-02 | Critical | 🔴 Open | CV-IDX-001 item 2 · CV-ISS-002 |
| Mailing address confirmed | `/terms` · GATE-03 | Critical | 🔴 Open | CV-IDX-001 item 3 · CV-ISS-003 |
| Governing province confirmed | `/privacy` · `/terms` · GATE-04 | Critical | 🔴 Open | CV-IDX-001 item 4 · CV-ISS-004 |
| Legal review completed | All public pages · GATE-05 | Critical | 🔴 Open | CV-IDX-001 item 13 · CV-ISS-013 |
| Data Source Register licence review | `/sources` · GATE-06 | Critical | 🔴 Open | CV-IDX-001 item 16 · CV-ISS-015 |
| Analytics / crash / account decisions confirmed | `/privacy` privacy label consistency · GATE-07 | High | 🟡 Pending | CV-IDX-001 items 6–8 · CV-ISS-006 · CV-ISS-007 · CV-ISS-008 |
| CV-CHK-003 App Store Privacy Labels Checklist completed | App Store submission · GATE-08 | Critical | 🔴 Open | CV-IDX-001 item 12 · CV-ISS-012 |
| Hosting and route decisions confirmed | All public pages · GATE-10 | High | 🔴 Open | This plan Section 6 |
| Correction intake channel confirmed | `/corrections` · GATE-11 | Medium | 🔴 Open | CV-IDX-001 item 10 · CV-ISS-010 |

---

## 12. Approval

This plan is considered ready for implementation when:

1. All content readiness gates in Section 9 are resolved (no 🔴 Open items remaining).
2. The source documents for each planned public page (CV-POL-001, CV-POL-003,
   CV-POL-004, CV-POL-005) have reached **Approved** status.
3. CV-REG-001 licence review is complete for all sources intended for the `/sources` page.
4. The hosting and route decisions in Section 6 are confirmed.
5. The Founder and any legal reviewer have signed off below.

| Role | Name | Date | Confirmation |
|---|---|---|---|
| Product Lead | TBD | TBD | |
| Privacy Lead | TBD | TBD | |
| Legal Reviewer | TBD | TBD | |
| Founder | TBD | TBD | |

---

## Related Documents

| Document | Status |
|---|---|
| [CV-POL-001 Privacy Policy](../policies/CV-POL-001%20Privacy%20Policy.md) | Draft |
| [CV-POL-002 Data Sources and Attribution Policy](../policies/CV-POL-002%20Data%20Sources%20and%20Attribution%20Policy.md) | Draft |
| [CV-POL-003 Terms of Use](../policies/CV-POL-003%20Terms%20of%20Use.md) | Draft |
| [CV-POL-004 Public Disclaimer and Non-Affiliation Statement](../policies/CV-POL-004%20Public%20Disclaimer%20and%20Non-Affiliation%20Statement.md) | Draft |
| [CV-POL-005 Accessibility Statement](../policies/CV-POL-005%20Accessibility%20Statement.md) | Draft |
| [CV-REG-001 Data Source Register](../registers/CV-REG-001%20Data%20Source%20Register.md) | Draft |
| [CV-REG-003 Open Issues Register](../registers/CV-REG-003%20Open%20Issues%20Register.md) | Draft |
| [CV-CHK-002 Pre-Launch Compliance Checklist](../checklists/CV-CHK-002%20Pre-Launch%20Compliance%20Checklist.md) | Draft |
| [CV-CHK-003 App Store Privacy Labels Checklist](../checklists/CV-CHK-003%20App%20Store%20Privacy%20Labels%20Checklist.md) | Draft |
| [CV-IDX-001 Canadian Compliance Package Index](../CV-IDX-001%20Canadian%20Compliance%20Package%20Index.md) | Draft |

---

## Change Log

| Version | Date | Author | Change |
|---|---|---|---|
| 0.1 | 2026-08-02 | Founder / Product Lead | Initial draft — Canadian launch scope |
