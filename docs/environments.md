# Environments: test vs prod

Verified **Nov 10 2026** with `fly status`, `fly secrets list` and
`vercel env ls --project frontend-ohack-dev` (names only — never values). Re-run those
three commands when this page might be stale; the backend's `GET /api/health` and the
frontend's `GET /api/build-info` report the live picture (commit, cache backend, which
secrets are configured as booleans).

Plan that motivated this page: `docs/plans/reliability-bug-classes-2026-11.md` (Class F).

## Deploy map

| | test | prod |
|---|---|---|
| Frontend | test.ohack.dev — Vercel **Preview** build of `develop` | www.ohack.dev — Vercel **Production** build of `main` |
| Backend | test.api.ohack.dev — Fly app `backend-ohack-staging`, deployed from `develop` | api.ohack.dev — Fly app `backend-ohack-prod`, deployed from `main` |
| Auth (PropelAuth) | `44082960.propelauthtest.com` | `auth.ohack.dev` |
| Firestore | `test-ohack-dev` | `ohack-dev` |
| Check what's live | `test.ohack.dev/api/build-info`, `test.api.ohack.dev/api/health` | `www.ohack.dev/api/build-info`, `api.ohack.dev/api/health` |

Backend ships first in every frontend/backend PR pair.

## Backend (Fly.io)

| | staging (test.api) | prod (api) | Deliberately different? |
|---|---|---|---|
| gunicorn | 2 workers × 8 threads, `--preload` | same | no |
| Fly machines | **1** (sjc, started) | **2** (sjc; one running, one auto-stopped) | yes — prod scales on load |
| `REDIS_URL` | not set | not set | no — both use per-process local caches |
| Independent cache copies | 2 (1 machine × 2 workers) | up to **4** (2 × 2) | follows from the rows above |
| `GOOGLE_CAPTCHA_SECRET_KEY` | **missing** → `verify_recaptcha` returns True | set | open decision 2 |
| `STRIPE_SECRET_KEY` | **missing** | set | open decision 2 |
| `RESEND_API_KEY` | **missing** (only the two `RESEND_*_KEY` variants are set) | set | open decision 2 |
| `BACKEND_CRON_TOKEN` | **missing** | set | open decision 3 |
| `STRIPE_HACKER_DEPOSIT_WEBHOOK_SECRET` | missing | **missing** | see concerns |

Secret names on **staging**: `CLIENT_ORIGIN_URL ENC_DEC_KEY FIREBASE_CERT_CONFIG FLASK_APP
FLASK_ENV FLASK_RUN_PORT OPENAI_API_KEY PORT PROPEL_AUTH_KEY PROPEL_AUTH_URL SLACK_BOT_TOKEN
SLACK_WEBHOOK BACKEND_NEWS_TOKEN GCLOUD_CDN_BUCKET CDN_SERVER GOOGLE_APPLICATION_CREDENTIALS
RESEND_WELCOME_EMAIL_KEY README_API_KEY BACKEND_PRAISE_TOKEN NEXT_PUBLIC_OPENAI_API_KEY
GITHUB_TOKEN RESEND_EMAIL_STATUS_KEY SENTRY_DSN GATEWAY_KEY_ENCRYPTION_KEY LITELLM_MASTER_KEY`.

**Prod** = the same list plus `GOOGLE_CAPTCHA_SECRET_KEY STRIPE_SECRET_KEY RESEND_API_KEY
BACKEND_CRON_TOKEN`.

## Frontend (Vercel project `frontend-ohack-dev`, team `ohack`)

test.ohack.dev is a Preview deployment, so it reads the **Preview** column.

| Variable | Production | Preview (test.ohack.dev) | Development | Deliberately different? |
|---|---|---|---|---|
| `NEXT_PUBLIC_API_SERVER_URL` | own value | own value | = Preview | yes — api vs test.api |
| `NEXT_PUBLIC_REACT_APP_AUTH_URL` | own value | own value | = Preview | yes — PropelAuth prod vs test issuer |
| `NEXT_PUBLIC_API_NODEJS_SERVER_URL` | own value | own value | = Preview | yes |
| `NEXT_PUBLIC_GOOGLE_CAPTCHA_SITE_KEY` | own value | own value | = Preview | yes (pairs with the backend secret, which staging lacks) |
| `NEXT_PUBLIC_GOOGLE_ANALYTICS` | own value | own value | = Preview | yes — keep test traffic out of GA |
| `NEXT_PUBLIC_FACEBOOK_PIXEL_ID` | own value | own value | = Preview | yes |
| `NEXT_PUBLIC_SLACK_SIGNUP_LINK` | own value | own value | = Preview | probably not |
| `NEXT_PUBLIC_AUTH0_*` (5, incl. `USER_MGMT_SECRET`) | set | set | set | dead — see concerns |
| `NEXT_PUBLIC_GOOGLE_ADS_ID` | set | — | — | yes — no Ads tag on test |
| `GOOGLE_ADS_BLOG_CONVERSION_LABEL` | set | — | — | yes |
| `STRIPE_SECRET_KEY` | set | set | — | — |
| `NEXT_PUBLIC_OPENAI_API_KEY` | set | set | set | dead — see concerns |
| `SITE_URL` | — (falls back to `https://www.ohack.dev`) | set | set | yes — robots.txt disallows everything on test |
| `PORT` | — | set | set | — |

Referenced by the code but **not set in any environment**: `STRIPE_STORE_WEBHOOK_SECRET` /
`STRIPE_WEBHOOK_SECRET`, `STORE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`,
`NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_LMS_CONVEX_URL`, `NEXT_PUBLIC_SLACK_TEAM_ID`,
`NEXT_PUBLIC_GA_PROPERTY_ID`, `THREADS_*`. Most have a code default; the store ones don't
(see concerns). Vercel-provided at build/run time: `VERCEL_ENV`, `VERCEL_GIT_COMMIT_SHA`,
`VERCEL_GIT_COMMIT_REF`.

`vercel env ls` lists project-level variables only; a team-level shared variable would not
show here. If something below looks wrong, check the team's shared env vars first.

## Concerns for Greg

1. **The online store can't take payments in any environment.** `/store/cart`
   `handleCheckout` returns "Stripe is not configured" when
   `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is missing (it is, everywhere), and
   `/api/store/webhook` answers **500 "Stripe is not configured"** to every Stripe delivery
   because neither `STRIPE_STORE_WEBHOOK_SECRET` nor the legacy `STRIPE_WEBHOOK_SECRET` is
   set — so even a completed checkout would never be recorded (Stripe retries, then gives
   up). `STORE_WEBHOOK_SECRET` (the `X-Webhook-Secret` header the webhook sends to the
   backend) is missing too. Either set all three in Production or hide the store.
2. **Hacker deposits:** the backend webhook `POST /api/webhooks/stripe/hacker-deposit` needs
   `STRIPE_HACKER_DEPOSIT_WEBHOOK_SECRET`, which neither Fly app has. Harmless while
   `constraints.hacker_deposit.enabled` is off; required before any event turns deposits on.
3. **`NEXT_PUBLIC_OPENAI_API_KEY` is set in all three Vercel environments and as a secret on
   both Fly apps, and nothing references it** (no `process.env.NEXT_PUBLIC_OPENAI_API_KEY`
   in `src/` or `next.config.js`; the backend reads only `OPENAI_API_KEY`). Next only inlines
   `NEXT_PUBLIC_*` variables that the code references, so it is not in the bundle today —
   but the `NEXT_PUBLIC_` prefix means the moment any file reads it, the key ships to every
   browser. Recommend deleting it from Vercel and from both Fly apps, and rotating the key
   if it was ever referenced in an older build.
4. **The five `NEXT_PUBLIC_AUTH0_*` variables are dead** (Auth0 was replaced by PropelAuth;
   zero references in `src/`). `NEXT_PUBLIC_AUTH0_USER_MGMT_SECRET` is a *secret* with a
   public prefix — same risk as #3. Recommend deleting all five.
5. **Staging can't exercise captcha, Resend broadcasts, Stripe or the reminder cron** — open
   decisions 2 and 3 below.

## Open decisions

2. Add a test reCAPTCHA secret, a restricted (test-domain) Resend key, and Stripe **test**
   keys to `backend-ohack-staging` — or keep them off and accept that those paths are only
   exercised on prod? Without the captcha secret, `verify_recaptcha` returns True on
   staging, so a captcha regression can't be caught on test.
3. Is staging's missing `BACKEND_CRON_TOKEN` intentional (so the hourly deadline-reminder
   GitHub Action can't post from test)? If yes, mark it "deliberately different" above.

## Keeping this page true

- After changing a Fly secret or a Vercel variable, update the matching row here in the
  same change (and say whether the difference is deliberate).
- `GET /api/health` (backend) reports `commit_sha`, `environment`, `cache_backend`,
  `worker_pid`, `machine_id` and `*_configured` booleans; `GET /api/build-info` (frontend)
  reports `commit_sha`, `vercel_env`, `api_host`, `auth_issuer_host`. A weekly backend
  GitHub Action diffs both health responses against this page (Class F item 4).
