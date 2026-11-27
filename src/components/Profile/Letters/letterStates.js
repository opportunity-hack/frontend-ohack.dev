// Pure helpers for the participation-letter UI on /profile.
import { eventCertificates } from "../../admin/volunteer/certificateStatus";
// Reason codes are twinned with backend api/letters/letter_facts.py
// (REASON_CODES) — add a code there and here together.

export const LETTER_STATES = Object.freeze({
  NOT_ELIGIBLE: "not_eligible",
  ELIGIBLE: "eligible",
  ISSUED: "issued",
  REVOKED: "revoked",
});

export const REASON_TEXT = Object.freeze({
  event_not_found: "We couldn't find this event.",
  event_not_ended: "Letters are available once the event has ended.",
  before_start_date:
    "Self-serve letters start with events ending on or after November 14, 2026. Contact us for earlier events.",
  not_selected: "Your application for this role wasn't approved for this event.",
  no_scores: "We don't have any submitted judging scores from you for this event.",
  no_checkin: "We don't have a check-in for you at this event.",
  no_active_team: "We couldn't find you on an active team at this event.",
  name_missing: "Add your name to your profile first.",
});

export const FALLBACK_REASON_TEXT = "You don't qualify for a letter for this event.";

export function reasonText(code) {
  return REASON_TEXT[code] || FALLBACK_REASON_TEXT;
}

export const ROLE_LABELS = Object.freeze({
  judge: "Judge",
  mentor: "Mentor",
  volunteer: "Volunteer",
  hacker: "Hacker",
});

export function roleLabel(role) {
  return ROLE_LABELS[role] || role || "";
}

/** One of LETTER_STATES for a row from GET /api/letters/mine. */
export function letterRowState(row) {
  if (!row) return LETTER_STATES.NOT_ELIGIBLE;
  if (row.letter_id && row.status === "revoked") return LETTER_STATES.REVOKED;
  if (row.letter_id && row.status === "issued") return LETTER_STATES.ISSUED;
  if (row.eligible) return LETTER_STATES.ELIGIBLE;
  return LETTER_STATES.NOT_ELIGIBLE;
}

/** {event_id: [rows]} so each hackathon card can find its letters. */
export function rowsByEvent(rows) {
  const out = {};
  for (const row of rows || []) {
    if (!row?.event_id) continue;
    (out[row.event_id] = out[row.event_id] || []).push(row);
  }
  return out;
}

/** Letter rows whose event is not in the attendance list (e.g. a judge
 * with scores but no check-in), grouped by event, newest first. */
export function rowsMissingFrom(rows, hackathons) {
  const shown = new Set((hackathons || []).map((h) => h?.event_id).filter(Boolean));
  const grouped = rowsByEvent((rows || []).filter((r) => !shown.has(r.event_id)));
  return Object.entries(grouped)
    .map(([eventId, eventRows]) => ({
      event_id: eventId,
      event_title: eventRows[0]?.event_title || eventId,
      event_end_date: eventRows[0]?.event_end_date || "",
      rows: eventRows,
    }))
    .sort((a, b) => String(b.event_end_date).localeCompare(String(a.event_end_date)));
}

export function verifyUrl(letterId, origin) {
  const host =
    origin || (typeof window !== "undefined" ? window.location.origin : "https://www.ohack.dev");
  return `${host}/letters/verify/${letterId}`;
}

export const CERTIFICATE_CDN = "https://cdn.ohack.dev/certificates";

/** URL of the person's mentor/judge certificate for this row's event, or
 * null. Certificates live in the user doc's `history.certificates` (strings
 * for very old entries, `{filename, reasons, event_id, timestamp}` since);
 * matching is the admin table's `eventCertificates` (event_id, else a
 * window after the event start). Hackers and volunteers get none. */
export function certificateUrlForRow(row, certificates, eventStartDate) {
  if (!row || (row.role !== "mentor" && row.role !== "judge")) return null;
  const matches = eventCertificates(certificates, {
    type: `${row.role}s`,
    eventId: row.event_id,
    eventStartDate,
  });
  const latest = matches
    .filter((c) => c && c.filename)
    .sort((a, b) => String(b.timestamp || "").localeCompare(String(a.timestamp || "")))[0];
  return latest ? `${CERTIFICATE_CDN}/${latest.filename}` : null;
}
