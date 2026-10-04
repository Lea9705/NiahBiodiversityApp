// Uploads photos to S3 using a presigned PUT link that is signed on the
// phone (AWS Signature V4, no AWS SDK needed). The upload itself is a
// plain fetch PUT.
//
// When the backend's presign route exists, replace createPresignedUpload()
// with a call to it. Nothing else in this file needs to change.
import HmacSHA256 from 'crypto-js/hmac-sha256';
import SHA256 from 'crypto-js/sha256';
import Hex from 'crypto-js/enc-hex';

const ACCESS_KEY = process.env.EXPO_PUBLIC_AWS_ACCESS_KEY_ID;
const SECRET_KEY = process.env.EXPO_PUBLIC_AWS_SECRET_ACCESS_KEY;
const REGION = process.env.EXPO_PUBLIC_AWS_REGION;
const BUCKET = process.env.EXPO_PUBLIC_S3_BUCKET;

function createPresignedUpload(fileName) {
  if (!ACCESS_KEY || !SECRET_KEY || !REGION || !BUCKET) {
    throw new Error('AWS settings are missing. Check your .env file and restart with: npx expo start -c');
  }

  const key = `plants/${fileName}`;
  const host = `${BUCKET}.s3.${REGION}.amazonaws.com`;
  const canonicalUri = '/' + key.split('/').map(encodeURIComponent).join('/');

  // e.g. 20261004T081530Z
  const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.slice(0, 8);
  const scope = `${dateStamp}/${REGION}/s3/aws4_request`;

  const params = {
    'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
    'X-Amz-Credential': `${ACCESS_KEY}/${scope}`,
    'X-Amz-Date': amzDate,
    'X-Amz-Expires': '300',
    'X-Amz-SignedHeaders': 'host',
  };

  const canonicalQuery = Object.keys(params)
    .sort()
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
    .join('&');

  const canonicalRequest = [
    'PUT',
    canonicalUri,
    canonicalQuery,
    `host:${host}\n`,
    'host',
    'UNSIGNED-PAYLOAD',
  ].join('\n');

  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    scope,
    SHA256(canonicalRequest).toString(Hex),
  ].join('\n');

  const kDate = HmacSHA256(dateStamp, `AWS4${SECRET_KEY}`);
  const kRegion = HmacSHA256(REGION, kDate);
  const kService = HmacSHA256('s3', kRegion);
  const kSigning = HmacSHA256('aws4_request', kService);
  const signature = HmacSHA256(stringToSign, kSigning).toString(Hex);

  return {
    uploadUrl: `https://${host}${canonicalUri}?${canonicalQuery}&X-Amz-Signature=${signature}`,
    fileUrl: `https://${host}${canonicalUri}`,
  };
}

export async function uploadPhotoToS3(localUri, plantContext) {
  const fileName = `${plantContext.id || Date.now()}_${Date.now()}.jpg`;

  const { uploadUrl, fileUrl } = createPresignedUpload(fileName);

  const fileResponse = await fetch(localUri);
  const blob = await fileResponse.blob();

  const uploadResult = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': 'image/jpeg' },
    body: blob,
  });

  if (!uploadResult.ok) {
    const detail = await uploadResult.text();
    console.log('S3 upload error:', uploadResult.status, detail);
    throw new Error(`Photo upload failed (${uploadResult.status}).`);
  }

  return fileUrl;
}

export async function uploadAllPhotos(photoUris, plantContext) {
  const uploadedUrls = [];
  for (const uri of photoUris) {
    uploadedUrls.push(await uploadPhotoToS3(uri, plantContext));
  }
  return uploadedUrls;
}