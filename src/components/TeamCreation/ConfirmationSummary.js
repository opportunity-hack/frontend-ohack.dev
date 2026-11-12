import React, { memo } from "react";
import { Box } from "@mui/material";
import { FaSlack, FaGithub } from "react-icons/fa";

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

const memberLabel = (member) =>
  typeof member === "string" ? member : member.real_name || member.name || "";

const memberKey = (member) =>
  typeof member === "string"
    ? `name:${member}`
    : `slack:${member.id || member.name}`;

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

        {teamMembers.length > 0 && (
          <>
            <SectionTitle>Teammates</SectionTitle>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 6,
                marginBottom: 16,
              }}
            >
              {teamMembers.map((member) => (
                <span key={memberKey(member)} className="ohx-tag">
                  {memberLabel(member)}
                </span>
              ))}
            </div>
          </>
        )}

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
        Your team goes to organizers for review (usually within a day).
        You&apos;ll get your Slack channel now; your GitHub repo is created when
        you&apos;re approved.
      </Box>
    </Box>
  ),
);

ConfirmationSummary.displayName = "ConfirmationSummary";

export default ConfirmationSummary;
