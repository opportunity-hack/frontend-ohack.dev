/**
 * Admin → team messages (`POST /api/team/admin/<teamId>/message`).
 *
 * Body: {message, channels: {slack, email}, subject?}. The backend answers
 * {success, delivery: {slack?: {sent, channel, error}, email?: {sent[],
 * failed[], missing_email[], error}}} — 200 when at least one channel
 * delivered, 502 `delivery_failed` when nothing did.
 */

export const DEFAULT_MESSAGE_CHANNELS = { slack: true, email: false };

export function teamMessagePayload({ message, channels, subject }) {
  const payload = {
    message: (message || "").trim(),
    channels: { slack: Boolean(channels?.slack), email: Boolean(channels?.email) },
  };
  const trimmedSubject = (subject || "").trim();
  if (payload.channels.email && trimmedSubject) payload.subject = trimmedSubject;
  return payload;
}

/** Why the Send button is disabled, or null. */
export function teamMessageBlockedReason({ message, channels, slackChannel }) {
  if (!(message || "").trim()) return "Write a message first.";
  if (!channels?.slack && !channels?.email) return "Pick Slack, email, or both.";
  if (channels.slack && !channels.email && !slackChannel) {
    return "This team has no Slack channel — send by email instead.";
  }
  return null;
}

const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

/**
 * One readable sentence + severity for the snackbar.
 * @returns {{severity: "success"|"warning"|"error", text: string}}
 */
export function summarizeTeamMessageDelivery(body) {
  const delivery = body?.delivery || {};
  const parts = [];
  const problems = [];

  if (delivery.slack) {
    if (delivery.slack.sent) parts.push(`Slack #${delivery.slack.channel}`);
    else problems.push(`Slack failed: ${delivery.slack.error || "unknown error"}`);
  }

  if (delivery.email) {
    const sent = delivery.email.sent?.length || 0;
    const failed = delivery.email.failed || [];
    const missing = delivery.email.missing_email || [];
    if (sent) parts.push(plural(sent, "email"));
    if (failed.length) {
      problems.push(`email failed for ${failed.map((f) => f.name).join(", ")}`);
    }
    if (missing.length) problems.push(`no email on file for ${missing.join(", ")}`);
    if (!sent && !failed.length && !missing.length && delivery.email.error) {
      problems.push(delivery.email.error);
    }
  }

  if (!parts.length) {
    return {
      severity: "error",
      text: problems.length
        ? `Message not sent — ${problems.join("; ")}.`
        : body?.message || "Message not sent.",
    };
  }
  const sentText = `Sent via ${parts.join(" and ")}`;
  if (problems.length) {
    return { severity: "warning", text: `${sentText} — but ${problems.join("; ")}.` };
  }
  return { severity: "success", text: `${sentText}.` };
}
