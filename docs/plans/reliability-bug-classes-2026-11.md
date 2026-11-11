# Reliability plan: the bug classes behind the Nov 2026 mentor check-in fixes

Status: **in progress (Nov 10 2026)** — fact-checked and re-ranked against both repos (see
"Fact-check log" at the end); environment facts verified with `fly status` /
`fly secrets list` / `vercel env ls`. PR branches (all from the default branch):
backend `fix/gateway-key-expiry-sun-6pm` (Phase 5), `feat/team-membership-rules` (Phase 1),
`fix/judge-caller-identity` (Phase 2), `feat/health-env-and-cache-registry` (Phases 3 + 4F);
frontend `fix/gateway-card-guide-parity` (Phase 5), `feat/team-membership-refusal-codes`
(Phase 1), `fix/mentor-panel-tristate-build-info` (Phase 4 D + F), `feat/use-authed-resource`
(Phase 6); hack-llm `fix/key-expiry-sun-6pm` (Phase 5). Frontend + backend PRs go into
`develop` → test.ohack.dev / test.api,
then `main` → www.ohack.dev / api. Backend ships first in every pair.

The mentor check-in work (FE #459/#460, BE #329/#330) fixed three bugs that are not
specific to that page. Each is a **class** that appears elsewhere. Ranked by
user harm × likelihood on event day ÷ cost to fix:

| Rank | Class | How it showed up | Where else it lives (verified) |
|---|---|---|---|
| 1 | **E** Business rules only in the UI | Pending mentors could check in; check-in opened weeks early | `join_team` (`services/teams_service.py:468`) and `queue_team` (`api/teams/teams_service.py:404`) check **nothing** beyond login — no approval, event window or team status. Any logged-in user can join any team through the API. |
| 2 | **B** Identity resolved by one id shape only | Email-matched mentor got 404 from `/status` (BE #329) | The **whole judge flow**: every judge route 403s unless the caller's PropelAuth id equals `judge_id`, and admins assign by `volunteer.user_id`. A judge whose application is stored under another id sees zero teams and cannot score. |
| 3 | **A** Per-process caches cleared on one worker only | Refresh alternated "awaiting confirmation" ↔ "not selected" (BE #330) | 36 `TTLCache`s in 16 files, 27 `@cached` functions, 11 `@redis_cached`; 36 `cache_clear()` + 57 `.clear()`/`clear_cache()` calls. #330 removed the worst case (`redis_cached` fallback ignoring the per-call TTL). |
| 4 | **D** An error rendered as a "no" | 5xx → "You are not registered as a mentor" | ONE real site: `Teams/MentorTeamPanel.js:495` (`r.ok ? r.json() : { is_mentor: false }`). |
| 5 | **F** test ≠ prod configuration, unrecorded | Bugs that only appear in one environment | Missing secrets, machine count, cache backend |
| 6 | **C** Frontend fetch races with auth/token rotation | "Not registered" flashed while PropelAuth resolved (FE #459) | ~90 files have `accessToken` in a dependency array (40 non-admin) — but most are `useCallback` submit handlers, which are harmless. 95 files call `useAuthInfo`, 5 read `loading`. |
| — | **G** Team dashboard AI-gateway copy drifted from the guide | Found while checking `/manageteam` against `ai.ohack.dev/ui/guide/` | `TeamDashboard/GatewayKeyCard.js` + `gatewaySnippets.js` (Phase 5) |

Earlier instances of C/D for reference: `GatewayKeyCard` null crash (data-hook rule),
`/admin/check-in` deciding before `userClass` loaded, `useHackathonAdmin` token rotation.

---

## Environment facts

**Backend (Fly.io, `.github/workflows/main.yml`):** `develop` → `backend-ohack-staging`
(test.api), `main` → `backend-ohack-prod` (api). One `fly.toml` serves both
(`min_machines_running = 1`, auto stop/start).

| | staging (test.api) | prod (api) | Source |
|---|---|---|---|
| gunicorn | 2 workers × 8 threads, `--preload` | same | Procfile, Dockerfile |
| Fly machines | 1 | **2** (one auto-stopped) | `fly status`, Nov 10 |
| `REDIS_URL` | **not set** | **not set** | `fly secrets list`, Nov 10 |
| Independent cache copies | 2 | up to **4** | follows from the rows above |
| `GOOGLE_CAPTCHA_SECRET_KEY` | missing → `verify_recaptcha` returns True | set | code + `fly secrets list` |
| `RESEND_API_KEY` / `STRIPE_SECRET_KEY` / `BACKEND_CRON_TOKEN` | missing | set | `fly secrets list` |
| `STRIPE_HACKER_DEPOSIT_WEBHOOK_SECRET` | missing | **missing** | `fly secrets list` |

**Frontend (Vercel):** `develop` → test.ohack.dev (Preview), `main` → www.ohack.dev
(Production). PropelAuth issuer differs. Full env-var inventory per environment, plus the
concerns it surfaced (store checkout + webhook unconfigured everywhere, dead
`NEXT_PUBLIC_OPENAI_API_KEY` / `NEXT_PUBLIC_AUTH0_*` secrets): **`docs/environments.md`**.

---

## Phase 1 — Class E: enforce participant rules on the server (do first)

1. One backend function `team_membership_rules(caller, team, event)` → `None` or a refusal
   code (`not_approved_hacker`, `event_ended`, `team_join_disabled`, `team_not_joinable`,
   `team_inactive`). Port the rules from the frontend's `lib/teamMembershipApi.js`
   (`teamJoinBlockedReason` / `teamLeaveBlockedReason`) so the two can't disagree. Call it
   from join, leave and queue. `queue_team` needs only the approved-hacker rule.
2. Refusals are a real 4xx with `{error: <code>}` — not the current HTTP-200
   `{message: "Error: …"}`. `teamMembershipApi.js` already rejects on both shapes; map the
   new codes to the existing blocked-reason copy (page settles into the state, no toast).
3. **Before tightening:** grep every frontend caller (`TeamList`, the team page,
   `findteam` → `manageteam` handoff, `CreateTeamFlow`) and write the regression tests
   first (the "trace consumers before gating" rule). `messages_views`/`messages_service`
   are frozen — the rule function lives in `api/teams/`, the legacy route only calls it.
4. Audit table (deliverable: backend CLAUDE.md, route → rule → refusal code):

| Route | Rule | State today |
|---|---|---|
| team join/leave (`/api/messages/team`) | approved hacker, event not ended, joinable status | **not enforced** |
| team create/queue (`/api/team/queue`) | approved hacker | **not enforced** |
| project save/submit (`/api/team/<id>/project`) | member + submission window | enforced (409) |
| peer vote ballot | eligible + window | enforced |
| judge score (`/api/judge/score`) | assigned + round unlocked | enforced (see Phase 2 for identity) |
| mentor panel writes | approved mentor | enforced, shared resolver |
| survey submit | role/eligibility | enforced |

## Phase 2 — Class B: caller identity (backend)

Rule: any lookup of the caller's own volunteer record goes through
`find_volunteer_by_caller_identity` / `_find_volunteer_snapshot` (propel UUID → verified
email → OAuth id). Already used by mentors, peer votes and volunteers views.

1. **Size it first:** query prod for judge volunteer docs for `fall-2026` whose `user_id`
   is empty or not a PropelAuth UUID (Sheets imports, legacy OAuth ids, applied under a
   different login). If zero, steps 2–3 drop to "nice to have".
2. **Judges — do not touch the judging process.** Add `resolve_judge_id(caller, event_id)`
   at the VIEW layer: find the judge doc with the three-way resolver and return its stored
   `user_id` (fall back to the caller id). Use it in place of the six
   `user_id != judge_id → 403` checks in `judging_views.py`, and pass the resolved id to the
   service. Assignments, scores and drafts stay keyed exactly as today.
   `get_judge_event_details` (l.887) gets the resolver too. **Leave l.1061 alone** — those
   are stored ids, not caller ids.
3. `user_is_on_team` matches `users` docs, not volunteer docs — the volunteer resolver does
   not apply. It already tries OAuth id + `propel_id`; add the email fallback only if the
   step-1 style query shows team members it misses. `get_user_event_roles` already does the
   three-way match — fold it onto the shared resolver when next touched, no behaviour change.
4. Tests: shared fixtures — doc keyed by propel UUID, by email only, by legacy OAuth id —
   run against every judge route (200 + correct teams; score accepted).

## Phase 3 — Class A: caches that must agree across processes (backend)

**Recommended: no Redis at first.** The public event page is already behind ISR
(`revalidate: 10`), so the backend caches protect little there, and Firestore reads are
cheap at this traffic.

1. **Ship with this phase:** `/api/health` adds `worker_pid` + `machine_id`
   (`FLY_MACHINE_ID`) so the per-process problem is observable (see Phase 4 for the rest).
2. **Classify** the 27 `@cached` functions + 11 `@redis_cached` in
   `common/utils/cache_registry.py` (`name`, module, TTL, class):
   - `static` — minutes of staleness is fine (news, hackathon list, nonprofit list, github
     issues/activity, slack user lookups, propel identity). Leave as is.
   - `read_after_write` — a user or admin writes and expects to see it:
     `get_single_hackathon_event` (600s), team caches (`_TEAM_USERS_CACHE`, `get_team`),
     problem-statement helpers, judging public schedule, jobs, admin profiles.
     **Drop the cache or cut the TTL to ≤10s.**
3. **Direct reads for the critical path**: routes a person uses to see their own state
   right after a write read Firestore uncached (the `/mentor/checkin/<e>/status` pattern):
   own application, own team, own check-in, own ballot.
4. **Guard test**: imports every module, collects `TTLCache` instances and
   `@cached`/`@redis_cached` functions, fails when one is missing from the registry.
5. **Only if latency data demands it, add Redis** (Upstash via `fly redis create`, one per
   app). Prerequisite: fix `_disable_redis` in `common/utils/redis_cache.py` — today one
   runtime error turns Redis off **permanently for that process**, so after a blip one
   worker is on Redis and the other is local (Class A again). Make it re-probe (e.g. every
   30s) instead.

Verification: hit `/api/health` 20× → see both `worker_pid`s; change a mentor's status in
admin; refresh `/hack/<event>/mentor-checkin` 20× → same state every time. Repeat on prod.

## Phase 4 — Classes D + F: small fixes and environment visibility

**D (frontend, one PR):**
1. `MentorTeamPanel.js:495` → tri-state `isMentor` (`null` = unknown): non-2xx / network
   failure keeps the panel read-only with a quiet "Couldn't confirm mentor access — Retry",
   never "you are not a mentor".
2. CLAUDE.md "Gotchas" rule: a negative or empty state ("not registered", "no teams",
   "not on a team") renders **only** after a successful response; a failed one renders a
   Retry card.
3. **No grep guard.** The ~40 `.catch(() => null|{})` sites are almost all
   `res.json().catch(() => ({}))` parsing an error body — benign; a scan would be noise.

**F (one small PR per repo):**
1. Backend `GET /api/health` (keep the 200 contract and the view's **no-imports** rule —
   read `os.environ` only; importing `redis_cache` pings Redis): `commit_sha`,
   `environment`, `cache_backend` (`REDIS_URL` present → `redis`, else `local`),
   `worker_pid`, `machine_id`, booleans `captcha_configured`, `resend_configured`,
   `stripe_configured`, `cron_token_configured`. Never values.
2. Frontend `/api/build-info`: commit sha (`VERCEL_GIT_COMMIT_SHA`), API URL, auth issuer
   host. Sends its own `Cache-Control: no-store`.
3. `docs/environments.md` (frontend repo, linked from both CLAUDE.md files): the table
   above confirmed with `fly status` / `fly secrets list`, + Vercel env-var names per
   environment, with a "deliberately different" column.
4. Weekly GitHub Action (backend repo) diffing both `/api/health` responses against
   `docs/environments.md`.

## Phase 5 — Class G: team dashboard AI-gateway card matches the guide (frontend)

Checked `TeamDashboard/GatewayKeyCard.js` + `gatewaySnippets.js` (dashboard section
`#ai-gateway` on `/hack/<event>/manageteam`) against `hack-llm/web/guide/index.html` and
the backend's `api/teams/gateway_keys.py`.

**Already right:** endpoint `https://ai.ohack.dev/v1`; bare host for Claude Code; the five
`ANTHROPIC_*` vars; `settings.json`; Cursor / Python / Node blocks; Key 1 $15
(`muse-spark`, `kimi-k2.7-code`, `gpt-oss-120b`), Key 2 $20 (`muse-wonder`, `kimi-k3`);
guide link + per-tool anchors.

**To fix (one PR, tests in `TeamDashboard/__tests__/`):**
1. **curl snippet is multi-line with `\`** — the guide is one line on purpose (multi-line
   breaks in PowerShell and some terminals). Make it one line; hint: "Windows: use
   `curl.exe`".
2. **Claude Code background model on Key 2 bills at the pricier model.** `fastModel` is the
   key's FIRST model; on Key 2 that is `muse-wonder` ($4/$20), so a team that picks
   `kimi-k3` ($2/$10) still runs background calls on `muse-wonder`. The guide says set all
   three model vars to the chosen model. Fix: keep the cheap default only on Key 1; on
   Key 2 use the picked model for all three.
3. **Key expiry: move to Sunday Nov 15, 6:00 PM Arizona (`2026-11-16T01:00:00Z`) and show
   it on the card** (Greg, Nov 10). Today everything says `2026-11-16T07:00:00Z`, labelled
   "Sun Nov 16, 12:00 AM" — that instant is midnight at the end of Sunday, and Nov 16 is a
   Monday. Change, in this order:
   - **Backend** `api/teams/gateway_keys.py` `GATEWAY_KEY_EXPIRES` → `2026-11-16T01:00:00Z`
     (+ the comment, CLAUDE.md, and the `test_gateway_keys.py` fixtures / the
     "3 days before → 259200s" duration test).
   - **hack-llm** `DEFAULT_EXPIRES` in `scripts/provision_keys.py` and
     `scripts/set_key_expiry.py`; the guide fact row + troubleshooting row
     (`web/guide/index.html` l.303, l.553) → "Sun Nov 15, 6:00 PM Arizona time (01:00 UTC
     Mon)"; `docs/team-setup.md` l.27 / l.154; `runbook.md` l.121 / l.126; `DECISIONS.md`
     l.171; `CLAUDE.md` l.15. `scripts/make_key_cards.py` — check the printed cards.
   - **Keys that already exist keep the old expiry.** After both deploys, run
     `scripts/set_key_expiry.py --expires 2026-11-16T01:00:00Z` against the gateway (Greg
     runs it), then spot-check one key's `expires`. The backend also stores `expires` on
     the team doc at mint time — teams minted before the change show the old time until
     re-synced, so the card must not be the only place the new time is announced.
   - **Card:** the gateway-key payload already carries `expires` per key (no backend
     change needed for that). Render "Works until Sun Nov 15, 6:00 PM Arizona time" from
     it via `Intl` in `America/Phoenix`; hide the line when absent. Update the three
     frontend test fixtures that pin the old instant.
   - Judging/demos: confirm nothing on the schedule needs a live key after 6 PM Sunday.
4. **Model chips carry no guidance.** Add a one-line note per model from a single
   module-scope map (what it is, price per 1M tokens, best for): `gpt-oss-120b` is free;
   frontier prices burn the $20 fast; `kimi-k3` accepts `reasoning_effort` low/high/max
   (default max, low is cheapest).
5. **Missing disclosure:** `muse-spark` uses Meta's Contributor tier — prompts and
   generated code may be used for training; teams that object use `gpt-oss-120b`. One
   quiet line under Key 1 linking to the guide's notice.
6. **Budget-spent state:** when spend ≥ budget, say "This key's budget is used up — find an
   organizer" (requests return `budget_exceeded`).
7. **Small parity items:** Node hint "save as `.mjs` or set `"type": "module"`"; a
   one-line pointer to the guide for `muse-spark` gotchas (`max_tokens` ≥ 2000,
   `tool_choice: "auto"` only) and for Cline / Continue (no new snippet tabs).
8. **Keep one source:** prices and model notes exist in three places (guide HTML, LiteLLM
   config, this card). Add a comment in `gatewaySnippets.js` naming the guide file as the
   source, and a test that pins the model names against the backend's two lists.

**hack-llm side (separate small PR there):**
- The local checkout is on unmerged branch
  `kimi-k3.1-pro-effort-passthrough-gptoss-fix` (Kimi K3.1 Pro, $2/$10,
  `reasoning_effort` passthrough). `origin/main` still says "Kimi K3, $3/$15". Merge and
  deploy it before the card copy in item 4 goes out, or the card and the live guide
  disagree on price.
- The guide's top "Key 1" fact row lists only `muse-spark` and `gpt-oss-120b`; the table
  and the backend also allow `kimi-k2.7-code`. Add it to the fact row.

## Phase 6 — Class C: one data hook, migrated opportunistically (frontend)

1. **`src/hooks/use-authed-resource.js`** (generalises `useMentorCheckin`):
   `useAuthedResource(key, fetcher, { enabled, refreshOnFocus, treat404As })` →
   `{ status: "loading"|"ready"|"error", data, error, reload, refresh }`.
   Built in: waits for `useAuthInfo().loading`; token via ref, effect keyed on identity
   (`user?.userId`) + token **presence**; cancels stale runs; `loading` starts true when a
   fetch will fire; background `refresh()` never sets `loading`; 404 configurable as
   "feature off"; a non-2xx is `error`, never empty data.
2. **Migrate only pages whose EFFECTS fetch on the raw token**, participant pages first:
   `manageteam`, `findteam`, `PeerVote/PeerVotePage`, `Survey/EventSurvey`, then
   `use-team-membership`, `use-gateway-key`, `use-team-project`, `volunteer/track`.
   Everything else migrates when next touched — no sweep. `useCallback` handlers that list
   `accessToken` are fine and stay.
3. **Guard test** scoped to `useEffect` dependency arrays containing `accessToken`, with
   an allowlist seeded from today's files and shrunk as files migrate.
4. Per migrated page, the mentor-checkin test shape: auth resolves mid-flight → never the
   logged-out/negative panel; token change → zero requests; 500 → Retry.
5. **Remount lint (optional):** `react/no-unstable-nested-components` at `warn`. Needs
   `eslint-plugin-react` added as a devDependency and registered in `eslint.config.mjs`
   (the flat config loads no plugins today; `.eslintrc.js` is unused by ESLint 9).

## Rollout and verification

Order: Phase 1 (E) → Phase 2 (B) → Phase 3 (A, with `worker_pid`) → Phase 4 (D + F) →
Phase 5 (G; **before Nov 14** — it is event-day copy) → Phase 6 (C). Phase 5 is
independent and can ship in parallel with Phase 1. Each PR: per-directory pytest /
`npm test`, `npm run build` for any `src/pages` change, and a test plan naming the routes
and states to click through.

Verify every phase on **both** environments:
- **test.ohack.dev / test.api** after the `develop` merge — `/api/health` flags and
  `commit_sha`, then the click-through.
- **www.ohack.dev / api** after the release PR — same checks, plus a hard-refresh ×20 on
  one read-after-write flow (prod has more cache copies than test).

## Open decisions for Greg

1. Phase 3: drop/shorten read-after-write caches now and defer Redis (recommended), or
   provision Redis up front?
2. Add test captcha / restricted Resend / Stripe test keys to staging, or keep them off and
   document the gap?
3. Is test.api's missing `BACKEND_CRON_TOKEN` intentional?
4. Phase 5 item 3 (decided Nov 10: keys expire Sun Nov 15, 6 PM Arizona): for teams
   minted before the change, re-stamp the stored `expires` on their team docs so the card
   is right, or accept the card showing the old time for those teams and rely on the
   guide + Slack?

## Fact-check log (Nov 10 2026)

Confirmed: gunicorn 2×8 `--preload`; 36 `TTLCache`s / 16 files; 95 `useAuthInfo` files, 5
reading `loading`; `MentorTeamPanel.js:495`; `verify_recaptcha` returns True with no key;
judging lines 887 / 1061; `/api/health` returns only `{status: "ok"}`.

Corrected from the first draft:
- B was scoped to `get_judge_event_details` only; the id mismatch locks a judge out of
  every judge route (inferred from code — size it with the Phase 2 step-1 query).
- `user_is_on_team` reads `users` docs; the volunteer resolver doesn't apply.
- C: ~90 files (not ~40) list `accessToken` in a dependency array; most are harmless.
- D: one real site; the `.catch(() => null)` guard was dropped as noise.
- A: "~87 `cache_clear()`" = 36 `cache_clear()` + 57 other clears; `_disable_redis` never
  re-enables Redis.
- `eslint-plugin-react` is not installed; "Class E2" was undefined (now "Remount lint").
- E was listed as an audit; `join_team` / `queue_team` are confirmed unenforced.

Verified outside the repos (Nov 10): Fly machine counts + secret names, Vercel env-var
names (see `docs/environments.md`). Still unverified: which hack-llm commit is live at
ai.ohack.dev, and the Phase 2 judge-id sizing query (needs prod Firestore).
