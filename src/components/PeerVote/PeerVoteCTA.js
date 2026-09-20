import React, { useEffect, useState } from "react";
import NextLink from "next/link";
import { deriveVoteWindow } from "./peerVoteState";
import { trackEvent } from "../../lib/ga";

/**
 * Discoverability CTA linking to the Hackers' Choice vote
 * (/hack/[event_id]/vote). Renders only once voting is open, or opening
 * within the next 24 hours — hidden otherwise (disabled, unscheduled,
 * still far out, or already closed).
 *
 * Clone of `Survey/SurveyCTA.js`: self-contained inline styles with
 * CSS-var fallbacks (var(--x, #hex)) so it looks right both inside a
 * RefinedRoot and on plain pages, and visibility is gated on mount to
 * avoid an SSR/ISR hydration mismatch on time-dependent content.
 */
const OPENING_SOON_MS = 24 * 60 * 60 * 1000;

export default function PeerVoteCTA({
  eventId,
  deadlines,
  constraints,
  variant = "event",
  style,
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!eventId || !mounted) return null;

  const now = Date.now();
  const status = deriveVoteWindow(deadlines, constraints, now);

  const opensAtIso =
    deadlines?.voting_opens ||
    deadlines?.late_submission_until ||
    deadlines?.submission ||
    null;
  const opensSoon =
    status === "upcoming" &&
    opensAtIso &&
    Date.parse(opensAtIso) - now <= OPENING_SOON_MS;

  if (status !== "open" && !opensSoon) return null;

  const isDashboard = variant === "dashboard";
  const eyebrow = "Hackers' Choice";
  const heading =
    status === "open" ? "Vote for Hackers' Choice" : "Voting opens soon";
  const sub =
    status === "open"
      ? isDashboard
        ? "Cast your ballot — pick a couple of projects you'd be proud to have built."
        : "Hackers who registered for this event get a personal slate of projects to review. Takes about a minute."
      : "Hackers' Choice voting opens within the next day — check back to pick your favorites.";

  return (
    <div
      role="complementary"
      aria-label="Hackers' Choice peer vote"
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
        <div
          style={{
            color: "var(--muted, #5B6270)",
            fontSize: "0.95rem",
            marginTop: 4,
          }}
        >
          {sub}
        </div>
      </div>
      <NextLink
        href={`/hack/${eventId}/vote`}
        onClick={() =>
          trackEvent({
            action: "peer_vote_cta_click",
            params: { event_label: variant, event_id: eventId },
          })
        }
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
        {status === "open" ? "Vote now →" : "Learn more →"}
      </NextLink>
    </div>
  );
}
