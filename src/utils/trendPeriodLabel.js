/**
 * Trend-period labels for the Government Stats cards.
 *
 * A card's static definition used to carry a hardcoded `period` string ("Jan – Jun 2024") that kept
 * describing the built-in fallback trend after a live Firestore document replaced the value and the
 * trend. Cards that opt in with `periodMode: 'dynamic'` now show:
 *
 *   - the range derived from the live document's own `trend_periods`, when that metadata is present,
 *     well-formed and lines up one-to-one with the live `trend` that is actually drawn; otherwise
 *   - the neutral label "Historical trend" (never an invented or stale date range).
 *
 * Cards that do not opt in are untouched: they keep their static `period` exactly as before.
 *
 * Pure functions only: no Firebase, no network, no locale or time-zone dependence.
 */

export const NEUTRAL_TREND_LABEL = 'Historical trend';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const PERIOD_RE = /^(\d{4})-(0[1-9]|1[0-2])(?:-(0[1-9]|[12]\d|3[01]))?$/;

/** "2026-09" or "2026-09-01" -> { year, month } (month 1-12), or null. */
function parsePeriod(p) {
  if (typeof p !== 'string') return null;
  const m = PERIOD_RE.exec(p.trim());
  if (!m) return null;
  return { year: Number(m[1]), month: Number(m[2]) };
}

/**
 * "Oct 2025 – Sep 2026" (or "Jan – Jun 2026" inside one year) from a list of periods, or null when the
 * list is missing, malformed, not strictly chronological, or (when `trendLength` is given) not the
 * same length as the trend it describes.
 */
export function formatTrendPeriodRange(periods, trendLength) {
  if (!Array.isArray(periods) || periods.length < 2) return null;
  if (typeof trendLength === 'number' && periods.length !== trendLength) return null;
  const parsed = periods.map(parsePeriod);
  if (parsed.some((p) => p === null)) return null;
  for (let i = 1; i < parsed.length; i += 1) {
    const prev = parsed[i - 1].year * 12 + parsed[i - 1].month;
    const cur = parsed[i].year * 12 + parsed[i].month;
    if (cur <= prev) return null;
  }
  const first = parsed[0];
  const last = parsed[parsed.length - 1];
  const start = first.year === last.year ? MONTHS[first.month - 1] : `${MONTHS[first.month - 1]} ${first.year}`;
  return `${start} – ${MONTHS[last.month - 1]} ${last.year}`;
}

/**
 * The label shown under a card's sparkline.
 * @param {{ period?: string, periodMode?: string }} stat the card definition
 * @param {{ trend?: any, trend_periods?: any } | null | undefined} live the live Firestore document, if any
 */
export function resolveTrendPeriodLabel(stat, live) {
  if (!stat || stat.periodMode !== 'dynamic') return stat ? stat.period : undefined;
  if (live && Array.isArray(live.trend)) {
    const derived = formatTrendPeriodRange(live.trend_periods, live.trend.length);
    if (derived) return derived;
  }
  return NEUTRAL_TREND_LABEL;
}
