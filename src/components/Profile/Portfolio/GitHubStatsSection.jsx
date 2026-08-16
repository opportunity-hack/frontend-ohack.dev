import React, { useEffect, useMemo, useRef, useState } from "react";
import GitHubIcon from "@mui/icons-material/GitHub";

/**
 * GitHub contributions in refined chrome: Fraunces stat tiles + hairline
 * per-repo rows. Data comes from the SSR portfolio payload when the user has
 * opted in; otherwise (older payloads) it lazy-fetches once the section
 * scrolls near (fire-once IntersectionObserver, rootMargin 200px — the
 * ProblemStatement "Code & Tasks" pattern). Space is reserved via minHeight.
 */

function aggregate(history) {
  const totals = { commits: 0, pullRequests: 0, issues: 0, reviews: 0 };
  const repoMap = new Map();
  for (const item of history || []) {
    const commits = item.commits || 0;
    const prs = item.pull_requests?.total || 0;
    const issues = item.issues?.total || 0;
    const reviews = item.reviews || 0;
    totals.commits += commits;
    totals.pullRequests += prs;
    totals.issues += issues;
    totals.reviews += reviews;

    const key = `${item.org_name}/${item.repo_name}`;
    const repo = repoMap.get(key) || { org: item.org_name, repo: item.repo_name, commits: 0, pullRequests: 0, issues: 0, reviews: 0 };
    repo.commits += commits;
    repo.pullRequests += prs;
    repo.issues += issues;
    repo.reviews += reviews;
    repoMap.set(key, repo);
  }
  const repos = Array.from(repoMap.values()).sort(
    (a, b) => (b.commits + b.pullRequests) - (a.commits + a.pullRequests)
  );
  return { totals, repos };
}

function StatTile({ value, label }) {
  return (
    <div style={{ background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: 6, padding: "14px 16px", minWidth: 110 }}>
      <div className="ohx-display" style={{ fontSize: "1.6rem", color: "var(--brand)", lineHeight: 1.1 }}>{value}</div>
      <div className="ohx-eyebrow" style={{ fontSize: "0.6rem", marginTop: 6 }}>{label}</div>
    </div>
  );
}

export default function GitHubStatsSection({ username, initialHistory }) {
  const [history, setHistory] = useState(initialHistory || null);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);
  const requestedRef = useRef(false);

  // Lazy fallback fetch only when the payload didn't include github_history
  useEffect(() => {
    if (history || !username || typeof IntersectionObserver === "undefined") return undefined;
    const node = containerRef.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting) || requestedRef.current) return;
        requestedRef.current = true;
        observer.disconnect();
        setLoading(true);
        fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/profile/github/${encodeURIComponent(username)}`)
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => setHistory(data?.github_history || []))
          .catch(() => setHistory([]))
          .finally(() => setLoading(false));
      },
      { rootMargin: "200px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [history, username]);

  const { totals, repos } = useMemo(() => aggregate(history), [history]);
  const isEmpty = Array.isArray(history) && history.length === 0;

  return (
    <div ref={containerRef} style={{ minHeight: history?.length ? undefined : 120 }}>
      {!history || loading ? (
        <p className="ohx-muted" style={{ margin: 0, fontSize: "0.92rem" }}>Loading contributions…</p>
      ) : isEmpty ? (
        <p className="ohx-muted" style={{ margin: 0, fontSize: "0.92rem" }}>No public GitHub activity yet.</p>
      ) : (
        <>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            <StatTile value={totals.commits} label="Commits" />
            <StatTile value={totals.pullRequests} label="Pull requests" />
            <StatTile value={totals.issues} label="Issues" />
            <StatTile value={repos.length} label={repos.length === 1 ? "Repository" : "Repositories"} />
          </div>
          <div style={{ marginTop: 18 }}>
            {repos.map((repo, i) => (
              <div
                key={`${repo.org}/${repo.repo}`}
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", padding: "10px 0", borderTop: i === 0 ? "none" : "1px solid var(--line)" }}
              >
                <a
                  className="ohx-link"
                  href={`https://github.com/${repo.org}/${repo.repo}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: "0.92rem", minWidth: 0 }}
                >
                  <GitHubIcon sx={{ fontSize: 15, color: "var(--faint)" }} />
                  <span style={{ overflowWrap: "anywhere" }}>{repo.org}/{repo.repo}</span>
                </a>
                <span className="ohx-muted" style={{ fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                  {repo.commits} commit{repo.commits === 1 ? "" : "s"}
                  {repo.pullRequests > 0 ? ` · ${repo.pullRequests} PR${repo.pullRequests === 1 ? "" : "s"}` : ""}
                  {repo.issues > 0 ? ` · ${repo.issues} issue${repo.issues === 1 ? "" : "s"}` : ""}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
