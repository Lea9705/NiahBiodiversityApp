const CONSERVATION_STATUS = {
  LC: 'Least Concern',
  NT: 'Near Threatened',
  VU: 'Vulnerable',
  EN: 'Endangered',
  CR: 'Critically Endangered',
  EW: 'Extinct in the Wild',
  EX: 'Extinct',
  DD: 'Data Deficient',
  NE: 'Not Evaluated',
};

export function formatConservationStatus(value) {
  const raw = String(value ?? '').trim();

  if (!raw) return '';

  const normalized = raw.toUpperCase().replace(/\s+/g, ' ');

  // If the value is already a short code, return code + full name.
  if (CONSERVATION_STATUS[normalized]) {
    return `${normalized} — ${CONSERVATION_STATUS[normalized]}`;
  }

  // If the value is a full name, find its matching short code.
  const match = Object.entries(CONSERVATION_STATUS).find(
    ([, name]) => name.toLowerCase() === raw.toLowerCase()
  );

  if (match) {
    return `${match[0]} — ${match[1]}`;
  }

  // Preserve values that are not in the mapping.
  return raw;
}