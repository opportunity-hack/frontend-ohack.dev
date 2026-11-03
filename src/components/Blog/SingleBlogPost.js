// /blog/[blog_id] shell: owns the fetch/related-posts logic, the RefinedPage
// chrome, the tag strip and the related posts. The article itself (masthead,
// hero image, body, links) is SingleNews. Every subcomponent is module-scope.
import React, { useEffect, useState } from "react";
import Link from "next/link";
import SingleNews from "../News/SingleNews";
import * as ga from "../../lib/ga";
import { RefinedPage, BackLink, CtaBand } from "../design/RefinedPage";

// Extract tags from blog post content (hashtags + Slack channel links).
const extractTags = (post) => {
  if (!post?.description) return [];

  // Extract hashtags from description
  const hashtagRegex = /#(\w+)/g;
  const matches = post.description.match(hashtagRegex) || [];
  const hashtags = matches.map((tag) => tag.substring(1));

  // Add Slack channels as tags
  const channelTags =
    post.links
      ?.filter((link) => link?.url?.startsWith("#"))
      .map((link) => link.name) || [];

  // Combine unique tags
  return [...new Set([...hashtags, ...channelTags])];
};

const skeletonBlock = (height, width = "100%", extra = {}) => (
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

// Reserves roughly the article's above-the-fold footprint (CLS).
const BlogPostSkeleton = () => (
  <div
    role="progressbar"
    aria-busy="true"
    aria-label="Loading blog post"
    style={{
      marginTop: 18,
      display: "flex",
      flexDirection: "column",
      gap: 14,
    }}
  >
    {skeletonBlock(12, "28%")}
    {skeletonBlock(44, "92%")}
    {skeletonBlock(44, "70%")}
    {skeletonBlock(0, "100%", {
      aspectRatio: "16 / 9",
      height: "auto",
      marginTop: 18,
    })}
    {skeletonBlock(16, "100%", { marginTop: 18 })}
    {skeletonBlock(16, "96%")}
    {skeletonBlock(16, "88%")}
    {skeletonBlock(16, "60%")}
  </div>
);

const TagStrip = ({ tags, onTagClick }) => (
  <section style={{ marginTop: 32 }} aria-label="Tags">
    <p className="ohx-eyebrow">Tags</p>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
      {tags.map((tag) => (
        <Link
          key={tag}
          href={`/blog?tag=${encodeURIComponent(tag)}`}
          className="ohx-tag"
          style={{ textDecoration: "none" }}
          onClick={() => onTagClick(tag)}
        >
          #{tag}
        </Link>
      ))}
    </div>
  </section>
);

const RelatedPosts = ({ posts, onPostClick }) => (
  <section
    className="ohx-card"
    style={{ marginTop: 40, padding: "22px 24px" }}
    aria-labelledby="related-posts-heading"
  >
    <p className="ohx-eyebrow">Keep reading</p>
    <h2
      id="related-posts-heading"
      className="ohx-display"
      style={{ fontSize: 22, marginTop: 8 }}
    >
      Related posts
    </h2>
    <ul style={{ listStyle: "none", margin: "6px 0 0", padding: 0 }}>
      {posts.map((post) => (
        <li
          key={post.id}
          style={{ borderTop: "1px solid var(--line)", padding: "14px 0" }}
        >
          <Link
            href={`/blog/${post.id}`}
            className="ohx-link"
            style={{ fontSize: 16 }}
            onClick={() => onPostClick(post.id, post.title)}
          >
            {post.title}
          </Link>
          {post.slack_ts_human_readable && (
            <p
              className="ohx-faint"
              style={{ margin: "4px 0 0", fontSize: 13 }}
            >
              {post.slack_ts_human_readable}
            </p>
          )}
          {post.description && (
            <p
              className="ohx-muted"
              style={{
                margin: "6px 0 0",
                fontSize: 14.5,
                lineHeight: 1.55,
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {post.description}
            </p>
          )}
        </li>
      ))}
    </ul>
    <Link
      href="/blog"
      className="ohx-link"
      style={{ marginTop: 14, fontSize: 14.5 }}
      onClick={() => {
        ga.trackStructuredEvent(
          ga.EventCategory.NAVIGATION,
          ga.EventAction.CLICK,
          "view_all_blog_posts",
        );
      }}
    >
      View all posts{" "}
      <span className="ohx-arrow" aria-hidden="true">
        →
      </span>
    </Link>
  </section>
);

const NotFound = () => (
  <div
    className="ohx-card"
    style={{ marginTop: 32, padding: "40px 28px", textAlign: "center" }}
  >
    <h2 className="ohx-display" style={{ fontSize: 24 }}>
      Blog post not found
    </h2>
    <p className="ohx-muted" style={{ margin: "10px 0 20px" }}>
      It may have been unpublished or the link is out of date.
    </p>
    <Link href="/blog" className="ohx-btn ohx-btn--primary">
      Return to the blog
    </Link>
  </div>
);

const SingleBlogPage = ({ blog_id, initialData }) => {
  const [newsData, setNewsData] = useState(initialData);
  const [loading, setLoading] = useState(!initialData);
  const [relatedPosts, setRelatedPosts] = useState([]);

  useEffect(() => {
    // If no initial data, fetch the blog post
    if (!initialData && blog_id) {
      setLoading(true);
      fetch(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/news/${blog_id}`,
      )
        .then((response) => response.json())
        .then((data) => {
          if (data && data.text) {
            setNewsData(data.text);

            // Track successful content load
            ga.trackContentEngagement("blog_post", blog_id, "load_success", {
              title: data.text.title,
            });
          }
        })
        .catch((error) => {
          console.error(error);
          // Track error loading content
          ga.trackError(
            "content_load_error",
            error.message,
            `blog_post_${blog_id}`,
          );
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [blog_id, initialData]);

  // Fetch related posts once we have the main post data
  useEffect(() => {
    if (newsData) {
      const tags = extractTags(newsData);

      if (tags.length > 0) {
        // Track which tags were found
        ga.trackStructuredEvent(
          ga.EventCategory.CONTENT,
          "content_tags",
          "blog_post",
          tags.length,
          { tags: tags.join(",") },
        );

        fetch(
          `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/news?limit=6`,
        )
          .then((response) => response.json())
          .then((data) => {
            if (data && Array.isArray(data.text)) {
              // Filter for related posts by matching tags
              const related = data.text
                .filter((post) => post.id !== blog_id) // Exclude current post
                .filter((post) => {
                  const postTags = extractTags(post);
                  // Check if any tags match
                  return tags.some((tag) => postTags.includes(tag));
                })
                .slice(0, 3); // Take top 3 related posts

              setRelatedPosts(related);

              if (related.length > 0) {
                // Track related posts found
                ga.trackStructuredEvent(
                  ga.EventCategory.CONTENT,
                  "related_content",
                  "blog_post",
                  related.length,
                );
              }
            }
          })
          .catch((error) => console.error(error));
      }
    }
  }, [newsData, blog_id]);

  // Handle tag click for related content navigation
  const handleTagClick = (tag) => {
    ga.trackStructuredEvent(
      ga.EventCategory.NAVIGATION,
      ga.EventAction.CLICK,
      "content_tag",
      null,
      { tag: tag },
    );
  };

  // Handle click on related post
  const handleRelatedPostClick = (postId, postTitle) => {
    ga.trackStructuredEvent(
      ga.EventCategory.NAVIGATION,
      ga.EventAction.CLICK,
      "related_post",
      null,
      {
        source_post_id: blog_id,
        target_post_id: postId,
        target_post_title: postTitle,
      },
    );
  };

  // Explicit tags[] win; the hashtag/channel extraction is the legacy fallback.
  const displayTags =
    Array.isArray(newsData?.tags) && newsData.tags.length > 0
      ? newsData.tags.map(String)
      : extractTags(newsData);

  return (
    <RefinedPage as="article" narrow>
      <nav aria-label="Breadcrumb">
        <BackLink href="/blog">All posts</BackLink>
      </nav>

      {loading ? (
        <BlogPostSkeleton />
      ) : newsData ? (
        <>
          <SingleNews newsItem={newsData} />

          {displayTags.length > 0 && (
            <TagStrip tags={displayTags} onTagClick={handleTagClick} />
          )}

          {relatedPosts.length > 0 && (
            <RelatedPosts
              posts={relatedPosts}
              onPostClick={handleRelatedPostClick}
            />
          )}

          <CtaBand
            eyebrow="Get involved"
            title="Build with the community behind these stories."
            body="Pick a nonprofit project, join the Slack, or sign up for the next hackathon."
            primary={{ href: "/hack", label: "Find a hackathon" }}
            secondary={{ href: "/signup", label: "Join Slack" }}
          />
        </>
      ) : (
        <NotFound />
      )}
    </RefinedPage>
  );
};

export default SingleBlogPage;
