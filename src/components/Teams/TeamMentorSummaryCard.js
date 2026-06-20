import React from "react";
import NextLink from "next/link";
import { Box } from "@mui/material";
import {
  MENTOR_COVERAGE_ITEMS,
  MENTOR_COVERAGE_TOTAL,
  JUDGING_CRITERIA,
  SCORE_META,
  latestRatingsByMentor,
  consensusForCriterion,
  relativeTime,
} from "./mentorCoverage";

// Refined-token consensus dot colors (calmer than the loud MUI palette ones
// used on the event-list version) — keeps the team page on-brand.
const SCORE_DOT_COLORS = { green: "#3a7d44", yellow: "#c77d1a", red: "#c0392b" };

/**
 * Compact, refined-styled at-a-glance summary of a team's mentor support,
 * shown on the team overview page in place of the full MentorTeamPanel. Always
 * renders (so the page layout / TOC anchor is stable) and always links to the
 * dedicated /mentor page. Computes from fields the public get_team already
 * returns — no backend change.
 */
export default function TeamMentorSummaryCard({ team, eventId, teamId }) {
  const checklist = team?.mentor_checklist || {};
  const doneCount = MENTOR_COVERAGE_ITEMS.reduce(
    (acc, it) => acc + (checklist[it.slug]?.done ? 1 : 0),
    0
  );
  const openFlags = Number(team?.mentor_open_flag_count || 0);
  const lastTouchedAt = team?.mentor_last_touched_at;
  const lastTouchedBy = team?.mentor_last_touched_by_name;
  const ratingsByMentor = latestRatingsByMentor(team?.mentor_ratings);
  const hasAnyRating = Object.values(ratingsByMentor).some(
    (perMentor) => perMentor && Object.keys(perMentor).length > 0
  );
  const hasActivity = doneCount > 0 || openFlags > 0 || !!lastTouchedAt || hasAnyRating;

  const href = `/hack/${eventId}/team/${teamId}/mentor`;

  return (
    <Box
      className="ohx-card"
      sx={{
        p: { xs: 2, md: 2.5 },
        ...(openFlags > 0 ? { borderLeft: "3px solid var(--accent)" } : {}),
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: hasActivity ? 1.5 : 1 }}>
        <Box className="ohx-eyebrow">Mentor support</Box>
        <NextLink
          href={href}
          className="ohx-link"
          style={{ marginLeft: "auto", fontSize: "0.85rem" }}
        >
          Open mentor support →
        </NextLink>
      </Box>

      {hasActivity ? (
        <>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, alignItems: "center" }}>
            <span
              className={`ohx-tag${doneCount === MENTOR_COVERAGE_TOTAL ? " ohx-tag--accent" : ""}`}
            >
              {doneCount}/{MENTOR_COVERAGE_TOTAL} covered
            </span>
            {openFlags > 0 && (
              <span className="ohx-tag ohx-tag--accent">
                ⚑ {openFlags} open flag{openFlags === 1 ? "" : "s"}
              </span>
            )}
            {lastTouchedAt && (
              <span className="ohx-tag">
                Last touch {relativeTime(lastTouchedAt)}
                {lastTouchedBy ? ` · ${lastTouchedBy}` : ""}
              </span>
            )}
          </Box>

          {hasAnyRating && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 1.25, flexWrap: "wrap" }}>
              <Box
                sx={{
                  fontSize: "0.66rem",
                  color: "var(--faint)",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  fontWeight: 600,
                }}
              >
                Judging readiness
              </Box>
              <Box sx={{ display: "flex", gap: 0.4 }}>
                {JUDGING_CRITERIA.map((c) => {
                  const consensus = consensusForCriterion(ratingsByMentor[c.slug]);
                  const label = consensus
                    ? `${c.label}: ${SCORE_META[consensus].emoji} ${SCORE_META[consensus].label}`
                    : `${c.label}: not rated yet`;
                  return (
                    <Box
                      key={c.slug}
                      title={label}
                      aria-label={label}
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        bgcolor: consensus ? SCORE_DOT_COLORS[consensus] : "transparent",
                        border: "1px solid",
                        borderColor: consensus ? SCORE_DOT_COLORS[consensus] : "var(--line)",
                      }}
                    />
                  );
                })}
              </Box>
            </Box>
          )}
        </>
      ) : (
        <Box sx={{ color: "var(--muted)", fontSize: "0.92rem" }}>
          No mentor activity recorded yet.
        </Box>
      )}
    </Box>
  );
}
