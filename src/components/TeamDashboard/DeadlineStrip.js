import React, { useEffect, useRef } from "react";
import { Box } from "@mui/material";
import useCountdown from "../../hooks/use-countdown";
import { deadlineState } from "../../lib/teamDeliverables";
import { formatDualTimezone, getEventTimezone } from "../../lib/timezoneUtils";
import { trackEvent, EventCategory } from "../../lib/ga";
import { DEADLINE_FALLBACK_LABEL } from "./copy";

function pad2(n) {
  return String(n).padStart(2, "0");
}

/**
 * Sticky (on desktop) countdown to the submission deadline. Reserves a
 * fixed height + digit width so the tick doesn't cause layout shift.
 */
export default function DeadlineStrip({ deadlines, event, team }) {
  const viewedRef = useRef(false);

  const state = deadlineState({
    deadlines,
    endDate: event?.end_date,
    timezone: getEventTimezone(event),
    submissionStatus: team?.project_submission_status,
    submittedAt: team?.project_submitted_at,
  });
  const countdown = useCountdown(state.target?.toISOString());

  useEffect(() => {
    if (viewedRef.current) return;
    viewedRef.current = true;
    trackEvent({
      action: "team_deadline_strip_view",
      params: {
        event_category: EventCategory.ENGAGEMENT,
        event_label: state.kind,
      },
    });
  }, []);

  if (state.kind === "none") return null;

  const tz = getEventTimezone(event);
  const dual = state.target ? formatDualTimezone(state.target, tz) : null;

  let body;
  if (state.kind === "submitted") {
    const late = team?.project_submission_status === "late";
    body = (
      <span>
        Submitted ✓{" "}
        {team?.project_submitted_at && (
          <span style={{ color: "var(--muted)" }}>
            {new Date(team.project_submitted_at).toLocaleString("en-US", {
              timeZone: tz,
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </span>
        )}
        {late && (
          <span className="ohx-tag ohx-tag--accent" style={{ marginLeft: 8 }}>
            Late
          </span>
        )}
      </span>
    );
  } else if (state.kind === "closed") {
    body = <span>Submissions closed</span>;
  } else if (!countdown.mounted) {
    body = <span style={{ color: "var(--muted)" }}>—</span>;
  } else {
    const label =
      state.kind === "late_open"
        ? "Late submissions open until"
        : state.kind === "event_ends"
          ? DEADLINE_FALLBACK_LABEL + " in"
          : state.label;
    body = (
      <>
        <span>{label} </span>
        <span
          className="ohx-display"
          style={{
            minWidth: "9ch",
            display: "inline-block",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {countdown.days > 0 ? `${countdown.days}d ` : ""}
          {pad2(countdown.hours)}h {pad2(countdown.minutes)}m
        </span>
        {dual && (
          <span
            style={{
              color: "var(--muted)",
              marginLeft: 8,
              fontSize: "0.85rem",
            }}
          >
            · {dual.eventTime} {dual.eventAbbr}
            {!dual.isSameTimezone && ` (${dual.userTime} ${dual.userAbbr})`}
          </span>
        )}
      </>
    );
  }

  return (
    <Box
      className="ohx-card"
      role="status"
      sx={{
        minHeight: 64,
        display: "flex",
        alignItems: "center",
        px: { xs: 2, md: 3 },
        py: 1.5,
        mb: 3,
        borderLeft: `3px solid ${state.urgent ? "var(--accent, #E2552E)" : "var(--brand, #1B3A6B)"}`,
        position: { md: "sticky" },
        top: { md: 72 },
        zIndex: 2,
        bgcolor: "var(--paper, #fff)",
      }}
    >
      {body}
      <span
        aria-live="polite"
        className="sr-only"
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          overflow: "hidden",
        }}
      >
        {state.kind === "submitted"
          ? "Project submitted"
          : state.kind === "closed"
            ? "Submissions closed"
            : `${state.label} ${countdown.mounted ? `${countdown.days} days ${countdown.hours} hours` : ""}`}
      </span>
    </Box>
  );
}
