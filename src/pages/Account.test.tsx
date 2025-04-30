import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../test/utils/test-utils';
import Account from './Account';
import { profilesApi } from '@/api/resources/profiles';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-id', email: 'test@example.com' },
    session: { access_token: 'mock-token' },
    profile: {
      id: 'test-id',
      fullName: 'Test User',
      organization: 'Test Organization',
      createdCategories: true
    },
    refetchProfile: vi.fn()
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

vi.mock('@/components/ui/use-toast', () => ({
  toast: vi.fn()
}));

vi.mock('@/api/resources/profiles', () => ({
  profilesApi: {
    update: vi.fn()
  }
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
      updateUser: vi.fn().mockResolvedValue({ error: null })
    }
  }
}));

vi.mock('@/components/ui/form', () => ({
  Form: ({ children }) => children,
  FormControl: ({ children }) => children,
  FormField: ({ render }) => render({ field: { onChange: vi.fn(), value: '', name: '' } }),
  FormItem: ({ children }) => children,
  FormLabel: ({ children }) => children,
  FormMessage: () => null
}));
  
vi.mock('@/components/Navbar', () => ({
  default: () => <div data-testid="navbar-mock" />
}));

vi.mock('react-hook-form', () => ({
  useForm: () => ({
    register: vi.fn(),
    handleSubmit: vi.fn(cb => vi.fn()),
    formState: { errors: {} },
    reset: vi.fn(),
    control: { register: vi.fn() },
    getValues: vi.fn(),
    setValue: vi.fn()
  })
}));

describe('Account Page', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    
    vi.mocked(profilesApi.update).mockResolvedValue({
      id: 'test-id',
      fullName: 'Updated User',
      organization: 'Updated Organization',
      createdCategories: true
    });
  });

  it('renders the account page with user information', async () => {
    render(<Account />);
    
    expect(screen.getByText('Account Settings')).toBeInTheDocument();
    expect(screen.getByText(/manage your profile information and security settings/i)).toBeInTheDocument();
    expect(screen.getByText(/update your account profile information/i)).toBeInTheDocument();
  });
}); 
