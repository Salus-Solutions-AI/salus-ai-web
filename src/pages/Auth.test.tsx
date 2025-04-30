import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../test/utils/test-utils';
import userEvent from '@testing-library/user-event';
import Auth from './Auth';
import { useAuth } from '@/contexts/AuthContext';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
  AuthProvider: ({ children }) => children
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: null })
  };
});

vi.mock('@/components/ui/use-toast', () => ({
  toast: vi.fn()
}));

describe('Auth Page', () => {
  const mockSignIn = vi.fn();
  const mockSignUp = vi.fn();
  
  beforeEach(() => {
    vi.resetAllMocks();
    
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      session: null,
      signIn: mockSignIn,
      signUp: mockSignUp,
      signOut: vi.fn(),
      isLoading: false,
      profile: null,
      refetchProfile: vi.fn()
    });
  });

  it('renders the login form by default', () => {
    render(<Auth />);
    
    // Check for login form elements
    expect(screen.getByText(/sign in to your account/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
    expect(screen.getByText(/sign in to your account to manage incident reports/i)).toBeInTheDocument();
    expect(screen.getByRole('sign-in')).toBeInTheDocument();
  });

  it('switches to signup form when "Sign up" link is clicked', async () => {
    render(<Auth />);
    
    const user = userEvent.setup();
    
    await user.click(screen.getByText(/sign up/i));
    
    expect(screen.getByText(/create an account/i)).toBeInTheDocument();
    expect(screen.getByText(/sign up to start managing incident reports/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/organization/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByText(/sign up to start managing incident reports/i)).toBeInTheDocument();
    expect(screen.getByRole('sign-up')).toBeInTheDocument();
  });

  it('calls signIn function when login form is submitted', async () => {
    render(<Auth />);
    
    const user = userEvent.setup();
    
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    
    await user.click(screen.getByRole('sign-in'));
    
    expect(mockSignIn).toHaveBeenCalledWith(
      'test@example.com',
      'password123'
    );
  });

  it('calls signUp function when signup form is submitted', async () => {
    render(<Auth />);
    
    const user = userEvent.setup();
    
    await user.click(screen.getByText(/sign up/i));
    
    await user.type(screen.getByLabelText(/name/i), 'Test User');
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/organization/i), 'test-org');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    
    await user.click(screen.getByRole('sign-up'));
    
    expect(mockSignUp).toHaveBeenCalledWith(
      'test@example.com',
      'password123',
      'Test User',
      'test-org'
    );
  });

  it('displays validation errors for empty fields', async () => {
    render(<Auth />);
    
    const user = userEvent.setup();
    
    await user.click(screen.getByRole('sign-in'));
    
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('displays validation errors for invalid email', async () => {
    render(<Auth />);
    
    const user = userEvent.setup();
    
    await user.type(screen.getByLabelText(/email/i), 'not-an-email');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    
    await user.click(screen.getByRole('sign-in'));
    
    expect(mockSignIn).not.toHaveBeenCalled();
  });
}); 