# CV-REC-001 — Data Verification Record: CV-DATA-AB-003 Alberta Grants

| Field | Value |
|---|---|
| **Record ID** | CV-REC-001-2026-08-24-CV-DATA-AB-003 |
| **Status** | Verified — Written to Firestore |
| **Owner** | Founder / Data Lead |
| **Related SOP** | CV-SOP-001 Data Verification SOP |
| **Related Policy** | CV-POL-002 Data Sources and Attribution Policy |
| **Date Created** | 2026-08-24 |
| **Prepared By** | Automated dry-run + founder/reviewer decision |
| **Approval / Closure Status** | Approved |

---

## 1. Dataset Identification

| Field | Value |
|---|---|
| **Dataset name** | Alberta Grant Payments Disclosure |
| **Dataset ID** | CV-DATA-AB-003 |
| **Jurisdiction** | Alberta (CA-AB) |
| **Source URL** | https://open.alberta.ca/publications/grant-disclosure |
| **Resource URL** | https://open.alberta.ca/dataset/faef5592-9ea0-4b60-92db-79a8a9673fe5/resource/1e95ba75-b4b1-44df-9426-988d60b6cff7/download/tbf-grants-disclosure-2025-26.csv |
| **CKAN package** | `grant-disclosure` |
| **Source owner / publisher** | Government of Alberta |
| **Licence name** | Open Government Licence — Alberta |
| **Licence status** | Approved |
| **Reporting period** | AB Grant payments disclosure — 2025 - 2026 (current fiscal year) |
| **Fetched date** | 2026-08-24 |
| **Firestore target** | `subnational_grants/CA-AB` |
| **Write mode** | merge |
| **Verification trigger** | Canada expansion — Wave 1, Province 2 (CA-AB), third dataset |
| **Risk level** | Standard (after reviewer-approved aggregation transformation) |
| **Public modal label** | Grants |

---

## 2. Verification Checklist

| Check ID | Check Description | Result | Evidence / Notes |
|---|---|---|---|
| V-01 | Source URL is accessible | Pass | Alberta Open Government CKAN `package_show` and CSV resource both returned 200 |
| V-02 | Data is from official source | Pass | open.alberta.ca — Government of Alberta official open data portal |
| V-03 | Reporting period confirmed | Pass | "2025 - 2026" — current live fiscal-year extract (`DisplayFiscalYear` column) |
| V-04 | Schema matches expected | Pass | Columns: Ministry, BUName, Recipient, Program, Amount, Lottery, PaymentDate, FiscalYear, DisplayFiscalYear |
| V-05 | Record count within expected range | Pass | 180,468 total rows; 180,048 after excluding 420 rows with no named recipient; 67,607 distinct recipient+program groups; top 100 by aggregated total written |
| V-06 | Spot-check sample records | Pass | Real, identifiable institutional recipients: Alberta Health Services, Acute Care Alberta, Alberta Blue Cross, Recovery Alberta, University of Alberta, University of Calgary, Agriculture Financial Services Corporation, Canadian Blood Services, City of Calgary, City of Edmonton |
| V-07 | No duplicate records after aggregation | Pass | Each written record is a unique recipient+program combination; installment counts confirm multiple real payments were summed, not duplicated |
| V-08 | No blank-recipient rows in written data | Pass | 420 rows with no named recipient excluded — these are Alberta's own privacy-protected program-level totals for individual assistance/benefit programs (AISH, income support, seniors benefits), not identifiable payees |
| V-09 | Aggregation preserves real values | Pass | Aggregated totals are exact sums of real installment amounts; no values invented. E.g. Alberta Health Services / AHS Acute Care OP: $6.32B across 74 installments (Apr–Dec 2025) |
| V-10 | Licence confirmed | Pass | Open Government Licence — Alberta — redistribution and display permitted with attribution |
| V-11 | Attribution wording current | Pass | "Government of Alberta — Grant payments disclosure." |
| V-12 | Public label accuracy | Pass | "Grants" is accurate — the CKAN package title and notes confirm this is a genuine, narrowly-scoped grants disclosure (not a broader all-supplier-payments schedule), so the label was not forced |

---

## 3. Reviewer Decision — Aggregation by Recipient + Program

**Decision date:** 2026-08-24
**Decision:** Aggregate repeated payment installments by recipient + program before publication.

**Rationale:** Alberta discloses each individual payment installment as its own CSV row. Large recurring grants (e.g. a health authority's operating funding, paid out dozens of times across the fiscal year) previously appeared as many near-identical rows dominating a naive "top 100 by amount" list — 91–93 of the top 100 raw rows shared an identical recipient+program+amount with another row already in the list in earlier dry-runs. Aggregating by recipient + program surfaces a genuinely diverse top-100 list without deleting or altering any underlying payment.

**Transformation rule:**
- Group by recipient name + program name
- Sum real payment amounts across all installments in the group
- Preserve installment/payment count (`installmentCount` field) and date range
- No blank-recipient rows included
- No values invented — every aggregated total is an exact sum of real source amounts

**Transformation note (written verbatim to Firestore as `transformation_note`):**
> "Multiple payment installments to the same recipient/program were aggregated for public display."

**Implementation:** `engine/lib/subnational-transparency-ca-ab.cjs` `buildGrants()` — groups filtered rows by a `recipientName␟program` key, sums `Amount`, counts installments, tracks min/max `PaymentDate`, sorts aggregated groups by total descending, stores the top 100.

---

## 4. Transformation Notes

- Source discovered dynamically via Alberta Open Government CKAN `package_search`
- Column mapping: `Recipient` → `recipientName`; `Program` → `purpose`; `Ministry` → `dept`; `Amount` → summed into `rawAmount`; `PaymentDate` → min/max used to build a date-range label
- Blank-recipient rows excluded (420 of 180,468) — privacy-protected program-level totals, not identifiable payees
- Remaining 180,048 rows grouped into 67,607 distinct recipient+program combinations
- Aggregated groups sorted by total amount descending; top 100 selected for storage
- No dollar values altered for underlying payments — only summed within a group

---

## 5. Firestore Write Fields

Fields written to `subnational_grants/CA-AB` (merge):

- `records` — array of 100 aggregated grant records (recipientName, purpose, dept, fmtAmount, rawAmount, installmentCount, date [payment count + date range])
- `fiscal_year`, `reporting_period` — AB fiscal-year period description
- `data_source`, `source_url`, `resource_url`, `discovery_note`, `licence` — source and attribution metadata
- `note` — transformation summary (top 100 by aggregated total, blank-recipient rows excluded)
- `transformation_note` — reviewer-required exact wording (Section 3)
- `filter_note` — blank-recipient exclusion detail and count
- `total_rows_in_source`, `blank_recipient_rows_excluded`, `raw_row_count`, `aggregated_group_count` — filter/aggregation audit fields
- `records_stored`, `total_raw_top100`, `fmt_total_top100` — write summary fields
- `detected_columns`, `all_headers`, `raw_first_rows` — column-mapping audit fields
- `modal_label` — `"Grants"`
- `fetched_at`, `fetched_at_write` — ISO timestamps
- `verification_status` — `"CV-REC-001-2026-08-24-CV-DATA-AB-003"`
- `licence_note` — Open Government Licence — Alberta attribution
- `cv_data_id` — `"CV-DATA-AB-003"`

---

## 6. Final Decision

| Field | Value |
|---|---|
| **Decision** | APPROVED — written to Firestore |
| **Reason** | Official Alberta government open-data source, licence confirmed, reviewer-approved aggregation transformation applied and defensively re-verified before write (every record has a recipient name and a valid installment count). Top 100 records are real, identifiable, aggregated institutional recipients. |
| **Conditions** | None |
| **UI renders without code changes** | Yes — existing shared "Transfer Payments" modal (same component used for all provinces) renders this jurisdiction's data |
| **Safe to write** | Yes |
| **Write confirmed** | 2026-08-24 — `engine/canada-ab-write-grants.cjs`, 100 records written, merge mode, aggregated from 180,048 raw rows / 67,607 distinct recipient+program groups |
