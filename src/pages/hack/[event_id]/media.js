import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Head from "next/head";
import Image from "next/image";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { styled } from "@mui/material/styles";
import {
  Article as ArticleIcon,
  Instagram as InstagramIcon,
  LinkedIn as LinkedInIcon,
  AlternateEmail as ThreadsIcon,
} from "@mui/icons-material";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";
import { Shell } from "../../../components/Teams/RefinedTeamShell";
import TeamBreadcrumbs from "../../../components/Teams/TeamBreadcrumbs";
import { PageMasthead, CtaBand } from "../../../components/design/RefinedPage";
import { serializeJsonLd } from "../../../lib/jsonLd";
import { parseLocalDate } from "../../../lib/dateUtils";
import {
  fetchForStaticProps,
  NOT_FOUND_REVALIDATE,
} from "../../../lib/ssgFetch";

// Event recap page: the full photo carousel + social/news coverage for one
// hackathon. Refined "civic editorial" chrome (Shell + breadcrumbs + editorial
// masthead); the carousel + Instagram embeds are the same libraries as before,
// re-framed in hairline cards with reserved boxes so nothing shifts on load.

const InstagramEmbed = dynamic(
  () => import("react-social-media-embed").then((m) => m.InstagramEmbed),
  { ssr: false },
);

const SITE = "https://www.ohack.dev";
const FALLBACK_OG_IMAGE =
  "https://cdn.ohack.dev/ohack.dev/2023_hackathon_2.webp";
// Instagram embeds render ~540–700px tall; reserve most of it so the grid
// doesn't jump when the (client-only) embed script fills in.
const INSTAGRAM_RESERVED_HEIGHT = 520;

const PLATFORM_META = {
  linkedin: {
    label: "LinkedIn",
    emptyDescription: "A LinkedIn post about the event.",
    buttonLabel: "Open post",
    icon: LinkedInIcon,
  },
  instagram: {
    label: "Instagram",
    emptyDescription: "An Instagram post about the event.",
    buttonLabel: "Open post",
    icon: InstagramIcon,
  },
  threads: {
    label: "Threads",
    emptyDescription: "A Threads post about the event.",
    buttonLabel: "Open post",
    icon: ThreadsIcon,
  },
  article: {
    label: "News article",
    emptyDescription: "A news article about the event.",
    buttonLabel: "Read article",
    icon: ArticleIcon,
  },
};

const isCdnUrl = (url) => {
  try {
    return new URL(url).hostname === "cdn.ohack.dev";
  } catch {
    return false;
  }
};

const hostnameOf = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

const formatDateRange = (start, end) => {
  const s = parseLocalDate(start);
  const e = parseLocalDate(end);
  const okS = !Number.isNaN(s.getTime());
  const okE = !Number.isNaN(e.getTime());
  if (!okS && !okE) return "";
  const full = { month: "long", day: "numeric", year: "numeric" };
  if (okS && okE && s.getTime() !== e.getTime()) {
    const sameMonth =
      s.getFullYear() === e.getFullYear() && s.getMonth() === e.getMonth();
    const left = s.toLocaleDateString(
      "en-US",
      sameMonth ? { month: "long", day: "numeric" } : full,
    );
    const right = sameMonth
      ? `${e.getDate()}, ${e.getFullYear()}`
      : e.toLocaleDateString("en-US", full);
    return `${left} – ${right}`;
  }
  return (okS ? s : e).toLocaleDateString("en-US", full);
};

// Photo renderer: next/image for our CDN (the only allowed remote host besides
// giphy/imgur), a plain sized <img> for anything else. Both fill a reserved
// aspect-ratio box owned by the caller.
const Photo = ({ url, alt, sizes, fit = "cover", priority = false }) => {
  const style = { objectFit: fit };
  if (isCdnUrl(url)) {
    return (
      <Image
        src={url}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        style={style}
      />
    );
  }
  return (
    <img
      src={url}
      alt={alt}
      width={1600}
      height={900}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        ...style,
      }}
    />
  );
};

// react-responsive-carousel ships its own CSS; these overrides re-skin the
// arrows/dots to the refined palette (navy controls on a warm surface).
const CarouselFrame = styled("div")({
  position: "relative",
  background: "var(--surface-2)",
  "& .carousel .slide": { backgroundColor: "transparent" },
  "& .carousel.carousel-slider .control-arrow": {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    top: "50%",
    width: 44,
    height: 44,
    marginTop: 0,
    padding: 0,
    transform: "translateY(-50%)",
    borderRadius: 999,
    backgroundColor: "var(--brand)",
    opacity: 0.92,
    transition: "opacity .18s ease, background-color .18s ease",
    zIndex: 2,
  },
  "& .carousel.carousel-slider .control-arrow:hover": {
    opacity: 1,
    backgroundColor: "var(--brand-ink)",
  },
  "& .carousel.carousel-slider .control-arrow:focus-visible": {
    outline: "2px solid var(--accent)",
    outlineOffset: 2,
  },
  "& .carousel.carousel-slider .control-prev.control-arrow": { left: 12 },
  "& .carousel.carousel-slider .control-next.control-arrow": { right: 12 },
  "& .carousel .control-dots": { bottom: 10, margin: 0 },
  "& .carousel .control-dots .dot": {
    width: 8,
    height: 8,
    margin: "0 5px",
    boxShadow: "none",
    opacity: 1,
    backgroundColor: "rgba(255,255,255,0.75)",
    border: "1px solid rgba(22,24,29,0.25)",
  },
  "& .carousel .control-dots .dot.selected, & .carousel .control-dots .dot:hover":
    {
      backgroundColor: "var(--brand)",
      borderColor: "var(--brand)",
    },
  "@media (max-width: 600px)": {
    "& .carousel.carousel-slider .control-arrow": { width: 36, height: 36 },
  },
});

const ThumbStrip = styled("div")({
  display: "flex",
  gap: 8,
  overflowX: "auto",
  padding: "14px 16px 6px",
  scrollbarWidth: "thin",
  scrollSnapType: "x proximity",
  "& button": {
    flex: "0 0 auto",
    width: 112,
    padding: 0,
    border: "1px solid var(--line)",
    borderRadius: 6,
    overflow: "hidden",
    background: "var(--surface)",
    cursor: "pointer",
    scrollSnapAlign: "start",
    transition: "border-color .18s ease, transform .18s ease",
  },
  "& button:hover": { borderColor: "var(--brand)" },
  "& button:focus-visible": {
    outline: "2px solid var(--accent)",
    outlineOffset: 2,
  },
  "& button[aria-current='true']": {
    borderColor: "var(--brand)",
    boxShadow: "inset 0 0 0 1px var(--brand)",
  },
  "@media (max-width: 900px)": { display: "none" },
});

const sectionHeading = { marginTop: 8, marginBottom: 6 };
const sectionSpacing = { marginTop: "clamp(40px, 6vh, 64px)" };

const PhotoGallery = ({ photos, eventTitle }) => {
  const [index, setIndex] = useState(0);
  const active = photos[index] || photos[0];
  const number = Math.min(index + 1, photos.length);
  const caption = active?.caption?.trim() || "";
  const credit = active?.credit?.trim() || "";

  return (
    <section
      id="photos"
      aria-labelledby="photos-heading"
      style={sectionSpacing}
    >
      <p className="ohx-eyebrow">Photo gallery</p>
      <h2 id="photos-heading" className="ohx-display" style={sectionHeading}>
        {photos.length} {photos.length === 1 ? "moment" : "moments"} from the
        event
      </h2>
      <p className="ohx-muted" style={{ margin: "0 0 20px", maxWidth: "60ch" }}>
        Use the arrows or your keyboard to browse. Click any photo caption's
        link to open the full-size image.
      </p>

      <div className="ohx-card" style={{ overflow: "hidden" }}>
        <CarouselFrame>
          <Carousel
            showArrows
            showIndicators={photos.length > 1}
            showThumbs={false}
            showStatus={false}
            infiniteLoop={photos.length > 1}
            useKeyboardArrows
            selectedItem={index}
            onChange={(idx) => setIndex(idx)}
            dynamicHeight={false}
          >
            {photos.map((photo, idx) => (
              <div
                key={`${photo.url}-${idx}`}
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "16 / 9",
                  background: "var(--surface-2)",
                }}
              >
                <Photo
                  url={photo.url}
                  alt={photo.caption || `${eventTitle} photo ${idx + 1}`}
                  sizes="(max-width: 1120px) 100vw, 1120px"
                  fit="contain"
                  priority={idx === 0}
                />
              </div>
            ))}
          </Carousel>
        </CarouselFrame>

        {photos.length > 1 && (
          <ThumbStrip aria-label="Browse photos">
            {photos.map((photo, idx) => (
              <button
                key={`${photo.url}-thumb-${idx}`}
                type="button"
                onClick={() => setIndex(idx)}
                aria-label={`View photo ${idx + 1} of ${photos.length}`}
                aria-current={idx === index ? "true" : undefined}
              >
                <span
                  style={{
                    display: "block",
                    position: "relative",
                    width: "100%",
                    aspectRatio: "16 / 10",
                    background: "var(--surface-2)",
                  }}
                >
                  <Photo url={photo.url} alt="" sizes="112px" fit="cover" />
                </span>
              </button>
            ))}
          </ThumbStrip>
        )}

        <div
          aria-live="polite"
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "10px 24px",
            padding: "16px 20px 18px",
            borderTop: "1px solid var(--line)",
          }}
        >
          <div style={{ minWidth: 0, flex: "1 1 320px" }}>
            <p className="ohx-eyebrow" style={{ marginBottom: 6 }}>
              Photo {number} of {photos.length}
            </p>
            <p
              style={{
                margin: 0,
                fontSize: caption ? "1.05rem" : "0.95rem",
                lineHeight: 1.5,
                color: caption ? "var(--ink)" : "var(--muted)",
                overflowWrap: "anywhere",
              }}
            >
              {caption || `Event gallery image from ${eventTitle}`}
            </p>
            {credit && (
              <p
                className="ohx-faint"
                style={{ margin: "6px 0 0", fontSize: "0.85rem" }}
              >
                Photo: {credit}
              </p>
            )}
          </div>
          {active?.url && (
            <a
              className="ohx-link"
              href={active.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: "0.9rem", flexShrink: 0 }}
            >
              Open full photo{" "}
              <span className="ohx-arrow" aria-hidden="true">
                ↗
              </span>
            </a>
          )}
        </div>
      </div>
    </section>
  );
};

const SocialPostCard = ({ post }) => {
  const meta = PLATFORM_META[post.platform] || PLATFORM_META.linkedin;
  const Icon = meta.icon;
  const caption = post.caption?.trim() || "";
  return (
    <a
      className="ohx-card ohx-card--hover"
      href={post.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        padding: "18px 20px",
        textDecoration: "none",
        color: "var(--ink)",
        height: "100%",
      }}
    >
      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        <Icon sx={{ fontSize: 20, color: "var(--brand)" }} aria-hidden="true" />
        <span className="ohx-tag">{meta.label}</span>
      </span>
      <p
        style={{
          margin: 0,
          fontSize: "0.98rem",
          lineHeight: 1.55,
          color: caption ? "var(--ink)" : "var(--muted)",
        }}
      >
        {caption || meta.emptyDescription}
      </p>
      <span
        className="ohx-faint"
        style={{ fontSize: "0.8rem", overflowWrap: "anywhere" }}
      >
        {hostnameOf(post.url)}
      </span>
      <span
        className="ohx-link"
        style={{ marginTop: "auto", fontSize: "0.9rem" }}
      >
        {meta.buttonLabel}{" "}
        <span className="ohx-arrow" aria-hidden="true">
          ↗
        </span>
      </span>
    </a>
  );
};

const InstagramCard = ({ post }) => (
  <figure style={{ margin: 0, width: "100%", maxWidth: 360 }}>
    <div
      className="ohx-card"
      style={{
        minHeight: INSTAGRAM_RESERVED_HEIGHT,
        overflow: "hidden",
        background: "var(--surface)",
      }}
    >
      <InstagramEmbed url={post.url} width="100%" />
    </div>
    {post.caption && (
      <figcaption
        className="ohx-muted"
        style={{ margin: "10px 2px 0", fontSize: "0.9rem", lineHeight: 1.5 }}
      >
        {post.caption}
      </figcaption>
    )}
  </figure>
);

const CoverageSection = ({ posts }) => {
  const instagram = posts.filter((p) => p.platform === "instagram");
  const others = posts.filter((p) => p.platform !== "instagram");
  return (
    <section
      id="coverage"
      aria-labelledby="coverage-heading"
      style={sectionSpacing}
    >
      <p className="ohx-eyebrow">Coverage</p>
      <h2 id="coverage-heading" className="ohx-display" style={sectionHeading}>
        On social media and in the news
      </h2>
      <p className="ohx-muted" style={{ margin: "0 0 20px", maxWidth: "60ch" }}>
        Posts and articles that covered the event. Links open on the original
        platform.
      </p>

      {others.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 16,
          }}
        >
          {others.map((post, idx) => (
            <SocialPostCard key={`${post.url}-${idx}`} post={post} />
          ))}
        </div>
      )}

      {instagram.length > 0 && (
        <div style={{ marginTop: others.length > 0 ? 36 : 0 }}>
          <h3
            className="ohx-display"
            style={{ fontSize: "1.1rem", margin: "0 0 14px" }}
          >
            Instagram
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 16,
              justifyItems: "center",
            }}
          >
            {instagram.map((post, idx) => (
              <InstagramCard key={`${post.url}-${idx}`} post={post} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

const MediaPage = ({ eventData }) => {
  const router = useRouter();

  const photos = useMemo(() => {
    const list = Array.isArray(eventData?.event_photos)
      ? eventData.event_photos
      : [];
    return list.filter((p) => p && typeof p.url === "string" && p.url);
  }, [eventData]);

  const socialPosts = useMemo(() => {
    const list = Array.isArray(eventData?.social_posts)
      ? eventData.social_posts
      : [];
    return list.filter(
      (p) =>
        p && PLATFORM_META[p.platform] && typeof p.url === "string" && p.url,
    );
  }, [eventData]);

  if (!eventData) {
    return (
      <Shell maxWidth={760}>
        <div className="ohx-card" style={{ padding: "28px 30px" }}>
          <h1 className="ohx-display" style={{ fontSize: "1.6rem" }}>
            Event not found
          </h1>
          <p className="ohx-muted" style={{ margin: "10px 0 18px" }}>
            We couldn't find that hackathon.
          </p>
          <NextLink href="/hack" className="ohx-btn ohx-btn--primary">
            See all hackathons
          </NextLink>
        </div>
      </Shell>
    );
  }

  const eventId = eventData.event_id || router.query.event_id;
  const eventTitle = eventData.title || `Event ${eventId}`;
  const eventHref = `/hack/${eventId}`;
  const pageUrl = `${SITE}${eventHref}/media`;
  const dateRange = formatDateRange(eventData.start_date, eventData.end_date);
  const photoCount = photos.length;
  const coverageCount = socialPosts.length;
  const hasContent = photoCount > 0 || coverageCount > 0;

  const description = `Photos and social media coverage from ${eventTitle}, an Opportunity Hack event.`;
  const ogImage = photos[0]?.url || eventData.image_url || FALLBACK_OG_IMAGE;
  const ogTitle = `${eventTitle} – Photos & Social Media`;

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: `${eventTitle} – Media & Social`,
      url: pageUrl,
      description,
    },
  ];
  if (photoCount > 0) {
    structuredData.push({
      "@context": "https://schema.org",
      "@type": "ImageGallery",
      name: `${eventTitle} – Photo Gallery`,
      url: pageUrl,
      image: photos.map((p) => p.url),
    });
  }

  const italic =
    photoCount > 0 ? "in photos." : coverageCount > 0 ? "in the news." : null;
  const leadParts = [];
  if (photoCount > 0)
    leadParts.push(`${photoCount} photo${photoCount === 1 ? "" : "s"}`);
  if (coverageCount > 0)
    leadParts.push(
      `${coverageCount} social and news link${coverageCount === 1 ? "" : "s"}`,
    );
  const lead = hasContent
    ? `${leadParts.join(" and ")} from this hackathon${dateRange ? `, held ${dateRange}` : ""}.`
    : "Photos and coverage will appear here after the event.";

  return (
    <>
      <Head>
        <title>{`${eventTitle} – Photos & Social Media | Opportunity Hack`}</title>
        <meta name="description" content={description} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:title" content={ogTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={ogTitle} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={ogImage} />
        {structuredData.map((sd) => (
          <script
            key={sd["@type"]}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: serializeJsonLd(sd) }}
          />
        ))}
      </Head>

      <Shell maxWidth={1120}>
        <TeamBreadcrumbs
          items={[
            { name: "Hackathons", href: "/hack" },
            { name: eventTitle, href: eventHref },
          ]}
          current="Media"
        />

        <PageMasthead
          eyebrow={dateRange ? `Event recap · ${dateRange}` : "Event recap"}
          title={eventTitle}
          italic={italic}
          lead={lead}
        >
          {hasContent && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                marginTop: 18,
              }}
            >
              {photoCount > 0 && (
                <a
                  href="#photos"
                  className="ohx-tag"
                  style={{ textDecoration: "none" }}
                >
                  {photoCount} photo{photoCount === 1 ? "" : "s"}
                </a>
              )}
              {coverageCount > 0 && (
                <a
                  href="#coverage"
                  className="ohx-tag ohx-tag--accent"
                  style={{ textDecoration: "none" }}
                >
                  {coverageCount} coverage link{coverageCount === 1 ? "" : "s"}
                </a>
              )}
            </div>
          )}
          <hr className="ohx-rule" style={{ marginTop: 28 }} />
        </PageMasthead>

        {!hasContent && (
          <div
            className="ohx-card"
            style={{
              marginTop: 32,
              padding: "36px 30px",
              background: "var(--surface-2)",
              textAlign: "center",
            }}
          >
            <h2 className="ohx-display" style={{ fontSize: "1.5rem" }}>
              No photos yet
            </h2>
            <p
              className="ohx-muted"
              style={{ margin: "10px auto 20px", maxWidth: "46ch" }}
            >
              Check back after the event for photos and highlights.
            </p>
            <NextLink href={eventHref} className="ohx-btn ohx-btn--primary">
              Back to {eventTitle}
            </NextLink>
          </div>
        )}

        {photoCount > 0 && (
          <PhotoGallery photos={photos} eventTitle={eventTitle} />
        )}

        {coverageCount > 0 && <CoverageSection posts={socialPosts} />}

        {hasContent && (
          <CtaBand
            eyebrow="Keep exploring"
            title={`More from ${eventTitle}`}
            body="Teams, nonprofits, results, and everything else from this event live on the event page."
            primary={{ href: eventHref, label: "Back to the event" }}
            secondary={{ href: `${eventHref}/results`, label: "See results" }}
          />
        )}
      </Shell>
    </>
  );
};

// Only the fields this page renders. The full event payload (teams,
// nonprofits, volunteers…) is large and none of it is needed here.
const MEDIA_FIELDS = [
  "id",
  "event_id",
  "title",
  "start_date",
  "end_date",
  "location",
  "image_url",
  "event_photos",
  "social_posts",
];

export async function getStaticProps({ params }) {
  // Same SSG error semantics as /hack/[event_id] (CLAUDE.md "SEO
  // infrastructure"): 404 or an empty `{}` body → real 404; any other upstream
  // failure throws so ISR keeps serving the last good copy.
  const result = await fetchForStaticProps(
    `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathon/${params.event_id}`,
    { isEmpty: (data) => !data || !data.id },
  );
  if (result.kind === "not_found") {
    return { notFound: true, revalidate: NOT_FOUND_REVALIDATE };
  }
  const eventData = {};
  for (const key of MEDIA_FIELDS) {
    eventData[key] = result.data[key] === undefined ? null : result.data[key];
  }
  return { props: { eventData }, revalidate: 60 };
}

export async function getStaticPaths() {
  // Rendered on demand (ISR), never prerendered at build time — the old
  // version fetched every hackathon during `next build`, the exact pattern
  // that aborted a Vercel deploy on a backend blip (see /hack/[event_id]).
  return { paths: [], fallback: "blocking" };
}

export default MediaPage;
