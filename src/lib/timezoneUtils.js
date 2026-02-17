/**
 * Centralized timezone utilities for hackathon events.
 *
 * Events are stored with an IANA timezone (e.g. "America/Phoenix").
 * These helpers let every component show times in the event timezone
 * **and** the viewer's local timezone when they differ.
 */

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
