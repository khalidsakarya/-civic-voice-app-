/**
 * Lobbying-to-Contracts Correlation Detector
 *
 * Detects potential conflicts of interest by cross-referencing lobbying
 * meetings with government contracts awarded within 90 days.
 */

import { db } from '../firebase.js';
import { collection, addDoc, serverTimestamp, query, where, getDocs, deleteDoc } from 'firebase/firestore';

const CORRELATION_WINDOW_DAYS = 90;

// ─── Helpers ────────────────────────────────────────────────────────────────

function parseDate(str) {
  if (!str) return null;
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

function daysBetween(a, b) {
  return Math.abs((b - a) / (1000 * 60 * 60 * 24));
}

function parseAmount(raw) {
  if (typeof raw === 'number') return raw;
  if (typeof raw === 'string') {
    return parseFloat(raw.replace(/[$,BMK\s]/gi, (m) => {
      if (m.toUpperCase() === 'B') return 'e9';
      if (m.toUpperCase() === 'M') return 'e6';
      if (m.toUpperCase() === 'K') return 'e3';
      return '';
    })) || 0;
  }
  return 0;
}

function formatCurrency(amount) {
  if (amount >= 1e9) return `$${(amount / 1e9).toFixed(1)}B`;
  if (amount >= 1e6) return `$${(amount / 1e6).toFixed(1)}M`;
  if (amount >= 1e3) return `$${(amount / 1e3).toFixed(0)}K`;
  return `$${amount.toFixed(0)}`;
}

function formatDate(date) {
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function normalise(str) {
  return (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Fuzzy company name match — handles "Corp", "Inc", "Ltd" suffixes and
 * checks whether one name is a substring of the other after normalisation.
 */
function companiesMatch(a, b) {
  const clean = (s) =>
    normalise(s).replace(/(corporation|incorporated|limited|company|corp|inc|ltd|llc|pty|plc)$/g, '');
  const ca = clean(a);
  const cb = clean(b);
  if (!ca || !cb) return false;
  return ca === cb || ca.includes(cb) || cb.includes(ca);
}

// ─── Scoring ─────────────────────────────────────────────────────────────────

/**
 * Conflict-of-interest score (1–10).
 *
 * Factors:
 *  • Time proximity between last relevant meeting and contract award
 *  • Contract dollar value
 *  • Contract type (sole-source carries higher weight)
 *  • Number of lobbying meetings before the contract
 */
function calcScore({ daysDiff, contractAmount, contractType, meetingCount }) {
  let score = 1;

  // Time proximity
  if (daysDiff <= 14) score += 4;
  else if (daysDiff <= 30) score += 3;
  else if (daysDiff <= 60) score += 2;
  else score += 1;

  // Contract value
  if (contractAmount >= 10e6) score += 3;
  else if (contractAmount >= 1e6) score += 2;
  else if (contractAmount >= 100e3) score += 1;

  // Procurement type
  const typeLower = (contractType || '').toLowerCase();
  if (typeLower.includes('sole') || typeLower.includes('non-competitive') || typeLower.includes('direct')) {
    score += 2;
  } else if (typeLower.includes('limited') || typeLower.includes('restricted')) {
    score += 1;
  }

  // Repeat lobbying
  if (meetingCount >= 3) score += 1;
  else if (meetingCount >= 2) score += 0.5;

  return Math.min(10, Math.round(score));
}

// ─── Plain-language finding ───────────────────────────────────────────────────

function buildFinding({ company, minister, lobbyDate, contractDate, contractAmount, contractType, daysDiff, score, topic }) {
  const amountStr = formatCurrency(contractAmount);
  const lobbyDateStr = formatDate(lobbyDate);
  const contractDateStr = formatDate(contractDate);
  const gap = Math.round(daysDiff);
  const typeNote = contractType ? ` (${contractType})` : '';

  let severity;
  if (score >= 8) severity = 'HIGH RISK';
  else if (score >= 5) severity = 'MODERATE RISK';
  else severity = 'LOW RISK';

  const topicNote = topic ? ` regarding "${topic}"` : '';

  return (
    `[${severity}] ${company} lobbied ${minister} on ${lobbyDateStr}${topicNote} ` +
    `and received a ${amountStr}${typeNote} contract on ${contractDateStr} — ` +
    `${gap} day${gap !== 1 ? 's' : ''} later. Conflict-of-interest score: ${score}/10.`
  );
}

// ─── Core correlator ─────────────────────────────────────────────────────────

/**
 * Correlate lobbying meetings with contracts.
 *
 * @param {Array} members   - Members/ministers with `.lobbying.meetings[]`
 * @param {Array} departments - Departments with minister name and contracts/grants
 * @param {Array} contracts - Flat contracts list (optional, merged with dept grants)
 * @returns {Array} findings
 */
export function correlate(members = [], departments = [], contracts = []) {
  const findings = [];

  // Build a unified contract list from both sources
  const allContracts = [...contracts];
  for (const dept of departments) {
    const minister = dept.minister || dept.secretary || null;
    for (const grant of dept.grantsDetail || []) {
      allContracts.push({
        company: grant.recipient,
        amount: grant.amount,
        amountRaw: parseAmount(grant.amountRaw || grant.amount),
        department: dept.name,
        minister,
        date: grant.date,
        type: grant.type || 'contract',
        purpose: grant.purpose,
      });
    }
  }

  // Build minister → department lookup for flat contracts that lack a minister field
  const ministerByDept = {};
  for (const dept of departments) {
    if (dept.name && dept.minister) ministerByDept[dept.name] = dept.minister;
    if (dept.name && dept.secretary) ministerByDept[dept.name] = dept.secretary;
  }
  for (const c of allContracts) {
    if (!c.minister && c.department) {
      c.minister = ministerByDept[c.department] || null;
    }
    if (!c.amountRaw) c.amountRaw = parseAmount(c.amount);
  }

  // Index members by name for O(1) lookup
  const memberMap = {};
  for (const m of members) {
    if (m.name) memberMap[normalise(m.name)] = m;
  }

  for (const contract of allContracts) {
    const contractDate = parseDate(contract.date);
    if (!contractDate || !contract.company || !contract.minister) continue;

    // Find the minister in members list
    const ministerKey = normalise(contract.minister);
    const minister = memberMap[ministerKey];
    const meetings = minister?.lobbying?.meetings || [];

    // Also search any member whose name matches (tolerant)
    let relevantMeetings = [];
    for (const m of members) {
      if (!normalise(m.name).includes(ministerKey) && !ministerKey.includes(normalise(m.name))) continue;
      for (const mtg of m.lobbying?.meetings || []) {
        if (!companiesMatch(mtg.organization, contract.company)) continue;
        const mtgDate = parseDate(mtg.date);
        if (!mtgDate) continue;
        // Meeting must precede the contract and be within the window
        const diff = (contractDate - mtgDate) / (1000 * 60 * 60 * 24);
        if (diff >= 0 && diff <= CORRELATION_WINDOW_DAYS) {
          relevantMeetings.push({ ...mtg, parsedDate: mtgDate, diff });
        }
      }
    }

    if (relevantMeetings.length === 0) continue;

    // Use the meeting closest to the contract date for the headline
    relevantMeetings.sort((a, b) => a.diff - b.diff);
    const closest = relevantMeetings[0];

    const score = calcScore({
      daysDiff: closest.diff,
      contractAmount: contract.amountRaw,
      contractType: contract.type,
      meetingCount: relevantMeetings.length,
    });

    const finding = buildFinding({
      company: contract.company,
      minister: contract.minister,
      lobbyDate: closest.parsedDate,
      contractDate,
      contractAmount: contract.amountRaw,
      contractType: contract.type,
      daysDiff: closest.diff,
      score,
      topic: closest.topic,
    });

    findings.push({
      company: contract.company,
      minister: contract.minister,
      department: contract.department || null,
      lobbyDate: closest.parsedDate.toISOString(),
      contractDate: contractDate.toISOString(),
      contractAmount: contract.amountRaw,
      contractAmountFormatted: formatCurrency(contract.amountRaw),
      contractType: contract.type || null,
      contractPurpose: contract.purpose || null,
      daysBetweenLobbyAndContract: Math.round(closest.diff),
      meetingsInWindow: relevantMeetings.length,
      allMeetingDates: relevantMeetings.map((m) => m.parsedDate.toISOString()),
      lobbyTopic: closest.topic || null,
      lobbyValue: closest.value || null,
      conflictScore: score,
      finding,
      severity: score >= 8 ? 'high' : score >= 5 ? 'moderate' : 'low',
    });
  }

  // Deduplicate: one finding per (company, minister, contract date)
  const seen = new Set();
  return findings.filter((f) => {
    const key = `${normalise(f.company)}|${normalise(f.minister)}|${f.contractDate}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ─── Firestore persistence ────────────────────────────────────────────────────

/**
 * Save findings to Firestore "lobbying_correlations" collection.
 * Clears existing docs for the given run scope before inserting.
 *
 * @param {Array} findings - Output of correlate()
 * @param {object} options
 * @param {string} options.country - ISO country code tag (e.g. "AU", "US", "CA")
 * @returns {Promise<{ saved: number, errors: number }>}
 */
export async function saveFindings(findings, { country = 'unknown' } = {}) {
  if (!findings.length) return { saved: 0, errors: 0 };

  const col = collection(db, 'lobbying_correlations');

  // Remove stale docs for this country so re-runs stay fresh
  try {
    const stale = await getDocs(query(col, where('country', '==', country)));
    await Promise.all(stale.docs.map((d) => deleteDoc(d.ref)));
  } catch (_) {
    // Non-fatal — proceed with inserts
  }

  let saved = 0;
  let errors = 0;

  await Promise.all(
    findings.map(async (f) => {
      try {
        await addDoc(col, {
          ...f,
          country,
          createdAt: serverTimestamp(),
        });
        saved++;
      } catch (e) {
        console.error('[lobbyCorrelator] Failed to save finding:', e, f);
        errors++;
      }
    })
  );

  return { saved, errors };
}

// ─── Top-level runner ─────────────────────────────────────────────────────────

/**
 * Run the full correlation pipeline and persist to Firestore.
 *
 * @param {object} params
 * @param {Array}  params.members      - Minister/member records
 * @param {Array}  params.departments  - Department records with grants
 * @param {Array}  params.contracts    - Flat contract records (optional)
 * @param {string} params.country      - Country tag for Firestore
 * @returns {Promise<{ findings: Array, saved: number, errors: number }>}
 */
export async function runCorrelation({ members = [], departments = [], contracts = [], country = 'unknown' }) {
  const findings = correlate(members, departments, contracts);

  console.log(`[lobbyCorrelator] Found ${findings.length} correlation(s) for ${country}`);
  findings.forEach((f) => console.log(' •', f.finding));

  const { saved, errors } = await saveFindings(findings, { country });
  console.log(`[lobbyCorrelator] Saved ${saved} finding(s) to Firestore (${errors} error(s))`);

  return { findings, saved, errors };
}

export default runCorrelation;
