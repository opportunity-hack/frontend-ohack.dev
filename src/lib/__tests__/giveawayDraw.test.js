import {
  buildDrawScript,
  eligibleForPrize,
  generateSeed,
  makeRng,
  nextPresent,
  rankEntrants,
  skipTargetIndex,
  stillInAfter,
} from "../giveawayDraw";

const entry = (user_id, entries, extra = {}) => ({ user_id, entries, all_prizes: true, ...extra });

const ENTRIES = [
  entry("ada", 60),
  entry("grace", 30),
  entry("linus", 10, { all_prizes: false, prize_ids: ["p2"] }),
  entry("zero", 0),
  entry("katherine", 45, { all_prizes: false, prize_ids: ["p1", "p2"] }),
];

describe("makeRng", () => {
  it("is deterministic and in (0, 1)", () => {
    const a = makeRng("482913");
    const b = makeRng("482913");
    for (let i = 0; i < 1000; i += 1) {
      const x = a();
      expect(x).toBe(b());
      expect(x).toBeGreaterThan(0);
      expect(x).toBeLessThan(1);
    }
    expect(makeRng("482913")()).not.toBe(makeRng("482914")());
  });

  it("generateSeed gives six digits", () => {
    expect(generateSeed(() => 0)).toBe("100000");
    expect(generateSeed(() => 0.999999)).toMatch(/^\d{6}$/);
  });
});

describe("eligibleForPrize", () => {
  it("keeps opted-in people with entries", () => {
    expect(eligibleForPrize(ENTRIES, "p1").map((e) => e.user_id)).toEqual(["ada", "grace", "katherine"]);
    expect(eligibleForPrize(ENTRIES, "p2").map((e) => e.user_id)).toEqual(["ada", "grace", "linus", "katherine"]);
  });

  it("drops prior winners and absentees", () => {
    const out = eligibleForPrize(ENTRIES, "p2", { wonUserIds: ["ada"], absentUserIds: new Set(["linus"]) });
    expect(out.map((e) => e.user_id)).toEqual(["grace", "katherine"]);
  });
});

describe("rankEntrants", () => {
  it("same seed → same ranking, independent of input order", () => {
    const eligible = eligibleForPrize(ENTRIES, "p2");
    const a = rankEntrants(eligible, "482913", "p2", 0).map((e) => e.user_id);
    const b = rankEntrants([...eligible].reverse(), "482913", "p2", 0).map((e) => e.user_id);
    expect(a).toEqual(b);
    expect(a).toHaveLength(4);
  });

  it("a table filter/sort upstream can't change the result", () => {
    // What the admin table shows (filtered + sorted) is never the draw input;
    // the draw always starts from the full list.
    const tableView = ENTRIES.filter((e) => e.user_id.startsWith("g")).sort((x, y) => y.entries - x.entries);
    const full = rankEntrants(eligibleForPrize(ENTRIES, "p1"), "s", "p1", 0);
    const again = rankEntrants(eligibleForPrize([...ENTRIES].reverse(), "p1"), "s", "p1", 0);
    expect(full.map((e) => e.user_id)).toEqual(again.map((e) => e.user_id));
    expect(tableView).toHaveLength(1);
  });

  it("removing someone keeps everyone else's order (redraw = next in ranking)", () => {
    const eligible = eligibleForPrize(ENTRIES, "p2");
    const ranking = rankEntrants(eligible, "777", "p2", 1).map((e) => e.user_id);
    const without = rankEntrants(
      eligible.filter((e) => e.user_id !== ranking[0]),
      "777",
      "p2",
      1,
    ).map((e) => e.user_id);
    expect(without).toEqual(ranking.slice(1));
    expect(nextPresent(rankEntrants(eligible, "777", "p2", 1), [ranking[0]]).user_id).toBe(ranking[1]);
  });

  it("handles 0 and 1 entrants", () => {
    expect(rankEntrants([], "s", "p1", 0)).toEqual([]);
    expect(rankEntrants([entry("solo", 5)], "s", "p1", 0)[0].user_id).toBe("solo");
    expect(nextPresent([], ["x"])).toBeNull();
  });

  it("wins in proportion to entries (20k runs)", () => {
    const people = [entry("a", 50), entry("b", 30), entry("c", 15), entry("d", 5)];
    const wins = { a: 0, b: 0, c: 0, d: 0 };
    const runs = 20000;
    for (let i = 0; i < runs; i += 1) {
      wins[rankEntrants(people, `seed-${i}`, "p", 0)[0].user_id] += 1;
    }
    expect(wins.a / runs).toBeCloseTo(0.5, 1);
    expect(wins.b / runs).toBeCloseTo(0.3, 1);
    expect(wins.c / runs).toBeCloseTo(0.15, 1);
    expect(Math.abs(wins.d / runs - 0.05)).toBeLessThan(0.01);
  });
});

describe("buildDrawScript", () => {
  const ranking = (n) => Array.from({ length: n }, (_, i) => entry(`u${String(i).padStart(4, "0")}`, 1));

  it("plays the ranking backwards: the last one standing is ranking[0]", () => {
    const r = ranking(57);
    const script = buildDrawScript(r);
    const types = script.beats.map((b) => b.type);
    expect(types.slice(0, 3)).toEqual(["prize", "seed", "everyone"]);
    expect(types).toContain("wave");
    expect(types.slice(-4)).toEqual(["final2", "leave", "winner", "check"]);
    const left = script.beats.flatMap((b) => b.leaving || []);
    expect(left).toEqual(r.map((e) => e.user_id).slice(1).reverse());
    expect(script.winnerId).toBe("u0000");
    const finalists = script.beats.find((b) => b.type === "finalists");
    expect(finalists.remaining).toBe(10);
    expect([...stillInAfter(script, script.beats.indexOf(finalists))]).toHaveLength(10);
  });

  it("waves remove about half until ten remain", () => {
    const script = buildDrawScript(ranking(142));
    const waves = script.beats.filter((b) => b.type === "wave").map((b) => b.remaining);
    expect(waves).toEqual([71, 35, 17, 10]);
  });

  it("caps tiles at 300 with a +N more counter", () => {
    const script = buildDrawScript(ranking(450));
    expect(script.tileIds).toHaveLength(300);
    expect(script.hiddenCount).toBe(150);
    // The first wave drains the hidden people first (lowest ranked).
    expect(script.beats.find((b) => b.type === "wave").leaving).toContain("u0449");
  });

  it("skips waves under ten and handles 0, 1, 2, 3", () => {
    expect(buildDrawScript(ranking(6)).beats.some((b) => b.type === "wave")).toBe(false);
    expect(buildDrawScript([]).beats.map((b) => b.type)).toEqual(["prize", "empty"]);
    expect(buildDrawScript(ranking(1)).beats.map((b) => b.type)).toEqual(["prize", "winner", "check"]);
    expect(buildDrawScript(ranking(2)).beats.map((b) => b.type)).toEqual([
      "prize", "seed", "everyone", "finalists", "final2", "leave", "winner", "check",
    ]);
    expect(buildDrawScript(ranking(3)).beats.map((b) => b.type)).toContain("final3");
  });

  it("reduced motion: prize, winner, check", () => {
    expect(buildDrawScript(ranking(40), { reducedMotion: true }).beats.map((b) => b.type)).toEqual([
      "prize", "winner", "check",
    ]);
  });

  it("a redraw replays the final five only", () => {
    const script = buildDrawScript(ranking(40), { intro: false });
    expect(script.beats[0]).toMatchObject({ type: "finalists", remaining: 5 });
    expect(script.beats.map((b) => b.type)).not.toContain("prize");
    expect(script.beats.filter((b) => b.type === "leave")).toHaveLength(4);
  });

  it("final-ten gaps grow from 0.7s to 1.5s and S skips to the final three", () => {
    const script = buildDrawScript(ranking(30));
    const gaps = script.beats.filter((b) => b.type === "leave" && b.remaining >= 3).map((b) => b.ms);
    expect(gaps[0]).toBe(700);
    expect(gaps[gaps.length - 1]).toBe(1500);
    expect(script.beats[skipTargetIndex(script, 0)].type).toBe("final3");
  });
});
