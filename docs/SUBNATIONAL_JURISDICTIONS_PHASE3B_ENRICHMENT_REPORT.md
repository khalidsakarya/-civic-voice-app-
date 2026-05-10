# subnational_jurisdictions — Phase 3B enrichment report

Generated: 2026-05-10T00:37:17.855Z
Mode: **WRITE (merge-only)**
**Firestore:** live documents read for comparison.
US Census fetch: enabled
Census jurisdictions mapped: 51
Firestore credential hint: GOOGLE_APPLICATION_CREDENTIALS

## Aggregate field outcomes

| Metric | Count |
|--------|-------|
| Fields that would update / updated | 480 |
| Fields unchanged (already equal) | 0 |
| Fields needs_manual_review | 115 |
| Fields skipped (other) | 0 |
| Documents with ≥1 write | 76 |
| Total documents read | 85 (expected 85) |

## Dry-run merge preview (flat patches)

Only keys that differ from current Firestore values. Empty table if nothing to change.

| Doc ID | Keys to merge |
|--------|----------------|
| `AU-ACT` | leader_name, leader_party, leader_since, officialWebsite, legislatureWebsite |
| `AU-NSW` | leader_name, leader_party, leader_since, officialWebsite, legislatureWebsite |
| `AU-NT` | leader_name, leader_party, leader_since, officialWebsite, legislatureWebsite |
| `AU-QLD` | leader_name, leader_party, leader_since, officialWebsite, legislatureWebsite |
| `AU-SA` | leader_name, leader_party, leader_since, officialWebsite, legislatureWebsite |
| `AU-TAS` | leader_name, leader_party, leader_since, officialWebsite, legislatureWebsite |
| `AU-VIC` | leader_name, leader_party, leader_since, officialWebsite, legislatureWebsite |
| `AU-WA` | leader_name, leader_party, leader_since, officialWebsite, legislatureWebsite |
| `CA-AB` | leader_name, leader_party, leader_since, officialWebsite, legislatureWebsite |
| `CA-BC` | leader_name, leader_party, leader_since, officialWebsite, legislatureWebsite |
| `CA-MB` | leader_name, leader_party, leader_since, officialWebsite, legislatureWebsite |
| `CA-NB` | leader_name, leader_party, leader_since, officialWebsite, legislatureWebsite |
| `CA-NL` | leader_name, leader_party, leader_since, officialWebsite, legislatureWebsite |
| `CA-NS` | leader_name, leader_party, leader_since, officialWebsite, legislatureWebsite |
| `CA-NT` | leader_name, leader_since, officialWebsite, legislatureWebsite |
| `CA-NU` | leader_name, leader_since, officialWebsite, legislatureWebsite |
| `CA-ON` | leader_name, leader_party, leader_since, officialWebsite, legislatureWebsite |
| `CA-PE` | leader_name, leader_party, leader_since, officialWebsite, legislatureWebsite |
| `CA-QC` | leader_name, leader_party, leader_since, officialWebsite, legislatureWebsite |
| `CA-SK` | leader_name, leader_party, leader_since, officialWebsite, legislatureWebsite |
| `CA-YT` | leader_name, leader_party, leader_since, officialWebsite, legislatureWebsite |
| `UK-ENG` | leader_name, leader_party, leader_since, officialWebsite, legislatureWebsite |
| `UK-NIR` | leader_name, leader_party, leader_since, officialWebsite, legislatureWebsite |
| `UK-SCT` | leader_name, leader_party, leader_since, officialWebsite, legislatureWebsite |
| `UK-WLS` | leader_name, leader_party, leader_since, officialWebsite, legislatureWebsite |
| `US-AK` | population_raw, population_display, leader_name, leader_party, leader_since, officialWebsite, legislatureWebsite |
| `US-AL` | population_raw, population_display, leader_name, leader_party, leader_since, officialWebsite, legislatureWebsite |
| `US-AR` | population_raw, population_display, leader_name, leader_party, leader_since, officialWebsite, legislatureWebsite |
| `US-AZ` | population_raw, population_display, leader_name, leader_party, leader_since, officialWebsite, legislatureWebsite |
| `US-CA` | population_raw, population_display, leader_name, leader_party, leader_since, officialWebsite, legislatureWebsite |
| `US-CO` | population_raw, population_display, leader_name, leader_party, leader_since, officialWebsite, legislatureWebsite |
| `US-CT` | population_raw, population_display, leader_name, leader_party, leader_since, officialWebsite, legislatureWebsite |
| `US-DC` | population_raw, population_display, leader_name, leader_party, leader_since, officialWebsite, legislatureWebsite |
| `US-DE` | population_raw, population_display, leader_name, leader_party, leader_since, officialWebsite, legislatureWebsite |
| `US-FL` | population_raw, population_display, leader_name, leader_party, leader_since, officialWebsite, legislatureWebsite |
| `US-GA` | population_raw, population_display, leader_name, leader_party, leader_since, officialWebsite, legislatureWebsite |
| `US-HI` | population_raw, population_display, leader_name, leader_party, leader_since, officialWebsite, legislatureWebsite |
| `US-IA` | population_raw, population_display, leader_name, leader_party, leader_since, officialWebsite, legislatureWebsite |
| `US-ID` | population_raw, population_display, leader_name, leader_party, leader_since, officialWebsite, legislatureWebsite |
| `US-IL` | population_raw, population_display, leader_name, leader_party, leader_since, officialWebsite, legislatureWebsite |
| `US-IN` | population_raw, population_display, leader_name, leader_party, leader_since, officialWebsite, legislatureWebsite |
| `US-KS` | population_raw, population_display, leader_name, leader_party, leader_since, officialWebsite, legislatureWebsite |
| `US-KY` | population_raw, population_display, leader_name, leader_party, leader_since, officialWebsite, legislatureWebsite |
| `US-LA` | population_raw, population_display, leader_name, leader_party, leader_since, officialWebsite, legislatureWebsite |
| `US-MA` | population_raw, population_display, leader_name, leader_party, leader_since, officialWebsite, legislatureWebsite |
| `US-MD` | population_raw, population_display, leader_name, leader_party, leader_since, officialWebsite, legislatureWebsite |
| `US-ME` | population_raw, population_display, leader_name, leader_party, leader_since, officialWebsite, legislatureWebsite |
| `US-MI` | population_raw, population_display, leader_name, leader_party, leader_since, officialWebsite, legislatureWebsite |
| `US-MN` | population_raw, population_display, leader_name, leader_party, leader_since, officialWebsite, legislatureWebsite |
| `US-MO` | population_raw, population_display, leader_name, leader_party, leader_since, officialWebsite, legislatureWebsite |
| `US-MS` | population_raw, population_display, leader_name, leader_party, leader_since, officialWebsite, legislatureWebsite |
| `US-MT` | population_raw, population_display, leader_name, leader_party, leader_since, officialWebsite, legislatureWebsite |
| `US-NC` | population_raw, population_display, leader_name, leader_party, leader_since, officialWebsite, legislatureWebsite |
| `US-ND` | population_raw, population_display, leader_name, leader_party, leader_since, officialWebsite, legislatureWebsite |
| `US-NE` | population_raw, population_display, leader_name, leader_party, leader_since, officialWebsite, legislatureWebsite |
| `US-NH` | population_raw, population_display, leader_name, leader_party, leader_since, officialWebsite, legislatureWebsite |
| `US-NJ` | population_raw, population_display, leader_name, leader_party, leader_since, officialWebsite, legislatureWebsite |
| `US-NM` | population_raw, population_display, leader_name, leader_party, leader_since, officialWebsite, legislatureWebsite |
| `US-NV` | population_raw, population_display, leader_name, leader_party, leader_since, officialWebsite, legislatureWebsite |
| `US-NY` | population_raw, population_display, leader_name, leader_party, leader_since, officialWebsite, legislatureWebsite |
| `US-OH` | population_raw, population_display, leader_name, leader_party, leader_since, officialWebsite, legislatureWebsite |
| `US-OK` | population_raw, population_display, leader_name, leader_party, leader_since, officialWebsite, legislatureWebsite |
| `US-OR` | population_raw, population_display, leader_name, leader_party, leader_since, officialWebsite, legislatureWebsite |
| `US-PA` | population_raw, population_display, leader_name, leader_party, leader_since, officialWebsite, legislatureWebsite |
| `US-RI` | population_raw, population_display, leader_name, leader_party, leader_since, officialWebsite, legislatureWebsite |
| `US-SC` | population_raw, population_display, leader_name, leader_party, leader_since, officialWebsite, legislatureWebsite |
| `US-SD` | population_raw, population_display, leader_name, leader_party, leader_since, officialWebsite, legislatureWebsite |
| `US-TN` | population_raw, population_display, leader_name, leader_party, leader_since, officialWebsite, legislatureWebsite |
| `US-TX` | population_raw, population_display, leader_name, leader_party, leader_since, officialWebsite, legislatureWebsite |
| `US-UT` | population_raw, population_display, leader_name, leader_party, leader_since, officialWebsite, legislatureWebsite |
| `US-VA` | population_raw, population_display, leader_name, leader_party, leader_since, officialWebsite, legislatureWebsite |
| `US-VT` | population_raw, population_display, leader_name, leader_party, leader_since, officialWebsite, legislatureWebsite |
| `US-WA` | population_raw, population_display, leader_name, leader_party, leader_since, officialWebsite, legislatureWebsite |
| `US-WI` | population_raw, population_display, leader_name, leader_party, leader_since, officialWebsite, legislatureWebsite |
| `US-WV` | population_raw, population_display, leader_name, leader_party, leader_since, officialWebsite, legislatureWebsite |
| `US-WY` | population_raw, population_display, leader_name, leader_party, leader_since, officialWebsite, legislatureWebsite |

## Per-document field status

*Statuses:* `would_write` · `unchanged` · `needs_manual_review` · `skipped`

### `AU-ACT` (AU) Australian Capital Territory

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| population_display | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| leader_name | would_write | new or different value | overlay | (missing) | "Andrew Barr" |
| leader_party | would_write | new or different value | overlay | (missing) | "Australian Labor Party" |
| leader_since | would_write | new or different value | overlay | (missing) | "2014-12-11" |
| officialWebsite | would_write | new or different value | overlay | null | "https://www.act.gov.au/" |
| legislatureWebsite | would_write | new or different value | overlay | (missing) | "https://www.parliament.act.gov.au/" |

### `AU-NSW` (AU) New South Wales

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| population_display | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| leader_name | would_write | new or different value | overlay | (missing) | "Chris Minns" |
| leader_party | would_write | new or different value | overlay | (missing) | "Australian Labor Party" |
| leader_since | would_write | new or different value | overlay | (missing) | "2023-03-28" |
| officialWebsite | would_write | new or different value | overlay | null | "https://www.nsw.gov.au/" |
| legislatureWebsite | would_write | new or different value | overlay | (missing) | "https://www.parliament.nsw.gov.au/" |

### `AU-NT` (AU) Northern Territory

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| population_display | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| leader_name | would_write | new or different value | overlay | (missing) | "Lia Finocchiaro" |
| leader_party | would_write | new or different value | overlay | (missing) | "Country Liberal Party" |
| leader_since | would_write | new or different value | overlay | (missing) | "2024-08-28" |
| officialWebsite | would_write | new or different value | overlay | null | "https://nt.gov.au/" |
| legislatureWebsite | would_write | new or different value | overlay | (missing) | "https://parliament.nt.gov.au/" |

### `AU-QLD` (AU) Queensland

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| population_display | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| leader_name | would_write | new or different value | overlay | (missing) | "David Crisafulli" |
| leader_party | would_write | new or different value | overlay | (missing) | "Liberal National Party of Queensland" |
| leader_since | would_write | new or different value | overlay | (missing) | "2024-11-01" |
| officialWebsite | would_write | new or different value | overlay | null | "https://www.qld.gov.au/about/leadership… |
| legislatureWebsite | would_write | new or different value | overlay | (missing) | "https://www.parliament.qld.gov.au/" |

### `AU-SA` (AU) South Australia

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| population_display | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| leader_name | would_write | new or different value | overlay | (missing) | "Peter Malinauskas" |
| leader_party | would_write | new or different value | overlay | (missing) | "Australian Labor Party" |
| leader_since | would_write | new or different value | overlay | (missing) | "2022-03-21" |
| officialWebsite | would_write | new or different value | overlay | null | "https://www.premier.sa.gov.au/" |
| legislatureWebsite | would_write | new or different value | overlay | (missing) | "https://www.parliament.sa.gov.au/" |

### `AU-TAS` (AU) Tasmania

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| population_display | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| leader_name | would_write | new or different value | overlay | (missing) | "Jeremy Rockliff" |
| leader_party | would_write | new or different value | overlay | (missing) | "Liberal Party" |
| leader_since | would_write | new or different value | overlay | (missing) | "2022-04-08" |
| officialWebsite | would_write | new or different value | overlay | null | "https://www.premier.tas.gov.au/" |
| legislatureWebsite | would_write | new or different value | overlay | (missing) | "https://www.parliament.tas.gov.au/" |

### `AU-VIC` (AU) Victoria

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| population_display | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| leader_name | would_write | new or different value | overlay | (missing) | "Jacinta Allan" |
| leader_party | would_write | new or different value | overlay | (missing) | "Australian Labor Party" |
| leader_since | would_write | new or different value | overlay | (missing) | "2023-09-27" |
| officialWebsite | would_write | new or different value | overlay | null | "https://www.premier.vic.gov.au/" |
| legislatureWebsite | would_write | new or different value | overlay | (missing) | "https://www.parliament.vic.gov.au/" |

### `AU-WA` (AU) Western Australia

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| population_display | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| leader_name | would_write | new or different value | overlay | (missing) | "Roger Cook" |
| leader_party | would_write | new or different value | overlay | (missing) | "Australian Labor Party" |
| leader_since | would_write | new or different value | overlay | (missing) | "2023-06-08" |
| officialWebsite | would_write | new or different value | overlay | null | "https://www.wa.gov.au/government/premie… |
| legislatureWebsite | would_write | new or different value | overlay | (missing) | "https://www.parliament.wa.gov.au/" |

### `CA-AB` (CA) Alberta

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| population_display | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| leader_name | would_write | new or different value | overlay | (missing) | "Danielle Smith" |
| leader_party | would_write | new or different value | overlay | (missing) | "United Conservative Party" |
| leader_since | would_write | new or different value | overlay | (missing) | "2022-10-11" |
| officialWebsite | would_write | new or different value | overlay | null | "https://www.alberta.ca/premier" |
| legislatureWebsite | would_write | new or different value | overlay | (missing) | "https://www.assembly.ab.ca/" |

### `CA-BC` (CA) British Columbia

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| population_display | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| leader_name | would_write | new or different value | overlay | (missing) | "David Eby" |
| leader_party | would_write | new or different value | overlay | (missing) | "British Columbia New Democratic Party" |
| leader_since | would_write | new or different value | overlay | (missing) | "2022-11-18" |
| officialWebsite | would_write | new or different value | overlay | null | "https://www2.gov.bc.ca/gov/content/gove… |
| legislatureWebsite | would_write | new or different value | overlay | (missing) | "https://www.leg.bc.ca/" |

### `CA-MB` (CA) Manitoba

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| population_display | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| leader_name | would_write | new or different value | overlay | (missing) | "Wab Kinew" |
| leader_party | would_write | new or different value | overlay | (missing) | "New Democratic Party of Manitoba" |
| leader_since | would_write | new or different value | overlay | (missing) | "2023-10-18" |
| officialWebsite | would_write | new or different value | overlay | null | "https://www.gov.mb.ca/minister/premier/… |
| legislatureWebsite | would_write | new or different value | overlay | (missing) | "https://www.gov.mb.ca/legislature/" |

### `CA-NB` (CA) New Brunswick

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| population_display | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| leader_name | would_write | new or different value | overlay | (missing) | "Susan Holt" |
| leader_party | would_write | new or different value | overlay | (missing) | "New Brunswick Liberal Association" |
| leader_since | would_write | new or different value | overlay | (missing) | "2024-11-02" |
| officialWebsite | would_write | new or different value | overlay | null | "https://gnb.ca/en/org/office-of-the-pre… |
| legislatureWebsite | would_write | new or different value | overlay | (missing) | "https://www.gnb.ca/legis/" |

### `CA-NL` (CA) Newfoundland and Labrador

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| population_display | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| leader_name | would_write | new or different value | overlay | (missing) | "Andrew Furey" |
| leader_party | would_write | new or different value | overlay | (missing) | "Liberal Party of Newfoundland and Labra… |
| leader_since | would_write | new or different value | overlay | (missing) | "2020-08-19" |
| officialWebsite | would_write | new or different value | overlay | null | "https://www.premier.gov.nl.ca/" |
| legislatureWebsite | would_write | new or different value | overlay | (missing) | "https://www.assembly.nl.ca/" |

### `CA-NS` (CA) Nova Scotia

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| population_display | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| leader_name | would_write | new or different value | overlay | (missing) | "Tim Houston" |
| leader_party | would_write | new or different value | overlay | (missing) | "Progressive Conservative Association of… |
| leader_since | would_write | new or different value | overlay | (missing) | "2021-08-31" |
| officialWebsite | would_write | new or different value | overlay | null | "https://premier.novascotia.ca/" |
| legislatureWebsite | would_write | new or different value | overlay | (missing) | "https://nslegislature.ca/" |

### `CA-NT` (CA) Northwest Territories

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| population_display | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| leader_name | would_write | new or different value | overlay | (missing) | "R.J. Simpson" |
| leader_party | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_since | would_write | new or different value | overlay | (missing) | "2023-12-08" |
| officialWebsite | would_write | new or different value | overlay | null | "https://www.gov.nt.ca/" |
| legislatureWebsite | would_write | new or different value | overlay | (missing) | "https://www.ntassembly.ca/" |

### `CA-NU` (CA) Nunavut

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| population_display | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| leader_name | would_write | new or different value | overlay | (missing) | "John Main" |
| leader_party | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_since | would_write | new or different value | overlay | (missing) | "2025-11-20" |
| officialWebsite | would_write | new or different value | overlay | null | "https://www.premier.gov.nu.ca/" |
| legislatureWebsite | would_write | new or different value | overlay | (missing) | "https://assembly.nu.ca/" |

### `CA-ON` (CA) Ontario

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| population_display | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| leader_name | would_write | new or different value | overlay | (missing) | "Doug Ford" |
| leader_party | would_write | new or different value | overlay | (missing) | "Progressive Conservative Party of Ontar… |
| leader_since | would_write | new or different value | overlay | (missing) | "2018-06-29" |
| officialWebsite | would_write | new or different value | overlay | null | "https://www.premier.gov.on.ca/" |
| legislatureWebsite | would_write | new or different value | overlay | (missing) | "https://www.ola.org/" |

### `CA-PE` (CA) Prince Edward Island

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| population_display | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| leader_name | would_write | new or different value | overlay | (missing) | "Dennis King" |
| leader_party | would_write | new or different value | overlay | (missing) | "Progressive Conservative Party of Princ… |
| leader_since | would_write | new or different value | overlay | (missing) | "2019-06-13" |
| officialWebsite | would_write | new or different value | overlay | null | "https://www.princeedwardisland.ca/en/to… |
| legislatureWebsite | would_write | new or different value | overlay | (missing) | "https://www.assembly.pe.ca/" |

### `CA-QC` (CA) Quebec

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| population_display | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| leader_name | would_write | new or different value | overlay | (missing) | "Christine Fréchette" |
| leader_party | would_write | new or different value | overlay | (missing) | "Coalition Avenir Québec" |
| leader_since | would_write | new or different value | overlay | (missing) | "2026-04-15" |
| officialWebsite | would_write | new or different value | overlay | null | "https://www.premier-ministre.gouv.qc.ca… |
| legislatureWebsite | would_write | new or different value | overlay | (missing) | "https://www.assnat.qc.ca/" |

### `CA-SK` (CA) Saskatchewan

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| population_display | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| leader_name | would_write | new or different value | overlay | (missing) | "Scott Moe" |
| leader_party | would_write | new or different value | overlay | (missing) | "Saskatchewan Party" |
| leader_since | would_write | new or different value | overlay | (missing) | "2018-02-02" |
| officialWebsite | would_write | new or different value | overlay | null | "https://www.saskatchewan.ca/government/… |
| legislatureWebsite | would_write | new or different value | overlay | (missing) | "https://www.legassembly.sk.ca/" |

### `CA-YT` (CA) Yukon

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| population_display | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| leader_name | would_write | new or different value | overlay | (missing) | "Ranj Pillai" |
| leader_party | would_write | new or different value | overlay | (missing) | "Yukon Liberal Party" |
| leader_since | would_write | new or different value | overlay | (missing) | "2023-01-14" |
| officialWebsite | would_write | new or different value | overlay | null | "https://yukon.ca/en/your-government/yuk… |
| legislatureWebsite | would_write | new or different value | overlay | (missing) | "https://yukonassembly.ca/" |

### `UK-ENG` (UK) England

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| population_display | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| leader_name | would_write | new or different value | overlay | (missing) | "Keir Starmer" |
| leader_party | would_write | new or different value | overlay | (missing) | "Labour Party" |
| leader_since | would_write | new or different value | overlay | (missing) | "2024-07-05" |
| officialWebsite | would_write | new or different value | overlay | null | "https://www.gov.uk/" |
| legislatureWebsite | would_write | new or different value | overlay | (missing) | "https://www.parliament.uk/" |

### `UK-ENG-EE` (UK) East of England

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| population_display | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| leader_name | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_party | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_since | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| officialWebsite | needs_manual_review | not automated; add to overlay or future connector | — | null |  |
| legislatureWebsite | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |

### `UK-ENG-EM` (UK) East Midlands

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| population_display | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| leader_name | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_party | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_since | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| officialWebsite | needs_manual_review | not automated; add to overlay or future connector | — | null |  |
| legislatureWebsite | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |

### `UK-ENG-LON` (UK) London

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| population_display | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| leader_name | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_party | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_since | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| officialWebsite | needs_manual_review | not automated; add to overlay or future connector | — | null |  |
| legislatureWebsite | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |

### `UK-ENG-NE` (UK) North East England

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| population_display | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| leader_name | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_party | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_since | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| officialWebsite | needs_manual_review | not automated; add to overlay or future connector | — | null |  |
| legislatureWebsite | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |

### `UK-ENG-NW` (UK) North West England

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| population_display | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| leader_name | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_party | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_since | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| officialWebsite | needs_manual_review | not automated; add to overlay or future connector | — | null |  |
| legislatureWebsite | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |

### `UK-ENG-SE` (UK) South East England

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| population_display | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| leader_name | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_party | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_since | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| officialWebsite | needs_manual_review | not automated; add to overlay or future connector | — | null |  |
| legislatureWebsite | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |

### `UK-ENG-SW` (UK) South West England

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| population_display | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| leader_name | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_party | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_since | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| officialWebsite | needs_manual_review | not automated; add to overlay or future connector | — | null |  |
| legislatureWebsite | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |

### `UK-ENG-WM` (UK) West Midlands

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| population_display | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| leader_name | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_party | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_since | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| officialWebsite | needs_manual_review | not automated; add to overlay or future connector | — | null |  |
| legislatureWebsite | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |

### `UK-ENG-YOR` (UK) Yorkshire and the Humber

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| population_display | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| leader_name | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_party | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_since | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| officialWebsite | needs_manual_review | not automated; add to overlay or future connector | — | null |  |
| legislatureWebsite | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |

### `UK-NIR` (UK) Northern Ireland

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| population_display | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| leader_name | would_write | new or different value | overlay | (missing) | "Michelle O'Neill" |
| leader_party | would_write | new or different value | overlay | (missing) | "Sinn Féin" |
| leader_since | would_write | new or different value | overlay | (missing) | "2024-02-03" |
| officialWebsite | would_write | new or different value | overlay | null | "https://www.executiveoffice-ni.gov.uk/" |
| legislatureWebsite | would_write | new or different value | overlay | (missing) | "https://www.niassembly.gov.uk/" |

### `UK-SCT` (UK) Scotland

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| population_display | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| leader_name | would_write | new or different value | overlay | (missing) | "John Swinney" |
| leader_party | would_write | new or different value | overlay | (missing) | "Scottish National Party" |
| leader_since | would_write | new or different value | overlay | (missing) | "2024-05-08" |
| officialWebsite | would_write | new or different value | overlay | null | "https://www.gov.scot/" |
| legislatureWebsite | would_write | new or different value | overlay | (missing) | "https://www.parliament.scot/" |

### `UK-WLS` (UK) Wales

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| population_display | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| leader_name | would_write | new or different value | overlay | (missing) | "Eluned Morgan" |
| leader_party | would_write | new or different value | overlay | (missing) | "Welsh Labour" |
| leader_since | would_write | new or different value | overlay | (missing) | "2024-08-06" |
| officialWebsite | would_write | new or different value | overlay | null | "https://www.gov.wales/" |
| legislatureWebsite | would_write | new or different value | overlay | (missing) | "https://www.senedd.wales/" |

### `US-AK` (US) Alaska

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 732673 |
| population_display | would_write | new or different value | census_api | (missing) | "733K" |
| leader_name | would_write | new or different value | overlay | (missing) | "Mike Dunleavy" |
| leader_party | would_write | new or different value | overlay | (missing) | "Republican Party" |
| leader_since | would_write | new or different value | overlay | (missing) | "2018-12-03" |
| officialWebsite | would_write | new or different value | overlay | null | "https://gov.alaska.gov/" |
| legislatureWebsite | would_write | new or different value | overlay | (missing) | "https://www.akleg.gov/" |

### `US-AL` (US) Alabama

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 5039877 |
| population_display | would_write | new or different value | census_api | (missing) | "5.04M" |
| leader_name | would_write | new or different value | overlay | (missing) | "Kay Ivey" |
| leader_party | would_write | new or different value | overlay | (missing) | "Republican Party" |
| leader_since | would_write | new or different value | overlay | (missing) | "2017-04-10" |
| officialWebsite | would_write | new or different value | overlay | null | "https://www.governor.alabama.gov/" |
| legislatureWebsite | would_write | new or different value | overlay | (missing) | "https://alison.legislature.state.al.us/… |

### `US-AR` (US) Arkansas

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 3025891 |
| population_display | would_write | new or different value | census_api | (missing) | "3.03M" |
| leader_name | would_write | new or different value | overlay | (missing) | "Sarah Huckabee Sanders" |
| leader_party | would_write | new or different value | overlay | (missing) | "Republican Party" |
| leader_since | would_write | new or different value | overlay | (missing) | "2023-01-10" |
| officialWebsite | would_write | new or different value | overlay | null | "https://governor.arkansas.gov/" |
| legislatureWebsite | would_write | new or different value | overlay | (missing) | "https://www.arkansas.gov/legislature/" |

### `US-AZ` (US) Arizona

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 7276316 |
| population_display | would_write | new or different value | census_api | (missing) | "7.28M" |
| leader_name | would_write | new or different value | overlay | (missing) | "Katie Hobbs" |
| leader_party | would_write | new or different value | overlay | (missing) | "Democratic Party" |
| leader_since | would_write | new or different value | overlay | (missing) | "2023-01-02" |
| officialWebsite | would_write | new or different value | overlay | null | "https://azgovernor.gov/" |
| legislatureWebsite | would_write | new or different value | overlay | (missing) | "https://www.azleg.gov/" |

### `US-CA` (US) California

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 39237836 |
| population_display | would_write | new or different value | census_api | (missing) | "39.24M" |
| leader_name | would_write | new or different value | overlay | (missing) | "Gavin Newsom" |
| leader_party | would_write | new or different value | overlay | (missing) | "Democratic Party" |
| leader_since | would_write | new or different value | overlay | (missing) | "2019-01-07" |
| officialWebsite | would_write | new or different value | overlay | null | "https://www.gov.ca.gov/" |
| legislatureWebsite | would_write | new or different value | overlay | (missing) | "https://www.legislature.ca.gov/" |

### `US-CO` (US) Colorado

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 5812069 |
| population_display | would_write | new or different value | census_api | (missing) | "5.81M" |
| leader_name | would_write | new or different value | overlay | (missing) | "Jared Polis" |
| leader_party | would_write | new or different value | overlay | (missing) | "Democratic Party" |
| leader_since | would_write | new or different value | overlay | (missing) | "2019-01-08" |
| officialWebsite | would_write | new or different value | overlay | null | "https://www.colorado.gov/governor/" |
| legislatureWebsite | would_write | new or different value | overlay | (missing) | "https://leg.colorado.gov/" |

### `US-CT` (US) Connecticut

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 3605597 |
| population_display | would_write | new or different value | census_api | (missing) | "3.61M" |
| leader_name | would_write | new or different value | overlay | (missing) | "Ned Lamont" |
| leader_party | would_write | new or different value | overlay | (missing) | "Democratic Party" |
| leader_since | would_write | new or different value | overlay | (missing) | "2019-01-09" |
| officialWebsite | would_write | new or different value | overlay | null | "https://portal.ct.gov/governor" |
| legislatureWebsite | would_write | new or different value | overlay | (missing) | "https://www.cga.ct.gov/" |

### `US-DC` (US) District of Columbia

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 670050 |
| population_display | would_write | new or different value | census_api | (missing) | "670K" |
| leader_name | would_write | new or different value | overlay | (missing) | "Muriel Bowser" |
| leader_party | would_write | new or different value | overlay | (missing) | "Democratic Party" |
| leader_since | would_write | new or different value | overlay | (missing) | "2015-01-02" |
| officialWebsite | would_write | new or different value | overlay | null | "https://mayor.dc.gov/" |
| legislatureWebsite | would_write | new or different value | overlay | (missing) | "https://dccouncil.gov/" |

### `US-DE` (US) Delaware

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 1003384 |
| population_display | would_write | new or different value | census_api | (missing) | "1.00M" |
| leader_name | would_write | new or different value | overlay | (missing) | "Matt Meyer" |
| leader_party | would_write | new or different value | overlay | (missing) | "Democratic Party" |
| leader_since | would_write | new or different value | overlay | (missing) | "2025-01-21" |
| officialWebsite | would_write | new or different value | overlay | null | "https://governor.delaware.gov/" |
| legislatureWebsite | would_write | new or different value | overlay | (missing) | "https://legis.delaware.gov/" |

### `US-FL` (US) Florida

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 21781128 |
| population_display | would_write | new or different value | census_api | (missing) | "21.78M" |
| leader_name | would_write | new or different value | overlay | (missing) | "Ron DeSantis" |
| leader_party | would_write | new or different value | overlay | (missing) | "Republican Party" |
| leader_since | would_write | new or different value | overlay | (missing) | "2019-01-08" |
| officialWebsite | would_write | new or different value | overlay | null | "https://www.flgov.gov/" |
| legislatureWebsite | would_write | new or different value | overlay | (missing) | "https://www.flsenate.gov/" |

### `US-GA` (US) Georgia

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 10799566 |
| population_display | would_write | new or different value | census_api | (missing) | "10.80M" |
| leader_name | would_write | new or different value | overlay | (missing) | "Brian Kemp" |
| leader_party | would_write | new or different value | overlay | (missing) | "Republican Party" |
| leader_since | would_write | new or different value | overlay | (missing) | "2019-01-14" |
| officialWebsite | would_write | new or different value | overlay | null | "https://gov.georgia.gov/" |
| legislatureWebsite | would_write | new or different value | overlay | (missing) | "https://www.legis.ga.gov/" |

### `US-HI` (US) Hawaii

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 1441553 |
| population_display | would_write | new or different value | census_api | (missing) | "1.44M" |
| leader_name | would_write | new or different value | overlay | (missing) | "Josh Green" |
| leader_party | would_write | new or different value | overlay | (missing) | "Democratic Party" |
| leader_since | would_write | new or different value | overlay | (missing) | "2022-12-05" |
| officialWebsite | would_write | new or different value | overlay | null | "https://governor.hawaii.gov/" |
| legislatureWebsite | would_write | new or different value | overlay | (missing) | "https://www.capitol.hawaii.gov/" |

### `US-IA` (US) Iowa

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 3193079 |
| population_display | would_write | new or different value | census_api | (missing) | "3.19M" |
| leader_name | would_write | new or different value | overlay | (missing) | "Kim Reynolds" |
| leader_party | would_write | new or different value | overlay | (missing) | "Republican Party" |
| leader_since | would_write | new or different value | overlay | (missing) | "2017-05-24" |
| officialWebsite | would_write | new or different value | overlay | null | "https://governor.iowa.gov/" |
| legislatureWebsite | would_write | new or different value | overlay | (missing) | "https://www.legis.iowa.gov/" |

### `US-ID` (US) Idaho

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 1900923 |
| population_display | would_write | new or different value | census_api | (missing) | "1.90M" |
| leader_name | would_write | new or different value | overlay | (missing) | "Brad Little" |
| leader_party | would_write | new or different value | overlay | (missing) | "Republican Party" |
| leader_since | would_write | new or different value | overlay | (missing) | "2019-01-07" |
| officialWebsite | would_write | new or different value | overlay | null | "https://gov.idaho.gov/" |
| legislatureWebsite | would_write | new or different value | overlay | (missing) | "https://legislature.idaho.gov/" |

### `US-IL` (US) Illinois

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 12671469 |
| population_display | would_write | new or different value | census_api | (missing) | "12.67M" |
| leader_name | would_write | new or different value | overlay | (missing) | "J.B. Pritzker" |
| leader_party | would_write | new or different value | overlay | (missing) | "Democratic Party" |
| leader_since | would_write | new or different value | overlay | (missing) | "2019-01-14" |
| officialWebsite | would_write | new or different value | overlay | null | "https://www2.illinois.gov/sites/gov/" |
| legislatureWebsite | would_write | new or different value | overlay | (missing) | "https://www.ilga.gov/" |

### `US-IN` (US) Indiana

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 6805985 |
| population_display | would_write | new or different value | census_api | (missing) | "6.81M" |
| leader_name | would_write | new or different value | overlay | (missing) | "Mike Braun" |
| leader_party | would_write | new or different value | overlay | (missing) | "Republican Party" |
| leader_since | would_write | new or different value | overlay | (missing) | "2025-01-13" |
| officialWebsite | would_write | new or different value | overlay | null | "https://www.in.gov/governor/" |
| legislatureWebsite | would_write | new or different value | overlay | (missing) | "https://iga.in.gov/" |

### `US-KS` (US) Kansas

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 2934582 |
| population_display | would_write | new or different value | census_api | (missing) | "2.93M" |
| leader_name | would_write | new or different value | overlay | (missing) | "Laura Kelly" |
| leader_party | would_write | new or different value | overlay | (missing) | "Democratic Party" |
| leader_since | would_write | new or different value | overlay | (missing) | "2019-01-14" |
| officialWebsite | would_write | new or different value | overlay | null | "https://governor.kansas.gov/" |
| legislatureWebsite | would_write | new or different value | overlay | (missing) | "https://www.kslegislature.gov/" |

### `US-KY` (US) Kentucky

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 4509394 |
| population_display | would_write | new or different value | census_api | (missing) | "4.51M" |
| leader_name | would_write | new or different value | overlay | (missing) | "Andy Beshear" |
| leader_party | would_write | new or different value | overlay | (missing) | "Democratic Party" |
| leader_since | would_write | new or different value | overlay | (missing) | "2019-12-10" |
| officialWebsite | would_write | new or different value | overlay | null | "https://governor.ky.gov/" |
| legislatureWebsite | would_write | new or different value | overlay | (missing) | "https://legislature.ky.gov/" |

### `US-LA` (US) Louisiana

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 4624047 |
| population_display | would_write | new or different value | census_api | (missing) | "4.62M" |
| leader_name | would_write | new or different value | overlay | (missing) | "Jeff Landry" |
| leader_party | would_write | new or different value | overlay | (missing) | "Republican Party" |
| leader_since | would_write | new or different value | overlay | (missing) | "2024-01-08" |
| officialWebsite | would_write | new or different value | overlay | null | "https://gov.louisiana.gov/" |
| legislatureWebsite | would_write | new or different value | overlay | (missing) | "https://legislature.la.gov/" |

### `US-MA` (US) Massachusetts

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 6984723 |
| population_display | would_write | new or different value | census_api | (missing) | "6.98M" |
| leader_name | would_write | new or different value | overlay | (missing) | "Maura Healey" |
| leader_party | would_write | new or different value | overlay | (missing) | "Democratic Party" |
| leader_since | would_write | new or different value | overlay | (missing) | "2023-01-05" |
| officialWebsite | would_write | new or different value | overlay | null | "https://www.mass.gov/orgs/office-of-the… |
| legislatureWebsite | would_write | new or different value | overlay | (missing) | "https://malegislature.gov/" |

### `US-MD` (US) Maryland

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 6165129 |
| population_display | would_write | new or different value | census_api | (missing) | "6.17M" |
| leader_name | would_write | new or different value | overlay | (missing) | "Wes Moore" |
| leader_party | would_write | new or different value | overlay | (missing) | "Democratic Party" |
| leader_since | would_write | new or different value | overlay | (missing) | "2023-01-18" |
| officialWebsite | would_write | new or different value | overlay | null | "https://governor.maryland.gov/" |
| legislatureWebsite | would_write | new or different value | overlay | (missing) | "https://mgaleg.maryland.gov/" |

### `US-ME` (US) Maine

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 1372247 |
| population_display | would_write | new or different value | census_api | (missing) | "1.37M" |
| leader_name | would_write | new or different value | overlay | (missing) | "Janet Mills" |
| leader_party | would_write | new or different value | overlay | (missing) | "Democratic Party" |
| leader_since | would_write | new or different value | overlay | (missing) | "2019-01-02" |
| officialWebsite | would_write | new or different value | overlay | null | "https://www.maine.gov/governor/" |
| legislatureWebsite | would_write | new or different value | overlay | (missing) | "https://legislature.maine.gov/" |

### `US-MI` (US) Michigan

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 10050811 |
| population_display | would_write | new or different value | census_api | (missing) | "10.05M" |
| leader_name | would_write | new or different value | overlay | (missing) | "Gretchen Whitmer" |
| leader_party | would_write | new or different value | overlay | (missing) | "Democratic Party" |
| leader_since | would_write | new or different value | overlay | (missing) | "2019-01-01" |
| officialWebsite | would_write | new or different value | overlay | null | "https://www.michigan.gov/governor/" |
| legislatureWebsite | would_write | new or different value | overlay | (missing) | "https://www.legislature.mi.gov/" |

### `US-MN` (US) Minnesota

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 5707390 |
| population_display | would_write | new or different value | census_api | (missing) | "5.71M" |
| leader_name | would_write | new or different value | overlay | (missing) | "Tim Walz" |
| leader_party | would_write | new or different value | overlay | (missing) | "Democratic Party" |
| leader_since | would_write | new or different value | overlay | (missing) | "2019-01-07" |
| officialWebsite | would_write | new or different value | overlay | null | "https://mn.gov/governor/" |
| legislatureWebsite | would_write | new or different value | overlay | (missing) | "https://www.leg.mn.gov/" |

### `US-MO` (US) Missouri

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 6168187 |
| population_display | would_write | new or different value | census_api | (missing) | "6.17M" |
| leader_name | would_write | new or different value | overlay | (missing) | "Mike Kehoe" |
| leader_party | would_write | new or different value | overlay | (missing) | "Republican Party" |
| leader_since | would_write | new or different value | overlay | (missing) | "2025-01-13" |
| officialWebsite | would_write | new or different value | overlay | null | "https://governor.mo.gov/" |
| legislatureWebsite | would_write | new or different value | overlay | (missing) | "https://www.mo.gov/government/legislati… |

### `US-MS` (US) Mississippi

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 2949965 |
| population_display | would_write | new or different value | census_api | (missing) | "2.95M" |
| leader_name | would_write | new or different value | overlay | (missing) | "Tate Reeves" |
| leader_party | would_write | new or different value | overlay | (missing) | "Republican Party" |
| leader_since | would_write | new or different value | overlay | (missing) | "2020-01-14" |
| officialWebsite | would_write | new or different value | overlay | null | "https://governor.ms.gov/" |
| legislatureWebsite | would_write | new or different value | overlay | (missing) | "https://www.legislature.ms.gov/" |

### `US-MT` (US) Montana

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 1104271 |
| population_display | would_write | new or different value | census_api | (missing) | "1.10M" |
| leader_name | would_write | new or different value | overlay | (missing) | "Greg Gianforte" |
| leader_party | would_write | new or different value | overlay | (missing) | "Republican Party" |
| leader_since | would_write | new or different value | overlay | (missing) | "2021-01-04" |
| officialWebsite | would_write | new or different value | overlay | null | "https://governor.mt.gov/" |
| legislatureWebsite | would_write | new or different value | overlay | (missing) | "https://leg.mt.gov/" |

### `US-NC` (US) North Carolina

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 10551162 |
| population_display | would_write | new or different value | census_api | (missing) | "10.55M" |
| leader_name | would_write | new or different value | overlay | (missing) | "Josh Stein" |
| leader_party | would_write | new or different value | overlay | (missing) | "Democratic Party" |
| leader_since | would_write | new or different value | overlay | (missing) | "2025-01-01" |
| officialWebsite | would_write | new or different value | overlay | null | "https://governor.nc.gov/" |
| legislatureWebsite | would_write | new or different value | overlay | (missing) | "https://www.ncleg.gov/" |

### `US-ND` (US) North Dakota

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 774948 |
| population_display | would_write | new or different value | census_api | (missing) | "775K" |
| leader_name | would_write | new or different value | overlay | (missing) | "Kelly Armstrong" |
| leader_party | would_write | new or different value | overlay | (missing) | "Republican Party" |
| leader_since | would_write | new or different value | overlay | (missing) | "2024-12-15" |
| officialWebsite | would_write | new or different value | overlay | null | "https://www.governor.nd.gov/" |
| legislatureWebsite | would_write | new or different value | overlay | (missing) | "https://www.ndlegis.gov/" |

### `US-NE` (US) Nebraska

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 1963692 |
| population_display | would_write | new or different value | census_api | (missing) | "1.96M" |
| leader_name | would_write | new or different value | overlay | (missing) | "Jim Pillen" |
| leader_party | would_write | new or different value | overlay | (missing) | "Republican Party" |
| leader_since | would_write | new or different value | overlay | (missing) | "2023-01-05" |
| officialWebsite | would_write | new or different value | overlay | null | "https://governor.nebraska.gov/" |
| legislatureWebsite | would_write | new or different value | overlay | (missing) | "https://nebraskalegislature.gov/" |

### `US-NH` (US) New Hampshire

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 1388992 |
| population_display | would_write | new or different value | census_api | (missing) | "1.39M" |
| leader_name | would_write | new or different value | overlay | (missing) | "Kelly Ayotte" |
| leader_party | would_write | new or different value | overlay | (missing) | "Republican Party" |
| leader_since | would_write | new or different value | overlay | (missing) | "2025-01-08" |
| officialWebsite | would_write | new or different value | overlay | null | "https://www.governor.nh.gov/" |
| legislatureWebsite | would_write | new or different value | overlay | (missing) | "https://www.gencourt.state.nh.us/" |

### `US-NJ` (US) New Jersey

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 9267130 |
| population_display | would_write | new or different value | census_api | (missing) | "9.27M" |
| leader_name | would_write | new or different value | overlay | (missing) | "Mikie Sherrill" |
| leader_party | would_write | new or different value | overlay | (missing) | "Democratic Party" |
| leader_since | would_write | new or different value | overlay | (missing) | "2026-01-20" |
| officialWebsite | would_write | new or different value | overlay | null | "https://www.nj.gov/governor/" |
| legislatureWebsite | would_write | new or different value | overlay | (missing) | "https://www.njleg.state.nj.us/" |

### `US-NM` (US) New Mexico

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 2115877 |
| population_display | would_write | new or different value | census_api | (missing) | "2.12M" |
| leader_name | would_write | new or different value | overlay | (missing) | "Michelle Lujan Grisham" |
| leader_party | would_write | new or different value | overlay | (missing) | "Democratic Party" |
| leader_since | would_write | new or different value | overlay | (missing) | "2019-01-01" |
| officialWebsite | would_write | new or different value | overlay | null | "https://www.governor.state.nm.us/" |
| legislatureWebsite | would_write | new or different value | overlay | (missing) | "https://www.nmlegis.gov/" |

### `US-NV` (US) Nevada

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 3143991 |
| population_display | would_write | new or different value | census_api | (missing) | "3.14M" |
| leader_name | would_write | new or different value | overlay | (missing) | "Joe Lombardo" |
| leader_party | would_write | new or different value | overlay | (missing) | "Republican Party" |
| leader_since | would_write | new or different value | overlay | (missing) | "2023-01-02" |
| officialWebsite | would_write | new or different value | overlay | null | "https://gov.nv.gov/" |
| legislatureWebsite | would_write | new or different value | overlay | (missing) | "https://www.leg.state.nv.us/" |

### `US-NY` (US) New York

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 19835913 |
| population_display | would_write | new or different value | census_api | (missing) | "19.84M" |
| leader_name | would_write | new or different value | overlay | (missing) | "Kathy Hochul" |
| leader_party | would_write | new or different value | overlay | (missing) | "Democratic Party" |
| leader_since | would_write | new or different value | overlay | (missing) | "2021-08-24" |
| officialWebsite | would_write | new or different value | overlay | null | "https://www.governor.ny.gov/" |
| legislatureWebsite | would_write | new or different value | overlay | (missing) | "https://www.nysenate.gov/" |

### `US-OH` (US) Ohio

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 11780017 |
| population_display | would_write | new or different value | census_api | (missing) | "11.78M" |
| leader_name | would_write | new or different value | overlay | (missing) | "Mike DeWine" |
| leader_party | would_write | new or different value | overlay | (missing) | "Republican Party" |
| leader_since | would_write | new or different value | overlay | (missing) | "2019-01-14" |
| officialWebsite | would_write | new or different value | overlay | null | "https://governor.ohio.gov/" |
| legislatureWebsite | would_write | new or different value | overlay | (missing) | "https://www.legislature.ohio.gov/" |

### `US-OK` (US) Oklahoma

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 3986639 |
| population_display | would_write | new or different value | census_api | (missing) | "3.99M" |
| leader_name | would_write | new or different value | overlay | (missing) | "Kevin Stitt" |
| leader_party | would_write | new or different value | overlay | (missing) | "Republican Party" |
| leader_since | would_write | new or different value | overlay | (missing) | "2019-01-14" |
| officialWebsite | would_write | new or different value | overlay | null | "https://www.oklahoma.gov/governor.html" |
| legislatureWebsite | would_write | new or different value | overlay | (missing) | "https://www.oklegislature.gov/" |

### `US-OR` (US) Oregon

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 4246155 |
| population_display | would_write | new or different value | census_api | (missing) | "4.25M" |
| leader_name | would_write | new or different value | overlay | (missing) | "Tina Kotek" |
| leader_party | would_write | new or different value | overlay | (missing) | "Democratic Party" |
| leader_since | would_write | new or different value | overlay | (missing) | "2023-01-09" |
| officialWebsite | would_write | new or different value | overlay | null | "https://www.oregon.gov/gov/" |
| legislatureWebsite | would_write | new or different value | overlay | (missing) | "https://www.oregonlegislature.gov/" |

### `US-PA` (US) Pennsylvania

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 12964056 |
| population_display | would_write | new or different value | census_api | (missing) | "12.96M" |
| leader_name | would_write | new or different value | overlay | (missing) | "Josh Shapiro" |
| leader_party | would_write | new or different value | overlay | (missing) | "Democratic Party" |
| leader_since | would_write | new or different value | overlay | (missing) | "2023-01-17" |
| officialWebsite | would_write | new or different value | overlay | null | "https://www.governor.pa.gov/" |
| legislatureWebsite | would_write | new or different value | overlay | (missing) | "https://www.palegis.us/" |

### `US-RI` (US) Rhode Island

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 1095610 |
| population_display | would_write | new or different value | census_api | (missing) | "1.10M" |
| leader_name | would_write | new or different value | overlay | (missing) | "Daniel McKee" |
| leader_party | would_write | new or different value | overlay | (missing) | "Democratic Party" |
| leader_since | would_write | new or different value | overlay | (missing) | "2021-03-02" |
| officialWebsite | would_write | new or different value | overlay | null | "https://governor.ri.gov/" |
| legislatureWebsite | would_write | new or different value | overlay | (missing) | "https://www.rilin.state.ri.us/" |

### `US-SC` (US) South Carolina

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 5190705 |
| population_display | would_write | new or different value | census_api | (missing) | "5.19M" |
| leader_name | would_write | new or different value | overlay | (missing) | "Henry McMaster" |
| leader_party | would_write | new or different value | overlay | (missing) | "Republican Party" |
| leader_since | would_write | new or different value | overlay | (missing) | "2017-01-24" |
| officialWebsite | would_write | new or different value | overlay | null | "https://governor.sc.gov/" |
| legislatureWebsite | would_write | new or different value | overlay | (missing) | "https://www.scstatehouse.gov/" |

### `US-SD` (US) South Dakota

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 895376 |
| population_display | would_write | new or different value | census_api | (missing) | "895K" |
| leader_name | would_write | new or different value | overlay | (missing) | "Larry Rhoden" |
| leader_party | would_write | new or different value | overlay | (missing) | "Republican Party" |
| leader_since | would_write | new or different value | overlay | (missing) | "2025-01-25" |
| officialWebsite | would_write | new or different value | overlay | null | "https://sd.gov/governor/" |
| legislatureWebsite | would_write | new or different value | overlay | (missing) | "https://sdlegislature.gov/" |

### `US-TN` (US) Tennessee

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 6975218 |
| population_display | would_write | new or different value | census_api | (missing) | "6.98M" |
| leader_name | would_write | new or different value | overlay | (missing) | "Bill Lee" |
| leader_party | would_write | new or different value | overlay | (missing) | "Republican Party" |
| leader_since | would_write | new or different value | overlay | (missing) | "2019-01-15" |
| officialWebsite | would_write | new or different value | overlay | null | "https://www.tn.gov/governor/" |
| legislatureWebsite | would_write | new or different value | overlay | (missing) | "https://wapp.capitol.tn.gov/" |

### `US-TX` (US) Texas

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 29527941 |
| population_display | would_write | new or different value | census_api | (missing) | "29.53M" |
| leader_name | would_write | new or different value | overlay | (missing) | "Greg Abbott" |
| leader_party | would_write | new or different value | overlay | (missing) | "Republican Party" |
| leader_since | would_write | new or different value | overlay | (missing) | "2015-01-20" |
| officialWebsite | would_write | new or different value | overlay | null | "https://gov.texas.gov/" |
| legislatureWebsite | would_write | new or different value | overlay | (missing) | "https://capitol.texas.gov/" |

### `US-UT` (US) Utah

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 3337975 |
| population_display | would_write | new or different value | census_api | (missing) | "3.34M" |
| leader_name | would_write | new or different value | overlay | (missing) | "Spencer Cox" |
| leader_party | would_write | new or different value | overlay | (missing) | "Republican Party" |
| leader_since | would_write | new or different value | overlay | (missing) | "2021-01-04" |
| officialWebsite | would_write | new or different value | overlay | null | "https://governor.utah.gov/" |
| legislatureWebsite | would_write | new or different value | overlay | (missing) | "https://le.utah.gov/" |

### `US-VA` (US) Virginia

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 8642274 |
| population_display | would_write | new or different value | census_api | (missing) | "8.64M" |
| leader_name | would_write | new or different value | overlay | (missing) | "Abigail Spanberger" |
| leader_party | would_write | new or different value | overlay | (missing) | "Democratic Party" |
| leader_since | would_write | new or different value | overlay | (missing) | "2026-01-17" |
| officialWebsite | would_write | new or different value | overlay | null | "https://www.governor.virginia.gov/" |
| legislatureWebsite | would_write | new or different value | overlay | (missing) | "https://virginiageneralassembly.gov/" |

### `US-VT` (US) Vermont

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 645570 |
| population_display | would_write | new or different value | census_api | (missing) | "646K" |
| leader_name | would_write | new or different value | overlay | (missing) | "Phil Scott" |
| leader_party | would_write | new or different value | overlay | (missing) | "Republican Party" |
| leader_since | would_write | new or different value | overlay | (missing) | "2017-01-05" |
| officialWebsite | would_write | new or different value | overlay | null | "https://governor.vermont.gov/" |
| legislatureWebsite | would_write | new or different value | overlay | (missing) | "https://legislature.vermont.gov/" |

### `US-WA` (US) Washington

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 7738692 |
| population_display | would_write | new or different value | census_api | (missing) | "7.74M" |
| leader_name | would_write | new or different value | overlay | (missing) | "Bob Ferguson" |
| leader_party | would_write | new or different value | overlay | (missing) | "Democratic Party" |
| leader_since | would_write | new or different value | overlay | (missing) | "2025-01-13" |
| officialWebsite | would_write | new or different value | overlay | null | "https://www.governor.wa.gov/" |
| legislatureWebsite | would_write | new or different value | overlay | (missing) | "https://leg.wa.gov/" |

### `US-WI` (US) Wisconsin

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 5895908 |
| population_display | would_write | new or different value | census_api | (missing) | "5.90M" |
| leader_name | would_write | new or different value | overlay | (missing) | "Tony Evers" |
| leader_party | would_write | new or different value | overlay | (missing) | "Democratic Party" |
| leader_since | would_write | new or different value | overlay | (missing) | "2019-01-07" |
| officialWebsite | would_write | new or different value | overlay | null | "https://www.evers.wi.gov/" |
| legislatureWebsite | would_write | new or different value | overlay | (missing) | "https://docs.legis.wisconsin.gov/" |

### `US-WV` (US) West Virginia

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 1782959 |
| population_display | would_write | new or different value | census_api | (missing) | "1.78M" |
| leader_name | would_write | new or different value | overlay | (missing) | "Patrick Morrisey" |
| leader_party | would_write | new or different value | overlay | (missing) | "Republican Party" |
| leader_since | would_write | new or different value | overlay | (missing) | "2025-01-13" |
| officialWebsite | would_write | new or different value | overlay | null | "https://governor.wv.gov/" |
| legislatureWebsite | would_write | new or different value | overlay | (missing) | "https://www.wvlegislature.gov/" |

### `US-WY` (US) Wyoming

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 578803 |
| population_display | would_write | new or different value | census_api | (missing) | "579K" |
| leader_name | would_write | new or different value | overlay | (missing) | "Mark Gordon" |
| leader_party | would_write | new or different value | overlay | (missing) | "Republican Party" |
| leader_since | would_write | new or different value | overlay | (missing) | "2019-01-07" |
| officialWebsite | would_write | new or different value | overlay | null | "https://governor.wyo.gov/" |
| legislatureWebsite | would_write | new or different value | overlay | (missing) | "https://www.wyoleg.gov/" |

## Rules

- Merge-only `set(..., { merge: true })`; no document deletes.
- Only Phase 3B fields are considered; other keys preserved.
- Leadership and non-US population are **not** invented; use `engine/data/subnational-phase3b-overlay.json` for curated official values.
- Review **needs_manual_review** before relying on data in the app.
