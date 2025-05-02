
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '../test/utils/test-utils';
import IncidentUploader from './IncidentUploader';

// Mock supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    storage: {
      from: vi.fn().mockReturnValue({
        upload: vi.fn().mockResolvedValue({ error: null, data: {} }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://example.com/test.pdf' } }),
      }),
    },
    from: vi.fn().mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ error: null, data: {} }),
        }),
      }),
    }),
  },
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-id' }
  }),
  AuthProvider: ({ children }) => children // Mock AuthProvider to simply render children
}));

describe('IncidentUploader', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders the uploader component', () => {
    render(<IncidentUploader onUploadSuccess={() => {}} />);
    
    expect(screen.getByText('Upload Incidents')).toBeInTheDocument();
    expect(screen.getByText('Drag & drop your PDF files')).toBeInTheDocument();
  });

  it('handles file input changes', async () => {
    render(<IncidentUploader onUploadSuccess={() => {}} />);
    
    const file = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' });
    const input = screen.getByLabelText('file-upload');
    
    Object.defineProperty(input, 'files', {
      value: [file],
    });
    
    fireEvent.change(input);
    
    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
    });
  });
});
