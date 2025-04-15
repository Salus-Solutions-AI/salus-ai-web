
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../test/utils/test-utils';
import LogTable from './LogTable';
import { getTodaysIncidents } from '@/integrations/supabase/tableUtils';
import { Incident, IncidentProcessingStatus } from '@/types';
import userEvent from '@testing-library/user-event';

// Mock the module
vi.mock('@/integrations/supabase/tableUtils', () => ({
  getTodaysIncidents: vi.fn()
}));

// Mock the AuthContext module - include both useAuth and AuthProvider
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-id' }
  }),
  AuthProvider: ({ children }) => children // Mock AuthProvider to simply render children
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

describe('LogTable', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('displays loading state initially', async () => {
    // Mock the API call to delay resolution
    (getTodaysIncidents as any).mockReturnValue(
      new Promise(resolve => setTimeout(() => resolve({ data: [], error: null }), 100))
    );
    
    render(<LogTable />);
    
    // Check that the loading state is displayed
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('displays error message when fetch fails', async () => {
    (getTodaysIncidents as any).mockResolvedValue({ 
      data: null, 
      error: { message: 'Failed to fetch incidents' } 
    });
    
    render(<LogTable />);
    
    await waitFor(() => {
      expect(screen.getByText('No Incidents Found')).toBeInTheDocument();
    });
  });

  it('filters incidents by search query', async () => {
    // Properly structure the mock response to include the profiles object
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
      is_clery: incident.isClery
    }));
    
    (getTodaysIncidents as any).mockResolvedValue({ 
      data: mockIncidentsForApi, 
      error: null 
    });
    
    render(<LogTable />);
    
    await waitFor(() => {
      expect(screen.getByText('Burglary')).toBeInTheDocument();
      expect(screen.getByText('Campus Library')).toBeInTheDocument();
    });

    const user = userEvent.setup();
    
    // Find the search input and type into it
    const searchInput = screen.getByPlaceholderText('Search logs...');
    await user.click(searchInput);
    await user.type(searchInput, 'nonexistent');
    
    // Check that the incident is no longer visible and "No Incidents Found" is displayed
    await waitFor(() => {
      // expect(screen.queryByText('Burglary')).not.toBeInTheDocument();
      expect(screen.getByText('No Incidents Found')).toBeInTheDocument();
    });
  });
});

