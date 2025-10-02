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
  Alert,
  Chip,
  Divider,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton
} from "@mui/material";

import {
  CodeRounded,
  RocketLaunchRounded,
  GroupsRounded,
  EventRounded,
  LocationOnRounded,
  CalendarTodayRounded,
  LaptopRounded,
  BuildRounded,
  CloudRounded,
  SchoolRounded,
  TipsAndUpdatesRounded,
  AutoAwesomeRounded,
  SpeedRounded,
  OpenInNewRounded,
  PlayArrowRounded,
  CheckCircleRounded,
  EmojiEventsRounded,
  FavoriteRounded,
  BusinessRounded,
  PersonRounded,
  PublicRounded,
  AccessTimeRounded,
  FlashOnRounded,
  TrendingUpRounded,
  WorkspacesRounded,
  LinkRounded
} from "@mui/icons-material";

const trackOnClickButtonClickWithGoogleAndFacebook = (buttonName) => {
  trackEvent("click_hackers", buttonName);
};

// Component for section headings with anchor links
const SectionHeading = ({ id, variant = "h3", children, sx = {}, icon }) => {
  const [showLink, setShowLink] = useState(false);
  
  const handleCopyLink = () => {
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    navigator.clipboard.writeText(url);
    window.history.pushState(null, '', `#${id}`);
  };

  return (
    <Box
      id={id}
      sx={{ 
        position: 'relative',
        scrollMarginTop: '100px', // Offset for fixed headers
        mb: 2
      }}
      onMouseEnter={() => setShowLink(true)}
      onMouseLeave={() => setShowLink(false)}
    >
      <Typography
        variant={variant}
        component="h2"
        gutterBottom
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          ...sx
        }}
      >
        {icon}
        {children}
        <IconButton
          size="small"
          onClick={handleCopyLink}
          sx={{
            opacity: showLink ? 1 : 0,
            transition: 'opacity 0.2s',
            ml: 1
          }}
          aria-label="Copy link to section"
        >
          <LinkRounded fontSize="small" />
        </IconButton>
      </Typography>
    </Box>
  );
};

const AboutHackers = () => {
  // Use the same hook as other pages for consistency
  const { hackathons: upcomingEvents, loading: loadingEvents } = useHackathonEvents("current");

  useEffect(() => {
    initFacebookPixel();
  }, []);

  const formatEventDate = (startDate, endDate) => {
    const start = Moment(startDate);
    const end = Moment(endDate);
    
    if (start.format('YYYY-MM-DD') === end.format('YYYY-MM-DD')) {
      return start.format('dddd, MMMM Do YYYY');
    }
    
    return `${start.format('MMM D')} - ${end.format('MMM D, YYYY')}`;
  };

  const toolboxItems = [
    {
      name: "Epic Stack",
      description: "Full-stack web application framework with TypeScript, React, Remix, Prisma, and more",
      url: "https://www.epicweb.dev/epic-stack",
      icon: <RocketLaunchRounded />
    },
    {
      name: "Next.js",
      description: "React framework for production with server-side rendering and static generation",
      url: "https://nextjs.org/",
      icon: <CodeRounded />
    },
    {
      name: "Supabase",
      description: "Open source Firebase alternative with PostgreSQL, authentication, and real-time subscriptions",
      url: "https://supabase.com/",
      icon: <CloudRounded />
    },
    {
      name: "Vercel",
      description: "Platform for frontend developers with instant deployment and global CDN",
      url: "https://vercel.com/",
      icon: <SpeedRounded />
    },
    {
      name: "Tailwind CSS",
      description: "Utility-first CSS framework for rapidly building custom designs",
      url: "https://tailwindcss.com/",
      icon: <AutoAwesomeRounded />
    },
    {
      name: "Prisma",
      description: "Next-generation ORM for Node.js and TypeScript",
      url: "https://www.prisma.io/",
      icon: <BuildRounded />
    }
  ];

  const whatToBringItems = [
    {
      icon: <LaptopRounded />,
      title: "Your Laptop",
      description: "Fully charged with your favorite development environment set up"
    },
    {
      icon: <CodeRounded />,
      title: "Development Skills",
      description: "Programming knowledge in any language - we welcome all skill levels"
    },
    {
      icon: <TipsAndUpdatesRounded />,
      title: "Creative Problem-Solving",
      description: "Open mindset to tackle real-world nonprofit challenges"
    },
    {
      icon: <GroupsRounded />,
      title: "Collaborative Spirit",
      description: "Enthusiasm for working with diverse teams and sharing knowledge"
    },
    {
      icon: <FavoriteRounded />,
      title: "Passion for Good",
      description: "Desire to use technology to create positive social impact"
    },
    {
      icon: <EmojiEventsRounded />,
      title: "Competitive Energy",
      description: "Drive to build something amazing in a short timeframe"
    }
  ];

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
          Become a Hacker
        </Typography>

        <Typography
          variant="h5"
          component="h2"
          sx={{ mb: 3, color: "text.secondary", fontWeight: 300 }}
        >
          Build Technology Solutions That Transform Nonprofits
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
          Join passionate developers, designers, and innovators who transform nonprofit 
          challenges into powerful technology solutions. Whether you're a seasoned pro or 
          just starting your coding journey, our hackathons provide the perfect environment 
          to learn, create, and make a real difference.
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
              Find Events to Join
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

        {/* YouTube Video Section */}
        <Box sx={{ mb: 5, textAlign: "center" }}>
          <SectionHeading 
            id="what-is-a-hacker" 
            variant="h4"
            sx={{ textAlign: "center", justifyContent: "center" }}
            icon={<PlayArrowRounded sx={{ mr: 1 }} />}
          >
            What is a Hacker?
          </SectionHeading>
          <Typography
            variant="body1"
            sx={{
              mb: 3,
              maxWidth: "600px",
              mx: "auto",
              fontSize: "16px",
              color: "text.secondary",
            }}
          >
            Get a quick introduction to what hackers do at Opportunity Hack and how 
            you can make a difference through code.
          </Typography>
          <Box
            sx={{
              position: "relative",
              paddingBottom: "56.25%", // 16:9 aspect ratio
              height: 0,
              overflow: "hidden",
              maxWidth: "800px",
              mx: "auto",
              borderRadius: 2,
              boxShadow: 3,
            }}
          >
            <Box
              component="iframe"
              src="https://www.youtube.com/embed/7hrwuBlbCzQ?si=c3RsM0pqEFjak_eS"
              title="What is a Hacker at Opportunity Hack?"
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                border: "none",
              }}
              allowFullScreen
            />
          </Box>
        </Box>

        {/* Hero Image Section */}
        <Box sx={{ mb: 5, textAlign: "center" }}>
          <Box
            component="img"
            src="https://cdn.ohack.dev/ohack.dev/2024_hackathon_1.webp"
            alt="Passionate hackers collaborating on technology solutions for nonprofits at Opportunity Hack"
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
            Hackers collaborating on innovative solutions for nonprofits
          </Typography>
        </Box>

        {/* Upcoming Events Section */}
        <Paper
          sx={{ p: 4, mb: 5, bgcolor: "primary.light", color: "white" }}
        >
          <SectionHeading 
            id="upcoming-events" 
            variant="h3"
            sx={{ color: "white" }}
            icon={<CodeRounded sx={{ mr: 2 }} />}
          >
            Upcoming Hackathons
          </SectionHeading>
          <Typography
            variant="body1"
            sx={{ fontSize: "18px", mb: 3, color: "white" }}
          >
            Join one of our upcoming hackathons and start building solutions that 
            make a real difference for nonprofits around the world.
          </Typography>

          {loadingEvents ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
              <CircularProgress color="inherit" />
            </Box>
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
                          href={`/hack/${event.event_id}/hacker-application`}
                          onClick={() =>
                            trackOnClickButtonClickWithGoogleAndFacebook(
                              "hacker_apply_upcoming"
                            )
                          }
                          startIcon={<CodeRounded />}
                        >
                          Join as Hacker
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

        {/* Team Creation Video Section */}
        <Box sx={{ mb: 5, textAlign: "center" }}>
          <SectionHeading 
            id="team-creation" 
            variant="h4"
            sx={{ textAlign: "center", justifyContent: "center" }}
            icon={<GroupsRounded sx={{ mr: 1 }} />}
          >
            How to Find and Create Your Team
          </SectionHeading>
          <Typography
            variant="body1"
            sx={{
              mb: 3,
              maxWidth: "700px",
              mx: "auto",
              fontSize: "16px",
              color: "text.secondary",
            }}
          >
            Once accepted to a hackathon, you can find teammates and create your team 
            before the event begins. This walkthrough shows you how to use our team 
            matching system, create a team, get your Slack channel, and receive approval 
            to start working on your nonprofit project.
          </Typography>
          <Box
            sx={{
              position: "relative",
              paddingBottom: "56.25%", // 16:9 aspect ratio
              height: 0,
              overflow: "hidden",
              maxWidth: "800px",
              mx: "auto",
              borderRadius: 2,
              boxShadow: 3,
            }}
          >
            <Box
              component="iframe"
              src="https://www.youtube.com/embed/cUvbkG91Rf4"
              title="Hacker Team Creation: Opportunity Hack Hackathon ASU October 2025"
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                border: "none",
              }}
              allowFullScreen
            />
          </Box>
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              fontStyle: "italic",
              display: "block",
              mt: 2,
            }}
          >
            Step-by-step guide: Finding teammates, creating your team, and getting started with your nonprofit project
          </Typography>
        </Box>

        {/* What Hackers Do Section */}
        <Box sx={{ mb: 5 }}>
          <SectionHeading 
            id="what-hackers-do" 
            variant="h3"
            sx={{ textAlign: "center", justifyContent: "center" }}
            icon={null}
          >
            What Do Hackers Do?
          </SectionHeading>
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
            At Opportunity Hack, hackers are the creative problem-solvers who turn 
            nonprofit challenges into functional, impactful technology solutions.
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card sx={{ textAlign: "center", height: "100%", p: 3 }}>
                <TipsAndUpdatesRounded color="primary" sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Problem Solving
                </Typography>
                <Typography variant="body1">
                  Analyze real nonprofit challenges and brainstorm innovative 
                  technology solutions that address root causes
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ textAlign: "center", height: "100%", p: 3 }}>
                <BuildRounded color="secondary" sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Rapid Development
                </Typography>
                <Typography variant="body1">
                  Build functional prototypes and MVPs using modern frameworks 
                  and best practices in just 48 hours
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ textAlign: "center", height: "100%", p: 3 }}>
                <GroupsRounded color="success" sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Team Collaboration
                </Typography>
                <Typography variant="body1">
                  Work alongside designers, product managers, and other developers 
                  to create well-rounded solutions
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Why Join Section */}
        <Box sx={{ mb: 5 }}>
          <SectionHeading 
            id="why-become-hacker" 
            variant="h3"
            sx={{ textAlign: "center", justifyContent: "center" }}
            icon={null}
          >
            Why Become a Hacker?
          </SectionHeading>
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
            Joining as a hacker offers unique opportunities to grow your skills, 
            build your portfolio, and create meaningful change.
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: "100%", p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <SchoolRounded color="primary" sx={{ mr: 2 }} />
                  <Typography variant="h5">Learn & Grow</Typography>
                </Box>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Accelerate your development skills by working on real projects 
                  with mentorship from industry experts.
                </Typography>
                <Chip
                  label="Skill Development"
                  color="primary"
                  variant="outlined"
                />
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: "100%", p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <BusinessRounded color="secondary" sx={{ mr: 2 }} />
                  <Typography variant="h5">Build Portfolio</Typography>
                </Box>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Create compelling projects that demonstrate your abilities to 
                  potential employers and clients.
                </Typography>
                <Chip
                  label="Career Growth"
                  color="secondary"
                  variant="outlined"
                />
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: "100%", p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <PublicRounded color="success" sx={{ mr: 2 }} />
                  <Typography variant="h5">Make Real Impact</Typography>
                </Box>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  See your code solve actual problems and help nonprofits 
                  serve their communities more effectively.
                </Typography>
                <Chip
                  label="Social Good"
                  color="success"
                  variant="outlined"
                />
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: "100%", p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <PersonRounded color="warning" sx={{ mr: 2 }} />
                  <Typography variant="h5">Network & Connect</Typography>
                </Box>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Meet like-minded developers, industry professionals, and 
                  nonprofit leaders from around the world.
                </Typography>
                <Chip
                  label="Professional Network"
                  color="warning"
                  variant="outlined"
                />
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* The Hackathon Never Stops Section */}
        <Paper
          sx={{ 
            p: 4, 
            mb: 5, 
            bgcolor: "success.main", 
            color: "white",
            position: "relative",
            overflow: "hidden"
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: -20,
              right: -20,
              opacity: 0.1,
              transform: "rotate(15deg)"
            }}
          >
            <FlashOnRounded sx={{ fontSize: 120 }} />
          </Box>
          
          <SectionHeading 
            id="hackathon-never-stops" 
            variant="h3"
            sx={{ color: "white", position: "relative", zIndex: 1 }}
            icon={<AccessTimeRounded sx={{ mr: 2 }} />}
          >
            Why Wait? The Hackathon Never Stops!
          </SectionHeading>
          
          <Typography
            variant="h6"
            sx={{ 
              fontSize: "20px", 
              mb: 3, 
              color: "white",
              fontWeight: 500,
              position: "relative",
              zIndex: 1
            }}
          >
            ⚡ Start building solutions TODAY - no event required!
          </Typography>
          
          <Typography
            variant="body1"
            sx={{ 
              fontSize: "18px", 
              mb: 4, 
              color: "white",
              position: "relative",
              zIndex: 1,
              maxWidth: "800px"
            }}
          >
            While others wait for the next scheduled event, smart developers are already 
            building their portfolios, gaining experience, and making real impact. Every 
            day you wait is a day you could be coding for good.
          </Typography>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <Card sx={{ bgcolor: "rgba(255,255,255,0.95)", height: "100%", p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <TrendingUpRounded color="success" sx={{ mr: 2 }} />
                  <Typography variant="h6" color="text.primary">
                    Build Momentum
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Start small, build confidence, and create a consistent coding habit 
                  that accelerates your growth
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ bgcolor: "rgba(255,255,255,0.95)", height: "100%", p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <WorkspacesRounded color="primary" sx={{ mr: 2 }} />
                  <Typography variant="h6" color="text.primary">
                    Choose Your Adventure
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Browse dozens of real nonprofit projects and pick the one that 
                  matches your interests and skill level
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ bgcolor: "rgba(255,255,255,0.95)", height: "100%", p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <GroupsRounded color="secondary" sx={{ mr: 2 }} />
                  <Typography variant="h6" color="text.primary">
                    Join Active Community
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Connect with developers worldwide who are already collaborating 
                  on impactful projects in our Slack community
                </Typography>
              </Card>
            </Grid>
          </Grid>

          <Alert 
            severity="info" 
            sx={{ 
              bgcolor: "rgba(255,255,255,0.9)", 
              color: "text.primary",
              mb: 3,
              "& .MuiAlert-icon": {
                color: "success.main"
              }
            }}
          >
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              <strong>🚀 Pro Tip:</strong> Developers who start working on projects before 
              scheduled hackathons often become team leaders and have higher success rates. 
              You'll arrive with experience, confidence, and proven skills.
            </Typography>
          </Alert>

          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", position: "relative", zIndex: 1 }}>
            <Button
              variant="contained"
              size="large"
              sx={{ 
                bgcolor: "white", 
                color: "success.main",
                "&:hover": { bgcolor: "grey.100" },
                fontSize: "16px",
                fontWeight: 600
              }}
              href="/projects"
              onClick={() =>
                trackOnClickButtonClickWithGoogleAndFacebook("start_now_projects")
              }
            >
              🎯 Browse Projects & Start Today
            </Button>
            <Button
              variant="outlined"
              size="large"
              sx={{ 
                borderColor: "white", 
                color: "white",
                "&:hover": { 
                  borderColor: "white", 
                  bgcolor: "rgba(255,255,255,0.1)" 
                },
                fontSize: "16px"
              }}
              href="/signup"
              onClick={() =>
                trackOnClickButtonClickWithGoogleAndFacebook("start_now_slack")
              }
            >
              💬 Join Slack Community
            </Button>
          </Box>

          <Typography
            variant="body2"
            sx={{ 
              mt: 3, 
              color: "rgba(255,255,255,0.8)",
              fontStyle: "italic",
              position: "relative",
              zIndex: 1
            }}
          >
            "The best time to plant a tree was 20 years ago. The second best time is now." 
            - Start your social impact coding journey today.
          </Typography>
        </Paper>

        <Divider sx={{ my: 5 }} />

        {/* What to Bring Section */}
        <Box sx={{ mb: 5 }}>
          <SectionHeading 
            id="what-to-bring" 
            variant="h3"
            icon={null}
          >
            What to Bring to the Hackathon
          </SectionHeading>
          <Typography
            variant="body1"
            sx={{
              mb: 4,
              maxWidth: "700px",
              fontSize: "18px",
              color: "text.secondary",
            }}
          >
            Come prepared to dive right into coding and collaboration. Here's what 
            you'll need for a successful hackathon experience:
          </Typography>

          <Grid container spacing={3}>
            {whatToBringItems.map((item, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card sx={{ height: "100%", p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "flex-start", mb: 2 }}>
                    <Box sx={{ mr: 2, mt: 0.5 }}>
                      {React.cloneElement(item.icon, { color: "primary" })}
                    </Box>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {item.title}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {item.description}
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Divider sx={{ my: 5 }} />

        {/* Hacker Toolbox Section */}
        <Box sx={{ mb: 5 }}>
          <SectionHeading 
            id="hacker-toolbox" 
            variant="h3"
            icon={null}
          >
            Recommended Hacker Toolbox
          </SectionHeading>
          <Typography
            variant="body1"
            sx={{
              mb: 4,
              maxWidth: "700px",
              fontSize: "18px",
              color: "text.secondary",
            }}
          >
            Get up to speed faster with these powerful frameworks and tools that 
            help you build production-ready applications quickly. While not required, 
            these resources can give you a significant head start.
          </Typography>

          <Grid container spacing={3}>
            {toolboxItems.map((tool, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card sx={{ height: "100%", p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "flex-start", mb: 2 }}>
                    <Box sx={{ mr: 2, mt: 0.5 }}>
                      {React.cloneElement(tool.icon, { color: "primary" })}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                        <Typography variant="h6" sx={{ mr: 1 }}>
                          {tool.name}
                        </Typography>
                        <IconButton
                          size="small"
                          href={tool.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() =>
                            trackOnClickButtonClickWithGoogleAndFacebook(
                              `toolbox_${tool.name.toLowerCase().replace(/\s/g, '_')}`
                            )
                          }
                        >
                          <OpenInNewRounded fontSize="small" />
                        </IconButton>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {tool.description}
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Free Hosting Section */}
        <Alert severity="info" sx={{ mb: 5 }}>
          <Typography variant="h6" gutterBottom>
            <CloudRounded sx={{ mr: 1, verticalAlign: "bottom" }} />
            Free Cloud Hosting Guide
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Deploy your hackathon project for free! Check out our comprehensive guide 
            to free tier cloud hosting options that help you get your solution online 
            without any cost.
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            href="https://www.linkedin.com/pulse/free-tier-web-hosting-status-report-2025-opportunity-hack-ik7fc/"
            target="_blank"
            rel="noopener noreferrer"
            startIcon={<OpenInNewRounded />}
            onClick={() =>
              trackOnClickButtonClickWithGoogleAndFacebook("free_hosting_guide")
            }
          >
            Read Free Hosting Guide
          </Button>
        </Alert>

        {/* Additional Image Section */}
        <Box sx={{ mb: 5, textAlign: "center" }}>
          <Box
            component="img"
            src="https://cdn.ohack.dev/ohack.dev/2024_hackathon_2.webp"
            alt="Hackers presenting their innovative solutions to judges and mentors"
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
            Hackers presenting their innovative solutions to judges and mentors
          </Typography>
        </Box>

        {/* Call to Action */}
        <Box sx={{ textAlign: "center", mb: 5 }}>
          <SectionHeading 
            id="ready-to-code" 
            variant="h3"
            sx={{ textAlign: "center", justifyContent: "center" }}
            icon={null}
          >
            Ready to Code for Good?
          </SectionHeading>
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
            Join thousands of developers who have already used their skills to 
            create technology solutions that make a real difference. Your next 
            great project could change lives.
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
              Find Events to Join
            </Button>
            <Button
              variant="outlined"
              size="large"
              href="/about/mentors"
              sx={{ fontSize: "16px" }}
            >
              Learn About Mentoring
            </Button>
            <Button
              variant="outlined"
              size="large"
              href="/projects"
              sx={{ fontSize: "16px" }}
            >
              View Projects
            </Button>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default AboutHackers;

export const getStaticProps = async () => {    
  const title = "Hacker Guide - Build Tech Solutions for Social Impact | Opportunity Hack";
  const description = "Join passionate developers at Opportunity Hack hackathons and build technology solutions that transform nonprofits. Learn new skills, create portfolio projects, and make real social impact through code.";
  return {
    props: {
      title: "Hacker Guide - Opportunity Hack",
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
          content: "https://cdn.ohack.dev/ohack.dev/2024_hackathon_1.webp",
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
          content: "https://ohack.dev/about/hackers",
          key: "url"
        },
        {
          name: "og:url",
          property: "og:url",
          content: "https://ohack.dev/about/hackers",
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
          content: "https://cdn.ohack.dev/ohack.dev/2024_hackathon_1.webp",
          key: "twitterimage"
        },
        {
          name: "twitter:image:alt",
          property: "twitter:image:alt",                    
          content: "Passionate hackers collaborating on technology solutions for nonprofits at Opportunity Hack",
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
              "url": "https://cdn.ohack.dev/ohack.dev/2024_hackathon_1.webp"
            },
            "sameAs": [
              "https://twitter.com/opportunityhack",
              "https://github.com/opportunity-hack"
            ]
          },
          {
            "@type": "WebPage",
            "@id": "https://ohack.dev/about/hackers#webpage",
            "url": "https://ohack.dev/about/hackers",
            "name": title,
            "description": description,
            "isPartOf": {
              "@type": "WebSite",
              "@id": "https://ohack.dev/#website"
            },
            "about": {
              "@type": "EducationalOrganization",
              "name": "Opportunity Hack Hacker Program", 
              "description": "Developers and designers build technology solutions for nonprofits through collaborative hackathons"
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
                "name": "Hackers",
                "item": "https://ohack.dev/about/hackers"
              }
            ]
          }
        ]
      }
    },
  };
};