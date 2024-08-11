import React from 'react';
import Head from 'next/head';
import { Typography, Container, Paper, Grid, List, ListItem, ListItemIcon, ListItemText, Button, Link as MuiLink } from '@mui/material';
import { styled } from '@mui/system';
import RestaurantIcon from '@mui/icons-material/Restaurant';
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

export default function MatthewsCrossingSuccessStory() {
  return (
    <>
      <Head>
        <title>Matthews Crossing: Automated Data Management | Opportunity Hack Success Story</title>
        <meta name="description" content="Discover how Opportunity Hack volunteers developed an automated data management system to streamline operations for Matthews Crossing Food Bank." />
        <meta name="keywords" content="Opportunity Hack, food bank, data management, nonprofit technology, hackathon success story" />
        <meta property="og:title" content="Matthews Crossing: Revolutionizing Food Bank Operations | Opportunity Hack" />
        <meta property="og:description" content="See how tech volunteers created an automated data management system for Matthews Crossing, streamlining food bank operations and improving efficiency." />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://ohack.dev/success-stories/matthews-crossing-data-automation" />
        <meta property="og:image" content="https://ohack.dev/images/matthews-crossing-banner.jpg" />
      </Head>

      <Container maxWidth="lg">
        <Typography mt={10} variant="h1" align="center" gutterBottom>
          Matthews Crossing: Revolutionizing Food Bank Operations
        </Typography>

        <StyledPaper>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h2" gutterBottom>
                Project Overview
              </Typography>
              <Typography paragraph>
                <RestaurantIcon /> <strong>Nonprofit:</strong> Matthews Crossing Food Bank
              </Typography>
              <Typography paragraph>
                <GroupIcon /> <strong>Tech Volunteers:</strong> James Rowley and Mark Omo (2016, 2018)
              </Typography>
              <Typography paragraph>
                <BusinessIcon /> <strong>Sponsors:</strong> PayPal, TechShop Chandler, Avnet, GoDaddy, Repay, MDI Group, Splunk, Galvanize, InfusionSoft
              </Typography>
              <Typography paragraph>
                <CodeIcon /> <strong>Technologies Used:</strong> PHP, Python, JavaScript, HTML/CSS, CSV data processing, Excel report generation, Data visualization tools, Two-factor authentication
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h2" gutterBottom>
                The Challenge
              </Typography>
              <Typography paragraph>
                Matthews Crossing Food Bank faced several operational challenges:
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon><CheckCircleOutlineIcon /></ListItemIcon>
                  <ListItemText primary="Time-consuming manual data entry and reporting processes" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircleOutlineIcon /></ListItemIcon>
                  <ListItemText primary="Difficulty in generating timely and accurate reports for decision-making" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircleOutlineIcon /></ListItemIcon>
                  <ListItemText primary="Need for a more efficient system to manage large volumes of donation data" />
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
            Over two Opportunity Hack events, the volunteer team developed a comprehensive data management system:
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><BuildIcon /></ListItemIcon>
              <ListItemText primary="Automated data import and classification from Food Bank Manager" />
            </ListItem>
            <ListItem>
              <ListItemIcon><BuildIcon /></ListItemIcon>
              <ListItemText primary="Streamlined report generation and data visualization" />
            </ListItem>
            <ListItem>
              <ListItemIcon><BuildIcon /></ListItemIcon>
              <ListItemText primary="Secure user authentication with two-factor authentication" />
            </ListItem>
            <ListItem>
              <ListItemIcon><BuildIcon /></ListItemIcon>
              <ListItemText primary="Integration with PayPal for lower-fee donation processing" />
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
                  <MuiLink href="https://github.com/opportunity-hack/Food-Bank-Data-Manager" target="_blank" rel="noopener noreferrer">
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
                  <MuiLink href="https://devpost.com/software/matthews-crossing-data-manager" target="_blank" rel="noopener noreferrer">
                    DevPost Project (2016)
                  </MuiLink>
                }
                secondary="View the initial project submission and details"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><LinkIcon /></ListItemIcon>
              <ListItemText 
                primary={
                  <MuiLink href="https://devpost.com/software/matthews-crossing-data-manager-oj4ica" target="_blank" rel="noopener noreferrer">
                    DevPost Project (2018)
                  </MuiLink>
                }
                secondary="See the project's evolution and improvements"
              />
            </ListItem>
          </List>
          <Typography variant="h3" gutterBottom>
            Impact Highlights
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><EmojiObjectsIcon /></ListItemIcon>
              <ListItemText primary="Saved an estimated 5 hours per month for key staff on manual data entry and reporting" />
            </ListItem>
            <ListItem>
              <ListItemIcon><EmojiObjectsIcon /></ListItemIcon>
              <ListItemText primary="Potential to save over $150,000 in volunteer time across 1,600 food banks using similar systems" />
            </ListItem>
            <ListItem>
              <ListItemIcon><EmojiObjectsIcon /></ListItemIcon>
              <ListItemText primary="Improved data accuracy and enabled more timely decision-making" />
            </ListItem>
          </List>
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