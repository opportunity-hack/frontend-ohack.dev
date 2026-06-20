# OHack Frontend Development Guidelines

## Refined design system

Full spec + rollout checklist: **`docs/refined-design-system.md`**. Pattern for new pages: keep `Head`/`getStaticProps`/schema verbatim, add `<RefinedFonts/>`, wrap body in `<RefinedRoot>`, rebuild sections with `.ohx-*` classes, one `<h1>`, preserve GA.

**Migrated pages:** `/`, `/projects`, NavBar (global), `/about`, `/about/judges`, `/about/mentors`, `/about/success-stories`, `/about/completion`, `/sponsor`, `/nonprofits`, `/blog`, `/onboarding`, `/signup`, `/volunteer`, `/about/hackers`, `/about/process`, `/praise`, `/hack/code-of-conduct`, `/profile/[userid]` (public), `/profile` (chrome only), `/myfeedback`, `/feedback/[userid]`, `/hack/[event_id]/manageteam`, `/hack/[event_id]/team/[team_id]`, `/hack` index (harmonized), `/hack/[event_id]` (full rewrite), `/hack/request`, `/office-hours`.

**Design tokens** (`src/components/design/refined.js`):
- `<RefinedRoot>` — `styled('main')` with CSS vars: `--brand #1B3A6B` (navy), `--accent #E2552E` (terracotta), `--display` Fraunces, `--body` Hanken Grotesk. Classes: `.ohx-wrap`, `.ohx-display`, `.ohx-eyebrow`, `.ohx-lead`, `.ohx-btn(--primary|--ghost)`, `.ohx-link`, `.ohx-card(--hover)`, `.ohx-tag(--accent)`, `.rise`. Scoped — does NOT touch global MUI theme.
- `<RefinedFonts />` — Google Fonts links (Fraunces + Hanken Grotesk); drop into each page's `next/head`.
- Rule: one accent color, hairline rules, generous whitespace, ONE primary CTA per section. No colored chips/gradients.

**Global NavBar** (`src/components/Navbar/Navbar.js`): frosted light bar — `rgba(251,250,246,0.82)` + blur + `#E7E1D4` border, `elevation={0}`. Logo: `OpportunityHack_Logo_Dark_Blue_Banner.png`. Links sentence-case (`textTransform: none`). SSR/64px-height/fixed-width-auth-slot (`minWidth: { xs: 56, md: 140 }`) invariants must not change (CWV). Nav link font uses Hanken-Grotesk stack; webfont only loads on refined pages (intentional — avoids global font load).

**`/hack/[event_id]/team/[team_id]` invariants:**
1. Status labels via `statusLabel()` from `TEAM_STATUS_OPTIONS` — never render raw enum strings like `NONPROFIT_SELECTED`. Winning statuses get 🏆 prefix via `getWinningStatus()`. `INACTIVE` skips status tag.
2. `SectionBlock` is **module-scope** — defining inside component causes IntersectionObserver remount storm on every `setActiveId` tick, wiping mentor note drafts and reloading demo iframe. Pass `copiedId`/`onCopyLink` as props.
3. Use `parseLocalDate` from `src/lib/dateUtils.js` for all event window checks (`eventHasStarted`, `eventEnded`).
4. Membership: `useTeamMembership(eventId, teamId)` from `src/hooks/use-team-membership.js` — shared, no duplicate fetch.
5. Never render `selected_nonprofit_id` text — only show when `nonprofitData.name` is available; `getStaticProps` fetches `{ name, description }`.
6. `awards[]` → `ohx-tag--accent` chips. `github_links[]` handles both string and `{link,name}` shapes.
7. `getStaticProps` rethrows network errors (ISR keeps last good version); `notFound` only on genuine 404.

**`/hack/request` rules:** student-first (default org-type = university); budget slider min `$0`, never blocks submit; donation-% ask is corporate-only (forced to 0 at submit otherwise); `formData` keys are preserved (backend + `HackathonRequestDetailDialog` + edit page depend on them). Step nav uses `scrollIntoView` on `formTopRef` (`scrollMarginTop:88`), NOT `window.scrollTo(0,0)`.

**`TeamList` on event page:** profile avatars load lazily per-card via IntersectionObserver (`rootMargin: "200px"`, tracked by `fetchedTeamProfilesRef` Set). Do NOT restore eager `fetchTeamMemberProfiles(teams)` on mount — fires N parallel requests for 30+ cards.

**Backend enrichment:** `get_single_hackathon_event` enriches `users[]` to `{id, user_id, name, nickname, profile_image}` via batched `db.get_all`. `HackathonResults.js`/`TeamList.js` handle both old id-string and new object shapes. List endpoint is NOT enriched — only single-event getter.

**Next dev gotcha:** Next 16 dev chunks are NOT content-hashed. Disable cache via CDP (`Network.setCacheDisabled` + `clearBrowserCache`) to verify changes visually — plain reload keeps old bundle.

## Commands

- `npm run dev` / `npm run build` / `npm run start` / `npm run postbuild` (sitemap)
- `npm run test` / `npm run test:e2e`
- `npx eslint src/**/*.js` / `npx prettier --write src/**/*.js`

## Code Style & Structure

Functional components + hooks, MUI for UI, async/await, camelCase names. Imports: React → Next.js → libraries → local. Node v22, Next.js 16. Structure: `/src/pages` routes, `/src/components` reusable, `/src/lib` utilities, `/public` static.

## Admin layout width

`AdminPageContainer` (`src/components/admin/AdminPage.js`) is a plain `Box` with `width: 100%`, `maxWidth: none` — never switch to MUI `Container` (reintroduces 1400px desktop cap). `SectionContainer` (`src/components/admin/hackathon-edit/SectionContainer.js`) provides consistent section width via `width: 100%; boxSizing: border-box`. Heavy sections use `<SectionContainer disableGutters>` + inner `Box sx={{ p: { xs:2, md:3 } }}`.

**Width clipping layers (all 6 required — removing any shifts the admin layout sideways):**
1. `AdminPage` root `<Box>`: `overflowX: hidden` + `maxWidth: 100%`
2. `AdminPageContainer`: `overflowX: hidden` + `minWidth: 0`
3. `AdminPageContent`: `overflowX: hidden` + `width/maxWidth: 100%; minWidth: 0; boxSizing: border-box`
4. `HackathonAdminLayout` root flex: `overflow: hidden`
5. `HackathonAdminLayout` content scroll box: `overflowX: hidden; minWidth: 0; scrollbarGutter: stable; overflowY: auto`
6. `SectionContainer` Paper: `width: 100%; maxWidth: 100%; minWidth: 0; boxSizing: border-box`

## Core Web Vitals (CLS hygiene)

- **`AxiosWrapper` in `_app.js` MUST be a plain static import** — `dynamic(ssr:false)` there disables SSR for the entire app tree (June 2026 incident: empty `<body>`, empty titles, CWV collapse).
- `NavBar` and `Footer` are `ssr: true`; placeholders match rendered heights (NavBar 64px, Footer 760px/560px).
- NavBar auth slot: fixed `minWidth: { xs: 56, md: 140 }` — both branches must match width.
- `HeartsLeaderboard` reserves `minHeight: { xs: 128, md: 172 }` — never return `null`.
- Above-the-fold async components must reserve space via `minHeight` in loading fallback.
- `<img>` needs `width`/`height`. Prefer `next/image`. Iframes: `paddingBottom: '56.25%'` + `height:0` + absolutely-positioned iframe.
- Use `initFacebookPixel` from `src/lib/ga/index.js` (idempotent via `pixelInitPromise`). Never call `ReactPixel.init` directly.

## Admin Profile Search (`/admin/profile`)

`src/pages/admin/profile/index.js`. Backend `GET /api/messages/admin/profiles` → client-side filter (~14 fields, ~3.5k profiles). Auth: `userClass.hasPermission("profile.admin")`. Payload: `_ADMIN_PROFILE_LEAN_FIELDS` (5-min TTL cache). Adding a field: update both `_ADMIN_PROFILE_LEAN_FIELDS` AND restart to clear cache.

- **`?q=<term>` is canonical search state** — Chrome `ohadmin` shortcut destination (`https://www.ohack.dev/admin/profile?q=%s`). Never strip query params via `router.replace`.
- Quick actions link to `/profile/{user.id}` — Firestore `id`, NOT `user_id`. Volunteer deep link: `/admin/volunteer?filter=<email>`.
- Scale guard: `useDeferredValue` + render-capped at `INITIAL_VISIBLE_ROWS` (100). Never render full list unconditionally (each row has ~6 Tooltips + Avatar + LinearProgress + 5 IconButtons).
- URL ↔ input sync: hydrate once with `initFromUrlRef`, `lastUrlQRef` echo guard for back/forward, debounced `router.replace({ shallow: true, scroll: false })`.

## Admin Email Compose

- `fixedSubject` prop makes Subject read-only.
- `ContactSubmissionDetailDialog` subject: `Contact Us: {inquiry_type_display.lower()} - Opportunity Hack`. `INQUIRY_TYPE_DISPLAY` in `ContactSubmissionDetailDialog.js` must stay in sync with backend `contact_service.py`.

## Admin Communication + Email Templates

`/admin/communication` (`src/pages/admin/communication/index.js`) tabs: `?tab=templates|social`. Never add early returns above hooks (fixes a prior Rules-of-Hooks violation).

**Email templates:** Firestore `email_templates` collection + append-only `versions` subcollection. Backend: `api/email_templates/email_templates_views.py` (NOT messages_views — frozen). Routes: `GET/POST/PATCH/DELETE /api/admin/templates`, `GET <id>/versions`, `POST <id>/revert`, `POST seed` — all `volunteer.admin`-gated. Revert copies content forward as new version (never rewrites history). Auto-seeds from `email_templates_seed.py` on first list call; `POST seed` re-inserts missing only.

- `MESSAGE_TEMPLATES` in `messageTemplates.js` is fallback + seed source only — DB is live source of truth after seeding.
- `useEmailTemplates({accessToken, orgId, enabled})` — 60s module-level cache (prevents per-row refetch storms in volunteer dialogs). `refresh(true)` busts cache.
- Auto-replaced placeholders: `[EVENT_ID]`, `[VOLUNTEER_ID]`, `[VOLUNTEER_TYPE]`. Other `[UPPERCASE]` prompts the sender via `detectPlaceholders`/`PLACEHOLDER_LABELS`.
- `BatchEmailService.sendBatchEmails()` uses bounded pool (`MAX_PARALLEL_SENDS = 8`). Keep per-user failures as structured `{ user, success, error }` — don't collapse to summary-only.

## Social Media

`/admin/social-media` → redirect to `/admin/communication?tab=social`. Architecture: abstract `SocialMediaService` base class in `src/lib/social-media/`. Threads: fully implemented. Twitter/LinkedIn: placeholders.

Env vars: `THREADS_ACCESS_TOKEN`, `THREADS_USER_ID`, `THREADS_USERNAME=opportunityhack`.

To add a platform: extend `SocialMediaService`, register in `SocialMediaManager.createFromEnvironment()`, update `SUPPORTED_PLATFORMS` in `src/lib/social-media/index.js`.

## Volunteer Letter Generator (`/hack/[event_id]/letters`)

Files: `src/pages/hack/[event_id]/letters.js` + `src/components/Letters/` (`letterConfig.js`, `LetterChecklist.js`, `LetterPreview.js`).

- **OPT letter ONLY when** Q3=initial post-completion OPT AND all 4 Q4 acks checked. STEM extension → General. "not sure" → advisory + General. Mentor/judge branches never reach OPT.
- Every letter carries guardrail bullets (volunteer not employee; no compensation; no visa sponsorship; no immigration advice/certification). Never add immigration/legal certifications.
- Submission: `POST /api/contact` with `inquiryType: "volunteer_letter"`. Shareable `?d=<base64>` link for reviewer.
- Print: `@media print` visibility trick (only `#letter-print-root` shows) + `@page { size: Letter; margin: 1in }`. Page is `noindex`.

## Application Forms

Shared scaffolding in `src/components/ApplicationForm/`: `PronounsPicker` (comma-joined string), `OHackParticipationSelect`, `ProfileAutofillNotice`, `MealMenu`. Primary copy: `body1`; helper text: `body2`.

**Hacker form teamCode:** "Find your team" sources `teamCode` from existing hacker volunteer docs, NOT teams collection. Deduped case-insensitively into `eventTeams: [{ code, count }]`. `TeamBrowser` renders by `t.code`/`t.count`.

**Country/state/AZ residency:** Country = `Autocomplete` (`COUNTRY_OPTIONS`); State = `Select` (US only) or free-text; County (`ARIZONA_COUNTY_OPTIONS`) = AZ+US only. `arizonaResident` is **derived at submit time** — no user-facing dropdown. All option arrays are module-scope constants (not inline — Autocomplete memoization depends on identity stability).

## Hackathon Event Photos & Social Posts

Top-level fields on hackathon doc (NOT under `constraints`): `event_photos: [{ url, caption?, credit?, sort_order? }]`, `social_posts: [{ platform: "linkedin"|"instagram"|"threads"|"article", url, caption? }]`. Admin: `EventMediaManagement` component.

Public: `/hack/[event_id]/media` (full carousel + embeds), `/hack/[event_id]` (3-thumbnail teaser), `/hack/[event_id]/upload` (redirect stub). `cdn.ohack.dev` in `next.config.js` `images.remotePatterns`.

## Planning Card Budget Editor

`PlanningCardDialog` inline editor: amount USD, bucket (food/prize/swag), state (estimated/committed/paid), vendor. Keep in sync with backend `model/planning.py` (`ALLOWED_BUDGET_BUCKETS`, `ALLOWED_BUDGET_STATES`, `MAX_BUDGET_CENTS`). Clear with `{ budget: null }`.

## Hackathon Admin Edit (`/admin/hackathons/[event_id]`)

Sections via `?section=overview|schedule|meals|participants|judges|nonprofits|media|planning|donations|links|volunteer|teams|judging|checkin`. Sidebar groups: `"config"` vs `"ops"` in `sectionsManifest.js`.

Old standalone routes (`/admin/volunteer`, `/admin/teams`, `/admin/judging`, `/admin/check-in`) are redirect stubs → `/admin/hackathons/<event_id>?section=<slug>`.

Workbenches accept `{ userClass, embedded, externalEventId, onSnack }`. `embedded=true` skips `AdminPage` chrome and trusts `externalEventId`. Sub-tab state: `?subtab=management|assignments|stats` (Teams) / `round1|round2|results` (Judging).

**`useHackathonAdmin.js`:**
- Autosave (1.5s debounce): low-risk keys.
- Explicit save: `overview-dates`, `schedule`, `meals`, `screening`, `deposit` — pauses autosave while dirty.
- **Token-rotation stability:** read token/orgId via refs (`accessTokenRef`/`orgIdRef`). Load effect keyed on `!!accessToken` not raw value — raw token triggers reload on tab refocus, clobbering unsaved edits. Blocking spinner gates on `admin.loading && !admin.hackathon` to keep layout mounted during refetches.

**Top-level optional fields must be allowlisted in `save_hackathon` passthrough loop** (`backend-ohack.dev/services/hackathons_service.py`) — otherwise silently dropped. Current passthrough keys: `github_org`, `mentor_slack_channel`.

**To add a section:** append to `sectionsManifest.js` + create `<Slug>Section.js` + add to `sectionLoaders` in `[event_id].js`. Each section receives `{ admin, accessToken, orgId, onSnack }`.

### Meals & Schedule

Meals: `@hello-pangea/dnd` drag-reorder, `DateTimePicker` constrained to event window, "Clone" per slot. `ALLOWED_DIETARY_TAGS` in `MealsSection.js` — keep in sync with backend `validators.py`. Schedule: day-grouped timeline, "Quick add" presets, single timezone selector.

**Vendor catalog** (`src/components/admin/hackathon-edit/catalog/`): `fatFreddysCatalog.js`, `catalogStorage.js` (localStorage `ohack_admin_menu_catalog_v1`), `MenuCatalogPicker.js`, `formatCurrency.js`. Cost fields on hackathon doc: `constraints.meals_estimated_headcount` (default 50), `meal.headcount_override`, `meal.items[i].{ price_cents, unit, quantity, vendor, catalog_item_id }`.

## Hackathon Per-Event Config (`constraints`)

- `judge_venue_arrival_time` (HH:MM) — judge form availability step.
- `hacker_deposit: { enabled, default_amount_cents }` — triggers Stripe deposit flow.
- `meals: [{ id, name, time, catering_provided, dietary_tags, items[] }]` — hacker form `MealMenu`.

## Hacker Stripe Deposit Flow

- Checkout: `POST /api/applications/hacker-deposit/checkout` → Stripe session; success URL `?deposit_session_id=...`.
- Session: `GET /api/applications/hacker-deposit/session` → `{ payment_status, payment_intent_id, amount_total, metadata }`.
- Form auto-saves to localStorage. On return: reads session, jumps to Review, submits with `stripe_payment_intent_id`, `deposit_amount_cents`, `deposit_disposition` ("refund"|"donate").
- Admin refund: `POST /api/admin/hacker/<volunteer_id>/refund-deposit` (auth: `volunteer.admin`). Stripe fires BEFORE Firestore mutation. Fields written: `deposit_status`, `deposit_refund_id`, `deposit_refund_amount_cents`, `deposit_refunded_at`, `deposit_refunded_by`.
- Admin UI: `HackerDepositChip.js`, `HackerDepositRefundDialog.js`, `HackerDepositBulkRefundDialog.js`.
- Bulk refund: `POST /api/admin/hackathon/<event_id>/refund-eligible-deposits`. Eligible = `deposit_status=paid AND deposit_disposition=refund` only.
- **Two distinct webhook secrets:** `STRIPE_STORE_WEBHOOK_SECRET` (frontend `/api/store/webhook.js`) vs `STRIPE_HACKER_DEPOSIT_WEBHOOK_SECRET` (backend). Never share — each Stripe endpoint has its own signing secret.
- Webhook: `POST /api/webhooks/stripe/hacker-deposit`. Events: `checkout.session.completed`, `charge.refunded`. Both idempotent.

## manageteam.js invariants

- **Split error state:** `teamsError` (from `fetchMyTeams`) → `TeamStatusPanel` only; `formError` (from validation/submit) only. Never merge — `teamsError` showing causes TeamStatusPanel to display error card, hiding team hub.
- **Lazy fetches:** Slack (`active_days=365`) + nonprofit only when `activeStep >= 1` OR `showNewTeamForm`, guarded by `slackFetchedRef`/`nonprofitFetchedRef`. Never fetch on initial load.
- **`onTeamUpdated` contract:** parent passes `useCallback((teamId, partial) => setMyTeams(prev => prev.map(t => t.id === teamId ? {...t, ...partial} : t)), [])` to `TeamStatusPanel` — updates without full re-fetch.
- **Post-submit:** `fetchMyTeams()` then scroll to `#team-hub`.
- **SSR guard:** `currentUrl || (typeof window !== "undefined" ? window.location.href : undefined)`.

## Hacker `isSelected` Gating UX

`isSelected === false` is ambiguous (under review OR rejected). Never render rejection copy. Both `findteam.js` and `manageteam.js`:
- `!application` → "Apply first" panel with submit CTA.
- `application && isSelected === false` → "Awaiting confirmation" panel (~1-week review info, Slack/projects CTAs).

Do not call `setError(...)` for these states — the dedicated panels handle it.

### Team creation — `teamMembers` is a mixed string/object array

`freeSolo` Autocomplete → `teamMembers` contains Slack objects `{id, name, real_name, tz}` AND free-text name strings. Every consumer must handle both:
- **Frontend:** `typeof member === 'string' ? member : (member.real_name || member.name || '')`
- **Backend** (`queue_team`): `isinstance(member, dict)` then `member.get("id")` — never `"id" in member` (substring test on strings; "Sidney"/"David" match and raise `TypeError`). Only Slack-id objects get invited/linked; free-text is informational only. Build full OAuth id with `normalize_slack_user_id()` from `common/utils/oauth_providers.py`.

## Mentor + Judge Confirmation Email

`send_volunteer_confirmation_email()` adds `[Pending Review]` prefix + yellow pending banner for `volunteer_type in ("mentor","judge")`. Hacker confirmations use "received" framing (no staff review).

## Hackathon Results & Funnel

- Per-event: `/hack/[event_id]/results` — `HackathonResults` + `HackathonFunnel`.
- Funnel data: `hackathons/{doc_id}/funnel/summary` subcollection (counts only, no PII). Winning/founding-engineer counts computed live from teams.
- `GET /api/messages/hackathon/{event_id}/funnel` (5-min TTL, public). Aggregate: `GET /api/messages/hackathons/funnel/aggregate` (10-min cache).
- Backfill script: `backend-ohack.dev/scripts/backfill_devpost_funnel.py` (dry-run by default, idempotent with `--apply`).

## Team Demo Videos

`demo_video_url` + `demo_video_url_submitted` on Firestore teams doc. Providers: YouTube, Vimeo, Loom, Google Drive.

- Self-serve: `POST /api/team/<teamid>/demo-video`. Admin: `PATCH /api/team/edit`.
- `TeamList.js`: `<LiteVideoThumbnail>` per card (lazy `<img>` thumbnail, NOT iframe per card — 30+ iframes ≈ 45MB) → page-level `<Dialog>`. Winners on results page use inline `<VideoDisplay loading="lazy">` (only 3-5 cards).
- `LiteVideoThumbnail` (`src/components/VideoDisplay/LiteVideoThumbnail.js`): YouTube hqdefault thumb or generic dark tile. Never fetch Vimeo oEmbed per render. Always explicit `width`/`height`.

## Team Completion Checklist (winning teams)

`src/components/Teams/TeamCompletionChecklist.js`. Visible to teams with `isWinningStatus(team.status)` OR `DEPLOYED`/`NONPROFIT_SIGNOFF`. 8-item **permanent** checklist (backend 409s on re-check). Routes: `POST /api/team/<teamid>/completion/toggle` + `POST /api/team/<teamid>/completion/complete` (Slacks team + 6 admins from `TEAM_COMPLETION_SLACK_ADMINS`).

Item slugs **must stay in lockstep** frontend ↔ backend: `deployed`, `nonprofit_signoff`, `login_details`, `code_updated`, `tasks_closed`, `sensitive_info_security`, `documentation`, `open_source`.

Identity: `GET /api/team/<event_id>/me` (not client-side — public payload omits `propel_id` PII). `user_is_on_team()` translates propel UUID → OAuth `user_id` via `get_propel_user_details_by_id`, with `propel_id` direct-match fallback.

## Mentor Team Panel

`src/components/Teams/MentorTeamPanel.js`. Four sections: Open concerns (flags + take-over), Coverage (6-item), Judging readiness (5-criterion: Scope/Documentation/Polish/Security/Accessibility), Notes feed. Mobile: `<Accordion>`s; desktop: all inline.

Coverage item slugs **in lockstep** with backend `MENTOR_COVERAGE_ITEMS`: `intro_made`, `scope_reviewed`, `architecture_discussed`, `repo_health_checked`, `criteria_walkthrough`, `demo_devpost_reviewed`.

- Auth gate: `user_is_mentor_for_event()` — volunteer doc with `volunteer_type='mentor'`, `isSelected=True`. Frontend: `GET /api/volunteer/<event_id>/me?type=mentor`. `eventId={null}` skips fetch (used by `MentorTeamPanelDemo.js`).
- Slack: only flag-raises, flag-resolutions, first "all 6 covered" milestone broadcast. All other actions are audit-only.
- Live updates: refetch on `document.visibilitychange`. No polling.
- Denormalized team fields (kept in sync by every write, read by leaderboard directly): `mentor_last_touched_at`, `mentor_last_touched_by_name`, `mentor_open_flag_count`, `mentor_coverage_completed_at`, `mentor_coverage_completed_by_name`.
- Hackathon field `mentor_slack_channel` (max 80 chars) — backend routing config, frontend never reads it.

## Admin Teams (`TeamManagement.js`)

`src/components/admin/TeamManagement.js` (~2900 lines). Key patterns:

- `patchTeam(partial)` helper — always include `id`. Used by edit Dialog + `TeamFieldPopover` (inline quick-edit Popover with `LiteVideoThumbnail` preview).
- Filter chips: All / Winning / In review / Active / Missing DevPost / Missing Video.
- Team approval: `POST /api/team/approve` with `{teamId, nonprofitId}` — carries `selected_nonprofit_id`, no separate Save needed. CTA in Nonprofit Assignment tab (NOT Communication tab).
- Nonprofit tab: always render dropdown even when `nonprofit_rankings` missing. Falls back to all nonprofits when hackathon-scoped list is empty.
- Batch GitHub fetches: always `Promise.all` → single `setState`. Never `setState` in a `forEach` loop over teams/repos.
- No `console.log` in render body — fires on every render.

## /hack Index Page Architecture

Order: hero → upcoming events → story strip → archive → "About these events" → Sponsor CTA. Hero: single `<h1>Hackathons for nonprofits</h1>` + two CTAs. No marketing copy or news between hero and events.

**Section IDs (load-bearing for `HackPageNav`):**
- `#upcoming-events`, `#since-2013`, `#previous-events`, `#about-events`, `#year-{yyyy}` — all carry `scrollMarginTop: 100`.

`HackPageNav` (`src/components/HackathonList/HackPageNav.js`): fixed floating TOC, hidden until hero scrolls past. Edit `SECTIONS` array to update. News block: `compact={true}` mode only — not in full `/hack` render.

## Story Strip + Year-Grouped Archive

`HackathonStoryStrip`: year jump via CustomEvent `'ohack:archive-jump-year'` (NOT URL hash — would collide with deep-links). Reserves `minHeight: { xs: 420, md: 240 }`. Skeleton tiles while loading. Single `<h2>` — page h1 is the only h1.

`PreviousHackathonList`: year-grouped, **no pagination**. `YearRail` sticky nav — `activeYear` is **click-driven only** (scroll-driven fought smooth-scroll race conditions). `PastEventCard`: 16:9 image from `event_photos[0]` or `GradientFallback` (year→HSL hue `((year-2013)*37)%360`). `event.image_url` NOT used as fallback (generic OHack logo). `ImpactMetrics` fetch gated by `LazyMount` (IntersectionObserver `rootMargin: '300px'`). Grid: `xs:12, sm:6, md:4, lg:3`.

## SEO

- **Canonical host: `https://www.ohack.dev/`** — never bare `ohack.dev`. All canonical, og:url, and structured data URLs.
- `/server-sitemap.xml` (`src/pages/server-sitemap.xml.js`) for dynamic routes. 1-hour CDN cache (`s-maxage=3600`).
- `/hack/[event_id]` canonical slug: `event?.event_id || event_id` (not raw `params.event_id`).
- Soft-404: backend returns `200 + {}` for unknown IDs — guard `if (!data || !data.id) return { notFound: true }`.
- Legacy event slug 301s in `next.config.js`: `season-YYYY → YYYY_season` (≤ 2025 events only).
- Pillar pages: `/coding-for-nonprofits`, `/hackathon-for-social-good`, `/hackathons/arizona` (`src/pages/hackathons/arizona/index.js`). Pattern: `getStaticProps` with `openGraphData` + `structuredData` arrays, `initFacebookPixel` in useEffect.

## Gotchas

### PropelAuth permissions — `userClass`, NOT `orgHelper`

`orgHelper.getOrgs()` returns plain objects with NO `.hasPermission()` — silently returns `false` inside try/catch. Use:
```js
const { userClass } = useAuthInfo();
const isAdmin = userClass?.getOrgByName("Opportunity Hack Org")?.hasPermission("volunteer.admin");
```
`orgHelper` is fine for `orgId` header (`orgHelper?.getOrgs()?.[0]?.orgId`) only.

### Public profile route: `/profile/{db_id}` (Firestore doc id, NOT propel_id)

Backend list views must include both `user_id` (propel, for matching) AND `db_id` (for profile links). Cannot use `propel_user_id` directly in profile URLs.

### MUI TextField in custom theme + Portal

Pin colors in any `TextField` inside a `Dialog` when page uses non-global theme override:
```js
sx={{ "& .MuiInputBase-root": { bgcolor: "background.paper", color: "text.primary" },
      "& textarea, & input": { color: "text.primary" } }}
```

### Stale selected-item snapshots vs. polled list state

Derive live record from polled state: `const liveItem = state.items.find(i => i.id === selectedItem.id) || selectedItem`. Render Dialog from `liveItem`, not the click-time snapshot. Otherwise stale fields + 412 on every PATCH after first.

### Vertical padding for control rows

Use `py: 2.25` + `minHeight: 64` for header-style bars with chips/buttons. `py: 1` is too tight (cramped against NavBar).

### Shareable dialog state

On open: `router.replace({ ...router.query, card: item.id }, undefined, { shallow: true })`. On close: remove `card` param. Auto-open on mount: `router.query.card` → find item → `handleOpen` via `openedRef`. For social unfurls: separate SSR route (`src/pages/hack/[event_id]/plan/c/[card_id].js`) with `getServerSideProps` emitting per-item OG tags.

### Don't repeat warnings on a surface

One compact notice at the top. Subtle inline hints (placeholder text, helper text) elsewhere. Full MUI `Alert` only for actionable state changes.

### Local theme provider for scoped dark mode

Global theme is light-only. For feature-specific dark mode, wrap in local `ThemeProvider` + persist preference in localStorage. See `src/components/Planning/PlanningThemeProvider.js`.
