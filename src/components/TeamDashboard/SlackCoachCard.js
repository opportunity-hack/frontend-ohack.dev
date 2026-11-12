import React, { useState } from "react";
import { Box } from "@mui/material";
import DashboardSection from "./DashboardSection";
import { slackChannelUrl, KEY_CHANNELS } from "../../lib/slackLinks";
import { useEnv } from "../../context/env.context";
import { trackEvent, EventCategory } from "../../lib/ga";
import { SLACK_TITLE } from "./copy";

const PIN_VIDEO_URL = "https://youtu.be/9GUfV7Z4B4E";
const THREADS_VIDEO_URL = "https://www.youtube.com/watch?v=afagxo_TcKo&t=26s";

function trackTip(tip) {
  trackEvent({
    action: "team_slack_tip_click",
    params: { event_category: EventCategory.ENGAGEMENT, event_label: tip },
  });
}

function copyToClipboard(text) {
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    navigator.clipboard.writeText(text).catch(() => {});
  }
}

function TipButton({ tip, label, onClick, feedbackLabel = "Copied ✓" }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="ohx-btn ohx-btn--ghost"
      onClick={() => {
        onClick();
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
        trackTip(tip);
      }}
      style={{ marginRight: 8, marginBottom: 8 }}
    >
      {copied ? feedbackLabel : label}
      {/* Always mounted (not just while `copied`) — a screen reader needs a
          live region to already exist in the DOM before its text changes to
          announce it; inserting a brand-new element with the text already
          set is commonly missed. */}
      <span
        aria-live="polite"
        className="sr-only"
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          overflow: "hidden",
        }}
      >
        {copied ? feedbackLabel : ""}
      </span>
    </button>
  );
}

function TipLink({ tip, label, href }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="ohx-btn ohx-btn--ghost"
      onClick={() => trackTip(tip)}
      style={{ marginRight: 8, marginBottom: 8 }}
    >
      {label}
    </a>
  );
}

export default function SlackCoachCard({ team, eventId }) {
  const { slackSignupUrl } = useEnv();
  const channelUrl = slackChannelUrl(team?.slack_channel);

  return (
    <DashboardSection id="slack" eyebrow="Coordinate here" title={SLACK_TITLE}>
      {channelUrl ? (
        <a
          href={channelUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ohx-btn ohx-btn--primary"
          style={{ marginBottom: 12, display: "inline-block" }}
        >
          Open #{team.slack_channel}
        </a>
      ) : (
        <Box sx={{ color: "var(--muted)", mb: 2 }}>
          Your Slack channel will appear here once your team is approved.
        </Box>
      )}

      <Box sx={{ fontSize: "0.9rem", color: "var(--muted)", mb: 2 }}>
        Your ohack.dev login doesn&apos;t create a Slack account — join via{" "}
        <a
          href={slackSignupUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ohx-link"
        >
          /signup
        </a>{" "}
        first.
      </Box>

      <Box sx={{ display: "flex", flexWrap: "wrap" }}>
        <TipButton
          tip="standup_template"
          label="Copy standup template"
          onClick={() =>
            copyToClipboard("**Yesterday:** \n**Today:** \n**Blockers:** ")
          }
        />
        <TipLink
          tip="ask_a_mentor"
          label="Technical Questions: #ask-a-mentor"
          href={slackChannelUrl(KEY_CHANNELS.askAMentor)}
        />
        <TipLink
          tip="ask_help"
          label="General Questions: #help"
          href={slackChannelUrl(KEY_CHANNELS.help)}
        />
        {eventId ? (
          <TipLink
            tip="see_mentors"
            label="See mentors"
            href={`/hack/${eventId}#mentor`}
          />
        ) : null}
        <TipButton
          tip="pin_links"
          label="Pin your repo + demo link"
          onClick={() => {
            const repo = team?.github_links?.[0];
            const repoLink = typeof repo === "string" ? repo : repo?.link;
            copyToClipboard(
              [repoLink, team?.demo_video_url].filter(Boolean).join("\n"),
            );
          }}
        />
        <TipLink
          tip="pin_links_video"
          label="▶ Watch: how to pin"
          href={PIN_VIDEO_URL}
        />
        <TipLink
          tip="reply_in_threads"
          label="▶ Watch: reply in threads"
          href={THREADS_VIDEO_URL}
        />
      </Box>

      <Box sx={{ mt: 2, fontSize: "0.85rem", color: "var(--faint)" }}>
        Employers can read your channel later — it&apos;s part of your public
        portfolio.
      </Box>
    </DashboardSection>
  );
}
