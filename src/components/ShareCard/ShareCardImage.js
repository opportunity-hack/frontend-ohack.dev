// The share-card artwork, rendered server-side by satori (next/og) in
// src/pages/api/share-card/[event_id]/[type]/[volunteer_id].js.
//
// satori constraints (not React-DOM): every element with more than one child
// needs an explicit `display: "flex"`; only literal colors (no CSS vars); no
// MUI; images need width/height and must be data URIs or absolute URLs;
// fontFamily must match the names registered in the API route ("Display" =
// Fraunces, "Body" = Hanken Grotesk).
//
// Brand tokens mirror src/components/design/refined.js (paper / ink / navy /
// terracotta / hairline). Calm editorial, no gradients — the same look as
// the site, so the card reads as ours in a feed.

import React from "react";
import { ROLE_COPY, SHARE_FORMATS } from "../../lib/shareCard";

const PAPER = "#FBFAF6";
const SURFACE_2 = "#F4F1E9";
const INK = "#16181D";
const MUTED = "#5B6270";
const NAVY = "#1B3A6B";
const ACCENT = "#E2552E";
const LINE = "#E7E1D4";

const TAGLINE = "Free software for nonprofits, built in a weekend.";

function nameFontSize(name, base) {
  const n = (name || "").length;
  if (n <= 14) return base;
  if (n <= 20) return Math.round(base * 0.86);
  if (n <= 28) return Math.round(base * 0.72);
  return Math.round(base * 0.6);
}

const Photo = ({ src, initials, size }) => {
  const ring = Math.round(size * 0.025);
  if (src) {
    return (
      <div
        style={{
          display: "flex",
          width: size,
          height: size,
          borderRadius: "50%",
          border: `${ring}px solid ${PAPER}`,
          boxShadow: `0 0 0 1px ${LINE}`,
          overflow: "hidden",
        }}
      >
        <img
          src={src}
          width={size - ring * 2}
          height={size - ring * 2}
          style={{ objectFit: "cover", borderRadius: "50%" }}
        />
      </div>
    );
  }
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: "50%",
        background: NAVY,
        color: PAPER,
        fontFamily: "Display",
        fontWeight: 600,
        fontSize: Math.round(size * 0.38),
        letterSpacing: "-0.02em",
      }}
    >
      {initials || "OH"}
    </div>
  );
};

const RoleTag = ({ label, fontSize }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      background: ACCENT,
      color: "#fff",
      fontFamily: "Body",
      fontWeight: 600,
      fontSize,
      letterSpacing: "0.18em",
      textTransform: "uppercase",
      padding: `${Math.round(fontSize * 0.55)}px ${Math.round(fontSize * 1.1)}px`,
      borderRadius: 999,
    }}
  >
    {label}
  </div>
);

const Eyebrow = ({ children, fontSize }) => (
  <div
    style={{
      display: "flex",
      fontFamily: "Body",
      fontWeight: 600,
      fontSize,
      letterSpacing: "0.22em",
      textTransform: "uppercase",
      color: ACCENT,
    }}
  >
    {children}
  </div>
);

const Footer = ({ logo, fontSize, dates, location }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      borderTop: `1px solid ${LINE}`,
      paddingTop: Math.round(fontSize * 1.1),
      width: "100%",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: Math.round(fontSize * 0.7) }}>
      {logo && <img src={logo} width={Math.round(fontSize * 2)} height={Math.round(fontSize * 2)} />}
      <div style={{ display: "flex", fontFamily: "Body", fontWeight: 600, fontSize, color: INK }}>
        ohack.dev
      </div>
    </div>
    <div style={{ display: "flex", fontFamily: "Body", fontSize, color: MUTED }}>
      {[dates, location].filter(Boolean).join(" · ")}
    </div>
  </div>
);

/**
 * props: { format, name, initials, photo (data URI | null), logo (data URI |
 * null), type, eventTitle, dates, location, tense }
 */
export default function ShareCardImage({
  format = "og",
  name,
  initials,
  photo,
  logo,
  type,
  eventTitle,
  dates,
  location,
  tense = "present",
}) {
  const { width, height } = SHARE_FORMATS[format] || SHARE_FORMATS.og;
  const role = ROLE_COPY[type] || ROLE_COPY.volunteer;
  const roleLine = `${role.noun} · ${eventTitle}`;
  const verbLine = tense === "past" ? `${role.past} ${eventTitle}` : `${role.present} ${eventTitle}`;

  if (format === "og") {
    const pad = 64;
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width,
          height,
          background: PAPER,
          color: INK,
        }}
      >
        <div style={{ display: "flex", height: 6, width: "100%", background: ACCENT }} />
        <div style={{ display: "flex", flex: 1, padding: `${pad - 6}px ${pad}px ${pad - 16}px` }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              flex: 1,
              paddingRight: 48,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
              <Eyebrow fontSize={18}>Opportunity Hack</Eyebrow>
              <div
                style={{
                  display: "flex",
                  fontFamily: "Display",
                  fontWeight: 600,
                  fontSize: nameFontSize(name, 76),
                  lineHeight: 1.04,
                  letterSpacing: "-0.015em",
                  color: INK,
                  maxWidth: 700,
                }}
              >
                {name}
              </div>
              <div
                style={{
                  display: "flex",
                  fontFamily: "Display",
                  fontStyle: "italic",
                  fontWeight: 600,
                  fontSize: 30,
                  color: NAVY,
                  lineHeight: 1.2,
                }}
              >
                {verbLine}
              </div>
              <div style={{ display: "flex", fontFamily: "Body", fontSize: 21, color: MUTED }}>
                {TAGLINE}
              </div>
            </div>
            <Footer logo={logo} fontSize={18} dates={dates} location={location} />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 22,
              width: 340,
            }}
          >
            <Photo src={photo} initials={initials} size={300} />
            <RoleTag label={role.noun} fontSize={15} />
          </div>
        </div>
      </div>
    );
  }

  // square + story: stacked, centered
  const story = format === "story";
  const pad = story ? 96 : 72;
  const photoSize = story ? 520 : 380;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width,
        height,
        background: PAPER,
        color: INK,
      }}
    >
      <div style={{ display: "flex", height: 8, width: "100%", background: ACCENT }} />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          alignItems: "center",
          justifyContent: story ? "center" : "space-between",
          padding: `${pad}px ${pad}px ${pad - 20}px`,
          gap: story ? 44 : 0,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 28 }}>
          <Eyebrow fontSize={story ? 26 : 22}>Opportunity Hack</Eyebrow>
          <Photo src={photo} initials={initials} size={photoSize} />
          <RoleTag label={role.noun} fontSize={story ? 22 : 18} />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: 22,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              fontFamily: "Display",
              fontWeight: 600,
              fontSize: nameFontSize(name, story ? 96 : 84),
              lineHeight: 1.04,
              letterSpacing: "-0.015em",
              textAlign: "center",
              maxWidth: width - pad * 2,
            }}
          >
            {name}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              fontFamily: "Display",
              fontStyle: "italic",
              fontWeight: 600,
              fontSize: story ? 40 : 34,
              color: NAVY,
              textAlign: "center",
              lineHeight: 1.2,
              maxWidth: width - pad * 2,
            }}
          >
            {verbLine}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              fontFamily: "Body",
              fontSize: story ? 28 : 24,
              color: MUTED,
              textAlign: "center",
            }}
          >
            {TAGLINE}
          </div>
        </div>
        <div style={{ display: "flex", width: "100%", marginTop: story ? 40 : 0 }}>
          <Footer logo={logo} fontSize={story ? 24 : 20} dates={dates} location={location} />
        </div>
      </div>
    </div>
  );
}

export { roleLineFor };
function roleLineFor(type, eventTitle) {
  const role = ROLE_COPY[type] || ROLE_COPY.volunteer;
  return `${role.noun} · ${eventTitle}`;
}
