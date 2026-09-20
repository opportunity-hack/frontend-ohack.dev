/**
 * Pure state helpers for the team dashboard's deadline strip and
 * deliverables checklist (WS-B, Appendix B4). No fetching, no window —
 * everything here derives from data the page already has.
 *
 * `canSubmit`/`submitBlockedReason` are deadline-independent by design
 * (Part 2.1 of the plan: the Submit action is "disabled with reason until
 * story+video" — nothing else). The backend is the authority on the
 * deadline itself: attempting to submit past a closed window 409s
 * (`submissions_closed`), which `ProjectWriteupEditor` surfaces inline.
 * `deadlineState` (used by `DeadlineStrip`) is the presentational
 * counterpart that *does* reason about the deadline, for the countdown.
 */

import { repoEntriesFromTeam } from "./githubLinks";
import { DEFAULT_EVENT_TIMEZONE } from "./timezoneUtils";
import { isWinningStatus } from "../constants/teamStatus";
import { COMPLETION_VISIBLE_STATUSES } from "../components/Teams/teamPageData";

const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

/** Parses a "GMT-7" / "GMT-07:00" offset string into minutes (e.g. -420). */
function parseGmtOffsetMinutes(offsetLabel) {
  const match = /GMT([+-])(\d{1,2})(?::?(\d{2}))?/.exec(offsetLabel || "");
  if (!match) return 0;
  const sign = match[1] === "-" ? -1 : 1;
  const hours = parseInt(match[2], 10) || 0;
  const mins = match[3] ? parseInt(match[3], 10) : 0;
  return sign * (hours * 60 + mins);
}

/**
 * The instant corresponding to 23:59:59 local time, on `dateStr`
 * ("YYYY-MM-DD"), in the given IANA `timezone`. Used as the display-only
 * deadline fallback (`deadlineState`'s `event_ends` kind) when an event has
 * no explicit `deadlines.submission`. Returns null for a missing/
 * unparseable date.
 */
export function endOfEventDay(dateStr, timezone) {
  if (!dateStr) return null;
  const tz = timezone || DEFAULT_EVENT_TIMEZONE;
  // Noon UTC as a stable probe — lands on the same calendar day in every
  // real-world IANA zone, so the offset it reports is the right one for
  // the end of that calendar day.
  const probeMs = Date.parse(`${dateStr}T12:00:00Z`);
  if (Number.isNaN(probeMs)) return null;
  let offsetMinutes = 0;
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      timeZoneName: "shortOffset",
    }).formatToParts(new Date(probeMs));
    const tzPart = parts.find((p) => p.type === "timeZoneName");
    offsetMinutes = parseGmtOffsetMinutes(tzPart?.value);
  } catch {
    offsetMinutes = 0;
  }
  const endOfDayUtcMs =
    Date.parse(`${dateStr}T23:59:59Z`) - offsetMinutes * 60000;
  if (Number.isNaN(endOfDayUtcMs)) return null;
  return new Date(endOfDayUtcMs);
}

/**
 * `{ kind, target, label, urgent }` describing where a team stands relative
 * to the submission deadline, for the `DeadlineStrip` countdown.
 *
 * - `kind`: 'submitted' | 'open' | 'late_open' | 'closed' | 'event_ends' | 'none'
 * - `target`: the Date the countdown/label refers to, or null
 * - `label`: a short lead-in ("Submissions close in", "Late submissions
 *    open until", "Submissions closed", "Event ends in", "")
 * - `urgent`: true when open and under 6 hours remain
 */
export function deadlineState({
  deadlines,
  endDate,
  timezone,
  submissionStatus,
  submittedAt,
  now = Date.now(),
} = {}) {
  const tz = timezone || DEFAULT_EVENT_TIMEZONE;
  const submissionIso = deadlines?.submission || null;
  const lateUntilIso = deadlines?.late_submission_until || null;
  const submissionTarget = submissionIso ? new Date(submissionIso) : null;
  const lateTarget = lateUntilIso ? new Date(lateUntilIso) : null;

  // Submitted overrides every other state, even past a since-closed deadline.
  if (
    submissionStatus === "submitted" ||
    submissionStatus === "late" ||
    submittedAt
  ) {
    return {
      kind: "submitted",
      target: submittedAt ? new Date(submittedAt) : null,
      label: "Submitted",
      urgent: false,
    };
  }

  if (submissionTarget && !Number.isNaN(submissionTarget.getTime())) {
    if (now < submissionTarget.getTime()) {
      const urgent = submissionTarget.getTime() - now < SIX_HOURS_MS;
      return {
        kind: "open",
        target: submissionTarget,
        label: "Submissions close in",
        urgent,
      };
    }
    // Past the main deadline — late window still open?
    if (
      lateTarget &&
      !Number.isNaN(lateTarget.getTime()) &&
      now < lateTarget.getTime()
    ) {
      return {
        kind: "late_open",
        target: lateTarget,
        label: "Late submissions open until",
        urgent: false,
      };
    }
    return {
      kind: "closed",
      target: submissionTarget,
      label: "Submissions closed",
      urgent: false,
    };
  }

  // No explicit deadline — fall back to the event's own end-of-day.
  const fallbackTarget = endOfEventDay(endDate, tz);
  if (fallbackTarget) {
    if (now < fallbackTarget.getTime()) {
      return {
        kind: "event_ends",
        target: fallbackTarget,
        label: "Event ends in",
        urgent: false,
      };
    }
    return {
      kind: "closed",
      target: fallbackTarget,
      label: "Event ended",
      urgent: false,
    };
  }

  return { kind: "none", target: null, label: "", urgent: false };
}

function hasRepoLink(team) {
  return repoEntriesFromTeam(team).length > 0;
}

function hasStory(team) {
  return Boolean(team?.project_tagline && team?.project_story);
}

function hasVideo(team) {
  return Boolean(team?.demo_video_url);
}

function isSubmitted(team) {
  return Boolean(team?.project_submitted_at);
}

/**
 * Rolls a `use-github-activity` `byRepo` map into the flat
 * `{ commits: { total_recent } }` shape `deriveDeliverables` reads — summed
 * across every repo linked to the team, since a team may have more than one.
 */
export function summarizeGithubActivity(byRepo) {
  const repos =
    byRepo && typeof byRepo === "object" ? Object.values(byRepo) : [];
  const totalRecent = repos.reduce(
    (sum, r) => sum + Number(r?.commits?.total_recent || 0),
    0,
  );
  return { commits: { total_recent: totalRecent } };
}

/**
 * `{ items, done, total, canSubmit, submitBlockedReason }` — the "What your
 * team owes" checklist. `total`/`done` count only the non-optional items
 * (the DevPost link is optional; the Definition of Done row only appears
 * for winning/completion-eligible teams and is its own finish line, not
 * part of the main count).
 */
export function deriveDeliverables({ team, activity, slackConfirmed } = {}) {
  const repoExists = hasRepoLink(team);
  const commitsExist = Number(activity?.commits?.total_recent || 0) > 0;
  const story = hasStory(team);
  const video = hasVideo(team);
  const submitted = isSubmitted(team);
  const canSubmit = story && video && !submitted;
  const submitBlockedReason =
    !submitted && (!story || !video)
      ? "Add your story and demo video first"
      : null;

  const items = [
    {
      key: "slack",
      label: "Join your Slack channel",
      state: slackConfirmed ? "done" : "todo",
      href: "#slack",
      hint: slackConfirmed
        ? null
        : "Everyone on your team should join the channel",
    },
    {
      key: "code",
      label: "Push code to your repo",
      state: !repoExists ? "locked" : commitsExist ? "done" : "todo",
      href: "#code",
      hint: !repoExists
        ? "Repository not yet created"
        : commitsExist
          ? null
          : "No commits yet",
    },
    {
      key: "story",
      label: "Write your project story",
      state: story ? "done" : "todo",
      href: "#project",
      hint: story ? null : "Judges read this before they watch anything",
    },
    {
      key: "video",
      label: "Add a demo video",
      state: video ? "done" : "todo",
      href: "#demo",
      hint: video ? null : "4 minutes or less",
    },
    {
      key: "submit",
      label: "Submit your project",
      state: submitted ? "done" : story && video ? "todo" : "locked",
      href: "#project",
      hint: submitted ? null : submitBlockedReason,
    },
    {
      key: "devpost",
      label: "Link your DevPost project (optional)",
      state: team?.devpost_link ? "done" : "optional",
      href: "#devpost",
      hint: null,
    },
  ];

  if (
    isWinningStatus(team?.status) ||
    COMPLETION_VISIBLE_STATUSES.has(team?.status)
  ) {
    items.push({
      key: "completion",
      label: "Finish the Definition of Done",
      state: team?.completion_status === "complete" ? "done" : "todo",
      href: `/hack/${team?.hackathon_event_id}/team/${team?.id}/completion`,
      hint: null,
    });
  }

  const countable = items.filter(
    (i) => i.state !== "optional" && i.key !== "completion",
  );
  const done = countable.filter((i) => i.state === "done").length;
  const total = countable.length;

  return { items, done, total, canSubmit, submitBlockedReason };
}
