import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { uploadToS3, S3Config } from './s3Utils';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Mock the AWS SDK modules
vi.mock('@aws-sdk/client-s3', () => {
  const mockSend = vi.fn().mockResolvedValue({ success: true });
  
  return {
    S3Client: vi.fn(() => ({
      send: mockSend
    })),
    PutObjectCommand: vi.fn()
  };
});

describe('S3 Utilities', () => {
  // Create test data
  const config: S3Config = {
    region: 'us-east-1',
    accessKeyId: 'test-access-key',
    secretAccessKey: 'test-secret-key',
    bucket: 'test-bucket'
  };
  
  const document = new Uint8Array([1, 2, 3, 4, 5]);
  const key = 'test/document.pdf';
  
  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks();
  });
  
  it('should successfully upload a document to S3', async () => {
    // Call the function being tested
    const result = await uploadToS3(config, key, document);
    
    // Assert that the function returns the key
    expect(result).toBe(key);
    
    // Verify S3Client was created with correct config
    expect(S3Client).toHaveBeenCalledWith({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey
      }
    });
    
    // Verify PutObjectCommand was created with correct params
    expect(PutObjectCommand).toHaveBeenCalledWith({
      Bucket: config.bucket,
      Key: key,
      Body: document,
      ContentType: 'application/pdf'
    });
    
    // Verify send was called
    const s3ClientInstance = vi.mocked(S3Client).mock.results[0].value;
    expect(s3ClientInstance.send).toHaveBeenCalled();
  });
  
  it('should throw an error when S3 upload fails', async () => {
    // Mock the send method to reject with an error
    const errorMessage = 'S3 upload failed';
    
    // Reset the S3Client mock to return a client with a failing send method
    vi.mocked(S3Client).mockImplementationOnce(() => ({
      send: vi.fn().mockRejectedValueOnce(new Error(errorMessage))
    }));
    
    // Assert that the function rejects with the expected error
    await expect(uploadToS3(config, key, document)).rejects.toThrow(errorMessage);
  });
  
  it('should pass the correct content type for PDF documents', async () => {
    // Call the function
    await uploadToS3(config, key, document);
    
    // Verify content type was set correctly
    expect(PutObjectCommand).toHaveBeenCalledWith(
      expect.objectContaining({
        ContentType: 'application/pdf'
      })
    );
  });
});