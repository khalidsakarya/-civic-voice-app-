/**
 * ROLLBACK AUTHORIZATION for a charity document this rollout created (CA-NT / CA-NU only).
 *
 * Replaces the earlier deterministic confirmation token (document id + the first 12 hex characters of the data
 * hash). That scheme could be derived from public data, and two such tokens were published in Git history on
 * 2026-11-02. They are permanently disclosed: the old format is REJECTED here and nothing in this module can
 * produce or accept a value derived from a document id, a hash, a timestamp or any other public metadata.
 *
 * An authorization is a private FILE, issued by an explicit separate command, that exists only in the private
 * backup directory (outside every git repository, never in the repo):
 *   - a 256-bit random nonce from crypto.randomBytes;
 *   - bound to one receipt (the SHA-256 of the receipt FILE), one document path and one Firebase project;
 *   - authenticated with an HMAC-SHA256 under a random 256-bit key that is also created with crypto.randomBytes
 *     and stored only in the same private directory (.rollback-authorization.key), so a file written by someone
 *     without access to that directory cannot verify.
 * The nonce and the key are never printed, logged or returned. A valid authorization is necessary but NOT
 * sufficient: the rollback additionally needs the exact project and document confirmed on the command line, and
 * every existing check (receipt, project, createTime, updateTime, data hash, backup, delete precondition).
 *
 * No Firestore access of any kind in this file. Nothing runs on import.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { resolveBackupDir, findGitRepoAbove, assertNoCredentialMaterial } = require('./firestore-doc-backup.cjs');
const { validateReceipt, canonicalJson } = require('./charities-creation-receipt.cjs');

const AUTH_FORMAT = 1;
const AUTH_KIND = 'charity-rollback-authorization';
const KEY_FILE = '.rollback-authorization.key';
/** The retired, publicly derivable token shapes (e.g. "<document id>:<12 hex>"). Never accepted again. */
const LEGACY_TOKEN_RE = /^CA-N[TU]:[0-9a-f]{6,64}$/i;

const sha256 = (text) => crypto.createHash('sha256').update(text).digest('hex');
const isHex64 = (s) => typeof s === 'string' && /^[0-9a-f]{64}$/.test(s);

function assertPrivateDir(dir) {
  const resolved = path.resolve(dir);
  const repo = findGitRepoAbove(resolved);
  if (repo) throw new Error(`refused: ${resolved} is inside the git repository at ${repo}; rollback authorizations and their key live only in the private backup directory`);
  return resolved;
}

function loadKey(dir) {
  const file = path.join(assertPrivateDir(dir), KEY_FILE);
  if (!fs.existsSync(file)) return null;
  const key = fs.readFileSync(file, 'utf8').trim();
  return isHex64(key) ? key : null;
}

function loadOrCreateKey({ dir, randomBytes = crypto.randomBytes }) {
  const resolved = assertPrivateDir(dir);
  fs.mkdirSync(resolved, { recursive: true });
  const existing = loadKey(resolved);
  if (existing) return existing;
  if (fs.existsSync(path.join(resolved, KEY_FILE))) throw new Error('the existing rollback authorization key file is not a valid 256-bit key; refusing to replace it');
  const key = randomBytes(32).toString('hex');
  fs.writeFileSync(path.join(resolved, KEY_FILE), key + '\n', { flag: 'wx', mode: 0o600 });
  return key;
}

const macOf = (key, body) => crypto.createHmac('sha256', Buffer.from(key, 'hex')).update(canonicalJson(body)).digest('hex');

/**
 * Issues one authorization for one receipt. Returns ONLY where it was saved and what it is bound to — never the nonce or the key.
 * @param {{ receipt: object, receiptText: string, receiptFileName: string, dir?: string, now?: Date, randomBytes?: Function }} p
 */
function issueAuthorization({ receipt, receiptText, receiptFileName, dir = resolveBackupDir(), now = new Date(), randomBytes = crypto.randomBytes }) {
  const problems = validateReceipt(receipt);
  if (problems.length) throw new Error(`no authorization issued: ${problems.join('; ')}`);
  if (typeof receiptText !== 'string' || JSON.stringify(JSON.parse(receiptText)) !== JSON.stringify(receipt)) throw new Error('no authorization issued: the receipt text does not match the parsed receipt');
  const resolved = assertPrivateDir(dir);
  const key = loadOrCreateKey({ dir: resolved, randomBytes });
  const body = {
    format: AUTH_FORMAT,
    kind: AUTH_KIND,
    document: { collection: receipt.document.collection, id: receipt.document.id, path: receipt.document.path },
    firebase_project: receipt.firebase_project,
    receipt_file: path.basename(receiptFileName || ''),
    receipt_file_sha256: sha256(receiptText),
    nonce: randomBytes(32).toString('hex'),
    issued_at: now.toISOString(),
  };
  const authorization = { ...body, mac: macOf(key, body) };
  const text = JSON.stringify(authorization, null, 2) + '\n';
  assertNoCredentialMaterial(text);
  const base = `rollback-authorization__${receipt.document.id}__${now.toISOString().replace(/[:.]/g, '-')}`;
  let file = null;
  for (let n = 0; n < 20 && !file; n += 1) {
    const candidate = path.join(resolved, `${base}${n ? `__${n}` : ''}.json`);
    try { fs.writeFileSync(candidate, text, { flag: 'wx', mode: 0o600 }); file = candidate; } catch (e) { if (e.code !== 'EEXIST') throw e; }
  }
  if (!file) throw new Error('no authorization issued: could not choose an unused file name');
  let ok = false;
  try { ok = fs.readFileSync(file, 'utf8') === text; } catch { ok = false; }
  if (!ok) { try { fs.unlinkSync(file); } catch { /* best effort */ } throw new Error('no authorization issued: the saved file did not verify when read back'); }
  return { path: file, document: body.document.path, firebase_project: body.firebase_project, receipt_file: body.receipt_file, issued_at: body.issued_at };
}

/**
 * Verifies an authorization against a receipt. Returns a list of problems (empty = valid). Problem texts never include
 * the nonce, the MAC or the key.
 * @param {{ authorization: any, receipt: object, receiptText: string, dir?: string }} p
 */
function verifyAuthorization({ authorization, receipt, receiptText, dir = resolveBackupDir() }) {
  if (typeof authorization === 'string') {
    return [LEGACY_TOKEN_RE.test(authorization.trim())
      ? 'the retired confirmation-token format is no longer accepted (such tokens were derivable from public data and are permanently disclosed)'
      : 'a bare string is not an authorization; an issued authorization file is required'];
  }
  if (!authorization || typeof authorization !== 'object') return ['no rollback authorization was supplied'];
  const problems = [];
  const a = authorization;
  if (a.format !== AUTH_FORMAT || a.kind !== AUTH_KIND) problems.push('not a rollback authorization file (format/kind)');
  if (!receipt || !receipt.document) return ['no receipt to bind the authorization to'];
  if (!a.document || a.document.path !== receipt.document.path || a.document.id !== receipt.document.id || a.document.collection !== receipt.document.collection) problems.push('the authorization was issued for a different document');
  if (a.firebase_project !== receipt.firebase_project) problems.push('the authorization was issued for a different Firebase project');
  if (typeof receiptText !== 'string' || a.receipt_file_sha256 !== sha256(receiptText)) problems.push('the authorization was issued for a different receipt');
  if (!isHex64(a.nonce)) problems.push('the authorization has no valid random nonce');
  else if (receipt.data_sha256 && (a.nonce.includes(String(receipt.data_sha256).slice(0, 12)) || String(receipt.data_sha256).includes(a.nonce.slice(0, 12)))) problems.push('the authorization carries material derived from the receipt');
  if (!isHex64(a.mac)) problems.push('the authorization is not authenticated');
  let key = null;
  try { key = loadKey(dir); } catch (e) { problems.push(String(e.message).split('\n')[0]); }
  if (!key) problems.push('the private authorization key is missing, so no authorization can be verified');
  if (key && isHex64(a.mac) && !problems.length) {
    const { mac, ...body } = a;
    const want = Buffer.from(macOf(key, body), 'hex');
    const got = Buffer.from(a.mac, 'hex');
    if (want.length !== got.length || !crypto.timingSafeEqual(want, got)) problems.push('the authorization failed authentication (not issued by this installation)');
  }
  return problems;
}

module.exports = { AUTH_FORMAT, AUTH_KIND, KEY_FILE, LEGACY_TOKEN_RE, issueAuthorization, verifyAuthorization, loadOrCreateKey, loadKey };
