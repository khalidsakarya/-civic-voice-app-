# CV-REC-001 — Data Verification Record: CV-DATA-NU-002 CRA Charities Registry (Nunavut) — CRA 2024 List of Charities

| Field | Value |
|---|---|
| **Record ID** | CV-REC-001-2026-11-02-CV-DATA-NU-002-CRA2024 |
| **Status** | Verified — Created in Firestore (live and verified) |
| **Owner** | Founder / Data Lead |
| **Related SOP** | CV-SOP-001 Data Verification SOP |
| **Related Policy** | CV-POL-002 Data Sources and Attribution Policy |
| **Date Created** | 2026-11-02 |
| **Prepared By** | Automated dry-runs, guarded create-only write, targeted read-back, receipt cross-check and live UI check + founder/reviewer approval (final charities rollout: NU, then NT) |
| **Approval / Closure Status** | Approved |
| **Supersedes** | Nothing: no charities document existed for Nunavut. The earlier 1998-based preparation (dedicated writer script, never executed) is obsolete and that script was retired on 2026-11-02 (commit 0aada56). |
| **Pilot reference** | CV-REC-001-2026-10-27-CV-DATA-YT-002-CRA2024 (Yukon pilot, same pipeline) |

---

## 1. Dataset Identification

| Field | Value |
|---|---|
| **Dataset name** | CRA List of Charities — 2024 (Identification + Financial data), Nunavut extract |
| **Dataset ID** | CV-DATA-NU-002 |
| **Jurisdiction** | Nunavut (CA-NU) — filtered from the all-Canada extract (`Province = NU`) |
| **Source URL** | https://open.canada.ca/data/en/dataset/80c00cdb-1358-415c-bb8b-0de7f12675b8 |
| **CKAN package ID** | `80c00cdb-1358-415c-bb8b-0de7f12675b8` — "2024 List of charities" |
| **Resource files** | Identification CSV (`694fdc72-eae4-4ee0-83eb-832ab7b230e3`) and Financial data CSV (`e545170c-3689-4833-b2a8-e9e83100ab59`) |
| **Source owner / publisher** | Canada Revenue Agency — Charities Directorate (CKAN organization `cra-arc`) |
| **Licence** | Open Government Licence — Canada (OGL-Canada) — Approved |
| **Reporting period** | 2024 filing year — T3010 returns for fiscal periods ending in 2024 (coverage 2024-01-01 to 2024-12-31); published 2026-04-30; refreshed 2026-10-04; yearly |
| **Fetched / created** | 2026-11-02 (creation run 2026-11-02_23-43-28 UTC); Firestore createTime 2026-11-02T23:43:48.501Z |
| **Firestore target** | `subnational_tax_exempt_entities/CA-NU` |
| **Write mode** | **Create-only**: Firestore `create()` (fails if the document exists), via `node engine/canada-charities-replace.cjs --only=CA-NU --write --allow-create`. No merge, overwrite or replacement. |
| **Scope note** | Financial fields are stored (optional) but not displayed; the UI keeps "Financial value not displayed in MVP". Missing financial information is omitted — never stored as 0. |

---

## 2. Verification Checklist

| Check ID | Check Description | Result | Evidence / Notes |
|---|---|---|---|
| V-01 | Source URL accessible | Pass | CKAN `package_show` and both CSVs downloaded on 2026-11-02 |
| V-02 | Official source | Pass | open.canada.ca — CRA Charities Directorate |
| V-03 | Reporting period confirmed | Pass | Metadata validated at run time before building (id, title, coverage 2024, frequency P1Y, publication date after coverage end, publisher, licence, resources) |
| V-04 | Schema as expected | Pass | Identification and Financial headers checked at run time; line meanings (4700 total revenue, 5100 total expenditures, 4200 total assets, CAD) confirmed in the CRA data dictionary v2.0 |
| V-05 | Record count in range | Pass | 35 Nunavut charities in the 2024 source; 35 selected and stored |
| V-06 | Spot-check | Pass | #1 NUNAVUT ARCTIC COLLEGE ($61,033,000); #35 THE IQALUIT COMMUNITY GREENHOUSE SOCIETY ($6,279) — real Nunavut organizations |
| V-07 | No duplicates | Pass | 35 distinct BNs, all matching `^\d{9}RR\d{4}$` |
| V-08 | No invalid values | Pass | No `rawValue`; no null/empty values; 35 of 35 report revenue, 32 expenditures, 31 assets |
| V-09 | Licence confirmed | Pass | OGL-Canada |
| V-10 | Attribution current | Pass | "Contains information licensed under the Open Government Licence — Canada. Source: Canada Revenue Agency Charities Directorate." |
| V-11 | Ranking | Pass | Total revenue (line 4700), highest first: $61,033,000 down to $6,279; ties by name then BN |
| V-12 | Category / designation mapping | Pass | Official CRA category codes mapped to the app's industry badges; A/B/C = Public Foundation / Private Foundation / Charitable Organization |
| V-13 | Pre-write backup | Not applicable | No document existed (create-only); nothing to back up. The creation receipt (V-17) is the audit record. |
| V-14 | Targeted read-back after creation | Pass | One read of `CA-NU` (12 of 12 checks): 35 records deep-equal a fresh rebuild from the official source; 2024 source metadata correct; revenue descending; no `rawValue`; valid unique BNs; exactly the 16 owned fields, none unexpected; createTime = updateTime (never modified) |
| V-15 | Live UI | Pass | Nunavut "Tax Exempt / Charities" modal: "Official snapshot"; "35 organizations"; Official tax-exempt registry listing (all 35 charities are shown, so no "Showing N of M" line is expected); 35 rows numbered 1–35 in order, #1 NUNAVUT ARCTIC COLLEGE, #35 THE IQALUIT COMMUNITY GREENHOUSE SOCIETY; every row "Financial value not displayed in MVP"; no dollar text; source line names "2024 List of charities"; no "Not loaded yet" state; no console errors |
| V-16 | No obsolete data | Pass | The document did not exist before; no 1998 data was ever stored (no reference to the 1998 package) |
| V-17 | Creation receipt | Pass | A creation receipt (Firestore createTime/updateTime, data hash, verification_status, fetched_at; 1327 bytes) was saved in the private backup directory `~/civic-voice-backups/firestore/created__CA-NU__2026-11-02T23-43-47-130Z.receipt.json`, outside any git repository, and matched the live document at creation. **The repository holds no copy of the receipt** (a copy committed on 2026-11-02 was removed; see the security note below). Audit reference: SHA-256 of the receipt file `a0bc01d95895a8e35217b26c14ff2666a0384629afb8a317f33417e3ffbe861d`; Firestore createTime 2026-11-02T23:43:48.500Z. |
| V-18 | Legacy writer retired | Pass | `engine/canada-nu-write-charities.cjs` fails closed on direct execution (commit 0aada56) before this creation |

---

## 3. Transformation Notes

- Source: Identification and Financial data CSVs of package `80c00cdb-1358-415c-bb8b-0de7f12675b8`; Province filter `NU`; one financial row per BN (latest fiscal period end).
- Record fields: `name`, `industry`/`industryColor`, `exemType`, `bn`, and only when reported `revenue_cad` (4700), `expenditures_cad` (5100), `assets_cad` (4200), `fiscal_period_end`. **No `rawValue`.**
- Selection: up to 100, ranked by total revenue, highest first (35 of 35).
- Document fields: `source_year` 2024; `reporting_period`; `selection_basis` "largest by revenue"; `total_in_source` 35; `records_stored` 35; `financials_reported_count` 35; `source_dataset`.

---

## 4. Firestore Write Fields

Created at `subnational_tax_exempt_entities/CA-NU` with `create(payload)` — exactly 16 fields:

- `jurisdiction_id`, `data_source`, `source_url`, `note`, `total_in_source`, `records_stored`, `records`, `cv_data_id`, `verification_status` (`CV-REC-001-2026-11-02-CV-DATA-NU-002-CRA2024`), `licence_note`, `fetched_at`
- `source_year`, `reporting_period`, `selection_basis`, `financials_reported_count`, `source_dataset`
- Removed / replaced: none (new document). No other document was written.
- Operations: 3 dry-run reads before creation (0 writes); creation run: 2 reads (existence check, read-back) + 1 create; 1 verification read; 1 receipt file; the live modal reads 3 small documents each time it opens. No delete, no query, no rollback executed.
- Run report: `engine/reports/canada-charities-replace-2026-11-02_23-43-28.json`.
- Rollback: NOT executed. A rollback requires a separately issued private authorization plus explicit confirmation of the exact Firebase project and document (`engine/canada-charities-rollback-authorize.cjs`, `engine/canada-charities-created-rollback.cjs`); no authorization has been issued for this document.

---

## 5. Related Notes and Open Items

- All 35 Nunavut charities in the source are shown; all 35 report revenue; no repeated names.
- With this document, all 13 provincial and territorial charity documents are on the CRA 2024 list.
- **Security note (2026-11-02):** the first version of this record and a copy of the creation receipt were published with deterministic rollback-confirmation values. Those values are permanently disclosed and are INVALID: the rollback mechanism was replaced by a private, randomly generated authorization, and the repository no longer holds receipt copies or any rollback value. Earlier commits remain publicly accessible (history was not rewritten). Details: compliance/security/SEC-2026-11-02-rollback-authorization-disclosure.md.
- Service worker: a browser holding the previous app bundle may show old labels until its service worker updates; the data is read live and is correct immediately.
- Display caveat: the name shown is the registered Legal Name, which for some registrants differs from the CRA "Account Name" (see `engine/reports/canada-charities-2024-prepared-latest.json`; showing Account Name as secondary text is a backlog item, not implemented).

---

## 6. Final Decision

| Field | Value |
|---|---|
| **Decision** | APPROVED — created in Firestore; live and verified |
| **Reason** | Official CRA source, confirmed publication metadata and licence, ranked by reported revenue, no placeholder values, create-only semantics, receipt matched the live document, read-back and live UI checks passed |
| **Conditions** | None |
| **UI renders without further code changes** | Yes |
| **Safe to write** | Yes (done) |
| **Creation confirmed** | 2026-11-02 — `node engine/canada-charities-replace.cjs --only=CA-NU --write --allow-create`, 35 records |
