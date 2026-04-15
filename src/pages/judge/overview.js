import React, { useEffect, useState, useCallback, memo } from "react";
import Link from "next/link";
import { initFacebookPixel, trackEvent } from "../../lib/ga";
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
  VideoLibraryRounded,
  VisibilityRounded,
  SpeedRounded,
  ChecklistRounded,
  DashboardRounded,
  ScoreRounded
} from "@mui/icons-material";

const trackOnClickButtonClickWithGoogleAndFacebook = (buttonName) => {
  trackEvent("click_judge_overview", buttonName);
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
        height: '100px',
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
        {Icon && <Icon sx={{ fontSize: 24 }} />}
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

const JudgeDashboardOverview = () => {
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
      title: 'How to Use the Judge Dashboard - Opportunity Hack',
      text: 'Learn how to use our judging tool for evaluating hackathon projects!',
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
      icon: VideoLibraryRounded,
      title: "Dashboard Walkthrough",
      description: "Complete tour of the judge dashboard interface, showing you exactly where to find teams, scoring forms, and progress tracking.",
      chipLabel: "Step-by-Step Guide",
      chipColor: "primary"
    },
    {
      icon: VisibilityRounded,
      title: "Round 1 & Round 2 Details",
      description: "Deep dive into both judging rounds - how to review pitch videos, evaluate GitHub projects, and conduct live demo sessions.",
      chipLabel: "Process Details",
      chipColor: "secondary"
    },
    {
      icon: SpeedRounded,
      title: "Behind the Scenes",
      description: "How we use our admin dashboard to streamline the judging process.",
      chipLabel: "Backstage Pass",
      chipColor: "success"
    }
  ];

  const resources = [
    {
      href: "/judge",
      icon: DashboardRounded,
      label: "Judge Dashboard",
      trackingLabel: "judge_dashboard"
    },
    {
      href: "/about/judges#judging-criteria",
      icon: ChecklistRounded,
      label: "Scoring Criteria",
      trackingLabel: "scoring_criteria"
    },
    {
      href: "/about/judges/overview",
      icon: ScoreRounded,
      label: "Judging Process Guide",
      trackingLabel: "judging_process"
    },
    {
      href: "/about/judges#judge-faq",
      icon: AssessmentRounded,
      label: "Judge FAQ",
      trackingLabel: "judge_faq"
    }
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ padding: { xs: "1rem", sm: "2rem" }, fontSize: "1em" }}>
        {/* Back Navigation */}
        <Box sx={{ mb: 2 }}>
          <Link href="/judge" passHref>
            <Button
              startIcon={<ArrowBackRounded />}
              sx={{ color: 'text.secondary', textTransform: 'none' }}
              aria-label="Back to Judge Dashboard"
            >
              Back to Judge Dashboard
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
          How to Use the Judge Dashboard - Video Tutorial
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
          Complete 8-Minute Video Tutorial
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
          Watch this comprehensive video tutorial to master our judging platform. Learn how to navigate the dashboard, evaluate projects in both rounds, and provide meaningful feedback that helps teams improve their nonprofit technology solutions.
        </Typography>

        {/* Main Video Section - Primary Content */}
        <Paper
          elevation={4}
          sx={{
            p: { xs: 3, sm: 4 },
            mb: 4,
            textAlign: 'center',
            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
            color: 'white',
            mt: 2
          }}
          component="main"
          aria-labelledby="dashboard-video"
          role="main"
        >
          <Box sx={{ mb: 4 }}>
            <PlayCircleOutlineRounded sx={{ fontSize: { xs: 48, sm: 64 }, mb: 2, opacity: 0.9 }} />
            <Typography
              variant="h3"
              component="h2"
              id="dashboard-video"
              sx={{ color: 'white', mb: 2, fontSize: { xs: '1.5rem', sm: '2rem' } }}
            >
              🎥 Watch: How to Use the Judge Dashboard
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', mb: 2, fontSize: '18px' }}>
              8-minute comprehensive tutorial | Master the judging interface
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
              src="https://www.youtube.com/embed/ZmciEvdre24?rel=0&modestbranding=1&enablejsapi=1"
              title="How to Use the Judge Dashboard - Complete Opportunity Hack Tutorial Video"
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
              📅 Updated: September 8th 2025 • ⏱️ Duration: 8 minutes • 👀 Complete walkthrough of judging tool
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
              href="/judge"
              onClick={() => trackOnClickButtonClickWithGoogleAndFacebook('goto_dashboard_after_video')}
            >
              Go to Judge Dashboard
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
              Share This Tutorial
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
            What You'll Master
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
          aria-labelledby="ready-to-start"
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h6" component="h3" gutterBottom id="ready-to-start">
                Ready to Start Judging?
              </Typography>
              <Typography variant="body1">
                Now that you know how to use the dashboard, access your judge assignments and start evaluating the innovative nonprofit technology solutions created by hackathon teams.
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
                href="/judge"
                startIcon={<GavelRounded />}
                onClick={() => trackOnClickButtonClickWithGoogleAndFacebook('start_judging_cta')}
                sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
              >
                Start Judging Now
              </Button>
              <Button
                variant="outlined"
                href="/about/judges#judging-criteria"
                onClick={() => trackOnClickButtonClickWithGoogleAndFacebook('review_criteria_cta')}
                sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
              >
                Review Scoring Criteria
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
            Judge Resources & Tools
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

        {/* Process Overview */}
        <Paper elevation={1} sx={{ p: 3, mb: 5, bgcolor: 'grey.50' }}>
          <Typography variant="h6" component="h3" gutterBottom>
            Quick Reference: Judging Process
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box>
                <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <EventRounded sx={{ mr: 1, color: 'primary.main' }} />
                  Round 1: Initial Evaluation
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Review 4-minute pitch videos and GitHub repositories. Score projects on scope, documentation, polish, and security using our 40-point system.
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box>
                <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <GroupsRounded sx={{ mr: 1, color: 'secondary.main' }} />
                  Round 2: Final Assessment
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Re-evaluate top teams based on their responses to Round 1 feedback, or conduct live demo sessions for in-person events.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

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

export default JudgeDashboardOverview;

export const getStaticProps = async () => {
  const title = "Judge Dashboard Tutorial - 8 Minute Video Guide | Opportunity Hack";
  const description = "Watch this comprehensive 8-minute video tutorial on using the Opportunity Hack judge dashboard. Learn to evaluate projects in Round 1 & 2, navigate the scoring interface, and provide effective feedback to teams creating nonprofit technology solutions.";

  return {
    props: {
      title: "Video: Judge Dashboard Tutorial - Opportunity Hack",
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
          content: "https://ohack.dev/judge/overview",
          key: "url"
        },
        {
          name: "og:url",
          property: "og:url", 
          content: "https://ohack.dev/judge/overview",
          key: "ogurl"
        },
        {
          name: "og:video",
          property: "og:video",
          content: "https://www.youtube.com/watch?v=ZmciEvdre24",
          key: "ogvideo"
        },
        {
          name: "og:video:url",
          property: "og:video:url",
          content: "https://www.youtube.com/watch?v=ZmciEvdre24", 
          key: "ogvideourl"
        },
        {
          name: "og:video:secure_url",
          property: "og:video:secure_url",
          content: "https://www.youtube.com/watch?v=ZmciEvdre24",
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
          content: "https://www.youtube.com/embed/ZmciEvdre24",
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
            "@id": "https://ohack.dev/#organization",
            "name": "Opportunity Hack",
            "url": "https://ohack.dev",
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
            "@id": "https://ohack.dev/judge/overview#main-video",
            "name": title,
            "description": description,
            "thumbnailUrl": [
              "https://i.ytimg.com/vi/ZmciEvdre24/maxresdefault.jpg",
              "https://i.ytimg.com/vi/ZmciEvdre24/hqdefault.jpg"
            ],
            "uploadDate": "2025-08-08T00:00:00.000Z",
            "publishDate": "2025-08-08T00:00:00.000Z",
            "contentUrl": "https://www.youtube.com/watch?v=ZmciEvdre24",
            "embedUrl": "https://www.youtube.com/embed/ZmciEvdre24?rel=0&modestbranding=1&enablejsapi=1",
            "playerType": "HTML5 Flash",
            "duration": "PT15M",
            "videoQuality": "hd720",
            "inLanguage": "en-US",
            "isFamilyFriendly": true,
            "keywords": ["judge", "dashboard", "hackathon", "tutorial", "evaluation", "scoring", "nonprofit", "technology", "opportunity hack"],
            "interactionStatistic": {
              "@type": "InteractionCounter",
              "interactionType": { "@type": "WatchAction" },
              "userInteractionCount": 500
            },
            "publisher": {
              "@type": "Organization",
              "name": "Opportunity Hack",
              "url": "https://ohack.dev",
              "logo": {
                "@type": "ImageObject",
                "url": "https://cdn.ohack.dev/ohack.dev/judge_1.jpg"
              }
            },
            "creator": {
              "@type": "Organization",
              "name": "Opportunity Hack",
              "url": "https://ohack.dev"
            }
          },
          {
            "@type": "WebPage",
            "@id": "https://ohack.dev/judge/overview#webpage",
            "url": "https://ohack.dev/judge/overview",
            "name": title,
            "description": description,
            "primaryImageOfPage": {
              "@type": "ImageObject",
              "url": "https://i.ytimg.com/vi/ZmciEvdre24/maxresdefault.jpg"
            },
            "isPartOf": {
              "@type": "WebSite",
              "@id": "https://ohack.dev/#website"
            },
            "mainEntity": {
              "@type": "VideoObject",
              "@id": "https://ohack.dev/judge/overview#main-video"
            },
            "mainContentOfPage": {
              "@type": "VideoObject",
              "@id": "https://ohack.dev/judge/overview#main-video"
            },
            "specialty": "Video Tutorial",
            "about": {
              "@type": "Thing",
              "name": "Judge Dashboard Tutorial",
              "description": "Video tutorial for using the judge dashboard at Opportunity Hack"
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
                "name": "Judge Dashboard",
                "item": "https://ohack.dev/judge"
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": "Dashboard Overview",
                "item": "https://ohack.dev/judge/overview"
              }
            ]
          }
        ]
      }
    },
  };
};