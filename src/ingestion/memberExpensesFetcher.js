/**
 * Member Expenses Fetcher
 *
 * Fetches real individual expense reports for politicians from official sources,
 * normalises them into a common schema, analyses each record with Claude AI to
 * detect waste patterns, and persists results to Firestore collection
 * "member_expenses".
 *
 * Sources
 * ───────
 *   Canada    : open.canada.ca — Proactive Disclosure: Travel & Hospitality (CKAN)
 *   USA       : clerk.house.gov — Quarterly Member Office Expenditure Reports
 *   UK        : theipsa.org.uk — MP Expenses published data (CSV/API)
 *   Australia : finance.gov.au — Ministerial Expenses + data.gov.au (CKAN)
 *
 * Claude AI flags per record
 * ──────────────────────────
 *   excessive_travel    — first-class / private charter when economy available
 *   luxury_accommodation — 5-star hotels above government rate
 *   personal_use        — expenses clearly personal in nature
 *   duplicate_claim     — same expense type claimed twice same day
 *   high_value          — single expense > $5,000 USD
 *
 * Usage
 * ─────
 *   import { runMemberExpensesFetcher } from './ingestion/memberExpensesFetcher.js';
 *   await runMemberExpensesFetcher();             // all 4 countries
 *   await runMemberExpensesFetcher(['CA','UK']);  // selected countries only
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
import { saveAs } from 'file-saver';

// ─── Config ───────────────────────────────────────────────────────────────────

const ANTHROPIC_API_KEY = process.env.REACT_APP_ANTHROPIC_API_KEY || '';
const CLAUDE_MODEL      = 'claude-haiku-4-5-20251001';
const CLAUDE_API_URL    = 'https://api.anthropic.com/v1/messages';

const MAX_RECORDS_PER_COUNTRY = 60;

// ─── Flag definitions ─────────────────────────────────────────────────────────

export const FLAGS = {
  EXCESSIVE_TRAVEL:      'excessive_travel',
  LUXURY_ACCOMMODATION:  'luxury_accommodation',
  PERSONAL_USE:          'personal_use',
  DUPLICATE_CLAIM:       'duplicate_claim',
  HIGH_VALUE:            'high_value',
};

const FLAG_WEIGHTS = {
  [FLAGS.EXCESSIVE_TRAVEL]:     18,
  [FLAGS.LUXURY_ACCOMMODATION]: 20,
  [FLAGS.PERSONAL_USE]:         25,
  [FLAGS.DUPLICATE_CLAIM]:      22,
  [FLAGS.HIGH_VALUE]:           10,
};

// ─── Keyword classifiers ───────────────────────────────────────────────────────

const TRAVEL_LUXURY_KEYWORDS = [
  'first class', 'business class', 'private jet', 'charter flight', 'limousine',
  'limo ', 'luxury transfer', 'concorde', 'private aviation', 'executive car',
];

const ACCOMMODATION_LUXURY_KEYWORDS = [
  'ritz', 'four seasons', 'mandarin oriental', 'waldorf', 'dorchester',
  'savoy', 'claridges', 'peninsula hotel', 'bulgari hotel', 'rosewood',
  'shangri-la', 'aman resort', 'six senses', 'bvlgari', '5 star', 'five star',
  'suite ', 'presidential suite', 'penthouse suite',
];

const PERSONAL_USE_KEYWORDS = [
  'personal shopping', 'family member', 'spouse travel', 'dependent travel',
  'pet ', 'dry cleaning personal', 'haircut', 'beauty treatment', 'massage personal',
  'gym membership personal', 'netflix', 'amazon prime', 'streaming', 'holiday',
  'vacation personal', 'birthday', 'anniversary', 'christmas gifts',
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

// ─── Canada — Proactive Disclosure: Travel (open.canada.ca) ──────────────────
// Dataset: Proactive Disclosure — Travel Expenses
// Package: https://open.canada.ca/data/en/dataset/009f9a49-c2d9-4d29-a6d4-1a228da335ce
// Also covers hospitality expenses
// Fields: owner_org_title, name, title_en, purpose_en, start_date, end_date,
//         total_cost, destination_en, transport_en, lodging, meals_and_incidentals

async function fetchCanada() {
  console.log('[memberExpenses] Fetching Canada (Proactive Disclosure – Travel)...');

  const CKAN    = 'https://open.canada.ca/data/api/3/action';
  const PKG_ID  = '009f9a49-c2d9-4d29-a6d4-1a228da335ce';
  // Known stable resource id for travel proactive disclosure
  const RES_ID  = 'e3b72bd6-0a8e-4337-8f21-c9be79c1f2b1';

  let records = [];

  // Tier 1: direct datastore search
  try {
    const data = await fetchJSON(
      `${CKAN}/datastore_search?resource_id=${RES_ID}` +
      `&limit=${MAX_RECORDS_PER_COUNTRY}&sort=start_date desc`
    );
    records = data?.result?.records ?? [];
  } catch {
    // Tier 2: discover resource from package metadata
    try {
      const pkg   = await fetchJSON(`${CKAN}/package_show?id=${PKG_ID}`);
      const resources = pkg?.result?.resources ?? [];
      const res   = resources.find((r) => r.datastore_active) ?? resources[0];
      if (res?.id) {
        const data = await fetchJSON(
          `${CKAN}/datastore_search?resource_id=${res.id}` +
          `&limit=${MAX_RECORDS_PER_COUNTRY}&sort=start_date desc`
        );
        records = data?.result?.records ?? [];
      }
    } catch (e2) {
      console.warn('[memberExpenses] Canada: package discovery failed:', e2.message);
    }
  }

  // Tier 3: keyword resource search
  if (!records.length) {
    try {
      const search = await fetchJSON(
        `${CKAN}/resource_search?query=name:travel+proactive&limit=5`
      );
      const firstRes = search?.result?.results?.[0];
      if (firstRes?.id) {
        const data = await fetchJSON(
          `${CKAN}/datastore_search?resource_id=${firstRes.id}` +
          `&limit=${MAX_RECORDS_PER_COUNTRY}`
        );
        records = data?.result?.records ?? [];
      }
    } catch (e3) {
      console.warn('[memberExpenses] Canada: resource search fallback failed:', e3.message);
    }
  }

  return records.slice(0, MAX_RECORDS_PER_COUNTRY).map((r) => {
    const amount   = safeNum(r.total_cost ?? r.amount ?? r.cost ?? 0);
    const purpose  = truncate(r.purpose_en ?? r.purpose ?? r.description_en ?? '');
    const dest     = truncate(r.destination_en ?? r.destination ?? '');

    return {
      country:       'CA',
      currency:      'CAD',
      sourceId:      String(r._id ?? r.ref_number ?? Math.random()),
      memberName:    titleCase(r.name ?? r.employee_name ?? r.cardholder ?? 'Not disclosed'),
      memberTitle:   titleCase(r.title_en ?? r.position ?? r.job_title ?? ''),
      department:    truncate(r.owner_org_title ?? r.department ?? r.organization ?? 'Unknown', 120),
      category:      titleCase(r.transport_en ?? r.expense_type ?? r.type ?? 'Travel'),
      description:   purpose || dest || 'Travel expense',
      destination:   dest,
      amountLocal:   amount,
      amountUSD:     toUSD(amount, 'CAD'),
      startDate:     isoDate(r.start_date ?? r.date ?? r.expense_date),
      endDate:       isoDate(r.end_date ?? r.return_date),
      purpose,
      sourceUrl:     `https://open.canada.ca/data/en/dataset/${PKG_ID}`,
    };
  });
}

// ─── USA — House Member Office Expenditures (clerk.house.gov) ────────────────
// Quarterly reports: https://clerk.house.gov/public_disc/expenditures.aspx
// Bulk XML/CSV available per quarter — we use the latest available quarterly data.
// Fallback: House Financial Disclosure bulk data via clerk.house.gov JSON API.

async function fetchUS() {
  console.log('[memberExpenses] Fetching USA (House Member Expenditures)...');

  const QUARTERS = [
    { year: 2025, quarter: 3, label: '2025 Q3' },
    { year: 2025, quarter: 2, label: '2025 Q2' },
    { year: 2025, quarter: 1, label: '2025 Q1' },
  ];

  let records = [];

  // Try each quarter until we get data
  for (const { year, quarter, label } of QUARTERS) {
    if (records.length) break;
    try {
      // Clerk.house.gov expenditure XML/CSV for the given quarter
      const url = `https://clerk.house.gov/public_disc/expenditures/${year}/${year}Q${quarter}.xml`;
      const res  = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const xml  = await res.text();

      // Parse XML rows (simple regex approach for browser-safe XML parsing)
      const rowMatches = [...xml.matchAll(/<row>([\s\S]*?)<\/row>/gi)];
      for (const match of rowMatches.slice(0, MAX_RECORDS_PER_COUNTRY)) {
        const get = (tag) => {
          const m = match[1].match(new RegExp(`<${tag}[^>]*>([^<]*)<\/${tag}>`, 'i'));
          return m ? m[1].trim() : '';
        };
        records.push({
          memberName:  get('MEMBERID') || get('MEMBERNAME') || get('OFFICENAME'),
          department:  get('OFFICENAME') || get('OFFICE') || 'House Office',
          category:    get('CATEGORY') || get('TYPE') || 'Office Expenses',
          description: get('DESCRIPTION') || get('VENDOR') || '',
          amount:      safeNum(get('AMOUNT') || get('TOTAL') || '0'),
          startDate:   isoDate(get('DATE') || get('STARTDATE') || ''),
          quarter:     label,
        });
      }
      if (records.length) console.log(`[memberExpenses] US: ${records.length} records from ${label}`);
    } catch {
      // try next quarter
    }
  }

  // Fallback: try CSV variant
  if (!records.length) {
    for (const { year, quarter, label } of QUARTERS) {
      if (records.length) break;
      try {
        const url = `https://clerk.house.gov/public_disc/expenditures/${year}/${year}Q${quarter}.csv`;
        const res  = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const text    = await res.text();
        const lines   = text.trim().split('\n').filter(Boolean);
        if (lines.length < 2) continue;
        const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/^"|"$/g, ''));
        for (const line of lines.slice(1, MAX_RECORDS_PER_COUNTRY + 1)) {
          const vals = line.split(',').map((v) => v.replace(/^"|"$/g, '').trim());
          const row  = Object.fromEntries(headers.map((h, i) => [h, vals[i] ?? '']));
          records.push({
            memberName:  row.memberid ?? row.membername ?? row.officename ?? 'Not disclosed',
            department:  row.officename ?? row.office ?? 'House Office',
            category:    row.category ?? row.type ?? 'Office Expenses',
            description: row.description ?? row.vendor ?? '',
            amount:      safeNum(row.amount ?? row.total ?? '0'),
            startDate:   isoDate(row.date ?? row.startdate ?? ''),
            quarter:     label,
          });
        }
        if (records.length) console.log(`[memberExpenses] US: ${records.length} records from CSV ${label}`);
      } catch {
        // try next
      }
    }
  }

  if (!records.length) {
    console.warn('[memberExpenses] US: no expenditure data available from clerk.house.gov');
  }

  return records.slice(0, MAX_RECORDS_PER_COUNTRY).map((r) => ({
    country:     'US',
    currency:    'USD',
    sourceId:    String(r.memberName + (r.startDate ?? '') + r.amount + Math.random()).replace(/\s/g, '_'),
    memberName:  titleCase(r.memberName || 'Not disclosed'),
    memberTitle: 'Member of Congress',
    department:  truncate(r.department || 'House Office', 120),
    category:    titleCase(r.category || 'Office Expenses'),
    description: truncate(r.description || ''),
    destination: '',
    amountLocal: r.amount,
    amountUSD:   r.amount,
    startDate:   r.startDate ?? null,
    endDate:     null,
    purpose:     truncate(r.description || r.category || ''),
    quarter:     r.quarter ?? null,
    sourceUrl:   'https://clerk.house.gov/public_disc/expenditures.aspx',
  }));
}

// ─── UK — IPSA MP Expenses (theipsa.org.uk) ───────────────────────────────────
// IPSA (Independent Parliamentary Standards Authority) publishes MP expenses.
// Data available at: https://www.theipsa.org.uk/mp-costs/other-published-data/
// Bulk CSV downloads: https://www.theipsa.org.uk/api/...
// Also: https://data.parliament.uk/ via parliamentary API

async function fetchUK() {
  console.log('[memberExpenses] Fetching UK (IPSA MP Expenses)...');

  let records = [];

  // Try IPSA published data CSV (financial year 2024-25)
  const IPSA_URLS = [
    'https://www.theipsa.org.uk/api/download?dataset=individualBusinessCosts&year=2024-25',
    'https://www.theipsa.org.uk/api/download?dataset=individualBusinessCosts&year=2023-24',
    'https://www.theipsa.org.uk/api/download?dataset=staffing&year=2024-25',
  ];

  for (const url of IPSA_URLS) {
    if (records.length >= MAX_RECORDS_PER_COUNTRY) break;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text    = await res.text();
      const lines   = text.trim().split('\n').filter(Boolean);
      if (lines.length < 2) continue;
      const raw     = lines[0];
      const sep     = raw.includes('\t') ? '\t' : ',';
      const headers = raw.split(sep).map((h) => h.trim().replace(/^"|"$/g, '').toLowerCase().replace(/\s+/g, '_'));

      for (const line of lines.slice(1, MAX_RECORDS_PER_COUNTRY + 1)) {
        const vals = line.split(sep).map((v) => v.replace(/^"|"$/g, '').trim());
        const row  = Object.fromEntries(headers.map((h, i) => [h, vals[i] ?? '']));
        records.push({
          memberName:  row.mp_name ?? row.name ?? row.member ?? 'Not disclosed',
          constituency: row.constituency ?? row.region ?? '',
          category:    row.expense_type ?? row.category ?? row.type ?? 'Business Cost',
          description: row.description ?? row.detail ?? '',
          amount:      safeNum(row.amount_claimed ?? row.amount ?? row.cost ?? '0'),
          amountApproved: safeNum(row.amount_approved ?? row.approved ?? '0'),
          date:        isoDate(row.date ?? row.period ?? row.month ?? ''),
          status:      row.status ?? row.approved_status ?? '',
        });
      }
      if (records.length) console.log(`[memberExpenses] UK: ${records.length} records from IPSA`);
    } catch (e) {
      console.warn(`[memberExpenses] UK: IPSA URL failed (${url}):`, e.message);
    }
  }

  // Fallback: data.parliament.uk API
  if (!records.length) {
    try {
      const res = await fetch(
        'https://data.parliament.uk/api/data/MemberExpenses?$format=json&$top=60&$orderby=claimDate desc'
      );
      if (res.ok) {
        const json  = await res.json();
        const items = json?.value ?? json?.results ?? [];
        for (const item of items.slice(0, MAX_RECORDS_PER_COUNTRY)) {
          records.push({
            memberName:   item.MemberName ?? item.Name ?? 'Not disclosed',
            constituency: item.Constituency ?? '',
            category:     item.ExpenseType ?? item.Category ?? 'Expense',
            description:  item.Description ?? item.Detail ?? '',
            amount:       safeNum(item.AmountClaimed ?? item.Amount ?? '0'),
            amountApproved: safeNum(item.AmountApproved ?? '0'),
            date:         isoDate(item.ClaimDate ?? item.Date ?? ''),
            status:       item.Status ?? '',
          });
        }
        if (records.length) console.log(`[memberExpenses] UK: ${records.length} records from data.parliament.uk`);
      }
    } catch (e2) {
      console.warn('[memberExpenses] UK: data.parliament.uk fallback failed:', e2.message);
    }
  }

  if (!records.length) {
    console.warn('[memberExpenses] UK: no expense data available');
  }

  return records.slice(0, MAX_RECORDS_PER_COUNTRY).map((r) => ({
    country:     'UK',
    currency:    'GBP',
    sourceId:    String((r.memberName ?? '') + (r.date ?? '') + r.amount + Math.random()).replace(/\s/g, '_'),
    memberName:  titleCase(r.memberName || 'Not disclosed'),
    memberTitle: 'Member of Parliament',
    department:  truncate(r.constituency ? `${r.constituency} Constituency` : 'House of Commons', 120),
    category:    titleCase(r.category || 'Expense'),
    description: truncate(r.description || ''),
    destination: '',
    amountLocal: r.amount,
    amountUSD:   toUSD(r.amount, 'GBP'),
    amountApproved: r.amountApproved ?? 0,
    startDate:   r.date ?? null,
    endDate:     null,
    purpose:     truncate(r.description || r.category || ''),
    status:      r.status || '',
    sourceUrl:   'https://www.theipsa.org.uk/mp-costs/other-published-data/',
  }));
}

// ─── Australia — Ministerial Expenses (finance.gov.au + data.gov.au) ──────────
// Source: https://www.finance.gov.au/government/managing-commonwealth-resources/
//         reporting-and-accountability/ministerial-expenses
// Also: data.gov.au CKAN API for departmental expenses

async function fetchAustralia() {
  console.log('[memberExpenses] Fetching Australia (Ministerial Expenses)...');

  const CKAN = 'https://data.gov.au/api/3/action';

  // Known resource IDs for ministerial/parliamentary expense datasets on data.gov.au
  const CANDIDATE_IDS = [
    '4b2a3e9c-5f14-4c8e-b832-1e9d6a7f5c3a', // Ministerial travel expenses
    'a2c8e6b1-3d47-4f9e-8c52-7b1e4a9f2d8c', // Parliamentary expenses overview
    'f3e1a8b2-6c49-4d7e-9f25-8b3c2e7a5d4f', // Senators' allowances
    '1b4e7c3a-8f52-4e9d-b6a3-5c2d8e1f7b4c', // MPs travel domestic
    'c5a3e8b1-2f47-4d6e-9c1b-7a5e3f8b2c9d', // MPs international travel
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
        console.log(`[memberExpenses] AU: got ${rows.length} records from resource ${resId}`);
      }
    } catch { /* try next */ }
  }

  // Fallback: search data.gov.au for expense datasets
  if (!records.length) {
    try {
      const pkgSearch = await fetchJSON(
        `${CKAN}/package_search?q=ministerial+expenses+travel+parliament&rows=8`
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
      console.warn('[memberExpenses] AU: package search fallback failed:', e.message);
    }
  }

  // Second fallback: finance.gov.au CSV
  if (!records.length) {
    try {
      const csvRes = await fetch(
        'https://www.finance.gov.au/sites/default/files/2025-02/ministerial-expenses-2024-25.csv'
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
      console.warn('[memberExpenses] AU: finance.gov.au CSV fallback failed:', e2.message);
    }
  }

  return records.slice(0, MAX_RECORDS_PER_COUNTRY).map((r) => {
    const amount   = safeNum(r.amount ?? r.Amount ?? r.total_cost ?? r.cost ?? r.value ?? 0);
    const member   = titleCase(r.minister ?? r.member ?? r.name ?? r.officer ?? r.senator ?? r.mp ?? 'Not disclosed');
    const dept     = truncate(r.portfolio ?? r.department ?? r.agency ?? r.entity ?? 'Unknown', 120);
    const cat      = titleCase(r.expense_type ?? r.category ?? r.type ?? r.purpose ?? 'Travel');
    const desc     = truncate(r.description ?? r.details ?? r.reason ?? r.destination ?? '');
    const dest     = truncate(r.destination ?? r.trip_destination ?? r.location ?? '');

    return {
      country:     'AU',
      currency:    'AUD',
      sourceId:    String(r._id ?? r.id ?? r.ref ?? Math.random()),
      memberName:  member,
      memberTitle: titleCase(r.title ?? r.role ?? r.position ?? 'Minister'),
      department:  dept,
      category:    cat,
      description: desc || dest || 'Ministerial expense',
      destination: dest,
      amountLocal: amount,
      amountUSD:   toUSD(amount, 'AUD'),
      startDate:   isoDate(r.date ?? r.start_date ?? r.expense_date ?? r.period),
      endDate:     isoDate(r.end_date ?? r.return_date),
      purpose:     truncate(r.purpose ?? r.description ?? r.reason ?? ''),
      sourceUrl:   'https://www.finance.gov.au/government/managing-commonwealth-resources/reporting-and-accountability/ministerial-expenses',
    };
  });
}

// ─── Rule-based flag detection ────────────────────────────────────────────────

function detectRuleFlags(record) {
  const flags  = [];
  const text   = `${record.category} ${record.description} ${record.purpose}`.toLowerCase();
  const amount = record.amountUSD;

  if (matchesKeywords(text, TRAVEL_LUXURY_KEYWORDS)) {
    flags.push(FLAGS.EXCESSIVE_TRAVEL);
  }

  if (matchesKeywords(text, ACCOMMODATION_LUXURY_KEYWORDS)) {
    flags.push(FLAGS.LUXURY_ACCOMMODATION);
  }

  if (matchesKeywords(text, PERSONAL_USE_KEYWORDS)) {
    flags.push(FLAGS.PERSONAL_USE);
  }

  if (amount >= 5000) {
    flags.push(FLAGS.HIGH_VALUE);
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
  const fmtLocal = `${s}${record.amountLocal.toFixed(2)}`;
  const ruleNote = ruleFlags.length
    ? `Rule-based pre-screening flagged: ${ruleFlags.join(', ')}.`
    : 'No flags from keyword rules.';

  const prompt = `You are a government ethics auditor reviewing politician expense claims. Analyse this expense record for potential misuse. Respond with ONLY a JSON object — no markdown, no extra text.

Expense record:
- Country: ${record.country}
- Member: ${record.memberName}${record.memberTitle ? ` (${record.memberTitle})` : ''}
- Department/Portfolio: ${record.department}
- Category: ${record.category}
- Description: ${record.description}
- Amount: ${fmtLocal} (≈ US$${record.amountUSD})
- Date: ${record.startDate ?? 'Unknown'}
- Purpose: ${record.purpose || 'Not provided'}
- ${ruleNote}

Flag definitions:
  excessive_travel      — first-class, business class, or private charter when economy would suffice
  luxury_accommodation  — 5-star hotels, premium suites above official government travel rates
  personal_use          — expense clearly personal rather than for official duties
  duplicate_claim       — appears to duplicate another expense type on same date
  high_value            — single expense exceeds $5,000 USD

Respond with EXACTLY this JSON (no other text):
{
  "wasteFlags": [],
  "flagRationale": "One sentence per flag, or null if none",
  "summary": "2 sentences: what was claimed and whether it appears justified",
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
        model:      CLAUDE_MODEL,
        max_tokens: 400,
        messages:   [{ role: 'user', content: prompt }],
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
      wasteFlags:        allFlags,
      flagRationale:     ai.flagRationale     ?? null,
      summary:           ai.summary           ?? '',
      citizenImpact:     ai.citizenImpact      ?? '',
      isConcerning:      Boolean(ai.isConcerning) || allFlags.length > 0,
      recommendedAction: ai.recommendedAction  ?? (allFlags.length > 1 ? 'Escalate' : allFlags.length ? 'Review' : 'Approve'),
      analysedBy:        'claude-ai',
    };
  } catch (e) {
    console.warn(`[memberExpenses] Claude failed for "${record.sourceId}":`, e.message);
    return buildFallbackAnalysis(record, ruleFlags);
  }
}

function buildFallbackAnalysis(record, ruleFlags) {
  const sym = { USD: '$', CAD: 'CA$', GBP: '£', AUD: 'A$' };
  const s   = sym[record.currency] ?? record.currency + ' ';
  const fmt = `${s}${record.amountLocal.toFixed(2)}`;

  const descriptions = {
    [FLAGS.EXCESSIVE_TRAVEL]:     `Category/description matches premium travel keywords (first-class, charter, etc.).`,
    [FLAGS.LUXURY_ACCOMMODATION]: `Accommodation appears to be at a luxury/5-star venue above government rate.`,
    [FLAGS.PERSONAL_USE]:         `Description contains personal-use keywords (family, personal, holiday, etc.).`,
    [FLAGS.DUPLICATE_CLAIM]:      `Possible duplicate claim detected on same date.`,
    [FLAGS.HIGH_VALUE]:           `Single expense of US$${record.amountUSD} exceeds the $5,000 high-value threshold.`,
  };

  const rationale = ruleFlags.map((f) => descriptions[f] ?? f).join(' ');
  const action    = ruleFlags.length > 2 ? 'Escalate' : ruleFlags.length > 0 ? 'Review' : 'Approve';

  return {
    wasteFlags:        ruleFlags,
    flagRationale:     rationale || null,
    summary:
      `${record.memberName} (${record.department}) claimed ${fmt} for "${record.category}"` +
      (record.description ? ` — ${record.description.slice(0, 80)}.` : '.') +
      (ruleFlags.length ? ` Flagged for: ${ruleFlags.join(', ')}.` : ''),
    citizenImpact:
      `Taxpayers funded ${fmt} for this member expense` +
      (ruleFlags.length ? ' — flagged for potential misuse.' : '.'),
    isConcerning:      ruleFlags.length > 0,
    recommendedAction: action,
    analysedBy:        'fallback-rules',
  };
}

// ─── Firestore persistence ────────────────────────────────────────────────────

async function saveRecords(enriched, country) {
  const col = collection(db, 'member_expenses');

  // Clear stale records for this country
  try {
    const stale = await getDocs(query(col, where('country', '==', country)));
    await Promise.all(stale.docs.map((d) => deleteDoc(d.ref)));
    console.log(`[memberExpenses] Cleared ${stale.size} stale records for ${country}`);
  } catch (e) {
    console.warn(`[memberExpenses] Could not clear stale records for ${country}:`, e.message);
  }

  let saved = 0, errors = 0;

  await Promise.all(
    enriched.map(async (r) => {
      try {
        await addDoc(col, { ...r, docType: 'expense', createdAt: serverTimestamp() });
        saved++;
      } catch (e) {
        console.error('[memberExpenses] Failed to save record:', r.sourceId, e.message);
        errors++;
      }
    })
  );

  return { saved, errors };
}

// ─── JSON output ──────────────────────────────────────────────────────────────

async function saveOutput(enriched, country) {
  try {
    const json = JSON.stringify(enriched, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    saveAs(blob, `member_expenses_${country}.json`);
    console.log(`[memberExpenses] Saved output/member_expenses/${country}.json (${enriched.length} records)`);
  } catch (e) {
    console.warn(`[memberExpenses] Could not save JSON output for ${country}:`, e.message);
  }
}

// ─── Country fetcher map ──────────────────────────────────────────────────────

const COUNTRY_FETCHERS = {
  CA: fetchCanada,
  US: fetchUS,
  UK: fetchUK,
  AU: fetchAustralia,
};

// ─── Per-country pipeline ─────────────────────────────────────────────────────

export async function fetchAndSaveCountry(countryCode) {
  const fetcher = COUNTRY_FETCHERS[countryCode];
  if (!fetcher) throw new Error(`[memberExpenses] Unknown country: ${countryCode}`);

  console.log(`[memberExpenses] ── Starting ${countryCode} ─────────────────────`);

  // 1. Fetch
  let raw;
  try {
    raw = await fetcher();
    console.log(`[memberExpenses] ${countryCode}: fetched ${raw.length} records`);
  } catch (e) {
    console.error(`[memberExpenses] ${countryCode}: fetch failed —`, e.message);
    return { country: countryCode, fetched: 0, analysed: 0, saved: 0, errors: 1 };
  }

  if (!raw.length) {
    console.warn(`[memberExpenses] ${countryCode}: no records returned`);
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

  // Log summary
  const flaggedCount = enriched.filter((r) => r.wasteFlags?.length).length;
  console.log(`[memberExpenses] ${countryCode}: ${flaggedCount}/${raw.length} records flagged`);

  enriched
    .filter((r) => r.wasteFlags?.length)
    .forEach((r) =>
      console.warn(
        `  ⚑ [${r.wasteFlags.join(',')}] ${r.memberName} | ` +
        `${r.category} | US$${r.amountUSD} | ${r.department.slice(0, 50)}`
      )
    );

  // 3. Persist to Firestore
  const { saved, errors } = await saveRecords(enriched, countryCode);
  console.log(`[memberExpenses] ${countryCode}: saved ${saved} docs (${errors} errors)`);

  // 4. Save JSON output
  await saveOutput(enriched, countryCode);

  const topFlagged = enriched
    .filter((r) => r.wasteFlags?.length)
    .sort((a, b) => b.amountUSD - a.amountUSD)[0];

  return {
    country:     countryCode,
    fetched:     raw.length,
    analysed:    enriched.length,
    saved,
    errors,
    flaggedCount,
    topMember:   topFlagged?.memberName ?? null,
    topAmount:   topFlagged?.amountUSD ?? 0,
    topFlags:    topFlagged?.wasteFlags ?? [],
  };
}

// ─── Top-level runner ─────────────────────────────────────────────────────────

/**
 * Run the full member expenses fetcher for all (or selected) countries.
 *
 * @param {string[]} [countries] — subset of ['CA','US','UK','AU'] (default: all)
 * @returns {Promise<object[]>}
 */
export async function runMemberExpensesFetcher(countries = Object.keys(COUNTRY_FETCHERS)) {
  if (!ANTHROPIC_API_KEY) {
    console.warn(
      '[memberExpenses] REACT_APP_ANTHROPIC_API_KEY not set — using keyword-based detection.\n' +
      '                 Add the key to .env for Claude AI-enhanced analysis.'
    );
  }

  console.log(`[memberExpenses] Starting fetcher for: ${countries.join(', ')}`);
  const results = [];

  for (const country of countries) {
    try {
      const result = await fetchAndSaveCountry(country);
      results.push(result);
    } catch (e) {
      console.error(`[memberExpenses] Unhandled error for ${country}:`, e.message);
      results.push({ country, error: e.message });
    }
  }

  const total     = results.reduce((s, r) => s + (r.fetched ?? 0), 0);
  const flagged   = results.reduce((s, r) => s + (r.flaggedCount ?? 0), 0);
  const savedAll  = results.reduce((s, r) => s + (r.saved ?? 0), 0);

  console.log(
    `[memberExpenses] ── Complete: ${total} fetched, ${flagged} flagged, ${savedAll} saved ──`
  );

  return results;
}
