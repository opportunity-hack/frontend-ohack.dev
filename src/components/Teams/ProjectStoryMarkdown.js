import dynamic from "next/dynamic";

// react-markdown's own transform is already whitelisted in jest.config.js's
// transformIgnorePatterns (shared with SingleNews.js's usage), so this loads
// fine under both Next and Jest. `ssr: true` — project stories are public,
// SEO-relevant content and must render server-side (no "Loading…" shell for
// crawlers), unlike client-only dashboard editors.
const ReactMarkdown = dynamic(() => import("react-markdown"), { ssr: true });

const HEADING_TAGS = ["h1", "h2", "h3", "h4", "h5", "h6"];

/**
 * The heading tag to render for a markdown heading of `originalTag`, shifted
 * down `demoteBy` levels and clamped at h6. A team's story is authored with
 * `##` "section prompts" (see `manageteam`'s "Insert section prompts") that
 * assume they're the top level of the story — demoting keeps exactly one
 * `<h1>` per page (the page's own title) when the story is embedded in it.
 */
export function demoteHeadingTag(originalTag, demoteBy = 1) {
  const shift = Math.max(0, Number(demoteBy) || 0);
  const index = HEADING_TAGS.indexOf(originalTag);
  if (index === -1) return originalTag;
  return HEADING_TAGS[Math.min(HEADING_TAGS.length - 1, index + shift)];
}

/** react-markdown v9 `components` map: demoted headings, lazy images, and
 * links that open in a new tab without leaking a `window.opener` reference. */
export function buildMarkdownComponents(demoteBy = 1) {
  const components = {};
  HEADING_TAGS.forEach((tag) => {
    const Target = demoteHeadingTag(tag, demoteBy);
    components[tag] = ({ node: _node, ...props }) => <Target {...props} />;
  });
  components.img = ({ node: _node, style, ...props }) => (
    <img {...props} loading="lazy" decoding="async" style={{ maxWidth: "100%", ...style }} />
  );
  components.a = ({ node: _node, ...props }) => (
    <a {...props} target="_blank" rel="noopener noreferrer" />
  );
  return components;
}

/**
 * Renders a team's project story markdown for public display. Intentionally
 * does NOT use `rehype-raw` — raw HTML in the stored markdown renders as
 * inert literal text rather than being interpreted, which is the frontend
 * half of the backend's defence-in-depth sanitization (see
 * `submissions_service.py::sanitize_markdown`).
 */
export default function ProjectStoryMarkdown({ markdown, demoteBy = 1, style }) {
  if (!markdown) return null;
  return (
    <div style={style}>
      <ReactMarkdown components={buildMarkdownComponents(demoteBy)}>{markdown}</ReactMarkdown>
    </div>
  );
}
