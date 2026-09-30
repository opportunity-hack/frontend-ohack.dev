module.exports = {
  siteUrl: process.env.SITE_URL || "https://www.ohack.dev",
  generateRobotsTxt: true,
  // Only `*` is special in next-sitemap's matcher (matches across `/`,
  // pattern is anchored, case-insensitive). Bracketed dynamic-route paths
  // (e.g. "/nonprofit/[nonprofit_id]") are dropped by next-sitemap before
  // exclude runs, so they can never match a real generated path — use
  // wildcard globs for every dynamic route instead.
  exclude: [
    "/admin",
    "/admin/*",
    "/profile",
    "/profile/*",
    "/u/*",
    "/cert",
    "/cert/*",
    "/nonprofit/*",
    "/project/*",
    "/hack/*/vote",
    "/hack/*/survey",
    "/hack/*/feedback",
    "/signup2",
    "/store/cart",
    "/store/success",
    "/unsubscribe",
    "/myfeedback",
    "/volunteer/track",
    "/judge",
    "/judge/*",
    "/server-sitemap.xml",
  ],
  // File-mtime-based lastmod is meaningless on Vercel (every mtime ≈ build
  // time on a fresh clone) and static pages don't have a real per-page
  // modified date to report — omit lastmod entirely for them. Real lastmod
  // is only emitted for blog entries in /server-sitemap.xml.
  autoLastmod: false,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        disallow: process.env.SITE_URL === "https://test.ohack.dev" ? "/" : ["/api/"],
      },
    ],
    additionalSitemaps: [
      `${process.env.SITE_URL || "https://www.ohack.dev"}/server-sitemap.xml`,
    ],
  },
  transform: async (config, path) => {
    const currentYear = new Date().getFullYear().toString();
    let priority = 0.5;
    let changefreq = "weekly";

    if (path === "/" || path === "/about" || path === "/hackathons") {
      priority = 1.0;
      changefreq = "daily";
    } else if (path.startsWith("/about/")) {
      priority = 0.9;
      changefreq = "weekly";
    } else if (
      path.includes("judging") ||
      path.includes("judge") ||
      path.includes("mentor") ||
      path.includes("sponsor") ||
      path.includes("recruit") ||
      path.includes("hackathon") ||
      path.includes("social-good") ||
      path.includes("nonprofits") ||
      path.includes("jobs")
    ) {
      priority = 0.8;
      changefreq = "weekly";
    } else if (path.includes(currentYear)) {
      priority = 0.7;
      changefreq = "daily";
    } else if (path.startsWith("/blog")) {
      priority = 0.3;
      changefreq = "monthly";
    }

    return {
      loc: path,
      changefreq: changefreq,
      priority: priority,
    };
  },
  additionalPaths: async (config) => {
    const result = [];
    // Add dynamic routes here if needed
    return result;
  },
};
