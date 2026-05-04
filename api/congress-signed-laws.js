/**
 * Vercel serverless: bills whose latest action indicates presidential signature or enactment
 * (Congress.gov API v3). Excludes bills only presented/delivered to the President.
 * Requires CONGRESS_API_KEY (never commit; not REACT_APP_*).
 *
 * Deploy checklist: (1) File must live at repo `api/congress-signed-laws.js` (Vercel project root).
 * (2) Client calls `/api/congress-signed-laws`. (3) Set CONGRESS_API_KEY in Vercel env — not REACT_APP_*.
 * (4) Redeploy after env changes. (5) Local: `npx vercel dev`, not `npm start` alone.
 *
 * @see https://github.com/LibraryOfCongress/api.congress.gov/blob/main/Documentation/BillEndpoint.md
 */

/** TEMP debug logs — remove or gate after incident (never log API key value). */
function dbg(...args) {
  console.log('[congress-signed-laws]', ...args);
}

function congressPathSegment(congress) {
  const c = parseInt(String(congress), 10);
  if (!Number.isFinite(c) || c < 1) return '119th-congress';
  const v = c % 100;
  let suf = 'th';
  if (v < 11 || v > 13) {
    const m = c % 10;
    if (m === 1) suf = 'st';
    else if (m === 2) suf = 'nd';
    else if (m === 3) suf = 'rd';
  }
  return `${c}${suf}-congress`;
}

function webSlugForType(typeLower) {
  const m = {
    hr: 'house-bill',
    s: 'senate-bill',
    hjres: 'house-joint-resolution',
    sjres: 'senate-joint-resolution',
    hconres: 'house-concurrent-resolution',
    sconres: 'senate-concurrent-resolution',
    hres: 'house-resolution',
    sres: 'senate-resolution',
  };
  return m[typeLower] || 'house-bill';
}

function buildCongressGovUrl(congress, typeUpper, number) {
  const t = String(typeUpper || '').toLowerCase();
  const n = String(number);
  const seg = congressPathSegment(congress);
  const slug = webSlugForType(t);
  return `https://www.congress.gov/bill/${seg}/${slug}/${n}`;
}

/** Latest action indicates signature or enactment (not merely sent to the President). */
function isSignedOrEnactedLaw(latestText) {
  if (!latestText || typeof latestText !== 'string') return false;
  const lower = latestText.toLowerCase();
  if (lower.includes('vetoed by the president') || lower.includes('vetoed by president')) return false;
  if (lower.includes('pocket veto')) return false;
  if (lower.includes('veto message')) return false;
  return (
    /\bsigned by (the )?president\b/i.test(latestText)
    || /\bbecame public law\b/i.test(latestText)
    || /\bbecame private law\b/i.test(latestText)
    || /\bpublic law no\.?\b/i.test(lower)
    || /\bbecame law\b/i.test(lower)
  );
}

function lawStatusLabelFromLatest(latestText) {
  if (!latestText || typeof latestText !== 'string') return 'Enacted';
  const lower = latestText.toLowerCase();
  if (/\bbecame public law\b/i.test(latestText) || /\bpublic law no\.?\b/i.test(lower)) return 'Became Public Law';
  if (/\bbecame private law\b/i.test(latestText)) return 'Became Private Law';
  if (/\bsigned by (the )?president\b/i.test(lower)) return 'Signed by President';
  if (/\bbecame law\b/i.test(lower)) return 'Became Law';
  return 'Signed or enacted';
}

async function fetchBillList(congress, billType, apiKey) {
  const url = new URL(`https://api.congress.gov/v3/bill/${congress}/${billType}`);
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', '250');
  url.searchParams.set('sort', 'updateDate+desc');
  url.searchParams.set('api_key', apiKey);
  const res = await fetch(url);
  dbg(`Congress.gov bill/${congress}/${billType}: HTTP ${res.status}`);
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`${billType} list ${res.status}: ${errText.slice(0, 200)}`);
  }
  const data = await res.json();
  const bills = Array.isArray(data.bills) ? data.bills : [];
  dbg(`Congress.gov bill/${congress}/${billType}: list rows from API (before filter) = ${bills.length}`);
  return bills;
}

function mapItem(congress, item) {
  const type = item.type || item.billType || '';
  const number = item.number;
  const la = item.latestAction || {};
  const text = la.text || '';
  const actionDate = la.actionDate || '';
  return {
    congress: String(congress),
    billType: String(type).toLowerCase(),
    billNumber: String(number),
    title: item.title || '',
    latestActionText: text,
    actionDate,
    originChamber: item.originChamber || '',
    sourceUrl: buildCongressGovUrl(congress, type, number),
    lawStatusLabel: lawStatusLabelFromLatest(text),
  };
}

async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(204).end();
  }
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  dbg(`route invoked: ${req.method} ${req.url || ''}`);

  const apiKey = process.env.CONGRESS_API_KEY;
  const qCongress = parseInt(String(req.query.congress || ''), 10);
  const congress = Number.isFinite(qCongress) && qCongress >= 1 && qCongress <= 150
    ? qCongress
    : 119;

  dbg(`congress query resolved to: ${congress}`);
  dbg(`CONGRESS_API_KEY present: ${apiKey ? 'yes' : 'no'}`);

  if (!apiKey) {
    dbg('abort: missing_api_key (returning JSON error body, HTTP 200)');
    return res.status(200).json({
      source: 'error',
      error: 'missing_api_key',
      bills: [],
      congress,
    });
  }

  const types = ['hr', 's', 'hjres', 'sjres'];
  try {
    const lists = await Promise.all(types.map((t) => fetchBillList(congress, t, apiKey)));
    const seen = new Set();
    const out = [];
    for (const list of lists) {
      for (const item of list) {
        const la = item.latestAction || {};
        const text = la.text || '';
        if (!isSignedOrEnactedLaw(text)) continue;
        const key = `${String(item.type || '').toLowerCase()}-${item.number}`;
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(mapItem(congress, item));
      }
    }
    out.sort((a, b) => String(b.actionDate).localeCompare(String(a.actionDate)));
    dbg(`signed-law rows after filter: ${out.length}`);
    return res.status(200).json({
      source: 'live',
      congress,
      fetchedAt: new Date().toISOString(),
      bills: out,
    });
  } catch (e) {
    dbg('upstream exception:', e.message || String(e));
    return res.status(502).json({
      error: 'upstream',
      message: e.message || 'Congress.gov request failed',
      source: 'unavailable',
      bills: [],
      congress,
    });
  }
}

module.exports = handler;
