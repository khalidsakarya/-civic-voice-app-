# subnational_jurisdictions — seed validation report

Generated: 2026-05-08T22:40:27.652Z
Project: `civic-voice-5ea94`
Collection: `subnational_jurisdictions`
Credential mode (hint): GOOGLE_APPLICATION_CREDENTIALS

## Summary

- **Collection exists:** yes (query returned docs)
- **Document count:** 85 (expected 85)
- **Counts match expected:** yes
- **Duplicate IDs in Firestore:** none
- **Required-field issues:** 0
- **Alias expectations (US-DC, CA-NL, CA-QC, UK-ENG-YOR):** pass
- **Overall:** PASS

## Country breakdown

```json
{
  "AU": 8,
  "CA": 13,
  "UK": 13,
  "US": 51
}
```

Expected: `US` 51, `CA` 13, `AU` 8, `UK` 13.

## Required-field issues

(none)

## Alias expectation issues

(none)

## Sample document IDs (first 15)

- `AU-ACT`: Australian Capital Territory
- `AU-NSW`: New South Wales
- `AU-NT`: Northern Territory
- `AU-QLD`: Queensland
- `AU-SA`: South Australia
- `AU-TAS`: Tasmania
- `AU-VIC`: Victoria
- `AU-WA`: Western Australia
- `CA-AB`: Alberta
- `CA-BC`: British Columbia
- `CA-MB`: Manitoba
- `CA-NB`: New Brunswick
- `CA-NL`: Newfoundland and Labrador
- `CA-NS`: Nova Scotia
- `CA-NT`: Northwest Territories

## App / UI

- This report validates Firestore reference data only.
- No app UI migration is implied by this report.
