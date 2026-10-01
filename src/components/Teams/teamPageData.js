// Shared data helpers + constants for the team detail page family:
//   /hack/[event_id]/team/[team_id]            (overview)
//   /hack/[event_id]/team/[team_id]/mentor     (Mentor support)
//   /hack/[event_id]/team/[team_id]/completion (Definition of Done)
//
// Keeps the SSR fetch + 404/network rules and the status-label logic in one
// place so the sub-pages don't copy-paste them.

import { TEAM_STATUS_OPTIONS } from "../../constants/teamStatus";

// Statuses (besides the winning set) that should surface the completion view.
export const COMPLETION_VISIBLE_STATUSES = new Set(["DEPLOYED", "NONPROFIT_SIGNOFF"]);
// Clears the 64px fixed navbar + breathing room for scroll anchoring.
export const SCROLL_OFFSET = 96;
export const OG_IMAGE = "https://i.imgur.com/xYrA32J.png";

// Converts a raw team status string to a human-readable label, never leaking
// the raw enum value to visitors.
export function statusLabel(status) {
  if (!status) return null;
  const found = TEAM_STATUS_OPTIONS.find((o) => o.value === status);
  if (found) return found.label;
  // Unknown value — title-case the raw enum as a safe fallback.
  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// Shared server-side fetch of team + event used by every page's getStaticProps.
// Throws on network errors AND on any non-404 team failure (429/5xx) so ISR
// keeps serving the last good version (safe: these pages use paths: [] +
// blocking, so it never runs at build time). Returns { notFound: true } only
// on a genuine 404 / empty team payload. A failed event fetch is non-fatal
// (eventData: null).
export async function fetchTeamAndEvent(event_id, team_id) {
  let teamRes, eventRes;
  try {
    [teamRes, eventRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/team/${team_id}`),
      fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathon/${event_id}`),
    ]);
  } catch (networkErr) {
    // Network failure — rethrow so ISR keeps serving the last good version.
    throw networkErr;
  }

  if (teamRes.status === 404) return { notFound: true };
  if (!teamRes.ok) {
    throw new Error(`Upstream ${teamRes.status} for team ${team_id}`);
  }

  const teamRaw = await teamRes.json();
  const eventData = eventRes.ok ? await eventRes.json() : null;
  const teamData = teamRaw?.team || teamRaw;
  if (!teamData) return { notFound: true };

  return { teamData, eventData };
}
