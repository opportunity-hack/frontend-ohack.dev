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
  not_in_review: "This team isn't waiting for approval anymore.",
  nonprofit_not_found: "That nonprofit couldn't be found.",
  no_problem_statements: "That nonprofit has no projects to assign.",
  team_has_no_members: "This team has no members yet, so it can't be approved.",
  github_org_missing:
    "This hackathon has no GitHub organization set (Overview section).",
  github_repo_failed:
    "GitHub didn't create the team's repo. Please try again in a minute.",
  team_not_found: "This team couldn't be found.",
  not_approved_hacker:
    "Only approved hackers can create a team for this event.",
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

// Approving creates the GitHub repo, seeds ~10 files, mints AI keys and posts
// to Slack (~40s); creating a team makes a Slack channel and sends ~8
// invites. Both outlast the global 30s axios timeout, which used to show
// "Failed" for an approval/creation that finished a few seconds later.
export const APPROVE_TIMEOUT_MS = 120000;
export const QUEUE_TIMEOUT_MS = 90000;

export const APPROVE_TIMEOUT_COPY =
  "Approval is taking longer than usual and may still finish. Refreshing the team list…";
export const QUEUE_TIMEOUT_COPY =
  "Creating your team is taking longer than usual. It may still have gone through, so check your teams before trying again.";

/** True when axios gave up waiting (no response arrived). */
export function isRequestTimeout(err) {
  if (!err || err.response) return false;
  return err.code === "ECONNABORTED" || err.code === "ETIMEDOUT";
}

/**
 * Turn an axios error into a TeamProjectError with a showable message. A
 * client-side timeout becomes `code: "timeout"` — the server may still be
 * finishing, so callers refresh instead of reporting a failure.
 */
export function toTeamProjectError(err, fallback, timeoutMessage = null) {
  if (err instanceof TeamProjectError) return err;
  if (isRequestTimeout(err)) {
    return new TeamProjectError(timeoutMessage || fallback, { code: "timeout" });
  }
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
      timeout: QUEUE_TIMEOUT_MS,
    });
  } catch (err) {
    throw toTeamProjectError(
      err,
      "An unexpected error occurred. Please try again.",
      QUEUE_TIMEOUT_COPY,
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
      { headers: authHeaders(token, orgId), timeout: APPROVE_TIMEOUT_MS },
    );
  } catch (err) {
    throw toTeamProjectError(err, "Failed to approve team", APPROVE_TIMEOUT_COPY);
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

const PRE_APPROVAL_STATUSES = new Set(["IN_REVIEW", "APPROVING"]);

/**
 * Admin edit-dialog state right after "Approve Team" succeeds. The backend
 * sets `active: "True"` on approval; the dialog was opened on the IN_REVIEW
 * row (active false), so without `active: true` here a later "Save Changes"
 * sent `active: "False"` and deactivated the team (joins refused, "Inactive"
 * on the team page, hidden from the judging schedule).
 */
export function approvedTeamState(prev, projectId) {
  return {
    ...prev,
    status: "NONPROFIT_SELECTED",
    active: true,
    ...(projectId ? { problem_statements: [projectId] } : {}),
  };
}

/**
 * Body for the admin "Save project" button. Sends the dialog's nonprofit too:
 * the backend validates the project against the nonprofit in the same request,
 * so after an unsaved nonprofit switch a bare problem_statement_id 400'd.
 */
export function saveProjectPayload(teamData, projectId) {
  return {
    id: teamData.id,
    problem_statement_id: projectId,
    selected_nonprofit_id: teamData.selected_nonprofit_id,
  };
}

/**
 * Body for the admin "Save Changes" button (full team PATCH).
 * - `active` boolean → the backend's "True"/"False" strings.
 * - A null `project_submission_status` is omitted (the backend allowlist 400s
 *   on an explicit null).
 * - When the nonprofit changed on an approved team, the project goes with it
 *   (`problem_statement_id`, null clears) so the team never points at one
 *   nonprofit and another nonprofit's project.
 */
export function teamSavePayload(teamData, originalTeam, selectedProjectId) {
  const payload = {
    ...teamData,
    active: teamData.active ? "True" : "False",
  };
  if (payload.project_submission_status == null) {
    delete payload.project_submission_status;
  }
  const nonprofitChanged =
    (teamData.selected_nonprofit_id || null) !==
    (originalTeam?.selected_nonprofit_id || null);
  if (nonprofitChanged && !PRE_APPROVAL_STATUSES.has(teamData.status)) {
    payload.problem_statement_id = selectedProjectId || null;
  }
  return payload;
}
