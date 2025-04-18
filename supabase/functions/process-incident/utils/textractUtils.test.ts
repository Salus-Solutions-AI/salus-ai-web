import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  startAnalyzeDocumentJob, 
  pollAnalyzeDocumentJob,
  TextractConfig,
  S3Object 
} from './textractUtils';
import { 
  TextractClient, 
  StartDocumentAnalysisCommand, 
  GetDocumentAnalysisCommand 
} from '@aws-sdk/client-textract';

// Mock the AWS Textract client
vi.mock('@aws-sdk/client-textract', () => {
  const mockSend = vi.fn();
  
  return {
    TextractClient: vi.fn(() => ({
      send: mockSend
    })),
    StartDocumentAnalysisCommand: vi.fn(),
    GetDocumentAnalysisCommand: vi.fn()
  };
});

describe('Textract Utilities', () => {
  // Test data
  const config: TextractConfig = {
    region: 'us-east-1',
    accessKeyId: 'test-access-key',
    secretAccessKey: 'test-secret-key'
  };
  
  const s3Object: S3Object = {
    bucket: 'test-bucket',
    key: 'documents/test-document.pdf'
  };
  
  // Mock job ID
  const mockJobId = 'abc123-test-job-id';
  
  // Sample Textract blocks for form data
  const mockBlocks = [
    {
      BlockType: 'KEY_VALUE_SET',
      Id: 'key-1',
      EntityTypes: ['KEY'],
      Page: 1,
      Confidence: 95.5,
      Relationships: [
        {
          Type: 'VALUE',
          Ids: ['value-1']
        },
        {
          Type: 'CHILD',
          Ids: ['word-1', 'word-2']
        }
      ]
    },
    {
      BlockType: 'KEY_VALUE_SET',
      Id: 'value-1',
      EntityTypes: ['VALUE'],
      Page: 1,
      Confidence: 90.2,
      Relationships: [
        {
          Type: 'CHILD',
          Ids: ['word-3', 'word-4']
        }
      ]
    },
    {
      BlockType: 'WORD',
      Id: 'word-1',
      Text: 'Incident',
      Confidence: 98.1
    },
    {
      BlockType: 'WORD',
      Id: 'word-2',
      Text: 'Date',
      Confidence: 97.3
    },
    {
      BlockType: 'WORD',
      Id: 'word-3',
      Text: '2023-',
      Confidence: 94.8
    },
    {
      BlockType: 'WORD',
      Id: 'word-4',
      Text: '04-15',
      Confidence: 92.9
    }
  ];
  
  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks();
  });
  
  describe('startTextractJob', () => {
    it('should successfully start a Textract job', async () => {
        // Mock successful response from Textract
        const mockStartResponse = { JobId: mockJobId };
        const mockClient = {
            send: vi.fn().mockResolvedValue(mockStartResponse),
        };
        vi.mocked(TextractClient).mockImplementation(() => mockClient as unknown as TextractClient);
        
        // Call the function being tested
        const jobId = await startAnalyzeDocumentJob(config, s3Object);
        
        // Assert that the function returns the job ID
        expect(jobId).toBe(mockJobId);
        
        // Verify TextractClient was created with correct config
        expect(TextractClient).toHaveBeenCalledWith({
          region: config.region,
          credentials: {
            accessKeyId: config.accessKeyId,
            secretAccessKey: config.secretAccessKey
          }
        });
        
        // Verify StartDocumentAnalysisCommand was created with correct params
        expect(StartDocumentAnalysisCommand).toHaveBeenCalledWith({
          DocumentLocation: {
            S3Object: {
              Bucket: s3Object.bucket,
              Name: s3Object.key
            }
          },
          FeatureTypes: ['FORMS']
        });
        
        // Verify send was called
        const textractClientInstance = vi.mocked(TextractClient).mock.results[0].value;
        expect(textractClientInstance.send).toHaveBeenCalled();
      });
      
      it('should throw an error when no JobId is returned', async () => {
        // Mock response with no JobId
        const mockErrorResponse = {};
        const mockClient = {
            send: vi.fn().mockResolvedValue(mockErrorResponse),
        };
        vi.mocked(TextractClient).mockImplementation(() => mockClient as unknown as TextractClient);

        
        // Verify the function throws an error
        await expect(startAnalyzeDocumentJob(config, s3Object)).rejects.toThrow(
          'Failed to start Textract job - no JobId returned'
        );
      });
      
      it('should handle API errors when starting a job', async () => {
        // Mock API error
        const errorMessage = 'Invalid credentials';
        const mockClient = {
            send: vi.fn().mockRejectedValue(new Error(errorMessage))
        };
        vi.mocked(TextractClient).mockImplementation(() => mockClient as unknown as TextractClient);
        
        // Verify the function throws an error
        await expect(startAnalyzeDocumentJob(config, s3Object)).rejects.toThrow(errorMessage);
      });
    });
  
  describe('pollAnalyzeDocumentJob', () => {
    it('should successfully poll a Textract job until completion', async () => {
        // Setup mock responses for polling
        // First call - job still in progress
        const inProgressResponse = { JobStatus: 'IN_PROGRESS' };
        // Second call - job completed
        const successResponse = { 
            JobStatus: 'SUCCEEDED',
            Blocks: mockBlocks,
            NextToken: null
        };
      
        // Setup the mock to return different responses on successive calls
        const mockSend = vi.fn()
            .mockResolvedValueOnce(inProgressResponse)
            .mockResolvedValueOnce(successResponse);
        const mockClient = {
            send: mockSend, 
        };
        vi.mocked(TextractClient).mockImplementation(() => mockClient as unknown as TextractClient);
      
        // Mock setTimeout to speed up the test
        vi.useFakeTimers();
      
        // Start the polling (don't await yet)
        const pollPromise = pollAnalyzeDocumentJob(config, mockJobId, 2, 100);
      
        // Fast-forward timers
        await vi.advanceTimersByTimeAsync(100);
        await vi.advanceTimersByTimeAsync(100);
      
        // Now await the result
        const result = await pollPromise;
      
        // Restore real timers
        vi.useRealTimers();
      
        // Verify the result
        expect(result.jobId).toBe(mockJobId);
        expect(result.data).toHaveProperty('Incident Date', '2023- 04-15');
      
        // Verify TextractClient was created with correct config
        expect(TextractClient).toHaveBeenCalledWith({
            region: config.region,
            credentials: {
            accessKeyId: config.accessKeyId,
            secretAccessKey: config.secretAccessKey
            }
        });
      
        // Verify GetDocumentAnalysisCommand was created with correct params
        expect(GetDocumentAnalysisCommand).toHaveBeenCalledWith({
            JobId: mockJobId
        });
      
        // Verify send was called twice (once for in-progress, once for success)
        expect(mockSend).toHaveBeenCalledTimes(2);
    });
    
    it('should handle paginated results', async () => {
        // Setup mock responses for paginated results
        const firstPageResponse = { 
            JobStatus: 'SUCCEEDED',
            Blocks: mockBlocks.slice(0, 3), // First part of blocks
            NextToken: 'page2token'
        };
        
        const secondPageResponse = { 
            JobStatus: 'SUCCEEDED',
            Blocks: mockBlocks.slice(3), // Second part of blocks
            NextToken: null
        };
        
        // Setup the mock to return different responses
        const mockSend = vi.fn()
        .mockResolvedValueOnce(firstPageResponse)
        .mockResolvedValueOnce(secondPageResponse);        
        const mockClient = {
            send: mockSend, 
        };
        vi.mocked(TextractClient).mockImplementation(() => mockClient as unknown as TextractClient);
        
        // Use fake timers to speed up the test
        vi.useFakeTimers();
        
        // Start the polling (don't await yet)
        const pollPromise = pollAnalyzeDocumentJob(config, mockJobId, 2, 100);
        
        // Fast-forward timer
        await vi.advanceTimersByTimeAsync(100);
        
        // Now await the result
        const result = await pollPromise;
        
        // Restore real timers
        vi.useRealTimers();
        
        // Verify the result (should have processed all blocks)
        expect(result.jobId).toBe(mockJobId);
        expect(result.data).toHaveProperty('Incident Date');
        
        // Verify GetDocumentAnalysisCommand was called twice with different tokens
        expect(GetDocumentAnalysisCommand).toHaveBeenCalledWith({
            JobId: mockJobId
        });
        expect(GetDocumentAnalysisCommand).toHaveBeenCalledWith({
            JobId: mockJobId,
            NextToken: 'page2token'
        });
    });
    
    it('should throw an error when job fails', async () => {
        // Mock a failed job response
        const failedResponse = { 
            JobStatus: 'FAILED',
            StatusMessage: 'Document too large'
        };
        
        // Create a mock send function that returns a FAILED job status
        const mockSend = vi.fn().mockResolvedValue(failedResponse);
        const mockClient = {
            send: mockSend, 
        };
        vi.mocked(TextractClient).mockImplementation(() => mockClient as unknown as TextractClient);

        // Test with real timers and short interval
        await expect(
            pollAnalyzeDocumentJob(config, mockJobId, 1, 10)
        ).rejects.toThrow('Textract job failed: Document too large');
        
        // Verify the TextractClient was created
        expect(TextractClient).toHaveBeenCalled();
        
        // Verify the GetDocumentAnalysisCommand was created with the right job ID
        expect(GetDocumentAnalysisCommand).toHaveBeenCalledWith({
            JobId: mockJobId
        });
        
        // Verify send was called once
        expect(mockSend).toHaveBeenCalledTimes(1);
    });
    
    it('should throw an error when job times out', async () => {
        // Mock responses that always show job in progress
        const inProgressResponse = { JobStatus: 'IN_PROGRESS' };
        
        // Create a mock send function that always returns IN_PROGRESS
        const mockSend = vi.fn().mockResolvedValue(inProgressResponse);
        const mockClient = {
            send: mockSend, 
        };
        vi.mocked(TextractClient).mockImplementation(() => mockClient as unknown as TextractClient);
        
        // Set a low max attempts value and polling interval for faster test
        const maxAttempts = 2;
        
        // Directly test with real timers but very short intervals
        await expect(
            pollAnalyzeDocumentJob(config, mockJobId, maxAttempts, 10)
        ).rejects.toThrow(`Textract job timed out after ${maxAttempts} attempts`);
        
        // Verify the TextractClient was created
        expect(TextractClient).toHaveBeenCalled();
        
        // Verify the GetDocumentAnalysisCommand was created with the right job ID
        expect(GetDocumentAnalysisCommand).toHaveBeenCalledWith({
            JobId: mockJobId
        });
        
        // Verify send was called exactly maxAttempts times
        expect(mockSend).toHaveBeenCalledTimes(maxAttempts);
    });

    it('should handle API errors during polling', async () => {
        // Mock an API error
        const errorMessage = 'Network error';
        
        // Create a mock send function that rejects with an error
        const mockSend = vi.fn().mockRejectedValue(new Error(errorMessage));
        const mockClient = {
            send: mockSend, 
        };
        vi.mocked(TextractClient).mockImplementation(() => mockClient as unknown as TextractClient);
        
        // Use real timers for this test to avoid issues with rejected promises
        // Create promise with shorter polling interval for faster test
        await expect(
            pollAnalyzeDocumentJob(config, mockJobId, 1, 10)
        ).rejects.toThrow(errorMessage);
        
        // Verify the TextractClient was created
        expect(TextractClient).toHaveBeenCalled();
        
        // Verify the GetDocumentAnalysisCommand was created
        expect(GetDocumentAnalysisCommand).toHaveBeenCalledWith({
            JobId: mockJobId
        });
        
        // Verify send was called and rejected
        expect(mockSend).toHaveBeenCalled();
    });
  });
});