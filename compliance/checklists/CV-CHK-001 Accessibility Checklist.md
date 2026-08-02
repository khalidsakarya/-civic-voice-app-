# CV-CHK-001 — Accessibility Checklist

| Field | Value |
|---|---|
| **Document ID** | CV-CHK-001 |
| **Version** | 0.1 |
| **Status** | Draft |
| **Owner** | Founder / Product Lead |
| **Effective Date** | TBD — pending review |
| **Scope** | Civic Voice Canada only |
| **Related Documents** | CV-POL-005 Accessibility Statement |
| **Review Frequency** | Before public launch; before App Store submission; after major UI changes |

---

> ⚠️ **DRAFT — NOT YET COMPLETED**
>
> This checklist has not yet been reviewed against the live app. All Pass/Fail/NA
> fields are blank. This checklist must be completed in full and signed off by the
> Product Lead before:
>
> 1. The Accessibility Statement (CV-POL-005) is published,
> 2. The app is submitted to the App Store or Google Play, and
> 3. Any public launch is announced.

---

## How to Use This Checklist

- Complete one checklist per review cycle or per significant release.
- Assign an **Item ID** prefix per section (e.g., GEN-01, TXT-01) — these are pre-filled below.
- For each item, record:
  - **Pass** — the requirement is met.
  - **Fail** — the requirement is not met. Add a note describing the issue and create a
    follow-up task.
  - **NA** — the requirement does not apply to the current build.
- Record the evidence, reviewer name, and date for each item reviewed.
- Items marked **Fail** must be resolved or documented as known limitations in CV-POL-005
  Section 5 before the app is launched or the App Store listing is submitted.

---

## Section 1 — General Page Structure

| Item ID | Requirement | Pass / Fail / NA | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|---|
| GEN-01 | Each screen or page has a single, clearly identifiable main heading (H1 or equivalent) | | | | | |
| GEN-02 | Heading levels are used in a logical, hierarchical order (H1 → H2 → H3) with no skipped levels | | | | | |
| GEN-03 | The page title or screen title is descriptive and distinguishes the screen from others in the app | | | | | |
| GEN-04 | Landmark regions (main content, navigation, footer) are marked up semantically where the platform supports it | | | | | |
| GEN-05 | Content reading order in the DOM or accessibility tree matches the visual layout | | | | | |
| GEN-06 | There are no empty headings, placeholder headings, or headings used solely for visual styling | | | | | |

---

## Section 2 — Text and Readability

| Item ID | Requirement | Pass / Fail / NA | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|---|
| TXT-01 | Body text is readable at the app's default font size on a standard mobile screen (minimum 375px wide) | | | | | |
| TXT-02 | Text scales appropriately when the user increases their system font size to the largest default setting | | | | | |
| TXT-03 | Text does not overlap, truncate critically, or become unreadable when font size is increased | | | | | |
| TXT-04 | Line spacing and paragraph spacing are sufficient to distinguish blocks of text | | | | | |
| TXT-05 | Abbreviations and acronyms used in the app are explained on first use or in a legend/glossary | | | | | |
| TXT-06 | No text is presented as an image of text where actual text could be used instead | | | | | |

---

## Section 3 — Colour and Contrast

| Item ID | Requirement | Pass / Fail / NA | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|---|
| COL-01 | Normal text (under 18pt / 14pt bold) has a minimum contrast ratio of 4.5:1 against its background (WCAG 2.1 AA) | | | | | |
| COL-02 | Large text (18pt+ / 14pt+ bold) has a minimum contrast ratio of 3:1 against its background | | | | | |
| COL-03 | Interactive UI components (buttons, input borders, focus indicators) have a minimum contrast ratio of 3:1 against adjacent colours | | | | | |
| COL-04 | Colour is not the only way to communicate status, error states, or data meaning — text labels or icons are used alongside colour | | | | | |
| COL-05 | Approved status labels (e.g., "Manual review required", "Source unavailable") are displayed as visible text, not as colour-only indicators | | | | | |
| COL-06 | Charts and data visualisations use colour plus at least one other visual distinguisher (pattern, label, texture) for data series | | | | | |
| COL-07 | Focus indicators are visible in both light and dark mode | | | | | |

---

## Section 4 — Buttons and Links

| Item ID | Requirement | Pass / Fail / NA | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|---|
| BTN-01 | All buttons have a descriptive, non-generic accessible label (not just "click here", "more", or an icon with no label) | | | | | |
| BTN-02 | Icon-only buttons have an accessible name (aria-label, title, or equivalent) that describes the action | | | | | |
| BTN-03 | Links are understandable without surrounding context where practical (link text describes the destination or action) | | | | | |
| BTN-04 | Links that open in a new tab or external browser indicate this in the label or with a visible indicator | | | | | |
| BTN-05 | Touch targets for buttons and links are large enough to be tapped reliably (minimum 44×44 CSS pixels recommended) | | | | | |
| BTN-06 | Disabled buttons and links are visually distinguishable from active controls and are labelled as unavailable | | | | | |
| BTN-07 | Source attribution links are accessible and clearly labelled (e.g., "Source: open.canada.ca — Government of Canada Open Data") | | | | | |

---

## Section 5 — Keyboard Navigation

| Item ID | Requirement | Pass / Fail / NA | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|---|
| KEY-01 | All interactive elements (buttons, links, form fields, toggles) are reachable by keyboard Tab navigation | | | | | |
| KEY-02 | Focus order follows a logical sequence that matches the visual layout | | | | | |
| KEY-03 | A visible focus indicator is present on all focusable elements | | | | | |
| KEY-04 | No keyboard traps — the user can navigate to and away from all components using the keyboard alone | | | | | |
| KEY-05 | Modals and dialogs return focus to the triggering element when closed | | | | | |
| KEY-06 | Critical actions (e.g., voting, closing a modal, navigating to a section) can be performed by keyboard | | | | | |
| KEY-07 | Custom interactive components (carousels, accordions, tabs) follow ARIA keyboard interaction patterns where applicable | | | | | |

---

## Section 6 — Screen Reader Labels

| Item ID | Requirement | Pass / Fail / NA | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|---|
| SCR-01 | All images that convey information have descriptive alt text | | | | | |
| SCR-02 | Decorative images have empty alt text (`alt=""`) so screen readers skip them | | | | | |
| SCR-03 | Form inputs are associated with descriptive labels (not just placeholder text) | | | | | |
| SCR-04 | Status labels and alerts (e.g., "Manual review required", "Source unavailable") are announced by screen readers | | | | | |
| SCR-05 | Charts have an accessible text description or a linked data table that a screen reader can present | | | | | |
| SCR-06 | Dynamic content updates (e.g., vote count changes, data loading states) are announced to screen readers via live regions or equivalent | | | | | |
| SCR-07 | The app has been tested with at least one screen reader (e.g., iOS VoiceOver or Android TalkBack) | | | | | |
| SCR-08 | Icon-only status indicators (e.g., checkmarks, warning icons) have accessible text equivalents | | | | | |

---

## Section 7 — Forms and Inputs

| Item ID | Requirement | Pass / Fail / NA | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|---|
| FRM-01 | All form fields have visible, persistent labels that are not hidden after the user starts typing | | | | | |
| FRM-02 | Required fields are indicated visually and programmatically (not only by colour) | | | | | |
| FRM-03 | Input validation errors are described in text, not only by colour or icon | | | | | |
| FRM-04 | Error messages identify the specific field in error and describe how to correct it | | | | | |
| FRM-05 | The purpose of each input field is clear from its label (e.g., "Province or territory", not just "Location") | | | | | |
| FRM-06 | Form submission confirmation or failure is communicated to screen readers | | | | | |

---

## Section 8 — Modals and Dialogs

| Item ID | Requirement | Pass / Fail / NA | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|---|
| MOD-01 | Modals have a descriptive title that is announced when the modal opens | | | | | |
| MOD-02 | Focus moves into the modal when it opens and is contained within the modal while it is open | | | | | |
| MOD-03 | Modals have a clearly labelled close button (not only an "X" icon with no accessible name) | | | | | |
| MOD-04 | Modals can be closed with the Escape key | | | | | |
| MOD-05 | Focus returns to the triggering element when the modal is closed | | | | | |
| MOD-06 | Modals do not open automatically without user interaction | | | | | |
| MOD-07 | Modals displaying source notes, disclaimers, or chart summaries are readable by screen readers | | | | | |

---

## Section 9 — Charts and Tables

| Item ID | Requirement | Pass / Fail / NA | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|---|
| CRT-01 | Data tables have column headers marked up as header cells (`<th>` or equivalent) | | | | | |
| CRT-02 | Complex tables (multiple header levels) have row and column header associations | | | | | |
| CRT-03 | Tables do not use merged cells in ways that break the logical header-to-cell relationship | | | | | |
| CRT-04 | Charts have a descriptive title or heading | | | | | |
| CRT-05 | Charts have axis labels and a legend where applicable | | | | | |
| CRT-06 | Charts have a text summary or linked data table as an alternative for users who cannot interpret the visual | | | | | |
| CRT-07 | No critical information is conveyed only through chart shape or colour without a text equivalent | | | | | |
| CRT-08 | Source attribution (source name, reporting period, fetched date) is present near each chart or table | | | | | |
| CRT-09 | Tables and charts are horizontally scrollable within their container on small screens, not causing the whole page to scroll horizontally | | | | | |

---

## Section 10 — Mobile Layout

| Item ID | Requirement | Pass / Fail / NA | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|---|
| MOB-01 | All core civic information is accessible on a 375px wide screen without horizontal scrolling of the page body | | | | | |
| MOB-02 | No critical content is hidden or inaccessible on small screens | | | | | |
| MOB-03 | The app is usable in both portrait and landscape orientation | | | | | |
| MOB-04 | No information is available only through hover — hover-revealed content has a tap/click equivalent | | | | | |
| MOB-05 | Tooltips and popover labels are accessible by tap as well as hover | | | | | |
| MOB-06 | The app does not rely on gestures that have no accessible alternative for any critical action | | | | | |
| MOB-07 | Text does not overflow its container or overlap other content on small screens | | | | | |
| MOB-08 | The app layout is usable at 200% browser zoom without loss of critical functionality | | | | | |

---

## Section 11 — Error Messages and Status Labels

| Item ID | Requirement | Pass / Fail / NA | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|---|
| ERR-01 | Approved status labels ("Manual review required", "Source unavailable", etc.) are displayed as visible text | | | | | |
| ERR-02 | Approved status labels are distinguishable from factual data values (e.g., styled differently or in a clearly labelled area) | | | | | |
| ERR-03 | Approved status labels are announced by screen readers when they appear | | | | | |
| ERR-04 | Loading states are communicated to users (e.g., a loading indicator that screen readers can announce) | | | | | |
| ERR-05 | Empty state messages (e.g., when no data is available for a section) are informative and not blank | | | | | |
| ERR-06 | Error messages for failed data loads are descriptive and do not display raw error codes to users | | | | | |
| ERR-07 | The "Pending official source review" label is visually distinct from a confirmed data value | | | | | |

---

## Section 12 — Data Source Links

| Item ID | Requirement | Pass / Fail / NA | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|---|
| SRC-01 | Source attribution links are visible and accessible on each card, chart, or section that displays government data | | | | | |
| SRC-02 | Source links have descriptive link text (e.g., "Source: Parliament of Canada (parl.ca)") not just a bare URL | | | | | |
| SRC-03 | Source links open in an accessible way (in-app browser or external browser with a clear indication) | | | | | |
| SRC-04 | The reporting period and fetched date are displayed alongside source links where applicable | | | | | |
| SRC-05 | If a source link is unavailable or broken, the "Source unavailable" approved status label is shown instead | | | | | |

---

## Section 13 — Testing Evidence

This section must be completed before the checklist is signed off.

| Item ID | Requirement | Pass / Fail / NA | Evidence | Reviewer | Date | Notes |
|---|---|---|---|---|---|---|
| TST-01 | Checklist reviewed against the live app (or current build) — not against design mockups alone | | | | | |
| TST-02 | Colour contrast checked using an automated tool (e.g., browser DevTools, Colour Contrast Analyser) | | | | | |
| TST-03 | Screen reader test completed on iOS (VoiceOver) or Android (TalkBack) | | | | | |
| TST-04 | Keyboard navigation test completed (Tab, Shift+Tab, Enter, Escape) | | | | | |
| TST-05 | Mobile layout tested at 375px width (portrait) | | | | | |
| TST-06 | Mobile layout tested at 375px width (landscape) | | | | | |
| TST-07 | Font scaling tested at the largest default system font size on iOS or Android | | | | | |
| TST-08 | All Fail items from this checklist have been logged as issues or documented as known limitations in CV-POL-005 Section 5 | | | | | |

---

## Section 14 — Approval

This checklist is considered complete when all items are marked Pass or NA, and all
Fail items are either resolved or documented as known limitations in CV-POL-005.

| Role | Name | Date | Signature / Confirmation |
|---|---|---|---|
| Product Lead | TBD | TBD | |
| Developer | TBD | TBD | |
| Founder | TBD | TBD | |

**Checklist completion date:** TBD

**App version reviewed:** TBD

**Build / commit reference:** TBD

**Next scheduled review:** TBD

---

## Related Documents

| Document | Status |
|---|---|
| [CV-POL-005 Accessibility Statement](../policies/CV-POL-005%20Accessibility%20Statement.md) | Draft |
| [CV-POL-003 Terms of Use](../policies/CV-POL-003%20Terms%20of%20Use.md) | Draft |

---

## Change Log

| Version | Date | Author | Change |
|---|---|---|---|
| 0.1 | 2026-07-26 | Founder / Product Lead | Initial draft — Canadian launch scope |
