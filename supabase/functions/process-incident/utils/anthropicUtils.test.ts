import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { queryAnthropic } from './anthropicUtils.ts';
import { constructClassificationPrompt, parseClassificationResponse } from './promptUtils.ts';

// Mock fetch
global.fetch = vi.fn();

describe('Classification Utilities', () => {
  // Test data
  const apiKey = 'test-api-key';
  const documentText = 'A student reported their laptop was stolen from the library on campus yesterday.';
  const categories = [
    { name: 'Theft', description: 'Taking of property without permission or legal right' },
    { name: 'Assault', description: 'Physical attack against another person' },
    { name: 'Vandalism', description: 'Deliberate destruction of property' },
    { name: 'Needs more info', description: 'Insufficient information to classify' }
  ];

  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks();
  });

  it('should successfully classify a document', async () => {
    // Mock a successful API response
    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({
        content: [
          {
            text: `
              Classification decision: Theft
              Location: Campus library
              IsClery: true
              
              Explanation: This document is classified as Theft because it describes a laptop being stolen from the library on campus. The incident occurred on campus property which is within Clery geography.
            `
          }
        ]
      }),
      text: vi.fn()
    };

    // Set up the fetch mock to return our response
    (global.fetch as any).mockResolvedValue(mockResponse);

    // Call the function
    const prompt = constructClassificationPrompt(documentText, categories, "");
    const llmResult = await queryAnthropic(apiKey, prompt);
    const result = parseClassificationResponse(llmResult);

    // Verify fetch was called with correct params
    expect(global.fetch).toHaveBeenCalledWith('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: expect.any(String)
    });

    // Parse the request body to check prompt construction
    const requestBody = JSON.parse((global.fetch as any).mock.calls[0][1].body);
    expect(requestBody.model).toBe('claude-3-7-sonnet-20250219');
    expect(requestBody.temperature).toBe(0.0);
    expect(requestBody.messages[0].role).toBe('user');
    expect(requestBody.messages[0].content).toContain('Task: Classify the following document');
    expect(requestBody.messages[0].content).toContain('Theft\tTaking of property without permission or legal right');
    expect(requestBody.messages[0].content).toContain(documentText);

    // Verify the classification result
    expect(result).toEqual({
      category: 'Theft',
      location: 'Campus library',
      isClery: true,
      explanation: 'This document is classified as Theft because it describes a laptop being stolen from the library on campus. The incident occurred on campus property which is within Clery geography.',
      date: 'Unknown',
      time: 'Unknown',
      number: 'Unknown',
      summary: 'No summary provided.',
    });
  });

  it('should handle API errors', async () => {
    // Mock an error response
    const errorResponse = {
      ok: false,
      status: 401,
      text: vi.fn().mockResolvedValue('Invalid API key')
    };

    (global.fetch as any).mockResolvedValue(errorResponse);

    // Verify the function throws an error
    const prompt = constructClassificationPrompt(documentText, categories, "");
    await expect(queryAnthropic(apiKey, prompt)).rejects.toThrow('Anthropic API error: 401 Invalid API key');
  });

  it('should handle partial or malformed responses', async () => {
    // Mock a response with missing fields
    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({
        content: [
          {
            text: `
              Classification decision: Theft
              
              Explanation: This is a theft incident.
            `
          }
        ]
      }),
      text: vi.fn()
    };

    (global.fetch as any).mockResolvedValue(mockResponse);
    
    const prompt = constructClassificationPrompt(documentText, categories, "");
    const llmResult = await queryAnthropic(apiKey, prompt);
    const result = parseClassificationResponse(llmResult);
    // It should set defaults for missing fields
    expect(result).toEqual({
      category: 'Theft',
      location: 'Unknown',
      isClery: false,
      explanation: 'This is a theft incident.',
      date: 'Unknown',
      time: 'Unknown',
      number: 'Unknown',
      summary: 'No summary provided.',
    });
  });

  it('should handle non-Clery classification', async () => {
    // Mock a response for a non-Clery incident
    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({
        content: [
          {
            text: `
              Classification decision: Vandalism
              Location: Off-campus apartment
              IsClery: false
              
              Explanation: This document describes vandalism at an off-campus location that is not within Clery geography.
            `
          }
        ]
      }),
      text: vi.fn()
    };

    (global.fetch as any).mockResolvedValue(mockResponse);
    
    const prompt = constructClassificationPrompt(documentText, categories, "");
    const llmResult = await queryAnthropic(apiKey, prompt);
    const result = parseClassificationResponse(llmResult);
    
    expect(result.isClery).toBe(false);
    expect(result.category).toBe('Vandalism');
  });

  it('should handle need-more-info classification', async () => {
    // Mock a response for insufficient information
    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({
        content: [
          {
            text: `
              Classification decision: Needs more info
              Location: Unknown
              IsClery: false
              
              Explanation: The document does not provide sufficient details to determine the nature of the incident or its location.
            `
          }
        ]
      }),
      text: vi.fn()
    };

    (global.fetch as any).mockResolvedValue(mockResponse);
    
    const prompt = constructClassificationPrompt(documentText, categories, "");
    const llmResult = await queryAnthropic(apiKey, prompt);
    const result = parseClassificationResponse(llmResult);
    
    expect(result.category).toBe('Needs more info');
  });

  it('should handle network errors', async () => {
    // Mock a network error
    (global.fetch as any).mockRejectedValue(new Error('Network error'));
    
    const prompt = constructClassificationPrompt(documentText, categories, "");
    await expect(queryAnthropic(apiKey, prompt)).rejects.toThrow('Network error');
  });

  it('should parse completely unexpected responses', async () => {
    // Mock a response with unexpected format
    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({
        content: [
          {
            text: `I'm not following the expected format at all.`
          }
        ]
      }),
      text: vi.fn()
    };

    (global.fetch as any).mockResolvedValue(mockResponse);
    
    const prompt = constructClassificationPrompt(documentText, categories, "");
    const llmResult = await queryAnthropic(apiKey, prompt);
    const result = parseClassificationResponse(llmResult);
    
    // It should use default values
    expect(result).toEqual({
      category: 'Unknown',
      location: 'Unknown',
      explanation: 'Unable to classify incident.',
      isClery: false,
      date: 'Unknown',
      time: 'Unknown',
      number: 'Unknown',
      summary: 'No summary provided.',
    });
  });
});