/**
 * Official monthly / rolling unemployment payloads for subnational economic docs.
 */

const https = require('https');
const { annualFromMonthly, num, trim } = require('./subnational-transparency-shared.cjs');

const STATCAN_UNEMP_PRODUCT_ID = 14100287;
const STATCAN_ON_COORD = '7.7.1.1.1.1.0.0.0.0';
const STATCAN_CA_COORD = '1.7.1.1.1.1.0.0.0.0';

function postJson(url, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const u = new URL(url);
    const req = https.request(
      {
        hostname: u.hostname,
        path: u.pathname,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) },
      },
      (res) => {
        let b = '';
        res.on('data', (c) => (b += c));
        res.on('end', () => {
          try {
            resolve(JSON.parse(b));
          } catch (e) {
            reject(new Error(b.slice(0, 200)));
          }
        });
      },
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

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

/** @param {string} coordinate @param {number} latestN */
async function statcanUnemploymentMonthly(coordinate, latestN = 24) {
  const j = await postJson(
    'https://www150.statcan.gc.ca/t1/wds/rest/getDataFromCubePidCoordAndLatestNPeriods',
    [{ productId: STATCAN_UNEMP_PRODUCT_ID, coordinate, latestN }],
  );
  const pts = j?.[0]?.object?.vectorDataPoint || [];
  return pts
    .map((p) => ({
      period: periodYmFromRefPer(p.refPer),
      jurisdiction: num(p.value),
    }))
    .filter((p) => p.period && p.jurisdiction != null);
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
  buildUnemploymentFirestoreFields,
  statcanProvincialUnemployment,
  fredMonthlyUnemployment,
  absNswMonthlyUnemployment,
  onsLondonRollingUnemployment,
  annualUnemploymentFromMonthly,
  formatMonthLabel,
  periodYmFromRefPer,
  excelSerialToYm,
};
