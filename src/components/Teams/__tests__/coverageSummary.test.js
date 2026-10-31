import {
  COVERAGE_POSSIBLE_SIGNOFFS,
  coverageSummary,
  coverageLabel,
  coverageDetail,
  coverageDoneCount,
} from "../mentorCoverage";

// "0/6 covered" only moved once an item had all 3 sign-offs, so a team two
// mentors had walked through end to end still read as untouched. The summary
// counts every individual sign-off (6 items × 3 mentors = 18) and says how
// many mentors contributed.
const check = (name, at = "2026-10-17T02:09:07") => ({ name, checked_at: at });

describe("coverageSummary", () => {
  it("counts every sign-off, not just items with all three (the test-event case)", () => {
    // Two mentors signed off five items each → the old headline said 0/6.
    const checks = { gina: check("Gina Vannoni"), greg: check("Greg V") };
    const checklist = {
      intro_made: { checks },
      scope_reviewed: { checks },
      architecture_discussed: { checks },
      criteria_walkthrough: { checks },
      demo_devpost_reviewed: { checks },
    };
    const s = coverageSummary(checklist);
    expect(coverageDoneCount(checklist)).toBe(0);
    expect(s.possible).toBe(COVERAGE_POSSIBLE_SIGNOFFS);
    expect(s.possible).toBe(18);
    expect(s.signoffs).toBe(10);
    expect(s.percent).toBe(56);
    expect(s.fullyCovered).toBe(0);
    expect(s.started).toBe(5);
    expect(s.mentorCount).toBe(2);
    expect(s.mentorNames).toEqual(["Gina Vannoni", "Greg V"]);
    expect(s.complete).toBe(false);
    expect(s.items.map((i) => i.count)).toEqual([2, 2, 2, 0, 2, 2]);
  });

  it("per-item counts follow catalog order and the legacy single-mentor shape counts as one", () => {
    const s = coverageSummary({
      intro_made: { checks: { a: check("A"), b: check("B"), c: check("C") } },
      repo_health_checked: { done: true, checked_by_name: "Old Mentor" },
    });
    expect(s.items.map((i) => [i.slug, i.count, i.covered])).toEqual([
      ["intro_made", 3, true],
      ["scope_reviewed", 0, false],
      ["architecture_discussed", 0, false],
      ["repo_health_checked", 1, false],
      ["criteria_walkthrough", 0, false],
      ["demo_devpost_reviewed", 0, false],
    ]);
    expect(s.signoffs).toBe(4);
    expect(s.percent).toBe(22);
    expect(s.fullyCovered).toBe(1);
    expect(s.mentorCount).toBe(4); // a, b, c + the legacy mentor
  });

  it("caps an item at the target so odd data can't push the share past 100%", () => {
    const four = { a: check("A"), b: check("B"), c: check("C"), d: check("D") };
    const s = coverageSummary({ intro_made: { checks: four } });
    expect(s.items[0].count).toBe(3);
    expect(s.items[0].covered).toBe(true);
    expect(s.mentorCount).toBe(4);
  });

  it("is empty-safe", () => {
    for (const input of [undefined, null, {}, { intro_made: null }]) {
      const s = coverageSummary(input);
      expect(s.signoffs).toBe(0);
      expect(s.percent).toBe(0);
      expect(s.mentorCount).toBe(0);
      expect(s.complete).toBe(false);
      expect(s.items).toHaveLength(6);
    }
  });

  it("is complete only when every item has all three", () => {
    const full = { a: check("A"), b: check("B"), c: check("C") };
    const checklist = Object.fromEntries(
      [
        "intro_made",
        "scope_reviewed",
        "architecture_discussed",
        "repo_health_checked",
        "criteria_walkthrough",
        "demo_devpost_reviewed",
      ].map((slug) => [slug, { checks: full }]),
    );
    const s = coverageSummary(checklist);
    expect(s.signoffs).toBe(18);
    expect(s.percent).toBe(100);
    expect(s.complete).toBe(true);
  });
});

describe("coverageLabel / coverageDetail", () => {
  const two = { gina: check("Gina Vannoni"), greg: check("Greg V") };
  const partial = coverageSummary({
    intro_made: { checks: two },
    scope_reviewed: { checks: { gina: check("Gina Vannoni") } },
  });

  it("says the share and who contributed, in plain words", () => {
    expect(coverageLabel(partial)).toBe("17% signed off · 2 mentors");
    expect(coverageLabel(partial, { compact: true })).toBe("17% · 2 mentors");
    expect(coverageDetail(partial)).toBe(
      "3 of 18 sign-offs (6 items × 3 mentors each) from 2 mentors · 0 of 6 items fully covered",
    );
  });

  it("singular mentor, nothing yet, and fully covered", () => {
    const one = coverageSummary({
      intro_made: { checks: { gina: check("Gina Vannoni") } },
    });
    expect(coverageLabel(one)).toBe("6% signed off · 1 mentor");
    expect(coverageDetail(one)).toMatch(/from 1 mentor ·/);

    const none = coverageSummary({});
    expect(coverageLabel(none)).toBe("No sign-offs yet");
    expect(coverageLabel(none, { compact: true })).toBe("0%");
    expect(coverageDetail(none)).toMatch(
      /0 of 18 sign-offs .* from no mentors yet/,
    );

    const full = { a: check("A"), b: check("B"), c: check("C") };
    const done = coverageSummary(
      Object.fromEntries(partial.items.map((i) => [i.slug, { checks: full }])),
    );
    expect(coverageLabel(done)).toBe("Fully covered · 3 mentors");
    expect(coverageLabel(done, { compact: true })).toBe("100% · 3 mentors");
    expect(coverageDetail(done)).toMatch(/6 of 6 items fully covered$/);
  });
});

// ---- freshness (Oct 2026): a sign-off counts for 5 hours ---------------------
import {
  MENTOR_COVERAGE_FRESH_MS,
  applyOptimisticCoverage,
  coverageHistory,
  isCheckFresh,
} from "../mentorCoverage";

const NOW = Date.parse("2026-11-14T22:00:00Z");
const ago = (hours) => new Date(NOW - hours * 3_600_000).toISOString();

describe("coverageSummary freshness", () => {
  const checklist = {
    // once-item: age never matters
    intro_made: {
      checks: {
        a: check("A", ago(20)),
        b: check("B", ago(10)),
        c: check("C", ago(6)),
      },
    },
    scope_reviewed: {
      checks: { a: check("A", ago(18)), b: check("B", ago(0.5)) },
    },
    architecture_discussed: { checks: { a: check("A", ago(6)) } },
  };

  it("drops recurring sign-offs older than 5h out of the share, keeps once-items", () => {
    const s = coverageSummary(checklist, { now: NOW });
    expect(s.items.map((i) => [i.count, i.stale])).toEqual([
      [3, 0],
      [1, 1],
      [0, 1],
      [0, 0],
      [0, 0],
      [0, 0],
    ]);
    expect(s.items[1].checks.map((c) => c.fresh)).toEqual([false, true]);
    expect(s.signoffs).toBe(4);
    expect(s.staleSignoffs).toBe(2);
    expect(s.percent).toBe(22);
    expect(s.mentorCount).toBe(3);
    expect(s.fullyCovered).toBe(1);
    expect(coverageLabel(s)).toBe("22% signed off · 3 mentors · 2 stale");
    expect(coverageLabel(s, { compact: true })).toBe(
      "22% · 3 mentors · 2 stale",
    );
    expect(coverageDetail(s)).toBe(
      "4 of 18 sign-offs in the last 5h (6 items × 3 mentors each) from 3 mentors · 2 older sign-offs over 5h old need a fresh check · 1 of 6 items fully covered",
    );
  });

  it("without a clock (SSR / hydration) every sign-off counts", () => {
    const s = coverageSummary(checklist);
    expect(s.signoffs).toBe(6);
    expect(s.staleSignoffs).toBe(0);
    expect(coverageLabel(s)).toBe("33% signed off · 3 mentors");
    expect(coverageDetail(s)).not.toMatch(/in the last/);
  });

  it("says so when everything has gone stale", () => {
    const s = coverageSummary(
      { scope_reviewed: { checks: { a: check("A", ago(7)) } } },
      { now: NOW },
    );
    expect(coverageLabel(s)).toBe("No fresh sign-offs · 1 stale");
    expect(coverageLabel(s, { compact: true })).toBe("0% · 1 stale");
    expect(coverageDetail(s)).toBe(
      "0 of 18 sign-offs in the last 5h (6 items × 3 mentors each) from no mentors yet · 1 older sign-off over 5h old needs a fresh check · 0 of 6 items fully covered",
    );
  });

  it("reads naive backend timestamps as UTC and goes stale at exactly 5h", () => {
    // Backend stamps naive datetime.now().isoformat() on a UTC container.
    expect(
      isCheckFresh(
        { checked_at: "2026-11-14T21:30:00" },
        "scope_reviewed",
        NOW,
      ),
    ).toBe(true);
    expect(
      isCheckFresh(
        { checked_at: "2026-11-14T16:30:00" },
        "scope_reviewed",
        NOW,
      ),
    ).toBe(false);
    expect(isCheckFresh({ checked_at: ago(5) }, "scope_reviewed", NOW)).toBe(
      false,
    );
    expect(
      isCheckFresh(
        {
          checked_at: new Date(
            NOW - MENTOR_COVERAGE_FRESH_MS + 1,
          ).toISOString(),
        },
        "scope_reviewed",
        NOW,
      ),
    ).toBe(true);
    // once-items and timestamp-less legacy checks always count
    expect(
      isCheckFresh({ checked_at: ago(40) }, "criteria_walkthrough", NOW),
    ).toBe(true);
    expect(isCheckFresh({ name: "Old" }, "scope_reviewed", NOW)).toBe(true);
    expect(isCheckFresh({ checked_at: ago(40) }, "scope_reviewed", null)).toBe(
      true,
    );
  });
});

describe("coverageHistory", () => {
  it("is newest first, normalizes the action and tolerates junk", () => {
    const h = coverageHistory({
      history: [
        { propel_id: "a", name: "A", at: ago(9), action: "checked" },
        null,
        { propel_id: "a", name: "A", at: ago(7), action: "cleared" },
        { propel_id: "b", name: "B", at: ago(1), action: "bogus" },
      ],
    });
    expect(h.map((x) => [x.name, x.action])).toEqual([
      ["B", "checked"],
      ["A", "cleared"],
      ["A", "checked"],
    ]);
    expect(coverageHistory(undefined)).toEqual([]);
    expect(coverageHistory({ checks: {} })).toEqual([]);
  });
});

describe("applyOptimisticCoverage", () => {
  const history = [
    { propel_id: "me", name: "Me", at: ago(7), action: "checked" },
  ];
  const base = {
    scope_reviewed: {
      checks: { me: check("Me", ago(7)), a: check("A", ago(1)) },
      history,
    },
  };

  it("re-confirming a stale check moves my timestamp to now and keeps the trail", () => {
    const out = applyOptimisticCoverage(
      base,
      { scope_reviewed: true },
      "me",
      "Me",
    );
    const mine = out.scope_reviewed.checks.me;
    expect(mine.name).toBe("Me");
    // The overlay stamps the real clock (it is replaced by the server copy).
    expect(Date.parse(mine.checked_at)).toBeGreaterThan(Date.now() - 5_000);
    expect(out.scope_reviewed.checks.a).toEqual(check("A", ago(1)));
    expect(out.scope_reviewed.history).toBe(history);
    expect(base.scope_reviewed.checks.me.checked_at).toBe(ago(7)); // input untouched
  });

  it("clearing drops only my check", () => {
    const out = applyOptimisticCoverage(
      base,
      { scope_reviewed: false },
      "me",
      "Me",
    );
    expect(Object.keys(out.scope_reviewed.checks)).toEqual(["a"]);
    expect(out.scope_reviewed.history).toBe(history);
  });
});
