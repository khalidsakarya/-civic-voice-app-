/**
 * `executive_actions.type` values observed / expected from Federal Register–backed presidential docs.
 *
 * Production data uses exact labels such as **Executive Order** (allowlisted below). Proclamations use
 * labels containing **Proclamation** — rejected via subtype slug and explicit string guards.
 *
 * We use a strict allowlist (case-insensitive) so proclamations, memoranda, notices, determinations,
 * etc. never slip through. If your pipeline stores a different EO label, add it to `EO_TYPE_ALLOWLIST`.
 *
 * To audit distinct values in your project: Firebase Console → Firestore → `executive_actions`
 * → filter `source_name == Federal Register` → inspect `type` on a few rows.
 */
export const EO_TYPE_ALLOWLIST = [
  'Executive Order',
  'Presidential Executive Order',
];

const NORMALIZED_ALLOWLIST = new Set(
  EO_TYPE_ALLOWLIST.map((s) => s.trim().toLowerCase().replace(/\.$/, '')),
);

/** Normalizes Federal Register / ingest quirks before matching. */
function normalizeTypeLabel(type) {
  if (type == null || typeof type !== 'string') return '';
  return type.trim().replace(/\.$/, '').replace(/\s+/g, ' ');
}

/**
 * Returns true only for rows that should appear on the Executive Orders screen.
 * Does not match title text — only the document-type field (`type`).
 */
export function isExecutiveOrderDocumentType(type) {
  const n = normalizeTypeLabel(type).toLowerCase();
  if (!n) return false;
  return NORMALIZED_ALLOWLIST.has(n);
}

/** Must match `source_name` on FR-backed docs in `executive_actions`. */
export const FEDERAL_REGISTER_SOURCE_NAME = 'Federal Register';

export const US_EXECUTIVE_ORDERS_POLITICIAN_SLUG = 'donald-trump';

/** Exact `member_name` values observed for the current US president in `executive_actions`. */
export const US_EXECUTIVE_ORDERS_MEMBER_NAMES = new Set(['Donald Trump', 'Donald J. Trump']);

export function matchesUsExecutiveOrdersPresident(data) {
  if (!data || typeof data !== 'object') return false;
  const slug = String(data.politician_slug || '').toLowerCase();
  if (slug === US_EXECUTIVE_ORDERS_POLITICIAN_SLUG) return true;
  const name = data.member_name;
  return typeof name === 'string' && US_EXECUTIVE_ORDERS_MEMBER_NAMES.has(name);
}

function normalizeFrSubtype(raw) {
  return String(raw || '')
    .trim()
    .toLowerCase()
    .replace(/-/g, '_');
}

/**
 * True if this row should appear on the Executive Orders screen.
 * Uses human `type` when present; also honors Federal Register-style subtype slug `executive_order`.
 * Excludes proclamations, memoranda, notices, determinations whether encoded as slug or label.
 */
export function isExecutiveOrderDoc(data) {
  if (!data || typeof data !== 'object') return false;
  const humanType = normalizeTypeLabel(data.type).toLowerCase();
  if (humanType.includes('proclamation')) return false;
  if (humanType.includes('memorandum')) return false;

  const sub = normalizeFrSubtype(data.presidential_document_type || data.presidentialDocumentType);
  if (sub === 'proclamation' || sub === 'memorandum' || sub === 'notice' || sub === 'determination') return false;
  if (sub === 'executive_order') return true;
  return isExecutiveOrderDocumentType(data.type);
}
