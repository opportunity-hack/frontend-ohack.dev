import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PrivacyToggle from '../PrivacyToggle';

describe('PrivacyToggle', () => {
  const mockOnToggle = jest.fn();

  beforeEach(() => {
    mockOnToggle.mockClear();
  });

  it('should render with default public label', () => {
    render(
      <PrivacyToggle
        field="test_field"
        isPrivate={false}
        onToggle={mockOnToggle}
      />
    );
    
    expect(screen.getByText('test_field: Public')).toBeInTheDocument();
  });

  it('should render with private label when isPrivate is true', () => {
    render(
      <PrivacyToggle
        field="test_field"
        isPrivate={true}
        onToggle={mockOnToggle}
      />
    );

    expect(screen.getByText('test_field: Private')).toBeInTheDocument();
  });

  it('should render with custom label', () => {
    render(
      <PrivacyToggle
        field="test_field"
        isPrivate={false}
        onToggle={mockOnToggle}
        label="Custom Label"
      />
    );

    expect(screen.getByText('Custom Label: Public')).toBeInTheDocument();
  });

  it('should call onToggle when clicked', async () => {
    const user = userEvent.setup();

    render(
      <PrivacyToggle
        field="test_field"
        isPrivate={false}
        onToggle={mockOnToggle}
      />
    );

    await user.click(screen.getByText('test_field: Public'));

    expect(mockOnToggle).toHaveBeenCalledWith('test_field');
  });

  it('should not call onToggle when disabled', async () => {
    render(
      <PrivacyToggle
        field="test_field"
        isPrivate={false}
        onToggle={mockOnToggle}
        disabled={true}
      />
    );

    // A disabled Chip renders with `pointer-events: none`, so a real
    // userEvent.click() correctly refuses to dispatch (matches how a real
    // user can't click it). Use fireEvent here to still exercise the
    // component's own defensive `handleClick` disabled guard.
    fireEvent.click(screen.getByText('test_field: Public'));

    expect(mockOnToggle).not.toHaveBeenCalled();
  });
});