# CV-SOP-005 — CASL Communications Procedure

| Field | Value |
|---|---|
| **Document ID** | CV-SOP-005 |
| **Version** | 0.1 |
| **Status** | Draft |
| **Owner** | Founder / Compliance Lead |
| **Effective Date** | TBD — pending review |
| **Scope** | Civic Voice Canada only |
| **Related Documents** | CV-POL-001 Privacy Policy · CV-POL-003 Terms of Use · CV-REG-002 Privacy Data Map |
| **Review Frequency** | Before launch of any email, newsletter, push notification, SMS, donation, or marketing communication feature |

---

> ⚠️ **DRAFT — NOT YET IN EFFECT**
>
> This SOP is a working draft prepared for internal review. It has **not** been formally
> adopted and is **not** yet in operation. Civic Voice Canada does not currently send
> any electronic communications to users. This procedure must be reviewed and approved
> before any communication feature is launched.

---

## 1. Purpose

This SOP defines how Civic Voice Canada manages consent, identification, unsubscribe
controls, records, and review requirements for electronic messages, including email,
SMS, push notifications, newsletters, donation messages, and promotional communications.

Its goals are to:

- Ensure all commercial electronic messages sent by Civic Voice Canada comply with
  Canada's *Anti-Spam Legislation* (CASL, S.C. 2010, c. 23) and the Electronic Commerce
  Protection Regulations.
- Prevent electronic messages from being sent without documented consent, proper
  identification, and a functioning unsubscribe mechanism.
- Separate functional communications (security alerts, service notices) from
  promotional and marketing communications, and apply appropriate controls to each.
- Ensure that consent records are retained and can be produced if a CASL complaint
  or regulatory inquiry is received.
- Prohibit the use of user communications for political persuasion, party endorsement,
  or targeted political messaging.
- Provide a pre-send review process that prevents non-compliant messages from being
  dispatched.

---

## 2. Scope

This SOP applies to all electronic messages sent or planned to be sent by Civic Voice
Canada to users, including:

- Email newsletters and update digests
- Promotional emails (feature announcements, civic campaigns, etc.)
- Push notifications to mobile devices (iOS / Android)
- SMS messages (if deployed)
- Donation or fundraising solicitations
- In-app messages that are delivered outside the app interface (i.e., via
  push/email/SMS rather than as in-app UI content)
- Any automated sequence or triggered message sent to a user's email, device, or phone

This SOP does **not** govern:

- In-app notifications displayed only within the app's own UI — those are a product
  feature and do not constitute electronic messages under CASL.
- Transactional or account messages that are purely functional — see Section 14 for
  how these are classified and handled.
- Correction request response emails — those follow CV-SOP-003 and are treated as
  functional messages under Section 14.
- Internal team communications (email between staff/founders).

---

## 3. Definitions

| Term | Definition |
|---|---|
| **CASL** | Canada's Anti-Spam Legislation (S.C. 2010, c. 23) — federal legislation regulating commercial electronic messages sent to or from Canadian electronic addresses. |
| **Commercial Electronic Message (CEM)** | An electronic message sent to an electronic address (email, SMS, messaging app) whose primary purpose, or one of its primary purposes, is to encourage participation in a commercial activity. Under CASL, most promotional, newsletter, donation, and feature-marketing messages qualify as CEMs. |
| **Express Consent** | A clear, affirmative opt-in by the user — e.g., checking an unchecked box, tapping "Subscribe", or completing a sign-up form specifically requesting messages. The burden is on Civic Voice Canada to prove express consent was obtained. |
| **Implied Consent** | Consent that arises from a prior business relationship or other defined circumstance under CASL (e.g., a user who made a donation in the past two years). Implied consent has a defined time limit and does not apply to all message types. |
| **Unsubscribe Mechanism** | A clear, simple, and functioning mechanism in every CEM that allows the recipient to opt out of future messages. Under CASL, unsubscribe requests must be honoured within 10 business days. |
| **Sender Identification** | The legal name and mailing address (or working contact URL) of the sender, which must appear in every CEM. |
| **Functional Message** | A message sent for a purely transactional, account, or service purpose — e.g., password reset, security alert, correction request response. Functional messages are not CEMs under CASL if they do not encourage commercial activity. |
| **Consent Record** | A structured record proving when, how, and for what purpose a user gave consent to receive messages — see Section 17.1. |
| **Unsubscribe Log** | A record of every unsubscribe request received and actioned — see Section 17.2. |

---

## 4. Roles and Responsibilities

| Role | Responsibility |
|---|---|
| **Compliance Lead** | Overall accountability for this SOP; reviews all communication features before launch; approves pre-send review for each campaign or new message type; maintains Consent Records; receives and actions unsubscribe complaints |
| **Founder** | Approves new communication features; approves any deviation from this SOP; is notified of CASL complaints or regulatory inquiries |
| **Developer** | Implements consent capture, unsubscribe mechanisms, and sender identification in app and email code; does not launch communication features without Compliance Lead sign-off |
| **Legal Counsel (TBD)** | Advises on CASL consent classification, implied consent expiry, and regulatory complaint responses |

---

## 5. Communication Types

The following communication types are anticipated for Civic Voice Canada. Each is
classified and governed in the relevant section of this SOP.

| Communication Type | CASL Classification | Governed By | Status |
|---|---|---|---|
| In-app notifications (Follow feature, UI only) | Not a CEM — in-app UI only | Product feature | Currently implemented — not governed by this SOP |
| Email correction request response | Functional — not a CEM | CV-SOP-003 §14 | Future — not yet deployed |
| Account security / password reset email | Functional — not a CEM | §14 | Future — not yet deployed |
| Email newsletter / update digest | CEM — express consent required | §12 | Future — not yet deployed |
| Feature announcement email | CEM — express consent required | §12 | Future — not yet deployed |
| Push notification (civic update) | CEM if promotional; functional if account/security | §11 | Future — not yet deployed |
| SMS message | CEM — express consent required | §7 | Future — not yet deployed |
| Donation / fundraising solicitation | CEM — express consent required | §13 | Future — not yet deployed |
| Political persuasion / party/candidate message | **Prohibited** — see §15 | §15 | Prohibited at all times |

---

## 6. Functional vs Promotional Communications

Before any message is sent, the Compliance Lead must classify it as functional or
promotional. This classification determines whether CASL consent requirements apply.

### 6.1 Functional Messages

A message is **functional** (not a CEM) if its sole or primary purpose is to:

- Confirm or complete a transaction the user initiated (e.g., confirming a correction
  request was received)
- Provide account security information (e.g., password reset, login alert)
- Deliver a service notice required to maintain the user's account or service (e.g.,
  a notification that the app's terms are changing)
- Respond to a direct inquiry from the user

Functional messages must not include promotional content, feature marketing, donation
solicitations, or calls to action unrelated to the functional purpose of the message.

### 6.2 Promotional Messages

A message is **promotional** (a CEM) if any of its primary purposes is to:

- Encourage use of a feature, service, or product
- Promote Civic Voice Canada's brand, content, or initiatives
- Solicit a donation or financial contribution
- Announce a new feature or content area in a way that encourages engagement
- Deliver a newsletter or content digest

All promotional messages require express consent, proper identification, and a
functioning unsubscribe mechanism before they may be sent.

### 6.3 When Classification Is Unclear

If the classification of a message as functional or promotional is unclear, the
Compliance Lead must treat it as a CEM and apply all CASL requirements. If consent
status is unclear, the message must not be sent until it is reviewed and confirmed.

---

## 7. Consent Requirements

### 7.1 Express Consent — Required Elements

Before sending any CEM, Civic Voice Canada must obtain **express consent** from each
recipient. To be valid, express consent must be:

1. **Actively given** — the user must take a positive action (tick an unchecked box,
   tap a "Subscribe" button, complete a sign-up form). Pre-checked boxes do not
   constitute express consent and are prohibited — see Section 15.
2. **Informed** — at the point of consent, the user must be told:
   - The name of the organisation sending the messages (Civic Voice Canada / operator
     legal name)
   - The types of messages they are consenting to receive
   - That they can unsubscribe at any time
3. **Specific** — consent for one message type (e.g., newsletter) does not constitute
   consent for a different message type (e.g., donation solicitations). Each message
   type requires its own consent unless the types are clearly bundled in the consent
   language and the user consents to all.
4. **Documented** — a Consent Record (Section 17.1) must be created at the time of
   consent capture.

### 7.2 Implied Consent

CASL permits implied consent in limited circumstances, including where the recipient
has made a donation, purchase, or inquiry within defined time limits. Given the civic
informational nature of Civic Voice Canada, implied consent scenarios are unlikely to
apply broadly. Implied consent must not be relied upon without review by the Compliance
Lead and confirmation from legal counsel that the applicable CASL implied consent
category applies.

### 7.3 Consent Language — Required Wording

The following elements must appear at every consent capture point:

> "By checking this box, you agree to receive [TYPE OF MESSAGE — e.g., the Civic Voice
> Canada newsletter] from **[OPERATOR LEGAL NAME — TBD]**. You can unsubscribe at any
> time by clicking the unsubscribe link in any message or by contacting us at
> [CONTACT EMAIL — TBD]."

Variations are permitted for specific contexts (push notifications, SMS), but all
required elements must be present. The consent language must be reviewed by the
Compliance Lead before a new consent capture point is deployed.

### 7.4 Consent Must Be Separate from Terms of Service Agreement

Agreement to the Terms of Use or Privacy Policy must not double as consent to receive
commercial electronic messages. Consent to marketing or newsletter communications must
be a separate, explicit opt-in step.

---

## 8. Consent Records

A Consent Record must be created and retained for every express consent obtained.
See Section 17.1 for the full template.

**Step 8.1 — Record at point of consent.**
The system must capture the Consent Record at the moment the user opts in — not
retroactively. The record must include the consent language shown, the date and time,
and the mechanism used.

**Step 8.2 — Retention period.**
Consent records must be retained for a minimum of **3 years from the date of consent**
or 3 years from the last message sent to that user under that consent, whichever is
later. This is the evidentiary standard recommended to respond to a CASL complaint.

**Step 8.3 — Burden of proof.**
Under CASL, the burden of proving consent lies with Civic Voice Canada — not the user.
If a consent record cannot be produced for a message recipient, the message must be
treated as non-compliant.

**Step 8.4 — Consent records must not be stored with raw personal data.**
Consent records reference the user by a consent ID and the associated email or
identifier. They must be stored securely and access-restricted consistent with CV-REG-002
(Privacy Data Map).

---

## 9. Identification Requirements

Every CEM sent by Civic Voice Canada must clearly identify the sender in the message
body or header. The following information must appear in every CEM:

| Required Element | Detail |
|---|---|
| **Legal name of sender** | **[OPERATOR LEGAL NAME — TBD]** |
| **Operating name** | Civic Voice Canada (if different from legal name) |
| **Mailing address** | **[MAILING ADDRESS — TBD]** — must be a valid address or P.O. Box |
| **Contact method** | Email address or a working URL to a contact/unsubscribe page |

This information may appear in the footer of the message. It must be legible and not
obscured by design or formatting.

Civic Voice Canada must not send messages that disguise or misrepresent the sender
identity in any header field, subject line, or body content.

---

## 10. Unsubscribe Requirements

Every CEM must include a clear, simple, and functioning unsubscribe mechanism.

**Step 10.1 — Unsubscribe mechanism requirements.**

The unsubscribe mechanism must:

- Be **clearly labelled** — e.g., "Unsubscribe", "Manage preferences", or equivalent.
  It must not be hidden, obscured, or require more than two steps to complete.
- **Function for at least 60 days** after the message is sent (CASL requirement).
- **Honour the request within 10 business days** of receipt (CASL requirement).
- **Not require the user to log in**, pay a fee, provide additional personal information,
  or take any action other than clicking a link or confirming the unsubscribe.

**Step 10.2 — Unsubscribe log.**
Every unsubscribe request must be logged in the Unsubscribe Log (Section 17.2) within
1 business day of receipt.

**Step 10.3 — Suppress unsubscribed addresses.**
Once a user unsubscribes, their address must be added to a suppression list that
prevents future CEMs from being sent to that address under the same consent type. The
suppression list must be maintained even if the user re-subscribes later — a new
express consent record is required before future messages are sent.

**Step 10.4 — Do not send after unsubscribe.**
Civic Voice Canada must not send any further CEMs to a user who has unsubscribed, for
the applicable message type, after the unsubscribe request has been processed.
Functional messages (Section 6.1) may still be sent if they are genuinely functional
in nature.

---

## 11. Push Notifications

**Step 11.1 — Push notifications require explicit opt-in.**
Push notifications must not be sent to any device unless the user has explicitly
opted in to receive them through the device's native permission prompt (iOS permission
dialog or Android notification permission). The in-app Follow feature does not
constitute opt-in to device-level push notifications.

**Step 11.2 — Notification token must not be registered before opt-in.**
The Firebase Cloud Messaging (FCM) token or Apple Push Notification Service (APNs)
token must not be registered or transmitted to any server until the user has granted
device-level push notification permission.

**Step 11.3 — Consent record for push opt-in.**
When a user opts in to push notifications, a Consent Record (Section 17.1) must be
created recording the device type, notification permission granted, date and time, and
app version at the time of opt-in.

**Step 11.4 — In-app preference controls.**
Where technically feasible, users should be able to manage push notification preferences
within the app (e.g., choose which types of civic updates they receive) in addition to
the device-level permission toggle.

**Step 11.5 — Unsubscribe from push notifications.**
Users must be able to opt out of push notifications at any time:

- Through their device notification settings (iOS Settings / Android Settings), and
- Through an in-app preference or unsubscribe option where implemented.

Opting out via device settings must also result in no further push notifications being
sent, even if the FCM/APNs token remains technically registered. Tokens for users
who have opted out must be suppressed from future sends.

**Step 11.6 — Push notification content must not be promotional without consent.**
If push notification content crosses into promotional or marketing territory (e.g.,
announcements designed to drive engagement rather than deliver a civic update the user
specifically subscribed to), CASL CEM consent requirements apply and must be confirmed
before the message is sent.

---

## 12. Newsletters

**Step 12.1 — Express consent before first newsletter.**
No user may receive a newsletter or email update digest until a valid Consent Record
exists for that user for newsletter communications.

**Step 12.2 — Newsletter consent must be specific.**
The consent capture for a newsletter must describe what the newsletter contains — for
example:

> "Weekly update with new civic data, feature announcements, and Canadian government
> transparency news from Civic Voice Canada."

A user who signs up for one newsletter type (e.g., "weekly digest") has not consented
to a different newsletter type (e.g., "donation campaign") unless the consent language
bundled these types together and the user agreed.

**Step 12.3 — Newsletter template requirements.**
Every newsletter must include:

- Sender name and mailing address in the footer (Section 9)
- A clearly labelled unsubscribe link (Section 10)
- The name and description of the newsletter the user signed up for
- No content that constitutes political persuasion, party endorsement, or candidate
  recommendation (Section 15)

**Step 12.4 — Pre-send review.**
Every newsletter send must pass the Pre-Send Review Checklist (Section 16) before
dispatch.

---

## 13. Donation or Fundraising Messages

**Step 13.1 — Treat as CEM unless confirmed otherwise.**
Any message that solicits a financial contribution, donation, or recurring support from
a user is treated as a CEM under this SOP, requiring express consent, identification,
and an unsubscribe mechanism, unless legal counsel confirms a specific CASL exemption
applies.

**Step 13.2 — Separate consent for donation messages.**
Consent to receive a newsletter or civic update does not constitute consent to receive
donation solicitations. Donation or fundraising messages require a separate, explicit
consent to receive financial solicitations.

**Step 13.3 — Donation messages must not imply government endorsement.**
Donation or fundraising messages must include the standard non-affiliation disclaimer
from CV-POL-004 and must not imply that any government body, public official, or
political party supports or endorses the fundraising campaign.

**Step 13.4 — Review before launch.**
No donation or fundraising communication feature may be launched without:

1. Legal counsel review of the applicable CASL consent category
2. Compliance Lead sign-off on the consent capture wording
3. A completed Pre-Send Review Checklist (Section 16)
4. Founder approval

---

## 14. Correction / Account / Security Messages

Functional messages — including correction request responses, account security notices,
and service change notifications — are not CEMs under CASL and do not require marketing
consent. However, they must still:

**Step 14.1 — Contain no promotional content.**
Functional messages must not include feature promotions, newsletter sign-up calls to
action, donation solicitations, or any content whose primary purpose is commercial.
Adding a brief "Download Civic Voice" app store badge in a footer is a borderline case
— if included, it must be secondary to the functional content and not the primary
purpose of the message.

**Step 14.2 — Identify the sender.**
All messages, including functional messages, must identify Civic Voice Canada /
[OPERATOR LEGAL NAME — TBD] as the sender and include a contact method.

**Step 14.3 — Not used for political messaging.**
Correction request acknowledgements, security alerts, and account notices must not
include political messaging, party references, candidate endorsements, or voting
recommendations.

**Step 14.4 — Functional message log.**
A log of functional message types deployed (not individual messages) should be
maintained in the Privacy Data Map (CV-REG-002) to confirm they are functional in
nature and do not require consent.

---

## 15. Prohibited Practices

The following are prohibited in all electronic communications sent by Civic Voice Canada.

| Prohibited Practice | Reason |
|---|---|
| Pre-checked consent boxes | Express consent requires an active opt-in — pre-checked boxes are invalid under CASL |
| Hidden or obscured unsubscribe links | CASL requires a clear, simple unsubscribe mechanism |
| Sending a CEM without a valid Consent Record | Core CASL violation |
| Sending a CEM after a user has unsubscribed | Core CASL violation; 10-business-day processing deadline |
| Bundling newsletter consent into Terms of Service or Privacy Policy acceptance | Consent to communications must be a separate, explicit act |
| Political persuasion messages | Civic Voice Canada is an independent platform; it does not send political persuasion, party endorsement, or candidate recommendation messages |
| Party affiliation or candidate endorsement in any message | Violates independence principles and CV-POL-004 |
| Using user activity data to create political profiles for targeted messaging | Violates CV-POL-001 (Privacy Policy) and independence principles |
| Voting recommendations in any message | Prohibited under CV-POL-004 and CV-POL-003 |
| Misleading subject lines or sender names | Prohibited under CASL |
| Harvested or purchased email lists | Only users who have given express consent to Civic Voice Canada may receive CEMs |
| Sending messages to email addresses obtained from unofficial app scraping or third-party data | Only users who have directly consented through Civic Voice Canada channels may receive CEMs |
| Using implied consent without Compliance Lead review and legal counsel confirmation | Implied consent has strict CASL conditions; must not be assumed |

---

## 16. Pre-Send Review

A Pre-Send Review Checklist must be completed before every new communication feature
is launched and before every individual campaign or newsletter send.

**Pre-Send Review Checklist:**

| Item | Requirement | Pass / Fail / NA | Reviewer | Date | Notes |
|---|---|---|---|---|---|
| CEM classification confirmed | Message is classified as CEM or functional; classification documented | | | | |
| Consent records confirmed | Valid Consent Records exist for all recipients in the send list | | | | |
| No pre-checked consent boxes | Consent was captured via active opt-in only | | | | |
| Consent language reviewed | Consent language shown to users was specific to this message type | | | | |
| Suppression list applied | Unsubscribed addresses are excluded from the send list | | | | |
| Sender identification present | Legal name and mailing address appear in the message | | | | |
| Unsubscribe link present and functional | Unsubscribe link tested; functions for 60 days | | | | |
| Unsubscribe link clearly labelled | Not hidden; reachable within two steps | | | | |
| No political persuasion content | Message contains no party endorsement, candidate recommendation, or voting advice | | | | |
| No promotional content in functional message | Functional messages contain no marketing calls to action | | | | |
| Non-affiliation disclaimer present where required | Messages referencing government data include the CV-POL-004 disclaimer | | | | |
| Message content reviewed for prohibited claims | No corruption findings, investment signals, legal conclusions, or advice | | | | |
| Push notification opt-in confirmed | For push: device permission and Consent Record exist | | | | |
| Compliance Lead sign-off | Compliance Lead has reviewed and approved this send | | | | |
| Founder approval (new feature or donation message) | Founder has approved for first launch or donation campaigns | | | | |

---

## 17. Records Generated

---

### 17.1 Consent Record — Template

One record per user per consent event. Retained for a minimum of 3 years from date of
consent or date of last send under that consent, whichever is later.

| Field | Value |
|---|---|
| **Consent ID** | CV-CONS-[YYYY]-[NNN] |
| **User ID / Email** | (pseudonymised or hashed where possible; raw email only where required for suppression) |
| **Communication Type** | Newsletter / Push notification / Donation message / SMS / other |
| **Consent Source** | Page URL or screen name where consent was captured |
| **Consent Language Shown** | Exact wording of the consent statement presented to the user |
| **Date / Time** | ISO 8601 timestamp of opt-in |
| **IP / Device Metadata** | IP address or device type, if collected and documented in CV-REG-002 |
| **Version of Privacy Policy / Terms** | Version number of CV-POL-001 and CV-POL-003 in effect at time of consent |
| **Opt-in Method** | Checkbox / Subscribe button / Push permission dialog / other |
| **Unsubscribe Date** | Date of unsubscribe, if applicable |
| **Status** | Active / Unsubscribed / Expired |
| **Notes** | Any additional context |

---

### 17.2 Unsubscribe Log

A running log of every unsubscribe request received and actioned. Updated within
1 business day of each request. Retained for 3 years.

Fields: Unsubscribe ID · Consent ID reference · Communication type · Date request received · Channel (email link / device settings / in-app / direct contact) · Date actioned · Suppression list updated · Compliance Lead confirmation.

---

### 17.3 Communication Campaign Review Record

Produced for each campaign or new message type before first send. Retained for 3 years.

Fields: Campaign / message type name · Date of review · Compliance Lead reviewer · Pre-Send Review Checklist reference · Send list size · Consent coverage confirmed · Unsubscribe mechanism tested · Founder approval (if required) · Sign-off.

---

### 17.4 Complaint Record

If a CASL complaint, unsubscribe failure report, or regulatory inquiry is received,
create a Complaint Record. Retained for 3 years.

Fields: Complaint ID · Date received · Source (CRTC, user, legal notice) · Nature of complaint · Message in question · Consent Record reference · Response taken · Resolution date · Legal counsel notified (Y/N) · Founder notified (Y/N).

---

### 17.5 Privacy Data Map Update

If a new communication feature changes the personal information processed by Civic Voice
Canada (e.g., email addresses are now stored, push tokens are now registered), update
CV-REG-002 (Privacy Data Map) before the feature is deployed to production. Record
the update in the Privacy Data Map change log.

---

### 17.6 Deviation Record

If any step in this SOP is not followed — including sending a message before a Pre-Send
Review is complete, or discovering that a consent record is missing — create a Deviation
Record documenting the nature of the deviation, how it was discovered, corrective action
taken, and any SOP changes required.

---

## 18. Deviations and Escalation

| Situation | Escalation Path |
|---|---|
| CEM sent without a valid Consent Record | Compliance Lead and Founder immediately; assess CASL exposure; do not send further messages to affected recipients until reviewed |
| Unsubscribe request not actioned within 10 business days | Compliance Lead immediately; action the unsubscribe; assess whether CASL deadline was breached |
| CASL complaint received from CRTC or user | Founder and legal counsel immediately; do not respond to CRTC without legal counsel review |
| Consent classification is unclear | Compliance Lead review; treat as CEM; do not send until confirmed |
| Donation or fundraising message proposed | Compliance Lead and legal counsel review before any consent capture or send |
| Political persuasion message proposed | Prohibited — escalate to Founder; do not send |

---

## 19. Approval

This SOP is approved when the Compliance Lead and Founder have reviewed it and confirmed
it accurately reflects the communications consent process for Civic Voice Canada, and
before any electronic communication feature is launched.

| Role | Name | Date |
|---|---|---|
| Compliance Lead | TBD | TBD |
| Founder | TBD | TBD |
| Legal Reviewer (CASL — if applicable) | TBD | TBD |

---

## Related Documents

| Document | Status |
|---|---|
| [CV-POL-001 Privacy Policy](../policies/CV-POL-001%20Privacy%20Policy.md) | Draft |
| [CV-POL-003 Terms of Use](../policies/CV-POL-003%20Terms%20of%20Use.md) | Draft |
| [CV-REG-002 Privacy Data Map](../registers/CV-REG-002%20Privacy%20Data%20Map.md) | Draft |
| [CV-SOP-003 Correction Request Procedure](CV-SOP-003%20Correction%20Request%20Procedure.md) | Draft |
| [CV-SOP-004 Security and Firebase Access Procedure](CV-SOP-004%20Security%20and%20Firebase%20Access%20Procedure.md) | Draft |

---

> **Final Note:** This SOP is a draft and must be reviewed by the Compliance Lead,
> Founder, and legal counsel before any public communication feature is launched.
> In particular, the consent classification for push notifications, the implied consent
> analysis, and the donation message requirements should be confirmed against the current
> state of CASL and the CRTC's published guidance at the time of launch.

---

## Change Log

| Version | Date | Author | Change |
|---|---|---|---|
| 0.1 | 2026-07-26 | Founder / Compliance Lead | Initial draft — Canadian launch scope |
