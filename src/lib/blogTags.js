// Tag helpers for the /blog index (components/Blog/BlogPage.js + PostList.js).
// Pure functions — no React, no network — so the tag cloud and the ?tag=
// filter can be unit-tested without a backend.

/** How many tags the cloud shows before "Show all N". */
export const TAG_PREVIEW_COUNT = 8;

const HASHTAG_RE = /#(\w+)/g;
const SLACK_CHANNEL_ID_RE = /^C[0-9A-Z]{8,}$/;
const CHANNEL_NAME_RE = /^[a-z0-9_-]+$/;

/**
 * Every tag a post carries, in priority order — the same three sources the
 * article page's `extractTags` reads: `tags[]` (the admin CMS field) wins,
 * then `#hashtags` in the description, then Slack-channel `links[]`
 * (`url` starting with `#`). De-duplicated, original casing kept.
 */
export function extractPostTags(post) {
  if (!post) return [];
  const seen = new Set();
  const out = [];
  const add = (raw) => {
    const tag = String(raw ?? "").trim();
    if (!tag) return;
    const key = tag.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    out.push(tag);
  };
  if (Array.isArray(post.tags)) post.tags.forEach(add);
  if (typeof post.description === "string") {
    for (const match of post.description.matchAll(HASHTAG_RE)) add(match[1]);
  }
  if (Array.isArray(post.links)) {
    post.links.forEach((link) => {
      if (
        link &&
        typeof link.url === "string" &&
        link.url.startsWith("#") &&
        typeof link.name === "string" &&
        CHANNEL_NAME_RE.test(link.name)
      ) {
        add(link.name);
      }
    });
  }
  return out;
}

/**
 * Machine noise that should never be a browsable chip: Slack channel ids
 * (`C01CMCF4BUN`), all-digit tags (`55`) and anything under 3 characters.
 * Junk still matches a `?tag=` deep link — it's only hidden from the cloud.
 */
export function isJunkTag(tag) {
  const t = String(tag ?? "").trim();
  if (t.length < 3) return true;
  if (/^\d+$/.test(t)) return true;
  if (SLACK_CHANNEL_ID_RE.test(t)) return true;
  return false;
}

/**
 * `[{ tag, count }]` across posts — count desc, then name asc — with junk
 * removed. Counting is case-insensitive; the first-seen casing is shown.
 */
export function collectTags(posts) {
  const counts = new Map();
  (Array.isArray(posts) ? posts : []).forEach((post) => {
    extractPostTags(post).forEach((tag) => {
      if (isJunkTag(tag)) return;
      const key = tag.toLowerCase();
      const entry = counts.get(key) || { tag, count: 0 };
      entry.count += 1;
      counts.set(key, entry);
    });
  });
  return Array.from(counts.values()).sort(
    (a, b) => b.count - a.count || a.tag.localeCompare(b.tag),
  );
}

/** Case-insensitive: does this post carry the tag (any of the three sources)? */
export function postMatchesTag(post, tag) {
  if (!tag) return true;
  if (!post) return false;
  const lower = String(tag).toLowerCase();
  if (
    Array.isArray(post.tags) &&
    post.tags.some((t) => String(t).toLowerCase() === lower)
  ) {
    return true;
  }
  if (
    typeof post.description === "string" &&
    post.description.toLowerCase().includes(`#${lower}`)
  ) {
    return true;
  }
  if (
    Array.isArray(post.links) &&
    post.links.some(
      (link) =>
        link?.url?.startsWith("#") && link?.name?.toLowerCase() === lower,
    )
  ) {
    return true;
  }
  return false;
}
