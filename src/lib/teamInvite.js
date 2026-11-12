/**
 * Getting the whole team onto Slack and onto the team roster.
 *
 * The rule (Nov 2026): everyone on a hackathon team is on the Opportunity Hack
 * Slack. A team can be created before everyone is there — teammates picked
 * from Slack are added at creation; everyone else joins later from the team
 * page (allowed while the team is still in review — backend
 * api/teams/membership_rules.py PENDING_REVIEW_STATUSES).
 *
 * Joining from the team page only invites someone to the team's Slack
 * channel when they logged in to ohack.dev WITH Slack (backend join_team) —
 * a Google login joins the team but not the channel, so the copy recommends
 * "Sign in with Slack".
 */

const SITE = "https://www.ohack.dev";

/** ohack.dev's own Slack sign-up page (explains the two-account gotcha). */
export const SLACK_SIGNUP_PATH = "/signup";

/** True when this own-profile payload belongs to a Slack login. */
export function isSlackLogin(profile) {
  const id = profile?.user_id;
  return typeof id === "string" && id.startsWith("oauth2|slack");
}

/** Display name for a create-flow teammate (Slack user object or typed name). */
export function teammateName(member) {
  if (typeof member === "string") return member.trim();
  return (member?.real_name || member?.name || "").trim();
}

/**
 * Create-flow teammates split by what happens to them at creation:
 * Slack users (objects with an `id`) are added now; typed names are only a
 * reminder — they join later from the team page.
 */
export function splitTeammates(teamMembers) {
  const onSlack = [];
  const joinLater = [];
  (teamMembers || []).forEach((m) => {
    if (m && typeof m === "object" && m.id) onSlack.push(m);
    else if (teammateName(m)) joinLater.push(teammateName(m));
  });
  return { onSlack, joinLater };
}

export const channelLabel = (slackChannel) =>
  slackChannel
    ? `#${String(slackChannel).replace(/^#/, "")}`
    : "your team's Slack channel";

export const teamPagePath = (eventId, teamId) =>
  `/hack/${eventId}/team/${teamId}`;

/** The message a team sends to teammates who still need to join. */
export function buildInviteMessage({
  teamName,
  eventTitle,
  eventId,
  teamId,
  slackChannel,
  origin = SITE,
}) {
  const team = teamName ? `"${teamName}"` : "our team";
  const event = eventTitle ? ` for ${eventTitle}` : "";
  return [
    `Join ${team}${event}! Everyone on the team needs to be on the Opportunity Hack Slack.`,
    "",
    `1. Join the Opportunity Hack Slack: ${origin}${SLACK_SIGNUP_PATH}`,
    `2. Log in at ${origin} with "Sign in with Slack" — that adds you to ${channelLabel(slackChannel)} automatically.`,
    `3. If you haven't yet, apply as a hacker: ${origin}/hack/${eventId}/hacker-application (you can join once it's approved).`,
    `4. Open our team page and click "Join team": ${origin}${teamPagePath(eventId, teamId)}`,
  ].join("\n");
}

// ---- "Still to join" reminders (local only, like the Slack "Everyone's in"
// ack). Keyed by Slack channel because it's unique per team and known before
// the team id exists (the create flow saves the list at submit).

const pendingKey = (slackChannel) =>
  `ohx.team.pendingTeammates.${String(slackChannel || "").replace(/^#/, "")}`;

export function loadPendingTeammates(slackChannel) {
  if (!slackChannel || typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(pendingKey(slackChannel));
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list.filter((n) => typeof n === "string") : [];
  } catch {
    return [];
  }
}

export function savePendingTeammates(slackChannel, names) {
  if (!slackChannel || typeof window === "undefined") return;
  try {
    if (names && names.length) {
      window.localStorage.setItem(
        pendingKey(slackChannel),
        JSON.stringify(names),
      );
    } else {
      window.localStorage.removeItem(pendingKey(slackChannel));
    }
  } catch {
    // localStorage unavailable — the reminder is a convenience only
  }
}

const norm = (s) =>
  String(s || "")
    .trim()
    .toLowerCase();

/**
 * Reminder names nobody on the roster matches yet. A roster member matches
 * when their name or nickname equals the reminder, or their first name equals
 * a one-word reminder ("Sam" ↔ "Sam Rivera").
 */
export function stillToJoin(names, users) {
  const roster = (users || []).flatMap((u) => {
    const full = [norm(u?.name), norm(u?.nickname)].filter(Boolean);
    return [...full, ...full.map((n) => n.split(/\s+/)[0])];
  });
  return (names || []).filter((name) => {
    const n = norm(name);
    return Boolean(n) && !roster.includes(n);
  });
}
