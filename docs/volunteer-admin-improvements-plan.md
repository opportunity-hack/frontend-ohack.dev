# Volunteer Admin — Improvements Plan

**Target page:** `/admin/hackathons/[event_id]?section=volunteer`
**Audience:** executable by Sonnet 4.6.
**Goals:**

1. Work better on mobile.
2. See **all** fields the applicant filled out in **Review Mode**.
3. Quick way to see if they provided a LinkedIn profile link.
4. Link out to their profile in the `users` collection so we can see more about them.

---

## Where the code lives

- **Page (embedded mode):** `src/components/admin/volunteer/VolunteerWorkbench.js`
  Two view modes:
  - **Table** → `src/components/admin/VolunteerTable.js` (already has a `MobileCardView`, ~L1504, rendered when `isMobile`).
  - **Review** → `src/components/admin/ApplicationReviewList.js` → `src/components/admin/ApplicationReviewCard.js`.
- **Admin data source (backend):** `GET /api/messages/admin/hackathon/<event_id>/{mentor|judge|volunteer|hacker|sponsor}` →
  `services/hackathons_service.py::get_volunteer_by_event(..., admin=True)` →
  `common/utils/firebase.py::get_volunteer_from_db_by_event(event_id, type, admin=True)` (L1300).
- **Public profile route:** `/profile/{db_id}` (Firestore **doc id**, NOT propel/user_id) →
  backend `api/users/users_views.py:144` `get_public_profile_by_db_id`.

### Root causes / facts established

- **Req #2:** `ApplicationReviewCard.getFieldConfig()` hardcodes `primaryFields` / `secondaryFields` /
  `additionalFields` per type. Any submitted field outside those lists is **never rendered**. Fix = a generic
  "all submitted fields" fallback section.
- **Req #3:** LinkedIn is stored under inconsistent keys: `linkedin` (mentor/volunteer/hacker) vs
  `linkedinProfile` (judge/volunteer). Need one helper + a prominent, always-visible indicator.
- **Req #4 is cheap:** the admin branch of `get_volunteer_from_db_by_event` (L1348-1356) already does an
  email→user batch lookup (`get_users_by_emails`) where `user["id"]` is the Firestore **doc id** we need for
  `/profile/{db_id}`. Just attach it to each volunteer record. No new query.
- **Req #1:** Table already has a mobile card view; the gap is **Review Mode** (card actions overflow, the
  availability timeline uses absolute positioning that overflows narrow screens) and the dense filter bar.

---

## Req #4 — Link to the user's profile *(do this first; #3/#2 reuse the field)*

### Backend — `common/utils/firebase.py`, the `if admin:` block (~L1348-1356)

In the existing loop over `volunteers` (where `user = user_map[email]` is already in scope), also set:

- `volunteer["user_db_id"] = user["id"]`
- `volunteer["profile_image"] = user.get("profile_image")`  *(optional, for the card avatar)*

Notes:

- Reuses the existing `user_map` — **no extra Firestore reads**.
- Safe to expose: doc id is already public via profile URLs, and this endpoint is `volunteer.admin`-gated.
- Leave behavior unchanged when no matching user doc exists (field simply absent).

### Frontend

- **`ApplicationReviewCard.js`** header (the actions/status row, ~L449): when `application.user_db_id` is set,
  render a small "View OHack profile ↗" `Chip`/`IconButton` →
  `<Link href={`/profile/${application.user_db_id}`} target="_blank" rel="noopener noreferrer">`.
  Hide entirely when absent.
- **`VolunteerTable.js`**: add the same profile link to the row action cluster **and** to `MobileCardView`.
  (LinkedIn column already exists at L420/L1428 — this is the new "OHack profile" affordance.)

---

## Req #3 — LinkedIn at a glance

- Add a module-scope helper in `ApplicationReviewCard.js`:
  `getLinkedInUrl(app) = app.linkedin || app.linkedinProfile || app.linkedinUrl` → normalize to `https://…`
  if missing the scheme.
- **Review card header (always visible, ~L449):** when present, a LinkedIn `IconButton` (reuse existing
  `LinkedInIcon`) linking out; when absent, a muted "No LinkedIn" `Chip` so reviewers can tell instantly
  without expanding.
- **`ApplicationReviewList.js`:** add a "Has LinkedIn" choice to the Status `Select` (~L362) **or** a small
  toggle chip, filtering `processedApplications` on `getLinkedInUrl(app)`.

---

## Req #2 — Show ALL submitted fields in Review Mode

In `ApplicationReviewCard.js`, inside the `<Collapse>` and after the "Additional Information" block
(~L1176), add an **"All submitted fields"** section:

1. Build the set of keys already rendered:
   `primaryFields ∪ secondaryFields ∪ additionalFields ∪ {name, photoUrl, status}`.
2. Define an internal/audit **skip list**:
   `id, user_id, user_db_id, propel_id, slack_user_id, event_id, volunteer_type, isSelected, timestamp,
   created_by, created_timestamp, updated_by, updated_timestamp, sent_emails, certificates, profile_image,
   checkedIn, checkedInBy, checkedInAt`.
3. Iterate `Object.entries(application)`; skip already-rendered, skip-listed, and empty values; render each
   remaining field generically via the existing `getFieldLabel()` (already title-cases unknown keys) +
   `renderField()`. For object/array values, fall back to `JSON.stringify`.

Result: nothing the applicant typed is hidden, with zero per-field maintenance as forms gain fields.

---

## Req #1 — Mobile

Table mobile is already handled; focus on **Review Mode** + toolbar.

### `ApplicationReviewCard.js`

- **`CardActions`** (~L1211): `flexDirection: { xs: 'column', sm: 'row' }`, full-width buttons on `xs`; drop
  the `justifyContent: 'space-between'` squeeze.
- **Header** (~L425): `flexWrap: 'wrap'` + `gap` so name / title / LinkedIn / profile chips wrap cleanly.
- **Availability timeline** (~L730-1163): wrap the whole viz in `<Box sx={{ overflowX: 'auto' }}>` so the
  absolutely-positioned bars don't overflow the viewport.

### `ApplicationReviewList.js`

- The dense filter `Paper` (~L347, many `Grid size={{ xs:12, sm:2 }}`) already stacks, but on mobile collapse
  it into an MUI `Accordion` (collapsed by default) via `useMediaQuery(theme.breakpoints.down('sm'))` so the
  filters don't push the cards far down the page.
- Stats `Paper` (~L307) is fine as-is (`xs:4`).

### `VolunteerWorkbench.js`

- Top toolbar already branches on `isMobile` (~L1279). Leave as-is.

---

## Suggested execution order

1. **Backend** `user_db_id` / `profile_image` enrichment in `firebase.py` (~3 lines in the existing loop).
2. **`ApplicationReviewCard.js`**: `getLinkedInUrl` helper; header LinkedIn + profile-link chips;
   "All submitted fields" section; mobile `CardActions` / header / timeline fixes.
3. **`ApplicationReviewList.js`**: "Has LinkedIn" filter + mobile filter accordion.
4. **`VolunteerTable.js`**: profile-link action in row + `MobileCardView`.

## Risk / safety

- All frontend changes are additive and null-guarded (every new affordance hides when its field is absent).
- Backend change reuses an existing batch lookup — no new reads, no public-endpoint exposure (admin-gated;
  doc id already public via profile URLs).
- No change to volunteer data shape consumed elsewhere; new keys are ignored by existing consumers.
