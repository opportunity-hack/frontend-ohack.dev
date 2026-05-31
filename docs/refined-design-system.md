# Opportunity Hack — "Civic Editorial" Refined Design System

> The reference for the site facelift started in 2026. Goal: replace the old
> "too busy" look (multiple gradients, equal-weight sections, multicolor chips
> everywhere) with a calm, confident, magazine-like system. Pick this up later
> when continuing the rollout to the remaining pages.

## North star
**Calm, editorial, confident.** One idea per section, generous whitespace, a
single accent color, hairline rules instead of boxes-in-boxes. If a screen feels
busy, the fix is almost always: fewer colors, fewer competing CTAs, more space,
quieter chips.

Reference screens already shipped: `/` (homepage), `/projects`, and the global
NavBar.

## Where it lives
- **`src/components/design/refined.js`** — the whole scoped system:
  - `<RefinedRoot>` — `styled('main')` that sets the CSS variables + utility
    classes for everything inside it. **Scoped** — it does not touch the global
    MUI light theme, so other (un-migrated) pages are unaffected.
  - `<RefinedFonts />` — Google Fonts `<link>`s (Fraunces + Hanken Grotesk,
    preconnect + `display=swap`). Drop into each page's `next/head`.
  - `Eyebrow`, `Stat`, `Arrow` — small shared presentational atoms.
- The global **NavBar** (`src/components/Navbar/`) is restyled to match but lives
  outside the scope (it's global chrome). See its section below.

## Tokens (CSS variables on `RefinedRoot`)
| Token | Value | Use |
|---|---|---|
| `--paper` | `#FBFAF6` | page background (warm off-white) |
| `--surface` | `#FFFFFF` | cards |
| `--surface-2` | `#F4F1E9` | sunken/alternating bands |
| `--ink` | `#16181D` | primary text (warm near-black) |
| `--muted` | `#5B6270` | secondary text |
| `--faint` | `#8A8F9A` | tertiary / meta text |
| `--line` | `#E7E1D4` | hairline borders |
| `--brand` | `#1B3A6B` | deepened OHack navy — primary actions, links |
| `--brand-ink` | `#0E2547` | darker navy (hovers) |
| `--accent` | `#E2552E` | terracotta — the "social good" highlight, used **sparingly** |
| `--accent-soft` | `#FBE9E2` | accent tag background |

**Color discipline:** navy is the workhorse, terracotta is a spice (one italic
word in a headline, the "Production"/featured tag, a single underline-on-hover).
Never reintroduce the old rainbow of status chips.

## Type
- **Display:** Fraunces (variable serif, optical sizing). Warm, editorial,
  distinctive. Class `.ohx-display`. Italic + accent for the one highlighted
  phrase per headline (`.ohx-italic`).
- **Body / UI:** Hanken Grotesk. Clean grotesque, friendly, civic.
- Headline pattern: a plain phrase + one italic terracotta phrase, e.g.
  *"Projects worth **your time.**"*, *"Free software for nonprofits, **built by developers.**"*

## Utility classes (all under `RefinedRoot`)
- Layout: `.ohx-wrap` (max 1120, responsive gutters), `.ohx-narrow` (max 760).
- Type: `.ohx-display`, `.ohx-eyebrow` (uppercase tracked label), `.ohx-lead`
  (large intro paragraph), `.ohx-muted`, `.ohx-faint`, `.ohx-italic`.
- Rule: `.ohx-rule` (1px hairline).
- Buttons: `.ohx-btn` + `.ohx-btn--primary` (solid navy) / `.ohx-btn--ghost`
  (hairline). Squared (radius 4–6), no shadows, subtle press.
- Link: `.ohx-link` — navy, animated terracotta underline grows on hover, pairs
  with `<Arrow />` that nudges right on hover.
- Card: `.ohx-card` (+ `.ohx-card--hover` for lift). One quiet surface, hairline
  border, soft shadow only on hover.
- Tag: `.ohx-tag` (quiet gray pill) / `.ohx-tag--accent` (terracotta) — the
  single replacement for all the old colored MUI chips.
- Sponsor logos: wrap a logo row in `.ohx-sponsors` → logos render grayscale at
  low opacity, regain color on hover (classic restrained treatment).
- Motion: `.rise` = one staggered fade-up on load; set per-element
  `style={{ animationDelay: 'Nms' }}`. Honors `prefers-reduced-motion`.

## Page composition recipe
1. `<Head>` includes `<RefinedFonts />` (+ existing SEO/OG — keep those intact).
2. Wrap the page body in `<RefinedRoot>`.
3. **Hero**: `.ohx-wrap`, `paddingTop: clamp(104px,…)` to clear the fixed 64px
   navbar. Eyebrow → one `<h1 class="ohx-display">` (the ONLY h1) → one
   `.ohx-lead` paragraph → ONE primary CTA (+ at most one ghost). Optional quiet
   stat row under a `.ohx-rule`.
4. **Content sections**: alternate plain `--paper` and sunken `--surface-2`
   bands (with `borderTop/Bottom: 1px solid var(--line)`) for rhythm. Each
   section: small eyebrow + `<h2 class="ohx-display">` + calm body. Cards in
   `repeat(auto-fit/fill, minmax(…,1fr))` grids, `gap: 20`.
5. **One CTA per section.** Use `.ohx-link` for soft navigation, `.ohx-btn` for
   the primary action.
6. Keep all existing JSON-LD / structured data and GA tracking calls.

## Hard rules carried over (don't regress)
- **CWV**: keep above-the-fold async sections reserving space (`minHeight` or
  skeletons); `next/image` with explicit `width`/`height`; fonts via
  preconnect + `display=swap`. NavBar stays SSR, 64px, fixed-width auth slot.
- **One `<h1>` per page.**
- Don't reintroduce: gradient hero banners, the avatar leaderboard wall, sponsor
  logo *walls* (a quiet grayscale strip is fine), multicolor status chips,
  nested bordered boxes inside cards, or 4+ equal-weight CTAs.

## Global NavBar (applies site-wide)
Light, frosted "civic editorial" bar so it's cohesive on every page:
- `backgroundColor: rgba(251,250,246,0.82)` + `backdropFilter: blur(10px)` +
  `borderBottom: 1px solid #E7E1D4`, `elevation={0}`, no shadow.
- Ink (`#16181D`) sentence-case links, hover → `--brand` with a faint navy wash.
- "Log In" is a squared navy button (not a rounded pill).
- Logo: `OpportunityHack_Logo_Dark_Blue_Banner.png` (3:1) so it reads on light.
- Invariants preserved: SSR, 64px height, fixed-width auth slot, all dropdowns.
- **Mobile** (`xs`): hamburger pinned left (`flexGrow:0`), the dark-blue banner
  logo centered (`flexGrow:1` box, was previously hidden on mobile), avatar/login
  right. The mobile dropdown `Menu` is refined via `slotProps.paper.sx`:
  `min(86vw,340px)` wide, rounded 14px, warm paper bg, soft shadow, left-aligned
  Hanken items with rounded hover, and tracked-uppercase `ListSubheader` section
  labels. Touch targets stay ≥48px.

## Verifying changes in dev (gotcha)
Next 16 dev chunks are **not** content-hashed, so the browser serves stale JS
across hard navigations even after a successful Fast Refresh rebuild. To verify
visually, disable cache via CDP (`Network.setCacheDisabled` +
`clearBrowserCache`); a plain reload or `?cachebust` keeps showing the old bundle.

## Rollout status
- [x] `/` (homepage)
- [x] `/projects`
- [x] Global NavBar
- [x] `/nonprofits` — `NonProfitList` rewritten; new calm card
      `NonProfitListTileRefined` (the original `NonProfitListTile` is still used
      by event pages, so it was left untouched).
- [x] `/sponsor`
- [x] `/about/judges`
- [x] `/about`
- [x] `/about/mentors` — `Mentorship` component rewritten as refined sections
      (no own `RefinedRoot`); the page wraps it + the impact/checklist/FAQ in one
      `RefinedRoot`. The `MentorChecklist` + `MentorTeamPanelDemo` interactive
      demos keep their own styling (live widgets shown as previews).
- [x] `/profile/[userid]` (public) — `PublicProfile` rewritten; the page wrapper
      was simplified to drop a redundant ThemeProvider + stray blue placeholder
      bands (global `_app` already provides nav/footer).
- [x] `/profile` (own, authenticated editor) — **chrome-only facelift**: refined
      fonts, Fraunces on the name, navy tab strip w/ terracotta indicator. The
      tabbed edit form itself was left intact (couldn't be visually verified
      logged-out; deliberately conservative).
- [x] Mobile NavBar — centered logo (was hidden on mobile), hamburger pinned
      left, refined wider dropdown (warm paper, rounded, tracked section labels,
      left-aligned Hanken items).
- [x] `/blog` — `BlogPage` rewritten (hero + search + tag toggles + sidebar);
      the reused `News` component renders the post list inside the refined frame.
- [x] `/about/completion` — `ProjectCompletion` rewritten (numbered DoD checklist).
- [x] `/about/success-stories` — rewritten to refined story cards (data array
      kept verbatim); video + CTA refined.
- [x] `/onboarding` — refined chrome (hero, navy-themed MUI `Stepper`, step-content
      card, refined nav buttons, dialog). The step-content sub-components
      (`WelcomeSection` etc.) keep their own styling; note `WelcomeSection` has its
      own `<h1>`, so the page technically has 2 h1s — fix later if it matters.
- [x] `/hack` (index) — **harmonized, not rewritten**. It keeps its bespoke
      event-finder structure + `HackPageNav` + all section-ID contracts; only the
      hero (Fraunces + eyebrow + navy CTAs), page background, "About these events"
      heading, and "Support" band were brought into the palette via inline `RX`
      tokens (no `<RefinedRoot>` wrap, to avoid disturbing the finder sub-components).
- [x] `/hack/[event_id]` — **light harmonization only** (1248 lines + ~15 heavy
      dynamic sub-components). Added `<RefinedFonts/>` + Fraunces on the event title
      (`HackathonHeader` `EventTitle`). The deep section components are unchanged —
      this page is the prime candidate for a dedicated, sectioned refined pass.
- [x] `/volunteer` — full rewrite (hero + stats, events band, "find your fit" role
      cards with native `<details>` specializations, adjacent-paths links, navy CTA).
- [x] `/about/hackers` — full rewrite (two video blocks kept, events, what-hackers-do,
      why-join, navy "start building today" band, what-to-bring + toolbox with icons,
      free-hosting callout).
- [x] `/praise` — refined hero + how-to callout + footer CTA; the `PraiseBoard` feed
      component keeps its own (colorful) styling.
- [ ] (later) remaining pages — application forms, `/nonprofit/[id]`, `/project/[id]`,
      `/about/why`, `/about/hearts`, `/contact`, etc. Deeper passes wanted on the own
      `/profile` editor (logged-in) and the `/hack/[event_id]` event page (see the
      dedicated plan below).

## Plan: `/hack/[event_id]` — the deep, standalone pass
The event page (`src/pages/hack/[event_id].js`, ~1250 lines) is the highest-traffic,
most-complex page and got only a light harmonization so far (RefinedFonts + Fraunces
title). A proper refined pass is its own project. Recommended approach:
1. **Inventory the sections** (all dynamically imported): `HackathonHeader`, donation
   progress, `EventCountdown`, stats, `NonprofitList`, `TeamList`, `HackathonResults`,
   `EventLinks`, `VolunteerList`, `HackathonLeaderboard`, `EventConstraints`,
   `InteractiveFAQ`, media teaser, planning-budget widget.
2. **Wrap the page body in one `<RefinedRoot>`** and replace the `Container` chrome +
   `LinksContainer`/`LoadingPlaceholder` styled bits with `.ohx-*` section frames
   (`.ohx-wrap`, eyebrow + `.ohx-display` headings, alternating `--surface-2` bands).
   Keep `TableOfContents`/`FloatingNavigation` + all section anchor IDs intact.
3. **Refit the header** into a refined event hero: event title (Fraunces) + a compact
   meta row (date · location · type tags) + the primary apply CTAs as `.ohx-btn`,
   countdown beside it. This is the single biggest visual win.
4. **Per-sub-component**, do the same calm-card treatment used elsewhere
   (`TeamList`, `NonprofitList` cards → `.ohx-card`, quiet `.ohx-tag` instead of
   colored MUI chips). Do these one at a time, screenshotting each, because several
   are shared with other routes (e.g. `TeamList`, `HackathonResults`) — verify those
   other routes after each change or gate the refined styling to this page.
5. **CWV**: preserve the existing `LoadingPlaceholder` reserved heights and `ssr`
   dynamic config; don't regress the countdown/LCP.
Budget it as ~1 focused session; verify with cache-disabled screenshots at desktop +
390px after each section.

### Notes for the next pass
- Pattern is well-established now: copy `Head`/`getStaticProps`/schema verbatim,
  add `<RefinedFonts/>`, wrap body in `<RefinedRoot>`, rebuild sections with
  `.ohx-*` classes, keep one `<h1>`, preserve GA calls.
- Reusable interactive bits already styled for the scope: native `<details>`
  disclosure pattern (see `about/judges`), MUI `Slider` with
  `sx={{ color: '#1B3A6B' }}`, search `<input>` + quiet toggle-tag filters
  (see `ProjectList` / `NonProfitList`).
