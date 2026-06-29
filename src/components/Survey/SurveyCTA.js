import React, { useEffect, useState } from "react";
import NextLink from "next/link";
import { parseLocalDate, isHackathonExpired } from "../../lib/dateUtils";

/**
 * Discoverability CTA linking to the event feedback survey
 * (/hack/[event_id]/survey). Renders only once the event has started
 * (i.e. live OR ended) — hidden for upcoming events.
 *
 * Self-contained inline styles with CSS-var fallbacks (var(--x, #hex)) so it
 * looks right both inside a RefinedRoot and on plain pages. Time-dependent
 * visibility is gated on mount to avoid SSR/ISR hydration mismatches.
 */
function eventHasStarted(startDate) {
  if (!startDate) return true; // no date → treat as open (matches backend default)
  const d = parseLocalDate(startDate);
  if (isNaN(d.getTime())) return true;
  return Date.now() >= d.getTime();
}

export default function SurveyCTA({ eventId, startDate, endDate, timezone, style }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!eventId || !mounted || !eventHasStarted(startDate)) return null;

  const ended = endDate ? isHackathonExpired(endDate, timezone) : false;
  const eyebrow = ended ? "Post-event survey" : "Live check-in";
  const heading = ended ? "How was the event?" : "How's it going?";
  const sub = ended
    ? "Tell us how it went — your feedback shapes the next event. Takes ~2 minutes."
    : "A quick pulse-check while things are live so we can fix issues in real time.";

  return (
    <div
      role="complementary"
      aria-label="Share event feedback"
      style={{
        margin: "16px 0",
        padding: "20px 24px",
        border: "1px solid var(--line, #E7E1D4)",
        borderRadius: 8,
        background: "var(--surface-2, #F4F1E9)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 16,
        ...style,
      }}
    >
      <div style={{ minWidth: 220 }}>
        <div
          style={{
            textTransform: "uppercase",
            letterSpacing: "0.22em",
            fontSize: "0.72rem",
            fontWeight: 600,
            color: "var(--muted, #5B6270)",
          }}
        >
          {eyebrow}
        </div>
        <div
          style={{
            fontFamily: "var(--display, Georgia, 'Times New Roman', serif)",
            fontSize: "1.3rem",
            fontWeight: 500,
            color: "var(--ink, #16181D)",
            marginTop: 2,
          }}
        >
          {heading}
        </div>
        <div style={{ color: "var(--muted, #5B6270)", fontSize: "0.95rem", marginTop: 4 }}>
          {sub}
        </div>
      </div>
      <NextLink
        href={`/hack/${eventId}/survey`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5em",
          background: "var(--brand, #1B3A6B)",
          color: "#fff",
          fontWeight: 600,
          fontSize: "1rem",
          lineHeight: 1,
          padding: "0.85em 1.4em",
          borderRadius: 4,
          textDecoration: "none",
          whiteSpace: "nowrap",
        }}
      >
        Share feedback →
      </NextLink>
    </div>
  );
}
