/**
 * AU-NSW — official leader transparency (Chris Minns / Premier of NSW).
 */

const {
  trim,
  fetchText,
  absUrl,
  stripHtml,
  finalizePayload,
} = require('./subnational-leader-transparency-shared.cjs');

const JURISDICTION_ID = 'AU-NSW';
const MEDIA_URL = 'https://www.nsw.gov.au/media-releases';
const PREMIER_URL = 'https://www.nsw.gov.au/nsw-government/premier-of-nsw';

function parseNswMediaReleases(html) {
  const base = 'https://www.nsw.gov.au';
  const out = [];
  const seen = new Set();
  const re = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(html))) {
    const href = absUrl(base, m[1]);
    const title = stripHtml(m[2]);
    if (!title || title.length < 15) continue;
    if (!/ministerial-releases|media-release/i.test(href)) continue;
    if (!/minns|premier/i.test(`${title} ${href}`)) continue;
    const key = href.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      title,
      date: '',
      url: href,
      excerpt: '',
      source_url: href,
    });
    if (out.length >= 8) break;
  }
  return out;
}

async function fetchRecentActivity() {
  const html = await fetchText(MEDIA_URL, 800000);
  let items = parseNswMediaReleases(html);
  if (!items.length) {
    const premierHtml = await fetchText(PREMIER_URL, 600000);
    items = parseNswMediaReleases(premierHtml);
  }
  return { items, sourceUrl: items.length ? MEDIA_URL : PREMIER_URL };
}

async function buildLeaderTransparency() {
  const verified = {};
  const partial = {};

  try {
    const { items, sourceUrl } = await fetchRecentActivity();
    if (items.length) {
      partial.recent_official_activity = items;
      verified.recent_official_activity = sourceUrl;
    }
  } catch (err) {
    partial.recent_official_activity_error = trim(err.message);
  }

  return {
    jurisdictionId: JURISDICTION_ID,
    payload: finalizePayload(JURISDICTION_ID, partial, verified),
    verified,
  };
}

module.exports = {
  JURISDICTION_ID,
  buildLeaderTransparency,
};
