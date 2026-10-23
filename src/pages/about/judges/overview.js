import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { initFacebookPixel, trackEvent } from "../../../lib/ga";
import {
  RefinedRoot,
  Eyebrow,
  Arrow,
} from "../../../components/design/refined";
import {
  BackLink,
  pageSectionStyle,
} from "../../../components/design/RefinedPage";

import {
  AssessmentRounded,
  CheckRounded,
  DashboardRounded,
  GavelRounded,
  GroupsRounded,
  HelpOutlineRounded,
  LinkRounded,
  SettingsRounded,
  ShareRounded,
} from "@mui/icons-material";

// ---------------------------------------------------------------------------
// VideoGuidePage — the shared "video tutorial" template used by
// /about/judges/overview, /about/mentors/overview and /judge/overview.
// Each route keeps its own default export + getStaticProps (SEO/OG/JSON-LD are
// per-route) and only supplies a config object. Everything here is
// module-scope so a copy-link state change never remounts the iframe.
// ---------------------------------------------------------------------------

const SCROLL_OFFSET = 96;

const sectionPad = {
  paddingTop: "clamp(40px, 6vh, 64px)",
  paddingBottom: "clamp(40px, 6vh, 64px)",
};

const cardGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: 20,
};

const visuallyHidden = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0,0,0,0)",
  whiteSpace: "nowrap",
  border: 0,
};

const isExternal = (href) => /^https?:\/\//i.test(href);

// Renders a Next Link for internal hrefs and a plain anchor for external ones.
const SmartLink = ({ href, className, style, onClick, children, ...rest }) =>
  isExternal(href) ? (
    <a
      href={href}
      className={className}
      style={style}
      onClick={onClick}
      target="_blank"
      rel="noopener noreferrer"
      {...rest}
    >
      {children}
    </a>
  ) : (
    <Link
      href={href}
      className={className}
      style={style}
      onClick={onClick}
      {...rest}
    >
      {children}
    </Link>
  );

// Section heading with a hover-reveal copy-link anchor (team-page pattern).
const SectionHeading = ({ id, eyebrow, title, lead, copiedId, onCopyLink }) => (
  <div style={{ marginBottom: 24 }}>
    {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
    <div
      className="ohx-anchor-row"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginTop: eyebrow ? 6 : 0,
      }}
    >
      <h2 className="ohx-display" style={{ margin: 0 }}>
        {title}
      </h2>
      <a
        href={`#${id}`}
        onClick={(e) => onCopyLink(e, id)}
        className="ohx-anchor"
        aria-label={`Copy link to ${title}`}
        title="Copy link to this section"
        style={{
          display: "inline-flex",
          alignItems: "center",
          textDecoration: "none",
          color: copiedId === id ? "var(--brand)" : "var(--faint)",
          transition: "color .2s ease",
        }}
      >
        {copiedId === id ? (
          <CheckRounded sx={{ fontSize: 18 }} />
        ) : (
          <LinkRounded sx={{ fontSize: 18 }} />
        )}
      </a>
    </div>
    {lead && (
      <p
        className="ohx-muted"
        style={{ margin: "10px 0 0", maxWidth: "62ch", lineHeight: 1.6 }}
      >
        {lead}
      </p>
    )}
  </div>
);

export const VideoGuidePage = ({ config }) => {
  const {
    gaAction,
    back,
    eyebrow,
    title,
    italic,
    lead,
    video,
    share,
    primaryCta,
    highlights,
    highlightsTitle,
    cta,
    resources,
    resourcesTitle,
    quickReference,
  } = config;

  const [copiedId, setCopiedId] = useState(null);
  const [shareStatus, setShareStatus] = useState("");

  useEffect(() => {
    initFacebookPixel();
  }, []);

  const track = useCallback(
    (button) => trackEvent({ action: gaAction, params: { button } }),
    [gaAction],
  );

  const copyLink = useCallback(
    (id) => {
      if (typeof window === "undefined") return Promise.resolve(false);
      const url = `${window.location.origin}${window.location.pathname}${
        id ? `#${id}` : ""
      }`;
      if (!navigator.clipboard) return Promise.resolve(false);
      return navigator.clipboard
        .writeText(url)
        .then(() => {
          track(`copy_link_${id || "page"}`);
          return true;
        })
        .catch(() => false);
    },
    [track],
  );

  const onCopySectionLink = useCallback(
    (e, id) => {
      e.preventDefault();
      window.history.replaceState(null, "", `#${id}`);
      copyLink(id);
      setCopiedId(id);
      setTimeout(() => setCopiedId((cur) => (cur === id ? null : cur)), 1600);
    },
    [copyLink],
  );

  const flashShareStatus = useCallback((message) => {
    setShareStatus(message);
    setTimeout(() => setShareStatus(""), 2400);
  }, []);

  const shareVideo = useCallback(async () => {
    const shareData = { ...share, url: window.location.href };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        track("native_share");
        return;
      } catch (err) {
        // fall through to clipboard
      }
    }
    const ok = await copyLink("");
    flashShareStatus(ok ? "Link copied to clipboard" : "Couldn't copy link");
  }, [share, track, copyLink, flashShareStatus]);

  return (
    <RefinedRoot>
      <style>{`
        .ohx-anchor { opacity: 1; }
        @media (min-width: 900px) {
          .ohx-anchor { opacity: 0; }
          .ohx-anchor-row:hover .ohx-anchor,
          .ohx-anchor:focus-visible { opacity: 1; }
        }
      `}</style>

      {/* Masthead */}
      <section
        className="ohx-wrap"
        style={{ ...pageSectionStyle, paddingBottom: "clamp(24px, 4vh, 40px)" }}
      >
        <BackLink href={back.href}>{back.label}</BackLink>
        <header style={{ marginTop: 18 }}>
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1
            className="ohx-display rise"
            style={{ marginTop: 8, maxWidth: "20ch", animationDelay: "60ms" }}
          >
            {title} <span className="ohx-italic">{italic}</span>
          </h1>
          <p
            className="ohx-lead rise"
            style={{ marginTop: 18, maxWidth: "62ch", animationDelay: "150ms" }}
          >
            {lead}
          </p>
        </header>
      </section>

      {/* Video */}
      <section
        className="ohx-wrap rise"
        aria-labelledby="guide-video"
        style={{
          paddingBottom: "clamp(32px, 5vh, 56px)",
          animationDelay: "240ms",
        }}
      >
        <h2 id="guide-video" style={visuallyHidden}>
          {video.title}
        </h2>
        <div
          className="ohx-card"
          style={{
            overflow: "hidden",
            maxWidth: 920,
            background: "var(--ink)",
          }}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              paddingBottom: "56.25%",
              height: 0,
            }}
          >
            <iframe
              src={`https://www.youtube.com/embed/${video.id}?rel=0&modestbranding=1&enablejsapi=1`}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                border: 0,
              }}
            />
          </div>
        </div>

        <p className="ohx-faint" style={{ margin: "12px 0 0", fontSize: 13 }}>
          {video.meta}
        </p>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 12,
            marginTop: 20,
          }}
        >
          <SmartLink
            href={primaryCta.href}
            className="ohx-btn ohx-btn--primary"
            onClick={() => track(primaryCta.track)}
          >
            {primaryCta.label} <Arrow />
          </SmartLink>
          <button
            type="button"
            className="ohx-btn ohx-btn--ghost"
            onClick={shareVideo}
          >
            <ShareRounded sx={{ fontSize: 16 }} /> {share.buttonLabel}
          </button>
          <span
            role="status"
            aria-live="polite"
            className="ohx-faint"
            style={{ fontSize: 13, minHeight: 18 }}
          >
            {shareStatus}
          </span>
        </div>
      </section>

      {/* Highlights */}
      <section
        id="video-highlights"
        aria-labelledby="video-highlights-title"
        style={{
          background: "var(--surface-2)",
          borderTop: "1px solid var(--line)",
          borderBottom: "1px solid var(--line)",
          scrollMarginTop: SCROLL_OFFSET,
        }}
      >
        <div className="ohx-wrap" style={sectionPad}>
          <SectionHeading
            id="video-highlights"
            eyebrow="In the video"
            title={highlightsTitle}
            copiedId={copiedId}
            onCopyLink={onCopySectionLink}
          />
          <div style={cardGrid}>
            {highlights.map(({ icon: Icon, title: t, description, tag }, i) => (
              <article
                key={t}
                className="ohx-card rise"
                style={{
                  padding: 24,
                  background: "var(--surface)",
                  display: "flex",
                  flexDirection: "column",
                  animationDelay: `${i * 70}ms`,
                }}
              >
                <Icon sx={{ fontSize: 28, color: "var(--accent)" }} />
                <h3
                  className="ohx-display"
                  style={{ fontSize: "1.15rem", margin: "14px 0 8px" }}
                >
                  {t}
                </h3>
                <p
                  className="ohx-muted"
                  style={{
                    margin: 0,
                    fontSize: "0.95rem",
                    lineHeight: 1.55,
                    flexGrow: 1,
                  }}
                >
                  {description}
                </p>
                <span
                  className="ohx-tag"
                  style={{ marginTop: 16, alignSelf: "flex-start" }}
                >
                  {tag}
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Quick reference (optional) */}
      {quickReference && (
        <section
          id="quick-reference"
          className="ohx-wrap"
          aria-labelledby="quick-reference-title"
          style={{
            ...sectionPad,
            paddingBottom: 0,
            scrollMarginTop: SCROLL_OFFSET,
          }}
        >
          <SectionHeading
            id="quick-reference"
            eyebrow="Quick reference"
            title={quickReference.title}
            copiedId={copiedId}
            onCopyLink={onCopySectionLink}
          />
          <div style={cardGrid}>
            {quickReference.items.map((item) => (
              <div
                key={item.title}
                className="ohx-card"
                style={{ padding: 24 }}
              >
                <span
                  className={
                    item.accent ? "ohx-tag ohx-tag--accent" : "ohx-tag"
                  }
                >
                  {item.tag}
                </span>
                <h3
                  className="ohx-display"
                  style={{ fontSize: "1.15rem", margin: "12px 0 8px" }}
                >
                  {item.title}
                </h3>
                <p
                  className="ohx-muted"
                  style={{ margin: 0, fontSize: "0.95rem", lineHeight: 1.55 }}
                >
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA band */}
      <section className="ohx-wrap" style={sectionPad}>
        <div
          className="ohx-card"
          style={{
            padding: "28px 30px",
            background: "var(--brand)",
            borderColor: "var(--brand)",
            color: "#fff",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 20,
          }}
        >
          <div style={{ maxWidth: "56ch" }}>
            <p
              className="ohx-eyebrow"
              style={{ color: "rgba(255,255,255,0.7)" }}
            >
              {cta.eyebrow}
            </p>
            <h2
              className="ohx-display"
              style={{ fontSize: 24, marginTop: 8, color: "#fff" }}
            >
              {cta.title}
            </h2>
            <p
              style={{
                margin: "8px 0 0",
                fontSize: 14.5,
                color: "rgba(255,255,255,0.85)",
                lineHeight: 1.55,
              }}
            >
              {cta.body}
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <SmartLink
              href={cta.primary.href}
              className="ohx-btn"
              style={{ background: "#fff", color: "var(--brand)" }}
              onClick={() => track(cta.primary.track)}
            >
              {cta.primary.label}
            </SmartLink>
            <SmartLink
              href={cta.secondary.href}
              className="ohx-btn ohx-btn--ghost"
              style={{ color: "#fff", borderColor: "rgba(255,255,255,0.5)" }}
              onClick={() => track(cta.secondary.track)}
            >
              {cta.secondary.label}
            </SmartLink>
          </div>
        </div>
      </section>

      {/* Resources */}
      <section
        id="additional-resources"
        className="ohx-wrap"
        aria-labelledby="additional-resources-title"
        style={{
          paddingTop: 0,
          paddingBottom: "clamp(56px, 9vh, 104px)",
          scrollMarginTop: SCROLL_OFFSET,
        }}
      >
        <SectionHeading
          id="additional-resources"
          eyebrow="Keep going"
          title={resourcesTitle}
          copiedId={copiedId}
          onCopyLink={onCopySectionLink}
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 16,
          }}
        >
          {resources.map(({ href, icon: Icon, label, track: t }) => (
            <SmartLink
              key={href + label}
              href={href}
              className="ohx-card ohx-card--hover"
              onClick={() => track(t)}
              aria-label={`Go to ${label}`}
              style={{
                padding: "18px 20px",
                display: "flex",
                alignItems: "center",
                gap: 12,
                textDecoration: "none",
                color: "var(--ink)",
                fontWeight: 600,
                fontSize: 15,
              }}
            >
              <Icon
                sx={{ fontSize: 22, color: "var(--brand)", flexShrink: 0 }}
              />
              <span style={{ flexGrow: 1 }}>{label}</span>
              <span className="ohx-faint" aria-hidden="true">
                {isExternal(href) ? "↗" : "→"}
              </span>
            </SmartLink>
          ))}
        </div>
      </section>
    </RefinedRoot>
  );
};

// ---------------------------------------------------------------------------
// /about/judges/overview — "How judging works" video guide
// ---------------------------------------------------------------------------

const JUDGING_GUIDE = {
  gaAction: "click_judges_overview",
  back: { href: "/about/judges", label: "Back to the judge guide" },
  eyebrow: "Video guide · 5 minutes",
  title: "How judging works at",
  italic: "Opportunity Hack.",
  lead: "Watch this guide to understand our complete judging process, from the evaluation criteria to the live demo sessions that identify the most impactful nonprofit technology solutions.",
  video: {
    id: "L702RpJpjGM",
    title:
      "How Judging Works at Opportunity Hack - Complete 5 Minute Overview Video",
    meta: "Published September 8th 2025 · Duration: 5 minutes · Watch in full for the complete process",
  },
  share: {
    buttonLabel: "Share this video",
    title: "How Judging Works at Opportunity Hack",
    text: "Learn how judging works at Opportunity Hack - evaluating tech solutions that change lives!",
  },
  primaryCta: {
    href: "/about/judges#upcoming-events",
    label: "Apply to judge",
    track: "apply_after_video",
  },
  highlightsTitle: "What you'll learn",
  highlights: [
    {
      icon: AssessmentRounded,
      title: "Scoring system deep dive",
      description:
        "Understand the 4-category, 40-point scoring system that evaluates scope, documentation, polish, and security of nonprofit tech solutions.",
      tag: "Detailed walkthrough",
    },
    {
      icon: GavelRounded,
      title: "Two-stage process",
      description:
        "Learn how Stage 1 video evaluations lead to Stage 2 live demos, and how judges collaborate to identify the most impactful solutions.",
      tag: "Process breakdown",
    },
    {
      icon: GroupsRounded,
      title: "Raw details",
      description:
        "This isn't abstract: learn how we run the judging for the hackathon in a concrete way, with real examples and practical insights.",
      tag: "Practical guide",
    },
  ],
  cta: {
    eyebrow: "Next step",
    title: "Ready to become a judge?",
    body: "Now that you understand the process, apply to judge at our upcoming hackathons and help identify technology solutions that transform nonprofit organizations worldwide.",
    primary: {
      href: "/about/judges#upcoming-events",
      label: "Find events to judge",
      track: "find_events_cta",
    },
    secondary: {
      href: "/about/judges#judging-criteria",
      label: "Practice scoring",
      track: "practice_scoring_cta",
    },
  },
  resourcesTitle: "Additional resources for judges",
  resources: [
    {
      href: "/about/judges#judging-criteria",
      icon: AssessmentRounded,
      label: "Scoring criteria guide",
      track: "criteria_guide",
    },
    {
      href: "/about/judges#judge-faq",
      icon: HelpOutlineRounded,
      label: "Judge FAQ",
      track: "judge_faq",
    },
    {
      href: "/judge",
      icon: DashboardRounded,
      label: "Judge dashboard",
      track: "judge_dashboard",
    },
    {
      href: "/about/process",
      icon: SettingsRounded,
      label: "OHack process",
      track: "ohack_process",
    },
  ],
};

const JudgingOverview = () => <VideoGuidePage config={JUDGING_GUIDE} />;

export default JudgingOverview;

export const getStaticProps = async () => {
  const title = "How Judging Works at Opportunity Hack - 10 Minute Video Guide";
  const description =
    "Watch this comprehensive 5-minute video guide explaining how judging works at Opportunity Hack. Learn our scoring system, two-stage evaluation process, and see real judge experiences evaluating nonprofit technology solutions.";

  return {
    props: {
      title: "Video: How Judging Works at Opportunity Hack",
      description: description,
      openGraphData: [
        {
          name: "title",
          property: "title",
          content: title,
          key: "title",
        },
        {
          name: "og:title",
          property: "og:title",
          content: title,
          key: "ogtitle",
        },
        {
          name: "author",
          property: "author",
          content: "Opportunity Hack",
          key: "author",
        },
        {
          name: "og:description",
          property: "og:description",
          content: description,
          key: "ogdescription",
        },
        {
          name: "image",
          property: "og:image",
          content: "https://cdn.ohack.dev/ohack.dev/judge_1.jpg",
          key: "ognameimage",
        },
        {
          property: "og:image:width",
          content: "1200",
          key: "ogimagewidth",
        },
        {
          property: "og:image:height",
          content: "630",
          key: "ogimageheight",
        },
        {
          name: "url",
          property: "url",
          content: "https://www.ohack.dev/about/judges/overview",
          key: "url",
        },
        {
          name: "og:url",
          property: "og:url",
          content: "https://www.ohack.dev/about/judges/overview",
          key: "ogurl",
        },
        {
          name: "og:video",
          property: "og:video",
          content: "https://www.youtube.com/watch?v=L702RpJpjGM",
          key: "ogvideo",
        },
        {
          name: "og:video:url",
          property: "og:video:url",
          content: "https://www.youtube.com/watch?v=L702RpJpjGM",
          key: "ogvideourl",
        },
        {
          name: "og:video:secure_url",
          property: "og:video:secure_url",
          content: "https://www.youtube.com/watch?v=L702RpJpjGM",
          key: "ogvideosecureurl",
        },
        {
          name: "og:video:type",
          property: "og:video:type",
          content: "text/html",
          key: "ogvideotype",
        },
        {
          name: "og:video:width",
          property: "og:video:width",
          content: "1280",
          key: "ogvideowidth",
        },
        {
          name: "og:video:height",
          property: "og:video:height",
          content: "720",
          key: "ogvideoheight",
        },
        {
          name: "twitter:card",
          property: "twitter:card",
          content: "player",
          key: "twittercard",
        },
        {
          name: "twitter:site",
          property: "twitter:site",
          content: "@opportunityhack",
          key: "twittersite",
        },
        {
          name: "twitter:title",
          property: "twitter:title",
          content: title,
          key: "twittertitle",
        },
        {
          name: "twitter:description",
          property: "twitter:description",
          content: description,
          key: "twitterdesc",
        },
        {
          name: "twitter:image",
          property: "twitter:image",
          content: "https://cdn.ohack.dev/ohack.dev/judge_1.jpg",
          key: "twitterimage",
        },
        {
          name: "twitter:player",
          property: "twitter:player",
          content: "https://www.youtube.com/embed/L702RpJpjGM",
          key: "twitterplayer",
        },
        {
          name: "twitter:player:width",
          property: "twitter:player:width",
          content: "1280",
          key: "twitterplayerwidth",
        },
        {
          name: "twitter:player:height",
          property: "twitter:player:height",
          content: "720",
          key: "twitterplayerheight",
        },
      ],
      structuredData: {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Organization",
            "@id": "https://www.ohack.dev/#organization",
            name: "Opportunity Hack",
            url: "https://www.ohack.dev",
            logo: {
              "@type": "ImageObject",
              url: "https://cdn.ohack.dev/ohack.dev/judge_1.jpg",
            },
            sameAs: [
              "https://twitter.com/opportunityhack",
              "https://github.com/opportunity-hack",
            ],
          },
          {
            "@type": "VideoObject",
            "@id": "https://www.ohack.dev/about/judges/overview#main-video",
            name: title,
            description: description,
            thumbnailUrl: [
              "https://i.ytimg.com/vi/L702RpJpjGM/maxresdefault.jpg",
              "https://i.ytimg.com/vi/L702RpJpjGM/hqdefault.jpg",
            ],
            uploadDate: "2025-09-08T00:00:00.000Z",
            publishDate: "2025-09-08T00:00:00.000Z",
            contentUrl: "https://www.youtube.com/watch?v=L702RpJpjGM",
            embedUrl:
              "https://www.youtube.com/embed/L702RpJpjGM?rel=0&modestbranding=1&enablejsapi=1",
            playerType: "HTML5 Flash",
            duration: "PT10M30S",
            videoQuality: "hd720",
            inLanguage: "en-US",
            isFamilyFriendly: true,
            keywords: [
              "judging",
              "hackathon",
              "scoring",
              "nonprofit",
              "technology",
              "evaluation",
              "opportunity hack",
            ],
            interactionStatistic: {
              "@type": "InteractionCounter",
              interactionType: { "@type": "WatchAction" },
              userInteractionCount: 1000,
            },
            publisher: {
              "@type": "Organization",
              name: "Opportunity Hack",
              url: "https://www.ohack.dev",
              logo: {
                "@type": "ImageObject",
                url: "https://cdn.ohack.dev/ohack.dev/judge_1.jpg",
              },
            },
            creator: {
              "@type": "Organization",
              name: "Opportunity Hack",
              url: "https://www.ohack.dev",
            },
          },
          {
            "@type": "WebPage",
            "@id": "https://www.ohack.dev/about/judges/overview#webpage",
            url: "https://www.ohack.dev/about/judges/overview",
            name: title,
            description: description,
            primaryImageOfPage: {
              "@type": "ImageObject",
              url: "https://i.ytimg.com/vi/L702RpJpjGM/maxresdefault.jpg",
            },
            isPartOf: {
              "@type": "WebSite",
              "@id": "https://www.ohack.dev/#website",
            },
            mainEntity: {
              "@type": "VideoObject",
              "@id": "https://www.ohack.dev/about/judges/overview#main-video",
            },
            mainContentOfPage: {
              "@type": "VideoObject",
              "@id": "https://www.ohack.dev/about/judges/overview#main-video",
            },
            specialty: "Video Guide",
            about: {
              "@type": "Thing",
              name: "Hackathon Judging Process",
              description:
                "Video explanation of how judging works at Opportunity Hack",
            },
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://www.ohack.dev",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "About",
                item: "https://www.ohack.dev/about",
              },
              {
                "@type": "ListItem",
                position: 3,
                name: "Judges",
                item: "https://www.ohack.dev/about/judges",
              },
              {
                "@type": "ListItem",
                position: 4,
                name: "Overview",
                item: "https://www.ohack.dev/about/judges/overview",
              },
            ],
          },
        ],
      },
    },
  };
};
