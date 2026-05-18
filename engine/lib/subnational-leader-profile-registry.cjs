/**
 * Registry of subnational jurisdictions eligible for official leader profile sync.
 * Sources: seed metadata + phase3b overlay officialWebsite (fetch targets only).
 */

const path = require('path');
const { buildUsCanadaAustraliaUkSeed } = require('../seed-subnational-jurisdictions.cjs');

const OVERLAY_PATH = path.join(__dirname, '..', 'data', 'subnational-phase3b-overlay.json');

/** No elected regional executive in app model — skip sync. */
const UK_REGION_EXCLUDE = new Set([
  'UK-ENG',
  'UK-ENG-NE',
  'UK-ENG-NW',
  'UK-ENG-YOR',
  'UK-ENG-EM',
  'UK-ENG-WM',
  'UK-ENG-EE',
  'UK-ENG-SE',
  'UK-ENG-SW',
]);

/** Extra official pages beyond portal root (pilot / known paths). */
const EXTRA_PROFILE_URLS = Object.freeze({
  'UK-ENG-LON': [
    'https://www.london.gov.uk/who-we-are/what-mayor-does/mayor-and-his-team/sadiq-khan',
    'https://www.london.gov.uk/contact-or-visit-city-hall/contact-city-hall-or-mayor',
  ],
  'AU-NSW': ['https://www.nsw.gov.au/nsw-government/premier-of-nsw'],
  'US-GA': ['https://gov.georgia.gov/'],
  'US-IN': ['https://www.in.gov/gov/'],
  'US-NY': ['https://www.governor.ny.gov/'],
  'US-OR': ['https://www.oregon.gov/gov/Pages/index.aspx'],
  'CA-BC': ['https://www2.gov.bc.ca/gov/content/government/organizational-structure/office-of-the-premier'],
  'CA-SK': ['https://www.saskatchewan.ca/government/news-and-media/2020/november/09/premier-moe'],
  'AU-QLD': ['https://www.qld.gov.au/about/leadership-government/premier-minister'],
  'AU-WA': ['https://www.wa.gov.au/government/about-government'],
  'AU-TAS': ['https://www.premier.tas.gov.au/'],
  'UK-SCT': ['https://www.gov.scot/about/who-runs-government/first-minister'],
  'UK-WLS': ['https://www.gov.wales/first-minister-of-wales'],
  'UK-NIR': ['https://www.executiveoffice-ni.gov.uk/topics/first-minister-deputy-first-minister'],
  'US-TX': ['https://gov.texas.gov/governor'],
});

const PATH_SUFFIXES = Object.freeze({
  US: ['/about', '/about-the-governor', '/about-governor', '/meet-the-governor', '/contact', '/bio'],
  CA: ['/about', '/premier', '/contact', '/en/about'],
  AU: ['/about', '/contact'],
  UK: ['/about', '/contact', '/first-minister', '/about/first-minister'],
});

function loadOverlay() {
  // eslint-disable-next-line import/no-dynamic-require, global-require
  return require(OVERLAY_PATH);
}

function trim(v) {
  if (v == null) return '';
  return String(v).trim();
}

function normalizeBaseUrl(url) {
  const u = trim(url);
  if (!u) return '';
  try {
    const parsed = new URL(u.endsWith('/') ? u : `${u}/`);
    return parsed.origin + parsed.pathname.replace(/\/$/, '') || parsed.origin;
  } catch {
    return u.replace(/\/$/, '');
  }
}

function joinUrl(base, suffix) {
  try {
    const b = base.endsWith('/') ? base : `${base}/`;
    const s = suffix.startsWith('/') ? suffix.slice(1) : suffix;
    return new URL(s, b).href;
  } catch {
    return '';
  }
}

function buildOfficialTitle(leaderTitle, jurisdictionName) {
  const lt = trim(leaderTitle);
  const jn = trim(jurisdictionName);
  if (!lt || !jn) return lt;
  if (/of\s/i.test(lt)) return lt;
  if (lt === 'Mayor') return `Mayor of ${jn}`;
  if (lt === 'Governor') return `Governor of ${jn}`;
  if (lt === 'Premier') return `Premier of ${jn}`;
  if (lt === 'Chief Minister') return `Chief Minister of ${jn}`;
  if (lt === 'First Minister') return `First Minister of ${jn}`;
  return `${lt} of ${jn}`;
}

/**
 * @returns {import('./subnational-leader-profile-fetch.cjs').RegistryEntry[]}
 */
function buildLeaderProfileRegistry(nowIso = new Date().toISOString()) {
  const overlay = loadOverlay();
  const seed = buildUsCanadaAustraliaUkSeed(nowIso);

  return seed
    .filter((row) => {
      if (!['US', 'CA', 'AU', 'UK'].includes(row.country)) return false;
      if (UK_REGION_EXCLUDE.has(row.id)) return false;
      return true;
    })
    .map((row) => {
      const ov = overlay[row.id] || {};
      let officialWebsite = trim(ov.officialWebsite);
      if (row.id === 'UK-ENG-LON' && !officialWebsite) {
        officialWebsite = 'https://www.london.gov.uk/';
      }
      const country = row.country;
      const suffixes = PATH_SUFFIXES[country] || ['/about', '/contact'];
      const candidates = [];
      const seen = new Set();
      const add = (u) => {
        const x = trim(u);
        if (!x || seen.has(x)) return;
        seen.add(x);
        candidates.push(x);
      };

      if (officialWebsite) {
        add(officialWebsite);
        const base = normalizeBaseUrl(officialWebsite);
        for (const suf of suffixes) {
          add(joinUrl(base || officialWebsite, suf));
        }
      }
      const extras = EXTRA_PROFILE_URLS[row.id];
      if (extras) extras.forEach(add);

      return {
        id: row.id,
        country: row.country,
        name: row.name,
        leaderTitle: row.leaderTitle || 'Leader',
        officialTitle: buildOfficialTitle(row.leaderTitle, row.name),
        officialWebsite: officialWebsite || null,
        legislatureWebsite: trim(ov.legislatureWebsite) || null,
        fetchUrls: candidates,
      };
    });
}

/**
 * @param {import('./subnational-leader-profile-fetch.cjs').RegistryEntry[]} registry
 */
function listSyncableIds(registry) {
  return registry.filter((r) => r.officialWebsite && r.fetchUrls.length).map((r) => r.id);
}

/**
 * @param {import('./subnational-leader-profile-fetch.cjs').RegistryEntry[]} registry
 */
function listUnresolvedNoPortal(registry) {
  return registry.filter((r) => !r.officialWebsite).map((r) => ({ id: r.id, reason: 'no_official_portal_in_registry' }));
}

module.exports = {
  UK_REGION_EXCLUDE,
  buildLeaderProfileRegistry,
  listSyncableIds,
  listUnresolvedNoPortal,
};
