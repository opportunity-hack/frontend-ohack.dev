import React from 'react';
import { useEffect  } from 'react';
import Head from 'next/head';
import { Typography, Container, Paper, Grid, List, ListItem, ListItemIcon, ListItemText, Button, Link as MuiLink } from '@mui/material';
import { styled } from '@mui/system';
import PeopleIcon from '@mui/icons-material/People';
import GroupIcon from '@mui/icons-material/Group';
import BusinessIcon from '@mui/icons-material/Business';
import CodeIcon from '@mui/icons-material/Code';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import BuildIcon from '@mui/icons-material/Build';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkIcon from '@mui/icons-material/Link';
import Link from 'next/link';
import { trackEvent, initFacebookPixel, pageview } from '../../../lib/ga';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
}));


export default function ZurisCircleSuccessStory() {
    useEffect(() => {
        initFacebookPixel();
        pageview();        
    }, []);


  return (
    <>
      <Head>
        <title>Zuri's Circle: Revolutionizing Event Management | Opportunity Hack Success Story</title>
        <meta name="description" content="Discover how Opportunity Hack volunteers developed an innovative event management and feedback analysis system for Zuri's Circle, enhancing community engagement." />
        <meta name="keywords" content="Opportunity Hack, Zuri's Circle, event management, nonprofit technology, hackathon success story" />
        <meta property="og:title" content="Zuri's Circle: Transforming Event Management | Opportunity Hack" />
        <meta property="og:description" content="See how tech volunteers created an automated event registration and feedback analysis system for Zuri's Circle, revolutionizing their community engagement." />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://ohack.dev/success-stories/zuris-circle-event-management" />
        <meta property="og:image" content="https://cdn.ohack.dev/nonprofit_images/Zuris_Circle_2019.webp" />
      </Head>

      <Container maxWidth="lg">
        <Typography mt={10} variant="h2" align="center" gutterBottom>
          Zuri's Circle: Transforming Event Management and Community Engagement
        </Typography>

        <StyledPaper>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h2" gutterBottom>
                Project Overview
              </Typography>
              <Typography paragraph>
                <PeopleIcon /> <strong>Nonprofit:</strong> Zuri's Circle
              </Typography>
              <Typography paragraph>
                <GroupIcon /> <strong>Tech Volunteers:</strong> Trevor Moore, Jordan Riley, and Carter Rice (2019)
              </Typography>
              <Typography paragraph>
                <BusinessIcon /> <strong>Sponsor:</strong> PayPal, GoDaddy, Repay, MDI Group, Splunk, Galvanize, InfusionSoft
              </Typography>
              <Typography paragraph>
                <CodeIcon /> <strong>Technologies Used:</strong> ASP.NET Core 3.0, ML.NET, MongoDB, React, Redux, Material UI, Chart.js, Azure, Heroku
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h2" gutterBottom>
                The Challenge
              </Typography>
              <Typography paragraph>
                Zuri's Circle, a Peoria-based nonprofit helping families, the elderly, and the homeless, faced challenges in their event management:
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon><CheckCircleOutlineIcon /></ListItemIcon>
                  <ListItemText primary="Inefficient manual email collection at events" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircleOutlineIcon /></ListItemIcon>
                  <ListItemText primary="Difficulty in timely follow-ups with participants" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircleOutlineIcon /></ListItemIcon>
                  <ListItemText primary="Lack of systematic feedback analysis for event improvement" />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </StyledPaper>

        <StyledPaper>
          <Typography variant="h2" gutterBottom>
            The Solution
          </Typography>
          <Typography paragraph>
            The Opportunity Hack team developed "Zuri's Dashboard," a comprehensive event management system:
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><BuildIcon /></ListItemIcon>
              <ListItemText primary="Digital sign-in system for accurate participant data collection" />
            </ListItem>
            <ListItem>
              <ListItemIcon><BuildIcon /></ListItemIcon>
              <ListItemText primary="Automated email communication for event follow-ups" />
            </ListItem>
            <ListItem>
              <ListItemIcon><BuildIcon /></ListItemIcon>
              <ListItemText primary="Machine learning-powered sentiment analysis for feedback evaluation" />
            </ListItem>
          </List>
          <Typography variant="h3" gutterBottom>
            Project Resources
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><GitHubIcon /></ListItemIcon>
              <ListItemText 
                primary={
                  <MuiLink href="https://github.com/opportunity-hack/event-registration" target="_blank" rel="noopener noreferrer">
                    GitHub Repository
                  </MuiLink>
                }
                secondary="Explore the project's code and development history"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><LinkIcon /></ListItemIcon>
              <ListItemText 
                primary={
                  <MuiLink href="https://devpost.com/software/zuri-s-dashboard" target="_blank" rel="noopener noreferrer">
                    DevPost Project (2019)
                  </MuiLink>
                }
                secondary="View the project submission and details"
              />
            </ListItem>
          </List>
          <Typography variant="h3" gutterBottom>
            Impact Highlight
          </Typography>
          <Typography paragraph>
            Zuri's Dashboard significantly improved Zuri's Circle's ability to engage with their community, streamline event management, and gain valuable insights from participant feedback. This technology allows the organization to focus more on their mission of providing relief to families, the elderly, and the homeless.
          </Typography>
        </StyledPaper>

        <Grid container spacing={4} justifyContent="center" marginTop={4} marginBottom={4}>
          <Grid item>
            <Link href="/nonprofits/apply" passHref>
              <Button variant="contained" color="primary" size="large">
                Nonprofits: Submit Your Challenge
              </Button>
            </Link>
          </Grid>
          <Grid item>
            <Link href="/hack" passHref>
              <Button variant="contained" color="secondary" size="large">
                Tech Volunteers: Apply Your Skills
              </Button>
            </Link>
          </Grid>
          <Grid item>
            <Link href="/sponsor" passHref>
              <Button variant="contained" color="info" size="large">
                Sponsors: Empower Innovation
              </Button>
            </Link>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
