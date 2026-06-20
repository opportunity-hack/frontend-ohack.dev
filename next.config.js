module.exports = {
  // Enable production optimizations in development
  // This will help with more accurate performance testing
  productionBrowserSourceMaps: false,

  // Optimize bundle size
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  // Modular imports / tree-shaking for heavy dependencies. Many MUI components
  // and icons get pulled in via named imports; without this, the full package
  // ships in the initial bundle. Also covers lodash (use lodash-es per import
  // path too) and date-fns.
  experimental: {
    optimizePackageImports: [
      "@mui/material",
      "@mui/icons-material",
      "@mui/lab",
      "@mui/x-data-grid",
      "@mui/x-date-pickers",
      "date-fns",
      "lodash",
      "react-icons",
    ],
  },

  // Rewrites configuration
  async rewrites() {
    return [
      {
        source: "/hack/:path*/sponsor",
        destination: "/sponsor",
      },
    ];
  },

  // Redirects: deprecated paths → canonical
  async redirects() {
    return [
      // Redirect non-www frontend subdomain → www (canonical host).
      // frontend.ohack.dev is indexed in GSC but should not be.
      {
        source: "/:path*",
        has: [{ type: "host", value: "frontend.ohack.dev" }],
        destination: "https://www.ohack.dev/:path*",
        permanent: true,
      },

      // judge-keyword doorway pages → canonical landing page.
      // These 3 pages were deleted (June 2026); 301s preserve their link equity.
      {
        source: "/hackathon-judge",
        destination: "/hackathon-judge-opportunities",
        permanent: true,
      },
      {
        source: "/hackathon-judging",
        destination: "/hackathon-judge-opportunities",
        permanent: true,
      },
      {
        source: "/hackathon-judging-opportunities",
        destination: "/hackathon-judge-opportunities",
        permanent: true,
      },
      // Pre-existing legacy variants
      {
        source: "/judge-a-hackathon",
        destination: "/hackathon-judge-opportunities",
        permanent: true,
      },
      {
        source: "/judge-hackathon",
        destination: "/hackathon-judge-opportunities",
        permanent: true,
      },

      // Legacy event slug aliases: season-YYYY → YYYY_season (years ≤ 2025 only).
      // GSC data: /hack/2025_fall has 13k impressions; /hack/fall-2025 is a
      // soft-404 with 118 impressions. 2026+ events use dash IDs natively.
      // Generated as a static list because Next.js path-to-regexp cannot put two
      // named params in a destination without literal text between them.
      ...['fall','spring','summer','winter'].flatMap(season =>
        ['2013','2014','2015','2016','2017','2018','2019','2020','2021','2022','2023','2024','2025'].flatMap(year => [
          { source: `/hack/${season}-${year}`, destination: `/hack/${year}_${season}`, permanent: true },
          { source: `/hack/${season}-${year}/:path*`, destination: `/hack/${year}_${season}/:path*`, permanent: true },
        ])
      ),

      // Short alias: /hack/<event>/mentor → the mentor check-in one-stop-shop.
      // `:event_id` matches a single segment, so this never collides with the
      // team-level /hack/<event>/team/<team_id>/mentor sub-page. Temporary (307):
      // it's an operational, auth-gated page (no SEO value) and the alias may
      // evolve, so we avoid browsers hard-caching a 308.
      {
        source: "/hack/:event_id/mentor",
        destination: "/hack/:event_id/mentor-checkin",
        permanent: false,
      },
    ];
  },

  // Optimize images
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.giphy.com",
        port: "",
        pathname: "/media/**",
      },
      {
        protocol: "https",
        hostname: "i.imgur.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.squarespace-cdn.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "avatars.slack-edge.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "secure.gravatar.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.ohack.dev",
        port: "",
        pathname: "/**",
      },
    ],
  },

  // Improve caching headers
  async headers() {
    return [
      {
        source: "/:all*(svg|jpg|png|webp|avif|gif|ico)",
        locale: false,
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/_next/image/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, must-revalidate",
          },
        ],
      },
    ];
  },
};