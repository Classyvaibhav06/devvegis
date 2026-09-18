import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/env';

function getStorageConfig() {
  const endpoint = process.env.AWS_ENDPOINT_URL_S3 || config.AWS_ENDPOINT_URL_S3;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID || config.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || config.AWS_SECRET_ACCESS_KEY;
  const region = process.env.AWS_REGION || config.AWS_REGION || 'us-east-2';
  const bucket = process.env.AWS_BUCKET_NAME || config.AWS_BUCKET_NAME || 'uploads';

  return { endpoint, accessKeyId, secretAccessKey, region, bucket };
}

let cachedS3Client: S3Client | null = null;

export function getS3Client(): S3Client | null {
  const { endpoint, accessKeyId, secretAccessKey, region } = getStorageConfig();

  if (!endpoint || !accessKeyId || !secretAccessKey) {
    return null;
  }

  if (!cachedS3Client) {
    cachedS3Client = new S3Client({
      forcePathStyle: true,
      region,
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }
  return cachedS3Client;
}

// Backward-compatible export
export const s3Client = getS3Client();

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
  const { endpoint, bucket } = getStorageConfig();
  const client = getS3Client();

  if (client && endpoint) {
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
        CacheControl: 'public, max-age=31536000, immutable',
      })
    );

    // Neon S3 public URL format (path-style): ${AWS_ENDPOINT_URL_S3}/${bucket}/${key}
    const endpointTrimmed = endpoint.replace(/\/+$/, '');
    const publicUrl = `${endpointTrimmed}/${bucket}/${key}`;

    return { url: publicUrl, key };
  }

  // Local disk fallback for local development only
  try {
    const uploadDir = path.join(process.cwd(), config.UPLOAD_DIR, folder);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, buffer);

    const localUrl = `${config.API_URL}/uploads/${folder}/${filename}`;
    return { url: localUrl, key };
  } catch (err: any) {
    throw new Error(`Storage upload failed: S3 credentials are not configured and local disk write failed: ${err?.message}`);
  }
}

/**
 * Deletes an object from Neon S3 by key or URL
 */
export async function deleteFileFromStorage(keyOrUrl: string): Promise<void> {
  const client = getS3Client();
  const { endpoint, bucket } = getStorageConfig();
  if (!client || !endpoint) return;

  try {
    let key = keyOrUrl;
    if (keyOrUrl.startsWith('http')) {
      const parts = keyOrUrl.split(`/${bucket}/`);
      if (parts.length > 1) {
        key = parts[1];
      }
    }

    await client.send(
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
  const client = getS3Client();
  const { endpoint, bucket } = getStorageConfig();
  if (!client || !endpoint) {
    return `${config.API_URL}/uploads/${key}`;
  }

  return getSignedUrl(
    client,
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
    { expiresIn }
  );
}

