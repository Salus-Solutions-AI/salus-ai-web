import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../test/utils/test-utils';
import userEvent from '@testing-library/user-event';
import Categories from './Categories';
import { categoriesApi } from '@/api/resources/categories';
import { profilesApi } from '@/api/resources/profiles';
import { Category } from '@/types';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-id' },
    session: { access_token: 'mock-token' }
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

vi.mock('@/api/resources/categories', () => ({
  categoriesApi: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  }
}));

vi.mock('@/api/resources/default_categories', () => ({
  defaultCategoriesApi: {
    getAll: vi.fn()
  }
}));

vi.mock('@/api/resources/profiles', () => ({
  profilesApi: {
    getById: vi.fn(),
    update: vi.fn()
  }
}));

vi.mock('@/components/Navbar', () => ({
  Navbar: () => <div data-testid="navbar">Navbar</div>
}));

vi.mock('@/components/ui/use-toast', () => ({
  toast: vi.fn()
}));

describe('Categories Page', () => {
  const mockCategories: Category[] = [
    { 
      id: '1', 
      name: 'Theft', 
      description: 'Property theft incidents',
      longDescription: '',
      createdAt: '2023-01-01T00:00:00Z',
      createdBy: 'user-1'
    },
    { 
      id: '2', 
      name: 'Assault', 
      description: 'Physical assault incidents',
      longDescription: '',
      createdAt: '2023-01-01T00:00:00Z',
      createdBy: 'user-1'
    }
  ];

  beforeEach(() => {
    vi.resetAllMocks();
    
    // Default mocks
    vi.mocked(categoriesApi.getAll).mockResolvedValue(mockCategories);
    vi.mocked(profilesApi.getById).mockResolvedValue({ 
      id: 'user-1',
      fullName: 'Test User',
      organizationId: 'org-1',
    });
  });

  it('renders the categories page with loading state initially', async () => {
    render(<Categories />);
    
    // Check for loading spinner
    expect(screen.getByRole('status')).toBeInTheDocument();
    
    // Wait for content to load
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  it('displays categories when loaded', async () => {
    render(<Categories />);
    
    await waitFor(() => {
      expect(screen.getByText('Theft')).toBeInTheDocument();
      expect(screen.getByText('Assault')).toBeInTheDocument();
      expect(screen.getByText('Property theft incidents')).toBeInTheDocument();
    });
  });

  it('shows empty state when no categories', async () => {
    vi.mocked(categoriesApi.getAll).mockResolvedValueOnce([]);
    
    render(<Categories />);
    
    await waitFor(() => {
      expect(screen.getByText(/no categories found/i)).toBeInTheDocument();
    });
  });

  it('opens add category dialog when add button is clicked', async () => {
    render(<Categories />);
    
    await waitFor(() => {
      expect(screen.getByText('Theft')).toBeInTheDocument();
    });
    
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /add category/i }));
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/create a new category/i)).toBeInTheDocument();
  });

  it('opens edit dialog when edit button is clicked', async () => {
    render(<Categories />);
    
    await waitFor(() => {
      expect(screen.getByText('Theft')).toBeInTheDocument();
    });
    
    const user = userEvent.setup();
    const editButtons = screen.getAllByTitle('Edit');
    await user.click(editButtons[0]);
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/update the details/i)).toBeInTheDocument();
  });

  it('opens delete dialog when delete button is clicked', async () => {
    render(<Categories />);
    
    await waitFor(() => {
      expect(screen.getByText('Theft')).toBeInTheDocument();
    });
    
    const user = userEvent.setup();
    const deleteButtons = screen.getAllByTitle('Delete');
    await user.click(deleteButtons[0]);
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/delete category/i)).toBeInTheDocument();
  });
});
