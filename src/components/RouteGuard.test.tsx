
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@/test/utils/test-utils';
import { useAuth } from '@/contexts/AuthContext';
import RouteGuard from './RouteGuard';
import { mockUser } from '@/test/utils/test-utils';

// Mock the useAuth hook
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
  AuthProvider: ({ children }) => children
}));

// Mock React Router's Navigate component
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Navigate: ({ to }: { to: string }) => <div data-testid="navigate" data-to={to}>Navigate to {to}</div>,
    Outlet: () => <div data-testid="outlet">Protected Content</div>
  };
});

describe('RouteGuard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading spinner when authentication is being checked', () => {
    // Mock loading state
    (useAuth as any).mockReturnValue({
      user: null,
      isLoading: true
    });

    render(<RouteGuard />);
    
    // Check for loading spinner
    const loadingSpinner = screen.getByRole('status');
    expect(loadingSpinner).toBeInTheDocument();
    expect(loadingSpinner).toHaveClass('animate-spin');
    
    // Ensure neither Navigate nor Outlet is rendered
    expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
    expect(screen.queryByTestId('outlet')).not.toBeInTheDocument();
  });

  it('redirects to login page when user is not authenticated', () => {
    // Mock unauthenticated state
    (useAuth as any).mockReturnValue({
      user: null,
      isLoading: false
    });

    render(<RouteGuard />);
    
    // Check for navigate component with correct redirect
    const navigate = screen.getByTestId('navigate');
    expect(navigate).toBeInTheDocument();
    expect(navigate).toHaveAttribute('data-to', '/login');
    
    // Ensure loading spinner and outlet are not rendered
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByTestId('outlet')).not.toBeInTheDocument();
  });

  it('redirects to custom path when specified and user is not authenticated', () => {
    // Mock unauthenticated state
    (useAuth as any).mockReturnValue({
      user: null,
      isLoading: false
    });

    render(<RouteGuard redirectTo="/custom-login" />);
    
    // Check for navigate component with custom redirect
    const navigate = screen.getByTestId('navigate');
    expect(navigate).toBeInTheDocument();
    expect(navigate).toHaveAttribute('data-to', '/custom-login');
  });

  it('renders outlet when user is authenticated', () => {
    // Mock authenticated state
    (useAuth as any).mockReturnValue({
      user: mockUser,
      isLoading: false
    });

    render(<RouteGuard />);
    
    // Check for outlet component
    const outlet = screen.getByTestId('outlet');
    expect(outlet).toBeInTheDocument();
    expect(outlet).toHaveTextContent('Protected Content');
    
    // Ensure loading spinner and navigate are not rendered
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
  });
});
