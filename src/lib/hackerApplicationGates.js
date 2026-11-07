// Hacker application gates (Nov 2026) — the ONE place the hacker form and the
// admin Participants section compute the deadline, the lock and the access
// code, so the form and the admin caption can't drift.
//
// The deadline (3 days before kickoff, 8 PM event time) is a NUDGE by default:
// the form stays open until an admin locks it (`application_hacker_enabled ===
// false`; missing ⇒ open, the same reading as EventLinks) or opts into the old
// auto-close with `application_hacker_close_at_deadline`. The access code
// (`application_hacker_enabled_code`) unlocks both the lock and the
// "event ended" wall. `application_hacker_force_open` is retired — not read.

import Moment from "moment";
import "moment-timezone";
import { DEFAULT_EVENT_TIMEZONE } from "./timezoneUtils";

export const HACKER_DEADLINE_DAYS_BEFORE = 3;
export const HACKER_DEADLINE_HOUR = 20; // 8 PM, event timezone

/** Moment (event tz) of the hacker application deadline, or null. */
export function hackerApplicationDeadline(startDate, timezone) {
  if (!startDate) return null;
  const start = Moment.tz(startDate, timezone || DEFAULT_EVENT_TIMEZONE);
  if (!start.isValid()) return null;
  return start
    .clone()
    .subtract(HACKER_DEADLINE_DAYS_BEFORE, "days")
    .hour(HACKER_DEADLINE_HOUR)
    .minute(0)
    .second(0)
    .millisecond(0);
}

const cleanCode = (code) =>
  typeof code === "string" && code.trim() ? code.trim() : null;

const cleanCapacity = (cap) =>
  Number.isInteger(cap) && cap > 0 ? cap : null;

/**
 * @returns {{
 *   applicationDeadline: import("moment").Moment|null,
 *   deadlinePassed: boolean, isEventPast: boolean,
 *   closedByDeadline: boolean, isLocked: boolean,
 *   passcode: string|null, hackerCapacity: number|null, autoApproveOn: boolean,
 * }}
 */
export function deriveHackerApplicationGates({
  constraints,
  startDate,
  endDate,
  timezone,
  now,
} = {}) {
  const tz = timezone || DEFAULT_EVENT_TIMEZONE;
  const c = constraints || {};
  const current = now ? Moment.tz(now, tz) : Moment().tz(tz);
  const applicationDeadline = hackerApplicationDeadline(startDate, tz);
  const end = endDate ? Moment.tz(endDate, tz) : null;

  const deadlinePassed = Boolean(
    applicationDeadline && current.isAfter(applicationDeadline),
  );
  const isEventPast = Boolean(
    end && end.isValid() && end.clone().add(1, "day").isBefore(current),
  );
  const closedByDeadline =
    c.application_hacker_close_at_deadline === true && deadlinePassed;

  return {
    applicationDeadline,
    deadlinePassed,
    isEventPast,
    closedByDeadline,
    isLocked: c.application_hacker_enabled === false || closedByDeadline,
    passcode: cleanCode(c.application_hacker_enabled_code),
    hackerCapacity: cleanCapacity(c.hacker_capacity),
    autoApproveOn: c.hacker_auto_approve === true,
  };
}

/**
 * Read the hacker submit/update response. The backend wraps the saved doc in
 * `data` ({success, message, data}); older code read the top level, always
 * missed the id and fell back to the login id (wrong check-in QR).
 *
 * @returns {{ volunteerId: string|null, isSelected: boolean,
 *   rosterOutcome: "approved"|"waitlisted"|null, autoApproved: boolean }}
 */
export function parseHackerSubmitResponse(responseData, fallbackId = null) {
  const saved = responseData?.data ?? responseData ?? {};
  const isSelected = Boolean(saved.isSelected);
  const waitlisted = String(saved.status || "").toLowerCase() === "waitlisted";
  return {
    volunteerId: saved.id || saved.volunteer_id || fallbackId || null,
    isSelected,
    rosterOutcome: isSelected ? "approved" : waitlisted ? "waitlisted" : null,
    autoApproved: saved.auto_approved === true,
  };
}
