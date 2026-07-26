# CV-POL-001 — Privacy Policy

| Field | Value |
|---|---|
| **Document ID** | CV-POL-001 |
| **Version** | 0.1 |
| **Status** | Draft |
| **Owner** | Founder / Privacy Lead |
| **Effective Date** | TBD — pending legal review |
| **Scope** | Civic Voice Canada only |

---

> ⚠️ **DRAFT — NOT YET IN EFFECT**
>
> This Privacy Policy is a working draft prepared for internal review. It has **not** been
> reviewed by legal counsel and is **not** yet published to users. It must not be linked from
> the app, the App Store listing, or any public-facing page until:
>
> 1. Legal review is complete,
> 2. All TBD items are resolved,
> 3. The Effective Date is set, and
> 4. The document status is changed to **Active**.
>
> A separate policy will be prepared when US, UK, or Australian features are launched.

---

## Privacy Policy — Civic Voice Canada

**Effective Date:** TBD

---

### 1. Introduction

This Privacy Policy explains how **[OPERATOR LEGAL NAME — TBD]** ("we", "us", "our") collects,
uses, stores, and protects personal information in connection with the **Civic Voice Canada**
mobile and web application ("Civic Voice", "the App").

We are committed to protecting your privacy and handling your personal information responsibly,
in accordance with Canada's *Personal Information Protection and Electronic Documents Act*
(PIPEDA) and applicable provincial privacy legislation.

Please read this policy carefully. By using Civic Voice, you acknowledge that you have read
and understood this Privacy Policy.

---

### 2. Who We Are

**Operator:** [OPERATOR LEGAL NAME — TBD]
**Mailing address:** [MAILING ADDRESS — TBD]
**Privacy contact email:** [PRIVACY EMAIL ADDRESS — TBD]

If you have questions about this Privacy Policy or want to exercise your privacy rights,
please contact us using the details above.

---

### 3. What Civic Voice Canada Does

Civic Voice Canada is a civic transparency application. It collects, organises, and
displays publicly available information about the Canadian federal government — including
Members of Parliament, Senators, legislation, government contracts, departmental spending,
and related public-interest data — to help Canadians better understand how their government
works.

**You can browse all public civic information in the App without creating an account**,
unless optional account features are made available in the future and you choose to use them.

---

### 4. Personal Information We May Collect

The following personal information may be collected or processed when you use Civic Voice Canada:

#### 4.1 Location — Province or Territory (Current Feature)

When you choose to submit a citizen-opinion vote (Support, Concern, or Oppose) on a
government official or piece of legislation, the App asks for your device's location permission.

- Your device's GPS coordinates are used **only to determine your province or territory**.
- **Precise GPS coordinates are not stored, logged, or transmitted.**
- Only the derived province or territory label (e.g., "Ontario") is saved — to your device
  and, anonymously alongside your vote, to our database.
- You may deny or revoke location permission at any time in your device settings.
  Denying location permission means you will not be able to submit citizen-opinion votes,
  but all other features of the App remain available.

#### 4.2 Anonymous Citizen-Opinion Votes (Current Feature)

When you submit a vote, a record containing **`{ province/territory, vote type, timestamp }`**
is saved to our database. This record:

- Does **not** contain your name, email address, device identifier, IP address, or any
  information that directly identifies you as an individual.
- Is used only to calculate and display aggregate opinion counts within the App.

#### 4.3 App Preferences Saved on Your Device (Current Feature)

The App saves certain preferences to your device's local storage — such as your display
mode (light/dark), which government sections you follow, and your home province/territory
selection. This information:

- Is stored **only on your device** and is never transmitted to our servers.
- Is not personal information we collect, process, or have access to.
- Can be cleared by clearing your browser or app data.

#### 4.4 User Accounts and Email Address (Future — Not Currently Active)

Civic Voice Canada does not currently require or offer user accounts. If optional account
features are introduced in the future, this Privacy Policy will be updated before those
features are made available, and you will be asked to provide separate consent.

#### 4.5 Feedback, Correction Requests, and Contact Forms (Future — Not Currently Active)

If you submit feedback or a data correction request, you may choose to include personal
information such as your name or email address. We will use this information only to
respond to your request. See Section 10 for more detail.

#### 4.6 Push Notifications (Future — Not Currently Active)

Push notification features have not been deployed. If push notifications are introduced,
we will ask for your express consent before sending any notifications, and you will be able
to opt out at any time. See Section 11 for more detail.

---

### 5. Information We Do Not Intentionally Collect

We do not intentionally collect, and have designed the App to avoid collecting:

- **Precise GPS coordinates** — coordinates are used only in-memory to resolve your province
  or territory and are immediately discarded.
- **Your name, date of birth, SIN, health information, or financial information.**
- **Political opinions, party affiliations, or voting intentions** — citizen-opinion votes
  are anonymous and are not linked to your identity. Civic Voice does not create political
  profiles of users.
- **Advertising identifiers or cross-app tracking identifiers** — the App does not use
  advertising SDKs or participate in behavioural advertising.
- **Children's personal information** — see Section 16.

---

### 6. How We Use Personal Information

We use the personal information we collect for the following purposes only:

| Purpose | Information Used | Basis |
|---|---|---|
| Display aggregate citizen-opinion counts in the App | Anonymous vote record (province, vote type, timestamp) | Legitimate interest (anonymous civic data) |
| Gate citizen-opinion vote submission to Canadian residents | Province/territory derived from location permission | Consent (location permission) |
| Respond to feedback or correction requests (future) | Name/email if provided by user | Consent |
| Send update notifications to opted-in users (future) | Notification token | Consent |
| Security, abuse prevention, and infrastructure operation | Server/hosting logs (IP address via platform) | Legitimate interest |

**We do not sell your personal information to any third party.**
**We do not use your personal information to serve you advertising.**
**We do not use your activity in the App to build political profiles or make political recommendations.**

---

### 7. Public Government and Open Data Displayed in the App

Civic Voice Canada displays publicly available government information sourced from official
Canadian open data sources, including:

- Parliament of Canada (parl.ca)
- Elections Canada (elections.ca)
- Government of Canada Open Data Portal (open.canada.ca)
- Public Accounts of Canada

This **public government information is not personal information collected from you** by
Civic Voice. It is sourced independently from official government records and open data
licences. Information about elected officials and public servants displayed in the App is
public-sector information that individuals in public roles have reduced privacy expectations
over, consistent with principles established under Canadian privacy law.

If you are a public official and believe information about you displayed in the App is
inaccurate, please contact us — see Section 10 and Section 14.

---

### 8. Service Providers and Hosting

We use the following service providers (data processors) to operate Civic Voice Canada:

| Provider | Role | Data Processed | Location |
|---|---|---|---|
| **Vercel Inc.** | Web hosting and serverless API functions | Server request logs (including IP address) | United States — see Section 17 |
| **Google LLC — Firebase / Firestore** | Database (anonymous vote counts) | Anonymous vote records; province/territory label | United States — see Section 17 |

We have, or will enter into, data processing agreements with each service provider that
restrict how they may use data we share with them.

These providers act as **processors** — they handle data on our instructions and are not
permitted to use it for their own purposes.

---

### 9. Analytics and Diagnostics

**As of the Effective Date, no analytics SDK or crash reporting SDK has been deployed in
Civic Voice Canada.** The App does not currently collect usage analytics or crash telemetry.

If analytics or crash reporting is introduced in the future, this Privacy Policy will be
updated before deployment. Any analytics used will be selected for data minimisation and
Canadian privacy compliance, and we will disclose what is collected and on what legal basis.

---

### 10. Feedback, Correction Requests, and Contact Forms

If you contact us directly — for example, to report a data error or provide feedback — you
may share personal information such as your name or email address. We will:

- Use that information only to respond to your request.
- Not add you to any mailing list without your separate consent.
- Retain your message for as long as necessary to resolve your request, and for a reasonable
  period after (currently estimated at up to 2 years), then delete it.

In-app feedback forms, if deployed in the future, will be covered by an update to this policy.

---

### 11. Push Notifications and Email Communications

**Civic Voice Canada does not currently send push notifications or email communications.**

The in-app "Follow" feature delivers notifications **within the App interface only** — no
message is sent to your device's notification system, no email is sent, and no notification
token is registered.

If push notifications or email communications are introduced in the future:

- We will ask for your **express consent** before sending any message.
- Every communication will include a clear and functioning **unsubscribe mechanism**.
- We will comply with Canada's *Anti-Spam Legislation* (CASL).
- We will retain consent records for a minimum of 3 years from the date of consent.

---

### 12. Data Retention

| Data | Retention Period |
|---|---|
| Anonymous citizen-opinion vote records (Firestore) | TBD — retained as aggregate; individual records deleted on verified request |
| App preferences (localStorage, device only) | Until you clear app/browser data or uninstall; we do not hold a copy |
| Server/hosting logs (Vercel, Firebase infrastructure) | Platform default — estimated 30–90 days; managed by processor |
| Feedback or correction request correspondence | Until resolved; maximum 2 years, then deleted |
| User account data, if accounts introduced (future) | Until account deletion requested, or 2 years of inactivity |

When personal information is no longer required for the purpose it was collected, we will
delete it or render it non-identifying.

---

### 13. Safeguards

We take reasonable steps to protect the personal information under our control against
loss, theft, unauthorised access, disclosure, copying, use, or modification, including:

- **Encryption in transit** — all data transmitted between the App and our servers uses
  TLS/HTTPS encryption.
- **Access controls** — database collections containing any personal or potentially
  identifying information are access-restricted; anonymous vote records are write-accessible
  to the App but not bulk-readable by clients.
- **Data minimisation** — we design features to collect the minimum information necessary.
  For example, location is resolved to province/territory only; coordinates are discarded.
- **Processor agreements** — our service providers are contractually bound to protect data.

No method of transmission or storage is 100% secure. We cannot guarantee absolute security,
but we are committed to using industry-standard safeguards and improving them over time.

---

### 14. User Access, Correction, and Deletion Requests

Under PIPEDA, you have the right to:

- **Access** the personal information we hold about you.
- **Request correction** of inaccurate personal information.
- **Withdraw consent** for processing based on your consent, subject to legal or contractual
  restrictions.
- **Request deletion** of personal information we hold about you (subject to legal obligations
  to retain certain records).

To exercise any of these rights, please contact us at:

**[PRIVACY EMAIL ADDRESS — TBD]**

Please include enough information to allow us to identify and respond to your request.
We will acknowledge your request within **10 business days** and aim to respond fully within
**30 days**, or notify you if more time is required.

If you are unsatisfied with our response, you may contact the **Office of the Privacy
Commissioner of Canada (OPC)** at [www.priv.gc.ca](https://www.priv.gc.ca).

---

### 15. Privacy Breaches

If we become aware of a privacy breach that creates a real risk of significant harm to
individuals, we will:

1. Take immediate steps to contain the breach.
2. Assess the risk of harm.
3. Notify affected individuals and the **Office of the Privacy Commissioner of Canada**
   as required under PIPEDA.
4. Maintain a record of all breaches, whether or not notification was required.

---

### 16. Children and Minors

Civic Voice Canada is a public civic information application. We do not knowingly collect
personal information from children under the age of 13.

> **TBD — Age gate:** We have not yet implemented an age gate or age-verification mechanism
> in the App. This will be reviewed before public launch and before App Store submission.
> Apple App Store and Google Play guidelines require us to declare our age rating and data
> practices for minors. Our current intended age rating is 4+ / Everyone (civic/educational
> content). We do not direct the App toward children and do not offer features designed for
> children.

If you believe we have inadvertently collected personal information from a child under 13,
please contact us at **[PRIVACY EMAIL ADDRESS — TBD]** and we will delete it promptly.

---

### 17. International Processing

Our service providers, including Vercel and Firebase (Google), operate infrastructure
primarily in the **United States**. When you use Civic Voice Canada, information such as
server request logs and anonymous vote records may be transferred to and processed in the
United States.

The United States does not have a privacy framework that is equivalent to Canadian federal
privacy legislation. We mitigate this risk by:

- Using service providers that have published data processing agreements and comply with
  recognised transfer mechanisms.
- Minimising the personal information that reaches our providers (e.g., anonymous votes
  contain no user identifier).

By using Civic Voice Canada, you acknowledge that your information may be processed outside
Canada in jurisdictions where different privacy laws apply.

---

### 18. Changes to this Privacy Policy

We may update this Privacy Policy from time to time. When we do:

- We will update the **Effective Date** at the top of this page.
- For material changes, we will provide notice within the App (e.g., a notice on next open)
  before the change takes effect.
- We will maintain prior versions of this policy in our compliance records.

Continued use of the App after the Effective Date of a revised policy constitutes acceptance
of the revised terms.

---

### 19. Contact Us

For privacy questions, access or correction requests, or to report a concern:

**[OPERATOR LEGAL NAME — TBD]**
Attention: Privacy Lead
**[MAILING ADDRESS — TBD]**
**Email:** [PRIVACY EMAIL ADDRESS — TBD]

You may also contact the **Office of the Privacy Commissioner of Canada**:
30 Victoria Street, Gatineau, Quebec K1A 1H3
Toll-free: 1-800-282-1376
Website: [www.priv.gc.ca](https://www.priv.gc.ca)

---

## Related Documents

- [CV-REG-002 Privacy Data Map](../registers/CV-REG-002%20Privacy%20Data%20Map.md)
- CV-POL-002 Data Breach Response Plan (TBD)

---

## Change Log

| Version | Date | Author | Change |
|---------|------|--------|--------|
| 0.1 | 2026-07-26 | Founder / Privacy Lead | Initial draft — Canadian launch scope |
