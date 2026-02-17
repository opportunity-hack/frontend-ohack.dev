import React, { useState, useEffect } from "react";
import Head from "next/head";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import { Alert, Snackbar, Skeleton, Box, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  BlankContainer,
  ButtonContainersSmall,
  CaptionContainer,
  EventCards,
  MoreNewsStyle,
  NewsLinkButton,
  SlackButton,
  StyledTextLink,
  TextMuted,
  TitleContainer,
  TitleStyled,
} from "./styles";

import { Divider } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { initFacebookPixel, trackEvent } from "../../lib/ga";

// Utility function for better date formatting
const formatDate = (dateString) => {
  if (!dateString) return 'Date not available';
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.ceil(diffTime / (1000 * 60));
    
    // Return relative time for recent posts
    if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      // Return formatted date for older posts
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

// Generate structured data for SEO
const generateStructuredData = (newsData) => {
  if (!newsData || newsData.length === 0) return null;
  
  const articles = newsData.map(item => ({
    "@type": "NewsArticle",
    "headline": item.title,
    "description": item.description,
    "url": `https://ohack.dev/blog/${item.id}`,
    "datePublished": item.slack_ts_human_readable,
    "dateModified": item.slack_ts_human_readable,
    "author": {
      "@type": "Organization",
      "name": "Opportunity Hack"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Opportunity Hack",
      "logo": {
        "@type": "ImageObject",
        "url": "https://ohack.dev/logo.png"
      }
    },
    "image": item.image || "https://ohack.dev/default-news.png",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://ohack.dev/blog/${item.id}`
    }
  }));
  
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": articles.map((article, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": article
    }))
  };
};

function News({ newsData, frontpage, loading }) {
  const structuredData = generateStructuredData(newsData);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  useEffect(() => {
    initFacebookPixel();
  }, []);
  

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setSnackbarMessage("Text copied!");
    setSnackbarOpen(true);
    gaButton("button_copy", text);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const gaButton = async (action, actionName) => {
    console.log("gaButton", "action:", action, "actionName:", actionName);
    trackEvent({ action, params: { action_name: actionName } });
  };

  const renderSkeleton = () => (
    <BlankContainer>
      <Box display="flex" gap={2}>
        <Skeleton variant="rectangular" width={70} height={70} />
        <Box flex={1}>
          <Skeleton variant="text" width="80%" height={30} />
          <Skeleton variant="text" width="60%" />
        </Box>
      </Box>
      <Skeleton variant="text" width="90%" height={60} style={{ marginTop: '16px' }} />
      <Skeleton variant="rectangular" width="100%" height={40} style={{ marginTop: '16px' }} />
    </BlankContainer>
  );

  return (
    <>
      {structuredData && (
        <Head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(structuredData)
            }}
          />
        </Head>
      )}
      <EventCards 
        container 
        direction="column" 
        frontpage={frontpage}
        role="feed"
        aria-label="Latest news and updates"
      >
        {frontpage && (
          <Box display="flex" justifyContent="flex-end" mb={2}>
            <Link prefetch={false} href="/blog" aria-label="View all news articles">
              <MoreNewsStyle>
                More news
                <ArrowForwardIcon aria-hidden="true" />
              </MoreNewsStyle>
            </Link>
          </Box>
        )}

      {loading ? (
        Array(3).fill(0).map((_, index) => (
          <React.Fragment key={`news-skeleton-${index}`}>
            {renderSkeleton()}
          </React.Fragment>
        ))
      ) : (
        newsData?.map((newsItem, index) => (
          <BlankContainer 
            key={newsItem.id}
            component="article"
            role="article"
            aria-labelledby={`news-title-${newsItem.id}`}
          >
            <TitleContainer component="header">
              <Box display="flex" alignItems="flex-start" mb={2} gap={2}>
                {newsItem.image && (
                  <Box
                    sx={{
                      width: 70,
                      height: 70,
                      position: "relative",
                      flexShrink: 0,
                      borderRadius: 2,
                      overflow: 'hidden'
                    }}
                  >
                    <Image
                      src={newsItem.image}
                      alt={`Featured image for ${newsItem.title}`}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="70px"
                    />
                  </Box>
                )}
                <Box flex={1} minWidth={0}>
                  <Typography 
                    variant="h3" 
                    component="h2"
                    id={`news-title-${newsItem.id}`}
                    sx={{ 
                      fontSize: { xs: '1.25rem', sm: '1.5rem' },
                      fontWeight: 600,
                      lineHeight: 1.3,
                      mb: 1,
                      color: '#1a1a1a'
                    }}
                  >
                    <Link 
                      href={`/blog/${newsItem.id}`} 
                      style={{ textDecoration: 'none', color: 'inherit' }}
                      aria-label={`Read full article: ${newsItem.title}`}
                    >
                      {newsItem.title}
                    </Link>
                  </Typography>
                  
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <AccessTimeIcon 
                      sx={{ fontSize: '1rem', color: 'text.secondary' }} 
                      aria-hidden="true" 
                    />
                    <Typography 
                      component="time" 
                      dateTime={newsItem.slack_ts_human_readable}
                      sx={{ 
                        fontSize: '0.875rem', 
                        color: 'text.secondary',
                        fontWeight: 500
                      }}
                    >
                      {formatDate(newsItem.slack_ts_human_readable)}
                    </Typography>
                  </Box>
                  
                  <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                    {newsItem.slack_permalink && (
                      <SlackButton
                        onClick={() => gaButton("button_slack_post", newsItem.slack_permalink)}
                        href={newsItem.slack_permalink}
                        target="_blank"
                        variant="outlined"
                        size="small"
                        aria-label="View original Slack post"
                      >
                        Original Post
                      </SlackButton>
                    )}
                    <FileCopyIcon
                      onClick={() => handleCopy(
                        `${newsItem.title} ${newsItem.description} More at https://ohack.dev/blog/${newsItem.id}`
                      )}
                      sx={{ 
                        cursor: "pointer", 
                        fontSize: '1.2rem',
                        color: 'text.secondary',
                        '&:hover': { color: 'primary.main' }
                      }}
                      aria-label="Copy article link to clipboard"
                    />
                  </Box>
                </Box>
              </Box>
            </TitleContainer>

            <CaptionContainer 
              component="div"
              sx={{
                fontSize: '1rem',
                lineHeight: 1.6,
                color: 'text.primary',
                mb: 3
              }}
            >
              {newsItem.description}
            </CaptionContainer>
            
            {newsItem.links && newsItem.links.length > 0 && (
              <Box component="nav" aria-label="Related links" sx={{ mb: 2 }}>
                <ButtonContainersSmall>
                  {newsItem.links
                    .filter(link => !link.url.startsWith("#") && !link.name.startsWith("@"))
                    .map((link) => (
                      <NewsLinkButton
                        key={link.name}
                        onClick={() => gaButton("button_news", link.name + ":" + link.url)}
                        variant="contained"
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Visit ${link.name} (opens in new tab)`}
                      >
                        {link.name}
                      </NewsLinkButton>
                    ))
                  }
                </ButtonContainersSmall>

                <ButtonContainersSmall sx={{ mt: 1 }}>
                  {newsItem.links
                    .filter(link => link.url.startsWith("#"))
                    .map((link) => (
                      <SlackButton
                        key={link.name}
                        onClick={() => gaButton("button_slack", link.name + ":" + link.url)}
                        variant="outlined"
                        size="small"
                        href={`https://opportunity-hack.slack.com/app_redirect?channel=${link.name}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Join Slack channel ${link.name} (opens in new tab)`}
                      >
                        #{link.name}
                      </SlackButton>
                    ))
                  }
                </ButtonContainersSmall>
              </Box>
            )}
            
          </BlankContainer>
        ))
      )}
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
      </EventCards>
    </>
  );
}

export default News;
