/**
 * Maps `executive_actions` (Federal Register presidential docs) → Executive Orders UI row shape.
 * Supports snake_case (`source_url`, `last_updated`) and camelCase aliases when present.
 */

import { formatExecutiveOrderDisplayDate } from './executiveOrderDates';

function parseLastUpdatedMs(raw) {
  if (raw == null) return null;
  if (typeof raw === 'string') {
    const t = Date.parse(raw);
    return Number.isNaN(t) ? null : t;
  }
  if (typeof raw.toMillis === 'function') return raw.toMillis();
  if (typeof raw.seconds === 'number') return raw.seconds * 1000;
  return null;
}

function extractDocumentNumberFromFrUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const m = url.match(/\/documents\/\d{4}\/\d{2}\/\d{2}\/([^/]+)\//);
  return m ? m[1] : '';
}

function extractEoNumberFromTitle(title) {
  if (!title || typeof title !== 'string') return null;
  const m = title.match(/Executive Order\s*(\d+)/i);
  return m ? m[1] : null;
}

function extractEoNumberFromAbstract(text) {
  if (!text || typeof text !== 'string') return null;
  const m = text.match(/Executive Order\s*(\d+)/i);
  return m ? m[1] : null;
}

/** Prefer FR / ingest numeric EO identifiers when stored on the document. */
function extractEoDigitsFromDocumentFields(d) {
  const candidates = [
    d.executive_order_number,
    d.executiveOrderNumber,
    d.eo_number,
    d.eoNumber,
  ];
  for (const c of candidates) {
    if (c == null) continue;
    const digits = String(c).replace(/\D/g, '');
    if (digits.length >= 2) return digits;
  }
  return null;
}

/**
 * @param {import('firebase/firestore').DocumentSnapshot} docSnap
 */
export function mapExecutiveActionsOrderDoc(docSnap) {
  const d = docSnap.data() || {};
  const id = docSnap.id;

  const sourceUrl = d.source_url || d.sourceUrl || '';
  const docNumber =
    d.document_number || d.documentNumber || extractDocumentNumberFromFrUrl(sourceUrl);
  const dateRaw = d.date || d.signing_date || d.signingDate || '';
  const abstractText =
    typeof d.abstract === 'string'
      ? d.abstract.trim()
      : typeof d.summary === 'string'
        ? d.summary.trim()
        : '';
  const eoDigits =
    extractEoDigitsFromDocumentFields(d) ||
    extractEoNumberFromTitle(d.title) ||
    extractEoNumberFromAbstract(abstractText);

  const numberLabel = eoDigits ? `EO ${eoDigits}` : docNumber ? `FR ${docNumber}` : 'Executive Order';


  const lastRaw = d.last_updated || d.lastUpdated || d.lastFetchedAt;
  const lastFetchedAtMs = parseLastUpdatedMs(lastRaw);

  return {
    id,
    number: numberLabel,
    docNumber: docNumber || '',
    title: d.title || 'Untitled',
    signingDate: typeof dateRaw === 'string' ? dateRaw : '',
    publicationDate: d.publication_date || d.publicationDate || '',
    date: formatExecutiveOrderDisplayDate(typeof dateRaw === 'string' ? dateRaw : ''),
    sourceUrl,
    pdfUrl: d.pdf_url || d.pdfUrl || '',
    citation: d.citation || '',
    president: d.member_name || d.president || 'Donald J. Trump',
    description: abstractText
      ? `${abstractText.slice(0, 220)}${abstractText.length > 220 ? '…' : ''}`
      : '',
    summary: abstractText,
    summaryIsEditorial: Boolean(
      d.summaryType === 'ai_assisted_editorial' && typeof d.plainLanguageSummary === 'string',
    ),
    summaryType: d.summaryType || null,
    summaryReviewed: d.summaryReviewed === true,
    plainLanguageSummary: typeof d.plainLanguageSummary === 'string' ? d.plainLanguageSummary : null,
    pros: Array.isArray(d.argumentsFor) ? d.argumentsFor : [],
    cons: Array.isArray(d.argumentsAgainst) ? d.argumentsAgainst : [],
    support: 0,
    oppose: 0,
    dataStatus: d.dataStatus || 'official_source',
    lastFetchedAtMs,
    lastFetchedAtLabel: lastFetchedAtMs
      ? new Date(lastFetchedAtMs).toLocaleString('en-US')
      : null,
    /** Original FR document class from Firestore, e.g. "Executive Order" */
    frDocumentType: d.type || '',
  };
}
