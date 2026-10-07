/** @jest-environment node */
import { buildBlogPostingJsonLd } from "../blogJsonLd";
import { serializeJsonLd } from "../jsonLd";

const opts = {
  canonicalUrl: "https://www.ohack.dev/blog/abc",
  ogImage: "https://cdn.ohack.dev/x.webp",
  ogDescription: 'A "quoted"\ndescription </script>',
};

test('title with " and \\n round-trips through JSON.parse; News: prefix stripped', () => {
  const title = 'News: Hackers "won"\nbig';
  const post = { slack_ts: "1700000000.5", author: { name: 'Jo "J" Doe' } };
  const parsed = JSON.parse(serializeJsonLd(buildBlogPostingJsonLd(post, { ...opts, title })));
  expect(parsed["@type"]).toBe("BlogPosting");
  expect(parsed.headline).toBe('Hackers "won"\nbig');
  expect(parsed.description).toBe(opts.ogDescription);
  expect(parsed.author).toEqual({ "@type": "Person", name: 'Jo "J" Doe' });
  expect(parsed.url).toBe(opts.canonicalUrl);
  expect(parsed.mainEntityOfPage["@id"]).toBe(opts.canonicalUrl);
});

test("datePublished omitted when neither published_at nor slack_ts exists", () => {
  const ld = buildBlogPostingJsonLd({}, { ...opts, title: "T" });
  expect(ld).not.toHaveProperty("datePublished");
  expect(ld).not.toHaveProperty("dateModified");
  expect(ld).not.toHaveProperty("author");
});

test("datePublished derived from slack_ts; published_at wins", () => {
  expect(buildBlogPostingJsonLd({ slack_ts: "1700000000" }, { ...opts, title: "T" }).datePublished).toBe(
    new Date(1700000000 * 1000).toISOString()
  );
  const ld = buildBlogPostingJsonLd(
    { published_at: "2026-01-02T00:00:00Z", slack_ts: "1700000000", last_updated: "2026-02-01T00:00:00Z" },
    { ...opts, title: "T" }
  );
  expect(ld.datePublished).toBe("2026-01-02T00:00:00Z");
  expect(ld.dateModified).toBe("2026-02-01T00:00:00Z");
});
