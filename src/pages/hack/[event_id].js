import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import Head from "next/head";
import { 
  CircularProgress, 
  Container, 
  Grid, 
  Typography, 
  Button, 
  styled, 
  Box, 
  Paper, 
  Fab, 
  Zoom 
} from "@mui/material";
import { KeyboardArrowUp as KeyboardArrowUpIcon } from '@mui/icons-material';
import Script from 'next/script';
import HackathonHeader from "../../components/Hackathon/HackathonHeader";
import TableOfContents from '../../components/Hackathon/TableOfContents';

// Create a visually-hidden style for accessibility
const VisuallyHidden = styled('span')({
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: '0',
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  borderWidth: '0',
});

// Styled Back to Top button
const BackToTopButton = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(2),
  right: theme.spacing(2),
  zIndex: 1000,
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
    transform: 'scale(1.1)',
  },
  transition: 'all 0.3s ease-in-out',
  // Touch-friendly size for mobile
  [theme.breakpoints.down('sm')]: {
    width: 48,
    height: 48,
    bottom: theme.spacing(3),
    right: theme.spacing(3),
  },
  // Larger size for desktop with better hover effects
  [theme.breakpoints.up('sm')]: {
    width: 56,
    height: 56,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
      transform: 'scale(1.15)',
      boxShadow: theme.shadows[8],
    },
  },
}));

const LinksContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  backgroundColor: theme.palette.background.default,
  display: "flex",
  flexDirection: "column",
  height: "100%",
  minHeight: "400px",
  overflowX: "hidden",
  overflowY: "auto",
}));

// Remove Typography.defaultProps modification to reduce bundle size

// Loading placeholder component to reduce layout shift
const LoadingPlaceholder = ({height = '300px', label = 'Loading content'}) => (
  <Box 
    sx={{ 
      height: height, 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center',
      border: '1px solid #eee',
      borderRadius: '4px',
      mb: 3
    }}
    role="status"
    aria-live="polite"
  >
    <CircularProgress 
      size={40} 
      aria-label={label}
    />
    <Typography 
      variant="caption" 
      sx={{ 
        mt: 1, 
        color: 'text.secondary',
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: '0',
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        borderWidth: '0',
      }}
    >
      {label}
    </Typography>
  </Box>
);

// Critical above-the-fold components (higher priority) with priority loading
const EventLinks = dynamic(
  () => import("../../components/Hackathon/EventLinks"),
  { 
    ssr: true,
    loading: () => <LoadingPlaceholder height="150px" label="Loading application links" />
  }
);

const EventCountdown = dynamic(
  () => import("../../components/Hackathon/EventCountdown"),
  { 
    ssr: true,
    loading: () => <LoadingPlaceholder height="350px" label="Loading event timeline and countdown" />
  }
);

// Remove preloading - let dynamic imports handle loading

// Load secondary components with lower priority
const NonprofitList = dynamic(
  () => import("../../components/Hackathon/NonprofitList"),
  { 
    ssr: false,
    loading: () => <LoadingPlaceholder height="400px" label="Loading nonprofit organizations" />
  }
);

const DonationProgress = dynamic(
  () => import("../../components/Hackathon/DonationProgress"),
  { 
    ssr: false,
    loading: () => <LoadingPlaceholder height="200px" label="Loading donation progress" />
  }
);

const HackathonLeaderboard = dynamic(
  () => import("../../components/Hackathon/HackathonLeaderboard"),
  { 
    ssr: false,
    loading: () => <LoadingPlaceholder height="350px" label="Loading hackathon statistics" />
  }
);

// Lazy load below-the-fold components with intersection observer
const VolunteerList = dynamic(
  () => import('../../components/Hackathon/VolunteerList'),
  { 
    ssr: false,
    loading: () => <LoadingPlaceholder height="300px" label="Loading volunteer list" />
  }
);

const TeamList = dynamic(
  () => import('../../components/Hackathon/TeamList'),
  { 
    ssr: false,
    loading: () => <LoadingPlaceholder height="300px" label="Loading team information" />
  }
);

const EventConstraints = dynamic(
  () => import("../../components/Hackathon/EventConstraints"),
  { 
    ssr: false,
    loading: () => <LoadingPlaceholder height="200px" label="Loading event guidelines" />
  }
);

const InteractiveFAQ = dynamic(
  () => import("../../components/Hackathon/InteractiveFAQ"),
  { 
    ssr: false,
    loading: () => <LoadingPlaceholder height="400px" label="Loading frequently asked questions" />
  }
);

// Move FAQ data to a separate file to reduce bundle size
const getFaqData = () => import('../../data/faqData').then(module => module.default);

export default function HackathonEvent({ eventData }) {
  const router = useRouter();
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [faqData, setFaqData] = useState(null);
  
  // If fallback is true and the page is being generated,
  // router.isFallback will be true
  const isLoading = router.isFallback;
  const { event_id } = router.query || {};
  const event = eventData;

  useEffect(() => {
    // Handle scrolling to the correct section when the page loads
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash) {
        const id = hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth' });
          }, 100); // Small delay to ensure the page has rendered
        }
      }

      // Handle back to top button visibility
      const handleScroll = () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        setShowBackToTop(scrollTop > 300); // Show after scrolling 300px
      };

      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Lazy load FAQ data when needed
  useEffect(() => {
    let isMounted = true;
    const loadFaqData = async () => {
      try {
        const data = await getFaqData();
        if (isMounted) {
          setFaqData(data);
        }
      } catch (error) {
        console.error('Failed to load FAQ data:', error);
      }
    };

    // Only load FAQ data when user scrolls near the FAQ section
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !faqData) {
            loadFaqData();
            observer.disconnect();
          }
        });
      },
      { rootMargin: '200px' }
    );

    // Observe the FAQ section
    const faqElement = document.getElementById('faq');
    if (faqElement) {
      observer.observe(faqElement);
    }

    return () => {
      isMounted = false;
      observer.disconnect();
    };
  }, [faqData]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (isLoading || !event) {
    return (
      <Container maxWidth="lg" component="main" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  // Create a more concise but informative description
  const metaDescription = event
    ? `Join ${event.title} in ${event.location} from ${event.start_date} to ${event.end_date}. Build technology solutions for nonprofits, meet fellow developers, and make a positive impact through coding. ${event.description?.substring(0, 100)}...`
    : "Join us for an exciting Opportunity Hack event! Build technology solutions for nonprofits, meet fellow developers, and make a positive impact through coding.";
  
  const metaImage = event?.image_url || "https://cdn.ohack.dev/ohack.dev/2023_hackathon_4.webp";
  const metaTitle = event ? `${event.title} - Opportunity Hack Hackathon Event` : "Opportunity Hack Hackathon Event";
  
  // Memoize structured data to avoid recomputation
  const eventStructuredData = event ? {
    "@context": "http://schema.org",
    "@type": "Event",
    "name": event.title,
    "description": event.description,
    "startDate": event.start_date,
    "endDate": event.end_date,
    "eventStatus": "https://schema.org/EventScheduled",
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
    "location": {
      "@type": "Place",
      "name": event.location,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": event.location
      }
    },
    "image": [metaImage],
    "url": `https://ohack.dev/hack/${event_id}`,
    "organizer": {
      "@type": "Organization",
      "name": "Opportunity Hack",
      "url": "https://ohack.dev"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://ohack.dev/hack/${event_id}`,
      "price": "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    },
    "keywords": ["hackathon", "nonprofit", "coding", "volunteers", "tech for good", event.location, "opportunity hack", "social impact"]
  } : null;

  // FAQ structured data for better search results - only generate if FAQ data is loaded
  const faqStructuredData = faqData ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqData.slice(0, 10).map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": typeof faq.answer === 'string' ? faq.answer : 'Please visit our website for detailed information.'
      }
    }))
  } : null;

  return (
    <>
      <Head>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta charSet="UTF-8" />

        {/* Open Graph tags for social media sharing */}
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:type" content="website" />
        <meta
          property="og:url"
          content={`https://ohack.dev/hack/${event_id}`}
        />
        <meta property="og:image" content={metaImage} />
        <meta
          property="og:image:alt"
          content={`${event?.title || "Opportunity Hack"} event banner`}
        />
        <meta property="og:site_name" content="Opportunity Hack" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:updated_time" content={new Date().toISOString()} />

        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@OpportunityHack" />
        <meta name="twitter:creator" content="@OpportunityHack" />
        <meta name="twitter:title" content={metaTitle} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={metaImage} />
        <meta
          name="twitter:image:alt"
          content={`${event?.title || "Opportunity Hack"} event banner`}
        />

        {/* Additional SEO-friendly meta tags */}
        <meta
          name="keywords"
          content={`hackathon, ${event?.title || "opportunity hack"}, nonprofit, technology, volunteering, coding, programming, tech for good, ${event?.location || "various locations"}, social impact, software development, community service`}
        />
        <meta name="author" content="Opportunity Hack" />
        <meta
          name="robots"
          content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
        />
        <meta name="language" content="English" />
        <meta name="application-name" content="Opportunity Hack" />
        <meta name="theme-color" content="#3f51b5" />

        {/* Performance-related meta tags */}
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="format-detection" content="telephone=no" />

        {/* Preconnect to essential domains */}
        <link
          rel="preconnect"
          href="https://cdn.ohack.dev"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

        {/* DNS Prefetch */}
        <link rel="dns-prefetch" href="https://cdn.ohack.dev" />

        {/* Canonical URL */}
        <link rel="canonical" href={`https://ohack.dev/hack/${event_id}`} />
      </Head>

      {eventStructuredData && (
        <Script
          id="event-structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(eventStructuredData),
          }}
        />
      )}

      {faqStructuredData && (
        <Script
          id="faq-structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
        />
      )}

      <Container maxWidth="lg" component="main">
        <HackathonHeader
          title={event.title}
          startDate={event.start_date}
          endDate={event.end_date}
          location={event.location}
          description={event.description}
        />

        <nav aria-label="Event navigation">
          <TableOfContents />
        </nav>

        <Grid container spacing={3}>
          {/* Applications section */}
          <Grid
            item
            xs={12}
            component="section"
            aria-labelledby="applications-heading"
            id="applications"
          >
            <Typography
              variant="h2"
              component="h2"
              id="applications-heading"
              sx={{ 
                position: 'absolute',
                width: '1px',
                height: '1px',
                padding: '0',
                margin: '-1px',
                overflow: 'hidden',
                clip: 'rect(0, 0, 0, 0)',
                whiteSpace: 'nowrap',
                borderWidth: '0',
              }}
            >
              Applications
            </Typography>
            <EventLinks links={event.links} variant="applications" constraints={event.constraints} />
          </Grid>

          {/* Nonprofit List */}
          <Grid
            item
            xs={12}
            id="nonprofit"
            component="section"
            aria-labelledby="nonprofit-section-heading"
          >
            <NonprofitList
              nonprofits={event.nonprofits}
              teams={event.teams}
              eventId={event_id}
            />
          </Grid>

          {/* Team List - Proper implementation with Grid item */}
          <Grid
            item
            xs={12}
            component="section"
            aria-labelledby="teams-heading"
            id="teams"
          >
            <Typography
              variant="h2"
              component="h2"
              id="teams-heading"
              sx={{ 
                position: 'absolute',
                width: '1px',
                height: '1px',
                padding: '0',
                margin: '-1px',
                overflow: 'hidden',
                clip: 'rect(0, 0, 0, 0)',
                whiteSpace: 'nowrap',
                borderWidth: '0',
              }}
            >
              Teams
            </Typography>
            <LinksContainer elevation={2} id="build-a-team">
              <Box>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  Step 3. Build a team
                </Typography>

                {/* Team options - Find or Create */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    You can either join an existing team or create your own team
                    to participate in this hackathon:
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        href={event.constraints?.team_find_a_team_enabled !== false ? `/hack/${event_id}/findteam` : undefined}
                        disabled={event.constraints?.team_find_a_team_enabled === false}
                        component={event.constraints?.team_find_a_team_enabled !== false ? "a" : "button"}
                        sx={{
                          py: 2,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          height: "100%",
                          borderRadius: 2,
                          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
                          transition:
                            "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                          "&:hover": {
                            transform: event.constraints?.team_find_a_team_enabled !== false ? "translateY(-3px)" : "none",
                            boxShadow: event.constraints?.team_find_a_team_enabled !== false ? "0 6px 12px rgba(0, 0, 0, 0.15)" : "0 4px 10px rgba(0, 0, 0, 0.1)",
                          },
                          opacity: event.constraints?.team_find_a_team_enabled !== false ? 1 : 0.6,
                          cursor: event.constraints?.team_find_a_team_enabled !== false ? 'pointer' : 'not-allowed'
                        }}
                      >
                        <Box sx={{ fontSize: "2rem", mb: 1 }}>🔍</Box>
                        <Typography
                          variant="h6"
                          component="span"
                          fontWeight="bold"
                        >
                          Find a Team
                        </Typography>
                        <Typography
                          variant="body2"
                          color="inherit"
                          sx={{ opacity: 0.85, mt: 0.5 }}
                        >
                          Browse and join existing teams
                          {event.constraints?.team_find_a_team_enabled === false && " (Disabled)"}
                        </Typography>
                      </Button>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Button
                        variant="outlined"
                        color="primary"
                        fullWidth
                        href={event.constraints?.team_creation_enabled !== false ? `/hack/${event_id}/manageteam` : undefined}
                        disabled={event.constraints?.team_creation_enabled === false}
                        component={event.constraints?.team_creation_enabled !== false ? "a" : "button"}
                        sx={{
                          py: 2,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          height: "100%",
                          borderRadius: 2,
                          borderWidth: 2,
                          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.05)",
                          transition:
                            "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                          "&:hover": {
                            transform: event.constraints?.team_creation_enabled !== false ? "translateY(-3px)" : "none",
                            boxShadow: event.constraints?.team_creation_enabled !== false ? "0 6px 12px rgba(0, 0, 0, 0.1)" : "0 4px 10px rgba(0, 0, 0, 0.05)",
                          },
                          opacity: event.constraints?.team_creation_enabled !== false ? 1 : 0.6,
                          cursor: event.constraints?.team_creation_enabled !== false ? 'pointer' : 'not-allowed'
                        }}
                      >
                        <Box sx={{ fontSize: "2rem", mb: 1 }}>🚀</Box>
                        <Typography
                          variant="h6"
                          component="span"
                          fontWeight="bold"
                        >
                          Manage a Team
                        </Typography>
                        <Typography
                          variant="body2"
                          color="inherit"
                          sx={{ opacity: 0.85, mt: 0.5 }}
                        >
                          Create or manage your own team
                          {event.constraints?.team_creation_enabled === false && " (Disabled)"}
                        </Typography>
                      </Button>
                    </Grid>
                  </Grid>
                </Box>

                <TeamList
                  teams={event.teams?.sort((a, b) => {
                    // Sort active teams first, inactive teams last
                    const aActive = a?.active === "True" || a?.active === true;
                    const bActive = b?.active === "True" || b?.active === true;
                    
                    if (aActive && !bActive) return -1;
                    if (!aActive && bActive) return 1;
                    return 0; // Keep original order for teams with same active status
                  })}
                  event_id={event_id}
                  id={event.id}
                  endDate={event.end_date}
                  constraints={event.constraints}
                />
              </Box>
            </LinksContainer>
          </Grid>

          {/* Donation Progress and Event Links side by side on larger screens */}
          <Grid
            container
            item
            spacing={3}
            component="section"
            aria-labelledby="event-info-heading"
          >
            <Typography
              variant="h2"
              component="h2"
              id="event-info-heading"
              sx={{ 
                position: 'absolute',
                width: '1px',
                height: '1px',
                padding: '0',
                margin: '-1px',
                overflow: 'hidden',
                clip: 'rect(0, 0, 0, 0)',
                whiteSpace: 'nowrap',
                borderWidth: '0',
              }}
            >
              Event Information
            </Typography>
            <Grid item xs={12} md={6}>
              <DonationProgress
                donationGoals={event.donation_goals}
                donationCurrent={event.donation_current}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <EventLinks links={event.links} variant="event-links" constraints={event.constraints} />
            </Grid>
          </Grid>
          {/* Hackathon Stats and Countdown side by side */}
          <Grid
            container
            item
            spacing={3}
            component="section"
            aria-labelledby="event-stats-heading"
          >
            <Typography
              variant="h2"
              component="h2"
              id="event-stats-heading"
              sx={{ 
                position: 'absolute',
                width: '1px',
                height: '1px',
                padding: '0',
                margin: '-1px',
                overflow: 'hidden',
                clip: 'rect(0, 0, 0, 0)',
                whiteSpace: 'nowrap',
                borderWidth: '0',
              }}
            >
              Event Timeline and Stats
            </Typography>
            {/* Order matters on mobile: Countdown first, then Stats */}
            <Grid item xs={12} md={6} id="countdown" order={{ xs: 1, md: 2 }}>
              <EventCountdown countdowns={event.countdowns} />
            </Grid>
            <Grid item xs={12} md={6} id="stats" order={{ xs: 2, md: 1 }}>
              {/* Set display to flex and min-height to ensure the component has proper space */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  minHeight: { md: "400px" },
                }}
              >
                <HackathonLeaderboard
                  eventId={event_id}
                  githubOrg={event.github_org}
                  eventName={event.title}
                  startDate={event.start_date}
                  endDate={event.end_date}
                />
              </Box>
            </Grid>
          </Grid>
          {/* Event Constraints */}
          <Grid
            item
            xs={12}
            component="section"
            aria-labelledby="constraints-heading"
          >
            <Typography
              variant="h2"
              component="h2"
              id="constraints-heading"
              sx={{ 
                position: 'absolute',
                width: '1px',
                height: '1px',
                padding: '0',
                margin: '-1px',
                overflow: 'hidden',
                clip: 'rect(0, 0, 0, 0)',
                whiteSpace: 'nowrap',
                borderWidth: '0',
              }}
            >
              Event Constraints
            </Typography>
            <EventConstraints constraints={event.constraints} />
          </Grid>

          {/* Volunteer Lists */}
          <Grid
            item
            xs={12}
            id="volunteer"
            component="section"
            aria-labelledby="volunteer-heading"
          >
            <Typography
              variant="h2"
              component="h2"
              id="volunteer-heading"
              sx={{ 
                position: 'absolute',
                width: '1px',
                height: '1px',
                padding: '0',
                margin: '-1px',
                overflow: 'hidden',
                clip: 'rect(0, 0, 0, 0)',
                whiteSpace: 'nowrap',
                borderWidth: '0',
              }}
            >
              Volunteers
            </Typography>
            <VolunteerList event_id={event_id} type="volunteer" />
          </Grid>
          <Grid
            item
            xs={12}
            id="mentor"
            component="section"
            aria-labelledby="mentor-heading"
          >
            <Typography
              variant="h2"
              component="h2"
              id="mentor-heading"
              sx={{ 
                position: 'absolute',
                width: '1px',
                height: '1px',
                padding: '0',
                margin: '-1px',
                overflow: 'hidden',
                clip: 'rect(0, 0, 0, 0)',
                whiteSpace: 'nowrap',
                borderWidth: '0',
              }}
            >
              Mentors
            </Typography>
            <VolunteerList event_id={event_id} type="mentor" />
          </Grid>
          <Grid
            item
            xs={12}
            id="judge"
            component="section"
            aria-labelledby="judge-heading"
          >
            <Typography
              variant="h2"
              component="h2"
              id="judge-heading"
              sx={{ 
                position: 'absolute',
                width: '1px',
                height: '1px',
                padding: '0',
                margin: '-1px',
                overflow: 'hidden',
                clip: 'rect(0, 0, 0, 0)',
                whiteSpace: 'nowrap',
                borderWidth: '0',
              }}
            >
              Judges
            </Typography>
            <VolunteerList event_id={event_id} type="judge" />
          </Grid>
          <Grid
            item
            xs={12}
            id="hacker"
            component="section"
            aria-labelledby="hacker-heading"
          >
            <Typography
              variant="h2"
              component="h2"
              id="hacker-heading"
              sx={{ 
                position: 'absolute',
                width: '1px',
                height: '1px',
                padding: '0',
                margin: '-1px',
                overflow: 'hidden',
                clip: 'rect(0, 0, 0, 0)',
                whiteSpace: 'nowrap',
                borderWidth: '0',
              }}
            >
              Hackers
            </Typography>
            <VolunteerList event_id={event_id} type="hacker" />
          </Grid>
          {/* FAQ */}
          <Grid
            item
            xs={12}
            id="faq"
            component="section"
            aria-labelledby="faq-heading"
          >
            <Typography
              variant="h2"
              component="h2"
              id="faq-heading"
              sx={{ 
                position: 'absolute',
                width: '1px',
                height: '1px',
                padding: '0',
                margin: '-1px',
                overflow: 'hidden',
                clip: 'rect(0, 0, 0, 0)',
                whiteSpace: 'nowrap',
                borderWidth: '0',
              }}
            >
              Frequently Asked Questions
            </Typography>
            {faqData ? (
              <InteractiveFAQ faqData={faqData} title={`${event.title} FAQ`} />
            ) : (
              <LoadingPlaceholder height="400px" label="Loading frequently asked questions" />
            )}
          </Grid>
        </Grid>
      </Container>

      {/* Back to Top Button */}
      <Zoom in={showBackToTop} timeout={300}>
        <BackToTopButton
          onClick={scrollToTop}
          aria-label="Back to top"
          title="Back to top"
          size="medium"
        >
          <KeyboardArrowUpIcon />
        </BackToTopButton>
      </Zoom>
    </>
  );
}

export async function getStaticProps({ params }) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathon/${params.event_id}`
    );
    const data = await res.json();

    return {
      props: {
        eventData: data,
      },
      // Re-generate at most once per minute
      revalidate: 60,
    };
  } catch (error) {
    console.error("Error fetching hackathon data:", error);
    return {
      props: {
        eventData: null,
      },
      // Re-generate at most once per minute
      revalidate: 60
    };
  }
}

export async function getStaticPaths() {
  try {
    // Fetch a list of all hackathon IDs
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathons`);
    const data = await res.json();

    if (!res.ok) {
      console.error("Failed to fetch hackathon paths:", data);
      return {
        paths: [],
        fallback: 'blocking'
      };
    }

    // Get data.hackathons if it exists, otherwise use data directly
    const hackathons = data.hackathons;

    console.log("Fetched hackathons:", hackathons);
    if (!hackathons || !Array.isArray(hackathons)) {
      console.error("Invalid hackathon data format:", hackathons);
      return {
        paths: [],
        fallback: 'blocking'
      };
    }    

    const paths = hackathons.map((event) => ({
      // Handle case when event.event_id is null or undefined
      params: {
        event_id: event.event_id || event.id || event._id || "unknown-event",
    },
    }));

    return {
      paths,
      // Generate pages for new events on demand
      fallback: 'blocking'
    };
  } catch (error) {
    console.error("Error fetching hackathon paths:", error);
    return {
      paths: [],
      fallback: 'blocking'
    };
  }
}