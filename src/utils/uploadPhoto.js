// Uploads a single local photo to S3 via a presigned URL, and returns
// the final public URL to store in the plant record.
//
// PLACEHOLDER: swap this for your friend's real endpoint once he sends it.
const PRESIGN_ENDPOINT = 'http://52.62.125.146/api/presign-upload';

export async function uploadPhotoToS3(localUri, plantContext) {
  const fileName = `${plantContext.id || Date.now()}_${Date.now()}.jpg`;

  // Step 1: ask the backend for a presigned URL to upload to.
  const presignResponse = await fetch(PRESIGN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fileName,
      contentType: 'image/jpeg',
    }),
  });

  if (!presignResponse.ok) {
    throw new Error('Could not get an upload link from the server.');
  }

  const { uploadUrl, fileUrl } = await presignResponse.json();

  // Step 2: read the local photo file and upload it directly to S3.
  const fileResponse = await fetch(localUri);
  const blob = await fileResponse.blob();

  const uploadResult = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': 'image/jpeg' },
    body: blob,
  });

  if (!uploadResult.ok) {
    throw new Error('Photo upload to storage failed.');
  }

  // Step 3: return the final URL - this is what gets saved in the
  // plant record, not the local device file path.
  return fileUrl;
}

// Uploads every photo in a record, one at a time, and returns the array
// of resulting S3 URLs in the same order.
export async function uploadAllPhotos(photoUris, plantContext) {
  const uploadedUrls = [];
  for (const uri of photoUris) {
    const url = await uploadPhotoToS3(uri, plantContext);
    uploadedUrls.push(url);
  }
  return uploadedUrls;
}