/**
 * Shared fetch layer for the team dashboard, project pages and Hackers'
 * Choice peer vote (WS-B/C/D) — the frontend side of the Part 3 contracts
 * in docs/plans/team-dashboard-devpost-replacement.md.
 *
 * Every call resolves to parsed JSON or throws an `ApiError` carrying the
 * HTTP status and parsed body, so callers can match on backend error codes
 * (`submissions_closed`, `not_team_member`, `invalid_project`, ...) instead
 * of re-parsing responses themselves. `isNotFound` is the shared "feature
 * off on an older backend" check the plan calls for (deploy order:
 * backend first; every frontend call treats 404 as the feature being off).
 *
 * New calls against the Part 3 endpoints should be added here rather than
 * re-implemented per component/hook.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_SERVER_URL;

export class ApiError extends Error {
  constructor(status, body) {
    const message =
      (body && (body.error || body.message)) || `Request failed (${status})`;
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body || null;
  }
}

async function parseBody(res) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function request(path, { method = "GET", token, body } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  let payload;
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: payload,
  });
  const data = await parseBody(res);
  if (!res.ok) throw new ApiError(res.status, data);
  return data;
}

/** True when `error` is the 409 the backend returns once a deadline has passed. */
export function isSubmissionsClosed(error) {
  return (
    error instanceof ApiError &&
    error.status === 409 &&
    error.body?.error === "submissions_closed"
  );
}

/** True when `error` is a 404 — the standard "feature not on this backend yet" signal. */
export function isNotFound(error) {
  return error instanceof ApiError && error.status === 404;
}

// --- Submission window + team project (Part 3: /api/team/<id>/project*, /api/hackathons/<id>/submissions/window) ---

export function getSubmissionWindow(eventId) {
  return request(
    `/api/hackathons/${encodeURIComponent(eventId)}/submissions/window`,
  );
}

export function saveTeamProject(teamId, payload, token) {
  return request(`/api/team/${encodeURIComponent(teamId)}/project`, {
    method: "POST",
    token,
    body: payload,
  });
}

export function submitTeamProject(teamId, token) {
  return request(`/api/team/${encodeURIComponent(teamId)}/project/submit`, {
    method: "POST",
    token,
    body: {},
  });
}

export function saveTeamDevpost(teamId, devpostLink, token) {
  return request(`/api/team/${encodeURIComponent(teamId)}/devpost`, {
    method: "POST",
    token,
    body: { devpost_link: devpostLink },
  });
}

export function saveTeamDemoVideo(teamId, demoVideoUrl, token) {
  return request(`/api/team/${encodeURIComponent(teamId)}/demo-video`, {
    method: "POST",
    token,
    body: { demo_video_url: demoVideoUrl },
  });
}

export function setMentorAvailability(teamId, open, token) {
  return request(
    `/api/team/${encodeURIComponent(teamId)}/mentor-availability`,
    {
      method: "POST",
      token,
      body: { open: !!open },
    },
  );
}

// --- GitHub activity (Part 3: GET /api/github/activity) ---

export function getGithubActivity(org, repo) {
  return request(
    `/api/github/activity?org=${encodeURIComponent(org)}&repo=${encodeURIComponent(repo)}`,
  );
}

// --- Roster + self-check (Part 3: GET /api/messages/team/<id>, GET /api/volunteer/<id>/me) ---

export function getPublicTeam(teamId) {
  return request(`/api/messages/team/${encodeURIComponent(teamId)}`);
}

export function getHackerSelfStatus(eventId, token) {
  return request(
    `/api/volunteer/${encodeURIComponent(eventId)}/me?type=hacker`,
    { token },
  );
}

/**
 * Existing public single-event endpoint — used where a page only needs
 * masthead-level metadata (title, timezone, peer-vote constraints) and
 * doesn't otherwise fetch the full hackathon doc. Routed through this shared
 * wrapper rather than a bare fetch so callers get the same ApiError contract
 * as everything else here; still best-effort from the caller's point of
 * view (e.g. the vote page swallows failures and falls back to defaults).
 */
export function getHackathonMeta(eventId) {
  return request(`/api/messages/hackathon/${encodeURIComponent(eventId)}`);
}

// --- Hackers' Choice peer vote (Part 3: /api/hackathons/<id>/peer-vote/*) ---

export function getPeerVoteSlate(eventId, token) {
  return request(
    `/api/hackathons/${encodeURIComponent(eventId)}/peer-vote/slate`,
    { token },
  );
}

export function submitPeerVoteBallot(eventId, picks, token) {
  return request(
    `/api/hackathons/${encodeURIComponent(eventId)}/peer-vote/ballot`,
    {
      method: "POST",
      token,
      body: { picks },
    },
  );
}

export function getPeerVoteSummary(eventId) {
  return request(
    `/api/hackathons/${encodeURIComponent(eventId)}/peer-vote/summary`,
  );
}
