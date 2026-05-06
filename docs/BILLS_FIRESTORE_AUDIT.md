# Firestore `bills` audit — “Bills Signed by the President”

This document combines **code-derived expectations** (always true in-repo) with **live Firestore metrics** you obtain by running the read-only audit script locally.

## TL;DR (architecture)

| Layer | Role |
|--------|------|
| **Firestore `bills`** | Should be the **cached source of truth** the UI reads for US bills, including signed/enacted rows once ingest writes them with discriminating fields. |
| **Congress.gov API** | Should be used by **server/engine jobs** to refresh or populate `bills`, not as the only path the client trusts long-term. |
| **`/api/congress-signed-laws`** | Reasonable as **sync/fallback** or **bootstrap** until `bills` contains signed-law rows; should not be the only source if Firestore already holds equivalent data. |
| **`votes` / `vote_counts` / `citizen_votes` / `member_votes`** | **Telemetry** (citizen engagement, roll-call style tallies). They do **not** replace bill metadata or signed-law discovery. |

**UI rule:** If no signed/enacted documents exist in Firestore after filtering, show **“No signed laws synced yet”** (or similar), not placeholder sample laws.

---

## 1. What the app does today (code)

### 1.1 `bills` collection

- **Read path:** `fetchFirestoreBills` in `src/App.js` queries  
  `collection(db, 'bills')` with `where('jurisdiction', '==', jurisdiction)` for **CA, UK, US, AU** when the user enables “live” legislative data.
- **US mapping:** `mapFirestoreBillToUS` expects Firestore fields such as `status`, `title`, `introducedDate`, `sourceId`, summaries, and argument lists. Status is interpreted as a **string**; display logic looks for words like **signed / enacted / law** inside **`status`** for badges—not the same shape as Congress.gov API rows used on the signed-laws screen.

### 1.2 “Bills Signed by the President” (`view === 'bills-signed-laws'`)

- **Today:** loads **only** from  
  `fetch('/api/congress-signed-laws?congress=…')`  
  and enriches via `enrichSignedLawFromApi` (Congress.gov-shaped fields: `billType`, `billNumber`, `latestActionText`, `actionDate`, `lawStatusLabel`, `sourceUrl`, etc.).
- **It does not query Firestore `bills`**, so any signed-law data already in Firestore is invisible to that screen until wired up.

### 1.3 Vote-related collections

- **`vote_counts`, `citizen_votes`, `member_votes`:** used for analytics / engagement and member voting flows, not as a substitute for federal bill + enrolled/signed metadata.

---

## 2. Live Firestore audit (fill in from script output)

Run on a machine with a service account that can read Firestore:

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\service-account.json"
cd civic-voice-app
npm run audit:firestore-bills
```

Optional: all jurisdictions:

```bash
npm run audit:firestore-bills -- --all-jurisdictions
```

Paste or summarize below after you run it.

| Metric | Value (from script) |
|--------|---------------------|
| Total `bills` docs (`jurisdiction == US`) | _run script_ |
| Distinct `status` values (count) | _run script_ |
| Documents matching signed/law keyword patterns | _run script_ |
| Documents with Congress.gov-like URL/source | _run script_ |
| Field presence: `title` | _run script_ |
| Field presence: congress session field | _run script_ |
| Field presence: bill id / number | _run script_ |
| Field presence: latest action text | _run script_ |
| Field presence: action date | _run script_ |
| Field presence: source URL | _run script_ |
| Field presence: public law / law number | _run script_ |

---

## 3. Decision: Can `bills` power “Bills Signed by the President”?

**Precondition (conceptual):** Ingest or sync must persist rows that are either:

- **Filtered:** e.g. only bills whose latest stage is enrolled → signed → law, **or**
- **Flagged:** e.g. `lawStatusLabel`, `isSigned`, `publicLawNumber`, or equivalent **and** reliable `latestAction` / date / URL for display.

**Without running the script:** We **cannot** confirm counts or field completeness in your production project from this repo alone.

**After the script:**

- If **keyword matches are zero** and **law number fields are rare**, Firestore likely does **not** yet represent signed laws; keep `/api/congress-signed-laws` as bootstrap and add a **writer** that upserts into `bills`.
- If **many docs** match keywords or carry **public law / enacted** signals with **source URLs**, prefer **Firestore-first** UI and use Congress.gov only to refresh.

---

## 4. Recommended implementation order

1. Run `npm run audit:firestore-bills` and update the table in §2.
2. If data supports it: query Firestore for signed/enacted US bills (same filters as ingest uses), map to the signed-laws card model, empty state if none.
3. If data does not support it: add an engine job that calls Congress.gov (or wraps existing API logic) and **writes** normalized documents into `bills`, then switch the UI to read Firestore first.

---

## 5. Acceptance checklist

- [ ] Confirmed whether `bills` contains signed/enacted-style rows (script + spot-check in Firebase console if needed).
- [ ] “Bills Signed by the President” does not depend solely on `/api/congress-signed-laws` when Firestore already has equivalent data.
- [ ] Empty Firestore set shows an honest empty state, not demo content.
