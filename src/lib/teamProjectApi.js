/**
 * The team ↔ project API calls in ONE place (create flow + admin approval),
 * so a backend contract change is a one-file edit.
 *
 *   GET   /api/team/<event_id>/project-options  → {nonprofits:[{id,name,image,website?,
 *                                                   projects:[{id,title,description,skills,status}]}]}
 *   POST  /api/team/queue    {…, nonprofitRankings:[{nonprofit_id, problem_statement_id, rank}]}
 *   POST  /api/team/approve  {teamId, nonprofitId, problemStatementId}
 *   (admin project changes on approved teams go through TeamManagement's
 *   patchTeam → PATCH /api/team/edit {id, problem_statement_id})
 *
 * Refusals come back as 4xx `{error, message}`; axios throws on those, so
 * every helper rethrows a `TeamProjectError` carrying `status`, `code` and a
 * message that is safe to show.
 */
import axios from "axios";

const apiBase = () => process.env.NEXT_PUBLIC_API_SERVER_URL;

export class TeamProjectError extends Error {
  constructor(message, { status = null, code = null, body = null } = {}) {
    super(message);
    this.name = "TeamProjectError";
    this.status = status;
    this.code = code;
    this.body = body;
  }
}

// Copy for the admin-facing approve/edit refusals (the backend's `message`
// wins when it sends one).
const CODE_COPY = {
  problem_statement_required:
    "Pick the exact project this team will build before approving.",
  invalid_problem_statement:
    "That project doesn't belong to the selected nonprofit.",
  already_approved: "This team was already approved (maybe by another admin).",
  invalid_rankings:
    "Your project ranking is out of date — a project may have been removed. Please review your choices.",
  invalid_github_username:
    "We couldn't find that GitHub username. Please check it and try again.",
  event_not_found: "We couldn't find this hackathon.",
  missing_fields: "Some required details are missing.",
  user_not_found:
    "We couldn't find your profile. Try logging out and back in, then create the team again.",
};

export function teamProjectErrorCopy(code) {
  return CODE_COPY[code] || null;
}

/** Turn an axios error into a TeamProjectError with a showable message. */
export function toTeamProjectError(err, fallback) {
  if (err instanceof TeamProjectError) return err;
  const status = err?.response?.status ?? null;
  const body = err?.response?.data ?? null;
  const code = typeof body?.error === "string" ? body.error : null;
  const message =
    (typeof body?.message === "string" && body.message) ||
    teamProjectErrorCopy(code) ||
    fallback;
  return new TeamProjectError(message, { status, code, body });
}

function authHeaders(token, orgId) {
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(orgId ? { "X-Org-Id": orgId } : {}),
  };
}

/** Raw project-options payload; throws (axios error) on non-2xx. */
export async function fetchTeamProjectOptions(
  eventId,
  { token, orgId, signal } = {},
  { client = axios } = {},
) {
  const response = await client.get(
    `${apiBase()}/api/team/${encodeURIComponent(eventId)}/project-options`,
    { headers: authHeaders(token, orgId), signal },
  );
  return response?.data || { nonprofits: [] };
}

/**
 * Create a team. Resolves the response body on success; throws a
 * TeamProjectError on a 4xx/5xx AND on a legacy HTTP-200 `{message}` without
 * `success` (older backends answered handled failures that way).
 */
export async function queueTeam(body, { token } = {}, { client = axios } = {}) {
  let response;
  try {
    response = await client.post(`${apiBase()}/api/team/queue`, body, {
      headers: authHeaders(token),
    });
  } catch (err) {
    throw toTeamProjectError(
      err,
      "An unexpected error occurred. Please try again.",
    );
  }
  const data = response?.data || {};
  if (!data.success) {
    throw new TeamProjectError(
      data.message || "An error occurred while creating the team.",
      { status: response?.status ?? 200, code: data.error || null, body: data },
    );
  }
  return data;
}

/** Admin approval. Same error contract as `queueTeam`. */
export async function approveTeamProject(
  { teamId, nonprofitId, problemStatementId },
  { token, orgId } = {},
  { client = axios } = {},
) {
  let response;
  try {
    response = await client.post(
      `${apiBase()}/api/team/approve`,
      { teamId, nonprofitId, problemStatementId },
      { headers: authHeaders(token, orgId) },
    );
  } catch (err) {
    throw toTeamProjectError(err, "Failed to approve team");
  }
  const data = response?.data || {};
  // The backend still answers some handled failures (e.g. GitHub org
  // problems) with HTTP 200 {success:false, message}.
  if (!data.success) {
    throw new TeamProjectError(data.message || "Failed to approve team", {
      status: response?.status ?? 200,
      code: data.error || null,
      body: data,
    });
  }
  return data;
}

/** The team's assigned project id from its doc (string or ref-ish shapes). */
export function teamProblemStatementId(team) {
  const list = Array.isArray(team?.problem_statements)
    ? team.problem_statements
    : [];
  const first = list[0];
  if (!first) return null;
  if (typeof first === "string") return first;
  return first.id || null;
}
