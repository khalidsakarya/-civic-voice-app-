/**
 * Guarded replacement of the provincial / territorial CRA charity documents
 * (subnational_tax_exempt_entities/CA-XX) with the corrected CRA 2024 data.
 *
 * REPLACEMENT SEMANTICS — deliberately NOT `set(..., { merge: true })`
 *   Plain merge replaces arrays wholesale but leaves any other stale top-level field behind, and "merge
 *   replaces arrays" is a Firestore behaviour that should not be assumed. This module writes with
 *     set(payload, { mergeFields: <every top-level field of the payload> })
 *   which replaces each listed field's ENTIRE value (so the whole `records` array, with every obsolete
 *   1998 entry and every `rawValue: 0`, is replaced) and leaves every other field untouched. Because the
 *   payload contains every field the legacy writers ever wrote, no stale charity field can survive; any
 *   existing field the writers never wrote is treated as an UNKNOWN field and the run ABORTS for that
 *   document instead of guessing. Every replacement is verified by re-reading the document.
 *
 * Nothing here deletes a document, queries a collection, or runs on import.
 */

'use strict';

const COLLECTION = 'subnational_tax_exempt_entities';

/** The 13 provincial / territorial charity documents. */
const JURISDICTIONS = Object.freeze([
  { id: 'CA-ON', cvDataId: 'CV-DATA-008' },
  { id: 'CA-BC', cvDataId: 'CV-DATA-BC-002' },
  { id: 'CA-AB', cvDataId: 'CV-DATA-AB-002' },
  { id: 'CA-QC', cvDataId: 'CV-DATA-QC-002' },
  { id: 'CA-SK', cvDataId: 'CV-DATA-SK-002' },
  { id: 'CA-MB', cvDataId: 'CV-DATA-MB-002' },
  { id: 'CA-NS', cvDataId: 'CV-DATA-NS-002' },
  { id: 'CA-NB', cvDataId: 'CV-DATA-NB-002' },
  { id: 'CA-NL', cvDataId: 'CV-DATA-NL-002' },
  { id: 'CA-PE', cvDataId: 'CV-DATA-PE-002' },
  { id: 'CA-YT', cvDataId: 'CV-DATA-YT-002' },
  { id: 'CA-NT', cvDataId: 'CV-DATA-NT-002' },
  { id: 'CA-NU', cvDataId: 'CV-DATA-NU-002' },
]);

/** Every top-level field the legacy (1998-source) writers ever wrote. */
const LEGACY_FIELDS = Object.freeze(['jurisdiction_id', 'data_source', 'source_url', 'note', 'total_in_source', 'records_stored', 'records', 'verification_status', 'licence_note', 'cv_data_id', 'fetched_at']);
/** Fields added by the corrected document. */
const NEW_FIELDS = Object.freeze(['source_year', 'reporting_period', 'selection_basis', 'financials_reported_count', 'source_dataset']);
const OWNED_FIELDS = new Set([...LEGACY_FIELDS, ...NEW_FIELDS]);

const LICENCE_NOTE = 'Open Government Licence — Canada (OGL-Canada). Attribution: "Contains information licensed under the Open Government Licence — Canada. Source: Canada Revenue Agency Charities Directorate."';

const flagError = (msg) => new Error(`${msg}. Nothing was run.`);

/**
 * Strict arguments. Flags: --write, --offline, --allow-create. Value: --only=CA-XX[,CA-YY].
 * Anything else (typos, positionals, repeats) throws. --write REQUIRES an explicit --only.
 */
function parseArgs(argv) {
  const flags = new Set();
  let only = null;
  const known = new Set(JURISDICTIONS.map((j) => j.id));
  for (const arg of argv) {
    if (arg === '--write' || arg === '--offline' || arg === '--allow-create') {
      if (flags.has(arg)) throw flagError(`repeated flag ${arg}`);
      flags.add(arg);
      continue;
    }
    const m = /^--only=(.*)$/.exec(arg);
    if (m) {
      if (only) throw flagError('repeated flag --only');
      const ids = m[1].split(',').map((s) => s.trim().toUpperCase());
      const bad = ids.filter((id) => !known.has(id));
      if (!m[1].trim() || bad.length || ids.some((i) => !i)) throw flagError(`--only has ${!m[1].trim() ? 'no value' : `unknown or empty jurisdiction(s) ${bad.map((b) => `"${b}"`).join(', ') || '(empty entry)'}`}; valid: ${[...known].join(', ')}`);
      only = new Set(ids);
      continue;
    }
    throw flagError(`unsupported argument "${arg}". Supported: --only=<ids>, --write, --offline, --allow-create`);
  }
  const write = flags.has('--write');
  const offline = flags.has('--offline');
  const allowCreate = flags.has('--allow-create');
  if (write && offline) throw flagError('--write cannot be combined with --offline');
  if (write && !only) throw flagError('--write requires an explicit --only=<jurisdiction ids> (there is no implicit "all")');
  if (allowCreate && !write) throw flagError('--allow-create only makes sense with --write');
  return { write, offline, allowCreate, only };
}

/** The complete payload to store for one jurisdiction (corrected doc + bookkeeping). */
function buildPayload(doc, jurisdiction, { now = new Date() } = {}) {
  if (!jurisdiction || doc.jurisdiction_id !== jurisdiction.id) throw new Error(`Refusing to build: the document declares "${doc && doc.jurisdiction_id}", expected "${jurisdiction && jurisdiction.id}"`);
  if (!Array.isArray(doc.records) || !doc.records.length) throw new Error(`Refusing to build ${jurisdiction.id}: no records`);
  if (doc.records.some((r) => r && 'rawValue' in r)) throw new Error(`Refusing to build ${jurisdiction.id}: a record carries rawValue (placeholder values are not allowed)`);
  const date = now.toISOString().slice(0, 10);
  const payload = {
    ...doc,
    cv_data_id: jurisdiction.cvDataId,
    verification_status: `CV-REC-001-${date}-${jurisdiction.cvDataId}-CRA2024`,
    licence_note: LICENCE_NOTE,
    fetched_at: now.toISOString(),
  };
  const missing = [...OWNED_FIELDS].filter((f) => !(f in payload));
  if (missing.length) throw new Error(`Refusing to build ${jurisdiction.id}: payload lacks [${missing.join(', ')}]`);
  const extra = Object.keys(payload).filter((f) => !OWNED_FIELDS.has(f));
  if (extra.length) throw new Error(`Refusing to build ${jurisdiction.id}: payload has unexpected fields [${extra.join(', ')}]`);
  return payload;
}

function describeRecords(records) {
  const recs = Array.isArray(records) ? records : [];
  return {
    count: recs.length,
    with_rawValue_field: recs.filter((r) => r && 'rawValue' in r).length,
    with_rawValue_zero: recs.filter((r) => r && r.rawValue === 0).length,
    with_bn: recs.filter((r) => r && r.bn).length,
    with_revenue: recs.filter((r) => r && typeof r.revenue_cad === 'number').length,
  };
}

/**
 * Compare the existing document with the payload. `conflict` (a string) means the document must NOT be touched.
 */
function assessExisting(snap, payload, jurisdictionId) {
  const exists = !!(snap && snap.exists);
  const data = exists ? (snap.data() || {}) : {};
  const existingKeys = Object.keys(data);
  const unknownKeys = existingKeys.filter((k) => !OWNED_FIELDS.has(k));
  let conflict = null;
  if (exists && data.jurisdiction_id != null && data.jurisdiction_id !== jurisdictionId) conflict = `the existing document declares jurisdiction "${data.jurisdiction_id}" (unrelated record)`;
  else if (exists && data.country != null && data.country !== 'CA') conflict = `the existing document declares country "${data.country}" (unrelated record)`;
  else if (unknownKeys.length) conflict = `the existing document has fields this process does not own: [${unknownKeys.join(', ')}]`;
  const oldNames = new Set((Array.isArray(data.records) ? data.records : []).map((r) => r && r.name));
  const newNames = new Set(payload.records.map((r) => r.name));
  return {
    exists,
    existingKeys,
    unknownKeys,
    conflict,
    before: exists ? { source: data.data_source || null, reporting_period: data.reporting_period || null, total_in_source: data.total_in_source ?? null, ...describeRecords(data.records) } : null,
    after: { source: payload.data_source, reporting_period: payload.reporting_period, total_in_source: payload.total_in_source, ...describeRecords(payload.records) },
    fields_replaced: Object.keys(payload).filter((k) => existingKeys.includes(k)),
    fields_added: Object.keys(payload).filter((k) => !existingKeys.includes(k)),
    fields_removed: [],
    old_record_names_not_in_new: exists ? [...oldNames].filter((n) => !newNames.has(n)).length : 0,
  };
}

/** Post-write verification of the stored document. Returns a list of problems (empty = verified). */
function verifyStored(data, payload) {
  const problems = [];
  if (!data) return ['document is missing after the write'];
  if (data.jurisdiction_id !== payload.jurisdiction_id) problems.push(`jurisdiction_id is "${data.jurisdiction_id}"`);
  if (data.source_year !== 2024) problems.push(`source_year is ${data.source_year}`);
  if (data.reporting_period !== payload.reporting_period) problems.push('reporting_period differs');
  if (data.total_in_source !== payload.total_in_source || data.records_stored !== payload.records_stored) problems.push('total_in_source / records_stored differ');
  const recs = Array.isArray(data.records) ? data.records : [];
  if (recs.length !== payload.records.length) problems.push(`stored ${recs.length} records, expected ${payload.records.length}`);
  if (recs.some((r) => r && 'rawValue' in r)) problems.push('a stored record still carries rawValue');
  const want = payload.records.map((r) => r.bn).join('|');
  if (recs.map((r) => r.bn).join('|') !== want) problems.push('stored BNs / order differ from the prepared dataset (obsolete entries may remain)');
  const revs = recs.map((r) => r.revenue_cad).filter((v) => typeof v === 'number');
  if (revs.some((v, i) => i > 0 && revs[i - 1] < v)) problems.push('stored records are not ranked by revenue');
  if (Object.keys(data).some((k) => !OWNED_FIELDS.has(k))) problems.push('the stored document has unexpected fields');
  return problems;
}

/**
 * Dry run or guarded write for ONE jurisdiction.
 * @param {object} p
 * @param {any} p.db Firestore handle (null only for an offline dry run)
 * @param {{ id: string, cvDataId: string }} p.jurisdiction
 * @param {object} p.payload from buildPayload()
 * @param {boolean} p.write
 * @param {boolean} [p.allowCreate]
 * @param {Function} [p.writeBackup] required for a write
 * @param {string} [p.projectId]
 */
async function replaceOne({ db, jurisdiction, payload, write, allowCreate = false, writeBackup, projectId = null }) {
  const id = jurisdiction.id;
  const result = { jurisdiction_id: id, path: `${COLLECTION}/${id}`, mode: write ? 'WRITE' : 'DRY_RUN', status: null, error: null, plan: null, backup: null, verification: null };
  try {
    if (!db) {
      result.status = 'DRY_RUN_OFFLINE';
      result.plan = { existing_document: 'not checked (offline dry run: no Firestore access)', after: assessExisting(null, payload, id).after };
      return result;
    }
    const ref = db.collection(COLLECTION).doc(id);
    const snap = await ref.get();
    const plan = assessExisting(snap, payload, id);
    result.plan = plan;
    if (plan.conflict) { result.status = 'ABORTED_CONFLICT'; result.error = `Refusing to touch ${id}: ${plan.conflict}`; return result; }
    if (!write) { result.status = 'DRY_RUN'; return result; }

    if (!plan.exists && !allowCreate) { result.status = 'ABORTED_MISSING_DOCUMENT'; result.error = `${result.path} does not exist and --allow-create was not given; nothing was written`; return result; }
    if (plan.exists) {
      if (typeof writeBackup !== 'function') { result.status = 'ABORTED_NO_BACKUP'; result.error = 'no backup writer configured; nothing was written'; return result; }
      try {
        result.backup = await writeBackup({ collection: COLLECTION, docId: id, data: snap.data(), projectId });
      } catch (e) {
        result.status = 'ABORTED_BACKUP_FAILED';
        result.error = `the pre-write backup failed (${String(e.message || e).slice(0, 200)}); nothing was written`;
        return result;
      }
    }
    await ref.set(payload, { mergeFields: Object.keys(payload) });
    const after = await ref.get();
    const problems = verifyStored(after.exists ? after.data() : null, payload);
    result.verification = { ok: problems.length === 0, problems };
    result.status = problems.length ? 'WRITTEN_VERIFICATION_FAILED' : 'WRITTEN';
    if (problems.length) result.error = `written, but verification found problems: ${problems.join('; ')}`;
    return result;
  } catch (e) {
    result.status = 'FAILED';
    result.error = String(e.message || e).slice(0, 300);
    return result;
  }
}

/**
 * RESTORE from a backup file written by firestore-doc-backup.cjs. Dry run by default.
 * Replaces exactly the fields the backup holds, and removes (FieldValue.delete) the owned fields the backup
 * did not have (e.g. source_year when restoring a 1998-era document). A fresh backup of the CURRENT state is
 * taken first.
 */
async function restoreOne({ db, backup, write, writeBackup, deleteField, projectId = null }) {
  const doc = backup && backup.document;
  const result = { path: doc && doc.path, mode: write ? 'WRITE' : 'DRY_RUN', status: null, error: null, plan: null, safety_backup: null };
  try {
    if (!backup || backup.backup_format !== 1 || !doc) throw new Error('not a valid backup file (backup_format 1)');
    if (doc.collection !== COLLECTION) throw new Error(`backup is for collection "${doc.collection}", expected ${COLLECTION}`);
    if (!JURISDICTIONS.some((j) => j.id === doc.id)) throw new Error(`backup document id "${doc.id}" is not one of the 13 charity documents`);
    if (backup.firebase_project !== 'civic-voice-5ea94') throw new Error(`backup was taken from project "${backup.firebase_project}"`);
    const data = backup.data;
    if (!data || typeof data !== 'object') throw new Error('backup has no data');
    if (JSON.stringify(data).includes('"__type"')) throw new Error('backup contains type-tagged Firestore values (timestamps/references); restore those by hand');
    const unknown = Object.keys(data).filter((k) => !OWNED_FIELDS.has(k));
    if (unknown.length) throw new Error(`backup has fields this process does not own: [${unknown.join(', ')}]`);
    if (data.jurisdiction_id != null && data.jurisdiction_id !== doc.id) throw new Error(`backup data declares jurisdiction "${data.jurisdiction_id}"`);
    if (!db) throw new Error('restore needs Firestore access (no --offline)');
    const ref = db.collection(COLLECTION).doc(doc.id);
    const snap = await ref.get();
    const current = snap.exists ? snap.data() : {};
    const currentUnknown = Object.keys(current).filter((k) => !OWNED_FIELDS.has(k));
    if (currentUnknown.length) throw new Error(`the current document has fields this process does not own: [${currentUnknown.join(', ')}]`);
    const toDelete = Object.keys(current).filter((k) => OWNED_FIELDS.has(k) && !(k in data));
    result.plan = { restores_fields: Object.keys(data), deletes_fields: toDelete, current_records: describeRecords(current.records), restored_records: describeRecords(data.records) };
    if (!write) { result.status = 'DRY_RUN'; return result; }
    if (typeof writeBackup !== 'function' || typeof deleteField !== 'function') throw new Error('restore needs a backup writer and a FieldValue.delete provider');
    if (snap.exists) result.safety_backup = await writeBackup({ collection: COLLECTION, docId: doc.id, data: current, projectId });
    const body = { ...data };
    toDelete.forEach((k) => { body[k] = deleteField(); });
    await ref.set(body, { mergeFields: Object.keys(body) });
    const after = (await ref.get()).data() || {};
    const ok = JSON.stringify(after.records) === JSON.stringify(data.records) && toDelete.every((k) => !(k in after));
    result.status = ok ? 'RESTORED' : 'RESTORED_VERIFICATION_FAILED';
    if (!ok) result.error = 'restored, but the verification read did not match the backup';
    return result;
  } catch (e) {
    result.status = 'FAILED';
    result.error = String(e.message || e).slice(0, 300);
    return result;
  }
}

module.exports = {
  COLLECTION,
  JURISDICTIONS,
  LEGACY_FIELDS,
  NEW_FIELDS,
  OWNED_FIELDS,
  parseArgs,
  buildPayload,
  describeRecords,
  assessExisting,
  verifyStored,
  replaceOne,
  restoreOne,
};
