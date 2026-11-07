// Pure helpers for the "Your teams" card on /profile (components/Profile/
// MyTeamsCard.jsx). Date/shape math only — no React, no network.
import { eventPhase } from "./mentorEvents";
import { parseLocalDate } from "./dateUtils";

export const PHASE_ORDER = { live: 0, upcoming: 1, past: 2 };

export const PHASE_LABELS = {
  live: "Happening now",
  upcoming: "Coming up",
  past: "Past event",
};

/** `live` | `upcoming` | `past` for a team, from its attached event. */
export function teamPhase(team, now = new Date()) {
  return eventPhase(team?.event || {}, now);
}

const startMs = (event) => {
  const t = parseLocalDate(event?.start_date).getTime();
  return Number.isNaN(t) ? null : t;
};

/**
 * Order teams so the one that matters today comes first: a live event, then
 * the soonest upcoming one, then past events newest first. Teams whose event
 * has no dates sink to the end of their phase. Stable for ties.
 */
export function rankMyTeams(teams, now = new Date()) {
  const list = Array.isArray(teams) ? teams.filter(Boolean) : [];
  return list
    .map((team, index) => ({ team, index, phase: teamPhase(team, now) }))
    .sort((a, b) => {
      const phaseDiff = PHASE_ORDER[a.phase] - PHASE_ORDER[b.phase];
      if (phaseDiff !== 0) return phaseDiff;
      const as = startMs(a.team.event);
      const bs = startMs(b.team.event);
      if (as !== bs) {
        if (as === null) return 1;
        if (bs === null) return -1;
        // upcoming: soonest first; live/past: newest first
        return a.phase === "upcoming" ? as - bs : bs - as;
      }
      return a.index - b.index;
    })
    .map(({ team, phase }) => ({ ...team, phase }));
}

const isHackerRole = (role) => /hacker/i.test(String(role || ""));

/**
 * For someone with no team: the live or soonest upcoming hackathon they're
 * registered for as a hacker (from the profile's attendance-derived
 * `hackathons`), so the empty state can point at Find a team / Create one.
 * Null when there is none.
 */
export function currentHackerEvent(hackathons, now = new Date()) {
  const list = Array.isArray(hackathons) ? hackathons : [];
  const candidates = list
    .filter((h) => h?.event_id)
    .filter((h) => {
      const roles = Array.isArray(h.roles) ? h.roles : [h.role];
      return roles.some(isHackerRole);
    })
    .map((h) => ({ event: h, phase: eventPhase(h, now) }))
    .filter(({ phase }) => phase !== "past")
    .sort((a, b) => {
      const phaseDiff = PHASE_ORDER[a.phase] - PHASE_ORDER[b.phase];
      if (phaseDiff !== 0) return phaseDiff;
      return (startMs(a.event) ?? Infinity) - (startMs(b.event) ?? Infinity);
    });
  return candidates[0]?.event || null;
}
