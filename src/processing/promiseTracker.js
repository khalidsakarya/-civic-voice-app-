/**
 * Promise Tracker
 *
 * Tracks public promises made by PMs and Presidents, monitors delivery status,
 * calculates a Promise Score per leader (0–100), and persists findings to
 * Firestore collection "promise_tracker".
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

// ─── Status constants ─────────────────────────────────────────────────────────

export const STATUS = {
  KEPT: 'Kept',
  BROKEN: 'Broken',
  IN_PROGRESS: 'In Progress',
  NOT_STARTED: 'Not Started',
  PARTIALLY_KEPT: 'Partially Kept',
};

// Points awarded per status when calculating Promise Score
const STATUS_POINTS = {
  [STATUS.KEPT]: 100,
  [STATUS.PARTIALLY_KEPT]: null, // uses deliveredPercent
  [STATUS.IN_PROGRESS]: 25,
  [STATUS.NOT_STARTED]: 0,
  [STATUS.BROKEN]: 0,
};

// ─── Promise dataset ──────────────────────────────────────────────────────────
// Sources: official campaign platforms, parliamentary records, press releases.
// Statuses reflect the state of play as of March 2026.

export const PROMISES = [
  // ── Mark Carney (Canada) ───────────────────────────────────────────────────
  {
    leaderId: 'carney',
    leaderName: 'Mark Carney',
    country: 'CA',
    role: 'Prime Minister',
    promise:
      'Build 500,000 new homes per year by 2029 through the Canada Housing Action Plan.',
    dateMade: '2025-03-14',
    source: 'Liberal Party election platform 2025',
    category: 'housing',
    status: STATUS.IN_PROGRESS,
    deliveredPercent: 18,
    evidence:
      'Housing starts for 2025 reached ~91,000 units — below the 500,000 annual pace required. New federal incentives are in place but delivery timelines lag.',
    lastChecked: '2026-03-01',
    targetDate: '2029-12-31',
  },
  {
    leaderId: 'carney',
    leaderName: 'Mark Carney',
    country: 'CA',
    role: 'Prime Minister',
    promise:
      'Cut the lowest federal income tax bracket from 15% to 14%, saving middle-class families up to $900 per year.',
    dateMade: '2025-03-14',
    source: 'Liberal Party election platform 2025',
    category: 'economy',
    status: STATUS.IN_PROGRESS,
    deliveredPercent: 40,
    evidence:
      'Legislation introduced in the Fall 2025 fiscal update. Parliamentary debate ongoing; not yet enacted.',
    lastChecked: '2026-03-01',
    targetDate: '2026-07-01',
  },
  {
    leaderId: 'carney',
    leaderName: 'Mark Carney',
    country: 'CA',
    role: 'Prime Minister',
    promise:
      'Eliminate the consumer carbon price (carbon tax) immediately upon taking office.',
    dateMade: '2025-03-14',
    source: 'Liberal Party election platform 2025 / CBC News interview',
    category: 'environment',
    status: STATUS.KEPT,
    deliveredPercent: 100,
    evidence:
      'The consumer carbon levy was eliminated on April 1, 2025, as promised. Industrial pricing retained.',
    lastChecked: '2026-03-01',
    targetDate: '2025-04-01',
  },
  {
    leaderId: 'carney',
    leaderName: 'Mark Carney',
    country: 'CA',
    role: 'Prime Minister',
    promise:
      'Impose matching counter-tariffs and negotiate a new Canada-US trade framework to end the 25% US tariffs.',
    dateMade: '2025-03-14',
    source: 'G7 press conference, March 2025',
    category: 'economy',
    status: STATUS.IN_PROGRESS,
    deliveredPercent: 35,
    evidence:
      'Canada imposed retaliatory tariffs on ~$30B of US goods. Formal trade negotiations opened but no framework deal reached as of March 2026.',
    lastChecked: '2026-03-01',
    targetDate: '2026-12-31',
  },
  {
    leaderId: 'carney',
    leaderName: 'Mark Carney',
    country: 'CA',
    role: 'Prime Minister',
    promise:
      'Expand the National Pharmacare program to cover all Canadians for diabetes and contraception medications.',
    dateMade: '2025-03-14',
    source: 'Liberal-NDP supply-and-confidence agreement / election platform',
    category: 'healthcare',
    status: STATUS.PARTIALLY_KEPT,
    deliveredPercent: 60,
    evidence:
      'Pharmacare Act covers diabetes drugs and contraception in eight provinces. Three provinces (Alberta, New Brunswick, PEI) have not yet signed bilateral agreements.',
    lastChecked: '2026-03-01',
    targetDate: '2026-12-31',
  },

  // ── Donald Trump (USA) ─────────────────────────────────────────────────────
  {
    leaderId: 'trump',
    leaderName: 'Donald Trump',
    country: 'US',
    role: 'President',
    promise:
      'Impose 25% tariffs on all imports from Canada and Mexico on day one to protect American workers.',
    dateMade: '2024-11-01',
    source: 'Campaign rally, Truth Social posts, November 2024',
    category: 'economy',
    status: STATUS.KEPT,
    deliveredPercent: 100,
    evidence:
      'Executive order signed January 20, 2025 imposing 25% tariffs on Canadian and Mexican goods (10% on Canadian energy). Tariffs took effect February 4, 2025.',
    lastChecked: '2026-03-01',
    targetDate: '2025-01-20',
  },
  {
    leaderId: 'trump',
    leaderName: 'Donald Trump',
    country: 'US',
    role: 'President',
    promise:
      'Carry out the largest deportation operation in American history, removing millions of undocumented immigrants.',
    dateMade: '2024-08-22',
    source: 'Republican National Convention speech, August 2024',
    category: 'immigration',
    status: STATUS.IN_PROGRESS,
    deliveredPercent: 22,
    evidence:
      'ICE deportations rose to ~137,000 in FY2025 Q1-Q2, above the prior-year pace but far below the claimed millions. Legal challenges have slowed operations.',
    lastChecked: '2026-03-01',
    targetDate: '2028-01-20',
  },
  {
    leaderId: 'trump',
    leaderName: 'Donald Trump',
    country: 'US',
    role: 'President',
    promise:
      'Make the 2017 Tax Cuts and Jobs Act permanent and add new tax relief for tips and overtime pay.',
    dateMade: '2024-10-15',
    source: 'Campaign economic policy speech, October 2024',
    category: 'economy',
    status: STATUS.IN_PROGRESS,
    deliveredPercent: 30,
    evidence:
      'The "One Big Beautiful Bill" passed the House in March 2026 and is under Senate debate. No-tax-on-tips executive guidance issued but no enacted legislation yet.',
    lastChecked: '2026-03-01',
    targetDate: '2026-12-31',
  },
  {
    leaderId: 'trump',
    leaderName: 'Donald Trump',
    country: 'US',
    role: 'President',
    promise: 'End the war in Ukraine within 24 hours of taking office.',
    dateMade: '2024-06-13',
    source: 'Fox News interview, June 2024',
    category: 'foreign-policy',
    status: STATUS.BROKEN,
    deliveredPercent: 0,
    evidence:
      'The Russia-Ukraine war continues as of March 2026, 14 months into the Trump presidency. Ceasefire talks have stalled; no peace agreement reached.',
    lastChecked: '2026-03-01',
    targetDate: '2025-01-21',
  },
  {
    leaderId: 'trump',
    leaderName: 'Donald Trump',
    country: 'US',
    role: 'President',
    promise:
      'Dramatically expand US oil, gas, and coal production — "Drill, baby, drill" — and achieve energy dominance.',
    dateMade: '2024-07-18',
    source: 'RNC acceptance speech / campaign platform',
    category: 'environment',
    status: STATUS.KEPT,
    deliveredPercent: 100,
    evidence:
      'Declared national energy emergency on day one. Withdrew from the Paris Agreement. Opened federal lands and offshore areas to new drilling leases. US oil production reached record 13.6M bbl/day in Q4 2025.',
    lastChecked: '2026-03-01',
    targetDate: '2025-12-31',
  },

  // ── Anthony Albanese (Australia) ───────────────────────────────────────────
  {
    leaderId: 'albanese',
    leaderName: 'Anthony Albanese',
    country: 'AU',
    role: 'Prime Minister',
    promise:
      'Build 1.2 million new homes over five years (2024–2029) via the National Housing Accord.',
    dateMade: '2023-08-01',
    source: 'National Cabinet statement, August 2023',
    category: 'housing',
    status: STATUS.IN_PROGRESS,
    deliveredPercent: 25,
    evidence:
      'Around 300,000 homes completed of the 1.2M target by early 2026. Annual completions tracking at ~170,000 versus the 240,000 pace required.',
    lastChecked: '2026-03-01',
    targetDate: '2029-12-31',
  },
  {
    leaderId: 'albanese',
    leaderName: 'Anthony Albanese',
    country: 'AU',
    role: 'Prime Minister',
    promise:
      'Cut household electricity bills by $275 per year by 2025 compared to 2022 baselines.',
    dateMade: '2022-05-01',
    source: 'ALP 2022 election platform / campaign launch speech',
    category: 'economy',
    status: STATUS.BROKEN,
    deliveredPercent: 0,
    evidence:
      'Average household electricity bills rose by approximately $400/year between 2022 and 2025, the opposite of the promised reduction. Government cited global energy market pressures.',
    lastChecked: '2026-03-01',
    targetDate: '2025-12-31',
  },
  {
    leaderId: 'albanese',
    leaderName: 'Anthony Albanese',
    country: 'AU',
    role: 'Prime Minister',
    promise:
      'Establish an independent National Anti-Corruption Commission (NACC) within the first term.',
    dateMade: '2022-05-01',
    source: 'ALP 2022 election platform',
    category: 'governance',
    status: STATUS.KEPT,
    deliveredPercent: 100,
    evidence:
      'The NACC commenced operations on July 1, 2023, within the promised first term, with the power to investigate federal politicians and public servants.',
    lastChecked: '2026-03-01',
    targetDate: '2025-05-31',
  },
  {
    leaderId: 'albanese',
    leaderName: 'Anthony Albanese',
    country: 'AU',
    role: 'Prime Minister',
    promise:
      'Deliver a 15% pay rise for aged care workers to address sector workforce shortages.',
    dateMade: '2022-05-01',
    source: 'ALP 2022 election platform / Fair Work Commission submission',
    category: 'healthcare',
    status: STATUS.KEPT,
    deliveredPercent: 100,
    evidence:
      'The Fair Work Commission awarded a 15% pay increase for aged care workers effective July 2023, funded by the federal government as promised.',
    lastChecked: '2026-03-01',
    targetDate: '2023-07-01',
  },
  {
    leaderId: 'albanese',
    leaderName: 'Anthony Albanese',
    country: 'AU',
    role: 'Prime Minister',
    promise:
      'Expand childcare subsidies so no family pays more than 10% of their income on childcare.',
    dateMade: '2022-05-01',
    source: 'ALP 2022 election platform',
    category: 'social',
    status: STATUS.PARTIALLY_KEPT,
    deliveredPercent: 70,
    evidence:
      'Childcare subsidy rate increased from 85% to 90% for most families from July 2023. Around 1.2 million families benefited but the 10%-of-income cap for all families has not been legislated.',
    lastChecked: '2026-03-01',
    targetDate: '2025-12-31',
  },

  // ── Keir Starmer (UK) ──────────────────────────────────────────────────────
  {
    leaderId: 'starmer',
    leaderName: 'Sir Keir Starmer',
    country: 'UK',
    role: 'Prime Minister',
    promise:
      'Build 1.5 million new homes over this Parliament through major planning reform.',
    dateMade: '2024-07-05',
    source: 'King\'s Speech, July 2024 / Labour manifesto 2024',
    category: 'housing',
    status: STATUS.IN_PROGRESS,
    deliveredPercent: 10,
    evidence:
      'Planning and Infrastructure Bill introduced December 2024, restoring mandatory housing targets for local authorities. ~150,000 completions in 2025 — on track only if pace accelerates significantly.',
    lastChecked: '2026-03-01',
    targetDate: '2029-07-31',
  },
  {
    leaderId: 'starmer',
    leaderName: 'Sir Keir Starmer',
    country: 'UK',
    role: 'Prime Minister',
    promise:
      'Achieve the highest sustained growth in the G7 by the end of the Parliament.',
    dateMade: '2024-07-05',
    source: 'Labour manifesto 2024 / post-election press conference',
    category: 'economy',
    status: STATUS.IN_PROGRESS,
    deliveredPercent: 15,
    evidence:
      'UK GDP grew 0.9% in 2025, underperforming the US and Canada. The OBR revised growth forecasts downward in October 2025. Target remains achievable over a full Parliament.',
    lastChecked: '2026-03-01',
    targetDate: '2029-07-31',
  },
  {
    leaderId: 'starmer',
    leaderName: 'Sir Keir Starmer',
    country: 'UK',
    role: 'Prime Minister',
    promise: 'Reduce NHS waiting lists and cut treatment waiting times within five years.',
    dateMade: '2024-07-05',
    source: 'Labour manifesto 2024 / NHS Long-Term Workforce Plan',
    category: 'healthcare',
    status: STATUS.IN_PROGRESS,
    deliveredPercent: 20,
    evidence:
      'NHS England waiting list fell from 7.6M in July 2024 to 7.2M by January 2026 — a modest reduction. An additional £22.6B in NHS funding announced in the October 2025 Budget.',
    lastChecked: '2026-03-01',
    targetDate: '2029-07-31',
  },
  {
    leaderId: 'starmer',
    leaderName: 'Sir Keir Starmer',
    country: 'UK',
    role: 'Prime Minister',
    promise:
      'Set up Great British Energy — a publicly owned clean energy company — within the first year.',
    dateMade: '2024-07-05',
    source: 'Labour manifesto 2024',
    category: 'environment',
    status: STATUS.KEPT,
    deliveredPercent: 100,
    evidence:
      'The Great British Energy Act received Royal Assent in February 2025, establishing the company as promised within the first year of government. Headquartered in Aberdeen.',
    lastChecked: '2026-03-01',
    targetDate: '2025-07-31',
  },
  {
    leaderId: 'starmer',
    leaderName: 'Sir Keir Starmer',
    country: 'UK',
    role: 'Prime Minister',
    promise:
      'No increases to income tax rates, National Insurance contributions for workers, or VAT.',
    dateMade: '2024-06-01',
    source: 'Labour manifesto 2024 / Starmer TV debate pledge',
    category: 'economy',
    status: STATUS.BROKEN,
    deliveredPercent: 0,
    evidence:
      "The October 2025 Budget raised employers' National Insurance from 13.8% to 15% and cut the secondary threshold from £9,100 to £5,000 — widely seen as breaking the spirit of the pledge despite the technical argument it applied only to 'working people'.",
    lastChecked: '2026-03-01',
    targetDate: '2029-07-31',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcPromisePoints(promise) {
  const base = STATUS_POINTS[promise.status];
  if (base !== null) return base;
  // Partially Kept — use deliveredPercent
  return typeof promise.deliveredPercent === 'number' ? promise.deliveredPercent : 50;
}

/**
 * Calculate a 0–100 Promise Score for a single leader.
 * Weighted average: Kept=100, Partially Kept=deliveredPercent, In Progress=25,
 * Not Started=0, Broken=0.
 */
function calcLeaderScore(promises) {
  if (!promises.length) return 0;
  const total = promises.reduce((sum, p) => sum + calcPromisePoints(p), 0);
  return Math.round(total / promises.length);
}

/**
 * Plain-language status update for a single promise.
 * Format: "<Leader> promised to <promise> — <evidence> — <X>% delivered"
 */
function buildUpdate(promise) {
  const pct =
    promise.status === STATUS.KEPT
      ? 100
      : promise.status === STATUS.BROKEN || promise.status === STATUS.NOT_STARTED
      ? 0
      : typeof promise.deliveredPercent === 'number'
      ? promise.deliveredPercent
      : null;

  const pctStr = pct !== null ? ` — ${pct}% delivered` : '';
  const shortPromise =
    promise.promise.length > 120 ? promise.promise.slice(0, 117) + '…' : promise.promise;

  return `${promise.leaderName} promised to ${shortPromise.charAt(0).toLowerCase()}${shortPromise.slice(1)} — ${promise.evidence}${pctStr}.`;
}

// ─── Core processor ───────────────────────────────────────────────────────────

/**
 * Process promises for all leaders and return enriched records + per-leader summaries.
 *
 * @param {Array} promises - Raw promise records (defaults to built-in PROMISES)
 * @returns {{ enriched: Array, summaries: Array }}
 */
export function processPromises(promises = PROMISES) {
  const byLeader = {};
  for (const p of promises) {
    if (!byLeader[p.leaderId]) byLeader[p.leaderId] = [];
    byLeader[p.leaderId].push(p);
  }

  const enriched = promises.map((p) => ({
    ...p,
    points: calcPromisePoints(p),
    update: buildUpdate(p),
  }));

  const summaries = Object.entries(byLeader).map(([leaderId, leaderPromises]) => {
    const score = calcLeaderScore(leaderPromises);
    const counts = Object.values(STATUS).reduce((acc, s) => {
      acc[s] = leaderPromises.filter((p) => p.status === s).length;
      return acc;
    }, {});
    const rep = leaderPromises[0];
    return {
      leaderId,
      leaderName: rep.leaderName,
      country: rep.country,
      role: rep.role,
      promiseScore: score,
      totalPromises: leaderPromises.length,
      statusBreakdown: counts,
      scoreLabel:
        score >= 75 ? 'Strong' : score >= 50 ? 'Moderate' : score >= 25 ? 'Weak' : 'Poor',
    };
  });

  return { enriched, summaries };
}

// ─── Firestore persistence ────────────────────────────────────────────────────

/**
 * Save promise records and leader summaries to Firestore "promise_tracker".
 * Clears previous docs for the provided countries before writing.
 *
 * @param {Array} enriched  - Enriched promise records from processPromises()
 * @param {Array} summaries - Leader summary records from processPromises()
 * @returns {Promise<{ saved: number, errors: number }>}
 */
export async function savePromises(enriched, summaries) {
  const col = collection(db, 'promise_tracker');
  const countries = [...new Set(enriched.map((p) => p.country))];

  // Clear stale docs per country
  await Promise.all(
    countries.map(async (country) => {
      try {
        const stale = await getDocs(query(col, where('country', '==', country)));
        await Promise.all(stale.docs.map((d) => deleteDoc(d.ref)));
      } catch (_) {
        // Non-fatal
      }
    })
  );

  let saved = 0;
  let errors = 0;

  const docs = [
    ...enriched.map((p) => ({ ...p, docType: 'promise' })),
    ...summaries.map((s) => ({ ...s, docType: 'leaderSummary' })),
  ];

  await Promise.all(
    docs.map(async (doc) => {
      try {
        await addDoc(col, { ...doc, createdAt: serverTimestamp() });
        saved++;
      } catch (e) {
        console.error('[promiseTracker] Failed to save doc:', e, doc);
        errors++;
      }
    })
  );

  return { saved, errors };
}

// ─── Top-level runner ─────────────────────────────────────────────────────────

/**
 * Run the full promise tracking pipeline and persist to Firestore.
 *
 * @param {Array} [promises] - Override promise dataset (defaults to built-in PROMISES)
 * @returns {Promise<{ enriched: Array, summaries: Array, saved: number, errors: number }>}
 */
export async function runPromiseTracker(promises = PROMISES) {
  const { enriched, summaries } = processPromises(promises);

  console.log('[promiseTracker] Leader Promise Scores:');
  summaries.forEach((s) =>
    console.log(`  ${s.leaderName} (${s.country}): ${s.promiseScore}/100 — ${s.scoreLabel}`)
  );

  console.log('\n[promiseTracker] Individual promise updates:');
  enriched.forEach((p) => console.log(`  [${p.status}] ${p.update}`));

  const { saved, errors } = await savePromises(enriched, summaries);
  console.log(
    `\n[promiseTracker] Saved ${saved} record(s) to Firestore (${errors} error(s))`
  );

  return { enriched, summaries, saved, errors };
}

export default runPromiseTracker;
