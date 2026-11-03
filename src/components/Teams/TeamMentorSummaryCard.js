import React from "react";
import NextLink from "next/link";
import { Box } from "@mui/material";
import {
  coverageSummary,
  coverageLabel,
  coverageDetail,
  JUDGING_CRITERIA,
  SCORE_META,
  latestRatingsByMentor,
  blendedRating,
  newestRating,
  ratingBlendSummary,
  relativeTime,
  splitMentorFlags,
} from "./mentorCoverage";
import CoverageMeter from "./CoverageMeter";
import useCoverageNow from "../../hooks/use-coverage-now";

// Refined-token consensus dot colors (calmer than the loud MUI palette ones
// used on the event-list version) — keeps the team page on-brand. Exported
// so the team dashboard's MentorSupportCard renders the identical dots
// (Part 3: "Judging readiness / coverage / flags render IDENTICALLY
// everywhere").
export const SCORE_DOT_COLORS = {
  green: "#3a7d44",
  yellow: "#c77d1a",
  red: "#c0392b",
};

/**
 * Compact, refined-styled at-a-glance summary of a team's mentor support,
 * shown on the team overview page in place of the full MentorTeamPanel. Always
 * renders (so the page layout / TOC anchor is stable) and always links to the
 * dedicated /mentor page. Computes from fields the public get_team already
 * returns — no backend change.
 */
export default function TeamMentorSummaryCard({
  team,
  eventId,
  teamId,
  event,
}) {
  const checklist = team?.mentor_checklist || {};
  // Sign-offs over 5h old drop out of the headline (frozen at event end).
  const coverageNow = useCoverageNow({
    endDate: event?.end_date,
    timezone: event?.timezone,
  });
  const coverage = coverageSummary(checklist, { now: coverageNow });
  const openFlags = Number(team?.mentor_open_flag_count || 0);
  const resolvedFlags = splitMentorFlags(team?.mentor_flags).resolved.length;
  const lastTouchedAt = team?.mentor_last_touched_at;
  const lastTouchedBy = team?.mentor_last_touched_by_name;
  const ratingsByMentor = latestRatingsByMentor(team?.mentor_ratings);
  const hasAnyRating = Object.values(ratingsByMentor).some(
    (perMentor) => perMentor && Object.keys(perMentor).length > 0,
  );
  // Newest counted rating across the five criteria — shown beside the dots
  // so the reader knows how fresh the picture is (#412).
  const newest = newestRating(ratingsByMentor);
  const hasActivity =
    coverage.signoffs > 0 ||
    coverage.staleSignoffs > 0 ||
    openFlags > 0 ||
    resolvedFlags > 0 ||
    !!lastTouchedAt ||
    hasAnyRating;
  const isHeadsDown = team?.mentor_help_wanted === false;

  const href = `/hack/${eventId}/team/${teamId}/mentor`;

  return (
    <Box
      className="ohx-card"
      sx={{
        p: { xs: 2, md: 2.5 },
        ...(openFlags > 0 ? { borderLeft: "3px solid var(--accent)" } : {}),
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: hasActivity ? 1.5 : 1,
        }}
      >
        <Box className="ohx-eyebrow">Mentor support</Box>
        <NextLink
          href={href}
          className="ohx-link"
          style={{ marginLeft: "auto", fontSize: "0.85rem" }}
        >
          Open mentor support →
        </NextLink>
      </Box>

      {isHeadsDown && (
        <Box
          sx={{
            color: "var(--muted)",
            fontSize: "0.88rem",
            mb: hasActivity ? 1 : 0,
          }}
        >
          Heads-down — team asked mentors to hold off.
        </Box>
      )}

      {hasActivity ? (
        <>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
              alignItems: "center",
            }}
          >
            <span
              className={`ohx-tag${coverage.complete ? " ohx-tag--accent" : ""}`}
              title={coverageDetail(coverage)}
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <CoverageMeter summary={coverage} size="sm" />
              {coverageLabel(coverage)}
            </span>
            {openFlags > 0 && (
              <span className="ohx-tag ohx-tag--accent">
                ⚑ {openFlags} open flag{openFlags === 1 ? "" : "s"}
              </span>
            )}
            {resolvedFlags > 0 && (
              <span className="ohx-tag">✓ {resolvedFlags} resolved</span>
            )}
            {lastTouchedAt && (
              <span className="ohx-tag">
                Last touch {relativeTime(lastTouchedAt)}
                {lastTouchedBy ? ` · ${lastTouchedBy}` : ""}
              </span>
            )}
          </Box>

          {hasAnyRating && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.75,
                mt: 1.25,
                flexWrap: "wrap",
              }}
            >
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
                  // Current = recency-weighted blend of each mentor's
                  // latest rating, rounded to the closest score (#412).
                  const blend = blendedRating(ratingsByMentor[c.slug]);
                  const consensus = blend ? blend.score : null;
                  const label = blend
                    ? `${c.label}: ${SCORE_META[consensus].emoji} ${SCORE_META[consensus].label} · ${ratingBlendSummary(blend)}`
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
                        bgcolor: consensus
                          ? SCORE_DOT_COLORS[consensus]
                          : "transparent",
                        border: "1px solid",
                        borderColor: consensus
                          ? SCORE_DOT_COLORS[consensus]
                          : "var(--line)",
                      }}
                    />
                  );
                })}
              </Box>
              {newest && (
                <Box sx={{ fontSize: "0.78rem", color: "var(--faint)" }}>
                  latest {relativeTime(newest.rated_at)}
                </Box>
              )}
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
