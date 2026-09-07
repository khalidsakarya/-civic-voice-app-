# CV-REC-001 — Data Verification Record: CV-DATA-NL-002 CRA Charities Registry (Newfoundland and Labrador)

| Field | Value |
|---|---|
| **Record ID** | CV-REC-001-2026-09-07-CV-DATA-NL-002 |
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
| **Dataset ID** | CV-DATA-NL-002 |
| **Jurisdiction** | Newfoundland and Labrador (CA-NL) — filtered from all-Canada extract |
| **Source URL** | https://open.canada.ca/data/en/dataset/51c68b86-33f0-46fe-9b51-0a786d0088f5 |
| **Resource file** | `ident_updated.csv` — Identification resource within dataset package |
| **CKAN package ID** | `51c68b86-33f0-46fe-9b51-0a786d0088f5` — same package used for CA-ON, CA-BC, CA-AB, CA-QC, CA-SK, CA-MB, CA-NS, and CA-NB |
| **Source owner / publisher** | Canada Revenue Agency — Charities Directorate |
| **Licence name** | Open Government Licence — Canada (OGL-Canada) |
| **Licence status** | Approved |
| **Reporting period** | Latest published CRA extract (date of last file refresh) |
| **Fetched date** | 2026-09-07 |
| **Firestore target** | `subnational_tax_exempt_entities/CA-NL` |
| **Write mode** | merge |
| **Verification trigger** | Canada expansion — Wave 2, Province 5 (CA-NL) |
| **Risk level** | Standard |
| **MVP scope note** | Name, type (designation), and category only. No dollar/financial values stored. `rawValue: 0` for all records — same MVP constraint applied to CA-ON, CA-BC, CA-AB, CA-QC, CA-SK, CA-MB, CA-NS, and CA-NB. |

---

## 2. Verification Checklist

| Check ID | Check Description | Result | Evidence / Notes |
|---|---|---|---|
| V-01 | Source URL is accessible | Pass | CKAN `package_show` returned 200; `ident_updated.csv` accessible via Azure Blob redirect |
| V-02 | Data is from official source | Pass | open.canada.ca — CRA Charities Directorate official publisher |
| V-03 | Reporting period confirmed | Pass | `ident_updated.csv` is the live CRA extract; same file used for all prior provinces in this wave |
| V-04 | Schema matches expected | Pass | Columns: BN, Category, Designation, Legal Name, Account Name, ..., Province. Required columns `Legal Name` and `Province` detected |
| V-05 | Record count within expected range | Pass | 1,040 Newfoundland and Labrador active charities found in source — plausible (CRA reports ~170K Canada-wide) |
| V-06 | Spot-check sample records | Pass | Canadian Parents for French (Newfoundland/Labrador) Inc., Libra House Inc., The Agnes Pratt Home — real registered Newfoundland and Labrador organizations, Province=NL |
| V-07 | No duplicate records | Pass | Each record identified by unique BN (Business Number) |
| V-08 | No invalid values | Pass | All sampled records have non-empty `Legal Name` and `Province=NL`. `rawValue=0` enforced for all 100 stored records — zero violators found |
| V-09 | Licence confirmed | Pass | OGL-Canada — redistribution and display permitted with attribution |
| V-10 | Attribution wording current | Pass | "Contains information licensed under the Open Government Licence — Canada. Source: Canada Revenue Agency Charities Directorate." |

---

## 3. Transformation Notes

- Source: `ident_updated.csv` from CKAN package `51c68b86-33f0-46fe-9b51-0a786d0088f5` (same source package as all prior provinces in this wave)
- Filter: `Province = NL` only
- Column mapping: `Legal Name` → `name`; `Designation` code → `exemType` (C=Charitable Organization, PF=Private Foundation, PBF=Public Foundation); `Category` → `industry` (mapped via `INDUSTRY_BADGE` keys)
- MVP constraint: `rawValue: 0` for all records — no dollar values stored, verified before write (zero violators found)
- Top 100 records by alphabetical order (no financial sort) — same selection method as all prior provinces
- No PDF extraction, no scraping — CSV fetched directly from the official CKAN resource URL
- This dataset uses the same generalized `isCraCharitiesDataset()` detection (see `src/utils/subnationalTransparencyData.js`) already extended beyond CA-ON, so the $0 → "Financial value not displayed in MVP" suppression and correct CRA source subtitle/link apply automatically with no UI code change required

---

## 4. Firestore Write Fields

Fields written to `subnational_tax_exempt_entities/CA-NL` (merge):

- `records` — array of 100 transformed charity records (name, industry, industryColor, exemType, rawValue=0)
- `data_source` — CRA attribution string
- `source_url` — open.canada.ca dataset URL
- `note` — MVP scope note (name/type/category only, no dollar values)
- `total_in_source` — total NL charities in extract (1,040)
- `records_stored` — number of records written (100)
- `fetched_at` — ISO timestamp of fetch
- `verification_status` — `"CV-REC-001-2026-09-07-CV-DATA-NL-002"`
- `licence_note` — OGL-Canada attribution
- `cv_data_id` — `"CV-DATA-NL-002"`

---

## 5. Related Open Issue — CV-DATA-NL-003 (Grants / Public Payments)

Not written. No current, comprehensive, machine-readable whole-of-government Newfoundland and Labrador grants/payments/public-accounts source was found (see `engine/lib/subnational-transparency-ca-nl.cjs` module header and `engine/reports/canada-nl-dry-run-latest.json`):

- Newfoundland and Labrador operates a bespoke (non-CKAN, non-Socrata) open data portal at `opendata.gov.nl.ca`, mirrored 1:1 on the federal `open.canada.ca` CKAN aggregator under organization `nl-tnl` (76 datasets). Both were fully enumerated.
- The only candidate resembling a whole-of-government payments disclosure, **"Grant payments over $250,000 2014-2015"** (Department of Finance), was identified and **deliberately rejected** — its own metadata confirms it covers only fiscal year April 2014–March 2015, released and modified 2015-09-28, and has never been updated since (over a decade stale). Publishing this single old fiscal year as this province's current grants/payments dataset would mislead users into believing it reflects present-day spending, so it was not used.
- Three other narrow grant-related NL datasets were also found and rejected for the same reason — all single fiscal-year snapshots from 2013–2016, never updated, and single-department/single-program in scope (not whole-of-government): "Municipal Operating Grant Allocations" (2013–14 only), "Value of Annual Operating Grants provided to CYFS' Community Partners" (2014–15 only), "Community Enhancement Employment Program Annual Project List and Funding Provided" (June 2014–April 2015 only).
- Newfoundland and Labrador's Public Accounts are published by the Department of Finance, but only as PDF volumes — no CSV/XLSX/open-data version exists. PDF extraction was not authorized for this task, so Public Accounts were not used.

This dataset remains blocked pending Newfoundland and Labrador publishing a current, comprehensive, machine-readable payments/grants source, or a reviewer decision on an alternative path (e.g. PDF extraction, if separately approved in a future task).

Also not written: CV-DATA-NL-001 (Unemployment) — automated StatsCan Node fetch pipeline is still blocked by a transient `ECONNRESET`. The Newfoundland and Labrador LFS coordinate (`2.7.1.1.1.1.0.0.0.0`) was independently confirmed correct via direct `curl` against the Statistics Canada API (8.2%, 9.3%, 8.6% for Jun–Aug 2026). Will be written once the automated fetch pipeline succeeds cleanly.

---

## 6. Final Decision

| Field | Value |
|---|---|
| **Decision** | APPROVED — written to Firestore |
| **Reason** | Official source, OGL-Canada licence confirmed, correct schema (identical to CA-ON, CA-BC, CA-AB, CA-QC, CA-SK, CA-MB, CA-NS, and CA-NB), 1,040 NL records verified in source, 100 written. MVP scope (name/type only, no dollar values) enforced — zero violators. No scraping or PDF extraction used. |
| **Conditions** | None |
| **UI renders without code changes** | Yes — reuses the existing generalized `isCraCharitiesDataset` detection ($0 suppression) and the source-metadata fix (correct CRA subtitle/source link per modal) |
| **Safe to write** | Yes |
| **Write confirmed** | 2026-09-07 — `engine/canada-nl-write-charities.cjs`, 100 records written, merge mode |
