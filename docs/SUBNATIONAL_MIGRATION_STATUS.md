# Subnational migration status (client)

Short snapshot of how **`subnational_jurisdictions`** is used in the Civic Voice app today, what is Firestore-led, what stays hardcoded on purpose, and what still needs human or official verification.

---

## Summary

| Area | Firestore primary? | Hardcoded role |
|------|-------------------|----------------|
| **US state explorer & detail** | Yes, when **50** state docs (DC excluded) load successfully; else full seed rows. | Seed fills gaps; flags + `needs_manual_review_fields` drive a **US-only** “needs verification” line for governor headline fields when flagged. |
| **Canada province explorer & detail** | Same pattern for **13** provinces/territories. | Seed fills gaps; **no** US manual-review UI. |
| **Australia state/territory explorer & detail** | Yes, when **8** jurisdictions + required abbreviations are present. | Minimal structural seed (`name`, `abbr`); merge/build fills from Firestore. |
| **UK England regions (list + detail)** | Yes, when **13** UK docs exist **and** all nine `UK-ENG-*` region IDs are present; else per-row merge when possible. | Rich seed: GDP, unemployment, cities, councils, sectors, key facts, emoji, mayors, narrative — **not** population/area/official site (those come from Firestore when merged). |
| **UK national page** | **Partial**: devolved nations strip uses Firestore rows (`UK-SCT`, `UK-WLS`, `UK-NIR`) when the same **13-doc** UK fetch succeeded. | Westminster hub tiles, PM copy, and most national UI remain curated/static (not subnational-driven). |
| **Location gate (US/CA)** | **Labels** use Firestore display names when **50 + 13** docs load; **stored values** stay legacy strings for compatibility with `getRegionCountry` and saved prefs. | Fallback name lists if Firestore is incomplete or fetch fails. |

---

## 1. Firestore is primary (when parity passes)

- **US / CA provincial:** `getProvincialData()` in `src/App.js` — if `fetchSubnationalJurisdictions('US'|'CA')` returns a full set, rows are built with `buildProvincialExplorerRowFromFirestoreWithHardcodedFallback` (Firestore first, seed only for gaps). If the count check fails, the overlay map is `null` and the UI uses hardcoded lists only.
- **AU:** `getAustralianStateData()` — full **8**-row map triggers `buildAustralianExplorerRowFromFirestoreWithHardcodedFallback`; otherwise `mergeAustralianExplorerRow` per row.
- **UK regions:** `getEnglandRegionsExplorerRows()` — full **13** UK docs plus all nine England region Firestore IDs triggers `buildUkEnglandRegionRowFromFirestoreWithHardcodedFallback`; otherwise `mergeUkEnglandRegionRow` with best-effort row match.

Merge helpers live in `src/utils/mergeProvincialExplorerFirestore.js`; reads are normalized in `src/firestore/fetchSubnationalJurisdictions.js`.

---

## 2. Hardcoded data is fallback / structural

- **Structural:** `flagCode`, region `id` / `abbr`, list ordering, and rich UK/US/CA/AU demo content where the product has not moved narrative to the engine.
- **Fallback:** Any time the app requires an exact document count and Firestore returns fewer or errors, explorers **silently** fall back to seed objects so screens stay usable.

---

## 3. US governor manual-review warning

- **Only US:** `applyUsGovernorHeadlineManualReviewFlags` runs for `isUSA === true` only; Canada rows explicitly **delete** any US-only keys.
- **Only when Firestore flags:** `fetchSubnationalJurisdictions` normalizes `needs_manual_review` shapes into `needs_manual_review_fields`; the merge layer copies a subset for **`leader_name`**, **`leader_party`**, **`leader_since`** into `usSubnationalGovernorHeadlineNeedsVerificationFields` for the state **detail** screen.

---

## 4. UK region population / area / official site

- England region cards and detail use merged rows: **`population_display`** / numeric population handling, **`area_km2`** → formatted `area`, and **`officialWebsite`** (detail link) prefer Firestore via `mergeUkEnglandRegionRow` / `buildUkEnglandRegionRowFromFirestoreWithHardcodedFallback` and `ukEnglandPopulationDisplay` / `formatUkEnglandAreaKm2` in the merge module.
- Hardcoded **`populationRaw`** and **`area`** were removed from `englandRegions`; **`populationRaw`** is only used from merged output (e.g. England total on the list page). No remaining dependency on removed seed fields.

---

## 5. Screens checked (logic only; no code changes)

| Screen | Verdict |
|--------|---------|
| US state detail | Firestore-led when parity passes; US-only verification note when flagged. |
| Canada province detail | Firestore-led when parity passes; no US verification keys. |
| Australia state detail | Firestore-led when parity passes. |
| UK region detail | Firestore-led for official stats when parity passes; rich content still seed. |
| UK national | Firestore for devolved nation strip when UK fetch complete; rest static by design. |
| Location gate | Firestore labels when full US+CA set; values legacy. |

---

## 6. Build

- Production build verified with: `REACT_APP_VERSION` set and `npx react-scripts build` (Windows-friendly). **`npm run build`** may still fail on this repo’s Unix-style env in `package.json` — use the same `npx` invocation locally if needed.

---

## Intentionally still hardcoded (high level)

- **UK:** Council lists, economic sectors, key facts, mayor bios, legislature **demo** compositions where Firestore does not supply party breakdowns, tax/MP strings outside `subnational_jurisdictions`.
- **US / CA / AU:** Lieutenant-governor / deputy blocks, bios, and legislature charts may remain seed or illustrative unless replaced by engine-sourced docs.
- **Global:** `SubnationalIllustrativeExplorerNote` on explorer/detail views reminds users that narrative and some charts are not authenticated government records.

---

## Still needs official verification

- Any field marked **`needs_manual_review`** (or per-field `_data_status` / `_needs_manual_review` variants) in Firestore — especially US governor headline fields — until cleared in the database.
- **UK national** Westminster surfaces that are not wired to `subnational_jurisdictions`.
- **Population totals** on UK England list when Firestore omits numeric population for some rows (total may show **—** until all nine regions expose countable population in merge output).
- **Location gate:** display names track Firestore; underlying **value** strings are legacy — verify alignment if copy or legal jurisdiction labels must match a new canonical slug.

---

## Related docs

- `docs/SUBNATIONAL_FIRESTORE_MIGRATION.md` — collection design and rationale  
- `docs/SUBNATIONAL_DATA_MODEL.md` — per-country ID and UX split  
- `docs/SUBNATIONAL_JURISDICTIONS_PHASE3B_ENRICHMENT_REPORT.md` — engine field status vocabulary (`needs_manual_review`, etc.)
