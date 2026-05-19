/**
 * Fetch official leader profiles for all syncable subnational jurisdictions.
 */

const { trim, fetchText, buildVerificationReport } = require('./subnational-leader-profile-shared.cjs');
const { PILOT_IDS, fetchOfficialLeaderProfile } = require('./subnational-leader-profile-pilot.cjs');
const {
  extractProfileFromHtml,
  scoreNameCandidate,
} = require('./subnational-leader-profile-extract.cjs');

/**
 * @typedef {Object} RegistryEntry
 * @property {string} id
 * @property {string} country
 * @property {string} name
 * @property {string} leaderTitle
 * @property {string} officialTitle
 * @property {string|null} officialWebsite
 * @property {string|null} legislatureWebsite
 * @property {string[]} fetchUrls
 */

function mergeProfiles(a, b) {
  const profile = { ...a.profile };
  const verified = { ...a.verified };
  for (const [k, v] of Object.entries(b.profile || {})) {
    if (v && !profile[k]) {
      profile[k] = v;
      verified[k] = b.verified[k] || b.profile.leader_profile_source_url;
    }
  }
  return { profile, verified };
}

/**
 * @param {RegistryEntry} entry
 */
async function fetchGenericOfficialLeaderProfile(entry) {
  if (!entry.fetchUrls.length) {
    throw new Error('no_fetch_urls');
  }

  let best = { profile: {}, verified: {}, ok: false };
  const errors = [];

  for (const url of entry.fetchUrls) {
    try {
      const html = await fetchText(url);
      const extracted = extractProfileFromHtml(html, url, {
        leaderTitle: entry.leaderTitle,
        officialTitle: entry.officialTitle,
        officialWebsite: entry.officialWebsite,
      });
      if (extracted.ok) {
        if (!best.ok) {
          best = extracted;
        } else {
          best = mergeProfiles(best, extracted);
        }
        if (
          best.profile.leader_name &&
          best.profile.leader_bio &&
          best.profile.leader_office_contact
        ) {
          break;
        }
      }
    } catch (err) {
      errors.push(`${url}: ${err.message || err}`);
    }
  }

  if (!best.ok || !best.profile.leader_name) {
    const reason = errors.length ? errors.slice(0, 2).join('; ') : 'name_not_found_on_official_pages';
    throw new Error(reason);
  }

  if (scoreNameCandidate(best.profile.leader_name, entry.leaderTitle) < 3) {
    throw new Error(`unverified_leader_name:${best.profile.leader_name}`);
  }

  return {
    jurisdictionId: entry.id,
    profile: best.profile,
    verified: best.verified,
    report: buildVerificationReport(entry.id, best.verified),
  };
}

/**
 * @param {RegistryEntry} entry
 */
async function fetchLeaderProfileForRegistryEntry(entry) {
  const id = trim(entry.id);
  if (PILOT_IDS.includes(id)) {
    return fetchOfficialLeaderProfile(id);
  }
  return fetchGenericOfficialLeaderProfile(entry);
}

module.exports = {
  fetchLeaderProfileForRegistryEntry,
  fetchGenericOfficialLeaderProfile,
};
