// Shared logic for submitting a single local record to the cloud.
import { uploadAllPhotos } from './uploadPhoto';

const API_URL = 'http://52.62.125.146/api/plants';

// Remembers the photo links already uploaded for each record (in memory
// only), so a retry after a failed submit doesn't upload the same photos
// to S3 again.
const uploadedPhotoCache = {};

export async function syncRecordToCloud(record) {
  let photoUrls = uploadedPhotoCache[record.id];

  if (!photoUrls) {
    photoUrls =
      record.photos?.length > 0
        ? await uploadAllPhotos(record.photos, record)
        : [];
    uploadedPhotoCache[record.id] = photoUrls;
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      scientific_name: record.scientificName,
      common_name: record.commonName,
      family: record.family,
      latitude: Number(record.latitude),
      longitude: Number(record.longitude),
      height_m: Number(record.height),
      diameter_cm: Number(record.diameter),
      morphological_notes: record.notes,
      photos: photoUrls,
    }),
  });

  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    console.log('Server replied with non-JSON:', response.status, text.slice(0, 300));
    throw new Error(`Server error ${response.status} (not JSON)`);
  }

  if (!response.ok) {
    throw new Error(data.error || `Failed to submit plant record (${response.status}).`);
  }

  return data;
}