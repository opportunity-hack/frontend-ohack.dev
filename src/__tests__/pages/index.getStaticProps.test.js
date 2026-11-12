/**
 * @jest-environment node
 */
// The homepage builds at deploy time, so getStaticProps MUST NEVER THROW — a
// throw fails the whole Vercel build. Any news-fetch failure hides the blog
// band ([] props) and retries in 60s.

jest.mock("../../lib/ga", () => ({
  initFacebookPixel: jest.fn(),
  trackEvent: jest.fn(),
}));

const { getStaticProps } = require("../../pages/index");

const doc = (i) => ({
  id: `p${i}`,
  title: `Post ${i}`,
  description: "A description long enough to be used as the excerpt on the homepage.",
  content_markdown: "# Big markdown body that must not ship in props",
  image: `https://cdn.ohack.dev/news/p${i}.png`,
  slack_ts_human_readable: "2026-11-04 10:00:00",
});

function mockFetch(impl) {
  global.fetch = jest.fn(impl);
}

describe("/ getStaticProps (deploy-time, never throws)", () => {
  const origFetch = global.fetch;
  let errorSpy;
  let baseline;

  beforeAll(async () => {
    process.env.NEXT_PUBLIC_API_SERVER_URL = "https://api.test";
    global.fetch = jest.fn(async () => ({ ok: false, status: 503, json: async () => ({}) }));
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    baseline = await getStaticProps();
    spy.mockRestore();
  });

  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_SERVER_URL = "https://api.test";
    errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    global.fetch = origFetch;
    errorSpy.mockRestore();
  });

  it("returns 3 lean posts and hourly revalidate on 200", async () => {
    mockFetch(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ text: [doc(1), doc(2), doc(3), doc(4)] }),
    }));
    const result = await getStaticProps();
    expect(result.revalidate).toBe(3600);
    expect(result.props.blogPosts).toHaveLength(3);
    expect(Object.keys(result.props.blogPosts[0]).sort()).toEqual(["date", "excerpt", "id", "image", "title"]);
    expect(JSON.stringify(result.props.blogPosts)).not.toContain("markdown body");
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.test/api/messages/news?limit=3",
      expect.objectContaining({ signal: expect.anything() }),
    );
  });

  it.each([
    ["a 503", async () => ({ ok: false, status: 503, json: async () => ({}) })],
    ["a rejected fetch", async () => { throw new Error("aborted due to timeout"); }],
    ["a malformed payload", async () => ({ ok: true, status: 200, json: async () => ({ news: [] }) })],
  ])("does NOT throw on %s — empty list, retry in 60s", async (_label, impl) => {
    mockFetch(impl);
    const result = await getStaticProps();
    expect(result.props.blogPosts).toEqual([]);
    expect(result.revalidate).toBe(60);
    expect(errorSpy).toHaveBeenCalled();
  });

  it("keeps title and openGraphData unchanged", async () => {
    mockFetch(async () => ({ ok: true, status: 200, json: async () => ({ text: [doc(1)] }) }));
    const result = await getStaticProps();
    expect(result.props.title).toBe(baseline.props.title);
    expect(result.props.openGraphData).toEqual(baseline.props.openGraphData);
    expect(result.props.title).toMatch(/^Opportunity Hack — Hackathons/);
    expect(result.props.openGraphData).toHaveLength(10);
  });
});
