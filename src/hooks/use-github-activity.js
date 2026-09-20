import { useEffect, useRef, useState } from "react";
import { normalizeRepoLink, repoEntriesFromTeam } from "../lib/githubLinks";
import { getGithubActivity, isNotFound } from "../lib/teamDashboardApi";

async function fetchIssuesFor(org, repo) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/github/issues?org=${encodeURIComponent(
        org,
      )}&repo=${encodeURIComponent(repo)}&state=all`,
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.success || !Array.isArray(data.issues)) return null;
    const open = data.issues.filter((issue) => issue.state === "open");
    return {
      topOpen: open
        .slice(0, 3)
        .map((issue) => ({ number: issue.issue_number, title: issue.title })),
    };
  } catch {
    return null;
  }
}

/**
 * Loads GitHub activity for every repo linked to the team, once the
 * `CodeActivityCard` scrolls near — a fire-once `IntersectionObserver`
 * (`rootMargin: "200px"`) mirrors the "Code & Tasks" pattern on
 * `ProblemStatement.js` (CLAUDE.md's SectionBlock/fire-once lesson).
 *
 * Fetches `/api/github/activity` (commits/contributors/repo stats) and
 * `/api/github/issues` (top open issue titles) for every repo in one
 * `Promise.all`, then commits the whole result with a SINGLE `setState` —
 * never a per-repo `setState` call (the TeamManagement render-storm lesson).
 *
 * `ref` is the element to observe (attach to the card's outer Box).
 */
export default function useGithubActivity(team, ref) {
  const [state, setState] = useState({ byRepo: {}, status: "loading" });
  const requestedRef = useRef(new Set());

  const repos = repoEntriesFromTeam(team).filter((r) => r.org && r.repo);
  const repoKey = repos.map((r) => normalizeRepoLink(r.link)).join(",");

  useEffect(() => {
    const el = ref?.current;
    if (!el || repos.length === 0) {
      if (repos.length === 0) setState((s) => ({ ...s, status: "ready" }));
      return undefined;
    }

    let cancelled = false;

    const load = () => {
      const pending = repos.filter(
        (r) => !requestedRef.current.has(normalizeRepoLink(r.link)),
      );
      if (pending.length === 0) return;
      pending.forEach((r) =>
        requestedRef.current.add(normalizeRepoLink(r.link)),
      );

      Promise.all(
        pending.map(async (r) => {
          try {
            const [activity, issues] = await Promise.all([
              getGithubActivity(r.org, r.repo),
              fetchIssuesFor(r.org, r.repo),
            ]);
            // `activity.repo` is the GitHub API repo object
            // ({html_url, default_branch, pushed_at, open_issues_count,
            // stargazers_count}) — spreading it directly over `r` would
            // clobber `r.repo`, the plain repo NAME string from
            // `repoEntriesFromTeam`, which the git-quickstart snippet
            // needs as a string. Keep them as separate keys.
            const { repo: repoInfo, ...activityRest } = activity || {};
            return [
              normalizeRepoLink(r.link),
              {
                ...r,
                ...activityRest,
                repoInfo,
                topOpen: issues?.topOpen || [],
              },
            ];
          } catch (err) {
            if (isNotFound(err))
              return [normalizeRepoLink(r.link), { ...r, unavailable: true }];
            return [normalizeRepoLink(r.link), { ...r, unavailable: true }];
          }
        }),
      ).then((entries) => {
        if (cancelled) return;
        setState((prev) => ({
          byRepo: { ...prev.byRepo, ...Object.fromEntries(entries) },
          status: "ready",
        }));
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          load();
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [repoKey, ref]);

  return state;
}
