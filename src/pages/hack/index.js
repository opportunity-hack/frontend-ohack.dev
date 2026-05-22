import React, { useEffect } from 'react';
import Head from 'next/head';
import { Typography, Box, Button, Grid, Paper, Card, CardContent } from '@mui/material';
import { initFacebookPixel, trackEvent } from '../../lib/ga';
import { TitleContainer, LayoutContainer, ProjectsContainer } from '../../styles/nonprofit/styles';
import HackathonList from '../../components/HackathonList/HackathonList';
import HackathonStoryStrip from '../../components/HackathonList/HackathonStoryStrip';
import PreviousHackathonList from '../../components/HackathonList/PreviousHackathonList';
import HackPageNav from '../../components/HackathonList/HackPageNav';
import Link from 'next/link';
import { EventAvailable, Code, Group, EmojiEvents, Gavel, CameraAlt, Business, Policy } from '@mui/icons-material';

const HackathonIndex = () => {
  const style = { fontSize: '15px' };

  useEffect(() => { initFacebookPixel(); }, []);

  const track = (action, label) => {
    trackEvent({ action: `hack_${action}`, params: { event_label: label, page: 'hack' } });
  };

  return (
    <LayoutContainer key="hackathons" container>
      <HackPageNav />
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

      <TitleContainer container sx={{ pt: { xs: 2, md: 3 }, pb: { xs: 2, md: 2 } }}>
        <Typography
          variant="h1"
          component="h1"
          sx={{
            fontSize: { xs: "1.75rem", sm: "2.25rem", md: "2.5rem" },
            mb: { xs: 1.5, md: 2 },
            lineHeight: 1.15,
          }}
        >
          Hackathons for nonprofits
        </Typography>

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 1.5,
            justifyContent: 'center',
            flexWrap: 'wrap',
            maxWidth: 560,
            mx: 'auto',
          }}
        >
          <Button
            variant="contained"
            color="primary"
            size="medium"
            href="#upcoming-events"
            startIcon={<EventAvailable />}
            onClick={(e) => {
              e.preventDefault();
              track('cta_click', 'view_upcoming_events');
              document.getElementById('upcoming-events')?.scrollIntoView({ behavior: 'smooth' });
            }}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            See upcoming events
          </Button>
          <Button
            variant="outlined"
            color="primary"
            size="medium"
            href="/signup"
            startIcon={<Group />}
            onClick={() => track('cta_click', 'join_community')}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Join the community
          </Button>
        </Box>
      </TitleContainer>

      <ProjectsContainer style={{ marginTop: 12, width: "100%" }}>
        {/* Upcoming Events — first in flow so visitors landing here find an
            event to join without scrolling past marketing copy. */}
        <Box
          id="upcoming-events"
          component="section"
          aria-labelledby="upcoming-events-heading"
          mb={3}
          sx={{ scrollMarginTop: 100 }}
        >
          <HackathonList />
        </Box>

        {/* Story Strip — bridges upcoming and previous with aggregate impact stats
            and a clickable year sparkline that jumps into the archive below. */}
        <HackathonStoryStrip />

        {/* Previous Events Section - Positioned right after Upcoming Events for better content grouping */}
        <Box mb={5}>
          <PreviousHackathonList />
        </Box>
      </ProjectsContainer>

      {/* About These Events — merged "Why Join" + "Before You Join".
          Both are context, not finder-flow: positioned after the archive so
          the first-scroll experience is hero → events → impact → past, and
          this section catches users who scrolled deep. */}
      <Box
        id="about-events"
        component="section"
        aria-labelledby="about-events-heading"
        sx={{ mt: 5, mb: 5, px: 2, scrollMarginTop: 100 }}
      >
        <Typography
          id="about-events-heading"
          variant="h4"
          component="h2"
          gutterBottom
          sx={{ textAlign: 'center', mb: 1, fontWeight: 700 }}
        >
          About these events
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', mb: 4, maxWidth: 720, mx: 'auto' }}>
          What you get out of joining — and the quick reads to skim before you sign up.
        </Typography>

        {/* What you get — compact 4-up icon row (no big photo, no h3 per item).
            The Story Strip above already proves the scale with numbers, so
            this is descriptive complement, not the headline. */}
        <Box sx={{ maxWidth: 1000, mx: 'auto', mb: 5 }}>
          <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 1.5, textAlign: 'center', letterSpacing: 1 }}>
            What you get
          </Typography>
          <Grid container spacing={2}>
            {[
              { icon: <Code color="primary" />, title: 'Build real solutions', desc: "Software nonprofits actually deploy — not throwaway demos." },
              { icon: <Group color="primary" />, title: 'Global community', desc: 'Developers, designers, and nonprofit leads from around the world.' },
              { icon: <EmojiEvents color="primary" />, title: 'Skill development', desc: 'Learn shipping with real users, deadlines, and constraints.' },
              { icon: <EventAvailable color="primary" />, title: 'Career growth', desc: 'Network with sponsors and ship a portfolio piece worth talking about.' },
            ].map((item) => (
              <Grid key={item.title} size={{ xs: 12, sm: 6, md: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <Box sx={{ flexShrink: 0, mt: 0.25 }}>{item.icon}</Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.25 }}>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.desc}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Before signing up — the three legal/safety reads. Same cards as
            before, just under a different heading and reduced visual weight
            (this is a "skim before signup" thing, not the page's hero). */}
        <Box sx={{ maxWidth: 900, mx: 'auto' }}>
          <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 1.5, textAlign: 'center', letterSpacing: 1 }}>
            Before signing up
          </Typography>
          <Grid container spacing={2}>
            {[
              { icon: <Policy color="primary" sx={{ fontSize: 32 }} />, title: 'Code of Conduct', desc: 'Community guidelines for respectful collaboration', href: '/hack/code-of-conduct', cta: 'Read guidelines', tracker: 'code_of_conduct' },
              { icon: <Gavel color="action" sx={{ fontSize: 32 }} />, title: 'Liability Waiver', desc: 'Standard protection for in-person events', href: '/hack/liability-waiver', cta: 'View waiver', tracker: 'liability_waiver' },
              { icon: <CameraAlt color="action" sx={{ fontSize: 32 }} />, title: 'Photo Release', desc: 'Permission to share event photos', href: '/hack/photo-release', cta: 'Photo policy', tracker: 'photo_release' },
            ].map((item) => (
              <Grid key={item.title} size={{ xs: 12, md: 4 }}>
                <Card sx={{ height: '100%', textAlign: 'center', '&:hover': { boxShadow: 3 }, transition: 'box-shadow 0.3s' }}>
                  <CardContent>
                    <Box sx={{ mb: 1 }}>{item.icon}</Box>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {item.desc}
                    </Typography>
                    <Button
                      variant="outlined"
                      component={Link}
                      href={item.href}
                      fullWidth
                      size="small"
                      onClick={() => track('cta_click', item.tracker)}
                      sx={{ textTransform: 'none' }}
                    >
                      {item.cta}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>

      {/* Support Our Mission Section - Appropriate for secondary audience */}
      <Paper sx={{ p: 3, mt: 5, bgcolor: 'grey.100', color: 'text.primary', textAlign: 'center', borderTop: '3px solid', borderColor: 'primary.main' }}>
        <Business color="primary" sx={{ fontSize: 40, mb: 1.5 }} />
        <Typography variant="h5" gutterBottom>
          Support Our Mission
        </Typography>
        <Typography variant="body2" sx={{ mb: 2.5, maxWidth: '600px', mx: 'auto' }}>
          Help us continue organizing impactful hackathons. Partner with us to support the next generation of social impact technologists.
        </Typography>
        <Button 
          variant="contained" 
          size="medium"
          component={Link}
          href="/sponsor"
          sx={{ textTransform: 'none' }}
          onClick={() => track('cta_click', 'become_sponsor')}
        >
          Become a Sponsor
        </Button>
      </Paper>
    </LayoutContainer>
  );
};

export default HackathonIndex;