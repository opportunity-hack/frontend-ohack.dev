import { normalizeRepoLink, parseGithubRepo, repoEntriesFromTeam } from "../githubLinks";

describe("githubLinks", () => {
  describe("normalizeRepoLink", () => {
    it("lowercases and strips trailing slashes", () => {
      expect(normalizeRepoLink("HTTPS://GitHub.com/Org/Repo/")).toBe(
        "https://github.com/org/repo"
      );
    });

    it("handles missing input", () => {
      expect(normalizeRepoLink(null)).toBe("");
      expect(normalizeRepoLink(undefined)).toBe("");
    });
  });

  describe("parseGithubRepo", () => {
    it("extracts org and repo from a github.com URL", () => {
      expect(parseGithubRepo("https://github.com/opportunity-hack/frontend")).toEqual({
        org: "opportunity-hack",
        repo: "frontend",
      });
    });

    it("strips a trailing .git", () => {
      expect(parseGithubRepo("https://github.com/opportunity-hack/frontend.git")).toEqual({
        org: "opportunity-hack",
        repo: "frontend",
      });
    });

    it("ignores query strings and fragments after the repo", () => {
      expect(parseGithubRepo("https://github.com/org/repo?tab=readme#section")).toEqual({
        org: "org",
        repo: "repo",
      });
    });

    it("returns null for a non-github link", () => {
      expect(parseGithubRepo("https://gitlab.com/org/repo")).toBeNull();
      expect(parseGithubRepo("")).toBeNull();
      expect(parseGithubRepo(null)).toBeNull();
    });
  });

  describe("repoEntriesFromTeam", () => {
    it("returns [] when the team has no github_links", () => {
      expect(repoEntriesFromTeam({})).toEqual([]);
      expect(repoEntriesFromTeam(null)).toEqual([]);
      expect(repoEntriesFromTeam({ github_links: [] })).toEqual([]);
    });

    it("handles the legacy string shape", () => {
      const entries = repoEntriesFromTeam({
        github_links: ["https://github.com/opportunity-hack/2026_project"],
      });
      expect(entries).toEqual([
        {
          name: "2026_project",
          link: "https://github.com/opportunity-hack/2026_project",
          org: "opportunity-hack",
          repo: "2026_project",
        },
      ]);
    });

    it("handles the { link, name } object shape and prefers the stored name", () => {
      const entries = repoEntriesFromTeam({
        github_links: [{ link: "https://github.com/org/repo", name: "Our project" }],
      });
      expect(entries).toEqual([
        { name: "Our project", link: "https://github.com/org/repo", org: "org", repo: "repo" },
      ]);
    });

    it("dedupes by normalized link, keeping the first occurrence", () => {
      const entries = repoEntriesFromTeam({
        github_links: [
          { link: "https://github.com/org/repo", name: "First" },
          "https://github.com/org/repo/",
          { link: "HTTPS://GITHUB.COM/org/repo", name: "Different casing" },
        ],
      });
      expect(entries).toHaveLength(1);
      expect(entries[0].name).toBe("First");
    });

    it("keeps entries that aren't recognizable github.com URLs, with org/repo null", () => {
      const entries = repoEntriesFromTeam({
        github_links: [{ link: "https://gitlab.com/org/repo", name: "Mirror" }],
      });
      expect(entries).toEqual([
        { name: "Mirror", link: "https://gitlab.com/org/repo", org: null, repo: null },
      ]);
    });

    it("skips entries with no link", () => {
      const entries = repoEntriesFromTeam({ github_links: [{ name: "No link" }, null, ""] });
      expect(entries).toEqual([]);
    });

    it("preserves original order", () => {
      const entries = repoEntriesFromTeam({
        github_links: ["https://github.com/org/a", "https://github.com/org/b"],
      });
      expect(entries.map((e) => e.repo)).toEqual(["a", "b"]);
    });
  });
});
