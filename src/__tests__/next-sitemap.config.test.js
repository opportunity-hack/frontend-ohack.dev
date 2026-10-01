/** @jest-environment node */
const path = require("path");

const cfg = require("../../next-sitemap.config.js");
const { isMatch } = require(
  path.join(process.cwd(), "node_modules/next-sitemap/dist/cjs/utils/matcher.js")
);

const isExcluded = (p) => isMatch([p], cfg.exclude);

describe("next-sitemap.config exclude", () => {
  it.each([
    "/admin/blog",
    "/admin/nonprofit/application",
    "/signup2",
    "/store/cart",
    "/cert",
    "/judge/overview",
    "/nonprofit/Tranquility Trail Animal Sanctuary",
    "/project/abc",
  ])("excludes %s", (p) => {
    expect(isExcluded(p)).toBe(true);
  });

  it.each(["/nonprofits", "/nonprofit-grants", "/projects", "/hack/2026_fall", "/about", "/"])(
    "keeps %s",
    (p) => {
      expect(isExcluded(p)).toBe(false);
    }
  );
});

describe("next-sitemap.config lastmod/robots", () => {
  it("disables autoLastmod", () => {
    expect(cfg.autoLastmod).toBe(false);
  });

  it("transform output has a loc but no lastmod", async () => {
    const result = await cfg.transform(cfg, "/about");
    expect(result.loc).toBe("/about");
    expect(result).not.toHaveProperty("lastmod");
  });
});
