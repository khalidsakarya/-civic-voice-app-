# Ontario Grants Source Investigation — Dry-Run Report

**Date:** 2026-08-15  
**Investigator:** Claude (data lead support)  
**Status:** Research only — no Firestore write, no UI change

---

## 1. Old Source — Found or Not Found

**Result: Never existed as a separate dataset. The current source is the original source.**

Git history shows `engine/lib/subnational-transparency-ca-on.cjs` has always used:

- **Package:** `public-accounts-detailed-schedule-of-payments`  
- **Package ID:** `56c9a95f-c7b6-40ee-a4b8-d2343e51c83d`  
- **URL:** `https://data.ontario.ca/dataset/public-accounts-detailed-schedule-of-payments`

There was no earlier dedicated "transfer payments only" dataset in this repo. The deferral decision was correct — the current source was always broad, and the original `buildGrants()` did not filter it adequately.

---

## 2. Alternative Datasets Searched

Searched `data.ontario.ca` CKAN for transfer payment / grants datasets. Found ~14 results with "transfer payment" in the name. All were either:

- **Stale / no resources** (last updated 2021, no downloadable files): `transfer-payment-data-set`, `transfer-payment-contracting-data`, `transfer-payment-organization-reporting`, `transfer-payment-programs-tracking-tool`
- **Scope-limited** (one ministry/program, not province-wide): `transfer-payment-agency-building-conditions`, `board-transfer-payment-reporting-data`, etc.

**Finding: No alternative dedicated province-wide transfer payments dataset exists on data.ontario.ca.** The Public Accounts Detailed Schedule of Payments is the only comprehensive official source.

---

## 3. Current Dataset — Official Source

| Field | Value |
|---|---|
| **Dataset name** | Public Accounts: Detailed Schedule of Payments |
| **Package ID** | `56c9a95f-c7b6-40ee-a4b8-d2343e51c83d` |
| **Resource ID (2024-25 English)** | `1677dc37-00e5-437a-bb39-c918b243f9a9` |
| **Resource ID (2024-25 French)** | `bf452ec7-678e-4783-a7e1-9f36f0e05440` |
| **URL** | `https://data.ontario.ca/dataset/public-accounts-detailed-schedule-of-payments` |
| **Last updated** | 2025-11-14 |
| **Fiscal year available** | 2024-25 (most recent) |
| **Licence** | Ontario.ca Terms of Use (not OGL-Ontario) |

---

## 4. Available Columns

| Column | Description |
|---|---|
| `Amount $` | Payment amount in dollars (integer, no formatting) |
| `Ministry` | Ontario ministry that made the payment |
| `Category` | High-level payment category (see Section 5) |
| `Payment Detail` | Sub-category or program name (often "No Value") |
| `Recipient` | Organization or individual name |
| `Statutory` | Whether payment is statutory (Y/N/blank) |
| `Additional Detail` | Supplementary notes (mostly blank) |

---

## 5. Category Column Values — Full Enumeration (2024-25)

| Category | Row Count | Notes |
|---|---|---|
| **Transfer Payments** | **8,413** | Government transfers to organizations, agencies, individuals |
| Other Payments | 5,080 | Vendor/contract/miscellaneous — **exclude** |
| Travel Expenses | 1,295 | MPP/minister travel — **exclude** |
| Statutory Payments | 420 | Minister/MPP salaries — **exclude** |
| Advances Under Education Act | 40 | Education financing — borderline; likely exclude |
| Salaries And Wages | 79 | Government employees — **exclude** |
| Employee Benefits | 39 | Government employee benefits — **exclude** |
| Treasury Program | 7 | Debt management — **exclude** |
| Other Salaries And Wages | 1 | — **exclude** |
| **Total rows** | **15,571** | |

**Key finding:** The `Category` column cleanly separates Transfer Payments from all non-grant categories. A simple `Category == "Transfer Payments"` filter produces 8,413 rows — all government outbound transfer payments.

The current engine's `Payment Detail` filter only captures 165 rows (the three values: "Government Transfer", "Operating Transfer Payments", "Capital Transfer Payments"). This is because 5,058 of the 8,413 Transfer Payment rows have `Payment Detail = "No Value"` — those rows were being silently excluded.

---

## 6. Filter Options Compared

### Option A (current engine) — Filter on Payment Detail
```
Payment Detail IN ('Government Transfer', 'Operating Transfer Payments', 'Capital Transfer Payments')
```
- **Result:** 165 rows out of 8,413 Transfer Payment rows (~2%)
- **Problem:** Excludes 5,058 "No Value" rows that are valid transfer payments (e.g. school board transfers, Metrolinx, IESO)

### Option B (proposed) — Filter on Category
```
Category = "Transfer Payments"
```
- **Result:** 8,413 rows
- **All excluded categories:** Other Payments, Travel Expenses, Statutory Payments, Advances Under Education Act, Salaries And Wages, Employee Benefits, Treasury Program
- **Interest on debt:** Confirmed excluded — "Interest On Debt For Provincial Purposes" rows have Category = "Other Payments"
- **Ontario Securities / bonds:** Confirmed excluded — fall under Treasury Program or Other Payments
- **Employee benefits:** Confirmed excluded — have their own Category
- **Vendor/contract payments:** Confirmed excluded — fall under "Other Payments"
- **Salaries:** Confirmed excluded — have their own Category

---

## 7. Exclusion Verification

Tested each concern from the deferral decision:

| Concern | Excluded by Category filter? | Notes |
|---|---|---|
| Interest on debt | **Yes** | "Interest On Debt For Provincial Purposes" → Other Payments |
| Ontario Securities | **Yes** | Falls under Treasury Program or Other Payments |
| Employee benefits | **Yes** | Has own Category = "Employee Benefits" |
| MPP travel | **Yes** | Category = "Travel Expenses" |
| Minister salaries | **Yes** | Category = "Statutory Payments" |
| Vendor/contract payments | **Yes** | Category = "Other Payments" |
| Internal accounting | **Yes** | Category = "Other Payments" |

---

## 8. Remaining Edge Cases to Consider

Three rows in the top 20 by amount warrant product review before display:

| Recipient | Amount | Issue |
|---|---|---|
| `Payments Made For Services And Care Provided By Physicians And Practitioners` | $18.1B | OHIP-style payments to physicians — these ARE government transfer payments but may be confusing under "Grants" label |
| `Independent Electricity System Operator (IESO)` | $6.75B | Electricity subsidy transfer — legitimate government transfer but unusual for "Grants" |
| `Rbc-Ontaxrebat` / `Cibc-Ontaxrebat` | $1.7B + $1.1B | Ontario tax rebates distributed via banks — government transfer payments to citizens, not grants to organizations |

These are **not** debt, vendor, or accounting rows — they are legitimate government transfer payments under Ontario Public Accounts classification. The question is whether the Grants Given modal framing is appropriate for health fee-for-service and tax rebate payments.

---

## 9. Record Counts

| Filter | Row Count | Total Amount |
|---|---|---|
| All rows in dataset | 15,571 | n/a |
| Category = "Transfer Payments" | **8,413** | **~$174B** |
| Current engine (Payment Detail filter) | 165 | ~$20.8B (top 100 of 165) |
| After top-100 slice | 100 | ~$20.8B |

---

## 10. Top 20 Records After Category Filter (sorted by amount)

| # | Ministry | Recipient | Payment Detail | Amount |
|---|---|---|---|---|
| 1 | Ministry Of Health | Payments Made For Services And Care... (Physicians) | Payments Made For Services And Care Provided... | $18.1B |
| 2 | Ministry Of Health | ODB (Ontario Drug Benefit) | Ontario Drug Programs | $9.6B |
| 3 | Ministry Of Transportation | Metrolinx | No Value | $8.7B |
| 4 | Ministry Of Energy | Independent Electricity System Operator | No Value | $6.75B |
| 5 | Ministry Of Children, Community And Social Services | Accounts Under $120,000 (aggregated) | No Value | $6.27B |
| 6 | Ministry Of Health | Ontario Health/Santé Ontario | Home Care | $3.39B |
| 7 | Ministry Of Education | Toronto District School Board | No Value | $2.69B |
| 8 | Ministry Of Education | Peel District School Board | No Value | $1.82B |
| 9 | Ministry Of Finance | Rbc-Ontaxrebat (Ontario tax rebates) | No Value | $1.74B |
| 10 | Ministry Of Colleges And Universities | DH Corporation/Société DH | Operating Transfer Payments | $1.71B |
| 11 | Ministry Of Health | Ontario Health/Santé Ontario | Cancer Treatment Services | $1.68B |
| 12 | Ministry Of Health | University Health Network | Operation Of Hospitals | $1.62B |
| 13 | Ministry Of Education | York Region District School Board | No Value | $1.38B |
| 14 | Ministry Of Health | Hamilton Health Sciences Corp | Operation Of Hospitals | $1.26B |
| 15 | Ministry Of Health | London Health Sciences Centre | Operation Of Hospitals | $1.21B |
| 16 | Ministry Of Education | Thames Valley District School Board | No Value | $1.20B |
| 17 | Ministry Of Health | Ontario Health/Santé Ontario | Ontario Drug Programs | $1.18B |
| 18 | Ministry Of Education | Toronto Catholic District School Board | No Value | $1.17B |
| 19 | Ministry Of Children, Community And Social Services | City Of Toronto | No Value | $1.17B |
| 20 | Ministry Of Education | City Of Toronto | No Value | $1.14B |

---

## 11. Assessment: Safe to Display as "Grants Given"?

**Filter assessment: Category = "Transfer Payments" is technically clean.**

- Debt service, vendor payments, salaries, employee benefits, and travel are all excluded.
- Every row is an Ontario government outbound payment to an external organization or individual.
- This is the Ontario government's own classification of what constitutes a "transfer payment."

**Label concern: "Grants Given" may be too narrow for this data.**

The data includes:
- **School board funding** (education transfers)
- **Hospital operating grants** (health transfers)
- **Municipal social services transfers** (MCSS)
- **OHIP physician fee-for-service** (health transfers — large, but not "grants")
- **Transit operating subsidies** (Metrolinx)
- **Tax rebates via banks** (not grants to organizations)
- **University operating grants** (legitimate grants)

A more accurate label would be **"Transfer Payments"** or **"Government Transfer Payments"** rather than "Grants Given."

---

## 12. Recommendation

**Option B (Category filter) works and is clean.** No debt, vendor, salary, or interest rows pass through.

Three paths forward — requires your product decision:

| Option | Filter | Label | Action |
|---|---|---|---|
| **B1** | `Category = "Transfer Payments"`, top 100 by amount | Rename modal to "Transfer Payments" | Safe to display — recommended |
| **B2** | `Category = "Transfer Payments"` + exclude Ministry Of Finance | Grants Given (narrower) | Removes tax rebate rows; still 8000+ rows |
| **B3** | Keep deferred | n/a | No write until product decision made |

**My recommendation: B1.** The `Category = "Transfer Payments"` filter produces clean, official, publicly published government transfer payment records. Renaming the modal from "Grants Given" to "Transfer Payments" is accurate and avoids the OHIP/tax-rebate framing issue. The data is ready to write once you approve the filter and label.

**Do not write Firestore until you confirm the filter and label.**
