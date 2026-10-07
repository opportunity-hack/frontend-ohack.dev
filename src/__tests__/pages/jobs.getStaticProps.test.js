/**
 * @jest-environment node
 */
// /jobs builds at deploy time, so getStaticProps MUST NEVER THROW — a throw
// fails the whole Vercel build (Oct 2026: a transient 503 from /api/jobs took
// down an unrelated PR's deploy). Mirrors the /blog + /nonprofits contract.

jest.mock("../../lib/ga", () => ({
  initFacebookPixel: jest.fn(),
  trackEvent: jest.fn(),
}));

const { getStaticProps } = require("../../pages/jobs/index");

const listing = { slug: "social-media-manager", title: "Social Media Manager" };

function mockFetch(impl) {
  global.fetch = jest.fn(impl);
}

describe("/jobs getStaticProps (deploy-time, never throws)", () => {
  const origFetch = global.fetch;
  let errorSpy;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_SERVER_URL = "https://api.test";
    errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    global.fetch = origFetch;
    errorSpy.mockRestore();
  });

  it("returns listings with the normal revalidate on 200", async () => {
    mockFetch(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ listings: [listing] }),
    }));
    const result = await getStaticProps();
    expect(result.props.listings).toEqual([listing]);
    expect(result.revalidate).toBe(300);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.test/api/jobs",
      expect.objectContaining({ signal: expect.anything() }),
    );
  });

  it("treats 404 (backend not deployed yet) as an empty list at the normal revalidate", async () => {
    mockFetch(async () => ({ ok: false, status: 404, json: async () => ({}) }));
    const result = await getStaticProps();
    expect(result.props.listings).toEqual([]);
    expect(result.revalidate).toBe(300);
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it("does NOT throw on a 503 — empty list, retry in 60s", async () => {
    mockFetch(async () => ({ ok: false, status: 503, json: async () => ({}) }));
    const result = await getStaticProps();
    expect(result.props.listings).toEqual([]);
    expect(result.revalidate).toBe(60);
    expect(errorSpy).toHaveBeenCalled();
  });

  it("does NOT throw when fetch rejects (timeout / network)", async () => {
    mockFetch(async () => {
      throw new Error("The operation was aborted due to timeout");
    });
    const result = await getStaticProps();
    expect(result.props.listings).toEqual([]);
    expect(result.revalidate).toBe(60);
  });

  it("does NOT throw on a malformed payload", async () => {
    mockFetch(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ listings: "nope" }),
    }));
    const result = await getStaticProps();
    expect(result.props.listings).toEqual([]);
    expect(result.revalidate).toBe(300);
  });
});
