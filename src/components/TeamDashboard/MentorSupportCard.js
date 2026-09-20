import React from "react";
import { Box } from "@mui/material";
import DashboardSection from "./DashboardSection";
import MentorAvailabilityToggle from "./MentorAvailabilityToggle";
import { SCORE_DOT_COLORS } from "../Teams/TeamMentorSummaryCard";
import {
  MENTOR_COVERAGE_ITEMS,
  JUDGING_CRITERIA,
  SCORE_META,
  coverageItemCovered,
  latestRatingsByMentor,
  consensusForCriterion,
  relativeTime,
} from "../Teams/mentorCoverage";
import { MENTORS_TITLE } from "./copy";

/**
 * Team-facing view of mentor coordination: coverage checklist, judging
 * readiness dots, open flags, and the latest notes — read-only mirror of
 * the mentor-facing `MentorTeamPanel`, computed from the same team fields
 * (Part 3: no backend change).
 */
export default function MentorSupportCard({
  team,
  eventId,
  accessToken,
  onTeamUpdated,
}) {
  const checklist = team?.mentor_checklist || {};
  const ratingsByMentor = latestRatingsByMentor(team?.mentor_ratings);
  const notes = (
    Array.isArray(team?.mentor_notes) ? [...team.mentor_notes] : []
  )
    .filter((n) => !n.deleted_at)
    .reverse()
    .slice(0, 5);
  const openFlags = (
    Array.isArray(team?.mentor_flags) ? team.mentor_flags : []
  ).filter((f) => !f.resolved_at);

  return (
    <DashboardSection
      id="mentors"
      eyebrow="They're rooting for you"
      title={MENTORS_TITLE}
    >
      <MentorAvailabilityToggle
        team={team}
        accessToken={accessToken}
        onTeamUpdated={onTeamUpdated}
      />

      <Box sx={{ fontWeight: 600, mb: 1 }}>What mentors check with you</Box>
      <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, mb: 3 }}>
        {MENTOR_COVERAGE_ITEMS.map((item) => {
          const done = coverageItemCovered(checklist[item.slug]);
          return (
            <li
              key={item.slug}
              style={{
                display: "flex",
                gap: 8,
                padding: "4px 0",
                fontSize: "0.92rem",
              }}
            >
              <span style={{ color: done ? "#2f6e50" : "var(--faint)" }}>
                {done ? "✓" : "○"}
              </span>
              <span style={{ color: done ? "var(--muted)" : "var(--ink)" }}>
                {item.label}
              </span>
            </li>
          );
        })}
      </Box>

      <Box sx={{ fontWeight: 600, mb: 1 }}>Judging readiness</Box>
      <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, mb: 3 }}>
        {JUDGING_CRITERIA.map((c) => {
          const consensus = consensusForCriterion(ratingsByMentor[c.slug]);
          return (
            <li
              key={c.slug}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "4px 0",
                fontSize: "0.92rem",
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  flexShrink: 0,
                  background: consensus
                    ? SCORE_DOT_COLORS[consensus]
                    : "transparent",
                  border: `1px solid ${consensus ? SCORE_DOT_COLORS[consensus] : "var(--line)"}`,
                }}
              />
              <strong>{c.label}:</strong>
              <span style={{ color: "var(--muted)" }}>
                {consensus ? SCORE_META[consensus].label : "Not rated yet"} —{" "}
                {c.blurb}
              </span>
            </li>
          );
        })}
      </Box>
      <a
        href="/hackathon-judging-criteria"
        className="ohx-link"
        style={{
          fontSize: "0.85rem",
          display: "inline-block",
          marginBottom: 24,
        }}
      >
        What judges look for →
      </a>

      {openFlags.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ fontWeight: 600, mb: 1 }}>Open flags</Box>
          {openFlags.map((flag, i) => (
            <Box
              key={i}
              sx={{ display: "flex", gap: 1, alignItems: "flex-start", mb: 1 }}
            >
              <span className="ohx-tag ohx-tag--accent">
                {flag.severity === "blocked" ? "Blocked" : "Needs attention"}
              </span>
              <span style={{ fontSize: "0.9rem" }}>{flag.body}</span>
            </Box>
          ))}
        </Box>
      )}

      <Box sx={{ mb: 2 }}>
        <Box sx={{ fontWeight: 600, mb: 1 }}>Notes from mentors</Box>
        {notes.length === 0 ? (
          <Box sx={{ color: "var(--muted)", fontSize: "0.9rem" }}>
            No notes yet — mentors usually drop in within the first few hours.
          </Box>
        ) : (
          notes.map((note, i) => (
            <Box key={i} sx={{ mb: 1.25, fontSize: "0.9rem" }}>
              <Box sx={{ color: "var(--faint)", fontSize: "0.78rem" }}>
                {note.author_name || "A mentor"} ·{" "}
                {relativeTime(note.created_at)}
              </Box>
              <Box>{note.body}</Box>
            </Box>
          ))
        )}
      </Box>

      <a href={`/hack/${eventId}/team/${team?.id}/mentor`} className="ohx-link">
        Full mentor view →
      </a>
    </DashboardSection>
  );
}
