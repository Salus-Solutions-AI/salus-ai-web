
import { S3Client, PutObjectCommand } from 'npm:@aws-sdk/client-s3';

export interface S3Config {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
}

/**
 * Uploads a document to an S3 bucket
 * @param config - S3 configuration parameters
 * @param key - The S3 object key
 * @param document - The document bytes to upload
 * @returns Promise resolving to the S3 object key
 */
export async function uploadToS3(
  config: S3Config,
  key: string,
  document: Uint8Array
): Promise<string> {
  console.log(`Uploading file to S3: ${config.bucket}/${key}`);
  
  const s3Client = new S3Client({ 
    region: config.region, 
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    } 
  });

  const uploadCommand = new PutObjectCommand({
    Bucket: config.bucket,
    Key: key,
    Body: document,
    ContentType: 'application/pdf',
  });

  await s3Client.send(uploadCommand);
  console.log("File uploaded to S3 successfully");
  
  return key;
}
