import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiRequest } from '../client';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('apiRequest', () => {
  const mockSession = {
    access_token: 'test-token',
    refresh_token: 'refresh-token',
    user: {
      id: 'user-id',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: '2023-01-01T00:00:00.000Z'
    },
    expires_in: 3600,
    expires_at: 123456789,
    token_type: 'bearer'
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return the JSON response when successful', async () => {
    const mockData = { data: 'test-data' };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
      clone: () => ({
        ok: true,
        json: () => Promise.resolve(mockData),
      })
    });

    const result = await apiRequest('/test-endpoint', mockSession);

    expect(result).toEqual(mockData);
  });

  it('should return null for 204 No Content responses', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 204,
      clone: () => ({
        ok: true,
        status: 204,
      })
    });

    const result = await apiRequest('/test-endpoint', mockSession);

    expect(result).toBeNull();
  });

  it('should throw an error when the response is not ok', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ error: 'Bad request' }),
      clone: () => ({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: 'Bad request' }),
      })
    });

    await expect(apiRequest('/test-endpoint', mockSession)).rejects.toThrow('Bad request');
  });

  it('should handle JSON parse errors in error responses', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.reject(new Error('Invalid JSON')),
      clone: () => ({
        ok: false,
        status: 500,
        json: () => Promise.reject(new Error('Invalid JSON'))
      })
    });

    await expect(apiRequest('/test-endpoint', mockSession)).rejects.toThrow('API error: 500');
  });
}); 