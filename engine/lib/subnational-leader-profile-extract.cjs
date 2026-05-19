/**
 * Extract leader profile fields from official HTML only (no overlay/demo names).
 */

const {
  trim,
  stripHtml,
  firstMatch,
  collapseBio,
} = require('./subnational-leader-profile-shared.cjs');

const INVALID_NAME_RE =
  /^(home|about|contact|welcome|official|government|news|menu|search|skip|read more|latest)$/i;

const INVALID_NAME_FRAGMENT_RE =
  /\b(home\s*page|welcome\s+to|official\s+site|official\s+website|latest\s+news|web\s*site|overview|government|executive\s+office|scottish\s+government|northern\s+ireland|office\s+of\s+the|premier\s+of|governor\s+of|first\s+minister\s+of|state\s+of)\b/i;

const ROLE_PREFIX_RE =
  /^(governor|premier|mayor|chief minister|first minister|lieutenant governor|honou?rable|the hon\.?|office of the)\b/i;

const PARTY_PATTERNS = [
  /\b(Democratic Party|Republican Party|Libertarian Party)\b/i,
  /\b(Australian Labor Party|Labor Party|Liberal National Party of Queensland|Liberal Party|National Party|Country Liberal Party|Greens)\b/i,
  /\b(Progressive Conservative Party of Ontario|United Conservative Party|British Columbia New Democratic Party|New Democratic Party of Manitoba|Liberal Party of Newfoundland and Labrador|Progressive Conservative Association of Nova Scotia|Yukon Liberal Party|Saskatchewan Party|Coalition Avenir Québec|New Brunswick Liberal Association)\b/i,
  /\b(Scottish National Party|Welsh Labour|Labour Party|Sinn Féin|Sinn Fein|Democratic Unionist Party|Ulster Unionist Party|Alliance Party)\b/i,
];

function decodeEntities(s) {
  return String(s || '')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"');
}

function escapeRe(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizePersonName(name) {
  let n = trim(decodeEntities(name))
    .replace(/\s+/g, ' ')
    .replace(/\s*[|–—-]\s*.*$/, '')
    .replace(/\s+of\s+[^|]+$/i, '')
    .trim();
  if (ROLE_PREFIX_RE.test(n)) {
    n = n.replace(ROLE_PREFIX_RE, '').trim();
  }
  n = n.replace(/^about\s+/i, '').replace(/^gov\.?\s+/i, '').trim();
  const govName = n.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z'-]+)+)$/);
  if (govName) n = govName[1];
  if (!n || n.length < 4 || n.length > 60) return '';
  const words = n.split(/\s+/).filter(Boolean);
  if (words.length < 2 || words.length > 5) return '';
  if (INVALID_NAME_RE.test(n)) return '';
  if (INVALID_NAME_FRAGMENT_RE.test(n)) return '';
  if (!words.every((w) => /^[A-Z][a-zA-Z.'\u00C0-\u024F-]*$/.test(w) || /^[A-Z]\.?$/.test(w))) return '';
  if (/^the\s/i.test(n) && !/^the hon\b/i.test(n)) return '';
  return n;
}

function nameAppearsInHtml(html, name) {
  const plain = stripHtml(html);
  if (!name) return false;
  if (plain.toLowerCase().includes(name.toLowerCase())) return true;
  const last = name.split(/\s+/).pop();
  return last && last.length > 2 && plain.toLowerCase().includes(last.toLowerCase());
}

function extractJsonLdPersons(html) {
  /** @type {Record<string, unknown>[]} */
  const persons = [];
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html))) {
    try {
      const data = JSON.parse(m[1].trim());
      const walk = (node) => {
        if (!node || typeof node !== 'object') return;
        if (Array.isArray(node)) {
          node.forEach(walk);
          return;
        }
        const t = node['@type'];
        const types = Array.isArray(t) ? t : [t];
        if (types.some((x) => String(x || '').toLowerCase() === 'person')) {
          persons.push(node);
        }
        if (node['@graph']) walk(node['@graph']);
        if (node.mainEntity) walk(node.mainEntity);
      };
      walk(data);
    } catch {
      /* ignore invalid JSON-LD */
    }
  }
  return persons;
}

function extractNameCandidates(html, leaderTitle) {
  /** @type {string[]} */
  const out = [];
  const add = (raw) => {
    const n = normalizePersonName(raw);
    if (n && !out.includes(n)) out.push(n);
  };

  for (const p of extractJsonLdPersons(html)) {
    if (p.name) add(String(p.name));
  }

  const og = firstMatch(html, /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
  if (og) add(og);

  const title = firstMatch(html, /<title>([^<]+)<\/title>/i);
  if (title) add(title);

  const lt = trim(leaderTitle);
  if (lt) {
    const ltRe = escapeRe(lt);
    const patterns = [
      new RegExp(`${ltRe}\\s+([A-Z][\\w.'\\u00C0-\\u024F-]+(?:\\s+[A-Z][\\w.'\\u00C0-\\u024F-]+)+)`, 'i'),
      new RegExp(`([A-Z][\\w.'\\u00C0-\\u024F-]+(?:\\s+[A-Z]\\.?\\s*)?[A-Z][\\w.'\\u00C0-\\u024F-]+),?\\s+${ltRe}`, 'i'),
      new RegExp(`The Hon\\.?\\s+([A-Z][\\w.'\\u00C0-\\u024F-]+(?:\\s+[A-Z][\\w.'\\u00C0-\\u024F-]+)+)`, 'i'),
    ];
    for (const re of patterns) {
      const m = String(html || '').match(re);
      if (m && m[1]) add(m[1]);
    }
    const h1 = firstMatch(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i);
    if (h1) add(stripHtml(h1));
  }

  return out;
}

function scoreNameCandidate(name, leaderTitle) {
  let score = 0;
  const words = name.split(/\s+/);
  if (words.length >= 2 && words.length <= 4) score += 3;
  if (INVALID_NAME_FRAGMENT_RE.test(name)) score -= 10;
  if (ROLE_PREFIX_RE.test(name)) score -= 5;
  const lt = trim(leaderTitle);
  if (lt && new RegExp(escapeRe(lt), 'i').test(name)) score -= 4;
  if (/^[A-Z][a-z]+\s+[A-Z][a-z]+/.test(name)) score += 2;
  return score;
}

function pickVerifiedName(html, leaderTitle) {
  const candidates = extractNameCandidates(html, leaderTitle)
    .map((name) => ({ name, score: scoreNameCandidate(name, leaderTitle) }))
    .filter((c) => c.score > 0 && nameAppearsInHtml(html, c.name))
    .sort((a, b) => b.score - a.score);
  return candidates.length ? candidates[0].name : '';
}

function extractParty(html, verifiedName) {
  if (!verifiedName) return '';
  const plain = stripHtml(html);
  if (!plain.toLowerCase().includes(verifiedName.split(/\s+/).pop().toLowerCase())) return '';
  for (const re of PARTY_PATTERNS) {
    const m = plain.match(re);
    if (m && m[1]) return trim(m[1]);
  }
  return '';
}

function parseHumanDateToIso(fragment) {
  const s = trim(fragment);
  if (!s) return '';
  const iso = s.match(/(\d{4}-\d{2}-\d{2})/);
  if (iso) return iso[1];
  const m = s.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
  if (!m) return '';
  const months = {
    january: '01',
    february: '02',
    march: '03',
    april: '04',
    may: '05',
    june: '06',
    july: '07',
    august: '08',
    september: '09',
    october: '10',
    november: '11',
    december: '12',
  };
  const mo = months[m[2].toLowerCase()];
  if (!mo) return '';
  const day = String(m[1]).padStart(2, '0');
  return `${m[3]}-${mo}-${day}`;
}

function extractSince(html, verifiedName) {
  const plain = stripHtml(html);
  if (verifiedName && !nameAppearsInHtml(html, verifiedName)) return '';
  const re =
    /(?:sworn in|was sworn|inaugurated|took office|assumed office|became (?:the )?(?:\d+(?:st|nd|rd|th) )?(?:Governor|Premier|Chief Minister|First Minister|Mayor))[\s\S]{0,160}?(\d{1,2}\s+[A-Za-z]+\s+\d{4}|\d{4}-\d{2}-\d{2})/i;
  const m = plain.match(re);
  if (m) return parseHumanDateToIso(m[1]);
  const isoNear = plain.match(
    /(?:since|in office since|premier since|governor since)\s*[:\s]*(\d{4}-\d{2}-\d{2}|\d{1,2}\s+[A-Za-z]+\s+\d{4})/i,
  );
  if (isoNear) return parseHumanDateToIso(isoNear[1]);
  return '';
}

function extractBio(html, verifiedName, sourceUrl) {
  if (!verifiedName) return { bio: '', source: '' };
  const meta = firstMatch(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
  if (meta && meta.toLowerCase().includes(verifiedName.split(/\s+/)[0].toLowerCase())) {
    const bio = collapseBio(stripHtml(meta));
    if (bio.length >= 40) return { bio, source: sourceUrl };
  }
  const plain = stripHtml(html);
  const idx = plain.toLowerCase().indexOf(verifiedName.toLowerCase());
  if (idx >= 0) {
    const chunk = plain.slice(idx, idx + 900);
    const bio = collapseBio(chunk);
    if (bio.length >= 60) return { bio, source: sourceUrl };
  }
  return { bio: '', source: '' };
}

function extractContact(html, sourceUrl) {
  const verified = {};
  const profile = {};
  const tels = [];
  const reTel = /href=["']tel:([^"']+)["']/gi;
  let m;
  while ((m = reTel.exec(html))) {
    const t = trim(m[1].replace(/\s+/g, ' '));
    if (t && !tels.includes(t)) tels.push(t);
  }
  if (!tels.length) {
    const phone = html.match(/(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    if (phone) tels.push(trim(phone[0]));
  }
  if (tels.length) {
    profile.leader_office_contact = tels.slice(0, 2).join(' · ');
    verified.leader_office_contact = sourceUrl;
  }

  const emails = [];
  const reMail = /href=["']mailto:([^"']+)["']/gi;
  while ((m = reMail.exec(html))) {
    const e = trim(m[1].split('?')[0]);
    if (e && !emails.includes(e)) emails.push(e);
  }
  if (emails.length) {
    const extra = emails.slice(0, 2).join(' · ');
    profile.leader_office_contact = profile.leader_office_contact
      ? `${profile.leader_office_contact} · ${extra}`
      : extra;
    verified.leader_office_contact = sourceUrl;
  }

  const addr =
    firstMatch(html, /<address[^>]*>([\s\S]*?)<\/address>/i) ||
    firstMatch(html, /(GPO Box[^.<]{8,120})/i) ||
    firstMatch(html, /(\d+[^.<]{5,80}(?:Street|St\.|Avenue|Ave\.|Road|Rd\.|Boulevard|Blvd\.)[^.<]{5,80}(?:\d{5}|[A-Z]{2,3}\s+\d{4}))/i);
  if (addr) {
    profile.leader_office_address = collapseBio(stripHtml(addr), 240);
    verified.leader_office_address = sourceUrl;
  }

  return { profile, verified };
}

/**
 * @param {string} html
 * @param {string} sourceUrl
 * @param {{ leaderTitle: string, officialTitle: string, officialWebsite: string|null }} meta
 */
function extractProfileFromHtml(html, sourceUrl, meta) {
  const verified = {};
  const profile = {};

  const leaderName = pickVerifiedName(html, meta.leaderTitle);
  if (!leaderName) {
    return { profile, verified, ok: false };
  }

  profile.leader_name = leaderName;
  verified.leader_name = sourceUrl;

  profile.leader_title = meta.officialTitle;
  verified.leader_title = sourceUrl;

  const party = extractParty(html, leaderName);
  if (party) {
    profile.leader_party = party;
    verified.leader_party = sourceUrl;
  }

  const since = extractSince(html, leaderName);
  if (since) {
    profile.leader_since = since;
    verified.leader_since = sourceUrl;
  }

  const { bio, source: bioSource } = extractBio(html, leaderName, sourceUrl);
  if (bio) {
    profile.leader_bio = bio;
    verified.leader_bio = bioSource;
  }

  if (meta.officialWebsite) {
    try {
      const u = new URL(meta.officialWebsite);
      profile.officialWebsite = u.origin;
      verified.officialWebsite = sourceUrl;
    } catch {
      profile.officialWebsite = meta.officialWebsite;
      verified.officialWebsite = sourceUrl;
    }
  }

  const contact = extractContact(html, sourceUrl);
  Object.assign(profile, contact.profile);
  Object.assign(verified, contact.verified);

  profile.leader_profile_source_url = sourceUrl;
  verified.leader_profile_source_url = sourceUrl;

  return { profile, verified, ok: true };
}

module.exports = {
  extractProfileFromHtml,
  pickVerifiedName,
  nameAppearsInHtml,
  scoreNameCandidate,
};
