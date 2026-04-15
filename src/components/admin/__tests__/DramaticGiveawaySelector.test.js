import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import DramaticGiveawaySelector from '../DramaticGiveawaySelector';

// Mock data for testing
const mockGiveaways = [
  {
    user_id: '1',
    entries: 5,
    user: {
      name: 'John Doe',
      nickname: 'johndoe',
      github: 'johndoe',
      profile_image: '/mock-avatar1.jpg'
    },
    giveaway_data: {
      githubEntries: 3,
      profileEntries: 2
    },
    timestamp: '2024-01-01T00:00:00Z'
  },
  {
    user_id: '2',
    entries: 3,
    user: {
      name: 'Jane Smith',
      nickname: 'janesmith',
      github: 'janesmith',
      profile_image: '/mock-avatar2.jpg'
    },
    giveaway_data: {
      githubEntries: 2,
      profileEntries: 1
    },
    timestamp: '2024-01-02T00:00:00Z'
  }
];

describe('DramaticGiveawaySelector', () => {
  it('renders the start button when giveaways and seed are provided', () => {
    render(
      <DramaticGiveawaySelector
        giveaways={mockGiveaways}
        randomSeed="12345"
        onWinnerSelected={jest.fn()}
      />
    );

    expect(screen.getByRole('button', { name: /start dramatic winner selection/i })).toBeInTheDocument();
    expect(screen.getByText('2 participants • 8 total entries')).toBeInTheDocument();
  });

  it('disables the button when no seed is provided', () => {
    render(
      <DramaticGiveawaySelector
        giveaways={mockGiveaways}
        randomSeed=""
        onWinnerSelected={jest.fn()}
      />
    );

    expect(screen.getByRole('button', { name: /start dramatic winner selection/i })).toBeDisabled();
  });

  it('disables the button when no giveaways are provided', () => {
    render(
      <DramaticGiveawaySelector
        giveaways={[]}
        randomSeed="12345"
        onWinnerSelected={jest.fn()}
      />
    );

    expect(screen.getByRole('button', { name: /start dramatic winner selection/i })).toBeDisabled();
  });

  it('opens the dramatic selection dialog when button is clicked', () => {
    render(
      <DramaticGiveawaySelector
        giveaways={mockGiveaways}
        randomSeed="12345"
        onWinnerSelected={jest.fn()}
      />
    );

    const button = screen.getByRole('button', { name: /start dramatic winner selection/i });
    fireEvent.click(button);

    // Check if the stepper is shown
    expect(screen.getByText('Setup Entry Pool')).toBeInTheDocument();
    expect(screen.getByText('Randomize Selection')).toBeInTheDocument();
    expect(screen.getByText('Reveal Winner')).toBeInTheDocument();
    expect(screen.getByText('Celebrate!')).toBeInTheDocument();
  });
});