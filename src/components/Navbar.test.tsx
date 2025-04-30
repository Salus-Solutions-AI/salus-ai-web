
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@/test/utils/test-utils';
import { Navbar } from './Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { mockUser } from '@/test/utils/test-utils';

// Mock the useAuth hook
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
  AuthProvider: ({ children }) => children
}));

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useLocation: () => ({ pathname: '/' }),
    useNavigate: () => vi.fn()
  };
});

describe('Navbar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.scrollTo = vi.fn();
    vi.resetModules();
  });

  it('renders logo and brand name correctly', () => {
    (useAuth as any).mockReturnValue({
      user: null,
      profile: null,
      signOut: vi.fn()
    });

    render(<Navbar />);
    
    const logo = screen.getByAltText('Salus Solutions');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/logo.png');
    
    const brandName = screen.getByText('Salus Solutions');
    expect(brandName).toBeInTheDocument();
  });

  it('shows sign in button when user is not authenticated', () => {
    (useAuth as any).mockReturnValue({
      user: null,
      profile: null,
      signOut: vi.fn()
    });

    render(<Navbar />);
    
    const signInButton = screen.getByText('Sign In');
    expect(signInButton).toBeInTheDocument();
    
    expect(screen.queryByText('My Account')).not.toBeInTheDocument();
  });

  it('displays user dropdown when user is authenticated', () => {
    (useAuth as any).mockReturnValue({
      user: mockUser,
      profile: { fullName: 'Test User' },
      signOut: vi.fn()
    });

    render(<Navbar />);
    
    const userButton = screen.getByText('Test User');
    expect(userButton).toBeInTheDocument();
    
    expect(screen.queryByText(/Sign In/i)).not.toBeInTheDocument();
  });
});
