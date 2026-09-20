/**
 * Pure state helpers for the Hackers' Choice peer vote, shared by
 * `PeerVoteCTA` (event page + dashboard) and the vote page itself.
 *
 * `deriveVoteWindow` mirrors the backend's own default window computation
 * (`api/peer_votes/peer_votes_service.py::compute_voting_window`) closely
 * enough to decide CTA visibility client-side without a network call, but
 * it is deliberately conservative: `PeerVoteCTA` only receives
 * `{ deadlines, constraints }` (no event/timezone), so unlike the backend it
 * cannot compute an "end of event day" default for `closes_at` when
 * `voting_closes` isn't set explicitly — that case reports `"unscheduled"`
 * (treated as hidden by the CTA) rather than guessing. The vote page itself
 * always defers to the backend's `GET .../peer-vote/slate` response, which
 * has the event/timezone and is authoritative.
 */

/**
 * `'disabled' | 'unscheduled' | 'upcoming' | 'open' | 'closed'`
 *
 * - `disabled` — `constraints.peer_vote_enabled` isn't `true`.
 * - `unscheduled` — enabled, but there isn't enough on `deadlines` to know
 *   when voting opens/closes (no `voting_opens`/`late_submission_until`/
 *   `submission`, or no explicit `voting_closes`).
 * - `upcoming` / `open` / `closed` — relative to `nowMs`.
 */
export function deriveVoteWindow(deadlines, constraints, nowMs = Date.now()) {
  if (!constraints || constraints.peer_vote_enabled !== true) return "disabled";

  const d = deadlines || {};
  const opensAtIso = d.voting_opens || d.late_submission_until || d.submission || null;
  const closesAtIso = d.voting_closes || null;
  if (!opensAtIso || !closesAtIso) return "unscheduled";

  const opensAt = Date.parse(opensAtIso);
  const closesAt = Date.parse(closesAtIso);
  if (Number.isNaN(opensAt) || Number.isNaN(closesAt)) return "unscheduled";

  if (nowMs < opensAt) return "upcoming";
  if (nowMs >= closesAt) return "closed";
  return "open";
}

/**
 * Toggles `id` in `picks`: removes it if present, otherwise appends it —
 * unless that would exceed `max`, in which case `picks` is returned
 * unchanged (the vote page disables the button instead, but this keeps the
 * reducer itself safe against a stale click).
 */
export function togglePick(picks, id, max) {
  const list = Array.isArray(picks) ? picks : [];
  if (list.includes(id)) return list.filter((pick) => pick !== id);
  if (max != null && list.length >= max) return list;
  return [...list, id];
}

/** True once at least one pick is made (and never more than `max` — kept
 * in lockstep by `togglePick`, checked here defensively). */
export function canSubmit(picks, max) {
  const list = Array.isArray(picks) ? picks : [];
  return list.length >= 1 && (max == null || list.length <= max);
}

/**
 * `{ github, project }` — the two external links a slate card offers for
 * one project. `github` is the first linked repo (string or `{link}`
 * shape); `project` is the public team page, or null without an `eventId`.
 */
export function slateLinks(item, eventId) {
  const links = Array.isArray(item?.github_links) ? item.github_links : [];
  const first = links[0];
  const github = (typeof first === "string" ? first : first?.link) || null;
  const project = eventId && item?.team_id ? `/hack/${eventId}/team/${item.team_id}` : null;
  return { github, project };
}
