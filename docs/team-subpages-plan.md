# Plan: Split Mentor Support & Definition of Done into dedicated team sub-pages

**For execution by Sonnet 4.6.** Read this whole document first, then work top-to-bottom. Every code reference below was verified against the current tree.

## Goal

The team detail page `/hack/[event_id]/team/[team_id]` currently renders two large, vertically-heavy panels inline:

1. **Mentor support** (`MentorTeamPanel`) — flags, coverage checklist, judging rubric, notes feed.
2. **Definition of Done** (`TeamCompletionChecklist`) — 8-item completion checklist + celebration.

Move each to its own route, and replace the inline panel on the main team page with a **compact, high-level summary card** that links to the new page (mirroring the at-a-glance "Mentor support" card already shown on the event teams listing, e.g. `/hack/2025_summer#teams`).

New routes:

- `/hack/[event_id]/team/[team_id]/mentor` — full Mentor support panel
- `/hack/[event_id]/team/[team_id]/completion` — full Definition of Done

Every page (the two new ones **and** the main team page) gets a **breadcrumb trail** at the top: `Home › {Event} › {Team} › {Sub-page}`.

## UX rationale (senior-engineer intent — honor these)

- **The main team page should read like an overview.** Status, links, members, nonprofit, and *small* status cards for mentor support + completion. A visitor sees everything at a glance and drills in only when they want the working surface.
- **The summary cards are status, not chrome.** Each shows real progress (coverage X/6, completion X/8, open-flag count, last mentor touch, "Project complete" badge) so the card is useful even before you click. If there is genuinely nothing to show (no mentor activity yet), degrade to a quiet "no activity yet" line — never an empty box.
- **Breadcrumbs are the spine.** They make the three pages feel like one place and give an obvious way back up. Use real links (not just a single "← back"), and keep the trail identical in order across all three pages.
- **Deep links keep working.** The current page exposes `#mentor-support` and `#completion` anchors via the sticky TOC. Keep those anchors pointing at the new *summary cards* so existing links don't break, and add explicit "Open full view →" affordances.
- **No regressions to the heavy panels.** `MentorTeamPanel` and `TeamCompletionChecklist` move verbatim — do not refactor their internals. They keep `ssr:false` dynamic import + skeleton fallback.

---

## Step 0 — Critical: the file move (do this first)

Next.js can't have both `team/[team_id].js` and a `team/[team_id]/` directory. To add `…/[team_id]/mentor` and `…/[team_id]/completion`, the existing page must become the directory's `index.js`:

```
git mv "src/pages/hack/[event_id]/team/[team_id].js" \
       "src/pages/hack/[event_id]/team/[team_id]/index.js"
```

**Then fix every relative import in `index.js`** — the file moved one level deeper, so each `../../../../` becomes `../../../../../` (4 → 5). Affected lines (currently at the top of the file and in the `dynamic()` calls):

| Current | New |
|---|---|
| `"../../../../constants/teamStatus"` | `"../../../../../constants/teamStatus"` |
| `"../../../../lib/dateUtils"` | `"../../../../../lib/dateUtils"` |
| `"../../../../components/design/refined"` | `"../../../../../components/design/refined"` |
| `"../../../../hooks/use-team-membership"` | `"../../../../../hooks/use-team-membership"` |
| `"../../../../components/VideoDisplay/VideoDisplay"` | `"../../../../../components/VideoDisplay/VideoDisplay"` |
| `"../../../../components/Teams/MentorTeamPanel"` | `"../../../../../components/Teams/MentorTeamPanel"` |
| `"../../../../components/Teams/TeamCompletionChecklist"` | `"../../../../../components/Teams/TeamCompletionChecklist"` |

Plus any new imports added below. After the move, `npm run dev` and confirm `/hack/<event>/team/<id>` still renders before continuing.

> Verify there are no other source references to the old path (`grep -rn "team/\[team_id\]" src` and check `next-sitemap.config.js` / `server-sitemap.xml.js`). The dynamic route pattern in URLs is unchanged (`/hack/.../team/...`), so external links and the server sitemap keep working — only the *file* moved.

---

## Step 1 — Shared extractions (reduce duplication across 3 pages)

Create these so the two new pages don't copy-paste the parent's data + chrome logic.

### 1a. `src/components/Teams/teamPageData.js` — shared SSR fetch + helpers

Extract from the current `index.js`:

- `fetchTeamAndEvent(event_id, team_id)` → does the `Promise.all` fetch of `/api/messages/team/{team_id}` + `/api/messages/hackathon/{event_id}`, applies the **same** rules the parent uses:
  - `try/catch` the fetch; **rethrow network errors** (so ISR keeps the last good page).
  - `teamRes.status === 404` → return `{ notFound: true }`.
  - unwrap `teamRaw?.team || teamRaw`; if falsy → `{ notFound: true }`.
  - returns `{ teamData, eventData }`.
- `statusLabel(status)` — move the existing helper here (used by the masthead on all pages).
- Export the constants the pages share: `COMPLETION_VISIBLE_STATUSES = new Set(["DEPLOYED","NONPROFIT_SIGNOFF"])`, `SCROLL_OFFSET = 96`, `OG_IMAGE`.

The parent `index.js` keeps its own extra fetches (problem statements, nonprofit) — those stay only on the main page. The two sub-pages call `fetchTeamAndEvent` only.

### 1b. `src/hooks/use-live-team.js` — client refetch hook

Extract the parent's "always refetch on the client after hydration" effect into a reusable hook so all three pages stay live (ISR + 10-min backend TTL would otherwise show stale `users[]` / checklist state):

```js
// useLiveTeam(eventId, teamId, initialTeam, initialEvent)
// → { team, setTeam, event, loading, error }
```

Behavior (copy from the current effect at `index.js`):
- Seeds state from `initialTeam`/`initialEvent`.
- On mount (and when `eventId`/`teamId` change) refetches both; only flips `loading`/`error` when there was no SSR data (`hadSsrData`).
- `setTeam` is returned so panels' `onTeamUpdate` can patch local state.

The main page additionally needs problem-statement + nonprofit refetch — leave that logic inline in `index.js` (it can call the hook for team/event and keep its extra fetches), **or** keep the parent's effect as-is and only use the hook on the two new pages. Either is fine; do not break the parent's existing behavior.

### 1c. `src/components/Teams/TeamBreadcrumbs.js` — refined-scoped breadcrumbs + schema

There is an existing `src/components/Breadcrumbs/Breadcrumbs.js`, but it is styled with global MUI `primary.main` and will look off-brand inside `<RefinedRoot>` (which uses `--brand` navy + Hanken Grotesk). Build a small refined breadcrumb instead, and reuse the existing component **only** as the reference for the `BreadcrumbList` JSON-LD shape.

Spec:
- Props: `items: [{ name, href }]` and `current: string` (the leaf, not a link).
- Render a single line using refined tokens: links use `.ohx-link` styling (or `color: var(--brand)`, hover underline), separators are a faint `›` (`color: var(--faint)`), current page is `var(--muted)` and not a link. Font `var(--body)`, `fontSize: 0.85rem`. `aria-label="breadcrumb"`, wrap in `<nav>`, use `next/link`.
- Emit `BreadcrumbList` structured data in `<Head>` — Home first (`https://www.ohack.dev/`), then each `item.href` as `https://www.ohack.dev{href}`, then `current` last. Follow the array-building pattern in `src/components/Breadcrumbs/Breadcrumbs.js` lines 9–32. Use the absolute canonical URL for the leaf's `item` (don't rely on `window.location` — build it from props) so it's stable in SSR.
- Mobile: allow wrap (`flexWrap: wrap`), keep tap targets ≥ the link text.

Trail used on every page:
```
Home (/)  ›  {eventName} (/hack/{event_id})  ›  {teamName} (/hack/{event_id}/team/{team_id})  ›  {leaf}
```
- On the **main team page**, `{teamName}` is the current (leaf) and there are 2 link items (Home is implicit in the component; pass `[{name: eventName, href: /hack/{event_id}}]`, `current={teamName}`).
- On **/mentor**, items = `[{eventName→/hack/{id}}, {teamName→/hack/{id}/team/{tid}}]`, `current="Mentor support"`.
- On **/completion**, same items, `current="Project completion"`.

---

## Step 2 — Summary cards for the main team page

Create two small **refined-styled** presentational components in `src/components/Teams/`. They compute their numbers from fields already returned by the public `get_team` endpoint (no backend change). Use `.ohx-card` + CSS-var tokens — **do not** reintroduce loud MUI color chips into the refined surface (CLAUDE.md "too busy" regression rule).

### 2a. `TeamMentorSummaryCard.js`

Mirror the computation in `MentorSupportSummary` (`src/components/Hackathon/TeamList.js` lines 139–216) but render it refined:

- Inputs: `team`, `eventId`, `teamId`.
- Compute:
  - `doneCount` over `MENTOR_COVERAGE_ITEMS` from `team.mentor_checklist` (import from `../Teams/mentorCoverage`).
  - `openFlags = Number(team.mentor_open_flag_count || 0)`.
  - `lastTouchedAt` / `lastTouchedBy` from `team.mentor_last_touched_at` / `…_by_name`.
  - judging-readiness dots via `latestRatingsByMentor(team.mentor_ratings)` + `consensusForCriterion` (optional; can reuse `JudgingReadinessStrip` logic, restyled).
- Layout: a `.ohx-card` with an eyebrow-style label "Mentor support", a row of quiet stat pills (`{doneCount}/{MENTOR_COVERAGE_TOTAL} covered`, `{openFlags} open flag(s)` only when > 0, `Last touch {relativeTime} · {name}`), and a primary affordance:
  - **`Open mentor support →`** → `NextLink href={/hack/${eventId}/team/${teamId}/mentor}` styled `.ohx-link`.
- Empty state: if no mentor activity at all (`!doneCount && !openFlags && !lastTouchedAt && no ratings`), still render the card but with a single muted line: *"No mentor activity recorded yet."* + the same "Open mentor support →" link. (Unlike the event-list version which returns `null`, here we keep the card so the page layout/anchor is stable and the link is always reachable.)

### 2b. `TeamCompletionSummaryCard.js`

- Inputs: `team`, `eventId`, `teamId`.
- Compute from `team.completion_checklist` over `COMPLETION_ITEMS` (these live inside `TeamCompletionChecklist.js`; either export `COMPLETION_ITEMS`/`TOTAL` from there and import, or re-declare the 8 slugs locally — prefer exporting from the checklist file to keep one source of truth). `doneCount`, `TOTAL`, `isComplete = team.completion_status === "complete"`.
- Layout: `.ohx-card`, label "Definition of Done", a thin progress bar or `{doneCount}/{TOTAL} complete` pill, a 🏆 "Project complete" `ohx-tag--accent` when `isComplete` (+ completed date from `team.completion_completed_at`), and **`View completion checklist →`** → `/hack/${eventId}/team/${teamId}/completion`.

### 2c. Wire the cards into `index.js`

In the content column of `index.js`, replace the two `SectionBlock` bodies (currently lines ~617–640) — **keep the `SectionBlock` wrappers and their `id`s** so the TOC + deep links survive:

- `#mentor-support` (gated by `eventHasStarted`): render `<TeamMentorSummaryCard team={team} eventId={event_id} teamId={team.id} />` instead of `<MentorTeamPanel …>`.
- `#completion` (gated by `showCompletionChecklist`): render `<TeamCompletionSummaryCard …>` instead of `<TeamCompletionChecklist …>`.

Remove the now-unused `dynamic()` imports of `MentorTeamPanel` and `TeamCompletionChecklist` from `index.js` (they live on the sub-pages now). Keep `VideoDisplay`. The TOC `sections` array (lines ~372–384) is unchanged — the labels still describe the cards. You may relabel `"Project completion"` → keep as-is; `"Mentor support"` stays.

> The main page no longer needs `useTeamMembership` for the *completion panel*, but it still uses `isOnTeam`/`membershipChecked`/`canJoin` for the member nudge and action buttons (lines ~359–368, 911–944) — **keep `useTeamMembership` on the main page.**

---

## Step 3 — New page: `/hack/[event_id]/team/[team_id]/mentor.js`

Self-contained page that frames `MentorTeamPanel`. Pattern to follow: the parent `index.js` shell (`Shell`, `RefinedRoot`, masthead) + breadcrumbs.

Structure:

1. **`getStaticProps`** → call `fetchTeamAndEvent(event_id, team_id)`; return `{ props: { teamData, eventData }, revalidate: 60 }`, or `{ notFound: true }`. **`getStaticPaths`** → `{ paths: [], fallback: "blocking" }` (same as parent).
2. **Imports** at depth `../../../../../` (5 levels). `dynamic(() => import(".../MentorTeamPanel"), { ssr:false, loading: skeleton })` — copy the dynamic config from the parent (height 420 skeleton).
3. **Hooks**: `useRouter()`, `useLiveTeam(event_id, team_id, teamData, eventData)`.
4. **Loading / error** states: reuse the `Shell` component (consider exporting `Shell` from `teamPageData.js` or a tiny `src/components/Teams/RefinedTeamShell.js` so both sub-pages share it). Error → message + "← Back to team" link to `/hack/{event_id}/team/{team_id}`.
5. **`<Head>`**:
   - `<title>Mentor support · {teamName} · {eventName} | Opportunity Hack</title>`
   - description: *"Mentor coverage, flags, judging readiness and notes for {teamName} at {eventName}."*
   - `<meta name="robots" content="noindex,follow" />` — these are operational views; keep crawl focus on the main team page. (Judgment call; noindex recommended.)
   - `<RefinedFonts />`.
   - Breadcrumb JSON-LD is emitted by `TeamBreadcrumbs`.
6. **Body** inside `<RefinedRoot>` / `.ohx-wrap` (maxWidth ~960):
   - `<TeamBreadcrumbs items={[{name: eventName, href: /hack/${event_id}}, {name: teamName, href: /hack/${event_id}/team/${team_id}}]} current="Mentor support" />`
   - Masthead: `<Eyebrow>{eventName} · {teamName}</Eyebrow>`, `<h1 className="ohx-display">Mentor support</h1>`, one-line subtitle. A back link "← Back to team page".
   - **Gate**: compute `eventHasStarted` (`parseLocalDate(event.start_date) <= new Date()`). If the event hasn't started, render a calm empty state card ("Mentor support opens when the event starts on {date}.") + back link — **do not 404**.
   - When started: `<MentorTeamPanel team={team} event={event} eventId={event_id} onTeamUpdate={setTeam} />`.
   - Footer actions: "← Back to {teamName}", "Definition of Done →" (link to `/completion` when `showCompletionChecklist`), "Back to event".

> The panel manages its own auth gate, snackbars, dialogs, and tab-refocus refresh — pass props only. `onTeamUpdate={setTeam}` updates props in place (no remount). **Do not** define any component inside the page function body (avoids the remount storm called out in CLAUDE.md for this page family).

---

## Step 4 — New page: `/hack/[event_id]/team/[team_id]/completion.js`

Same skeleton as Step 3, framing `TeamCompletionChecklist`.

Differences:

1. Also call `useTeamMembership(event_id, team?.id)` → `{ isOnTeam, membershipChecked }` (the checklist needs these props for write-gating; the public payload omits `propel_id`, so membership must come from the server — see the hook + CLAUDE.md "Team Project-Completion Checklist").
2. `dynamic()` import of `TeamCompletionChecklist` (`ssr:false`, height-520 skeleton — copy from parent).
3. **Gate**: compute `showCompletionChecklist = isWinningStatus(team.status) || COMPLETION_VISIBLE_STATUSES.has(team.status)`. If false, render a calm explanatory card ("This team's Definition of Done unlocks once judging marks it a winner / it reaches deployment.") + back link — **do not 404**.
4. When eligible: `<TeamCompletionChecklist team={team} eventId={event_id} onTeamUpdate={setTeam} isOnTeam={isOnTeam} membershipChecked={membershipChecked} />`.
5. `<Head>`: title `Definition of Done · {teamName} · {eventName} | Opportunity Hack`; `noindex,follow`; description about project-completion progress.
6. Breadcrumbs: `current="Project completion"`.
7. Footer actions: "← Back to {teamName}", "Mentor support →" (when `eventHasStarted`), "Back to event".

> The checklist fires confetti + Slack on toggles and has its own dialogs/snackbar — unchanged. Keep `react-confetti` working via the component's own `ssr:false` dynamic import inside the component (it's already there); the page-level `dynamic(ssr:false)` of the checklist is also kept.

---

## Step 5 — Update the event teams listing link

In `src/components/Hackathon/TeamList.js`, the `MentorSupportSummary` card's "Details →" link (lines ~172–181) currently points at the team page:

```js
href={`/hack/${eventId}/team/${team.id}`}
```

Per the request ("clicking on this should take you right to that …/mentor page"), change it to:

```js
href={`/hack/${eventId}/team/${team.id}/mentor`}
```

Optionally relabel "Details →" to "Mentor details →" for clarity. Leave the rest of `TeamList.js` untouched (CWV: do not restore eager profile fetching, etc. — see CLAUDE.md `TeamList` notes).

---

## Step 6 — Add breadcrumbs to the main team page

In `index.js`, replace (or supplement) the existing single "← Back to {eventName}" link (lines ~414–421) with `<TeamBreadcrumbs items={[{name: eventName, href: /hack/${event_id}}]} current={teamName} />` placed just above the masthead. Keep a "← Back to event" affordance somewhere (the existing footer button already covers it). This gives all three pages the same trail spine.

---

## Invariants to preserve (regressions we must not cause)

From `CLAUDE.md` (team page family) and the code:

1. **`statusLabel()`** must come from `TEAM_STATUS_OPTIONS.find()` — never render raw enum strings. Winning statuses get 🏆 via `getWinningStatus()`. (Used in masthead on all pages.)
2. **No component definitions inside a page/component body** on these pages — module-scope only (the `SectionBlock` remount-storm lesson). The new pages are simple; keep it that way.
3. **`parseLocalDate`** (from `lib/dateUtils`) for all event-window checks (`eventHasStarted`, `eventEnded`) — never `new Date(dateOnlyString)` (UTC-midnight bug).
4. **`useTeamMembership`** is the only membership source (server-side; payload omits `propel_id`). Completion page must pass `isOnTeam`/`membershipChecked` to the checklist.
5. **`getStaticProps`** rethrows network errors (ISR keeps last good) and returns `notFound` only on genuine 404 — replicate on both new pages via `fetchTeamAndEvent`.
6. Heavy panels stay **`dynamic(ssr:false)`** with sized skeletons (CWV/CLS).
7. Refined surfaces use `.ohx-*` + CSS-var tokens; **no loud colored chips/gradients** on the team page or the new summary cards.
8. Keep `onTeamUpdate={setTeam}` (prop patch, not remount) so in-progress mentor note drafts / confetti state aren't wiped.

---

## Execution checklist (order matters)

- [ ] `git mv` `[team_id].js` → `[team_id]/index.js`; fix all relative imports (4→5 `../`). Confirm the page still loads.
- [ ] Create `src/components/Teams/teamPageData.js` (`fetchTeamAndEvent`, `statusLabel`, shared consts). Optionally export a shared `Shell`/`RefinedTeamShell`.
- [ ] Create `src/hooks/use-live-team.js`.
- [ ] Create `src/components/Teams/TeamBreadcrumbs.js`.
- [ ] Export `COMPLETION_ITEMS`/`TOTAL` from `TeamCompletionChecklist.js` (single source of truth) for the summary card.
- [ ] Create `src/components/Teams/TeamMentorSummaryCard.js` + `TeamCompletionSummaryCard.js`.
- [ ] In `index.js`: swap the two inline panels for the summary cards (keep `SectionBlock` wrappers/ids); remove the two now-unused `dynamic()` imports; add `<TeamBreadcrumbs>` to the masthead.
- [ ] Create `src/pages/hack/[event_id]/team/[team_id]/mentor.js`.
- [ ] Create `src/pages/hack/[event_id]/team/[team_id]/completion.js`.
- [ ] Update `MentorSupportSummary` link in `src/components/Hackathon/TeamList.js` → `…/mentor`.
- [ ] `npx eslint` the touched files; `npm run dev` and smoke-test.

## Verification

Test with a real event/team (e.g. `/hack/2025_fall/team/466e959ea62e11f0a3d1dead51b0fba6`):

1. **Main page** — mentor + completion now render as compact cards with correct counts; "Open mentor support →" / "View completion checklist →" links work; TOC `#mentor-support` / `#completion` still scroll to the cards; breadcrumb trail shows `Home › {Event} › {Team}`.
2. **/mentor** — panel renders; logged-in approved mentor can toggle coverage / raise a flag / post a note (writes succeed, snackbar shows); non-mentor sees read-only Alert; before event start shows the calm "opens when the event starts" state; breadcrumbs + back links navigate correctly.
3. **/completion** — checklist renders for a winning/deployed team; a team member can check an item (confetti + Slack confirmation snackbar); non-member sees read-only; a non-winning team shows the "unlocks once…" state, not a 404.
4. **Event teams listing** (`/hack/<event>#teams`) — "Mentor details →" on a team card lands on that team's `/mentor` page.
5. **Live data** — toggling an item on a sub-page and returning to the main page (or refocusing the tab) reflects the change (no stale TTL view).
6. **No console errors / no full-page remount** when interacting with the panels (drafts persist).
7. `npm run build` succeeds; new routes appear; sub-pages carry `noindex`.

## Out of scope

- No backend changes (all needed fields already come from `get_team`).
- No refactor of `MentorTeamPanel` / `TeamCompletionChecklist` internals.
- No change to the team page's nonprofit / problem-statement / members / links sections.
- No change to `TeamList.js` beyond the single link target (preserve its CWV lazy-fetch behavior).

## CLAUDE.md update (after implementation)

Add to the `/hack/[event_id]/team/[team_id]` section: the page is now `…/[team_id]/index.js` with two sub-routes `…/mentor` and `…/completion` (both `noindex`, `fallback:"blocking"`); the main page shows compact `TeamMentorSummaryCard` / `TeamCompletionSummaryCard` (computed from `mentor_*` / `completion_*` team fields, refined-styled) in the existing `#mentor-support` / `#completion` anchored sections; shared `fetchTeamAndEvent`/`statusLabel` live in `teamPageData.js`, client refetch in `use-live-team.js`, refined breadcrumbs in `TeamBreadcrumbs.js`; the event-list `MentorSupportSummary` "Details" link points at `…/mentor`.
