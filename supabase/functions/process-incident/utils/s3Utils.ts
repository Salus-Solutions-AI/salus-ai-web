type S3Config = {
  bucketName: string,
  key: string,
}

/**
 * Parse an Amazon S3 URL to extract the bucket name and key
 * @param {string} url - The S3 URL to parse
 * @returns {S3Config|null} An S3Config object containing bucketName and key, or null if parsing fails
 */
export function parseS3Url(url: string): S3Config | null {
  if (!url || typeof url !== 'string') {
    console.error('Invalid URL provided:', url);
    return null;
  }

  try {
    // Handle standard format: https://bucket-name.s3.region.amazonaws.com/key
    const standardPattern = /^https?:\/\/([^.]+)\.s3\.([^.]+\.)?amazonaws\.com\/(.+)$/;
    let match = url.match(standardPattern);
    
    if (match) {
      return {
        bucketName: match[1],
        key: match[3]
      };
    }
    
    // Handle path-style format: https://s3.region.amazonaws.com/bucket-name/key
    const pathStylePattern = /^https?:\/\/s3\.([^.]+\.)?amazonaws\.com\/([^\/]+)\/(.+)$/;
    match = url.match(pathStylePattern);
    
    if (match) {
      return {
        bucketName: match[2],
        key: match[3]
      };
    }
    
    // Handle virtual hosted-style: https://bucket-name.s3-region.amazonaws.com/key
    const virtualHostedPattern = /^https?:\/\/([^.]+)\.s3-([^.]+)\.amazonaws\.com\/(.+)$/;
    match = url.match(virtualHostedPattern);
    
    if (match) {
      return {
        bucketName: match[1],
        key: match[3]
      };
    }
    
    console.error('URL does not match known S3 URL patterns:', url);
    return null;
  } catch (error) {
    console.error('Error parsing S3 URL:', error);
    return null;
  }
}
