import { describe, it, expect, vi, beforeEach } from 'vitest';
import { incidentsApi } from '../incidents';
import * as apiClient from '../../client';
import { IncidentProcessingStatus } from '@/types';

// Mock the apiRequest function
vi.mock('../../client', () => ({
  apiRequest: vi.fn(),
}));

describe('incidentsApi', () => {
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

  const mockIncidents = [
    {
      id: '1',
      title: 'Test Incident 1',
      date: '2023-01-01T12:00:00Z',
      category: 'Theft',
      location: 'Building A',
      explanation: 'Test explanation 1',
      summary: 'Test summary 1',
      status: IncidentProcessingStatus.PENDING,
      number: 'INC-001',
      pdfUrl: 'https://example.com/test1.pdf',
      filePath: '/test/path1.pdf',
      uploadedAt: '2023-01-01T12:00:00Z',
      uploadedBy: 'Test User',
      isClery: false,
      needsMoreInfo: false
    },
    {
      id: '2',
      title: 'Test Incident 2',
      date: '2023-01-02T12:00:00Z',
      category: 'Assault',
      location: 'Building B',
      explanation: 'Test explanation 2',
      summary: 'Test summary 2',
      status: IncidentProcessingStatus.COMPLETED,
      number: 'INC-002',
      pdfUrl: 'https://example.com/test2.pdf',
      filePath: '/test/path2.pdf',
      uploadedAt: '2023-01-02T12:00:00Z',
      uploadedBy: 'Test User',
      isClery: true,
      needsMoreInfo: false
    }
  ];

  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('getAll', () => {
    it('should call apiRequest with the correct parameters', async () => {
      vi.mocked(apiClient.apiRequest).mockResolvedValueOnce(mockIncidents);

      const result = await incidentsApi.getAll(mockSession);

      expect(apiClient.apiRequest).toHaveBeenCalledWith(
        '/api/incidents',
        mockSession
      );
      expect(result).toEqual(mockIncidents);
    });
  });

  describe('getById', () => {
    it('should call apiRequest with the correct parameters', async () => {
      const mockIncident = mockIncidents[0];
      vi.mocked(apiClient.apiRequest).mockResolvedValueOnce(mockIncident);

      const result = await incidentsApi.getById(mockSession, '1');

      expect(apiClient.apiRequest).toHaveBeenCalledWith(
        '/api/incidents/1',
        mockSession
      );
      expect(result).toEqual(mockIncident);
    });
  });

  describe('create', () => {
    it('should call apiRequest with the correct parameters', async () => {
      const newIncident = {
        title: 'New Incident',
        date: '2023-01-03T12:00:00Z',
        category: 'Vandalism',
        location: 'Building C',
        explanation: 'New explanation',
      };
      const createdIncident = { id: '3', ...newIncident, status: IncidentProcessingStatus.PENDING };
      vi.mocked(apiClient.apiRequest).mockResolvedValueOnce(createdIncident);

      const result = await incidentsApi.create(mockSession, newIncident);

      expect(apiClient.apiRequest).toHaveBeenCalledWith(
        '/api/incidents',
        mockSession,
        {
          method: 'POST',
          body: JSON.stringify(newIncident),
        }
      );
      expect(result).toEqual(createdIncident);
    });
  });

  describe('update', () => {
    it('should call apiRequest with the correct parameters', async () => {
      const updateData = { title: 'Updated Incident', isClery: true };
      const updatedIncident = { ...mockIncidents[0], ...updateData };
      vi.mocked(apiClient.apiRequest).mockResolvedValueOnce(updatedIncident);

      const result = await incidentsApi.update(mockSession, '1', updateData);

      expect(apiClient.apiRequest).toHaveBeenCalledWith(
        '/api/incidents/1',
        mockSession,
        {
          method: 'PUT',
          body: JSON.stringify(updateData),
        }
      );
      expect(result).toEqual(updatedIncident);
    });
  });

  describe('delete', () => {
    it('should call apiRequest with the correct parameters', async () => {
      vi.mocked(apiClient.apiRequest).mockResolvedValueOnce(null);

      await incidentsApi.delete(mockSession, '1');

      expect(apiClient.apiRequest).toHaveBeenCalledWith(
        '/api/incidents/1',
        mockSession,
        { method: 'DELETE' }
      );
    });
  });
}); 