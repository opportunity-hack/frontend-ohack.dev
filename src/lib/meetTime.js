// Pure helpers for meeting polls: timezone-aware labels and tallies.
// Slots are stored as UTC instants; everything here renders them in a named
// IANA zone, so the same poll reads correctly for every viewer.

export const ANSWERS = ["yes", "maybe", "no"];

export const ANSWER_LABELS = {
  yes: "Yes",
  maybe: "If need be",
  no: "No",
};

export const ANSWER_SYMBOLS = { yes: "✓", maybe: "(✓)", no: "✕" };

export const nextAnswer = (answer) =>
  ANSWERS[(ANSWERS.indexOf(answer || "no") + 1) % ANSWERS.length];

export const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120];

const FALLBACK_ZONES = [
  "America/Los_Angeles",
  "America/Phoenix",
  "America/Denver",
  "America/Chicago",
  "America/New_York",
  "America/Sao_Paulo",
  "Europe/London",
  "Europe/Berlin",
  "Africa/Lagos",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
  "UTC",
];

export function browserTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch (e) {
    return "UTC";
  }
}

export function timeZoneOptions(current) {
  let zones = FALLBACK_ZONES;
  try {
    if (typeof Intl.supportedValuesOf === "function") {
      zones = Intl.supportedValuesOf("timeZone");
    }
  } catch (e) {
    zones = FALLBACK_ZONES;
  }
  return current && !zones.includes(current) ? [current, ...zones] : zones;
}

const fmt = (timeZone, options) => {
  try {
    return new Intl.DateTimeFormat("en-US", { timeZone, ...options });
  } catch (e) {
    return new Intl.DateTimeFormat("en-US", { timeZone: "UTC", ...options });
  }
};

/** { weekday: "Tue", date: "Dec 1", time: "10:00 – 10:30 AM", dayKey } */
export function slotParts(startIso, durationMinutes, timeZone) {
  const start = new Date(startIso);
  const end = new Date(start.getTime() + (durationMinutes || 30) * 60000);
  const time = fmt(timeZone, { hour: "numeric", minute: "2-digit" });
  return {
    weekday: fmt(timeZone, { weekday: "short" }).format(start),
    date: fmt(timeZone, { month: "short", day: "numeric" }).format(start),
    time: `${time.format(start)} – ${time.format(end)}`,
    dayKey: fmt(timeZone, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(start),
  };
}

/** "Tuesday, December 1, 2026, 10:00 – 10:30 AM MST" */
export function slotLongLabel(startIso, durationMinutes, timeZone) {
  const start = new Date(startIso);
  const end = new Date(start.getTime() + (durationMinutes || 30) * 60000);
  const day = fmt(timeZone, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(start);
  const from = fmt(timeZone, { hour: "numeric", minute: "2-digit" }).format(
    start,
  );
  const to = fmt(timeZone, {
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(end);
  return `${day}, ${from} – ${to}`;
}

/** Per-slot counts over a list of votes: { [slotId]: {yes, maybe, no} }. */
export function tallyVotes(slots, votes) {
  const tally = {};
  for (const slot of slots || []) {
    tally[slot.id] = { yes: 0, maybe: 0, no: 0 };
  }
  for (const vote of votes || []) {
    for (const slot of slots || []) {
      const answer = vote?.choices?.[slot.id];
      tally[slot.id][ANSWERS.includes(answer) ? answer : "no"] += 1;
    }
  }
  return tally;
}

/**
 * Slot ids that work for the most people: most yes+maybe, ties broken by
 * more plain yes. Empty when nobody has said yes or maybe to anything.
 */
export function bestSlotIds(slots, tally) {
  let best = [];
  let bestScore = [0, 0];
  for (const slot of slots || []) {
    const t = tally[slot.id] || { yes: 0, maybe: 0 };
    const score = [t.yes + t.maybe, t.yes];
    if (score[0] === 0) continue;
    const cmp = score[0] - bestScore[0] || score[1] - bestScore[1];
    if (cmp > 0) {
      best = [slot.id];
      bestScore = score;
    } else if (cmp === 0) {
      best.push(slot.id);
    }
  }
  return best;
}

const pad = (n) => String(n).padStart(2, "0");

/** UTC instant -> value for <input type="datetime-local"> in browser time. */
export function toLocalInputValue(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** <input type="datetime-local"> value (browser time) -> UTC ISO, or null. */
export function fromLocalInputValue(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export const pollUrl = (code) =>
  `${typeof window !== "undefined" ? window.location.origin : "https://www.ohack.dev"}/meet?code=${encodeURIComponent(code)}`;

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
export const isEmail = (value) => EMAIL_RE.test(String(value || "").trim());

/** "a@x.org, b@y.org\nc@z.org" -> { emails: [...], invalid: [...] } */
export function parseEmailList(text) {
  const emails = [];
  const invalid = [];
  for (const raw of String(text || "").split(/[\s,;]+/)) {
    const item = raw.trim().toLowerCase();
    if (!item) continue;
    if (!isEmail(item)) invalid.push(item);
    else if (!emails.includes(item)) emails.push(item);
  }
  return { emails, invalid };
}
