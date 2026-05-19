# Subnational transparency sync audit

**Date:** 2026-05-17  
**Scope:** `CA-ON`, `US-CA`, `AU-NSW`, `UK-ENG-LON`  
**Collections:** `subnational_economic_social_stats`, `subnational_tax_exempt_entities`, `subnational_grants`  
**Method:** Read-only Firestore inspection + `subnationalTransparencyData.js` parser smoke tests. No new fetches, no writes, no UI changes.

---

## Executive summary

| Jurisdiction | Economic | Tax / charities | Grants | Overall |
|--------------|----------|-----------------|--------|---------|
| **CA-ON** (template) | Full series; **crime chart broken in parser** | 100 records; **1998 CRA list** | 100; FY 2024-25 | Reference shape; fix crime keys |
| **US-CA** | Crime + unemp + GDP; **no budget**; crime **stale (≤2018)** | 100 IRS EO BMF | 100; FY 2024-25 | Usable; refresh crime + add budget |
| **AU-NSW** | **Crime only** (to Dec 2025) | 100 ACNC | **Missing doc** | Partial; add grants + unemp |
| **UK-ENG-LON** | **Crime only** (2 years) | **Missing doc** | 33 GLA grants | Thinnest; charity + crime coverage |

All stored rows trace to named official sources (open.canada.ca, IRS, data.ca.gov, BOCSAR, ACNC, GLA, data.police.uk). No RNG/demo payloads detected in Firestore. Placeholder display values (`fmtValue: "Tax-Exempt"`, `rawValue: 0`) match the CA-ON pattern for registry listings without dollar exemptions.

---

## 1. Module matrix (Firestore)

| Jurisdiction | `subnational_economic_social_stats` | `subnational_tax_exempt_entities` | `subnational_grants` |
|------------|-------------------------------------|-----------------------------------|----------------------|
| **CA-ON** | Yes | Yes (100) | Yes (100) |
| **US-CA** | Yes | Yes (100) | Yes (100) |
| **AU-NSW** | Yes | Yes (100) | **No document** |
| **UK-ENG-LON** | Yes | **No document** | Yes (33) |

---

## 2. Missing or empty modules

| Gap | Jurisdictions | App behaviour |
|-----|---------------|---------------|
| Grants collection absent | AU-NSW | Grants modal → empty state |
| Tax collection absent | UK-ENG-LON | Tax modal → empty state |
| Budget / spending charts | US-CA, AU-NSW, UK-ENG-LON | Economic modal shows only available series |
| Unemployment / GDP / poverty / homelessness | AU-NSW, UK-ENG-LON | Those chart sections hidden |
| Full economic empty | None | All four have `hasData: true` in parser (CA-ON via budget; others via crime) |

---

## 3. Reporting periods — newest vs stale

| Jurisdiction | Module | Period label (UI / metadata) | Data freshness | Verdict |
|--------------|--------|------------------------------|----------------|---------|
| CA-ON | Economic | Ontario Budget **2025-26** / FY **2024-25** Interim | Budget current; crime **2019–2024**; unemp **2021–2025** | **Mixed** — budget newest |
| CA-ON | Tax | CRA registered charities **(1998 list)** | All records `year: 1998` | **Stale** but documented |
| CA-ON | Grants | FY **2024-25** (Apr 2024 – Mar 2025) | `date: 2024-25` | **Newest** |
| US-CA | Economic | OpenJustice + BLS/BEA via FRED | Crime **2013–2018**; unemp **2021–2026**; GDP **2020–2025** | **Stale crime** |
| US-CA | Tax | IRS EO BMF (Region 3, CA filter) | Sample years **2023–2025** on records | **Current** |
| US-CA | Grants | California Grants Portal **FY 2024-25** | `FiscalYear: 2024-2025` | **Newest** |
| AU-NSW | Economic | BOCSAR to **December 2025** | Crime rates **2020–2025** | **Newest** (crime only) |
| AU-NSW | Tax | ACNC register (data.gov.au) | No `year` on records | **Current register, weak period** |
| UK-ENG-LON | Economic | data.police.uk Dec snapshots | Crime **2023–2024** only | **Partial / thin** |
| UK-ENG-LON | Grants | GLA **2024/25** P1–P13 | `date: 2024-25` | **Newest** (small N) |

**Ingest timestamps (`fetched_at`):** US-CA, AU-NSW, UK-ENG-LON ≈ 2026-05-17; CA-ON tax 2026-05-16, grants 2026-05-17.

---

## 4. Source URLs present

| Jurisdiction | Economic | Tax | Grants |
|--------------|----------|-----|--------|
| CA-ON | `budget_distribution_url`, per-series `*_url` (Ontario / StatCan) | `source_url` → open.canada.ca CRA dataset | `source_url` → data.ontario.ca Public Accounts |
| US-CA | `crime_url`, `unemployment_url`, `gdp_url` | `source_url` → irs.gov EO BMF | `source_url` → data.ca.gov Grants Portal 2024-25 |
| AU-NSW | `crime_url` → BOCSAR open datasets | `source_url` → data.gov.au ACNC register | — |
| UK-ENG-LON | `crime_url` → data.police.uk | — | `source_url` → london.gov.uk GLA spending |

---

## 5. Datasets failed or skipped (sync)

| Item | Status | Notes |
|------|--------|-------|
| US-CA budget / spending | **Skipped** | No machine-readable CA DOF breakdown in sync |
| US-CA FRED (intermittent) | **Partial** | `data_status.notes` still list CAUR/CANGSP timeouts from an earlier run; series data present on doc |
| AU-NSW grants | **Skipped** | No suitable NSW open CSV/API identified in sync |
| AU-NSW unemployment | **Skipped** | ABS Labour Force XLS link not parsed in sync |
| UK-ENG-LON tax / charities | **Skipped** | Charity Commission bulk host unreachable; no API key |
| UK-ENG-LON crime years 2019–2022 | **Failed** | data.police.uk returned no rows for Dec snapshots in sync loop |
| OpenJustice full refresh | **Not done** | US-CA crime capped at 2018 in current extract |

---

## 6. App parser display check

Smoke test: `buildTransparencyFieldsFromModalDocs` + `parseSubnationalEconomicSocialFromStatsDoc` (same path as modals).

| Jurisdiction | Economic modal | Tax modal | Grants modal | Jurisdiction ID resolution |
|--------------|----------------|-----------|--------------|----------------------------|
| CA-ON | **Yes** except **crime chart empty** | 100 rows | 100 rows | `CA-ON` via `subnationalId` |
| US-CA | Yes (crime, unemp, GDP) | 100 rows | 100 rows | `US-CA` via `flagCode: us-ca` |
| AU-NSW | Yes (crime only) | 100 rows | Empty | `AU-NSW` via Firestore `subnationalId` |
| UK-ENG-LON | Yes (crime only, 2 points) | Empty | 33 rows | `UK-ENG-LON` via `mergeProvincialExplorerFirestore` london slug |

### Critical parser bug (CA-ON)

Firestore crime rows use keys **`Violent CSI`** and **`Non-violent CSI`**.  
Parser only accepts `Violent Crime` / `Property Crime` (and snake_case aliases).  
**Result:** `crimeDataM.length === 0` for CA-ON despite six crime rows in Firestore. Budget, spend, unemp, GDP, poverty, and homelessness still render.

**US-CA / AU-NSW / UK-ENG-LON** use `Violent Crime` / `Property Crime` — crime charts parse correctly (UK with only two years).

---

## 7. Field shape vs CA-ON template

**Expected template (CA-ON):**

- **Economic:** top-level arrays `budget_distribution`, `spending_vs_budget`, `crime_rate`, `unemployment_rate`, `gdp_growth`, `poverty_rate`, `homelessness`; metadata `*_source`, `*_url`, `budget_distribution_source`, `fiscal_year` / `reporting_period`.
- **Tax / grants:** top-level `records[]` with UI-ready fields; doc metadata `data_source`, `source_url`, `fiscal_year`, `note`, `total_in_source`, `records_stored`.

| Area | CA-ON | US-CA | AU-NSW | UK-ENG-LON |
|------|-------|-------|--------|------------|
| Crime keys | `Violent CSI`, `Non-violent CSI` | `Violent Crime`, `Property Crime` | Same as US | Same as US |
| Unemployment keys | `Ontario`, `CA Average` | `California`, `US Average` | — | — |
| Tax record extras | `businessNumber`, `designation`, `city` | `ein`, `city` | `abn`, `city` (no `year`) | — |
| Grants `date` | `2024-25` | `2024-2025` | — | `2024-25` |
| Economic metadata density | Rich per-series | Per-series for synced fields only | Crime only | Crime only |
| `data_status` | `official_verified` | `{ notes: [...] }` (stale errors) | — | — |
| `last_updated` | Yes | No | No | No |

No jurisdiction uses legacy embedded `subnational_jurisdictions` transparency blobs for these modals; all use dedicated collections.

---

## 8. Official vs demo / generated data

| Check | Finding |
|-------|---------|
| RNG / hardcoded demo arrays in Firestore | **None** in audited docs |
| Real agency sources cited | **Yes** — CRA, Ontario Finance, IRS, data.ca.gov, BOCSAR, ACNC, GLA, OpenJustice, FRED/BLS/BEA |
| Obvious synthetic names | **None** in samples (real org names, GLA vendors, grant recipients) |
| Placeholder amounts | `fmtValue: "Tax-Exempt"`, `rawValue: 0` on charity registries — **official list behaviour**, not fabricated dollars |
| US-CA tax sort | Top 100 by `ASSET_CD` string, not asset size — **odd but still IRS rows** |
| AU-NSW tax stream cap | `total_in_source: 8000` (sync cap), first row may be header artefact (`"Registered charity"`) — **data quality issue** |
| UK crime | Single lat/lng sample, not Greater London aggregate — **official API, geographically narrow** |
| UK grants | Only lines with account `GRANTS TO EXTERNAL ORGANISATIONS` (33) — **official, incomplete vs “all grants”** |

---

## 9. Priority fix list

### P0 — Broken or misleading in production

1. **CA-ON crime chart:** Extend parser aliases for `Violent CSI` / `Non-violent CSI` (or normalize keys at ingest). Economic modal currently hides crime for Ontario despite Firestore data.
2. **US-CA crime staleness:** Refresh OpenJustice / CA DOJ source so crime series includes **2019+** (doc ends at **2018**; misaligned with “newest available” goal).

### P1 — Major coverage gaps

3. **AU-NSW grants:** Add official NSW transfer-payments / grants register when a stable open dataset is identified; until then empty state is correct.
4. **UK-ENG-LON charities:** Wire Charity Commission daily extract or API when download endpoint is reachable.
5. **US-CA (and others) budget charts:** Add machine-readable CA budget breakdown (DOF / Open FISCal / LAO) to match CA-ON modal richness.
6. **AU-NSW unemployment:** Parse ABS Labour Force release (Table 6 NSW + Australia) into `unemployment_rate`.
7. **UK-ENG-LON crime:** Broaden to Metropolitan Police force area or bulk crime files; restore **2019–2024** Dec snapshots with rate-limit handling.

### P2 — Quality / metadata hygiene

8. **US-CA `data_status.notes`:** Clear stale FRED timeout notes on successful re-sync (merge should not leave false error flags).
9. **CA-ON tax period:** Consider newer CRA/charity source or stronger UI caveat (1998 list is honest but very old).
10. **AU-NSW tax records:** Filter header rows; add `year` from `Registration_Date` or AIS; raise stream cap above 8,000 for true `total_in_source`.
11. **UK-ENG-LON grants:** Set expectations in metadata — 33 GLA external-grant lines, not a full UK grants register.

### P3 — Parity / polish

12. Align grant `date` format (`2024-25` vs `2024-2025`) across jurisdictions.
13. Add `last_updated` / `data_status: official_verified` on new docs for parity with CA-ON.
14. Document US-CA tax selection logic (currently first 100 by asset code sort, not largest organizations).

---

## Appendix: Parser record counts (2026-05-17)

| ID | `economicHasData` | Tax rows | Grant rows |
|----|-------------------|----------|------------|
| CA-ON | true | 100 | 100 |
| US-CA | true | 100 | 100 |
| AU-NSW | true | 100 | 0 |
| UK-ENG-LON | true | 0 | 33 |

**Sync script:** `engine/sync-subnational-transparency.cjs` (`npm run sync:subnational-transparency`).  
**Read path:** `src/firestore/fetchSubnationalTransparencyModalDocs.js` → `src/utils/subnationalTransparencyData.js`.
