# Subnational flags & partyShort audit

**Date:** 2026-05-10  
**Purpose:** Doc-only assessment of what is required **before** visible **flag assets** and **`partyShort`**-style fields could move from hardcoded app data into **`subnational_jurisdictions`** (or a sibling pattern). **No code changes, no Firestore writes, no UI changes** are implied by this file.

**Primary implementation surface:** `src/App.js` (`getProvincialData`, `getAustralianStateData`, `englandRegions`, plus country-level emoji literals elsewhere).

---

## 1. Flags — US, Canada, Australia, UK

### 1.1 Where flags / emojis are defined today

| Area | Mechanism | Location (approx.) |
|------|-----------|---------------------|
| **US & Canada** (provincial/state explorer) | **Wikimedia Commons** URLs built from a **local map** of canonical **`name` → SVG filename**, plus fallback `Flag_of_${nameWithUnderscores}.svg`. Base URL: `https://commons.wikimedia.org/wiki/Special:FilePath/` | `getProvincialData` — `flagFiles` object (~`12414`–`12481`), `flagUrl(name)` (~`12482`), then **`flagUrl(p.name)` / `flagUrl(s.name)`** after merge (~`13003`–`13006`). |
| **Australia** (state/territory explorer) | Same pattern: **`flagFiles`** keyed by **exact display name** (`New South Wales`, …), same **`Special:FilePath/`** resolver | Inside **`getAustralianStateData`** (~`23598`–`23609`), `.map(..., flagUrl(s.name))` (~`23693`). |
| **UK England regions** | **Emoji only** per region (e.g. ⚙️, 🏙️), **no flag URL** on explorer cards or detail hero coat placeholder | **`englandRegions`** objects **`emoji`** field (~`19963`+); grid/detail render **`region.emoji` / `r.emoji`**. |
| **Country-level chrome** | Unicode regional indicators / flag emojis (**🇺🇸 🇨🇦 🇬🇧 🇦🇺**) for hubs, tax, analytics, search metadata — **not** tied to subnational Firestore rows | Many literals (e.g. ~`9924`, ~`12098`, ~`14509`, AU-themed screens ~`6437`, ~`9668`). |

### 1.2 Format summary

| Country | Subnational UI | Type |
|---------|----------------|------|
| **US** | State explorer | **Image URL** (Commons `Special:FilePath` + filename) |
| **CA** | Province/territory explorer | **Image URL** (same) |
| **AU** | State/territory explorer | **Image URL** (same) |
| **UK** | England regions only (in scope of subnational explorer) | **Emoji** (character), plus decorative gradients — **not** image flags |

### 1.3 Screens that use them

- **US/CA:** Provincial/state **list** (`<img src={item.flagUrl} />`), **detail** hero (`item.flagUrl`), share/metadata tied to region name — **`renderProvincial`**, **`renderProvinceDetail`** (~`13072`, ~`13256`).
- **AU:** State **list**, **detail** hero, leader panel (**`item.flagUrl`** ~`23744`, ~`23903`, ~`25135`).
- **UK regions:** **Explorer grid** and **detail** use **`emoji`** for visual identity; **no `<img>` flag** for regions.

### 1.4 Can they live in Firestore?

**Yes, conceptually**, as either:

1. **`flag_commons_filename`** (or **`flag_wikimedia_title`**) — matches today’s resolver; engine/app concatenate `Special:FilePath/` + encoded filename (same as now).
2. **`flag_image_url`** — fully resolved HTTPS URL (could still point at Commons or a **CDN/cache** you control).

**UK emoji:** map cleanly to a short field such as **`flag_emoji`** or **`symbol_emoji`** on each jurisdiction doc (England regions + nations if ever surfaced).

**Recommendation:** Prefer **stable canonical filename** + optional **override URL** for caching/CDN later — avoids storing brittle full URLs in seeds unless needed.

### 1.5 Source strategy

| Approach | Pros | Cons |
|----------|------|------|
| **Continue Wikimedia Commons filenames** (current behaviour) | No hosting cost; huge inventory of SVG flags | Hotlinking/rendering depends on Commons uptime & paths; **license/attribution** expectations (see below). |
| **Hosted copies** (Firebase Storage, CDN) | Predictable latency; avoid Commons structural URL changes | Operational cost; must **preserve license** and **attribute** per file. |

### 1.6 Licensing / provenance

- **Wikimedia Commons** flag SVGs are typically **free licenses** (often **CC BY-SA** or **public domain**), but **vary per file**.
- **Responsible use:** retain **`source_name` / `source_url`** on jurisdiction docs (already in seed pattern); for production, consider **file-level license + attribution string** if you **redistribute** or **modify** (policy decision outside this audit).
- **Emoji:** Unicode characters are not “hosted assets”; **no Commons license**, but **design/accessibility** (screen readers, cross-platform rendering) still matters.

---

## 2. partyShort (and UK equivalents)

### 2.1 Where `partyShort` is defined

| Flow | Field(s) | Defined on |
|------|----------|------------|
| **US** governor rows | **`partyShort`** (`R` / `D`) | Each **`usStates`** object (~`12594`+); **Firestore overlay** can **overwrite** via **`mergeProvincialExplorerRow`** using **`usPartyShortFromLeaderParty(leader_party, hardcoded.partyShort)`** — see `mergeProvincialExplorerFirestore.js`. |
| **Canada** provinces | **`partyShort`** (`PC`, `CAQ`, `NDP`, `UCP`, `Sask. Party`, `Liberal`, `Consensus`, …) | Each **`canadaProvinces`** row (**hardcoded only** for badge text — merge **does not** set `partyShort` today). |
| **Australia** | **`partyShort`** (`ALP`, `LNP`, `Liberal`, `CLP`, …) | Each **`states`** entry in **`getAustralianStateData`**; merge **does not** overlay `partyShort`. |
| **UK England regions** | **No `partyShort`** key — UI uses **`leaderParty`** (full string), **`leaderPartyColor`** (hex), and **`leader`** | **`englandRegions`** (~`19963`+); Firestore may overlay **`leader_party`** → **`leaderParty`** only when **`hasRegionalMayor`**. |

### 2.2 Screens / badges using `partyShort` or equivalents

- **US/CA provincial list:** Badge shows **`item.partyShort`**; **party summary** counts rows by **`partyShort`** (filters like `s.partyShort === 'R'`, `['PC','UCP']`, etc.) (~`13059`–`13107`).
- **Province detail:** **`partyBadge(item.partyShort)`** on governor/premier card (~`13299`).
- **AU list/detail:** **`partyBadgeColors[item.partyShort]`**, **`partyCounts`** by **`partyShort`**, **`PersonCard`** uses **`partyShort`** for compact badge (~`23735`–`23978`).
- **UK:** **Mayor badge** uses **`leaderPartyColor`** + **`leader`** text — **not** a short code enum like ALP/PC.

### 2.3 Can `partyShort` be derived from `leader_party`?

| Jurisdiction | Safe automatic derivation? | Notes |
|--------------|----------------------------|------|
| **US** | **Partially** — current helper maps **“Republican” / “Democrat”** substrings to **R/D** only (`usPartyShortFromLeaderParty`). **Independent / third-party** governors break or fall back to hardcoded **`partyShort`**. |
| **Canada** | **Poor fit for naive derivation** — labels like **Progressive Conservative**, **Coalition Avenir Québec**, **Saskatchewan Party**, **Consensus Government** need **curated short codes** (`PC`, `CAQ`, `Sask. Party`, …). |
| **Australia** | **Poor fit** — **ALP** vs **Australian Labor Party**, **LNP** vs **Liberal National Party**, **Liberal** (Tas) vs federal Liberal, etc.; ambiguity without a lookup table. |
| **UK regions** | **N/A for same field** — UI uses **full party string + hex colour**; a future **`leader_party_short`** would be a **new** convention if required for badges. |

### 2.4 Where manual curation likely remains

- **All CA provinces / territories** — short codes for badges and **colour maps** in UI.
- **All AU states/territories** — same; deputy badges may eventually need parallel fields (**not in scope** here).
- **US** — whenever **`govParty`** is not cleanly **Republican/Democrat**.
- **UK** — **badge colours** (**`leaderPartyColor`**) and **emoji** are editorial; **`leader_party`** from FS may not encode colour.

### 2.5 Suggested Firestore field

- **`leader_party_short`** (string, optional) — matches product language (“short badge label”).
- Align with existing **`leader_party`** (full name); avoid overloading **`abbreviation`** (already postal/subnational code).
- **Alternative:** keep deriving **US** from **`leader_party`** in merge but **persist explicit override** in **`leader_party_short`** when seed/engine disagrees with heuristic.

---

## 3. Recommendation — simple plan

### 3.1 Fields to add (conceptual schema extension)

| Field | Purpose |
|-------|---------|
| **`flag_commons_filename`** or **`flag_image_url`** | Subnational flag asset (US/CA/AU); UK could use **`flag_emoji`** instead or in addition. |
| **`leader_party_short`** | Stable badge text (`R`, `PC`, `ALP`, …). |

Optional later: **`flag_license_note`** / **`flag_attribution`** if you redistribute Commons SVGs off-wiki.

### 3.2 Source strategy

1. **Phase A:** Seed **`leader_party_short`** from current hardcoded **`partyShort`** / UK editorial equivalents where applicable.
2. **Phase B:** Seed **`flag_commons_filename`** from existing **`flagFiles`** maps (same filenames).
3. **Phase C (optional):** Mirror assets or use CDN with retained attribution metadata.

### 3.3 What can be automated

- **US `partyShort`:** Rule-based **R/D** from **`leader_party`** when strings stay mainstream (already prototyped in merge).
- ** Filename generation:** Script can emit **`flag_commons_filename`** from current **`flagFiles`** keys — low risk.

### 3.4 What should stay curated

- **Canada / Australia `leader_party_short`** (and UK badge semantics / colours).
- **UK region emoji** (and **`leaderPartyColor`** unless replaced by a design system).
- **Any jurisdiction** where **`leader_party`** is **non-standard** or **multi-party** shorthand would mislead users.

### 3.5 Safe for v1 (later migration pass — not this audit)

- Add optional **`leader_party_short`** and **`flag_commons_filename`** to **`subnational_jurisdictions`** docs **without deleting** app-side maps.
- **Merge logic:** prefer Firestore when present; **fallback** to today’s hardcoded **`partyShort`** / **`flagUrl(name)`**.
- **UK:** add **`flag_emoji`** only if product wants FS-driven emoji (otherwise leave emoji hardcoded).

### 3.6 What should wait

- **Removing** **`flagFiles`** / **`partyShort`** blobs until **every** consumer (explorers + **party summary** aggregations + **badge colour maps**) reads from Firestore or a shared registry.
- **Deriving CA/AU short codes** solely from **`leader_party`** without a **canonical lookup table** (high error rate).
- **Hotlink elimination** (CDN) until legal/ops sign off on **attribution** approach.

---

## 4. Answer: can flags & partyShort migrate safely later?

**Yes, with conditions:**

- **Flags (US/CA/AU):** Safe **if** Firestore stores either **Commons filename** (today’s pattern) or **explicit URLs**, and the app **keeps fallback** until all rows populated; **license/attribution** handled for redistributed assets.
- **UK regions:** **Emoji** migration is **small schema + merge change**; **not** the same as US/CA/AU image flags.
- **`partyShort`:** **US** partial automation already exists; **CA/AU/UK** need **explicit `leader_party_short`** (or equivalent) **— derivation from full party name alone is not reliably safe.**

This audit does **not** implement migration; it only scopes feasibility and risk.

---

## 5. Code references

| Topic | File / area |
|-------|-------------|
| US/CA flag map & `flagUrl` | `App.js` ~`12409`–`13006` |
| AU flag map & `flagUrl` | `App.js` ~`23581`–`23693` |
| UK `emoji` | `App.js` **`englandRegions`** ~`19963`+ |
| `partyShort` usage | `App.js` **`renderProvincial`**, **`renderProvinceDetail`**, **`renderAustralianStates`**, **`renderAustralianStateDetail`** |
| US merge `partyShort` | `src/utils/mergeProvincialExplorerFirestore.js` **`usPartyShortFromLeaderParty`** |

---

## 6. Recommended next implementation step *(proposal only)*

**No app code or Firestore edits are implied.** This section chooses **one** direction for the **next** approved implementation slice.

### Options evaluated

| Option | What it means |
|--------|----------------|
| **1. Add `leader_party_short` to Phase 3B overlay** | Enrichment/seed pipeline writes an optional **`leader_party_short`** on `subnational_jurisdictions` (aligned with **`leader_party`**). Later, merge/helpers can prefer this field for CA/AU/US badges while keeping hardcoded fallback. |
| **2. Add `flag_commons_filename`** | Same collection gains optional **`flag_commons_filename`** (or equivalent) so flags can eventually be sourced from Firestore instead of **`flagFiles`** in `App.js`. |
| **3. Keep both hardcoded for now** | Defer new fields until a broader migration milestone (e.g. single ingest pipeline + UI read path agreed). |

### Recommendation: **Option 1 — prioritize `leader_party_short` in Phase 3B**

**Rationale (safest next increment):**

1. **Unblocks the weakest overlay:** Canada and Australia explorers still depend on **hardcoded `partyShort`** for list badges and party summaries; Firestore already carries **`leader_party`**, but **`leader_party_short` cannot be inferred reliably** from full names alone. Shipping **`leader_party_short`** in Phase 3B **fills a real data gap** without requiring UI changes in the same pass.
2. **Lower operational/legal surface than flags:** Flag URLs touch **Commons licensing, attribution, and optional CDN/hotlink policy**. **`leader_party_short`** is plain curated text — easier to review and seed from existing **`partyShort`** columns.
3. **Flags still work today:** US/CA/AU **`flagUrl`** logic is **already deterministic** from canonical names + **`flagFiles`**. Moving filenames to Firestore is **primarily deduplication / single source of truth** — valuable, but **not** fixing a missing feature path on its own.

### When to choose Option 2 instead

Pick **`flag_commons_filename`** next if the **immediate goal** is **centralizing all subnational display metadata in Firestore** (e.g. engine-only edits, multiple clients), **and** you are ready to document **per-file Commons attribution** (or a hosted-asset policy). That is a **process** decision as much as a technical one.

### When to choose Option 3

Keep **both** hardcoded if you want **zero schema or enrichment churn** until **merge helpers + UI** are explicitly scheduled to **read** new fields — i.e. **no partial columns** in production without consumers.

### Summary table

| Next step | Verdict |
|-----------|---------|
| **`leader_party_short` in Phase 3B** | **Recommended** — highest leverage vs risk for subnational parity. |
| **`flag_commons_filename`** | **Defer** unless centralization/licensing workflow is ready. |
| **Keep both hardcoded** | **Reasonable** if you freeze data model changes until end-to-end read path is approved. |
