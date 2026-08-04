# CV-MATRIX-001 — Launch Dataset Implementation Matrix

| Field | Value |
|---|---|
| **Document ID** | CV-MATRIX-001 |
| **Version** | 0.1 |
| **Date** | 2026-08-02 |
| **Owner** | Founder / Data Lead |
| **Scope** | 5 selected Canadian MVP launch datasets only |
| **Purpose** | Practical fetch/integration reference — not a compliance template |

---

## Summary Recommendation

| Dataset | Recommendation | Reason |
|---|---|---|
| CV-DATA-002 — Stats Can unemployment | **Ready to fetch** | Firestore slot exists; app renders it today for Ontario |
| CV-DATA-008 — CRA Charities | **Ready to fetch** | Firestore slot exists; app renders it today for Ontario |
| CV-DATA-014 — Ontario Transfer Payments | **Written — MVP Approved with controls** | Firestore slot populated (FY 2024-25, fetched 2026-05-17). Audit 2026-08-04 confirmed 100% transfer payment rows, zero debt service/vendor/OHIP rows. Future refreshes must filter by purpose values: Government Transfer, Operating Transfer Payments, Capital Transfer Payments. |
| CV-DATA-013 — Ontario Budget | **Needs product decision** | Firestore slot exists; need to confirm which budget table and whether distribution or spending vs budget |
| CV-DATA-001 — Stats Can population | **Needs product decision** | No display slot exists in the app; population is not in the economic modal or province card |

---

## Dataset Matrix

### CV-DATA-002 — Statistics Canada Unemployment (Ontario)

| Field | Value |
|---|---|
| **Official dataset URL** | https://www150.statcan.gc.ca/t1/tbl1/en/dtbl/downloadTbl/downloadLink/csvDownload/14100287-eng.zip |
| **Table ID** | 14-10-0287-01 — Labour force characteristics, monthly, seasonally adjusted and trend-cycle, last 5 years |
| **Reporting period at launch** | Most recent 12 months available (confirm at fetch — typically lags by ~6 weeks) |
| **Fetch method** | Direct CSV download. Filter rows where `GEO = Ontario` and `Labour force characteristics = Unemployment rate`. Extract `REF_DATE` and `VALUE` columns. |
| **Firestore collection / doc** | `subnational_economic_social_stats/CA-ON` |
| **Firestore fields to write** | `unemployment_series_monthly` (array of `{period, period_label, jurisdiction}` rows) · `unemployment_latest_rate` · `unemployment_latest_period` · `unemployment_frequency: "monthly"` · `unemployment_source_url` |
| **App display location** | Ontario province page → Economic & Social modal → Unemployment chart. Already rendered by `parseSubnationalEconomicSocialFromStatsDoc` / `normalizeUnemploymentMonthlyRows`. No app code changes needed. |
| **Attribution wording** | `Statistics Canada. Table 14-10-0287-01. Labour force characteristics, monthly, seasonally adjusted and trend-cycle. https://doi.org/10.25318/1410028701-eng` |
| **Transformation needed** | Yes — filter to Ontario, pivot to `{period: "YYYY-MM", jurisdiction: <rate>}` array, compute `unemployment_latest_rate` and `unemployment_latest_period` from most recent row. |
| **Can fetch now** | Yes. Public CSV, no authentication. |
| **Remaining blocker** | None. Confirm table 14-10-0287-01 still returns monthly Ontario rate at fetch time (table occasionally restructured by Stats Can). Complete CV-REC-001 before Firestore write. |

---

### CV-DATA-008 — CRA Charities Registry (Ontario, org-level)

| Field | Value |
|---|---|
| **Official dataset URL** | https://open.canada.ca/data/en/dataset/a9a44f59-8d75-4749-8893-94e36c9b6d65 — "Registered charities" bulk CSV on open.canada.ca |
| **Reporting period at launch** | Latest published extract (updated by CRA periodically — note extract date at fetch) |
| **Fetch method** | Download CSV from open.canada.ca. Filter rows where `Province_or_Territory_of_Registered_Office = ON`. Select active/registered charities only. |
| **Firestore collection / doc** | `subnational_tax_exempt_entities/CA-ON` |
| **Firestore fields to write** | `records` (array of normalized rows) · `data_source` · `source_url` · `records_stored` · `total_in_source` · `reporting_period` · `note` |
| **App display location** | Ontario province page → Tax-exempt entities modal → "Registry Snapshot" table. Already rendered by `parseSubnationalTaxFromEntitiesDoc` / `normalizeTaxExemptRow`. No app code changes needed. |
| **Attribution wording** | `Contains information licensed under the Open Government Licence — Canada. Source: Canada Revenue Agency Charities Directorate. Data obtained from open.canada.ca.` |
| **Transformation needed** | Yes — map CRA CSV columns to `{name, industry, exemType, rawValue, year_granted}` schema. CRA fields: `Organization_Legal_Name` → `name`; `Designation_code` → `exemType`; `Category_of_activity` → `industry` (map to existing INDUSTRY_BADGE_COLORS keys where possible); no reliable dollar value field — set `rawValue = 0` and omit fmtValue or use receipted gifts if available. |
| **Can fetch now** | Yes. OGL-Canada 2.0 open data, no authentication. Bulk CSV is large — may need to filter at download or parse in-place. |
| **Remaining blocker** | Confirm field mapping: CRA CSV does not have a per-org annual dollar value. Either display without value (name/type/category only) or find the correct receipted-gifts column. Founder decision needed on which columns to show. CV-REC-001 before Firestore write. |

---

### CV-DATA-014 — Ontario Transfer Payments and Grants

| Field | Value |
|---|---|
| **Official dataset URL** | https://data.ontario.ca/dataset/public-accounts-detailed-schedule-of-payments |
| **Resource ID** | `1677dc37-00e5-437a-bb39-c918b243f9a9` |
| **Reporting period** | FY 2024-25 (April 2024 – March 2025) |
| **Fetched date** | 2026-05-17T01:19:15Z |
| **Firestore collection / doc** | `subnational_grants/CA-ON` |
| **Firestore fields written** | `records` · `data_source` · `source_url` · `fiscal_year` · `records_stored` · `total_in_source` · `fmt_total_top100` · `resource_id` · `reporting_period` · `fetched_at` |
| **App display location** | Ontario province page → Grants modal. Rendered by existing app parser. No app code changes needed. |
| **Attribution wording** | `Contains information licensed under the Open Government Licence — Ontario. Source: Government of Ontario — Ontario Public Accounts, Detailed Schedule of Payments, FY 2024-25 (data.ontario.ca).` |
| **Status** | **Written to Firestore. MVP Approved with controls.** |
| **Audit result** | 2026-08-04 read-only audit confirmed: 100 records, all transfer payment rows. Purpose distribution: Government Transfer (62), Operating Transfer Payments (36), Capital Transfer Payments (2). Zero debt service, zero vendor/procurement, zero OHIP/drug benefit rows. |
| **Refresh control — mandatory** | Future refreshes must filter by `purpose` values: `Government Transfer`, `Operating Transfer Payments`, `Capital Transfer Payments`. Do NOT take raw top-100 by amount from the full Public Accounts CSV without purpose filter. |
| **UI label** | "Grants" is acceptable for MVP. "Transfer Payments" is more precise and may be adopted in a future UI iteration. |

---

### CV-DATA-013 — Ontario Budget

| Field | Value |
|---|---|
| **Official dataset URL** | https://data.ontario.ca/dataset/ontario-budget — search for budget distribution and spending CSV files. Likely: `ontario-budget-highlights` or `expenditure-estimates` dataset. |
| **Reporting period at launch** | 2025 Ontario Budget (FY 2025-26), tabled spring 2025 |
| **Fetch method** | Download CSV from data.ontario.ca. |
| **Firestore collection / doc** | `subnational_economic_social_stats/CA-ON` |
| **Firestore fields to write** | `budget_distribution` (array of `{name, value}` pie slice rows) and/or `spending_vs_budget` (array of `{category, Allocated, Actual}` rows) · `budget_reporting_period` · `budget_distribution_source` |
| **App display location** | Ontario province page → Economic & Social modal → Approved Budget (pie) and/or Actual Spending (bar) charts. Already rendered by `parseSubnationalEconomicSocialFromStatsDoc`. No app code changes needed. |
| **Attribution wording** | `Contains information licensed under the Open Government Licence — Ontario. Source: Government of Ontario, Ontario Budget 2025.` |
| **Transformation needed** | Yes — normalize ministry/sector rows to `{name, value_as_pct}` for pie chart, or `{category, Allocated, Actual}` for spending vs budget bar chart. |
| **Can fetch now** | Pending URL confirmation. data.ontario.ca has budget data but the exact dataset slug and whether FY 2025-26 figures are published in CSV format must be verified before fetch. |
| **Remaining blocker** | **Product decision needed:** (1) Which budget presentation — distribution by ministry (pie) or allocated vs actual spending (bar)? Both require different CSV sources. (2) Confirm FY 2025-26 CSV is published on data.ontario.ca — earlier years are available but the most recent may be PDF-only until mid-year. CV-REC-001 before Firestore write. |

---

### CV-DATA-001 — Statistics Canada Population Estimates (Ontario)

| Field | Value |
|---|---|
| **Official dataset URL** | https://www150.statcan.gc.ca/t1/tbl1/en/dtbl/downloadTbl/downloadLink/csvDownload/17100005-eng.zip |
| **Table ID** | 17-10-0005-01 — Population estimates on July 1st, by age and sex |
| **Reporting period at launch** | July 1, 2024 estimate (latest annual mid-year estimate; 2025 not published until late 2025) |
| **Fetch method** | Direct CSV download. Filter rows where `GEO = Ontario` and `Sex = Both sexes` and `Age group = All ages`. |
| **Firestore collection / doc** | **No existing slot.** The `subnational_economic_social_stats` document does not have a population field. The app's `parseSubnationalEconomicSocialFromStatsDoc` and `buildEconomicTransparencyHeadlines` do not read or render a population metric. |
| **App display location** | **No existing display location.** Population is not rendered anywhere in the current Ontario province page, economic modal, or province card summary. |
| **Attribution wording** | `Statistics Canada. Table 17-10-0005-01. Population estimates on July 1st, by age and sex. https://doi.org/10.25318/1710000501-eng` |
| **Transformation needed** | Yes — filter to Ontario total, extract single integer value, format for display. |
| **Can fetch now** | Yes. Data is available. |
| **Remaining blocker** | **Product decision required before any work:** Where does Ontario population appear in the app? Options: (a) headline stat on the Ontario province card, (b) new metric in the Economic modal, (c) summary_stats collection entry. None of these slots exist today and all require app code changes. Do not fetch until display location is decided. |

---

## Immediate Action Order

1. **Fetch CV-DATA-002** (unemployment) — table confirmed, Firestore slot ready, app renders it. Write a transformation script, complete CV-REC-001, write to `subnational_economic_social_stats/CA-ON`.

2. **Fetch CV-DATA-008** (CRA Charities) — open data CSV confirmed. Decide on whether to show dollar values (receipted gifts column) or name/type/status only. Either way the slot is ready. Complete CV-REC-001, write to `subnational_tax_exempt_entities/CA-ON`.

3. ~~**Fetch CV-DATA-014** (Ontario Transfer Payments)~~ — **COMPLETE.** Written to `subnational_grants/CA-ON` (FY 2024-25, fetched 2026-05-17). Audit 2026-08-04: all 100 records are transfer payment rows. Approved for MVP with purpose-filter control on future refreshes.

4. **Decide CV-DATA-013** (Ontario Budget) — pick: budget distribution pie or spending vs budget bar. Confirm FY 2025-26 CSV exists on data.ontario.ca. If PDF-only, defer or use FY 2023-24 actuals as a fallback.

5. **Decide CV-DATA-001** (population) — pick display location before doing any fetch or transformation work.

---

## What Is NOT Needed Before Fetching CV-DATA-002, 008, 014

- No new Firestore collections
- No new app components
- No new compliance templates
- No second reviewer (none of these three are high-risk)
- No legal review

The only gate is CV-REC-001 completion per dataset before the Firestore write.
