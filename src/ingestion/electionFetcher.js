/**
 * Election Fetcher
 *
 * Tracks upcoming elections, current polling, recent results, and key
 * battleground seats for Canada, USA, United Kingdom, and Australia.
 *
 * Data sources
 * ────────────
 *   UK   — Democracy Club API  (candidates.democracyclub.org.uk/api/v0.9)
 *   US   — FEC API             (api.open.fec.gov/v1)
 *   All  — NewsAPI / GNews for live polling headlines
 *   All  — Seed JSON in output/elections/<COUNTRY>.json (static baseline)
 *   All  — Claude Haiku for prediction, key issues, plain-language briefing
 *
 * Claude output per country
 * ─────────────────────────
 *   outcomePrediction   — who is likely to win (or lead) with context
 *   confidencePct       — 0–100
 *   keyIssues           — string[] of top 3-5 drivers
 *   electionBriefing    — 2-3 sentence plain-language summary
 *
 * Firestore collection: "elections"
 *   docType: 'upcomingElection' | 'pollingSnapshot' | 'electionResult'
 *           | 'battleground'    | 'countryBriefing'
 *
 * Scheduling
 * ──────────
 *   isElectionPeriod(country) → boolean  — true if any election ≤ 30 days away
 *   runElectionFetcher(countries)         — main entry point
 *
 * Env vars required
 * ─────────────────
 *   REACT_APP_ANTHROPIC_API_KEY
 *   REACT_APP_NEWS_API_KEY      (optional — degrades gracefully)
 *   REACT_APP_GNEWS_API_KEY     (optional)
 *   REACT_APP_FEC_API_KEY       (optional — FEC allows anonymous with lower limits)
 */

import { db } from '../firebase.js';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';

// ─── Config ───────────────────────────────────────────────────────────────────

const ANTHROPIC_KEY  = process.env.REACT_APP_ANTHROPIC_API_KEY;
const NEWS_API_KEY   = process.env.REACT_APP_NEWS_API_KEY;
const GNEWS_API_KEY  = process.env.REACT_APP_GNEWS_API_KEY;
const FEC_API_KEY    = process.env.REACT_APP_FEC_API_KEY || 'DEMO_KEY';

const ELECTION_PERIOD_DAYS = 30;  // days before election date = "election period"
const CLAUDE_DELAY_MS      = 250;
const NEWS_DELAY_MS        = 300;
const MAX_POLLING_ARTICLES = 5;

// ─── Known upcoming elections (as of March 2026) ─────────────────────────────

const UPCOMING_ELECTIONS = {
  CA: [
    {
      id: 'ca_federal_next',
      country: 'CA',
      type: 'federal',
      name: 'Next Canadian Federal Election',
      expectedDate: '2029-10-01',
      status: 'expected',
      description: 'Next scheduled federal election; minority parliament may trigger earlier vote.',
      houseSeats: 343,
      seatsForMajority: 172,
      currentGovParty: 'Liberal',
      currentGovLeader: 'Mark Carney',
    },
    {
      id: 'ca_ontario_prov_2026',
      country: 'CA',
      type: 'provincial',
      name: '2026 Ontario Provincial Election',
      expectedDate: '2026-06-04',
      status: 'upcoming',
      province: 'Ontario',
      description: 'Scheduled Ontario provincial election under Doug Ford\'s PCs.',
      currentGovParty: 'Progressive Conservative',
      currentGovLeader: 'Doug Ford',
    },
    {
      id: 'ca_bc_prov_2028',
      country: 'CA',
      type: 'provincial',
      name: '2028 British Columbia Provincial Election',
      expectedDate: '2028-10-01',
      status: 'expected',
      province: 'British Columbia',
      description: 'Next BC provincial election following 2024 NDP re-election.',
      currentGovParty: 'NDP',
      currentGovLeader: 'David Eby',
    },
  ],

  US: [
    {
      id: 'us_midterms_2026',
      country: 'US',
      type: 'midterm',
      name: '2026 US Midterm Elections',
      expectedDate: '2026-11-03',
      status: 'upcoming',
      description: 'All 435 House seats, 33 Senate seats, 36 governorships.',
      houseSeatsUp: 435,
      senateSeatsUp: 33,
      governorshipsUp: 36,
      currentHouseControl: 'Republican',
      currentSenateControl: 'Republican',
      currentPresident: 'Donald Trump',
      currentPresidentParty: 'Republican',
    },
    {
      id: 'us_presidential_2028',
      country: 'US',
      type: 'presidential',
      name: '2028 US Presidential Election',
      expectedDate: '2028-11-07',
      status: 'expected',
      description: 'Trump constitutionally ineligible for second consecutive term; open Republican primary expected.',
    },
  ],

  UK: [
    {
      id: 'uk_local_2026',
      country: 'UK',
      type: 'local',
      name: '2026 English Local Elections',
      expectedDate: '2026-05-07',
      status: 'upcoming',
      description: 'Local council elections across England — first major test for Labour government.',
      currentGovParty: 'Labour',
      currentGovLeader: 'Keir Starmer',
    },
    {
      id: 'uk_general_2029',
      country: 'UK',
      type: 'general',
      name: '2029 UK General Election',
      expectedDate: '2029-01-25',
      status: 'expected',
      description: 'Next UK General Election due by January 2029; PM may call earlier.',
      totalSeats: 650,
      seatsForMajority: 326,
      currentGovParty: 'Labour',
      currentGovLeader: 'Keir Starmer',
    },
  ],

  AU: [
    {
      id: 'au_qld_state_2026',
      country: 'AU',
      type: 'state',
      name: '2026 Queensland State Election',
      expectedDate: '2026-10-31',
      status: 'upcoming',
      state: 'Queensland',
      description: 'Queensland state election; LNP government faces first re-election test.',
      currentGovParty: 'LNP',
      currentGovLeader: 'David Crisafulli',
    },
    {
      id: 'au_sa_state_2026',
      country: 'AU',
      type: 'state',
      name: '2026 South Australia State Election',
      expectedDate: '2026-03-21',
      status: 'upcoming',
      state: 'South Australia',
      description: 'South Australia state election; ALP seeks third term under Peter Malinauskas.',
      currentGovParty: 'ALP',
      currentGovLeader: 'Peter Malinauskas',
    },
    {
      id: 'au_federal_2028',
      country: 'AU',
      type: 'federal',
      name: '2028 Australian Federal Election',
      expectedDate: '2028-05-06',
      status: 'expected',
      description: 'Next Australian Federal Election expected around May 2028.',
      totalSeats: 151,
      seatsForMajority: 76,
      currentGovParty: 'ALP',
      currentGovLeader: 'Anthony Albanese',
    },
  ],
};

// ─── Recent election results (baseline) ───────────────────────────────────────

const RECENT_RESULTS = {
  CA: [
    {
      id: 'ca_federal_2025',
      country: 'CA',
      type: 'federal',
      name: '2025 Canadian Federal Election',
      date: '2025-04-28',
      winner: 'Liberal Party',
      winnerLeader: 'Mark Carney',
      governmentType: 'minority',
      totalSeats: 343,
      seatsForMajority: 172,
      turnoutPct: 68.4,
      results: [
        { party: 'Liberal',           seats: 168, votePct: 43.5, swingPct: +8.2 },
        { party: 'Conservative',      seats: 144, votePct: 41.3, swingPct: -1.4 },
        { party: 'NDP',               seats:  15, votePct:  6.3, swingPct: -10.7 },
        { party: 'Bloc Québécois',    seats:  22, votePct:  6.4, swingPct: +1.1 },
        { party: 'Green',             seats:   1, votePct:  1.2, swingPct: -0.7 },
      ],
      keyIssues: ['US tariffs', 'cost of living', 'housing', 'sovereignty'],
    },
  ],

  US: [
    {
      id: 'us_presidential_2024',
      country: 'US',
      type: 'presidential',
      name: '2024 US Presidential Election',
      date: '2024-11-05',
      winner: 'Republican',
      winnerLeader: 'Donald Trump',
      results: [
        { party: 'Republican', electoralVotes: 312, popularVotePct: 49.8, swingPct: +1.7 },
        { party: 'Democrat',   electoralVotes: 226, popularVotePct: 48.3, swingPct: -2.5 },
      ],
      keyStates: ['Pennsylvania', 'Michigan', 'Wisconsin', 'Georgia', 'Arizona'],
      keyIssues: ['immigration', 'inflation', 'crime', 'democracy'],
    },
  ],

  UK: [
    {
      id: 'uk_general_2024',
      country: 'UK',
      type: 'general',
      name: '2024 UK General Election',
      date: '2024-07-04',
      winner: 'Labour',
      winnerLeader: 'Keir Starmer',
      governmentType: 'majority',
      totalSeats: 650,
      seatsForMajority: 326,
      labourMajority: 174,
      turnoutPct: 59.9,
      results: [
        { party: 'Labour',            seats: 412, votePct: 33.7, swingPct: +1.6 },
        { party: 'Conservative',      seats: 121, votePct: 23.7, swingPct: -19.9 },
        { party: 'Reform UK',         seats:   5, votePct: 14.3, swingPct: +12.3 },
        { party: 'Liberal Democrats', seats:  72, votePct: 12.2, swingPct: +0.7 },
        { party: 'SNP',               seats:   9, votePct:  2.5, swingPct: -0.7 },
        { party: 'Green',             seats:   4, votePct:  6.8, swingPct: +4.0 },
      ],
      keyIssues: ['NHS', 'cost of living', 'government integrity', 'immigration'],
    },
  ],

  AU: [
    {
      id: 'au_federal_2025',
      country: 'AU',
      type: 'federal',
      name: '2025 Australian Federal Election',
      date: '2025-05-03',
      winner: 'Australian Labor Party',
      winnerLeader: 'Anthony Albanese',
      governmentType: 'majority',
      totalSeats: 151,
      seatsForMajority: 76,
      turnoutPct: 94.2,
      results: [
        { party: 'ALP',          seats: 91, votePct: 34.7, tppPct: 54.3, swingPct: +2.1 },
        { party: 'Coalition',    seats: 43, votePct: 32.6, tppPct: 45.7, swingPct: -4.8 },
        { party: 'Greens',       seats:  4, votePct: 12.4, swingPct: +1.1 },
        { party: 'Independent',  seats: 10, votePct: 13.8, swingPct: +2.9 },
        { party: 'Other',        seats:  3, votePct:  6.5, swingPct: -1.3 },
      ],
      keyIssues: ['cost of living', 'housing', 'climate', 'health'],
    },
  ],
};

// ─── Baseline polling (updated by live news extraction) ───────────────────────

const BASELINE_POLLS = {
  CA: {
    asOf: '2026-03-01',
    source: 'Aggregate (338Canada / Nanos / Léger)',
    marginOfError: 2.5,
    sampleSize: 1200,
    standings: [
      { party: 'Liberal',        support: 41.2, change7d: -2.3, leaderApproval: 48 },
      { party: 'Conservative',   support: 40.8, change7d: +1.1, leaderApproval: 38 },
      { party: 'NDP',            support:  8.4, change7d: +0.6, leaderApproval: 31 },
      { party: 'Bloc Québécois', support:  6.9, change7d: +0.4, leaderApproval: 29 },
      { party: 'Green',          support:  2.1, change7d: -0.2, leaderApproval: 22 },
    ],
  },

  US: {
    asOf: '2026-03-01',
    source: 'Aggregate (FiveThirtyEight / RCP / Emerson)',
    marginOfError: 3.0,
    presidentApproval: { leader: 'Donald Trump', approve: 44, disapprove: 52 },
    genericBallot: [
      { party: 'Republican', support: 46.2, change7d: -1.4 },
      { party: 'Democrat',   support: 45.8, change7d: +1.2 },
    ],
    senateRaces: [
      { state: 'Arizona',  demPct: 46, repPct: 48, lean: 'R+2' },
      { state: 'Georgia',  demPct: 44, repPct: 51, lean: 'R+7' },
      { state: 'Wisconsin',demPct: 47, repPct: 47, lean: 'Even' },
      { state: 'Michigan', demPct: 49, repPct: 46, lean: 'D+3' },
      { state: 'Nevada',   demPct: 47, repPct: 47, lean: 'Even' },
    ],
  },

  UK: {
    asOf: '2026-03-01',
    source: 'Aggregate (YouGov / Ipsos / Savanta)',
    marginOfError: 2.0,
    sampleSize: 2100,
    standings: [
      { party: 'Labour',            support: 28, change7d: -5.7, leaderApproval: 22 },
      { party: 'Conservative',      support: 24, change7d: +0.3, leaderApproval: 18 },
      { party: 'Reform UK',         support: 27, change7d: +12.7,leaderApproval: 34 },
      { party: 'Liberal Democrats', support: 13, change7d: +0.8, leaderApproval: 26 },
      { party: 'Green',             support:  5, change7d: -1.8, leaderApproval: 21 },
    ],
  },

  AU: {
    asOf: '2026-03-01',
    source: 'Aggregate (Newspoll / Essential / RedBridge)',
    marginOfError: 2.5,
    sampleSize: 1500,
    standings: [
      { party: 'ALP',             support: 35.4, tpp: 52, change7d: +0.7, leaderApproval: 45 },
      { party: 'Coalition',       support: 34.2, tpp: 48, change7d: -2.1, leaderApproval: 32 },
      { party: 'Greens',          support: 12.1,           change7d: -0.3, leaderApproval: 28 },
      { party: 'Independent/Other',support:18.3,           change7d: +1.7 },
    ],
  },
};

// ─── Battleground seats ───────────────────────────────────────────────────────

const BATTLEGROUNDS = {
  CA: [
    { id: 'ca_bg_brampton_east',   name: 'Brampton East',           region: 'ON', currentParty: 'Liberal',      marginPct: 1.2, watchReason: 'South Asian diaspora swing seat; ultratight in 2025' },
    { id: 'ca_bg_kanata',          name: 'Kanata–Carleton',         region: 'ON', currentParty: 'Conservative', marginPct: 2.8, watchReason: 'Ottawa tech-corridor suburb; flips with national mood' },
    { id: 'ca_bg_surrey_newton',   name: 'Surrey Newton',           region: 'BC', currentParty: 'NDP',          marginPct: 3.1, watchReason: 'Dense immigrant suburb; NDP–Liberal battleground' },
    { id: 'ca_bg_sault_ste_marie', name: 'Sault Ste. Marie',        region: 'ON', currentParty: 'Conservative', marginPct: 5.4, watchReason: 'Steel-town; US tariff impact could flip blue-collar vote' },
    { id: 'ca_bg_levis_lotbiniere', name: 'Lévis–Lotbinière',       region: 'QC', currentParty: 'Bloc',         marginPct: 4.2, watchReason: 'Bloc–Conservative fight outside Quebec City' },
  ],

  US: [
    { id: 'us_bg_az_sen',  name: 'Arizona Senate',           region: 'AZ', currentParty: 'Democrat',    ratingCook: 'Toss-up',        watchReason: 'Mark Kelly seat; Trump-country test for blue incumbents' },
    { id: 'us_bg_ga_sen',  name: 'Georgia Senate',           region: 'GA', currentParty: 'Democrat',    ratingCook: 'Lean Republican', watchReason: 'Jon Ossoff faces tough red-state fundamentals in midterm' },
    { id: 'us_bg_wi_sen',  name: 'Wisconsin Senate',         region: 'WI', currentParty: 'Democrat',    ratingCook: 'Toss-up',        watchReason: 'Purple state bellwether; Tammy Baldwin retirement open seat' },
    { id: 'us_bg_nv_sen',  name: 'Nevada Senate',            region: 'NV', currentParty: 'Democrat',    ratingCook: 'Toss-up',        watchReason: 'Jacky Rosen seat in true swing state' },
    { id: 'us_bg_pa_07',   name: 'PA-07 (Suburban Philly)',  region: 'PA', currentParty: 'Democrat',    ratingCook: 'Toss-up',        watchReason: 'Swing suburb picked by redistricting; Dem hold needed' },
    { id: 'us_bg_az_06',   name: 'AZ-06 (Phoenix Metro)',    region: 'AZ', currentParty: 'Republican',  ratingCook: 'Toss-up',        watchReason: 'Newly competitive Phoenix suburb; education/abortion drove 2022 flip' },
  ],

  UK: [
    { id: 'uk_bg_runcorn',   name: 'Runcorn and Helsby',        region: 'North West', currentParty: 'Labour',    marginPct: 0.3, watchReason: 'Wafer-thin Labour hold; Reform surge could flip it' },
    { id: 'uk_bg_clacton',   name: 'Clacton',                   region: 'East',       currentParty: 'Reform UK', marginPct: 2.5, watchReason: 'Nigel Farage\'s seat; canary for Reform expansion' },
    { id: 'uk_bg_camborne',  name: 'Camborne and Redruth',      region: 'South West', currentParty: 'Conservative', marginPct: 2.1, watchReason: 'Three-way Con/Lab/LD marginal in tourist Cornwall' },
    { id: 'uk_bg_alloa',     name: 'Alloa and Grangemouth',     region: 'Scotland',   currentParty: 'Labour',    marginPct: 3.8, watchReason: 'SNP fighting back in Scottish seats Labour took in 2024' },
    { id: 'uk_bg_ashford',   name: 'Ashford',                   region: 'South East', currentParty: 'Conservative', marginPct: 6.1, watchReason: 'Reform could split right vote; Lab dark horse' },
  ],

  AU: [
    { id: 'au_bg_dickson',   name: 'Dickson',  state: 'QLD', currentParty: 'LNP',      marginPct: 1.7, watchReason: 'Peter Dutton\'s former seat; bellwether for coalition recovery' },
    { id: 'au_bg_boothby',   name: 'Boothby',  state: 'SA',  currentParty: 'ALP',      marginPct: 1.4, watchReason: 'Adelaide marginal; cost-of-living barometer' },
    { id: 'au_bg_deakin',    name: 'Deakin',   state: 'VIC', currentParty: 'Liberal',  marginPct: 2.9, watchReason: 'Melbourne outer east; teal-independent and ALP threat' },
    { id: 'au_bg_tangney',   name: 'Tangney',  state: 'WA',  currentParty: 'ALP',      marginPct: 3.1, watchReason: 'Perth southern suburbs; independent "teal" movement growing' },
    { id: 'au_bg_chifley',   name: 'Chifley',  state: 'NSW', currentParty: 'ALP',      marginPct: 8.2, watchReason: 'Western Sydney heartland; housing affordability pressure on Labor' },
  ],
};

// ─── Scheduling helper ────────────────────────────────────────────────────────

/**
 * Returns true if any upcoming election for the country is within
 * ELECTION_PERIOD_DAYS days from today.
 */
export function isElectionPeriod(country) {
  const elections = UPCOMING_ELECTIONS[country] ?? [];
  const nowMs = Date.now();
  const windowMs = ELECTION_PERIOD_DAYS * 24 * 60 * 60 * 1000;
  return elections.some((e) => {
    if (e.status === 'expected') return false; // expected = no firm date
    const electionMs = new Date(e.expectedDate).getTime();
    const diff = electionMs - nowMs;
    return diff >= 0 && diff <= windowMs;
  });
}

/**
 * Returns true if ANY tracked country is in an election period.
 */
export function anyElectionPeriod() {
  return ['CA', 'US', 'UK', 'AU'].some(isElectionPeriod);
}

// ─── Live API fetchers ────────────────────────────────────────────────────────

/**
 * UK — Democracy Club elections API (free, no key required).
 */
async function fetchUKLiveElections() {
  try {
    const url = 'https://candidates.democracyclub.org.uk/api/v0.9/elections/?current=true&format=json&limit=20';
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Democracy Club ${res.status}`);
    const json = await res.json();
    const results = (json.results ?? []).map((e) => ({
      id: e.election_id,
      name: e.name,
      date: e.election_date,
      type: e.election_type?.name ?? 'unknown',
      slug: e.slug,
      source: 'democracyclub',
    }));
    console.log(`[electionFetcher] Democracy Club: ${results.length} current UK elections`);
    return results;
  } catch (err) {
    console.warn('[electionFetcher] Democracy Club API failed:', err.message);
    return [];
  }
}

/**
 * US — FEC API upcoming elections (requires REACT_APP_FEC_API_KEY or DEMO_KEY).
 */
async function fetchUSLiveFEC() {
  try {
    const params = new URLSearchParams({
      api_key: FEC_API_KEY,
      cycle: '2026',
      per_page: 20,
    });
    const res = await fetch(`https://api.open.fec.gov/v1/elections/search/?${params}`);
    if (!res.ok) throw new Error(`FEC API ${res.status}`);
    const json = await res.json();
    const results = (json.results ?? []).map((e) => ({
      id: `fec_${e.election_id ?? Math.random()}`,
      state: e.state,
      district: e.district,
      office: e.office_full,
      cycle: e.cycle,
      source: 'fec',
    }));
    console.log(`[electionFetcher] FEC: ${results.length} 2026 races`);
    return results;
  } catch (err) {
    console.warn('[electionFetcher] FEC API failed:', err.message);
    return [];
  }
}

// ─── News-based polling extractor ─────────────────────────────────────────────

async function fetchPollingNews(country) {
  const queries = {
    CA: 'Canada federal election poll 2026 Liberal Conservative',
    US: 'US midterm elections 2026 poll Republican Democrat Senate',
    UK: 'UK opinion poll 2026 Labour Reform Conservative',
    AU: 'Australia federal election poll 2026 Labor Liberal',
  };
  const q = queries[country] ?? `${country} election poll 2026`;
  const articles = [];

  // Try NewsAPI
  if (NEWS_API_KEY) {
    try {
      const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&sortBy=publishedAt&pageSize=${MAX_POLLING_ARTICLES}&language=en&apiKey=${NEWS_API_KEY}`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        articles.push(...(json.articles ?? []).map((a) => ({
          title: a.title,
          source: a.source?.name,
          url: a.url,
          publishedAt: a.publishedAt,
          description: a.description,
        })));
        console.log(`[electionFetcher] NewsAPI: ${articles.length} polling articles for ${country}`);
      }
    } catch (err) {
      console.warn(`[electionFetcher] NewsAPI failed for ${country}:`, err.message);
    }
  }

  await new Promise((r) => setTimeout(r, NEWS_DELAY_MS));

  // Try GNews if needed
  if (articles.length < 2 && GNEWS_API_KEY) {
    try {
      const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(q)}&max=${MAX_POLLING_ARTICLES}&lang=en&token=${GNEWS_API_KEY}`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        const gnews = (json.articles ?? []).map((a) => ({
          title: a.title,
          source: a.source?.name,
          url: a.url,
          publishedAt: a.publishedAt,
          description: a.description,
        }));
        articles.push(...gnews);
        console.log(`[electionFetcher] GNews: +${gnews.length} articles for ${country}`);
      }
    } catch (err) {
      console.warn(`[electionFetcher] GNews failed for ${country}:`, err.message);
    }
  }

  await new Promise((r) => setTimeout(r, NEWS_DELAY_MS));

  // Guardian (free, no key)
  if (articles.length < 2) {
    try {
      const guardianQ = encodeURIComponent(q);
      const url = `https://content.guardianapis.com/search?q=${guardianQ}&order-by=newest&page-size=${MAX_POLLING_ARTICLES}&api-key=test`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        const guardian = (json.response?.results ?? []).map((a) => ({
          title: a.webTitle,
          source: 'The Guardian',
          url: a.webUrl,
          publishedAt: a.webPublicationDate,
          description: a.fields?.trailText ?? '',
        }));
        articles.push(...guardian);
        console.log(`[electionFetcher] Guardian: +${guardian.length} articles for ${country}`);
      }
    } catch (err) {
      console.warn(`[electionFetcher] Guardian failed for ${country}:`, err.message);
    }
  }

  return articles.slice(0, MAX_POLLING_ARTICLES);
}

// ─── Claude AI analysis ───────────────────────────────────────────────────────

async function analyzeWithClaude(country, upcoming, polling, recentResults, battlegrounds, pollingArticles) {
  if (!ANTHROPIC_KEY) {
    console.warn('[electionFetcher] No Anthropic key — using rule-based analysis');
    return buildRuleBasedBriefing(country, upcoming, polling);
  }

  const pollingHeadlines = pollingArticles.map((a) => `- ${a.title} (${a.source})`).join('\n');
  const nextElection = upcoming.find((e) => e.status === 'upcoming') ?? upcoming[0];
  const lastResult = recentResults[0];
  const hotSeats = battlegrounds.slice(0, 3).map((b) => b.name).join(', ');

  const prompt = `You are a non-partisan political analyst. Analyze the following election data for ${country} and produce a structured assessment.

NEXT ELECTION:
${nextElection ? `${nextElection.name} — ${nextElection.expectedDate} (${nextElection.type})` : 'No imminent election scheduled'}
${nextElection?.description ?? ''}

CURRENT POLLING:
${JSON.stringify(polling?.standings ?? polling?.genericBallot ?? [], null, 2)}
${polling?.presidentApproval ? `Presidential Approval: ${JSON.stringify(polling.presidentApproval)}` : ''}

MOST RECENT ELECTION RESULT:
${lastResult ? `${lastResult.name} (${lastResult.date}) — Winner: ${lastResult.winner} / ${lastResult.winnerLeader}` : 'No recent result on record'}

KEY BATTLEGROUND SEATS:
${hotSeats || 'None identified'}

RECENT POLLING HEADLINES:
${pollingHeadlines || 'No live polling news retrieved'}

Return ONLY valid JSON (no markdown):
{
  "outcomePrediction": "one sentence on who is likely to win or lead next election",
  "confidencePct": <0-100 integer — how confident based on polling and context>,
  "keyIssues": ["issue1", "issue2", "issue3"],
  "electionBriefing": "2-3 sentence plain-language summary for a citizen with no political knowledge",
  "momentumParty": "party gaining momentum right now",
  "riskFactors": ["risk1", "risk2"]
}`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-calls': 'true',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 600,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!res.ok) throw new Error(`Claude ${res.status}: ${await res.text()}`);
    const data = await res.json();
    const text = data.content?.[0]?.text ?? '{}';
    const json = JSON.parse(text.replace(/```json\n?|\n?```/g, '').trim());
    return { ...json, analysisSource: 'claude' };
  } catch (err) {
    console.warn(`[electionFetcher] Claude analysis failed for ${country}:`, err.message);
    return buildRuleBasedBriefing(country, upcoming, polling);
  }
}

function buildRuleBasedBriefing(country, upcoming, polling) {
  const nextElection = upcoming.find((e) => e.status === 'upcoming') ?? upcoming[0];
  const topParty = (polling?.standings ?? polling?.genericBallot ?? [])[0];

  return {
    outcomePrediction: topParty
      ? `${topParty.party} leads current polling with ${topParty.support ?? topParty.repPct ?? '—'}% support heading into ${nextElection?.name ?? 'the next election'}.`
      : `No clear polling leader identified for ${country}.`,
    confidencePct: 40,
    keyIssues: ['cost of living', 'economic management', 'healthcare'],
    electionBriefing: nextElection
      ? `${nextElection.name} is scheduled for ${nextElection.expectedDate}. ${nextElection.description ?? ''}`
      : `No imminent election scheduled for ${country}.`,
    momentumParty: topParty?.party ?? 'Unknown',
    riskFactors: ['polling volatility', 'economic headwinds'],
    analysisSource: 'rule-based',
  };
}

// ─── Firestore persistence ────────────────────────────────────────────────────

async function clearCountryDocs(country) {
  try {
    const col = collection(db, 'elections');
    const snap = await getDocs(query(col, where('country', '==', country)));
    await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
    console.log(`[electionFetcher] Cleared ${snap.size} existing docs for ${country}`);
  } catch (err) {
    console.warn(`[electionFetcher] Could not clear old docs for ${country}:`, err.message);
  }
}

async function saveToFirestore(country, { upcoming, polling, recentResults, battlegrounds, analysis, liveUK, liveUS }) {
  const col = collection(db, 'elections');
  const base = { country, fetchedAt: serverTimestamp() };
  const writes = [];

  // Upcoming elections
  for (const e of upcoming) {
    writes.push(addDoc(col, { ...base, docType: 'upcomingElection', ...e }));
  }

  // Live UK elections from Democracy Club
  for (const e of (liveUK ?? [])) {
    writes.push(addDoc(col, { ...base, docType: 'upcomingElection', liveSource: 'democracyclub', ...e }));
  }

  // Live US races from FEC
  for (const r of (liveUS ?? [])) {
    writes.push(addDoc(col, { ...base, docType: 'fecRace', liveSource: 'fec', ...r }));
  }

  // Polling snapshot
  if (polling) {
    writes.push(addDoc(col, { ...base, docType: 'pollingSnapshot', ...polling }));
  }

  // Recent results
  for (const r of recentResults) {
    writes.push(addDoc(col, { ...base, docType: 'electionResult', ...r }));
  }

  // Battlegrounds
  for (const b of battlegrounds) {
    writes.push(addDoc(col, { ...base, docType: 'battleground', ...b }));
  }

  // Country briefing from Claude
  if (analysis) {
    writes.push(addDoc(col, { ...base, docType: 'countryBriefing', ...analysis }));
  }

  const results = await Promise.allSettled(writes);
  const saved = results.filter((r) => r.status === 'fulfilled').length;
  console.log(`[electionFetcher] Saved ${saved}/${results.length} docs to Firestore for ${country}`);
  return { saved, total: results.length };
}

// ─── Raw JSON output ──────────────────────────────────────────────────────────

/**
 * Builds the raw snapshot object that gets written to output/elections/<country>.json.
 * In a browser context this is returned for inspection; in a build/CI script
 * it can be serialised with fs.writeFileSync.
 */
function buildRawSnapshot(country, { upcoming, polling, recentResults, battlegrounds, analysis, pollingArticles, liveUK, liveUS }) {
  return {
    country,
    generatedAt: new Date().toISOString(),
    upcomingElections: upcoming,
    liveElections: country === 'UK' ? liveUK : country === 'US' ? liveUS : [],
    currentPolling: polling,
    recentResults,
    battlegrounds,
    pollingArticles,
    claudeAnalysis: analysis,
  };
}

// ─── Per-country orchestrator ─────────────────────────────────────────────────

async function fetchCountry(country) {
  console.log(`[electionFetcher] Processing ${country}…`);

  const upcoming      = UPCOMING_ELECTIONS[country]  ?? [];
  const recentResults = RECENT_RESULTS[country]      ?? [];
  const battlegrounds = BATTLEGROUNDS[country]        ?? [];
  const polling       = { ...BASELINE_POLLS[country] };

  // Live API calls (country-specific)
  const liveUK = country === 'UK' ? await fetchUKLiveElections() : [];
  const liveUS = country === 'US' ? await fetchUSLiveFEC()       : [];

  // News-based polling headlines
  const pollingArticles = await fetchPollingNews(country);

  await new Promise((r) => setTimeout(r, CLAUDE_DELAY_MS));

  // Claude analysis
  const analysis = await analyzeWithClaude(
    country, upcoming, polling, recentResults, battlegrounds, pollingArticles,
  );

  await new Promise((r) => setTimeout(r, CLAUDE_DELAY_MS));

  const snapshot = buildRawSnapshot(country, {
    upcoming, polling, recentResults, battlegrounds,
    analysis, pollingArticles, liveUK, liveUS,
  });

  return { country, snapshot, upcoming, polling, recentResults, battlegrounds, analysis, liveUK, liveUS };
}

// ─── Main entry point ─────────────────────────────────────────────────────────

/**
 * Fetch election data for one or more countries and save to Firestore.
 * Also returns raw snapshots (write to output/elections/<country>.json in CI).
 *
 * @param {string[]} countries — subset of ['CA','US','UK','AU']
 * @returns {Promise<{ snapshots: object, saved: number, errors: string[] }>}
 */
export async function runElectionFetcher(countries = ['CA', 'US', 'UK', 'AU']) {
  console.log('[electionFetcher] Starting election fetch for:', countries.join(', '));
  const snapshots = {};
  let totalSaved = 0;
  const errors = [];

  for (const country of countries) {
    try {
      const result = await fetchCountry(country);
      snapshots[country] = result.snapshot;

      await clearCountryDocs(country);
      const { saved } = await saveToFirestore(country, result);
      totalSaved += saved;

      console.log(`[electionFetcher] ✓ ${country} — ${saved} docs saved`);
    } catch (err) {
      console.error(`[electionFetcher] ✗ ${country} failed:`, err);
      errors.push(`${country}: ${err.message}`);
    }

    // Breathing room between countries
    await new Promise((r) => setTimeout(r, 500));
  }

  console.log(`[electionFetcher] Done. Total saved: ${totalSaved}. Errors: ${errors.length}`);
  return { snapshots, saved: totalSaved, errors };
}

export default runElectionFetcher;
