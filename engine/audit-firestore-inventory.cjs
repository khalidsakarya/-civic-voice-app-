/**
 * Read-only Firestore inventory audit.
 *
 * Usage (PowerShell):
 *   $env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\service-account.json"
 *   npm run audit:firestore-inventory
 *
 * Behavior:
 * - Reads collection names from docs/FIRESTORE_INVENTORY_AUDIT.md
 * - Reads Firestore data using Admin SDK (application default credentials)
 * - Writes local markdown report to docs/FIRESTORE_INVENTORY_LIVE_REPORT.md
 *
 * Safety:
 * - No writes to Firestore
 * - No deletes
 * - No migrations
 * - No frontend secrets
 */

const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

const PROJECT_ID = 'civic-voice-5ea94';
const AUDIT_DOC_PATH = path.resolve(__dirname, '../docs/FIRESTORE_INVENTORY_AUDIT.md');
const OUTPUT_PATH = path.resolve(__dirname, '../docs/FIRESTORE_INVENTORY_LIVE_REPORT.md');

const IMPORTANT_FIELDS = [
  'type',
  'status',
  'source',
  'source_name',
  'jurisdiction',
  'country',
  'congress',
  'member_name',
  'politician_slug',
];

const STALE_DATE_FIELDS = [
  'last_updated',
  'updated_at',
  'updatedAt',
  'lastUpdate',
  'last_update',
  'date',
  'created_at',
  'createdAt',
  'timestamp',
];

const DUPLICATE_GROUPS = [
  ['contracts', 'government_contracts'],
  ['members', 'congress_members'],
  ['executive_actions', 'executive_orders'],
  ['votes', 'vote_counts', 'citizen_votes'],
];

const SAMPLE_DOCS_FOR_ANALYSIS = Number.parseInt(
  process.env.AUDIT_SAMPLE_DOCS_PER_COLLECTION || '200',
  10,
);
const SAMPLE_IDS_LIMIT = 5;
const MAX_TOP_FIELDS = 20;
const MAX_DISTINCT_VALUES_PER_FIELD = 20;
const OLD_DATE_THRESHOLD_DAYS = Number.parseInt(
  process.env.AUDIT_OLD_DATE_THRESHOLD_DAYS || '365',
  10,
);
const OLD_CONGRESS_THRESHOLD = Number.parseInt(process.env.AUDIT_OLD_CONGRESS_THRESHOLD || '117', 10);

function initAdmin() {
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.error(
      '[audit] Set GOOGLE_APPLICATION_CREDENTIALS to the path of your service account JSON file.',
    );
    process.exit(1);
  }
  if (admin.apps.length) return;
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: PROJECT_ID,
  });
}

function parseCollectionNamesFromAuditDoc(markdown) {
  const rows = markdown.split('\n');
  const names = [];
  const seen = new Set();

  for (const row of rows) {
    const match = row.match(/^\|\s*\d+\s*\|\s*`([^`]+)`\s*\|/);
    if (!match) continue;
    const name = match[1].trim();
    if (!name || seen.has(name)) continue;
    seen.add(name);
    names.push(name);
  }

  return names;
}

function toIsoDate(d) {
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

function toDate(value) {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (typeof value === 'object' && typeof value.toDate === 'function') {
    const d = value.toDate();
    if (d instanceof Date && !Number.isNaN(d.getTime())) return d;
  }
  if (typeof value === 'string') {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) return d;
  }
  if (typeof value === 'number') {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return null;
}

function formatValue(v) {
  if (v == null) return '(null)';
  if (typeof v === 'string') return v.trim() || '(empty)';
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (Array.isArray(v)) return `array(${v.length})`;
  if (typeof v === 'object') return 'object';
  return String(v);
}

function flattenTopLevelKeys(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return [];
  return Object.keys(data);
}

function tally(map, key) {
  map.set(key, (map.get(key) || 0) + 1);
}

function takeTopEntries(map, limit) {
  return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit);
}

async function getCollectionCount(collectionRef) {
  try {
    const aggregateSnap = await collectionRef.count().get();
    return { value: aggregateSnap.data().count, approximate: false };
  } catch (err) {
    return { value: null, approximate: true, error: err.message || String(err) };
  }
}

function detectStaleness(sampleDocs) {
  const now = Date.now();
  const oldCutoff = now - OLD_DATE_THRESHOLD_DAYS * 24 * 60 * 60 * 1000;
  let oldDateCount = 0;
  let hasAnyDateField = 0;
  let hasLastUpdatedField = 0;
  let missingLastUpdatedCount = 0;
  let oldCongressCount = 0;
  let hasCongressCount = 0;

  const newestDates = [];
  const oldestDates = [];

  for (const { data } of sampleDocs) {
    const keys = Object.keys(data || {});
    const hasLastUpdated = keys.some((k) => ['last_updated', 'updated_at', 'updatedAt'].includes(k));
    if (hasLastUpdated) hasLastUpdatedField += 1;
    else missingLastUpdatedCount += 1;

    let foundDate = null;
    for (const field of STALE_DATE_FIELDS) {
      if (!(field in data)) continue;
      const d = toDate(data[field]);
      if (!d) continue;
      if (!foundDate || d > foundDate) foundDate = d;
    }
    if (foundDate) {
      hasAnyDateField += 1;
      if (foundDate.getTime() < oldCutoff) oldDateCount += 1;
      newestDates.push(foundDate);
      oldestDates.push(foundDate);
    }

    if ('congress' in data) {
      hasCongressCount += 1;
      const c = Number.parseInt(String(data.congress), 10);
      if (Number.isFinite(c) && c < OLD_CONGRESS_THRESHOLD) oldCongressCount += 1;
    }
  }

  newestDates.sort((a, b) => b - a);
  oldestDates.sort((a, b) => a - b);

  const signals = [];
  if (hasAnyDateField && oldDateCount / hasAnyDateField >= 0.7) {
    signals.push(`Most sampled docs have old dates (>${OLD_DATE_THRESHOLD_DAYS}d).`);
  }
  if (hasCongressCount && oldCongressCount / hasCongressCount >= 0.7) {
    signals.push(`Most sampled docs use old congress numbers (<${OLD_CONGRESS_THRESHOLD}).`);
  }
  if (sampleDocs.length >= 10 && missingLastUpdatedCount / sampleDocs.length >= 0.8) {
    signals.push('Most sampled docs are missing last_updated/updated_at.');
  }

  return {
    signals,
    oldDateCount,
    hasAnyDateField,
    hasLastUpdatedField,
    missingLastUpdatedCount,
    oldCongressCount,
    hasCongressCount,
    newestDate: toIsoDate(newestDates[0]),
    oldestDate: toIsoDate(oldestDates[0]),
  };
}

function detectCrossCollectionOverlap(a, b) {
  const idOverlap = new Set(a.sampleDocIds.filter((id) => b.sampleDocIds.includes(id)));
  const fieldOverlap = [];
  for (const f of IMPORTANT_FIELDS) {
    const av = new Set((a.distinct?.[f] || []).map((x) => x.value));
    const bv = new Set((b.distinct?.[f] || []).map((x) => x.value));
    let shared = 0;
    for (const v of av) {
      if (bv.has(v)) shared += 1;
    }
    if (shared > 0) fieldOverlap.push(`${f}:${shared}`);
  }
  return {
    idOverlap: [...idOverlap],
    fieldOverlap,
  };
}

async function analyzeCollection(db, collectionName) {
  const ref = db.collection(collectionName);
  const countInfo = await getCollectionCount(ref);

  const sampleSnap = await ref.limit(SAMPLE_DOCS_FOR_ANALYSIS).get();
  const sampleDocs = [];
  sampleSnap.forEach((doc) => sampleDocs.push({ id: doc.id, data: doc.data() || {} }));

  const fieldFreq = new Map();
  const distinctMaps = new Map(IMPORTANT_FIELDS.map((f) => [f, new Map()]));

  for (const { data } of sampleDocs) {
    flattenTopLevelKeys(data).forEach((k) => tally(fieldFreq, k));
    for (const f of IMPORTANT_FIELDS) {
      if (!(f in data)) continue;
      const v = formatValue(data[f]);
      tally(distinctMaps.get(f), v);
    }
  }

  const topFields = takeTopEntries(fieldFreq, MAX_TOP_FIELDS).map(([field, count]) => ({
    field,
    count,
  }));

  const distinct = {};
  for (const field of IMPORTANT_FIELDS) {
    distinct[field] = takeTopEntries(distinctMaps.get(field), MAX_DISTINCT_VALUES_PER_FIELD).map(
      ([value, count]) => ({ value, count }),
    );
  }

  const stale = detectStaleness(sampleDocs);

  return {
    collection: collectionName,
    count: countInfo.value,
    countApproximate: countInfo.approximate,
    countError: countInfo.error || null,
    sampleSize: sampleDocs.length,
    sampleDocIds: sampleDocs.slice(0, SAMPLE_IDS_LIMIT).map((d) => d.id),
    topFields,
    distinct,
    stale,
  };
}

function mdEscapePipe(s) {
  return String(s).replace(/\|/g, '\\|');
}

function renderCompactDistinct(distinctEntries) {
  if (!distinctEntries || !distinctEntries.length) return '—';
  return distinctEntries
    .slice(0, 5)
    .map((x) => `${x.value} (${x.count})`)
    .join(', ');
}

function renderSummaryTable(results) {
  const header = [
    '| Collection | Doc count | Sample IDs | Common fields (sample) | Distinct status/type/source/jurisdiction (sample) | Stale signal |',
    '|------------|-----------|------------|-------------------------|----------------------------------------------------|-------------|',
  ];

  const rows = results.map((r) => {
    const count =
      r.count == null
        ? `approx: ${r.sampleSize}+`
        : `${r.count}${r.countApproximate ? ' (approx)' : ''}`;
    const sampleIds = r.sampleDocIds.length ? r.sampleDocIds.join(', ') : '—';
    const fields = r.topFields
      .slice(0, 8)
      .map((f) => `${f.field}(${f.count})`)
      .join(', ');
    const distinct = [
      `status: ${renderCompactDistinct(r.distinct.status)}`,
      `type: ${renderCompactDistinct(r.distinct.type)}`,
      `source: ${renderCompactDistinct(r.distinct.source_name || r.distinct.source)}`,
      `jurisdiction: ${renderCompactDistinct(r.distinct.jurisdiction || r.distinct.country)}`,
    ].join(' | ');
    const stale = r.stale.signals.length ? r.stale.signals.join(' ') : 'No obvious stale signal in sample';
    return `| \`${mdEscapePipe(r.collection)}\` | ${mdEscapePipe(count)} | ${mdEscapePipe(
      sampleIds,
    )} | ${mdEscapePipe(fields || '—')} | ${mdEscapePipe(distinct)} | ${mdEscapePipe(stale)} |`;
  });

  return [...header, ...rows].join('\n');
}

function renderCollectionDetails(results) {
  const sections = [];
  for (const r of results) {
    const distinctLines = IMPORTANT_FIELDS.map((f) => {
      const values = renderCompactDistinct(r.distinct[f]);
      return `- \`${f}\`: ${values}`;
    }).join('\n');

    sections.push(
      [
        `### \`${r.collection}\``,
        '',
        `- Document count: ${
          r.count == null
            ? `Unavailable via aggregate (sampled ${r.sampleSize} docs)`
            : `${r.count}${r.countApproximate ? ' (approx)' : ''}`
        }`,
        `- Sample document IDs: ${r.sampleDocIds.length ? r.sampleDocIds.join(', ') : '—'}`,
        `- Common top-level fields in sample: ${
          r.topFields.length
            ? r.topFields.slice(0, 12).map((x) => `${x.field} (${x.count})`).join(', ')
            : '—'
        }`,
        '- Distinct important fields (sample-limited):',
        distinctLines,
        `- Stale checks: ${
          r.stale.signals.length ? r.stale.signals.join(' ') : 'No obvious stale signal in sampled docs.'
        }`,
        `- Date range in sample: newest=${r.stale.newestDate || '—'}, oldest=${r.stale.oldestDate || '—'}`,
        `- last_updated/updated_at coverage in sample: ${r.stale.hasLastUpdatedField}/${r.sampleSize}`,
        `- congress old-value signal in sample: ${r.stale.oldCongressCount}/${r.stale.hasCongressCount}`,
        '',
      ].join('\n'),
    );
  }
  return sections.join('\n');
}

function renderOverlapSection(resultMap) {
  const lines = ['## Duplicate / overlap checks', ''];
  for (const group of DUPLICATE_GROUPS) {
    const available = group.filter((name) => resultMap.has(name));
    lines.push(`### ${group.map((x) => `\`${x}\``).join(' vs ')}`);
    if (available.length < 2) {
      lines.push('- Not enough collections present in this audit run to compare.');
      lines.push('');
      continue;
    }

    for (let i = 0; i < available.length; i += 1) {
      for (let j = i + 1; j < available.length; j += 1) {
        const a = resultMap.get(available[i]);
        const b = resultMap.get(available[j]);
        const overlap = detectCrossCollectionOverlap(a, b);
        lines.push(`- \`${a.collection}\` vs \`${b.collection}\``);
        lines.push(
          `  - Sample doc ID overlap: ${
            overlap.idOverlap.length ? overlap.idOverlap.slice(0, 5).join(', ') : 'none'
          }`,
        );
        lines.push(
          `  - Shared distinct-value hints (sample): ${
            overlap.fieldOverlap.length ? overlap.fieldOverlap.join(', ') : 'none'
          }`,
        );
      }
    }
    lines.push('');
  }
  return lines.join('\n');
}

function buildMarkdownReport(collectionNames, results) {
  const now = new Date().toISOString();
  const resultMap = new Map(results.map((r) => [r.collection, r]));
  const missing = collectionNames.filter((c) => !resultMap.has(c));

  return [
    '# Firestore inventory live report',
    '',
    `Generated: ${now}`,
    `Project: \`${PROJECT_ID}\``,
    '',
    '## Guardrails',
    '',
    '- This script is read-only for Firestore data.',
    '- No Firestore writes/deletes/migrations are performed.',
    '- Uses Admin credentials from `GOOGLE_APPLICATION_CREDENTIALS` only.',
    '- Output file is local markdown only.',
    '',
    '## Collections audited',
    '',
    `- Requested from inventory doc: ${collectionNames.length}`,
    `- Successfully sampled: ${results.length}`,
    `- Sample size per collection: up to ${SAMPLE_DOCS_FOR_ANALYSIS}`,
    `- Old-date threshold: ${OLD_DATE_THRESHOLD_DAYS} days`,
    '',
    renderSummaryTable(results),
    '',
    renderOverlapSection(resultMap),
    '',
    '## Per-collection detail',
    '',
    renderCollectionDetails(results),
    missing.length ? `## Missing collections\n\n- ${missing.map((x) => `\`${x}\``).join('\n- ')}` : '',
    '',
    '## Next action',
    '',
    '- Use this live report with `docs/FIRESTORE_INVENTORY_AUDIT.md` before changing any feature data source.',
    '- If duplicate groups overlap strongly, pick one source-of-truth collection per feature before new ingestion.',
    '',
  ].join('\n');
}

async function main() {
  console.log('[audit] Firestore inventory audit (read-only)');
  console.log(`[audit] Loading collection list from: ${AUDIT_DOC_PATH}`);

  if (!fs.existsSync(AUDIT_DOC_PATH)) {
    throw new Error(`Audit document not found at ${AUDIT_DOC_PATH}`);
  }

  const auditMarkdown = fs.readFileSync(AUDIT_DOC_PATH, 'utf8');
  const collectionNames = parseCollectionNamesFromAuditDoc(auditMarkdown);
  if (!collectionNames.length) {
    throw new Error(
      'No collections parsed from docs/FIRESTORE_INVENTORY_AUDIT.md (expected numbered table rows).',
    );
  }

  initAdmin();
  const db = admin.firestore();

  console.log(`[audit] Parsed ${collectionNames.length} collections.`);
  const results = [];

  for (const name of collectionNames) {
    process.stdout.write(`[audit] Sampling ${name} ... `);
    try {
      const res = await analyzeCollection(db, name);
      results.push(res);
      console.log('ok');
    } catch (err) {
      console.log(`failed (${err.message || err})`);
    }
  }

  const report = buildMarkdownReport(collectionNames, results);
  fs.writeFileSync(OUTPUT_PATH, report, 'utf8');
  console.log(`[audit] Wrote report: ${OUTPUT_PATH}`);
  console.log('[audit] Done.');
}

main().catch((err) => {
  console.error('[audit] Fatal:', err);
  process.exit(1);
});
