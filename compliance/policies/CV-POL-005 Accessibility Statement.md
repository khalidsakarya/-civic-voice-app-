# CV-POL-005 — Accessibility Statement

| Field | Value |
|---|---|
| **Document ID** | CV-POL-005 |
| **Version** | 0.1 |
| **Status** | Draft |
| **Owner** | Founder / Product Lead |
| **Effective Date** | TBD — pending legal review |
| **Scope** | Civic Voice Canada only |
| **Related Documents** | CV-POL-003 Terms of Use · CV-POL-004 Public Disclaimer and Non-Affiliation Statement |
| **Review Frequency** | Before public launch; after major UI changes |

---

> ⚠️ **DRAFT — NOT YET IN EFFECT**
>
> This Accessibility Statement is a working draft prepared for internal review. It has
> **not** been reviewed by legal counsel and is **not** yet published to users. It must
> not be linked from the app, the App Store listing, or any public-facing page until:
>
> 1. An accessibility review of the app has been completed,
> 2. Known limitations are accurately described,
> 3. The Effective Date is set, and
> 4. The document status is changed to **Active**.

---

## Accessibility Statement — Civic Voice Canada

**Effective Date:** TBD

---

### 1. Purpose

This Accessibility Statement describes **[OPERATOR LEGAL NAME — TBD]**'s commitment to
making Civic Voice Canada accessible and usable by as many people as possible, including
users with disabilities, users on assistive technologies, and users on a wide range of
devices and screen sizes.

It also describes the app's current accessibility baseline, known limitations, and how
users can report accessibility barriers.

---

### 2. Accessibility Commitment

Civic Voice Canada is a public civic information app. We believe that access to
information about how the Canadian federal government works should be available to
everyone — including users who rely on screen readers, keyboard navigation, voice
control, magnification, or other assistive technologies.

We are committed to:

- Making the app's core civic information readable, navigable, and understandable
  without requiring specialised knowledge or visual acuity.
- Designing the app so that assistive technologies can interpret and present information
  meaningfully.
- Avoiding design choices that create unnecessary barriers — such as relying solely on
  colour to communicate meaning, or placing critical information in inaccessible
  components.
- Reviewing and improving the app's accessibility over time, particularly before
  significant new features are released.
- Responding to accessibility feedback from users.

We acknowledge that accessibility is an ongoing commitment, not a one-time checklist.
We will continue to improve the app as we learn more about how our users interact with it.

---

### 3. Scope

This statement applies to:

- The Civic Voice Canada mobile app (iOS and Android)
- The Civic Voice Canada web app (civicvoice.ca — TBD)

It does not apply to:

- Third-party websites or official government sources linked from the app — those are
  governed by the respective government body's own accessibility policies.
- The App Store or Google Play listing pages — those are governed by Apple and Google
  respectively.

---

### 4. Accessibility Target

Civic Voice Canada targets **WCAG 2.1 Level AA** (Web Content Accessibility Guidelines,
version 2.1, conformance level AA) as its practical internal accessibility baseline,
with reference to WCAG 2.2 AA for new features and major UI changes.

This means we aim to meet the criteria defined at:
[www.w3.org/TR/WCAG21](https://www.w3.org/TR/WCAG21)

**Important notes on this target:**

- "Targeting" WCAG 2.1 AA is an internal design goal — it is **not** a formal
  conformance declaration or legal warranty. Full conformance has not been independently
  audited or certified.
- Some components of the app (such as third-party charting libraries or native
  platform behaviours) may not fully meet all WCAG 2.1 AA criteria. Known limitations
  are described in Section 5.
- We will update this target as the app matures and as accessibility standards evolve.

---

### 5. Known Limitations

We are aware of the following accessibility limitations as of this draft. This list
will be updated before the statement is published and maintained as the app changes.

| Area | Known Limitation | Planned Approach |
|---|---|---|
| Charts and data visualisations | Interactive charts may not be fully navigable by screen reader or keyboard at this stage | Text/table alternatives to be provided where practical — see Section 6 |
| Complex data tables | Some dense data tables (e.g., budget breakdowns, contract lists) may be difficult to navigate on small screens | Column prioritisation and responsive layout improvements planned |
| Colour use | Some status indicators currently use colour as the primary signal | Text labels to be added alongside colour indicators |
| Third-party UI components | Some third-party components may not expose full accessibility attributes | Components to be audited against CV-CHK-001 before launch |
| PDF source links | Some government source documents are PDFs and may not be accessible themselves | App display provides the summary; link to official source for those who need it |

> **TBD:** This table must be updated with a complete, verified list of known limitations
> after the accessibility checklist (CV-CHK-001) has been completed for the current app build.

---

### 6. Charts, Tables, and Data Visualisations

Civic Voice Canada displays charts, spending breakdowns, vote tallies, and other
visualisations derived from official government data.

We aim to make these accessible by:

- Providing a **text summary or table alternative** for any chart that communicates a
  significant factual claim, where technically practical.
- Labelling all chart axes, legends, and data points with descriptive text.
- Ensuring chart colour schemes use sufficient contrast and are supplemented with
  text labels or patterns so that information is not conveyed by colour alone.
- Including source attribution — source name, reporting period, and fetched date — in
  or near each chart, so users who cannot interpret the visual can still access the
  source data directly.

Where a full text alternative is not yet available for a chart or visualisation, the
relevant source link will be provided so users can access the underlying official data.

---

### 7. Mobile Accessibility

Civic Voice Canada is designed primarily as a mobile app. We aim to ensure that:

- All core civic information is accessible on small screens (minimum 375px wide) without
  requiring horizontal scrolling of critical content.
- Touch targets for interactive elements (buttons, links, toggles) meet a minimum
  accessible size.
- Text remains readable at default system font sizes and scales appropriately when the
  user increases their system font size.
- The app functions usably in both portrait and landscape orientations.
- The app supports iOS VoiceOver and Android TalkBack for screen reader users.
- The app does not rely on gestures that have no accessible alternative for critical actions.

---

### 8. Feedback and Accessibility Requests

We welcome feedback about the accessibility of Civic Voice Canada. If you experience a
barrier that prevents you from accessing civic information in the app, please contact us.

**How to report an accessibility barrier:**

Contact us at **[CONTACT EMAIL — TBD]** with:

- A description of the barrier you encountered
- The page, section, or feature affected
- The device and assistive technology you are using (e.g., iPhone with VoiceOver,
  Android with TalkBack, desktop with keyboard navigation)
- Any other information that would help us reproduce the issue

We aim to acknowledge accessibility feedback within **5 business days** and to provide
a substantive response or workaround within **15 business days** where possible.

We will not always be able to resolve every barrier immediately, but we will log every
report and work toward improvement.

---

### 9. Ongoing Review

We review and update this statement and the associated Accessibility Checklist
(CV-CHK-001):

- Before each significant public launch or major UI release
- After completing an accessibility audit or usability review
- When a known limitation is resolved
- When a new significant feature is added to the app
- At least annually after public launch

Changes to this statement will be reflected in the document version number and the
Effective Date.

---

### 10. Contact Us

For questions about accessibility, to report a barrier, or to request information in
an alternative format:

**[OPERATOR LEGAL NAME — TBD]**
Attention: Product Lead
**[MAILING ADDRESS — TBD]**
**Email: [CONTACT EMAIL — TBD]**

---

> **Final Note:** This Accessibility Statement is a draft. Before it is published, an
> accessibility review of the app should be completed and the Known Limitations table
> (Section 5) should be updated to reflect the actual state of the app. Legal counsel
> should review the accessibility target wording and the limitations disclosure to
> confirm it is appropriate for the applicable jurisdiction.

---

## Related Documents

| Document | Status |
|---|---|
| [CV-CHK-001 Accessibility Checklist](../checklists/CV-CHK-001%20Accessibility%20Checklist.md) | Draft |
| [CV-POL-003 Terms of Use](CV-POL-003%20Terms%20of%20Use.md) | Draft |
| [CV-POL-004 Public Disclaimer and Non-Affiliation Statement](CV-POL-004%20Public%20Disclaimer%20and%20Non-Affiliation%20Statement.md) | Draft |

---

## Change Log

| Version | Date | Author | Change |
|---|---|---|---|
| 0.1 | 2026-07-26 | Founder / Product Lead | Initial draft — Canadian launch scope |
