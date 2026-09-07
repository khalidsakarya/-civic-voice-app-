# CV-REC-001 — Data Verification Record: CV-DATA-NB-002 CRA Charities Registry (New Brunswick)

| Field | Value |
|---|---|
| **Record ID** | CV-REC-001-2026-09-07-CV-DATA-NB-002 |
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
| **Dataset ID** | CV-DATA-NB-002 |
| **Jurisdiction** | New Brunswick (CA-NB) — filtered from all-Canada extract |
| **Source URL** | https://open.canada.ca/data/en/dataset/51c68b86-33f0-46fe-9b51-0a786d0088f5 |
| **Resource file** | `ident_updated.csv` — Identification resource within dataset package |
| **CKAN package ID** | `51c68b86-33f0-46fe-9b51-0a786d0088f5` — same package used for CA-ON, CA-BC, CA-AB, CA-QC, CA-SK, CA-MB, and CA-NS |
| **Source owner / publisher** | Canada Revenue Agency — Charities Directorate |
| **Licence name** | Open Government Licence — Canada (OGL-Canada) |
| **Licence status** | Approved |
| **Reporting period** | Latest published CRA extract (date of last file refresh) |
| **Fetched date** | 2026-09-07 |
| **Firestore target** | `subnational_tax_exempt_entities/CA-NB` |
| **Write mode** | merge |
| **Verification trigger** | Canada expansion — Wave 2, Province 4 (CA-NB) |
| **Risk level** | Standard |
| **MVP scope note** | Name, type (designation), and category only. No dollar/financial values stored. `rawValue: 0` for all records — same MVP constraint applied to CA-ON, CA-BC, CA-AB, CA-QC, CA-SK, CA-MB, and CA-NS. |

---

## 2. Verification Checklist

| Check ID | Check Description | Result | Evidence / Notes |
|---|---|---|---|
| V-01 | Source URL is accessible | Pass | CKAN `package_show` returned 200; `ident_updated.csv` accessible via Azure Blob redirect |
| V-02 | Data is from official source | Pass | open.canada.ca — CRA Charities Directorate official publisher |
| V-03 | Reporting period confirmed | Pass | `ident_updated.csv` is the live CRA extract; same file used for CA-ON, CA-BC, CA-AB, CA-QC, CA-SK, CA-MB, and CA-NS |
| V-04 | Schema matches expected | Pass | Columns: BN, Category, Designation, Legal Name, Account Name, ..., Province. Required columns `Legal Name` and `Province` detected |
| V-05 | Record count within expected range | Pass | 2,480 New Brunswick active charities found in source — plausible (CRA reports ~170K Canada-wide) |
| V-06 | Spot-check sample records | Pass | SAINT JOHN ARTS CENTRE INC./CENTRE DES ARTS DE SAINT JOHN INC., L'ATELIER R.A.D.O. INC., BETH SHALOM INC., IMPERIAL THEATRE FOUNDATION INC — real registered New Brunswick organizations, Province=NB |
| V-07 | No duplicate records | Pass | Each record identified by unique BN (Business Number) |
| V-08 | No invalid values | Pass | All sampled records have non-empty `Legal Name` and `Province=NB`. `rawValue=0` enforced for all 100 stored records — zero violators found |
| V-09 | Licence confirmed | Pass | OGL-Canada — redistribution and display permitted with attribution |
| V-10 | Attribution wording current | Pass | "Contains information licensed under the Open Government Licence — Canada. Source: Canada Revenue Agency Charities Directorate." |

---

## 3. Transformation Notes

- Source: `ident_updated.csv` from CKAN package `51c68b86-33f0-46fe-9b51-0a786d0088f5` (same source package as CA-ON, CA-BC, CA-AB, CA-QC, CA-SK, CA-MB, and CA-NS)
- Filter: `Province = NB` only
- Column mapping: `Legal Name` → `name`; `Designation` code → `exemType` (C=Charitable Organization, PF=Private Foundation, PBF=Public Foundation); `Category` → `industry` (mapped via `INDUSTRY_BADGE` keys)
- MVP constraint: `rawValue: 0` for all records — no dollar values stored, verified before write (zero violators found)
- Top 100 records by alphabetical order (no financial sort) — same selection method as CA-ON, CA-BC, CA-AB, CA-QC, CA-SK, CA-MB, and CA-NS
- This dataset uses the same generalized `isCraCharitiesDataset()` detection (see `src/utils/subnationalTransparencyData.js`) already extended beyond CA-ON, so the $0 → "Financial value not displayed in MVP" suppression and correct CRA source subtitle/link apply automatically with no UI code change required

---

## 4. Firestore Write Fields

Fields written to `subnational_tax_exempt_entities/CA-NB` (merge):

- `records` — array of 100 transformed charity records (name, industry, industryColor, exemType, rawValue=0)
- `data_source` — CRA attribution string
- `source_url` — open.canada.ca dataset URL
- `note` — MVP scope note (name/type/category only, no dollar values)
- `total_in_source` — total NB charities in extract (2,480)
- `records_stored` — number of records written (100)
- `fetched_at` — ISO timestamp of fetch
- `verification_status` — `"CV-REC-001-2026-09-07-CV-DATA-NB-002"`
- `licence_note` — OGL-Canada attribution
- `cv_data_id` — `"CV-DATA-NB-002"`

---

## 5. Related Dataset — CV-DATA-NB-003 (Public Payments)

Written separately, same task, see `CV-REC-001-2026-09-07-CV-DATA-NB-003 NB Public Payments Verification.md`.

Not written this task: CV-DATA-NB-001 (Unemployment) — automated StatsCan Node fetch pipeline is still blocked by a transient `ECONNRESET`. The New Brunswick LFS coordinate (`5.7.1.1.1.1.0.0.0.0`) was independently confirmed correct via direct `curl` against the Statistics Canada API (7.3%, 7.0%, 7.3% for Jun–Aug 2026). Will be written once the automated fetch pipeline succeeds cleanly.

---

## 6. Final Decision

| Field | Value |
|---|---|
| **Decision** | APPROVED — written to Firestore |
| **Reason** | Official source, OGL-Canada licence confirmed, correct schema (identical to CA-ON, CA-BC, CA-AB, CA-QC, CA-SK, CA-MB, and CA-NS), 2,480 NB records verified in source, 100 written. MVP scope (name/type only, no dollar values) enforced — zero violators. |
| **Conditions** | None |
| **UI renders without code changes** | Yes — reuses the existing generalized `isCraCharitiesDataset` detection ($0 suppression) and the source-metadata fix (correct CRA subtitle/source link per modal) |
| **Safe to write** | Yes |
| **Write confirmed** | 2026-09-07 — `engine/canada-nb-write-charities.cjs`, 100 records written, merge mode |
