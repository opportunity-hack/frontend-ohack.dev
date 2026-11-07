import React, { useState } from "react";
import NextLink from "next/link";
import { Box, CircularProgress } from "@mui/material";
import { FaSlack } from "react-icons/fa";
import TeamJoinConfirmationModal from "./TeamJoinConfirmationModal";
import { slackChannelUrl } from "../../lib/slackLinks";

// Only ever rendered inside a RefinedRoot (the team page), so `.ohx-*`
// classes and `var(--x)` are safe here. The confirmation modal is a Portal
// and carries its own literal colors.

const mutedSx = {
  fontFamily: "var(--body)",
  fontSize: "0.92rem",
  lineHeight: 1.55,
  color: "var(--muted)",
  m: 0,
};

const stripSx = (tone) => ({
  fontFamily: "var(--body)",
  fontSize: "0.92rem",
  lineHeight: 1.5,
  color: "var(--ink)",
  background: "var(--surface-2)",
  borderLeft: `3px solid ${tone === "error" ? "#B3261E" : "var(--accent)"}`,
  borderRadius: 1,
  px: 2,
  py: 1.25,
  mb: 2,
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 1.5,
});

const disabledStyle = { opacity: 0.6, cursor: "not-allowed" };

const Spinner = () => (
  <CircularProgress size={14} sx={{ color: "inherit" }} aria-hidden />
);

/**
 * Join / leave footer for the team page's "Team members" card. Mirrors the
 * event page's team-card rules (`Hackathon/TeamList`): only approved hackers
 * join, blocked reasons come from `teamMembershipApi`, and joining goes
 * through the shared three-ack confirmation modal. Leaving is a two-step
 * inline confirm (it posts to the team's Slack channel) — no browser dialog.
 */
export default function TeamMembershipActions({
  eventId,
  teamName,
  slackChannel,
  isLoggedIn,
  isOnTeam,
  membershipChecked,
  hackerStatus,
  joinBlockedReason,
  leaveBlockedReason,
  pending,
  error,
  result,
  onJoin,
  onLeave,
  onLogin,
  onDismissFeedback,
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);

  const joining = pending === "join";
  const leaving = pending === "leave";
  const slackHref = slackChannelUrl(slackChannel);
  const slackLabel = slackChannel
    ? `#${String(slackChannel).replace(/^#/, "")}`
    : "the team's Slack channel";

  const handleConfirmJoin = () => {
    setModalOpen(false);
    onJoin();
  };

  const handleLeave = () => {
    setConfirmLeave(false);
    onLeave();
  };

  let body;
  if (!membershipChecked) {
    body = (
      <Box component="p" sx={mutedSx} role="status">
        Checking your team status…
      </Box>
    );
  } else if (!isLoggedIn) {
    body = joinBlockedReason ? (
      <Box component="p" sx={mutedSx}>
        {joinBlockedReason}
      </Box>
    ) : (
      <Box
        sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 2 }}
      >
        <Box component="p" sx={mutedSx}>
          Hacking with this team? Log in to join it from here.
        </Box>
        <button
          type="button"
          className="ohx-btn ohx-btn--ghost"
          onClick={onLogin}
        >
          Log in to join
        </button>
      </Box>
    );
  } else if (isOnTeam) {
    body = (
      <Box
        sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 2 }}
      >
        <span className="ohx-tag ohx-tag--accent">You're on this team</span>
        {leaveBlockedReason ? (
          <Box component="p" sx={mutedSx}>
            {leaveBlockedReason}
          </Box>
        ) : confirmLeave ? (
          <Box
            role="group"
            aria-label={`Leave ${teamName || "this team"}?`}
            sx={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 1.5,
            }}
          >
            <Box component="p" sx={{ ...mutedSx, color: "var(--ink)" }}>
              Leave {teamName || "this team"}? Your teammates will see a note in{" "}
              {slackLabel}.
            </Box>
            <button
              type="button"
              className="ohx-btn ohx-btn--primary"
              onClick={handleLeave}
              disabled={leaving}
              style={leaving ? disabledStyle : undefined}
            >
              {leaving && <Spinner />}
              {leaving ? "Leaving…" : "Yes, leave the team"}
            </button>
            <button
              type="button"
              className="ohx-btn ohx-btn--ghost"
              onClick={() => setConfirmLeave(false)}
              disabled={leaving}
            >
              Stay on the team
            </button>
          </Box>
        ) : (
          <button
            type="button"
            className="ohx-btn ohx-btn--ghost"
            onClick={() => setConfirmLeave(true)}
            disabled={leaving}
            style={leaving ? disabledStyle : undefined}
          >
            {leaving && <Spinner />}
            {leaving ? "Leaving…" : "Leave team"}
          </button>
        )}
      </Box>
    );
  } else if (joinBlockedReason) {
    body = (
      <Box component="p" sx={mutedSx}>
        {joinBlockedReason}
      </Box>
    );
  } else if (hackerStatus === "approved") {
    body = (
      <Box
        sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 2 }}
      >
        <button
          type="button"
          className="ohx-btn ohx-btn--primary"
          onClick={() => setModalOpen(true)}
          disabled={joining}
          style={joining ? disabledStyle : undefined}
        >
          {joining && <Spinner />}
          {joining ? "Joining…" : "Join team"}
        </button>
        <Box component="p" sx={mutedSx}>
          You'll be added to the team and invited to {slackLabel}.
        </Box>
      </Box>
    );
  } else if (hackerStatus === "pending") {
    body = (
      <Box component="p" sx={mutedSx}>
        Your hacker application is awaiting confirmation. You can join a team
        once it's approved — usually within a week.
      </Box>
    );
  } else if (hackerStatus === "none") {
    body = (
      <Box component="p" sx={mutedSx}>
        Joining a team is for approved hackers.{" "}
        <NextLink
          href={`/hack/${eventId}/hacker-application`}
          className="ohx-link"
        >
          Apply as a hacker
        </NextLink>{" "}
        to get started.
      </Box>
    );
  } else {
    body = (
      <Box component="p" sx={mutedSx} role="status">
        Checking your application…
      </Box>
    );
  }

  return (
    <Box
      sx={{
        mt: 2.5,
        pt: 2.5,
        borderTop: "1px solid var(--line)",
        minHeight: 44,
      }}
    >
      {error && (
        <Box role="alert" sx={stripSx("error")}>
          <span>{error}</span>
          {onDismissFeedback && (
            <button
              type="button"
              className="ohx-link"
              onClick={onDismissFeedback}
              style={{
                background: "none",
                border: 0,
                padding: 0,
                cursor: "pointer",
              }}
            >
              Dismiss
            </button>
          )}
        </Box>
      )}
      {!error && result?.action === "join" && (
        <Box role="status" sx={stripSx("success")}>
          <span>
            {result.noop ? "You were already on this team." : "You're in!"}
          </span>
          {slackHref && (
            <a
              className="ohx-link"
              href={slackHref}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaSlack aria-hidden style={{ marginRight: 6 }} />
              Say hello in {slackLabel}
            </a>
          )}
        </Box>
      )}
      {!error && result?.action === "leave" && (
        <Box role="status" sx={stripSx("success")}>
          <span>
            {result.noop
              ? "You weren't on this team."
              : `You've left ${teamName || "the team"}.`}
          </span>
        </Box>
      )}

      {body}

      <TeamJoinConfirmationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirmJoin}
        teamName={teamName}
        loading={joining}
      />
    </Box>
  );
}
