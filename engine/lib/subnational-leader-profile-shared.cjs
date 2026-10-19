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
      .replace(/&#8217;|&rsquo;/gi, "'")
      .replace(/&#8216;|&lsquo;/gi, "'")
      .replace(/&#8211;|&ndash;/gi, '–')
      .replace(/&#8212;|&mdash;/gi, '—')
      .replace(/&#8220;|&ldquo;/gi, '"')
      .replace(/&#8221;|&rdquo;/gi, '"')
      .replace(/&hellip;|&#8230;/gi, '…')
      .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
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

// ─── General-purpose content-safety validation ────────────────────────────────
//
// Single source of truth for rejecting bot-mitigation/anti-scraping
// interstitials (Radware, Cloudflare, CAPTCHA/access-denied walls, generic
// HTTP error pages, etc.) and other non-biography content (empty, too short,
// or navigation/footer/menu-only text) from ever being treated as a real
// leader biography. Originally introduced narrowly inside the generic
// extractor (engine/lib/subnational-leader-profile-extract.cjs) to fix a
// confirmed CA-PE bug (princeedwardisland.ca served a Radware JS-challenge
// page, title "Radware Page", instead of the real Premier bio page);
// generalized here so every fetch path — generic, pilot, and any future
// mechanism — can share one implementation instead of duplicating it.

/** Minimum plausible length for real biography text. */
const MIN_BIO_LENGTH = 40;

/**
 * Matches bot-mitigation/anti-scraping interstitials and generic HTTP
 * error/challenge page boilerplate. Deliberately broad but anchored to
 * phrasing that is very unlikely to appear in genuine biography prose.
 */
// STRONG markers: essentially never appear on a normal page that also has
// real content — safe to reject an ENTIRE page on sight (whole-page check).
const CHALLENGE_PAGE_RE =
  /radware|cloudflare|captcha|access denied\b|verifying your browser|checking your (?:browser|connection)|page not found\b|404[\s:-]*(?:not found|error)?\b|403[\s:-]*(?:forbidden|error)?\b|request unsuccessful\b|incident id\s*:|ddos protection by|are you a robot\b|complete the captcha\b|unusual traffic from your (?:computer|network)|bot (?:protection|detection|management|challenge)\b|security check\b|attention required\b|this process is automatic\b|ray id\s*:/i;

// WEAKER/contextual markers: "this site needs JavaScript" style notices are
// common, legitimate boilerplate on many real government pages that ALSO
// serve real server-rendered content (confirmed directly against
// ontario.ca's premier page during this fix) — too noisy to reject a WHOLE
// page on sight. Still a reliable signal that a specific extracted BIO
// SNIPPET is not real biographical prose (e.g. ontario.ca's bio sub-page,
// which requires client-side JavaScript to render its real content and
// returns almost nothing but this notice plus nav to a plain HTTP fetch) —
// so these are included in bio-text-level validation (isBioTextSafe) only,
// not in the whole-page check (looksLikeChallengePage).
const JS_REQUIRED_RE =
  /javascript (?:is )?required|needs javascript\b|javascript to function|enable javascript\b|please enable javascript(?: and cookies)?\b/i;

/**
 * Common navigation/footer/menu fragments. Used only in combination (see
 * looksLikeNavigationOnly) — a single incidental match (e.g. a real bio that
 * happens to mention "contact") must never be enough to reject real content.
 */
const NAV_FRAGMENT_WORDS = [
  'skip to main content',
  'skip to content',
  'home',
  'about us',
  'contact us',
  'site map',
  'sitemap',
  'privacy policy',
  'terms of use',
  'terms of service',
  'accessibility',
  'copyright',
  'all rights reserved',
  'main menu',
  'sign in',
  'log in',
  'login',
  'search this site',
  // French equivalents — confirmed necessary against a real page
  // (quebec.ca's bilingual premier page) during this fix.
  'accueil',
  'rechercher',
  'nous joindre',
  'contactez-nous',
  'plan du site',
  'politique de confidentialité',
  'droits réservés',
  'menu principal',
];

/**
 * Short link-label phrases that legitimate index/teaser/hub pages commonly
 * repeat after every section (e.g. "Voir plus" / "Read more" / "Learn
 * more"), one per section. A single occurrence is unremarkable, but 3+
 * repeats of the exact same short phrase is a strong, language-agnostic
 * signal that the surrounding text is a concatenation of page-section
 * teasers — not continuous biographical prose — even though it still has
 * normal sentence punctuation (so looksLikeNavigationOnly's punctuation
 * check alone would miss it). Confirmed necessary against a real page:
 * quebec.ca's "Première ministre" hub page, whose body is six short
 * section teasers each ending in "Voir plus", was initially accepted as a
 * "biography" despite containing no continuous narrative about the person.
 */
const REPEATED_LINK_LABELS = [
  'voir plus',
  'en savoir plus',
  'lire la suite',
  'read more',
  'learn more',
  'see more',
  'find out more',
];

/** @param {string} text */
function hasRepeatedBoilerplateLinkText(text) {
  const s = String(text || '').toLowerCase();
  if (!s) return false;
  return REPEATED_LINK_LABELS.some((label) => {
    let count = 0;
    let idx = s.indexOf(label);
    while (idx !== -1) {
      count += 1;
      if (count >= 3) return true;
      idx = s.indexOf(label, idx + label.length);
    }
    return false;
  });
}

/**
 * True only when text is OVERWHELMINGLY navigation/footer/menu fragments:
 * at least 4 distinct nav-ish fragments present AND zero sentence-ending
 * punctuation anywhere. A real biography almost always has at least one
 * period; incidentally containing a word like "home" or "contact" is not
 * enough on its own to be rejected.
 * @param {string} text
 */
function looksLikeNavigationOnly(text) {
  const s = String(text || '').toLowerCase();
  if (!s) return false;
  let hits = 0;
  for (const frag of NAV_FRAGMENT_WORDS) {
    if (s.includes(frag)) hits += 1;
  }
  const hasSentencePunctuation = /[.!?](?:\s|$)/.test(text);
  return hits >= 4 && !hasSentencePunctuation;
}

/**
 * Whole-page check: does this fetched HTML look like a bot-mitigation
 * interstitial or generic error page rather than real content? Checked
 * against the <title> and a bounded prefix of the stripped body text —
 * challenge/error pages are typically short, so limiting the scan avoids
 * false positives from a long, real page that happens to mention e.g.
 * "Cloudflare" once in unrelated body copy (news article, footer link).
 * @param {string} html
 * @param {(html: string) => string} stripHtmlFn
 * @param {(html: string, re: RegExp) => string} firstMatchFn
 */
function looksLikeChallengePage(html, stripHtmlFn, firstMatchFn) {
  const title = firstMatchFn(html, /<title>([^<]*)<\/title>/i) || '';
  if (CHALLENGE_PAGE_RE.test(title)) return true;
  const plain = stripHtmlFn(html).slice(0, 2000);
  return CHALLENGE_PAGE_RE.test(plain);
}

/**
 * Content-level check for a candidate biography string: rejects empty,
 * implausibly short, challenge-page-contaminated, or navigation/footer-only
 * text. Never fabricates or alters legitimate content — only classifies it.
 * @param {unknown} text
 * @returns {{ safe: boolean, reason: string|null }}
 */
function isBioTextSafe(text) {
  const s = trim(text);
  if (!s) return { safe: false, reason: 'empty' };
  if (s.length < MIN_BIO_LENGTH) return { safe: false, reason: 'too_short' };
  if (CHALLENGE_PAGE_RE.test(s)) return { safe: false, reason: 'challenge_page_markers' };
  if (JS_REQUIRED_RE.test(s)) return { safe: false, reason: 'javascript_required_notice' };
  if (looksLikeNavigationOnly(s)) return { safe: false, reason: 'navigation_only' };
  if (hasRepeatedBoilerplateLinkText(s)) return { safe: false, reason: 'repeated_boilerplate_link_text' };
  return { safe: true, reason: null };
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
  MIN_BIO_LENGTH,
  CHALLENGE_PAGE_RE,
  JS_REQUIRED_RE,
  looksLikeNavigationOnly,
  hasRepeatedBoilerplateLinkText,
  looksLikeChallengePage,
  isBioTextSafe,
};
