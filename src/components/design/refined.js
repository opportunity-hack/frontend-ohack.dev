// Shared "civic editorial" design scope for the reimagined landing + projects
// pages. The brief was that the previous design felt "too busy" — so this
// module trades the multi-gradient, multi-chip, equal-weight layout for a calm,
// confident, magazine-like system: warm paper, a single deep-navy brand anchor,
// one terracotta accent used sparingly, a Fraunces / Hanken Grotesk type pairing,
// hairline rules, and a single orchestrated load animation.
//
// Everything is scoped under <RefinedRoot> so it never leaks into the rest of
// the app (which keeps its global MUI theme). Fonts are injected per-page via
// <RefinedFonts /> inside next/head with preconnect + display=swap.

import React from "react";
import { styled } from "@mui/material/styles";

// --- Font <link>s for the page <Head>. Preconnect keeps the swap cheap. ---
export const RefinedFonts = () => (
  <>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link
      rel="preconnect"
      href="https://fonts.gstatic.com"
      crossOrigin="anonymous"
    />
    <link
      href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400&family=Hanken+Grotesk:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />
  </>
);

// The scoped design system. All visual decisions live here as CSS variables +
// utility classNames so the page markup stays semantic and quiet.
export const RefinedRoot = styled("main")(({ theme }) => ({
  // --- Tokens ---
  "--paper": "#FBFAF6", // warm off-white page
  "--surface": "#FFFFFF",
  "--surface-2": "#F4F1E9", // sunken warm band
  "--ink": "#16181D", // near-black, warm
  "--muted": "#5B6270", // slate for secondary text
  "--faint": "#8A8F9A",
  "--line": "#E7E1D4", // warm hairline
  "--brand": "#1B3A6B", // deepened OHack navy
  "--brand-ink": "#0E2547", // darker navy for hovers
  "--accent": "#E2552E", // terracotta — the "social good" highlight
  "--accent-soft": "#FBE9E2",
  "--display": "'Fraunces', Georgia, 'Times New Roman', serif",
  "--body": "'Hanken Grotesk', system-ui, -apple-system, sans-serif",

  position: "relative",
  width: "100%",
  minHeight: "100vh",
  backgroundColor: "var(--paper)",
  color: "var(--ink)",
  fontFamily: "var(--body)",
  fontSize: "17px",
  lineHeight: 1.65,
  WebkitFontSmoothing: "antialiased",
  textRendering: "optimizeLegibility",
  overflowX: "hidden",

  // Faint paper grain / vignette via layered radial gradients (atmosphere
  // without noise files). Sits behind content, never intercepts clicks.
  "&::before": {
    content: '""',
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    zIndex: 0,
    background:
      "radial-gradient(120% 60% at 85% -10%, rgba(27,58,107,0.06), transparent 60%), radial-gradient(90% 50% at -10% 0%, rgba(226,85,46,0.05), transparent 55%)",
  },
  "& > *": { position: "relative", zIndex: 1 },

  // --- Layout helpers ---
  "& .ohx-wrap": {
    width: "100%",
    maxWidth: 1120,
    marginInline: "auto",
    paddingInline: "clamp(20px, 5vw, 56px)",
  },
  "& .ohx-narrow": { maxWidth: 760 },

  // --- Type ---
  "& .ohx-display": {
    fontFamily: "var(--display)",
    fontWeight: 500,
    fontOpticalSizing: "auto",
    lineHeight: 1.04,
    letterSpacing: "-0.015em",
    margin: 0,
  },
  "& h1.ohx-display": { fontSize: "clamp(2.6rem, 6.2vw, 5rem)", fontWeight: 500 },
  "& h2.ohx-display": { fontSize: "clamp(1.9rem, 3.6vw, 2.9rem)" },
  "& h3.ohx-display": { fontSize: "clamp(1.3rem, 2.2vw, 1.7rem)", lineHeight: 1.15 },
  "& .ohx-italic": { fontStyle: "italic", color: "var(--accent)", fontWeight: 400 },

  "& .ohx-eyebrow": {
    fontFamily: "var(--body)",
    textTransform: "uppercase",
    letterSpacing: "0.22em",
    fontSize: "0.72rem",
    fontWeight: 600,
    color: "var(--muted)",
    margin: 0,
  },
  "& .ohx-lead": {
    fontSize: "clamp(1.05rem, 1.6vw, 1.3rem)",
    lineHeight: 1.6,
    color: "var(--muted)",
    maxWidth: "46ch",
    margin: 0,
  },
  "& .ohx-muted": { color: "var(--muted)" },
  "& .ohx-faint": { color: "var(--faint)" },

  // --- Hairline rule ---
  "& .ohx-rule": {
    height: 1,
    border: 0,
    background: "var(--line)",
    width: "100%",
    margin: 0,
  },

  // --- Buttons (squared, confident — no pills, no shadows) ---
  "& .ohx-btn": {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.55em",
    fontFamily: "var(--body)",
    fontWeight: 600,
    fontSize: "1rem",
    lineHeight: 1,
    padding: "0.95em 1.5em",
    borderRadius: 4,
    border: "1px solid transparent",
    cursor: "pointer",
    textDecoration: "none",
    transition: "transform .18s ease, background-color .18s ease, color .18s ease, border-color .18s ease",
    WebkitTapHighlightColor: "transparent",
  },
  "& .ohx-btn:active": { transform: "translateY(1px)" },
  "& .ohx-btn--primary": {
    background: "var(--brand)",
    color: "#fff",
  },
  "& .ohx-btn--primary:hover": { background: "#16315a" },
  "& .ohx-btn--ghost": {
    background: "transparent",
    color: "var(--ink)",
    borderColor: "var(--line)",
  },
  "& .ohx-btn--ghost:hover": { borderColor: "var(--ink)", background: "rgba(0,0,0,0.02)" },

  // --- Inline link with an animated underline ---
  "& .ohx-link": {
    color: "var(--brand)",
    fontWeight: 600,
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    gap: "0.35em",
    backgroundImage: "linear-gradient(var(--accent), var(--accent))",
    backgroundSize: "0% 1.5px",
    backgroundPosition: "0 100%",
    backgroundRepeat: "no-repeat",
    transition: "background-size .25s ease",
    paddingBottom: 2,
  },
  "& .ohx-link:hover": { backgroundSize: "100% 1.5px" },
  "& .ohx-link .ohx-arrow": { transition: "transform .25s ease" },
  "& .ohx-link:hover .ohx-arrow": { transform: "translateX(3px)" },

  // --- Card (quiet surface, hairline border, lift on hover) ---
  "& .ohx-card": {
    background: "var(--surface)",
    border: "1px solid var(--line)",
    borderRadius: 8,
    transition: "transform .22s ease, box-shadow .22s ease, border-color .22s ease",
  },
  "& a.ohx-card:hover, & .ohx-card--hover:hover": {
    transform: "translateY(-3px)",
    boxShadow: "0 18px 40px -28px rgba(22,24,29,0.45)",
    borderColor: "#d8d1c0",
  },

  // --- Tag (replaces the loud colored chips with one quiet treatment) ---
  "& .ohx-tag": {
    display: "inline-flex",
    alignItems: "center",
    fontSize: "0.78rem",
    fontWeight: 500,
    color: "var(--muted)",
    background: "var(--surface-2)",
    border: "1px solid var(--line)",
    borderRadius: 999,
    padding: "0.2em 0.75em",
    lineHeight: 1.5,
  },
  "& .ohx-tag--accent": {
    color: "#b23a18",
    background: "var(--accent-soft)",
    borderColor: "#f3d3c7",
  },

  // --- Sponsor logos: desaturated until hovered (classic restrained move) ---
  "& .ohx-sponsors img": {
    filter: "grayscale(1)",
    opacity: 0.55,
    transition: "filter .25s ease, opacity .25s ease",
  },
  "& .ohx-sponsors:hover img": { opacity: 0.78 },
  "& .ohx-sponsors img:hover": { filter: "none", opacity: 1 },

  // --- One orchestrated load animation: staggered rise. ---
  "@keyframes ohxRise": {
    from: { opacity: 0, transform: "translateY(16px)" },
    to: { opacity: 1, transform: "none" },
  },
  "& .rise": {
    opacity: 0,
    animation: "ohxRise .8s cubic-bezier(.2,.7,.2,1) forwards",
  },
  "@media (prefers-reduced-motion: reduce)": {
    "& .rise": { animation: "none", opacity: 1 },
    "& .ohx-card, & .ohx-btn, & .ohx-link": { transition: "none" },
  },

  // Selection color ties back to the accent.
  "& ::selection": { background: "var(--accent)", color: "#fff" },
}));

// Small shared presentational atoms ----------------------------------------

export const Eyebrow = ({ children, style }) => (
  <p className="ohx-eyebrow" style={style}>
    {children}
  </p>
);

// A single understated metric used in the hero stat row.
export const Stat = ({ value, label }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
    <span
      className="ohx-display"
      style={{ fontSize: "clamp(1.5rem,2.4vw,2.1rem)", fontWeight: 500, lineHeight: 1 }}
    >
      {value}
    </span>
    <span
      className="ohx-eyebrow"
      style={{ letterSpacing: "0.14em", fontSize: "0.66rem" }}
    >
      {label}
    </span>
  </div>
);

// Right-pointing arrow used inside .ohx-link / buttons.
export const Arrow = () => (
  <span className="ohx-arrow" aria-hidden="true">
    →
  </span>
);
