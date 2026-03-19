/**
 * Government Transparency Scorer
 *
 * Reads data from all five Firestore collections produced by the ingestion
 * and processing pipelines, calculates a weighted Transparency Score (0–100)
 * for each country, assigns a letter grade A–F, generates a one-line verdict,
 * and ranks all countries against each other.
 *
 * Results are saved to Firestore collection "transparency_scores" and
 * refreshed on the monthly scheduler tier (every 30 days).
 *
 * ── Scoring components ────────────────────────────────────────────────────────
 *
 *   Component                      Weight  Source collection
 *   ─────────────────────────────────────────────────────────────────────────
 *   1. Government Efficiency         20%   credit_card_spending (abuseScore)
 *                                          foreign_aid (efficiencyScore)
 *   2. Promise Keeping               20%   promise_tracker (promiseScore)
 *   3. Waste & Expense               20%   credit_card_spending (abuseScore)
 *   4. Military Accountability       15%   military_spending (wasteScore)
 *   5. Foreign Aid Transparency      10%   foreign_aid (efficiencyScore,
 *                                                        isUnusuallyLarge)
 *   6. Lobbying Conflict             15%   lobbying_correlations (conflictScore,
 *                                                                  severity)
 *
 * ── Score semantics ───────────────────────────────────────────────────────────
 *
 *   All component scores are normalised to 0–100 before weighting.
 *   Higher always means better (more transparent, less waste, fewer conflicts).
 *   Components invert raw waste/conflict scores where needed.
 *
 * ── Grade bands ───────────────────────────────────────────────────────────────
 *
 *   A  85–100   Exemplary transparency
 *   B  70–84    Strong transparency with minor concerns
 *   C  55–69    Moderate transparency — notable gaps
 *   D  40–54    Poor transparency — significant failures
 *   F   0–39    Critical transparency failures
 *
 * Usage
 * ─────
 *   import { runTransparencyScorer } from './scoring/transparencyScorer.js';
 *   await runTransparencyScorer();            // score all 4 countries
 *   await runTransparencyScorer(['CA','UK']); // subset only
 */

import { db } from '../firebase.js';
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  deleteDoc,
} from 'firebase/firestore';

// ─── Country metadata ─────────────────────────────────────────────────────────

export const COUNTRIES = {
  CA: { name: 'Canada',         leader: 'Mark Carney',       currency: 'CAD' },
  US: { name: 'United States',  leader: 'Donald Trump',      currency: 'USD' },
  UK: { name: 'United Kingdom', leader: 'Sir Keir Starmer',  currency: 'GBP' },
  AU: { name: 'Australia',      leader: 'Anthony Albanese',  currency: 'AUD' },
};

// ─── Weights (must sum to 1.0) ────────────────────────────────────────────────

const WEIGHTS = {
  efficiency:       0.20,
  promiseKeeping:   0.20,
  wasteExpense:     0.20,
  militaryAccount:  0.15,
  foreignAid:       0.10,
  lobbyingConflict: 0.15,
};

// Sanity-check weights sum to 1.0
const WEIGHT_TOTAL = Object.values(WEIGHTS).reduce((s, w) => s + w, 0);
if (Math.abs(WEIGHT_TOTAL - 1.0) > 0.001) {
  console.error('[transparencyScorer] Weights do not sum to 1.0:', WEIGHT_TOTAL);
}

// ─── Grade bands ──────────────────────────────────────────────────────────────

const GRADE_BANDS = [
  { min: 85, grade: 'A', label: 'Exemplary' },
  { min: 70, grade: 'B', label: 'Strong' },
  { min: 55, grade: 'C', label: 'Moderate' },
  { min: 40, grade: 'D', label: 'Poor' },
  { min: 0,  grade: 'F', label: 'Critical' },
];

function gradeFor(score) {
  return GRADE_BANDS.find((b) => score >= b.min) ?? GRADE_BANDS[GRADE_BANDS.length - 1];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function clamp(n, lo = 0, hi = 100) {
  return Math.max(lo, Math.min(hi, n));
}

function avg(arr) {
  if (!arr.length) return null;
  return arr.reduce((s, n) => s + n, 0) / arr.length;
}

/** Invert a 0–100 score so that lower waste = higher transparency. */
function invert(score) {
  return clamp(100 - score);
}

/**
 * Confidence tag based on how many records backed the calculation.
 * Used in the output but does not affect the score.
 */
function confidence(count) {
  if (count === 0) return 'no-data';
  if (count < 5)  return 'low';
  if (count < 20) return 'medium';
  return 'high';
}

/**
 * Fallback score when a component has no data.
 * Using 50 (neutral) ensures one missing component doesn't collapse the total.
 */
const NO_DATA_SCORE = 50;

// ─── Firestore readers ────────────────────────────────────────────────────────

/**
 * Fetch all documents from a Firestore collection for a given country.
 * Optionally filter by docType.
 */
async function fetchDocs(collectionName, countryCode, docType = null) {
  try {
    const col  = collection(db, collectionName);
    const constraints = [where('country', '==', countryCode)];
    if (docType) constraints.push(where('docType', '==', docType));
    const snap = await getDocs(query(col, ...constraints));
    return snap.docs.map((d) => d.data());
  } catch (e) {
    console.warn(`[transparencyScorer] Could not read ${collectionName} for ${countryCode}:`, e.message);
    return [];
  }
}

// ─── Component 1: Government Efficiency (20%) ─────────────────────────────────
//
// Blends two signals:
//   A) Operational efficiency: how clean is day-to-day card spending?
//      100 - mean(departmentAbuseScore) from credit_card_spending
//   B) Service delivery quality: how effective is foreign aid as a proxy
//      for government programme delivery?
//      mean(efficiencyScore × 10) from foreign_aid (scale 1–10 → 0–100)
//
// Blend: 60% card cleanliness + 40% aid delivery efficiency
// When one signal is missing, uses only the other signal.

async function calcEfficiency(countryCode) {
  const [deptScores, aidRecords] = await Promise.all([
    fetchDocs('credit_card_spending', countryCode, 'departmentScore'),
    fetchDocs('foreign_aid', countryCode),
  ]);

  const scores = [];
  const detail = {};

  // A) Card spending cleanliness
  if (deptScores.length) {
    const rawAbuse  = deptScores.map((d) => d.abuseScore ?? 0);
    const meanAbuse = avg(rawAbuse);
    const cardClean = invert(meanAbuse); // lower abuse = higher score
    detail.cardCleanliness = { score: Math.round(cardClean), records: deptScores.length, avgAbuseScore: Math.round(meanAbuse) };
    scores.push({ value: cardClean, weight: 0.6 });
  }

  // B) Foreign aid delivery efficiency
  if (aidRecords.length) {
    const effs    = aidRecords.map((r) => (r.efficiencyScore ?? 5) * 10); // 1–10 → 10–100
    const aidEff  = clamp(avg(effs));
    detail.aidDelivery = { score: Math.round(aidEff), records: aidRecords.length };
    scores.push({ value: aidEff, weight: 0.4 });
  }

  if (!scores.length) {
    return { score: NO_DATA_SCORE, confidence: 'no-data', detail: {} };
  }

  // Normalise weights in case one signal is absent
  const totalWeight = scores.reduce((s, x) => s + x.weight, 0);
  const blended     = scores.reduce((s, x) => s + x.value * (x.weight / totalWeight), 0);
  const score       = Math.round(clamp(blended));

  return {
    score,
    confidence: confidence(deptScores.length + aidRecords.length),
    detail,
  };
}

// ─── Component 2: Promise Keeping (20%) ──────────────────────────────────────
//
// Direct read of promiseScore from promise_tracker (docType: 'leaderSummary').
// If multiple leaders for one country (possible future expansion), average them.

async function calcPromiseKeeping(countryCode) {
  const summaries = await fetchDocs('promise_tracker', countryCode, 'leaderSummary');

  if (!summaries.length) {
    return { score: NO_DATA_SCORE, confidence: 'no-data', detail: {} };
  }

  const scores     = summaries.map((s) => s.promiseScore ?? 0);
  const score      = Math.round(clamp(avg(scores)));
  const breakdown  = summaries.map((s) => ({
    leader:       s.leaderName,
    promiseScore: s.promiseScore,
    scoreLabel:   s.scoreLabel,
    totalPromises: s.totalPromises,
    statusBreakdown: s.statusBreakdown,
  }));

  return {
    score,
    confidence: confidence(summaries.reduce((s, x) => s + (x.totalPromises ?? 0), 0)),
    detail: { leaders: breakdown },
  };
}

// ─── Component 3: Waste & Expense (20%) ──────────────────────────────────────
//
// Measures quality of government card spending based on department abuse scores.
// score = 100 - mean(departmentAbuseScore)
// Penalised further for departments with grade F (Serious Abuse Risk).

async function calcWasteExpense(countryCode) {
  const deptScores = await fetchDocs('credit_card_spending', countryCode, 'departmentScore');

  if (!deptScores.length) {
    return { score: NO_DATA_SCORE, confidence: 'no-data', detail: {} };
  }

  const abuseScores = deptScores.map((d) => d.abuseScore ?? 0);
  const meanAbuse   = avg(abuseScores);

  // Additional penalty: each F-grade department deducts 5 extra points (max −20)
  const fCount    = deptScores.filter((d) => (d.abuseScore ?? 0) >= 70).length;
  const fPenalty  = Math.min(20, fCount * 5);

  const score = Math.round(clamp(100 - meanAbuse - fPenalty));

  const totalFlagged = deptScores.reduce((s, d) => s + (d.flaggedRecords ?? 0), 0);
  const totalRecs    = deptScores.reduce((s, d) => s + (d.totalRecords ?? 0), 0);
  const overallRate  = totalRecs > 0 ? Math.round((totalFlagged / totalRecs) * 100) : 0;

  return {
    score,
    confidence: confidence(totalRecs),
    detail: {
      departments: deptScores.length,
      meanAbuseScore: Math.round(meanAbuse),
      fGradeDepartments: fCount,
      fPenaltyApplied: fPenalty,
      overallFlagRate: overallRate,
      worstDepartments: deptScores
        .sort((a, b) => (b.abuseScore ?? 0) - (a.abuseScore ?? 0))
        .slice(0, 3)
        .map((d) => ({ department: d.department, abuseScore: d.abuseScore, grade: d.grade })),
    },
  };
}

// ─── Component 4: Military Accountability (15%) ───────────────────────────────
//
// Reads the country-level wasteScore document from military_spending.
// score = 100 - militaryWasteScore
// Also penalises high sole-source contract rates.

async function calcMilitaryAccountability(countryCode) {
  const wasteDocs = await fetchDocs('military_spending', countryCode, 'wasteScore');

  if (!wasteDocs.length) {
    return { score: NO_DATA_SCORE, confidence: 'no-data', detail: {} };
  }

  const doc   = wasteDocs[0]; // one per country
  const waste = doc.score ?? 0;
  const base  = invert(waste);

  // Additional penalty for high sole-source contract rate
  const soleSrcCount = doc.breakdown?.sole_source ?? 0;
  const totalCount   = doc.totalCount ?? 1;
  const soleSrcRate  = soleSrcCount / totalCount;
  const solePenalty  = Math.min(15, Math.round(soleSrcRate * 30));

  const score = Math.round(clamp(base - solePenalty));

  return {
    score,
    confidence: confidence(totalCount),
    detail: {
      rawWasteScore:     waste,
      grade:             doc.grade,
      flaggedCount:      doc.flaggedCount,
      flagRate:          doc.flagRate,
      totalSpendUSD:     doc.totalSpendUSD,
      flaggedSpendUSD:   doc.flaggedSpendUSD,
      soleSrcRate:       Math.round(soleSrcRate * 100),
      solePenalty,
      flagBreakdown:     doc.breakdown,
    },
  };
}

// ─── Component 5: Foreign Aid Transparency (10%) ──────────────────────────────
//
// Measures how efficiently and transparently aid is delivered.
// Base = mean(efficiencyScore × 10) from foreign_aid records (1–10 → 10–100)
// Penalty: each "unusually large" flagged record deducts 3 points (max −25).

async function calcForeignAidTransparency(countryCode) {
  const records = await fetchDocs('foreign_aid', countryCode);

  if (!records.length) {
    return { score: NO_DATA_SCORE, confidence: 'no-data', detail: {} };
  }

  const effs      = records.map((r) => (r.efficiencyScore ?? 5) * 10);
  const baseScore = clamp(avg(effs));

  const flaggedCount  = records.filter((r) => r.isUnusuallyLarge).length;
  const flagPenalty   = Math.min(25, flaggedCount * 3);

  const completedCount = records.filter(
    (r) => (r.projectStatus ?? '').toLowerCase() === 'completed'
  ).length;
  const completionBonus = Math.min(10, Math.round((completedCount / records.length) * 15));

  const score = Math.round(clamp(baseScore - flagPenalty + completionBonus));

  return {
    score,
    confidence: confidence(records.length),
    detail: {
      records:          records.length,
      avgEfficiency:    Math.round(baseScore),
      unusuallyLarge:   flaggedCount,
      flagPenalty,
      completedProjects: completedCount,
      completionBonus,
      topCategories:    [...new Set(records.map((r) => r.category).filter(Boolean))].slice(0, 5),
    },
  };
}

// ─── Component 6: Lobbying Conflict (15%) ─────────────────────────────────────
//
// Measures how free the government is from lobbying-to-contract conflicts.
// Starts at 100, deducts per finding by severity:
//   HIGH     (conflictScore 8–10) → −15 each
//   MODERATE (conflictScore 5–7)  → −8 each
//   LOW      (conflictScore 1–4)  → −3 each
//
// Additional penalty: conflicts involving sole-source contracts −5 each.
// Capped at 0 from below.

async function calcLobbyingConflict(countryCode) {
  const findings = await fetchDocs('lobbying_correlations', countryCode);

  if (!findings.length) {
    // No findings can mean either no data was ingested OR genuinely clean
    // Return neutral score with low confidence
    return { score: NO_DATA_SCORE, confidence: 'no-data', detail: {} };
  }

  let deduction = 0;
  let highCount = 0, modCount = 0, lowCount = 0, soleCount = 0;

  for (const f of findings) {
    const sev = (f.severity ?? '').toLowerCase();
    if (sev === 'high')            { deduction += 15; highCount++; }
    else if (sev === 'moderate')   { deduction += 8;  modCount++;  }
    else                           { deduction += 3;  lowCount++;  }

    const cType = (f.contractType ?? '').toLowerCase();
    if (/sole|non.competitive|direct|limited|single/i.test(cType)) {
      deduction += 5;
      soleCount++;
    }
  }

  const score = Math.round(clamp(100 - deduction));
  const avgConflict = avg(findings.map((f) => f.conflictScore ?? 0));

  return {
    score,
    confidence: confidence(findings.length),
    detail: {
      totalFindings:   findings.length,
      highRisk:        highCount,
      moderateRisk:    modCount,
      lowRisk:         lowCount,
      soleSrcConflicts: soleCount,
      avgConflictScore: avgConflict !== null ? Math.round(avgConflict * 10) / 10 : null,
      totalDeduction:  Math.min(100, deduction),
    },
  };
}

// ─── Weighted total ───────────────────────────────────────────────────────────

function calcFinalScore(components) {
  const { efficiency, promiseKeeping, wasteExpense, militaryAccount, foreignAid, lobbyingConflict } = components;

  return Math.round(
    efficiency.score       * WEIGHTS.efficiency       +
    promiseKeeping.score   * WEIGHTS.promiseKeeping   +
    wasteExpense.score     * WEIGHTS.wasteExpense      +
    militaryAccount.score  * WEIGHTS.militaryAccount  +
    foreignAid.score       * WEIGHTS.foreignAid       +
    lobbyingConflict.score * WEIGHTS.lobbyingConflict
  );
}

// ─── Verdict generator ────────────────────────────────────────────────────────

/**
 * Generate a single plain-English verdict line based on the score profile.
 * Highlights the strongest and weakest components.
 */
function generateVerdict(countryCode, finalScore, components, grade) {
  const country = COUNTRIES[countryCode]?.name ?? countryCode;

  // Rank components best → worst
  const ranked = Object.entries({
    'government efficiency':    components.efficiency.score,
    'promise keeping':          components.promiseKeeping.score,
    'waste and expense control': components.wasteExpense.score,
    'military accountability':  components.militaryAccount.score,
    'foreign aid transparency': components.foreignAid.score,
    'lobbying integrity':       components.lobbyingConflict.score,
  }).sort((a, b) => b[1] - a[1]);

  const best   = ranked[0];
  const worst  = ranked[ranked.length - 1];

  const noDataComponents = Object.entries(components)
    .filter(([, v]) => v.confidence === 'no-data')
    .map(([k]) => k);

  if (finalScore >= 85) {
    return `${country} leads with strong ${best[0]} (${best[1]}/100) and maintains exemplary public accountability across all measured areas.`;
  }
  if (finalScore >= 70) {
    return `${country} demonstrates solid transparency overall, excelling in ${best[0]} (${best[1]}/100) but with room for improvement in ${worst[0]} (${worst[1]}/100).`;
  }
  if (finalScore >= 55) {
    return `${country} shows moderate transparency — ${best[0]} is its strongest area (${best[1]}/100), but ${worst[0]} (${worst[1]}/100) remains a significant concern for citizens.`;
  }
  if (finalScore >= 40) {
    return `${country} has poor transparency, with ${worst[0]} (${worst[1]}/100) representing a serious accountability gap that undermines public trust.`;
  }
  return `${country} faces critical transparency failures — ${worst[0]} scored just ${worst[1]}/100, and comprehensive reform is needed to restore public confidence.`;
}

// ─── Per-country scorer ───────────────────────────────────────────────────────

/**
 * Calculate the full Transparency Score for a single country.
 *
 * @param {string} countryCode — 'CA'|'US'|'UK'|'AU'
 * @returns {Promise<object>} — score document ready for Firestore
 */
export async function scoreCountry(countryCode) {
  console.log(`[transparencyScorer] ── Scoring ${countryCode} ──────────────────`);

  // Run all component calculations in parallel
  const [efficiency, promiseKeeping, wasteExpense, militaryAccount, foreignAid, lobbyingConflict] =
    await Promise.all([
      calcEfficiency(countryCode),
      calcPromiseKeeping(countryCode),
      calcWasteExpense(countryCode),
      calcMilitaryAccountability(countryCode),
      calcForeignAidTransparency(countryCode),
      calcLobbyingConflict(countryCode),
    ]);

  const components = { efficiency, promiseKeeping, wasteExpense, militaryAccount, foreignAid, lobbyingConflict };
  const finalScore = calcFinalScore(components);
  const { grade, label: gradeLabel } = gradeFor(finalScore);
  const verdict    = generateVerdict(countryCode, finalScore, components, grade);

  // Count no-data components
  const missingComponents = Object.entries(components)
    .filter(([, v]) => v.confidence === 'no-data')
    .map(([k]) => k);

  console.log(`[transparencyScorer] ${countryCode}: ${finalScore}/100 — Grade ${grade} — ${gradeLabel}`);
  console.log(`  Efficiency:       ${efficiency.score}/100 (${efficiency.confidence})`);
  console.log(`  Promise Keeping:  ${promiseKeeping.score}/100 (${promiseKeeping.confidence})`);
  console.log(`  Waste & Expense:  ${wasteExpense.score}/100 (${wasteExpense.confidence})`);
  console.log(`  Military Acct:    ${militaryAccount.score}/100 (${militaryAccount.confidence})`);
  console.log(`  Foreign Aid:      ${foreignAid.score}/100 (${foreignAid.confidence})`);
  console.log(`  Lobbying:         ${lobbyingConflict.score}/100 (${lobbyingConflict.confidence})`);
  if (missingComponents.length) {
    console.warn(`  ⚠ No data for: ${missingComponents.join(', ')} — using neutral score (${NO_DATA_SCORE})`);
  }

  return {
    country:         countryCode,
    countryName:     COUNTRIES[countryCode]?.name ?? countryCode,
    leader:          COUNTRIES[countryCode]?.leader ?? null,
    finalScore,
    grade,
    gradeLabel,
    verdict,
    rank:            null, // filled in after all countries scored
    rankLabel:       null,
    components: {
      efficiency:       { score: efficiency.score,       weight: WEIGHTS.efficiency,       confidence: efficiency.confidence,       ...efficiency.detail },
      promiseKeeping:   { score: promiseKeeping.score,   weight: WEIGHTS.promiseKeeping,   confidence: promiseKeeping.confidence,   ...promiseKeeping.detail },
      wasteExpense:     { score: wasteExpense.score,     weight: WEIGHTS.wasteExpense,     confidence: wasteExpense.confidence,     ...wasteExpense.detail },
      militaryAccount:  { score: militaryAccount.score,  weight: WEIGHTS.militaryAccount,  confidence: militaryAccount.confidence,  ...militaryAccount.detail },
      foreignAid:       { score: foreignAid.score,       weight: WEIGHTS.foreignAid,       confidence: foreignAid.confidence,       ...foreignAid.detail },
      lobbyingConflict: { score: lobbyingConflict.score, weight: WEIGHTS.lobbyingConflict, confidence: lobbyingConflict.confidence, ...lobbyingConflict.detail },
    },
    weights:           WEIGHTS,
    missingComponents,
    scoredAt:          new Date().toISOString(),
  };
}

// ─── Ranking ──────────────────────────────────────────────────────────────────

const RANK_LABELS = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];

function applyRankings(scoreDocs) {
  const sorted = [...scoreDocs].sort((a, b) => b.finalScore - a.finalScore);
  return sorted.map((doc, i) => ({
    ...doc,
    rank:      i + 1,
    rankLabel: RANK_LABELS[i] ?? `${i + 1}th`,
    rankOf:    sorted.length,
    scoreAbove: i > 0 ? doc.finalScore - sorted[i - 1].finalScore : null, // negative = gap below rank above
    scoreBelow: i < sorted.length - 1 ? sorted[i + 1].finalScore - doc.finalScore : null,
  }));
}

// ─── Firestore persistence ────────────────────────────────────────────────────

async function saveScores(rankedDocs) {
  const col = collection(db, 'transparency_scores');

  // Clear all existing transparency score docs before writing fresh set
  try {
    const existing = await getDocs(query(col));
    await Promise.all(existing.docs.map((d) => deleteDoc(d.ref)));
    console.log(`[transparencyScorer] Cleared ${existing.size} existing score docs`);
  } catch (e) {
    console.warn('[transparencyScorer] Could not clear existing scores:', e.message);
  }

  let saved = 0, errors = 0;

  // Write individual country scores
  await Promise.all(
    rankedDocs.map(async (doc) => {
      try {
        await addDoc(col, { ...doc, docType: 'countryScore', createdAt: serverTimestamp() });
        saved++;
      } catch (e) {
        console.error('[transparencyScorer] Failed to save score for', doc.country, e.message);
        errors++;
      }
    })
  );

  // Write a summary comparison document listing all countries ranked
  try {
    const summary = {
      docType:   'rankingSummary',
      scoredAt:  new Date().toISOString(),
      countries: rankedDocs.map((d) => ({
        country:     d.country,
        countryName: d.countryName,
        leader:      d.leader,
        finalScore:  d.finalScore,
        grade:       d.grade,
        gradeLabel:  d.gradeLabel,
        rank:        d.rank,
        rankLabel:   d.rankLabel,
        verdict:     d.verdict,
      })),
      topCountry:    rankedDocs[0]?.country ?? null,
      bottomCountry: rankedDocs[rankedDocs.length - 1]?.country ?? null,
      createdAt:     serverTimestamp(),
    };
    await addDoc(col, summary);
    saved++;
  } catch (e) {
    console.error('[transparencyScorer] Failed to save ranking summary:', e.message);
    errors++;
  }

  return { saved, errors };
}

// ─── Top-level runner ─────────────────────────────────────────────────────────

/**
 * Score all (or selected) countries, apply cross-country rankings, and persist.
 *
 * @param {string[]} [countries] — subset of ['CA','US','UK','AU'] (default: all)
 * @returns {Promise<object[]>} — ranked score documents
 */
export async function runTransparencyScorer(countries = Object.keys(COUNTRIES)) {
  console.log('[transparencyScorer] ══ Transparency Scoring Run ═════════════════');
  console.log(`[transparencyScorer] Scoring: ${countries.join(', ')}`);
  console.log('[transparencyScorer] Weights:', JSON.stringify(WEIGHTS));

  // Score all countries (parallel — each scores against its own Firestore data)
  const rawScores = await Promise.all(countries.map((c) => scoreCountry(c)));

  // Apply cross-country rankings
  const ranked = applyRankings(rawScores);

  // Print leaderboard
  console.log('\n[transparencyScorer] ══ Leaderboard ═══════════════════════════════');
  console.log('  Rank │ Country         │ Score │ Grade │ Verdict');
  console.log('  ─────┼─────────────────┼───────┼───────┼─────────────────────────────────────');
  ranked.forEach((r) => {
    const name  = r.countryName.padEnd(15);
    const score = String(r.finalScore).padEnd(5);
    const grade = r.grade.padEnd(5);
    const verdictShort = r.verdict.slice(0, 55);
    console.log(`  ${r.rankLabel.padEnd(4)} │ ${name} │ ${score} │ ${grade} │ ${verdictShort}`);
  });

  // Persist
  const { saved, errors } = await saveScores(ranked);
  console.log(`\n[transparencyScorer] Saved ${saved} documents to "transparency_scores" (${errors} errors)`);

  return ranked;
}

export default runTransparencyScorer;
