import React from "react";
import NextLink from "next/link";
import { trackEvent } from "../../lib/ga";
import { ROLE_COPY, eventDisplayName, sharePagePath } from "../../lib/shareCard";

/**
 * "You're on the roster — tell your network" band for the event page.
 * Renders one row per role the logged-in viewer is SELECTED for (from
 * useMyEventRoles; the page calls the hook once and passes `roles` so the
 * roster "You" tag reuses the same request). Nothing renders when logged
 * out, when the person holds no selected role, or when the backend lacks the
 * route (`available: false`).
 *
 * SurveyCTA pattern: inline styles with CSS-var fallbacks so it looks right
 * in or out of a RefinedRoot.
 */
export default function RosterShareBand({ event, roles = [], tense = "present", style }) {
  const eventId = event?.event_id;
  const rows = roles.filter((r) => r && r.isSelected && r.id && ROLE_COPY[r.type]);
  if (!eventId || !rows.length) return null;
  const eventName = eventDisplayName(event);

  return (
    <div
      role="complementary"
      aria-label="Share that you're taking part"
      style={{
        margin: "16px 0",
        padding: "20px 24px",
        border: "1px solid var(--line, #E7E1D4)",
        borderLeft: "4px solid var(--accent, #E2552E)",
        borderRadius: 8,
        background: "var(--surface-2, #F4F1E9)",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        ...style,
      }}
    >
      {rows.map((r) => {
        const role = ROLE_COPY[r.type];
        const verb = tense === "past" ? role.past : role.present;
        return (
          <div
            key={`${r.type}-${r.id}`}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 16,
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
                You're on the roster
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
                Tell your network you're {verb} {eventName}
              </div>
              <div style={{ color: "var(--muted, #5B6270)", fontSize: "0.95rem", marginTop: 4 }}>
                A branded card with your photo, a ready-to-post caption and one-tap sharing. Takes a minute.
              </div>
            </div>
            <NextLink
              href={`${sharePagePath(eventId, r.type, r.id)}#kit`}
              onClick={() =>
                trackEvent({
                  action: "share_card_band_click",
                  params: { event_label: r.type, event_id: eventId, page: "hackathon_event" },
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
              Get your share card →
            </NextLink>
          </div>
        );
      })}
    </div>
  );
}
