/**
 * Simple test to verify PrintEventInfo component renders without errors
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PrintEventInfo from '../PrintEventInfo';

// Mock environment variables
process.env.NEXT_PUBLIC_API_SERVER_URL = 'https://api.test.com';

// Mock react-qr-code
jest.mock('react-qr-code', () => {
  return function MockQRCode({ value }) {
    return <div data-testid="qr-code">QR Code: {value}</div>;
  };
});

// Mock fetch with proper response
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ data: [] }),
  })
);

const mockEventData = {
  title: 'Test Hackathon',
  start_date: '2024-01-01',
  end_date: '2024-01-02',
  location: 'Virtual',
  countdowns: [
    { name: 'Registration Deadline', date: '2023-12-15' },
    { name: 'Event Start', date: '2024-01-01' }
  ]
};

describe('PrintEventInfo Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('renders without crashing when closed', () => {
    render(
      <PrintEventInfo
        open={false}
        onClose={jest.fn()}
        eventData={mockEventData}
        eventId="test-event"
      />
    );
    
    // Component should render without crashing
    expect(document.body).toBeInTheDocument();
  });

  test('renders dialog when open', () => {
    render(
      <PrintEventInfo
        open={true}
        onClose={jest.fn()}
        eventData={mockEventData}
        eventId="test-event"
      />
    );

    expect(screen.getByText('Print Event Information')).toBeInTheDocument();
  });

  test('renders all checkbox options', async () => {
    render(
      <PrintEventInfo
        open={true}
        onClose={jest.fn()}
        eventData={mockEventData}
        eventId="test-event"
      />
    );

    // Wait for component to finish loading
    await screen.findByText('Print Event Information');

    expect(screen.getByText('Volunteers (0)')).toBeInTheDocument();
    expect(screen.getByText('Mentors (0)')).toBeInTheDocument();
    expect(screen.getByText('Hackers (0)')).toBeInTheDocument();
    expect(screen.getByText('Judges (0)')).toBeInTheDocument();
    expect(screen.getByText('Event Timeline & Important Dates')).toBeInTheDocument();
    expect(screen.getByText('QR Code for Event Page')).toBeInTheDocument();
  });
});