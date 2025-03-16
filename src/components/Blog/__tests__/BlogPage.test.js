import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Define ga
import * as ga from '../../../lib/ga';

// Move ALL mocks before ANY imports from the application code
// Mock Google Analytics
jest.mock('../../../lib/ga', () => ({
  __esModule: true,
  trackPageView: jest.fn(),
  trackEvent: jest.fn(),
  trackSearch: jest.fn(),
  trackStructuredEvent: jest.fn(),
  EventCategory: {
    CONTENT: 'content',
    USER_INTERACTION: 'user_interaction',
    NAVIGATION: 'navigation',
    CONVERSION: 'conversion'
  },
  EventAction: {
    VIEW: 'view',
    SEARCH: 'search',
    FILTER: 'filter',
    CLICK: 'click'
  }
}));

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    pathname: '/blog',
    query: {},
    push: jest.fn(),
    isReady: true
  })
}));

// Mock MUI icons
jest.mock('@mui/icons-material/GitHub', () => ({
  __esModule: true,
  default: () => <span data-testid="github-icon">GH</span>
}));

jest.mock('@mui/icons-material/Search', () => ({
  __esModule: true,
  default: () => <span data-testid="search-icon">S</span>
}));

jest.mock('@mui/icons-material/RssFeed', () => ({
  __esModule: true,
  default: () => <span data-testid="rss-feed-icon">RSS</span>
}));

// Mock MUI components
jest.mock('@mui/material', () => ({
  Typography: (props) => <div {...props} data-testid="mui-typography">{props.children}</div>,
  Container: (props) => <div {...props} data-testid="mui-container">{props.children}</div>,
  Grid: (props) => <div {...props} data-testid="mui-grid">{props.children}</div>,
  Card: (props) => <div {...props} data-testid="mui-card">{props.children}</div>,
  CardContent: (props) => <div {...props} data-testid="mui-card-content">{props.children}</div>,
  CardMedia: (props) => <div {...props} data-testid="mui-card-media" />,
  Chip: (props) => <span {...props} role="button" data-testid="mui-chip">{props.label}</span>,
  CircularProgress: () => <div role="progressbar" data-testid="mui-progress" />,
  Divider: () => <hr data-testid="mui-divider" />,
  Button: (props) => <button {...props} data-testid="mui-button">{props.children}</button>,
  Box: (props) => <div {...props} data-testid="mui-box">{props.children}</div>,
  Paper: (props) => <div {...props} data-testid="mui-paper">{props.children}</div>,
  InputAdornment: (props) => <div {...props} data-testid="mui-input-adornment">{props.children}</div>,
  TextField: (props) => (
    <div data-testid="mui-text-field">
      <input 
        type="text" 
        placeholder={props.placeholder} 
        value={props.value} 
        onChange={props.onChange}
      />
    </div>
  ),
  useMediaQuery: jest.fn().mockReturnValue(false),
  styled: (component) => (styles) => {
    const StyledComponent = React.forwardRef((props, ref) => 
      React.createElement(component, { ...props, ref, 'data-testid': 'styled-component' })
    );
    StyledComponent.displayName = `Styled(${component.displayName || component.name || 'Component'})`;
    return StyledComponent;
  }
}));

// Mock styled components
jest.mock('@mui/material/styles', () => ({
  styled: (component) => (styles) => {
    const StyledComponent = React.forwardRef((props, ref) => 
      React.createElement(component, { ...props, ref, 'data-testid': 'styled-component' })
    );
    StyledComponent.displayName = `Styled(${component.displayName || component.name || 'Component'})`;
    return StyledComponent;
  },
  useTheme: jest.fn(() => ({
    palette: {
      primary: { main: '#000' },
      background: { paper: '#fff' },
      text: { primary: '#000', secondary: '#666' },
      action: { hover: '#f5f5f5' },
      common: { white: '#fff' }
    },
    spacing: jest.fn(factor => `${factor * 8}px`),
    breakpoints: {
      up: jest.fn(),
      down: jest.fn(),
      between: jest.fn()
    },
    shape: {
      borderRadius: 4
    },
    shadows: ['none', '0px 2px 1px -1px rgba(0,0,0,0.2)']
  }))
}));

// Mock styles import
jest.mock('../../../styles/nonprofit/styles', () => ({
  TitleContainer: (props) => <div {...props} data-testid="title-container">{props.children}</div>,
  LayoutContainer: (props) => <div {...props} data-testid="layout-container">{props.children}</div>,
}));

// Mock News component to simplify testing
jest.mock('../../News/News', () => {
  return function MockNews({ newsData, loading }) {
    return (
      <div data-testid="news-component">
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div>
            {newsData && newsData.length > 0 ? (
              newsData.map(item => (
                <div key={item.id} data-testid={`news-item-${item.id}`}>
                  {item.title}
                </div>
              ))
            ) : (
              <div>No news data</div>
            )}
          </div>
        )}
      </div>
    );
  };
});

// Configure process.env
process.env.NEXT_PUBLIC_API_SERVER_URL = 'http://localhost:3000';

// Import the component AFTER all mocks are defined
import BlogPage from '../BlogPage';

// Mock data for testing
const mockPosts = [
  { id: '1', title: 'Test Post 1', description: 'This is post 1 #react', links: [{ url: '#general', name: 'general' }] },
  { id: '2', title: 'Test Post 2', description: 'This is post 2 #javascript', links: [] },
  { id: '3', title: 'Test Post 3', description: 'This is post 3 #javascript #react', links: [] }
];

describe('BlogPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock fetch for when posts aren't provided as props
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ text: mockPosts }),
      })
    );
  });

  test('renders with loading state initially', () => {
    // Arrange & Act
    render(<BlogPage />);
    
    // Assert
    expect(screen.getByTestId('news-component')).toHaveTextContent('Loading...');
  });

  test('renders posts passed as props without fetching', async () => {
    // Arrange & Act
    render(<BlogPage posts={mockPosts} />);
    
    // Assert - should not be in loading state
    await waitFor(() => {
      expect(screen.getByTestId('news-component')).not.toHaveTextContent('Loading...');
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('fetches posts when none are provided as props', async () => {
    // Arrange & Act
    render(<BlogPage />);
    
    // Assert
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/messages/news?limit=50'));
    });
  });

  test('filters posts when search term is entered', async () => {
    // Arrange
    render(<BlogPage posts={mockPosts} />);
    
    // Wait for posts to load
    await waitFor(() => {
      expect(screen.getByTestId('news-component')).not.toHaveTextContent('Loading...');
    });
    
    // Act - search for "post 1"
    const searchInput = screen.getByPlaceholderText('Search blog posts...');
    fireEvent.change(searchInput, { target: { value: 'post 1' } });
    
    // Assert
    await waitFor(() => {
      expect(ga.trackStructuredEvent).toHaveBeenCalledWith(
        ga.EventCategory.CONTENT,
        'search',
        'blog_content',
        null,
        { search_term: 'post 1' }
      );
    });
  });

  test('filters posts when tag is selected', async () => {
    // Arrange
    render(<BlogPage posts={mockPosts} />);
    
    // Wait for posts to load
    await waitFor(() => {
      expect(screen.getByTestId('news-component')).not.toHaveTextContent('Loading...');
    });
    
    // Act - find and click on a tag chip
    const tagChips = await screen.findAllByRole('button');
    const reactTag = tagChips.find(chip => chip.textContent.includes('react'));
    fireEvent.click(reactTag);
    
    // Assert
    await waitFor(() => {
      expect(ga.trackStructuredEvent).toHaveBeenCalledWith(
        ga.EventCategory.CONTENT,
        'filter',
        'blog_tag',
        null,
        expect.objectContaining({ selected_tag: expect.any(String) })
      );
    });
  });

  test('tracks click on GitHub code link', async () => {
    // Arrange
    render(<BlogPage posts={mockPosts} />);
    
    // Wait for posts to load
    await waitFor(() => {
      expect(screen.getByTestId('news-component')).not.toHaveTextContent('Loading...');
    });
    
    // Act - find and click the GitHub code button
    const githubButton = screen.getByText('View Blog Code');
    fireEvent.click(githubButton);
    
    // Assert
    expect(ga.trackStructuredEvent).toHaveBeenCalledWith(
      ga.EventCategory.NAVIGATION,
      ga.EventAction.CLICK,
      'github_code_link'
    );
  });

  test('tracks click on Join Slack button', async () => {
    // Arrange
    render(<BlogPage posts={mockPosts} />);
    
    // Wait for posts to load
    await waitFor(() => {
      expect(screen.getByTestId('news-component')).not.toHaveTextContent('Loading...');
    });
    
    // Act - find and click the Slack button
    const slackButton = screen.getByText('Join Slack');
    fireEvent.click(slackButton);
    
    // Assert
    expect(ga.trackStructuredEvent).toHaveBeenCalledWith(
      ga.EventCategory.CONVERSION,
      ga.EventAction.CLICK,
      'join_slack'
    );
  });
});