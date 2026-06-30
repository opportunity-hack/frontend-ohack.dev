import React from "react";

// Refined navy progress ring for the live volunteering session.
// Self-contained with CSS-var fallbacks so it renders correctly inside a
// <RefinedRoot> (navy + warm hairline) and on plain surfaces alike.
//
// The ring FILLS as elapsed time grows toward the committed total. The headline
// is the time volunteered so far (actual time) — that's what we want people to
// watch — with the remaining time as a quiet caption underneath.

const formatTime = (seconds) => {
  const s = Math.max(0, Math.floor(seconds || 0));
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

const FunVolunteerTimer = ({ timeLeft, totalTime }) => {
  const total = totalTime > 0 ? totalTime : 1;
  const elapsed = Math.min(total, Math.max(0, total - timeLeft));
  const pct = Math.min(100, Math.max(0, (elapsed / total) * 100));
  const isComplete = timeLeft <= 0;

  const brand = "var(--brand, #1B3A6B)";
  const track = "var(--line, #E7E1D4)";

  return (
    <div
      style={{
        position: "relative",
        width: 220,
        height: 220,
        margin: "8px auto 0",
      }}
      role="timer"
      aria-label={`${formatTime(elapsed)} volunteered of ${formatTime(total)} committed`}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: `conic-gradient(${brand} ${pct}%, ${track} ${pct}%)`,
          transition: "background 0.6s ease",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: "11%",
          borderRadius: "50%",
          background: "var(--surface, #ffffff)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
        }}
      >
        <span
          className="ohx-eyebrow"
          style={{ letterSpacing: "0.16em", fontSize: "0.6rem" }}
        >
          {isComplete ? "Complete" : "Volunteered"}
        </span>
        <span
          className="ohx-display"
          style={{
            fontSize: "2.1rem",
            fontWeight: 500,
            color: brand,
            lineHeight: 1.05,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {formatTime(elapsed)}
        </span>
        <span
          style={{
            fontSize: "0.78rem",
            color: "var(--muted, #5B6270)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {isComplete ? "Goal reached 🎉" : `${formatTime(timeLeft)} left`}
        </span>
      </div>
    </div>
  );
};

export default FunVolunteerTimer;
