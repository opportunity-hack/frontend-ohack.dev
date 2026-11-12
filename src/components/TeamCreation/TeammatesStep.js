import React, { memo } from "react";
import NextLink from "next/link";
import { Box } from "@mui/material";
import TeamMemberManager from "./TeamMemberManager";
import CommentsSection from "./CommentsSection";
import { SLACK_SIGNUP_PATH } from "../../lib/teamInvite";

/**
 * "Teammates & notes" step. Leads with the rule — everyone on the team is on
 * the Opportunity Hack Slack — and that it's fine to create the team before
 * everyone is there (they join later from the team page).
 */
const TeammatesStep = memo(
  ({
    teamMembers,
    onAddMember,
    onRemoveMember,
    slackUsers,
    slackUsersStatus,
    slackChannel,
    eventId,
    comments,
    setComments,
  }) => (
    <Box>
      <h2
        style={{
          fontFamily: "var(--display)",
          fontWeight: 600,
          fontSize: "1.4rem",
          margin: "0 0 8px",
        }}
      >
        Who&apos;s on your team?
      </h2>
      <p style={{ color: "var(--muted)", margin: "0 0 8px", maxWidth: "40em" }}>
        <strong style={{ color: "var(--ink)" }}>
          Everyone on your team needs to be on the Opportunity Hack Slack
        </strong>{" "}
        — your team channel, mentors and organizers are all there. New to it?{" "}
        <NextLink href={SLACK_SIGNUP_PATH} className="ohx-link" target="_blank">
          Here&apos;s how to join
        </NextLink>
        .
      </p>
      <p
        style={{ color: "var(--muted)", margin: "0 0 20px", maxWidth: "40em" }}
      >
        You don&apos;t have to wait for everyone: create the team now, and
        anyone not on Slack yet joins from your team page later.
      </p>
      <TeamMemberManager
        teamMembers={teamMembers}
        onAddMember={onAddMember}
        onRemoveMember={onRemoveMember}
        slackUsers={slackUsers}
        slackUsersStatus={slackUsersStatus}
        slackChannel={slackChannel}
        eventId={eventId}
      />
      <CommentsSection comments={comments} setComments={setComments} />
    </Box>
  ),
);

TeammatesStep.displayName = "TeammatesStep";

export default TeammatesStep;
