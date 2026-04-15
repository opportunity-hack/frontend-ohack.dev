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

  it('should initialize with default privacy settings', () => {
    const { result } = renderHook(() => usePrivacySettings());
    
    expect(result.current.privacySettings).toEqual({
      github_username: "public",
      current_role: "public", 
      current_company: "public",
      why_are_you_here: "public",
      badges: "public",
      feedback: "public",
      what: "public",
      how: "public",
      hackathon_history: "public"
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