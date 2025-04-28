
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test/utils/test-utils';
import QueuedIncidentsBanner from './QueuedIncidentsBanner';
import { Incident, IncidentProcessingStatus } from '@/types';

const mockQueuedIncidents: Incident[] = [
  {
    id: '1',
    title: 'Queued Incident',
    date: '2025-04-01T12:00:00Z',
    category: 'Theft',
    location: 'Student Center',
    explanation: 'Test explanation',
    summary: 'Test summary',
    status: IncidentProcessingStatus.QUEUED,
    number: 'INC-002',
    pdfUrl: 'https://example.com/test2.pdf',
    filePath: '/test/path2.pdf',
    uploadedAt: '2025-04-01T12:00:00Z',
    uploadedBy: 'user-id',
    uploaderName: 'Test User',
    isClery: true,
    needsMoreInfo: false
  }
];

describe('QueuedIncidentsBanner', () => {
  it('renders nothing when no queued incidents', () => {
    const { container } = render(
      <QueuedIncidentsBanner 
        queuedIncidents={[]} 
        onRefresh={() => {}} 
        isLoading={false}
      />
    );
    
    expect(container.firstChild).toBeNull();
  });

  it('renders banner with queued incident information', () => {
    render(
      <QueuedIncidentsBanner 
        queuedIncidents={mockQueuedIncidents} 
        onRefresh={() => {}} 
        isLoading={false}
      />
    );
    
    expect(screen.getByText('Processing 1 incident')).toBeInTheDocument();
    expect(screen.getByText('Queued Incident')).toBeInTheDocument();
  });

  it('shows correct count for multiple incidents', () => {
    const multipleIncidents = [
      ...mockQueuedIncidents,
      {
        ...mockQueuedIncidents[0],
        id: '2',
        title: 'Another Incident'
      }
    ];
    
    render(
      <QueuedIncidentsBanner 
        queuedIncidents={multipleIncidents} 
        onRefresh={() => {}} 
        isLoading={false}
      />
    );
    
    expect(screen.getByText('Processing 2 incidents')).toBeInTheDocument();
  });
});
