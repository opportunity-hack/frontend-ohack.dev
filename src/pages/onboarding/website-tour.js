import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Container, 
  Typography, 
  Paper, 
  Box, 
  Stepper, 
  Step, 
  StepLabel, 
  StepContent,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Chip,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExploreIcon from '@mui/icons-material/Explore';
import HandshakeIcon from '@mui/icons-material/Handshake';
import GroupsIcon from '@mui/icons-material/Groups';
import CodeIcon from '@mui/icons-material/Code';
import EventIcon from '@mui/icons-material/Event';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import WorkIcon from '@mui/icons-material/Work';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import { useAuthInfo } from '@propelauth/react';
import JourneyTracker from '../../components/JourneyTracker';

// Styled components
const SiteFeatureCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[8]
  }
}));

const ScreenshotContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  height: 300,
  width: '100%',
  marginBottom: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.grey[100]
}));

const TourNavButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(1),
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'scale(1.05)'
  }
}));

/**
 * Website Tour page
 * Guides new members through the key sections of the Opportunity Hack website
 */
export default function WebsiteTour() {
  const { user } = useAuthInfo();
  const [activeStep, setActiveStep] = useState(0);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
    window.scrollTo(0, 0);
  };

  const handleReset = () => {
    setActiveStep(0);
    window.scrollTo(0, 0);
  };

  // Website tour sections based on navigation structure
  const tourSteps = [
    {
      label: 'Overview',
      icon: <ExploreIcon />,
      description: 
        "Let's take a tour of the Opportunity Hack website to help you navigate and find the resources you need. This guide will walk you through the main sections and how to get the most out of our platform.",
      content: (
        <Box>
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body1">
              This tour will introduce you to key sections of the Opportunity Hack website that you'll want to explore as a new member.
            </Typography>
          </Alert>

          <Typography variant="h5" gutterBottom>
            Website Navigation Structure
          </Typography>
          <Typography variant="body1" paragraph>
            The Opportunity Hack website is organized into several main sections, accessible from the navigation bar at the top of every page:
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <SiteFeatureCard>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Main Navigation
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                      <ListItemText primary="📩 Submit Project" secondary="For nonprofits to submit project ideas" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                      <ListItemText primary="📖 Projects" secondary="Browse ongoing and completed projects" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                      <ListItemText primary="#️⃣ Join Slack" secondary="Connect with our community" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                      <ListItemText primary="📍 Request a Hack" secondary="Request a hackathon for your organization" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                      <ListItemText primary="🏆 Judges" secondary="Information about hackathon judging" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                      <ListItemText primary="🎉 Sponsors" secondary="Our sponsors and sponsorship opportunities" />
                    </ListItem>
                  </List>
                </CardContent>
              </SiteFeatureCard>
            </Grid>
            <Grid item xs={12} md={8}>
              <SiteFeatureCard>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    About Menu
                  </Typography>
                  <Typography variant="body2" paragraph>
                    The "About" dropdown menu contains additional important sections:
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" gutterBottom>
                        About Us
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemText primary="ℹ️ About Us" secondary="Our mission and history" />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="❓ What's your why?" secondary="Stories of impact and motivation" />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="🙌 Success Stories" secondary="Past project highlights" />
                        </ListItem>
                      </List>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" gutterBottom>
                        Get Involved
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemText primary="🏢 Nonprofits" secondary="Information for nonprofits" />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="🤚 Volunteering" secondary="How to volunteer" />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="⌛️ Track Volunteer Time" secondary="Log your volunteer hours" />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="🙏 Mentors" secondary="Become or find a mentor" />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="🚪 Office Hours" secondary="Get 1:1 help and guidance" />
                        </ListItem>
                      </List>
                    </Grid>
                  </Grid>
                </CardContent>
              </SiteFeatureCard>
            </Grid>
          </Grid>

          <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
            What We'll Cover in This Tour
          </Typography>
          <Grid container spacing={3}>
            {[
              {
                title: 'Projects & Contributions',
                icon: <CodeIcon color="primary" />,
                description: 'Discover active projects and how to contribute to them'
              },
              {
                title: 'Hackathons & Events',
                icon: <EventIcon color="primary" />,
                description: 'Learn about upcoming and past hackathon events'
              },
              {
                title: 'Community Resources',
                icon: <GroupsIcon color="primary" />,
                description: 'Connect with the community through Slack and other platforms'
              },
              {
                title: 'Volunteer Opportunities',
                icon: <VolunteerActivismIcon color="primary" />,
                description: 'Various ways to volunteer your skills'
              },
              {
                title: 'Your Profile & Progress',
                icon: <WorkIcon color="primary" />,
                description: 'Track your contributions and manage your profile'
              }
            ].map((item, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Box sx={{ mb: 2 }}>
                      {item.icon}
                    </Box>
                    <Typography variant="h6" gutterBottom>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )
    },
    {
      label: 'Projects',
      icon: <CodeIcon />,
      description: 
        "Discover active projects, browse past successes, and learn how to contribute with your skills.",
      content: (
        <Box>
          <Typography variant="h5" gutterBottom>
            Exploring Projects
          </Typography>
          <Typography variant="body1" paragraph>
            The Projects section is where you'll find current and past Opportunity Hack projects that provide technical solutions for nonprofits.
          </Typography>

          <ScreenshotContainer>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', pt: 10 }}>
              [Projects page screenshot placeholder]
            </Typography>
          </ScreenshotContainer>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Projects Lifecycle
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                      <ListItemText 
                        primary="Concept" 
                        secondary="New ideas that haven't been worked on yet" 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                      <ListItemText 
                        primary="Hackathon" 
                        secondary="Projects actively being worked on during hackathons" 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                      <ListItemText 
                        primary="Post-Hackathon" 
                        secondary="Continued development after the hackathon event" 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                      <ListItemText 
                        primary="Production" 
                        secondary="Deployed for actual use by nonprofits" 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                      <ListItemText 
                        primary="Maintenance" 
                        secondary="Long-term support and feature enhancements" 
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    How to Find Projects
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Browse projects at <Link href="/projects">/projects</Link> where you can:
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon fontSize="small" color="primary" /></ListItemIcon>
                      <ListItemText primary="Filter by technology stack" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon fontSize="small" color="primary" /></ListItemIcon>
                      <ListItemText primary="Search by nonprofit name or project description" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon fontSize="small" color="primary" /></ListItemIcon>
                      <ListItemText primary="Sort by project stage, recency, or needs" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon fontSize="small" color="primary" /></ListItemIcon>
                      <ListItemText primary="View detailed information about each project" />
                    </ListItem>
                  </List>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="h6" gutterBottom>
                    How to Contribute
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon fontSize="small" color="primary" /></ListItemIcon>
                      <ListItemText primary="Join a project team during a hackathon" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon fontSize="small" color="primary" /></ListItemIcon>
                      <ListItemText primary="Express interest in ongoing projects via Slack" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon fontSize="small" color="primary" /></ListItemIcon>
                      <ListItemText primary="Contribute to GitHub repositories for active projects" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon fontSize="small" color="primary" /></ListItemIcon>
                      <ListItemText primary="Offer skills in design, development, testing, or documentation" />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Box mt={4}>
            <Typography variant="h6" gutterBottom>
              Success Stories
            </Typography>
            <Typography variant="body1" paragraph>
              Visit our <Link href="/about/success-stories">Success Stories</Link> page to see examples of completed projects that have made a significant impact for nonprofits.
            </Typography>
            <Alert severity="info">
              <Typography variant="body2">
                Projects are maintained in GitHub repositories, where you can see code, documentation, and contribute directly. 
                Each project page will link to its GitHub repository if available.
              </Typography>
            </Alert>
          </Box>
        </Box>
      )
    },
    {
      label: 'Hackathons',
      icon: <EventIcon />,
      description: 
        "Learn about upcoming hackathon events, how to participate, and what to expect.",
      content: (
        <Box>
          <Typography variant="h5" gutterBottom>
            Hackathon Events
          </Typography>
          <Typography variant="body1" paragraph>
            Hackathons are intensive events (typically 24-48 hours) where teams of volunteers work together to build tech solutions for nonprofits. They're a great way to get started with Opportunity Hack.
          </Typography>

          <ScreenshotContainer>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', pt: 10 }}>
              [Hackathon event page screenshot placeholder]
            </Typography>
          </ScreenshotContainer>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Upcoming Hackathons
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Visit <Link href="/hack">/hack</Link> to see upcoming events. For each hackathon, you'll find:
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><EventIcon fontSize="small" color="primary" /></ListItemIcon>
                      <ListItemText primary="Dates and location details" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><GroupsIcon fontSize="small" color="primary" /></ListItemIcon>
                      <ListItemText primary="Participating nonprofits and their needs" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><InfoIcon fontSize="small" color="primary" /></ListItemIcon>
                      <ListItemText primary="Registration information" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CodeIcon fontSize="small" color="primary" /></ListItemIcon>
                      <ListItemText primary="Resources and preparation materials" />
                    </ListItem>
                  </List>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    color="primary"
                    component={Link}
                    href="/hack"
                  >
                    View Hackathons
                  </Button>
                </CardActions>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Participation Options
                  </Typography>
                  <Typography variant="body2" paragraph>
                    There are several ways to get involved in hackathons:
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon fontSize="small" color="primary" /></ListItemIcon>
                      <ListItemText 
                        primary="Hacker" 
                        secondary="Contribute your technical skills to build solutions" 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon fontSize="small" color="primary" /></ListItemIcon>
                      <ListItemText 
                        primary="Mentor" 
                        secondary="Guide teams with your expertise and experience" 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon fontSize="small" color="primary" /></ListItemIcon>
                      <ListItemText 
                        primary="Judge" 
                        secondary="Evaluate solutions and provide feedback" 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon fontSize="small" color="primary" /></ListItemIcon>
                      <ListItemText 
                        primary="Volunteer" 
                        secondary="Help with event logistics and support" 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon fontSize="small" color="primary" /></ListItemIcon>
                      <ListItemText 
                        primary="Sponsor" 
                        secondary="Provide financial or in-kind support" 
                      />
                    </ListItem>
                  </List>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    color="primary"
                    component={Link}
                    href="/hack/code-of-conduct"
                  >
                    Code of Conduct
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          </Grid>

          <Box mt={4}>
            <Typography variant="h6" gutterBottom>
              What to Expect at a Hackathon
            </Typography>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Before the Hackathon</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <List dense>
                  <ListItem>
                    <ListItemIcon><CheckCircleIcon fontSize="small" color="primary" /></ListItemIcon>
                    <ListItemText primary="Register for the event through the hackathon page" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircleIcon fontSize="small" color="primary" /></ListItemIcon>
                    <ListItemText primary="Review the participating nonprofits and their needs" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircleIcon fontSize="small" color="primary" /></ListItemIcon>
                    <ListItemText primary="Join the Slack channels for the event" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircleIcon fontSize="small" color="primary" /></ListItemIcon>
                    <ListItemText primary="Attend any pre-event sessions or workshops" />
                  </ListItem>
                </List>
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>During the Hackathon</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <List dense>
                  <ListItem>
                    <ListItemIcon><CheckCircleIcon fontSize="small" color="primary" /></ListItemIcon>
                    <ListItemText primary="Opening ceremony with nonprofit presentations" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircleIcon fontSize="small" color="primary" /></ListItemIcon>
                    <ListItemText primary="Team formation based on interests and skills" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircleIcon fontSize="small" color="primary" /></ListItemIcon>
                    <ListItemText primary="Intensive development period with mentor support" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircleIcon fontSize="small" color="primary" /></ListItemIcon>
                    <ListItemText primary="Regular check-ins and progress updates" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircleIcon fontSize="small" color="primary" /></ListItemIcon>
                    <ListItemText primary="Final presentations and judging" />
                  </ListItem>
                </List>
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>After the Hackathon</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <List dense>
                  <ListItem>
                    <ListItemIcon><CheckCircleIcon fontSize="small" color="primary" /></ListItemIcon>
                    <ListItemText primary="Results announcement and awards" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircleIcon fontSize="small" color="primary" /></ListItemIcon>
                    <ListItemText primary="Project continuation planning" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircleIcon fontSize="small" color="primary" /></ListItemIcon>
                    <ListItemText primary="Ongoing development opportunities" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircleIcon fontSize="small" color="primary" /></ListItemIcon>
                    <ListItemText primary="Community recognition and testimonials" />
                  </ListItem>
                </List>
              </AccordionDetails>
            </Accordion>
          </Box>
        </Box>
      )
    },
    {
      label: 'Community',
      icon: <GroupsIcon />,
      description: 
        "Connect with the Opportunity Hack community through Slack and other platforms.",
      content: (
        <Box>
          <Typography variant="h5" gutterBottom>
            Community Resources
          </Typography>
          <Typography variant="body1" paragraph>
            The Opportunity Hack community is active across several platforms, with Slack being our primary communication hub.
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Join Our Slack Community
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Our Slack workspace is where most of the action happens:
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon fontSize="small" color="primary" /></ListItemIcon>
                      <ListItemText primary="Connect with other volunteers" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon fontSize="small" color="primary" /></ListItemIcon>
                      <ListItemText primary="Get announcements about events and opportunities" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon fontSize="small" color="primary" /></ListItemIcon>
                      <ListItemText primary="Find projects to work on" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon fontSize="small" color="primary" /></ListItemIcon>
                      <ListItemText primary="Ask questions and get help" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon fontSize="small" color="primary" /></ListItemIcon>
                      <ListItemText primary="Participate in discussions by topic" />
                    </ListItem>
                  </List>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    color="primary"
                    component={Link}
                    href="/signup"
                  >
                    Join Slack
                  </Button>
                </CardActions>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Other Community Platforms
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon fontSize="small" color="primary" /></ListItemIcon>
                      <ListItemText 
                        primary="GitHub" 
                        secondary="All our project repositories and code" 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon fontSize="small" color="primary" /></ListItemIcon>
                      <ListItemText 
                        primary="LinkedIn" 
                        secondary="Professional networking and updates" 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon fontSize="small" color="primary" /></ListItemIcon>
                      <ListItemText 
                        primary="Twitter" 
                        secondary="News and announcements" 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon fontSize="small" color="primary" /></ListItemIcon>
                      <ListItemText 
                        primary="Instagram" 
                        secondary="Event photos and stories" 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon fontSize="small" color="primary" /></ListItemIcon>
                      <ListItemText 
                        primary="Facebook" 
                        secondary="Community updates and event information" 
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Box mt={4}>
            <Typography variant="h6" gutterBottom>
              Community Support
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Office Hours
                    </Typography>
                    <Typography variant="body2" paragraph>
                      Get personalized help and guidance from experienced members during scheduled office hours.
                    </Typography>
                    <Link href="/office-hours">View Office Hours Schedule</Link>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Mentorship
                    </Typography>
                    <Typography variant="body2" paragraph>
                      Connect with mentors who can provide ongoing guidance for specific skills or projects.
                    </Typography>
                    <Link href="/about/mentors">Learn About Mentorship</Link>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>

          <Alert severity="info" sx={{ mt: 4 }}>
            <Typography variant="body2">
              Remember to introduce yourself in the #introductions channel on Slack when you join. This helps others get to know you and your skills.
            </Typography>
          </Alert>
        </Box>
      )
    },
    {
      label: 'Volunteering',
      icon: <VolunteerActivismIcon />,
      description: 
        "Discover the various ways you can volunteer your skills with Opportunity Hack.",
      content: (
        <Box>
          <Typography variant="h5" gutterBottom>
            Volunteer Opportunities
          </Typography>
          <Typography variant="body1" paragraph>
            There are many ways to contribute to Opportunity Hack and make a difference for nonprofits, regardless of your skill level or availability.
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Ways to Volunteer
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon><CodeIcon color="primary" /></ListItemIcon>
                      <ListItemText 
                        primary="Developer" 
                        secondary="Write code for nonprofit projects" 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><DesignIcon color="primary" /></ListItemIcon>
                      <ListItemText 
                        primary="Designer" 
                        secondary="Create user interfaces and visual designs" 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><ProjectIcon color="primary" /></ListItemIcon>
                      <ListItemText 
                        primary="Project Manager" 
                        secondary="Coordinate project workflows and teams" 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><HandshakeIcon color="primary" /></ListItemIcon>
                      <ListItemText 
                        primary="Mentor" 
                        secondary="Guide other volunteers and share expertise" 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><EmojiEventsIcon color="primary" /></ListItemIcon>
                      <ListItemText 
                        primary="Judge" 
                        secondary="Evaluate hackathon projects" 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><EventIcon color="primary" /></ListItemIcon>
                      <ListItemText 
                        primary="Event Volunteer" 
                        secondary="Help organize and run events" 
                      />
                    </ListItem>
                  </List>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    color="primary"
                    component={Link}
                    href="/volunteer"
                  >
                    Learn More
                  </Button>
                </CardActions>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Tracking Your Volunteer Time
                  </Typography>
                  <Typography variant="body2" paragraph>
                    We encourage volunteers to track their time contributions:
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon fontSize="small" color="primary" /></ListItemIcon>
                      <ListItemText primary="Log hours spent on projects and events" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon fontSize="small" color="primary" /></ListItemIcon>
                      <ListItemText primary="Receive recognition for your contributions" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon fontSize="small" color="primary" /></ListItemIcon>
                      <ListItemText primary="Generate volunteer certificates for your records" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon fontSize="small" color="primary" /></ListItemIcon>
                      <ListItemText primary="Support company volunteer programs" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon fontSize="small" color="primary" /></ListItemIcon>
                      <ListItemText primary="Help us measure community impact" />
                    </ListItem>
                  </List>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    color="primary"
                    component={Link}
                    href="/volunteer/track"
                  >
                    Track Your Time
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          </Grid>

          <Box mt={4}>
            <Typography variant="h6" gutterBottom>
              Benefits of Volunteering
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                      <CodeIcon color="primary" fontSize="large" />
                    </Box>
                    <Typography variant="h6" align="center" gutterBottom>
                      Skill Development
                    </Typography>
                    <Typography variant="body2" align="center">
                      Work on real-world projects that enhance your technical skills and portfolio
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                      <GroupsIcon color="primary" fontSize="large" />
                    </Box>
                    <Typography variant="h6" align="center" gutterBottom>
                      Networking
                    </Typography>
                    <Typography variant="body2" align="center">
                      Connect with like-minded professionals and build your professional network
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                      <WorkIcon color="primary" fontSize="large" />
                    </Box>
                    <Typography variant="h6" align="center" gutterBottom>
                      Career Growth
                    </Typography>
                    <Typography variant="body2" align="center">
                      Gain leadership experience and demonstrate commitment to social impact
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>

          <Alert severity="success" sx={{ mt: 4 }}>
            <Typography variant="body1">
              Whether you have a few hours to contribute or want to make a longer-term commitment, there's a place for you in our community. Start with what matches your availability and interests!
            </Typography>
          </Alert>
        </Box>
      )
    },
    {
      label: 'Your Profile',
      icon: <WorkIcon />,
      description: 
        "Learn how to manage your profile and track your contributions and progress.",
      content: (
        <Box>
          <Typography variant="h5" gutterBottom>
            Your Profile & Progress
          </Typography>
          <Typography variant="body1" paragraph>
            Your Opportunity Hack profile helps you track your contributions, showcase your skills, and connect with the community.
          </Typography>

          <Alert 
            severity={user ? "success" : "info"} 
            sx={{ mb: 3 }}
          >
            <Typography variant="body1">
              {user 
                ? "You're logged in! You can access your profile through the navigation menu by clicking on your avatar." 
                : "To access your profile, you need to log in through the login button in the top-right corner of the page."}
            </Typography>
          </Alert>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Your Profile Page
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Your profile includes:
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon fontSize="small" color="primary" /></ListItemIcon>
                      <ListItemText primary="Personal information and contact details" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon fontSize="small" color="primary" /></ListItemIcon>
                      <ListItemText primary="Skills and areas of expertise" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon fontSize="small" color="primary" /></ListItemIcon>
                      <ListItemText primary="Project participation history" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon fontSize="small" color="primary" /></ListItemIcon>
                      <ListItemText primary="Volunteer hours logged" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon fontSize="small" color="primary" /></ListItemIcon>
                      <ListItemText primary="GitHub contributions (if linked)" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon fontSize="small" color="primary" /></ListItemIcon>
                      <ListItemText primary="Certificates and recognitions" />
                    </ListItem>
                  </List>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    color="primary"
                    component={Link}
                    href="/profile"
                  >
                    View Profile
                  </Button>
                </CardActions>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Hearts & Rewards
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Opportunity Hack uses a "Hearts" system to recognize and reward contributions:
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon fontSize="small" color="primary" /></ListItemIcon>
                      <ListItemText 
                        primary="Earn hearts for various contributions" 
                        secondary="Code, design, mentoring, organizing, and more" 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon fontSize="small" color="primary" /></ListItemIcon>
                      <ListItemText 
                        primary="Track your heart count on your profile" 
                        secondary="See your progress and contribution level" 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon fontSize="small" color="primary" /></ListItemIcon>
                      <ListItemText 
                        primary="Redeem hearts for rewards" 
                        secondary="Swag, recognition, and other benefits" 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon fontSize="small" color="primary" /></ListItemIcon>
                      <ListItemText 
                        primary="Compete in raffle drawings" 
                        secondary="Heart-based entries for special prizes" 
                      />
                    </ListItem>
                  </List>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    color="primary"
                    component={Link}
                    href="/about/hearts"
                  >
                    Learn About Hearts
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          </Grid>

          <Box mt={4}>
            <Typography variant="h6" gutterBottom>
              Certificates & Recognition
            </Typography>
            <Typography variant="body2" paragraph>
              Opportunity Hack provides recognition for your volunteer contributions:
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Volunteer Certificates
                    </Typography>
                    <Typography variant="body2" paragraph>
                      Generate certificates documenting your volunteer hours for work programs, school credit, or your portfolio.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Project Testimonials
                    </Typography>
                    <Typography variant="body2" paragraph>
                      Receive testimonials from nonprofits you've helped, showcasing the real-world impact of your work.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </Box>
      )
    },
    {
      label: 'Next Steps',
      icon: <ArrowForwardIcon />,
      description: 
        "Ready to get started? Here's what to do next.",
      content: (
        <Box>
          <Typography variant="h5" gutterBottom>
            Your Next Steps
          </Typography>
          <Typography variant="body1" paragraph>
            Now that you've explored the Opportunity Hack website, here are some recommended actions to get started:
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom align="center">
                    Immediate Actions
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                      <ListItemText 
                        primary={<strong>Join our Slack community</strong>} 
                        secondary="Connect with the community and find opportunities"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                      <ListItemText 
                        primary={<strong>Complete your profile</strong>} 
                        secondary="Add your skills, interests, and contact information"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                      <ListItemText 
                        primary={<strong>Introduce yourself</strong>} 
                        secondary="Post in the #introductions channel on Slack"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                      <ListItemText 
                        primary={<strong>Find a buddy</strong>} 
                        secondary="Connect with an experienced member for guidance"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                      <ListItemText 
                        primary={<strong>Browse active projects</strong>} 
                        secondary="Find opportunities that match your interests"
                      />
                    </ListItem>
                  </List>
                </CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                  <Button 
                    variant="contained" 
                    color="primary"
                    component={Link}
                    href="/signup"
                  >
                    Join Slack Now
                  </Button>
                </Box>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom align="center">
                    Within Your First Month
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                      <ListItemText 
                        primary={<strong>Attend an office hours session</strong>} 
                        secondary="Get personalized guidance and answers to your questions"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                      <ListItemText 
                        primary={<strong>Contribute to a project</strong>} 
                        secondary="Start with a small task or bug fix to get familiar with the process"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                      <ListItemText 
                        primary={<strong>Participate in a community event</strong>} 
                        secondary="Join a hackathon, workshop, or virtual meetup"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                      <ListItemText 
                        primary={<strong>Track your volunteer hours</strong>} 
                        secondary="Start logging your contributions"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                      <ListItemText 
                        primary={<strong>Share your experience</strong>} 
                        secondary="Provide feedback on your onboarding experience"
                      />
                    </ListItem>
                  </List>
                </CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                  <Button 
                    variant="outlined" 
                    color="primary"
                    component={Link}
                    href="/projects"
                  >
                    Explore Projects
                  </Button>
                </Box>
              </Card>
            </Grid>
          </Grid>

          <Box mt={4} textAlign="center">
            <Typography variant="h6" gutterBottom>
              We're Here to Help!
            </Typography>
            <Typography variant="body1" paragraph>
              If you have any questions or need assistance, don't hesitate to reach out:
            </Typography>
            <Grid container spacing={2} justifyContent="center">
              <Grid item>
                <Chip 
                  label="Ask in #help on Slack" 
                  color="primary" 
                  variant="outlined"
                />
              </Grid>
              <Grid item>
                <Chip 
                  label="Attend Office Hours" 
                  color="primary" 
                  variant="outlined"
                />
              </Grid>
              <Grid item>
                <Chip 
                  label="Contact a Buddy" 
                  color="primary" 
                  variant="outlined"
                />
              </Grid>
            </Grid>

            <Button 
              variant="contained" 
              color="primary"
              size="large"
              component={Link}
              href="/onboarding"
              sx={{ mt: 4 }}
            >
              Return to Onboarding
            </Button>
          </Box>
        </Box>
      )
    }
  ];

  return (
    <Container maxWidth="lg">
      <Head>
        <title>Website Tour | Opportunity Hack</title>
        <meta name="description" content="Explore the Opportunity Hack website and learn how to navigate its features and resources." />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      {/* Track this journey step */}
      <JourneyTracker 
        journey="onboarding"
        step="explore_website"
        metadata={{ step_number: activeStep + 1, total_steps: tourSteps.length }}
      />

      {/* Onboarding content */}
      <Box sx={{ pt: { xs: '80px', sm: '100px' }, pb: 4 }}>
        <Typography variant="h2" align="center" gutterBottom>
          Website Tour
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" align="center">
          Learn how to navigate the Opportunity Hack website and access key resources
        </Typography>
        <Divider sx={{ mt: 2, mb: 3 }} />
        
        <Grid container spacing={4}>
          {/* Left sidebar with steps */}
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2, position: { md: 'sticky' }, top: { md: 120 } }}>
              <Stepper activeStep={activeStep} orientation="vertical" nonLinear>
                {tourSteps.map((step, index) => (
                  <Step key={step.label}>
                    <StepLabel
                      optional={<Typography variant="caption">{step.description}</Typography>}
                      icon={step.icon}
                    >
                      <Typography 
                        variant="subtitle1" 
                        sx={{ fontWeight: activeStep === index ? 'bold' : 'normal' }}
                      >
                        {step.label}
                      </Typography>
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Paper>
          </Grid>
          
          {/* Main content area */}
          <Grid item xs={12} md={9}>
            <Paper elevation={1} sx={{ p: 3, mb: 2, borderRadius: 2 }}>
              {tourSteps[activeStep].content}
            </Paper>
            
            {/* Navigation buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <TourNavButton
                color="primary"
                variant="outlined"
                disabled={activeStep === 0}
                onClick={handleBack}
                startIcon={<ArrowBackIcon />}
              >
                Previous
              </TourNavButton>
              
              {activeStep === tourSteps.length - 1 ? (
                <TourNavButton
                  color="primary"
                  variant="contained"
                  onClick={handleReset}
                >
                  Start Over
                </TourNavButton>
              ) : (
                <TourNavButton
                  color="primary"
                  variant="contained"
                  onClick={handleNext}
                  endIcon={<ArrowForwardIcon />}
                >
                  Next
                </TourNavButton>
              )}
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}

// Mock icon for design section 
function DesignIcon(props) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 14C9.10457 14 10 13.1046 10 12C10 10.8954 9.10457 10 8 10C6.89543 10 6 10.8954 6 12C6 13.1046 6.89543 14 8 14Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 14C17.1046 14 18 13.1046 18 12C18 10.8954 17.1046 10 16 10C14.8954 10 14 10.8954 14 12C14 13.1046 14.8954 14 16 14Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 16C13.1046 16 14 15.1046 14 14C14 12.8954 13.1046 12 12 12C10.8954 12 10 12.8954 10 14C10 15.1046 10.8954 16 12 16Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 10C13.1046 10 14 9.10457 14 8C14 6.89543 13.1046 6 12 6C10.8954 6 10 6.89543 10 8C10 9.10457 10.8954 10 12 10Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Mock icon for project management section
function ProjectIcon(props) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 7H7V17H9V7Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 7H13V17H15V7Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19 7H17V17H19V7Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}