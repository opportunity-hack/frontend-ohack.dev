import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { Box, Container, Typography, Paper, Button, Chip, Stack, Alert, AlertTitle } from '@mui/material';
import { Celebration, EmojiEvents, Favorite, Message, TrendingUp, StarBorder } from '@mui/icons-material';
import PraiseBoard from '../../components/Praise/PraiseBoard';
import { styled, keyframes } from '@mui/material/styles';
import ScrollTracker from '../../components/ScrollTracker';
import * as ga from '../../lib/ga';

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const HeroBanner = styled(Paper)(({ theme }) => ({
  position: 'relative',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: theme.palette.common.white,
  marginBottom: theme.spacing(4),
  backgroundSize: 'cover',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center',
  padding: theme.spacing(10, 0),
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)',
    pointerEvents: 'none',
  },
}));

const FloatingIcon = styled(Box)(({ theme, delay = 0 }) => ({
  position: 'absolute',
  animation: `${float} 3s ease-in-out infinite`,
  animationDelay: `${delay}s`,
  opacity: 0.7,
  fontSize: '2rem',
}));

const PulsingButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #FF6B6B 30%, #4ECDC4 90%)',
  border: 0,
  borderRadius: 25,
  boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
  color: 'white',
  height: 48,
  padding: '0 30px',
  animation: `${pulse} 2s ease-in-out infinite`,
  '&:hover': {
    background: 'linear-gradient(45deg, #FF8E53 30%, #FE6B8B 90%)',
    transform: 'scale(1.05)',
  },
}));

const StatsChip = styled(Chip)(({ theme }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  color: 'white',
  fontWeight: 'bold',
  margin: theme.spacing(0.5),
  '& .MuiChip-icon': {
    color: 'white',
  },
}));

const SlackCallout = styled(Alert)(({ theme }) => ({
  background: 'linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%)',
  color: 'white',
  borderRadius: '16px',
  border: 'none',
  '& .MuiAlert-icon': {
    color: 'white',
  },
  '& .MuiAlertTitle-root': {
    color: 'white',
    fontWeight: 'bold',
  },
}));

const PraisePage = () => {
  const [showConfetti, setShowConfetti] = useState(false);

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

    // Show a brief celebration on page load
    const timer = setTimeout(() => setShowConfetti(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleSlackClick = () => {
    ga.trackContentEngagement(
      'cta_click',
      'slack_praise_instruction',
      ga.EventAction.CLICK
    );
    window.open('https://app.slack.com/client/T1Q7936BH', '_blank');
  };

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
        <FloatingIcon sx={{ top: '10%', left: '10%' }} delay={0}>
          🎉
        </FloatingIcon>
        <FloatingIcon sx={{ top: '20%', right: '15%' }} delay={1}>
          ⭐
        </FloatingIcon>
        <FloatingIcon sx={{ bottom: '20%', left: '20%' }} delay={2}>
          🙌
        </FloatingIcon>
        <FloatingIcon sx={{ bottom: '15%', right: '10%' }} delay={0.5}>
          💝
        </FloatingIcon>
        
        <Container maxWidth="lg">
          <Box textAlign="center" sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
              <Celebration sx={{ fontSize: '3rem', mr: 2, color: '#FFD700' }} />
              <Typography
                component="h1"
                variant="h2"
                color="inherit"
                sx={{ 
                  fontWeight: 'bold',
                  background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                Praise Board
              </Typography>
              <Celebration sx={{ fontSize: '3rem', ml: 2, color: '#FFD700' }} />
            </Box>
            
            <Typography variant="h5" color="inherit" paragraph sx={{ mb: 4, opacity: 0.9 }}>
              Where our amazing community celebrates each other! 🎊
            </Typography>
            
            <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" sx={{ mb: 4 }}>
              <StatsChip icon={<Favorite />} label="Spread Love" />
              <StatsChip icon={<EmojiEvents />} label="Recognize Excellence" />
              <StatsChip icon={<TrendingUp />} label="Build Community" />
            </Stack>
            
            <PulsingButton
              onClick={handleSlackClick}
              size="large"
              startIcon={<Message />}
            >
              Send Praise on Slack
            </PulsingButton>
          </Box>
        </Container>
      </HeroBanner>

      <Container maxWidth="lg" sx={{ mb: 4 }}>
        <SlackCallout severity="info" sx={{ mb: 4 }}>
          <AlertTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Message /> How to Send Praise
          </AlertTitle>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Join our Slack community and use the <strong>/praise</strong> command to recognize someone's amazing work!
          </Typography>
          
        </SlackCallout>
      </Container>

      <PraiseBoard />

      <Box sx={{ 
        bgcolor: "background.paper", 
        p: 6,
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        borderRadius: '20px 20px 0 0',
        mt: 4
      }} component="footer">
        <Container maxWidth="md">
          <Box textAlign="center">
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 3 }}>
              <StarBorder sx={{ fontSize: '2rem', color: '#667eea', mr: 1 }} />
              <Typography
                variant="h5"
                component="h3"
                sx={{ 
                  fontWeight: 'bold',
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Keep the Positivity Flowing!
              </Typography>
              <StarBorder sx={{ fontSize: '2rem', color: '#667eea', ml: 1 }} />
            </Box>
            
            <Typography
              variant="subtitle1"
              align="center"
              color="text.secondary"
              component="p"
              gutterBottom
              sx={{ mb: 3 }}
            >
              Our community thrives through mutual appreciation and recognition ❤️
            </Typography>
            
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center" alignItems="center">
              <PulsingButton
                onClick={handleSlackClick}
                startIcon={<Message />}
                size="large"
              >
                Join Our Slack
              </PulsingButton>
              <Typography variant="body2" color="text.secondary">
                Use <strong>/praise</strong> to spread the love!
              </Typography>
            </Stack>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default PraisePage;