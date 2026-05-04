/**
 * Vercel serverless: bills whose latest action indicates presentation or delivery to the President
 * for presidential action (Congress.gov API v3). Outcomes (signature, veto, presentment, adjournment
 * timing) are not implied—caller UI should stay legally broad.
 * Requires CONGRESS_API_KEY in project env (never commit; not REACT_APP_*).
 *
 * Future: paginate + cache via Firestore (scheduled job) to avoid missing older presented bills and to stay within API limits.
 *
 * @see https://github.com/LibraryOfCongress/api.congress.gov/blob/main/Documentation/BillEndpoint.md
 */

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

function isAwaitingPresidentialAction(latestText) {
  if (!latestText || typeof latestText !== 'string') return false;
  const lower = latestText.toLowerCase();
  if (lower.includes('became public law') || lower.includes('became private law')) return false;
  if (lower.includes('signed by the president') || lower.includes('signed by president')) return false;
  if (lower.includes('vetoed by the president') || lower.includes('vetoed by president')) return false;
  if (lower.includes('veto message') && lower.includes('chamber')) return false;
  return (
    /\bpresented to the president\b/i.test(latestText)
    || /\bpresented to president\b/i.test(latestText)
    || /\bdelivered to the president\b/i.test(latestText)
    || /\bdelivered to president\b/i.test(latestText)
    || /\bpresident'?s desk\b/i.test(latestText)
    || /\bawaiting presidential signature\b/i.test(latestText)
  );
}

async function fetchBillList(congress, billType, apiKey) {
  const url = new URL(`https://api.congress.gov/v3/bill/${congress}/${billType}`);
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', '250');
  url.searchParams.set('sort', 'updateDate+desc');
  url.searchParams.set('api_key', apiKey);
  const res = await fetch(url);
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`${billType} list ${res.status}: ${errText.slice(0, 200)}`);
  }
  const data = await res.json();
  return Array.isArray(data.bills) ? data.bills : [];
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

  const apiKey = process.env.CONGRESS_API_KEY;
  const qCongress = parseInt(String(req.query.congress || ''), 10);
  const congress = Number.isFinite(qCongress) && qCongress >= 1 && qCongress <= 150
    ? qCongress
    : 119;

  if (!apiKey) {
    return res.status(503).json({
      error: 'no_key',
      message: 'Set CONGRESS_API_KEY in Vercel (or .env for vercel dev). Request a free key at https://api.congress.gov/sign-up/',
      source: 'unavailable',
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
        if (!isAwaitingPresidentialAction(text)) continue;
        const key = `${String(item.type || '').toLowerCase()}-${item.number}`;
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(mapItem(congress, item));
      }
    }
    out.sort((a, b) => String(b.actionDate).localeCompare(String(a.actionDate)));
    return res.status(200).json({
      source: 'live',
      congress,
      fetchedAt: new Date().toISOString(),
      bills: out,
    });
  } catch (e) {
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
