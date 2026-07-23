# Plan: Make leaderboard badges & "Teams Ready for a Boost" self-explanatory

**Audience for this doc:** an engineer (Sonnet 4.6) executing the change.
**Goal:** On `/hack/[event_id]#stats`, make it obvious (a) what each leaderboard
badge means and (b) **why** a team is flagged under "Teams Ready for a Boost" and
**what a mentor can do** about it.

This is mostly a **frontend** change to one component. There is one small,
**recommended** backend enrichment (Phase 2) that hardens the frontend logic but is
not required for the UX win.

---

## 0. Where this lives

- Page: `src/pages/hack/[event_id].js` — the `#stats` section (~line 1372) renders
  `<HackathonLeaderboard … />`.
- Component (the only required file to edit): **`src/components/Hackathon/HackathonLeaderboard.js`**
- Backend data source (Phase 2 only): **`backend-ohack.dev/api/leaderboard/leaderboard_service.py`**
  → `collect_mentor_panel_opportunities()` and `categorize_mentor_opportunities()`.
- The component fetches `GET {NEXT_PUBLIC_API_SERVER_URL}/api/leaderboard/{eventId}` and reads
  `data.mentorOpportunities`.

### Current `mentorOpportunities[]` item shape (from backend, today)

```jsonc
{
  "type": "mentor_opportunity",
  "team": "Team Phoenix",
  "teamPage": "https://www.ohack.dev/hack/2026_spring_wics_asu/team/abc123", // ABSOLUTE url (panel-derived)
  "icon": "flag",                  // "flag" (open/blocked flag) | "schedule" (stale) | "rocket_launch" (github-derived)
  "value": "Blocked",             // "Blocked" | "Open flag" | "No mentor touch in 4h"
  "description": "Priya: stuck on auth redirect loop…", // THE REASON — currently not rendered!
  "members": 4
}
```

> Note: GitHub-achievement-derived opportunities (from `categorize_mentor_opportunities`)
> can have a `teamPage` that is a **bare repo slug**, not an absolute URL. Handle both.

---

## 1. Problems to fix (the "why")

1. **The reason is invisible.** The boost card renders `team`, `value`, and `members`
   but **drops `description`** entirely — so a viewer can't tell why a team is listed.
2. **Broken link.** The card href is `getGitHubTeamUrl(opportunity.teamPage)`, which for
   panel-derived items produces `https://github.com/{org}/https://www.ohack.dev/...` —
   a dead link. It should go to the **team page** (`/hack/{event_id}/team/{team_id}`),
   where the `MentorTeamPanel` and completion checklist live and a mentor can actually act.
3. **Wrong icons.** `getIconComponent`'s `iconMap` has no `flag`, `schedule`, or `group`
   entries, so those fall through to the keyword fallback and end up as a generic ⭐
   (`StarIcon`) with a `console.warn`.
4. **No criteria explanation.** Nothing tells the reader how a team lands in this section,
   what the colors/labels mean, or what a mentor should do next.
5. **Badges (Individual / Team Achievements) don't explain themselves.** The criteria
   (`description`, e.g. "Highest number of code commits") is crammed into a 0.65rem,
   `noWrap`, right-aligned caption that truncates to nothing. Titles like "Night Owl" /
   "Epic PR" have an icon beside them with no tooltip.

---

## 2. Goals / non-goals

**Goals**
- Each boost card shows: a **reason chip** (icon + label + color), the **why** (the
  `description`, always visible — not hover-only), a **"How to help"** line for mentors,
  and a working **CTA to the team page**.
- A short section explainer + a **legend** that states the flagging criteria.
- Fix the icon map and the broken link.
- Make achievement badge meanings legible (visible description + a criteria tooltip/legend).

**Non-goals**
- No redesign of the General Statistics tiles (they already have working tooltips).
- No new data pipeline. No auth/role gating inside the leaderboard (it's public; the
  card CTA sends people to the team page, which already does role-appropriate UI).
- Don't introduce gradients/rainbow chips — stay within the refined design system
  (navy `#1B3A6B`, terracotta `#E2552E`, hairline `#E7E1D4`, Fraunces/Hanken). Use at
  most 3 *semantic* status colors (blocked=red, attention=terracotta, stale=navy).

---

## 3. Target design (boost card)

```
┌────────────────────────────────────────────────┐  ← 4px left border = reason color
│  ⛳  Team Phoenix                  [ Blocked ]    │
│      4 members                                   │
│                                                  │
│  Priya: stuck on a Firebase auth redirect loop,  │  ← WHY (description, always visible)
│  can't log in to test.                           │
│                                                  │
│  HOW TO HELP  This team is blocked. Open their   │  ← mentor action (per-reason copy)
│  team page, read the flag, and hop into their    │
│  Slack channel to help unblock them.             │
│                                                  │
│  View team & how to help  ↗                      │  ← single CTA → /hack/{id}/team/{tid}
└────────────────────────────────────────────────┘
```

Section header gains an ℹ️ tooltip ("How teams land here") + a legend chip row:
`[⛳ Blocked]  [⛳ Needs attention]  [🕒 No recent mentor visit]`.

---

## 4. Implementation — Phase 1 (frontend, REQUIRED)

All edits are in `src/components/Hackathon/HackathonLeaderboard.js`.

> Line numbers below are approximate — anchor on the quoted code, not the numbers.

### 4.1 Add icon imports

Near the other `@mui/icons-material` imports (top of file), add:

```js
import FlagIcon from '@mui/icons-material/Flag';
import ScheduleIcon from '@mui/icons-material/Schedule';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
```

(`GroupIcon` is already imported but unused — we'll use it now.)

### 4.2 Fix the icon map

In `getIconComponent`, inside the `iconMap` object (currently ends around the
`rocket_launch` entry), add three entries:

```js
    rocket_launch: <RocketLaunchIcon {...defaultProps} />,
    group: <GroupIcon {...defaultProps} />,
    flag: <FlagIcon {...defaultProps} />,
    schedule: <ScheduleIcon {...defaultProps} />,
```

This fixes the ⭐-everywhere bug for boost cards **and** the "Largest Team" badge.

### 4.3 Add module-scope `BOOST_REASONS` map + resolver

Place this **at module scope** (outside the component, e.g. just above
`const HackathonLeaderboard = (...) =>`). Module scope matters: defining it inside the
component reallocates it every render. The mentor-action copy lives here so it's easy
to iterate without a backend deploy.

```js
// Reason taxonomy for "Teams Ready for a Boost".
// `reason_code` is supplied by the backend (Phase 2); we infer it when absent.
const BOOST_REASONS = {
  blocked_flag: {
    label: 'Blocked',
    color: '#C62828', // red — urgent
    bg: 'rgba(198,40,40,0.07)',
    icon: 'flag',
    mentorAction:
      'This team is blocked. Open their team page, read the flag, and hop into their Slack channel to help unblock them.',
  },
  open_flag: {
    label: 'Needs attention',
    color: '#E2552E', // terracotta accent
    bg: 'rgba(226,85,46,0.07)',
    icon: 'flag',
    mentorAction:
      'A mentor flagged something here. Review the flag on the team page and offer guidance — or take it over.',
  },
  stale_no_touch: {
    label: 'No recent mentor visit',
    color: '#1B3A6B', // brand navy — a gentle nudge, not an alarm
    bg: 'rgba(27,58,107,0.05)',
    icon: 'schedule',
    mentorAction:
      'No mentor has checked in for 4+ hours. Drop by their table or Slack, then log a quick coverage note on the team page.',
  },
  default: {
    label: 'Could use a boost',
    color: '#1B3A6B',
    bg: 'rgba(27,58,107,0.05)',
    icon: 'rocket_launch',
    mentorAction:
      'Check this team’s recent activity and help them get their project moving.',
  },
};

function resolveBoostReason(opp) {
  if (opp?.reason_code && BOOST_REASONS[opp.reason_code]) {
    return BOOST_REASONS[opp.reason_code];
  }
  // Fallback inference for when the backend hasn't sent reason_code yet.
  const value = (opp?.value || '').toLowerCase();
  if (opp?.icon === 'flag' && value.includes('block')) return BOOST_REASONS.blocked_flag;
  if (opp?.icon === 'flag') return BOOST_REASONS.open_flag;
  if (opp?.icon === 'schedule' || value.includes('no mentor touch')) return BOOST_REASONS.stale_no_touch;
  return BOOST_REASONS.default;
}
```

### 4.4 Replace the "Teams Ready for a Boost" block

Find the block that begins:

```js
      {mentorOpportunities && mentorOpportunities.length > 0 && (
        <Box sx={{ display: { xs: 'block', sm: 'none', md: 'block' } }}>
          <SectionHeader variant="h6">
            <RocketLaunchIcon sx={{ mr: 1, verticalAlign: 'middle', color: 'warning.main' }} />
            Teams Ready for a Boost
          </SectionHeader>
          ... (existing card .map) ...
        </Box>
      )}
```

…and replace the **entire** `{mentorOpportunities && … )}` expression with:

```jsx
      {mentorOpportunities && mentorOpportunities.length > 0 && (
        <Box sx={{ display: { xs: 'block', sm: 'none', md: 'block' } }}>
          <SectionHeader variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <RocketLaunchIcon sx={{ verticalAlign: 'middle', color: 'var(--accent, #E2552E)' }} />
            Teams Ready for a Boost
            <Tooltip
              arrow
              placement="top"
              title={
                <Box sx={{ p: 0.5 }}>
                  <Typography variant="subtitle2" gutterBottom>How teams land here</Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    <b>Blocked / Needs attention</b> — a mentor raised a flag on the team page.
                  </Typography>
                  <Typography variant="body2">
                    <b>No recent mentor visit</b> — no mentor has checked in for 4+ hours during the event.
                  </Typography>
                </Box>
              }
            >
              <InfoOutlinedIcon fontSize="small" sx={{ color: 'var(--muted, #5B6270)', cursor: 'help' }} />
            </Tooltip>
          </SectionHeader>

          <Typography variant="body2" color="textSecondary" sx={{ mb: 1.5 }}>
            These teams could use mentor support right now. Each card shows <b>why</b> it&apos;s
            listed and <b>how a mentor can help</b>. If this is your team, open your team page to
            see details and message mentors in Slack.
          </Typography>

          {/* Legend — states the criteria at a glance */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {['blocked_flag', 'open_flag', 'stale_no_touch'].map((k) => (
              <Chip
                key={k}
                size="small"
                variant="outlined"
                icon={renderIcon(BOOST_REASONS[k].icon, { fontSize: 'small' })}
                label={BOOST_REASONS[k].label}
                sx={{
                  borderColor: BOOST_REASONS[k].color,
                  color: BOOST_REASONS[k].color,
                  '& .MuiChip-icon': { color: BOOST_REASONS[k].color },
                }}
              />
            ))}
          </Box>

          <Grid container spacing={2}>
            {mentorOpportunities.map((opportunity, index) => {
              const reason = resolveBoostReason(opportunity);
              const tp = opportunity.teamPage;
              const isAbsolute = !!tp && /^https?:\/\//i.test(tp);
              const href = isAbsolute ? tp : (tp ? getGitHubTeamUrl(tp) : null);
              const ctaLabel = isAbsolute ? 'View team & how to help' : 'View on GitHub';

              return (
                <Grid size={{ xs: 12, md: 6 }} key={index}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1,
                      p: 2,
                      height: '100%',
                      borderRadius: '10px',
                      backgroundColor: reason.bg,
                      border: '1px solid var(--line, #E7E1D4)',
                      borderLeft: `4px solid ${reason.color}`,
                    }}
                  >
                    {/* Header: avatar + team + reason chip + members */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ width: 40, height: 40, bgcolor: reason.color, flexShrink: 0 }}>
                        {renderIcon(reason.icon, { sx: { color: '#fff' } })}
                      </Avatar>
                      <FlexContent flexGrow={1}>
                        <TruncatedText variant="subtitle1" fontWeight="bold" title={opportunity.team}>
                          {opportunity.team}
                        </TruncatedText>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.25 }}>
                          <Chip
                            size="small"
                            label={reason.label}
                            sx={{
                              bgcolor: reason.color,
                              color: '#fff',
                              fontWeight: 700,
                              height: 20,
                              '& .MuiChip-label': { px: 1, fontSize: '0.7rem' },
                            }}
                          />
                          {typeof opportunity.members === 'number' && (
                            <Typography variant="caption" color="textSecondary">
                              {opportunity.members} members
                            </Typography>
                          )}
                        </Box>
                      </FlexContent>
                    </Box>

                    {/* WHY — always visible */}
                    {opportunity.description && (
                      <Typography variant="body2" sx={{ color: 'var(--ink, #16181D)' }}>
                        {opportunity.description}
                      </Typography>
                    )}

                    {/* HOW TO HELP — mentor action */}
                    <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'flex-start' }}>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                          color: 'var(--muted, #5B6270)',
                          flexShrink: 0,
                          mt: '2px',
                        }}
                      >
                        How to help
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {opportunity.mentor_action || reason.mentorAction}
                      </Typography>
                    </Box>

                    {/* CTA — single anchor, no nested <a> */}
                    {href && (
                      <Box sx={{ mt: 'auto', pt: 0.5 }}>
                        <Button
                          component="a"
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          size="small"
                          endIcon={<LaunchIcon />}
                          sx={{ textTransform: 'none', fontWeight: 600, color: reason.color }}
                        >
                          {ctaLabel}
                        </Button>
                      </Box>
                    )}
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}
```

**Key fixes baked in above:**
- Renders `opportunity.description` (the *why*) — previously dropped.
- `href` uses the absolute team URL directly; only falls back to `getGitHubTeamUrl()`
  for bare repo slugs. No more `github.com/{org}/https://…` dead links.
- Correct per-reason icon + color + label, and a per-reason "How to help" line.
- Card is a plain `Box` with a single `<Button component="a">` CTA — **no nested
  anchors** (avoids the nested-anchor bug noted in CLAUDE.md for other cards).

### 4.5 Make achievement badge meanings legible (secondary, but in scope)

Two small edits so "what does this badge mean" is answerable without guessing.

**(a) Add a criteria map at module scope** (next to `BOOST_REASONS`):

```js
const BADGE_CRITERIA = {
  'Most Commits': 'Most code commits by one person',
  'Epic PR': 'Largest merged pull request',
  'First to Commit': 'First person to push code',
  'Night Owl': 'Most commits late at night',
  'Most Productive Team': 'Highest number of commits',
  'Most Collaborative': 'Most pull requests merged',
  'Largest Team': 'Most unique contributors',
};
```

**(b) Team Achievements — show the criteria, don't truncate it.**
In the Team Achievements `.map`, the `description` is currently only in the
right-hand `noWrap` 0.65rem caption (illegible). Add a visible, wrapping criteria line
inside the main content column, right after the `{achievement.team} • {achievement.members} members`
`TruncatedText`:

```jsx
{(BADGE_CRITERIA[achievement.title] || achievement.description) && (
  <Typography
    variant="caption"
    color="textSecondary"
    sx={{ display: 'block', mt: 0.25, whiteSpace: 'normal', lineHeight: 1.3 }}
  >
    {BADGE_CRITERIA[achievement.title] || achievement.description}
  </Typography>
)}
```

(You may leave the existing right-column caption as-is, or drop it to avoid duplication —
either is fine; the new line is the one that's actually readable.)

**(c) Individual Achievements — tooltip on the title.**
Wrap the individual-achievement title `TruncatedText` in a `Tooltip` so hovering the
badge name explains it:

```jsx
<Tooltip arrow title={BADGE_CRITERIA[achievement.title] || achievement.description || ''}>
  <TruncatedText variant="subtitle1" fontWeight="bold" title={achievement.title} sx={{ fontSize: { xs: '0.95rem', md: '1rem' } }}>
    {achievement.title}
  </TruncatedText>
</Tooltip>
```

> Tooltips are hover-only (no touch). That's acceptable for the *individual* badges
> (dense, decorative). For the **boost** cards and **team** badges we use always-visible
> text per 4.4/4.5b, because that's where "why" genuinely matters.

### 4.6 (Optional) stop hiding the section at the `sm` breakpoint

The boost `<Box>` (and the achievement boxes) use
`display: { xs: 'block', sm: 'none', md: 'block' }`, which hides them on tablet-width
(`sm`, 600–900px). "Why is my team flagged" matters on tablets too. If product agrees,
change the boost section to `display: 'block'`. Leave the achievement boxes as-is unless
asked — their hidden-at-`sm` behavior predates this work and may be intentional for layout.

---

## 5. Implementation — Phase 2 (backend, RECOMMENDED, low-risk)

Makes the frontend's reason mapping exact instead of string-sniffing. Additive only —
the frontend already falls back when these fields are absent, so this can ship later.

File: `backend-ohack.dev/api/leaderboard/leaderboard_service.py`,
function `collect_mentor_panel_opportunities()`.

**Open-flag dict** — add `reason_code` (and keep everything else):

```python
sev = f.get("severity", "needs_attention")
reason_code = "blocked_flag" if sev == "blocked" else "open_flag"
opportunities.append({
    "type": "mentor_opportunity",
    "team": team_name,
    "teamPage": f"https://www.ohack.dev/hack/{event_id}/team/{team_id}",
    "icon": "flag",
    "reason_code": reason_code,                       # NEW
    "value": "Blocked" if sev == "blocked" else "Open flag",
    "description": f"{f.get('raised_by_name', 'Mentor')}: {preview}",
    "members": len(t.get("users") or []),
})
```

**Stale "no mentor touch" dict** — add:

```python
    "reason_code": "stale_no_touch",                  # NEW
```

(Optional) In `categorize_mentor_opportunities()` you may set
`opp.setdefault("reason_code", "default")` for GitHub-achievement-derived items; the
frontend already treats missing/unknown codes as `default`, so this is cosmetic.

> `_MENTOR_OPPS_CACHE` has a 5-min TTL — after deploy, allow up to 5 min for cached
> responses to refresh.

---

## 6. Data shapes — before vs after

| Field            | Before        | After                                                        |
| ---------------- | ------------- | ------------------------------------------------------------ |
| `reason_code`    | —             | `blocked_flag` \| `open_flag` \| `stale_no_touch` \| `default` (Phase 2; inferred on FE if absent) |
| `description`    | sent, unused  | **rendered as the "why" line**                               |
| `mentor_action`  | —             | optional FE-authored copy per reason (no BE field required)  |
| CTA `href`       | broken nested URL | absolute team URL (or GitHub for repo-slug items)        |

---

## 7. Edge cases to handle

- **`teamPage` absolute vs bare slug.** Use the `isAbsolute` regex test (4.4). Don't
  blindly call `getGitHubTeamUrl`.
- **Missing `teamPage`.** Render the card without a CTA (don't render a dead button).
- **Missing `description`.** Skip the why line; the reason chip + "How to help" still
  convey meaning.
- **Unknown / missing `reason_code` and unknown `icon`.** Falls to `BOOST_REASONS.default`.
- **`members` missing/non-numeric.** Guarded with `typeof … === 'number'`.
- **Empty `mentorOpportunities`.** Section doesn't render (unchanged). Don't add an empty
  state — it would show year-round; the section is only meaningful during the live window.

---

## 8. Design-system invariants to respect (don't regress)

- Use refined tokens with CSS-var fallbacks: `var(--brand,#1B3A6B)`, `var(--accent,#E2552E)`,
  `var(--line,#E7E1D4)`, `var(--ink,#16181D)`, `var(--muted,#5B6270)`. This component is
  **not** inside a `RefinedRoot`, so the literal fallbacks must stay.
- Keep it calm: at most 3 semantic status colors (red/terracotta/navy). No gradients,
  no rainbow chips.
- Reuse existing styled atoms (`SectionHeader`, `FlexContent`, `TruncatedText`, `renderIcon`).
- No nested anchors (card = `Box`, CTA = single `<Button component="a">`).
- `BOOST_REASONS` / `BADGE_CRITERIA` / `resolveBoostReason` at **module scope**, not inside
  the component.
- No new above-the-fold async work; no raw `<img>`; this is below the fold and CWV-neutral.

---

## 9. Testing — IMPORTANT gotcha

`collect_mentor_panel_opportunities()` **short-circuits to `[]` unless the event is in its
live window** (`start_date <= now <= end_date + 1 day`). For `2026_spring_wics_asu` on a
non-event day, `mentorOpportunities` will be empty and the section won't render — so you
can't see your change against the live API.

To verify visually, temporarily mock the data in `HackathonLeaderboard.js` (in
`fetchLeaderboardData`, right after the `setMentorOpportunities(...)` line), then **remove
before commit**:

```js
// TEMP — local visual test only; DELETE before commit.
setMentorOpportunities([
  { type:'mentor_opportunity', team:'Team Phoenix', teamPage:'https://www.ohack.dev/hack/2026_spring_wics_asu/team/abc123', icon:'flag', value:'Blocked', reason_code:'blocked_flag', description:'Priya: stuck on a Firebase auth redirect loop, can\'t log in to test.', members:4 },
  { type:'mentor_opportunity', team:'Data Llamas', teamPage:'https://www.ohack.dev/hack/2026_spring_wics_asu/team/def456', icon:'flag', value:'Open flag', reason_code:'open_flag', description:'Marco: team unsure how to scope an MVP for the nonprofit.', members:3 },
  { type:'mentor_opportunity', team:'Cact.us', teamPage:'https://www.ohack.dev/hack/2026_spring_wics_asu/team/ghi789', icon:'schedule', value:'No mentor touch in 4h', reason_code:'stale_no_touch', description:'No mentor has checked on this team in the last 4 hours — drop by!', members:5 },
]);
```

**Next.js 16 dev cache gotcha (from CLAUDE.md):** dev chunks aren't content-hashed, so a
plain reload can serve stale JS. Disable cache via DevTools (Network → Disable cache) or
CDP before judging the result.

### Manual acceptance checklist

- [ ] Each boost card shows a colored reason chip (Blocked=red, Needs attention=terracotta,
      No recent mentor visit=navy) with the correct icon (⛳ flag / 🕒 schedule) — **no ⭐**.
- [ ] The `description` ("why") is visible on each card.
- [ ] A "How to help" line appears with reason-appropriate guidance.
- [ ] The CTA links to `…/hack/{event_id}/team/{team_id}` (verify in a new tab) — not a
      `github.com/{org}/https://…` URL.
- [ ] Section header has an ℹ️ tooltip and a legend chip row stating the criteria.
- [ ] "Largest Team" / team-achievement icons render correctly (Group icon, not ⭐).
- [ ] Team-achievement criteria text is readable (wraps, not truncated).
- [ ] Hovering an individual badge title shows its meaning.
- [ ] `npx eslint src/components/Hackathon/HackathonLeaderboard.js` is clean.
- [ ] No console warnings like `No icon found for name: flag`.
- [ ] Remove the temp mock from §9.

---

## 10. Files to touch

| File | Phase | Change |
| ---- | ----- | ------ |
| `src/components/Hackathon/HackathonLeaderboard.js` | 1 (required) | icon imports + iconMap; `BOOST_REASONS`/`BADGE_CRITERIA`/`resolveBoostReason`; rewrite boost section; badge criteria text + tooltip |
| `backend-ohack.dev/api/leaderboard/leaderboard_service.py` | 2 (recommended) | add `reason_code` to panel-derived opportunities |

## 11. Out of scope (note for follow-up)

- Positive/empty state ("all teams have recent mentor support 🎉").
- Surfacing the boost section at the `sm` breakpoint for the achievement boxes.
- Any change to General Statistics tiles.
- Deduping when a team has both an open flag *and* is stale (today it can appear twice;
  acceptable — each row is a distinct, actionable reason).
