# subnational_jurisdictions — Phase 3B enrichment report

Generated: 2026-05-09T23:26:30.040Z
Mode: **DRY-RUN**
**Firestore:** live documents read for comparison.
US Census fetch: enabled
Census jurisdictions mapped: 51
Firestore credential hint: GOOGLE_APPLICATION_CREDENTIALS

## Aggregate field outcomes

| Metric | Count |
|--------|-------|
| Fields that would update / updated | 152 |
| Fields unchanged (already equal) | 0 |
| Fields needs_manual_review | 443 |
| Fields skipped (other) | 0 |
| Documents with ≥1 write | 57 |
| Total documents read | 85 (expected 85) |

## Dry-run merge preview (flat patches)

Only keys that differ from current Firestore values. Empty table if nothing to change.

| Doc ID | Keys to merge |
|--------|----------------|
| `AU-NSW` | leader_name, leader_party, leader_since, officialWebsite, legislatureWebsite |
| `AU-VIC` | leader_name, leader_party, leader_since, officialWebsite, legislatureWebsite |
| `CA-ON` | leader_name, leader_party, leader_since, officialWebsite, legislatureWebsite |
| `CA-QC` | leader_name, leader_party, leader_since, officialWebsite, legislatureWebsite |
| `UK-SCT` | leader_name, leader_party, leader_since, officialWebsite, legislatureWebsite |
| `UK-WLS` | leader_name, leader_party, leader_since, officialWebsite, legislatureWebsite |
| `US-AK` | population_raw, population_display |
| `US-AL` | population_raw, population_display |
| `US-AR` | population_raw, population_display |
| `US-AZ` | population_raw, population_display |
| `US-CA` | population_raw, population_display, leader_name, leader_party, leader_since, officialWebsite, legislatureWebsite |
| `US-CO` | population_raw, population_display |
| `US-CT` | population_raw, population_display |
| `US-DC` | population_raw, population_display |
| `US-DE` | population_raw, population_display |
| `US-FL` | population_raw, population_display, leader_name, leader_party, leader_since, officialWebsite, legislatureWebsite |
| `US-GA` | population_raw, population_display |
| `US-HI` | population_raw, population_display |
| `US-IA` | population_raw, population_display |
| `US-ID` | population_raw, population_display |
| `US-IL` | population_raw, population_display |
| `US-IN` | population_raw, population_display |
| `US-KS` | population_raw, population_display |
| `US-KY` | population_raw, population_display |
| `US-LA` | population_raw, population_display |
| `US-MA` | population_raw, population_display |
| `US-MD` | population_raw, population_display |
| `US-ME` | population_raw, population_display |
| `US-MI` | population_raw, population_display |
| `US-MN` | population_raw, population_display |
| `US-MO` | population_raw, population_display |
| `US-MS` | population_raw, population_display |
| `US-MT` | population_raw, population_display |
| `US-NC` | population_raw, population_display |
| `US-ND` | population_raw, population_display |
| `US-NE` | population_raw, population_display |
| `US-NH` | population_raw, population_display |
| `US-NJ` | population_raw, population_display |
| `US-NM` | population_raw, population_display |
| `US-NV` | population_raw, population_display |
| `US-NY` | population_raw, population_display, leader_name, leader_party, leader_since, officialWebsite, legislatureWebsite |
| `US-OH` | population_raw, population_display |
| `US-OK` | population_raw, population_display |
| `US-OR` | population_raw, population_display |
| `US-PA` | population_raw, population_display |
| `US-RI` | population_raw, population_display |
| `US-SC` | population_raw, population_display |
| `US-SD` | population_raw, population_display |
| `US-TN` | population_raw, population_display |
| `US-TX` | population_raw, population_display, leader_name, leader_party, leader_since, officialWebsite, legislatureWebsite |
| `US-UT` | population_raw, population_display |
| `US-VA` | population_raw, population_display |
| `US-VT` | population_raw, population_display |
| `US-WA` | population_raw, population_display |
| `US-WI` | population_raw, population_display |
| `US-WV` | population_raw, population_display |
| `US-WY` | population_raw, population_display |

## Per-document field status

*Statuses:* `would_write` · `unchanged` · `needs_manual_review` · `skipped`

### `AU-ACT` (AU) Australian Capital Territory

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| population_display | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| leader_name | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_party | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_since | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| officialWebsite | needs_manual_review | not automated; add to overlay or future connector | — | null |  |
| legislatureWebsite | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |

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
| leader_name | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_party | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_since | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| officialWebsite | needs_manual_review | not automated; add to overlay or future connector | — | null |  |
| legislatureWebsite | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |

### `AU-QLD` (AU) Queensland

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| population_display | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| leader_name | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_party | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_since | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| officialWebsite | needs_manual_review | not automated; add to overlay or future connector | — | null |  |
| legislatureWebsite | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |

### `AU-SA` (AU) South Australia

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| population_display | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| leader_name | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_party | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_since | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| officialWebsite | needs_manual_review | not automated; add to overlay or future connector | — | null |  |
| legislatureWebsite | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |

### `AU-TAS` (AU) Tasmania

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| population_display | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| leader_name | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_party | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_since | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| officialWebsite | needs_manual_review | not automated; add to overlay or future connector | — | null |  |
| legislatureWebsite | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |

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
| leader_name | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_party | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_since | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| officialWebsite | needs_manual_review | not automated; add to overlay or future connector | — | null |  |
| legislatureWebsite | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |

### `CA-AB` (CA) Alberta

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| population_display | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| leader_name | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_party | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_since | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| officialWebsite | needs_manual_review | not automated; add to overlay or future connector | — | null |  |
| legislatureWebsite | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |

### `CA-BC` (CA) British Columbia

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| population_display | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| leader_name | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_party | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_since | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| officialWebsite | needs_manual_review | not automated; add to overlay or future connector | — | null |  |
| legislatureWebsite | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |

### `CA-MB` (CA) Manitoba

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| population_display | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| leader_name | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_party | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_since | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| officialWebsite | needs_manual_review | not automated; add to overlay or future connector | — | null |  |
| legislatureWebsite | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |

### `CA-NB` (CA) New Brunswick

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| population_display | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| leader_name | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_party | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_since | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| officialWebsite | needs_manual_review | not automated; add to overlay or future connector | — | null |  |
| legislatureWebsite | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |

### `CA-NL` (CA) Newfoundland and Labrador

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| population_display | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| leader_name | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_party | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_since | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| officialWebsite | needs_manual_review | not automated; add to overlay or future connector | — | null |  |
| legislatureWebsite | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |

### `CA-NS` (CA) Nova Scotia

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| population_display | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| leader_name | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_party | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_since | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| officialWebsite | needs_manual_review | not automated; add to overlay or future connector | — | null |  |
| legislatureWebsite | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |

### `CA-NT` (CA) Northwest Territories

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| population_display | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| leader_name | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_party | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_since | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| officialWebsite | needs_manual_review | not automated; add to overlay or future connector | — | null |  |
| legislatureWebsite | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |

### `CA-NU` (CA) Nunavut

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| population_display | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| leader_name | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_party | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_since | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| officialWebsite | needs_manual_review | not automated; add to overlay or future connector | — | null |  |
| legislatureWebsite | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |

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
| leader_name | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_party | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_since | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| officialWebsite | needs_manual_review | not automated; add to overlay or future connector | — | null |  |
| legislatureWebsite | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |

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
| leader_name | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_party | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_since | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| officialWebsite | needs_manual_review | not automated; add to overlay or future connector | — | null |  |
| legislatureWebsite | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |

### `CA-YT` (CA) Yukon

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| population_display | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| leader_name | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_party | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_since | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| officialWebsite | needs_manual_review | not automated; add to overlay or future connector | — | null |  |
| legislatureWebsite | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |

### `UK-ENG` (UK) England

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| population_display | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| leader_name | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_party | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_since | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| officialWebsite | needs_manual_review | not automated; add to overlay or future connector | — | null |  |
| legislatureWebsite | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |

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
| leader_name | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_party | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_since | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| officialWebsite | needs_manual_review | not automated; add to overlay or future connector | — | null |  |
| legislatureWebsite | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |

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
| leader_name | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_party | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_since | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| officialWebsite | needs_manual_review | not automated; add to overlay or future connector | — | null |  |
| legislatureWebsite | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |

### `US-AL` (US) Alabama

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 5039877 |
| population_display | would_write | new or different value | census_api | (missing) | "5.04M" |
| leader_name | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_party | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_since | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| officialWebsite | needs_manual_review | not automated; add to overlay or future connector | — | null |  |
| legislatureWebsite | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |

### `US-AR` (US) Arkansas

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 3025891 |
| population_display | would_write | new or different value | census_api | (missing) | "3.03M" |
| leader_name | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_party | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_since | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| officialWebsite | needs_manual_review | not automated; add to overlay or future connector | — | null |  |
| legislatureWebsite | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |

### `US-AZ` (US) Arizona

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 7276316 |
| population_display | would_write | new or different value | census_api | (missing) | "7.28M" |
| leader_name | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_party | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_since | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| officialWebsite | needs_manual_review | not automated; add to overlay or future connector | — | null |  |
| legislatureWebsite | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |

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
| leader_name | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_party | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_since | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| officialWebsite | needs_manual_review | not automated; add to overlay or future connector | — | null |  |
| legislatureWebsite | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |

### `US-CT` (US) Connecticut

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 3605597 |
| population_display | would_write | new or different value | census_api | (missing) | "3.61M" |
| leader_name | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_party | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_since | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| officialWebsite | needs_manual_review | not automated; add to overlay or future connector | — | null |  |
| legislatureWebsite | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |

### `US-DC` (US) District of Columbia

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 670050 |
| population_display | would_write | new or different value | census_api | (missing) | "670K" |
| leader_name | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_party | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_since | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| officialWebsite | needs_manual_review | not automated; add to overlay or future connector | — | null |  |
| legislatureWebsite | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |

### `US-DE` (US) Delaware

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 1003384 |
| population_display | would_write | new or different value | census_api | (missing) | "1.00M" |
| leader_name | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_party | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_since | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| officialWebsite | needs_manual_review | not automated; add to overlay or future connector | — | null |  |
| legislatureWebsite | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |

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
| leader_name | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_party | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_since | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| officialWebsite | needs_manual_review | not automated; add to overlay or future connector | — | null |  |
| legislatureWebsite | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |

### `US-HI` (US) Hawaii

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 1441553 |
| population_display | would_write | new or different value | census_api | (missing) | "1.44M" |
| leader_name | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_party | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_since | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| officialWebsite | needs_manual_review | not automated; add to overlay or future connector | — | null |  |
| legislatureWebsite | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |

### `US-IA` (US) Iowa

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 3193079 |
| population_display | would_write | new or different value | census_api | (missing) | "3.19M" |
| leader_name | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_party | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_since | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| officialWebsite | needs_manual_review | not automated; add to overlay or future connector | — | null |  |
| legislatureWebsite | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |

### `US-ID` (US) Idaho

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 1900923 |
| population_display | would_write | new or different value | census_api | (missing) | "1.90M" |
| leader_name | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_party | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_since | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| officialWebsite | needs_manual_review | not automated; add to overlay or future connector | — | null |  |
| legislatureWebsite | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |

### `US-IL` (US) Illinois

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 12671469 |
| population_display | would_write | new or different value | census_api | (missing) | "12.67M" |
| leader_name | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_party | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_since | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| officialWebsite | needs_manual_review | not automated; add to overlay or future connector | — | null |  |
| legislatureWebsite | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |

### `US-IN` (US) Indiana

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 6805985 |
| population_display | would_write | new or different value | census_api | (missing) | "6.81M" |
| leader_name | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_party | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_since | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| officialWebsite | needs_manual_review | not automated; add to overlay or future connector | — | null |  |
| legislatureWebsite | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |

### `US-KS` (US) Kansas

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 2934582 |
| population_display | would_write | new or different value | census_api | (missing) | "2.93M" |
| leader_name | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_party | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_since | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| officialWebsite | needs_manual_review | not automated; add to overlay or future connector | — | null |  |
| legislatureWebsite | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |

### `US-KY` (US) Kentucky

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 4509394 |
| population_display | would_write | new or different value | census_api | (missing) | "4.51M" |
| leader_name | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_party | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_since | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| officialWebsite | needs_manual_review | not automated; add to overlay or future connector | — | null |  |
| legislatureWebsite | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |

### `US-LA` (US) Louisiana

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 4624047 |
| population_display | would_write | new or different value | census_api | (missing) | "4.62M" |
| leader_name | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_party | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_since | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| officialWebsite | needs_manual_review | not automated; add to overlay or future connector | — | null |  |
| legislatureWebsite | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |

### `US-MA` (US) Massachusetts

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 6984723 |
| population_display | would_write | new or different value | census_api | (missing) | "6.98M" |
| leader_name | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_party | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_since | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| officialWebsite | needs_manual_review | not automated; add to overlay or future connector | — | null |  |
| legislatureWebsite | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |

### `US-MD` (US) Maryland

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 6165129 |
| population_display | would_write | new or different value | census_api | (missing) | "6.17M" |
| leader_name | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_party | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_since | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| officialWebsite | needs_manual_review | not automated; add to overlay or future connector | — | null |  |
| legislatureWebsite | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |

### `US-ME` (US) Maine

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 1372247 |
| population_display | would_write | new or different value | census_api | (missing) | "1.37M" |
| leader_name | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_party | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_since | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| officialWebsite | needs_manual_review | not automated; add to overlay or future connector | — | null |  |
| legislatureWebsite | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |

### `US-MI` (US) Michigan

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 10050811 |
| population_display | would_write | new or different value | census_api | (missing) | "10.05M" |
| leader_name | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_party | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_since | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| officialWebsite | needs_manual_review | not automated; add to overlay or future connector | — | null |  |
| legislatureWebsite | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |

### `US-MN` (US) Minnesota

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 5707390 |
| population_display | would_write | new or different value | census_api | (missing) | "5.71M" |
| leader_name | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_party | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_since | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| officialWebsite | needs_manual_review | not automated; add to overlay or future connector | — | null |  |
| legislatureWebsite | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |

### `US-MO` (US) Missouri

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 6168187 |
| population_display | would_write | new or different value | census_api | (missing) | "6.17M" |
| leader_name | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_party | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_since | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| officialWebsite | needs_manual_review | not automated; add to overlay or future connector | — | null |  |
| legislatureWebsite | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |

### `US-MS` (US) Mississippi

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 2949965 |
| population_display | would_write | new or different value | census_api | (missing) | "2.95M" |
| leader_name | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_party | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_since | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| officialWebsite | needs_manual_review | not automated; add to overlay or future connector | — | null |  |
| legislatureWebsite | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |

### `US-MT` (US) Montana

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 1104271 |
| population_display | would_write | new or different value | census_api | (missing) | "1.10M" |
| leader_name | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_party | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_since | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| officialWebsite | needs_manual_review | not automated; add to overlay or future connector | — | null |  |
| legislatureWebsite | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |

### `US-NC` (US) North Carolina

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 10551162 |
| population_display | would_write | new or different value | census_api | (missing) | "10.55M" |
| leader_name | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_party | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_since | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| officialWebsite | needs_manual_review | not automated; add to overlay or future connector | — | null |  |
| legislatureWebsite | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |

### `US-ND` (US) North Dakota

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 774948 |
| population_display | would_write | new or different value | census_api | (missing) | "775K" |
| leader_name | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_party | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_since | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| officialWebsite | needs_manual_review | not automated; add to overlay or future connector | — | null |  |
| legislatureWebsite | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |

### `US-NE` (US) Nebraska

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 1963692 |
| population_display | would_write | new or different value | census_api | (missing) | "1.96M" |
| leader_name | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_party | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_since | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| officialWebsite | needs_manual_review | not automated; add to overlay or future connector | — | null |  |
| legislatureWebsite | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |

### `US-NH` (US) New Hampshire

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 1388992 |
| population_display | would_write | new or different value | census_api | (missing) | "1.39M" |
| leader_name | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_party | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_since | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| officialWebsite | needs_manual_review | not automated; add to overlay or future connector | — | null |  |
| legislatureWebsite | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |

### `US-NJ` (US) New Jersey

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 9267130 |
| population_display | would_write | new or different value | census_api | (missing) | "9.27M" |
| leader_name | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_party | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_since | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| officialWebsite | needs_manual_review | not automated; add to overlay or future connector | — | null |  |
| legislatureWebsite | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |

### `US-NM` (US) New Mexico

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 2115877 |
| population_display | would_write | new or different value | census_api | (missing) | "2.12M" |
| leader_name | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_party | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_since | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| officialWebsite | needs_manual_review | not automated; add to overlay or future connector | — | null |  |
| legislatureWebsite | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |

### `US-NV` (US) Nevada

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 3143991 |
| population_display | would_write | new or different value | census_api | (missing) | "3.14M" |
| leader_name | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_party | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_since | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| officialWebsite | needs_manual_review | not automated; add to overlay or future connector | — | null |  |
| legislatureWebsite | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |

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
| leader_name | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_party | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_since | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| officialWebsite | needs_manual_review | not automated; add to overlay or future connector | — | null |  |
| legislatureWebsite | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |

### `US-OK` (US) Oklahoma

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 3986639 |
| population_display | would_write | new or different value | census_api | (missing) | "3.99M" |
| leader_name | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_party | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_since | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| officialWebsite | needs_manual_review | not automated; add to overlay or future connector | — | null |  |
| legislatureWebsite | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |

### `US-OR` (US) Oregon

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 4246155 |
| population_display | would_write | new or different value | census_api | (missing) | "4.25M" |
| leader_name | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_party | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_since | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| officialWebsite | needs_manual_review | not automated; add to overlay or future connector | — | null |  |
| legislatureWebsite | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |

### `US-PA` (US) Pennsylvania

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 12964056 |
| population_display | would_write | new or different value | census_api | (missing) | "12.96M" |
| leader_name | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_party | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_since | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| officialWebsite | needs_manual_review | not automated; add to overlay or future connector | — | null |  |
| legislatureWebsite | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |

### `US-RI` (US) Rhode Island

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 1095610 |
| population_display | would_write | new or different value | census_api | (missing) | "1.10M" |
| leader_name | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_party | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_since | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| officialWebsite | needs_manual_review | not automated; add to overlay or future connector | — | null |  |
| legislatureWebsite | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |

### `US-SC` (US) South Carolina

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 5190705 |
| population_display | would_write | new or different value | census_api | (missing) | "5.19M" |
| leader_name | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_party | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_since | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| officialWebsite | needs_manual_review | not automated; add to overlay or future connector | — | null |  |
| legislatureWebsite | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |

### `US-SD` (US) South Dakota

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 895376 |
| population_display | would_write | new or different value | census_api | (missing) | "895K" |
| leader_name | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_party | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_since | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| officialWebsite | needs_manual_review | not automated; add to overlay or future connector | — | null |  |
| legislatureWebsite | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |

### `US-TN` (US) Tennessee

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 6975218 |
| population_display | would_write | new or different value | census_api | (missing) | "6.98M" |
| leader_name | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_party | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_since | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| officialWebsite | needs_manual_review | not automated; add to overlay or future connector | — | null |  |
| legislatureWebsite | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |

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
| leader_name | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_party | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_since | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| officialWebsite | needs_manual_review | not automated; add to overlay or future connector | — | null |  |
| legislatureWebsite | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |

### `US-VA` (US) Virginia

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 8642274 |
| population_display | would_write | new or different value | census_api | (missing) | "8.64M" |
| leader_name | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_party | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_since | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| officialWebsite | needs_manual_review | not automated; add to overlay or future connector | — | null |  |
| legislatureWebsite | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |

### `US-VT` (US) Vermont

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 645570 |
| population_display | would_write | new or different value | census_api | (missing) | "646K" |
| leader_name | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_party | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_since | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| officialWebsite | needs_manual_review | not automated; add to overlay or future connector | — | null |  |
| legislatureWebsite | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |

### `US-WA` (US) Washington

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 7738692 |
| population_display | would_write | new or different value | census_api | (missing) | "7.74M" |
| leader_name | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_party | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_since | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| officialWebsite | needs_manual_review | not automated; add to overlay or future connector | — | null |  |
| legislatureWebsite | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |

### `US-WI` (US) Wisconsin

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 5895908 |
| population_display | would_write | new or different value | census_api | (missing) | "5.90M" |
| leader_name | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_party | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_since | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| officialWebsite | needs_manual_review | not automated; add to overlay or future connector | — | null |  |
| legislatureWebsite | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |

### `US-WV` (US) West Virginia

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 1782959 |
| population_display | would_write | new or different value | census_api | (missing) | "1.78M" |
| leader_name | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_party | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_since | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| officialWebsite | needs_manual_review | not automated; add to overlay or future connector | — | null |  |
| legislatureWebsite | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |

### `US-WY` (US) Wyoming

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | would_write | new or different value | census_api | (missing) | 578803 |
| population_display | would_write | new or different value | census_api | (missing) | "579K" |
| leader_name | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_party | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_since | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| officialWebsite | needs_manual_review | not automated; add to overlay or future connector | — | null |  |
| legislatureWebsite | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |

## Rules

- Merge-only `set(..., { merge: true })`; no document deletes.
- Only Phase 3B fields are considered; other keys preserved.
- Leadership and non-US population are **not** invented; use `engine/data/subnational-phase3b-overlay.json` for curated official values.
- Review **needs_manual_review** before relying on data in the app.
