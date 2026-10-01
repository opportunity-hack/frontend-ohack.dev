import { buildSitemapFields } from "../sitemapFields";

const BASE_URL = "https://www.ohack.dev";
const NOW = "2026-09-30T00:00:00.000Z";

describe("buildSitemapFields", () => {
  it("builds a blog entry from the news API's {text:[...]} shape with a derived lastmod", () => {
    const fields = buildSitemapFields({
      news: { text: [{ id: "a", slack_ts: "1700000000.1" }] },
      baseUrl: BASE_URL,
      now: NOW,
    });

    const blogFields = fields.filter((f) => f.loc.includes("/blog/"));
    expect(blogFields).toHaveLength(1);
    expect(blogFields[0]).toMatchObject({
      loc: `${BASE_URL}/blog/a`,
      lastmod: new Date(1700000000.1 * 1000).toISOString(),
    });
  });

  it("produces no blog entries and does not throw for {}/null/{news:[...]} shaped input", () => {
    expect(() => buildSitemapFields({ news: {}, baseUrl: BASE_URL, now: NOW })).not.toThrow();
    expect(buildSitemapFields({ news: {}, baseUrl: BASE_URL, now: NOW }).length).toBe(0);

    expect(() => buildSitemapFields({ news: null, baseUrl: BASE_URL, now: NOW })).not.toThrow();
    expect(buildSitemapFields({ news: null, baseUrl: BASE_URL, now: NOW }).length).toBe(0);

    // The old (wrong) shape the API never actually returns — must not throw
    // and must not be treated as the list of posts.
    expect(() =>
      buildSitemapFields({ news: { news: [{ id: "x" }] }, baseUrl: BASE_URL, now: NOW })
    ).not.toThrow();
    expect(
      buildSitemapFields({ news: { news: [{ id: "x" }] }, baseUrl: BASE_URL, now: NOW }).length
    ).toBe(0);
  });

  it("falls back to slack_ts when published_at is invalid", () => {
    const fields = buildSitemapFields({
      news: { text: [{ id: "b", published_at: "not-a-date", slack_ts: "1700000000" }] },
      baseUrl: BASE_URL,
      now: NOW,
    });
    expect(fields[0].lastmod).toBe(new Date(1700000000 * 1000).toISOString());
  });

  it("prefers a valid published_at over slack_ts", () => {
    const fields = buildSitemapFields({
      news: { text: [{ id: "c", published_at: "2025-01-01T00:00:00.000Z", slack_ts: "1700000000" }] },
      baseUrl: BASE_URL,
      now: NOW,
    });
    expect(fields[0].lastmod).toBe("2025-01-01T00:00:00.000Z");
  });

  it("falls back to now when neither published_at nor slack_ts parse", () => {
    const fields = buildSitemapFields({
      news: { text: [{ id: "d" }] },
      baseUrl: BASE_URL,
      now: NOW,
    });
    expect(fields[0].lastmod).toBe(NOW);
  });

  it("uses event_id || id for hackathons", () => {
    const fields = buildSitemapFields({
      hackathons: { hackathons: [{ event_id: "2026_fall" }, { id: "legacy_id" }, {}] },
      baseUrl: BASE_URL,
      now: NOW,
    });
    const locs = fields.map((f) => f.loc);
    expect(locs).toContain(`${BASE_URL}/hack/2026_fall`);
    expect(locs).toContain(`${BASE_URL}/hack/legacy_id`);
  });

  it("uses slug for jobs and portfolios", () => {
    const fields = buildSitemapFields({
      jobs: { listings: [{ slug: "mentor-program-lead" }, {}] },
      portfolios: { portfolios: [{ slug: "greg" }, {}] },
      baseUrl: BASE_URL,
      now: NOW,
    });
    const locs = fields.map((f) => f.loc);
    expect(locs).toContain(`${BASE_URL}/jobs/mentor-program-lead`);
    expect(locs).toContain(`${BASE_URL}/u/greg`);
  });

  it("never emits /nonprofit/ entries even when a nonprofits-shaped arg is passed", () => {
    const fields = buildSitemapFields({
      nonprofits: { nonprofits: [{ id: "npo-1" }] },
      baseUrl: BASE_URL,
      now: NOW,
    });
    expect(fields.some((f) => f.loc.includes("/nonprofit/"))).toBe(false);
  });
});
