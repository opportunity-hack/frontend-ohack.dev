# OHack Frontend Development Guidelines

## "Refined" design scope (civic-editorial facelift)
Full spec + rollout checklist: **`docs/refined-design-system.md`** (read this before extending the look to more pages). Migrated so far: `/` (`src/pages/index.js`), `/projects` (`src/components/ProjectList/*`), the global NavBar (incl. a refined mobile layout — centered logo + refined dropdown), `/about`, `/about/judges`, `/about/mentors` (`Mentorship` rewritten as refined sections), `/about/success-stories`, `/about/completion`, `/sponsor`, `/nonprofits` (`NonProfitList` + new calm card `NonProfitListTileRefined`; original `NonProfitListTile` stays for event pages), `/blog` (`BlogPage`; reused `News` list kept), `/onboarding` (refined chrome; wizard logic intact), `/volunteer`, `/about/hackers`, `/praise` (refined chrome; `PraiseBoard` feed kept), `/profile/[userid]` public (`PublicProfile`), and a chrome-only facelift on the own `/profile` editor (`Profile.js` — fonts + navy tab strip only; form logic untouched). **Harmonized (not full rewrite):** `/hack` index (keeps its bespoke finder + `HackPageNav`; hero/CTAs/Support band recolored via inline `RX` tokens) and `/hack/[event_id]` (just `<RefinedFonts/>` + Fraunces title in `HackathonHeader` — too large/component-heavy for a full pass). Pattern for new pages: keep `Head`/`getStaticProps`/schema verbatim, add `<RefinedFonts/>`, wrap body in `<RefinedRoot>`, rebuild sections with `.ohx-*` classes, one `<h1>`, preserve GA.

The homepage and projects page were reimagined away from the old busy/multi-gradient look into a calm "civic editorial" system. Shared tokens + utility classes live in `src/components/design/refined.js`:
- `<RefinedRoot>` — a `styled('main')` scope that defines CSS variables (`--paper`, `--ink`, `--brand` deep navy `#1B3A6B`, `--accent` terracotta `#E2552E`, `--display` Fraunces, `--body` Hanken Grotesk) and utility classNames (`.ohx-wrap`, `.ohx-display`, `.ohx-eyebrow`, `.ohx-lead`, `.ohx-btn(--primary|--ghost)`, `.ohx-link`, `.ohx-card(--hover)`, `.ohx-tag(--accent)`, `.ohx-sponsors` grayscale logos, `.rise` staggered load anim w/ `animationDelay`). Everything is scoped — it does NOT touch the global MUI light theme.
- `<RefinedFonts />` — Google Fonts `<link>`s (Fraunces + Hanken Grotesk, preconnect + `display=swap`); drop into each page's `next/head`.
- `Eyebrow`, `Stat`, `Arrow` — small shared presentational atoms.
- Rule of thumb here: one accent color, hairline rules, generous whitespace, ONE primary CTA per section. Don't reintroduce colored chips/gradients — that's the "too busy" regression we removed.
- `LeadForm` gained a `bare` prop (drops its lavender box + icon + "Stay in the loop" heading) so the homepage newsletter band provides its own calm framing.
- `useHackathonEvents` now returns `loading` (was destructured but never returned). Homepage uses it to reserve event-grid space (CLS).
- Projects page no longer uses `ProjectList/filters/*` (FilterBar/ProjectSearch) or the `LoginOrRegister` banner — ProjectList has its own inline search + sort `<select>` + quiet status-toggle tags. Those filter files are now orphaned but left in place.
- **Next dev gotcha (verifying these pages):** Next 16 dev chunks are NOT content-hashed, so the browser serves stale JS across hard navigations even after a successful Fast Refresh rebuild. To verify a change visually, disable cache via CDP (`Network.setCacheDisabled` + `clearBrowserCache`) — a plain reload/`?cachebust` will keep showing the old bundle.

### Global NavBar (part of the refined look — applies site-wide)
`src/components/Navbar/Navbar.js` + `styles.js` were restyled from the solid-blue MUI AppBar to a light, frosted "civic editorial" bar so it's cohesive with the refined pages everywhere: `backgroundColor: rgba(251,250,246,0.82)` + `backdropFilter: blur` + `borderBottom: 1px solid #E7E1D4`, `elevation={0}`, ink (`#16181D`) links, hover → brand navy `#1B3A6B`. Load button is a squared navy button (no more 1.5rem rounded pill). Links are sentence-case (`textTransform: none`) — keep the page-link `<Button>`s and the dropdown `NavbarButton`s in sync or the casing diverges (MUI Button defaults to uppercase). Logo swapped from the white wordmark to `OpportunityHack_Logo_Dark_Blue_Banner.png` (3:1) so it shows on the light bar; the matching `<link rel=preload>` was updated too. **Don't** change the SSR/64px-height/fixed-width-auth-slot invariants (CWV). Nav link font is a Hanken-Grotesk-with-system-fallback stack; the webfont only loads on the two refined pages, so elsewhere it renders in system-ui (intentional — avoids a global font load).

## Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run postbuild` - Generate sitemap (runs automatically after build)
- `npm run test` - Run Jest unit tests
- `npm run test:e2e` - Run Playwright E2E tests
- `npx eslint src/**/*.js` - Run ESLint on specific files
- `npx prettier --write src/**/*.js` - Format code with Prettier

## Code Style
- Use functional components with React hooks
- Dynamic imports with Next.js for code splitting
- Use Material UI (MUI) components for consistent UI
- Follow React best practices for performance
- Proper error boundaries and fallbacks for dynamic imports
- Organize imports: React, Next.js, libraries, then local imports
- Prefer async/await over promise chains
- Use descriptive variable/function names (camelCase)
- Component file structure: imports, component, exports

## Project Structure
- `/src/pages` - Next.js routes
- `/src/components` - Reusable React components
- `/src/lib` - Utility functions and shared code
- `/public` - Static assets

## Environment
- Node v22.x
- Next.js 16.x
- Material UI for components
- Use nvm for Node Version Management

## Testing
- Don't worry about writing or running tests
- Jest for unit tests
- Playwright for end-to-end tests
- Test files located in `__tests__` folders for components
- E2E tests located in `/src/tests/e2e/`
- Mock implementation examples available in test files

## Admin layout width
`AdminPage`'s `AdminPageContainer` (`src/components/admin/AdminPage.js`) is a plain `Box` (NOT MUI `Container`) with `width: 100%`, `maxWidth: none` at all breakpoints. The Container variant kept reintroducing a 1400px desktop cap via its internal media-query rules even with `maxWidth={false}` — using `Box` avoids that. Admin tables (teams, volunteer, profile, hackathon edit) need the full viewport on desktop. Don't switch back to `Container` or add a maxWidth here. If a specific admin section wants centered narrower content, scope it to that section's wrapper. `SectionContainer` (`src/components/admin/hackathon-edit/SectionContainer.js`) carries explicit `width: 100%; boxSizing: border-box` on its Paper so every section renders to the same visible width regardless of inner content (TextField stack vs. Grid of cards).

### Hackathon admin section frame contract
Every section under `/admin/hackathons/[event_id]?section=...` MUST render through `SectionContainer` so the outer frame width is identical across sidebar tabs. Heavy sections (Teams, Judging, Volunteer, CheckIn) that embed their own Paper-laden workbenches/tabs use `<SectionContainer disableGutters>` — the outer Paper border + `width:100%; boxSizing:border-box` contract is preserved, but the inner 24px padding is dropped so the embedded content doesn't double-pad. Heavy sections add their own `Box sx={{ p: { xs:2, md:3 } }}` around the body (after the Tabs strip if any) so spacing inside the frame still feels right. `HackathonAdminLayout`'s content Box uses `scrollbarGutter: stable` so a section with internal scrolling doesn't shift the visible width by ~17px. Don't reintroduce bare `<Box>` section roots — that breaks the frame consistency and is the bug that motivated this contract.

#### Width clipping layers (don't remove)
Initially the section frame alone wasn't enough — `MealsSection` was visibly wider than `ScheduleSection` because something deep in its tree (Grid item width math or a fixed-width input row) was pushing horizontal overflow up to the document body, which made the whole `AdminPage` card grow and shift the sidebar sideways between section navigations. The fix is layered `overflowX: hidden` clips at every level above the section so overflow never escapes:
1. `AdminPage` root `<Box>`: `overflowX: hidden` + `maxWidth: 100%`
2. `AdminPageContainer` styled: `overflowX: hidden` + `minWidth: 0`
3. `AdminPageContent` styled: `overflowX: hidden` + `width: 100%; maxWidth: 100%; minWidth: 0; boxSizing: border-box`
4. `HackathonAdminLayout` root flex: already has `overflow: hidden`
5. `HackathonAdminLayout` content scroll box: `overflowX: hidden; minWidth: 0; scrollbarGutter: stable; overflowY: auto`
6. `SectionContainer` Paper: `width: 100%; maxWidth: 100%; minWidth: 0; boxSizing: border-box`

Removing any of these and a section that contains wide intrinsic min-content (e.g. side-by-side fixed-width inputs, a wide table, a long unbreakable label) will start shifting the whole admin layout sideways again. Tooltips/dialogs render through MUI Portal so they're not affected by these clips.

## Core Web Vitals (CLS hygiene)
Patterns that must stay in place to keep Google Search Console CWV green:
- `NavBar` and `Footer` are `ssr: true` in `_app.js`; their loading placeholders in `_app.js` match the rendered heights (NavBar 64px, Footer 760px/560px mobile/desktop). Don't flip them back to `ssr: false`.
- The auth-reactive right side of `Navbar.js` (Log In button ↔ Avatar) must stay inside the fixed-width slot (`minWidth: { xs: 56, md: 140 }`). Adding content there requires keeping both branches the same width.
- `HeartsLeaderboard` reserves `minHeight: { xs: 128, md: 172 }` in both its loading placeholder on `pages/index.js` and in the component's empty state — don't return `null` from it.
- Any new above-the-fold async component on the homepage must reserve space via `minHeight` in its loading fallback. `SimplePlaceholder` (opacity:0 with no height) is not enough.
- Raw `<img>` tags need `width`/`height` attributes. Prefer `next/image` with explicit dimensions.
- Iframes (YouTube, Instagram, Calendar) must be wrapped in an aspect-ratio container (the existing pattern is `paddingBottom: '56.25%'` with `height: 0` + absolutely-positioned iframe) or given a fixed pixel height.
- `initFacebookPixel` in `src/lib/ga/index.js` is idempotent via `pixelInitPromise`. Don't add `ReactPixel.init` calls outside of it.

## Admin Profile Search (`/admin/profile`)
Search-first people-finder. Single file: `src/pages/admin/profile/index.js`. Backend `GET /api/messages/admin/profiles` returns all users; filtering is client-side across ~14 fields (no server-side search). Auth: `userClass.hasPermission("profile.admin")`.

**Backend payload is lean by design.** `get_all_profiles()` (`api/messages/messages_service.py`) explicitly projects only the fields the admin search needs (`_ADMIN_PROFILE_LEAN_FIELDS`) — dropping the heavy `history` field, mailing address fields, `want_stickers`, and `propel_id`. `badges/teams/hackathons` are returned as id-string arrays (the frontend only reads `.length` on these). `volunteering` is compressed to `[{hours}]`. Wrapped in a 5-min TTL cache (`@cached(TTLCache(maxsize=1, ttl=300))`). If you add a new field to the admin profile UI, add it to both `_ADMIN_PROFILE_LEAN_FIELDS` AND clear the cache by restarting (or extend the cache invalidation hook). The per-row `/profile/<id>` route still returns the full doc when an admin opens an individual profile.

Load-bearing details:
- **`?q=<term>` is the canonical search state** and the destination of the Chrome `ohadmin` site-search shortcut (`https://www.ohack.dev/admin/profile?q=%s`). Do NOT add redirects that strip query params (e.g. `router.replace('/admin/profile')` without preserving `...router.query`) — it silently breaks the shortcut.
- URL ↔ input sync uses the CLAUDE.md "Shareable dialog state" pattern: hydrate once with `initFromUrlRef`, react to back/forward via a separate effect with a `lastUrlQRef` echo guard, write to URL via `lodash.debounce` (250ms) with `router.replace({ shallow: true, scroll: false })`.
- Keyboard: `⌘K` or `/` focuses search (with typing-elsewhere guard); `Esc` clears query + focuses search; rows are `tabIndex={0}` with `Enter`/`Space` opening `/profile/{id}` in a new tab.
- Default view is **compact list** (`Table`), not cards. Toggle persisted in `localStorage["ohack.adminProfile.viewMode"]` (values: `"list" | "grid"`).
- Other localStorage keys: `ohack.adminProfile.setupHelpDismissed` (Chrome-shortcut tip banner), `ohack.adminProfile.listToastSeen` (reserved for a future toast).
- Quick actions on every row/card link to `/profile/{user.id}` — that's the Firestore `id`, NOT `user_id` (gotcha). Volunteer deep link uses `/admin/volunteer?filter=<email>` (the volunteer page reads `filter=`, not `search=`).
- `BestMatchHero` shows when the query is an exact name/email match or an `@`-shaped query that uniquely hits one email. `MatchPills` strip shows when 2–5 results.
- `highlightMatch(text, query)` is a single-substring helper (not multi-term). Stays consistent with the underlying filter, which also matches the full string against each field.
- `UserSearchDialog.js` still duplicates the fetch+filter logic — extract a shared `useAdminProfilesSearch()` hook when convenient.

## Admin Email Compose (`AdminEmailCompose`)
- The component accepts an optional `fixedSubject` prop. When set, the Subject field is read-only and that exact value is sent.
- `ContactSubmissionDetailDialog` passes a subject derived from `submission.inquiryType` matching the backend format in `backend-ohack.dev/api/contact/contact_service.py`: `Contact Us: {inquiry_type_display.lower()} - Opportunity Hack`. The `INQUIRY_TYPE_DISPLAY` map in `ContactSubmissionDetailDialog.js` must stay in sync with the backend's map so admin replies thread with the original confirmation email.

## Pillar Landing Pages
The following SEO pillar pages follow the `hackathon-judge-opportunities.js` pattern (getStaticProps with openGraphData + structuredData arrays, initFacebookPixel in useEffect, trackEvent on button clicks):
- `/coding-for-nonprofits` — `src/pages/coding-for-nonprofits/index.js` — covers the free software development model, 3-step process, project types, FAQ (8 items), FAQPage schema. Internal links from homepage (Button), about page (inline Link), and NonProfitList component (Alert callout).
- `/hackathon-judge-opportunities` — `src/pages/hackathon-judge-opportunities.js`

## SEO Resource Pages
Static pages targeting organic search impressions. Each uses `getStaticProps` with the full openGraphData + structuredData pattern. No Organization node in the page's `@graph` (global one in `_app.js` handles it).
- `/hackathon-judging-criteria` — 4-category rubric (Scope, Documentation, Polish, Security), HowTo + FAQPage schema. Linked from `/hackathon-judge-opportunities` Expert Evaluation section.
- `/coding-for-nonprofits` — free software for nonprofits, FAQPage schema.

## Pillar Pages
SEO landing pages at `/coding-for-nonprofits` (service: free software model) and `/hackathon-for-social-good` (event: the hackathon experience). Cross-linked from homepage (`index.js` pillar link buttons), about page, and each other. Both follow the same pattern: `getStaticProps` with full OG/Twitter meta + structured data (`WebPage`, `BreadcrumbList`, `FAQPage`). The hackathon page also includes an `Event` schema node for Fall 2026. Do not duplicate content between the two — keep the service/event distinction.

## Blog Admin (`/admin/blog`)
Full CMS for the `news` Firestore collection. Mirrors the `/admin/hackathons/[event_id]` pattern (sidebar + hybrid autosave/explicit save).

- **List page**: `src/pages/admin/blog/index.js`. Search across title/description/author/tags, status filter chips (All / Published / Drafts / Archived), table with status chips and inline actions (edit, view-public, delete). "+ New post" creates a draft via `POST /api/messages/admin/news` and redirects to the editor. Delete is hard delete via `DELETE /api/messages/admin/news/<id>` (Firestore doc removed).
- **Editor**: `src/pages/admin/blog/[id].js` + `src/components/admin/blog-edit/` (mirrors `hackathon-edit/`):
  - `useBlogAdmin` — hybrid save: `content` (title/body/featured_image) and `seo` (all seo.* fields) sections require **explicit Save**; `metadata` (author, tags, status, slug, published_at) autosaves on change (debounced 1.5s). Status change uses a dedicated `setStatus()` that bypasses the debounce so the publish/unpublish chip updates immediately. `beforeunload` warns when any explicit section is dirty.
  - Reuses `SectionContainer` from `hackathon-edit/` for the sticky save bar.
  - URL state: `?section=content|seo|metadata` (shallow router replace).
- **Body format**: posts have `content_format` ("html" | "markdown"). Markdown is authored with `@uiw/react-md-editor` (dynamic, ssr:false) and rendered with `react-markdown` in `SingleNews.js`. Switching from markdown to plain in the editor does NOT delete the markdown — both fields persist. Legacy posts default to "html" so they render unchanged.
- **Backend routes** (in `backend-ohack.dev/api/messages/messages_views.py`):
  - `GET /api/messages/admin/news?limit=&status=` — admin list (includes drafts/archived). Service: `admin_list_news`.
  - `POST /api/messages/admin/news` — create. Service: `admin_create_news`. Skips OpenAI image generation when `featured_image` is supplied. Stamps `slack_ts=time.time()` if missing so existing ordering keeps working.
  - `PATCH /api/messages/admin/news/<id>` — partial update. Service: `admin_update_news`. Only keys in `_ADMIN_ALLOWED_KEYS` get through; clears `get_news` cache.
  - `DELETE /api/messages/admin/news/<id>` — hard delete. Service: `admin_delete_news`.
  - All four are auth-gated with `volunteer.admin`. The original public `POST /api/messages/news` (X-Api-Key) is **untouched** — the Slack integration depends on it.
- **Public `get_news` filtering**: `services/news_service.py::_is_publicly_visible` filters out `status in ("draft", "archived")` for both the list and single-item routes. Over-fetches by 3x so the limit-after-filter still returns enough.
- **New optional fields on a news doc** (all optional; legacy docs without them stay valid):
  - `content_markdown`, `content_format` ("html"|"markdown")
  - `featured_image` (overrides the auto-generated `image`)
  - `author: { name, email, propel_user_id, db_id }`
  - `tags: string[]`, `slug`, `status` ("draft"|"published"|"archived"), `published_at` (ISO)
  - `seo: { title, description, keywords[], canonical, og_image }`
  - `last_updated_by`, `created_by`
- **Public-side honoring** (`src/pages/blog/[blog_id].js` + `src/components/News/SingleNews.js`):
  - When `seo.title|description|canonical|og_image` are set, they win; otherwise current auto-derivation is the fallback.
  - When `content_format === "markdown"`, the body renders via `<ReactMarkdown>`; when not, the legacy `description` plain-text path renders.
  - `tags[]` render as clickable chips; falls back to hashtag regex extraction when absent.
  - `published_at` → `article:published_time` (falls back to `slack_ts_human_readable`).
  - Markdown `<img>`s render with `loading="lazy"` and `max-width: 100%; height: auto` to preserve CWV.
- **GA tracking**: admin actions emit events under `EventCategory.ADMIN` — `admin_blog_view_list`, `admin_blog_create`, `admin_blog_edit_save` (per section), `admin_blog_publish`, `admin_blog_unpublish`, `admin_blog_archive`, `admin_blog_delete`, `admin_blog_open_ga`. Public-side tracking is unchanged (lives in `SingleNews.js` `gaButton` helper + `ScrollTracker`).

## Social Media Integration

### Overview
The social media integration system allows admins to post Opportunity Hack news to various social media platforms directly from the admin panel. The system is designed with a generalized architecture that makes it easy to add new social media platforms.

### Architecture
- **Service Layer**: Abstract `SocialMediaService` base class with platform-specific implementations
- **News Service**: Fetches news from `/api/messages/news` endpoint
- **Social Media Manager**: Orchestrates posting to multiple platforms
- **Admin UI**: Located at `/admin/social-media` for managing posts

### Current Platforms
- **Threads**: Fully implemented with Meta's Threads API
- **Twitter/X**: Placeholder for future implementation
- **LinkedIn**: Placeholder for future implementation

### Environment Variables
Configure these in your `.env` file:

```env
# Threads API Configuration
THREADS_ACCESS_TOKEN=your_threads_access_token_here
THREADS_USER_ID=your_threads_user_id_here  
THREADS_USERNAME=opportunityhack
```

### Getting Threads API Credentials
1. Create a Meta Developer account at https://developers.facebook.com/
2. Create a new app and enable the Threads API
3. Generate a long-lived access token for your Threads account
4. Get your Threads user ID from the API
5. Add the credentials to your `.env` file

### Usage
1. Navigate to `/admin/social-media` in the admin panel
2. The system will automatically fetch latest news from the backend
3. Use "Preview Mode" (dry run) to see formatted posts before publishing
4. Configure which platforms to post to in the settings
5. Click "Post to Social Media" to publish (or "Preview Posts" in dry run mode)

### Adding New Platforms
To add a new social media platform:

1. Create a new service class extending `SocialMediaService`:
```javascript
// src/lib/social-media/TwitterService.js
import { SocialMediaService } from './SocialMediaService';

export class TwitterService extends SocialMediaService {
  constructor(credentials) {
    super(credentials);
    this.name = 'Twitter';
    this.characterLimit = 280;
  }
  
  async validateCredentials() {
    // Implement Twitter credential validation
  }
  
  async post(content) {
    // Implement Twitter posting logic
  }
}
```

2. Add the service to the manager in `SocialMediaManager.js`:
```javascript
// In createFromEnvironment method
if (env.TWITTER_API_KEY && env.TWITTER_API_SECRET) {
  const twitterService = new TwitterService({
    apiKey: env.TWITTER_API_KEY,
    apiSecret: env.TWITTER_API_SECRET,
    // ... other credentials
  });
  manager.registerService('twitter', twitterService);
}
```

3. Add environment variables to `.env`
4. Update `SUPPORTED_PLATFORMS` in `src/lib/social-media/index.js`

## Volunteer Letter Generator (`/hack/[event_id]/letters`)
Self-service page where a volunteer answers a branching checklist that *picks* one of four letter types (General Volunteer, SE/OPT, Mentor, Judge), fills details against a live preview, and submits to OHack to review/sign. Auth-gated (`RequiredAuthProvider`, like the application forms) with profile prefill of recipient name/email.
- Files: page `src/pages/hack/[event_id]/letters.js`; logic/templates in `src/components/Letters/` — `letterConfig.js` (pure: `ORG` constants, `runChecklist(answers)`, `*_FIELDS`, `encode/decodeLetterState`), `LetterChecklist.js` (Q1–Q4 branching UI), `LetterPreview.js` (the print surface; renders all 4 letters).
- **Decision safety (do not regress):** OPT letter is offered ONLY when Q3=initial post-completion OPT AND all 4 Q4 acks checked. STEM extension → blocked to General; "not sure" → advisory + General; mentor/judge branches never reach OPT. `runChecklist` is unit-coverable in isolation — keep its branch table intact.
- **Wording:** General + SE/OPT bodies reproduce the two reference `.docx` verbatim (with variable substitution); Mentor/Judge are event-based service confirmations. Every letter carries the guardrail bullets (volunteer not employee; no compensation; no visa sponsorship; no immigration advice/certification) — never add immigration/legal certifications.
- **Submission reuses `POST /api/contact`** (no backend change) with `inquiryType: "volunteer_letter"`. The message packs a readable summary + a shareable `?d=<base64>` link that re-renders the *filled* letter so the reviewer types the signer block and prints. `volunteer_letter` is mapped in `ContactSubmissionDetailDialog.js` `INQUIRY_TYPE_DISPLAY` (mirror in backend `contact_service.py` for reply threading if needed).
- **Signer block** (`SIGNER_FIELDS`) is OHack-filled at sign time, left blank by the volunteer. **Print** uses a global `@media print { visibility }` trick (only `#letter-print-root` shows) + `@page { size: Letter; margin: 1in }` — no `react-to-print`. Page is `noindex`. Shareable state via `?d=` follows the "Shareable dialog state" pattern (hydrate-once ref + debounced shallow `router.replace`).

## Application Forms (`/hack/[event_id]/{judge,mentor,hacker,volunteer}-application.js`)
Shared scaffolding lives in `src/components/ApplicationForm/`. Use these instead of re-implementing in each form:
- `PronounsPicker` — chip-based picker with curated pronouns + "Add your own". Stores a comma-joined string (back-compatible with old free-text values). All four forms use it.
- `OHackParticipationSelect` — the "How many Opportunity Hack hackathons have you attended?" dropdown. Helper text makes clear it's about OHack only, not other hackathons.
- `ProfileAutofillNotice` — reusable green "auto-filled from your profile" alert.
- `MealMenu` — restaurant-style meal selector for `eventData.constraints.meals`.
Primary copy on these forms uses `body1`. Reserve `body2` for true helper text under inputs.

### Hacker form — country/state/AZ residency
Country is a curated `Autocomplete` (`COUNTRY_OPTIONS`); State is a `Select` of `US_STATE_OPTIONS` only when `country === "United States"`, otherwise a free-text "State / Province / Region". County (`ARIZONA_COUNTY_OPTIONS`) only renders when country=US AND state=Arizona. There is no user-facing "Arizona Residency" dropdown — `arizonaResident` is **derived at submit time** from country+state and sent in the payload so legacy downstream consumers still receive it. If you re-introduce a dropdown for this, you'll create the redundancy we just removed. (The 2026 tax credit / QCO question was also removed — no QCO this year.) All option arrays (`PARTICIPANT_TYPE_OPTIONS`, `COUNTRY_OPTIONS`, etc.) are module-scope constants at the top of `hacker-application.js` so they're not reallocated on every render — keep them there or Autocomplete will lose its memoization.

## Hackathon Event Photos & Social Posts
Two top-level fields on the hackathon doc (NOT under `constraints`):
- `event_photos: [{ url, caption?, credit?, sort_order? }]`
- `social_posts: [{ platform: "linkedin"|"instagram"|"threads", url, caption? }]`

Both flow through the existing `PATCH /api/messages/hackathon`. Backend caps live in `validators.py` (`MAX_EVENT_PHOTOS=100`, `MAX_SOCIAL_POSTS=25`); social URL hosts are validated against the chosen platform.

Admin UI: `EventMediaManagement` component (`src/components/admin/EventMediaManagement.js`) renders inside the "Event Photos & Social Posts" Accordion in the admin Advanced Settings tab. Photos uploader is gated until `event_id` is set; posts to `/api/messages/upload-image` with `directory=hackathons/{event_id}/photos`.

Public surfaces:
- `/hack/[event_id]/media` — full carousel (`react-responsive-carousel`) + Instagram embeds (`react-social-media-embed`, dynamic ssr:false) + LinkedIn/Threads link cards. Includes `ImageGallery` JSON-LD.
- `/hack/[event_id]` — compact 3-thumbnail teaser strip + "View gallery" button rendered above the `TableOfContents` (right after `HackathonResults`), **only when `event_photos.length > 0`** (renders nothing when empty).
- `/hack/[event_id]/upload` — legacy page is now a redirect stub pointing users to `/admin/hackathons` and `/media`.

## Planning Card Budget Editor
`PlanningCardDialog` has an inline budget editor (amount USD, bucket: food/prize/swag, state: estimated/committed/paid, vendor). Edits PATCH `card.budget` and feed `PlanningBudgetWidget` (event page widget gated by `planning.budget_widget_on_event_page`). Backend constants live in `model/planning.py` (`ALLOWED_BUDGET_BUCKETS`, `ALLOWED_BUDGET_STATES`, `MAX_BUDGET_CENTS`); keep frontend select options in sync. Clear with `{ budget: null }`. Read-only viewers still see the chip; editors get the form.

## Hackathon Admin Edit (per-event page)
The old "Edit Hackathon" Dialog at `/admin/hackathons` is gone. Editing now lives on `/admin/hackathons/[event_id]` with a left sidebar navigating between sections (`?section=overview|schedule|meals|participants|judges|nonprofits|media|planning|donations|links|volunteer|teams|judging|checkin`). URLs are deep-linkable for sharing.

**Sidebar is grouped.** Sections in `sectionsManifest.js` carry a `group` field — `"config"` (Configure: overview…links) vs. `"ops"` (Operate: volunteer/teams/judging/checkin). `HackathonAdminLayout` renders one labeled List per group with an "overline" header. Legacy entries without a `group` default to "config".

**Volunteer / Teams / Judging / Check-in are consolidated here.** The old standalone routes (`/admin/volunteer`, `/admin/teams`, `/admin/judging`, `/admin/check-in`) are now redirect stubs that forward to `/admin/hackathons/<event_id>?section=<slug>` (preserving all other query params). The actual workbenches live at:
- `src/components/admin/volunteer/VolunteerWorkbench.js` — accepts `{ userClass, embedded, externalEventId, onSnack }`. When `embedded=true`, skips the `AdminPage` chrome, hides the in-page event picker, and trusts `externalEventId` instead of the URL. URL writeback is short-circuited.
- `src/components/admin/checkin/CheckInWorkbench.js` — same `embedded` contract.
- `TeamsSection` / `JudgingSection` are thin section files that lazy-load existing components (`TeamManagement`, `TeamAssignments`, `JudgingRound1/2/Results`) and wire `selectedHackathon` to `admin.hackathon.event_id` (the setter is a no-op since the host URL owns the event).
- Sub-tab state for Teams/Judging persists via `?subtab=management|assignments|stats` (Teams) / `round1|round2|results` (Judging).

**Known minor regression (embedded mode):** the workbench's internal `setSnackbar` calls don't currently render any toast UI because the `AdminPage` wrapper that owned the Snackbar is skipped. Admin actions still work; dialogs close and lists refresh. To fix later: thread `setSnackbar` through `onSnack` in the workbenches.

- Page: `src/pages/admin/hackathons/[event_id].js`. List page (`index.js`) routes "Edit" buttons here and keeps a small "Add Hackathon" modal that bootstraps a row then redirects.
- Layout: `src/components/admin/hackathon-edit/HackathonAdminLayout.js` — sticky header w/ save indicator, sidebar from `sectionsManifest.js`.
- Hook: `src/components/admin/hackathon-edit/useHackathonAdmin.js` — owns `draft` + `committed` state and runs the **hybrid save model**:
  - **Autosave** (debounced 1.5s PATCH `/api/messages/hackathon`): all "low-risk" keys.
  - **Explicit Save** (sticky bar inside `SectionContainer`): `overview-dates`, `schedule`, `meals`, `screening`, `deposit`. While any of these are dirty, autosave is **paused** so unrelated text edits don't sneak through.
  - The sidebar shows a yellow dot on sections with unsaved changes. `beforeunload` warns.
- Section components live in `src/components/admin/hackathon-edit/sections/*.js`. Each receives `{ admin, accessToken, orgId, onSnack }`. To add a new section: append to `sectionsManifest.js` + create `<Slug>Section.js` + add to the `sectionLoaders` map in `[event_id].js`.
- **Top-level optional fields must be allowlisted in the backend save, or they silently vanish.** `save_hackathon` (`backend-ohack.dev/services/hackathons_service.py`) builds the saved doc from an explicit key dict, so any NEW top-level field (i.e. NOT under `constraints`) is dropped by the `merge=True` write unless it's added to the `for optional_key in (...)` passthrough loop AND validated in `validate_hackathon_data_partial` (`common/utils/validators.py`). Current passthrough keys: `github_org`, `mentor_slack_channel`. This bit both — their admin UI existed but never persisted until the passthrough was added. `OverviewSection.js` renders both; `github_org` has a click-through to `github.com/<slug>` via the `githubOrgSlug()` normalizer (strips full URL / `@` / trailing path). Both autosave via `setField`.
- **Removed legacy components** (do not re-introduce): `DonationManagement.js` (had bolt-on "Update Donation Data" button), `MealManagement.js` (free-text time field), `CountdownManagement.js` (modal-per-edit, no reorder). Their replacements (inline donation editor, `MealsSection`, `ScheduleSection`) live under `hackathon-edit/sections/`.
- The Meals editor uses `@hello-pangea/dnd` for drag-reorder, a real `DateTimePicker` constrained to the event window, a "Clone" button per slot, and a side-by-side "Hacker preview" pane (toggleable).
- The Schedule editor groups countdowns by day in a timeline view with "Quick add" presets (Kickoff, Workshop, Coffee break, Lunch, Judging starts, Awards, Wrap-up). Single timezone selector at the top of the section defaults to the hackathon's `timezone`. List view is a fallback that supports drag-reorder.
- `ALLOWED_DIETARY_TAGS` lives in `MealsSection.js` (was previously in the deleted `MealManagement.js`). Keep in sync with backend `validators.py`.

### Vendor menu catalog (Meals section)
The Meals editor has a "Browse menu" button on each meal slot that opens a searchable catalog picker. Catalog files live in `src/components/admin/hackathon-edit/catalog/`:
- `fatFreddysCatalog.js` — seeded items from Fat Freddy's Catering (Phoenix). Update freely as menus change. Items have `{ id, category, name, description, price_cents, unit, min_quantity, dietary_tags, bundled_with? }`. `unit` is `"per_person" | "each" | "fixed"`.
- `catalogStorage.js` — combines the seeded catalog with user-added items persisted to `localStorage` under `ohack_admin_menu_catalog_v1`. New vendors / items added via the picker's "Add a custom item" form go here. (Promote to backend storage if you want cross-device sharing.)
- `MenuCatalogPicker.js` — the dialog. Filters by vendor + category, search across name/description, multi-select to add to a meal.
- `formatCurrency.js` — USD formatters and `computeItemCostCents` / `computeMealCostCents` / `computeAllMealsCostCents`.

Cost extras stored on the hackathon doc (both pass through the permissive `validate_meals` validator without backend changes):
- `constraints.meals_estimated_headcount` (int, default 50) — used as the default people-eating count for cost estimates.
- `meal.headcount_override` (int, optional) — per-slot override when not all attendees eat that meal.
- `meal.items[i]` gains optional `price_cents`, `unit`, `quantity` (for `each`), `vendor`, `catalog_item_id` fields.

`MealsSection` shows a "Estimated cost" summary card at the top of the section using the Fat Freddy's quote defaults (8.6% AZ tax, ~10% gratuity, 2.9% card surcharge, $45 delivery) — toggleable. Per-meal subtotals display as a green chip on each meal card; per-item cost shows under each priced item.

## Hackathon Per-Event Config (admin → `constraints`)
The `constraints` object on a hackathon doc carries per-event toggles. Keys consumed by the application forms:
- `judge_venue_arrival_time` (HH:MM, 24-hour) — judge form's Availability step shows it when set; falls back to existing default copy when null.
- `hacker_deposit: { enabled, default_amount_cents }` — when enabled, hacker form's Review step adds deposit fields and routes through Stripe Checkout (see below) before submit.
- `meals: [{ id, name, time, catering_provided, dietary_tags, items: [{ id, name, description, dietary_tags }] }]` — hacker form renders a `MealMenu` for each slot when in-person and meals are configured. Allowed `dietary_tags` are validated server-side; keep them in sync with `ALLOWED_DIETARY_TAGS` in `MealManagement.js` and the backend `validators.py`.
Admin UI lives in `src/pages/admin/hackathons/index.js` Advanced Settings tab. New `MealManagement` component handles meal editing.

## Hacker Stripe Deposit Flow
- Frontend route `/api/applications/hacker-deposit/checkout` creates a Stripe Checkout session; success URL is the hacker form with `?deposit_session_id=...`.
- Frontend route `/api/applications/hacker-deposit/session` retrieves the session by id and returns `{ payment_status, payment_intent_id, amount_total, metadata }`.
- Hacker form auto-saves to localStorage, so the form survives the Stripe round-trip. On return, it reads the session id, populates `stripePaymentIntentId`/`depositAmountCents`/`depositDisposition`, jumps to Review, and the next submit posts the application with those fields. Submission fields: `stripe_payment_intent_id`, `deposit_amount_cents`, `deposit_disposition` ("refund" | "donate").
- **Refund flow (admin):** `POST /api/admin/hacker/<volunteer_id>/refund-deposit` in `backend-ohack.dev/api/volunteers/volunteers_views.py` (auth: `volunteer.admin`). Body `{ override: bool }` — override is required when `deposit_disposition === "donate"`. Stripe call is fired BEFORE the Firestore mutation so a partial failure leaves the refund visible in the Stripe dashboard for human reconciliation rather than disappearing. Stripe API key sourced from `STRIPE_SECRET_KEY` env var (same name as the frontend). The service writes `deposit_status`, `deposit_refund_id`, `deposit_refund_amount_cents`, `deposit_refunded_at`, `deposit_refunded_by` on the volunteer doc, and on Stripe error sets `deposit_status="refund_failed"` + `deposit_refund_status_msg`. Slack audit message posted via `send_slack_audit`.
- **Admin UI:** `/admin/volunteer?tab=3` shows a "Deposit" column on the Hackers tab when `eventData.constraints.hacker_deposit.enabled === true`. Click any chip → `HackerDepositRefundDialog`. Chip states: Paid / Unpaid (warning, no PI on file) / Donated (paid + disposition=donate) / Refunded / Refund failed (with Stripe error in tooltip). Donate-override is two clicks deep (extra friction). Components: `src/components/admin/HackerDepositChip.js`, `src/components/admin/HackerDepositRefundDialog.js`.
- **Bulk refund (end-of-event):** Same admin page surfaces a "Refund N eligible deposits ($X)" button above the table when `depositEnabled`. Eligible = `deposit_status=paid AND deposit_disposition=refund`. Donate and refund_failed rows are excluded by design (each needs a per-row decision). Backend route `POST /api/admin/hackathon/<event_id>/refund-eligible-deposits` processes per-row with error capture and returns `{ refunded, failed, total_amount_cents }`. Component: `src/components/admin/HackerDepositBulkRefundDialog.js`.
- **Stripe webhook:** `POST /api/webhooks/stripe/hacker-deposit` on the backend (no PropelAuth — Stripe signature is the only auth). Requires `STRIPE_HACKER_DEPOSIT_WEBHOOK_SECRET` env var on the backend (deliberately distinct from the frontend store webhook's secret — see below). Subscribed events: `checkout.session.completed` (self-heals the volunteer doc when the form's session-status read missed it — matches by `metadata.hacker_email` + `event_id`, only updates an existing doc, never regresses `refunded` → `paid`) and `charge.refunded` (confirms async refund settlement — matches by our `metadata.volunteer_id` on the refund object). Both handlers are idempotent. Configure the endpoint URL + the two event types in the Stripe dashboard and copy the signing secret to `STRIPE_HACKER_DEPOSIT_WEBHOOK_SECRET`.
- **Stripe webhook env-var naming (important):** there are now TWO Stripe webhook endpoints in this project. The frontend's `/api/store/webhook.js` reads `STRIPE_STORE_WEBHOOK_SECRET` (with a legacy fallback to `STRIPE_WEBHOOK_SECRET` during rollout). The backend's hacker-deposit webhook reads `STRIPE_HACKER_DEPOSIT_WEBHOOK_SECRET`. Each endpoint in the Stripe dashboard has its OWN signing secret — using the same value for both will cause one of them to fail signature verification. Don't reintroduce a generic `STRIPE_WEBHOOK_SECRET`.
- **Still open:** no admin view of orphaned Stripe payments (hackers who paid but never submitted the application — webhook logs a warning but doesn't persist anywhere for later reconciliation). For Fall 2026 this is acceptable if deposits stay disabled or volume is low; revisit if a future event has >0 cases.

## Hacker `isSelected` Gating UX (findteam / manageteam)
`isSelected` is a single boolean that defaults to `false`. `false` is ambiguous — it covers both "still under review" and "not selected after review" — so do NOT render rejection copy on `isSelected === false`. Both `findteam.js` and `manageteam.js` render two distinct neutral panels (blue `#e3f2fd → #ede7f6/#e8eaf6`, border `#90caf9`):
- `!application` → 📝 "Apply first to use the Team Finder" / "Apply first to manage a team" with submit-application CTA.
- `application && isSelected === false` → ⏳ "Your application is awaiting confirmation" with an info Alert explaining ~1-week review, "while you wait" actions (Slack, year-round projects, other events), and a refresh hint for sync lag.
Keep both files in sync if the copy changes. Do not call `setError(...)` for these states — the dedicated panels handle it; the Alert at the top is reserved for actual fetch failures.

### Team creation — `teamMembers` is a mixed string/object array
The team-creation member picker (`TeamMemberManager.js`) is a `freeSolo` MUI Autocomplete, so `teamMembers` carries BOTH Slack-user objects (`{id, name, real_name, tz}`) from the dropdown AND raw free-text name strings the user typed. Every consumer must handle both shapes:
- **Frontend render** (`TeamMemberManager.js`, `ConfirmationSummary.js`): `typeof member === 'string' ? member : (member.real_name || member.name || '')`.
- **Backend** (`queue_team` in `api/teams/teams_service.py`): guard with `isinstance(member, dict)` then `member.get("id")` — never `if "id" in member` (that's a substring test against strings; names like "Sidney"/"David" match and then `member["id"]` raises `TypeError`). Only objects with a Slack `id` get invited to the channel and linked to `users_list`; free-text names are informational-only and intentionally NOT linked. There is no `SLACK_USER_ID_PREFIX` constant — build the full `oauth2|slack|{workspace}-{id}` form with `normalize_slack_user_id()` from `common/utils/oauth_providers.py`.

## Mentor + Judge Pending-Review Confirmation Email
Backend `send_volunteer_confirmation_email()` (`services/volunteers_service.py`) now adds a `[Pending Review]` subject prefix and a yellow "your application is pending review — up to a week" banner for `volunteer_type in ("mentor","judge")`. Role-specific next-steps live under an "Once approved" heading. Hacker confirmations (when added) should keep the existing "received" framing since they don't go through staff review.

## Hackathon Results & Hacker Funnel
Per-event results live on a dedicated page `/hack/[event_id]/results` that renders the existing `HackathonResults` component plus a new `HackathonFunnel` viz. The funnel reads from a new public-safe summary doc.

Subcollection: `hackathons/{hackathon_doc_id}/funnel/summary` — counts only (no PII):
- `registered`, `started_project`, `submitted_project`, `submitted_gallery_visible`
- `status_breakdown`, `step_breakdown`, `referral_breakdown`, `teammate_intent_breakdown`, `country_breakdown`
- `source`, `source_files`, `last_updated`, `last_updated_by`

Winning + founding-engineer counts are NOT stored in the summary — they're computed at read time from the teams collection (status in `WINNING_STATUSES`) so they stay fresh as judging changes. The funnel response also includes a `participation` block computed live: `applied_as_hacker` (count of `volunteers` docs for the event with `volunteer_type=hacker`, no `isSelected` filter — matches `HackathonResults.js`) and `formed_team` (count of unique user-doc IDs across all teams linked to this hackathon, deduped because a person could be on more than one team).

Backend: `GET /api/messages/hackathon/{event_id}/funnel` (5-min TTL cache, public, no auth). Service in `services/hackathons_service.py::get_hackathon_funnel`. Cache is cleared via `clear_cache()` along with the other hackathon caches.

Aggregate (all-time): `GET /api/messages/hackathons/funnel/aggregate` (10-min cache) sums every stage across every hackathon — no cross-event dedup, so a person in three events counts three times. Service: `get_hackathon_funnel_aggregate`. Page: `/hack/results` (no event_id) renders the same `HackathonFunnel` viz on aggregate data. Per-event dedup IS applied (a person on multiple winning teams in one event is counted once for that event), but across events totals are summed.

Backfill script: `backend-ohack.dev/scripts/backfill_devpost_funnel.py` — dry-run by default. Takes `--registrants-csv` and/or `--projects-csv` (Devpost exports). Re-running is idempotent — the summary doc is fully overwritten on `--apply`.

Front-of-house: `HackathonResults` accepts a `fullResultsHref` prop. On `/hack/[event_id]` it points to `/hack/[event_id]/results` so users can jump to the deeper page. The /results page renders the same `HackathonResults` widget at top + `HackathonFunnel` below.

## Team Demo Videos
Per-team `demo_video_url` (string) + companion `demo_video_url_submitted` (ISO timestamp, set on first save). Stored on the Firestore `teams` doc, mirrors the `devpost_link` shape. Allowed providers: YouTube, Vimeo, Loom, Google Drive (same set the `VideoDisplay` component handles).
- **Backend:** field in `edit_team()` allowlist (`api/teams/teams_service.py`). Hacker self-serve via `POST /api/team/<teamid>/demo-video` (mirrors `/devpost`). Admin uses the existing `PATCH /api/team/edit` (gated on `volunteer.admin`).
- **Public display:** `TeamList.js` shows a `<LiteVideoThumbnail>` per team card (CWV-safe — single lazy `<img>` of the YouTube hqdefault.jpg, NOT an iframe per card). Click → one page-level `<Dialog>` with `<VideoDisplay>`. Per-card iframes were rejected because 30+ embeds = ~45MB and trashes LCP/CLS.
- **Winners (`HackathonResults` on `/hack/[id]/results`):** inline `<VideoDisplay>` embed — only 3-5 cards so direct iframe is fine. Iframe has `loading="lazy"`.
- **Hacker self-serve:** `TeamCreation/TeamStatusPanel.js` has its own "Demo Video" section beside the DevPost section with live preview via `LiteVideoThumbnail`. Validates URL is one of the 4 supported providers client-side.
- **`LiteVideoThumbnail`** (`src/components/VideoDisplay/LiteVideoThumbnail.js`): the lite-embed component. Renders YouTube hqdefault thumb when the URL is YouTube; otherwise a generic dark "▶ Watch demo" tile (don't fetch Vimeo oEmbed per render — kills CWV). Always wraps a `<button>` with `loading="lazy" decoding="async"` + explicit `width`/`height` (CLAUDE.md CWV rule).

## Team Project-Completion Checklist (winning teams)
On `/hack/[event_id]/team/[team_id]`, winning teams (`isWinningStatus(team.status)` OR `team.status in ['DEPLOYED','NONPROFIT_SIGNOFF']`) see an interactive 8-item Definition of Done checklist (`src/components/Teams/TeamCompletionChecklist.js`) mirroring `/about/completion`. Each check is **permanent** — backend 409s on re-check, no unchecking. Each click opens a confirmation Dialog → on confirm POSTs to `/api/team/<teamid>/completion/toggle` with `{item: <slug>}`, fires `react-confetti` (already in deps, dynamic ssr:false same as `pages/volunteer/track.js`), and the backend posts a celebration message into the team's `slack_channel`. When 8/8 done, a giant glowing button POSTs `/api/team/<teamid>/completion/complete` which Slacks the team channel **CCing the 6 OHack admins** (`TEAM_COMPLETION_SLACK_ADMINS` in `api/teams/teams_service.py`, single source of truth for both `queue_team()` admin invites and completion broadcasts).

Both routes are `@auth.require_user` + a `user_is_on_team()` check. **Identity matching is non-obvious here**: a Firestore user doc stores TWO identity fields — `user_id` (the OAuth identity, e.g. `oauth2|slack|...`, sometimes empty) and `propel_id` (the PropelAuth UUID, marked PII). PropelAuth's `auth_user.user_id` is the propel UUID, so `user_is_on_team()` translates propel UUID → OAuth `user_id` via `get_propel_user_details_by_id(...)` (same as `get_my_teams_by_event_id`) and compares; it also falls back to `propel_id` direct-match for users that have it set. Frontend membership check is done via `GET /api/team/<event_id>/me` rather than client-side comparison, because the public team payload deliberately omits `propel_id` (PII). Non-members see a read-only progress view. Item slugs (`deployed`, `nonprofit_signoff`, `login_details`, `code_updated`, `tasks_closed`, `sensitive_info_security`, `documentation`, `open_source`) MUST stay in lockstep between frontend `COMPLETION_ITEMS` and backend `COMPLETION_ITEMS`. New Firestore fields on the team doc (all optional; no migration): `completion_checklist`, `completion_status` (`not_started`|`in_progress`|`complete`), `completion_completed_at`, `completion_completed_by_propel_id`, `completion_completed_by_name`.

**Team member rendering on the same page**: the public `get_team` (`services/teams_service.py`) now enriches `team.users[]` from a list of doc-id strings into `{id, user_id, name, nickname, profile_image}` via a single batched Firestore `get_all`, cached behind the existing 10-min TTL. Backwards-compatible: `HackathonResults.js`/`TeamList.js` already handle both shapes. The list endpoint `get_teams_list()` is NOT enriched — only the single-team getter. Profile tile links point to `/profile/{user.id}` (Firestore doc id, NOT propel_id — see "Public profile route" gotcha).

## Mentor Team Panel (per-team mentor coordination)
On `/hack/<event_id>/team/<team_id>`, mentors get an interactive support panel (`src/components/Teams/MentorTeamPanel.js`) above the completion checklist. Visible to everyone once `event.start_date <= now` (read-only for non-mentors, never archived). Four sections: **Open concerns** (flags with owner attribution + take-over), **Coverage** (6-item team-observation checklist mirroring `MENTOR_COVERAGE_ITEMS`), **Judging readiness** (5-criterion rubric — Scope/Documentation/Polish/Security/Accessibility, the last being the special-category prize on `/about/judges`; consensus = worst rating across mentors), and **Notes feed** (chronological, attributed, soft-delete-own). Mobile renders as `<Accordion>`s, desktop renders all sections inline (`useMediaQuery(theme.breakpoints.down("sm"))`).

Item slugs (`intro_made`, `scope_reviewed`, `architecture_discussed`, `repo_health_checked`, `criteria_walkthrough`, `demo_devpost_reviewed`) MUST stay in lockstep with backend `MENTOR_COVERAGE_ITEMS` in `api/mentors/mentors_service.py`. Same lockstep contract as `TeamCompletionChecklist`.

**Mentor auth gate**: server-enforced via `user_is_mentor_for_event(propel_user_id, event_id)` in `api/mentors/mentors_service.py`. Requires a volunteer doc with `volunteer_type='mentor'`, `event_id=<this event>`, `isSelected=True`. Identity matching follows the same propel-UUID → OAuth user_id translation as `user_is_on_team` (via `get_propel_user_details_by_id`), with a `propel_id` direct-match fallback. Frontend gates interactivity via `GET /api/volunteer/<event_id>/me?type=mentor` (returns `{is_mentor, volunteer}` — the volunteer subset is lean, no PII). When `eventId={null}` is passed, the fetch is skipped entirely — used by `MentorTeamPanelDemo.js` on `/about/mentors` to render the panel statically without backend calls.

**Slack volume is intentionally quiet**: only flag-raises, flag-resolutions, and the first-time "all 6 covered" milestone broadcast to the team's `slack_channel`. Flag-raises also heartbeat the per-event mentor channel (`hackathon.mentor_slack_channel`, defaulting to `<event_id>-mentors` lowercased with `_`→`-`). Coverage toggles, notes, take-overs, and rating changes are quiet. Each write does call `send_slack_audit(...)` for the audit trail.

**Live updates**: the panel refetches `GET /api/messages/team/<id>` on `document.visibilitychange` (tab refocus) — best-effort, errors swallowed. No polling.

**"Teams Ready for a Boost" extension** (`api/leaderboard/leaderboard_service.py::collect_mentor_panel_opportunities`): the leaderboard's `mentor_opportunities` array now includes two new sources — any team with an open `mentor_flag` (up to 2 per team to limit noise), and any team with `mentor_last_touched_at > 4h ago` during a live event window (`start_date <= now <= end_date + 1d`). Renders alongside the existing GitHub-derived signals.

**Hackathon field**: `mentor_slack_channel` (optional string, max 80 chars, validated as a top-level field in `common/utils/validators.py`). Admin UI lives in `OverviewSection.js`. The frontend never reads this directly — it's purely a backend Slack-routing config.

**Denormalized team fields** (kept in sync by every mentor service write): `mentor_last_touched_at`, `mentor_last_touched_by_name`, `mentor_open_flag_count`, `mentor_coverage_completed_at`, `mentor_coverage_completed_by_name`. The leaderboard reads these directly; don't compute on the fly.

## Admin Teams (`/admin/teams?event_id=...`)
File: `src/components/admin/TeamManagement.js` (~2900 lines, hosted in `src/pages/admin/teams/index.js`). Three concerns added together (deliberately scoped — no full redesign):
- **Demo Video column + inline-edit Popover** (`TeamFieldPopover`): table cell shows a 96×54 thumbnail if set, "+ Add" button if missing. Click → Popover with `TextField` + live `LiteVideoThumbnail` preview + Save/Cancel/Clear. Optimistic update: `handleQuickPatch` PATCHes the partial and merges into local `teams` state — no full refetch.
- **`patchTeam(partial)` helper**: extracted from `handleSaveTeam`. Always include `id` in the partial. Both the full edit Dialog and `TeamFieldPopover` use it. If you add another quick-edit field, hang it off this same helper + the Popover (parameterize `field`/`label`/`placeholder`/`validate`/`previewKind`).
- **Filter chips above the table** (state: `activeFilter`): `All` / `Winning` / `In review` / `Active` / `Missing DevPost` / `Missing Video`. Pure client-side — extends the existing `filteredTeams` useEffect. Filter resets `page` to 0 so the user lands on results.
- The full edit Dialog's Team Details tab also has the Demo Video URL TextField (next to DevPost), with the same `validateDemoVideoUrl` helper and a `LiteVideoThumbnail` preview underneath.
- **Team approval lives WHERE you assign the nonprofit, not in Communication.** Approving an `IN_REVIEW` team posts to `POST /api/team/approve` with `{teamId, nonprofitId}` — the call carries `selected_nonprofit_id` and persists it server-side, so **no separate "Save Changes" is needed to approve** (selecting in the dropdown only updates local state; approve commits it). The "Approve Team" CTA is surfaced in two places: (1) inline in the Nonprofit Assignment tab right under the selector (green box, disabled until a nonprofit is picked), and (2) a persistent footer action in the edit dialog — green "Approve Team" when a nonprofit is selected, or an outlined "Assign nonprofit to approve" that jumps to tab 1 (`setActiveTab(1)`) when not. Both open the existing confirm dialog (`approvalDialogOpen` → `handleApproveTeam`). Don't re-add the approve button to `renderCommunication` (it was removed from there — it's unrelated to messaging and was the source of the confusing "select nonprofit → switch to Communication tab → approve" flow). Footer/inline CTAs only show for `status === "IN_REVIEW"`; approved teams show a success confirmation instead.
- **Nonprofit Assignment tab — always render the dropdown.** Do NOT short-circuit `renderNonprofitSelection` when `teamData.nonprofit_rankings` is missing; teams created outside the matching flow still need a manual-assign UI. `fetchNonprofits` falls back to `GET /api/messages/npos` (all nonprofits) when the hackathon-scoped `GET /api/messages/npos/hackathon/{id}` returns an empty list, so admins can still pick a nonprofit on hackathons that don't have any attached. `nonprofitSource` (`"hackathon"` | `"all"`) drives a fallback notice in the UI.
- **Don't N-render the component.** Fetching per-repo GitHub data (issue summaries, issues) used to do a separate `setState` per repo, which re-renders this ~2900-line component once per repo (~12–30 cascading renders on load and on every dialog open). Both prefetch paths now collect results via `Promise.all` and merge into a SINGLE `setGithubIssueSummaries` / `setGithubIssues` call. If you add another per-team batch fetch, follow the same pattern — never call setState in a forEach loop over teams/repos.
- **No render-body `console.log`s.** Logs at module top-level inside the component body (e.g. `console.log("Team Data:", teamData)`) fire on EVERY render. They turn a render storm into console spam and slow the page further. Keep diagnostic logs inside callbacks or effects, never in the render path.

## /hack Index Page Architecture

The page is intentionally optimized so a visitor reaches an upcoming event in the first ~250px of scroll. The order is **hero → upcoming events → story strip → archive → "About these events" (merged Why Join + Before signing up) → Sponsor CTA**. Do not re-insert marketing copy ("Why Join") or news ("Latest Updates") between hero and events — both were removed because they pushed events 900+px below the fold.

Hero is intentionally minimal: one h1 (`<h1>Hackathons for nonprofits</h1>`) + two CTAs ("See upcoming events" / "Join the community"). The long "Since 2013, we've helped 100+ nonprofits..." tagline was removed because the Story Strip immediately below shows that with concrete numbers. Don't re-add the tagline.

**Section IDs (load-bearing for `HackPageNav` and other anchor consumers):**
- `#upcoming-events` on the upcoming events `<Box>` wrapper in `pages/hack/index.js`
- `#since-2013` on the outer `<Box>` of `HackathonStoryStrip`
- `#previous-events` on the `OuterGrid` of `PreviousHackathonList`
- `#about-events` on the merged Why Join + Before You Join section in `pages/hack/index.js`
- `#year-{yyyy}` on each `YearSection` inside the archive
- All section anchors carry `scrollMarginTop: 100` (or higher) so jumps don't get hidden behind the 80px NavBar.

### HackPageNav (page-level TOC)
`src/components/HackathonList/HackPageNav.js` — small floating widget showing the four top-level sections. Hidden until hero scrolls past (driven by a rAF-throttled scroll listener checking when `h1.getBoundingClientRect().bottom < 60`). Desktop: `position: fixed; left: 16px; top: 50%` vertical pill stack. Mobile: `position: fixed; top: 64px` (below NavBar) horizontal scrollable pill bar. Active state follows scroll position via the same rAF anchor-line pattern as the archive (`anchorY = 160`). Updating the section list = edit `SECTIONS` array at the top of the file.

### HackathonList — news removed
The "Latest Updates" news block inside `HackathonList` is rendered ONLY in `compact={true}` mode (used by the home page sidebar). On `/hack`, the news fetch is gated by `if (!compact) return undefined;` in its `useEffect` to avoid the network call. The full-width `/hack` render shows a small "Read latest updates from Opportunity Hack" link to `/blog` below the events grid. Do not re-add news to the full-width render — it broke the events → strip → archive flow and added ~500-800px of scroll.

### About these events (merged section)
After the archive, `#about-events` combines:
1. A compact "What you get" 4-up icon row (Code / Group / EmojiEvents / EventAvailable) — replaces the old "Why Join" Paper. No big photo. Icons + 1-line descriptions.
2. The original "Before signing up" 3-card row (Code of Conduct / Liability Waiver / Photo Release).
Both share the same h2 ("About these events") and are stacked under `overline` sub-headings. Don't promote either back above the events — they're context, not finder-flow.

## Story Strip + Year-Grouped Archive
`HackathonStoryStrip` (`src/components/HackathonList/HackathonStoryStrip.js`) bridges `<HackathonList />` (upcoming) and `<PreviousHackathonList />` (archive) on `/hack`. It fetches `GET /api/messages/hackathons/funnel/aggregate` for stat tiles and derives a year sparkline from `useHackathonEvents("previous"|"current")` (no extra fetch).

- **Year jump uses a CustomEvent, NOT URL hash.** Clicking a year dot dispatches `window.dispatchEvent(new CustomEvent('ohack:archive-jump-year', { detail: { year } }))`. `PreviousHackathonList` listens for that event, sets `activeYear`, then scrolls `#year-{yyyy}` into view. Don't switch to hash-based — it would collide with deep-link patterns elsewhere.
- **Arizona callout lives INSIDE the strip.** Previously a standalone `<Alert>` between "Why Join" and Upcoming. Do not re-add it to `pages/hack/index.js` — it now sits below the year sparkline inside `HackathonStoryStrip`.
- **CLS guardrail.** Strip reserves `minHeight: { xs: 420, md: 240 }` on its outer `<Box>`. Funnel data load shows `Skeleton`s inside the stat tiles, not a missing component. Don't return `null` while loading.
- **Heading:** strip uses `<h2 id="story-strip-heading">`. Page-level h1 ("Hackathons") in `pages/hack/index.js` is the only h1 — keep it that way.

### Previous Events archive — year-grouped, no pagination, photo-led
`PreviousHackathonList` (`src/components/HackathonList/PreviousHackathonList.js`) renders the full 12+ year archive on one continuous scroll. **No pagination, no year-filter chips** — the prior design (8/page + chip filter + scroll-to-top jumps) created the "takes a while to click around" friction the redesign addresses.

- **Year-grouped layout.** Events are grouped by `format(parseLocalDate(start_date), 'yyyy')`, sorted desc. Each year renders as a `<YearSection>` with `id="year-{yyyy}"` anchor, year heading (h3), and event-count chip. `scrollMarginTop: { xs: 130, md: 100 }` accounts for the NavBar (~80px).
- **Sticky vertical `YearRail`** (desktop ≥md): left-side `<nav aria-label="Jump to a year">` with `position: sticky; top: 84px`, vertical list of year buttons sized by event count. On mobile (<md): horizontal sticky bar at `top: 64px`. Clicking a year scrolls to `#year-{yyyy}` and sets `activeYear` state (which drives the bright-blue active pill via `$active` styled-component prop). **`activeYear` is click-driven only** — earlier scroll-driven IntersectionObserver/scroll-listener attempts fought smooth-scroll race conditions (last in-flight year would win the final state, landing on neighbor). Cut entirely; cleaner code, no race.
- **Photo-led `PastEventCard`.** Cards lead with a 16:9 image header from `event.event_photos?.[0]?.url`. When absent, fall back to a `GradientFallback` that hashes year → HSL hue (`((year - 2013) * 37) % 360`) so the wall doesn't feel monotone. `next/image` with `fill` + `sizes` + `loading="lazy"`. `event.image_url` is intentionally NOT used as a fallback (it's typically the generic OHack logo on legacy events — would make every card look the same).
- **Image domain allowlist.** `cdn.ohack.dev` is in `next.config.js` `images.remotePatterns`. Adding new event-photo CDN domains requires updating that file too.
- **`LazyMount` per card.** `ImpactMetrics` per-card API fetch is gated by IntersectionObserver with `rootMargin: '300px'`. The archive is long (~30+ cards across 13 year groups); without this, every card fetches on mount → CORS-flood the backend. Keep it.
- **Layout flex.** `<Box display="flex" flexDirection={{xs:'column', md:'row'}}>` wraps `YearRail` + content area. Year rail width is `108px` on desktop. Content area uses `<Grid container spacing={2}>` with `size={{ xs: 12, sm: 6, md: 4, lg: 3 }}` — 4 cards/row on lg, 3 on md, 2 on sm, 1 on xs.
- **Don't reintroduce pagination.** The whole point of this redesign is one continuous scroll with rail-teleport. If you need to gate something for perf, prefer further lazy-loading of card content, not paging the list.

## Local Landing Pages

### Arizona Hackathons (`/hackathons/arizona`)
- File: `src/pages/hackathons/arizona/index.js`
- Targets: "asu hackathon", "phoenix hackathon", "hack arizona", "hackathons in arizona", etc.
- Uses `useHackathonEvents("current")` and `useHackathonEvents("previous")` with `isArizonaLocation()` filter (AZ_LOCATION_PATTERNS constant at top of file).
- Structured data: WebPage + BreadcrumbList + Event (Fall 2026 ASU with GeoCoordinates) + FAQPage.
- Internal links from: `pages/index.js` (pillar links section), `pages/hack/index.js` (inside `HackathonStoryStrip`, not as a top-level Alert), `pages/sponsor/index.js` (About section).

## Gotchas (load-bearing — every one of these has bitten us)

### PropelAuth permission checks — `userClass`, NOT `orgHelper`
`useAuthInfo()` returns both `userClass` and `orgHelper`. They look interchangeable but they are NOT:

- `orgHelper.getOrgs()` returns **plain info objects** (`{orgId, orgName, ...}`) with NO methods. Calling `.hasPermission()` on them throws (silently caught by surrounding try/catch, leaving every admin check returning `false`).
- `userClass.getOrgByName("Opportunity Hack Org")` returns the **full OrgInfo object** with `.hasPermission(perm)`, `.assignedRole()`, etc.

Pattern to copy (matches `pages/admin/index.js`):
```js
const { userClass } = useAuthInfo();
const org = userClass?.getOrgByName("Opportunity Hack Org");
const isAdmin = org?.hasPermission("volunteer.admin");
```

`orgHelper` is fine for getting `orgId` to pass as the `X-Org-Id` header (`orgHelper?.getOrgs()?.[0]?.orgId`), but never use it for permission checks.

### Public profile route is `/profile/{db_id}`, NOT propel_id
- `/profile/[userid].js` expects the **Firestore document ID** (`User.id`), not the PropelAuth `user_id` / `propel_id`.
- Things stored across the system as `propel_user_id` (assignees, editors, mentions, etc.) cannot be plugged directly into the profile URL — you need the `db_id` field too.
- When the backend bundles user profiles for a list view (planning board users map, team rosters, etc.), it should include BOTH `user_id` (propel) AND `db_id`. The frontend uses propel for matching and db_id for linking.

### MUI TextField in custom theme + Portal — pin colors explicitly
MUI Dialogs render via Portal. The `ThemeProvider` context flows through Portals in MUI v5+ but the underlying `<textarea>` / `<input>` element still inherits browser default styling for `background` and `color` in some configurations — most reliably broken when:
- A page-level `ThemeProvider` overrides `palette.mode` (e.g. local dark mode toggle).
- The Dialog renders a `<TextField>` with `variant="outlined"` (the default).

Symptom: white textarea with light-gray placeholder, unreadable inside a dark dialog. Fix is to pin the input area to theme tokens via `sx`:
```js
<TextField
  sx={{
    "& .MuiInputBase-root": { bgcolor: "background.paper", color: "text.primary" },
    "& textarea, & input": { color: "text.primary" },
  }}
/>
```
Apply this to any TextField inside a Dialog when the page uses a non-global theme override.

### Stale "selected item" snapshots vs. polled list state
Pattern that bit us: a list view (board, roster, etc.) polls fresh data into `boardState`. A user clicks a row → we set `selectedItem = item` (a snapshot of the click-time value). The detail Dialog renders from `selectedItem`.

Two consequences when subsequent edits land:
1. The Dialog shows stale fields (the saved description doesn't appear after the polled refresh).
2. Optimistic-concurrency PATCHes (`If-Match: <updated_at>`) use the click-time `updated_at` and 412 on every save after the first.

Fix: derive the live record from the polled state, not from the captured selection:
```js
const liveItem = state.items.find((i) => i.id === selectedItem.id) || selectedItem;
return <DetailDialog item={liveItem} ... />
```
This pattern applies anywhere a Dialog opens with a snapshot from a polled or paginated list.

### Local theme provider for scoped dark mode
The OHack global theme is light-only. If you need dark mode for a specific surface (e.g. the planning board), don't add a global toggle — wrap that surface in a local `ThemeProvider` and persist the preference per-feature in localStorage. See `src/components/Planning/PlanningThemeProvider.js` for the pattern (auto / light / dark cycle, `prefers-color-scheme` detection).

### Vertical padding for dense control rows — default is too tight
MUI `py: 1` (8px each side, 16px total) is what you'll reach for instinctively, and it's wrong for any container holding multiple chips/buttons/avatars side-by-side. The result feels cramped — and when the container sits right under the global NavBar (64px), it visually crowds the navbar.

Heuristic for any "header bar" or row of controls:
- `py: 1.75` → minimum, acceptable on light rows
- **`py: 2.25` + `minHeight: 64`** → the safe default for a header-style bar with chips/buttons (matches the NavBar's own height so the surfaces feel balanced)
- Add `flexShrink: 0` if it lives inside a flex column — otherwise dense content can compress it.

If you reach for `py: 1` on a row of controls, stop and use `py: 2.25 + minHeight: 64` instead. We've fixed this same bug twice in the planning board.

### Don't repeat the same notice/warning inside one surface
A full-width MUI Alert that screams "this is public" is appropriate ONCE near the top of a form/dialog/page. Repeating the same Alert beside every input that "could expose data" (attachments, comments, descriptions) is alarmist, hurts readability, and trains users to ignore the warning entirely.

Pattern instead:
- One compact notice at the top (`<PlanningPublicNotice compact />` style — single line, smaller font, no AlertTitle).
- Subtle inline hints at each input that needs the reminder:
  - Placeholder text: `"Post a public comment…"`
  - Helper text under a file picker: `"PNG, JPG, WebP, GIF — max 10 MB · publicly visible"`
- Reserve full Alerts for state changes the user actually needs to act on (errors, conflicts, success).

### Shareable dialog state — sync open card/item with the URL
When a Dialog represents a specific item (a card, a hackathon, a profile section), make the URL reflect what's open so users can copy/paste/share the link:

```js
function handleOpen(item) {
  setSelectedItem(item);
  router.replace(
    { pathname: router.pathname, query: { ...router.query, card: item.id } },
    undefined,
    { shallow: true } // critical — no refetch, no scroll, no re-render of getStaticProps
  );
}

function handleClose() {
  setSelectedItem(null);
  const { card: _, ...rest } = router.query;
  router.replace({ pathname: router.pathname, query: rest }, undefined, { shallow: true });
}

// Auto-open on mount when the URL says so:
React.useEffect(() => {
  const targetId = router.query.card;
  if (!targetId || !items) return;
  const found = items.find((i) => i.id === targetId);
  if (found && !openedRef.current) {
    handleOpen(found);
    openedRef.current = targetId;
  }
}, [router.query.card, items]);
```

For social-unfurl-quality previews (Slack, Twitter, LinkedIn) the URL also needs an SSR route that emits per-item OG meta tags — query-param-based opens won't unfurl. See `src/pages/hack/[event_id]/plan/c/[card_id].js` for the pattern (separate SSR route with `getServerSideProps`, fetches the item server-side, emits `og:title` / `og:description` / `og:image`, then re-renders the parent page with the dialog pre-opened).