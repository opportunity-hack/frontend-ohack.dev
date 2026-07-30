import Tooltip from "@mui/material/Tooltip";
import PauseCircleOutlineIcon from "@mui/icons-material/PauseCircleOutline";
import {
  PROJECT_LADDER,
  PAUSED_STATUS,
  ladderIndex,
  isPausedStatus,
} from "../../lib/projectStatus";

// Refined status rail for the project page header. Renders the five-stage
// build journey as a quiet stepper (done → current → upcoming) plus a visible
// one-line explanation of the current stage — tooltips alone were too easy to
// miss, especially on touch. `paused` is not a rung: the whole rail mutes and
// the caption explains that work is on hold.
//
// Only ever rendered inside a <RefinedRoot> (via ProblemStatement), so refined
// CSS vars are available without fallbacks.

const DOT = {
  width: 9,
  height: 9,
  borderRadius: "50%",
  flexShrink: 0,
  boxSizing: "border-box",
};

export default function ProjectProgress({ state }) {
  const paused = isPausedStatus(state);
  const currentIndex = paused ? -1 : ladderIndex(state);
  const currentMeta = paused
    ? PAUSED_STATUS
    : PROJECT_LADDER[currentIndex] || null;

  return (
    <div>
      <div style={{ overflowX: "auto" }}>
        <ol
          aria-label="Project progress"
          style={{
            display: "flex",
            alignItems: "center",
            listStyle: "none",
            margin: 0,
            padding: "2px 0",
            minWidth: 480,
          }}
        >
          {PROJECT_LADDER.map((stage, i) => {
            const done = currentIndex > i;
            const current = currentIndex === i;
            const last = i === PROJECT_LADDER.length - 1;

            return (
              <li
                key={stage.value}
                style={{
                  display: "flex",
                  alignItems: "center",
                  flex: last ? "0 0 auto" : "1 1 auto",
                }}
              >
                <Tooltip
                  enterTouchDelay={0}
                  arrow
                  title={
                    <span style={{ fontSize: "14px" }}>
                      {stage.label}: {stage.description}
                    </span>
                  }
                >
                  <span
                    aria-current={current ? "step" : undefined}
                    style={
                      current
                        ? {
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "4px 12px",
                            borderRadius: 999,
                            background: "var(--brand)",
                            color: "#fff",
                            fontSize: "0.78rem",
                            fontWeight: 600,
                            letterSpacing: "0.01em",
                            whiteSpace: "nowrap",
                            cursor: "default",
                          }
                        : {
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            fontSize: "0.78rem",
                            whiteSpace: "nowrap",
                            color: done ? "var(--ink)" : "var(--muted)",
                            opacity: paused ? 0.75 : 1,
                            cursor: "default",
                          }
                    }
                  >
                    <span
                      aria-hidden="true"
                      style={{
                        ...DOT,
                        ...(current
                          ? { background: "#fff" }
                          : done
                          ? { background: "var(--brand)" }
                          : {
                              background: "var(--surface)",
                              border: "1.5px solid var(--line)",
                            }),
                      }}
                    />
                    {stage.label}
                  </span>
                </Tooltip>
                {!last && (
                  <span
                    aria-hidden="true"
                    style={{
                      flex: "1 1 auto",
                      height: 1,
                      minWidth: 12,
                      margin: "0 8px",
                      background: done ? "var(--brand)" : "var(--line)",
                      opacity: done && !paused ? 0.5 : 1,
                    }}
                  />
                )}
              </li>
            );
          })}
        </ol>
      </div>

      {currentMeta && (
        <p
          style={{
            margin: "10px 0 0",
            fontSize: "0.85rem",
            lineHeight: 1.55,
            color: "var(--muted)",
            maxWidth: "68ch",
          }}
        >
          <strong
            style={{
              color: "var(--ink)",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            {paused && (
              <PauseCircleOutlineIcon
                sx={{ fontSize: 15, verticalAlign: "middle" }}
              />
            )}
            {currentMeta.label}
          </strong>
          {" — "}
          {currentMeta.description}
        </p>
      )}
    </div>
  );
}
