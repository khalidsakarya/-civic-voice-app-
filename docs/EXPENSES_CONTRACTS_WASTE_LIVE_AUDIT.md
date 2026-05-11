# Expenses / contracts / waste — live-data audit

**Purpose:** For eight Firestore collections, summarize **code-derived** wiring: readers in the app, writers in the engine, scheduler tiers, AI usage, merge/delete behavior, and **UI live vs hardcoded** behavior.  
**Out of scope for this file:** Live document counts, max(`last_updated`), or “stale” in days — use **Firebase Console** or `npm run audit:firestore-inventory` (read-only) to fill **TBD** cells.

**Related:** `docs/ENGINE_SCHEDULER_AUDIT.md`, `docs/ENGINE_COST_AND_CREDIT_AUDIT.md`, `docs/FIRESTORE_INVENTORY_AUDIT.md`.

**No Firestore queries or scheduler runs** were performed to author this document.

---

## Summary table (all eight collections)

| Collection | Engine refresh | Scheduler flag / npm | Uses Claude? | Safe refresh without AI? | App reads (primary) | Live vs demo in UI |
|------------|----------------|----------------------|--------------|---------------------------|------------------------|---------------------|
| `leader_expenses` | Yes | `scheduler:leader-expenses` (`npm run scheduler:leader-expenses`) | **Yes** (ingest → `processLeaderExpenses`) | **No** — pipeline expects AI enrichment before upload | **None wired** — `fetchLeaderExpenses` exists in `App.js` but **no call sites** found | **Not surfaced** — loader/state effectively unused |
| `department_expenses` | Yes | `scheduler:monthly` — `uploadDepartmentExpenses` | **No** | **Yes** | **`department-detail`**, **`ministry-detail`**, **`uk-department-detail`**, **`au-department-detail`** via `fetchDeptExpenses` | **Firestore when docs match** `department` / jurisdiction — otherwise empty arrays |
| `flagged_expenses` | Yes | `scheduler:expenses` — `uploadFlaggedExpenses` | **Yes** (`processExpenses`, flagged subset) | **No** | **`categories`** hub waste tracker — **only after** user toggles **Load Live Data** (`fetchWasteData`) | Default UI = **hardcoded** roster + demo waste UI until toggle |
| `waste_reports` | Yes | same as `flagged_expenses` — `uploadWasteReports` | **Yes** (`detectWaste`) | **No** | Same toggle → **`fetchWasteData`** | Same — live summary doc when toggle on |
| `expense_anomalies` | Yes | `scheduler:leader-expenses` — `uploadExpenseAnomalies` | **Yes** (`detectLeaderAnomalies`) | **No** | **No `App.js` query found** | **N/A** — collection populated for ops / future |
| `expense_leaderboard` | Yes | `scheduler:leader-expenses` — `uploadLeaderboard` | **Yes** (upstream processing / leaderboard build) | **No** | **No `App.js` query found** | **N/A** |
| `contracts` | Yes | `scheduler:bimonthly` — `uploadContracts` reads `output/contract/` | **No** in upload path | **Yes** (fetch + upload only) | **No direct read** in `App.js` grep — **UI uses `government_contracts`** | **Likely unused by main contracts UX** — dup vs `government_contracts` per inventory audit |
| `government_contracts` | Yes | `scheduler:monthly` — `fetchAllGovernmentContracts` + `uploadGovernmentContracts` | **No** | **Yes** | **`contracts`**, **`us-contracts`**, **`uk-contracts`**, **`au-contracts`** — `getDocs` where `jurisdiction` | **Live Firestore** → `liveContracts` state; hub card count fallback **`15`** if empty |

---

## Per-collection detail

### 1. `leader_expenses`

| Topic | Detail |
|-------|--------|
| **Approx. count / freshness** | **TBD** (Console). Docs include **`last_updated`** from uploader (`withTimestamp`). |
| **Source** | `civic-voice-engine`: `ingestion/leaderExpenseFetcher.js` → processed **`leader_expenses_enriched.json`** (Claude-enriched) → `firebase/uploader.js` **`uploadLeaderExpenses`** → **`batchWrite`** (`merge: true` via shared helper). |
| **App screen** | Intended leader/minister expense displays — **currently**: **`fetchLeaderExpenses`** + **`leaderLiveExpenses`** state exist but **grep finds no invocation** of `fetchLeaderExpenses` and **no JSX** reads `leaderLiveExpenses`. Treat as **disconnected**. |
| **Engine refreshes?** | Yes — **`scheduler:leader-expenses`** (weekly cron / `--leader-expenses`). |
| **Claude / credits?** | **Yes** — `processing/leaderExpenseProcessor.js`, `leaderAnomalyDetector.js`. |
| **Safe without AI?** | **No** — enrichment path expects **`ANTHROPIC_API_KEY`**. |
| **UI real vs hardcoded** | **Neither effectively** — data may exist in Firestore without UI wiring. |
| **Overwrite risk** | **`merge: true`** on batch write — normal keys overwritten when present in payload; typically safe if payload is full enriched row. |

---

### 2. `department_expenses`

| Topic | Detail |
|-------|--------|
| **Approx. count / freshness** | **TBD**. Refreshed when **`scheduler:monthly`** succeeds (also ran in **Phase A**, §12 `ENGINE_SCHEDULER_AUDIT.md`). |
| **Source** | `departmentExpensesFetcher.js` → JSON under **`output/department_expenses/`** → **`uploadDepartmentExpenses`**. |
| **App screen** | Per-department transparency: **`fetchDeptExpenses`** when **`department-detail`** / **`ministry-detail`** / **`uk-department-detail`** / **`au-department-detail`** opens; maps display names → Firestore `department` via **`UK_DEPT_EXPENSES_NAMES`**, **`AU_DEPT_FIRESTORE_NAMES`**, **`CA_DEPT_FIRESTORE_NAMES`**. |
| **Engine refreshes?** | Yes — **monthly** tier. |
| **Claude / credits?** | **No** in scheduler wiring for this upload. |
| **Safe without AI?** | **Yes**. |
| **UI real vs hardcoded** | **Firestore-first** when docs exist and names align; console **`DeptExpenses`** logs help debug mismatches. |
| **Overwrite risk** | **`uploadDepartmentExpenses`** **deletes** Firestore docs per **`jurisdiction`** that are **not** in the new upload’s ID set for that jurisdiction, then **`batchWrite` merge**. **Risk:** IDs changing between runs can **orphan-delete** old docs — intentional “replace cleanly” pattern (`uploader.js` comments). |

---

### 3. `flagged_expenses`

| Topic | Detail |
|-------|--------|
| **Approx. count / freshness** | **TBD**. Last refresh tied to **`scheduler:expenses`** ( **not** Phase A — requires Claude approval per cost audit). |
| **Source** | `expenseFetcher.js` (multi-country APIs, incl. UK Contracts Finder, etc.) → **`processExpenses`** (Claude) → **`expenses_enriched.json`** → **`uploadFlaggedExpenses`** filters **`isFlagged`**. |
| **App screen** | **`renderWasteTracker`** (`categories` hub) — **`fetchWasteData`** only when user enables **Load Live Data** toggle (`wasteLiveData`). |
| **Engine refreshes?** | Yes — **`scheduler:expenses`** (`--expenses`). |
| **Claude / credits?** | **Yes** (`expenseProcessor`, `wasteDetector`). |
| **Safe without AI?** | **No** — flagged rows depend on AI scoring pipeline. |
| **UI real vs hardcoded** | **Hardcoded** roster (`rosterCA`, `rosterUS`, …) and built-in demo metrics until **live toggle** loads Firestore. |
| **Overwrite risk** | **`batchWrite` merge** — merges per doc id from flagged subset only. |

---

### 4. `waste_reports`

| Topic | Detail |
|-------|--------|
| **Approx. count / freshness** | **TBD**. One doc per country (`AU`/`CA`/`UK`/`US`) typical — **`generatedAt`** inside payload. |
| **Source** | **`waste_report.json`** after **`detectWaste`** (Claude) → **`uploadWasteReports`** uses **`batch.set(..., { merge: true })`** per jurisdiction doc id. |
| **App screen** | Same waste tracker + **`fetchWasteData`** — uses **`waste_reports`** for **`wasteReport`** state (first matching doc). |
| **Engine refreshes?** | Same **`scheduler:expenses`** cycle as `flagged_expenses`. |
| **Claude / credits?** | **Yes**. |
| **Safe without AI?** | **No**. |
| **UI real vs hardcoded** | Same toggle behavior as `flagged_expenses`. |
| **Overwrite risk** | **Merge** per country doc — fields present in new payload overwrite; absent keys may retain prior merge semantics. |

---

### 5. `expense_anomalies`

| Topic | Detail |
|-------|--------|
| **Approx. count / freshness** | **TBD**. Includes per-row anomalies + **`_summary_{jurisdiction}`** docs (`uploader.js`). |
| **Source** | **`detectLeaderAnomalies`** (Claude) → **`expense_anomalies.json`** → **`uploadExpenseAnomalies`**. |
| **App screen** | **No match** in `src/App.js` for this collection — **`ANOMALY_DATA`** hardcoded block (~L1601 / categories “Anomalies & Red Flags”) is **explicitly non-Firestore**. |
| **Engine refreshes?** | Yes — **`scheduler:leader-expenses`**. |
| **Claude / credits?** | **Yes**. |
| **Safe without AI?** | **No**. |
| **UI real vs hardcoded** | **Hardcoded anomalies** in UI; Firestore collection **not wired** to that section. |
| **Overwrite risk** | **`batchWrite` merge** for anomaly rows; summary docs merged separately. |

---

### 6. `expense_leaderboard`

| Topic | Detail |
|-------|--------|
| **Approx. count / freshness** | **TBD**. Docs per country + **`_global`** (`uploadLeaderboard`). |
| **Source** | **`buildLeaderboard`** (local from processed leader expenses) → **`expense_leaderboard.json`** → **`uploadLeaderboard`** (`set` with merge per section). |
| **App screen** | **No `App.js` reader found.** |
| **Engine refreshes?** | Yes — **`scheduler:leader-expenses`** (after AI steps). |
| **Claude / credits?** | **Indirect** — tier depends on Claude-enriched leader expense pipeline. |
| **Safe without AI?** | **No** — typically run after AI enrich + anomalies. |
| **UI real vs hardcoded** | Leaderboards in UI use **hardcoded** minister rosters in waste tracker — **not** this collection. |
| **Overwrite risk** | Per-doc **`set`** merge for country / `_global`. |

---

### 7. `contracts`

| Topic | Detail |
|-------|--------|
| **Approx. count / freshness** | **TBD**. Refreshed on **`scheduler:bimonthly`** (Phase A included **bimonthly**). |
| **Source** | Pipeline **`sources.json`** types **`contract`** → **`output/contract/`** → **`uploadContracts`**. Distinct from **`government_contracts`** ingestion. |
| **App screen** | **Main contracts cards query `government_contracts`** — **`contracts`** collection **not referenced** in `App.js` grep for `collection(db, 'contracts')`. |
| **Engine refreshes?** | Yes — **bimonthly**. |
| **Claude / credits?** | **No** on upload path (ingestion → JSON → merge write). |
| **Safe without AI?** | **Yes**. |
| **UI real vs hardcoded** | **Not used** by primary contracts views — **stale-risk for UI** unless another client reads it (inventory audit flagged dup story). |
| **Overwrite risk** | **`batchWrite` merge** — standard merge semantics. |

---

### 8. `government_contracts`

| Topic | Detail |
|-------|--------|
| **Approx. count / freshness** | **TBD**. Refreshed **`scheduler:monthly`** (Phase A **monthly** run). |
| **Source** | **`governmentContractsFetcher.js`** — CA open.canada CKAN, US USAspending, UK FTS OCDS, AU AusTender-style APIs → **`output/government_contracts/`** → **`uploadGovernmentContracts`**. |
| **App screen** | **`useEffect`** on **`contracts`**, **`us-contracts`**, **`uk-contracts`**, **`au-contracts`** → `getDocs` **`government_contracts`** where **`jurisdiction`**; **`renderContracts`** etc. use **`liveContracts`**. Hub tile uses **`liveContracts.CA?.length ?? 0` || 15** — **demo-like fallback count** when empty. |
| **Engine refreshes?** | Yes — **monthly**. |
| **Claude / credits?** | **No**. |
| **Safe without AI?** | **Yes**. |
| **UI real vs hardcoded** | **Live Firestore** when fetch succeeds; **empty → []** and UI may show zero rows — **card count** may still show **15** fallback. |
| **Overwrite risk** | **Deletes** stale docs per jurisdiction whose IDs are **not** in the new upload batch, then merge **`batchWrite`** — **destructive for orphaned IDs** by design (see `uploader.js`). |

---

## Consolidated answers (audit questions)

| # | Question | Answer |
|---|----------|--------|
| 1 | **Approximate document count** | **TBD** — Console / inventory script only; not in repo. |
| 2 | **Last updated / freshness** | Engine stamps **`last_updated`** / payload timestamps where implemented; **actual freshness** = last successful tier run (**monthly**/**bimonthly**/**expense**/**leader-expense**). Phase **A** refreshed **monthly** + **bimonthly** (so **`department_expenses`**, **`government_contracts`**, **`contracts`** align with that run). **Expense/waste** + **leader-expense** collections **not** refreshed by Phase **A** unless run separately. |
| 3 | **Source of data** | Open-government APIs + CKAN / USAspending / FTS / AusTender patterns (contracts); bespoke expense APIs (`expenseFetcher`, `departmentExpensesFetcher`, `leaderExpenseFetcher`); AI layers noted above. |
| 4 | **Which app screen** | See per-collection **App screen** rows; primary live surfaces: **department detail** pages (`department_expenses`), **contracts** views (`government_contracts`), **categories** waste tracker **with live toggle** (`flagged_expenses`, `waste_reports`). |
| 5 | **Engine refreshes?** | Yes — mapping in summary table. |
| 6 | **Uses Claude?** | **`leader_expenses`**, **`flagged_expenses`**, **`waste_reports`**, **`expense_anomalies`**, **`expense_leaderboard`** — **yes** (scheduler expense + leader-expense tiers). **`department_expenses`**, **`contracts`**, **`government_contracts`** — **no** on upload path. |
| 7 | **Safe refresh without AI?** | **`department_expenses`**, **`contracts`**, **`government_contracts`** — **yes**. Expense/waste/leader-derived collections — **no** without bypassing AI stages (not documented here). |
| 8 | **Real Firestore vs hardcoded** | See **Live vs demo** column — notable gaps: **leader_expenses** fetch unwired; **anomalies** UI hardcoded; **waste** demo until toggle; **contracts** vs **`government_contracts`** split. |
| 9 | **Overwrite risk** | **`government_contracts`** & **`department_expenses`** — **explicit delete of stale IDs** per jurisdiction. Others mostly **`merge: true`** — lower risk except field replacement on merge. |

---

## Recommended UI-first live-data improvements

*(UI-only plan — no engine changes, no scheduler runs, no Claude in product flows.)*

### 1. Screens that already read Firestore correctly

| Area | Component / route | Collection(s) | Notes |
|------|-------------------|---------------|--------|
| Leader Expenses | **`LeaderExpenses.js`** | **`department_expenses`** | Correct query path via **`fetchDepartmentExpenses`**; loads when **`leaderProfile`** has **`department`** / **`portfolio_title`**. |
| Contracts | **`GovernmentContracts.js`** | **`government_contracts`** | Loads via **`fetchGovernmentContracts`** when **`leaderProfile`** present; refresh supported. |
| Flagged | **`FlaggedExpenses.js`** | **`flagged_expenses`** | Loads via **`fetchFlaggedExpenses`** when **`leaderProfile`** present. |
| Waste | **`WasteReports.js`** | **`waste_reports`** | Loads via **`fetchWasteData`** when **`liveDataMode`** is true (after **Load Live Data**). |

### 2. Screens still showing hardcoded / demo data

| Area | Issue |
|------|--------|
| **Anomalies** | **`ExpenseAnomalies.js`** uses **`MOCK_ANOMALIES`** — does **not** read **`expense_anomalies`**. |
| **Leaderboard** | **`ExpenseLeaderboard.js`** uses **`MOCK_LEADERBOARD`** — does **not** read **`expense_leaderboard`**. |
| **Leader Expenses — hub tile** | **`App.js`** **`leaderExpenseStats`** fallback **`totalTransactions: 15`** when counts missing — reads as fake activity. |
| **Contracts — hub tile** | Same **`activeContracts: 15`** fallback — reads as fake depth. |
| **Waste** | Until **Load Live Data**, **`wasteData`** may stay **`INITIAL_WASTE_DATA`** (demo structure). |

### 3. **Load Live Data** — which screens and safe auto-load?

| Behavior | Collections touched | Safe to auto-load Firestore on dashboard mount? |
|----------|---------------------|---------------------------------------------------|
| **`liveDataMode`** gates **`fetchWasteData`** | **`waste_reports`** | **Yes** for reads only — same **`fetchWasteData`** the button calls; no Claude in client. Consider auto-enable after **`leaderProfile`** exists, or prefetch once without blocking render. |
| Default **`liveDataMode: false`** | — | Keeps first paint “demo”; product trade-off is UX vs always-live waste. |
| Leader expenses / contracts / flagged | **`department_expenses`**, **`government_contracts`**, **`flagged_expenses`** | **Already auto-fetch** when profile exists — no extra button for those. |

### 4. Wire **`expense_anomalies`** and **`expense_leaderboard`** into the UI?

| Collection | Recommendation |
|------------|----------------|
| **`expense_anomalies`** | **Yes, UI-first win** — replace **`MOCK_ANOMALIES`** with **`fetchExpenseAnomalies`** (+ loading / empty states). **Does not run Claude** in the client; only consumes docs produced by scheduler. |
| **`expense_leaderboard`** | **Yes, same pattern** — replace **`MOCK_LEADERBOARD`** with **`fetchExpenseLeaderboard`**. Same constraint: data must exist in Firestore from pipeline. |

### 5. **`contracts`** vs **`government_contracts`**

| Topic | Recommendation |
|-------|----------------|
| Source of truth | Treat **`government_contracts`** as **canonical** for the Contracts UI (**`GovernmentContracts.js`** already uses it). |
| Legacy **`contracts`** | **`App.js`** still reads **`contracts`** for hub **`contractIntel`** — consider **deprecating** that path or merging counts from **`government_contracts`** only, to avoid split-brain. Align with **`FIRESTORE_INVENTORY_AUDIT.md`**. |

### 6. Smallest safe UI change to feel “live” (no Claude)

1. Remove or gate hub fallbacks **`totalTransactions: 15`** / **`activeContracts: 15`** — show **0** or **“—”** when Firestore returned no aggregates.  
2. Optionally **auto-set `liveDataMode`** (or call **`fetchWasteData`** once) when **`leaderProfile`** is ready — **read-only**, same as the button.  
3. Wire **`fetchLeaderExpenses`** if product wants hub **`leaderExpenseStats`** from Firestore instead of static **`LEADER_EXPENSE_STATS`**.

---

## Follow-ups

1. Wire **`fetchLeaderExpenses`** into an appropriate **`useEffect`** or remove dead code — decide product-wise.  
2. Decide whether **`contracts`** remains legacy or can be deprecated if **`government_contracts`** is canonical (see `FIRESTORE_INVENTORY_AUDIT.md`).  
3. Optionally surface **`expense_leaderboard`** / **`expense_anomalies`** in UI or document as ops-only.  
4. Replace hub **fallback `15`** contracts count with explicit “no data” state if product prefers honesty over placeholder.

---

*Code references: `civic-voice-app/src/App.js` (fetches, waste toggle, contracts effect), `civic-voice-engine/src/scheduler.js`, `civic-voice-engine/src/firebase/uploader.js`, ingest fetchers named above.*
