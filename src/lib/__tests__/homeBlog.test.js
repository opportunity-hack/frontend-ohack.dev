import {
  blogExcerpt,
  toHomeBlogPost,
  pickHomeBlogPosts,
  stripMarkdown,
  HOME_BLOG_LIMIT,
} from "../homeBlog";

const LONG = "Chapterstack is live. ".repeat(20).trim();

describe("homeBlog", () => {
  it("uses description when it is long enough", () => {
    expect(blogExcerpt({ description: "A real description that is long enough to use here." })).toBe(
      "A real description that is long enough to use here.",
    );
  });

  it("falls back to stripped markdown when description is short", () => {
    const doc = { description: "short", content_markdown: "## Hello **world** [link](https://x.y) `code`" };
    expect(blogExcerpt(doc)).toBe("Hello world link code");
  });

  it("truncates at a word boundary with an ellipsis", () => {
    const out = blogExcerpt({ description: LONG });
    expect(out.length).toBeLessThanOrEqual(181);
    expect(out.endsWith("…")).toBe(true);
    expect(out).not.toMatch(/\s…$/);
    expect(LONG.startsWith(out.slice(0, -1))).toBe(true);
  });

  it("stripMarkdown handles empty input", () => {
    expect(stripMarkdown()).toBe("");
  });

  it("projects a lean post", () => {
    const post = toHomeBlogPost({
      id: "abc",
      title: "T",
      description: LONG,
      content_markdown: "# big body",
      image: "https://cdn.ohack.dev//news/a.png",
      slack_ts_human_readable: "2026-11-04 10:00:00",
      status: "published",
    });
    expect(post).toEqual({
      id: "abc",
      title: "T",
      excerpt: expect.any(String),
      image: "https://cdn.ohack.dev/news/a.png",
      date: "2026-11-04 10:00:00",
    });
  });

  it("prefers featured_image and published_at", () => {
    const post = toHomeBlogPost({
      id: "a",
      title: "T",
      image: "https://cdn.ohack.dev/a.png",
      featured_image: "https://example.com/f.jpg",
      published_at: "2026-11-05T12:00:00Z",
      slack_ts_human_readable: "2026-11-01 00:00:00",
    });
    expect(post.image).toBe("https://example.com/f.jpg");
    expect(post.date).toBe("2026-11-05T12:00:00Z");
  });

  it("returns null when id or title is missing; image/date null when absent", () => {
    expect(toHomeBlogPost({ title: "T" })).toBeNull();
    expect(toHomeBlogPost({ id: "a" })).toBeNull();
    expect(toHomeBlogPost(null)).toBeNull();
    expect(toHomeBlogPost({ id: "a", title: "T" })).toMatchObject({ image: null, date: null, excerpt: "" });
  });

  it("pickHomeBlogPosts guards the payload, drops bad docs and slices", () => {
    expect(pickHomeBlogPosts(null)).toEqual([]);
    expect(pickHomeBlogPosts({ text: "nope" })).toEqual([]);
    const docs = [{ id: "1", title: "a" }, { title: "bad" }, { id: "2", title: "b" }, { id: "3", title: "c" }, { id: "4", title: "d" }];
    expect(pickHomeBlogPosts({ text: docs }).map((p) => p.id)).toEqual(["1", "2", "3"]);
    expect(HOME_BLOG_LIMIT).toBe(3);
  });
});
