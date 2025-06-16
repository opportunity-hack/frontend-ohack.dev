import React, { Suspense, useEffect } from 'react';
import Head from 'next/head';
import { 
  Typography, 
  Box, 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  Paper, 
  Button,
  Chip,
  Divider
} from '@mui/material';
import { 
  CodeRounded,
  PeopleRounded,
  EmojiEventsRounded,
  WorkRounded,
  SchoolRounded,
  VolunteerActivismRounded,
  TrendingUpRounded,
  GroupsRounded,
  BusinessRounded
} from '@mui/icons-material';
import { initFacebookPixel, trackEvent } from "../../lib/ga";
import { cofounders, board_members, pledge } from '../../components/About/about-data';
import { 
  ActionButtons, 
  FoundersSection, 
  BoardSection, 
  BootcampSection, 
  PledgeSection,
  VideoSection 
} from '../../components/About/components';

// Organization Schema markup
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Opportunity Hack",
  alternateName: "OHack",
  url: "https://ohack.dev",
  description:
    "Harness the power of code for social good, fostering an inclusive society and championing impactful, sustainable change through technology volunteering and hackathons since 2013.",
  foundingDate: "2013",
  sameAs: [
    "https://www.linkedin.com/company/opportunity-hack/",
    "https://github.com/opportunity-hack",
    "https://www.instagram.com/opportunityhack/",
    "https://www.facebook.com/opportunityhack/",
  ],
  logo: "https://cdn.ohack.dev/ohack.dev/logos/OpportunityHack_2Letter_Dark_Blue.png",
  image: "https://cdn.ohack.dev/ohack.dev/2024_hackathon_5.webp",
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    email: "board@ohack.dev",
  },
  founder: [
    {
      "@type": "Person",
      name: "Prashanthi Ravanavarapu",
      sameAs: "https://www.linkedin.com/in/pravanavarapu/",
    },
    {
      "@type": "Person",
      name: "Jot Powers",
      sameAs: "https://www.linkedin.com/in/jotpowers/",
    },
    {
      "@type": "Person",
      name: "Bryant Chan",
      sameAs: "https://www.linkedin.com/in/bryantchan/",
    },
    {
      "@type": "Person",
      name: "Smitha Satish",
      sameAs: "https://www.linkedin.com/in/smitha-satish-7978091/",
    },
  ],
  address: {
    "@type": "PostalAddress",
    addressLocality: "Phoenix",
    addressRegion: "AZ",
    addressCountry: "US",
  },
};

// Video Schema markup
const videoSchema = {
  "@context": "https://schema.org",
  "@type": "VideoObject",
  name: "About Opportunity Hack",
  description:
    "Learn about Opportunity Hack's mission and impact in technology for social good",
  thumbnailUrl: "https://cdn.ohack.dev/ohack.dev/2024_hackathon_5.webp",
  uploadDate: "2024-04-04T08:00:00+08:00",
  duration: "PT2M30S",
  embedUrl: "https://www.youtube.com/embed/Ia_xsX-318E",
  interactionStatistic: {
    "@type": "InteractionCounter",
    interactionType: { "@type": "WatchAction" },
    userInteractionCount: 4913,
  },
};

const impactStats = [
  { number: "11+", label: "Years Making Impact", icon: <EmojiEventsRounded /> },
  { number: "50+", label: "Hackathons Organized", icon: <WorkRounded /> },
  { number: "1000+", label: "Volunteers", icon: <PeopleRounded /> },
  { number: "100+", label: "Nonprofits Helped", icon: <VolunteerActivismRounded /> }
];

const whyChooseUs = [
  {
    title: "Real Impact",
    description: "Build solutions that nonprofits actually use to help their communities",
    icon: <TrendingUpRounded />,
    color: "primary"
  },
  {
    title: "Career Growth",
    description: "Enhance your resume while building portfolio projects with social purpose",
    icon: <SchoolRounded />,
    color: "secondary"
  },
  {
    title: "Professional Network",
    description: "Connect with industry leaders, nonprofit professionals, and like-minded developers",
    icon: <GroupsRounded />,
    color: "success"
  },
  {
    title: "Skill Development",
    description: "Learn new technologies while working on meaningful projects with tight deadlines",
    icon: <CodeRounded />,
    color: "warning"
  }
];

export default function AboutUsPage() {
  const gaButton = (action, actionName) => {
    trackEvent({ 
      action: action,
      params: { action_name: actionName }
    });
  };

  useEffect(() => {
    initFacebookPixel();
  }, []);

  return (
    <Container maxWidth="lg">
      <Head>
        <title>About Opportunity Hack | Coding for Social Good Since 2013</title>
        <meta name="description" content="Founded in 2013, Opportunity Hack harnesses the power of code for social good. Learn about our mission, founders, board members, and join our community of tech volunteers making sustainable change." />
        <meta name="keywords" content="Opportunity Hack, social good, non-profit technology, tech volunteering, coding for good, social impact, inclusive society, sustainable change, effective altruism, hackathon, technology for nonprofits" />
        <meta name="author" content="Opportunity Hack" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://ohack.dev/about" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="About Opportunity Hack | Coding for Social Good Since 2013" />
        <meta property="og:description" content="Founded in 2013, Opportunity Hack harnesses the power of code for social good. Learn about our mission, founders, board members, and join our community of tech volunteers making sustainable change." />
        <meta property="og:url" content="https://ohack.dev/about" />
        <meta property="og:image" content="https://cdn.ohack.dev/ohack.dev/2024_hackathon_5.webp" />
        <meta property="og:image:alt" content="Opportunity Hack team working together at hackathon event" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Opportunity Hack" />
        <meta property="og:locale" content="en_US" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="About Opportunity Hack | Coding for Social Good Since 2013" />
        <meta name="twitter:description" content="Founded in 2013, Opportunity Hack harnesses the power of code for social good. Learn about our mission, founders, board members, and join our community of tech volunteers making sustainable change." />
        <meta name="twitter:image" content="https://cdn.ohack.dev/ohack.dev/2024_hackathon_5.webp" />
        <meta name="twitter:image:alt" content="Opportunity Hack team working together at hackathon event" />
        <meta name="twitter:creator" content="@opportunityhack" />
        <meta name="twitter:site" content="@opportunityhack" />
        
        <link rel="preload" as="image" href="https://cdn.ohack.dev/ohack.dev/2024_hackathon_5.webp" />
        
        {/* JSON-LD Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(organizationSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(videoSchema)}
        </script>
        
        {/* Article schema for about page */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AboutPage",
            "mainEntity": {
              "@type": "Organization",
              "name": "Opportunity Hack"
            },
            "url": "https://ohack.dev/about",
            "description": "Learn about Opportunity Hack's mission, history, founders, and commitment to using technology for social good."
          })}
        </script>
        
        {board_members.map((member, i) => (
          <meta key={i} name="board_member" content={member} />
        ))}
      </Head>

      <Box sx={{ padding: "2rem", fontSize: "1em" }}>
        {/* Hero Section */}
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: "2.5rem", sm: "3rem", md: "3.5rem" },
            mb: 2,
            mt: 10,
            textAlign: "center"
          }}
        >
          About Opportunity Hack
        </Typography>

        <Typography
          variant="h5"
          component="h2"
          sx={{ 
            mb: 4, 
            color: "text.secondary", 
            fontWeight: 300,
            textAlign: "center",
            maxWidth: "800px",
            mx: "auto"
          }}
        >
          Harnessing the Power of Code for Social Good Since 2013
        </Typography>

        <Typography
          variant="body1"
          sx={{
            fontSize: "18px",
            mb: 4,
            maxWidth: "800px",
            mx: "auto",
            lineHeight: 1.7,
            textAlign: "center"
          }}
        >
          Founded in 2013 as part of eBay/PayPal Inc., Opportunity Hack was created to meet the technological needs of nonprofits. 
          Our vision has since grown to harness the power of code for social good, fostering an inclusive society, 
          and championing impactful, sustainable change.
        </Typography>

        {/* Hero Image */}
        <Box sx={{ mb: 5, textAlign: "center" }}>
          <Box
            component="img"
            src="https://cdn.ohack.dev/ohack.dev/2024_hackathon_6.webp"
            alt="Opportunity Hack team working together at hackathon event building technology solutions for nonprofits"
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
            Developers, designers, and nonprofit partners collaborating at an Opportunity Hack event
          </Typography>
        </Box>

        {/* Impact Stats */}
        <Paper sx={{ p: 4, mb: 5, bgcolor: "primary.light", color: "white" }}>
          <Typography
            variant="h3"
            component="h2"
            gutterBottom
            sx={{ textAlign: "center", color: "white", mb: 4 }}
          >
            Our Impact Over 11 Years
          </Typography>
          <Grid container spacing={3}>
            {impactStats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Card sx={{ textAlign: "center", height: "100%", bgcolor: "white", color: "text.primary" }}>
                  <CardContent>
                    <Box sx={{ mb: 2, color: "primary.main" }}>
                      {stat.icon}
                    </Box>
                    <Typography variant="h3" sx={{ fontSize: "2.5rem", fontWeight: "bold", mb: 1 }}>
                      {stat.number}
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {stat.label}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* Mission Video Section */}
        <Box sx={{ mb: 5, textAlign: "center" }}>
          <Typography variant="h3" component="h2" gutterBottom>
            Our Mission in Action
          </Typography>
          <Typography
            variant="body1"
            sx={{
              mb: 4,
              maxWidth: "700px",
              mx: "auto",
              fontSize: "18px",
              color: "text.secondary",
            }}
          >
            Watch how developers, designers, and nonprofits come together to create lasting impact through technology.
          </Typography>
          <VideoSection />
        </Box>

        <Divider sx={{ my: 5 }} />

        {/* Why Choose Us Section */}
        <Box sx={{ mb: 5 }}>
          <Typography variant="h3" component="h2" gutterBottom sx={{ textAlign: "center" }}>
            Why Join Opportunity Hack?
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
            As computer science students or software engineers, we have a moral and ethical obligation 
            to use our skills to make a positive impact on the world.
          </Typography>

          <Grid container spacing={3}>
            {whyChooseUs.map((reason, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card 
                  sx={{ 
                    height: "100%", 
                    p: 3,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 6
                    }
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Box sx={{ color: `${reason.color}.main`, mr: 2 }}>
                        {reason.icon}
                      </Box>
                      <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                        {reason.title}
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                      {reason.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Divider sx={{ my: 5 }} />

        {/* Get Involved Section */}
        <Paper sx={{ p: 4, mb: 5, bgcolor: "success.light", color: "white", textAlign: "center" }}>
          <Typography variant="h3" component="h2" gutterBottom sx={{ color: "white" }}>
            Ready to Make a Difference?
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontSize: "18px",
              mb: 4,
              maxWidth: "600px",
              mx: "auto",
              color: "white"
            }}
          >
            Join thousands of developers, designers, mentors, and volunteers who are using their skills 
            to create positive change in the world through technology.
          </Typography>
          
          <Grid container spacing={2} sx={{ maxWidth: "600px", mx: "auto" }}>
            <Grid item xs={12} sm={6}>
              <Button
                variant="contained"
                size="large"
                fullWidth
                href="/volunteer"
                sx={{ 
                  bgcolor: "white", 
                  color: "success.main",
                  fontWeight: "bold",
                  '&:hover': { 
                    bgcolor: "grey.100",
                    transform: 'translateY(-2px)'
                  }
                }}
                startIcon={<GroupsRounded />}
              >
                Get Involved
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                variant="outlined"
                size="large"
                fullWidth
                href="/hack"
                sx={{ 
                  borderColor: "white", 
                  color: "white",
                  '&:hover': { 
                    borderColor: "white",
                    bgcolor: "rgba(255,255,255,0.1)"
                  }
                }}
                startIcon={<EmojiEventsRounded />}
              >
                Find Events
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Team Sections */}
        <Suspense fallback={<div>Loading team information...</div>}>
          <FoundersSection cofounders={cofounders} />
          <BoardSection board_members={board_members} />
          <PledgeSection pledge={pledge} />
        </Suspense>

        <Divider sx={{ my: 5 }} />

        {/* Final CTA */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography variant="h3" component="h2" gutterBottom>
            Start Your Journey
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontSize: "18px",
              mb: 4,
              maxWidth: "600px",
              mx: "auto",
              color: "text.secondary"
            }}
          >
            Whether you want to hack solutions, mentor teams, volunteer at events, or judge projects, 
            there's a perfect role waiting for you.
          </Typography>
          
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
            <Button
              variant="contained"
              size="large"
              color="primary"
              href="/volunteer"
              sx={{ fontSize: "16px" }}
            >
              Explore Roles
            </Button>
            <Button
              variant="outlined"
              size="large"
              href="/signup"
              sx={{ fontSize: "16px" }}
            >
              Join Community
            </Button>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}
