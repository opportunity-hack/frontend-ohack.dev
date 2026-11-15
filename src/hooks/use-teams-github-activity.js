import { useEffect, useRef, useState } from "react";
import { githubReposForTeam } from "../lib/judgingSchedule";
import { getGithubActivity } from "../lib/teamDashboardApi";

export const GITHUB_POOL_SIZE = 6;

/** Max one interim setState per this window while lookups are in flight. */
export const GITHUB_FLUSH_MS = 1000;

/**
 * Commit activity for MANY teams at once (the public judging schedule):
 * every GitHub-parsable repo across `teams` is fetched through
 * `GET /api/github/activity` (public, backend-cached: 5 min for repos with
 * commits, 1 min for empty repos, 30 s for errors) with a worker pool of
 * GITHUB_POOL_SIZE, deduped when two teams share a repo.
 *
 * State updates are THROTTLED, never per-repo (the TeamManagement
 * render-storm lesson): results are flushed at most once per GITHUB_FLUSH_MS
 * while loading, plus one final flush. A team appears in `byTeam` only once
 * ALL of its repos have answered, so its cell goes pending → final without
 * flapping. Each request has a client timeout (getGithubActivity), so one
 * hung lookup can't hold the column on "Checking…".
 *
 * Returns `{ byTeam, status }`:
 *   byTeam[teamId] = { commits, lastCommitAt, unavailable }
 *     commits      — summed `commits.total_recent` over the team's repos
 *     unavailable  — true only when EVERY repo lookup failed (an error, a
 *                    timeout, or a null / commits-less payload — never read
 *                    as "0 commits")
 *   status = "idle" | "loading" | "ready"
 * Teams with no GitHub repo are absent from `byTeam` once ready (the caller
 * reads that as "no repo"). Fires on mount — the page is used live, so there
 * is no IntersectionObserver. Re-runs only when the set of repos changes.
 */
export default function useTeamsGithubActivity(teams, { enabled = true } = {}) {
  const [state, setState] = useState({ byTeam: {}, status: "idle" });

  const repoMap = {}; // repo key -> { org, repo }
  const teamRepos = {}; // teamId -> [repo key]
  (Array.isArray(teams) ? teams : []).forEach((team) => {
    if (!team?.id) return;
    const repos = githubReposForTeam(team);
    if (repos.length === 0) return;
    teamRepos[team.id] = repos.map((r) => r.key);
    repos.forEach((r) => {
      repoMap[r.key] = { org: r.org, repo: r.repo };
    });
  });
  const signature = Object.keys(teamRepos)
    .sort()
    .map((id) => `${id}:${teamRepos[id].join("|")}`)
    .join(",");

  const latest = useRef({ repoMap, teamRepos });
  latest.current = { repoMap, teamRepos };

  useEffect(() => {
    if (!enabled || !signature) {
      setState((s) =>
        s.status === "ready" && Object.keys(s.byTeam).length === 0
          ? s
          : { byTeam: {}, status: "ready" },
      );
      return undefined;
    }
    let cancelled = false;
    let flushTimer = null;
    const { repoMap: repos, teamRepos: byTeamRepos } = latest.current;
    const keys = Object.keys(repos);
    const results = {}; // repo key -> { ok, commits, lastCommitAt }
    let cursor = 0;

    const buildByTeam = () => {
      const byTeam = {};
      Object.entries(byTeamRepos).forEach(([teamId, repoKeys]) => {
        const rows = repoKeys.map((k) => results[k]);
        if (rows.some((r) => !r)) return; // still waiting on one of its repos
        const ok = rows.filter((r) => r.ok);
        const lastCommitAt =
          ok
            .map((r) => r.lastCommitAt)
            .filter(Boolean)
            .sort()
            .pop() || null;
        byTeam[teamId] = {
          commits: ok.reduce((sum, r) => sum + r.commits, 0),
          lastCommitAt,
          unavailable: ok.length === 0,
        };
      });
      return byTeam;
    };

    const scheduleFlush = () => {
      if (flushTimer || cancelled) return;
      flushTimer = setTimeout(() => {
        flushTimer = null;
        if (cancelled) return;
        setState({ byTeam: buildByTeam(), status: "loading" });
      }, GITHUB_FLUSH_MS);
    };

    setState((s) => ({ ...s, status: "loading" }));

    const worker = async () => {
      while (!cancelled && cursor < keys.length) {
        const key = keys[cursor];
        cursor += 1;
        const { org, repo } = repos[key];
        try {
          const data = await getGithubActivity(org, repo);
          const commits = data?.commits;
          // A null / commits-less body is "couldn't check", not "0 commits".
          results[key] =
            commits && typeof commits === "object"
              ? {
                  ok: true,
                  commits: Number(commits.total_recent) || 0,
                  lastCommitAt: commits.last_commit_at || null,
                }
              : { ok: false };
        } catch {
          results[key] = { ok: false };
        }
        scheduleFlush();
      }
    };

    Promise.all(
      Array.from({ length: Math.min(GITHUB_POOL_SIZE, keys.length) }, worker),
    ).then(() => {
      if (cancelled) return;
      if (flushTimer) clearTimeout(flushTimer);
      flushTimer = null;
      setState({ byTeam: buildByTeam(), status: "ready" });
    });

    return () => {
      cancelled = true;
      if (flushTimer) clearTimeout(flushTimer);
    };
  }, [signature, enabled]);

  return state;
}
