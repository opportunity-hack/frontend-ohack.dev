import {
  applyOptimisticCoverage,
  applyOptimisticRatings,
  splitMentorFlags,
  durationLabel,
  latestRatingsByMentor,
  blendedRating,
  scoreFromValue,
  ratingWeight,
  ratingHistory,
  newestRating,
  isRatingStale,
  ratingAttribution,
  ratingBlendSummary,
  parseMentorTimestamp,
  relativeTime,
  RATING_STALE_AFTER_MS,
  RATING_HALF_LIFE_MS,
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

// #412: the current state is the NEWEST rating on a criterion, whoever made
// it. The old rule ("worst of each mentor's latest") froze an "At risk" from a
// mentor who had gone home even after the next shift rated "On track".
describe("blendedRating (#412 — recency-weighted blend, rounded to the closest score)", () => {
  const H = RATING_HALF_LIFE_MS;
  const at = (msBeforeAnchor) => new Date(Date.parse("2026-10-10T10:00:00Z") - msBeforeAnchor).toISOString();
  const rating = (id, score, rated_at, extra = {}) => ({
    criterion: "scope", rated_by_propel_id: id, rated_by_name: id, score, rated_at, ...extra,
  });

  it("a single rating is the state as-is, with when/who intact", () => {
    const by = latestRatingsByMentor([rating("greg", "red", "2026-10-10T02:00:00")]);
    const b = blendedRating(by.scope);
    expect(b.score).toBe("red");
    expect(b.value).toBe(1);
    expect(b.newest).toMatchObject({ rated_by_propel_id: "greg" });
    expect(b.contributions).toHaveLength(1);
    expect(b.contributions[0].share).toBe(1);
  });

  it("a rating two half-lives old can't outvote a fresh one (red 8h → green now = green)", () => {
    const by = latestRatingsByMentor([
      rating("greg", "red", at(2 * H)),
      rating("jasmine", "green", at(0)),
    ]);
    const b = blendedRating(by.scope);
    expect(b.contributions.map((x) => x.entry.rated_by_propel_id)).toEqual(["jasmine", "greg"]);
    expect(b.contributions[1].weight).toBeCloseTo(0.25);
    expect(b.value).toBeCloseTo((3 + 0.25) / 1.25); // 2.6
    expect(b.score).toBe("green");
  });

  it("a fresh disagreement blends to yellow instead of picking a side", () => {
    const by = latestRatingsByMentor([
      rating("greg", "red", at(H / 2)),
      rating("jasmine", "green", at(0)),
    ]);
    const b = blendedRating(by.scope);
    expect(b.value).toBeCloseTo((3 + Math.SQRT1_2) / (1 + Math.SQRT1_2)); // ≈ 2.17
    expect(b.score).toBe("yellow");
    const same = blendedRating(latestRatingsByMentor([rating("a", "red", at(0)), rating("b", "green", at(0))]).scope);
    expect(same.value).toBe(2);
    expect(same.score).toBe("yellow");
  });

  it("an exact midpoint rounds down (yellow + green at once = yellow)", () => {
    const b = blendedRating(latestRatingsByMentor([rating("a", "yellow", at(0)), rating("b", "green", at(0))]).scope);
    expect(b.value).toBe(2.5);
    expect(b.score).toBe("yellow");
    expect(scoreFromValue(2.5000001)).toBe("green");
    expect(scoreFromValue(1.5)).toBe("red");
    expect(scoreFromValue(1.5000001)).toBe("yellow");
    expect(scoreFromValue(NaN)).toBeNull();
  });

  it("weights trail the NEWEST rating, not the clock — last week's ratings still blend", () => {
    const WEEK = 7 * 24 * 60 * 60 * 1000;
    const b = blendedRating(latestRatingsByMentor([
      rating("greg", "red", at(WEEK + 2 * H)),
      rating("jasmine", "green", at(WEEK)),
    ]).scope);
    expect(b.contributions[0].weight).toBe(1);
    expect(b.contributions[1].weight).toBeCloseTo(0.25);
    expect(b.score).toBe("green");
    expect(ratingWeight({ rated_at: "nope" }, 5)).toBe(1); // undated counts fully
  });

  it("only each mentor's LATEST rating votes — re-rating replaces your own earlier call", () => {
    const by = latestRatingsByMentor([
      rating("greg", "red", at(2 * H)),
      rating("greg", "green", at(0)),
    ]);
    const b = blendedRating(by.scope);
    expect(b.contributions).toHaveLength(1);
    expect(b.score).toBe("green");
  });

  it("an in-flight optimistic entry anchors the blend at full weight regardless of clocks", () => {
    const by = {
      greg: rating("greg", "red", "2099-01-01T00:00:00"),
      me: rating("me", "green", at(0), { optimistic: true }),
    };
    const b = blendedRating(by);
    expect(b.contributions[0].entry.rated_by_propel_id).toBe("me");
    expect(b.contributions[0].weight).toBe(1);
    expect(b.contributions[1].weight).toBe(1); // "newer" than the anchor → never discounted
    expect(b.score).toBe("yellow");
  });

  it("shares sum to 1 and are ordered newest first", () => {
    const b = blendedRating(latestRatingsByMentor([
      rating("a", "green", at(3 * H)),
      rating("b", "yellow", at(H)),
      rating("c", "red", at(0)),
    ]).scope);
    expect(b.contributions.map((x) => x.entry.rated_by_propel_id)).toEqual(["c", "b", "a"]);
    expect(b.contributions.reduce((s, x) => s + x.share, 0)).toBeCloseTo(1);
  });

  it("returns null when nobody has rated and ignores unknown scores", () => {
    expect(blendedRating(undefined)).toBeNull();
    expect(blendedRating({})).toBeNull();
    const by = latestRatingsByMentor([rating("x", "purple", "2026-10-10T02:00:00")]);
    expect(by.scope).toBeUndefined();
  });
});

describe("ratingHistory / newestRating", () => {
  const ratings = [
    { criterion: "scope", rated_by_propel_id: "greg", score: "red", rated_at: "2026-10-10T02:00:00" },
    { criterion: "polish", rated_by_propel_id: "greg", score: "yellow", rated_at: "2026-10-10T02:30:00" },
    { criterion: "scope", rated_by_propel_id: "jasmine", score: "yellow", rated_at: "2026-10-10T06:00:00" },
    { criterion: "scope", rated_by_propel_id: "jasmine", score: "green", rated_at: "2026-10-10T09:15:00" },
    null,
    { criterion: "scope", score: "green", rated_at: "2026-10-10T09:30:00" }, // no mentor id → dropped
  ];

  it("returns only that criterion, newest first, without mutating the input", () => {
    const copy = [...ratings];
    const h = ratingHistory(ratings, "scope");
    expect(h.map((r) => r.score)).toEqual(["green", "yellow", "red"]);
    expect(ratings).toEqual(copy);
    expect(ratingHistory(ratings, "security")).toEqual([]);
    expect(ratingHistory(undefined, "scope")).toEqual([]);
  });

  it("newestRating picks the freshest counted rating across criteria", () => {
    const by = latestRatingsByMentor(ratings);
    expect(newestRating(by)).toMatchObject({ criterion: "scope", score: "green" });
    expect(newestRating({})).toBeNull();
  });
});

describe("time element: naive backend timestamps are UTC", () => {
  const NOW = Date.parse("2026-10-10T10:00:00Z");
  let nowSpy;
  beforeEach(() => {
    nowSpy = jest.spyOn(Date, "now").mockReturnValue(NOW);
  });
  afterEach(() => nowSpy.mockRestore());

  it("parseMentorTimestamp treats an offset-less string as UTC and passes offsets through", () => {
    expect(parseMentorTimestamp("2026-10-10T09:15:00")).toBe(Date.parse("2026-10-10T09:15:00Z"));
    expect(parseMentorTimestamp("2026-10-10T09:15:00.123456")).toBe(Date.parse("2026-10-10T09:15:00.123Z"));
    expect(parseMentorTimestamp("2026-10-10T09:15:00Z")).toBe(Date.parse("2026-10-10T09:15:00Z"));
    expect(parseMentorTimestamp("2026-10-10T02:15:00-07:00")).toBe(Date.parse("2026-10-10T09:15:00Z"));
    expect(parseMentorTimestamp("2026-10-10")).toBe(Date.parse("2026-10-10T00:00:00Z"));
    expect(parseMentorTimestamp("")).toBeNaN();
    expect(parseMentorTimestamp("not a date")).toBeNaN();
  });

  it("relativeTime reads a naive server stamp as 45m ago, not 'just now' or hours in the future", () => {
    expect(relativeTime("2026-10-10T09:15:00")).toBe("45m ago");
    expect(relativeTime("2026-10-10T09:15:00.000Z")).toBe("45m ago");
    expect(relativeTime("2026-10-10T02:00:00")).toBe("8h ago");
  });

  it("isRatingStale flags ratings older than the window, never a fresh or missing one", () => {
    expect(isRatingStale({ rated_at: "2026-10-10T02:00:00" })).toBe(true); // 8h
    expect(isRatingStale({ rated_at: "2026-10-10T09:15:00" })).toBe(false); // 45m
    expect(isRatingStale({ rated_at: new Date(NOW - RATING_STALE_AFTER_MS + 1000).toISOString() })).toBe(false);
    expect(isRatingStale({ rated_at: null })).toBe(false);
    expect(isRatingStale(null)).toBe(false);
  });

  it("ratingAttribution says when and who, and 'you' for the caller", () => {
    const entry = { rated_at: "2026-10-10T09:15:00", rated_by_propel_id: "jasmine", rated_by_name: "Jasmine T." };
    expect(ratingAttribution(entry)).toBe("45m ago · Jasmine T.");
    expect(ratingAttribution(entry, "jasmine")).toBe("45m ago · you");
    expect(ratingAttribution({ rated_by_propel_id: "x" })).toBe("a mentor");
    expect(ratingAttribution(null)).toBe("");
  });

  it("ratingBlendSummary says how many ratings count and how fresh the newest is", () => {
    const jasmine = { criterion: "scope", rated_at: "2026-10-10T09:15:00", rated_by_propel_id: "jasmine", rated_by_name: "Jasmine T.", score: "green" };
    const greg = { criterion: "scope", rated_at: "2026-10-10T02:00:00", rated_by_propel_id: "greg", rated_by_name: "Greg V.", score: "red" };
    expect(ratingBlendSummary(blendedRating({ jasmine }))).toBe("45m ago · Jasmine T.");
    expect(ratingBlendSummary(blendedRating({ jasmine, greg }), "jasmine")).toBe("2 ratings, latest 45m ago · you");
    expect(ratingBlendSummary(null)).toBe("");
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
  it("overlays my newest rating so it counts in the blend instantly", () => {
    const by = latestRatingsByMentor([
      { criterion: "scope", rated_by_propel_id: "m1", score: "green", rated_at: "2026-10-10T02:00:00" },
    ]);
    const out = applyOptimisticRatings(by, { scope: { score: "red", rated_at: "2026-10-10T12:00:00.000Z" } }, "me");
    expect(out.scope.me.score).toBe("red");
    expect(out.scope.me.optimistic).toBe(true);
    const b = blendedRating(out.scope);
    expect(b.newest.rated_by_propel_id).toBe("me");
    expect(b.score).toBe("red"); // m1's green is 10h (2.5 half-lives) behind
    expect(by.scope.me).toBeUndefined();
  });

  it("ignores empty overrides", () => {
    const by = { scope: {} };
    expect(applyOptimisticRatings(by, { scope: null }, "me").scope.me).toBeUndefined();
    expect(applyOptimisticRatings(by, {}, "me")).toBe(by);
  });
});
