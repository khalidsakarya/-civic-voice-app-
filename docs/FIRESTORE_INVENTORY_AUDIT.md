# Firestore inventory audit (Civic Voice)

**Document purpose:** Single reference before changing any UI data source or creating collections.  
**Scope:** `civic-voice-app` (React) + `civic-voice-engine` (scheduler / uploads).  
**Methodology:** **Code-derived wiring only** for counts (7–12). **Live Firestore** was **not** queried while authoring this file — treat document counts, sample IDs, distinct values, and exact schemas as **TBD** until you run Console inspection or read-only Admin scripts with credentials.

**No secrets in frontend.** Optional tooling:
- **Firestore Debug Panel** (`src/dev/FirestoreDebugPanel.jsx`) — web SDK, dev / `REACT_APP_FIRESTORE_DEBUG=true`; presets cover a subset of collections.
- **Existing scripts:** `npm run audit:firestore-bills`, `npm run audit:executive-actions` (require `GOOGLE_APPLICATION_CREDENTIALS`).
- **Recommended:** For each collection below, run one-off Admin `get()` / aggregation or export rules-index needs — **read-only**.

---

## Rule: Do not create a new collection before checking this file

1. Search this document for the **feature** you are building.  
2. If a collection already backs that domain, **extend or query that collection** unless there is a documented safety reason not to.  
3. If the UI currently reads **static JSON**, **legacy REST**, or **wrong collection**, fix wiring — **do not** duplicate Firestore.  
4. **No UI refactor or data-source swap** for a feature until the **recommended source of truth** row for that feature is verified **live** (counts + sample docs).

---

## Summary: duplicate / overlapping surfaces

| Topic | Collections involved | Risk |
|--------|---------------------|------|
| US federal contracts | **`contracts`** vs **`government_contracts`** | Engine uploads **both** (different ingestion pipelines). App **`App.js`** reads **`government_contracts`** for at least one hub path — **`contracts`** may be **stale relative to UI** if nothing reads it. **Verify before new contract UI.** |
| Legislators (US) | **`members`** vs **`congress_members`** | Weekly scheduler uploads **`members`** from legislator JSON. **`congress_members`** filled by **`congressFetcher.js`** (House clerk + GovTrack). **`App.js` loads US roster from `congress_members`** — **`members` may be unused by main UI**. **Verify.** |
| Presidential docs | **`executive_actions`** vs **`executive_orders`** | Constants doc: **UI reads `executive_actions`**; **`executive_orders`** is optional Admin sync target — **do not wire UI to wrong collection.** |
| Leader advisors (CA) | **`leader_profile_data`** (sections) vs **`senior_advisors`** | **`leader_profile_data`** ingested with sections (e.g. senior advisors). **`App.js`** also queries **`senior_advisors`** for Carney — **possible overlap / legacy split**. **Verify.** |

---

## Feature → primary Firestore collection(s) (from code)

| Feature area (approx.) | Primary collection(s) | Client read location (hint) |
|------------------------|----------------------|-----------------------------|
| US bills — signed into law view | `bills` | `view === 'bills-signed-laws'` — `getDocs` + filter |
| US/CA/UK/AU legislative bills (live toggle) | `bills` | `fetchFirestoreBills` |
| US Congress roster | `congress_members` | `getDocs(collection(db, 'congress_members'))` |
| MP / member drill-down (disclosures, trades, votes, attendance, bios, committees, expenses, lobbying, corporate, activity, EO tie-in) | `member_*`, `executive_actions` | Multiple `where` queries on member keys |
| Executive Orders (US) | `executive_actions` | EO view — queried with filters |
| Money hub — federal departments, validation, SCOTUS, gov contracts | `federal_departments`, `budget_validation`, `supreme_court_*`, `government_contracts` | Prefetch effect |
| Elections | `elections` | `jurisdiction` query |
| Cabinet / department heads count | `department_heads` | Count / listings |
| Categories transparency loads | `department_expenses`, `leader_expenses`, `lobbying_correlations`, `promise_tracker`, `controversies`, `transparency_scores`, `social_stats`, `government_stats`, `credit_card_spending`, `military_spending`, `foreign_aid`, `flagged_expenses`, `waste_reports`, `analytics_data`, `budget_data` | Various `getDocs` |
| Civic engagement tallies | `vote_counts` | `getDocs` + `setDoc` merge |
| Department thumbs | `department_votes` | `getDoc` / `setDoc` merge |
| Analytics telemetry | `user_events` | `addDoc` (best-effort) |
| Citizen vote stream | `citizen_votes` | `addDoc` on some flows |

**Collections populated by engine but not clearly read in `App.js` grep:** e.g. **`budget_spending`**, **`efficiency_scores_monthly`**, **`department_performance`**, **`financial_disclosures`**, **`lobbying_activity`**, **`contracts`**, **`corporate_affiliations`** (may power future screens or exports only — **mark stale-risk until a reader exists**).

---

## Collection inventory table

Legend:
- **Count / IDs / Distinct / Schema:** **TBD (live)** unless you have filled them from Console/script.
- **Writer:** engine scheduler / standalone fetchers / client — from repo.
- **Reader:** `App.js` / other — from repo (**“—”** if none found).

| # | Collection | Approx. count | Sample doc IDs (3–5) | Schema / common fields (code hints) | Distinct type/status (TBD live) | Data source (visible in repo) | Likely feature / screen | Active / stale / dup / legacy | UI reads correctly? | Official vs enrichment vs user | Gaps / indexes |
|---|------------|---------------|----------------------|-------------------------------------|----------------------------------|------------------------------|-------------------------|-------------------------------|-------------------|-------------------------------|----------------|
| 1 | `bills` | TBD | TBD | `jurisdiction`, `congress`, `status`, `latestAction`/`latest_action`, summaries, args — see `mapFirestoreBillToUS` / signed-law mappers | TBD | Congress/OpenStates-style ingestion + AI (`billProcessor`); **not assumed** | Legislative hubs; **Bills signed into law** | Active | **Yes** for signed-laws path (`bills` US query) | Mixed official + AI enrichment | TBD composite indexes if compound queries added |
| 2 | `budget_data` | TBD | TBD | Per-uploader: jurisdiction doc ids (`uploadBudgetData`) | TBD | Aggregated budget/analytics pipeline | Money / “where money goes” style views | Active writer | **Yes** (`jurisdiction` query) | Cached official + derived | TBD |
| 3 | `budget_spending` | TBD | TBD | From `output/` spending files (`uploadBudgetSpending`) | TBD | Engine ingestion | **No direct `App.js` collection query found** | **Stale-risk for UI** | **Unclear** | Cached official | Confirm readers |
| 4 | `budget_validation` | TBD | TBD | Validator output (`budgetValidator.js`) | TBD | Derived from `federal_departments` + budgets | Money hub validation badge | Active | **Yes** | Derived / estimates | TBD |
| 5 | `audit_findings` | TBD | TBD | Rich + legacy files under `output/audit_findings/` (`uploadAuditFindings`) | TBD | Auditor-style ingest (`auditFindingsFetcher.js`) | Transparency / audit surfaces | Active writer | **Yes** (`jurisdiction` query) | Official + derived flags | TBD |
| 6 | `citizen_votes` | TBD | TBD | Event-style docs (`addDoc` in `App.js`) | TBD | **User-generated** | Civic vote logging | Active write | Partial (write path known) | User-generated | TBD rules |
| 7 | `congress_members` | TBD | TBD | `bioguide_id`, chamber, party, contact fields — from `congressFetcher` | TBD | **House clerk XML + GovTrack** | US Members / congress explorer | Active | **Yes** | Official cached | TBD |
| 8 | `contracts` | TBD | TBD | `output/contract/` batch (`uploadContracts`) | TBD | Mixed procurement APIs (see expense/contract fetchers) | **No `App.js` read found** — **dup risk vs `government_contracts`** | **Stale-risk** | **No** | Official cached | Merge with gov_contracts story |
| 9 | `corporate_affiliations` | TBD | TBD | `uploadCorporateAffiliations` | TBD | Engine | **No App read found** | Stale-risk | **Unclear** | Mixed | — |
| 10 | `data_audit_log` | TBD | TBD | Append-only audit (`auditLog.js`) | — | **System** | Ops / compliance | Active write | **No UI** | Metadata | Retention policy TBD |
| 11 | `department_budgets` | TBD | TBD | Fetcher `departmentBudgetsFetcher.js`; normalizer reads collection | TBD | Dept finance APIs | Used by normalizer; **App comments map labels — no direct `getDocs` found** | **Partial wiring** | **Unclear** | Official cached | Confirm if UI uses embedded data only |
| 12 | `department_expenses` | TBD | TBD | `jurisdiction`, expense rows | TBD | Dept disclosures | Money / transparency | Active | **Yes** | Official cached | TBD |
| 13 | `department_heads` | TBD | TBD | `jurisdiction`, roster fields | TBD | Mixed official | Cabinet / categories | Active | **Yes** | Official cached | TBD |
| 14 | `department_performance` | TBD | TBD | Monthly upload | TBD | Derived scores | **No App query found** | Stale-risk | **Unclear** | Derived | — |
| 15 | `efficiency_scores` | TBD | TBD | Doc per jurisdiction code + `_summary` | TBD | Derived from bills pipeline | Referenced in scheduler status strings | **Reader in App not confirmed in grep** | Verify | Derived | — |
| 16 | `efficiency_scores_monthly` | TBD | TBD | Monthly batch | TBD | Derived | **No App query found** | Stale-risk | **Unclear** | Derived | — |
| 17 | `elections` | TBD | TBD | `jurisdiction`, election dates | TBD | ECQ/FEC-style via fetchers | Elections surfaces | Active | **Yes** | Official cached | TBD |
| 18 | `executive_actions` | TBD | TBD | FR presidential docs — see `executiveOrderDocumentTypes.js` | TBD | **Federal Register** | Executive Orders; member-linked FR rows | Active | **Yes** | Official (+ filtering) | Index if compound queries |
| 19 | `expense_anomalies` | TBD | TBD | Summary docs per jurisdiction (`_summary_*`) | TBD | Derived detectors | Ops / future UI | Writer active | **No** | Derived | — |
| 20 | `expense_leaderboard` | TBD | TBD | Per-country + `_global` | TBD | Derived | Ops / future UI | Writer active | **No** | Derived | — |
| 21 | `federal_departments` | TBD | TBD | US dept metadata | TBD | Official + merges | Money hub | Active | **Yes** | Official cached | TBD |
| 22 | `financial_disclosures` | TBD | TBD | Bimonthly upload | TBD | Parliamentary registries | **No App query found** | Stale-risk | **Unclear** | Official | — |
| 23 | `flagged_expenses` | TBD | TBD | `country` query | TBD | Derived | Transparency | Active | **Yes** | Derived | TBD |
| 24 | `foreign_aid` | TBD | TBD | `jurisdiction` / country | TBD | Open data / WB-style pipelines | Money / aid views | Active | **Yes** | Official cached | TBD |
| 25 | `government_contracts` | TBD | TBD | `jurisdiction`, award metadata — CKAN / USAspending / FTS per fetcher | TBD | **USAspending / open.canada / UK FTS / AU** | Contracts surfaces | Active | **Yes** | Official cached | Stale delete logic in uploader — ok |
| 26 | `government_stats` | TBD | TBD | Country keyed docs | TBD | World Bank / BLS / USAspending — see gov stats pipeline | Stats dashboards | Active | **Yes** | Official cached | TBD |
| 27 | `leader_expenses` | TBD | TBD | `country` | TBD | Official travel/expense sources | Leader transparency | Active | **Yes** | Official cached | TBD |
| 28 | `leader_profile_data` | TBD | TBD | `section`, leader-specific blobs | TBD | pm.gc.ca / scraping | CA leader profile | Active writer | Partial (`leader_profile_data` query) | Cached official | Cross-check `senior_advisors` |
| 29 | `lobbying_activity` | TBD | TBD | Bimonthly | TBD | Registries | **No App query found** | Stale-risk | **Unclear** | Official | — |
| 30 | `member_attendance` | TBD | TBD | `bioguide_id` / name keys | TBD | Parliamentary APIs | Member profile | Active | **Yes** | Official cached | TBD |
| 31 | `member_bios` | TBD | TBD | `bioguide_id` / name | TBD | Official / curated | Member profile | Active | **Yes** | Mixed | TBD |
| 32 | `member_committees` | TBD | TBD | Committee assignments | TBD | Official | Member profile | Active | **Yes** | Official | TBD |
| 33 | `member_corporate_affiliations` | TBD | TBD | Corporate ties | TBD | Derived / filings | Member profile | Active | **Yes** | Mixed | TBD |
| 34 | `member_disclosures` | TBD | TBD | Registry filings | TBD | Official | Member profile | Active | **Yes** | Official | TBD |
| 35 | `member_expenses` | TBD | TBD | Travel/hospitality | TBD | Official proactive disclosure | Member profile | Active | **Yes** | Official | TBD |
| 36 | `member_lobbying` | TBD | TBD | Lobbying meetings | TBD | Registries | Member profile | Active | **Yes** | Official | TBD |
| 37 | `member_recent_activity` | TBD | TBD | Speeches / activity | TBD | Hansard / OpenStates-like | Member profile | Active | **Yes** | Official cached | TBD |
| 38 | `member_stock_trades` | TBD | TBD | STOCK Act–style | TBD | Official disclosures | Member profile | Active | **Yes** | Official | TBD |
| 39 | `member_votes` | TBD | TBD | Vote records | TBD | Official | Member profile | Active | **Yes** | Official | TBD |
| 40 | `members` | TBD | TBD | Legislator records from `legislator/` JSON | TBD | OpenStates-style (**verify**) | **Likely legacy vs `congress_members` for US** | **Dup-risk** | **No main US read found** | Official cached | **Audit usage before new MP features** |
| 41 | `promise_tracker` | TBD | TBD | Jurisdiction keyed | TBD | Editorial / scrapes | Leader promises | Active | **Yes** | Mixed | TBD |
| 42 | `research_results` | — | — | **No references in repo grep** | — | Unknown | None found | **Unknown / empty** | — | — | Confirm if obsolete |
| 43 | `scheduler_status` | TBD | TBD | Tier docs (`daily`, …) | — | **System** | Ops dashboard / debugging | Active write | **No UI in app** | Metadata | — |
| 44 | `social_stats` | TBD | TBD | `country`, `statName`, metrics — multiple upload paths | TBD | Mixed APIs + targeted fetch | Transparency social metrics | Active | **Yes** | Cached official | **Risk:** targeted upload comment uses non-merge overwrite — verify intent |
| 45 | `supreme_court_cases` | TBD | TBD | `jurisdiction` | TBD | Official court sources | Judiciary hub | Active | **Yes** | Official | TBD |
| 46 | `supreme_court_justices` | TBD | TBD | `jurisdiction` | TBD | Official | Judiciary hub | Active | **Yes** | Official | TBD |
| 47 | `user_events` | TBD | TBD | Analytics payloads | TBD | **User-generated telemetry** | Product analytics | Active write | N/A (privacy) | User-generated | Rules / PII review |
| 48 | `vote_counts` | TBD | TBD | Aggregated thumbs per entity id | TBD | **App merge writes** | Issue/politician voting tallies | Active read/write | **Yes** | User-generated tallies | Security rules |
| 49 | `votes` | TBD | TBD | Bill vote telemetry from `vote/` JSON | TBD | Engine ingestion | **App reader not found in grep** | **Stale-risk vs civic UX** | **Unclear** | Mixed | Align with product intent |
| 50 | `waste_reports` | TBD | TBD | Jurisdiction summary docs | TBD | Derived detectors | Waste / flagged narratives | Active writer | Partial via transparency loads | Derived | — |

---

## Collections referenced in code but **outside** your minimum list

These appear in **`App.js`** or **`civic-voice-engine`** and should be inventoried in the same pass:

| Collection | Role |
|------------|------|
| `analytics_data` | Transparency prefetch (`country`) |
| `controversies` | Leader controversy cards |
| `credit_card_spending` | Transparency |
| `department_votes` | Dept agree/disagree — **client read/write** |
| `lobbying_correlations` | Transparency |
| `military_spending` | Transparency |
| `senior_advisors` | CA senior advisors — **possible overlap with `leader_profile_data`** |
| `transparency_scores` | Transparency scoring |

---

## Recommended source of truth (high level)

| Domain | Use first | Deprecate / verify before reuse |
|--------|-----------|-----------------------------------|
| US Members roster | **`congress_members`** | **`members`** for US unless proven same pipeline |
| Federal contracts in UI | **`government_contracts`** | **`contracts`** until a screen explicitly needs legacy pipeline |
| Presidential EOs | **`executive_actions`** | **`executive_orders`** (sync only) |
| Bills + AI enrichment | **`bills`** | Static demo arrays / legacy backend JSON |
| Civic thumbs (global tallies) | **`vote_counts`** | Duplicate local-only tallies |
| Signed-laws civic feedback (current app) | **`localStorage` `cvSignedLawBillVotes`** | Not Firestore — **document if product expects server persistence** |

---

## Cleanup & index recommendations (process)

1. **Fill TBD columns** via Firebase Console export or Admin script (read-only).  
2. **Resolve duplicates:** `contracts`/`government_contracts`, `members`/`congress_members`, `leader_profile_data`/`senior_advisors`.  
3. **Mark deprecations** in engine scheduler once UI consensus is fixed (stop uploading unused collections **only after** confirmation).  
4. **Composite indexes:** Any new compound `where` + `orderBy` in `App.js` requires the Console-generated index link — track in team runbook.  
5. **`research_results`:** Confirm empty; delete from mental map or document purpose if added externally.

---

## “Before you ship” checklist

- [ ] Feature name: _______________  
- [ ] Primary collection from **Feature mapping** table: _______________  
- [ ] Live sample of **3 docs** reviewed in Console  
- [ ] **Distinct** `status` / `type` / `jurisdiction` values noted  
- [ ] Confirm **no duplicate collection** serves same entity  
- [ ] Confirm **scheduler merge** behavior does not wipe enrichment (see `uploader.js` bills scrub notes)  
- [ ] Update **this file’s table** with counts when audited  

---

*Generated from repository scan. Live metrics are intentionally **TBD** — refresh this document after production audit.*
