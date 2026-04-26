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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

import {
  AssessmentRounded,
  BalanceRounded,
  TrendingUpRounded,
  CheckCircleRounded,
  ExpandMoreRounded,
  GavelRounded,
} from "@mui/icons-material";

const trackClick = (buttonName) => {
  trackEvent({ action: "click_judging_criteria", params: { button: buttonName } });
};

const scrollToScorecard = () => {
  const el = document.getElementById("scorecard");
  if (el) el.scrollIntoView({ behavior: "smooth" });
};

const categoryCards = [
  {
    icon: <AssessmentRounded color="primary" sx={{ fontSize: 40, mb: 1 }} />,
    title: "Scope",
    points: 10,
    body: "Scope answers two questions: how many people benefit from this solution, and how hard was the underlying problem to solve? A volunteer-scheduling tool that serves one nonprofit's 50 volunteers is narrower scope than a case-management platform serving 30 nonprofits across a region. A trivial CRUD app is shallower complexity than a project that handles real data normalization or domain edge cases.",
    bullets: [
      "Number of nonprofits or end-users impacted",
      "Complexity of the problem solved relative to existing solutions",
      "Whether the team chose a real problem or a toy problem",
    ],
  },
  {
    icon: <BalanceRounded color="secondary" sx={{ fontSize: 40, mb: 1 }} />,
    title: "Documentation",
    points: 10,
    body: "Documentation is the proxy for sustainability. The most beautiful hackathon prototype is worthless to a nonprofit that can't deploy or maintain it. Look at the README, the inline comments, the deployment instructions, the user-facing UX. Could a non-author run this project six months from now?",
    bullets: [
      "README explains setup, deploy, environment variables clearly",
      "Code comments where logic isn't self-evident",
      "User-facing UX is intuitive without a manual",
      "Architecture decisions are recorded somewhere",
    ],
  },
  {
    icon: <TrendingUpRounded color="success" sx={{ fontSize: 40, mb: 1 }} />,
    title: "Polish",
    points: 10,
    body: 'Polish is "how much work remains before this can be used today?" A demoable prototype with three TODO bugs and no error handling scores low. A working app deployed to a public URL with reasonable error states scores high. Polish is not about visual design — it\'s about production readiness.',
    bullets: [
      "Project is deployed somewhere public (not just running on the demo laptop)",
      "Error states are handled gracefully",
      "Common edge cases (empty state, slow network, invalid input) don't break the app",
      "Estimated work remaining to reach MVP is small",
    ],
  },
  {
    icon: <CheckCircleRounded sx={{ fontSize: 40, mb: 1, color: "error.main" }} />,
    title: "Security",
    points: 10,
    body: "Security is asymmetric: a vulnerability turns a useful app into a liability. Especially for nonprofits handling client data, donor records, or volunteer info, security failures can end a project. Score how the team thought about data protection and access control — even if the implementation isn't bulletproof, did they engage with the questions?",
    bullets: [
      "Sensitive data is gated by authentication",
      "Role-based access exists where appropriate (admin vs. public users)",
      "Secrets aren't committed to the repo",
      "Input is validated; obvious injection vectors are closed",
    ],
  },
];

const scoringScale = [
  { score: 1, description: "Poor — Significantly below expectations" },
  { score: 2, description: "Fair — Below expectations" },
  { score: 3, description: "Good — Meets expectations" },
  { score: 4, description: "Very Good — Exceeds expectations" },
  { score: 5, description: "Excellent — Significantly exceeds expectations" },
];

const pitfalls = [
  {
    title: 'Scoring on demo flash, not on what shipped',
    body: "The team with the slickest pitch isn't always the team that built the most. Polished slide decks and confident speakers can hide thin implementations. Spend at least as much time looking at the code repo as you do at the demo. If you can't see code, ask why.",
  },
  {
    title: "Anchoring on the first project you score",
    body: "Whatever score you give the first team you evaluate sets your internal scale for the rest. Score the first project, then deliberately wait until you've watched 2-3 more before finalizing — and revise the first one if it doesn't fit the spread you've calibrated.",
  },
  {
    title: "Punishing teams for incomplete features they were honest about",
    body: "A team that says \"we didn't get to feature X — here's our mitigation plan\" is acting like a real engineering team. A team that hides incomplete work and hopes you don't notice is not. Reward honesty about gaps; penalize concealment.",
  },
  {
    title: '"Beautiful" vs. "good"',
    body: "Visual design is a tiebreaker, not a primary criterion. A clean utility app that solves the nonprofit's problem reliably scores higher than a beautiful app that doesn't. Polish is about production readiness, not aesthetics.",
  },
  {
    title: "Forgetting that the nonprofit is the customer",
    body: "Hackathon judges sometimes evaluate technical impressiveness without asking \"would the nonprofit actually use this?\" If a project requires the nonprofit to hire a dev to maintain it, or learn a new tool to operate it, that's a scope/polish problem — not a strength.",
  },
];

const faqItems = [
  {
    q: "Can I use this rubric for my own hackathon?",
    a: "Yes — copy and adapt freely. We open-source the Opportunity Hack judging framework and explicitly invite other hackathon organizers to use it. No attribution is required, though we'd love to hear how you adapt it. Email greg@ohack.org with feedback.",
  },
  {
    q: "How long does scoring one project take with this rubric?",
    a: "A reasonable judge spends 12-20 minutes per project: 4 minutes watching the pitch video, 5-8 minutes reading code and the README, and 3-8 minutes for final scoring and notes. Live demo Q&A adds another 5-10 minutes for finalist projects. A judge handling 8-10 projects can expect a 3-4 hour total commitment.",
  },
  {
    q: "What if a project doesn't fit cleanly into one of the categories?",
    a: "Score what's present. A pure-data-pipeline project will score lower on Polish (no UI to evaluate) than a frontend-heavy project, but higher on Documentation and Security in many cases. Don't penalize projects for the categories they don't naturally exercise — let the average reflect the project's actual shape.",
  },
  {
    q: "How are ties broken?",
    a: "Multiple judges score each project, and the average is used. If two projects tie within 1 point, the head judge looks at sub-criterion scores and tiebreaker categories — typically Scope (impact) and Polish (production readiness) win out over Documentation in close calls. Ultimately the head judge has discretion.",
  },
  {
    q: "Should social impact be part of the criteria?",
    a: "At Opportunity Hack, social impact is captured inside Scope's sub-criterion A (\"impact on community\"). We deliberately don't have a separate \"social impact\" category — every project at OHack already starts from a real nonprofit problem statement, so impact is the floor not a differentiator. For non-social-good hackathons, you'd swap in a different sub-criterion under Scope.",
  },
  {
    q: "Is this rubric biased against beginner teams?",
    a: "Less than you'd think. Scope is independent of seniority — a beginner team that picks a focused problem and ships something narrow can match or beat a senior team that overscoped. Polish and Documentation reward effort and discipline, not raw skill. Security is the one category where senior teams often outscore beginners, but that's been more than offset historically by Scope and Documentation in our data.",
  },
  {
    q: "Does the rubric work for non-software hackathons?",
    a: "The four-category framework generalizes well — Scope, Documentation, Polish, Security mostly map to \"did they pick a real problem\", \"is the work understandable\", \"is the work usable today\", and \"is the work safe\". For hardware, biotech, or design-focused hackathons, Security can become \"safety/ethics\" and the sub-criteria adjust accordingly.",
  },
  {
    q: "What if I disagree with another judge's score?",
    a: "Disagreement is normal and useful. Multi-judge scoring is designed to surface different perspectives. If two judges differ by 2+ points on the same project, the head judge brings them together briefly to discuss before final scores are locked. The goal isn't consensus — it's making sure both judges saw the same project. Keep your score if you still believe it after the discussion.",
  },
];

const SCORECARD_TEXT = `HACKATHON JUDGING SCORECARD — OPPORTUNITY HACK FRAMEWORK
=========================================================

Project: ________________________________________________
Team:    ________________________________________________
Judge:   ________________________________________________
Date:    ________________________________________________

CATEGORY 1: SCOPE (10 points)
Sub-criterion A — Impact on community:    ___ / 5
Sub-criterion B — Complexity of problem:  ___ / 5
                              SCOPE TOTAL: ___ / 10
Notes:

CATEGORY 2: DOCUMENTATION (10 points)
Sub-criterion A — Code & UX docs:         ___ / 5
Sub-criterion B — Ease of understanding:  ___ / 5
                       DOCUMENTATION TOTAL: ___ / 10
Notes:

CATEGORY 3: POLISH (10 points)
Sub-criterion A — Work remaining for MVP: ___ / 5
Sub-criterion B — Can use today:          ___ / 5
                              POLISH TOTAL: ___ / 10
Notes:

CATEGORY 4: SECURITY (10 points)
Sub-criterion A — Data protection:        ___ / 5
Sub-criterion B — Role-based access:      ___ / 5
                            SECURITY TOTAL: ___ / 10
Notes:

OVERALL TOTAL: ___ / 40
Recommendation: [ ] Grand Prize  [ ] Category Prize  [ ] Honorable Mention  [ ] No Award`;

const HackathonJudgingCriteria = () => {
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
          Hackathon Judging Criteria
        </Typography>

        <Typography
          variant="h5"
          component="h2"
          sx={{ mb: 3, color: "text.secondary", fontWeight: 300 }}
        >
          The scoring framework, rubric, and scorecard Opportunity Hack uses across every hackathon — free to copy and adapt for your own event
        </Typography>

        {/* Intro */}
        <Typography variant="body1" sx={{ fontSize: "18px", mb: 2, maxWidth: "800px", lineHeight: 1.7 }}>
          A hackathon's outcome rests on its judging. Bad criteria reward the showiest demos and
          ignore the hardest work; good criteria identify the projects that will actually ship.
          After running social-good hackathons since 2013 — with hundreds of judges across thousands
          of projects — Opportunity Hack has converged on a four-category rubric that has held up
          across both beginner and senior teams, in-person and remote, weekend and week-long events.
        </Typography>
        <Typography variant="body1" sx={{ fontSize: "18px", mb: 4, maxWidth: "800px", lineHeight: 1.7 }}>
          This page is the authoritative reference: the framework, the scoring scale, a worked
          example, the downloadable rubric, and the common judging pitfalls we've watched people
          stumble into. If you're judging an Opportunity Hack event — bookmark this. If you're
          running your own hackathon — copy the rubric below. We open-source the model.
        </Typography>

        {/* Hero CTAs */}
        <Grid container spacing={2} sx={{ maxWidth: "600px", mb: 5 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              href="/hackathon-judge-opportunities"
              startIcon={<GavelRounded />}
              onClick={() => trackClick("apply_to_judge_hero")}
            >
              Apply to Judge
            </Button>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Button
              variant="outlined"
              color="primary"
              size="large"
              fullWidth
              onClick={() => {
                trackClick("copy_scorecard_hero");
                scrollToScorecard();
              }}
              startIcon={<AssessmentRounded />}
            >
              Copy the Scorecard
            </Button>
          </Grid>
        </Grid>

        <Divider sx={{ my: 5 }} />

        {/* Section 1 — Four-Category Framework */}
        <Box sx={{ mb: 5 }}>
          <Typography variant="h3" component="h2" gutterBottom>
            The Four-Category Framework
          </Typography>
          <Typography variant="body1" sx={{ fontSize: "18px", mb: 4, maxWidth: "800px", lineHeight: 1.7 }}>
            Each project receives one score per category on a 1-5 scale. Categories are weighted
            equally and combined for a total out of 40. The categories were chosen because they map
            to the qualities that distinguish hackathon prototypes that ship vs. those that don't —
            independent of the technology stack, problem domain, or seniority of the team.
          </Typography>

          <Grid container spacing={3}>
            {categoryCards.map((card) => (
              <Grid size={{ xs: 12, md: 6 }} key={card.title}>
                <Card sx={{ height: "100%", p: 1 }}>
                  <CardContent>
                    {card.icon}
                    <Typography variant="h5" component="h3" gutterBottom>
                      {card.title} ({card.points} points)
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                      {card.body}
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                      What to look for:
                    </Typography>
                    <Box component="ul" sx={{ pl: 2, m: 0 }}>
                      {card.bullets.map((b) => (
                        <Typography component="li" variant="body2" key={b} sx={{ mb: 0.5, lineHeight: 1.6 }}>
                          {b}
                        </Typography>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Divider sx={{ my: 5 }} />

        {/* Section 2 — Scoring Scale */}
        <Box sx={{ mb: 5 }}>
          <Typography variant="h3" component="h2" gutterBottom>
            The Scoring Scale
          </Typography>

          <Paper elevation={2} sx={{ mb: 3 }}>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, width: 80 }}>Score</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {scoringScale.map((row) => (
                    <TableRow key={row.score} hover>
                      <TableCell sx={{ fontWeight: 700, fontSize: "1.1rem" }}>{row.score}</TableCell>
                      <TableCell>{row.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          <Typography variant="body1" sx={{ fontSize: "18px", maxWidth: "800px", lineHeight: 1.7 }}>
            Most projects score 2-4 across categories. A score of 5 should be reserved for
            genuinely exceptional work — a project where you'd want to recommend the team to your
            own employer. A score of 1 should be reserved for projects that fundamentally don't
            address the category (no documentation at all, no security thinking at all). The middle
            is where most evaluation happens.
          </Typography>
        </Box>

        <Divider sx={{ my: 5 }} />

        {/* Section 3 — Worked Example */}
        <Box sx={{ mb: 5 }}>
          <Typography variant="h3" component="h2" gutterBottom>
            Worked Example: Scoring a Volunteer-Scheduling App
          </Typography>

          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h5" component="h3" gutterBottom>
              Project: a volunteer shift-scheduling app for a homeless-services nonprofit
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.7 }}>
              Here's how an experienced judge would score a real Opportunity Hack project — a
              volunteer shift-scheduling tool built for a homeless-services nonprofit during a
              weekend hackathon. The team shipped a working app deployed to Vercel, with a basic
              README and authentication via Auth0.
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" component="h4" gutterBottom sx={{ fontWeight: 700 }}>
                Scope — 4/5
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                Serves one nonprofit's ~80 weekly volunteers across 4 program sites. Solves a real
                problem (the nonprofit was using paper sign-up sheets and Google Sheets). Scope is
                moderate — single nonprofit, but the problem is operationally critical and replaces
                a manual process consuming staff hours every week. Not the broadest possible impact,
                but real.
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" component="h4" gutterBottom sx={{ fontWeight: 700 }}>
                Documentation — 3/5
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                README covers setup and deploy clearly. No inline comments in the trickier
                scheduling-conflict logic. UX is intuitive for the volunteer-facing pages but the
                admin pages have unlabeled buttons. A future maintainer would understand the surface
                but might struggle with the conflict-detection code.
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" component="h4" gutterBottom sx={{ fontWeight: 700 }}>
                Polish — 4/5
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                Deployed publicly. Empty states render correctly. Form validation catches obvious
                errors. One known issue: timezone handling when shift spans midnight — a moderate
                edge case. Overall closer to MVP than prototype, but not 5/5 production-ready.
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" component="h4" gutterBottom sx={{ fontWeight: 700 }}>
                Security — 3/5
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                Auth0 handles authentication well. Role-based access (admin vs. volunteer) is
                implemented. Secrets are in environment variables, not committed. But: no rate
                limiting on the sign-up endpoint, and the admin role check happens client-side only
                — the API would let a determined volunteer escalate. Solid foundations with one
                important gap.
              </Typography>
            </Box>

            <Box sx={{ bgcolor: "grey.100", p: 2, borderRadius: 1 }}>
              <Typography variant="body1" sx={{ fontWeight: 700 }}>
                Total: 14/20 (or 28/40 on the full rubric across both judges' scores). A solid
                project worthy of a category prize but not the grand prize.
              </Typography>
            </Box>
          </Paper>
        </Box>

        <Divider sx={{ my: 5 }} />

        {/* Section 4 — Scorecard Template */}
        <Box sx={{ mb: 5 }} id="scorecard">
          <Typography variant="h3" component="h2" gutterBottom>
            The Scorecard Template
          </Typography>

          <Alert severity="info" sx={{ mb: 3 }}>
            Copy and paste this template for your own hackathon. We open-source the framework — no
            attribution required, but we'd love to hear if you adapt it. Email greg@ohack.org with
            feedback.
          </Alert>

          <Box
            component="pre"
            sx={{
              fontFamily: "monospace",
              bgcolor: "grey.100",
              p: 3,
              borderRadius: 1,
              overflow: "auto",
              whiteSpace: "pre",
              fontSize: "0.875rem",
              lineHeight: 1.6,
            }}
          >
            {SCORECARD_TEXT}
          </Box>

          <Box sx={{ mt: 3 }}>
            <Button
              variant="outlined"
              color="primary"
              href="/hackathon-judge-opportunities#upcoming-events"
              startIcon={<GavelRounded />}
              onClick={() => trackClick("interactive_scorecard")}
            >
              Try the Interactive Scorecard
            </Button>
          </Box>
        </Box>

        <Divider sx={{ my: 5 }} />

        {/* Section 5 — Common Judging Pitfalls */}
        <Box sx={{ mb: 5 }}>
          <Typography variant="h3" component="h2" gutterBottom>
            Common Judging Pitfalls
          </Typography>
          <Typography variant="body1" sx={{ fontSize: "18px", mb: 4, maxWidth: "800px", lineHeight: 1.7 }}>
            After hundreds of hackathons we've seen the same judging mistakes repeat. Avoiding
            these doesn't make you a great judge — it just keeps you from being a bad one.
          </Typography>

          {pitfalls.map((pitfall, idx) => (
            <Accordion key={idx} sx={{ mb: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreRounded />}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {pitfall.title}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1" sx={{ fontSize: "16px", lineHeight: 1.7 }}>
                  {pitfall.body}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
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
            Ready to Judge an Opportunity Hack Event?
          </Typography>
          <Typography
            variant="body1"
            sx={{ fontSize: "18px", mb: 4, maxWidth: "600px", mx: "auto", color: "text.secondary" }}
          >
            Apply to judge an upcoming Opportunity Hack hackathon, or browse our other hackathon resources.
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
            <Button
              variant="contained"
              size="large"
              color="primary"
              href="/hackathon-judge-opportunities"
              onClick={() => trackClick("apply_to_judge_final")}
              sx={{ fontSize: "16px" }}
            >
              Apply to Judge
            </Button>
            <Button
              variant="outlined"
              size="large"
              href="/about/mentors"
              onClick={() => trackClick("become_mentor_final")}
              sx={{ fontSize: "16px" }}
            >
              Become a Mentor
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

export default HackathonJudgingCriteria;

export const getStaticProps = async () => {
  const title = "Hackathon Judging Criteria & Scorecard Template | Opportunity Hack";
  const description =
    "Authoritative hackathon judging criteria, scoring rubric, and downloadable scorecard. The 4-category framework Opportunity Hack uses to evaluate projects: Scope, Documentation, Polish, Security. Free to copy and adapt.";
  const canonicalUrl = "https://www.ohack.dev/hackathon-judging-criteria";
  const ogImage = "https://cdn.ohack.dev/ohack.dev/judge_2.jpg";

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
          content: "Expert hackathon judges collaborating during project evaluation sessions at Opportunity Hack",
          key: "twitterimagealt",
        },
        { name: "twitter:creator", property: "twitter:creator", content: "@opportunityhack", key: "twittercreator" },
        {
          name: "keywords",
          property: "keywords",
          content:
            "hackathon judging criteria, hackathon scorecard, hackathon criteria, hackathon scoring rubric, how to judge a hackathon, hackathon evaluation framework, hackathon judging template",
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
              "@type": "CreativeWork",
              name: "Hackathon Judging Rubric — Four-Category Framework",
              description:
                "A four-category scoring rubric (Scope, Documentation, Polish, Security) for evaluating hackathon projects, developed by Opportunity Hack since 2013.",
              author: {
                "@type": "Organization",
                name: "Opportunity Hack",
                url: "https://www.ohack.dev",
              },
              license: "https://creativecommons.org/publicdomain/zero/1.0/",
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
                name: "Hackathon Judging Criteria",
                item: canonicalUrl,
              },
            ],
          },
          {
            "@type": "HowTo",
            name: "How to Judge a Hackathon Project Using the 4-Category Framework",
            description:
              "Score four categories on a 1-5 scale: Scope, Documentation, Polish, Security.",
            estimatedCost: {
              "@type": "MonetaryAmount",
              currency: "USD",
              value: "0",
            },
            totalTime: "PT15M",
            step: [
              {
                "@type": "HowToStep",
                name: "Score Scope",
                text: "Evaluate community impact and problem complexity. Score 1-5.",
              },
              {
                "@type": "HowToStep",
                name: "Score Documentation",
                text: "Evaluate code/UX documentation and ease of understanding. Score 1-5.",
              },
              {
                "@type": "HowToStep",
                name: "Score Polish",
                text: "Evaluate work remaining for MVP and current usability. Score 1-5.",
              },
              {
                "@type": "HowToStep",
                name: "Score Security",
                text: "Evaluate data protection and role-based access. Score 1-5.",
              },
            ],
          },
          {
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "Can I use this rubric for my own hackathon?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes — copy and adapt freely. We open-source the Opportunity Hack judging framework and explicitly invite other hackathon organizers to use it. No attribution is required, though we'd love to hear how you adapt it. Email greg@ohack.org with feedback.",
                },
              },
              {
                "@type": "Question",
                name: "How long does scoring one project take with this rubric?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "A reasonable judge spends 12-20 minutes per project: 4 minutes watching the pitch video, 5-8 minutes reading code and the README, and 3-8 minutes for final scoring and notes. Live demo Q&A adds another 5-10 minutes for finalist projects. A judge handling 8-10 projects can expect a 3-4 hour total commitment.",
                },
              },
              {
                "@type": "Question",
                name: "What if a project doesn't fit cleanly into one of the categories?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Score what's present. A pure-data-pipeline project will score lower on Polish (no UI to evaluate) than a frontend-heavy project, but higher on Documentation and Security in many cases. Don't penalize projects for the categories they don't naturally exercise — let the average reflect the project's actual shape.",
                },
              },
              {
                "@type": "Question",
                name: "How are ties broken?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Multiple judges score each project, and the average is used. If two projects tie within 1 point, the head judge looks at sub-criterion scores and tiebreaker categories — typically Scope (impact) and Polish (production readiness) win out over Documentation in close calls. Ultimately the head judge has discretion.",
                },
              },
              {
                "@type": "Question",
                name: "Should social impact be part of the criteria?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "At Opportunity Hack, social impact is captured inside Scope's sub-criterion A (\"impact on community\"). We deliberately don't have a separate \"social impact\" category — every project at OHack already starts from a real nonprofit problem statement, so impact is the floor not a differentiator. For non-social-good hackathons, you'd swap in a different sub-criterion under Scope.",
                },
              },
              {
                "@type": "Question",
                name: "Is this rubric biased against beginner teams?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Less than you'd think. Scope is independent of seniority — a beginner team that picks a focused problem and ships something narrow can match or beat a senior team that overscoped. Polish and Documentation reward effort and discipline, not raw skill. Security is the one category where senior teams often outscore beginners, but that's been more than offset historically by Scope and Documentation in our data.",
                },
              },
              {
                "@type": "Question",
                name: "Does the rubric work for non-software hackathons?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "The four-category framework generalizes well — Scope, Documentation, Polish, Security mostly map to \"did they pick a real problem\", \"is the work understandable\", \"is the work usable today\", and \"is the work safe\". For hardware, biotech, or design-focused hackathons, Security can become \"safety/ethics\" and the sub-criteria adjust accordingly.",
                },
              },
              {
                "@type": "Question",
                name: "What if I disagree with another judge's score?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Disagreement is normal and useful. Multi-judge scoring is designed to surface different perspectives. If two judges differ by 2+ points on the same project, the head judge brings them together briefly to discuss before final scores are locked. The goal isn't consensus — it's making sure both judges saw the same project. Keep your score if you still believe it after the discussion.",
                },
              },
            ],
          },
        ],
      },
    },
  };
};
