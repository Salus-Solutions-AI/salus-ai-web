import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitForElementToBeRemoved } from '../test/utils/test-utils';
import IncidentGrid from './IncidentGrid';
import { Incident, IncidentProcessingStatus } from '@/types';
import { incidentsApi } from '@/api/resources/incidents';


vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-id' },
    session: { access_token: 'mock-token' }
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

vi.mock('@/api/resources/incidents', () => ({
  incidentsApi: {
    getAll: vi.fn()
  }
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
    uploadedBy: 'user-id',
    uploaderName: 'Test User',
    isClery: false,
    needsMoreInfo: false
  }
];

describe('IncidentGrid', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('displays loading state initially', async () => {
    let resolvePromise;
    const promise = new Promise<Incident[]>(resolve => {
      resolvePromise = resolve;
    });
    
    vi.mocked(incidentsApi.getAll).mockReturnValue(promise);
    
    render(<IncidentGrid 
      refresh={false}
      refreshQueuedOnly={false}
      queuedIncidents={[]}
      setQueuedIncidents={() => {}}
    />);
    
    expect(screen.getByRole('status', { name: /loading incidents/i })).toBeInTheDocument();
  });

  it('displays incident data when loaded', async () => {
    vi.mocked(incidentsApi.getAll).mockResolvedValue(mockIncidents);
    
    render(<IncidentGrid 
      refresh={false}
      refreshQueuedOnly={false}
      queuedIncidents={[]}
      setQueuedIncidents={() => {}}
    />);
    
    await waitForElementToBeRemoved(() => 
      screen.queryByRole('status', { name: /loading incidents/i })
    );
    
    expect(screen.getByText('Burglary')).toBeInTheDocument();
    expect(screen.getByText('Test Incident')).toBeInTheDocument();
  });
  
  it('displays empty state when no incidents', async () => {
    vi.mocked(incidentsApi.getAll).mockResolvedValue([]);
    
    render(
      <IncidentGrid 
        refresh={false}
        refreshQueuedOnly={false}
        queuedIncidents={[]}
        setQueuedIncidents={() => {}}
      />
    );
    
    const noIncidentsElement = await screen.findByText('No Incidents Found', {}, { timeout: 3000 });
    
    expect(noIncidentsElement).toBeInTheDocument();
  });
});
