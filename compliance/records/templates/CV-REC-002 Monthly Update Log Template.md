# CV-REC-002 — Monthly Update Log Template

| Field | Value |
|---|---|
| **Record ID** | CV-REC-002-[YYYY-MM] |
| **Template Version** | 0.1 |
| **Status** | Draft template — not yet completed |
| **Owner** | Founder / Data Lead |
| **Related SOP** | CV-SOP-002 Monthly Data Update SOP |
| **Related Policy** | CV-POL-002 Data Sources and Attribution Policy |
| **Related Register** | CV-REG-001 Data Source Register |
| **Retention Period** | Minimum 3 years from date of record creation |
| **Date Created** | TBD |
| **Prepared By** | TBD |
| **Reviewed By** | TBD |
| **Approval / Closure Status** | Open |

---

> This is a blank template. Complete one record per monthly data update cycle.
> Retain completed records in `compliance/records/` according to CV-SOP-002 §9.
> Each completed log should be named CV-REC-002-YYYY-MM.md.

---

## 1. Update Cycle Overview

| Field | Value |
|---|---|
| **Update cycle month** | TBD (e.g., 2026-08) |
| **Update scope** | TBD (e.g., All active Canadian federal and provincial sources · Subset: [list]) |
| **Update start date** | TBD |
| **Update completion date** | TBD |
| **Engine / script used** | TBD (e.g., script path or process name) |
| **Environment** | TBD (e.g., Production · Staging) |

---

## 2. Source Summary

| Field | Value |
|---|---|
| **Total active sources checked** | TBD |
| **Sources successfully fetched** | TBD |
| **Sources with fetch failures** | TBD — list affected Source IDs below |
| **Sources blocked / skipped** | TBD — list affected Source IDs below |
| **New sources added this cycle** | TBD |
| **Sources removed or retired this cycle** | TBD |

### 2.1 Failed Sources

List each source that failed to fetch this cycle.

| Source ID | Source Name | Failure Reason | Action Taken | Resolved? |
|---|---|---|---|---|
| TBD | TBD | TBD | TBD | TBD |

### 2.2 Blocked / Skipped Sources

List each source that was intentionally skipped or blocked this cycle.

| Source ID | Source Name | Reason Skipped | Expected Resolution |
|---|---|---|---|
| TBD | TBD | TBD | TBD |

---

## 3. Records Written to Firestore

| Source ID | Source Name | Jurisdiction | Records Fetched | Records Written | Write Method | Notes |
|---|---|---|---|---|---|---|
| TBD | TBD | TBD | TBD | TBD | TBD | |

**Total records fetched this cycle:** TBD

**Total records written to Firestore this cycle:** TBD

---

## 4. Manual Review Flags

| Field | Value |
|---|---|
| **Manual review flags opened this cycle** | TBD |
| **Manual review flags resolved this cycle** | TBD |
| **Manual review flags still open at cycle close** | TBD |

### 4.1 Flags Opened This Cycle

| CV-REC-003 Flag ID | Jurisdiction | Data Item | Reason | Status at Cycle Close |
|---|---|---|---|---|
| TBD | TBD | TBD | TBD | TBD |

### 4.2 Flags Resolved This Cycle

| CV-REC-003 Flag ID | Resolution Summary | Date Closed |
|---|---|---|
| TBD | TBD | TBD |

---

## 5. Firestore Write Controls

| Check | Pass / Fail / NA | Notes |
|---|---|---|
| Firestore write performed in restricted write mode (not public write) | | |
| Write confirmed against expected Firestore collection paths | | |
| No accidental overwrite of existing verified data without version check | | |
| Firestore security rules confirmed unchanged before write | | |

---

## 6. Post-Write Verification Checks

| Check | Pass / Fail / NA | Notes |
|---|---|---|
| Sample records spot-checked in Firestore after write | | |
| Record counts in Firestore match expected counts | | |
| No duplicate documents created | | |
| Data display in app reflects updated data (staging or production spot-check) | | |

---

## 7. Public UI Checks

| Check | Pass / Fail / NA | Notes |
|---|---|---|
| Freshness / last-updated dates on affected data pages updated correctly | | |
| Source attribution labels still accurate for updated data | | |
| No broken data display or missing fields visible in public UI after update | | |
| Status labels updated where applicable ("Official data not loaded yet" removed for newly loaded sources) | | |

---

## 8. Deviations This Cycle

List any deviations from CV-SOP-002 that occurred during this update cycle.
If none, write "None."

| Deviation | Impact | Action Taken | CV-REC-005 Record ID |
|---|---|---|---|
| TBD | TBD | TBD | TBD |

---

## 9. Approval

| Role | Name | Date | Sign-Off |
|---|---|---|---|
| Data Lead | TBD | TBD | |
| Founder | TBD | TBD | |

**Cycle closure status:** Open / Closed

---

## Change Log

| Version | Date | Author | Change |
|---|---|---|---|
| 0.1 | 2026-08-02 | Founder / Data Lead | Initial template — Canadian launch scope |
