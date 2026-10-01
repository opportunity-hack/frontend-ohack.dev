/** @jest-environment node */
const { pathToRegexp } = require("next/dist/compiled/path-to-regexp");
const cfg = require("../../next.config.js");

describe("next.config headers()", () => {
  let rule;
  beforeAll(async () => {
    const rules = await cfg.headers();
    rule = rules.find((r) => r.source.startsWith("/:path(("));
  });

  it("has a page-scoped catch-all rule with the security headers", () => {
    expect(rule).toBeDefined();
    const byKey = Object.fromEntries(rule.headers.map((h) => [h.key, h.value]));
    expect(byKey["X-Frame-Options"]).toBe("SAMEORIGIN");
    expect(byKey["X-Content-Type-Options"]).toBe("nosniff");
    expect(byKey["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
    expect(byKey["Permissions-Policy"]).toBe(
      "camera=(self), microphone=(), geolocation=()"
    );
    expect(byKey["Cache-Control"]).toBe("public, max-age=3600, must-revalidate");
  });

  it("matches pages but not API routes or _next assets", () => {
    const re = pathToRegexp(rule.source);
    expect(re.test("/hack/x/team/y")).toBe(true);
    expect(re.test("/")).toBe(true);
    expect(re.test("/api/x")).toBe(false);
    expect(re.test("/_next/static/a.js")).toBe(false);
  });

  it("no longer applies public Cache-Control to every path", async () => {
    const rules = await cfg.headers();
    expect(rules.find((r) => r.source === "/:path*")).toBeUndefined();
  });
});
