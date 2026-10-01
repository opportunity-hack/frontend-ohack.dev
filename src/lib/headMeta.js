/**
 * Ensures `<meta name="description">` is present in an `openGraphData` list
 * for pages that only supply `og:description` (many of the SEO landers pass
 * a top-level `description` prop that `_app.js` otherwise ignores).
 *
 * Deliberately returns an UN-KEYED entry: Next's <Head> dedupe only merges
 * duplicate tags when they're rendered without a React `key` (keyed meta
 * tags bypass name-based dedupe), so an injected keyed tag would duplicate
 * a page's own `<meta name="description">` (e.g. /nonprofits/apply, /cert)
 * instead of the page-local tag winning.
 */
export function ensureDescriptionMeta(openGraphData, description) {
  const list = openGraphData || [];

  if (!description) return list;
  if (list.some((og) => og?.name === "description")) return list;

  return [...list, { name: "description", content: description }];
}
