// /blog index. Single reading column (no sidebar), cards → rows via
// PostList, tag cloud + search, CtaBand at the end. State + GA + ?tag=
// URL sync are the pre-rewrite logic; only the body changed (Nov 2026 —
// docs/plans/blog-index-ux-2026-11.md).
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import debounce from "lodash/debounce";
import * as ga from "../../lib/ga";
import { RefinedRoot, Eyebrow, Arrow } from "../design/refined";
import { CtaBand } from "../design/RefinedPage";
import PostList from "./PostList";
import {
  collectTags,
  postMatchesTag,
  TAG_PREVIEW_COUNT,
} from "../../lib/blogTags";

const SEARCH_GA_DEBOUNCE_MS = 500;
const MOBILE_TAG_PREVIEW_COUNT = 4;

// Same markup on every viewport (hydration-safe); phones just hide chips
// past the 4th until "Show all" — with long slugs 8 chips wrapped to ~8 lines
// and pushed the first post below the fold.
const TAGS_CSS = `
@media (max-width: 600px) {
  .ohx-blog-tags--preview .ohx-blog-chip:nth-of-type(n + ${MOBILE_TAG_PREVIEW_COUNT + 1}) { display: none; }
}
`;

// `.ohx-tag` is a 9.5px display pill; interactive chips need a touch target.
const chipStyle = (active) => ({
  cursor: "pointer",
  fontFamily: "inherit",
  padding: "6px 12px",
  fontSize: 12.5,
  minHeight: 32,
  background: active ? "var(--brand)" : "var(--surface)",
  color: active ? "#fff" : "var(--muted)",
  borderColor: active ? "var(--brand)" : "var(--line)",
});

const textButtonStyle = {
  background: "none",
  border: 0,
  cursor: "pointer",
  font: "inherit",
  fontSize: "0.9rem",
  padding: 0,
};

const BlogPage = ({ posts }) => {
  const router = useRouter();
  // Seeded from the SSG prop so the very first (server) render carries data.
  const [newsData, setNewsData] = useState(posts || []);
  const [filteredData, setFilteredData] = useState(posts || []);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [loading, setLoading] = useState(!(posts && posts.length));
  const [showAllTags, setShowAllTags] = useState(false);

  useEffect(() => {
    ga.initFacebookPixel();
  }, []);

  useEffect(() => {
    if (posts && posts.length > 0) {
      setNewsData(posts);
      setFilteredData(posts);
      setLoading(false);
    } else {
      setLoading(true);
      fetch(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/news?limit=50`,
      )
        .then((r) => r.json())
        .then((data) => {
          const postsData = data.text || [];
          setNewsData(postsData);
          setFilteredData(postsData);
          setLoading(false);
        })
        .catch((e) => {
          console.error(e);
          setLoading(false);
        });
    }
  }, [posts]);

  useEffect(() => {
    if (!router.isReady) return;
    const urlTag = Array.isArray(router.query.tag)
      ? router.query.tag[0]
      : router.query.tag;
    setSelectedTag(urlTag || "");
  }, [router.isReady, router.query.tag]);

  // Filtering is instant; the GA `search` event fires once, 500ms after the
  // last keystroke (it used to fire on every character).
  const trackSearch = useMemo(
    () =>
      debounce((term) => {
        ga.trackStructuredEvent(
          ga.EventCategory.CONTENT,
          "search",
          "blog_content",
          null,
          {
            search_term: term,
          },
        );
      }, SEARCH_GA_DEBOUNCE_MS),
    [],
  );
  useEffect(() => () => trackSearch.cancel(), [trackSearch]);
  useEffect(() => {
    if (searchTerm) trackSearch(searchTerm);
    else trackSearch.cancel();
  }, [searchTerm, trackSearch]);

  useEffect(() => {
    if (!selectedTag) return;
    ga.trackStructuredEvent(
      ga.EventCategory.CONTENT,
      "filter",
      "blog_tag",
      null,
      {
        selected_tag: selectedTag,
      },
    );
  }, [selectedTag]);

  useEffect(() => {
    if (!newsData) return;
    let filtered = [...newsData];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((post) => {
        const tagBlob = Array.isArray(post.tags) ? post.tags.join(" ") : "";
        const authorBlob = post.author?.name || "";
        return [
          post.title,
          post.description,
          post.content_markdown,
          tagBlob,
          authorBlob,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(term);
      });
    }
    if (selectedTag) {
      filtered = filtered.filter((post) => postMatchesTag(post, selectedTag));
    }
    setFilteredData(filtered);
  }, [searchTerm, selectedTag, newsData]);

  const updateTagInUrl = (tag) => {
    const { tag: _drop, ...rest } = router.query;
    const nextQuery = tag ? { ...rest, tag } : rest;
    router.replace({ pathname: router.pathname, query: nextQuery }, undefined, {
      shallow: true,
      scroll: false,
    });
  };

  const handleTagClick = (tag) => {
    const next = tag === selectedTag ? "" : tag;
    setSelectedTag(next);
    updateTagInUrl(next);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedTag("");
    updateTagInUrl("");
  };

  const handlePostClick = (post, position) => {
    ga.trackStructuredEvent(
      ga.EventCategory.NAVIGATION,
      ga.EventAction.CLICK,
      "blog_list_post",
      null,
      {
        post_id: post.id,
        position,
      },
    );
  };

  const tags = useMemo(() => collectTags(newsData), [newsData]);
  const visibleTags = useMemo(() => {
    if (showAllTags) return tags;
    const preview = tags.slice(0, TAG_PREVIEW_COUNT);
    // The active tag always shows, even when it's outside the preview (or
    // junk that only a ?tag= deep link can select).
    if (
      selectedTag &&
      !preview.some((t) => t.tag.toLowerCase() === selectedTag.toLowerCase())
    ) {
      const found = tags.find(
        (t) => t.tag.toLowerCase() === selectedTag.toLowerCase(),
      );
      // First, so the mobile preview CSS can never hide the active tag.
      preview.unshift(found || { tag: selectedTag, count: null });
    }
    return preview;
  }, [tags, showAllTags, selectedTag]);
  const hiddenTagCount = tags.length - TAG_PREVIEW_COUNT;

  const resultCount = filteredData?.length ?? 0;
  const countLine = selectedTag
    ? `${resultCount} ${resultCount === 1 ? "post" : "posts"} tagged #${selectedTag}`
    : searchTerm
      ? `${resultCount} ${resultCount === 1 ? "result" : "results"} for “${searchTerm}”`
      : `${resultCount} ${resultCount === 1 ? "post" : "posts"}`;

  return (
    <RefinedRoot>
      <style>{TAGS_CSS}</style>
      {/* HERO */}
      <section
        className="ohx-wrap"
        style={{
          paddingTop: "clamp(104px, 13vh, 156px)",
          paddingBottom: "clamp(20px, 3vh, 32px)",
        }}
      >
        <Eyebrow>
          <span className="rise" style={{ display: "inline-block" }}>
            The OHack blog
          </span>
        </Eyebrow>
        <h1
          className="ohx-display rise"
          style={{ marginTop: 18, maxWidth: "16ch", animationDelay: "60ms" }}
        >
          Stories from the <span className="ohx-italic">community.</span>
        </h1>
        <p
          className="ohx-lead rise"
          style={{ marginTop: 22, animationDelay: "150ms", maxWidth: "60ch" }}
        >
          Updates, success stories, and tech insights from the volunteers
          building free software for nonprofits.
        </p>
        <p
          className="ohx-muted rise"
          style={{
            marginTop: 14,
            animationDelay: "220ms",
            fontSize: "0.93rem",
          }}
        >
          Posts are AI-summarized highlights from the community Slack ·{" "}
          <a
            className="ohx-link"
            href="https://github.com/opportunity-hack/ohack-slack-bot"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              ga.trackStructuredEvent(
                ga.EventCategory.NAVIGATION,
                ga.EventAction.CLICK,
                "github_code_link",
              )
            }
          >
            How these posts are made <Arrow />
          </a>
        </p>
      </section>

      {/* CONTROLS + LIST — one reading column */}
      <section
        className="ohx-wrap"
        style={{ paddingBottom: "clamp(56px, 9vh, 104px)" }}
      >
        <div className="ohx-narrow">
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              alignItems: "center",
            }}
          >
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search posts…"
              aria-label="Search blog posts"
              style={{
                flex: "1 1 260px",
                minWidth: 0,
                minHeight: 44,
                font: "inherit",
                fontSize: 16,
                color: "var(--ink)",
                background: "var(--surface)",
                border: "1px solid var(--line)",
                borderRadius: 6,
                padding: "10px 14px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
            {(searchTerm || selectedTag) && (
              <button
                type="button"
                className="ohx-link"
                style={textButtonStyle}
                onClick={clearFilters}
              >
                Clear ×
              </button>
            )}
          </div>

          {tags.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div
                className={`ohx-blog-tags${showAllTags ? "" : " ohx-blog-tags--preview"}`}
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span
                  className="ohx-muted"
                  style={{ fontSize: "0.9rem", marginRight: 4 }}
                >
                  Browse by tag:
                </span>
                {visibleTags.map(({ tag, count }) => {
                  const active =
                    selectedTag.toLowerCase() === tag.toLowerCase();
                  return (
                    <button
                      key={tag}
                      type="button"
                      className="ohx-tag ohx-blog-chip"
                      aria-pressed={active}
                      onClick={() => handleTagClick(tag)}
                      style={chipStyle(active)}
                    >
                      #{tag}
                      {count ? ` · ${count}` : ""}
                    </button>
                  );
                })}
                {hiddenTagCount > 0 && (
                  <button
                    type="button"
                    className="ohx-link"
                    style={textButtonStyle}
                    aria-expanded={showAllTags}
                    onClick={() => setShowAllTags((v) => !v)}
                  >
                    {showAllTags ? "Show fewer" : `Show all ${tags.length}`}
                  </button>
                )}
              </div>
            </div>
          )}

          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
              margin: "28px 0 16px",
            }}
          >
            <h2
              className="ohx-display"
              style={{ fontSize: "1.4rem", margin: 0 }}
            >
              {selectedTag
                ? `Tagged #${selectedTag}`
                : searchTerm
                  ? "Search results"
                  : "Latest updates"}
            </h2>
            {!loading && (
              <span
                className="ohx-faint"
                style={{ fontSize: "0.9rem" }}
                aria-live="polite"
              >
                {countLine}
              </span>
            )}
          </div>

          {resultCount === 0 && !loading && (
            <div
              className="ohx-card"
              style={{ padding: "36px 28px", textAlign: "center" }}
            >
              <p className="ohx-muted" style={{ margin: 0 }}>
                No posts match your criteria.
              </p>
              <button
                type="button"
                className="ohx-link"
                style={{
                  ...textButtonStyle,
                  marginTop: 12,
                  fontSize: "inherit",
                }}
                onClick={clearFilters}
              >
                Clear filters <Arrow />
              </button>
            </div>
          )}

          <PostList
            posts={filteredData}
            loading={loading}
            selectedTag={selectedTag}
            onTagClick={handleTagClick}
            onPostClick={handlePostClick}
          />

          <CtaBand
            eyebrow="Get involved"
            title="Be part of the next story."
            body="Join our Slack community to contribute to the conversation and be featured here."
            primary={{
              href: "/signup",
              label: "Join Slack",
              onClick: () =>
                ga.trackStructuredEvent(
                  ga.EventCategory.CONVERSION,
                  ga.EventAction.CLICK,
                  "join_slack",
                ),
            }}
            secondary={{ href: "/hack", label: "Find a hackathon" }}
          />
        </div>
      </section>
    </RefinedRoot>
  );
};

export default BlogPage;
