/**
 * Shared helpers for official subnational leader profile pilot sync.
 */

const { fetchBuffer } = require('./subnational-transparency-shared.cjs');

const USER_AGENT = 'CivicVoice-LeaderProfilePilot/1.0';

function trim(v) {
  if (v == null) return '';
  return String(v).trim();
}

function stripHtml(html) {
  return trim(
    String(html || '')
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&quot;/gi, '"')
      .replace(/&#8217;/gi, "'")
      .replace(/&#8211;/gi, '–')
      .replace(/\s+/g, ' '),
  );
}

function decodeEntities(s) {
  return String(s || '')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"');
}

function firstMatch(html, re) {
  const m = String(html || '').match(re);
  return m ? trim(decodeEntities(m[1])) : '';
}

function collapseBio(text, maxLen = 1200) {
  const t = trim(text);
  if (!t) return '';
  if (t.length <= maxLen) return t;
  const cut = t.slice(0, maxLen);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 400 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

async function fetchText(url, maxBytes = 2_500_000) {
  const buf = await fetchBuffer(url, maxBytes);
  return buf.toString('utf8');
}

/**
 * Build merge patch: only non-empty string values; never writes empty strings.
 *
 * @param {Record<string, unknown>} profile
 * @returns {Record<string, string|boolean>}
 */
function buildNonEmptyMergePatch(profile) {
  const patch = {};
  if (!profile || typeof profile !== 'object') return patch;
  for (const [key, val] of Object.entries(profile)) {
    if (val === true || val === false) {
      patch[key] = val;
      continue;
    }
    const s = trim(val);
    if (s) patch[key] = s;
  }
  if (patch.leader_title && !patch.leaderTitle) {
    patch.leaderTitle = patch.leader_title;
  }
  return patch;
}

/**
 * @param {Record<string, string>} verifiedFields field -> official source URL
 */
function buildVerificationReport(jurisdictionId, verifiedFields) {
  const allFields = [
    'leader_name',
    'leader_title',
    'leader_party',
    'leader_since',
    'leader_bio',
    'officialWebsite',
    'leader_office_contact',
    'leader_office_address',
    'leader_profile_source_url',
    'leader_profile_fetched_at',
  ];
  const rows = allFields.map((field) => ({
    field,
    verified: Object.prototype.hasOwnProperty.call(verifiedFields, field),
    source: verifiedFields[field] || null,
  }));
  return { jurisdictionId, rows };
}

module.exports = {
  USER_AGENT,
  trim,
  stripHtml,
  firstMatch,
  collapseBio,
  fetchText,
  buildNonEmptyMergePatch,
  buildVerificationReport,
};
