import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Index from '@/pages/Index';

vi.mock('@/components/Navbar', () => ({
  Navbar: () => <div data-testid="navbar" />
}));

vi.mock('@/components/Hero', () => ({
  __esModule: true,
  default: () => <div data-testid="hero" />
}));

vi.mock('@/components/ContactForm', () => ({
  __esModule: true,
  default: () => <div data-testid="contact-form" />
}));

describe('Index Page', () => {
  beforeEach(() => {
    const mockIntersectionObserver = vi.fn();
    mockIntersectionObserver.mockReturnValue({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn()
    });
    window.IntersectionObserver = mockIntersectionObserver;
  });

  it('renders the Index page with all main components', () => {
    render(<Index />);
    
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('hero')).toBeInTheDocument();
    expect(screen.getByTestId('contact-form')).toBeInTheDocument();
  });

  it('renders the Features section with correct content', () => {
    render(<Index />);
    
    expect(screen.getByRole('heading', { name: 'Features', level: 2 })).toBeInTheDocument();
    expect(screen.getByText('Our platform streamlines the entire Clery compliance process, from automatic categorization to log generation.')).toBeInTheDocument();
    
    expect(screen.getByText('Automated Incident Classification')).toBeInTheDocument();
    expect(screen.getByText('Real-Time Clery Log Updates')).toBeInTheDocument();
    expect(screen.getByText('Institution-Specific Learning')).toBeInTheDocument();
    expect(screen.getByText('Human-Centric Review System')).toBeInTheDocument();
  });

  it('renders the FAQ section with accordion items', () => {
    render(<Index />);
    
    expect(screen.getByRole('heading', { name: 'FAQ', level: 2 })).toBeInTheDocument();
    expect(screen.getByText('Frequently Asked Questions.')).toBeInTheDocument();
    
    expect(screen.getByText('Can Salus integrate with my current RMS?')).toBeInTheDocument();
    expect(screen.getByText('How long does it take to implement Salus?')).toBeInTheDocument();
    expect(screen.getByText('Is Salus FERPA compliant?')).toBeInTheDocument();
    expect(screen.getByText('Is my data secure?')).toBeInTheDocument();
  });

  it('renders the Contact Us section', () => {
    render(<Index />);
    
    expect(screen.getByRole('heading', { name: 'Contact Us', level: 2 })).toBeInTheDocument();
  });

  it('renders the Footer with copyright and links', () => {
    render(<Index />);
    
    expect(screen.getByText('© Salus Solutions Inc. 2025')).toBeInTheDocument();
    expect(screen.getByText('Platform')).toBeInTheDocument();
    expect(screen.getByText('Resources')).toBeInTheDocument();
    
    const links = screen.getAllByRole('link');
    const linkTexts = ['Features', 'FAQ', 'Book a Demo', 'Contact Us'];
    
    linkTexts.forEach(text => {
      const link = links.find(link => link.textContent === text);
      expect(link).toBeInTheDocument();
    });
  });
});
