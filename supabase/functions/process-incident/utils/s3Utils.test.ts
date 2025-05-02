import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { parseS3Url } from './s3Utils';

describe('parseS3Url', () => {
  beforeEach(() => {
    // Spy on console.error to test error logging
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should correctly parse standard S3 URLs', () => {
    const url = 'https://my-bucket.s3.amazonaws.com/incidents/d32cd64b-f9be-4ced-a8a6-93e0136da169/71611a9b-4415-4796-80f6-41ebcd52db94.pdf';
    const result = parseS3Url(url);
    
    expect(result).toEqual({
      bucketName: 'my-bucket',
      key: 'incidents/d32cd64b-f9be-4ced-a8a6-93e0136da169/71611a9b-4415-4796-80f6-41ebcd52db94.pdf'
    });
  });

  it('should correctly parse S3 URLs with region in domain', () => {
    const url = 'https://my-bucket.s3.us-west-2.amazonaws.com/path/to/my-file.json';
    const result = parseS3Url(url);
    
    expect(result).toEqual({
      bucketName: 'my-bucket',
      key: 'path/to/my-file.json'
    });
  });

  it('should correctly parse path-style S3 URLs', () => {
    const url = 'https://s3.amazonaws.com/bucket-name/folder/file.txt';
    const result = parseS3Url(url);
    
    expect(result).toEqual({
      bucketName: 'bucket-name',
      key: 'folder/file.txt'
    });
  });

  it('should correctly parse path-style S3 URLs with region', () => {
    const url = 'https://s3.us-east-1.amazonaws.com/my-east-bucket/some/path/doc.pdf';
    const result = parseS3Url(url);
    
    expect(result).toEqual({
      bucketName: 'my-east-bucket',
      key: 'some/path/doc.pdf'
    });
  });

  it('should correctly parse virtual hosted-style URLs', () => {
    const url = 'https://bucket-with-dash.s3-eu-central-1.amazonaws.com/object.jpg';
    const result = parseS3Url(url);
    
    expect(result).toEqual({
      bucketName: 'bucket-with-dash',
      key: 'object.jpg'
    });
  });

  it('should support HTTP protocol', () => {
    const url = 'http://test-bucket.s3.amazonaws.com/file.zip';
    const result = parseS3Url(url);
    
    expect(result).toEqual({
      bucketName: 'test-bucket',
      key: 'file.zip'
    });
  });

  it('should return null for non-S3 URLs', () => {
    const url = 'https://example.com/not-an-s3-url';
    const result = parseS3Url(url);
    
    expect(result).toBeNull();
    expect(console.error).toHaveBeenCalledWith(
      'URL does not match known S3 URL patterns:',
      url
    );
  });

  it('should handle empty string input', () => {
    const result = parseS3Url('');
    
    expect(result).toBeNull();
    expect(console.error).toHaveBeenCalledWith(
      'Invalid URL provided:',
      ''
    );
  });
});