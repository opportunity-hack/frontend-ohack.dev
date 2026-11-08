/** The event_id with the latest start_date (null when none). Used to send a
 * check-in helper straight to "the" current hackathon. */
export const newestEventId = (hackathons) =>
  [...(Array.isArray(hackathons) ? hackathons : [])]
    .filter((h) => h?.event_id)
    .sort(
      (a, b) => new Date(b.start_date || 0) - new Date(a.start_date || 0),
    )[0]?.event_id || null;
