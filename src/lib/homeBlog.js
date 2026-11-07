// Lean projection of /api/messages/news for the homepage "From the blog"
// band. The homepage is SSG, so whatever lands in props ships in
// __NEXT_DATA__ — never pass markdown bodies through.
import { normalizeImageUrl } from "./imageUtils";

export const HOME_BLOG_LIMIT = 3;

const EXCERPT_MAX = 180;

export function stripMarkdown(text = "") {
  return String(text)
    .replace(/[#>*_`~]/g, "")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function truncateAtWord(text, max = EXCERPT_MAX) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  const base = lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut;
  return `${base.replace(/[\s,;:.\-–—]+$/, "")}…`;
}

export function blogExcerpt(doc) {
  const description =
    typeof doc?.description === "string" ? doc.description.replace(/\s+/g, " ").trim() : "";
  const source =
    description.length > 40
      ? description
      : stripMarkdown(doc?.content_markdown || "") || description;
  return source ? truncateAtWord(source) : "";
}

export function toHomeBlogPost(doc) {
  if (!doc || !doc.id || !doc.title) return null;
  return {
    id: String(doc.id),
    title: String(doc.title),
    excerpt: blogExcerpt(doc),
    image: normalizeImageUrl(doc.featured_image || doc.image) || null,
    date: doc.published_at || doc.slack_ts_human_readable || null,
  };
}

export function pickHomeBlogPosts(payload, limit = HOME_BLOG_LIMIT) {
  if (!Array.isArray(payload?.text)) return [];
  return payload.text.map(toHomeBlogPost).filter(Boolean).slice(0, limit);
}
