# CV-REC-008 — Secrets and Environment Variable Register Template

| Field | Value |
|---|---|
| **Record ID** | CV-REC-008 (living register — not per-event) |
| **Template Version** | 0.1 |
| **Status** | Draft template — not yet in use |
| **Owner** | Founder / Technical Lead |
| **Related SOP** | CV-SOP-004 Security and Firebase Access Procedure |
| **Retention Period** | Keep current; archive superseded versions for minimum 3 years |
| **Date Created** | TBD |
| **Prepared By** | TBD |
| **Reviewed By** | TBD |
| **Approval / Closure Status** | Living register |

---

> ⚠️ **CRITICAL WARNING — DO NOT RECORD SECRET VALUES**
>
> This register tracks the **existence, ownership, storage location, and rotation
> status** of secrets and environment variables. It must **never** contain actual
> secret values, API keys, tokens, passwords, connection strings, or any credential.
>
> If a secret value is accidentally recorded here, treat this file as compromised:
> rotate the affected secret immediately and remove the value from this file and
> from all git history before the file is committed.
>
> Actual secret values must be stored only in the approved secrets management
> system (e.g., Vercel environment variables, GitHub repository secrets, or an
> approved secrets manager) — never in markdown files, source code, or this register.

---

> This is a blank template for the Secrets and Environment Variable Register. This
> register is a living document. Add a row for each secret or environment variable
> used by the app or its infrastructure. Update the register whenever a secret is
> added, rotated, or removed.
>
> Retain this register in `compliance/records/` as
> `CV-REC-008 Secrets and Environment Variable Register.md`.
> Review quarterly or whenever access changes — per CV-SOP-004 §6.

---

## 1. Register Purpose

This register provides an inventory of all secrets and environment variables used
by Civic Voice Canada across all environments (production, staging, development).

Its purpose is to ensure that:

- All secrets are known, owned, and stored in approved locations.
- Secret rotation schedules are tracked and maintained.
- Secrets that are no longer needed are identified and revoked.
- Access reviews (CV-REC-006) can be conducted against a complete inventory.

---

## 2. Secrets and Environment Variable Inventory

> **Column guide:**
> - **Secret / Variable name** — the name of the environment variable or secret (e.g., `FIREBASE_SERVICE_ACCOUNT_KEY`) — not the value
> - **System** — the system that uses this secret (e.g., Vercel, Firebase, GitHub Actions)
> - **Environment** — Production / Staging / Development / All
> - **Purpose** — what the secret enables (e.g., "Firebase Admin SDK authentication for server-side Firestore writes")
> - **Owner** — who is responsible for this secret
> - **Storage location** — where the secret is stored (e.g., "Vercel environment variables — production", "GitHub repository secrets") — not the value
> - **Access level** — who can read or use the secret (e.g., "Vercel build environment only", "Technical Lead only")
> - **Rotation frequency** — how often the secret should be rotated (e.g., Annually / On team change / Never — static / On compromise)
> - **Last reviewed** — date the secret was last reviewed for continued need and appropriate access
> - **Last rotated** — date the secret was last rotated; TBD if never rotated or unknown

| Secret / Variable Name | System | Environment | Purpose | Owner | Storage Location | Access Level | Rotation Frequency | Last Reviewed | Last Rotated | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | |

> ⚠️ Do not record actual secret values in the table above or anywhere in this file.

---

## 3. Removed / Revoked Secrets

Record secrets that have been removed or revoked here for audit trail purposes.

| Secret / Variable Name | System | Date Removed / Revoked | Reason | Removed By | Notes |
|---|---|---|---|---|---|
| TBD | TBD | TBD | TBD | TBD | |

---

## 4. Register Review Log

| Review Date | Reviewer | Secrets Reviewed | Actions Taken | Next Review Date |
|---|---|---|---|---|
| TBD | TBD | TBD | TBD | TBD |

---

## 5. Approval

| Role | Name | Date | Sign-Off |
|---|---|---|---|
| Technical Lead | TBD | TBD | |
| Founder | TBD | TBD | |

---

## Change Log

| Version | Date | Author | Change |
|---|---|---|---|
| 0.1 | 2026-08-02 | Founder / Technical Lead | Initial template — Canadian launch scope |
