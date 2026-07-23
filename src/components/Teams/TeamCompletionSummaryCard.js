import React from "react";
import NextLink from "next/link";
import { Box, LinearProgress } from "@mui/material";
import { COMPLETION_ITEMS, COMPLETION_TOTAL } from "./TeamCompletionChecklist";

/**
 * Compact, refined-styled summary of a winning team's Definition of Done,
 * shown on the team overview page in place of the full TeamCompletionChecklist.
 * Links to the dedicated /completion page. Computes from team.completion_* —
 * no backend change.
 */
export default function TeamCompletionSummaryCard({ team, eventId, teamId }) {
  const checklist = team?.completion_checklist || {};
  const doneCount = COMPLETION_ITEMS.reduce(
    (acc, it) => acc + (checklist[it.slug]?.done ? 1 : 0),
    0
  );
  const isComplete = team?.completion_status === "complete";
  const pct = (doneCount / COMPLETION_TOTAL) * 100;
  const completedDate = team?.completion_completed_at
    ? new Date(team.completion_completed_at).toLocaleDateString()
    : null;

  const href = `/hack/${eventId}/team/${teamId}/completion`;

  return (
    <Box
      className="ohx-card"
      sx={{
        p: { xs: 2, md: 2.5 },
        ...(isComplete ? { borderLeft: "3px solid var(--accent)" } : {}),
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
        <Box className="ohx-eyebrow">Definition of Done</Box>
        <NextLink
          href={href}
          className="ohx-link"
          style={{ marginLeft: "auto", fontSize: "0.85rem" }}
        >
          View completion checklist →
        </NextLink>
      </Box>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, alignItems: "center", mb: 1.25 }}>
        <span className={`ohx-tag${isComplete ? " ohx-tag--accent" : ""}`}>
          {doneCount}/{COMPLETION_TOTAL} complete
        </span>
        {isComplete && (
          <span className="ohx-tag ohx-tag--accent">
            🏆 Project complete{completedDate ? ` · ${completedDate}` : ""}
          </span>
        )}
      </Box>

      <LinearProgress
        variant="determinate"
        value={pct}
        sx={{
          height: 6,
          borderRadius: 3,
          backgroundColor: "var(--surface-2)",
          "& .MuiLinearProgress-bar": {
            backgroundColor: isComplete ? "var(--accent)" : "var(--brand)",
          },
        }}
      />
    </Box>
  );
}
