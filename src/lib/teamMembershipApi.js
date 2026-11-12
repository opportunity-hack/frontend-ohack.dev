/**
 * Join / leave a hackathon team — the ONE client for the legacy
 * `PATCH | DELETE /api/messages/team` routes, shared by the event page's
 * `TeamList` and the team page's "Team members" section.
 *
 * Backend gotcha (`services/teams_service.py::join_team / unjoin_team`):
 * handled failures come back as HTTP 200 with `{ text: "Error: …" }` (the
 * legacy `vars(Message)` shape — `text`, NOT `message`) — for example a login
 * with no `users` doc yet resolves to "Error: User not found". Checking
 * `response.ok` alone reports those as a success (the event page used to say
 * "Successfully joined the team" while nobody was added), so an
 * Error-prefixed answer is a failure here too.
 *
 * Server-side rules (Nov 2026): the backend now enforces the same join/leave
 * rules as `teamJoinBlockedReason` / `teamLeaveBlockedReason` below — TWIN:
 * backend `api/teams/membership_rules.py` (same checks, same order; change
 * both together). A refusal is a 4xx `{ error: <code>, message }`; the error
 * carries `code` + the blocked-reason copy as `message`, so callers render
 * the blocked state instead of an error toast (`isMembershipRefusal`).
 */
import { trackEvent, EventCategory } from "./ga";
import { isJoiningDisabled } from "../constants/teamStatus";

const apiBase = () => process.env.NEXT_PUBLIC_API_SERVER_URL;

export class TeamMembershipError extends Error {
  constructor(message, { status = null, body = null, code = null } = {}) {
    super(message);
    this.name = "TeamMembershipError";
    this.status = status;
    this.body = body;
    // A server rule refusal code (see TEAM_REFUSAL_COPY), else null.
    this.code = code;
  }
}

// Blocked-reason copy — shared by the client-side checks below and the
// server refusal codes, so a refusal reads exactly like the page's own
// blocked state.
const BLOCKED_COPY = {
  eventEnded: "This hackathon has ended, so its teams are closed.",
  paused:
    "Team changes are paused right now. Ask an organizer if you need to move.",
  inactive: "This team isn't active right now.",
  notJoinable: "This team isn't taking new members anymore.",
  notApproved:
    "Joining a team is for approved hackers. If you applied, your application may still be under review.",
  notFound: "This team no longer exists.",
};

/** Backend refusal code → participant copy (api/teams/membership_rules.py). */
export const TEAM_REFUSAL_COPY = {
  event_ended: BLOCKED_COPY.eventEnded,
  team_join_disabled: BLOCKED_COPY.paused,
  team_inactive: BLOCKED_COPY.inactive,
  team_not_joinable: BLOCKED_COPY.notJoinable,
  not_approved_hacker: BLOCKED_COPY.notApproved,
  team_not_found: BLOCKED_COPY.notFound,
};

/** True when `err` is a server rule refusal (render it as a blocked state). */
export const isMembershipRefusal = (err) =>
  Boolean(err && err.code && TEAM_REFUSAL_COPY[err.code]);

/** The answer text of a legacy join/leave response (`text`, or `message`). */
const answerText = (body) => {
  if (typeof body?.message === "string") return body.message;
  if (typeof body?.text === "string") return body.text;
  return "";
};

const ERROR_MESSAGE_RE = /^\s*error\b/i;

/** True for the backend's "Error: …" soft-failure messages. */
export const isErrorMessage = (message) =>
  typeof message === "string" && ERROR_MESSAGE_RE.test(message);

/** Turn a backend "Error: …" message into something a participant can act on. */
export function humanizeMembershipError(message, action) {
  const detail = String(message || "")
    .replace(ERROR_MESSAGE_RE, "")
    .replace(/^\s*:\s*/, "")
    .trim();
  if (/user not found/i.test(detail)) {
    return "We couldn't find your Opportunity Hack profile. Open your profile page once so it's created, then try again.";
  }
  if (/team not found/i.test(detail)) {
    return "This team no longer exists.";
  }
  const verb = action === "leave" ? "leave" : "join";
  return detail
    ? `Couldn't ${verb} the team: ${detail}`
    : `Couldn't ${verb} the team. Please try again.`;
}

async function mutateMembership({
  method,
  action,
  accessToken,
  teamId,
  eventId,
  source,
}) {
  if (!accessToken) {
    throw new TeamMembershipError("Log in to change your team.");
  }
  if (!teamId) {
    throw new TeamMembershipError("Missing team id.");
  }

  const response = await fetch(`${apiBase()}/api/messages/team`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ teamId }),
  });

  let body = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok) {
    const code = typeof body?.error === "string" ? body.error : null;
    if (code && TEAM_REFUSAL_COPY[code]) {
      throw new TeamMembershipError(TEAM_REFUSAL_COPY[code], {
        status: response.status,
        body,
        code,
      });
    }
    throw new TeamMembershipError(
      humanizeMembershipError(answerText(body), action),
      { status: response.status, body },
    );
  }

  const message = answerText(body);
  if (isErrorMessage(message)) {
    throw new TeamMembershipError(humanizeMembershipError(message, action), {
      status: response.status,
      body,
    });
  }

  trackEvent({
    action: action === "join" ? "team_join" : "team_leave",
    params: {
      event_category: EventCategory.ENGAGEMENT,
      event_label: source || "unknown",
      event_id: eventId || undefined,
      team_id: teamId,
    },
  });

  // "User was already in the team" / "User was not in the team" — the
  // desired state already held; callers may treat it as a quiet success.
  const noop = /already in the team|not in the team/i.test(message);
  return { message, noop };
}

/**
 * Add the caller to a team. Resolves `{ message, noop }`; rejects with a
 * `TeamMembershipError` carrying a participant-readable `message`.
 * `source` is the GA `event_label` ("event_page" | "team_page").
 */
export function joinTeam({ accessToken, teamId, eventId, source }) {
  return mutateMembership({
    method: "PATCH",
    action: "join",
    accessToken,
    teamId,
    eventId,
    source,
  });
}

/** Remove the caller from a team. Same contract as `joinTeam`. */
export function leaveTeam({ accessToken, teamId, eventId, source }) {
  return mutateMembership({
    method: "DELETE",
    action: "leave",
    accessToken,
    teamId,
    eventId,
    source,
  });
}

/**
 * Resolve the caller's hacker application for an event:
 * "approved" (isSelected === true) | "pending" | "none" (no application, a
 * mentor/judge — the endpoint is hacker-scoped — or any failure).
 */
export async function fetchHackerStatus({ accessToken, eventId }) {
  if (!accessToken || !eventId) return "none";
  try {
    const response = await fetch(
      `${apiBase()}/api/hacker/application/${eventId}`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    if (!response.ok) return "none";
    const data = await response.json();
    const app = data?.data ?? null;
    if (!app) return "none";
    return app.isSelected === true ? "approved" : "pending";
  } catch {
    return "none";
  }
}

/**
 * Why a non-member can't join right now, or null when joining is open.
 * Copy is shared by the event page cards and the team page so the two
 * never disagree. TWIN: backend api/teams/membership_rules.py
 * `team_membership_rules` enforces the same checks in the same order.
 */
export function teamJoinBlockedReason({
  eventEnded,
  teamJoinEnabled = true,
  isActive,
  status,
}) {
  if (eventEnded) return BLOCKED_COPY.eventEnded;
  if (teamJoinEnabled === false) return BLOCKED_COPY.paused;
  if (!isActive) return BLOCKED_COPY.inactive;
  if (isJoiningDisabled(status)) return BLOCKED_COPY.notJoinable;
  return null;
}

/** Why a member can't leave right now, or null. */
export function teamLeaveBlockedReason({ eventEnded, teamJoinEnabled = true }) {
  if (eventEnded) return BLOCKED_COPY.eventEnded;
  if (teamJoinEnabled === false) return BLOCKED_COPY.paused;
  return null;
}

/**
 * Does a `team.users[]` entry refer to this profile? Entries are either a
 * Firestore doc-id string or an enriched `{ id, user_id, … }` object; the
 * own-profile payload carries `id` (doc id) and `user_id` (OAuth id).
 */
export function userEntryMatchesProfile(entry, profile) {
  if (!entry || !profile) return false;
  const ids = [profile.id, profile.user_id].filter(Boolean);
  if (ids.length === 0) return false;
  if (typeof entry === "string") return ids.includes(entry);
  return Boolean(
    (entry.id && ids.includes(entry.id)) ||
      (entry.user_id && ids.includes(entry.user_id)),
  );
}

/** Optimistic add: returns a new users[] with the profile appended once. */
export function addProfileToUsers(users, profile) {
  const list = Array.isArray(users) ? users : [];
  if (!profile?.id) return list;
  if (list.some((u) => userEntryMatchesProfile(u, profile))) return list;
  return [
    ...list,
    {
      id: profile.id,
      user_id: profile.user_id || null,
      name: profile.name || null,
      nickname: profile.nickname || null,
      profile_image: profile.profile_image || null,
    },
  ];
}

/** Optimistic remove: returns a new users[] without this profile. */
export function removeProfileFromUsers(users, profile) {
  const list = Array.isArray(users) ? users : [];
  if (!profile) return list;
  return list.filter((u) => !userEntryMatchesProfile(u, profile));
}
