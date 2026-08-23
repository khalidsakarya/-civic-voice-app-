# CV-REC-001 — Data Verification Record: CV-DATA-BC-003 British Columbia Public Payments

| Field | Value |
|---|---|
| **Record ID** | CV-REC-001-2026-08-23-CV-DATA-BC-003 |
| **Status** | Verified — Written to Firestore |
| **Owner** | Founder / Data Lead |
| **Related SOP** | CV-SOP-001 Data Verification SOP |
| **Related Policy** | CV-POL-002 Data Sources and Attribution Policy |
| **Date Created** | 2026-08-23 |
| **Prepared By** | Automated dry-run + founder/reviewer decision |
| **Approval / Closure Status** | Approved |

---

## 1. Dataset Identification

| Field | Value |
|---|---|
| **Dataset name** | BC CRF Detailed Schedules of Payments — Other Supplier Payments |
| **Dataset ID** | CV-DATA-BC-003 |
| **Jurisdiction** | British Columbia (CA-BC) |
| **Source URL** | https://catalogue.data.gov.bc.ca/dataset/crf-detailed-schedules-of-payments-other-supplier-payments |
| **Resource URL** | https://catalogue.data.gov.bc.ca/dataset/f6bad1d5-d1dc-4fdd-a076-650f55cc3fbc/resource/5345a4b9-a68c-4f80-b6f6-a6d01fe4db27/download/fye26-other-suppliers.csv |
| **Source owner / publisher** | Government of British Columbia |
| **Licence name** | Open Government Licence — British Columbia |
| **Licence status** | Approved |
| **Reporting period** | BC CRF Detailed Schedules of Payments - Other Supplier Payments — FYE 2026 - Suppliers to BC Government |
| **Fetched date** | 2026-08-23 |
| **Firestore target** | `subnational_grants/CA-BC` |
| **Write mode** | merge |
| **Verification trigger** | Canada expansion — Wave 1, Province 1 (CA-BC), third dataset |
| **Risk level** | Standard (after reviewer-approved accounting-aggregate exclusion) |
| **Public modal label** | Public Payments |

---

## 2. Verification Checklist

| Check ID | Check Description | Result | Evidence / Notes |
|---|---|---|---|
| V-01 | Source URL is accessible | Pass | BC Data Catalogue CKAN `package_show` and CSV resource both returned 200 |
| V-02 | Data is from official source | Pass | catalogue.data.gov.bc.ca — Government of British Columbia official open data portal |
| V-03 | Reporting period confirmed | Pass | "FYE 2026 - Suppliers to BC Government" — current live fiscal-year extract |
| V-04 | Schema matches expected | Pass | Columns: recipient name (`Other Suppliers`), amount (unnamed second column) — BC Public Accounts format, same pattern confirmed for CA-ON |
| V-05 | Record count within expected range | Pass | 4,893 rows before aggregate-category filter; 4,891 after; 100 written (top by amount) |
| V-06 | Spot-check sample records | Pass | Real, identifiable payees: DRAGADOS CANADA / SKYLINK TRANSIT LIMITED PARTNERSHIP, BRITISH COLUMBIA HOUSING MANAGEMENT COMMISSION, BRITISH COLUMBIA FERRY SERVICES INC., BROADWAY SUBWAY PROJECT CORPORATION |
| V-07 | No duplicate records | Pass | Recipients are distinct entities in the top-100-by-amount selection |
| V-08 | No accounting-aggregate rows in written data | Pass | **Reviewer-approved exclusion applied.** `PUBLIC DEBT SERVICING COSTS` and `MISCELLANEOUS` excluded (2 rows, confirmed present in this fetch); `REVENUE REFUNDS` in the exclusion set but not present in this particular live fetch. Defensive guard in the write script re-checks the built payload and refuses to write if any excluded name is present in the final records. |
| V-09 | Licence confirmed | Pass | Open Government Licence — British Columbia — redistribution and display permitted with attribution |
| V-10 | Attribution wording current | Pass | "Government of British Columbia — CRF Detailed Schedules of Payments - Other Supplier Payments." |
| V-11 | Public label accuracy | Pass | "Public Payments" is accurate — this is a broad "all government payments to suppliers ≥ $25,000" schedule, not a grants program or intergovernmental transfer-payment schedule. "Grants" or "Transfer Payments" would misrepresent scope. |

---

## 3. Reviewer Decision — Accounting-Aggregate Exclusion

**Decision date:** 2026-08-23
**Decision:** Exclude accounting/public-finance aggregate rows before publication.

**Excluded (exact match, case-insensitive):**
- `PUBLIC DEBT SERVICING COSTS`
- `REVENUE REFUNDS`
- `MISCELLANEOUS`

**Rationale:** These are budget-line / accounting-category aggregate rows, not ordinary recipient or payee records. Because the dataset is sorted and displayed by payment amount, these large aggregate rows previously appeared at or near the top of the list (e.g. `PUBLIC DEBT SERVICING COSTS` at ~$3.4–5.0B across different fetches), which would mislead users into believing a single "payee" received the province's entire debt-servicing budget. Excluding them surfaces the real top recipients (construction/infrastructure contractors, named government authorities, commissions, and companies) without altering or fabricating any figures for the remaining rows.

**Implementation:** `isBcAccountingAggregatePayee(name)` in `engine/lib/subnational-transparency-ca-bc.cjs` — exact-match (case-insensitive, trimmed) against a maintained set, applied before sorting/display in `buildGrants()`. Chosen over substring/regex matching to avoid excluding real vendors whose names might incidentally contain a matched word (e.g. a company named "... Revenue Services Ltd").

---

## 4. Transformation Notes

- Source discovered dynamically via BC Data Catalogue CKAN `package_search` (same discovery pattern used across all BC datasets)
- Column mapping: `Other Suppliers` (first column) → `recipientName`; unnamed second column → `rawAmount`
- Metadata rows embedded in the BC CSV (e.g. `"for the Fiscal Year Ended..."`, `"(Details of payees receiving $25,000 or more)"`) filtered out before aggregate-exclusion and sorting
- Accounting-aggregate rows excluded per reviewer decision (Section 3)
- Remaining rows sorted by amount descending; top 100 selected for storage
- No dollar values altered — amounts for retained rows are unmodified source values

---

## 5. Firestore Write Fields

Fields written to `subnational_grants/CA-BC` (merge):

- `records` — array of 100 transformed payment records (recipientName, typeLabel, purpose, dept, fmtAmount, rawAmount, date)
- `fiscal_year`, `reporting_period` — BC fiscal-year period description
- `data_source`, `source_url`, `resource_url`, `discovery_note`, `licence` — source and attribution metadata
- `note` — transformation note (top 100 by amount, aggregate-category rows excluded)
- `filter_note` — reviewer-decision note documenting the accounting-aggregate exclusion (Section 3) and count/list of rows excluded from this specific fetch
- `total_before_aggregate_filter`, `aggregate_rows_excluded_count`, `aggregate_rows_excluded`, `total_after_filter` — filter audit fields
- `records_stored`, `total_raw_top100`, `fmt_total_top100` — write summary fields
- `detected_columns`, `all_headers`, `raw_first_rows` — column-mapping audit fields for reviewer confirmation
- `modal_label` — `"Public Payments"`
- `fetched_at`, `fetched_at_write` — ISO timestamps
- `verification_status` — `"CV-REC-001-2026-08-23-CV-DATA-BC-003"`
- `licence_note` — Open Government Licence — British Columbia attribution
- `cv_data_id` — `"CV-DATA-BC-003"`

---

## 6. Final Decision

| Field | Value |
|---|---|
| **Decision** | APPROVED — written to Firestore |
| **Reason** | Official BC government open-data source, licence confirmed, reviewer-approved accounting-aggregate exclusion applied and defensively re-verified before write. Top 100 records are real, identifiable payees. |
| **Conditions** | Exclusion set (`PUBLIC DEBT SERVICING COSTS`, `REVENUE REFUNDS`, `MISCELLANEOUS`) must be re-reviewed if future fetches surface new aggregate-style bucket names at the top of the amount-sorted list. |
| **UI renders without code changes** | Yes — existing shared "Transfer Payments" modal (same component used for all provinces) renders this jurisdiction's data; underlying dataset content/metadata correctly reflects "Public Payments" scope. |
| **Safe to write** | Yes |
| **Write confirmed** | 2026-08-23 — `engine/canada-bc-write-grants.cjs`, 100 records written, merge mode, 2 aggregate rows excluded from this fetch |
