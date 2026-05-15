# Subnational UI completion plan

**Scope:** US state detail, Canada province/territory detail, Australia state/territory detail, UK England region detail, and the US/Canada **location gate** only. No app-wide audit.

**Sources reviewed:** `src/App.js` (views, gates, modals), `src/utils/mergeProvincialExplorerFirestore.js`, `src/firestore/fetchSubnationalJurisdictions.js`, `docs/SUBNATIONAL_MIGRATION_STATUS.md`, `docs/SUBNATIONAL_DATA_MODEL.md`.

---

## 1. Data problems

| Issue | Where | Notes |
|--------|--------|--------|
| **Strict Firestore parity** | US/CA explorer + gate | Explorer and location gate only use Firestore-backed maps when **exactly 50 US (no DC) + 13 CA** rows load and every expected abbreviation resolves. Otherwise the UI **silently** falls back to hardcoded seeds—users cannot tell “live vs seed.” |
| **String alignment / joins** | CA/US cross-feature | Known risk: **Newfoundland** naming (`and` vs `&`), and **DC** vs **Washington D.C.** across tax, geo, and subnational lists (`docs/SUBNATIONAL_DATA_MODEL.md`). Mismatches can break merges or `find()` by `name`. |
| **UK region legislature fallback** | `renderUKRegionDetail` | Hardcoded `legislatureByRegion` seat totals and party splits are **not** official data; they coexist with optional Firestore `r.legislature`. |
| **UK list summary tiles** | `renderUKRegions` | **“9” regions**, **“4” elected mayors**, and **GDP/unemployment** on cards are largely **seed-driven**; total population sums merged `populationRaw` and can show **—** if Firestore omits numerics for some rows. |
| **US/CA “Economic & Social” and related modals** | `renderEconomicModal` (+ tax exempt / grants for province) | Charts and tables are **deterministic RNG from state/province name**, not government statistics—presents as substantive transparency data. |
| **AU economic / tax-exempt / grants modals** | `renderAuEconomicModal` and siblings | Same pattern: **synthetic** data keyed off `item.name`. |
| **Empty AU legislature object** | `renderAustralianStateDetail` | If Firestore does not supply `legislature.parties` and seed has no parties, `leg.totalSeats` can be **0** while the UI still renders `%` bars (`p.seats / leg.totalSeats`) → **NaN / broken UI** risk. |
| **Party badge vs displayed party (US/CA detail)** | `renderProvinceDetail` | Governor/Premier **name line** uses `leaderParty`; the colored badge uses `partyBadge(item.partyShort)` while the span shows `leaderParty`—if those diverge after merges, the **badge color can mismatch** the stated party. |

---

## 2. Missing fields (product vs engine)

| Gap | Who | What users might expect |
|-----|-----|-------------------------|
| **Provenance on-screen** | All | No consistent **source**, **last updated**, or **data status** line on subnational detail (Firestore may carry these; UI does not surface them). |
| **US state header population** | US | Canada shows **Population** in the hero when `item.population` exists; **US path omits population** in the same header block—uneven even if Firestore has population. |
| **Official web link** | US/CA/AU detail | UK region detail exposes `officialWebsite` when valid; **US/CA/AU** province/state detail **do not** mirror that pattern in the hero. |
| **Location gate beyond US/CA** | Gate | Only **US states (50)** and **CA provinces/territories (13)**. **No UK regions or AU states** for voting region—by design today, but incomplete if “one gate for all subnational.” |
| **Explorer list disclaimer** | US/CA list (`renderProvincial`) | **SubnationalIllustrativeExplorerNote** appears on **detail** for US/CA but **not** on the **state/province picker list**—users see curated cards without the same upfront warning as detail. |

---

## 3. Unverified fields

| Area | Mechanism | Gap |
|------|-----------|-----|
| **US governor headline** | `needs_manual_review` → `usSubnationalGovernorHeadlineNeedsVerificationFields` | Only **US** gets the amber “Needs verification” strip for flagged `leader_name` / `leader_party` / `leader_since`. Good start. |
| **Canada / AU / UK** | Merge layers | **No equivalent** visible flag for premier/governor/mayor fields when Firestore marks manual review—users cannot see which headline fields are still provisional. |
| **UK narrative / mayors / councils** | Seed + merge | `SubnationalIllustrativeExplorerNote` warns generically; individual bios and council lines are still **trust-by-default** unless engine adds status and UI maps it. |

---

## 4. UI/UX problems

| Issue | Impact |
|-------|--------|
| **Silent fallback** | When Firestore is incomplete, UI looks “complete” but is seed-backed—**no badge** explaining reduced fidelity (contrast with US verification strip). |
| **Legislature chart trust** | US/CA use `getLegislatureData` fallback; UK uses large fictional seat totals in places—**looks authoritative** (pie charts, percentages). |
| **Depth of “Transparency” CTAs** | Economic / tax-exempt / grants buttons open **synthetic** datasets—high **expectation mismatch** risk. |
| **AU hero “Pop”** | Shows `item.population` with no unit/format guarantee from merge—may be raw string or inconsistent vs UK formatted population. |
| **UK vs US/CA visual language** | UK region flow is a **dark hero + sectioned** layout; US/CA detail is **light green card** stack—fine artistically, but **inconsistent “government record” tone** across countries. |

---

## 5. Inconsistent labels

| Example | Location |
|---------|-----------|
| **Helmet / SEO** uses **“Provincial Government”** for **US** `province-detail` | `App.js` (~L1948–1951) — US states are not provinces. |
| **“Lieutenant Governor”** default for CA deputies | `renderProvinceDetail` — many provinces use **different** titles (e.g. lieutenant-governor vs federal appointee for territories); `ltGovTitle` can override but default label is US-centric. |
| **“Regional Councils” / “Combined Authority Councils”** | UK `legislatureByRegion` names vs real bodies—**generic** labels reused across regions. |
| **“Australian State & Territory”** | AU detail hero—accurate; US/CA use mixed **State / Province / Territory** language elsewhere (mostly OK; watch “province” in US metadata). |

---

## 6. Sections that still look demo / unfinished

| Section | Region |
|---------|--------|
| **Economic & Social Data** modal (RNG charts) | US/CA province-state |
| **Tax Exempt Companies** / **Grants Given** modals (synthetic lists) | US/CA |
| **AU** Economic / Tax exempt / Grants modals | AU |
| **UK** `legislatureByRegion` pie-style composition (when Firestore legislature absent) | UK England |
| **UK regions list** hardcoded **4** mayors / **9** regions | UK |
| **SubnationalIllustrativeExplorerNote** | Shown on US/CA detail, UK detail, AU detail, AU explorer (`renderAustralianStates` path ~L25157)—**not** on US/CA explorer list |

---

## 7. Suggested fixes (priority order)

**P0 — Trust & safety (quick wins)**  
1. Add a **non-dismissed, compact banner** on US/CA **explorer list** when `provincialExplorerFirestoreByAbbr` is null or incomplete: “Showing curated seed data until official sync completes.”  
2. On **US/CA province detail**, either **remove or clearly label** RNG-driven modals as **“Illustrative model”** (title + first line of modal), not “transparency data.”  
3. Guard **AU legislature** UI: if `leg.totalSeats === 0` or no parties, show **“Composition unavailable”** instead of charts/bars.

**P1 — Data fidelity**  
4. Extend **manual-review / data-status surfacing** to **CA, AU, UK** detail headers (same conceptual model as US `needs_manual_review_fields`), driven by Firestore.  
5. Add **optional** `last_updated` / `source_name` (or link) line on all four detail templates when fields exist on merged rows.  
6. Fix **Helmet** copy for US: “State government” (or `{name} — State government`) instead of “Provincial.”  
7. Align **US population** in hero with CA when merged population is present.

**P2 — Location gate**  
8. Document in-product (short help text): gate is **US + Canada only**; UK/AU users are not asked here.  
9. If product requires it later: **separate project** for AU/UK gate keys—requires `getRegionCountry` / vote storage audit (`SUBNATIONAL_DATA_MODEL.md`).

**P3 — UK polish**  
10. Replace or clearly watermark **hardcoded** `legislatureByRegion` with “Illustrative seat model” or hide until Firestore supplies `legislature`.  
11. Reconcile **list tile** counts (mayors = 4) with **live** `hasRegionalMayor` data from merged rows, or label as “Example layout.”

**P4 — Consistency**  
12. Unify **official website** treatment: show link on US/CA/AU detail when merge exposes it (mirror UK).  
13. Audit **party badge** vs **displayed party** on US/CA detail (`partyShort` vs `leaderParty` / `govParty`).

---

## Quick reference: main code anchors

| Flow | Primary UI | Data assembly |
|------|----------------|----------------|
| US/CA list + detail | `getProvincialData`, `renderProvincial`, `renderProvinceDetail` | `mergeProvincialExplorerRow`, `buildProvincialExplorerRowFromFirestoreWithHardcodedFallback` |
| AU list + detail | `getAustralianStateData`, `renderAustralianStates`, `renderAustralianStateDetail` | `mergeAustralianExplorerRow`, `buildAustralianExplorerRowFromFirestoreWithHardcodedFallback` |
| UK regions | `getEnglandRegionsExplorerRows`, `renderUKRegions`, `renderUKRegionDetail` | `mergeUkEnglandRegionRow`, `buildUkEnglandRegionRowFromFirestoreWithHardcodedFallback` |
| Location gate | `renderLocationGateModal`, effect ~L3225 | `fetchSubnationalJurisdictions('US'|'CA')` + strict 50/13 gate |

---

*This document is planning only; implementation should be broken into small PRs per area (gate, US/CA detail, AU charts, UK legislature, SEO).*
