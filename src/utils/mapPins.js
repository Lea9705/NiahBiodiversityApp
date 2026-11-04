// Works out which plants get a pin on the map.
//  - only approved plants,
//  - only plants with a real location,
//  - never threatened plants (their location is hidden to protect them).
import { normalizeApproval } from './approval';
import { isThreatened } from './threatened';

// Same rule as the website's map.
export function hasValidCoordinates(record) {
  const { latitude, longitude } = record || {};

  if (
    latitude === null ||
    latitude === undefined ||
    longitude === null ||
    longitude === undefined ||
    String(latitude).trim() === '' ||
    String(longitude).trim() === ''
  ) {
    return false;
  }

  const lat = Number(latitude);
  const lng = Number(longitude);

  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

export function buildMapPins(records, { search = '', threatenedList } = {}) {
  const query = String(search || '').trim().toLowerCase();
  const seen = new Set();
  const pins = [];

  (records || []).forEach((record) => {
    if (!record) return;
    if (normalizeApproval(record.approvalStatus) !== 'Approved') return;
    if (!hasValidCoordinates(record)) return;
    if (isThreatened(record, threatenedList)) return;

    if (query) {
      const matches = [
        record.commonName,
        record.scientificName,
        record.family,
      ].some((value) => String(value || '').toLowerCase().includes(query));

      if (!matches) return;
    }

    // The same plant must never get two pins.
    const key = String(record.serverId || record.id);
    if (seen.has(key)) return;
    seen.add(key);

    pins.push({
      id: String(record.id),
      lat: Number(record.latitude),
      lng: Number(record.longitude),
      common: String(record.commonName || ''),
      scientific: String(record.scientificName || ''),
    });
  });

  return pins;
}
