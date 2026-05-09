/**
 * Seed / sync Firestore `subnational_jurisdictions` from curated static canonical data.
 *
 * Default: DRY-RUN ONLY — no Firestore reads unless credentials set for comparison;
 *           no writes unless `--write`.
 *
 *   npm run seed:subnational-jurisdictions
 *   npm run seed:subnational-jurisdictions -- --write
 *
 * Firebase auth (same options as civic-voice-engine scheduler):
 *   - GOOGLE_APPLICATION_CREDENTIALS, or
 *   - FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY in .env
 *
 * Run from `civic-voice-engine` so scheduler `.env` loads:
 *   npm run seed:subnational-jurisdictions -- --write
 */

const { tryLoadDotenv, tryGetFirestore, describeCredentialSource } = require('./firebase-admin-init.cjs');

const PROJECT_ID = 'civic-voice-5ea94';
const COLLECTION = 'subnational_jurisdictions';

const SOURCE_NAME = 'Civic Voice curated static seed v1';
const SOURCE_URL = 'civic-voice-app/docs/SUBNATIONAL_FIRESTORE_MIGRATION.md';
const DATA_STATUS_SEED = 'seed_static';

const REQUIRED_FIELDS = [
  'id',
  'country',
  'countryName',
  'jurisdictionType',
  'name',
  'abbreviation',
  'slug',
  'aliases',
  'capital',
  'leaderTitle',
  'legislatureName',
  'officialWebsite',
  'source_name',
  'source_url',
  'last_updated',
  'dataStatus',
];

const JTYPE = {
  STATE: 'state',
  FEDERAL_DISTRICT: 'federal_district',
  PROVINCE: 'province',
  TERRITORY_CA: 'territory',
  NATION: 'nation',
  REGION: 'region',
  STATE_AU: 'state',
  TERRITORY_AU: 'territory',
};

function slugify(name) {
  return String(name)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function buildPayload(base, lastUpdatedIso) {
  return {
    ...base,
    last_updated: lastUpdatedIso,
    source_name: SOURCE_NAME,
    source_url: SOURCE_URL,
    dataStatus: DATA_STATUS_SEED,
  };
}

function buildUsCanadaAustraliaUkSeed(nowIso) {
  /** @type {object[]} */
  const rows = [];

  const US_STATES = [
    ['AL', 'Alabama', 'Montgomery', JTYPE.STATE],
    ['AK', 'Alaska', 'Juneau', JTYPE.STATE],
    ['AZ', 'Arizona', 'Phoenix', JTYPE.STATE],
    ['AR', 'Arkansas', 'Little Rock', JTYPE.STATE],
    ['CA', 'California', 'Sacramento', JTYPE.STATE],
    ['CO', 'Colorado', 'Denver', JTYPE.STATE],
    ['CT', 'Connecticut', 'Hartford', JTYPE.STATE],
    ['DE', 'Delaware', 'Dover', JTYPE.STATE],
    ['FL', 'Florida', 'Tallahassee', JTYPE.STATE],
    ['GA', 'Georgia', 'Atlanta', JTYPE.STATE],
    ['HI', 'Hawaii', 'Honolulu', JTYPE.STATE],
    ['ID', 'Idaho', 'Boise', JTYPE.STATE],
    ['IL', 'Illinois', 'Springfield', JTYPE.STATE],
    ['IN', 'Indiana', 'Indianapolis', JTYPE.STATE],
    ['IA', 'Iowa', 'Des Moines', JTYPE.STATE],
    ['KS', 'Kansas', 'Topeka', JTYPE.STATE],
    ['KY', 'Kentucky', 'Frankfort', JTYPE.STATE],
    ['LA', 'Louisiana', 'Baton Rouge', JTYPE.STATE],
    ['ME', 'Maine', 'Augusta', JTYPE.STATE],
    ['MD', 'Maryland', 'Annapolis', JTYPE.STATE],
    ['MA', 'Massachusetts', 'Boston', JTYPE.STATE],
    ['MI', 'Michigan', 'Lansing', JTYPE.STATE],
    ['MN', 'Minnesota', 'Saint Paul', JTYPE.STATE],
    ['MS', 'Mississippi', 'Jackson', JTYPE.STATE],
    ['MO', 'Missouri', 'Jefferson City', JTYPE.STATE],
    ['MT', 'Montana', 'Helena', JTYPE.STATE],
    ['NE', 'Nebraska', 'Lincoln', JTYPE.STATE],
    ['NV', 'Nevada', 'Carson City', JTYPE.STATE],
    ['NH', 'New Hampshire', 'Concord', JTYPE.STATE],
    ['NJ', 'New Jersey', 'Trenton', JTYPE.STATE],
    ['NM', 'New Mexico', 'Santa Fe', JTYPE.STATE],
    ['NY', 'New York', 'Albany', JTYPE.STATE],
    ['NC', 'North Carolina', 'Raleigh', JTYPE.STATE],
    ['ND', 'North Dakota', 'Bismarck', JTYPE.STATE],
    ['OH', 'Ohio', 'Columbus', JTYPE.STATE],
    ['OK', 'Oklahoma', 'Oklahoma City', JTYPE.STATE],
    ['OR', 'Oregon', 'Salem', JTYPE.STATE],
    ['PA', 'Pennsylvania', 'Harrisburg', JTYPE.STATE],
    ['RI', 'Rhode Island', 'Providence', JTYPE.STATE],
    ['SC', 'South Carolina', 'Columbia', JTYPE.STATE],
    ['SD', 'South Dakota', 'Pierre', JTYPE.STATE],
    ['TN', 'Tennessee', 'Nashville', JTYPE.STATE],
    ['TX', 'Texas', 'Austin', JTYPE.STATE],
    ['UT', 'Utah', 'Salt Lake City', JTYPE.STATE],
    ['VT', 'Vermont', 'Montpelier', JTYPE.STATE],
    ['VA', 'Virginia', 'Richmond', JTYPE.STATE],
    ['WA', 'Washington', 'Olympia', JTYPE.STATE],
    ['WV', 'West Virginia', 'Charleston', JTYPE.STATE],
    ['WI', 'Wisconsin', 'Madison', JTYPE.STATE],
    ['WY', 'Wyoming', 'Cheyenne', JTYPE.STATE],
    ['DC', 'District of Columbia', 'Washington', JTYPE.FEDERAL_DISTRICT],
  ];

  for (const [abbr, name, capital, jt] of US_STATES) {
    const id = `US-${abbr}`;
    const aliases =
      abbr === 'DC'
        ? ['Washington D.C.', 'Washington DC', 'Washington']
        : [];
    rows.push(
      buildPayload(
        {
          id,
          country: 'US',
          countryName: 'United States',
          jurisdictionType: jt,
          name,
          abbreviation: abbr,
          slug: slugify(name),
          aliases,
          capital,
          leaderTitle: jt === JTYPE.FEDERAL_DISTRICT ? 'Mayor' : 'Governor',
          legislatureName: `${name} Legislature`,
          officialWebsite: null,
        },
        nowIso,
      ),
    );
  }

  const CA_ROWS = [
    ['AB', 'Alberta', 'Edmonton', JTYPE.PROVINCE],
    ['BC', 'British Columbia', 'Victoria', JTYPE.PROVINCE],
    ['MB', 'Manitoba', 'Winnipeg', JTYPE.PROVINCE],
    ['NB', 'New Brunswick', 'Fredericton', JTYPE.PROVINCE],
    ['NL', 'Newfoundland and Labrador', "St. John's", JTYPE.PROVINCE],
    ['NS', 'Nova Scotia', 'Halifax', JTYPE.PROVINCE],
    ['NT', 'Northwest Territories', 'Yellowknife', JTYPE.TERRITORY_CA],
    ['NU', 'Nunavut', 'Iqaluit', JTYPE.TERRITORY_CA],
    ['ON', 'Ontario', 'Toronto', JTYPE.PROVINCE],
    ['PE', 'Prince Edward Island', 'Charlottetown', JTYPE.PROVINCE],
    ['QC', 'Quebec', 'Quebec City', JTYPE.PROVINCE],
    ['SK', 'Saskatchewan', 'Regina', JTYPE.PROVINCE],
    ['YT', 'Yukon', 'Whitehorse', JTYPE.TERRITORY_CA],
  ];

  for (const [abbr, name, capital, jt] of CA_ROWS) {
    const id = `CA-${abbr}`;
    const aliases =
      abbr === 'NL'
        ? ['Newfoundland & Labrador', 'NL']
        : abbr === 'QC'
          ? ['Québec']
          : [];
    rows.push(
      buildPayload(
        {
          id,
          country: 'CA',
          countryName: 'Canada',
          jurisdictionType: jt,
          name,
          abbreviation: abbr,
          slug: slugify(name),
          aliases,
          capital,
          leaderTitle: jt === JTYPE.TERRITORY_CA ? 'Premier' : 'Premier',
          legislatureName: `${name} Legislative Assembly`,
          officialWebsite: null,
        },
        nowIso,
      ),
    );
  }

  const AU_ROWS = [
    ['NSW', 'New South Wales', 'Sydney', JTYPE.STATE_AU],
    ['VIC', 'Victoria', 'Melbourne', JTYPE.STATE_AU],
    ['QLD', 'Queensland', 'Brisbane', JTYPE.STATE_AU],
    ['WA', 'Western Australia', 'Perth', JTYPE.STATE_AU],
    ['SA', 'South Australia', 'Adelaide', JTYPE.STATE_AU],
    ['TAS', 'Tasmania', 'Hobart', JTYPE.STATE_AU],
    ['ACT', 'Australian Capital Territory', 'Canberra', JTYPE.TERRITORY_AU],
    ['NT', 'Northern Territory', 'Darwin', JTYPE.TERRITORY_AU],
  ];

  for (const [abbr, name, capital, jt] of AU_ROWS) {
    const id = `AU-${abbr}`;
    rows.push(
      buildPayload(
        {
          id,
          country: 'AU',
          countryName: 'Australia',
          jurisdictionType: jt,
          name,
          abbreviation: abbr,
          slug: slugify(name),
          aliases: [],
          capital,
          leaderTitle: jt === JTYPE.TERRITORY_AU ? 'Chief Minister' : 'Premier',
          legislatureName: `${name} Parliament`,
          officialWebsite: null,
        },
        nowIso,
      ),
    );
  }

  const UK_NATIONS = [
    ['SCT', 'Scotland', 'Edinburgh', 'First Minister', 'Scottish Parliament'],
    ['WLS', 'Wales', 'Cardiff', 'First Minister', 'Senedd'],
    ['NIR', 'Northern Ireland', 'Belfast', 'First Minister', 'Northern Ireland Assembly'],
    ['ENG', 'England', 'London', null, 'UK Parliament (Westminster)'],
  ];

  for (const [abbr, name, capital, leaderTitle, legislatureName] of UK_NATIONS) {
    const id = `UK-${abbr}`;
    rows.push(
      buildPayload(
        {
          id,
          country: 'UK',
          countryName: 'United Kingdom',
          jurisdictionType: JTYPE.NATION,
          name,
          abbreviation: abbr,
          slug: slugify(name),
          aliases: [],
          capital,
          leaderTitle,
          legislatureName,
          officialWebsite: null,
        },
        nowIso,
      ),
    );
  }

  const UK_ENG_REGIONS = [
    ['NE', 'North East England', 'Newcastle upon Tyne'],
    ['NW', 'North West England', 'Manchester'],
    ['YOR', 'Yorkshire and the Humber', 'Leeds'],
    ['EM', 'East Midlands', 'Nottingham'],
    ['WM', 'West Midlands', 'Birmingham'],
    ['EE', 'East of England', 'Cambridge'],
    ['LON', 'London', 'London'],
    ['SE', 'South East England', 'Guildford'],
    ['SW', 'South West England', 'Bristol'],
  ];

  const taxAliases = {
    YOR: ['Yorkshire and The Humber'],
    EE: ['East of England'],
  };

  for (const [abbr, name, capital] of UK_ENG_REGIONS) {
    const id = `UK-ENG-${abbr}`;
    rows.push(
      buildPayload(
        {
          id,
          country: 'UK',
          countryName: 'United Kingdom',
          jurisdictionType: JTYPE.REGION,
          name,
          abbreviation: abbr,
          slug: slugify(name),
          aliases: taxAliases[abbr] ? [...taxAliases[abbr]] : [],
          capital,
          leaderTitle: 'Regional leadership varies',
          legislatureName: 'Local / combined authorities',
          officialWebsite: null,
        },
        nowIso,
      ),
    );
  }

  return rows;
}

function validateRecords(records) {
  const missingById = [];
  const idCounts = new Map();

  for (const rec of records) {
    idCounts.set(rec.id, (idCounts.get(rec.id) || 0) + 1);
    for (const field of REQUIRED_FIELDS) {
      const v = rec[field];
      const missing =
        v === undefined ||
        (field === 'aliases' && (!Array.isArray(v) || v.length === undefined));
      if (missing) {
        missingById.push({ id: rec.id || '(no id)', field });
      }
    }
  }

  const duplicateIds = [...idCounts.entries()].filter(([, n]) => n > 1).map(([id]) => id);

  return { missingById, duplicateIds };
}

function countryBreakdown(records) {
  const m = new Map();
  for (const r of records) {
    const c = r.country || '(unknown)';
    m.set(c, (m.get(c) || 0) + 1);
  }
  return Object.fromEntries([...m.entries()].sort((a, b) => a[0].localeCompare(b[0])));
}

async function estimateCreatesUpdates(db, records) {
  const refs = records.map((r) => db.collection(COLLECTION).doc(r.id));
  const snaps = await db.getAll(...refs);
  let existing = 0;
  for (const s of snaps) {
    if (s.exists) existing += 1;
  }
  const creates = records.length - existing;
  const updates = existing;
  return { creates, updates, existing };
}

async function writeMerge(db, records) {
  let batch = db.batch();
  let ops = 0;
  for (const rec of records) {
    const ref = db.collection(COLLECTION).doc(rec.id);
    batch.set(ref, rec, { merge: true });
    ops += 1;
    if (ops >= 450) {
      await batch.commit();
      batch = db.batch();
      ops = 0;
    }
  }
  if (ops > 0) await batch.commit();
}

async function main() {
  const writeMode = process.argv.includes('--write');
  const nowIso = new Date().toISOString();

  tryLoadDotenv();

  console.log('[seed] subnational_jurisdictions — Civic Voice');
  console.log(`[seed] Mode: ${writeMode ? 'WRITE (merge)' : 'DRY-RUN (no writes)'}`);
  console.log(`[seed] Project: ${PROJECT_ID}`);
  console.log(`[seed] Collection: ${COLLECTION}`);
  console.log(`[seed] Credential hint: ${describeCredentialSource()}\n`);

  const records = buildUsCanadaAustraliaUkSeed(nowIso);
  const { missingById, duplicateIds } = validateRecords(records);

  console.log('=== Seed summary ===');
  console.log(`Total records: ${records.length}`);
  console.log('Country breakdown:', JSON.stringify(countryBreakdown(records), null, 2));

  console.log('\n=== Validation ===');
  if (duplicateIds.length) {
    console.log('Duplicate IDs:', duplicateIds.join(', ') || '(none)');
  } else {
    console.log('Duplicate IDs: (none)');
  }

  if (missingById.length) {
    console.log(`Missing required fields (${missingById.length} issues):`);
    missingById.slice(0, 40).forEach(({ id, field }) => console.log(`  - ${id}: missing or invalid ${field}`));
    if (missingById.length > 40) console.log(`  … ${missingById.length - 40} more`);
    process.exitCode = 1;
  } else {
    console.log('Missing required fields: (none)');
  }

  console.log('\n=== Sample records (5) ===');
  records.slice(0, 5).forEach((r, i) => {
    console.log(`--- [${i + 1}] ${r.id} ---`);
    console.log(JSON.stringify(r, null, 2));
  });

  let creates = records.length;
  let updates = 0;

  const db = tryGetFirestore();

  if (db) {
    const est = await estimateCreatesUpdates(db, records);
    creates = est.creates;
    updates = est.updates;
    console.log('\n=== Create / update estimate (Firestore read) ===');
    console.log(`Would create: ${creates}`);
    console.log(`Would update (merge): ${updates}`);
  } else {
    console.log('\n=== Create / update estimate ===');
    console.log(
      'Skipped (no credentials). Use civic-voice-engine/.env (scheduler-style FIREBASE_* vars or GOOGLE_APPLICATION_CREDENTIALS), or run from engine:',
    );
    console.log('  cd civic-voice-engine && npm run seed:subnational-jurisdictions');
    console.log(`Assuming all ${records.length} records would be new without server comparison.`);
  }

  if (writeMode) {
    if (!db) {
      console.error(
        '[seed] --write requires Firebase credentials (same as scheduler). Example: cd civic-voice-engine && npm run seed:subnational-jurisdictions -- --write',
      );
      process.exit(1);
    }
    console.log('\n[seed] Writing merge commits…');
    await writeMerge(db, records);
    console.log('[seed] Done (merge writes only; no deletes).');
  } else {
    console.log('\n[seed] DRY-RUN complete — no writes performed.');
  }
}

main().catch((err) => {
  console.error('[seed] Fatal:', err);
  process.exit(1);
});
