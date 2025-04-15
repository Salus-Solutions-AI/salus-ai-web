
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@/test/utils/test-utils';
import IncidentCard from './IncidentCard';
import { Incident, IncidentProcessingStatus } from '@/types';

const mockIncident: Incident = {
  id: '123',
  title: 'Test Incident',
  date: '2025-04-15',
  category: 'Theft',
  location: 'Library',
  explanation: 'Test explanation',
  summary: 'Test summary',
  status: IncidentProcessingStatus.COMPLETED,
  number: 'INC-001',
  pdfUrl: 'https://example.com/test.pdf',
  filePath: '/test/path.pdf',
  uploadedAt: '2025-04-15T10:00:00Z',
  uploadedBy: 'Test User',
  isClery: false,
  needsMoreInfo: false
};

const mockNavigate = vi.fn();

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate
}));

describe('IncidentCard', () => {
  const mockProps = {
    incident: mockIncident,
    onView: vi.fn(),
    onDownload: vi.fn(),
    onDelete: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders incident details correctly', () => {
    render(<IncidentCard {...mockProps} />);
    
    expect(screen.getByText('INC-001')).toBeInTheDocument();
    expect(screen.getByText('Test Incident')).toBeInTheDocument();
    expect(screen.getByText('Theft')).toBeInTheDocument();
    expect(screen.getByText('Library')).toBeInTheDocument();
  });

  it('displays Clery badge when isClery is true', () => {
    const cleryIncident = { ...mockIncident, isClery: true };
    render(<IncidentCard {...mockProps} incident={cleryIncident} />);
    
    expect(screen.getByText('Clery')).toBeInTheDocument();
  });

  it('displays "Needs Info" badge when needsMoreInfo is true', () => {
    const needsInfoIncident = { ...mockIncident, needsMoreInfo: true };
    render(<IncidentCard {...mockProps} incident={needsInfoIncident} />);
    
    expect(screen.getByText('Needs Info')).toBeInTheDocument();
  });

  it('navigates to incident detail page on card click', () => {
    render(<IncidentCard {...mockProps} />);
    
    const card = screen.getByText('INC-001').closest('div');
    fireEvent.click(card!);
    
    expect(mockNavigate).toHaveBeenCalledWith('/incidents/123');
  });

  it('calls onView when View Document is clicked', () => {
    render(<IncidentCard {...mockProps} />);
    
    const button = screen.getByRole('button', { name: /more horizontal/i });
    fireEvent.click(button);
    
    const viewOption = screen.getByText('View Document');
    fireEvent.click(viewOption);
    
    expect(mockProps.onView).toHaveBeenCalledWith(mockIncident.pdfUrl);
  });

  it('calls onDownload when Download PDF is clicked', () => {
    render(<IncidentCard {...mockProps} />);
    
    const button = screen.getByRole('button', { name: /more horizontal/i });
    fireEvent.click(button);
    
    const downloadOption = screen.getByText('Download PDF');
    fireEvent.click(downloadOption);
    
    expect(mockProps.onDownload).toHaveBeenCalledWith(mockIncident);
  });

  it('calls onDelete when Delete Incident is clicked', () => {
    render(<IncidentCard {...mockProps} />);
    
    const button = screen.getByRole('button', { name: /more horizontal/i });
    fireEvent.click(button);
    
    const deleteOption = screen.getByText('Delete Incident');
    fireEvent.click(deleteOption);
    
    expect(mockProps.onDelete).toHaveBeenCalledWith(mockIncident.id);
  });

  it('disables view and download options when pdfUrl is not available', () => {
    const noPdfIncident = { ...mockIncident, pdfUrl: '' };
    render(<IncidentCard {...mockProps} incident={noPdfIncident} />);
    
    const button = screen.getByRole('button', { name: /more horizontal/i });
    fireEvent.click(button);
    
    const viewOption = screen.getByText('View Document');
    const downloadOption = screen.getByText('Download PDF');
    
    expect(viewOption.closest('div')).toHaveAttribute('aria-disabled', 'true');
    expect(downloadOption.closest('div')).toHaveAttribute('aria-disabled', 'true');
  });
});
