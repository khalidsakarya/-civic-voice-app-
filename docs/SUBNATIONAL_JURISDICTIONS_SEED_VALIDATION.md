# `subnational_jurisdictions` — seed & validation

**Purpose:** Verify static seed coverage and (after write) Firestore contents for `subnational_jurisdictions`. **No UI migration** is tracked here.

---

## Pre-write: dry-run verification

**Command:** `npm run seed:subnational-jurisdictions` (default — **no `--write`**)

**Confirmed (dry-run, no Firestore mutations):**

| Check | Result |
|-------|--------|
| Total records | **85** |
| US | **51** (50 states + DC) |
| CA | **13** (10 provinces + 3 territories) |
| AU | **8** (6 states + 2 territories) |
| UK | **13** (4 nations + 9 England regions) |
| Duplicate IDs in seed | **none** |
| Missing required fields | **none** |

**Firestore write:** Not executed from automation until you run:

`npm run seed:subnational-jurisdictions -- --write`

Uses the **same credentials as the engine scheduler** — either `GOOGLE_APPLICATION_CREDENTIALS` *or* `FIREBASE_PROJECT_ID` + `FIREBASE_CLIENT_EMAIL` + `FIREBASE_PRIVATE_KEY` (see `civic-voice-engine/.env`). Uses **merge only**, **no deletes**.

### Recommended: run from `civic-voice-engine`

So dotenv picks up the scheduler `.env` automatically:

```powershell
cd civic-voice-engine
npm run seed:subnational-jurisdictions -- --write
npm run validate:subnational-jurisdictions
```

One-shot (write then validate):

```powershell
cd civic-voice-engine
npm run seed-and-validate:subnational-jurisdictions
```

Alternatively from `civic-voice-app`: same `npm run` scripts; ensure credentials are in the environment or `.env` where `firebase-admin-init.cjs` looks.

---

## Post-write: Firestore validation

After you approve and run `--write`, run validation immediately (same cwd/credentials as seed):

```powershell
cd civic-voice-engine
npm run validate:subnational-jurisdictions
```

Or with an explicit service account path only:

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\service-account.json"
cd civic-voice-app
npm run validate:subnational-jurisdictions
```

**Output:** `docs/SUBNATIONAL_JURISDICTIONS_SEED_VALIDATION_REPORT.md` (generated; exit code 0 = PASS). Review this report **before** any app/UI migration to Firestore-first behavior.

The validator checks:

- Collection readable and document count **85**
- Country breakdown **US 51 / CA 13 / AU 8 / UK 13**
- All required fields present on each document
- Non-empty **aliases** where the seed defines them (`US-DC`, `CA-NL`, `CA-QC`, `UK-ENG-YOR`)

---

## Constraints (unchanged)

- Do **not** delete hardcoded app data until Phase 5 / parity testing.
- Do **not** migrate UI until a separate approved step (Firestore-first + fallback).
- **No app behavior change** from seed or validation scripts alone.
