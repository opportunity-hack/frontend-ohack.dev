// The /blog post list: the first CARD_COUNT results as cards, the rest as
// compact rows, so every post link is in the server HTML without a 36k-px
// page on a phone. Rendered ONLY inside BlogPage's RefinedRoot (`.ohx-*`
// classes + CSS vars are in scope). No MUI. Every piece is module-scope
// (SectionBlock remount lesson).
import React from "react";
import Link from "next/link";
import { Eyebrow, Arrow } from "../design/refined";
import { PostImage } from "../Home/FromTheBlog";
import { formatPublished } from "../../lib/blogDisplay";
import { blogExcerpt } from "../../lib/homeBlog";
import { normalizeImageUrl } from "../../lib/imageUtils";
import { extractPostTags, isJunkTag } from "../../lib/blogTags";

export const CARD_COUNT = 8;
const CARD_TAG_COUNT = 3;
const LIST_CLASS = "ohx-blog-list";

// One scoped stylesheet (pattern: FromTheBlog.GRID_CSS). The thumb column is
// a fixed track and the text column is minmax(0, 1fr) so long titles/URLs
// can never widen a card past its container — the bug the old MUI
// `Grid container direction="column"` list had.
const LIST_CSS = `
.${LIST_CLASS} { display: flex; flex-direction: column; gap: 16px; }
.${LIST_CLASS} .ohx-blog-card { display: grid; grid-template-columns: 112px minmax(0, 1fr); gap: 18px; padding: 18px 20px; min-width: 0; }
.${LIST_CLASS} .ohx-blog-card-thumb { width: 112px; }
.${LIST_CLASS} .ohx-blog-card-body { min-width: 0; display: flex; flex-direction: column; gap: 6px; }
.${LIST_CLASS} .ohx-blog-title-link { color: var(--ink); text-decoration: none; overflow-wrap: anywhere; }
.${LIST_CLASS} .ohx-blog-title-link:hover, .${LIST_CLASS} .ohx-blog-title-link:focus-visible { color: var(--brand); text-decoration: underline; text-underline-offset: 3px; }
.${LIST_CLASS} .ohx-blog-card-foot { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 10px; margin-top: 6px; }
.${LIST_CLASS} .ohx-blog-tag-btn { cursor: pointer; font-family: inherit; min-height: 32px; padding: 6px 12px; font-size: 12.5px; }
.${LIST_CLASS} .ohx-blog-rows { list-style: none; margin: 10px 0 0; padding: 0; }
.${LIST_CLASS} .ohx-blog-row { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; border-top: 1px solid var(--line); padding: 14px 0; min-width: 0; }
.${LIST_CLASS} .ohx-blog-row h3 { min-width: 0; }
.${LIST_CLASS} .ohx-blog-row-date { flex-shrink: 0; }
@media (max-width: 600px) {
  .${LIST_CLASS} .ohx-blog-card { grid-template-columns: 72px minmax(0, 1fr); gap: 14px; padding: 16px; }
  .${LIST_CLASS} .ohx-blog-card-thumb { width: 72px; }
  .${LIST_CLASS} .ohx-blog-row { flex-direction: column; gap: 4px; }
}
`;

const clamp = (lines) => ({
  display: "-webkit-box",
  WebkitLineClamp: lines,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
});

const postDate = (post) =>
  formatPublished(post.published_at || post.slack_ts_human_readable || "");

const cardTags = (post) =>
  extractPostTags(post)
    .filter((tag) => !isJunkTag(tag))
    .slice(0, CARD_TAG_COUNT);

function PostCard({ post, position, selectedTag, onTagClick, onPostClick }) {
  const href = `/blog/${post.id}`;
  const date = postDate(post);
  const excerpt = blogExcerpt(post);
  const image = normalizeImageUrl(post.featured_image || post.image) || null;
  const tags = cardTags(post);
  const track = () => onPostClick?.(post, position);
  return (
    <article className="ohx-card ohx-blog-card">
      <div className="ohx-blog-card-thumb">
        <PostImage
          url={image}
          title={post.title}
          ratio="1 / 1"
          sizes="112px"
          imgWidth={224}
          imgHeight={224}
          placeholderSize={36}
        />
      </div>
      <div className="ohx-blog-card-body">
        {date && (
          <p className="ohx-faint" style={{ margin: 0, fontSize: 13 }}>
            {date}
          </p>
        )}
        <h3
          className="ohx-display"
          style={{
            fontSize: "clamp(1.1rem, 2vw, 1.3rem)",
            margin: 0,
            lineHeight: 1.25,
          }}
        >
          <Link href={href} className="ohx-blog-title-link" onClick={track}>
            {post.title}
          </Link>
        </h3>
        {excerpt && (
          <p
            className="ohx-muted"
            style={{ margin: 0, fontSize: 15, lineHeight: 1.55, ...clamp(3) }}
          >
            {excerpt}
          </p>
        )}
        <div className="ohx-blog-card-foot">
          {tags.map((tag) => {
            const active =
              selectedTag &&
              String(selectedTag).toLowerCase() === tag.toLowerCase();
            return (
              <button
                key={tag}
                type="button"
                className="ohx-tag ohx-blog-tag-btn"
                aria-pressed={Boolean(active)}
                onClick={() => onTagClick?.(tag)}
                style={
                  active
                    ? {
                        background: "var(--brand)",
                        color: "#fff",
                        borderColor: "var(--brand)",
                      }
                    : undefined
                }
              >
                #{tag}
              </button>
            );
          })}
          <Link
            href={href}
            className="ohx-link"
            style={{ marginLeft: "auto", fontSize: 14.5 }}
            onClick={track}
          >
            Read the post <Arrow />
          </Link>
        </div>
      </div>
    </article>
  );
}

function PostRow({ post, position, onPostClick }) {
  const date = postDate(post);
  return (
    <li className="ohx-blog-row">
      <h3
        className="ohx-display"
        style={{ fontSize: 16, margin: 0, lineHeight: 1.35 }}
      >
        <Link
          href={`/blog/${post.id}`}
          className="ohx-blog-title-link"
          onClick={() => onPostClick?.(post, position)}
        >
          {post.title}
        </Link>
      </h3>
      {date && (
        <span className="ohx-faint ohx-blog-row-date" style={{ fontSize: 13 }}>
          {date}
        </span>
      )}
    </li>
  );
}

const block = (height, width = "100%", extra = {}) => (
  <div
    aria-hidden="true"
    style={{
      height,
      width,
      borderRadius: 6,
      background: "var(--surface-2)",
      ...extra,
    }}
  />
);

// Three card-sized skeletons (~132px each) so the list reserves its space.
function ListSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading posts"
      className={LIST_CLASS}
    >
      {[0, 1, 2].map((i) => (
        <div key={i} className="ohx-card ohx-blog-card">
          <div className="ohx-blog-card-thumb">
            {block(0, "100%", { aspectRatio: "1 / 1", height: "auto" })}
          </div>
          <div className="ohx-blog-card-body">
            {block(12, "28%")}
            {block(22, "80%")}
            {block(14, "100%")}
            {block(14, "90%")}
          </div>
        </div>
      ))}
    </div>
  );
}

const usable = (posts) =>
  (Array.isArray(posts) ? posts : []).filter(
    (post) => post && post.id && post.title,
  );

/**
 * `posts` is the CURRENT result set (already searched/filtered by the page).
 * The first CARD_COUNT render as cards, the rest as rows under "Earlier posts".
 */
export default function PostList({
  posts,
  loading,
  selectedTag,
  onTagClick,
  onPostClick,
}) {
  if (loading) return <ListSkeleton />;
  const list = usable(posts);
  if (list.length === 0) return null;
  const cards = list.slice(0, CARD_COUNT);
  const rows = list.slice(CARD_COUNT);
  return (
    <div className={LIST_CLASS}>
      <style>{LIST_CSS}</style>
      {cards.map((post, i) => (
        <PostCard
          key={post.id}
          post={post}
          position={i + 1}
          selectedTag={selectedTag}
          onTagClick={onTagClick}
          onPostClick={onPostClick}
        />
      ))}
      {rows.length > 0 && (
        <section
          aria-labelledby="blog-earlier-heading"
          style={{ marginTop: 24 }}
        >
          <Eyebrow>
            <span id="blog-earlier-heading">Earlier posts</span>
          </Eyebrow>
          <ul className="ohx-blog-rows">
            {rows.map((post, i) => (
              <PostRow
                key={post.id}
                post={post}
                position={CARD_COUNT + i + 1}
                onPostClick={onPostClick}
              />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
