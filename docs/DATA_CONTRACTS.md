# Firestore / API data contract map (Civic Voice)

**Purpose:** Before adding or changing features, every screen must map to a **single** source of truth (SoT) here. This prevents duplicate collections, wrong Firestore paths, unlabeled editorial copy, and fake data shown as official.

**Rules**

1. **No new Firestore collection** without a row in this file explaining why **existing** collections cannot hold the same data.
2. **Official** government or agency text may only be shown when the SoT is that agency (or a mirror you control) and the UI names the source.
3. **Editorial / AI / Civic Voice** summaries, pros/cons, or narratives must use labels defined in [§ Editorial](#editorial--non-official-content) — never implied as Federal Register / Congress.gov / official filings.
4. **Live / cached official** flows must surface **source name** and **last updated** (from Firestore fields or API metadata) where the UI presents aggregates.
5. **User votes** are Civic Voice-only; they are not transmitted to government endpoints.

**Implementation reference:** Primary wiring lives in `src/App.js` unless noted.

---

## Data type legend

| Tag | Meaning |
|-----|---------|
| **official_source** | Primary agency/source dataset (e.g. Federal Register URLs, Congress.gov-derived rows). |
| **cached_official** | Snapshot or extract you ingested from an official source; freshness depends on engine schedule. |
| **estimated** | Derived estimate with methodology (must be labeled). |
| **modeled** | Synthetic / generated examples — never labeled official. |
| **editorial** | Civic Voice or partner-written narrative. |
| **user_vote** | Local + optional Firestore aggregates from app users only. |

---

## Priority features (contract rows)

Each subsection follows: **Feature → Views → UI reads → Canonical collection/API → Key fields → SoT → Data types → Refresh → Empty/error → Demo allowed → Never-official fields → Risks/indexes.**

---

### Executive Orders

| Item | Contract |
|------|------------|
| **Views** | `executive-orders` (from hub `president-executive`). |
| **UI reads** | Firestore `executive_actions` (`EXECUTIVE_ACTIONS_COLLECTION`). |
| **Also used** | Generic read-only **Firestore debug panel** (`src/dev/FirestoreDebugPanel.jsx`) when `NODE_ENV=development` or `REACT_APP_FIRESTORE_DEBUG` / `REACT_APP_EXECUTIVE_ACTIONS_DEBUG` — use presets or filters to audit this collection. |
| **Required filters (client)** | `jurisdiction == "US"`, `source_name == "Federal Register"`, president slug/name (`executiveOrderDocumentTypes.js`), **`isExecutiveOrderDoc`** (allowlisted `type` + subtype slug `executive_order`; rejects proclamation/memorandum). |
| **Key fields** | `type`, `title`, `date`, `source_url`, `last_updated`, `politician_slug`, `member_name`, optional `executive_order_number` / `eo_number`, `abstract`. |
| **SoT** | **Federal Register** (linked via `source_url`). |
| **Data types** | Row metadata: **official_source** / **cached_official** (depends on ingest). Abstract text from FR = official excerpt; Civic overlays = **editorial**. |
| **Refresh** | Driven by your ingestion/sync pipeline into `executive_actions`; UI shows latest `last_updated` aggregate on screen. |
| **Empty / error** | Empty state copy when no rows match filters; no dependency on `executive_orders` for the **UI**. |
| **Demo / fallback** | Static demo list **only** if `REACT_APP_EXECUTIVE_ORDERS_DEMO_MODE=true` (bundled sample — **not** Firestore). |
| **Never show as official** | `plainLanguageSummary`, `argumentsFor` / `argumentsAgainst` unless labeled editorial / reviewed per field semantics. |
| **Risks / indexes** | Composite query `jurisdiction` + `source_name` may require a Firestore composite index; debug panel falls back to single-field query + in-memory filter. |
| **Related collection** | `executive_orders` — **optional Admin sync target only** (`engine/sync-us-executive-orders.cjs`). **Not used by the React app** for this screen. Do not reintroduce without updating this contract. |

---

### Bills signed by the President

| Item | Contract |
|------|------------|
| **Views** | `bills-signed-laws`. |
| **UI reads** | **GET** `/api/congress-signed-laws?congress=<n>` (Vercel serverless → Congress.gov API v3). **Not** Firestore for the bill list. |
| **Server** | `api/congress-signed-laws.js`; requires **`CONGRESS_API_KEY`** on the host (never `REACT_APP_*`). |
| **Key fields** | Congress bill id, title, latest action text, public law / enactment indicators, link to Congress.gov. |
| **SoT** | **Congress.gov** (via your API route). |
| **Data types** | **official_source** for bill metadata; merged **editorial** overlay via `SIGNED_LAW_EDITORIAL_BY_BILL_KEY` in `App.js` when keyed to a live bill. |
| **Refresh** | Per request / deploy; Congress.gov is live upstream. |
| **Empty / error** | Typed failure messages (`CONGRESS_SIGNED_LAWS_*` constants): missing API key, wrong host (`npm start` without `/api`), upstream errors — **no sample bill fallback** for production messaging. |
| **Demo / fallback** | **None** for signed-law rows (explicitly “live-only” in comments). |
| **Never show as official** | Editorial overlay summaries/pros/cons — must be labeled Civic Voice / editorial when merged. |
| **Risks / indexes** | Route must be deployed (e.g. Vercel). Local dev: `npx vercel dev`. |

---

### President & Executive (hub + detail)

| Item | Contract |
|------|------------|
| **Views** | `president-executive` (hub), `president-detail` (Trump profile). |
| **UI reads** | Hub navigation only on hub; profile combines **static / bundled** narrative sections with **Firestore** where wired (see below). |
| **Firestore** | `elections` (prefetch US exec views), `department_heads` (`jurisdiction == US` — cabinet preview), `executive_actions` **leader slice**: same collection, query `member_name == 'Donald Trump'` for **Key Executive Actions** strip (not EO-filtered — includes multiple presidential types). |
| **SoT** | Mixed: **official_source** for FR-linked `executive_actions` rows; **editorial/modeled** for hard-coded bio/policy cards unless sourced elsewhere. |
| **Votes** | President approval votes: **user_vote** + Firestore `vote_counts` / `citizen_votes` via `submitVote` (`president`). |
| **Demo / fallback** | Many leader narrative blocks are **editorial** / static — must not be labeled Federal Register. |
| **Never show as official** | Static scandal/anecdote arrays and qualitative scores unless tied to a cited dataset. |

---

### Federal Departments

| Item | Contract |
|------|------------|
| **Views** | `departments`, `department-detail` (US); analogous ministry/department views for CA/UK/AU. |
| **UI reads** | Firestore **`federal_departments`** with `jurisdiction` in `US` | `CA` | `UK` | `AU` (loaded when entering mapped views — see `viewJurMap` in `App.js`). |
| **Key fields** | `name` / `department_name`, `budget_authority`, `fiscal_year`, `leader_name`, `leader_title`, `political_party`, `currency`, `last_updated`, US-specific `financial_classification`. |
| **SoT** | Your ingestion pipeline into **`federal_departments`** (treat as **cached_official** / departmental disclosure depending on upstream). |
| **Refresh** | Engine / ETL schedule; UI prefers `last_updated` when deduping duplicate docs per dept key. |
| **Also hydrates** | In-memory maps **`deptBudgetData`** / **`deptHeadsData`** (not separate collections — compatibility shim only). |
| **budget_validation** | Optional Firestore **`budget_validation`** (`jurisdiction`, `department`) — validation metadata. |
| **Empty / error** | Warn + empty lists; console diagnostics for CA name mismatches. |
| **Never show as official** | Shim totals must not claim live Treasury submission unless field indicates verified source. |

---

### Department budgets (operational spend views)

| Item | Contract |
|------|------------|
| **Views** | Primarily `department-detail`, ministry/department detail variants; fed totals also feed hub cards via **`fetchBudgetData('US')`** from `categories` (US). |
| **UI reads** | **`department_expenses`** — `jurisdiction` + `department` (with CA/UK/AU name mapping tables); **`budget_data`** — `jurisdiction` for macro budget charts/totals on money dashboards. |
| **Key fields** | `department_expenses`: nested `travel_expenses`, `hospitality_expenses`, `flagged_items`, etc.; **`budget_data`**: jurisdiction-wide aggregates + `last_updated` / `generatedAt`. |
| **SoT** | **cached_official** / **estimated** depending on ingest documentation — label in UI if estimated. |
| **Refresh** | Ingest schedule; UI picks latest budget doc by timestamp helpers. |
| **Empty / error** | Empty arrays; US tries alternate department string. |
| **Modeled code risk** | `genDeptExpenses()` exists in `App.js` as **deterministic synthetic** generator — **currently unused** (no call sites). **Do not wire to production UI** without labeling **modeled**. |

---

### Where the Money Goes / Financial dashboard

| Item | Contract |
|------|------------|
| **Views** | `money-canada`, `money-usa`, `money-uk`, `money-australia` (`renderFinancialDashboard`). Tabs: `overview`, `money-flow`, `programs`, `audit`, `results`. |
| **UI reads** | **`budget_data`** (`jurisdiction`), **`analytics_data`** (`country`), **`government_stats`** / **`social_stats`** (`country`), **`audit_findings`** when tab `audit` active (`jurisdiction`). |
| **SoT** | Mixed **cached_official** aggregates + internal analytics — each card should cite source field where present. |
| **Refresh** | fetch on view open + tab; `budgetLastUpdated` / `analyticsLastUpdated` set client-side on successful fetch (consider replacing with field from newest doc). |
| **Empty / error** | Graceful empty charts; console warnings. |

---

### Cabinet / Department Heads

| Item | Contract |
|------|------------|
| **Views** | Trump cabinet section (`president-detail`), lists using cabinet fetch. |
| **UI reads** | Firestore **`department_heads`** (`jurisdiction == 'US'` for US cabinet list). |
| **SoT** | **cached_official** (organizational structure / appointments — depends on ingest). |
| **Related** | **`federal_departments`** leader fields used in shim — keep names aligned with `department_heads`. |

---

### Voting / civic feedback

| Item | Contract |
|------|------------|
| **Views** | All flows using `votePresident`, `voteEO`, `votePM`, `voteMP`, bill votes, department votes, etc. |
| **Client state** | `localStorage` keys (`cvEOVotes`, etc.) for UX continuity. |
| **Firestore writes** | **`vote_counts`** documents merged by id via `setDoc` (`submitVote`); **`citizen_votes`** `addDoc` per event (optional telemetry); **`department_votes`** `setDoc` for dept approve/disapprove (`submitDeptVote`). |
| **Data types** | **user_vote** only — **not** official government input. |
| **UI** | Disclaimers required on EO and signed-law flows (`EO_VOTES_DISCLAIMER`, `SIGNED_LAW_VOTES_DISCLAIMER`). |

---

### Expenses (department / leader)

| Item | Contract |
|------|------------|
| **Views** | Department/ministry detail views (`department-detail`, `uk-department-detail`, etc.), waste tracker sections. |
| **UI reads** | **`department_expenses`** (per dept), **`leader_expenses`** (`country`), **`member_expenses`** (ingestion scripts — member-level). |
| **SoT** | **cached_official** when ingested from disclosures; line items must retain provenance fields if added. |

---

### Contracts

| Item | Contract |
|------|------------|
| **Views** | `contracts` (CA), `us-contracts`, `uk-contracts`, `au-contracts`. |
| **UI reads** | Firestore **`government_contracts`** (`jurisdiction` filter). |
| **Key fields** | `contractor_name`, amounts, agency — exact schema per jurisdiction ingest. |
| **SoT** | **cached_official** (procurement disclosure). |

---

### Lobbying

| Item | Contract |
|------|------------|
| **Views** | Member panels / money flows using lobbying correlations; member detail `member_lobbying`. |
| **UI reads** | **`member_lobbying`** (`member_name` / keys per member); **`lobbying_correlations`** (`country`) for aggregate correlation UI. |
| **SoT** | **cached_official** from filings / your correlation engine (`src/processing/lobbyCorrelator.js` writes `lobbying_correlations`). |

---

### Stock trades

| Item | Contract |
|------|------------|
| **Views** | US Congress member disclosure UI (`member_stock_trades` queries in effects). |
| **UI reads** | Firestore **`member_stock_trades`** keyed by `bioguide_id` or `member_name` variants. |
| **SoT** | **cached_official** (disclosure-derived). |

---

### Supreme Court (and high courts)

| Item | Contract |
|------|------------|
| **Views** | `supreme-court` (CA), `us-supreme-court`, `uk-supreme-court`, `au-high-court`. |
| **UI reads** | **`supreme_court_justices`**, **`supreme_court_cases`** — both filtered by `jurisdiction` (`CA` / `US` / `UK` / `AU`). |
| **SoT** | **cached_official** (court roster + docket summaries — depends on ingest). |

---

## Editorial & non-official content

| Mechanism | Location | Rule |
|-----------|----------|------|
| EO demo dataset | `EXECUTIVE_ORDERS_DEMO_DATA` | Only when `REACT_APP_EXECUTIVE_ORDERS_DEMO_MODE=true`. |
| Signed-law editorial overlay | `SIGNED_LAW_EDITORIAL_BY_BILL_KEY` | Merge only when key matches live bill; label as editorial in UI when shown. |
| EO abstract vs Civic summary | `mapExecutiveActionsOrderDoc` + modal | FR abstract = official excerpt; `plainLanguageSummary` + `summaryType == ai_assisted_editorial` = **editorial**. |
| Static leader narratives | Various render functions | **Editorial** — not agency filings. |

---

## Firestore collection index (alphabetical)

| Collection | Typical role |
|------------|----------------|
| `analytics_data` | Country analytics payloads (money/analytics views). |
| `audit_findings` | Money dashboard audit tab. |
| `budget_data` | Jurisdiction budget aggregates. |
| `budget_validation` | Optional validation rows per dept/jurisdiction. |
| `bills` | Jurisdiction-scoped bill feeds (non–Congress.gov paths). |
| `citizen_votes` | Append-only vote events (optional analytics). |
| `controversies` | Leader controversy rows by `person_name`. |
| `credit_card_spending` | Country-level credit card datasets. |
| `department_expenses` | Per-department expense breakdowns. |
| `department_heads` | Cabinet / secretary roster by jurisdiction. |
| `department_votes` | Dept approve/disapprove aggregates. |
| `elections` | Election tracker / prefetch. |
| `executive_actions` | **Primary** presidential document index for EO UI + leader strips. |
| `executive_orders` | **Optional** Admin sync target only — **not** read by Executive Orders UI. |
| `federal_departments` | Department budgets / heads for fed dept explorer. |
| `flagged_expenses` | Waste tracker “live” expenses. |
| `foreign_aid` | Waste tracker + dashboards (`jurisdiction`). |
| `government_contracts` | Contracts by jurisdiction. |
| `government_stats` | Macro stats by `country`. |
| `leader_expenses` | Leader-level expense rows. |
| `leader_profile_data` | Leader profile enrichments. |
| `lobbying_correlations` | Aggregated lobbying conflict signals. |
| `member_*` | bios, committees, disclosures, expenses, lobbying, stock trades, votes, attendance, activity, etc. |
| `military_spending` | Country military spend datasets. |
| `promise_tracker` | Promise tracking by jurisdiction. |
| `social_stats` | Social/gov stat cards by `country`. |
| `supreme_court_*` | Justices + cases. |
| `transparency_scores` | Transparency scoring payloads. |
| `user_events` | Client analytics (`analytics.js`). |
| `vote_counts` | Aggregated vote counters by logical id. |
| `waste_reports` | Waste tracker summary doc(s). |

---

## External APIs & backends

| Endpoint / host | Used for |
|-----------------|----------|
| `/api/congress-signed-laws` | Bills signed / enacted (Congress.gov via server key). |
| `civic-voice-backend-e3sz.onrender.com` | Legacy `/api/mps`, `/api/bills`, etc. (Canadian/bills — verify before expanding). |

---

## Adding a new collection (required checklist)

1. Search this file and **Firestore collection index** for an existing home for the same entity type.  
2. If truly new: add a row under **Priority features** (or extend an appendix), specify **SoT**, **data type**, **indexes**, and **demo policy**.  
3. Update Firestore security rules and indexes in Firebase console / `firestore.indexes.json` if you add compound queries.  
4. Ensure UI labels **official vs editorial vs modeled**.

---

*Last mapped from codebase review (`src/App.js` and related modules). Update this document whenever you change Firestore paths or API routes.*
