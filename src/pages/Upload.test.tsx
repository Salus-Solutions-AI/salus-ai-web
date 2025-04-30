import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test/utils/test-utils';
import Upload from './Upload';

vi.mock('@/components/Navbar', () => ({
  Navbar: () => <div data-testid="navbar">Navbar</div>
}));

vi.mock('@/components/IncidentGrid', () => ({
  __esModule: true,
  default: () => <div data-testid="incident-grid">Incident Grid</div>
}));
  
vi.mock('@/components/IncidentUploader', () => ({
  __esModule: true,
  default: () => <div data-testid="incident-uploader">Incident Uploader</div>
}));

describe('Upload Page', () => {
  it('renders the Upload page with correct content', () => {
    render(<Upload />);
        
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('incident-grid')).toBeInTheDocument();
    expect(screen.getByTestId('incident-uploader')).toBeInTheDocument();
  });
}); 
