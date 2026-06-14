/**
 * Vercel serverless: /api/share
 *
 * Generates a page with proper Open Graph meta tags so that when a user
 * shares a link on Facebook, Twitter, WhatsApp, etc. the preview shows
 * the actual content (ministry, bill, contract, MP…) instead of the
 * generic app homepage.
 *
 * Query params:
 *   type    — ministry | bill | contract | mp | senator (for the icon/label)
 *   title   — main heading shown in the preview
 *   desc    — short description
 *   meta    — optional extra line (e.g. "Budget: CA$26.5B")
 *   img     — optional image URL (falls back to app icon)
 *
 * The page immediately redirects real users to the app root.
 * Social-media crawlers read the OG tags and stop — they never follow
 * the JS redirect, so they see the correct preview.
 *
 * Usage (built by the app's handleShare):
 *   https://civic-voice-app.vercel.app/api/share?type=ministry&title=National+Defence&desc=Responsible+for+defending+Canada&meta=Budget%3A+CA%2426.5B
 */

const APP_URL   = 'https://civic-voice-app.vercel.app';
const APP_NAME  = 'Civic Voice';
const DEFAULT_IMG = `${APP_URL}/logo192.png`;

const TYPE_EMOJI = {
  ministry: '🏛️',
  bill:     '📋',
  contract: '💰',
  mp:       '👤',
  senator:  '🏅',
  default:  '🗳️',
};

module.exports = (req, res) => {
  const { type = 'default', title = APP_NAME, desc = '', meta = '', img = '' } = req.query;

  const emoji      = TYPE_EMOJI[type] || TYPE_EMOJI.default;
  const ogTitle    = `${emoji} ${decodeURIComponent(title)} — ${APP_NAME}`;
  const ogDesc     = [decodeURIComponent(desc), decodeURIComponent(meta)].filter(Boolean).join(' · ');
  const ogImage    = decodeURIComponent(img) || DEFAULT_IMG;

  // Use the ACTUAL share URL as og:url so Facebook caches each item separately.
  // Real users are redirected to APP_URL via JS below.
  const proto    = (req.headers['x-forwarded-proto'] || 'https').split(',')[0].trim();
  const host     = req.headers['x-forwarded-host'] || req.headers.host || 'civic-voice-app.vercel.app';
  const selfUrl  = `${proto}://${host}${req.url}`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  // Cache 5 minutes — short enough to re-scrape, long enough to not hammer the function
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300');

  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escHtml(ogTitle)}</title>

  <!-- Open Graph (Facebook, WhatsApp, Telegram, iMessage link previews) -->
  <meta property="og:type"        content="website" />
  <meta property="og:site_name"   content="${escHtml(APP_NAME)}" />
  <meta property="og:url"         content="${escHtml(selfUrl)}" />
  <meta property="og:title"       content="${escHtml(ogTitle)}" />
  <meta property="og:description" content="${escHtml(ogDesc)}" />
  <meta property="og:image"       content="${escHtml(ogImage)}" />
  <meta property="og:image:width" content="192" />
  <meta property="og:image:height" content="192" />

  <!-- Twitter / X Card -->
  <meta name="twitter:card"        content="summary" />
  <meta name="twitter:title"       content="${escHtml(ogTitle)}" />
  <meta name="twitter:description" content="${escHtml(ogDesc)}" />
  <meta name="twitter:image"       content="${escHtml(ogImage)}" />
</head>
<body style="font-family:sans-serif;text-align:center;padding:40px;background:#f9fafb;">
  <p style="font-size:3rem;margin:0">${escHtml(emoji)}</p>
  <h1 style="color:#1e293b;margin:16px 0 8px">${escHtml(decodeURIComponent(title))}</h1>
  <p style="color:#475569;max-width:480px;margin:0 auto 24px">${escHtml(ogDesc)}</p>
  <a href="${escHtml(APP_URL)}"
     style="display:inline-block;background:#16a34a;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700">
    Open in Civic Voice →
  </a>
  <script>window.location.replace("${APP_URL}")</script>
</body>
</html>`);
};

function escHtml(str) {
  return String(str)
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#x27;');
}
