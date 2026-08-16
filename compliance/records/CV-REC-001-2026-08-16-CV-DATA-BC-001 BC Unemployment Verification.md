# CV-REC-001 — Data Verification Record: CV-DATA-BC-001 British Columbia Unemployment

| Field | Value |
|---|---|
| **Record ID** | CV-REC-001-2026-08-16-CV-DATA-BC-001 |
| **Status** | Verified — Written to Firestore |
| **Owner** | Founder / Data Lead |
| **Related SOP** | CV-SOP-001 Data Verification SOP |
| **Related Policy** | CV-POL-002 Data Sources and Attribution Policy |
| **Date Created** | 2026-08-16 |
| **Prepared By** | Automated dry-run + founder review |
| **Approval / Closure Status** | Approved |

---

## 1. Dataset Identification

| Field | Value |
|---|---|
| **Dataset name** | Statistics Canada — Labour Force Survey, British Columbia Unemployment Rate |
| **Dataset ID** | CV-DATA-BC-001 |
| **Jurisdiction** | British Columbia (CA-BC) |
| **Source URL** | https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=1410028701 |
| **Table ID** | 14-10-0287-01 — Labour force characteristics, monthly, seasonally adjusted |
| **BC geography coordinate** | `11.7.1.1.1.1.0.0.0.0` — confirmed returning British Columbia data during dry-run |
| **Source owner / publisher** | Statistics Canada |
| **Licence name** | Statistics Canada Open Licence |
| **Licence status** | Approved |
| **Reporting period** | 24 months ending most recent available |
| **Fetched date** | 2026-08-16 |
| **Firestore target** | `subnational_economic_social_stats/CA-BC` |
| **Write mode** | merge |
| **Verification trigger** | Canada expansion — Wave 1, Province 1 (CA-BC) |
| **Risk level** | Standard |

---

## 2. Verification Checklist

| Check ID | Check Description | Result | Evidence / Notes |
|---|---|---|---|
| V-01 | Source URL is accessible | Pass | Stats Can WDS REST API responded 200; 24 monthly records returned |
| V-02 | Data is from official source (not mirror) | Pass | Fetched directly via Stats Can WDS POST API (`getDataFromCubePidCoordAndLatestNPeriods`) |
| V-03 | Reporting period matches expected | Pass | 24 months returned; latest period Jul 2026 confirmed in dry-run output |
| V-04 | Schema matches expected | Pass | Fields `period`, `period_label`, `jurisdiction`, `national_average`, `British Columbia`, `CA Average` all present — identical schema to CA-ON |
| V-05 | Record count within expected range | Pass | 24 records (24 months) — expected |
| V-06 | Spot-check sample records | Pass | Aug 2024: BC 5.7%, CA 6.6%; Sep 2024: BC 5.9%, CA 6.5%; Oct 2024: BC 5.7%, CA 6.6% — plausible published values |
| V-07 | No duplicate records | Pass | Each record has a unique `period` value (YYYY-MM format) |
| V-08 | No invalid values | Pass | All rates are numeric, periods are valid date strings |
| V-09 | Licence confirmed | Pass | Statistics Canada Open Licence — attribution required, redistribution permitted |
| V-10 | Attribution wording current | Pass | Attribution written: "Statistics Canada. Table 14-10-0287-01." |
| V-11 | Coordinate confirmed correct for jurisdiction | Pass | `11.7.1.1.1.1.0.0.0.0` returned values consistent with published BC unemployment rates for the period — not confused with another province |

---

## 3. Transformation Notes

- API: Stats Can WDS REST POST to `getDataFromCubePidCoordAndLatestNPeriods`
- Product ID: `14100287` (Table 14-10-0287-01)
- British Columbia coordinate: `11.7.1.1.1.1.0.0.0.0`
- Canada average coordinate: `1.7.1.1.1.1.0.0.0.0`
- Output: 24 monthly data points per jurisdiction, normalized to `{period, period_label, jurisdiction, national_average}` schema — same transformation code path as CA-ON (`statcanProvincialUnemployment` in `engine/lib/subnational-unemployment-monthly.cjs`)
- `unemployment_latest_rate` and `unemployment_latest_period` computed from most recent non-null period

---

## 4. Firestore Write Fields

Fields written to `subnational_economic_social_stats/CA-BC` (merge):

- `unemployment_series_monthly` — array of 24 monthly data points
- `unemployment_latest_rate` — most recent BC unemployment rate
- `unemployment_latest_period` — label for most recent period
- `unemployment_reporting_period` — full reporting period description
- `unemployment_source_url` — Stats Can table URL
- `unemployment_source` — attribution string
- `fetched_at` — ISO timestamp of fetch
- `verification_status` — `"CV-REC-001-2026-08-16-CV-DATA-BC-001"`
- `licence_note` — Statistics Canada Open Licence attribution

---

## 5. Final Decision

| Field | Value |
|---|---|
| **Decision** | APPROVED — written to Firestore |
| **Reason** | Official source, correct schema (identical to CA-ON), no anomalies in dry-run or write. 24 data points verified. Zero warnings. |
| **Conditions** | None |
| **UI renders without code changes** | Yes |
| **Safe to write** | Yes |
| **Write confirmed** | 2026-08-16 — `engine/canada-bc-write.cjs`, 24 records written, merge mode |
