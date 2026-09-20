import React from "react";
import { Box } from "@mui/material";
import {
  TEAM_STATUS_OPTIONS,
  isWinningStatus,
} from "../../constants/teamStatus";
import { H1_HAS_TEAM, H1_NO_TEAM } from "./copy";

function statusLabel(status) {
  const opt = TEAM_STATUS_OPTIONS.find((o) => o.value === status);
  const label = opt?.label || status;
  return isWinningStatus(status) ? `🏆 ${label}` : label;
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
              <span className="ohx-tag">{statusLabel(team.status)}</span>
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
