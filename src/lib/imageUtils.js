/**
 * Normalize an image URL by fixing double slashes in the path.
 * This handles URLs stored with double slashes (e.g. https://cdn.ohack.dev//nonprofits/...)
 * which break Next.js image optimization in NextJS 16.
 */
export function normalizeImageUrl(url) {
  if (!url || typeof url !== "string") return url;
  // Fix double slashes in path but preserve the protocol://
  return url.replace(/([^:])\/\//g, "$1/");
}
