/**
 * Admin team-detail fetch with an older-backend fallback.
 *
 * The backend adds an admin-only `GET /api/team/admin/<teamid>` route that
 * returns the same `{ team: {...} }` shape as the public
 * `GET /api/messages/team/<teamid>` route, plus admin-only fields
 * (`admin_notes`, `nonprofit_rankings`) that the public route no longer
 * carries. An older backend 404s the new route, so callers fall back to the
 * public route to keep working against a not-yet-deployed backend.
 */

import axios from "axios";

/** True when `error` is an HTTP 404 (axios error shape). */
export function isNotFound(err) {
  return Boolean(err && err.response && err.response.status === 404);
}

/**
 * Fetch a team's admin detail payload, falling back to the public team
 * route on a 404 from the admin-only route.
 *
 * @param {string} teamId
 * @param {{apiServerUrl: string, accessToken: string, orgId: string}} params
 * @param {{client?: {get: Function}}} [deps] - injectable axios-like client for tests
 * @returns {Promise<object>} the `{ team: {...} }` payload
 */
export async function fetchAdminTeamDetail(
  teamId,
  { apiServerUrl, accessToken, orgId },
  { client = axios } = {},
) {
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "X-Org-Id": orgId,
  };

  try {
    const response = await client.get(
      `${apiServerUrl}/api/team/admin/${teamId}`,
      { headers },
    );
    return response.data;
  } catch (err) {
    if (isNotFound(err)) {
      const response = await client.get(
        `${apiServerUrl}/api/messages/team/${teamId}`,
        { headers },
      );
      return response.data;
    }
    throw err;
  }
}
