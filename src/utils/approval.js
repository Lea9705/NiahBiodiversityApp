// The server can send the approval status in different spellings
// ("approved", "Approved"...). This turns any of them into one of three.
export function normalizeApproval(value) {
  const status = String(value || '').trim().toLowerCase();

  if (status === 'approved') return 'Approved';
  if (status === 'rejected') return 'Rejected';
  return 'Pending';
}
