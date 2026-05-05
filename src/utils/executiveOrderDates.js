/** Shared date formatting for Executive Orders UI rows (Firestore + demo). */
export function formatExecutiveOrderDisplayDate(iso) {
  if (!iso || typeof iso !== 'string') return '—';
  const t = Date.parse(`${iso}T12:00:00`);
  if (Number.isNaN(t)) return iso;
  return new Date(t).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}
