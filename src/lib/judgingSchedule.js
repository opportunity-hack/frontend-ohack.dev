/**
 * Pure helpers for the public judging schedule (`/hack/[event_id]/judging`),
 * the "Your judging" card and the judge dashboard links.
 *
 * Data comes from two public payloads:
 *   - `GET /api/judge/schedule/<event>` (backend `api/judging/`): panels per
 *     round with room, judges (public fields only) and assigned teams. Empty
 *     until an admin flips `constraints.judging_schedule_published`.
 *   - `GET /api/messages/hackathon/<event>`: the full team docs (status,
 *     demo video, repos, project_* fields) + nonprofits — readiness is
 *     computed from these, never stored server-side.
 *
 * Nothing here touches judging itself (rubric, rounds, scores).
 */
import {
  getSubmissionStatus,
  hasProjectContent,
} from "../components/Teams/projectMeta";
import { normalizeRepoLink, repoEntriesFromTeam } from "./githubLinks";
import { DEFAULT_EVENT_TIMEZONE } from "./timezoneUtils";

export const SCHEDULE_ROUNDS = ["round1", "round2"];

export const ROUND_LABELS = {
  round1: "Round 1",
  round2: "Round 2 — final",
};

export const READY_RULE_COPY =
  "Ready = commits in the repo, a demo video, and a project write-up.";

/** GitHub's commit list is read one page (100) deep by the backend. */
const COMMIT_PAGE_CAP = 100;

/**
 * False only for teams that left the hackathon: `status === "INACTIVE"` or
 * an explicit `active: false` / `"False"`. A missing `active` counts as
 * active (most team docs never set it). IN_REVIEW teams stay visible — an
 * admin assigned them.
 */
export function isTeamActive(team) {
  if (!team) return false;
  if (team.status === "INACTIVE") return false;
  if (team.active === false || team.active === "False") return false;
  return true;
}

/** GitHub-parsable repos for a team (`{ key, org, repo, link }`). */
export function githubReposForTeam(team) {
  return repoEntriesFromTeam(team)
    .filter((r) => r.org && r.repo)
    .map((r) => ({ ...r, key: normalizeRepoLink(r.link) }));
}

/**
 * Code state for one team from `useTeamsGithubActivity`'s `byTeam[id]`
 * (undefined while loading):
 *   no_repo     — no GitHub repo linked
 *   pending     — not checked yet
 *   unavailable — every repo lookup failed (rate limit, private repo, …)
 *   none        — repo exists, zero commits
 *   active      — at least one commit
 */
export function codeState(team, activity) {
  const repos = githubReposForTeam(team);
  const repoUrl = repos[0]?.link || null;
  if (repos.length === 0) {
    return { state: "no_repo", commits: 0, lastCommitAt: null, repoUrl };
  }
  if (!activity) {
    return { state: "pending", commits: 0, lastCommitAt: null, repoUrl };
  }
  if (activity.unavailable) {
    return { state: "unavailable", commits: 0, lastCommitAt: null, repoUrl };
  }
  const commits = Number(activity.commits) || 0;
  return {
    state: commits > 0 ? "active" : "none",
    commits,
    lastCommitAt: activity.lastCommitAt || null,
    repoUrl,
  };
}

/**
 * `{ video, story, submission, code, ready }` for one team. `story` uses
 * `hasProjectContent` because the event payload strips `project_story`.
 * `ready` follows READY_RULE_COPY; a repo GitHub couldn't be reached for is
 * not held against the team (we can't tell), a pending check is not ready
 * yet (so the tag never flaps on load → off).
 */
export function teamReadiness(team, activity) {
  const video = !!team?.demo_video_url;
  const story = hasProjectContent(team);
  const code = codeState(team, activity);
  const codeOk = code.state === "active" || code.state === "unavailable";
  return {
    video,
    story,
    submission: getSubmissionStatus(team),
    code,
    ready: video && story && codeOk,
  };
}

function nonprofitNameMap(eventData) {
  const map = {};
  (Array.isArray(eventData?.nonprofits) ? eventData.nonprofits : []).forEach(
    (n) => {
      if (n?.id) map[n.id] = n.name || "";
    },
  );
  return map;
}

function eventTeamMap(eventData) {
  const map = {};
  (Array.isArray(eventData?.teams) ? eventData.teams : []).forEach((t) => {
    if (t?.id) map[t.id] = t;
  });
  return map;
}

/**
 * The schedule with every panel's teams enriched from the event payload:
 * `{ round1: [panel], round2: [panel] }` where each panel gains
 *   teams          — active teams only, `{ ...scheduleTeam, ...eventTeam, nonprofitName }`
 *   inactiveCount  — assigned teams that left the hackathon (hidden)
 *   panelNonprofits— `[{ id, name }]` unique nonprofits of its active teams
 *                    (the "Problem" line of the old Google Doc)
 * A team missing from the event payload (removed from the event) counts as
 * inactive. `activityByTeam` is optional; when given, each team carries
 * `readiness` and the panel `readyCount`.
 */
export function mergeSchedule(schedule, eventData, activityByTeam) {
  const teamsById = eventTeamMap(eventData);
  const npoNames = nonprofitNameMap(eventData);
  const out = {};
  SCHEDULE_ROUNDS.forEach((round) => {
    const panels = Array.isArray(schedule?.rounds?.[round])
      ? schedule.rounds[round]
      : [];
    out[round] = panels.map((panel) => {
      let inactiveCount = 0;
      const teams = [];
      const npos = new Map();
      (panel.teams || []).forEach((st) => {
        const full = teamsById[st.id];
        if (!full || !isTeamActive(full)) {
          inactiveCount += 1;
          return;
        }
        const npoId = full.selected_nonprofit_id || null;
        const nonprofitName = npoId ? npoNames[npoId] || "" : "";
        if (npoId && nonprofitName && !npos.has(npoId))
          npos.set(npoId, nonprofitName);
        const merged = {
          ...full,
          ...st,
          name: st.name || full.name || "",
          slack_channel: st.slack_channel || full.slack_channel || "",
          nonprofitId: npoId,
          nonprofitName,
        };
        if (activityByTeam) {
          merged.readiness = teamReadiness(merged, activityByTeam[st.id]);
        }
        teams.push(merged);
      });
      return {
        ...panel,
        judges: Array.isArray(panel.judges) ? panel.judges : [],
        teams,
        inactiveCount,
        panelNonprofits: Array.from(npos, ([id, name]) => ({ id, name })),
        readyCount: activityByTeam
          ? teams.filter((t) => t.readiness?.ready).length
          : 0,
      };
    });
  });
  return out;
}

/**
 * Active, non-IN_REVIEW teams on the event with no assignment in `round` —
 * the organizer heads-up ("N teams aren't on a Round 1 panel yet").
 * Sorted by name.
 */
export function unassignedActiveTeams(schedule, eventData, round = "round1") {
  const assigned = new Set();
  (schedule?.rounds?.[round] || []).forEach((p) =>
    (p.teams || []).forEach((t) => t?.id && assigned.add(t.id)),
  );
  return (Array.isArray(eventData?.teams) ? eventData.teams : [])
    .filter(
      (t) =>
        t?.id &&
        isTeamActive(t) &&
        t.status !== "IN_REVIEW" &&
        !assigned.has(t.id),
    )
    .sort((a, b) =>
      (a.name || "").localeCompare(b.name || "", undefined, {
        sensitivity: "base",
      }),
    );
}

/**
 * Every panel a team is on: `[{ round, panel_id, panel_name, room, judges,
 * demo_time }]`, Round 1 first. Empty for an unpublished schedule.
 */
export function findTeamAssignments(schedule, teamId) {
  if (!teamId || !schedule?.published) return [];
  const found = [];
  SCHEDULE_ROUNDS.forEach((round) => {
    (schedule?.rounds?.[round] || []).forEach((panel) => {
      const team = (panel.teams || []).find((t) => t?.id === teamId);
      if (!team) return;
      found.push({
        round,
        panel_id: panel.panel_id,
        panel_name: panel.panel_name,
        room: team.room || panel.room || null,
        judges: Array.isArray(panel.judges) ? panel.judges : [],
        demo_time: team.demo_time || null,
      });
    });
  });
  return found;
}

/**
 * judge id → `[{ round, panel_id, panel_name }]` of every panel they sit on,
 * so a judge card can say "also on Panel B".
 */
export function judgePanelIndex(schedule) {
  const index = {};
  SCHEDULE_ROUNDS.forEach((round) => {
    (schedule?.rounds?.[round] || []).forEach((panel) => {
      (panel.judges || []).forEach((j) => {
        if (!j?.id) return;
        (index[j.id] = index[j.id] || []).push({
          round,
          panel_id: panel.panel_id,
          panel_name: panel.panel_name,
        });
      });
    });
  });
  return index;
}

/** judge id → number of panels (across both rounds). */
export function judgePanelCounts(schedule) {
  const counts = {};
  Object.entries(judgePanelIndex(schedule)).forEach(([id, list]) => {
    counts[id] = list.length;
  });
  return counts;
}

/**
 * Round 2 demo times are built by the admin tool on a placeholder date
 * (`2025-01-01T<HH:MM>` in the admin's browser) — only the TIME is
 * meaningful. Formatted in the event timezone, time only: "3:20 PM".
 */
export function formatDemoTime(iso, timezone) {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  try {
    return date.toLocaleTimeString("en-US", {
      timeZone: timezone || DEFAULT_EVENT_TIMEZONE,
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  }
}

/** "12 commits", "100+ commits", "1 commit". */
export function formatCommitCount(n) {
  const count = Number(n) || 0;
  if (count >= COMMIT_PAGE_CAP) return `${COMMIT_PAGE_CAP}+ commits`;
  return `${count} commit${count === 1 ? "" : "s"}`;
}

/**
 * `"unavailable"` (no schedule — 404/older backend/fetch failed) |
 * `"unpublished"` | `"empty"` (published, no panels yet) | `"ready"`.
 */
export function scheduleState(schedule) {
  if (!schedule || typeof schedule !== "object") return "unavailable";
  if (!schedule.published) return "unpublished";
  const panels = SCHEDULE_ROUNDS.reduce(
    (n, r) => n + (schedule.rounds?.[r]?.length || 0),
    0,
  );
  return panels > 0 ? "ready" : "empty";
}

/** True when `query` (lower-cased) matches a team's name, channel or nonprofit. */
export function teamMatchesQuery(team, query) {
  const q = (query || "").trim().toLowerCase();
  if (!q) return true;
  return [team?.name, team?.slack_channel, team?.nonprofitName]
    .filter(Boolean)
    .some((v) => String(v).toLowerCase().includes(q));
}

/** Panel + team counts for the summary line. */
export function scheduleTotals(merged) {
  const teamIds = new Set();
  const judgeIds = new Set();
  let panels = 0;
  SCHEDULE_ROUNDS.forEach((round) => {
    (merged?.[round] || []).forEach((panel) => {
      panels += 1;
      panel.teams.forEach((t) => teamIds.add(t.id));
      panel.judges.forEach((j) => j?.id && judgeIds.add(j.id));
    });
  });
  return { panels, teams: teamIds.size, judges: judgeIds.size };
}

// --- getStaticProps projection (judging page) ------------------------------

const EVENT_FIELDS = [
  "id",
  "event_id",
  "title",
  "start_date",
  "end_date",
  "timezone",
  "location",
];

// Only what the schedule needs from each team doc (the event payload is
// large; this is what ships in the judging page's props).
const TEAM_FIELDS = [
  "id",
  "name",
  "slack_channel",
  "status",
  "active",
  "demo_video_url",
  "github_links",
  "project_tagline",
  "project_built_with",
  "project_links",
  "project_thumbnail_url",
  "project_submission_status",
  "project_submitted_at",
  "selected_nonprofit_id",
  "devpost_link",
];

const pick = (obj, keys) => {
  const out = {};
  keys.forEach((k) => {
    out[k] = obj?.[k] === undefined ? null : obj[k];
  });
  return out;
};

/**
 * The public event payload projected to what the judging page needs
 * (`undefined` → null so Next can serialize the props).
 */
export function projectEventForSchedule(data) {
  return {
    ...pick(data, EVENT_FIELDS),
    judging_schedule_published:
      data?.constraints?.judging_schedule_published === true,
    nonprofits: (Array.isArray(data?.nonprofits) ? data.nonprofits : [])
      .filter((n) => n?.id)
      .map((n) => ({ id: n.id, name: n.name || "" })),
    teams: (Array.isArray(data?.teams) ? data.teams : [])
      .filter((t) => t?.id)
      .map((t) => pick(t, TEAM_FIELDS)),
  };
}
