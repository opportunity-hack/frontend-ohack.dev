# Plan: `/hack/[event_id]/manageteam` + `/hack/[event_id]` improvements

> Handoff for implementation. Review findings verified against source on 2026-06-11.

## Context

- Refined design system spec: `docs/refined-design-system.md` + the "Refined design scope" section of `CLAUDE.md`. Pattern for migrating a page: keep `Head`/data fetching/schema verbatim, add `<RefinedFonts/>` to `next/head`, wrap body in `<RefinedRoot>` (it renders `<main>`), rebuild sections with `.ohx-*` classes (`.ohx-wrap`, `.ohx-card`, `.ohx-eyebrow`, `.ohx-btn--primary|--ghost`, `.ohx-tag`), one `<h1>`, one accent color, no gradients/rainbow chips.
- Reference implementations: `src/pages/hack/[event_id]/team/[team_id].js` (refined team page) and `src/components/Hackathon/HackathonHeader.js` (refined masthead).
- Shared status constants: `src/constants/teamStatus.js` (`TEAM_STATUS_OPTIONS`, `isWinningStatus`). Never render raw enum strings like `NONPROFIT_SELECTED`.

---

## Part A — `manageteam.js` bugs (fix first, highest priority)

### A1. SSR crash: unguarded `window.location.href`
`src/pages/hack/[event_id]/manageteam.js:1656` and `src/pages/hack/[event_id]/findteam.js:1684` are the only two pages in the repo using `postLoginRedirectUrl={currentUrl || window.location.href}` without a `typeof window` guard (every other auth page guards it — see `judge-application.js:2663`). During server render `currentUrl` is `null`, so `window.location.href` evaluates and throws. Fix both files to:
`currentUrl || (typeof window !== "undefined" ? window.location.href : undefined)`

### A2. Single shared `error` state nukes the team hub
The page has one `error` string used for: fetch failures (Slack users, profile, event, nonprofits), step-validation messages ("Team name is required"), and the duplicate-teammate message. It's also passed as the `error` prop to `TeamStatusPanel`, which early-returns an error Alert *instead of* the team hub (`src/components/TeamCreation/TeamStatusPanel.js:441`). Net effect: typing a duplicate teammate name in the create form replaces the user's entire team status panel with "Error Loading Team Information: This team member has already been added."

Fix: split into `teamsError` (only from `fetchMyTeams`, passed to `TeamStatusPanel`) and `formError` (validation + submit errors, shown only in the form Alert). Non-critical fetch failures (Slack users, profile prefill) should not surface as page-level errors at all — log and degrade (the member picker is `freeSolo`, it works without the Slack list).

### A3. Slack-user fetch is heavy and eager
`manageteam.js:184-217` fetches `/api/slack/users/active?active_days=10000` on mount for *every* visitor — that's the entire Slack workspace (thousands of users; backend Redis cache is only 10s, see `backend-ohack.dev/api/slack/slack_service.py`). Most visitors already have a team and never open the form.

Fix: fetch lazily — only when the user actually reaches the team-member step (step 2) or expands the create-team form — and drop `active_days` to something sane (e.g. 365). Don't `setError` on failure (per A2).

### A4. Nonprofit detail waterfall
`fetchNonprofitDetails` (`manageteam.js:301`) fires one request per nonprofit *plus one per problem statement* (easily 30–50 requests) on every page load, even for users who never open the create form. Defer until the form is shown / step 2 (Nonprofit Rankings) is reached. The data is only consumed by `NonprofitSelectionStep` and (read-only name lookup) `TeamStatusPanel` — for the latter, the assigned nonprofit's name can come from `event.nonprofits` (already in the event payload) instead of the detail fetches.

### A5. DevPost save doesn't update the UI
In `TeamStatusPanel.handleDevPostSubmit` (`TeamStatusPanel.js:315-317`) `updatedTeams` is computed and never used — the displayed `team.devpost_link` (and "Update Link" vs "Save Link" button label) stays stale until a full reload. Add an `onTeamUpdated(teamId, partial)` callback prop from the page (which owns `myTeams`) and call it after both DevPost and demo-video saves.

### A6. After team creation, refetch instead of demanding a manual reload
On submit success the page shows a bespoke success mega-panel with a "Refresh Status" button that does `window.location.reload()`. Instead: call `fetchMyTeams()` on success so `TeamStatusPanel` renders the IN_REVIEW state, and scroll to it. This also lets you delete the duplicated waiting-video/next-steps block (lines ~1330–1548) — `TeamStatusPanel` already has an IN_REVIEW waiting state with the same content.

### A7. Add `<meta name="robots" content="noindex" />`
Auth-gated page (the letters page sets this; manageteam/findteam don't).

### A8. Minor cleanups while in the file
- Remove unused `Collapse` import.
- Remove the manual `document.createElement('style')` keyframes injection (both in the page and in `TeamStatusPanel`) in favor of MUI `GlobalStyles` or styled keyframes.
- Remove `console.log`s of API payloads (profile, application data — they log PII to the console).
- The duplicate "Find Teammates" CTA block exists twice verbatim (lines ~1204–1254 and ~1269–1320) — extract one component.

## Part B — `manageteam.js` design conformance (refined rewrite)

This page is pre-refined-era: multi-gradient Papers, emoji headers, rainbow status colors, two competing waiting-video panels, `Typography variant="h3"` mid-page. Rewrite to the refined system, **keeping all logic/endpoints intact**:

1. **Chrome:** `<RefinedFonts/>` in Head, wrap in `<RefinedRoot>` + `.ohx-wrap`. Editorial masthead: eyebrow = event title (linked back to `/hack/[event_id]`), one `<h1>` — "Your team" (or "Create a team" when no team exists). Replace the "← Back to Hackathon" outlined button with a quiet `.ohx-link`.
2. **Think hacker-jobs-to-be-done.** A team at the event opens this page to answer: *what's my team's status, and what do I need to do next?* Lead with status, then actions:
   - **Team card** (per team): hairline `.ohx-card`, Fraunces team name, status as `.ohx-tag` using `TEAM_STATUS_OPTIONS` labels from `src/constants/teamStatus.js` (delete `TeamStatusPanel`'s private `getStatusLabel`/`getStatusIcon`/`getHeaderColor` duplicates; 🏆 prefix via `isWinningStatus`).
   - **"Next steps" checklist row** inside the card — the page's core value: Join Slack channel ✓/→, Submit DevPost ✓/→, Add demo video ✓/→, (if winning status) Complete the Definition-of-Done checklist →. Derive ✓ from `team.slack_channel`/`devpost_link`/`demo_video_url`. One primary CTA per state; everything else ghost buttons.
   - **Link to the refined team page** `/hack/[event_id]/team/[team_id]` — currently *nowhere on this page*. That page has the completion checklist, mentor panel, and shareable URL; add a "View public team page →" CTA on every team card.
   - DevPost + demo-video inputs stay (with `LiteVideoThumbnail` preview), in a calm framed section, not gradient boxes.
3. **IN_REVIEW state:** keep the message ("review typically takes 10–20 minutes, you'll be pinged in Slack") in a calm `--surface-2` card. The cat/dog waiting video may keep **one** small instance here (it's an OHack delight moment) inside a hairline frame at reduced width — but delete the second copy in the success panel (gone anyway per A6). No animated gradient bars.
4. **Gating panels** (no application / awaiting confirmation): keep copy and the dual-panel distinction (CLAUDE.md invariant: never render rejection copy for `isSelected === false`), restyle from gradient Papers to refined cards. Keep `findteam.js` copy in sync per CLAUDE.md.
5. **Create-team stepper:** keep `Stepper` logic and the four step components as-is functionally; restyle container to `.ohx-card`, navy primary button, drop `AnimatedButton` hover-lift and the fake `simulateProgress` gradient — a simple indeterminate `LinearProgress` with honest copy ("Creating your Slack channel and GitHub repo — this takes up to a minute") is clearer than a 28-second simulated bar.
6. **Multiple-teams warning** stays but as one compact Alert, not the current shouty block.

## Part C — `/hack/[event_id].js` bugs

### C1. `getStaticProps` caches failures as a permanent spinner
`[event_id].js:1563-1587` doesn't check `res.ok` and returns `eventData: null` on any error, which renders an infinite `CircularProgress` and gets ISR-cached for 60s; bogus event IDs cache backend error JSON as `eventData`. Apply the contract already used by the team page (CLAUDE.md invariant 8): check `res.ok`, return `{ notFound: true, revalidate: 60 }` on genuine 404, **rethrow** on network/5xx errors so ISR keeps serving the last good version. Then the `!event` branch can become a proper "Event not found" state instead of an eternal spinner.

### C2. Prop mutation in render
`event.teams?.sort(...)` at line 1216 sorts the props array in place. Copy first: `[...(event.teams || [])].sort(...)`, ideally in a `useMemo`.

### C3. Schema bug
`subEvent[].startDate` uses `eventStartDate`, a locale-formatted string ("6/11/2026") — invalid for schema.org dates. Use `event.start_date` (ISO) like the parent Event node does.

### C4. `og:updated_time` is `new Date().toISOString()`
Lies (changes every regeneration) and causes hydration-mismatch noise. Remove it or use a real last-updated field.

### C5. Stale loading placeholder
The `HackathonHeader` dynamic-import fallback (lines 32–41) still shows the old green gradient (`#84fab0 → #8fd3f4`) — a visible flash that clashes with the refined masthead. Replace with a flat `var(--surface-2, #f5f2ea)` block of the same `minHeight`.

### C6. Expired-event copy
`metaDescription` always says "Apply as a hacker… Register now!" and structured data always `EventScheduled`. When `hackathonExpired`, switch description to results-oriented copy and consider omitting the application `subEvent`s/`alternate` links.

### C7. Perf inside `TeamList` (rendered on this page)
- `fetchTeamMemberProfiles` (`src/components/Hackathon/TeamList.js:1376`) fires one `/api/messages/profile/<id>` request per unique member across all teams — an N+1 of ~100+ requests for a 30-team event, for every logged-in visitor. Short-term frontend fix: only fetch profiles for teams whose card is expanded/visible (LazyMount/IntersectionObserver pattern from `PreviousHackathonList`). Proper fix (backend, separate task): enrich `get_teams_list()` the same way `get_team` already enriches `users[]` (batched Firestore `get_all`, cached) — note backend `messages_*` files are frozen; enrichment lives in `services/teams_service.py`, which is fine.
- `GitHubStats` fetches repo stats per team card on mount when logged in — same treatment: fetch on card visibility/expand.
- Remove render-path `console.log`s (`"GitHub stats data:"`, `"User profile:"`) per the CLAUDE.md TeamManagement rule.

### C8. Small cleanups
- The visually-hidden heading `sx` blob is duplicated 8× — use the already-defined `VisuallyHidden` styled component (or extract a tiny `<HiddenHeading>`).
- Remove `console.log("Fetched hackathons:", ...)` from `getStaticPaths`.
- `VolunteerList` ×4 each fetch their own endpoint — acceptable (distinct endpoints), leave alone.

## Part D — Verification

1. `npm run dev`; verify `/hack/<live_event_id>` and `/hack/<live_event_id>/manageteam` render server-side without errors (curl the manageteam URL logged-out — should redirect to login, not 500).
2. Manageteam logged-in: team hub renders; type a duplicate teammate name → team hub must NOT disappear; save a DevPost link → link/preview updates without reload; create-team flow end-to-end → lands on IN_REVIEW state without manual refresh.
3. Network tab on both pages: manageteam initial load should make ~3 requests (event, teams/me, application) — no Slack-users or nonprofit-detail calls until the form is opened; event page should not fan out profile/GitHub requests for off-screen team cards.
4. Remember the Next 16 dev-cache gotcha from CLAUDE.md: disable cache via CDP when visually verifying — a plain reload serves stale chunks.
5. ESLint + Prettier on touched files. No test-writing needed per CLAUDE.md.

## Out of scope (separate tasks)

- Backend `get_teams_list()` enrichment (C7 proper fix).
- `findteam.js` gets only the A1 SSR-guard fix here — its own refined facelift should mirror this one later.
- After completing the work, update `CLAUDE.md` with a succinct entry for the manageteam refined migration (add it to the migrated-pages list) and any new invariants (split error states, lazy Slack/nonprofit fetches, `onTeamUpdated` contract).
