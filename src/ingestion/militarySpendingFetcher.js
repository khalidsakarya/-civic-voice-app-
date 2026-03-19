/**
 * Military Spending Tracker
 *
 * Fetches defence/military spending records from four government open-data
 * APIs, normalises them into a common schema, runs each batch through Claude AI
 * to detect waste patterns, calculates a Military Waste Score per country, and
 * saves results to Firestore collection "military_spending".
 *
 * Sources
 * ───────
 *   Canada    : open.canada.ca — proactive disclosure contracts (DND)
 *   USA       : api.usaspending.gov — awards filtered by Dept of Defense
 *   UK        : contractsfinder.service.gov.uk — MOD contract notices
 *   Australia : data.gov.au / AusTender API — Dept of Defence contracts
 *
 * Claude AI flags per record
 * ──────────────────────────
 *   • Food / catering contracts above $100K
 *   • Luxury hotel or hospitality spending
 *   • Equipment purchases that appear above market rate
 *   • Sole-source (non-competitive) defence contracts
 *   • Unusual non-military spending categories
 *
 * Military Waste Score per country
 * ────────────────────────────────
 *   0–100 composite score derived from:
 *     - % of records flagged
 *     - severity weights per flag type
 *     - flagged dollar value as % of total spend
 *   Higher = more potential waste detected.
 *
 * Environment variables required
 * ──────────────────────────────
 *   REACT_APP_ANTHROPIC_API_KEY — enables Claude AI analysis
 *   (falls back to rule-based detection when not set)
 *
 * Usage
 * ─────
 *   import { runMilitarySpendingFetcher } from './ingestion/militarySpendingFetcher.js';
 *   await runMilitarySpendingFetcher();           // all 4 countries
 *   await runMilitarySpendingFetcher(['US','UK']); // selected only
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

const MAX_RECORDS_PER_COUNTRY = 50;

// Flag thresholds
const FOOD_FLAG_THRESHOLD_USD    = 100_000;  // catering above this is flagged
const SOLE_SOURCE_FLAG_USD       = 500_000;  // sole-source above this is flagged
const NONMILITARY_FLAG_USD       = 50_000;   // non-military category above this

// Waste score severity weights (points per occurrence)
const WASTE_WEIGHTS = {
  food_catering:     12,
  luxury_hotel:      15,
  above_market:      18,
  sole_source:       10,
  non_military:       8,
};

// ─── Spending categories ──────────────────────────────────────────────────────

export const CATEGORIES = {
  EQUIPMENT:      'equipment',
  PERSONNEL:      'personnel',
  FOOD:           'food',
  CATERING:       'catering',
  TRAVEL:         'travel',
  CONTRACTS:      'contracts',
  INFRASTRUCTURE: 'infrastructure',
  IT:             'it',
  MAINTENANCE:    'maintenance',
  FUEL:           'fuel',
  MEDICAL:        'medical',
  RESEARCH:       'research',
  OTHER:          'other',
};

// Keywords used to classify categories from description text
const CATEGORY_KEYWORDS = {
  [CATEGORIES.FOOD]:           ['food', 'catering', 'meal', 'ration', 'dining', 'canteen', 'beverage', 'restaurant'],
  [CATEGORIES.CATERING]:       ['catering', 'banquet', 'hospitality', 'event food', 'refreshment'],
  [CATEGORIES.TRAVEL]:         ['travel', 'hotel', 'accommodation', 'flight', 'airfare', 'transport', 'per diem', 'vehicle hire'],
  [CATEGORIES.EQUIPMENT]:      ['equipment', 'weapon', 'vehicle', 'aircraft', 'vessel', 'ammunition', 'radar', 'missile', 'rifle', 'helicopter', 'tank', 'armour', 'uniform', 'hardware'],
  [CATEGORIES.PERSONNEL]:      ['salary', 'wages', 'personnel', 'staffing', 'payroll', 'recruitment', 'training', 'workforce'],
  [CATEGORIES.IT]:             ['software', 'cyber', 'it service', 'technology', 'computing', 'network', 'digital', 'cloud'],
  [CATEGORIES.INFRASTRUCTURE]: ['construction', 'building', 'base', 'barracks', 'facility', 'installation', 'infrastructure'],
  [CATEGORIES.MAINTENANCE]:    ['maintenance', 'repair', 'service', 'overhaul', 'upkeep', 'sustainment'],
  [CATEGORIES.FUEL]:           ['fuel', 'energy', 'petroleum', 'diesel', 'aviation fuel', 'kerosene'],
  [CATEGORIES.MEDICAL]:        ['medical', 'health', 'pharmaceutical', 'hospital', 'clinic', 'dental'],
  [CATEGORIES.RESEARCH]:       ['research', 'r&d', 'development', 'study', 'analysis', 'science'],
};

function classifyCategory(description = '', suppliedCategory = '') {
  const text = (description + ' ' + suppliedCategory).toLowerCase();
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => text.includes(kw))) return cat;
  }
  return CATEGORIES.OTHER;
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

function truncate(str, len = 300) {
  const s = String(str ?? '');
  return s.length > len ? s.slice(0, len - 1) + '…' : s;
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

// ─── Canada — DND proactive disclosure (open.canada.ca) ──────────────────────
// Dataset: Proactive Disclosure – Contracts
// Filtered to owner organisation: National Defence (DND)
// Docs: https://open.canada.ca/data/en/dataset/d8f85d91-7dec-4fd1-8055-483b77225d8b

async function fetchCanada() {
  console.log('[militarySpending] Fetching Canada (DND)...');

  const CKAN = 'https://open.canada.ca/data/api/3/action';
  // Known resource id for the proactive-disclosure contracts dataset
  const RESOURCE_ID = 'd2203bbd-5279-4f05-9baf-e506f7f76c11';

  let records = [];

  try {
    // Filter server-side to National Defence rows
    const encoded = encodeURIComponent(JSON.stringify({ owner_org_title: 'National Defence' }));
    const url = `${CKAN}/datastore_search?resource_id=${RESOURCE_ID}&filters=${encoded}&limit=${MAX_RECORDS_PER_COUNTRY}&sort=contract_date desc`;
    const data = await fetchJSON(url);
    records = data?.result?.records ?? [];
  } catch (e) {
    console.warn('[militarySpending] Canada: primary resource failed, trying package lookup:', e.message);
    try {
      // Discover resource id via package
      const pkg = await fetchJSON(`${CKAN}/package_show?id=d8f85d91-7dec-4fd1-8055-483b77225d8b`);
      const res = (pkg?.result?.resources ?? []).find((r) => r.datastore_active) ?? pkg?.result?.resources?.[0];
      if (res?.id) {
        const url2 = `${CKAN}/datastore_search?resource_id=${res.id}&limit=${MAX_RECORDS_PER_COUNTRY}&sort=contract_date desc`;
        const data2 = await fetchJSON(url2);
        records = data2?.result?.records ?? [];
      }
    } catch (e2) {
      console.warn('[militarySpending] Canada: package lookup also failed:', e2.message);
    }
  }

  return records.map((r) => {
    const amount = safeNum(r.contract_value ?? r.amendment_value ?? r.original_value ?? 0);
    const desc   = truncate(r.description_of_work ?? r.description ?? r.contract_description ?? '');
    return {
      country:       'CA',
      currency:      'CAD',
      sourceId:      String(r._id ?? r.contract_id ?? r.reference_number ?? Math.random()),
      vendorName:    truncate(r.vendor_name ?? r.supplier_name ?? r.contractor ?? 'Unknown', 150),
      description:   desc,
      category:      classifyCategory(desc, r.commodity_type ?? r.category ?? ''),
      amountLocal:   amount,
      amountUSD:     toUSD(amount, 'CAD'),
      date:          isoDate(r.contract_date ?? r.award_date ?? r.start_date),
      department:    r.owner_org_title ?? r.department ?? 'National Defence (DND)',
      procurementType: (r.procurement_strategy ?? r.solicitation_procedure ?? '').toLowerCase(),
      contractPeriodStart: isoDate(r.start_date ?? r.contract_date),
      contractPeriodEnd:   isoDate(r.end_date ?? r.expiry_date),
      sourceUrl:     `https://open.canada.ca/data/en/dataset/d8f85d91-7dec-4fd1-8055-483b77225d8b`,
    };
  });
}

// ─── USA — Department of Defense (usaspending.gov) ────────────────────────────
// Endpoint: /api/v2/search/spending_by_category/recipient_duns/
// Filtered to DoD top-tier agency (089)
// Docs: https://api.usaspending.gov/#/category-spending

async function fetchUSA() {
  console.log('[militarySpending] Fetching USA (DoD)...');

  // First try: spending by recipient under DoD
  const categoryUrl = 'https://api.usaspending.gov/api/v2/search/spending_by_category/recipient_duns/';
  const awardsUrl   = 'https://api.usaspending.gov/api/v2/search/spending_by_award/';

  const dodFilter = {
    agencies: [{ type: 'awarding', tier: 'toptier', name: 'Department of Defense' }],
    time_period: [{ start_date: '2024-10-01', end_date: '2025-09-30' }],
  };

  let items = [];

  try {
    const data = await postJSON(categoryUrl, {
      filters: dodFilter,
      category: 'recipient_duns',
      limit: MAX_RECORDS_PER_COUNTRY,
      page: 1,
    });
    items = data?.results ?? [];

    // If category endpoint gives aggregate rows, fall through to awards search
    if (!items.length || !items[0]?.award_id) throw new Error('no award-level detail');
  } catch {
    // Fallback: awards search for granular contract records
    try {
      const data = await postJSON(awardsUrl, {
        filters: {
          ...dodFilter,
          award_type_codes: ['A', 'B', 'C', 'D'], // contracts
        },
        fields: [
          'Award ID', 'Recipient Name', 'Award Amount', 'Description',
          'Awarding Agency', 'Period of Performance Start Date',
          'Period of Performance Current End Date', 'Type',
          'Funding Agency', 'Place of Performance State Code',
        ],
        sort: 'Award Amount',
        order: 'desc',
        limit: MAX_RECORDS_PER_COUNTRY,
        page: 1,
      });
      items = data?.results ?? [];
    } catch (e2) {
      console.warn('[militarySpending] USA: awards search also failed:', e2.message);
    }
  }

  return items.map((r, i) => {
    // Handle both category-aggregate and awards-search shapes
    const amount  = safeNum(r['Award Amount'] ?? r.aggregated_amount ?? r.amount ?? 0);
    const vendor  = truncate(r['Recipient Name'] ?? r.name ?? r.recipient_name ?? 'Unknown', 150);
    const desc    = truncate(r['Description'] ?? r.description ?? r.name ?? '');
    const procType = (r['Type'] ?? r.type ?? '').toUpperCase();

    return {
      country:       'US',
      currency:      'USD',
      sourceId:      String(r['Award ID'] ?? r.id ?? r.code ?? i),
      vendorName:    vendor,
      description:   desc,
      category:      classifyCategory(desc, r.category ?? ''),
      amountLocal:   amount,
      amountUSD:     amount,
      date:          isoDate(r['Period of Performance Start Date'] ?? r.start_date ?? '2025-01-01'),
      department:    r['Awarding Agency'] ?? r.awarding_agency ?? 'Department of Defense',
      procurementType: procType.includes('IDV') ? 'indefinite delivery' :
                       procType === 'A' ? 'bpa call' :
                       procType === 'B' ? 'purchase order' :
                       procType === 'C' ? 'delivery order' :
                       procType === 'D' ? 'definitive contract' : procType.toLowerCase(),
      contractPeriodStart: isoDate(r['Period of Performance Start Date']),
      contractPeriodEnd:   isoDate(r['Period of Performance Current End Date']),
      sourceUrl: r['Award ID']
        ? `https://www.usaspending.gov/award/${r['Award ID']}/`
        : 'https://www.usaspending.gov/search/?agency=DoD',
    };
  });
}

// ─── UK — Ministry of Defence (Contracts Finder) ──────────────────────────────
// Endpoint: contractsfinder.service.gov.uk REST API
// Filtered to MOD as the contracting authority
// Docs: https://www.contractsfinder.service.gov.uk/apidocumentation/Notices/v1/it-operations-dashboard

async function fetchUK() {
  console.log('[militarySpending] Fetching UK (MOD)...');

  // Contracts Finder search API
  const searchUrl = 'https://www.contractsfinder.service.gov.uk/Published/Notices/PublicSearch/Search';

  let items = [];

  try {
    const params = new URLSearchParams({
      'searchCriteria.publishedFrom':      '2024-01-01',
      'searchCriteria.publishedTo':        '2026-03-31',
      'searchCriteria.organisationName':   'Ministry of Defence',
      'searchCriteria.postcode':           '',
      'searchCriteria.rows':               String(MAX_RECORDS_PER_COUNTRY),
      'searchCriteria.start':              '0',
      'searchCriteria.sortBy':             'totalValue',
      'searchCriteria.sortOrder':          'DESC',
    });

    const res = await fetch(`${searchUrl}?${params}`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    items = data?.results ?? data?.notices ?? (Array.isArray(data) ? data : []);
  } catch (e) {
    console.warn('[militarySpending] UK: Contracts Finder search failed, trying OCDS endpoint:', e.message);
    // Fallback: OCDS-compatible endpoint
    try {
      const ocdsUrl = 'https://www.contractsfinder.service.gov.uk/Published/Notices/PublicSearch/Search';
      const res2 = await fetch(
        `${ocdsUrl}?searchCriteria.keyword=defence&searchCriteria.organisationName=Ministry+of+Defence&searchCriteria.rows=${MAX_RECORDS_PER_COUNTRY}`,
        { headers: { Accept: 'application/json' } }
      );
      if (res2.ok) {
        const data2 = await res2.json();
        items = data2?.results ?? data2?.notices ?? [];
      }
    } catch (e2) {
      console.warn('[militarySpending] UK: OCDS fallback also failed:', e2.message);
    }
  }

  return items.slice(0, MAX_RECORDS_PER_COUNTRY).map((r) => {
    const amount    = safeNum(r.totalValue ?? r.value ?? r.awardedValue ?? r.estimatedValue ?? 0);
    const currency  = r.currency ?? 'GBP';
    const desc      = truncate(r.title ?? r.description ?? r.noticeTitle ?? '');
    const supplier  = r.supplier?.name ?? r.awardedToName ?? r.suppliersAwarded?.[0]?.name ?? 'Unknown';
    const procType  = (r.procedureType ?? r.procedure ?? r.contractType ?? '').toLowerCase();

    return {
      country:       'UK',
      currency,
      sourceId:      String(r.id ?? r.noticeId ?? r.referenceNumber ?? Math.random()),
      vendorName:    truncate(supplier, 150),
      description:   desc,
      category:      classifyCategory(desc, r.cpvCode ?? r.category ?? ''),
      amountLocal:   amount,
      amountUSD:     toUSD(amount, currency),
      date:          isoDate(r.publishedAt ?? r.awardDate ?? r.publicationDate),
      department:    r.organisation ?? r.authority ?? 'Ministry of Defence',
      procurementType: procType,
      contractPeriodStart: isoDate(r.startDate ?? r.periodOfPerformanceStart),
      contractPeriodEnd:   isoDate(r.endDate   ?? r.periodOfPerformanceEnd),
      sourceUrl: r.id
        ? `https://www.contractsfinder.service.gov.uk/Notice/${r.id}`
        : 'https://www.contractsfinder.service.gov.uk/',
    };
  });
}

// ─── Australia — Dept of Defence (data.gov.au / AusTender) ───────────────────
// Primary: AusTender contract notice search API
// Fallback: data.gov.au CKAN dataset for Defence contracts
// Docs: https://www.tenders.gov.au/documentation

async function fetchAustralia() {
  console.log('[militarySpending] Fetching Australia (Defence)...');

  let records = [];

  // Primary: AusTender open data API
  try {
    const url = 'https://www.tenders.gov.au/api/contractnotice?agencyName=Department+of+Defence' +
      `&dateFrom=2024-01-01&dateTo=2026-03-31&limit=${MAX_RECORDS_PER_COUNTRY}&orderBy=contractValue&order=DESC`;
    const data = await fetchJSON(url);
    records = data?.results ?? data?.contractNotices ?? data?.data ?? (Array.isArray(data) ? data : []);
  } catch (e) {
    console.warn('[militarySpending] AU: AusTender API failed:', e.message);
  }

  // Fallback: data.gov.au CKAN proactive disclosure – defence contracts
  if (!records.length) {
    try {
      const CKAN        = 'https://data.gov.au/api/3/action';
      const RESOURCE_ID = '3f4e35c4-ac7e-4e7c-bde0-76264f8caa8a'; // Defence contracts resource
      const data = await fetchJSON(
        `${CKAN}/datastore_search?resource_id=${RESOURCE_ID}&limit=${MAX_RECORDS_PER_COUNTRY}&sort=contractDate desc`
      );
      records = data?.result?.records ?? [];
    } catch (e2) {
      console.warn('[militarySpending] AU: data.gov.au fallback also failed:', e2.message);
    }
  }

  // Second fallback: open.australia.gov.au AusTender JSON
  if (!records.length) {
    try {
      const data = await fetchJSON(
        `https://data.gov.au/api/3/action/datastore_search_sql?sql=` +
        encodeURIComponent(
          `SELECT * FROM "d2f3b0a9-5a17-4e63-9154-e6d24db0fc33" WHERE "agencyName" LIKE '%Defence%' ORDER BY "contractStart" DESC LIMIT ${MAX_RECORDS_PER_COUNTRY}`
        )
      );
      records = data?.result?.records ?? [];
    } catch (e3) {
      console.warn('[militarySpending] AU: SQL fallback failed:', e3.message);
    }
  }

  return records.slice(0, MAX_RECORDS_PER_COUNTRY).map((r) => {
    const amount = safeNum(
      r.contractValue ?? r.value ?? r.contract_value ?? r.totalValue ?? r.amount ?? 0
    );
    const desc = truncate(
      r.description ?? r.contractTitle ?? r.title ?? r.procurementDescription ?? ''
    );
    const procType = (
      r.procurementMethod ?? r.procurement_method ?? r.contractType ?? r.type ?? ''
    ).toLowerCase();

    return {
      country:       'AU',
      currency:      'AUD',
      sourceId:      String(r._id ?? r.cnId ?? r.contractId ?? r.id ?? Math.random()),
      vendorName:    truncate(r.supplierName ?? r.vendor ?? r.supplier ?? r.contractor ?? 'Unknown', 150),
      description:   desc,
      category:      classifyCategory(desc, r.category ?? r.sector ?? ''),
      amountLocal:   amount,
      amountUSD:     toUSD(amount, 'AUD'),
      date:          isoDate(r.contractStart ?? r.publishDate ?? r.awardDate ?? r.contractDate),
      department:    r.agencyName ?? r.department ?? 'Department of Defence',
      procurementType: procType,
      contractPeriodStart: isoDate(r.contractStart ?? r.startDate),
      contractPeriodEnd:   isoDate(r.contractEnd ?? r.endDate),
      sourceUrl: r.cnId
        ? `https://www.tenders.gov.au/Cn/Show/${r.cnId}`
        : 'https://www.tenders.gov.au/Reports/CnList?AgencyStatus=Defence',
    };
  });
}

// ─── Rule-based waste flag detection ─────────────────────────────────────────
//
// Applied before / alongside Claude to give a fast baseline without API costs.

/**
 * @param {object} record — normalised spending record
 * @returns {string[]}    — list of flag keys from WASTE_WEIGHTS
 */
function detectRuleFlags(record) {
  const flags = [];
  const cat   = record.category;
  const desc  = (record.description ?? '').toLowerCase();
  const proc  = (record.procurementType ?? '').toLowerCase();
  const amt   = record.amountUSD;

  // Food / catering > $100K
  if (
    (cat === CATEGORIES.FOOD || cat === CATEGORIES.CATERING ||
     /cater|meal|ration|dining|refreshment|banquet/.test(desc)) &&
    amt > FOOD_FLAG_THRESHOLD_USD
  ) {
    flags.push('food_catering');
  }

  // Luxury hotel / hospitality
  if (
    /luxury|5[- ]?star|five[- ]?star|resort|spa|marriott|hilton|hyatt|four seasons|ritz|sheraton|westin/i.test(desc) &&
    cat === CATEGORIES.TRAVEL
  ) {
    flags.push('luxury_hotel');
  }

  // Sole-source / non-competitive above threshold
  if (
    amt > SOLE_SOURCE_FLAG_USD &&
    /sole[- ]?source|non[- ]?competitive|directed|advance[- ]?contract|limited tender|single[- ]?source|proprietary|emergency sole/i.test(
      proc + ' ' + desc
    )
  ) {
    flags.push('sole_source');
  }

  // Equipment that may be above market rate (large single-vendor equipment purchase)
  if (
    cat === CATEGORIES.EQUIPMENT &&
    amt > 10_000_000 &&
    (/amendment|price increase|escalation|cost overrun|modification/i.test(desc))
  ) {
    flags.push('above_market');
  }

  // Non-military category with significant spend
  if (
    amt > NONMILITARY_FLAG_USD &&
    [CATEGORIES.FOOD, CATEGORIES.CATERING, CATEGORIES.TRAVEL, CATEGORIES.OTHER].includes(cat) &&
    !/training|exercise|deployment|field/.test(desc)
  ) {
    flags.push('non_military');
  }

  return [...new Set(flags)];
}

// ─── Claude AI analysis ───────────────────────────────────────────────────────

/**
 * Call Claude Haiku to analyse a military spending record for waste indicators.
 */
async function analyseWithClaude(record, ruleFlags, batchMeanUSD) {
  if (!ANTHROPIC_API_KEY) {
    return buildFallbackAnalysis(record, ruleFlags, batchMeanUSD);
  }

  const sym = { USD: '$', CAD: 'CA$', GBP: '£', AUD: 'A$' };
  const s   = sym[record.currency] ?? record.currency + ' ';
  const fmtLocal = `${s}${(record.amountLocal / 1e6).toFixed(3)}M`;
  const fmtUSD   = `US$${(record.amountUSD / 1e6).toFixed(3)}M`;

  const ruleNote = ruleFlags.length
    ? `Rule-based pre-screening flagged: ${ruleFlags.join(', ')}.`
    : 'Rule-based pre-screening found no immediate flags.';

  const prompt = `You are a government defence-spending auditor. Analyse the following military spending record for waste, misuse, or unusual patterns. Respond with ONLY a JSON object.

Record:
- Country: ${record.country}
- Vendor: ${record.vendorName}
- Description: ${record.description || 'Not provided'}
- Category: ${record.category}
- Amount: ${fmtLocal} (≈ ${fmtUSD})
- Department: ${record.department}
- Procurement type: ${record.procurementType || 'Not specified'}
- Batch mean for this country: US$${(batchMeanUSD / 1e6).toFixed(3)}M
- ${ruleNote}

Flag definitions:
  food_catering  — food/catering above $100K USD
  luxury_hotel   — luxury/5-star hotel or resort spending
  above_market   — equipment price significantly above market rate
  sole_source    — non-competitive contract award above $500K USD
  non_military   — unusual non-military spend category for a defence department

Respond with EXACTLY this JSON:
{
  "wasteFlags": ["food_catering"|"luxury_hotel"|"above_market"|"sole_source"|"non_military"],
  "flagRationale": "One sentence explaining each flag raised, or null if none",
  "summary": "2 sentences: what was purchased and why it may or may not be justified",
  "citizenImpact": "1 sentence on what this means for taxpayers",
  "isConcerning": true|false
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
        max_tokens: 350,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) throw new Error(`Claude API ${response.status}`);

    const data = await response.json();
    const text = data?.content?.[0]?.text ?? '{}';
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('No JSON in Claude response');

    const ai = JSON.parse(match[0]);
    const allFlags = [...new Set([...(ai.wasteFlags ?? []), ...ruleFlags])];

    return {
      wasteFlags:     allFlags,
      flagRationale:  ai.flagRationale  ?? null,
      summary:        ai.summary        ?? '',
      citizenImpact:  ai.citizenImpact  ?? '',
      isConcerning:   Boolean(ai.isConcerning) || allFlags.length > 0,
      analysedBy:     'claude-ai',
    };
  } catch (e) {
    console.warn(`[militarySpending] Claude failed for "${record.sourceId}":`, e.message);
    return buildFallbackAnalysis(record, ruleFlags, batchMeanUSD);
  }
}

function buildFallbackAnalysis(record, ruleFlags, batchMeanUSD) {
  const sym = { USD: '$', CAD: 'CA$', GBP: '£', AUD: 'A$' };
  const s   = sym[record.currency] ?? record.currency + ' ';
  const fmt = `${s}${(record.amountLocal / 1e6).toFixed(2)}M`;

  const flagDescriptions = {
    food_catering: `Catering/food contract of ${fmt} exceeds the $100K threshold and warrants review.`,
    luxury_hotel:  `Accommodation spending of ${fmt} includes indicators of luxury/5-star facilities.`,
    above_market:  `Equipment contract of ${fmt} shows cost escalation indicators that may indicate above-market pricing.`,
    sole_source:   `Contract of ${fmt} was awarded without competitive tender — limiting cost controls.`,
    non_military:  `Spending of ${fmt} in category "${record.category}" is unusual for a defence department.`,
  };

  const rationale = ruleFlags.map((f) => flagDescriptions[f] ?? f).join(' ');

  const summary = record.description
    ? `${record.department} paid ${fmt} to ${record.vendorName} for: ${record.description}.` +
      (ruleFlags.length ? ` This record was flagged for: ${ruleFlags.join(', ')}.` : '')
    : `${fmt} paid to ${record.vendorName} by ${record.department} (category: ${record.category}).`;

  return {
    wasteFlags:    ruleFlags,
    flagRationale: rationale || null,
    summary,
    citizenImpact: `Taxpayers contributed ${fmt} to this defence contract awarded to ${record.vendorName}.` +
      (ruleFlags.length ? ' Flagged for potential waste — review recommended.' : ''),
    isConcerning:  ruleFlags.length > 0,
    analysedBy:    'fallback-rules',
  };
}

// ─── Military Waste Score ─────────────────────────────────────────────────────

/**
 * Calculate a Military Waste Score (0–100) for a country's batch.
 *
 * Composite of:
 *   A) Flag frequency  — weighted flag count / max possible points × 50
 *   B) Value exposure  — flagged USD / total USD × 50
 *
 * Higher score = more potential waste detected.
 *
 * @param {object[]} enriched — records with wasteFlags arrays
 * @returns {object} { score, grade, totalSpendUSD, flaggedSpendUSD, flaggedCount, breakdown }
 */
function calcWasteScore(enriched) {
  const totalSpendUSD   = enriched.reduce((s, r) => s + r.amountUSD, 0);
  const flaggedRecords  = enriched.filter((r) => r.wasteFlags?.length > 0);
  const flaggedSpendUSD = flaggedRecords.reduce((s, r) => s + r.amountUSD, 0);

  // A) Weighted flag frequency score (0–50)
  const maxWeightPossible = enriched.length * Math.max(...Object.values(WASTE_WEIGHTS));
  const actualWeight = enriched.reduce(
    (s, r) => s + (r.wasteFlags ?? []).reduce((ws, f) => ws + (WASTE_WEIGHTS[f] ?? 5), 0),
    0
  );
  const freqScore = maxWeightPossible > 0
    ? Math.min(50, (actualWeight / maxWeightPossible) * 50 * 3) // ×3 amplifier for sensitivity
    : 0;

  // B) Value exposure score (0–50)
  const valueScore = totalSpendUSD > 0
    ? Math.min(50, (flaggedSpendUSD / totalSpendUSD) * 50)
    : 0;

  const score = Math.round(freqScore + valueScore);

  // Breakdown by flag type
  const breakdown = Object.keys(WASTE_WEIGHTS).reduce((acc, flag) => {
    acc[flag] = enriched.filter((r) => r.wasteFlags?.includes(flag)).length;
    return acc;
  }, {});

  const grade =
    score >= 70 ? 'F — High Waste Risk' :
    score >= 50 ? 'D — Elevated Concern' :
    score >= 30 ? 'C — Moderate Concern' :
    score >= 15 ? 'B — Minor Concerns' :
                  'A — Low Waste Risk';

  return {
    score,
    grade,
    totalSpendUSD,
    flaggedSpendUSD,
    flaggedCount: flaggedRecords.length,
    totalCount:   enriched.length,
    flagRate:     enriched.length > 0
      ? Math.round((flaggedRecords.length / enriched.length) * 100)
      : 0,
    breakdown,
  };
}

// ─── Firestore persistence ────────────────────────────────────────────────────

async function saveRecords(enriched, wasteScoreDoc, country) {
  const col = collection(db, 'military_spending');

  // Clear stale records for this country
  try {
    const stale = await getDocs(query(col, where('country', '==', country)));
    await Promise.all(stale.docs.map((d) => deleteDoc(d.ref)));
    console.log(`[militarySpending] Cleared ${stale.size} stale records for ${country}`);
  } catch (e) {
    console.warn(`[militarySpending] Could not clear stale records for ${country}:`, e.message);
  }

  let saved = 0, errors = 0;

  // Write individual spending records
  await Promise.all(
    enriched.map(async (r) => {
      try {
        await addDoc(col, { ...r, docType: 'record', createdAt: serverTimestamp() });
        saved++;
      } catch (e) {
        console.error('[militarySpending] Failed to save record:', r.sourceId, e.message);
        errors++;
      }
    })
  );

  // Write the country-level waste score summary
  try {
    await addDoc(col, {
      ...wasteScoreDoc,
      country,
      docType: 'wasteScore',
      createdAt: serverTimestamp(),
    });
    saved++;
  } catch (e) {
    console.error('[militarySpending] Failed to save waste score for', country, e.message);
    errors++;
  }

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
  if (!fetcher) throw new Error(`[militarySpending] Unknown country: ${countryCode}`);

  console.log(`[militarySpending] ── Starting ${countryCode} ────────────────────`);

  // 1. Fetch
  let raw;
  try {
    raw = await fetcher();
    console.log(`[militarySpending] ${countryCode}: fetched ${raw.length} records`);
  } catch (e) {
    console.error(`[militarySpending] ${countryCode}: fetch failed —`, e.message);
    return { country: countryCode, fetched: 0, analysed: 0, saved: 0, errors: 1, wasteScore: null };
  }

  if (!raw.length) {
    console.warn(`[militarySpending] ${countryCode}: no records`);
    return { country: countryCode, fetched: 0, analysed: 0, saved: 0, errors: 0, wasteScore: null };
  }

  // 2. Compute batch mean for outlier context
  const usdAmounts   = raw.map((r) => r.amountUSD).filter((n) => n > 0);
  const batchMeanUSD = usdAmounts.length
    ? usdAmounts.reduce((s, n) => s + n, 0) / usdAmounts.length
    : 0;

  // 3. Rule-flag + Claude analysis (sequential to respect rate limits)
  const enriched = [];
  for (const record of raw) {
    const ruleFlags = detectRuleFlags(record);
    const analysis  = await analyseWithClaude(record, ruleFlags, batchMeanUSD);
    enriched.push({ ...record, ...analysis });
    if (ANTHROPIC_API_KEY) await new Promise((r) => setTimeout(r, 250));
  }

  // 4. Compute waste score
  const wasteScore = calcWasteScore(enriched);
  console.log(
    `[militarySpending] ${countryCode}: Waste Score ${wasteScore.score}/100 — ${wasteScore.grade}` +
    ` | ${wasteScore.flaggedCount}/${raw.length} records flagged`
  );

  // Log each flagged record for visibility
  enriched
    .filter((r) => r.wasteFlags?.length)
    .forEach((r) =>
      console.warn(
        `  ⚠ [${r.wasteFlags.join(',')}] ${r.vendorName}: ` +
        `US$${(r.amountUSD / 1e6).toFixed(2)}M — ${r.description?.slice(0, 80)}`
      )
    );

  // 5. Persist
  const { saved, errors } = await saveRecords(enriched, wasteScore, countryCode);
  console.log(`[militarySpending] ${countryCode}: saved ${saved} docs (${errors} errors)`);

  return {
    country: countryCode,
    fetched: raw.length,
    analysed: enriched.length,
    saved,
    errors,
    wasteScore: wasteScore.score,
    wasteGrade: wasteScore.grade,
    flaggedCount: wasteScore.flaggedCount,
  };
}

// ─── Top-level runner ─────────────────────────────────────────────────────────

/**
 * Run the full military spending tracker for all (or selected) countries.
 *
 * @param {string[]} [countries] — subset of ['CA','US','UK','AU'] (default: all)
 * @returns {Promise<object[]>}
 */
export async function runMilitarySpendingFetcher(countries = Object.keys(COUNTRY_FETCHERS)) {
  if (!ANTHROPIC_API_KEY) {
    console.warn(
      '[militarySpending] REACT_APP_ANTHROPIC_API_KEY not set — using rule-based waste detection.\n' +
      '                   Add the key to .env for Claude AI-enhanced analysis.'
    );
  }

  console.log(`[militarySpending] Starting tracker for: ${countries.join(', ')}`);
  const results = [];

  for (const country of countries) {
    try {
      results.push(await fetchAndSaveCountry(country));
    } catch (e) {
      console.error(`[militarySpending] Unhandled error for ${country}:`, e);
      results.push({ country, fetched: 0, analysed: 0, saved: 0, errors: 1, wasteScore: null });
    }
  }

  // Summary table
  console.log('\n[militarySpending] ══ Run complete ══════════════════════════════');
  console.log('  Country │ Fetched │ Flagged │ Waste Score │ Grade');
  console.log('  ────────┼─────────┼─────────┼─────────────┼────────────────────────');
  results.forEach((r) =>
    console.log(
      `  ${r.country.padEnd(7)} │ ${String(r.fetched).padEnd(7)} │` +
      ` ${String(r.flaggedCount ?? 0).padEnd(7)} │ ${String(r.wasteScore ?? 'N/A').padEnd(11)} │ ${r.wasteGrade ?? 'N/A'}`
    )
  );

  return results;
}

export default runMilitarySpendingFetcher;
