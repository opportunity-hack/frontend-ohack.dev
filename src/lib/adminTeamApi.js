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

// ---------------------------------------------------------------------------
// Per-team AI gateway keys (admin side). Backend: api/teams/gateway_keys.py.
// Status is batch + metadata-only; the plaintext is fetched ONLY on an
// explicit "Reveal" via fetchAdminGatewayKey.
// ---------------------------------------------------------------------------

const STATUS_BATCH_SIZE = 150; // backend caps at 200 ids per call

function authHeaders({ accessToken, orgId }) {
  return { Authorization: `Bearer ${accessToken}`, "X-Org-Id": orgId };
}

/**
 * Batch status for the admin Teams table:
 * `{ [teamId]: { status: "active"|"pending"|"missing", key_alias, max_budget, expires, provisioned_at, rotated_at } }`.
 * Resolves to `null` on a 404 (older backend without the route) so callers
 * can hide the column instead of showing every team as "missing".
 */
export async function fetchGatewayKeyStatuses(
  teamIds,
  { apiServerUrl, accessToken, orgId },
  { client = axios } = {},
) {
  const ids = [...new Set((teamIds || []).filter(Boolean))];
  if (ids.length === 0) return {};
  const headers = authHeaders({ accessToken, orgId });
  const merged = {};
  for (let i = 0; i < ids.length; i += STATUS_BATCH_SIZE) {
    const chunk = ids.slice(i, i + STATUS_BATCH_SIZE);
    try {
      const response = await client.get(
        `${apiServerUrl}/api/team/admin/gateway-keys`,
        { headers, params: { team_ids: chunk.join(",") } },
      );
      Object.assign(merged, response.data?.keys || {});
    } catch (err) {
      if (isNotFound(err)) return null;
      throw err;
    }
  }
  return merged;
}

/** Plaintext key + spend for ONE team (admins may read any team's). */
export async function fetchAdminGatewayKey(
  teamId,
  { apiServerUrl, accessToken, orgId },
  { client = axios } = {},
) {
  const response = await client.get(
    `${apiServerUrl}/api/team/${encodeURIComponent(teamId)}/gateway-key`,
    { headers: authHeaders({ accessToken, orgId }) },
  );
  return response.data;
}

/** Leak recovery: deletes the old key in LiteLLM, mints a new one (same alias). */
export async function rotateGatewayKey(
  teamId,
  { apiServerUrl, accessToken, orgId },
  { client = axios } = {},
) {
  const response = await client.post(
    `${apiServerUrl}/api/team/${encodeURIComponent(teamId)}/gateway-key/rotate`,
    {},
    { headers: authHeaders({ accessToken, orgId }) },
  );
  return response.data;
}

/** (Re)provision — idempotent; returns the active key's metadata. */
export async function provisionGatewayKey(
  teamId,
  { apiServerUrl, accessToken, orgId },
  { client = axios } = {},
) {
  const response = await client.post(
    `${apiServerUrl}/api/team/${encodeURIComponent(teamId)}/gateway-key/retry`,
    {},
    { headers: authHeaders({ accessToken, orgId }) },
  );
  return response.data;
}

/** Human-readable message for an axios error from the gateway-key routes. */
export function gatewayErrorMessage(err, fallback = "Request failed") {
  const body = err?.response?.data;
  const status = err?.response?.status;
  if (body && typeof body.error === "string") {
    if (body.error === "key_not_provisioned") return "No key has been minted for this team yet.";
    if (body.error === "not_team_member") return "Not allowed for this team.";
    return body.error;
  }
  if (status === 404) return "This backend doesn't support gateway keys yet.";
  if (status === 502) return "The AI gateway didn't respond. Try again in a moment.";
  return err?.message || fallback;
}
