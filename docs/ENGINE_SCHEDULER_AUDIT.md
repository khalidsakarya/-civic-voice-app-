# Engine live-data scheduler audit

**Purpose:** Map `civic-voice-engine` scheduler entry points to Firestore writes, credentials, AI usage, and app dependencies — **code-derived**, plus **operator Phase A completion** (§13).  
**Scope:** Scheduler scripts wired from `civic-voice-engine/package.json` and `src/scheduler.js`.  
**Not in scope:** One-off pipelines not invoked by the scheduler (unless noted). **`subnational_jurisdictions`** seed/enrich is **manual** (`seed:*`, `enrich:*` scripts), **not** cron-driven here.

**Ops note:** Phase **A** (no‑Claude refresh) was **completed by the operator** — see **§13**. Live **`scheduler_status`** timestamps should be confirmed in Firebase Console after runs (not stored in git).

---

## 1. Scheduler-related commands (`civic-voice-engine/package.json`)

| npm script | Command |
|------------|---------|
| `scheduler` | `node src/scheduler.js` — starts **node-cron** loops **and** runs **all** tiers once on startup |
| `scheduler:now` | `node src/scheduler.js --now` — runs **all** tiers **sequentially**, then exits |
| `scheduler:daily` | `node src/scheduler.js --daily` |
| `scheduler:weekly` | `node src/scheduler.js --weekly` |
| `scheduler:monthly` | `node src/scheduler.js --monthly` |
| `scheduler:bimonthly` | `node src/scheduler.js --bimonthly` |
| `scheduler:dryrun` | `node src/dryRun.js` — **cost/schedule printout only** (see §8 note) |
| `scheduler:expenses` | `node src/scheduler.js --expenses` |
| `scheduler:leader-expenses` | `node src/scheduler.js --leader-expenses` |
| `scheduler:budget-analytics` | `node src/scheduler.js --budget-analytics` |
| `scheduler:gov-stats` | `node src/scheduler.js --gov-stats` |
| `scheduler:targeted-stats` | `node src/scheduler.js --targeted-stats` |

**Related (not named `scheduler:*`):** Many `pipeline:*` / `ingest:*` / `upload:*` scripts call the same fetchers/uploaders the scheduler uses; they are **manual** alternatives to cron tiers.

---

## 2. What each scheduler command runs

### Daemon: `npm run scheduler`

- Registers cron jobs for: **daily**, **weekly**, **monthly**, **bimonthly**, **expense_weekly**, **leader_expense_weekly**, **budget_analytics**, **gov_stats_quarterly** (cron strings from env or defaults in `scheduler.js`).
- **On startup**, chains the **same** full sequence as `scheduler:now` (all tiers once — heavy).

### `scheduler:now`

Runs in order: **daily → weekly → monthly → bimonthly → expenses → leader-expenses → budget-analytics → gov-stats**, then `process.exit(0)`.

### Tier summaries (from `src/scheduler.js`)

| Flag / tier | Steps (high level) |
|-------------|---------------------|
| **`--daily`** | `runPipeline` (bill + vote sources from `config/sources.json`) → `processBillsFromOutput` (Claude per bill) → `scoreEfficiency` → `uploadBills`, `uploadVotes`, `uploadEfficiencyScores` → **if** `hasUpcomingElection()` → `fetchAllElections` + `uploadElections` |
| **`--weekly`** | `runPipeline` (legislator sources) → `uploadMembers` → member votes ingest/upload → attendance ingest/upload → bios ingest/upload → committees ingest/upload → promises ingest/upload → elections ingest/upload → department heads ingest/upload → **`validateAllCabinets`** (patches `department_heads`) |
| **`--monthly`** | `runPipeline` (efficiency_score, budget, audit, department_performance) → `fetchAllAuditFindings` → `scoreEfficiency` → `uploadMonthlyEfficiencyScores`, `uploadBudgetSpending`, `uploadAuditFindings`, `uploadDepartmentPerformance` → targeted fetch + **`uploadTargetedStats`** → department budgets / foreign aid / gov contracts / dept expenses fetch + uploads |
| **`--bimonthly`** | `runPipeline` (financial_disclosure, lobbying, contract, corporate_affiliation) → member disclosures + lobbying fetch → uploads (`financial_disclosures`, `lobbying_activity`, `contracts`, `corporate_affiliations`, `member_disclosures`, `member_lobbying`) → member expenses → stock trades → corporate affiliations (member + org uploads) |
| **`--expenses`** | `fetchAllExpenses` → `processExpenses` (Claude) → `detectWaste` (Claude) → `uploadFlaggedExpenses`, `uploadWasteReports` |
| **`--leader-expenses`** | `fetchAllLeaderExpenses` → `processLeaderExpenses` (Claude) → `detectLeaderAnomalies` (Claude) → `buildLeaderboard` → `uploadLeaderExpenses`, `uploadExpenseAnomalies`, `uploadLeaderboard` |
| **`--budget-analytics`** | `fetchAllBudgetAnalytics` → `scoreEfficiency` → `uploadBudgetData`, `uploadAnalyticsData` |
| **`--gov-stats`** | `fetchAllGovStats` → **`processGovStats` (Claude)** → `uploadGovStats` |
| **`--targeted-stats`** | `runTargetedFetch` → `uploadTargetedStats` (**does not** call `writeSchedulerStatus`) |

### `scheduler:dryrun` (`src/dryRun.js`)

Prints schedule + **estimated** AI cost for **only four** legacy tiers (**daily / weekly / monthly / bimonthly**) from its embedded `TIERS` array. It **does not** reflect expense, leader-expense, budget-analytics, gov-stats, or targeted tiers — treat it as **partial documentation**, not a full scheduler mirror.

---

## 3. Firestore collections written per tier

| Tier | Collections (from scheduler status + code paths) |
|------|---------------------------------------------------|
| **daily** | `bills`, `votes`, `efficiency_scores`; **+ `elections`** when election window logic fires |
| **weekly** | `members`, `member_votes`, `member_attendance`, `member_bios`, `member_committees`, `promise_tracker`, `elections`, `department_heads` — plus **`department_heads`** field patches via `validateCabinet` (`batch.update`) |
| **monthly** | `efficiency_scores_monthly`, `budget_spending`, `audit_findings`, `department_performance`, **`social_stats`** (targeted path), `department_budgets`, `foreign_aid`, `government_contracts`, `department_expenses` |
| **bimonthly** | `financial_disclosures`, `lobbying_activity`, `contracts`, `corporate_affiliations`, `member_disclosures`, `member_lobbying`, `member_expenses`, `member_stock_trades`, `member_corporate_affiliations` |
| **expense_weekly** | `flagged_expenses`, `waste_reports` |
| **leader_expense_weekly** | `leader_expenses`, `expense_anomalies`, `expense_leaderboard` |
| **budget_analytics** | `budget_data`, `analytics_data` |
| **gov_stats_quarterly** | `government_stats` |
| **targeted-stats** (manual flag) | `social_stats` (targeted upload path only) |

**Always updated when a tier completes status reporting:** `scheduler_status` (see §9).

---

## 4. Data sources & environment variables

### Required for any Firestore write

- **Firebase Admin:** `GOOGLE_APPLICATION_CREDENTIALS` **or** `FIREBASE_PROJECT_ID` + `FIREBASE_CLIENT_EMAIL` + `FIREBASE_PRIVATE_KEY` (`src/firebase/client.js`).

### AI (Anthropic)

- **`ANTHROPIC_API_KEY`** — used by:
  - **Daily:** `billProcessor` (per bill).
  - **Expense weekly:** `expenseProcessor`, `wasteDetector`.
  - **Leader expense weekly:** `leaderExpenseProcessor`, `leaderAnomalyDetector`.
  - **Gov stats quarterly:** `govStatsProcessor`.

### Legislative / open-data keys (representative)

| Env var | Used by (examples) |
|---------|---------------------|
| **`CONGRESS_API_KEY`** | US bills in `sources.json` (`api.congress.gov`); member bios fetcher (`DEMO_KEY` fallback in code) |
| **`OPENSTATES_API_KEY`** | OpenStates sources in `sources.json` |
| **`THEYWORKFORYOU_API_KEY`** | UK-related source in `sources.json` |
| **`FEC_API_KEY`** | Election fetcher (`DEMO_KEY` fallback) |

Many fetchers use **public HTTP** endpoints with **no key**; others **warn and continue** if keys are missing (`src/ingestion/fetcher.js`). **Exact behavior per country/source** requires tracing each fetcher (not expanded line-by-line here).

### Optional cron overrides

- `CRON_DAILY`, `CRON_WEEKLY`, `CRON_MONTHLY`, `CRON_BIMONTHLY`, `CRON_EXPENSE`, `CRON_LEADER_EXPENSE`, `CRON_BUDGET_ANALYTICS`, `CRON_GOV_STATS`

---

## 5. Which jobs are “safe to run now”

**Operational judgment (not a guarantee):**

- **Safest smoke test without AI cost:** `scheduler:dryrun` — **no network/Firestore** (but incomplete vs full scheduler — §2).
- **Requires Firebase credentials + stable quotas:** any tier that uploads (`--daily` through `--gov-stats`). Without keys, Admin init fails and uploads error.
- **Highest blast radius / runtime:** `scheduler` daemon (**runs all tiers on startup**) and `scheduler:now` (**full chain**). Prefer **`--weekly`**, **`--monthly`**, etc. for isolated testing.
- **`--targeted-stats`:** narrower write surface (`social_stats` only) but **non-merge overwrite** on those docs (§8).

**Stale-risk (data consumed by app):** See `docs/FIRESTORE_INVENTORY_AUDIT.md` — several scheduler-backed collections have **no confirmed `App.js` reader** (e.g. `votes`, `members` vs `congress_members`, `budget_spending`, `efficiency_scores_monthly`). Stale **means “UI may not refresh what users see”**, not necessarily “writes failed.”

---

## 6. Jobs that depend on AI credits

| Tier | Claude usage |
|------|----------------|
| **daily** | Yes — one analysis path per bill in `processBillsFromOutput` |
| **expense_weekly** | Yes — expense processing + waste detection |
| **leader_expense_weekly** | Yes — leader processing + anomaly detection |
| **gov_stats_quarterly** | Yes — `processGovStats` |
| **weekly, monthly, bimonthly, budget_analytics** | No Anthropic in scheduler paths listed |
| **targeted-stats** | No — fetch + upload only |

---

## 7. Jobs that may overwrite enrichment or curated fields

| Area | Risk |
|------|------|
| **`bills`** | **Mitigated:** `uploadBills` uses **`merge: true`** plus **`scrubBillPayloadForMerge`** — omits empty/null values for protected top-level keys (`summary`, argument arrays, vote tallies, review flags, etc.) so existing enrichment is not wiped by blank ingest (`uploader.js`). **Non-empty** new AI output **can** still update analysis fields. |
| **`votes`, `members`, most `batchWrite` collections** | **`batchWrite` uses `merge: true`** — absent keys in the payload are not deleted by merge, but **provided fields** overwrite previous values for those keys. |
| **`social_stats` (targeted)** | **`uploadTargetedStats` uses `set()` without `{ merge: true }`** — documented as intentional full replace for targeted docs **— can drop fields** not present in the new payload. |
| **`department_heads` (cabinet validation)** | **`update()`** patches specific fields when drift is detected — does not replace whole docs but **does overwrite** matched fields. |
| **`subnational_jurisdictions`** | **Not updated by this scheduler** — Phase 3B enrich is a **separate** script; no conflict from scheduler tiers above unless a future job is added. |

---

## 8. Merge-only writes (summary)

- **Default bulk path:** `batchWrite()` → **`set(..., { merge: true })`** for most collections.
- **Exceptions / special cases:**
  - **`uploadTargetedStats`** — **full document replace** (no merge) for successful targeted metrics.
  - **`uploadLiveStats`** / other social_stats paths (manual scripts) — verify individually if you enable them outside scheduler; monthly tier uses **`uploadTargetedStats`** from scheduler.
  - **`validateCabinet`** — **`batch.update`**, not `set` merge.
- **`scheduler_status`** — **`set`** on one doc per tier key (full doc each run)(§9).

---

## 9. What `scheduler_status` currently says

The engine writes **one document per tier key** to collection **`scheduler_status`** via `writeSchedulerStatus` in `civic-voice-engine/src/firebase/statusWriter.js`.

**Document IDs (tier keys) used:**

| Doc ID | Tier |
|--------|------|
| `daily` | Daily |
| `weekly` | Weekly |
| `monthly` | Monthly |
| `bimonthly` | Bimonthly |
| `expense_weekly` | Expense / waste |
| `leader_expense_weekly` | Leader expenses |
| `budget_analytics` | Budget + analytics |
| `gov_stats_quarterly` | Government stats |

**Fields written (typical):** `tier`, `lastRunAt`, `completedAt`, `durationMs`, `status` (`success` \| `error`), `collectionsUpdated`, `recordsUpdated`, `recordsSkipped`, `aiCallsMade`, `estimatedCostUSD` (Haiku-shaped estimate when `aiCallsMade > 0`), `nextScheduledRun`, `errorMessage`, `last_updated`.

**Weekly-only extra:** `cabinetChangesDetected` when success.

**Not written:** `--targeted-stats` standalone runs **do not** update `scheduler_status`.

### 9.1 Live inspection summary (read-only)

**Automation:** Workspace scripts without valid Admin PEM cannot read Firestore here; snapshots below are **operator‑verified in Firebase Console**.

**Firebase Console (manual):** **Full eight‑tier snapshot** recorded in §9.2 / §9.2c (operator paste).

Use §9.2 options **A–C** when you want to refresh this doc from CLI/inventory later.

**Option A — Firebase Console**

1. Open [Firebase Console](https://console.firebase.google.com/) → your project → **Firestore Database**.
2. Collection **`scheduler_status`**.
3. For each document, note **`lastRunAt`** / **`completedAt`**, **`status`**, and **`errorMessage`** (if present).

**Option B — Read-only CLI (local)**

From `civic-voice-app` with a **real** service account JSON path:

```bash
set GOOGLE_APPLICATION_CREDENTIALS=C:\path\to\service-account.json
node -e "const admin=require('firebase-admin'); admin.initializeApp({credential:admin.credential.applicationDefault(),projectId:'civic-voice-5ea94'}); admin.firestore().collection('scheduler_status').get().then(s=>{s.forEach(d=>console.log(JSON.stringify({id:d.id,...d.data()},null,2)))});"
```

**Option C — Inventory audit (reads many collections)**

`npm run audit:firestore-inventory` includes `scheduler_status` if listed in `FIRESTORE_INVENTORY_AUDIT.md`; output goes to `docs/FIRESTORE_INVENTORY_LIVE_REPORT.md` (local file only).

---

### 9.2 Report checklist (fill from Console / CLI)

| # | Question | How to answer |
|---|----------|----------------|
| 1 | Which documents exist? | List every doc ID under `scheduler_status`. Expected keys are in the table above; extra IDs imply custom / legacy writes. |
| 2 | Last run per tier | Prefer **`completedAt`** (end); **`lastRunAt`** is start — both ISO strings. |
| 3 | Status per tier | Field **`status`**: `success` or `error`. |
| 4 | Last error | If **`status` === `error`**, copy **`errorMessage`**. If success, note **none**. |
| 5 | Never run | Any **expected doc ID missing** entirely → that tier has **never completed** a status write (or collection empty). **`targeted-stats`** never writes here by design. |
| 6 | Stale | Compare **`completedAt`** to the tier’s intended cadence (§11). Rough guides: **daily** older than ~36h → stale; **weekly** older than ~10d; **monthly** older than ~45d; **bimonthly** older than ~20d since last completed run; **gov_stats_quarterly** older than ~120d. Treat as **heuristic** if cron was paused or `--now` was used ad hoc. |
| 7 | Safest single job to run **first** (later) | See §9.3–§9.4 (no‑AI phases vs Claude phases). |

**Summary table — Firebase Console (operator-provided, full tier set):**

| Doc ID | completedAt (UTC) | status | aiCallsMade | estimatedCostUSD | recordsUpdated (if given) | collectionsUpdated (as observed) |
|--------|-------------------|--------|-------------|------------------|---------------------------|----------------------------------|
| `daily` | `2026-05-06T00:06:29.981Z` | success | `0` | `0` | *(see §9.2c)* | `bills`, `votes`, `efficiency_scores`, `elections` |
| `weekly` | `2026-04-12T23:15:02.713Z` | success | `0` | *(not in paste)* | *(not in paste)* | `members`, `member_votes`, `member_attendance`, `member_bios`, `member_committees`, `promise_tracker`, `elections`, `department_heads` |
| `monthly` | `2026-04-12T23:44:26.682Z` | success | `0` | *(not in paste)* | *(not in paste)* | `efficiency_scores_monthly`, `budget_spending`, `audit_findings`, `department_performance`, `social_stats`, `department_budgets`, `foreign_aid` |
| `bimonthly` | `2026-04-12T23:19:24.858Z` | success | `0` | *(not in paste)* | `2330` | `financial_disclosures`, `lobbying_activity`, `contracts`, `corporate_affiliations`, `member_disclosures`, `member_lobbying`, `member_expenses`, `member_stock_trades`, `member_corporate_affiliations` |
| `budget_analytics` | `2026-04-12T23:33:03.397Z` | success | *(not in paste)* | *(not in paste)* | `8` | `budget_data`, `analytics_data` |
| `expense_weekly` | `2026-04-12T23:20:58.722Z` | success | *(not in paste)* | `0.043136` | `27` | `flagged_expenses`, `waste_reports` |
| `leader_expense_weekly` | `2026-04-12T23:32:12.357Z` | success | `40` | `0.10784` | *(not in paste)* | `leader_expenses`, `expense_anomalies`, `expense_leaderboard` |
| `gov_stats_quarterly` | `2026-04-12T23:36:12.386Z` | success | `3` | `0.008088` | *(not in paste)* | `government_stats` |

**Operator conclusion:** The scheduler **has completed successfully** for all listed tiers. **`daily`** has the latest **`completedAt`** (**2026‑05‑06**). **All other instrumented tiers** share the same older calendar day (**2026‑04‑12**) in this snapshot — treat **`weekly`**, **`monthly`**, **`bimonthly`**, **`budget_analytics`**, **`expense_weekly`**, **`leader_expense_weekly`**, and **`gov_stats_quarterly`** as **stale vs their intended cadences** until the next successful runs.

**Gap note:** Code paths for **`monthly`** can also populate **`government_contracts`** and **`department_expenses`** (see §3). If those collections are absent from **`collectionsUpdated`** for this run, the engine may have skipped uploads (empty ingest, early exit, or different code revision); compare with §3 when investigating.

### 9.2c Extra fields — `daily` (earlier paste, still valid)

| Field | Value |
|-------|--------|
| lastRunAt | `2026-05-06T00:06:09.437Z` |
| recordsUpdated | `84` |
| recordsSkipped | `52` |

**Interpretation:** **`aiCallsMade: 0`** on **`daily`** means the **recorded run** charged **no bill AI calls** in **`scheduler_status`** (e.g. all bills skipped/failed before Claude, or pipeline produced no chargeable successes). The **`daily`** tier **normally** invokes Claude when bills are processed (`processBill`); treat **`aiCallsMade`** as **run‑specific**, not “tier never uses AI.”

---

### 9.3 Safest single commands (quick reference)

| Priority | Command (`civic-voice-engine`) | Why |
|----------|-------------------------------|-----|
| **Zero Firestore** | `npm run scheduler:dryrun` | No ingest / no writes — schedule + rough cost printout only (`src/dryRun.js`; omits some tiers — §2). |
| **Narrow write, no Claude** | `npm run scheduler:targeted-stats` | **`social_stats`** (targeted path) only; **does not** write **`scheduler_status`**. |

Avoid **`scheduler:now`** or **`npm run scheduler`** until you intend to run the **full** chain.

---

### 9.4 Recommended phased refresh order (defer paid AI)

Use this when you want to **refresh Firestore incrementally** and **avoid Anthropic spend first**. Each line is one **`npm run …`** from **`civic-voice-engine`**. **Still optional:** pause between steps and re‑check Console.

#### Phase A — No Anthropic / Claude (only open‑data + deterministic processing + merge uploads)

**Status:** **Complete** (operator handoff). Commands executed from **`civic-voice-engine`** (exact order as run):

1. `npm run scheduler:budget-analytics`
2. `npm run scheduler:weekly`
3. `npm run scheduler:monthly`
4. `npm run scheduler:bimonthly`
5. `npm run scheduler:targeted-stats`

*(Recommended doc order had **`targeted-stats` first** — operational order above is acceptable.)*

| Step | Command | Collections touched (typical) | Notes |
|------|---------|------------------------------|--------|
| A1 | `scheduler:targeted-stats` | `social_stats` | Optional first “needle‑motion” write; **non‑merge replace** on targeted docs — see §8. Does **not** update **`scheduler_status`**. |
| A2 | `scheduler:budget-analytics` | `budget_data`, `analytics_data` | Small **`recordsUpdated`** in last snapshot (**8**); runs local **`scoreEfficiency`** — **no Claude** in this tier. |
| A3 | `scheduler:weekly` | `members`, `member_*`, `promise_tracker`, `elections`, `department_heads` + cabinet validation patches | Large HTTP surface; **no Claude** in scheduler wiring. |
| A4 | `scheduler:monthly` | See §3 monthly row | Broad; **no Claude** in scheduler wiring. |
| A5 | `scheduler:bimonthly` | See §3 bimonthly row | Broad; **no Claude** in scheduler wiring. |

#### Phase B — Anthropic / Claude (after Phase A if approved)

Order by **last observed Anthropic footprint** (lower first — your Console snapshot); **`daily`** last because bill volume can scale API calls heavily even when a single run shows **`aiCallsMade: 0`**.

| Step | Command | Reason to defer |
|------|---------|-----------------|
| B1 | `scheduler:gov-stats` | **`gov_stats_quarterly`** last run: **`aiCallsMade: 3`**, **`estimatedCostUSD` ~ 0.008** |
| B2 | `scheduler:expenses` | **`expense_weekly`**: **`estimatedCostUSD` ~ 0.043** (Claude in expense + waste paths) |
| B3 | `scheduler:leader-expenses` | **`leader_expense_weekly`**: **`aiCallsMade: 40`**, **`estimatedCostUSD` ~ 0.108** |
| B4 | `scheduler:daily` | **`daily`**: per‑bill Claude when processing succeeds; **highest ceiling** when many bills ingest |

**Do not** treat **`daily`** as “free” because one snapshot showed **`aiCallsMade: 0`** — later runs may invoke Claude for each processed bill.

---

## 10. App feature dependence (high level)

Derived from `docs/FIRESTORE_INVENTORY_AUDIT.md` “Feature → primary collection(s)” and scheduler §3:

| User-facing domain | Scheduler-fed collections (direct or indirect) |
|--------------------|-----------------------------------------------|
| Bills / legislative | `bills`, `votes` (votes reader unclear), `efficiency_scores` |
| Elections | `elections` (daily conditional + weekly) |
| Members / profiles | `members`, `member_*` (note US roster may prefer `congress_members` — separate pipeline) |
| Promises | `promise_tracker` |
| Cabinet / departments | `department_heads` |
| Money / transparency prefetch | `budget_data`, `analytics_data`, `government_stats`, `foreign_aid`, `government_contracts`, `department_expenses`, `social_stats`, `flagged_expenses`, `waste_reports`, `leader_expenses`, … |
| Ops | `scheduler_status` (no app UI today) |

---

## 11. Recommended run frequency

Align with **existing cron defaults** in `scheduler.js` unless ops constraints differ.

| Cadence | Jobs |
|---------|------|
| **Daily** | **Daily tier** (bills, votes, efficiency_scores; elections when window hits) |
| **Weekly** | **Weekly tier** (members + member satellites + promises + elections + department_heads + cabinet validation); **expense_weekly** (Wed default); **leader_expense_weekly** (Thu default) |
| **Monthly** | **Monthly tier** (scores monthly, budget_spending, audits, performance, targeted→social_stats, dept budgets, foreign aid, contracts, dept expenses); **budget_analytics** (1st default) |
| **Quarterly** | **gov_stats_quarterly** (Jan/Apr/Jul/Oct 1st default) |

**Bimonthly (twice per month):** **bimonthly tier** (1st & 15th default) — map to **“twice monthly”** rather than calendar quarter.

---

## 12. Phase A completion log (no‑Claude refresh)

**Recorded:** Operator completion handoff after **`civic-voice-engine`** Phase **A** runs. **Claude / Phase B not started** per operator.

### Jobs executed

| # | npm script | Firestore `scheduler_status` doc ID | Writes status doc? |
|---|------------|-------------------------------------|--------------------|
| 1 | `scheduler:budget-analytics` | `budget_analytics` | Yes |
| 2 | `scheduler:weekly` | `weekly` | Yes |
| 3 | `scheduler:monthly` | `monthly` | Yes |
| 4 | `scheduler:bimonthly` | `bimonthly` | Yes |
| 5 | `scheduler:targeted-stats` | *(none)* | **No** — by design (`src/scheduler.js` does not call `writeSchedulerStatus` for this flag) |

**Verify in Console:** Each tier that writes status should show **`status: success`**, updated **`completedAt`**, and **`collectionsUpdated`** aligned with §3. For **`targeted-stats`**, confirm **`social_stats`** documents updated instead.

### Collections touched by Phase A (union)

Operator refresh touched data written by these tiers — **union** of typical targets (see §3):

- **`budget_data`**, **`analytics_data`** — `budget-analytics`
- **`members`**, **`member_votes`**, **`member_attendance`**, **`member_bios`**, **`member_committees`**, **`promise_tracker`**, **`elections`**, **`department_heads`** — `weekly` (plus cabinet **`update`** patches on `department_heads`)
- **`efficiency_scores_monthly`**, **`budget_spending`**, **`audit_findings`**, **`department_performance`**, **`social_stats`** (monthly includes targeted upload path), **`department_budgets`**, **`foreign_aid`**, **`government_contracts`**, **`department_expenses`** — `monthly`
- **`financial_disclosures`**, **`lobbying_activity`**, **`contracts`**, **`corporate_affiliations`**, **`member_disclosures`**, **`member_lobbying`**, **`member_expenses`**, **`member_stock_trades`**, **`member_corporate_affiliations`** — `bimonthly`
- **`social_stats`** — again via **`targeted-stats`** (targeted doc IDs; may overlap keys already written in **`monthly`**)

### Operator‑reported outcome

- **Warnings/errors:** None captured in handoff — **review local terminal output** for HTTP/API skips if anything looked wrong.
- **Next:** **Phase B** (Anthropic) — see §9.4 **Phase B** and **`docs/ENGINE_COST_AND_CREDIT_AUDIT.md`** §3.

---

## 13. Follow-ups (optional)

1. Refresh **`dryRun.js`** `TIERS` to include expense, leader-expense, budget-analytics, gov-stats (and optionally targeted) so CLI projections match production scheduler.
2. Paste **post‑Phase A** **`completedAt`** / **`collectionsUpdated`** rows into **§9.2** when you next snapshot Firebase Console.
3. Confirm **`members` vs `congress_members`** story before relying on weekly uploads for US UX.

---

*Generated from repo inspection: `civic-voice-engine/src/scheduler.js`, `package.json`, `src/firebase/uploader.js`, `src/firebase/statusWriter.js`, `src/dryRun.js`, `config/sources.json`, and `civic-voice-app/docs/FIRESTORE_INVENTORY_AUDIT.md`. **§9.2 live rows:** Firebase Console (operator). **§12 Phase A:** operator completion handoff; **Phase B / Claude not run.** Doc maintenance did not execute schedulers or write Firestore.*
