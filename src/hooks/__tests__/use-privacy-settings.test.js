import { renderHook } from '@testing-library/react';
import usePrivacySettings from '../use-privacy-settings';

// Mock the PropelAuth hook
jest.mock('@propelauth/react', () => ({
  useAuthInfo: () => ({
    user: null
  })
}));

// Mock fetch
global.fetch = jest.fn();

describe('usePrivacySettings', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('should initialize with default-private privacy settings', () => {
    const { result } = renderHook(() => usePrivacySettings());
    const settings = result.current.privacySettings;

    // Default-private-first: only praises is public by default (matches
    // backend model/user.py default_public_privacy_fields)
    expect(settings.praises).toBe('public');
    Object.entries(settings).forEach(([field, value]) => {
      if (field !== 'praises') {
        expect(value).toBe('private');
      }
    });

    // Keys must match backend privacy_fields — "why", not the old
    // "why_are_you_here" (that toggle was a silent server-side no-op)
    expect(settings).toHaveProperty('why');
    expect(settings).not.toHaveProperty('why_are_you_here');

    // Portfolio-era fields are present and private
    ['bio', 'bio_video_url', 'portfolio_links', 'teams', 'certificates',
      'github_history', 'hearts'].forEach((field) => {
      expect(settings[field]).toBe('private');
    });

    expect(result.current.isLoading).toBe(true);
  });

  it('should have the correct structure', () => {
    const { result } = renderHook(() => usePrivacySettings());
    
    expect(result.current).toHaveProperty('privacySettings');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('updatePrivacySetting');
    expect(result.current).toHaveProperty('togglePrivacySetting');
    expect(result.current).toHaveProperty('fetchPrivacySettings');
  });
});