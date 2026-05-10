# Subnational Firestore parity audit

**Date:** 2026-05-10  
**Scope:** Doc-only audit of **what Firestore already overlays** vs **what remains hardcoded** for each subnational surface that uses `subnational_jurisdictions`. **No code changes** are implied here.

**Canonical merge logic:** `src/utils/mergeProvincialExplorerFirestore.js`  
**Fetch helper:** `src/firestore/fetchSubnationalJurisdictions.js`  
**Firestore record shape (typed):** same file — includes fields **not yet merged into UI rows** (e.g. `leaderTitle`, `legislatureName`).

---

## Summary table

| Flow | Firestore fields now used | Hardcoded fields still used | Can hardcoded identity fields be removed? | Blocking missing Firestore fields |
|------|---------------------------|-----------------------------|-------------------------------------------|-----------------------------------|
| **1. Location gate** | **`name` only** — used as **dropdown label** when fetch succeeds (paired with legacy **value** strings). | **Full identity for stored values:** `LOCATION_GATE_US_STATE_NAMES_FALLBACK`, `CANADA_PROVINCE_TERRITORY_NAMES_REGION_GATE`, `CANADA_LOCATION_GATE_ORDER_ABBR`; fetch gates require **50 US + 13 CA** rows with strict matching. | **Not yet.** Removing lists breaks **vote keys**, **`getRegionCountry`**, and any feature that compares **full legacy region strings** unless **stored values** migrate to stable IDs + mapping layer. | **Optional `slug` / canonical code** aligned with app storage; **alias table** for NL naming drift; **approval** to migrate persisted `localStorage` / vote IDs. |
| **2. US state explorer / detail** | **`capital`, `population_display`, `leader_name` → `governor`, `leader_party` → `govParty` + derived `partyShort` (R/D heuristic), `name` → `displayName`, `abbreviation` → `subnationalAbbreviation`, `jurisdictionType`, `officialWebsite`, `legislatureWebsite`, `id` → `subnationalId`, `country` → `subnationalCountry`.** | **`name`** (join key + `flagUrl(name)`), **`flagCode`**, **`flagUrl`** (Commons map), **`bio`**, **`since`**, **all Lt. Gov fields** (`ltGovTitle`, `ltGovernor`, `ltGovParty`, `ltGovSince`, `ltGovBio`), **`partyShort` fallback** when party string doesn’t match R/D heuristic. **Legislature chart:** `getLegislatureData(name)` — **separate hardcoded dataset**. **Modals** (economic / tax exempt / grants): **deterministic demo data** seeded from **`item.name`**. | **Only after** flags + bios + legislature + modal pipeline have replacements (see below). **Display name** can diverge from `name`; **`name` must stay** as merge join key until **`flagCode` / `id`** drives flags. | **`leader_bio`**, **`deputy_*`** (or Lt. Gov), **`legislature_parties` JSON** (seats + colors), **`flag_asset_url` or `wikimedia_file`**, **`party_short`**, **`in_office_since`**. **`leaderTitle` / `legislatureName` exist in Firestore but are NOT merged** in `mergeProvincialExplorerRow` today. |
| **3. Canada province explorer / detail** | Same identity/economy overlay as US except **`leader_name` → `premier`, `leader_party` → `party`** (no automatic **`partyShort`** update — see below). | **`name`, `flagCode`, `flagUrl`, `bio`, `since`, Lt. Gov / commissioner fields, `partyShort` entirely from hardcoded row.** **Legislature:** `getLegislatureData`. **Modals:** seeded from **`item.name`**. | **Same as US** — bios, deputy, legislature, flags, **`partyShort`** not in merge. | **`party_short`** or merge rule from `leader_party`; rest same family as US. |
| **4. Australia state / territory explorer / detail** | **`capital`, `population_display`, `leader_name` → `leader`, `leader_party` → `party`, `displayName`, `subnationalAbbreviation`, `jurisdictionType`, websites, `subnationalId`, `subnationalCountry`.** | **`name`** (join key), **`abbr`**, **`flagUrl`** (Commons map per state name), **`leaderTitle`** (Premier / Chief Minister), **`partyShort`** (badges / colors), **`since`**, **`bio`, `deputyTitle`, `deputy`, `deputyParty`, `deputySince`, `deputyBio`, entire `legislature` object** (name, seats, party breakdown). **Modals:** illustrative charts; disclaimers reference region. | **No** until deputy + legislature + bios + flags + title + partyShort covered in data or merge. | Deputy fields, legislature JSON, bios, **`leaderTitle`**, **`party_short`**, flag asset; **`leaderTitle` / `legislatureName` on FS docs not wired**. |
| **5. UK England region explorer / detail** | When **13 UK docs** present: **`capital`, `population_display`, `name` → `displayName`, `abbreviation` → `subnationalAbbreviation`, `jurisdictionType`, websites, ids; `leader_name` / `leader_party` only if `hasRegionalMayor`.** | **All rich editorial content:** **`emoji`, `gdpPerCapita`, `gdpTotal`, `unemployment`, `area`, `populationRaw`, `cities`, `economicSectors`, `keyFacts`, `councils`, `leaderTitle`, `leaderBio`, `subMayors`, `hasRegionalMayor` gate, `leaderSince`, party colors.** **`legislatureByRegion`** (illustrative seat split). **UK modals:** RNG seeded from **`r.name`** (stable demo). | **`name` / `id` slugs** still anchor UI keys and legislature map; **cannot remove** rich blobs without **engine-authored** replacement content. | **`leader_bio`**, structured **mayor** vs **sub-mayor**, **GDP/stats**, **council lists**, **sector charts**, **legislature_seats** JSON; policy on **England / UK-ENG** leader fields vs Westminster. |

---

## Focus checks (yes / no)

| Item | US / CA provincial | AU | UK regions |
|------|-------------------|-----|------------|
| **Flags** | Hardcoded **Wikimedia filename map** + `flagUrl(name)` — **not** from Firestore | Hardcoded **per-state** Commons filenames | **Emoji** in card data — **not** from Firestore |
| **Leader bio** | Hardcoded **`bio`** | Hardcoded **`bio`** | Hardcoded **`leaderBio`** / **`leaderBio`-style copy** |
| **Deputy / Lt. Gov** | Hardcoded **`ltGov*` / commissioner** | Hardcoded **`deputy*`** | **Sub-mayors** + structure when no regional mayor — **hardcoded** |
| **partyShort** | US: **derived** from `leader_party` when possible; **fallback** hardcoded. CA: **hardcoded only** (merge does not set `partyShort`) | **Hardcoded** (`partyShort` drives badges) | N/A (uses **`leaderParty`** / gray badge paths) |
| **Legislature seat breakdown** | **`getLegislatureData(provinceOrStateName)`** — not Firestore | **`legislature` on row** — hardcoded object | **`legislatureByRegion[r.id]`** — hardcoded |
| **UK GDP / unemployment / cities / sectors / councils / facts** | N/A | N/A | **All hardcoded** on each region object |
| **Modal-specific copy** | **Deterministic generators** + disclaimers; seed **`item.name`** / **`r.name`** | Same pattern | UK economic / tax / grants modals — **illustrative**; seed **`r.name`** for stable RNG |

---

## Firestore fields present in schema but not overlaid by merge helpers

The normalized client record includes **`leaderTitle`** and **`legislatureName`** (`fetchSubnationalJurisdictions.js`). Current merge functions **do not copy** these onto explorer rows, so the UI still uses **hardcoded titles** (e.g. AU `leaderTitle`, UK `leaderTitle`, US/CA fixed “Governor” / “Premier” in list/detail).

---

## What can be safely removed later (when data + UI agree)

- **Redundant display strings** where Firestore **`name` / `population_display` / `capital`** are authoritative and **merged**, *after* QA that labels match product intent (including CA/US **`displayName`** vs flag **`name`** key).
- **Duplicate “identity-only” copies** of province/state lists **only after** a **migration path** for **location gate values**, **votes**, and **geo heuristics** that still expect legacy strings.
- **`partyShort` for US** could shrink to **fallback-only** if **`leader_party`** is always parseable (fragile for third-party / independent governors).

---

## What cannot be removed yet

- **Flags / emoji paths** (no `flag_url` in merge; UK uses emoji).
- **All long-form bios** (governor, premier, deputy, AU leader/deputy, UK mayor bios).
- **Lt. Gov / deputy / sub-mayor** structures.
- **Legislature composition** (US/CA `getLegislatureData`; AU `legislature`; UK `legislatureByRegion`).
- **Canada `partyShort`** until merge or Firestore provides **`party_short`**.
- **AU `partyShort`** (badges / party color map).
- **UK regional economics, councils, sectors, facts, mayor narrative** — entire curated layer.
- **Modal demo datasets** — unless replaced by real APIs or engine-fed snapshots (product decision).

---

## What the engine / data model still needs before “full hardcoded deletion”

1. **Stable IDs** end-to-end (already partially on docs: **`id`**, **`slug`**, **`abbreviation`**) + **app storage migration** off plain English names where needed.
2. **Rich text or referenced bios** for leaders and deputies (`leader_bio`, `deputy_bio` or CMS IDs).
3. **Structured legislature** — e.g. `legislature: { name, totalSeats, parties: [{ name, seats, color }] }` or normalized child collection.
4. **Flag assets** — URLs or Wikimedia file keys **validated** per jurisdiction.
5. **Party abbreviation** — explicit field per country rules (CA/AU especially).
6. **UK-only:** regional **stats**, **council lists**, **sector breakdowns**, and clear rules for **England region** leadership vs national proxies.

---

## Recommended next small migration step

**Wire existing Firestore fields that are already seeded but unused in the merge layer:** add optional overlay of **`leaderTitle`** and **`legislatureName`** (subnational legislature label only — not seat counts) into **`mergeProvincialExplorerRow`** / **`mergeAustralianExplorerRow`** / **`mergeUkEnglandRegionRow`** behind the same **parity gates** already used for fetch success — **without** removing hardcoded fallbacks. That improves parity incrementally and validates schema usage before larger rich-content migrations.

---

## References (code)

| Area | Location |
|------|----------|
| Merge helpers | `src/utils/mergeProvincialExplorerFirestore.js` |
| Provincial overlay wiring | `getProvincialData` in `src/App.js` (~`12410`+) |
| Location gate pairs | `src/App.js` (~`3079`–`3147`, ~`35197`–`35203`) |
| AU overlay | `getAustralianStateData` in `src/App.js` (~`23581`+) |
| UK overlay | `getEnglandRegionsExplorerRows` in `src/App.js` (~`20367`+) |
| Legislature hardcoded US/CA | `getLegislatureData` in `src/App.js` |
| Seed script | `engine/seed-subnational-jurisdictions.cjs` |
