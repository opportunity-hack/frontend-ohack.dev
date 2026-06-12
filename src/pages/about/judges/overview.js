import React, { useEffect, useState, useCallback, memo } from "react";
import Link from "next/link";
import { initFacebookPixel, trackEvent } from "../../../lib/ga";
import {
  Typography,
  Box,
  Container,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Alert,
  IconButton,
  Tooltip,
  Snackbar
} from "@mui/material";

import {
  PlayCircleOutlineRounded,
  GavelRounded,
  AssessmentRounded,
  GroupsRounded,
  EventRounded,
  ArrowBackRounded,
  ShareRounded,
  LinkRounded,
  HelpOutlineRounded,
  DashboardRounded,
  SettingsRounded
} from "@mui/icons-material";

const trackOnClickButtonClickWithGoogleAndFacebook = (buttonName) => {
  trackEvent("click_judges_overview", buttonName);
};

const SectionHeader = memo(({ variant = "h3", component = "h2", children, sectionId, sx = {}, onCopyLink }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, ...sx }}>
    <Typography
      variant={variant}
      component={component}
      id={sectionId}
      sx={{ mr: 1 }}
    >
      {children}
    </Typography>
    <Tooltip title="Copy link to this section" arrow>
      <IconButton
        onClick={() => onCopyLink(sectionId)}
        sx={{ 
          opacity: 0.6,
          '&:hover': { opacity: 1 },
          color: 'text.secondary'
        }}
        size="small"
        aria-label={`Copy link to ${children} section`}
      >
        <LinkRounded fontSize="small" />
      </IconButton>
    </Tooltip>
  </Box>
));

SectionHeader.displayName = 'SectionHeader';

const VideoHighlightCard = memo(({ icon: Icon, title, description, chipLabel, chipColor }) => (
  <Grid size={{ xs: 12, md: 4 }}>
    <Card sx={{ 
      height: "100%", 
      display: 'flex',
      flexDirection: 'column',
      p: 2 
    }}>
      <CardContent sx={{ 
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Icon color={chipColor} sx={{ fontSize: 40, mb: 2 }} />
        <Typography variant="h6" component="h3" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" sx={{ flexGrow: 1, mb: 2 }}>
          {description}
        </Typography>
        <Box sx={{ mt: 'auto' }}>
          <Chip 
            label={chipLabel} 
            color={chipColor} 
            variant="outlined" 
            size="small"
          />
        </Box>
      </CardContent>
    </Card>
  </Grid>
));

VideoHighlightCard.displayName = 'VideoHighlightCard';

const ResourceButton = memo(({ href, icon: Icon, label, onClick, trackingLabel }) => (
  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
    <Button
      variant="outlined"
      fullWidth
      href={href}
      sx={{ 
        py: 2, 
        px: 1,
        height: '100px', // Fixed height for consistency
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        gap: 1
      }}
      onClick={() => {
        if (onClick) onClick();
        trackOnClickButtonClickWithGoogleAndFacebook(trackingLabel);
      }}
      aria-label={`Go to ${label}`}
    >
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        gap: 1
      }}>
        {Icon ? <Icon sx={{ fontSize: 24 }} /> : <Typography variant="h6">❓</Typography>}
        <Typography 
          variant="body2" 
          sx={{ 
            fontSize: '0.875rem',
            lineHeight: 1.2,
            fontWeight: 500
          }}
        >
          {label}
        </Typography>
      </Box>
    </Button>
  </Grid>
));

ResourceButton.displayName = 'ResourceButton';

const JudgingOverview = () => {
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  useEffect(() => {
    initFacebookPixel();
  }, []);

  const handleSnackbarClose = useCallback(() => {
    setSnackbar({ open: false, message: '' });
  }, []);

  const copyLinkToSection = useCallback((sectionId) => {
    const url = `${window.location.origin}${window.location.pathname}${sectionId ? `#${sectionId}` : ''}`;
    navigator.clipboard.writeText(url).then(() => {
      setSnackbar({ open: true, message: 'Link copied to clipboard!' });
      trackOnClickButtonClickWithGoogleAndFacebook(`copy_link_${sectionId || 'page'}`);
    }).catch(() => {
      setSnackbar({ open: true, message: 'Failed to copy link' });
    });
  }, []);

  const shareVideo = useCallback(async () => {
    const shareData = {
      title: 'How Judging Works at Opportunity Hack',
      text: 'Learn how judging works at Opportunity Hack - evaluating tech solutions that change lives!',
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        trackOnClickButtonClickWithGoogleAndFacebook('native_share');
      } catch (err) {
        copyLinkToSection('');
      }
    } else {
      copyLinkToSection('');
    }
  }, [copyLinkToSection]);

  const videoHighlights = [
    {
      icon: AssessmentRounded,
      title: "Scoring System Deep Dive",
      description: "Understand the 4-category, 40-point scoring system that evaluates scope, documentation, polish, and security of nonprofit tech solutions.",
      chipLabel: "Detailed Walkthrough",
      chipColor: "primary"
    },
    {
      icon: GavelRounded,
      title: "Two-Stage Process",
      description: "Learn how Stage 1 video evaluations lead to Stage 2 live demos, and how judges collaborate to identify the most impactful solutions.",
      chipLabel: "Process Breakdown",
      chipColor: "secondary"
    },
    {
      icon: GroupsRounded,
      title: "Raw Details",
      description: "This isn't abstract, learn how we run the judging for the hackathon in a concrete way with real examples and practical insights.",
      chipLabel: "Practical Guide",
      chipColor: "success"
    }
  ];

  const resources = [
    {
      href: "/about/judges#judging-criteria",
      icon: AssessmentRounded,
      label: "Scoring Criteria Guide",
      trackingLabel: "criteria_guide"
    },
    {
      href: "/about/judges#judge-faq",
      icon: HelpOutlineRounded,
      label: "Judge FAQ",
      trackingLabel: "judge_faq"
    },
    {
      href: "/judge",
      icon: DashboardRounded,
      label: "Judge Dashboard",
      trackingLabel: "judge_dashboard"
    },
    {
      href: "/about/process",
      icon: SettingsRounded,
      label: "OHack Process",
      trackingLabel: "ohack_process"
    }
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ padding: { xs: "1rem", sm: "2rem" }, fontSize: "1em" }}>
        {/* Back Navigation */}
        <Box sx={{ mb: 2 }}>
          <Link href="/about/judges" passHref>
            <Button
              startIcon={<ArrowBackRounded />}
              sx={{ color: 'text.secondary', textTransform: 'none' }}
              aria-label="Back to Judge Guide"
            >
              Back to Judge Guide
            </Button>
          </Link>
        </Box>

        {/* Header - Video-focused */}
        <Typography
          variant="h1"
          component="h1"
          sx={{
            fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem", lg: "3.5rem" },
            mb: 2,
            mt: 4,
            fontWeight: 700,
            lineHeight: 1.2,
            textAlign: 'center'
          }}
        >
          How Judging Works at Opportunity Hack - Video Guide
        </Typography>

        <Typography
          variant="h2"
          component="h2"
          sx={{
            fontSize: { xs: "1.25rem", sm: "1.5rem" },
            mb: 2,
            color: "text.secondary",
            fontWeight: 300,
            textAlign: 'center'
          }}
        >
          Complete 5-Minute Video Overview
        </Typography>

        <Typography
          variant="body1"
          sx={{
            fontSize: { xs: "16px", sm: "18px" },
            mb: 2,
            maxWidth: "800px",
            lineHeight: 1.7,
            textAlign: 'center',
            mx: 'auto'
          }}
        >
          Watch this comprehensive video guide to understand our complete judging process from evaluation criteria to live demo sessions that identify the most impactful nonprofit technology solutions.
        </Typography>

        {/* Main Video Section - Primary Content */}
        <Paper
          elevation={4}
          sx={{
            p: { xs: 3, sm: 4 },
            mb: 4,
            textAlign: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            mt: 2
          }}
          component="main"
          aria-labelledby="judging-video"
          role="main"
        >
          <Box sx={{ mb: 4 }}>
            <PlayCircleOutlineRounded sx={{ fontSize: { xs: 48, sm: 64 }, mb: 2, opacity: 0.9 }} />
            <Typography
              variant="h3"
              component="h2"
              id="judging-video"
              sx={{ color: 'white', mb: 2, fontSize: { xs: '1.5rem', sm: '2rem' } }}
            >
              🎥 Watch: How Judging Works at Opportunity Hack
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', mb: 2, fontSize: '18px' }}>
              5-minute comprehensive guide | From scoring criteria to live demos
            </Typography>
          </Box>

          <Box sx={{
            position: 'relative',
            width: '100%',
            maxWidth: '900px',
            margin: '0 auto',
            paddingBottom: '50.6%', // 16:9 aspect ratio for larger video
            height: 0,
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: '0 12px 48px rgba(0,0,0,0.4)',
            border: '3px solid rgba(255,255,255,0.3)'
          }}>
            <iframe
              src="https://www.youtube.com/embed/L702RpJpjGM?rel=0&modestbranding=1&enablejsapi=1"
              title="How Judging Works at Opportunity Hack - Complete 5 Minute Overview Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              itemProp="video"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%'
              }}
            />
          </Box>

          <Box sx={{ mt: 3, mb: 2 }}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
              📅 Published: September 8th 2025 • ⏱️ Duration: 5 minutes • 👀 Watch in full for complete process
            </Typography>
          </Box>

          <Box sx={{ 
            mt: 3, 
            display: 'flex', 
            gap: 2, 
            justifyContent: 'center', 
            flexWrap: 'wrap',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center'
          }}>
            <Button
              variant="contained"
              sx={{ 
                bgcolor: 'white', 
                color: 'primary.main',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
                minWidth: { xs: '200px', sm: 'auto' }
              }}
              href="/about/judges#upcoming-events"
              onClick={() => trackOnClickButtonClickWithGoogleAndFacebook('apply_after_video')}
            >
              Apply to Judge Now
            </Button>
            <Button
              variant="outlined"
              sx={{ 
                borderColor: 'white', 
                color: 'white',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                minWidth: { xs: '200px', sm: 'auto' }
              }}
              onClick={shareVideo}
              startIcon={<ShareRounded />}
            >
              Share This Video
            </Button>
          </Box>
        </Paper>

        {/* Video Highlights */}
        <Box component="section" sx={{ mb: 5 }} aria-labelledby="video-highlights">
          <SectionHeader 
            variant="h3" 
            component="h2" 
            sectionId="video-highlights"
            onCopyLink={copyLinkToSection}
          >
            What You'll Learn
          </SectionHeader>
          
          <Grid container spacing={3}>
            {videoHighlights.map((highlight, index) => (
              <VideoHighlightCard
                key={index}
                icon={highlight.icon}
                title={highlight.title}
                description={highlight.description}
                chipLabel={highlight.chipLabel}
                chipColor={highlight.chipColor}
              />
            ))}
          </Grid>
        </Box>

        {/* Ready to Judge CTA */}
        <Alert 
          severity="success" 
          sx={{ 
            mb: 5, 
            p: 3,
            '& .MuiAlert-message': { width: '100%' }
          }}
          component="section"
          aria-labelledby="ready-to-judge"
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h6" component="h3" gutterBottom id="ready-to-judge">
                Ready to Become a Judge?
              </Typography>
              <Typography variant="body1">
                Now that you understand the process, apply to judge at our upcoming hackathons and help identify technology solutions that transform nonprofit organizations worldwide.
              </Typography>
            </Box>
            <Box sx={{ 
              display: 'flex', 
              gap: 1, 
              flexWrap: 'wrap',
              flexDirection: { xs: 'column', sm: 'row' },
              minWidth: { xs: '100%', md: 'auto' }
            }}>
              <Button
                variant="contained"
                color="primary"
                href="/about/judges#upcoming-events"
                startIcon={<EventRounded />}
                onClick={() => trackOnClickButtonClickWithGoogleAndFacebook('find_events_cta')}
                sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
              >
                Find Events to Judge
              </Button>
              <Button
                variant="outlined"
                href="/about/judges#judging-criteria"
                onClick={() => trackOnClickButtonClickWithGoogleAndFacebook('practice_scoring_cta')}
                sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
              >
                Practice Scoring
              </Button>
            </Box>
          </Box>
        </Alert>

        {/* Additional Resources */}
        <Box component="section" sx={{ mb: 5 }} aria-labelledby="additional-resources">
          <SectionHeader 
            variant="h3" 
            component="h2" 
            sectionId="additional-resources"
            onCopyLink={copyLinkToSection}
          >
            Additional Resources for Judges
          </SectionHeader>
          
          <Grid container spacing={2}>
            {resources.map((resource, index) => (
              <ResourceButton
                key={index}
                href={resource.href}
                icon={resource.icon}
                label={resource.label}
                trackingLabel={resource.trackingLabel}
              />
            ))}
          </Grid>
        </Box>

        {/* Toast Notification */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={handleSnackbarClose}
          message={snackbar.message}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        />
      </Box>
    </Container>
  );
};

export default JudgingOverview;

export const getStaticProps = async () => {
  const title = "How Judging Works at Opportunity Hack - 10 Minute Video Guide";
  const description = "Watch this comprehensive 5-minute video guide explaining how judging works at Opportunity Hack. Learn our scoring system, two-stage evaluation process, and see real judge experiences evaluating nonprofit technology solutions.";

  return {
    props: {
      title: "Video: How Judging Works at Opportunity Hack",
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
          content: "https://cdn.ohack.dev/ohack.dev/judge_1.jpg",
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
          content: "https://www.ohack.dev/about/judges/overview",
          key: "url"
        },
        {
          name: "og:url",
          property: "og:url", 
          content: "https://www.ohack.dev/about/judges/overview",
          key: "ogurl"
        },
        {
          name: "og:video",
          property: "og:video",
          content: "https://www.youtube.com/watch?v=L702RpJpjGM",
          key: "ogvideo"
        },
        {
          name: "og:video:url",
          property: "og:video:url",
          content: "https://www.youtube.com/watch?v=L702RpJpjGM", 
          key: "ogvideourl"
        },
        {
          name: "og:video:secure_url",
          property: "og:video:secure_url",
          content: "https://www.youtube.com/watch?v=L702RpJpjGM",
          key: "ogvideosecureurl"
        },
        {
          name: "og:video:type",
          property: "og:video:type",
          content: "text/html",
          key: "ogvideotype"
        },
        {
          name: "og:video:width",
          property: "og:video:width", 
          content: "1280",
          key: "ogvideowidth"
        },
        {
          name: "og:video:height",
          property: "og:video:height",
          content: "720", 
          key: "ogvideoheight"
        },
        {
          name: "twitter:card",
          property: "twitter:card",
          content: "player",
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
          content: "https://cdn.ohack.dev/ohack.dev/judge_1.jpg",
          key: "twitterimage"
        },
        {
          name: "twitter:player",
          property: "twitter:player",
          content: "https://www.youtube.com/embed/L702RpJpjGM",
          key: "twitterplayer"
        },
        {
          name: "twitter:player:width", 
          property: "twitter:player:width",
          content: "1280",
          key: "twitterplayerwidth"
        },
        {
          name: "twitter:player:height",
          property: "twitter:player:height",
          content: "720",
          key: "twitterplayerheight"
        }
      ],
      structuredData: {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Organization",
            "@id": "https://www.ohack.dev/#organization",
            "name": "Opportunity Hack",
            "url": "https://www.ohack.dev",
            "logo": {
              "@type": "ImageObject",
              "url": "https://cdn.ohack.dev/ohack.dev/judge_1.jpg"
            },
            "sameAs": [
              "https://twitter.com/opportunityhack",
              "https://github.com/opportunity-hack"
            ]
          },
          {
            "@type": "VideoObject",
            "@id": "https://www.ohack.dev/about/judges/overview#main-video",
            "name": title,
            "description": description,
            "thumbnailUrl": [
              "https://i.ytimg.com/vi/L702RpJpjGM/maxresdefault.jpg",
              "https://i.ytimg.com/vi/L702RpJpjGM/hqdefault.jpg"
            ],
            "uploadDate": "2025-09-08T00:00:00.000Z",
            "publishDate": "2025-09-08T00:00:00.000Z",
            "contentUrl": "https://www.youtube.com/watch?v=L702RpJpjGM",
            "embedUrl": "https://www.youtube.com/embed/L702RpJpjGM?rel=0&modestbranding=1&enablejsapi=1",
            "playerType": "HTML5 Flash",
            "duration": "PT10M30S",
            "videoQuality": "hd720",
            "inLanguage": "en-US",
            "isFamilyFriendly": true,            
            "keywords": ["judging", "hackathon", "scoring", "nonprofit", "technology", "evaluation", "opportunity hack"],
            "interactionStatistic": {
              "@type": "InteractionCounter",
              "interactionType": { "@type": "WatchAction" },
              "userInteractionCount": 1000
            },
            "publisher": {
              "@type": "Organization",
              "name": "Opportunity Hack",
              "url": "https://www.ohack.dev",
              "logo": {
                "@type": "ImageObject",
                "url": "https://cdn.ohack.dev/ohack.dev/judge_1.jpg"
              }
            },
            "creator": {
              "@type": "Organization",
              "name": "Opportunity Hack",
              "url": "https://www.ohack.dev"
            }
          },
          {
            "@type": "WebPage",
            "@id": "https://www.ohack.dev/about/judges/overview#webpage",
            "url": "https://www.ohack.dev/about/judges/overview",
            "name": title,
            "description": description,
            "primaryImageOfPage": {
              "@type": "ImageObject",
              "url": "https://i.ytimg.com/vi/L702RpJpjGM/maxresdefault.jpg"
            },
            "isPartOf": {
              "@type": "WebSite",
              "@id": "https://www.ohack.dev/#website"
            },
            "mainEntity": {
              "@type": "VideoObject",
              "@id": "https://www.ohack.dev/about/judges/overview#main-video"
            },
            "mainContentOfPage": {
              "@type": "VideoObject",
              "@id": "https://www.ohack.dev/about/judges/overview#main-video"
            },
            "specialty": "Video Guide",
            "about": {
              "@type": "Thing",
              "name": "Hackathon Judging Process",
              "description": "Video explanation of how judging works at Opportunity Hack"
            }
          },
          {
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://www.ohack.dev"
              },
              {
                "@type": "ListItem",
                "position": 2, 
                "name": "About",
                "item": "https://www.ohack.dev/about"
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": "Judges", 
                "item": "https://www.ohack.dev/about/judges"
              },
              {
                "@type": "ListItem",
                "position": 4,
                "name": "Overview",
                "item": "https://www.ohack.dev/about/judges/overview"
              }
            ]
          }
        ]
      }
    },
  };
};