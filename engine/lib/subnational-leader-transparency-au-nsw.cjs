/**
 * AU-NSW — official leader transparency (Chris Minns / Premier of NSW).
 * Sources: NSW Parliament remuneration PDF, Register of Disclosures (tabled papers),
 * NSW Electoral Commission efadisclosures, NSW government media releases, NSW Lobbying portal.
 */

const pdf = require('pdf-parse');
const {
  trim,
  fetchText,
  fetchBuffer,
  fetchJson,
} = require('./subnational-transparency-shared.cjs');
const {
  absUrl,
  stripHtml,
  parseHtmlTables,
  finalizePayload,
} = require('./subnational-leader-transparency-shared.cjs');
const {
  NOT_DISCLOSED,
  baseAssetRow,
  pushUniqueAsset,
  baseLobbyRow,
} = require('./leader-transparency-rows-shared.cjs');

const JURISDICTION_ID = 'AU-NSW';
const LEADER_NAME = 'Chris Minns';

const SOURCES = Object.freeze({
  salariesPage:
    'https://www.parliament.nsw.gov.au/members/Pages/salaries-and-allowances-for-members-of-the-legislative-assembly.aspx',
  salaryPdfJuly2025:
    'https://www.parliament.nsw.gov.au/members/Documents/LA%20Members%20Salaries%20%26%20Allowances%20July%202025.pdf',
  registerTabledPaper:
    'https://www.parliament.nsw.gov.au/la/papers/Pages/tabled-paper-details.aspx?pk=191919',
  registerVolume1:
    'https://www.parliament.nsw.gov.au/tp/files/191919/2024-25_Register%20of%20Disclosures%20by%20Members%20of%20the%20Legislative%20Assembly%20_Volume%201.pdf',
  registerVolume2:
    'https://www.parliament.nsw.gov.au/tp/files/191919/2024-25_Register%20of%20Disclosures%20by%20Members%20of%20the%20Legislative%20Assembly%20_Volume%202.pdf',
  mediaReleases: 'https://www.nsw.gov.au/media-releases',
  premierPage: 'https://www.nsw.gov.au/nsw-government/premier-of-nsw',
  efadisclosures: 'https://efadisclosures.elections.nsw.gov.au/',
  lobbyingPortal: 'https://www.lobbying.nsw.gov.au/',
});

function formatAud(amount, fractionDigits = 0) {
  if (!Number.isFinite(amount)) return '';
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amount);
}

function parseMoney(text) {
  const n = Number(String(text || '').replace(/[^0-9.-]/g, ''));
  return Number.isFinite(n) ? n : null;
}

function parsePremierSalaryFromPdfText(text) {
  const block = String(text || '');
  const m = block.match(
    /Premier\s*([\d,]+)\s+([\d,]+)\s+([\d,]+)\s*["']?\s*([\d,]+)/i,
  );
  if (!m) return null;
  const base = parseMoney(m[1]);
  const office = parseMoney(m[2]);
  const expense = parseMoney(m[3]);
  const total = parseMoney(m[4]);
  if (!Number.isFinite(total)) return null;
  const amountText = `${formatAud(total)} (base ${formatAud(base)}, office ${formatAud(office)}, expense ${formatAud(expense)})`;
  return {
    amount: total,
    amount_text: amountText,
    period: 'From 1 July 2025',
    description:
      'Premier — NSW Legislative Assembly remuneration (Parliamentary Remuneration Tribunal determination, official salaries PDF).',
  };
}

async function fetchSalary() {
  const buf = await fetchBuffer(SOURCES.salaryPdfJuly2025, 3 * 1024 * 1024);
  const data = await pdf(buf);
  const salary = parsePremierSalaryFromPdfText(data.text);
  if (!salary) return null;
  return { salary, sourceUrl: SOURCES.salaryPdfJuly2025 };
}

function parseNswMediaReleases(html, { premierFeed = false } = {}) {
  const base = 'https://www.nsw.gov.au';
  const out = [];
  const seen = new Set();
  const re = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(html))) {
    const href = absUrl(base, m[1]);
    const title = stripHtml(m[2]);
    if (!title || title.length < 15) continue;
    if (!/\/ministerial-releases\//i.test(href) && !/media-release/i.test(href)) continue;
    if (!premierFeed && !/minns|premier/i.test(`${title} ${href}`)) continue;
    const key = href.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    const dateM = href.match(/(\d{4})-(\d{2})-(\d{2})/);
    out.push({
      title,
      date: dateM ? `${dateM[1]}-${dateM[2]}-${dateM[3]}` : '',
      url: href,
      excerpt: '',
      source_url: href,
    });
    if (out.length >= 8) break;
  }
  return out;
}

async function fetchRecentActivity() {
  const premierFeedUrl =
    'https://www.nsw.gov.au/media-releases?ministers=The%20Premier';
  let items = [];
  let sourceUrl = SOURCES.mediaReleases;
  try {
    const premierHtml = await fetchText(premierFeedUrl, 800000);
    items = parseNswMediaReleases(premierHtml, { premierFeed: true });
    if (items.length) sourceUrl = premierFeedUrl;
  } catch {
    // fall through
  }
  if (!items.length) {
    const html = await fetchText(SOURCES.mediaReleases, 800000);
    items = parseNswMediaReleases(html);
  }
  if (!items.length) {
    const premierHtml = await fetchText(SOURCES.premierPage, 600000);
    items = parseNswMediaReleases(premierHtml);
    if (items.length) sourceUrl = SOURCES.premierPage;
  }
  return { items, sourceUrl };
}

function parseRegisterDisclosureRows(text, sourceUrl) {
  const rows = [];
  const seen = new Set();
  const chunk = text.slice(
    Math.max(0, text.search(/MINNS[\s,]*CHRIS|Chris\s+Minns/i)),
  );
  if (!chunk || chunk.length < 80) return rows;

  const lines = chunk.split(/\r?\n/).map((l) => trim(l)).filter(Boolean);
  let currentSchedule = 'Register of Disclosures';
  for (let i = 0; i < lines.length && rows.length < 80; i += 1) {
    const line = lines[i];
    if (/^Part\s+\d|^Schedule|^Category/i.test(line)) {
      currentSchedule = line.slice(0, 120);
      continue;
    }
    if (/^MINNS|^Member ends|^Page \d+ of/i.test(line)) break;
    if (line.length < 8 || line.length > 220) continue;
    if (/^NSW Parliament|^Register of Disclosures/i.test(line)) continue;
    const valueM = line.match(/(\$[\d,]+(?:\s*[-–]\s*\$[\d,]+)?|Not applicable|Nil|None)/i);
    pushUniqueAsset(rows, seen, {
      ...baseAssetRow(currentSchedule, sourceUrl, null),
      asset_or_entity_name: valueM ? line.replace(valueM[0], '').trim() || line : line,
      asset_type: 'Register of Disclosures (NSW Parliament)',
      value_range: valueM ? valueM[1] : NOT_DISCLOSED,
      income_range: NOT_DISCLOSED,
      trust_entity_name: NOT_DISCLOSED,
      transaction_note: NOT_DISCLOSED,
    });
  }
  return rows;
}

async function fetchFinancialDisclosureAndAssets() {
  const html = await fetchText(SOURCES.registerTabledPaper, 400000);
  const vol1 = html.match(
    /href="([^"]*2024-25_Register%20of%20Disclosures[^"]*Volume%201\.pdf)"/i,
  );
  const vol2 = html.match(
    /href="([^"]*2024-25_Register%20of%20Disclosures[^"]*Volume%202\.pdf)"/i,
  );
  const vol1Url = vol1 ? absUrl('https://www.parliament.nsw.gov.au', vol1[1]) : SOURCES.registerVolume1;
  const vol2Url = vol2 ? absUrl('https://www.parliament.nsw.gov.au', vol2[1]) : SOURCES.registerVolume2;

  let assetRows = [];
  try {
    const buf = await fetchBuffer(vol1Url, 35 * 1024 * 1024);
    const data = await pdf(buf);
    assetRows = parseRegisterDisclosureRows(data.text, vol1Url);
  } catch {
    assetRows = [];
  }

  const financial_disclosure = {
    status: 'filed',
    latest_filing_year: 2025,
    reporting_period: 'Register as at 30 June 2025 (tabled 14 October 2025)',
    regulatory_framework:
      'Constitution (Disclosures by Members) Regulation 1983 — Register of Disclosures by Members of the Legislative Assembly',
    filing_status_note:
      'Official register published as tabled papers (Volumes 1 and 2). Individual holdings are listed in the PDF register, not as stock tickers or purchase records.',
    filings: [
      { volume: 1, source_url: vol1Url, filed_date: '2025-10-14' },
      { volume: 2, source_url: vol2Url, filed_date: '2025-10-14' },
    ],
    source_url: SOURCES.registerTabledPaper,
  };

  const declared_assets = {
    status: assetRows.length ? 'filed' : 'official_bulk_register_pdf',
    rows: assetRows,
    row_count: assetRows.length,
    source_url: vol1Url,
    disclosure_note: assetRows.length
      ? 'Rows extracted from official Register of Disclosures Volume 1 (NSW Parliament PDF).'
      : 'Official register is published only as large PDF tabled papers; open Volume 1 on parliament.nsw.gov.au for the full member schedule.',
  };

  const stock_holdings = {
    status: assetRows.length ? 'filed' : 'no_official_records_found',
    rows: assetRows.filter((r) =>
      /share|stock|security|trust|company|corporation|partnership|investment|property/i.test(
        `${r.asset_or_entity_name} ${r.asset_type}`,
      ),
    ),
    row_count: 0,
    disclosure_note:
      'NSW register lists interests and holdings in narrative form — not individual securities tickers or purchase dates unless stated on the form.',
    source_url: vol1Url,
  };
  stock_holdings.row_count = stock_holdings.rows.length;

  return { financial_disclosure, declared_assets, stock_holdings, sourceUrl: SOURCES.registerTabledPaper };
}

function parseEfadisclosureRows(html) {
  const rows = [];
  const tables = parseHtmlTables(html);
  for (const table of tables) {
    if (!table.length) continue;
    const header = table[0].map((c) => c.toLowerCase());
    if (!header.some((h) => h.includes('donor') || h.includes('contributor'))) continue;
    const donorI = header.findIndex((h) => h.includes('donor') || h.includes('contributor'));
    const amountI = header.findIndex((h) => h.includes('amount'));
    const dateI = header.findIndex((h) => h.includes('date'));
    const recipientI = header.findIndex((h) => h.includes('recipient') || h.includes('entity'));
    for (const cells of table.slice(1)) {
      const recipient = recipientI >= 0 ? trim(cells[recipientI]) : '';
      if (recipient && !/minns/i.test(recipient)) continue;
      const donor = donorI >= 0 ? trim(cells[donorI]) : '';
      const amount = amountI >= 0 ? trim(cells[amountI]) : '';
      if (!donor && !amount) continue;
      rows.push({
        name: donor,
        contributor: donor,
        amount_text: amount,
        amount: parseMoney(amount),
        date: dateI >= 0 ? trim(cells[dateI]) : '',
        source_url: SOURCES.efadisclosures,
      });
      if (rows.length >= 50) return rows;
    }
  }
  return rows;
}

async function fetchCampaignFinance() {
  const searchUrl =
    'https://efadisclosures.elections.nsw.gov.au/Search/Entity?searchText=Minns&searchType=Contains';
  try {
    const html = await fetchText(searchUrl, 800000);
    const rows = parseEfadisclosureRows(html);
    if (rows.length) {
      const total = rows.reduce((s, r) => s + (Number.isFinite(r.amount) ? r.amount : 0), 0);
      return {
        campaign_finance: {
          summary: `${rows.length} disclosed contribution row(s) for entities matching “Minns” (NSW Electoral Commission efadisclosures).`,
          items: rows.slice(0, 12),
          total_amount_text: total > 0 ? formatAud(total) : '',
          row_count: rows.length,
        },
        sourceUrl: SOURCES.efadisclosures,
      };
    }
  } catch {
    // fall through
  }

  try {
    const apiUrl =
      'https://efadisclosures.elections.nsw.gov.au/api/public/disclosures?searchTerm=Minns&pageSize=25&pageIndex=0';
    const body = await fetchJson(apiUrl);
    const list = body?.data || body?.results || body?.items || [];
    const items = [];
    for (const row of list) {
      const name = trim(row.donorName || row.contributorName || row.name);
      const amount = parseMoney(row.amount || row.contributionAmount);
      if (!name) continue;
      items.push({
        name,
        contributor: name,
        amount,
        amount_text: amount != null ? formatAud(amount) : trim(row.amountText || ''),
        date: trim(row.date || row.receivedDate || '').slice(0, 10),
        source_url: SOURCES.efadisclosures,
      });
    }
    if (items.length) {
      const total = items.reduce((s, r) => s + (r.amount || 0), 0);
      return {
        campaign_finance: {
          summary: `${items.length} disclosure record(s) from NSW Electoral Commission efadisclosures API (Minns search).`,
          items: items.slice(0, 12),
          total_amount_text: total > 0 ? formatAud(total) : '',
          row_count: items.length,
        },
        sourceUrl: SOURCES.efadisclosures,
      };
    }
  } catch {
    // unavailable
  }

  return null;
}

async function fetchLobbyingRecords() {
  try {
    const html = await fetchText(SOURCES.lobbyingPortal, 600000);
    const stats = {};
    const activeM = html.match(/(\d[\d,]*)\s+active\s+lobbyists?/i);
    if (activeM) stats.active_lobbyists = parseInt(activeM[1].replace(/,/g, ''), 10);
    const regM = html.match(/(\d[\d,]*)\s+registrations?/i);
    if (regM) stats.active_registrations = parseInt(regM[1].replace(/,/g, ''), 10);

    const rows = [];
    const tables = parseHtmlTables(html);
    for (const table of tables) {
      if (!table.length) continue;
      const header = table[0].map((c) => c.toLowerCase());
      if (!header.some((h) => h.includes('client') || h.includes('lobbyist'))) continue;
      const lobbyI = header.findIndex((h) => h.includes('lobbyist'));
      const clientI = header.findIndex((h) => h.includes('client'));
      const targetI = header.findIndex((h) => h.includes('target') || h.includes('agency'));
      for (const cells of table.slice(1)) {
        const target = targetI >= 0 ? trim(cells[targetI]) : '';
        if (target && !/premier|nsw government|department of premier|cabinet/i.test(target)) continue;
        rows.push({
          ...baseLobbyRow(SOURCES.lobbyingPortal),
          lobbyist_or_firm: lobbyI >= 0 ? trim(cells[lobbyI]) : NOT_DISCLOSED,
          client_employer: clientI >= 0 ? trim(cells[clientI]) : NOT_DISCLOSED,
          target_office_or_person: target || 'Premier / NSW Government (inferred from register filter)',
          issue_area: NOT_DISCLOSED,
          reporting_period: NOT_DISCLOSED,
        });
        if (rows.length >= 40) break;
      }
      if (rows.length) break;
    }

    if (rows.length) {
      return {
        lobbying_records: {
          status: 'filed',
          rows,
          row_count: rows.length,
          note: `${rows.length} NSW Lobbying Commissioner register row(s) referencing Premier / NSW Government targets.`,
          portal: SOURCES.lobbyingPortal,
          source_url: SOURCES.lobbyingPortal,
        },
        sourceUrl: SOURCES.lobbyingPortal,
      };
    }

    return {
      lobbying_records: {
        status: 'no_official_target_specific_lobbying_records_found',
        rows: [],
        row_count: 0,
        note:
          'NSW Lobbying Commissioner public register does not publish downloadable Premier-target rows in this sync; portal statistics only.',
        registry_statistics: stats,
        portal: SOURCES.lobbyingPortal,
        source_url: SOURCES.lobbyingPortal,
      },
      sourceUrl: SOURCES.lobbyingPortal,
    };
  } catch (err) {
    return {
      lobbying_records: {
        status: 'no_official_target_specific_lobbying_records_found',
        rows: [],
        row_count: 0,
        note: `NSW Lobbying Commissioner portal could not be fetched (${trim(err.message)}). Search the official register for Premier / NSW Government targets.`,
        portal: SOURCES.lobbyingPortal,
        source_url: SOURCES.lobbyingPortal,
      },
      sourceUrl: SOURCES.lobbyingPortal,
    };
  }
}

async function buildLeaderTransparency() {
  const verified = {};
  const partial = {};

  try {
    const salaryResult = await fetchSalary();
    if (salaryResult?.salary) {
      partial.salary = salaryResult.salary;
      verified.salary = salaryResult.sourceUrl;
    }
  } catch (err) {
    partial.salary_error = trim(err.message);
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
    'Official NSW sources only: Parliament remuneration PDF (salary), Register of Disclosures tabled papers (interests), NSW Electoral Commission efadisclosures (donations search), NSW Lobbying Commissioner portal, NSW Government media releases. No Wikipedia, news, or estimated net worth.';

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
