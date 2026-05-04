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
      // judge-keyword variants → canonical
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

      // Hackathon event slug normalisation: YYYY_season → season-YYYY
      // (Google treats hyphens as word separators; underscores are not split.
      //  season-first matches how users search: "fall 2026 hackathon".)
      // Two rules per pattern: bare URL + any sub-paths (:path* is 1+).
      {
        source:
          "/hack/:year(\\d{4})_:season(fall|spring|summer|winter)",
        destination: "/hack/:season-:year",
        permanent: true,
      },
      {
        source:
          "/hack/:year(\\d{4})_:season(fall|spring|summer|winter)/:path*",
        destination: "/hack/:season-:year/:path*",
        permanent: true,
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