// Shared logic for submitting a single local record to the cloud.
import { uploadAllPhotos } from './uploadPhoto';
import { authFetch, getUser } from './session';

const API_URL = 'http://52.62.125.146/api/plants';

// Remembers the photo links already uploaded for each record (in memory
// only), so a retry doesn't upload the same photos to S3 again.
const uploadedPhotoCache = {};

// Empty text fields become null instead of 0 or an empty string.
const toNumberOrNull = (value) =>
  value === '' || value === null || value === undefined ? null : Number(value);

export async function syncRecordToCloud(record) {
  let photoUrls = uploadedPhotoCache[record.id];

  if (!photoUrls) {
    photoUrls =
      record.photos?.length > 0
        ? await uploadAllPhotos(record.photos, record)
        : [];
    uploadedPhotoCache[record.id] = photoUrls;
  }

  const body = {
    scientificName: record.scientificName,
    commonName: record.commonName,
    family: record.family,
    latitude: toNumberOrNull(record.latitude),
    longitude: toNumberOrNull(record.longitude),
    height: toNumberOrNull(record.height),
    diameter_cm: toNumberOrNull(record.diameter),
    notes: record.notes,
    imageUrl: photoUrls[0] || null,
    // The backend reads this one. It saves every photo link.
    imageUrls: photoUrls,
    // The botanist who is logged in, so the web shows who submitted it.
    submitted_by: getUser()?.id ?? null,
  };

  const response = await authFetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
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