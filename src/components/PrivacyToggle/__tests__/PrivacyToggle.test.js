import React from 'react';
import { render, screen } from '@testing-library/react';
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
    
    expect(screen.getByText('Public')).toBeInTheDocument();
  });

  it('should render with private label when isPrivate is true', () => {
    render(
      <PrivacyToggle
        field="test_field"
        isPrivate={true}
        onToggle={mockOnToggle}
      />
    );
    
    expect(screen.getByText('Private')).toBeInTheDocument();
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
    
    expect(screen.getByText('Custom Label')).toBeInTheDocument();
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
    
    await user.click(screen.getByText('Public'));
    
    expect(mockOnToggle).toHaveBeenCalledWith('test_field');
  });

  it('should not call onToggle when disabled', async () => {
    const user = userEvent.setup();
    
    render(
      <PrivacyToggle
        field="test_field"
        isPrivate={false}
        onToggle={mockOnToggle}
        disabled={true}
      />
    );
    
    await user.click(screen.getByText('Public'));
    
    expect(mockOnToggle).not.toHaveBeenCalled();
  });
});