# Plan — Refine the `/profile` editor (own, authenticated)

> **For:** Sonnet 4.6 (implementer). **Goal:** bring the logged-in profile
> editor into the "civic editorial" refined design system, matching the depth of
> the other full rewrites (e.g. `/myfeedback`, `/feedback/[userid]`,
> `/profile/[userid]` public). Today `/profile` is only a **chrome-only facelift**
> (Fraunces on the name + a solid-navy MUI tab block) sitting on top of the old
> elevation-Paper, default-MUI form. This plan upgrades it to a full refined pass
> **without changing a single line of form/save logic.**
>
> Read first: `docs/refined-design-system.md` (the system) and
> `src/components/design/refined.js` (the source of tokens + `.ohx-*` classes).
> Reference implementation to copy patterns from: `src/components/Profile/PublicProfile.js`.

---

## 0. TL;DR

- **One file does ~95% of the work:** `src/components/Profile/Profile.js` (the editor).
- **Wrap** the page body in `<RefinedRoot>` (paper bg + fonts + utility classes).
- **Theme** every MUI control navy/terracotta via ONE scoped `ThemeProvider(createTheme(base, …))` (proven precedent: `HackathonRequestForm.js`). No per-field color edits.
- **Rebuild the chrome** (masthead + tab strip + panel headers) with `.ohx-*` classes; **keep** the 6-tab structure, URL-hash sync, debounced auto-save, privacy toggles, GA, and all embedded Section/widget components.
- Lightly restyle `src/components/Profile/CustomSelect.js` (profile-only; safe).
- It's a `ssr:false` dynamic import, so SSR/CLS pressure is low — but keep the CWV hygiene rules (explicit image dims, `RefinedFonts`, skeletons reserve space).

---

## 1. Files in play

| File | Change |
|---|---|
| `src/components/Profile/Profile.js` | **Main rewrite** of all JSX/chrome. Logic untouched. |
| `src/components/Profile/CustomSelect.js` | Profile-only. Minor restyle so the label/select read refined (or leave as-is — the scoped theme already recolors it). |
| `src/styles/profile/styles.js` | The `LayoutContainer`/`ProfileContainer`/`ProfileHeader`/`ProfileHeadline` styled atoms become **dead** once the masthead is rebuilt. Stop importing them from `Profile.js`; you may leave the file in place (other code does not import it — verify with grep) or delete the now-orphaned exports. Do **not** spend time here. |
| `src/pages/profile/index.js` | No change (already `dynamic(ssr:false)`). |
| `docs/refined-design-system.md` + project `CLAUDE.md` | Update rollout status when done (see §9). |

**Do NOT touch** (shared / out of scope): `useProfileApi`, `usePrivacySettings`,
`PrivacyToggle/PrivacyToggle.js`, `HeartGauge`, and the embedded sections
(`BadgesSection`, `HackathonsSection`, `FeedbackSection`, `HeartsExplainer`,
`RaffleEntries`, `GitHubContribution`, `ShareableGitHubContributions`,
`HelpUsBuildOHack`). They already render acceptably and several are shared by the
public profile. Wrap them in refined frames; don't rewrite their internals.

---

## 2. Hard constraints — preserve exactly (logic)

These have all bitten the project before. Re-verify each after the rewrite.

1. **All state + handlers stay byte-for-byte:** `onRoleChange`, `handleExpertiseChange`, `handleEducationChange`, `handleShirtSizeChange`, `handleCompanyChange` (2s debounce), `handleGithubChange` (2s debounce + drives the GitHub-history fetch effect), `handleWhyChange` (2s debounce), `handleLinkedInChange`/`handleLinkedInBlur` (`normalizeLinkedInUrl`), `handleInstagramChange`, `handleAddressChange` (2s debounce, batches all address fields), `handleStickersChange`. Keep the `update_profile_metadata(...)` calls and their `onComplete` callbacks.
2. **`isSaving` per-field spinner** (`LoadingOverlay`) — keep the behavior; you may restyle the spinner color to navy.
3. **Tab ↔ URL hash sync:** the `hashTabMap`/`tabHashMap` (`#basic #impact #github #swag #volunteer #giveaways` → indices 0–5), the mount effect that reads `router.asPath`, and `handleTabChange` (fires `trackEvent({action:'profile_tab_change'})` + `router.push('/profile#'+hash, undefined, {shallow:true})`). **Tab order and indices must not change** — they are shareable deep links.
4. **GA / pixel:** keep `initFacebookPixel()`, `set(user.email)`, and every `trackEvent(...)` call.
5. **GitHub history effect:** the `useEffect` on `[github]` that fetches `/api/messages/profile/github/${github}` and sets `githubHistory` / `isGithubLoading`. The Impact + GitHub tabs both consume `githubHistory`.
6. **Auth gate:** `if (!isLoggedIn)` returns a login prompt (`LoginOrRegister`). Keep the gate; just refine its presentation (§4 Step 2). Keep the hooks-order safe — **the `if (!isLoggedIn)` early return must stay BELOW all hooks** (it already is; don't move hooks below it — same bug class fixed in `GiveFeedback`).
7. **Privacy toggles:** every `<PrivacyToggle field=… isPrivate={privacySettings.X !== 'public'} onToggle={togglePrivacySetting} … />` stays, one per field, with the same `field` keys.
8. **Profile data effect:** the `useEffect([profile])` that hydrates local state. You may delete the noisy `console.log("Profile data", profile)` and the per-handler `console.log("Save to backend", …)` lines as cleanup (CLAUDE.md: no stray logs), but keep the logic.

> If a field's data flow is unclear, **do not refactor it** — re-wrap the existing
> JSX in refined markup and move on.

---

## 3. UX design direction (the "why", an expert lens)

The current editor reads as **busy and heavy**: two stacked `elevation={3}` Papers,
a solid-navy filled tab block, default outlined fields wall-to-wall, and `h4`
section titles competing with the page. The refined system wants the opposite —
**one calm surface, clear hierarchy, generous space, navy as the workhorse,
terracotta as a single spice.**

Design principles to apply:

- **Editorial masthead, not a card.** The identity block (avatar, name, email,
  member-since, public-profile CTA, HeartGauge) sits directly on the warm paper as
  a hero — eyebrow → one `h1` (Fraunces) → quiet meta line → one primary CTA.
  Mirror the public profile's masthead so the two pages feel like siblings.
- **The tab strip is navigation, not a banner.** Drop the solid-navy filled block.
  Use a quiet hairline tab bar: ink labels, **navy** selected text, a **terracotta**
  underline indicator, hairline bottom rule. Keep icons (they aid scanning) but let
  whitespace carry the weight. Make the bar **sticky** under the navbar so users
  keep their place while editing long tabs (nice-to-have; see Step 4).
- **Calm hierarchy per tab.** Each panel opens with a small eyebrow + a single
  Fraunces `h2` + one muted lead sentence — replacing the current `h4`. Sub-groups
  use `h3`. Exactly **one `h1` on the page** (the name).
- **Don't box-in-box.** Form fields live in plain space (the input outlines are
  structure enough). Only wrap genuinely card-like content (giveaway entries, the
  shareable GitHub card, the volunteer-history sub-sections) in a single `.ohx-card`
  or a `--surface-2` band. No nested bordered boxes.
- **Quiet the field chrome.** Inputs get the navy focus ring + refined radius via
  the scoped theme. Helper text is `--muted`, small.
- **Make privacy legible once.** The page is full of lock/globe toggles whose
  meaning isn't self-evident. Add **one** compact legend near the top of the Basic
  Info tab ("🔒 private · 🌐 shows on your public profile") instead of trusting each
  toggle to explain itself. Do not repeat the legend per field (CLAUDE.md rule).
- **Color discipline.** Navy for actions/links/selected states; terracotta only for
  the tab indicator and at most one italic accent word. **Remove** the leftover
  `primary.light + '10'` tinted Paper on the Giveaways tab and any ad-hoc colors —
  replace with `.ohx-card` / `--surface-2`.

---

## 4. Implementation steps

### Step 1 — Page chrome: `RefinedRoot` + fonts + scoped MUI theme

1. Imports: add
   ```js
   import { RefinedRoot, RefinedFonts, Eyebrow, Arrow } from "../design/refined";
   import { ThemeProvider, createTheme, useTheme } from "@mui/material/styles";
   import { useMemo } from "react";
   ```
   (`RefinedFonts` is already imported; add the rest. `useTheme` is already imported from `@mui/material` — consolidate.)
2. Build the scoped theme once (copy the proven shape from `HackathonRequestForm.js`):
   ```js
   const baseTheme = useTheme();
   const formTheme = useMemo(
     () => createTheme(baseTheme, {
       palette: {
         primary:   { main: "#1B3A6B", dark: "#0E2547", light: "#E8EDF5", contrastText: "#fff" },
         secondary: { main: "#E2552E", contrastText: "#fff" },
       },
       shape: { borderRadius: 8 },
     }),
     [baseTheme]
   );
   ```
3. New top-level structure of the authenticated return:
   ```jsx
   <>
     <Head>
       <title>Your profile — Opportunity Hack</title>
       <meta name="robots" content="noindex" />  {/* private page */}
       <RefinedFonts />
     </Head>
     <RefinedRoot>
       <ThemeProvider theme={formTheme}>
         {/* masthead (Step 3) + tab nav (Step 4) + panels (Step 5) */}
       </ThemeProvider>
     </RefinedRoot>
   </>
   ```
   - `RefinedRoot` provides `--paper`, fonts, `.ohx-*` classes, and is the `<main>`.
   - `ThemeProvider` recolors **all** MUI controls (TextField, Select, Checkbox,
     Tabs, buttons, Skeleton accents) navy/terracotta in one place.
   - Stop using `LayoutContainer`/`InnerContainer`/`ProfileContainer` etc. Lay out
     with `.ohx-wrap` sections (`paddingTop: "clamp(100px,12vh,148px)"` on the first
     section to clear the 64px fixed navbar — copy the value from `PublicProfile.js`).

### Step 2 — Logged-out state (refined)

Replace the `LayoutContainer` fallback with a calm refined notice that still
renders `LoginOrRegister`:
```jsx
if (!isLoggedIn) {
  return (
    <>
      <Head><title>Your profile — Opportunity Hack</title><RefinedFonts /></Head>
      <RefinedRoot>
        <section className="ohx-wrap" style={{ paddingTop: "clamp(120px,16vh,180px)", paddingBottom: 120 }}>
          <Eyebrow>Your profile</Eyebrow>
          <h1 className="ohx-display" style={{ fontSize: "clamp(2rem,4vw,3rem)", marginTop: 14 }}>
            Sign in to manage your profile
          </h1>
          <p className="ohx-lead" style={{ marginTop: 14, marginBottom: 28 }}>
            Your Opportunity Hack profile tracks your impact, badges, and hackathon history.
          </p>
          <LoginOrRegister introText="Ready to join us?" previousPage="/profile" />
        </section>
      </RefinedRoot>
    </>
  );
}
```
Keep this return **below all hooks**.

### Step 3 — Editorial masthead (replaces the header Paper)

Mirror `PublicProfile.js`'s header. No Paper, no elevation.
- `Eyebrow`: "Your profile".
- `h1.ohx-display`: `{firstName} {lastName}` + `<VerifiedUserIcon sx={{ color:'#1B3A6B' }} />`.
- Avatar: keep the user image. Use a real `next/image` **or** an `<img>` with
  explicit `width`/`height` (CWV). The existing `ProfileAvatar` styled-img passes
  width/height — you can inline an `<img>` with `style={{ borderRadius:'50%', border:'1px solid var(--line)' }}` and explicit `width={96} height={96}` (smaller on `xs`).
- Meta line (`--muted`): `{user.email}` · `Member since <Moment fromNow>{user.createdAt*1000}</Moment>`. Keep `Moment`.
- Actions row: `<Link href={profile.profile_url} className="ohx-btn ohx-btn--primary">View public profile <Arrow /></Link>` and render `<HeartGauge history={profile.history} />` beside it (keep the component as-is).
- Keep the existing **loading skeleton** branch (`isLoading`) but recolor minimally; it reserves header height (CWV).

### Step 4 — Tab navigation (restyle, keep the component + logic)

Keep `<Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile>` and all six `<Tab>`s with their icons + `a11yProps`. Replace the solid-navy `sx` block with a hairline bar:
```jsx
<Box className="ohx-wrap" sx={{ position: "sticky", top: 64, zIndex: 5,
     backgroundColor: "var(--paper)", borderBottom: "1px solid var(--line)" }}>
  <Tabs
    value={activeTab}
    onChange={handleTabChange}
    variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile
    textColor="primary"        /* navy selected label */
    indicatorColor="secondary" /* terracotta underline */
    aria-label="profile sections"
    sx={{
      minHeight: 56,
      "& .MuiTabs-indicator": { height: 3 },
      "& .MuiTab-root": {
        textTransform: "none",
        fontFamily: "var(--body)",
        fontWeight: 600,
        color: "var(--muted)",
        minHeight: 56,
        "&.Mui-selected": { color: "var(--brand)" },
      },
    }}
  >
    {/* the 6 existing <Tab> entries, unchanged */}
  </Tabs>
</Box>
```
- On mobile the labels currently collapse to icon-only (`label={isMobile ? undefined : "…"}`). Keep that.
- If sticky causes overlap glitches in dev, drop `position:sticky` (it's a nicety, not required). Tabs must keep working either way.

### Step 5 — Panel headers + section framing

For **every** `TabPanel`, replace the `Typography variant="h4"` title with the refined header pattern, and the intro `body1` with a lead:
```jsx
<Eyebrow>Basic info</Eyebrow>
<h2 className="ohx-display" style={{ fontSize: "clamp(1.5rem,3vw,2rem)", margin: "8px 0 6px" }}>
  Tell us about yourself
</h2>
<p className="ohx-muted" style={{ marginTop: 0, marginBottom: 24, maxWidth: "60ch" }}>
  …existing intro copy…
</p>
```
Keep all `TabPanel`/`a11yProps` plumbing. Wrap each panel's body in `.ohx-wrap`
(or render the whole tab content area inside one `.ohx-wrap`).

Per-tab specifics (keep all fields + toggles; only the wrappers change):

- **Tab 0 — Basic Info:** keep the responsive `Grid` of fields (role, github,
  education, company, linkedin, instagram, why, expertise) each with its
  `PrivacyToggle`. Add the **privacy legend** (Step 7) once, above the grid.
- **Tab 1 — Impact:** keep `HeartsExplainer`, `RaffleEntries`,
  `ShareableGitHubContributions`. Put each of the two cards in its own `.ohx-card`
  (`padding:24px`) instead of bare Grid items; keep the skeletons.
- **Tab 2 — GitHub:** keep the github username field + `GitHubContributions` +
  `ShareableGitHubContributions`. Sub-titles ("Your Contribution Graph",
  "Shareable Card") become `h3.ohx-display` (smaller). Keep skeletons.
- **Tab 3 — Swag & Shipping:** shirt size (`CustomSelect`), stickers checkbox,
  address fields, country (`CustomSelect`). "Shipping Address" sub-title → `h3`.
  Keep the address debounce handlers wired exactly.
- **Tab 4 — Volunteer History:** Badges / Hackathons / Feedback Exchange /
  Praises / Summer Internships. Each sub-block currently uses an `h5` + a
  `PrivacyToggle` in a flex row — keep that pattern but `h5`→`h3.ohx-display`
  and wrap each block in a `.ohx-card` **or** separate with `<hr className="ohx-rule"/>`
  (prefer hairline rules over nested cards here to avoid box-in-box). Keep
  `BadgesSection`, `HackathonsSection`, `FeedbackSection`, `HelpUsBuildOHack`,
  and the `/praise` link.
- **Tab 5 — Giveaway Entries:** **remove** the `bgcolor: primary.light + '10'`
  Paper — replace with a `.ohx-card` (or `--surface-2` band) holding `RaffleEntries`.
  "How to Earn More Entries" → `h3` + keep the `<ul>` (style list items `--muted`).

### Step 6 — Form field theming

The scoped `ThemeProvider` (Step 1) already gives every TextField/Select the navy
focus ring + radius 8 — **you usually need no per-field `sx`.** Verify the inputs
read on the warm paper; if any input background looks off inside a card, the
established fix is to pin it (CLAUDE.md "MUI TextField in custom theme" gotcha):
```js
sx={{ "& .MuiInputBase-root": { bgcolor: "background.paper" } }}
```
`CustomSelect.js` (profile-only) inherits the theme too. Optional polish: bump its
`StyledFormControl` margin from `theme.spacing(1)` to `0` so it aligns flush in the
refined grid (the grid `spacing` already provides gaps), and let its label/colors
come from the theme. Don't hardcode colors there.

### Step 7 — Privacy legend (UX add, one place)

Above the Basic Info grid, add a single compact legend:
```jsx
<Box sx={{ display:"flex", gap:2, flexWrap:"wrap", alignItems:"center", mb:3,
           color:"var(--muted)", fontSize:"0.9rem" }}>
  <span>Visibility:</span>
  <span>🔒 Private — only you</span>
  <span>🌐 Public — shows on your <Link href={profile.profile_url} className="ohx-link">public profile</Link></span>
</Box>
```
Match whatever icon/wording `PrivacyToggle` actually uses (read the component) so
the legend and the controls agree. Do not repeat this legend on other tabs.

### Step 8 — Cleanup

- Drop the `console.log` lines (profile-data dump + per-save logs).
- Remove now-unused imports (`LayoutContainer`, `InnerContainer`,
  `ProfileContainer`, `ProfileAvatar`, `ProfileDetailText`, `ProfileHeader`,
  `ProfileHeadline`, `Paper`, `Divider`, `Stack` if unused, `ProfileButton`).
  Run `npx eslint src/components/Profile/Profile.js` and fix unused-var warnings.

---

## 5. Reusable snippets

**Refined panel-header helper** (define inside `Profile.js`, module scope):
```jsx
function PanelHeader({ eyebrow, title, children }) {
  return (
    <header style={{ marginBottom: 24 }}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="ohx-display" style={{ fontSize: "clamp(1.5rem,3vw,2rem)", margin: "8px 0 6px" }}>{title}</h2>
      {children && <p className="ohx-muted" style={{ margin: 0, maxWidth: "60ch" }}>{children}</p>}
    </header>
  );
}
```
**Card wrapper** for the few card-like sub-sections: just use
`<div className="ohx-card" style={{ padding: 24, marginBottom: 20 }}>…</div>`.

---

## 6. Accessibility & CWV checklist

- Exactly **one `<h1>`** (the name). Tab titles `h2`, sub-sections `h3`. No skipped levels.
- Tabs keep `aria-label`, `a11yProps`, roving focus (MUI handles it). `TabPanel`
  keeps `role="tabpanel"` + `aria-labelledby`.
- Avatar `<img>`/`next/image` has explicit `width`/`height`; `alt` set.
- `RefinedFonts` stays in `<Head>` (preconnect + `display=swap`).
- Keep the `isLoading` skeleton branches so the header/cards reserve height.
- Color contrast: navy `#1B3A6B` on paper and white on navy buttons both pass AA.
  Don't put `--faint` text on `--surface-2` for anything important.
- `prefers-reduced-motion` is already honored by `.rise` in the scope; only add
  `.rise` to a couple of masthead elements (don't over-animate a form).

---

## 7. Verification

1. `npm run dev`, log in, open `/profile`.
   **Dev gotcha:** Next 16 dev chunks aren't content-hashed — disable cache via CDP
   (`Network.setCacheDisabled` + `clearBrowserCache`), not a plain reload, or you'll
   see the stale bundle (see `docs/refined-design-system.md`).
2. Click through all 6 tabs; confirm the URL hash updates (`#basic`…`#giveaways`)
   and that loading `/profile#github` directly opens the GitHub tab.
3. Edit each field type and confirm it still saves (network call to
   `update_profile_metadata`): role/education/shirt/country selects (immediate),
   company/github/why/address (2s debounce), linkedin (on blur, normalized),
   instagram (immediate), stickers checkbox. The per-field saving spinner shows.
4. Toggle a privacy control; confirm it persists and the legend wording matches.
5. GitHub username change repopulates the contribution graph + shareable card.
6. Logged-out: visit in a private window → refined sign-in notice + `LoginOrRegister`.
7. Mobile (`xs`) width: tabs are icon-only + scrollable, masthead stacks, no
   horizontal scroll/overflow.
8. `npx eslint src/components/Profile/Profile.js` clean; `npm run build` succeeds.

---

## 8. Out of scope / optional (don't build unless asked)

- A profile-completeness meter / progress nudge.
- Reordering or merging tabs (indices are shareable deep links — frozen).
- Rewriting any embedded Section component's internals.
- Server-side rendering this page (it's intentionally `ssr:false`).

If you see a quick win in a Section while wrapping it, leave a `// TODO(refined):`
note rather than expanding scope.

---

## 9. After done — update the docs

- In `docs/refined-design-system.md` rollout list, change the `/profile` (own)
  entry from "**chrome-only facelift**" to a full refined pass, summarizing what
  changed (masthead, hairline tab strip, scoped MUI theme, refined panels, privacy
  legend) and noting **logic was preserved**.
- In the project `CLAUDE.md`, update the `/profile` mention in the "Refined design
  scope" paragraph to reflect the full pass (it currently says "a chrome-only
  facelift on the own `/profile` editor (`Profile.js` — fonts + navy tab strip
  only; form logic untouched)").
