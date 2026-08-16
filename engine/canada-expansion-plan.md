# Canada Full-Functionality Expansion Plan

**Date:** 2026-08-16  
**Scope:** Scale all three subnational transparency modals to federal Canada + all 13 provinces/territories.  
**Status:** Planning — no Firestore writes until dry-run reports reviewed.

---

## What Already Exists (No New Work Required)

| Component | Status |
|---|---|
| UI province list (`canadaProvinces` in App.js line 13303) | All 13 entries present with `flagCode` |
| `flagCode → doc ID` derivation (`subnationalTransparencyJurisdictionId`) | Automatic — `ca-bc` → `CA-BC`, etc. |
| Modal components (`showEconomicModal`, `showTaxExemptModal`, `showTransferPaymentsModal`) | Read `subnational_*/{id}` — any province with data will render |
| Leader transparency configs (`canadian-provincial-leader-transparency-config.cjs`) | All 12 non-ON provinces defined |
| CRA charities fetch pattern | Same CKAN API call, 1-line province filter change |
| Stats Can LFS fetch pattern (`subnational-unemployment-monthly.cjs`) | Same API, different coordinate string |
| Firestore rules | `subnational_economic_social_stats`, `subnational_tax_exempt_entities`, `subnational_grants`: public-read, no-write — already covers all doc IDs |

**Conclusion:** No UI changes are required to receive data for any province/territory. All 13 will render modals automatically once Firestore docs exist.

---

## Dataset Matrix

### Statistics Canada LFS Coordinates (Table 14-10-0287-01)

Pattern: `{geo_dim}.7.1.1.1.1.0.0.0.0` — geo dimension value from table metadata.  
National average (used as benchmark line): `1.7.1.1.1.1.0.0.0.0` (already `STATCAN_CA_COORD`).  
Ontario: `7.7.1.1.1.1.0.0.0.0` (already `STATCAN_ON_COORD`).  
**Territories (YT, NT, NU): not surveyed by LFS — no provincial unemployment series available.**

| Jurisdiction | LFS Coord | Note |
|---|---|---|
| CA-NL | `2.7.1.1.1.1.0.0.0.0` | Verify via dry-run |
| CA-PE | `3.7.1.1.1.1.0.0.0.0` | Verify via dry-run |
| CA-NS | `4.7.1.1.1.1.0.0.0.0` | Verify via dry-run |
| CA-NB | `5.7.1.1.1.1.0.0.0.0` | Verify via dry-run |
| CA-QC | `6.7.1.1.1.1.0.0.0.0` | Verify via dry-run |
| CA-ON | `7.7.1.1.1.1.0.0.0.0` | ✓ Done |
| CA-MB | `8.7.1.1.1.1.0.0.0.0` | Verify via dry-run |
| CA-SK | `9.7.1.1.1.1.0.0.0.0` | Verify via dry-run |
| CA-AB | `10.7.1.1.1.1.0.0.0.0` | Verify via dry-run |
| CA-BC | `11.7.1.1.1.1.0.0.0.0` | Verify via dry-run |
| CA-YT | N/A | LFS excludes territories |
| CA-NT | N/A | LFS excludes territories |
| CA-NU | N/A | LFS excludes territories |

### CRA Charities Province Filter

Same CKAN package (`51c68b86-33f0-46fe-9b51-0a786d0088f5`), same CSV download. Change filter string only.

| Jurisdiction | Province Filter | Note |
|---|---|---|
| CA-ON | `ON` | ✓ Done |
| CA-BC | `BC` | Ready |
| CA-AB | `AB` | Ready |
| CA-SK | `SK` | Ready |
| CA-MB | `MB` | Ready |
| CA-QC | `QC` | Ready |
| CA-NB | `NB` | Ready |
| CA-NS | `NS` | Ready |
| CA-PE | `PE` | Ready |
| CA-NL | `NL` | Ready |
| CA-NT | `NT` | Small — expect few records |
| CA-NU | `NU` | Very small — may be < 10 records |
| CA-YT | `YT` | Small — expect few records |

### Transfer Payments / Public Accounts Sources

| Jurisdiction | Source Portal | CKAN Available | Licence | Risk |
|---|---|---|---|---|
| CA-ON | Ontario Public Accounts (data.ontario.ca — pkg `56c9a95f`) | Yes | Ontario.ca Terms | ✓ Done |
| CA-BC | BC Data Catalogue — data.gov.bc.ca | Yes (CKAN) | Open Government Licence – BC | Low |
| CA-AB | Alberta Open Government Portal — open.alberta.ca | Yes (CKAN) | Open Government Licence – Alberta | Low |
| CA-SK | Saskatchewan Open Data Portal — data.saskatchewan.ca | Yes (CKAN) | Open Government Licence – Saskatchewan | Low |
| CA-MB | Manitoba Open Data — opendata.gov.mb.ca | Yes (CKAN) | Open Government Licence – Manitoba | Medium |
| CA-QC | données.gouv.qc.ca — donneesquebec.ca | Yes (CKAN, French) | Licence ouverte Québec | Medium |
| CA-NB | New Brunswick Open Data — data.gnb.ca | Yes (CKAN) | Open Government Licence – New Brunswick | Medium |
| CA-NS | Nova Scotia Open Data — data.novascotia.ca | Yes (CKAN) | Open Government Licence – Nova Scotia | Medium |
| CA-PE | PEI Open Data — princeedwardisland.ca/open-data | Limited CKAN | Open Government Licence – PEI | High |
| CA-NL | NL Open Government — opendata.gov.nl.ca | Yes (CKAN) | Open Government Licence – NL | Medium |
| CA-NT | GNWT Open Data — gov.nt.ca/opendata | Limited | Open Government Licence – NWT | High |
| CA-NU | Finance.gov.nu.ca | No structured API; gov.nu.ca returns 403 | N/A | High |
| CA-YT | Yukon Open Data — yukon.ca/en/open-data | Limited; yukon.ca returns 403 to bots | Open Government Licence – Yukon | High |
| CA (Federal) | GC Proactive Disclosure — open.canada.ca (grants/contributions pkg `432527ab`) | Yes (CKAN) | Open Government Licence – Canada | Separate track |

### Leader Profiles / `subnational_jurisdictions`

| Jurisdiction | Engine Config | Transparency Config Exists | Note |
|---|---|---|---|
| CA-ON | `subnational-transparency-ca-on.cjs` + `subnational-leader-transparency-ca-on.cjs` | Yes | ✓ Done |
| CA-BC — CA-NU | `canadian-provincial-leader-transparency-config.cjs` | All 12 defined | No separate lib module yet — config already written |

### Full Matrix

| ID | Pop (approx) | Unemployment Source | CRA Filter | Transfers Source | Leader Config | Firestore Target Docs | UI Support | Risk | Ready for Dry-Run | Blockers |
|---|---|---|---|---|---|---|---|---|---|---|
| CA-ON | 15M | Stats Can `7.7.1.1.1.1.0.0.0.0` | ON | Ontario Public Accounts CKAN | ✓ | `CA-ON` in all 3 collections | ✓ Working | — | ✓ Done | — |
| CA-BC | 5.5M | Stats Can `11.7.1.1.1.1.0.0.0.0` | BC | data.gov.bc.ca CKAN | ✓ | `CA-BC` in all 3 collections | ✓ Auto | Low | Yes | Source package ID needs discovery dry-run |
| CA-AB | 4.7M | Stats Can `10.7.1.1.1.1.0.0.0.0` | AB | open.alberta.ca CKAN | ✓ | `CA-AB` in all 3 collections | ✓ Auto | Low | Yes | Source package ID needs discovery dry-run |
| CA-QC | 9.0M | Stats Can `6.7.1.1.1.1.0.0.0.0` | QC | donneesquebec.ca CKAN (French) | ✓ | `CA-QC` in all 3 collections | ✓ Auto | Medium | Yes | French-language data fields; CCEI portal may block bots |
| CA-SK | 1.2M | Stats Can `9.7.1.1.1.1.0.0.0.0` | SK | data.saskatchewan.ca CKAN | ✓ | `CA-SK` in all 3 collections | ✓ Auto | Low | Yes | Source package ID needs discovery dry-run |
| CA-MB | 1.4M | Stats Can `8.7.1.1.1.1.0.0.0.0` | MB | opendata.gov.mb.ca CKAN | ✓ | `CA-MB` in all 3 collections | ✓ Auto | Medium | Yes | Compensation PDF noted as 403; MB OECI URL noted as 404 |
| CA-NS | 1.1M | Stats Can `4.7.1.1.1.1.0.0.0.0` | NS | data.novascotia.ca CKAN | ✓ | `CA-NS` in all 3 collections | ✓ Auto | Medium | Yes | Elections NS returns SPA shell from bot fetch |
| CA-NB | 830K | Stats Can `5.7.1.1.1.1.0.0.0.0` | NB | data.gnb.ca CKAN | ✓ | `CA-NB` in all 3 collections | ✓ Auto | Medium | Yes | COI commissioner URL not machine-located |
| CA-NL | 540K | Stats Can `2.7.1.1.1.1.0.0.0.0` | NL | opendata.gov.nl.ca CKAN | ✓ | `CA-NL` in all 3 collections | ✓ Auto | Medium | Yes | Source package ID needs discovery dry-run |
| CA-PE | 170K | Stats Can `3.7.1.1.1.1.0.0.0.0` | PE | princeedwardisland.ca/open-data (limited) | ✓ | `CA-PE` in all 3 collections | ✓ Auto | High | Partial | Transfers: very limited structured open data; may need manual source |
| CA-NT | 45K | N/A — not in LFS | NT | gov.nt.ca/opendata (limited) | ✓ | `CA-NT` in all 3 collections | ✓ Auto | High | Partial | No LFS unemployment; limited transfers; grants data sparse |
| CA-NU | 40K | N/A — not in LFS | NU | gov.nu.ca returns 403 | ✓ | `CA-NU` in all 3 collections | ✓ Auto | High | Partial | No LFS; 403 from gov.nu.ca; very limited open data |
| CA-YT | 45K | N/A — not in LFS | YT | yukon.ca returns 403 to bots | ✓ | `CA-YT` in all 3 collections | ✓ Auto | High | Partial | No LFS; 403 from yukon.ca; limited structured grants data |
| CA (Federal) | — | Stats Can `1.7.1.1.1.1.0.0.0.0` | All CA | GC Proactive Disclosure (open.canada.ca) | — | Separate track | Separate UI | Medium | No — separate plan | Federal is separate UI path; not a subnational modal; requires own plan |

---

## Recommended Rollout Order

### Wave 1 — High Population, Clean Open Data (do next)

**CA-BC** — recommended first.

- Largest population outside ON + QC
- data.gov.bc.ca: mature CKAN API, well-documented datasets, BC Open Government Licence (OGL-compatible)
- Stats Can LFS coordinate pattern applies cleanly
- Leader transparency config is the most complete (Ethics Act, MLA remuneration, newsroom RSS, Elections BC all mapped)
- No known bot-blocking issues on BC Data Catalogue

Steps: create `engine/lib/subnational-transparency-ca-bc.cjs` → run dry-run → review → write.

| Wave | Jurisdiction | Reason |
|---|---|---|
| 1 | **CA-BC** | Best open data + largest easy population gain |
| 1 | **CA-AB** | Large population, Alberta Open Govt Portal is mature |
| 1 | **CA-QC** | Largest province by pop; donneesquebec.ca is CKAN; French-language handling needed |
| 2 | **CA-SK** | Clean CKAN; Stats Can clean |
| 2 | **CA-MB** | CKAN available; minor known blocks (compensation PDF) |
| 2 | **CA-NS** | CKAN available; elections portal blocks bots (affects leader only, not transfers) |
| 2 | **CA-NB** | CKAN available; COI URL manual only |
| 2 | **CA-NL** | CKAN available; Stats Can clean |
| 3 | **CA-PE** | Smallest province; limited transfers data; CRA + unemployment work fine |
| 3 | **CA-YT** | Territory; no LFS; yukon.ca 403; CRA + manual transfers |
| 3 | **CA-NT** | Territory; no LFS; limited structured data |
| 3 | **CA-NU** | Territory; no LFS; gov.nu.ca 403; most limited open data |
| Separate | **Federal (CA)** | Different UI track; different collections; own plan needed |

---

## Engine Work Per Province

Each Wave 1/2 province requires:

1. **Create `engine/lib/subnational-transparency-ca-XX.cjs`**
   - Copy `subnational-transparency-ca-on.cjs` structure
   - Change `JURISDICTION_ID` to `CA-XX`
   - Change `STATCAN_ON_COORD` to province coordinate
   - Change province filter from `ON` to `XX` in CRA function
   - Replace Ontario Public Accounts CKAN pkg ID with province-specific pkg ID
   - Change column names if province uses different schema (most use similar columns)

2. **Add to dry-run runner** (`canada-mvp-dry-run.cjs` or new `canada-expansion-dry-run.cjs`)
   - Import new module
   - Add three `run*` functions (unemployment, tax, grants)
   - Write JSON report to `engine/reports/`

3. **Review dry-run report**
   - Confirm field keys present: `unemployment_series_monthly`, `companies`, `records`
   - Confirm record counts > 0
   - Confirm no empty/null series

4. **Run write** (after dry-run approved)
   - Uses same write pattern as `canada-mvp-write.cjs`
   - Writes `merge` to `subnational_economic_social_stats/CA-XX`, `subnational_tax_exempt_entities/CA-XX`, `subnational_grants/CA-XX`

Wave 3 provinces (PE) and territories (YT, NT, NU):
- Unemployment: write economic doc with `unemployment_not_available: true` and a note field instead of a series
- Transfers: manual source research first; do not write placeholder data
- CRA charities: same pattern, proceed

---

## Territory Unemployment Handling

The 3 territories are excluded from the LFS. Options:

| Option | Approach | Recommendation |
|---|---|---|
| A | Omit unemployment from economic doc entirely | OK — modal shows other sections; unemployment just doesn't render |
| B | Use annual Statistics Canada community profiles data (5-year census) | Acceptable but stale |
| C | Note "Labour Force Survey data not available for territories" as a modal field | Transparent; preferred |

**Recommendation: Option A for now.** If the economic doc has no unemployment keys, the modal renders no unemployment chart — it just shows nothing in that section. No fake data. No UI change needed. Revisit after Wave 1/2.

---

## Federal Canada

Federal Canada is not a subnational province. It has a separate UI view (Prime Minister, Senate, House of Commons, bills, etc.) and does not use the three subnational modal collections. Federal transparency data lives in separate Firestore collections (`members`, `bills`, `elections`, `department_heads`, `leader_expenses`, etc.).

**Federal expansion is a separate plan.** The subnational modal pattern (economic stats / tax-exempt / transfer payments) does not directly map to the federal view without UI work. The federal spending data from GC Proactive Disclosure (grants/contributions to provinces and third parties) is a candidate for a new federal transparency section.

**Not in scope for this expansion wave.** Track as a separate item after Wave 1 provinces are complete.

---

## Summary

- **13 provinces/territories**: UI already supports all; 0 UI changes needed for Wave 1–3
- **CRA charities**: 1-line filter change per province; trivially ready for all 13
- **Statistics Canada LFS**: 10 provinces — coordinates follow confirmed pattern; 3 territories excluded from LFS
- **Transfer payments**: Wave 1 (BC, AB, QC) and Wave 2 (SK, MB, NS, NB, NL) have CKAN portals; Wave 3 and territories need manual source research
- **Leader profiles**: Engine configs exist for all 12 non-ON provinces
- **Federal**: Separate plan required — not a subnational modal

**Next action: create `engine/lib/subnational-transparency-ca-bc.cjs` and run dry-run for CA-BC.**
