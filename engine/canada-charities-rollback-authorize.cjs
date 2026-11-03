/**
 * ISSUE a rollback authorization for one creation receipt (CA-NT / CA-NU). Deliberate, separate step: nothing
 * creates an authorization automatically.
 *
 *   node engine/canada-charities-rollback-authorize.cjs --receipt=<created__CA-XX__<timestamp>.receipt.json>
 *
 * It writes a private file (random 256-bit nonce, HMAC under a private random key) into the private backup
 * directory (~/civic-voice-backups/firestore, outside any git repository) and prints ONLY the file's path and what
 * it is bound to. The nonce and the key are never printed or logged. It does not touch Firestore, the network or
 * any repository file. A valid authorization alone cannot delete anything: see canada-charities-created-rollback.cjs.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const { issueAuthorization } = require('./lib/charities-rollback-authorization.cjs');
const { resolveBackupDir } = require('./lib/firestore-doc-backup.cjs');

function parseArgs(argv) {
  let receipt = null;
  for (const arg of argv) {
    const m = /^--receipt=(.+)$/.exec(arg);
    if (m) { if (receipt) throw new Error('repeated flag --receipt. Nothing was run.'); receipt = m[1]; continue; }
    throw new Error(`unsupported argument "${arg.replace(/=.*/, '=…')}". Supported: --receipt=<receipt.json>. Nothing was run.`);
  }
  if (!receipt) throw new Error('--receipt=<receipt.json> is required. Nothing was run.');
  return { receipt };
}

function run({ argv, readFile = (f) => fs.readFileSync(f, 'utf8'), dir = resolveBackupDir(), now = new Date(), issue = issueAuthorization, log = console.log } = {}) {
  const { receipt: file } = parseArgs(argv);
  const receiptText = readFile(file);
  const receipt = JSON.parse(receiptText);
  const out = issue({ receipt, receiptText, receiptFileName: path.basename(file), dir, now });
  log(`Rollback authorization issued for ${out.document} (${out.firebase_project}), bound to ${out.receipt_file}.`);
  log(`Saved privately at: ${out.path}`);
  log('No value from it is printed. It does not delete anything by itself: a rollback also needs --confirm-project and --confirm-document.');
  return out;
}

if (require.main === module) {
  try { run({ argv: process.argv.slice(2) }); } catch (err) { console.error(`[canada-charities-rollback-authorize] ${String(err.message)}`); process.exit(1); }
}

module.exports = { run, parseArgs };
