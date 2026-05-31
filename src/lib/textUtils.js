/**
 * Strip Markdown syntax down to clean, readable plain text.
 *
 * Used for teaser/preview snippets (e.g. event cards) where the text lives
 * inside a clamped, single-anchor card and rendering real Markdown would
 * either break the line-clamp or nest <a> tags inside an <a> (invalid HTML).
 * For full-fidelity Markdown rendering use react-markdown instead.
 */
export function stripMarkdown(input) {
  if (!input || typeof input !== "string") return "";

  return (
    input
      // Fenced code blocks -> keep inner text
      .replace(/```[\w-]*\n?([\s\S]*?)```/g, "$1")
      // Images ![alt](url) -> alt
      .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
      // Links [text](url) -> text
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
      // Reference-style links [text][ref] -> text
      .replace(/\[([^\]]*)\]\[[^\]]*\]/g, "$1")
      // Inline code `code` -> code
      .replace(/`([^`]+)`/g, "$1")
      // Bold / italic / strikethrough markers
      .replace(/(\*\*\*|___)(.*?)\1/g, "$2")
      .replace(/(\*\*|__)(.*?)\1/g, "$2")
      .replace(/(\*|_)(.*?)\1/g, "$2")
      .replace(/~~(.*?)~~/g, "$1")
      // Headings (#, ##, ...)
      .replace(/^\s{0,3}#{1,6}\s+/gm, "")
      // Blockquote markers
      .replace(/^\s{0,3}>\s?/gm, "")
      // Unordered list bullets
      .replace(/^\s*[-*+]\s+/gm, "")
      // Ordered list markers
      .replace(/^\s*\d+\.\s+/gm, "")
      // Horizontal rules
      .replace(/^\s*([-*_])\s*(?:\1\s*){2,}$/gm, "")
      // Collapse whitespace/newlines into single spaces
      .replace(/\s+/g, " ")
      .trim()
  );
}
