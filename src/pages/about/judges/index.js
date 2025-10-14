import React, { useState, useEffect } from "react";
import Link from "next/link";
import { initFacebookPixel, trackEvent } from "../../../lib/ga";
import useHackathonEvents from '../../../hooks/use-hackathon-events';
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
  CircularProgress,
  IconButton,
  Snackbar
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
  WorkRounded,
  LinkRounded,
  PlayCircleOutlineRounded
} from "@mui/icons-material";

// Constants for better maintainability
const JUDGING_CONSTANTS = {
  TOTAL_POINTS: 40,
  POINTS_PER_CATEGORY: 10,
  MIN_SCORE: 1,
  MAX_SCORE: 5,
  DEFAULT_SCORE: 3
};

const SCORE_DESCRIPTIONS = {
  1: "Poor - Significantly below expectations",
  2: "Fair - Below expectations", 
  3: "Good - Meets expectations",
  4: "Very Good - Exceeds expectations",
  5: "Excellent - Significantly exceeds expectations",
};

const FAQ_DATA = [
  {
    id: "prepare",
    question: "What do judges need to do to prepare?",
    answer: "Great question! Here's your judge prep checklist: 📋<br/><br/>• Review this page thoroughly (you're already crushing it!)<br/>• Watch our orientation video and confirm you've watched it<br/>• If it's a weekend hackathon, you can start reviewing projects as early as Sunday morning on both DevPost and GitHub<br/>• Find the links for teams you'll be judging at the judge dashboard<br/><br/>Pro tip: Come caffeinated and ready to be amazed by what these teams build! ☕",
    actionButton: {
      text: "Go to Judge Dashboard",
      href: "/judge"
    }
  },
  {
    id: "attendance",
    question: "Do I need to be there the entire weekend?", 
    answer: "Nope! You've got flexibility here. 🎯<br/><br/>• Check the hackathon schedule to understand the flow<br/>• Arrive whenever works for you<br/>• Feel free to chat with participants throughout the event<br/>• Just remember: judging officially starts at 3pm on the final day<br/><br/>One important note: unless your company is sponsoring, please don't recruit or ask for resumes (save that for after!), and keep individual team interactions to about 3 minutes max - these hackers are in the zone! ⏰"
  },
  {
    id: "travel",
    question: "What are the travel details? Where should I stay and how do I get there?",
    answer: "All the logistics you need are on the specific hackathon event page! 🗺️<br/><br/>Each event has its own travel guide, recommended hotels, parking info, and local tips. We've got you covered with all the details to make your judging experience smooth."
  },
  {
    id: "communication", 
    question: "How do I communicate with you?",
    answer: "We'll hook you up with a private Slack channel just for judges! 💬<br/><br/>You'll get the invite in your welcome email about 3 weeks before the event. It's where you can ask questions, coordinate with other judges, and get real-time updates. Judge headquarters - but with more emoji and definitely more fun."
  },
  {
    id: "response-time",
    question: "How quickly will I hear back about my application?",
    answer: "We aim to get back to you within a week! 📬<br/><br/>Because we get so many amazing judge applications (seriously, you all rock!), we review them in batches weekly. You'll get an email either confirming your spot or respectfully declining.<br/><br/>If we're at capacity for judging, definitely consider mentoring instead - it's remote-friendly and equally impactful!",
    actionButton: {
      text: "Learn About Mentoring",
      href: "/about/mentors"
    }
  },
  {
    id: "process",
    question: "Can you tell me more about the overall Opportunity Hack process?",
    answer: "Absolutely! 🎬<br/><br/>Here's the TL;DR: We typically run one major in-person hackathon each year around October (perfect timing for internship season and fall graduation). It's a well-oiled machine designed to create maximum impact for nonprofits while giving participants an incredible experience.",
    actionButton: {
      text: "See Our Process",
      href: "/about/process"
    }
  },
  {
    id: "participants",
    question: "Is the hackathon only for students?",
    answer: "Not at all! We welcome everyone. 🌟<br/><br/>We've seen bootcamp grads, seasoned professionals, high schoolers, and college students all collaborating beautifully. In Arizona specifically, about 70% are students from ASU, University of Arizona, GCU, UAT, Maricopa Community Colleges, and other local schools.<br/><br/>The diversity of backgrounds and experience levels is what makes the magic happen!"
  }
];

const trackOnClickButtonClickWithGoogleAndFacebook = (buttonName) => {
    trackEvent("click_judges", buttonName);
};

const AboutJudges = () => {
  const [scores, setScores] = useState({
    scopeImpact: JUDGING_CONSTANTS.DEFAULT_SCORE,
    scopeComplexity: JUDGING_CONSTANTS.DEFAULT_SCORE,
    documentationCode: JUDGING_CONSTANTS.DEFAULT_SCORE,
    documentationEase: JUDGING_CONSTANTS.DEFAULT_SCORE,
    polishWorkRemaining: JUDGING_CONSTANTS.DEFAULT_SCORE,
    polishCanUseToday: JUDGING_CONSTANTS.DEFAULT_SCORE,
    securityData: JUDGING_CONSTANTS.DEFAULT_SCORE,
    securityRole: JUDGING_CONSTANTS.DEFAULT_SCORE,
    accessibility: JUDGING_CONSTANTS.DEFAULT_SCORE,
  });

  const [totalScore, setTotalScore] = useState(0);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  
  // Use the same hook as mentor page for consistency
  const { hackathons: upcomingEvents, loading: loadingEvents, error: eventsError } = useHackathonEvents("current");

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
    return SCORE_DESCRIPTIONS[score] || "";
  };

  const handleFaqToggle = (faqId) => {
    setExpandedFaq(expandedFaq === faqId ? null : faqId);
  };

  const navigateToAnchor = (anchorId) => {
    setTimeout(() => {
      document.getElementById(anchorId)?.scrollIntoView({
        behavior: "smooth",
      });
    }, 100);
  };

  const copyLinkToSection = (sectionId) => {
    const url = `${window.location.origin}${window.location.pathname}#${sectionId}`;
    navigator.clipboard.writeText(url).then(() => {
      setSnackbar({ open: true, message: 'Link copied to clipboard!' });
      trackOnClickButtonClickWithGoogleAndFacebook(`copy_link_${sectionId}`);
    }).catch(() => {
      setSnackbar({ open: true, message: 'Failed to copy link' });
    });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ open: false, message: '' });
  };

  const SectionHeader = ({ variant = "h3", component = "h2", children, sectionId, sx = {} }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, ...sx }}>
      <Typography
        variant={variant}
        component={component}
        id={sectionId}
        sx={{ mr: 1 }}
      >
        {children}
      </Typography>
      <Tooltip title="Copy link to this section" arrow>
        <IconButton
          onClick={() => copyLinkToSection(sectionId)}
          sx={{ 
            opacity: 0.6,
            '&:hover': { opacity: 1 },
            color: 'text.secondary'
          }}
          size="small"
        >
          <LinkRounded fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );

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

  const specialCategoriesInfo = [
    {
      category: "accessibility",
      name: "Accessibility",
      maxPoints: 5,
      description: "Accessibility is important when building software. This special category prize recognizes teams that excel at implementing the four W3C accessibility principles: perceivable, operable, understandable, and robust. Winning teams typically achieve a Lighthouse Accessibility score over 95.",
      subCriteria: [
        {
          name: "Accessibility Implementation - how well does the solution consider users with disabilities?",
          key: "accessibility",
        },
      ],
      tip: "Special category prizes are judged separately and don't affect main scoring. Consider W3C principles and Lighthouse scores.",
      reference: "https://www.w3.org/WAI/fundamentals/accessibility-principles/"
    }
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
          Become a Judge
        </Typography>

        <Typography
          variant="h5"
          component="h2"
          sx={{ mb: 3, color: "text.secondary", fontWeight: 300 }}
        >
          Evaluate Technology Solutions That Change Lives
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
          Use your expertise to identify and recognize the most impactful
          technology solutions for nonprofits. As a judge, you'll evaluate
          projects based on innovation, social impact, and technical excellence
          while helping teams improve their solutions through constructive
          feedback.
        </Typography>

        <Grid
          container
          spacing={2}
          sx={{ maxWidth: "600px", mx: "auto", mb: 4 }}
        >
          <Grid item xs={12} sm={6}>
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
              Find Events to Judge
            </Button>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button
              variant="outlined"
              color="primary"
              size="large"
              fullWidth
              href="/volunteer"
              startIcon={<GroupsRounded />}
            >
              Explore All Roles
            </Button>
          </Grid>
        </Grid>

        {/* Hero Image Section */}
        <Box sx={{ mb: 5, textAlign: "center" }}>
          <Box
            component="img"
            src="https://cdn.ohack.dev/ohack.dev/judge_1.jpg"
            alt="Presentation of awards after judges evaluated hackathon projects and provided feedback to teams"
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
            Presentation of awards after judges evaluated hackathon projects and
            provided feedback to teams
          </Typography>
        </Box>

        {/* Upcoming Events Section */}
        <Paper
          sx={{ p: 4, mb: 5, bgcolor: "primary.light", color: "white" }}
          id="upcoming-events"
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, color: "white" }}>
            <Typography
              variant="h3"
              component="h2"
              id="upcoming-events"
              sx={{ mr: 1, color: "white" }}
            >
              <GavelRounded sx={{ mr: 2, verticalAlign: "bottom" }} />
              Upcoming Judging Opportunities
            </Typography>
            <Tooltip title="Copy link to this section" arrow>
              <IconButton
                onClick={() => copyLinkToSection('upcoming-events')}
                sx={{ 
                  opacity: 0.6,
                  '&:hover': { opacity: 1 },
                  color: 'white'
                }}
                size="small"
              >
                <LinkRounded fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          
          <Typography
            variant="body1"
            sx={{ fontSize: "18px", mb: 3, color: "white" }}
          >
            Join one of our upcoming hackathons as a judge and help identify the
            most impactful nonprofit technology solutions.
          </Typography>

          {loadingEvents ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
              <CircularProgress color="inherit" />
            </Box>
          ) : eventsError ? (
            <Alert 
              severity="error"
              sx={{ bgcolor: "rgba(255,255,255,0.9)", color: "text.primary" }}
            >
              <Typography variant="body1">
                Unable to load upcoming events. Please try refreshing the page or{" "}
                <Link href="/hack" style={{ color: "blue", textDecoration: "underline" }}>
                  view all hackathons
                </Link>.
              </Typography>
            </Alert>
          ) : upcomingEvents && upcomingEvents.length > 0 ? (
            <Grid container spacing={3}>
              {upcomingEvents.map((event) => (
                <Grid item xs={12} md={6} key={event.event_id}>
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
                              "judge_apply_upcoming"
                            )
                          }
                          startIcon={<GavelRounded />}
                        >
                          Apply to Judge
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
                No upcoming events scheduled at the moment.
              </Typography>
              <Typography variant="body2">
                Check back soon or{" "}
                <Link
                  href="/hack"
                  style={{ color: "blue", textDecoration: "underline" }}
                >
                  view all hackathons
                </Link>{" "}
                to see past events and get notified about future opportunities.
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
              Join Our Community
            </Button>
          </Box>
        </Paper>

        {/* Why Judge Section */}
        <Box sx={{ mb: 5 }}>
          <SectionHeader 
            variant="h3" 
            component="h2" 
            sectionId="why-judge"
            sx={{ textAlign: "center" }}
          >
            Why Become a Judge?
          </SectionHeader>
          
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
            Judging at Opportunity Hack allows you to shape the future of
            technology for social good while building valuable professional
            connections.
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card sx={{ textAlign: "center", height: "100%", p: 3 }}>
                <BalanceRounded color="primary" sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Shape Social Impact
                </Typography>
                <Typography variant="body1">
                  Help identify and recognize solutions that nonprofits will
                  actually implement to help their communities
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ textAlign: "center", height: "100%", p: 3 }}>
                <TrendingUpRounded
                  color="secondary"
                  sx={{ fontSize: 48, mb: 2 }}
                />
                <Typography variant="h5" gutterBottom>
                  Enhance Professional Profile
                </Typography>
                <Typography variant="body1">
                  Demonstrate expertise and community involvement valuable for
                  career growth and visa applications
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ textAlign: "center", height: "100%", p: 3 }}>
                <GroupsRounded color="success" sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Build Networks
                </Typography>
                <Typography variant="body1">
                  Connect with industry leaders, innovative teams, and
                  mission-driven nonprofits from around the world
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 5 }} />

        {/* Judging Process Section */}
        <Box sx={{ mb: 5 }}>
          <SectionHeader 
            variant="h3" 
            component="h2" 
            sectionId="how-judging-works"
          >
            How Judging Works
          </SectionHeader>
          
          <Typography
            variant="body1"
            sx={{
              mb: 4,
              maxWidth: "700px",
              fontSize: "18px",
              color: "text.secondary",
            }}
          >
            Our judging process is designed to fairly evaluate projects while
            providing valuable feedback to teams.
          </Typography>

          {/* Video CTA Section */}
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              mb: 4, 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              textAlign: 'center'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
              <MovieRounded sx={{ fontSize: 40, mr: 2 }} />
              <Typography variant="h5" component="h3">
                Watch Our Complete Judging Overview
              </Typography>
            </Box>
            <Typography 
              variant="body1" 
              sx={{ 
                mb: 3, 
                fontSize: '16px',
                opacity: 0.9,
                maxWidth: '600px',
                mx: 'auto'
              }}
            >
              Get the full insider view of our judging process! Watch real judges explain the scoring system, see live demo evaluations, and understand exactly how we identify the most impactful nonprofit technology solutions.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                sx={{ 
                  bgcolor: 'white', 
                  color: 'primary.main',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  px: 4,
                  py: 1.5,
                  '&:hover': { 
                    bgcolor: 'rgba(255,255,255,0.9)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  },
                  transition: 'all 0.3s ease'
                }}
                href="/about/judges/overview"
                onClick={() => trackOnClickButtonClickWithGoogleAndFacebook("watch_judging_video")}
                startIcon={<PlayCircleOutlineRounded />}
              >
                Watch Judging Overview Video
              </Button>
              <Button
                variant="outlined"
                size="large"
                sx={{ 
                  borderColor: 'white', 
                  color: 'white',
                  fontSize: '14px',
                  '&:hover': { 
                    bgcolor: 'rgba(255,255,255,0.1)',
                    borderColor: 'white'
                  }
                }}
                href="#judging-criteria"
                onClick={() => navigateToAnchor("judging-criteria")}
              >
                See Scoring Criteria
              </Button>
            </Box>
          </Paper>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: "100%", p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <MovieRounded color="primary" sx={{ mr: 2 }} />
                  <Typography variant="h5">Stage 1</Typography>
                </Box>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Evaluate 4-minute pitch videos showcasing project demos and
                  team presentations.

                  In online hackathons, judges ask questions directly in team's Slack channels during this round.
                </Typography>
                <Chip
                  label="Initial Assessment"
                  color="primary"
                  variant="outlined"
                />
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: "100%", p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <LiveTvRounded color="secondary" sx={{ mr: 2 }} />
                  <Typography variant="h5">Stage 2: Live Demos</Typography>
                </Box>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Interact with top teams, ask questions, and provide direct
                  feedback on their solutions.
                </Typography>
                <Chip
                  label="Final Evaluation"
                  color="secondary"
                  variant="outlined"
                />
              </Card>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 5 }} />

        {/* Judging Criteria Section */}
        <Box sx={{ mb: 5 }}>
          <SectionHeader 
            variant="h3" 
            component="h2" 
            sectionId="judging-criteria"
          >
            Judging Criteria & Practice Scoring
          </SectionHeader>
          
          <Typography
            variant="body1"
            sx={{
              mb: 4,
              maxWidth: "700px",
              fontSize: "18px",
              color: "text.secondary",
            }}
          >
            Practice using our scoring system to familiarize yourself with the
            criteria. Each project is evaluated across four key areas.
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
              Practice Total Score: {totalScore}/40
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Use the sliders above to practice scoring and understand our
              evaluation criteria
            </Typography>
          </Paper>

          {/* Special Categories Section */}
          <Divider sx={{ my: 4 }} />

          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>
              Special Category Prizes
            </Typography>
            <Typography
              variant="body1"
              sx={{
                mb: 3,
                fontSize: "16px",
                color: "text.secondary",
              }}
            >
              In addition to the main judging criteria, we may offer special category prizes that recognize excellence in specific areas. These are judged separately and do not affect the main competition scoring.
            </Typography>

            {specialCategoriesInfo.map((criterion) => (
              <Accordion key={criterion.category} sx={{ mb: 2, borderLeft: '4px solid', borderColor: 'warning.main' }}>
                <AccordionSummary expandIcon={<ExpandMoreRounded />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <Typography variant="h6" sx={{ fontWeight: "bold", flexGrow: 1 }}>
                      {criterion.name} ({criterion.maxPoints} points)
                    </Typography>
                    <Chip
                      label="Special Prize"
                      size="small"
                      color="warning"
                      variant="outlined"
                      sx={{ mr: 1 }}
                    />
                    <Tooltip
                      title={<span style={{ fontSize: 14 }}>{criterion.tip}</span>}
                      enterDelay={0}
                      enterTouchDelay={0}
                      arrow
                    >
                      <InfoRounded color="primary" />
                    </Tooltip>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  {criterion.description && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        {criterion.description}
                        {criterion.reference && (
                          <>
                            {' '}
                            <Link
                              href={criterion.reference}
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{ color: 'primary.main', textDecoration: 'underline' }}
                            >
                              Learn more
                            </Link>
                          </>
                        )}
                      </Typography>
                    </Alert>
                  )}
                  {criterion.subCriteria
                    ? criterion.subCriteria.map((subCriterion) =>
                        renderSlider(subCriterion, criterion.maxPoints)
                      )
                    : renderSlider(
                        { name: criterion.name, key: criterion.category },
                        criterion.maxPoints
                      )}
                </AccordionDetails>
              </Accordion>
            ))}

            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Note:</strong> Special category prizes are judged only during Round 1 and do not contribute to the overall team score. Winners are determined by averaging all judges' scores for that specific category.
              </Typography>
            </Alert>
          </Box>
        </Box>

        {/* Sponsorship Recognition */}
        <Alert severity="info" sx={{ mb: 5 }} id="corporate-sponsorship">
          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
            <Box sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6" sx={{ mr: 1 }}>
                  <CheckCircleRounded sx={{ mr: 1, verticalAlign: "bottom" }} />
                  Corporate Sponsorship Opportunities
                </Typography>
                <Tooltip title="Copy link to this section" arrow>
                  <IconButton
                    onClick={() => copyLinkToSection('corporate-sponsorship')}
                    sx={{ 
                      opacity: 0.6,
                      '&:hover': { opacity: 1 },
                      color: 'info.main'
                    }}
                    size="small"
                  >
                    <LinkRounded fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Typography variant="body1">
                Companies can enhance their ESG profile and secure guaranteed judge
                positions through sponsorship. Learn more about how your
                organization can support our mission while gaining valuable
                exposure.
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  href="/sponsor"
                  onClick={() =>
                    trackOnClickButtonClickWithGoogleAndFacebook("sponsorship_cta")
                  }
                >
                  Learn About Corporate Sponsorship
                </Button>
              </Box>
            </Box>
          </Box>
        </Alert>

        {/* Additional Judge Image Section */}
        <Box sx={{ mb: 5, textAlign: "center" }}>
          <Box
            component="img"
            src="https://cdn.ohack.dev/ohack.dev/judge_2.jpg"
            alt="Judges collaborating and discussing project evaluations at hackathon"
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
            Judges collaborating to evaluate and provide feedback on innovative
            solutions
          </Typography>
        </Box>

        {/* FAQ Section */}
        <Box sx={{ mb: 5 }} id="judge-faq">
          <SectionHeader 
            variant="h3" 
            component="h2" 
            sectionId="judge-faq"
            sx={{ textAlign: "center" }}
          >
            Frequently Asked Questions
          </SectionHeader>
          
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
            Got questions? We've got answers! Here are the most common questions from our amazing judge community.
          </Typography>

          {FAQ_DATA.map((faq, index) => (
            <Accordion 
              key={faq.id} 
              expanded={expandedFaq === faq.id}
              onChange={() => handleFaqToggle(faq.id)}
              sx={{ mb: 2 }}
            >
              <AccordionSummary 
                expandIcon={<ExpandMoreRounded />}
                id={`faq-${faq.id}-header`}
                aria-controls={`faq-${faq.id}-content`}
              >
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  {faq.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontSize: "16px", 
                    lineHeight: 1.6,
                    "& a": {
                      color: "primary.main",
                      textDecoration: "underline"
                    },
                    "& br": {
                      marginBottom: "0.5em"
                    },
                    mb: faq.actionButton ? 2 : 0
                  }}
                  dangerouslySetInnerHTML={{ __html: faq.answer }}
                />
                {faq.actionButton && (
                  <Box sx={{ mt: 2 }}>
                    <Link href={faq.actionButton.href} passHref>
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        onClick={() => 
                          trackOnClickButtonClickWithGoogleAndFacebook(`faq_${faq.id}_cta`)
                        }
                      >
                        {faq.actionButton.text}
                      </Button>
                    </Link>
                  </Box>
                )}
              </AccordionDetails>
            </Accordion>
          ))}

          <Box sx={{ mt: 4, textAlign: "center" }}>
            <Typography variant="body1" sx={{ mb: 2, color: "text.secondary" }}>
              Still have questions? We're here to help!
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              href="/contact"
              onClick={() => trackOnClickButtonClickWithGoogleAndFacebook("faq_contact")}
            >
              Get in Touch
            </Button>
          </Box>
        </Box>

        <Divider sx={{ my: 5 }} />

        {/* Call to Action */}
        <Box sx={{ textAlign: "center", mb: 5 }}>
          <SectionHeader 
            variant="h3" 
            component="h2" 
            sectionId="ready-to-help"
            sx={{ textAlign: "center" }}
          >
            Ready to Make a Difference?
          </SectionHeader>
          
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
            Join our community of judges helping to identify and nurture
            technology solutions that create lasting social impact.
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
              onClick={() => navigateToAnchor("upcoming-events")}
              sx={{ fontSize: "16px" }}
            >
              Find Events to Judge
            </Button>
            <Button
              variant="outlined"
              size="large"
              href="#judge-faq"
              onClick={() => navigateToAnchor("judge-faq")}
              sx={{ fontSize: "16px" }}
            >
              Read the FAQ
            </Button>
            <Link href="/about/mentors" passHref>
              <Button
                variant="outlined"
                size="large"
                sx={{ fontSize: "16px" }}
              >
                Consider Mentoring Instead
              </Button>
            </Link>
          </Box>
        </Box>

        {/* Toast Notification */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={handleSnackbarClose}
          message={snackbar.message}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        />
      </Box>
    </Container>
  );
};

export default AboutJudges;

export const getStaticProps = async () => {    
    const title = "Judge Guide - Evaluate Tech Solutions for Social Impact | Opportunity Hack";
    const description = "Become an Opportunity Hack judge and evaluate innovative technology solutions that transform nonprofits. Use your expertise to identify projects creating real social impact worldwide.";
    return {
        props: {
            title: "Judge Guide - Opportunity Hack",
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
                    content: "https://ohack.dev/about/judges",
                    key: "url"
                },
                {
                    name: "og:url",
                    property: "og:url",
                    content: "https://ohack.dev/about/judges",
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
                    content: "Judges evaluating hackathon projects and providing feedback to teams at Opportunity Hack",
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
                        "@id": "https://ohack.dev/about/judges#webpage",
                        "url": "https://ohack.dev/about/judges",
                        "name": title,
                        "description": description,
                        "isPartOf": {
                            "@type": "WebSite",
                            "@id": "https://ohack.dev/#website"
                        },
                        "about": {
                            "@type": "EducationalOrganization",
                            "name": "Opportunity Hack Judging Program", 
                            "description": "Judges use their expertise as experienced professionals to give feedback to teams building technology solutions for nonprofits"
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
                                "name": "About",
                                "item": "https://ohack.dev/about"
                            },
                            {
                                "@type": "ListItem",
                                "position": 3,
                                "name": "Judges",
                                "item": "https://ohack.dev/about/judges"
                            }
                        ]
                    }
                ]
            }
        },
    };
};
