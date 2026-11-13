# Demo video: clearer guidance + sturdier link handling (Nov 2026)

**Executor:** Sonnet 5.5. **Repo:** `frontend-ohack.dev` (Part A, required) and `backend-ohack.dev` (Part B, one-line copy change, separate PR).
**Surface:** `/hack/<event>/manageteam#demo` → `src/components/TeamDashboard/DemoVideoEditor.js`.
**Branch:** `feat/demo-video-guidance` off `develop`. Read the root `CLAUDE.md` sections "Team Dashboard", "Team Demo Videos" and "Refined design scope" first.

## 1. What exists today (verified Nov 13 2026)

The card shows one sentence ("4 minutes or less. Show the problem, the demo, and who it helps."), a URL field with placeholder `https://youtu.be/...`, and a Save button. Teams are never told which hosts work, which is easiest, what privacy setting to use, or what to record with.

Accepted links (`isValidDemoVideoUrl` in the editor, copied in `admin/TeamManagement.js::validateDemoVideoUrl`):

| Host | Accepted shape | Plays in `VideoDisplay`? |
|---|---|---|
| YouTube | `youtube.com/...v=<11>` , `youtu.be/<11>` | Yes |
| Vimeo | `vimeo.com/<digits>` | Public yes. **Unlisted (`vimeo.com/<id>/<hash>`) no** — the embed drops the hash |
| Loom | `loom.com/share/<id>`, `loom.com/embed/<id>` | Yes |
| Google Drive | `drive.google.com/file/d/<id>` | Only when shared "Anyone with the link" |

The backend (`api/teams/teams_service.py`) does **not** check the host — it trims and caps at 500 chars. The frontend is the only gate. Leave that as is.

Problems found:

1. **No guidance** on tools, hosting or privacy (the ask).
2. **YouTube Shorts / Live / embed links are rejected** by the editor (`/shorts/<id>`, `/live/<id>`, `/embed/<id>`); Shorts and Live also don't parse in `VideoDisplay` / `LiteVideoThumbnail`. Phone-recorded vertical demos upload as Shorts, so this will happen.
3. **Unlisted Vimeo links save but don't play** (needs `?h=<hash>` on the embed URL).
4. **Private videos save fine and fail silently for judges** — a Private YouTube video or a Drive file without link sharing shows an error inside the iframe. Nothing warns the team.
5. **One generic error** for every bad link. Common near-misses: `studio.youtube.com/video/<id>/edit`, a playlist or channel URL, a Drive *folder* link, `drive.google.com/open?id=`.
6. The five-regex validator is duplicated (editor + admin) and separate from the two parsers (VideoDisplay + LiteVideoThumbnail).

## 2. Design

One recommended path, stated up front; everything else behind a disclosure (one fact per layer). Gentle, encouraging copy — no scolding imperatives. No new colors, chips or gradients; `.ohx-*` classes only (the dashboard is always inside `RefinedRoot`).

Card layout, top to bottom:

```
Show what you built
Demo video
┌──────────────────────────────────────────────────────────────┐
│ 4 minutes or less. Show the problem, the demo, and who it    │
│ helps.                                                       │
│                                                              │
│ The easiest way                                              │
│  1  Record your screen while one of you talks through it.    │
│  2  Upload it to YouTube and set Visibility to Unlisted.     │
│  3  Paste the link here and press Save.                      │
│                                                              │
│ [ 320×180 preview ]   [ Demo video URL            ]          │
│                       helper / specific error / warning      │
│                       [Save video]  Check it plays ↗         │
│                                                              │
│ ▸ Free tools and other places to host                        │
└──────────────────────────────────────────────────────────────┘
```

- **Steps** render as a compact `<ol>` (accent number markers like the `/signup` join steps; keep it ~3 lines tall). Under step 2, one muted line: "Unlisted means only people with the link can watch. Private videos can't be played by judges."
- **Helper text** when the field is empty or valid: "YouTube, Loom, Vimeo or Google Drive links work." (replaces the blank `" "`).
- **"Check it plays ↗"** — a `.ohx-link` `<a target="_blank" rel="noopener noreferrer">` to the *saved* `team.demo_video_url`, shown only when a video is saved. Followed by muted text: "Open it in a private window — if it plays there, judges can watch it."
- **Disclosure** — native `<details>` (same pattern as the FAQ accordions), summary "Free tools and other places to host". Two short lists, copy in §4.
- The 320×180 preview frame and its placeholder stay exactly as they are (CLS reservation).

## 3. Part A — frontend work

### A1. New `src/lib/videoLinks.js` (single source for link parsing)

Pure, no React. Exports:

```js
// → { provider: "youtube"|"vimeo"|"loom"|"drive"|"file", id, embedUrl, hash? } | null
export function parseVideoUrl(url)
export function isSupportedVideoUrl(url)          // Boolean(parseVideoUrl(url)) — but see `file` note
export function youtubeIdFromUrl(url)             // 11-char id or null
export function videoProviderLabel(url)           // "YouTube" | "Vimeo" | "Loom" | "Google Drive" | "Video" | null
export function describeVideoUrlProblem(url)      // string | null — specific, friendly reason for a link that is NOT supported
export const DEMO_VIDEO_HOSTS_LABEL = "YouTube, Loom, Vimeo or Google Drive";
```

Parsing rules (trim first; match case-insensitively; tolerate `www.`, `m.`, `music.` subdomains and trailing query strings such as `?si=…`, `&t=30s`, `?usp=sharing`, `?sid=…`):

| Input | Result |
|---|---|
| `youtube.com/watch?v=<id>` (v anywhere in the query), `youtu.be/<id>`, `youtube.com/embed/<id>`, `youtube.com/shorts/<id>`, `youtube.com/live/<id>`, `youtube.com/v/<id>` | `youtube`, embed `https://www.youtube.com/embed/<id>` |
| `vimeo.com/<digits>`, `vimeo.com/video/<digits>`, `player.vimeo.com/video/<digits>`, plus the existing channels/groups/album shapes from `VideoDisplay`'s regex | `vimeo`, embed `https://player.vimeo.com/video/<id>` |
| `vimeo.com/<digits>/<hash>` or `…?h=<hash>` | `vimeo` with `hash`, embed `https://player.vimeo.com/video/<id>?h=<hash>` |
| `loom.com/share/<id>`, `loom.com/embed/<id>` | `loom`, embed `https://www.loom.com/embed/<id>` |
| `drive.google.com/file/d/<id>/…`, `drive.google.com/open?id=<id>`, `drive.google.com/uc?id=<id>` | `drive`, embed `https://drive.google.com/file/d/<id>/preview` |
| ends in `.mp4` / `.webm` / `.mov` (before `?`/`#`) | `file`, embed = the URL |

YouTube id = exactly 11 chars of `[\w-]`. `isSupportedVideoUrl(url, { allowFiles = false } = {})` — the demo-video editor and admin validator call it with the default (raw files are **not** accepted for team demos today; keep that), `VideoDisplay` uses `parseVideoUrl` directly so bio videos keep playing.

`describeVideoUrlProblem(url)` returns `null` for supported or empty input, otherwise the first match:

| Link looks like | Message |
|---|---|
| `studio.youtube.com` | "That's the YouTube Studio editing link. On the video, choose Share → Copy link and paste that instead." |
| `youtube.com/playlist`, or a watch URL with `list=` but no `v=` | "That link is a playlist. Open the video itself and copy its link." |
| `youtube.com/@…`, `/channel/`, `/c/`, `/user/` | "That link is a channel. Open the video itself and copy its link." |
| any other youtube.com / youtu.be | "We couldn't find a video in that YouTube link. Use Share → Copy link on the video." |
| `drive.google.com/drive/folders` | "That link is a Drive folder. Open the video file, choose Share → Copy link, and paste that." |
| `docs.google.com` or other drive.google.com | "That doesn't look like a Drive video file link. Open the video file and choose Share → Copy link." |
| loom.com without `/share/` or `/embed/` | "Use the Loom share link — it looks like loom.com/share/…" |
| no `http(s)://` | "Paste the full link, starting with https://" |
| anything else | "We can play YouTube, Loom, Vimeo and Google Drive links. YouTube (Unlisted) is the easiest." |

### A2. Use it everywhere the regexes are copied

- `VideoDisplay.js` — replace `getVideoConfig`'s four regexes with `parseVideoUrl`; keep the per-provider `allow` strings (map by `provider`), the `file` → `<video>` branch, the `fill` prop and the "Unsupported video URL" fallback unchanged.
- `LiteVideoThumbnail.js` — replace the local regexes with `youtubeIdFromUrl` + `videoProviderLabel`. No visual change.
- `DemoVideoEditor.js` — delete the local `isValidDemoVideoUrl`; use `isSupportedVideoUrl` + `describeVideoUrlProblem`.
- `admin/TeamManagement.js::validateDemoVideoUrl` — keep the empty/500-char branches, replace the regex block with `isSupportedVideoUrl`, and return `describeVideoUrlProblem(trimmed)` as the error. Touch nothing else in that file.
- `Teams/projectMeta.js::projectThumbUrl` — if it carries its own YouTube id regex, swap it for `youtubeIdFromUrl` so Shorts/Live links get an OG thumbnail too. If it doesn't, leave it.
- **Do not touch** `ApplicationForm/IntroVideoField.js` (its YouTube/Vimeo/Loom allowlist mirrors backend `ALLOWED_VIDEO_LINK_HOSTS`) or any judge page.

### A3. Copy/data file `src/components/TeamDashboard/demoVideoGuide.js`

Module-scope data only (the component maps over it; tests assert on it): `EASY_STEPS`, `RECORDING_TOOLS`, `HOSTING_OPTIONS`, plus the strings in §2. Content in §4.

### A4. `DemoVideoEditor.js` changes

- Render the steps, helper text, "Check it plays" link and the `<details>` disclosure per §2. Any new subcomponents (`EasySteps`, `HostingGuide`) are **module-scope** in the same file.
- Error state: `showError = Boolean(value.trim()) && !isSupportedVideoUrl(value)`; `helperText` = `describeVideoUrlProblem(value)`. The save-time `onNotify` error uses the same message.
- Save `parseVideoUrl`-valid input **as typed (trimmed)** — do not rewrite the URL the team pasted.
- **Private-video check (YouTube only):** module-scope async `checkYoutubeAvailability(url)` →
  `fetch("https://www.youtube.com/oembed?format=json&url=" + encodeURIComponent(url))`, 5s `AbortSignal.timeout`.
  Verified: this endpoint answers browser requests from our origin (CORS allowed) with 200 for public/unlisted videos and a 4xx for videos that can't be embedded or don't exist.
  - Return `"ok"` on 2xx, `"unavailable"` on any other HTTP status, `"unknown"` on a network error/timeout/abort.
  - Run it (a) 600ms after the field settles on a valid YouTube link and (b) right after a successful save. Track the latest request with a ref so a stale answer never overwrites a newer one; cancel on unmount.
  - `"unavailable"` → a calm `role="status"` line under the field (not an error color; use `var(--accent)` text + `--surface-2` background, no MUI Alert): "YouTube says this video can't be played by others yet. In YouTube Studio set Visibility to **Unlisted** (not Private), then check again." with a text button "Check again".
  - `"unknown"` → render nothing. **A failed request is never a "no"** (root CLAUDE.md rule).
  - Never block Save on this check — a video still processing can briefly report unavailable.
  - This sends only the pasted video URL to YouTube; no user or team identifiers.
- Do not change: the save handler's success/409/403 branches, `onTeamUpdated`, the dialog, the 320×180 frame, section `id="demo"`.
- GA (`EventCategory.ENGAGEMENT`, via `trackEvent({action, params})`): `team_demo_video_help_open` (first time the `<details>` opens per mount), `team_demo_video_check_click` ("Check it plays"), `team_demo_video_unavailable_warning` (`event_label: team.id`, once per distinct URL). Add all three to `ga-events-reference.md` next to `team_demo_video_saved`.

### A5. Small copy touch

`src/lib/teamDeliverables.js` video row hint: `"4 minutes or less"` → `"4 minutes or less · YouTube Unlisted is easiest"`. Update `teamDeliverables.test.js` if it asserts the old string.

### A6. Tests

- `src/lib/__tests__/videoLinks.test.js` — table-driven: every row of the A1 parsing table (assert `provider`, `id`, `embedUrl`); the Vimeo hash case; rejects (`studio.youtube.com/video/<id>/edit`, playlist, channel, Drive folder, empty, `not a url`, an 10-char YouTube id); every `describeVideoUrlProblem` row; `allowFiles` default false.
- `src/components/TeamDashboard/__tests__/DemoVideoEditor.test.js` (mock `teamDashboardApi`, `ga`, `VideoDisplay`; mock `global.fetch` for oEmbed):
  1. Renders the three steps and the hosts helper text; the disclosure lists every `HOSTING_OPTIONS` name.
  2. A Shorts link enables Save and calls `saveTeamDemoVideo` with the trimmed URL.
  3. A Studio link shows the Studio-specific message and does not call save.
  4. oEmbed 401 → the Unlisted warning appears; Save still works.
  5. oEmbed rejects (network error) → **no** warning.
  6. "Check it plays" renders only when `team.demo_video_url` is set, with `target="_blank"`.
  Use fake timers for the 600ms debounce.
- Run: `npm test -- videoLinks DemoVideoEditor teamDeliverables VideoDisplay LiteVideoThumbnail`, then the full `npm test -- --ci`, then `npx eslint` on the touched files. No file under `src/pages` changes, so `next build` isn't required.

### A7. Docs

Update root `CLAUDE.md` succinctly: in "Team Demo Videos" note that `src/lib/videoLinks.js` is the single parser/validator (consumers listed in A2; `IntroVideoField` deliberately separate), the newly supported shapes, the non-blocking oEmbed check, and that guide copy lives in `TeamDashboard/demoVideoGuide.js`.

## 4. Copy (use verbatim; organizer should sanity-check the plan limits marked ⚠)

**EASY_STEPS**
1. "Record your screen while one of you talks through it."
2. "Upload it to YouTube and set Visibility to **Unlisted**." — sub-line: "Unlisted means only people with the link can watch. Private videos can't be played by judges."
3. "Paste the link here and press Save."

**RECORDING_TOOLS** (heading: "Free ways to record")
- **Mac** — "Press Shift + Command + 5, choose Record, and turn on your microphone under Options."
- **Windows 11** — "Open Snipping Tool, switch to video, and turn on the microphone. (Windows + Shift + R)"
- **Loom** — "Records your screen and your face, and gives you a link straight away — no upload step. The free plan allows videos up to 5 minutes." ⚠
- **Zoom** — "Start a meeting with your team, share your screen, and press Record. Handy when everyone wants to speak."
- **OBS Studio** — "Free on Mac, Windows and Linux. More setup, more control."
- Closing muted line: "A phone video of a mobile app works too — upload it the same way."

**HOSTING_OPTIONS** (heading: "Where to put it")
- **YouTube (easiest)** — "Upload, then set Visibility to Unlisted. Use Share → Copy link."
- **Loom** — "Paste the share link (loom.com/share/…). Nothing else to set."
- **Google Drive** — "Share → General access → Anyone with the link. School and work accounts sometimes block this — if it won't let you, use YouTube."
- **Vimeo** — "Public and Unlisted links both work."
- Closing muted line: "Uploading can take a while on event Wi-Fi. Starting 30 minutes before the deadline keeps it calm."

## 5. Part B — backend (optional, separate small PR, deploy independently)

`backend-ohack.dev/api/submissions/submissions_service.py::build_demo_video_message` — change
"upload it to YouTube, Vimeo, Loom or Google Drive, and link it on your dashboard:" to
"upload it to YouTube as **Unlisted** (easiest — Loom, Vimeo and Google Drive links work too), and link it on your dashboard:".
Slack bold is single asterisks: `*Unlisted*`. Update the matching assertion in that module's tests if one pins the old sentence (`pytest api/submissions`). Never touch `messages_views.py` / `messages_service.py`. In the backend checkout do not `git stash`, `reset --hard` or overwrite `.env` — use a worktree if the tree is dirty.

## 6. Out of scope

- Uploading video files to our own CDN for team demos.
- Server-side host validation or a server-side availability check.
- Availability checks for Drive / Vimeo / Loom (no reliable anonymous browser endpoint).
- A "remove video" button.
- Judge pages, rubric, judging schedule — untouched (they already read `demo_video_url` through `VideoDisplay`, so they gain Shorts/Live/unlisted-Vimeo playback for free).

## 7. PR description — test plan (pages to click through)

On `test.ohack.dev`, logged in as a member of an approved team:

1. `/hack/<event>/manageteam#demo` — steps, helper text and the closed disclosure render; open the disclosure; layout holds at 375px wide.
2. Paste each and Save: a `youtu.be` link, a `youtube.com/shorts/…` link, an unlisted Vimeo link (`vimeo.com/<id>/<hash>`), a Loom share link, a Drive file link → thumbnail/tile appears, the dialog plays each.
3. Paste a YouTube Studio link, a playlist link and a Drive folder link → each shows its own message, Save does nothing.
4. Paste a **Private** YouTube video link → the Unlisted hint appears, Save still works; switch the video to Unlisted → "Check again" clears it.
5. "Check it plays ↗" opens the saved link in a new tab.
6. `/hack/<event>/team/<team_id>` and the event page team card — the saved Shorts and unlisted-Vimeo videos play.
7. `/admin/hackathons/<event>?section=teams` → Demo Video popover: a Shorts link is accepted; a Studio link shows the specific message.
8. `/judge/<event>/team/<team_id>` (Round 1) — demo video still embeds.
9. A public profile with a bio video (`/u/<slug>`) — raw `.mp4` still plays (VideoDisplay regression check).
