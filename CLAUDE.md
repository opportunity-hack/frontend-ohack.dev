# OHack Frontend Development Guidelines

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
The old "Edit Hackathon" Dialog at `/admin/hackathons` is gone. Editing now lives on `/admin/hackathons/[event_id]` with a left sidebar navigating between sections (`?section=overview|schedule|meals|participants|judges|nonprofits|media|planning|donations|links`). URLs are deep-linkable for sharing.

- Page: `src/pages/admin/hackathons/[event_id].js`. List page (`index.js`) routes "Edit" buttons here and keeps a small "Add Hackathon" modal that bootstraps a row then redirects.
- Layout: `src/components/admin/hackathon-edit/HackathonAdminLayout.js` — sticky header w/ save indicator, sidebar from `sectionsManifest.js`.
- Hook: `src/components/admin/hackathon-edit/useHackathonAdmin.js` — owns `draft` + `committed` state and runs the **hybrid save model**:
  - **Autosave** (debounced 1.5s PATCH `/api/messages/hackathon`): all "low-risk" keys.
  - **Explicit Save** (sticky bar inside `SectionContainer`): `overview-dates`, `schedule`, `meals`, `screening`, `deposit`. While any of these are dirty, autosave is **paused** so unrelated text edits don't sneak through.
  - The sidebar shows a yellow dot on sections with unsaved changes. `beforeunload` warns.
- Section components live in `src/components/admin/hackathon-edit/sections/*.js`. Each receives `{ admin, accessToken, orgId, onSnack }`. To add a new section: append to `sectionsManifest.js` + create `<Slug>Section.js` + add to the `sectionLoaders` map in `[event_id].js`.
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

## Local Landing Pages

### Arizona Hackathons (`/hackathons/arizona`)
- File: `src/pages/hackathons/arizona/index.js`
- Targets: "asu hackathon", "phoenix hackathon", "hack arizona", "hackathons in arizona", etc.
- Uses `useHackathonEvents("current")` and `useHackathonEvents("previous")` with `isArizonaLocation()` filter (AZ_LOCATION_PATTERNS constant at top of file).
- Structured data: WebPage + BreadcrumbList + Event (Fall 2026 ASU with GeoCoordinates) + FAQPage.
- Internal links from: `pages/index.js` (pillar links section), `pages/hack/index.js` (Alert above events list), `pages/sponsor/index.js` (About section).

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