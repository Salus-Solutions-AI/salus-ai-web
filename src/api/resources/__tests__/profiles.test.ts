import { describe, it, expect, vi, beforeEach } from 'vitest';
import { profilesApi } from '../profiles';
import * as apiClient from '../../client';

// Mock the apiRequest function
vi.mock('../../client', () => ({
  apiRequest: vi.fn(),
}));

describe('profilesApi', () => {
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

  const mockProfile = {
    id: 'user-id',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    createdCategories: true,
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('getById', () => {
    it('should call apiRequest with the correct parameters', async () => {
      vi.mocked(apiClient.apiRequest).mockResolvedValueOnce(mockProfile);

      const result = await profilesApi.getById(mockSession, 'user-id');

      expect(apiClient.apiRequest).toHaveBeenCalledWith(
        '/api/profiles/user-id',
        mockSession,
      );
      expect(result).toEqual(mockProfile);
    });
  });

  describe('update', () => {
    it('should call apiRequest with the correct parameters', async () => {
      const updateData = { firstName: 'Updated', createdCategories: true };
      const updatedProfile = { ...mockProfile, firstName: 'Updated' };
      vi.mocked(apiClient.apiRequest).mockResolvedValueOnce(updatedProfile);

      const result = await profilesApi.update(mockSession, 'user-id', updateData);

      expect(apiClient.apiRequest).toHaveBeenCalledWith(
        '/api/profiles/user-id',
        mockSession,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData),
        }
      );
      expect(result).toEqual(updatedProfile);
    });
  });
}); 
