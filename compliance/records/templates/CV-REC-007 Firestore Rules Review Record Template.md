# CV-REC-007 — Firestore Rules Review Record Template

| Field | Value |
|---|---|
| **Record ID** | CV-REC-007-[YYYY-MM-DD] |
| **Template Version** | 0.1 |
| **Status** | Draft template — not yet completed |
| **Owner** | Founder / Technical Lead |
| **Related SOP** | CV-SOP-004 Security and Firebase Access Procedure |
| **Related Policy** | CV-POL-001 Privacy Policy · CV-REG-002 Privacy Data Map |
| **Retention Period** | Minimum 3 years from date of record creation |
| **Date Created** | TBD |
| **Prepared By** | TBD |
| **Reviewed By** | TBD |
| **Approval / Closure Status** | Open |

---

> This is a blank template. Complete one record per Firestore security rules review.
> Reviews should be conducted before public launch and after any change to Firestore
> rules or data collection — per CV-SOP-004 §7.
> Retain completed records in `compliance/records/` according to CV-SOP-004.
> Each completed record should be named CV-REC-007-YYYY-MM-DD.md.
> This record covers the Firestore Rules Review Record requirement referenced in
> CV-REG-003 CV-ISS-015 and CV-CHK-002.

---

## 1. Review Overview

| Field | Value |
|---|---|
| **Review date** | TBD |
| **Rules version / last changed date** | TBD (e.g., commit hash or date of last `firestore.rules` change) |
| **Review trigger** | TBD — Pre-launch review / Rules change / Schema change / Ad-hoc security review |
| **Reviewer** | TBD |
| **Firebase project** | TBD |

---

## 2. Collections Reviewed

List each Firestore collection and confirm the expected read/write behaviour
matches the rules as deployed.

| Collection | Expected Public Read? | Expected Public Write? | Admin / Restricted Write? | Rules Match Expected? | Notes |
|---|---|---|---|---|---|
| `citizen_votes` | TBD | TBD | TBD | Yes / No | |
| TBD | TBD | TBD | TBD | Yes / No | |

---

## 3. Public Read Collections

List all collections that are publicly readable (no authentication required).
For each, confirm that public read is intentional and that no personal data
is exposed.

| Collection | Public Read Intentional? | Personal Data Exposed? | Evidence / Notes |
|---|---|---|---|
| TBD | Yes / No | Yes / No | |

> If any collection exposes personal data under a public read rule, this is a
> High/Critical finding. Record in Section 6 and update CV-REG-003 and CV-REG-002.

---

## 4. Restricted Write Collections

List all collections where write access is restricted to authenticated users,
server-side functions, or admin only.

| Collection | Write Restricted To | Restriction Mechanism | Confirmed in Rules? |
|---|---|---|---|
| TBD | TBD | TBD | Yes / No |

---

## 5. Admin-Only Actions

List any Firestore operations that should only be performed by the admin or
a privileged server-side context, and confirm the rules enforce this.

| Operation | Collection | Admin-Only Enforcement | Confirmed? | Notes |
|---|---|---|---|---|
| TBD | TBD | TBD | Yes / No | |

---

## 6. Findings

| Finding ID | Collection | Finding Description | Severity | Action Required | Owner | Due Date | Resolved? |
|---|---|---|---|---|---|---|---|
| TBD | TBD | TBD | Low / Medium / High / Critical | TBD | TBD | TBD | Yes / No |

---

## 7. Test Evidence

| Test Type | Description | Result | Evidence Location |
|---|---|---|---|
| Rules simulator test | TBD | Pass / Fail | TBD (e.g., Firebase Console Rules Playground screenshot) |
| Manual test — unauthenticated read attempt on restricted collection | TBD | Pass / Fail | TBD |
| Manual test — unauthenticated write attempt on public write-restricted collection | TBD | Pass / Fail | TBD |
| Other: TBD | TBD | Pass / Fail | TBD |

---

## 8. Approval

| Role | Name | Date | Sign-Off |
|---|---|---|---|
| Technical Lead | TBD | TBD | |
| Founder | TBD | TBD | |

**Review outcome:** Pass — no findings / Pass — findings resolved / Conditional pass — findings accepted / Fail — findings outstanding

**Review closure status:** Open / Closed

---

## Change Log

| Version | Date | Author | Change |
|---|---|---|---|
| 0.1 | 2026-08-02 | Founder / Technical Lead | Initial template — Canadian launch scope |
