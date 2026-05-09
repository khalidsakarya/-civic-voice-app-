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

### Phase 3B — First enrichment batch (proposal only)

**Status:** **`engine/enrich-subnational-jurisdictions-phase3b.cjs`** is implemented (dry-run default; **`--write`** merge-only). Curated overlay: **`engine/data/subnational-phase3b-overlay.json`** (optional; see **`subnational-phase3b-overlay.sample.json`**). Report: **`docs/SUBNATIONAL_JURISDICTIONS_PHASE3B_ENRICHMENT_REPORT.md`**. Optional **`--no-census`** disables U.S. Census population API. **App UI unchanged.**

**Commands:** `npm run enrich:subnational-jurisdictions:phase3b` from **`civic-voice-app`** or **`civic-voice-engine`** (see each `package.json`).

#### Implementation acceptance criteria (Phase 3B)

When implementation is approved, the enrichment pipeline **must**:

| Requirement | Detail |
|-------------|--------|
| **Dry-run by default** | Running the script with no write flag performs **zero Firestore mutations**; prints or writes a report only. |
| **Merge-only writes** | When writes are enabled later, use **`set(..., { merge: true })`** (or equivalent) per document — **no replace/delete** of documents or unrelated fields. |
| **No deletes** | Never delete documents or clear wholesale field maps as part of enrichment. |
| **Preserve existing fields** | Only Phase 3B–approved keys are updated; all other keys on existing docs remain untouched. |
| **Validate 85 records** | Post-condition (validator): **`subnational_jurisdictions`** still has exactly **85** documents (same expectation as seed validation unless a future change is explicitly approved). |
| **Per-field reporting** | Report, per document or aggregated: which Phase 3B fields were **filled**, **skipped** (intentional), or **missing** (gap / error). |
| **Validation report before UI migration** | Generate markdown report under **`docs/`** — **`SUBNATIONAL_JURISDICTIONS_PHASE3B_ENRICHMENT_REPORT.md`** (enrichment dry-run/write summary); **review before any app UI migration** tied to Phase 3B fields. |

**Goal:** Merge a **minimal** set of fields into existing `subnational_jurisdictions/{id}` documents so the engine can later power thin reads (population line + head of government + canonical URLs) ahead of full parity.

**Batch fields (this proposal):**

| Field | Notes |
|-------|--------|
| `population_raw` | Numeric estimate (integer recommended); document vintage separately when implementing (`population_as_of` optional extension). |
| `population_display` | Human-readable string derived from `population_raw` (consistent locale/format rules in engine). |
| `leader_name` | Current head of executive government for that jurisdiction (Governor / Premier / Chief Minister / First Minister / Mayor for DC per seed `leaderTitle`). |
| `leader_party` | Full party label as shown on official source (short codes deferred to a later batch). |
| `leader_since` | ISO `YYYY-MM-DD` preferred when official source gives a date; otherwise curated display string with documented exception flag — decide one convention before implement. |
| `officialWebsite` | Already in seed (often `null`); Phase 3B proposes **backfilling** chief executive / portal URL where an authoritative single URL exists. |
| `legislatureWebsite` | **New** field — canonical homepage URL for the **primary statute-making parliament/assembly** for that jurisdiction (state legislature; provincial parliament; UK national legislatures; AU state parliament). Merge-safe alongside existing `legislatureName`. |

**Explicitly out of scope for Phase 3B:** UK regional GDP/councils/facts; `legislature_party_breakdown`; deputy leaders; flags.

---

#### United States (`country === 'US'`, 51 docs incl. DC)

| Question | Proposal |
|----------|-----------|
| **1. Best source** | **Population:** U.S. Census Bureau **Population Estimates Program (PEP)** — state-level annual estimates (API or published CSV series). **Leadership:** No single federal JSON roster; use **each state’s official governor site** (or governor-hosted `.gov` bio) as **documented source of truth**, optionally cross-checked against **National Governors Association** public listings (human-readable; not a substitute legal record). **DC:** Executive URL from **mayor.dc.gov** pattern; legislature concept maps to **Council of the District of Columbia**. **Websites:** Primary **executive** portal per state + **legislature** canonical domain (often `state.XX.us` / `capitol.state.XX.us` patterns — verify per state). |
| **2. Automated vs curated** | **Population:** **Automatable** from Census PEP with pinned vintage + series ID in manifest. **Leader fields + URLs:** **Mostly curated** — maintain `engine/data/subnational-us-leadership.csv` (or YAML) keyed by `US-XX` with `source_url` per row; optional future assist from Wikidata **not** trusted for v1 automation without audit. |
| **3. Refresh frequency** | Population: **Annual** (PEP release cycle). Leadership / URLs: **Quarterly** minimum; **Ad hoc** after inaugurations / special elections. |
| **4. Reliable enough for v1?** | **Population:** **Yes**, subject to correct series choice (resident vs estimate basis documented). **Leadership:** **Yes for product v1** if governance is **curated + sourced URLs**, not unsupervised scrape-only. |
| **5. Engine script name** | **`engine/enrich-subnational-jurisdictions-phase3b.cjs`** (npm script e.g. `enrich:subnational-jurisdictions:phase3b`; dry-run default, `--write` gated like seed script). |
| **6. Validation checks** | Count **51** US docs touched or intentionally skipped with logged reason; `population_raw` strictly positive; `population_display` non-empty when raw set; `leader_name` non-empty for all non-exception docs (exceptions require explicit allowlist); `leader_since` parseable if claiming ISO rule; `officialWebsite` / `legislatureWebsite` must be `http(s)` URLs when present; no deletes; merge-only diff preview in dry-run. |

---

#### Canada (`country === 'CA'`, 13 docs)

| Question | Proposal |
|----------|-----------|
| **1. Best source** | **Population:** **Statistics Canada** official population estimates (provincial/territorial totals — relevant table / StatCan Web Data Service subject to chosen table ID). **Leadership:** **Premier** identity and party from each province’s **Lieutenant Governor / Office of the Premier** official pages or **official parliamentary roster** with executive listing (source varies by province). **Websites:** Provincial **cabinet/premier** portal + **legislature** domain (e.g. `*.assembly.ca`, `*.gov.nl.ca`, etc.). |
| **2. Automated vs curated** | **Population:** **Automatable** from StatCan with documented table + geography code mapping to `CA-XX`. **Leadership + URLs:** **Hybrid** — stable URLs **curated**; names/parties refreshed via **semi-manual** CSV keyed by `CA-XX` unless/until a province exposes stable JSON (rare nationally). |
| **3. Refresh frequency** | Population: **Quarterly–annual** depending on StatCan series chosen. Leadership: **Quarterly** + **event-driven** after elections. |
| **4. Reliable enough for v1?** | **Population:** **Yes** with explicit vintage. **Leadership:** **Yes** under **curated roster + official source URL per row** (same standard as US). |
| **5. Engine script name** | Same **`engine/enrich-subnational-jurisdictions-phase3b.cjs`** (country-filter flag or internal branching). |
| **6. Validation checks** | Count **13** CA docs; same numeric/URL rules as US; **NL/QC** alias consistency unchanged (`aliases` untouched by this batch unless approved); French characters allowed in `leader_party` / names with UTF-8 normalization rule documented. |

---

#### Australia (`country === 'AU'`, 8 docs)

| Question | Proposal |
|----------|-----------|
| **1. Best source** | **Population:** **Australian Bureau of Statistics (ABS)** — Estimated Resident Population by state/territory (catalogue table / API per ABS product chosen). **Leadership:** **Premier / Chief Minister** from each jurisdiction’s **official parliament or government** site (NSW `nsw.gov.au`, ACT ACT Assembly pages, etc.). **Websites:** State **government** portal + **parliament** site (`parliament.*`, `.gov.au` patterns per jurisdiction). |
| **2. Automated vs curated** | **Population:** **Automatable** from ABS with catalogue reference per release. **Leadership + URLs:** **Curated CSV** keyed by `AU-XX`; ABS does not publish unified executive roster for all eight in one API. |
| **3. Refresh frequency** | Population: **Quarterly** (ABS ERP cadence). Leadership: **Quarterly** + event-driven. |
| **4. Reliable enough for v1?** | **Population:** **Yes** with catalogue vintage. **Leadership:** **Yes** under curated official sourcing (same bar as US/CA). |
| **5. Engine script name** | **`engine/enrich-subnational-jurisdictions-phase3b.cjs`**. |
| **6. Validation checks** | Exactly **8** AU docs; `population_raw` within plausible bands vs national totals (sanity sum optional warning); URLs must resolve to `.gov.au` or documented canonical parliament domains where policy requires. |

---

#### United Kingdom (`country === 'UK'`, 13 docs — nations + England regions)

| Question | Proposal |
|----------|-----------|
| **1. Best source** | **Population:** **Office for National Statistics (ONS)** mid-year population estimates — map **nations** (`UK-SCT`, `UK-WLS`, `UK-NIR`, `UK-ENG`) from national-level tables; map **`UK-ENG-*`** English regions from **official regional population series** (ITL/NUTS-aligned geography — exact geography codes fixed at implementation time). **Leadership:** **First Minister / PM context** for devolved nations from **UK Parliament / GOV.UK / Scottish Government / Welsh Government / Northern Ireland Executive** official pages; **England (`UK-ENG`)** row — **UK Prime Minister as head of UK Government** *or* leave executive fields **blank / N/A** with documented rule (product must choose — neither is a perfect “England-only governor”). **Regional rows (`UK-ENG-*`):** **Mayors / combined authorities** where they exist — fragmentary; Phase 3B proposes **`leader_*` optional** for regions unless officially sourced (often **blank at v1** acceptable). **officialWebsite / legislatureWebsite:** Scotland/Wales/NI legislatures (`parliament.scot`, `senedd.wales`, `niassembly.gov.uk`); **England nation row:** Parliament **`parliament.uk`**; **English regions:** combined-authority or regional partnership sites **only when official** — otherwise leave websites null and retain seed `legislatureName` text only. |
| **2. Automated vs curated** | **Population (nations + regions):** **Automatable** from ONS downloads/API subject to geography mapping QA. **Leadership:** **Curated** for nations; **regions mostly curated or omitted** in batch 1 to avoid wrong inference. **URLs:** **Curated** minimal known-good set. |
| **3. Refresh frequency** | Population: **Annual** (ONS MYE cycle). Leadership (nations): **Monthly–quarterly**. Regions: **Annual** population only unless mayor roster curated. |
| **4. Reliable enough for v1?** | **Population:** **Yes** for nations + ITL regions once geography codes validated. **Leadership:** **Yes for devolved nations + England row** only under explicit product rule for `UK-ENG`; **regions:** **Partially** — acceptable v1 if `leader_*` allowed empty while population filled. **No GDP/councils in this batch** per scope. |
| **5. Engine script name** | **`engine/enrich-subnational-jurisdictions-phase3b.cjs`**. |
| **6. Validation checks** | **13** UK docs expected; population sanity vs published UK total optional warning; **YOR / EE** alias docs unchanged unless enrichment explicitly merges aliases (default **do not touch** `aliases`); URLs whitelist or manual review list; **England regions**: allow `leader_name` null with logged “intentional gap” unless curator supplies mayor from official CA page. |

---

#### Cross-cutting validation (all countries)

- Aligns with **Implementation acceptance criteria** above: dry-run default; **`--write`** merge-only when enabled; **no deletes**; **preserve** non-target fields.
- Extend **`validate-subnational-jurisdictions.cjs`** or add **`validate-subnational-jurisdictions-phase3b.cjs`** to assert:
  - **Doc count** still **85** (or document intentional exclusion).
  - Required Phase 3B fields present per **policy matrix** (e.g. population mandatory for all 85; `leader_name` mandatory US/CA/AU + UK nations; regions exempt unless curated).
  - `population_display` ↔ `population_raw` consistency (regenerate display from raw in validator to detect drift).
  - Unique URLs where uniqueness expected (optional soft warning on duplicates).
  - Emit **`docs/…VALIDATION_REPORT.md`** for stakeholder review **before** Phase 4 UI work on Phase 3B fields.

---

## Engine enrichment requirements for full UI parity

**Purpose:** Define how each proposed Firestore field should be sourced when moving **beyond** the current static seed (identity + capital + generic titles). This section does **not** authorize writes; it is an engineering plan only.

**Scope:** Same collection **`subnational_jurisdictions`** — add merge-safe fields as the engine proves reliable sources.

**Legend — refresh frequency:**

| Tag | Meaning |
|-----|---------|
| **Daily / weekly** | Changes often enough that automation pays off (elections, reshuffles). |
| **Monthly / quarterly** | Leadership bios / portfolios drift; stats revised on official cycles. |
| **Annual** | Boundary-stable reference or slow-changing aggregates. |
| **One-off / manual** | No durable official feed; human verification per release. |

**Legend — v1 parity:**

| Tag | Meaning |
|-----|---------|
| **v1** | Needed before dropping hardcoded **leader / legislature strip / population** content for US states, CA provinces, AU states/territories (the main provincial hubs). |
| **v1 UK** | Needed only if UK **rich region cards** (`englandRegions`-style) must come from Firestore instead of staying hardcoded longer. |
| **Later** | Nice-to-have or safely derivable client-side until product insists on server truth. |

---

### Leadership (`leader_*`)

| Field | Official fetch? | Source (if any) | Otherwise | Refresh | v1 |
|-------|-----------------|-------------------|-----------|---------|-----|
| `leader_name` | **Partial** | **US:** No single federal API for all governors/mayors; **CA:** No national machine-readable “all premiers” API; **AU:** Parliament/state sites differ; **UK nations:** GOV.UK / devolved sites publish office-holders but not one unified JSON feed for all rows in our catalog. **UK England regions:** Regional mayors (where they exist) appear on combined-authority / MOUA sites — fragmented. | **Curated:** Snapshot from each jurisdiction’s **official executive branch** page (state.gov.ca-like, governor.ky.gov, etc.) with `source_url` captured per doc or per ingest batch. Optional assist: **Wikidata** SPARQL (`P1308` head of government, etc.) — *not* primary legal source; use only as staging with human spot-check. | **Weekly–monthly** (more often during elections). | **v1** |
| `leader_party` | **Partial** | Same fragmentation as above; party affiliation is usually stated on the same official bios. | **Curated** alongside `leader_name` from the same official page; Wikidata `P102` as secondary hint only. | **Weekly–monthly** | **v1** |
| `leader_party_short` | **No** (derived) | — | **Derived in engine** from `leader_party` via a small normalization map per country, or **manual** where abbreviations are ambiguous. | With leader refresh | **v1** |
| `leader_since` | **Partial** | Official bios often state “sworn in” dates; not always structured. | **Curated** ISO date or display string from official source; Wikidata `P580` / start time as hint. | **Monthly** | **v1** |
| `leader_bio` | **Often no** single API | Few jurisdictions expose long bios as structured open data. | **Curated:** Short neutral summary based on **official bio text** (fair-use length / original summary — legal/product to confirm). Avoid copyrighted paste. **Alternative:** Store `leader_bio_source_url` only and let app truncate — product decision. | **Quarterly** or on leadership change | **v1** (content strategy TBD) |

---

### Deputy / lieutenant (`deputy_leader_*`)

| Field | Official fetch? | Source (if any) | Otherwise | Refresh | v1 |
|-------|-----------------|-------------------|-----------|---------|-----|
| `deputy_leader_title` | **Partial** | Titling is consistent enough (**Lieutenant Governor**, **Deputy Premier**, **Deputy Chief Minister**) but varies (AZ transitioning Lt Gov, etc.). | **Curated** from official org charts; can default from `jurisdictionType` + country rules where stable. | **Monthly** | **v1** |
| `deputy_leader_name` | **Partial** | Listed on official sites with governors/premiers. | **Curated** same pipeline as `leader_name`. | **Weekly–monthly** | **v1** |
| `deputy_leader_party` | **Partial** | Same as leader. | **Curated**. | **Weekly–monthly** | **v1** |
| `deputy_leader_since` | **Partial** | Same as `leader_since`. | **Curated**. | **Monthly** | **Later** (UI tolerates blank more easily than head of government). |
| `deputy_leader_bio` | **Often no** | Rarely structured APIs. | **Curated** short summary from official source or **omit** until v2. | **Quarterly** | **Later** |

---

### Demographics

| Field | Official fetch? | Source (if any) | Otherwise | Refresh | v1 |
|-------|-----------------|-------------------|-----------|---------|-----|
| `population_display` | **Yes** (derived) | **US:** U.S. Census Bureau **Population Estimates Program** (PEP) — API/datasets; **CA:** Statistics Canada tables (CANSIM / StatCan API); **AU:** ABS National, state and territory population; **UK:** ONS mid-year population estimates (nations / English regions NUTS)—datasets more often than a single “gaming-friendly” API. | Format human-readable string in engine (`formatPopulation`). | **Annual** (official estimates cadence) | **v1** |
| `population_raw` | **Yes** | Same sources as above — store numeric estimate + vintage metadata (`population_as_of` optional future field). | — | **Annual** | **v1** |

---

### Legislature (`legislature_total_seats`, `legislature_party_breakdown`)

| Field | Official fetch? | Source (if any) | Otherwise | Refresh | v1 |
|-------|-----------------|-------------------|-----------|---------|-----|
| `legislature_total_seats` | **Partial** | **US:** Chamber sizes are constitutional/rule-based — can be **stable constants** in engine config per state + chamber split if UI merges chambers; **CA/AU/UK:** Parliamentary websites publish seat counts; **UK England regions:** Not one legislature per region — current UI uses **illustrative** “total seats” per region; **not** a single official number from Westminster for “North East England councils aggregate”. | **Hybrid:** Official fixed integers where legislatures are real (state/provincial parliaments); **curated** methodology note for UK regional illustrative rows if those rows remain in Firestore. | **Annual** or on electoral reform | **v1** for US/CA/AU real legislatures; **v1 UK** only if replacing illustrative regional legislature widget |
| `legislature_party_breakdown[]` | **Partial** | **US:** **Open States** (openstates.org) — REST API / bulk data for state legislatures, party counts vary by coverage and chamber model — validate per state. Some states require SOS JSON/HTML scrape. **CA:** Legislative Assembly / House sites sometimes publish party standings (often HTML). **AU:** State parliament “numbers” pages. **UK Westminster:** data.parliament.uk APIs — applies to **UK-wide** MPs, **not** English region cards as currently designed. **UK regions:** Party aggregates in app are **editorial/illustrative** — no one official feed. | **Primary:** Open States + verification pass for US; **manual/semi-automated** scrape with tests for CA/AU; **curated** JSON for UK illustrative regional rows if product keeps them. | **Weekly during sessions**; **monthly** otherwise | **v1** US/CA/AU; **Later** or **curated-only** for UK regional illustrative |

---

### Optional media

| Field | Official fetch? | Source (if any) | Otherwise | Refresh | v1 |
|-------|-----------------|-------------------|-----------|---------|-----|
| `flag_commons_filename` | **Semi** | **Wikimedia Commons** — filenames follow predictable patterns for many flags; **Wikidata** `P41` links to flag image. Not a government API. | **Curated** filename string per doc; engine does **not** hotlink without license review (Commons is generally OK with attribution policy). | **Rare** | **Later** (app already builds URLs from a static map keyed by name). |
| `flag_image_url` | **Semi** | Derived `https://commons.wikimedia.org/wiki/Special:FilePath/{filename}` or stable CDN copy **if** hosting policy allows. | **Curated URL** if using official state-hosted SVGs (some states publish open SVGs). | **Rare** | **Later** |

---

### UK regional extras (rich cards only)

Only required if Firestore must replace **`englandRegions`**-style content. Official statistics exist for subsets; narrative/council lists do not.

| Field | Official fetch? | Source (if any) | Otherwise | Refresh | v1 |
|-------|-----------------|-------------------|-----------|---------|-----|
| `emoji` | **No** | — | **Curated** (presentational; not government data). | **One-off** | **v1 UK** |
| `area_display` | **Partial** | **ONS** geographic areas / standard area measurements for ITL/NUTS regions (check current geography standard post-Brexit). | Format from dataset; **curated** label if mixing units. | **Annual** | **v1 UK** |
| `gdp_per_capita_display` | **Partial** | **ONS** regional gross value added (GVA) / GDP-style metrics — tables and APIs via **Nomis** / ONS Open Geography / downloadable datasets; verify metric definition matches UI copy (GVA vs GDP, current vs constant prices). | **Curated** display string + numeric backing optional. | **Annual** (ONS publication cycle) | **v1 UK** |
| `gdp_total_display` | **Partial** | Same ONS regional accounts family — aggregate regional GVA/GDP. | Same as above. | **Annual** | **v1 UK** |
| `unemployment_display` | **Partial** | **ONS** regional labour market statistics (APS/Jobs workforce jobs — pick one definition and stick to it). | **Curated** formatting; document rate definition in `source_url`. | **Quarterly** | **v1 UK** |
| `main_cities` | **Partial** | No single authoritative ordered “main cities” API; ONS/places datasets list settlements but **ranking** is editorial. | **Curated** array of strings; optionally cross-check against official boundary factsheets. | **Annual / manual** | **v1 UK** |
| `economic_sectors` | **Partial** | ONS industry-by-region tables exist but are coarse; **percentage shares** in current UI are simplified. | **Curated** structured array `{ name, share_display, trend }` — treat as **derived/editorial** unless replaced by chart-from-data later. | **Annual** | **Later** |
| `key_facts` | **No** | Facts could be **inspired by** official regional profiles but wording is narrative. | **Curated** bullet strings; maintain provenance notes internally. | **Manual** | **Later** |
| `sub_mayors` | **Partial** | Combined Authority / mayoral election pages (**gov.uk**, CA sites) for named mayors where applicable; incomplete for regions without mayors. | **Curated** array of objects; empty array where none. | **On election cycle** | **v1 UK** (if mayor bands stay in UI) |
| `councils` | **Partial** | **GOV.UK** Find your local council / local authority lists; boundary datasets — merging “population + leader + party” per council is **multi-step** and often **HTML**. | **Curated** array or **defer** keeping councils hardcoded until a dedicated council ingest exists (still **no new collection** — nested array only). | **Annual / manual** | **Later** |

---

### Implementation notes (engine)

1. **Single merge pipeline:** Treat enrichment as **`dataStatus: engine_enriched`** (or similar) with `last_updated` per field group if needed — exact schema approval before writes.
2. **Provenance:** Every automated pull should record **`source_name` + `source_url`** (or batch manifest URL) consistent with existing seed discipline.
3. **No new collection:** Large nested arrays (`legislature_party_breakdown`, `councils`) stay **inside** the jurisdiction document; monitor Firestore doc size (1 MiB limit).
4. **UK split:** Consider enriching **`UK-ENG-*`** rows first for stats-only migration while **narrative** fields remain curated or stay in-app until ONS-backed copy exists.
5. **Rate limits / ToS:** Open States, ONS, Census, StatCan, ABS — comply with each provider’s terms; prefer bulk downloads where offered.

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
