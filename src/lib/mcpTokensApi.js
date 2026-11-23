import axios from "axios";

/**
 * Personal access tokens for the admin MCP server (/api/mcp/tokens).
 *
 * Every call carries the PropelAuth access token plus X-Org-Id: a personal
 * token cannot manage tokens. Every method THROWS on failure, so a failed
 * request can never be mistaken for "no tokens".
 */

export class McpTokensApiError extends Error {
  constructor(message, { status, body, cause } = {}) {
    super(message);
    this.name = "McpTokensApiError";
    this.status = status;
    this.body = body;
    this.code = body && typeof body === "object" ? body.error : undefined;
    this.cause = cause;
  }
}

export const mcpServerUrl = () =>
  `${process.env.NEXT_PUBLIC_API_SERVER_URL || ""}/api/mcp`;

async function request(method, path, accessToken, orgId, { data, fallback }) {
  try {
    const response = await axios({
      method,
      url: `${process.env.NEXT_PUBLIC_API_SERVER_URL}${path}`,
      data,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        ...(orgId ? { "X-Org-Id": orgId } : {}),
      },
    });
    return response.data;
  } catch (error) {
    const status = error?.response?.status;
    const body = error?.response?.data;
    const serverMessage =
      body && typeof body === "object" ? body.message || body.error : null;
    const message = serverMessage
      ? String(serverMessage)
      : status
        ? `${fallback} (HTTP ${status})`
        : `${fallback} (network error)`;
    throw new McpTokensApiError(message, { status, body, cause: error });
  }
}

const mcpTokensApi = {
  /** { data: [{id, name, token_hint, created_at, expires_at, last_used_at, status}], max_active, max_expiry_days } */
  list(accessToken, orgId) {
    return request("get", "/api/mcp/tokens", accessToken, orgId, {
      fallback: "Could not load your tokens",
    });
  },

  /** { name, expiresInDays } -> { token, data }. `token` is shown once. */
  create(payload, accessToken, orgId) {
    return request("post", "/api/mcp/tokens", accessToken, orgId, {
      data: payload,
      fallback: "Could not create the token",
    });
  },

  revoke(tokenId, accessToken, orgId) {
    return request(
      "delete",
      `/api/mcp/tokens/${encodeURIComponent(tokenId)}`,
      accessToken,
      orgId,
      { fallback: "Could not revoke the token" },
    );
  },
};

export default mcpTokensApi;
