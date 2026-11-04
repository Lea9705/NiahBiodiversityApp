// Decides whether a plant is threatened, using the list in
// src/data/threatenedSpecies.js.
import { THREATENED_SPECIES } from '../data/threatenedSpecies';

const clean = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

export function isThreatened(record, list = THREATENED_SPECIES) {
  const name = clean(record && record.scientificName);

  if (!name) return false;

  return list.some((entry) => clean(entry) === name);
}
