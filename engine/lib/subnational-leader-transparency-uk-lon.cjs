/**
 * UK-ENG-LON — official leader transparency (Sadiq Khan / Mayor of London).
 * Sources: london.gov.uk gifts register, register of interests, expenses, press releases,
 * Electoral Commission search (regulated donee).
 */

const {
  trim,
  fetchText,
  fetchJson,
} = require('./subnational-transparency-shared.cjs');
const {
  absUrl,
  parsePressLinksFromHtml,
  parseHtmlTables,
  finalizePayload,
} = require('./subnational-leader-transparency-shared.cjs');
const {
  NOT_DISCLOSED,
  baseAssetRow,
  pushUniqueAsset,
  baseLobbyRow,
} = require('./leader-transparency-rows-shared.cjs');

const JURISDICTION_ID = 'UK-ENG-LON';
const LEADER_NAME = 'Sadiq Khan';

const SOURCES = Object.freeze({
  pressReleases: 'https://www.london.gov.uk/media-centre/mayors-press-releases',
  gifts: 'https://www.london.gov.uk/who-we-are/what-mayor-does/mayor-and-his-team/sadiq-khan/gifts-hospitality',
  registerInterests:
    'https://www.london.gov.uk/who-we-are/what-mayor-does/mayor-and-his-team/sadiq-khan/register-of-interests',
  expenses:
    'https://www.london.gov.uk/who-we-are/what-mayor-does/mayor-and-his-team/sadiq-khan/sadiq-khan-expenses',
  mayorProfile: 'https://www.london.gov.uk/who-we-are/what-mayor-does/mayor-and-his-team/sadiq-khan',
  electoralSearch:
    'https://search.electoralcommission.org.uk/Search/Donations?searchTerm=Sadiq%20Khan&register=RegulatedDonee&submitted=1',
  electoralApi:
    'https://search.electoralcommission.org.uk/api/v1/Donation/Search?searchTerm=Sadiq%20Khan&page=1&pageSize=25',
  meetings:
    'https://www.london.gov.uk/who-we-are/governance-and-spending/decisions-and-governance/meetings-and-decisions',
});

function formatGbp(amount) {
  if (!Number.isFinite(amount)) return '';
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(amount);
}

function parseMoney(text) {
  const n = Number(String(text || '').replace(/[^0-9.-]/g, ''));
  return Number.isFinite(n) ? n : null;
}

function parseGiftsFromHtml(html, sourceUrl) {
  const tables = parseHtmlTables(html);
  const gifts = [];
  const seen = new Set();
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
      const date = trim(row[dateI]);
      const details = trim(row[detailsI]);
      if (!date || !details) continue;
      const key = `${date}|${details}|${row[donorI]}`;
      if (seen.has(key)) continue;
      seen.add(key);
      gifts.push({
        date,
        description: details,
        source: donorI >= 0 ? trim(row[donorI]) : '',
        value_text: valueI >= 0 ? trim(row[valueI]) : '',
        reason: reasonI >= 0 ? trim(row[reasonI]) : '',
        source_url: sourceUrl,
      });
      if (gifts.length >= 80) return gifts;
    }
  }
  return gifts;
}

function parseRegisterInterestRows(html, sourceUrl) {
  const rows = [];
  const seen = new Set();
  const tables = parseHtmlTables(html);
  for (const table of tables) {
    if (!table.length) continue;
    const header = table[0].map((c) => c.toLowerCase());
    const natureI = header.findIndex((h) => h.includes('nature') || h.includes('interest'));
    const detailI = header.findIndex((h) => h.includes('detail') || h.includes('description'));
    if (natureI < 0 && detailI < 0) continue;
    for (const cells of table.slice(1)) {
      const name = trim(cells[natureI >= 0 ? natureI : detailI] || cells[0]);
      const detail = detailI >= 0 ? trim(cells[detailI]) : '';
      if (!name || name.length < 4) continue;
      pushUniqueAsset(rows, seen, {
        ...baseAssetRow('Register of interests', sourceUrl, null),
        asset_or_entity_name: detail ? `${name} — ${detail}` : name,
        asset_type: 'GLA register of interests',
        value_range: NOT_DISCLOSED,
        income_range: NOT_DISCLOSED,
        trust_entity_name: NOT_DISCLOSED,
        transaction_note: NOT_DISCLOSED,
      });
      if (rows.length >= 60) return rows;
    }
  }

  const dl = [...html.matchAll(/<dt[^>]*>([\s\S]*?)<\/dt>\s*<dd[^>]*>([\s\S]*?)<\/dd>/gi)];
  for (const m of dl) {
    const label = trim(m[1].replace(/<[^>]+>/g, ' '));
    const val = trim(m[2].replace(/<[^>]+>/g, ' '));
    if (!label || !val || val.length < 3) continue;
    pushUniqueAsset(rows, seen, {
      ...baseAssetRow('Register of interests', sourceUrl, null),
      asset_or_entity_name: `${label}: ${val}`,
      asset_type: 'GLA register of interests',
      value_range: NOT_DISCLOSED,
      income_range: NOT_DISCLOSED,
      trust_entity_name: NOT_DISCLOSED,
      transaction_note: NOT_DISCLOSED,
    });
    if (rows.length >= 60) break;
  }

  const headings = [...html.matchAll(/<h[23][^>]*>([\s\S]*?)<\/h[23]>([\s\S]*?)(?=<h[23]|$)/gi)];
  for (const m of headings) {
    const heading = trim(m[1].replace(/<[^>]+>/g, ' '));
    const block = m[2];
    if (!heading || !/interest|employment|gift|share|director|remunerat/i.test(heading)) continue;
    const lis = [...block.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)];
    for (const li of lis) {
      const text = trim(li[1].replace(/<[^>]+>/g, ' '));
      if (!text || text.length < 6) continue;
      pushUniqueAsset(rows, seen, {
        ...baseAssetRow(heading, sourceUrl, null),
        asset_or_entity_name: text,
        asset_type: 'GLA register of interests',
        value_range: NOT_DISCLOSED,
        income_range: NOT_DISCLOSED,
        trust_entity_name: NOT_DISCLOSED,
        transaction_note: NOT_DISCLOSED,
      });
      if (rows.length >= 60) return rows;
    }
  }
  return rows;
}

async function fetchGiftsHospitality() {
  const html = await fetchText(SOURCES.gifts, 2 * 1024 * 1024);
  const gifts = parseGiftsFromHtml(html, SOURCES.gifts);
  if (!gifts.length) return null;
  return {
    gifts_hospitality: {
      rule_summary:
        'Mayor of London gifts and hospitality register (published on london.gov.uk).',
      gifts,
      gift_count: gifts.length,
      travel_payments: [],
      travel_count: 0,
      status: 'filed',
      source_url: SOURCES.gifts,
    },
    sourceUrl: SOURCES.gifts,
  };
}

async function fetchFinancialDisclosureAndAssets() {
  const html = await fetchText(SOURCES.registerInterests, 2 * 1024 * 1024);
  const assetRows = parseRegisterInterestRows(html, SOURCES.registerInterests);
  const pdfLinks = [...html.matchAll(/href="([^"]+\.pdf[^"]*)"/gi)]
    .map((m) => absUrl('https://www.london.gov.uk', m[1]))
    .filter((u) => /interest|register|declaration/i.test(u));

  const financial_disclosure = {
    status: assetRows.length || pdfLinks.length ? 'filed' : 'no_official_records_found',
    latest_filing_year: new Date().getFullYear(),
    reporting_period: 'GLA Mayor register of interests (london.gov.uk)',
    regulatory_framework: 'GLA Code of Conduct — register of interests',
    filing_status_note:
      'Published on the Mayor’s official london.gov.uk profile. Holdings are descriptive interests, not securities tickers.',
    pdf_urls: pdfLinks.slice(0, 3),
    source_url: SOURCES.registerInterests,
  };

  const declared_assets = {
    status: assetRows.length ? 'filed' : pdfLinks.length ? 'official_bulk_register_pdf' : 'no_official_records_found',
    rows: assetRows,
    row_count: assetRows.length,
    source_url: SOURCES.registerInterests,
    disclosure_note: assetRows.length
      ? 'Rows from official GLA register of interests page.'
      : 'See linked official PDFs on the register page if structured rows are not published in HTML.',
  };

  const stock_rows = assetRows.filter((r) =>
    /share|stock|security|company|director|partner|trust|property/i.test(
      `${r.asset_or_entity_name} ${r.asset_type}`,
    ),
  );

  const stock_holdings = {
    status: stock_rows.length ? 'filed' : 'no_official_records_found',
    rows: stock_rows,
    row_count: stock_rows.length,
    disclosure_note:
      'GLA register lists roles and interests in narrative form — not individual stock tickers or purchase amounts.',
    source_url: SOURCES.registerInterests,
  };

  return { financial_disclosure, declared_assets, stock_holdings, sourceUrl: SOURCES.registerInterests };
}

function parseEcDonationRows(body) {
  const items = [];
  const list =
    body?.items ||
    body?.results ||
    body?.data ||
    (Array.isArray(body) ? body : []);
  for (const row of list) {
    const name = trim(row.donorName || row.donor || row.contributorName);
    const amount = parseMoney(row.value || row.amount || row.donationAmount);
    if (!name) continue;
    items.push({
      name,
      contributor: name,
      amount,
      amount_text: amount != null ? formatGbp(amount) : trim(row.valueText || ''),
      date: trim(row.dateReceived || row.reportedDate || row.date || '').slice(0, 10),
      reporting_period: trim(row.reportingPeriod || ''),
      source_url: SOURCES.electoralSearch,
    });
  }
  return items;
}

function parseEcDonationsHtml(html) {
  const items = [];
  const rowRe =
    /<tr[^>]*>[\s\S]*?<td[^>]*>([\s\S]*?)<\/td>[\s\S]*?<td[^>]*>([\s\S]*?)<\/td>[\s\S]*?<td[^>]*>([\s\S]*?)<\/td>/gi;
  let rm;
  while ((rm = rowRe.exec(html))) {
    const c1 = stripHtml(rm[1]);
    const c2 = stripHtml(rm[2]);
    const c3 = stripHtml(rm[3]);
    if (!/khan/i.test(`${c1} ${c2} ${c3}`)) continue;
    const donor = /khan/i.test(c1) ? c2 : c1;
    const amountText = [c1, c2, c3].find((c) => /£/.test(c)) || c3;
    if (!donor || donor.length < 3 || /^total/i.test(donor)) continue;
    items.push({
      name: donor,
      contributor: donor,
      amount: parseMoney(amountText),
      amount_text: amountText,
      date: '',
      source_url: SOURCES.electoralSearch,
    });
    if (items.length >= 40) return items;
  }

  const tables = parseHtmlTables(html);
  for (const table of tables) {
    if (!table.length) continue;
    const header = table[0].map((c) => c.toLowerCase());
    if (!header.some((h) => h.includes('donor'))) continue;
    const donorI = header.findIndex((h) => h.includes('donor'));
    const valueI = header.findIndex((h) => h.includes('value') || h.includes('amount'));
    const dateI = header.findIndex((h) => h.includes('date'));
    const doneeI = header.findIndex((h) => h.includes('donee') || h.includes('recipient'));
    for (const cells of table.slice(1)) {
      const donee = doneeI >= 0 ? trim(cells[doneeI]) : '';
      if (donee && !/khan/i.test(donee)) continue;
      const name = trim(cells[donorI]);
      const amountText = valueI >= 0 ? trim(cells[valueI]) : '';
      if (!name) continue;
      items.push({
        name,
        contributor: name,
        amount: parseMoney(amountText),
        amount_text: amountText,
        date: dateI >= 0 ? trim(cells[dateI]) : '',
        source_url: SOURCES.electoralSearch,
      });
      if (items.length >= 40) return items;
    }
  }
  return items;
}

async function fetchCampaignFinance() {
  try {
    const body = await fetchJson(SOURCES.electoralApi);
    const items = parseEcDonationRows(body);
    if (items.length) {
      const total = items.reduce((s, r) => s + (r.amount || 0), 0);
      return {
        campaign_finance: {
          summary: `${items.length} regulated-donee donation record(s) for ${LEADER_NAME} (Electoral Commission official search API).`,
          items: items.slice(0, 12),
          row_count: items.length,
          total_amount_text: total > 0 ? formatGbp(total) : '',
        },
        sourceUrl: SOURCES.electoralSearch,
      };
    }
  } catch {
    // try HTML
  }

  try {
    const html = await fetchText(SOURCES.electoralSearch, 800000);
    const items = parseEcDonationsHtml(html);
    if (items.length) {
      const total = items.reduce((s, r) => s + (r.amount || 0), 0);
      return {
        campaign_finance: {
          summary: `${items.length} donation row(s) for ${LEADER_NAME} (Electoral Commission search).`,
          items: items.slice(0, 12),
          row_count: items.length,
          total_amount_text: total > 0 ? formatGbp(total) : '',
        },
        sourceUrl: SOURCES.electoralSearch,
      };
    }
  } catch {
    // unavailable
  }
  return null;
}

function parseMeetingRows(html, sourceUrl) {
  const rows = [];
  const tables = parseHtmlTables(html);
  for (const table of tables) {
    if (!table.length) continue;
    const header = table[0].map((c) => c.toLowerCase());
    if (!header.some((h) => h.includes('date')) && !header.some((h) => h.includes('meeting'))) continue;
    const dateI = header.findIndex((h) => h.includes('date'));
    const titleI = header.findIndex((h) => h.includes('title') || h.includes('meeting') || h.includes('subject'));
    const orgI = header.findIndex((h) => h.includes('organisation') || h.includes('organization'));
    for (const cells of table.slice(1)) {
      const title = titleI >= 0 ? trim(cells[titleI]) : trim(cells[0]);
      if (!title || title.length < 6) continue;
      if (!/mayor|khan|glA/i.test(`${title} ${cells.join(' ')}`)) continue;
      rows.push({
        ...baseLobbyRow(sourceUrl),
        lobbyist_or_firm: orgI >= 0 ? trim(cells[orgI]) : NOT_DISCLOSED,
        client_employer: NOT_DISCLOSED,
        target_office_or_person: 'Mayor of London',
        issue_area: title,
        reporting_period: dateI >= 0 ? trim(cells[dateI]) : NOT_DISCLOSED,
        amount_paid: NOT_DISCLOSED,
      });
      if (rows.length >= 30) return rows;
    }
  }
  return rows;
}

async function fetchLobbyingRecords() {
  try {
    const html = await fetchText(SOURCES.meetings, 800000);
    const rows = parseMeetingRows(html, SOURCES.meetings);
    if (rows.length) {
      return {
        lobbying_records: {
          status: 'filed',
          rows,
          row_count: rows.length,
          note: `${rows.length} official GLA meetings/decisions row(s) referencing the Mayor.`,
          portal: SOURCES.meetings,
          source_url: SOURCES.meetings,
        },
        sourceUrl: SOURCES.meetings,
      };
    }
  } catch {
    // fall through
  }

  return {
    lobbying_records: {
      status: 'no_official_target_specific_lobbying_records_found',
      rows: [],
      row_count: 0,
      note:
        'No separate UK lobbying register targets the Mayor of London; GLA meetings diary did not return machine-readable Mayor-target rows in this sync.',
      portal: SOURCES.meetings,
      source_url: SOURCES.meetings,
    },
    sourceUrl: SOURCES.meetings,
  };
}

async function fetchSalaryFromExpenses() {
  const tryParseSalary = (html, sourceUrl, label) => {
    const patterns = [
      /Mayor(?:&#039;|')?s?\s+salary[^£]{0,60}£([\d,]+(?:\.\d{2})?)/i,
      /salary[^£]{0,60}£([\d,]+(?:\.\d{2})?)/i,
      /£([\d,]+(?:\.\d{2})?)[^<]{0,40}salary/i,
    ];
    for (const pat of patterns) {
      const m = html.match(pat);
      if (!m) continue;
      const amount = parseMoney(m[1]);
      if (Number.isFinite(amount) && amount > 50000 && amount < 500000) {
        return {
          salary: {
            amount,
            amount_text: formatGbp(amount),
            period: label,
            description: 'Published on london.gov.uk (Mayor transparency / expenses).',
          },
          sourceUrl,
        };
      }
    }
    return null;
  };

  try {
    const html = await fetchText(SOURCES.expenses, 1500000);
    const hit = tryParseSalary(html, SOURCES.expenses, 'Mayor expenses transparency');
    if (hit) return hit;
  } catch {
    // optional section
  }

  try {
    const html = await fetchText(SOURCES.mayorProfile, 800000);
    const hit = tryParseSalary(html, SOURCES.mayorProfile, 'Mayor profile (london.gov.uk)');
    if (hit) return hit;
  } catch {
    // optional section
  }
  return null;
}

async function fetchRecentActivity() {
  const html = await fetchText(SOURCES.pressReleases, 800000);
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
    sourceUrl: SOURCES.pressReleases,
  };
}

async function buildLeaderTransparency() {
  const verified = {};
  const partial = {};

  try {
    const salaryResult = await fetchSalaryFromExpenses();
    if (salaryResult?.salary) {
      partial.salary = salaryResult.salary;
      verified.salary = salaryResult.sourceUrl;
    }
  } catch (err) {
    partial.salary_error = trim(err.message);
  }

  try {
    const gifts = await fetchGiftsHospitality();
    if (gifts?.gifts_hospitality) {
      partial.gifts_hospitality = gifts.gifts_hospitality;
      partial.conflict_disclosures = gifts.gifts_hospitality.gifts;
      verified.gifts_hospitality = gifts.sourceUrl;
      verified.conflict_disclosures = gifts.sourceUrl;
    }
  } catch (err) {
    partial.gifts_hospitality_error = trim(err.message);
  }

  try {
    const disc = await fetchFinancialDisclosureAndAssets();
    if (disc?.financial_disclosure) {
      partial.financial_disclosure = disc.financial_disclosure;
      partial.declared_assets = disc.declared_assets;
      partial.stock_holdings = disc.stock_holdings;
      verified.financial_disclosure = disc.sourceUrl;
      verified.declared_assets = disc.declared_assets.source_url;
      verified.stock_holdings = disc.stock_holdings.source_url;
    }
  } catch (err) {
    partial.financial_disclosure_error = trim(err.message);
  }

  try {
    const finance = await fetchCampaignFinance();
    if (finance?.campaign_finance) {
      partial.campaign_finance = finance.campaign_finance;
      verified.campaign_finance = finance.sourceUrl;
    }
  } catch (err) {
    partial.campaign_finance_error = trim(err.message);
  }

  try {
    const lobby = await fetchLobbyingRecords();
    if (lobby?.lobbying_records) {
      partial.lobbying_records = lobby.lobbying_records;
      verified.lobbying_records = lobby.sourceUrl;
    }
  } catch (err) {
    partial.lobbying_records_error = trim(err.message);
  }

  try {
    const { items, sourceUrl } = await fetchRecentActivity();
    if (items.length) {
      partial.recent_official_activity = items;
      verified.recent_official_activity = sourceUrl;
    }
  } catch (err) {
    partial.recent_official_activity_error = trim(err.message);
  }

  partial.data_completeness_note =
    'Official London/UK sources only: london.gov.uk gifts and register of interests, Mayor expenses page, Electoral Commission donations search, GLA press releases. No Wikipedia, news, or estimated net worth.';

  return {
    jurisdictionId: JURISDICTION_ID,
    payload: finalizePayload(JURISDICTION_ID, partial, verified),
    verified,
  };
}

module.exports = {
  JURISDICTION_ID,
  buildLeaderTransparency,
  SOURCES,
};
