# CV-REC-001 — Data Verification Record: CV-DATA-NS-002 CRA Charities Registry (Nova Scotia)

| Field | Value |
|---|---|
| **Record ID** | CV-REC-001-2026-09-07-CV-DATA-NS-002 |
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
| **Dataset ID** | CV-DATA-NS-002 |
| **Jurisdiction** | Nova Scotia (CA-NS) — filtered from all-Canada extract |
| **Source URL** | https://open.canada.ca/data/en/dataset/51c68b86-33f0-46fe-9b51-0a786d0088f5 |
| **Resource file** | `ident_updated.csv` — Identification resource within dataset package |
| **CKAN package ID** | `51c68b86-33f0-46fe-9b51-0a786d0088f5` — same package used for CA-ON, CA-BC, CA-AB, CA-QC, CA-SK, and CA-MB |
| **Source owner / publisher** | Canada Revenue Agency — Charities Directorate |
| **Licence name** | Open Government Licence — Canada (OGL-Canada) |
| **Licence status** | Approved |
| **Reporting period** | Latest published CRA extract (date of last file refresh) |
| **Fetched date** | 2026-09-07 |
| **Firestore target** | `subnational_tax_exempt_entities/CA-NS` |
| **Write mode** | merge |
| **Verification trigger** | Canada expansion — Wave 2, Province 3 (CA-NS) |
| **Risk level** | Standard |
| **MVP scope note** | Name, type (designation), and category only. No dollar/financial values stored. `rawValue: 0` for all records — same MVP constraint applied to CA-ON, CA-BC, CA-AB, CA-QC, CA-SK, and CA-MB. |

---

## 2. Verification Checklist

| Check ID | Check Description | Result | Evidence / Notes |
|---|---|---|---|
| V-01 | Source URL is accessible | Pass | CKAN `package_show` returned 200; `ident_updated.csv` accessible via Azure Blob redirect |
| V-02 | Data is from official source | Pass | open.canada.ca — CRA Charities Directorate official publisher |
| V-03 | Reporting period confirmed | Pass | `ident_updated.csv` is the live CRA extract; same file used for CA-ON, CA-BC, CA-AB, CA-QC, CA-SK, and CA-MB |
| V-04 | Schema matches expected | Pass | Columns: BN, Category, Designation, Legal Name, Account Name, ..., Province. Required columns `Legal Name` and `Province` detected |
| V-05 | Record count within expected range | Pass | 3,452 Nova Scotia active charities found in source — plausible (CRA reports ~170K Canada-wide) |
| V-06 | Spot-check sample records | Pass | ACADIA UNIVERSITY, OCEANS INSTITUTE OF CANADA, CANADIAN ASSOCIATION OF GERMAN LANGUAGE SCHOOLS — real registered Nova Scotia organizations, Province=NS |
| V-07 | No duplicate records | Pass | Each record identified by unique BN (Business Number) |
| V-08 | No invalid values | Pass | All sampled records have non-empty `Legal Name` and `Province=NS`. `rawValue=0` enforced for all 100 stored records — zero violators found |
| V-09 | Licence confirmed | Pass | OGL-Canada — redistribution and display permitted with attribution |
| V-10 | Attribution wording current | Pass | "Contains information licensed under the Open Government Licence — Canada. Source: Canada Revenue Agency Charities Directorate." |

---

## 3. Transformation Notes

- Source: `ident_updated.csv` from CKAN package `51c68b86-33f0-46fe-9b51-0a786d0088f5` (same source package as CA-ON, CA-BC, CA-AB, CA-QC, CA-SK, and CA-MB)
- Filter: `Province = NS` only
- Column mapping: `Legal Name` → `name`; `Designation` code → `exemType` (C=Charitable Organization, PF=Private Foundation, PBF=Public Benefit Foundation); `Category` → `industry` (mapped via `INDUSTRY_BADGE` keys)
- MVP constraint: `rawValue: 0` for all records — no dollar values stored, verified before write (zero violators found)
- Top 100 records by alphabetical order (no financial sort) — same selection method as CA-ON, CA-BC, CA-AB, CA-QC, CA-SK, and CA-MB
- This dataset uses the same generalized `isCraCharitiesDataset()` detection (see `src/utils/subnationalTransparencyData.js`) already extended beyond CA-ON, so the $0 → "Financial value not displayed in MVP" suppression and correct CRA source subtitle/link apply automatically with no UI code change required

---

## 4. Firestore Write Fields

Fields written to `subnational_tax_exempt_entities/CA-NS` (merge):

- `records` — array of 100 transformed charity records (name, industry, industryColor, exemType, rawValue=0)
- `data_source` — CRA attribution string
- `source_url` — open.canada.ca dataset URL
- `note` — MVP scope note (name/type/category only, no dollar values)
- `total_in_source` — total NS charities in extract (3,452)
- `records_stored` — number of records written (100)
- `fetched_at` — ISO timestamp of fetch
- `verification_status` — `"CV-REC-001-2026-09-07-CV-DATA-NS-002"`
- `licence_note` — OGL-Canada attribution
- `cv_data_id` — `"CV-DATA-NS-002"`

---

## 5. Related Open Issue — CV-DATA-NS-003 (Grants / Public Payments)

Not written. No comprehensive machine-readable whole-of-government Nova Scotia grants/payments/public-accounts source was found (see `engine/lib/subnational-transparency-ca-ns.cjs` module header and `engine/reports/canada-ns-dry-run-latest.json`):

- Nova Scotia runs a Socrata-powered open data portal (`data.novascotia.ca`, ~1,277 datasets) — a different platform than BC/AB/Québec's CKAN portals.
- A thorough, properly-scoped search (catalog queries across 15+ financial/payments/disclosure terms) found no comprehensive, whole-of-government dataset comparable to BC's supplier payments, Alberta's grant disclosure, Ontario's detailed schedule of payments, or Québec's category-level Public Accounts Volume 2.

**Agriculture Funding Programs Details** (`jv92-pedy`, Department of Agriculture, 6,324 rows, real recipient names and payment amounts, Nova Scotia Open Government Licence) was **identified and successfully fetched/transformed** in the dry-run — but is **deliberately deferred, not published**. It is single-department/single-sector (agriculture funding only), not a whole-of-government dataset, and would require a precise **"Agriculture Grants"** label rather than the standard province-wide "Grants"/"Transfer Payments" pattern used for other provinces, if it is ever published. Publishing it under the generic pattern without that distinction would misrepresent its scope to users.

This dataset remains blocked pending a reviewer decision on whether/how to publish the Agriculture dataset (with an accurate scoped label), whether to combine it with the other narrow Nova Scotia datasets found (mineral resources, age-friendly communities, small business COVID grants, university operating grants), or whether to wait for Nova Scotia to publish a comprehensive source.

---

## 6. Final Decision

| Field | Value |
|---|---|
| **Decision** | APPROVED — written to Firestore |
| **Reason** | Official source, OGL-Canada licence confirmed, correct schema (identical to CA-ON, CA-BC, CA-AB, CA-QC, CA-SK, and CA-MB), 3,452 NS records verified in source, 100 written. MVP scope (name/type only, no dollar values) enforced — zero violators. |
| **Conditions** | None |
| **UI renders without code changes** | Yes — reuses the existing generalized `isCraCharitiesDataset` detection ($0 suppression) and the source-metadata fix (correct CRA subtitle/source link per modal) |
| **Safe to write** | Yes |
| **Write confirmed** | 2026-09-07 — `engine/canada-ns-write-charities.cjs`, 100 records written, merge mode |
