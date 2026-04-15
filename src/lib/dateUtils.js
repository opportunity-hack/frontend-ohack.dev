/**
 * Parse a date string as local time, avoiding the JavaScript UTC bug.
 *
 * JavaScript's `new Date("YYYY-MM-DD")` interprets date-only ISO strings as
 * UTC midnight. In any timezone west of UTC this causes the displayed date to
 * shift backward by one day (e.g. "2026-02-27" shows as Feb 26 in MST).
 *
 * This helper detects date-only strings and constructs the Date in local time
 * so the calendar date stays correct regardless of timezone. All other formats
 * (timestamps, full ISO strings, epoch numbers, etc.) fall through to the
 * native Date constructor.
 */
export function parseLocalDate(date) {
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [year, month, day] = date.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
  return new Date(date);
}

/**
 * Check if a hackathon has ended by comparing "now" to end-of-day in the
 * hackathon's own timezone so viewers in other timezones don't see a
 * premature "Hackathon Ended" badge.
 */
export function isHackathonExpired(endDate, eventTimezone) {
  if (!endDate) return false;
  const tz = eventTimezone || 'America/Phoenix';
  const nowInTz = new Date(new Date().toLocaleString('en-US', { timeZone: tz }));
  const [year, month, day] = endDate.split('-').map(Number);
  const endInTz = new Date(year, month - 1, day, 23, 59, 59, 999);
  return nowInTz > endInTz;
}
