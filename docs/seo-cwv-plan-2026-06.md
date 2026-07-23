# SEO + Core Web Vitals Plan — June 2026

Source data: GSC Performance export (16 months, to 2026-06-11) + GSC CWV exports (mobile/desktop, to 2026-06-09).
Analysis was verified against live prod (`curl`) and a local `npm run build` proof-of-concept on 2026-06-11.

## Data snapshot (drives priorities)

Top pages by impressions (16 mo):

| Page | Clicks | Impr | CTR | Pos |
|---|---|---|---|---|
| /hackathon-judge | 1,593 | 33,021 | 4.8% | 5.2 |
| /about/judges | 1,226 | 27,632 | 4.4% | 7.7 |
| / | 428 | 13,283 | 3.2% | 8.3 |
| /hack/2025_fall | 456 | 13,137 | 3.5% | 9.3 |
| /hack | 368 | 10,462 | 3.5% | 11.6 |
| /hackathon-judge-opportunities | 397 | 9,445 | 4.2% | 7.3 |
| /hack/2026_spring_wics_asu | 244 | 6,597 | 3.7% | 6.0 |
| /hack/2025_summer | 70 | 6,189 | 1.1% | 11.8 |
| /sponsor | 19 | 5,584 | **0.34%** | 9.5 |
| /nonprofit-grants | 9 | 5,036 | **0.18%** | 9.0 |
| /volunteer | 62 | 4,894 | 1.3% | 7.4 |
| /hackathon-judging | 406 | 4,835 | 8.4% | 7.3 |
| /hackathon-judging-opportunities | 205 | 4,002 | 5.1% | 7.6 |

Query themes: judge-recruitment queries dominate clicks (positions 3–6 already). Untapped: "hackathon judging criteria/rubric/scorecard" (~540 impr, pos 27–58, 0 clicks), "hackathons near me" (400 impr, pos 20), sponsor queries (pos 8–47, ~0 clicks).

CWV (GSC, 2026-06-09): **zero Good URLs on either device.** Mobile: 37 URLs Poor (CLS > 0.25; flipped from "needs improvement" to Poor on June 8), 37 LCP > 2.5s, 25 INP > 200ms. Desktop: 19 Poor CLS, 12 NI CLS.

New SEO pages from the April effort (`/hackathons/arizona`, `/hackathon-for-social-good`, `/hackathon-judging-criteria`) have **zero impressions** in this export.

---

## P0 — Restore site-wide SSR (the root cause; do this first)

**Finding (verified on prod):** every page on www.ohack.dev serves
`<body><div id="__next"></div></body>` — no server-rendered content at all. Pages
without `getStaticProps` (e.g. `/sponsor`, `/hack`) additionally serve an **empty
`<title>`** and no meta description/canonical, because the page-level `<Head>` never
renders server-side. This single issue explains both the CWV collapse (everything
pops in client-side → CLS/LCP poor on every URL) and the terrible CTR on /sponsor
(0.34%) and /nonprofit-grants (0.18%).

**Root cause:** in `src/pages/_app.js`, `AxiosWrapper` is loaded with
`dynamic(..., { ssr: false, loading: () => null })` and **wraps the entire tree**
(ThemeProvider → NavBar → `<Component>` → Footer). With `ssr: false` the wrapper
renders `null` on the server, so nothing below it ever SSRs. The `ssr: true` flags
on NavBar/Footer and all the CLS placeholder work in CLAUDE.md are currently dead
code because of this.

**Fix (proof-of-concept already validated locally — build passes, output verified):**

1. In `src/pages/_app.js`, change the AxiosWrapper dynamic to `ssr: true` (or better,
   convert to a plain static import — the component is SSR-safe: it only registers
   axios interceptors in `useEffect` and renders `<div>{children}</div>`;
   `useAuthInfo()` from PropelAuth works during SSR).
2. Make the `_app` title conditional so it doesn't emit an empty tag on pages that
   define their own: `{pageProps.title && <title>{pageProps.title}</title>}`.

**Validated expected output** (from the PoC build):
- `.next/server/pages/sponsor.html`: full title + description + ~100KB of body HTML.
- `.next/server/pages/hack.html`: full title/desc + ~120KB body.
- `.next/server/pages/hack/2025_fall.html`: real `<title>`, `<h1>`, canonical.

**Verification steps:**
1. `npm run build` (use Node 22 via nvm), then inspect `.next/server/pages/{sponsor,hack}.html` and a few `hack/*.html` for title/desc/body content.
2. `npm run start`, then `curl -s localhost:3000/sponsor | grep '<title>'` etc.
3. Open `/`, `/hack`, `/sponsor`, `/hack/2025_fall`, `/about/judges`, `/projects`,
   `/nonprofits`, `/blog` in a browser and check the console for **hydration
   mismatch warnings** — this is the main risk of re-enabling SSR. Pages that
   branch on `typeof window` or read localStorage during render are suspects.
   Fix any mismatch by deferring browser-only branches to `useEffect`/mount state
   (do NOT re-disable SSR).
4. Confirm logged-in flows still work (the axios interceptor attaches the
   PropelAuth bearer token — log in, open /profile, confirm API calls succeed).
5. After deploy: re-curl prod, then in GSC open both CWV reports and the Page
   Indexing report and start "Validate fix". CrUX is a 28-day rolling window, so
   expect the dashboards to recover slowly even though lab metrics improve
   immediately.

---

## P1 — `/hack/[event_id]` family (third-largest traffic family)

File: `src/pages/hack/[event_id].js`.

1. **Canonical host + slug.** The canonical is currently
   `https://ohack.dev/hack/${event_id}` — wrong host (non-www) and it echoes the
   *requested* slug, so alias URLs self-canonicalize. Change to
   `` `https://www.ohack.dev/hack/${event.event_id || event_id}` `` and apply the
   same to `og:url` and the `rel="alternate"` application links.
2. **Soft-404 fix.** The backend returns `200` + `{}` for unknown event ids, so
   `getStaticProps`'s `res.status === 404` check never fires —
   `https://www.ohack.dev/hack/fall-2025` is live in prod serving an empty-event
   page with `eventData: {}` (verified). Add after parsing:
   `if (!data || !data.id) return { notFound: true, revalidate: 60 };`
   Optional backend hardening (backend repo is in the workspace): make
   `get_single_hackathon` return a real 404 — but the frontend guard is sufficient
   and safer to ship.
3. **Reinstate slug redirects — in the OPPOSITE direction from the deleted ones.**
   History: commit f43caec (May 3) added `YYYY_season → season-YYYY` redirects in
   `next.config.js`; commit 0eedb99 (May 14) removed them (the comment block is
   still there, rules deleted). GSC proves the *underscore* URLs are what ranks
   (`/hack/2025_fall`: 13k impressions; `/hack/fall-2025`: 118 impressions and is
   a soft-404 today). New 2026 events natively use dash ids (`fall-2026`,
   `summer-2026`). So redirect **dash → underscore for legacy years only**:

   ```js
   // next.config.js redirects() — legacy event slug aliases → real event ids.
   // Years ≤ 2025 only: 2026+ events natively use season-year ids (fall-2026).
   {
     source: "/hack/:season(fall|spring|summer|winter)-:year(201\\d|202[0-5])",
     destination: "/hack/:year_:season",
     permanent: true,
   },
   {
     source: "/hack/:season(fall|spring|summer|winter)-:year(201\\d|202[0-5])/:path*",
     destination: "/hack/:year_:season/:path*",
     permanent: true,
   },
   ```

   **Before shipping:** confirm no real legacy event id matches the dash pattern:
   `curl -s https://api.ohack.dev/api/messages/hackathons | jq '[.hackathons[].event_id] // .'`
   (adjust to the actual list endpoint/shape) and check for any `season-20xx` id
   with year ≤ 2025. GSC also shows `/hack/winter-2024`, `/hack/summer-2025`,
   `/hack/fall-2024` variants — all should 301 to their underscore ids after this.
4. **Expired-event recapture.** `/hack/2025_fall` still pulls 13k impressions for
   "asu hackathon" queries. On expired events (`hackathonExpired === true`), render
   a prominent band near the masthead linking to the next upcoming event and
   `/hack` ("This event has ended — see the next ASU hackathon →"). Use
   `useHackathonEvents("current")` or a static link to `/hack#upcoming-events`;
   keep it SSR-friendly (a static link to `/hack` is fine and simplest).

---

## P2 — Host & sitemap hygiene

1. **`frontend.ohack.dev` is indexed** (GSC rows: `/about/judges` 59 impr, `/` 14,
   `/volunteer` 15, etc.) and serves 200s. Add a host-based redirect in
   `next.config.js` `redirects()` (Vercel supports `has` host matching):

   ```js
   {
     source: "/:path*",
     has: [{ type: "host", value: "frontend.ohack.dev" }],
     destination: "https://www.ohack.dev/:path*",
     permanent: true,
   },
   ```

   (Apex `ohack.dev` already 308s to www — verified. `hacker.ohack.dev`,
   `hack.ohack.dev`, `oh.ohack.dev` are separate apps — out of scope.)
2. **`/server-sitemap.xml` is referenced in robots.txt but 404s** (verified; it was
   never implemented). Event/nonprofit/project/blog pages currently have NO sitemap
   coverage (excluded from the static sitemap). Create
   `src/pages/server-sitemap.xml.js` using `next-sitemap`'s `getServerSideSitemapLegacy`
   (pages router), emitting:
   - `/hack/{event_id}` for all hackathons (list API)
   - `/nonprofit/{id}` (npos API)
   - `/project/{id}` (problem statements API — skip if the endpoint is heavy)
   - `/blog/{id}` (news API)
   Cache with `res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate')`.
   If any API call fails, return the rest — don't 500 the sitemap.
3. **Canonical host sweep (www).** ~25 page files hardcode `https://ohack.dev/...`
   in `rel=canonical` / `og:url` / structured-data URLs (≈300 occurrences total;
   `grep -rn 'https://ohack\.dev' src/pages`). Replace with `https://www.ohack.dev`
   — at minimum in every `rel="canonical"` and `og:url` (known files: `hack/index.js`,
   `hack/[event_id].js` + its subpages (`results`, `media`, `agenda`, applications,
   `team/[team_id]`), `hack/results.js`, `projects/index.js`, `nonprofit-grants/index.js`,
   `myfeedback.js`, `praise/*`, `signup/*`, `about/process.js`, `about/index.js`,
   `nonprofits/apply/index.js`). A simple sed across `src/pages` for
   `https://ohack.dev` → `https://www.ohack.dev` is acceptable; review the diff for
   any intentional non-www usage (there shouldn't be any).

---

## P3 — Finish the judge-page consolidation (PR3 follow-through)

State today: `/hackathon-judge`, `/hackathon-judging`, `/hackathon-judging-opportunities`
are live near-duplicate doorways with `rel=canonical` →
`/hackathon-judge-opportunities` (set 2026-04-25, sitemap-excluded). GSC shows Google
**ignoring the canonical hint** — all three still indexed and collecting impressions
(33k / 4.8k / 4k). Conflicting signals dilute the cluster.

Action (mirrors what PR3 already did to `/judge-a-hackathon` + `/judge-hackathon`):
1. Delete `src/pages/hackathon-judge.js`, `hackathon-judging.js`,
   `hackathon-judging-opportunities.js`.
2. Add 301s in `next.config.js` for all three → `/hackathon-judge-opportunities`.
3. Remove their entries from `next-sitemap.config.js` `exclude` (no longer pages).
4. Grep for internal links to the three slugs and update to the canonical
   (`grep -rn "hackathon-judge\b\|hackathon-judging\b\|hackathon-judging-opportunities" src/`).

**Heads-up for Greg (call out in the PR):** `/hackathon-judge` alone carries 33k
impressions at position 5.2. 301s transfer equity but expect a few weeks of ranking
flux on judge queries. The status quo (indexed doorways with ignored canonicals) is
the worse long-term position. If you prefer to defer, it's severable — ship P0–P2
without it.

Keep as-is: `/about/judges` (guide for accepted judges — distinct intent, 27k impr)
and `/judge/[event_id]` (the live judging app), `/judge/overview` +
`/about/judges/overview` (video guides — distinct content, not doorways).

---

## P4 — CTR + internal-link quick wins

1. **/sponsor** (5.6k impr, 0.34% CTR @ pos 9.5): SSR fix (P0) is most of the
   remedy — the page currently serves an empty title to crawlers. Additionally,
   align title with how people search ("hackathon sponsorship", "companies
   sponsoring hackathons"): e.g.
   `Hackathon Sponsorship — Sponsor Tech for Good | Opportunity Hack`, and write a
   description with a concrete hook (reach engineers, 501(c)(3), tax-deductible,
   tiers from $X).
2. **/nonprofit-grants** (5k impr, 0.18% CTR): canonical is non-www (fixed by P2.3).
   Intent mismatch: searchers want cash grants, the page offers free software
   development. Title should make that explicit so the click it does earn converts:
   `Free Software Development for Nonprofits (a Grant Alternative) | Opportunity Hack`.
3. **Homepage pillar links regression:** the refined homepage now links only
   `/coding-for-nonprofits` (`src/pages/index.js:312`); links to
   `/hackathons/arizona` and `/hackathon-for-social-good` were dropped in the
   redesign (CLAUDE.md still claims they exist). Re-add both as `ohx-link`s in
   that same pillar-link block (keep the refined aesthetic — quiet text links, no
   chips/gradients).
4. **/hackathon-judging-criteria has zero impressions** despite matching queries
   with real volume ("hackathon judging criteria" 278 impr pos 27.6, "hackathon
   scorecard" 174 impr pos 39, "hackathon rubric" 64 impr pos 58). It has only 3
   internal links. Add links from:
   - `/about/judges` (27k impressions — the most powerful internal page for this
     topic): a clear "See the full judging criteria & scorecard →" link/section.
   - `/judge/overview` and `/about/judges/overview` video pages.
   After P3, the deleted doorways' links to it are replaced by the canonical page's
   existing link.
5. **/judge/overview** (327 impr @ pos 4.08, **0 clicks**): the title "Judge
   Dashboard Tutorial - 8 Minute Video Guide" wins impressions for
   judging-platform/dashboard queries but no clicks. Rewrite title/desc toward the
   queries actually shown (e.g. `How Our Hackathon Judging Dashboard Works (Video
   Walkthrough) | Opportunity Hack`) and make the meta description answer the
   question directly. Low effort, measurable.
6. **GSC follow-ups (manual, for Greg, not code):** URL-inspect
   `/hackathons/arizona`, `/hackathon-for-social-good`, `/hackathon-judging-criteria`
   to confirm indexing; request indexing after the internal links land.

---

## P5 — CWV beyond the SSR fix

The June 8 mobile flip to Poor (37 URLs, CLS > 0.25) and all-Poor desktop CLS are
dominated by the no-SSR problem (P0). After P0 ships:

1. Re-run Lighthouse (mobile emulation) on `/`, `/hack`, `/hack/2025_fall`,
   `/sponsor`, `/about/judges`. Verify CLS < 0.1 and LCP element is the SSR'd hero
   text/image, not a late-mounted block.
2. Keep every CLS invariant in CLAUDE.md (NavBar/Footer placeholder heights,
   `HeartsLeaderboard` minHeight, iframe aspect-ratio wrappers, explicit img
   dimensions). With SSR actually working now, these placeholders finally matter.
3. Fonts: `RefinedFonts` (Fraunces + Hanken Grotesk, `display=swap`) will now swap
   during SSR paint — watch for font-swap layout shift in Lighthouse. If CLS from
   fonts shows up, add `size-adjust`-tuned fallbacks or preload the two woff2 files
   actually used; don't change `display=swap` globally without measuring.
4. INP (25 mobile URLs > 200ms): expected contributors are the giant hydration
   payloads (MUI-heavy pages). After P0, measure again; if still flagged, the
   biggest wins are deferring below-fold dynamic imports on `/hack/[event_id]`
   and `/` (most are already dynamic). Treat as a measure-first follow-up, not
   part of this change set.
5. After deploy, click **Validate fix** on both GSC CWV reports (mobile + desktop).

---

## Suggested PR slicing (each independently shippable)

1. **PR A (P0):** `_app.js` AxiosWrapper SSR + conditional title. Smallest diff,
   biggest impact. Includes hydration-warning sweep of top pages.
2. **PR B (P1 + P2):** event-page canonical/notFound/expired-CTA, legacy slug 301s,
   frontend.ohack.dev redirect, server-sitemap.xml, www canonical sweep.
3. **PR C (P3):** judge doorway 301s (flag the traffic note to Greg in the PR body).
4. **PR D (P4):** titles/descriptions + internal links.

## Post-deploy verification (prod curl checklist)

```
curl -s https://www.ohack.dev/sponsor | grep -o '<title>[^<]*'        # non-empty
curl -s https://www.ohack.dev/hack/2025_fall | grep -o 'rel="canonical" href="[^"]*"'  # www + underscore slug
curl -sI https://www.ohack.dev/hack/fall-2025 | head -3               # 308/301 → /hack/2025_fall
curl -sI https://frontend.ohack.dev/about/judges | head -3            # 308/301 → www
curl -sI https://www.ohack.dev/hackathon-judge | head -3              # 308/301 → judge-opportunities (PR C)
curl -s  https://www.ohack.dev/server-sitemap.xml | head -5           # 200, XML
curl -s  https://www.ohack.dev/ | python3 -c "import sys;h=sys.stdin.read();print('body bytes:',len(h))"  # ≫ 4KB
```

## CLAUDE.md updates to make when done

- Gotchas: add "AxiosWrapper in `_app.js` must stay SSR-enabled — `ssr: false` there
  disables SSR for the entire site (empty `<body>`, empty titles, CWV collapse;
  June 2026 incident)."
- Core Web Vitals section: note that the placeholder invariants only work because
  the app tree SSRs; nothing in the tree above NavBar may be `ssr: false`.
- Update the homepage pillar-links sentence to match what actually renders.
- Note `/server-sitemap.xml` implementation + what feeds it.
