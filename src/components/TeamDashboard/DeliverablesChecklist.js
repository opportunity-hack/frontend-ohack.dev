import React from "react";
import { Box, LinearProgress } from "@mui/material";
import DashboardSection from "./DashboardSection";
import { DELIVERABLES_TITLE, DELIVERABLES_LEAD } from "./copy";

const ICONS = {
  done: "✓",
  todo: "→",
  pending: "…",
  locked: "🔒",
  optional: "·",
};

function Row({
  item,
  onSlackConfirmChange,
  slackConfirmed,
  isSubmitRow,
  onSubmitClick,
  submitting,
}) {
  const isDone = item.state === "done";
  const isLocked = item.state === "locked";

  return (
    <li
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "10px 0",
        borderBottom: "1px solid var(--line, #E7E1D4)",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          minWidth: 22,
          textAlign: "center",
          color: isDone
            ? "var(--success, #2F6E50)"
            : isLocked
              ? "var(--faint)"
              : "var(--muted)",
          fontWeight: 600,
        }}
      >
        {ICONS[item.state]}
      </span>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box
          sx={{
            fontWeight: isDone ? 400 : 500,
            color: isDone ? "var(--muted)" : "var(--ink)",
          }}
        >
          {item.label}
        </Box>
        {item.hint && (
          <Box sx={{ fontSize: "0.85rem", color: "var(--faint)", mt: 0.25 }}>
            {item.hint}
          </Box>
        )}
        {item.key === "slack" && (
          <label
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              marginTop: 6,
              fontSize: "0.9rem",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={!!slackConfirmed}
              onChange={(e) => onSlackConfirmChange?.(e.target.checked)}
            />
            Everyone&apos;s in
          </label>
        )}
      </Box>
      {isSubmitRow ? (
        <button
          type="button"
          className="ohx-btn ohx-btn--primary"
          disabled={isLocked || isDone || submitting}
          onClick={onSubmitClick}
          style={{ whiteSpace: "nowrap" }}
        >
          {isDone ? "Submitted" : submitting ? "Submitting…" : "Submit project"}
        </button>
      ) : (
        !isDone &&
        item.state !== "optional" &&
        !isLocked && (
          <a
            href={item.href}
            className="ohx-link"
            style={{ whiteSpace: "nowrap", fontSize: "0.9rem" }}
          >
            Go →
          </a>
        )
      )}
    </li>
  );
}

/**
 * "What your team owes" — the dashboard's primary checklist. The Submit
 * button here is the ONE `.ohx-btn--primary` for the whole section
 * (`onSubmit` opens the confirm dialog owned by `ProjectWriteupEditor`).
 *
 * `containerRef` is observed by `useGithubActivity` (via `TeamDashboard`)
 * so the "Push code to your repo" row's GitHub check fires as soon as the
 * checklist is on screen, not only when the Code activity card is.
 */
export default function DeliverablesChecklist({
  deliverables,
  slackConfirmed,
  onSlackConfirmChange,
  onSubmit,
  submitting,
  containerRef,
}) {
  const { items, done, total } = deliverables;

  return (
    <Box ref={containerRef}>
      <DashboardSection
        id="deliverables"
        eyebrow="Your checklist"
        title={DELIVERABLES_TITLE}
      >
        <Box sx={{ color: "var(--muted)", mb: 2 }}>{DELIVERABLES_LEAD}</Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
          <LinearProgress
            variant="determinate"
            value={total ? (done / total) * 100 : 0}
            sx={{
              flex: 1,
              height: 6,
              borderRadius: 3,
              bgcolor: "var(--line, #E7E1D4)",
              "& .MuiLinearProgress-bar": { bgcolor: "var(--brand, #1B3A6B)" },
            }}
          />
          <span
            style={{
              fontSize: "0.85rem",
              color: "var(--muted)",
              whiteSpace: "nowrap",
            }}
          >
            {done} of {total} done
          </span>
        </Box>
        <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {items.map((item) => (
            <Row
              key={item.key}
              item={item}
              slackConfirmed={slackConfirmed}
              onSlackConfirmChange={onSlackConfirmChange}
              isSubmitRow={item.key === "submit"}
              onSubmitClick={onSubmit}
              submitting={submitting}
            />
          ))}
        </ol>
      </DashboardSection>
    </Box>
  );
}
