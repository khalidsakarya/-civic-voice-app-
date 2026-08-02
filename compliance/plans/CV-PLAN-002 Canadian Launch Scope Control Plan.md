# CV-PLAN-002 — Canadian Launch Scope Control Plan

| Field | Value |
|---|---|
| **Document ID** | CV-PLAN-002 |
| **Version** | 0.1 |
| **Status** | Draft |
| **Owner** | Founder / Product Lead |
| **Effective Date** | TBD — pending review |
| **Scope** | Civic Voice Canada only |
| **Related Documents** | CV-COMP-001 Compliance Position Statement · CV-POL-002 Data Sources and Attribution Policy · CV-POL-004 Public Disclaimer and Non-Affiliation Statement · CV-CHK-002 Pre-Launch Compliance Checklist · CV-REG-003 Open Issues Register |
| **Review Frequency** | Before public launch; before adding any non-Canadian jurisdiction back into the public UI |

---

> ⚠️ **DRAFT — NOT YET IN EFFECT**
>
> This plan has not been reviewed by legal counsel and is not yet formally adopted.
> It describes the intended Canadian-only launch scope and the rules governing
> non-Canadian jurisdictions during that period. No app code changes should be made
> solely on the basis of this draft — the plan must be approved (Section 13) before
> it is used as the basis for UI or feature flag decisions.

---

## 1. Purpose

This plan defines the controlled Canadian-only launch scope for Civic Voice Canada and
establishes the rules for hiding, maintaining, and later reactivating non-Canadian
jurisdictions.

Its goals are to:

- Confirm that the public Civic Voice Canada launch is scoped to Canada — federal,
  provincial, and territorial — and approved Canadian public-sector datasets only.
- Document which jurisdictions are hidden from the public UI at launch and why.
- Establish the hide-not-delete principle so that non-Canadian jurisdiction code,
  data, and engine logic are preserved for future use.
- Define the minimum criteria and compliance gates that must be met before any
  hidden jurisdiction is reactivated in the public UI.
- Prevent non-Canadian jurisdiction content from appearing in App Store screenshots,
  launch marketing, or public-facing claims during the Canadian launch period.
- Provide a record of the scope decision that satisfies CV-CHK-002 pre-launch
  requirements and CV-REG-003 open issues tracking.

---

## 2. Scope

This plan covers:

- The public-facing UI scope of Civic Voice Canada at initial public launch
- Feature flag and navigation visibility rules for hidden jurisdictions
- Direct-route handling for users who attempt to access hidden jurisdiction pages
- Data and code retention rules for non-Canadian jurisdictions
- The criteria and process for reactivating hidden jurisdictions in the future
- App Store listing and marketing scope constraints

This plan does **not** cover:

- The internal technical implementation of feature flags (that is a development
  decision guided by this plan, not defined by it)
- Privacy or data source compliance for US, UK, or Australian jurisdictions — those
  will be addressed in jurisdiction-specific compliance packages when reactivation
  is considered
- Any decision to permanently remove non-Canadian jurisdictions from the codebase

---

## 3. Canadian Launch Position

Civic Voice Canada launches as a **Canadian-only civic information product**. All
public-facing UI, App Store listings, marketing materials, and legal documents at
initial public launch must reflect a Canada-scoped product.

### 3.1 Rationale

The decision to launch Canada-only is based on:

- **Data readiness.** Federal, provincial, and territorial Canadian civic data sources
  have been identified and are undergoing licence review. US, UK, and Australian source
  coverage is not yet at the same readiness level.
- **Compliance readiness.** Canadian privacy law (PIPEDA), CASL, and accessibility
  requirements have been addressed in the current compliance package. A separate
  compliance review covering US (CCPA/state laws), UK (UK GDPR), and Australian
  (Privacy Act 1988) requirements has not yet been conducted.
- **Disclaimer and attribution readiness.** CV-POL-004 and CV-POL-002 are scoped to
  Canadian sources and Canadian government non-affiliation. Extending these to other
  jurisdictions requires separate review.
- **Focus and quality.** A narrower, well-verified Canadian launch is preferable to
  a multi-jurisdiction launch with unverified or incomplete data.

### 3.2 This is not permanent removal

The Canadian-only launch is a **time-limited scope decision**, not a decision to remove
support for other jurisdictions. Code, data, and engine logic for US, UK, and Australia
must be retained in accordance with Section 9 of this plan.

---

## 4. In-Scope Jurisdictions

The following jurisdictions are in scope for the Canadian public launch.

| Jurisdiction | Level | Included at Launch | Notes |
|---|---|---|---|
| **Canada — Federal** | Federal | Yes | House of Commons, Senate, federal government data |
| **Ontario** | Province | Yes | Provincial legislature, MPPs |
| **British Columbia** | Province | Yes | |
| **Alberta** | Province | Yes | |
| **Quebec** | Province | Yes | |
| **Manitoba** | Province | Yes | |
| **Saskatchewan** | Province | Yes | |
| **Nova Scotia** | Province | Yes | |
| **New Brunswick** | Province | Yes | |
| **Newfoundland and Labrador** | Province | Yes | |
| **Prince Edward Island** | Province | Yes | |
| **Northwest Territories** | Territory | Yes | |
| **Nunavut** | Territory | Yes | |
| **Yukon** | Territory | Yes | |
| **Canadian municipal sources** | Municipal | Pending | Only if a specific source has been approved through the CV-REG-001 licence review process before launch. No municipal source may appear publicly until licence status is Approved. |

> **Note:** Inclusion in this table means the jurisdiction is in scope for the Canadian
> launch UI. It does not mean that data for every listed jurisdiction is verified and
> ready to display. Each data source must independently clear the CV-REG-001 licence
> review and the CV-SOP-001 Data Verification process before its data is shown to users.
> See CV-CHK-002 and CV-REG-001 for per-source readiness status.

---

## 5. Hidden / Out-of-Scope Jurisdictions

The following jurisdictions are out of scope for the Canadian public launch and must
be hidden from all public-facing UI entry points.

| Jurisdiction | Region | Hidden at Launch | Reason |
|---|---|---|---|
| **United States** | North America | Yes | Data source coverage incomplete; US-specific compliance review (CCPA and applicable state laws) not yet conducted; disclaimer and attribution policy not scoped to US sources |
| **United Kingdom** | Europe | Yes | Data source coverage incomplete; UK GDPR compliance review not yet conducted; disclaimer and attribution policy not scoped to UK sources |
| **Australia** | Asia-Pacific | Yes | Data source coverage incomplete; Australian Privacy Act 1988 compliance review not yet conducted; disclaimer and attribution policy not scoped to Australian sources |
| **Any other non-Canadian jurisdiction** | Any | Yes | Default rule: any jurisdiction not listed in Section 4 as included at launch is hidden until a reactivation review (Section 10) is completed and approved |

### 5.1 What "hidden" means

A hidden jurisdiction must not appear in:

- The homepage, dashboard, or any entry-point screen shown to a user without
  navigating to a specific route
- Navigation menus, jurisdiction selectors, or country/region pickers
- Explorer entry points, category cards, or browse-by-jurisdiction features
- App Store screenshots, preview videos, or feature descriptions
- Public marketing materials, social media posts, or launch announcements
- Any public claim about what the app covers

A hidden jurisdiction may still exist in:

- The application codebase (source files, components, engine logic)
- Firestore database documents and collections
- Data pipeline scripts and source mapping configurations
- Internal documentation and compliance records

---

## 6. Hide-Not-Delete Principle

**Non-Canadian jurisdiction code, data, and configurations shall not be deleted
solely because they are hidden from the public UI at the Canadian launch.**

### 6.1 Rationale

Deletion of US, UK, or Australian code and data at the Canadian launch would:

- Destroy development work that is intended to be reactivated in the future.
- Create unnecessary re-implementation effort when those jurisdictions are expanded.
- Risk unintentional loss of data structures, source mappings, or engine logic that
  took significant effort to develop.
- Potentially create data integrity issues if Firestore documents are partially deleted.

### 6.2 What must not be deleted

The following must not be deleted, archived, or otherwise made unavailable solely
because a jurisdiction is hidden from the public UI:

- Source files and components related to US, UK, or Australian jurisdictions
- Firestore collections, documents, or fields containing US, UK, or Australian data
- Data pipeline scripts, fetch configurations, and source mappings for non-Canadian
  sources
- Engine logic (scoring, parsing, formatting) developed for non-Canadian jurisdictions
- Feature flag configuration code, even if the flag is currently set to hidden
- Any test fixtures, seed data, or example data for non-Canadian jurisdictions

### 6.3 What is permitted

The following actions are permitted and are consistent with the hide-not-delete
principle:

- Setting feature flags or environment variables to hide non-Canadian jurisdiction
  content from the public UI
- Removing non-Canadian jurisdiction entry points from navigation menus and
  jurisdiction selectors
- Redirecting direct routes for hidden jurisdictions to a calm unavailable message
  (see Section 8)
- Commenting out or conditionally rendering UI components based on a feature flag
  that controls jurisdiction visibility
- Documenting which jurisdiction content is hidden in internal records

---

## 7. Public UI Requirements

The following requirements govern the public-facing UI during the Canadian launch period.

### 7.1 Navigation and entry points

All navigation menus, jurisdiction selectors, homepage cards, and explorer entry points
must show only in-scope Canadian jurisdictions. No entry point for a hidden
jurisdiction may be visible to a user in normal navigation.

### 7.2 App Store listing

The App Store Connect listing title, subtitle, description, keywords, and screenshots
must describe and show only Canadian civic content. The listing must not:

- Show screenshots of US, UK, or Australian content
- Claim coverage of US, UK, or Australian officials, legislatures, or governments
- Use keywords that imply global or multi-country coverage not present in the app

The approved short-form disclaimer from CV-POL-004 §6.1 must appear in the App Store
listing description.

### 7.3 Launch marketing

All launch marketing materials — website, social media, press, and in-app onboarding —
must accurately represent the Canadian-only scope. Marketing must not imply that the
app covers jurisdictions that are hidden at launch.

### 7.4 In-app onboarding

If the app includes an onboarding flow, jurisdiction selector, or location-based
prompt at first launch, it must only offer Canadian options. The province/territory
selection used for the citizen-opinion vote gate must offer only Canadian
provinces and territories.

### 7.5 Data display disclaimer

The short-form disclaimer from CV-POL-004 §6.1 must appear on every page that displays
official civic data. This requirement applies to all in-scope Canadian data pages and
is not modified by the presence of hidden jurisdiction data in the database.

---

## 8. Direct Route Handling

A user may attempt to navigate directly to a URL for a hidden jurisdiction — for
example, by bookmarking a URL they encountered during development or beta testing, or
by modifying a URL manually.

### 8.1 Required behaviour

If a user navigates directly to a route associated with a hidden jurisdiction, the app
must:

1. **Not display the hidden jurisdiction content.**
2. **Show a calm, non-alarming unavailable message** that:
   - Does not expose internal compliance or technical details
   - Does not imply the content is permanently removed
   - Provides a clear path back to the Canadian launch content (homepage or Canada
     federal / province selector)
3. **Not return a bare 404 or unhandled error.** A user-friendly page is required.

### 8.2 Suggested message tone

The unavailable message should be brief and informative. Example wording (to be
reviewed and approved before implementation):

> "This section isn't available in the current version of Civic Voice Canada.
> We're focused on Canadian federal, provincial, and territorial content right now.
> [Return to home]"

The exact wording must comply with CV-POL-004 (no prohibited claims) and must not
imply a specific future date for reactivation unless that date has been confirmed.

### 8.3 No leakage of hidden content

The unavailable page must not render any data, names, titles, or metadata from the
hidden jurisdiction, even partially. The route handler must return the unavailable
message without fetching or rendering hidden jurisdiction data.

---

## 9. Data and Code Retention

This section defines what is retained during the Canadian launch period and where it
is located.

### 9.1 Codebase

Non-Canadian jurisdiction code must be retained in the main codebase. The preferred
approach is conditional rendering or feature-flag gating, not deletion or branching
to a separate repository. The `main` branch of the repository must contain the full
codebase including non-Canadian jurisdiction support, gated behind the appropriate
flag or configuration.

### 9.2 Firestore

Non-Canadian Firestore data must not be deleted. If non-Canadian collections or
documents exist, they must remain in place. Access control (Firestore security rules)
should prevent public read access to non-Canadian data that is not intended to be
displayed, but the data itself must be retained.

### 9.3 Launch flag documentation

The mechanism used to hide non-Canadian jurisdiction content (feature flags,
environment variables, configuration, or conditional rendering logic) must be
documented in internal technical notes so that a future developer can identify
what to change when reactivating a jurisdiction. This documentation does not need
to be part of the compliance package — it may be a code comment, a README section,
or a technical specification — but it must exist before the Canadian launch.

---

## 10. Reactivation Criteria

Before a hidden jurisdiction is reactivated and made visible in the public UI, all
of the following criteria must be met. The Founder must explicitly approve reactivation
after these criteria are confirmed.

| Criterion ID | Criterion | Who Confirms |
|---|---|---|
| REACT-01 | **Data source review completed** — all data sources for the reactivated jurisdiction have been assessed, their licences documented in CV-REG-001 (or an equivalent jurisdiction-specific register), and their Licence Status confirmed as Approved or Public Registry | Data Lead |
| REACT-02 | **Data verification completed** — at least one full CV-SOP-001 Data Verification pass has been completed for all sources intended for public display in the reactivated jurisdiction | Data Lead |
| REACT-03 | **Privacy review completed** — privacy implications of the reactivated jurisdiction's data collection (if any additional collection is introduced) have been assessed and CV-REG-002 (Privacy Data Map) updated if required | Privacy Lead |
| REACT-04 | **Jurisdiction-specific compliance review completed** — applicable privacy law (e.g., US CCPA and applicable state laws; UK GDPR; Australian Privacy Act 1988) has been reviewed and any required policy or procedure updates have been made | Compliance Lead |
| REACT-05 | **Disclaimer and attribution review completed** — CV-POL-004 and CV-POL-002 have been reviewed and updated if required to cover the reactivated jurisdiction | Compliance Lead |
| REACT-06 | **Accessibility review completed** — new or updated pages for the reactivated jurisdiction have been assessed against WCAG 2.1 AA using CV-CHK-001 criteria | Product Lead |
| REACT-07 | **UI/UX review completed** — navigation, jurisdiction selector, and entry point changes required to surface the reactivated jurisdiction have been reviewed and tested | Product Lead |
| REACT-08 | **App Store listing review completed** — if the reactivated jurisdiction changes the app's scope as described in App Store listings, screenshots, keywords, or description, the listing has been updated and approved before the update is submitted | Founder |
| REACT-09 | **No fake, demo, generated, or unsupported data** — the reactivated jurisdiction must not publish any data that is fabricated, AI-generated, demo-only, or not supported by a cleared source entry in CV-REG-001 or equivalent | Data Lead |
| REACT-10 | **Founder approval** — the Founder has reviewed all completed criteria and explicitly approved reactivation in a Reactivation Review Record (see Section 12) | Founder |

### 10.1 Reactivation is not automatic

Passing all criteria does not automatically reactivate a hidden jurisdiction. The
Founder must explicitly approve reactivation by signing the Reactivation Review Record.
A jurisdiction must not be made visible in the public UI — even temporarily — without
that approval.

### 10.2 Partial reactivation

A jurisdiction may be partially reactivated — for example, showing federal data for
the United States without state-level data — provided that:

- The partial scope is clearly defined and documented in the Reactivation Review Record
- All criteria in Section 10 are met for the partial scope being reactivated
- No data for the out-of-scope portion of the jurisdiction is displayed
- The app's disclaimer and any jurisdiction-level notice accurately describes the
  partial scope

---

## 11. Compliance Gates for Future Expansion

Before any non-Canadian jurisdiction is reactivated, the following compliance package
items must be completed in addition to the reactivation criteria in Section 10.

| Gate | Requirement |
|---|---|
| **Jurisdiction-specific compliance package** | A compliance package analogous to this Canadian package must be prepared for the target jurisdiction, covering applicable privacy law, data sources, attribution, disclaimers, and accessibility |
| **Privacy Data Map update** | CV-REG-002 (or a jurisdiction-specific equivalent) must be updated to reflect any new data collection or processing introduced by the reactivated jurisdiction |
| **Privacy Policy update** | CV-POL-001 must be reviewed and updated if the reactivated jurisdiction introduces new data collection, processing locations, or user rights |
| **Terms of Use update** | CV-POL-003 governing law and jurisdiction clauses must be reviewed if the app is being offered to users outside Canada |
| **App Store privacy label review** | CV-CHK-003 must be re-completed if the reactivated jurisdiction introduces new data types or SDK behaviour |
| **Legal review** | Updated public-facing documents must receive legal review before publication, equivalent to the Canadian launch legal review gate |

---

## 12. Records Generated

The following records must be created or updated in connection with this plan.

| Record | When Generated | Retained By | Retention Period |
|---|---|---|---|
| **Launch Scope Decision Record** | At or before Canadian public launch — confirms the in-scope and hidden jurisdiction decisions documented in this plan are implemented as described | Founder / Product Lead | Minimum 3 years |
| **Feature Flag / UI Visibility Review Record** | At or before Canadian public launch — confirms that hidden jurisdictions are not reachable through normal navigation and that direct-route handling is implemented | Product Lead / Developer | Minimum 3 years |
| **Reactivation Review Record** | Each time a hidden jurisdiction is reactivated — confirms all criteria in Section 10 are met and documents Founder approval | Founder | Minimum 3 years per jurisdiction per reactivation |
| **Open Issues Register update** (CV-REG-003) | If any open issues related to scope or hidden-jurisdiction handling remain at launch | Compliance Lead | Until issues are closed |

---

## 13. Approval

This plan is considered in effect when:

1. The in-scope and hidden jurisdiction lists in Sections 4 and 5 have been confirmed
   against the live app build.
2. The hide-not-delete principle in Section 6 has been confirmed — no non-Canadian
   jurisdiction code or data has been deleted.
3. Direct-route handling described in Section 8 is implemented.
4. A Launch Scope Decision Record and Feature Flag / UI Visibility Review Record
   (Section 12) have been completed.
5. The Founder has signed off below.

| Role | Name | Date | Confirmation |
|---|---|---|---|
| Product Lead | TBD | TBD | |
| Compliance Lead | TBD | TBD | |
| Founder | TBD | TBD | |

---

## Related Documents

| Document | Status |
|---|---|
| [CV-COMP-001 Compliance Position Statement](../CV-COMP-001%20Compliance%20Position%20Statement.md) | Draft |
| [CV-POL-002 Data Sources and Attribution Policy](../policies/CV-POL-002%20Data%20Sources%20and%20Attribution%20Policy.md) | Draft |
| [CV-POL-004 Public Disclaimer and Non-Affiliation Statement](../policies/CV-POL-004%20Public%20Disclaimer%20and%20Non-Affiliation%20Statement.md) | Draft |
| [CV-CHK-002 Pre-Launch Compliance Checklist](../checklists/CV-CHK-002%20Pre-Launch%20Compliance%20Checklist.md) | Draft |
| [CV-REG-003 Open Issues Register](../registers/CV-REG-003%20Open%20Issues%20Register.md) | Draft |
| [CV-IDX-001 Canadian Compliance Package Index](../CV-IDX-001%20Canadian%20Compliance%20Package%20Index.md) | Draft |

---

## Change Log

| Version | Date | Author | Change |
|---|---|---|---|
| 0.1 | 2026-08-02 | Founder / Product Lead | Initial draft — Canadian launch scope |
