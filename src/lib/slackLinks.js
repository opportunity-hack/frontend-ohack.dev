/**
 * Shared Slack workspace links.
 *
 * Before this module existed, ~25 call sites hardcoded
 * `https://opportunity-hack.slack.com/app_redirect?channel=...` (or
 * `/archives/<id>`) inline. This is the single source for the workspace
 * host and the small set of channels referenced by ID across onboarding,
 * mentor surfaces and the team dashboard — new code should import from
 * here rather than inlining another literal.
 *
 * `KEY_CHANNELS` intentionally only lists the channels referenced by ID
 * elsewhere in the app (see `SlackTutorial.js`). A team's own channel
 * (`team.slack_channel`) is a *name*, not one of these IDs — pass it to
 * `slackChannelUrl` directly, e.g. `slackChannelUrl(team.slack_channel)`.
 */

export const SLACK_WORKSPACE_ID = "opportunity-hack";

/** Well-known channel IDs referenced by ID (not name) across the app. */
export const KEY_CHANNELS = {
  introductions: "C01EY49JV8U",
  askAMentor: "C01E5CGDQ74",
  random: "C06BRHRS5BQ",
};

/**
 * Builds a Slack `app_redirect` deep link for a channel, given either its
 * ID (e.g. `KEY_CHANNELS.askAMentor`) or its name (e.g. a team's
 * `slack_channel`). `app_redirect` resolves either form and opens the
 * desktop/mobile app when installed, falling back to the web client.
 *
 * Returns null for a missing/empty channel so callers can conditionally
 * render the link instead of producing a broken href.
 */
export function slackChannelUrl(channel) {
  const trimmed = typeof channel === "string" ? channel.trim() : "";
  if (!trimmed) return null;
  return `https://${SLACK_WORKSPACE_ID}.slack.com/app_redirect?channel=${encodeURIComponent(trimmed)}`;
}

/**
 * Builds a direct `/archives/<id>` link for a channel ID. Prefer
 * `slackChannelUrl` (app_redirect) for most links — this is only useful
 * when linking to a specific message/thread context isn't needed and the
 * caller specifically wants the archives form (matches existing call
 * sites like `JudgeTrainingGate.js`).
 */
export function slackArchiveUrl(channelId) {
  const trimmed = typeof channelId === "string" ? channelId.trim() : "";
  if (!trimmed) return null;
  return `https://${SLACK_WORKSPACE_ID}.slack.com/archives/${encodeURIComponent(trimmed)}`;
}
