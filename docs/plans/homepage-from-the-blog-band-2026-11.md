# Homepage "From the blog" band

## Context

`/blog` has real, recent content (project launches, event recaps, volunteer asks) but the landing page `/` never mentions it. The only entry points are the NavBar "Blog" link and the `/hack` footer link; the `HackathonList compact` sidebar that once showed news has no callers (dead code). Goal: a calm, refined "From the blog" band on the homepage that shows the three newest posts, server-rendered (no CLS, no client fetch), and links to `/blog`.

Decisions already made with Greg: band sits **after "Two ways in" and before the Newsletter**; layout is **1 featured image card + 2 compact text rows**.

## Data facts (verified against prod API, Nov 7 2026)

- `GET ${NEXT_PUBLIC_API_SERVER_URL}/api/messages/news?limit=3` → `{ text: [doc...], metadata }`. Docs carry `id` (list route only), `title`, `description` (300–500 chars plain text), `content_markdown`/`content_format`, `image` (OpenAI square PNG on `cdn.ohack.dev`, ~1.7 MB each, URLs verified 200), optional `featured_image` (any host — admin-set), `slack_ts_human_readable` (`"YYYY-MM-DD HH:MM:SS"`), optional `published_at` (ISO), `slug`, `status`. Backend already filters drafts/archived and caches 9 h (cleared on every admin write).
- Full 6-post payload is ~19 KB; props must be **projected to a lean shape** so `__NEXT_DATA__` doesn't carry markdown bodies.
- Post URL is `/blog/<id>` (same as `News.js` and `RelatedPosts`).

## Files

### 1. New pure lib: `src/lib/homeBlog.js` (+ `src/lib/__tests__/homeBlog.test.js`)

- `export const HOME_BLOG_LIMIT = 3`
- `blogExcerpt(doc)` — `description` when it's > 40 chars, else `content_markdown` stripped with the same regex as `FeaturedProjects.js::toPlain` (lines 33–39; copy it here as `stripMarkdown`, don't import from a component). Trim to ~180 chars at a word boundary with "…".
- `toHomeBlogPost(doc)` → `{ id, title, excerpt, image, date }` or `null` when `id`/`title` missing. `image = normalizeImageUrl(featured_image || image) || null` (`src/lib/imageUtils.js::normalizeImageUrl`), `date = published_at || slack_ts_human_readable || null` (raw string; formatting happens at render).
- `pickHomeBlogPosts(payload, limit)` — `Array.isArray(payload?.text)` guard → map/filter nulls → slice.
- Tests: description vs markdown fallback, truncation, null on bad doc, non-array payload → `[]`.

### 2. Shared display helpers: `src/lib/blogDisplay.js`

Extract `isCdnImage` and `formatPublished` out of `src/components/News/SingleNews.js` (lines 27–53) into this lib and have `SingleNews.js` import them (behaviour identical; the existing `SingleBlogPost.test.js` keeps passing). `formatPublished` is UTC-stable (no hydration mismatch) — the homepage must use it, **not** `News.js::formatDate` (relative-to-now).

### 3. New component: `src/components/Home/FromTheBlog.js` (+ `__tests__/FromTheBlog.test.js`)

Only ever rendered inside `RefinedRoot`, so `.ohx-*` classes are safe. Everything module-scope (SectionBlock remount lesson). Props: `{ posts, onTrack }`. **Returns `null` when `posts` is empty** (SSG data, so omitting the band causes no layout shift; the fetch-failure case just hides the section).

Structure (paper band — "Two ways in" above it is the sunken one, so the alternation holds):

```
<section className="ohx-wrap" style={{ paddingTop: clamp(56px,9vh,96px), paddingBottom: clamp(40px,6vh,72px) }}>
  header row (flex, baseline, wrap): <Eyebrow>From the blog</Eyebrow> + <h2 className="ohx-display">What we're writing about</h2>
                                     right: <Link href="/blog" className="ohx-link">All posts <Arrow/></Link>   ← the ONE CTA
  <p className="ohx-muted">Project launches, event recaps, and ways to pitch in.</p>
  grid: desktop `minmax(0, 1.35fr) minmax(0, 1fr)`, gap 28; stacks to one column under 760px (use a <style> media query like other refined sections or a MUI Box sx breakpoint — either is fine)
    FeaturedPost  → <Link href=/blog/<id> className="ohx-card ohx-card--hover rise"> (copy the `EventCardRefined`/`FeaturedProjects` card recipe)
                     16:9 image box (`aspectRatio: "16 / 9"`, `background: var(--surface-2)`), then date `.ohx-faint`, h3 `.ohx-display`, 3-line clamped `.ohx-muted` excerpt, "Read the post →" `.ohx-link` text
    CompactList   → <Eyebrow>Older posts</Eyebrow> + 2 rows: hairline `borderTop: 1px solid var(--line)`, h3 (16px Fraunces, link navy on hover), date `.ohx-faint`, 2-line clamped excerpt. Reuse the `RelatedPosts` row styling from `SingleBlogPost.js` 89–162.
```

`PostImage` (module-scope): `next/image fill sizes="(max-width: 760px) 100vw, 560px"` when `isCdnImage(url)`; plain `<img width={560} height={315} loading="lazy" decoding="async">` otherwise; when `url` is null or `onError` fires, render a Fraunces initial placeholder on `--surface-2` (same fallback idea as the store thumbs). The square OpenAI images are cropped by `objectFit: cover` — that's intended.

GA: featured + rows call `onTrack("home_blog_post", title, { post_id, position })`; "All posts" calls `onTrack("home_blog_all_posts", "All posts")`. Both go through the page's existing `track()` (NAVIGATION/CLICK structured event).

Tests (RTL, override the bare `next/link` mock to a real `<a href>` like `src/__tests__/pages/mentor.test.js` 19–26): renders 1 featured + 2 rows with correct hrefs; `null` on `[]`; non-CDN image renders `<img>` not `next/image`; dates render via `formatPublished` ("November 4, 2026").

### 4. `src/pages/index.js`

- `getStaticProps` (385–428): fetch news with the **never-throw** `/blog` pattern (`src/pages/blog/index.js` 101–129) — raw `fetch` with `AbortSignal.timeout(15000)`, validate `Array.isArray(data?.text)`, `blogPosts = pickHomeBlogPosts(data, HOME_BLOG_LIMIT)`, **`revalidate: 3600`** on success; any failure → `blogPosts: []`, `revalidate: 60`. Keep `title`/`openGraphData` byte-identical. (This turns `/` into ISR — intended; the homepage builds at deploy time, so a throw here would fail the Vercel build. New posts appear within ~1 h of publishing.)
- `Home({ blogPosts = [] })`: insert `<FromTheBlog posts={blogPosts} onTrack={track} />` between the "Two ways in" `</section>` (line 324) and the NEWSLETTER comment (line 326). No other section moves.
- Test `src/__tests__/pages/index.getStaticProps.test.js` (`@jest-environment node`, clone of `jobs.getStaticProps.test.js`): 200 → 3 lean posts + 3600; 503 / rejected fetch / malformed payload → `[]` + 60; fetch called with a `signal`; openGraphData unchanged.

### 5. Docs

- `ga-events-reference.md` → add `home_blog_post` / `home_blog_all_posts` under "Navigation & CTA Interactions".
- `CLAUDE.md` "Refined design scope" → one sentence: homepage has a `FromTheBlog` band (SSG via `getStaticProps`, never throws, `revalidate 3600`, lean projection in `src/lib/homeBlog.js`; `HackathonList` compact news block remains dead code — don't resurrect it).

## Non-goals

- No change to `/blog`, `News.js`, NavBar, or the backend. No JSON-LD on the homepage for posts (the blog pages own it).
- Don't delete `HackathonList` compact mode in this PR (mention only).

## Verification

1. `npm test -- homeBlog FromTheBlog index.getStaticProps SingleBlogPost` then full `npm test -- --ci`.
2. `npx eslint src/pages/index.js src/lib/homeBlog.js src/lib/blogDisplay.js src/components/Home src/components/News/SingleNews.js`.
3. `npx next build` (CLAUDE.md rule: any `src/pages` change needs a build) — confirm `/` is listed as ISR and the build never throws when `NEXT_PUBLIC_API_SERVER_URL` is unreachable (run once with it pointed at a dead host to prove the catch path).
4. `npm run dev` against the real API (`NEXT_PUBLIC_API_SERVER_URL=https://api.ohack.dev` is fine for SSG since the fetch is server-side) and open `/` with browser cache disabled (Next 16 stale-chunk gotcha): band appears after "Two ways in", shows the Chapterstack post featured with its image, two older rows, "All posts →" goes to `/blog`, each title goes to `/blog/<id>`; exactly one `<h1>` on the page; no console hydration warnings; mobile width stacks to one column with 16px gutters.
5. Lighthouse on `/`: CLS unchanged (section is SSR'd, image box has a fixed aspect ratio), LCP not regressed (image is `loading=lazy`/below the fold, `sizes` capped at 560px).

## PR test plan (for the description)

- `/` desktop + mobile: band placement, featured image, two rows, links, GA events in the Network tab (`event=navigation_click`, `event_label=home_blog_post`).
- `/blog/<id>` still renders dates/images identically after the `SingleNews` helper extraction.
- Simulate API failure (point env at a dead host, `next build`): homepage builds, band hidden.
