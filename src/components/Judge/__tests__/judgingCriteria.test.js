import {
  CORE_KEYS,
  MAX_TOTAL,
  calculateTotal,
  defaultScores,
  feedbackCharCount,
  feedbackText,
  isFeedbackValid,
  normalizeScores,
  scoreDiff,
  scoreKeysForRound,
} from "../judgingCriteria";

describe("judgingCriteria helpers", () => {
  it("has 8 core keys worth 40 points", () => {
    expect(CORE_KEYS).toHaveLength(8);
    expect(MAX_TOTAL).toBe(40);
    const all5 = Object.fromEntries(CORE_KEYS.map((k) => [k, 5]));
    expect(calculateTotal(all5)).toBe(40);
  });

  it("total ignores the special category and the stored total key", () => {
    const scores = { ...defaultScores("round1"), total: 99, accessibility: 5 };
    expect(calculateTotal(scores)).toBe(24);
  });

  it("round 1 includes accessibility, round 2 does not", () => {
    expect(scoreKeysForRound("round1")).toContain("accessibility");
    expect(scoreKeysForRound("round2")).not.toContain("accessibility");
  });

  it("normalizeScores keeps only rubric keys and coerces to 1–5 ints", () => {
    const out = normalizeScores(
      { scopeImpact: "4", securityRole: 9, total: 30, bogus: 2 },
      "round2",
    );
    expect(out.scopeImpact).toBe(4);
    expect(out.securityRole).toBeNull();
    expect(out).not.toHaveProperty("total");
    expect(out).not.toHaveProperty("bogus");
    expect(out).not.toHaveProperty("accessibility");
  });

  it("scoreDiff lists only changed keys with from/to", () => {
    const before = defaultScores("round1");
    const after = { ...before, scopeImpact: 5, accessibility: 2 };
    expect(scoreDiff(before, after, "round1")).toEqual([
      { key: "scopeImpact", name: "Impact on Community", from: 3, to: 5 },
      {
        key: "accessibility",
        name: "Accessibility Implementation",
        from: 3,
        to: 2,
      },
    ]);
    expect(scoreDiff(before, before, "round1")).toEqual([]);
  });

  it("feedback validation strips markdown noise and needs 20 chars", () => {
    expect(feedbackCharCount("**## - - \n")).toBe(0);
    expect(isFeedbackValid("short")).toBe(false);
    expect(isFeedbackValid("This is a genuinely useful comment.")).toBe(true);
    expect(feedbackText({ general: "hi" })).toBe("hi");
    expect(feedbackText("legacy string")).toBe("legacy string");
    expect(feedbackText(null)).toBe("");
  });
});
