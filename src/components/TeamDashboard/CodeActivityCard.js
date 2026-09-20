import React from "react";
import { Box, Skeleton } from "@mui/material";
import DashboardSection from "./DashboardSection";
import { relativeTime } from "../Teams/mentorCoverage";
import { repoEntriesFromTeam } from "../../lib/githubLinks";
import { CODE_EMPTY } from "./copy";

function RepoBlock({ entry }) {
  const commits = entry.commits;
  const repo = entry.repo;
  return (
    <Box sx={{ mb: 3, "&:last-child": { mb: 0 } }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
        <a
          href={entry.link}
          target="_blank"
          rel="noopener noreferrer"
          className="ohx-link"
        >
          {entry.name}
        </a>
      </Box>
      {entry.unavailable ? (
        <Box sx={{ color: "var(--muted)", fontSize: "0.9rem" }}>
          Live activity isn&apos;t available right now — the link above still
          works.
        </Box>
      ) : (
        <>
          {commits?.last_commit_at ? (
            <Box sx={{ fontSize: "0.9rem", color: "var(--muted)", mb: 1 }}>
              Last commit {relativeTime(commits.last_commit_at)}
              {commits.last_commit_message
                ? ` — "${commits.last_commit_message.split("\n")[0]}"`
                : ""}
              {commits.last_author ? ` by ${commits.last_author}` : ""}
            </Box>
          ) : (
            <Box sx={{ color: "var(--muted)", fontSize: "0.9rem", mb: 1 }}>
              {CODE_EMPTY}
            </Box>
          )}
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 1 }}>
            <span className="ohx-tag">
              {commits?.last_24h ?? 0} commits/24h
            </span>
            <span className="ohx-tag">
              {entry.contributors?.length ?? 0} contributors
            </span>
            <span className="ohx-tag">
              {repo?.open_issues_count ?? 0} open issues
            </span>
            <span className="ohx-tag">{entry.open_prs ?? 0} open PRs</span>
          </Box>
          {entry.contributors?.length > 0 && (
            <Box sx={{ display: "flex", gap: 0.5, mb: 1 }}>
              {entry.contributors.slice(0, 8).map((c) => (
                <img
                  key={c.login}
                  src={c.avatar_url || "/opportunity-hack-og-image.png"}
                  alt={c.login}
                  title={`${c.login} — ${c.contributions} commits`}
                  width={28}
                  height={28}
                  loading="lazy"
                  style={{ borderRadius: "50%" }}
                />
              ))}
            </Box>
          )}
          {entry.topOpen?.length > 0 && (
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: "0.9rem" }}>
              {entry.topOpen.map((issue) => (
                <li key={issue.number}>
                  #{issue.number} {issue.title}
                </li>
              ))}
            </ul>
          )}
          {!commits?.last_commit_at && (
            <details style={{ marginTop: 8 }}>
              <summary
                style={{ cursor: "pointer", color: "var(--brand, #1B3A6B)" }}
              >
                git quickstart
              </summary>
              <pre
                style={{
                  fontSize: "0.8rem",
                  background: "var(--surface-2, #F4F1E9)",
                  padding: 12,
                  borderRadius: 6,
                  overflowX: "auto",
                }}
              >
                {`git clone ${entry.link}.git\ncd ${entry.repo}\ngit checkout -b my-feature\ngit push -u origin my-feature`}
              </pre>
            </details>
          )}
        </>
      )}
    </Box>
  );
}

/**
 * "Is the repo alive?" signal. `byRepo`/`containerRef` come from a single
 * `useGithubActivity` call owned by `TeamDashboard` (fire-once
 * IntersectionObserver, never on page mount) — shared with the
 * deliverables checklist's "code" row so both read the same live data.
 */
export default function CodeActivityCard({
  team,
  event,
  byRepo,
  containerRef,
}) {
  const entries = Object.values(byRepo || {});
  // A team's repo links (from the team doc itself) are known immediately;
  // `entries` only fills in once the fire-once IntersectionObserver has
  // fetched activity for them. Without this distinction, every team WITH a
  // real repo briefly rendered "Repository not yet created" on every page
  // load, because the card sits below the fold and `byRepo` starts empty.
  const hasRepoLinks = repoEntriesFromTeam(team).length > 0;
  const isLoadingActivity = hasRepoLinks && entries.length === 0;

  return (
    <Box ref={containerRef}>
      <DashboardSection id="code" eyebrow="Is it alive?" title="Code activity">
        <Box sx={{ minHeight: 140 }}>
          {isLoadingActivity ? (
            <Skeleton
              variant="rectangular"
              height={96}
              sx={{ borderRadius: 1 }}
            />
          ) : entries.length === 0 ? (
            <Box>
              <Box sx={{ color: "var(--muted)", mb: 1 }}>{CODE_EMPTY}</Box>
              {event?.github_org && (
                <a
                  href={`https://github.com/${event.github_org}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ohx-link"
                >
                  Repository not yet created — it&apos;s made when your team is
                  approved.
                </a>
              )}
            </Box>
          ) : (
            entries.map((entry) => <RepoBlock key={entry.link} entry={entry} />)
          )}
        </Box>
      </DashboardSection>
    </Box>
  );
}
