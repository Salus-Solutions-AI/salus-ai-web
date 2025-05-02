import { describe, it, expect } from 'vitest';
import { render, screen } from '../test/utils/test-utils';
import Summary from './Summary';


describe('Summary Page', () => {
    it('renders the Summary page with correct content', () => {
        render(<Summary />);
        
        expect(screen.getByText('Summary')).toBeInTheDocument();
        expect(screen.getByText(/overview of incident data and statistics/i)).toBeInTheDocument();
    });
}); 
