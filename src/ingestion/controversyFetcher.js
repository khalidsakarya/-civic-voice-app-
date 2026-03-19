/**
 * Media & Controversy Tracker
 *
 * Searches recent news for scandals, corruption allegations, broken promises,
 * and mismanagement stories about each leader, cabinet minister, government
 * department, and political party. Runs results through Claude AI for neutral
 * analysis and saves to Firestore collection "controversies".
 *
 * News sources (tried in order per query)
 * ────────────────────────────────────────
 *   Primary   : NewsAPI.org            (REACT_APP_NEWS_API_KEY)
 *   Secondary  : GNews API             (REACT_APP_GNEWS_API_KEY)
 *   Free fallback: The Guardian API   (open access, no key required)
 *   RSS fallback : BBC / Reuters RSS   (parsed via rss2json public service)
 *
 * Search query types (per country)
 * ─────────────────────────────────
 *   1. PM/President name + "scandal OR controversy"
 *   2. Cabinet minister name + "expenses OR corruption"
 *   3. Government department + "waste OR mismanagement"
 *   4. Political party name + "broken promise"
 *
 * Claude AI output per article
 * ─────────────────────────────
 *   • Neutral plain-language summary (2–3 sentences)
 *   • Controversy score 1–10
 *   • Category: Financial | Ethical | Policy | Legal | Personal
 *   • Verified severity: Minor | Moderate | Serious | Critical
 *
 * Controversy Score per leader (0–100, saved separately)
 * ────────────────────────────────────────────────────────
 *   Weighted aggregate of article scores for that person.
 *
 * Environment variables
 * ──────────────────────
 *   REACT_APP_NEWS_API_KEY     — NewsAPI.org key  (newsapi.org/register)
 *   REACT_APP_GNEWS_API_KEY    — GNews.io key     (gnews.io)
 *   REACT_APP_ANTHROPIC_API_KEY — Claude Haiku for AI analysis
 *
 * Usage
 * ─────
 *   import { runControversyFetcher } from './ingestion/controversyFetcher.js';
 *   await runControversyFetcher();            // all 4 countries
 *   await runControversyFetcher(['CA','UK']); // subset
 */

import { db } from '../firebase.js';
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  deleteDoc,
} from 'firebase/firestore';

// ─── Config ───────────────────────────────────────────────────────────────────

const NEWS_API_KEY   = process.env.REACT_APP_NEWS_API_KEY    || '';
const GNEWS_API_KEY  = process.env.REACT_APP_GNEWS_API_KEY   || '';
const ANTHROPIC_KEY  = process.env.REACT_APP_ANTHROPIC_API_KEY || '';
const CLAUDE_MODEL   = 'claude-haiku-4-5-20251001';
const CLAUDE_URL     = 'https://api.anthropic.com/v1/messages';

// Articles per search query (kept low to control Claude costs)
const ARTICLES_PER_QUERY = 3;
// Maximum total articles stored per country
const MAX_ARTICLES_PER_COUNTRY = 60;

// Lookback window for news search (days)
const LOOKBACK_DAYS = 90;

function isoFrom(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

// ─── Country profiles ─────────────────────────────────────────────────────────
// All leaders, key ministers, departments, and parties per country.
// Used to build the four search query types.

export const COUNTRY_PROFILES = {
  CA: {
    name:    'Canada',
    leader:  'Mark Carney',
    party:   'Liberal Party of Canada',
    ministers: [
      { name: 'Dominic LeBlanc',   portfolio: 'Public Safety' },
      { name: 'Mark Holland',       portfolio: 'Health' },
      { name: 'Mélanie Joly',       portfolio: 'Foreign Affairs' },
      { name: 'Sean Fraser',        portfolio: 'Housing' },
      { name: 'François-Philippe Champagne', portfolio: 'Finance' },
      { name: 'Bill Blair',         portfolio: 'Treasury Board' },
    ],
    departments: [
      'Department of National Defence',
      'Immigration Canada',
      'Canada Revenue Agency',
      'Public Works Canada',
      'Department of Health Canada',
    ],
  },

  US: {
    name:    'United States',
    leader:  'Donald Trump',
    party:   'Republican Party',
    ministers: [
      { name: 'Scott Bessent',        portfolio: 'Treasury' },
      { name: 'Marco Rubio',          portfolio: 'State Department' },
      { name: 'Pete Hegseth',         portfolio: 'Defense' },
      { name: 'Robert F. Kennedy Jr', portfolio: 'Health and Human Services' },
      { name: 'Tulsi Gabbard',        portfolio: 'Director of National Intelligence' },
      { name: 'Pam Bondi',            portfolio: 'Attorney General' },
    ],
    departments: [
      'Department of Defense',
      'Department of Veterans Affairs',
      'Department of Homeland Security',
      'FEMA',
      'Department of Education',
    ],
  },

  UK: {
    name:    'United Kingdom',
    leader:  'Keir Starmer',
    party:   'Labour Party',
    ministers: [
      { name: 'Rachel Reeves',   portfolio: 'Chancellor of the Exchequer' },
      { name: 'David Lammy',    portfolio: 'Foreign Secretary' },
      { name: 'Yvette Cooper',  portfolio: 'Home Secretary' },
      { name: 'Wes Streeting',  portfolio: 'Health Secretary' },
      { name: 'Angela Rayner',  portfolio: 'Deputy Prime Minister' },
      { name: 'Pat McFadden',   portfolio: 'Cabinet Office' },
    ],
    departments: [
      'Home Office',
      'Ministry of Defence',
      'HMRC',
      'Department for Work and Pensions',
      'NHS England',
    ],
  },

  AU: {
    name:    'Australia',
    leader:  'Anthony Albanese',
    party:   'Australian Labor Party',
    ministers: [
      { name: 'Jim Chalmers',   portfolio: 'Treasury' },
      { name: 'Penny Wong',     portfolio: 'Foreign Affairs' },
      { name: 'Mark Dreyfus',   portfolio: 'Attorney-General' },
      { name: 'Chris Bowen',    portfolio: 'Climate and Energy' },
      { name: 'Clare O\'Neil',  portfolio: 'Home Affairs' },
      { name: 'Richard Marles', portfolio: 'Defence' },
    ],
    departments: [
      'Department of Defence',
      'Australian Taxation Office',
      'Department of Home Affairs',
      'Services Australia',
      'Department of Finance',
    ],
  },
};

// ─── Query builder ────────────────────────────────────────────────────────────

/**
 * Build all search queries for a country.
 * Returns an array of { queryString, personInvolved, queryType, department, party }
 */
function buildQueries(countryCode) {
  const profile = COUNTRY_PROFILES[countryCode];
  if (!profile) return [];

  const queries = [];

  // Type 1: PM/President name + scandal or controversy
  queries.push({
    queryString:    `"${profile.leader}" scandal OR controversy`,
    personInvolved: profile.leader,
    queryType:      'leader_scandal',
    department:     null,
    party:          null,
  });

  // Type 2: Each cabinet minister + expenses or corruption
  for (const minister of profile.ministers) {
    queries.push({
      queryString:    `"${minister.name}" expenses OR corruption OR scandal`,
      personInvolved: minister.name,
      queryType:      'minister_expenses',
      department:     minister.portfolio,
      party:          null,
    });
  }

  // Type 3: Government department + waste or mismanagement
  for (const dept of profile.departments) {
    queries.push({
      queryString:    `"${dept}" waste OR mismanagement OR fraud`,
      personInvolved: null,
      queryType:      'department_waste',
      department:     dept,
      party:          null,
    });
  }

  // Type 4: Political party + broken promise
  queries.push({
    queryString:    `"${profile.party}" "broken promise" OR "failed to deliver" OR U-turn`,
    personInvolved: profile.leader,
    queryType:      'party_promise',
    department:     null,
    party:          profile.party,
  });

  return queries;
}

// ─── News API fetchers ────────────────────────────────────────────────────────

async function tryNewsAPI(queryString) {
  if (!NEWS_API_KEY) return [];
  const from = isoFrom(LOOKBACK_DAYS);
  const url  = `https://newsapi.org/v2/everything?` +
    `q=${encodeURIComponent(queryString)}` +
    `&language=en&sortBy=publishedAt&from=${from}` +
    `&pageSize=${ARTICLES_PER_QUERY}&apiKey=${NEWS_API_KEY}`;
  try {
    const res  = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`NewsAPI ${res.status}`);
    const data = await res.json();
    return (data.articles ?? []).map((a) => ({
      headline:    a.title        ?? '',
      source:      a.source?.name ?? 'Unknown',
      url:         a.url          ?? '',
      date:        a.publishedAt  ? a.publishedAt.split('T')[0] : null,
      description: a.description  ?? a.content ?? '',
    }));
  } catch (e) {
    console.warn('[controversy] NewsAPI failed:', e.message);
    return [];
  }
}

async function tryGNews(queryString) {
  if (!GNEWS_API_KEY) return [];
  const from = new Date();
  from.setDate(from.getDate() - LOOKBACK_DAYS);
  const fromStr = from.toISOString();
  const url = `https://gnews.io/api/v4/search?` +
    `q=${encodeURIComponent(queryString)}` +
    `&lang=en&max=${ARTICLES_PER_QUERY}&from=${fromStr}&token=${GNEWS_API_KEY}`;
  try {
    const res  = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`GNews ${res.status}`);
    const data = await res.json();
    return (data.articles ?? []).map((a) => ({
      headline:    a.title       ?? '',
      source:      a.source?.name ?? 'Unknown',
      url:         a.url          ?? '',
      date:        a.publishedAt  ? a.publishedAt.split('T')[0] : null,
      description: a.description  ?? '',
    }));
  } catch (e) {
    console.warn('[controversy] GNews failed:', e.message);
    return [];
  }
}

async function tryGuardian(queryString) {
  // The Guardian open API — works without a paid key using 'test' key (limited quota)
  const url = `https://content.guardianapis.com/search?` +
    `q=${encodeURIComponent(queryString)}` +
    `&api-key=test&show-fields=headline,trailText,byline` +
    `&page-size=${ARTICLES_PER_QUERY}&order-by=newest` +
    `&from-date=${isoFrom(LOOKBACK_DAYS)}`;
  try {
    const res  = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`Guardian ${res.status}`);
    const data = await res.json();
    return (data?.response?.results ?? []).map((a) => ({
      headline:    a.fields?.headline ?? a.webTitle ?? '',
      source:      'The Guardian',
      url:         a.webUrl           ?? '',
      date:        a.webPublicationDate ? a.webPublicationDate.split('T')[0] : null,
      description: a.fields?.trailText ?? '',
    }));
  } catch (e) {
    console.warn('[controversy] Guardian API failed:', e.message);
    return [];
  }
}

async function tryRSSFallback(queryString, countryCode) {
  // Route through rss2json to parse BBC/Reuters RSS without CORS issues
  const rssFeeds = {
    CA: 'https://www.cbc.ca/cmlink/rss-politics',
    US: 'https://feeds.reuters.com/Reuters/PoliticsNews',
    UK: 'http://feeds.bbci.co.uk/news/politics/rss.xml',
    AU: 'https://www.abc.net.au/news/feed/51120/rss.xml',
  };
  const feed = rssFeeds[countryCode];
  if (!feed) return [];
  try {
    const url  = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed)}&count=20`;
    const res  = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`RSS2JSON ${res.status}`);
    const data = await res.json();
    const keywords = queryString.toLowerCase().split(/\s+OR\s+|\s+AND\s+|\s+/).filter((w) => w.length > 3);
    return (data.items ?? [])
      .filter((item) => {
        const text = `${item.title} ${item.description}`.toLowerCase();
        return keywords.some((kw) => text.includes(kw.replace(/"/g, '')));
      })
      .slice(0, ARTICLES_PER_QUERY)
      .map((item) => ({
        headline:    item.title       ?? '',
        source:      data.feed?.title ?? 'RSS Feed',
        url:         item.link        ?? '',
        date:        item.pubDate     ? new Date(item.pubDate).toISOString().split('T')[0] : null,
        description: item.description?.replace(/<[^>]+>/g, '').slice(0, 500) ?? '',
      }));
  } catch (e) {
    console.warn('[controversy] RSS fallback failed:', e.message);
    return [];
  }
}

/**
 * Search all available news sources for a query.
 * Returns deduplicated article array from the first source that has results.
 */
async function searchNews(queryString, countryCode) {
  // Try each source in priority order; stop once we have results
  let articles = await tryNewsAPI(queryString);
  if (!articles.length) articles = await tryGNews(queryString);
  if (!articles.length) articles = await tryGuardian(queryString);
  if (!articles.length) articles = await tryRSSFallback(queryString, countryCode);

  // Filter out empty/missing headlines
  return articles.filter((a) => a.headline && a.headline.length > 5);
}

// ─── Controversy keyword pre-screener ─────────────────────────────────────────
// Fast rule-based check before spending Claude tokens.

const CONTROVERSY_SIGNALS = [
  'scandal', 'corrupt', 'allegation', 'misconduct', 'fraud', 'bribery',
  'resign', 'fired', 'sacked', 'investigation', 'probe', 'inquiry',
  'waste', 'mismanag', 'incompetent', 'failure', 'broken promise',
  'conflict of interest', 'nepotism', 'cronyism', 'expense', 'lavish',
  'cover.up', 'lie', 'mislead', 'u.turn', 'backtrack', 'protest',
  'arrested', 'charged', 'indicted', 'lawsuit', 'breached', 'violated',
  'overrun', 'delayed', 'cancelled', 'taxpayer', 'accountability',
];

function hasControversySignal(article) {
  const text = `${article.headline} ${article.description}`.toLowerCase();
  return CONTROVERSY_SIGNALS.some((sig) => text.includes(sig));
}

// ─── Claude AI analysis ───────────────────────────────────────────────────────

const CONTROVERSY_CATEGORIES = ['Financial', 'Ethical', 'Policy', 'Legal', 'Personal'];
const SEVERITY_LABELS        = ['Minor', 'Moderate', 'Serious', 'Critical'];

async function analyseWithClaude(article, queryMeta) {
  if (!ANTHROPIC_KEY) return buildFallbackAnalysis(article, queryMeta);

  const prompt = `You are a neutral government accountability journalist. Analyse the following news article about a government official or department and respond with ONLY a JSON object — no markdown, no commentary outside the JSON.

Article:
  Headline: ${article.headline}
  Source: ${article.source}
  Date: ${article.date ?? 'Unknown'}
  Description: ${article.description || '(no description available)'}
  Person involved: ${queryMeta.personInvolved ?? 'Not specified'}
  Department/Context: ${queryMeta.department ?? queryMeta.party ?? 'Not specified'}
  Search query type: ${queryMeta.queryType}

Your task:
1. Determine if this article describes a genuine controversy, scandal, or government accountability issue.
2. If yes, categorise and score it. If no, still respond but set "isControversy": false.

Category definitions:
  Financial — misuse of public funds, expense fraud, procurement irregularities, financial misconduct
  Ethical   — conflicts of interest, nepotism, misleading statements, abuse of power
  Policy    — broken promises, failed policies, U-turns, poor governance outcomes
  Legal     — arrests, charges, investigations, lawsuits, regulatory breaches
  Personal  — personal conduct unrelated to official duties but affecting public trust

Controversy score (1–10):
  1–2: Minor issue, procedural or administrative
  3–4: Noteworthy but limited public impact
  5–6: Significant — demands explanation or accountability
  7–8: Serious — public trust substantially damaged
  9–10: Critical — resignation-level or criminal conduct alleged

Severity:
  Minor | Moderate | Serious | Critical

Respond with EXACTLY this JSON:
{
  "isControversy": true|false,
  "summary": "2-3 neutral sentences summarising what happened and why it matters",
  "controversyScore": <1-10 integer>,
  "category": "Financial"|"Ethical"|"Policy"|"Legal"|"Personal",
  "severity": "Minor"|"Moderate"|"Serious"|"Critical",
  "personInvolved": "Most relevant name from the article, or null",
  "keyFact": "The single most important fact from this article in one short sentence"
}`;

  try {
    const res = await fetch(CLAUDE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-calls': 'true',
      },
      body: JSON.stringify({
        model:      CLAUDE_MODEL,
        max_tokens: 350,
        messages:   [{ role: 'user', content: prompt }],
      }),
    });

    if (!res.ok) throw new Error(`Claude API ${res.status}`);
    const data  = await res.json();
    const text  = data?.content?.[0]?.text ?? '{}';
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('No JSON in Claude response');

    const ai = JSON.parse(match[0]);
    return {
      isControversy:    Boolean(ai.isControversy),
      summary:          ai.summary          ?? '',
      controversyScore: Math.max(1, Math.min(10, parseInt(ai.controversyScore, 10) || 3)),
      category:         CONTROVERSY_CATEGORIES.includes(ai.category) ? ai.category : 'Ethical',
      severity:         SEVERITY_LABELS.includes(ai.severity) ? ai.severity : 'Minor',
      personInvolved:   ai.personInvolved   ?? queryMeta.personInvolved ?? null,
      keyFact:          ai.keyFact          ?? '',
      analysedBy:       'claude-ai',
    };
  } catch (e) {
    console.warn(`[controversy] Claude failed for "${article.headline.slice(0, 50)}":`, e.message);
    return buildFallbackAnalysis(article, queryMeta);
  }
}

function buildFallbackAnalysis(article, queryMeta) {
  const text   = `${article.headline} ${article.description}`.toLowerCase();

  // Score estimate from keyword density
  const sigCount = CONTROVERSY_SIGNALS.filter((s) => text.includes(s)).length;
  const score    = Math.min(10, Math.max(1, sigCount * 2 + 1));

  // Category estimate
  let category = 'Policy';
  if (/fraud|brib|corrupt|money|fund|expense|financ/.test(text))   category = 'Financial';
  else if (/arrest|charge|indict|lawsuit|investigat|criminal/.test(text)) category = 'Legal';
  else if (/conflict|nepot|crony|mislead|lie|cover/.test(text))    category = 'Ethical';
  else if (/personal|affair|private|family|health/.test(text))      category = 'Personal';

  const severity = score >= 8 ? 'Critical' : score >= 6 ? 'Serious' : score >= 4 ? 'Moderate' : 'Minor';

  return {
    isControversy:    sigCount > 0,
    summary:          `${article.headline}. ${article.description?.slice(0, 200) ?? ''}`.trim(),
    controversyScore: score,
    category,
    severity,
    personInvolved:   queryMeta.personInvolved ?? null,
    keyFact:          article.headline,
    analysedBy:       'fallback-rules',
  };
}

// ─── Leader controversy score ─────────────────────────────────────────────────

/**
 * Calculate a 0–100 controversy score for a single leader/entity.
 * Weighted by article controversy scores — higher-scored articles count more.
 *
 * Score interpretation: 0 = no coverage / clean; 100 = constant serious allegations.
 */
function calcLeaderControversyScore(articles) {
  if (!articles.length) return { score: 0, label: 'No coverage', articleCount: 0 };

  const controversy = articles.filter((a) => a.isControversy);
  if (!controversy.length) return { score: 0, label: 'Clean', articleCount: articles.length };

  // Weighted average of controversyScore (1–10), then scale to 0–100
  const totalWeight  = controversy.reduce((s, a) => s + a.controversyScore, 0);
  const weightedAvg  = totalWeight / controversy.length;
  const exposureMult = Math.min(2, controversy.length / 3); // more articles = higher exposure
  const score        = Math.round(Math.min(100, weightedAvg * 10 * exposureMult));

  const label =
    score >= 80 ? 'Under heavy scrutiny' :
    score >= 60 ? 'Significant controversy' :
    score >= 40 ? 'Moderate controversy' :
    score >= 20 ? 'Minor controversy' :
                  'Limited controversy';

  const categoryBreakdown = CONTROVERSY_CATEGORIES.reduce((acc, cat) => {
    acc[cat] = controversy.filter((a) => a.category === cat).length;
    return acc;
  }, {});

  const severityBreakdown = SEVERITY_LABELS.reduce((acc, sev) => {
    acc[sev] = controversy.filter((a) => a.severity === sev).length;
    return acc;
  }, {});

  return {
    score,
    label,
    articleCount:      articles.length,
    controversyCount:  controversy.length,
    categoryBreakdown,
    severityBreakdown,
    topScore:          Math.max(...controversy.map((a) => a.controversyScore)),
  };
}

// ─── Firestore persistence ────────────────────────────────────────────────────

function truncate(str, len = 500) {
  const s = String(str ?? '');
  return s.length > len ? s.slice(0, len - 1) + '…' : s;
}

async function saveControversies(articles, leaderScores, country) {
  const col = collection(db, 'controversies');

  // Clear stale docs for this country
  try {
    const stale = await getDocs(query(col, where('country', '==', country)));
    await Promise.all(stale.docs.map((d) => deleteDoc(d.ref)));
    console.log(`[controversy] Cleared ${stale.size} stale docs for ${country}`);
  } catch (e) {
    console.warn(`[controversy] Could not clear stale docs for ${country}:`, e.message);
  }

  let saved = 0, errors = 0;

  // Write article records
  await Promise.all(
    articles.map(async (a) => {
      try {
        await addDoc(col, {
          ...a,
          summary:     truncate(a.summary),
          description: truncate(a.description, 300),
          headline:    truncate(a.headline, 200),
          docType:     'article',
          country,
          createdAt:   serverTimestamp(),
        });
        saved++;
      } catch (e) {
        console.error('[controversy] Failed to save article:', a.url, e.message);
        errors++;
      }
    })
  );

  // Write per-leader controversy scores
  await Promise.all(
    leaderScores.map(async (ls) => {
      try {
        await addDoc(col, {
          ...ls,
          docType:   'leaderScore',
          country,
          createdAt: serverTimestamp(),
        });
        saved++;
      } catch (e) {
        console.error('[controversy] Failed to save leader score:', ls.personInvolved, e.message);
        errors++;
      }
    })
  );

  return { saved, errors };
}

// ─── Country fetcher map ──────────────────────────────────────────────────────

const COUNTRY_CODES = Object.keys(COUNTRY_PROFILES);

// ─── Per-country pipeline ─────────────────────────────────────────────────────

export async function fetchAndSaveCountry(countryCode) {
  const profile = COUNTRY_PROFILES[countryCode];
  if (!profile) throw new Error(`[controversy] Unknown country: ${countryCode}`);

  console.log(`[controversy] ── Starting ${countryCode} (${profile.name}) ────────`);

  const queries = buildQueries(countryCode);
  console.log(`[controversy] ${countryCode}: ${queries.length} search queries built`);

  // Check API availability
  if (!NEWS_API_KEY && !GNEWS_API_KEY) {
    console.warn(
      `[controversy] No NEWS_API_KEY or GNEWS_API_KEY set — using Guardian API + RSS fallback only.\n` +
      `             For best results add REACT_APP_NEWS_API_KEY to your .env file.`
    );
  }

  // Execute all queries — throttled to avoid rate limits
  const allArticles = [];
  const seenUrls    = new Set();

  for (const qMeta of queries) {
    if (allArticles.length >= MAX_ARTICLES_PER_COUNTRY) break;

    let results = [];
    try {
      results = await searchNews(qMeta.queryString, countryCode);
    } catch (e) {
      console.warn(`[controversy] Search failed for "${qMeta.queryString.slice(0, 60)}":`, e.message);
    }

    // Attach query metadata and deduplicate by URL
    for (const article of results) {
      const url = article.url || article.headline;
      if (seenUrls.has(url)) continue;
      seenUrls.add(url);

      // Only proceed if article passes controversy pre-screen or if Claude is available
      // (Claude can catch subtle controversies that keyword rules miss)
      if (!hasControversySignal(article) && !ANTHROPIC_KEY) continue;

      allArticles.push({ ...article, ...qMeta });
    }

    // Rate-limit: 300ms between API calls
    await new Promise((r) => setTimeout(r, 300));
  }

  console.log(`[controversy] ${countryCode}: ${allArticles.length} articles collected`);

  if (!allArticles.length) {
    console.warn(`[controversy] ${countryCode}: no articles found — check API keys`);
    return { country: countryCode, fetched: 0, controversies: 0, saved: 0, errors: 0 };
  }

  // Analyse each article with Claude (sequential to respect rate limits)
  const enriched = [];
  for (const article of allArticles.slice(0, MAX_ARTICLES_PER_COUNTRY)) {
    const analysis = await analyseWithClaude(article, {
      personInvolved: article.personInvolved,
      department:     article.department,
      party:          article.party,
      queryType:      article.queryType,
    });
    enriched.push({ ...article, ...analysis });
    if (ANTHROPIC_KEY) await new Promise((r) => setTimeout(r, 250));
  }

  const controversialArticles = enriched.filter((a) => a.isControversy);
  console.log(`[controversy] ${countryCode}: ${controversialArticles.length}/${enriched.length} articles classified as controversies`);

  // Log high-severity finds
  controversialArticles
    .filter((a) => a.controversyScore >= 7)
    .forEach((a) =>
      console.warn(
        `  🔴 [${a.category}/${a.severity}] Score ${a.controversyScore}/10: ${a.headline.slice(0, 80)}`
      )
    );

  // Calculate per-leader controversy scores
  const personNames = [...new Set(
    enriched.map((a) => a.personInvolved).filter(Boolean)
  )];

  const leaderScores = personNames.map((name) => {
    const personArticles = enriched.filter((a) => a.personInvolved === name);
    const scoreData      = calcLeaderControversyScore(personArticles);
    return {
      personInvolved: name,
      department:     personArticles[0]?.department ?? null,
      ...scoreData,
    };
  });

  // Also compute a country-level rollup
  const countryScore = calcLeaderControversyScore(controversialArticles);
  leaderScores.push({
    personInvolved:  `${profile.name} Government`,
    department:      'All Departments',
    isCountryRollup: true,
    ...countryScore,
  });

  // Persist
  const { saved, errors } = await saveControversies(enriched, leaderScores, countryCode);
  console.log(`[controversy] ${countryCode}: saved ${saved} docs (${errors} errors)`);

  return {
    country:        countryCode,
    fetched:        allArticles.length,
    analysed:       enriched.length,
    controversies:  controversialArticles.length,
    saved,
    errors,
    leaderScores:   leaderScores.map((ls) => ({
      person: ls.personInvolved,
      score:  ls.score,
      label:  ls.label,
    })),
  };
}

// ─── Top-level runner ─────────────────────────────────────────────────────────

/**
 * Run the full controversy fetcher for all (or selected) countries.
 *
 * @param {string[]} [countries] — subset of ['CA','US','UK','AU'] (default: all)
 * @returns {Promise<object[]>}
 */
export async function runControversyFetcher(countries = COUNTRY_CODES) {
  const missing = [];
  if (!NEWS_API_KEY)  missing.push('REACT_APP_NEWS_API_KEY (newsapi.org)');
  if (!GNEWS_API_KEY) missing.push('REACT_APP_GNEWS_API_KEY (gnews.io)');
  if (!ANTHROPIC_KEY) missing.push('REACT_APP_ANTHROPIC_API_KEY (claude ai analysis)');

  if (missing.length) {
    console.warn(
      '[controversy] Optional API keys not configured:\n' +
      missing.map((k) => `  • ${k}`).join('\n') +
      '\n  Falling back to Guardian API + RSS + keyword analysis.'
    );
  }

  console.log(`[controversy] Starting tracker for: ${countries.join(', ')}`);
  const results = [];

  for (const country of countries) {
    try {
      results.push(await fetchAndSaveCountry(country));
    } catch (e) {
      console.error(`[controversy] Unhandled error for ${country}:`, e);
      results.push({ country, fetched: 0, controversies: 0, saved: 0, errors: 1 });
    }
  }

  // Summary
  console.log('\n[controversy] ══ Run complete ═══════════════════════════════════');
  console.log('  Country │ Fetched │ Controversies │ Saved │ Errors');
  console.log('  ────────┼─────────┼───────────────┼───────┼───────');
  results.forEach((r) =>
    console.log(
      `  ${r.country?.padEnd(7)} │ ${String(r.fetched).padEnd(7)} │` +
      ` ${String(r.controversies ?? 0).padEnd(13)} │ ${String(r.saved).padEnd(5)} │ ${r.errors}`
    )
  );

  return results;
}

export default runControversyFetcher;
