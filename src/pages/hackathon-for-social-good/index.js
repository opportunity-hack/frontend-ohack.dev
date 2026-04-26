import React, { useEffect } from "react";
import Link from "next/link";
import { initFacebookPixel, trackEvent } from "../../lib/ga";

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
} from "@mui/material";

import {
  BusinessRounded,
  GroupsRounded,
  TrendingUpRounded,
  BalanceRounded,
  EventRounded,
  ExpandMoreRounded,
} from "@mui/icons-material";

const trackClick = (buttonName) => {
  trackEvent({ action: "click_hackathon_for_social_good", params: { button: buttonName } });
};

const faqItems = [
  {
    q: 'What is a "hackathon for social good"?',
    a: "A hackathon for social good is an event where teams build software addressing a charitable, civic, environmental, or community problem — typically for a nonprofit, NGO, or public-sector organization. Opportunity Hack runs the longest-running version of this format in the US, with the distinguishing feature that projects continue past the hackathon weekend through our Founding Engineer program.",
  },
  {
    q: "When and where is the next Opportunity Hack hackathon?",
    a: "The annual flagship hackathon for social good is November 14-15, 2026 at Arizona State University in Tempe, AZ. Registration opens roughly 8 weeks before the event. Smaller and more frequent online events also happen throughout the year.",
  },
  {
    q: "Do I need experience to participate as a developer?",
    a: "No. Opportunity Hack runs with a high mentor-to-hacker ratio (roughly 1:3) specifically so beginner developers can ship real working code. About a third of our participants in any given event are at their first hackathon. Senior engineers handle architecture and debugging; beginners contribute code, design, and project work alongside them.",
  },
  {
    q: "Is the hackathon free to attend?",
    a: "Yes — for hackers, mentors, judges, and nonprofits the event is free. Food, swag, and event infrastructure are funded by corporate sponsors. Travel and accommodations are the participant's responsibility, though regional participants typically can attend without travel.",
  },
  {
    q: "What happens to the projects after the hackathon ends?",
    a: "Successful projects enter our Founding Engineer program — one or two volunteer engineers continue working with the nonprofit for weeks or months after the event, deploying the project to production, fixing bugs, and training the nonprofit's staff. Some projects deploy as-is from the hackathon weekend; others take 4-12 weeks to reach production.",
  },
  {
    q: "Can my company sponsor the hackathon for social good?",
    a: "Yes — sponsorship is the primary funding model. Tiers range from category-prize sponsorship to full event title sponsorship. Sponsors get logo presence, dedicated mentor/judge slots for their teams (a popular professional development perk), and recruiting access to participants. See sponsorship details at /sponsor.",
  },
  {
    q: "What technology stack does the hackathon use?",
    a: "Whatever the team picks. We don't mandate a stack. Most teams use a web stack (React/Next.js, Node, Postgres, etc.) because that's what nonprofits can host most cheaply, but mobile, data-pipeline, and even hardware projects have shipped at past events. The judging rubric is technology-agnostic.",
  },
  {
    q: 'How is this different from a corporate "hackathon for good" event?',
    a: "Corporate hack-for-good events are typically internal, single-company, with employees building speculative ideas. Opportunity Hack is external and cross-company, with developers from many organizations building for actual nonprofit clients. The depth of mentor support, the post-event continuation program, and the 13-year track record are also distinguishing.",
  },
];

const HackathonForSocialGood = () => {
  useEffect(() => {
    initFacebookPixel();
  }, []);

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
          Hackathon for Social Good
        </Typography>

        <Typography
          variant="h5"
          component="h2"
          sx={{ mb: 3, color: "text.secondary", fontWeight: 300 }}
        >
          The annual flagship hackathon where developers, designers, and nonprofits build software that ships
        </Typography>

        {/* Intro */}
        <Typography variant="body1" sx={{ fontSize: "18px", mb: 2, maxWidth: "800px", lineHeight: 1.7 }}>
          A hackathon for social good isn{"'"}t just a hackathon with a charitable theme — it{"'"}s an event
          where the projects keep running after the demo ends. Most hackathons celebrate the prototype.
          Opportunity Hack celebrates what happens <em>after</em> the prototype: the nonprofit deploying
          the tool, the volunteers continuing to maintain it, the staff hours saved every week from then on.
        </Typography>
        <Typography variant="body1" sx={{ fontSize: "18px", mb: 4, maxWidth: "800px", lineHeight: 1.7 }}>
          We{"'"}ve been running this model since 2013. Over 3,000 developers, designers, and engineers have
          built software for more than 200 nonprofits across our weekend hackathons and the year-round
          Founding Engineer program that follows. The annual flagship event lands each fall at ASU in
          Tempe, Arizona — the next one is <strong>November 14-15, 2026</strong>.
        </Typography>
        <Typography variant="body1" sx={{ fontSize: "18px", mb: 4, maxWidth: "800px", lineHeight: 1.7 }}>
          This page is the front door for everyone who wants in: developers, mentors, judges, sponsors,
          and nonprofits. Pick the path that fits.
        </Typography>

        {/* Hero Image */}
        <Box sx={{ mb: 5, textAlign: "center" }}>
          <Box
            component="img"
            src="https://cdn.ohack.dev/ohack.dev/2024_hackathon_2.webp"
            alt="Developers, mentors, and nonprofits collaborating at the Opportunity Hack hackathon for social good at ASU"
            sx={{
              width: "100%",
              maxWidth: 800,
              height: "auto",
              borderRadius: 2,
              boxShadow: 3,
            }}
          />
        </Box>

        {/* Hero CTAs */}
        <Grid container spacing={2} sx={{ maxWidth: "600px", mb: 5 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              href="/hack"
              onClick={() => trackClick("register_fall_2026_hero")}
            >
              Register for Fall 2026
            </Button>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Button
              variant="outlined"
              color="primary"
              size="large"
              fullWidth
              href="/sponsor"
              onClick={() => trackClick("sponsor_event_hero")}
            >
              Sponsor the Event
            </Button>
          </Grid>
        </Grid>

        <Divider sx={{ my: 5 }} />

        {/* Section 1 — What Makes a Hackathon a Hackathon for Social Good */}
        <Box sx={{ mb: 5 }}>
          <Typography variant="h3" component="h2" gutterBottom>
            What Makes a Hackathon a Hackathon for Social Good
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ height: "100%", p: 1, textAlign: "center" }}>
                <CardContent>
                  <BusinessRounded color="primary" sx={{ fontSize: 48, mb: 1 }} />
                  <Typography variant="h5" component="h3" gutterBottom>
                    It starts with a real nonprofit problem
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                    Every project at Opportunity Hack begins with a problem statement from a real
                    501(c)(3) nonprofit. No fictional case studies, no "imagine if" scenarios. Teams
                    are matched 4-8 weeks before the event so they can scope the problem, talk to the
                    nonprofit{"'"}s stakeholders, and arrive at the hackathon ready to build — not ready
                    to brainstorm.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ height: "100%", p: 1, textAlign: "center" }}>
                <CardContent>
                  <TrendingUpRounded color="secondary" sx={{ fontSize: 48, mb: 1 }} />
                  <Typography variant="h5" component="h3" gutterBottom>
                    It produces software that ships
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                    Hackathon prototypes that die on Sunday afternoon don{"'"}t help nonprofits. Our
                    Founding Engineer program pairs successful weekend projects with developers who
                    continue working in the weeks and months after — deploying to production, fixing
                    bugs, training nonprofit staff. The work doesn{"'"}t stop when the hackathon does.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ height: "100%", p: 1, textAlign: "center" }}>
                <CardContent>
                  <GroupsRounded color="success" sx={{ fontSize: 48, mb: 1 }} />
                  <Typography variant="h5" component="h3" gutterBottom>
                    It scales the volunteer engineering model
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                    Each event recruits more developers into ongoing volunteer roles. Senior engineers
                    become mentors. Mentors become judges. Judges become sponsors who fund the next
                    event. The hackathon itself is a recruiting funnel for sustained volunteer
                    engineering — that{"'"}s why the impact compounds across years.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 5 }} />

        {/* Section 2 — How the Hackathon Actually Works */}
        <Box sx={{ mb: 5 }}>
          <Typography variant="h3" component="h2" gutterBottom>
            How the Hackathon Actually Works
          </Typography>
          <Typography variant="body1" sx={{ fontSize: "18px", mb: 4, maxWidth: "800px", lineHeight: 1.7 }}>
            A weekend at Opportunity Hack looks like a standard hackathon on the surface — code, food,
            demos, prizes. The differences are in the structure: pre-event scoping, in-event mentor
            depth, and post-event continuation. Here{"'"}s the timeline of an OHack event.
          </Typography>

          {[
            {
              step: "1",
              title: "4-8 weeks before: matching",
              body: "Nonprofits submit problem statements. Volunteer engineers sign up to hack, mentor, or judge. The OHack team matches projects to teams based on skills, interest, and team size. Stakeholder calls happen so the team understands the nonprofit's real workflow before code starts.",
            },
            {
              step: "2",
              title: "Friday evening: kickoff",
              body: "Teams meet in person (or remote for online events). Nonprofit stakeholders introduce their problem statement. Mentors circulate. Setup, scoping, and the first commits happen. Most teams sleep that night.",
            },
            {
              step: "3",
              title: "Saturday & Sunday: building",
              body: "~36 hours of focused work. Mentors are present continuously — both senior engineers (architecture, debugging) and domain experts (nonprofit operations, accessibility, security). Judges arrive Sunday afternoon for live demos.",
            },
            {
              step: "4",
              title: "Sunday night through the following weeks: shipping",
              body: null, // rendered separately with Link
            },
          ].map((item) => (
            <Paper key={item.step} elevation={2} sx={{ p: 3, mb: 3 }}>
              <Chip label={`Step ${item.step}`} color="primary" sx={{ mb: 2 }} />
              <Typography variant="h5" component="h3" gutterBottom>
                {item.title}
              </Typography>
              {item.step === "4" ? (
                <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                  Live demos on Sunday. Awards by category (Scope / Documentation / Polish / Security
                  — see{" "}
                  <Link href="/hackathon-judging-criteria" style={{ color: "inherit" }}>
                    our judging criteria
                  </Link>
                  ). Top projects enter the Founding Engineer program for ongoing development.
                  Nonprofits start using the prototypes. The work continues.
                </Typography>
              ) : (
                <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                  {item.body}
                </Typography>
              )}
            </Paper>
          ))}
        </Box>

        <Divider sx={{ my: 5 }} />

        {/* Section 3 — Past Event Highlights */}
        <Box sx={{ mb: 5 }}>
          <Typography variant="h3" component="h2" gutterBottom>
            Past Event Highlights
          </Typography>
          <Typography variant="body1" sx={{ fontSize: "18px", mb: 4, maxWidth: "800px", lineHeight: 1.7 }}>
            A decade of social-good hackathons looks like this:
          </Typography>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            {[
              { stat: "3,000+", label: "Developers, designers, engineers" },
              { stat: "200+", label: "Nonprofits served" },
              { stat: "2013", label: "Year founded" },
            ].map((item) => (
              <Grid size={{ xs: 12, md: 4 }} key={item.stat}>
                <Paper elevation={2} sx={{ p: 3, textAlign: "center" }}>
                  <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, color: "primary.main" }}>
                    {item.stat}
                  </Typography>
                  <Typography variant="body1">{item.label}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          <Typography variant="body1" sx={{ fontSize: "18px", mb: 2, maxWidth: "800px", lineHeight: 1.7 }}>
            Opportunity Hack started as a single weekend at Arizona State University in 2013. By 2024
            it had become one of the largest social-good hackathons in the country — and the
            longest-running. Past projects include case-management platforms for homelessness services,
            donor tracking dashboards for grassroots nonprofits, volunteer scheduling tools used week
            after week by 50+ organizations, and impact-reporting pipelines that gave nonprofit boards
            their first real visibility into program outcomes.
          </Typography>
          <Typography variant="body1" sx={{ fontSize: "18px", mb: 4, maxWidth: "800px", lineHeight: 1.7 }}>
            The events themselves have ranged from intimate weekend hackathons of 60 developers to
            flagship fall events with 400+ participants. Format has shifted across in-person, hybrid,
            and online — but the core model (real nonprofit problem statements, mentor-rich support,
            post-event Founding Engineer follow-on) has stayed constant. That{"'"}s the model that has
            actually shipped software to the people who need it.
          </Typography>

          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Button
              variant="outlined"
              color="primary"
              size="large"
              href="/hack"
              onClick={() => trackClick("browse_past_hackathons")}
            >
              Browse Past Hackathons
            </Button>
            <Button
              variant="contained"
              color="primary"
              size="large"
              href="/12-years-of-social-good"
              onClick={() => trackClick("read_field_report")}
            >
              Read the 12-Year Field Report →
            </Button>
          </Box>
        </Box>

        <Divider sx={{ my: 5 }} />

        {/* Section 4 — What Makes Opportunity Hack Different */}
        <Box sx={{ mb: 5 }}>
          <Typography variant="h3" component="h2" gutterBottom>
            What Makes Opportunity Hack Different
          </Typography>
          <Grid container spacing={3}>
            {[
              {
                title: "Real nonprofits, not hypothetical ones",
                body: "Every team builds for a real 501(c)(3) with a real operational problem. Stakeholders are reachable during the hackathon. The team knows whether their work will actually be deployed because the deployment plan is part of the project from day one.",
              },
              {
                title: "Senior mentor density",
                body: "Most hackathons have 1 mentor per 10 teams. Opportunity Hack runs 1 mentor per 2-3 teams, with mentors drawn from senior engineers, technical PMs, and nonprofit-tech veterans. That ratio is why beginner teams ship working code at OHack when they wouldn't elsewhere.",
              },
              {
                title: "Post-hackathon continuation",
                body: "The Founding Engineer program is the half of OHack that other hackathons don't have. Top projects pair with one or two engineers who continue building for weeks or months. That's the difference between a prototype and a deployed system.",
              },
              {
                title: "Open-source rubric",
                body: null, // rendered separately with Link
              },
            ].map((item) => (
              <Grid size={{ xs: 12, md: 6 }} key={item.title}>
                <Paper elevation={2} sx={{ p: 3, height: "100%" }}>
                  <Typography variant="h5" component="h3" gutterBottom>
                    {item.title}
                  </Typography>
                  {item.title === "Open-source rubric" ? (
                    <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                      Our{" "}
                      <Link href="/hackathon-judging-criteria" style={{ color: "inherit" }}>
                        4-category judging rubric
                      </Link>{" "}
                      (Scope, Documentation, Polish, Security) is designed to identify projects that
                      ship — not just projects that demo well. Other hackathons have copied our rubric
                      over the years; we open-source it freely.
                    </Typography>
                  ) : (
                    <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                      {item.body}
                    </Typography>
                  )}
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Divider sx={{ my: 5 }} />

        {/* Section 5 — Upcoming Hackathon: Fall 2026 */}
        <Paper sx={{ bgcolor: "primary.light", color: "white", p: 5, mb: 5, borderRadius: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <EventRounded sx={{ fontSize: 32, color: "white" }} />
            <Typography variant="h4" component="h2" sx={{ color: "white", fontWeight: 700 }}>
              Fall 2026 Hackathon for Social Good
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ color: "white", fontSize: "18px", mb: 4, lineHeight: 1.7, maxWidth: "700px" }}>
            <strong>November 14-15, 2026</strong> — Arizona State University, Tempe, AZ. The annual
            flagship event. Registration opens 8 weeks in advance for hackers, judges, mentors, and
            sponsors.
          </Typography>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Button
              variant="contained"
              size="large"
              href="/hack"
              onClick={() => trackClick("register_hacker_event_section")}
              sx={{
                bgcolor: "white",
                color: "primary.main",
                "&:hover": { bgcolor: "rgba(255,255,255,0.9)" },
              }}
            >
              Register as a Hacker
            </Button>
            <Button
              variant="outlined"
              size="large"
              href="/hackathon-judge-opportunities"
              onClick={() => trackClick("apply_judge_event_section")}
              sx={{
                borderColor: "white",
                color: "white",
                "&:hover": { borderColor: "rgba(255,255,255,0.8)", bgcolor: "rgba(255,255,255,0.1)" },
              }}
            >
              Apply to Judge
            </Button>
            <Button
              variant="outlined"
              size="large"
              href="/sponsor"
              onClick={() => trackClick("become_sponsor_event_section")}
              sx={{
                borderColor: "white",
                color: "white",
                "&:hover": { borderColor: "rgba(255,255,255,0.8)", bgcolor: "rgba(255,255,255,0.1)" },
              }}
            >
              Become a Sponsor
            </Button>
          </Box>
        </Paper>

        {/* Section 6 — How to Participate */}
        <Box sx={{ mb: 5 }}>
          <Typography variant="h3" component="h2" gutterBottom>
            How to Participate
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ textAlign: "center", height: "100%", p: 3 }}>
                <GroupsRounded color="primary" sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  For developers
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.7 }}>
                  Whether you{"'"}re a senior engineer or first-time hackathon participant, OHack has a
                  role. Beginner teams are paired with senior mentors. Senior engineers can stretch by
                  tackling harder projects or volunteering as Founding Engineers post-event.
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  href="/hack"
                  onClick={() => trackClick("join_hackathon_participate")}
                >
                  Join the Hackathon
                </Button>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ textAlign: "center", height: "100%", p: 3 }}>
                <BalanceRounded color="secondary" sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  For mentors and judges
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.7 }}>
                  Senior engineers, technical PMs, and design leaders can volunteer as mentors
                  (in-event guidance) or judges (project evaluation). Both are unpaid; both count
                  toward most employer ESG / volunteer-time programs.
                </Typography>
                <Button
                  variant="contained"
                  color="secondary"
                  href="/hackathon-judge-opportunities"
                  onClick={() => trackClick("apply_judge_mentor_participate")}
                >
                  Apply to Judge or Mentor
                </Button>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ textAlign: "center", height: "100%", p: 3 }}>
                <BusinessRounded color="success" sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  For sponsors
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.7 }}>
                  Companies can fund the model — sponsorship keeps the event free for nonprofits and
                  developers. Sponsorship tiers include dedicated mentor/judge slots and recruiting
                  access. Many sponsors return year over year.
                </Typography>
                <Button
                  variant="contained"
                  color="success"
                  href="/sponsor"
                  onClick={() => trackClick("become_sponsor_participate")}
                >
                  Become a Sponsor
                </Button>
              </Card>
            </Grid>
          </Grid>

          <Alert severity="info" sx={{ mt: 4 }}>
            <Typography variant="body1">
              <strong>Are you a nonprofit?</strong> Apply for a free software project at{" "}
              <Link href="/nonprofits/apply" style={{ color: "inherit" }}>
                /nonprofits/apply
              </Link>{" "}
              or learn more about{" "}
              <Link href="/coding-for-nonprofits" style={{ color: "inherit" }}>
                coding for nonprofits
              </Link>
              .
            </Typography>
          </Alert>
        </Box>

        <Divider sx={{ my: 5 }} />

        {/* Section 7 — FAQ */}
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
            Ready to Join a Hackathon for Social Good?
          </Typography>
          <Typography
            variant="body1"
            sx={{ fontSize: "18px", mb: 4, maxWidth: "600px", mx: "auto", color: "text.secondary" }}
          >
            Pick the path that fits — there{"'"}s a role at the next Opportunity Hack hackathon for
            developers, mentors, judges, sponsors, and nonprofits.
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
            <Button
              variant="contained"
              size="large"
              color="primary"
              href="/hack"
              onClick={() => trackClick("see_hackathons_final")}
              sx={{ fontSize: "16px" }}
            >
              See Upcoming Hackathons
            </Button>
            <Button
              variant="outlined"
              size="large"
              href="/sponsor"
              onClick={() => trackClick("sponsor_event_final")}
              sx={{ fontSize: "16px" }}
            >
              Sponsor the Event
            </Button>
            <Button
              variant="outlined"
              size="large"
              href="/coding-for-nonprofits"
              onClick={() => trackClick("coding_for_nonprofits_final")}
              sx={{ fontSize: "16px" }}
            >
              Read About Coding for Nonprofits
            </Button>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default HackathonForSocialGood;

export const getStaticProps = async () => {
  const title = "Hackathon for Social Good — Build Free Software for Nonprofits | Opportunity Hack";
  const description =
    "Join the world's longest-running hackathon for social good. Since 2013, Opportunity Hack has connected 3,000+ developers with 200+ nonprofits. Annual flagship event at ASU each fall.";
  const canonicalUrl = "https://www.ohack.dev/hackathon-for-social-good";
  const ogImage = "https://cdn.ohack.dev/ohack.dev/2024_hackathon_2.webp";

  return {
    props: {
      title,
      description,
      canonical: canonicalUrl,
      openGraphData: [
        { name: "title", property: "title", content: title, key: "title" },
        { name: "og:title", property: "og:title", content: title, key: "ogtitle" },
        { name: "author", property: "author", content: "Opportunity Hack", key: "author" },
        { name: "og:description", property: "og:description", content: description, key: "ogdescription" },
        { name: "image", property: "og:image", content: ogImage, key: "ognameimage" },
        { property: "og:image:width", content: "1200", key: "ogimagewidth" },
        { property: "og:image:height", content: "630", key: "ogimageheight" },
        { name: "url", property: "url", content: canonicalUrl, key: "url" },
        { name: "og:url", property: "og:url", content: canonicalUrl, key: "ogurl" },
        { property: "og:type", content: "website", key: "ogtype" },
        { name: "twitter:card", property: "twitter:card", content: "summary_large_image", key: "twittercard" },
        { name: "twitter:site", property: "twitter:site", content: "@opportunityhack", key: "twittersite" },
        { name: "twitter:title", property: "twitter:title", content: title, key: "twittertitle" },
        { name: "twitter:description", property: "twitter:description", content: description, key: "twitterdesc" },
        { name: "twitter:image", property: "twitter:image", content: ogImage, key: "twitterimage" },
        {
          name: "twitter:image:alt",
          property: "twitter:image:alt",
          content:
            "Developers, mentors, and nonprofits collaborating at the Opportunity Hack hackathon for social good at ASU",
          key: "twitterimagealt",
        },
        { name: "twitter:creator", property: "twitter:creator", content: "@opportunityhack", key: "twittercreator" },
        {
          name: "keywords",
          property: "keywords",
          content:
            "hackathon for social good, hack for social impact, develop for good, hackathon social good, hack for good, code for good hackathon, social impact hackathon, hackathon social impact",
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
              "@type": "Event",
              name: "Opportunity Hack Fall 2026 Hackathon for Social Good",
              url: "https://www.ohack.dev/hack",
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
                name: "Hackathon for Social Good",
                item: canonicalUrl,
              },
            ],
          },
          {
            "@type": "Event",
            name: "Opportunity Hack Fall 2026 Hackathon for Social Good",
            startDate: "2026-11-14T09:00:00-07:00",
            endDate: "2026-11-15T18:00:00-07:00",
            eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
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
            },
            image: ogImage,
            description:
              "The annual flagship hackathon for social good at Arizona State University. Developers, designers, and nonprofits build free software over a weekend, with post-event continuation through the Founding Engineer program.",
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
                name: 'What is a "hackathon for social good"?',
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "A hackathon for social good is an event where teams build software addressing a charitable, civic, environmental, or community problem — typically for a nonprofit, NGO, or public-sector organization. Opportunity Hack runs the longest-running version of this format in the US, with the distinguishing feature that projects continue past the hackathon weekend through our Founding Engineer program.",
                },
              },
              {
                "@type": "Question",
                name: "When and where is the next Opportunity Hack hackathon?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "The annual flagship hackathon for social good is November 14-15, 2026 at Arizona State University in Tempe, AZ. Registration opens roughly 8 weeks before the event. Smaller and more frequent online events also happen throughout the year.",
                },
              },
              {
                "@type": "Question",
                name: "Do I need experience to participate as a developer?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "No. Opportunity Hack runs with a high mentor-to-hacker ratio (roughly 1:3) specifically so beginner developers can ship real working code. About a third of our participants in any given event are at their first hackathon. Senior engineers handle architecture and debugging; beginners contribute code, design, and project work alongside them.",
                },
              },
              {
                "@type": "Question",
                name: "Is the hackathon free to attend?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes — for hackers, mentors, judges, and nonprofits the event is free. Food, swag, and event infrastructure are funded by corporate sponsors. Travel and accommodations are the participant's responsibility, though regional participants typically can attend without travel.",
                },
              },
              {
                "@type": "Question",
                name: "What happens to the projects after the hackathon ends?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Successful projects enter our Founding Engineer program — one or two volunteer engineers continue working with the nonprofit for weeks or months after the event, deploying the project to production, fixing bugs, and training the nonprofit's staff. Some projects deploy as-is from the hackathon weekend; others take 4-12 weeks to reach production.",
                },
              },
              {
                "@type": "Question",
                name: "Can my company sponsor the hackathon for social good?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes — sponsorship is the primary funding model. Tiers range from category-prize sponsorship to full event title sponsorship. Sponsors get logo presence, dedicated mentor/judge slots for their teams (a popular professional development perk), and recruiting access to participants. See sponsorship details at /sponsor.",
                },
              },
              {
                "@type": "Question",
                name: "What technology stack does the hackathon use?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Whatever the team picks. We don't mandate a stack. Most teams use a web stack (React/Next.js, Node, Postgres, etc.) because that's what nonprofits can host most cheaply, but mobile, data-pipeline, and even hardware projects have shipped at past events. The judging rubric is technology-agnostic.",
                },
              },
              {
                "@type": "Question",
                name: 'How is this different from a corporate "hackathon for good" event?',
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Corporate hack-for-good events are typically internal, single-company, with employees building speculative ideas. Opportunity Hack is external and cross-company, with developers from many organizations building for actual nonprofit clients. The depth of mentor support, the post-event continuation program, and the 13-year track record are also distinguishing.",
                },
              },
            ],
          },
        ],
      },
    },
  };
};
