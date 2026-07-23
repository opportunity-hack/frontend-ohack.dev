import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Box } from "@mui/material";
import News from "../News/News";
import * as ga from "../../lib/ga";
import { RefinedRoot, Eyebrow, Arrow } from "../design/refined";

const BlogPage = ({ posts }) => {
  const router = useRouter();
  const [newsData, setNewsData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [loading, setLoading] = useState(true);

  const getAllTags = (data) => {
    if (!data) return [];
    const tagsSet = new Set();
    data.forEach((post) => {
      if (Array.isArray(post.tags)) post.tags.forEach((t) => t && tagsSet.add(String(t)));
      const matches = post.description?.match(/#(\w+)/g) || [];
      matches.forEach((tag) => tagsSet.add(tag.substring(1)));
      post.links?.forEach((link) => {
        if (link.url.startsWith("#") && link.name && /^[a-z0-9_-]+$/.test(link.name)) tagsSet.add(link.name);
      });
    });
    return Array.from(tagsSet).sort((a, b) => a.localeCompare(b));
  };

  const postMatchesTag = (post, tag) => {
    if (!tag) return true;
    const lower = tag.toLowerCase();
    if (Array.isArray(post.tags) && post.tags.some((t) => String(t).toLowerCase() === lower)) return true;
    if (post.description?.toLowerCase().includes(`#${lower}`)) return true;
    if (post.links?.some((link) => link.url?.startsWith("#") && link.name?.toLowerCase() === lower)) return true;
    return false;
  };

  useEffect(() => {
    if (posts && posts.length > 0) {
      setNewsData(posts);
      setFilteredData(posts);
      setLoading(false);
    } else {
      setLoading(true);
      fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/news?limit=50`)
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
    const urlTag = Array.isArray(router.query.tag) ? router.query.tag[0] : router.query.tag;
    setSelectedTag(urlTag || "");
  }, [router.isReady, router.query.tag]);

  useEffect(() => {
    if (!newsData) return;
    let filtered = [...newsData];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((post) => {
        const tagBlob = Array.isArray(post.tags) ? post.tags.join(" ") : "";
        const authorBlob = post.author?.name || "";
        return [post.title, post.description, post.content_markdown, tagBlob, authorBlob]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(term);
      });
      ga.trackStructuredEvent(ga.EventCategory.CONTENT, "search", "blog_content", null, { search_term: searchTerm });
    }
    if (selectedTag) {
      filtered = filtered.filter((post) => postMatchesTag(post, selectedTag));
      ga.trackStructuredEvent(ga.EventCategory.CONTENT, "filter", "blog_tag", null, { selected_tag: selectedTag });
    }
    setFilteredData(filtered);
  }, [searchTerm, selectedTag, newsData]);

  const updateTagInUrl = (tag) => {
    const { tag: _drop, ...rest } = router.query;
    const nextQuery = tag ? { ...rest, tag } : rest;
    router.replace({ pathname: router.pathname, query: nextQuery }, undefined, { shallow: true, scroll: false });
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

  const tags = getAllTags(newsData);

  return (
    <RefinedRoot>
      {/* HERO */}
      <section className="ohx-wrap" style={{ paddingTop: "clamp(104px, 13vh, 156px)", paddingBottom: "clamp(24px, 4vh, 40px)" }}>
        <Eyebrow><span className="rise" style={{ display: "inline-block" }}>The OHack blog</span></Eyebrow>
        <h1 className="ohx-display rise" style={{ marginTop: 18, maxWidth: "16ch", animationDelay: "60ms" }}>
          Stories from the <span className="ohx-italic">community.</span>
        </h1>
        <p className="ohx-lead rise" style={{ marginTop: 22, animationDelay: "150ms", maxWidth: "60ch" }}>
          Updates, success stories, and tech insights from the volunteers building free software for nonprofits.
        </p>
      </section>

      {/* CONTROLS */}
      <section className="ohx-wrap" style={{ paddingBottom: "clamp(20px, 3vh, 32px)" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search posts…"
            aria-label="Search blog posts"
            style={{ flex: "1 1 260px", minWidth: 0, font: "inherit", fontSize: "0.95rem", color: "var(--ink)", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 6, padding: "11px 14px", outline: "none" }}
          />
          {(searchTerm || selectedTag) && (
            <button type="button" className="ohx-link" style={{ background: "none", border: 0, cursor: "pointer", font: "inherit", fontSize: "0.9rem" }} onClick={clearFilters}>
              Clear <Arrow />
            </button>
          )}
        </div>
        {tags.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
            {tags.map((tag) => {
              const active = selectedTag === tag;
              return (
                <button
                  key={tag}
                  type="button"
                  className="ohx-tag"
                  onClick={() => handleTagClick(tag)}
                  style={{ cursor: "pointer", fontFamily: "inherit", background: active ? "var(--brand)" : "var(--surface)", color: active ? "#fff" : "var(--muted)", borderColor: active ? "var(--brand)" : "var(--line)" }}
                >
                  #{tag}
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* BODY */}
      <section className="ohx-wrap" style={{ paddingBottom: "clamp(56px, 9vh, 104px)" }}>
        <Box sx={{ display: "grid", gap: 4, gridTemplateColumns: { xs: "1fr", md: "minmax(0, 2fr) minmax(0, 1fr)" }, alignItems: "start" }}>
          <div style={{ minWidth: 0 }}>
            <h2 className="ohx-display" style={{ fontSize: "1.4rem", marginBottom: 20 }}>
              {selectedTag ? `Tagged #${selectedTag}` : searchTerm ? `Results for “${searchTerm}”` : "Latest updates"}
            </h2>
            {filteredData?.length === 0 && !loading && (
              <div className="ohx-card" style={{ padding: "36px 28px", textAlign: "center" }}>
                <p className="ohx-muted" style={{ margin: 0 }}>No posts match your criteria.</p>
                <button type="button" className="ohx-link" style={{ marginTop: 12, background: "none", border: 0, cursor: "pointer", font: "inherit" }} onClick={clearFilters}>
                  Clear filters <Arrow />
                </button>
              </div>
            )}
            <News newsData={filteredData} loading={loading} />
          </div>

          <aside style={{ minWidth: 0 }}>
            <div style={{ position: "sticky", top: 90, display: "flex", flexDirection: "column", gap: 18 }}>
              <div className="ohx-card" style={{ padding: "24px" }}>
                <h3 className="ohx-display" style={{ fontSize: "1.15rem" }}>About this blog</h3>
                <p className="ohx-muted" style={{ margin: "10px 0 16px", fontSize: "0.93rem", lineHeight: 1.55 }}>
                  AI-summarized highlights from the Opportunity Hack community Slack — insights, project updates, and success stories.
                </p>
                <a className="ohx-link" href="https://github.com/opportunity-hack/ohack-slack-bot" target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.9rem" }} onClick={() => ga.trackStructuredEvent(ga.EventCategory.NAVIGATION, ga.EventAction.CLICK, "github_code_link")}>
                  View the blog code <Arrow />
                </a>
              </div>
              <div className="ohx-card" style={{ padding: "24px" }}>
                <h3 className="ohx-display" style={{ fontSize: "1.15rem" }}>Get involved</h3>
                <p className="ohx-muted" style={{ margin: "10px 0 16px", fontSize: "0.93rem", lineHeight: 1.55 }}>
                  Join our Slack community to contribute to the conversation and be featured here.
                </p>
                <a className="ohx-btn ohx-btn--primary" href="/signup" style={{ width: "100%", justifyContent: "center" }} onClick={() => ga.trackStructuredEvent(ga.EventCategory.CONVERSION, ga.EventAction.CLICK, "join_slack")}>
                  Join Slack <Arrow />
                </a>
              </div>
            </div>
          </aside>
        </Box>
      </section>
    </RefinedRoot>
  );
};

export default BlogPage;
