// Pure helpers for the printable event welcome guide
// (/hack/[event_id]/print — see pages/hack/[event_id]/print.js).
//
// Everything here is side-effect free so the page can call it from
// getServerSideProps and the browser alike, and so it stays unit-testable.

import { format } from "date-fns";
import { parseLocalDate } from "../../lib/dateUtils";

export const SITE_URL = "https://www.ohack.dev";
export const DEFAULT_EVENT_TIMEZONE = "America/Phoenix";

// Section order = print order. `type` maps to the public volunteer endpoint.
export const GUIDE_SECTIONS = [
  { id: "schedule", label: "Schedule" },
  { id: "mentors", label: "Mentors", type: "mentor" },
  { id: "judges", label: "Judges", type: "judge" },
  { id: "volunteers", label: "Volunteers", type: "volunteer" },
];

export const PERSON_TYPES = GUIDE_SECTIONS.filter((s) => s.type).map(
  (s) => s.type,
);

const SECTION_IDS = GUIDE_SECTIONS.map((s) => s.id);

/**
 * `?sections=schedule,mentors` → ["schedule","mentors"] in canonical order.
 * Unknown ids are dropped; a missing/empty/all-invalid value means "all".
 */
export function parseSections(raw) {
  const value = Array.isArray(raw) ? raw.join(",") : raw;
  if (typeof value !== "string" || !value.trim()) return [...SECTION_IDS];
  const wanted = new Set(
    value
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
  );
  const picked = SECTION_IDS.filter((id) => wanted.has(id));
  return picked.length ? picked : [...SECTION_IDS];
}

/** Inverse of parseSections. Returns "" when every section is selected. */
export function serializeSections(ids) {
  const set = new Set(ids);
  const picked = SECTION_IDS.filter((id) => set.has(id));
  return picked.length === SECTION_IDS.length ? "" : picked.join(",");
}

const asString = (value) =>
  value == null ? "" : Array.isArray(value) ? value.join(", ") : String(value);

const usablePhotoUrl = (url) => {
  if (typeof url !== "string") return "";
  const trimmed = url.trim();
  if (!/^https?:\/\//i.test(trimmed)) return "";
  // Google Drive share links don't serve as <img> sources (VolunteerList skips them too)
  if (trimmed.includes("drive.google.com")) return "";
  return trimmed;
};

const inPersonFlag = (v) => {
  if (v.isInPerson === true) return true;
  if (v.isInPerson === false) return false;
  if (typeof v.inPerson === "string") return /^yes/i.test(v.inPerson.trim());
  return null;
};

/**
 * Lean, print-safe projection of a public volunteer record. Only fields the
 * guide renders are kept (the public endpoint already strips PII, but the
 * page payload should stay small).
 */
export function pickPerson(v) {
  if (!v || typeof v !== "object") return null;
  return {
    id: v.id || null,
    name: asString(v.name).trim(),
    pronouns: asString(v.pronouns).trim(),
    org: asString(v.company || v.companyName || v.schoolOrganization).trim(),
    title: asString(v.title).trim(),
    focus: asString(
      v.expertise || v.background || v.volunteerType || v.otherVolunteerType || v.skills,
    ).trim(),
    photoUrl: usablePhotoUrl(v.photoUrl),
    inPerson: inPersonFlag(v),
    availableDays: Array.isArray(v.availableDays)
      ? v.availableDays.filter((d) => typeof d === "string" && d.trim())
      : [],
  };
}

/** Lean projection of the hackathon doc for the guide. Never emits undefined. */
export function pickEvent(raw, fallbackEventId) {
  const countdowns = Array.isArray(raw?.countdowns)
    ? raw.countdowns
        .filter((c) => c && c.time && !Number.isNaN(new Date(c.time).getTime()))
        .map((c) => ({
          name: asString(c.name).trim(),
          time: c.time,
          description: asString(c.description),
        }))
    : [];
  return {
    id: raw?.id || null,
    event_id: raw?.event_id || fallbackEventId || null,
    title: asString(raw?.title).trim() || `Opportunity Hack ${fallbackEventId || ""}`.trim(),
    description: asString(raw?.description),
    location: asString(raw?.location).trim(),
    start_date: raw?.start_date || null,
    end_date: raw?.end_date || null,
    timezone: raw?.timezone || null,
    countdowns,
  };
}

/**
 * availableDays entries look like "Saturday, Oct 11-Morning" (mentors) or
 * "Saturday, Oct 11-Lunch-Food Service" (volunteers). Group by day.
 * → [{ day: "Saturday, Oct 11", details: ["Morning", "Lunch · Food Service"] }]
 */
export function groupAvailability(availableDays) {
  const groups = [];
  const byDay = new Map();
  (availableDays || []).forEach((entry) => {
    if (typeof entry !== "string") return;
    const parts = entry.split("-").map((p) => p.trim()).filter(Boolean);
    if (!parts.length) return;
    const day = parts[0];
    const detail = parts.slice(1).join(" · ");
    if (!byDay.has(day)) {
      byDay.set(day, []);
      groups.push({ day, details: byDay.get(day) });
    }
    if (detail && !byDay.get(day).includes(detail)) byDay.get(day).push(detail);
  });
  return groups;
}

const safeFormatter = (options) => {
  try {
    return new Intl.DateTimeFormat("en-US", options);
  } catch (e) {
    // Unknown timeZone → fall back to the runtime's local zone
    const { timeZone: _ignored, ...rest } = options;
    return new Intl.DateTimeFormat("en-US", rest);
  }
};

/** "YYYY-MM-DD" for a Date as seen in `timeZone`. */
export function dayKeyInTz(date, timeZone) {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  const parts = safeFormatter({
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);
  const get = (type) => parts.find((p) => p.type === type)?.value || "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

// Event docs are sometimes off by a day (e.g. start_date = the Sunday of a
// Sat–Sun event), so the "event days" window is padded: a couple of days
// before start and one after end. Pre-event milestones weeks earlier still
// fall outside it.
export const EVENT_WINDOW_PAD_BEFORE_DAYS = 2;
export const EVENT_WINDOW_PAD_AFTER_DAYS = 1;

const addDays = (date, days) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

/**
 * Set of "YYYY-MM-DD" keys from start_date through end_date (inclusive),
 * optionally padded on either side. Capped at ~3 weeks.
 */
export function eventDayKeys(
  startDate,
  endDate,
  timeZone,
  { padBefore = 0, padAfter = 0 } = {},
) {
  const keyOf = (value) =>
    typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
      ? value
      : dayKeyInTz(value, timeZone);
  const startKey = keyOf(startDate);
  const endKey = keyOf(endDate) || startKey;
  const keys = new Set();
  if (!startKey) return keys;
  let cursor = addDays(parseLocalDate(startKey), -padBefore);
  const last = addDays(parseLocalDate(endKey), padAfter);
  for (let i = 0; i < 21 && cursor <= last; i += 1) {
    keys.add(format(cursor, "yyyy-MM-dd"));
    cursor = addDays(cursor, 1);
  }
  if (!keys.size) keys.add(startKey);
  return keys;
}

/**
 * Sort countdowns by time and group them by calendar day in the event's
 * timezone. With `eventDaysOnly`, pre/post-event milestones (e.g. "Nonprofits
 * selected" weeks earlier) are dropped — the window is the padded start..end
 * range (see EVENT_WINDOW_PAD_*). If that would leave nothing, everything is
 * returned and `filtered` is false.
 */
export function groupCountdownsByDay(
  countdowns,
  timeZone,
  { eventDaysOnly = false, startDate = null, endDate = null } = {},
) {
  const sorted = (countdowns || [])
    .filter((c) => c && c.time && !Number.isNaN(new Date(c.time).getTime()))
    .slice()
    .sort((a, b) => new Date(a.time) - new Date(b.time));

  let items = sorted;
  let filtered = false;
  if (eventDaysOnly && startDate) {
    const allowed = eventDayKeys(startDate, endDate, timeZone, {
      padBefore: EVENT_WINDOW_PAD_BEFORE_DAYS,
      padAfter: EVENT_WINDOW_PAD_AFTER_DAYS,
    });
    const inWindow = sorted.filter((c) => allowed.has(dayKeyInTz(c.time, timeZone)));
    if (inWindow.length) {
      items = inWindow;
      filtered = true;
    }
  }

  const dayFmt = safeFormatter({
    timeZone,
    weekday: "long",
    month: "short",
    day: "numeric",
  });
  const timeFmt = safeFormatter({ timeZone, hour: "numeric", minute: "2-digit" });

  const groups = [];
  const byKey = new Map();
  items.forEach((c) => {
    const date = new Date(c.time);
    const key = dayKeyInTz(date, timeZone);
    if (!byKey.has(key)) {
      byKey.set(key, { key, label: dayFmt.format(date), items: [] });
      groups.push(byKey.get(key));
    }
    byKey.get(key).items.push({
      name: c.name,
      description: c.description,
      timeLabel: timeFmt.format(date),
    });
  });
  return { groups, filtered, total: sorted.length };
}

/** Short zone label like "MST" for the header ("All times MST"). */
export function timeZoneLabel(timeZone, at = new Date()) {
  const parts = safeFormatter({ timeZone, timeZoneName: "short" }).formatToParts(at);
  return parts.find((p) => p.type === "timeZoneName")?.value || timeZone || "";
}

/** "Oct 12–13, 2025" / "Oct 30 – Nov 2, 2025" / "Oct 12, 2025". */
export function formatEventDates(startDate, endDate) {
  const start = parseLocalDate(startDate);
  if (Number.isNaN(start.getTime())) return "";
  const end = endDate ? parseLocalDate(endDate) : start;
  if (Number.isNaN(end.getTime()) || format(start, "yyyy-MM-dd") === format(end, "yyyy-MM-dd")) {
    return format(start, "MMM d, yyyy");
  }
  if (start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth()) {
    return `${format(start, "MMM d")}–${format(end, "d, yyyy")}`;
  }
  if (start.getFullYear() === end.getFullYear()) {
    return `${format(start, "MMM d")} – ${format(end, "MMM d, yyyy")}`;
  }
  return `${format(start, "MMM d, yyyy")} – ${format(end, "MMM d, yyyy")}`;
}

export function initialsOf(name) {
  return (name || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}
