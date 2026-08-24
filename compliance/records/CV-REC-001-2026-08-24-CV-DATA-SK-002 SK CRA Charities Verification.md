# CV-REC-001 — Data Verification Record: CV-DATA-SK-002 CRA Charities Registry (Saskatchewan)

| Field | Value |
|---|---|
| **Record ID** | CV-REC-001-2026-08-24-CV-DATA-SK-002 |
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
| **Dataset name** | CRA Charities Registry — List of Charities (Identification) |
| **Dataset ID** | CV-DATA-SK-002 |
| **Jurisdiction** | Saskatchewan (CA-SK) — filtered from all-Canada extract |
| **Source URL** | https://open.canada.ca/data/en/dataset/51c68b86-33f0-46fe-9b51-0a786d0088f5 |
| **Resource file** | `ident_updated.csv` — Identification resource within dataset package |
| **CKAN package ID** | `51c68b86-33f0-46fe-9b51-0a786d0088f5` — same package used for CA-ON, CA-BC, CA-AB, and CA-QC |
| **Source owner / publisher** | Canada Revenue Agency — Charities Directorate |
| **Licence name** | Open Government Licence — Canada (OGL-Canada) |
| **Licence status** | Approved |
| **Reporting period** | Latest published CRA extract (date of last file refresh) |
| **Fetched date** | 2026-08-24 |
| **Firestore target** | `subnational_tax_exempt_entities/CA-SK` |
| **Write mode** | merge |
| **Verification trigger** | Canada expansion — Wave 2, Province 1 (CA-SK) |
| **Risk level** | Standard |
| **MVP scope note** | Name, type (designation), and category only. No dollar/financial values stored. `rawValue: 0` for all records — same MVP constraint applied to CA-ON, CA-BC, CA-AB, and CA-QC. |

---

## 2. Verification Checklist

| Check ID | Check Description | Result | Evidence / Notes |
|---|---|---|---|
| V-01 | Source URL is accessible | Pass | CKAN `package_show` returned 200; `ident_updated.csv` accessible via Azure Blob redirect |
| V-02 | Data is from official source | Pass | open.canada.ca — CRA Charities Directorate official publisher |
| V-03 | Reporting period confirmed | Pass | `ident_updated.csv` is the live CRA extract; same file used for CA-ON, CA-BC, CA-AB, and CA-QC |
| V-04 | Schema matches expected | Pass | Columns: BN, Category, Designation, Legal Name, Account Name, ..., Province. Required columns `Legal Name` and `Province` detected |
| V-05 | Record count within expected range | Pass | 4,407 Saskatchewan active charities found in source — plausible (CRA reports ~170K Canada-wide) |
| V-06 | Spot-check sample records | Pass | ABBA HOUSE INC, HUDSON BAY HERITAGE PARK INC., SASKATOON LIONS BAND INC., SHERBROOKE FOUNDATION INC. — real registered Saskatchewan organizations, Province=SK |
| V-07 | No duplicate records | Pass | Each record identified by unique BN (Business Number) |
| V-08 | No invalid values | Pass | All sampled records have non-empty `Legal Name` and `Province=SK`. `rawValue=0` enforced for all 100 stored records — zero violators found |
| V-09 | Licence confirmed | Pass | OGL-Canada — redistribution and display permitted with attribution |
| V-10 | Attribution wording current | Pass | "Contains information licensed under the Open Government Licence — Canada. Source: Canada Revenue Agency Charities Directorate." |

---

## 3. Transformation Notes

- Source: `ident_updated.csv` from CKAN package `51c68b86-33f0-46fe-9b51-0a786d0088f5` (same source package as CA-ON, CA-BC, CA-AB, and CA-QC)
- Filter: `Province = SK` only
- Column mapping: `Legal Name` → `name`; `Designation` code → `exemType` (C=Charitable Organization, PF=Private Foundation, PBF=Public Benefit Foundation); `Category` → `industry` (mapped via `INDUSTRY_BADGE` keys)
- MVP constraint: `rawValue: 0` for all records — no dollar values stored, verified before write (zero violators found)
- Top 100 records by alphabetical order (no financial sort) — same selection method as CA-ON, CA-BC, CA-AB, and CA-QC
- This dataset uses the same generalized `isCraCharitiesDataset()` detection (see `src/utils/subnationalTransparencyData.js`) already extended beyond CA-ON, so the $0 → "Financial value not displayed in MVP" suppression and correct CRA source subtitle/link apply automatically with no UI code change required

---

## 4. Firestore Write Fields

Fields written to `subnational_tax_exempt_entities/CA-SK` (merge):

- `records` — array of 100 transformed charity records (name, industry, industryColor, exemType, rawValue=0)
- `data_source` — CRA attribution string
- `source_url` — open.canada.ca dataset URL
- `note` — MVP scope note (name/type/category only, no dollar values)
- `total_in_source` — total SK charities in extract (4,407)
- `records_stored` — number of records written (100)
- `fetched_at` — ISO timestamp of fetch
- `verification_status` — `"CV-REC-001-2026-08-24-CV-DATA-SK-002"`
- `licence_note` — OGL-Canada attribution
- `cv_data_id` — `"CV-DATA-SK-002"`

---

## 5. Related Open Issue — CV-DATA-SK-003 (Grants / Public Payments)

Not written; no source exists. Confirmed by exhaustive search (see `engine/lib/subnational-transparency-ca-sk.cjs` module header and `engine/reports/canada-sk-dry-run-latest.json`):

1. `data.saskatchewan.ca` — DNS does not resolve, no such host.
2. Federal aggregator `open.canada.ca`, `organization=sk` (413 datasets indexed) — zero financial datasets found across six search terms; all 413 are geospatial/geological.
3. Saskatchewan Public Accounts Volume 2 (General Revenue Fund Details) — **identified**, but published as **PDF only**, no CSV/XLSX/open-data version.
4. No dedicated Saskatchewan grant-disclosure dataset (comparable to Alberta's) exists.

**PDF extraction was not used.** The Public Accounts PDF was identified as a theoretical source but PDF text extraction is not authorized for this data pipeline — extracting structured payment records from a PDF risks producing unreliable or misparsed data, which would conflict with the project's no-fake/no-estimated-values rule. This dataset remains blocked until Saskatchewan publishes a structured (CSV/XLSX/API) source, or PDF extraction is explicitly authorized as a separate decision.

---

## 6. Final Decision

| Field | Value |
|---|---|
| **Decision** | APPROVED — written to Firestore |
| **Reason** | Official source, OGL-Canada licence confirmed, correct schema (identical to CA-ON, CA-BC, CA-AB, and CA-QC), 4,407 SK records verified in source, 100 written. MVP scope (name/type only, no dollar values) enforced — zero violators. |
| **Conditions** | None |
| **UI renders without code changes** | Yes — reuses the existing generalized `isCraCharitiesDataset` detection ($0 suppression) and the source-metadata fix (correct CRA subtitle/source link per modal) |
| **Safe to write** | Yes |
| **Write confirmed** | 2026-08-24 — `engine/canada-sk-write-charities.cjs`, 100 records written, merge mode |
