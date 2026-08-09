/**
 * use-profile-api must talk to the canonical /api/users/profile endpoints and
 * spread the flat response into `profile` (no field projection — the old
 * hand-built projection silently dropped any field it didn't list).
 */
import { renderHook, waitFor, act } from '@testing-library/react';
import axios from 'axios';
import useProfileApi from '../use-profile-api';

// Explicit factory: axios v1's module interop breaks automock (the hook's
// `axios(...)` and the test's import would reference different mocks)
jest.mock('axios', () => {
  const mockAxios = jest.fn();
  mockAxios.default = mockAxios;
  mockAxios.get = jest.fn();
  mockAxios.post = jest.fn();
  return mockAxios;
});
jest.mock('@propelauth/react', () => {
  // Stable identity — the hook's bootstrap effect is keyed on `user`, so a
  // fresh object per render would loop the effect forever.
  const stableUser = { email: 'test@example.com' };
  return {
    useAuthInfo: () => ({ user: stableUser, isLoggedIn: true }),
  };
});
jest.mock('../../context/env.context', () => ({
  useEnv: () => ({ apiServerUrl: 'https://api.test' }),
}));

const flatProfile = {
  id: 'db-id-123',
  user_id: 'oauth2|slack|T1-U1',
  name: 'Test User',
  role: 'mentor',
  city: 'Tempe',
  want_stickers: 'yes',
  headline: 'Builder',
  profile_slug: 'testy',
  badges: [{ id: 'b1' }],
  hackathons: [{ event_id: '2025_fall', roles: ['Mentor'] }],
  hackathon_history: [{ event_id: '2025_fall', roles: ['Mentor'] }],
};

describe('useProfileApi', () => {
  beforeEach(() => {
    axios.mockReset();
    // Default: every GET serves the flat profile (the bootstrap effect may
    // run more than once under test renderers)
    axios.mockImplementation((config) => Promise.resolve({ data: flatProfile }));
  });

  it('bootstraps from GET /api/users/profile and spreads the flat payload', async () => {
    const { result } = renderHook(() => useProfileApi({}));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(axios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'https://api.test/api/users/profile',
        method: 'GET',
      })
    );

    // Spread semantics: EVERY payload field lands on profile
    expect(result.current.profile).toEqual(
      expect.objectContaining({
        ...flatProfile,
        profile_url: '/profile/db-id-123',
      })
    );
    // user_id present — the NonProfitListTile helping-highlight depends on it
    expect(result.current.profile.user_id).toBe('oauth2|slack|T1-U1');
    expect(result.current.badges).toEqual(flatProfile.badges);
    expect(result.current.hackathons).toEqual(flatProfile.hackathons);
    expect(result.current.feedback_url).toBe('/feedback/db-id-123');
  });

  it('saves via POST /api/users/profile and keeps the onComplete contract', async () => {
    axios.mockImplementation((config) =>
      Promise.resolve({
        data: config.method === 'POST' ? { ...flatProfile, city: 'Phoenix' } : flatProfile,
      })
    );
    const { result } = renderHook(() => useProfileApi({}));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const onComplete = jest.fn();
    await act(async () => {
      await result.current.update_profile_metadata({ city: 'Phoenix' }, onComplete);
    });

    expect(axios).toHaveBeenLastCalledWith(
      expect.objectContaining({
        url: 'https://api.test/api/users/profile',
        method: 'POST',
        data: { metadata: { city: 'Phoenix' } },
      })
    );
    expect(onComplete).toHaveBeenCalledWith('Saved Profile Metadata');
    // The updated payload refreshes local profile state
    expect(result.current.profile.city).toBe('Phoenix');
  });

  it('sends the helping toggle to the canonical route', async () => {
    axios.mockImplementation((config) =>
      Promise.resolve({
        data: config.method === 'POST' ? { message: 'Updated helping status' } : flatProfile,
      })
    );
    const { result } = renderHook(() => useProfileApi({}));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.handle_help_toggle('helping', 'ps-1', 'hacker', 'npo-1');
    });

    expect(axios).toHaveBeenLastCalledWith(
      expect.objectContaining({
        url: 'https://api.test/api/users/profile/helping',
        method: 'POST',
        data: expect.objectContaining({
          status: 'helping',
          problem_statement_id: 'ps-1',
          type: 'hacker',
          npo_id: 'npo-1',
        }),
      })
    );
  });
});
