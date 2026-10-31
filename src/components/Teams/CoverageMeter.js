import React from "react";
import { coverageDetail } from "./mentorCoverage";

// One cell per coverage item, each filled in thirds (one third per mentor
// sign-off), so a team at "2 of 3 on every item" reads as mostly done instead
// of the all-or-nothing "0/6 covered" it used to show. Stale sign-offs
// (over MENTOR_COVERAGE_FRESH_HOURS old) draw as a faint segment after the
// solid fresh ones, so yesterday's checks are visible but clearly not
// counted. Inline styles with
// var(--x, fallback) so it renders the same inside and outside a RefinedRoot
// (event page cards, the mentor table, MUI chips, the team dashboard).
//
// Module-scope + presentational only: pass the `coverageSummary()` result.
const SIZES = {
  sm: { width: 8, height: 6, gap: 2 },
  md: { width: 14, height: 8, gap: 3 },
  lg: { width: null, height: 10, gap: 4 }, // cells flex to the container
};

export default function CoverageMeter({
  summary,
  size = "sm",
  className,
  style,
}) {
  if (!summary) return null;
  const dims = SIZES[size] || SIZES.sm;
  const fluid = dims.width == null;
  return (
    <span
      role="img"
      aria-label={`Mentor coverage: ${coverageDetail(summary)}`}
      className={className}
      style={{
        display: fluid ? "flex" : "inline-flex",
        alignItems: "center",
        gap: dims.gap,
        flexShrink: 0,
        width: fluid ? "100%" : undefined,
        verticalAlign: "middle",
        ...style,
      }}
    >
      {summary.items.map((it) => (
        <span
          key={it.slug}
          aria-hidden="true"
          title={
            `${it.label}: ${it.count} of ${it.target} mentors` +
            (it.stale > 0 ? ` · ${it.stale} stale` : "")
          }
          style={{
            position: "relative",
            display: "block",
            flex: fluid ? 1 : undefined,
            width: fluid ? undefined : dims.width,
            height: dims.height,
            borderRadius: 2,
            background: "var(--line, #E7E1D4)",
            overflow: "hidden",
          }}
        >
          {it.stale > 0 && (
            <span
              style={{
                position: "absolute",
                inset: 0,
                width: `${(Math.min(it.count + it.stale, it.target) / it.target) * 100}%`,
                background: "var(--brand, #1B3A6B)",
                opacity: 0.28,
              }}
            />
          )}
          <span
            style={{
              position: "absolute",
              inset: 0,
              width: `${(it.count / it.target) * 100}%`,
              background: it.covered
                ? "var(--success, #2F6E50)"
                : "var(--brand, #1B3A6B)",
              transition: "width 200ms ease-out",
            }}
          />
        </span>
      ))}
    </span>
  );
}
