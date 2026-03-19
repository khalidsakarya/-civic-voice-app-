/**
 * Tiered Scheduler
 *
 * A browser-compatible, Firestore-backed job scheduler that runs processing
 * pipelines on configurable intervals without requiring a backend server.
 *
 * Tiers
 * ─────
 *   DAILY   (24 h)  — Lightweight checks: analytics flush, notification refresh
 *   WEEKLY  (7 d)   — Medium-weight: promise status checks, lobby correlations
 *   MONTHLY (30 d)  — Heavy: full audit re-runs, aggregate scoring
 *
 * How it works
 * ────────────
 *   1. On app initialisation call `initScheduler()`.
 *   2. The scheduler reads last-run timestamps from Firestore
 *      collection "scheduler_state".
 *   3. Any job whose interval has elapsed is queued and executed.
 *   4. Timestamps are updated in Firestore after each successful run.
 *   5. A heartbeat (default every 60 s) re-checks for due jobs while
 *      the app tab remains open.
 *
 * Usage
 * ─────
 *   import { initScheduler } from './processing/scheduler.js';
 *
 *   // In your root component or App.js useEffect:
 *   useEffect(() => {
 *     const stop = initScheduler({ members, departments, contracts });
 *     return stop; // cleans up the heartbeat on unmount
 *   }, []);
 */

import { db } from '../firebase.js';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { runPromiseTracker } from './promiseTracker.js';
import { runCorrelation } from './lobbyCorrelator.js';
import { runForeignAidFetcher } from '../ingestion/foreignAidFetcher.js';
import { runMilitarySpendingFetcher } from '../ingestion/militarySpendingFetcher.js';

// ─── Tier definitions ─────────────────────────────────────────────────────────

const MS = {
  MINUTE: 60_000,
  HOUR:   3_600_000,
  DAY:    86_400_000,
  WEEK:   7 * 86_400_000,
  MONTH:  30 * 86_400_000,
};

export const TIERS = {
  DAILY:   'daily',
  WEEKLY:  'weekly',
  MONTHLY: 'monthly',
};

const TIER_INTERVALS = {
  [TIERS.DAILY]:   MS.DAY,
  [TIERS.WEEKLY]:  MS.WEEK,
  [TIERS.MONTHLY]: MS.MONTH,
};

// Heartbeat: how often the scheduler re-checks for due jobs (while tab is open)
const HEARTBEAT_MS = 60 * MS.MINUTE; // every 60 minutes

// Firestore collection that stores last-run metadata
const STATE_COLLECTION = 'scheduler_state';

// ─── Job registry ─────────────────────────────────────────────────────────────
//
// Each job:
//   id       — unique snake_case identifier (used as Firestore doc id)
//   tier     — TIERS.DAILY | TIERS.WEEKLY | TIERS.MONTHLY
//   label    — human-readable name shown in console
//   handler  — async function(context) → any
//              context = { members, departments, contracts, country }

const JOBS = [
  // ── WEEKLY jobs ────────────────────────────────────────────────────────────

  {
    id: 'promise_tracker_ca',
    tier: TIERS.WEEKLY,
    label: 'Promise Tracker — Canada',
    handler: async () => {
      console.log('[scheduler] Running promise tracker for CA');
      return runPromiseTracker();
    },
  },
  {
    id: 'promise_tracker_us',
    tier: TIERS.WEEKLY,
    label: 'Promise Tracker — United States',
    handler: async () => {
      console.log('[scheduler] Running promise tracker for US');
      return runPromiseTracker();
    },
  },
  {
    id: 'promise_tracker_au',
    tier: TIERS.WEEKLY,
    label: 'Promise Tracker — Australia',
    handler: async () => {
      console.log('[scheduler] Running promise tracker for AU');
      return runPromiseTracker();
    },
  },
  {
    id: 'promise_tracker_uk',
    tier: TIERS.WEEKLY,
    label: 'Promise Tracker — United Kingdom',
    handler: async () => {
      console.log('[scheduler] Running promise tracker for UK');
      return runPromiseTracker();
    },
  },
  {
    id: 'lobby_correlator_au',
    tier: TIERS.WEEKLY,
    label: 'Lobby Correlator — Australia',
    handler: async ({ members = [], departments = [], contracts = [] } = {}) => {
      console.log('[scheduler] Running lobby correlator for AU');
      return runCorrelation({ members, departments, contracts, country: 'AU' });
    },
  },
  {
    id: 'lobby_correlator_us',
    tier: TIERS.WEEKLY,
    label: 'Lobby Correlator — United States',
    handler: async ({ members = [], departments = [], contracts = [] } = {}) => {
      console.log('[scheduler] Running lobby correlator for US');
      return runCorrelation({ members, departments, contracts, country: 'US' });
    },
  },
  {
    id: 'lobby_correlator_ca',
    tier: TIERS.WEEKLY,
    label: 'Lobby Correlator — Canada',
    handler: async ({ members = [], departments = [], contracts = [] } = {}) => {
      console.log('[scheduler] Running lobby correlator for CA');
      return runCorrelation({ members, departments, contracts, country: 'CA' });
    },
  },
  {
    id: 'lobby_correlator_uk',
    tier: TIERS.WEEKLY,
    label: 'Lobby Correlator — United Kingdom',
    handler: async ({ members = [], departments = [], contracts = [] } = {}) => {
      console.log('[scheduler] Running lobby correlator for UK');
      return runCorrelation({ members, departments, contracts, country: 'UK' });
    },
  },
  {
    id: 'foreign_aid_all',
    tier: TIERS.WEEKLY,
    label: 'Foreign Aid Fetcher — All Countries',
    handler: async () => {
      console.log('[scheduler] Running foreign aid fetcher (CA, US, UK, AU)');
      return runForeignAidFetcher(['CA', 'US', 'UK', 'AU']);
    },
  },
  {
    id: 'military_spending_all',
    tier: TIERS.WEEKLY,
    label: 'Military Spending Tracker — All Countries',
    handler: async () => {
      console.log('[scheduler] Running military spending tracker (CA, US, UK, AU)');
      return runMilitarySpendingFetcher(['CA', 'US', 'UK', 'AU']);
    },
  },

  // ── DAILY jobs ─────────────────────────────────────────────────────────────

  {
    id: 'health_check',
    tier: TIERS.DAILY,
    label: 'Scheduler Health Check',
    handler: async () => {
      console.log('[scheduler] Daily health check passed —', new Date().toISOString());
      return { ok: true };
    },
  },

  // ── MONTHLY jobs ───────────────────────────────────────────────────────────

  {
    id: 'full_promise_refresh',
    tier: TIERS.MONTHLY,
    label: 'Full Promise Tracker Refresh (all countries)',
    handler: async () => {
      console.log('[scheduler] Running monthly full promise refresh');
      return runPromiseTracker();
    },
  },
  {
    id: 'foreign_aid_full_refresh',
    tier: TIERS.MONTHLY,
    label: 'Foreign Aid Full Refresh — All Countries',
    handler: async () => {
      console.log('[scheduler] Running monthly foreign aid full refresh');
      return runForeignAidFetcher(['CA', 'US', 'UK', 'AU']);
    },
  },
  {
    id: 'military_spending_full_refresh',
    tier: TIERS.MONTHLY,
    label: 'Military Spending Full Refresh — All Countries',
    handler: async () => {
      console.log('[scheduler] Running monthly military spending full refresh');
      return runMilitarySpendingFetcher(['CA', 'US', 'UK', 'AU']);
    },
  },
];

// ─── Firestore state helpers ──────────────────────────────────────────────────

/**
 * Read the last-run timestamp for a job from Firestore.
 * Returns a Date or null if the job has never run.
 */
async function getLastRun(jobId) {
  try {
    const ref = doc(db, STATE_COLLECTION, jobId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    const { lastRun } = snap.data();
    if (!lastRun) return null;
    // Firestore Timestamp → JS Date
    return lastRun instanceof Timestamp ? lastRun.toDate() : new Date(lastRun);
  } catch (e) {
    console.warn(`[scheduler] Could not read state for "${jobId}":`, e.message);
    return null;
  }
}

/**
 * Write the current timestamp as lastRun for a job to Firestore.
 */
async function markRan(jobId, result = {}) {
  try {
    const ref = doc(db, STATE_COLLECTION, jobId);
    await setDoc(ref, {
      jobId,
      lastRun: serverTimestamp(),
      lastResult: summariseResult(result),
    });
  } catch (e) {
    console.warn(`[scheduler] Could not save state for "${jobId}":`, e.message);
  }
}

function summariseResult(result) {
  if (!result || typeof result !== 'object') return String(result ?? 'ok');
  // Keep only scalar fields to avoid Firestore size limits
  const summary = {};
  for (const [k, v] of Object.entries(result)) {
    if (typeof v === 'number' || typeof v === 'string' || typeof v === 'boolean') {
      summary[k] = v;
    }
  }
  return summary;
}

// ─── Due-check logic ──────────────────────────────────────────────────────────

/**
 * Determine whether a job is due to run.
 *
 * @param {string} jobId
 * @param {string} tier  — TIERS.*
 * @returns {Promise<boolean>}
 */
async function isDue(jobId, tier) {
  const interval = TIER_INTERVALS[tier];
  if (!interval) return false;
  const lastRun = await getLastRun(jobId);
  if (!lastRun) return true; // never run → run now
  return Date.now() - lastRun.getTime() >= interval;
}

// ─── Job runner ───────────────────────────────────────────────────────────────

/**
 * Check all registered jobs and run any that are due.
 *
 * @param {object} context — passed to each job handler
 * @param {object} [options]
 * @param {string[]} [options.tiers] — limit to specific tiers (default: all)
 * @returns {Promise<{ ran: string[], skipped: string[], failed: string[] }>}
 */
export async function runDueJobs(context = {}, { tiers } = {}) {
  const targetTiers = tiers ? new Set(tiers) : null;
  const ran = [], skipped = [], failed = [];

  // Check jobs in parallel, then run due ones sequentially to avoid race conditions
  const checks = await Promise.all(
    JOBS
      .filter((j) => !targetTiers || targetTiers.has(j.tier))
      .map(async (job) => ({ job, due: await isDue(job.id, job.tier) }))
  );

  const dueJobs = checks.filter((c) => c.due).map((c) => c.job);
  const notDue  = checks.filter((c) => !c.due).map((c) => c.job);

  notDue.forEach((j) => {
    console.log(`[scheduler] Skipping "${j.label}" — not yet due`);
    skipped.push(j.id);
  });

  for (const job of dueJobs) {
    console.log(`[scheduler] Running "${job.label}" (tier: ${job.tier})`);
    try {
      const result = await job.handler(context);
      await markRan(job.id, result);
      ran.push(job.id);
      console.log(`[scheduler] ✓ "${job.label}" complete`);
    } catch (e) {
      console.error(`[scheduler] ✗ "${job.label}" failed:`, e);
      failed.push(job.id);
    }
  }

  return { ran, skipped, failed };
}

// ─── Scheduler initialiser ────────────────────────────────────────────────────

/**
 * Initialise the scheduler. Runs due jobs immediately, then starts a
 * heartbeat timer to re-check while the browser tab stays open.
 *
 * Call this once from your root component's useEffect.
 *
 * @param {object} context — { members, departments, contracts } data for handlers
 * @param {object} [options]
 * @param {number} [options.heartbeatMs]  — override heartbeat interval (ms)
 * @param {boolean} [options.runOnInit]   — run due jobs immediately (default true)
 * @returns {() => void} — cleanup function (call on component unmount)
 *
 * @example
 *   useEffect(() => {
 *     const stop = initScheduler({ members, departments, contracts });
 *     return stop;
 *   }, []);
 */
export function initScheduler(context = {}, { heartbeatMs = HEARTBEAT_MS, runOnInit = true } = {}) {
  console.log('[scheduler] Initialising tiered scheduler');
  console.log('[scheduler] Tiers:', Object.entries(TIER_INTERVALS)
    .map(([t, ms]) => `${t}=${ms / MS.HOUR}h`).join(', '));
  console.log('[scheduler] Registered jobs:', JOBS.length,
    `(${JOBS.filter((j) => j.tier === TIERS.DAILY).length} daily,`,
    `${JOBS.filter((j) => j.tier === TIERS.WEEKLY).length} weekly,`,
    `${JOBS.filter((j) => j.tier === TIERS.MONTHLY).length} monthly)`);

  let stopped = false;
  let heartbeatId = null;

  async function tick() {
    if (stopped) return;
    try {
      const result = await runDueJobs(context);
      if (result.ran.length) {
        console.log(`[scheduler] Tick complete — ran: [${result.ran.join(', ')}]`);
      }
    } catch (e) {
      console.error('[scheduler] Tick error:', e);
    }
  }

  // Run immediately on init
  if (runOnInit) {
    // Slight delay to let the app finish mounting before hitting Firestore
    setTimeout(tick, 2000);
  }

  // Start heartbeat
  heartbeatId = setInterval(tick, heartbeatMs);

  // Return cleanup function
  return function stopScheduler() {
    stopped = true;
    if (heartbeatId !== null) {
      clearInterval(heartbeatId);
      heartbeatId = null;
    }
    console.log('[scheduler] Stopped');
  };
}

// ─── Manual trigger helpers ───────────────────────────────────────────────────

/**
 * Force-run a specific job by id, bypassing the due-date check.
 * Useful for admin panels or debugging.
 *
 * @param {string} jobId
 * @param {object} context
 */
export async function forceRun(jobId, context = {}) {
  const job = JOBS.find((j) => j.id === jobId);
  if (!job) throw new Error(`[scheduler] Unknown job id: "${jobId}"`);
  console.log(`[scheduler] Force-running "${job.label}"`);
  const result = await job.handler(context);
  await markRan(job.id, result);
  return result;
}

/**
 * Force-run all jobs in a specific tier immediately.
 *
 * @param {string} tier — TIERS.*
 * @param {object} context
 */
export async function forceRunTier(tier, context = {}) {
  const jobs = JOBS.filter((j) => j.tier === tier);
  console.log(`[scheduler] Force-running all ${tier} jobs (${jobs.length})`);
  return runDueJobs(context, { tiers: [tier] });
}

/**
 * Return the schedule status of all registered jobs (last run + next run).
 * Useful for admin/debug dashboards.
 *
 * @returns {Promise<Array<{ id, label, tier, lastRun, nextRun, overdue }>>}
 */
export async function getScheduleStatus() {
  const now = Date.now();
  return Promise.all(
    JOBS.map(async (job) => {
      const lastRun = await getLastRun(job.id);
      const interval = TIER_INTERVALS[job.tier];
      const nextRun = lastRun ? new Date(lastRun.getTime() + interval) : new Date(now);
      const overdue = now >= nextRun.getTime();
      return {
        id: job.id,
        label: job.label,
        tier: job.tier,
        lastRun: lastRun ? lastRun.toISOString() : null,
        nextRun: nextRun.toISOString(),
        overdue,
      };
    })
  );
}

export { JOBS };
export default initScheduler;
