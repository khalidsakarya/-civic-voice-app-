/**
 * US state governor cabinet fetch — official executive branch / cabinet pages only.
 */

const { trim, fetchText } = require('./subnational-transparency-shared.cjs');
const {
  stripHtml,
  parseHtmlTables,
  absUrl,
} = require('./subnational-leader-transparency-shared.cjs');
const { getStateConfig } = require('./us-state-leader-transparency-config.cjs');

const ROLE_PATTERNS = [
  { re: /secretary of/i, role: 'cabinet_secretary' },
  { re: /chief of staff/i, role: 'chief_of_staff' },
  { re: /director/i, role: 'agency_director' },
  { re: /commissioner/i, role: 'agency_director' },
  { re: /superintendent/i, role: 'agency_director' },
  { re: /attorney general|treasurer|comptroller|auditor|lieutenant governor|lt\.?\s*governor/i, role: 'cabinet_secretary' },
];

function classifyRole(title) {
  const t = String(title || '');
  for (const { re, role } of ROLE_PATTERNS) {
    if (re.test(t)) return role;
  }
  return 'other_official';
}

function looksLikePersonName(text) {
  const t = trim(text);
  if (!t || t.length < 5 || t.length > 50) return false;
  if (/^(skip|menu|search|home|news|contact|overview|directory|flag|toggle|open|close|more|learn|read|view|click|download|pdf|site|report|privacy|policy|facebook|twitter|instagram|youtube|linkedin|quick links|connect with|school choice|sign up|subscribe|follow us|share|email|phone|address|navigation|agency directory|your government|top services|translation|disclaimer|main content|high contrast)/i.test(t)) {
    return false;
  }
  if (/Time Zone|^Hours$|First Lady of|Connect With|Quick Links|School Choice|Unemployment|Statistics|Contrast|Switch|Content|Pensions|Healthcare|Coloradans|money on/i.test(t)) {
    return false;
  }
  const words = t.split(/\s+/);
  if (words.length < 2 || words.length > 4) return false;
  if (/\b(unemployment|history|statistics|contrast|switch|content|pensions|healthcare|health|save|money|lowest|highest|official|department|office|governor|state|mode|main|announcement|initiative|program|services|resources|information|update|release|press)\b/i.test(t)) {
    return false;
  }
  for (const w of words) {
    if (!/^[A-Z][a-z'-]+$/.test(w) && !/^[A-Z]\.$/.test(w)) return false;
  }
  if (/Governor|Texas|Florida|Illinois|Pennsylvania|New York|Department|Office|Commission|Status|Release|Press|Executive|Organization|Appointments|Additional|Resources|Events|Demographics|Policies|Fraud|Map|Staff|Full|Overview|Premier|Minister|Secretary of State$|Choice|Links|Connect|Social|Media|Newsletter|Services|Information|Disclaimer|Directory|Government|Stay Informed|Flag Status|Top services|Translation|More Information|Agency Directory|Your Government|Alabama|Colorado|Kentucky|Arkansas|Connecticut|Delaware|Hawaii|Indiana|Iowa/.test(t)) {
    return false;
  }
  return true;
}

function parseCabinetFromTables(html, baseUrl) {
  const members = [];
  const seen = new Set();
  for (const table of parseHtmlTables(html)) {
    if (table.length < 2) continue;
    const header = table[0].map((c) => c.toLowerCase());
    const nameI = header.findIndex((h) => /name|official|member|appointee/.test(h));
    const titleI = header.findIndex((h) => /title|position|role|office|agency|department/.test(h));
    if (nameI < 0) continue;
    for (const row of table.slice(1)) {
      const name = trim(row[nameI >= 0 ? nameI : 0]);
      const title = trim(row[titleI >= 0 ? titleI : 1] || '');
      if (!looksLikePersonName(name)) continue;
      const key = `${name}|${title}`.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      members.push({
        name,
        title: title || 'Executive official',
        department: title || '',
        role: classifyRole(title),
        source_url: baseUrl,
      });
    }
  }
  return members;
}

function parseCabinetFromCardPatterns(html, baseUrl) {
  const members = [];
  const seen = new Set();
  const re = /(<(?:h[2-4]|strong|b)[^>]*>([^<]{3,80})<\/(?:h[2-4]|strong|b)>[\s\S]{0,400}?<(?:p|span|div)[^>]*>([^<]{4,120})<\/(?:p|span|div)>)/gi;
  let m;
  while ((m = re.exec(html))) {
    const title = stripHtml(m[2]);
    const name = stripHtml(m[3]);
      if (!looksLikePersonName(name)) continue;
      if (/first lady|second lady|spouse of|hours|time zone/i.test(`${title} ${name}`)) continue;
    const key = `${name}|${title}`.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    members.push({
      name,
      title,
      department: title,
      role: classifyRole(title),
      source_url: baseUrl,
    });
    if (members.length >= 40) break;
  }
  return members;
}

function parseCabinetFromLinks(html, baseUrl) {
  const members = [];
  const seen = new Set();
  const re = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>\s*(?:<[^>]+>)?\s*([^<]{4,80})?/gi;
  let m;
  while ((m = re.exec(html))) {
    const href = absUrl(baseUrl, m[1]);
    const linkText = stripHtml(m[2]);
    const adjacent = stripHtml(m[3] || '');
    const name = looksLikePersonName(linkText) ? linkText : looksLikePersonName(adjacent) ? adjacent : '';
    const title = looksLikePersonName(linkText) ? adjacent : linkText;
    if (!name || !title || name === title) continue;
    if (!/secretary|director|commissioner|chief|superintendent|administrator|counsel|advisor|adviser|treasurer|attorney|lieutenant|deputy|cabinet|executive/i.test(title)) {
      continue;
    }
    const key = `${name}|${title}`.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    members.push({
      name,
      title,
      department: title,
      role: classifyRole(title),
      source_url: href || baseUrl,
    });
    if (members.length >= 40) break;
  }
  return members;
}

async function fetchCabinetForState(jurisdictionId) {
  const cfg = getStateConfig(jurisdictionId);
  if (!cfg) throw new Error(`Unknown US state id: ${jurisdictionId}`);
  if (cfg.disclosure_strategy === 'pending_batch') {
    return {
      jurisdictionId,
      status: 'pending_batch',
      members: [],
      source_url: cfg.sources?.cabinet || cfg.sources?.governor || '',
      note: 'Cabinet source mapping pending batch configuration.',
    };
  }

  if (cfg.cabinet_strategy === 'source_blocked') {
    return {
      jurisdictionId,
      status: 'source_blocked',
      members: [],
      member_count: 0,
      source_url: cfg.sources?.cabinet || cfg.sources?.governor || '',
      fetched_at: new Date().toISOString(),
      note: cfg.blocked_notes?.[0] || 'Official cabinet sources blocked from automated fetch.',
    };
  }

  const urls = [cfg.sources?.cabinet, cfg.sources?.cabinet_alt, cfg.sources?.governor].filter(Boolean);
  const fetchedAt = new Date().toISOString();
  let lastHtml = '';
  let lastUrl = urls[0] || '';

  for (const url of urls) {
    try {
      const html = await fetchText(url, 800000);
      lastHtml = html;
      lastUrl = url;
      const spa =
        html.includes('__NEXT_DATA__') ||
        html.includes('drupal-settings-json') ||
        html.includes('data-bind=') ||
        html.includes('window.__NUXT__');
      const fromTables = parseCabinetFromTables(html, url);
      const fromCards = parseCabinetFromCardPatterns(html, url);
      const fromLinks = parseCabinetFromLinks(html, url);
      const members = [...fromTables, ...fromCards, ...fromLinks]
        .filter((m, i, arr) => arr.findIndex((x) => x.name === m.name && x.title === m.title) === i)
        .slice(0, 50)
        .map((m) => ({ ...m, fetched_at: fetchedAt }));

      if (members.length) {
        return {
          jurisdictionId,
          status: 'filed',
          members,
          member_count: members.length,
          source_url: url,
          fetched_at: fetchedAt,
        };
      }

      if (spa) {
        return {
          jurisdictionId,
          status: 'needs_manual_review',
          members: [],
          member_count: 0,
          source_url: url,
          fetched_at: fetchedAt,
          note:
            cfg.blocked_notes?.find((n) => /cabinet|client-render|JS/i.test(n)) ||
            'Official cabinet/executive roster page is client-rendered; member names require manual review in browser.',
        };
      }
    } catch (err) {
      lastHtml = '';
    }
  }

  const jsHeavy = lastHtml.includes('data-bind=') || lastHtml.includes('drupal-settings-json');
  return {
    jurisdictionId,
    status: jsHeavy ? 'needs_manual_review' : 'no_official_records_found',
    members: [],
    member_count: 0,
    source_url: lastUrl,
    fetched_at: fetchedAt,
    note: jsHeavy
      ? 'Executive branch page loaded but cabinet member names not exposed in static HTML.'
      : 'No parseable cabinet roster found on official governor/executive branch pages searched.',
  };
}

module.exports = {
  fetchCabinetForState,
  looksLikePersonName,
  classifyRole,
};
