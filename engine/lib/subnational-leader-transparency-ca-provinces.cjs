/**
 * Canadian provincial/territorial leader transparency (CA-BC … CA-NU).
 * Official government / commissioner / elections sources only.
 */

const {
  trim,
  fetchText,
  fetchJson,
  parseCsv,
} = require('./subnational-transparency-shared.cjs');
const {
  absUrl,
  stripHtml,
  parseRssItems,
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
const {
  CANADIAN_PROVINCE_IDS,
  getProvincialConfig,
} = require('./canadian-provincial-leader-transparency-config.cjs');

const FRAMEWORK_NOTE =
  'Official framework available; individual values require manual review.';

function formatCad(amount, fractionDigits = 0) {
  if (!Number.isFinite(amount)) return '';
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amount);
}

function parseMoney(text) {
  const n = Number(String(text || '').replace(/[^0-9.-]/g, ''));
  return Number.isFinite(n) ? n : null;
}

function buildFrameworkBlocks(cfg) {
  const src = cfg.sources.ethics_disclosures || cfg.sources.ethics || cfg.sources.premier || '';
  const financial_disclosure = {
    status: 'official_framework',
    regulatory_framework: cfg.regulatory_act,
    regulatory_body: cfg.regulatory_body,
    filing_status_note: FRAMEWORK_NOTE,
    portal_note: cfg.blocked_notes?.length
      ? cfg.blocked_notes.join(' ')
      : 'Public disclosure statements are published by the provincial integrity/ethics commissioner.',
    needs_manual_review: ['individual_asset_values', 'stock_tickers', 'exact_holdings'],
    source_url: src,
  };

  const gifts_hospitality = {
    status: 'official_framework',
    rule_summary: `${cfg.regulatory_body} — gift and hospitality disclosure rules apply to the Premier and members.`,
    needs_manual_review: ['individual_gift_rows'],
    source_url: src,
  };

  const lobbying_records = cfg.sources.lobbying
    ? {
        status: 'no_official_target_specific_lobbying_records_found',
        rows: [],
        row_count: 0,
        note: 'Provincial lobbyist registries publish registrations; Premier-target meeting rows are not exposed in this automated sync.',
        portal: cfg.sources.lobbying,
        source_url: cfg.sources.lobbying,
      }
    : {
        status: 'no_official_target_specific_lobbying_records_found',
        rows: [],
        row_count: 0,
        note: 'No separate provincial lobbying register identified for automated Premier-target rows.',
        source_url: src || cfg.sources.newsroom || '',
      };

  const stock_holdings = {
    status: 'official_framework',
    rows: [],
    row_count: 0,
    disclosure_note: FRAMEWORK_NOTE,
    needs_manual_review: ['stock_tickers', 'purchase_amounts'],
    source_url: src,
  };

  return { financial_disclosure, gifts_hospitality, lobbying_records, stock_holdings };
}

async function fetchBcPremierSalary(cfg) {
  const html = await fetchText(cfg.sources.mla_remuneration, 1500000);
  const tables = parseHtmlTables(html);
  for (const table of tables) {
    if (!table.length) continue;
    const header = table[0].map((c) => c.toLowerCase());
    const posI = header.findIndex((h) => h.includes('position'));
    const addI = header.findIndex((h) => h.includes('additional'));
    for (const row of table.slice(1)) {
      const pos = trim(row[posI >= 0 ? posI : 0]);
      if (!/^premier$/i.test(pos)) continue;
      const addText = addI >= 0 ? trim(row[addI]) : '';
      const amount = parseMoney(addText);
      return {
        salary: {
          amount,
          amount_text: addText || (amount != null ? formatCad(amount, 2) : ''),
          period: 'MLA additional salary — Premier (annual, BC Legislature schedule)',
          description:
            'Official MLA remuneration schedule — Premier additional salary row (leg.bc.ca). Base MLA compensation is published separately on the same page.',
        },
        sourceUrl: cfg.sources.mla_remuneration,
      };
    }
  }
  return null;
}

async function fetchRssActivity(cfg) {
  const rssUrl = cfg.sources.news_rss;
  if (!rssUrl) return null;
  const xml = await fetchText(rssUrl, 800000);
  const items = parseRssItems(xml)
    .filter((it) => cfg.leader_match.test(`${it.title} ${it.description} ${it.link}`))
    .slice(0, 8)
    .map((it) => ({
      title: it.title,
      date: trim(it.pubDate).slice(0, 16) || '',
      url: it.link,
      excerpt: stripHtml(it.description).slice(0, 280),
      source_url: it.link,
    }));
  if (!items.length) return null;
  return { items, sourceUrl: rssUrl };
}

async function fetchHtmlActivity(cfg) {
  const urls = [cfg.sources.premier_news, cfg.sources.premier, cfg.sources.newsroom].filter(Boolean);
  for (const url of urls) {
    try {
      const html = await fetchText(url, 800000);
      if (/403 forbidden|access denied|resource not found/i.test(html.slice(0, 500))) continue;
      const items = parsePressLinksFromHtml(html, url, {
        limit: 8,
        titleFilter: (title, href) => cfg.leader_match.test(`${title} ${href}`),
      });
      if (items.length) return { items, sourceUrl: url };
    } catch {
      // try next
    }
  }
  return null;
}

function harvestPdfLinks(html, baseUrl, leaderMatch) {
  const rows = [];
  const seen = new Set();
  const re = /href=["']([^"']+\.pdf[^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(html))) {
    const href = absUrl(baseUrl, m[1]);
    const label = stripHtml(m[2]);
    if (!leaderMatch.test(`${label} ${href}`)) continue;
    const key = href.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    pushUniqueAsset(rows, seen, {
      ...baseAssetRow('Public disclosure statement', href, null),
      asset_or_entity_name: label || href.split('/').pop(),
      asset_type: 'Official disclosure PDF',
      value_range: NOT_DISCLOSED,
      income_range: NOT_DISCLOSED,
      trust_entity_name: NOT_DISCLOSED,
      transaction_note: NOT_DISCLOSED,
    });
    if (rows.length >= 40) break;
  }
  return rows;
}

async function fetchEthicsDisclosures(cfg) {
  const url = cfg.sources.ethics_disclosures || cfg.sources.ethics;
  if (!url) return null;
  try {
    const html = await fetchText(url, 3000000);
    if (/resource not found|404|403 forbidden/i.test(html.slice(0, 800))) {
      return {
        declared_assets: {
          status: 'official_data_requires_manual_review',
          rows: [],
          row_count: 0,
          disclosure_note: cfg.blocked_notes?.[0] || 'Ethics portal page not machine-readable in this sync.',
          source_url: url,
        },
        sourceUrl: url,
      };
    }
    const rows = harvestPdfLinks(html, url, cfg.leader_match);
    if (!rows.length) {
      const linkCount = (html.match(/\.pdf/gi) || []).length;
      return {
        declared_assets: {
          status: linkCount > 0 ? 'official_bulk_register_pdf' : 'official_framework',
          rows: [],
          row_count: 0,
          disclosure_note:
            linkCount > 0
              ? `${linkCount} official PDF link(s) on commissioner page; Premier-specific PDF requires manual open.`
              : FRAMEWORK_NOTE,
          source_url: url,
        },
        sourceUrl: url,
      };
    }
    return {
      declared_assets: {
        status: 'filed',
        rows,
        row_count: rows.length,
        disclosure_note: 'PDF index rows from official public disclosure page.',
        source_url: url,
      },
      sourceUrl: url,
    };
  } catch (err) {
    return {
      declared_assets: {
        status: 'official_data_requires_manual_review',
        rows: [],
        row_count: 0,
        error: trim(err.message),
        disclosure_note: cfg.blocked_notes?.join(' ') || trim(err.message),
        source_url: url,
      },
      sourceUrl: url,
    };
  }
}

async function fetchAlbertaElections(cfg) {
  const html = await fetchText(cfg.sources.elections, 800000);
  const tables = parseHtmlTables(html);
  const items = [];
  for (const table of tables) {
    if (!table.length) continue;
    const header = table[0].map((c) => c.toLowerCase());
    if (!header.some((h) => h.includes('contributor') || h.includes('donor'))) continue;
    const nameI = header.findIndex((h) => h.includes('contributor') || h.includes('donor'));
    const amtI = header.findIndex((h) => h.includes('amount') || h.includes('contribution'));
    for (const row of table.slice(1)) {
      const name = trim(row[nameI >= 0 ? nameI : 0]);
      const amountText = amtI >= 0 ? trim(row[amtI]) : '';
      if (!name) continue;
      items.push({
        name,
        contributor: name,
        amount: parseMoney(amountText),
        amount_text: amountText,
        source_url: cfg.sources.elections,
      });
      if (items.length >= 12) break;
    }
    if (items.length) break;
  }
  if (!items.length) return null;
  const total = items.reduce((s, r) => s + (r.amount || 0), 0);
  return {
    campaign_finance: {
      summary: `${items.length} contribution row(s) from Elections Alberta public finance tables (sample).`,
      items,
      row_count: items.length,
      total_amount_text: total > 0 ? formatCad(total) : '',
    },
    sourceUrl: cfg.sources.elections,
  };
}

async function fetchQuebecElections(cfg) {
  const html = await fetchText(cfg.sources.elections, 800000);
  const tables = parseHtmlTables(html);
  const items = [];
  for (const table of tables) {
    if (!table.length) continue;
    const header = table[0].map((c) => c.toLowerCase());
    if (!header.some((h) => h.includes('donateur') || h.includes('donor'))) continue;
    const nameI = header.findIndex((h) => h.includes('donateur') || h.includes('donor'));
    const amtI = header.findIndex((h) => h.includes('montant') || h.includes('amount'));
    for (const row of table.slice(1)) {
      const name = trim(row[nameI >= 0 ? nameI : 0]);
      const amountText = amtI >= 0 ? trim(row[amtI]) : '';
      if (!name) continue;
      items.push({
        name,
        contributor: name,
        amount: parseMoney(amountText),
        amount_text: amountText,
        source_url: cfg.sources.elections,
      });
      if (items.length >= 12) break;
    }
    if (items.length) break;
  }
  if (!items.length) return null;
  return {
    campaign_finance: {
      summary: `${items.length} donor row(s) from Élections Québec public search (sample).`,
      items,
      row_count: items.length,
    },
    sourceUrl: cfg.sources.elections,
  };
}

async function fetchBlockedPlaceholder(cfg) {
  const note = (cfg.blocked_notes || []).join(' ') || 'Official portal blocked from automated fetch.';
  const frameworks = buildFrameworkBlocks(cfg);
  frameworks.financial_disclosure.status = 'official_data_requires_manual_review';
  frameworks.financial_disclosure.filing_status_note = note;
  frameworks.financial_disclosure.portal_note = note;
  frameworks.data_completeness_note = `Official ${cfg.jurisdictionId} sources only. Automated fetch blocked or requires manual review: ${note}`;
  return frameworks;
}

async function buildLeaderTransparency(jurisdictionId) {
  const cfg = getProvincialConfig(jurisdictionId);
  if (!cfg) throw new Error(`Unknown Canadian province id: ${jurisdictionId}`);

  const fullCfg = { ...cfg, jurisdictionId };
  const verified = {};
  const partial = {};

  const frameworks = buildFrameworkBlocks(fullCfg);
  partial.financial_disclosure = frameworks.financial_disclosure;
  partial.gifts_hospitality = frameworks.gifts_hospitality;
  partial.lobbying_records = frameworks.lobbying_records;
  partial.stock_holdings = frameworks.stock_holdings;
  verified.financial_disclosure = frameworks.financial_disclosure.source_url;
  verified.gifts_hospitality = frameworks.gifts_hospitality.source_url;
  verified.lobbying_records = frameworks.lobbying_records.source_url;
  verified.stock_holdings = frameworks.stock_holdings.source_url;

  if (['CA-YT', 'CA-NU'].includes(jurisdictionId)) {
    const blocked = await fetchBlockedPlaceholder(fullCfg);
    Object.assign(partial, blocked);
  } else {
    // Salary
    try {
      if (fullCfg.salary_strategy === 'bc_mla_premier_table') {
        const sal = await fetchBcPremierSalary(fullCfg);
        if (sal?.salary) {
          partial.salary = sal.salary;
          verified.salary = sal.sourceUrl;
        }
      }
    } catch (err) {
      partial.salary_error = trim(err.message);
    }

    // Ethics / declared assets
    try {
      const ethics = await fetchEthicsDisclosures(fullCfg);
      if (ethics?.declared_assets) {
        partial.declared_assets = ethics.declared_assets;
        verified.declared_assets = ethics.sourceUrl;
        if (ethics.declared_assets.rows?.length) {
          partial.stock_holdings = {
            ...frameworks.stock_holdings,
            status: 'official_framework',
            rows: ethics.declared_assets.rows.slice(0, 20),
            row_count: Math.min(20, ethics.declared_assets.rows.length),
            disclosure_note: FRAMEWORK_NOTE,
          };
        }
      }
    } catch (err) {
      partial.declared_assets_error = trim(err.message);
    }

    // Campaign finance
    try {
      let finance = null;
      if (jurisdictionId === 'CA-AB') finance = await fetchAlbertaElections(fullCfg);
      else if (jurisdictionId === 'CA-QC') finance = await fetchQuebecElections(fullCfg);
      if (finance?.campaign_finance) {
        partial.campaign_finance = finance.campaign_finance;
        verified.campaign_finance = finance.sourceUrl;
      }
    } catch (err) {
      partial.campaign_finance_error = trim(err.message);
    }

    // Recent activity
    try {
      let activity = await fetchRssActivity(fullCfg);
      if (!activity) activity = await fetchHtmlActivity(fullCfg);
      if (activity?.items?.length) {
        partial.recent_official_activity = activity.items;
        verified.recent_official_activity = activity.sourceUrl;
      }
    } catch (err) {
      partial.recent_official_activity_error = trim(err.message);
    }
  }

  partial.data_completeness_note = partial.data_completeness_note ||
    `Official ${jurisdictionId} sources only (${fullCfg.regulatory_body}, elections finance portal, premier/government news). No Wikipedia, news aggregators, or estimated net worth.`;

  partial.regulatory_act = fullCfg.regulatory_act;
  partial.regulatory_body = fullCfg.regulatory_body;
  if (fullCfg.blocked_notes?.length) {
    partial.sources_inaccessible = fullCfg.blocked_notes;
  }

  return {
    jurisdictionId,
    payload: finalizePayload(jurisdictionId, partial, verified),
    verified,
  };
}

function createModule(jurisdictionId) {
  return {
    JURISDICTION_ID: jurisdictionId,
    buildLeaderTransparency: () => buildLeaderTransparency(jurisdictionId),
    SOURCES: getProvincialConfig(jurisdictionId)?.sources || {},
  };
}

module.exports = {
  CANADIAN_PROVINCE_IDS,
  buildLeaderTransparency,
  createModule,
};
