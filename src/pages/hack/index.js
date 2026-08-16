import { FONT_BODY, FONT_DISPLAY } from "../../styles/fonts";
import React, { useEffect } from "react";
import Head from "next/head";
import {
  Typography,
  Box,
  Button,
  Grid,
  Paper,
  Card,
  CardContent,
} from "@mui/material";
import { initFacebookPixel, trackEvent } from "../../lib/ga";
import {
  TitleContainer,
  LayoutContainer,
  ProjectsContainer,
} from "../../styles/nonprofit/styles";
import HackathonList from "../../components/HackathonList/HackathonList";
import HackathonStoryStrip from "../../components/HackathonList/HackathonStoryStrip";
import PreviousHackathonList from "../../components/HackathonList/PreviousHackathonList";
import HackPageNav from "../../components/HackathonList/HackPageNav";
import Link from "next/link";
import {
  EventAvailable,
  Code,
  Group,
  EmojiEvents,
  Gavel,
  CameraAlt,
  Business,
  Policy,
} from "@mui/icons-material";
import { RefinedFonts } from "../../components/design/refined";

// Refined "civic editorial" tokens used inline here (this page keeps its
// bespoke finder structure + HackPageNav, so we harmonize palette/type rather
// than wrap it in <RefinedRoot>). See docs/refined-design-system.md.
const RX = {
  ink: "#16181D",
  brand: "#1B3A6B",
  accent: "#E2552E",
  line: "#E7E1D4",
  surface2: "#F4F1E9",
  muted: "#5B6270",
  paper: "#FBFAF6",
  display: FONT_DISPLAY,
};

const HackathonIndex = ({ nextEvent }) => {
  const style = { fontSize: "15px" };

  useEffect(() => {
    initFacebookPixel();
  }, []);

  const track = (action, label) => {
    trackEvent({
      action: `hack_${action}`,
      params: { event_label: label, page: "hack" },
    });
  };

  return (
    <Box
      sx={{
        // Mobile horizontal-overflow guard for the WHOLE /hack page. Some
        // descendants (the EventFeature upcoming-event cards in particular)
        // have intrinsic min-content widths wider than a phone viewport.
        // Without this clip, the page horizontally scrolls and the Story
        // Strip + archive look cut off. Clipping at the page root is safer
        // than touching shared layout styles or rewriting EventFeature.
        // We can't put this on LayoutContainer (styled Grid sx overrides
        // are unreliable through its existing styled chain), so we put a
        // plain Box around everything.
        overflowX: "hidden",
        width: "100%",
        maxWidth: "100%",
        backgroundColor: RX.paper,
      }}
    >
      <LayoutContainer key="hackathons" container>
        <HackPageNav />
        <Head>
          <RefinedFonts />
          <title>
            Opportunity Hack - Global Hackathons Including Phoenix & ASU Events
          </title>
          <meta
            name="description"
            content="Join Opportunity Hack's innovative global hackathons, including events in Phoenix and at ASU. Unite with tech enthusiasts worldwide to create sustainable solutions for nonprofits."
          />
          <meta
            name="keywords"
            content="Opportunity Hack, global hackathons, Phoenix hackathon, Arizona hackathon, ASU hackathon, nonprofit solutions, tech for good, social impact, coding for nonprofits, volunteer coding, tech volunteering"
          />
          <meta
            property="og:title"
            content="Opportunity Hack - Global Hackathons Including Phoenix & ASU Events"
          />
          <meta
            property="og:description"
            content="Join Opportunity Hack's innovative global hackathons, including events in Phoenix and at ASU. Create sustainable tech solutions for nonprofits worldwide."
          />
          <meta
            property="og:image"
            content="https://cdn.ohack.dev/ohack.dev/2023_hackathon_2.webp"
          />
          <meta property="og:url" content="https://www.ohack.dev/hack" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta
            name="twitter:title"
            content="Opportunity Hack - Global Hackathons for Social Impact"
          />
          <meta
            name="twitter:description"
            content="Join tech volunteers to create solutions for nonprofits at our global hackathons."
          />
          <link rel="canonical" href="https://www.ohack.dev/hack" />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(buildEventSchema(nextEvent)),
            }}
          />
        </Head>

        <TitleContainer
          container
          sx={{ pt: { xs: 3, md: 5 }, pb: { xs: 2, md: 2 } }}
        >
          <Typography
            sx={{
              fontFamily: FONT_BODY,
              textTransform: "uppercase",
              letterSpacing: "0.22em",
              fontSize: "0.72rem",
              fontWeight: 600,
              color: RX.muted,
              mb: 1.5,
            }}
          >
            Opportunity Hack · global hackathons
          </Typography>
          <Typography
            variant="h1"
            component="h1"
            sx={{
              fontFamily: RX.display,
              fontWeight: 500,
              letterSpacing: "-0.015em",
              fontSize: { xs: "2.2rem", sm: "3rem", md: "3.6rem" },
              mb: { xs: 2, md: 2.5 },
              lineHeight: 1.05,
              color: RX.ink,
            }}
          >
            Hackathons{" "}
            <span style={{ fontStyle: "italic", color: RX.accent }}>
              for nonprofits.
            </span>
          </Typography>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 1.5,
              justifyContent: "center",
              flexWrap: "wrap",
              maxWidth: 560,
              mx: "auto",
            }}
          >
            <Button
              variant="contained"
              disableElevation
              size="large"
              href="#upcoming-events"
              startIcon={<EventAvailable />}
              onClick={(e) => {
                e.preventDefault();
                track("cta_click", "view_upcoming_events");
                document
                  .getElementById("upcoming-events")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                borderRadius: "5px",
                bgcolor: RX.brand,
                "&:hover": { bgcolor: "#16315a" },
              }}
            >
              See upcoming events
            </Button>
            <Button
              variant="outlined"
              size="large"
              href="/signup"
              startIcon={<Group />}
              onClick={() => track("cta_click", "join_community")}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                borderRadius: "5px",
                color: RX.ink,
                borderColor: RX.line,
                "&:hover": { borderColor: RX.ink, bgcolor: "rgba(0,0,0,0.02)" },
              }}
            >
              Join the community
            </Button>
          </Box>
        </TitleContainer>

        <ProjectsContainer style={{ marginTop: 12, width: "100%" }}>
          {/* Upcoming Events — first in flow so visitors landing here find an
            event to join without scrolling past marketing copy. */}
          <Box
            id="upcoming-events"
            component="section"
            aria-labelledby="upcoming-events-heading"
            mb={3}
            sx={{ scrollMarginTop: 100 }}
          >
            <HackathonList />
          </Box>

          {/* Story Strip — bridges upcoming and previous with aggregate impact stats
            and a clickable year sparkline that jumps into the archive below. */}
          <HackathonStoryStrip />

          {/* Previous Events Section - Positioned right after Upcoming Events for better content grouping */}
          <Box mb={5}>
            <PreviousHackathonList />
          </Box>
        </ProjectsContainer>

        {/* About These Events — merged "Why Join" + "Before You Join".
          Both are context, not finder-flow: positioned after the archive so
          the first-scroll experience is hero → events → impact → past, and
          this section catches users who scrolled deep. */}
        <Box
          id="about-events"
          component="section"
          aria-labelledby="about-events-heading"
          sx={{ mt: 5, mb: 5, px: 2, scrollMarginTop: 100 }}
        >
          <Typography
            id="about-events-heading"
            variant="h4"
            component="h2"
            gutterBottom
            sx={{
              textAlign: "center",
              mb: 1,
              fontFamily: RX.display,
              fontWeight: 500,
              letterSpacing: "-0.01em",
              color: RX.ink,
            }}
          >
            About these events
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ textAlign: "center", mb: 4, maxWidth: 720, mx: "auto" }}
          >
            What you get out of joining — and the quick reads to skim before you
            sign up.
          </Typography>

          {/* What you get — compact 4-up icon row (no big photo, no h3 per item).
            The Story Strip above already proves the scale with numbers, so
            this is descriptive complement, not the headline. */}
          <Box sx={{ maxWidth: 1000, mx: "auto", mb: 5 }}>
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{
                display: "block",
                mb: 1.5,
                textAlign: "center",
                letterSpacing: 1,
              }}
            >
              What you get
            </Typography>
            <Grid container spacing={2}>
              {[
                {
                  icon: <Code color="primary" />,
                  title: "Build real solutions",
                  desc: "Software nonprofits actually deploy — not throwaway demos.",
                },
                {
                  icon: <Group color="primary" />,
                  title: "Global community",
                  desc: "Developers, designers, and nonprofit leads from around the world.",
                },
                {
                  icon: <EmojiEvents color="primary" />,
                  title: "Skill development",
                  desc: "Learn shipping with real users, deadlines, and constraints.",
                },
                {
                  icon: <EventAvailable color="primary" />,
                  title: "Career growth",
                  desc: "Network with sponsors and ship a portfolio piece worth talking about.",
                },
              ].map((item) => (
                <Grid key={item.title} size={{ xs: 12, sm: 6, md: 3 }}>
                  <Box
                    sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}
                  >
                    <Box sx={{ flexShrink: 0, mt: 0.25 }}>{item.icon}</Box>
                    <Box>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 700, mb: 0.25 }}
                      >
                        {item.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.desc}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Before signing up — the three legal/safety reads. Same cards as
            before, just under a different heading and reduced visual weight
            (this is a "skim before signup" thing, not the page's hero). */}
          <Box sx={{ maxWidth: 900, mx: "auto" }}>
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{
                display: "block",
                mb: 1.5,
                textAlign: "center",
                letterSpacing: 1,
              }}
            >
              Before signing up
            </Typography>
            <Grid container spacing={2}>
              {[
                {
                  icon: <Policy color="primary" sx={{ fontSize: 32 }} />,
                  title: "Code of Conduct",
                  desc: "Community guidelines for respectful collaboration",
                  href: "/hack/code-of-conduct",
                  cta: "Read guidelines",
                  tracker: "code_of_conduct",
                },
                {
                  icon: <Gavel color="action" sx={{ fontSize: 32 }} />,
                  title: "Liability Waiver",
                  desc: "Standard protection for in-person events",
                  href: "/hack/liability-waiver",
                  cta: "View waiver",
                  tracker: "liability_waiver",
                },
                {
                  icon: <CameraAlt color="action" sx={{ fontSize: 32 }} />,
                  title: "Photo Release",
                  desc: "Permission to share event photos",
                  href: "/hack/photo-release",
                  cta: "Photo policy",
                  tracker: "photo_release",
                },
              ].map((item) => (
                <Grid key={item.title} size={{ xs: 12, md: 4 }}>
                  <Card
                    sx={{
                      height: "100%",
                      textAlign: "center",
                      "&:hover": { boxShadow: 3 },
                      transition: "box-shadow 0.3s",
                    }}
                  >
                    <CardContent>
                      <Box sx={{ mb: 1 }}>{item.icon}</Box>
                      <Typography
                        variant="subtitle1"
                        gutterBottom
                        sx={{ fontWeight: 600 }}
                      >
                        {item.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                      >
                        {item.desc}
                      </Typography>
                      <Button
                        variant="outlined"
                        component={Link}
                        href={item.href}
                        fullWidth
                        size="small"
                        onClick={() => track("cta_click", item.tracker)}
                        sx={{ textTransform: "none" }}
                      >
                        {item.cta}
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>

        {/* Support Our Mission Section - Appropriate for secondary audience */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, md: 6 },
            mt: 5,
            bgcolor: RX.brand,
            color: "#fff",
            textAlign: "center",
            borderRadius: 2,
          }}
        >
          <Typography
            sx={{
              fontFamily: RX.display,
              fontWeight: 500,
              fontSize: { xs: "1.6rem", md: "2rem" },
              mb: 1.5,
              color: "#fff",
            }}
          >
            Support our mission
          </Typography>
          <Typography
            variant="body1"
            sx={{
              mb: 3,
              maxWidth: "600px",
              mx: "auto",
              color: "rgba(255,255,255,0.85)",
            }}
          >
            Help us keep organizing impactful hackathons. Partner with us to
            support the next generation of social-impact technologists.
          </Typography>
          <Button
            variant="contained"
            disableElevation
            size="large"
            component={Link}
            href="/sponsor"
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: "5px",
              bgcolor: "#fff",
              color: RX.brand,
              "&:hover": { bgcolor: "#f0ece2" },
            }}
            onClick={() => track("cta_click", "become_sponsor")}
          >
            Become a sponsor
          </Button>
        </Paper>
      </LayoutContainer>
    </Box>
  );
};

export default HackathonIndex;

// Build Event schema from the next upcoming hackathon returned by getStaticProps.
// Falls back gracefully when the API is unavailable at build time.
function buildEventSchema(event) {
  const isVirtual = !event?.location || /online|virtual/i.test(event.location);

  // Date-only strings from the API (e.g. "2026-11-14") get a time appended so
  // Google sees a full ISO datetime rather than a bare date.
  const startDate = event?.start_date
    ? event.start_date.includes("T")
      ? event.start_date
      : `${event.start_date}T09:00:00`
    : null;
  const endDate = event?.end_date
    ? event.end_date.includes("T")
      ? event.end_date
      : `${event.end_date}T18:00:00`
    : null;

  const eventUrl = event?.event_id
    ? `https://www.ohack.dev/hack/${event.event_id}`
    : "https://www.ohack.dev/hack";

  const location = isVirtual
    ? [{ "@type": "VirtualLocation", url: eventUrl }]
    : [
        { "@type": "VirtualLocation", url: eventUrl },
        { "@type": "Place", name: event.location },
      ];

  const schema = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event?.title || "Opportunity Hack Global Hackathons",
    description:
      event?.description ||
      "Opportunity Hack hosts impactful hackathons globally where tech volunteers create solutions for nonprofits.",
    image:
      event?.image_url ||
      "https://cdn.ohack.dev/ohack.dev/2023_hackathon_2.webp",
    url: eventUrl,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: isVirtual
      ? "https://schema.org/OnlineEventAttendanceMode"
      : "https://schema.org/MixedEventAttendanceMode",
    location,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      url: eventUrl,
      availability: "https://schema.org/InStock",
    },
    organizer: {
      "@type": "Organization",
      name: "Opportunity Hack",
      url: "https://www.ohack.dev",
    },
  };

  if (startDate) schema.startDate = startDate;
  if (endDate) schema.endDate = endDate;

  return schema;
}

export async function getStaticProps() {
  const API_URL = process.env.NEXT_PUBLIC_API_SERVER_URL;
  let nextEvent = null;
  try {
    const res = await fetch(`${API_URL}/api/messages/hackathons?current=true`, {
      headers: { Accept: "application/json" },
    });
    if (res.ok) {
      const data = await res.json();
      const hackathons = data.hackathons || data || [];
      const today = new Date().toISOString().slice(0, 10);
      // Prefer future events; fall back to most-recent past event.
      const upcoming = hackathons
        .filter((h) => h.start_date >= today)
        .sort((a, b) => a.start_date.localeCompare(b.start_date));
      nextEvent =
        upcoming[0] ||
        hackathons.sort((a, b) =>
          b.start_date.localeCompare(a.start_date),
        )[0] ||
        null;
    }
  } catch (_) {
    // API unavailable at build time — schema will render without dates.
  }
  return {
    props: { nextEvent },
    revalidate: 3600,
  };
}
