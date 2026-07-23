import Grid from '@mui/material/Grid';
import dynamic from 'next/dynamic';
import {
  NewsLinkButton,
  SlackButton,
  TitleStyled,
  TitleContainer,
  CaptionContainer,
  MoreNewsStyle,
  ButtonContainersSmall,
  TextMuted,
  EventCards,
  BlankContainer,
} from './styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { useState, useEffect } from 'react';
import { Snackbar, Box, Chip } from '@mui/material';
import { Alert } from '@mui/material';
import { Typography } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { trackEvent, initFacebookPixel } from '../../lib/ga';
import React from 'react';

import Image from 'next/image'
import { normalizeImageUrl } from '../../lib/imageUtils'

import Link from 'next/link';

// Lazy-load the markdown renderer so the legacy HTML path stays light.
const ReactMarkdown = dynamic(() => import('react-markdown'), { ssr: true });

const markdownImageRenderer = ({ src, alt }) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img
    src={src}
    alt={alt || ''}
    loading="lazy"
    decoding="async"
    style={{ maxWidth: '100%', height: 'auto', display: 'block', margin: '1em 0' }}
  />
);

const markdownLinkRenderer = ({ href, children }) => (
  <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
);

function SingleNews( {newsItem} ) {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // Initialize Facebook Pixel
  useEffect(() => {
    initFacebookPixel();
  }, []);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text + " More at www.ohack.dev/blog"); // Copy the text to clipboard
    setSnackbarMessage('Text copied!');
    setSnackbarOpen(true);
    gaButton("button_copy",text);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };
 
  
  const gaButton = async (action, actionName) => {
    console.log("gaButton", "action:", action, "actionName:", actionName);
    
    // Track Google Ads conversion
    trackEvent({ 
      action: "conversion",
      params: {
        send_to: "AW-11474351176/JCk6COG-q4kZEMjost8q"  
      }      
    });

    // Track regular event
    trackEvent({
      action: action,
      params: {
        action_name: actionName,
      },
    });    
  };

  const heroImage = newsItem.featured_image || newsItem.image;
  const isMarkdown = newsItem.content_format === 'markdown' && newsItem.content_markdown;
  const publishedDate = newsItem.published_at || newsItem.slack_ts_human_readable;
  const author = newsItem.author?.name;
  const tags = Array.isArray(newsItem.tags) ? newsItem.tags : [];
  const hasSlackPermalink = !!newsItem.slack_permalink;

  return (
    <EventCards container direction='row' style={{ margin: '2px', padding: '8px' }}>

        <Link prefetch={false} href="/blog">
        <MoreNewsStyle>
          <ArrowBackIcon/>
          Back to news
        </MoreNewsStyle>
        </Link>

        <Link prefetch={false} href="/about">
        <MoreNewsStyle style={{marginLeft:'5px'}}>
          <InfoIcon/>&nbsp;
          Read more about us
        </MoreNewsStyle>
        </Link>

        <BlankContainer xs={12} md={12} lg={12}  key={newsItem.id}>
          <TitleContainer container>
            <Grid size={{ xs: 12, md: 12, lg: 12 }}>
              {heroImage && (
              <Image
                src={normalizeImageUrl(heroImage)}
                alt={newsItem.title}

                height={isMarkdown ? 320 : 150}
                width={isMarkdown ? 640 : 150}

                style={{
                  marginBottom: '0.5em',
                  maxWidth: '100%',
                  height: 'auto',
                  borderRadius: isMarkdown ? 8 : 0,
                }}
              />
              )}

                <Typography variant="h2">
                    {newsItem.title}
                </Typography>

                {!isMarkdown && hasSlackPermalink && (
                  <Typography>This was summarized by AI, see the Slack post for specific details.</Typography>
                )}
                <TitleStyled variant="h1">

                {hasSlackPermalink && (
                  <SlackButton onClick={() => gaButton("button_slack_post", newsItem.slack_permalink)} target="_blank" variant="outlined" >
                    <Link href={newsItem.slack_permalink} target='_blank'>
                      Original Slack Post
                    </Link>
                  </SlackButton>
                )}

                <FileCopyIcon
                  onClick={() => handleCopy(`${newsItem.title} ${newsItem.description}`)}
                  style={{ cursor: 'pointer', marginLeft: '5px' }}
                  aria-label="Copy blog excerpt"
                />



              </TitleStyled>

            </Grid>
            <Grid size={{ xs: 12, md: 12, lg: 12 }}>
              <TextMuted>
                <CalendarTodayIcon style={{ marginRight: '5px' }} />
                {publishedDate}
                {author && <span style={{ marginLeft: 12 }}>· by {author}</span>}
              </TextMuted>
            </Grid>
          </TitleContainer>

          {isMarkdown ? (
            <Box
              sx={{
                fontSize: '17px',
                lineHeight: 1.7,
                color: 'text.primary',
                '& h1, & h2, & h3': { mt: 3, mb: 1.5, fontWeight: 600 },
                '& h1': { fontSize: '2rem' },
                '& h2': { fontSize: '1.5rem' },
                '& h3': { fontSize: '1.2rem' },
                '& p': { my: 1.5 },
                '& ul, & ol': { pl: 3, my: 1.5 },
                '& li': { mb: 0.5 },
                '& a': { color: 'primary.main', textDecoration: 'underline' },
                '& blockquote': {
                  borderLeft: '4px solid',
                  borderColor: 'primary.main',
                  pl: 2,
                  ml: 0,
                  fontStyle: 'italic',
                  color: 'text.secondary',
                },
                '& code': {
                  bgcolor: 'grey.100',
                  px: 0.5,
                  borderRadius: 0.5,
                  fontFamily: 'monospace',
                  fontSize: '0.95em',
                },
                '& pre': {
                  bgcolor: 'grey.900',
                  color: 'common.white',
                  p: 2,
                  borderRadius: 1,
                  overflow: 'auto',
                  '& code': { bgcolor: 'transparent', color: 'inherit', p: 0 },
                },
                '& hr': { my: 3, borderColor: 'divider' },
              }}
            >
              <ReactMarkdown
                components={{ img: markdownImageRenderer, a: markdownLinkRenderer }}
              >
                {newsItem.content_markdown}
              </ReactMarkdown>
            </Box>
          ) : (
            <CaptionContainer style={{ fontSize: '15px'}}>
              {newsItem.description}
            </CaptionContainer>
          )}

          {tags.length > 0 && (
            <Box mt={2} display="flex" flexWrap="wrap" gap={1}>
              {tags.map((tag) => (
                <Link key={tag} href={`/blog?tag=${encodeURIComponent(tag)}`} passHref>
                  <Chip
                    label={`#${tag}`}
                    clickable
                    color="primary"
                    variant="outlined"
                    size="small"
                    onClick={() => gaButton("tag_click", tag)}
                  />
                </Link>
              ))}
            </Box>
          )}
          {
            // If there are newsItem.links, render them as a button where name is the title, and url is the <Link> href attribute
            // Filter for links where name starts with #
            // 

          } 
          
          <ButtonContainersSmall style={{ justifyContent: 'center', justifyItems: 'center', textAlign: 'center' }}>
          {            
            newsItem.links && newsItem.links.filter((link) => !link.url.startsWith('#')).map((link) => (            
              <NewsLinkButton key={link.name} onClick={ ()=> gaButton("button_news", link.name+":"+link.url) } variant="contained" href={link.url} target="_blank">
                {link.name}
              </NewsLinkButton>
            
          ))}
          </ButtonContainersSmall>

          <ButtonContainersSmall style={{ marginTop: '10px', justifyContent: 'center', justifyItems: 'center', textAlign: 'center' }}>
          {            
            newsItem.links && newsItem.links.filter((link) => link.url.startsWith('#')).map((link) => (            
                <SlackButton 
                  key={link.name} 
                  onClick={ ()=> gaButton("button_slack", link.name+":"+link.url) } 
                  variant="outlined" 
                  size="small" 
                  href={`https://opportunity-hack.slack.com/app_redirect?channel=${link.name}`} 
                  target="_blank">
                #{link.name}
              </SlackButton>
            
          ))}
          </ButtonContainersSmall>    
        </BlankContainer>         
      
      

    

      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </EventCards>
  );

}
export default SingleNews;
