import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../test/utils/test-utils';
import IncidentStats from './IncidentStats';
import { Incident, IncidentProcessingStatus } from '@/types';
import { incidentsApi } from '@/api/resources/incidents';

vi.mock('@/api/resources/incidents', () => ({
  incidentsApi: {
    getAll: vi.fn()
  }
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-id' },
    session: { access_token: 'test-token' }
  }),
  AuthProvider: ({ children }) => children
}));

vi.mock('@/components/ui/toast', () => ({
  toast: vi.fn()
}));

vi.mock('recharts', () => {
  const OriginalModule = vi.importActual('recharts');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
    BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
    Bar: ({ children }) => <div data-testid="bar">{children}</div>,
    XAxis: () => <div data-testid="x-axis" />,
    YAxis: () => <div data-testid="y-axis" />,
    CartesianGrid: () => <div data-testid="cartesian-grid" />,
    Tooltip: () => <div data-testid="tooltip" />,
    Cell: () => <div data-testid="cell" />
  };
});

const mockIncidents: Incident[] = [
  {
    id: '1',
    title: 'Test Incident 1',
    date: '2023-04-01T12:00:00Z',
    timeStr: '12:00 PM',
    category: 'Burglary',
    location: 'Campus Library',
    explanation: 'Test explanation',
    summary: 'Test summary',
    status: IncidentProcessingStatus.PENDING,
    number: 'INC-001',
    pdfUrl: 'https://example.com/test.pdf',
    preSignedUrl: 'https://pre-signed.com',
    filePath: '/test/path.pdf',
    uploadedAt: '2023-04-01T12:00:00Z',
    uploadedBy: 'user-id',
    uploaderName: 'Test User',
    isClery: true,
    needsMoreInfo: false
  },
  {
    id: '2',
    title: 'Test Incident 2',
    date: '2023-04-02T12:00:00Z',
    timeStr: '12:00 PM',
    category: 'Theft',
    location: 'Student Center',
    explanation: 'Test explanation 2',
    summary: 'Test summary 2',
    status: IncidentProcessingStatus.COMPLETED,
    number: 'INC-002',
    pdfUrl: 'https://example.com/test2.pdf',
    preSignedUrl: 'https://pre-signed.com',
    filePath: '/test/path2.pdf',
    uploadedAt: '2023-04-02T12:00:00Z',
    uploadedBy: 'user-id',
    uploaderName: 'Test User',
    isClery: false,
    needsMoreInfo: false
  }
];

describe('IncidentStats', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('displays loading state initially', async () => {
    let resolvePromise;
    const promise = new Promise(resolve => {
      resolvePromise = resolve;
    });
    
    vi.mocked(incidentsApi.getAll).mockReturnValue(promise as unknown as Promise<Incident[]>);
    
    render(<IncidentStats />);
    
    const loadingElements = screen.getAllByRole('loader');
    expect(loadingElements.length).toEqual(2);
  });

  it('displays incident statistics when data is loaded', async () => {
    vi.mocked(incidentsApi.getAll).mockResolvedValue(mockIncidents)
    render(<IncidentStats />);
    
    await waitFor(() => {
      // Check for the chart title
      expect(screen.getByText('Clery Incidents by Category')).toBeInTheDocument();
      
      // Check for chart components
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    await waitFor(() => {
      // Check for table headers
      expect(screen.getByText('Year')).toBeInTheDocument();
      expect(screen.getByText('Campus Residential')).toBeInTheDocument();
      expect(screen.getByText('Campus Total')).toBeInTheDocument();
      expect(screen.getByText('Non-Campus')).toBeInTheDocument();
      expect(screen.getByText('Public Property')).toBeInTheDocument();
      
      // Check for years in the table
      expect(screen.getByText('2025')).toBeInTheDocument();
      expect(screen.getByText('2024')).toBeInTheDocument();
      expect(screen.getByText('2023')).toBeInTheDocument();
      
      // Check for category table
      expect(screen.getByText('Theft')).toBeInTheDocument();
    });
  });

  it('displays error state when fetch fails', async () => {
    vi.mocked(incidentsApi.getAll).mockRejectedValue(new Error('Failed to fetch incidents'));

    render(<IncidentStats />);
    
    await waitFor(() => {
      expect(screen.getAllByText('No incident data available').length).toBeGreaterThan(0);
    });
  });

  it('displays empty state when no incidents', async () => {
    vi.mocked(incidentsApi.getAll).mockResolvedValue([]);
    
    render(<IncidentStats />);
    
    await waitFor(() => {
      expect(screen.getAllByText('No incident data available').length).toBeGreaterThan(0);
    });
  });
});
