/**
 * Local unit tests for the leader-profile content-safety validation layer
 * (engine/lib/subnational-leader-profile-shared.cjs and the extractor that
 * builds on it, engine/lib/subnational-leader-profile-extract.cjs).
 *
 * Added as part of the corrective-work task that generalized the anti-bot
 * validation originally introduced narrowly for the CA-PE Radware bug.
 * Exercises synthetic strings only — never fetches a URL and never touches
 * Firestore (no firebase-admin import anywhere in this file).
 *
 * Usage:
 *   node engine/test-leader-profile-content-safety.cjs
 *
 * Exit code is non-zero if any assertion fails, so this can be wired into a
 * CI/build step directly.
 */

'use strict';

const assert = require('assert');

const {
  isBioTextSafe,
  looksLikeChallengePage,
  looksLikeNavigationOnly,
  hasRepeatedBoilerplateLinkText,
  stripHtml,
  firstMatch,
} = require('./lib/subnational-leader-profile-shared.cjs');

const { looksLikeBotChallengePage, extractProfileFromHtml } = require('./lib/subnational-leader-profile-extract.cjs');

let passed = 0;
let failed = 0;
const failures = [];

function test(name, fn) {
  try {
    fn();
    passed += 1;
    console.log(`  ok - ${name}`);
  } catch (err) {
    failed += 1;
    failures.push({ name, err });
    console.log(`  FAIL - ${name}`);
    console.log(`    ${err.message}`);
  }
}

console.log('engine/test-leader-profile-content-safety.cjs');
console.log('(synthetic strings only — zero network, zero Firestore)\n');

// ─── 1. Valid biography ────────────────────────────────────────────────────

const VALID_BIO =
  'Jane Smith is the Premier of Exampleland. Before entering politics, she ' +
  'served two terms on city council and worked as a nurse for twelve years. ' +
  'She was first elected to the legislature in 2015 and has since championed ' +
  'health care reform and affordable housing initiatives across the province.';

test('valid biography text is accepted', () => {
  const result = isBioTextSafe(VALID_BIO);
  assert.strictEqual(result.safe, true);
  assert.strictEqual(result.reason, null);
});

test('valid biography page is not flagged as a challenge page', () => {
  const html = `<html><title>Premier Jane Smith</title><body><p>${VALID_BIO}</p></body></html>`;
  assert.strictEqual(looksLikeChallengePage(html, stripHtml, firstMatch), false);
  assert.strictEqual(looksLikeBotChallengePage(html), false);
});

// ─── 2. Radware challenge page ─────────────────────────────────────────────

const RADWARE_HTML = `<html><head><title>Radware Page</title></head><body>
  <p>Verifying your browser before proceeding...</p>
  <p>This process is automatic. Your browser will redirect to your requested content shortly.</p>
  <p>Incident ID: 1234567890123456789</p>
</body></html>`;

test('Radware challenge page is rejected as a whole-page challenge', () => {
  assert.strictEqual(looksLikeBotChallengePage(RADWARE_HTML), true);
});

test('Radware challenge bio-text snippet is rejected', () => {
  const result = isBioTextSafe('Verifying your browser before proceeding. Incident ID: 1234567890123456789');
  assert.strictEqual(result.safe, false);
  assert.strictEqual(result.reason, 'challenge_page_markers');
});

// ─── 3. Cloudflare / generic bot-challenge page ────────────────────────────

const CLOUDFLARE_HTML = `<html><head><title>Just a moment...</title></head><body>
  <p>Checking your browser before accessing example.gov. This process is automatic.</p>
  <p>Please allow up to 5 seconds. Ray ID: 8a1b2c3d4e5f6789</p>
</body></html>`;

test('Cloudflare-style challenge page is rejected', () => {
  assert.strictEqual(looksLikeBotChallengePage(CLOUDFLARE_HTML), true);
});

// ─── 4. 403 / 404 error pages ──────────────────────────────────────────────

test('404 error page is rejected', () => {
  const html = '<html><title>404 Not Found</title><body><p>The page you requested could not be found.</p></body></html>';
  assert.strictEqual(looksLikeBotChallengePage(html), true);
});

test('403 forbidden page is rejected', () => {
  const html = '<html><title>403 Forbidden</title><body><p>Access denied. You do not have permission to access this resource.</p></body></html>';
  assert.strictEqual(looksLikeBotChallengePage(html), true);
});

// ─── 5. CAPTCHA wall ────────────────────────────────────────────────────────

test('CAPTCHA page is rejected', () => {
  const html = '<html><title>Security Check</title><body><p>Please complete the CAPTCHA below to continue. Are you a robot?</p></body></html>';
  assert.strictEqual(looksLikeBotChallengePage(html), true);
});

// ─── 6. Navigation/footer-only content ─────────────────────────────────────

const NAV_ONLY_TEXT =
  'Skip to main content Home About Us Contact Us Site Map Privacy Policy ' +
  'Terms of Use Accessibility Copyright All rights reserved Main Menu Sign In';

test('navigation-only text is detected by looksLikeNavigationOnly', () => {
  assert.strictEqual(looksLikeNavigationOnly(NAV_ONLY_TEXT), true);
});

test('navigation-only text fails isBioTextSafe', () => {
  const result = isBioTextSafe(NAV_ONLY_TEXT);
  assert.strictEqual(result.safe, false);
  assert.strictEqual(result.reason, 'navigation_only');
});

test('a real bio that incidentally contains one nav-ish word is NOT rejected', () => {
  // Must not be a false positive: "contact" and "home" appearing once each
  // inside genuine prose, with normal sentence punctuation, is fine.
  const text =
    'Jane Smith grew up in a small home town before moving to the capital. ' +
    'Constituents can contact her office directly with questions about policy.';
  const result = isBioTextSafe(text);
  assert.strictEqual(result.safe, true);
});

test('repeated boilerplate link text ("Voir plus" x3+) is rejected', () => {
  const text =
    'Logement abordable pour les familles de la province. Voir plus. ' +
    'Soins de santé accessibles pour tous les citoyens. Voir plus. ' +
    'Investissements dans les infrastructures locales. Voir plus.';
  assert.strictEqual(hasRepeatedBoilerplateLinkText(text), true);
  const result = isBioTextSafe(text);
  assert.strictEqual(result.safe, false);
  assert.strictEqual(result.reason, 'repeated_boilerplate_link_text');
});

// ─── 7. Empty / implausibly short content ──────────────────────────────────

test('empty string is rejected', () => {
  const result = isBioTextSafe('');
  assert.strictEqual(result.safe, false);
  assert.strictEqual(result.reason, 'empty');
});

test('whitespace-only string is rejected as empty', () => {
  const result = isBioTextSafe('   \n\t  ');
  assert.strictEqual(result.safe, false);
  assert.strictEqual(result.reason, 'empty');
});

test('implausibly short non-empty string is rejected as too_short', () => {
  const result = isBioTextSafe('Jane Smith.');
  assert.strictEqual(result.safe, false);
  assert.strictEqual(result.reason, 'too_short');
});

// ─── 8. JavaScript-required notice: bio-text-only, not whole-page ──────────

test('"enable JavaScript" bio snippet is rejected at bio-text level', () => {
  const result = isBioTextSafe('Please enable JavaScript and cookies to continue using this site.');
  assert.strictEqual(result.safe, false);
  assert.strictEqual(result.reason, 'javascript_required_notice');
});

test('a real long page that also carries JS-upgrade boilerplate is NOT whole-page-rejected', () => {
  // Regression guard for the ontario.ca false-positive found during this fix:
  // a page can legitimately carry "this site needs JavaScript" boilerplate
  // AND serve real server-rendered content — only the narrow bio text should
  // ever be judged by that marker, never the whole page.
  const html = `<html><title>Premier Jane Smith | Province of Exampleland</title><body>
    <noscript>This site works best with JavaScript enabled.</noscript>
    <p>${VALID_BIO}</p>
  </body></html>`;
  assert.strictEqual(looksLikeBotChallengePage(html), false);
});

// ─── 9. Integration: extractProfileFromHtml end-to-end on synthetic pages ──

test('extractProfileFromHtml rejects a full synthetic Radware page end-to-end', () => {
  const result = extractProfileFromHtml(RADWARE_HTML, 'https://example.gov/premier', {
    leaderTitle: 'Premier',
    officialTitle: 'Premier of Exampleland',
    officialWebsite: 'https://example.gov',
  });
  assert.strictEqual(result.ok, false);
});

test('extractProfileFromHtml accepts a clean synthetic official page end-to-end', () => {
  const html = `<html><title>Premier Jane Smith | Province of Exampleland</title><body>
    <nav>Home About Contact</nav>
    <h1>Premier Jane Smith</h1>
    <p>${VALID_BIO}</p>
    <footer>Copyright Province of Exampleland. Privacy Policy. Terms of Use.</footer>
  </body></html>`;
  const result = extractProfileFromHtml(html, 'https://example.gov/premier', {
    leaderTitle: 'Premier',
    officialTitle: 'Premier of Exampleland',
    officialWebsite: 'https://example.gov',
  });
  assert.strictEqual(result.ok, true);
  assert.ok(result.profile.leader_bio && result.profile.leader_bio.length >= 40);
  assert.ok(!/radware|cloudflare|captcha/i.test(result.profile.leader_bio));
});

// ─── Summary ────────────────────────────────────────────────────────────────

console.log(`\n${passed} passed, ${failed} failed (zero network calls, zero Firestore calls)`);

if (failed > 0) {
  process.exitCode = 1;
}
