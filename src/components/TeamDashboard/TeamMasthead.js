import React from "react";
import { Box } from "@mui/material";
import { getWinningStatus } from "../../constants/teamStatus";
import { statusLabel } from "../Teams/teamPageData";
import { H1_HAS_TEAM, H1_NO_TEAM } from "./copy";

// Same "never render the raw enum" rule as the public team page
// (CLAUDE.md invariant #1): the base label always comes from the shared
// `statusLabel()`, and only a winning status gets the 🏆 prefix — sourced
// from `getWinningStatus()`, not re-derived here.
function teamStatusTag(status) {
  const winning = getWinningStatus(status);
  return winning ? `🏆 ${winning.label}` : statusLabel(status);
}

export default function TeamMasthead({
  eventId,
  eventTitle,
  team,
  nonprofitName,
  hasTeam,
}) {
  return (
    <Box sx={{ mb: 4 }}>
      <a
        href={`/hack/${eventId}`}
        className="ohx-link"
        style={{
          fontSize: "0.9rem",
          display: "inline-block",
          marginBottom: "0.75rem",
        }}
      >
        ← {eventTitle || "Back to hackathon"}
      </a>
      <h1
        className="ohx-display"
        style={{
          fontWeight: 600,
          fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
          margin: 0,
          lineHeight: 1.2,
        }}
      >
        {hasTeam ? H1_HAS_TEAM : H1_NO_TEAM}
      </h1>

      {team && (
        <>
          <Box sx={{ fontFamily: "var(--display)", fontSize: "1.2rem", mt: 1 }}>
            {team.name}
          </Box>
          <Box
            sx={{
              display: "flex",
              gap: 1,
              flexWrap: "wrap",
              mt: 1,
              alignItems: "center",
            }}
          >
            {team.status !== "INACTIVE" && (
              <span className="ohx-tag">{teamStatusTag(team.status)}</span>
            )}
            {nonprofitName && <span className="ohx-tag">{nonprofitName}</span>}
            {Array.isArray(team.awards) &&
              team.awards.map((award) => (
                <span key={award} className="ohx-tag ohx-tag--accent">
                  {award}
                </span>
              ))}
          </Box>
          <Box sx={{ mt: 1.5 }}>
            <a href={`/hack/${eventId}/team/${team.id}`} className="ohx-link">
              View public project page →
            </a>
          </Box>
          <Box sx={{ fontSize: "0.82rem", color: "var(--faint)", mt: 0.5 }}>
            Public portfolio — recruiters and judges see this page.
          </Box>
        </>
      )}
    </Box>
  );
}
