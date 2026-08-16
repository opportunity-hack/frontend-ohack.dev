import { FONT_DISPLAY } from "../../styles/fonts";
import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import Head from "next/head";
import {
  parseLocalDate,
  isHackathonExpired,
  isValidDate,
} from "../../lib/dateUtils";
import {
  CircularProgress,
  Container,
  Grid,
  Typography,
  Button,
  styled,
  Box,
  Paper,
} from "@mui/material";
import Script from "next/script";
import NextLink from "next/link";
import { RefinedRoot, RefinedFonts } from "../../components/design/refined";
import SurveyCTA from "../../components/Survey/SurveyCTA";
import TableOfContents from "../../components/Hackathon/TableOfContents";
import FloatingNavigation from "../../components/Hackathon/FloatingNavigation";

// Dynamically import HackathonHeader with high priority
const HackathonHeader = dynamic(
  () => import("../../components/Hackathon/HackathonHeader"),
  {
    ssr: true,
    loading: () => (
      <Box
        sx={{
          minHeight: "220px",
          background: "#f5f2ea",
          borderRadius: "4px",
          mb: 3,
          mt: 5,
        }}
      />
    ),
  },
);

// Create a visually-hidden style for accessibility
const VisuallyHidden = styled("span")({
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: "0",
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  borderWidth: "0",
});

const LinksContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  backgroundColor: theme.palette.background.default,
  display: "flex",
  flexDirection: "column",
  height: "100%",
  minHeight: "400px",
  overflowX: "hidden",
  overflowY: "auto",
}));

const RECAP_PLATFORM_LABELS = {
  instagram: "Instagram",
  linkedin: "LinkedIn",
  threads: "Threads",
  article: "News article",
};

const getRecapCoverageLabel = (items) => {
  if (!items.length) return "coverage links";

  const distinctPlatforms = Array.from(
    new Set(items.map((item) => item?.platform).filter(Boolean)),
  );

  if (distinctPlatforms.length === 1) {
    switch (distinctPlatforms[0]) {
      case "instagram":
        return items.length === 1 ? "Instagram post" : "Instagram posts";
      case "linkedin":
        return items.length === 1 ? "LinkedIn post" : "LinkedIn posts";
      case "threads":
        return items.length === 1 ? "Threads post" : "Threads posts";
      case "article":
        return items.length === 1 ? "news article" : "news articles";
      default:
        break;
    }
  }

  return items.length === 1 ? "coverage link" : "coverage links";
};

const getRecapItemText = (item) => {
  const trimmedCaption =
    typeof item?.caption === "string" ? item.caption.trim() : "";
  if (trimmedCaption) return trimmedCaption;

  if (item?.platform === "article") {
    return "Read related event coverage and updates.";
  }

  const platformLabel = RECAP_PLATFORM_LABELS[item?.platform] || "social";
  return `See ${platformLabel} coverage from the event.`;
};

// Remove Typography.defaultProps modification to reduce bundle size

// Loading placeholder component to reduce layout shift
const LoadingPlaceholder = ({
  height = "300px",
  label = "Loading content",
}) => (
  <Box
    sx={{
      height: height,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      border: "1px solid #eee",
      borderRadius: "4px",
      mb: 3,
    }}
    role="status"
    aria-live="polite"
  >
    <CircularProgress size={40} aria-label={label} />
    <Typography
      variant="caption"
      sx={{
        mt: 1,
        color: "text.secondary",
        position: "absolute",
        width: "1px",
        height: "1px",
        padding: "0",
        margin: "-1px",
        overflow: "hidden",
        clip: "rect(0, 0, 0, 0)",
        whiteSpace: "nowrap",
        borderWidth: "0",
      }}
    >
      {label}
    </Typography>
  </Box>
);

// Critical above-the-fold components (higher priority) with priority loading
const EventLinks = dynamic(
  () => import("../../components/Hackathon/EventLinks"),
  {
    ssr: true,
    loading: () => (
      <LoadingPlaceholder height="150px" label="Loading application links" />
    ),
  },
);

const EventCountdown = dynamic(
  () => import("../../components/Hackathon/EventCountdown"),
  {
    ssr: true,
    loading: () => (
      <LoadingPlaceholder
        height="350px"
        label="Loading event timeline and countdown"
      />
    ),
  },
);

// Remove preloading - let dynamic imports handle loading

// Load secondary components with lower priority
const NonprofitList = dynamic(
  () => import("../../components/Hackathon/NonprofitList"),
  {
    ssr: false,
    loading: () => (
      <LoadingPlaceholder
        height="400px"
        label="Loading nonprofit organizations"
      />
    ),
  },
);

const PlanningBudgetEventPageWidget = dynamic(
  () => import("../../components/Planning/PlanningBudgetEventPageWidget"),
  {
    ssr: false,
    // Reserve height per CLAUDE.md CWV rules — Skeleton inside the component
    // matches this so there's no layout shift when the planning fetch resolves.
    loading: () => (
      <LoadingPlaceholder height="200px" label="Loading budget overview" />
    ),
  },
);

const DonationProgress = dynamic(
  () => import("../../components/Hackathon/DonationProgress"),
  {
    ssr: false,
    loading: () => (
      <LoadingPlaceholder height="200px" label="Loading donation progress" />
    ),
  },
);

const HackathonLeaderboard = dynamic(
  () => import("../../components/Hackathon/HackathonLeaderboard"),
  {
    ssr: false,
    loading: () => (
      <LoadingPlaceholder height="350px" label="Loading hackathon statistics" />
    ),
  },
);

// Lazy load below-the-fold components with intersection observer
const VolunteerList = dynamic(
  () => import("../../components/Hackathon/VolunteerList"),
  {
    ssr: false,
    loading: () => (
      <LoadingPlaceholder height="300px" label="Loading volunteer list" />
    ),
  },
);

const TeamList = dynamic(() => import("../../components/Hackathon/TeamList"), {
  ssr: false,
  loading: () => (
    <LoadingPlaceholder height="300px" label="Loading team information" />
  ),
});

const EventConstraints = dynamic(
  () => import("../../components/Hackathon/EventConstraints"),
  {
    ssr: false,
    loading: () => (
      <LoadingPlaceholder height="200px" label="Loading event guidelines" />
    ),
  },
);

const InteractiveFAQ = dynamic(
  () => import("../../components/Hackathon/InteractiveFAQ"),
  {
    ssr: false,
    loading: () => (
      <LoadingPlaceholder
        height="400px"
        label="Loading frequently asked questions"
      />
    ),
  },
);

const HackathonResults = dynamic(
  () => import("../../components/Hackathon/HackathonResults"),
  {
    ssr: false,
    loading: () => (
      <LoadingPlaceholder height="300px" label="Loading hackathon results" />
    ),
  },
);

// Move FAQ data to a separate file to reduce bundle size
const getFaqData = () =>
  import("../../data/faqData").then((module) => module.default);

export default function HackathonEvent({ eventData }) {
  const router = useRouter();
  const [faqData, setFaqData] = useState(null);

  // If fallback is true and the page is being generated,
  // router.isFallback will be true
  const isLoading = router.isFallback;
  const { event_id } = router.query || {};
  const event = eventData;

  const hackathonExpired = event?.end_date
    ? isHackathonExpired(event.end_date, event.timezone)
    : false;

  const nonprofitMap = useMemo(() => {
    if (!event?.nonprofits) return {};
    const map = {};
    event.nonprofits.forEach((npo) => {
      map[npo.id] = npo.name;
    });
    return map;
  }, [event?.nonprofits]);

  const recapPhotos = useMemo(() => {
    const list = Array.isArray(event?.event_photos) ? event.event_photos : [];
    return list.filter(
      (photo) => photo && typeof photo.url === "string" && photo.url,
    );
  }, [event?.event_photos]);

  const recapCoverage = useMemo(() => {
    const list = Array.isArray(event?.social_posts) ? event.social_posts : [];
    return list.filter(
      (item) => item && typeof item.url === "string" && item.url,
    );
  }, [event?.social_posts]);

  const recapCoveragePreview = recapCoverage.slice(0, 3);
  const hasEventRecap = recapPhotos.length > 0 || recapCoverage.length > 0;
  const recapSummaryParts = [];

  if (recapPhotos.length > 0) {
    recapSummaryParts.push(
      `${recapPhotos.length} photo${recapPhotos.length === 1 ? "" : "s"}`,
    );
  }

  if (recapCoverage.length > 0) {
    recapSummaryParts.push(
      `${recapCoverage.length} ${getRecapCoverageLabel(recapCoverage)}`,
    );
  }

  const recapAriaLabel =
    recapSummaryParts.length > 0
      ? `Open event recap (${recapSummaryParts.join(", ")})`
      : "Open event recap";

  useEffect(() => {
    // Handle scrolling to the correct section when the page loads
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      if (hash) {
        const id = hash.replace("#", "");
        const element = document.getElementById(id);
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ behavior: "smooth" });
          }, 100); // Small delay to ensure the page has rendered
        }
      }
    }
  }, []);

  // Lazy load FAQ data when needed
  useEffect(() => {
    let isMounted = true;
    const loadFaqData = async () => {
      try {
        const data = await getFaqData();
        if (isMounted) {
          setFaqData(data);
        }
      } catch (error) {
        console.error("Failed to load FAQ data:", error);
      }
    };

    // Only load FAQ data when user scrolls near the FAQ section
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !faqData) {
            loadFaqData();
            observer.disconnect();
          }
        });
      },
      { rootMargin: "200px" },
    );

    // Observe the FAQ section
    const faqElement = document.getElementById("faq");
    if (faqElement) {
      observer.observe(faqElement);
    }

    return () => {
      isMounted = false;
      observer.disconnect();
    };
  }, [faqData]);

  // Loading state
  if (isLoading || !event) {
    return (
      <Container
        maxWidth="lg"
        component="main"
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        <CircularProgress />
      </Container>
    );
  }

  // Enhanced meta title and description with better fallbacks
  const eventTitle = event.title || `Hackathon Event ${event_id}`;
  const eventLocation = event.location || "Virtual/TBA";
  const eventStartDate =
    event.start_date && isValidDate(event.start_date)
      ? parseLocalDate(event.start_date).toLocaleDateString()
      : "TBA";
  const eventEndDate =
    event.end_date && isValidDate(event.end_date)
      ? parseLocalDate(event.end_date).toLocaleDateString()
      : "TBA";

  const metaTitle = `${eventTitle} - ${eventLocation} | Opportunity Hack`;
  const metaDescription = hackathonExpired
    ? `${eventTitle} in ${eventLocation} — see winning teams, project results, and the impact achieved at this Opportunity Hack event.`
    : `Join ${eventTitle} hackathon in ${eventLocation} from ${eventStartDate} to ${eventEndDate}. Apply as a hacker, volunteer, mentor, judge, or sponsor. Build technology solutions for nonprofits and make a positive impact. Register now!`;

  const metaImage =
    event?.image_url || "https://cdn.ohack.dev/ohack.dev/2023_hackathon_4.webp";

  // Use the canonical event ID from the data (not the requested slug) so alias
  // URLs like /hack/fall-2025 canonicalize to the correct /hack/2025_fall form.
  const canonicalEventId = event?.event_id || event_id;
  const canonicalUrl = `https://www.ohack.dev/hack/${canonicalEventId}`;

  // Application URLs for structured data and SEO
  const applicationUrls = {
    hacker: `https://www.ohack.dev/hack/${canonicalEventId}/hacker-application`,
    judge: `https://www.ohack.dev/hack/${canonicalEventId}/judge-application`,
    sponsor: `https://www.ohack.dev/hack/${canonicalEventId}/sponsor-application`,
    mentor: `https://www.ohack.dev/hack/${canonicalEventId}/mentor-application`,
    volunteer: `https://www.ohack.dev/hack/${canonicalEventId}/volunteer-application`,
  };

  // Enhanced structured data with application links
  const eventStructuredData = {
    "@context": "http://schema.org",
    "@type": "Event",
    name: eventTitle,
    description: event.description || metaDescription,
    startDate: event.start_date,
    endDate: event.end_date,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: event.location?.toLowerCase().includes("virtual")
      ? "https://schema.org/OnlineEventAttendanceMode"
      : "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: eventLocation,
      address: {
        "@type": "PostalAddress",
        addressLocality: eventLocation,
      },
    },
    image: [metaImage],
    url: canonicalUrl,
    organizer: {
      "@type": "Organization",
      name: "Opportunity Hack",
      url: "https://www.ohack.dev",
      logo: "https://cdn.ohack.dev/ohack.dev/logo.png",
    },
    offers: {
      "@type": "Offer",
      url: canonicalUrl,
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    keywords: [
      "hackathon",
      "nonprofit",
      "coding",
      "volunteers",
      "tech for good",
      eventLocation,
      "opportunity hack",
      "social impact",
      "hacker application",
      "judge application",
      "mentor application",
      "volunteer application",
      "sponsor application",
    ],
    subEvent: [
      {
        "@type": "Event",
        name: "Hacker Registration",
        url: applicationUrls.hacker,
        description:
          "Apply to participate as a hacker and build solutions for nonprofits",
        startDate: event.start_date,
        location: {
          "@type": "Place",
          name: eventLocation,
          address: {
            "@type": "PostalAddress",
            addressLocality: eventLocation,
          },
        },
      },
      {
        "@type": "Event",
        name: "Judge Registration",
        url: applicationUrls.judge,
        description:
          "Apply to judge hackathon projects and mentor participants",
        startDate: event.start_date,
        location: {
          "@type": "Place",
          name: eventLocation,
          address: {
            "@type": "PostalAddress",
            addressLocality: eventLocation,
          },
        },
      },
      {
        "@type": "Event",
        name: "Mentor Registration",
        url: applicationUrls.mentor,
        description: "Apply to mentor teams and share your expertise",
        startDate: event.start_date,
        location: {
          "@type": "Place",
          name: eventLocation,
          address: {
            "@type": "PostalAddress",
            addressLocality: eventLocation,
          },
        },
      },
      {
        "@type": "Event",
        name: "Volunteer Registration",
        url: applicationUrls.volunteer,
        description: "Apply to volunteer and help make the event successful",
        startDate: event.start_date,
        location: {
          "@type": "Place",
          name: eventLocation,
          address: {
            "@type": "PostalAddress",
            addressLocality: eventLocation,
          },
        },
      },
      {
        "@type": "Event",
        name: "Sponsor Registration",
        url: applicationUrls.sponsor,
        description: "Apply to sponsor the event and support tech for good",
        startDate: event.start_date,
        location: {
          "@type": "Place",
          name: eventLocation,
          address: {
            "@type": "PostalAddress",
            addressLocality: eventLocation,
          },
        },
      },
    ],
  };

  // Breadcrumb structured data for better SEO
  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
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
        name: "Hackathons",
        item: "https://www.ohack.dev/hack",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: eventTitle,
        item: canonicalUrl,
      },
    ],
  };

  // FAQ structured data for better search results - only generate if FAQ data is loaded
  const faqStructuredData = faqData
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqData.slice(0, 10).map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text:
              typeof faq.answer === "string"
                ? faq.answer
                : "Please visit our website for detailed information.",
          },
        })),
      }
    : null;

  return (
    <>
      <Head>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta charSet="UTF-8" />
        <RefinedFonts />

        {/* Enhanced Open Graph tags */}
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={metaImage} />
        <meta
          property="og:image:alt"
          content={`${eventTitle} hackathon event banner`}
        />
        <meta property="og:site_name" content="Opportunity Hack" />
        <meta property="og:locale" content="en_US" />
        {/* Enhanced Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@OpportunityHack" />
        <meta name="twitter:creator" content="@OpportunityHack" />
        <meta name="twitter:title" content={metaTitle} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={metaImage} />
        <meta
          name="twitter:image:alt"
          content={`${eventTitle} hackathon event banner`}
        />

        {/* Enhanced keywords with application-specific terms */}
        <meta
          name="keywords"
          content={`${eventTitle}, hackathon registration, hacker application, judge application, mentor application, volunteer application, sponsor application, ${eventLocation} hackathon, nonprofit technology, tech for good, coding competition, software development, community service, social impact, opportunity hack, hackathon ${eventStartDate}`}
        />
        <meta name="author" content="Opportunity Hack" />
        <meta
          name="robots"
          content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
        />
        <meta name="language" content="English" />
        <meta name="application-name" content="Opportunity Hack" />
        <meta name="theme-color" content="#3f51b5" />

        {/* Event-specific meta tags */}
        <meta name="event:start_date" content={event.start_date} />
        <meta name="event:end_date" content={event.end_date} />
        <meta name="event:location" content={eventLocation} />
        <meta name="event:type" content="hackathon" />

        {/* Preconnect to essential domains */}
        <link
          rel="preconnect"
          href="https://cdn.ohack.dev"
          crossOrigin="anonymous"
        />
        {/* DNS Prefetch */}
        <link rel="dns-prefetch" href="https://cdn.ohack.dev" />

        {/* Canonical URL */}
        <link rel="canonical" href={canonicalUrl} />

        {/* Alternate URLs for applications */}
        <link
          rel="alternate"
          href={applicationUrls.hacker}
          title="Hacker Application"
        />
        <link
          rel="alternate"
          href={applicationUrls.judge}
          title="Judge Application"
        />
        <link
          rel="alternate"
          href={applicationUrls.mentor}
          title="Mentor Application"
        />
        <link
          rel="alternate"
          href={applicationUrls.volunteer}
          title="Volunteer Application"
        />
        <link
          rel="alternate"
          href={applicationUrls.sponsor}
          title="Sponsor Application"
        />
      </Head>

      {/* Enhanced structured data */}
      <Script
        id="event-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(eventStructuredData),
        }}
      />

      <Script
        id="breadcrumb-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbStructuredData),
        }}
      />

      {faqStructuredData && (
        <Script
          id="faq-structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqStructuredData),
          }}
        />
      )}

      <RefinedRoot>
        <div
          className="ohx-wrap"
          style={{ paddingBottom: "clamp(56px, 9vh, 104px)" }}
        >
          <HackathonHeader
            title={event.title}
            startDate={event.start_date}
            endDate={event.end_date}
            location={event.location}
            description={event.description}
          />

          {/* Feedback CTA — visible once the event is live or has ended.
              Reaches everyone who lands here, including nonprofit partners. */}
          <SurveyCTA
            eventId={event.event_id || event_id}
            startDate={event.start_date}
            endDate={event.end_date}
            timezone={event.timezone}
          />

          {/* Expired-event recapture band — links to upcoming events so
              the 13k+ impressions on past event pages convert to engagement */}
          {hackathonExpired && (
            <div
              style={{
                margin: "16px 0",
                padding: "12px 20px",
                background: "var(--surface-2, #f5f2ea)",
                borderTop: "1px solid var(--line, #E7E1D4)",
                borderBottom: "1px solid var(--line, #E7E1D4)",
                textAlign: "center",
                fontSize: "0.95rem",
                color: "var(--ink, #16181D)",
              }}
              role="note"
            >
              This event has ended.{" "}
              <NextLink
                href="/hack"
                className="ohx-link"
                style={{ fontWeight: 600 }}
              >
                See upcoming hackathons →
              </NextLink>
            </div>
          )}

          {hackathonExpired && (
            <section id="results" aria-labelledby="results-heading">
              <HackathonResults
                teams={event.teams}
                nonprofitMap={nonprofitMap}
                eventId={event_id}
                eventTitle={event.title}
                githubOrg={event.github_org}
                fullResultsHref={`/hack/${event_id}/results`}
              />
            </section>
          )}

          {/* Event recap teaser — render when photos or social/news coverage exist */}
          {hasEventRecap && (
            <Box
              component="section"
              aria-labelledby="recap-heading"
              sx={{ mt: 3 }}
            >
              <div
                className="ohx-card"
                style={{ padding: "22px 24px", marginTop: 8, marginBottom: 24 }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 10,
                    marginBottom: 14,
                  }}
                >
                  <span id="recap-heading" className="ohx-eyebrow">
                    Event recap
                  </span>
                  <NextLink
                    href={`/hack/${event_id}/media`}
                    className="ohx-link"
                    style={{ fontSize: "0.9rem" }}
                  >
                    View recap →
                  </NextLink>
                </div>
                <Box
                  sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 1.5 }}
                >
                  {recapPhotos.length > 0 && (
                    <span className="ohx-tag">
                      {recapPhotos.length} photo
                      {recapPhotos.length === 1 ? "" : "s"}
                    </span>
                  )}
                  {recapCoverage.length > 0 && (
                    <span className="ohx-tag ohx-tag--accent">
                      {recapCoverage.length}{" "}
                      {getRecapCoverageLabel(recapCoverage)}
                    </span>
                  )}
                </Box>

                {recapPhotos.length > 0 ? (
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "repeat(3, 1fr)",
                        sm: "repeat(3, 1fr)",
                      },
                      gap: 1,
                    }}
                  >
                    {recapPhotos.slice(0, 3).map((photo, idx) => (
                      <NextLink
                        key={`${photo.url}-${idx}`}
                        href={`/hack/${event_id}/media`}
                        style={{ display: "block", textDecoration: "none" }}
                        aria-label={recapAriaLabel}
                      >
                        <Box
                          sx={{
                            position: "relative",
                            width: "100%",
                            aspectRatio: "16 / 10",
                            minHeight: { xs: 80, sm: 120 },
                            overflow: "hidden",
                            borderRadius: 1,
                            backgroundColor: "grey.100",
                          }}
                        >
                          <img
                            src={photo.url}
                            alt={
                              photo.caption ||
                              `${event.title || "Event"} photo ${idx + 1}`
                            }
                            loading="lazy"
                            style={{
                              position: "absolute",
                              inset: 0,
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        </Box>
                      </NextLink>
                    ))}
                  </Box>
                ) : (
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
                      gap: 1,
                    }}
                  >
                    {recapCoveragePreview.map((item, idx) => (
                      <NextLink
                        key={`${item.url}-${idx}`}
                        href={`/hack/${event_id}/media`}
                        style={{ display: "block", textDecoration: "none" }}
                        aria-label={recapAriaLabel}
                      >
                        <Box
                          sx={{
                            minHeight: { xs: 104, sm: 120 },
                            p: 2,
                            borderRadius: 1,
                            border: "1px solid var(--line)",
                            backgroundColor: "var(--surface-2)",
                            color: "var(--ink)",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            gap: 1,
                          }}
                        >
                          <Typography
                            variant="overline"
                            sx={{ color: "var(--brand)" }}
                          >
                            {RECAP_PLATFORM_LABELS[item.platform] || "Coverage"}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: "inherit",
                              display: "-webkit-box",
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {getRecapItemText(item)}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: "var(--muted)" }}
                          >
                            Open full recap
                          </Typography>
                        </Box>
                      </NextLink>
                    ))}
                  </Box>
                )}
                {recapPhotos.length > 3 && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mt: 1 }}
                  >
                    + {recapPhotos.length - 3} more photo
                    {recapPhotos.length - 3 === 1 ? "" : "s"}
                  </Typography>
                )}
                {recapPhotos.length === 0 && recapCoverage.length > 3 && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mt: 1 }}
                  >
                    + {recapCoverage.length - 3} more{" "}
                    {getRecapCoverageLabel(recapCoverage.slice(3))}
                  </Typography>
                )}
              </div>
            </Box>
          )}

          <nav aria-label="Event navigation">
            <TableOfContents
              eventLinks={event.links}
              isHackathonExpired={hackathonExpired}
            />
          </nav>

          <Grid container spacing={3}>
            {/* Applications section */}
            <Grid
              size={12}
              component="section"
              aria-labelledby="applications-heading"
              id="applications"
            >
              <Typography
                variant="h2"
                component="h2"
                id="applications-heading"
                sx={{
                  position: "absolute",
                  width: "1px",
                  height: "1px",
                  padding: "0",
                  margin: "-1px",
                  overflow: "hidden",
                  clip: "rect(0, 0, 0, 0)",
                  whiteSpace: "nowrap",
                  borderWidth: "0",
                }}
              >
                Applications
              </Typography>
              <EventLinks
                links={event.links}
                variant="applications"
                constraints={event.constraints}
              />
            </Grid>

            {/* Nonprofit List */}
            <Grid
              size={12}
              id="nonprofit"
              component="section"
              aria-labelledby="nonprofit-section-heading"
            >
              <NonprofitList
                nonprofits={event.nonprofits}
                teams={event.teams}
                eventId={event_id}
                visibleProblemStatements={event.visible_problem_statements}
              />
            </Grid>

            {/* Team List - Proper implementation with Grid item */}
            <Grid
              size={12}
              component="section"
              aria-labelledby="teams-heading"
              id="teams"
            >
              <Typography
                variant="h2"
                component="h2"
                id="teams-heading"
                sx={{
                  position: "absolute",
                  width: "1px",
                  height: "1px",
                  padding: "0",
                  margin: "-1px",
                  overflow: "hidden",
                  clip: "rect(0, 0, 0, 0)",
                  whiteSpace: "nowrap",
                  borderWidth: "0",
                }}
              >
                Teams
              </Typography>
              <LinksContainer elevation={2} id="build-a-team">
                <Box>
                  {hackathonExpired ? (
                    <Typography
                      variant="h5"
                      gutterBottom
                      sx={{
                        fontFamily: FONT_DISPLAY,
                        fontWeight: 500,
                      }}
                    >
                      Participating Teams
                    </Typography>
                  ) : (
                    <>
                      <Typography
                        variant="h5"
                        gutterBottom
                        sx={{
                          fontFamily: FONT_DISPLAY,
                          fontWeight: 500,
                        }}
                      >
                        Step 3. Build a team
                      </Typography>

                      {/* Team options - Find or Create */}
                      <Box sx={{ mb: 4 }}>
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          paragraph
                        >
                          You can either join an existing team or create your
                          own team to participate in this hackathon:
                        </Typography>

                        <Grid container spacing={2}>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <Button
                              variant="contained"
                              color="primary"
                              fullWidth
                              href={
                                event.constraints?.team_find_a_team_enabled !==
                                false
                                  ? `/hack/${event_id}/findteam`
                                  : undefined
                              }
                              disabled={
                                event.constraints?.team_find_a_team_enabled ===
                                false
                              }
                              component={
                                event.constraints?.team_find_a_team_enabled !==
                                false
                                  ? "a"
                                  : "button"
                              }
                              disableElevation
                              sx={{
                                py: 2.5,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                height: "100%",
                                borderRadius: "8px",
                                textTransform: "none",
                                boxShadow: "none",
                                bgcolor: "var(--brand)",
                                color: "#fff",
                                "&:hover": {
                                  bgcolor: "#16315a",
                                  boxShadow: "none",
                                },
                                opacity:
                                  event.constraints
                                    ?.team_find_a_team_enabled !== false
                                    ? 1
                                    : 0.55,
                                cursor:
                                  event.constraints
                                    ?.team_find_a_team_enabled !== false
                                    ? "pointer"
                                    : "not-allowed",
                              }}
                            >
                              <Box sx={{ fontSize: "2rem", mb: 1 }}>🔍</Box>
                              <Typography
                                variant="h6"
                                component="span"
                                fontWeight="bold"
                              >
                                Find a Team
                              </Typography>
                              <Typography
                                variant="body2"
                                color="inherit"
                                sx={{ opacity: 0.85, mt: 0.5 }}
                              >
                                Browse and join existing teams
                                {event.constraints?.team_find_a_team_enabled ===
                                  false && " (Closed)"}
                              </Typography>
                            </Button>
                          </Grid>

                          <Grid size={{ xs: 12, sm: 6 }}>
                            <Button
                              variant="outlined"
                              color="primary"
                              fullWidth
                              href={
                                event.constraints?.team_creation_enabled !==
                                false
                                  ? `/hack/${event_id}/manageteam`
                                  : undefined
                              }
                              disabled={
                                event.constraints?.team_creation_enabled ===
                                false
                              }
                              component={
                                event.constraints?.team_creation_enabled !==
                                false
                                  ? "a"
                                  : "button"
                              }
                              sx={{
                                py: 2.5,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                height: "100%",
                                borderRadius: "8px",
                                textTransform: "none",
                                borderWidth: 1,
                                borderColor: "var(--line)",
                                color: "var(--ink)",
                                boxShadow: "none",
                                "&:hover": {
                                  borderColor:
                                    event.constraints?.team_creation_enabled !==
                                    false
                                      ? "var(--ink)"
                                      : "var(--line)",
                                  bgcolor: "rgba(0,0,0,0.02)",
                                },
                                opacity:
                                  event.constraints?.team_creation_enabled !==
                                  false
                                    ? 1
                                    : 0.55,
                                cursor:
                                  event.constraints?.team_creation_enabled !==
                                  false
                                    ? "pointer"
                                    : "not-allowed",
                              }}
                            >
                              <Box sx={{ fontSize: "2rem", mb: 1 }}>🚀</Box>
                              <Typography
                                variant="h6"
                                component="span"
                                fontWeight="bold"
                              >
                                Manage a Team
                              </Typography>
                              <Typography
                                variant="body2"
                                color="inherit"
                                sx={{ opacity: 0.85, mt: 0.5 }}
                              >
                                Create or manage your own team
                                {event.constraints?.team_creation_enabled ===
                                  false && " (Closed)"}
                              </Typography>
                            </Button>
                          </Grid>
                        </Grid>
                      </Box>
                    </>
                  )}

                  <TeamList
                    teams={[...(event.teams || [])].sort((a, b) => {
                      // Sort active teams first, inactive teams last
                      const aActive =
                        a?.active === "True" || a?.active === true;
                      const bActive =
                        b?.active === "True" || b?.active === true;

                      if (aActive && !bActive) return -1;
                      if (!aActive && bActive) return 1;
                      return 0;
                    })}
                    event_id={event_id}
                    id={event.id}
                    endDate={event.end_date}
                    eventTimezone={event.timezone}
                    constraints={event.constraints}
                  />
                </Box>
              </LinksContainer>
            </Grid>

            {/* Donation Progress and Event Links side by side on larger screens */}
            <Grid
              container
              spacing={3}
              component="section"
              aria-labelledby="event-info-heading"
            >
              <Typography
                variant="h2"
                component="h2"
                id="event-info-heading"
                sx={{
                  position: "absolute",
                  width: "1px",
                  height: "1px",
                  padding: "0",
                  margin: "-1px",
                  overflow: "hidden",
                  clip: "rect(0, 0, 0, 0)",
                  whiteSpace: "nowrap",
                  borderWidth: "0",
                }}
              >
                Event Information
              </Typography>
              {(() => {
                const hasDonationData =
                  (event.donation_goals &&
                    Object.keys(event.donation_goals).length > 0) ||
                  (event.donation_current &&
                    Object.keys(event.donation_current).length > 0);
                const showBudgetWidget =
                  event.planning?.enabled === true &&
                  event.planning?.budget_widget_on_event_page === true;
                return hasDonationData ? (
                  <>
                    {showBudgetWidget && (
                      <Grid size={{ xs: 12 }}>
                        <PlanningBudgetEventPageWidget
                          eventId={event_id}
                          donationGoals={event.donation_goals}
                          donationCurrent={event.donation_current}
                        />
                      </Grid>
                    )}
                    <Grid size={{ xs: 12, md: 6 }}>
                      <DonationProgress
                        donationGoals={event.donation_goals}
                        donationCurrent={event.donation_current}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <EventLinks
                        links={event.links}
                        variant="event-links"
                        constraints={event.constraints}
                      />
                    </Grid>
                  </>
                ) : (
                  <Grid size={{ xs: 12 }}>
                    <EventLinks
                      links={event.links}
                      variant="event-links"
                      constraints={event.constraints}
                    />
                  </Grid>
                );
              })()}
            </Grid>
            {/* Hackathon Stats and Countdown side by side */}
            <Grid
              container
              spacing={3}
              component="section"
              aria-labelledby="event-stats-heading"
            >
              <Typography
                variant="h2"
                component="h2"
                id="event-stats-heading"
                sx={{
                  position: "absolute",
                  width: "1px",
                  height: "1px",
                  padding: "0",
                  margin: "-1px",
                  overflow: "hidden",
                  clip: "rect(0, 0, 0, 0)",
                  whiteSpace: "nowrap",
                  borderWidth: "0",
                }}
              >
                Event Timeline and Stats
              </Typography>
              {/* Order matters on mobile: Countdown first, then Stats */}
              <Grid
                size={{ xs: 12, md: 6 }}
                id="countdown"
                order={{ xs: 1, md: 2 }}
              >
                <EventCountdown
                  countdowns={event.countdowns}
                  eventId={event_id}
                  eventTimezone={event.timezone}
                />
              </Grid>
              <Grid
                size={{ xs: 12, md: 6 }}
                id="stats"
                order={{ xs: 2, md: 1 }}
              >
                {/* Set display to flex and min-height to ensure the component has proper space */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    minHeight: { md: "400px" },
                  }}
                >
                  <HackathonLeaderboard
                    eventId={event_id}
                    githubOrg={event.github_org}
                    eventName={event.title}
                    startDate={event.start_date}
                    endDate={event.end_date}
                  />
                </Box>
              </Grid>
            </Grid>
            {/* Event Constraints */}
            <Grid
              size={12}
              component="section"
              aria-labelledby="constraints-heading"
            >
              <Typography
                variant="h2"
                component="h2"
                id="constraints-heading"
                sx={{
                  position: "absolute",
                  width: "1px",
                  height: "1px",
                  padding: "0",
                  margin: "-1px",
                  overflow: "hidden",
                  clip: "rect(0, 0, 0, 0)",
                  whiteSpace: "nowrap",
                  borderWidth: "0",
                }}
              >
                Event Constraints
              </Typography>
              <EventConstraints constraints={event.constraints} />
            </Grid>

            {/* Volunteer Lists */}
            <Grid
              size={12}
              id="volunteer"
              component="section"
              aria-labelledby="volunteer-heading"
            >
              <Typography
                variant="h2"
                component="h2"
                id="volunteer-heading"
                sx={{
                  position: "absolute",
                  width: "1px",
                  height: "1px",
                  padding: "0",
                  margin: "-1px",
                  overflow: "hidden",
                  clip: "rect(0, 0, 0, 0)",
                  whiteSpace: "nowrap",
                  borderWidth: "0",
                }}
              >
                Volunteers
              </Typography>
              <VolunteerList
                event_id={event_id}
                type="volunteer"
                eventTimezone={event.timezone}
              />
            </Grid>
            <Grid
              size={12}
              id="mentor"
              component="section"
              aria-labelledby="mentor-heading"
            >
              <Typography
                variant="h2"
                component="h2"
                id="mentor-heading"
                sx={{
                  position: "absolute",
                  width: "1px",
                  height: "1px",
                  padding: "0",
                  margin: "-1px",
                  overflow: "hidden",
                  clip: "rect(0, 0, 0, 0)",
                  whiteSpace: "nowrap",
                  borderWidth: "0",
                }}
              >
                Mentors
              </Typography>
              <VolunteerList
                event_id={event_id}
                type="mentor"
                eventTimezone={event.timezone}
              />
            </Grid>
            <Grid
              size={12}
              id="judge"
              component="section"
              aria-labelledby="judge-heading"
            >
              <Typography
                variant="h2"
                component="h2"
                id="judge-heading"
                sx={{
                  position: "absolute",
                  width: "1px",
                  height: "1px",
                  padding: "0",
                  margin: "-1px",
                  overflow: "hidden",
                  clip: "rect(0, 0, 0, 0)",
                  whiteSpace: "nowrap",
                  borderWidth: "0",
                }}
              >
                Judges
              </Typography>
              <VolunteerList
                event_id={event_id}
                type="judge"
                eventTimezone={event.timezone}
              />
            </Grid>
            <Grid
              size={12}
              id="hacker"
              component="section"
              aria-labelledby="hacker-heading"
            >
              <Typography
                variant="h2"
                component="h2"
                id="hacker-heading"
                sx={{
                  position: "absolute",
                  width: "1px",
                  height: "1px",
                  padding: "0",
                  margin: "-1px",
                  overflow: "hidden",
                  clip: "rect(0, 0, 0, 0)",
                  whiteSpace: "nowrap",
                  borderWidth: "0",
                }}
              >
                Hackers
              </Typography>
              <VolunteerList
                event_id={event_id}
                type="hacker"
                eventTimezone={event.timezone}
              />
            </Grid>
            {/* FAQ */}
            <Grid
              size={12}
              id="faq"
              component="section"
              aria-labelledby="faq-heading"
            >
              <Typography
                variant="h2"
                component="h2"
                id="faq-heading"
                sx={{
                  position: "absolute",
                  width: "1px",
                  height: "1px",
                  padding: "0",
                  margin: "-1px",
                  overflow: "hidden",
                  clip: "rect(0, 0, 0, 0)",
                  whiteSpace: "nowrap",
                  borderWidth: "0",
                }}
              >
                Frequently Asked Questions
              </Typography>
              {faqData ? (
                <InteractiveFAQ
                  faqData={faqData}
                  title={`${event.title} FAQ`}
                />
              ) : (
                <LoadingPlaceholder
                  height="400px"
                  label="Loading frequently asked questions"
                />
              )}
            </Grid>
          </Grid>
        </div>
      </RefinedRoot>

      {/* Floating Navigation Component */}
      <FloatingNavigation isHackathonExpired={hackathonExpired} />
    </>
  );
}

export async function getStaticProps({ params }) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathon/${params.event_id}`,
  );

  if (res.status === 404) {
    return { notFound: true, revalidate: 60 };
  }

  if (!res.ok) {
    // Rethrow so ISR keeps serving the last good version instead of caching an error
    throw new Error(
      `Backend returned ${res.status} for event ${params.event_id}`,
    );
  }

  const data = await res.json();
  // Backend returns 200 + {} for unknown event IDs; treat as a real 404
  // so Next.js serves the built-in 404 page rather than an empty-event shell.
  if (!data || !data.id) return { notFound: true, revalidate: 60 };
  return {
    props: { eventData: data },
    revalidate: 60,
  };
}

export async function getStaticPaths() {
  try {
    // Fetch a list of all hackathon IDs
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathons`,
    );
    const data = await res.json();

    if (!res.ok) {
      console.error("Failed to fetch hackathon paths:", data);
      return {
        paths: [],
        fallback: "blocking",
      };
    }

    // Get data.hackathons if it exists, otherwise use data directly
    const hackathons = data.hackathons;

    if (!hackathons || !Array.isArray(hackathons)) {
      console.error("Invalid hackathon data format:", hackathons);
      return {
        paths: [],
        fallback: "blocking",
      };
    }

    const paths = hackathons.map((event) => ({
      // Handle case when event.event_id is null or undefined
      params: {
        event_id: event.event_id || event.id || event._id || "unknown-event",
      },
    }));

    return {
      paths,
      // Generate pages for new events on demand
      fallback: "blocking",
    };
  } catch (error) {
    console.error("Error fetching hackathon paths:", error);
    return {
      paths: [],
      fallback: "blocking",
    };
  }
}
