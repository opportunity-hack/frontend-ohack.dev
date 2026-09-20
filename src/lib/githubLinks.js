/**
 * Shared GitHub repo-link helpers for the team dashboard, project pages and
 * judge views.
 *
 * `normalizeRepoLink`/`parseGithubRepo` are copied verbatim from the
 * module-scope private helpers in `ProblemStatement.js` ("Code & Tasks"
 * section) rather than imported from there — that file's helpers stay
 * module-scope and untouched (the SectionBlock remount lesson pins its
 * shape), and it independently merges project-level + team-level repos
 * across a nonprofit's multiple projects, which is out of scope here.
 * This module is the shared copy every other consumer should use.
 */

/** Lowercases + strips a trailing slash so the same repo compares equal
 * regardless of casing or a trailing "/". */
export function normalizeRepoLink(link) {
  return (link || "").trim().replace(/\/+$/, "").toLowerCase();
}

/** Extracts `{ org, repo }` from a github.com URL, or null when it isn't one. */
export function parseGithubRepo(link) {
  const match = /github\.com\/([^/]+)\/([^/#?]+)/i.exec(link || "");
  return match
    ? { org: match[1], repo: match[2].replace(/\.git$/i, "") }
    : null;
}

/**
 * Normalizes whatever an admin typed into `hackathon.github_org` (a full
 * URL, an `@handle`, a trailing slash/path) into a bare GitHub org slug so
 * callers can build a clean `github.com/<org>` link. Copied here (from the
 * originally admin-only `OverviewSection.js`) so any other surface linking
 * to the event's org — e.g. the team dashboard's "no repo yet" state —
 * doesn't 404 on a stored full URL.
 */
export function githubOrgSlug(raw) {
  if (!raw) return "";
  let s = String(raw).trim();
  s = s.replace(/^https?:\/\/(www\.)?github\.com\//i, "");
  s = s.replace(/^@/, "").replace(/\/.*$/, "").trim();
  return s;
}

function repoNameFromLink(link) {
  const gh = parseGithubRepo(link);
  return gh ? gh.repo : link;
}

/**
 * Normalizes a team's `github_links[]` (mixed string / `{ link, name }`
 * shape) into a deduped list of `{ name, link, org, repo }` entries, in
 * original order. `org`/`repo` are null when the link isn't a recognizable
 * github.com URL — callers that need them (e.g. to call the GitHub API)
 * should filter on that, but the entry (and its link) still renders.
 */
export function repoEntriesFromTeam(team) {
  const raw = Array.isArray(team?.github_links) ? team.github_links : [];
  const seen = new Set();
  const entries = [];
  raw.forEach((entry) => {
    const link = typeof entry === "string" ? entry : entry?.link;
    if (!link) return;
    const key = normalizeRepoLink(link);
    if (seen.has(key)) return;
    seen.add(key);
    const gh = parseGithubRepo(link);
    entries.push({
      name:
        (typeof entry === "object" && entry?.name) || repoNameFromLink(link),
      link,
      org: gh?.org || null,
      repo: gh?.repo || null,
    });
  });
  return entries;
}
