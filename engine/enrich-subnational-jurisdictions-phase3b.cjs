/**
 * Phase 3B — optional enrichment for `subnational_jurisdictions` (merge-only, no deletes).
 *
 * Default: DRY-RUN — prints proposed changes and writes a markdown report. No Firestore writes.
 * Writes:  `docs/SUBNATIONAL_JURISDICTIONS_PHASE3B_ENRICHMENT_REPORT.md`
 *           (and console summary)
 *
 *   cd civic-voice-app && node engine/enrich-subnational-jurisdictions-phase3b.cjs
 *   cd civic-voice-app && node engine/enrich-subnational-jurisdictions-phase3b.cjs --write
 *   cd civic-voice-engine && npm run enrich:subnational-jurisdictions:phase3b
 *
 * Optional manual/curated data: `engine/data/subnational-phase3b-overlay.json` (see .sample)
 *
 * US state + DC population: optional live pull from U.S. Census Bureau API (no key) unless --no-census.
 * Other countries: population and leadership must come from overlay; missing values are reported as
 * `needs_manual_review` (never invented).
 *
 * `leader_party_short`: optional badge-style label; **only populated when confident** — US from
 * `leader_party` (D/R/I); CA/UK via curated per-doc maps; AU via conservative regex on
 * `leader_party`. Overlay key `leader_party_short` overrides when present. Consensus territories
 * (e.g. CA-NT, CA-NU) omit party and short.
 *
 * Auth: same as seed/validate (`firebase-admin-init.cjs`, scheduler .env).
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const {
  tryLoadDotenv,
  tryGetFirestore,
  describeCredentialSource,
  sanitizeGoogleApplicationCredentialsEnv,
  formatPlaceholderCredentialMessage,
  assertFirebaseCredentialsForWrite,
} = require('./firebase-admin-init.cjs');
const { buildUsCanadaAustraliaUkSeed } = require('./seed-subnational-jurisdictions.cjs');

const COLLECTION = 'subnational_jurisdictions';
const OVERLAY_PATH = path.join(__dirname, 'data', 'subnational-phase3b-overlay.json');
const REPORT_PATH = path.resolve(__dirname, '../docs/SUBNATIONAL_JURISDICTIONS_PHASE3B_ENRICHMENT_REPORT.md');

const PHASE3B_FIELDS = [
  'population_raw',
  'population_display',
  'leader_name',
  'leader_party',
  'leader_party_short',
  'leader_since',
  'officialWebsite',
  'legislatureWebsite',
];

/** Curated short labels keyed by doc id — CA parties vary by province; keep in sync with overlay `leader_party`. */
const CA_LEADER_PARTY_SHORT_BY_DOC = {
  'CA-AB': 'UCP',
  'CA-BC': 'NDP',
  'CA-MB': 'NDP',
  'CA-NB': 'Lib',
  'CA-NL': 'Lib',
  'CA-NS': 'PC',
  'CA-PE': 'PC',
  'CA-SK': 'Sask. Party',
  'CA-YT': 'Lib',
  'CA-ON': 'PC',
  'CA-QC': 'CAQ',
};

/** Curated short labels for UK nation rows in overlay (regions not listed). */
const UK_LEADER_PARTY_SHORT_BY_DOC = {
  'UK-NIR': 'SF',
  'UK-ENG': 'Labour',
  'UK-SCT': 'SNP',
  'UK-WLS': 'Labour',
};

function effectiveLeaderParty(patch, data) {
  const fromPatch = normalizeScalar(patch.leader_party);
  if (fromPatch !== undefined && fromPatch !== null && String(fromPatch).trim() !== '') {
    return fromPatch;
  }
  return normalizeScalar(data.leader_party);
}

function deriveUsLeaderPartyShort(partyStr) {
  if (partyStr === undefined || partyStr === null) return null;
  const p = String(partyStr).toLowerCase();
  if (p.includes('democratic')) return 'D';
  if (p.includes('republican')) return 'R';
  if (p.includes('independent')) return 'I';
  return null;
}

/** Conservative AU mappings only where party names are unambiguous in overlay. */
function deriveAuLeaderPartyShort(partyStr) {
  if (partyStr === undefined || partyStr === null) return null;
  const t = String(partyStr).trim();
  if (/australian labor party/i.test(t)) return 'ALP';
  if (/liberal national party/i.test(t)) return 'LNP';
  if (/country liberal party/i.test(t)) return 'CLP';
  if (/national party of australia/i.test(t)) return 'National';
  if (/^greens$/i.test(t) || /australian greens/i.test(t)) return 'Greens';
  if (/^liberal party$/i.test(t)) return 'Liberal';
  if (/liberal party of australia/i.test(t)) return 'Liberal';
  return null;
}

/**
 * @returns {({ value: string, provenance: string } | null)}
 */
function deriveLeaderPartyShort(docId, country, patch, data) {
  if (country === 'US') {
    const s = deriveUsLeaderPartyShort(effectiveLeaderParty(patch, data));
    if (s) return { value: s, provenance: 'derived_us_leader_party' };
    return null;
  }
  if (country === 'CA') {
    if (Object.prototype.hasOwnProperty.call(CA_LEADER_PARTY_SHORT_BY_DOC, docId)) {
      return { value: CA_LEADER_PARTY_SHORT_BY_DOC[docId], provenance: 'curated_ca_doc_map' };
    }
    return null;
  }
  if (country === 'AU') {
    const s = deriveAuLeaderPartyShort(effectiveLeaderParty(patch, data));
    if (s) return { value: s, provenance: 'derived_au_leader_party' };
    return null;
  }
  if (country === 'UK') {
    if (Object.prototype.hasOwnProperty.call(UK_LEADER_PARTY_SHORT_BY_DOC, docId)) {
      return { value: UK_LEADER_PARTY_SHORT_BY_DOC[docId], provenance: 'curated_uk_doc_map' };
    }
    return null;
  }
  return null;
}

/** U.S. Census FIPS (2-digit) → postal abbreviation. */
const FIPS_TO_ABBR = {
  '01': 'AL',
  '02': 'AK',
  '04': 'AZ',
  '05': 'AR',
  '06': 'CA',
  '08': 'CO',
  '09': 'CT',
  '10': 'DE',
  '11': 'DC',
  '12': 'FL',
  '13': 'GA',
  '15': 'HI',
  '16': 'ID',
  '17': 'IL',
  '18': 'IN',
  '19': 'IA',
  '20': 'KS',
  '21': 'KY',
  '22': 'LA',
  '23': 'ME',
  '24': 'MD',
  '25': 'MA',
  '26': 'MI',
  '27': 'MN',
  '28': 'MS',
  '29': 'MO',
  '30': 'MT',
  '31': 'NE',
  '32': 'NV',
  '33': 'NH',
  '34': 'NJ',
  '35': 'NM',
  '36': 'NY',
  '37': 'NC',
  '38': 'ND',
  '39': 'OH',
  '40': 'OK',
  '41': 'OR',
  '42': 'PA',
  '44': 'RI',
  '45': 'SC',
  '46': 'SD',
  '47': 'TN',
  '48': 'TX',
  '49': 'UT',
  '50': 'VT',
  '51': 'VA',
  '53': 'WA',
  '54': 'WV',
  '55': 'WI',
  '56': 'WY',
};

/**
 * PEP annual state population — verified HTTP 200 as of audit (see Census API dataset path).
 * Older code used `.../2023/pep/population` + `POP`; that path returns HTTP 404 (dataset not published at that URL).
 */
const CENSUS_URL_CANDIDATES = [
  'https://api.census.gov/data/2021/pep/population?get=NAME,POP_2021&for=state:*',
];

/** Resolve Census JSON population column (`POP` vs `POP_YYYY`). */
function findPopulationColumnIndex(headerUpper) {
  for (let i = 0; i < headerUpper.length; i++) {
    if (/^POP_\d{4}$/.test(headerUpper[i])) return i;
  }
  return headerUpper.indexOf('POP');
}

function docsFromLocalSeed() {
  const records = buildUsCanadaAustraliaUkSeed(new Date().toISOString());
  return records.map((r) => ({ id: r.id, data: { ...r } }));
}

function hasWriteFlag() {
  return process.argv.includes('--write');
}

function hasNoCensusFlag() {
  return process.argv.includes('--no-census');
}

function loadOverlay() {
  if (!fs.existsSync(OVERLAY_PATH)) {
    console.warn(`[enrich-3b] No overlay file at ${OVERLAY_PATH} — use empty object.`);
    return {};
  }
  try {
    const raw = fs.readFileSync(OVERLAY_PATH, 'utf8');
    const j = JSON.parse(raw);
    if (typeof j !== 'object' || j === null) return {};
    return j;
  } catch (e) {
    console.error(`[enrich-3b] Failed to parse overlay JSON: ${e.message}`);
    process.exit(1);
  }
}

function getJson(url, timeoutMs = 25000) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      { headers: { 'User-Agent': 'CivicVoiceEngine/Phase3B (enrichment; contact: admin)' } },
      (res) => {
        let data = '';
        res.on('data', (c) => {
          data += c;
        });
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 400) {
            reject(new Error(`HTTP ${res.statusCode}`));
            return;
          }
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      },
    );
    req.on('error', reject);
    req.setTimeout(timeoutMs, () => {
      req.destroy(new Error('timeout'));
    });
  });
}

function formatPopulationDisplay(n) {
  const x = Number(n);
  if (!Number.isFinite(x) || x < 0) return '';
  if (x >= 1_000_000) return `${(x / 1_000_000).toFixed(2)}M`;
  if (x >= 10_000) return `${Math.round(x / 1000)}K`;
  if (x >= 1_000) return `${(x / 1000).toFixed(1)}K`;
  return String(Math.round(x));
}

/**
 * @returns {Promise<Map<string, { population_raw: number, population_display: string, source: string }>>}
 *   keyed by doc id e.g. US-CA
 */
async function fetchUsCensusPopulationMap() {
  let lastErr;
  for (const url of CENSUS_URL_CANDIDATES) {
    try {
      const json = await getJson(url);
      if (!Array.isArray(json) || json.length < 2) {
        lastErr = new Error('unexpected JSON shape');
        continue;
      }
      const header = json[0].map((h) => String(h).toUpperCase());
      const popIdx = findPopulationColumnIndex(header);
      const stateIdx = header.indexOf('STATE');
      if (popIdx === -1 || stateIdx === -1) {
        lastErr = new Error('missing population or STATE column');
        continue;
      }
      const map = new Map();
      for (let i = 1; i < json.length; i++) {
        const row = json[i];
        const fips = String(row[stateIdx]).padStart(2, '0');
        const abbr = FIPS_TO_ABBR[fips];
        if (!abbr) continue;
        const pop = parseInt(String(row[popIdx]).replace(/,/g, ''), 10);
        if (!Number.isFinite(pop)) continue;
        const id = `US-${abbr}`;
        map.set(id, {
          population_raw: pop,
          population_display: formatPopulationDisplay(pop),
          source: `U.S. Census Bureau API (${url.split('/data/')[1]?.split('?')[0] || 'pep'})`,
        });
      }
      if (map.size >= 51) return map;
      lastErr = new Error(`only ${map.size} states mapped`);
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error('Census fetch failed');
}

function normalizeScalar(v) {
  if (v === undefined) return undefined;
  if (v === null) return null;
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  const s = String(v).trim();
  return s === '' ? null : s;
}

function valuesEqual(a, b) {
  if (a === b) return true;
  if (a == null && b == null) return true;
  if (a == null || b == null) return false;
  if (typeof a === 'number' && typeof b === 'number') return a === b;
  return String(a) === String(b);
}

/**
 * Build proposed patch for one document (only Phase 3B keys).
 */
function buildProposedPatch(docId, data, overlayRow, censusRow, opts) {
  const { useCensus, country } = opts;
  const patch = {};
  const prov = {};

  const ov = overlayRow && typeof overlayRow === 'object' ? overlayRow : {};

  for (const f of PHASE3B_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(ov, f)) {
      const v = normalizeScalar(ov[f]);
      if (v !== undefined && v !== null) {
        patch[f] = v;
        prov[f] = 'overlay';
      }
    }
  }

  if (
    Object.prototype.hasOwnProperty.call(ov, 'population_raw') &&
    !Object.prototype.hasOwnProperty.call(patch, 'population_display')
  ) {
    const pr = normalizeScalar(ov.population_raw);
    if (typeof pr === 'number' && Number.isFinite(pr)) {
      patch.population_display = formatPopulationDisplay(pr);
      prov.population_display = prov.population_display || 'derived_from_overlay_population_raw';
    }
  }

  if (country === 'US' && useCensus && censusRow) {
    if (!Object.prototype.hasOwnProperty.call(ov, 'population_raw')) {
      patch.population_raw = censusRow.population_raw;
      patch.population_display = censusRow.population_display;
      prov.population_raw = 'census_api';
      prov.population_display = 'census_api';
    } else {
      prov.population_raw = prov.population_raw || 'overlay_overrides_census';
      prov.population_display = prov.population_display || 'overlay_overrides_census';
    }
  }

  if (!Object.prototype.hasOwnProperty.call(patch, 'leader_party_short')) {
    const derived = deriveLeaderPartyShort(docId, country, patch, data);
    if (derived) {
      patch.leader_party_short = derived.value;
      prov.leader_party_short = derived.provenance;
    }
  }

  return { patch, prov };
}

function classifyField(field, existingVal, proposedVal, country, ctx) {
  const {
    censusHasRow,
    overlayHasField,
    censusFailed,
    censusDisabled,
    docId,
    patch,
    leaderPartyExisting,
  } = ctx;

  const hasProposed =
    proposedVal !== undefined &&
    proposedVal !== null &&
    !(typeof proposedVal === 'string' && proposedVal.trim() === '');

  if (hasProposed) {
    if (valuesEqual(existingVal, proposedVal)) return { status: 'unchanged', detail: 'already matches' };
    return { status: 'would_write', detail: 'new or different value' };
  }

  if (field === 'leader_party_short') {
    if (overlayHasField) {
      return { status: 'skipped', detail: 'overlay key present but no usable value' };
    }
    const effParty = effectiveLeaderParty(patch || {}, { leader_party: leaderPartyExisting });
    if (!effParty) {
      if (docId === 'CA-NT' || docId === 'CA-NU') {
        return { status: 'skipped', detail: 'consensus government; no partisan leader_party' };
      }
      if (country === 'UK' && !Object.prototype.hasOwnProperty.call(UK_LEADER_PARTY_SHORT_BY_DOC, docId)) {
        return { status: 'skipped', detail: 'no overlay leader_party — short omitted (optional for this doc)' };
      }
      return { status: 'needs_manual_review', detail: 'leader_party missing; cannot derive short' };
    }
    if (country === 'US') {
      return {
        status: 'needs_manual_review',
        detail: 'US leader_party not mapped to D/R/I — adjust overlay or add leader_party_short',
      };
    }
    if (country === 'CA') {
      return {
        status: 'needs_manual_review',
        detail: 'CA doc not in curated short map; add leader_party_short to overlay when confident',
      };
    }
    if (country === 'AU') {
      return {
        status: 'needs_manual_review',
        detail: 'AU leader_party did not match safe short-label patterns',
      };
    }
    if (country === 'UK') {
      return {
        status: 'needs_manual_review',
        detail: 'UK doc not in curated short map; add leader_party_short to overlay when confident',
      };
    }
    return { status: 'needs_manual_review', detail: 'no leader_party_short rule for country' };
  }

  if (field === 'population_raw' || field === 'population_display') {
    if (overlayHasField) return { status: 'skipped', detail: 'overlay key present but no usable value' };
    if (country === 'US' && censusHasRow) {
      return { status: 'needs_manual_review', detail: 'Census should have produced a value (unexpected gap)' };
    }
    if (country === 'US' && (censusFailed || censusDisabled)) {
      return {
        status: 'needs_manual_review',
        detail: censusDisabled
          ? 'Census disabled; add overlay or omit --no-census'
          : 'Census fetch failed; add overlay for population',
      };
    }
    if (country === 'US') {
      return { status: 'needs_manual_review', detail: 'no Census row and no overlay' };
    }
    return { status: 'needs_manual_review', detail: 'non-US population not automated in Phase 3B — add overlay' };
  }

  if (!overlayHasField) {
    return { status: 'needs_manual_review', detail: 'not automated; add to overlay or future connector' };
  }

  return { status: 'skipped', detail: 'overlay key present but value empty' };
}

async function main() {
  tryLoadDotenv();
  sanitizeGoogleApplicationCredentialsEnv();
  const phMsg = formatPlaceholderCredentialMessage();
  if (phMsg) {
    console.warn(`[enrich-3b] ${phMsg}\n`);
  }

  const writeMode = hasWriteFlag();
  if (writeMode) {
    assertFirebaseCredentialsForWrite('enrich-3b');
  }

  const useCensus = !hasNoCensusFlag();

  console.log('[enrich-3b] Phase 3B enrichment — Civic Voice');
  console.log(`[enrich-3b] Mode: ${writeMode ? 'WRITE (merge)' : 'DRY-RUN (no Firestore writes)'}`);
  console.log(`[enrich-3b] US Census population fetch: ${useCensus ? 'enabled' : 'disabled'}`);

  const overlayRoot = loadOverlay();
  /** Strip meta keys */
  const overlay = {};
  for (const [k, v] of Object.entries(overlayRoot)) {
    if (k.startsWith('_')) continue;
    overlay[k] = v;
  }

  let censusMap = null;
  let censusError = null;
  if (useCensus) {
    try {
      censusMap = await fetchUsCensusPopulationMap();
      console.log(`[enrich-3b] Census: loaded population for ${censusMap.size} US jurisdictions.`);
    } catch (e) {
      censusError = e;
      console.warn(`[enrich-3b] Census fetch failed: ${e.message}`);
    }
  }

  const db = tryGetFirestore();
  console.log(`[enrich-3b] Credential hint: ${describeCredentialSource()}`);

  if (writeMode && !db) {
    console.error(
      '[enrich-3b] Firebase Admin failed to initialize after credential checks. See [firebase-admin-init] errors above.',
    );
    process.exit(1);
  }

  let docs = [];
  let firestoreSkipped = false;
  /** @type {'no_admin' | 'read_failed' | null} */
  let firestoreSkipReason = null;
  let firestoreReadErrorMessage = null;

  if (!db) {
    docs = docsFromLocalSeed();
    firestoreSkipped = true;
    firestoreSkipReason = 'no_admin';
    console.warn(
      '\n[enrich-3b] Firestore read/compare skipped because Admin credentials are not configured.\n' +
        '[enrich-3b] Using local curated seed as the document baseline (same catalog as seed-subnational-jurisdictions.cjs). Census and overlay still apply.\n',
    );
  } else {
    try {
      const snap = await db.collection(COLLECTION).get();
      snap.forEach((d) => docs.push({ id: d.id, data: d.data() || {} }));

      const EXPECTED_DOCS = 85;
      if (docs.length !== EXPECTED_DOCS) {
        console.warn(
          `[enrich-3b] Expected ${EXPECTED_DOCS} documents, found ${docs.length} — re-run seed or investigate before writes.`,
        );
      }
    } catch (e) {
      const msg = e && e.message ? String(e.message) : String(e);
      if (writeMode) {
        console.error(`[enrich-3b] Firestore read failed: ${msg}`);
        process.exit(1);
      }
      firestoreReadErrorMessage = msg;
      docs = docsFromLocalSeed();
      firestoreSkipped = true;
      firestoreSkipReason = 'read_failed';
      console.warn(
        `\n[enrich-3b] Firestore read failed (${msg}). Dry-run continues using local curated seed as the document baseline.\n`,
      );
    }
  }

  console.log('');
  const perDoc = [];
  const agg = {
    would_write_fields: 0,
    leader_party_short_would_write: 0,
    unchanged_fields: 0,
    needs_manual_review_fields: 0,
    skipped_fields: 0,
    docs_with_writes: 0,
  };

  const patchesToApply = [];

  for (const { id, data } of docs) {
    const country = data.country || '';
    const overlayRow = overlay[id];
    const censusRow = country === 'US' ? censusMap?.get(id) : null;

    const { patch, prov } = buildProposedPatch(id, data, overlayRow, censusRow, {
      useCensus: useCensus && !!censusMap,
      country,
    });

    const fieldRows = [];
    let docWouldWrite = false;

    for (const field of PHASE3B_FIELDS) {
      const proposed = patch[field];
      const existing = data[field];
      const overlayHasField =
        !!(
          overlayRow &&
          typeof overlayRow === 'object' &&
          Object.prototype.hasOwnProperty.call(overlayRow, field)
        );
      const censusHasRow = country === 'US' && !!censusMap?.has(id);

      const cl = classifyField(field, existing, proposed, country, {
        censusHasRow,
        overlayHasField,
        censusFailed: !!censusError,
        censusDisabled: !useCensus,
        docId: id,
        patch,
        leaderPartyExisting: data.leader_party,
      });

      if (cl.status === 'would_write') {
        agg.would_write_fields++;
        if (field === 'leader_party_short') agg.leader_party_short_would_write++;
        docWouldWrite = true;
      } else if (cl.status === 'unchanged') agg.unchanged_fields++;
      else if (cl.status === 'needs_manual_review') agg.needs_manual_review_fields++;
      else agg.skipped_fields++;

      fieldRows.push({
        field,
        status: cl.status,
        detail: cl.detail,
        provenance: prov[field] || '',
        existing: existing === undefined ? '(missing)' : JSON.stringify(existing),
        proposed: proposed === undefined ? '' : JSON.stringify(proposed),
      });
    }

    if (docWouldWrite) agg.docs_with_writes++;

    const flatPatch = {};
    for (const f of PHASE3B_FIELDS) {
      if (patch[f] !== undefined && !valuesEqual(data[f], patch[f])) flatPatch[f] = patch[f];
    }

    patchesToApply.push({ id, flatPatch, fieldRows });
    perDoc.push({ id, country, name: data.name || '', fieldRows, flatPatch });
  }

  if (writeMode) {
    let batch = db.batch();
    let ops = 0;
    let docWriteCount = 0;
    for (const { id, flatPatch } of patchesToApply) {
      if (Object.keys(flatPatch).length === 0) continue;
      const ref = db.collection(COLLECTION).doc(id);
      batch.set(ref, flatPatch, { merge: true });
      ops++;
      docWriteCount++;
      if (ops >= 450) {
        await batch.commit();
        batch = db.batch();
        ops = 0;
      }
    }
    if (ops > 0) await batch.commit();
    console.log(
      `[enrich-3b] Wrote merge patches to ${docWriteCount} document(s) (merge-only, no deletes).`,
    );
  } else {
    console.log('[enrich-3b] Dry-run: no writes performed.');
  }

  const iso = new Date().toISOString();
  const md = buildMarkdownReport({
    iso,
    writeMode,
    useCensus,
    censusError,
    censusCount: censusMap?.size ?? 0,
    describeCredentialSource: describeCredentialSource(),
    docCount: docs.length,
    agg,
    perDoc,
    patchesToApply,
    firestoreSkipped,
    firestoreSkipReason,
    firestoreReadErrorMessage,
  });

  fs.writeFileSync(REPORT_PATH, md, 'utf8');
  console.log(`\n[enrich-3b] Report written: ${REPORT_PATH}`);

  console.log('\n=== Summary ===');
  console.log(`Documents processed: ${docs.length}${firestoreSkipped ? ' (local seed baseline)' : ''}`);
  console.log(`Field outcomes — would_write: ${agg.would_write_fields}, unchanged: ${agg.unchanged_fields}, needs_manual_review: ${agg.needs_manual_review_fields}, skipped: ${agg.skipped_fields}`);
  console.log(`leader_party_short — fields that would_write: ${agg.leader_party_short_would_write}`);
  console.log(`Documents with at least one would_write field: ${agg.docs_with_writes}`);
  if (firestoreSkipped) {
    console.log(
      '\n[enrich-3b] Note: merge preview used local seed data, not live Firestore. Re-run with valid Admin credentials to diff against the database.',
    );
  }
}

function buildMarkdownReport(ctx) {
  const {
    iso,
    writeMode,
    useCensus,
    censusError,
    censusCount,
    describeCredentialSource,
    docCount,
    agg,
    perDoc,
    patchesToApply,
    firestoreSkipped,
    firestoreSkipReason,
    firestoreReadErrorMessage,
  } = ctx;

  let firestoreSummary =
    '**Firestore:** live documents read for comparison.';
  if (firestoreSkipped) {
    if (firestoreSkipReason === 'read_failed' && firestoreReadErrorMessage) {
      firestoreSummary =
        `**Firestore:** Firestore read/compare skipped — Firestore read failed (\`${String(firestoreReadErrorMessage)}\`). Dry-run compares Phase 3B proposals against **local curated seed** documents (same catalog as \`seed-subnational-jurisdictions.cjs\`) plus Census and overlay.`;
    } else {
      firestoreSummary =
        '**Firestore:** Firestore read/compare skipped because Admin credentials are not configured. Dry-run compares Phase 3B proposals against **local curated seed** documents (same catalog as `seed-subnational-jurisdictions.cjs`) plus Census and overlay.';
    }
  }

  const lines = [
    '# subnational_jurisdictions — Phase 3B enrichment report',
    '',
    `Generated: ${iso}`,
    `Mode: **${writeMode ? 'WRITE (merge-only)' : 'DRY-RUN'}**`,
    firestoreSummary,
    `US Census fetch: ${useCensus ? 'enabled' : 'disabled'}${censusError ? ` — **failed:** ${String(censusError.message)}` : ''}`,
    `Census jurisdictions mapped: ${censusCount}`,
    `Firestore credential hint: ${describeCredentialSource}`,
    '',
    '## Aggregate field outcomes',
    '',
    '| Metric | Count |',
    '|--------|-------|',
    `| Fields that would update / updated | ${agg.would_write_fields} |`,
    `| … of which \`leader_party_short\` | ${agg.leader_party_short_would_write ?? 0} |`,
    `| Fields unchanged (already equal) | ${agg.unchanged_fields} |`,
    `| Fields needs_manual_review | ${agg.needs_manual_review_fields} |`,
    `| Fields skipped (other) | ${agg.skipped_fields} |`,
    `| Documents with ≥1 write | ${agg.docs_with_writes} |`,
    `| Total documents read | ${docCount} (expected 85) |`,
    '',
    '## Dry-run merge preview (flat patches)',
    '',
    firestoreSkipped
      ? 'Keys that **would be merged** vs **local seed baseline** (live Firestore **not** compared).'
      : 'Only keys that differ from current Firestore values. Empty table if nothing to change.',
    '',
    '| Doc ID | Keys to merge |',
    '|--------|----------------|',
  ];

  let previewRows = 0;
  for (const { id, flatPatch } of patchesToApply) {
    const keys = Object.keys(flatPatch);
    if (keys.length === 0) continue;
    previewRows++;
    lines.push(`| \`${id}\` | ${keys.join(', ')} |`);
  }
  if (previewRows === 0) lines.push('| *(none)* | |');

  lines.push('', '## Per-document field status', '', '*Statuses:* `would_write` · `unchanged` · `needs_manual_review` · `skipped`', '');

  for (const row of perDoc) {
    lines.push(`### \`${row.id}\` (${row.country}) ${row.name}`, '');
    lines.push('| Field | Status | Detail | Source | Current | Proposed |');
    lines.push('|-------|--------|--------|--------|---------|----------|');
    for (const fr of row.fieldRows) {
      lines.push(
        `| ${fr.field} | ${fr.status} | ${fr.detail} | ${fr.provenance || '—'} | ${truncate(fr.existing, 40)} | ${truncate(fr.proposed, 40)} |`,
      );
    }
    lines.push('');
  }

  lines.push(
    '## Rules',
    '',
    '- Merge-only `set(..., { merge: true })`; no document deletes.',
    '- Only Phase 3B fields are considered; other keys preserved.',
    '- Leadership and non-US population are **not** invented; use `engine/data/subnational-phase3b-overlay.json` for curated official values.',
    '- `leader_party_short` is optional: filled from overlay, else US D/R/I derivation, CA/UK curated doc maps, AU conservative patterns — omit when not confident.',
    '- Review **needs_manual_review** before relying on data in the app.',
    '',
  );

  return lines.join('\n');
}

function truncate(s, n) {
  const t = String(s);
  if (t.length <= n) return t;
  return `${t.slice(0, n)}…`;
}

main().catch((err) => {
  console.error('[enrich-3b] Fatal:', err);
  process.exit(1);
});
