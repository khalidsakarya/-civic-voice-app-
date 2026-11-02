# CV-REC-001 — Data Verification Record: CV-DATA-NL-002 CRA Charities Registry (Newfoundland and Labrador) — CRA 2024 List of Charities

| Field | Value |
|---|---|
| **Record ID** | CV-REC-001-2026-10-31-CV-DATA-NL-002-CRA2024 |
| **Status** | Verified — Written to Firestore (live and verified) |
| **Owner** | Founder / Data Lead |
| **Related SOP** | CV-SOP-001 Data Verification SOP |
| **Related Policy** | CV-POL-002 Data Sources and Attribution Policy |
| **Date Created** | 2026-10-31 |
| **Prepared By** | Automated dry-run, guarded write, targeted read-back and live UI check + founder/reviewer approval (rollout batch 3: NB, NL, PE) |
| **Approval / Closure Status** | Approved |
| **Supersedes** | The 1998-source Newfoundland and Labrador charities document (written earlier by the legacy writer; its record file for CV-DATA-NL-002, if any, described the 1998 list) |
| **Pilot reference** | CV-REC-001-2026-10-27-CV-DATA-YT-002-CRA2024 (Yukon pilot, same pipeline) |

---

## 1. Dataset Identification

| Field | Value |
|---|---|
| **Dataset name** | CRA List of Charities — 2024 (Identification + Financial data), Newfoundland and Labrador extract |
| **Dataset ID** | CV-DATA-NL-002 |
| **Jurisdiction** | Newfoundland and Labrador (CA-NL) — filtered from the all-Canada extract (`Province = NL`) |
| **Source URL** | https://open.canada.ca/data/en/dataset/80c00cdb-1358-415c-bb8b-0de7f12675b8 |
| **CKAN package ID** | `80c00cdb-1358-415c-bb8b-0de7f12675b8` — "2024 List of charities" (replaces the "1998 List of charities", package `51c68b86-33f0-46fe-9b51-0a786d0088f5`, previously used in error) |
| **Resource files** | Identification CSV (`694fdc72-eae4-4ee0-83eb-832ab7b230e3`) and Financial data CSV (`e545170c-3689-4833-b2a8-e9e83100ab59`) |
| **Source owner / publisher** | Canada Revenue Agency — Charities Directorate (CKAN organization `cra-arc`) |
| **Licence** | Open Government Licence — Canada (OGL-Canada) — Approved |
| **Reporting period** | 2024 filing year — T3010 returns for fiscal periods ending in 2024 (coverage 2024-01-01 to 2024-12-31); published 2026-04-30; refreshed 2026-10-04; yearly |
| **Fetched / written** | 2026-10-31 (replacement run 2026-10-31_18-59-13 UTC) |
| **Firestore target** | `subnational_tax_exempt_entities/CA-NL` |
| **Write mode** | Replacement of the named fields (`set(..., { mergeFields })`) after a verified full-document backup — not plain merge |
| **Scope note** | Financial fields are stored (optional) but not displayed; the UI keeps "Financial value not displayed in MVP". Missing financial information is omitted — never stored as 0. |

---

## 2. Verification Checklist

| Check ID | Check Description | Result | Evidence / Notes |
|---|---|---|---|
| V-01 | Source URL accessible | Pass | CKAN `package_show` and both CSVs downloaded on 2026-10-31 |
| V-02 | Official source | Pass | open.canada.ca — CRA Charities Directorate |
| V-03 | Reporting period confirmed | Pass | Metadata validated at run time before building (id, title, coverage 2024, frequency P1Y, publication date after coverage end, publisher, licence, resources) |
| V-04 | Schema as expected | Pass | Identification and Financial headers checked at run time; line meanings (4700 total revenue, 5100 total expenditures, 4200 total assets, CAD) confirmed in the CRA data dictionary v2.0 |
| V-05 | Record count in range | Pass | 1,131 Newfoundland and Labrador charities in the 2024 source (the replaced document claimed 1,040 from the 1998 list) |
| V-06 | Spot-check | Pass | #1 MEMORIAL UNIVERSITY OF NEWFOUNDLAND ($671,146,644); #100 RESOURCE CENTRE FOR THE ARTS ($1,146,692) — real Newfoundland and Labrador organizations |
| V-07 | No duplicates | Pass | 100 distinct BNs, all matching `^\d{9}RR\d{4}$` |
| V-08 | No invalid values | Pass | No `rawValue` anywhere; no null/empty values; 97 of 100 report expenditures, 100 of 100 report assets; revenue on all 100 |
| V-09 | Licence confirmed | Pass | OGL-Canada |
| V-10 | Attribution current | Pass | "Contains information licensed under the Open Government Licence — Canada. Source: Canada Revenue Agency Charities Directorate." |
| V-11 | Ranking | Pass | Total revenue (line 4700), highest first: $671,146,644 down to $1,146,692; ties by name then BN |
| V-12 | Category / designation mapping | Pass | Official CRA category codes mapped to the app's industry badges; A/B/C = Public Foundation / Private Foundation / Charitable Organization |
| V-13 | Backup before replacement | Pass | `C:\Users\jem91\civic-voice-backups\firestore\subnational_tax_exempt_entities__CA-NL__2026-10-31T18-59-40-270Z.json` (24,933 bytes, taken 2026-10-31T18:59:40.270Z, verified by read-back; the original 100 records, all `rawValue: 0`, no BN) |
| V-14 | Targeted read-back after the write | Pass | One read of `CA-NL`: 100 records deep-equal a fresh rebuild; 2024 source metadata stored; revenue descending; 34 old-only names, none present; no `rawValue`; BN on all; all 11 original fields still present, 5 added, 0 unexpected (9 of 9 checks) |
| V-15 | Live UI | Pass | Newfoundland and Labrador "Tax Exempt / Charities" modal: "Official snapshot"; "Showing 100 of 1,131 charities (largest by revenue)"; 100 rows numbered 1–100 in order, #1 MEMORIAL UNIVERSITY OF NEWFOUNDLAND, #100 RESOURCE CENTRE FOR THE ARTS; no dollar amounts or $0; source line names "2024 List of charities"; no console errors |
| V-16 | Obsolete data removed | Pass | The 100 old (1998 list, first-100-in-file-order) records were replaced wholesale; none of the 34 old-only names remains |

---

## 3. Transformation Notes

- Source: Identification and Financial data CSVs of package `80c00cdb-1358-415c-bb8b-0de7f12675b8`; Province filter `NL`; one financial row per BN (latest fiscal period end).
- Record fields: `name`, `industry`/`industryColor`, `exemType`, `bn`, and only when reported `revenue_cad` (4700), `expenditures_cad` (5100), `assets_cad` (4200), `fiscal_period_end`. **No `rawValue`.**
- Selection: up to 100, ranked by total revenue, highest first.
- Document fields: `source_year` 2024; `reporting_period`; `selection_basis` "largest by revenue"; `total_in_source` 1131; `records_stored` 100; `financials_reported_count`; `source_dataset`.

---

## 4. Firestore Write Fields

Written to `subnational_tax_exempt_entities/CA-NL` with `set(payload, { mergeFields: <every payload field> })`:

- Replaced (11): `jurisdiction_id`, `data_source`, `source_url`, `note`, `total_in_source`, `records_stored`, `records`, `cv_data_id`, `verification_status` (`CV-REC-001-2026-10-31-CV-DATA-NL-002-CRA2024`), `licence_note`, `fetched_at`
- Added (5): `source_year`, `reporting_period`, `selection_basis`, `financials_reported_count`, `source_dataset`
- Removed: none. The document held no unrelated fields.
- Operations: 2 reads and 1 write (plus 1 dry-run read), 1 local backup file.
- Restore: `node engine/canada-charities-restore.cjs --file=<backup above>` (rehearse first; add `--write` to restore).
- Run report: `engine/reports/canada-charities-replace-2026-10-31_18-59-13.json`.

---

## 5. Related Notes and Open Items

- Rollout batch 3 (NB, NL, PE) followed the Yukon pilot, Ontario and batches 1 (BC, AB, SK) and 2 (QC, MB, NS); the only jurisdictions without a CRA 2024 document are NT and NU (no document exists yet); the details are tracked in `engine/reports/canada-charities-2024-prepared-latest.json`.
- Service worker: a browser holding the previous app bundle may show old labels until its service worker updates; the data is read live and is correct immediately.
- Display caveats: charities sharing a name look identical (BNs are not displayed); some categories map to "Other"; the name shown is the registered Legal Name, which for some registrants differs from the CRA "Account Name" (see the source-validation and Legal Name vs Account Name notes in engine/reports/canada-charities-2024-prepared-latest.json; showing Account Name as secondary text is a backlog item, not implemented).

---

## 6. Final Decision

| Field | Value |
|---|---|
| **Decision** | APPROVED — written to Firestore; live and verified |
| **Reason** | Official CRA source, confirmed publication metadata and licence, ranked by reported revenue, no placeholder values, backup verified, read-back and live UI checks passed |
| **Conditions** | None |
| **UI renders without further code changes** | Yes |
| **Safe to write** | Yes |
| **Write confirmed** | 2026-10-31 — `node engine/canada-charities-replace.cjs --only=CA-NL --write`, 100 records |
