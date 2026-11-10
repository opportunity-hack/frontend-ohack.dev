# Mentor check-in: consistent gate + admin reset (Nov 2026)

Implementation plan. Two repos, both PR into `develop` (test.ohack.dev / test.api run `develop`).
**Backend ships first.** Branch both off fresh `develop` (the frontend checkout is currently on
`fix/hackathon-admin-readonly-ref` — do not build on it).

- Frontend: `/Users/gregv/dev/fresh_ohack/frontend-ohack.dev`
- Backend: `/Users/gregv/dev/fresh_ohack/backend-ohack.dev` (never touch `.env`; use `git -C`, no `reset --hard`)

Line numbers below are from `develop`-adjacent code on 2026-11-10; re-locate by symbol.

---

## Part 1 — `/hack/[event_id]/mentor-checkin` shows the wrong panel, then flips

### Root causes (all confirmed by reading the code)

File: `src/pages/hack/[event_id]/mentor-checkin.js`.

1. **Stale-request race (the flash).** One effect (l.148–550) fetches the event, then the mentor
   application, keyed on `[event_id, isLoggedIn, user, accessToken, apiServerUrl]`, with no
   cancellation. On load PropelAuth is still resolving, so run A starts with `isLoggedIn` false.
   Auth resolves → run B starts (`setIsLoading(true)`). Run A finishes first, skips the mentor
   fetch (its closure saw logged-out) and calls `setIsLoading(false)` → `mentorData` is still
   `null` → **"You are not registered as a mentor"** renders. Run B then lands → real page.
2. **Auth `loading` is ignored.** `useAuthInfo().loading` is never read, so while auth resolves
   the page renders the "Log in" panel (l.825) for a logged-in mentor.
3. **Token rotation re-runs everything.** PropelAuth mints a new `accessToken` on tab refocus and
   `user` changes identity; the effect re-runs, `isLoading` flips, the whole page is replaced by
   the spinner and `MentorTeamsTable` remounts (search/filter lost). Same race can replay.
4. **Backend identity mismatch turns a found mentor into "not registered".**
   `GET /api/mentor/application/<event>` uses the 3-way resolver
   (`find_volunteer_by_caller_identity`: propel UUID → email → OAuth id), but
   `get_mentor_checkin_status` / `mentor_checkin` / `mentor_checkout`
   (`services/volunteers_service.py` ~l.2323–2520) use `get_volunteer_by_user_id` (propel UUID
   only). A mentor matched by email gets a 404 from `/status`; the page's catch (l.533) then does
   `setMentorData(null)` → "not registered", and check-in itself fails for them.
5. **Errors render as "not registered".** A non-404 failure sets `error` but leaves `mentorData`
   null, so a backend blip shows the apply CTA. (Also: the application GET answers 200 with
   `data: null` for "no application", so the 404 branch is only ever hit by cause 4.)
6. **Approval is never checked.** Neither the page nor the backend looks at `isSelected`: a
   pending mentor gets the full check-in UI and can check in (and is announced in #ask-a-mentor).
7. `Shell` is defined inside the component (~l.805) → new component type every render → children
   remount. Move to module scope (SectionBlock lesson in CLAUDE.md).

### Frontend changes

**1a. Pure gate — `src/lib/mentorCheckinGate.js` (new, unit-tested)**

```js
// status values: "idle" | "loading" | "ready" | "error"
deriveMentorGate({ authLoading, isLoggedIn, eventStatus, mentorStatus, mentor, checkinWindow })
// → one of:
// "loading"        authLoading, or event/mentor fetch not settled for the CURRENT identity
// "logged_out"     auth settled and !isLoggedIn
// "event_error"    event fetch failed
// "mentor_error"   mentor fetch failed (network/5xx)  → retry card, NOT the apply CTA
// "not_applied"    mentor fetch settled with no application
// "pending"        application && !isSelected (incl. waitlisted)  → "awaiting confirmation"
// "not_selected"   applicationState(...) says denied (explicit review status only)
// "ready"          application && isSelected
```

Rules: `loading` wins over everything; "not_applied" is only reachable when the mentor fetch has
**settled successfully with null for the identity currently logged in**. Reuse `applicationState`
from `src/lib/mentorEvents.js` for pending/waitlisted/denied (the ambiguous-`isSelected` rule: a
bare `isSelected:false` is only ever "awaiting confirmation").

Tests (`src/lib/__tests__/mentorCheckinGate.test.js`): every row of the table above, plus
"auth loading + stale mentor null ⇒ loading" and "mentor error ⇒ mentor_error, never not_applied".

**1b. Hook — `src/hooks/use-mentor-checkin.js` (new)**

Owns the three reads and returns
`{ gate, event, teams, nonprofits, mentor, checkedIn, checkinWindow, refreshStatus, retry, setCheckedIn }`.

- **Two effects.** Event fetch (public) keyed on `event_id` only. Mentor fetch keyed on
  `event_id`, `isLoggedIn`, `user?.userId` — **never** on `accessToken` or the `user` object.
  Token is read through a ref (`accessTokenRef.current = accessToken` each render) — the
  token-rotation pattern from `useHackathonAdmin`.
- **Cancellation.** Each effect uses a `let cancelled = false` cleanup (or a request-id ref);
  a stale run must not call any setter.
- `mentorStatus` starts `"loading"` whenever a fetch will fire (data-hook rule in CLAUDE.md);
  reset to `"loading"` and `mentor` to `null` when `user?.userId` changes.
- Mentor fetch = `GET /api/mentor/application/<event>` then, only when a mentor exists,
  `GET /api/mentor/checkin/<event>/status`. **A `/status` failure never clears `mentor`** — it
  leaves `checkedIn` false and is swallowed (log only).
- `refreshStatus()` re-reads `/status` only; wire it to `visibilitychange` (15s throttle) so an
  admin reset shows up on the mentor's open tab. Background refreshes never set `"loading"`.
- `checkinWindow` comes from the `/status` payload (Part 3); absent ⇒ `{ state: "open" }`
  (older backend).

Hook test (`src/hooks/__tests__/use-mentor-checkin.test.js`, stable auth mock — see the loop
gotcha in `use-profile-api.test.js`): (a) auth flips logged-out → logged-in mid-flight with a slow
first event fetch ⇒ `gate` goes `loading → ready`, **never** `not_applied`/`logged_out`;
(b) token changes ⇒ zero new requests; (c) `/status` 404 ⇒ gate stays `ready`;
(d) application 500 ⇒ `mentor_error`.

**1c. Page**

- Replace the big effect + `isLoading/mentorData/checkedIn/teams/nonprofits/eventData` state with
  the hook. Render strictly by `gate` (one `switch`/ladder, in this order: loading, logged_out,
  event_error, mentor_error, not_applied, pending, not_selected, ready).
- Move the availability-string parser (l.230–511) **verbatim** into
  `src/lib/mentorAvailabilitySlots.js` (`parseAvailabilitySlots(availability)` → slots array) and
  call it in a `useMemo` on `mentor?.availability`; `currentActiveSlot` becomes a memo too. No
  logic edits — add a small snapshot test with 2–3 real availability strings (take them from
  `src/__tests__/pages/mentor.test.js` / `mentorEvents.test.js` fixtures).
- Move `Shell` to module scope. Keep `<Head>` (noindex/canonical) rendering in every branch.
- New panels (refined `.ohx-card`, gentle copy — no scolding):
  - `pending` and `not_selected`: see "Part 3 — UX spec" for the exact copy and actions
    (decided by Greg, Nov 10 2026). No check-in button in either.
  - `mentor_error` / `event_error`: "We couldn't load your mentor details" + Retry (`retry()`).
  - `not_applied`: existing copy/CTAs unchanged.
- `ready`: existing UI unchanged except the Part 3 window state.
- Check-in/out handlers stay in the page (logic verbatim) but read the token from the hook/ref
  and on 4xx show the backend `message` instead of the generic string.

Page test `src/__tests__/pages/mentor-checkin.test.js` (NOT under `src/pages`): render each gate
and assert exactly one of the panel headings is present; the race case asserts "not registered"
text never appears across the transition (`findBy` the ready heading, then
`expect(screen.queryByText(/not registered/i))` was never rendered via a MutationObserver or by
asserting after each `act`).

### Backend changes (fix cause 4 + 6)

`services/volunteers_service.py`:

- `get_mentor_checkin_status`, `mentor_checkin`, `mentor_checkout`: resolve the doc with
  `_find_volunteer_snapshot(db, user_id, event_id, 'mentor')` (3-way, gives `snap.id`) instead of
  `get_volunteer_by_user_id`; use `snap.id` for the write (don't rely on a stored `id` field).
- `mentor_checkin`: return `{'success': False, 'error': 'not_approved', ...}` when
  `not volunteer.get('isSelected')`. View maps `not_approved` → **403** with a readable message
  ("Your mentor application hasn't been approved yet."). Checkout stays allowed.
- `/status` response adds `isSelected` and `window` (Part 3). Unknown mentor still 404.
- Tests in `api/volunteers/tests/test_volunteers_service.py`: email-matched mentor can read
  status + check in; unapproved mentor → `not_approved`, no write, no Slack.

---

## Part 2 — Admin: reset check-ins for an event (mentors first, any role)

### What a self check-in writes (why a reset must clear more than one flag)

`mentor_checkin` sets `isCheckedIn`, **`checkedIn`**, `checkInTime`, `timeSlot`, appends
`checkInTimeList`. Consequences of the early check-ins today: the public `MentorAvailability`
shows them "checked in" (`checkedIn === true`), `/mentor` shows "Checked in" (`isCheckedIn`), and
the desk scan on event day will answer `already_checked_in` (no Slack welcome, no `checkedInAt`).

### Backend — `api/checkin/` (existing blueprint; NOT messages_views)

**Route:** `POST /api/checkin/<event_id>/reset/<volunteer_type>` in `checkin_views.py`.

- Gate: **`volunteer.admin` only** (`@auth.require_org_member_with_permission("volunteer.admin",
  req_to_org_id=getOrgId)` — copy the import shape from `api/volunteers/volunteers_views.py`).
  `checkin.admin` desk helpers must NOT be able to reset. `_check_type` as the other routes.
- Body: `{"volunteer_ids": ["…"]}` **or** `{"all": true}`. Neither ⇒ 400 `missing_scope` (an
  empty body must never reset everyone). Cap `volunteer_ids` at 500.
- Response: `{"reset": <n>, "ids": [...], "skipped": [{"id", "reason"}]}`
  (`not_found` | `wrong_event` | `not_checked_in`).

**Service:** `checkin_service.reset_checkins(event_id, volunteer_type, propel_id, volunteer_ids=None)`.

- Candidates: `all` ⇒ stream `volunteers` where `event_id ==` and `volunteer_type ==`; ids ⇒
  `db.get_all` the refs. A doc qualifies when `checkedIn is True` or `isCheckedIn is True` or
  `checkInTime` is set; reject docs whose `event_id`/`volunteer_type` don't match the URL.
- Write per doc, in Firestore batches (≤ 400 writes/batch), **explicit values, no
  `DELETE_FIELD`** (MockFirestore-safe, and every consumer already tolerates null/false):

  ```python
  {
    "checkedIn": False, "isCheckedIn": False,
    "checkInTime": None, "checkedInAt": None, "checkedInBy": None,
    "timeSlot": None, "checkOutTime": None, "checkInDuration": None,
    "checkInTimeList": [], "checkoutTimeList": [],
    "checkin_reset_history": firestore.ArrayUnion([{   # audit: what was cleared, by whom
        "at": now_iso, "by": admin_email_or_name,
        "previous": {k: doc.get(k) for k in ("checkedIn","isCheckedIn","checkInTime",
                     "checkedInAt","timeSlot","checkInTimeList","checkoutTimeList")},
    }]),
    "updated_by": admin_name, "updated_timestamp": now_iso,
  }
  ```
- Privacy: add `checkin_reset_history` to `PUBLIC_VOLUNTEER_DENYLIST`
  (`common/utils/firebase.py`) and to `STAFF_OWNED_VOLUNTEER_FIELDS`
  (`services/volunteers_service.py`; also add `checkedInAt`, `checkedInBy` there — they are
  missing today).
- Caches: `_clear_caches()` (already clears both hackathons_service TTL caches) **plus**
  `volunteers_service._clear_volunteer_caches(user_id, email, event_id, type)` per doc (lazy
  import) so `/api/mentor/application` and `/mentor/me/events` stop serving the old flags.
- Slack: ONE `send_slack_audit(action="reset_checkins", …count, event, type, by)`. **No**
  #ask-a-mentor / team-channel messages and no checkout notification.
- `LEAN_FIELDS`: add `isCheckedIn`, `checkInTime` so the admin dialog can tell an online
  self-check-in (no `checkedInAt`) from a desk scan and show when it happened.
- Tests (`api/checkin/tests/`): service — all vs ids, wrong-event skipped, fields cleared,
  history appended, second reset ⇒ `not_checked_in`; views — `checkin.admin`-only user 403,
  empty body 400, unknown type 404. Update `api/checkin/README.md` + backend CLAUDE.md.

### Frontend — Check-in section (`src/components/admin/checkin/CheckInWorkbench.js`)

Lives at `/admin/hackathons/<event>?section=checkin` (per hackathon, as asked).

- In the "All Checked-In People" header, **full admins only** (`isFullAdmin`), add a
  "Reset check-ins…" button. Opens a new module-scope component
  `src/components/admin/checkin/ResetCheckInsDialog.js`:
  - Role `Select`, default **Mentors**.
  - List of that role's checked-in people from the already-polled `allCheckedInPeople`
    (derive live by id — stale-snapshot rule), each row: checkbox, name, "Online self check-in"
    vs "Desk" (`checkedInAt` present), and the time (`checkedInAt || checkInTime`, event tz).
    All selected by default; "Select only check-ins before the event starts" quick action when
    `start_date` is in the future/known (use `parseLocalDate`).
  - Plain-language consequence line: "They'll show as not checked in on the event page and can
    check in again. Nobody is notified."
  - Confirm button "Reset N mentor check-ins" (disabled at N=0, spinner while posting).
- Call: new `resetCheckIns(eventId, type, ids)` beside the other `/api/checkin` fetches (send
  `volunteer_ids` when a subset is chosen, `{all:true}` only when every listed person is
  selected). On success: `refreshCheckIns(eventId)`, drop `rosterCacheRef.current[key]` for that
  role, toast "Reset N check-ins" through the workbench `snack()` (mirrors to `onSnack` when
  embedded). 404 ⇒ "Reset isn't available on this backend yet."; other errors show
  `body.message || body.error`.
- GA (`EventCategory.ADMIN`): `admin_checkin_reset` `{event_label: type, value: n, event_id}`;
  add to `ga-events-reference.md`.
- Tests: extend `admin/checkin/__tests__/CheckInWorkbench.test.js` — button hidden for
  `checkin.admin`-only, visible for full admin; confirm posts the selected ids to
  `/api/checkin/<event>/reset/mentor`; list refetched after success.

No change to the Volunteer workbench — its "checked in" column/filter read the same fields and
update on its next fetch.

---

## Part 3 — Who can check in, and when (decided by Greg, Nov 10 2026)

Two rules, enforced by the backend and explained by the page:

1. **Only approved mentors (`isSelected`) can check in.**
2. **Check-in opens when the event starts** and closes at the end of its last day.

### Backend

- Helper `mentor_checkin_window(hackathon)` → `{state: "upcoming"|"open"|"closed", opens_at,
  closes_at}` (ISO with offset) in the event timezone (`hackathon.timezone`, default
  `America/Phoenix`): opens 00:00 on `start_date`, closes 23:59:59 on `end_date`. Reuse the
  timezone-aware mode calculation the survey context already has (`api/surveys`) rather than
  writing new date math.
- `mentor_checkin` refuses, in this order, with no write and no Slack:
  `not_approved` → 403; `checkin_not_open` → 409 `{error, message, opens_at}`;
  `checkin_closed` → 409 `{error, message, closes_at}`.
- `mentor_checkout` is **always** allowed (someone still checked in after the event can leave).
- `/status` returns `isSelected` and `window`, so the page never guesses dates client-side.
- Tests: window helper (before/during/after, date-only `start_date`, midnight edge in event tz);
  each refusal code.

### UX spec — one page, five calm states

Design principles (these are the brief; hold the copy to them):

- **A waiting state is a status, not an error.** No warning/red Alerts for pending, not-selected
  or not-open-yet. Use a hairline `.ohx-card` with an eyebrow, a Fraunces heading, one sentence
  of why, and one primary action. Warning styling is reserved for real failures.
- **Answer the three questions a mentor has: Am I in? When can I act? What can I do now?**
  Every state answers all three above the fold.
- **Never show a control that won't work.** Before the event there is no disabled check-in
  button — the card takes its place, in the same slot, so the layout doesn't jump when it opens.
- **Say the time the way the mentor reads it.** Event-timezone date first, the mentor's local
  time in parentheses when it differs (`formatDeadlineMoment` / the dual-tz helper in
  `src/lib/timezoneUtils.js`). Render times only after mount (hydration).
- **Keep the useful parts of the page.** Their profile card, their shifts, and the teams table
  stay visible in every approved state — early visitors are usually there to prepare.
- Gentle, encouraging copy (see the participant-copy rule): no "you must", no "not allowed".

**State A — approved, event hasn't started (`ready` + `window.upcoming`)**

- Eyebrow: `You're confirmed`
- Heading: `Check-in opens {Sat, Nov 14}` (+ `· in 3 days` / `· in 5 hours` under 24h, via `useCountdown`)
- Body: `You're all set — there's nothing to do until the event starts. Check-in opens at the
  start of day one so teams only see mentors who are available right now.`
- If shifts exist: `Your first shift: {Sat, Nov 14 · 9:00 AM – 12:00 PM MST}` (first slot from
  `parseAvailabilitySlots`).
- "While you wait" row (ghost buttons / `.ohx-link`s, max three): `Read the mentor guide`
  (`/about/mentors/overview`), `Join #ask-a-mentor` (`KEY_CHANNELS`), `Meet the teams ↓`
  (scrolls to the table).
- When `opens_at` passes while the tab is open (timer + the existing refocus refresh), the card
  swaps to the normal check-in button without a reload.

**State B — approved, event live (`ready` + `window.open`)** — existing check-in / check-out UI, unchanged.

**State C — approved, event over (`ready` + `window.closed`)**

- Still checked in → keep the "Check out" button only.
- Otherwise: eyebrow `Event complete`, heading `Thanks for mentoring {event}.`, links to
  `/hack/<id>/results` and the feedback survey (`SurveyCTA` already on this page).

**State D — applied, awaiting confirmation (`pending`, includes waitlisted)**

- Eyebrow: `Application received`
- Heading: `Your mentor application is awaiting confirmation`
- Body: `Thanks for offering your time. We review mentor applications by hand, usually within
  about a week, and we'll email you as soon as you're confirmed. Check-in appears here once you
  are.` Waitlisted variant (explicit `status === "waitlisted"` only): `You're on the waitlist —
  we'll email you if a mentor spot opens up.`
- Primary: `Review your application` → `/hack/<id>/mentor-application`. Secondary links: `Your
  mentor dashboard` (`/mentor`), `Join us on Slack`.
- Small hint: `Just got your confirmation email? Refresh this page.` (covers cache lag).

**State E — not selected (`not_selected`; ONLY on explicit review `status === "denied"`, never on a bare `isSelected: false`)**

- Eyebrow: `Mentoring · {event}`
- Heading: `We couldn't offer you a mentor spot this time`
- Body: `Thank you for applying — we had more mentors than spots for this event, and this isn't
  a reflection on you. We'd still love your help:`
- Actions (one primary, two ghost): `Help on a year-round project` (`/projects`, primary),
  `Volunteer at this event` (`/hack/<id>/volunteer-application`, only while the event hasn't
  ended), `See upcoming hackathons` (`/hack`).
- Footer link: `Questions? Contact us` (`/contact`).

**Stale-tab safety:** if a check-in POST comes back `not_approved` / `checkin_not_open` /
`checkin_closed`, don't show an error toast — refetch `/status` and let the page settle into the
matching state above.

**Tell mentors before they hit it:** update the copy that sends people here so nobody arrives
early expecting a button — the `/mentor` dashboard card (approved + upcoming: label the CTA
`Mentor page` and add `Check-in opens {date}`; keep `Open mentor check-in` for live events), the
mentor-application `RemoteCheckInNote`, and the mentor check-in email templates
(`mentor_checkin_reminder`, `checkin_information_mentors` — edit in `/admin/communication`; the
seed file is fallback only) with one line: `Check-in opens when the event starts.`

GA (`page: "mentor_checkin"`): `mentor_checkin_gate_view` `{event_label: gate|window state}` once
per distinct state per visit — lets us see how many mentors arrive early.

Tests: page test asserts each state's heading, that States A/D/E render **no** check-in button
and no `role="alert"`, and that A flips to B when the mocked clock passes `opens_at`.

---

## Rollout

1. Backend PR → `develop` (identity fix, approval + window gate, reset route). Run the
   per-directory pytest for `api/checkin` and `api/volunteers`.
2. Frontend PR → `develop`. Before opening: `npx eslint` on touched files, `npm test`, and
   **`npm run build`** (page-level test must not sit under `src/pages`).
3. On test.ohack.dev, reset the early mentor check-ins for `fall-2026` from the Check-in section.
4. Update frontend `CLAUDE.md` ("Mentor check-in page" + "Check-in permission" sections) and
   backend `CLAUDE.md`.

### PR test plan (click-through on test.ohack.dev)

- `/hack/fall-2026/mentor-checkin`, hard reload ×5 as an approved mentor: spinner → mentor page;
  never "Log in" or "not registered". Switch tabs and come back: no spinner, table filter kept.
- Same URL as: logged out (login panel), logged in with no application (apply CTA), pending
  mentor (awaiting-confirmation, no check-in button), mentor whose application email ≠ login
  email (page + check-in work).
- Before the event starts: "Check-in opens …" card, no button.
- `/admin/hackathons/fall-2026?section=checkin` as full admin: Reset dialog lists the early
  mentors; reset a subset, then all; counts drop; `/hack/fall-2026` mentor availability and
  `/mentor` no longer show them checked in; the mentor's open tab flips to "not checked in" on
  refocus. As a `checkin.admin`-only user: no Reset button, direct POST → 403.
