import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../test/utils/test-utils';
import userEvent from '@testing-library/user-event';
import Incidents from './Incidents';

vi.mock('@/api/resources/incidents', () => ({
  incidentsApi: {
    getAll: vi.fn().mockResolvedValue([]),
    getStats: vi.fn().mockResolvedValue({
      total: 10,
      pending: 5,
      completed: 5,
      needsMoreInfo: 2,
      requiresTimelyWarning: 1,
      isClery: 3
    })
  }
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-id' },
    session: {
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
    }
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

vi.mock('@/components/Navbar', () => ({
  Navbar: () => <div data-testid="navbar">Navbar</div>
}));

vi.mock('@/components/IncidentGrid', () => ({
  __esModule: true,
  default: ({ refresh, refreshQueuedOnly }) => (
    <div data-testid="incident-grid">
      Incident Grid
      <div data-testid="refresh-prop">{refresh.toString()}</div>
      <div data-testid="refresh-queued-only-prop">{refreshQueuedOnly.toString()}</div>
    </div>
  )
}));

describe('Incidents Page', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders the incidents page with all components', async () => {
    render(<Incidents />);

    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByText('Incidents')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByTestId('incident-grid')).toBeInTheDocument();
    });
  });

  it('opens upload dialog when upload button is clicked', async () => {
    render(<Incidents />);
    
    const user = userEvent.setup();
    
    const uploadButton = screen.getByRole('button', { name: /upload/i });
    await user.click(uploadButton);
    
    expect(screen.getByText(/drag & drop your PDF files/i)).toBeInTheDocument();
  });
}); 