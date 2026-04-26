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
  CodeRounded,
  HandshakeRounded,
  ExpandMoreRounded,
} from "@mui/icons-material";

const trackClick = (buttonName) => {
  trackEvent({ action: "click_coding_for_nonprofits", params: { button: buttonName } });
};

const CodingForNonprofits = () => {
  useEffect(() => {
    initFacebookPixel();
  }, []);

  const faqItems = [
    {
      q: "Is the software really free for nonprofits?",
      a: "Yes. There are no fees at any stage of the process. Opportunity Hack is funded by corporate sponsors and individual donors, which means our nonprofit partners pay nothing — not for the hackathon weekend, not for the Founding Engineer follow-on work, not for hosting (we help arrange free hosting credits where possible). The only thing we ask in return is that nonprofits stay engaged with the project team during development.",
    },
    {
      q: "What's the catch?",
      a: "There isn't one, but there are constraints. Hackathon teams have a weekend to ship a prototype. The scope of what we can build in that window is real — a focused tool that solves one specific problem, not a full enterprise platform. The Founding Engineer program extends timelines, but we still scope projects to what volunteer engineers can sustainably ship in their nights and weekends.",
    },
    {
      q: "Who owns the code?",
      a: "The nonprofit. Every project we build is licensed to the nonprofit (or open-sourced when both sides agree). Opportunity Hack does not retain commercial rights, IP claims, or revenue-share. The volunteer developers who built the project are credited but don't claim ownership — they signed onto the volunteer agreement before the hackathon started.",
    },
    {
      q: "What if our project needs ongoing maintenance after the hackathon?",
      a: "That's exactly what the Founding Engineer program is for. After the hackathon, we pair successful projects with one or two engineers who continue building for weeks or months — deploying to production, fixing bugs, training your staff to use and maintain the system. Long-term ongoing maintenance (years out) typically transitions to the nonprofit's own technical capacity, with our network available for consultation.",
    },
    {
      q: "Are these production-ready solutions, or just hackathon prototypes?",
      a: "Hackathon weekend output is a working prototype, not production-ready. The path from prototype to production runs through the Founding Engineer program. Past nonprofit projects have ranged from \"the prototype was enough — we deployed it as-is\" to \"took six more months of evening work to harden, deploy, and train staff.\" The team scopes the post-hackathon plan with each nonprofit before the event.",
    },
    {
      q: "We're not located in Arizona — can our nonprofit still apply?",
      a: "Absolutely. Many of our nonprofit partners are outside Arizona, and several are international (we've worked with organizations in India, the Philippines, and elsewhere). Our hackathons happen at ASU in Tempe, but the work itself happens remotely or hybrid. Nonprofits don't need to attend in person to participate — we just need engaged stakeholders available by video and email during the project.",
    },
    {
      q: "Does our nonprofit need any technical staff to participate?",
      a: "No technical staff required. About half of the nonprofits we work with have zero in-house engineers. What we do need is a stakeholder — usually an executive director, program manager, or operations lead — who can answer questions about workflows, give feedback on prototypes, and ultimately use the software once it ships. Without that engaged stakeholder, projects stall.",
    },
    {
      q: "How long does the whole process take, from application to deployed software?",
      a: "Plan on 4-12 weeks total. Applications open ~8 weeks before each hackathon. The hackathon weekend itself produces the prototype. The Founding Engineer follow-on typically lasts 4-8 weeks for straightforward projects, longer for more complex ones. Some projects deploy the hackathon prototype as-is within days; others spend the full 12 weeks reaching production.",
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
          Coding for Nonprofits
        </Typography>

        <Typography
          variant="h5"
          component="h2"
          sx={{ mb: 3, color: "text.secondary", fontWeight: 300 }}
        >
          Free, custom software development for nonprofits — built by volunteer engineers since 2013
        </Typography>

        {/* Hero copy */}
        <Typography
          variant="body1"
          sx={{
            fontSize: "18px",
            mb: 4,
            maxWidth: "800px",
            lineHeight: 1.7,
          }}
        >
          Opportunity Hack connects volunteer software developers with nonprofits that need custom
          technology but can't afford to build it. Since 2013, more than 3,000 developers have
          built free software for over 200 nonprofits — volunteer scheduling tools, donor management
          systems, impact dashboards, community platforms, and the dozens of other small-but-essential
          apps that keep mission-driven organizations running. We're a 501(c)(3) ourselves, organizing
          weekend hackathons paired with an ongoing Founding Engineer model so the work doesn't end
          when the hackathon does.
        </Typography>

        {/* Hero CTAs */}
        <Grid container spacing={2} sx={{ maxWidth: "600px", mb: 5 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              href="/nonprofits/apply"
              startIcon={<BusinessRounded />}
              onClick={() => trackClick("apply_nonprofit_hero")}
            >
              Apply as a Nonprofit
            </Button>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Button
              variant="outlined"
              color="primary"
              size="large"
              fullWidth
              href="/volunteer"
              startIcon={<CodeRounded />}
              onClick={() => trackClick("volunteer_developer_hero")}
            >
              Volunteer as a Developer
            </Button>
          </Grid>
        </Grid>

        {/* Hero Image */}
        <Box sx={{ mb: 5, textAlign: "center" }}>
          <Box
            component="img"
            src="https://cdn.ohack.dev/ohack.dev/2024_hackathon_2.webp"
            alt="Volunteer software developers and nonprofits collaborating at an Opportunity Hack hackathon"
            sx={{
              width: "100%",
              maxWidth: "800px",
              height: "auto",
              borderRadius: 2,
              boxShadow: 3,
            }}
          />
        </Box>

        {/* Section 1 */}
        <Box sx={{ mb: 5 }}>
          <Typography variant="h3" component="h2" gutterBottom>
            What "Coding for Nonprofits" Means at Opportunity Hack
          </Typography>
          <Typography variant="body1" sx={{ fontSize: "18px", mb: 2, lineHeight: 1.7 }}>
            Most "coding for nonprofits" programs deliver one of three things: a generic donation
            page, a few hours of pro-bono consulting, or a beautifully scoped project that quietly
            dies after the volunteer demo. Our model is different.
          </Typography>
          <Typography variant="body1" sx={{ fontSize: "18px", mb: 2, lineHeight: 1.7 }}>
            When a nonprofit comes to Opportunity Hack, they get a small team of volunteer engineers
            who write actual production code over a weekend, and — critically — a path to keep that
            code maintained afterward. The hackathon weekend is the kickoff, not the deliverable. We
            pair every project with a Founding Engineer who continues working with the nonprofit in
            the weeks and months that follow.
          </Typography>
          <Typography variant="body1" sx={{ fontSize: "18px", lineHeight: 1.7 }}>
            The result is software that nonprofits actually deploy. Custom tools tailored to the
            nonprofit's specific workflow. Code the nonprofit fully owns. No vendor lock-in. No
            subscription fees. No "donation in exchange for our SaaS."
          </Typography>
        </Box>

        <Divider sx={{ my: 5 }} />

        {/* Section 2 — How nonprofits get free software */}
        <Box sx={{ mb: 5 }}>
          <Typography variant="h3" component="h2" gutterBottom>
            How Nonprofits Get Free Software
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ height: "100%", p: 1 }}>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    1. Apply
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                    Submit a one-page application describing the problem you want to solve. Any
                    501(c)(3) (or international equivalent) is eligible. We help you refine the scope
                    into a clear problem statement that volunteer engineers can build against in a
                    hackathon weekend.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ height: "100%", p: 1 }}>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    2. Get Matched
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                    Four to eight weeks before the hackathon, we match your problem statement with a
                    team of volunteer developers — typically 3-5 hackers ranging from senior engineers
                    to early-career talent. Mentors and judges are pulled from our network of senior
                    tech leaders.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ height: "100%", p: 1 }}>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    3. Build &amp; Continue
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                    The hackathon weekend produces a working prototype. From there, our Founding
                    Engineer program pairs your nonprofit with one or two engineers who keep building,
                    deploy to production, and train your team. No fees. You own the code.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 5 }} />

        {/* Section 3 — What kinds of projects */}
        <Box sx={{ mb: 5 }}>
          <Typography variant="h3" component="h2" gutterBottom>
            What Kinds of Projects We Build
          </Typography>
          <Typography variant="body1" sx={{ fontSize: "18px", mb: 4, lineHeight: 1.7, maxWidth: "800px" }}>
            Our most successful projects share a pattern: a clear, specific operational problem
            that's blocking the nonprofit's mission. The kinds of projects that work well at
            Opportunity Hack are the unglamorous, internal-tool projects that commercial software
            vendors ignore — but that save nonprofit staff hours of manual work every week.
          </Typography>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 3, bgcolor: "primary.light", height: "100%" }}>
                <Typography variant="h5" component="h3" gutterBottom sx={{ color: "white" }}>
                  Projects that work well
                </Typography>
                <Box component="ul" sx={{ pl: 2, m: 0 }}>
                  {[
                    "Volunteer scheduling and shift management",
                    "Donor and grant tracking dashboards",
                    "Case management for service nonprofits",
                    "Internal admin tools for staff workflows",
                    "Impact reporting pipelines (data to board-ready charts)",
                    "Public community platforms with member portals",
                  ].map((item) => (
                    <Typography component="li" variant="body1" key={item} sx={{ mb: 1, color: "white" }}>
                      {item}
                    </Typography>
                  ))}
                </Box>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 3, bgcolor: "secondary.light", height: "100%" }}>
                <Typography variant="h5" component="h3" gutterBottom sx={{ color: "white" }}>
                  Projects that don't fit our model
                </Typography>
                <Box component="ul" sx={{ pl: 2, m: 0 }}>
                  {[
                    "Mobile apps requiring multi-year iOS/Android maintenance",
                    "Generic CRM replacements (use Salesforce nonprofit edition)",
                    "AI/ML startups disguised as nonprofits",
                    "Anything requiring a full-time engineering team",
                  ].map((item) => (
                    <Typography component="li" variant="body1" key={item} sx={{ mb: 1, color: "white" }}>
                      {item}
                    </Typography>
                  ))}
                </Box>
              </Paper>
            </Grid>
          </Grid>

          <Alert severity="info">
            <Typography variant="body1">
              <strong>Real examples</strong> — past Opportunity Hack nonprofit alumni include
              HomeFirst Services (homelessness case management), Vidyodaya (teacher training portal
              for tribal schools in India), and Saving One Life (animal adoption matching platform).{" "}
              <Link href="/nonprofits" style={{ color: "inherit" }}>
                Browse the full list of nonprofit projects
              </Link>
              .
            </Typography>
          </Alert>
        </Box>

        <Divider sx={{ my: 5 }} />

        {/* Section 4 — Why we do it this way */}
        <Box sx={{ mb: 5 }}>
          <Typography variant="h3" component="h2" gutterBottom>
            Why We Do It This Way
          </Typography>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ display: "flex", gap: 2 }}>
                <BusinessRounded color="primary" sx={{ fontSize: 40, flexShrink: 0, mt: 0.5 }} />
                <Box>
                  <Typography variant="h5" component="h3" gutterBottom>
                    The capacity gap
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                    There are roughly 1.5 million nonprofits in the United States. Most can't justify
                    $50,000–$200,000 for custom software development, even when the ROI is obvious in
                    staff hours saved. Generic SaaS tools cover the most common workflows but break
                    down at the edges where nonprofits actually live — multi-program case management,
                    mixed funding tracking, region-specific compliance.
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ display: "flex", gap: 2 }}>
                <GroupsRounded color="primary" sx={{ fontSize: 40, flexShrink: 0, mt: 0.5 }} />
                <Box>
                  <Typography variant="h5" component="h3" gutterBottom>
                    The talent gap
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                    On the developer side, thousands of senior software engineers want to use their
                    skills for social good but bounce off the typical volunteer experience: vague scope,
                    no end date, no peers to work alongside. The hackathon format creates a timeboxed
                    commitment with a working team. The Founding Engineer program creates the ongoing
                    path for the engineers who want to go deeper.
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>

          {/* Gradient Paper — multiplier effect */}
          <Paper
            elevation={3}
            sx={{
              p: 5,
              textAlign: "center",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              borderRadius: 3,
            }}
          >
            <Typography variant="h4" component="h3" gutterBottom sx={{ color: "white" }}>
              The multiplier effect
            </Typography>
            <Typography
              variant="body1"
              sx={{
                mb: 4,
                maxWidth: "700px",
                mx: "auto",
                fontSize: "18px",
                color: "rgba(255,255,255,0.9)",
                lineHeight: 1.6,
              }}
            >
              Every nonprofit project we ship recruits more volunteer engineers. Every senior engineer
              who becomes a mentor or judge brings their professional network with them. Coding for
              social good stops being something developers do instead of their day job and becomes a
              way to amplify it. That's why we've grown from a single weekend hackathon in 2013 to a
              year-round program serving 200+ nonprofits.
            </Typography>
            <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
              <Button
                variant="contained"
                size="large"
                href="/about"
                onClick={() => trackClick("read_our_story")}
                sx={{
                  bgcolor: "white",
                  color: "primary.main",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.9)" },
                }}
              >
                Read our story
              </Button>
              <Button
                variant="outlined"
                size="large"
                href="/hackathon-judge-opportunities"
                onClick={() => trackClick("become_mentor_judge")}
                sx={{
                  borderColor: "white",
                  color: "white",
                  "&:hover": {
                    borderColor: "rgba(255,255,255,0.8)",
                    bgcolor: "rgba(255,255,255,0.1)",
                  },
                }}
              >
                Become a mentor or judge
              </Button>
            </Box>
          </Paper>
        </Box>

        <Divider sx={{ my: 5 }} />

        {/* Section 5 — How to Participate */}
        <Box sx={{ mb: 5 }}>
          <Typography variant="h3" component="h2" gutterBottom>
            How to Participate
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ textAlign: "center", height: "100%", p: 3 }}>
                <BusinessRounded color="primary" sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  For nonprofits
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.7 }}>
                  Apply for a free software project. We work with 501(c)(3) organizations of all
                  sizes. The application takes about 20 minutes.
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  href="/nonprofits/apply"
                  onClick={() => trackClick("apply_nonprofit_participate")}
                >
                  Apply as a Nonprofit
                </Button>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ textAlign: "center", height: "100%", p: 3 }}>
                <CodeRounded color="secondary" sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  For developers
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.7 }}>
                  Join the next hackathon as a hacker. Beginner-friendly — we pair junior engineers
                  with senior mentors. Senior engineers can also volunteer as Founding Engineers for
                  ongoing work.
                </Typography>
                <Button
                  variant="contained"
                  color="secondary"
                  href="/hack"
                  onClick={() => trackClick("see_hackathons")}
                >
                  See Upcoming Hackathons
                </Button>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ textAlign: "center", height: "100%", p: 3 }}>
                <HandshakeRounded color="success" sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  For sponsors
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.7 }}>
                  Fund the model. Sponsors keep the program free for nonprofits and reserve dedicated
                  mentor/judge slots for their teams as a professional-development perk.
                </Typography>
                <Button
                  variant="contained"
                  color="success"
                  href="/sponsor"
                  onClick={() => trackClick("become_sponsor")}
                >
                  Become a Sponsor
                </Button>
              </Card>
            </Grid>
          </Grid>
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
            Ready to start?
          </Typography>
          <Typography
            variant="body1"
            sx={{ fontSize: "18px", mb: 2, maxWidth: "600px", mx: "auto", color: "text.secondary" }}
          >
            Whether you're a nonprofit looking for software, a developer looking to do meaningful
            work, or a sponsor looking to fund the model — we'd love to hear from you.
          </Typography>
          <Typography
            variant="body1"
            sx={{ fontSize: "16px", mb: 4, maxWidth: "600px", mx: "auto", color: "text.secondary" }}
          >
            Interested in the event itself?{" "}
            <Link href="/hackathon-for-social-good" style={{ color: "inherit" }}>
              Learn about our hackathon for social good
            </Link>{" "}
            — the annual flagship where all this work begins.
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
            <Button
              variant="contained"
              size="large"
              color="primary"
              href="/nonprofits/apply"
              onClick={() => trackClick("apply_nonprofit_final")}
              sx={{ fontSize: "16px" }}
            >
              Apply as a Nonprofit
            </Button>
            <Button
              variant="outlined"
              size="large"
              href="/volunteer"
              onClick={() => trackClick("volunteer_developer_final")}
              sx={{ fontSize: "16px" }}
            >
              Volunteer as a Developer
            </Button>
            <Button
              variant="outlined"
              size="large"
              href="/sponsor"
              onClick={() => trackClick("become_sponsor_final")}
              sx={{ fontSize: "16px" }}
            >
              Become a Sponsor
            </Button>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default CodingForNonprofits;

export const getStaticProps = async () => {
  const title = "Coding for Nonprofits: Free Software Development | Opportunity Hack";
  const description =
    "Learn how Opportunity Hack connects volunteer developers with nonprofits to build free, custom software. 200+ nonprofits served since 2013 through hackathons and our Founding Engineer program.";
  const canonicalUrl = "https://www.ohack.dev/coding-for-nonprofits";
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
        {
          name: "og:description",
          property: "og:description",
          content: description,
          key: "ogdescription",
        },
        { name: "image", property: "og:image", content: ogImage, key: "ognameimage" },
        { property: "og:image:width", content: "1200", key: "ogimagewidth" },
        { property: "og:image:height", content: "630", key: "ogimageheight" },
        { name: "url", property: "url", content: canonicalUrl, key: "url" },
        { name: "og:url", property: "og:url", content: canonicalUrl, key: "ogurl" },
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
        { name: "twitter:title", property: "twitter:title", content: title, key: "twittertitle" },
        {
          name: "twitter:description",
          property: "twitter:description",
          content: description,
          key: "twitterdesc",
        },
        { name: "twitter:image", property: "twitter:image", content: ogImage, key: "twitterimage" },
        {
          name: "twitter:image:alt",
          property: "twitter:image:alt",
          content:
            "Volunteer software developers and nonprofits collaborating at an Opportunity Hack hackathon",
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
            "coding for nonprofits, nonprofit software development, coding for charity, coding for social good, free software for nonprofits, hackathon for social good, develop for good, code for good",
          key: "keywords",
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
              url: "https://cdn.ohack.dev/ohack.dev/logos/OpportunityHack_2Letter_Dark_Blue.png",
            },
            sameAs: [
              "https://www.linkedin.com/company/opportunity-hack/",
              "https://github.com/opportunity-hack",
              "https://twitter.com/opportunityhack",
            ],
          },
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
              "@type": "Service",
              name: "Free Software Development for Nonprofits",
              provider: {
                "@type": "Organization",
                name: "Opportunity Hack",
              },
              areaServed: "Worldwide",
              serviceType: "Software Development",
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
                name: "Coding for Nonprofits",
                item: canonicalUrl,
              },
            ],
          },
          {
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "Is the software really free for nonprofits?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes. There are no fees at any stage of the process. Opportunity Hack is funded by corporate sponsors and individual donors, which means our nonprofit partners pay nothing — not for the hackathon weekend, not for the Founding Engineer follow-on work, not for hosting (we help arrange free hosting credits where possible). The only thing we ask in return is that nonprofits stay engaged with the project team during development.",
                },
              },
              {
                "@type": "Question",
                name: "What's the catch?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "There isn't one, but there are constraints. Hackathon teams have a weekend to ship a prototype. The scope of what we can build in that window is real — a focused tool that solves one specific problem, not a full enterprise platform. The Founding Engineer program extends timelines, but we still scope projects to what volunteer engineers can sustainably ship in their nights and weekends.",
                },
              },
              {
                "@type": "Question",
                name: "Who owns the code?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "The nonprofit. Every project we build is licensed to the nonprofit (or open-sourced when both sides agree). Opportunity Hack does not retain commercial rights, IP claims, or revenue-share. The volunteer developers who built the project are credited but don't claim ownership — they signed onto the volunteer agreement before the hackathon started.",
                },
              },
              {
                "@type": "Question",
                name: "What if our project needs ongoing maintenance after the hackathon?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "That's exactly what the Founding Engineer program is for. After the hackathon, we pair successful projects with one or two engineers who continue building for weeks or months — deploying to production, fixing bugs, training your staff to use and maintain the system. Long-term ongoing maintenance (years out) typically transitions to the nonprofit's own technical capacity, with our network available for consultation.",
                },
              },
              {
                "@type": "Question",
                name: "Are these production-ready solutions, or just hackathon prototypes?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Hackathon weekend output is a working prototype, not production-ready. The path from prototype to production runs through the Founding Engineer program. Past nonprofit projects have ranged from \"the prototype was enough — we deployed it as-is\" to \"took six more months of evening work to harden, deploy, and train staff.\" The team scopes the post-hackathon plan with each nonprofit before the event.",
                },
              },
              {
                "@type": "Question",
                name: "We're not located in Arizona — can our nonprofit still apply?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Absolutely. Many of our nonprofit partners are outside Arizona, and several are international (we've worked with organizations in India, the Philippines, and elsewhere). Our hackathons happen at ASU in Tempe, but the work itself happens remotely or hybrid. Nonprofits don't need to attend in person to participate — we just need engaged stakeholders available by video and email during the project.",
                },
              },
              {
                "@type": "Question",
                name: "Does our nonprofit need any technical staff to participate?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "No technical staff required. About half of the nonprofits we work with have zero in-house engineers. What we do need is a stakeholder — usually an executive director, program manager, or operations lead — who can answer questions about workflows, give feedback on prototypes, and ultimately use the software once it ships. Without that engaged stakeholder, projects stall.",
                },
              },
              {
                "@type": "Question",
                name: "How long does the whole process take, from application to deployed software?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Plan on 4-12 weeks total. Applications open ~8 weeks before each hackathon. The hackathon weekend itself produces the prototype. The Founding Engineer follow-on typically lasts 4-8 weeks for straightforward projects, longer for more complex ones. Some projects deploy the hackathon prototype as-is within days; others spend the full 12 weeks reaching production.",
                },
              },
            ],
          },
        ],
      },
    },
  };
};
