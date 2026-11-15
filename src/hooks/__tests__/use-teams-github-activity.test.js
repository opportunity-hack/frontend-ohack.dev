import { renderHook, waitFor } from "@testing-library/react";

jest.mock("../../lib/teamDashboardApi", () => ({
  getGithubActivity: jest.fn(),
}));

import { getGithubActivity } from "../../lib/teamDashboardApi";
import useTeamsGithubActivity, {
  GITHUB_FLUSH_MS,
  GITHUB_POOL_SIZE,
} from "../use-teams-github-activity";

const gh = (org, repo) => `https://github.com/${org}/${repo}`;

describe("useTeamsGithubActivity", () => {
  beforeEach(() => jest.clearAllMocks());

  it("dedupes shared repos, sums per team and commits ONE final state", async () => {
    getGithubActivity.mockImplementation(async (org, repo) => {
      if (repo === "broken") throw Object.assign(new Error("x"), { status: 502 });
      return {
        commits: {
          total_recent: repo === "shared" ? 4 : 2,
          last_commit_at: repo === "shared" ? "2026-10-10T12:00:00Z" : "2026-10-10T09:00:00Z",
        },
      };
    });
    const teams = [
      { id: "a", github_links: [{ link: gh("o", "shared") }, { link: gh("o", "a-only") }] },
      { id: "b", github_links: [gh("o", "shared")] },
      { id: "c", github_links: [gh("o", "broken")] },
      { id: "d", github_links: [] },
    ];
    const renders = [];
    const { result } = renderHook(() => {
      const r = useTeamsGithubActivity(teams);
      renders.push(r);
      return r;
    });
    await waitFor(() => expect(result.current.status).toBe("ready"));

    // shared repo fetched once
    expect(getGithubActivity).toHaveBeenCalledTimes(3);
    expect(result.current.byTeam).toEqual({
      a: { commits: 6, lastCommitAt: "2026-10-10T12:00:00Z", unavailable: false },
      b: { commits: 4, lastCommitAt: "2026-10-10T12:00:00Z", unavailable: false },
      c: { commits: 0, lastCommitAt: null, unavailable: true },
    });
    // idle → loading → ready: never one state update per repo
    const withData = renders.filter((r) => Object.keys(r.byTeam).length > 0);
    expect(new Set(withData.map((r) => r.byTeam)).size).toBe(1);
  });

  it("never runs more than the pool size at once", async () => {
    let inFlight = 0;
    let peak = 0;
    getGithubActivity.mockImplementation(async () => {
      inFlight += 1;
      peak = Math.max(peak, inFlight);
      await new Promise((r) => setTimeout(r, 5));
      inFlight -= 1;
      return { commits: { total_recent: 1 } };
    });
    const teams = Array.from({ length: 15 }, (_, i) => ({
      id: `t${i}`,
      github_links: [gh("o", `r${i}`)],
    }));
    const { result } = renderHook(() => useTeamsGithubActivity(teams));
    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(getGithubActivity).toHaveBeenCalledTimes(15);
    expect(peak).toBeLessThanOrEqual(GITHUB_POOL_SIZE);
  });

  it("reads a null or commits-less payload as unavailable, not 0 commits", async () => {
    getGithubActivity.mockImplementation(async (org, repo) =>
      repo === "null-body" ? null : { success: true },
    );
    const teams = [
      { id: "n", github_links: [gh("o", "null-body")] },
      { id: "m", github_links: [gh("o", "no-commits-key")] },
    ];
    const { result } = renderHook(() => useTeamsGithubActivity(teams));
    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(result.current.byTeam).toEqual({
      n: { commits: 0, lastCommitAt: null, unavailable: true },
      m: { commits: 0, lastCommitAt: null, unavailable: true },
    });
  });

  it("shows finished teams while a slow repo is still loading", async () => {
    let releaseSlow;
    getGithubActivity.mockImplementation((org, repo) =>
      repo === "slow"
        ? new Promise((resolve) => {
            releaseSlow = () => resolve({ commits: { total_recent: 1 } });
          })
        : Promise.resolve({ commits: { total_recent: 3 } }),
    );
    const teams = [
      { id: "fast", github_links: [gh("o", "fast")] },
      { id: "slow", github_links: [gh("o", "slow")] },
    ];
    const { result } = renderHook(() => useTeamsGithubActivity(teams));
    await waitFor(
      () => expect(result.current.byTeam.fast?.commits).toBe(3),
      { timeout: GITHUB_FLUSH_MS + 1500 },
    );
    expect(result.current.status).toBe("loading");
    expect(result.current.byTeam.slow).toBeUndefined(); // still "Checking…"

    releaseSlow();
    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(result.current.byTeam.slow.commits).toBe(1);
  });

  it("does nothing when disabled or when no team has a repo", async () => {
    const { result } = renderHook(() =>
      useTeamsGithubActivity([{ id: "x", github_links: [] }]),
    );
    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(result.current.byTeam).toEqual({});
    renderHook(() =>
      useTeamsGithubActivity([{ id: "y", github_links: [gh("o", "r")] }], { enabled: false }),
    );
    expect(getGithubActivity).not.toHaveBeenCalled();
  });
});
