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
- [x] `/signup` — full rewrite (editorial hero w/ italic "code for good", quiet
      stat row, "What you get" benefit cards on a `--surface-2` band, numbered
      "How to join" steps beside the framed `join_slack_1.png` screenshot, navy
      final-CTA band). Primary CTA is now a real `<a href={slackSignupUrl}
      target="_blank">` (dropped the JS `router.push`/`window.open` branch);
      `handleSignupClick` only fires the `CompleteRegistration` GA event. `Head`
      kept verbatim (www canonical + OG intact) + `<RefinedFonts/>`.
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
- [x] `/myfeedback` — full rewrite (editorial hero, navy CircularProgress overall-score
      ring with Fraunces number, hairline `Accordion` skill groups w/ navy `LinearProgress`
      bars, `.ohx-card` feedback entries w/ `.ohx-tag` chips, share-link card w/ themed
      `TextField` + navy copy button). Loading/empty/error states refined too. All
      data-fetch + `aggregateFeedback` logic unchanged.
- [x] `/feedback/[userid]` (`GiveFeedback`, `ssr:false`) — full rewrite (hero w/ italic
      terracotta recipient name, person `.ohx-card`, `Section`-framed form: navy-themed
      MUI `Select`/`Radio`/`Checkbox`, navy `Slider`s per the scope convention, themed
      textareas, native `.ohx-btn--primary` submit, calm success/error strips). Also fixed
      a pre-existing hooks-order bug (the `if (!user)` early return sat before `useEffect`)
      by moving all hooks above the guard. Submit/validation logic unchanged.
- [x] `/hack/[event_id]/team/[team_id]` — full rewrite + **deep-linkable Table of Contents**.
      Editorial masthead (event eyebrow, Fraunces team name, quiet status/`.ohx-tag` chips
      — winning status → `--accent`, nonprofit/created meta line). Two-column layout: content
      + a **sticky TOC rail** (right on desktop, scrollable pill row on top on mobile) that
      lists only the sections that actually render and highlights the active one on scroll
      (`IntersectionObserver`, `rootMargin -96px/-55%`). Each section is an `<section id>`
      with `scrollMarginTop: 96` and a hover-reveal `#` anchor that copies a deep link;
      TOC clicks smooth-scroll + `history.replaceState(#id)`; a mount effect honors an
      incoming `#hash`. Sections: `mentor-support` (when event started), `completion`
      (winning teams), `links`, `demo`, `problems`, `members`. Links → `.ohx-card--hover`
      tiles (terracotta icons), demo/problems/members → hairline `.ohx-card`s, actions →
      `.ohx-btn`. The embedded `MentorTeamPanel` + `TeamCompletionChecklist` widgets keep
      their own styling (wrapped only in an anchored `headed={false}` section). All data
      fetching + `getStaticProps`/`getStaticPaths` unchanged.
- [x] `/hack/request` (Host an Opportunity Hack) — page rewritten (campus-led
      editorial hero → "how hosting works" 3-step band → benefit cards → framed
      form → "who hosts" w/ Cal Poly Humboldt → navy soft-CTA band; canonical +
      OG + `RefinedFonts` added). **`HackathonRequestForm` flow improved for the
      dominant student persona** while preserving the `formData` contract (admin
      `HackathonRequestDetailDialog` + edit page depend on it): org type is now
      selectable cards defaulting to **university** (was corporate); the **$5k
      budget minimum was removed** (slider min `$0`, never blocks submit) and
      reframed as optional "funding you have access to"; the donation-% ask is
      **corporate-only** (forced to 0 at submit otherwise); phone is optional; a
      "~25 participants" option was added; the rainbow Papers (`#f5f9ff`/`#f7f7ff`/
      `#f5fff5`/`#fff5f5`) became calm `--surface-2` hairline cards; all controls
      are navy/terracotta via a scoped MUI `ThemeProvider` (`createTheme(base, …)`)
      + Fraunces step headings. **Step-change scroll fix:** `handleNext`/`handleBack`
      now `scrollIntoView` a `formTopRef` on the outer Paper (with
      `scrollMarginTop:88`) instead of `window.scrollTo(0,0)` — the old behavior
      overshot to the page top now that the form sits below the hero. Edit page
      `/hack/request/[request_id]` wrapped in `RefinedRoot`+`RefinedFonts` chrome
      (noindex); the form's own ThemeProvider keeps it consistent there too.
- [x] `/office-hours` — full rewrite (editorial hero w/ italic "nonprofit project",
      "what to expect" cards, framed Google Calendar embed + iCal/Slack ghost CTAs,
      Instagram embed kept `ssr:false`, navy final CTA). Also: now **renders the
      JSON-LD** `structuredData` (the old page passed it as a prop but never
      emitted it), switched FB pixel to the idempotent `initFacebookPixel` from
      `lib/ga` (was calling `ReactPixel.init` directly — CWV rule violation),
      removed the artificial 1s `setIsLoading` skeleton delay (hurt LCP) and the
      dead `CalendarOptions`/`generateICSContent` code, added canonical. The old
      `LoginOrRegister` banner was replaced by the navy Slack CTA band.
- [ ] (later) remaining pages — application forms, `/nonprofit/[id]`, `/project/[id]`,
      `/about/why`, `/about/hearts`, `/contact`, etc. Deeper passes wanted on the own
      `/profile` editor (logged-in) and the `/hack/[event_id]` event page (see the
      dedicated plan below).

## `/hack/[event_id]` — masthead-led refined pass (done, phase 1)
The event page (`src/pages/hack/[event_id].js`) now:
- Renders its body inside one `<RefinedRoot>` + `.ohx-wrap` (warm paper, fonts,
  navbar clearance). The old `<Container component="main">` was swapped out;
  `RefinedRoot` is the `<main>`. All section anchor IDs + `TableOfContents` +
  `FloatingNavigation` are preserved.
- **`HackathonHeader` was rebuilt** into a calm editorial masthead (eyebrow →
  Fraunces title → date·location meta line w/ terracotta icons → muted markdown
  description → hairline rule), replacing the mint-gradient Paper. **It's
  scope-independent** — all visuals use inline styles with CSS-var fallbacks
  (`var(--ink, #16181D)` etc.) so it also looks right on `/hack/[event_id]/agenda`
  and `/census`, which render it outside a `RefinedRoot`.
- The page-level markup I own was refined: the "Build a team" buttons (flat navy
  primary + hairline ghost, no heavy shadows) and the event-recap teaser
  (`.ohx-card` + eyebrow + `.ohx-link`).
- **Phase 2 (done) — event-only sub-components refined:** `NonprofitList`
  (clickable calm cards + Fraunces heading + navy view-toggle + quiet status
  tags), `EventConstraints` (calm card, Fraunces heading, quiet constraint
  chips), `DonationProgress` (calm card, navy progress rings, refined CTA,
  grayscale sponsor strip), `EventCountdown` (navy countdown card instead of the
  primary→secondary gradient, white-card timeline with navy/terracotta dots,
  Fraunces headings, navy progress bar + Agenda button). All four are
  event-page-only, so no cross-route risk.
- **`TeamList` refined (done).** Turned out to be **event-page-only** (the
  earlier "shared" hits were substrings — `TeamListSkeleton` in `JudgingRound1`,
  `isUserInAnyTeamList` in `event-teams`; neither imports the component). So no
  gating needed. Refined `TeamCard` to a flat hairline card (radius 10, no
  shadow, hover lift, equal height), Fraunces team name (ink → brand on hover),
  a refined "Team members" overline label, and a navy Join button. Kept the
  semantic status chips, demo-video dialog, GitHub stats, and join/leave logic.
- **`HackathonLeaderboard` refined (done).** Event-only. Restyled the styled
  primitives: `LeaderboardContainer`/`OrgBanner`/`AchievementCard` → flat hairline
  cards; `StatBox` → warm `--surface-2` tiles; `StatValue` + per-achievement metric
  numbers → Fraunces navy; `StatLabel` → uppercase overline; stat icons → terracotta;
  `SectionHeader` → Fraunces w/ hairline underline; `LinkButton` → squared navy.
  Small inline achievement icons (person/clock) stay blue — minor data accents.
- **Phase 3 (done) — the last sub-components, incl. the genuinely shared ones.**
  Instead of per-route gating (which leaves confusing half-states), the shared
  components are styled with **inline CSS-var fallbacks** (`var(--ink, #16181D)`
  etc.) so they render refined whether or not they sit in a `<RefinedRoot>`:
  - `EventLinks` (event-only) — the 6 rainbow-colored application buttons → one
    calm uniform card set (white, hairline, terracotta icon, Fraunces title,
    muted desc); the striped-blue social-proof banner → a calm accent strip;
    event-links buttons → navy ghost. `full` variant is dead code (event page
    uses `applications` + `event-links`).
  - `InteractiveFAQ` (**shared**: event page, `OnboardingFAQ`, `SingleHackathonEvent`)
    — Fraunces title, hairline search field, flat hairline accordions (no
    default divider line). Var-fallbacks make it correct on all three.
  - `HackathonResults` (**shared**: event page + `/hack/[event_id]/results`) —
    busy gold gradient container → calm `--surface-2` frame; stat tiles → white
    hairline w/ Fraunces navy numbers; Fraunces headings; **gold/silver/bronze
    winner medals kept** (semantic + celebratory). Verified on `/results`, which
    is NOT inside a `RefinedRoot` — fallbacks render correctly.
  - `VolunteerList` (event-only, 1819 lines) — `PersonCard` → flat hairline card
    w/ navy hover/expanded border; section heading → Fraunces. Internals/logic
    untouched.
- **Final review pass (done) — page chrome + remaining widgets:**
  - `TableOfContents` — white hairline card, Fraunces title, terracotta
    quick-access icons, hairline section pills with a **navy active pill** (was
    magenta `secondary`).
  - `FloatingNavigation` — the mobile FAB → navy (was bright blue `primary`).
  - `VolunteerList` — `PersonCard` flat hairline; section heading Fraunces;
    `StyledLink` "Learn more" → navy (was magenta); availability chips' blue
    "available now"/"remote" → navy (in-person stays green = semantic).
  - `MentorAvailability` — Fraunces heading, the blue "total mentors" banner →
    calm `--surface-2` accent strip, orange Slack button → navy.
- **Truly nothing left** on the event page except deliberate semantic/data accents
  (green "available/in-person" chips, the red "Hackathon Ended" team badge,
  gold/silver/bronze winner medals, a few tiny blue stat-icons + MUI Switch
  toggles) and `PlanningBudgetEventPageWidget` (only renders behind a planning
  flag). The event page is fully refined end-to-end, desktop + mobile.

### Notes for the next pass
- Pattern is well-established now: copy `Head`/`getStaticProps`/schema verbatim,
  add `<RefinedFonts/>`, wrap body in `<RefinedRoot>`, rebuild sections with
  `.ohx-*` classes, keep one `<h1>`, preserve GA calls.
- Reusable interactive bits already styled for the scope: native `<details>`
  disclosure pattern (see `about/judges`), MUI `Slider` with
  `sx={{ color: '#1B3A6B' }}`, search `<input>` + quiet toggle-tag filters
  (see `ProjectList` / `NonProfitList`).
