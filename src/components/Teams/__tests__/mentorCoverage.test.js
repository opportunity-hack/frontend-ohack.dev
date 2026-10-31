import {
  applyOptimisticCoverage,
  applyOptimisticRatings,
  splitMentorFlags,
  durationLabel,
  latestRatingsByMentor,
  currentRating,
  previousRating,
  ratingHistory,
  ratingDirection,
  newestRating,
  isRatingStale,
  ratingAttribution,
  parseMentorTimestamp,
  relativeTime,
  RATING_STALE_AFTER_MS,
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
describe("currentRating (#412 — newest rating wins, any mentor)", () => {
  const ratings = [
    { criterion: "scope", rated_by_propel_id: "greg", rated_by_name: "Greg V.", score: "red", rated_at: "2026-10-10T02:00:00" },
    { criterion: "scope", rated_by_propel_id: "jasmine", rated_by_name: "Jasmine T.", score: "green", rated_at: "2026-10-10T09:15:00" },
    { criterion: "polish", rated_by_propel_id: "greg", score: "yellow", rated_at: "2026-10-10T02:00:00" },
  ];

  it("takes the most recent rating even when an older one was worse", () => {
    const by = latestRatingsByMentor(ratings);
    expect(currentRating(by.scope)).toMatchObject({ score: "green", rated_by_propel_id: "jasmine" });
  });

  it("still keeps each mentor's own newest rating for the 'You:' chip", () => {
    const by = latestRatingsByMentor([
      ...ratings,
      { criterion: "scope", rated_by_propel_id: "greg", score: "yellow", rated_at: "2026-10-10T03:00:00" },
    ]);
    expect(by.scope.greg.score).toBe("yellow");
    expect(currentRating(by.scope).score).toBe("green"); // Jasmine's is still newer
  });

  it("lets a mentor re-rating later override their own earlier rating", () => {
    const by = latestRatingsByMentor([
      { criterion: "scope", rated_by_propel_id: "greg", score: "red", rated_at: "2026-10-10T02:00:00" },
      { criterion: "scope", rated_by_propel_id: "greg", score: "green", rated_at: "2026-10-10T05:00:00" },
    ]);
    expect(currentRating(by.scope).score).toBe("green");
  });

  it("returns null when nobody has rated and ignores unknown scores", () => {
    expect(currentRating(undefined)).toBeNull();
    expect(currentRating({})).toBeNull();
    const by = latestRatingsByMentor([
      { criterion: "scope", rated_by_propel_id: "x", score: "purple", rated_at: "2026-10-10T02:00:00" },
    ]);
    expect(by.scope).toBeUndefined();
  });

  it("prefers an in-flight optimistic entry regardless of clocks", () => {
    const by = {
      greg: { score: "red", rated_at: "2099-01-01T00:00:00", rated_by_propel_id: "greg" },
      me: { score: "green", rated_at: "2026-10-10T09:15:00.000Z", rated_by_propel_id: "me", optimistic: true },
    };
    expect(currentRating(by).score).toBe("green");
  });
});

describe("ratingHistory / previousRating / ratingDirection", () => {
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

  it("previousRating is the entry the current one replaced (any mentor), null for the first", () => {
    const h = ratingHistory(ratings, "scope");
    const current = currentRating(latestRatingsByMentor(ratings).scope);
    expect(previousRating(h, current)).toMatchObject({ score: "yellow", rated_by_propel_id: "jasmine" });
    expect(previousRating(h, h[2])).toBeNull();
    expect(previousRating(h, null)).toBeNull();
  });

  it("previousRating under an optimistic overlay is the server's newest rating", () => {
    const h = ratingHistory(ratings, "scope");
    const mine = { score: "red", rated_at: "2026-10-10T10:00:00.000Z", rated_by_propel_id: "me", optimistic: true };
    expect(previousRating(h, mine).score).toBe("green");
  });

  it("ratingDirection reads improvement vs regression", () => {
    expect(ratingDirection({ score: "red" }, { score: "green" })).toBe("up");
    expect(ratingDirection({ score: "green" }, { score: "yellow" })).toBe("down");
    expect(ratingDirection({ score: "yellow" }, { score: "yellow" })).toBe("same");
    expect(ratingDirection(null, { score: "green" })).toBeNull();
  });

  it("newestRating picks the freshest current rating across criteria", () => {
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
  it("overlays my newest rating so it becomes the current state instantly", () => {
    const by = latestRatingsByMentor([
      { criterion: "scope", rated_by_propel_id: "m1", score: "green", rated_at: "2026-10-10T10:00:00" },
    ]);
    const out = applyOptimisticRatings(by, { scope: { score: "red", rated_at: "2026-10-10T12:00:00" } }, "me");
    expect(out.scope.me.score).toBe("red");
    expect(out.scope.me.optimistic).toBe(true);
    expect(currentRating(out.scope).score).toBe("red");
    expect(by.scope.me).toBeUndefined();
  });

  it("ignores empty overrides", () => {
    const by = { scope: {} };
    expect(applyOptimisticRatings(by, { scope: null }, "me").scope.me).toBeUndefined();
    expect(applyOptimisticRatings(by, {}, "me")).toBe(by);
  });
});
