import axios from "axios";

/**
 * Judge API client.
 *
 * Every method THROWS a `JudgeApiError` on failure. The previous version
 * swallowed errors and returned fake `{ success: true }` stubs, so a 403/409/
 * 500 on score submit showed "Score submitted successfully!" and the score
 * was lost — the worst possible failure mode with 15 judges scoring live.
 * Callers decide how to surface the error; nothing here pretends it worked.
 */

export class JudgeApiError extends Error {
  constructor(message, { status, body, cause } = {}) {
    super(message);
    this.name = "JudgeApiError";
    this.status = status;
    this.body = body;
    this.cause = cause;
  }
}

/** True when the backend refused a write because an admin locked the round. */
export const isRoundLocked = (err) =>
  err?.status === 409 && err?.body?.error === "round_locked";
export const isNotFound = (err) => err?.status === 404;
export const isForbidden = (err) => err?.status === 403;

const baseURL = () => process.env.NEXT_PUBLIC_API_SERVER_URL;

const headersFor = (accessToken, orgId) => ({
  Authorization: `Bearer ${accessToken}`,
  "Content-Type": "application/json",
  ...(orgId ? { "X-Org-Id": orgId } : {}),
});

function toApiError(error, fallback) {
  if (error instanceof JudgeApiError) return error;
  const status = error?.response?.status;
  const body = error?.response?.data;
  const serverMessage =
    (body && typeof body === "object" && (body.message || body.error)) || null;
  const message = serverMessage
    ? String(serverMessage)
    : status
      ? `${fallback} (HTTP ${status})`
      : `${fallback} (network error)`;
  return new JudgeApiError(message, { status, body, cause: error });
}

async function request(
  method,
  path,
  { accessToken, orgId, data, fallback } = {},
) {
  try {
    const response = await axios({
      method,
      url: `${baseURL()}${path}`,
      data,
      headers: headersFor(accessToken, orgId),
    });
    return response.data;
  } catch (error) {
    throw toApiError(error, fallback || "Request failed");
  }
}

const enc = encodeURIComponent;

const judgeApi = {
  // ---- Judge-facing -------------------------------------------------------

  /** Hackathons this judge is assigned to, with per-round progress. */
  getJudgeAssignments(judgeId, accessToken) {
    return request("get", `/api/judge/assignments/${enc(judgeId)}`, {
      accessToken,
      fallback: "Couldn't load your judging assignments",
    });
  },

  /** `{ round1_teams, round2_teams, event?, locks? }` for one event. */
  getJudgeTeams(judgeId, eventId, accessToken) {
    return request("get", `/api/judge/teams/${enc(judgeId)}/${enc(eventId)}`, {
      accessToken,
      fallback: "Couldn't load your assigned teams",
    });
  },

  /** `{ team }` — detailed team info for the scoring page. */
  getTeamDetails(teamId, accessToken) {
    return request("get", `/api/judge/team/${enc(teamId)}`, {
      accessToken,
      fallback: "Couldn't load this team",
    });
  },

  /** All of this judge's SUBMITTED scores for an event: `{ scores: [...] }`. */
  getJudgeScores(judgeId, eventId, accessToken) {
    return request("get", `/api/judge/scores/${enc(judgeId)}/${enc(eventId)}`, {
      accessToken,
      fallback: "Couldn't load your scores",
    });
  },

  /** Submit (or re-submit) a score. Throws on any failure, incl. 409 round_locked. */
  submitScore(
    judgeId,
    teamId,
    eventId,
    scores,
    round,
    accessToken,
    feedback = {},
  ) {
    return request("post", "/api/judge/score", {
      accessToken,
      data: {
        judge_id: judgeId,
        team_id: teamId,
        event_id: eventId,
        round,
        scores,
        feedback,
        submitted_at: new Date().toISOString(),
      },
      fallback: "Couldn't submit your score",
    });
  },

  /** Save an in-progress draft. Throws on failure (callers may ignore). */
  saveDraft(
    judgeId,
    teamId,
    eventId,
    scores,
    round,
    accessToken,
    feedback = {},
  ) {
    return request("post", "/api/judge/draft", {
      accessToken,
      data: {
        judge_id: judgeId,
        team_id: teamId,
        event_id: eventId,
        round,
        scores,
        feedback,
        updated_at: new Date().toISOString(),
      },
      fallback: "Couldn't save your draft",
    });
  },

  /** `{ draft }` (draft may be null). */
  getDraft(judgeId, teamId, eventId, round, accessToken) {
    return request(
      "get",
      `/api/judge/draft/${enc(judgeId)}/${enc(teamId)}/${enc(eventId)}/${enc(round)}`,
      { accessToken, fallback: "Couldn't check for a saved draft" },
    );
  },

  /**
   * `{ locks: { round1: {locked,...}, round2: {...} } }`. Resolves
   * `{ locks: null }` on a 404 so an older backend reads as "no locks".
   */
  async getRoundLocks(eventId, accessToken) {
    try {
      return await request("get", `/api/judge/locks/${enc(eventId)}`, {
        accessToken,
        fallback: "Couldn't load round status",
      });
    } catch (err) {
      if (isNotFound(err)) return { locks: null };
      throw err;
    }
  },

  // ---- Admin --------------------------------------------------------------

  /** Judge × team progress for a round (see backend README). Null on 404. */
  async getJudgingProgress(eventId, round, accessToken, orgId) {
    try {
      return await request(
        "get",
        `/api/judge/admin/progress/${enc(eventId)}/${enc(round)}`,
        { accessToken, orgId, fallback: "Couldn't load judging progress" },
      );
    } catch (err) {
      if (isNotFound(err)) return null;
      throw err;
    }
  },

  /** Lock/unlock scoring for a round. Returns `{ success, lock }`. */
  setRoundLock(eventId, round, locked, accessToken, orgId) {
    return request(
      "post",
      `/api/judge/admin/locks/${enc(eventId)}/${enc(round)}`,
      {
        accessToken,
        orgId,
        data: { locked: Boolean(locked) },
        fallback: locked ? "Couldn't lock scoring" : "Couldn't unlock scoring",
      },
    );
  },

  /**
   * Create every missing (judge, team) assignment for a panel in ONE request.
   * payload: { event_id, round, panel_id, judge_ids[], team_ids[], room?,
   *            demo_times?: {team_id: iso}, replace?: bool }
   */
  bulkAssign(payload, accessToken, orgId) {
    return request("post", "/api/judge/admin/assignments/bulk", {
      accessToken,
      orgId,
      data: payload,
      fallback: "Couldn't save assignments",
    });
  },

  createPanel(eventId, panelName, room, accessToken, orgId) {
    return request("post", "/api/judge/panels", {
      accessToken,
      orgId,
      data: { event_id: eventId, panel_name: panelName, room: room || null },
      fallback: "Couldn't create the panel",
    });
  },

  createAssignment(assignment, accessToken, orgId) {
    return request("post", "/api/judge/assignments", {
      accessToken,
      orgId,
      data: assignment,
      fallback: "Couldn't create the assignment",
    });
  },

  deleteAssignment(assignmentId, accessToken, orgId) {
    return request("delete", `/api/judge/assignments/${enc(assignmentId)}`, {
      accessToken,
      orgId,
      fallback: "Couldn't remove the assignment",
    });
  },

  getEventPanels(eventId, accessToken, orgId) {
    return request("get", `/api/judge/panels/${enc(eventId)}`, {
      accessToken,
      orgId,
      fallback: "Couldn't load judge panels",
    });
  },

  getPanelAssignments(panelId, accessToken, orgId) {
    return request("get", `/api/judge/panel/${enc(panelId)}/assignments`, {
      accessToken,
      orgId,
      fallback: "Couldn't load panel assignments",
    });
  },

  /** All submitted scores for an event round (admin): `{ scores, summary }`. */
  getBulkScores(eventId, round, accessToken, orgId) {
    return request(
      "get",
      `/api/judge/admin/scores/${enc(eventId)}/${enc(round)}`,
      { accessToken, orgId, fallback: "Couldn't load scores" },
    );
  },
};

export default judgeApi;
