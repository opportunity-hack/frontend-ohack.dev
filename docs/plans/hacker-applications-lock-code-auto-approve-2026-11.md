# Hacker applications: soft deadline, manual lock + access code, auto-approve with capacity

## Context

`/hack/[event_id]/hacker-application` hard-closes 3 days before kickoff (8 PM event tz) unless the admin flips `application_hacker_force_open`. Greg wants the deadline to stay as a **nudge** ("apply before Nov 11") while applications actually stay open until an admin **manually locks** them, with an **access code** (like judges) that lets late applicants apply or update after the lock. Separately, on event day ~10 walk-ins show up unregistered; admins want an **auto-approve** switch so every hacker who applies lands on the roster immediately, capped at an admin-set **capacity** (Fall 2026: first 90) that is also stated on the public form.

Decisions confirmed with Greg (Nov 7 2026):
- Auto-close at the deadline becomes **opt-in** (new switch, default off). `application_hacker_force_open` is retired.
- Auto-approve applies to **new applications AND updates by still-pending applicants** (never `denied`/`withdrew`/`no_show`).
- Form shows the **capacity statement only** (no live spots-left count).
- The hacker access code unlocks **both** the manual lock and the "event ended" wall.

Findings that shape the plan: the backend never enforces the deadline (frontend-only gate) and accepts any new `constraints` key (`validate_hackathon_data_partial` only type-checks known keys). The judge passcode (`application_judge_enabled` + `application_judge_enabled_code`) is client-side only. Nothing today ever sets `isSelected=True` automatically; `create_or_update_volunteer` seeds `False` on create and carries the stored value forward on update. Two latent bugs get fixed on the way (see §4).

## Constraint keys (all under `hackathon.constraints`, autosaved via `admin.setConstraint`)

| Key | Type | Meaning |
|---|---|---|
| `application_hacker_enabled` | bool, **missing ⇒ open** | existing; the hacker form starts honoring it as the manual lock (today only `EventLinks` reads it) |
| `application_hacker_enabled_code` | string | NEW — mirrors `application_judge_enabled_code`; unlocks lock + event-ended wall |
| `application_hacker_close_at_deadline` | bool, default false | NEW — opt-in: lock automatically once the computed deadline (start − 3d, 8 PM) passes |
| `hacker_auto_approve` | bool, default false | NEW — every qualifying submit/update sets `isSelected=true` server-side |
| `hacker_capacity` | int ≥ 1 or null | NEW — roster cap; null = no limit; shown on the form |
| `application_hacker_force_open` | — | RETIRED: removed from admin UI, no longer read |

## 1. Backend (`backend-ohack.dev`) — deploy first

**`common/utils/validators.py`** (`validate_hackathon_data_partial`, constraints block ~L510): add checks next to the `peer_vote_*` ones — `application_hacker_enabled_code` str ≤ 64 (empty string allowed = no code), `application_hacker_close_at_deadline` bool, `hacker_auto_approve` bool, `hacker_capacity` int (not bool) 1..10000 or None. Invalid → `_skip` + pop, same style.

**`services/volunteers_service.py`**
- Hoist a `_hackathon_constraints(event_id)` helper (one `hackathons` query, like `_hackathon_for_confirmation`) and make the existing required-questions block (~L1197) use it, so hacker submits read `constraints` once.
- New pure-ish `_hacker_roster_decision(event_id, constraints) -> "approved" | "waitlisted" | None`: `None` unless `volunteer_type == "hacker"` and `hacker_auto_approve is True`; else count `volunteers` where `event_id == X and volunteer_type == "hacker" and isSelected == True` (Firestore `.count()` aggregation, falls back to streaming `.select([])` if unavailable) and return `"approved"` when `hacker_capacity` is None or count < capacity, else `"waitlisted"`. Read-then-write race is accepted at this volume (~10 walk-ins) — document it.
- **Create branch** (~L1330): when decision is `approved` → `isSelected: True`, `status: "approved"`, `auto_approved: True`, `auto_approved_at: ts`; when `waitlisted` → `status: "waitlisted"`, `auto_approved: False`.
- **Update branch** (~L1266): compute the decision only when `existing.isSelected` is falsy AND `existing.status` (lower-cased) not in `("denied","withdrew","no_show")`; `approved` → same fields as above (otherwise keep the carry-forward). Never un-approve.
- When a doc was auto-approved: call `get_volunteer_by_event.cache_clear()` (already imported/used at ~L1451) and `send_slack_audit(action="auto_approve_hacker", …)` mirroring `update_volunteer_selection`.
- **`send_volunteer_confirmation_email`**: add `roster_outcome: Optional[str] = None`. `"approved"` (hacker) → subject `"[Confirmed] You're in — Opportunity Hack Hacker application"`, green banner "✅ You're confirmed — you're on the roster" with links to `/hack/<event_id>/hacker-application` (check-in QR) and `/hack/<event_id>/manageteam`, intro line without "our team will review it". `"waitlisted"` → amber banner "The event is at capacity — you're on the waitlist; we'll email you if a spot opens." Pass it from both branches. Keep the email gentle (feedback memory: encouraging participant copy).
- Fields `auto_approved` / `auto_approved_at` are NOT added to `STAFF_OWNED_VOLUNTEER_FIELDS` strips? — they must be: add both so a crafted payload can't claim them.

**`api/volunteers/volunteers_views.py` `handle_submit`** (~L128-137): if `result` is a dict with `"error"`, return `_error_response(result["error"], 400)` instead of wrapping it in a 200 success (bug: wrong screening answers currently show the success screen).

**Tests** (`api/volunteers/tests/test_volunteers_service.py`, existing MockFirestore patterns): create → approved; create at capacity → waitlisted; update of pending → approved; update of `denied` → untouched; `hacker_auto_approve` off → `isSelected False`; validators accept/reject the four keys; `handle_submit` 400 on `{"error"}`.

## 2. Frontend — hacker form `src/pages/hack/[event_id]/hacker-application.js`

**Gate computation (L586-649)** — replace the `forceOpen` logic:
```
deadlinePassed = now.isAfter(applicationDeadline)
isEventPast    = endDate + 1d < now                      (unchanged)
isLocked       = constraints.application_hacker_enabled === false
              || (constraints.application_hacker_close_at_deadline === true && deadlinePassed)
passcode       = constraints.application_hacker_enabled_code || null
```
Store `isLocked`, `isEventPast`, `deadlinePassed`, `passcode`, `hackerCapacity`, `autoApproveOn` on `eventData`; drop `isApplicationsClosed`. New state `unlocked` (false) + `passcodeInput`/`passcodeError`; `isClosed = (isLocked || isEventPast) && !unlocked`.

**Closed rendering (L2125-2234)**: one closed panel. If `passcode` → "Access code required" + the unlock form (new shared `src/components/ApplicationForm/AccessCodeForm.js`: controlled TextField `type="password"` + "Unlock application" button, trim-compare, `onUnlock`; copied from judge's `handlePasscodeSubmit`/form at `judge-application.js:651-746` — judge keeps its own for now, migrating is opportunistic). Below it the reason: event ended → existing "This event has already ended" copy + GiveButter widget; locked → "Applications are closed for this event. If the organizers gave you an access code, enter it above." (no "deadline passed" wording unless `close_at_deadline` tripped it, in which case keep the existing "The deadline passed on …" sentence). Keep the event/other-events buttons. GA `hacker_app_unlocked` on success.

**`handleNext` (L1204-1219) / `handleSubmit` (L1357-1372) / button disable (L2521-2527)**: use `isClosed` only; drop the wrong "The hackathon has already started" message.

**Deadline card (L2394-2473)** — keep the pre-deadline copy verbatim. After `deadlinePassed` while still open: heading "Still open — apply now", body "Our priority deadline was {formattedApplicationDeadline}. Applications are still being accepted, so get yours in as soon as you can." Hide the "Deadline is close…" line once passed. Header "Apply by {date}" (L2043) → "Apply by {date}" before, "Still accepting applications" after.

**Capacity statement** (same card, when `hackerCapacity`): "This event has room for {N} hackers. Spots are confirmed first come, first served — applying early is the best way to secure yours." When `autoApproveOn` add: "Applications are being confirmed as they come in right now." Also add the capacity line to the pending-review Alert on the success screen.

**Submit response + success screen (L1494-1500, L1851-1877)**: the backend wraps the doc in `responseData.data` (bug: today it always falls back to `user.userId`). Read `payload = responseData?.data ?? responseData`, set `volunteerId = payload.id`, `setIsSelected(!!payload.isSelected)`, keep `rosterOutcome = payload.isSelected ? "approved" : payload.status === "waitlisted" ? "waitlisted" : null`. Success screen branches: approved → Eyebrow "You're confirmed", h1 "You're *in.*", Alert "You're on the roster for {event}. Save your check-in QR code below…", render `VolunteerCheckInQR` + `ShareCardPromo` (same `Boolean(volunteerId) && isSelected` gate the form body uses) and a "Set up your team →" link to `/hack/<id>/manageteam`; waitlisted → "The event is at capacity. You're on the waitlist and we'll email you if a spot opens."; otherwise existing copy. Also surface `errorData.error` from a 400 in the catch (pairs with the backend fix).

## 3. Admin — `src/components/admin/hackathon-edit/sections/ParticipantsSection.js`

- `ToggleRow`: add `showChildrenWhenOff` prop (children render when `checked || showChildrenWhenOff`). Use it on the hacker and judge rows so the access-code fields are reachable while locked (today the judge code field is hidden exactly when it matters). Hacker + judge `checked` become `constraints.application_X_enabled !== false` to match how the forms and `EventLinks` read the flag (missing ⇒ open); mentor/nonprofit/sponsor rows unchanged.
- Hacker row subtitle: "On = open. Off = locked; only people with the access code can apply or update." Children: External URL (unchanged); **Hacker access code** TextField (helper: "Share with late applicants or anyone updating after you lock. It also works after the event has ended."); **"Close automatically at the deadline"** Switch → `application_hacker_close_at_deadline`, caption showing the computed deadline ("{Weekday, Mon D} at 8:00 PM {tz} — 3 days before kickoff; off by default, the form only nudges") using `formatDeadlineMoment`/`safeParse` from `src/lib/timezoneUtils.js` on `hackathon.start_date`; remove the Force-open switch.
- New `SectionContainer` **"Roster & capacity"** (autosave) between Applications and Teams: **Hacker capacity** number field (`hacker_capacity`; blank → `null`; helper "Shown on the application form. Auto-approve stops adding people once the roster reaches this number. Leave blank for no limit.") and **Auto-approve hacker applications** Switch (`hacker_auto_approve`; caption "Every new or still-pending hacker application goes straight onto the roster (until capacity). Turn on the morning of the event for walk-ins; turn off afterwards. Denied applications are never auto-approved."). Link "Manage the roster in the Volunteer section" → `?section=volunteer`.
- No change to `useHackathonAdmin` (constraints already autosave; not in an explicit-save set — note that while Screening/Deposit/Meals are dirty, constraints wait for that Save, pre-existing).

## 4. Other touch points

- `src/components/Hackathon/EventLinks.js` already shows "(Closed)" from `application_hacker_enabled !== false` — no change.
- `src/components/admin/volunteer/applicationSchema.js`: nothing required (unknown keys like `auto_approved` surface under "All submitted fields" automatically); optionally add `auto_approved`/`auto_approved_at` to `SYSTEM_KEYS` with labels "Auto-approved" / "Auto-approved at" so they export cleanly.
- `CLAUDE.md` (frontend): update the Participants/"Hacker `isSelected` gating" notes: new keys, force-open retired, the backend auto-approve hook, the `responseData.data` fix, and the handle_submit 400 fix. Backend CLAUDE.md: the auto-approve rule + race note.
- GA: `hacker_app_unlocked`, `hacker_app_auto_approved` (success screen, label approved|waitlisted); admin `admin_hacker_auto_approve_toggle`. Add to `ga-events-reference.md`.

## Verification

Backend: `pytest api/volunteers/tests -q` (conda `py310_ohack_backend_16APR24`; empty Slack vars). Frontend: `npm test -- hacker` + add `src/__tests__/pages/hacker-application.gates.test.js` covering: open before deadline; deadline passed + close_at_deadline off ⇒ form renders with "Still open" card; `application_hacker_enabled=false` + no code ⇒ locked panel; with code ⇒ unlock form, wrong code error, right code shows form; event ended + code ⇒ unlocks; success screen with `data.isSelected=true` shows the confirmed state + QR. Run `npx next build` (src/pages rule) and `npx eslint` on touched files.

Click-through (local backend on :6060 against TEST Firestore, dev server with CDP cache disabled):
1. `/admin/hackathons/<test event>?section=participants` — toggle hacker lock off/on, set a code, see the computed deadline caption, set capacity 2 + auto-approve on; confirm the PATCH persists (reload).
2. `/hack/<test event>/hacker-application` as a fresh user: capacity line visible; submit → "You're in" + QR. Second user → in. Third user → waitlist copy; Volunteer section shows statuses approved/approved/waitlisted.
3. Lock the form; visit again → locked panel; enter the code → form; update the application; verify the roster didn't change for an already-approved user.
4. Turn `close_at_deadline` on for a past-deadline event → locked panel with the "deadline passed" sentence; code still unlocks.

## Execution notes (for whoever implements this)

- Repos: frontend `/Users/gregv/dev/fresh_ohack/frontend-ohack.dev` (branch off `develop`), backend `/Users/gregv/dev/fresh_ohack/backend-ohack.dev` (branch off `develop`). Backend ships first; every new frontend read of a constraint must tolerate the key being absent.
- Production state on 2026-11-07 for `fall-2026`: `application_hacker_enabled: true`, `application_hacker_force_open: false`, start `2026-11-14`, end `2026-11-15`, tz `America/Phoenix`. Nothing needs flipping in prod before deploy; after deploy the stale `force_open` value is ignored. Set `hacker_capacity: 90` for fall-2026 in the admin UI after deploy.
- `application_hacker_close_at_deadline` is the inverse-default replacement for `application_hacker_force_open` (open is now the default; the switch opts INTO the 3-days-before auto-close). Do not reuse the old key.
- Follow the frontend `CLAUDE.md` rules that apply here: no test files under `src/pages` (page tests go in `src/__tests__/pages/`), run `npx next build` before opening the PR, keep gentle participant-facing copy, `trackEvent({action, params})` signature, and the PR description must end with a page-level click-through test plan.
- Backend: new code goes in `services/volunteers_service.py` / `common/utils/validators.py` / `api/volunteers/volunteers_views.py` only; never touch `api/messages/messages_views.py`. Run tests with the conda env `py310_ohack_backend_16APR24` and empty Slack env vars.
