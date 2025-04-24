import { describe, it, expect, vi, beforeEach } from 'vitest';
import { categoriesApi } from '../categories';
import * as apiClient from '../../client';

// Mock the apiRequest function
vi.mock('../../client', () => ({
  apiRequest: vi.fn(),
}));

describe('categoriesApi', () => {
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

  const mockCategories = [
    { id: '1', name: 'Category 1', description: 'Description 1' },
    { id: '2', name: 'Category 2', description: 'Description 2' },
  ];

  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('getAll', () => {
    it('should call apiRequest with the correct parameters', async () => {
      vi.mocked(apiClient.apiRequest).mockResolvedValueOnce(mockCategories);

      const result = await categoriesApi.getAll(mockSession);

      expect(apiClient.apiRequest).toHaveBeenCalledWith(
        '/api/categories',
        mockSession,
      );
      expect(result).toEqual(mockCategories);
    });
  });

  describe('create', () => {
    it('should call apiRequest with the correct parameters', async () => {
      const newCategory = { name: 'New Category', description: 'New Description' };
      const createdCategory = { id: '3', ...newCategory };
      vi.mocked(apiClient.apiRequest).mockResolvedValueOnce(createdCategory);

      const result = await categoriesApi.create(mockSession, newCategory);

      expect(apiClient.apiRequest).toHaveBeenCalledWith(
        '/api/categories',
        mockSession,
        {
          method: 'POST',
          body: JSON.stringify(newCategory),
        }
      );
      expect(result).toEqual(createdCategory);
    });
  });

  describe('update', () => {
    it('should call apiRequest with the correct parameters', async () => {
      const updateData = { name: 'Updated Category' };
      const updatedCategory = { id: '1', name: 'Updated Category', description: 'Description 1' };
      vi.mocked(apiClient.apiRequest).mockResolvedValueOnce(updatedCategory);

      const result = await categoriesApi.update(mockSession, '1', updateData);

      expect(apiClient.apiRequest).toHaveBeenCalledWith(
        '/api/categories/1',
        mockSession,
        {
          method: 'PUT',
          body: JSON.stringify(updateData),
        }
      );
      expect(result).toEqual(updatedCategory);
    });
  });

  describe('delete', () => {
    it('should call apiRequest with the correct parameters', async () => {
      vi.mocked(apiClient.apiRequest).mockResolvedValueOnce(null);

      await categoriesApi.delete(mockSession, '1');

      expect(apiClient.apiRequest).toHaveBeenCalledWith(
        '/api/categories/1',
        mockSession,
        { method: 'DELETE' }
      );
    });
  });
}); 