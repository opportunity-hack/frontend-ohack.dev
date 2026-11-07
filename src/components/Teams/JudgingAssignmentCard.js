import React, { useEffect, useRef } from "react";
import NextLink from "next/link";
import useJudgingSchedule from "../../hooks/use-judging-schedule";
import {
  ROUND_LABELS,
  findTeamAssignments,
  formatDemoTime,
} from "../../lib/judgingSchedule";

/**
 * "Your judging" — which panel/room a team is judged in, by whom, and (for
 * the final round) when. Used on the team dashboard and the public team
 * page. Renders NOTHING unless the schedule is published and the team is
 * on a panel, so older backends (404) and unassigned teams see no change.
 *
 * Inline `var(--x, fallback)` styles: works inside and outside a
 * RefinedRoot.
 *
 * Pass `schedule` when the parent already reads it (avoids a second hook);
 * otherwise the card fetches it itself. `onAvailabilityChange(bool)` lets a
 * parent add a TOC entry once there is something to show.
 */
export default function JudgingAssignmentCard({
  eventId,
  teamId,
  eventTimezone,
  schedule: scheduleProp,
  heading = "Your judging",
  headingLevel = "h2",
  onAvailabilityChange,
  id,
}) {
  const own = useJudgingSchedule(eventId, {
    enabled: scheduleProp === undefined,
  });
  const schedule = scheduleProp === undefined ? own.schedule : scheduleProp;
  const assignments = findTeamAssignments(schedule, teamId);
  const hasAssignments = assignments.length > 0;

  const lastReported = useRef(null);
  useEffect(() => {
    if (!onAvailabilityChange || lastReported.current === hasAssignments)
      return;
    lastReported.current = hasAssignments;
    onAvailabilityChange(hasAssignments);
  }, [hasAssignments, onAvailabilityChange]);

  if (!hasAssignments) return null;

  const Heading = headingLevel;
  const scheduleHref = `/hack/${encodeURIComponent(eventId)}/judging`;

  return (
    <section
      id={id}
      aria-label={heading}
      className="ohx-card"
      style={{
        padding: "18px 22px",
        marginBottom: 24,
        border: "1px solid var(--line, #E7E1D4)",
        borderLeft: "3px solid var(--accent, #E2552E)",
        borderRadius: 10,
        background: "var(--surface, #fff)",
        fontFamily: "var(--body, inherit)",
        color: "var(--ink, #16181D)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <Heading
          style={{
            margin: 0,
            fontFamily: "var(--display, inherit)",
            fontSize: 22,
            fontWeight: 600,
            lineHeight: 1.2,
          }}
        >
          {heading}
        </Heading>
        <NextLink
          href={scheduleHref}
          style={{
            color: "var(--brand, #1B3A6B)",
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          Full schedule →
        </NextLink>
      </div>
      <ul style={{ listStyle: "none", margin: "12px 0 0", padding: 0 }}>
        {assignments.map((a) => {
          const demo =
            a.round === "round2" ? formatDemoTime(a.demo_time, eventTimezone) : null;
          const judges = a.judges.map((j) => j.name).filter(Boolean);
          return (
            <li
              key={`${a.round}-${a.panel_id}`}
              style={{ padding: "8px 0", borderTop: "1px solid var(--line, #E7E1D4)" }}
            >
              <div style={{ fontWeight: 600, fontSize: 16 }}>
                {ROUND_LABELS[a.round]} · {a.panel_name}
                {a.room ? (
                  <span style={{ color: "var(--accent, #E2552E)" }}>
                    {" "}
                    · {a.room}
                  </span>
                ) : null}
                {demo ? ` · Demo at ${demo}` : ""}
              </div>
              <div style={{ color: "var(--muted, #5B6270)", fontSize: 14.5, marginTop: 2 }}>
                {judges.length > 0
                  ? `Judges: ${judges.join(", ")}`
                  : "Judges will be listed once they're assigned."}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
