/**
 * Centralized timezone utilities for hackathon events.
 *
 * Events are stored with an IANA timezone (e.g. "America/Phoenix").
 * These helpers let every component show times in the event timezone
 * **and** the viewer's local timezone when they differ.
 */

import { parseISO } from "date-fns";

/** Default timezone for events that don't have one stored yet. */
export const DEFAULT_EVENT_TIMEZONE = "America/Phoenix";

/**
 * Return the IANA timezone for an event, falling back to the default.
 */
export function getEventTimezone(eventData) {
  return eventData?.timezone || DEFAULT_EVENT_TIMEZONE;
}

/**
 * Return the viewer's local IANA timezone.
 * Falls back to DEFAULT_EVENT_TIMEZONE if the browser API is unavailable.
 */
export function getUserTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return DEFAULT_EVENT_TIMEZONE;
  }
}

/**
 * Get a short timezone abbreviation (e.g. "MST", "EST") for a given
 * date and IANA timezone.
 */
export function getTimezoneAbbreviation(date, timezone) {
  try {
    const d = date instanceof Date ? date : new Date(date);
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      timeZoneName: "short",
    }).formatToParts(d);
    const tzPart = parts.find((p) => p.type === "timeZoneName");
    return tzPart?.value || timezone;
  } catch {
    return timezone;
  }
}

/**
 * ISO formatter that bakes a chosen timezone offset into the saved string
 * (e.g. "2026-10-10T15:00:00-07:00"). Used by the Schedule and Deadlines
 * admin sections so times are saved unambiguously regardless of the
 * browser's own timezone.
 *
 * The offset is emitted with a colon (`-07:00`, not `-0700`) because the
 * backend parses these with Python's `datetime.fromisoformat`, which on
 * Python 3.9/3.10 rejects a colon-less offset (`ValueError: Invalid
 * isoformat string`) — a save would silently be dropped. Every frontend
 * consumer (native `Date`, `date-fns.parseISO`) parses both forms
 * identically, so the colon form is safe everywhere.
 */
export function toIsoWithTimezone(date, timezone) {
  if (!date) return "";
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return "";
  const pad = (n) => n.toString().padStart(2, "0");
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZoneName: "short",
  });
  const parts = formatter.formatToParts(d).reduce((acc, p) => {
    acc[p.type] = p.value;
    return acc;
  }, {});
  const tzPart = formatter
    .formatToParts(d)
    .find((p) => p.type === "timeZoneName");
  let offset = "+00:00";
  if (tzPart) {
    const m = tzPart.value.match(/([+-])(\d{2}):?(\d{2})/);
    if (m) offset = `${m[1]}${m[2]}:${m[3]}`;
    else {
      const tz = d.getTimezoneOffset();
      const sign = tz <= 0 ? "+" : "-";
      offset = `${sign}${pad(Math.abs(Math.floor(tz / 60)))}:${pad(Math.abs(tz % 60))}`;
    }
  }
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}${offset}`;
}

/**
 * Parses an ISO-ish string into a Date, tolerating both strict ISO 8601
 * strings (via `date-fns`'s `parseISO`) and looser inputs. Returns null
 * rather than an Invalid Date.
 */
export function safeParse(value) {
  if (!value) return null;
  try {
    const d = parseISO(value);
    if (!isNaN(d.getTime())) return d;
  } catch {
    // fall through to the looser Date constructor below
  }
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Format a date/time for dual-timezone display.
 *
 * Returns an object with pre-formatted strings so components can render
 * the event time, the user's local time, and whether they differ.
 *
 * @param {Date|string|number} dateInput – the instant to format
 * @param {string} eventTimezone – IANA timezone of the event
 * @returns {{ eventTime: string, userTime: string, isSameTimezone: boolean, eventAbbr: string, userAbbr: string }}
 */
export function formatDualTimezone(dateInput, eventTimezone) {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  const etz = eventTimezone || DEFAULT_EVENT_TIMEZONE;
  const utz = getUserTimezone();

  const fmt = (tz) =>
    date.toLocaleString("en-US", {
      timeZone: tz,
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

  const eventAbbr = getTimezoneAbbreviation(date, etz);
  const userAbbr = getTimezoneAbbreviation(date, utz);

  return {
    eventTime: fmt(etz),
    userTime: fmt(utz),
    isSameTimezone: etz === utz,
    eventAbbr,
    userAbbr,
  };
}
