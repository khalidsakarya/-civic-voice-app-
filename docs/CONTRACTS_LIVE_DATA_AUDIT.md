# Contracts live-data audit

**Scope:** `civic-voice-app` UI + engine upload references only — no runtime scheduler/Firestore changes performed for this document.

**Date:** 2026-05-08

---

## Executive summary

| Question | Answer |
|----------|--------|
| Is **`government_contracts`** the right UI source of truth? | **Yes.** Every contracts list/detail surface in `App.js` reads **`liveContracts`** populated exclusively from **`government_contracts`** (`where('jurisdiction', '==', …)`). |
| Is **`contracts`** legacy / duplicate for UI? | **Yes for UI.** There is **no** `collection(db, 'contracts')` usage under `civic-voice-app/src/`. The engine still **`batchWrite`s `contracts`** from `output/contract/` (`uploadContracts`), which is a **separate pipeline** from **`government_contracts`** (`output/government_contracts/` + `uploadGovernmentContracts`). |
| Safe to treat **`government_contracts`** as live UI source and leave **`contracts`** as legacy? | **Yes for the React app**, provided ops/engine stakeholders accept that **`contracts`** remains maintained only for non-app consumers (analytics, future screens, or deprecation later). **Do not delete **`contracts`** without an engine/inventory decision.** |

---

## 1. UI paths that display contracts

All implementations live in **`civic-voice-app/src/App.js`** unless noted.

| # | User journey | `view` / navigation | Render helper | Data source for rows |
|---|----------------|---------------------|---------------|----------------------|
| 1 | Canada — Categories hub tile → list | `categories` → **`contracts`** | `renderContracts()` | `liveContracts.CA` |
| 2 | Canada/US — Government Levels hub tile → list | `government-levels` → **`contracts`** or **`us-contracts`** | `renderContracts()` / `renderUSContracts()` | `liveContracts.CA` / `liveContracts.US` |
| 3 | UK — National hub tile → list | UK hub → **`uk-contracts`** | `renderUKContracts()` | `liveContracts.UK` |
| 4 | AU — National hub tile → list | AU hub → **`au-contracts`** | `renderAuContracts()` | `liveContracts.AU` |
| 5 | CA contract detail | **`contract-detail`** | `renderContractDetail()` | `selectedContract` (chosen from `liveContracts.CA`) |
| 6 | UK contract detail | **`uk-contract-detail`** | `renderUKContractDetail()` | `selectedUkContract` (from `liveContracts.UK`) |
| 7 | AU contract detail | **`au-contract-detail`** | `renderAuContractDetail()` | `selectedAuContract` (from `liveContracts.AU`) |

**Note:** US list flow does **not** define a separate `us-contract-detail` view in `App.js` (no grep hit); US behaviour is list-centric within `renderUSContracts()`.

**Related but not federal contracts UI:** Department/ministry **`grantsDetail`** arrays (e.g. Australia `auDepartments`) include rows tagged `type: 'contract'` — that is **static demo budget/grant content**, not Firestore **`government_contracts`**.

---

## 2. Collections vs hardcoded usage by path

| Path | `government_contracts` | `contracts` | Hardcoded / demo |
|------|-------------------------|-------------|------------------|
| **`contracts` / `us-contracts` / `uk-contracts` / `au-contracts`** lists + detail views | **Yes** — single `useEffect` loads via `getDocs` + `jurisdiction` | **No** | **No** row-level fallback for lists (empty → “No contract data…”); US has informational copy when filters exclude everything |
| **Canada `categories` hub** tile count | Indirect (`liveContracts.CA?.length`) | **No** | **Yes** — **`(liveContracts.CA?.length ?? 0) \|\| 15`** forces **15** when count is 0 |
| **Government Levels CA/US** contracts tile subtitle | Live lengths | **No** | **No** (`?? 0` only) |
| **UK national hub** contracts tile subtitle | **Not wired** | **No** | **Yes** — static **“15 Major Contracts · £92B+”** |
| **AU national hub** contracts tile subtitle | **Not wired** | **No** | **Yes** — static **“15 Major Contracts · A$149B+”** |

There is **no** **`GovernmentContracts.js`** (or similar) under `civic-voice-app/src` in this workspace; contracts UX is **embedded in `App.js`**.

---

## 3. Auto-load vs manual button

| Behaviour | Details |
|-----------|---------|
| **Auto-load** | On entering **`contracts`**, **`us-contracts`**, **`uk-contracts`**, or **`au-contracts`**, a `useEffect` runs and queries **`government_contracts`** for the mapped jurisdiction (`CA` / `US` / `UK` / `AU`). |
| **No extra toggle** | There is **no** “Load live contracts” button for these views (unlike waste tracker’s earlier explicit toggle pattern). |
| **Fetch deduping** | `contractsFetchedJurisdictions` prevents re-fetching the same jurisdiction after the first successful scheduling — **session lifetime** only (in-memory); **full page reload** resets and refetches. |

---

## 4. Country / jurisdiction filter consistency

| UI region | `view` | Query field | Code value |
|-----------|--------|-------------|------------|
| Canada | `contracts` | `jurisdiction` | **`CA`** |
| United States | `us-contracts` | `jurisdiction` | **`US`** |
| United Kingdom | `uk-contracts` | `jurisdiction` | **`UK`** |
| Australia | `au-contracts` | `jurisdiction` | **`AU`** |

This matches the engine’s **`government_contracts`** upload model (per-jurisdiction batches). Client-side, imported docs are further **`filter`ed** to rows that have **`contractor_name`** (rows without it never appear).

---

## 5. Fallback / demo data still shown

| Location | What users still see |
|----------|----------------------|
| **Canada Categories hub** | Contract **count** falls back to **15** when Firestore count is 0 |
| **UK / AU national hubs** | Teaser lines are **hardcoded** (“15 Major Contracts…”) and **do not** reflect `liveContracts` until user opens the contracts view |
| **Lists** | If fetch fails or returns empty after filter: **empty / loading states**, not a fabricated contract list |
| **Engine-only **`contracts`** collection** | May still hold rows from **`output/contract/`**, but **this app does not read them** |

---

## 6. Is **`contracts`** still used anywhere important?

| Layer | Role |
|-------|------|
| **`civic-voice-app`** | **Not read** — grep shows **no** `collection(db, 'contracts')` in `src/`. |
| **`FirestoreDebugPanel`** presets | Includes **`government_contracts`**, **not** **`contracts`**. |
| **`civic-voice-engine`** | **`uploadContracts`** writes **`contracts`** from **`output/contract/`** (distinct folder from **`output/government_contracts/`**). Still scheduled as part of broader uploads where configured (see `ENGINE_SCHEDULER_AUDIT.md` / bimonthly notes in other docs). |

**Conclusion:** **`contracts`** remains **engine/back-office relevance** and possible **future or external consumers** — **not** the current Civic Voice web UI path.

---

## 7. Recommended canonical source of truth

1. **UI / product:** **`government_contracts`** keyed by **`jurisdiction`** (`CA` \| `US` \| `UK` \| `AU`).
2. **Legacy parallel store:** **`contracts`** — treat as **non-canonical for app UX** until a deliberate migration merges pipelines or retires the collection.
3. **Documentation alignment:** `docs/DATA_CONTRACTS.md` already states UI reads **`government_contracts`**; this audit confirms implementation matches.

---

## 8. Smallest safe UI-only improvements (no schema / engine changes)

Pick **one** initially:

1. **Remove the Canada Categories hub `|| 15` contract count fallback** — use **`liveContracts.CA?.length ?? 0`** (and optional copy like “—” or “0”) so the tile does not imply live depth when Firestore is empty.
2. **UK / AU hub tiles:** Replace static **“15 Major Contracts…”** strings with **`liveContracts.UK?.length ?? 0`** / **`liveContracts.AU?.length ?? 0`** (optionally prefetch **`government_contracts`** when those hubs mount if you want counts without opening the contracts view — still read-only).

Either change is **Firestore read-only**, does not touch **`contracts`**, and does not require deleting any collection.

---

## Code anchors (reference)

- **Fetch:** `App.js` — comment `Fetch government_contracts from Firestore when a contracts page opens` (`useEffect` with `viewMap` / `collection(db, 'government_contracts')`).
- **State:** `liveContracts`, `contractsFetchedJurisdictions`.
- **Renders:** `renderContracts`, `renderUSContracts`, `renderUKContracts`, `renderAuContracts`, detail renderers keyed off `selectedContract` / `selectedUkContract` / `selectedAuContract`.
- **Engine `contracts` writer:** `civic-voice-engine/src/firebase/uploader.js` — `uploadContracts()` → **`batchWrite('contracts', …)`**.

---

## Follow-ups (non-blocking)

1. Decide whether **`contracts`** uploads can be **deprecated** after confirming no downstream jobs/dashboards depend on them.
2. If freshness matters, revisit **`contractsFetchedJurisdictions`** strategy (session-only cache vs TTL) — product/engine decision, not strictly UI.
