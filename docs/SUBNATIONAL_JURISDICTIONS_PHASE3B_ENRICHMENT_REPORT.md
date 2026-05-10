# subnational_jurisdictions — Phase 3B enrichment report

Generated: 2026-05-10T15:59:12.433Z
Mode: **WRITE (merge-only)**
**Firestore:** live documents read for comparison.
US Census fetch: enabled
Census jurisdictions mapped: 51
Firestore credential hint: GOOGLE_APPLICATION_CREDENTIALS

## Aggregate field outcomes

| Metric | Count |
|--------|-------|
| Fields that would update / updated | 0 |
| … of which `leader_party_short` | 0 |
| Fields unchanged (already equal) | 554 |
| Fields needs_manual_review | 115 |
| Fields skipped (other) | 11 |
| Documents with ≥1 write | 0 |
| Total documents read | 85 (expected 85) |

## Dry-run merge preview (flat patches)

Only keys that differ from current Firestore values. Empty table if nothing to change.

| Doc ID | Keys to merge |
|--------|----------------|
| *(none)* | |

## Per-document field status

*Statuses:* `would_write` · `unchanged` · `needs_manual_review` · `skipped`

### `AU-ACT` (AU) Australian Capital Territory

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| population_display | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| leader_name | unchanged | already matches | overlay | "Andrew Barr" | "Andrew Barr" |
| leader_party | unchanged | already matches | overlay | "Australian Labor Party" | "Australian Labor Party" |
| leader_party_short | unchanged | already matches | derived_au_leader_party | "ALP" | "ALP" |
| leader_since | unchanged | already matches | overlay | "2014-12-11" | "2014-12-11" |
| officialWebsite | unchanged | already matches | overlay | "https://www.act.gov.au/" | "https://www.act.gov.au/" |
| legislatureWebsite | unchanged | already matches | overlay | "https://www.parliament.act.gov.au/" | "https://www.parliament.act.gov.au/" |

### `AU-NSW` (AU) New South Wales

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| population_display | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| leader_name | unchanged | already matches | overlay | "Chris Minns" | "Chris Minns" |
| leader_party | unchanged | already matches | overlay | "Australian Labor Party" | "Australian Labor Party" |
| leader_party_short | unchanged | already matches | derived_au_leader_party | "ALP" | "ALP" |
| leader_since | unchanged | already matches | overlay | "2023-03-28" | "2023-03-28" |
| officialWebsite | unchanged | already matches | overlay | "https://www.nsw.gov.au/" | "https://www.nsw.gov.au/" |
| legislatureWebsite | unchanged | already matches | overlay | "https://www.parliament.nsw.gov.au/" | "https://www.parliament.nsw.gov.au/" |

### `AU-NT` (AU) Northern Territory

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| population_display | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| leader_name | unchanged | already matches | overlay | "Lia Finocchiaro" | "Lia Finocchiaro" |
| leader_party | unchanged | already matches | overlay | "Country Liberal Party" | "Country Liberal Party" |
| leader_party_short | unchanged | already matches | derived_au_leader_party | "CLP" | "CLP" |
| leader_since | unchanged | already matches | overlay | "2024-08-28" | "2024-08-28" |
| officialWebsite | unchanged | already matches | overlay | "https://nt.gov.au/" | "https://nt.gov.au/" |
| legislatureWebsite | unchanged | already matches | overlay | "https://parliament.nt.gov.au/" | "https://parliament.nt.gov.au/" |

### `AU-QLD` (AU) Queensland

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| population_display | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| leader_name | unchanged | already matches | overlay | "David Crisafulli" | "David Crisafulli" |
| leader_party | unchanged | already matches | overlay | "Liberal National Party of Queensland" | "Liberal National Party of Queensland" |
| leader_party_short | unchanged | already matches | derived_au_leader_party | "LNP" | "LNP" |
| leader_since | unchanged | already matches | overlay | "2024-11-01" | "2024-11-01" |
| officialWebsite | unchanged | already matches | overlay | "https://www.qld.gov.au/about/leadership… | "https://www.qld.gov.au/about/leadership… |
| legislatureWebsite | unchanged | already matches | overlay | "https://www.parliament.qld.gov.au/" | "https://www.parliament.qld.gov.au/" |

### `AU-SA` (AU) South Australia

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| population_display | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| leader_name | unchanged | already matches | overlay | "Peter Malinauskas" | "Peter Malinauskas" |
| leader_party | unchanged | already matches | overlay | "Australian Labor Party" | "Australian Labor Party" |
| leader_party_short | unchanged | already matches | derived_au_leader_party | "ALP" | "ALP" |
| leader_since | unchanged | already matches | overlay | "2022-03-21" | "2022-03-21" |
| officialWebsite | unchanged | already matches | overlay | "https://www.premier.sa.gov.au/" | "https://www.premier.sa.gov.au/" |
| legislatureWebsite | unchanged | already matches | overlay | "https://www.parliament.sa.gov.au/" | "https://www.parliament.sa.gov.au/" |

### `AU-TAS` (AU) Tasmania

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| population_display | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| leader_name | unchanged | already matches | overlay | "Jeremy Rockliff" | "Jeremy Rockliff" |
| leader_party | unchanged | already matches | overlay | "Liberal Party" | "Liberal Party" |
| leader_party_short | unchanged | already matches | derived_au_leader_party | "Liberal" | "Liberal" |
| leader_since | unchanged | already matches | overlay | "2022-04-08" | "2022-04-08" |
| officialWebsite | unchanged | already matches | overlay | "https://www.premier.tas.gov.au/" | "https://www.premier.tas.gov.au/" |
| legislatureWebsite | unchanged | already matches | overlay | "https://www.parliament.tas.gov.au/" | "https://www.parliament.tas.gov.au/" |

### `AU-VIC` (AU) Victoria

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| population_display | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| leader_name | unchanged | already matches | overlay | "Jacinta Allan" | "Jacinta Allan" |
| leader_party | unchanged | already matches | overlay | "Australian Labor Party" | "Australian Labor Party" |
| leader_party_short | unchanged | already matches | derived_au_leader_party | "ALP" | "ALP" |
| leader_since | unchanged | already matches | overlay | "2023-09-27" | "2023-09-27" |
| officialWebsite | unchanged | already matches | overlay | "https://www.premier.vic.gov.au/" | "https://www.premier.vic.gov.au/" |
| legislatureWebsite | unchanged | already matches | overlay | "https://www.parliament.vic.gov.au/" | "https://www.parliament.vic.gov.au/" |

### `AU-WA` (AU) Western Australia

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| population_display | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| leader_name | unchanged | already matches | overlay | "Roger Cook" | "Roger Cook" |
| leader_party | unchanged | already matches | overlay | "Australian Labor Party" | "Australian Labor Party" |
| leader_party_short | unchanged | already matches | derived_au_leader_party | "ALP" | "ALP" |
| leader_since | unchanged | already matches | overlay | "2023-06-08" | "2023-06-08" |
| officialWebsite | unchanged | already matches | overlay | "https://www.wa.gov.au/government/premie… | "https://www.wa.gov.au/government/premie… |
| legislatureWebsite | unchanged | already matches | overlay | "https://www.parliament.wa.gov.au/" | "https://www.parliament.wa.gov.au/" |

### `CA-AB` (CA) Alberta

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| population_display | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| leader_name | unchanged | already matches | overlay | "Danielle Smith" | "Danielle Smith" |
| leader_party | unchanged | already matches | overlay | "United Conservative Party" | "United Conservative Party" |
| leader_party_short | unchanged | already matches | curated_ca_doc_map | "UCP" | "UCP" |
| leader_since | unchanged | already matches | overlay | "2022-10-11" | "2022-10-11" |
| officialWebsite | unchanged | already matches | overlay | "https://www.alberta.ca/premier" | "https://www.alberta.ca/premier" |
| legislatureWebsite | unchanged | already matches | overlay | "https://www.assembly.ab.ca/" | "https://www.assembly.ab.ca/" |

### `CA-BC` (CA) British Columbia

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| population_display | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| leader_name | unchanged | already matches | overlay | "David Eby" | "David Eby" |
| leader_party | unchanged | already matches | overlay | "British Columbia New Democratic Party" | "British Columbia New Democratic Party" |
| leader_party_short | unchanged | already matches | curated_ca_doc_map | "NDP" | "NDP" |
| leader_since | unchanged | already matches | overlay | "2022-11-18" | "2022-11-18" |
| officialWebsite | unchanged | already matches | overlay | "https://www2.gov.bc.ca/gov/content/gove… | "https://www2.gov.bc.ca/gov/content/gove… |
| legislatureWebsite | unchanged | already matches | overlay | "https://www.leg.bc.ca/" | "https://www.leg.bc.ca/" |

### `CA-MB` (CA) Manitoba

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| population_display | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| leader_name | unchanged | already matches | overlay | "Wab Kinew" | "Wab Kinew" |
| leader_party | unchanged | already matches | overlay | "New Democratic Party of Manitoba" | "New Democratic Party of Manitoba" |
| leader_party_short | unchanged | already matches | curated_ca_doc_map | "NDP" | "NDP" |
| leader_since | unchanged | already matches | overlay | "2023-10-18" | "2023-10-18" |
| officialWebsite | unchanged | already matches | overlay | "https://www.gov.mb.ca/minister/premier/… | "https://www.gov.mb.ca/minister/premier/… |
| legislatureWebsite | unchanged | already matches | overlay | "https://www.gov.mb.ca/legislature/" | "https://www.gov.mb.ca/legislature/" |

### `CA-NB` (CA) New Brunswick

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| population_display | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| leader_name | unchanged | already matches | overlay | "Susan Holt" | "Susan Holt" |
| leader_party | unchanged | already matches | overlay | "New Brunswick Liberal Association" | "New Brunswick Liberal Association" |
| leader_party_short | unchanged | already matches | curated_ca_doc_map | "Lib" | "Lib" |
| leader_since | unchanged | already matches | overlay | "2024-11-02" | "2024-11-02" |
| officialWebsite | unchanged | already matches | overlay | "https://gnb.ca/en/org/office-of-the-pre… | "https://gnb.ca/en/org/office-of-the-pre… |
| legislatureWebsite | unchanged | already matches | overlay | "https://www.gnb.ca/legis/" | "https://www.gnb.ca/legis/" |

### `CA-NL` (CA) Newfoundland and Labrador

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| population_display | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| leader_name | unchanged | already matches | overlay | "Andrew Furey" | "Andrew Furey" |
| leader_party | unchanged | already matches | overlay | "Liberal Party of Newfoundland and Labra… | "Liberal Party of Newfoundland and Labra… |
| leader_party_short | unchanged | already matches | curated_ca_doc_map | "Lib" | "Lib" |
| leader_since | unchanged | already matches | overlay | "2020-08-19" | "2020-08-19" |
| officialWebsite | unchanged | already matches | overlay | "https://www.premier.gov.nl.ca/" | "https://www.premier.gov.nl.ca/" |
| legislatureWebsite | unchanged | already matches | overlay | "https://www.assembly.nl.ca/" | "https://www.assembly.nl.ca/" |

### `CA-NS` (CA) Nova Scotia

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| population_display | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| leader_name | unchanged | already matches | overlay | "Tim Houston" | "Tim Houston" |
| leader_party | unchanged | already matches | overlay | "Progressive Conservative Association of… | "Progressive Conservative Association of… |
| leader_party_short | unchanged | already matches | curated_ca_doc_map | "PC" | "PC" |
| leader_since | unchanged | already matches | overlay | "2021-08-31" | "2021-08-31" |
| officialWebsite | unchanged | already matches | overlay | "https://premier.novascotia.ca/" | "https://premier.novascotia.ca/" |
| legislatureWebsite | unchanged | already matches | overlay | "https://nslegislature.ca/" | "https://nslegislature.ca/" |

### `CA-NT` (CA) Northwest Territories

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| population_display | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| leader_name | unchanged | already matches | overlay | "R.J. Simpson" | "R.J. Simpson" |
| leader_party | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_party_short | skipped | consensus government; no partisan leader_party | — | (missing) |  |
| leader_since | unchanged | already matches | overlay | "2023-12-08" | "2023-12-08" |
| officialWebsite | unchanged | already matches | overlay | "https://www.gov.nt.ca/" | "https://www.gov.nt.ca/" |
| legislatureWebsite | unchanged | already matches | overlay | "https://www.ntassembly.ca/" | "https://www.ntassembly.ca/" |

### `CA-NU` (CA) Nunavut

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| population_display | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| leader_name | unchanged | already matches | overlay | "John Main" | "John Main" |
| leader_party | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_party_short | skipped | consensus government; no partisan leader_party | — | (missing) |  |
| leader_since | unchanged | already matches | overlay | "2025-11-20" | "2025-11-20" |
| officialWebsite | unchanged | already matches | overlay | "https://www.premier.gov.nu.ca/" | "https://www.premier.gov.nu.ca/" |
| legislatureWebsite | unchanged | already matches | overlay | "https://assembly.nu.ca/" | "https://assembly.nu.ca/" |

### `CA-ON` (CA) Ontario

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| population_display | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| leader_name | unchanged | already matches | overlay | "Doug Ford" | "Doug Ford" |
| leader_party | unchanged | already matches | overlay | "Progressive Conservative Party of Ontar… | "Progressive Conservative Party of Ontar… |
| leader_party_short | unchanged | already matches | curated_ca_doc_map | "PC" | "PC" |
| leader_since | unchanged | already matches | overlay | "2018-06-29" | "2018-06-29" |
| officialWebsite | unchanged | already matches | overlay | "https://www.premier.gov.on.ca/" | "https://www.premier.gov.on.ca/" |
| legislatureWebsite | unchanged | already matches | overlay | "https://www.ola.org/" | "https://www.ola.org/" |

### `CA-PE` (CA) Prince Edward Island

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| population_display | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| leader_name | unchanged | already matches | overlay | "Dennis King" | "Dennis King" |
| leader_party | unchanged | already matches | overlay | "Progressive Conservative Party of Princ… | "Progressive Conservative Party of Princ… |
| leader_party_short | unchanged | already matches | curated_ca_doc_map | "PC" | "PC" |
| leader_since | unchanged | already matches | overlay | "2019-06-13" | "2019-06-13" |
| officialWebsite | unchanged | already matches | overlay | "https://www.princeedwardisland.ca/en/to… | "https://www.princeedwardisland.ca/en/to… |
| legislatureWebsite | unchanged | already matches | overlay | "https://www.assembly.pe.ca/" | "https://www.assembly.pe.ca/" |

### `CA-QC` (CA) Quebec

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| population_display | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| leader_name | unchanged | already matches | overlay | "Christine Fréchette" | "Christine Fréchette" |
| leader_party | unchanged | already matches | overlay | "Coalition Avenir Québec" | "Coalition Avenir Québec" |
| leader_party_short | unchanged | already matches | curated_ca_doc_map | "CAQ" | "CAQ" |
| leader_since | unchanged | already matches | overlay | "2026-04-15" | "2026-04-15" |
| officialWebsite | unchanged | already matches | overlay | "https://www.premier-ministre.gouv.qc.ca… | "https://www.premier-ministre.gouv.qc.ca… |
| legislatureWebsite | unchanged | already matches | overlay | "https://www.assnat.qc.ca/" | "https://www.assnat.qc.ca/" |

### `CA-SK` (CA) Saskatchewan

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| population_display | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| leader_name | unchanged | already matches | overlay | "Scott Moe" | "Scott Moe" |
| leader_party | unchanged | already matches | overlay | "Saskatchewan Party" | "Saskatchewan Party" |
| leader_party_short | unchanged | already matches | curated_ca_doc_map | "Sask. Party" | "Sask. Party" |
| leader_since | unchanged | already matches | overlay | "2018-02-02" | "2018-02-02" |
| officialWebsite | unchanged | already matches | overlay | "https://www.saskatchewan.ca/government/… | "https://www.saskatchewan.ca/government/… |
| legislatureWebsite | unchanged | already matches | overlay | "https://www.legassembly.sk.ca/" | "https://www.legassembly.sk.ca/" |

### `CA-YT` (CA) Yukon

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| population_display | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| leader_name | unchanged | already matches | overlay | "Ranj Pillai" | "Ranj Pillai" |
| leader_party | unchanged | already matches | overlay | "Yukon Liberal Party" | "Yukon Liberal Party" |
| leader_party_short | unchanged | already matches | curated_ca_doc_map | "Lib" | "Lib" |
| leader_since | unchanged | already matches | overlay | "2023-01-14" | "2023-01-14" |
| officialWebsite | unchanged | already matches | overlay | "https://yukon.ca/en/your-government/yuk… | "https://yukon.ca/en/your-government/yuk… |
| legislatureWebsite | unchanged | already matches | overlay | "https://yukonassembly.ca/" | "https://yukonassembly.ca/" |

### `UK-ENG` (UK) England

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| population_display | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| leader_name | unchanged | already matches | overlay | "Keir Starmer" | "Keir Starmer" |
| leader_party | unchanged | already matches | overlay | "Labour Party" | "Labour Party" |
| leader_party_short | unchanged | already matches | curated_uk_doc_map | "Labour" | "Labour" |
| leader_since | unchanged | already matches | overlay | "2024-07-05" | "2024-07-05" |
| officialWebsite | unchanged | already matches | overlay | "https://www.gov.uk/" | "https://www.gov.uk/" |
| legislatureWebsite | unchanged | already matches | overlay | "https://www.parliament.uk/" | "https://www.parliament.uk/" |

### `UK-ENG-EE` (UK) East of England

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| population_display | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| leader_name | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_party | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| leader_party_short | skipped | no overlay leader_party — short omitted (optional for this doc) | — | (missing) |  |
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
| leader_party_short | skipped | no overlay leader_party — short omitted (optional for this doc) | — | (missing) |  |
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
| leader_party_short | skipped | no overlay leader_party — short omitted (optional for this doc) | — | (missing) |  |
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
| leader_party_short | skipped | no overlay leader_party — short omitted (optional for this doc) | — | (missing) |  |
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
| leader_party_short | skipped | no overlay leader_party — short omitted (optional for this doc) | — | (missing) |  |
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
| leader_party_short | skipped | no overlay leader_party — short omitted (optional for this doc) | — | (missing) |  |
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
| leader_party_short | skipped | no overlay leader_party — short omitted (optional for this doc) | — | (missing) |  |
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
| leader_party_short | skipped | no overlay leader_party — short omitted (optional for this doc) | — | (missing) |  |
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
| leader_party_short | skipped | no overlay leader_party — short omitted (optional for this doc) | — | (missing) |  |
| leader_since | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |
| officialWebsite | needs_manual_review | not automated; add to overlay or future connector | — | null |  |
| legislatureWebsite | needs_manual_review | not automated; add to overlay or future connector | — | (missing) |  |

### `UK-NIR` (UK) Northern Ireland

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| population_display | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| leader_name | unchanged | already matches | overlay | "Michelle O'Neill" | "Michelle O'Neill" |
| leader_party | unchanged | already matches | overlay | "Sinn Féin" | "Sinn Féin" |
| leader_party_short | unchanged | already matches | curated_uk_doc_map | "SF" | "SF" |
| leader_since | unchanged | already matches | overlay | "2024-02-03" | "2024-02-03" |
| officialWebsite | unchanged | already matches | overlay | "https://www.executiveoffice-ni.gov.uk/" | "https://www.executiveoffice-ni.gov.uk/" |
| legislatureWebsite | unchanged | already matches | overlay | "https://www.niassembly.gov.uk/" | "https://www.niassembly.gov.uk/" |

### `UK-SCT` (UK) Scotland

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| population_display | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| leader_name | unchanged | already matches | overlay | "John Swinney" | "John Swinney" |
| leader_party | unchanged | already matches | overlay | "Scottish National Party" | "Scottish National Party" |
| leader_party_short | unchanged | already matches | curated_uk_doc_map | "SNP" | "SNP" |
| leader_since | unchanged | already matches | overlay | "2024-05-08" | "2024-05-08" |
| officialWebsite | unchanged | already matches | overlay | "https://www.gov.scot/" | "https://www.gov.scot/" |
| legislatureWebsite | unchanged | already matches | overlay | "https://www.parliament.scot/" | "https://www.parliament.scot/" |

### `UK-WLS` (UK) Wales

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| population_display | needs_manual_review | non-US population not automated in Phase 3B — add overlay | — | (missing) |  |
| leader_name | unchanged | already matches | overlay | "Eluned Morgan" | "Eluned Morgan" |
| leader_party | unchanged | already matches | overlay | "Welsh Labour" | "Welsh Labour" |
| leader_party_short | unchanged | already matches | curated_uk_doc_map | "Labour" | "Labour" |
| leader_since | unchanged | already matches | overlay | "2024-08-06" | "2024-08-06" |
| officialWebsite | unchanged | already matches | overlay | "https://www.gov.wales/" | "https://www.gov.wales/" |
| legislatureWebsite | unchanged | already matches | overlay | "https://www.senedd.wales/" | "https://www.senedd.wales/" |

### `US-AK` (US) Alaska

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | unchanged | already matches | census_api | 732673 | 732673 |
| population_display | unchanged | already matches | census_api | "733K" | "733K" |
| leader_name | unchanged | already matches | overlay | "Mike Dunleavy" | "Mike Dunleavy" |
| leader_party | unchanged | already matches | overlay | "Republican Party" | "Republican Party" |
| leader_party_short | unchanged | already matches | derived_us_leader_party | "R" | "R" |
| leader_since | unchanged | already matches | overlay | "2018-12-03" | "2018-12-03" |
| officialWebsite | unchanged | already matches | overlay | "https://gov.alaska.gov/" | "https://gov.alaska.gov/" |
| legislatureWebsite | unchanged | already matches | overlay | "https://www.akleg.gov/" | "https://www.akleg.gov/" |

### `US-AL` (US) Alabama

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | unchanged | already matches | census_api | 5039877 | 5039877 |
| population_display | unchanged | already matches | census_api | "5.04M" | "5.04M" |
| leader_name | unchanged | already matches | overlay | "Kay Ivey" | "Kay Ivey" |
| leader_party | unchanged | already matches | overlay | "Republican Party" | "Republican Party" |
| leader_party_short | unchanged | already matches | derived_us_leader_party | "R" | "R" |
| leader_since | unchanged | already matches | overlay | "2017-04-10" | "2017-04-10" |
| officialWebsite | unchanged | already matches | overlay | "https://www.governor.alabama.gov/" | "https://www.governor.alabama.gov/" |
| legislatureWebsite | unchanged | already matches | overlay | "https://alison.legislature.state.al.us/… | "https://alison.legislature.state.al.us/… |

### `US-AR` (US) Arkansas

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | unchanged | already matches | census_api | 3025891 | 3025891 |
| population_display | unchanged | already matches | census_api | "3.03M" | "3.03M" |
| leader_name | unchanged | already matches | overlay | "Sarah Huckabee Sanders" | "Sarah Huckabee Sanders" |
| leader_party | unchanged | already matches | overlay | "Republican Party" | "Republican Party" |
| leader_party_short | unchanged | already matches | derived_us_leader_party | "R" | "R" |
| leader_since | unchanged | already matches | overlay | "2023-01-10" | "2023-01-10" |
| officialWebsite | unchanged | already matches | overlay | "https://governor.arkansas.gov/" | "https://governor.arkansas.gov/" |
| legislatureWebsite | unchanged | already matches | overlay | "https://www.arkansas.gov/legislature/" | "https://www.arkansas.gov/legislature/" |

### `US-AZ` (US) Arizona

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | unchanged | already matches | census_api | 7276316 | 7276316 |
| population_display | unchanged | already matches | census_api | "7.28M" | "7.28M" |
| leader_name | unchanged | already matches | overlay | "Katie Hobbs" | "Katie Hobbs" |
| leader_party | unchanged | already matches | overlay | "Democratic Party" | "Democratic Party" |
| leader_party_short | unchanged | already matches | derived_us_leader_party | "D" | "D" |
| leader_since | unchanged | already matches | overlay | "2023-01-02" | "2023-01-02" |
| officialWebsite | unchanged | already matches | overlay | "https://azgovernor.gov/" | "https://azgovernor.gov/" |
| legislatureWebsite | unchanged | already matches | overlay | "https://www.azleg.gov/" | "https://www.azleg.gov/" |

### `US-CA` (US) California

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | unchanged | already matches | census_api | 39237836 | 39237836 |
| population_display | unchanged | already matches | census_api | "39.24M" | "39.24M" |
| leader_name | unchanged | already matches | overlay | "Gavin Newsom" | "Gavin Newsom" |
| leader_party | unchanged | already matches | overlay | "Democratic Party" | "Democratic Party" |
| leader_party_short | unchanged | already matches | derived_us_leader_party | "D" | "D" |
| leader_since | unchanged | already matches | overlay | "2019-01-07" | "2019-01-07" |
| officialWebsite | unchanged | already matches | overlay | "https://www.gov.ca.gov/" | "https://www.gov.ca.gov/" |
| legislatureWebsite | unchanged | already matches | overlay | "https://www.legislature.ca.gov/" | "https://www.legislature.ca.gov/" |

### `US-CO` (US) Colorado

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | unchanged | already matches | census_api | 5812069 | 5812069 |
| population_display | unchanged | already matches | census_api | "5.81M" | "5.81M" |
| leader_name | unchanged | already matches | overlay | "Jared Polis" | "Jared Polis" |
| leader_party | unchanged | already matches | overlay | "Democratic Party" | "Democratic Party" |
| leader_party_short | unchanged | already matches | derived_us_leader_party | "D" | "D" |
| leader_since | unchanged | already matches | overlay | "2019-01-08" | "2019-01-08" |
| officialWebsite | unchanged | already matches | overlay | "https://www.colorado.gov/governor/" | "https://www.colorado.gov/governor/" |
| legislatureWebsite | unchanged | already matches | overlay | "https://leg.colorado.gov/" | "https://leg.colorado.gov/" |

### `US-CT` (US) Connecticut

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | unchanged | already matches | census_api | 3605597 | 3605597 |
| population_display | unchanged | already matches | census_api | "3.61M" | "3.61M" |
| leader_name | unchanged | already matches | overlay | "Ned Lamont" | "Ned Lamont" |
| leader_party | unchanged | already matches | overlay | "Democratic Party" | "Democratic Party" |
| leader_party_short | unchanged | already matches | derived_us_leader_party | "D" | "D" |
| leader_since | unchanged | already matches | overlay | "2019-01-09" | "2019-01-09" |
| officialWebsite | unchanged | already matches | overlay | "https://portal.ct.gov/governor" | "https://portal.ct.gov/governor" |
| legislatureWebsite | unchanged | already matches | overlay | "https://www.cga.ct.gov/" | "https://www.cga.ct.gov/" |

### `US-DC` (US) District of Columbia

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | unchanged | already matches | census_api | 670050 | 670050 |
| population_display | unchanged | already matches | census_api | "670K" | "670K" |
| leader_name | unchanged | already matches | overlay | "Muriel Bowser" | "Muriel Bowser" |
| leader_party | unchanged | already matches | overlay | "Democratic Party" | "Democratic Party" |
| leader_party_short | unchanged | already matches | derived_us_leader_party | "D" | "D" |
| leader_since | unchanged | already matches | overlay | "2015-01-02" | "2015-01-02" |
| officialWebsite | unchanged | already matches | overlay | "https://mayor.dc.gov/" | "https://mayor.dc.gov/" |
| legislatureWebsite | unchanged | already matches | overlay | "https://dccouncil.gov/" | "https://dccouncil.gov/" |

### `US-DE` (US) Delaware

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | unchanged | already matches | census_api | 1003384 | 1003384 |
| population_display | unchanged | already matches | census_api | "1.00M" | "1.00M" |
| leader_name | unchanged | already matches | overlay | "Matt Meyer" | "Matt Meyer" |
| leader_party | unchanged | already matches | overlay | "Democratic Party" | "Democratic Party" |
| leader_party_short | unchanged | already matches | derived_us_leader_party | "D" | "D" |
| leader_since | unchanged | already matches | overlay | "2025-01-21" | "2025-01-21" |
| officialWebsite | unchanged | already matches | overlay | "https://governor.delaware.gov/" | "https://governor.delaware.gov/" |
| legislatureWebsite | unchanged | already matches | overlay | "https://legis.delaware.gov/" | "https://legis.delaware.gov/" |

### `US-FL` (US) Florida

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | unchanged | already matches | census_api | 21781128 | 21781128 |
| population_display | unchanged | already matches | census_api | "21.78M" | "21.78M" |
| leader_name | unchanged | already matches | overlay | "Ron DeSantis" | "Ron DeSantis" |
| leader_party | unchanged | already matches | overlay | "Republican Party" | "Republican Party" |
| leader_party_short | unchanged | already matches | derived_us_leader_party | "R" | "R" |
| leader_since | unchanged | already matches | overlay | "2019-01-08" | "2019-01-08" |
| officialWebsite | unchanged | already matches | overlay | "https://www.flgov.gov/" | "https://www.flgov.gov/" |
| legislatureWebsite | unchanged | already matches | overlay | "https://www.flsenate.gov/" | "https://www.flsenate.gov/" |

### `US-GA` (US) Georgia

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | unchanged | already matches | census_api | 10799566 | 10799566 |
| population_display | unchanged | already matches | census_api | "10.80M" | "10.80M" |
| leader_name | unchanged | already matches | overlay | "Brian Kemp" | "Brian Kemp" |
| leader_party | unchanged | already matches | overlay | "Republican Party" | "Republican Party" |
| leader_party_short | unchanged | already matches | derived_us_leader_party | "R" | "R" |
| leader_since | unchanged | already matches | overlay | "2019-01-14" | "2019-01-14" |
| officialWebsite | unchanged | already matches | overlay | "https://gov.georgia.gov/" | "https://gov.georgia.gov/" |
| legislatureWebsite | unchanged | already matches | overlay | "https://www.legis.ga.gov/" | "https://www.legis.ga.gov/" |

### `US-HI` (US) Hawaii

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | unchanged | already matches | census_api | 1441553 | 1441553 |
| population_display | unchanged | already matches | census_api | "1.44M" | "1.44M" |
| leader_name | unchanged | already matches | overlay | "Josh Green" | "Josh Green" |
| leader_party | unchanged | already matches | overlay | "Democratic Party" | "Democratic Party" |
| leader_party_short | unchanged | already matches | derived_us_leader_party | "D" | "D" |
| leader_since | unchanged | already matches | overlay | "2022-12-05" | "2022-12-05" |
| officialWebsite | unchanged | already matches | overlay | "https://governor.hawaii.gov/" | "https://governor.hawaii.gov/" |
| legislatureWebsite | unchanged | already matches | overlay | "https://www.capitol.hawaii.gov/" | "https://www.capitol.hawaii.gov/" |

### `US-IA` (US) Iowa

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | unchanged | already matches | census_api | 3193079 | 3193079 |
| population_display | unchanged | already matches | census_api | "3.19M" | "3.19M" |
| leader_name | unchanged | already matches | overlay | "Kim Reynolds" | "Kim Reynolds" |
| leader_party | unchanged | already matches | overlay | "Republican Party" | "Republican Party" |
| leader_party_short | unchanged | already matches | derived_us_leader_party | "R" | "R" |
| leader_since | unchanged | already matches | overlay | "2017-05-24" | "2017-05-24" |
| officialWebsite | unchanged | already matches | overlay | "https://governor.iowa.gov/" | "https://governor.iowa.gov/" |
| legislatureWebsite | unchanged | already matches | overlay | "https://www.legis.iowa.gov/" | "https://www.legis.iowa.gov/" |

### `US-ID` (US) Idaho

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | unchanged | already matches | census_api | 1900923 | 1900923 |
| population_display | unchanged | already matches | census_api | "1.90M" | "1.90M" |
| leader_name | unchanged | already matches | overlay | "Brad Little" | "Brad Little" |
| leader_party | unchanged | already matches | overlay | "Republican Party" | "Republican Party" |
| leader_party_short | unchanged | already matches | derived_us_leader_party | "R" | "R" |
| leader_since | unchanged | already matches | overlay | "2019-01-07" | "2019-01-07" |
| officialWebsite | unchanged | already matches | overlay | "https://gov.idaho.gov/" | "https://gov.idaho.gov/" |
| legislatureWebsite | unchanged | already matches | overlay | "https://legislature.idaho.gov/" | "https://legislature.idaho.gov/" |

### `US-IL` (US) Illinois

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | unchanged | already matches | census_api | 12671469 | 12671469 |
| population_display | unchanged | already matches | census_api | "12.67M" | "12.67M" |
| leader_name | unchanged | already matches | overlay | "J.B. Pritzker" | "J.B. Pritzker" |
| leader_party | unchanged | already matches | overlay | "Democratic Party" | "Democratic Party" |
| leader_party_short | unchanged | already matches | derived_us_leader_party | "D" | "D" |
| leader_since | unchanged | already matches | overlay | "2019-01-14" | "2019-01-14" |
| officialWebsite | unchanged | already matches | overlay | "https://www2.illinois.gov/sites/gov/" | "https://www2.illinois.gov/sites/gov/" |
| legislatureWebsite | unchanged | already matches | overlay | "https://www.ilga.gov/" | "https://www.ilga.gov/" |

### `US-IN` (US) Indiana

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | unchanged | already matches | census_api | 6805985 | 6805985 |
| population_display | unchanged | already matches | census_api | "6.81M" | "6.81M" |
| leader_name | unchanged | already matches | overlay | "Mike Braun" | "Mike Braun" |
| leader_party | unchanged | already matches | overlay | "Republican Party" | "Republican Party" |
| leader_party_short | unchanged | already matches | derived_us_leader_party | "R" | "R" |
| leader_since | unchanged | already matches | overlay | "2025-01-13" | "2025-01-13" |
| officialWebsite | unchanged | already matches | overlay | "https://www.in.gov/governor/" | "https://www.in.gov/governor/" |
| legislatureWebsite | unchanged | already matches | overlay | "https://iga.in.gov/" | "https://iga.in.gov/" |

### `US-KS` (US) Kansas

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | unchanged | already matches | census_api | 2934582 | 2934582 |
| population_display | unchanged | already matches | census_api | "2.93M" | "2.93M" |
| leader_name | unchanged | already matches | overlay | "Laura Kelly" | "Laura Kelly" |
| leader_party | unchanged | already matches | overlay | "Democratic Party" | "Democratic Party" |
| leader_party_short | unchanged | already matches | derived_us_leader_party | "D" | "D" |
| leader_since | unchanged | already matches | overlay | "2019-01-14" | "2019-01-14" |
| officialWebsite | unchanged | already matches | overlay | "https://governor.kansas.gov/" | "https://governor.kansas.gov/" |
| legislatureWebsite | unchanged | already matches | overlay | "https://www.kslegislature.gov/" | "https://www.kslegislature.gov/" |

### `US-KY` (US) Kentucky

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | unchanged | already matches | census_api | 4509394 | 4509394 |
| population_display | unchanged | already matches | census_api | "4.51M" | "4.51M" |
| leader_name | unchanged | already matches | overlay | "Andy Beshear" | "Andy Beshear" |
| leader_party | unchanged | already matches | overlay | "Democratic Party" | "Democratic Party" |
| leader_party_short | unchanged | already matches | derived_us_leader_party | "D" | "D" |
| leader_since | unchanged | already matches | overlay | "2019-12-10" | "2019-12-10" |
| officialWebsite | unchanged | already matches | overlay | "https://governor.ky.gov/" | "https://governor.ky.gov/" |
| legislatureWebsite | unchanged | already matches | overlay | "https://legislature.ky.gov/" | "https://legislature.ky.gov/" |

### `US-LA` (US) Louisiana

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | unchanged | already matches | census_api | 4624047 | 4624047 |
| population_display | unchanged | already matches | census_api | "4.62M" | "4.62M" |
| leader_name | unchanged | already matches | overlay | "Jeff Landry" | "Jeff Landry" |
| leader_party | unchanged | already matches | overlay | "Republican Party" | "Republican Party" |
| leader_party_short | unchanged | already matches | derived_us_leader_party | "R" | "R" |
| leader_since | unchanged | already matches | overlay | "2024-01-08" | "2024-01-08" |
| officialWebsite | unchanged | already matches | overlay | "https://gov.louisiana.gov/" | "https://gov.louisiana.gov/" |
| legislatureWebsite | unchanged | already matches | overlay | "https://legislature.la.gov/" | "https://legislature.la.gov/" |

### `US-MA` (US) Massachusetts

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | unchanged | already matches | census_api | 6984723 | 6984723 |
| population_display | unchanged | already matches | census_api | "6.98M" | "6.98M" |
| leader_name | unchanged | already matches | overlay | "Maura Healey" | "Maura Healey" |
| leader_party | unchanged | already matches | overlay | "Democratic Party" | "Democratic Party" |
| leader_party_short | unchanged | already matches | derived_us_leader_party | "D" | "D" |
| leader_since | unchanged | already matches | overlay | "2023-01-05" | "2023-01-05" |
| officialWebsite | unchanged | already matches | overlay | "https://www.mass.gov/orgs/office-of-the… | "https://www.mass.gov/orgs/office-of-the… |
| legislatureWebsite | unchanged | already matches | overlay | "https://malegislature.gov/" | "https://malegislature.gov/" |

### `US-MD` (US) Maryland

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | unchanged | already matches | census_api | 6165129 | 6165129 |
| population_display | unchanged | already matches | census_api | "6.17M" | "6.17M" |
| leader_name | unchanged | already matches | overlay | "Wes Moore" | "Wes Moore" |
| leader_party | unchanged | already matches | overlay | "Democratic Party" | "Democratic Party" |
| leader_party_short | unchanged | already matches | derived_us_leader_party | "D" | "D" |
| leader_since | unchanged | already matches | overlay | "2023-01-18" | "2023-01-18" |
| officialWebsite | unchanged | already matches | overlay | "https://governor.maryland.gov/" | "https://governor.maryland.gov/" |
| legislatureWebsite | unchanged | already matches | overlay | "https://mgaleg.maryland.gov/" | "https://mgaleg.maryland.gov/" |

### `US-ME` (US) Maine

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | unchanged | already matches | census_api | 1372247 | 1372247 |
| population_display | unchanged | already matches | census_api | "1.37M" | "1.37M" |
| leader_name | unchanged | already matches | overlay | "Janet Mills" | "Janet Mills" |
| leader_party | unchanged | already matches | overlay | "Democratic Party" | "Democratic Party" |
| leader_party_short | unchanged | already matches | derived_us_leader_party | "D" | "D" |
| leader_since | unchanged | already matches | overlay | "2019-01-02" | "2019-01-02" |
| officialWebsite | unchanged | already matches | overlay | "https://www.maine.gov/governor/" | "https://www.maine.gov/governor/" |
| legislatureWebsite | unchanged | already matches | overlay | "https://legislature.maine.gov/" | "https://legislature.maine.gov/" |

### `US-MI` (US) Michigan

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | unchanged | already matches | census_api | 10050811 | 10050811 |
| population_display | unchanged | already matches | census_api | "10.05M" | "10.05M" |
| leader_name | unchanged | already matches | overlay | "Gretchen Whitmer" | "Gretchen Whitmer" |
| leader_party | unchanged | already matches | overlay | "Democratic Party" | "Democratic Party" |
| leader_party_short | unchanged | already matches | derived_us_leader_party | "D" | "D" |
| leader_since | unchanged | already matches | overlay | "2019-01-01" | "2019-01-01" |
| officialWebsite | unchanged | already matches | overlay | "https://www.michigan.gov/governor/" | "https://www.michigan.gov/governor/" |
| legislatureWebsite | unchanged | already matches | overlay | "https://www.legislature.mi.gov/" | "https://www.legislature.mi.gov/" |

### `US-MN` (US) Minnesota

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | unchanged | already matches | census_api | 5707390 | 5707390 |
| population_display | unchanged | already matches | census_api | "5.71M" | "5.71M" |
| leader_name | unchanged | already matches | overlay | "Tim Walz" | "Tim Walz" |
| leader_party | unchanged | already matches | overlay | "Democratic Party" | "Democratic Party" |
| leader_party_short | unchanged | already matches | derived_us_leader_party | "D" | "D" |
| leader_since | unchanged | already matches | overlay | "2019-01-07" | "2019-01-07" |
| officialWebsite | unchanged | already matches | overlay | "https://mn.gov/governor/" | "https://mn.gov/governor/" |
| legislatureWebsite | unchanged | already matches | overlay | "https://www.leg.mn.gov/" | "https://www.leg.mn.gov/" |

### `US-MO` (US) Missouri

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | unchanged | already matches | census_api | 6168187 | 6168187 |
| population_display | unchanged | already matches | census_api | "6.17M" | "6.17M" |
| leader_name | unchanged | already matches | overlay | "Mike Kehoe" | "Mike Kehoe" |
| leader_party | unchanged | already matches | overlay | "Republican Party" | "Republican Party" |
| leader_party_short | unchanged | already matches | derived_us_leader_party | "R" | "R" |
| leader_since | unchanged | already matches | overlay | "2025-01-13" | "2025-01-13" |
| officialWebsite | unchanged | already matches | overlay | "https://governor.mo.gov/" | "https://governor.mo.gov/" |
| legislatureWebsite | unchanged | already matches | overlay | "https://www.mo.gov/government/legislati… | "https://www.mo.gov/government/legislati… |

### `US-MS` (US) Mississippi

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | unchanged | already matches | census_api | 2949965 | 2949965 |
| population_display | unchanged | already matches | census_api | "2.95M" | "2.95M" |
| leader_name | unchanged | already matches | overlay | "Tate Reeves" | "Tate Reeves" |
| leader_party | unchanged | already matches | overlay | "Republican Party" | "Republican Party" |
| leader_party_short | unchanged | already matches | derived_us_leader_party | "R" | "R" |
| leader_since | unchanged | already matches | overlay | "2020-01-14" | "2020-01-14" |
| officialWebsite | unchanged | already matches | overlay | "https://governor.ms.gov/" | "https://governor.ms.gov/" |
| legislatureWebsite | unchanged | already matches | overlay | "https://www.legislature.ms.gov/" | "https://www.legislature.ms.gov/" |

### `US-MT` (US) Montana

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | unchanged | already matches | census_api | 1104271 | 1104271 |
| population_display | unchanged | already matches | census_api | "1.10M" | "1.10M" |
| leader_name | unchanged | already matches | overlay | "Greg Gianforte" | "Greg Gianforte" |
| leader_party | unchanged | already matches | overlay | "Republican Party" | "Republican Party" |
| leader_party_short | unchanged | already matches | derived_us_leader_party | "R" | "R" |
| leader_since | unchanged | already matches | overlay | "2021-01-04" | "2021-01-04" |
| officialWebsite | unchanged | already matches | overlay | "https://governor.mt.gov/" | "https://governor.mt.gov/" |
| legislatureWebsite | unchanged | already matches | overlay | "https://leg.mt.gov/" | "https://leg.mt.gov/" |

### `US-NC` (US) North Carolina

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | unchanged | already matches | census_api | 10551162 | 10551162 |
| population_display | unchanged | already matches | census_api | "10.55M" | "10.55M" |
| leader_name | unchanged | already matches | overlay | "Josh Stein" | "Josh Stein" |
| leader_party | unchanged | already matches | overlay | "Democratic Party" | "Democratic Party" |
| leader_party_short | unchanged | already matches | derived_us_leader_party | "D" | "D" |
| leader_since | unchanged | already matches | overlay | "2025-01-01" | "2025-01-01" |
| officialWebsite | unchanged | already matches | overlay | "https://governor.nc.gov/" | "https://governor.nc.gov/" |
| legislatureWebsite | unchanged | already matches | overlay | "https://www.ncleg.gov/" | "https://www.ncleg.gov/" |

### `US-ND` (US) North Dakota

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | unchanged | already matches | census_api | 774948 | 774948 |
| population_display | unchanged | already matches | census_api | "775K" | "775K" |
| leader_name | unchanged | already matches | overlay | "Kelly Armstrong" | "Kelly Armstrong" |
| leader_party | unchanged | already matches | overlay | "Republican Party" | "Republican Party" |
| leader_party_short | unchanged | already matches | derived_us_leader_party | "R" | "R" |
| leader_since | unchanged | already matches | overlay | "2024-12-15" | "2024-12-15" |
| officialWebsite | unchanged | already matches | overlay | "https://www.governor.nd.gov/" | "https://www.governor.nd.gov/" |
| legislatureWebsite | unchanged | already matches | overlay | "https://www.ndlegis.gov/" | "https://www.ndlegis.gov/" |

### `US-NE` (US) Nebraska

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | unchanged | already matches | census_api | 1963692 | 1963692 |
| population_display | unchanged | already matches | census_api | "1.96M" | "1.96M" |
| leader_name | unchanged | already matches | overlay | "Jim Pillen" | "Jim Pillen" |
| leader_party | unchanged | already matches | overlay | "Republican Party" | "Republican Party" |
| leader_party_short | unchanged | already matches | derived_us_leader_party | "R" | "R" |
| leader_since | unchanged | already matches | overlay | "2023-01-05" | "2023-01-05" |
| officialWebsite | unchanged | already matches | overlay | "https://governor.nebraska.gov/" | "https://governor.nebraska.gov/" |
| legislatureWebsite | unchanged | already matches | overlay | "https://nebraskalegislature.gov/" | "https://nebraskalegislature.gov/" |

### `US-NH` (US) New Hampshire

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | unchanged | already matches | census_api | 1388992 | 1388992 |
| population_display | unchanged | already matches | census_api | "1.39M" | "1.39M" |
| leader_name | unchanged | already matches | overlay | "Kelly Ayotte" | "Kelly Ayotte" |
| leader_party | unchanged | already matches | overlay | "Republican Party" | "Republican Party" |
| leader_party_short | unchanged | already matches | derived_us_leader_party | "R" | "R" |
| leader_since | unchanged | already matches | overlay | "2025-01-08" | "2025-01-08" |
| officialWebsite | unchanged | already matches | overlay | "https://www.governor.nh.gov/" | "https://www.governor.nh.gov/" |
| legislatureWebsite | unchanged | already matches | overlay | "https://www.gencourt.state.nh.us/" | "https://www.gencourt.state.nh.us/" |

### `US-NJ` (US) New Jersey

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | unchanged | already matches | census_api | 9267130 | 9267130 |
| population_display | unchanged | already matches | census_api | "9.27M" | "9.27M" |
| leader_name | unchanged | already matches | overlay | "Mikie Sherrill" | "Mikie Sherrill" |
| leader_party | unchanged | already matches | overlay | "Democratic Party" | "Democratic Party" |
| leader_party_short | unchanged | already matches | derived_us_leader_party | "D" | "D" |
| leader_since | unchanged | already matches | overlay | "2026-01-20" | "2026-01-20" |
| officialWebsite | unchanged | already matches | overlay | "https://www.nj.gov/governor/" | "https://www.nj.gov/governor/" |
| legislatureWebsite | unchanged | already matches | overlay | "https://www.njleg.state.nj.us/" | "https://www.njleg.state.nj.us/" |

### `US-NM` (US) New Mexico

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | unchanged | already matches | census_api | 2115877 | 2115877 |
| population_display | unchanged | already matches | census_api | "2.12M" | "2.12M" |
| leader_name | unchanged | already matches | overlay | "Michelle Lujan Grisham" | "Michelle Lujan Grisham" |
| leader_party | unchanged | already matches | overlay | "Democratic Party" | "Democratic Party" |
| leader_party_short | unchanged | already matches | derived_us_leader_party | "D" | "D" |
| leader_since | unchanged | already matches | overlay | "2019-01-01" | "2019-01-01" |
| officialWebsite | unchanged | already matches | overlay | "https://www.governor.state.nm.us/" | "https://www.governor.state.nm.us/" |
| legislatureWebsite | unchanged | already matches | overlay | "https://www.nmlegis.gov/" | "https://www.nmlegis.gov/" |

### `US-NV` (US) Nevada

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | unchanged | already matches | census_api | 3143991 | 3143991 |
| population_display | unchanged | already matches | census_api | "3.14M" | "3.14M" |
| leader_name | unchanged | already matches | overlay | "Joe Lombardo" | "Joe Lombardo" |
| leader_party | unchanged | already matches | overlay | "Republican Party" | "Republican Party" |
| leader_party_short | unchanged | already matches | derived_us_leader_party | "R" | "R" |
| leader_since | unchanged | already matches | overlay | "2023-01-02" | "2023-01-02" |
| officialWebsite | unchanged | already matches | overlay | "https://gov.nv.gov/" | "https://gov.nv.gov/" |
| legislatureWebsite | unchanged | already matches | overlay | "https://www.leg.state.nv.us/" | "https://www.leg.state.nv.us/" |

### `US-NY` (US) New York

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | unchanged | already matches | census_api | 19835913 | 19835913 |
| population_display | unchanged | already matches | census_api | "19.84M" | "19.84M" |
| leader_name | unchanged | already matches | overlay | "Kathy Hochul" | "Kathy Hochul" |
| leader_party | unchanged | already matches | overlay | "Democratic Party" | "Democratic Party" |
| leader_party_short | unchanged | already matches | derived_us_leader_party | "D" | "D" |
| leader_since | unchanged | already matches | overlay | "2021-08-24" | "2021-08-24" |
| officialWebsite | unchanged | already matches | overlay | "https://www.governor.ny.gov/" | "https://www.governor.ny.gov/" |
| legislatureWebsite | unchanged | already matches | overlay | "https://www.nysenate.gov/" | "https://www.nysenate.gov/" |

### `US-OH` (US) Ohio

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | unchanged | already matches | census_api | 11780017 | 11780017 |
| population_display | unchanged | already matches | census_api | "11.78M" | "11.78M" |
| leader_name | unchanged | already matches | overlay | "Mike DeWine" | "Mike DeWine" |
| leader_party | unchanged | already matches | overlay | "Republican Party" | "Republican Party" |
| leader_party_short | unchanged | already matches | derived_us_leader_party | "R" | "R" |
| leader_since | unchanged | already matches | overlay | "2019-01-14" | "2019-01-14" |
| officialWebsite | unchanged | already matches | overlay | "https://governor.ohio.gov/" | "https://governor.ohio.gov/" |
| legislatureWebsite | unchanged | already matches | overlay | "https://www.legislature.ohio.gov/" | "https://www.legislature.ohio.gov/" |

### `US-OK` (US) Oklahoma

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | unchanged | already matches | census_api | 3986639 | 3986639 |
| population_display | unchanged | already matches | census_api | "3.99M" | "3.99M" |
| leader_name | unchanged | already matches | overlay | "Kevin Stitt" | "Kevin Stitt" |
| leader_party | unchanged | already matches | overlay | "Republican Party" | "Republican Party" |
| leader_party_short | unchanged | already matches | derived_us_leader_party | "R" | "R" |
| leader_since | unchanged | already matches | overlay | "2019-01-14" | "2019-01-14" |
| officialWebsite | unchanged | already matches | overlay | "https://www.oklahoma.gov/governor.html" | "https://www.oklahoma.gov/governor.html" |
| legislatureWebsite | unchanged | already matches | overlay | "https://www.oklegislature.gov/" | "https://www.oklegislature.gov/" |

### `US-OR` (US) Oregon

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | unchanged | already matches | census_api | 4246155 | 4246155 |
| population_display | unchanged | already matches | census_api | "4.25M" | "4.25M" |
| leader_name | unchanged | already matches | overlay | "Tina Kotek" | "Tina Kotek" |
| leader_party | unchanged | already matches | overlay | "Democratic Party" | "Democratic Party" |
| leader_party_short | unchanged | already matches | derived_us_leader_party | "D" | "D" |
| leader_since | unchanged | already matches | overlay | "2023-01-09" | "2023-01-09" |
| officialWebsite | unchanged | already matches | overlay | "https://www.oregon.gov/gov/" | "https://www.oregon.gov/gov/" |
| legislatureWebsite | unchanged | already matches | overlay | "https://www.oregonlegislature.gov/" | "https://www.oregonlegislature.gov/" |

### `US-PA` (US) Pennsylvania

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | unchanged | already matches | census_api | 12964056 | 12964056 |
| population_display | unchanged | already matches | census_api | "12.96M" | "12.96M" |
| leader_name | unchanged | already matches | overlay | "Josh Shapiro" | "Josh Shapiro" |
| leader_party | unchanged | already matches | overlay | "Democratic Party" | "Democratic Party" |
| leader_party_short | unchanged | already matches | derived_us_leader_party | "D" | "D" |
| leader_since | unchanged | already matches | overlay | "2023-01-17" | "2023-01-17" |
| officialWebsite | unchanged | already matches | overlay | "https://www.governor.pa.gov/" | "https://www.governor.pa.gov/" |
| legislatureWebsite | unchanged | already matches | overlay | "https://www.palegis.us/" | "https://www.palegis.us/" |

### `US-RI` (US) Rhode Island

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | unchanged | already matches | census_api | 1095610 | 1095610 |
| population_display | unchanged | already matches | census_api | "1.10M" | "1.10M" |
| leader_name | unchanged | already matches | overlay | "Daniel McKee" | "Daniel McKee" |
| leader_party | unchanged | already matches | overlay | "Democratic Party" | "Democratic Party" |
| leader_party_short | unchanged | already matches | derived_us_leader_party | "D" | "D" |
| leader_since | unchanged | already matches | overlay | "2021-03-02" | "2021-03-02" |
| officialWebsite | unchanged | already matches | overlay | "https://governor.ri.gov/" | "https://governor.ri.gov/" |
| legislatureWebsite | unchanged | already matches | overlay | "https://www.rilin.state.ri.us/" | "https://www.rilin.state.ri.us/" |

### `US-SC` (US) South Carolina

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | unchanged | already matches | census_api | 5190705 | 5190705 |
| population_display | unchanged | already matches | census_api | "5.19M" | "5.19M" |
| leader_name | unchanged | already matches | overlay | "Henry McMaster" | "Henry McMaster" |
| leader_party | unchanged | already matches | overlay | "Republican Party" | "Republican Party" |
| leader_party_short | unchanged | already matches | derived_us_leader_party | "R" | "R" |
| leader_since | unchanged | already matches | overlay | "2017-01-24" | "2017-01-24" |
| officialWebsite | unchanged | already matches | overlay | "https://governor.sc.gov/" | "https://governor.sc.gov/" |
| legislatureWebsite | unchanged | already matches | overlay | "https://www.scstatehouse.gov/" | "https://www.scstatehouse.gov/" |

### `US-SD` (US) South Dakota

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | unchanged | already matches | census_api | 895376 | 895376 |
| population_display | unchanged | already matches | census_api | "895K" | "895K" |
| leader_name | unchanged | already matches | overlay | "Larry Rhoden" | "Larry Rhoden" |
| leader_party | unchanged | already matches | overlay | "Republican Party" | "Republican Party" |
| leader_party_short | unchanged | already matches | derived_us_leader_party | "R" | "R" |
| leader_since | unchanged | already matches | overlay | "2025-01-25" | "2025-01-25" |
| officialWebsite | unchanged | already matches | overlay | "https://sd.gov/governor/" | "https://sd.gov/governor/" |
| legislatureWebsite | unchanged | already matches | overlay | "https://sdlegislature.gov/" | "https://sdlegislature.gov/" |

### `US-TN` (US) Tennessee

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | unchanged | already matches | census_api | 6975218 | 6975218 |
| population_display | unchanged | already matches | census_api | "6.98M" | "6.98M" |
| leader_name | unchanged | already matches | overlay | "Bill Lee" | "Bill Lee" |
| leader_party | unchanged | already matches | overlay | "Republican Party" | "Republican Party" |
| leader_party_short | unchanged | already matches | derived_us_leader_party | "R" | "R" |
| leader_since | unchanged | already matches | overlay | "2019-01-15" | "2019-01-15" |
| officialWebsite | unchanged | already matches | overlay | "https://www.tn.gov/governor/" | "https://www.tn.gov/governor/" |
| legislatureWebsite | unchanged | already matches | overlay | "https://wapp.capitol.tn.gov/" | "https://wapp.capitol.tn.gov/" |

### `US-TX` (US) Texas

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | unchanged | already matches | census_api | 29527941 | 29527941 |
| population_display | unchanged | already matches | census_api | "29.53M" | "29.53M" |
| leader_name | unchanged | already matches | overlay | "Greg Abbott" | "Greg Abbott" |
| leader_party | unchanged | already matches | overlay | "Republican Party" | "Republican Party" |
| leader_party_short | unchanged | already matches | derived_us_leader_party | "R" | "R" |
| leader_since | unchanged | already matches | overlay | "2015-01-20" | "2015-01-20" |
| officialWebsite | unchanged | already matches | overlay | "https://gov.texas.gov/" | "https://gov.texas.gov/" |
| legislatureWebsite | unchanged | already matches | overlay | "https://capitol.texas.gov/" | "https://capitol.texas.gov/" |

### `US-UT` (US) Utah

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | unchanged | already matches | census_api | 3337975 | 3337975 |
| population_display | unchanged | already matches | census_api | "3.34M" | "3.34M" |
| leader_name | unchanged | already matches | overlay | "Spencer Cox" | "Spencer Cox" |
| leader_party | unchanged | already matches | overlay | "Republican Party" | "Republican Party" |
| leader_party_short | unchanged | already matches | derived_us_leader_party | "R" | "R" |
| leader_since | unchanged | already matches | overlay | "2021-01-04" | "2021-01-04" |
| officialWebsite | unchanged | already matches | overlay | "https://governor.utah.gov/" | "https://governor.utah.gov/" |
| legislatureWebsite | unchanged | already matches | overlay | "https://le.utah.gov/" | "https://le.utah.gov/" |

### `US-VA` (US) Virginia

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | unchanged | already matches | census_api | 8642274 | 8642274 |
| population_display | unchanged | already matches | census_api | "8.64M" | "8.64M" |
| leader_name | unchanged | already matches | overlay | "Abigail Spanberger" | "Abigail Spanberger" |
| leader_party | unchanged | already matches | overlay | "Democratic Party" | "Democratic Party" |
| leader_party_short | unchanged | already matches | derived_us_leader_party | "D" | "D" |
| leader_since | unchanged | already matches | overlay | "2026-01-17" | "2026-01-17" |
| officialWebsite | unchanged | already matches | overlay | "https://www.governor.virginia.gov/" | "https://www.governor.virginia.gov/" |
| legislatureWebsite | unchanged | already matches | overlay | "https://virginiageneralassembly.gov/" | "https://virginiageneralassembly.gov/" |

### `US-VT` (US) Vermont

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | unchanged | already matches | census_api | 645570 | 645570 |
| population_display | unchanged | already matches | census_api | "646K" | "646K" |
| leader_name | unchanged | already matches | overlay | "Phil Scott" | "Phil Scott" |
| leader_party | unchanged | already matches | overlay | "Republican Party" | "Republican Party" |
| leader_party_short | unchanged | already matches | derived_us_leader_party | "R" | "R" |
| leader_since | unchanged | already matches | overlay | "2017-01-05" | "2017-01-05" |
| officialWebsite | unchanged | already matches | overlay | "https://governor.vermont.gov/" | "https://governor.vermont.gov/" |
| legislatureWebsite | unchanged | already matches | overlay | "https://legislature.vermont.gov/" | "https://legislature.vermont.gov/" |

### `US-WA` (US) Washington

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | unchanged | already matches | census_api | 7738692 | 7738692 |
| population_display | unchanged | already matches | census_api | "7.74M" | "7.74M" |
| leader_name | unchanged | already matches | overlay | "Bob Ferguson" | "Bob Ferguson" |
| leader_party | unchanged | already matches | overlay | "Democratic Party" | "Democratic Party" |
| leader_party_short | unchanged | already matches | derived_us_leader_party | "D" | "D" |
| leader_since | unchanged | already matches | overlay | "2025-01-13" | "2025-01-13" |
| officialWebsite | unchanged | already matches | overlay | "https://www.governor.wa.gov/" | "https://www.governor.wa.gov/" |
| legislatureWebsite | unchanged | already matches | overlay | "https://leg.wa.gov/" | "https://leg.wa.gov/" |

### `US-WI` (US) Wisconsin

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | unchanged | already matches | census_api | 5895908 | 5895908 |
| population_display | unchanged | already matches | census_api | "5.90M" | "5.90M" |
| leader_name | unchanged | already matches | overlay | "Tony Evers" | "Tony Evers" |
| leader_party | unchanged | already matches | overlay | "Democratic Party" | "Democratic Party" |
| leader_party_short | unchanged | already matches | derived_us_leader_party | "D" | "D" |
| leader_since | unchanged | already matches | overlay | "2019-01-07" | "2019-01-07" |
| officialWebsite | unchanged | already matches | overlay | "https://www.evers.wi.gov/" | "https://www.evers.wi.gov/" |
| legislatureWebsite | unchanged | already matches | overlay | "https://docs.legis.wisconsin.gov/" | "https://docs.legis.wisconsin.gov/" |

### `US-WV` (US) West Virginia

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | unchanged | already matches | census_api | 1782959 | 1782959 |
| population_display | unchanged | already matches | census_api | "1.78M" | "1.78M" |
| leader_name | unchanged | already matches | overlay | "Patrick Morrisey" | "Patrick Morrisey" |
| leader_party | unchanged | already matches | overlay | "Republican Party" | "Republican Party" |
| leader_party_short | unchanged | already matches | derived_us_leader_party | "R" | "R" |
| leader_since | unchanged | already matches | overlay | "2025-01-13" | "2025-01-13" |
| officialWebsite | unchanged | already matches | overlay | "https://governor.wv.gov/" | "https://governor.wv.gov/" |
| legislatureWebsite | unchanged | already matches | overlay | "https://www.wvlegislature.gov/" | "https://www.wvlegislature.gov/" |

### `US-WY` (US) Wyoming

| Field | Status | Detail | Source | Current | Proposed |
|-------|--------|--------|--------|---------|----------|
| population_raw | unchanged | already matches | census_api | 578803 | 578803 |
| population_display | unchanged | already matches | census_api | "579K" | "579K" |
| leader_name | unchanged | already matches | overlay | "Mark Gordon" | "Mark Gordon" |
| leader_party | unchanged | already matches | overlay | "Republican Party" | "Republican Party" |
| leader_party_short | unchanged | already matches | derived_us_leader_party | "R" | "R" |
| leader_since | unchanged | already matches | overlay | "2019-01-07" | "2019-01-07" |
| officialWebsite | unchanged | already matches | overlay | "https://governor.wyo.gov/" | "https://governor.wyo.gov/" |
| legislatureWebsite | unchanged | already matches | overlay | "https://www.wyoleg.gov/" | "https://www.wyoleg.gov/" |

## Rules

- Merge-only `set(..., { merge: true })`; no document deletes.
- Only Phase 3B fields are considered; other keys preserved.
- Leadership and non-US population are **not** invented; use `engine/data/subnational-phase3b-overlay.json` for curated official values.
- `leader_party_short` is optional: filled from overlay, else US D/R/I derivation, CA/UK curated doc maps, AU conservative patterns — omit when not confident.
- Review **needs_manual_review** before relying on data in the app.
