// Sidebar manifest for the per-post blog editor.
// Add a new section: append here, then implement `./sections/<Slug>Section.js`.

import {
  Article as ContentIcon,
  Search as SeoIcon,
  Tag as MetadataIcon,
} from "@mui/icons-material";

export const SECTIONS = [
  { slug: "content", label: "Content", icon: ContentIcon, hint: "Title, body, featured image" },
  { slug: "seo", label: "SEO", icon: SeoIcon, hint: "Title tag, meta description, canonical, OG" },
  { slug: "metadata", label: "Metadata", icon: MetadataIcon, hint: "Author, tags, status, publish date" },
];

export const DEFAULT_SECTION = "content";

export const isValidSection = (slug) => SECTIONS.some((s) => s.slug === slug);
