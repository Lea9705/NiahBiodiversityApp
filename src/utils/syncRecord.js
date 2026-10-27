import * as SecureStore from 'expo-secure-store';
// Shared logic for submitting a single local record to the cloud.
import { uploadAllPhotos } from './uploadPhoto';

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

  const token = await SecureStore.getItemAsync('authToken');
  const userJson = await SecureStore.getItemAsync('authUser');
  if (!token || !userJson) {
    throw new Error('You must log in before syncing plant records.');
  }

  let user;
  try {
    user = JSON.parse(userJson);
  } catch {
    throw new Error('Saved login details are invalid. Please log in again.');
  }
  if (user?.id == null) {
    throw new Error('Your login session has no user ID. Please log in again.');
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
    submitted_by: user.id,
  };

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
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