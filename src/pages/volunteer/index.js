import React, { useState, useEffect } from "react";
import Link from "next/link";
import Moment from "moment";
import { initFacebookPixel, trackEvent } from '../../lib/ga';
import {
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Box,
  Alert,
  Chip,
  Paper,
  Container,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  CodeRounded,
  AssignmentRounded,
  BrushRounded,
  BarChartRounded,
  AccountTreeRounded,
  PeopleRounded,
  EngineeringRounded,
  SchoolRounded,
  EmojiEventsRounded,
  WorkRounded,
  VolunteerActivismRounded,
  LabelImportantRounded,
  PersonRounded,
  CalendarTodayRounded,
  LocationOnRounded,
  ExpandMoreRounded,
} from "@mui/icons-material";
import useHackathonEvents from '../../hooks/use-hackathon-events';

const VolunteerPage = () => {
  const [expandedRole, setExpandedRole] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { hackathons: upcomingEvents, loading: loadingEvents } = useHackathonEvents("current");

  useEffect(() => {
    initFacebookPixel();
  }, []);

  const track = (action, label) => {
    trackEvent({ action: `volunteer_${action}`, params: { event_label: label, page: 'volunteer' } });
  };

  const roleTypes = {
    hacker: {
      title: "Hacker",
      emoji: "🚀",
      subtitle: "Build Solutions",
      description: "You're a developer, designer, or technical creator who wants to build technology solutions for nonprofits.",
      color: "primary",
      roles: [
        {
          title: "Software Engineers",
          icon: <CodeRounded />,
          description: "Frontend, backend, full-stack developers who can build web apps, mobile apps, and APIs.",
          skills: ["React", "Python", "Java", "Node.js", "Mobile development"]
        },
        {
          title: "UX/UI Designers",
          icon: <BrushRounded />,
          description: "Create user-friendly interfaces and improve user experience for nonprofit solutions.",
          skills: ["Figma", "Adobe Creative Suite", "User research", "Prototyping", "Visual design"]
        },
        {
          title: "Data Scientists",
          icon: <BarChartRounded />,
          description: "Analyze nonprofit data, create visualizations, and develop predictive models.",
          skills: ["Python", "R", "SQL", "Tableau", "Machine Learning", "Statistics"]
        },
        {
          title: "DevOps Engineers",
          icon: <AccountTreeRounded />,
          description: "Deploy and maintain solutions in the cloud so nonprofits can actually use them.",
          skills: ["AWS", "Docker", "Kubernetes", "CI/CD", "Cloud architecture"]
        }
      ]
    },
    mentor: {
      title: "Mentor",
      emoji: "🎯",
      subtitle: "Guide Teams",
      description: "You're an experienced professional who can guide teams, provide technical expertise, and help make strategic decisions.",
      color: "secondary",
      roles: [
        {
          title: "Engineers",
          icon: <EngineeringRounded />,
          description: "Guide technical architecture decisions, code reviews, and best practices.",
          skills: ["2+ years experience", "System design", "Code review", "Technical leadership"]
        },
        {
          title: "Product Managers",
          icon: <AssignmentRounded />,
          description: "Help define project scope, prioritize features, and ensure product-market fit.",
          skills: ["Product strategy", "User stories", "Roadmap planning", "Stakeholder management"]
        },
        {
          title: "Industry Experts",
          icon: <WorkRounded />,
          description: "Share domain expertise in nonprofit work, business strategy, or specific industries.",
          skills: ["Domain expertise", "Strategic thinking", "Business development", "Nonprofit experience"]
        },
        {
          title: "Engineering Managers",
          icon: <PeopleRounded />,
          description: "Lead teams, ensure project delivery, and maintain team morale and productivity.",
          skills: ["Team leadership", "Project management", "Agile methodologies", "People management"]
        }
      ]
    },
    volunteer: {
      title: "Volunteer",
      emoji: "🤝",
      subtitle: "Support Events",
      description: "You want to help make our hackathons and events successful through logistics, coordination, and community building.",
      color: "success",
      roles: [
        {
          title: "Event Coordinators",
          icon: <LabelImportantRounded />,
          description: "Help with event planning, logistics, and coordination. Virtual or in-person.",
          skills: ["Organization", "Communication", "Event planning", "Problem solving"]
        },
        {
          title: "Registration & Check-in",
          icon: <PersonRounded />,
          description: "Welcome participants, manage registration, and help with onboarding.",
          skills: ["Customer service", "Organization", "People skills", "Attention to detail"]
        },
        {
          title: "Marketing & Social Media",
          icon: <PeopleRounded />,
          description: "Promote events, create content, and build our community presence.",
          skills: ["Social media", "Content creation", "Marketing", "Community building"]
        },
        {
          title: "General Support",
          icon: <VolunteerActivismRounded />,
          description: "Assist with various event needs, food service, setup, and participant support.",
          skills: ["Flexibility", "Teamwork", "Positive attitude", "Willingness to help"]
        }
      ]
    },
    judge: {
      title: "Judge",
      emoji: "⚖️",
      subtitle: "Evaluate Solutions",
      description: "You're an experienced professional who can evaluate team solutions, provide constructive feedback, and help select winning projects.",
      color: "warning",
      roles: [
        {
          title: "Technical Judges",
          icon: <EngineeringRounded />,
          description: "Evaluate technical implementation, code quality, architecture, and feasibility of solutions.",
          skills: ["Software engineering", "System architecture", "Code review", "Technical leadership"]
        },
        {
          title: "Product Judges",
          icon: <AssignmentRounded />,
          description: "Assess user experience, market fit, and overall product viability for nonprofit use.",
          skills: ["Product management", "UX evaluation", "Market analysis", "User research"]
        },
        {
          title: "Nonprofit Sector Judges",
          icon: <VolunteerActivismRounded />,
          description: "Evaluate solutions based on nonprofit needs, impact potential, and sector expertise.",
          skills: ["Nonprofit experience", "Social impact", "Sector knowledge", "Mission alignment"]
        },
        {
          title: "Industry Expert Judges",
          icon: <WorkRounded />,
          description: "Bring domain-specific expertise to evaluate solutions in specialized areas.",
          skills: ["Domain expertise", "Industry knowledge", "Strategic thinking", "Innovation assessment"]
        }
      ]
    }
  };

  const impactStats = [
    { value: "10+", label: "Years of Impact" },
    { value: "300+", label: "Nonprofits Helped" },
    { value: "5,000+", label: "Volunteers" },
    { value: "4", label: "Ways to Contribute" },
  ];

  const linkStyle = {
    color: "blue",
    textDecoration: "none",
    fontWeight: "bold",
  };

  const handleExpandRole = (key) => (event, isExpanded) => {
    setExpandedRole(isExpanded ? key : null);
    if (isExpanded) {
      track('role_expand', key);
    }
  };

  const formatEventDate = (startDate, endDate) => {
    const start = Moment(startDate);
    const end = Moment(endDate);

    if (start.format('YYYY-MM-DD') === end.format('YYYY-MM-DD')) {
      return start.format('dddd, MMMM Do YYYY');
    }

    return `${start.format('MMM D')} - ${end.format('MMM D, YYYY')}`;
  };

  const roleColorMap = {
    primary: '#1976d2',
    secondary: '#9c27b0',
    success: '#2e7d32',
    warning: '#ed6c02',
  };

  return (
    <>
      {/* Gradient Hero */}
      <Box sx={{
        background: 'linear-gradient(135deg, #1976d2 0%, #9c27b0 100%)',
        color: 'white',
        mt: 8,
        py: { xs: 6, md: 10 },
      }}>
        <Container maxWidth="lg">
          <Typography
            variant={isMobile ? "h3" : "h1"}
            sx={{
              fontWeight: 800,
              mb: 2,
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
              fontSize: { xs: '2.5rem', md: '3.5rem' },
            }}
          >
            Make a Difference with Technology
          </Typography>
          <Typography
            variant={isMobile ? "h6" : "h5"}
            sx={{ mb: 4, opacity: 0.9, maxWidth: 700 }}
          >
            Join Opportunity Hack as a hacker, mentor, volunteer, or judge —
            and help build technology solutions for nonprofits.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, mb: 6, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                fontWeight: 700,
                '&:hover': { bgcolor: 'grey.100' },
              }}
              href="#upcoming-events"
              onClick={() => track('hero_cta', 'find_event')}
            >
              Find an Event
            </Button>
            <Button
              variant="outlined"
              size="large"
              sx={{
                borderColor: 'white',
                color: 'white',
                fontWeight: 700,
                '&:hover': { borderColor: 'grey.200', bgcolor: 'rgba(255,255,255,0.1)' },
              }}
              href="#roles"
              onClick={() => track('hero_cta', 'explore_roles')}
            >
              Explore Roles
            </Button>
          </Box>

          {/* Impact stat cards - glassmorphism */}
          <Grid container spacing={2}>
            {impactStats.map((stat) => (
              <Grid size={{ xs: 6, md: 3 }} key={stat.label}>
                <Card sx={{
                  background: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.25)',
                  color: 'white',
                  textAlign: 'center',
                }}>
                  <CardContent sx={{ py: 2 }}>
                    <Typography variant="h3" sx={{ fontWeight: 800, fontSize: { xs: '2rem', md: '2.5rem' } }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      {stat.label}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Hero image - below gradient */}
      <Container maxWidth="lg">
        <Box sx={{ mt: -4, mb: 5, textAlign: 'center' }}>
          <Box
            component="img"
            src="https://cdn.ohack.dev/ohack.dev/2024_hackathon_2.webp"
            alt="Volunteers, mentors, hackers, and judges collaborating at an Opportunity Hack event to build technology solutions for nonprofits"
            sx={{
              maxWidth: '800px',
              width: '100%',
              borderRadius: 3,
              boxShadow: 6,
            }}
          />
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', fontStyle: 'italic', display: 'block', mt: 1 }}
          >
            Hackers, mentors, volunteers, and judges working together to create impactful technology solutions for nonprofits
          </Typography>
        </Box>
      </Container>

      {/* Upcoming Events */}
      <Container maxWidth="lg" id="upcoming-events">
        <Paper sx={{ p: 3, mb: 5, bgcolor: 'primary.light', color: 'white' }}>
          <Typography variant="h2" sx={{ fontSize: { xs: '1.8rem', md: '2rem' }, mb: 2 }}>
            Find Upcoming Events
          </Typography>
          <Typography variant="body1" sx={{ fontSize: '1.1em', mb: 3 }}>
            Ready to jump in? Here are our upcoming hackathons where you can hack, mentor, volunteer, or judge!
          </Typography>

          {loadingEvents ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress color="inherit" />
            </Box>
          ) : upcomingEvents && upcomingEvents.length > 0 ? (
            <Grid container spacing={2}>
              {upcomingEvents.map((event) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={event.event_id}>
                  <Card sx={{ bgcolor: 'white', color: 'text.primary' }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 1 }}>
                        {event.title}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                        <LocationOnRounded sx={{ mr: 0.5, fontSize: 16 }} />
                        {event.location}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                        <CalendarTodayRounded sx={{ mr: 0.5, fontSize: 16 }} />
                        {formatEventDate(event.start_date, event.end_date)}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Button
                          size="small"
                          variant="contained"
                          color="primary"
                          href={`/hack/${event.event_id}/hacker-application`}
                          onClick={() => track('event_apply', `hacker_${event.event_id}`)}
                        >
                          Apply as Hacker
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          href={`/hack/${event.event_id}/mentor-application`}
                          onClick={() => track('event_apply', `mentor_${event.event_id}`)}
                        >
                          Mentor
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          href={`/hack/${event.event_id}/volunteer-application`}
                          onClick={() => track('event_apply', `volunteer_${event.event_id}`)}
                        >
                          Volunteer
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          href={`/hack/${event.event_id}/judge-application`}
                          onClick={() => track('event_apply', `judge_${event.event_id}`)}
                        >
                          Judge
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Alert severity="info" sx={{ bgcolor: 'rgba(255,255,255,0.9)', color: 'text.primary' }}>
              No upcoming events scheduled. Check back soon or{' '}
              <Link href="/hack" style={linkStyle}>
                view all hackathons
              </Link>
              .
            </Alert>
          )}

          <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' } }}
              href="/hack"
              onClick={() => track('events_cta', 'view_all_hackathons')}
            >
              View All Hackathons
            </Button>
            <Button
              variant="outlined"
              sx={{ borderColor: 'white', color: 'white', '&:hover': { borderColor: 'grey.200', bgcolor: 'rgba(255,255,255,0.1)' } }}
              href="/signup"
              onClick={() => track('events_cta', 'join_slack')}
            >
              Join Our Slack Community
            </Button>
          </Box>
        </Paper>
      </Container>

      {/* Choose Your Role */}
      <Container maxWidth="lg" sx={{ mb: 5 }}>
        <Typography
          variant="h2"
          id="roles"
          sx={{ fontSize: { xs: '1.8rem', md: '2.5rem' }, fontWeight: 700, mb: 1 }}
        >
          Choose Your Role
        </Typography>
        <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
          Click any role to explore specializations and find your fit.
        </Typography>

        <Grid container spacing={3}>
          {Object.entries(roleTypes).map(([key, roleType]) => (
            <Grid size={{ xs: 12, md: 6 }} key={key}>
              <Card sx={{
                height: '100%',
                borderLeft: `5px solid ${roleColorMap[roleType.color]}`,
                transition: 'all 0.3s ease',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 },
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                    <Typography variant="h4" sx={{ fontSize: '2rem', lineHeight: 1 }}>
                      {roleType.emoji}
                    </Typography>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        {roleType.title}
                      </Typography>
                      <Chip
                        label={roleType.subtitle}
                        color={roleType.color}
                        size="small"
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                  </Box>

                  <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary' }}>
                    {roleType.description}
                  </Typography>

                  {key === 'judge' && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <Link href="/about/judges" style={linkStyle} onClick={() => track('guide_link', 'judge_guide')}>
                        Read the complete Judge Guide
                      </Link>
                    </Typography>
                  )}
                  {key === 'mentor' && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <Link href="/about/mentors" style={linkStyle} onClick={() => track('guide_link', 'mentor_guide')}>
                        Read the complete Mentor Guide
                      </Link>
                    </Typography>
                  )}

                  <Accordion
                    expanded={expandedRole === key}
                    onChange={handleExpandRole(key)}
                    elevation={0}
                    sx={{
                      '&:before': { display: 'none' },
                      bgcolor: 'transparent',
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreRounded />}
                      sx={{ px: 0, minHeight: 'auto', '& .MuiAccordionSummary-content': { my: 1 } }}
                    >
                      <Typography variant="subtitle2" color={`${roleType.color}.main`}>
                        View Specializations ({roleType.roles.length})
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ px: 0 }}>
                      <Grid container spacing={2}>
                        {roleType.roles.map((role) => (
                          <Grid size={{ xs: 12 }} key={role.title}>
                            <Box sx={{
                              p: 2,
                              borderRadius: 1,
                              bgcolor: 'grey.50',
                              border: '1px solid',
                              borderColor: 'grey.200',
                            }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Box sx={{ color: `${roleType.color}.main`, mr: 1, display: 'flex' }}>
                                  {role.icon}
                                </Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                  {role.title}
                                </Typography>
                              </Box>
                              <Typography variant="body2" sx={{ mb: 1.5, color: 'text.secondary' }}>
                                {role.description}
                              </Typography>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {role.skills.map((skill) => (
                                  <Chip
                                    key={skill}
                                    label={skill}
                                    size="small"
                                    color={roleType.color}
                                    variant="outlined"
                                  />
                                ))}
                              </Box>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Additional Resources */}
      <Container maxWidth="lg">
        <Paper sx={{ p: 3, mb: 5, bgcolor: 'grey.50' }}>
          <Typography variant="h2" sx={{ fontSize: '1.8em', mb: 2 }}>
            Additional Ways to Support Opportunity Hack
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Button
                variant="outlined"
                fullWidth
                href="/about/judges"
                startIcon={<EmojiEventsRounded />}
                onClick={() => track('resource_link', 'become_judge')}
              >
                Become a Judge
              </Button>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Button
                variant="outlined"
                fullWidth
                href="/sponsor"
                startIcon={<WorkRounded />}
                onClick={() => track('resource_link', 'sponsor')}
              >
                Sponsor Us
              </Button>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Button
                variant="outlined"
                fullWidth
                href="/about/success-stories"
                startIcon={<SchoolRounded />}
                onClick={() => track('resource_link', 'success_stories')}
              >
                Success Stories
              </Button>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Button
                variant="outlined"
                fullWidth
                href="/nonprofits"
                startIcon={<PeopleRounded />}
                onClick={() => track('resource_link', 'view_projects')}
              >
                View Projects
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Container>

      {/* Final CTA */}
      <Box sx={{
        background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
        color: 'white',
        py: 8,
        textAlign: 'center',
      }}>
        <Container maxWidth="md">
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, fontSize: { xs: '1.8rem', md: '2.5rem' } }}>
            Ready to Make a Difference?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Join thousands of volunteers using their skills for social good.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                fontWeight: 700,
                '&:hover': { bgcolor: 'grey.100' },
              }}
              href="/hack"
              onClick={() => track('final_cta', 'find_event')}
            >
              Find an Event
            </Button>
            <Button
              variant="outlined"
              size="large"
              sx={{
                borderColor: 'white',
                color: 'white',
                '&:hover': { borderColor: 'grey.200', bgcolor: 'rgba(255,255,255,0.1)' },
              }}
              href="/signup"
              onClick={() => track('final_cta', 'join_slack')}
            >
              Join Slack Community
            </Button>
            <Button
              variant="outlined"
              size="large"
              sx={{
                borderColor: 'white',
                color: 'white',
                '&:hover': { borderColor: 'grey.200', bgcolor: 'rgba(255,255,255,0.1)' },
              }}
              href="/onboarding"
              onClick={() => track('final_cta', 'start_onboarding')}
            >
              Start Onboarding
            </Button>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default VolunteerPage;

export const getStaticProps = async () => {
    const title = "How to Get Involved - Hacker, Mentor, or Volunteer | Opportunity Hack";
    const description = "Join Opportunity Hack and make a difference! Whether you're a developer who wants to hack solutions, an experienced professional ready to mentor teams, or someone who loves supporting events, we have the perfect volunteer role for you.";
    return {
        props: {
            title: "How to Get Involved - Opportunity Hack",
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
                    content: "https://cdn.ohack.dev/ohack.dev/2024_hackathon_2.webp",
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
                    content: "https://ohack.dev/volunteer",
                    key: "url"
                },
                {
                    name: "og:url",
                    property: "og:url",
                    content: "https://ohack.dev/volunteer",
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
                    content: "https://cdn.ohack.dev/ohack.dev/2024_hackathon_2.webp",
                    key: "twitterimage"
                },
                {
                    name: "twitter:image:alt",
                    property: "twitter:image:alt",
                    content: "Volunteers, mentors, and hackers collaborating at an Opportunity Hack event to build technology solutions for nonprofits",
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
                            "url": "https://cdn.ohack.dev/ohack.dev/2024_hackathon_2.webp"
                        },
                        "sameAs": [
                            "https://twitter.com/opportunityhack",
                            "https://github.com/opportunity-hack"
                        ]
                    },
                    {
                        "@type": "WebPage",
                        "@id": "https://ohack.dev/volunteer#webpage",
                        "url": "https://ohack.dev/volunteer",
                        "name": title,
                        "description": description,
                        "isPartOf": {
                            "@type": "WebSite",
                            "@id": "https://ohack.dev/#website"
                        },
                        "about": {
                            "@type": "VolunteerEvent",
                            "name": "Opportunity Hack Volunteer Program",
                            "description": "Our volunteer program has opportunities for developers, mentors, and event supporters to contribute to nonprofit technology solutions"
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
                                "name": "Volunteer",
                                "item": "https://ohack.dev/volunteer"
                            }
                        ]
                    },
                    {
                        "@type": "ItemList",
                        "name": "Volunteer Opportunities",
                        "description": "Various ways to contribute to Opportunity Hack",
                        "itemListElement": [
                            {
                                "@type": "ListItem",
                                "position": 1,
                                "name": "Hacker - Build Solutions",
                                "description": "Developers and designers who build technology solutions for nonprofits"
                            },
                            {
                                "@type": "ListItem",
                                "position": 2,
                                "name": "Mentor - Guide Teams",
                                "description": "Experienced professionals who guide teams and provide technical expertise"
                            },
                            {
                                "@type": "ListItem",
                                "position": 3,
                                "name": "Volunteer - Support Events",
                                "description": "Event coordinators and support staff who help make hackathons successful"
                            },
                            {
                                "@type": "ListItem",
                                "position": 4,
                                "name": "Judge - Evaluate Solutions",
                                "description": "Judges who evaluate and provide feedback on technology solutions built during hackathons"
                            },
                            {
                                "@type": "ListItem",
                                "position": 5,
                                "name": "Sponsor - Support Our Mission",
                                "description": "Organizations and individuals who sponsor Opportunity Hack events and initiatives"
                            }
                        ]
                    }
                ]
            }
        },
    };
};
