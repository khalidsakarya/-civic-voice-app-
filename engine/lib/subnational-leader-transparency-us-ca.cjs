/**
 * US-CA — official leader transparency (Gavin Newsom / Governor of California).
 * Official sources: CalHR Citizens Compensation Commission, FPPC Form 700 search,
 * SOS Power Search (Cal-Access data), Governor newsroom.
 */

const https = require('https');
const {
  trim,
  fetchText,
} = require('./subnational-transparency-shared.cjs');
const {
  parsePressLinksFromHtml,
  finalizePayload,
} = require('./subnational-leader-transparency-shared.cjs');
const { buildReportedAssetRows } = require('./fppc-form700-rows.cjs');
const { fetchGovernorLobbyingRows } = require('./calaccess-lobbying-extract.cjs');

const JURISDICTION_ID = 'US-CA';
const LEADER_FIRST = 'Gavin';
const LEADER_LAST = 'Newsom';

const SOURCES = Object.freeze({
  calhrSalaries:
    'https://www.calhr.ca.gov/california-citizens-compensation-commission/cccc-salaries/',
  fppcSearch: 'https://form700search.fppc.ca.gov/',
  fppcSearchApi: 'https://form700search.fppc.ca.gov/Home/SearchDocuments',
  powersearch: 'https://powersearch.sos.ca.gov/advanced.php',
  powersearchQuick: 'https://powersearch.sos.ca.gov/quick-search.php',
  calAccessCampaign: 'http://cal-access.sos.ca.gov/Campaign/',
  calAccessLobbying: 'http://cal-access.sos.ca.gov/Lobbying/',
  calAccessRawData:
    'https://sos.ca.gov/campaign-lobbying/helpful-resources/raw-data-campaign-finance-and-lobbying-activity',
  newsroom: 'https://www.gov.ca.gov/newsroom/',
});

const FPPC_FILER_BASE = [
  { queryField: 'FilerLastName', queryType: 'Start With', filterValue: LEADER_LAST },
  { queryField: 'FilerFirstName', queryType: 'Start With', filterValue: LEADER_FIRST },
];

function parseMoney(text) {
  const n = Number(String(text || '').replace(/[^0-9.-]/g, ''));
  return Number.isFinite(n) ? n : null;
}

function formatUsd(amount, fractionDigits = 0) {
  if (!Number.isFinite(amount)) return '';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amount);
}

function formatFppcRange(range) {
  if (!range || typeof range !== 'object') return '';
  const gte = range.gte != null ? Number(range.gte) : null;
  const lte = range.lte != null ? Number(range.lte) : null;
  if (Number.isFinite(gte) && Number.isFinite(lte) && lte > 0) {
    return `${formatUsd(gte)} - ${formatUsd(lte)}`;
  }
  if (Number.isFinite(gte)) return `Over ${formatUsd(gte)}`;
  if (Number.isFinite(lte) && lte > 0) return `Up to ${formatUsd(lte)}`;
  return '';
}

function postJson(url, body) {
  const data = JSON.stringify(body);
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https.request(
      {
        hostname: u.hostname,
        path: u.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
          Accept: 'application/json',
          'User-Agent': 'CivicVoice-SubnationalLeaderTransparency/1.0',
        },
      },
      (res) => {
        let buf = '';
        res.on('data', (c) => (buf += c));
        res.on('end', () => {
          if (res.statusCode !== 200) {
            reject(new Error(`HTTP ${res.statusCode} for ${url}`));
            return;
          }
          try {
            const outer = JSON.parse(buf);
            resolve(typeof outer === 'string' ? JSON.parse(outer) : outer);
          } catch (err) {
            reject(err);
          }
        });
      },
    );
    req.on('error', reject);
    req.setTimeout(120000, () => {
      req.destroy();
      reject(new Error(`Timeout: ${url}`));
    });
    req.write(data);
    req.end();
  });
}

function postPowersearch(fields) {
  const body = new URLSearchParams(fields).toString();
  return new Promise((resolve, reject) => {
    const u = new URL(SOURCES.powersearch);
    const req = https.request(
      {
        hostname: u.hostname,
        path: u.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(body),
          'User-Agent': 'CivicVoice-SubnationalLeaderTransparency/1.0',
        },
      },
      (res) => {
        let buf = '';
        res.on('data', (c) => (buf += c));
        res.on('end', () => {
          if (res.statusCode !== 200) {
            reject(new Error(`HTTP ${res.statusCode} for ${SOURCES.powersearch}`));
            return;
          }
          resolve(buf);
        });
      },
    );
    req.on('error', reject);
    req.setTimeout(120000, () => {
      req.destroy();
      reject(new Error(`Timeout: ${SOURCES.powersearch}`));
    });
    req.write(body);
    req.end();
  });
}

async function fetchSalary() {
  const html = await fetchText(SOURCES.calhrSalaries, 400000);
  const plain = html.replace(/<[^>]+>/g, '\n').replace(/\s+/g, ' ').trim();

  let currentAmount = null;
  let currentEffective = 'December 1, 2025';
  const currentBlock = plain.match(
    /Current salaries \(effective ([^)]+)\)[\s\S]*?Governor\s+\$([\d,]+)/i,
  );
  if (currentBlock) {
    currentEffective = trim(currentBlock[1]);
    currentAmount = parseMoney(currentBlock[2]);
  }

  let priorAmount = null;
  let priorPeriod = '2024-2025';
  const priorBlock = plain.match(/Past salaries of elected officials, 2024-2025[\s\S]*?Governor\s+\$([\d,]+)/i);
  if (priorBlock) priorAmount = parseMoney(priorBlock[1]);

  const amount = currentAmount ?? priorAmount;
  if (!Number.isFinite(amount)) return null;

  return {
    salary: {
      amount,
      amount_text: formatUsd(amount, 2),
      period: `Effective ${currentEffective}`,
      description:
        'Annual salary set by the California Citizens Compensation Commission (state constitutional officer schedule). Taxable benefits are not listed on this official schedule.',
      prior_period: priorPeriod,
      prior_amount_text: priorAmount != null ? formatUsd(priorAmount, 2) : '',
    },
    sourceUrl: SOURCES.calhrSalaries,
  };
}

function pickGovernorFiling(documents) {
  const gov = (documents || []).filter((d) =>
    (d.filingPositions || []).some((p) => /governor/i.test(p.position || '')),
  );
  if (!gov.length) return null;
  gov.sort((a, b) => {
    const ya = Math.max(...(a.filingPositions || []).map((p) => p.filingYear || 0));
    const yb = Math.max(...(b.filingPositions || []).map((p) => p.filingYear || 0));
    return yb - ya;
  });
  return gov[0];
}

async function fppcSearch(extraQueries, extra = {}) {
  return postJson(SOURCES.fppcSearchApi, {
    searchFieldQueryInfos: [...FPPC_FILER_BASE, ...extraQueries],
    showOnlyHeldPositions: true,
    ...extra,
  });
}

function mapFilingRow(doc) {
  const positions = doc.filingPositions || [];
  const govPos = positions.find((p) => /governor/i.test(p.position || '')) || positions[0];
  return {
    filing_year: govPos?.filingYear || null,
    position: govPos?.position || '',
    agency: govPos?.agency || '',
    filing_type: govPos?.filingType || '',
    filed_date: trim(doc.filingInfo?.filedDate || '').slice(0, 10),
    is_amendment: doc.filingInfo?.isAmendment === true,
    no_reportable_interests: doc.filingInfo?.noReportableInterests === true,
    index_id: doc.indexID || '',
    source_url: SOURCES.fppcSearch,
  };
}

function extractScheduleD(scheduleD) {
  if (!scheduleD) return [];
  const items = [];
  for (const section of scheduleD.sections || []) {
    for (const gift of section.gifts || []) {
      const value = gift.value != null ? Number(gift.value) : null;
      items.push({
        date: gift.date || '',
        description: gift.description || '',
        source: section.nameOfSource || '',
        value,
        value_text: Number.isFinite(value) ? formatUsd(value, 2) : formatFppcRange(gift),
      });
    }
  }
  return items;
}

function extractScheduleE(scheduleE) {
  if (!scheduleE) return [];
  return (scheduleE.sections || []).map((s) => ({
    source: s.nameOfSource || '',
    amount: s.amount != null ? Number(s.amount) : null,
    amount_text: s.amount != null ? formatUsd(Number(s.amount), 2) : '',
    payment_type: s.paymentType || '',
    purpose: s.purposeOther?.value || s.purpose || '',
    travel_destination: s.travelDestination || '',
    date_range:
      s.dates?.gte && s.dates?.lte ? `${s.dates.gte} – ${s.dates.lte}` : s.dates?.gte || '',
    source_url: SOURCES.fppcSearch,
  }));
}

async function mergeGovernorSchedules(latestGov) {
  const scheduleQueries = [
    { key: 'schedule_a1', field: 'ScheduleA1Exists' },
    { key: 'schedule_a2', field: 'ScheduleA2Exists' },
    { key: 'schedule_b', field: 'ScheduleBExists' },
    { key: 'schedule_c', field: 'ScheduleCIncomeExists' },
    { key: 'schedule_d', field: 'ScheduleDExists' },
    { key: 'schedule_e', field: 'ScheduleEExists' },
  ];

  const merged = {};
  const targetId = latestGov?.indexID;

  for (const { key, field } of scheduleQueries) {
    try {
      const resp = await fppcSearch([{ queryField: field }]);
      let doc =
        (resp.documents || []).find((d) => d.indexID === targetId) ||
        pickGovernorFiling(resp.documents) ||
        (resp.documents || [])[0];
      const schedules = doc?.filingData?.schedules;
      if (!schedules) continue;
      for (const [sk, val] of Object.entries(schedules)) {
        const norm = sk.replace(/^schedule/i, 'schedule').replace('scheduleA1', 'scheduleA1');
        merged[norm] = val;
      }
    } catch {
      // continue
    }
  }

  if (latestGov?.filingData?.schedules) {
    Object.assign(merged, latestGov.filingData.schedules);
  }

  return merged;
}

async function fetchFppcDisclosure() {
  const filingsResp = await fppcSearch([]);
  const filings = (filingsResp.documents || []).map(mapFilingRow);
  const latestGov = pickGovernorFiling(filingsResp.documents || []);
  const latestYear =
    latestGov?.filingPositions?.find((p) => /governor/i.test(p.position))?.filingYear || 2025;

  const schedules = await mergeGovernorSchedules(latestGov);
  const assetBlock = buildReportedAssetRows(schedules, {
    source_url: SOURCES.fppcSearch,
    filing_year: latestYear,
  });

  const gifts = extractScheduleD(schedules.scheduleD);
  const travel = extractScheduleE(schedules.scheduleE);

  const financial_disclosure = {
    status: 'filed',
    latest_filing_year: latestYear,
    reporting_period: `Form 700 — filing year ${latestYear}`,
    filing_status_note: latestGov
      ? `Filed ${trim(latestGov.filingInfo?.filedDate || '').slice(0, 10)} as ${latestGov.filingPositions?.find((p) => /governor/i.test(p.position))?.filingType || 'Annual'}`
      : 'Filed — see FPPC Form 700 search for all positions held',
    regulatory_framework: 'Political Reform Act — Statement of Economic Interests (Form 700)',
    portal_note: assetBlock.disclosure_note,
    filings,
    reported_holdings_row_count: assetBlock.row_count,
    data_status: 'official_fppc_form_700_search',
    source_url: SOURCES.fppcSearch,
    needs_manual_review: [],
  };

  const declared_assets = {
    status: assetBlock.rows.length ? 'filed' : 'no_official_records_found',
    rows: assetBlock.rows,
    page_comments: assetBlock.page_comments,
    row_count: assetBlock.row_count,
    source_url: assetBlock.source_url,
  };

  const stock_holdings = {
    status: assetBlock.stock_rows.length ? 'filed' : 'no_official_records_found',
    rows: assetBlock.stock_rows,
    row_count: assetBlock.stock_rows.length,
    disclosure_note:
      'Official Form 700 reports holdings and fair market value ranges only — not stock purchases, tickers, or share counts unless explicitly stated on the filing.',
    source_url: assetBlock.source_url,
  };

  const gifts_hospitality = {
    rule_summary:
      'Form 700 Schedule D (gifts) and Schedule E (travel payments) — gifts $50+ and travel payments from a single source.',
    gifts,
    travel_payments: travel,
    gift_count: gifts.length,
    travel_count: travel.length,
    status: gifts.length || travel.length ? 'filed' : 'no_official_records_found',
    source_url: SOURCES.fppcSearch,
  };

  return {
    financial_disclosure,
    declared_assets,
    stock_holdings,
    gifts_hospitality,
    sourceUrl: SOURCES.fppcSearch,
  };
}

function parsePowersearchSummary(html) {
  const summaryMatch = html.match(
    /<strong>\$([\d,]+(?:\.\d{2})?)<\/strong>\s+in\s+([\d,]+)\s+contributions/i,
  );
  const total = summaryMatch ? parseMoney(summaryMatch[1]) : null;
  const count = summaryMatch ? parseInt(summaryMatch[2].replace(/,/g, ''), 10) : null;

  const committees = [];
  const committeeRe =
    /\((\d+)\)\s*([^<]+?)<\/b>\s+has raised\s+\$([\d,]+(?:\.\d{2})?)\s+in\s+([\d,]+)\s+contributions/gi;
  let m;
  while ((m = committeeRe.exec(html))) {
    committees.push({
      committee_id: m[1],
      name: trim(m[2]),
      total_amount: parseMoney(m[3]),
      total_amount_text: formatUsd(parseMoney(m[3]), 2),
      contribution_count: parseInt(m[4].replace(/,/g, ''), 10),
      cal_access_url: `${SOURCES.calAccessCampaign}Committees/Detail.aspx?id=${m[1]}`,
    });
  }

  return { total, count, committees };
}

function parsePowersearchTable(html) {
  const rows = [];
  const re = /<tr>([\s\S]*?)<\/tr>/gi;
  let m;
  let first = true;
  while ((m = re.exec(html))) {
    if (first) {
      first = false;
      continue;
    }
    const cells = [...m[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((c) =>
      c[1].replace(/<[^>]+>/g, '').trim(),
    );
    if (cells.length >= 8) {
      rows.push({
        contributor: cells[5],
        amount: parseMoney(cells[7]),
        amount_text: cells[7],
        date: cells[8],
        committee: cells[1],
        committee_id: cells[2],
      });
    }
  }
  return rows;
}

async function fetchCampaignFinance() {
  const html = await postPowersearch({
    quick_search: 'true',
    match_candidate: 'no',
    search_candidates: `${LEADER_FIRST} ${LEADER_LAST}`,
    qs_button: 'Search Candidates',
    sort: 'TransactionAmount',
    sort_order: 'DESC',
    return_rows: '100',
  });

  const { total, count, committees } = parsePowersearchSummary(html);
  if (!Number.isFinite(total) || !count) return null;

  const tableRows = parsePowersearchTable(html);
  const byContributor = new Map();
  for (const row of tableRows) {
    const name = trim(row.contributor);
    if (!name || !Number.isFinite(row.amount) || row.amount <= 0) continue;
    byContributor.set(name, (byContributor.get(name) || 0) + row.amount);
  }
  const topContributors = [...byContributor.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, amount]) => ({
      name,
      contributor: name,
      amount,
      amount_text: formatUsd(amount, 2),
    }));

  const dataAsOf = html.match(/Contributions data is current as of ([^.<]+)/i)?.[1]?.trim() || '';

  return {
    campaign_finance: {
      summary: `${count.toLocaleString('en-US')} contributions to ${LEADER_FIRST} ${LEADER_LAST} (California state candidate committees, Cal-Access via SOS Power Search), totaling ${formatUsd(total, 2)}.`,
      total_amount: total,
      total_amount_text: formatUsd(total, 2),
      contribution_count: count,
      data_as_of: dataAsOf,
      committees,
      items: topContributors,
      top_contributors_note:
        'Top contributors aggregated from the 100 largest individual transactions returned by SOS Power Search (sorted by amount). Full contributor aggregation requires Cal-Access CSV export.',
    },
    sourceUrl: SOURCES.powersearch,
  };
}

async function fetchLobbyingRecords() {
  const skipDownload = process.env.SKIP_CALACCESS_LOBBY_DOWNLOAD === '1';
  const lobby = await fetchGovernorLobbyingRows({ maxRows: 250, skipDownload });

  const lobbying_records = {
    status: lobby.status,
    rows: lobby.rows || [],
    row_count: lobby.row_count || (lobby.rows || []).length,
    note: lobby.note || '',
    portal: SOURCES.calAccessLobbying,
    raw_data_url: SOURCES.calAccessRawData,
    source_url: lobby.source_url || SOURCES.calAccessRawData,
    data_as_of: lobby.data_as_of || '',
    error: lobby.error || '',
  };

  return {
    lobbying_records,
    sourceUrl: lobbying_records.source_url,
  };
}

async function fetchRecentActivity() {
  const html = await fetchText(SOURCES.newsroom, 800000);
  const items = parsePressLinksFromHtml(html, 'https://www.gov.ca.gov', {
    hostPattern: /gov\.ca\.gov\/\d{4}\/\d{2}\/\d{2}\//i,
    titleFilter: (title) => /governor|newsom|first partner/i.test(title),
    limit: 8,
  });
  return { items, sourceUrl: SOURCES.newsroom };
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
    const fppc = await fetchFppcDisclosure();
    if (fppc?.financial_disclosure) {
      partial.financial_disclosure = fppc.financial_disclosure;
      partial.declared_assets = fppc.declared_assets;
      partial.stock_holdings = fppc.stock_holdings;
      partial.gifts_hospitality = fppc.gifts_hospitality;
      verified.financial_disclosure = fppc.sourceUrl;
      verified.declared_assets = fppc.sourceUrl;
      verified.stock_holdings = fppc.sourceUrl;
      verified.gifts_hospitality = fppc.sourceUrl;
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
    const lobbying = await fetchLobbyingRecords();
    if (lobbying?.lobbying_records) {
      partial.lobbying_records = lobbying.lobbying_records;
      verified.lobbying_records = lobbying.sourceUrl;
    }
  } catch (err) {
    partial.lobbying_records_error = trim(err.message);
  }

  try {
    const { items, sourceUrl } = await fetchRecentActivity();
    if (items.length) {
      partial.recent_official_activity = items.map((it) => ({
        title: it.title,
        date: it.date || '',
        url: it.url,
        excerpt: it.excerpt || '',
        source_url: it.url,
      }));
      verified.recent_official_activity = sourceUrl;
    }
  } catch (err) {
    partial.recent_official_activity_error = trim(err.message);
  }

  partial.data_completeness_note =
    'Official California sources only: CalHR Citizens Compensation Commission (salary), FPPC Form 700 search (economic interests, gifts, income ranges), SOS Power Search / Cal-Access (campaign finance), Governor newsroom (activity). Form 700 values are official FPPC ranges, not net worth. Cal-Access web UI may require manual review for lobbying and PDF schedules.';

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
