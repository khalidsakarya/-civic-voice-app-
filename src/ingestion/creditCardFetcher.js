/**
 * Government Credit Card & Hospitality Tracker
 *
 * Fetches government credit card and hospitality expense records from four
 * official open-data sources, normalises them into a common schema, runs each
 * record through Claude AI to detect abuse patterns, calculates a Hospitality
 * Abuse Score per department, and saves results to Firestore collection
 * "credit_card_spending".
 *
 * Sources
 * ───────
 *   Canada    : open.canada.ca — Proactive Disclosure: Hospitality Expenses (CKAN)
 *   USA       : api.usaspending.gov — micro-purchases / purchase-card awards
 *   UK        : data.gov.uk — Government Procurement Card spend (CKAN)
 *   Australia : data.gov.au — Commonwealth credit card expenses (CKAN)
 *
 * Claude AI flags per record
 * ──────────────────────────
 *   alcohol         — any alcohol purchase (liquor store, bar, wine merchant)
 *   luxury_dining   — restaurant spend > $150 per person estimate
 *   entertainment   — entertainment venues (theatre, sports, casino, nightclub)
 *   gift_purchase   — gift shops, florists, jewellery, souvenir stores
 *   unrelated       — merchant clearly unrelated to government work
 *
 * Hospitality Abuse Score per department (0–100)
 * ────────────────────────────────────────────────
 *   Composite of flag frequency (weighted by severity) and flagged spend
 *   as a proportion of total department spend. Higher = more abuse risk.
 *
 * Environment variables required
 * ──────────────────────────────
 *   REACT_APP_ANTHROPIC_API_KEY — enables Claude AI analysis
 *   (falls back to keyword-based detection when not set)
 *
 * Usage
 * ─────
 *   import { runCreditCardFetcher } from './ingestion/creditCardFetcher.js';
 *   await runCreditCardFetcher();            // all 4 countries
 *   await runCreditCardFetcher(['CA','UK']); // selected countries only
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
const CLAUDE_MODEL      = 'claude-haiku-4-5-20251001';
const CLAUDE_API_URL    = 'https://api.anthropic.com/v1/messages';

const MAX_RECORDS_PER_COUNTRY = 60;
const LUXURY_DINING_PER_PERSON_USD = 150; // flag threshold per estimated diner
const ASSUMED_ATTENDEES_DEFAULT    = 2;   // used when attendee count is missing

// ─── Flag definitions & weights ───────────────────────────────────────────────

export const FLAGS = {
  ALCOHOL:       'alcohol',        // any alcohol purchase
  LUXURY_DINING: 'luxury_dining',  // restaurant > $150/person
  ENTERTAINMENT: 'entertainment',  // theatre, sports, casino, nightclub
  GIFT:          'gift_purchase',  // gifts, florists, jewellery
  UNRELATED:     'unrelated',      // clearly non-government merchant
};

// Abuse score severity weights (points per flagged record)
const FLAG_WEIGHTS = {
  [FLAGS.ALCOHOL]:       20,
  [FLAGS.LUXURY_DINING]: 18,
  [FLAGS.ENTERTAINMENT]: 15,
  [FLAGS.GIFT]:          22,
  [FLAGS.UNRELATED]:     12,
};

// ─── Merchant keyword classifiers ─────────────────────────────────────────────

const ALCOHOL_KEYWORDS = [
  'liquor', 'wine', 'beer', 'spirits', 'brewery', 'winery', 'distillery',
  'lcbo', 'saq', 'bcliquor', 'nslc', 'aglc', 'bottle shop', 'dan murphy',
  'majestic wine', 'threshers', 'oddbins', 'pub ', ' bar ', 'tavern', 'nightclub',
  'cocktail', 'champagne', 'whisky', 'whiskey', 'vodka', 'gin ', 'rum ',
  'bottleshop', 'cellars', 'wine merchant', 'alcohol',
];

const LUXURY_DINING_KEYWORDS = [
  'restaurant', 'brasserie', 'bistro', 'steakhouse', 'sushi', 'fine dining',
  'grill', 'chophouse', 'nobu', 'gordon ramsay', 'heston', 'maze', 'ritz',
  'ivy ', 'claridges', 'savoy', 'dorchester', 'wolseley', 'zuma',
  'wagyu', 'omakase', 'tasting menu', 'ruth chris', 'capital grille',
  'spago', 'french laundry', 'eleven madison', 'per se',
];

const ENTERTAINMENT_KEYWORDS = [
  'theatre', 'theater', 'cinema', 'movies', 'concert', 'opera', 'ballet',
  'casino', 'gambling', 'poker', 'nightclub', 'club ', 'sports arena',
  'stadium', 'ticketmaster', 'eventbrite', 'stubhub', 'comedy club',
  'amusement', 'theme park', 'golf club', 'golf course', 'country club',
  'spa ', 'massage', 'wellness centre', 'escape room',
];

const GIFT_KEYWORDS = [
  'florist', 'flowers', 'gift shop', 'gifts', 'jewellery', 'jewelry',
  'souvenir', 'trophy', 'engraving', 'hallmark', 'thorntons', 'hotel chocolat',
  'godiva', 'hamper', 'fortnum', 'selfridges gifts', 'bloomingdale',
  'toy', 'greeting card', 'greeting cards',
];

// Merchants that are clearly personal / unrelated to government
const UNRELATED_KEYWORDS = [
  'netflix', 'spotify', 'amazon prime', 'apple store', 'itunes', 'steam ',
  'playstation', 'xbox', 'nintendo', 'gamestop', 'game stop',
  'clothing', 'fashion', 'boutique', 'salon', 'hairdresser', 'barbershop',
  'pet shop', 'petco', 'petsmart', 'gym', 'fitness', 'crossfit',
  'ikea', 'furniture', 'homeware', 'bed bath', 'harvey norman',
  'pharmacy personal', 'cosmetics', 'beauty supply', 'nail salon',
];

function matchesKeywords(text, keywords) {
  const lower = text.toLowerCase();
  return keywords.some((kw) => lower.includes(kw));
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

const USD_RATES = { CAD: 0.72, USD: 1.0, GBP: 1.27, AUD: 0.63 };

function toUSD(amount, currency) {
  return Math.round(amount * (USD_RATES[currency] ?? 1));
}

function safeNum(val) {
  const n = parseFloat(String(val ?? '').replace(/[^0-9.-]/g, ''));
  return isNaN(n) ? 0 : n;
}

function isoDate(str) {
  if (!str) return null;
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d.toISOString().split('T')[0];
}

function truncate(str, len = 200) {
  const s = String(str ?? '');
  return s.length > len ? s.slice(0, len - 1) + '…' : s;
}

function titleCase(str) {
  return String(str ?? '')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

async function fetchJSON(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${url}`);
  return res.json();
}

async function postJSON(url, body, extraHeaders = {}) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...extraHeaders },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} — ${url}: ${txt.slice(0, 200)}`);
  }
  return res.json();
}

// ─── Canada — Proactive Disclosure: Hospitality (open.canada.ca) ──────────────
// Dataset: Proactive Disclosure — Hospitality Expenses
// Package: https://open.canada.ca/data/en/dataset/c50e03ee-94e2-4ad8-ac01-e72db89baa0a
// Fields: owner_org_title, description_en, total_cost, num_attendees,
//         date, attendee_type, purpose
// Docs: https://www.tbs-sct.canada.ca/pol/doc-eng.aspx?id=27600

async function fetchCanada() {
  console.log('[creditCard] Fetching Canada (Proactive Disclosure – Hospitality)...');

  const CKAN     = 'https://open.canada.ca/data/api/3/action';
  const PKG_ID   = 'c50e03ee-94e2-4ad8-ac01-e72db89baa0a';
  // Stable resource id for the hospitality proactive disclosure dataset
  const RES_ID   = 'f51e2dcd-38b3-4edd-b244-1e6e4c5f5a4a';

  let records = [];

  try {
    const url = `${CKAN}/datastore_search?resource_id=${RES_ID}` +
      `&limit=${MAX_RECORDS_PER_COUNTRY}&sort=date desc`;
    const data = await fetchJSON(url);
    records = data?.result?.records ?? [];
  } catch {
    // Discover resource id from package metadata
    try {
      const pkg = await fetchJSON(`${CKAN}/package_show?id=${PKG_ID}`);
      const resources = pkg?.result?.resources ?? [];
      const res = resources.find((r) => r.datastore_active) ?? resources[0];
      if (res?.id) {
        const data = await fetchJSON(
          `${CKAN}/datastore_search?resource_id=${res.id}&limit=${MAX_RECORDS_PER_COUNTRY}&sort=date desc`
        );
        records = data?.result?.records ?? [];
      }
    } catch (e2) {
      console.warn('[creditCard] Canada: package discovery failed:', e2.message);
    }
  }

  // Second fallback: search all proactive-disclosure hospitality resources
  if (!records.length) {
    try {
      const search = await fetchJSON(
        `${CKAN}/resource_search?query=name:hospitality&limit=5`
      );
      const firstRes = search?.result?.results?.[0];
      if (firstRes?.id) {
        const data = await fetchJSON(
          `${CKAN}/datastore_search?resource_id=${firstRes.id}&limit=${MAX_RECORDS_PER_COUNTRY}`
        );
        records = data?.result?.records ?? [];
      }
    } catch (e3) {
      console.warn('[creditCard] Canada: resource search fallback failed:', e3.message);
    }
  }

  return records.map((r) => {
    const amount     = safeNum(r.total_cost ?? r.amount ?? r.cost ?? 0);
    const attendees  = safeNum(r.num_attendees ?? r.attendees ?? ASSUMED_ATTENDEES_DEFAULT) || ASSUMED_ATTENDEES_DEFAULT;
    const merchant   = truncate(r.vendor ?? r.supplier ?? r.establishment ?? r.description_en?.split(/[,;–-]/)[0] ?? 'Unknown', 120);
    const purpose    = truncate(r.description_en ?? r.description ?? r.purpose ?? '');

    return {
      country:         'CA',
      currency:        'CAD',
      sourceId:        String(r._id ?? r.ref_number ?? Math.random()),
      cardholderName:  titleCase(r.name ?? r.cardholder ?? r.employee_name ?? 'Not disclosed'),
      cardholderTitle: titleCase(r.title_en ?? r.position ?? r.job_title ?? ''),
      department:      truncate(r.owner_org_title ?? r.department ?? r.organization ?? 'Unknown', 120),
      merchantName:    merchant,
      amountLocal:     amount,
      amountUSD:       toUSD(amount, 'CAD'),
      date:            isoDate(r.date ?? r.expense_date ?? r.start_date),
      purpose:         purpose,
      attendees,
      perPersonUSD:    attendees > 0 ? Math.round(toUSD(amount, 'CAD') / attendees) : toUSD(amount, 'CAD'),
      sourceUrl:       `https://open.canada.ca/data/en/dataset/${PKG_ID}`,
    };
  });
}

// ─── USA — Government purchase card / micro-purchases (usaspending.gov) ────────
// USASpending tracks purchase card transactions as micro-purchases (≤$10,000)
// and purchase orders. We filter for hospitality-related award descriptions
// across all agencies.
// Endpoint: /api/v2/search/spending_by_award/
// Docs: https://api.usaspending.gov/#/award-spending

async function fetchUSA() {
  console.log('[creditCard] Fetching USA (government purchase card / hospitality)...');

  const url = 'https://api.usaspending.gov/api/v2/search/spending_by_award/';

  // Hospitality and entertainment purchase descriptions
  const keywords = [
    'hotel', 'lodging', 'conference', 'catering', 'restaurant', 'meals',
    'hospitality', 'refreshment', 'reception', 'luncheon', 'dinner',
    'banquet', 'entertainment',
  ];

  let items = [];

  for (const keyword of keywords.slice(0, 4)) { // limit API calls
    try {
      const data = await postJSON(url, {
        filters: {
          time_period: [{ start_date: '2024-10-01', end_date: '2025-09-30' }],
          award_type_codes: ['B', 'purchase_order', '-'],
          description: keyword,
          award_amounts: [{ lower_bound: 1, upper_bound: 50000 }], // micro-purchase range
        },
        fields: [
          'Award ID', 'Recipient Name', 'Award Amount', 'Description',
          'Awarding Agency', 'Awarding Sub Agency',
          'Period of Performance Start Date', 'Type',
        ],
        sort: 'Award Amount',
        order: 'desc',
        limit: Math.ceil(MAX_RECORDS_PER_COUNTRY / 4),
        page: 1,
      });
      const results = data?.results ?? [];
      items.push(...results);
    } catch (e) {
      console.warn(`[creditCard] USA: keyword "${keyword}" search failed:`, e.message);
    }
  }

  // Deduplicate by Award ID
  const seen = new Set();
  items = items.filter((r) => {
    const id = r['Award ID'] ?? JSON.stringify(r);
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  }).slice(0, MAX_RECORDS_PER_COUNTRY);

  return items.map((r, i) => {
    const amount  = safeNum(r['Award Amount'] ?? 0);
    const desc    = truncate(r['Description'] ?? '');
    const agency  = r['Awarding Sub Agency'] ?? r['Awarding Agency'] ?? 'Federal Agency';

    // Estimate attendees from description ("10 attendees", "for 5 people", etc.)
    const attendeeMatch = desc.match(/(\d+)\s*(attendee|person|people|guest|participant)/i);
    const attendees = attendeeMatch ? parseInt(attendeeMatch[1], 10) : ASSUMED_ATTENDEES_DEFAULT;

    return {
      country:         'US',
      currency:        'USD',
      sourceId:        String(r['Award ID'] ?? i),
      cardholderName:  'Not disclosed',   // USASpending does not expose cardholder names
      cardholderTitle: '',
      department:      truncate(agency, 120),
      merchantName:    truncate(r['Recipient Name'] ?? 'Unknown', 120),
      amountLocal:     amount,
      amountUSD:       amount,
      date:            isoDate(r['Period of Performance Start Date']),
      purpose:         desc,
      attendees,
      perPersonUSD:    attendees > 0 ? Math.round(amount / attendees) : amount,
      sourceUrl:       r['Award ID']
        ? `https://www.usaspending.gov/award/${r['Award ID']}/`
        : 'https://www.usaspending.gov',
    };
  });
}

// ─── UK — Government Procurement Card spend (data.gov.uk) ─────────────────────
// Multiple departments publish GPC spend monthly at data.gov.uk.
// We query the Cabinet Office and cross-department GPC datasets.
// Docs: https://www.gov.uk/government/publications/cabinet-office-government-procurement-card-spend
// CKAN API: https://data.gov.uk/api/3/action/

async function fetchUK() {
  console.log('[creditCard] Fetching UK (Government Procurement Card)...');

  const CKAN = 'https://data.gov.uk/api/3/action';

  // Known resource ids for GPC spend datasets on data.gov.uk
  // Cabinet Office GPC spend (most complete cross-department dataset)
  const CANDIDATE_IDS = [
    'b5b9d2f5-ae22-4f30-9f52-cf5d2c1ab6ab', // Cabinet Office GPC spend
    'c4e34cf1-e6e8-4ee7-88f2-f59a3f8befc0', // HMRC GPC
    '6e41d88a-e54c-4b7b-9985-f4e4ee27c15f', // DWP GPC
    'a49fc5a7-ec45-4c1f-a0c7-a3b87a9f6b2e', // DFID/FCDO GPC
  ];

  let records = [];

  for (const resId of CANDIDATE_IDS) {
    if (records.length >= MAX_RECORDS_PER_COUNTRY) break;
    try {
      const data = await fetchJSON(
        `${CKAN}/datastore_search?resource_id=${resId}` +
        `&limit=${Math.ceil(MAX_RECORDS_PER_COUNTRY / 2)}&sort=amount desc`
      );
      const rows = data?.result?.records ?? [];
      if (rows.length) {
        records.push(...rows);
        console.log(`[creditCard] UK: got ${rows.length} records from resource ${resId}`);
      }
    } catch {
      // silently try next
    }
  }

  // Fallback: search data.gov.uk for GPC datasets
  if (!records.length) {
    try {
      const search = await fetchJSON(
        `${CKAN}/package_search?q=government+procurement+card+spend&rows=5`
      );
      const packages = search?.result?.results ?? [];
      for (const pkg of packages) {
        if (records.length >= MAX_RECORDS_PER_COUNTRY) break;
        const res = (pkg?.resources ?? []).find((r) => r.datastore_active);
        if (res?.id) {
          try {
            const data = await fetchJSON(
              `${CKAN}/datastore_search?resource_id=${res.id}&limit=20&sort=amount desc`
            );
            records.push(...(data?.result?.records ?? []));
          } catch { /* continue */ }
        }
      }
    } catch (e) {
      console.warn('[creditCard] UK: package search fallback failed:', e.message);
    }
  }

  return records.slice(0, MAX_RECORDS_PER_COUNTRY).map((r) => {
    const amount    = safeNum(r.amount ?? r.Amount ?? r.spend ?? r.value ?? r.total ?? 0);
    const currency  = r.currency ?? 'GBP';
    const merchant  = truncate(
      r.merchant ?? r.Merchant ?? r.supplier ?? r.vendor ?? r.description ?? 'Unknown', 120
    );
    const dept      = truncate(
      r.department ?? r.Department ?? r.organisation ?? r.body ?? 'Unknown', 120
    );
    const holder    = titleCase(
      r.cardholder ?? r.name ?? r.employee ?? r.officer ?? 'Not disclosed'
    );
    const holderTitle = titleCase(r.grade ?? r.job_title ?? r.title ?? r.role ?? '');
    const purpose   = truncate(r.description ?? r.purpose ?? r.category ?? r.expense_type ?? '');
    const attendees = safeNum(r.attendees ?? r.guests ?? ASSUMED_ATTENDEES_DEFAULT) || ASSUMED_ATTENDEES_DEFAULT;

    return {
      country:         'UK',
      currency,
      sourceId:        String(r._id ?? r.id ?? r.ref ?? Math.random()),
      cardholderName:  holder,
      cardholderTitle: holderTitle,
      department:      dept,
      merchantName:    merchant,
      amountLocal:     amount,
      amountUSD:       toUSD(amount, currency),
      date:            isoDate(r.date ?? r.Date ?? r.expense_date ?? r.period),
      purpose,
      attendees,
      perPersonUSD:    attendees > 0 ? Math.round(toUSD(amount, currency) / attendees) : toUSD(amount, currency),
      sourceUrl:       'https://data.gov.uk/search?q=government+procurement+card',
    };
  });
}

// ─── Australia — Commonwealth credit card expenses (data.gov.au) ──────────────
// Australian Government entities publish credit card usage under PGPA Act.
// Source: finance.gov.au credit card reporting + data.gov.au open datasets
// Docs: https://www.finance.gov.au/government/managing-commonwealth-resources/
//       managing-risks-fraud-and-corruption/credit-card-use

async function fetchAustralia() {
  console.log('[creditCard] Fetching Australia (Commonwealth credit card)...');

  const CKAN = 'https://data.gov.au/api/3/action';

  // Known resource ids for credit card expense datasets
  const CANDIDATE_IDS = [
    '82da5f21-6e41-4d25-9b28-8abc09a28c4a', // Finance Dept credit card spending
    'c9b09a4c-8e2b-4d57-8bc4-c62d5a31f1c9', // APS credit card expenses
    'e6e97ff2-d51f-4fe3-af24-af6d91a12c87', // Dept of Home Affairs GPC
    'f0c5a8b3-9e42-4f8d-b721-3e8aa7c2d5f1', // PM&C hospitality
  ];

  let records = [];

  for (const resId of CANDIDATE_IDS) {
    if (records.length >= MAX_RECORDS_PER_COUNTRY) break;
    try {
      const data = await fetchJSON(
        `${CKAN}/datastore_search?resource_id=${resId}` +
        `&limit=${Math.ceil(MAX_RECORDS_PER_COUNTRY / 2)}&sort=amount desc`
      );
      const rows = data?.result?.records ?? [];
      if (rows.length) {
        records.push(...rows);
        console.log(`[creditCard] AU: got ${rows.length} records from resource ${resId}`);
      }
    } catch { /* try next */ }
  }

  // Fallback: search data.gov.au for credit card datasets
  if (!records.length) {
    try {
      const pkgSearch = await fetchJSON(
        `${CKAN}/package_search?q=credit+card+expenses+government&rows=8`
      );
      const packages = pkgSearch?.result?.results ?? [];
      for (const pkg of packages) {
        if (records.length >= MAX_RECORDS_PER_COUNTRY) break;
        const res = (pkg?.resources ?? []).find((r) => r.datastore_active);
        if (!res?.id) continue;
        try {
          const data = await fetchJSON(
            `${CKAN}/datastore_search?resource_id=${res.id}&limit=20&sort=amount desc`
          );
          records.push(...(data?.result?.records ?? []));
        } catch { /* continue */ }
      }
    } catch (e) {
      console.warn('[creditCard] AU: package search fallback failed:', e.message);
    }
  }

  // Second fallback: finance.gov.au published CSV
  if (!records.length) {
    try {
      const csvRes = await fetch(
        'https://www.finance.gov.au/sites/default/files/2025-02/credit-card-data-2024-25.csv'
      );
      if (csvRes.ok) {
        const text    = await csvRes.text();
        const lines   = text.trim().split('\n').filter(Boolean);
        const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/\s+/g, '_').replace(/"/g, ''));
        records = lines.slice(1, MAX_RECORDS_PER_COUNTRY + 1).map((line) => {
          const vals = line.split(',').map((v) => v.replace(/^"|"$/g, '').trim());
          return Object.fromEntries(headers.map((h, i) => [h, vals[i] ?? '']));
        });
      }
    } catch (e2) {
      console.warn('[creditCard] AU: finance.gov.au CSV fallback failed:', e2.message);
    }
  }

  return records.slice(0, MAX_RECORDS_PER_COUNTRY).map((r) => {
    const amount    = safeNum(r.amount ?? r.Amount ?? r.total ?? r.value ?? r.cost ?? 0);
    const merchant  = truncate(
      r.merchant ?? r.vendor ?? r.supplier ?? r.establishment ?? 'Unknown', 120
    );
    const dept      = truncate(
      r.agency ?? r.department ?? r.entity ?? r.organisation ?? 'Unknown', 120
    );
    const holder    = titleCase(r.cardholder ?? r.name ?? r.officer ?? 'Not disclosed');
    const holderTitle = titleCase(r.title ?? r.classification ?? r.aps_level ?? r.role ?? '');
    const purpose   = truncate(r.purpose ?? r.description ?? r.reason ?? r.category ?? '');
    const attendees = safeNum(r.attendees ?? r.guests ?? r.number_of_people ?? ASSUMED_ATTENDEES_DEFAULT) || ASSUMED_ATTENDEES_DEFAULT;

    return {
      country:         'AU',
      currency:        'AUD',
      sourceId:        String(r._id ?? r.id ?? r.ref ?? Math.random()),
      cardholderName:  holder,
      cardholderTitle: holderTitle,
      department:      dept,
      merchantName:    merchant,
      amountLocal:     amount,
      amountUSD:       toUSD(amount, 'AUD'),
      date:            isoDate(r.date ?? r.expense_date ?? r.transaction_date ?? r.period),
      purpose,
      attendees,
      perPersonUSD:    attendees > 0 ? Math.round(toUSD(amount, 'AUD') / attendees) : toUSD(amount, 'AUD'),
      sourceUrl:       'https://www.finance.gov.au/government/managing-commonwealth-resources/managing-risks-fraud-and-corruption/credit-card-use',
    };
  });
}

// ─── Rule-based flag detection ────────────────────────────────────────────────

/**
 * Apply keyword rules to detect likely abuse flags without calling Claude.
 * @param {object} record — normalised card expense record
 * @returns {string[]} array of flag keys
 */
function detectRuleFlags(record) {
  const flags   = [];
  const text    = `${record.merchantName} ${record.purpose}`.toLowerCase();
  const amount  = record.amountUSD;
  const perPerson = record.perPersonUSD;

  if (matchesKeywords(text, ALCOHOL_KEYWORDS)) {
    flags.push(FLAGS.ALCOHOL);
  }

  if (
    matchesKeywords(text, LUXURY_DINING_KEYWORDS) &&
    perPerson >= LUXURY_DINING_PER_PERSON_USD
  ) {
    flags.push(FLAGS.LUXURY_DINING);
  }

  if (matchesKeywords(text, ENTERTAINMENT_KEYWORDS)) {
    flags.push(FLAGS.ENTERTAINMENT);
  }

  if (matchesKeywords(text, GIFT_KEYWORDS) && amount > 20) {
    flags.push(FLAGS.GIFT);
  }

  if (matchesKeywords(text, UNRELATED_KEYWORDS)) {
    flags.push(FLAGS.UNRELATED);
  }

  return [...new Set(flags)];
}

// ─── Claude AI analysis ───────────────────────────────────────────────────────

async function analyseWithClaude(record, ruleFlags) {
  if (!ANTHROPIC_API_KEY) {
    return buildFallbackAnalysis(record, ruleFlags);
  }

  const sym = { USD: '$', CAD: 'CA$', GBP: '£', AUD: 'A$' };
  const s   = sym[record.currency] ?? record.currency + ' ';
  const fmtLocal   = `${s}${record.amountLocal.toFixed(2)}`;
  const perPersonFmt = `US$${record.perPersonUSD}`;
  const ruleNote   = ruleFlags.length
    ? `Rule-based pre-screening flagged: ${ruleFlags.join(', ')}.`
    : 'No flags from keyword rules.';

  const prompt = `You are a government ethics and expense auditor. Analyse this government credit card or hospitality expense record for potential misuse. Respond with ONLY a JSON object — no markdown, no extra text.

Expense record:
- Country: ${record.country}
- Cardholder: ${record.cardholderName}${record.cardholderTitle ? ` (${record.cardholderTitle})` : ''}
- Department: ${record.department}
- Merchant: ${record.merchantName}
- Amount: ${fmtLocal} (≈ US$${record.amountUSD.toFixed(2)})
- Estimated per person: ${perPersonFmt} (${record.attendees} attendee(s))
- Date: ${record.date ?? 'Unknown'}
- Stated purpose: ${record.purpose || 'Not provided'}
- ${ruleNote}

Flag definitions you must evaluate:
  alcohol        — purchase at a liquor store, bar, wine merchant, or any alcohol vendor
  luxury_dining  — restaurant/dining where estimated cost per person exceeds $150 USD
  entertainment  — theatre, sports events, casino, nightclub, spa, golf club, concert
  gift_purchase  — gifts, flowers, jewellery, hampers, chocolates not for a work event
  unrelated      — merchant clearly unrelated to any legitimate government function

Respond with EXACTLY this JSON (no other text):
{
  "wasteFlags": [],
  "flagRationale": "One sentence per flag explaining why it was raised, or null if none",
  "summary": "2 sentences: what was purchased and whether it appears justified",
  "citizenImpact": "1 sentence on what this means for taxpayers",
  "isConcerning": true|false,
  "recommendedAction": "Approve|Review|Escalate"
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

    if (!response.ok) throw new Error(`Claude API ${response.status}`);

    const data  = await response.json();
    const text  = data?.content?.[0]?.text ?? '{}';
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('No JSON in Claude response');

    const ai       = JSON.parse(match[0]);
    const allFlags = [...new Set([...(ai.wasteFlags ?? []), ...ruleFlags])];

    return {
      wasteFlags:          allFlags,
      flagRationale:       ai.flagRationale       ?? null,
      summary:             ai.summary             ?? '',
      citizenImpact:       ai.citizenImpact        ?? '',
      isConcerning:        Boolean(ai.isConcerning) || allFlags.length > 0,
      recommendedAction:   ai.recommendedAction    ?? (allFlags.length > 1 ? 'Escalate' : allFlags.length ? 'Review' : 'Approve'),
      analysedBy:          'claude-ai',
    };
  } catch (e) {
    console.warn(`[creditCard] Claude failed for "${record.sourceId}":`, e.message);
    return buildFallbackAnalysis(record, ruleFlags);
  }
}

function buildFallbackAnalysis(record, ruleFlags) {
  const sym = { USD: '$', CAD: 'CA$', GBP: '£', AUD: 'A$' };
  const s   = sym[record.currency] ?? record.currency + ' ';
  const fmt = `${s}${record.amountLocal.toFixed(2)}`;

  const descriptions = {
    [FLAGS.ALCOHOL]:       `Merchant "${record.merchantName}" matches alcohol vendor keywords.`,
    [FLAGS.LUXURY_DINING]: `Estimated US$${record.perPersonUSD}/person exceeds the $${LUXURY_DINING_PER_PERSON_USD} luxury dining threshold.`,
    [FLAGS.ENTERTAINMENT]: `Merchant "${record.merchantName}" matches entertainment venue keywords.`,
    [FLAGS.GIFT]:          `Merchant "${record.merchantName}" matches gift/florist keywords.`,
    [FLAGS.UNRELATED]:     `Merchant "${record.merchantName}" appears unrelated to government operations.`,
  };

  const rationale = ruleFlags.map((f) => descriptions[f] ?? f).join(' ');

  const action = ruleFlags.length > 2 ? 'Escalate'
    : ruleFlags.length > 0 ? 'Review'
    : 'Approve';

  return {
    wasteFlags:        ruleFlags,
    flagRationale:     rationale || null,
    summary:           `${record.cardholderName} (${record.department}) spent ${fmt} at "${record.merchantName}"` +
      (record.purpose ? ` for: ${record.purpose}.` : '.') +
      (ruleFlags.length ? ` Flagged for: ${ruleFlags.join(', ')}.` : ''),
    citizenImpact:     `Taxpayers funded ${fmt} for this government card expense` +
      (ruleFlags.length ? ' — flagged for potential misuse.' : '.'),
    isConcerning:      ruleFlags.length > 0,
    recommendedAction: action,
    analysedBy:        'fallback-rules',
  };
}

// ─── Hospitality Abuse Score per department ───────────────────────────────────

/**
 * Calculate Hospitality Abuse Scores (0–100) grouped by department.
 *
 * Algorithm:
 *   A) Flag-frequency component (0–60):
 *      weighted flag count / (max weight × record count) × 60 × sensitivity
 *   B) Value-exposure component (0–40):
 *      flagged spend / total spend × 40
 *
 * @param {object[]} enriched — records with wasteFlags and department fields
 * @returns {object[]} — array of { department, country, score, grade, ... }
 */
function calcDepartmentScores(enriched) {
  // Group by department + country
  const groups = {};
  for (const r of enriched) {
    const key = `${r.country}::${r.department}`;
    if (!groups[key]) groups[key] = { department: r.department, country: r.country, records: [] };
    groups[key].records.push(r);
  }

  return Object.values(groups).map(({ department, country, records }) => {
    const totalSpend   = records.reduce((s, r) => s + r.amountUSD, 0);
    const flagged      = records.filter((r) => r.wasteFlags?.length > 0);
    const flaggedSpend = flagged.reduce((s, r) => s + r.amountUSD, 0);

    // A) Frequency
    const maxWeight    = Math.max(...Object.values(FLAG_WEIGHTS));
    const maxPossible  = records.length * maxWeight;
    const actualWeight = records.reduce(
      (s, r) => s + (r.wasteFlags ?? []).reduce((ws, f) => ws + (FLAG_WEIGHTS[f] ?? 5), 0), 0
    );
    const freqScore    = maxPossible > 0
      ? Math.min(60, (actualWeight / maxPossible) * 60 * 4)
      : 0;

    // B) Value exposure
    const valueScore   = totalSpend > 0
      ? Math.min(40, (flaggedSpend / totalSpend) * 40)
      : 0;

    const score = Math.round(freqScore + valueScore);

    // Flag type breakdown
    const breakdown = Object.values(FLAGS).reduce((acc, f) => {
      acc[f] = records.filter((r) => r.wasteFlags?.includes(f)).length;
      return acc;
    }, {});

    // Top flagged records for the summary
    const topFlagged = flagged
      .sort((a, b) => b.amountUSD - a.amountUSD)
      .slice(0, 3)
      .map((r) => `${r.merchantName} (US$${r.amountUSD.toFixed(2)}, flags: ${r.wasteFlags.join(',')})`);

    const grade =
      score >= 70 ? 'F — Serious Abuse Risk' :
      score >= 50 ? 'D — High Concern' :
      score >= 30 ? 'C — Moderate Concern' :
      score >= 15 ? 'B — Minor Concerns' :
                    'A — Acceptable';

    return {
      docType:         'departmentScore',
      department,
      country,
      abuseScore:      score,
      grade,
      totalRecords:    records.length,
      flaggedRecords:  flagged.length,
      flagRate:        records.length > 0 ? Math.round((flagged.length / records.length) * 100) : 0,
      totalSpendUSD:   totalSpend,
      flaggedSpendUSD: flaggedSpend,
      breakdown,
      topFlaggedItems: topFlagged,
    };
  });
}

// ─── Firestore persistence ────────────────────────────────────────────────────

async function saveRecords(enriched, departmentScores, country) {
  const col = collection(db, 'credit_card_spending');

  // Clear stale records for this country
  try {
    const stale = await getDocs(query(col, where('country', '==', country)));
    await Promise.all(stale.docs.map((d) => deleteDoc(d.ref)));
    console.log(`[creditCard] Cleared ${stale.size} stale records for ${country}`);
  } catch (e) {
    console.warn(`[creditCard] Could not clear stale records for ${country}:`, e.message);
  }

  let saved = 0, errors = 0;

  // Write individual expense records
  await Promise.all(
    enriched.map(async (r) => {
      try {
        await addDoc(col, { ...r, docType: 'expense', createdAt: serverTimestamp() });
        saved++;
      } catch (e) {
        console.error('[creditCard] Failed to save expense record:', r.sourceId, e.message);
        errors++;
      }
    })
  );

  // Write department abuse scores
  await Promise.all(
    departmentScores.map(async (ds) => {
      try {
        await addDoc(col, { ...ds, createdAt: serverTimestamp() });
        saved++;
      } catch (e) {
        console.error('[creditCard] Failed to save dept score:', ds.department, e.message);
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

// ─── Per-country pipeline ─────────────────────────────────────────────────────

export async function fetchAndSaveCountry(countryCode) {
  const fetcher = COUNTRY_FETCHERS[countryCode];
  if (!fetcher) throw new Error(`[creditCard] Unknown country: ${countryCode}`);

  console.log(`[creditCard] ── Starting ${countryCode} ────────────────────────`);

  // 1. Fetch
  let raw;
  try {
    raw = await fetcher();
    console.log(`[creditCard] ${countryCode}: fetched ${raw.length} records`);
  } catch (e) {
    console.error(`[creditCard] ${countryCode}: fetch failed —`, e.message);
    return { country: countryCode, fetched: 0, analysed: 0, saved: 0, errors: 1 };
  }

  if (!raw.length) {
    console.warn(`[creditCard] ${countryCode}: no records returned`);
    return { country: countryCode, fetched: 0, analysed: 0, saved: 0, errors: 0 };
  }

  // 2. Rule-flag + Claude analysis
  const enriched = [];
  for (const record of raw) {
    const ruleFlags = detectRuleFlags(record);
    const analysis  = await analyseWithClaude(record, ruleFlags);
    enriched.push({ ...record, ...analysis });
    if (ANTHROPIC_API_KEY) await new Promise((r) => setTimeout(r, 200));
  }

  // 3. Compute department scores
  const departmentScores = calcDepartmentScores(enriched);

  // Log summary
  const flaggedCount = enriched.filter((r) => r.wasteFlags?.length).length;
  console.log(`[creditCard] ${countryCode}: ${flaggedCount}/${raw.length} records flagged`);

  departmentScores
    .filter((ds) => ds.abuseScore >= 15)
    .sort((a, b) => b.abuseScore - a.abuseScore)
    .forEach((ds) =>
      console.warn(
        `  ⚠ ${ds.department}: Abuse Score ${ds.abuseScore}/100 — ${ds.grade}` +
        ` (${ds.flaggedRecords}/${ds.totalRecords} flagged, US$${ds.flaggedSpendUSD.toFixed(0)} exposed)`
      )
    );

  // Log each flagged record
  enriched
    .filter((r) => r.wasteFlags?.length)
    .forEach((r) =>
      console.warn(
        `  ⚑ [${r.wasteFlags.join(',')}] ${r.merchantName} | ` +
        `${r.cardholderName} | US$${r.amountUSD.toFixed(2)} | ${r.department.slice(0, 50)}`
      )
    );

  // 4. Persist
  const { saved, errors } = await saveRecords(enriched, departmentScores, countryCode);
  console.log(`[creditCard] ${countryCode}: saved ${saved} docs (${errors} errors)`);

  const topScore = departmentScores.sort((a, b) => b.abuseScore - a.abuseScore)[0];

  return {
    country:         countryCode,
    fetched:         raw.length,
    analysed:        enriched.length,
    saved,
    errors,
    flaggedCount,
    departments:     departmentScores.length,
    topDepartment:   topScore?.department ?? null,
    topAbuseScore:   topScore?.abuseScore ?? 0,
    topGrade:        topScore?.grade ?? null,
  };
}

// ─── Top-level runner ─────────────────────────────────────────────────────────

/**
 * Run the full credit card & hospitality tracker for all (or selected) countries.
 *
 * @param {string[]} [countries] — subset of ['CA','US','UK','AU'] (default: all)
 * @returns {Promise<object[]>}
 */
export async function runCreditCardFetcher(countries = Object.keys(COUNTRY_FETCHERS)) {
  if (!ANTHROPIC_API_KEY) {
    console.warn(
      '[creditCard] REACT_APP_ANTHROPIC_API_KEY not set — using keyword-based detection.\n' +
      '             Add the key to .env for Claude AI-enhanced analysis.'
    );
  }

  console.log(`[creditCard] Starting tracker for: ${countries.join(', ')}`);
  const results = [];

  for (const country of countries) {
    try {
      results.push(await fetchAndSaveCountry(country));
    } catch (e) {
      console.error(`[creditCard] Unhandled error for ${country}:`, e);
      results.push({ country, fetched: 0, analysed: 0, saved: 0, errors: 1 });
    }
  }

  // Summary table
  console.log('\n[creditCard] ══ Run complete ════════════════════════════════════');
  console.log('  Country │ Fetched │ Flagged │ Top Department                  │ Abuse Score');
  console.log('  ────────┼─────────┼─────────┼─────────────────────────────────┼────────────');
  results.forEach((r) =>
    console.log(
      `  ${r.country?.padEnd(7)} │ ${String(r.fetched).padEnd(7)} │` +
      ` ${String(r.flaggedCount ?? 0).padEnd(7)} │` +
      ` ${(r.topDepartment ?? 'N/A').slice(0, 31).padEnd(31)} │ ${r.topAbuseScore ?? 'N/A'}`
    )
  );

  return results;
}

export default runCreditCardFetcher;
