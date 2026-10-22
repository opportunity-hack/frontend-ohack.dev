import {
  rankRound2Teams,
  compareSubmittedAt,
  formatSubmittedAt,
  TIE_EPSILON,
} from "../resultsRanking";

const row = (
  name,
  avg,
  { sd = 0, submitted = undefined, judges = 3 } = {},
) => ({
  team: { id: name, name, project_submitted_at: submitted },
  averageScore: avg,
  standardDeviation: sd,
  judgeCount: judges,
});

describe("rankRound2Teams", () => {
  it("orders by average score, scored teams before unscored", () => {
    const ranked = rankRound2Teams([
      row("Low", 20),
      row("None", 0, { judges: 0 }),
      row("High", 36),
    ]);
    expect(ranked.map((r) => r.team.name)).toEqual(["High", "Low", "None"]);
    expect(ranked.map((r) => r.rank)).toEqual([1, 2, 3]);
    expect(ranked.every((r) => r.tieGroup === null)).toBe(true);
  });

  it("breaks a tie by the EARLIEST project submission", () => {
    const ranked = rankRound2Teams([
      row("Later", 30, { submitted: "2026-10-11T22:10:00Z", sd: 0.5 }),
      row("Earlier", 30, { submitted: "2026-10-11T21:58:07Z", sd: 2.5 }),
    ]);
    expect(ranked.map((r) => r.team.name)).toEqual(["Earlier", "Later"]);
    expect(ranked[0].tieGroup).toBe(1);
    expect(ranked[0].tieBrokenBy).toBeNull();
    expect(ranked[1].tieGroup).toBe(1);
    expect(ranked[1].tieBrokenBy).toBe("project_submitted_at");
  });

  it("a team with no submission timestamp loses the tie to one that has it", () => {
    const ranked = rankRound2Teams([
      row("NoStamp", 30),
      row("Stamped", 30, { submitted: "2026-10-11T23:59:00Z" }),
    ]);
    expect(ranked.map((r) => r.team.name)).toEqual(["Stamped", "NoStamp"]);
    expect(ranked[1].tieBrokenBy).toBe("project_submitted_at");
  });

  it("falls back to lower std dev, then name, when submissions can't separate", () => {
    const ranked = rankRound2Teams([
      row("Beta", 30, { sd: 1.0 }),
      row("Alpha", 30, { sd: 1.0 }),
      row("Consistent", 30, { sd: 0.2 }),
    ]);
    expect(ranked.map((r) => r.team.name)).toEqual([
      "Consistent",
      "Alpha",
      "Beta",
    ]);
    expect(ranked[1].tieBrokenBy).toBe("std_dev");
    expect(ranked[2].tieBrokenBy).toBe("name");
  });

  it("treats averages within the epsilon as tied and separate groups independently", () => {
    const ranked = rankRound2Teams([
      row("A", 30.001, { submitted: "2026-10-11T20:00:00Z" }),
      row("B", 30.0, { submitted: "2026-10-11T19:00:00Z" }),
      row("C", 25, { submitted: "2026-10-11T18:00:00Z" }),
      row("D", 25, { submitted: "2026-10-11T18:30:00Z" }),
    ]);
    expect(TIE_EPSILON).toBeGreaterThan(0.001);
    expect(ranked.map((r) => r.team.name)).toEqual(["B", "A", "C", "D"]);
    expect(ranked.map((r) => r.tieGroup)).toEqual([1, 1, 2, 2]);
  });

  it("does not mutate the input", () => {
    const input = [row("X", 10), row("Y", 20)];
    const copy = JSON.parse(JSON.stringify(input));
    rankRound2Teams(input);
    expect(input).toEqual(copy);
  });
});

describe("compareSubmittedAt / formatSubmittedAt", () => {
  it("sorts earlier first and missing last", () => {
    const a = { team: { project_submitted_at: "2026-10-11T20:00:00Z" } };
    const b = { team: { project_submitted_at: "2026-10-11T21:00:00Z" } };
    const none = { team: {} };
    expect(compareSubmittedAt(a, b)).toBeLessThan(0);
    expect(compareSubmittedAt(b, a)).toBeGreaterThan(0);
    expect(compareSubmittedAt(a, none)).toBeLessThan(0);
    expect(compareSubmittedAt(none, none)).toBe(0);
  });

  it("formats in the event timezone with seconds and returns null for garbage", () => {
    expect(formatSubmittedAt(null)).toBeNull();
    expect(formatSubmittedAt("not a date")).toBeNull();
    const out = formatSubmittedAt("2026-10-11T21:58:07Z", "America/Phoenix");
    expect(out).toMatch(/2:58:07/);
    expect(out).toMatch(/MST/);
  });
});
