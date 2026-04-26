import React, { useEffect } from "react";
import Link from "next/link";
import { initFacebookPixel, trackEvent } from "../../../lib/ga";
import useHackathonEvents from "../../../hooks/use-hackathon-events";
import Moment from "moment";

import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Container,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Chip,
  Divider,
  CircularProgress,
} from "@mui/material";

import {
  BusinessRounded,
  GroupsRounded,
  LocationOnRounded,
  CalendarTodayRounded,
  ExpandMoreRounded,
  TrendingUpRounded,
} from "@mui/icons-material";

// Phoenix metro + Arizona detection — case-insensitive substring match.
const AZ_LOCATION_PATTERNS = [
  "arizona",
  "az ",
  " az",
  " az,",
  "asu",
  "tempe",
  "phoenix",
  "scottsdale",
  "mesa",
  "chandler",
  "gilbert",
  "glendale",
  "peoria",
  "polytechnic",
];
const isArizonaLocation = (loc) => {
  if (!loc) return false;
  const lower = loc.toLowerCase();
  return AZ_LOCATION_PATTERNS.some((p) => lower.includes(p));
};

const trackClick = (buttonName) => {
  trackEvent({ action: "click_arizona_hackathon", params: { button: buttonName } });
};

const formatEventDate = (startDate, endDate) => {
  const start = Moment(startDate);
  const end = Moment(endDate);

  if (start.format("YYYY-MM-DD") === end.format("YYYY-MM-DD")) {
    return start.format("dddd, MMMM Do YYYY");
  }

  return `${start.format("MMM D")} - ${end.format("MMM D, YYYY")}`;
};

const ArizonaHackathons = () => {
  const { hackathons: upcomingEvents, loading: loadingUpcoming } =
    useHackathonEvents("current");
  const { hackathons: pastEvents } = useHackathonEvents("previous");

  const upcomingAZ = (upcomingEvents || []).filter((e) =>
    isArizonaLocation(e.location)
  );

  const pastAZ = (pastEvents || []).filter((e) =>
    isArizonaLocation(e.location)
  );
  const pastAZSorted = [...pastAZ].sort(
    (a, b) => new Date(b.start_date) - new Date(a.start_date)
  );

  useEffect(() => {
    initFacebookPixel();
  }, []);

  const faqItems = [
    {
      q: "When is the next ASU hackathon?",
      a: "The next major Opportunity Hack event in Arizona is the Fall 2026 flagship hackathon, scheduled for November 14-15, 2026 at Arizona State University in Tempe. Smaller events also happen at ASU Polytechnic and downtown Phoenix throughout the year. Check the upcoming events list above or at /hack for current registration windows.",
    },
    {
      q: "Is the hackathon only for ASU students?",
      a: "No. Opportunity Hack hackathons in Arizona are open to anyone — ASU students, students from other Arizona universities (UofA, NAU, GCU), high school students 16+, working developers, designers, and career-switchers. About a third of any given Arizona hackathon is non-ASU participants.",
    },
    {
      q: "What's the cost to attend a hackathon in Arizona?",
      a: "Free for hackers, mentors, judges, and nonprofits. Food and event infrastructure are funded by corporate sponsors. Travel and accommodations are the participant's responsibility, but most Arizona hackathons are local-friendly with parking on the ASU campus and easy light-rail access.",
    },
    {
      q: "Where exactly are Opportunity Hack hackathons held in Arizona?",
      a: "The flagship fall hackathon is at ASU's Tempe campus (1151 S Forest Ave, Tempe, AZ 85281). Past events have also been held at ASU Polytechnic in Mesa, the ASU SkySong center in Scottsdale, and downtown Phoenix venues partnered with local sponsors. Specific venue details are confirmed 4-6 weeks before each event.",
    },
    {
      q: "How can my Arizona-based company sponsor a hackathon?",
      a: "Sponsorship inquiries go to /sponsor. Tiers range from category-prize sponsorship to title sponsorship. Local Arizona companies often choose sponsorship that includes dedicated mentor or judge slots for their employees — it's a popular professional-development perk that also counts toward most corporate ESG and volunteer-time programs. We can also discuss custom Arizona-only event sponsorship at /hack/request.",
    },
    {
      q: "Can my nonprofit request a hackathon project if we're not in Phoenix?",
      a: "Yes — we work with nonprofits across Arizona (and beyond). Phoenix-metro nonprofits get priority because in-person stakeholder collaboration is easier, but we've worked with organizations in Tucson, Flagstaff, and statewide. Apply at /hack/request and note your location.",
    },
    {
      q: "Are there hackathons in Arizona for beginners?",
      a: "Opportunity Hack hackathons run with a roughly 1:3 mentor-to-hacker ratio specifically so beginners can ship working code. About a third of our Arizona participants are at their first hackathon. Senior engineers handle architecture and debugging while beginners contribute alongside.",
    },
    {
      q: "How does Opportunity Hack compare to other Arizona hackathons like Hack Arizona or Devils Invent?",
      a: "Hack Arizona (UofA) and Devils Invent (ASU's engineering-college hackathon) are excellent general-purpose student hackathons focused on innovation and competition. Opportunity Hack is specifically a hackathon for social good — every project builds for a real nonprofit, every project enters our Founding Engineer program for post-hackathon continuation. The audiences and missions complement each other; we encourage participating in all three.",
    },
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ padding: "2rem", fontSize: "1em" }}>
        {/* H1 */}
        <Typography
          variant="h1"
          component="h1"
          sx={{
            fontSize: { xs: "2.5rem", md: "3.5rem" },
            fontWeight: 800,
            mb: 2,
            mt: 10,
          }}
        >
          Hackathons in Arizona
        </Typography>

        <Typography
          variant="h5"
          component="h2"
          sx={{ mb: 3, color: "text.secondary", fontWeight: 300 }}
        >
          Opportunity Hack at Arizona State University — and across the Phoenix
          metro since 2013
        </Typography>

        {/* Intro */}
        <Typography
          variant="body1"
          sx={{ fontSize: "18px", mb: 2, maxWidth: "800px", lineHeight: 1.7 }}
        >
          Arizona has one of the most active hackathon scenes in the western US,
          anchored by Arizona State University in Tempe. Opportunity Hack has
          run social-good hackathons across the Phoenix metro since 2013 — at
          ASU&apos;s main campus, the Polytechnic campus in Mesa, downtown
          Phoenix, and partner venues across Scottsdale and Tempe.
        </Typography>
        <Typography
          variant="body1"
          sx={{ fontSize: "18px", mb: 4, maxWidth: "800px", lineHeight: 1.7 }}
        >
          If you&apos;re a developer, designer, or student in Arizona looking
          for a hackathon — this is your local one. If you&apos;re an
          Arizona-based company that supports community initiatives, sponsoring
          an Opportunity Hack event is one of the most concrete ways to put
          engineering and philanthropic dollars into local nonprofits. If
          you&apos;re a Phoenix-area nonprofit that needs custom software, you
          can{" "}
          <Link href="/hack/request" style={{ color: "inherit", fontWeight: 600 }}>
            request a hackathon project
          </Link>{" "}
          and have volunteer developers build it for you — for free.
        </Typography>

        {/* Hero CTAs */}
        <Grid container spacing={2} sx={{ maxWidth: "600px", mb: 5 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              href="/hack"
              onClick={() => trackClick("register_hero")}
            >
              Register for the Next Hackathon
            </Button>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Button
              variant="outlined"
              color="primary"
              size="large"
              fullWidth
              href="/sponsor"
              onClick={() => trackClick("sponsor_hero")}
            >
              Sponsor a Local Hackathon
            </Button>
          </Grid>
        </Grid>

        {/* Section 1 — Upcoming */}
        <Box sx={{ mb: 5 }} id="upcoming">
          <Typography variant="h3" component="h2" gutterBottom>
            Upcoming Hackathons in Arizona
          </Typography>

          {loadingUpcoming ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
              <CircularProgress />
            </Box>
          ) : upcomingAZ.length > 0 ? (
            <Grid container spacing={3}>
              {upcomingAZ.map((event) => (
                <Grid size={{ xs: 12, md: 6 }} key={event.event_id}>
                  <Card sx={{ height: "100%" }}>
                    <CardContent>
                      <Typography variant="h5" gutterBottom>
                        {event.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ mb: 1, display: "flex", alignItems: "center" }}
                      >
                        <LocationOnRounded sx={{ mr: 0.5, fontSize: 16 }} />
                        {event.location}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ mb: 3, display: "flex", alignItems: "center" }}
                      >
                        <CalendarTodayRounded sx={{ mr: 0.5, fontSize: 16 }} />
                        {formatEventDate(event.start_date, event.end_date)}
                      </Typography>
                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        <Button
                          variant="contained"
                          color="primary"
                          href={`/hack/${event.event_id}/hacker-application`}
                          onClick={() => trackClick("register_event")}
                        >
                          Register
                        </Button>
                        <Button
                          variant="outlined"
                          href={`/hack/${event.event_id}`}
                          onClick={() => trackClick("event_details")}
                        >
                          Event Details
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Alert severity="info">
              <Typography variant="body1" gutterBottom>
                <strong>No Arizona hackathons currently on the calendar.</strong>{" "}
                The next confirmed Arizona event is the{" "}
                <strong>
                  Fall 2026 flagship hackathon at ASU on November 14-15, 2026
                </strong>
                . Registration opens roughly 8 weeks in advance — check back in
                September 2026 or{" "}
                <Link href="/hack" style={{ color: "inherit", fontWeight: 600 }}>
                  browse all upcoming events
                </Link>{" "}
                for online and out-of-state options in the meantime.
              </Typography>
            </Alert>
          )}
        </Box>

        <Divider sx={{ my: 5 }} />

        {/* Section 2 — Past */}
        <Box sx={{ mb: 5 }}>
          <Typography variant="h3" component="h2" gutterBottom>
            Past Hackathons in Arizona
          </Typography>
          <Typography
            variant="body1"
            sx={{ fontSize: "18px", mb: 4, lineHeight: 1.7 }}
          >
            Opportunity Hack has run hackathons in Arizona for over a decade.
            Below are past events held in the state — by event team, by
            location, and by year.
          </Typography>

          {pastAZSorted.length > 0 ? (
            <Grid container spacing={3}>
              {pastAZSorted.slice(0, 12).map((event) => (
                <Grid size={{ xs: 12, md: 4 }} key={event.event_id}>
                  <Card sx={{ height: "100%" }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {event.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ mb: 1, display: "flex", alignItems: "center" }}
                      >
                        <LocationOnRounded sx={{ mr: 0.5, fontSize: 16 }} />
                        {event.location}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ mb: 2, display: "flex", alignItems: "center" }}
                      >
                        <CalendarTodayRounded sx={{ mr: 0.5, fontSize: 16 }} />
                        {formatEventDate(event.start_date, event.end_date)}
                      </Typography>
                      <Chip
                        label={Moment(event.start_date).format("YYYY")}
                        size="small"
                        variant="outlined"
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Past Arizona event archive loading from the events database…
            </Typography>
          )}

          <Box sx={{ mt: 4, textAlign: "center" }}>
            <Button
              variant="outlined"
              color="primary"
              href="/hack"
              onClick={() => trackClick("view_all_past")}
            >
              View All Past Hackathons
            </Button>
          </Box>
        </Box>

        <Divider sx={{ my: 5 }} />

        {/* Section 3 — Why ASU Tempe */}
        <Box sx={{ mb: 5 }}>
          <Typography variant="h3" component="h2" gutterBottom>
            Why ASU Tempe is the Anchor Venue
          </Typography>
          <Typography
            variant="body1"
            sx={{ fontSize: "18px", mb: 2, maxWidth: "800px", lineHeight: 1.7 }}
          >
            Arizona State University&apos;s Tempe campus has been Opportunity
            Hack&apos;s primary venue since the program&apos;s founding.
            ASU&apos;s Fulton Schools of Engineering — one of the largest
            engineering schools in the US by enrollment — provides a constant
            pipeline of student volunteers, and the university&apos;s nonprofit
            partnerships in Maricopa County give us a steady stream of real
            problem statements to build against.
          </Typography>
          <Typography
            variant="body1"
            sx={{ fontSize: "18px", mb: 4, maxWidth: "800px", lineHeight: 1.7 }}
          >
            Tempe is also one of the more accessible hackathon venues in the
            southwest: 15 minutes from Sky Harbor Airport, walking distance from
            Mill Avenue, and connected to Phoenix and Mesa via light rail. Local
            sponsors include companies that hire heavily from ASU and want
            recruiting access; local nonprofits include both campus-adjacent
            organizations and Maricopa County programs serving Phoenix-area
            residents.
          </Typography>

          <Box sx={{ textAlign: "center" }}>
            <Box
              component="img"
              src="https://cdn.ohack.dev/ohack.dev/2024_hackathon_2.webp"
              alt="Hackathon participants at Arizona State University Tempe campus during an Opportunity Hack social-good hackathon"
              sx={{
                width: "100%",
                maxWidth: 800,
                height: "auto",
                borderRadius: 2,
                boxShadow: 3,
              }}
            />
          </Box>
        </Box>

        <Divider sx={{ my: 5 }} />

        {/* Section 4 — For Companies */}
        <Paper sx={{ bgcolor: "primary.light", color: "white", p: 5, mb: 5 }}>
          <Typography variant="h3" component="h2" gutterBottom sx={{ color: "white" }}>
            For Arizona Companies: Sponsor a Local Hackathon
          </Typography>
          <Typography variant="h5" component="h3" gutterBottom sx={{ color: "white", fontWeight: 600 }}>
            Local Sponsorship Drives Local Impact
          </Typography>
          <Typography
            variant="body1"
            sx={{ fontSize: "18px", mb: 2, color: "white", lineHeight: 1.7 }}
          >
            Arizona-based companies — especially those with a stated commitment
            to community engagement — are exactly the right fit for Opportunity
            Hack sponsorship. A sponsorship dollar at OHack stays in the Phoenix
            metro: it funds a hackathon that builds free software for Arizona
            nonprofits, with mentor and judge slots staffed by local senior
            engineers, often from your own company. The work is concrete, the
            recipients are local, and the engineering hours are tracked and
            reportable.
          </Typography>
          <Typography
            variant="body1"
            sx={{ fontSize: "18px", mb: 4, color: "white", lineHeight: 1.7 }}
          >
            If your company has community engagement programs, a corporate
            volunteer-time policy, or recruiting interest in ASU graduates,
            sponsoring an Arizona hackathon hits all three at once.
          </Typography>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Button
              variant="contained"
              sx={{ bgcolor: "white", color: "primary.main" }}
              href="/sponsor"
              onClick={() => trackClick("view_sponsorship_tiers")}
            >
              View Sponsorship Tiers
            </Button>
            <Button
              variant="outlined"
              sx={{ borderColor: "white", color: "white" }}
              href="/hack/request"
              onClick={() => trackClick("request_custom_hackathon")}
            >
              Request a Custom Hackathon
            </Button>
          </Box>
        </Paper>

        {/* Section 5 — For Nonprofits */}
        <Box sx={{ mb: 5 }}>
          <Typography variant="h3" component="h2" gutterBottom>
            For Arizona Nonprofits: Request a Hackathon Project
          </Typography>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ height: "100%", p: 1 }}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <BusinessRounded color="primary" sx={{ mr: 2, fontSize: 36 }} />
                    <Typography variant="h5" component="h3">
                      Step 1: Apply
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                    Submit your problem statement at{" "}
                    <Link
                      href="/hack/request"
                      style={{ color: "inherit", fontWeight: 600 }}
                    >
                      /hack/request
                    </Link>
                    . Any 501(c)(3) headquartered or operating in Arizona is
                    eligible — we&apos;re partial to Phoenix-metro organizations
                    because they&apos;re easiest to support post-hackathon, but
                    statewide is fine.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ height: "100%", p: 1 }}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <GroupsRounded color="primary" sx={{ mr: 2, fontSize: 36 }} />
                    <Typography variant="h5" component="h3">
                      Step 2: Get Matched
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                    4-8 weeks before the next hackathon, we match your problem to
                    a team of volunteer engineers — typically 3-5 hackers with
                    mentors drawn from senior engineers at Arizona tech companies.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ height: "100%", p: 1 }}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <TrendingUpRounded color="primary" sx={{ mr: 2, fontSize: 36 }} />
                    <Typography variant="h5" component="h3">
                      Step 3: Build &amp; Continue
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                    The hackathon weekend produces a working prototype. The
                    Founding Engineer program continues development for weeks
                    afterward. Your nonprofit owns the code, no fees, no
                    contracts.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Box sx={{ textAlign: "center" }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              href="/hack/request"
              onClick={() => trackClick("request_nonprofit_hackathon")}
            >
              Request a Hackathon for Your Nonprofit
            </Button>
          </Box>
        </Box>

        <Divider sx={{ my: 5 }} />

        {/* Section 6 — FAQ */}
        <Box sx={{ mb: 5 }}>
          <Typography variant="h3" component="h2" gutterBottom>
            Frequently Asked Questions
          </Typography>

          {faqItems.map((item, idx) => (
            <Accordion key={idx} sx={{ mb: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreRounded />}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {item.q}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1" sx={{ fontSize: "16px", lineHeight: 1.7 }}>
                  {item.a}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>

        {/* Final CTA */}
        <Box sx={{ textAlign: "center", mb: 5 }}>
          <Typography variant="h4" component="h2" gutterBottom>
            Three Ways to Engage with Hackathons in Arizona
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontSize: "18px",
              mb: 4,
              maxWidth: "600px",
              mx: "auto",
              color: "text.secondary",
            }}
          >
            Whether you&apos;re building, sponsoring, or seeking a free software
            project for your nonprofit — there&apos;s a path here.
          </Typography>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Button
              variant="contained"
              size="large"
              color="primary"
              href="/hack"
              onClick={() => trackClick("see_upcoming_final")}
              sx={{ fontSize: "16px" }}
            >
              See Upcoming Hackathons
            </Button>
            <Button
              variant="outlined"
              size="large"
              href="/sponsor"
              onClick={() => trackClick("sponsor_final")}
              sx={{ fontSize: "16px" }}
            >
              Sponsor an Arizona Hackathon
            </Button>
            <Button
              variant="outlined"
              size="large"
              href="/hack/request"
              onClick={() => trackClick("request_nonprofit_final")}
              sx={{ fontSize: "16px" }}
            >
              Request a Hackathon for Your Nonprofit
            </Button>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default ArizonaHackathons;

export const getStaticProps = async () => {
  const title =
    "Hackathons in Arizona — ASU & Phoenix | Opportunity Hack";
  const description =
    "Arizona's longest-running hackathon for social good, hosted at ASU in Tempe each fall. Past events at ASU Polytechnic, downtown Phoenix, and Scottsdale. Free to attend, open to all skill levels.";
  const canonicalUrl = "https://www.ohack.dev/hackathons/arizona";
  const ogImage = "https://cdn.ohack.dev/ohack.dev/2024_hackathon_2.webp";

  return {
    props: {
      title,
      description,
      canonical: canonicalUrl,
      openGraphData: [
        { name: "title", property: "title", content: title, key: "title" },
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
          content: ogImage,
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
          content: canonicalUrl,
          key: "url",
        },
        {
          name: "og:url",
          property: "og:url",
          content: canonicalUrl,
          key: "ogurl",
        },
        { property: "og:type", content: "website", key: "ogtype" },
        {
          name: "twitter:card",
          property: "twitter:card",
          content: "summary_large_image",
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
          content: ogImage,
          key: "twitterimage",
        },
        {
          name: "twitter:image:alt",
          property: "twitter:image:alt",
          content:
            "Hackathon participants at Arizona State University Tempe campus during an Opportunity Hack social-good hackathon",
          key: "twitterimagealt",
        },
        {
          name: "twitter:creator",
          property: "twitter:creator",
          content: "@opportunityhack",
          key: "twittercreator",
        },
        {
          name: "keywords",
          property: "keywords",
          content:
            "asu hackathon, phoenix hackathon, hack arizona, hackathons in arizona, tempe hackathon, hackathons near me phoenix, arizona hackathon, asu tempe hackathon, scottsdale hackathon",
          key: "keywords",
        },
      ],
      structuredData: {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebPage",
            "@id": canonicalUrl + "#webpage",
            url: canonicalUrl,
            name: title,
            description: description,
            isPartOf: {
              "@type": "WebSite",
              "@id": "https://www.ohack.dev/#website",
            },
            about: {
              "@type": "Place",
              name: "Arizona",
              address: {
                "@type": "PostalAddress",
                addressRegion: "AZ",
                addressCountry: "US",
              },
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
                name: "Hackathons",
                item: "https://www.ohack.dev/hack",
              },
              {
                "@type": "ListItem",
                position: 3,
                name: "Arizona",
                item: canonicalUrl,
              },
            ],
          },
          {
            "@type": "Event",
            name: "Opportunity Hack Fall 2026 Hackathon at ASU",
            startDate: "2026-11-14T09:00:00-07:00",
            endDate: "2026-11-15T18:00:00-07:00",
            eventAttendanceMode:
              "https://schema.org/OfflineEventAttendanceMode",
            eventStatus: "https://schema.org/EventScheduled",
            location: {
              "@type": "Place",
              name: "Arizona State University, Tempe Campus",
              address: {
                "@type": "PostalAddress",
                streetAddress: "1151 S Forest Ave",
                addressLocality: "Tempe",
                addressRegion: "AZ",
                postalCode: "85281",
                addressCountry: "US",
              },
              geo: {
                "@type": "GeoCoordinates",
                latitude: 33.4242,
                longitude: -111.9281,
              },
            },
            image: ogImage,
            description:
              "Annual social-good hackathon at Arizona State University.",
            organizer: {
              "@type": "Organization",
              name: "Opportunity Hack",
              url: "https://www.ohack.dev",
            },
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
              url: "https://www.ohack.dev/hack",
              availability: "https://schema.org/InStock",
              validFrom: "2026-08-01",
            },
          },
          {
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "When is the next ASU hackathon?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "The next major Opportunity Hack event in Arizona is the Fall 2026 flagship hackathon, scheduled for November 14-15, 2026 at Arizona State University in Tempe. Smaller events also happen at ASU Polytechnic and downtown Phoenix throughout the year. Check the upcoming events list above or at /hack for current registration windows.",
                },
              },
              {
                "@type": "Question",
                name: "Is the hackathon only for ASU students?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "No. Opportunity Hack hackathons in Arizona are open to anyone — ASU students, students from other Arizona universities (UofA, NAU, GCU), high school students 16+, working developers, designers, and career-switchers. About a third of any given Arizona hackathon is non-ASU participants.",
                },
              },
              {
                "@type": "Question",
                name: "What's the cost to attend a hackathon in Arizona?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Free for hackers, mentors, judges, and nonprofits. Food and event infrastructure are funded by corporate sponsors. Travel and accommodations are the participant's responsibility, but most Arizona hackathons are local-friendly with parking on the ASU campus and easy light-rail access.",
                },
              },
              {
                "@type": "Question",
                name: "Where exactly are Opportunity Hack hackathons held in Arizona?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "The flagship fall hackathon is at ASU's Tempe campus (1151 S Forest Ave, Tempe, AZ 85281). Past events have also been held at ASU Polytechnic in Mesa, the ASU SkySong center in Scottsdale, and downtown Phoenix venues partnered with local sponsors. Specific venue details are confirmed 4-6 weeks before each event.",
                },
              },
              {
                "@type": "Question",
                name: "How can my Arizona-based company sponsor a hackathon?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Sponsorship inquiries go to /sponsor. Tiers range from category-prize sponsorship to title sponsorship. Local Arizona companies often choose sponsorship that includes dedicated mentor or judge slots for their employees — it's a popular professional-development perk that also counts toward most corporate ESG and volunteer-time programs. We can also discuss custom Arizona-only event sponsorship at /hack/request.",
                },
              },
              {
                "@type": "Question",
                name: "Can my nonprofit request a hackathon project if we're not in Phoenix?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes — we work with nonprofits across Arizona (and beyond). Phoenix-metro nonprofits get priority because in-person stakeholder collaboration is easier, but we've worked with organizations in Tucson, Flagstaff, and statewide. Apply at /hack/request and note your location.",
                },
              },
              {
                "@type": "Question",
                name: "Are there hackathons in Arizona for beginners?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Opportunity Hack hackathons run with a roughly 1:3 mentor-to-hacker ratio specifically so beginners can ship working code. About a third of our Arizona participants are at their first hackathon. Senior engineers handle architecture and debugging while beginners contribute alongside.",
                },
              },
              {
                "@type": "Question",
                name: "How does Opportunity Hack compare to other Arizona hackathons like Hack Arizona or Devils Invent?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Hack Arizona (UofA) and Devils Invent (ASU's engineering-college hackathon) are excellent general-purpose student hackathons focused on innovation and competition. Opportunity Hack is specifically a hackathon for social good — every project builds for a real nonprofit, every project enters our Founding Engineer program for post-hackathon continuation. The audiences and missions complement each other; we encourage participating in all three.",
                },
              },
            ],
          },
        ],
      },
    },
  };
};
