import React, { useState } from "react";
import NextLink from "next/link";
import { Box, CircularProgress } from "@mui/material";
import { FaSlack } from "react-icons/fa";
import TeamJoinConfirmationModal from "./TeamJoinConfirmationModal";
import JoinTeamSteps from "./JoinTeamSteps";
import TeamInviteKit from "./TeamInviteKit";
import { slackChannelUrl } from "../../lib/slackLinks";
import { SLACK_SIGNUP_PATH } from "../../lib/teamInvite";

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
/**
 * The four join steps with the viewer's live progress (team page, non-members).
 * The Slack step can't be checked directly — it's "done" only when the viewer
 * logged in with Slack; otherwise it stays a neutral reminder.
 */
function joinChecklist({
  eventId,
  slackLabel,
  isLoggedIn,
  isSlackLogin,
  hackerStatus,
  joining,
  onLogin,
  onOpenJoin,
}) {
  const approved = isLoggedIn && hackerStatus === "approved";
  const items = [
    {
      key: "slack",
      title: "Join the Opportunity Hack Slack",
      state: isSlackLogin ? "done" : undefined,
      body: isSlackLogin ? (
        "You're on Slack."
      ) : (
        <>
          Everyone on a team is on Slack — your team channel, mentors and
          organizers are there. Already on it? You're set.{" "}
          <NextLink
            href={SLACK_SIGNUP_PATH}
            className="ohx-link"
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
      state: isLoggedIn ? "done" : "current",
      body: !isLoggedIn
        ? `Choose “Sign in with Slack” so you're added to ${slackLabel} automatically when you join.`
        : isSlackLogin === false
          ? `You're logged in without Slack. You can still join — afterwards, open ${slackLabel} in Slack and click “Join channel”.`
          : null,
      action: !isLoggedIn ? (
        <button
          type="button"
          className="ohx-btn ohx-btn--primary"
          onClick={onLogin}
        >
          Log in to join
        </button>
      ) : null,
    },
    {
      key: "application",
      title: "Get your hacker application approved",
      state: !isLoggedIn
        ? "todo"
        : hackerStatus === "approved"
          ? "done"
          : "current",
      body: !isLoggedIn ? (
        "Everyone on a team applies as a hacker for this event."
      ) : hackerStatus === "approved" ? (
        "You're approved."
      ) : hackerStatus === "pending" ? (
        "Your application is awaiting confirmation — usually within a week. You can join as soon as it's approved."
      ) : hackerStatus === "none" ? (
        <>
          Everyone on a team applies as a hacker.{" "}
          <NextLink
            href={`/hack/${eventId}/hacker-application`}
            className="ohx-link"
          >
            Apply as a hacker
          </NextLink>
        </>
      ) : (
        "Checking your application…"
      ),
    },
    {
      key: "join",
      title: "Join the team",
      state: approved ? "current" : "todo",
      body: approved
        ? null
        : "Available once the steps above are done. Teams still in review can be joined too.",
      action: approved ? (
        <button
          type="button"
          className="ohx-btn ohx-btn--primary"
          onClick={onOpenJoin}
          disabled={joining}
          style={joining ? disabledStyle : undefined}
        >
          {joining && <Spinner />}
          {joining ? "Joining…" : "Join team"}
        </button>
      ) : null,
    },
  ];
  return items;
}

export default function TeamMembershipActions({
  eventId,
  teamId,
  teamName,
  eventTitle,
  users,
  isSlackLogin = null,
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
  } else if (isLoggedIn && isOnTeam) {
    body = (
      <>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
            mb: 2.5,
          }}
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
                Leave {teamName || "this team"}? Your teammates will see a note
                in {slackLabel}.
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
        <TeamInviteKit
          eventId={eventId}
          teamId={teamId}
          teamName={teamName}
          eventTitle={eventTitle}
          slackChannel={slackChannel}
          users={users}
          source="team_page"
        />
      </>
    );
  } else if (!isOnTeam && joinBlockedReason) {
    body = (
      <Box component="p" sx={mutedSx}>
        {joinBlockedReason}
      </Box>
    );
  } else {
    body = (
      <>
        <Box
          component="p"
          sx={{ ...mutedSx, color: "var(--ink)", fontWeight: 600, mb: 1.5 }}
        >
          Joining {teamName || "this team"}? Here&apos;s how.
        </Box>
        <JoinTeamSteps
          ariaLabel={`How to join ${teamName || "this team"}`}
          items={joinChecklist({
            eventId,
            slackLabel,
            isLoggedIn,
            isSlackLogin,
            hackerStatus,
            joining,
            onLogin,
            onOpenJoin: () => setModalOpen(true),
          })}
        />
      </>
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
              {isSlackLogin === false
                ? `Open ${slackLabel} and click “Join channel”`
                : `Say hello in ${slackLabel}`}
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
        slackInvite={isSlackLogin !== false}
      />
    </Box>
  );
}
