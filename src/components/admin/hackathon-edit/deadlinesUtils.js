/**
 * Pure helpers for the admin Deadlines section
 * (`/admin/hackathons/[event_id]?section=deadlines`). No fetching, no
 * window/document — safe to unit test in isolation.
 */

const newId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

/**
 * Validates a hackathon `deadlines` object for ordering problems.
 *
 * Returns `{ errors, warnings }`, each a map of field name (`submission`,
 * `late_submission_until`, `voting_opens`, `voting_closes`) to a message.
 * `errors` block Save; `warnings` are informational only. A field with no
 * value participates in no ordering check (an unset field is never wrong).
 */
export function validateDeadlines(deadlines) {
  const d = deadlines || {};
  const errors = {};
  const warnings = {};

  const toMs = (v) => {
    if (!v) return null;
    const ms = Date.parse(v);
    return Number.isNaN(ms) ? null : ms;
  };

  const submission = toMs(d.submission);
  const lateUntil = toMs(d.late_submission_until);
  const votingOpens = toMs(d.voting_opens);
  const votingCloses = toMs(d.voting_closes);

  if (submission != null && lateUntil != null && lateUntil < submission) {
    errors.late_submission_until =
      "The late-submission window must end at or after the submission deadline.";
  }
  if (
    votingOpens != null &&
    votingCloses != null &&
    votingCloses <= votingOpens
  ) {
    errors.voting_closes = "Voting must close after it opens.";
  }
  if (submission != null && votingOpens != null && votingOpens < submission) {
    warnings.voting_opens =
      "Voting opens before the submission deadline — hackers could vote before anyone has submitted.";
  }

  return { errors, warnings };
}

/**
 * Inserts or updates a countdown entry by (case-insensitive) name. An
 * existing entry keeps its `id`, taking the new `time`/`description`; a new
 * one is appended with a generated `id`. Used by "Add to countdown
 * timeline" so re-clicking after a deadline change updates the same
 * countdown rather than creating duplicates.
 */
export function upsertCountdownByName(countdowns, entry) {
  const list = Array.isArray(countdowns) ? countdowns : [];
  const targetName = (entry?.name || "").trim().toLowerCase();
  const idx = list.findIndex(
    (c) => (c?.name || "").trim().toLowerCase() === targetName,
  );

  if (idx === -1) {
    return [
      ...list,
      {
        id: entry.id || newId(),
        name: entry.name || "",
        description: entry.description || "",
        time: entry.time || "",
      },
    ];
  }

  const next = [...list];
  next[idx] = {
    ...next[idx],
    time: entry.time ?? next[idx].time,
    description: entry.description ?? next[idx].description,
  };
  return next;
}

/** `"24 hours before"` / `"1 hour before"` — used on the reminder buttons. */
export function hoursBeforeLabel(hours) {
  const n = Number(hours);
  if (!Number.isFinite(n)) return "";
  return n === 1 ? "1 hour before" : `${n} hours before`;
}
