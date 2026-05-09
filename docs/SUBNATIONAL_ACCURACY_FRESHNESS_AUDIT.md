# Subnational data — accuracy, completeness, and freshness audit

**Date:** 2026-05-08 (repository + artifact review; live Firestore timestamps require credentials).

**Scope:** Evaluate `subnational_jurisdictions`, hardcoded `App.js` jurisdiction blobs, and **existing** engine tooling. **No deletions**, **no UI changes**, **no new collections**, **no engine rewrite**.

---

## Executive summary

| Question | Finding |
|----------|---------|
| Is subnational data “produced by the engine” in the sense of the main ingestion/upload pipeline? | **No.** `subnational_jurisdictions` is written by **`civic-voice-app/engine/seed-subnational-jurisdictions.cjs`** (curated static canonical rows embedded in that script). **`npm run upload:firebase`** (`civic-voice-engine/src/uploadToFirebase.js` → `uploadAll`) **does not** upload this collection. |
| Would running the **usual** engine Firebase upload refresh subnational rows? | **No.** |
| What refresh command exists today? | **`npm run seed:subnational-jurisdictions -- --write`** from **`civic-voice-engine`** (wrapper in `package.json`) reruns the **same static seed** with a **new `last_updated`** on written fields. It does **not** call Census, StatCan, ABS, ONS, or governor APIs. |
| Is staleness mainly “engine not run”? | **Partially misleading.** Rerunning the seed improves **write freshness timestamps** and reapplies **corrected static** data if the script changed—**not** live demographic or leadership accuracy unless those values were edited in the seed source. |
| Accurate enough for v1 (thin reference: names, IDs, capitals, types)? | **Yes**, assuming last validation **PASS** (see committed report). Reference geography aligns with the curated seed. |
| Accurate enough for v1 **rich UI** (bios, seat splits, UK regional dashboards)? | **No**—that content remains **hardcoded in `App.js`**; Firestore seed does not replicate it. |

---

## 1. Existing data sources

### 1.1 Firestore — `subnational_jurisdictions`

| Aspect | Detail |
|--------|--------|
| **Population mechanism** | **`engine/seed-subnational-jurisdictions.cjs`** builds **85** rows from inline arrays (US 51 incl. DC, CA 13, AU 8, UK 13). |
| **`dataStatus`** | Seed sets **`seed_static`** (`DATA_STATUS_SEED`). |
| **`source_name` / `source_url`** | Points at Civic Voice curated seed / migration doc (metadata), **not** live external APIs. |
| **`last_updated`** | ISO timestamp **at seed run time** for each write. |
| **`officialWebsite`** | Typically **`null`** in seed payload (`officialWebsite: null` in builder). |
| **Scheduler** | **`uploadAll`** in `civic-voice-engine/src/firebase/uploader.js` lists many collections; **`subnational_jurisdictions` is not among them.** |

**Evidence of completeness (committed artifact):**  
`docs/SUBNATIONAL_JURISDICTIONS_SEED_VALIDATION_REPORT.md` (generated **2026-05-08T22:40:27.652Z**) reports **PASS**: **85** docs, breakdown US 51 / CA 13 / AU 8 / UK 13, no duplicate IDs, required fields present, alias expectations met.

### 1.2 Hardcoded — `App.js` (and inline helpers)

| Construct | Role |
|-----------|------|
| **`CANADA_PROVINCE_TERRITORY_NAMES_REGION_GATE`** | 13 Canada names for voting gate + `getRegionCountry`. |
| **`getProvincialData`** | Large **`usStates`** / **`canadianProvinces`** objects: governors/premiers, bios, lieutenant governors, **`population`**, **`flagFiles`**, party splits via **`getLegislatureComposition`**. |
| **`getAustralianStateData`** | Eight AU jurisdictions with leaders, bios, **`legislature`** seat splits, derived **`flagUrl`**. |
| **`englandRegions`** | Nine England regions + rich narrative/economic/council content. |
| **Location gate** | Inline **50** US state names (Firestore seed has **51** incl. DC — **product mismatch** documented elsewhere). |

These are **editorial / illustrative** for UI richness; they are **not** synced from `subnational_jurisdictions` today.

### 1.3 Engine — what can already fetch or generate

| Capability | Reality |
|------------|---------|
| **Reference subnational catalog** | **Generate**: only via **seed script** (static data). **No** separate ingestion module found under `civic-voice-engine` that builds `subnational_jurisdictions` from APIs. |
| **Population / governors / websites for Firestore** | **Phase 3B** (`enrich-subnational-jurisdictions-phase3b`) is **proposal-only**; **no `engine/enrich-subnational-jurisdictions-phase3b.cjs`** in repo at audit time. |
| **`npm run upload:firebase`** | Uploads bills, members, budget/analytics, etc. — **not** `subnational_jurisdictions`. |

### 1.4 Scripts / jobs responsible

| Script / command | Location | Writes `subnational_jurisdictions`? |
|------------------|----------|-------------------------------------|
| **`seed:subnational-jurisdictions`** | `civic-voice-engine/package.json` → `../civic-voice-app/engine/seed-subnational-jurisdictions.cjs` | **Yes**, with **`--write`** (merge `set`). Default dry-run. |
| **`validate:subnational-jurisdictions`** | Same app `engine/` folder | **Read-only**; regenerates validation markdown report. |
| **`upload:firebase`** | `civic-voice-engine/src/uploadToFirebase.js` | **No** |
| **Scheduler** (`scheduler.js` typical flows) | Uses uploader modules for operational collections | **No** subnational seed wired in `uploadAll` |

---

## 2. Freshness — `subnational_jurisdictions`

The validator **`validate-subnational-jurisdictions.cjs`** checks presence of **`last_updated`** and counts but does **not** compute **min/max** `last_updated` or empties across the collection.

### 2.1 What this audit can state from repo artifacts

| Metric | Value |
|--------|--------|
| **Latest seed validation report time** | Report header: **2026-05-08T22:40:27.652Z** (when validator last ran successfully and wrote the doc). |
| **Firestore min/max `last_updated`** | **Not recorded** in repo—requires a **read-only** Admin query or extending the validator. |

### 2.2 Records missing `last_updated`

Per validator **`REQUIRED_FIELDS`**, **`last_updated`** is mandatory for PASS. The last committed report shows **0** required-field issues ⇒ **no docs missing `last_updated`** at validation time.

### 2.3 `dataStatus`

Seed sets **`seed_static`** for all seeded rows. Expect **uniform `dataStatus`** unless manually patched in Firestore.

### 2.4 Stale vs current (conceptual)

| Interpretation | Assessment |
|------------------|------------|
| **Timestamps** | `last_updated` reflects **last seed/merge write**, not “Census release date” or “election night”. |
| **Semantic accuracy** | Leadership and populations in Firestore **do not auto-track** real-world changes—those fields are either absent or static reference unless manually enriched. |

**Conclusion:** Data can be **structurally complete** but **semantically stale** for demographics/leadership **unless** enriched by a future Phase 3B job or manual edits.

---

## 3. Completeness — record counts

Expected and validated (last PASS report):

| Region | Expected | Reported |
|--------|----------|----------|
| US (50 states + DC) | 51 | 51 |
| Canada (10 + 3) | 13 | 13 |
| Australia (6 + 2) | 8 | 8 |
| UK (4 nations + 9 England regions) | 13 | 13 |
| **Total** | **85** | **85** |

---

## 4. Field coverage — baseline seed schema

Validator requires these keys on every document (each must exist as a field):

`id`, `country`, `countryName`, `jurisdictionType`, `name`, `abbreviation`, `slug`, `aliases`, `capital`, `leaderTitle`, `legislatureName`, `officialWebsite`, `source_name`, `source_url`, `last_updated`, `dataStatus`.

**Last validation:** **0** missing-field issues ⇒ **100% coverage** of this required set.

**Semantic notes:**

- **`leaderTitle`** is a **generic role label** from seed logic (e.g. Governor, Premier), **not** the named officeholder.
- **`legislatureName`** is a **constructed string** (e.g. `${name} Legislature`), not scraped from parliament sites.
- **`officialWebsite`** may be **`null`**—field exists but value empty.

---

## 5. Rich fields (if present)

These are **not** part of the seed **`REQUIRED_FIELDS`** list in `validate-subnational-jurisdictions.cjs`. Any presence would be **ad hoc** manual merges or future enrichment.

| Field | Expected in current seed-driven corpus |
|-------|----------------------------------------|
| `leader_name`, `leader_party`, `leader_since` | **Unlikely** unless manually added |
| `population_raw`, `population_display` | **Unlikely** unless manually added |
| `legislatureWebsite` | **Not in seed script** at audit time → **missing** unless merged separately |
| `legislature_party_breakdown` | **Not in seed** |
| `flag_image_url` | **Not in seed** |

**Verification:** Grep seed builder (`seed-subnational-jurisdictions.cjs`) — enrichment keys are **not** emitted by default.

---

## 6. Engine readiness — refresh capabilities

### 6.1 Does the engine already refresh population / leaders / websites into Firestore?

**No automated pipeline** in **`civic-voice-engine`** was found that:

- fetches Census / StatCan / ABS / ONS population into `subnational_jurisdictions`, or  
- fetches governor/premier rosters into that collection, or  
- maintains `legislatureWebsite` / party breakdowns.

### 6.2 What exists today

| Item | Script name | Source/API | Collection(s) | Merge-only | Safe to run | Preserves extra fields |
|------|-------------|------------|-----------------|------------|-------------|-------------------------|
| Subnational **seed** | `seed-subnational-jurisdictions.cjs` | **Static** arrays in repo | `subnational_jurisdictions` | **Yes** (`set` + merge) | **Yes** (non-destructive merge; no deletes in script) | **Yes** — updates seed-defined keys; does not strip unknown keys |
| Subnational **validate** | `validate-subnational-jurisdictions.cjs` | Firestore read | *(report only)* | N/A (read-only) | **Yes** | N/A |
| Default Firebase upload | `uploadToFirebase.js` → `uploadAll` | Various processors | **Other** collections | Generally merge patterns in uploader | **Yes** with credentials | Per-function |
| Phase 3B enrich | *Not implemented* | Planned official/curated mix | `subnational_jurisdictions` | Planned merge | N/A | Planned |

**Safety:** Seed script uses **batch merge writes**; documentation states **no deletes**. Re-running updates **`last_updated`** and any seed field that changed in repo.

---

## 7. Gap report

| Field / topic | Current coverage | Source | Freshness | Action needed |
|---------------|------------------|--------|-----------|---------------|
| Core reference fields (id, country, name, abbrev, slug, aliases, capital, types) | Full (validator PASS) | Static seed | Tied to last `--write` | **no action** (unless correcting seed data) |
| `leaderTitle`, `legislatureName` | Present (generic strings) | Static seed | Same as seed run | **no action** for thin reference |
| `officialWebsite` | Often **null** | Seed | N/A | **needs source** (Phase 3B or manual) |
| `leader_name`, `leader_party`, `leader_since` | **Absent** in seed | N/A | N/A | **future v2** / Phase 3B |
| `population_raw` / `population_display` | **Absent** in seed | N/A | N/A | **future v2** / Phase 3B |
| `legislatureWebsite` | **Absent** | N/A | N/A | **future v2** / Phase 3B |
| `legislature_party_breakdown` | **Absent** | N/A | N/A | **future v2** |
| Rich UI (bios, seat charts, UK regions narrative) | **App.js only** | Hardcoded | Manual product updates | **needs manual review** when migrating; **no action** if keeping hardcoded |
| Live min/max `last_updated` in Firestore | Not in repo | Firestore | Unknown without query | **needs manual review** — extend validator or one-off read |

---

## 8. Recommendations

### Is current Firestore data accurate enough for v1 **thin** use (identity, geography, typing)?

**Yes**, given the last **PASS** validation report and static canonical design—subject to product accepting **`officialWebsite: null`** and generic legislature strings.

### Is the issue “engine not run recently”?

**Only partly.**

- Running **`npm run upload:firebase`** does **not** touch `subnational_jurisdictions`.
- Running **`npm run seed:subnational-jurisdictions -- --write`** (with credentials) **re-applies static seed** and refreshes **`last_updated`**—useful after **editing the seed file**, **not** equivalent to fetching latest census or governors.

So: **staleness of timestamps** can be fixed by re-seeding; **staleness of real-world facts** (populations, who is governor) **requires Phase 3B enrichment or continued reliance on hardcoded `App.js` data.**

### Which existing command should be run to “refresh” the Firestore reference rows?

Use (from **`civic-voice-engine`** directory, with scheduler `.env`):

```bash
npm run seed:subnational-jurisdictions -- --write
npm run validate:subnational-jurisdictions
```

**Not** sufficient alone for population/leader parity—**no script exists yet** for that in-repo automated form beyond Phase 3B proposal.

### What should not be touched?

- **Do not delete** hardcoded `App.js` jurisdiction blobs until a approved migration.
- **Do not delete** Firestore documents.
- **Do not assume** `upload:firebase` refreshes subnational data.

---

## Follow-ups (optional, non-blocking)

1. **Extend** `validate-subnational-jurisdictions.cjs` to append **min/max `last_updated`**, **count missing `last_updated`**, and **`dataStatus` histogram** to the report (read-only).
2. **Document** after each production seed run the validation report timestamp for ops traceability.

---

*Audit based on repository contents at authoring time. Live Firestore may differ; re-run `validate:subnational-jurisdictions` with credentials for authoritative current state.*
