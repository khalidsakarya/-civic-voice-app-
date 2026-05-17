/**
 * Shared helpers for subnational transparency Firestore sync (CA-ON template).
 */

const http = require('http');
const https = require('https');
const { URL } = require('url');

const MAX_RECORDS = 100;
const BUDGET_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

const INDUSTRY_BADGE = {
  Education: 'bg-blue-100 text-blue-700',
  Health: 'bg-green-100 text-green-700',
  'Human Services': 'bg-emerald-100 text-green-700',
  Religion: 'bg-orange-100 text-orange-700',
  'Arts/Culture': 'bg-purple-100 text-purple-700',
  Environment: 'bg-teal-100 text-teal-700',
  Other: 'bg-stone-100 text-stone-600',
};

function trim(v) {
  if (v == null) return '';
  return String(v).trim();
}

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

async function fetchBuffer(url, maxBytes = 0) {
  if (typeof globalThis.fetch === 'function') {
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), 180000);
    try {
      const res = await globalThis.fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 CivicVoice-SubnationalSync/1.0', Accept: '*/*' },
        signal: ac.signal,
        redirect: 'follow',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
      const ab = await res.arrayBuffer();
      const buf = Buffer.from(ab);
      if (maxBytes > 0 && buf.length > maxBytes) {
        throw new Error(`Response exceeded ${maxBytes} bytes: ${url}`);
      }
      return buf;
    } finally {
      clearTimeout(timer);
    }
  }
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const lib = u.protocol === 'https:' ? https : http;
    const req = lib.get(
      url,
      { headers: { 'User-Agent': 'CivicVoice-SubnationalSync/1.0', Accept: '*/*' } },
      (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          res.resume();
          fetchBuffer(res.headers.location, maxBytes).then(resolve, reject);
          return;
        }
        if (res.statusCode !== 200) {
          res.resume();
          reject(new Error(`HTTP ${res.statusCode} for ${url}`));
          return;
        }
        const chunks = [];
        let size = 0;
        res.on('data', (c) => {
          size += c.length;
          if (maxBytes > 0 && size > maxBytes) {
            req.destroy();
            reject(new Error(`Response exceeded ${maxBytes} bytes: ${url}`));
            return;
          }
          chunks.push(c);
        });
        res.on('end', () => resolve(Buffer.concat(chunks)));
      },
    );
    req.on('error', reject);
    req.setTimeout(180000, () => {
      req.destroy();
      reject(new Error(`Timeout: ${url}`));
    });
  });
}

async function fetchText(url, maxBytes = 0) {
  const buf = await fetchBuffer(url, maxBytes);
  return buf.toString('utf8');
}

async function fetchJson(url) {
  const text = await fetchText(url);
  return JSON.parse(text);
}

/** Minimal RFC4180-ish CSV parse (no multiline fields). */
function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.length);
  if (!lines.length) return { headers: [], rows: [] };
  const headers = splitCsvLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i += 1) {
    const cols = splitCsvLine(lines[i]);
    if (!cols.length || cols.every((c) => !trim(c))) continue;
    const row = {};
    for (let j = 0; j < headers.length; j += 1) {
      row[headers[j]] = cols[j] ?? '';
    }
    rows.push(row);
  }
  return { headers, rows };
}

function splitCsvLine(line) {
  const out = [];
  let cur = '';
  let inQ = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (inQ && line[i + 1] === '"') {
        cur += '"';
        i += 1;
      } else inQ = !inQ;
    } else if (ch === ',' && !inQ) {
      out.push(cur);
      cur = '';
    } else cur += ch;
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

/** FRED fredgraph.csv → [{ date, value }] */
function parseFredCsv(text, seriesId) {
  const lines = text.split(/\r?\n/).filter((l) => l.startsWith('20'));
  const out = [];
  for (let i = 0; i < lines.length; i += 1) {
    const [date, val] = splitCsvLine(lines[i]);
    const v = num(val);
    if (date && v != null) out.push({ date, value: v, seriesId: seriesId || '' });
  }
  return out;
}

function annualFromMonthly(points, lastN = 6) {
  const byYear = new Map();
  for (let i = 0; i < points.length; i += 1) {
    const y = points[i].date.slice(0, 4);
    if (!byYear.has(y)) byYear.set(y, []);
    byYear.get(y).push(points[i].value);
  }
  const years = [...byYear.keys()].sort();
  const slice = years.slice(-lastN);
  return slice.map((year) => {
    const vals = byYear.get(year);
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    return { year, value: Math.round(avg * 10) / 10 };
  });
}

function yoyPercentFromAnnual(levels) {
  const out = [];
  for (let i = 1; i < levels.length; i += 1) {
    const prev = levels[i - 1].value;
    const cur = levels[i].value;
    if (prev > 0) {
      out.push({
        year: levels[i].year,
        'GDP Growth (%)': Math.round(((cur - prev) / prev) * 1000) / 10,
      });
    }
  }
  return out;
}

function fmtCompact(n) {
  const x = Math.abs(Number(n) || 0);
  if (x >= 1e9) return `$${(x / 1e9).toFixed(2)}B`;
  if (x >= 1e6) return `$${(x / 1e6).toFixed(2)}M`;
  if (x >= 1e3) return `$${(x / 1e3).toFixed(1)}K`;
  return `$${Math.round(x)}`;
}

function parseMoneyish(s) {
  const t = trim(s).replace(/[$,]/g, '');
  if (!t) return 0;
  const n = Number(t);
  return Number.isFinite(n) ? n : 0;
}

function industryFromNtee(subsection, classification) {
  const sub = trim(subsection);
  const cls = trim(classification);
  if (sub === '3') return { label: 'Religion', color: INDUSTRY_BADGE.Religion };
  if (sub === '4') return { label: 'Education', color: INDUSTRY_BADGE.Education };
  if (sub === '7' || cls.startsWith('E')) return { label: 'Health', color: INDUSTRY_BADGE.Health };
  if (sub === '2') return { label: 'Environment', color: INDUSTRY_BADGE.Environment };
  if (cls.startsWith('A')) return { label: 'Arts/Culture', color: INDUSTRY_BADGE['Arts/Culture'] };
  if (sub === '9') return { label: 'Human Services', color: INDUSTRY_BADGE['Human Services'] };
  return { label: 'Other', color: INDUSTRY_BADGE.Other };
}

function hasEconomicPayload(doc) {
  if (!doc || typeof doc !== 'object') return false;
  const keys = [
    'budget_distribution',
    'spending_vs_budget',
    'crime_rate',
    'crime_rate_trends',
    'unemployment_rate',
    'gdp_growth',
    'poverty_rate',
    'homelessness',
  ];
  return keys.some((k) => Array.isArray(doc[k]) && doc[k].length > 0);
}

function hasTaxPayload(doc) {
  return !!(doc && Array.isArray(doc.records) && doc.records.length > 0);
}

function hasGrantsPayload(doc) {
  return !!(doc && Array.isArray(doc.records) && doc.records.length > 0);
}

/** Remove `undefined` so Firestore merge accepts nested records. */
function stripUndefinedDeep(value) {
  if (value === undefined) return undefined;
  if (value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) {
    return value.map((item) => stripUndefinedDeep(item)).filter((item) => item !== undefined);
  }
  const out = {};
  for (const [k, v] of Object.entries(value)) {
    if (v === undefined) continue;
    const next = stripUndefinedDeep(v);
    if (next !== undefined) out[k] = next;
  }
  return out;
}

async function mergeTransparencyDoc(db, collection, jurisdictionId, payload, kind) {
  const ok =
    kind === 'economic'
      ? hasEconomicPayload(payload)
      : kind === 'tax'
        ? hasTaxPayload(payload)
        : hasGrantsPayload(payload);
  if (!ok) {
    return { written: false, reason: 'no_substantive_data' };
  }
  const ref = db.collection(collection).doc(jurisdictionId);
  const existing = await ref.get();
  const merged = stripUndefinedDeep({
    ...payload,
    jurisdiction_id: jurisdictionId,
    fetched_at: new Date().toISOString(),
  });
  await ref.set(merged, { merge: true });
  return {
    written: true,
    existed: existing.exists,
    recordCount:
      kind === 'economic'
        ? null
        : (merged.records && merged.records.length) || 0,
  };
}

async function ckanDatastoreSearch(baseUrl, resourceId, opts = {}) {
  const limit = opts.limit || 500;
  const offset = opts.offset || 0;
  const q = new URLSearchParams({
    resource_id: resourceId,
    limit: String(limit),
    offset: String(offset),
  });
  if (opts.sort) q.set('sort', opts.sort);
  if (opts.filters) q.set('filters', JSON.stringify(opts.filters));
  const url = `${baseUrl.replace(/\/$/, '')}/api/3/action/datastore_search?${q}`;
  const json = await fetchJson(url);
  if (!json.success) throw new Error(json.error && json.error.message ? json.error.message : 'CKAN search failed');
  return json.result;
}

module.exports = {
  MAX_RECORDS,
  BUDGET_COLORS,
  INDUSTRY_BADGE,
  trim,
  num,
  fetchBuffer,
  fetchText,
  fetchJson,
  parseCsv,
  splitCsvLine,
  parseFredCsv,
  annualFromMonthly,
  yoyPercentFromAnnual,
  fmtCompact,
  parseMoneyish,
  industryFromNtee,
  hasEconomicPayload,
  hasTaxPayload,
  hasGrantsPayload,
  mergeTransparencyDoc,
  ckanDatastoreSearch,
};
