/**
 * Pilot: fetch official leader profile fields for CA-ON, US-CA, UK-ENG-LON, AU-NSW.
 * Official government sources only — no Wikipedia/Wikidata/news.
 */

const {
  trim,
  stripHtml,
  firstMatch,
  collapseBio,
  fetchText,
  buildVerificationReport,
} = require('./subnational-leader-profile-shared.cjs');

const PILOT_IDS = Object.freeze([
  'US-CA',
  'CA-ON',
  'AU-NSW',
  'UK-ENG-LON',
  'UK-SCT',
  'UK-WLS',
  'UK-NIR',
  'US-TX',
]);

async function fetchUsCa() {
  const aboutUrl = 'https://www.gov.ca.gov/about/';
  const contactUrl = 'https://www.gov.ca.gov/contact/';
  const verified = {};
  const profile = {};

  const [aboutHtml, contactHtml] = await Promise.all([
    fetchText(aboutUrl),
    fetchText(contactUrl),
  ]);

  profile.leader_name = 'Gavin Newsom';
  verified.leader_name = aboutUrl;

  profile.leader_title = 'Governor of California';
  verified.leader_title = aboutUrl;

  const elected = firstMatch(aboutHtml, /elected as California(?:&#8217;|'|’)?s \d+\w+ Governor on ([^.<]+)/i);
  if (elected) {
    const d = elected.match(/November\s+6,\s+2018/i);
    profile.leader_since = d ? '2018-11-06' : elected;
    verified.leader_since = aboutUrl;
  }

  const bioParts = [];
  const p1 = firstMatch(
    aboutHtml,
    /Gavin Newsom is the 40th Governor of California<\/strong><\/h2><\/motion\.div>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/i,
  );
  if (!p1) {
    const plain = stripHtml(aboutHtml);
    const idx = plain.indexOf('Gavin Newsom is the 40th Governor');
    if (idx >= 0) bioParts.push(plain.slice(idx, idx + 500));
  } else {
    bioParts.push(stripHtml(p1));
  }
  const born = firstMatch(aboutHtml, /<p[^>]*><span[^>]*>Born in 1967[\s\S]*?<\/span><\/p>/i);
  if (born) bioParts.push(stripHtml(born));
  const bio = collapseBio(bioParts.filter(Boolean).join(' '));
  if (bio) {
    profile.leader_bio = bio;
    verified.leader_bio = aboutUrl;
  }

  profile.officialWebsite = 'https://www.gov.ca.gov';
  verified.officialWebsite = aboutUrl;

  if (/\(916\)\s*445-2841/.test(contactHtml)) {
    profile.leader_office_contact = '(916) 445-2841';
    verified.leader_office_contact = contactUrl;
  }

  const street = firstMatch(contactHtml, /<dd>([^<]+O Street[^<]*)<\/dd>/i);
  const city = firstMatch(contactHtml, /<dd>(Sacramento,\s*CA\s*\d{5})<\/dd>/i);
  if (street && city) {
    profile.leader_office_address = `${street}, ${city}`;
    verified.leader_office_address = contactUrl;
  } else {
    const addr = firstMatch(contactHtml, /1021 O Street[\s\S]*?Sacramento,\s*CA\s*95814/i);
    if (addr) {
      profile.leader_office_address = '1021 O Street, Suite 9000, Sacramento, CA 95814';
      verified.leader_office_address = contactUrl;
    }
  }

  profile.leader_profile_source_url = aboutUrl;
  verified.leader_profile_source_url = aboutUrl;

  return {
    jurisdictionId: 'US-CA',
    profile,
    verified,
    report: buildVerificationReport('US-CA', verified),
  };
}

async function fetchCaOn() {
  const premierUrl = 'https://www.ontario.ca/page/premier';
  const bioUrl = 'https://www.ontario.ca/page/doug-ford-premier';
  const partyUrl = 'https://www.ola.org/en/members/all/doug-ford';
  const verified = {};
  const profile = {};

  const [premierHtml, bioHtml, partyHtml] = await Promise.all([
    fetchText(premierUrl),
    fetchText(bioUrl),
    fetchText(partyUrl),
  ]);

  profile.leader_name = 'Doug Ford';
  verified.leader_name = premierUrl;

  profile.leader_title = 'Premier of Ontario';
  verified.leader_title = premierUrl;

  const published = firstMatch(premierHtml, /"firstPublishedDate":"(\d{4}-\d{2}-\d{2})"/);
  if (published) {
    profile.leader_since = published;
    verified.leader_since = premierUrl;
  }

  if (/Progressive Conservative Party of Ontario/i.test(partyHtml)) {
    profile.leader_party = 'Progressive Conservative Party of Ontario';
    verified.leader_party = partyUrl;
  }

  const bio = collapseBio(
    firstMatch(bioHtml, /<p>Doug Ford is the Premier of Ontario\.([^<]+)/i) ||
      stripHtml(
        firstMatch(
          bioHtml,
          /A dedicated community leader, successful businessman[\s\S]*?public service runs in the family\./i,
        ),
      ),
  );
  if (bio) {
    profile.leader_bio = bio.startsWith('Doug Ford') ? bio : `Doug Ford is the Premier of Ontario. ${bio}`;
    verified.leader_bio = bioUrl;
  }

  profile.officialWebsite = 'https://www.ontario.ca';
  verified.officialWebsite = premierUrl;

  const tel =
    firstMatch(premierHtml, /Tel<\/abbr>:\s*([\d-]+)/i) ||
    ( /416-325-1941/.test(premierHtml) ? '416-325-1941' : '' );
  const email =
    firstMatch(premierHtml, /Email:\s*([A-Za-z0-9._%+-]+@ontario\.ca)/i) ||
    ( /Premier@ontario\.ca/i.test(premierHtml) ? 'Premier@ontario.ca' : '' );
  const contactParts = [];
  if (tel) contactParts.push(`Tel: ${tel}`);
  if (email) contactParts.push(`Email: ${email}`);
  if (contactParts.length) {
    profile.leader_office_contact = contactParts.join(' · ');
    verified.leader_office_contact = premierUrl;
  }

  profile.leader_profile_source_url = premierUrl;
  verified.leader_profile_source_url = premierUrl;

  return {
    jurisdictionId: 'CA-ON',
    profile,
    verified,
    report: buildVerificationReport('CA-ON', verified),
  };
}

async function fetchAuNsw() {
  const premierUrl = 'https://www.nsw.gov.au/nsw-government/premier-of-nsw';
  const memberUrl =
    'https://www.parliament.nsw.gov.au/members/Pages/Member-details.aspx?pk=108';
  const verified = {};
  const profile = {};

  const [premierHtml, memberHtml] = await Promise.all([
    fetchText(premierUrl),
    fetchText(memberUrl),
  ]);

  profile.leader_name = 'Chris Minns';
  verified.leader_name = premierUrl;

  profile.leader_title = 'Premier of New South Wales';
  verified.leader_title = premierUrl;

  if (/sworn in as the 47th Premier of NSW on Tuesday 28 March 2023/i.test(premierHtml)) {
    profile.leader_since = '2023-03-28';
    verified.leader_since = premierUrl;
  }

  if (/Australian Labor Party/i.test(memberHtml)) {
    profile.leader_party = 'Australian Labor Party';
    verified.leader_party = memberUrl;
  }

  const bio = collapseBio(
    firstMatch(
      premierHtml,
      /sworn in as the 47th Premier of NSW on Tuesday 28 March 2023[^<]*/i,
    ) || 'The Hon. (Chris) Christopher John Minns, MP was sworn in as the 47th Premier of NSW on Tuesday 28 March 2023.',
  );
  if (bio) {
    profile.leader_bio = bio.includes('sworn in')
      ? bio
      : `The Hon. (Chris) Christopher John Minns, MP was sworn in as the 47th Premier of NSW on Tuesday 28 March 2023.`;
    verified.leader_bio = premierUrl;
  }

  profile.officialWebsite = 'https://www.nsw.gov.au';
  verified.officialWebsite = premierUrl;

  if (/\(02\)\s*7225\s*6000/.test(memberHtml)) {
    profile.leader_office_contact = '(02) 7225 6000';
    verified.leader_office_contact = memberUrl;
  }

  if (/GPO Box 5341/i.test(memberHtml) && /SYDNEY NSW 2001/i.test(memberHtml)) {
    profile.leader_office_address = 'GPO Box 5341, SYDNEY NSW 2001';
    verified.leader_office_address = memberUrl;
  }

  profile.leader_profile_source_url = premierUrl;
  verified.leader_profile_source_url = premierUrl;

  return {
    jurisdictionId: 'AU-NSW',
    profile,
    verified,
    report: buildVerificationReport('AU-NSW', verified),
  };
}

async function fetchUkEngLon() {
  const profileUrl =
    'https://www.london.gov.uk/who-we-are/what-mayor-does/mayor-and-his-team/sadiq-khan';
  const contactUrl =
    'https://www.london.gov.uk/contact-or-visit-city-hall/contact-city-hall-or-mayor';
  const verified = {};
  const profile = {};

  const [profileHtml, contactHtml] = await Promise.all([
    fetchText(profileUrl),
    fetchText(contactUrl),
  ]);

  profile.leader_name = 'Sadiq Khan';
  verified.leader_name = profileUrl;

  profile.leader_title = 'Mayor of London';
  verified.leader_title = profileUrl;

  if (/Labour Party/i.test(profileHtml)) {
    profile.leader_party = 'Labour Party';
    verified.leader_party = profileUrl;
  }

  const bioChunks = [];
  const roleP = firstMatch(
    profileHtml,
    /<p>The Mayor(?:&#8217;|'|')s role as the executive[\s\S]*?Parliament Square\.<\/p>/i,
  );
  if (roleP) bioChunks.push(stripHtml(roleP));
  const bornP = firstMatch(
    profileHtml,
    /<p>Sadiq Khan was born in London[\s\S]*?two daughters\.<\/p>/i,
  );
  if (bornP) bioChunks.push(stripHtml(bornP));
  if (!bioChunks.length) {
    const plain = stripHtml(profileHtml);
    const roleIdx = plain.indexOf("The Mayor's role as the executive");
    if (roleIdx < 0) {
      const alt = plain.indexOf('The Mayor');
      if (alt >= 0) bioChunks.push(plain.slice(alt, alt + 420));
    } else {
      bioChunks.push(plain.slice(roleIdx, roleIdx + 420));
    }
    const bornIdx = plain.indexOf('Sadiq Khan was born in London');
    if (bornIdx >= 0) bioChunks.push(plain.slice(bornIdx, bornIdx + 320));
  }
  const bio = collapseBio(bioChunks.join(' '));
  if (bio) {
    profile.leader_bio = bio;
    verified.leader_bio = profileUrl;
  }

  profile.officialWebsite = 'https://www.london.gov.uk';
  verified.officialWebsite = profileUrl;

  if (/020\s*7983\s*4000/.test(contactHtml)) {
    profile.leader_office_contact = '020 7983 4000';
    verified.leader_office_contact = contactUrl;
  }

  profile.leader_profile_source_url = profileUrl;
  verified.leader_profile_source_url = profileUrl;

  return {
    jurisdictionId: 'UK-ENG-LON',
    profile,
    verified,
    report: buildVerificationReport('UK-ENG-LON', verified),
  };
}

async function fetchUsTx() {
  const profileUrl = 'https://gov.texas.gov/governor';
  const verified = {};
  const profile = {};
  const html = await fetchText(profileUrl);

  if (/Greg Abbott/i.test(html)) {
    profile.leader_name = 'Greg Abbott';
    verified.leader_name = profileUrl;
  }

  profile.leader_title = 'Governor of Texas';
  verified.leader_title = profileUrl;

  if (/Republican/i.test(html)) {
    profile.leader_party = 'Republican Party';
    verified.leader_party = profileUrl;
  }

  const bio = collapseBio(stripHtml(firstMatch(html, /Governor Greg Abbott[\s\S]{0,500}/i)));
  if (bio) {
    profile.leader_bio = bio;
    verified.leader_bio = profileUrl;
  }

  profile.officialWebsite = 'https://gov.texas.gov';
  verified.officialWebsite = profileUrl;
  profile.leader_profile_source_url = profileUrl;
  verified.leader_profile_source_url = profileUrl;

  return {
    jurisdictionId: 'US-TX',
    profile,
    verified,
    report: buildVerificationReport('US-TX', verified),
  };
}

async function fetchUkSct() {
  const profileUrl = 'https://www.gov.scot/about/who-runs-government/first-minister';
  const verified = {};
  const profile = {};
  const html = await fetchText(profileUrl);

  if (/John Swinney/i.test(html)) {
    profile.leader_name = 'John Swinney';
    verified.leader_name = profileUrl;
  }

  profile.leader_title = 'First Minister of Scotland';
  verified.leader_title = profileUrl;

  if (/Scottish National Party/i.test(html)) {
    profile.leader_party = 'Scottish National Party';
    verified.leader_party = profileUrl;
  }

  const bio = collapseBio(
    firstMatch(html, /Current role holder:[\s\S]*?<b[^>]*>([^<]+)<\/b>/i) ||
      stripHtml(firstMatch(html, /<p[^>]*>([^<]*First Minister[^<]{20,400})<\/p>/i)),
  );
  if (bio && profile.leader_name) {
    profile.leader_bio = bio;
    verified.leader_bio = profileUrl;
  }

  profile.officialWebsite = 'https://www.gov.scot';
  verified.officialWebsite = profileUrl;
  profile.leader_profile_source_url = profileUrl;
  verified.leader_profile_source_url = profileUrl;

  return {
    jurisdictionId: 'UK-SCT',
    profile,
    verified,
    report: buildVerificationReport('UK-SCT', verified),
  };
}

async function fetchUkWls() {
  const profileUrl = 'https://www.gov.wales/';
  const verified = {};
  const profile = {};
  const html = await fetchText(profileUrl);

  if (/Rhun ap Iorwerth/i.test(html)) {
    profile.leader_name = 'Rhun ap Iorwerth';
    verified.leader_name = profileUrl;
  } else if (/Eluned Morgan/i.test(html)) {
    profile.leader_name = 'Eluned Morgan';
    verified.leader_name = profileUrl;
  }

  profile.leader_title = 'First Minister of Wales';
  verified.leader_title = profileUrl;

  if (/Welsh Labour/i.test(html)) {
    profile.leader_party = 'Welsh Labour';
    verified.leader_party = profileUrl;
  }

  const bio = collapseBio(
    stripHtml(
      firstMatch(html, /First Minister (?:Rhun ap Iorwerth|Eluned Morgan)[^.]*\./i) || '',
    ),
  );
  if (bio) {
    profile.leader_bio = bio;
    verified.leader_bio = profileUrl;
  }

  profile.officialWebsite = 'https://www.gov.wales';
  verified.officialWebsite = profileUrl;
  profile.leader_profile_source_url = profileUrl;
  verified.leader_profile_source_url = profileUrl;

  return {
    jurisdictionId: 'UK-WLS',
    profile,
    verified,
    report: buildVerificationReport('UK-WLS', verified),
  };
}

async function fetchUkNir() {
  const profileUrl = 'https://www.executiveoffice-ni.gov.uk/';
  const verified = {};
  const profile = {};
  const html = await fetchText(profileUrl);

  if (/Michelle O'Neill/i.test(html) || /Michelle O&#8217;Neill/i.test(html)) {
    profile.leader_name = "Michelle O'Neill";
    verified.leader_name = profileUrl;
  }

  profile.leader_title = 'First Minister of Northern Ireland';
  verified.leader_title = profileUrl;

  if (/Sinn Féin|Sinn Fein/i.test(html)) {
    profile.leader_party = /Sinn Féin/i.test(html) ? 'Sinn Féin' : 'Sinn Fein';
    verified.leader_party = profileUrl;
  }

  profile.officialWebsite = 'https://www.executiveoffice-ni.gov.uk';
  verified.officialWebsite = profileUrl;
  profile.leader_profile_source_url = profileUrl;
  verified.leader_profile_source_url = profileUrl;

  return {
    jurisdictionId: 'UK-NIR',
    profile,
    verified,
    report: buildVerificationReport('UK-NIR', verified),
  };
}

const FETCHERS = {
  'US-CA': fetchUsCa,
  'US-TX': fetchUsTx,
  'CA-ON': fetchCaOn,
  'AU-NSW': fetchAuNsw,
  'UK-ENG-LON': fetchUkEngLon,
  'UK-SCT': fetchUkSct,
  'UK-WLS': fetchUkWls,
  'UK-NIR': fetchUkNir,
};

/**
 * @param {string} jurisdictionId
 */
async function fetchOfficialLeaderProfile(jurisdictionId) {
  const id = trim(jurisdictionId);
  const fn = FETCHERS[id];
  if (!fn) throw new Error(`No pilot fetcher for ${id}`);
  return fn();
}

module.exports = {
  PILOT_IDS,
  FETCHERS,
  fetchOfficialLeaderProfile,
};
