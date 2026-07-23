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
    trackEvent({ action: "click_judge_opportunities", params: { button: buttonName } });
};

const HackathonJudgeOpportunities = () => {
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
          Hackathon Judge Opportunities
        </Typography>

        <Typography
          variant="h5"
          component="h2"
          sx={{ mb: 3, color: "text.secondary", fontWeight: 300 }}
        >
          Discover Expert Judging Opportunities at Global Hackathons for Social Impact
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
          Join an exclusive network of technology professionals evaluating groundbreaking hackathon projects. 
          Our hackathon judge opportunities connect industry experts with innovative teams building solutions 
          for nonprofits worldwide. Apply your technical expertise to identify projects with real social impact 
          potential while advancing your professional network and ESG credentials.
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
              View Judge Opportunities
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
              Explore All Volunteer Roles
            </Button>
          </Grid>
        </Grid>

        {/* Hero Image Section */}
        <Box sx={{ mb: 5, textAlign: "center" }}>
          <Box
            component="img"
            src="https://cdn.ohack.dev/ohack.dev/judge_4_2024.webp"
            alt="Professional hackathon judges evaluating innovative technology solutions for nonprofits"
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
            Professional hackathon judges evaluating innovative technology solutions 
            and providing expert feedback to development teams
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
            Current Hackathon Judge Opportunities
          </Typography>
          <Typography
            variant="body1"
            sx={{ fontSize: "18px", mb: 3, color: "white" }}
          >
            Browse available hackathon judge opportunities and apply to evaluate 
            cutting-edge technology solutions that address real nonprofit challenges. 
            Each judging opportunity includes some basic training and networking with industry leaders.
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
                              "judge_apply_opportunity"
                            )
                          }
                          startIcon={<GavelRounded />}
                        >
                          Apply for Judge Role
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
                No hackathon judge opportunities currently available.
              </Typography>
              <Typography variant="body2">
                Check back soon for new opportunities or{" "}
                <Link
                  href="/hack"
                  style={{ color: "blue", textDecoration: "underline" }}
                >
                  view all hackathons
                </Link>{" "}
                to explore past events and get notified about future judge openings.
              </Typography>
            </Alert>
          )}

          <Box sx={{ mt: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Button
              variant="contained"
              sx={{ bgcolor: "white", color: "primary.main" }}
              href="/hack"
            >
              Browse All Hackathons
            </Button>
            <Button
              variant="outlined"
              sx={{ borderColor: "white", color: "white" }}
              href="/signup"
            >
              Join Judge Network
            </Button>
          </Box>
        </Paper>

        {/* Why These Judge Opportunities Section */}
        <Box sx={{ mb: 5 }}>
          <Typography
            variant="h3"
            component="h2"
            gutterBottom
            sx={{ textAlign: "center" }}
          >
            Why These Hackathon Judge Opportunities Stand Out
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
            Our hackathon judge opportunities offer unique benefits beyond traditional 
            competition judging, focusing on real-world impact and professional development.
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ textAlign: "center", height: "100%", p: 3 }}>
                <BalanceRounded color="primary" sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Real Impact Assessment
                </Typography>
                <Typography variant="body1">
                  Evaluate solutions that nonprofits will actually implement, 
                  ensuring your expertise contributes to measurable social change
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
                  Professional Recognition
                </Typography>
                <Typography variant="body1">
                  Enhance your professional portfolio with documented expertise 
                  in technology evaluation and social impact assessment
                </Typography>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ textAlign: "center", height: "100%", p: 3 }}>
                <GroupsRounded color="success" sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Global Network Access
                </Typography>
                <Typography variant="body1">
                  Connect with fellow judges, innovative development teams, 
                  and mission-driven nonprofit leaders from around the world
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 5 }} />

        {/* Judging Process Section */}
        <Box sx={{ mb: 5 }}>
          <Typography variant="h3" component="h2" gutterBottom>
            Our Professional Judging Process
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
            Our structured judging process ensures fair evaluation while maximizing 
            learning opportunities for both judges and participants.
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ height: "100%", p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <MovieRounded color="primary" sx={{ mr: 2 }} />
                  <Typography variant="h5">Video Pitch Evaluation</Typography>
                </Box>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Review comprehensive 4-minute pitch videos showcasing project 
                  demonstrations, technical architecture, and team presentations.
                </Typography>
                <Chip
                  label="Initial Technical Assessment"
                  color="primary"
                  variant="outlined"
                />
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ height: "100%", p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <LiveTvRounded color="secondary" sx={{ mr: 2 }} />
                  <Typography variant="h5">Live Demo Sessions</Typography>
                </Box>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Engage directly with finalist teams through interactive demos,
                  technical Q&A sessions, and detailed solution evaluations.
                </Typography>
                <Chip
                  label="Final Expert Review"
                  color="secondary"
                  variant="outlined"
                />
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Demo Video Section */}
        <Box sx={{ mb: 5 }}>
          <Typography variant="h3" component="h2" gutterBottom>
            Demo Example: Risk Scoring Solution
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
            Watch this example demo from our volunteer internship program showcasing
            the type of innovative solutions our hackathon participants create for nonprofits.
          </Typography>

          <Paper elevation={3} sx={{ p: 3, textAlign: "center" }}>
            <Box sx={{
              position: "relative",
              paddingBottom: "56.25%",
              height: 0,
              overflow: "hidden",
              maxWidth: "100%",
              marginBottom: 2
            }}>
              <Box
                component="iframe"
                src="https://www.youtube.com/embed/i_KQ0Z-0kkc"
                title="Risk Scoring - End of Summer 2020 Demo - Opportunity Hack Volunteer Internship Program"
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  border: 0
                }}
                allowFullScreen
              />
            </Box>
            <Typography variant="h6" gutterBottom>
              Risk Scoring - End of Summer 2020 Demo
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Example demonstration from our volunteer internship program at Opportunity Hack
            </Typography>
          </Paper>
        </Box>

        <Divider sx={{ my: 5 }} />

        {/* Judging Criteria Section */}
        <Box sx={{ mb: 5 }}>
          <Typography variant="h3" component="h2" gutterBottom>
            Expert Evaluation Criteria & Training
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
            Practice with our comprehensive scoring framework used across all 
            hackathon judge opportunities to ensure consistent, fair evaluations.
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
              Practice with our evaluation framework to prepare for
              hackathon judge opportunities
            </Typography>
          </Paper>

          <Alert severity="info" sx={{ mt: 3 }}>
            <Typography variant="body1">
              Want the full rubric with worked examples and a downloadable scorecard? See the{" "}
              <Link href="/hackathon-judging-criteria" style={{ color: "inherit", fontWeight: 700 }}>
                Hackathon Judging Criteria
              </Link>{" "}
              reference page.
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                color="primary"
                href="/hackathon-judging-criteria"
                onClick={() => trackOnClickButtonClickWithGoogleAndFacebook("view_full_judging_criteria")}
              >
                View Full Judging Criteria
              </Button>
            </Box>
          </Alert>
        </Box>

        {/* Learn More About Our Mission */}
        <Box sx={{ mb: 5 }}>
          <Paper
            elevation={3}
            sx={{
              p: 5,
              textAlign: "center",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              borderRadius: 3
            }}
          >
            <Box sx={{ mb: 3 }}>
              <InfoRounded sx={{ fontSize: 60, mb: 2, opacity: 0.9 }} />
            </Box>

            <Typography variant="h3" component="h2" gutterBottom sx={{ color: "white" }}>
              Learn About Our Mission &amp; Impact
            </Typography>

            <Typography
              variant="body1"
              sx={{
                mb: 4,
                maxWidth: "700px",
                mx: "auto",
                fontSize: "18px",
                color: "rgba(255, 255, 255, 0.9)",
                lineHeight: 1.6
              }}
            >
              Discover how Opportunity Hack has been transforming nonprofits through technology
              since 2013. Meet our founders, learn about our values, and see the real impact
              we're making together with our community of volunteers and judges.
            </Typography>

            <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
              <Button
                variant="contained"
                size="large"
                href="/about"
                onClick={() =>
                  trackOnClickButtonClickWithGoogleAndFacebook("learn_about_mission")
                }
                sx={{
                  bgcolor: "white",
                  color: "primary.main",
                  fontSize: "16px",
                  px: 4,
                  py: 1.5,
                  "&:hover": {
                    bgcolor: "rgba(255, 255, 255, 0.9)"
                  }
                }}
                startIcon={<GroupsRounded />}
              >
                About Opportunity Hack
              </Button>

              <Button
                variant="outlined"
                size="large"
                href="#upcoming-events"
                onClick={() => {
                  document.getElementById("upcoming-events")?.scrollIntoView({
                    behavior: "smooth",
                  });
                  trackOnClickButtonClickWithGoogleAndFacebook("join_judging_from_cta");
                }}
                sx={{
                  borderColor: "white",
                  color: "white",
                  fontSize: "16px",
                  px: 4,
                  py: 1.5,
                  "&:hover": {
                    borderColor: "rgba(255, 255, 255, 0.8)",
                    bgcolor: "rgba(255, 255, 255, 0.1)"
                  }
                }}
                startIcon={<GavelRounded />}
              >
                Join Our Judging Panel
              </Button>
            </Box>
          </Paper>
        </Box>

        {/* FAQ Section */}
        <Box sx={{ mb: 5 }}>
          <Typography variant="h3" component="h2" gutterBottom>
            Frequently Asked Questions
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
            Common questions from technology professionals considering hackathon judge opportunities.
          </Typography>
          {[
            {
              q: "How do I become a hackathon judge at Opportunity Hack?",
              a: "Apply through any active event listed in 'Current Hackathon Judge Opportunities' above. Each event has a dedicated judge application that takes about 5 minutes. We confirm your role within a few days, then send a short training video and the scoring rubric before the event.",
            },
            {
              q: "What's the time commitment for a hackathon judge?",
              a: "Plan on 4–6 hours total: a 30-minute orientation, ~2 hours reviewing 4-minute pitch videos asynchronously the week before, and 2–3 hours of live demo evaluations on the final day of the hackathon. We require judges to attend the live demo block in person whenever the event is in person.",
            },
            {
              q: "Do I need to be in-person to judge a hackathon?",
              a: "We strongly prefer in-person judging during the live demo block — direct teams Q&A is where the real evaluation happens. Remote judging is available for the asynchronous video review portion. For in-person hackathons, plan to arrive by 2pm on the final day.",
            },
            {
              q: "What technical background do I need?",
              a: "Any professional software, data, security, or product background works. Most of our judges are senior engineers, engineering managers, founders, or technical PMs. The scoring rubric (Scope, Documentation, Polish, Security) is designed so any technologist can evaluate fairly — you don't need to be a domain expert in every project.",
            },
            {
              q: "Is judging a hackathon paid?",
              a: "No — judging is a volunteer role. Many judges use it for ESG / corporate-volunteer-time programs at their employer, and we provide an attendance letter on request. Your sponsorship company can also secure dedicated judge slots through the corporate program.",
            },
            {
              q: "What's the scoring framework?",
              a: "Four equal categories scored 1–10: Scope (community impact + problem complexity), Documentation (code/UX clarity + ease of understanding), Polish (work remaining + production readiness), and Security (data protection + role-based access). Try the interactive scorecard above to practice.",
            },
            {
              q: "Can my company sponsor judge slots for our team?",
              a: "Yes. Our Corporate Judge Programs provide guaranteed judging seats for sponsor company teams as part of a sponsorship package. This is a popular professional-development perk and counts toward ESG goals. See the corporate sponsorship section above.",
            },
            {
              q: "What if I've never judged a hackathon before?",
              a: "First-time judges are welcome. We pair new judges with experienced judges in the live demo block, send a short training video covering the rubric, and have a head judge available for tie-breaks and edge cases throughout the event.",
            },
          ].map((item, idx) => (
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

        {/* Corporate Opportunities */}
        <Alert severity="info" sx={{ mb: 5 }}>
          <Typography variant="h6" gutterBottom>
            <CheckCircleRounded sx={{ mr: 1, verticalAlign: "bottom" }} />
            Corporate Judge Programs
          </Typography>
          <Typography variant="body1">
            Companies can secure guaranteed hackathon judge opportunities for their 
            teams through our corporate sponsorship program, enhancing ESG goals 
            while providing valuable professional development experiences.
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              color="primary"
              href="/sponsor"
              onClick={() =>
                trackOnClickButtonClickWithGoogleAndFacebook("corporate_judges")
              }
            >
              Learn About Corporate Judge Programs
            </Button>
          </Box>
        </Alert>

        {/* Additional Judge Image Section */}
        <Box sx={{ mb: 5, textAlign: "center" }}>
          <Box
            component="img"
            src="https://cdn.ohack.dev/ohack.dev/judge_2.jpg"
            alt="Expert hackathon judges collaborating during project evaluation sessions"
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
            Expert judges collaborating during comprehensive project evaluation 
            and feedback sessions
          </Typography>
        </Box>

        {/* Call to Action */}
        <Box sx={{ textAlign: "center", mb: 5 }}>
          <Typography variant="h3" component="h2" gutterBottom>
            Start Your Judging Journey Today
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
            Join our global network of expert judges and help identify the next 
            generation of technology solutions creating lasting social impact.
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
              Browse Judge Opportunities
            </Button>
            <Button
              variant="outlined"
              size="large"
              href="/about/mentors"
              sx={{ fontSize: "16px" }}
            >
              Explore Mentoring Opportunities
            </Button>
            <Button
              variant="outlined"
              size="large"
              href="/volunteer"
              sx={{ fontSize: "16px" }}
            >
              See All Volunteer Roles
            </Button>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default HackathonJudgeOpportunities;

export const getStaticProps = async () => {
    const title = "Hackathon Judge Opportunities - Expert Evaluation Roles | Opportunity Hack";
    const description = "Discover exclusive hackathon judge opportunities to evaluate innovative technology solutions for nonprofits. Join expert judges worldwide in identifying impactful projects and advancing your professional network.";
    const canonicalUrl = "https://www.ohack.dev/hackathon-judge-opportunities";
    return {
        props: {
            title: title,
            description: description,
            canonical: canonicalUrl,
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
                    content: "https://cdn.ohack.dev/ohack.dev/judge_4_2024.webp",
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
                    content: canonicalUrl,
                    key: "url"
                },
                {
                    name: "og:url",
                    property: "og:url",
                    content: canonicalUrl,
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
                    content: "https://cdn.ohack.dev/ohack.dev/judge_4_2024.webp",
                    key: "twitterimage"
                },
                {
                    name: "twitter:image:alt",
                    property: "twitter:image:alt",                    
                    content: "Professional hackathon judges evaluating innovative technology solutions at Opportunity Hack",
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
                        "@id": "https://www.ohack.dev/#organization",
                        "name": "Opportunity Hack",
                        "url": "https://www.ohack.dev",
                        "logo": {
                            "@type": "ImageObject",
                            "url": "https://cdn.ohack.dev/ohack.dev/judge_4_2024.webp"
                        },
                        "sameAs": [
                            "https://twitter.com/opportunityhack",
                            "https://github.com/opportunity-hack",
                            "https://www.linkedin.com/company/opportunity-hack/"
                        ]
                    },
                    {
                        "@type": "WebPage",
                        "@id": canonicalUrl + "#webpage",
                        "url": canonicalUrl,
                        "name": title,
                        "description": description,
                        "isPartOf": {
                            "@type": "WebSite",
                            "@id": "https://www.ohack.dev/#website"
                        },
                        "about": {
                            "@type": "JobPosting",
                            "title": "Hackathon Judge",
                            "description": "Volunteer expert evaluation role: assess innovative technology solutions built by hackers for nonprofit organizations at Opportunity Hack hackathons. Roles open globally for in-person and remote judging.",
                            "hiringOrganization": {
                                "@type": "Organization",
                                "name": "Opportunity Hack",
                                "sameAs": "https://www.ohack.dev"
                            },
                            "employmentType": "VOLUNTEER",
                            "workLocation": {
                                "@type": "Place",
                                "address": "Global / Remote"
                            },
                            "skills": "Technology Evaluation, Project Assessment, Technical Expertise, Social Impact Analysis"
                        }
                    },
                    {
                        "@type": "BreadcrumbList",
                        "itemListElement": [
                            {
                                "@type": "ListItem",
                                "position": 1,
                                "name": "Home",
                                "item": "https://www.ohack.dev"
                            },
                            {
                                "@type": "ListItem",
                                "position": 2,
                                "name": "Hackathon Judge Opportunities",
                                "item": canonicalUrl
                            }
                        ]
                    },
                    {
                        "@type": "FAQPage",
                        "mainEntity": [
                            {
                                "@type": "Question",
                                "name": "How do I become a hackathon judge at Opportunity Hack?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "Apply through any active event listed in 'Current Hackathon Judge Opportunities'. Each event has a dedicated judge application that takes about 5 minutes. We confirm your role within a few days, then send a short training video and the scoring rubric before the event."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "What's the time commitment for a hackathon judge?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "Plan on 4-6 hours total: a 30-minute orientation, about 2 hours reviewing 4-minute pitch videos asynchronously the week before, and 2-3 hours of live demo evaluations on the final day of the hackathon. We require judges to attend the live demo block in person whenever the event is in person."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "Do I need to be in-person to judge a hackathon?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "We strongly prefer in-person judging during the live demo block - direct team Q&A is where the real evaluation happens. Remote judging is available for the asynchronous video review portion. For in-person hackathons, plan to arrive by 2pm on the final day."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "What technical background do I need to judge a hackathon?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "Any professional software, data, security, or product background works. Most judges are senior engineers, engineering managers, founders, or technical product managers. The scoring rubric (Scope, Documentation, Polish, Security) is designed so any technologist can evaluate fairly - you don't need to be a domain expert in every project."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "Is judging a hackathon paid?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "No - judging is a volunteer role. Many judges use it for ESG or corporate-volunteer-time programs at their employer, and we provide an attendance letter on request. Sponsor companies can also secure dedicated judge slots through our corporate sponsorship program."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "What's the hackathon judging scoring framework?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "Four equal categories scored 1-10: Scope (community impact + problem complexity), Documentation (code/UX clarity + ease of understanding), Polish (work remaining + production readiness), and Security (data protection + role-based access). Practice with the interactive scorecard on this page."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "Can my company sponsor judge slots for our team?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "Yes. Our Corporate Judge Programs provide guaranteed judging seats for sponsor company teams as part of a sponsorship package. This is a popular professional-development perk that also counts toward ESG goals."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "What if I've never judged a hackathon before?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "First-time judges are welcome. We pair new judges with experienced judges in the live demo block, send a short training video covering the rubric, and have a head judge available for tie-breaks and edge cases throughout the event."
                                }
                            }
                        ]
                    }
                ]
            }
        },
    };
};
