import fs from 'fs';
import path from 'path';
import {
  NEUTRAL_TREND_LABEL,
  formatTrendPeriodRange,
  resolveTrendPeriodLabel,
} from './trendPeriodLabel';

// Pure-function tests plus static checks of src/App.js: no Firebase, no network, no component rendering.

const PERIODS = ['2025-10', '2025-11', '2025-12', '2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08', '2026-09'];
const TREND = [6.9, 6.6, 6.8, 6.5, 6.7, 6.7, 6.9, 6.6, 6.5, 6.4, 6.4, 6.5];

describe('formatTrendPeriodRange', () => {
  test('the real Canada unemployment document: Oct 2025 – Sep 2026', () => {
    expect(formatTrendPeriodRange(PERIODS, TREND.length)).toBe('Oct 2025 – Sep 2026');
  });
  test('start and end come from the data, not from a fixed range', () => {
    expect(formatTrendPeriodRange(['2026-10', '2026-11', '2026-12'], 3)).toBe('Oct – Dec 2026');
    expect(formatTrendPeriodRange(['2019-12', '2020-01'], 2)).toBe('Dec 2019 – Jan 2020');
    expect(formatTrendPeriodRange(['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06'])).toBe('Jan – Jun 2026');
  });
  test('ISO dates are accepted', () => {
    expect(formatTrendPeriodRange(['2026-01-01', '2026-02-01', '2026-03-01'], 3)).toBe('Jan – Mar 2026');
  });
  test('missing or non-array metadata is null', () => {
    [undefined, null, '', 'Oct 2025 – Sep 2026', 42, {}, []].forEach((v) => expect(formatTrendPeriodRange(v, 3)).toBeNull());
  });
  test('a single period is not a range', () => {
    expect(formatTrendPeriodRange(['2026-09'], 1)).toBeNull();
  });
  test('malformed entries make the whole range null (never partly guessed)', () => {
    expect(formatTrendPeriodRange(['2026-01', 'soon', '2026-03'], 3)).toBeNull();
    expect(formatTrendPeriodRange(['2026-01', '2026-13'], 2)).toBeNull();
    expect(formatTrendPeriodRange(['2026-1', '2026-2'], 2)).toBeNull();
    expect(formatTrendPeriodRange(['2026-01', null], 2)).toBeNull();
    expect(formatTrendPeriodRange(['2026-01', 202602], 2)).toBeNull();
    expect(formatTrendPeriodRange(['2026-01-32', '2026-02-01'], 2)).toBeNull();
  });
  test('periods that are not strictly chronological are null', () => {
    expect(formatTrendPeriodRange(['2026-03', '2026-02', '2026-04'], 3)).toBeNull();
    expect(formatTrendPeriodRange(['2026-02', '2026-02', '2026-03'], 3)).toBeNull();
  });
  test('a length that does not match the trend is null (the labels would not describe the drawn line)', () => {
    expect(formatTrendPeriodRange(PERIODS, 6)).toBeNull();
    expect(formatTrendPeriodRange(PERIODS.slice(0, 5), TREND.length)).toBeNull();
  });
});

describe('resolveTrendPeriodLabel', () => {
  const dynamic = { periodMode: 'dynamic' };

  test('dynamic card + live trend with matching trend_periods: derived range', () => {
    expect(resolveTrendPeriodLabel(dynamic, { trend: TREND, trend_periods: PERIODS })).toBe('Oct 2025 – Sep 2026');
  });
  test('dynamic card: a new month shifts the range with no code change', () => {
    const periods = [...PERIODS.slice(1), '2026-10'];
    expect(resolveTrendPeriodLabel(dynamic, { trend: [...TREND.slice(1), 6.6], trend_periods: periods })).toBe('Nov 2025 – Oct 2026');
  });
  test('dynamic card: live document without trend_periods is neutral, never a stale range', () => {
    expect(resolveTrendPeriodLabel({ ...dynamic, period: 'Dec 23 – May 24' }, { value: '2.3', trend: [1, 2, 3] })).toBe(NEUTRAL_TREND_LABEL);
  });
  test('dynamic card: malformed or mismatched trend_periods is neutral', () => {
    expect(resolveTrendPeriodLabel(dynamic, { trend: TREND, trend_periods: ['x', 'y'] })).toBe(NEUTRAL_TREND_LABEL);
    expect(resolveTrendPeriodLabel(dynamic, { trend: TREND, trend_periods: PERIODS.slice(2) })).toBe(NEUTRAL_TREND_LABEL);
    expect(resolveTrendPeriodLabel(dynamic, { trend: TREND, trend_periods: 'Oct 2025' })).toBe(NEUTRAL_TREND_LABEL);
  });
  test('dynamic card: periods without a live trend (the built-in fallback line is drawn) are neutral', () => {
    expect(resolveTrendPeriodLabel(dynamic, { value: '6.5%', trend_periods: PERIODS })).toBe(NEUTRAL_TREND_LABEL);
  });
  test('dynamic card: no live document at all is neutral', () => {
    [undefined, null, {}].forEach((live) => expect(resolveTrendPeriodLabel(dynamic, live)).toBe(NEUTRAL_TREND_LABEL));
  });
  test('NON-dynamic cards (US, UK, Australia and every other card) keep their static period exactly, with or without live data', () => {
    const stat = { label: 'Unemployment', period: 'Nov 23 – Apr 24' };
    expect(resolveTrendPeriodLabel(stat, undefined)).toBe('Nov 23 – Apr 24');
    expect(resolveTrendPeriodLabel(stat, { trend: TREND, trend_periods: PERIODS })).toBe('Nov 23 – Apr 24');
    expect(resolveTrendPeriodLabel({ label: 'No period' }, { trend: TREND })).toBeUndefined();
  });
});

describe('src/App.js wiring', () => {
  const app = fs.readFileSync(path.join(__dirname, '..', 'App.js'), 'utf8').replace(/\r\n/g, '\n');
  const cardLine = (key, cc) => {
    const start = app.indexOf(`cc: '${cc}',`);
    const from = app.indexOf(`firestoreKey: '${key}'`, start);
    const s = app.lastIndexOf('\n', from) + 1;
    return app.slice(s, app.indexOf('\n', from));
  };
  const caRender = app.slice(app.indexOf("cc: 'CA',\n    backView: 'categories'"));

  test('exactly three cards opt in, all on the Canada page: Unemployment, Inflation (CPI), Bank Rate', () => {
    const count = (app.match(/periodMode: 'dynamic'/g) || []).length;
    expect(count).toBe(3);
    const caSection = caRender.slice(0, caRender.indexOf('safety: ['));
    expect((caSection.match(/periodMode: 'dynamic'/g) || []).length).toBe(3);
    ['unemploymentRate', 'cpiInflation', 'bankRate'].forEach((k) => {
      const line = caSection.split('\n').find((l) => l.includes(`firestoreKey: '${k}'`));
      expect(line).toContain("periodMode: 'dynamic'");
      expect(line).not.toMatch(/\bperiod: '/);
    });
  });

  test('US, UK and Australia statistic cards carry no periodMode and keep their static period strings', () => {
    const us = app.slice(app.indexOf("cc: 'US',"), app.indexOf("cc: 'US',") + 9000);
    expect(us).toContain("period: 'Nov 23 – Apr 24'");
    expect(us).not.toContain("periodMode");
    ['UK', 'GB', 'AU'].forEach((cc) => {
      const i = app.indexOf(`cc: '${cc}',`);
      if (i < 0) return;
      expect(app.slice(i, i + 9000)).not.toContain('periodMode');
    });
    expect(cardLine('unemploymentRate', 'UK')).toMatch(/period: '/);
  });

  test('the Canada unemployment card no longer hardcodes a reporting period', () => {
    const caSection = caRender.slice(0, caRender.indexOf('safety: ['));
    expect(caSection).not.toContain('Jan – Jun 2024');
    expect(caSection).not.toContain("period: '2020 – 2026'");
    // unrelated Canada cards are untouched (they keep their own static period)
    expect(caSection).toContain("period: '2022 – 2025'");
    expect(caSection).toContain("period: '2022 – 2024'");
  });

  test('the renderer asks the helper for the label; the value, trend and sparkline logic are unchanged', () => {
    expect(app).toContain("from './utils/trendPeriodLabel'");
    expect(app).toContain('resolveTrendPeriodLabel(stat, live)');
    expect(app).not.toContain('{stat.period && <p');
    // untouched selection of live value / trend / source
    expect(app).toContain('const displayTrend   = (live?.trend && Array.isArray(live.trend)) ? live.trend : stat.trend;');
    expect(app).toContain('const displayValue   = live?.value   ?? stat.value;');
    expect(app).toContain('{sparkline(displayTrend, c.stroke)}');
  });
});
