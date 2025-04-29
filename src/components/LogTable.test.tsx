import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, waitForElementToBeRemoved } from '../test/utils/test-utils';
import LogTable from './LogTable';
import { Incident, IncidentProcessingStatus } from '@/types';
import userEvent from '@testing-library/user-event';
import { incidentsApi } from '@/api/resources/incidents';

vi.mock('@/api/resources/incidents', () => ({
  incidentsApi: {
    getAll: vi.fn()
  }
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-id' }
  }),
  AuthProvider: ({ children }) => children
}));

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
    filePath: '/test/path.pdf',
    uploadedAt: new Date().toISOString(),
    uploadedBy: 'user-id',
    uploaderName: 'Test User',
    isClery: false,
    needsMoreInfo: false
  }
];

describe('LogTable', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('displays loading state initially', async () => {
    let resolvePromise;
    const promise = new Promise<Incident[]>(resolve => {
      resolvePromise = resolve;
    });
    vi.mocked(incidentsApi.getAll).mockReturnValue(promise);

    render(<LogTable />);

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('displays error message when fetch fails', async () => {
    vi.mocked(incidentsApi.getAll).mockRejectedValue(new Error('Failed to fetch incidents'));

    render(<LogTable />);

    await waitFor(() => {
      expect(screen.getByText('No Incidents Found')).toBeInTheDocument();
    });
  });

  it('filters incidents by search query', async () => {
    vi.mocked(incidentsApi.getAll).mockResolvedValue(mockIncidents);

    render(<LogTable />);

    await waitForElementToBeRemoved(() =>
      screen.queryByRole('status', { name: /loading incidents/i })
    );

    expect(screen.getByText('Burglary')).toBeInTheDocument();
    expect(screen.getByText('Campus Library')).toBeInTheDocument();

    const user = userEvent.setup();

    const searchInput = screen.getByPlaceholderText('Search logs...');
    await user.click(searchInput);
    await user.type(searchInput, 'nonexistent');

    await waitFor(() => {
      expect(screen.getByText('No Incidents Found')).toBeInTheDocument();
    });
  });
});
