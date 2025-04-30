import { describe, it, expect, vi, beforeEach } from 'vitest';
import { defaultCategoriesApi } from '../default_categories';
import * as apiClient from '../../client';

vi.mock('../../client', () => ({
  apiRequest: vi.fn(),
}));

describe('defaultCategoriesApi', () => {
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

  const mockDefaultCategories = [
    { id: '1', name: 'Default Category 1', description: 'Description 1' },
    { id: '2', name: 'Default Category 2', description: 'Description 2' },
  ];

  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('getAll', () => {
    it('should call apiRequest with the correct parameters', async () => {
      vi.mocked(apiClient.apiRequest).mockResolvedValueOnce(mockDefaultCategories);

      const result = await defaultCategoriesApi.getAll(mockSession);

      expect(apiClient.apiRequest).toHaveBeenCalledWith(
        '/api/default_categories',
        mockSession
      );
      expect(result).toEqual(mockDefaultCategories);
    });
  });
}); 
