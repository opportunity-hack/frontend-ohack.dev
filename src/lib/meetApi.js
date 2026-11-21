import axios from "axios";

/**
 * Meeting-poll API client — the ONE client for /api/meet.
 *
 * Public calls (read a poll, add or change your answers) carry no auth
 * header; the vote carries a reCAPTCHA token. Admin calls carry the access
 * token plus X-Org-Id. Every method THROWS a `MeetApiError` on failure, so
 * a failed request can never be mistaken for an empty poll.
 */

export class MeetApiError extends Error {
  constructor(message, { status, body, cause } = {}) {
    super(message);
    this.name = "MeetApiError";
    this.status = status;
    this.body = body;
    this.code = body && typeof body === "object" ? body.error : undefined;
    this.cause = cause;
  }
}

const baseURL = () => process.env.NEXT_PUBLIC_API_SERVER_URL;

async function request(method, path, { data, headers, fallback } = {}) {
  try {
    const response = await axios({
      method,
      url: `${baseURL()}${path}`,
      data,
      headers: { "Content-Type": "application/json", ...headers },
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
    throw new MeetApiError(message, { status, body, cause: error });
  }
}

const adminHeaders = (accessToken, orgId) => ({
  Authorization: `Bearer ${accessToken}`,
  ...(orgId ? { "X-Org-Id": orgId } : {}),
});

const enc = encodeURIComponent;

const meetApi = {
  /** Public: the poll and everyone's answers (names only, no emails). */
  getPoll(code) {
    return request("get", `/api/meet/${enc(code)}`, {
      fallback: "Could not load this meeting poll",
    });
  },

  /** Public: add or change your answers. Returns { voteId, editToken }. */
  submitVote(code, payload) {
    return request("post", `/api/meet/${enc(code)}/votes`, {
      data: payload,
      fallback: "Could not save your answers",
    });
  },

  listAdmin(accessToken, orgId) {
    return request("get", "/api/meet/admin/polls", {
      headers: adminHeaders(accessToken, orgId),
      fallback: "Could not load meeting polls",
    });
  },

  getAdmin(code, accessToken, orgId) {
    return request("get", `/api/meet/admin/polls/${enc(code)}`, {
      headers: adminHeaders(accessToken, orgId),
      fallback: "Could not load that poll",
    });
  },

  /** { code?, title, description?, durationMinutes, slots: [{start}] } */
  createAdmin(payload, accessToken, orgId) {
    return request("post", "/api/meet/admin/polls", {
      data: payload,
      headers: adminHeaders(accessToken, orgId),
      fallback: "Could not create the poll",
    });
  },

  /** Any of title, description, durationMinutes, slots, status. */
  updateAdmin(code, payload, accessToken, orgId) {
    return request("patch", `/api/meet/admin/polls/${enc(code)}`, {
      data: payload,
      headers: adminHeaders(accessToken, orgId),
      fallback: "Could not update the poll",
    });
  },

  deleteAdmin(code, accessToken, orgId) {
    return request("delete", `/api/meet/admin/polls/${enc(code)}`, {
      headers: adminHeaders(accessToken, orgId),
      fallback: "Could not delete the poll",
    });
  },

  deleteVoteAdmin(code, voteId, accessToken, orgId) {
    return request(
      "delete",
      `/api/meet/admin/polls/${enc(code)}/votes/${enc(voteId)}`,
      {
        headers: adminHeaders(accessToken, orgId),
        fallback: "Could not remove that response",
      },
    );
  },

  /** { slotId, sendInvites, voteIds?, extraEmails? } */
  finalizeAdmin(code, payload, accessToken, orgId) {
    return request("post", `/api/meet/admin/polls/${enc(code)}/finalize`, {
      data: payload,
      headers: adminHeaders(accessToken, orgId),
      fallback: "Could not schedule the meeting",
    });
  },
};

export default meetApi;
