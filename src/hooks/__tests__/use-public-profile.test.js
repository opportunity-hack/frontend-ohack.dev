import { renderHook, waitFor } from '@testing-library/react';
import usePublicProfile from '../use-public-profile';

// Mock fetch globally
global.fetch = jest.fn();

describe('usePublicProfile', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should fetch public profile data successfully', async () => {
    const mockProfileData = {
      name: 'John Doe',
      nickname: 'johndoe',
      github: 'johndoe',
      company: 'Test Company',
      why: 'I love helping nonprofits',
      role: 'hacker_pro',
      badges: [
        { id: 1, image: 'badge1.png', description: 'First Badge' }
      ],
      hackathons: [
        { start_date: '2024-01-01', location: 'Phoenix', devpost_url: 'https://example.com' }
      ]
    };

    const mockPrivacyData = {
      github_username: 'public',
      current_role: 'public',
      current_company: 'public',
      why_are_you_here: 'public',
      badges: 'public',
      hackathon_history: 'public',
      feedback: 'public',
      what: 'public',
      how: 'public'
    };

    // Mock successful profile fetch
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockProfileData),
      })
      // Mock successful privacy settings fetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPrivacyData),
      });

    const { result } = renderHook(() => usePublicProfile('test-user-id'));

    // Initially loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.profile).toBe(null);

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Check that data was loaded correctly
    expect(result.current.profile).toEqual(mockProfileData);
    expect(result.current.privacySettings).toEqual(mockPrivacyData);
    expect(result.current.badges).toEqual(mockProfileData.badges);
    expect(result.current.hackathons).toEqual(mockProfileData.hackathons);
    expect(result.current.feedbackUrl).toBe('/feedback/test-user-id');
    expect(result.current.error).toBe(null);

    // Verify fetch was called correctly
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch).toHaveBeenNthCalledWith(
      1,
      'https://api.ohack.dev/api/messages/profile/test-user-id',
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      'https://api.ohack.dev/api/users/profile/privacy/test-user-id',
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  });

  it('should handle profile fetch error', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => usePublicProfile('test-user-id'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.profile).toBe(null);
    expect(result.current.error).toBe('Network error');
  });

  it('should default to private settings when privacy endpoint fails', async () => {
    const mockProfileData = { name: 'John Doe' };

    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockProfileData),
      })
      .mockRejectedValueOnce(new Error('Privacy endpoint not found'));

    const { result } = renderHook(() => usePublicProfile('test-user-id'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.profile).toEqual(mockProfileData);
    expect(result.current.privacySettings).toEqual({
      github_username: "private",
      current_role: "private", 
      current_company: "private",
      why_are_you_here: "private",
      badges: "private",
      feedback: "private",
      what: "private",
      how: "private",
      hackathon_history: "private"
    });
  });

  it('should handle 404 profile not found', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    const { result } = renderHook(() => usePublicProfile('test-user-id'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.profile).toBe(null);
    expect(result.current.error).toBe('Profile not found');
  });

  it('should not fetch data when userId is not provided', () => {
    const { result } = renderHook(() => usePublicProfile(null));

    expect(result.current.isLoading).toBe(true);
    expect(fetch).not.toHaveBeenCalled();
  });
});