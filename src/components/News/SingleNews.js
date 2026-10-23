// The article body for /blog/[blog_id]. Rendered ONLY by SingleBlogPost,
// which owns the RefinedPage shell, the tag strip and the related posts, so
// the .ohx-* classes are always in scope here. Contracts (CLAUDE.md "Blog
// Admin → Public-side honoring"): markdown posts render through
// react-markdown WITHOUT rehype-raw; legacy posts render `description` as
// plain text; the post title is the page's ONE <h1>.
import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { trackEvent, initFacebookPixel } from "../../lib/ga";
import { normalizeImageUrl } from "../../lib/imageUtils";
import { PageMasthead, Prose } from "../design/RefinedPage";
import { FONT_MONO } from "../../styles/fonts";

// Lazy-load the markdown renderer so the legacy plain-text path stays light.
const ReactMarkdown = dynamic(() => import("react-markdown"), { ssr: true });

// Google Ads blog conversion. Account 371-489-1437's Google tag is AW-11474351176
// (NEXT_PUBLIC_GOOGLE_ADS_ID — an Ads *tag* id is not the customer id). This label is
// the "News button click" conversion action (type id 7767630437) in that account.
// The older label `JCk6COG-q4kZEMjost8q` was a deleted action in the same account.
// Set to null to skip the Ads conversion ping in gaButton().
const GOOGLE_ADS_BLOG_CONVERSION_LABEL = "2qwxCOXE8vccEMjost8q";

// next/image only for our CDN (the only allowed remotePatterns host besides
// giphy/imgur); everything else is a plain <img> with explicit dimensions.
const isCdnImage = (url) => {
  try {
    return new URL(url).hostname === "cdn.ohack.dev";
  } catch {
    return false;
  }
};

// ISO timestamps (published_at) and the legacy "YYYY-MM-DD HH:MM:SS"
// slack_ts_human_readable strings → "January 5, 2026"; anything else passes
// through untouched. Zone-less values are read as UTC so the SSR and client
// renders agree (and the calendar day never shifts).
const formatPublished = (value) => {
  if (!value || typeof value !== "string") return "";
  if (!/^\d{4}-\d{2}-\d{2}([T ]\d{2}:\d{2}|$)/.test(value.trim())) return value;
  const iso = value.trim().replace(" ", "T");
  const d = new Date(
    /(Z|[+-]\d{2}:?\d{2})$/.test(iso) || !iso.includes("T") ? iso : iso + "Z",
  );
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
};

const buttonReset = {
  background: "none",
  border: 0,
  padding: 0,
  cursor: "pointer",
  font: "inherit",
};

// --- react-markdown renderers (module scope: stable identities) ---------------
const markdownImageRenderer = ({ src, alt }) => (
  <img
    src={src}
    alt={alt || ""}
    loading="lazy"
    decoding="async"
    style={{
      maxWidth: "100%",
      height: "auto",
      display: "block",
      margin: "1em 0",
      borderRadius: 6,
    }}
  />
);

const markdownLinkRenderer = ({ href, children }) => (
  <a href={href} target="_blank" rel="noopener noreferrer">
    {children}
  </a>
);

// Authored headings are demoted one level: the post title is the only <h1>.
const demotedHeading = (level) => {
  const Tag = `h${Math.min(level + 1, 6)}`;
  const Heading = ({ children }) => <Tag>{children}</Tag>;
  Heading.displayName = `MarkdownH${level}`;
  return Heading;
};

const markdownCodeRenderer = ({ className, children }) => {
  const text = String(children ?? "");
  const isBlock =
    (className && className.startsWith("language-")) || text.includes("\n");
  return (
    <code
      className={className}
      style={
        isBlock
          ? { fontFamily: FONT_MONO, fontSize: 14, background: "transparent" }
          : {
              fontFamily: FONT_MONO,
              fontSize: "0.92em",
              background: "var(--surface-2)",
              border: "1px solid var(--line)",
              borderRadius: 4,
              padding: "1px 5px",
            }
      }
    >
      {children}
    </code>
  );
};

const markdownPreRenderer = ({ children }) => (
  <pre
    style={{
      background: "var(--brand-ink)",
      color: "#fff",
      padding: "16px 18px",
      borderRadius: 8,
      overflowX: "auto",
      lineHeight: 1.55,
      margin: "0 0 16px",
    }}
  >
    {children}
  </pre>
);

const MARKDOWN_COMPONENTS = {
  img: markdownImageRenderer,
  a: markdownLinkRenderer,
  code: markdownCodeRenderer,
  pre: markdownPreRenderer,
  h1: demotedHeading(1),
  h2: demotedHeading(2),
  h3: demotedHeading(3),
  h4: demotedHeading(4),
  h5: demotedHeading(5),
};

// ------------------------------------------------------------------------------

function SingleNews({ newsItem }) {
  const [copied, setCopied] = useState(false);
  const copiedTimerRef = useRef(null);

  // Initialize Facebook Pixel (idempotent — see lib/ga).
  useEffect(() => {
    initFacebookPixel();
    return () => {
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
    };
  }, []);

  const gaButton = async (action, actionName) => {
    // Track Google Ads conversion — only once a label exists for the
    // current Ads account (see GOOGLE_ADS_BLOG_CONVERSION_LABEL above).
    if (
      process.env.NEXT_PUBLIC_GOOGLE_ADS_ID &&
      GOOGLE_ADS_BLOG_CONVERSION_LABEL
    ) {
      trackEvent({
        action: "conversion",
        params: {
          send_to: `${process.env.NEXT_PUBLIC_GOOGLE_ADS_ID}/${GOOGLE_ADS_BLOG_CONVERSION_LABEL}`,
        },
      });
    }

    // Track regular event
    trackEvent({
      action: action,
      params: {
        action_name: actionName,
      },
    });
  };

  const handleCopy = (text) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard
        .writeText(text + " More at www.ohack.dev/blog")
        .catch(() => {});
    }
    setCopied(true);
    if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
    copiedTimerRef.current = setTimeout(() => setCopied(false), 3000);
    gaButton("button_copy", text);
  };

  const heroImage = newsItem.featured_image || newsItem.image;
  const heroSrc = heroImage ? normalizeImageUrl(heroImage) : null;
  const isMarkdown =
    newsItem.content_format === "markdown" && newsItem.content_markdown;
  const publishedDate = formatPublished(
    newsItem.published_at || newsItem.slack_ts_human_readable,
  );
  const author = newsItem.author?.name;
  const hasSlackPermalink = !!newsItem.slack_permalink;
  const eyebrow = [publishedDate, author ? `by ${author}` : null]
    .filter(Boolean)
    .join(" · ");

  const links = Array.isArray(newsItem.links)
    ? newsItem.links.filter((l) => l && typeof l.url === "string")
    : [];
  const externalLinks = links.filter((l) => !l.url.startsWith("#"));
  const channelLinks = links.filter((l) => l.url.startsWith("#"));

  return (
    <>
      <PageMasthead
        eyebrow={eyebrow || "Opportunity Hack blog"}
        title={newsItem.title}
      />

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "8px 20px",
          marginTop: 16,
          fontSize: 14,
        }}
      >
        {hasSlackPermalink && (
          <a
            className="ohx-link"
            href={newsItem.slack_permalink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              gaButton("button_slack_post", newsItem.slack_permalink)
            }
          >
            Original Slack post ↗
          </a>
        )}
        <button
          type="button"
          className="ohx-link"
          style={buttonReset}
          aria-label="Copy blog excerpt"
          onClick={() =>
            handleCopy(`${newsItem.title} ${newsItem.description}`)
          }
        >
          Copy excerpt
        </button>
        <span
          role="status"
          aria-live="polite"
          className="ohx-faint"
          style={{ fontSize: 13, minWidth: 1 }}
        >
          {copied ? "Copied to clipboard" : ""}
        </span>
      </div>
      {!isMarkdown && hasSlackPermalink && (
        <p className="ohx-faint" style={{ margin: "8px 0 0", fontSize: 13.5 }}>
          Summarized by AI from a community Slack post — see the original for
          specifics.
        </p>
      )}

      {heroSrc && (
        <figure
          className="ohx-card"
          style={{
            margin: "28px 0 0",
            padding: 0,
            overflow: "hidden",
            maxWidth: isMarkdown ? "100%" : 260,
          }}
        >
          {/* Reserved aspect box (CWV): the image never shifts the article. */}
          <div
            style={{
              position: "relative",
              aspectRatio: isMarkdown ? "16 / 9" : "1 / 1",
              background: "var(--surface-2)",
            }}
          >
            {isCdnImage(heroSrc) ? (
              <Image
                src={heroSrc}
                alt={newsItem.title || ""}
                fill
                sizes="(max-width: 760px) 100vw, 760px"
                style={{ objectFit: "cover" }}
                priority
              />
            ) : (
              <img
                src={heroSrc}
                alt={newsItem.title || ""}
                width={isMarkdown ? 1280 : 1024}
                height={isMarkdown ? 720 : 1024}
                decoding="async"
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            )}
          </div>
        </figure>
      )}

      <Prose style={{ marginTop: 32 }}>
        {isMarkdown ? (
          <ReactMarkdown components={MARKDOWN_COMPONENTS}>
            {newsItem.content_markdown}
          </ReactMarkdown>
        ) : (
          <p style={{ whiteSpace: "pre-line" }}>{newsItem.description}</p>
        )}
      </Prose>

      {externalLinks.length > 0 && (
        <section style={{ marginTop: 32 }} aria-label="Links from this post">
          <p className="ohx-eyebrow">Links</p>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              marginTop: 10,
            }}
          >
            {externalLinks.map((link) => (
              <a
                key={`${link.name}-${link.url}`}
                className="ohx-btn ohx-btn--ghost"
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  gaButton("button_news", link.name + ":" + link.url)
                }
              >
                {link.name} ↗
              </a>
            ))}
          </div>
        </section>
      )}

      {channelLinks.length > 0 && (
        <section style={{ marginTop: 24 }} aria-label="Slack channels">
          <p className="ohx-eyebrow">Discussed in</p>
          <div
            style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}
          >
            {channelLinks.map((link) => (
              <a
                key={`${link.name}-${link.url}`}
                className="ohx-tag"
                href={`https://opportunity-hack.slack.com/app_redirect?channel=${link.name}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none" }}
                onClick={() =>
                  gaButton("button_slack", link.name + ":" + link.url)
                }
              >
                #{link.name}
              </a>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

export default SingleNews;
