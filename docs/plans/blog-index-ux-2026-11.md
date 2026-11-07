# `/blog` index — UX + mobile fix (Nov 2026)

Executor: Opus 5.5. Repo: `frontend-ohack.dev`, branch off `develop`. No backend change.
When done, copy this plan to `docs/plans/blog-index-ux-2026-11.md` and reference it from the PR.

## Context

`/blog` (`src/components/Blog/BlogPage.js`) got refined chrome in Oct 2026 but still renders
the list through the legacy `src/components/News/News.js`. Greg's screenshot shows the
"About this blog" sidebar painting over the first post. Measured on test.ohack.dev
(Playwright, 2026-11-07):

| Finding | Evidence |
|---|---|
| **Root cause of the overlap**: `EventCards` is a MUI `Grid container direction="column"` → `display:flex; flex-direction:column; flex-wrap:wrap`. In a *wrapping* column flex container an item's width is not bounded by the container, so each `<article>` (`BlankContainer`, a `Grid` item) is **783px wide inside a 651px column**; the sticky `<aside>` (rendered later) paints over it. | desktop 1485px: column 651, article 783, aside x=916 |
| Same bug clips content off-screen on phones | 390px viewport: feed 340px wide, article still 783px; text cut at the right edge |
| 50 posts × full description + link buttons = **36,612px** tall page on a phone; sidebar at y≈34,900 | mobile scrollHeight |
| Tag cloud: 25 unsorted machine slugs (`#2023-3rd-virtual-codefusion-collective`, Slack channel id `#C01CMCF4BUN`, `#55`) at 9.5px, a **384px block pushing the first post to y=843** on mobile. Prod data has **0** tags, so the block must look right at 0 and at 25+. | tag census test vs prod API |
| Links render as five identical blue pills labelled "link" / "here" / "paid" | test data link names |
| **React #418 hydration errors** (4 per load): `News.formatDate` renders relative time ("3 days ago") + host-tz `toLocaleDateString` → SSR and client disagree. | console log |
| JSON-LD in `News.js`: non-www `https://ohack.dev/...` (violates the canonical-host rule), `JSON.stringify` instead of `serializeJsonLd`, fallback images that don't exist (`/default-news.png`, `/logo.png`), and it duplicates the page's `Blog` node | code |
| Per-card "Original Post" button + copy icon ×50, `console.log` in `gaButton`, GA `search` event fired on **every keystroke** | code |
| Legacy look: elevation shadows + hover lift, contained blue pills, MUI Chips, hardcoded `#1a1a1a` | `News/styles.js` — exactly the regressions the refined system removed |

Decisions (Greg, 2026-11-07): **single reading column, CTA band at the end (no sidebar)**;
**first ~8 posts as cards, the rest as compact rows** so every post link stays in the
server HTML.

## Target design (civic-editorial, same language as `/blog/[blog_id]` and the homepage band)

```
[NavBar]
eyebrow THE OHACK BLOG
h1 Stories from the community.
lead  Updates, success stories … (keep)
muted one-liner: "Posts are AI-summarized highlights from the community Slack · How these posts are made →"  (GitHub link, keeps GA github_code_link)

[search input ………………………………………]  Clear ×          (full width, 44px tall)
Browse by tag:  #tag · 4  #tag · 3  #tag · 3  … (top 8 by count)  Show all 25 ▾
                                                   (nothing renders when there are no tags)
h2 Latest updates                                  "50 posts" / "3 posts tagged #x"

┌ .ohx-card ───────────────────────────────┐
│ [112² thumb]  Nov 4, 2026                 │
│               Chapterstack Updates: Jump In   (Fraunces h3, link)
│               excerpt, 3-line clamp       │
│               #tag #tag   Read the post → │
└──────────────────────────────────────────┘   × 8

eyebrow EARLIER POSTS
──────────────────────────────────────────
  Title (link)                 Aug 9, 2026   ← hairline rows, like FromTheBlog.CompactRow
──────────────────────────────────────────  × rest

[CtaBand] Get involved — Join Slack (primary, keeps GA join_slack) / Next hackathon (ghost)
```

Mobile (≤600px): thumb 72², card padding 16, tag chips wrap (min-height 32 touch target),
rows stack date under title. No horizontal scroll anywhere.

## Changes

### 1. New pure helpers — `src/lib/blogTags.js` (+ `src/lib/__tests__/blogTags.test.js`)
Move the tag logic out of `BlogPage.js`:
- `extractPostTags(post)` → `tags[]` wins, else `#hashtag` regex on `description`, else
  `links[]` whose `url` starts with `#` (same sources as today and as
  `SingleBlogPost.extractTags`).
- `isJunkTag(tag)` → true for Slack channel ids (`/^C[0-9A-Z]{8,}$/`), all-digit tags, and
  tags < 3 chars. Junk is hidden from the cloud but still matches `?tag=` deep links.
- `collectTags(posts)` → `[{ tag, count }]` sorted by count desc then name; junk removed.
- `postMatchesTag(post, tag)` — current case-insensitive logic, verbatim.
- `TAG_PREVIEW_COUNT = 8`.

### 2. New list — `src/components/Blog/PostList.js` (+ `__tests__/PostList.test.js`)
Replaces `News` on `/blog` only. Every piece is **module-scope** (SectionBlock remount lesson).
Only ever rendered inside `RefinedRoot`, so `.ohx-*` classes are safe.
- Props: `{ posts, loading, onTagClick, selectedTag, onPostClick }`.
- `CARD_COUNT = 8`: first 8 of the *current* result set → `PostCard`; the rest → `PostRow`
  under an "Earlier posts" eyebrow (omit the section when there are none).
- `PostCard`: `.ohx-card` (hairline, NO shadow/lift; the card is not itself a link — the
  title and "Read the post →" are, so there are no nested anchors). Thumb via
  `PostImage` from `src/components/Home/FromTheBlog.js` **extended with `ratio` and `sizes`
  props** (`ratio="1 / 1"`, `sizes="112px"`; default stays 16/9 so the homepage is unchanged) —
  it already handles `isCdnImage` → `next/image` vs plain `<img width height>`, `onError`
  → Fraunces initial. Date via `formatPublished(post.published_at || post.slack_ts_human_readable)`
  (`src/lib/blogDisplay.js`, UTC — this is the hydration fix). Excerpt via `blogExcerpt(post)`
  (`src/lib/homeBlog.js`; markdown-aware, 180 chars) with a 3-line clamp. Up to 3
  `.ohx-tag` **buttons** calling `onTagClick` (in-page filter; no `/blog?tag=` navigation).
  Drop from the list: Slack "Original Post", copy icon, external link pills, channel
  buttons — the article page (`SingleNews`) already has all of them.
- `PostRow`: `<li>` hairline row — Fraunces 16px title link + `.ohx-faint` date (mirror
  `FromTheBlog.CompactRow` without the excerpt).
- Loading: 3 skeleton cards built from `var(--surface-2)` blocks (pattern:
  `SingleBlogPost.BlogPostSkeleton`), each reserving the card height (~132px) — no MUI Skeleton.
- Responsive rules in one `<style>` block with a page-scoped class (pattern:
  `FromTheBlog.GRID_CSS`), e.g. `.ohx-blog-card { grid-template-columns: 112px 1fr }` →
  `@media (max-width: 600px) { 72px 1fr }`.
- Posts with a `title` only (no id) are skipped; every `<img>` has width/height.

### 3. `src/components/Blog/BlogPage.js` — rewrite the body, keep the logic
Keep verbatim: SSG-seeded state (`useState(posts)` — the test asserts first-render data),
client fetch fallback when `posts` is empty, `?tag=` URL hydration + `router.replace`
shallow writeback, `clearFilters`, GA `search`/`filter` structured events (**debounce the
search event** — fire 500ms after the last keystroke via `lodash.debounce`, already a dep; the
filter itself stays instant), `initFacebookPixel()` on mount (moved from `News`).
- Remove the `<aside>` and the MUI `Box` grid. Body = `<section className="ohx-wrap">` with an
  inner `.ohx-narrow` (760px) column — same measure as the article page.
- Hero: keep eyebrow/h1/lead; add the muted one-liner with the GitHub link (text must still
  match `/view the blog code/i`? No — the test is updated; use "How these posts are made").
  Keep GA label `github_code_link`.
- Controls: search (44px tall, `font-size: 16px` so iOS doesn't zoom), result count line,
  tag cloud from `collectTags` showing `TAG_PREVIEW_COUNT` + a "Show all N" / "Show fewer"
  text button (`aria-expanded`); the active tag is always shown even if outside the preview.
  Interactive chips use `.ohx-tag` plus inline `padding: 6px 12px; fontSize: 12.5px;
  minHeight: 32px` (the base `.ohx-tag` is a 9.5px display pill, not a touch target).
- Empty state card unchanged. `<PostList …/>`.
- After the list: `CtaBand` from `src/components/design/RefinedPage.js` —
  `eyebrow="Get involved"`, primary `{ href: "/signup", label: "Join Slack" }`, secondary
  `{ href: "/hack", label: "Find a hackathon" }`. **CtaBand's `primary`/`secondary` objects
  have no click handler today** — add optional `onClick` support to both (`primary.onClick`
  passed to the `<Link>`; harmless for the existing callers) so the GA `join_slack` CONVERSION
  event survives. Keep the test's `getByText("Join Slack")` + GA assertion.
- `onPostClick(post, position)` → `ga.trackStructuredEvent(NAVIGATION, CLICK, "blog_list_post",
  null, { post_id, position })`; add the row to `ga-events-reference.md`.

### 4. JSON-LD — one script, www, escaped
- `src/lib/blogJsonLd.js`: add `buildBlogIndexJsonLd(posts)` → the existing `Blog` node from
  `pages/blog/index.js` plus `blogPost: [{ "@type": "BlogPosting", headline, url:
  "https://www.ohack.dev/blog/<id>", datePublished?, image? }]` (lean; `datePublished` from
  the same `publishedDate()` helper, omitted when unknown; no fake fallback images).
- `src/pages/blog/index.js`: render it with `serializeJsonLd` inside `next/head` (raw
  `<script dangerouslySetInnerHTML>` — the Head rule). Remove `BLOG_JSON_LD` constant.
- `News.js` keeps its own (it's only reachable from the dead `HackathonList` compact block).

### 5. Leave alone
`src/components/News/News.js` + `News/styles.js` stay as-is — still imported by
`HackathonList` compact mode (dead code per CLAUDE.md; don't resurrect, don't delete in this
PR). Note in CLAUDE.md that `/blog` no longer uses `News`.

### 6. Tests
- `src/components/Blog/__tests__/BlogPage.test.js`: change the `News` mock to
  `../PostList` (same `{posts, loading}` contract), keep the first-render-seeding assertions,
  update the GitHub-link text query, add: tag cloud shows ≤8 by default + "Show all",
  junk tags hidden, search GA fires once after debounce (fake timers).
- `PostList.test.js`: 10 posts → 8 cards + 2 rows; row/card links point to `/blog/<id>`;
  date renders via `formatPublished` (no "ago"); `onTagClick` called with the tag.
- `blogTags.test.js`: collect/sort/junk/match.
- Jest already mocks `next/link`; mock `next/image` locally the way
  `src/components/Home/__tests__/FromTheBlog.test.js` does (`jest.mock("next/image", …)` →
  plain `<img data-next-image>`). Extend that suite with one case asserting `PostImage`'s
  default ratio is still 16/9 after the `ratio`/`sizes` props are added.

### 7. Docs
- `CLAUDE.md` "Refined" scope: replace the `/blog` clause with: `/blog` renders
  `Blog/PostList` (cards → rows, `.ohx-narrow`, no sidebar, `CtaBand`); `News.js` is only the
  dead `HackathonList` compact consumer; tag helpers in `src/lib/blogTags.js`; dates MUST go
  through `formatPublished` (hydration #418 lesson); MUI `Grid container direction="column"`
  wraps and lets items overflow — never use it as a vertical stack.
- `docs/refined-design-system.md` rollout line for `/blog`; `ga-events-reference.md` row.

## Verification
1. `npm test -- Blog blogTags` green; `npx eslint src/components/Blog src/lib/blogTags.js`.
2. `npx next build` (memory rule: `src/pages` touched → build before the PR).
3. `npm run dev` with cache disabled via CDP (Next 16 stale-chunk gotcha), then Playwright at
   **1440×900 and 390×844** on `/blog`:
   - every `article`/row `getBoundingClientRect().right <= column.right`;
     `document.documentElement.scrollWidth === innerWidth` on mobile;
   - no `Minified React error #418` in the console (hydration);
   - with the TEST backend (`NEXT_PUBLIC_API_SERVER_URL=https://test.api.ohack.dev`, 25 tags):
     first post card top < 650px on 390px, 8 chips + "Show all 25"; with prod data (0 tags)
     the tag block is absent and nothing shifts;
   - `?tag=<x>` deep link filters, chip click updates the URL shallowly, Clear resets;
   - exactly one `application/ld+json` on the page, all URLs `https://www.ohack.dev/…`.
4. Lighthouse mobile on `/blog`: CLS < 0.1 (thumb boxes + skeleton reserve space), no
   tap-target warnings.
5. PR description ends with the click-through list: `/blog`, `/blog?tag=<slug>`,
   `/blog` search "nonprofit", a card → article → "All posts" back, both viewports.
