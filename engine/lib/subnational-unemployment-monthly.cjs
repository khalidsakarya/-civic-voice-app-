/**
 * Official monthly / rolling unemployment payloads for subnational economic docs.
 */

const https = require('https');
const { execFile } = require('child_process');
const { promisify } = require('util');
const { annualFromMonthly, num, trim } = require('./subnational-transparency-shared.cjs');

const execFileAsync = promisify(execFile);

const STATCAN_UNEMP_PRODUCT_ID = 14100287;
const STATCAN_ON_COORD = '7.7.1.1.1.1.0.0.0.0';
const STATCAN_CA_COORD = '1.7.1.1.1.1.0.0.0.0';

// Table 14-10-0292-01 — Labour force characteristics by territory, three-month
// moving average, seasonally adjusted and unadjusted. Territories (YT, NT, NU)
// are NOT covered by Table 14-10-0287-01 (that table's geography dimension is
// Canada + the 10 provinces only) — they have their own dedicated table due to
// smaller LFS sample sizes.
const STATCAN_TERR_UNEMP_PRODUCT_ID = 14100292;

// ─── Reliable StatCan WDS fetch helper ────────────────────────────────────────
//
// Background: in this environment, Node's classic `https` module
// (`require('https')`) reliably fails with ECONNRESET against
// www150.statcan.gc.ca — confirmed via instrumented testing to fail on
// EVERY attempt (18/18 requests, 3 retries each = 54/54 individual https
// attempts) across CA-AB, CA-QC, CA-SK, CA-MB, CA-NS, CA-NB, CA-NL, CA-PE,
// and CA-YT's territorial coordinate. Node's built-in global `fetch`
// (undici-backed — a different HTTP client implementation from the classic
// `http`/`https` core module) succeeded on the FIRST attempt 100% of the
// time against the identical URL/payload/coordinate in the same test run,
// and a plain `curl` subprocess has likewise been reliable every time it
// was checked directly throughout this project's development. The
// StatCan API and the coordinates are not the problem — something specific
// to Node's classic https.Agent/socket/TLS handling on this network path
// is (most likely a WAF/proxy that is more permissive of undici's and
// curl's connection/TLS negotiation than of Node core's). See
// engine/reports/statcan-wds-reliability-test-latest.json (produced by
// engine/test-statcan-wds-reliability.cjs) for the full per-jurisdiction
// evidence, including which strategy resolved each call.
//
// This helper never fabricates data: every strategy below either returns a
// real parsed WDS JSON response or throws. It tries https first (retrying
// with exponential backoff, per the original design intent), then falls
// back to Node's built-in fetch, then finally to a curl subprocess as a
// last resort — child_process is already an established fallback pattern
// elsewhere in this engine (see engine/lib/calaccess-lobbying-extract.cjs,
// engine/canada-monthly-runner.cjs), so reusing it here (via execFile with
// an argument array — never a shell string) is consistent with existing
// conventions.

const STATCAN_WDS_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) CivicVoiceApp-DataEngine/1.0 (+https://civicvoice.app; contact: data@civicvoice.app)';
const STATCAN_WDS_TIMEOUT_MS = 15000;
const STATCAN_WDS_MAX_RETRIES = 2; // per strategy, i.e. up to 3 attempts each for https and fetch
const STATCAN_WDS_BASE_BACKOFF_MS = 400;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Strategy 1: raw `https.request`, hardened.
 * - `agent: false` forces a brand-new socket per attempt, ruling out a bad
 *   pooled/keep-alive connection as the cause of a reused-socket reset.
 * - An explicit request timeout so a hung socket fails fast and retries,
 *   instead of dangling indefinitely.
 * - A realistic User-Agent + Accept header, since some front-ending
 *   infrastructure is less permissive of bare Node-default request
 *   signatures than of curl/browser-shaped ones.
 */
function httpsPostJsonAttempt(url, body, timeoutMs) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const u = new URL(url);
    const req = https.request(
      {
        hostname: u.hostname,
        path: u.pathname + u.search,
        method: 'POST',
        agent: false,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
          'User-Agent': STATCAN_WDS_USER_AGENT,
          Accept: 'application/json',
          Connection: 'close',
        },
      },
      (res) => {
        let b = '';
        res.on('data', (c) => {
          b += c;
        });
        res.on('end', () => {
          try {
            resolve(JSON.parse(b));
          } catch (e) {
            reject(new Error(`https: non-JSON response (status ${res.statusCode}): ${b.slice(0, 200)}`));
          }
        });
        res.on('error', reject);
      },
    );
    req.setTimeout(timeoutMs, () => {
      req.destroy(new Error(`https: request timed out after ${timeoutMs}ms`));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

/**
 * Strategy 2: Node's built-in global `fetch` (undici-backed) — a different
 * HTTP client stack from strategy 1's raw `https` module. If the ECONNRESET
 * is triggered by something specific to Node's classic http/https client
 * (e.g. its TLS ClientHello shape, or its socket/keep-alive handling),
 * swapping the underlying client can sidestep it without leaving the process.
 */
async function fetchPostJsonAttempt(url, body, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new Error(`fetch: request timed out after ${timeoutMs}ms`)), timeoutMs);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': STATCAN_WDS_USER_AGENT,
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch (e) {
      throw new Error(`fetch: non-JSON response (status ${res.status}): ${text.slice(0, 200)}`);
    }
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Strategy 3 (last-resort fallback): shell out to `curl`. Empirically 100%
 * reliable against the Stats Can WDS API in this environment — used here via
 * `execFile` with an argument array (never a shell string), so there is no
 * shell-interpolation risk from the JSON payload.
 */
async function curlPostJsonAttempt(url, body, timeoutMs) {
  const data = JSON.stringify(body);
  const timeoutSec = Math.max(1, Math.round(timeoutMs / 1000));
  const { stdout } = await execFileAsync(
    'curl',
    [
      '-s',
      '--max-time', String(timeoutSec),
      '-X', 'POST',
      url,
      '-H', 'Content-Type: application/json',
      '-H', `User-Agent: ${STATCAN_WDS_USER_AGENT}`,
      '-d', data,
    ],
    { maxBuffer: 10 * 1024 * 1024 },
  );
  try {
    return JSON.parse(stdout);
  } catch (e) {
    throw new Error(`curl: non-JSON response: ${trim(stdout).slice(0, 200)}`);
  }
}

// Lightweight in-memory telemetry ring so callers/tests can see which
// strategy actually resolved each request (for diagnosing ECONNRESET),
// without changing statcanWdsPostJson's return value (still just the parsed
// WDS JSON body, same as the original postJson()).
const wdsFetchTelemetry = [];
const WDS_TELEMETRY_MAX = 200;

function recordWdsTelemetry(entry) {
  wdsFetchTelemetry.push({ at: new Date().toISOString(), ...entry });
  if (wdsFetchTelemetry.length > WDS_TELEMETRY_MAX) wdsFetchTelemetry.shift();
}

/** Returns a copy of the most recent statcanWdsPostJson attempt telemetry (diagnostics only). */
function getWdsFetchTelemetry() {
  return wdsFetchTelemetry.slice();
}

/**
 * Reliable POST-JSON helper for the Statistics Canada WDS REST API. Tries
 * strategies in order (https → fetch → curl), retrying each of the first two
 * with exponential backoff, before finally falling back to a curl subprocess.
 * Throws only if every strategy fails — never returns fabricated data.
 *
 * @param {string} url
 * @param {any} body
 * @param {{ timeoutMs?: number, maxRetries?: number }} [opts]
 */
async function statcanWdsPostJson(url, body, opts = {}) {
  const timeoutMs = opts.timeoutMs || STATCAN_WDS_TIMEOUT_MS;
  const maxRetries = opts.maxRetries ?? STATCAN_WDS_MAX_RETRIES;
  const attemptsLog = [];

  const strategies = [
    { name: 'https', fn: httpsPostJsonAttempt },
    { name: 'fetch', fn: fetchPostJsonAttempt },
  ];

  for (const strategy of strategies) {
    for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
      try {
        const result = await strategy.fn(url, body, timeoutMs);
        recordWdsTelemetry({
          url,
          strategy: strategy.name,
          attempt: attempt + 1,
          outcome: 'success',
          priorFailures: attemptsLog.slice(),
        });
        return result;
      } catch (err) {
        attemptsLog.push(`${strategy.name}#${attempt + 1}: ${err.message}`);
        if (attempt < maxRetries) {
          await sleep(STATCAN_WDS_BASE_BACKOFF_MS * 2 ** attempt);
        }
      }
    }
  }

  // Last resort: curl subprocess. No retry loop — empirically reliable on the
  // first try; if this also fails, the API/network is genuinely unreachable.
  try {
    const result = await curlPostJsonAttempt(url, body, timeoutMs);
    recordWdsTelemetry({ url, strategy: 'curl', attempt: 1, outcome: 'success', priorFailures: attemptsLog.slice() });
    return result;
  } catch (err) {
    attemptsLog.push(`curl: ${err.message}`);
  }

  recordWdsTelemetry({ url, strategy: null, outcome: 'failure', priorFailures: attemptsLog.slice() });

  throw new Error(`StatCan WDS request failed after all strategies — ${attemptsLog.join(' | ')}`);
}

// Preserved name for the module's one internal call site / any external
// caller that imported `postJson` directly — same signature, same behavior,
// now backed by the retrying multi-strategy implementation above.
const postJson = statcanWdsPostJson;

/** @param {string} refPer e.g. 2026-04-01 */
function periodYmFromRefPer(refPer) {
  const s = trim(refPer);
  if (!s) return '';
  if (/^\d{4}-\d{2}/.test(s)) return s.slice(0, 7);
  return s;
}

/** @param {string} ym e.g. 2026-04 */
function formatMonthLabel(ym) {
  const s = periodYmFromRefPer(ym);
  const m = s.match(/^(\d{4})-(\d{2})/);
  if (!m) return s;
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const mi = Number(m[2]) - 1;
  if (mi < 0 || mi > 11) return s;
  return `${months[mi]} ${m[1]}`;
}

/**
 * @param {Array<{ period: string, period_label?: string, jurisdiction: number, national_average?: number|null }>} monthly
 * @param {string} jurisdictionKey
 * @param {string} natKey
 */
function annualUnemploymentFromMonthly(monthly, jurisdictionKey, natKey) {
  const byYear = new Map();
  for (let i = 0; i < monthly.length; i += 1) {
    const row = monthly[i];
    const ym = periodYmFromRefPer(row.period);
    const year = ym.slice(0, 4);
    if (!year) continue;
    if (!byYear.has(year)) byYear.set(year, { j: [], n: [] });
    const bucket = byYear.get(year);
    if (row.jurisdiction != null) bucket.j.push(row.jurisdiction);
    if (row.national_average != null) bucket.n.push(row.national_average);
  }
  const years = [...byYear.keys()].sort();
  return years.slice(-6).map((year) => {
    const bucket = byYear.get(year);
    const jAvg =
      bucket.j.length > 0 ? bucket.j.reduce((a, b) => a + b, 0) / bucket.j.length : null;
    const nAvg =
      bucket.n.length > 0 ? bucket.n.reduce((a, b) => a + b, 0) / bucket.n.length : null;
    const out = { year };
    if (jAvg != null) out[jurisdictionKey] = Math.round(jAvg * 10) / 10;
    if (nAvg != null) out[natKey] = Math.round(nAvg * 10) / 10;
    return out;
  });
}

/**
 * Build merge-safe unemployment fields for Firestore economic docs.
 * @param {{
 *   monthly: Array<{ period: string, period_label?: string, jurisdiction: number, national_average?: number|null }>,
 *   jurisdictionKey: string,
 *   natKey: string,
 *   frequency: 'monthly' | 'rolling_3_month',
 *   seriesField: 'unemployment_series_monthly' | 'unemployment_series_rolling_3_month',
 *   source: string,
 *   sourceUrl: string,
 *   reportingPeriod?: string,
 * }} opts
 */
function buildUnemploymentFirestoreFields(opts) {
  const {
    monthly,
    jurisdictionKey,
    natKey,
    frequency,
    seriesField,
    source,
    sourceUrl,
    reportingPeriod,
  } = opts;
  if (!Array.isArray(monthly) || !monthly.length) return null;

  const sorted = [...monthly].sort((a, b) =>
    periodYmFromRefPer(a.period).localeCompare(periodYmFromRefPer(b.period)),
  );
  const latest = sorted[sorted.length - 1];
  const series = sorted.map((row) => {
    const out = {
      period: row.period,
      period_label: row.period_label || formatMonthLabel(row.period),
      jurisdiction: row.jurisdiction,
    };
    if (row.national_average != null) out.national_average = row.national_average;
    out[jurisdictionKey] = row.jurisdiction;
    if (row.national_average != null) out[natKey] = row.national_average;
    return out;
  });

  const annualRows = annualUnemploymentFromMonthly(sorted, jurisdictionKey, natKey);
  const freqLabel = frequency === 'rolling_3_month' ? 'rolling 3-month' : 'monthly';

  return {
    unemployment_latest_rate: latest.jurisdiction,
    unemployment_latest_period: latest.period_label || formatMonthLabel(latest.period),
    unemployment_frequency: frequency,
    [seriesField]: series,
    unemployment_source_url: sourceUrl,
    unemployment_source: source,
    unemployment_url: sourceUrl,
    unemployment_reporting_period:
      reportingPeriod ||
      `Latest official ${freqLabel} unemployment (${latest.period_label || latest.period})`,
    unemployment_rate: annualRows,
  };
}

/** @param {number} productId @param {string} coordinate @param {number} latestN */
async function statcanUnemploymentMonthlyFromProduct(productId, coordinate, latestN = 24) {
  const j = await postJson(
    'https://www150.statcan.gc.ca/t1/wds/rest/getDataFromCubePidCoordAndLatestNPeriods',
    [{ productId, coordinate, latestN }],
  );
  const pts = j?.[0]?.object?.vectorDataPoint || [];
  return pts
    .map((p) => ({
      period: periodYmFromRefPer(p.refPer),
      jurisdiction: num(p.value),
    }))
    .filter((p) => p.period && p.jurisdiction != null);
}

/** @param {string} coordinate @param {number} latestN */
async function statcanUnemploymentMonthly(coordinate, latestN = 24) {
  return statcanUnemploymentMonthlyFromProduct(STATCAN_UNEMP_PRODUCT_ID, coordinate, latestN);
}

/**
 * @param {string} jurisdictionCoord
 * @param {string} nationalCoord
 * @param {string} jurisdictionKey
 * @param {string} natKey
 * @param {number} latestN
 */
async function statcanProvincialUnemployment(
  jurisdictionCoord,
  nationalCoord,
  jurisdictionKey,
  natKey,
  latestN = 24,
) {
  const [jPts, nPts] = await Promise.all([
    statcanUnemploymentMonthly(jurisdictionCoord, latestN),
    statcanUnemploymentMonthly(nationalCoord, latestN),
  ]);
  const natByPeriod = new Map(nPts.map((p) => [p.period, p.jurisdiction]));
  const monthly = jPts.map((p) => ({
    period: p.period,
    period_label: formatMonthLabel(p.period),
    jurisdiction: p.jurisdiction,
    national_average: natByPeriod.get(p.period) ?? null,
  }));
  return buildUnemploymentFirestoreFields({
    monthly,
    jurisdictionKey,
    natKey,
    frequency: 'monthly',
    seriesField: 'unemployment_series_monthly',
    source: 'Statistics Canada — Labour Force Survey (Table 14-10-0287-01, seasonally adjusted)',
    sourceUrl:
      'https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=1410028701',
    reportingPeriod: 'Monthly provincial unemployment rate (seasonally adjusted)',
  });
}

/**
 * Territorial (YT/NT/NU) monthly unemployment — Statistics Canada Table
 * 14-10-0292-01. The territorial rate is a 3-month moving average (smaller
 * LFS sample sizes than the provinces), published monthly; the national
 * comparator is still sourced from the provincial table (14-10-0287-01,
 * Canada coordinate) since Table 14-10-0292-01 has no Canada-wide aggregate
 * of its own (its geography dimension is Yukon / Northwest Territories /
 * Nunavut only).
 * @param {string} territoryCoord
 * @param {string} nationalCoord Coordinate in Table 14-10-0287-01 (e.g. STATCAN_CA_COORD)
 * @param {string} jurisdictionKey
 * @param {string} natKey
 * @param {number} latestN
 */
async function statcanTerritorialUnemployment(
  territoryCoord,
  nationalCoord,
  jurisdictionKey,
  natKey,
  latestN = 24,
) {
  const [jPts, nPts] = await Promise.all([
    statcanUnemploymentMonthlyFromProduct(STATCAN_TERR_UNEMP_PRODUCT_ID, territoryCoord, latestN),
    statcanUnemploymentMonthly(nationalCoord, latestN),
  ]);
  const natByPeriod = new Map(nPts.map((p) => [p.period, p.jurisdiction]));
  const monthly = jPts.map((p) => ({
    period: p.period,
    period_label: formatMonthLabel(p.period),
    jurisdiction: p.jurisdiction,
    national_average: natByPeriod.get(p.period) ?? null,
  }));
  return buildUnemploymentFirestoreFields({
    monthly,
    jurisdictionKey,
    natKey,
    frequency: 'rolling_3_month',
    seriesField: 'unemployment_series_rolling_3_month',
    source: 'Statistics Canada — Labour Force Survey (Table 14-10-0292-01, three-month moving average, seasonally adjusted)',
    sourceUrl:
      'https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=1410029201',
    reportingPeriod: 'Monthly territorial unemployment rate (3-month moving average, seasonally adjusted)',
  });
}

/**
 * @param {Array<{ date: string, value: number }>} jurisdictionPts
 * @param {Array<{ date: string, value: number }>} nationalPts
 * @param {number} latestN
 */
function fredMonthlyUnemployment(jurisdictionPts, nationalPts, latestN = 24) {
  const natByYm = new Map();
  for (let i = 0; i < nationalPts.length; i += 1) {
    const ym = periodYmFromRefPer(nationalPts[i].date);
    if (ym) natByYm.set(ym, nationalPts[i].value);
  }
  const monthly = [];
  for (let i = 0; i < jurisdictionPts.length; i += 1) {
    const ym = periodYmFromRefPer(jurisdictionPts[i].date);
    const rate = num(jurisdictionPts[i].value);
    if (!ym || rate == null) continue;
    monthly.push({
      period: ym,
      period_label: formatMonthLabel(ym),
      jurisdiction: rate,
      national_average: natByYm.get(ym) ?? null,
    });
  }
  monthly.sort((a, b) => a.period.localeCompare(b.period));
  return monthly.slice(-latestN);
}

/** Excel serial (ABS) → YYYY-MM */
function excelSerialToYm(serial) {
  const n = Number(serial);
  if (!Number.isFinite(n)) return '';
  const utc = new Date(Date.UTC(1899, 11, 30 + n));
  return `${utc.getUTCFullYear()}-${String(utc.getUTCMonth() + 1).padStart(2, '0')}`;
}

/**
 * ABS Labour Force — Table 12 (6202012.xlsx), NSW seasonally adjusted unemployment rate.
 * @param {typeof import('./subnational-transparency-shared.cjs').fetchText} fetchText
 * @param {typeof import('./subnational-transparency-shared.cjs').fetchBuffer} fetchBuffer
 */
async function absNswMonthlyUnemployment(fetchText, fetchBuffer, XLSX) {
  const html = await fetchText(
    'https://www.abs.gov.au/statistics/labour/employment-and-unemployment/labour-force-australia/latest-release',
    2 * 1024 * 1024,
  );
  const match = html.match(
    /href="(\/statistics\/labour\/employment-and-unemployment\/labour-force-australia\/[^"]+\/6202012\.xlsx)"/i,
  );
  if (!match) throw new Error('ABS Table 12 (6202012.xlsx) link not found');
  const xUrl = `https://www.abs.gov.au${match[1]}`;
  const buf = await fetchBuffer(xUrl);
  const wb = XLSX.read(buf, { type: 'buffer' });
  const sheet = wb.Sheets.Data1;
  if (!sheet) throw new Error('ABS Data1 sheet missing');
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  if (rows.length < 12) throw new Error('ABS Data1 layout unexpected');

  let nswCol = -1;
  let ausCol = -1;
  const seriesIds = rows[9] || [];
  for (let c = 1; c < seriesIds.length; c += 1) {
    const sid = trim(seriesIds[c]);
    if (sid === 'A84423270C') nswCol = c;
    if (sid === 'A84423284T') ausCol = c;
  }
  if (nswCol < 0) throw new Error('NSW seasonally adjusted unemployment column not found');

  const monthly = [];
  for (let r = 10; r < rows.length; r += 1) {
    const ym = excelSerialToYm(rows[r][0]);
    const rate = num(rows[r][nswCol]);
    if (!ym || rate == null) continue;
    const nat = ausCol >= 0 ? num(rows[r][ausCol]) : null;
    monthly.push({
      period: ym,
      period_label: formatMonthLabel(ym),
      jurisdiction: Math.round(rate * 10) / 10,
      national_average: nat != null ? Math.round(nat * 10) / 10 : null,
    });
  }
  if (!monthly.length) throw new Error('No ABS monthly NSW unemployment points parsed');

  return buildUnemploymentFirestoreFields({
    monthly: monthly.slice(-24),
    jurisdictionKey: 'New South Wales',
    natKey: 'AU Average',
    frequency: 'monthly',
    seriesField: 'unemployment_series_monthly',
    source: 'Australian Bureau of Statistics — Labour Force, Australia (Table 12)',
    sourceUrl:
      'https://www.abs.gov.au/statistics/labour/employment-and-unemployment/labour-force-australia',
    reportingPeriod: 'Monthly state unemployment rate (seasonally adjusted)',
  });
}

/**
 * ONS HI07 — London headline LFS, rolling three-month unemployment rate.
 * @param {typeof import('./subnational-transparency-shared.cjs').fetchText} fetchText
 * @param {typeof import('./subnational-transparency-shared.cjs').fetchBuffer} fetchBuffer
 */
async function onsLondonRollingUnemployment(fetchText, fetchBuffer, XLSX) {
  const page = await fetchText(
    'https://www.ons.gov.uk/employmentandlabourmarket/peopleinwork/employmentandemployeetypes/datasets/headlinelabourforcesurveyindicatorsforlondonhi07',
    2 * 1024 * 1024,
  );
  const fileMatch = page.match(/href="(\/file\?uri=[^"]+lmregtab111london[^"]+\.xlsx)"/i);
  if (!fileMatch) throw new Error('ONS HI07 London xlsx link not found');
  const url = `https://www.ons.gov.uk${fileMatch[1]}`;
  const buf = await fetchBuffer(url);
  const wb = XLSX.read(buf, { type: 'buffer' });
  const sheet = wb.Sheets['1_LFS_people'];
  if (!sheet) throw new Error('ONS HI07 1_LFS_people sheet missing');
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

  const monthly = [];
  for (let r = 10; r < rows.length; r += 1) {
    const periodLabel = trim(rows[r][0]);
    const rate = num(rows[r][8]);
    if (!periodLabel || rate == null) continue;
    if (!/^[A-Za-z]{3}-[A-Za-z]{3}\s\d{4}$/.test(periodLabel)) continue;
    monthly.push({
      period: periodLabel,
      period_label: periodLabel,
      jurisdiction: Math.round(rate * 10) / 10,
    });
  }
  if (!monthly.length) throw new Error('No ONS London rolling unemployment points parsed');

  return buildUnemploymentFirestoreFields({
    monthly: monthly.slice(-24),
    jurisdictionKey: 'Greater London',
    natKey: 'UK Average',
    frequency: 'rolling_3_month',
    seriesField: 'unemployment_series_rolling_3_month',
    source:
      'Office for National Statistics — Regional labour market: headline indicators for London (HI07)',
    sourceUrl:
      'https://www.ons.gov.uk/employmentandlabourmarket/peopleinwork/employmentandemployeetypes/datasets/headlinelabourforcesurveyindicatorsforlondonhi07',
    reportingPeriod: 'Rolling three-month unemployment rate (published monthly)',
  });
}

module.exports = {
  STATCAN_ON_COORD,
  STATCAN_CA_COORD,
  STATCAN_TERR_UNEMP_PRODUCT_ID,
  statcanWdsPostJson,
  getWdsFetchTelemetry,
  buildUnemploymentFirestoreFields,
  statcanProvincialUnemployment,
  statcanTerritorialUnemployment,
  fredMonthlyUnemployment,
  absNswMonthlyUnemployment,
  onsLondonRollingUnemployment,
  annualUnemploymentFromMonthly,
  formatMonthLabel,
  periodYmFromRefPer,
  excelSerialToYm,
};
