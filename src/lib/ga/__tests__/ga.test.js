import * as ga from '../index';

// Mock window objects
global.window = Object.create(window);
let mockGtag = jest.fn();
let mockReactPixel = { trackCustom: jest.fn(), track: jest.fn() };

// Setup mock window properties
Object.defineProperty(window, 'gtag', {
  writable: true,
  value: mockGtag
});

// Mock react-facebook-pixel
jest.mock('react-facebook-pixel', () => ({
  __esModule: true,
  default: {
    init: jest.fn(),
    pageView: jest.fn(),
    track: jest.fn(),
    trackCustom: jest.fn()
  }
}));

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    pathname: '/test',
    query: {}
  })
}));

describe('Google Analytics Module', () => {
  beforeEach(() => {
    // Reset mock functions
    mockGtag = jest.fn();
    mockReactPixel = {
      init: jest.fn(),
      pageView: jest.fn(),
      track: jest.fn(),
      trackCustom: jest.fn()
    };

    // Mock window for testing
    global.window = Object.create(window);
    global.window.gtag = mockGtag;
    
    // Set the ReactPixel in the ga module
    ga.default.ReactPixel = mockReactPixel;

    // Reset environment before each test
    jest.resetModules();
  });

  afterEach(() => {
    // Cleanup
    jest.clearAllMocks();
    delete global.window.gtag;
  });

  test('pageview should call gtag with correct parameters', () => {
    // Arrange
    const url = '/test-path';
    const additionalParams = { custom_param: 'value' };
    
    // Mock document.title for pageview tracking
    Object.defineProperty(document, 'title', {
      value: 'Test Page Title',
      writable: true
    });

    // Act
    ga.pageview(url, additionalParams);

    // Assert
    expect(mockGtag).toHaveBeenCalledWith('config', process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS, {
      page_path: url,
      page_title: 'Test Page Title',
      custom_param: 'value'
    });
    expect(mockGtag).toHaveBeenCalledWith('event', 'page_view', expect.objectContaining({
      page_path: url,
      page_title: 'Test Page Title',
      custom_param: 'value'
    }));
  });

  test('trackEvent should send event to GA and Facebook Pixel', () => {
    // Arrange
    const action = 'button_click';
    const params = { action_name: 'submit_form' };

    // Act
    ga.trackEvent({ action, params });

    // Assert
    expect(mockGtag).toHaveBeenCalledWith('event', action, expect.objectContaining(params));
  });

  test('trackStructuredEvent should format events correctly', () => {
    // Arrange
    const category = ga.EventCategory.NAVIGATION;
    const action = ga.EventAction.CLICK;
    const label = 'donate_button';
    const value = 123;
    const additionalParams = { custom_field: 'value' };

    // Act
    ga.trackStructuredEvent(category, action, label, value, additionalParams);

    // Assert
    expect(mockGtag).toHaveBeenCalledWith(
      'event', 
      `${category}_${action}`, 
      expect.objectContaining({
        event_category: category,
        event_label: label,
        value: value,
        custom_field: 'value',
        event_time: expect.any(String)
      })
    );
  });

  test('trackError should log errors correctly', () => {
    // Arrange
    const errorType = 'api_error';
    const errorMessage = 'Failed to fetch data';
    const location = 'blog_listing';

    // Act
    ga.trackError(errorType, errorMessage, location);

    // Assert
    expect(mockGtag).toHaveBeenCalledWith(
      'event', 
      `${ga.EventCategory.ERROR}_${errorType}`, 
      expect.objectContaining({
        event_category: ga.EventCategory.ERROR,
        event_label: location,
        error_message: errorMessage
      })
    );
  });

  test('trackJourneyStep should track user journey steps', () => {
    // Arrange
    const journey = 'volunteer';
    const step = 'view_opportunities';
    const additionalParams = { source: 'hero_banner' };

    // Act
    ga.trackJourneyStep(journey, step, additionalParams);

    // Assert
    expect(mockGtag).toHaveBeenCalledWith(
      'event', 
      `${journey}_journey`, 
      expect.objectContaining({
        journey_name: journey,
        journey_step: step,
        source: 'hero_banner'
      })
    );
  });
});