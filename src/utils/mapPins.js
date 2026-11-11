
// Works out which plants get a pin on the map.
// Rules:
// - Only approved plants.
// - Only plants with valid coordinates.
// - Visitors can only see LC and DD locations.
// - Botanists can see locations for all conservation statuses.

import { normalizeApproval } from './approval';
import { canViewPlantLocation } from './locationAccess';

// Check whether a plant has valid GPS coordinates.
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

// Build map pins according to the user's login status.
export function buildMapPins(
  records,
  { search = '', isBotanist = false } = {}
) {
  const query = String(search || '').trim().toLowerCase();
  const seen = new Set();
  const pins = [];

  (records || []).forEach((record) => {
    if (!record) return;

    // Only approved plant records can appear on the map.
    if (normalizeApproval(record.approvalStatus) !== 'Approved') return;

    // Only plants with valid GPS coordinates can appear.
    if (!hasValidCoordinates(record)) return;

    // Apply Visitor / Botanist conservation-status rules.
    if (!canViewPlantLocation(record, isBotanist)) return;

    // Apply search filter.
    if (query) {
      const matches = [
        record.commonName,
        record.scientificName,
        record.family,
      ].some((value) =>
        String(value || '').toLowerCase().includes(query)
      );

      if (!matches) return;
    }

    // Prevent duplicate plant pins.
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
