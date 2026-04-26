import React, { Suspense, useEffect, useMemo } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
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
  Divider,
  Avatar,
  Stack,
  Badge,
  CardActionArea
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
  BusinessRounded,
  LinkedIn,
  CalendarMonth,
  Star,
  Verified
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
    email: "board@ohack.org",
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
          and championing impactful, sustainable change.{" "}
          Read more about how we <Link href="/coding-for-nonprofits" style={{ color: "inherit" }}>code for nonprofits</Link> and
          our annual <Link href="/hackathon-for-social-good" style={{ color: "inherit" }}>hackathon for social good</Link>.
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
              <Grid size={{ xs: 6, md: 3 }} key={index}>
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
              <Grid size={{ xs: 12, md: 6 }} key={index}>
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
            <Grid size={{ xs: 12, sm: 6 }}>
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
            <Grid size={{ xs: 12, sm: 6 }}>
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

        {/* Enhanced Team Sections */}
        <Suspense fallback={
          <Box sx={{ textAlign: "center", p: 4 }}>
            <Typography variant="h6" color="text.secondary">
              Loading our amazing team...
            </Typography>
          </Box>
        }>
          <EnhancedFoundersSection cofounders={cofounders} />
          <PayPalSocialProofSection />
          <EnhancedBoardSection board_members={board_members} />
          <EnhancedPledgeSection pledge={pledge} />
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

// Enhanced Components with Better UX
const EnhancedFoundersSection = ({ cofounders }) => (
  <Box sx={{ mb: 6 }}>
    <Typography 
      variant="h3" 
      component="h2"
      gutterBottom
      sx={{ 
        textAlign: "center", 
        mb: 4,
        fontWeight: 700,
        background: "linear-gradient(45deg, #2196F3, #21CBF3)",
        backgroundClip: "text",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent"
      }}
    >
      Meet Our Co-Founders
    </Typography>
    <Typography
      variant="subtitle1"
      sx={{
        textAlign: "center",
        mb: 4,
        color: "text.secondary",
        maxWidth: "600px",
        mx: "auto",
        fontSize: "1.1rem"
      }}
    >
      Visionary leaders who started this journey to harness technology for social good
    </Typography>
    <Grid container spacing={4} justifyContent="center">
      {cofounders.map((member, i) => (
        <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={i}>
          <Card 
            sx={{ 
              textAlign: "center",
              height: "100%",
              borderRadius: 3,
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-8px)",
                boxShadow: 8
              },
              background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
              position: "relative",
              overflow: "hidden",
              minHeight: "320px"
            }}
          >
            <CardActionArea 
              href={member.linkedin} 
              target="_blank" 
              rel="noopener noreferrer"
              sx={{ p: 3, height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}
            >
              <Box>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    mx: "auto",
                    mb: 2,
                    bgcolor: "primary.main",
                    fontSize: "2rem",
                    fontWeight: "bold"
                  }}
                >
                  {member.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                </Avatar>
                <Typography 
                  variant="h6" 
                  component="h3"
                  gutterBottom
                  sx={{ fontWeight: 600, lineHeight: 1.3, mb: 1 }}
                >
                  {member.name}
                </Typography>
                <Chip
                  label="Co-Founder"
                  size="small"
                  sx={{
                    bgcolor: "primary.main",
                    color: "white",
                    fontWeight: 600,
                    mb: 2
                  }}
                />
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: "text.secondary",
                    lineHeight: 1.4,
                    fontSize: "0.85rem",
                    mb: 2
                  }}
                >
                  {member.title}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <LinkedIn sx={{ color: "#0077B5", fontSize: "2rem" }} />
              </Box>
            </CardActionArea>
          </Card>
        </Grid>
      ))}
    </Grid>
  </Box>
);

const EnhancedBoardSection = ({ board_members }) => (
  <Box sx={{ mb: 6 }}>
    <Typography 
      variant="h3" 
      component="h2"
      gutterBottom
      sx={{ 
        textAlign: "center", 
        mb: 4,
        fontWeight: 700,
        background: "linear-gradient(45deg, #FF6B6B, #FF8E53)",
        backgroundClip: "text",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent"
      }}
    >
      Leadership Board
    </Typography>
    <Typography
      variant="subtitle1"
      sx={{
        textAlign: "center",
        mb: 4,
        color: "text.secondary",
        maxWidth: "700px",
        mx: "auto",
        fontSize: "1.1rem"
      }}
    >
      Experienced professionals guiding our mission and strategic direction
    </Typography>
    <Grid container spacing={3}>
      {board_members.map((member, i) => {
        const isPresident = member.role.toLowerCase().includes('president');
        const isFounder = member.role.toLowerCase().includes('co-founder');
        
        return (
          <Grid size={{ xs: 12, md: 6, lg: 4 }} key={i}>
            <Card 
              sx={{ 
                height: "100%",
                borderRadius: 3,
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 6
                },
                border: isPresident ? "2px solid" : "1px solid",
                borderColor: isPresident ? "warning.main" : "divider",
                position: "relative"
              }}
            >
              <CardContent sx={{ p: 3 }}>
                {/* Header with chip */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    {/* Spacer for chip */}
                  </Box>
                  {isPresident && (
                    <Chip
                      label="President"
                      icon={<Star />}
                      size="small"
                      sx={{
                        bgcolor: "warning.main",
                        color: "white",
                        fontWeight: 600,
                        flexShrink: 0
                      }}
                    />
                  )}
                  {isFounder && !isPresident && (
                    <Chip
                      label="Co-Founder"
                      size="small"
                      sx={{
                        bgcolor: "primary.main",
                        color: "white",
                        fontWeight: 600,
                        flexShrink: 0
                      }}
                    />
                  )}
                </Box>

                {/* Main content */}
                <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                  <Avatar
                    sx={{
                      width: 56,
                      height: 56,
                      mr: 2,
                      bgcolor: isPresident ? "warning.main" : "secondary.main",
                      fontSize: "1.25rem",
                      fontWeight: "bold",
                      flexShrink: 0
                    }}
                  >
                    {member.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                      <Typography 
                        variant="h6" 
                        component="h3"
                        sx={{ 
                          fontWeight: 600,
                          lineHeight: 1.3,
                          wordBreak: "break-word",
                          flex: 1
                        }}
                      >
                        {member.name}
                      </Typography>
                      {member.linkedin && (
                        <CardActionArea
                          component="a"
                          href={member.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            "&:hover": {
                              backgroundColor: "rgba(0, 119, 181, 0.1)"
                            }
                          }}
                        >
                          <LinkedIn sx={{ color: "#0077B5", fontSize: "1.5rem" }} />
                        </CardActionArea>
                      )}
                    </Box>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: "text.secondary",
                        lineHeight: 1.4
                      }}
                    >
                      {member.role}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  </Box>
);

const EnhancedPledgeSection = ({ pledge }) => (
  <Box sx={{ mb: 6 }}>
    <Typography 
      variant="h3" 
      component="h2"
      gutterBottom
      sx={{ 
        textAlign: "center", 
        mb: 2,
        fontWeight: 700,
        background: "linear-gradient(45deg, #4CAF50, #8BC34A)",
        backgroundClip: "text",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent"
      }}
    >
      Our Community Pledge
    </Typography>
    <Typography
      variant="subtitle1"
      sx={{
        textAlign: "center",
        mb: 4,
        color: "text.secondary",
        maxWidth: "800px",
        mx: "auto",
        fontSize: "1.1rem"
      }}
    >
      The principles that guide our community and drive our mission forward
    </Typography>
    
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {pledge.map((pledgeItem, i) => {
        const [title, description] = pledgeItem.split(':');
        const colors = ['primary', 'secondary', 'success', 'warning', 'info', 'error'];
        const color = colors[i % colors.length];
        
        return (
          <Grid size={{ xs: 12, md: 6 }} key={i}>
            <Card 
              sx={{ 
                height: "100%",
                borderRadius: 3,
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 6
                },
                border: `2px solid`,
                borderColor: `${color}.main`,
                position: "relative"
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: "flex", alignItems: "flex-start", mb: 2 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      bgcolor: `${color}.main`,
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mr: 2,
                      fontSize: "1.5rem",
                      fontWeight: "bold",
                      flexShrink: 0
                    }}
                  >
                    {i + 1}
                  </Box>
                  <Box>
                    <Typography 
                      variant="h6" 
                      component="h3"
                      gutterBottom
                      sx={{ 
                        fontWeight: 600,
                        lineHeight: 1.3,
                        color: `${color}.main`
                      }}
                    >
                      {title.trim()}
                    </Typography>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        lineHeight: 1.6,
                        color: "text.secondary"
                      }}
                    >
                      {description.trim()}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
    
    <Paper 
      sx={{ 
        p: 4, 
        textAlign: "center",
        bgcolor: "success.light",
        color: "white",
        borderRadius: 3
      }}
    >
      <Typography 
        variant="h5" 
        sx={{ 
          fontWeight: 600,
          fontStyle: "italic",
          lineHeight: 1.5
        }}
      >
        "Together, we are Opportunity Hack. Together, we code for social good, for change."
      </Typography>
    </Paper>
  </Box>
);

const PayPalSocialProofSection = () => (
  <Box sx={{ mb: 6 }}>
    <Paper 
      sx={{ 
        p: 4,
        bgcolor: "primary.light",
        color: "white",
        borderRadius: 3,
        position: "relative",
        overflow: "hidden"
      }}
    >
      <Typography 
        variant="h4" 
        component="h2"
        gutterBottom
        sx={{ 
          textAlign: "center", 
          mb: 3,
          fontWeight: 700,
          color: "white"
        }}
      >
        Trusted by Industry Leaders
      </Typography>
      
      <Grid container spacing={4} alignItems="center">
        <Grid size={{ xs: 12, md: 6 }}>
          <Box
            sx={{
              position: "relative",
              width: "100%",
              maxWidth: "500px",
              mx: "auto",
              borderRadius: 3,
              overflow: "hidden",
              boxShadow: 4
            }}
          >
            <Image
              src="https://cdn.ohack.dev/ohack.dev/paypal_opportunity_hack.jpg"
              alt="PayPal CEO Dan Schulman and CTO Sri Shivananda at Opportunity Hack event in San Jose"
              width={500}
              height={375}
              style={{
                width: "100%",
                height: "auto",
                display: "block"
              }}
              priority={false}
              loading="lazy"
            />
          </Box>
        </Grid>
        
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ textAlign: { xs: "center", md: "left" } }}>
            <Typography 
              variant="h5" 
              component="h3"
              gutterBottom
              sx={{ 
                fontWeight: 600,
                mb: 2,
                color: "white"
              }}
            >
              PayPal Partnership Legacy
            </Typography>
            
            <Typography 
              variant="body1" 
              sx={{ 
                fontSize: "1.1rem",
                lineHeight: 1.6,
                mb: 3,
                color: "rgba(255,255,255,0.95)"
              }}
            >
              Founded as part of eBay/PayPal Inc. in 2013, Opportunity Hack has the distinguished 
              honor of hosting PayPal's CEO Dan Schulman and CTO Sri Shivananda at our San Jose events, 
              demonstrating corporate leadership's commitment to technology for social good.
            </Typography>
            
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <BusinessRounded sx={{ color: "white", fontSize: "1.5rem" }} />
              <Typography variant="body1" sx={{ color: "white", fontWeight: 500 }}>
                Enterprise-level mentorship and guidance
              </Typography>
            </Box>
            
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <Verified sx={{ color: "white", fontSize: "1.5rem" }} />
              <Typography variant="body1" sx={{ color: "white", fontWeight: 500 }}>
                Proven track record with Fortune 500 companies
              </Typography>
            </Box>
            
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <GroupsRounded sx={{ color: "white", fontSize: "1.5rem" }} />
              <Typography variant="body1" sx={{ color: "white", fontWeight: 500 }}>
                Executive leadership involvement in our mission
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
      
      {/* Decorative elements */}
      <Box
        sx={{
          position: "absolute",
          top: -20,
          right: -20,
          width: 100,
          height: 100,
          borderRadius: "50%",
          bgcolor: "rgba(255,255,255,0.1)",
          zIndex: 0
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: -30,
          left: -30,
          width: 150,
          height: 150,
          borderRadius: "50%",
          bgcolor: "rgba(255,255,255,0.05)",
          zIndex: 0
        }}
      />
    </Paper>
  </Box>
);

export const getStaticProps = async () => {    
    const title = "About Opportunity Hack - Coding for Social Good Since 2013 | Opportunity Hack";
    const description = "Founded in 2013, Opportunity Hack harnesses the power of code for social good. Learn about our mission, founders, board members, and join our community of tech volunteers making sustainable change through hackathons and nonprofit technology solutions.";
    return {
        props: {
            title: "About Opportunity Hack - Coding for Social Good Since 2013",
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
                    content: "https://cdn.ohack.dev/ohack.dev/2024_hackathon_6.webp",
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
                    content: "https://ohack.dev/about",
                    key: "url"
                },
                {
                    name: "og:url",
                    property: "og:url",
                    content: "https://ohack.dev/about",
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
                    content: "https://cdn.ohack.dev/ohack.dev/2024_hackathon_6.webp",
                    key: "twitterimage"
                },
                {
                    name: "twitter:image:alt",
                    property: "twitter:image:alt",                    
                    content: "Developers, designers, and nonprofit partners collaborating at an Opportunity Hack event building technology solutions",
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
                            "url": "https://cdn.ohack.dev/ohack.dev/logos/OpportunityHack_2Letter_Dark_Blue.png"
                        },
                        "sameAs": [
                            "https://twitter.com/opportunityhack",
                            "https://github.com/opportunity-hack",
                            "https://www.linkedin.com/company/opportunity-hack/",
                            "https://www.instagram.com/opportunityhack/",
                            "https://www.facebook.com/opportunityhack/"
                        ],
                        "foundingDate": "2013",
                        "description": "Harness the power of code for social good, fostering an inclusive society and championing impactful, sustainable change through technology volunteering and hackathons since 2013.",
                        "contactPoint": {
                            "@type": "ContactPoint",
                            "contactType": "customer service",
                            "email": "board@ohack.org"
                        },
                        "founder": [
                            {
                                "@type": "Person",
                                "name": "Prashanthi Ravanavarapu"
                            },
                            {
                                "@type": "Person", 
                                "name": "Jot Powers"
                            },
                            {
                                "@type": "Person",
                                "name": "Bryant Chan"
                            },
                            {
                                "@type": "Person",
                                "name": "Smitha Satish"
                            }
                        ]
                    },
                    {
                        "@type": "WebPage",
                        "@id": "https://ohack.dev/about#webpage",
                        "url": "https://ohack.dev/about",
                        "name": title,
                        "description": description,
                        "isPartOf": {
                            "@type": "WebSite",
                            "@id": "https://ohack.dev/#website"
                        },
                        "about": {
                            "@type": "Organization",
                            "name": "Opportunity Hack",
                            "description": "Organization focused on using technology for social good through hackathons and nonprofit partnerships"
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
                            }
                        ]
                    },
                    {
                        "@type": "AboutPage",
                        "mainEntity": {
                            "@type": "Organization",
                            "name": "Opportunity Hack"
                        },
                        "url": "https://ohack.dev/about",
                        "description": "Learn about Opportunity Hack's mission, history, founders, and commitment to using technology for social good."
                    }
                ]
            }
        },
    };
};
