# Engine cost & Anthropic credit audit

**Purpose:** Track **which scheduler tiers spend Anthropic API credits**, approximate cost signals from **`scheduler_status`**, and **Phase A / Phase B** approval gates.

**Related:** **`docs/ENGINE_SCHEDULER_AUDIT.md`** (full scheduler map, **`scheduler_status`** shape, §12 Phase A log).

**Firestore:** This doc does **not** query Firestore from git; **`estimatedCostUSD`** / **`aiCallsMade`** on tier docs are written by `civic-voice-engine/src/firebase/statusWriter.js` using Haiku‑style token assumptions.

---

## 1. Anthropic usage by tier (scheduler wiring)

| Tier (npm script) | Claude / Anthropic? | Notes |
|-------------------|---------------------|--------|
| `scheduler:daily` | **Yes** | `billProcessor` — per‑bill when pipeline succeeds |
| `scheduler:expenses` | **Yes** | `expenseProcessor`, `wasteDetector` |
| `scheduler:leader-expenses` | **Yes** | `leaderExpenseProcessor`, `leaderAnomalyDetector` |
| `scheduler:gov-stats` | **Yes** | `govStatsProcessor` |
| `scheduler:budget-analytics` | **No** | Fetch + local **`scoreEfficiency`** + uploads |
| `scheduler:weekly` | **No** | HTTP ingest + uploads + cabinet validation |
| `scheduler:monthly` | **No** | Same pattern |
| `scheduler:bimonthly` | **No** | Same pattern |
| `scheduler:targeted-stats` | **No** | Fetch + **`uploadTargetedStats`** |

**Environment:** **`ANTHROPIC_API_KEY`** required for any Phase **B** tier.

---

## 2. Phase A — no‑Claude refresh (**complete**)

**Status:** **Completed** (operator). **Phase B not approved / not run** per operator handoff.

**Commands executed** (from **`civic-voice-engine`**):

1. `npm run scheduler:budget-analytics`
2. `npm run scheduler:weekly`
3. `npm run scheduler:monthly`
4. `npm run scheduler:bimonthly`
5. `npm run scheduler:targeted-stats`

**Anthropic spend for Phase A:** **$0** by design (tiers above).

**Operational note:** **`scheduler:targeted-stats`** does **not** write **`scheduler_status`** — there is **no** tier doc to show cost or **`completedAt`** for that run; validate **`social_stats`** in Console or logs instead.

---

## 3. Phase B — paid AI (pending approval)

Run **only after explicit approval** of Anthropic usage and budget.

| Order | Command | `scheduler_status` doc | Last snapshot cost signals (Console, **pre‑Phase A** historic rows) |
|-------|---------|------------------------|----------------------------------------------------------------------|
| B1 | `npm run scheduler:gov-stats` | `gov_stats_quarterly` | **`aiCallsMade`:** 3 · **`estimatedCostUSD`:** ~0.008 |
| B2 | `npm run scheduler:expenses` | `expense_weekly` | **`estimatedCostUSD`:** ~0.043 |
| B3 | `npm run scheduler:leader-expenses` | `leader_expense_weekly` | **`aiCallsMade`:** 40 · **`estimatedCostUSD`:** ~0.108 |
| B4 | `npm run scheduler:daily` | `daily` | Variable · prior snapshot showed **`aiCallsMade`:** 0 on one run — **do not assume zero** for future runs |

**Recommendation:** Prefer **B1 → B4** ascending by typical footprint (**gov-stats** smallest in historic snapshot; **`daily`** highest ceiling when many bills process).

**Avoid until intentional:** `npm run scheduler:now` / `npm run scheduler` — runs **all** tiers including multiple Claude paths.

---

## 4. Follow-ups

1. After Phase **B** runs, paste fresh **`scheduler_status`** **`estimatedCostUSD`** / **`aiCallsMade`** from Firebase Console into this doc or **`ENGINE_SCHEDULER_AUDIT.md`** §9.2.
2. Reconcile **`estimatedCostUSD`** with Anthropic **billing dashboard** — status writer uses **fixed token assumptions**, not vendor‑exact usage.

---

*Phase A completion recorded from operator handoff. Doc maintenance did not run engines or write Firestore.*
