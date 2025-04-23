
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '../test/utils/test-utils';
import ContactForm from './ContactForm';
import { useToast } from '@/hooks/use-toast';

// Mock the useToast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn(() => ({
    toast: vi.fn()
  }))
}));

// Mock fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('ContactForm', () => {
  const mockToast = vi.fn();
  
  beforeEach(() => {
    vi.resetAllMocks();
    (useToast as any).mockReturnValue({ toast: mockToast });
    mockFetch.mockReset();
  });

  it('renders the contact form with all required fields', () => {
    render(<ContactForm />);
    
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  it('shows validation errors when submitting empty form', async () => {
    render(<ContactForm />);
    
    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/last name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
      expect(screen.getByText(/message must be at least 10 characters/i)).toBeInTheDocument();
    });
  });

  it('shows error toast when API call fails', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Mock failed API response
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      clone: () => ({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Server error' })
      }),
      json: async () => ({ error: 'Server error' })
    });
    
    render(<ContactForm />);
    
    // Fill form fields
    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'Jane' } });
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Smith' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'jane@example.com' } });
    fireEvent.change(screen.getByLabelText(/message/i), { target: { value: 'Another test message for testing errors' } });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    
    // Verify error toast was shown
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Something went wrong",
          variant: "destructive"
        })
      );
    });

    errorSpy.mockRestore();
  });

  it('successfully submits form with valid data', async () => {
    mockFetch.mockReset();
    
    let resolvePromise;
    const promise = new Promise(resolve => {
      resolvePromise = resolve;
    });
    
    mockFetch.mockImplementationOnce(() => promise);
    
    render(<ContactForm />);
    
    // Fill form fields
    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'Alex' } });
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Johnson' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'alex@example.com' } });
    fireEvent.change(screen.getByLabelText(/message/i), { target: { value: 'Testing state while submitting' } });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    
    // Verify fetch was called
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });
    
    // Check the fetch parameters differently - check the URL using the Request.url property
    const fetchCall = mockFetch.mock.calls[0];
    const [urlOrRequest, options] = fetchCall;
    
    expect(urlOrRequest.url).toBe('http://localhost:54321/functions/v1/send-contact-email');
    const requestBody = await urlOrRequest.clone().json();
    expect(requestBody).toEqual({
      firstName: 'Alex',
      lastName: 'Johnson',
      email: 'alex@example.com',
      message: 'Testing state while submitting'
    });
    
    // Button should now be disabled and show "Sending..."
    await waitFor(() => {
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('disabled', '');
      expect(button.textContent).toBe('Sending...');
    });
    
    // Resolve the promise to complete the API call
    resolvePromise({
      ok: true,
      json: async () => ({ success: true }),
      clone: () => ({
        ok: true,
        json: async () => ({ success: true })
      })
    });
    
    // Wait for form submission to complete
    await waitFor(() => {
      const button = screen.getByRole('button');
      expect(button).not.toHaveAttribute('disabled', '');
      expect(button.textContent).toBe('Submit');
    });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Message sent!",
          variant: "success"
        })
      );
    });
  });
});
