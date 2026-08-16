// ---------------------------------------------------------------------------
// THE single source of truth for fonts (see CLAUDE.md "Typography system").
//
// - `hanken` / `fraunces` are next/font instances: self-hosted woff2, preloaded,
//   size-adjusted fallbacks (zero-CLS). Their `.variable` classNames are applied
//   to <Html> in _document.js, which defines --font-body / --font-display on the
//   root element — reaching everything, including MUI Portals (Dialogs/Menus).
// - `FONT_BODY` / `FONT_DISPLAY` / `FONT_MONO` are the ONLY font-family strings
//   any JS should use (sx, styled, MUI themes). Never hardcode 'Hanken Grotesk'
//   or 'Fraunces' elsewhere — the var() fallback list keeps things rendering
//   even where the next/font vars are unavailable (tests, emails, previews).
// ---------------------------------------------------------------------------

import { Fraunces, Hanken_Grotesk } from "next/font/google";

export const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
});

export const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-display",
  // Fraunces is a variable font; wght comes for free, opsz must be requested
  // explicitly or headlines render at the text optical size.
  axes: ["opsz"],
});

export const FONT_BODY =
  "var(--font-body, 'Hanken Grotesk', system-ui, -apple-system, sans-serif)";

export const FONT_DISPLAY =
  "var(--font-display, 'Fraunces', Georgia, 'Times New Roman', serif)";

// No mono webfont is loaded site-wide (code snippets are rare); this is a
// system stack. /12-years-of-social-good loads its own JetBrains Mono.
export const FONT_MONO =
  "ui-monospace, 'Fira Code', SFMono-Regular, Menlo, Consolas, monospace";
