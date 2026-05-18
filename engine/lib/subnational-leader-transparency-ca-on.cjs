/**
 * CA-ON — official leader transparency (Doug Ford / Premier of Ontario).
 * Official sources only: Ontario Data Catalogue (PSSD), Elections Ontario EFRS, Ontario News API.
 */

const https = require('https');
const readline = require('readline');
const { URL } = require('url');
const {
  trim,
  fetchText,
  fetchJson,
  splitCsvLine,
} = require('./subnational-transparency-shared.cjs');
const {
  stripHtml,
  finalizePayload,
} = require('./subnational-leader-transparency-shared.cjs');

const JURISDICTION_ID = 'CA-ON';
const LEADER_NAME = 'Ford, Doug';

const SOURCES = Object.freeze({
  pssdPage: 'https://www.ontario.ca/page/public-sector-salary-disclosure',
  pssdOpenData: 'https://data.ontario.ca/dataset/public-sector-salary-disclosure-2020',
  oicoPds: 'https://pds.oico.on.ca/Pages/Public/PublicDisclosures.aspx',
  electionsSearch:
    'https://finances.elections.on.ca/en/contributions?entityNames=Ford%2C%20Doug&fromYear=2018&toYear=2024',
  electionsApi: 'https://finances.elections.on.ca/api/contributions/search',
  lobbyistRegistry: 'https://lobbyist.oico.on.ca/',
  newsroom: 'https://news.ontario.ca/newsroom/en',
});

const API_BASE = 'https://api.news.ontario.ca/api/v1/releases';

const PSSD_YEARS = [2020, 2019];

function parseMoney(text) {
  const n = Number(String(text || '').replace(/[^0-9.-]/g, ''));
  return Number.isFinite(n) ? n : null;
}

function formatCad(amount) {
  if (!Number.isFinite(amount)) return '';
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: 2,
  }).format(amount);
}

async function resolvePssdCsvUrl(year) {
  const body = await fetchJson(
    `https://data.ontario.ca/api/3/action/package_show?id=public-sector-salary-disclosure-${year}`,
  );
  const resources = body?.result?.resources || [];
  const csv =
    resources.find((r) => /compendium/i.test(r.name || '') && /csv/i.test(r.format || '')) ||
    resources.find((r) => /All sectors/i.test(r.name || '') && /csv/i.test(r.format || '')) ||
    resources.find((r) => /csv/i.test(r.format || ''));
  return csv?.url || '';
}

function streamPssdMatch(csvUrl, onMatch) {
  return new Promise((resolve, reject) => {
    const u = new URL(csvUrl);
    const req = https.get(
      csvUrl,
      { headers: { 'User-Agent': 'CivicVoice-SubnationalLeaderTransparency/1.0', Accept: 'text/csv' } },
      (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          res.resume();
          streamPssdMatch(res.headers.location, onMatch).then(resolve, reject);
          return;
        }
        if (res.statusCode !== 200) {
          res.resume();
          reject(new Error(`HTTP ${res.statusCode} for ${csvUrl}`));
          return;
        }
        let headers = null;
        const rl = readline.createInterface({ input: res, crlfDelay: Infinity });
        rl.on('line', (line) => {
          if (!headers) {
            headers = splitCsvLine(line.replace(/^\uFEFF/, ''));
            return;
          }
          const cols = splitCsvLine(line);
          const row = {};
          for (let i = 0; i < headers.length; i += 1) row[headers[i]] = cols[i] ?? '';
          const last = trim(row['Last name'] || row.Lastname || row.last_name).toLowerCase();
          const first = trim(row['First name'] || row.Firstname || row.first_name).toLowerCase();
          const title = trim(row['Job title'] || row['Job Title'] || row.job_title);
          if (last === 'ford' && first === 'doug' && /premier/i.test(title)) {
            onMatch(row);
            rl.close();
            req.destroy();
          }
        });
        rl.on('close', resolve);
        rl.on('error', reject);
      },
    );
    req.on('error', reject);
    req.setTimeout(300000, () => {
      req.destroy();
      reject(new Error(`Timeout: ${csvUrl}`));
    });
  });
}

async function fetchSunshineSalary() {
  for (const year of PSSD_YEARS) {
    const csvUrl = await resolvePssdCsvUrl(year);
    if (!csvUrl) continue;
    let match = null;
    await streamPssdMatch(csvUrl, (row) => {
      match = row;
    });
    if (!match) continue;

    const salaryRaw = trim(match.Salary || match.salary);
    const benefitsRaw = trim(match.Benefits || match.benefits);
    const disclosureYear = trim(match.Year || match.year) || String(year);
    const amount = parseMoney(salaryRaw);
    const benefits = parseMoney(benefitsRaw);
    const employer = trim(match.Employer || match.employer);
    const jobTitle = trim(match['Job title'] || match['Job Title']);

    let amountText = salaryRaw;
    if (amount != null) amountText = formatCad(amount);
    if (benefits != null && benefits > 0) {
      amountText = `${amountText} (taxable benefits ${formatCad(benefits)})`;
    }

    return {
      salary: {
        amount,
        amount_text: amountText,
        period: `Calendar year ${disclosureYear}`,
        description: `${jobTitle || 'Premier'} — ${employer || 'Legislative Assembly'} (Ontario Public Sector Salary Disclosure)`,
      },
      sourceUrl: SOURCES.pssdPage,
      datasetUrl: `https://data.ontario.ca/dataset/public-sector-salary-disclosure-${year}`,
    };
  }
  return null;
}

function postContributionsSearch(body) {
  const data = JSON.stringify(body);
  return new Promise((resolve, reject) => {
    const u = new URL(SOURCES.electionsApi);
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
            reject(new Error(`HTTP ${res.statusCode} for ${SOURCES.electionsApi}`));
            return;
          }
          try {
            resolve(JSON.parse(buf));
          } catch (err) {
            reject(err);
          }
        });
      },
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function fetchCampaignFinance() {
  const byContributor = new Map();
  let totalAmount = 0;
  let rowCount = 0;
  let pageIndex = 0;
  const pageSize = 100;
  const maxPages = 40;

  while (pageIndex < maxPages) {
    const page = await postContributionsSearch({
      entityNames: [LEADER_NAME],
      fromYear: 2018,
      toYear: 2024,
      language: 'en',
      pageIndex,
      pageSize,
    });
    const rows = page?.results || [];
    if (!rows.length) break;

    for (const row of rows) {
      const name = trim(row.contributorName);
      const amount = Number(row.contributionAmount);
      if (!name || !Number.isFinite(amount)) continue;
      rowCount += 1;
      totalAmount += amount;
      byContributor.set(name, (byContributor.get(name) || 0) + amount);
    }

    if (rows.length < pageSize) break;
    pageIndex += 1;
  }

  if (!rowCount) return null;

  const items = [...byContributor.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, amount]) => ({
      name,
      contributor: name,
      amount,
      amount_text: formatCad(amount),
    }));

  return {
    campaign_finance: {
      summary: `${rowCount.toLocaleString('en-CA')} contributions to ${LEADER_NAME} filed with Elections Ontario (2018–2024), totaling ${formatCad(totalAmount)}.`,
      items,
    },
    sourceUrl: SOURCES.electionsSearch,
  };
}

function normalizeApiUrl(nextUrl) {
  return String(nextUrl || '')
    .replace(/^http:\/\/intra\.newsroom\.ontario\.ca/i, 'https://api.news.ontario.ca');
}

function releasePageUrl(release) {
  const id = release?.id;
  const slug = release?.slug;
  if (id && slug) return `https://news.ontario.ca/en/release/${id}/${slug}`;
  if (id) return `https://news.ontario.ca/en/release/${id}`;
  return SOURCES.newsroom;
}

function isPremierOfficeRelease(release) {
  const ministry = trim(release?.ministry_name);
  if (/^premier'?s office$/i.test(ministry)) return true;
  const contacts = String(release?.contacts || '');
  return /premier'?s office/i.test(contacts);
}

async function fetchRecentActivity() {
  const items = [];
  let url = `${API_BASE}?limit=10`;
  let pages = 0;

  while (url && items.length < 8 && pages < 12) {
    const text = await fetchText(url, 150000);
    const body = JSON.parse(text);
    for (const release of body.data || []) {
      if (!isPremierOfficeRelease(release)) continue;
      const title = trim(release.clean_title || release.content_title);
      if (!title) continue;
      items.push({
        title,
        date: trim(release.release_date_time || release.release_date || '').slice(0, 10),
        url: releasePageUrl(release),
        excerpt: stripHtml(release.content_lead || '').slice(0, 280),
        source_url: releasePageUrl(release),
      });
      if (items.length >= 8) break;
    }
    url = normalizeApiUrl(body.links?.next);
    pages += 1;
  }

  return { items, sourceUrl: SOURCES.newsroom };
}

async function buildLeaderTransparency() {
  const verified = {};
  const partial = {};

  try {
    const salaryResult = await fetchSunshineSalary();
    if (salaryResult?.salary) {
      partial.salary = salaryResult.salary;
      verified.salary = salaryResult.sourceUrl;
    }
  } catch (err) {
    partial.salary_error = trim(err.message);
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
    const { items, sourceUrl } = await fetchRecentActivity();
    if (items.length) {
      partial.recent_official_activity = items;
      verified.recent_official_activity = sourceUrl;
    }
  } catch (err) {
    partial.recent_official_activity_error = trim(err.message);
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
  SOURCES,
};
