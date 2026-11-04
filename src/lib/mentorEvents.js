// Pure helpers for the /mentor dashboard (src/pages/mentor/index.js).
// Everything here is date/shape math with no React or network so the page
// test and the lib test can cover the branching without a backend.
import { parseLocalDate } from "./dateUtils";

export const PHASES = ["live", "upcoming", "past"];

const startMs = (event) => {
  const t = parseLocalDate(event?.start_date).getTime();
  return Number.isNaN(t) ? Number.POSITIVE_INFINITY : t;
};

/** End of the event's last calendar day (local), or null when there is no end date. */
const endExclusive = (event) => {
  const end = parseLocalDate(event?.end_date);
  if (Number.isNaN(end.getTime())) return null;
  return new Date(end.getFullYear(), end.getMonth(), end.getDate() + 1);
};

/**
 * `live` | `upcoming` | `past`. The end date is inclusive (an event that ends
 * "2026-10-12" is live until midnight at the end of Oct 12). Events with no
 * dates at all are treated as upcoming so they never disappear into "past".
 */
export function eventPhase(event, now = new Date()) {
  const start = parseLocalDate(event?.start_date);
  const hasStart = !Number.isNaN(start.getTime());
  const endEx = endExclusive(event);
  const t = now.getTime();
  if (endEx && t >= endEx.getTime()) return "past";
  if (hasStart && t < start.getTime()) return "upcoming";
  if (hasStart) return "live";
  return "upcoming";
}

/**
 * `approved` | `pending` | `waitlisted` | `not_selected`.
 *
 * `isSelected === false` on its own is ambiguous (not reviewed yet vs. not
 * picked) — see the "Hacker isSelected gating UX" rule — so it only ever
 * renders as "awaiting confirmation". The explicit review `status` an admin
 * set (`denied` / `waitlisted`) is unambiguous and is the only thing that
 * produces the other two states.
 */
export function applicationState(application) {
  if (!application) return "pending";
  if (application.isSelected) return "approved";
  const status = String(application.status || "")
    .trim()
    .toLowerCase();
  if (status === "denied") return "not_selected";
  if (status === "waitlisted") return "waitlisted";
  return "pending";
}

export const APPLICATION_STATE_LABELS = {
  approved: "Approved",
  pending: "Awaiting confirmation",
  waitlisted: "Waitlisted",
  not_selected: "Not selected",
};

/**
 * `in_person` | `virtual` | null from the mentor form's own convention
 * ("Yes!" / "No, I'll be virtual") with the boolean `isInPerson` mirror as a
 * fallback.
 */
export function attendanceMode(application) {
  if (!application) return null;
  const raw = application.inPerson;
  if (typeof raw === "string") {
    const v = raw.trim().toLowerCase();
    if (!v) return null;
    return v.startsWith("yes") ? "in_person" : "virtual";
  }
  if (typeof raw === "boolean") return raw ? "in_person" : "virtual";
  if (typeof application.isInPerson === "boolean") {
    return application.isInPerson ? "in_person" : "virtual";
  }
  return null;
}

// Same slot pattern the mentor check-in page and MentorAvailability use;
// falls back to a comma split for older free-text values.
const SLOT_PATTERN = /([A-Za-z]+\s+[A-Za-z]+\s+\d+:\s+[^,]+)/g;

/** The mentor's availability string as a deduped list of shift labels. */
export function splitAvailability(text) {
  if (Array.isArray(text)) {
    return dedupe(text.map((s) => String(s ?? "").trim()));
  }
  if (typeof text !== "string" || !text.trim()) return [];
  const matches = text.match(SLOT_PATTERN);
  const parts = matches && matches.length ? matches : text.split(",");
  return dedupe(parts.map((p) => p.trim()));
}

function dedupe(parts) {
  const seen = new Set();
  return parts.filter((p) => {
    if (!p || seen.has(p)) return false;
    seen.add(p);
    return true;
  });
}

/**
 * Group the mentor's events by phase. Live and upcoming sort soonest-first,
 * past sorts most-recent-first.
 */
export function partitionMentorEvents(events, now = new Date()) {
  const groups = { live: [], upcoming: [], past: [] };
  (events || []).forEach((e) => groups[eventPhase(e, now)].push(e));
  const soonest = (a, b) => startMs(a) - startMs(b);
  groups.live.sort(soonest);
  groups.upcoming.sort(soonest);
  groups.past.sort((a, b) => startMs(b) - startMs(a));
  return groups;
}

/**
 * Current/upcoming hackathons (from useHackathonEvents("current")) the mentor
 * has NOT applied to yet — the "also happening" apply rows.
 */
export function upcomingNotApplied(hackathons, mentorEvents, now = new Date()) {
  const applied = new Set((mentorEvents || []).map((e) => e?.event_id));
  return (hackathons || [])
    .filter(
      (h) =>
        h?.event_id &&
        !applied.has(h.event_id) &&
        eventPhase(h, now) !== "past",
    )
    .sort((a, b) => startMs(a) - startMs(b));
}

const MD = { month: "short", day: "numeric" };
const MDY = { ...MD, year: "numeric" };

/** "Oct 11 – 12, 2026" style range; degrades to whichever date exists. */
export function formatEventDates(start, end) {
  const s = parseLocalDate(start);
  const e = parseLocalDate(end);
  const okS = !Number.isNaN(s.getTime());
  const okE = !Number.isNaN(e.getTime());
  if (okS && okE) {
    const sameDay =
      s.getFullYear() === e.getFullYear() &&
      s.getMonth() === e.getMonth() &&
      s.getDate() === e.getDate();
    if (sameDay) return s.toLocaleDateString("en-US", MDY);
    if (s.getFullYear() === e.getFullYear()) {
      const sameMonth = s.getMonth() === e.getMonth();
      const endPart = sameMonth
        ? `${e.getDate()}, ${e.getFullYear()}`
        : e.toLocaleDateString("en-US", MDY);
      return `${s.toLocaleDateString("en-US", MD)} – ${endPart}`;
    }
    return `${s.toLocaleDateString("en-US", MDY)} – ${e.toLocaleDateString("en-US", MDY)}`;
  }
  if (okS) return s.toLocaleDateString("en-US", MDY);
  if (okE) return e.toLocaleDateString("en-US", MDY);
  return "";
}
