// What the server currently says about a plant record (its status, who
// reviewed it, the rejection note, when it was last edited), and how to lay
// that over the copy of the record a page was opened with.
//
// A page is opened with a copy of the record taken at that moment. It can be
// out of date: for example an admin approves the record afterwards.
import { normalizeApproval } from './approval';

// Reads a plant as the server returns it. Returns null if it is not one.
export function normalizeLiveStatus(plant) {
  if (!plant || typeof plant !== 'object') return null;

  const raw = plant.plant_status != null ? plant.plant_status : plant.status;

  if (raw == null || raw === '') return null;

  return {
    status: normalizeApproval(raw),
    reviewer: plant.reviewer_name ? String(plant.reviewer_name) : '',
    reason: plant.reason ? String(plant.reason) : '',
    lastEdit: plant.last_edit || null,
  };
}

export function sameLiveStatus(a, b) {
  if (!a || !b) return a === b;

  return (
    a.status === b.status &&
    a.reviewer === b.reviewer &&
    a.reason === b.reason &&
    (a.lastEdit || null) === (b.lastEdit || null)
  );
}

// The record with the server's current status laid over it.
export function mergeLiveStatus(record, live) {
  if (!live || !record) return record;

  // Edits that are still waiting on this phone are newer than the server's
  // copy, so the phone's own copy stays.
  if (record.status === 'pending') return record;

  return {
    ...record,
    approvalStatus: live.status,
    reviewerName: live.reviewer || record.reviewerName,
    rejectionReason: live.status === 'Rejected' ? live.reason : '',
    lastEdit: live.lastEdit || record.lastEdit,
  };
}

// One line for the Time log.
export function describeLiveStatus(live) {
  if (!live) return '';

  const by = live.reviewer ? ` by ${live.reviewer}` : '';

  if (live.status === 'Approved') return `Approved${by}`;
  if (live.status === 'Rejected') return `Rejected${by}`;

  return 'Pending review. Waiting for an admin to approve it.';
}
