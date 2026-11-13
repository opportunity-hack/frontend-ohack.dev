# Giveaways overhaul — prizes, per-prize entry, fast admin, staged draw (Nov 2026)

Executor: Opus 5.5. Repos: `frontend-ohack.dev` (FE) and `backend-ohack.dev` (BE). Read both repos' `CLAUDE.md` first.

## 1. What exists today (read these before changing anything)

| Piece | File | Notes |
|---|---|---|
| Profile tab 5 `#giveaways` | `src/components/Profile/Profile.js` (~L852) → `src/components/Profile/RaffleEntries.js` | Old MUI `Paper`/`Chip`/`Table`; one "Enter Giveaway" button; `giveaway_id` hardcoded `"2024_fall"`; entry count computed in the browser and trusted by the server; render-path `console.log`; raw axios, no error state |
| Admin page | `src/pages/admin/giveaways/index.js` | One flat table of all entrants + seed field |
| Draw dialog | `src/components/admin/DramaticGiveawaySelector.js` (+ `__tests__`) | Purple gradients, chained `setTimeout`s that are never cleared, one winner, nothing saved |
| BE service | `services/giveaway_service.py` | Collection `giveaways`; a new doc per click of "Enter" |
| BE routes | `api/messages/messages_views.py` `GET|POST /api/messages/giveaway`, `GET /api/messages/giveaway/admin` | **Frozen file — do not edit** |

Bugs found (fix as part of this work, list them in the PR):

1. **Admin is slow because of the backend.** `get_all_giveaways` streams the whole `giveaways` collection (every re-entry, every year), then calls `get_profile_by_db_id` once per unique user, one after another. No filter by giveaway, no batching, no cache.
2. **The table filter changes who can win.** The draw pool is built from `sortedGiveaways`, which is the *filtered* list. Typing in the search box removes people from the draw.
3. **Entry counts are client-supplied.** Anyone can POST `entries: 99999`.
4. **Copy says "Maximum of 45 entries"; the code caps only the GitHub part at 45.** Keep the code's behavior, fix the copy.
5. `giveaways.sort()` mutates React state during render; the fetch is keyed on the raw `accessToken` (refetch + spinner on every tab refocus).
6. The shuffle highlight uses `Math.random`, the winner uses a weak LCG over an array expanded to one element per entry.

## 2. Decisions (already made — do not reopen)

- New BE blueprint `api/giveaways/` (`giveaways_views.py`, `giveaways_service.py`, `tests/`, `README.md`), registered in `api/__init__.py`. Legacy `/api/messages/giveaway*` routes stay untouched for old clients; the new FE never calls them.
- Two new Firestore collections; the old `giveaways` collection is left alone (no migration, no delete).
- Entry weight is computed **on the server**. Same formula as today: 5 per completed profile field + GitHub contributions capped at 45.
- One entry doc per user per giveaway (upsert). The doc carries a small user snapshot so the admin list needs zero profile reads.
- The winner is decided by a pure, seeded, unit-tested function in the FE. The server records and validates each result. Admins are trusted; the seed makes the result reproducible.
- A person can win at most one prize per giveaway. A person marked "not here" is out for the rest of that draw session (an organizer can put them back).
- Deploy order: **backend first**. Every new FE call treats 404 as "feature off".

## 3. Data model

### `giveaway_campaigns/{giveaway_id}` (doc id = slug, immutable, e.g. `fall-2026`)

```
title, description (≤500), event_id (optional), status: draft|open|closed|drawn,
must_be_present: bool (default true), closes_at (ISO with offset, optional),
prizes: [{ id (uuid, stable), name (≤80, required), description (≤300),
           image_url (optional), product_url (optional, http/https only),
           quantity (int 1..50, default 1), sort_order }],
draw: { seed (string), started_at, started_by,
        results: [{ id, prize_id, slot (0-based), user_id, name, profile_image,
                    outcome: won|absent, attempt, at, by }] },
created_at, updated_at, updated_by
```

### `giveaway_entries/{giveaway_id}__{user_db_id}`

```
giveaway_id, user_id (Firestore user doc id), all_prizes: bool, prize_ids: [..],
entries (int, server-computed), breakdown: {profile_fields, profile_entries, github_entries},
user: {name, nickname, profile_image, github},   # snapshot at save time
created_at, updated_at
```

`all_prizes: true` means "everything, including prizes added later". Otherwise only `prize_ids` count.

## 4. Backend (PR 1 — `feat/giveaways-v2`)

Routes (prefix `/api/giveaways`):

| Route | Auth | Does |
|---|---|---|
| `GET /open` | `require_user` | `{giveaways:[{id,title,description,closes_at,must_be_present,status,prizes[], my_entry|null, my_win|null}]}` for `open` campaigns plus `closed`/`drawn` ones the caller entered (so they can see what they won). ONE request feeds the profile tab |
| `PUT /<id>/entry` | `require_user` | Body `{all_prizes, prize_ids}`. 409 `giveaway_closed` unless `open` and before `closes_at`. 400 `invalid_prizes` for unknown ids, `no_prizes_selected` when the campaign has prizes and none are picked. Computes `entries` + `breakdown` + user snapshot, upserts, returns the entry |
| `DELETE /<id>/entry` | `require_user` | Withdraw (409 once not `open`) |
| `GET /admin` | `volunteer.admin` | Lean campaign list (no `draw.results`) |
| `POST /admin` · `PATCH /admin/<id>` | `volunteer.admin` | Create / partial update. Validators in `common/utils/validators.py`. A prize that has a `won` result can't be removed (409 `prize_has_winner`) |
| `GET /admin/<id>` | `volunteer.admin` | Full campaign incl. `draw` |
| `GET /admin/<id>/entries` | `volunteer.admin` | ONE `where giveaway_id ==` query → `{entries:[...], count}`. No profile reads |
| `POST /admin/<id>/draw/start` | `volunteer.admin` | Body `{seed}`. Stores the seed, sets status `closed` (entries lock). 409 `draw_already_started` if a seed exists and differs |
| `POST /admin/<id>/draw/results` | `volunteer.admin` | Body `{prize_id, slot, user_id, outcome, attempt}`. In a transaction: user entered this prize; user has no `won` result; the slot has no `won` result; slot < quantity. Appends. When every slot of every prize is `won` or the client sends `{finish:true}` → status `drawn` |
| `POST /admin/<id>/draw/undo` | `volunteer.admin` | Body `{result_id}` — removes one result (wrong click, or "they arrived after all") |
| `POST /admin/<id>/draw/reset` | `volunteer.admin` | Clears `draw`, status back to `closed`. Slack audit |

Implementation notes:

- Resolve the caller to a user doc with the resolver the canonical profile route uses (`GET /api/users/profile` in `api/users/users_views.py`), not the Slack-only `get_slack_user_from_propel_user_id` path in the old service.
- Weight: mirror the FE's `src/components/Profile/profileFields.js` field names in one BE constant `GIVEAWAY_PROFILE_FIELDS` (comment both files: keep in sync). GitHub count = the service behind `GET /api/messages/profile/github/<username>` (commits + PRs + issues + reviews, cap 45). If that lookup fails, use the previous stored `github_entries` if any, else 0, and return `github_unavailable: true` — never fail the entry.
- Cache `GET /open`'s campaign read and `GET /admin` with a 60s TTL cache; clear on every admin write. Do not cache entries.
- Prize images: reuse `POST /api/messages/upload-image` with `directory=giveaways/<giveaway_id>`. That route has a directory allowlist near L98 of `messages_views.py` — check whether `giveaways/` passes. If it does not, add a small `POST /api/giveaways/admin/<id>/prize-image` in the new blueprint that calls the same storage helper. Do not edit the frozen file.
- `send_slack_audit` on create, draw start, each `won`, reset. Not on user entries (noise).
- Tests (`api/giveaways/tests/`): weight math + cap; upsert keeps `created_at`; closed/expired 409; invalid prize ids; one-win-per-person; slot already filled; undo; non-admin 403; entries route does no user reads (assert on the mock).
- Docs: `api/giveaways/README.md` + a short section in BE `CLAUDE.md`.

## 5. Frontend shared layer (PR 2)

- `src/lib/giveawayApi.js` — fetch wrappers throwing `ApiError{status, body}` (copy the shape of `src/lib/teamDashboardApi.js`).
- `src/lib/giveawayDraw.js` — pure, no React, fully unit-tested:
  - `makeRng(seedString)` — `xmur3` hash → `mulberry32`.
  - `eligibleForPrize(entries, prizeId, {wonUserIds, absentUserIds})` — opted in (`all_prizes` or id listed), `entries > 0`, not a prior winner, not absent. **Input is always the full unfiltered entry list.**
  - `rankEntrants(eligible, seed, prizeId, slot)` — sort by `user_id` (stable input order), then weighted sampling without replacement: `key = -ln(u) / entries` with `u` from `makeRng(`${seed}|${prizeId}|${slot}`)`, ascending. `ranking[0]` is the winner. Each person's chance of being first is exactly `entries / total`.
  - `nextPresent(ranking, absentUserIds)` — the redraw. Taking the next person in the ranking is mathematically the same as a fresh weighted draw among the rest, so it is fair and needs no new seed.
  - `buildDrawScript(ranking, {maxTiles})` — returns the list of beats in §7 (who leaves in which beat). The animation only plays this script.
  - Tests: same seed → same ranking; table sort/filter can't change it; 20k-run frequency check within tolerance of weights; prior winners and absentees excluded; 0 and 1 entrant.
- Hooks via `useAuthedResource` (`src/hooks/use-authed-resource.js`): `use-open-giveaways.js`, `use-admin-giveaway.js`. No `useEffect` keyed on the raw `accessToken` (the guard test `src/__tests__/guards/effect-access-token.test.js` will fail otherwise).

## 6. Profile tab `/profile#giveaways` (PR 2)

Tab index 5 and the `#giveaways` hash are frozen — change only the tab body. `Profile.js` is already refined, so `.ohx-*` classes work in the tab.

Replace `RaffleEntries` with `src/components/Profile/Giveaways/GiveawaysTab.jsx` (module-scope subcomponents: `GiveawayCard`, `PrizeOption`, `EntryBreakdown`). Delete `RaffleEntries.js`. Keep the existing "How to Earn More Entries" block below it.

Layout per open giveaway, top to bottom:

1. Eyebrow (event or "Giveaway") + Fraunces title + one-line description. Quiet meta line: "Entries close Sat Nov 14, 4:00 PM Arizona time" · when `must_be_present`: "Winners are drawn live at the closing ceremony, so plan to be there." (gentle copy — no red "You must be present" warning).
2. **Your entries**: Fraunces number + plain breakdown — "30 from your profile (6 of 9 fields) · 12 from GitHub (max 45)". Link "Complete your profile" → `#basic`. Text: "Your entries count in every prize drawing you join."
3. **Pick your prizes**: grid (1-up xs, 2-up sm, 3-up md — explicit breakpoint object, never `auto-fit`) of `PrizeOption` cards. Each is a real `<input type="checkbox">` inside a `<label className="ohx-card">`: 1:1 image box with reserved size (`next/image` only for `cdn.ohack.dev`, plain `<img width height loading="lazy">` otherwise, Fraunces initial on error/no image), name, 2-line description, "×3" tag when quantity > 1, and a separate "View product ↗" link (outside the label so clicking it doesn't toggle). Selected = navy border + check mark; no colored fills.
4. Above the grid: one checkbox "Enter me for everything" (sets `all_prizes`; checks and disables every card; helper: "Includes anything we add later.").
5. One primary button. Not entered: "Enter giveaway" (disabled until something is picked). Entered and unchanged: status line "You're in for 3 of 5 prizes." Entered and changed: "Update my picks". Soft link "Withdraw from this giveaway" → two-step inline confirm (no `window.confirm`).
6. Inline `role="status"` result line (no MUI Snackbar).

Other states:

- Campaign has no prizes → hide the picker; a single "Enter giveaway" button sends `all_prizes: true`.
- Loading → skeleton with `minHeight 320`. Fetch failed → quiet Retry card, never "no giveaways". 404 → "Giveaways aren't available right now."
- Nothing open → "No giveaway is open right now. We'll announce the next one in Slack."
- `closed` → picks read-only: "Entries are closed. Winners are drawn at the closing ceremony."
- `drawn` → "You won: {prize}" card (accent border) or "Thanks for entering — this one's finished."
- `github_unavailable` → "We couldn't reach GitHub just now, so those entries may be low. Save again later to refresh."

GA (`ENGAGEMENT`): `giveaway_enter`, `giveaway_update`, `giveaway_withdraw` (`event_label` = giveaway id, `value` = prize count). Add to `ga-events-reference.md`.

Tests: `Profile/Giveaways/__tests__/GiveawaysTab.test.js` — first render with a never-resolving fetch shows the skeleton; pick → save sends the right body; "everything" sends `all_prizes`; 500 shows Retry; closed is read-only.

## 7. Admin `/admin/giveaways` (PR 2 = Setup + Entries, PR 3 = Draw)

Keep `AdminPage` + plain MUI. Tabs synced to the URL: `?g=<giveaway_id>&tab=setup|entries|draw` (shallow replace; follow the `/admin/communication` slug pattern). A giveaway `Select` + "New giveaway" sit above the tabs; default = newest non-`drawn` campaign.

### Setup tab — `src/components/admin/giveaways/SetupTab.js`

- Campaign fields: title, description, linked event (optional `Select` from `/api/messages/hackathons`), closes at (`DateTimePicker`, save with `toIsoWithTimezone`), must-be-present switch, status control (Draft → Open → Closed; Reopen allowed until a draw starts).
- **Prizes editor**: rows with drag reorder (`@hello-pangea/dnd`, as in `MealsSection`): name (required), description, quantity, product link (optional), image (optional — upload button + 64×64 preview + remove). Add / duplicate / delete. Explicit **Save** with a dirty marker and `beforeunload` warning; block Save on validation errors.
- "What hackers see" preview using the real `PrizeOption`.

### Entries tab — `EntriesTab.js`

- Stat line: people · total entries · per-prize counts as clickable filter chips ("Headphones 84").
- Table: avatar, name, GitHub, entries, picks ("Everything" or prize names), updated. Search via `useDeferredValue`; sort with `useMemo` on a copy; render cap 100 rows + "Show more". `ExportCsvButton` (`table="giveaway_entries"`).
- Search and filters here are **display only** and never feed the draw.

### Draw tab — `DrawTab.js` + `DrawStage.js` (PR 3)

Delete `DramaticGiveawaySelector.js` and its test.

**Before the show** (the tab itself): a checklist card — entries closed? N prizes, N people; draw order list (drag to reorder for tonight; default `sort_order`, with a hint to end on the biggest prize); seed field + "Generate" (6 digits — easy to read aloud); "Start the draw" → `draw/start`, opens the stage. If a draw is in progress, the button reads "Resume the draw" and a results table shows what has been awarded so far, with Undo per row and "Reset draw…" (typed confirm).

**The stage** — a `fullScreen` MUI `Dialog`. It is a Portal, so use literal colors, not `.ohx-*`/CSS vars: navy `#12284C` background, paper `#FBFAF6` text, terracotta `#E2552E` for the one accent, `FONT_DISPLAY`/`FONT_BODY` from `src/styles/fonts.js`. Built for a projector: nothing under 20px, high contrast, no gradients.

Layout: main area (left, ~75%) for the current prize; a **Winners rail** (right) that lists every prize in draw order with its winner's avatar + name once confirmed, "up next" for the rest, and a small "Not here (N)" list at the bottom with a "They've arrived" undo per person.

State = one `useReducer` machine + ONE timer effect keyed on the current beat. No chained `setTimeout`s; closing the dialog clears everything; the script comes from `buildDrawScript`. The operator sets the pace: every beat marked ⏸ waits for **Space** (or the on-screen "Continue" button).

Per prize (per slot when quantity > 1):

| Beat | What the room sees | Timing |
|---|---|---|
| 1 Prize | Prize image + name, large. "142 people in the running · 3,410 entries" | ⏸ |
| 2 Seed | "Seed 482913" ticks into place, caption "Same seed, same result — anyone can re-run it." | 2s |
| 3 Everyone | A wall of tiles (avatar + first name), popping in with a stagger capped at 1.5s total. Over 120 people: avatar-only tiles. Over 300: render 300 tiles and a "+N more" counter that drains first | 2s |
| 4 Waves | Each wave removes about half of those left (tiles dim, then collapse). Big counter: "71 still in". Repeat until 10 or fewer remain | ~1.8s per wave |
| 5 Final ten | Layout re-flows to larger name cards. One person leaves at a time; the gap grows from 0.7s to 1.5s | auto |
| 6 Final three | Stops at three | ⏸ then one leaves |
| 7 Final two | Two cards side by side | ⏸ |
| 8 Winner | Winner card grows to center with the prize beside it; `react-confetti` (dynamic, `ssr:false`), 4s | — |
| 9 Check | Operator bar: **"They're here"** (Enter) · **"Not here — draw again"** (N) | ⏸ |

- People leave in reverse ranking order, so the animation is the real result played backwards — the last one standing is `ranking[0]`.
- **They're here** → `draw/results {outcome:"won"}` → the rail updates → "Next prize: {name}" ⏸. If the POST fails, stay on the beat with an inline error + Retry; never advance on an unsaved result.
- **Not here** → `draw/results {outcome:"absent"}` → the card moves to the "Not here" list → bring back the next five people in the ranking and replay beats 5–9 (about 10 seconds). The new winner is `nextPresent(...)`.
- Winners are removed from every later prize; absentees too (until "They've arrived").
- Edge cases: 0 eligible → "No one left in the running for {prize}" + "Skip prize"; 1 eligible → straight to beat 8; fewer than 10 → skip waves.
- Keys: Space continue, Enter confirm, N not here, S skip to the final three, Esc leave (state is saved server-side; confirm if a winner is on screen but not recorded). Buttons carry the same actions for mouse use.
- `prefers-reduced-motion`: no waves or confetti — beat 1 → ⏸ → beat 8 with a plain fade.
- **Finale**: when the last slot is settled, a "Winners" board — every prize with its winner (avatar, name, prize image), then the not-here list. Buttons: Export CSV (prize, winner, email if available in the entry snapshot — otherwise name + profile link `/profile/<user_id>`), Close. Status becomes `drawn`.

GA (`ADMIN`): `admin_giveaway_save`, `admin_giveaway_draw_start`, `admin_giveaway_winner_confirmed`, `admin_giveaway_redraw`, `admin_giveaway_draw_finish`.

Tests: reducer walk-through (prize → winner → not here → redraw → confirm → next prize excludes the winner); failed save doesn't advance; reduced-motion path; Setup save payload; Entries filter doesn't change `eligibleForPrize` input.

## 8. Speed (ask #4) — where the time goes and what fixes it

| Cause | Fix | Where |
|---|---|---|
| Full-collection scan of every entry ever | One doc per user per giveaway + `where giveaway_id ==` | §3, §4 |
| One profile read per entrant, in sequence | User snapshot stored on the entry | §3 |
| No cache on campaign reads | 60s TTL, cleared on admin writes | §4 |
| Refetch + full-page spinner on token rotation | `useAuthedResource` (keys on token presence) | §5 |
| Whole table mounted, sort mutating state in render | `useMemo`, `useDeferredValue`, 100-row cap | §7 |
| Stage rendering one card per *entry* | Tiles per *person*, capped at 300 | §7 |

Measure and put both numbers in the PR: time for the old `GET /api/messages/giveaway/admin` vs the new `GET /api/giveaways/admin/<id>/entries` on the test backend.

## 9. Order of work

1. **BE PR** — §4. `pytest api/giveaways`. Merge + deploy to test.api first.
2. **FE PR 2** — §5, §6, Setup + Entries tabs. Admin Draw tab shows "coming next" until PR 3.
3. **FE PR 3** — Draw tab + stage; delete the old selector.

Each FE PR: `npm test`, `npx eslint src`, **`npm run build`** (repo rule for anything touching `src/pages`), update `CLAUDE.md` (replace the giveaway mentions; note that `profileFields.js` now has a backend twin), and end the PR description with a page-level click-through list for Greg: `/profile#giveaways` (no giveaway / open / entered / closed / won), `/admin/giveaways?tab=setup|entries|draw`, a full draw with one "not here" redraw and a mid-draw refresh.

## 10. Open questions for Greg (defaults are in the plan; build with them unless he answers)

1. **People who already entered under the old `2024_fall` id** are not carried over — they enter again and pick prizes. Alternative: a one-off "Import old entries since <date> as *everything*" button on the Setup tab.
2. **Marked "not here" = out for the rest of the night** (with an undo). Alternative: out for that prize only.
3. **Weight cap**: keep today's real behavior (profile entries uncapped, GitHub capped at 45) and correct the copy. Alternative: cap the total at 45.
4. **Winner list visibility**: each person sees only their own win on their profile. No public winners page.
