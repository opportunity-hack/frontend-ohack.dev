import React, { useState, useEffect } from "react";
import Link from "next/link";
import { initFacebookPixel, trackEvent } from "../lib/ga";
import useHackathonEvents from '../hooks/use-hackathon-events';
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
  Slider,
  Tooltip,
  Alert,
  Chip,
  Divider,
  CircularProgress
} from "@mui/material";

import {
  GavelRounded,
  EmojiEventsRounded,
  BusinessRounded,
  GroupsRounded,
  EventRounded,
  LocationOnRounded,
  CalendarTodayRounded,
  ExpandMoreRounded,
  InfoRounded,
  MovieRounded,
  LiveTvRounded,
  AssessmentRounded,
  CheckCircleRounded,
  BalanceRounded,
  TrendingUpRounded,
  PersonRounded,
  WorkRounded
} from "@mui/icons-material";

const trackOnClickButtonClickWithGoogleAndFacebook = (buttonName) => {
    trackEvent({ action: "click_hackathon_judge", params: { button: buttonName } });
};

const HackathonJudge = () => {
  const [scores, setScores] = useState({
    scopeImpact: 3,
    scopeComplexity: 3,
    documentationCode: 3,
    documentationEase: 3,
    polishWorkRemaining: 3,
    polishCanUseToday: 3,    
    securityData: 3,
    securityRole: 3,
  });

  const [totalScore, setTotalScore] = useState(0);
  const { hackathons: upcomingEvents, loading: loadingEvents } = useHackathonEvents("current");

  useEffect(() => {
    initFacebookPixel();
  }, []);

  useEffect(() => {
    const newTotalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
    setTotalScore(newTotalScore);
  }, [scores]);

  const formatEventDate = (startDate, endDate) => {
    const start = Moment(startDate);
    const end = Moment(endDate);
    
    if (start.format('YYYY-MM-DD') === end.format('YYYY-MM-DD')) {
      return start.format('dddd, MMMM Do YYYY');
    }
    
    return `${start.format('MMM D')} - ${end.format('MMM D, YYYY')}`;
  };

  const handleScoreChange = (criterion) => (_, newValue) => {
    setScores((prevScores) => ({ ...prevScores, [criterion]: newValue }));
  };

  const getDescription = (score) => {
    const descriptions = {
      1: "Poor - Significantly below expectations",
      2: "Fair - Below expectations",
      3: "Good - Meets expectations",
      4: "Very Good - Exceeds expectations",
      5: "Excellent - Significantly exceeds expectations",
    };
    return descriptions[score] || "";
  };

  const criteriaInfo = [
    {
      category: "scope",
      name: "Scope of Solution",
      maxPoints: 10,
      subCriteria: [
        {
          name: "Impact on Community - how many people and nonprofits are impacted by this solution?",
          key: "scopeImpact",
        },
        {
          name: "Complexity of Problem Solved - how hard was this to do versus what is already out there?",
          key: "scopeComplexity",
        },
      ],
      tip: "Consider both breadth and depth of impact. Evaluate community impact and problem complexity.",
    },
    {
      category: "documentation",
      name: "Documentation",
      maxPoints: 10,
      subCriteria: [
        {
          name: "Code and UX Documentation - clear how to use the solution",
          key: "documentationCode",
        },
        {
          name: "Ease of Understanding - straightforward design",
          key: "documentationEase",
        },
      ],
      tip: "Assess documentation quality and clarity. Consider project sustainability.",
    },
    {
      category: "polish",
      name: "Polish",
      maxPoints: 10,
      subCriteria: [
        {
          name: "Work remaining - minimal work remaining for MVP",
          key: "polishWorkRemaining",
        },
        {
          name: "Can use today - deployed in the cloud, able to be shipped now",
          key: "polishCanUseToday",
        },
      ],
      tip: "Evaluate overall refinement and readiness for real-world use.",
    },
    {
      category: "security",
      name: "Security",
      maxPoints: 10,
      subCriteria: [
        {
          name: "Data Protection - hard to gain access to data because of security controls",
          key: "securityData",
        },
        {
          name: "Role-based Security - admin versus public access (where applicable)",
          key: "securityRole",
        },
      ],
      tip: "Assess data protection and role-based security implementation.",
    },
  ];

  const renderSlider = (criterion, maxPoints) => (
    <Box sx={{ width: "100%", mt: 2 }}>
      <Typography variant="subtitle1">{criterion.name}</Typography>
      <Slider
        value={scores[criterion.key]}
        valueLabelFormat={getDescription}
        onChange={handleScoreChange(criterion.key)}
        valueLabelDisplay="auto"
        step={1}
        marks
        min={1}
        max={5}
        sx={{ mt: 1 }}
      />
      <Typography variant="body1" sx={{ mt: 1 }}>
        Score: {scores[criterion.key]} / 5 ({scores[criterion.key]} points)
      </Typography>
    </Box>
  );

  return (
    <Container maxWidth="lg">
      <Box sx={{ padding: "2rem", fontSize: "1em" }}>
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: "2.5rem", sm: "3rem", md: "3.5rem" },
            mb: 2,
            mt: 10,
          }}
        >
          Hackathon Judge
        </Typography>

        <Typography
          variant="h5"
          component="h2"
          sx={{ mb: 3, color: "text.secondary", fontWeight: 300 }}
        >
          Become a Hackathon Judge and Shape the Future of Social Impact Technology
        </Typography>

        <Typography
          variant="body1"
          sx={{
            fontSize: "18px",
            mb: 4,
            maxWidth: "800px",
            mx: "auto",
            lineHeight: 1.7,
          }}
        >
          Step into the role of a hackathon judge and leverage your technical expertise 
          to evaluate groundbreaking solutions that address real nonprofit challenges. 
          As a hackathon judge, you'll assess innovative projects, provide constructive 
          feedback to development teams, and help identify the most promising solutions 
          for sustainable social impact across global communities.
        </Typography>

        <Grid
          container
          spacing={2}
          sx={{ maxWidth: "600px", mx: "auto", mb: 4 }}
        >
          <Grid size={{ xs: 12, sm: 6 }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              href="#upcoming-events"
              startIcon={<EventRounded />}
              onClick={() => {
                setTimeout(() => {
                  document.getElementById("upcoming-events")?.scrollIntoView({
                    behavior: "smooth",
                  });
                }, 100);
              }}
            >
              Apply as Judge
            </Button>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Button
              variant="outlined"
              color="primary"
              size="large"
              fullWidth
              href="/volunteer"
              startIcon={<GroupsRounded />}
            >
              Other Volunteer Roles
            </Button>
          </Grid>
        </Grid>

        {/* Hero Image Section */}
        <Box sx={{ mb: 5, textAlign: "center" }}>
          <Box
            component="img"
            src="https://cdn.ohack.dev/ohack.dev/judge_1.jpg"
            alt="Experienced hackathon judge evaluating innovative technology solutions for nonprofits"
            sx={{
              width: "100%",
              maxWidth: "800px",
              height: "auto",
              borderRadius: 2,
              boxShadow: 3,
              mb: 2,
            }}
          />
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              fontStyle: "italic",
              display: "block",
            }}
          >
            Experienced hackathon judge evaluating innovative technology solutions 
            and mentoring development teams
          </Typography>
        </Box>

        {/* Upcoming Events Section */}
        <Paper
          sx={{ p: 4, mb: 5, bgcolor: "primary.light", color: "white" }}
          id="upcoming-events"
        >
          <Typography
            variant="h3"
            component="h2"
            gutterBottom
            sx={{ color: "white" }}
          >
            <GavelRounded sx={{ mr: 2, verticalAlign: "bottom" }} />
            Become a Hackathon Judge
          </Typography>
          <Typography
            variant="body1"
            sx={{ fontSize: "18px", mb: 3, color: "white" }}
          >
            Apply to serve as a hackathon judge at our upcoming events. Each hackathon 
            judge role includes some initial training, expert networking opportunities, 
            and the chance to shape the future of nonprofit technology solutions.
          </Typography>

          {loadingEvents ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
              <CircularProgress color="inherit" />
            </Box>
          ) : upcomingEvents && upcomingEvents.length > 0 ? (
            <Grid container spacing={3}>
              {upcomingEvents.map((event) => (
                <Grid size={{ xs: 12, md: 6 }} key={event.event_id}>
                  <Card
                    sx={{
                      bgcolor: "white",
                      color: "text.primary",
                      height: "100%",
                    }}
                  >
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
                          href={`/hack/${event.event_id}/judge-application`}
                          onClick={() =>
                            trackOnClickButtonClickWithGoogleAndFacebook(
                              "apply_hackathon_judge"
                            )
                          }
                          startIcon={<GavelRounded />}
                        >
                          Apply as Judge
                        </Button>
                        <Button
                          variant="outlined"
                          href={`/hack/${event.event_id}`}
                        >
                          Learn More
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Alert
              severity="info"
              sx={{ bgcolor: "rgba(255,255,255,0.9)", color: "text.primary" }}
            >
              <Typography variant="body1" gutterBottom>
                No hackathon judge positions currently available.
              </Typography>
              <Typography variant="body2">
                New hackathon judge roles are posted regularly. Check back soon or{" "}
                <Link
                  href="/hack"
                  style={{ color: "blue", textDecoration: "underline" }}
                >
                  explore all hackathons
                </Link>{" "}
                to stay informed about upcoming events and judge applications.
              </Typography>
            </Alert>
          )}

          <Box sx={{ mt: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Button
              variant="contained"
              sx={{ bgcolor: "white", color: "primary.main" }}
              href="/hack"
            >
              Browse Hackathons
            </Button>
            <Button
              variant="outlined"
              sx={{ borderColor: "white", color: "white" }}
              href="/signup"
            >
              Join Community
            </Button>
          </Box>
        </Paper>

        {/* Why Become a Hackathon Judge Section */}
        <Box sx={{ mb: 5 }}>
          <Typography
            variant="h3"
            component="h2"
            gutterBottom
            sx={{ textAlign: "center" }}
          >
            Why Become a Hackathon Judge?
          </Typography>
          <Typography
            variant="body1"
            sx={{
              textAlign: "center",
              mb: 4,
              maxWidth: "700px",
              mx: "auto",
              fontSize: "18px",
              color: "text.secondary",
            }}
          >
            Serving as a hackathon judge offers unique professional and personal 
            benefits while contributing to meaningful technological advancement.
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ textAlign: "center", height: "100%", p: 3 }}>
                <BalanceRounded color="primary" sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Drive Real Change
                </Typography>
                <Typography variant="body1">
                  As a hackathon judge, identify solutions that nonprofits will actually 
                  deploy, ensuring your evaluation directly contributes to positive social outcomes
                </Typography>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ textAlign: "center", height: "100%", p: 3 }}>
                <TrendingUpRounded
                  color="secondary"
                  sx={{ fontSize: 48, mb: 2 }}
                />
                <Typography variant="h5" gutterBottom>
                  Professional Growth
                </Typography>
                <Typography variant="body1">
                  Enhance your evaluation skills and build a distinguished portfolio 
                  of social impact contributions valuable for career advancement
                </Typography>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ textAlign: "center", height: "100%", p: 3 }}>
                <GroupsRounded color="success" sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Expert Community
                </Typography>
                <Typography variant="body1">
                  Connect with fellow hackathon judges, innovative developers, 
                  and nonprofit leaders from diverse industries worldwide
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 5 }} />

        {/* What Hackathon Judges Do Section */}
        <Box sx={{ mb: 5 }}>
          <Typography variant="h3" component="h2" gutterBottom>
            What Hackathon Judges Do
          </Typography>
          <Typography
            variant="body1"
            sx={{
              mb: 4,
              maxWidth: "700px",
              fontSize: "18px",
              color: "text.secondary",
            }}
          >
            Our hackathon judge role involves comprehensive evaluation through 
            multiple assessment phases designed to identify the most impactful solutions.
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ height: "100%", p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <MovieRounded color="primary" sx={{ mr: 2 }} />
                  <Typography variant="h5">Video Pitch Assessment</Typography>
                </Box>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Review detailed 4-minute presentations showcasing technical solutions, 
                  team dynamics, and implementation strategies as a hackathon judge.
                </Typography>
                <Chip
                  label="Technical Review Phase"
                  color="primary"
                  variant="outlined"
                />
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ height: "100%", p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <LiveTvRounded color="secondary" sx={{ mr: 2 }} />
                  <Typography variant="h5">Live Demo Evaluation</Typography>
                </Box>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Participate in interactive sessions with finalist teams, asking 
                  technical questions and providing expert feedback as a hackathon judge.
                </Typography>
                <Chip
                  label="Interactive Assessment"
                  color="secondary"
                  variant="outlined"
                />
              </Card>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 5 }} />

        {/* Hackathon Judge Training Section */}
        <Box sx={{ mb: 5 }}>
          <Typography variant="h3" component="h2" gutterBottom>
            Hackathon Judge Training & Evaluation Framework
          </Typography>
          <Typography
            variant="body1"
            sx={{
              mb: 4,
              maxWidth: "700px",
              fontSize: "18px",
              color: "text.secondary",
            }}
          >
            Master our comprehensive evaluation framework that every hackathon judge 
            uses to ensure consistent, fair, and thorough project assessments.
          </Typography>

          {criteriaInfo.map((criterion) => (
            <Accordion key={criterion.category} sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreRounded />}>
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  {criterion.name} ({criterion.maxPoints} points)
                </Typography>
                <Tooltip
                  title={<span style={{ fontSize: 14 }}>{criterion.tip}</span>}
                  enterDelay={0}
                  enterTouchDelay={0}
                  arrow
                >
                  <InfoRounded color="primary" sx={{ ml: 1 }} />
                </Tooltip>
              </AccordionSummary>
              <AccordionDetails>
                {criterion.subCriteria
                  ? criterion.subCriteria.map((subCriterion) =>
                      renderSlider(subCriterion, 5)
                    )
                  : renderSlider(
                      { name: criterion.name, key: criterion.category },
                      criterion.maxPoints
                    )}
              </AccordionDetails>
            </Accordion>
          ))}

          <Paper elevation={3} sx={{ p: 3, mt: 2, textAlign: "center" }}>
            <AssessmentRounded
              sx={{ fontSize: 40, mb: 2, color: "primary.main" }}
            />
            <Typography variant="h5" gutterBottom>
              Training Score: {totalScore}/40
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Practice with our hackathon judge evaluation framework
            </Typography>
          </Paper>
        </Box>

        {/* Corporate Judge Opportunities */}
        <Alert severity="info" sx={{ mb: 5 }}>
          <Typography variant="h6" gutterBottom>
            <CheckCircleRounded sx={{ mr: 1, verticalAlign: "bottom" }} />
            Corporate Hackathon Judge Programs
          </Typography>
          <Typography variant="body1">
            Companies can provide hackathon judge opportunities for their employees 
            through our corporate sponsorship program, enhancing team skills while 
            supporting meaningful social impact initiatives.
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              color="primary"
              href="/sponsor"
              onClick={() =>
                trackOnClickButtonClickWithGoogleAndFacebook("corporate_judge_program")
              }
            >
              Corporate Judge Programs
            </Button>
          </Box>
        </Alert>

        {/* Additional Hackathon Judge Image Section */}
        <Box sx={{ mb: 5, textAlign: "center" }}>
          <Box
            component="img"
            src="https://cdn.ohack.dev/ohack.dev/judge_2.jpg"
            alt="Hackathon judge providing detailed feedback and guidance to development teams"
            sx={{
              width: "100%",
              maxWidth: "800px",
              height: "auto",
              borderRadius: 2,
              boxShadow: 3,
              mb: 2,
            }}
          />
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              fontStyle: "italic",
              display: "block",
            }}
          >
            Hackathon judge providing detailed feedback and guidance to development teams
          </Typography>
        </Box>

        {/* Call to Action */}
        <Box sx={{ textAlign: "center", mb: 5 }}>
          <Typography variant="h3" component="h2" gutterBottom>
            Start Your Journey as a Hackathon Judge
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
            Join our community of expert hackathon judges and help identify the next 
            generation of technology solutions that will transform nonprofit operations worldwide.
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
              href="#upcoming-events"
              onClick={() => {
                document.getElementById("upcoming-events")?.scrollIntoView({
                  behavior: "smooth",
                });
              }}
              sx={{ fontSize: "16px" }}
            >
              Apply as Hackathon Judge
            </Button>
            <Button
              variant="outlined"
              size="large"
              href="/about/mentors"
              sx={{ fontSize: "16px" }}
            >
              Explore Mentoring
            </Button>
            <Button
              variant="outlined"
              size="large"
              href="/volunteer"
              sx={{ fontSize: "16px" }}
            >
              See All Opportunities
            </Button>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default HackathonJudge;

export const getStaticProps = async () => {    
    const title = "Hackathon Judge - Evaluate Tech Solutions for Social Impact | Opportunity Hack";
    const description = "Become a hackathon judge and evaluate innovative technology solutions for nonprofits. Use your expertise to identify impactful projects and mentor development teams at global hackathons.";
    return {
        props: {
            title: "Hackathon Judge - Opportunity Hack",
            description: description,
            openGraphData: [
                {
                    name: "title",
                    property: "title",
                    content: title,
                    key: "title"
                },
                {
                    name: "og:title",
                    property: "og:title",
                    content: title,
                    key: "ogtitle"
                },
                {
                    name: "author",
                    property: "author",
                    content: "Opportunity Hack",
                    key: "author"
                },
                {
                    name: "og:description",
                    property: "og:description",
                    content: description,
                    key: "ogdescription"
                },                                
                {
                    name: "image",
                    property: "og:image",
                    content: "https://cdn.ohack.dev/ohack.dev/judge_1.jpg",
                    key: "ognameimage"
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
                    content: "https://ohack.dev/hackathon-judge",
                    key: "url"
                },
                {
                    name: "og:url",
                    property: "og:url",
                    content: "https://ohack.dev/hackathon-judge",
                    key: "ogurl"
                },
                {
                    name: "twitter:card",
                    property: "twitter:card",
                    content: "summary_large_image",
                    key: "twittercard"
                },
                {
                    name: "twitter:site",
                    property: "twitter:site",
                    content: "@opportunityhack",
                    key: "twittersite"
                },
                {
                    name: "twitter:title",
                    property: "twitter:title",
                    content: title,
                    key: "twittertitle"
                },
                {
                    name: "twitter:description",
                    property: "twitter:description",
                    content: description,
                    key: "twitterdesc"
                },
                {
                    name: "twitter:image",
                    property: "twitter:image",
                    content: "https://cdn.ohack.dev/ohack.dev/judge_1.jpg",
                    key: "twitterimage"
                },
                {
                    name: "twitter:image:alt",
                    property: "twitter:image:alt",                    
                    content: "Hackathon judge evaluating innovative technology solutions at Opportunity Hack",
                    key: "twitterimagealt"
                },
                {
                    name: "twitter:creator",
                    property: "twitter:creator",
                    content: "@opportunityhack",
                    key: "twittercreator"
                }               
            ],
            structuredData: {
                "@context": "https://schema.org",
                "@graph": [
                    {
                        "@type": "Organization",
                        "@id": "https://ohack.dev/#organization",
                        "name": "Opportunity Hack",
                        "url": "https://ohack.dev",
                        "logo": {
                            "@type": "ImageObject",
                            "url": "https://cdn.ohack.dev/ohack.dev/judge_1.jpg"
                        },
                        "sameAs": [
                            "https://twitter.com/opportunityhack",
                            "https://github.com/opportunity-hack"
                        ]
                    },
                    {
                        "@type": "WebPage",
                        "@id": "https://ohack.dev/hackathon-judge#webpage",
                        "url": "https://ohack.dev/hackathon-judge",
                        "name": title,
                        "description": description,
                        "isPartOf": {
                            "@type": "WebSite",
                            "@id": "https://ohack.dev/#website"
                        },
                        "about": {
                            "@type": "Role",
                            "name": "Hackathon Judge", 
                            "description": "Expert evaluation role for technology professionals to assess innovative nonprofit solutions",
                            "skills": ["Technology Assessment", "Project Evaluation", "Technical Expertise", "Mentoring"]
                        }
                    },
                    {
                        "@type": "BreadcrumbList",
                        "itemListElement": [
                            {
                                "@type": "ListItem",
                                "position": 1,
                                "name": "Home",
                                "item": "https://ohack.dev"
                            },
                            {
                                "@type": "ListItem",
                                "position": 2,
                                "name": "Hackathon Judge",
                                "item": "https://ohack.dev/hackathon-judge"
                            }
                        ]
                    }
                ]
            }
        },
    };
};
