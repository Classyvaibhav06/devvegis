import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/env';

const hasS3Config = Boolean(
  config.AWS_ENDPOINT_URL_S3 &&
  config.AWS_ACCESS_KEY_ID &&
  config.AWS_SECRET_ACCESS_KEY
);

// S3 Client configured for Neon Object Storage (requires forcePathStyle: true)
export const s3Client = hasS3Config
  ? new S3Client({
      forcePathStyle: true,
      region: config.AWS_REGION || 'us-east-2',
      endpoint: config.AWS_ENDPOINT_URL_S3,
      credentials: {
        accessKeyId: config.AWS_ACCESS_KEY_ID,
        secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
      },
    })
  : null;

/**
 * Uploads a file buffer to Neon Object Storage (S3), or falls back to local disk if S3 is not yet provisioned.
 * @param buffer File content buffer
 * @param originalName Original file name
 * @param mimeType MIME type (e.g. image/webp, image/jpeg)
 * @param folder Subfolder prefix (e.g. 'products', 'categories', 'avatars')
 * @returns Public URL of the uploaded object
 */
export async function uploadFileBuffer(
  buffer: Buffer,
  originalName: string,
  mimeType: string,
  folder = 'general'
): Promise<{ url: string; key: string }> {
  const ext = path.extname(originalName).toLowerCase() || '.webp';
  const filename = `${uuidv4()}${ext}`;
  const key = `${folder}/${filename}`;

  if (s3Client && config.AWS_ENDPOINT_URL_S3) {
    const bucket = config.AWS_BUCKET_NAME || 'uploads';

    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
        CacheControl: 'public, max-age=31536000, immutable',
      })
    );

    // Neon S3 public URL format (path-style): ${AWS_ENDPOINT_URL_S3}/${bucket}/${key}
    const endpointTrimmed = config.AWS_ENDPOINT_URL_S3.replace(/\/+$/, '');
    const publicUrl = `${endpointTrimmed}/${bucket}/${key}`;

    return { url: publicUrl, key };
  }

  // Local disk fallback when S3 environment credentials are not present
  const uploadDir = path.join(process.cwd(), config.UPLOAD_DIR, folder);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  const filePath = path.join(uploadDir, filename);
  fs.writeFileSync(filePath, buffer);

  const localUrl = `${config.API_URL}/uploads/${folder}/${filename}`;
  return { url: localUrl, key };
}

/**
 * Deletes an object from Neon S3 by key or URL
 */
export async function deleteFileFromStorage(keyOrUrl: string): Promise<void> {
  if (!s3Client || !config.AWS_ENDPOINT_URL_S3) return;

  try {
    let key = keyOrUrl;
    const bucket = config.AWS_BUCKET_NAME || 'uploads';
    if (keyOrUrl.startsWith('http')) {
      const parts = keyOrUrl.split(`/${bucket}/`);
      if (parts.length > 1) {
        key = parts[1];
      }
    }

    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    );
  } catch (error) {
    console.error('Failed to delete object from storage:', error);
  }
}

/**
 * Generates a presigned GET URL for an object (e.g. private invoices, delivery proofs)
 */
export async function getPresignedDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
  if (!s3Client || !config.AWS_ENDPOINT_URL_S3) {
    return `${config.API_URL}/uploads/${key}`;
  }

  const bucket = config.AWS_BUCKET_NAME || 'uploads';
  return getSignedUrl(
    s3Client,
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
    { expiresIn }
  );
}

