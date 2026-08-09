// Canonical host is www — a bare ohack.dev share URL costs a redirect hop
// (and some scrapers don't follow it).
const DEFAULT_SITE_URL = "https://www.ohack.dev";

export function getSiteUrl() {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL;
}

export function buildAbsoluteUrl(pathOrUrl) {
  if (!pathOrUrl) return getSiteUrl();
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const base = getSiteUrl().replace(/\/$/, "");
  const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${base}${path}`;
}

export function buildLinkedInShareUrl(targetUrl) {
  const absolute = buildAbsoluteUrl(targetUrl);
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(absolute)}`;
}

export function openShareWindow(url, name = "share-dialog") {
  if (typeof window === "undefined") return;
  const width = 600;
  const height = 600;
  const left = Math.max(0, (window.innerWidth - width) / 2);
  const top = Math.max(0, (window.innerHeight - height) / 2);
  window.open(
    url,
    name,
    `noopener,noreferrer,width=${width},height=${height},top=${top},left=${left}`
  );
}
