import React from "react";
import NextLink from "next/link";
import { trackEvent } from "../../lib/ga";
import { ROLE_COPY, SHARE_FORMATS, eventDisplayName, shareImagePath, sharePagePath } from "../../lib/shareCard";

/**
 * Compact "you're in — tell your network" card for surfaces that already
 * know the person is approved (application pages beside the check-in QR).
 * Thumbnail = the real og card; link = the share page with the kit open.
 * Inline styles with CSS-var fallbacks (works in or out of a RefinedRoot).
 */
export default function ShareCardPromo({ eventId, type, volunteerId, event, page, style }) {
  if (!eventId || !volunteerId || !ROLE_COPY[type]) return null;
  const { width, height } = SHARE_FORMATS.og;
  const role = ROLE_COPY[type];
  const eventName = eventDisplayName(event || { title: "" });
  return (
    <div
      style={{
        border: "1px solid var(--line, #E7E1D4)",
        borderRadius: 8,
        background: "var(--surface, #FFFFFF)",
        padding: 20,
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 20,
        ...style,
      }}
    >
      <div
        style={{
          flex: "0 0 220px",
          maxWidth: "100%",
          aspectRatio: `${width} / ${height}`,
          borderRadius: 6,
          overflow: "hidden",
          border: "1px solid var(--line, #E7E1D4)",
          background: "var(--surface-2, #F4F1E9)",
        }}
      >
        <img
          src={shareImagePath(eventId, type, volunteerId, "og")}
          alt={`Your ${role.noun.toLowerCase()} card for ${eventName}`}
          width={width}
          height={height}
          loading="lazy"
          style={{ width: "100%", height: "100%", display: "block" }}
        />
      </div>
      <div style={{ flex: "1 1 240px", display: "flex", flexDirection: "column", gap: 8 }}>
        <div
          style={{
            textTransform: "uppercase",
            letterSpacing: "0.22em",
            fontSize: "0.72rem",
            fontWeight: 600,
            color: "var(--muted, #5B6270)",
          }}
        >
          You're in — share the news
        </div>
        <div
          style={{
            fontFamily: "var(--display, Georgia, 'Times New Roman', serif)",
            fontSize: "1.25rem",
            color: "var(--ink, #16181D)",
            lineHeight: 1.2,
          }}
        >
          Tell your network you're {role.present} {eventName}
        </div>
        <div style={{ color: "var(--muted, #5B6270)", fontSize: "0.95rem", lineHeight: 1.5 }}>
          Your card, a ready caption and one-tap posting to LinkedIn, X or Instagram. Every share helps a nonprofit find more hands.
        </div>
        <div>
          <NextLink
            href={`${sharePagePath(eventId, type, volunteerId)}#kit`}
            onClick={() =>
              trackEvent({
                action: "share_card_promo_click",
                params: { event_label: type, event_id: eventId, page: page || "application" },
              })
            }
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5em",
              background: "var(--brand, #1B3A6B)",
              color: "#fff",
              fontWeight: 600,
              fontSize: "0.95rem",
              lineHeight: 1,
              padding: "0.85em 1.3em",
              borderRadius: 4,
              textDecoration: "none",
              marginTop: 4,
            }}
          >
            Get your share card →
          </NextLink>
        </div>
      </div>
    </div>
  );
}
