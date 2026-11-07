// Shared display helpers for blog posts. Used by the article page
// (SingleNews) and the homepage "From the blog" band (FromTheBlog).

// next/image only for our CDN (the only allowed remotePatterns host besides
// giphy/imgur); everything else is a plain <img> with explicit dimensions.
export const isCdnImage = (url) => {
  try {
    return new URL(url).hostname === "cdn.ohack.dev";
  } catch {
    return false;
  }
};

// ISO timestamps (published_at) and the legacy "YYYY-MM-DD HH:MM:SS"
// slack_ts_human_readable strings → "January 5, 2026"; anything else passes
// through untouched. Zone-less values are read as UTC so the SSR and client
// renders agree (and the calendar day never shifts).
export const formatPublished = (value) => {
  if (!value || typeof value !== "string") return "";
  if (!/^\d{4}-\d{2}-\d{2}([T ]\d{2}:\d{2}|$)/.test(value.trim())) return value;
  const iso = value.trim().replace(" ", "T");
  const d = new Date(
    /(Z|[+-]\d{2}:?\d{2})$/.test(iso) || !iso.includes("T") ? iso : iso + "Z",
  );
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
};
