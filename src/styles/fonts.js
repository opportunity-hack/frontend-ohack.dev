// ---------------------------------------------------------------------------
// THE single source of truth for fonts (see CLAUDE.md "Typography system").
//
// - `hanken` / `fraunces` are next/font/local instances loaded from variable
//   woff2 files vendored in this repo (see ./fonts/). Builds never download
//   fonts from Google Fonts, so a network hiccup at build time cannot fail
//   a deploy the way the next/font/google fetch did on Oct 5, 2026.
// - next/font still preloads them and generates size-adjusted fallbacks
//   (zero-CLS). Their `.variable` classNames are applied to <Html> in
//   _document.js, which defines --font-body / --font-display on the root
//   element — reaching everything, including MUI Portals (Dialogs/Menus).
// - `FONT_BODY` / `FONT_DISPLAY` / `FONT_MONO` are the ONLY font-family strings
//   any JS should use (sx, styled, MUI themes). Never hardcode 'Hanken Grotesk'
//   or 'Fraunces' elsewhere — the var() fallback list keeps things rendering
//   even where the next/font vars are unavailable (tests, emails, previews).
// ---------------------------------------------------------------------------

import localFont from "next/font/local";

// Hanken Grotesk variable font, latin subset, wght 100-900.
export const hanken = localFont({
  src: "./fonts/hanken-grotesk-latin-variable.woff2",
  display: "swap",
  variable: "--font-body",
  weight: "100 900",
});

// Fraunces variable font, latin subset, normal + italic, wght 100-900.
// The vendored files carry the opsz axis (9-144); browsers apply it
// automatically (font-optical-sizing defaults to auto), so headlines render
// at the display optical size instead of the text optical size.
export const fraunces = localFont({
  src: [
    { path: "./fonts/fraunces-latin-variable.woff2", style: "normal" },
    { path: "./fonts/fraunces-latin-italic-variable.woff2", style: "italic" },
  ],
  display: "swap",
  variable: "--font-display",
  weight: "100 900",
});

export const FONT_BODY =
  "var(--font-body, 'Hanken Grotesk', system-ui, -apple-system, sans-serif)";

export const FONT_DISPLAY =
  "var(--font-display, 'Fraunces', Georgia, 'Times New Roman', serif)";

// No mono webfont is loaded site-wide (code snippets are rare); this is a
// system stack. /12-years-of-social-good loads its own JetBrains Mono.
export const FONT_MONO =
  "ui-monospace, 'Fira Code', SFMono-Regular, Menlo, Consolas, monospace";
