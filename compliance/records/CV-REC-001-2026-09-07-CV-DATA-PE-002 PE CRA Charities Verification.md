# CV-REC-001 — Data Verification Record: CV-DATA-PE-002 CRA Charities Registry (Prince Edward Island)

| Field | Value |
|---|---|
| **Record ID** | CV-REC-001-2026-09-07-CV-DATA-PE-002 |
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
| **Dataset name** | CRA Charities Registry — List of Charities (Identification) |
| **Dataset ID** | CV-DATA-PE-002 |
| **Jurisdiction** | Prince Edward Island (CA-PE) — filtered from all-Canada extract |
| **Source URL** | https://open.canada.ca/data/en/dataset/51c68b86-33f0-46fe-9b51-0a786d0088f5 |
| **Resource file** | `ident_updated.csv` — Identification resource within dataset package |
| **CKAN package ID** | `51c68b86-33f0-46fe-9b51-0a786d0088f5` — same package used for CA-ON, CA-BC, CA-AB, CA-QC, CA-SK, CA-MB, CA-NS, CA-NB, and CA-NL |
| **Source owner / publisher** | Canada Revenue Agency — Charities Directorate |
| **Licence name** | Open Government Licence — Canada (OGL-Canada) |
| **Licence status** | Approved |
| **Reporting period** | Latest published CRA extract (date of last file refresh) |
| **Fetched date** | 2026-09-07 |
| **Firestore target** | `subnational_tax_exempt_entities/CA-PE` |
| **Write mode** | merge |
| **Verification trigger** | Canada expansion — Wave 3, Province 1 (CA-PE) |
| **Risk level** | Standard |
| **MVP scope note** | Name, type (designation), and category only. No dollar/financial values stored. `rawValue: 0` for all records — same MVP constraint applied to CA-ON, CA-BC, CA-AB, CA-QC, CA-SK, CA-MB, CA-NS, CA-NB, and CA-NL. |

---

## 2. Verification Checklist

| Check ID | Check Description | Result | Evidence / Notes |
|---|---|---|---|
| V-01 | Source URL is accessible | Pass | CKAN `package_show` returned 200; `ident_updated.csv` accessible via Azure Blob redirect |
| V-02 | Data is from official source | Pass | open.canada.ca — CRA Charities Directorate official publisher |
| V-03 | Reporting period confirmed | Pass | `ident_updated.csv` is the live CRA extract; same file used for all prior provinces in this wave |
| V-04 | Schema matches expected | Pass | Columns: BN, Category, Designation, Legal Name, Account Name, ..., Province. Required columns `Legal Name` and `Province` detected |
| V-05 | Record count within expected range | Pass | 514 Prince Edward Island active charities found in source — plausible (CRA reports ~170K Canada-wide) |
| V-06 | Spot-check sample records | Pass | COOPER INSTITUTE LTD, P.E.I. CITIZEN ADVOCACY INC., PRINCE EDWARD ISLAND ASSOCIATION ON GERONTOLOGY INC. — real registered Prince Edward Island organizations, Province=PE |
| V-07 | No duplicate records | Pass | Each record identified by unique BN (Business Number) |
| V-08 | No invalid values | Pass | All sampled records have non-empty `Legal Name` and `Province=PE`. `rawValue=0` enforced for all 100 stored records — zero violators found |
| V-09 | Licence confirmed | Pass | OGL-Canada — redistribution and display permitted with attribution |
| V-10 | Attribution wording current | Pass | "Contains information licensed under the Open Government Licence — Canada. Source: Canada Revenue Agency Charities Directorate." |

---

## 3. Transformation Notes

- Source: `ident_updated.csv` from CKAN package `51c68b86-33f0-46fe-9b51-0a786d0088f5` (same source package as all prior provinces in this wave)
- Filter: `Province = PE` only
- Column mapping: `Legal Name` → `name`; `Designation` code → `exemType` (C=Charitable Organization, PF=Private Foundation, PBF=Public Foundation); `Category` → `industry` (mapped via `INDUSTRY_BADGE` keys)
- MVP constraint: `rawValue: 0` for all records — no dollar values stored, verified before write (zero violators found)
- Top 100 records by alphabetical order (no financial sort) — same selection method as all prior provinces
- No PDF extraction, no scraping — CSV fetched directly from the official CKAN resource URL
- This dataset uses the same generalized `isCraCharitiesDataset()` detection (see `src/utils/subnationalTransparencyData.js`) already extended beyond CA-ON, so the $0 → "Financial value not displayed in MVP" suppression and correct CRA source subtitle/link apply automatically with no UI code change required

---

## 4. Firestore Write Fields

Fields written to `subnational_tax_exempt_entities/CA-PE` (merge):

- `records` — array of 100 transformed charity records (name, industry, industryColor, exemType, rawValue=0)
- `data_source` — CRA attribution string
- `source_url` — open.canada.ca dataset URL
- `note` — MVP scope note (name/type/category only, no dollar values)
- `total_in_source` — total PE charities in extract (514)
- `records_stored` — number of records written (100)
- `fetched_at` — ISO timestamp of fetch
- `verification_status` — `"CV-REC-001-2026-09-07-CV-DATA-PE-002"`
- `licence_note` — OGL-Canada attribution
- `cv_data_id` — `"CV-DATA-PE-002"`

---

## 5. Related Open Issue — CV-DATA-PE-003 (Grants / Public Payments)

Not written. No current, comprehensive, payee-level, machine-readable whole-of-government Prince Edward Island grants/payments/public-accounts source was found (see `engine/lib/subnational-transparency-ca-pe.cjs` module header and `engine/reports/canada-pe-dry-run-latest.json`):

- Prince Edward Island's own open data portal (`data.princeedwardisland.ca`, an ArcGIS Hub site) was searched across 9 financial-related terms (grants, payments, supplier, expenditure, disclosure, transfer payment, public accounts, vendor, spending).
- The only candidate resembling a whole-of-government dataset, **"PEI Consolidated Expenses"** (OD0031), was identified and **deliberately rejected** — confirmed via direct FeatureServer schema/query inspection to be **category-level only** (fields: `Area_of_Expenditure`, `Financial_Year`, `Value` — department totals, no recipient names) **and stale** (data stops at fiscal year 2018/19, over 7 years out of date). Publishing aggregate, stale department-level totals as a payee-level "Grants" dataset would misrepresent it to users, so it was not used.
- Three other narrow PEI datasets were also found and rejected: "Expenditure Budget Estimates And Forecasts" (department-level budget estimates, no recipient names, stale to FY2018-19), "Student Loan Grant Assessments and Awards" (aggregate counts only, single narrow program), and "Seniors Home Repair Program Activity" (aggregate program statistics, single narrow program).
- Prince Edward Island is not mirrored on the federal `open.canada.ca` CKAN aggregator (0 datasets under organization "pe"/"pei").
- Prince Edward Island's Public Accounts (Volume I, Volume III) are published by the Department of Finance, but only as PDF volumes — no CSV/XLSX/open-data version exists. PDF extraction was not authorized for this task, so Public Accounts were not used.

This dataset remains blocked pending Prince Edward Island publishing a current, comprehensive, payee-level, machine-readable payments/grants source, or a reviewer decision on an alternative path (e.g. PDF extraction, if separately approved in a future task).

Also not written: CV-DATA-PE-001 (Unemployment) — automated StatsCan Node fetch pipeline is still blocked by a transient `ECONNRESET`. The Prince Edward Island LFS coordinate (`3.7.1.1.1.1.0.0.0.0`) was independently confirmed correct via direct `curl` against the Statistics Canada API (7.6%, 6.8%, 7.9% for Jun–Aug 2026). Will be written once the automated fetch pipeline succeeds cleanly.

---

## 6. Final Decision

| Field | Value |
|---|---|
| **Decision** | APPROVED — written to Firestore |
| **Reason** | Official source, OGL-Canada licence confirmed, correct schema (identical to CA-ON, CA-BC, CA-AB, CA-QC, CA-SK, CA-MB, CA-NS, CA-NB, and CA-NL), 514 PE records verified in source, 100 written. MVP scope (name/type only, no dollar values) enforced — zero violators. No scraping, PDF extraction, or stale/aggregate data used. |
| **Conditions** | None |
| **UI renders without code changes** | Yes — reuses the existing generalized `isCraCharitiesDataset` detection ($0 suppression) and the source-metadata fix (correct CRA subtitle/source link per modal) |
| **Safe to write** | Yes |
| **Write confirmed** | 2026-09-07 — `engine/canada-pe-write-charities.cjs`, 100 records written, merge mode |
