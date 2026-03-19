/**
 * Foreign Aid & International Spending Fetcher
 *
 * Fetches official foreign aid data from four governments, normalises records
 * into a common schema, runs each batch through Claude AI for plain-language
 * analysis, and saves results to Firestore collection "foreign_aid".
 *
 * Sources
 * ───────
 *   Canada  : open.canada.ca  — CKAN datastore API (International Assistance)
 *   USA     : api.usaspending.gov — spending_by_category (foreign assistance)
 *   UK      : devtracker.fcdo.gov.uk — FCDO Development Tracker API
 *   Australia: data.dfat.gov.au — DFAT Official Development Assistance
 *
 * Claude AI analysis per aid package
 * ────────────────────────────────────
 *   • Plain-language summary (2–3 sentences)
 *   • Citizen impact explanation (what it means for taxpayers)
 *   • Efficiency score 1–10
 *   • Flag if amount appears unusually large (with reasoning)
 *
 * Environment variables required
 * ──────────────────────────────
 *   REACT_APP_ANTHROPIC_API_KEY — Anthropic API key for Claude AI calls
 *   (REACT_APP_FIREBASE_API_KEY is already configured in .env)
 *
 * Usage
 * ─────
 *   import { runForeignAidFetcher } from './ingestion/foreignAidFetcher.js';
 *   await runForeignAidFetcher();          // fetches all 4 countries
 *   await runForeignAidFetcher(['US','UK']); // specific countries only
 */

import { db } from '../firebase.js';
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  deleteDoc,
} from 'firebase/firestore';

// ─── Config ───────────────────────────────────────────────────────────────────

const ANTHROPIC_API_KEY = process.env.REACT_APP_ANTHROPIC_API_KEY || '';
const CLAUDE_MODEL      = 'claude-haiku-4-5-20251001'; // fast + cost-efficient for batch summarisation
const CLAUDE_API_URL    = 'https://api.anthropic.com/v1/messages';

// Amounts above this multiple of the country average are flagged as unusually large
const OUTLIER_MULTIPLIER = 5;

// Max records fetched per country per run (keeps Claude costs predictable)
const MAX_RECORDS_PER_COUNTRY = 50;

// ─── Common aid record schema ─────────────────────────────────────────────────
//
// All source-specific fetchers normalise into this shape before Claude analysis:
//
// {
//   country         : 'CA' | 'US' | 'UK' | 'AU'
//   sourceId        : string          — unique id from source system
//   recipientCountry: string          — name of aid-receiving nation
//   recipientRegion : string | null   — geographic region
//   amountLocal     : number          — amount in donor's local currency
//   currency        : 'CAD'|'USD'|'GBP'|'AUD'
//   amountUSD       : number          — converted to USD for comparison
//   purpose         : string          — short description
//   category        : string          — sector (health/education/etc.)
//   department      : string          — approving government body
//   projectStatus   : string          — active/completed/pipeline
//   startDate       : string | null   — ISO date
//   endDate         : string | null   — ISO date
//   sourceUrl       : string          — link to source record
// }

// ─── Currency → USD conversion rates (approximate, March 2026) ───────────────
const USD_RATES = { CAD: 0.72, USD: 1.0, GBP: 1.27, AUD: 0.63 };

function toUSD(amount, currency) {
  return Math.round(amount * (USD_RATES[currency] ?? 1));
}

// ─── Fetch helpers ────────────────────────────────────────────────────────────

async function fetchJSON(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
  return res.json();
}

async function postJSON(url, body, headers = {}) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...headers },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} posting to ${url}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

function safeNum(val) {
  const n = parseFloat(String(val).replace(/[^0-9.-]/g, ''));
  return isNaN(n) ? 0 : n;
}

function isoDate(str) {
  if (!str) return null;
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d.toISOString().split('T')[0];
}

function truncate(str, len = 300) {
  if (!str) return '';
  return String(str).length > len ? String(str).slice(0, len - 1) + '…' : String(str);
}

// ─── Canada ───────────────────────────────────────────────────────────────────
// Source: open.canada.ca CKAN datastore
// Dataset: "International Assistance" (grand-international-assistance-data)
// Docs: https://open.canada.ca/data/en/dataset/international-assistance
//
// The CKAN package contains multiple CSV resources. We use the datastore_search
// endpoint on the most recent annual resource returned by package_show.

async function fetchCanada() {
  console.log('[foreignAid] Fetching Canada...');

  const PACKAGE_ID = 'grand-international-assistance-data';
  const CKAN_BASE  = 'https://open.canada.ca/data/api/3/action';

  // 1. Get resource list for the package
  let resourceId;
  try {
    const pkg = await fetchJSON(`${CKAN_BASE}/package_show?id=${PACKAGE_ID}`);
    // Pick the most recent datastore-enabled resource (prefer CSV/JSON with "2024" or last item)
    const resources = pkg?.result?.resources ?? [];
    const datastoreRes = resources.filter((r) => r.datastore_active || r.format === 'CSV');
    const picked = datastoreRes.find((r) => /2024|2023/i.test(r.name)) ?? datastoreRes[datastoreRes.length - 1];
    resourceId = picked?.id;
  } catch (e) {
    console.warn('[foreignAid] Canada: failed to fetch package metadata, using fallback resource id', e.message);
    // Fallback: known stable resource id for the international assistance dataset
    resourceId = '7a9ebe1d-d4e5-4c00-9c6b-69a56c15febb';
  }

  const url = `${CKAN_BASE}/datastore_search?resource_id=${resourceId}&limit=${MAX_RECORDS_PER_COUNTRY}&sort=fiscal_year desc`;
  const data = await fetchJSON(url);
  const records = data?.result?.records ?? [];

  return records.map((r) => {
    const amount = safeNum(r.disbursements_total ?? r.amount ?? r.disbursement ?? 0);
    return {
      country: 'CA',
      sourceId: String(r._id ?? r.project_id ?? Math.random()),
      recipientCountry: r.country ?? r.recipient_country ?? r.beneficiary_country ?? 'Unknown',
      recipientRegion: r.region ?? r.geographic_region ?? null,
      amountLocal: amount,
      currency: 'CAD',
      amountUSD: toUSD(amount, 'CAD'),
      purpose: truncate(r.project_name ?? r.description ?? r.purpose ?? ''),
      category: r.sector ?? r.category ?? r.theme ?? 'General',
      department: r.implementing_organization ?? r.department ?? 'Global Affairs Canada',
      projectStatus: r.status ?? r.project_status ?? 'Unknown',
      startDate: isoDate(r.start_date ?? r.fiscal_year_start),
      endDate: isoDate(r.end_date ?? r.fiscal_year_end),
      sourceUrl: `https://open.canada.ca/data/en/dataset/${PACKAGE_ID}`,
    };
  });
}

// ─── United States ────────────────────────────────────────────────────────────
// Source: USASpending.gov API v2
// Endpoint: /api/v2/search/spending_by_category/recipient_country/
// Docs: https://api.usaspending.gov/#/category-spending
//
// We filter by "foreign_assistance" spending type across all federal agencies.

async function fetchUSA() {
  console.log('[foreignAid] Fetching USA...');

  const url = 'https://api.usaspending.gov/api/v2/search/spending_by_category/recipient_country/';

  const body = {
    filters: {
      time_period: [{ start_date: '2024-10-01', end_date: '2025-09-30' }],
      award_type_codes: ['02', '03', '04', '05'], // grants and cooperative agreements
      program_activities: [{ name: 'FOREIGN ASSISTANCE' }],
    },
    category: 'recipient_country',
    limit: MAX_RECORDS_PER_COUNTRY,
    page: 1,
  };

  let results;
  try {
    const data = await postJSON(url, body);
    results = data?.results ?? [];
  } catch {
    // Fallback to spending_by_agency for international programs if recipient_country filter fails
    console.warn('[foreignAid] USA: recipient_country endpoint failed, trying awards search');
    const fallbackUrl = 'https://api.usaspending.gov/api/v2/search/spending_by_category/awarding_agency/';
    const fallbackBody = {
      filters: {
        time_period: [{ start_date: '2024-10-01', end_date: '2025-09-30' }],
        agencies: [
          { type: 'awarding', tier: 'toptier', name: 'Agency for International Development' },
          { type: 'awarding', tier: 'toptier', name: 'Department of State' },
        ],
      },
      category: 'awarding_agency',
      limit: MAX_RECORDS_PER_COUNTRY,
      page: 1,
    };
    const fallbackData = await postJSON(fallbackUrl, fallbackBody);
    results = fallbackData?.results ?? [];
  }

  return results.map((r, i) => {
    const amount = safeNum(r.aggregated_amount ?? r.amount ?? 0);
    return {
      country: 'US',
      sourceId: String(r.id ?? r.code ?? i),
      recipientCountry: r.name ?? r.country_name ?? 'Multiple Countries',
      recipientRegion: r.region ?? null,
      amountLocal: amount,
      currency: 'USD',
      amountUSD: amount,
      purpose: truncate(r.description ?? r.name ?? 'International assistance program'),
      category: r.category ?? 'Foreign Assistance',
      department: r.awarding_agency ?? r.agency ?? 'USAID / State Department',
      projectStatus: 'Active',
      startDate: '2024-10-01',
      endDate: '2025-09-30',
      sourceUrl: `https://www.usaspending.gov/search/?hash=${r.id ?? ''}`,
    };
  });
}

// ─── United Kingdom ────────────────────────────────────────────────────────────
// Source: FCDO Development Tracker
// Endpoint: https://devtracker.fcdo.gov.uk/api/activities/?format=json
// Docs: https://devtracker.fcdo.gov.uk/
//
// Returns IATI-formatted activity records for UK Official Development Assistance.

async function fetchUK() {
  console.log('[foreignAid] Fetching UK...');

  const base = 'https://devtracker.fcdo.gov.uk/api';
  const url  = `${base}/activities/?format=json&page_size=${MAX_RECORDS_PER_COUNTRY}&ordering=-total_disbursements`;

  let items;
  try {
    const data = await fetchJSON(url);
    items = data?.results ?? data?.activities ?? (Array.isArray(data) ? data : []);
  } catch (e) {
    // Fallback: FCDO open data IATI download as JSON
    console.warn('[foreignAid] UK DevTracker API failed, trying IATI fallback:', e.message);
    const iatiUrl = `${base}/iati/activities/?format=json&page_size=${MAX_RECORDS_PER_COUNTRY}`;
    const fallback = await fetchJSON(iatiUrl);
    items = fallback?.results ?? [];
  }

  return items.slice(0, MAX_RECORDS_PER_COUNTRY).map((r) => {
    const budget = r.total_budget ?? r.budget ?? r.total_disbursements ?? 0;
    const amount = safeNum(budget);
    const transactions = r.transactions ?? [];
    const latestDisburse = transactions.filter((t) => t.type === 'D').pop();

    return {
      country: 'UK',
      sourceId: r.iati_identifier ?? r.id ?? String(Math.random()),
      recipientCountry:
        r.recipient_country?.name ??
        (Array.isArray(r.recipient_countries) ? (r.recipient_countries[0]?.name ?? 'Multiple') : 'Unknown'),
      recipientRegion:
        r.recipient_region?.name ??
        (Array.isArray(r.recipient_regions) ? (r.recipient_regions[0]?.name ?? null) : null),
      amountLocal: amount,
      currency: r.currency ?? 'GBP',
      amountUSD: toUSD(amount, r.currency ?? 'GBP'),
      purpose: truncate(r.title ?? r.name ?? r.description ?? ''),
      category:
        r.sector?.name ??
        (Array.isArray(r.sectors) ? (r.sectors[0]?.name ?? 'Development') : 'Development'),
      department:
        r.reporting_org?.narrative ?? r.reporting_organisation ?? 'FCDO',
      projectStatus: r.activity_status ?? r.status ?? 'Unknown',
      startDate: isoDate(r.start_date ?? r.activity_date_start),
      endDate: isoDate(r.end_date ?? r.activity_date_end),
      sourceUrl: `https://devtracker.fcdo.gov.uk/projects/${r.iati_identifier ?? r.id ?? ''}`,
    };
  });
}

// ─── Australia ────────────────────────────────────────────────────────────────
// Source: DFAT Official Development Assistance Open Data
// Endpoint: https://data.dfat.gov.au/api/3/action/datastore_search
// Dataset: Australia's Official Development Assistance (ODA)
// Docs: https://www.dfat.gov.au/aid/topics/measuring-aid-effectiveness/oda-data
//
// Falls back to devpolicy.org AidData CSV if DFAT CKAN is unavailable.

async function fetchAustralia() {
  console.log('[foreignAid] Fetching Australia...');

  const DFAT_BASE        = 'https://data.dfat.gov.au/api/3/action';
  const ODA_PACKAGE_ID   = 'oda-data';

  let records = [];

  try {
    // Discover the resource id dynamically
    const pkg = await fetchJSON(`${DFAT_BASE}/package_show?id=${ODA_PACKAGE_ID}`);
    const resources = pkg?.result?.resources ?? [];
    const res = resources.find((r) => r.datastore_active) ?? resources[0];

    if (res?.id) {
      const data = await fetchJSON(
        `${DFAT_BASE}/datastore_search?resource_id=${res.id}&limit=${MAX_RECORDS_PER_COUNTRY}&sort=year desc`
      );
      records = data?.result?.records ?? [];
    }
  } catch (e) {
    console.warn('[foreignAid] Australia DFAT CKAN failed:', e.message);
  }

  // Fallback: AidData CSV published by devpolicy.org (tab-separated)
  if (!records.length) {
    try {
      const csvUrl = 'https://devpolicy.org/aiddata/aiddata.csv';
      const res = await fetch(csvUrl);
      if (res.ok) {
        const text = await res.text();
        const lines = text.split('\n').filter(Boolean);
        const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/\s+/g, '_'));
        records = lines
          .slice(1, MAX_RECORDS_PER_COUNTRY + 1)
          .map((line) => {
            const vals = line.split(',');
            return Object.fromEntries(headers.map((h, i) => [h, (vals[i] ?? '').trim()]));
          });
      }
    } catch (e2) {
      console.warn('[foreignAid] Australia devpolicy.org fallback also failed:', e2.message);
    }
  }

  return records.slice(0, MAX_RECORDS_PER_COUNTRY).map((r) => {
    const amount = safeNum(
      r.oda_net ?? r.disbursement ?? r.amount ?? r.gross_oda ?? r.total ?? 0
    );
    return {
      country: 'AU',
      sourceId: String(r._id ?? r.project_id ?? r.activity_id ?? Math.random()),
      recipientCountry:
        r.recipient_country ?? r.recipient ?? r.country ?? 'Unknown',
      recipientRegion:
        r.recipient_region ?? r.region ?? null,
      amountLocal: amount,
      currency: 'AUD',
      amountUSD: toUSD(amount, 'AUD'),
      purpose: truncate(r.project_title ?? r.title ?? r.purpose ?? r.description ?? ''),
      category: r.sector ?? r.sector_name ?? r.type ?? 'Development',
      department:
        r.implementing_agency ?? r.department ?? r.managing_org ?? 'DFAT',
      projectStatus: r.status ?? r.activity_status ?? 'Unknown',
      startDate: isoDate(r.start_date ?? r.year_start ?? r.year),
      endDate: isoDate(r.end_date ?? r.year_end),
      sourceUrl: `https://www.dfat.gov.au/aid/topics/measuring-aid-effectiveness/oda-data`,
    };
  });
}

// ─── Claude AI analysis ───────────────────────────────────────────────────────

/**
 * Calculate the statistical mean and standard deviation of amountUSD
 * across a batch — used to flag outliers without needing Claude.
 */
function batchStats(records) {
  const amounts = records.map((r) => r.amountUSD).filter((n) => n > 0);
  if (!amounts.length) return { mean: 0, stdDev: 0 };
  const mean = amounts.reduce((s, n) => s + n, 0) / amounts.length;
  const variance = amounts.reduce((s, n) => s + (n - mean) ** 2, 0) / amounts.length;
  return { mean, stdDev: Math.sqrt(variance) };
}

/**
 * Call the Claude Haiku API to generate structured analysis for a single
 * aid record. Returns the analysis object or a fallback if the API key
 * is not configured or the call fails.
 *
 * @param {object} record  — normalised aid record
 * @param {object} stats   — { mean, stdDev } for the country batch
 * @returns {Promise<object>} analysis
 */
async function analyseWithClaude(record, stats) {
  if (!ANTHROPIC_API_KEY) {
    return generateFallbackAnalysis(record, stats);
  }

  const isLarge =
    stats.mean > 0 && record.amountUSD > stats.mean + OUTLIER_MULTIPLIER * stats.stdDev;

  const currencySymbols = { USD: '$', CAD: 'CA$', GBP: '£', AUD: 'A$' };
  const symbol = currencySymbols[record.currency] ?? record.currency + ' ';
  const formattedAmount = `${symbol}${(record.amountLocal / 1e6).toFixed(2)}M`;

  const prompt = `You are a government transparency analyst. Analyse the following foreign aid record and respond with a JSON object only — no markdown, no explanation outside the JSON.

Aid record:
- Donor country: ${record.country}
- Recipient: ${record.recipientCountry}${record.recipientRegion ? ` (${record.recipientRegion})` : ''}
- Amount: ${formattedAmount} (≈ US$${(record.amountUSD / 1e6).toFixed(2)}M)
- Purpose: ${record.purpose || 'Not specified'}
- Category: ${record.category}
- Department: ${record.department}
- Status: ${record.projectStatus}
- Statistical context: batch mean US$${(stats.mean / 1e6).toFixed(2)}M; this amount is ${isLarge ? 'SIGNIFICANTLY ABOVE' : 'within'} the normal range

Respond with exactly this JSON structure:
{
  "summary": "2-3 sentence plain English summary of what this aid does and why it matters",
  "citizenImpact": "1-2 sentences explaining what this means for taxpayers in the donor country",
  "efficiencyScore": <integer 1-10, where 10 is highly efficient/well-targeted>,
  "efficiencyRationale": "Brief reason for the score",
  "isUnusuallyLarge": <true|false>,
  "unusualFlag": "<null or a one-sentence explanation of why the amount raises questions>"
}`;

  try {
    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-calls': 'true',
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 400,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text().catch(() => '');
      throw new Error(`Claude API ${response.status}: ${err.slice(0, 200)}`);
    }

    const data = await response.json();
    const text = data?.content?.[0]?.text ?? '{}';

    // Extract JSON even if Claude wraps it in markdown fences
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in Claude response');

    const analysis = JSON.parse(jsonMatch[0]);
    return {
      summary:            analysis.summary           ?? '',
      citizenImpact:      analysis.citizenImpact      ?? '',
      efficiencyScore:    Number(analysis.efficiencyScore) || 5,
      efficiencyRationale:analysis.efficiencyRationale ?? '',
      isUnusuallyLarge:   Boolean(analysis.isUnusuallyLarge),
      unusualFlag:        analysis.unusualFlag        ?? null,
      analysedBy:         'claude-ai',
    };
  } catch (e) {
    console.warn(`[foreignAid] Claude analysis failed for "${record.sourceId}":`, e.message);
    return generateFallbackAnalysis(record, stats);
  }
}

/**
 * Rule-based fallback analysis when Claude API is unavailable.
 */
function generateFallbackAnalysis(record, stats) {
  const isUnusuallyLarge =
    stats.mean > 0 && record.amountUSD > stats.mean * OUTLIER_MULTIPLIER;

  const currencySymbols = { USD: '$', CAD: 'CA$', GBP: '£', AUD: 'A$' };
  const symbol = currencySymbols[record.currency] ?? record.currency + ' ';
  const formatted = `${symbol}${(record.amountLocal / 1e6).toFixed(2)}M`;

  const summary = record.purpose
    ? `${record.country === 'UK' ? 'UK' : record.country === 'AU' ? 'Australia' : record.country === 'CA' ? 'Canada' : 'United States'} is providing ${formatted} to ${record.recipientCountry} for ${record.purpose.toLowerCase()}. This falls under the ${record.category} sector and is managed by ${record.department}.`
    : `${formatted} in foreign aid committed to ${record.recipientCountry} under the ${record.category} category. Managed by ${record.department}, status: ${record.projectStatus}.`;

  // Rough efficiency heuristic
  let efficiencyScore = 5;
  const purposeLower = (record.purpose ?? '').toLowerCase();
  if (/health|water|sanitation|education|food/.test(purposeLower)) efficiencyScore += 2;
  if (/infrastructure|governance|reform/.test(purposeLower)) efficiencyScore += 1;
  if (record.projectStatus?.toLowerCase() === 'completed') efficiencyScore += 1;
  if (isUnusuallyLarge) efficiencyScore -= 2;
  efficiencyScore = Math.max(1, Math.min(10, efficiencyScore));

  return {
    summary,
    citizenImpact: `Taxpayers in the donor country are contributing ${formatted} towards international development in ${record.recipientCountry}. The funds are administered by ${record.department}.`,
    efficiencyScore,
    efficiencyRationale: 'Score estimated from purpose category and project status (Claude AI not configured).',
    isUnusuallyLarge,
    unusualFlag: isUnusuallyLarge
      ? `Amount of ${formatted} is more than ${OUTLIER_MULTIPLIER}× the average for this country's aid batch and may warrant further review.`
      : null,
    analysedBy: 'fallback-rules',
  };
}

// ─── Firestore persistence ────────────────────────────────────────────────────

/**
 * Clear existing records for a country and write enriched aid records.
 *
 * @param {Array}  records  — enriched aid records (normalised + analysis)
 * @param {string} country  — ISO country code
 * @returns {Promise<{ saved: number, errors: number }>}
 */
async function saveAidRecords(records, country) {
  const col = collection(db, 'foreign_aid');

  // Delete stale records for this country
  try {
    const stale = await getDocs(query(col, where('country', '==', country)));
    await Promise.all(stale.docs.map((d) => deleteDoc(d.ref)));
    console.log(`[foreignAid] Cleared ${stale.size} stale records for ${country}`);
  } catch (e) {
    console.warn(`[foreignAid] Could not clear stale records for ${country}:`, e.message);
  }

  let saved = 0;
  let errors = 0;

  await Promise.all(
    records.map(async (r) => {
      try {
        await addDoc(col, { ...r, createdAt: serverTimestamp() });
        saved++;
      } catch (e) {
        console.error('[foreignAid] Failed to save record:', e, r.sourceId);
        errors++;
      }
    })
  );

  return { saved, errors };
}

// ─── Country fetcher map ──────────────────────────────────────────────────────

const COUNTRY_FETCHERS = {
  CA: fetchCanada,
  US: fetchUSA,
  UK: fetchUK,
  AU: fetchAustralia,
};

// ─── Main pipeline ────────────────────────────────────────────────────────────

/**
 * Fetch aid data for one country, analyse with Claude, and save to Firestore.
 *
 * @param {string} countryCode — 'CA' | 'US' | 'UK' | 'AU'
 * @returns {Promise<{ country, fetched, analysed, saved, errors }>}
 */
export async function fetchAndSaveCountry(countryCode) {
  const fetcher = COUNTRY_FETCHERS[countryCode];
  if (!fetcher) throw new Error(`[foreignAid] Unknown country code: ${countryCode}`);

  console.log(`[foreignAid] ── Starting ${countryCode} ──────────────────────`);

  // 1. Fetch raw records
  let rawRecords;
  try {
    rawRecords = await fetcher();
    console.log(`[foreignAid] ${countryCode}: fetched ${rawRecords.length} records`);
  } catch (e) {
    console.error(`[foreignAid] ${countryCode}: fetch failed —`, e.message);
    return { country: countryCode, fetched: 0, analysed: 0, saved: 0, errors: 1 };
  }

  if (!rawRecords.length) {
    console.warn(`[foreignAid] ${countryCode}: no records returned`);
    return { country: countryCode, fetched: 0, analysed: 0, saved: 0, errors: 0 };
  }

  // 2. Compute batch statistics for outlier detection
  const stats = batchStats(rawRecords);
  console.log(
    `[foreignAid] ${countryCode}: batch stats — mean US$${(stats.mean / 1e6).toFixed(2)}M, ` +
    `stdDev US$${(stats.stdDev / 1e6).toFixed(2)}M`
  );

  // 3. Analyse each record with Claude (sequentially to respect rate limits)
  const enriched = [];
  for (const record of rawRecords) {
    const analysis = await analyseWithClaude(record, stats);
    enriched.push({ ...record, ...analysis });

    // Brief pause between Claude calls to stay within rate limits
    if (ANTHROPIC_API_KEY) await new Promise((r) => setTimeout(r, 200));
  }

  console.log(`[foreignAid] ${countryCode}: analysed ${enriched.length} records`);

  // Log flagged records
  const flagged = enriched.filter((r) => r.isUnusuallyLarge);
  if (flagged.length) {
    console.warn(`[foreignAid] ${countryCode}: ${flagged.length} unusually large amounts flagged:`);
    flagged.forEach((r) =>
      console.warn(
        `  ⚠ ${r.recipientCountry}: US$${(r.amountUSD / 1e6).toFixed(1)}M — ${r.unusualFlag}`
      )
    );
  }

  // 4. Persist to Firestore
  const { saved, errors } = await saveAidRecords(enriched, countryCode);
  console.log(`[foreignAid] ${countryCode}: saved ${saved} records (${errors} errors)`);

  return {
    country: countryCode,
    fetched: rawRecords.length,
    analysed: enriched.length,
    saved,
    errors,
    flaggedCount: flagged.length,
  };
}

// ─── Top-level runner ─────────────────────────────────────────────────────────

/**
 * Run the full foreign aid fetching pipeline for all (or selected) countries.
 *
 * @param {string[]} [countries] — subset of ['CA','US','UK','AU'] (default: all)
 * @returns {Promise<object[]>} — per-country result summaries
 */
export async function runForeignAidFetcher(countries = Object.keys(COUNTRY_FETCHERS)) {
  if (!ANTHROPIC_API_KEY) {
    console.warn(
      '[foreignAid] REACT_APP_ANTHROPIC_API_KEY not set — Claude analysis will use rule-based fallback.\n' +
      '             Add it to your .env file to enable AI-powered summaries.'
    );
  }

  console.log(`[foreignAid] Starting foreign aid fetch for: ${countries.join(', ')}`);
  const results = [];

  // Run countries sequentially to avoid hammering APIs simultaneously
  for (const country of countries) {
    try {
      const result = await fetchAndSaveCountry(country);
      results.push(result);
    } catch (e) {
      console.error(`[foreignAid] Unhandled error for ${country}:`, e);
      results.push({ country, fetched: 0, analysed: 0, saved: 0, errors: 1 });
    }
  }

  // Summary
  const totalSaved   = results.reduce((s, r) => s + r.saved, 0);
  const totalFlagged = results.reduce((s, r) => s + (r.flaggedCount ?? 0), 0);
  const totalErrors  = results.reduce((s, r) => s + r.errors, 0);

  console.log('\n[foreignAid] ══ Run complete ═══════════════════════════════');
  results.forEach((r) =>
    console.log(
      `  ${r.country}: fetched=${r.fetched} saved=${r.saved} flagged=${r.flaggedCount ?? 0} errors=${r.errors}`
    )
  );
  console.log(`  Total: ${totalSaved} saved, ${totalFlagged} flagged, ${totalErrors} errors`);

  return results;
}

export default runForeignAidFetcher;
