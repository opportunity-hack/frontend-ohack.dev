// Homepage "From the blog" band: one featured post card + two compact rows.
// Rendered ONLY inside the homepage's RefinedRoot, so .ohx-* classes and the
// refined CSS vars are in scope. Data is SSG (getStaticProps → lean posts from
// src/lib/homeBlog.js), so returning null on [] causes no layout shift.
// Every piece is module-scope (SectionBlock remount lesson).
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Eyebrow, Arrow } from "../design/refined";
import { isCdnImage, formatPublished } from "../../lib/blogDisplay";

const GRID_CLASS = "ohx-home-blog-grid";

const clamp = (lines) => ({
  display: "-webkit-box",
  WebkitLineClamp: lines,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
});

function ImagePlaceholder({ title }) {
  const initial = (title || "O").trim().charAt(0).toUpperCase() || "O";
  return (
    <span
      aria-hidden="true"
      className="ohx-display"
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 64,
        color: "var(--brand)",
        opacity: 0.35,
      }}
    >
      {initial}
    </span>
  );
}

export function PostImage({ url, title }) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(url) && !failed;
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "16 / 9",
        background: "var(--surface-2)",
        overflow: "hidden",
      }}
    >
      {!showImage ? (
        <ImagePlaceholder title={title} />
      ) : isCdnImage(url) ? (
        <Image
          src={url}
          alt=""
          fill
          sizes="(max-width: 760px) 100vw, 560px"
          style={{ objectFit: "cover" }}
          onError={() => setFailed(true)}
        />
      ) : (
        <img
          src={url}
          alt=""
          width={560}
          height={315}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
      )}
    </div>
  );
}

function FeaturedPost({ post, onTrack }) {
  const date = formatPublished(post.date);
  return (
    <Link
      href={`/blog/${post.id}`}
      className="ohx-card ohx-card--hover rise"
      style={{
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        textDecoration: "none",
        color: "inherit",
      }}
      onClick={() => onTrack?.("home_blog_post", post.title, { post_id: post.id, position: 1 })}
    >
      <PostImage url={post.image} title={post.title} />
      <div style={{ padding: "20px 24px 24px", display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
        {date && (
          <p className="ohx-faint" style={{ margin: 0, fontSize: 13 }}>
            {date}
          </p>
        )}
        <h3 className="ohx-display" style={{ fontSize: "1.35rem", margin: 0 }}>
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="ohx-muted" style={{ margin: 0, fontSize: 15, lineHeight: 1.55, ...clamp(3) }}>
            {post.excerpt}
          </p>
        )}
        <span className="ohx-link" style={{ marginTop: "auto", paddingTop: 6, fontSize: 15 }}>
          Read the post <Arrow />
        </span>
      </div>
    </Link>
  );
}

function CompactRow({ post, position, onTrack }) {
  const date = formatPublished(post.date);
  return (
    <li style={{ borderTop: "1px solid var(--line)", padding: "16px 0" }}>
      <h3 className="ohx-display" style={{ fontSize: 16, margin: 0, lineHeight: 1.35 }}>
        <Link
          href={`/blog/${post.id}`}
          className="ohx-home-blog-row-link"
          onClick={() => onTrack?.("home_blog_post", post.title, { post_id: post.id, position })}
        >
          {post.title}
        </Link>
      </h3>
      {date && (
        <p className="ohx-faint" style={{ margin: "4px 0 0", fontSize: 13 }}>
          {date}
        </p>
      )}
      {post.excerpt && (
        <p className="ohx-muted" style={{ margin: "6px 0 0", fontSize: 14.5, lineHeight: 1.55, ...clamp(2) }}>
          {post.excerpt}
        </p>
      )}
    </li>
  );
}

const GRID_CSS = `
.${GRID_CLASS} { display: grid; gap: 28px; grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr); align-items: start; }
@media (max-width: 760px) { .${GRID_CLASS} { grid-template-columns: minmax(0, 1fr); } }
.ohx-home-blog-row-link { color: var(--ink); text-decoration: none; }
.ohx-home-blog-row-link:hover, .ohx-home-blog-row-link:focus-visible { color: var(--brand); text-decoration: underline; text-underline-offset: 3px; }
`;

export default function FromTheBlog({ posts, onTrack }) {
  if (!Array.isArray(posts) || posts.length === 0) return null;
  const [featured, ...rest] = posts;

  return (
    <section
      className="ohx-wrap"
      aria-labelledby="home-blog-heading"
      style={{ paddingTop: "clamp(56px, 9vh, 96px)", paddingBottom: "clamp(40px, 6vh, 72px)" }}
    >
      <style>{GRID_CSS}</style>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <Eyebrow>From the blog</Eyebrow>
          <h2 id="home-blog-heading" className="ohx-display" style={{ marginTop: 8 }}>
            What we&apos;re writing about
          </h2>
        </div>
        <Link
          href="/blog"
          className="ohx-link"
          style={{ paddingBottom: 6 }}
          onClick={() => onTrack?.("home_blog_all_posts", "All posts")}
        >
          All posts <Arrow />
        </Link>
      </div>
      <p className="ohx-muted" style={{ marginTop: 10, marginBottom: 28 }}>
        Project launches, event recaps, and ways to pitch in.
      </p>

      <div className={GRID_CLASS}>
        <FeaturedPost post={featured} onTrack={onTrack} />
        {rest.length > 0 && (
          <div>
            <Eyebrow>Older posts</Eyebrow>
            <ul style={{ listStyle: "none", margin: "10px 0 0", padding: 0 }}>
              {rest.map((post, i) => (
                <CompactRow key={post.id} post={post} position={i + 2} onTrack={onTrack} />
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
