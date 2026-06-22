# Refined Design — Project & Nonprofit Pages (execution plan)

**For:** Sonnet 4.6. **Goal:** bring the "civic editorial" refined look (see
`docs/refined-design-system.md`) to `/project/[project_id]` and
`/nonprofit/[nonprofit_id]`, removing the busy gradient/chip styling.

Read `docs/refined-design-system.md` first. The design tokens + utility classes
live in `src/components/design/refined.js` (`RefinedRoot`, `RefinedFonts`,
`Eyebrow`, `Stat`, `Arrow`).

---

## 1. Architecture map (current state)

Both routes are thin `dynamic(ssr:false)` wrappers; SEO/OG lives in their
`getStaticProps`. The real UI is in two components that **both render the same
shared card** `ProblemStatement`:

| Route | Page file (keep `getStaticProps`) | UI component | Renders |
|---|---|---|---|
| `/project/[project_id]` | `src/pages/project/[project_id].js` | `src/components/Project/Project.js` (107 ln) | ONE `<ProblemStatement>` |
| `/nonprofit/[nonprofit_id]` | `src/pages/nonprofit/[nonprofit_id].js` | `src/components/NonProfit/NonProfit.js` (326 ln) | gradient banner + title block + **N** `<ProblemStatement>` (one per problem statement) |

**Shared card:** `src/components/ProblemStatement/ProblemStatement.js` (1172 ln).
Heavy MUI with `styled()` gradient pieces: `ModernProjectCard` (green/blue
gradient + 4px top bar), `HeroSection` (purple `#667eea→#764ba2` gradient +
grid svg), `MetricCard`, `StatusChip` (green/orange gradient chips),
`SectionCard` + `SectionHeader` (gradient headers), `HelpToggle`,
`MaterialUISwitch`. Sub-sections: hero (status chip, copy-link, title,
nonprofit attribution chips, `SkillSet`, `ProjectProgress`), 3 metric cards
(developers/mentors/events), markdown description box, help toggle, CTA
(`renderCallToAction`), and 3 collapsible sections (References, GitHub, Events).

**Critical fact:** `grep` confirms `ProblemStatement` is imported **only** by
`Project.js` and `NonProfit.js`. Once BOTH wrappers are `<RefinedRoot>`, the card
always has a `RefinedRoot` ancestor — so inside `ProblemStatement.js` you may use
the scoped `.ohx-*` classNames directly (NO inline `var(--x, fallback)` needed,
unlike the shared `InteractiveFAQ`/`HackathonResults` components). This is the
big simplifier.

Old shared wrapper styles live in `src/styles/nonprofit/styles.js`
(`LayoutContainer`, `TitleBanner`, `TitleContainer`, `ApplyButton`, etc.) — these
are used ONLY by `Project.js` + `NonProfit.js`. They become orphaned after this
work; leave the file in place (don't delete; other refactors may reference) but
stop importing from it.

---

## 2. Invariants & decisions (read before coding)

1. **One `<h1>` per page.** Today `ProblemStatement` renders its title as
   `component="h1"` (line ~823). On the nonprofit page that yields **N h1s** +
   the nonprofit name — a real violation. Fix: add a prop
   `headingLevel` (`"h1" | "h2"`, default `"h1"`) to `ProblemStatement`.
   - Project page → pass `headingLevel="h1"` (the project title is the page h1).
   - Nonprofit page → the **nonprofit name** is the only `<h1>`; pass
     `headingLevel="h2"` to every `ProblemStatement`.

2. **Card works in two contexts.** On `/project` it's the standalone main
   element; on `/nonprofit` it's a repeated item in a list. Keep it as a single
   `.ohx-card` block that reads well either way. Don't add page-level chrome
   (breadcrumbs, "view all" links) inside the card — that belongs in the wrappers.

3. **Canonical host = `www.ohack.dev`** (CLAUDE.md SEO rule). `NonProfit.js`
   currently hardcodes bare non-www `https://ohack.dev/nonprofit/...` for
   `og:url` + `twitter:url` (lines ~194, ~199) — **fix to `https://www.ohack.dev/...`**
   and add a `<link rel="canonical" href="https://www.ohack.dev/nonprofit/${id}" />`.
   For the project page, add a canonical to `https://www.ohack.dev/project/${id}`
   in the component `<Head>` (it's `noindex,follow` so low stakes, but be correct).

4. **Keep all structured data + GA + Facebook Pixel.** `Project.js` has a
   `Course` JSON-LD block; `NonProfit.js` has `initFacebookPixel` + `trackEvent`
   (`gaButton`) + the apply-CTA tracking. Preserve verbatim. Keep
   `ProblemStatement`'s help/unhelp flow, `HelpDialog`/`UnhelpDialog`, team join
   logic, all hooks, and the markdown rendering untouched — restyle shells only.

5. **`ssr: false` stays.** Both page files import their component with
   `ssr:false`; both pages are `noindex,follow`. Do NOT flip to SSR (the
   components read `router.query` + fetch client-side). Wrapping in `RefinedRoot`
   inside an ssr:false component is fine.

6. **CWV.** The nonprofit banner currently uses `next/image` with `layout="fill"`
   + `priority` (LCP). Keep `next/image` with explicit sizing in any image you
   touch. Don't introduce raw `<img>` without width/height. Reserve space for the
   async problem-statement list (a `minHeight` or skeleton) so it doesn't CLS.

7. **Don't reintroduce** (refined hard rules): gradient hero banners, multicolor
   gradient status chips, nested bordered boxes inside cards, 4+ equal CTAs.

8. **Fonts:** add `<RefinedFonts />` inside each component's `<Head>`.

---

## 3. Workstream A — `ProblemStatement.js` (the shared card)

This is the bulk of the visual win (it's on both pages). Refactor the
presentation; keep all state/handlers/effects.

### A1. Replace the `styled()` definitions (lines ~74–204)
Delete or neutralize the gradient pieces. Rebuild as quiet refined surfaces:
- `ModernProjectCard` → a plain `.ohx-card` wrapper (`div` or keep `Card` but
  override): warm `--surface`, `1px solid var(--line)`, `borderRadius: 8`, no
  gradient, no 4px color top-bar, hover lift only via `.ohx-card--hover`.
- `HeroSection` (purple gradient) → a calm header band: `--surface-2` background
  (or plain paper) with a `borderBottom: 1px solid var(--line)`. Text becomes
  `--ink`/`--muted` (NOT white). Remove the SVG grid pattern.
- `MetricCard` → warm `--surface-2` tile, hairline border, Fraunces navy number
  (mirror the `ImpactMetrics`/`Stat` treatment). No scale-on-hover gradient.
- `StatusChip` (green/orange gradient) → one quiet `.ohx-tag`. Use
  `.ohx-tag--accent` (terracotta) only for the "needs help" / active state;
  plain `.ohx-tag` for "production/live". No gradient, no white text.
- `SectionCard` + `SectionHeader` → hairline `.ohx-card` with a plain header row
  (`--surface-2`, `borderBottom: 1px solid var(--line)`); keep the expand/collapse
  chevron + `Collapse` behavior. No gradient header.
- `HelpToggle` / `MaterialUISwitch` → keep the switch interaction; recolor the
  "on" state to `--brand` navy (was `#22c55e` green) and drop the heavy
  gradient/translate hover. (Optional cleanup: `MaterialUISwitch` is defined
  inside the component body at ~247 → hoist to module scope so it isn't
  re-created each render. Nice-to-have, not required.)

### A2. Hero region (lines ~805–862)
- Eyebrow (e.g. `PROJECT` or the status word) → `<h1|h2 class="ohx-display">`
  title driven by the `headingLevel` prop → `SkillSet` → `ProjectProgress`.
- `CopyToClipboardButton` stays (it's a small action) — place it as a quiet
  `.ohx-link`-style affordance, top-right.
- "Since {first_thought_of}" + nonprofit-attribution chips → quiet `.ohx-tag`s
  (the nonprofit attribution links stay clickable to `/nonprofit/{id}`).
- `ProjectProgress` (`src/components/ProjectProgress/ProjectProgress.js`, 94 ln):
  lightly recolor its step states to navy/terracotta to match. It's also used by
  `src/components/project-progress.js` — a quick check that the recolor doesn't
  look broken there is enough; keep it CSS-var/token based.

### A3. Metrics (lines ~866–916)
Three tiles (Developers / Mentors / Events) → refined `--surface-2` tiles, icons
in terracotta or muted, counts in Fraunces navy. Keep the `Badge` counts/logic.

### A4. Description (lines ~919–960)
Keep `<ReactMarkdown>`. Drop the `#f8fafc` tinted box + heavy borders; render on
plain paper under a small `.ohx-eyebrow`/`<h3 class="ohx-display">` "Project
description". Keep markdown element styling but swap hardcoded slate hex
(`#e2e8f0`, `#f1f5f9`) for `var(--line)` / `var(--surface-2)`.

### A5. Help toggle + CTA (lines ~963–968, `renderHelpToggle`/`renderCallToAction` ~690–790)
Keep all logic (login redirect, help/unhelp dialogs, team join). Restyle:
buttons → `.ohx-btn--primary` (navy) / `.ohx-btn--ghost`. One primary action.

### A6. Collapsible sections (References / GitHub / Events, lines ~972–1160)
Keep `Collapse` + toggle state. Reskin headers/cards per A1. GitHub issue
`Paper variant="outlined"` tiles → hairline `.ohx-card`. Keep `Events`,
`ReferenceItem`, `ProblemStatementContent` children as-is (only their frames change).

### A7. Loading state (lines ~591+)
Replace the centered MUI spinner with a calm refined skeleton or a simple
`.ohx-muted` "Loading…" inside the card frame (consistent with refined pages).

**Acceptance:** no gradients/white-on-purple/multicolor chips remain in the card;
it renders correctly both standalone (project page) and repeated (nonprofit page);
all help/team/markdown/section logic still works; only ONE `<h1>` emitted when
`headingLevel="h2"` is passed.

---

## 4. Workstream B — `NonProfit.js` (nonprofit page chrome)

Rewrite the presentation around `<RefinedRoot>`; keep the hooks
(`useNonprofit`), the FB pixel/GA effects, `handleSubmit`/`onComplete`, and the
`renderProblemStatements()` data logic.

### B1. Shell
- `<Head>`: add `<RefinedFonts/>`; **fix og:url/twitter:url to www**; add
  `<link rel="canonical" href="https://www.ohack.dev/nonprofit/${nonprofit_id}">`.
  Keep existing title/description/og:image meta.
- Replace `LayoutContainer`/`TitleBanner`/`TitleContainer`/`ProjectsContainer`
  (from `styles/nonprofit/styles`) with a `<RefinedRoot>` + `.ohx-wrap`.

### B2. Editorial masthead (replaces gradient `TitleBanner` + `TitleContainer`)
- Eyebrow `NONPROFIT PARTNER` → `<h1 class="ohx-display">{nonprofit.name}</h1>`
  (the page's only h1) → `.ohx-lead` description.
- Meta row as quiet `.ohx-tag`s / `.ohx-link`s: `{projectCount} projects`,
  website link (`LanguageIcon` + `nonprofit.website`), Slack channel
  (`#{slack_channel}` → `app_redirect` link), point-of-contact people.
  Drop the red `Avatar` initials + large `ProjectsChip`.
- The banner image: either drop it (cleaner, editorial) OR keep a single calm
  framed `next/image` (NOT a full-bleed gradient/parallax). Recommendation: keep
  a slim framed image only if `nonprofit.image` is a real logo/photo; otherwise
  omit. Preserve the LCP preload `useEffect` only if you keep the image.

### B3. Projects section
- Small eyebrow + `<h2 class="ohx-display">Projects</h2>`.
- Render the `ProblemStatement` list (pass `headingLevel="h2"`). Reserve vertical
  space while the async list loads (skeleton or `minHeight`) — no CLS.
- Empty state (`renderProblemStatements` no-projects branch): refined calm
  `.ohx-card` with the CTA. Replace gold `ApplyButton` with `.ohx-btn--primary`
  to `/nonprofits/apply`; **keep** the `gaButton("click_apply", nonProfitPageName)`
  tracking on click.
- Logged-out `LoginOrRegister` CTA: keep the component; place it in a calm framed
  `.ohx-card` / `--surface-2` gate (same spirit as the team-page auth gate).

### B4. getStaticProps cleanup (`src/pages/nonprofit/[nonprofit_id].js`)
Remove the noisy `console.log("problemStatements", …)` (line ~78) and
`console.log("----->", ps)` (line ~94). Leave the meta logic intact.

---

## 5. Workstream C — `Project.js` (single-project page chrome)

Smallest workstream. Rewrite around `<RefinedRoot>`; keep `useProblemstatements`,
the `Course` JSON-LD, and the login CTA logic.

### C1. Shell
- `<Head>`: add `<RefinedFonts/>` + `<link rel="canonical"
  href="https://www.ohack.dev/project/${project_id}">`; keep `<title>` +
  JSON-LD `Course` script.
- Replace `LayoutContainer`/`ProjectsContainer`/`ProjectsGrid` with
  `<RefinedRoot>` + `.ohx-wrap` (paddingTop clamp to clear the 64px navbar).

### C2. Content
- Render the single `<ProblemStatement headingLevel="h1" …>` as the main element.
- The "This project is just one of many! Head over to projects…" line → a quiet
  `.ohx-link` ("← All nonprofit projects" → `/nonprofits`) placed above the card
  as a soft breadcrumb (it currently links to `/nonprofits`; keep that target).
- Logged-out `LoginOrRegister` CTA: keep component, frame it calmly (same as B3).
- Loading state: refined skeleton/`.ohx-muted` (replace the `Puff` spinners).

---

## 6. Verification

Per `docs/refined-design-system.md` dev gotcha: Next 16 dev chunks aren't
content-hashed — disable cache via CDP (`Network.setCacheDisabled` +
`clearBrowserCache`) when verifying visually; a plain reload shows stale JS.

Check (use real IDs, e.g. project `5840694c9c0a11f08e6bdead38dce737`, nonprofit
`D41SIwT6pc48JNy5zUX7`):
- [ ] `/project/[id]` + `/nonprofit/[id]` render in the refined palette; no
      purple gradient hero, no gradient status chips, no gold apply button.
- [ ] Exactly one `<h1>` on each page (project title on project page; nonprofit
      name on nonprofit page). Inspect DOM.
- [ ] Help toggle / "I want to help" → login redirect / help dialog still works.
- [ ] Collapsible References / GitHub / Events sections still expand; GitHub
      issues, Events, ReferenceItem still render.
- [ ] Nonprofit page: multiple projects render; empty-state apply CTA still fires
      GA `click_apply`; FB pixel init unchanged.
- [ ] og:url / canonical are `www.ohack.dev` (view source).
- [ ] Mobile (`<md`): masthead, metric tiles, and sections stack cleanly; no
      horizontal overflow.
- [ ] `npx eslint` clean on the four touched files; `npm run build` succeeds.

---

## 7. Suggested order & sizing

1. **A (ProblemStatement)** first — it's shared, so both pages improve at once,
   and it surfaces the `headingLevel` contract early. (Largest task.)
2. **B (NonProfit)** — masthead + list + getStaticProps log cleanup + www fix.
3. **C (Project)** — quickest; mostly shell + breadcrumb.

Phase A can ship behind both old wrappers without breaking them (the card just
looks refined inside the old gradient containers temporarily) — but prefer doing
A then immediately B/C in the same pass so the chrome matches.

---

## 8. Docs to update when done

- `docs/refined-design-system.md` → add `/project/[project_id]` and
  `/nonprofit/[nonprofit_id]` to the **Rollout status** list with a one-line note
  (mention the shared `ProblemStatement` rewrite + the `headingLevel` prop + the
  www canonical fix + that `styles/nonprofit/styles.js` is now orphaned).
- `CLAUDE.md` → extend the "Refined design scope" paragraph with the two new
  routes and the key invariant: **`ProblemStatement` is shared by both pages,
  always inside a `RefinedRoot`, so it uses scoped `.ohx-*` classes; pass
  `headingLevel="h2"` on the nonprofit page (N cards) and `"h1"` on the project
  page to keep one `<h1>`.**
