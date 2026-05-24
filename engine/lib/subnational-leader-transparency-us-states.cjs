/**
 * US state governor leader transparency (Phase 1 pilots + batch scaffold).
 * Official state ethics / elections / governor sources only.
 */

const {
  trim,
  fetchText,
} = require('./subnational-transparency-shared.cjs');
const {
  stripHtml,
  parseRssItems,
  parsePressLinksFromHtml,
  parseHtmlTables,
  absUrl,
  finalizePayload,
} = require('./subnational-leader-transparency-shared.cjs');
const { NOT_DISCLOSED } = require('./leader-transparency-rows-shared.cjs');
const {
  PHASE1_IDS,
  BATCH2_IDS,
  CONFIGURED_US_STATE_IDS,
  getStateConfig,
} = require('./us-state-leader-transparency-config.cjs');

const FRAMEWORK_NOTE =
  'Official framework available; individual values require manual review.';

function buildFrameworkBlocks(cfg) {
  const ethics = cfg.sources.ethics || cfg.sources.ethics_search || cfg.sources.governor || '';
  const financial_disclosure = {
    status: 'official_framework',
    regulatory_framework: cfg.regulatory_act || 'State financial disclosure law',
    regulatory_body: cfg.regulatory_body || '',
    filing_status_note: FRAMEWORK_NOTE,
    portal_note: cfg.blocked_notes?.length
      ? cfg.blocked_notes.join(' ')
      : 'Public financial disclosure statements are published by the state ethics or elections authority.',
    needs_manual_review: ['individual_asset_values', 'stock_tickers', 'exact_holdings'],
    source_url: ethics,
  };

  const gifts_hospitality = {
    status: 'official_framework',
    rule_summary: `${cfg.regulatory_body || 'State ethics authority'} — gift/travel disclosure rules apply to the Governor and covered officials where required by state law.`,
    gifts: [],
    travel_payments: [],
    gift_count: 0,
    travel_count: 0,
    needs_manual_review: ['individual_gift_rows'],
    source_url: ethics,
  };

  const lobbying_records = cfg.sources.lobbying
    ? {
        status: 'no_official_target_specific_lobbying_records_found',
        rows: [],
        row_count: 0,
        note: 'State lobbyist registries publish registrations; Governor-target meeting rows are not exposed in this automated sync.',
        portal: cfg.sources.lobbying,
        source_url: cfg.sources.lobbying,
      }
    : {
        status: 'no_official_target_specific_lobbying_records_found',
        rows: [],
        row_count: 0,
        note: 'No separate state lobbying register URL configured for automated Governor-target rows.',
        source_url: ethics,
      };

  const stock_holdings = {
    status: 'official_framework',
    rows: [],
    row_count: 0,
    disclosure_note: FRAMEWORK_NOTE,
    needs_manual_review: ['stock_tickers', 'purchase_amounts'],
    source_url: ethics,
  };

  return { financial_disclosure, gifts_hospitality, lobbying_records, stock_holdings };
}

async function probeEthicsPortal(cfg) {
  const urls = [
    cfg.sources.ethics_search,
    cfg.sources.ethics,
    cfg.sources.ethics_pfs,
    cfg.sources.ethics_commission,
  ].filter(Boolean);

  for (const url of urls) {
    try {
      const html = await fetchText(url, 1500000);
      const lower = html.slice(0, 2000).toLowerCase();
      if (/404 not found|page not found|error display|resource not found/i.test(lower)) {
        continue;
      }
      if (/not available online|open records request|requires login|sign in/i.test(html)) {
        return {
          status: 'no_public_endpoint',
          note: stripHtml(
            html.match(/not available online[\s\S]{0,200}/i)?.[0] ||
              html.match(/open records request[\s\S]{0,200}/i)?.[0] ||
              'Official portal indicates disclosures are not published online for automated download.',
          ).slice(0, 280),
          source_url: url,
        };
      }
      if (/data-bind=|__NEXT_DATA__|drupal-settings-json|knockout/i.test(html)) {
        return {
          status: 'needs_manual_review',
          note: 'Official disclosure portal renders results client-side (JS); individual filing rows require manual browser review.',
          source_url: url,
        };
      }
      const pdfCount = (html.match(/\.pdf/gi) || []).length;
      if (pdfCount > 0) {
        return {
          status: 'official_bulk_register_pdf',
          note: `${pdfCount} official PDF link(s) on portal; Governor-specific statement requires manual open.`,
          source_url: url,
        };
      }
      return {
        status: 'official_framework',
        note: FRAMEWORK_NOTE,
        source_url: url,
      };
    } catch (err) {
      if (/fetch failed|ECONNREFUSED|ETIMEDOUT|403|503/i.test(err.message)) {
        return {
          status: 'source_blocked',
          note: `Official ethics portal unreachable from automated fetch: ${trim(err.message)}`,
          source_url: url,
        };
      }
    }
  }

  return {
    status: 'no_official_records_found',
    note: 'No machine-readable financial disclosure endpoint found at configured official URLs.',
    source_url: cfg.sources.ethics || cfg.sources.governor || '',
  };
}

async function fetchFinancialDisclosure(cfg) {
  if (cfg.disclosure_strategy === 'pending_batch') {
    return {
      financial_disclosure: {
        status: 'pending_batch',
        filing_status_note: 'State not yet configured for automated disclosure fetch.',
        source_url: cfg.sources.governor || '',
      },
      declared_assets: {
        status: 'pending_batch',
        rows: [],
        row_count: 0,
        source_url: cfg.sources.governor || '',
      },
    };
  }

  const probe = await probeEthicsPortal(cfg);
  const frameworks = buildFrameworkBlocks(cfg);
  const financial_disclosure = {
    ...frameworks.financial_disclosure,
    status: probe.status,
    filing_status_note: probe.note,
    portal_note: probe.note,
    data_status: probe.status,
    source_url: probe.source_url,
  };

  const declared_assets = {
    status: probe.status,
    rows: [],
    row_count: 0,
    disclosure_note: probe.note,
    source_url: probe.source_url,
  };

  if (cfg.disclosure_strategy === 'tx_tec_no_public_pfs') {
    financial_disclosure.regulatory_framework =
      'Texas Government Code Chapter 572 — Personal Financial Statement (PFS-TEC)';
    financial_disclosure.filing_status_note =
      'Texas Ethics Commission states PFS statements are not available online; copies require an Open Records Request.';
    financial_disclosure.status = 'no_public_endpoint';
    declared_assets.status = 'no_public_endpoint';
    declared_assets.disclosure_note = financial_disclosure.filing_status_note;
  }

  if (cfg.disclosure_strategy === 'ga_recordsearch') {
    financial_disclosure.filing_status_note =
      'Georgia recordsearch.ethics.ga.gov publishes financial disclosures behind login; media.ethics.ga.gov name search is interactive.';
    financial_disclosure.status = 'needs_manual_review';
    declared_assets.status = 'needs_manual_review';
    declared_assets.disclosure_note = financial_disclosure.filing_status_note;
  }

  if (cfg.disclosure_strategy === 'az_blocked') {
    financial_disclosure.status = 'source_blocked';
    financial_disclosure.filing_status_note =
      cfg.blocked_notes?.[0] || 'Official Arizona portals blocked from automated fetch.';
    declared_assets.status = 'source_blocked';
    declared_assets.disclosure_note = financial_disclosure.filing_status_note;
  }

  return { financial_disclosure, declared_assets, sourceUrl: probe.source_url };
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

async function fetchNyPressActivity(cfg) {
  const html = await fetchText(cfg.sources.newsroom, 800000);
  const items = [...html.matchAll(/href="(\/news\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)]
    .filter((m) => cfg.leader_match.test(`${stripHtml(m[2])} ${m[1]}`))
    .slice(0, 8)
    .map((m) => ({
      title: stripHtml(m[2]),
      date: '',
      url: absUrl(cfg.sources.newsroom, m[1]),
      excerpt: '',
      source_url: absUrl(cfg.sources.newsroom, m[1]),
    }));
  if (!items.length) return null;
  return { items, sourceUrl: cfg.sources.newsroom };
}

async function fetchFlPressActivity(cfg) {
  const html = await fetchText(cfg.sources.newsroom, 800000);
  const items = [...html.matchAll(/href="(\/eog\/news\/press\/[^"]+)"/gi)]
    .slice(0, 8)
    .map((m) => {
      const url = absUrl('https://www.flgov.com', m[1]);
      const slug = m[1].split('/').pop() || '';
      const title = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      return {
        title,
        date: (m[1].match(/\/press\/(\d{4})\//) || [])[1] || '',
        url,
        excerpt: '',
        source_url: url,
      };
    })
    .filter((it) => cfg.leader_match.test(`${it.title} ${it.url}`));
  if (!items.length) return null;
  return { items, sourceUrl: cfg.sources.newsroom };
}

async function fetchIlPrezlyActivity(cfg) {
  const html = await fetchText(cfg.sources.newsroom || cfg.sources.governor, 800000);
  const items = [...html.matchAll(/href="(https:\/\/gov-pritzker-newsroom\.prezly\.com[^"]+)"/gi)]
    .slice(0, 8)
    .map((m) => ({
      title: m[1].split('/').pop().replace(/-/g, ' '),
      date: '',
      url: m[1],
      excerpt: '',
      source_url: m[1],
    }));
  if (!items.length) return null;
  return { items, sourceUrl: cfg.sources.newsroom || cfg.sources.governor };
}

async function fetchNjGovNews(cfg) {
  const html = await fetchText(cfg.sources.governor, 800000);
  const seen = new Set();
  const items = [];
  for (const m of html.matchAll(/href="(\/governor\/news\/[^"]+)"/gi)) {
    const path = m[1];
    if (!/\/20(25|26)\/approved\//.test(path)) continue;
    const key = path.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    items.push({
      title: path.split('/').pop().replace(/\.shtml$/i, ''),
      date: (path.match(/\/(20\d{2})\//) || [])[1] || '',
      url: absUrl('https://www.nj.gov', path),
      excerpt: '',
      source_url: absUrl('https://www.nj.gov', path),
    });
    if (items.length >= 8) break;
  }
  if (!items.length) return null;
  return { items, sourceUrl: cfg.sources.governor };
}

async function fetchMassGovNews(cfg) {
  const html = await fetchText(cfg.sources.newsroom || cfg.sources.governor, 800000);
  const items = [...html.matchAll(/href="(https:\/\/www\.mass\.gov\/news\/[^"]+)"/gi)]
    .slice(0, 8)
    .map((m) => ({
      title: m[1].split('/').pop().replace(/-/g, ' '),
      date: '',
      url: m[1],
      excerpt: '',
      source_url: m[1],
    }))
    .filter((it) => cfg.leader_match.test(`${it.title} ${it.url}`));
  if (!items.length) return null;
  return { items, sourceUrl: cfg.sources.newsroom || cfg.sources.governor };
}

async function fetchTnGovNews(cfg) {
  const urls = [cfg.sources.newsroom, cfg.sources.governor].filter(Boolean);
  for (const url of urls) {
    try {
      const html = await fetchText(url, 800000);
      const items = [...html.matchAll(/href="([^"]+)"/gi)]
        .map((m) => m[1])
        .filter((href) => /\/governor\/(news|sots)[^"]*(2025|2026|\.html)/i.test(href))
        .slice(0, 8)
        .map((href) => ({
          title: href.split('/').pop().replace(/-/g, ' '),
          date: (href.match(/(20\d{2})/) || [])[1] || '',
          url: absUrl('https://www.tn.gov', href),
          excerpt: '',
          source_url: absUrl('https://www.tn.gov', href),
        }));
      if (items.length) return { items, sourceUrl: url };
    } catch {
      // try next
    }
  }
  return null;
}

async function fetchVaNewsReleases(cfg) {
  const html = await fetchText(cfg.sources.newsroom, 800000);
  const items = parsePressLinksFromHtml(html, 'https://www.governor.virginia.gov', {
    limit: 8,
    titleFilter: (title, href) => cfg.leader_match.test(`${title} ${href}`),
  });
  if (!items.length) return null;
  return {
    items: items.map((it) => ({
      title: it.title,
      date: it.date || '',
      url: it.url,
      excerpt: it.excerpt || '',
      source_url: it.url,
    })),
    sourceUrl: cfg.sources.newsroom,
  };
}

async function fetchWaNewsReleases(cfg) {
  const html = await fetchText(cfg.sources.newsroom, 800000);
  const items = [...html.matchAll(/href="(https:\/\/governor\.wa\.gov\/news\/[^"]+|\/news\/[^"]+)"/gi)]
    .slice(0, 8)
    .map((m) => ({
      title: m[1].split('/').pop().replace(/-/g, ' '),
      date: '',
      url: absUrl('https://www.governor.wa.gov', m[1]),
      excerpt: '',
      source_url: absUrl('https://www.governor.wa.gov', m[1]),
    }))
    .filter((it) => cfg.leader_match.test(`${it.title} ${it.url}`));
  if (!items.length) return null;
  return { items, sourceUrl: cfg.sources.newsroom };
}

async function fetchOhPortalNews(cfg) {
  const html = await fetchText(cfg.sources.newsroom, 800000);
  const items = [...html.matchAll(/href="(https:\/\/governor\.ohio\.gov[^"]*media\/news[^"]*)"/gi)]
    .slice(0, 8)
    .map((m) => ({
      title: 'Ohio Governor news release',
      date: '',
      url: m[1],
      excerpt: '',
      source_url: m[1],
    }));
  if (!items.length) return fetchHtmlNewsActivity(cfg);
  return { items, sourceUrl: cfg.sources.newsroom };
}

async function fetchHtmlNewsActivity(cfg) {
  const urls = [cfg.sources.newsroom, cfg.sources.newsroom_alt, cfg.sources.governor].filter(Boolean);
  for (const url of urls) {
    try {
      const html = await fetchText(url, 800000);
      const items = parsePressLinksFromHtml(html, url, {
        limit: 8,
        titleFilter: (title, href) => cfg.leader_match.test(`${title} ${href}`),
      });
      if (items.length) {
        return {
          items: items.map((it) => ({
            title: it.title,
            date: it.date || '',
            url: it.url,
            excerpt: it.excerpt || '',
            source_url: it.url,
          })),
          sourceUrl: url,
        };
      }
    } catch {
      // try next
    }
  }
  return null;
}

async function fetchRecentActivity(cfg) {
  switch (cfg.news_strategy) {
    case 'rss':
      return fetchRssActivity(cfg);
    case 'ny_press_paths':
      return fetchNyPressActivity(cfg);
    case 'fl_press_paths':
      return fetchFlPressActivity(cfg);
    case 'il_prezly_links':
      return fetchIlPrezlyActivity(cfg);
    case 'html_newsroom':
      return fetchHtmlNewsActivity(cfg);
    case 'nj_gov_news':
      return fetchNjGovNews(cfg);
    case 'mass_gov_news':
      return fetchMassGovNews(cfg);
    case 'tn_gov_news':
      return fetchTnGovNews(cfg);
    case 'va_news_releases':
      return fetchVaNewsReleases(cfg);
    case 'wa_news_releases':
      return fetchWaNewsReleases(cfg);
    case 'oh_portal_news':
      return fetchOhPortalNews(cfg);
    default:
      return fetchHtmlNewsActivity(cfg);
  }
}

async function fetchContactInfo(cfg) {
  const url = cfg.sources.governor;
  if (!url) return null;
  try {
    const html = await fetchText(url, 800000);
    const phone =
      html.match(/\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}/)?.[0] ||
      html.match(/\d{3}-\d{3}-\d{4}/)?.[0] ||
      '';
    const emailMatch = html.match(/mailto:([^"'>\s]+)/i);
    return {
      contact_info: {
        office: cfg.regulatory_body || 'Office of the Governor',
        phone: phone || NOT_DISCLOSED,
        email: emailMatch ? emailMatch[1].replace(/&#64;/g, '@') : NOT_DISCLOSED,
        website: url,
        source_url: url,
      },
      sourceUrl: url,
    };
  } catch {
    return null;
  }
}

function isLikelyOfficeAggregateRow(name) {
  const t = String(name || '');
  if (t.length > 120) return true;
  if (/search|committee name|contains committee|all other than candidate|political action committee \(formerly/i.test(t)) {
    return true;
  }
  if (/^(STATE|COUNTY|CITY|MUNICIPAL)\s+(SENATOR|REPRESENTATIVE|COUNCIL|JUDGE|JUSTICE|EXECUTIVE|GOVERNOR)/i.test(t)) {
    return true;
  }
  if (/LEG DISTRICT|SUPREME COURT|HOUSE| - SENATE$/i.test(t)) return true;
  return false;
}

async function fetchCampaignFinancePortal(cfg) {
  const url = cfg.sources.campaign_finance || cfg.sources.elections;
  if (!url || cfg.campaign_strategy === 'pending_batch') return null;
  try {
    const html = await fetchText(url, 800000);
    if (/404|error display|page not found/i.test(html.slice(0, 1500))) return null;
    const tables = parseHtmlTables(html);
    const items = [];
    for (const table of tables) {
      if (table.length < 2) continue;
      const header = table[0].map((c) => c.toLowerCase());
      if (!header.some((h) => /contributor|donor|name|amount/.test(h))) continue;
      const nameI = header.findIndex((h) => /contributor|donor|name|vendor/.test(h));
      const amtI = header.findIndex((h) => /amount/.test(h));
      for (const row of table.slice(1)) {
        const name = trim(row[nameI >= 0 ? nameI : 0]);
        const amountText = amtI >= 0 ? trim(row[amtI]) : '';
        if (!name || /^no records/i.test(name) || isLikelyOfficeAggregateRow(name)) continue;
        items.push({
          name,
          contributor: name,
          amount_text: amountText || NOT_DISCLOSED,
          source_url: url,
        });
        if (items.length >= 12) break;
      }
      if (items.length) break;
    }
    const summaryMatch = stripHtml(html).match(/found contributions totaling \$[\d,]+\.\d{2}/i);
    if (!items.length && !summaryMatch) {
      return {
        campaign_finance: {
          status: 'needs_manual_review',
          summary: 'Official campaign finance portal reachable; Governor-specific contribution rows require interactive search.',
          items: [],
          row_count: 0,
          portal: url,
          source_url: url,
        },
        sourceUrl: url,
      };
    }
    return {
      campaign_finance: {
        status: items.length ? 'filed' : 'needs_manual_review',
        summary:
          summaryMatch?.[0] ||
          `${items.length} sample row(s) from official elections portal (if any returned).`,
        items,
        row_count: items.length,
        portal: url,
        source_url: url,
      },
      sourceUrl: url,
    };
  } catch (err) {
    return {
      campaign_finance: {
        status: 'source_blocked',
        summary: trim(err.message),
        items: [],
        row_count: 0,
        portal: url,
        source_url: url,
      },
      sourceUrl: url,
    };
  }
}

async function buildLeaderTransparency(jurisdictionId) {
  const cfg = getStateConfig(jurisdictionId);
  if (!cfg) throw new Error(`Unknown US state id: ${jurisdictionId}`);
  if (cfg.disclosure_strategy === 'pending_batch') {
    throw new Error(`${jurisdictionId} is not configured for automated fetch yet (pending batch).`);
  }

  const verified = {};
  const partial = {};
  const sources_confirmed = [];
  const sources_inaccessible = [...(cfg.blocked_notes || [])];

  const frameworks = buildFrameworkBlocks(cfg);
  partial.gifts_hospitality = frameworks.gifts_hospitality;
  partial.lobbying_records = frameworks.lobbying_records;
  partial.stock_holdings = frameworks.stock_holdings;
  verified.gifts_hospitality = frameworks.gifts_hospitality.source_url;
  verified.lobbying_records = frameworks.lobbying_records.source_url;
  verified.stock_holdings = frameworks.stock_holdings.source_url;

  try {
    const disc = await fetchFinancialDisclosure(cfg);
    if (disc?.financial_disclosure) {
      partial.financial_disclosure = disc.financial_disclosure;
      partial.declared_assets = disc.declared_assets;
      verified.financial_disclosure = disc.sourceUrl;
      verified.declared_assets = disc.sourceUrl;
      sources_confirmed.push(disc.sourceUrl);
    }
  } catch (err) {
    partial.financial_disclosure_error = trim(err.message);
    sources_inaccessible.push(trim(err.message));
  }

  try {
    const finance = await fetchCampaignFinancePortal(cfg);
    if (finance?.campaign_finance) {
      partial.campaign_finance = finance.campaign_finance;
      verified.campaign_finance = finance.sourceUrl;
      if (finance.campaign_finance.status === 'source_blocked') {
        sources_inaccessible.push(finance.sourceUrl);
      } else {
        sources_confirmed.push(finance.sourceUrl);
      }
    }
  } catch (err) {
    partial.campaign_finance_error = trim(err.message);
  }

  try {
    const activity = await fetchRecentActivity(cfg);
    if (activity?.items?.length) {
      partial.recent_official_activity = activity.items;
      verified.recent_official_activity = activity.sourceUrl;
      sources_confirmed.push(activity.sourceUrl);
    }
  } catch (err) {
    partial.recent_official_activity_error = trim(err.message);
  }

  try {
    const contact = await fetchContactInfo(cfg);
    if (contact?.contact_info) {
      partial.contact_info = contact.contact_info;
      verified.contact_info = contact.sourceUrl;
      sources_confirmed.push(contact.sourceUrl);
    }
  } catch (err) {
    partial.contact_info_error = trim(err.message);
  }

  partial.data_completeness_note = `Official ${jurisdictionId} sources only (${cfg.regulatory_body}, state ethics/elections portals, governor newsroom). No Wikipedia, news media aggregators, or estimated net worth. Financial disclosure values are official ranges where published; otherwise marked not disclosed or requiring manual review.`;
  partial.regulatory_act = cfg.regulatory_act;
  partial.regulatory_body = cfg.regulatory_body;
  if (sources_confirmed.length) partial.sources_confirmed = [...new Set(sources_confirmed)];
  if (sources_inaccessible.length) partial.sources_inaccessible = [...new Set(sources_inaccessible)];

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
    SOURCES: getStateConfig(jurisdictionId)?.sources || {},
  };
}

module.exports = {
  PHASE1_IDS,
  BATCH2_IDS,
  CONFIGURED_US_STATE_IDS,
  buildLeaderTransparency,
  createModule,
};
