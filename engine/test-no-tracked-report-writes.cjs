/**
 * Hermetic guard: no engine test may write into the tracked engine/reports directory.
 *
 * Background: engine/test-statcan-wds-reliability.cjs used to overwrite the tracked file
 * engine/reports/statcan-wds-reliability-test-latest.json on every run, leaving the working tree dirty after a plain
 * test run. Tests must write to a temporary location (or one chosen with CV_REPORTS_DIR).
 *
 * Checks (static, no network, no Firestore):
 *   1. No engine/test-*.cjs file builds a path to engine/reports in order to WRITE it (writeFile*, mkdir*, appendFile*).
 *      Reading or listing the directory (as test-cra-charities-2024.cjs does to prove "no report was created") is fine.
 *   2. The StatCan probe resolves its report directory from CV_REPORTS_DIR, else the OS temp directory.
 *
 * Usage: node engine/test-no-tracked-report-writes.cjs
 */
'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

let passed = 0;
let failed = 0;
function test(name, fn) {
  try { fn(); passed += 1; console.log(`  ok - ${name}`); } catch (err) { failed += 1; console.log(`  FAIL - ${name}\n    ${String(err.message).split('\n')[0]}`); }
}

const strip = (src) => src.split('\n').filter((l) => !/^\s*(\*|\/\/|\/\*)/.test(l)).join('\n');
const testFiles = fs.readdirSync(__dirname).filter((f) => /^test-.*\.cjs$/.test(f) && f !== path.basename(__filename));

test('there are engine test files to check', () => assert.ok(testFiles.length >= 5, `found ${testFiles.length}`));

for (const f of testFiles) {
  test(`${f}: does not write into the tracked engine/reports directory`, () => {
    const code = strip(fs.readFileSync(path.join(__dirname, f), 'utf8'));
    // Any line that both mentions the tracked directory (as __dirname + 'reports') and a write-type call, or a variable
    // named like the directory that is then passed to a write-type call.
    const lines = code.split('\n');
    const bad = [];
    lines.forEach((l, i) => {
      if (/(writeFile|writeFileSync|appendFile|appendFileSync|mkdirSync|mkdir|copyFile|copyFileSync|rename|renameSync)\s*\(/.test(l) && /__dirname[^\n]*['"]reports['"]/.test(l)) bad.push(`${f}:${i + 1}`);
    });
    // Indirect: const X = path.join(__dirname, 'reports') ... fs.writeFile*(X...) / path.join(X, ...) passed to a writer.
    const m = code.match(/const\s+(\w+)\s*=\s*(?!process\.env)[^;\n]*path\.join\(__dirname,\s*['"]reports['"]\)\s*;/);
    if (m) {
      const v = m[1];
      const writer = new RegExp(`(writeFile|writeFileSync|appendFile|appendFileSync|mkdirSync|copyFileSync|renameSync)\\s*\\([^)]*\\b${v}\\b`);
      if (writer.test(code)) bad.push(`${f}: ${v} (engine/reports) is passed to a write call`);
    }
    assert.deepStrictEqual(bad, [], `writes to engine/reports: ${bad.join(', ')}`);
  });
}

test('the StatCan probe writes its report to CV_REPORTS_DIR or the OS temp directory, never engine/reports by default', () => {
  const src = fs.readFileSync(path.join(__dirname, 'test-statcan-wds-reliability.cjs'), 'utf8');
  assert.ok(/REPORTS_DIR\s*=\s*process\.env\.CV_REPORTS_DIR\s*\|\|\s*path\.join\(os\.tmpdir\(\)/.test(src), 'REPORTS_DIR must default to os.tmpdir()');
  assert.ok(!/REPORTS_DIR\s*=\s*path\.join\(__dirname/.test(src), 'REPORTS_DIR must not default to a directory inside engine/');
});

test('this guard catches the old behaviour (self-check on the pre-fix source)', () => {
  const old = "const REPORTS_DIR = path.join(__dirname, 'reports');\nfs.writeFileSync(path.join(REPORTS_DIR, 'x.json'), '{}');";
  const m = strip(old).match(/const\s+(\w+)\s*=\s*(?!process\.env)[^;\n]*path\.join\(__dirname,\s*['"]reports['"]\)\s*;/);
  assert.ok(m && new RegExp(`(writeFileSync)\\s*\\([^)]*\\b${m[1]}\\b`).test(old), 'pre-fix pattern must be detected');
});

console.log(`\n${passed} passed, ${failed} failed (static, zero Firestore, zero network)`);
process.exitCode = failed > 0 ? 1 : 0;
