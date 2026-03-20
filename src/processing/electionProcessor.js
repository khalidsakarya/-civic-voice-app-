/**
 * Election Processor
 *
 * Reads raw election documents saved by electionFetcher into Firestore,
 * applies statistical analysis, and runs them through Claude AI to produce
 * richer, structured insights than the fetcher's quick pass allows.
 *
 * What the fetcher does vs what this processor adds
 * ──────────────────────────────────────────────────
 *   Fetcher  — ingests raw API data, stores snapshots, runs a basic one-shot
 *              Claude summary per country.
 *   Processor — reads those snapshots, builds a multi-part analytical context
 *              (polling maths, seat projection, battleground risk scores,
 *              historical swing deltas, confidence calibration) and asks Claude
 *              for a richer, structured briefing with scenario modelling.
 *
 * Claude output per country (docType: 'processedBriefing')
 * ─────────────────────────────────────────────────────────
 *   outcomePrediction   — likely winner / leading party with nuance
 *   confidencePct       — 0–100, calibrated against margin of error and lead
 *   keyIssues           — string[3-5] driving the election
 *   electionBriefing    — 2-3 sentence plain-language citizen summary
 *   scenarioA           — what happens if polls are broadly correct
 *   scenarioB           — what happens if incumbent underperforms by 3 pts
 *   battlegroundVerdict — which seat to watch most and why
 *   momentumParty       — party with upward trajectory right now
 *   riskFactors         — string[2-3] things that could change the outcome
 *
 * Firestore collection: "elections"
 *   Reads  — docType: upcomingElection | pollingSnapshot | electionResult | battleground
 *   Writes — docType: processedBriefing  (one per country, replaces previous)
 *
 * Scheduling
 * ──────────
 *   runElectionProcessor(countries)  — main entry point
 *   Scheduler jobs added:
 *     election_processor_daily   DAILY   — only when isElectionPeriod() true
 *     election_processor_weekly  WEEKLY  — full run every 7 days
 *
 * Env vars required
 * ─────────────────
 *   REACT_APP_ANTHROPIC_API_KEY
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
import { isElectionPeriod } from '../ingestion/electionFetcher.js';

// ─── Config ───────────────────────────────────────────────────────────────────

const ANTHROPIC_KEY   = process.env.REACT_APP_ANTHROPIC_API_KEY;
const CLAUDE_DELAY_MS = 300;

// Polling accuracy assumptions: how many points off polls typically are
const POLLING_ERROR = { CA: 2.5, US: 3.0, UK: 2.0, AU: 2.5 };

// Historical incumbent midterm penalty (US specific)
const US_MIDTERM_PENALTY = 5; // pts against president's party on generic ballot

// ─── Firestore data loader ────────────────────────────────────────────────────

/**
 * Load all election documents for a country grouped by docType.
 */
async function loadCountryData(country) {
  const col = collection(db, 'elections');
  const snap = await getDocs(query(col, where('country', '==', country)));

  const grouped = {
    upcomingElections: [],
    pollingSnapshots:  [],
    electionResults:   [],
    battlegrounds:     [],
    fecRaces:          [],
  };

  snap.forEach((d) => {
    const data = d.data();
    switch (data.docType) {
      case 'upcomingElection': grouped.upcomingElections.push(data); break;
      case 'pollingSnapshot':  grouped.pollingSnapshots.push(data);  break;
      case 'electionResult':   grouped.electionResults.push(data);   break;
      case 'battleground':     grouped.battlegrounds.push(data);     break;
      case 'fecRace':          grouped.fecRaces.push(data);          break;
      default: break;
    }
  });

  return grouped;
}

// ─── Statistical analysis helpers ─────────────────────────────────────────────

/**
 * Extract the top-two parties from a polling standings array and
 * return the leader, trailer, lead margin, and adjusted lead after
 * subtracting the country's typical polling error.
 */
function calcPollingLead(standings = []) {
  if (!standings.length) return null;
  const sorted = [...standings].sort((a, b) => (b.support ?? 0) - (a.support ?? 0));
  const [first, second] = sorted;
  const lead = ((first.support ?? 0) - (second?.support ?? 0));
  return {
    leader:  first.party,
    trailer: second?.party ?? 'Unknown',
    leadPct: +lead.toFixed(1),
    leaderSupport:  first.support  ?? 0,
    trailerSupport: second?.support ?? 0,
    leaderApproval: first.leaderApproval ?? null,
  };
}

/**
 * Calibrate a confidence percentage based on:
 *   - polling lead vs margin of error
 *   - days until the election (closer = more reliable)
 *   - whether it's a US midterm (applies incumbent penalty)
 */
function calibrateConfidence(country, leadInfo, nextElection) {
  if (!leadInfo) return 40;

  const error       = POLLING_ERROR[country] ?? 2.5;
  const lead        = leadInfo.leadPct;
  const daysToVote  = nextElection
    ? Math.max(0, (new Date(nextElection.expectedDate) - Date.now()) / 86_400_000)
    : 365;

  // Base confidence from lead vs MoE
  let confidence;
  if      (lead > error * 2) confidence = 75;
  else if (lead > error)     confidence = 60;
  else if (lead > 0)         confidence = 50;
  else                       confidence = 42;

  // Reduce confidence the further away the election is
  if (daysToVote > 365) confidence -= 15;
  else if (daysToVote > 180) confidence -= 8;
  else if (daysToVote < 30)  confidence += 8; // close polls are more reliable

  // US midterm incumbent penalty increases uncertainty
  if (country === 'US' && nextElection?.type === 'midterm') confidence -= 5;

  return Math.min(90, Math.max(25, Math.round(confidence)));
}

/**
 * Score each battleground seat by how likely it is to change hands,
 * given the current polling lead direction.
 * Returns sorted array from highest-risk to lowest-risk.
 */
function scoreBattlegrounds(battlegrounds, leadInfo) {
  if (!battlegrounds.length || !leadInfo) return battlegrounds;

  return battlegrounds
    .map((bg) => {
      const margin = bg.marginPct ?? bg.margin ?? 5;
      const currentPartyIsLeading = bg.currentParty === leadInfo.leader;

      // Risk = how likely the seat flips
      // Small margin + trailing party = high risk
      let riskScore = Math.max(0, 10 - margin); // 0–10 base
      if (!currentPartyIsLeading) riskScore += 3; // current holder is trailing nationally
      if (margin < 2) riskScore += 2;             // ultra-marginal bonus

      return { ...bg, riskScore: Math.min(10, +riskScore.toFixed(1)) };
    })
    .sort((a, b) => b.riskScore - a.riskScore);
}

/**
 * Calculate the swing delta between current polling and the last election result.
 * Returns array of { party, lastResult, currentPoll, swing } for the top parties.
 */
function calcSwingDeltas(standings = [], lastResult = null) {
  if (!lastResult?.results) return [];
  return standings
    .map((poll) => {
      const prev = lastResult.results.find(
        (r) => r.party.toLowerCase() === poll.party.toLowerCase()
      );
      if (!prev) return null;
      const swing = +((poll.support ?? 0) - (prev.votePct ?? 0)).toFixed(1);
      return { party: poll.party, lastResultPct: prev.votePct, currentPollPct: poll.support, swing };
    })
    .filter(Boolean)
    .sort((a, b) => Math.abs(b.swing) - Math.abs(a.swing));
}

/**
 * Rough seat projection for first-past-the-post systems.
 * Uses uniform swing from last result; very approximate.
 */
function projectSeats(lastResult, swingDeltas, totalSeats) {
  if (!lastResult?.results || !totalSeats) return null;
  const projected = lastResult.results.map((r) => {
    const delta = swingDeltas.find((s) => s.party.toLowerCase() === r.party.toLowerCase());
    const swingAdj = delta ? delta.swing : 0;
    // Proportional seat adjustment (crude UNS model)
    const projectedVotePct = Math.max(0, (r.votePct ?? 0) + swingAdj);
    const scaledSeats = Math.round((r.seats ?? 0) * (projectedVotePct / (r.votePct || 1)));
    return { party: r.party, projectedSeats: scaledSeats, projectedVotePct: +projectedVotePct.toFixed(1) };
  });
  return projected;
}

// ─── Claude AI analysis ───────────────────────────────────────────────────────

async function analyzeWithClaude(country, analysisContext) {
  if (!ANTHROPIC_KEY) {
    console.warn('[electionProcessor] No Anthropic key — using rule-based briefing');
    return buildRuleBasedBriefing(country, analysisContext);
  }

  const {
    nextElection, pollingLead, confidence, swingDeltas,
    seatProjection, rankedBattlegrounds, polling, lastResult,
  } = analysisContext;

  const topBattleground = rankedBattlegrounds[0];
  const swingSummary = swingDeltas.slice(0, 3)
    .map((s) => `${s.party}: ${s.swing > 0 ? '+' : ''}${s.swing}% vs last election`)
    .join('; ');

  const projectionLines = (seatProjection ?? [])
    .map((p) => `${p.party}: ~${p.projectedSeats} seats (${p.projectedVotePct}%)`)
    .join(', ');

  const standingsLines = (polling?.standings ?? polling?.genericBallot ?? [])
    .map((s) => `${s.party} ${s.support ?? s.repPct ?? '?'}%${s.leaderApproval ? ` (leader approval ${s.leaderApproval}%)` : ''}`)
    .join(', ');

  const prompt = `You are a senior non-partisan electoral analyst. Using the data below, produce a structured analysis of the political situation in ${country}.

NEXT ELECTION:
${nextElection ? `${nextElection.name} on ${nextElection.expectedDate} (${nextElection.type})` : 'No imminent election — next one expected in 2+ years'}
${nextElection?.description ?? ''}

CURRENT POLLING:
${standingsLines || 'No polling data available'}
Source: ${polling?.source ?? 'unknown'} | MoE: ±${polling?.marginOfError ?? '?'}%
${polling?.presidentApproval ? `Presidential approval: ${polling.presidentApproval.approve}% approve / ${polling.presidentApproval.disapprove}% disapprove` : ''}

POLLING LEAD ANALYSIS:
Leading party: ${pollingLead?.leader ?? 'unclear'} with ${pollingLead?.leadPct ?? 0}pt lead
Calibrated confidence of leading party winning: ${confidence}%

SWING FROM LAST ELECTION:
${swingSummary || 'No swing data — no prior result available'}

SEAT PROJECTION (uniform national swing — approximate):
${projectionLines || 'Not calculable'}

MOST WATCHED BATTLEGROUND:
${topBattleground ? `${topBattleground.name} (currently ${topBattleground.currentParty}, margin ${topBattleground.marginPct ?? '?'}%, risk score ${topBattleground.riskScore}/10) — ${topBattleground.watchReason}` : 'No battleground data'}

LAST ELECTION RESULT:
${lastResult ? `${lastResult.name} (${lastResult.date}): ${lastResult.winner} won under ${lastResult.winnerLeader} (${lastResult.governmentType ?? ''} government)` : 'No recent result on record'}

Return ONLY valid JSON — no markdown fences, no preamble:
{
  "outcomePrediction": "one sentence: who is favoured to win/lead and why",
  "confidencePct": <integer 0-100>,
  "keyIssues": ["issue 1", "issue 2", "issue 3"],
  "electionBriefing": "2-3 plain sentences a non-political citizen would understand",
  "scenarioA": "one sentence: what happens if polls are broadly correct",
  "scenarioB": "one sentence: what happens if leading party underperforms by 3 points",
  "battlegroundVerdict": "one sentence on the most important seat/race to watch",
  "momentumParty": "party name",
  "riskFactors": ["risk 1", "risk 2"]
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
        max_tokens: 700,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!res.ok) throw new Error(`Claude ${res.status}: ${await res.text()}`);
    const data   = await res.json();
    const text   = data.content?.[0]?.text ?? '{}';
    const parsed = JSON.parse(text.replace(/```json\n?|\n?```/g, '').trim());
    return { ...parsed, analysisSource: 'claude' };
  } catch (err) {
    console.warn(`[electionProcessor] Claude failed for ${country}:`, err.message);
    return buildRuleBasedBriefing(country, analysisContext);
  }
}

function buildRuleBasedBriefing(country, { nextElection, pollingLead, confidence, lastResult, rankedBattlegrounds }) {
  const top   = rankedBattlegrounds?.[0];
  const elect = nextElection;

  return {
    outcomePrediction: pollingLead
      ? `${pollingLead.leader} leads ${pollingLead.trailer} by ${pollingLead.leadPct} points; currently the most likely winner.`
      : `No clear polling leader identified for ${country}.`,
    confidencePct: confidence ?? 40,
    keyIssues: ['cost of living', 'economic management', 'healthcare'],
    electionBriefing: elect
      ? `${elect.name} is scheduled for ${elect.expectedDate}. ${elect.description ?? ''} Based on current polling, ${pollingLead?.leader ?? 'no party'} holds the lead.`
      : `No imminent election in ${country}. Current polling shows ${pollingLead?.leader ?? 'no clear leader'}.`,
    scenarioA: `If polls hold, ${pollingLead?.leader ?? 'the leading party'} wins a comfortable mandate.`,
    scenarioB: `A 3-point underperformance by ${pollingLead?.leader ?? 'the leading party'} would likely produce a hung parliament or narrow loss.`,
    battlegroundVerdict: top
      ? `Watch ${top.name}: margin of ${top.marginPct ?? '?'}% and a risk score of ${top.riskScore}/10 make it the most likely to flip.`
      : 'No battleground data available.',
    momentumParty: pollingLead?.leader ?? 'Unknown',
    riskFactors: ['polling error', 'late-breaking events'],
    analysisSource: 'rule-based',
  };
}

// ─── Firestore write ──────────────────────────────────────────────────────────

async function clearProcessedBriefings(country) {
  try {
    const col  = collection(db, 'elections');
    const snap = await getDocs(
      query(col, where('country', '==', country), where('docType', '==', 'processedBriefing'))
    );
    await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
  } catch (err) {
    console.warn(`[electionProcessor] Could not clear old briefings for ${country}:`, err.message);
  }
}

async function saveBriefing(country, briefing, meta) {
  try {
    const ref = await addDoc(collection(db, 'elections'), {
      country,
      docType: 'processedBriefing',
      processedAt: serverTimestamp(),
      ...briefing,
      // attach the analytical metadata alongside the Claude output
      pollingLead:       meta.pollingLead,
      confidence:        meta.confidence,
      swingDeltas:       meta.swingDeltas,
      seatProjection:    meta.seatProjection,
      rankedBattlegrounds: meta.rankedBattlegrounds,
      nextElectionName:  meta.nextElection?.name  ?? null,
      nextElectionDate:  meta.nextElection?.expectedDate ?? null,
      nextElectionType:  meta.nextElection?.type  ?? null,
      inElectionPeriod:  isElectionPeriod(country),
    });
    console.log(`[electionProcessor] Saved processedBriefing for ${country}: ${ref.id}`);
    return ref.id;
  } catch (err) {
    console.error(`[electionProcessor] Firestore write failed for ${country}:`, err.message);
    throw err;
  }
}

// ─── Per-country orchestrator ─────────────────────────────────────────────────

async function processCountry(country) {
  console.log(`[electionProcessor] Processing ${country}…`);

  // 1. Load raw data saved by the fetcher
  const data = await loadCountryData(country);

  if (!data.upcomingElections.length && !data.pollingSnapshots.length) {
    console.warn(`[electionProcessor] No election data in Firestore for ${country} — run electionFetcher first`);
    return null;
  }

  // 2. Pick the next concrete (non-expected) upcoming election
  const nextElection = data.upcomingElections
    .filter((e) => e.status === 'upcoming')
    .sort((a, b) => new Date(a.expectedDate) - new Date(b.expectedDate))[0]
    ?? data.upcomingElections.sort((a, b) => new Date(a.expectedDate) - new Date(b.expectedDate))[0]
    ?? null;

  // 3. Most recent polling snapshot
  const polling = data.pollingSnapshots[0] ?? null;

  // 4. Most recent election result
  const lastResult = data.electionResults
    .sort((a, b) => new Date(b.date) - new Date(a.date))[0]
    ?? null;

  // 5. Statistical calculations
  const standings         = polling?.standings ?? polling?.genericBallot ?? [];
  const pollingLead       = calcPollingLead(standings);
  const confidence        = calibrateConfidence(country, pollingLead, nextElection);
  const swingDeltas       = calcSwingDeltas(standings, lastResult);
  const seatProjection    = projectSeats(lastResult, swingDeltas, nextElection?.totalSeats ?? null);
  const rankedBattlegrounds = scoreBattlegrounds(data.battlegrounds, pollingLead);

  const analysisContext = {
    nextElection,
    polling,
    lastResult,
    pollingLead,
    confidence,
    swingDeltas,
    seatProjection,
    rankedBattlegrounds,
  };

  // 6. Claude briefing
  const briefing = await analyzeWithClaude(country, analysisContext);

  await new Promise((r) => setTimeout(r, CLAUDE_DELAY_MS));

  // 7. Save to Firestore (replace previous processedBriefing for this country)
  await clearProcessedBriefings(country);
  const docId = await saveBriefing(country, briefing, analysisContext);

  return {
    country,
    docId,
    outcomePrediction: briefing.outcomePrediction,
    confidencePct:     briefing.confidencePct,
    keyIssues:         briefing.keyIssues,
    analysisSource:    briefing.analysisSource,
    inElectionPeriod:  isElectionPeriod(country),
  };
}

// ─── Main entry point ─────────────────────────────────────────────────────────

/**
 * Process election data for one or more countries.
 *
 * @param {string[]} countries — subset of ['CA','US','UK','AU']
 * @returns {Promise<{ results: object[], processed: number, errors: string[] }>}
 */
export async function runElectionProcessor(countries = ['CA', 'US', 'UK', 'AU']) {
  console.log('[electionProcessor] Starting for:', countries.join(', '));

  const results = [];
  const errors  = [];

  for (const country of countries) {
    try {
      const result = await processCountry(country);
      if (result) {
        results.push(result);
        console.log(`[electionProcessor] ✓ ${country} — "${result.outcomePrediction?.slice(0, 80)}…"`);
      }
    } catch (err) {
      console.error(`[electionProcessor] ✗ ${country}:`, err);
      errors.push(`${country}: ${err.message}`);
    }

    // Breathing room between countries
    await new Promise((r) => setTimeout(r, 400));
  }

  console.log(`[electionProcessor] Done. Processed: ${results.length}. Errors: ${errors.length}`);
  return { results, processed: results.length, errors };
}

export default runElectionProcessor;
