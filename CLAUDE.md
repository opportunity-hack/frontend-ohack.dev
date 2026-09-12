# OHack Frontend Development Guidelines

## "Refined" design scope (civic-editorial facelift)

Full spec + rollout checklist: **`docs/refined-design-system.md`** (read this before extending the look to more pages). Migrated so far: `/` (`src/pages/index.js`), `/projects` (`src/components/ProjectList/*`), the global NavBar (incl. a refined mobile layout — centered logo + refined dropdown), `/about`, `/about/judges`, `/about/mentors` (`Mentorship` rewritten as refined sections), `/about/success-stories`, `/about/completion`, `/sponsor`, `/nonprofits` (`NonProfitList` + new calm card `NonProfitListTileRefined`; original `NonProfitListTile` stays for event pages), `/blog` (`BlogPage`; reused `News` list kept), `/onboarding` (refined chrome; wizard logic intact; **July 2026 content overhaul** — 9 steps: Welcome, Mission, How It Works [full lifecycle incl. post-hackathon Definition of Done + project-status ladder], Get Involved [hacker/mentor/judge/volunteer/nonprofit role cards], Using the Site [site map + first-steps guide + "Anatomy of a project page" numbered walkthrough (problem → code → plan → people; mirrors ProblemStatement.js section order — keep in sync) + "public portfolio" band: GitHub/Slack/demo-videos/public-profile are what recruiters can review; work is documented as GitHub Issues for public credit — no issues in a repo → pull the code and write them like a PM], Slack, Introduce Yourself, FAQs, Feedback. New sections: `HowItWorksSection`/`RolesSection`/`WebsiteTourSection` in `src/components/Onboarding/`; `JudgingOverview`/`MentoringOverview`/`BuddySystem` are now orphaned — don't re-add them or their claims. FAQ answers must reflect real flows: there are NO project leads, NO commenting on projects, NO buddy system — joining a project = "Want to help?" toggle / its Slack channel / GitHub repo (write Issues like a PM if none exist) / next hackathon. **Design contract:** step content renders inside a scoped `onboardingTheme` ThemeProvider (in `pages/onboarding/index.js` — Fraunces headings, Hanken body, navy/terracotta palette, flat hairline Papers/Cards; don't reintroduce elevation shadows, hover-lifts, or rainbow chips) and every step opens with the shared `StepHeader` (renders `<h2>`; the page masthead owns the `<h1>`). Slack step leads with the two-account gotcha (an ohack.dev login [usually Google] does NOT create a Slack account — join via `/signup`) and real channel deep links: #introductions C01EY49JV8U, #ask-a-mentor C01E5CGDQ74, #random C06BRHRS5BQ, plus per-project #npo-* channels; never reference #help/#team-formation/#buddy-matching/#project-matching — they don't exist), `/signup` (full rewrite: editorial hero, "What you get" benefit cards, numbered join steps beside the framed `join_slack_1.png`, navy CTA band; primary CTA is now a real `<a href={slackSignupUrl} target="_blank">` — dropped the JS `router.push`/`window.open` branch; `handleSignupClick` only fires the `CompleteRegistration` GA event), `/volunteer`, `/about/hackers`, `/about/process` (refined chrome; Mermaid flow + Gantt diagrams kept in calm card frames), `/praise` (refined chrome; `PraiseBoard` feed kept), `/hack/code-of-conduct` (full rewrite: editorial hero, core-values cards, numbered accessibility list, expected-vs-unacceptable two-col w/ +/× markers, navy CTA band), `/profile/[userid]` public (`PublicProfile`), and a full refined pass on the own `/profile` editor (`Profile.js` — editorial masthead, hairline sticky tab strip, scoped navy/terracotta MUI theme, `PanelHeader` on every tab, privacy legend on Basic Info, hairline rules in Volunteer History, `.ohx-card` Giveaway Entries; form logic untouched), `/myfeedback` (full rewrite: editorial hero, navy CircularProgress score ring w/ Fraunces number, hairline skill accordions w/ navy LinearProgress bars, `.ohx-card` entries + `.ohx-tag` chips) and `/feedback/[userid]` (`GiveFeedback`, `ssr:false`: hero + `Section`-framed form, navy-themed MUI Select/Radio/Slider/Checkbox, native `.ohx-btn` submit; also fixed a pre-existing hooks-order bug where `if (!user)` returned before `useEffect`), `/hack/[event_id]/manageteam` (full rewrite: `RefinedRoot`+`RefinedFonts`, editorial masthead, `.ohx-card` gating panels, calm `--surface-2` panels for auth/apply gates; split `error` → `teamsError`+`formError`; lazy Slack/nonprofit fetches gated by `activeStep`/`showNewTeamForm` + `slackFetchedRef`/`nonprofitFetchedRef`; `onTeamUpdated` callback propagated to `TeamStatusPanel` so DevPost/demo label updates without reload; `fetchMyTeams()` after submit + scroll to `#team-hub`; `noindex` meta; no PII logs; `active_days=365` for Slack fetch), and `/hack/[event_id]/team/[team_id]` (full rewrite: editorial masthead + hairline `.ohx-card` sections + a **deep-linkable sticky Table of Contents** — sections are `<section id scrollMarginTop:96>` with hover `#` copy-link anchors (keyboard accessible via `&:focus-visible`), the TOC lists only present sections (`aria-current="location"`) and tracks the active one via `IntersectionObserver`; embedded `MentorTeamPanel`/`TeamCompletionChecklist` keep their own styling in anchored `headed={false}` wrappers). **Key invariants on this page:** (1) Status labels come from `TEAM_STATUS_OPTIONS.find()` via `statusLabel()` — never render raw enum strings like `NONPROFIT_SELECTED`; winning statuses get a 🏆 prefix from `getWinningStatus()`; `INACTIVE` skips the status tag since the dot already conveys it. (2) `SectionBlock` is **module-scope** (not inside the component) — defining it inside caused a remount storm on every IntersectionObserver `setActiveId` tick, wiping in-progress mentor note drafts and reloading the demo iframe; it receives `copiedId`/`onCopyLink` as props. (3) `parseLocalDate` from `src/lib/dateUtils.js` is used for all event window checks (`eventHasStarted`, `eventEnded`) so date-only strings aren't parsed as UTC midnight. (4) Membership check uses `useTeamMembership(eventId, teamId)` from `src/hooks/use-team-membership.js` — shared by the page and passed as `isOnTeam`/`membershipChecked` props to `TeamCompletionChecklist` (no duplicate fetch). Page uses result to show: "Manage your team" primary CTA for members, a combined nudge card for missing DevPost/demo, and a ghost "Want to join this team?" affordance for non-members when status is joinable. (5) Nonprofit: never render `selected_nonprofit_id` text — only show when `nonprofitData.name` is available; `getStaticProps` fetches `{ name, description }` into `nonprofitData`; a "Nonprofit partner" section card links to `/nonprofit/<id>`. (6) `awards[]` rendered as `ohx-tag--accent` chips after the status tag. (7) All GitHub repos in `github_links[]` rendered (handles both string and `{link,name}` shapes). (8) `getStaticProps` rethrows network errors (ISR keeps the last good version) and returns `notFound` only on genuine 404. **Harmonized (not full rewrite):** `/hack` index (keeps its bespoke finder + `HackPageNav`; hero/CTAs/Support band recolored via inline `RX` tokens). The upcoming/current event cards were refined too: `HackathonList` full-mode heading → Fraunces eyebrow; `EventFeature` full card rewritten to a refined hairline card (eyebrow date + quiet type tag, Fraunces title, navy donation rings, navy-primary/ghost event-link buttons, "View event →"; fixed the old nested-anchor bug; var-fallback colors since `/hack` isn't a `RefinedRoot`). `ImpactMetrics` (shared with the archive) → warm `--surface-2` tiles with Fraunces navy numbers + "Impact at a glance" overline (was rainbow `color`-prop numbers). `/hack/[event_id]` got a **masthead-led refined pass**: body wrapped in `<RefinedRoot>` (it's now the `<main>`; all section IDs + `TableOfContents` + `FloatingNavigation` preserved), `HackathonHeader` rebuilt into a scope-independent editorial masthead (inline styles w/ `var(--x, fallback)` so `/agenda` + `/census` also benefit), refined "Build a team" buttons + recap teaser. Phase-2 refined the **event-only** sub-components: `NonprofitList` (calm clickable cards + navy view-toggle), `EventConstraints`, `DonationProgress` (navy rings), `EventCountdown` (navy countdown card replacing the gradient + flat timeline), `TeamList`/`TeamCard` (flat hairline cards, Fraunces team names, refined "Team members" label + navy Join button — `TeamList` is event-page-only despite earlier substring matches in admin/event-teams; **profile avatars load lazily per-card via IntersectionObserver with `rootMargin: "200px"`, tracked by `fetchedTeamProfilesRef` Set** — do NOT restore the eager `fetchTeamMemberProfiles(teams)` call on mount that fired N parallel requests for all 30+ cards at once). **Backend C7 enrichment:** `get_single_hackathon_event` (`services/hackathons_service.py`) now calls `_enrich_teams_users_batch` after converting team DocumentReferences — one `db.get_all` across all members of all teams, deduped, so the frontend receives `users[]` already as `{id, user_id, name, nickname, profile_image}` objects. `HackathonResults.js`/`TeamList.js` handle both the old id-string and new object shapes (backwards-compatible). The list endpoint `get_hackathon_list` is NOT enriched — only the single-event getter., and `HackathonLeaderboard` (flat cards, warm stat tiles w/ terracotta icons + Fraunces navy numbers, squared navy Org button). **Phase 3 (done) finished the event page**: `EventLinks` (6 rainbow app buttons → one calm uniform card set + calm social-proof strip), `InteractiveFAQ` (flat hairline accordions), `HackathonResults` (calm `--surface-2` frame, Fraunces navy stat numbers; gold/silver/bronze winner medals kept), `VolunteerList` (`PersonCard` → flat hairline). The **shared** ones (`InteractiveFAQ`, `HackathonResults`) use **inline CSS-var fallbacks** (`var(--ink,#16181D)`) so they render refined on their non-`RefinedRoot` routes too (verified on `/hack/[event_id]/results` + `OnboardingFAQ`) — no per-route gating. A final chrome pass refined `TableOfContents` (navy active pill, was magenta), `FloatingNavigation` (navy FAB), `VolunteerList` (navy "Learn more" + navy availability chips; in-person stays green), and `MentorAvailability` (navy banner/Slack button). The event page is now fully refined end-to-end. Also refined: `/hack/request` (host-an-event page + `HackathonRequestForm`) and `/office-hours`. **`/hack/request` is student-first** — org-type selectable cards default to **university** (was corporate); the **$5k budget minimum was removed** (slider min `$0`, never blocks submit, reframed as optional funding); the donation-% ask is **corporate-only** (forced to 0 at submit otherwise); phone is optional; rainbow Papers → calm `--surface-2` cards; everything navy/terracotta via a scoped MUI `ThemeProvider` (`createTheme(base, …)`). **`formData` keys are preserved** — `HackathonRequestDetailDialog`, the edit page `/hack/request/[request_id]`, and the backend all depend on them. **Scroll gotcha:** step nav now `scrollIntoView`s a `formTopRef` on the form's Paper (`scrollMarginTop:88`), NOT `window.scrollTo(0,0)` (which overshot to page-top now that the form sits below the hero). `/office-hours` now renders its JSON-LD, uses the idempotent `initFacebookPixel` (was a raw `ReactPixel.init` — CWV rule), and dropped the artificial 1s loading delay + dead ICS code. Also refined: `/nonprofit/[nonprofit_id]` (`NonProfit.js` — editorial masthead, meta row as `.ohx-tag`/`.ohx-link`s, projects list, canonical www fix) and `/project/[project_id]` (`Project.js` — `RefinedRoot` chrome, soft breadcrumb, canonical). Both share `ProblemStatement.js` which was fully restyled (purple gradient hero → calm `--surface-2` band; gradient chips → `.ohx-tag`; gradient metric tiles → Fraunces navy tiles; gradient section headers → hairline `.ohx-card`; gradient CTAs → `.ohx-btn`). **Key invariant:** `ProblemStatement` is ONLY ever inside a `RefinedRoot`, so it may use scoped `.ohx-*` classes directly (no inline `var(--x, fallback)` needed). Pass `headingLevel="h2"` from the nonprofit page (N cards, nonprofit name is the `<h1>`) and `headingLevel="h1"` from the project page (project title is the `<h1>`). The "Want to help?" toggle is hidden when `status === "production"` (live projects don't need volunteers) but stays visible for users already helping so they can toggle off; `maintenance` status keeps the toggle. **"Code & Tasks" (July 2026 discoverability fix):** it is an ALWAYS-VISIBLE section (`id="code-and-tasks-<ps_id>"` — unique per problem statement because nonprofit pages render N cards; `scrollMarginTop: 96`) directly after the Project Description — never move it back into the collapsed accordion trio (burying it was the bug; only References/Events stay accordions). Repo list = `problem_statement.github` (handles legacy string shape) MERGED with repos from hackathon teams in the already-fetched event data (`team.problem_statements` includes the ps id; `selected_nonprofit_id`-vs-`resolvedNonprofits` fallback applies ONLY to teams with no `problem_statements` — avoids claiming a sibling project's repos on multi-project nonprofits), deduped by `normalizeRepoLink`; team repos render under a "from hackathon teams" label with "Built by {team} ({event})" attribution, and a duplicate just enriches the project-level card. Live issue data (counts + top-5 open titles per repo) is fetched through the public backend proxy `GET /api/github/issues?org&repo&state=all` ONLY once the section scrolls near (fire-once IntersectionObserver, `rootMargin: 200px`) — batched Promise.all + `issuesRequestedRef` dedupe + ONE setState (never per-repo), errors swallowed (static links still render); backend caches this route 10 min. `RepoCard` + repo-link helpers are **module-scope** (SectionBlock remount lesson). When no repos exist at all, render the "Where's the code?" `--surface-2` card (event-page links + `slack_channel` button) — never hide the section silently. Header top row shows an `#code-and-tasks` anchor `.ohx-tag` when repos exist. Backend fix-forward: `approve_team` (`api/teams/teams_service.py::_link_repo_to_problem_statements`) now also appends the created repo to the linked problem statement(s)' `github` array (team `problem_statements` refs preferred; single-PS-nonprofit fallback; ambiguous → skip + log) and clears `get_single_problem_statement_old`'s cache. **Events & Teams section:** `src/components/Events/Events.js` was rewritten as refined event cards — title is `event.title` (NOT `{location} {type}` — that rendered a street address as the heading), Past/Upcoming `.ohx-tag`, compact date range via `parseLocalDate`, location + description as muted meta, constraint `.ohx-tag`s, ghost Event-page/DevPost buttons, plus a **read-only** teams list (name, member first-names, link to `/hack/<event_id>/team/<id>`) fed by `teamsByEvent` from the same ProblemStatement memo that derives team repos. The old interactive join/leave path was dead (its `teams` state was never populated) and was removed from ProblemStatement along with the per-user `userDetails` fetch — `event-teams.js` and `event-team.js` are now orphaned; don't re-add join/leave here (team joining lives on the event page / manageteam). **Reference Documents:** `ReferenceItem.js` restyled from outlined MUI buttons to hairline row-cards (`ohx-card--hover` `<a>` rows: navy kind icon + sentence-case name + kind `.ohx-tag` [GitHub/Slides/Document/Video/Link] + open-in-new indicator; `docs.google.com/presentation` now classified as Slides); video references keep their `VideoDisplay` embed. Only ProblemStatement consumes it, so `.ohx-*` classes are safe there. `styles/nonprofit/styles.js` is now orphaned — leave in place.

See `docs/refined-design-system.md`. Pattern for new pages: keep `Head`/`getStaticProps`/schema verbatim, add `<RefinedFonts/>`, wrap body in `<RefinedRoot>`, rebuild sections with `.ohx-*` classes, one `<h1>`, preserve GA.

The homepage and projects page were reimagined away from the old busy/multi-gradient look into a calm "civic editorial" system. Shared tokens + utility classes live in `src/components/design/refined.js`:

- `<RefinedRoot>` — a `styled('main')` scope that defines CSS variables (`--paper`, `--ink`, `--brand` deep navy `#1B3A6B`, `--accent` terracotta `#E2552E`, `--display` Fraunces, `--body` Hanken Grotesk) and utility classNames (`.ohx-wrap`, `.ohx-display`, `.ohx-eyebrow`, `.ohx-lead`, `.ohx-btn(--primary|--ghost)`, `.ohx-link`, `.ohx-card(--hover)`, `.ohx-tag(--accent)`, `.ohx-sponsors` grayscale logos, `.rise` staggered load anim w/ `animationDelay`). Everything is scoped — it does NOT touch the global MUI light theme.
- `<RefinedFonts />` — Google Fonts `<link>`s (Fraunces + Hanken Grotesk, preconnect + `display=swap`); drop into each page's `next/head`.
- `Eyebrow`, `Stat`, `Arrow` — small shared presentational atoms.
- Rule of thumb here: one accent color, hairline rules, generous whitespace, ONE primary CTA per section. Don't reintroduce colored chips/gradients — that's the "too busy" regression we removed.
- `LeadForm` gained a `bare` prop (drops its lavender box + icon + "Stay in the loop" heading) so the homepage newsletter band provides its own calm framing.
- `useHackathonEvents` now returns `loading` (was destructured but never returned). Homepage uses it to reserve event-grid space (CLS).
- Projects page no longer uses `ProjectList/filters/*` (FilterBar/ProjectSearch) or the `LoginOrRegister` banner — ProjectList has its own inline search + sort `<select>` + quiet status-toggle tags. Those filter files are now orphaned but left in place.
- **Next dev gotcha (verifying these pages):** Next 16 dev chunks are NOT content-hashed, so the browser serves stale JS across hard navigations even after a successful Fast Refresh rebuild. To verify a change visually, disable cache via CDP (`Network.setCacheDisabled` + `clearBrowserCache`) — a plain reload/`?cachebust` will keep showing the old bundle.

### Global NavBar (part of the refined look — applies site-wide)

`src/components/Navbar/Navbar.js` + `styles.js` were restyled from the solid-blue MUI AppBar to a light, frosted "civic editorial" bar so it's cohesive with the refined pages everywhere: `backgroundColor: rgba(251,250,246,0.82)` + `backdropFilter: blur` + `borderBottom: 1px solid #E7E1D4`, `elevation={0}`, ink (`#16181D`) links, hover → brand navy `#1B3A6B`. Load button is a squared navy button (no more 1.5rem rounded pill). Links are sentence-case (`textTransform: none`) — keep the page-link `<Button>`s and the dropdown `NavbarButton`s in sync or the casing diverges (MUI Button defaults to uppercase). Logo swapped from the white wordmark to `OpportunityHack_Logo_Dark_Blue_Banner.png` (3:1) so it shows on the light bar; the matching `<link rel=preload>` was updated too. **Don't** change the SSR/64px-height/fixed-width-auth-slot invariants (CWV). Nav link font is `FONT_BODY` from `src/styles/fonts.js` — since the Aug 2026 typography overhaul the Hanken webfont loads globally via next/font, so the NavBar renders it on every route.

## Project "Who's helping" roster (Sep 2026, #359)

`ProblemStatement` no longer shows helpers as a bare count + switch. Right under the metric tiles it renders `src/components/ProblemStatement/HelpersRoster.js` (module-scope subcomponents; only ever inside a `RefinedRoot`, so `.ohx-*` is fine): people who raised a hand split into **Developers / Mentors** as avatar+name chips linking to `/profile/<db_id>` (Firestore doc id — never the OAuth `user_id`), each with "since <Mon YYYY>" (relative under 14 days), a "· you" marker, `+N more` past 8 per group, a Slack CTA to the project's `#slack_channel` ("that's where helpers coordinate"), and the existing "Want to help?" switch in its footer (same gating: hidden on production/paused except for current helpers). **Data:** `GET /api/problem-statements/<id>/helpers` (backend `services/problem_statements_service.py::get_problem_statement_helpers`, 60s cache cleared on every toggle) returns `{helpers:[{db_id,user_id,type,since,name,nickname,profile_image}], counts:{hacker,mentor,total}, slack_channel}` — ONE batched request per project. It replaced the old effect that fetched a full profile per `helping` entry only to find the current user; the current-user check is now `findCurrentUserHelper(helpers, profile)` (db id first, `user_id` fallback — the own-profile payload carries `id`). Pure helpers + tests: `helpersData.js` (`normalizeHelpers` applies the SAME dedupe as the backend — earliest `timestamp` wins as `since`, latest `type` wins — to the static `helping` array so counts SSR without duplicates; `upsertHelper`/`removeHelper` for the optimistic toggle, followed by a refetch AFTER the toggle promise resolves). `enriched=false` (endpoint 404/older backend) renders a counts-only sentence instead of nameless chips. Helping entries already carry `timestamp` (no schema change); the toggle service now updates a returning helper's row in place (keeps the original timestamp) instead of appending duplicates.

## Donation nudges (Sept 2026)

`src/components/design/DonateNudge.js` is the single source for donation CTAs: `DONATE_URL` (the Givebutter general fund `givebutter.com/a5MSes` — the same link `/sponsor` uses), `donateHref(placement)` (appends UTM params, `utm_content=<placement>`), `trackDonateClick(placement)` (GA `DONATION` category, label `donate_click`, `placement` param), `DonateLink` (renders `.ohx-link`; pass `plain` on Portal surfaces like MUI Dialogs where RefinedRoot classes/vars don't reach), and `DonateCard` (hairline `.ohx-card` + ghost button; RefinedRoot-only; max ONE per page). Placements: homepage "Made possible by" band (`home_sponsors` — a muted "…and by individual donors" line + third `.ohx-link`), onboarding Mission step closing card (`onboarding_mission`), FAQ "How is Opportunity Hack funded?" (`onboarding_faq`), Feedback thank-you card (`onboarding_feedback_thanks`), completion dialog (`onboarding_complete`). **Rules:** plain links only — never load Givebutter's widget script on landing/onboarding (third-party JS hurts CWV and the widget is off-brand); the legacy `GiveButterWidget` (MUI gradient card, widget `p5Ak4p`) stays confined to application success screens. Ask AFTER value is delivered — never on the Welcome step. Phase-2 idea: live goal/raised numbers via the Givebutter API in `getStaticProps`, not the Goal Bar widget.

## Project (problem statement) statuses

`src/lib/projectStatus.js` is the **single source of truth** for project statuses: the five-stage ladder (`concept → hackathon → post-hackathon → production → maintenance`) plus the off-ramp **`paused`** (work intentionally on hold — NOT a ladder rung). Consumers: `ProjectProgress` (refined stepper rail on project pages + a visible one-line explanation of the current stage; paused mutes the whole rail), `ProblemStatement` (`renderStatus` tags: production → "Live", maintenance → "Live" + "Welcomes Help", paused → quiet "Paused"; the help toggle is gated by `acceptsNewHelpers()` — hidden for production AND paused except for existing helpers), `ProjectList`/`ProjectCard`/`FeaturedProjects` (filter chips, labels, paused sinks in help-oriented sorts and is never featured), the onboarding `HowItWorksSection` ladder, admin `/admin/problems` (status is a **Select** of catalog values — don't revert to free-text; legacy values render as "(legacy)" options), and `/project/[project_id]` SEO meta. Add a new status to the catalog, not to individual components. Backend needs no change — status is a free-form string passed through create/update (`model/problem_statement.py`). `ProjectProgress` is only ever rendered inside a `RefinedRoot` so it uses refined CSS vars directly; the old duplicate `src/components/project-progress.js` and `ProjectProgress/styles.js` were deleted — don't re-add them.

## Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run postbuild` - Generate sitemap (runs automatically after build)
- `npm run test` - Run Jest unit tests
- `npm run test:e2e` - Run Playwright E2E tests
- `npx eslint src/**/*.js` - Run ESLint on specific files
- `npx prettier --write src/**/*.js` - Format code with Prettier

## Code Style

- Use functional components with React hooks
- Dynamic imports with Next.js for code splitting
- Use Material UI (MUI) components for consistent UI
- Follow React best practices for performance
- Proper error boundaries and fallbacks for dynamic imports
- Organize imports: React, Next.js, libraries, then local imports
- Prefer async/await over promise chains
- Use descriptive variable/function names (camelCase)
- Component file structure: imports, component, exports

## Project Structure

- `/src/pages` - Next.js routes
- `/src/components` - Reusable React components
- `/src/lib` - Utility functions and shared code
- `/public` - Static assets

## Environment

- Node v22.x
- Next.js 16.x
- Material UI for components
- Use nvm for Node Version Management

## Testing

- Don't worry about writing or running tests
- Jest for unit tests
- Playwright for end-to-end tests
- Test files located in `__tests__` folders for components
- E2E tests located in `/src/tests/e2e/`
- Mock implementation examples available in test files

## Admin layout width

`AdminPage`'s `AdminPageContainer` (`src/components/admin/AdminPage.js`) is a plain `Box` (NOT MUI `Container`) with `width: 100%`, `maxWidth: none` at all breakpoints. The Container variant kept reintroducing a 1400px desktop cap via its internal media-query rules even with `maxWidth={false}` — using `Box` avoids that. Admin tables (teams, volunteer, profile, hackathon edit) need the full viewport on desktop. Don't switch back to `Container` or add a maxWidth here. If a specific admin section wants centered narrower content, scope it to that section's wrapper. `SectionContainer` (`src/components/admin/hackathon-edit/SectionContainer.js`) carries explicit `width: 100%; boxSizing: border-box` on its Paper so every section renders to the same visible width regardless of inner content (TextField stack vs. Grid of cards).

### Hackathon admin section frame contract

Every section under `/admin/hackathons/[event_id]?section=...` MUST render through `SectionContainer` so the outer frame width is identical across sidebar tabs. Heavy sections (Teams, Judging, Volunteer, CheckIn) that embed their own Paper-laden workbenches/tabs use `<SectionContainer disableGutters>` — the outer Paper border + `width:100%; boxSizing:border-box` contract is preserved, but the inner 24px padding is dropped so the embedded content doesn't double-pad. Heavy sections add their own `Box sx={{ p: { xs:2, md:3 } }}` around the body (after the Tabs strip if any) so spacing inside the frame still feels right. `HackathonAdminLayout`'s content Box uses `scrollbarGutter: stable` so a section with internal scrolling doesn't shift the visible width by ~17px. Don't reintroduce bare `<Box>` section roots — that breaks the frame consistency and is the bug that motivated this contract.

#### Width clipping layers (don't remove)

Initially the section frame alone wasn't enough — `MealsSection` was visibly wider than `ScheduleSection` because something deep in its tree (Grid item width math or a fixed-width input row) was pushing horizontal overflow up to the document body, which made the whole `AdminPage` card grow and shift the sidebar sideways between section navigations. The fix is layered `overflowX: hidden` clips at every level above the section so overflow never escapes:

1. `AdminPage` root `<Box>`: `overflowX: hidden` + `maxWidth: 100%`
2. `AdminPageContainer` styled: `overflowX: hidden` + `minWidth: 0`
3. `AdminPageContent` styled: `overflowX: hidden` + `width: 100%; maxWidth: 100%; minWidth: 0; boxSizing: border-box`
4. `HackathonAdminLayout` root flex: already has `overflow: hidden`
5. `HackathonAdminLayout` content scroll box: `overflowX: hidden; minWidth: 0; scrollbarGutter: stable; overflowY: auto`
6. `SectionContainer` Paper: `width: 100%; maxWidth: 100%; minWidth: 0; boxSizing: border-box`

Removing any of these and a section that contains wide intrinsic min-content (e.g. side-by-side fixed-width inputs, a wide table, a long unbreakable label) will start shifting the whole admin layout sideways again. Tooltips/dialogs render through MUI Portal so they're not affected by these clips.

## Core Web Vitals (CLS hygiene)

Patterns that must stay in place to keep Google Search Console CWV green:

- **`AxiosWrapper` in `_app.js` MUST stay as a plain static import** — `dynamic(ssr:false)` there disables SSR for the entire app tree (empty `<body>`, empty titles, CWV collapse; June 2026 incident). The placeholder invariants below only work because the full tree SSRs; nothing above `NavBar` in `_app.js` may be `ssr: false`.
- `NavBar` and `Footer` are `ssr: true` in `_app.js`; their loading placeholders in `_app.js` match the rendered heights (NavBar 64px, Footer 760px/560px mobile/desktop). Don't flip them back to `ssr: false`.
- The auth-reactive right side of `Navbar.js` (Log In button ↔ Avatar) must stay inside the fixed-width slot (`minWidth: { xs: 56, md: 140 }`). Adding content there requires keeping both branches the same width.
- `HeartsLeaderboard` reserves `minHeight: { xs: 128, md: 172 }` in both its loading placeholder on `pages/index.js` and in the component's empty state — don't return `null` from it.
- Any new above-the-fold async component on the homepage must reserve space via `minHeight` in its loading fallback. `SimplePlaceholder` (opacity:0 with no height) is not enough.
- Raw `<img>` tags need `width`/`height` attributes. Prefer `next/image` with explicit dimensions.
- Iframes (YouTube, Instagram, Calendar) must be wrapped in an aspect-ratio container (the existing pattern is `paddingBottom: '56.25%'` with `height: 0` + absolutely-positioned iframe) or given a fixed pixel height.
- `initFacebookPixel` in `src/lib/ga/index.js` is idempotent via `pixelInitPromise`. Don't add `ReactPixel.init` calls outside of it.

## Admin Nonprofit Applications (`/admin/nonprofit/application`)

Reviewer-first table (`src/components/admin/NonprofitApplicationTable.js`): 4 merged columns instead of the old 10 raw-field ones — legacy duplicate fields are collapsed per row via exported accessors `applicationOrganization` (`organization||charityName`), `applicationContactName` (`name||contactName`), `applicationIdeaText` (`idea||technicalProblem`). The page's sort/filter (`src/pages/admin/nonprofit/application.js`) uses the SAME accessors — keep them as the single source if fields change. Idea column takes ~46% width, 3-line clamp; "Show more" unclamps in place, and a full-width detail panel appears only for fields with no column (technicalProblem-alongside-idea, solutionBenefits, notes). Don't re-add per-field columns — that's the smushed-Idea regression this replaced. Header row hides below `md` (mobile uses the stacked `data-label` cards). No backend change; data is the `project_applications` collection via `GET /api/messages/npo/applications`.

## Admin Profile Search (`/admin/profile`)

Search-first people-finder. Single file: `src/pages/admin/profile/index.js`. Backend `GET /api/messages/admin/profiles` returns all users; filtering is client-side across ~14 fields (no server-side search). Auth: `userClass.hasPermission("profile.admin")`.

**Backend payload is lean by design.** `get_all_profiles()` (`api/messages/messages_service.py`) explicitly projects only the fields the admin search needs (`_ADMIN_PROFILE_LEAN_FIELDS`) — dropping the heavy `history` field, mailing address fields, `want_stickers`, and `propel_id`. `badges/teams/hackathons` are returned as id-string arrays (the frontend only reads `.length` on these). `volunteering` is compressed to `[{hours}]`. Wrapped in a 5-min TTL cache (`@cached(TTLCache(maxsize=1, ttl=300))`). If you add a new field to the admin profile UI, add it to both `_ADMIN_PROFILE_LEAN_FIELDS` AND clear the cache by restarting (or extend the cache invalidation hook). The per-row `/profile/<id>` route still returns the full doc when an admin opens an individual profile.

Load-bearing details:

- **`?q=<term>` is the canonical search state** and the destination of the Chrome `ohadmin` site-search shortcut (`https://www.ohack.dev/admin/profile?q=%s`). Do NOT add redirects that strip query params (e.g. `router.replace('/admin/profile')` without preserving `...router.query`) — it silently breaks the shortcut.
- URL ↔ input sync uses the CLAUDE.md "Shareable dialog state" pattern: hydrate once with `initFromUrlRef`, react to back/forward via a separate effect with a `lastUrlQRef` echo guard, write to URL via `lodash.debounce` (250ms) with `router.replace({ shallow: true, scroll: false })`.
- Keyboard: `⌘K` or `/` focuses search (with typing-elsewhere guard); `Esc` clears query + focuses search; rows are `tabIndex={0}` with `Enter`/`Space` opening `/profile/{id}` in a new tab.
- Default view is **compact list** (`Table`), not cards. Toggle persisted in `localStorage["ohack.adminProfile.viewMode"]` (values: `"list" | "grid"`).
- Other localStorage keys: `ohack.adminProfile.setupHelpDismissed` (Chrome-shortcut tip banner), `ohack.adminProfile.listToastSeen` (reserved for a future toast).
- Quick actions on every row/card link to `/profile/{user.id}` — that's the Firestore `id`, NOT `user_id` (gotcha). Volunteer deep link uses `/admin/volunteer?filter=<email>` (the volunteer page reads `filter=`, not `search=`).
- `BestMatchHero` shows when the query is an exact name/email match or an `@`-shaped query that uniquely hits one email. `MatchPills` strip shows when 2–5 results.
- `highlightMatch(text, query)` is a single-substring helper (not multi-term). Stays consistent with the underlying filter, which also matches the full string against each field.
- `UserSearchDialog.js` still duplicates the fetch+filter logic — extract a shared `useAdminProfilesSearch()` hook when convenient.
- **Scale guard (~3.5k profiles — don't regress):** the search input goes through `useDeferredValue` (TextField updates on `filter`; the filter/sort memo, `bestMatch`, and result lists key on `deferredFilter`), and results are render-capped at `INITIAL_VISIBLE_ROWS` (100) with a "Show N more / Show all" footer (`visibleCount`, reset on query/sort/view change). Filtering still scans all profiles; only the top slice mounts. Rendering the full list unconditionally froze initial load and every keystroke (each row carries ~6 Tooltips + Avatar + LinearProgress + 5 IconButtons).

## Admin Email Compose (`AdminEmailCompose`)

- The component accepts an optional `fixedSubject` prop. When set, the Subject field is read-only and that exact value is sent.
- `ContactSubmissionDetailDialog` passes a subject derived from `submission.inquiryType` matching the backend format in `backend-ohack.dev/api/contact/contact_service.py`: `Contact Us: {inquiry_type_display.lower()} - Opportunity Hack`. The `INQUIRY_TYPE_DISPLAY` map in `ContactSubmissionDetailDialog.js` must stay in sync with the backend's map so admin replies thread with the original confirmation email.

## Admin Communication (`/admin/communication`) + DB-backed Email Templates

`/admin/social-media` is now a redirect stub → `/admin/communication?tab=social`. The Communication page (`src/pages/admin/communication/index.js`) has THREE tabs (`?tab=templates|email|social`, shallow-synced by SLUG lookup — appending slugs never breaks deep links): `EmailTemplateManager`, `EmailCommunication` (Aug 2026 — extracted from SocialMediaManagement, see below), and `SocialMediaManagement` (now social-only: platform status, adhoc Slack message, Threads/news posting; its internal sub-tabs and all email state/JSX were removed, and its loading gate no longer blocks the email UI while social credentials validate). The old social-media page had a Rules-of-Hooks violation (`useCallback` after a conditional return) — fixed in the new page; don't reintroduce early returns above hooks there.

### Email tab (`src/components/admin/EmailCommunication.js`, Aug 2026)

Props `{accessToken, orgId, onSnack}` (EmailTemplateManager convention — no `useAuthInfo` inside). Two modes via a `ToggleButtonGroup`:

- **Personalized / small batch** (the extracted legacy flow): Slack-user picker + paste/CSV custom emails → `BatchEmailDialog`. New **"Include inactive accounts" toggle** — default fetch is `active_days=365`, toggle → `10000` (disabled/deleted/bot Slack accounts are ALWAYS excluded server-side; "inactive" = no Slack profile-record update in the window). Refetch on toggle prunes selections to visible users with an info snackbar (what-you-see-is-what-you-send). Slack-sourced recipients are tagged `source: "slack"` in `getSelectedUsers()` — **load-bearing**: `batchEmailService` routes email-only sources (`custom|csv|slack`) away from `/api/admin/{id}/message` (Slack IDs aren't user-doc ids; that was a silent misroute) and through the batch path.
- **Broadcast via Resend** (`src/components/admin/broadcast/{BroadcastComposer,BroadcastSourcePicker,BroadcastStatusPanel}.js` + `src/lib/broadcastService.js`): 4-step Stepper — sources (registered users / leads / Slack w/ inactive toggle / event volunteers by type+event+approved-only / contact-form submissions filtered by inquiry type [multi-select; `INQUIRY_TYPE_OPTIONS` in `BroadcastSourcePicker.js` — keep in sync with `src/pages/contact/index.js` `INQUIRY_TYPES`] + optional `receiveUpdates`-opt-in-only / pasted emails) → preview counts (`POST /api/admin/broadcasts/preview`) → pick/create a **standing segment** (freeSolo Autocomplete; "Everyone" exists) and sync contacts (background job, 3s polling of `sync-status`; 409 `already_running` → just watch; `stalled` → safe retry) → compose (optional template seed with a **placeholder lint** — `[PLACEHOLDER]`s are NOT substituted in broadcasts, ack checkbox required; Resend merge tags like `{{{FIRST_NAME|there}}}` work) → confirm + Save-as-draft / Send-now / schedule. **Cost guardrail**: Resend bills marketing by CONTACT count (OHack is on the FREE 1,000-contact marketing tier as of Aug 2026; 5k=$40/mo) — the UI warns when a preview/sync exceeds `contact_limit` from the backend (`RESEND_MARKETING_CONTACT_LIMIT`). Unsubscribes are handled by Resend automatically; segment size ≠ delivered count.
- **Contact manager** (`broadcast/ContactManagerPanel.js`, bottom of Broadcast mode): quota bar (total vs `contact_limit`), searchable contact table (render-capped at 200 rows), and quota-reclaim deletes — "Delete unsubscribed (N)" (the safe first lever: unsubscribed contacts can't receive broadcasts but STILL count against quota), "Delete selected", and a typed-DELETE-confirm "Delete ALL" (warns it erases unsubscribe preferences). Deletes are GLOBAL Resend contacts (that's what frees quota), run as one background job at a time (`POST /api/admin/broadcasts/contacts/prune`, modes `unsubscribed|emails|all`, polled via `prune-status`; contacts listed via `GET /api/admin/broadcasts/contacts`, 60s server cache, `?force=true` to bust).
- Shared email/Slack-token parsing utils moved to `src/lib/emailParsing.js` (`validateEmail`, `parseEmailsFromText`, `parseCsvFile`, `normalizeSlackLookupToken`, `parseSlackLookupInput`) — used by both modes; don't re-inline them.
- `BatchEmailDialog` accepts an optional `onSnack` prop — there is **no SnackbarProvider in src/**, so its notistack calls are silently swallowed unless the page's snackbar is threaded through (VolunteerWorkbench still uses the notistack default, unchanged).
- GA (ADMIN category): `admin_email_batch_sent`, `admin_email_inactive_toggle`, `broadcast_preview`, `broadcast_sync_started/_completed`, `broadcast_template_seeded`, `broadcast_created_draft`, `broadcast_sent`.

### Mass-send architecture (Aug 2026 — no more one-request-per-recipient)

`src/lib/batchEmailService.js` `sendBatchEmails()` now partitions recipients: **email-only** recipients (source `custom|csv|slack`) go through `POST /api/admin/broadcasts/batch-send` in chunks of ≤100 (server-side `resend.Batch.send`, transactional quota) unless the message contains a `[QRCode:...]` marker (Batch has no attachments → those and any 404-from-older-backend fall back to the per-recipient `/api/admin/email/send` worker pool, MAX_PARALLEL_SENDS=8); **registered users** keep `/api/admin/{id}/message` per-recipient (it also Slack-DMs them — don't collapse that into batch). `onProgress` + `{results, summary}` contracts are preserved so `BatchEmailDialog`/VolunteerWorkbench retry-failed still works.

**Email templates live in Firestore now** (collection `email_templates`, doc id = template slug) with an append-only `versions` subcollection for history. Backend: `services/email_templates_service.py` + a dedicated blueprint `api/email_templates/email_templates_views.py` (NOT messages_views — that file is frozen per backend CLAUDE.md) serving `/api/admin/templates` (GET list / POST create / PATCH / DELETE / GET `<id>/versions` / POST `<id>/revert` / POST `seed`), all `volunteer.admin`-gated. Versioning rules: content edits bump `version` and append a snapshot; status-only patches don't bump; **revert never rewrites history** — it copies the old version's content forward as a new version with change_note "Reverted to version N". Auto-seeds from `services/email_templates_seed.py` on first list call; `POST /seed` ("Restore defaults" button) re-inserts missing seed templates only, never overwrites edits.

- `email_templates_seed.py` is GENERATED from the frontend's `src/lib/messageTemplates.js` `MESSAGE_TEMPLATES` (the original 22 hardcoded templates). Regenerate rather than hand-editing; editing it does NOT change live emails — the DB is the source of truth after seeding.
- `MESSAGE_TEMPLATES` in `messageTemplates.js` stays as the **fallback + seed source** — don't delete it. `filterTemplatesByType(type, templates?)` and `getTemplateById(id, templates?)` now take an optional templates object; `groupTemplatesByCategory(flatList)` converts the backend array into the legacy grouped shape (excludes `status === "archived"`).
- `useEmailTemplates({accessToken, orgId, enabled})` (`src/hooks/use-email-templates.js`) fetches the admin list with a module-level 60s cache (the volunteer dialogs mount per-row; this prevents refetch storms) and falls back to the hardcoded set while loading/on error. `refresh(true)` busts the cache after admin edits.
- `VolunteerCommunication.js` + `BatchEmailDialog.js` consume the hook (fetch gated on dialog open). VolunteerCommunication's dialog JSX was previously duplicated wholesale in both return branches — now rendered once (`messageDialog` variable); keep it that way. BatchEmailDialog's denial auto-select uses `getTemplateById(id, templates)` with an `autoAppliedMessageRef` guard so the async template load doesn't clobber a message the admin already started editing. On the results step, failed sends can be retried in place and copied to clipboard from the current `results.results[]` entries, so keep per-user failures as structured `{ user, success, error }` items rather than collapsing them into summary-only state. `BatchEmailService.sendBatchEmails()` now uses a bounded worker pool (`MAX_PARALLEL_SENDS = 8`) rather than a purely sequential loop, so the dialog progress UI reports completion counts while multiple requests are in flight.
- Template body conventions unchanged: `[EVENT_ID]`/`[VOLUNTEER_ID]`/`[VOLUNTEER_TYPE]` auto-replaced at send time; any other `[UPPERCASE]` placeholder prompts the sender (see `detectPlaceholders` / `PLACEHOLDER_LABELS`). The template `title` doubles as the email subject.

## Pillar Landing Pages

The following SEO pillar pages follow the `hackathon-judge-opportunities.js` pattern (getStaticProps with openGraphData + structuredData arrays, initFacebookPixel in useEffect, trackEvent on button clicks):

- `/coding-for-nonprofits` — `src/pages/coding-for-nonprofits/index.js` — covers the free software development model, 3-step process, project types, FAQ (8 items), FAQPage schema. Internal links from homepage (Button), about page (inline Link), and NonProfitList component (Alert callout).
- `/hackathon-judge-opportunities` — `src/pages/hackathon-judge-opportunities.js`
- `/recruit-tech-talent` — `src/pages/recruit-tech-talent/index.js` — **recruiter-targeted** funnel (slug = canonical, keyword angle "recruit tech talent / hire developers"). **Refined design** (`RefinedRoot`/`.ohx-*`/Fraunces, like `/sponsor`) but uses the pillar `getStaticProps` SEO pattern (openGraphData + structuredData: WebPage→`about:Service`, BreadcrumbList, FAQPage; `FAQ_ITEMS` is module-scope so the rendered `<details>` accordions and the JSON-LD stay in sync). Lead hooks: proof-over-résumés, mission-driven retention, see-candidates-in-action, and the grit/funnel narrative (mirrors `HackathonFunnel.js` copy). Primary CTA → `/contact?type=recruit` (new `recruit` INQUIRY_TYPE added in `contact/index.js`, links to `/sponsor`); secondary → `/sponsor`. Sponsor-tier facts cited (Transformer $5k = résumé access + during/post recruiting; Visionary $10k = pre/during/post) must stay in sync with `src/data/sponsorData.js` + sponsor benefit grid. Cross-linked from homepage sponsors section + `/sponsor` hero; `recruit` added to `next-sitemap.config.js` 0.8-priority regex.

## SEO Resource Pages

Static pages targeting organic search impressions. Each uses `getStaticProps` with the full openGraphData + structuredData pattern. No Organization node in the page's `@graph` (global one in `_app.js` handles it).

- `/hackathon-judging-criteria` — 4-category rubric (Scope, Documentation, Polish, Security), HowTo + FAQPage schema. Linked from `/hackathon-judge-opportunities` Expert Evaluation section.
- `/coding-for-nonprofits` — free software for nonprofits, FAQPage schema.

## Pillar Pages

SEO landing pages at `/coding-for-nonprofits` (service: free software model) and `/hackathon-for-social-good` (event: the hackathon experience). Cross-linked from homepage (`index.js` pillar link buttons), about page, and each other. Both follow the same pattern: `getStaticProps` with full OG/Twitter meta + structured data (`WebPage`, `BreadcrumbList`, `FAQPage`). The hackathon page also includes an `Event` schema node for Fall 2026. Do not duplicate content between the two — keep the service/event distinction.

## Blog Admin (`/admin/blog`)

Full CMS for the `news` Firestore collection. Mirrors the `/admin/hackathons/[event_id]` pattern (sidebar + hybrid autosave/explicit save).

- **List page**: `src/pages/admin/blog/index.js`. Search across title/description/author/tags, status filter chips (All / Published / Drafts / Archived), table with status chips and inline actions (edit, view-public, delete). "+ New post" creates a draft via `POST /api/messages/admin/news` and redirects to the editor. Delete is hard delete via `DELETE /api/messages/admin/news/<id>` (Firestore doc removed).
- **Editor**: `src/pages/admin/blog/[id].js` + `src/components/admin/blog-edit/` (mirrors `hackathon-edit/`):
  - `useBlogAdmin` — hybrid save: `content` (title/body/featured_image) and `seo` (all seo.\* fields) sections require **explicit Save**; `metadata` (author, tags, status, slug, published_at) autosaves on change (debounced 1.5s). Status change uses a dedicated `setStatus()` that bypasses the debounce so the publish/unpublish chip updates immediately. `beforeunload` warns when any explicit section is dirty.
  - Reuses `SectionContainer` from `hackathon-edit/` for the sticky save bar.
  - URL state: `?section=content|seo|metadata` (shallow router replace).
- **Body format**: posts have `content_format` ("html" | "markdown"). Markdown is authored with `@uiw/react-md-editor` (dynamic, ssr:false) and rendered with `react-markdown` in `SingleNews.js`. Switching from markdown to plain in the editor does NOT delete the markdown — both fields persist. Legacy posts default to "html" so they render unchanged.
- **Backend routes** (in `backend-ohack.dev/api/messages/messages_views.py`):
  - `GET /api/messages/admin/news?limit=&status=` — admin list (includes drafts/archived). Service: `admin_list_news`.
  - `POST /api/messages/admin/news` — create. Service: `admin_create_news`. Skips OpenAI image generation when `featured_image` is supplied. Stamps `slack_ts=time.time()` if missing so existing ordering keeps working.
  - `PATCH /api/messages/admin/news/<id>` — partial update. Service: `admin_update_news`. Only keys in `_ADMIN_ALLOWED_KEYS` get through; clears `get_news` cache.
  - `DELETE /api/messages/admin/news/<id>` — hard delete. Service: `admin_delete_news`.
  - All four are auth-gated with `volunteer.admin`. The original public `POST /api/messages/news` (X-Api-Key) is **untouched** — the Slack integration depends on it.
- **Public `get_news` filtering**: `services/news_service.py::_is_publicly_visible` filters out `status in ("draft", "archived")` for both the list and single-item routes. Over-fetches by 3x so the limit-after-filter still returns enough.
- **New optional fields on a news doc** (all optional; legacy docs without them stay valid):
  - `content_markdown`, `content_format` ("html"|"markdown")
  - `featured_image` (overrides the auto-generated `image`)
  - `author: { name, email, propel_user_id, db_id }`
  - `tags: string[]`, `slug`, `status` ("draft"|"published"|"archived"), `published_at` (ISO)
  - `seo: { title, description, keywords[], canonical, og_image }`
  - `last_updated_by`, `created_by`
- **Public-side honoring** (`src/pages/blog/[blog_id].js` + `src/components/News/SingleNews.js`):
  - When `seo.title|description|canonical|og_image` are set, they win; otherwise current auto-derivation is the fallback.
  - When `content_format === "markdown"`, the body renders via `<ReactMarkdown>`; when not, the legacy `description` plain-text path renders.
  - `tags[]` render as clickable chips; falls back to hashtag regex extraction when absent.
  - `published_at` → `article:published_time` (falls back to `slack_ts_human_readable`).
  - Markdown `<img>`s render with `loading="lazy"` and `max-width: 100%; height: auto` to preserve CWV.
- **GA tracking**: admin actions emit events under `EventCategory.ADMIN` — `admin_blog_view_list`, `admin_blog_create`, `admin_blog_edit_save` (per section), `admin_blog_publish`, `admin_blog_unpublish`, `admin_blog_archive`, `admin_blog_delete`, `admin_blog_open_ga`. Public-side tracking is unchanged (lives in `SingleNews.js` `gaButton` helper + `ScrollTracker`).

## Social Media Integration

### Overview

The social media integration system allows admins to post Opportunity Hack news to various social media platforms directly from the admin panel. The system is designed with a generalized architecture that makes it easy to add new social media platforms.

### Architecture

- **Service Layer**: Abstract `SocialMediaService` base class with platform-specific implementations
- **News Service**: Fetches news from `/api/messages/news` endpoint
- **Social Media Manager**: Orchestrates posting to multiple platforms
- **Admin UI**: Located at `/admin/social-media` for managing posts

### Current Platforms

- **Threads**: Fully implemented with Meta's Threads API
- **Twitter/X**: Placeholder for future implementation
- **LinkedIn**: Placeholder for future implementation

### Environment Variables

Configure these in your `.env` file:

```env
# Threads API Configuration
THREADS_ACCESS_TOKEN=your_threads_access_token_here
THREADS_USER_ID=your_threads_user_id_here
THREADS_USERNAME=opportunityhack
```

### Getting Threads API Credentials

1. Create a Meta Developer account at https://developers.facebook.com/
2. Create a new app and enable the Threads API
3. Generate a long-lived access token for your Threads account
4. Get your Threads user ID from the API
5. Add the credentials to your `.env` file

### Usage

1. Navigate to `/admin/social-media` in the admin panel
2. The system will automatically fetch latest news from the backend
3. Use "Preview Mode" (dry run) to see formatted posts before publishing
4. Configure which platforms to post to in the settings
5. Click "Post to Social Media" to publish (or "Preview Posts" in dry run mode)

### Adding New Platforms

To add a new social media platform:

1. Create a new service class extending `SocialMediaService`:

```javascript
// src/lib/social-media/TwitterService.js
import { SocialMediaService } from "./SocialMediaService";

export class TwitterService extends SocialMediaService {
  constructor(credentials) {
    super(credentials);
    this.name = "Twitter";
    this.characterLimit = 280;
  }

  async validateCredentials() {
    // Implement Twitter credential validation
  }

  async post(content) {
    // Implement Twitter posting logic
  }
}
```

2. Add the service to the manager in `SocialMediaManager.js`:

```javascript
// In createFromEnvironment method
if (env.TWITTER_API_KEY && env.TWITTER_API_SECRET) {
  const twitterService = new TwitterService({
    apiKey: env.TWITTER_API_KEY,
    apiSecret: env.TWITTER_API_SECRET,
    // ... other credentials
  });
  manager.registerService("twitter", twitterService);
}
```

3. Add environment variables to `.env`
4. Update `SUPPORTED_PLATFORMS` in `src/lib/social-media/index.js`

## Volunteer Time Tracking (`/volunteer/track`)

Refined rewrite (`RefinedRoot` + `.ohx-*`, navy/terracotta, native form controls — no MUI for inputs). Page is wrapped in `withAuthInfo` (client-rendered), which has two load-bearing consequences:

- **Fonts load globally via next/font** (Aug 2026) — the old `useEffect` Google-Fonts injection was removed along with `<RefinedFonts/>` (now a null stub). Nothing font-related is needed on this page anymore.
- **Verify with cache disabled** (Next 16 dev stale-chunk gotcha) — a plain reload serves old JS and the change looks like it didn't apply.

**Tracking model = two numbers: committed vs actively-tracked.**
- **Live session** (`FunVolunteerTimer`) is **wall-clock based**. Start POSTs `{commitmentHours, reason}` and persists `{startEpoch, commitmentHours, reason}` to `localStorage["volunteeringSession"]`. Elapsed = `now − startEpoch`, **capped at the committed total** (prevents overnight runaway) — survives refresh/background tabs (was `setTimeout` tick-counting, which throttled in bg tabs and lost the session on refresh via a stale-`isVolunteering` save). Auto-finalizes (POST `finalHours`) when elapsed hits the commitment; manual "End" POSTs elapsed. Legacy `localStorage["volunteeringState"]` is cleared on load.
- **Manual log** ("Log time you already did"): POSTs `{commitmentHours:h, finalHours:h, reason, manual:true, timestamp}` — one entry carrying BOTH so both totals + the table row reflect it (`manual` tag shown). Backdates via `timestamp`.
- Date range uses native `<input type=date>`; fetch normalizes to start-of-day/**end-of-day** ISO so the selected end day is inclusive (the old MUI DatePicker sent local-midnight → UTC, excluding same-day sessions).
- `FunVolunteerTimer` ring shows elapsed filling toward the commitment; `VolunteerStatsTable` is a hairline day-grouped table. Both use CSS-var fallbacks so they render refined inside `RefinedRoot`. On-theme `Toast` (not MUI Snackbar); single inline error (no Alert+Snackbar duplicate).

**Backend** (`backend-ohack.dev/services/users_service.py`): `save_volunteering_time`/`get_volunteering_time` go through `_resolve_and_ensure_user()` which **lazily creates the `users` doc** — new users with no profile doc previously 404'd on both read and write (the "Failed to load your volunteer data" bug + couldn't start a session). `get_volunteering_time` returns `([],0,0)` (never None/404) and filters in ONE pass (an entry may carry `commitmentHours`, `finalHours`, or both — no duplicate table rows).

## Volunteer Letter Generator (`/hack/[event_id]/letters`)

Self-service page where a volunteer answers a branching checklist that _picks_ one of four letter types (General Volunteer, SE/OPT, Mentor, Judge), fills details against a live preview, and submits to OHack to review/sign. Auth-gated (`RequiredAuthProvider`, like the application forms) with profile prefill of recipient name/email.

- Files: page `src/pages/hack/[event_id]/letters.js`; logic/templates in `src/components/Letters/` — `letterConfig.js` (pure: `ORG` constants, `runChecklist(answers)`, `*_FIELDS`, `encode/decodeLetterState`), `LetterChecklist.js` (Q1–Q4 branching UI), `LetterPreview.js` (the print surface; renders all 4 letters).
- **Decision safety (do not regress):** OPT letter is offered ONLY when Q3=initial post-completion OPT AND all 4 Q4 acks checked. STEM extension → blocked to General; "not sure" → advisory + General; mentor/judge branches never reach OPT. `runChecklist` is unit-coverable in isolation — keep its branch table intact.
- **Wording:** General + SE/OPT bodies reproduce the two reference `.docx` verbatim (with variable substitution); Mentor/Judge are event-based service confirmations. Every letter carries the guardrail bullets (volunteer not employee; no compensation; no visa sponsorship; no immigration advice/certification) — never add immigration/legal certifications.
- **Submission reuses `POST /api/contact`** (no backend change) with `inquiryType: "volunteer_letter"`. The message packs a readable summary + a shareable `?d=<base64>` link that re-renders the _filled_ letter so the reviewer types the signer block and prints. `volunteer_letter` is mapped in `ContactSubmissionDetailDialog.js` `INQUIRY_TYPE_DISPLAY` (mirror in backend `contact_service.py` for reply threading if needed).
- **Signer block** (`SIGNER_FIELDS`) is OHack-filled at sign time, left blank by the volunteer. **Print** uses a global `@media print { visibility }` trick (only `#letter-print-root` shows) + `@page { size: Letter; margin: 1in }` — no `react-to-print`. Page is `noindex`. Shareable state via `?d=` follows the "Shareable dialog state" pattern (hydrate-once ref + debounced shallow `router.replace`).

## Application Forms (`/hack/[event_id]/{judge,mentor,hacker,volunteer,sponsor}-application.js`)

**All five application forms are refined (civic-editorial) as of Aug 2026.** `mentor-application.js` is the canonical pattern; judge/sponsor/volunteer were restyled to match it (presentation-only — form logic, validation, submit payloads, reCAPTCHA, persistence, judge passcode unlock, and SEO/JSON-LD untouched). The shared sx constants (`refinedFieldSx`, `refinedStepperSx`+`refinedStepperMobileSx`, `{info,warning,success,error}AlertSx`, `primaryButtonSx`/`ghostButtonSx`, `stepTitleSx`/`stepLeadSx`, `emphasisPanelSx`, `eventMarkdownSx`, etc.) live in `src/components/ApplicationForm/refinedStyles.js` — import from there, never re-declare local copies (mentor/judge/sponsor/volunteer all import it; hacker still carries an older partial local set). Structure per page: RefinedRoot shell → editorial masthead (Eyebrow + Fraunces h1 w/ italic span + lead + 3 `Stat` cards + event-details card + side image card) → ApplicationNav → QR card (gated `Boolean(volunteerId) && isSelected` — the component also self-gates; the outer gate avoids an empty card) → stepper card → form card; each step opens with `Eyebrow`/`stepTitleSx`/`stepLeadSx`. Step nav scrolls to `stepContentRef` (scrollMarginTop 96), not page top — the masthead is tall. Use the shared `scrollToStepContent(ref)` from `ApplicationForm/stepScroll.js` (rAF-deferred, moves focus to the step container [`tabIndex={-1}` + `outline: "none"` on the Box], respects prefers-reduced-motion) — don't hand-roll `scrollIntoView`/`window.scrollTo` in step handlers; the copy-pasted version is how volunteer drifted back to page-top scrolling. Hacker keeps its own equivalent ID-based helpers (`scrollToProgressSection`).

**Typography (Aug 2026 readability fix):** all five forms wrap their body in `<ThemeProvider theme={refinedFormTheme}>` (exported from `refinedStyles.js`, built from `assets/theme.js` via `createTheme(baseTheme, …)`). It pins `FONT_BODY` + px sizes (body1 17px/1.6 — matches RefinedRoot's base, body2 14.5px, button 15px, caption 13px, subtitle1 17px, h6 20px). All `fontSize` values in the five forms AND the shared constants are px (e.g. stepTitleSx `26px/32px`, stepper labels `14.5px`/`11.5px` mobile). `formProseSx` (`maxWidth: "40em"` ≈ 70 chars/line at 17px) caps multi-sentence prose inside the full-width form cards; the judge "What good judging looks like" panel uses it, with `--ink` (not `--muted`) on its primary copy. Note `createTheme(theme, overrides)` only deep-merges — pin `fontFamily`/`fontSize` per variant; the top-level `typography.fontFamily` does NOT regenerate variants.

**Top spacing contract (fixes the giant page-load gap):** the outer `<section className="ohx-wrap">` uses `style={formSectionStyle}` from `refinedStyles.js` (`clamp(88px, 9vh, 108px)` top — the section is the FIRST in-flow element and clears the absolute 64px NavBar itself). `FormPersistenceControls` renders INSIDE the form flow (right above the stepper card) with `sx={{ mt: 0, mb: 2 }}` — never move it back above the `<section>`: its default `mt: 10` (NavBar clearance for legacy pages) stacks with the section padding and produced ~250px of dead space before the masthead.

**Intro video (`IntroVideoField`, judge-only today — designed for mentor/hacker reuse):** `src/components/ApplicationForm/IntroVideoField.js` is a controlled field (URL string lives in the parent's `formData`, so persistence + submit flow through for free). Upload path reuses the portfolio bio-video signed-URL mint (`POST /api/users/profile/bio-video/upload-url` → XHR PUT to GCS) but deliberately NEVER calls the `POST /api/users/profile/bio-video` finalize — the applicant's public profile stays untouched; the file just lands under `users/<db_id>/` on the CDN. Link path allowlists YouTube/Vimeo/Loom (mirror of backend `ALLOWED_VIDEO_LINK_HOSTS` in `users_service.py` — keep in sync). Judge form: `formData.introductionVideoUrl`, required in `validateBackgroundAndExperience`, rendered in Step 2 after `whyJudge`, mapped in `loadFormDataSequentially`, GA `judge_app_intro_video_added` (`event_label` = upload|link), and surfaced as a link in admin review (`ApplicationReviewCard` judge `secondaryFields` + `labelMap` + all three `isLink` arrays). **Judge photo (`UploadPhoto`, `formData.photoUrl`):** required + validated in `validateBackgroundAndExperience` (checks `formData.photoUrl || uploadedPhotoUrlRef.current`), rendered right after the video in a framed `--surface-2` panel with copy stating it's PUBLIC on DevPost + ohack.dev (deliberate contrast to the video's "review team only" note) — don't demote it back to a bare label/button below the video card (it was getting missed).

Shared scaffolding lives in `src/components/ApplicationForm/`. Use these instead of re-implementing in each form:

- `PronounsPicker` — chip-based picker with curated pronouns + "Add your own". Stores a comma-joined string (back-compatible with old free-text values). All four forms use it.
- `OHackParticipationSelect` — the "How many Opportunity Hack hackathons have you attended?" dropdown. Helper text makes clear it's about OHack only, not other hackathons.
- `ProfileAutofillNotice` — reusable green "auto-filled from your profile" alert.
- `MealMenu` — restaurant-style meal selector for `eventData.constraints.meals`.
- `DietaryRestrictionsSelect` — dropdown (multi-select + exclusive "None" + "Other" detail) for `formData.dietaryRestrictions` on ALL FOUR forms. Stored as a human-readable comma-joined string (legacy free-text parses back in; no backend change). Only rendered for people who'll eat on site: hacker gates on `!eventData?.isOnlineEvent`, mentor/judge/volunteer on `!isVirtualEvent() && inPerson === "Yes!"/"Yes"`. Don't revert to free text. Shown in admin `ApplicationReviewCard` + `ApplicationEditDialog` for all four types. Parse/serialize helpers are exported and unit-tested (`__tests__/DietaryRestrictionsSelect.test.js`).
  Primary copy on these forms uses `body1`. Reserve `body2` for true helper text under inputs.

**Adding a new application field needs NO backend change.** Submissions POST to `/api/{type}/application/<event_id>/{submit,update}` → `handle_submit` → `create_or_update_volunteer` (`services/volunteers_service.py`), which persists the **entire** `volunteer_data` dict (`volunteer_doc.update(volunteer_data)` on create, `set(merge=True)` on update) — there is no field allowlist for volunteer/mentor/judge/hacker apps (unlike `save_hackathon`). New form fields flow through and are stored as-is. **The one exception is a small denylist:** `STAFF_OWNED_VOLUNTEER_FIELDS` (`services/volunteers_service.py`) is stripped from every self-service submit/update, so approval (`isSelected`), check-in (`checkInTime`/`isCheckedIn`/`checkedIn`/…) and refund bookkeeping (`deposit_status`, `deposit_refund_*`) are server-authoritative and can NOT round-trip through a form — don't add a form field with one of those names expecting it to persist. This exists because all five forms used to ship `isSelected: false` from their `initialFormData`, silently un-approving an approved applicant on every edit (Aug 2026); **never re-add `isSelected` to a form's `initialFormData` or submit payload.** Deposit *payment* fields (`stripe_payment_intent_id`, `deposit_amount_cents`, `deposit_disposition`) are deliberately NOT in the denylist — the hacker Stripe return sets those on `/update`. The submit/update routes are also `@auth.require_user` now (identity comes from the token, never a body `user_id`). Mirror the `expertise`/`softwareEngineeringSpecifics` pattern: keep multi-selects as arrays in form state, join to a comma-string at submit (swapping an "Other" option for its free-text value), and split back on `loadPreviousSubmission`. To make a new field visible in admin review, add it to the type's `secondaryFields`/`additionalFields` + `labelMap` in `src/components/admin/ApplicationReviewCard.js` (empty values are auto-skipped, so legacy rows stay clean). **Mentor form** captures AI-tool usage (`aiTools[]`+`otherAiTools` → joined `aiToolsUsed`, plus `aiToolsExperience`) in Step 2.

### Judge form — LMS training gate (Aug 2026)

The judge form is hard-gated behind LMS training: `JudgeTrainingGate` (`src/components/ApplicationForm/JudgeTrainingGate.js`) renders in place of the stepper + form (they don't mount at all) until BOTH certificates verify. The bundle is `lms.ohack.dev/bundles/kn7ect1nhxqkcn2tp32tbypzdx8ckjx6` ("Opportunity Hack Judging": **Judge Intro** + **Using the judging tool**; each quiz pass issues a cert at `lms.ohack.dev/certificate/<64-hex>`).

**Detection is automatic first, manual paste is the fallback.** lms.ohack.dev is SSO-only through the SAME PropelAuth instance as www.ohack.dev (`auth.ohack.dev`), and the LMS's Convex deployment (default `majestic-trout-419.convex.cloud`, override `NEXT_PUBLIC_LMS_CONVEX_URL`) trusts it as a customJwt issuer with `EXTERNAL_AUTH_TRUST_EMAILS=true`. The gate therefore calls the Convex Functions HTTP API with the judge's own `accessToken` (`Authorization: Bearer`): `externalAuth:ensureExternalUser` (once per mount, links/creates the LMS account) then `certificates:getMyCertificates`; matched certs (newest `issuedAt` per slot, shareToken never reused across slots) seed the verification token cache and are written into the URL fields via `onValueChange` — the existing debounced `evaluate()` then verifies from cache with no extra network. Triggers: token-presence mount effect (`Boolean(accessToken)`, NEVER the raw token — PropelAuth rotates on refocus; all volatile inputs read through refs per the token-rotation-stability pattern), `visibilitychange` refocus (throttled 15s), and an explicit "check again" button (bypasses throttle). Auth-classified failures set `authFailedRef` to stop refocus retries — this is the **dev caveat**: localhost logs into a propelauthtest issuer prod LMS doesn't trust, so auto-detect lands in `unavailable` and manual paste (anonymous query, works everywhere) takes over. **Conflict rule:** a verified slot value is never overwritten by auto-detect; non-verified/broken values are.

Manual verification is client-side against the LMS's public Convex query `certificates:getCertificateByShareToken` (anonymous + CORS-open by design — same query the LMS's own `/certificate/:token` page uses). Note `getMyCertificates` payloads carry NO `recipientName` — the verified summary line must render only present parts. Slot matching is by regex over the cert's `quizTitle`+`targetTitle` (`/judge\s*intro/i`, `/judging\s*tool/i` in `JUDGE_TRAINING_CERTS`) — keep in sync if LMS video/quiz titles change; duplicate tokens across the two fields are rejected. Cert URLs live in formData (`judgeTrainingIntroCertUrl`/`judgeTrainingToolCertUrl`) so they autosave, hydrate from a previous submission (returning judges auto-unlock via re-verification), and submit with the application (no backend change); submit also stamps `judgeTrainingCompleted` and `handleSubmit` re-checks `trainingVerified`. Both links render as clickable links in admin `ApplicationReviewCard` (judge `secondaryFields` + `labelMap` + all three `isLink` arrays). GA: `judge_app_training_link_click`, `judge_app_training_cert_verified` (intro|tool), `judge_app_training_unlocked`, `judge_app_training_autocheck` (label=mount|refocus|manual, value=match count), `judge_app_training_autodetected` (intro|tool), `judge_app_training_autocheck_failed` (auth|network|server), `judge_app_training_manual_fallback_open`.

### Judge review in Volunteer Admin (intro video + LMS training status, Aug 2026)

The Judges tab of the volunteer workbench (`/admin/hackathons/<event>?section=volunteer`) reviews the PR-345 judge fields. Load-bearing pieces:

- **`src/lib/lmsClient.js` is the shared LMS Convex client** — the transport (`lmsQuery`/`lmsMutation` with `{path, args, format:"json"}` + auth/network/server error codes), `extractCertToken`/`certUrlForToken`, `verifyCertToken` (anonymous cert lookup, module-level promise cache with rejected-promise eviction), and the moved-here constants `JUDGE_TRAINING_CERTS`/`JUDGE_TRAINING_BUNDLE_URL`. `JudgeTrainingGate.js` re-exports all its old public names (judge-application.js imports unchanged) — don't re-inline transport code into the gate.
- **`src/hooks/use-judge-training-status.js`** (+ exported `normalizeEmail`) runs two parallel passes and merges into ONE setState: (a) anonymous verification of every stored `judgeTraining*CertUrl` (works for all admins), (b) an authed rollup — `quizzes:listQuizzes` → title-regex match via `JUDGE_TRAINING_CERTS[].match` → `quizzes:getQuizResults {quizId}` ×2 + `users:listUsers` (userId→email join) — behind a module-level 60s TTL cache. **The LMS soft-degrades without `MANAGE_QUIZZES`** (`listQuizzes`→`[]`, `getQuizResults`→`null`, but `listUsers` throws), so zero matched quizzes is treated as an auth failure → `lmsAccess: "certs-only"`, never rendered as "no attempts". `lmsAccess`: `null | "full" | "certs-only" | "unavailable"`. Token-rotation pattern honored (refs + `Boolean(accessToken)` + judges fingerprint). Attempt data therefore only shows for admins whose LMS account (email-linked) has an owner/admin/editor role; localhost dev-issuer always lands in certs-only.
- **`VolunteerWorkbench`** owns the single hook call (gated `tabValue === 1` = judges) and ONE page-level video `Dialog` (`VideoDisplay`); it passes `trainingStatusByEmail`/`trainingLmsAccess`/`onPlayVideo` to BOTH `VolunteerTable` and `ApplicationReviewList`. Hook + dialog state are declared before the `!isAdmin` early return (hook-order).
- **`ApplicationReviewCard`**: judge cards render the module-scope `JudgeTrainingPanel` (LiteVideoThumbnail → workbench dialog, per-slot cert rows w/ score+issued date+attempts, `judgeTrainingCompleted` chip, training-bundle link). The video/cert URL fields were REMOVED from judge `secondaryFields` and added to the `alreadyRendered` set — don't re-add them as raw field rows. The 3 duplicated `isLink` arrays are now one module `LINK_FIELDS` constant, and the expanded secondaryFields grid passes the isLink arg (was a bug — links degraded to plain text when expanded).
- **`VolunteerTable`**: judges-only `training` + `introVideo` columns (`sortable: false`, honored in the header) via module-scope `trainingChipConfig` (also used by the mobile card view). Chip falls back to `volunteer.judgeTrainingCompleted` while LMS data is pending/unavailable. **Tooltip shows attempts per cert** via `attemptsSummary`: rollup first (`lmsAccess === "full"`), else the `attemptCount`/`attemptsToPass` fields the anonymous cert lookup returns (LMS ≥ Sep 2026 — works for every admin, verified slots only; `TrainingSlotRow` in the review card has the same fallback); a footer line explains when neither source has data. **Judge column order is review-first**: `id, name, status, training, introVideo, title, company, …base…, checkedIn, background` (built from a `base` map of `baseColumns` — don't spread `...baseColumns` back in front). **Company**: judge applications store `companyName` (not `company`) — read through `companyOf(volunteer)` (exported; cell + mobile card) and the workbench sort has a matching `orderBy === "company"` branch; search already covered both keys.
- **Hook gotcha (Sep 2026):** the rollup pass MUST call `externalAuth:ensureExternalUser` first (`ensureLmsAccountLinked`, module-cached) — the LMS resolves an external PropelAuth identity only through the `authIdentities` link that mutation creates, so without it even an LMS owner's admin queries resolve to no user, soft-degrade to `[]`, and the hook lands in `certs-only` (that's why prod tooltips showed no attempts). The judge form's gate always did this; the admin hook didn't.
- **Backend privacy fix**: `introductionVideoUrl` + both cert URL fields are in `PUBLIC_VOLUNTEER_DENYLIST` (`common/utils/firebase.py`) — the UNauthenticated judge route must not leak them (the form promises the video is review-team-only). Admin route unaffected. Don't remove them from the denylist.

### Judge form — in-person is a hard gate at physical venues

`judge-application.js` has an `isVirtualEvent()` helper (location contains global/virtual/online/remote — same heuristic as the volunteer form's). At physical events, `validateAvailability` **blocks** (not warns) `inPerson !== "Yes"` and `canAttendJudging === "No"` on both step-Next and submit; the availability step shows blocking error alerts that route the applicant to the mentor application (mentors can be virtual) or `/hack` online events. "Partial" judging-window attendance stays allowed. Virtual events keep the soft-warning behavior. Don't reintroduce the old "remote judging is possible" soft warning at physical events.

### Hacker form — "Find your team" sources teamCode from volunteers, not teams

The "Find your team" picker (`InterestsTeamsStep.js` `TeamBrowser`) lists distinct **`teamCode`** values that already-registered hackers entered for the event, NOT teams from `/api/messages/teams`. First hacker types a code; later hackers pick it so they don't have to remember it. Data: `hacker-application.js` fetches `GET /api/messages/hackathon/${event_id}/hacker`, reads `data[].teamCode`, dedupes case-insensitively (first-seen casing kept) into `eventTeams` as `[{ code, count }]` sorted by code. `teamCode` is NOT in the backend `PUBLIC_VOLUNTEER_DENYLIST` (`common/utils/firebase.py`), so the public hacker endpoint already exposes it (no backend change). `TeamBrowser` filters/selects/renders by `t.code`/`t.count`; clicking sets `formData.teamCode`. Don't revert to listing team objects (`t.name`/`t.users`).

### Hacker form — country/state/AZ residency

Country is a curated `Autocomplete` (`COUNTRY_OPTIONS`); State is a `Select` of `US_STATE_OPTIONS` only when `country === "United States"`, otherwise a free-text "State / Province / Region". County (`ARIZONA_COUNTY_OPTIONS`) only renders when country=US AND state=Arizona. There is no user-facing "Arizona Residency" dropdown — `arizonaResident` is **derived at submit time** from country+state and sent in the payload so legacy downstream consumers still receive it. If you re-introduce a dropdown for this, you'll create the redundancy we just removed. (The 2026 tax credit / QCO question was also removed — no QCO this year.) All option arrays (`PARTICIPANT_TYPE_OPTIONS`, `COUNTRY_OPTIONS`, etc.) are module-scope constants at the top of `hacker-application.js` so they're not reallocated on every render — keep them there or Autocomplete will lose its memoization.

## Hackathon Event Photos & Social Posts

Two top-level fields on the hackathon doc (NOT under `constraints`):

- `event_photos: [{ url, caption?, credit?, sort_order? }]`
- `social_posts: [{ platform: "linkedin"|"instagram"|"threads"|"article", url, caption? }]`

Both flow through the existing `PATCH /api/messages/hackathon`. Backend caps live in `validators.py` (`MAX_EVENT_PHOTOS=100`, `MAX_SOCIAL_POSTS=25`); social URL hosts are validated against the chosen platform, while `article` accepts any normal http(s) news URL.

Admin UI: `EventMediaManagement` component (`src/components/admin/EventMediaManagement.js`) renders inside the "Event Photos & Social Posts" Accordion in the admin Advanced Settings tab. Photos uploader is gated until `event_id` is set; posts to `/api/messages/upload-image` with `directory=hackathons/{event_id}/photos`.

Public surfaces:

- `/hack/[event_id]/media` — full carousel (`react-responsive-carousel`) + Instagram embeds (`react-social-media-embed`, dynamic ssr:false) + LinkedIn/Threads/article link cards. Includes `ImageGallery` JSON-LD.
- `/hack/[event_id]` — compact teaser block above the `TableOfContents` (right after `HackathonResults`). When photos exist it shows the 3-thumbnail strip; when only `social_posts` exist it falls back to small coverage cards. It renders whenever either `event_photos` or `social_posts` has content and links through to `/media`.
- `/hack/[event_id]/upload` — legacy page is now a redirect stub pointing users to `/admin/hackathons` and `/media`.

## Planning Card Budget Editor

`PlanningCardDialog` has an inline budget editor (amount USD, bucket: food/prize/swag, state: estimated/committed/paid, vendor). Edits PATCH `card.budget` and feed `PlanningBudgetWidget` (event page widget gated by `planning.budget_widget_on_event_page`). Backend constants live in `model/planning.py` (`ALLOWED_BUDGET_BUCKETS`, `ALLOWED_BUDGET_STATES`, `MAX_BUDGET_CENTS`); keep frontend select options in sync. Clear with `{ budget: null }`. Read-only viewers still see the chip; editors get the form.

## Hackathon Admin Edit (per-event page)

The old "Edit Hackathon" Dialog at `/admin/hackathons` is gone. Editing now lives on `/admin/hackathons/[event_id]` with a left sidebar navigating between sections (`?section=overview|schedule|meals|participants|judges|nonprofits|media|planning|donations|links|volunteer|teams|judging|checkin`). URLs are deep-linkable for sharing.

**Sidebar is grouped.** Sections in `sectionsManifest.js` carry a `group` field — `"config"` (Configure: overview…links) vs. `"ops"` (Operate: volunteer/teams/judging/checkin). `HackathonAdminLayout` renders one labeled List per group with an "overline" header. Legacy entries without a `group` default to "config".

**Volunteer / Teams / Judging / Check-in are consolidated here.** The old standalone routes (`/admin/volunteer`, `/admin/teams`, `/admin/judging`, `/admin/check-in`) are now redirect stubs that forward to `/admin/hackathons/<event_id>?section=<slug>` (preserving all other query params). The actual workbenches live at:

- `src/components/admin/volunteer/VolunteerWorkbench.js` — accepts `{ userClass, embedded, externalEventId, onSnack }`. When `embedded=true`, skips the `AdminPage` chrome, hides the in-page event picker, and trusts `externalEventId` instead of the URL. URL writeback is short-circuited.
- `src/components/admin/checkin/CheckInWorkbench.js` — same `embedded` contract.
- `TeamsSection` / `JudgingSection` are thin section files that lazy-load existing components (`TeamManagement`, `TeamAssignments`, `JudgingRound1/2/Results`) and wire `selectedHackathon` to `admin.hackathon.event_id` (the setter is a no-op since the host URL owns the event).
- Sub-tab state for Teams/Judging persists via `?subtab=management|assignments|stats` (Teams) / `round1|round2|results` (Judging).

**Known minor regression (embedded mode):** the workbench's internal `setSnackbar` calls don't currently render any toast UI because the `AdminPage` wrapper that owned the Snackbar is skipped. Admin actions still work; dialogs close and lists refresh. To fix later: thread `setSnackbar` through `onSnack` in the workbenches.

- Page: `src/pages/admin/hackathons/[event_id].js`. List page (`index.js`) routes "Edit" buttons here and keeps a small "Add Hackathon" modal that bootstraps a row then redirects.
- Layout: `src/components/admin/hackathon-edit/HackathonAdminLayout.js` — sticky header w/ save indicator, sidebar from `sectionsManifest.js`.
- Hook: `src/components/admin/hackathon-edit/useHackathonAdmin.js` — owns `draft` + `committed` state and runs the **hybrid save model**:
  - **Autosave** (debounced 1.5s PATCH `/api/messages/hackathon`): all "low-risk" keys.
  - **Explicit Save** (sticky bar inside `SectionContainer`): `overview-dates`, `schedule`, `meals`, `screening`, `deposit`. While any of these are dirty, autosave is **paused** so unrelated text edits don't sneak through.
  - The sidebar shows a yellow dot on sections with unsaved changes. `beforeunload` warns.
  - **Token-rotation stability (don't regress):** PropelAuth mints a fresh `accessToken` on tab refocus. The hook reads token/orgId through refs (`accessTokenRef`/`orgIdRef`) so `fetchHackathon`/`pushPatch` stay identity-stable, and the load effect is keyed on token _presence_ (`!!accessToken`), not value. Keying anything on the raw `accessToken` re-triggers the load → `loading` flips → the page unmounted the whole layout (looked like a full page refresh on tab switch) and `setDraft` clobbered unsaved edits. The page also gates its blocking spinner on `admin.loading && !admin.hackathon` so background refetches keep the layout (and embedded workbenches) mounted.
- Section components live in `src/components/admin/hackathon-edit/sections/*.js`. Each receives `{ admin, accessToken, orgId, onSnack }`. To add a new section: append to `sectionsManifest.js` + create `<Slug>Section.js` + add to the `sectionLoaders` map in `[event_id].js`.
- **Top-level optional fields must be allowlisted in the backend save, or they silently vanish.** `save_hackathon` (`backend-ohack.dev/services/hackathons_service.py`) builds the saved doc from an explicit key dict, so any NEW top-level field (i.e. NOT under `constraints`) is dropped by the `merge=True` write unless it's added to the `for optional_key in (...)` passthrough loop AND validated in `validate_hackathon_data_partial` (`common/utils/validators.py`). Current passthrough keys: `github_org`, `mentor_slack_channel`. This bit both — their admin UI existed but never persisted until the passthrough was added. `OverviewSection.js` renders both; `github_org` has a click-through to `github.com/<slug>` via the `githubOrgSlug()` normalizer (strips full URL / `@` / trailing path). Both autosave via `setField`.
- **Removed legacy components** (do not re-introduce): `DonationManagement.js` (had bolt-on "Update Donation Data" button), `MealManagement.js` (free-text time field), `CountdownManagement.js` (modal-per-edit, no reorder). Their replacements (inline donation editor, `MealsSection`, `ScheduleSection`) live under `hackathon-edit/sections/`.
- The Meals editor uses `@hello-pangea/dnd` for drag-reorder, a real `DateTimePicker` constrained to the event window, a "Clone" button per slot, and a side-by-side "Hacker preview" pane (toggleable).
- The Schedule editor groups countdowns by day in a timeline view with "Quick add" presets (Kickoff, Workshop, Coffee break, Lunch, Judging starts, Awards, Wrap-up). Single timezone selector at the top of the section defaults to the hackathon's `timezone`. List view is a fallback that supports drag-reorder.
- `ALLOWED_DIETARY_TAGS` lives in `MealsSection.js` (was previously in the deleted `MealManagement.js`). Keep in sync with backend `validators.py`.

### Vendor menu catalog (Meals section)

The Meals editor has a "Browse menu" button on each meal slot that opens a searchable catalog picker. Catalog files live in `src/components/admin/hackathon-edit/catalog/`:

- `fatFreddysCatalog.js` — seeded items from Fat Freddy's Catering (Phoenix). Update freely as menus change. Items have `{ id, category, name, description, price_cents, unit, min_quantity, dietary_tags, bundled_with? }`. `unit` is `"per_person" | "each" | "fixed"`.
- `catalogStorage.js` — combines the seeded catalog with user-added items persisted to `localStorage` under `ohack_admin_menu_catalog_v1`. New vendors / items added via the picker's "Add a custom item" form go here. (Promote to backend storage if you want cross-device sharing.)
- `MenuCatalogPicker.js` — the dialog. Filters by vendor + category, search across name/description, multi-select to add to a meal.
- `formatCurrency.js` — USD formatters and `computeItemCostCents` / `computeMealCostCents` / `computeAllMealsCostCents`.

Cost extras stored on the hackathon doc (both pass through the permissive `validate_meals` validator without backend changes):

- `constraints.meals_estimated_headcount` (int, default 50) — used as the default people-eating count for cost estimates.
- `meal.headcount_override` (int, optional) — per-slot override when not all attendees eat that meal.
- `meal.items[i]` gains optional `price_cents`, `unit`, `quantity` (for `each`), `vendor`, `catalog_item_id` fields.

`MealsSection` shows a "Estimated cost" summary card at the top of the section using the Fat Freddy's quote defaults (8.6% AZ tax, ~10% gratuity, 2.9% card surcharge, $45 delivery) — toggleable. Per-meal subtotals display as a green chip on each meal card; per-item cost shows under each priced item.

## Hackathon Per-Event Config (admin → `constraints`)

The `constraints` object on a hackathon doc carries per-event toggles. Keys consumed by the application forms:

- `judge_venue_arrival_time` (HH:MM, 24-hour) — judge form's Availability step shows it when set; falls back to existing default copy when null.
- `judge_judging_start_time` / `judge_judging_end_time` (HH:MM, 24-hour) — the final-day judging window. Drives ALL judging-window copy on the judge form (schedule alert, "For this event" panel, commitment question, and the physical-event blocking validation message) via `getJudgingWindow(eventData)`; defaults to 15:00/17:30 when unset. Admin UI in `hackathon-edit/sections/JudgesSection.js` (next to arrival time); backend keys validated via `JUDGE_TIME_CONSTRAINT_KEYS` in `validators.py`. Times display through `formatTime12h` (module-scope in `judge-application.js`).
- `hacker_deposit: { enabled, default_amount_cents }` — when enabled, hacker form's Review step adds deposit fields and routes through Stripe Checkout (see below) before submit.
- `meals: [{ id, name, time, catering_provided, dietary_tags, items: [{ id, name, description, dietary_tags }] }]` — hacker form renders a `MealMenu` for each slot when in-person and meals are configured. Allowed `dietary_tags` are validated server-side; keep them in sync with `ALLOWED_DIETARY_TAGS` in `MealsSection.js` and the backend `validators.py`.
- `meals_mode` ("menu" default | "schedule") + `meals_note` (optional string ≤ 500) — how meals render on the hacker form. `"schedule"` = **times-only**: the hacker form swaps `MealMenu` for the read-only `MealSchedule` (`src/components/ApplicationForm/MealSchedule.js` — also exports `getMealsMode`/`formatMealTime`/`MEALS_MODE_*`/`MEALS_NOTE_MAX_LENGTH`, all unit-tested in `__tests__/MealSchedule.test.js`; `formatMealTime` renders admin-picked ISO times human-readably in BOTH components); `meals_note` shows above the schedule. Admin `MealsSection` has a "What hackers see" toggle: schedule mode hides the items editor/catalog/costs/headcount (items data is KEPT, not deleted), shows the note field, previews via the real `MealSchedule`, and quick-add creates slots with `items: []` (a blank item would fail backend `validate_meals`). Anything except explicit `"schedule"` resolves to `"menu"` (legacy docs unchanged). Backend: `ALLOWED_MEALS_MODES`/`MAX_MEALS_NOTE_LENGTH` in `validators.py` (both hackathon validators) — keep in sync with the frontend constants. **Mentor/judge/volunteer forms** also render the read-only `MealSchedule` (regardless of `meals_mode` — those roles never pick items) directly above their `DietaryRestrictionsSelect`, under the SAME in-person gate (`!isVirtualEvent() && inPerson === "Yes!"/"Yes"`); the component owns the no-meals case (renders null), so pages pass `constraints?.meals || []` with no length check. Mentor + volunteer `setEventData` now retain `constraints` (judge already did) — don't drop that key or the schedule silently disappears.
  Meal editing lives in `hackathon-edit/sections/MealsSection.js` (`/admin/hackathons/[event_id]?section=meals`) — `MealManagement` was deleted (see "Removed legacy components").

## Hacker Stripe Deposit Flow

- Frontend route `/api/applications/hacker-deposit/checkout` creates a Stripe Checkout session; success URL is the hacker form with `?deposit_session_id=...`.
- Frontend route `/api/applications/hacker-deposit/session` retrieves the session by id and returns `{ payment_status, payment_intent_id, amount_total, metadata }`.
- Hacker form auto-saves to localStorage, so the form survives the Stripe round-trip. On return, it reads the session id, populates `stripePaymentIntentId`/`depositAmountCents`/`depositDisposition`, jumps to Review, and the next submit posts the application with those fields. Submission fields: `stripe_payment_intent_id`, `deposit_amount_cents`, `deposit_disposition` ("refund" | "donate").
- **Refund flow (admin):** `POST /api/admin/hacker/<volunteer_id>/refund-deposit` in `backend-ohack.dev/api/volunteers/volunteers_views.py` (auth: `volunteer.admin`). Body `{ override: bool }` — override is required when `deposit_disposition === "donate"`. Stripe call is fired BEFORE the Firestore mutation so a partial failure leaves the refund visible in the Stripe dashboard for human reconciliation rather than disappearing. Stripe API key sourced from `STRIPE_SECRET_KEY` env var (same name as the frontend). The service writes `deposit_status`, `deposit_refund_id`, `deposit_refund_amount_cents`, `deposit_refunded_at`, `deposit_refunded_by` on the volunteer doc, and on Stripe error sets `deposit_status="refund_failed"` + `deposit_refund_status_msg`. Slack audit message posted via `send_slack_audit`.
- **Admin UI:** `/admin/volunteer?tab=3` shows a "Deposit" column on the Hackers tab when `eventData.constraints.hacker_deposit.enabled === true`. Click any chip → `HackerDepositRefundDialog`. Chip states: Paid / Unpaid (warning, no PI on file) / Donated (paid + disposition=donate) / Refunded / Refund failed (with Stripe error in tooltip). Donate-override is two clicks deep (extra friction). Components: `src/components/admin/HackerDepositChip.js`, `src/components/admin/HackerDepositRefundDialog.js`.
- **Bulk refund (end-of-event):** Same admin page surfaces a "Refund N eligible deposits ($X)" button above the table when `depositEnabled`. Eligible = `deposit_status=paid AND deposit_disposition=refund`. Donate and refund_failed rows are excluded by design (each needs a per-row decision). Backend route `POST /api/admin/hackathon/<event_id>/refund-eligible-deposits` processes per-row with error capture and returns `{ refunded, failed, total_amount_cents }`. Component: `src/components/admin/HackerDepositBulkRefundDialog.js`.
- **Stripe webhook:** `POST /api/webhooks/stripe/hacker-deposit` on the backend (no PropelAuth — Stripe signature is the only auth). Requires `STRIPE_HACKER_DEPOSIT_WEBHOOK_SECRET` env var on the backend (deliberately distinct from the frontend store webhook's secret — see below). Subscribed events: `checkout.session.completed` (self-heals the volunteer doc when the form's session-status read missed it — matches by `metadata.hacker_email` + `event_id`, only updates an existing doc, never regresses `refunded` → `paid`) and `charge.refunded` (confirms async refund settlement — matches by our `metadata.volunteer_id` on the refund object). Both handlers are idempotent. Configure the endpoint URL + the two event types in the Stripe dashboard and copy the signing secret to `STRIPE_HACKER_DEPOSIT_WEBHOOK_SECRET`.
- **Stripe webhook env-var naming (important):** there are now TWO Stripe webhook endpoints in this project. The frontend's `/api/store/webhook.js` reads `STRIPE_STORE_WEBHOOK_SECRET` (with a legacy fallback to `STRIPE_WEBHOOK_SECRET` during rollout). The backend's hacker-deposit webhook reads `STRIPE_HACKER_DEPOSIT_WEBHOOK_SECRET`. Each endpoint in the Stripe dashboard has its OWN signing secret — using the same value for both will cause one of them to fail signature verification. Don't reintroduce a generic `STRIPE_WEBHOOK_SECRET`.
- **Still open:** no admin view of orphaned Stripe payments (hackers who paid but never submitted the application — webhook logs a warning but doesn't persist anywhere for later reconciliation). For Fall 2026 this is acceptable if deposits stay disabled or volume is low; revisit if a future event has >0 cases.

## manageteam.js invariants

Key load-bearing patterns in `src/pages/hack/[event_id]/manageteam.js`:

- **Split error state**: `teamsError` is only set from `fetchMyTeams()` → passed to `TeamStatusPanel` as `error`; `formError` is only set from form validation/submit. Never merge them — `teamsError` showing causes the TeamStatusPanel to display an error card rather than the team hub, wiping the team list off-screen on a non-fatal form error.
- **Lazy Slack + nonprofit fetches**: Slack users (`active_days=365`) and nonprofit details are only fetched when `activeStep >= 1` OR `showNewTeamForm` is true, guarded by `slackFetchedRef.current` / `nonprofitFetchedRef.current` respectively. Do NOT fetch either on initial load — keeps the initial page to ~3 API calls.
- **`onTeamUpdated` contract**: `manageteam.js` passes `onTeamUpdated = useCallback((teamId, partial) => setMyTeams(prev => prev.map(t => t.id === teamId ? { ...t, ...partial } : t)), [])` to `TeamStatusPanel`. `TeamStatusPanel` calls it after a successful DevPost/demo-video save so the parent state updates without a full re-fetch (button label refreshes immediately).
- **Post-submit flow**: after successful team creation, call `fetchMyTeams()` then scroll to `#team-hub` — do NOT show a mega-panel; the team hub section already shows the new team card.
- **`postLoginRedirectUrl` SSR guard** (same pattern as `findteam.js`): `currentUrl || (typeof window !== "undefined" ? window.location.href : undefined)` — prevents `window` access during SSR.

## Hacker `isSelected` Gating UX (findteam / manageteam)

`isSelected` is a single boolean that defaults to `false`. `false` is ambiguous — it covers both "still under review" and "not selected after review" — so do NOT render rejection copy on `isSelected === false`. Both `findteam.js` and `manageteam.js` render two distinct neutral panels (blue `#e3f2fd → #ede7f6/#e8eaf6`, border `#90caf9`):

- `!application` → 📝 "Apply first to use the Team Finder" / "Apply first to manage a team" with submit-application CTA.
- `application && isSelected === false` → ⏳ "Your application is awaiting confirmation" with an info Alert explaining ~1-week review, "while you wait" actions (Slack, year-round projects, other events), and a refresh hint for sync lag.
  Keep both files in sync if the copy changes. Do not call `setError(...)` for these states — the dedicated panels handle it; the Alert at the top is reserved for actual fetch failures.

### Team creation — `teamMembers` is a mixed string/object array

The team-creation member picker (`TeamMemberManager.js`) is a `freeSolo` MUI Autocomplete, so `teamMembers` carries BOTH Slack-user objects (`{id, name, real_name, tz}`) from the dropdown AND raw free-text name strings the user typed. Every consumer must handle both shapes:

- **Frontend render** (`TeamMemberManager.js`, `ConfirmationSummary.js`): `typeof member === 'string' ? member : (member.real_name || member.name || '')`.
- **Backend** (`queue_team` in `api/teams/teams_service.py`): guard with `isinstance(member, dict)` then `member.get("id")` — never `if "id" in member` (that's a substring test against strings; names like "Sidney"/"David" match and then `member["id"]` raises `TypeError`). Only objects with a Slack `id` get invited to the channel and linked to `users_list`; free-text names are informational-only and intentionally NOT linked. There is no `SLACK_USER_ID_PREFIX` constant — build the full `oauth2|slack|{workspace}-{id}` form with `normalize_slack_user_id()` from `common/utils/oauth_providers.py`.

## Mentor check-in page (`/hack/[event_id]/mentor-checkin`)

Refined (`<RefinedRoot>`/`<RefinedFonts>` + `TeamBreadcrumbs`) mentor one-stop-shop. Keeps all original check-in/out logic verbatim (the gnarly availability-string parser, the `/api/mentor/checkin/<event>/{in,out,status}` calls + Slack notify, confirm dialogs); only the presentation was rewritten to `.ohx-*`. Gates unchanged: login required → registered-mentor required (`/api/mentor/application/<event>`), else refined apply CTA.

The headline addition is **`MentorTeamsTable`** (`src/components/Mentor/MentorTeamsTable.js`): a searchable/filterable/sortable table of every team for the event with mentor-relevant columns — Team (→ `/team/<id>`), Status, Nonprofit, Members (avatars), Coverage X/6, Open flags, Last mentor touch, and Links (Slack/GitHub/DevPost/Demo + a "Mentor →" deep-link to the team's `/mentor` sub-page). Filters: All / Needs attention / Active / Winning; default sort surfaces open-flag and never-touched teams first. Desktop = hairline `<table>` (horizontal-scroll wrapper); mobile (`<md`) = stacked cards.

**Short alias:** `next.config.js` redirects `/hack/:event_id/mentor` → `/hack/:event_id/mentor-checkin` (307, temporary). `:event_id` is one segment, so it never catches the team-level `/team/<id>/mentor`, nor `/mentor-checkin` / `/mentor-application`.

**Mentor-application QR + remote check-in:** on `/hack/<event>/mentor-application`, the `VolunteerCheckInQR` (in-person check-in) renders only for `isSelected` (approved) mentors — both QR spots are now gated on `Boolean(volunteerId) && isSelected` (also removes the previously-empty "Check-in" card for pending mentors). A module-scope `RemoteCheckInNote` renders beside each QR telling remote/virtual mentors (`formData.inPerson === "No, I'll be virtual"`) to check in online via `/hack/<event>/mentor-checkin` instead. The shared `VolunteerCheckInQR` component stays generic — the mentor-checkin link lives in the page, not the component.

**Data source = the page's existing `GET /api/messages/hackathon/<event>` fetch — no new call, no backend change.** That single-event endpoint returns `teams[]` as **full team docs** (enriched `users[]` + `mentor_*` fields *when present*; absent for teams with no mentor activity, handled with defaults) plus `nonprofits[]` for the id→name map. The page captures `setTeams(eventData.teams)` / `setNonprofits(eventData.nonprofits)` in the same effect. `MentorTeamsTable` reuses `statusLabel` (`teamPageData.js`), `isWinningStatus`/`getWinningStatus`, and `MENTOR_COVERAGE_ITEMS`/`relativeTime` (`mentorCoverage.js`). Note: the **list** endpoint `get_hackathon_list` is NOT enriched — only the single-event getter is (see C7 enrichment note).

## Mentor + Judge Pending-Review Confirmation Email

Backend `send_volunteer_confirmation_email()` (`services/volunteers_service.py`) now adds a `[Pending Review]` subject prefix and a yellow "your application is pending review — up to a week" banner for `volunteer_type in ("mentor","judge")`. Role-specific next-steps live under an "Once approved" heading. Hacker confirmations (when added) should keep the existing "received" framing since they don't go through staff review.

## Hackathon Results & Hacker Funnel

Per-event results live on a dedicated page `/hack/[event_id]/results` that renders the existing `HackathonResults` component plus a new `HackathonFunnel` viz. The funnel reads from a new public-safe summary doc.

Subcollection: `hackathons/{hackathon_doc_id}/funnel/summary` — counts only (no PII):

- `registered`, `started_project`, `submitted_project`, `submitted_gallery_visible`
- `status_breakdown`, `step_breakdown`, `referral_breakdown`, `teammate_intent_breakdown`, `country_breakdown`
- `source`, `source_files`, `last_updated`, `last_updated_by`

Winning + founding-engineer counts are NOT stored in the summary — they're computed at read time from the teams collection (status in `WINNING_STATUSES`) so they stay fresh as judging changes. The funnel response also includes a `participation` block computed live: `applied_as_hacker` (count of `volunteers` docs for the event with `volunteer_type=hacker`, no `isSelected` filter — matches `HackathonResults.js`) and `formed_team` (count of unique user-doc IDs across all teams linked to this hackathon, deduped because a person could be on more than one team).

Backend: `GET /api/messages/hackathon/{event_id}/funnel` (5-min TTL cache, public, no auth). Service in `services/hackathons_service.py::get_hackathon_funnel`. Cache is cleared via `clear_cache()` along with the other hackathon caches.

Aggregate (all-time): `GET /api/messages/hackathons/funnel/aggregate` (10-min cache) sums every stage across every hackathon — no cross-event dedup, so a person in three events counts three times. Service: `get_hackathon_funnel_aggregate`. Page: `/hack/results` (no event_id) renders the same `HackathonFunnel` viz on aggregate data. Per-event dedup IS applied (a person on multiple winning teams in one event is counted once for that event), but across events totals are summed.

Backfill script: `backend-ohack.dev/scripts/backfill_devpost_funnel.py` — dry-run by default. Takes `--registrants-csv` and/or `--projects-csv` (Devpost exports). Re-running is idempotent — the summary doc is fully overwritten on `--apply`.

Front-of-house: `HackathonResults` accepts a `fullResultsHref` prop. On `/hack/[event_id]` it points to `/hack/[event_id]/results` so users can jump to the deeper page. The /results page renders the same `HackathonResults` widget at top + `HackathonFunnel` below.

## Team Demo Videos

Per-team `demo_video_url` (string) + companion `demo_video_url_submitted` (ISO timestamp, set on first save). Stored on the Firestore `teams` doc, mirrors the `devpost_link` shape. Allowed providers: YouTube, Vimeo, Loom, Google Drive (same set the `VideoDisplay` component handles).

- **Backend:** field in `edit_team()` allowlist (`api/teams/teams_service.py`). Hacker self-serve via `POST /api/team/<teamid>/demo-video` (mirrors `/devpost`). Admin uses the existing `PATCH /api/team/edit` (gated on `volunteer.admin`).
- **Public display:** `TeamList.js` shows a `<LiteVideoThumbnail>` per team card (CWV-safe — single lazy `<img>` of the YouTube hqdefault.jpg, NOT an iframe per card). Click → one page-level `<Dialog>` with `<VideoDisplay>`. Per-card iframes were rejected because 30+ embeds = ~45MB and trashes LCP/CLS.
- **Winners (`HackathonResults` on `/hack/[id]/results`):** inline `<VideoDisplay>` embed — only 3-5 cards so direct iframe is fine. Iframe has `loading="lazy"`.
- **Hacker self-serve:** `TeamCreation/TeamStatusPanel.js` has its own "Demo Video" section beside the DevPost section with live preview via `LiteVideoThumbnail`. Validates URL is one of the 4 supported providers client-side.
- **`LiteVideoThumbnail`** (`src/components/VideoDisplay/LiteVideoThumbnail.js`): the lite-embed component. Renders YouTube hqdefault thumb when the URL is YouTube; otherwise a generic dark "▶ Watch demo" tile (don't fetch Vimeo oEmbed per render — kills CWV). Always wraps a `<button>` with `loading="lazy" decoding="async"` + explicit `width`/`height` (CLAUDE.md CWV rule).

## Team page split: `/mentor` and `/completion` sub-pages

The team detail page is now `src/pages/hack/[event_id]/team/[team_id]/index.js` (was `[team_id].js` — moved into the dir so sub-routes can exist; **all relative imports there are depth-5 `../../../../../`**). The two heavy panels were lifted off the overview page into dedicated routes to cut vertical space:

- `…/team/[team_id]/mentor.js` → frames `MentorTeamPanel` (gated on `eventHasStarted`; before-start shows a calm "opens when the event starts" card, never 404).
- `…/team/[team_id]/completion.js` → frames `TeamCompletionChecklist` (gated on `showCompletionChecklist = isWinningStatus || DEPLOYED/NONPROFIT_SIGNOFF`; non-winning shows an "unlocks later" card, never 404; uses `useTeamMembership` for write-gating).

On `index.js` the two `SectionBlock`s (ids `#mentor-support` / `#completion`, still in the TOC) now render **compact refined summary cards** — `TeamMentorSummaryCard` / `TeamCompletionSummaryCard` (`src/components/Teams/`) — computed from fields the public `get_team` already returns (`mentor_checklist`, `mentor_open_flag_count`, `mentor_last_touched_at`, `mentor_ratings`; `completion_checklist`, `completion_status`, `completion_completed_at`) — **no backend change**. Each card links to its sub-page. The mentor summary always renders (empty-state line when no activity); the completion summary renders only for winning teams (same gate as before).

Shared across the three pages: `src/components/Teams/teamPageData.js` (`fetchTeamAndEvent` — the rethrow-network / notFound-on-404 SSR fetch; `statusLabel`; `COMPLETION_VISIBLE_STATUSES`/`SCROLL_OFFSET`/`OG_IMAGE`), `src/hooks/use-live-team.js` (client refetch after hydration), `src/components/Teams/RefinedTeamShell.js` (`Shell`), `src/components/Teams/TeamBreadcrumbs.js` (refined-token breadcrumbs + `BreadcrumbList` JSON-LD). `COMPLETION_ITEMS`/`COMPLETION_TOTAL` are now **exported** from `TeamCompletionChecklist.js` (single source for the summary card). All three pages carry a `Home › Event › Team › {leaf}` breadcrumb (the overview's old "← Back to event" top link was replaced by it); sub-pages are `noindex,follow` with `fallback:"blocking"`. The event-list `MentorSupportSummary` "Mentor details →" link (`src/components/Hackathon/TeamList.js`) points at `…/team/<id>/mentor`. The heavy panels were moved **verbatim** (no internal refactor) and stay `dynamic(ssr:false)`.

## Team Project-Completion Checklist (winning teams)

On `/hack/[event_id]/team/[team_id]`, winning teams (`isWinningStatus(team.status)` OR `team.status in ['DEPLOYED','NONPROFIT_SIGNOFF']`) see an interactive 8-item Definition of Done checklist (`src/components/Teams/TeamCompletionChecklist.js`) mirroring `/about/completion`. Each check is **permanent** — backend 409s on re-check, no unchecking. Each click opens a confirmation Dialog → on confirm POSTs to `/api/team/<teamid>/completion/toggle` with `{item: <slug>}`, fires `react-confetti` (already in deps, dynamic ssr:false same as `pages/volunteer/track.js`), and the backend posts a celebration message into the team's `slack_channel`. When 8/8 done, a giant glowing button POSTs `/api/team/<teamid>/completion/complete` which Slacks the team channel **CCing the 6 OHack admins** (`TEAM_COMPLETION_SLACK_ADMINS` in `api/teams/teams_service.py`, single source of truth for both `queue_team()` admin invites and completion broadcasts).

Both routes are `@auth.require_user` + a `user_is_on_team()` check. **Identity matching is non-obvious here**: a Firestore user doc stores TWO identity fields — `user_id` (the OAuth identity, e.g. `oauth2|slack|...`, sometimes empty) and `propel_id` (the PropelAuth UUID, marked PII). PropelAuth's `auth_user.user_id` is the propel UUID, so `user_is_on_team()` translates propel UUID → OAuth `user_id` via `get_propel_user_details_by_id(...)` (same as `get_my_teams_by_event_id`) and compares; it also falls back to `propel_id` direct-match for users that have it set. Frontend membership check is done via `GET /api/team/<event_id>/me` rather than client-side comparison, because the public team payload deliberately omits `propel_id` (PII). Non-members see a read-only progress view. Item slugs (`deployed`, `nonprofit_signoff`, `login_details`, `code_updated`, `tasks_closed`, `sensitive_info_security`, `documentation`, `open_source`) MUST stay in lockstep between frontend `COMPLETION_ITEMS` and backend `COMPLETION_ITEMS`. New Firestore fields on the team doc (all optional; no migration): `completion_checklist`, `completion_status` (`not_started`|`in_progress`|`complete`), `completion_completed_at`, `completion_completed_by_propel_id`, `completion_completed_by_name`.

**Team member rendering on the same page**: the public `get_team` (`services/teams_service.py`) now enriches `team.users[]` from a list of doc-id strings into `{id, user_id, name, nickname, profile_image}` via a single batched Firestore `get_all`, cached behind the existing 10-min TTL. Backwards-compatible: `HackathonResults.js`/`TeamList.js` already handle both shapes. The list endpoint `get_teams_list()` is NOT enriched — only the single-team getter. Profile tile links point to `/profile/{user.id}` (Firestore doc id, NOT propel_id — see "Public profile route" gotcha).

## Mentor Team Panel (per-team mentor coordination)

On `/hack/<event_id>/team/<team_id>`, mentors get an interactive support panel (`src/components/Teams/MentorTeamPanel.js`) above the completion checklist. Visible to everyone once `event.start_date <= now` (read-only for non-mentors, never archived). Four sections: **Open concerns** (flags with owner attribution + take-over), **Coverage** (6-item team-observation checklist mirroring `MENTOR_COVERAGE_ITEMS`), **Judging readiness** (5-criterion rubric — Scope/Documentation/Polish/Security/Accessibility, the last being the special-category prize on `/about/judges`; consensus = worst rating across mentors), and **Notes feed** (chronological, attributed, soft-delete-own). Mobile renders as `<Accordion>`s, desktop renders all sections inline (`useMediaQuery(theme.breakpoints.down("sm"))`).

Item slugs (`intro_made`, `scope_reviewed`, `architecture_discussed`, `repo_health_checked`, `criteria_walkthrough`, `demo_devpost_reviewed`) MUST stay in lockstep with backend `MENTOR_COVERAGE_ITEMS` in `api/mentors/mentors_service.py`. Same lockstep contract as `TeamCompletionChecklist`.

**Coverage is PER-MENTOR (multi-sign-off), not a single global checkbox.** Each item collects independent checks from up to `COVERAGE_TARGET_MENTORS` (=3) distinct mentors; an item only counts toward "X/6 covered" (and the one-time 6/6 Slack milestone) once 3 mentors sign off. A mentor can only add or clear **their own** check — clicking your check clears it; an item already at 3 (and not yours) renders locked. Data shape: `mentor_checklist[slug] = { checks: { <propel_id>: { name, checked_at } } }`. The **legacy single-mentor shape** (`{ done, checked_by_propel_id, checked_by_name, checked_at }`) is read transparently as one check and migrated into `checks` on next touch. All consumers compute counts via the shared helpers in `mentorCoverage.js` (`coverageChecks`, `coverageItemCovered`, `coverageDoneCount`, `COVERAGE_TARGET_MENTORS`) — never read `.done` off a coverage entry. Consumers: `MentorTeamPanel`, `MentorTeamsTable`, `Hackathon/TeamList` (`MentorSupportSummary`), `TeamMentorSummaryCard`. **Backend Firestore gotcha:** `ref.set({mentor_checklist:{...}}, merge=True)` deep-merges map fields, so removing a nested check requires a `firestore.DELETE_FIELD` sentinel at the exact key path — popping the key in Python then writing the dict does NOT delete it (this was the "Coverage cleared but still checked" bug). MockFirestore replaces maps instead of deep-merging, so this only reproduces in prod.

**Mentor auth gate**: server-enforced via `user_is_mentor_for_event(propel_user_id, event_id)` in `api/mentors/mentors_service.py`. Requires a volunteer doc with `volunteer_type='mentor'`, `event_id=<this event>`, `isSelected=True`. Identity matching uses the shared `_find_mentor_volunteer()` resolver, which mirrors `handle_get` (volunteers_views.py) and tries three lookups in order: (1) **raw propel UUID** against the doc's `user_id` field — how `handle_submit` stores self-submitted apps, the common case; (2) **PropelAuth email** == doc `email`; (3) **OAuth `user_id`** (`oauth2|slack|...`, legacy docs). Lookup #1 is load-bearing: it was once missing (only email + OAuth-user_id were tried, and the OAuth-user_id query is a dead path against propel-UUID-stored docs), so any approved mentor whose application email ≠ login email got a false 403. Don't drop it. Frontend gates interactivity via `GET /api/volunteer/<event_id>/me?type=mentor` (returns `{is_mentor, volunteer}` — the volunteer subset is lean, no PII). When `eventId={null}` is passed, the fetch is skipped entirely — used by `MentorTeamPanelDemo.js` on `/about/mentors` to render the panel statically without backend calls.

**Slack volume is intentionally quiet**: only flag-raises, flag-resolutions, and the first-time "all 6 covered" milestone broadcast to the team's `slack_channel`. Flag-raises also heartbeat the per-event mentor channel (`hackathon.mentor_slack_channel`, defaulting to `<event_id>-mentors` lowercased with `_`→`-`). Coverage toggles, notes, take-overs, and rating changes are quiet. Each write does call `send_slack_audit(...)` for the audit trail.

**Live updates**: the panel refetches `GET /api/messages/team/<id>` on `document.visibilitychange` (tab refocus) — best-effort, errors swallowed. No polling.

**"Teams Ready for a Boost" extension** (`api/leaderboard/leaderboard_service.py::collect_mentor_panel_opportunities`): the leaderboard's `mentor_opportunities` array now includes two new sources — any team with an open `mentor_flag` (up to 2 per team to limit noise), and any team with `mentor_last_touched_at > 4h ago` during a live event window (`start_date <= now <= end_date + 1d`). Renders alongside the existing GitHub-derived signals.

**Hackathon field**: `mentor_slack_channel` (optional string, max 80 chars, validated as a top-level field in `common/utils/validators.py`). Admin UI lives in `OverviewSection.js`. The frontend never reads this directly — it's purely a backend Slack-routing config.

**Denormalized team fields** (kept in sync by every mentor service write): `mentor_last_touched_at`, `mentor_last_touched_by_name`, `mentor_open_flag_count`, `mentor_coverage_completed_at`, `mentor_coverage_completed_by_name`. The leaderboard reads these directly; don't compute on the fly.

**Judging readiness / coverage / flags render IDENTICALLY everywhere** — the per-team `MentorTeamPanel`, the team-overview `TeamMentorSummaryCard`, and the event-page `TeamList` `JudgingReadinessStrip` all compute from the same `mentor_ratings` array via `latestRatingsByMentor` + `consensusForCriterion` (worst rating across mentors, per criterion). If these LOOK different across pages it's a **cache-staleness** mismatch, not a logic bug: the team page is live (`useLiveTeam` refetches `get_team`, whose `_GET_TEAM_CACHE` is registered + busted on every mentor write), but the event page (`/hack/<event_id>`) is `getStaticProps` ISR (`revalidate: 60`) reading the backend-cached `get_single_hackathon_event` (10-min TTL, NOT a registered cache). Mentor-service `clear_cache()` (`api/mentors/mentors_service.py`) therefore also calls `hackathons_service.clear_cache()` so mentor changes flush the event cache — without that the event `#teams` view lagged up to 10 min. Residual freshness floor on the event page is the 60s ISR interval (inherent; the page has no client-side teams refetch).

## Admin Teams (`/admin/teams?event_id=...`)

File: `src/components/admin/TeamManagement.js` (~2900 lines, hosted in `src/pages/admin/teams/index.js`). Three concerns added together (deliberately scoped — no full redesign):

- **Demo Video column + inline-edit Popover** (`TeamFieldPopover`): table cell shows a 96×54 thumbnail if set, "+ Add" button if missing. Click → Popover with `TextField` + live `LiteVideoThumbnail` preview + Save/Cancel/Clear. Optimistic update: `handleQuickPatch` PATCHes the partial and merges into local `teams` state — no full refetch.
- **`patchTeam(partial)` helper**: extracted from `handleSaveTeam`. Always include `id` in the partial. Both the full edit Dialog and `TeamFieldPopover` use it. If you add another quick-edit field, hang it off this same helper + the Popover (parameterize `field`/`label`/`placeholder`/`validate`/`previewKind`).
- **Filter chips above the table** (state: `activeFilter`): `All` / `Winning` / `In review` / `Active` / `Missing DevPost` / `Missing Video`. Pure client-side — extends the existing `filteredTeams` useEffect. Filter resets `page` to 0 so the user lands on results.
- The full edit Dialog's Team Details tab also has the Demo Video URL TextField (next to DevPost), with the same `validateDemoVideoUrl` helper and a `LiteVideoThumbnail` preview underneath.
- **Team approval lives WHERE you assign the nonprofit, not in Communication.** Approving an `IN_REVIEW` team posts to `POST /api/team/approve` with `{teamId, nonprofitId}` — the call carries `selected_nonprofit_id` and persists it server-side, so **no separate "Save Changes" is needed to approve** (selecting in the dropdown only updates local state; approve commits it). The "Approve Team" CTA is surfaced in two places: (1) inline in the Nonprofit Assignment tab right under the selector (green box, disabled until a nonprofit is picked), and (2) a persistent footer action in the edit dialog — green "Approve Team" when a nonprofit is selected, or an outlined "Assign nonprofit to approve" that jumps to tab 1 (`setActiveTab(1)`) when not. Both open the existing confirm dialog (`approvalDialogOpen` → `handleApproveTeam`). Don't re-add the approve button to `renderCommunication` (it was removed from there — it's unrelated to messaging and was the source of the confusing "select nonprofit → switch to Communication tab → approve" flow). Footer/inline CTAs only show for `status === "IN_REVIEW"`; approved teams show a success confirmation instead.
- **Nonprofit Assignment tab — always render the dropdown.** Do NOT short-circuit `renderNonprofitSelection` when `teamData.nonprofit_rankings` is missing; teams created outside the matching flow still need a manual-assign UI. `fetchNonprofits` falls back to `GET /api/messages/npos` (all nonprofits) when the hackathon-scoped `GET /api/messages/npos/hackathon/{id}` returns an empty list, so admins can still pick a nonprofit on hackathons that don't have any attached. `nonprofitSource` (`"hackathon"` | `"all"`) drives a fallback notice in the UI.
- **Don't N-render the component.** Fetching per-repo GitHub data (issue summaries, issues) used to do a separate `setState` per repo, which re-renders this ~2900-line component once per repo (~12–30 cascading renders on load and on every dialog open). Both prefetch paths now collect results via `Promise.all` and merge into a SINGLE `setGithubIssueSummaries` / `setGithubIssues` call. If you add another per-team batch fetch, follow the same pattern — never call setState in a forEach loop over teams/repos.
- **No render-body `console.log`s.** Logs at module top-level inside the component body (e.g. `console.log("Team Data:", teamData)`) fire on EVERY render. They turn a render storm into console spam and slow the page further. Keep diagnostic logs inside callbacks or effects, never in the render path.

## /hack Index Page Architecture

The page is intentionally optimized so a visitor reaches an upcoming event in the first ~250px of scroll. The order is **hero → upcoming events → story strip → archive → "About these events" (merged Why Join + Before signing up) → Sponsor CTA**. Do not re-insert marketing copy ("Why Join") or news ("Latest Updates") between hero and events — both were removed because they pushed events 900+px below the fold.

Hero is intentionally minimal: one h1 (`<h1>Hackathons for nonprofits</h1>`) + two CTAs ("See upcoming events" / "Join the community"). The long "Since 2013, we've helped 100+ nonprofits..." tagline was removed because the Story Strip immediately below shows that with concrete numbers. Don't re-add the tagline.

**Section IDs (load-bearing for `HackPageNav` and other anchor consumers):**

- `#upcoming-events` on the upcoming events `<Box>` wrapper in `pages/hack/index.js`
- `#since-2013` on the outer `<Box>` of `HackathonStoryStrip`
- `#previous-events` on the `OuterGrid` of `PreviousHackathonList`
- `#about-events` on the merged Why Join + Before You Join section in `pages/hack/index.js`
- `#year-{yyyy}` on each `YearSection` inside the archive
- All section anchors carry `scrollMarginTop: 100` (or higher) so jumps don't get hidden behind the 80px NavBar.

### HackPageNav (page-level TOC)

`src/components/HackathonList/HackPageNav.js` — small floating widget showing the four top-level sections. Hidden until hero scrolls past (driven by a rAF-throttled scroll listener checking when `h1.getBoundingClientRect().bottom < 60`). Desktop: `position: fixed; left: 16px; top: 50%` vertical pill stack. Mobile: `position: fixed; top: 64px` (below NavBar) horizontal scrollable pill bar. Active state follows scroll position via the same rAF anchor-line pattern as the archive (`anchorY = 160`). Updating the section list = edit `SECTIONS` array at the top of the file.

### HackathonList — news removed

The "Latest Updates" news block inside `HackathonList` is rendered ONLY in `compact={true}` mode (used by the home page sidebar). On `/hack`, the news fetch is gated by `if (!compact) return undefined;` in its `useEffect` to avoid the network call. The full-width `/hack` render shows a small "Read latest updates from Opportunity Hack" link to `/blog` below the events grid. Do not re-add news to the full-width render — it broke the events → strip → archive flow and added ~500-800px of scroll.

### About these events (merged section)

After the archive, `#about-events` combines:

1. A compact "What you get" 4-up icon row (Code / Group / EmojiEvents / EventAvailable) — replaces the old "Why Join" Paper. No big photo. Icons + 1-line descriptions.
2. The original "Before signing up" 3-card row (Code of Conduct / Liability Waiver / Photo Release).
   Both share the same h2 ("About these events") and are stacked under `overline` sub-headings. Don't promote either back above the events — they're context, not finder-flow.

## Story Strip + Year-Grouped Archive

`HackathonStoryStrip` (`src/components/HackathonList/HackathonStoryStrip.js`) bridges `<HackathonList />` (upcoming) and `<PreviousHackathonList />` (archive) on `/hack`. It fetches `GET /api/messages/hackathons/funnel/aggregate` for stat tiles and derives a year sparkline from `useHackathonEvents("previous"|"current")` (no extra fetch).

- **Year jump uses a CustomEvent, NOT URL hash.** Clicking a year dot dispatches `window.dispatchEvent(new CustomEvent('ohack:archive-jump-year', { detail: { year } }))`. `PreviousHackathonList` listens for that event, sets `activeYear`, then scrolls `#year-{yyyy}` into view. Don't switch to hash-based — it would collide with deep-link patterns elsewhere.
- **Arizona callout lives INSIDE the strip.** Previously a standalone `<Alert>` between "Why Join" and Upcoming. Do not re-add it to `pages/hack/index.js` — it now sits below the year sparkline inside `HackathonStoryStrip`.
- **CLS guardrail.** Strip reserves `minHeight: { xs: 420, md: 240 }` on its outer `<Box>`. Funnel data load shows `Skeleton`s inside the stat tiles, not a missing component. Don't return `null` while loading.
- **Heading:** strip uses `<h2 id="story-strip-heading">`. Page-level h1 ("Hackathons") in `pages/hack/index.js` is the only h1 — keep it that way.

### Previous Events archive — year-grouped, no pagination, photo-led

`PreviousHackathonList` (`src/components/HackathonList/PreviousHackathonList.js`) renders the full 12+ year archive on one continuous scroll. **No pagination, no year-filter chips** — the prior design (8/page + chip filter + scroll-to-top jumps) created the "takes a while to click around" friction the redesign addresses.

- **Year-grouped layout.** Events are grouped by `format(parseLocalDate(start_date), 'yyyy')`, sorted desc. Each year renders as a `<YearSection>` with `id="year-{yyyy}"` anchor, year heading (h3), and event-count chip. `scrollMarginTop: { xs: 130, md: 100 }` accounts for the NavBar (~80px).
- **Sticky vertical `YearRail`** (desktop ≥md): left-side `<nav aria-label="Jump to a year">` with `position: sticky; top: 84px`, vertical list of year buttons sized by event count. On mobile (<md): horizontal sticky bar at `top: 64px`. Clicking a year scrolls to `#year-{yyyy}` and sets `activeYear` state (which drives the bright-blue active pill via `$active` styled-component prop). **`activeYear` is click-driven only** — earlier scroll-driven IntersectionObserver/scroll-listener attempts fought smooth-scroll race conditions (last in-flight year would win the final state, landing on neighbor). Cut entirely; cleaner code, no race.
- **Photo-led `PastEventCard`.** Cards lead with a 16:9 image header from `event.event_photos?.[0]?.url`. When absent, fall back to a `GradientFallback` that hashes year → HSL hue (`((year - 2013) * 37) % 360`) so the wall doesn't feel monotone. `next/image` with `fill` + `sizes` + `loading="lazy"`. `event.image_url` is intentionally NOT used as a fallback (it's typically the generic OHack logo on legacy events — would make every card look the same).
- **Image domain allowlist.** `cdn.ohack.dev` is in `next.config.js` `images.remotePatterns`. Adding new event-photo CDN domains requires updating that file too.
- **`LazyMount` per card.** `ImpactMetrics` per-card API fetch is gated by IntersectionObserver with `rootMargin: '300px'`. The archive is long (~30+ cards across 13 year groups); without this, every card fetches on mount → CORS-flood the backend. Keep it.
- **Layout flex.** `<Box display="flex" flexDirection={{xs:'column', md:'row'}}>` wraps `YearRail` + content area. Year rail width is `108px` on desktop. Content area uses `<Grid container spacing={2}>` with `size={{ xs: 12, sm: 6, md: 4, lg: 3 }}` — 4 cards/row on lg, 3 on md, 2 on sm, 1 on xs.
- **Don't reintroduce pagination.** The whole point of this redesign is one continuous scroll with rail-teleport. If you need to gate something for perf, prefer further lazy-loading of card content, not paging the list.

## Local Landing Pages

### Arizona Hackathons (`/hackathons/arizona`)

- File: `src/pages/hackathons/arizona/index.js`
- **Refined** (civic-editorial): `RefinedRoot`/`RefinedFonts` + `.ohx-*` sections — hero (italic "Arizona." + stat row), wide hero photo (`2025_fall/.../IMG_9623.JPG`), alternating paper/`--surface-2` bands (Upcoming/Past/Why-ASU/FAQ), one navy band (For Companies), numbered nonprofit steps, native `<details>` FAQ. `getStaticProps` (SEO via pageProps → `_app.js`) kept verbatim; only `<Head><RefinedFonts/></Head>` added. `AZ_LOCATION_PATTERNS`/`isArizonaLocation`/`formatEventDate`/`trackClick` (GA `click_arizona_hackathon`) preserved.
- Targets: "asu hackathon", "phoenix hackathon", "hack arizona", "hackathons in arizona", etc.
- Uses `useHackathonEvents("current")` and `useHackathonEvents("previous")` with `isArizonaLocation()` filter (AZ_LOCATION_PATTERNS constant at top of file).
- Structured data: WebPage + BreadcrumbList + Event (Fall 2026 ASU with GeoCoordinates) + FAQPage.
- Internal links from: `pages/index.js` (pillar links section), `pages/hack/index.js` (inside `HackathonStoryStrip`, not as a top-level Alert), `pages/sponsor/index.js` (About section).

## SEO infrastructure (June 2026)

- **`/server-sitemap.xml`** (`src/pages/server-sitemap.xml.js`) is the server-side sitemap for dynamic routes — `/hack/{event_id}`, `/nonprofit/{id}`, `/blog/{id}`. Referenced in `next-sitemap.config.js` `additionalSitemaps`. It fetches from the API at request time with a 1-hour CDN cache (`s-maxage=3600`).
- **Canonical host is `www.ohack.dev`**. All `rel="canonical"`, `og:url`, and structured-data URLs in `src/pages/**` must use `https://www.ohack.dev/...`. `frontend.ohack.dev` 301s to www via `next.config.js`. Never hardcode bare `https://ohack.dev/` (without www) — GSC indexed the non-www host and we redirected it all away.
- **`/hack/[event_id]` canonical slug:** use `event?.event_id || event_id` (the backend's canonical ID), not the raw `params.event_id` (which could be an alias). `canonicalUrl` is computed once and used for canonical, og:url, structured data, and breadcrumbs.
- **Soft-404 guard in `getStaticProps`:** backend returns `200 + {}` for unknown event IDs. The guard `if (!data || !data.id) return { notFound: true }` converts these to real 404s.
- **P3 judge-page consolidation:** `/hackathon-judge`, `/hackathon-judging`, `/hackathon-judging-opportunities` were deleted and 301-redirected to `/hackathon-judge-opportunities` (the canonical, kept). Entries removed from `next-sitemap.config.js` exclude list.
- **Legacy event slug 301s** in `next.config.js`: `season-YYYY → YYYY_season` for years ≤ 2025 (2026+ events natively use `season-YYYY` IDs). Generated as a flat array since Next.js path-to-regexp can't put two named params in a destination without literal text between them.
- **Homepage pillar links** in `src/pages/index.js`: "For developers & volunteers" block now links to `/hackathon-for-social-good` and `/hackathons/arizona` in addition to `/projects` and Slack.

## Gotchas (load-bearing — every one of these has bitten us)

### Typography system (Aug 2026 overhaul — single source of truth)

**`src/styles/fonts.js` is the ONLY place font families are defined.** It loads Fraunces + Hanken Grotesk via `next/font` (self-hosted, preloaded, size-adjusted fallbacks); `_document.js` puts their `.variable` classNames on `<Html>`, defining `--font-body`/`--font-display` on the root (reaches MUI Portals). Every JS consumer imports `FONT_BODY` / `FONT_DISPLAY` / `FONT_MONO`; CSS consumers use `var(--font-primary)` etc. from `theme.css` (aliases of the same vars). **Never hardcode `'Hanken Grotesk'`/`'Fraunces'` strings** — next/font renames families to hashed names, so a hardcoded literal silently renders a fallback font (enforced by `npm run lint` + `src/styles/__tests__/typography.test.js`). `RefinedFonts` is a deprecated `() => null` stub (43 legacy call sites keep compiling — don't add new ones, don't re-add Google Fonts `<link>`s). The bespoke exception: `/12-years-of-social-good` loads its own Fraunces+JetBrains Mono link. **Opportunistic cleanup rule:** when editing a file for any other reason, also (a) delete any `<RefinedFonts />` usage + its import (it renders nothing), and (b) delete stale `eslint-disable` comments referencing rules our config doesn't load (`react-hooks/*`, `@next/next/*` — they're the 29 lint warnings). Directory-scoped details live in `src/styles/CLAUDE.md` and `src/components/design/CLAUDE.md`.

**Root font-size is `100%` (16px) — it was `12px` for years** (the old value made every rem render at 75% of face value: 12px body, 10.5px buttons, 9px captions site-wide). When it was fixed (Aug 2026): all JS/MUI rem values were left as-is (they were authored for a 16px root and now render as intended); legacy `src/styles/**/*.css` + `styles/nonprofit(/apply)/styles.js` + `refined.js`'s display clamps/eyebrow/tag/btn sizes were **frozen to px at their old rendered look** (old rem × 12) — do NOT convert those px values back to rem without re-deriving them, and never set a fixed px root again (contract test asserts `100%` and zero rem in `src/styles/**/*.css`). Deleted as dead in the same pass: `messages-grid.css`, `styles/{sponsors,profile,nonprofits}/styles.js`, and the `.button--filter`/`.headline`/`.ohack-nonprofit-feature*`/`.alert-notification`/`.indent`/`.material-symbols-outlined` blocks. MUI's global theme (`assets/theme.js`) uses `FONT_BODY` for body + all headings (the old `'Montserrat', monospace` h1 rendered actual monospace — Montserrat was never loaded).

### PropelAuth permission checks — `userClass`, NOT `orgHelper`

`useAuthInfo()` returns both `userClass` and `orgHelper`. They look interchangeable but they are NOT:

- `orgHelper.getOrgs()` returns **plain info objects** (`{orgId, orgName, ...}`) with NO methods. Calling `.hasPermission()` on them throws (silently caught by surrounding try/catch, leaving every admin check returning `false`).
- `userClass.getOrgByName("Opportunity Hack Org")` returns the **full OrgInfo object** with `.hasPermission(perm)`, `.assignedRole()`, etc.

Pattern to copy (matches `pages/admin/index.js`):

```js
const { userClass } = useAuthInfo();
const org = userClass?.getOrgByName("Opportunity Hack Org");
const isAdmin = org?.hasPermission("volunteer.admin");
```

`orgHelper` is fine for getting `orgId` to pass as the `X-Org-Id` header (`orgHelper?.getOrgs()?.[0]?.orgId`), but never use it for permission checks.

### Public profile route is `/profile/{db_id}`, NOT propel_id

- `/profile/[userid].js` expects the **Firestore document ID** (`User.id`), not the PropelAuth `user_id` / `propel_id`.
- Things stored across the system as `propel_user_id` (assignees, editors, mentions, etc.) cannot be plugged directly into the profile URL — you need the `db_id` field too.
- When the backend bundles user profiles for a list view (planning board users map, team rosters, etc.), it should include BOTH `user_id` (propel) AND `db_id`. The frontend uses propel for matching and db_id for linking.

### MUI TextField in custom theme + Portal — pin colors explicitly

MUI Dialogs render via Portal. The `ThemeProvider` context flows through Portals in MUI v5+ but the underlying `<textarea>` / `<input>` element still inherits browser default styling for `background` and `color` in some configurations — most reliably broken when:

- A page-level `ThemeProvider` overrides `palette.mode` (e.g. local dark mode toggle).
- The Dialog renders a `<TextField>` with `variant="outlined"` (the default).

Symptom: white textarea with light-gray placeholder, unreadable inside a dark dialog. Fix is to pin the input area to theme tokens via `sx`:

```js
<TextField
  sx={{
    "& .MuiInputBase-root": {
      bgcolor: "background.paper",
      color: "text.primary",
    },
    "& textarea, & input": { color: "text.primary" },
  }}
/>
```

Apply this to any TextField inside a Dialog when the page uses a non-global theme override.

### Stale "selected item" snapshots vs. polled list state

Pattern that bit us: a list view (board, roster, etc.) polls fresh data into `boardState`. A user clicks a row → we set `selectedItem = item` (a snapshot of the click-time value). The detail Dialog renders from `selectedItem`.

Two consequences when subsequent edits land:

1. The Dialog shows stale fields (the saved description doesn't appear after the polled refresh).
2. Optimistic-concurrency PATCHes (`If-Match: <updated_at>`) use the click-time `updated_at` and 412 on every save after the first.

Fix: derive the live record from the polled state, not from the captured selection:

```js
const liveItem = state.items.find((i) => i.id === selectedItem.id) || selectedItem;
return <DetailDialog item={liveItem} ... />
```

This pattern applies anywhere a Dialog opens with a snapshot from a polled or paginated list.

### Local theme provider for scoped dark mode

The OHack global theme is light-only. If you need dark mode for a specific surface (e.g. the planning board), don't add a global toggle — wrap that surface in a local `ThemeProvider` and persist the preference per-feature in localStorage. See `src/components/Planning/PlanningThemeProvider.js` for the pattern (auto / light / dark cycle, `prefers-color-scheme` detection).

### Vertical padding for dense control rows — default is too tight

MUI `py: 1` (8px each side, 16px total) is what you'll reach for instinctively, and it's wrong for any container holding multiple chips/buttons/avatars side-by-side. The result feels cramped — and when the container sits right under the global NavBar (64px), it visually crowds the navbar.

Heuristic for any "header bar" or row of controls:

- `py: 1.75` → minimum, acceptable on light rows
- **`py: 2.25` + `minHeight: 64`** → the safe default for a header-style bar with chips/buttons (matches the NavBar's own height so the surfaces feel balanced)
- Add `flexShrink: 0` if it lives inside a flex column — otherwise dense content can compress it.

If you reach for `py: 1` on a row of controls, stop and use `py: 2.25 + minHeight: 64` instead. We've fixed this same bug twice in the planning board.

### Don't repeat the same notice/warning inside one surface

A full-width MUI Alert that screams "this is public" is appropriate ONCE near the top of a form/dialog/page. Repeating the same Alert beside every input that "could expose data" (attachments, comments, descriptions) is alarmist, hurts readability, and trains users to ignore the warning entirely.

Pattern instead:

- One compact notice at the top (`<PlanningPublicNotice compact />` style — single line, smaller font, no AlertTitle).
- Subtle inline hints at each input that needs the reminder:
  - Placeholder text: `"Post a public comment…"`
  - Helper text under a file picker: `"PNG, JPG, WebP, GIF — max 10 MB · publicly visible"`
- Reserve full Alerts for state changes the user actually needs to act on (errors, conflicts, success).

### Shareable dialog state — sync open card/item with the URL

When a Dialog represents a specific item (a card, a hackathon, a profile section), make the URL reflect what's open so users can copy/paste/share the link:

```js
function handleOpen(item) {
  setSelectedItem(item);
  router.replace(
    { pathname: router.pathname, query: { ...router.query, card: item.id } },
    undefined,
    { shallow: true }, // critical — no refetch, no scroll, no re-render of getStaticProps
  );
}

function handleClose() {
  setSelectedItem(null);
  const { card: _, ...rest } = router.query;
  router.replace({ pathname: router.pathname, query: rest }, undefined, {
    shallow: true,
  });
}

// Auto-open on mount when the URL says so:
React.useEffect(() => {
  const targetId = router.query.card;
  if (!targetId || !items) return;
  const found = items.find((i) => i.id === targetId);
  if (found && !openedRef.current) {
    handleOpen(found);
    openedRef.current = targetId;
  }
}, [router.query.card, items]);
```

For social-unfurl-quality previews (Slack, Twitter, LinkedIn) the URL also needs an SSR route that emits per-item OG meta tags — query-param-based opens won't unfurl. See `src/pages/hack/[event_id]/plan/c/[card_id].js` for the pattern (separate SSR route with `getServerSideProps`, fetches the item server-side, emits `og:title` / `og:description` / `og:image`, then re-renders the parent page with the dialog pre-opened).

## Event Feedback Surveys (`/hack/[event_id]/survey` and `/hack/[event_id]/feedback`)

Post/live-event feedback for selected volunteers + nonprofit partners. Both routes render the same `src/components/Survey/EventSurvey.js` (`dynamic` `ssr:false`, wrapped in `ReCaptchaProvider`); `feedback.js` is just an alias of `survey.js` (passes `source="feedback"`). Distinct from `/feedback/[userid]` (peer feedback) and the backend `feedback` collection — this writes the backend `surveys` collection.

- **Question catalog** is pure data in `src/components/Survey/surveyQuestions.js`: `SURVEY_QUESTIONS` + `getSurveyQuestions(role, mode)`. 4 universal (+ the `role` selector, handled in the component, = 5) then per-role blocks (hacker 15 / mentor 5 / judge 6 / nonprofit 6 / volunteer 4). Each question has `roles` (`"all"` or array), `mode` (`live|post|both`), `type`, optional `showIf(answers, mode)`. Answer IDs are stable across modes (`first_timer`, `mentor_unreachable` intentionally shared) so live + post merge. Composite types (`scale_text`, `yesno_text`) store `{ value, note }`.
- **Flow**: component reads `GET /api/surveys/<event_id>/context` (mode + eligible roles + `requires_captcha` + `already_submitted`) using the PropelAuth token when present, then `POST /api/surveys/<event_id>/responses`. Only currently-visible (showIf-passing) answers are sent, so switching role doesn't carry stale answers. `role` is stored top-level and mirrored into `answers.role`.
- **Role scope**: the role selector is limited to `ctx.allowed_roles` (the role[s] you're `isSelected` for). One allowed role → a fixed chip, no picker; nonprofits/anonymous are locked to Nonprofit. An effect keeps `role` inside `allowed_roles`, and the backend re-enforces (403). Don't widen the selector back to all `ROLE_OPTIONS`.
- **Conditional follow-ups**: `scale_text` questions support `noteWhen(value)` — the note box appears only when it returns true (used by `hacker_onboarding`: reveal "what could be improved?" only on scores 1–3, and the note is cleared if the score rises above 3).
- **Auth/CAPTCHA**: not gated by `RequiredAuthProvider` — nonprofits/anonymous can submit. Logged-in `isSelected` volunteers are trusted (no CAPTCHA); everyone else gets an invisible reCAPTCHA v3 token (`useRecaptcha`). Mode `upcoming` shows a "not started yet" card; `live`→"how's it going", `post`→"how was your experience". Pages are `noindex`. Backend computes mode (timezone-aware) — the frontend does NOT recompute dates.
- **Discoverability**: `src/components/Survey/SurveyCTA.js` — a self-contained CTA (var-fallback inline styles so it works in or out of `RefinedRoot`; mount-gated to avoid SSR/ISR hydration mismatch) linking to `/hack/<id>/survey`, rendered only once the event has **started** (live or ended; hidden for upcoming). Wired into: the event page `/hack/[event_id]` (after the masthead — the only surface reaching anonymous nonprofits), `mentor-checkin`, `manageteam`, `team/[team_id]`, and `judge-application` (gated on `isSelected`). Pass `eventId` + `startDate`/`endDate`/`timezone`; the component owns the visibility gate.

## Volunteer Job Board (`/jobs`, `/jobs/[slug]`, `/admin/jobs` — Aug 2026)

Volunteer organizer roles (Social Media Manager, Hackathon Operations Lead — Phoenix, Mentor Program Lead) with an AI-resistant application: required intro **video** (reuses `IntroVideoField` — its bio-video upload mint works as-is because applying requires login), required **PDF resume** (`src/components/Jobs/ResumeUploadField.js` → `POST /api/jobs/apply/resume-upload-url`, clone of the bio-video signed-URL flow, lands at `job_applications/<db_id>/` on the public CDN — accepted obscured-URL risk), a role-specific **work sample** (min 200 chars, mirrored in backend `MIN_JOB_WORK_SAMPLE_LENGTH`), and a **reply-within-5-days responsiveness test** baked into the confirmation email. Load-bearing details:

- **Backend**: blueprint `api/jobs/` (`jobs_views.py` + `jobs_service.py`; registered in `api/__init__.py`). Collections: `job_listings` (doc id = slug, **slug immutable after create**) and `job_applications` (uuid4). Public `GET /api/jobs` returns published+closed (lean fields); `GET /api/jobs/<slug>` 404s drafts/hidden but **returns closed** so shared links render a calm closed panel. Apply/`me` routes are `@auth.require_user`; submit verifies recaptcha (volunteers_service `verify_recaptcha` + FLASK_ENV=development bypass), re-verifies resume/video URLs against the caller's own CDN prefix via `get_blob_metadata`, and 409s duplicates (listing_slug+user_id). Validators in `common/utils/validators.py` (`validate_job_listing[_partial]`, `validate_job_application`, `ALLOWED_JOB_*`). Emails (Resend, `_notifications_disabled()` gate): applicant confirmation (`reply_to` questions@ohack.org + the reply-to-confirm ask), FYI to questions@ohack.org, and warm accept/reject decision emails (`POST /api/jobs/admin/applications/<id>/decision`, optional `personal_note`). TTL caches (300s) cleared on every admin write. Seed: `scripts/seed_job_listings.py` (dry-run default, skips existing slugs, seeds drafts).
- **Frontend pages**: both ISR revalidate 300. `/jobs` index is a refined pillar page (FAQ_ITEMS module-scope → `<details>` + FAQPage JSON-LD); its getStaticProps treats a 404 from `/api/jobs` as empty (deploy-ordering: backend must ship first or the page renders the empty state) but **rethrows other errors** (ISR keeps last good). `/jobs/[slug]` SSRs the listing publicly (SEO/unfurls) with a **top-level `JobPosting` JSON-LD node** (`employmentType: "VOLUNTEER"` → Google for Jobs; TELECOMMUTE + applicantLocationRequirements for remote/hybrid, Tempe `jobLocation` for phoenix_in_person; `datePosted`/`validThrough` set conditionally — **Next rejects `undefined` in props**). Only the `#apply` section is auth-gated — via `useAuthInfo` + `redirectToLoginPage` (app-level AuthProvider), NOT a page-level RequiredAuthProvider which would hide content from crawlers.
- **`JobApplicationForm`** (`src/components/Jobs/`): 4 steps, mentor-form patterns (refinedStyles imports, `useFormPersistence` localStorage autosave with `formType:"job"`/`eventId:slug` — `loadPreviousSubmission` deliberately NOT called; already-applied comes from `GET /api/jobs/<slug>/applications/me` with a 6s `AbortSignal.timeout` so a slow backend can't pin the spinner). **The `<form>` MUST keep `noValidate`** — the required MUI Selects render hidden native inputs and browser constraint validation otherwise silently blocks submission (no submit event, no visible error; this bit us). Phoenix listing (`location_type === "phoenix_in_person"`) hard-blocks `inPersonOk !== "Yes"`; hours below `listing.min_hours_per_week` blocks with a kind redirect message. Never add `isSelected`/staff-owned fields to `initialFormData`.
- **Admin** `/admin/jobs?tab=listings|applications` (blog-admin auth pattern; registered in BOTH nav registries): `src/components/admin/jobs/ListingsTab.js` (table + edit Dialog — deliberately no blog-style editor pages; publish/hide quick toggle) and `ApplicationsTab.js` (filters, detail Dialog derived live from list state — stale-snapshot gotcha —, status/notes PATCH, one-click kind-rejection/accept decision emails).
- **SEO plumbing**: `/jobs/[slug]` in next-sitemap `exclude` + `jobs` substring in the 0.8-priority branch; jobs block in `server-sitemap.xml.js`. Cross-link card on `/volunteer` (`#roles` section). Footer deliberately untouched (CWV height contract).

## Admin Feedback review (`/admin/feedback`)

One `volunteer.admin`-gated page (`src/pages/admin/feedback/index.js`) with 3 MUI tabs over 3 distinct data sources (different scopes — don't merge them into one table). Plain MUI, standard `AdminPage` + `RequiredAuthProvider` shell. Registered in BOTH nav registries (`src/components/admin/AdminNavigation.js` + `src/pages/admin/index.js`). Only the active tab mounts (lazy fetch). Panels live in `src/components/admin/feedback/`:
- **EventSurveysPanel** (event-scoped) — a **sub-view toggle**: "Single event" vs "Compare events" (`<CrossEventSurveys>`). Single-event: event selector (defaults to most recent via `/api/messages/hackathons`) + live/post toggle; fetches `GET /api/surveys/<id>/summary` + `/responses`. Renders KPIs → **during-event pulse** (recharts `ComposedChart` of live responses by hours-since-kickoff: volume bars [grey when n<3] + avg-rating line, day-boundary `ReferenceLine`s) → **needs attention** (`redFlags`: rating ≤2 + live-distress answers like `hacker_blocked`/`mentor_unreachable`/`mentor_team_concern`/`vol_live_issue`/`npo_team_waiting`) → **recurring themes** (going-well vs to-improve keyword chips) → "What people said" (qualitative, the priority) → per-question distributions → individual-response accordions. Reuses the survey catalog (`../../Survey/surveyQuestions`) to label answer keys and route aggregation by question `type` — keep in sync if catalog types change.
- **CrossEventSurveys** (the "Compare events" sub-view) — `GET /api/surveys/overview` (one server-side scan, aggregates only). KPI band (total responses, latest-event rating + ▲/▼ vs prior event, best/worst) → **calendar macro-trend** (`ComposedChart`: events ordered by date, avg overall_rating [solid] + would_return [dashed] lines on 0–5, volume bars [grey when n<`LOW_N`=5]) → **elapsed-time overlay** (multi-select events, defaults to ~3 most recent with live responses; fetches each selected event's `/responses?mode=live` on demand and overlays `elapsedHourSeries` rating curves on a shared hours-since-kickoff axis) → per-event summary table.
- Pure survey helpers: `src/components/admin/feedback/surveyAnalytics.js` (`aggregate`/`formatAnswer` lifted from the panel; `elapsedHourSeries` [date-only start anchored at LOCAL midnight so hour 0 ≈ kickoff for same-tz admins], `eventDurationHours`, `collectFreeText`, `redFlags`, `gist`; re-exports `parseTs`/`extractThemes` from `onboardingAnalytics`).
- **PeerFeedbackPanel** (global, all-time) — `GET /api/admin/feedback/peer`. In the `feedback` map, numeric values = 0-100 skill scores, strings = free-text; `role` is metadata. Giver hidden when `is_anonymous`.
- **OnboardingPanel** (global, all-time) — `GET /api/admin/feedback/onboarding`. A trends-+-actions dashboard, not a flat list. A single **window** toggle (90d / 12mo / all) drives everything. Sections: KPI band (responses, avg rating + ▲/▼ vs prior period, **% "clear"** = Very easy + Mostly clear, % willing to follow up) → **Feedback over time** (recharts `ComposedChart`: volume bars [grey when n<3] + avg-rating line, with `ReferenceLine` markers at hackathon start dates; plus a 100%-stacked `stackOffset="expand"` clarity-mix of `easeOfUnderstanding`) → snapshot distributions (rating / ease / useful-topics) → action lists (**follow-up queue** = `contact.willing && email`, copy-emails button; **needs attention** = rating ≤2 or confusing ease) → **keyword themes** from missingTopics+improvements → response accordions (device chip). Pure helpers (bucketing, themes, device, `parseTs`) live in `src/components/admin/feedback/onboardingAnalytics.js`. **Data shape gotcha**: `contactForFollowup` is `{willing}` or `{willing, firstName, email}` (NOT `name`); `easeOfUnderstanding` is a 4-point ordinal (Very easy▸Mostly clear▸Somewhat confusing▸Very difficult); `usefulTopics` values come from `USEFUL_TOPICS` in `onboardingAnalytics.js` (current onboarding-step names + legacy "Buddy System" kept for pre-July-2026 responses; keep in sync with `FeedbackSection` `topicOptions`); `overallRating` 0 = unrated (excluded from averages). The backend strips a `__Timestamp__` export-sentinel prefix off timestamps.

## Praise Bot admin (`/admin/praise-bot`)

One `volunteer.admin`-gated page (`src/pages/admin/praise-bot/index.js`) configuring the Slack praise-bot (repo `ohack-slack-bot/praise-bot`) via the backend's `praise_bot_config` Firestore collection — the bot polls `GET /api/praise-bot/config` every ~60s, so saves take effect within a minute with no redeploy (the info banner says this; keep it). Registered in BOTH nav registries (`AdminNavigation.js` + `pages/admin/index.js`), SmartToy icon `#611f69`. 4 tabs synced to `?tab=` (`github|calendar|community|global`), communication-page pattern:
- **GitHub Digests** — table + `src/components/admin/praisebot/GithubWatcherEditDialog.js`. A watcher's `source.mode` is `hackathon` (event_id dropdown fed by public `/api/messages/hackathons`; teams/repos/channels resolved live by the bot) or `repos` (explicit repo list + channels). Digest cron + optional mentor rollup (cron + channel). Inline enabled Switch = one-field PATCH.
- **Calendar Reminders** — table + `CalendarReminderEditDialog.js` (public Google Calendar ICS id, channels, lead 1–240 min, poll cron).
- **Community** — singleton doc form (intro matchmaker + weekly digest); backend 400s on a second POST, so the save handler passes `id: config.community?.id` to PATCH when it exists.
- **Global** — dry_run / llm_enabled / timezone, saved via `PATCH .../admin/config/global` (upsert; never DELETE).
All admin calls: `${NEXT_PUBLIC_API_SERVER_URL}/api/praise-bot/admin/config[...]` with Bearer + `X-Org-Id`. Cron UX: `praisebot/CronInput.js` (preset Select + free text, `isValidCron` = 5 whitespace fields; crons are UTC unless global timezone set — Arizona has no DST, so 9 AM AZ = `0 16 * * *`).

## Public Portfolio (`/u/[slug]` + `/profile/[userid]`, Aug 2026)

The public profile is now a shareable portfolio. Load-bearing contracts:

- **Two routes, one component.** `src/pages/u/[slug].js` (canonical vanity URL) and `src/pages/profile/[userid].js` (legacy db-id URL) both SSR through `src/lib/portfolioPage.js::buildPortfolioServerSideProps` and render `<PublicProfile userid initialData>` — the body is **server-rendered now** (the old `dynamic(ssr:false)` served crawlers a "Loading profile…" shell; don't reintroduce it). Redirect rules: `/u/<alias-or-dbid>` → 307 canonical `/u/<slug>`; `/u/<x>` with no slug → 307 `/profile/<id>`; `/profile/<id>` → 307 `/u/<slug>` ONLY when `profile_visibility === "public"` (never redirect private profiles — a db-id link must not leak the chosen slug). `/profile/*` always emits noindex; `/u/*` is `index,follow` only when `profile_visibility === "public"` (default private-first).
- **`src/lib/portfolioMeta.js` is the single source for unfurl composition** (title `name — headline`, description bio→why→role, og:image ladder: YouTube demo thumb [large card] → square cert PNG [summary card] → avatar [summary] → site fallback; JSON-LD Person only when public). The editor's `PortfolioPreviewCard` uses the SAME helpers — keep them pure and shared or the preview lies.
- **`usePublicProfile(userId, { initialData })`**: when seeded from SSR it skips the mount fetch (`seededRef`) and reads `privacy_settings` from the payload (no second privacy fetch). `refetch` still works. The private fallback map includes ALL portfolio privacy keys — keep in sync with backend `privacy_fields`.
- **PublicProfile composition**: PortfolioHero (avatar, h1, headline, role / "N× hackathons" / hearts-tier `.ohx-tag`s via `getTierForHearts` + shared `countHeartsFromHistory` in `src/lib/heartTiers.js`; owner-only "edit your portfolio" banner is a client-side authed compare of own db id — never SSR'd) → why quote → About (bio + BioVideoSection facade + about grid + expertise) → Featured work (`TeamsShowcaseSection` — LiteVideoThumbnail facades + **ONE page-level Dialog** with VideoDisplay; zero iframes at load, TeamList pattern) → GitHubStatsSection (payload `github_history` else fire-once-IO lazy fetch, minHeight 280) → CertificateWallSection (square `next/image` tiles → `/cert/<file_id>`) → Badges → Hackathons (titles link to `/hack/<event_id>`) → Praises → Community feedback. **Empty/private sections skip silently** — teaser copy lives only in the editor.
- **Editor**: Profile.js Tab **index 6** `#portfolio` (indices 0–5 are shareable-deep-link invariants — append only). `src/components/Profile/Portfolio/PortfolioTab.jsx` composes MasterVisibility radio (PATCH `/api/users/profile/visibility`; "public" disabled until a slug is claimed), PortfolioPreviewCard, SlugClaimField (500ms-debounced `GET /api/users/profile/slug/check/<slug>`, explicit Claim → `POST /api/users/profile/slug`, 409/429 surfaced; old slugs stay aliases), HeadlineBioFields (2s debounce via `update_profile_metadata`), BioVideoUpload (**signed-URL flow**: `POST .../bio-video/upload-url` → XHR PUT to GCS echoing `required_headers` [Content-Type + x-goog-content-length-range] → `POST .../bio-video` with `final_url`; or paste a YouTube/Vimeo/Loom link into the same setter), CustomLinksEditor (array save, backend sanitizes), and the "What shows on your portfolio" PrivacyToggle checklist. **Don't add portfolio fields to `profileFields.js`** (raffle-entry math).
- **Video**: `VideoDisplay` now plays raw `.mp4/.webm/.mov` via native `<video>` (no iframe); `LiteVideoThumbnail` takes `posterUrl` and labels raw files "Video".
- **Privacy hook fix**: `use-privacy-settings.js` uses `why` (the old `why_are_you_here` key was a silent server-side no-op) + all new portfolio keys default private.
- **SEO plumbing**: `server-sitemap.xml.js` has a 4th block from `GET /api/users/portfolio/sitemap` → `/u/<slug>` locs; `/profile/[userid]`, `/u/[slug]`, `/cert/[cert_id]` are in next-sitemap excludes; `socialShare.js` DEFAULT_SITE_URL is `https://www.ohack.dev` (www — no redirect hop on shares).
- **`/cert/[cert_id]`** is ISR now (praise/[id] pattern: `fallback:true`, revalidate 3600, notFound on unknown id) and unfurls the signed cert PNG as og:image (`summary` card — cert PNGs are square). Body stays the client-rendered `CertInfoIndex`.
- **Onboarding ties**: `WebsiteTourSection` portfolio band, an IntroductionPrompt "Set up your portfolio" 3-step card, and an OnboardingFAQ "Is my profile public?" entry all describe the portfolio (private by default, `/profile#portfolio`, `ohack.dev/u/you`) — keep their claims in sync with the actual flows.

## Profile API cutover (Aug 2026 — legacy `_old` stack retirement)

The frontend now talks ONLY to the canonical profile endpoints; `/api/messages/profile*` is served by thin backend delegates pending deletion:

- **Own profile**: `GET/POST /api/users/profile` — FLAT response (no `{"text":…}` envelope), the full field set from the backend's `PROFILE_FIELD_SPECS` registry. `use-profile-api.js` SPREADS the payload into `profile` (`{...data, profile_url}`) — never reintroduce a hand-written field projection there (that's the "saves fine, renders blank" bug class; the backend round-trip test + this hook's spread make it structurally impossible now). `update_profile_metadata` keeps its historical `onComplete("Saved Profile Metadata")` string contract and refreshes `profile` state from the POST response. Deleted dead exports `get_user_by_id`/`get_user_profile_by_id`.
- **By-id**: `GET /api/users/<db_id>/profile` (flat, safe fields incl. `profile_slug`, no `github`) — used by TeamList/HackathonResults/GiveFeedback; the old `data.text || data` envelope dances were removed.
- **Helping toggle**: `POST /api/users/profile/helping` (same body: `{status, problem_statement_id, type, npo_id}`).
- GitHub history still uses `GET /api/messages/profile/github/<username>` (not part of the legacy `_old` family; unchanged).
- `profile.user_id` is now present on the hook's profile (spread) — `NonProfitListTile(.Refined)`'s `helping.slack_user === profile.user_id` highlight works again.
- `/myprofile` (dead mock page) and `src/components/MyProfile/*` were deleted.
- Hook tests: `src/hooks/__tests__/use-profile-api.test.js` (URLs + spread + onComplete contract; axios needs the factory mock — automock breaks on axios v1 interop; auth mock must return a STABLE user object or the bootstrap effect loops) and `use-public-profile.test.js`/`use-privacy-settings.test.js` were updated to the current contracts.

## Hearts & Rewards (Aug 2026 — profile tab 1 + navbar status)

The masthead `HeartGauge` panel (~900px tall) was replaced by a loyalty-program surface. Load-bearing contracts:

- **Tab 1 was renamed Impact → "Hearts"** (FavoriteIcon). Hash/index invariants hold: index 1 unchanged; `#hearts` is the **canonical** write hash (`tabHashMap`/`tabNames[1]='hearts'`), `#impact` stays in `hashTabMap` as a legacy read alias — never remove it. Tab LABELS may change; hashes/indices stay frozen (append only, next new tab = index 7).
- Tab 1 body = `src/components/Profile/Sections/HeartsRewardsTab.jsx` (props `{profile, isLoading, onOpenGiveaways}`): StatusHero (`--surface-2`, Fraunces hearts number, "Claim your rewards" → `/contact?type=claim_reward&hearts=N`, gated on any achieved reward — contact page depends on both params), NextTierProgress, BenefitsLadder (5 `TIERS` rows, tier color only as a small dot — no tinted backgrounds), HeartsBreakdown (per-category `history.what`/`history.how` rows via `HEART_CATEGORIES`), `HeartsExplainer`, footer links. Subcomponents are **module-scope** (SectionBlock remount lesson). No giveaway content here — just the `onOpenGiveaways` cross-link CTA (RaffleEntries lives only on tab 5).
- **Masthead strip**: `src/components/Profile/HeartsStatusStrip.jsx` replaced `<HeartGauge/>` at the masthead actions row — one-line button ("{Tier} · N hearts" + mini progress + "N to {next}") that jumps to tab 1 via `setActiveTab(1)` + shallow `router.push('/profile#hearts')` (NOT `handleTabChange` — avoids double GA fire). GA: `hearts_status_click` `{source: 'profile_masthead'|'navbar_menu', event_label: tier, hearts}`.
- **`src/lib/heartTiers.js` additions**: `HEART_CATEGORIES` (`{what:[[key,label,desc?]...], how:[...]}` — moved from FeedbackSection, which now imports it; keep in lockstep with backend history keys in `common/utils/firebase.py`) and `formatHearts()` (fractional 0.5-heart display). Use `countHeartsFromHistory` everywhere — never the old per-component `countHearts` (required both sections + console-spammed).
- **Navbar status**: `useHeartsSummary()` (`src/hooks/use-hearts-summary.js` — module-cached 60s TTL + in-flight promise dedupe, axios [Bearer via AxiosWrapper interceptor], client-effect gated on `isLoggedIn` so SSR/logged-out fire zero requests) feeds (a) a tier-colored 2px avatar ring (constant transparent border → tier color; zero box change) + MUI `Badge` heart dot (`invisible={!tier}`; heart glyph `#333` on Gold/Platinum/Diamond, white otherwise), and (b) `HeartsStatusMenuItem` as the first dropdown child (returns Link-wrapped MenuItem or `null` — never a Fragment; MUI Menu keyboard nav). The fixed-width auth slot + 64px bar are untouched (CWV invariant).
- **`ProfileCompletionPrompt` consumes `useHeartsSummary()` too** (not `useProfileApi`) — navbar + prompt share ONE `GET /api/users/profile` per page. Don't switch it back. `/profile` itself still runs its own `useProfileApi` (needs `update_profile_metadata`).
- **Orphaned, do not re-add**: `HeartGauge/HeartGauge.js` + `MilestoneProgress.js` (+ test) — the old gradient panel; orphaning also dropped the unconditional recharts import from /profile. `ShareableGitHubContributions` moved to the GitHub tab (index 2, gated on `github` being set).
