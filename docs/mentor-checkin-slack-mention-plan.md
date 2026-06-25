# Mentor Check-in → `#ask-a-mentor` "None has checked in" Fix

**Symptom:** When a mentor checks in, `#ask-a-mentor` shows
> :reversecongaparrot: *Mentor Available!*
> **None** has checked in and is available to help teams!

**Audience:** executable by Sonnet 4.6. Backend repo: `backend-ohack.dev`; frontend: `frontend-ohack.dev`.

**Desired end state:**

1. Never render the literal `None`.
2. When the mentor has a Slack account, `@`-mention them **and** link to their public OHack profile.
3. When the mentor has **no** Slack account, **don't post the announcement at all** (they can't be reached
   in Slack, so the message is noise) — and tell them in the UI how to fix it.

---

## Root cause

`services/volunteers_service.py::send_mentor_checkin_notification` (L1859-1925):

```python
slack_user_id = volunteer.get('slack_user_id', '')      # L1872
name_mention = f"<@{slack_user_id}>" if slack_user_id else None   # L1877  ← bug
...
{name_mention} has checked in and is available to help teams!     # L1903 → "None ..."
```

`slack_user_id` is only stamped onto the volunteer doc **at application time**, via
`get_slack_user_by_email(email)` (L1006-1009). A mentor who logged in/applied with **Google** (or whose
email wasn't in the Slack workspace yet) has an **empty** `slack_user_id`, so `name_mention` becomes `None`
and the f-string prints "None". (The checkout notification, L1944, already falls back to a name — check-in
does not.)

### Building blocks that already exist (reuse them)

- **Slack lookup by email:** `common/utils/slack.py::get_slack_user_by_email(email)` (L137) → returns the
  Slack user object (`id`, `name`, `real_name`, `profile`) or `None`. Already cached 24h/1h + rate-limited.
  **Already imported** into `volunteers_service.py` (L12, used at L1007).
- **Profile db id resolvers:** `common/utils/firebase.py::get_user_by_user_id(user_id)` (L101) and
  `get_user_by_email(email)` (L125) each return a dict with `["id"]` = the Firestore **users doc id**, which
  is exactly what the public profile route `/profile/{db_id}` needs. **These are NOT yet imported** into
  `volunteers_service.py` — add the import.
- **Frontend base URL:** hardcode `https://www.ohack.dev` (already used in this file, e.g. L242).
- The `volunteer` dict passed to the notifier (from `mentor_checkin`, L1700) contains `id` (doc id),
  `user_id` (OAuth), `email`, `slack_user_id`, and a display name under `name` or `firstName`/`lastName`.

---

## Backend changes — `services/volunteers_service.py`

### 1. Add imports (top of file, near L12)

```python
from common.utils.firebase import get_user_by_user_id, get_user_by_email
```

### 2. Rewrite `send_mentor_checkin_notification` (L1859-1925) to resolve → gate → enrich

**a. Resolve a Slack id robustly (handles the Google-login case):**

- `slack_user_id = volunteer.get('slack_user_id')`.
- If empty, look it up now: `slack_info = get_slack_user_by_email(volunteer.get('email'))`; if it returns a
  user, `slack_user_id = slack_info['id']`. This catches mentors who logged in with Google but **do** have a
  Slack account under the same email (the common case).
- *(Best-effort persistence, optional)* If we resolved an id this way, write it back to the volunteer doc
  (`db.collection('volunteers').document(volunteer['id']).update({'slack_user_id': slack_user_id})`) and
  clear caches, wrapped in try/except — so future check-ins/DMs skip the lookup.

**b. Gate the post on having a Slack identity:**

- If `slack_user_id` is still falsy → **return `False` without posting** (log at info: "mentor X has no Slack
  account; skipping #ask-a-mentor announcement"). This satisfies requirement #3 and removes the "None" spam.

**c. Build the message (only reached with a real `slack_user_id`):**

- `name_mention = f"<@{slack_user_id}>"` (always set now).
- Resolve the public profile db id:
  `user = get_user_by_user_id(volunteer.get('user_id')) or get_user_by_email(volunteer.get('email'))`; if
  found, `profile_url = f"https://www.ohack.dev/profile/{user['id']}"`.
- Display name for the link text: `volunteer.get('name')` or
  `f"{volunteer.get('firstName','')} {volunteer.get('lastName','')}".strip()` or the Slack `real_name`.
- Add a profile line when resolved: `*Profile:* <{profile_url}|View {display_name}'s profile>` (Slack link
  syntax). Omit the line entirely when no db id resolves (don't print a broken/empty link).
- Keep the existing expertise / specialties / time-slot / LinkedIn / in-person lines.
- The trailing CTA (L1911) already references `name_mention` twice — safe now that it's always a real mention.

### 3. Leave `mentor_checkin` (L1686) as-is

It already wraps the notifier in try/except (L1761-1764) and returns `slackNotificationSent` (now `False`
when we skip). No change needed beyond the notifier returning `False` on the skip path.

---

## Frontend change — `src/pages/hack/[event_id]/mentor-checkin.js`

Today the check-in success handler (L522-527) **always** claims a Slack message was sent:

```js
setSnackbarMessage('Checked in successfully! A message has been sent to #ask-a-mentor ...');
```

The POST response now carries `slackNotificationSent`. Branch on it:

- `response.data.slackNotificationSent === true` → keep the current "announced in #ask-a-mentor" message.
- otherwise → "You're checked in! To be announced in **#ask-a-mentor** and reachable by teams, join our Slack
  with the email on your application, then check in again." (link to the Slack join / `/signup`).

This is the UX surface for requirement #3 — the mentor learns *why* no announcement went out and how to fix
it. (The hard guarantee against "None" is the backend gate; this is just the explanation.)

---

## Edge cases

- **Slack lookup miss is cached 1h** (`_EMAIL_USER_MISS_CACHE`) — a mentor who joins Slack mid-event may not
  resolve until the negative cache expires; acceptable. Persisting the resolved id (step 2a) avoids repeat
  lookups for hits.
- **Deactivated Slack account:** `users.lookupByEmail` still returns the user object → mention still works.
- **No users-collection doc** (mentor never created an OHack profile): profile line is omitted; the mention
  + expertise still post. No broken link.
- **Rate limiting:** `get_slack_user_by_email` is `@limits(calls=20, period=60)` + `@sleep_and_retry`; one
  extra call per check-in is well within budget.

---

## Suggested execution order

1. Backend: add imports; rewrite `send_mentor_checkin_notification` (resolve → gate → mention + profile line);
   optional write-back of resolved `slack_user_id`.
2. Frontend: branch the check-in success snackbar on `slackNotificationSent`.

## Risk / safety

- Backend change is contained to one notifier function + two new imports; `mentor_checkin` behavior is
  unchanged except `slackNotificationSent=False` on the skip path (already handled by callers).
- Reuses existing, already-cached/rate-limited helpers — no new external-call patterns.
- Profile link uses the public `/profile/{db_id}` route (already public); no PII exposure beyond what the
  profile page already shows.
- Net effect: fewer, higher-quality `#ask-a-mentor` posts (no unmentionable "None" announcements).
