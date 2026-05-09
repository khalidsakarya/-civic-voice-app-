# Subnational jurisdiction data model (US / CA / UK / AU)

**Purpose:** Record how subnational data is **actually implemented** in this repo today, how it lines up with your **already-designed** canonical model (IDs, types, metadata fields), and whether that implementation is **structurally sound** for a future **Firestore + engine** pipeline—without rebuilding lists or changing UI in this document.

**Scope:** Structural audit + inventory + reference schema (§3–§8). **No code or UI changes** are implied by this file alone unless you explicitly approve implementation work.

---

## Clarification: what “unify” means (code vs product)

> **Unification means code-level adapter/helper unification, not product/UI behavior unification.**

**Product / UX (unchanged intent):**

- Each country stays **separate** in the app: **US**, **Canada**, **UK**, and **Australia** remain distinct surfaces and flows.
- There is **no** goal to merge countries visually, collapse navigation into one “world” picker, or alter user journeys for the sake of shared code.

**Engineering intent (future, optional):**

- **Reduce duplicated logic** by introducing **shared adapters/helpers** only where they are **behavior-preserving** (same inputs → same outputs → same UI).
- **Country-specific raw data** stays where it is today (`App.js` blobs, country-specific render paths, etc.); a shared layer would **read** that data and return a **normalized shape** for internal reuse—not replace country-specific screens.

**Preferred pattern (example, not implemented until approved):**

- Something like `getSubnationalJurisdictions(countryCode)` that returns a normalized structure **only if** every consumer can be wired without changing observable behavior.

**Hard rules (until you approve otherwise):**

1. **No UI behavior changes** when introducing helpers.
2. **No deletion** of existing country-specific data.
3. **No new Firestore collection** for this effort.
4. **No live-data migration** yet.
5. **No big refactor**—small, reviewable slices only.
6. **Identify safe opportunities first**; implement shared code only after explicit approval.

**Doc-only checklist for future “safe dedup” passes** (no code changes implied):

- Repeated **`switch (country)` / jurisdiction** branching that could call one adapter per country.
- Repeated **subnational list** handling (e.g. parallel patterns across tax calculators vs gates vs cards).
- Repeated **label / slug / code** formatting (string normalization, display names).
- **Card/list rendering** patterns duplicated across countries that could share a presentational helper **without** changing markup or props semantics.
- **Pure helpers** (sorting, lookup maps, alias resolution) that are identical across countries.

**Approved example** (behavior-preserving dedup):

- Canada province/territory name list used by `getRegionCountry` and `renderLocationGateModal` was deduplicated into one shared constant (`CANADA_PROVINCE_TERRITORY_NAMES_REGION_GATE` in `src/App.js`).
- No UI behavior changed.
- Same labels, same order, same classification behavior.
- Raw country-specific data remained in place.

**Do not change app code** for subnational unification until this document’s gates and your explicit approval are satisfied.

---

**Gates (do not break):**

- **Do not delete** existing hardcoded arrays/objects until a live data path is validated (see `docs/FIRESTORE_INVENTORY_AUDIT.md` and, when available, `docs/FIRESTORE_INVENTORY_LIVE_REPORT.md`).
- **Do not add** a new Firestore collection for subnational data until you confirm no existing collection can hold or reference it (country-level `jurisdiction` docs, `elections`, `bills` fields, etc. — see §2).
- **Do not change** UI behavior in the same pass as this document.

---

## Structural audit of existing implementation

This answers: **Is the current setup structured properly and ready for live Firestore/engine data?** Verdict: **partially—good building blocks per country, but not one consistent cross-country structure yet.** Details below.

### 1. Overall structure

| Question | Finding |
|----------|---------|
| **US / CA / UK / AU handled consistently?** | **No.** Each country uses a different primary key pattern: US mixes **full name** (governors, legislature map, location gate) vs **USPS code** (tax `stateData`, some election rows); CA centers **rich objects** keyed implicitly by **`name`** (+ `flagCode: 'ca-xx'`); UK splits **England regions** (`englandRegions` with slug `id`) from **nation labels** on MPs (`region: 'Scotland'`); AU aligns **ISO-like codes** (`NSW`, …) with display names in one small map. |
| **IDs / codes / slugs consistent within repo?** | **Mixed.** CA/US governor-tier objects share a pattern (`name`, `capital`, `flagCode`) but **no explicit `id` field**. UK regions have stable **`id`** slugs (`north-east`, …) and **`abbr`** (`NE`, …). AU tax map keys match MP **`state`** fields. US lacks a single stable key on governor rows (derive from `name` or `flagCode`). |
| **Country codes `US` / `CA` / `UK` / `AU`?** | **Yes at Firestore/app jurisdiction level** (`where('jurisdiction', '==', 'US')`, etc.). Subnational blobs in `App.js` are **not** wrapped with a `country` field—they are implied by which render path or array you are in. |
| **Subnational types explicit (`state`, `province`, `region`, …)?** | **No.** Types are implied by context (e.g. Canadian territories use `premier` / `Consensus Government` like provinces). UK **England** cards are effectively **`region`**; MP **`region`** mixes **nation** names. Nothing in code labels `jurisdictionType`. |

**Bottom line:** The implementation is **usable for current screens** but **not yet normalized** to one cross-country structural contract.

---

### 2. Data normalization (naming conflicts)

| Conflict | Where it shows up | Risk |
|----------|-------------------|------|
| **Newfoundland and Labrador** vs **Newfoundland & Labrador** | Premier object uses **`&`** (`name: 'Newfoundland & Labrador'`, ~L12308); location gate / geo use **`and`** (~L34874, ~L5448, ~L5313); Senate rows use **`province: 'Newfoundland and Labrador'`** (~L1327+); `getLegislatureData` uses **`&`** (~L12859); provincial tax uses **`NL`** + display **`Newfoundland & Labrador`** (~L8235, ~L8348). | **Lookup joins fail** if code compares strings literally across features. |
| **District of Columbia** vs **Washington D.C.** | Tax `stateData.DC.name` is **`'Washington D.C.'`** (~L8559); area codes key **`'District of Columbia'`** (~L33095); governor list **omits DC**; legislature map **omits DC**. | Same entity **three representations**; DC **not in** 50-state flows. |
| **UK nations vs England regions** | `englandRegions` = **9 English regions** only (~L19693+). UK MP demo uses **`region: 'Scotland' \| 'Wales'`** (~L17609+). Tax dropdown uses **different English region labels** (`Yorkshire and The Humber` in tax ~L8955 vs cards may differ slightly). | **No unified UK subnational ID** across nation vs region vs tax UI. |
| **Australian abbreviations** | **`NSW`, `VIC`, `QLD`, `WA`, `SA`, `TAS`, `ACT`, `NT`** used consistently in AU tax `territories` (~L9318) and MP/senator **`state`** (~L1342+). | **Strongest consistency** of the four countries. |

**Aliases:** Today, **implicit** only (duplicate strings). There is **no** central alias map in code.

---

### 3. UI / data mapping (by country)

**Convention:** “Defined” = primary source object/array; “Uses” = screens or helpers.

| Country | Where defined | Screens / flows using it | Duplication / canonical source |
|---------|----------------|---------------------------|--------------------------------|
| **US** | `usStates` rich array (~L12349+); `stateData` tax (~L8508); `getLegislatureData().us` (~L12864); **second** `usStates` string array in `renderLocationGateModal` (~L34875); flags / area codes (~L12175+, ~L33068); geo heuristic (~L5328+) | Provincial/governor hub via `getProvincialData()` (~L12752+); US tax calculator; location voting gate; legislature breakdown | **Multiple inconsistent sources**: 50-state gate list copy-pasted vs governor array; tax adds **DC**; legislature omits DC; election fetcher mixes **2-letter** and **full** names |
| **CA** | Single rich `canadaProvinces` (~L12242+) inside same closure as US; **duplicate** string lists in location gate (~L34874) and `canadaRegions` for geo (~L5448); `getLegislatureData().ca` (~L12849); provincial tax uses **codes** (`NL`, … ~L8235+) | Same provincial hub; CA tax; location gate; geo region | **Canonical rich list** is `canadaProvinces`; string duplicates risk **drift** from `Newfoundland` naming |
| **UK** | `englandRegions` (~L19693+); `ukTaxRegion` + tax `regions` array (~L8953+); MP **`region`** strings | `uk-regions` / `uk-region-detail` views; UK tax modal; MP listings | **Three concepts**, no shared ID: England region cards vs tax region names vs MP nation |
| **AU** | Inline `territories` in AU tax (~L9318); senator/MP **`state`** fields (~L1342+) | AU tax; AU parliament demos | **Aligned** between tax map and member rows |

**Canonical source today:** **None globally.** Per feature, the relevant inline blob is the source of truth.

---

### 4. Firestore readiness

Evaluated against your target shape (stable **`id`**, **`country`**, **`jurisdictionType`**, provenance fields).

| Criterion | Ready? | Notes |
|-----------|--------|--------|
| **Stable ID per unit** | **Partial** | UK `englandRegions.id` is stable; AU codes stable; CA/US rich rows lack explicit **`id`**—only **`name`** / **`flagCode`** / tax keys. |
| **Country code on each unit** | **No** (in blobs) | Country is **contextual**, not a field on each row. |
| **`jurisdictionType`** | **No** | Not modeled in implementation. |
| **Aliases** | **Needed** | At minimum for **NL** naming and **DC** naming before strict joins. |
| **`source_name`, `source_url`, `last_updated`, `dataStatus`** | **No** | Editorial bios and stats have no provenance fields on objects. |

**Can it move to Firestore cleanly?** **Yes, with a mapping layer:** engine writes documents keyed by your canonical **`id`**; app reads and maps into existing props **until** UI is refactored. Without that layer, **string mismatches** (NL, DC) will break queries or merges.

**New collection later?** **Not proven required yet.** Options to validate first: **subcollection** under a small “reference” doc per country, or **embedded map** on an existing config/country doc—see `docs/FIRESTORE_INVENTORY_AUDIT.md` before inventing a top-level collection.

---

### 5. Engine readiness

| Criterion | Assessment |
|-----------|------------|
| **Upsert by deterministic ID** | **Possible once IDs exist.** Today engine would have to derive IDs from **country + name/code** rules you already designed; risk if NL/DC strings differ across pipelines. |
| **Official fields updated, editorial preserved** | **Not structured in data.** Bios and party splits sit in same objects as “facts.” You’d want **`editorial_*`** or **`enrichment`** vs **`official_*`** (or merge keys allowlisted in engine)—**not present** now. |
| **Consistent field names for sync** | **Weak across countries** (`province` vs `state` vs `region`; US full name vs abbreviation). A normalizer in engine should output **your canonical schema** regardless of source column names. |

---

### 6. Problems and recommendations (short report)

**Already good**

- **Australia:** Code-key alignment (tax + MPs) is the cleanest pattern in the app.
- **Canada / US governor-tier:** Rich objects (`name`, `capital`, `flagCode`, leadership) are a reasonable shape to **hydrate from Firestore** later without throwing away structure.
- **UK England regions:** Slug **`id`** on each region is **migration-friendly**.

**Inconsistent (standardize before relying on live data)**

- **Cross-country keys:** Introduce a single **canonical `id`** (your design) everywhere data crosses boundaries (Firestore, comparisons, analytics)—even if UI still shows local labels.
- **NL naming:** Pick one display string + **`aliases[]`** for lookups; fix comparisons without rewriting all bios at once.
- **DC:** Treat **`US-DC`** (or equivalent) as first-class in **all** US lists that claim completeness, or explicitly document “50 states only” vs “51 jurisdictions.”
- **UK:** Distinguish **`nation`** vs **`region`** in data model; link tax regions to **`englandRegions.id`** when you integrate live data.

**Can wait until v2**

- Full **territories** for US (PR, VI, …) unless product scope requires them.
- Localized display names (FR for Québec, etc.).
- Automatic **leader** sync from APIs (needs churn handling).

**Structural soundness summary**

- **Sound for current product:** Yes—the app works because each screen reads **its own** blob.
- **Sound for future Firestore/engine without refactors:** **Not yet**—needs **deterministic IDs**, **aliases**, **typed jurisdictions**, and ideally **separation of official vs editorial** fields **before** treating synced data as authoritative.

---

## 1. Existing locations in code (audit)

### 1.1 United States — states, DC, and territories

| Location in repo | What it is | Shape / keys | Notes & inconsistencies |
|------------------|------------|--------------|---------------------------|
| `src/App.js` — `usStates` (inline array, **~L12349+**) | 50 state objects for **Governors** cards | `name`, `capital`, `flagCode: 'us-xx'`, `governor`, `govParty`, bios | **50 states only** — no DC, no territories in this roster. |
| `src/App.js` — `renderLocationGateModal` (**~L34874–34876**) | Manual region picker for voting gate | `usStates` = array of **50 full state names** | Same 50-state list; **no DC / territories**. |
| `src/App.js` — `renderUsTaxFull` — `stateData` (**~L8508–8559**) | US state **income tax** brackets by state | Keys: `AL` … `WY`, plus **`DC`** for District of Columbia | **51 keys** (50 + DC). `DC` name: `'Washington D.C.'`. |
| `src/App.js` — `getLegislatureData` — `us` map (**~L12864–12915**) | Legislature name + **illustrative** party seat counts | Keys: full state names (`'Alabama'` … `'Wyoming'`) | **50 keys** — **no DC** in legislature map. |
| `src/App.js` — state flags / phone area codes (**~L12175+**, **~L33068+**) | `Flag_of_*.svg` map; area codes by state name | Full state names; includes **`'District of Columbia'`** in area-code map | DC appears in **area codes** but not in `usStates` governor list. |
| `src/App.js` — geo heuristic (**~L5328+**) | Maps lat/lon → rough **state name** | Returns strings like `'Texas'`, `'Alabama'` | Partial coverage; not a full geocoder. |
| `src/ingestion/electionFetcher.js` | Battlegrounds / polls | US: `region: 'AZ'` (2-letter), senate races use **`state: 'Arizona'`** (full name) | **Mixed:** 2-letter `region` vs full `state` string. |

**Summary (US):** The app uses **full state names** for governor cards and many maps, **2-letter USPS codes** for tax (`stateData` keys) and some election objects, and **includes DC in tax + area codes** but **not** in the 50-state governor roster. US **territories** (PR, VI, GU, AS, MP) are **not** represented in these core lists.

---

### 1.2 Canada — provinces and territories

| Location in repo | What it is | Shape / keys | Notes & inconsistencies |
|------------------|------------|--------------|---------------------------|
| `src/App.js` — `canadaProvinces` in `renderLocationGateModal` (**~L34874**) | 13 strings for manual region selection | Full names, includes **territories** | Order: alphabetical-ish; includes NWT, Nunavut, Yukon. |
| `src/App.js` — Canadian **premiers** data (precedes `usStates`, **~L12100–12347** area) | Per-province/territory premier cards | `name`, `capital`, `flagCode: 'ca-xx'`, `premier`, `party`, etc. | Canonical **13** subnational units (10 provinces + 3 territories). |
| `src/App.js` — `getLegislatureData` — `ca` (**~L12849–12862**) | Legislature labels + seat splits | Keys: **`'Ontario'`, `'Quebec'`, …**, **`'Newfoundland & Labrador'`** (ampersand) | **Naming mismatch:** gate list uses **`'Newfoundland and Labrador'`** (word “and”). |
| `src/App.js` — Canadian Senate / MP demo data | `province: 'Ontario'` etc. (**~L1222+**) | String **`province`** on person rows | Matches full names; must stay consistent with unified `name` / `abbreviation`. |

---

### 1.3 United Kingdom — nations, regions, devolution

| Location in repo | What it is | Shape / keys | Notes & inconsistencies |
|------------------|------------|--------------|---------------------------|
| `src/App.js` — `englandRegions` (**~L19693+**) | **9 English statistical regions** (NUTS-like) | `id` slug (`'north-east'`), `name`, `abbr` (**`NE`**, `NW`, …), `capital`, mayors, `councils[]` | **England only** — not Scotland/Wales/NI as first-class region cards in this array. |
| `src/App.js` — views `uk-regions` / `uk-region-detail` | Cards driven by **`englandRegions`** | `selectedUkRegion` holds full region object | **UK “regions” UI ≠ UK “countries”.** |
| `src/App.js` — `renderUkTaxFull` / `ukTaxRegion` (**~L2627**, **~L8954+**) | Tax calculator “England Region” dropdown | Region names: **`London`**, **`South East`**, … | **English regions** for copy — not the same IDs as `englandRegions` slugs. |
| `src/App.js` — UK MP demo data (**~L17609+**) | `region: 'Wales' \| 'Scotland'` etc. | Free-text **`region`** | Good hint for **nation-level** grouping; separate from `englandRegions`. |
| `src/App.js` — department name maps (**~L646+**) | Whitehall ↔ devolved government labels | Strings only | Useful display aliases only — not a jurisdiction registry. |

**Summary (UK):** The product mixes **(a)** nine **England** macro-regions with slug IDs, **(b)** optional **`region` text** on MPs for **Scotland/Wales/NI**, and **(c)** a separate **tax** region list. There is **no single unified UK subnational ID** today.

---

### 1.4 Australia — states and territories

| Location in repo | What it is | Shape / keys | Notes & inconsistencies |
|------------------|------------|--------------|---------------------------|
| `src/App.js` — `renderAuTaxFull` — `territories` (**~L9318–9327**) | Maps **ISO-like** codes to display names | `NSW`, `VIC`, `QLD`, `WA`, `SA`, `TAS`, **`ACT`**, **`NT`** | **8 entries** — standard states + ACT + NT. |
| `src/App.js` — AU senators / MPs (**~L1342+**, **~L1429+**) | `state: 'NSW'` etc. | 2–3 letter **`state`** | Consistent with `territories` keys. |
| `src/ingestion/electionFetcher.js` | AU election entries | May reference states in narrative | Secondary. |

---

## 2. Existing Firestore collections (subnational angle)

From `docs/FIRESTORE_INVENTORY_AUDIT.md` and spot checks in `src/App.js`:

- Most queried collections use **country-level** `jurisdiction` or `country` — e.g. `'US'`, `'CA'`, `'UK'`, `'AU'` — not a subnational primary key.
- **No dedicated Firestore collection** was identified in the inventory doc for “all provinces/states.” **Do not create one** until live audit proves need and no existing document shape can embed subnational metadata (e.g. nested map under a country doc, or fields on `elections` / `bills`).
- **Bill / member documents** may carry **state/province** as plain strings in-app or in ingested payloads; unifying those strings to this schema is a **later** normalization task.

---

## 3. Proposed unified schema (one object per subnational unit)

Canonical **document identity:** `id` = `{COUNTRY_ISO3166_1_ALPHA2}-{SUBCODE}`.

Recommended `SUBCODE` sources:

- **US:** USPS **2-letter** for states and DC (`CA`, `DC`). For territories, use **USPS / ANSI** style as used in federal data (e.g. `PR`, `VI`) — **do not invent**; align to Census / USPS when you add them.
- **CA:** Statistics Canada **province/territory code** (`ON`, `BC`, `NU`, …).
- **UK:** Use **distinct namespaces** in `id` to avoid colliding with US two-letter codes:
  - **Nations / NI:** `UK-SCT`, `UK-WLS`, `UK-NIR`, `UK-ENG` (types `nation` or `country_england` — see below).
  - **England regions (current app):** `UK-ENG-NE`, … or keep slug `UK-eng-north-east` — **pick one convention in implementation** and migrate labels only after consensus.
  - **Scotland/Wales/NI** should **not** be forced into “England regions” types.
- **AU:** ISO **ISO 3166-2:AU** codes (`NSW`, `VIC`, `ACT`, `NT`, …).

### 3.1 TypeScript-style shape (informative)

```ts
type JurisdictionType =
  | 'state'
  | 'province'
  | 'territory'
  | 'federal_district'
  | 'nation'
  | 'devolved_administration'
  | 'region';

type DataStatus =
  | 'official_live'           // synced from authoritative API/file with timestamp
  | 'cached_official'         // snapshot of official data
  | 'editorial_static'        // hand-maintained in repo
  | 'hardcoded_pending_live_sync'
  | 'deprecated';

interface SubnationalJurisdiction {
  id: string;                      // e.g. "US-CA", "CA-ON", "UK-SCT", "AU-NSW"
  country: 'US' | 'CA' | 'UK' | 'AU';
  countryName: string;
  jurisdictionType: JurisdictionType;
  /** Human-readable subnational name in English (localized names later if needed) */
  name: string;
  /** Short code: USPS / CA code / UK suffix / AU ISO 3166-2 */
  abbreviation: string;
  slug: string;                    // URL-safe, stable
  capital: string | null;
  population: number | null;
  areaKm2: number | null;
  leaderTitle: string | null;
  leaderName: string | null;
  leaderParty: string | null;
  legislatureName: string | null;
  officialWebsite: string | null;
  source_name: string | null;
  source_url: string | null;
  last_updated: string | null;   // ISO 8601
  dataStatus: DataStatus;
  /** Optional: tie-break when one entity carries two roles (e.g. Scotland as nation + devolved administration) */
  secondaryType?: JurisdictionType;
  /** Freeform notes for implementers (not shown in UI by default) */
  notes?: string;
}
```

### 3.2 Example rows (non-exhaustive)

| `id` | `country` | `jurisdictionType` | `name` | `abbreviation` |
|------|-----------|--------------------|--------|----------------|
| `US-CA` | US | state | California | CA |
| `US-DC` | US | federal_district | District of Columbia | DC |
| `CA-ON` | CA | province | Ontario | ON |
| `CA-NU` | CA | territory | Nunavut | NU |
| `UK-SCT` | UK | nation | Scotland | SCT |
| `UK-WLS` | UK | nation | Wales | WLS |
| `UK-NIR` | UK | nation | Northern Ireland | NIR |
| `AU-NSW` | AU | state | New South Wales | NSW |
| `AU-ACT` | AU | territory | Australian Capital Territory | ACT |

---

## 4. Country-specific mapping notes

### 4.1 United States

- **50 states** + **DC** should appear together anywhere we claim “complete US subnational coverage.”
- **Territories:** add only when product requires them; use **`jurisdictionType: 'territory'`** and official codes.
- Align **`abbreviation`** with **`stateData`** keys in `renderUsTaxFull` (`AL` … `WY`, `DC`).

### 4.2 Canada

- **13** entries: 10 provinces + 3 territories.
- Resolve **`Newfoundland and Labrador` vs `Newfoundland & Labrador`** — pick **one** display string and one **`slug`**; map legacy strings in code when touching data paths.

### 4.3 United Kingdom

- Treat **Scotland, Wales, Northern Ireland, England** as **`nation`** (England may double as parent for English regions).
- Treat **nine `englandRegions`** entries as **`region`** (or **`devolved_administration`** where combined authorities exist — product decision).
- Do not merge **English NUTS-style regions** with **UK nations** in one flat list without a **`parentId`** (optional future field) or clear `jurisdictionType`.

### 4.4 Australia

- Eight **`territories`** object entries match common federal practice (six states + ACT + NT).
- **`leaderTitle`**: often “Premier” (states), “Chief Minister” (ACT/NT) — official titles belong in **`official_live`** / **`cached_official`** updates.

---

## 5. Source-of-truth recommendation

| Layer | Role |
|-------|------|
| **Identifiers** | **`id`** / **`abbreviation`** aligned to **ISO 3166-2** (AU, UK subcodes), **USPS** (US), **StatCan codes** (CA). |
| **Official facts** (capital, area, population, official sites) | Ingest from **government open data** or official statistics APIs — store with **`source_*`** + **`last_updated`**. |
| **Political leadership** (governor/premier names, parties) | Changes frequently — prefer **scheduled ingest** or explicit editorial updates; mark **`dataStatus`** honestly. |
| **Current hardcoded `App.js` blobs** | Treat as **`editorial_static`** / **`hardcoded_pending_live_sync`** until a pipeline exists. **Keep them until Firestore (or other live source) is validated** end-to-end. |

---

## 6. Migration plan (hardcoded → validated live data)

**Phase A — No UI change**

1. Freeze **canonical ID scheme** (this document).
2. Build an internal map **in doc or codegen later**: legacy string → `SubnationalJurisdiction.id`.
3. Run **`npm run audit:firestore-inventory`** (when credentials available) and grep Firestore for **state/province/region** fields on real documents.
4. Decide **storage**: extend **existing** country-level docs vs new collection — **only after** inventory proves necessity.

**Phase B — Read path**

5. Add a **single loader** that prefers Firestore (or API) when present and falls back to **existing** hardcoded structures **without deleting them**.
6. Log / surface **`dataStatus`** in dev tools only if needed.

**Phase C — Write path / cleanup**

7. After coverage and QA, **reduce duplication** (one list instead of three for US state names).
8. Deprecate redundant keys only when **no screen** depends on the old shape.

---

## 7. Official / live vs editorial / static (field guide)

| Field group | Typical source | Notes |
|-------------|----------------|-------|
| `id`, `country`, `abbreviation`, `jurisdictionType`, `name`, `slug` | ISO / USPS / StatCan / ISO-3166-2 | Stable identifiers; rarely editorial. |
| `capital`, `areaKm2`, `population` (when used for facts) | Official stats bureaus | Version by **`last_updated`**. |
| `leaderName`, `leaderParty`, `leaderTitle` | News / official sites / parliament APIs | High churn; mark **`cached_official`** or **`editorial_static`**. |
| `legislatureName` | Official sites | Medium churn. |
| `economicSectors`, bios, “key facts” in `englandRegions` | **Editorial / illustrative** | Not suitable as legal/factual claims without sources. |

---

## 8. Do-not-break rule (summary)

1. **Keep** all current hardcoded state/province/region data **until** live sources are audited and a fallback strategy is tested.
2. **Do not** ship UI changes that rename regions or drop DC/territories without explicit product sign-off.
3. **Do not** create a new Firestore collection **before** `docs/FIRESTORE_INVENTORY_AUDIT.md` + (when run) live report prove no suitable existing collection or document shape.

---

*Last updated: repo scan of `civic-voice-app` (primarily `src/App.js` + `src/ingestion/electionFetcher.js`). Firestore subnational coverage requires `audit:firestore-inventory` on your project.*
