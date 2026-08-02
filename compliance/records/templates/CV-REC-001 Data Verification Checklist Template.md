# CV-REC-001 — Data Verification Checklist Template

| Field | Value |
|---|---|
| **Record ID** | CV-REC-001-[YYYY-MM-DD]-[SOURCE-ID] |
| **Template Version** | 0.1 |
| **Status** | Draft template — not yet completed |
| **Owner** | Founder / Data Lead |
| **Related SOP** | CV-SOP-001 Data Verification SOP |
| **Related Policy** | CV-POL-002 Data Sources and Attribution Policy |
| **Related Register** | CV-REG-001 Data Source Register |
| **Retention Period** | Minimum 3 years from date of record creation |
| **Date Created** | TBD |
| **Prepared By** | TBD |
| **Reviewed By** | TBD |
| **Approval / Closure Status** | Open |

---

> This is a blank template. Complete one record per dataset verification event.
> Retain completed records in `compliance/records/` according to CV-SOP-001 §10.
> Do not record partial verifications as complete — all required fields must be filled
> before the final decision field is set.

---

## 1. Dataset Identification

| Field | Value |
|---|---|
| **Dataset name** | TBD |
| **Jurisdiction** | TBD (e.g., Canada Federal · Ontario · British Columbia) |
| **Source ID** (CV-REG-001 reference) | TBD (e.g., SRC-001) |
| **Source URL** | TBD |
| **Source owner / publisher** | TBD (e.g., Parliament of Canada) |
| **Licence name** | TBD (e.g., Open Government Licence — Canada) |
| **Licence status** (from CV-REG-001) | TBD (Approved / Review Required / TBD) |
| **Reporting period** | TBD (e.g., 44th Parliament, 2021–2025) |
| **Fetched date** | TBD |
| **Verification trigger** | TBD (e.g., Monthly update · New source · Ad-hoc correction) |
| **Risk level** | TBD (Standard / High — see CV-SOP-001 §5 for risk classification) |

---

## 2. Verification Checklist

Complete each row. Mark Pass, Fail, or NA with a brief evidence note.

| Check ID | Check Description | Pass / Fail / NA | Evidence / Notes |
|---|---|---|---|
| V-01 | Source URL is accessible and the dataset is available at the confirmed location | | |
| V-02 | Dataset is from the confirmed official source owner (not a third-party mirror or aggregator) | | |
| V-03 | Reporting period matches the period recorded in CV-REG-001 | | |
| V-04 | Fetched data matches the expected schema (fields, types, key identifiers) | | |
| V-05 | Record count is within expected range — no unexpected drop or spike in volume | | |
| V-06 | Sample spot-check: 5+ records checked against the source for accuracy | | |
| V-07 | No duplicate records present in the fetched dataset | | |
| V-08 | No obviously invalid values present (e.g., future dates, negative counts, empty required fields) | | |
| V-09 | Licence status confirmed as Approved or Public Registry in CV-REG-001 | | |
| V-10 | Attribution wording in CV-REG-001 is current for this dataset version | | |
| V-11 | If transformation was performed: transformation is documented in Section 3 | | |
| V-12 | If high-risk dataset: second reviewer has been assigned and completed their review | | |
| V-13 | Verification status field in CV-REG-001 has been updated to reflect this check | | |

---

## 3. Transformation Record

Complete this section only if a transformation was applied to the raw source data
before it was written to Firestore or displayed in the app.

| Field | Value |
|---|---|
| **Transformation performed?** | Yes / No |
| **Transformation description** | TBD (e.g., "Aggregated vote records by session; calculated percentage totals") |
| **Transformation script or method** | TBD (e.g., script path, manual calculation, formula) |
| **Input record count** | TBD |
| **Output record count** | TBD |
| **Spot-check: transformed output verified against raw source?** | Yes / No / NA |
| **Transformation note for public display** | TBD (wording to display in app, if applicable) |

---

## 4. Reviewer Sign-Off

| Role | Name | Date | Decision |
|---|---|---|---|
| **Primary Reviewer** | TBD | TBD | Pass / Fail |
| **Second Reviewer** (required for high-risk datasets; optional for standard) | TBD | TBD | Pass / Fail / NA |

---

## 5. Final Decision

| Field | Value |
|---|---|
| **Final verification decision** | TBD — Pass / Fail / Conditional Pass |
| **If Conditional Pass: conditions** | TBD |
| **If Fail: action taken** | TBD (e.g., data not written to Firestore; flagged in CV-REC-003; correction initiated) |
| **Data written to Firestore?** | Yes / No |
| **Date written** | TBD |
| **Firestore collection / document path** | TBD |
| **CV-REG-001 entry updated?** | Yes / No |
| **Manual review flag opened?** | Yes / No — if Yes, CV-REC-003 Flag ID: TBD |

---

## Change Log

| Version | Date | Author | Change |
|---|---|---|---|
| 0.1 | 2026-08-02 | Founder / Data Lead | Initial template — Canadian launch scope |
