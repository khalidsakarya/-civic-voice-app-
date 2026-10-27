# CV-REC-001 — Data Verification Record: CV-DATA-YT-002 CRA Charities Registry (Yukon) — CRA 2024 List of Charities

| Field | Value |
|---|---|
| **Record ID** | CV-REC-001-2026-10-27-CV-DATA-YT-002-CRA2024 |
| **Status** | Verified — Written to Firestore (live and verified) |
| **Owner** | Founder / Data Lead |
| **Related SOP** | CV-SOP-001 Data Verification SOP |
| **Related Policy** | CV-POL-002 Data Sources and Attribution Policy |
| **Date Created** | 2026-10-27 (UTC; write completed 2026-10-26 21:01 local time) |
| **Prepared By** | Automated dry-run, guarded write, targeted read-back and live UI check + founder/reviewer approval |
| **Approval / Closure Status** | Approved — pilot jurisdiction for the CRA 2024 charities correction |
| **Supersedes** | The 1998-source Yukon charities document (written 2026-10-26T00:29:55Z by an unintended test run; see Section 5). No earlier CV-REC-001 file existed for CV-DATA-YT-002 (the old document referenced `CV-REC-001-2026-09-07-CV-DATA-YT-002`, which was never created). |

---

## 1. Dataset Identification

| Field | Value |
|---|---|
| **Dataset name** | CRA List of Charities — 2024 (Identification + Financial data), Yukon extract |
| **Dataset ID** | CV-DATA-YT-002 |
| **Jurisdiction** | Yukon (CA-YT) — filtered from the all-Canada extract (`Province = YT`) |
| **Source URL** | https://open.canada.ca/data/en/dataset/80c00cdb-1358-415c-bb8b-0de7f12675b8 |
| **CKAN package ID** | `80c00cdb-1358-415c-bb8b-0de7f12675b8` — "2024 List of charities" (replaces the "1998 List of charities", package `51c68b86-33f0-46fe-9b51-0a786d0088f5`, previously used in error) |
| **Resource files** | Identification CSV (`694fdc72-eae4-4ee0-83eb-832ab7b230e3`, about 13.2 MB) and Financial data CSV (`e545170c-3689-4833-b2a8-e9e83100ab59`, about 21.0 MB) |
| **Source owner / publisher** | Canada Revenue Agency — Charities Directorate (CKAN organization `cra-arc`) |
| **Licence name** | Open Government Licence — Canada (OGL-Canada) |
| **Licence status** | Approved |
| **Reporting period** | 2024 filing year — T3010 returns for fiscal periods ending in 2024 (coverage 2024-01-01 to 2024-12-31) |
| **Publication metadata** | Published 2026-04-30; dataset last refreshed 2026-10-04; update frequency P1Y (yearly); no 2025 list exists yet |
| **Data dictionary** | CRA "List of charities data dictionary" v2.0 (years 2013–2024) and its "Codes Lists" |
| **Fetched date** | 2026-10-27 |
| **Firestore target** | `subnational_tax_exempt_entities/CA-YT` |
| **Write mode** | Replacement of the named fields (`set(..., { mergeFields })`) after a verified full-document backup — NOT plain merge |
| **Verification trigger** | Correction of the CRA charities source (1998 list found in use) — Yukon pilot |
| **Risk level** | Elevated (replaces live data) — mitigated by dry-run, project guard, verified backup, read-back verification and a documented restore |
| **Scope note** | Financial fields are stored (optional) but **not displayed**; the UI keeps showing "Financial value not displayed in MVP". Missing financial information is omitted — never stored as 0. |

---

## 2. Verification Checklist

| Check ID | Check Description | Result | Evidence / Notes |
|---|---|---|---|
| V-01 | Source URL is accessible | Pass | CKAN `package_show` and both CSV resources downloaded (via the portal's blob redirect) on 2026-10-27 |
| V-02 | Data is from official source | Pass | open.canada.ca — CRA Charities Directorate (organization `cra-arc`) |
| V-03 | Reporting period confirmed | Pass | Package metadata validated at run time before anything is built: id, title "2024 List of charities", coverage 2024-01-01..2024-12-31, frequency P1Y, publication date 2026-04-30 (after coverage end), publisher, licence and both resources. A test proves the 1998 package is rejected |
| V-04 | Schema matches expected | Pass | Identification: BN, Category, Sub Category, Designation, Legal Name, Account Name, address fields, Province. Financial data: BN, FPE, Form ID, Section Used and T3010 line columns. Required columns are checked at run time (the run aborts if they change). Meanings confirmed in the CRA data dictionary: 4700 Total revenue, 5100 Total expenditures, 4200 Total assets (Canadian dollars); FPE = fiscal period end |
| V-05 | Record count within expected range | Pass | 132 Yukon charities in the 2024 Identification file (83,761 nationally); all 132 have a financial row; 127 report total revenue, 5 report none |
| V-06 | Spot-check sample records | Pass | YUKON HOSPITAL CORPORATION ($144,396,000 revenue, FPE 2024-03-31), Yukon University ($62,052,384), LIARD ABORIGINAL WOMEN'S SOCIETY ($8,872,356) — real Yukon organizations. Internal consistency checked on a sample (line 4700 equals the sum of its revenue lines) |
| V-07 | No duplicate records | Pass | 132 distinct BNs; the 100 stored have 100 distinct BNs. Some names repeat (113 distinct names in 132) because separate registered entities share a name; the BN is the identity and is now stored on every record |
| V-08 | No invalid values | Pass | No null, empty or placeholder values in any stored record; no `rawValue` field anywhere; optional fields omitted when not reported (95 of 100 report expenditures; 100 report assets; 100 have a fiscal period end) |
| V-09 | Licence confirmed | Pass | Package `license_title`: Open Government Licence - Canada — redistribution and display permitted with attribution |
| V-10 | Attribution wording current | Pass | "Contains information licensed under the Open Government Licence — Canada. Source: Canada Revenue Agency Charities Directorate." (stored in `licence_note`) |
| V-11 | Ranking method | Pass | Highest reported total revenue (line 4700) first; ties by name then BN; all 100 selected have revenue ($144,396,000 down to $36,440); the 32 not shown have revenue of $36,143 or less (one reports exactly 0, five report none) |
| V-12 | Category and designation mapping | Pass | Official CRA category codes (Codes Lists §2.1) mapped to the app's industry badges: Religion 34, Human Services 21, Other 16, Education 12, Health 8, Arts/Culture 6, Environment 3. Designation A = Public Foundation, B = Private Foundation, C = Charitable Organization (93 / 5 / 2 in the 100) |
| V-13 | Backup before replacement | Pass | Full-document backup saved outside the repository and verified by read-back: `C:\Users\jem91\civic-voice-backups\firestore\subnational_tax_exempt_entities__CA-YT__2026-10-27T01-01-44-286Z.json` (23,613 bytes; the original 100 records, all `rawValue: 0`, no BN) |
| V-14 | Targeted read-back after the write | Pass | One read of `CA-YT`: exactly 100 records deep-equal to a fresh rebuild from the official source; 2024 source metadata stored; revenue descending; Yukon Hospital Corporation first; none of the 32 old-only names present; no `rawValue`; BN on all 100; all 11 original fields still present; no unexpected fields (10 of 10 checks) |
| V-15 | Live UI check | Pass | Yukon "Tax Exempt / Charities" modal (new bundle): heading "Official snapshot"; "Showing 100 of 132 charities (largest by revenue)"; 100 rows, Yukon Hospital Corporation first; no dollar amounts or $0 values; source line names "2024 List of charities"; no console or Firestore errors. Note: a browser holding the previous cached bundle (service worker) shows the old labels until it updates (see Section 5) |
| V-16 | Obsolete data removed | Pass | The 100 old (1998 list, first-100-in-file-order) records were replaced wholesale; the stored `records` array no longer contains any old-only name |

---

## 3. Transformation Notes

- Source: Identification and Financial data CSVs of package `80c00cdb-1358-415c-bb8b-0de7f12675b8`; Province filter `YT`; one financial row per BN (the latest fiscal period end).
- Record fields: `name` (Legal Name), `industry` / `industryColor` (official category code mapped to the app's badges), `exemType` (designation), `bn`, and — only when reported — `revenue_cad` (line 4700), `expenditures_cad` (line 5100), `assets_cad` (line 4200), `fiscal_period_end` (FPE). **No `rawValue`.** A reported 0 is a value and is kept; blank is omitted.
- Selection: up to 100, ranked by total revenue, highest first.
- Document fields: `source_year` 2024; `reporting_period` "CRA List of charities — 2024 filing year (fiscal periods ending in 2024), published 2026-04-30"; `selection_basis` "largest by revenue"; `total_in_source` 132; `records_stored` 100; `financials_reported_count` 127; `source_dataset` (id, title, published, last refreshed, coverage, frequency).
- No PDF extraction beyond reading CRA's own data dictionary and code lists to confirm field meanings; no scraping — CSVs fetched from the official resource URLs.
- The UI keeps hiding financial values (`isCraCharitiesDataset()` detection); the approved wording change ("Official snapshot", "Showing N of M charities (largest by revenue)") is deployed.

---

## 4. Firestore Write Fields

Written to `subnational_tax_exempt_entities/CA-YT` with `set(payload, { mergeFields: <every payload field> })` — each listed field's whole value is replaced, any other field is untouched (the document had none):

- Replaced (11): `jurisdiction_id`, `data_source`, `source_url`, `note`, `total_in_source`, `records_stored`, `records`, `cv_data_id`, `verification_status` (`CV-REC-001-2026-10-27-CV-DATA-YT-002-CRA2024`), `licence_note`, `fetched_at`
- Added (5): `source_year`, `reporting_period`, `selection_basis`, `financials_reported_count`, `source_dataset`
- Removed: none
- Safeguards in the run: dry-run by default with explicit `--write` and `--only`; strict arguments; project guard `civic-voice-5ea94`; metadata validation before building; target validation; refusal of other jurisdictions and unknown fields; verified backup (abort if it fails); read-back verification.
- Operations: 2 reads and 1 write (plus one earlier dry-run read), 1 local backup file.
- **Restore procedure:** `node engine/canada-charities-restore.cjs --file=<backup file above>` to rehearse, then add `--write` (takes a safety backup of the current state, restores the backed-up fields, removes the corrected-only fields, re-reads to verify).
- Run reports: `engine/reports/canada-charities-replace-2026-10-27_01-01-26.json` (identical to `canada-charities-replace-latest.json`).

---

## 5. Related Notes and Open Items

- **Incident:** the 1998-source Yukon charities document had been written by an unintended test run (2026-10-26T00:29:55Z) — see `incident_2026_10_26` in `engine/reports/canada-yt-write-latest.json`. This record closes that document's life: it was replaced by the verified CRA 2024 version.
- **Data-currency finding:** all 13 provincial/territorial charity builders had used the 1998 list. Yukon is corrected (this record). The other 12 jurisdictions are prepared by dry-run and await approval; see `engine/reports/canada-coverage-matrix-latest.json` (`data_currency_finding_2026_10_26`) and `engine/reports/canada-charities-2024-prepared-latest.json`.
- **Service-worker behaviour:** the app registers a service worker. A browser that already holds the previous app bundle keeps showing the old UI labels ("Latest official snapshot", "Top listing from N") until its service worker updates (normally on the next visit/refresh). The data itself is read live from Firestore and is correct immediately.
- **Other Yukon datasets:** CV-DATA-YT-001 (unemployment) was written 2026-10-26 and verified by a targeted read (its CV-REC-001 file is a separate open item); CV-DATA-YT-003 (grants / public payments) is not available (Public Accounts are PDF-only).
- **Display caveats:** some charities share a name (different BNs) and look identical because BNs are not displayed; agriculture, animal welfare, public amenities and generic foundations map to "Other".

---

## 6. Final Decision

| Field | Value |
|---|---|
| **Decision** | APPROVED — written to Firestore; live and verified |
| **Reason** | Official CRA source with confirmed publication metadata and licence; 132 Yukon charities verified in the source; 100 selected by reported total revenue; no placeholder values; backup verified; read-back verification and live UI check passed |
| **Conditions** | None for Yukon. Rollout to other jurisdictions requires its own approval |
| **UI renders without further code changes** | Yes — the approved wording change is deployed; financial values stay hidden |
| **Safe to write** | Yes |
| **Write confirmed** | 2026-10-26 21:01 local (2026-10-27T01:01:44Z) — `node engine/canada-charities-replace.cjs --only=CA-YT --write`, 100 records, replacement via `mergeFields` |
