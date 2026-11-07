import { useEffect, useRef, useState } from "react";
import { githubReposForTeam } from "../lib/judgingSchedule";
import { getGithubActivity } from "../lib/teamDashboardApi";

export const GITHUB_POOL_SIZE = 6;

/**
 * Commit activity for MANY teams at once (the public judging schedule):
 * every GitHub-parsable repo across `teams` is fetched through
 * `GET /api/github/activity` (public, 5-min backend cache) with a worker
 * pool of GITHUB_POOL_SIZE, deduped when two teams share a repo, and
 * committed with ONE setState at the end — never a per-repo setState (the
 * TeamManagement render-storm lesson).
 *
 * Returns `{ byTeam, status }`:
 *   byTeam[teamId] = { commits, lastCommitAt, unavailable }
 *     commits      — summed `commits.total_recent` over the team's repos
 *     unavailable  — true only when EVERY repo lookup failed
 *   status = "idle" | "loading" | "ready"
 * Teams with no GitHub repo are absent from `byTeam` (the caller reads that
 * as "no repo"). Fires on mount — the page is used live, so there is no
 * IntersectionObserver. Re-runs only when the set of repos changes.
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
    const { repoMap: repos, teamRepos: byTeamRepos } = latest.current;
    const keys = Object.keys(repos);
    const results = {}; // repo key -> { ok, commits, lastCommitAt }
    let cursor = 0;

    setState((s) => ({ ...s, status: "loading" }));

    const worker = async () => {
      while (!cancelled && cursor < keys.length) {
        const key = keys[cursor];
        cursor += 1;
        const { org, repo } = repos[key];
        try {
          const data = await getGithubActivity(org, repo);
          results[key] = {
            ok: true,
            commits: Number(data?.commits?.total_recent) || 0,
            lastCommitAt: data?.commits?.last_commit_at || null,
          };
        } catch {
          results[key] = { ok: false };
        }
      }
    };

    Promise.all(
      Array.from({ length: Math.min(GITHUB_POOL_SIZE, keys.length) }, worker),
    ).then(() => {
      if (cancelled) return;
      const byTeam = {};
      Object.entries(byTeamRepos).forEach(([teamId, repoKeys]) => {
        const rows = repoKeys.map((k) => results[k]).filter(Boolean);
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
      setState({ byTeam, status: "ready" });
    });

    return () => {
      cancelled = true;
    };
  }, [signature, enabled]);

  return state;
}
