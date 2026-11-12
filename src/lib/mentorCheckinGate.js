/**
 * Which panel /hack/[event_id]/mentor-checkin shows — ONE pure function so the
 * page can never flash "You are not registered" while auth or a fetch is
 * still settling (Nov 2026; see docs/plans/mentor-checkin-gate-and-reset-2026-11.md).
 *
 * Fetch statuses: "idle" | "loading" | "ready" | "error".
 */
import { applicationState } from "./mentorEvents";

export const MENTOR_GATES = [
  "loading",
  "logged_out",
  "event_error",
  "mentor_error",
  "not_applied",
  "pending",
  "not_selected",
  "ready",
];

/**
 * @param {object} p
 * @param {boolean} p.authLoading   PropelAuth still resolving the session
 * @param {boolean} p.isLoggedIn
 * @param {string}  p.eventStatus   public event fetch status
 * @param {string}  p.mentorStatus  mentor application fetch status for the
 *                                  identity CURRENTLY logged in
 * @param {object|null} p.mentor    the application (null = none)
 * @returns {string} one of MENTOR_GATES
 *
 * Rules: loading wins over everything; `not_applied` is only reachable once
 * the mentor fetch SETTLED SUCCESSFULLY with no application; a failed fetch
 * is `mentor_error` (retry), never the apply CTA. Approval follows the
 * ambiguous-isSelected rule from mentorEvents.applicationState: a bare
 * `isSelected: false` is only ever "awaiting confirmation"; "not selected"
 * needs the explicit review status `denied`.
 */
export function deriveMentorGate({
  authLoading,
  isLoggedIn,
  eventStatus,
  mentorStatus,
  mentor,
} = {}) {
  if (authLoading) return "loading";
  if (!isLoggedIn) {
    // The page needs the event (title/breadcrumb) for no state but the logged-in
    // ones, so a logged-out visitor sees the login panel right away.
    return "logged_out";
  }
  if (eventStatus === "error") return "event_error";
  if (eventStatus !== "ready") return "loading";
  if (mentorStatus === "error") return "mentor_error";
  if (mentorStatus !== "ready") return "loading";
  if (!mentor) return "not_applied";
  const state = applicationState(mentor);
  if (state === "approved") return "ready";
  if (state === "not_selected") return "not_selected";
  return "pending"; // pending + waitlisted
}

/**
 * The check-in window as the backend reports it on `/status`
 * (`{state: "upcoming"|"open"|"closed", opens_at, closes_at}`). An older
 * backend sends none ⇒ open (today's behaviour). A known `opens_at` /
 * `closes_at` that `now` has already crossed wins over a stale `state`, so an
 * open tab flips from "Check-in opens …" to the button without a reload.
 */
export function effectiveWindowState(window, now = Date.now()) {
  if (!window || typeof window !== "object") return "open";
  const nowMs = now instanceof Date ? now.getTime() : now;
  const opensMs = window.opens_at ? Date.parse(window.opens_at) : NaN;
  const closesMs = window.closes_at ? Date.parse(window.closes_at) : NaN;
  if (!Number.isNaN(closesMs) && nowMs > closesMs) return "closed";
  if (!Number.isNaN(opensMs)) return nowMs < opensMs ? "upcoming" : "open";
  if (window.state === "upcoming" || window.state === "closed") {
    return window.state;
  }
  return "open";
}

/** Backend check-in refusal codes the page settles on instead of toasting. */
export const CHECKIN_REFUSAL_CODES = [
  "not_approved",
  "checkin_not_open",
  "checkin_closed",
];

export function isCheckinRefusal(err) {
  const code = err?.response?.data?.error;
  return CHECKIN_REFUSAL_CODES.includes(code);
}

/** "in 3 days" / "in 5 hours" / "in 12 minutes" (null once passed). */
export function relativeOpening(targetIso, now = Date.now()) {
  const target = targetIso ? Date.parse(targetIso) : NaN;
  if (Number.isNaN(target)) return null;
  const nowMs = now instanceof Date ? now.getTime() : now;
  const ms = target - nowMs;
  if (ms <= 0) return null;
  const minutes = Math.ceil(ms / 60000);
  if (minutes < 60) return `in ${minutes} minute${minutes === 1 ? "" : "s"}`;
  const hours = Math.round(ms / 3600000);
  if (hours < 24) return `in ${hours} hour${hours === 1 ? "" : "s"}`;
  const days = Math.round(ms / 86400000);
  return `in ${days} day${days === 1 ? "" : "s"}`;
}
