import { describe, it, expect } from 'vitest';
import { render, screen } from '../test/utils/test-utils';
import NotFound from './NotFound';

describe('NotFound Page', () => {
  it('renders the 404 page with correct content', () => {
    render(<NotFound />);
    
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText(/oops! page not found/i)).toBeInTheDocument();
    expect(screen.getByText(/return to home/i )).toBeInTheDocument();
  });
}); 