import { renderHook, waitFor } from '@testing-library/react';
import usePublicProfile from '../use-public-profile';

// Mock fetch globally
global.fetch = jest.fn();

const API = process.env.NEXT_PUBLIC_API_SERVER_URL;

describe('usePublicProfile', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const mockProfileData = {
    id: 'test-user-id',
    name: 'John Doe',
    nickname: 'johndoe',
    github: 'johndoe',
    company: 'Test Company',
    why: 'I love helping nonprofits',
    role: 'hacker_pro',
    badges: [{ id: 1, image: 'badge1.png', description: 'First Badge' }],
    hackathon_history: [
      { event_id: '2024_fall', start_date: '2024-01-01', location: 'Phoenix', roles: ['Hacker'] },
    ],
    praises_recent: [],
    praises_count: 0,
    privacy_settings: {
      github: 'public',
      role: 'public',
      company: 'public',
      why: 'public',
      badges: 'public',
      hackathon_history: 'public',
      praises: 'public',
    },
  };

  it('fetches the public portfolio payload (privacy settings embedded — one fetch)', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockProfileData),
    });

    const { result } = renderHook(() => usePublicProfile('test-user-id'));

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.profile).toEqual(mockProfileData);
    expect(result.current.privacySettings).toEqual(mockProfileData.privacy_settings);
    expect(result.current.badges).toEqual(mockProfileData.badges);
    expect(result.current.hackathons).toEqual(mockProfileData.hackathon_history);
    expect(result.current.feedbackUrl).toBe('/feedback/test-user-id');
    expect(result.current.error).toBe(null);

    // The payload embeds privacy_settings, so no second fetch happens
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      `${API}/api/users/test-user-id/profile/public`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }
    );
  });

  it('falls back to the privacy-settings endpoint for older payload shapes', async () => {
    const { privacy_settings, ...withoutPrivacy } = mockProfileData;
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(withoutPrivacy),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ privacy_settings }),
      });

    const { result } = renderHook(() => usePublicProfile('test-user-id'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.privacySettings).toEqual(privacy_settings);
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      `${API}/api/users/test-user-id/profile/privacy-settings`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }
    );
  });

  it('seeds from SSR initialData and skips the mount fetch', async () => {
    const { result } = renderHook(() =>
      usePublicProfile('test-user-id', { initialData: mockProfileData })
    );

    expect(result.current.isLoading).toBe(false);
    expect(result.current.profile).toEqual(mockProfileData);
    expect(result.current.privacySettings).toEqual(mockProfileData.privacy_settings);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('reports not-found for a 404', async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 404 });

    const { result } = renderHook(() => usePublicProfile('missing-user'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe('Profile not found');
    expect(result.current.profile).toBe(null);
  });

  it('handles network errors', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => usePublicProfile('test-user-id'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe('Network error');
    expect(result.current.profile).toBe(null);
  });
});
