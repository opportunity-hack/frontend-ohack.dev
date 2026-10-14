/**
 * Build-safety contract: the event pages must not fetch anything during
 * `next build`. Prerendering every /hack/<event> fired ~40 backend requests
 * at deploy time and one network blip aborted the whole Vercel build
 * (Oct 7 2026). They render on demand via ISR instead.
 */
jest.mock("next/dynamic", () => () => () => null);
// agenda.js imports react-markdown (ESM) directly; jest cannot parse it.
jest.mock("react-markdown", () => () => null);
jest.mock("remark-gfm", () => () => null);

describe("event pages getStaticPaths", () => {
  const originalFetch = global.fetch;
  beforeEach(() => {
    global.fetch = jest.fn(() => {
      throw new Error("getStaticPaths must not fetch at build time");
    });
  });
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("/hack/[event_id] emits no build-time paths and never fetches", async () => {
    const { getStaticPaths } = require("../../pages/hack/[event_id].js");
    await expect(getStaticPaths()).resolves.toEqual({
      paths: [],
      fallback: "blocking",
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("/hack/[event_id]/agenda emits no build-time paths and never fetches", async () => {
    const { getStaticPaths } = require("../../pages/hack/[event_id]/agenda.js");
    await expect(getStaticPaths()).resolves.toEqual({ paths: [], fallback: true });
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
