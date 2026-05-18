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
  pssdFilesJson: 'https://www.ontario.ca/public-sector-salary-disclosure_artifacts/pssdfiles.json',
  oicoPds: 'https://pds.oico.on.ca/Pages/Public/PublicDisclosures.aspx',
  electionsSearch:
    'https://finances.elections.on.ca/en/contributions?entityNames=Ford%2C%20Doug&fromYear=2018&toYear=2024',
  electionsApi: 'https://finances.elections.on.ca/api/contributions/search',
  lobbyistRegistry: 'https://lobbyist.oico.on.ca/',
  newsroom: 'https://news.ontario.ca/newsroom/en',
});

const API_BASE = 'https://api.news.ontario.ca/api/v1/releases';

/** Newest first — ontario.ca compendium CSV (via pssdfiles.json), then open-data CKAN fallback. */
const PSSD_ONTARIO_CA_YEARS = [2024, 2023, 2022, 2021];
const PSSD_CKAN_YEARS = [2020, 2019];

let pssdFilesCache = null;

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

function pssdYearPageUrl(year) {
  return `https://www.ontario.ca/public-sector-salary-disclosure/${year}/all-sectors-and-seconded-employees`;
}

function rowField(row, ...names) {
  for (const name of names) {
    const direct = trim(row[name]);
    if (direct) return direct;
    const key = Object.keys(row).find((k) => k.toLowerCase() === name.toLowerCase());
    if (key && trim(row[key])) return trim(row[key]);
  }
  return '';
}

async function loadPssdFilesManifest() {
  if (pssdFilesCache) return pssdFilesCache;
  pssdFilesCache = await fetchJson(SOURCES.pssdFilesJson);
  return pssdFilesCache;
}

async function resolveOntarioCaCsvUrl(year) {
  const manifest = await loadPssdFilesManifest();
  const rel = trim(manifest?.[String(year)]?.Compendium?.en?.csv);
  if (!rel) return '';
  if (/^https?:\/\//i.test(rel)) return rel;
  return new URL(rel, 'https://www.ontario.ca/').href;
}

async function resolveCkanCsvUrl(year) {
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
          const last = rowField(row, 'Last name', 'Last Name').toLowerCase();
          const first = rowField(row, 'First name', 'First Name').toLowerCase();
          const title = rowField(row, 'Job title', 'Job Title');
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

function buildSalaryFromRow(match, year, sourceKind) {
  const salaryRaw = rowField(match, 'Salary', 'Salary paid');
  const benefitsRaw = rowField(match, 'Benefits', 'Taxable benefits');
  const disclosureYear = rowField(match, 'Year', 'Calendar year') || String(year);
  const amount = parseMoney(salaryRaw);
  const benefits = parseMoney(benefitsRaw);
  const employer = rowField(match, 'Employer');
  const jobTitle = rowField(match, 'Job title', 'Job Title');

  let amountText = salaryRaw;
  if (amount != null) amountText = formatCad(amount);
  if (benefits != null && benefits > 0) {
    amountText = `${amountText} (taxable benefits ${formatCad(benefits)})`;
  }

  const sourceNote =
    sourceKind === 'ontario_ca'
      ? 'Ontario.ca published compendium CSV'
      : 'Ontario Data Catalogue open-data CSV (newest machine-readable year on data.ontario.ca)';

  return {
    salary: {
      amount,
      amount_text: amountText,
      period: `Calendar year ${disclosureYear}`,
      description: `${jobTitle || 'Premier'} — ${employer || 'Legislative Assembly'} (${sourceNote})`,
    },
    sourceUrl:
      sourceKind === 'ontario_ca' ? pssdYearPageUrl(year) : SOURCES.pssdPage,
    reportingYear: disclosureYear,
    sourceKind,
  };
}

async function fetchSunshineSalary() {
  for (const year of PSSD_ONTARIO_CA_YEARS) {
    try {
      const csvUrl = await resolveOntarioCaCsvUrl(year);
      if (!csvUrl) continue;
      let match = null;
      await streamPssdMatch(csvUrl, (row) => {
        match = row;
      });
      if (match) return buildSalaryFromRow(match, year, 'ontario_ca');
    } catch {
      // try next year
    }
  }

  for (const year of PSSD_CKAN_YEARS) {
    try {
      const csvUrl = await resolveCkanCsvUrl(year);
      if (!csvUrl) continue;
      let match = null;
      await streamPssdMatch(csvUrl, (row) => {
        match = row;
      });
      if (match) return buildSalaryFromRow(match, year, 'ckan');
    } catch {
      // try next year
    }
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
