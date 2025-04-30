
import { http, HttpResponse } from 'msw';
import { Incident, IncidentProcessingStatus } from '@/types';

// Sample mock data
const mockIncidents: Incident[] = [
  {
    id: '1',
    title: 'Test Incident',
    date: '2025-04-01T12:00:00Z',
    timeStr: '12:00 PM',
    category: 'Burglary',
    location: 'Campus Library',
    explanation: 'Test explanation',
    summary: 'Test summary',
    status: IncidentProcessingStatus.PENDING,
    number: 'INC-001',
    pdfUrl: 'https://example.com/test.pdf',
    preSignedUrl: 'https://example-pre-signed.com/test.pdf',
    filePath: '/test/path.pdf',
    uploadedAt: '2025-04-01T12:00:00Z',
    uploadedBy: '1234567890',
    uploaderName: 'Test User',
    isClery: false,
    needsMoreInfo: false
  }
];

export const handlers = [
  // Mock getIncidents
  http.get('*/rest/v1/incidents', () => {
    return HttpResponse.json(mockIncidents);
  }),
  
  // Mock getTodaysIncidents
  http.get('*/rest/v1/incidents', () => {
    return HttpResponse.json(mockIncidents);
  }),
  
  // Mock deleteIncident
  http.delete('*/rest/v1/incidents', () => {
    return new HttpResponse(null, { status: 204 });
  })
];
