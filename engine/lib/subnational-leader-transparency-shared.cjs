/**
 * Shared helpers for official subnational leader transparency sync (pilot).
 */

const { trim, fetchText } = require('./subnational-transparency-shared.cjs');

const PILOT_IDS = Object.freeze(['US-CA', 'CA-ON', 'AU-NSW', 'UK-ENG-LON']);

const SECTION_KEYS = Object.freeze([
  'salary',
  'financial_disclosure',
  'assets',
  'stock_holdings',
  'campaign_finance',
  'lobbying_disclosures',
  'conflict_disclosures',
  'recent_official_activity',
]);

function decodeEntities(s) {
  return String(s || '')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#039;/g, "'");
}

function stripHtml(html) {
  return trim(decodeEntities(String(html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')));
}

function firstMatch(html, re) {
  const m = String(html || '').match(re);
  return m ? trim(decodeEntities(m[1])) : '';
}

function absUrl(base, href) {
  const h = trim(href);
  if (!h) return '';
  if (/^https?:\/\//i.test(h)) return h;
  try {
    return new URL(h, base).href;
  } catch {
    return h;
  }
}

function parseRssItems(xml) {
  const items = [];
  const re = /<item>([\s\S]*?)<\/item>/gi;
  let m;
  while ((m = re.exec(xml))) {
    const block = m[1];
    const title = firstMatch(block, /<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
    const link = firstMatch(block, /<link>([\s\S]*?)<\/link>/i);
    const pubDate = firstMatch(block, /<pubDate>([\s\S]*?)<\/pubDate>/i);
    const description = firstMatch(
      block,
      /<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i,
    );
    if (title && link) {
      items.push({ title, link, pubDate, description });
    }
  }
  return items;
}

function parseDateFromUrl(url) {
  const m = String(url || '').match(/\/(\d{4})\/(\d{2})\/(\d{2})\//);
  if (!m) return '';
  return `${m[1]}-${m[2]}-${m[3]}`;
}

function parsePressLinksFromHtml(html, baseUrl, options = {}) {
  const { hostPattern, minTitleLen = 12, limit = 8, titleFilter } = options;
  const out = [];
  const seen = new Set();
  const re = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(html))) {
    const href = absUrl(baseUrl, m[1]);
    const title = stripHtml(m[2]);
    if (!href || !title || title.length < minTitleLen) continue;
    if (hostPattern && !hostPattern.test(href)) continue;
    if (titleFilter && !titleFilter(title, href)) continue;
    const key = href.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      title,
      date: parseDateFromUrl(href),
      url: href,
      excerpt: '',
      source_url: href,
    });
    if (out.length >= limit) break;
  }
  return out;
}

function parseHtmlTables(html) {
  const tables = String(html || '').match(/<table[\s\S]*?<\/table>/gi) || [];
  return tables.map((t) => {
    const rows = [...t.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)]
      .map((row) =>
        [...row[1].matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi)].map((c) => stripHtml(c[1])),
      )
      .filter((r) => r.some((c) => c));
    return rows;
  });
}

function tableToRecords(rows, headerNames) {
  if (!rows.length) return [];
  const header = rows[0].map((c) => c.toLowerCase());
  const idx = {};
  for (const name of headerNames) {
    const i = header.findIndex((h) => h.includes(name));
    if (i >= 0) idx[name] = i;
  }
  if (Object.keys(idx).length < 2) return [];
  return rows.slice(1).map((cells) => {
    const rec = {};
    for (const [key, i] of Object.entries(idx)) {
      rec[key] = cells[i] || '';
    }
    return rec;
  });
}

/**
 * Build merge patch: only non-empty values; never writes empty strings or empty arrays.
 */
function buildTransparencyMergePatch(payload) {
  const patch = {};
  if (!payload || typeof payload !== 'object') return patch;

  for (const [key, val] of Object.entries(payload)) {
    if (val === true || val === false) {
      patch[key] = val;
      continue;
    }
    if (Array.isArray(val)) {
      if (val.length) patch[key] = val;
      continue;
    }
    if (val && typeof val === 'object') {
      const nested = buildTransparencyMergePatch(val);
      if (Object.keys(nested).length) patch[key] = nested;
      continue;
    }
    const s = trim(val);
    if (s) patch[key] = s;
  }
  return patch;
}

function computeSectionAvailability(payload) {
  const available = [];
  const unavailable = [];

  for (const key of SECTION_KEYS) {
    const val = payload[key];
    let has = false;
    if (Array.isArray(val)) has = val.length > 0;
    else if (val && typeof val === 'object') has = Object.keys(val).length > 0;
    else has = !!trim(val);

    if (has) available.push(key);
    else unavailable.push(key);
  }

  return { sections_available: available, sections_unavailable: unavailable };
}

function finalizePayload(jurisdictionId, partial, verifiedFields) {
  const { sections_available, sections_unavailable } = computeSectionAvailability(partial);
  const field_sources = { ...verifiedFields };

  return {
    jurisdiction_id: jurisdictionId,
    transparency_live: sections_available.length > 0,
    sections_available,
    sections_unavailable,
    field_sources,
    ...partial,
  };
}

module.exports = {
  PILOT_IDS,
  SECTION_KEYS,
  trim,
  fetchText,
  stripHtml,
  firstMatch,
  absUrl,
  parseRssItems,
  parsePressLinksFromHtml,
  parseHtmlTables,
  tableToRecords,
  buildTransparencyMergePatch,
  computeSectionAvailability,
  finalizePayload,
};
