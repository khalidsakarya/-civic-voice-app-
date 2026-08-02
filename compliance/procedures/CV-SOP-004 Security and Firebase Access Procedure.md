# CV-SOP-004 — Security and Firebase Access Procedure

| Field | Value |
|---|---|
| **Document ID** | CV-SOP-004 |
| **Version** | 0.1 |
| **Status** | Draft |
| **Owner** | Founder / Technical Lead |
| **Effective Date** | TBD — pending review |
| **Scope** | Civic Voice Canada only |
| **Related Documents** | CV-POL-001 Privacy Policy · CV-REG-002 Privacy Data Map · CV-SOP-002 Monthly Data Update SOP · CV-SOP-003 Correction Request Procedure |
| **Review Frequency** | Quarterly; and after any security incident or major infrastructure change |

---

> ⚠️ **DRAFT — NOT YET IN EFFECT**
>
> This SOP is a working draft prepared for internal review. It has **not** been formally
> adopted and is **not** yet in operation. It must be reviewed and approved by the
> Technical Lead and Founder before public launch.

---

## 1. Purpose

This SOP defines how Civic Voice Canada controls access to Firebase, Firestore, GitHub,
Vercel, service accounts, environment variables, API keys, and production data systems.

Its goals are to:

- Ensure that access to production systems is limited to authorised personnel with a
  documented business need.
- Prevent credentials, API keys, service account keys, and secrets from being exposed
  in source code, version control, or insecure storage.
- Ensure that Firestore production writes are controlled and auditable.
- Define clear responsibilities for access provisioning, access review, and offboarding.
- Establish a process for identifying and responding to security incidents.
- Produce records that support audit, legal review, and ongoing compliance.

---

## 2. Scope

This SOP applies to all access to and operations on the following systems used by
Civic Voice Canada:

- **Firebase** — Firebase console, Firebase Authentication, Firebase hosting (if used),
  Firebase Cloud Messaging (if deployed)
- **Firestore** — production Firestore database, Firestore security rules, Firestore
  indexes, Firestore data export
- **GitHub** — source code repositories, Actions workflows, branch protections,
  repository secrets
- **Vercel** — hosting, deployment pipeline, environment variables, serverless function
  logs
- **Google Cloud Platform (GCP)** — service accounts, IAM roles, Secret Manager (if used),
  Cloud Functions (if used), billing account
- **API keys and third-party service credentials** — any API key, OAuth credential,
  or service token used by the app or its data pipeline

This SOP does **not** govern:

- End-user access to the public-facing app — that is governed by CV-POL-003 (Terms of Use).
- Privacy access requests from users — those are governed by CV-POL-001 Section 14.
- Data verification and Firestore write content — those are governed by CV-SOP-001 and
  CV-SOP-002; this SOP governs the access controls around those writes, not the content.

---

## 3. Definitions

| Term | Definition |
|---|---|
| **Authorised Personnel** | A named individual who has been granted access to a production system by the Technical Lead or Founder, with a documented business need. |
| **Admin Access** | The highest level of access to a system — typically permits destructive operations, user management, billing changes, and security rule changes. |
| **Least Privilege** | The principle that each user or service account should have only the minimum access required to perform its function, and no more. |
| **Service Account** | A non-human identity (e.g., a Google Cloud service account) used by scripts, CI/CD pipelines, or server-side functions to authenticate to Firebase or GCP. |
| **Secret** | Any credential, API key, token, service account key, or environment variable that would grant access to a system or expose sensitive data if disclosed. |
| **Firestore Security Rules** | The access control rules defined in the Firebase console that govern which clients can read or write which Firestore documents. |
| **Production Write** | A write operation to the live Firestore database that creates, updates, or deletes a document visible to app users. |
| **Access Review** | A periodic review of all current access grants to confirm they are still necessary and appropriately scoped. |
| **Security Incident** | Any event that involves or may involve unauthorised access, exposed credentials, unexpected data changes, or harm to users — see Section 17. |

---

## 4. Roles and Responsibilities

| Role | Responsibility |
|---|---|
| **Technical Lead** | Overall accountability for this SOP; provisions and revokes access; maintains the Secrets / Environment Variable Register; reviews Firestore security rules; leads security incident response |
| **Founder** | Approves admin-level access grants; is notified of all security incidents; approves offboarding of access when a team member leaves |
| **Developer** | Operates within access grants provisioned by the Technical Lead; does not self-provision access to production systems; reports security incidents immediately to the Technical Lead |
| **Data Lead** | Performs monthly Firestore writes using approved scripts and access — does not hold direct Firestore Admin SDK keys unless approved |
| **Compliance Lead** | Notified of security incidents that may involve personal information or that require regulatory notification under PIPEDA |

---

## 5. Access Control Principles

The following principles govern all access provisioning and review for Civic Voice Canada.

**5.1 — Least privilege.**
Each person and each service account must have only the minimum access required to
perform their specific function. Admin-level access must not be granted as a default.

**5.2 — Individual accounts.**
Shared accounts (e.g., a shared Firebase login or shared GitHub account) must not be
used where individual accounts are available. Each team member must use their own
named account so that access and actions are attributable.

**5.3 — No credentials in source code or version control.**
API keys, service account keys, tokens, passwords, and secrets must never be committed
to GitHub or any other version control system — not in code, not in comments, not in
configuration files, and not in commit history. See Section 11 for approved storage
locations.

**5.4 — Production access is not the default.**
Access to production Firebase, Firestore, GCP, and Vercel is not granted by default to
all team members. It is granted only when there is a specific business need, and is
reviewed quarterly.

**5.5 — Access must be revoked promptly.**
When a team member leaves, changes roles, or no longer needs access, access must be
revoked within 1 business day. See Section 18 (Offboarding).

**5.6 — Security incidents are reported immediately.**
Any suspected security incident — including a leaked credential, an unexpected Firestore
write, or an unauthorised access attempt — must be reported to the Technical Lead
immediately. See Section 17.

---

## 6. Firebase / Firestore Access

**Step 6.1 — Firebase console access.**
Access to the Firebase console must be granted by the Technical Lead using named Google
accounts. Access levels:

| Role | Firebase Console Access Level |
|---|---|
| Technical Lead | Owner |
| Founder | Owner (or Editor — minimum required) |
| Developer | Editor (read/write to specific projects; not billing) |
| Data Lead | Viewer or custom role limited to Firestore read |
| External reviewer / auditor | Viewer, time-limited |

No team member should hold Owner access unless they need to manage IAM, billing, or
service accounts.

**Step 6.2 — Firestore direct read/write access.**
Direct production Firestore reads and writes must be performed:

- Via the Firebase Admin SDK from an authenticated server-side environment (Vercel
  serverless function, Cloud Function, or local script with a service account), or
- Via the Firebase console by a named authorised user, for correction and emergency
  operations only.

Client-side app code must not hold credentials that permit direct writes to restricted
Firestore collections. All client-side writes are governed by Firestore security rules
(Section 7).

**Step 6.3 — Firestore data access scope.**
Access to Firestore collections must be scoped to what is needed:

| Collection | Access Required By |
|---|---|
| `citizen_votes` | Admin SDK (data pipeline scripts); Firebase console (Technical Lead) |
| Government data collections | Admin SDK (monthly update scripts); Firebase console (Technical Lead, Developer) |
| Any collection holding potentially identifying data | Technical Lead only; reviewed quarterly |

**Step 6.4 — Firebase Authentication.**
If Firebase Authentication is enabled (for future optional account features), user
records must only be accessible by the Technical Lead and authorised server-side code.
No developer should access raw user authentication records unless investigating a
specific confirmed incident.

---

## 7. Firestore Rules Review

Firestore security rules are the primary access control mechanism for client-side reads
and writes. They must be reviewed before public launch and after any major app change.

**Step 7.1 — Rules review triggers.**
A Firestore rules review must be conducted:

- Before public launch
- Before any new Firestore collection is created or made publicly readable
- After any major change to the app's data model
- After a security incident involving Firestore
- Quarterly, as part of the access review cycle

**Step 7.2 — Rules review checklist.**

For each Firestore collection, confirm:

| Check | Requirement |
|---|---|
| **Public read scope** | Only collections intended to be publicly readable are readable without authentication |
| **Public write scope** | Client-side writes are limited to the minimum required (e.g., `citizen_votes` write-only) |
| **No bulk read by clients** | Clients cannot query all documents in a collection without restriction |
| **Admin SDK bypass** | Admin SDK (server-side) bypasses security rules — confirm only approved scripts use Admin SDK credentials |
| **No wildcard write rules** | No rule permits unauthenticated writes to government data collections |
| **Rate limiting** | Consider whether Firestore rules or Cloud Functions include rate limiting for write operations |

**Step 7.3 — Record the review.**
After each rules review, create a Firestore Rules Review Record (Section 19.2) noting:

- Date of review
- Reviewer
- Rules version reviewed (rules can be versioned in the Firebase console)
- Collections reviewed
- Issues found and resolved
- Sign-off

---

## 8. GitHub Access

**Step 8.1 — Repository access.**
The Civic Voice Canada GitHub repository must not be public unless a deliberate
open-source decision has been made and approved by the Founder. By default, the
repository is private.

Access to the private repository is granted by the Technical Lead:

| Role | GitHub Access Level |
|---|---|
| Technical Lead | Admin |
| Founder | Admin |
| Developer | Write (push to feature branches; not to main directly) |
| External reviewer / auditor | Read, time-limited |

**Step 8.2 — Branch protection.**
The `main` branch (or equivalent production branch) must have branch protection enabled:

- Direct pushes to `main` are disallowed — changes require a pull request.
- At least one review approval is required before merging to `main` (or self-approval
  is explicitly acknowledged as a single-person-team exception and documented).
- Force pushes to `main` are disallowed.

**Step 8.3 — GitHub Actions and secrets.**
Environment variables and secrets used by GitHub Actions workflows must be stored as
GitHub repository secrets — not as plain text in workflow YAML files or source code.

**Step 8.4 — Dependency and secret scanning.**
The Technical Lead should enable GitHub's dependency scanning and secret scanning alerts
for the repository. Any secret detected in a commit must be treated as a security
incident (Section 17) and rotated immediately.

**Step 8.5 — No credentials in commit history.**
If credentials are discovered in commit history, the affected credentials must be
rotated immediately. The history must be reviewed to assess exposure. Commit history
rewriting (e.g., `git filter-repo`) may be required — this is a destructive operation
requiring Founder approval.

---

## 9. Vercel Access

**Step 9.1 — Vercel team access.**
Access to the Civic Voice Canada Vercel project must be provisioned by the Technical
Lead using named accounts:

| Role | Vercel Access Level |
|---|---|
| Technical Lead | Owner |
| Founder | Owner (or Member — minimum required) |
| Developer | Member (can deploy; cannot manage billing or team) |

**Step 9.2 — Vercel environment variables.**
Production environment variables in Vercel (including API keys, service account
credentials, and Firestore credentials) must be set by the Technical Lead. Developers
must not have access to read production environment variable values unless required for
a specific incident investigation.

Environment variables must be scoped to the appropriate environment (Production,
Preview, Development) and must not be shared across environments where the values differ.

**Step 9.3 — Deployment controls.**
Deployments to the production Vercel environment must be triggered by merges to the
production branch in GitHub. Manual forced deployments to production require Technical
Lead approval.

**Step 9.4 — Vercel serverless function logs.**
Vercel function logs may contain request metadata including IP addresses. Access to
logs must be limited to the Technical Lead and authorised developers investigating a
specific issue. Logs must not be exported or retained beyond Vercel's default log
retention period without a specific reason documented in the Privacy Data Map (CV-REG-002).

---

## 10. Service Accounts and API Keys

**Step 10.1 — Service account inventory.**
The Technical Lead must maintain a Secrets / Environment Variable Register (Section 19.3)
that lists all service accounts and API keys used by Civic Voice Canada, including:

- Service account name and purpose
- System it grants access to
- Access level (read-only, write, admin)
- Where the credential is stored
- Date created
- Date last rotated
- Expiry date (if applicable)
- Owner

**Step 10.2 — Service account key restrictions.**
Service account keys (JSON files from GCP) must:

- Never be committed to GitHub or any version control system.
- Never be stored in the app's source code directory.
- Be stored only in an approved secret storage location (Vercel environment variables,
  GCP Secret Manager, or a local secrets vault — see Section 11).
- Be scoped to the minimum IAM roles required for the account's function.
- Be rotated at least annually or immediately after a security incident.

**Step 10.3 — API key restrictions.**
API keys must:

- Be restricted by referrer, IP, or API scope in the Google Cloud console or the
  issuing service's console, where the service supports restrictions.
- Not be embedded in client-side source code that is committed to a public or
  private GitHub repository.
- Be rotated immediately if exposed.

**Step 10.4 — Unused service accounts and keys.**
Service accounts and API keys that are no longer in active use must be disabled or
deleted within 30 days of becoming unused. The Secrets / Environment Variable Register
must be updated to reflect the change.

---

## 11. Environment Variables and Secrets

**Step 11.1 — Approved storage locations.**
Secrets and environment variables must be stored in one of the following approved
locations only:

| Location | Use Case |
|---|---|
| Vercel environment variables (encrypted) | API keys and credentials used by serverless functions |
| GitHub repository secrets | Secrets used by GitHub Actions CI/CD workflows |
| GCP Secret Manager | Service account keys and secrets used by Cloud Functions or scripts |
| Local `.env` file (development only — never committed) | Local development environment variables |

**Step 11.2 — .env files must never be committed.**
`.env` files and any file containing environment variable values must be listed in
`.gitignore`. The Technical Lead must confirm that `.gitignore` covers:

```
.env
.env.local
.env.production
.env.*.local
*.json  # service account key files — consider a more specific pattern
```

**Step 11.3 — No hardcoded secrets in source code.**
No API key, token, password, service account credential, or other secret must be
hardcoded in source code — not in JavaScript, TypeScript, JSON configuration files,
YAML files, shell scripts, or any other file committed to the repository.

**Step 11.4 — Secrets rotation schedule.**
All secrets must be rotated:

- At least annually as part of the quarterly access review
- Immediately upon any suspected or confirmed exposure
- When a team member with access to the secret leaves or changes roles

---

## 12. Local Development Controls

**Step 12.1 — Local development must not use production credentials.**
Developers must use a separate Firebase project or local Firebase emulator for
development and testing. Production Firebase credentials must not be used in local
development environments.

**Step 12.2 — Firebase Emulator Suite.**
Where possible, developers should use the Firebase Local Emulator Suite for local
Firestore development and testing, so that no development or test data is written to
the production Firestore database.

**Step 12.3 — Local environment variable files.**
Local `.env` or `.env.local` files used for development must:

- Contain only development or emulator credentials — not production credentials.
- Be listed in `.gitignore` and never committed.
- Be shared between team members only through an approved secure channel (not email,
  Slack, or plain text message).

**Step 12.4 — No production data in local development.**
Production Firestore data (including any real user-submitted votes or real government
data) must not be exported to a local development environment unless:

- The Technical Lead explicitly approves a production data export for a specific
  debugging purpose.
- The export is deleted from local environments when the debugging purpose is complete.
- The export is recorded in the Backup / Export Log (Section 19.6).

---

## 13. Production Write Controls

Production Firestore writes during monthly updates, corrections, and emergency
operations are governed by CV-SOP-002 Section 11. This section sets the access-layer
controls that support those write procedures.

**Step 13.1 — Production writes must be authenticated.**
All production Firestore writes must be performed by an authenticated server-side
process using the Firebase Admin SDK. Client-side writes are limited by Firestore
security rules to user-facing operations (e.g., submitting a citizen-opinion vote) and
must not be used for data pipeline or correction writes.

**Step 13.2 — Production write scripts must be version-controlled.**
Scripts used to perform monthly data updates or corrections must be stored in the
GitHub repository (without embedded credentials). Credentials are passed via environment
variables at runtime.

**Step 13.3 — Production writes must be logged.**
Each production write operation must be logged with:

- Date and time
- Script or method used
- Collections and documents written
- Developer or service account that performed the write
- Reference to the CV-SOP-002 Monthly Update Log or CV-SOP-003 Correction Request
  Record that authorised the write

**Step 13.4 — Unplanned production writes require Technical Lead approval.**
Any production Firestore write that is not part of an approved monthly update or
documented correction request requires prior approval from the Technical Lead, recorded
in writing before the write is executed.

---

## 14. Backups and Export

**Step 14.1 — Firestore backup policy.**
Civic Voice Canada should maintain at minimum one recoverable backup of the production
Firestore database, taken before each monthly data update cycle. Options include:

- Firebase / GCP automatic Firestore export to a Cloud Storage bucket
- A manual export using `gcloud firestore export` before each major write cycle

**Step 14.2 — Backup scope.**
At minimum, the following collections must be included in each backup:

- All government data collections (public official profiles, contract records, grant
  records, and other sourced data)
- `citizen_votes` collection

**Step 14.3 — Backup storage.**
Backups must be stored in a GCP Cloud Storage bucket or equivalent secure location
with access restricted to the Technical Lead and Founder. Backups must not be stored
in the GitHub repository.

**Step 14.4 — Backup retention.**
Backups must be retained for a minimum of 90 days. Backups older than 90 days may be
deleted unless a security incident or correction investigation is in progress.

**Step 14.5 — Export log.**
Any manual or automated export of Firestore data must be recorded in the Backup / Export
Log (Section 19.6), including the date, scope, destination, purpose, and who initiated
the export.

---

## 15. Logging and Monitoring

**Step 15.1 — Platform logs.**
Vercel and Firebase automatically generate request logs and function logs. The Technical
Lead should:

- Periodically review Vercel function logs for unexpected errors or unusual traffic
  patterns.
- Enable Firebase App Check or equivalent to reduce unauthorised API access to Firebase
  services, where technically feasible.
- Review Firebase console usage graphs for unusual Firestore read/write spikes that may
  indicate abuse or a misconfigured security rule.

**Step 15.2 — Firestore security rule test coverage.**
Before each public launch or major rules change, the Technical Lead should run the
Firebase security rules test suite (if maintained) to confirm that rules behave as
expected for both authorised and unauthorised access patterns.

**Step 15.3 — Alerts.**
The Technical Lead should configure alerts in GCP or Firebase for:

- Unusually high Firestore write volumes (may indicate a runaway script or abuse)
- Firebase Authentication anomalies (if authentication is enabled)
- Billing anomalies that may indicate unauthorised resource use

**Step 15.4 — Log retention.**
Platform log retention is governed by Vercel's and Firebase's default retention
policies. The Technical Lead should note the current retention periods in the Privacy
Data Map (CV-REG-002) and review them annually.

---

## 16. Access Review

A formal access review must be conducted at least quarterly. The review covers all
systems listed in Section 2.

**Step 16.1 — Complete the Access Review Checklist.**
For each system, list all current users, service accounts, and access levels. For each
entry, confirm whether the access is still needed and appropriately scoped.

**Access Review Checklist:**

| System | User / Account | Access Level | Business Need | Last Reviewed | Keep / Remove / Change | Reviewer | Notes |
|---|---|---|---|---|---|---|---|
| Firebase console | | | | | | | |
| Firestore (Admin SDK / service account) | | | | | | | |
| GitHub repository | | | | | | | |
| Vercel project | | | | | | | |
| GCP IAM | | | | | | | |
| GCP Secret Manager (if used) | | | | | | | |
| GitHub Actions secrets | | | | | | | |
| Third-party API keys (list each) | | | | | | | |

**Step 16.2 — Remove or downgrade unnecessary access.**
For any entry marked "Remove" or "Change", action the change within 5 business days
of completing the review. Record the change in the Access Review Record (Section 19.1).

**Step 16.3 — Rotate stale credentials.**
For any service account key or API key that has not been rotated within 12 months,
rotate it as part of the quarterly review. Record the rotation in the Secrets /
Environment Variable Register (Section 19.3).

**Step 16.4 — Record the review.**
Create an Access Review Record (Section 19.1) documenting the date, reviewer, systems
reviewed, and changes made or confirmed.

---

## 17. Security Incident Triggers

The following events must be treated as security incidents and reported to the Technical
Lead immediately upon discovery.

| Trigger | Severity | Immediate Action |
|---|---|---|
| API key, service account key, or credential committed to GitHub | Critical | Rotate credential immediately; assess exposure in commit history; notify Technical Lead and Founder |
| API key or credential exposed in a public channel (Slack, email, etc.) | Critical | Rotate credential immediately; notify Technical Lead and Founder |
| Unexpected production Firestore write not authorised by CV-SOP-002 or CV-SOP-003 | Critical | Investigate source; revert if incorrect data was written; notify Technical Lead |
| Firestore security rules changed without Technical Lead approval | Critical | Revert rules change; investigate; notify Technical Lead and Founder |
| Suspected unauthorised access to Firebase console, GCP, GitHub, or Vercel | Critical | Revoke access; change passwords; notify Technical Lead and Founder |
| Compromised GitHub, Vercel, or Google account used by a team member | Critical | Revoke access; secure account; notify Technical Lead and Founder |
| Personal information exposed in Firestore, logs, or the app UI | Critical | Remove or restrict access immediately; notify Compliance Lead and Founder; assess PIPEDA notification obligation |
| Malicious or unexplained data changes in Firestore | High | Roll back if possible; investigate; notify Technical Lead |
| Unusual Firestore read/write spike suggesting API abuse | Medium | Review Firestore rules; consider temporary rate limiting; investigate |
| Expired or near-expiry service account key in production | Medium | Rotate before expiry; update Secrets Register |

**Incident response steps:**

1. **Contain** — take the minimum action necessary to stop ongoing harm (rotate
   credential, revert rules, restrict access).
2. **Assess** — determine what was exposed, changed, or accessed.
3. **Notify** — notify the Technical Lead and Founder. For incidents involving personal
   information, notify the Compliance Lead.
4. **Document** — create a Security Incident Record (Section 19.4).
5. **Remediate** — implement permanent fixes and process improvements.
6. **Review** — conduct a post-incident review within 10 business days. Update this SOP
   if process changes are required.

For incidents involving personal information that create a real risk of significant harm,
the Compliance Lead must assess whether notification to the Office of the Privacy
Commissioner of Canada is required under PIPEDA.

---

## 18. Offboarding

When a team member leaves, changes roles, or no longer requires access to any system:

**Step 18.1 — Revoke access within 1 business day.**
The Technical Lead must revoke access to all systems listed in Section 2 within
1 business day of being notified of the departure or role change.

**Step 18.2 — Checklist of systems to revoke.**

- [ ] Firebase console — remove from project members
- [ ] GCP IAM — remove or disable account
- [ ] GitHub repository — remove from repository collaborators or organisation
- [ ] Vercel project — remove from project team
- [ ] Any shared credentials or service account keys the individual had access to — rotate

**Step 18.3 — Rotate shared credentials.**
If the departing team member had access to any shared secret, service account key, or
API key, that credential must be rotated as part of the offboarding process. The new
credential must be distributed only to current authorised personnel through an approved
secure channel.

**Step 18.4 — Record the offboarding.**
Create an Offboarding Record (Section 19.5) documenting:

- Name of team member offboarded
- Date access was revoked
- Systems from which access was removed
- Credentials rotated
- Technical Lead sign-off

---

## 19. Records Generated

---

### 19.1 Access Review Record

Produced at the end of each quarterly access review. One record per review cycle,
retained for at least 2 years.

Fields: Date of review · Systems reviewed · Reviewer · Access changes made · Credentials rotated · Technical Lead sign-off.

---

### 19.2 Firestore Rules Review Record

Produced after each Firestore security rules review. Retained for at least 2 years.

Fields: Date of review · Reviewer · Rules version reviewed · Collections reviewed · Issues found and resolved · Sign-off.

---

### 19.3 Secrets / Environment Variable Register

A living register of all service accounts, API keys, and secrets used by Civic Voice
Canada. Updated whenever a secret is added, rotated, or removed. Retained indefinitely
(current state) with change history.

Fields: Secret name / description · System · Access level · Storage location · Date created · Date last rotated · Expiry date · Owner · Status (active / rotated / retired).

> ⚠️ The register must record **metadata** about secrets — not the secret values
> themselves. Secret values must never be written into compliance documents.

---

### 19.4 Security Incident Record

Produced for each security incident. Retained for at least 3 years from the incident
date.

Fields: Incident ID · Date discovered · Reported by · Nature of incident · Systems affected · Data affected (if any) · Severity · Containment action taken · Assessment outcome · Remediation action · Post-incident review date · Whether PIPEDA notification was assessed · Technical Lead sign-off · Founder sign-off.

---

### 19.5 Offboarding Record

Produced for each team member offboarding. Retained for at least 2 years.

Fields: Team member name · Departure / role change date · Date access revoked · Systems from which access was removed · Credentials rotated · Technical Lead sign-off.

---

### 19.6 Backup / Export Log

A running log of all Firestore backups and data exports. Updated after each backup
or export event.

Fields: Date · Type (automated backup / manual export) · Scope (collections included) · Destination · Purpose · Initiated by · Retention until · Deletion date (when deleted).

---

## 20. Approval

This SOP is approved when the Technical Lead and Founder have reviewed it and confirmed
it accurately reflects the security and access control processes for Civic Voice Canada
at the time of public launch.

| Role | Name | Date |
|---|---|---|
| Technical Lead | TBD | TBD |
| Founder | TBD | TBD |
| Legal Reviewer (if applicable) | TBD | TBD |

---

## Related Documents

| Document | Status |
|---|---|
| [CV-POL-001 Privacy Policy](../policies/CV-POL-001%20Privacy%20Policy.md) | Draft |
| [CV-REG-002 Privacy Data Map](../registers/CV-REG-002%20Privacy%20Data%20Map.md) | Draft |
| [CV-SOP-002 Monthly Data Update SOP](CV-SOP-002%20Monthly%20Data%20Update%20SOP.md) | Draft |
| [CV-SOP-003 Correction Request Procedure](CV-SOP-003%20Correction%20Request%20Procedure.md) | Draft |
| [CV-SOP-001 Data Verification SOP](CV-SOP-001%20Data%20Verification%20SOP.md) | Draft |

---

> **Final Note:** This SOP is a draft and must be reviewed by the Technical Lead and
> Founder before public launch of Civic Voice Canada. In particular, the Firestore
> security rules review process, the secrets rotation schedule, and the security
> incident response steps should be tested against the actual infrastructure in use at
> the time of launch and updated to reflect any differences in practice.

---

## Change Log

| Version | Date | Author | Change |
|---|---|---|---|
| 0.1 | 2026-07-26 | Founder / Technical Lead | Initial draft — Canadian launch scope |
