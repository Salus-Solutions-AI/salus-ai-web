import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../test/utils/test-utils';
import Logs from './Logs';

vi.mock('@/components/Navbar', () => ({
  Navbar: () => <div data-testid="navbar">Navbar</div>
}));

vi.mock('@/components/LogTable', () => ({
  __esModule: true,
  default: () => <div data-testid="log-table">Log Table</div>
}));

describe('Logs Page', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders the logs page with all components', async () => {
    render(<Logs />);

    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByText('Clery Logs')).toBeInTheDocument();
    expect(screen.getByText(/generate and manage clery logs for your institution/i)).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByTestId('log-table')).toBeInTheDocument();
    });
  });
}); 
