import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../test/utils/test-utils';
import userEvent from '@testing-library/user-event';
import IncidentDetail from './IncidentDetail';
import { Incident, IncidentProcessingStatus } from '@/types';
import { incidentsApi } from '@/api/resources/incidents';

vi.mock('@/api/resources/incidents', () => ({
  incidentsApi: {
    getById: vi.fn(),
    update: vi.fn()
  }
}));

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
    ...actual,
    useParams: () => ({ id: '123' }),
    useNavigate: () => vi.fn()
    };
});

vi.mock('@/integrations/supabase/storageUtils', () => ({
  downloadIncident: vi.fn()
}));

vi.mock('@/components/ui/use-toast', () => ({
  toast: vi.fn()
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

const mockIncident: Incident = {
  id: '123',
  title: 'Test Incident',
  date: '2023-05-15T12:00:00Z',
  timeStr: '12:00 PM',
  category: 'Theft',
  location: 'Campus Library',
  explanation: 'Test explanation',
  summary: 'Test summary',
  status: IncidentProcessingStatus.PENDING,
  number: 'INC-123',
  pdfUrl: 'https://example.com/test.pdf',
  filePath: '/test/path.pdf',
  uploadedAt: '2023-05-15T12:00:00Z',
  uploadedBy: 'user-id',
  uploaderName: 'Test User',
  isClery: false,
  needsMoreInfo: false,
  requiresTimelyWarning: false
};

describe('IncidentDetail', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('displays incident details when loaded', async () => {
    vi.mocked(incidentsApi.getById).mockResolvedValue(mockIncident);

    render(<IncidentDetail />);

    await waitFor(() => expect(screen.getByText('Test Incident')).toBeInTheDocument());

    expect(screen.getByText('Test Incident')).toBeInTheDocument();
    expect(screen.getByLabelText(/location/i)).toHaveValue('Campus Library');
    expect(screen.getByLabelText(/date/i)).toHaveValue('2023-05-15');
    expect(screen.getByLabelText(/number/i)).toHaveValue('INC-123');
    expect(screen.getByLabelText(/category/i)).toHaveValue('Theft');
    expect(screen.getByLabelText(/summary/i)).toHaveValue('Test summary');
    expect(screen.getByLabelText(/explanation/i)).toHaveValue('Test explanation');
    expect(screen.getByLabelText(/clery/i)).not.toBeChecked();
    expect(screen.getByLabelText(/needs more information/i)).not.toBeChecked();
    expect(screen.getByLabelText(/requires timely warning/i)).not.toBeChecked();
    expect(screen.getByText(/pending review/i)).toBeInTheDocument();
    expect(screen.getByText(/complete review/i)).toBeInTheDocument();
    expect(screen.getByText(/download pdf/i)).toBeInTheDocument();
    expect(screen.queryByText(/save changes/i)).not.toBeInTheDocument();
  });

  it('displays error message when incident not found', async () => {
    vi.mocked(incidentsApi.getById).mockRejectedValue(new Error('Not found'));
    
    render(<IncidentDetail />);
    
    await waitFor(() => expect(screen.getByText('Incident Not Found')).toBeInTheDocument());
  });

  it('allows editing incident details', async () => {
    vi.mocked(incidentsApi.getById).mockResolvedValue(mockIncident);

    render(<IncidentDetail />);

    await waitFor(() => expect(screen.getByText('Test Incident')).toBeInTheDocument());
    
    const locationInput = screen.getByLabelText(/location/i);
    await userEvent.clear(locationInput);
    await userEvent.type(locationInput, 'New Location');
    
    expect(screen.getByText('Save Changes')).toBeInTheDocument();
    
    await userEvent.click(screen.getByText('Save Changes'));
    
    expect(incidentsApi.update).toHaveBeenCalledWith(
      expect.anything(),
      '123',
      expect.objectContaining({ location: 'New Location' })
    );
  });

  it('prevents both needsMoreInfo and requiresTimelyWarning from being selected', async () => {
    vi.mocked(incidentsApi.getById).mockResolvedValue(mockIncident);

    render(<IncidentDetail />);

    await waitFor(() => expect(screen.getByText('Test Incident')).toBeInTheDocument());
    
    const needsMoreInfoCheckbox = screen.getByLabelText(/needs more information/i);
    const requiresTimelyWarningCheckbox = screen.getByLabelText(/requires timely warning/i);
    
    expect(needsMoreInfoCheckbox).not.toBeChecked();
    expect(requiresTimelyWarningCheckbox).not.toBeChecked();
    
    await userEvent.click(needsMoreInfoCheckbox);
    expect(needsMoreInfoCheckbox).toBeChecked();
    expect(requiresTimelyWarningCheckbox).not.toBeChecked();
    
    await userEvent.click(requiresTimelyWarningCheckbox);
    expect(requiresTimelyWarningCheckbox).toBeChecked();
    expect(needsMoreInfoCheckbox).not.toBeChecked();
    
    await userEvent.click(needsMoreInfoCheckbox);
    expect(needsMoreInfoCheckbox).toBeChecked();
    expect(requiresTimelyWarningCheckbox).not.toBeChecked();
  });

  it('allows marking incident as completed', async () => {
    vi.mocked(incidentsApi.getById).mockResolvedValue(mockIncident);

    render(<IncidentDetail />);

    await waitFor(() => expect(screen.getByText('Test Incident')).toBeInTheDocument());
    
    await userEvent.click(screen.getByText('Complete Review'));
    
    expect(incidentsApi.update).toHaveBeenCalledWith(
      expect.anything(),
      '123',
      { status: IncidentProcessingStatus.COMPLETED }
    );
  });

  it('prevents marking as completed when needsMoreInfo is true', async () => {
    const incidentWithMoreInfoNeeded = {
      ...mockIncident,
      needsMoreInfo: true
    };
    
    vi.mocked(incidentsApi.getById).mockResolvedValue(incidentWithMoreInfoNeeded);
    
    render(<IncidentDetail />);

    await waitFor(() => expect(screen.getByText('Test Incident')).toBeInTheDocument());
    
    await userEvent.click(screen.getByText('Complete Review'));
    
    expect(incidentsApi.update).not.toHaveBeenCalled();
  });

  it('shows email template dialog when button is clicked', async () => {
    const incidentWithMoreInfoNeeded = {
      ...mockIncident,
      needsMoreInfo: true
    };
    
    vi.mocked(incidentsApi.getById).mockResolvedValue(incidentWithMoreInfoNeeded);
    
    render(<IncidentDetail />);

    await waitFor(() => expect(screen.getByText('Test Incident')).toBeInTheDocument());
    
    await userEvent.click(screen.getByText('Generate Email Template'));
    
    expect(screen.getByText('Request Additional Information')).toBeInTheDocument();
    expect(screen.getByText(/copy this email template/i)).toBeInTheDocument();
  });

  it('copies email subject and body to clipboard', async () => {
    const incidentWithMoreInfoNeeded = {
      ...mockIncident,
      needsMoreInfo: true
    };
    
    vi.mocked(incidentsApi.getById).mockResolvedValue(incidentWithMoreInfoNeeded);
    
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined)
      }
    });
    render(<IncidentDetail />);

    await waitFor(() => expect(screen.getByText('Test Incident')).toBeInTheDocument());
    
    await userEvent.click(screen.getByText('Generate Email Template'));
    
    // Find and click the copy buttons (they have clipboard icons)
    const copyButtons = screen.getAllByRole('button');
    const subjectCopyButton = copyButtons.find(button => 
      button.parentElement?.textContent?.includes('Additional Information Needed')
    );
    
    await userEvent.click(subjectCopyButton!);
    
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });
}); 
