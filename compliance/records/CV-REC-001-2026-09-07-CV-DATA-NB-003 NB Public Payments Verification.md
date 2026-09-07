# CV-REC-001 — Data Verification Record: CV-DATA-NB-003 New Brunswick Public Payments (Combined Supplier and Grant Payments)

| Field | Value |
|---|---|
| **Record ID** | CV-REC-001-2026-09-07-CV-DATA-NB-003 |
| **Status** | Verified — Written to Firestore |
| **Owner** | Founder / Data Lead |
| **Related SOP** | CV-SOP-001 Data Verification SOP |
| **Related Policy** | CV-POL-002 Data Sources and Attribution Policy |
| **Date Created** | 2026-09-07 |
| **Prepared By** | Automated dry-run + founder/reviewer decision |
| **Approval / Closure Status** | Approved |

---

## 1. Dataset Identification

| Field | Value |
|---|---|
| **Dataset name** | Combined Supplier and Grant Payments / Paiements aux fournisseurs et subventions combinés |
| **Dataset ID** | CV-DATA-NB-003 |
| **Public label used in app** | Public Payments (not "Grants" — see Section 5) |
| **Jurisdiction** | New Brunswick (CA-NB) |
| **Source URL** | https://gnb.socrata.com/d/edw7-9596 |
| **Platform** | Socrata (SODA API) — `gnb.socrata.com` |
| **Resource ID** | `edw7-9596` |
| **Source owner / publisher** | Government of New Brunswick |
| **Licence name** | Government of New Brunswick Open Data Licence |
| **Licence status** | Approved |
| **Reporting period / fiscal year** | 2025 (auto-selected as most recently updated dataset via `updatedAt` sort — no year hardcoded) |
| **Fetched date** | 2026-09-07 |
| **Firestore target** | `subnational_grants/CA-NB` |
| **Write mode** | merge |
| **Verification trigger** | Canada expansion — Wave 2, Province 4 (CA-NB) |
| **Risk level** | Standard |

---

## 2. Verification Checklist

| Check ID | Check Description | Result | Evidence / Notes |
|---|---|---|---|
| V-01 | Source URL is accessible | Pass | Socrata catalog search + SODA CSV export (`?$limit=50000`) returned 200 |
| V-02 | Data is from official source | Pass | gnb.socrata.com — Government of New Brunswick's official open data portal |
| V-03 | Reporting period confirmed | Pass | Dataset title "2025 - Combined Supplier and Grant Payments"; `discoverNbPaymentsSource()` auto-selects most recently updated matching resource, so future fiscal years are picked up without code changes |
| V-04 | Schema matches expected | Pass | Columns: `Supplier Name / Nom du fournisseur`, `Payment / Paiement`, `Payment Type / Type de paiement`. Required columns detected and mapped |
| V-05 | Record count within expected range | Pass | 6,012 total rows in source; 100 transformed/stored (top 100 by payment amount, descending) |
| V-06 | Spot-check sample records | Pass | Horizon Health Network ($1.74B), Réseau de santé Vitalité ($1.13B), Medavie Inc ($431.70M), Receiver General for Canada ($373.04M), University of New Brunswick ($154.21M), NB Power Corporation ($140.75M) — all real, identifiable New Brunswick public institutions/recipients |
| V-07 | No duplicate records | Pass | Blank-supplier rows excluded before dedupe/sort; each row keyed by unique supplier+payment combination in source |
| V-08 | No invalid/fabricated values | Pass | All amounts sourced directly from `Payment / Paiement` column; no estimation, no generation, no PDF extraction, no scraping |
| V-09 | Licence confirmed | Pass | Government of New Brunswick Open Data Licence — redistribution and display permitted with attribution |
| V-10 | Label accuracy confirmed | Pass | Full-dataset payment-type breakdown query (`$select=Payment_Type,count(*)&$group=Payment_Type`) returned: "Payments & Grants" = 5,901 rows, "Purchase Cards" = 111 rows (6,012 total) — dataset is broader than grants alone, confirming "Public Payments" as the accurate label |

---

## 3. Transformation Notes

- Source: full CSV export via SODA API (`${sodaCsvUrl}?$limit=50000`) from Socrata resource `edw7-9596` on `gnb.socrata.com`
- Discovery: `discoverNbPaymentsSource()` searches the Socrata catalog for `"Combined Supplier and Grant Payments"`, filters matches with a "contains" regex (not anchored to string start, since actual resource names are prefixed with the fiscal year, e.g. `"2025 - Combined Supplier and Grant Payments / Paiements aux fournisseurs et subventions combinés"`), and sorts by `updatedAt` descending to auto-select the most recent fiscal year
- Filter: blank/empty `Supplier Name` rows excluded
- Sort: descending by `Payment / Paiement` amount; top 100 records stored
- Column mapping: `Supplier Name / Nom du fournisseur` → `recipientName`; `Payment / Paiement` → `rawAmount`/`fmtAmount`; `Payment Type / Type de paiement` → `typeLabel`/`purpose`; `dept` hardcoded to `"Government of New Brunswick"` (dataset is whole-of-government, not broken out by department); `date` set to fiscal year (`2025`)
- No PDF extraction, no scraping, no estimated/generated values — full CSV fetched directly from the official Socrata SODA endpoint

---

## 4. Firestore Write Fields

Fields written to `subnational_grants/CA-NB` (merge):

- `records` — array of 100 transformed payment records (recipientName, typeLabel, typeColor, purpose, dept, fmtAmount, rawAmount, date)
- `jurisdiction_id`, `fiscal_year`, `reporting_period`, `data_source`, `source_url`, `resource_url`, `discovery_note`, `licence`, `note`
- `total_rows_in_source` (6,012), `blank_recipient_rows_excluded`, `total_after_filter`, `records_stored` (100)
- `total_raw_top100`, `fmt_total_top100`, `payment_type_breakdown_in_top`
- `detected_columns`, `all_headers`, `raw_first_rows`, `warnings`
- `verification_status` — `"CV-REC-001-2026-09-07-CV-DATA-NB-003"`
- `licence_note` — Government of New Brunswick Open Data Licence attribution
- `cv_data_id` — `"CV-DATA-NB-003"`
- `modal_label` — `"Public Payments"`
- `fetched_at_write` — ISO timestamp of write

---

## 5. Label Determination — "Public Payments" vs. "Grants"

The task explicitly required determining an accurate label rather than defaulting to "Grants." A full-dataset payment-type breakdown query confirmed the "Combined Supplier and Grant Payments" dataset spans:

- **Payments & Grants**: 5,901 rows (general supplier payments AND grants/contributions combined into one category by the source)
- **Purchase Cards**: 111 rows (government purchase-card spending)

Because the dataset includes ordinary supplier payments and purchase-card spending in addition to grants/contributions, labelling it "Grants" would materially misrepresent scope to users. **"Public Payments"** was selected as the accurate public label — consistent with the same reasoning previously applied to British Columbia's broader supplier-payments dataset. The `modal_label` field (`"Public Payments"`) is written into the Firestore document itself so the label travels with the data.

---

## 6. Related Dataset — CV-DATA-NB-002 (CRA Charities)

Written separately, same task, see `CV-REC-001-2026-09-07-CV-DATA-NB-002 NB CRA Charities Verification.md`.

Not written this task: CV-DATA-NB-001 (Unemployment) — automated StatsCan Node fetch pipeline is still blocked by a transient `ECONNRESET`. The New Brunswick LFS coordinate (`5.7.1.1.1.1.0.0.0.0`) was independently confirmed correct via direct `curl` against the Statistics Canada API. Will be written once the automated fetch pipeline succeeds cleanly.

---

## 7. Final Decision

| Field | Value |
|---|---|
| **Decision** | APPROVED — written to Firestore |
| **Reason** | Official Government of New Brunswick source, licence confirmed, correct schema, 6,012 NB payment rows verified in source, 100 written (top 100 by amount). Label accuracy verified via full-dataset payment-type breakdown — "Public Payments" is accurate; "Grants" would misrepresent scope. No fabricated/estimated/scraped/PDF-extracted data. |
| **Conditions** | None |
| **UI renders without code changes** | Yes — reuses the existing grants modal rendering path; per-dataset `dataSource`/`sourceUrl` metadata fix (from an earlier session) ensures the modal shows this dataset's own correct source text |
| **Safe to write** | Yes |
| **Write confirmed** | 2026-09-07 — `engine/canada-nb-write-grants.cjs`, 100 records written, merge mode |
