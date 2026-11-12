// BlogPosting structured data for /blog/[blog_id]. Returns a plain object —
// render it with serializeJsonLd() (src/lib/jsonLd.js), never by string
// concatenation (the old template only escaped `"`, so a newline or
// backslash in a title produced invalid JSON).
const PUBLISHER = {
  "@type": "Organization",
  name: "Opportunity Hack",
  logo: {
    "@type": "ImageObject",
    url: "https://cdn.ohack.dev/ohack.dev/2024_hackathon_2.webp",
  },
};

function publishedDate(post) {
  if (post?.published_at) return post.published_at;
  if (post?.slack_ts) {
    const ms = parseFloat(post.slack_ts) * 1000;
    if (Number.isFinite(ms)) return new Date(ms).toISOString();
  }
  // Unknown: omit rather than claim "published now" on every rebuild.
  return undefined;
}

export function buildBlogPostingJsonLd(
  post,
  { canonicalUrl, ogImage, ogDescription, title } = {},
) {
  const datePublished = publishedDate(post);
  const dateModified = post?.last_updated || datePublished;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: String(title ?? "").replace("News: ", ""),
    image: ogImage || "",
    ...(datePublished ? { datePublished } : {}),
    ...(dateModified ? { dateModified } : {}),
    description: ogDescription || "",
    url: canonicalUrl,
    ...(post?.author?.name
      ? { author: { "@type": "Person", name: String(post.author.name) } }
      : {}),
    publisher: PUBLISHER,
    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
  };
}

const BLOG_URL = "https://www.ohack.dev/blog";

const absoluteImage = (post) => {
  const url = post?.featured_image || post?.image;
  return typeof url === "string" && /^https?:\/\//.test(url) ? url : undefined;
};

/**
 * The /blog index's ONE JSON-LD node: the `Blog` plus a lean `blogPost[]`
 * (headline, www URL, datePublished when known, image when absolute). No
 * fake fallback images, no non-www hosts.
 */
export function buildBlogIndexJsonLd(posts = []) {
  const blogPost = (Array.isArray(posts) ? posts : [])
    .filter((post) => post && post.id && post.title)
    .map((post) => {
      const datePublished = publishedDate(post);
      const image = absoluteImage(post);
      return {
        "@type": "BlogPosting",
        headline: String(post.title),
        url: `${BLOG_URL}/${encodeURIComponent(String(post.id))}`,
        ...(datePublished ? { datePublished } : {}),
        ...(image ? { image } : {}),
      };
    });
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Opportunity Hack Blog",
    description:
      "Technology insights, success stories, and updates from Opportunity Hack's mission to create tech solutions for nonprofits.",
    url: BLOG_URL,
    mainEntityOfPage: { "@type": "WebPage", "@id": BLOG_URL },
    publisher: PUBLISHER,
    ...(blogPost.length ? { blogPost } : {}),
  };
}
