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
    trackEvent({ action: "click_judge_hackathon", params: { button: buttonName } });
};

const JudgeHackathon = () => {
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
          Judge Hackathon
        </Typography>

        <Typography
          variant="h5"
          component="h2"
          sx={{ mb: 3, color: "text.secondary", fontWeight: 300 }}
        >
          Judge Hackathon Projects and Drive Social Impact Through Technology
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
          Ready to judge hackathon projects that create real-world impact? Join our expert 
          evaluation panels to assess innovative technology solutions developed for nonprofits. 
          When you judge hackathon competitions with us, you'll evaluate cutting-edge projects, 
          mentor talented development teams, and help identify solutions that nonprofits will 
          actually implement to serve their communities.
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
              Judge Hackathon Events
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
              Other Ways to Help
            </Button>
          </Grid>
        </Grid>

        {/* Hero Image Section */}
        <Box sx={{ mb: 5, textAlign: "center" }}>
          <Box
            component="img"
            src="https://cdn.ohack.dev/ohack.dev/judge_1.jpg"
            alt="Expert panel ready to judge hackathon projects for maximum social impact"
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
            Expert panel ready to judge hackathon projects and identify 
            solutions with maximum social impact potential
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
            Judge Hackathon Events
          </Typography>
          <Typography
            variant="body1"
            sx={{ fontSize: "18px", mb: 3, color: "white" }}
          >
            Apply to judge hackathon competitions and help identify the most promising 
            technology solutions for nonprofit organizations. Each opportunity to judge 
            hackathon events includes training, networking, and professional recognition.
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
                              "apply_judge_hackathon"
                            )
                          }
                          startIcon={<GavelRounded />}
                        >
                          Judge This Hackathon
                        </Button>
                        <Button
                          variant="outlined"
                          href={`/hack/${event.event_id}`}
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
            <Alert
              severity="info"
              sx={{ bgcolor: "rgba(255,255,255,0.9)", color: "text.primary" }}
            >
              <Typography variant="body1" gutterBottom>
                No hackathon events currently seeking judges.
              </Typography>
              <Typography variant="body2">
                New opportunities to judge hackathon events are posted regularly.{" "}
                <Link
                  href="/hack"
                  style={{ color: "blue", textDecoration: "underline" }}
                >
                  Explore all hackathons
                </Link>{" "}
                to stay informed about upcoming events where you can judge hackathon projects.
              </Typography>
            </Alert>
          )}

          <Box sx={{ mt: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Button
              variant="contained"
              sx={{ bgcolor: "white", color: "primary.main" }}
              href="/hack"
            >
              View All Hackathons
            </Button>
            <Button
              variant="outlined"
              sx={{ borderColor: "white", color: "white" }}
              href="/signup"
            >
              Join Judge Community
            </Button>
          </Box>
        </Paper>

        {/* Why Judge Hackathon Projects Section */}
        <Box sx={{ mb: 5 }}>
          <Typography
            variant="h3"
            component="h2"
            gutterBottom
            sx={{ textAlign: "center" }}
          >
            Why Judge Hackathon Projects?
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
            When you judge hackathon competitions, you gain unique insights into emerging 
            technologies while contributing to solutions that create measurable social impact.
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ textAlign: "center", height: "100%", p: 3 }}>
                <BalanceRounded color="primary" sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Shape Real Solutions
                </Typography>
                <Typography variant="body1">
                  Judge hackathon projects that nonprofits will actually deploy, 
                  ensuring your evaluation expertise contributes to tangible social outcomes
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
                  Professional Excellence
                </Typography>
                <Typography variant="body1">
                  Build your expertise in technology evaluation and social impact 
                  assessment while enhancing your professional reputation
                </Typography>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ textAlign: "center", height: "100%", p: 3 }}>
                <GroupsRounded color="success" sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Innovation Network
                </Typography>
                <Typography variant="body1">
                  Connect with fellow experts who judge hackathon events, innovative 
                  development teams, and nonprofit partners worldwide
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 5 }} />

        {/* How to Judge Hackathon Projects Section */}
        <Box sx={{ mb: 5 }}>
          <Typography variant="h3" component="h2" gutterBottom>
            How to Judge Hackathon Projects Effectively
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
            Our comprehensive framework ensures that when you judge hackathon competitions, 
            you provide thorough, fair, and valuable evaluations.
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ height: "100%", p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <MovieRounded color="primary" sx={{ mr: 2 }} />
                  <Typography variant="h5">Project Presentation Review</Typography>
                </Box>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Judge hackathon submissions through detailed video presentations 
                  showcasing technical implementation, team collaboration, and impact potential.
                </Typography>
                <Chip
                  label="Comprehensive Analysis"
                  color="primary"
                  variant="outlined"
                />
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ height: "100%", p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <LiveTvRounded color="secondary" sx={{ mr: 2 }} />
                  <Typography variant="h5">Interactive Team Evaluation</Typography>
                </Box>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Judge hackathon finalists through live demonstrations and Q&A sessions, 
                  providing direct feedback and technical guidance.
                </Typography>
                <Chip
                  label="Expert Interaction"
                  color="secondary"
                  variant="outlined"
                />
              </Card>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 5 }} />

        {/* Judge Hackathon Training Section */}
        <Box sx={{ mb: 5 }}>
          <Typography variant="h3" component="h2" gutterBottom>
            Judge Hackathon Training & Evaluation Standards
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
            Learn our proven evaluation methodology that ensures consistency when 
            you judge hackathon projects across all our global events.
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
              Master our framework to effectively judge hackathon projects
            </Typography>
          </Paper>
        </Box>

        {/* Corporate Judge Hackathon Programs */}
        <Alert severity="info" sx={{ mb: 5 }}>
          <Typography variant="h6" gutterBottom>
            <CheckCircleRounded sx={{ mr: 1, verticalAlign: "bottom" }} />
            Corporate Programs to Judge Hackathon Events
          </Typography>
          <Typography variant="body1">
            Companies can provide opportunities for their teams to judge hackathon 
            competitions through our corporate sponsorship program, building employee 
            skills while supporting nonprofit technology advancement.
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              color="primary"
              href="/sponsor"
              onClick={() =>
                trackOnClickButtonClickWithGoogleAndFacebook("corporate_judge_hackathon")
              }
            >
              Corporate Judge Programs
            </Button>
          </Box>
        </Alert>

        {/* Additional Image Section */}
        <Box sx={{ mb: 5, textAlign: "center" }}>
          <Box
            component="img"
            src="https://cdn.ohack.dev/ohack.dev/judge_2.jpg"
            alt="Experts collaborating to judge hackathon projects and provide valuable feedback"
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
            Experts collaborating to judge hackathon projects and provide 
            valuable feedback to development teams
          </Typography>
        </Box>

        {/* Call to Action */}
        <Box sx={{ textAlign: "center", mb: 5 }}>
          <Typography variant="h3" component="h2" gutterBottom>
            Ready to Judge Hackathon Projects?
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
            Join our community of experts and help judge hackathon competitions that 
            identify the most promising technology solutions for nonprofit organizations.
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
              Judge Hackathon Events
            </Button>
            <Button
              variant="outlined"
              size="large"
              href="/about/mentors"
              sx={{ fontSize: "16px" }}
            >
              Consider Mentoring
            </Button>
            <Button
              variant="outlined"
              size="large"
              href="/volunteer"
              sx={{ fontSize: "16px" }}
            >
              Explore All Opportunities
            </Button>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default JudgeHackathon;

export const getStaticProps = async () => {    
    const title = "Judge Hackathon - Evaluate Innovation for Social Impact | Opportunity Hack";
    const description = "Judge hackathon projects that create real social impact. Evaluate innovative technology solutions for nonprofits, mentor development teams, and help identify the most promising projects.";
    return {
        props: {
            title: "Judge Hackathon - Opportunity Hack",
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
                    content: "https://ohack.dev/judge-hackathon",
                    key: "url"
                },
                {
                    name: "og:url",
                    property: "og:url",
                    content: "https://ohack.dev/judge-hackathon",
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
                    content: "Experts evaluating hackathon projects for social impact at Opportunity Hack",
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
                        "@id": "https://ohack.dev/judge-hackathon#webpage",
                        "url": "https://ohack.dev/judge-hackathon",
                        "name": title,
                        "description": description,
                        "isPartOf": {
                            "@type": "WebSite",
                            "@id": "https://ohack.dev/#website"
                        },
                        "about": {
                            "@type": "Action",
                            "name": "Judge Hackathon", 
                            "description": "Evaluate innovative technology solutions for nonprofit organizations at global hackathon competitions",
                            "target": "Social impact technology projects"
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
                                "name": "Judge Hackathon",
                                "item": "https://ohack.dev/judge-hackathon"
                            }
                        ]
                    }
                ]
            }
        },
    };
};
