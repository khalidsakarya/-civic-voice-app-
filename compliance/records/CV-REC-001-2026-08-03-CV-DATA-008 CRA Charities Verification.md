# CV-REC-001 — Data Verification Record: CV-DATA-008 CRA Charities Registry

| Field | Value |
|---|---|
| **Record ID** | CV-REC-001-2026-08-03-CV-DATA-008 |
| **Status** | Verified — Approved for Firestore write |
| **Owner** | Founder / Data Lead |
| **Related SOP** | CV-SOP-001 Data Verification SOP |
| **Related Policy** | CV-POL-002 Data Sources and Attribution Policy |
| **Date Created** | 2026-08-03 |
| **Prepared By** | Automated dry-run + founder review |
| **Approval / Closure Status** | Approved |

---

## 1. Dataset Identification

| Field | Value |
|---|---|
| **Dataset name** | CRA Charities Registry — List of Charities (Identification) |
| **Dataset ID** | CV-DATA-008 |
| **Jurisdiction** | Ontario (CA-ON) — filtered from all-Canada extract |
| **Source URL** | https://open.canada.ca/data/en/dataset/51c68b86-33f0-46fe-9b51-0a786d0088f5 |
| **Resource file** | `ident_updated.csv` — Identification resource within dataset package |
| **CKAN package ID** | `51c68b86-33f0-46fe-9b51-0a786d0088f5` |
| **Source owner / publisher** | Canada Revenue Agency — Charities Directorate |
| **Licence name** | Open Government Licence — Canada (OGL-Canada) |
| **Licence status** | Approved |
| **Reporting period** | Latest published CRA extract (date of last file refresh) |
| **Fetched date** | 2026-08-03 |
| **Firestore target** | `subnational_tax_exempt_entities/CA-ON` |
| **Write mode** | merge |
| **Verification trigger** | Initial Canadian MVP launch write |
| **Risk level** | Standard |
| **MVP scope note** | Name, type (designation), and category only. No dollar/financial values stored. `rawValue: 0` for all records per CV-LAUNCH-DEC-001. |

---

## 2. Verification Checklist

| Check ID | Check Description | Result | Evidence / Notes |
|---|---|---|---|
| V-01 | Source URL is accessible | Pass | CKAN `package_show` returned 200; `ident_updated.csv` accessible via Azure Blob redirect |
| V-02 | Data is from official source | Pass | open.canada.ca — CRA Charities Directorate official publisher |
| V-03 | Reporting period confirmed | Pass | `ident_updated.csv` is the live CRA extract; last refresh date in CKAN metadata |
| V-04 | Schema matches expected | Pass | Columns: BN, Category, Designation, Legal Name, Account Name, ..., Province. Required columns `Legal Name` and `Province` detected |
| V-05 | Record count within expected range | Pass | 25,822 Ontario active charities — plausible (CRA reports ~170K Canada-wide, ~30K in ON) |
| V-06 | Spot-check sample records | Pass | ADAS ISRAEL CONGREGATION OF HAMILTON, AGA KHAN FOUNDATION CANADA — real registered charities, Province=ON |
| V-07 | No duplicate records | Pass | Each record identified by unique BN (Business Number) |
| V-08 | No invalid values | Pass | All sampled records have non-empty `Legal Name` and `Province=ON`. `rawValue=0` enforced |
| V-09 | Licence confirmed | Pass | OGL-Canada — redistribution and display permitted with attribution |
| V-10 | Attribution wording current | Pass | "Contains information licensed under the Open Government Licence — Canada. Source: Canada Revenue Agency Charities Directorate." |

---

## 3. Transformation Notes

- Source: `ident_updated.csv` from CKAN package `51c68b86-33f0-46fe-9b51-0a786d0088f5`
- Filter: `Province = ON` only
- Column mapping: `Legal Name` → `name`; `Designation` code → `exemType` (C=Charitable Organization, PF=Private Foundation, PBF=Public Benefit Foundation); `Category` → `industry` (mapped via INDUSTRY_BADGE keys)
- MVP constraint: `rawValue: 0` for all records — no dollar values stored per CV-LAUNCH-DEC-001
- Top 100 records by alphabetical order (no financial sort)

---

## 4. Firestore Write Fields

Fields written to `subnational_tax_exempt_entities/CA-ON` (merge):

- `records` — array of up to 100 transformed charity records (name, industry, industryColor, exemType, rawValue=0)
- `data_source` — CRA attribution string
- `source_url` — open.canada.ca dataset URL
- `note` — MVP scope note (name/type/category only, no dollar values)
- `total_in_source` — total Ontario charities in extract (25,822)
- `records_stored` — number of records written (100)
- `fetched_at` — ISO timestamp of fetch
- `verification_status` — `"verified-2026-08-03"`
- `licence_note` — OGL-Canada attribution

---

## 5. Final Decision

| Field | Value |
|---|---|
| **Decision** | APPROVED — write to Firestore |
| **Reason** | Official source, OGL-Canada licence confirmed, correct schema, 25K Ontario records verified. MVP scope (name/type only, no dollar values) enforced. |
| **Conditions** | None |
| **UI renders without code changes** | Yes |
| **Safe to write** | Yes |
