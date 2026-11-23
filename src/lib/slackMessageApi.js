import axios from "axios";

/**
 * Admin Slack messages (/admin/communication → Slack tab).
 *
 * Every method THROWS SlackMessageApiError on failure, so a message Slack
 * refused can never be shown as sent. `code` is the backend's error code
 * (channel_not_found, not_in_channel, no_slack_account, …).
 */

export class SlackMessageApiError extends Error {
  constructor(message, { status, body, cause } = {}) {
    super(message);
    this.name = "SlackMessageApiError";
    this.status = status;
    this.body = body;
    this.code = body && typeof body === "object" ? body.error : undefined;
    this.cause = cause;
  }
}

// Shown when the channel list can't be loaded (older backend, Slack down).
// Any other channel name can still be typed.
export const FALLBACK_CHANNELS = ["general", "announcements", "ask-a-mentor"];

async function request(method, path, accessToken, orgId, { data, fallback, timeout }) {
  try {
    const response = await axios({
      method,
      url: `${process.env.NEXT_PUBLIC_API_SERVER_URL}${path}`,
      data,
      timeout,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        ...(orgId ? { "X-Org-Id": orgId } : {}),
      },
    });
    return response.data;
  } catch (error) {
    const status = error?.response?.status;
    const body = error?.response?.data;
    const serverMessage =
      body && typeof body === "object" ? body.message || body.error : null;
    const message = serverMessage
      ? String(serverMessage)
      : status
        ? `${fallback} (HTTP ${status})`
        : `${fallback} (network error)`;
    throw new SlackMessageApiError(message, { status, body, cause: error });
  }
}

const slackMessageApi = {
  /** [{id, name, is_private, is_member, num_members}] sorted by name. */
  async listChannels(accessToken, orgId) {
    const data = await request("get", "/api/slack/admin/channels", accessToken, orgId, {
      fallback: "Could not load Slack channels",
      timeout: 30000,
    });
    return Array.isArray(data?.channels) ? data.channels : [];
  },

  /**
   * Post `message` to `channel`, or to the signed-in admin when `toSelf`.
   * Resolves {channel, channel_id, ts, permalink}.
   *
   * An older backend answers 200 without `channel_id` and does not report
   * Slack's refusals; that reply is returned with `unverified: true`.
   */
  async send(accessToken, orgId, { message, channel, toSelf = false, unfurlLinks = false }) {
    const data = await request("post", "/api/slack/message", accessToken, orgId, {
      data: {
        message,
        unfurl_links: Boolean(unfurlLinks),
        ...(toSelf ? { to_self: true } : { channel }),
      },
      fallback: "Could not send the Slack message",
      // A channel-name lookup can wait on Slack's rate limiter.
      timeout: 90000,
    });
    if (data?.success === false) {
      throw new SlackMessageApiError(
        data.message || data.error || "Could not send the Slack message",
        { status: 200, body: data },
      );
    }
    return { ...data, unverified: !data?.channel_id };
  },
};

export default slackMessageApi;
