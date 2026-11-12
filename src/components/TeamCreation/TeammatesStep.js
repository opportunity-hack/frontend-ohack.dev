import React, { memo } from "react";
import { Box } from "@mui/material";
import TeamMemberManager from "./TeamMemberManager";
import CommentsSection from "./CommentsSection";

/**
 * "Teammates & notes" step — split out of the old nonprofit step, where the
 * teammate picker sat below a long list and was easy to miss.
 */
const TeammatesStep = memo(
  ({
    teamMembers,
    memberInput,
    setMemberInput,
    handleAddTeamMember,
    handleRemoveTeamMember,
    slackUsers,
    slackChannel,
    comments,
    setComments,
    error,
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
      <p
        style={{ color: "var(--muted)", margin: "0 0 20px", maxWidth: "40em" }}
      >
        Add teammates you already know — others can join later from your
        team&apos;s page. Notes help organizers when they match your team to a
        project.
      </p>
      <TeamMemberManager
        teamMembers={teamMembers}
        memberInput={memberInput}
        setMemberInput={setMemberInput}
        handleAddTeamMember={handleAddTeamMember}
        handleRemoveTeamMember={handleRemoveTeamMember}
        slackUsers={slackUsers}
        slackChannel={slackChannel}
        error={error}
      />
      <CommentsSection comments={comments} setComments={setComments} />
    </Box>
  ),
);

TeammatesStep.displayName = "TeammatesStep";

export default TeammatesStep;
