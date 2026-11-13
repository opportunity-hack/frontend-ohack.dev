import {
  countProjects,
  filterProjectOptions,
  moveProject,
  normalizeProjectOptions,
  pruneRanked,
  rankingError,
  rankingLimits,
  rankingsPayload,
  toggleProject,
  toRankedEntry,
} from "../projectRanking";

const NPOS = normalizeProjectOptions({
  nonprofits: [
    {
      id: "np1",
      name: "Food Bank",
      projects: [
        { id: "p1", title: "Volunteer scheduler", skills: ["React"] },
        { id: "p2", title: "Inventory tracker", skills: ["Python", "SQL"] },
      ],
    },
    {
      id: "np2",
      name: "Animal Rescue",
      projects: [{ id: "p3", title: "Adoption portal", skills: ["Next.js"] }],
    },
    { id: "np3", name: "Empty Org", projects: [] },
    { id: "np4", projects: [{ id: "p4" }] },
  ],
});

const entry = (npIndex, pIndex) =>
  toRankedEntry(NPOS[npIndex], NPOS[npIndex].projects[pIndex]);

describe("normalizeProjectOptions", () => {
  it("drops nonprofits without projects and fills missing names safely", () => {
    expect(NPOS.map((n) => n.id)).toEqual(["np1", "np2", "np4"]);
    expect(NPOS[2].name).toBe("Unnamed nonprofit");
    expect(NPOS[2].projects[0]).toMatchObject({
      title: "Untitled project",
      description: "",
      skills: [],
    });
  });

  it("tolerates a missing / malformed payload", () => {
    expect(normalizeProjectOptions(null)).toEqual([]);
    expect(normalizeProjectOptions({ nonprofits: "nope" })).toEqual([]);
  });
});

describe("rankingLimits", () => {
  it("is 2–5 normally, and every project when fewer than 2 exist", () => {
    expect(rankingLimits(12)).toEqual({ min: 2, max: 5 });
    expect(rankingLimits(3)).toEqual({ min: 2, max: 3 });
    expect(rankingLimits(1)).toEqual({ min: 1, max: 1 });
    expect(rankingLimits(0)).toEqual({ min: 0, max: 0 });
    expect(rankingLimits(undefined)).toEqual({ min: 0, max: 0 });
  });
});

describe("toggleProject / moveProject", () => {
  it("adds to the end, removes when already ranked, and stops at max", () => {
    let ranked = toggleProject([], entry(0, 0), 2);
    ranked = toggleProject(ranked, entry(0, 1), 2);
    expect(ranked.map((r) => r.projectId)).toEqual(["p1", "p2"]);
    // at max → no-op
    expect(toggleProject(ranked, entry(1, 0), 2)).toBe(ranked);
    // removal still works at max
    expect(
      toggleProject(ranked, entry(0, 0), 2).map((r) => r.projectId),
    ).toEqual(["p2"]);
  });

  it("allows two projects from the same nonprofit", () => {
    const ranked = [entry(0, 0), entry(0, 1)];
    expect(ranked.every((r) => r.nonprofitId === "np1")).toBe(true);
    expect(rankingError(ranked, countProjects(NPOS))).toBeNull();
  });

  it("moves entries and ignores out-of-range moves", () => {
    const ranked = [entry(0, 0), entry(0, 1), entry(1, 0)];
    expect(moveProject(ranked, 2, 0).map((r) => r.projectId)).toEqual([
      "p3",
      "p1",
      "p2",
    ]);
    expect(moveProject(ranked, 0, -1)).toBe(ranked);
    expect(moveProject(ranked, 0, 3)).toBe(ranked);
  });
});

describe("rankingsPayload", () => {
  it("emits the queue_team contract with ranks 1..n", () => {
    expect(rankingsPayload([entry(1, 0), entry(0, 0)])).toEqual([
      { nonprofit_id: "np2", problem_statement_id: "p3", rank: 1 },
      { nonprofit_id: "np1", problem_statement_id: "p1", rank: 2 },
    ]);
  });
});

describe("rankingError", () => {
  it("explains what's missing in plain language", () => {
    expect(rankingError([], undefined)).toBe("Projects are still loading.");
    expect(rankingError([], 0)).toMatch(/no projects open/);
    expect(rankingError([entry(0, 0)], 4)).toBe("Rank at least 2 projects.");
    expect(rankingError([entry(0, 0)], 1)).toBeNull();
    expect(rankingError([], 1)).toBe("Add the project to your ranking.");
    expect(rankingError([entry(0, 0), entry(0, 1)], 4)).toBeNull();
  });
});

describe("pruneRanked", () => {
  it("drops projects no longer offered (or moved to another nonprofit)", () => {
    const ranked = [
      entry(0, 0),
      {
        nonprofitId: "np9",
        nonprofitName: "Gone",
        projectId: "p9",
        title: "x",
      },
      {
        nonprofitId: "np2",
        nonprofitName: "Food",
        projectId: "p1",
        title: "x",
      },
    ];
    expect(pruneRanked(ranked, NPOS).map((r) => r.projectId)).toEqual(["p1"]);
  });
});

describe("filterProjectOptions", () => {
  it("matches nonprofit name (all projects), project title, or skill", () => {
    expect(filterProjectOptions(NPOS, "food")[0].projects).toHaveLength(2);
    const bySkill = filterProjectOptions(NPOS, "sql");
    expect(bySkill).toHaveLength(1);
    expect(bySkill[0].projects.map((p) => p.id)).toEqual(["p2"]);
    expect(filterProjectOptions(NPOS, "adoption")[0].id).toBe("np2");
    expect(filterProjectOptions(NPOS, "  ")).toBe(NPOS);
    expect(filterProjectOptions(NPOS, "zzz")).toEqual([]);
  });
});
