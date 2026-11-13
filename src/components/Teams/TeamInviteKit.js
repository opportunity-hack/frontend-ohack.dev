import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import JoinTeamSteps, { teammateJoinSteps } from "./JoinTeamSteps";
import {
  buildInviteMessage,
  loadPendingTeammates,
  savePendingTeammates,
  stillToJoin,
  teamPagePath,
} from "../../lib/teamInvite";
import { trackEvent, EventCategory } from "../../lib/ga";

const MUTED = "var(--muted, #5B6170)";
const LINE = "var(--line, #E7E1D4)";

function copy(text) {
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    return navigator.clipboard.writeText(text).then(
      () => true,
      () => false,
    );
  }
  return Promise.resolve(false);
}

/**
 * Bring the rest of the team in: the "everyone on Slack" rule, a ready-to-send
 * invite message (Slack sign-up → log in with Slack → hacker application →
 * Join team on the team page), the team page link, and — on the dashboard —
 * the "Still to join" names typed during team creation (local reminder,
 * lib/teamInvite.js; a name drops off once someone with it is on the roster).
 *
 * Used by the dashboard roster card and, for members, the team page's Team
 * members section. Renders inside RefinedRoot.
 */
export default function TeamInviteKit({
  eventId,
  teamId,
  teamName,
  eventTitle,
  slackChannel,
  users,
  showPending = false,
  source,
}) {
  const [pending, setPending] = useState([]);
  const [status, setStatus] = useState("");
  // Opened when copying fails so the message is right there to select.
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Load the reminder list, and forget names that are now on the roster so
  // storage doesn't keep growing (skip while the roster is still empty).
  const rosterKey = (users || [])
    .map((u) => u?.name || u?.nickname || "")
    .join("|");
  useEffect(() => {
    if (!showPending) return;
    const stored = loadPendingTeammates(slackChannel);
    const open = (users || []).length ? stillToJoin(stored, users) : stored;
    if (open.length !== stored.length) savePendingTeammates(slackChannel, open);
    setPending(open);
    // `rosterKey` stands in for `users` (a new array every render).
  }, [showPending, slackChannel, rosterKey]);

  const origin =
    typeof window !== "undefined" ? window.location.origin : undefined;
  const message = buildInviteMessage({
    teamName,
    eventTitle,
    eventId,
    teamId,
    slackChannel,
    ...(origin ? { origin } : {}),
  });
  const link = `${origin || "https://www.ohack.dev"}${teamPagePath(eventId, teamId)}`;
  const remaining = stillToJoin(pending, users);

  const doCopy = async (what) => {
    const ok = await copy(what === "message" ? message : link);
    if (!ok) setDetailsOpen(true);
    setStatus(
      ok
        ? what === "message"
          ? "Invite message copied — paste it in a text, email or DM."
          : "Team page link copied."
        : "Couldn't copy automatically — select the message below and copy it.",
    );
    trackEvent({
      action: "team_invite_copy",
      params: {
        event_category: EventCategory.ENGAGEMENT,
        event_label: what,
        source,
        event_id: eventId,
      },
    });
    setTimeout(() => setStatus(""), 4000);
  };

  const dropName = (name) => {
    const next = pending.filter((n) => n !== name);
    setPending(next);
    savePendingTeammates(slackChannel, next);
  };

  return (
    <Box
      sx={{
        border: `1px solid ${LINE}`,
        borderRadius: 2,
        p: { xs: 2, sm: 2.5 },
        background: "var(--surface-2, #F4F1E9)",
      }}
    >
      <Box component="p" sx={{ fontWeight: 600, m: "0 0 4px" }}>
        Everyone on your team should be on Slack and on this list.
      </Box>
      <Box
        component="p"
        sx={{
          color: MUTED,
          fontSize: "0.92rem",
          m: "0 0 14px",
          maxWidth: "42em",
        }}
      >
        Missing someone? Send them the invite message. They join from your team
        page — even while organizers are still reviewing your team.
      </Box>

      {remaining.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Box sx={{ fontSize: "0.85rem", color: MUTED, mb: 0.75 }}>
            Still to join
          </Box>
          <Box
            component="ul"
            aria-label="Still to join"
            sx={{
              listStyle: "none",
              p: 0,
              m: 0,
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
            }}
          >
            {remaining.map((name) => (
              <li key={name}>
                <span
                  className="ohx-tag"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  {name}
                  <button
                    type="button"
                    onClick={() => dropName(name)}
                    aria-label={`Remove ${name} from the reminder list`}
                    style={{
                      background: "none",
                      border: 0,
                      padding: 0,
                      cursor: "pointer",
                      color: "inherit",
                      lineHeight: 1,
                    }}
                  >
                    ×
                  </button>
                </span>
              </li>
            ))}
          </Box>
        </Box>
      )}

      <Box
        sx={{
          display: "flex",
          gap: 1.5,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <button
          type="button"
          className="ohx-btn ohx-btn--primary"
          onClick={() => doCopy("message")}
        >
          Copy invite message
        </button>
        <button
          type="button"
          className="ohx-btn ohx-btn--ghost"
          onClick={() => doCopy("link")}
        >
          Copy team page link
        </button>
      </Box>
      <Box
        aria-live="polite"
        sx={{ fontSize: "0.85rem", color: MUTED, mt: 1, minHeight: "1.3em" }}
      >
        {status}
      </Box>

      <details
        style={{ marginTop: 8 }}
        open={detailsOpen}
        onToggle={(e) => setDetailsOpen(e.currentTarget.open)}
      >
        <summary
          className="ohx-link"
          style={{ cursor: "pointer", fontWeight: 600 }}
        >
          What they&apos;ll do to join
        </summary>
        <Box sx={{ mt: 2 }}>
          <JoinTeamSteps
            items={teammateJoinSteps({ slackChannel, eventId })}
            ariaLabel="How a teammate joins"
          />
          <Box sx={{ fontSize: "0.85rem", color: MUTED, mt: 2, mb: 0.75 }}>
            The invite message
          </Box>
          <Box
            component="pre"
            sx={{
              whiteSpace: "pre-wrap",
              fontFamily: "inherit",
              fontSize: "0.88rem",
              background: "var(--paper, #fff)",
              border: `1px solid ${LINE}`,
              borderRadius: 1,
              p: 1.5,
              m: 0,
              userSelect: "all",
            }}
          >
            {message}
          </Box>
        </Box>
      </details>
    </Box>
  );
}
