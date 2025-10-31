import { S3Client, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || '';

/**
 * Extract S3 key from file URL
 */
function extractS3Key(fileUrl: string): string | null {
  try {
    const url = new URL(fileUrl);
    // Extract key from S3 URL (e.g., https://bucket.s3.region.amazonaws.com/key)
    if (url.hostname.includes('s3') || url.hostname.includes('amazonaws.com')) {
      return url.pathname.slice(1); // Remove leading '/'
    }
    // If it's a relative path, assume it's the key
    if (fileUrl.startsWith('/')) {
      return fileUrl.slice(1);
    }
    return fileUrl;
  } catch {
    // If not a valid URL, treat as key
    return fileUrl;
  }
}

/**
 * Delete a file from S3
 */
export async function deleteS3File(fileUrl: string): Promise<void> {
  if (!BUCKET_NAME) {
    console.warn('AWS_S3_BUCKET_NAME not configured, skipping S3 deletion');
    return;
  }

  const key = extractS3Key(fileUrl);
  if (!key) {
    throw new Error(`Invalid file URL: ${fileUrl}`);
  }

  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
    console.log(`Successfully deleted S3 file: ${key}`);
  } catch (error) {
    console.error(`Failed to delete S3 file ${key}:`, error);
    throw error;
  }
}

/**
 * Delete multiple files from S3
 */
export async function deleteS3Files(fileUrls: string[]): Promise<void> {
  await Promise.all(fileUrls.map(url => deleteS3File(url).catch(err => {
    console.error(`Failed to delete ${url}:`, err);
    // Continue with other deletions even if one fails
  })));
}

/**
 * Generate presigned URL for S3 file download
 */
export async function getSignedUrlForS3(fileUrl: string, expiresIn: number = 3600): Promise<string> {
  if (!BUCKET_NAME) {
    console.warn('AWS_S3_BUCKET_NAME not configured, returning original URL');
    return fileUrl;
  }

  const key = extractS3Key(fileUrl);
  if (!key) {
    throw new Error(`Invalid file URL: ${fileUrl}`);
  }

  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return url;
  } catch (error) {
    console.error(`Failed to generate presigned URL for ${key}:`, error);
    throw error;
  }
}

