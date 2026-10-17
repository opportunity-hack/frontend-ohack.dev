import {
  applyOptimisticCoverage,
  applyOptimisticRatings,
  splitMentorFlags,
  durationLabel,
  latestRatingsByMentor,
  consensusForCriterion,
} from "../mentorCoverage";

describe("splitMentorFlags", () => {
  const flags = [
    { id: "a", created_at: "2026-10-10T10:00:00", body: "oldest open" },
    {
      id: "b",
      created_at: "2026-10-10T11:00:00",
      resolved_at: "2026-10-10T12:30:00",
      body: "resolved first",
    },
    { id: "c", created_at: "2026-10-10T13:00:00", body: "newest open" },
    {
      id: "d",
      created_at: "2026-10-10T09:00:00",
      resolved_at: "2026-10-10T14:00:00",
      body: "resolved last",
    },
  ];

  it("separates open from resolved using resolved_at only", () => {
    const { open, resolved } = splitMentorFlags(flags);
    expect(open.map((f) => f.id)).toEqual(["c", "a"]);
    expect(resolved.map((f) => f.id)).toEqual(["d", "b"]);
  });

  it("sorts open newest-raised first and resolved most-recently-resolved first", () => {
    const { open, resolved } = splitMentorFlags(flags);
    expect(open[0].body).toBe("newest open");
    expect(resolved[0].body).toBe("resolved last");
  });

  it("tolerates a missing or malformed field", () => {
    expect(splitMentorFlags(undefined)).toEqual({ open: [], resolved: [] });
    expect(splitMentorFlags("nope")).toEqual({ open: [], resolved: [] });
    expect(splitMentorFlags([null, { id: "x" }]).open).toHaveLength(1);
  });
});

describe("durationLabel", () => {
  it("renders minutes, hours and days compactly", () => {
    expect(durationLabel("2026-10-10T10:00:00", "2026-10-10T10:12:00")).toBe("12m");
    expect(durationLabel("2026-10-10T10:00:00", "2026-10-10T12:14:00")).toBe("2h 14m");
    expect(durationLabel("2026-10-10T10:00:00", "2026-10-10T13:00:00")).toBe("3h");
    expect(durationLabel("2026-10-10T10:00:00", "2026-10-11T13:00:00")).toBe("1d 3h");
    expect(durationLabel("2026-10-10T10:00:00", "2026-10-12T10:00:00")).toBe("2d");
  });

  it("handles sub-minute, missing and reversed input", () => {
    expect(durationLabel("2026-10-10T10:00:00", "2026-10-10T10:00:20")).toBe("under a minute");
    expect(durationLabel(null, "2026-10-10T10:00:00")).toBe("");
    expect(durationLabel("2026-10-10T10:00:00", "garbage")).toBe("");
    expect(durationLabel("2026-10-10T12:00:00", "2026-10-10T10:00:00")).toBe("");
  });
});

describe("ratings helpers (regression guard for the optimistic merge)", () => {
  it("keeps the newest rating per mentor and takes the worst as consensus", () => {
    const by = latestRatingsByMentor([
      { criterion: "scope", rated_by_propel_id: "m1", score: "green", rated_at: "2026-10-10T10:00:00" },
      { criterion: "scope", rated_by_propel_id: "m1", score: "red", rated_at: "2026-10-10T11:00:00" },
      { criterion: "scope", rated_by_propel_id: "m2", score: "yellow", rated_at: "2026-10-10T10:30:00" },
    ]);
    expect(by.scope.m1.score).toBe("red");
    expect(consensusForCriterion(by.scope)).toBe("red");
  });
});

describe("applyOptimisticCoverage", () => {
  const server = {
    intro_made: {
      checks: {
        m1: { name: "Priya", checked_at: "2026-10-10T10:00:00" },
      },
    },
    scope_reviewed: {
      // legacy single-mentor shape
      done: true,
      checked_by_propel_id: "m2",
      checked_by_name: "Greg",
      checked_at: "2026-10-10T09:00:00",
    },
  };

  it("adds my check to an item without touching the server copy", () => {
    const out = applyOptimisticCoverage(server, { intro_made: true }, "me", "Me");
    expect(Object.keys(out.intro_made.checks)).toEqual(["m1", "me"]);
    expect(server.intro_made.checks.me).toBeUndefined();
  });

  it("clears only my check and migrates the legacy shape in the overlay", () => {
    const out = applyOptimisticCoverage(
      { ...server, intro_made: { checks: { m1: { name: "Priya" }, me: { name: "Me" } } } },
      { intro_made: false, scope_reviewed: true },
      "me",
    );
    expect(Object.keys(out.intro_made.checks)).toEqual(["m1"]);
    expect(Object.keys(out.scope_reviewed.checks).sort()).toEqual(["m2", "me"]);
  });

  it("is a no-op without an identity or overrides", () => {
    expect(applyOptimisticCoverage(server, { intro_made: true }, null)).toBe(server);
    expect(applyOptimisticCoverage(server, {}, "me")).toBe(server);
  });
});

describe("applyOptimisticRatings", () => {
  it("overlays my newest rating so the worst-wins consensus updates instantly", () => {
    const by = latestRatingsByMentor([
      { criterion: "scope", rated_by_propel_id: "m1", score: "green", rated_at: "2026-10-10T10:00:00" },
    ]);
    const out = applyOptimisticRatings(by, { scope: { score: "red", rated_at: "2026-10-10T12:00:00" } }, "me");
    expect(out.scope.me.score).toBe("red");
    expect(out.scope.me.optimistic).toBe(true);
    expect(consensusForCriterion(out.scope)).toBe("red");
    expect(by.scope.me).toBeUndefined();
  });

  it("ignores empty overrides", () => {
    const by = { scope: {} };
    expect(applyOptimisticRatings(by, { scope: null }, "me").scope.me).toBeUndefined();
    expect(applyOptimisticRatings(by, {}, "me")).toBe(by);
  });
});
