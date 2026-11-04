// Helpers for dates and for the "Time log" of a plant record.
import { normalizeApproval } from './approval';

// "3 Nov 2026, 5:20 PM" in the phone's own language and clock style.
export function formatDateTime(value) {
  if (!value) return '';

  const date = new Date(value);

  if (!Number.isFinite(date.getTime())) return '';

  try {
    return date.toLocaleString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch (error) {
    return date.toLocaleString();
  }
}

// Texts the server writes by itself. They add nothing, so they are not shown
// as extra detail under an entry.
const AUTOMATIC_SUMMARIES = [
  'initial plant registration observation',
  'updated plant growth measurements and morphological details',
];

// Turns the list of revisions from the server into the entries of the time
// log, newest first.
export function buildTimeLogEntries(revisions) {
  if (!Array.isArray(revisions)) return [];

  return [...revisions]
    .sort(
      (a, b) =>
        Number(b.revision_number || 0) - Number(a.revision_number || 0)
    )
    .map((revision) => {
      const summary = String(revision.change_summary || '').trim();
      const isAutomatic =
        !summary || AUTOMATIC_SUMMARIES.includes(summary.toLowerCase());

      const name = revision.editor_name || '';
      const role = revision.editor_role || '';

      // Status changes (approved, rejected) are written by the server as
      // "Status changed to ...". They are not edits.
      const isStatusChange = /^status changed to/i.test(summary);

      return {
        key: `revision-${revision.id ?? revision.revision_number}`,
        title:
          Number(revision.revision_number) === 1
            ? 'Record submitted'
            : isStatusChange
            ? 'Status changed'
            : 'Record edited',
        detail: isAutomatic ? '' : summary,
        by: name ? (role ? `${name} (${role})` : name) : '',
        time: revision.created_at || null,
        status: revision.plant_status
          ? normalizeApproval(revision.plant_status)
          : '',
      };
    });
}
