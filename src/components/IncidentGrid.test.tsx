
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitForElementToBeRemoved } from '../test/utils/test-utils';
import IncidentGrid from './IncidentGrid';
import { getIncidents } from '@/integrations/supabase/tableUtils';
import { Incident, IncidentProcessingStatus } from '@/types';

// Mock the module
vi.mock('@/integrations/supabase/tableUtils', () => ({
  getIncidents: vi.fn(),
  deleteIncident: vi.fn(),
  downloadIncident: vi.fn()
}));

// Mock the AuthContext module - include both useAuth and AuthProvider
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-id' }
  }),
  AuthProvider: ({ children }) => children
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn()
  };
});

vi.mock('@/components/ui/toast', () => ({
  toast: vi.fn()
}));

const mockIncidents: Incident[] = [
  {
    id: '1',
    title: 'Test Incident',
    date: '2025-04-01T12:00:00Z',
    category: 'Burglary',
    location: 'Campus Library',
    explanation: 'Test explanation',
    summary: 'Test summary',
    status: IncidentProcessingStatus.PENDING,
    number: 'INC-001',
    pdfUrl: 'https://example.com/test.pdf',
    filePath: '/test/path.pdf',
    uploadedAt: '2025-04-01T12:00:00Z',
    uploadedBy: 'Test User',
    isClery: false,
    needsMoreInfo: false
  }
];

describe('IncidentGrid', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('displays loading state initially', async () => {
    // Mock the API call to delay resolution
    let resolvePromise;
    const promise = new Promise(resolve => {
      resolvePromise = resolve;
    });
    
    // Mock the API to return the unresolved promise
    (getIncidents as any).mockReturnValue(promise);
    
    render(<IncidentGrid 
      refresh={false}
      refreshQueuedOnly={false}
      queuedIncidents={[]}
      setQueuedIncidents={() => {}}
    />);
    
    expect(screen.getByRole('status', { name: /loading incidents/i })).toBeInTheDocument();
  });

  it('displays incident data when loaded', async () => {
    // Properly structure the mock response for the Supabase API format
    const mockIncidentsForApi = mockIncidents.map(incident => ({
      id: incident.id,
      title: incident.title,
      date: incident.date,
      category: incident.category,
      location: incident.location,
      explanation: incident.explanation,
      summary: incident.summary,
      status: incident.status,
      number: incident.number,
      pdf_url: incident.pdfUrl,
      file_path: incident.filePath,
      uploaded_at: incident.uploadedAt,
      profiles: {
        full_name: incident.uploadedBy
      },
      is_clery: incident.isClery,
      needs_more_info: incident.needsMoreInfo
    }));
    
    (getIncidents as any).mockImplementation(() => 
      Promise.resolve({ data: mockIncidentsForApi, error: null })
    );
    
    render(<IncidentGrid 
      refresh={false}
      refreshQueuedOnly={false}
      queuedIncidents={[]}
      setQueuedIncidents={() => {}}
    />);
    
    // Wait for loading to finish first
    await waitForElementToBeRemoved(() => 
      screen.queryByRole('status', { name: /loading incidents/i })
    );
    
    expect(screen.getByText('Burglary')).toBeInTheDocument();
    expect(screen.getByText('Test Incident')).toBeInTheDocument();
  });
  
  it('displays empty state when no incidents', async () => {
    // Mock a resolved API response with empty data
    (getIncidents as any).mockImplementation(() => {
      return Promise.resolve({ data: [], error: null });
    });
    
    render(
      <IncidentGrid 
        refresh={false}
        refreshQueuedOnly={false}
        queuedIncidents={[]}
        setQueuedIncidents={() => {}}
      />
    );
    
    // Use findByText which will keep trying until it finds the element or times out
    // This is more reliable than waitFor in many cases
    const noIncidentsElement = await screen.findByText('No Incidents Found', {}, { timeout: 3000 });
    
    // Verify it's in the document
    expect(noIncidentsElement).toBeInTheDocument();
  });
});