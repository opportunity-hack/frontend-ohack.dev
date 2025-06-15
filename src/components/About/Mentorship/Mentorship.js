import React, { useState } from 'react';
import { useEffect } from 'react';

import { TitleContainer, LayoutContainer, ProjectsContainer} from '../../../styles/nonprofit/styles';
import Head from 'next/head';
import { 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Box, 
  Alert, 
  Paper,
  Chip,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress
} from "@mui/material";
import LoginOrRegister from '../../LoginOrRegister/LoginOrRegister';
import Button from '@mui/material/Button';
import Link from 'next/link';
import { initFacebookPixel, trackEvent } from '../../../lib/ga';
import useHackathonEvents from '../../../hooks/use-hackathon-events';
import {
  SchoolRounded,
  GroupsRounded,
  CodeRounded,
  BrushRounded,
  BusinessRounded,
  BarChartRounded,
  CloudRounded,
  GitHubRounded,
  CheckCircleRounded,
  EventRounded,
  LocationOnRounded,
  CalendarTodayRounded,
  ExpandMoreRounded,
  PersonRounded,
  FavoriteRounded,
  AssignmentRounded,
  SupportRounded
} from '@mui/icons-material';

const trackOnClickButtonClickWithGoogleAndFacebook = (buttonName) => {
    trackEvent("click_mentors", buttonName);
}

const Mentorship = () => {
  const [expandedSection, setExpandedSection] = useState('mentorTypes');
  
  // Use the same hook as volunteer page for consistency
  const { hackathons: upcomingEvents, loading: loadingEvents } = useHackathonEvents("current");

  useEffect(() => {
    initFacebookPixel();
  }, []);

  const formatEventDate = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start.toDateString() === end.toDateString()) {
      return start.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
    
    return `${start.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })} - ${end.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })}`;
  };

  const mentorTypes = [
    {
      title: 'Technical Mentor',
      icon: <CodeRounded color="primary" />,
      description: 'Guide teams through technical challenges, architecture decisions, and code implementation.',
      skills: ['Software Engineering', 'Full-Stack Development', 'System Architecture', 'Code Review'],
      color: 'primary'
    },
    {
      title: 'Product Mentor',
      icon: <BusinessRounded color="secondary" />,
      description: 'Help teams understand user needs, define product scope, and prioritize features effectively.',
      skills: ['Product Strategy', 'User Research', 'Feature Prioritization', 'Market Analysis'],
      color: 'secondary'
    },
    {
      title: 'UX/Design Mentor',
      icon: <BrushRounded color="success" />,
      description: 'Support teams in creating user-centered designs and improving user experience.',
      skills: ['User Experience Design', 'Prototyping', 'Design Systems', 'User Testing'],
      color: 'success'
    },
    {
      title: 'Cloud & DevOps Mentor',
      icon: <CloudRounded color="warning" />,
      description: 'Help teams deploy their solutions and implement scalable cloud infrastructure.',
      skills: ['Cloud Platforms', 'CI/CD', 'Infrastructure as Code', 'Deployment'],
      color: 'warning'
    },
    {
      title: 'Presentation Mentor',
      icon: <BarChartRounded color="info" />,
      description: 'Guide teams in creating compelling presentations and effective pitches.',
      skills: ['Public Speaking', 'Storytelling', 'Pitch Development', 'Communication'],
      color: 'info'
    },
    {
      title: 'Project Management Mentor',
      icon: <AssignmentRounded color="error" />,
      description: 'Help teams organize their work, manage timelines, and coordinate effectively.',
      skills: ['Agile Methodology', 'Team Coordination', 'Timeline Management', 'Risk Assessment'],
      color: 'error'
    }
  ];

  const mentorGuidelines = [
    {
      title: 'Team Assignment & Preferences',
      content: `You have flexibility in how you'd like to mentor teams. During application, you can choose to: be matched with a specific team based on your expertise, select your preferred team(s) from the available options, or rotate between multiple teams to provide broader support. Let us know your preference and we'll accommodate your mentoring style and the needs of the teams.`
    },
    {
      title: 'Nonprofit Context Understanding',
      content: `Each team works with a specific nonprofit partner. Take time to understand the nonprofit's mission, constraints, and real-world challenges. This context is crucial for guiding teams toward practical, impactful solutions that the nonprofit can actually implement.`
    },
    {
      title: 'Time Commitment & Availability',
      content: `We ask for a minimum 3-hour commitment, but the most effective mentors typically engage for 6-8 hours across the event. You can mentor remotely through Slack and video calls, or attend in-person if the event is local to you.`
    },
    {
      title: 'Communication Best Practices',
      content: `Use team Slack channels for ongoing communication. Schedule regular check-ins (every 4-6 hours). Ask probing questions rather than giving direct answers. Focus on helping teams discover solutions independently while providing guidance when they're truly stuck.`
    }
  ];

  return (
    <LayoutContainer key="mentorship" container>
      <Head>
        <title>
          Mentor Guide - Shape the Future of Tech for Good | Opportunity Hack
        </title>
        <meta
          name="description"
          content="Guide the next generation of social impact technologists. Mentor teams building solutions for nonprofits at Opportunity Hack hackathons worldwide."
        />
        <meta
          name="keywords"
          content="Opportunity Hack, mentor, tech for good, nonprofit technology, hackathon mentorship, volunteer, social impact"
        />
        <meta property="og:title" content="Mentor Guide - Opportunity Hack" />
        <meta
          property="og:description"
          content="Guide teams building technology solutions for nonprofits. Join our community of mentors making real impact through code."
        />
        <meta property="og:image" content="https://cdn.ohack.dev/ohack.dev/mentors_hero.webp" />
        <meta property="og:url" content="https://ohack.dev/about/mentors" />
      </Head>

      <TitleContainer container>
        <Typography
          variant="h1"
          component="h1"
          sx={{ fontSize: { xs: "2.5rem", sm: "3rem", md: "3.5rem" }, mb: 2 }}
        >
          Become a Mentor
        </Typography>
        
        <Typography variant="h5" component="h2" sx={{ mb: 3, color: 'text.secondary', fontWeight: 300 }}>
          Guide Teams Building Technology Solutions for Nonprofits
        </Typography>

        <Typography variant="body1" sx={{ fontSize: '18px', mb: 4, maxWidth: '800px', mx: 'auto', lineHeight: 1.7 }}>
          Share your expertise to help teams create meaningful technology solutions that make a real difference. 
          As a mentor, you'll guide participants through technical challenges, strategic decisions, and product development 
          while helping nonprofits achieve their missions through technology.
        </Typography>

        <Grid container spacing={2} sx={{ maxWidth: '600px', mx: 'auto', mb: 4 }}>
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
                  document.getElementById('upcoming-events')?.scrollIntoView({ 
                    behavior: 'smooth' 
                  });
                }, 100);
              }}
            >
              Find Events to Mentor
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
      </TitleContainer>

      {/* Hero Image Section */}
      <Box sx={{ textAlign: 'center', mb: 5 }}>
        <Box
          component="img"
          src="https://cdn.ohack.dev/ohack.dev/2024_hackathon_4.webp"
          alt="Mentor providing hands-on guidance to a hackathon participant, demonstrating collaborative problem-solving"
          sx={{
            width: '100%',
            maxWidth: '800px',
            height: 'auto',
            borderRadius: 2,
            boxShadow: 3,
            mb: 2
          }}
        />
        <Typography 
          variant="caption" 
          sx={{ 
            color: 'text.secondary',
            fontStyle: 'italic',
            display: 'block'
          }}
        >
          Mentor providing hands-on guidance to help teams build impactful solutions
        </Typography>
      </Box>

      <ProjectsContainer style={{ marginTop: 20 }}>
        {/* Upcoming Events Section */}
        <Paper sx={{ p: 4, mb: 5, bgcolor: 'secondary.light', color: 'white' }} id="upcoming-events">
          <Typography variant="h3" component="h2" gutterBottom sx={{ color: 'white' }}>
            <SchoolRounded sx={{ mr: 2, verticalAlign: 'bottom' }} />
            Upcoming Mentoring Opportunities
          </Typography>
          <Typography variant="body1" sx={{ fontSize: "18px", mb: 3, color: 'white' }}>
            Join one of our upcoming hackathons as a mentor and make a direct impact on nonprofit technology solutions.
          </Typography>
          
          {loadingEvents ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress color="inherit" />
            </Box>
          ) : upcomingEvents && upcomingEvents.length > 0 ? (
            <Grid container spacing={3}>
              {upcomingEvents.map((event) => (
                <Grid item xs={12} md={6} key={event.event_id}>
                  <Card sx={{ bgcolor: 'white', color: 'text.primary', height: '100%' }}>
                    <CardContent>
                      <Typography variant="h5" gutterBottom>
                        {event.title}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                        <LocationOnRounded sx={{ mr: 0.5, fontSize: 16 }} />
                        {event.location}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                        <CalendarTodayRounded sx={{ mr: 0.5, fontSize: 16 }} />
                        {formatEventDate(event.start_date, event.end_date)}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Button 
                          variant="contained" 
                          color="secondary"
                          href={`/hack/${event.event_id}/mentor-application`}
                          onClick={() => trackOnClickButtonClickWithGoogleAndFacebook("mentor_apply_upcoming")}
                          startIcon={<SchoolRounded />}
                        >
                          Apply to Mentor
                        </Button>
                        <Button 
                          variant="contained"
                          color="primary"
                          href={`/hack/${event.event_id}/mentor-checkin`}
                          startIcon={<SupportRounded />}
                        >
                          Mentor Check-in
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
            <Alert severity="info" sx={{ bgcolor: 'rgba(255,255,255,0.9)', color: 'text.primary' }}>
              <Typography variant="body1" gutterBottom>
                No upcoming events scheduled at the moment.
              </Typography>
              <Typography variant="body2">
                Check back soon or{' '}
                <Link href="/hack" style={{ color: 'blue', textDecoration: 'underline' }}>
                  view all hackathons
                </Link>
                {' '}to see past events and get notified about future opportunities.
              </Typography>
            </Alert>
          )}
          
          <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button 
              variant="contained" 
              sx={{ bgcolor: 'white', color: 'secondary.main' }}
              href="/hack"
            >
              View All Hackathons
            </Button>
            <Button 
              variant="outlined" 
              sx={{ borderColor: 'white', color: 'white' }}
              href="/signup"
            >
              Join Our Community
            </Button>
          </Box>
        </Paper>

        {/* Why Mentor Section */}
        <Box sx={{ mb: 5 }}>
          <Typography variant="h3" component="h2" gutterBottom sx={{ textAlign: 'center' }}>
            Why Become a Mentor?
          </Typography>
          <Typography variant="body1" sx={{ textAlign: 'center', mb: 4, maxWidth: '700px', mx: 'auto', fontSize: '18px', color: 'text.secondary' }}>
            Mentoring at Opportunity Hack is more than volunteering—it's about using your professional skills to create lasting social impact.
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card sx={{ textAlign: 'center', height: '100%', p: 3 }}>
                <FavoriteRounded color="primary" sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Make Real Impact
                </Typography>
                <Typography variant="body1">
                  Guide teams creating solutions that nonprofits actually implement to help their communities
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ textAlign: 'center', height: '100%', p: 3 }}>
                <PersonRounded color="secondary" sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Develop Leadership
                </Typography>
                <Typography variant="body1">
                  Enhance your mentoring and leadership skills while helping the next generation of technologists
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ textAlign: 'center', height: '100%', p: 3 }}>
                <GroupsRounded color="success" sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Expand Network
                </Typography>
                <Typography variant="body1">
                  Connect with passionate developers, designers, and nonprofits from around the world
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 5 }} />

        {/* Mentor Types Section */}
        <Box sx={{ mb: 5 }}>
          <Typography variant="h3" component="h2" gutterBottom>
            Types of Mentors We Need
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, maxWidth: '700px', fontSize: '18px', color: 'text.secondary' }}>
            We welcome mentors from all technical backgrounds. Choose the area that best matches your expertise and interests.
          </Typography>
          
          <Grid container spacing={3}>
            {mentorTypes.map((mentorType, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      {mentorType.icon}
                      <Typography variant="h5" sx={{ ml: 2 }}>
                        {mentorType.title}
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ mb: 3 }}>
                      {mentorType.description}
                    </Typography>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Key Areas:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {mentorType.skills.map((skill) => (
                        <Chip 
                          key={skill} 
                          label={skill} 
                          size="small" 
                          color={mentorType.color}
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Divider sx={{ my: 5 }} />

        {/* Mentor Guidelines Section */}
        <Box sx={{ mb: 5 }}>
          <Typography variant="h3" component="h2" gutterBottom>
            Mentor Guidelines & Best Practices
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, maxWidth: '700px', fontSize: '18px', color: 'text.secondary' }}>
            Essential information to help you be an effective mentor and create the best experience for both you and your teams.
          </Typography>
          
          {mentorGuidelines.map((guideline, index) => (
            <Accordion key={index} sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreRounded />}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {guideline.title}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                  {guideline.content}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>


        {/* Sponsorship Recognition */}
        <Alert severity="info" sx={{ mb: 5 }}>
          <Typography variant="h6" gutterBottom>
            <CheckCircleRounded sx={{ mr: 1, verticalAlign: 'bottom' }} />
            Did you know your mentorship counts toward sponsorship?
          </Typography>
          <Typography variant="body1">
            By tracking your volunteer hours as a mentor, you or your company can be recognized as an Opportunity Hack sponsor! 
            Learn more about how your time investment creates value for everyone.
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              color="primary"
              href="/sponsor"
              onClick={() => trackOnClickButtonClickWithGoogleAndFacebook("sponsorship_cta")}
            >
              Learn About Sponsorship Recognition
            </Button>
          </Box>
        </Alert>

        {/* Call to Action */}
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Typography variant="h3" component="h2" gutterBottom>
            Ready to Make a Difference?
          </Typography>
          <Typography variant="body1" sx={{ fontSize: '18px', mb: 4, maxWidth: '600px', mx: 'auto', color: 'text.secondary' }}>
            Join our community of mentors using their expertise to create technology solutions that help nonprofits change the world.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              color="primary"
              href="#upcoming-events"
              onClick={() => {
                document.getElementById('upcoming-events')?.scrollIntoView({ 
                  behavior: 'smooth' 
                });
              }}
              sx={{ fontSize: '16px' }}
            >
              Find Events to Mentor
            </Button>
            <Button
              variant="outlined"
              size="large"
              href="/about/judges"
              sx={{ fontSize: '16px' }}
            >
              Consider Judging Instead
            </Button>
            <Button
              variant="outlined"
              size="large"
              href="/volunteer"
              sx={{ fontSize: '16px' }}
            >
              Explore Other Ways to Help
            </Button>
          </Box>
        </Box>

        <LoginOrRegister
          introText="Ready to join our mentor community?"
          previousPage={"/about/mentors"}
        />
      </ProjectsContainer>
    </LayoutContainer>
  );
}

export default Mentorship;
