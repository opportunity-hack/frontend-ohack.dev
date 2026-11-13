import React from "react";
import NextLink from "next/link";
import { channelLabel, SLACK_SIGNUP_PATH } from "../../lib/teamInvite";

// Renders inside RefinedRoot (team page, manageteam) but uses var() fallbacks
// so it stays readable anywhere.
const NAVY = "var(--brand, #1B3A6B)";
const ACCENT = "var(--accent, #E2552E)";
const LINE = "var(--line, #E7E1D4)";
const MUTED = "var(--muted, #5B6170)";
const INK = "var(--ink, #16181D)";

const STATE_LABEL = { done: "Done", current: "Next step", todo: "" };

function Marker({ index, state }) {
  const done = state === "done";
  const current = state === "current";
  return (
    <span
      aria-hidden
      style={{
        flexShrink: 0,
        width: 26,
        height: 26,
        borderRadius: "50%",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 13,
        fontWeight: 700,
        background: done ? NAVY : "transparent",
        color: done ? "#fff" : current ? ACCENT : MUTED,
        border: `1.5px solid ${done ? NAVY : current ? ACCENT : LINE}`,
      }}
    >
      {done ? "✓" : index + 1}
    </span>
  );
}

/**
 * The four steps a teammate takes to join a team (Slack → log in with Slack →
 * approved hacker application → Join team). Used statically in the create
 * flow and the dashboard invite kit, and with live `state`s + actions on the
 * team page's Team members section.
 *
 * items: [{ key, title, body?, state?: "done"|"current"|"todo", action? }]
 */
export default function JoinTeamSteps({ items, ariaLabel = "How to join" }) {
  return (
    <ol
      aria-label={ariaLabel}
      style={{
        listStyle: "none",
        margin: 0,
        padding: 0,
        display: "grid",
        gap: 14,
      }}
    >
      {items.map((item, i) => (
        <li
          key={item.key}
          aria-current={item.state === "current" ? "step" : undefined}
          style={{ display: "flex", gap: 12, alignItems: "flex-start" }}
        >
          <Marker index={i} state={item.state} />
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontWeight: 600,
                color: item.state === "done" ? MUTED : INK,
                lineHeight: 1.4,
              }}
            >
              {item.title}
              {item.state && STATE_LABEL[item.state] && (
                <span
                  style={{
                    position: "absolute",
                    width: 1,
                    height: 1,
                    overflow: "hidden",
                    clip: "rect(0 0 0 0)",
                  }}
                >
                  {` (${STATE_LABEL[item.state]})`}
                </span>
              )}
            </div>
            {item.body && (
              <div
                style={{
                  color: MUTED,
                  fontSize: "0.92rem",
                  lineHeight: 1.55,
                  marginTop: 2,
                }}
              >
                {item.body}
              </div>
            )}
            {item.action && <div style={{ marginTop: 8 }}>{item.action}</div>}
          </div>
        </li>
      ))}
    </ol>
  );
}

const linkStyle = { fontWeight: 600 };

/** Static copy of the steps, written for the teammate who still has to join. */
export function teammateJoinSteps({ slackChannel, eventId }) {
  return [
    {
      key: "slack",
      title: "Join the Opportunity Hack Slack",
      body: (
        <>
          Your team channel, mentors and organizers are all there.{" "}
          <NextLink
            href={SLACK_SIGNUP_PATH}
            className="ohx-link"
            style={linkStyle}
            target="_blank"
          >
            How to join Slack
          </NextLink>
        </>
      ),
    },
    {
      key: "login",
      title: "Log in to ohack.dev with Slack",
      body: `Choosing “Sign in with Slack” adds them to ${channelLabel(slackChannel)} automatically when they join.`,
    },
    {
      key: "application",
      title: "Get their hacker application approved",
      body: (
        <>
          Everyone on a team applies as a hacker for this event.{" "}
          <NextLink
            href={`/hack/${eventId}/hacker-application`}
            className="ohx-link"
            style={linkStyle}
            target="_blank"
          >
            Hacker application
          </NextLink>
        </>
      ),
    },
    {
      key: "join",
      title: "Click “Join team” on your team page",
      body: "Your team page link is in the invite message. They can join while organizers are still reviewing your team.",
    },
  ];
}
