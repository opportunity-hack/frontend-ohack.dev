import React from 'react';
import Head from 'next/head';
import { Typography, Container, Paper, Grid, List, ListItem, ListItemIcon, ListItemText, Button, Link as MuiLink } from '@mui/material';
import { styled } from '@mui/system';
import PetsIcon from '@mui/icons-material/Pets';
import GroupIcon from '@mui/icons-material/Group';
import BusinessIcon from '@mui/icons-material/Business';
import CodeIcon from '@mui/icons-material/Code';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import BuildIcon from '@mui/icons-material/Build';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkIcon from '@mui/icons-material/Link';
import Link from 'next/link';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
}));

const VideoWrapper = styled('div')({
  position: 'relative',
  paddingBottom: '56.25%', // 16:9 aspect ratio
  height: 0,
  overflow: 'hidden',
  '& iframe': {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
});

export default function SavingOneLifeSuccessStory() {
  return (
    <>
      <Head>
        <title>Saving One Life: AI-Enhanced Adoption Process | Opportunity Hack Success Story</title>
        <meta name="description" content="Discover how Opportunity Hack volunteers developed an AI-powered solution to streamline the adoption process for Saving One Life Animal Rescue and Sanctuary." />
        <meta name="keywords" content="Opportunity Hack, animal rescue, AI adoption process, nonprofit technology, hackathon success story" />
        <meta property="og:title" content="Saving One Life: Innovating Animal Adoption with AI | Opportunity Hack" />
        <meta property="og:description" content="See how tech volunteers created an AI-enhanced adoption process for Saving One Life, streamlining animal rescue operations and exploring innovative solutions." />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://ohack.dev/success-stories/saving-one-life-adoption-innovation" />
        <meta property="og:image" content="https://ohack.dev/images/saving-one-life-banner.jpg" />
      </Head>

      <Container maxWidth="lg">
        <Typography mt={10} variant="h1" align="center" gutterBottom>
          Saving One Life: Innovating Animal Adoption with AI
        </Typography>

        <StyledPaper>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h2" gutterBottom>
                Project Overview
              </Typography>
              <Typography paragraph>
                <PetsIcon /> <strong>Nonprofit:</strong> Saving One Life Animal Rescue and Sanctuary
              </Typography>
              <Typography paragraph>
                <GroupIcon /> <strong>Tech Volunteers:</strong> Emilee Spence and Justin Canode (2019), Karishma Joseph and Animesh Mohan (2020)
              </Typography>
              <Typography paragraph>
                <BusinessIcon /> <strong>Sponsor:</strong> PayPal, Galvanize, Motion Recruitment, Tech Talent South, GoDaddy, Dick's Sporting Goods, Keap

              </Typography>
              <Typography paragraph>
                <CodeIcon /> <strong>Technologies Used:</strong> Python, Flask, MongoDB, Machine Learning algorithms, Social Media APIs, Data Analysis tools
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h2" gutterBottom>
                The Challenge
              </Typography>
              <Typography paragraph>
                Saving One Life, an Arizona-based animal rescue, faced challenges in their adoption process:
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon><CheckCircleOutlineIcon /></ListItemIcon>
                  <ListItemText primary="Time-consuming manual vetting of potential adopters" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircleOutlineIcon /></ListItemIcon>
                  <ListItemText primary="Difficulty in assessing adopter suitability efficiently" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircleOutlineIcon /></ListItemIcon>
                  <ListItemText primary="Need for a more streamlined, data-driven adoption process" />
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
            Over two Opportunity Hack events, teams of volunteers developed a multi-phase solution to streamline the adoption process:
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><BuildIcon /></ListItemIcon>
              <ListItemText primary="AI-powered compatibility scoring system to match pets with potential adopters" />
            </ListItem>
            <ListItem>
              <ListItemIcon><BuildIcon /></ListItemIcon>
              <ListItemText primary="Risk assessment tool using social media analysis to evaluate potential adopters" />
            </ListItem>
            <ListItem>
              <ListItemIcon><BuildIcon /></ListItemIcon>
              <ListItemText primary="Database system to efficiently manage adopter and animal information" />
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
                  <MuiLink href="https://github.com/opportunity-hack/risk-scoring" target="_blank" rel="noopener noreferrer">
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
                  <MuiLink href="https://devpost.com/software/sol-adoption-candidate-tracker" target="_blank" rel="noopener noreferrer">
                    DevPost Project (2019)
                  </MuiLink>
                }
                secondary="View the initial project submission and details"
              />
            </ListItem>
          </List>
          <Typography variant="h3" gutterBottom>
            Final Demo (Summer 2020)
          </Typography>
          <VideoWrapper>
            <iframe
              width="560"
              height="315"
              src="https://www.youtube.com/embed/i_KQ0Z-0kkc"
              title="Saving One Life Adoption Innovation Demo"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </VideoWrapper>
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