import { buildBlogIndexJsonLd } from "../blogJsonLd";

describe("buildBlogIndexJsonLd", () => {
  it("emits the Blog node with a lean, www-only blogPost[]", () => {
    const out = buildBlogIndexJsonLd([
      {
        id: "a1",
        title: "Chapterstack <script>",
        published_at: "2026-11-04T15:00:00Z",
        featured_image: "https://cdn.ohack.dev/news/a1.png",
      },
      {
        id: "b2",
        title: "Legacy post",
        slack_ts: "1700000000.000100",
        image: "/relative.png",
      },
      { id: "c3", title: "Undated" },
      { title: "no id" },
      null,
    ]);
    expect(out["@type"]).toBe("Blog");
    expect(out.url).toBe("https://www.ohack.dev/blog");
    expect(out.blogPost).toEqual([
      {
        "@type": "BlogPosting",
        headline: "Chapterstack <script>",
        url: "https://www.ohack.dev/blog/a1",
        datePublished: "2026-11-04T15:00:00Z",
        image: "https://cdn.ohack.dev/news/a1.png",
      },
      {
        "@type": "BlogPosting",
        headline: "Legacy post",
        url: "https://www.ohack.dev/blog/b2",
        datePublished: "2023-11-14T22:13:20.000Z",
      },
      {
        "@type": "BlogPosting",
        headline: "Undated",
        url: "https://www.ohack.dev/blog/c3",
      },
    ]);
    expect(JSON.stringify(out)).not.toMatch(/https:\/\/ohack\.dev\//);
  });

  it("omits blogPost entirely with no posts", () => {
    expect(buildBlogIndexJsonLd([])).not.toHaveProperty("blogPost");
    expect(buildBlogIndexJsonLd(undefined)).not.toHaveProperty("blogPost");
  });
});
