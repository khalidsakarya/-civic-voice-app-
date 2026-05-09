# Subnational jurisdictions → Firestore (migration plan)

**Architecture:** Engine → Firestore → App (read path adds fallback until parity).

**Reference docs:** `docs/SUBNATIONAL_DATA_MODEL.md`, `docs/FIRESTORE_INVENTORY_AUDIT.md`.

**Constraints:**

- Do **not** remove hardcoded data until Phase 5 criteria are met.
- Do **not** change UI behavior during Phase 1–2 (audit / proposal) or during seed-only Phase 3.
- Migrate **one UI path at a time** in Phase 4.

---

## Phase 1 — Audit (complete)

### Summary

| Area | Finding |
|------|---------|
| **Primary codebase** | `src/App.js` (large inline blobs); minor references in `src/ingestion/electionFetcher.js`. |
| **Firestore today** | `docs/FIRESTORE_INVENTORY_AUDIT.md` lists **no** collection whose purpose is a **canonical subnational reference**. Country-level `jurisdiction` (`US`, `CA`, `UK`, `AU`) appears on many collections; occasional **state/province strings** may appear **inside** documents (e.g. bills, members)—those are **not** a substitute for a unified jurisdiction catalog with deterministic IDs and aliases. |
| **Engine today** | No dedicated subnational sync module located under `civic-voice-engine` (grep); ingestion remains separate from this migration until Phase 3. |

---

### 1. Where hardcoded data lives & what uses it

#### United States — states / DC / territories

| Location (file) | Construct | Scope | Screens / flows |
|-----------------|-----------|-------|-----------------|
| `src/App.js` | `usStates` (rich objects inside `getProvincialData`) | **50 states** — no DC, no territories | **`view === 'provincial'`** — provincial/state hub cards (`getProvincialData`, legislature breakdown via `getLegislatureData`) |
| `src/App.js` | `stateData` in `renderUsTaxFull` | **50 states + DC** (keys `AL`–`WY`, `DC`; DC display name “Washington D.C.”) | **`us-tax-full`** — US combined tax calculator |
| `src/App.js` | `getLegislatureData` → `us` map | **50 states** by **full name** — no DC | Same provincial hub / legislature UI blocks |
| `src/App.js` | Inline **50 state names** in `renderLocationGateModal` | 50 strings | Location voting gate (manual US region) |
| `src/App.js` | `flagFiles` / flag URL map | State names (+ Canadian provinces) | Provincial hub flags |
| `src/App.js` | Area-code map (`'District of Columbia'`) | DC + states | Phone / area-code style demo content |
| `src/App.js` | Geo heuristic (`lat`/`lon` → state name) | Partial US + CA | Region detection for voting / eligibility-style flows |
| `src/ingestion/electionFetcher.js` | Polls / battlegrounds | Mix of **`region: 'AZ'`** and **`state: 'Arizona'`** | Elections-related ingestion surfaces (not necessarily same as Firestore-backed election UI) |

**Territories (PR, VI, GU, AS, MP):** Not represented in the core US governor/tax/gate lists above.

---

#### Canada — provinces / territories

| Location | Construct | Screens / flows |
|----------|-----------|-----------------|
| `src/App.js` | `canadaProvinces` rich array (`getProvincialData`) | **`provincial`** hub when Canada selected |
| `src/App.js` | `CANADA_PROVINCE_TERRITORY_NAMES_REGION_GATE` (module constant) | `getRegionCountry`; **`renderLocationGateModal`** (manual Canada list) |
| `src/App.js` | `provData` in `renderCaTaxFull` | **`ca-tax-full`** — provincial brackets keyed by `AB`, `BC`, … |
| `src/App.js` | `PROV_SPLITS` (+ duplicate province dropdown in simplified CA tax UI ~L28893+) | **`ca-tax-calculator`** / categories-style CA tax flows using `caTaxProvince` |
| `src/App.js` | `getLegislatureData` → `ca` map | Provincial hub legislature strip |
| `src/App.js` | Geo heuristic (returns province names incl. `Newfoundland and Labrador`) | Region detection / classification |
| `src/App.js` | Demo senators: **`province: '…'`** | Senate / parliament illustrative lists |

---

#### UK — nations / regions

| Location | Construct | Screens / flows |
|----------|-----------|-----------------|
| `src/App.js` | `englandRegions` (9 regions: `id`, `name`, `abbr`, stats, mayors, `councils`, …) | **`uk-regions`**, **`uk-region-detail`** (+ related modals tied to `selectedUkRegion`) |
| `src/App.js` | `regions` array in `renderUkTaxFull` + `ukTaxRegion` state | **`uk-tax-full`** — England-region dropdown for tax copy |
| `src/App.js` | `legislatureByRegion` (keys: `'north-east'`, `'london'`, …) | **`uk-region-detail`** party/seat illustrative blocks |
| `src/App.js` | UK MP demo **`region`** (`Scotland`, `Wales`, etc.) | UK MP listing cards |
| `src/App.js` | Whitehall ↔ devolved label maps (~L646+) | Department / transparency strings — **not** a jurisdiction index |

**Note:** UK tax regions use **labels** (e.g. `Yorkshire and The Humber`) that must align to **`englandRegions`** via **`aliases`** or explicit **`slug`** when syncing.

---

#### Australia — states / territories

| Location | Construct | Screens / flows |
|----------|-----------|-----------------|
| `src/App.js` | `territories` map (`NSW` → full name) in `renderAuTaxFull` | **`au-tax-full`** |
| `src/App.js` | Senator / MP **`state: 'NSW'`** etc. | AU parliament demo sections |
| `src/ingestion/electionFetcher.js` | Narrative / structured AU entries | Secondary |

---

### 2. Fields required by UI (minimum by feature)

These are **what the UI reads today**—Firestore should be able to **populate or map** into these shapes during Phase 4 (plus your canonical extras).

| Feature | Required inputs (conceptual) |
|---------|------------------------------|
| **US provincial / governor hub** | Per unit: `name`, `capital`, leadership (`governor`, `govParty`, `partyShort`, `since`, bios, lt gov fields), `flagCode` / flag URL mapping |
| **US tax full** | Per USPS code: `name`, `brackets`, `stdDed` |
| **US location gate** | Ordered list of **display names** (50 states today) |
| **CA provincial hub** | Same richness as US but premier-centric (`premier`, `party`, …) |
| **CA tax** | Per province code: `name`, tax math fields (`brackets`, `bpa`, …); spending split: `prov`, `mun`, display `name` |
| **CA gate / `getRegionCountry`** | Canonical **full names** list (13) |
| **UK regions** | Per region: `id`, `name`, `abbr`, headline stats, mayor fields, `councils[]`, narrative arrays |
| **UK tax** | Dropdown labels for English regions |
| **AU tax** | Code → display name; salary breakdown |

**Firestore “basics” Phase 2 fields** (`name`, `abbreviation`, `aliases`, `capital`, `leaderTitle`, `legislatureName`, …) cover **reference** needs; **tax brackets**, **bios**, **council lists**, and **illustrative seat splits** are **editorial or derived**—either stay hardcoded longer, live in **separate merge-safe fields** (e.g. `editorial_*`), or sync from dedicated sources later.

---

### 3. Existing Firestore collections — do they hold this catalog?

Per **`docs/FIRESTORE_INVENTORY_AUDIT.md`**: inventory covers **`bills`**, **`elections`**, **`members`**, **`congress_members`**, **`government_contracts`**, etc.—all **country- or entity-scoped**, not a **complete keyed list** of US states + CA provinces + UK nations/regions + AU states.

| Question | Answer |
|----------|--------|
| Is there a **reference** collection for subnational units today? | **Not listed** in the audit as such. |
| Could **one row per country** embed all units? | Possible but **heavy**, awkward for queries/indexes and merge tooling; possible **v2** alternative to `subnational_jurisdictions`. |
| Do **transactional** docs reuse stable subnational IDs today? | **No**—mostly raw strings. |

---

### 4. Is a new collection justified?

**Yes, recommended** for Phase 2–4 **if** you want:

- Deterministic doc IDs (`US-CA`, `CA-ON`, …).
- **`aliases`** for NL / DC / UK tax label alignment.
- **`source_*`**, **`last_updated`, `dataStatus`** without overloading **`elections`** or **`bills`**.

**Preferred name:** `subnational_jurisdictions` (top-level), unless you later choose a **subcollection** under a config doc—either way, **approve explicitly** before creating in production.

---

## Phase 2 — Firestore source of truth (proposal — pending approval)

**Collection:** `subnational_jurisdictions` (if no existing collection adopted).

**Document ID:** deterministic string equals **`id`** field (e.g. `US-CA`, `US-DC`, `CA-ON`, `UK-SCT`, `UK-ENG`, `UK-ENG-NE` or slug variant—**finalize UK England region ID scheme** before seed).

**Required fields (per doc):**

- `id`, `country`, `countryName`, `jurisdictionType`, `name`, `abbreviation`, `slug`, `aliases` (array)
- `capital`, `leaderTitle`, `legislatureName`, `officialWebsite`
- `source_name`, `source_url`, `last_updated`, `dataStatus`

**Merge semantics (for Phase 3 script):**

- **`set` with merge** on official/reference fields from Engine.
- Preserve **`editorial_*`** or user-defined enrichment keys **not** in the seed allowlist (exact key policy TBD at script approval).

**Indexes:** likely `country` + `slug` or `country` + `abbreviation` for App queries—confirm after first query shape in Phase 4.

---

## Phase 3 — Engine seed/sync script (proposal only)

**Status:** Proposal only. **Do not run writes yet.**

### 3.1 Firestore target

- Collection: **`subnational_jurisdictions`**
- Document path pattern: `subnational_jurisdictions/{id}`

### 3.2 Deterministic IDs

- ID must be deterministic and equal to the `id` field.
- Examples (non-exhaustive):
  - `US-CA`, `US-NY`, `US-DC`
  - `CA-ON`, `CA-QC`, `CA-NU`
  - `UK-SCT`, `UK-ENG`, `UK-WLS`, `UK-NIR` (plus England-region IDs once finalized)
  - `AU-NSW`, `AU-ACT`, `AU-NT`

### 3.3 Seed data source (Phase 3 scope)

- Seed source is **curated/static canonical data from this repo**, not live external APIs.
- Initial extraction/mapping comes from current hardcoded sources in `src/App.js` and documented normalization rules in `docs/SUBNATIONAL_DATA_MODEL.md`.
- This is intentional for first write safety and behavior parity.

### 3.4 Required document fields

Each seeded/updated document must include:

- `id`
- `country`
- `countryName`
- `jurisdictionType`
- `name`
- `abbreviation`
- `slug`
- `aliases`
- `capital`
- `leaderTitle`
- `legislatureName`
- `officialWebsite`
- `source_name`
- `source_url`
- `last_updated`
- `dataStatus`

### 3.5 Merge / preservation behavior

- Use Firestore **merge writes** (`set(..., { merge: true })`).
- **Never delete** existing records in this phase.
- Preserve editorial/custom fields by updating only the approved seed field set.
- If a document already exists, only seed fields are refreshed; non-seed fields remain untouched.

### 3.6 Validation and dry-run output (before any write)

Script must support a default **dry-run** mode that reports:

- Total records parsed from seed source
- Records to create vs records to update
- Country breakdown (`US`, `CA`, `UK`, `AU`)
- Duplicate IDs detected in seed
- Missing required fields (with record IDs and field names)
- Sample output records (e.g., first 5 per country or fixed sample set)
- Proposed write summary with **no Firestore mutations**

### 3.7 Safety controls

- Default mode: **dry-run**
- Writes only happen with explicit flag: **`--write`**
- Optional safety prompt/guard (recommended): require both `--write` and `--confirm` in production context
- Script should log a clear banner:
  - Dry-run: `NO WRITES PERFORMED`
  - Write mode: `WRITES ENABLED (merge only, no deletes)`

### 3.8 Acceptance gate for moving from proposal to implementation

- No Firestore writes occur until dry-run output is reviewed and approved.
- First implementation step after approval is script creation + dry-run execution only.
- Actual write run is a separate explicit approval.

**Implementation:** `engine/seed-subnational-jurisdictions.cjs` · `npm run seed:subnational-jurisdictions`  
**Pre/post checklist:** `docs/SUBNATIONAL_JURISDICTIONS_SEED_VALIDATION.md`  
**Post-write report (read-only):** `npm run validate:subnational-jurisdictions` → `docs/SUBNATIONAL_JURISDICTIONS_SEED_VALIDATION_REPORT.md`

---

## Phase 4 — App migration

**Status:** After Firestore is populated.

- One feature path at a time: **Firestore first**, **hardcoded fallback**.
- Optional badge: “Cached official / source-backed data.”
- Compare output to hardcoded path before flipping defaults.

---

## Phase 5 — Remove hardcoded

Only when:

- Coverage complete for that feature’s jurisdiction set.
- UI parity and empty/error states tested.
- Stakeholder sign-off per country/feature.

---

*Phase 1 audit reflects repository scan of `civic-voice-app` aligned with `SUBNATIONAL_DATA_MODEL.md`. Line numbers in older docs may drift—prefer grep/symbols when implementing.*
