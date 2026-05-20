/**
 * UK-ENG-LON — official leader transparency (Sadiq Khan / Mayor of London).
 */

const {
  trim,
  fetchText,
  absUrl,
  parsePressLinksFromHtml,
  parseHtmlTables,
  finalizePayload,
} = require('./subnational-leader-transparency-shared.cjs');

const JURISDICTION_ID = 'UK-ENG-LON';
const PRESS_URL = 'https://www.london.gov.uk/media-centre/mayors-press-releases';
const GIFTS_URL =
  'https://www.london.gov.uk/who-we-are/what-mayor-does/mayor-and-his-team/sadiq-khan/gifts-hospitality';

function parseGiftsHospitality(html, sourceUrl) {
  const tables = parseHtmlTables(html);
  const records = [];
  for (const rows of tables) {
    if (!rows.length) continue;
    const header = rows[0].map((c) => c.toLowerCase());
    if (!header.some((h) => h.includes('date')) || !header.some((h) => h.includes('donor'))) continue;
    const dateI = header.findIndex((h) => h.includes('date'));
    const detailsI = header.findIndex((h) => h.includes('detail'));
    const donorI = header.findIndex((h) => h.includes('donor') || h.includes('provider'));
    const valueI = header.findIndex((h) => h.includes('value'));
    const reasonI = header.findIndex((h) => h.includes('reason'));
    for (const row of rows.slice(1)) {
      if (!row[dateI] || !row[detailsI]) continue;
      records.push({
        date: row[dateI],
        details: row[detailsI],
        donor: donorI >= 0 ? row[donorI] : '',
        value_text: valueI >= 0 ? row[valueI] : '',
        reason: reasonI >= 0 ? row[reasonI] : '',
        source_url: sourceUrl,
      });
      if (records.length >= 25) return records;
    }
  }
  return records;
}

async function fetchRecentActivity() {
  const html = await fetchText(PRESS_URL, 800000);
  const items = parsePressLinksFromHtml(html, 'https://www.london.gov.uk', {
    hostPattern: /london\.gov\.uk\/media-centre\/mayors-press-releases\//i,
    limit: 8,
  });
  return {
    items: items.map((it) => ({
      title: it.title,
      date: it.date || '',
      url: absUrl('https://www.london.gov.uk', it.url),
      excerpt: '',
      source_url: absUrl('https://www.london.gov.uk', it.url),
    })),
    sourceUrl: PRESS_URL,
  };
}

async function fetchConflictDisclosures() {
  const html = await fetchText(GIFTS_URL, 800000);
  const records = parseGiftsHospitality(html, GIFTS_URL);
  return { records, sourceUrl: GIFTS_URL };
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

  try {
    const { records, sourceUrl } = await fetchConflictDisclosures();
    if (records.length) {
      partial.conflict_disclosures = records;
      verified.conflict_disclosures = sourceUrl;
    }
  } catch (err) {
    partial.conflict_disclosures_error = trim(err.message);
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
