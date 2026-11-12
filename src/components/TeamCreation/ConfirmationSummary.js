import React, { memo } from "react";
import { Box } from "@mui/material";
import { FaSlack, FaGithub } from "react-icons/fa";
import { splitTeammates, teammateName } from "../../lib/teamInvite";

/**
 * Last step before creating the team: everything the team entered, including
 * EVERY ranked project (the old summary only showed the top 3 nonprofits).
 * Renders inside RefinedRoot.
 */

const labelStyle = {
  color: "var(--faint)",
  fontSize: "0.85rem",
  marginBottom: 2,
};

const SectionTitle = ({ children }) => (
  <h3
    style={{
      fontFamily: "var(--display)",
      fontWeight: 600,
      fontSize: "1.05rem",
      margin: "0 0 8px",
    }}
  >
    {children}
  </h3>
);

const groupTitleStyle = { ...labelStyle, margin: "4px 0 6px" };

/**
 * Who is on the team at creation vs. who joins later — the distinction the
 * team needs to understand before it creates (typed names are reminders,
 * not members).
 */
function TeamGroups({ teamMembers }) {
  const { onSlack, joinLater } = splitTeammates(teamMembers);
  return (
    <>
      <SectionTitle>Your team</SectionTitle>
      <div style={groupTitleStyle}>On the team when you create it</div>
      <div
        style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}
      >
        <span className="ohx-tag">You</span>
        {onSlack.map((m) => (
          <span key={`slack:${m.id}`} className="ohx-tag">
            {teammateName(m)}
          </span>
        ))}
      </div>
      {joinLater.length > 0 && (
        <>
          <div style={groupTitleStyle}>Joining later from your team page</div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
              marginBottom: 8,
            }}
          >
            {joinLater.map((name) => (
              <span key={`later:${name}`} className="ohx-tag">
                {name}
              </span>
            ))}
          </div>
          <p
            style={{
              margin: "0 0 16px",
              color: "var(--muted)",
              fontSize: "0.92rem",
              maxWidth: "42em",
            }}
          >
            They&apos;ll need to join the Opportunity Hack Slack, log in with
            Slack and click “Join team” on your team page. You&apos;ll get an
            invite message to send them right after you create the team.
          </p>
        </>
      )}
      {joinLater.length === 0 && <div style={{ marginBottom: 16 }} />}
    </>
  );
}

const ConfirmationSummary = memo(
  ({
    teamName,
    slackChannel,
    githubUsername,
    rankedProjects,
    teamMembers,
    comments,
  }) => (
    <Box>
      <h2
        style={{
          fontFamily: "var(--display)",
          fontWeight: 600,
          fontSize: "1.4rem",
          margin: "0 0 16px",
        }}
      >
        Check your team details
      </h2>

      <Box className="ohx-card" sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
            gap: 2,
            mb: 3,
          }}
        >
          <div>
            <div style={labelStyle}>Team name</div>
            <div>{teamName}</div>
          </div>
          <div>
            <div style={labelStyle}>Slack channel</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <FaSlack aria-hidden="true" /> #{slackChannel}
            </div>
          </div>
          <div>
            <div style={labelStyle}>GitHub username</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <FaGithub aria-hidden="true" /> {githubUsername}
            </div>
          </div>
        </Box>

        <SectionTitle>Your project ranking</SectionTitle>
        {rankedProjects.length > 0 ? (
          <ol style={{ margin: "0 0 16px", paddingLeft: 0 }}>
            {rankedProjects.map((entry, index) => (
              <li
                key={entry.projectId}
                style={{
                  listStyle: "none",
                  padding: "8px 0",
                  borderTop: index === 0 ? "none" : "1px solid var(--line)",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--display)",
                    fontWeight: 600,
                    color: "var(--brand)",
                    marginRight: 8,
                  }}
                >
                  #{index + 1}
                </span>
                <span style={{ fontWeight: 600 }}>{entry.title}</span>
                <span style={{ color: "var(--muted)" }}>
                  {" "}
                  · {entry.nonprofitName}
                </span>
              </li>
            ))}
          </ol>
        ) : (
          <p style={{ color: "var(--accent)", margin: "0 0 16px" }}>
            No projects ranked yet — go back to choose some.
          </p>
        )}

        <TeamGroups teamMembers={teamMembers} />

        {comments && (
          <>
            <SectionTitle>Notes for organizers</SectionTitle>
            <p style={{ margin: 0, color: "var(--muted)" }}>{comments}</p>
          </>
        )}
      </Box>

      <Box
        sx={{
          p: 2,
          borderRadius: 2,
          bgcolor: "var(--surface-2)",
          border: "1px solid var(--line)",
          mb: 1,
        }}
      >
        Your team goes to organizers for review (usually within 10–20 minutes).
        You&apos;ll get #{slackChannel} on Slack now — everyone on your team
        should be in it. Your GitHub repo is created when you&apos;re approved.
      </Box>
    </Box>
  ),
);

ConfirmationSummary.displayName = "ConfirmationSummary";

export default ConfirmationSummary;
