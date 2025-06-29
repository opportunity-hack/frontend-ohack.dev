import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Alert,
  Chip,
  Divider,
  Paper,
  Tab,
  Tabs,
  CircularProgress,
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
  EventRounded,
  PersonRounded,
  BuildRounded,
  CalendarTodayRounded,
  LocationOnRounded,
} from "@mui/icons-material";
import useHackathonEvents from '../../hooks/use-hackathon-events';

const VolunteerPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  
  // Use the same hook as sponsor page for consistency
  const { hackathons: upcomingEvents, loading: loadingEvents } = useHackathonEvents("current");

  // Define the four main role categories
  const roleTypes = {
    hacker: {
      title: "🚀 Hacker",
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
      title: "🎯 Mentor",
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
      title: "🤝 Volunteer",
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
      title: "⚖️ Judge",
      subtitle: "Evaluate Solutions",
      description: "You're an experienced professional who can evaluate team solutions, provide constructive feedback, and help select winning projects. Judges can be technical, product-focused, industry experts, or nonprofit sector experts.",
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

  const benefits = [
    { text: "Learn New Skills", icon: <SchoolRounded /> },
    { text: "Make a Difference", icon: <EmojiEventsRounded /> },
    { text: "Expand Your Network", icon: <PeopleRounded /> },
    { text: "Enhance Your Resume", icon: <WorkRounded /> },
  ];

  const linkStyle = {
    color: "blue",
    textDecoration: "none",
    fontWeight: "bold",
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleLearnMoreClick = (roleIndex) => {
    setActiveTab(roleIndex);
    // Scroll to the detailed role information section
    setTimeout(() => {
      document.getElementById('detailed-roles')?.scrollIntoView({ 
        behavior: 'smooth' 
      });
    }, 100);
  };

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

  return (
    <>
      <Box sx={{ padding: "2rem", fontSize: "1em" }}>
        <Typography
          variant="h1"
          sx={{ 
            fontSize: "2.5em", 
            mb: 2, 
            mt: 10 
          }}
        >
          How to Get Involved with Opportunity Hack
        </Typography>
        
        <Typography variant="body1" paragraph sx={{ fontSize: "1.2em", mb: 4 }}>
          <strong>Opportunity Hack</strong> organizes hackathons where developers, designers, and nonprofits come together 
          to create technology solutions that make a real difference. Whether you build, guide, or support, 
          there's a perfect role for you!
        </Typography>

        {/* Hero Image */}
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            mb: 5,
            mt: 3,
            textAlign: 'center'
          }}
        >
          <Box sx={{ maxWidth: '600px', width: '100%' }}>
            <Box
              component="img"
              src="https://cdn.ohack.dev/ohack.dev/2024_hackathon_2.webp"
              alt="Volunteers, mentors, hackers, and judges collaborating at an Opportunity Hack event to build technology solutions for nonprofits"
              sx={{
                width: '100%',
                height: 'auto',
                borderRadius: 2,
                boxShadow: 3,
                mb: 2
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
              Hackers, mentors, volunteers, and judges working together to create impactful technology solutions for nonprofits
            </Typography>
          </Box>
        </Box>

        {/* Role Overview Cards */}
        <Typography variant="h2" sx={{ fontSize: "2em", mb: 3, mt: 4 }}>
          Choose Your Role
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 5 }}>
          {Object.entries(roleTypes).map(([key, roleType]) => (
            <Grid item xs={12} md={3} key={key}>
              <Card 
                sx={{ 
                  height: '100%', 
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6
                  }
                }}
                onClick={() => handleLearnMoreClick(Object.keys(roleTypes).indexOf(key))}
              >
                <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h3" sx={{ fontSize: "1.5em", mb: 1 }}>
                    {roleType.title}
                  </Typography>
                  <Typography variant="h4" sx={{ fontSize: "1.1em", color: 'text.secondary', mb: 2 }}>
                    {roleType.subtitle}
                  </Typography>
                  <Typography variant="body1" sx={{ flexGrow: 1, mb: 2 }}>
                    {roleType.description}
                  </Typography>
                  <Button 
                    variant="contained" 
                    color={roleType.color}
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLearnMoreClick(Object.keys(roleTypes).indexOf(key));
                    }}
                  >
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Upcoming Events Section */}
        <Paper sx={{ p: 3, mb: 5, bgcolor: 'primary.light', color: 'white' }}>
          <Typography variant="h2" sx={{ fontSize: "2em", mb: 2 }}>
            🎯 Find Upcoming Events
          </Typography>
          <Typography variant="body1" sx={{ fontSize: "1.1em", mb: 3 }}>
            Ready to jump in? Here are our upcoming hackathons where you can hack, mentor, volunteer, or judge!
          </Typography>
          
          {loadingEvents ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress color="inherit" />
            </Box>
          ) : upcomingEvents && upcomingEvents.length > 0 ? (
            <Grid container spacing={2}>
              {upcomingEvents.map((event) => (
                <Grid item xs={12} sm={6} md={4} key={event.event_id}>
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
                        >
                          Apply as Hacker
                        </Button>
                        <Button 
                          size="small" 
                          variant="outlined"
                          href={`/hack/${event.event_id}/mentor-application`}
                        >
                          Mentor
                        </Button>
                        <Button 
                          size="small" 
                          variant="outlined"
                          href={`/hack/${event.event_id}/volunteer-application`}
                        >
                          Volunteer
                        </Button>
                        <Button 
                          size="small" 
                          variant="outlined"
                          href={`/hack/${event.event_id}/judge-application`}
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
              sx={{ bgcolor: 'white', color: 'primary.main' }}
              href="/hack"
            >
              View All Hackathons
            </Button>
            <Button 
              variant="outlined" 
              sx={{ borderColor: 'white', color: 'white' }}
              href="/signup"
            >
              Join Our Slack Community
            </Button>
          </Box>
        </Paper>

        {/* Detailed Role Tabs */}
        <Typography variant="h2" sx={{ fontSize: "2em", mb: 3 }} id="detailed-roles">
          Detailed Role Information
        </Typography>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            {Object.entries(roleTypes).map(([key, roleType]) => (
              <Tab 
                key={key}
                label={roleType.title} 
                icon={key === 'hacker' ? <BuildRounded /> : key === 'mentor' ? <SchoolRounded /> : key === 'volunteer' ? <VolunteerActivismRounded /> : <EmojiEventsRounded />}
                iconPosition="start"
              />
            ))}
          </Tabs>
        </Box>

        {Object.entries(roleTypes).map(([key, roleType], index) => (
          <Box key={key} hidden={activeTab !== index}>
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                {roleType.description}
              </Typography>
            </Alert>
            
            {/* Special callout for Judge role */}
            {key === 'judge' && (
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 3, 
                  mb: 3, 
                  bgcolor: 'warning.light', 
                  color: 'white',
                  textAlign: 'center'
                }}
              >
                <EmojiEventsRounded sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Want to Learn More About Judging?
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, maxWidth: '600px', mx: 'auto' }}>
                  Get the complete guide to judging at Opportunity Hack! Learn about evaluation criteria, 
                  judging responsibilities, time commitments, and how to provide constructive feedback that helps teams grow.
                </Typography>
                <Button 
                  variant="contained" 
                  size="large"
                  href="/about/judges"
                  sx={{ 
                    bgcolor: 'white', 
                    color: 'warning.main',
                    fontWeight: 'bold',
                    '&:hover': { 
                      bgcolor: 'grey.100',
                      transform: 'translateY(-2px)'
                    }
                  }}
                  startIcon={<EmojiEventsRounded />}
                >
                  Read the Complete Judge Guide
                </Button>
              </Paper>
            )}
            
            {/* Special callout for Mentor role */}
            {key === 'mentor' && (
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 3, 
                  mb: 3, 
                  bgcolor: 'secondary.light', 
                  color: 'white',
                  textAlign: 'center'
                }}
              >
                <SchoolRounded sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Want to Learn More About Mentoring?
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, maxWidth: '600px', mx: 'auto' }}>
                  Get the complete guide to mentoring at Opportunity Hack! Learn about mentor responsibilities, 
                  time commitments, success stories, and detailed tips for making the biggest impact.
                </Typography>
                <Button 
                  variant="contained" 
                  size="large"
                  href="/about/mentors"
                  sx={{ 
                    bgcolor: 'white', 
                    color: 'secondary.main',
                    fontWeight: 'bold',
                    '&:hover': { 
                      bgcolor: 'grey.100',
                      transform: 'translateY(-2px)'
                    }
                  }}
                  startIcon={<SchoolRounded />}
                >
                  Read the Complete Mentor Guide
                </Button>
              </Paper>
            )}
            
            <Grid container spacing={3}>
              {roleType.roles.map((role, roleIndex) => (
                <Grid item xs={12} sm={6} md={6} key={roleIndex}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        {role.icon}
                        <Typography variant="h6" sx={{ ml: 1 }}>
                          {role.title}
                        </Typography>
                      </Box>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {role.description}
                      </Typography>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Key Skills:
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
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        ))}

        {/* Benefits Section */}
        <Typography variant="h2" sx={{ fontSize: "2em", mb: 3, mt: 5 }}>
          Why Join Opportunity Hack?
        </Typography>
        <Grid container spacing={3} sx={{ mb: 5 }}>
          {benefits.map((benefit, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ textAlign: 'center', height: '100%' }}>
                <CardContent>
                  <Box sx={{ mb: 2, color: 'primary.main' }}>
                    {benefit.icon}
                  </Box>
                  <Typography variant="h6" sx={{ fontSize: "1.1em" }}>
                    {benefit.text}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* How to Get Started */}
        <Typography variant="h2" sx={{ fontSize: "2em", mb: 3 }}>
          How to Get Started
        </Typography>
        <Grid container spacing={3} sx={{ mb: 5 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ textAlign: 'center', height: '100%' }}>
              <CardContent>
                <Typography variant="h3" sx={{ fontSize: "3em", mb: 2, color: 'primary.main' }}>
                  1
                </Typography>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Choose Your Role
                </Typography>
                <Typography variant="body1">
                  Decide if you want to be a Hacker (build), Mentor (guide), Volunteer (support), or Judge (evaluate)
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ textAlign: 'center', height: '100%' }}>
              <CardContent>
                <Typography variant="h3" sx={{ fontSize: "3em", mb: 2, color: 'secondary.main' }}>
                  2
                </Typography>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Find an Event
                </Typography>
                <Typography variant="body1">
                  Browse upcoming hackathons and apply for the role that fits your skills
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ textAlign: 'center', height: '100%' }}>
              <CardContent>
                <Typography variant="h3" sx={{ fontSize: "3em", mb: 2, color: 'success.main' }}>
                  3
                </Typography>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Make Impact
                </Typography>
                <Typography variant="body1">
                  Join the event and help create technology solutions that make a real difference
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              href="/onboarding"
              style={{ fontSize: "1.1em" }}
            >
              Start Onboarding
            </Button>
          </Grid>
        </Grid>

        {/* Additional Resources */}
        <Paper sx={{ p: 3, mb: 4, bgcolor: 'grey.50' }}>
          <Typography variant="h2" sx={{ fontSize: "1.8em", mb: 2 }}>
            Additional Ways to Support Opportunity Hack
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Button 
                variant="outlined" 
                fullWidth
                href="/about/judges"
                startIcon={<EmojiEventsRounded />}
              >
                Become a Judge
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button 
                variant="outlined" 
                fullWidth
                href="/sponsor"
                startIcon={<WorkRounded />}
              >
                Sponsor Us
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button 
                variant="outlined" 
                fullWidth
                href="/about/success-stories"
                startIcon={<SchoolRounded />}
              >
                Success Stories
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button 
                variant="outlined" 
                fullWidth
                href="/nonprofits"
                startIcon={<PeopleRounded />}
              >
                View Projects
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Call to Action */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h2" sx={{ fontSize: "2em", mb: 2 }}>
            Ready to Make a Difference?
          </Typography>
          <Typography variant="body1" sx={{ fontSize: "1.2em", mb: 3, maxWidth: '600px', mx: 'auto' }}>
            Join thousands of developers, designers, mentors, judges, and volunteers who are using their skills 
            to create positive change in the world through technology.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              color="primary"
              href="/hack"
              sx={{ fontSize: "1.1em" }}
            >
              Find an Event
            </Button>
            <Button
              variant="contained"
              size="large"
              color="secondary"
              href="/signup"
              sx={{ fontSize: "1.1em" }}
            >
              Join Slack Community
            </Button>
            <Button
              variant="outlined"
              size="large"
              href="/profile"
              sx={{ fontSize: "1.1em" }}
            >
              Update Profile
            </Button>
          </Box>
        </Box>
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
