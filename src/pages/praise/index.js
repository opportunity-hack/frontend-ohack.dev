import React, { useEffect } from 'react';
import Head from 'next/head';
import { Box, Container, Typography, Paper } from '@mui/material';
import PraiseBoard from '../../components/Praise/PraiseBoard';
import { styled } from '@mui/material/styles';
import ScrollTracker from '../../components/ScrollTracker';
import * as ga from '../../lib/ga';

const HeroBanner = styled(Paper)(({ theme }) => ({
  position: 'relative',
  backgroundColor: '#093170',
  color: theme.palette.common.white,
  marginBottom: theme.spacing(4),
  backgroundSize: 'cover',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center',
  padding: theme.spacing(8, 0),
}));

const PraisePage = () => {
  useEffect(() => {
    // Track page view with enhanced metadata
    const pageMetadata = {
      page_type: 'community_content',
      content_section: 'praise',
      has_interactive_elements: true
    };

    // Track this page view as part of the engagement journey
    ga.trackJourneyStep(
      'community_engagement',
      'view_praise_board',
      pageMetadata
    );

    // Track as content engagement
    ga.trackContentEngagement(
      'community_feature',
      'praise_board',
      ga.EventAction.VIEW,
      { entry_source: document.referrer || 'direct' }
    );
  }, []);

  return (
    <>
      <Head>
        <title>Community Praise Board | Opportunity Hack</title>
        <meta
          name="description"
          content="View praises and recognition for the outstanding contributions of our community members. Celebrate the positive impact of Opportunity Hack volunteers and mentors."
        />
        <meta
          name="keywords"
          content="Opportunity Hack, community praise, recognition, tech volunteers, nonprofit tech, community appreciation, kudos"
        />
        <meta property="og:title" content="OHack Community Praise Board" />
        <meta
          property="og:description"
          content="Celebrating the amazing contributions of our OHack community members."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://ohack.dev/praise" />
        <meta
          property="og:image"
          content="https://cdn.ohack.dev/ohack.dev/2023_hackathon_2.webp"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://ohack.dev/praise" />
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Community Praise Board",
            "description": "View praises and recognition for the outstanding contributions of our community members at Opportunity Hack.",
            "url": "https://ohack.dev/praise",
            "mainEntity": {
              "@type": "ItemList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Community Praises"
                }
              ]
            }
          }
        `}</script>
      </Head>

      {/* Add ScrollTracker to measure engagement */}
      <ScrollTracker pageType="praise_board" />

      <HeroBanner>
        <Container maxWidth="lg">
          <Box textAlign="center" mt={10}>
            <Typography
              component="h1"
              variant="h2"
              color="inherit"
              gutterBottom
            >
              Community Praise Board
            </Typography>
            <Typography variant="h5" color="inherit" paragraph>
              Celebrating our amazing volunteers, mentors, and community members
            </Typography>
          </Box>
        </Container>
      </HeroBanner>

      <PraiseBoard />

      <Box sx={{ bgcolor: "background.paper", p: 6 }} component="footer">
        <Typography
          variant="subtitle1"
          align="center"
          color="text.secondary"
          component="p"
          gutterBottom
        >
          Our community thrives through mutual appreciation and recognition
        </Typography>
        <Typography
          variant="body2"
          align="center"
          color="text.secondary"
          component="p"
        >
          Join Slack and send a /praise message to recognize someone's
          contribution!
        </Typography>
      </Box>
    </>
  );
};

export default PraisePage;