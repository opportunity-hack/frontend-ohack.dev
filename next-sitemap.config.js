const fs = require('fs');
const path = require('path');

module.exports = {
  siteUrl: process.env.SITE_URL || "https://www.ohack.dev",
  generateRobotsTxt: true,
  exclude: [
    "/admin",
    "/profile",
    "/nonprofit/[nonprofit_id]",
    "/hackathon/[hackathon_id]",
    "/project/[project_id]",
    "/hack/[event_id]",
    "https://api.test.ohack.dev/",
    "https://test.api.ohack.dev/",
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        disallow: process.env.SITE_URL === "https://test.ohack.dev" ? "/" : [],
      },
    ],
    additionalSitemaps: [
      `${process.env.SITE_URL || "https://www.ohack.dev"}/server-sitemap.xml`,
    ],
  },
  transform: async (config, path) => {
    let lastmod = new Date().toISOString();
    const filePath = `./pages${path}.js`;

    try {
      if (fs.existsSync(filePath)) {
        const stat = fs.statSync(filePath);
        lastmod = new Date(stat.mtime).toISOString();
      }
    } catch (error) {
      console.warn(`Warning: Could not get last modified time for ${filePath}`);
    }

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
      path.includes("mentor") ||
      path.includes("sponsor")
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
      lastmod: lastmod,
    };
  },
  additionalPaths: async (config) => {
    const result = [];
    // Add dynamic routes here if needed
    return result;
  },
};