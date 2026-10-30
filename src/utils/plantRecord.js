// Turns a plant from the cloud list into the record that the plant record page
// reads, so a plant that is not saved on this phone still looks exactly the same.
export function recordFromCloudPlant(plant) {
  return {
    ...plant,
    id: String(plant.id),
    serverId: String(plant.id),
    scientificName: plant.scientific_name || '',
    commonName: plant.common_name || '',
    family: plant.family || '',
    height: plant.height_m == null ? '' : String(plant.height_m),
    diameter: plant.diameter_cm == null ? '' : String(plant.diameter_cm),
    latitude: plant.latitude == null ? '' : String(plant.latitude),
    longitude: plant.longitude == null ? '' : String(plant.longitude),
    notes: plant.morphological_notes || '',
    photos: Array.isArray(plant.images) ? plant.images : [],
    approvalStatus: plant.plant_status,
    createdAt: plant.created_at,
  };
}
