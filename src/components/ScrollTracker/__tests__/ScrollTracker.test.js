import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import ScrollTracker from '../../ScrollTracker';
import * as ga from '../../../lib/ga';

// Mock Google Analytics
jest.mock('../../../lib/ga', () => ({ __esModule: true,
  trackScrollDepth: jest.fn(),
  EventAction: {
    SCROLL: 'scroll'
  }
}));

// Mock throttle to execute immediately
jest.mock('lodash/throttle', () => jest.fn(fn => fn));

// Mock router
jest.mock('next/router', () => ({
  useRouter: () => ({
    pathname: '/test-path'
  })
}));

// Mock window scroll properties and methods
const mockScroll = jest.fn();
const originalScrollY = window.scrollY;
const originalInnerHeight = window.innerHeight;

// Mock object dimensions for scroll calculation
const mockDocumentDimensions = {
  scrollHeight: 1000,
  offsetHeight: 1000,
  clientHeight: 800
};

describe('ScrollTracker Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup document body dimensions for scroll testing
    Object.defineProperty(document.documentElement, 'scrollHeight', { value: mockDocumentDimensions.scrollHeight });
    Object.defineProperty(document.body, 'scrollHeight', { value: mockDocumentDimensions.scrollHeight });
    Object.defineProperty(document.body, 'offsetHeight', { value: mockDocumentDimensions.offsetHeight });
    Object.defineProperty(document.documentElement, 'clientHeight', { value: mockDocumentDimensions.clientHeight });
    
    // Setup scroll mocking
    window.scrollY = 0;
    window.innerHeight = 500;
    window.scrollTo = mockScroll;
    
    // Mock throttled function to execute immediately
    jest.mock('lodash/throttle', () => fn => fn);
  });

  afterEach(() => {
    // Restore original values
    window.scrollY = originalScrollY;
    window.innerHeight = originalInnerHeight;
  });

  test('renders without crashing and does not display anything', () => {
    const { container } = render(<ScrollTracker pageType="test_page" />);
    expect(container.firstChild).toBeNull();
  });

  test('tracks scroll milestones when user scrolls', () => {
    // Arrange
    render(<ScrollTracker pageType="test_page" contentId="test-123" />);
    
    // Act - simulate scrolling to 30% (past 25% milestone)
    act(() => {
      window.scrollY = 150; // 30% of the scrollable area
      fireEvent.scroll(window);
    });
    
    // Assert that 25% milestone was tracked
    expect(ga.trackScrollDepth).toHaveBeenCalledWith('test_page', 25);
    expect(ga.trackScrollDepth).not.toHaveBeenCalledWith('test_page', 50);
    
    // Reset mock to check next milestone
    jest.clearAllMocks();
    
    // Act - simulate scrolling to 60% (past 50% milestone)
    act(() => {
      window.scrollY = 300; // 60% of the scrollable area
      fireEvent.scroll(window);
    });
    
    // Assert that 50% milestone was tracked
    expect(ga.trackScrollDepth).toHaveBeenCalledWith('test_page', 50);
    expect(ga.trackScrollDepth).not.toHaveBeenCalledWith('test_page', 75);
    
    // Reset mock to check next milestone
    jest.clearAllMocks();
    
    // Act - simulate scrolling to 80% (past 75% milestone)
    act(() => {
      window.scrollY = 400;
      fireEvent.scroll(window);
    });
    
    // Assert that 75% milestone was tracked
    expect(ga.trackScrollDepth).toHaveBeenCalledWith('test_page', 75);
    expect(ga.trackScrollDepth).not.toHaveBeenCalledWith('test_page', 100);
    
    // Reset mock to check final milestone
    jest.clearAllMocks();
    
    // Act - simulate scrolling to 100%
    act(() => {
      window.scrollY = 500;
      fireEvent.scroll(window);
    });
    
    // Assert that 100% milestone was tracked
    expect(ga.trackScrollDepth).toHaveBeenCalledWith('test_page', 100);
  });

  test('uses pathname when pageType is not provided', () => {
    // Arrange
    render(<ScrollTracker />);
    
    // Act - simulate scrolling to 30% (past 25% milestone)
    act(() => {
      window.scrollY = 150;
      fireEvent.scroll(window);
    });
    
    // Assert that the pathname was used instead
    expect(ga.trackScrollDepth).toHaveBeenCalledWith('/test-path', 25);
  });

  test('does not track same milestone twice', () => {
    // Arrange
    render(<ScrollTracker pageType="test_page" />);
    
    // Act - scroll to 30% (past 25% milestone)
    act(() => {
      window.scrollY = 150;
      fireEvent.scroll(window);
    });
    
    // Assert milestone was tracked
    expect(ga.trackScrollDepth).toHaveBeenCalledTimes(1);
    expect(ga.trackScrollDepth).toHaveBeenCalledWith('test_page', 25);
    
    // Reset mocks to verify
    jest.clearAllMocks();
    
    // Act - scroll again to same position
    act(() => {
      window.scrollY = 155; // Still past 25% but not 50%
      fireEvent.scroll(window);
    });
    
    // Assert milestone was not tracked again
    expect(ga.trackScrollDepth).not.toHaveBeenCalled();
  });

  test('cleans up scroll listener on unmount', () => {
    // Arrange
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
    
    // Act
    const { unmount } = render(<ScrollTracker pageType="test_page" />);
    unmount();
    
    // Assert
    expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
  });
});