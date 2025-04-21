import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../test/utils/test-utils';
import IncidentStats from './IncidentStats';
import { getIncidents } from '@/integrations/supabase/tableUtils';
import { Incident, IncidentProcessingStatus } from '@/types';
import exp from 'constants';

// Mock the module
vi.mock('@/integrations/supabase/tableUtils', () => ({
  getIncidents: vi.fn()
}));

// Mock the AuthContext module
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-id' }
  }),
  AuthProvider: ({ children }) => children
}));

// Mock Recharts components
vi.mock('recharts', () => {
  const OriginalModule = vi.importActual('recharts');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
    BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
    PieChart: ({ children }) => <div data-testid="pie-chart">{children}</div>,
    Pie: ({ children }) => <div data-testid="pie">{children}</div>,
    Bar: ({ children }) => <div data-testid="bar">{children}</div>,
    XAxis: () => <div data-testid="x-axis" />,
    YAxis: () => <div data-testid="y-axis" />,
    CartesianGrid: () => <div data-testid="cartesian-grid" />,
    Tooltip: () => <div data-testid="tooltip" />,
    Cell: () => <div data-testid="cell" />,
    Legend: () => <div data-testid="legend" />
  };
});

vi.mock('@/components/ui/toast', () => ({
  toast: vi.fn()
}));

const mockIncidents: Incident[] = [
  {
    id: '1',
    title: 'Test Incident 1',
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
    isClery: true,
    needsMoreInfo: false
  },
  {
    id: '2',
    title: 'Test Incident 2',
    date: '2025-04-02T12:00:00Z',
    category: 'Theft',
    location: 'Student Center',
    explanation: 'Test explanation 2',
    summary: 'Test summary 2',
    status: IncidentProcessingStatus.COMPLETED,
    number: 'INC-002',
    pdfUrl: 'https://example.com/test2.pdf',
    filePath: '/test/path2.pdf',
    uploadedAt: '2025-04-02T12:00:00Z',
    uploadedBy: 'Test User',
    isClery: false,
    needsMoreInfo: false
  }
];

describe('IncidentStats', () => {
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
    
    render(<IncidentStats />);
    
    // Check for loading spinners
    const loadingElements = screen.getAllByRole('loader');
    expect(loadingElements.length).toEqual(2);
  });

  it('displays incident statistics when data is loaded', async () => {
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
      needs_more_info: incident.needsMoreInfo,
      requires_timely_warning: incident.requiresTimelyWarning
    }));
    
    (getIncidents as any).mockResolvedValue({ 
      data: mockIncidentsForApi, 
      error: null 
    });
    
    render(<IncidentStats />);
    
    // Wait for the statistics to load and verify they display correctly
    await waitFor(() => {
      // Check for total incidents count
      expect(screen.getByText('2')).toBeInTheDocument();
      
      // Check for Clery incidents count (1 in our mock data)
      const singleCounts = screen.getAllByText('1');
      expect(singleCounts.length).toEqual(2);
    });

    // Check for category chart elements
    await waitFor(() => {
      expect(screen.getByText('Incidents by Category')).toBeInTheDocument();
      expect(screen.getByText('Clery vs. Non-Clery Incidents')).toBeInTheDocument();
    });
  });

  it('displays error state when fetch fails', async () => {
    // Mock a failed API response
    (getIncidents as any).mockResolvedValue({ 
      data: null, 
      error: { message: 'Failed to fetch incidents' } 
    });
    
    render(<IncidentStats />);
    
    // Wait for error message to be displayed
    await waitFor(() => {
      expect(screen.getAllByText('No incident data available').length).toBeGreaterThan(0);
    });
  });

  it('displays empty state when no incidents', async () => {
    // Mock an empty successful response
    (getIncidents as any).mockResolvedValue({ 
      data: [], 
      error: null 
    });
    
    render(<IncidentStats />);
    
    // Wait for empty state to be displayed
    await waitFor(() => {
      expect(screen.getAllByText('No incident data available').length).toBeGreaterThan(0);
    });
  });
});
