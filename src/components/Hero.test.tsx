
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/utils/test-utils';
import Hero from './Hero';
import { act } from 'react';

// Mock React Router's useNavigate
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn()
  };
});

// Mock Intersection Observer
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockReturnValue({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
});
window.IntersectionObserver = mockIntersectionObserver;

describe('Hero Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('renders hero section with correct text content', () => {
    render(<Hero />);
    
    // Check for main heading text
    expect(screen.getByText('AI-Powered Clery Reporting and Log Creation')).toBeInTheDocument();
    
    // Check for subtitle
    expect(screen.getByText('Reduce Administrative Burden. Improve Accuracy. Strengthen Compliance.')).toBeInTheDocument();
    
    // Check for tag line
    expect(screen.getByText('Clery Compliance Made Simple')).toBeInTheDocument();
    
    // Check for CTA button
    expect(screen.getByText('Book a Demo')).toBeInTheDocument();
  });

  it('contains image with correct attributes', () => {
    render(<Hero />);
    
    const image = screen.getByAltText('Categories');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/categories_example.png');
  });
  
  it('starts with image invisible and makes it visible when intersection observer fires', async () => {
    render(<Hero />);
    
    const image = screen.getByAltText('Categories');
    
    // Initially the image should be invisible
    expect(image.className).toContain('opacity-0');
    expect(image.className).not.toContain('opacity-100');
    
    // Simulate intersection observer callback
    act(() => {
      const [observerCallback] = mockIntersectionObserver.mock.calls[0];
      observerCallback([{ isIntersecting: true }]);
    })
    
    // Wait for state update and re-render
    await waitFor(() => {
      // Now the image should be visible
      expect(image.className).not.toContain('opacity-0');
      expect(image.className).toContain('opacity-100');
    });
  }); 
});
