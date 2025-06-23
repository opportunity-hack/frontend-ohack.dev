import React from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { Typography, Box, Button, Grid, Container, Divider, Alert, Paper, Card, CardContent } from '@mui/material';
import { TitleContainer, LayoutContainer, ProjectsContainer } from '../../styles/nonprofit/styles';
import HackathonList from '../../components/HackathonList/HackathonList';
import PreviousHackathonList from '../../components/HackathonList/PreviousHackathonList';
import Link from 'next/link';
import { EventAvailable, Code, Group, EmojiEvents, Gavel, CameraAlt, Business, Policy } from '@mui/icons-material';

const HackathonIndex = () => {
  const style = { fontSize: '15px' };

  return (
    <LayoutContainer key="hackathons" container>
      <Head>
        <title>
          Opportunity Hack - Global Hackathons Including Phoenix & ASU Events
        </title>
        <meta
          name="description"
          content="Join Opportunity Hack's innovative global hackathons, including events in Phoenix and at ASU. Unite with tech enthusiasts worldwide to create sustainable solutions for nonprofits."
        />
        <meta
          name="keywords"
          content="Opportunity Hack, global hackathons, Phoenix hackathon, Arizona hackathon, ASU hackathon, nonprofit solutions, tech for good, social impact, coding for nonprofits, volunteer coding, tech volunteering"
        />
        <meta
          property="og:title"
          content="Opportunity Hack - Global Hackathons Including Phoenix & ASU Events"
        />
        <meta
          property="og:description"
          content="Join Opportunity Hack's innovative global hackathons, including events in Phoenix and at ASU. Create sustainable tech solutions for nonprofits worldwide."
        />
        <meta
          property="og:image"
          content="https://cdn.ohack.dev/ohack.dev/2023_hackathon_2.webp"
        />
        <meta property="og:url" content="https://ohack.dev/hack" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Opportunity Hack - Global Hackathons for Social Impact"
        />
        <meta
          name="twitter:description"
          content="Join tech volunteers to create solutions for nonprofits at our global hackathons."
        />
        <link rel="canonical" href="https://ohack.dev/hack" />
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "Event",
            "name": "Opportunity Hack Global Hackathons",
            "description": "Opportunity Hack hosts impactful hackathons globally where tech volunteers create solutions for nonprofits.",
            "image": "https://cdn.ohack.dev/ohack.dev/2023_hackathon_2.webp",
            "url": "https://ohack.dev/hack",
            "organizer": {
              "@type": "Organization",
              "name": "Opportunity Hack",
              "url": "https://ohack.dev"
            }
          }
        `}</script>
      </Head>

      <TitleContainer container>
        <Typography
          variant="h1"
          component="h1"
          sx={{ fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" }, mb: 2 }}
        >
          Join Our Global Hackathons
        </Typography>

        <Typography variant="body1" sx={{ fontSize: '18px', mb: 3, maxWidth: '800px', mx: 'auto' }}>
          Build technology solutions for nonprofits at our hackathons worldwide. 
          Connect with developers, designers, and nonprofits to create lasting social impact.
        </Typography>

        <Grid container spacing={2} sx={{ maxWidth: '600px', mx: 'auto', mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              href="/volunteer"
              startIcon={<EventAvailable />}
            >
              Find Your Role
            </Button>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button
              variant="outlined"
              color="primary"
              size="large"
              fullWidth
              href="/signup"
              startIcon={<Group />}
            >
              Join Community
            </Button>
          </Grid>
        </Grid>
      </TitleContainer>

      <ProjectsContainer style={{ marginTop: 20, width: "100%" }}>
        <Box mb={4}>
          <HackathonList />
        </Box>
        
        {/* Why Join Section with Image */}
        <Paper sx={{ p: 4, my: 4, bgcolor: 'grey.50' }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h3" component="h2" gutterBottom>
                Why Join Opportunity Hack?
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                    <Code color="primary" sx={{ mr: 2, mt: 0.5 }} />
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Build Real Solutions
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Create technology that actually gets used by nonprofits to help communities
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                    <Group color="primary" sx={{ mr: 2, mt: 0.5 }} />
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Global Community
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Network with developers, designers, and nonprofits from around the world
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                    <EmojiEvents color="primary" sx={{ mr: 2, mt: 0.5 }} />
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Skill Development
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Learn new technologies and improve your coding skills in a real-world setting
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                    <EventAvailable color="primary" sx={{ mr: 2, mt: 0.5 }} />
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Career Growth
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Connect with sponsors and gain experience that enhances your professional profile
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ textAlign: 'center' }}>
                <Image
                  src="https://cdn.ohack.dev/ohack.dev/2023_hackathon_2.webp"
                  alt="Developers collaborating at Opportunity Hack hackathon"
                  width={500}
                  height={350}
                  style={{
                    maxWidth: "100%",
                    height: "auto",
                    borderRadius: "12px",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                  }}
                />
                <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                  Developers working together to create solutions for nonprofits
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
        
        <Divider sx={{ my: 4 }} />
        <Box>
          <PreviousHackathonList />
        </Box>
      </ProjectsContainer>


      {/* Before You Join Section */}
      <Box mt={4} mb={4}>
        <Typography variant="h3" component="h2" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
          Before You Join an Event
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', mb: 4, maxWidth: '600px', mx: 'auto' }}>
          A few quick reads to ensure everyone has a great and safe experience at our hackathons.
        </Typography>
        
        <Grid container spacing={3} sx={{ maxWidth: '800px', mx: 'auto' }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', textAlign: 'center' }}>
              <CardContent>
                <Policy color="primary" sx={{ fontSize: 40, mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Code of Conduct
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Our community guidelines for respectful collaboration
                </Typography>
                <Button 
                  variant="contained" 
                  component={Link} 
                  href="/hack/code-of-conduct"
                  fullWidth
                  size="small"
                >
                  Read Guidelines
                </Button>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', textAlign: 'center' }}>
              <CardContent>
                <Gavel color="action" sx={{ fontSize: 40, mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Liability Waiver
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Standard legal protection for in-person events
                </Typography>
                <Button 
                  variant="outlined" 
                  component={Link} 
                  href="/hack/liability-waiver"
                  fullWidth
                  size="small"
                >
                  View Waiver
                </Button>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', textAlign: 'center' }}>
              <CardContent>
                <CameraAlt color="action" sx={{ fontSize: 40, mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Photo Release
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Permission to share photos from our events
                </Typography>
                <Button 
                  variant="outlined" 
                  component={Link} 
                  href="/hack/photo-release"
                  fullWidth
                  size="small"
                >
                  Photo Policy
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Support Our Mission Section */}
      <Paper sx={{ p: 4, mt: 4, bgcolor: 'primary.light', color: 'white', textAlign: 'center' }}>
        <Business sx={{ fontSize: 48, mb: 2 }} />
        <Typography variant="h4" gutterBottom>
          Support Our Mission
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, maxWidth: '600px', mx: 'auto' }}>
          Help us continue organizing impactful hackathons by becoming a sponsor. 
          Partner with us to support the next generation of social impact technologists.
        </Typography>
        <Button 
          variant="contained" 
          size="large"
          component={Link} 
          href="/sponsor"
          sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' } }}
        >
          Become a Sponsor
        </Button>
      </Paper>
    </LayoutContainer>
  );
};

export default HackathonIndex;