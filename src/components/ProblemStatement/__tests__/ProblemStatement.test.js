import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProblemStatement from '../ProblemStatement';

// Mock react-markdown and other problematic modules
jest.mock('react-markdown', () => {
  return ({ children }) => <div data-testid="markdown">{children}</div>;
});

// Mock the necessary hooks and components
jest.mock('../../../hooks/use-problem-statements', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    problem_statement: {
      id: 'test-id',
      title: 'Test Problem Statement',
      description: 'This is a test description',
      status: 'needs_help',
      first_thought_of: '2023',
      skills: ['JavaScript', 'React'],
      slack_channel: 'test-channel',
      references: [
        { name: 'Test Reference', link: 'https://example.com' }
      ],
      github: [
        { name: 'Test Repo', link: 'https://github.com/test/repo' }
      ],
      events: ['event-1'],
      helping: [
        { slack_user: 'user-1', type: 'hacker' },
        { slack_user: 'user-2', type: 'mentor' }
      ]
    }
  }))
}));

jest.mock('../../../hooks/use-hackathon-events', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    hackathons: [],
    handle_get_hackathon: jest.fn(),
    handle_get_hackathon_id: jest.fn((id, callback) => {
      callback({
        id: 'event-1',
        name: 'Test Event',
        teams: ['team-1']
      });
    }),
    handle_problem_statement_to_event_link_update: jest.fn()
  }))
}));

jest.mock('../../../hooks/use-teams', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    teams: [],
    handle_new_team_submission: jest.fn(),
    handle_unjoin_a_team: jest.fn(),
    handle_join_team: jest.fn(),
    handle_get_team: jest.fn()
  }))
}));

jest.mock('../../../hooks/use-profile-api', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    badges: null,
    hackathons: null,
    profile: { 
      user_id: 'user-1',
      role: 'developer',
      education: 'university',
      shirt_size: 'L',
      expertise: 'React',
      why: 'To help',
      company: 'Test Company',
      github: 'testuser',
      history: [],
      profile_url: 'http://localhost/profile/user-1',
      linkedin_url: '',
      instagram_url: ''
    },
    get_user_by_id: jest.fn((id, callback) => {
      callback({ id, name: 'Test User' });
    }),
    feedback_url: '',
    handle_help_toggle: jest.fn(),
    update_profile_metadata: jest.fn()
  }))
}));

jest.mock('react-facebook-pixel', () => ({
  __esModule: true,
  default: {
    init: jest.fn(),
    track: jest.fn(),
    trackCustom: jest.fn()
  }
}));

jest.mock('@propelauth/react', () => ({
  __esModule: true,
  useRedirectFunctions: jest.fn(() => ({
    redirectToLoginPage: jest.fn()
  }))
}));

jest.mock('../../../lib/ga', () => ({
  __esModule: true,
  event: jest.fn()
}));

// Mock MUI components that might cause issues in tests
jest.mock('@mui/material/Tooltip', () => {
  return function MockTooltip({ title, children }) {
    return (
      <div title={typeof title === 'string' ? title : 'tooltip'}>
        {children}
      </div>
    );
  };
});

// Mock child components to simplify testing
jest.mock('../../../components/ProjectProgress/ProjectProgress', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="project-progress">Project Progress</div>)
}));

jest.mock('../../../components/Events/Events', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="events">Events Component</div>)
}));

jest.mock('../../../components/ProblemStatementContent/ProblemStatementContent', () => ({
  __esModule: true,
  default: jest.fn(({ sections }) => (
    <div data-testid="problem-statement-content">
      {sections.map((section, index) => (
        <div key={index} data-testid={`section-${section.label}`}>
          {section.label}
        </div>
      ))}
    </div>
  ))
}));

// Create a wrapper component to handle ThemeProvider for MUI components
const AllTheProviders = ({ children }) => {
  return children;
};

const customRender = (ui, options) =>
  render(ui, { wrapper: AllTheProviders, ...options });

describe('ProblemStatement Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading state when problem_statement is not available', () => {
    // Override the mock to return no problem statement
    require('../../../hooks/use-problem-statements').default.mockImplementationOnce(() => ({
      problem_statement: null
    }));

    customRender(<ProblemStatement problem_statement_id="test-id" />);
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('renders with all required elements when problem_statement is available', () => {
    const { container } = customRender(
      <ProblemStatement 
        problem_statement_id="test-id" 
        user={{ userId: 'user-1' }} 
        npo_id="npo-1" 
      />
    );
    
    // Check title and basic elements
    expect(screen.getByText('Test Problem Statement')).toBeInTheDocument();
    expect(screen.getByText('2023')).toBeInTheDocument();
    expect(screen.getByText('Needs Help')).toBeInTheDocument();
    expect(screen.getByText('Reference Docs')).toBeInTheDocument();
    expect(screen.getByTestId('project-progress')).toBeInTheDocument();
    expect(screen.getByTestId('problem-statement-content')).toBeInTheDocument();
    
    // Check section labels are present
    expect(screen.getByTestId('section-Events')).toBeInTheDocument();
    expect(screen.getByTestId('section-Description')).toBeInTheDocument();
    expect(screen.getByTestId('section-Code & Tasks')).toBeInTheDocument();
    expect(screen.getByTestId('section-References')).toBeInTheDocument();
  });

  test('renders with production status correctly', () => {
    // Override the mock to return production status
    require('../../../hooks/use-problem-statements').default.mockImplementationOnce(() => ({
      problem_statement: {
        id: 'test-id',
        title: 'Test Problem Statement',
        description: 'This is a test description',
        status: 'production',
        first_thought_of: '2023',
        skills: ['JavaScript', 'React'],
        slack_channel: 'test-channel',
        references: [
          { name: 'Test Reference', link: 'https://example.com' }
        ],
        github: [
          { name: 'Test Repo', link: 'https://github.com/test/repo' }
        ],
        events: ['event-1'],
        helping: []
      }
    }));

    customRender(
      <ProblemStatement 
        problem_statement_id="test-id" 
        user={{ userId: 'user-1' }} 
        npo_id="npo-1" 
      />
    );
    
    expect(screen.getByText('Live')).toBeInTheDocument();
  });

  test('shows login button for non-authenticated users', () => {
    customRender(
      <ProblemStatement 
        problem_statement_id="test-id" 
        user={null} 
        npo_id="npo-1" 
      />
    );
    
    expect(screen.getByText('Log In')).toBeInTheDocument();
    expect(screen.getByText('Create OHack Slack Account')).toBeInTheDocument();
  });

  test('shows the correct helper counts', () => {
    customRender(
      <ProblemStatement 
        problem_statement_id="test-id" 
        user={{ userId: 'user-1' }} 
        npo_id="npo-1" 
      />
    );
    
    // This is a bit tricky to test as the badges are visual components,
    // but we can check for their presence by their tooltips
    expect(screen.getByTitle(/1 hacker is hacking/i)).toBeInTheDocument();
    expect(screen.getByTitle(/1 mentor mentoring/i)).toBeInTheDocument();
  });
});