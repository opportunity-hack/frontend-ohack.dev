import React from "react";
import { useEffect } from "react";
import Head from "next/head";
import {
  Typography,
  Container,
  Paper,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Link as MuiLink,
} from "@mui/material";
import { styled } from "@mui/system";
import PeopleIcon from "@mui/icons-material/People";
import GroupIcon from "@mui/icons-material/Group";
import BusinessIcon from "@mui/icons-material/Business";
import CodeIcon from "@mui/icons-material/Code";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import BuildIcon from "@mui/icons-material/Build";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkIcon from "@mui/icons-material/Link";
import Link from "next/link";
import { trackEvent, initFacebookPixel, pageview } from "../../../lib/ga";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
}));

const VideoWrapper = styled("div")({
  position: "relative",
  paddingBottom: "56.25%", // 16:9 aspect ratio
  height: 0,
  overflow: "hidden",
  "& iframe": {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
});

export default function VidyodayaSuccessStory() {
  useEffect(() => {
    initFacebookPixel();
    pageview();
  }, []);

  return (
    <>
      <Head>
        <title>
          Vidyodaya: Modernizing Education Outreach | Opportunity Hack Success
          Story
        </title>
        <meta
          name="description"
          content="Discover how Opportunity Hack volunteers developed a modern, user-friendly website for Vidyodaya, enhancing their mission to improve education for Adivasi children."
        />
        <meta
          name="keywords"
          content="Opportunity Hack, Vidyodaya, website modernization, nonprofit technology, hackathon success story"
        />
        <meta
          property="og:title"
          content="Vidyodaya: Modernizing Education Outreach | Opportunity Hack"
        />
        <meta
          property="og:description"
          content="See how tech volunteers created a modern, user-friendly website for Vidyodaya, revolutionizing their online presence and community engagement."
        />
        <meta property="og:type" content="article" />
        <meta
          property="og:url"
          content="https://ohack.dev/success-stories/vidyodaya-website-modernization"
        />
        <meta
          property="og:image"
          content="https://cdn.ohack.dev/nonprofit_images/vidyodaya.webp"
        />
      </Head>

      <Container maxWidth="lg">
        <Typography mt={10} variant="h2" align="center" gutterBottom>
          Vidyodaya: Modernizing Education Outreach for Adivasi Communities
        </Typography>

        <StyledPaper>
          <Typography variant="h3" gutterBottom>
            Final Demo (Fall 2020)
          </Typography>
          <VideoWrapper>
            <iframe
              width="560"
              height="315"
              src="https://www.youtube.com/embed/03IeMq9qye4?si=aEdjB9nwQ-2GggBj"
              title="Vidyodaya: Modernizing Education Outreach Demo"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </VideoWrapper>
        </StyledPaper>

        <StyledPaper>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h2" gutterBottom>
                Project Overview
              </Typography>
              <Typography paragraph>
                <PeopleIcon /> <strong>Nonprofit:</strong> Vidyodaya
              </Typography>
              <Typography paragraph>
                <GroupIcon /> <strong>Tech Volunteers:</strong> Christian
                Bautista, Emily Adams, Marlon Del Rosario, Harry Henry Gebel
                (2020)
              </Typography>
              <Typography paragraph>
                <BusinessIcon /> <strong>Sponsor:</strong> PayPal and Galvanize
              </Typography>
              <Typography paragraph>
                <CodeIcon /> <strong>Technologies Used:</strong> HTML, CSS,
                JavaScript, React, Java, Spring, PostgreSQL, OAuth 2.0,
                Cloudinary
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h2" gutterBottom>
                The Challenge
              </Typography>
              <Typography paragraph>
                Vidyodaya, a nonprofit focused on improving education for
                Adivasi children in India, faced challenges with their online
                presence:
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleOutlineIcon />
                  </ListItemIcon>
                  <ListItemText primary="Outdated website with poor navigation" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleOutlineIcon />
                  </ListItemIcon>
                  <ListItemText primary="Difficulty in updating and managing content" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleOutlineIcon />
                  </ListItemIcon>
                  <ListItemText primary="Lack of engagement with their target audience" />
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
            The Opportunity Hack team developed a modern, user-friendly website
            for Vidyodaya:
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <BuildIcon />
              </ListItemIcon>
              <ListItemText primary="Redesigned interface with improved navigation and tribal elements" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <BuildIcon />
              </ListItemIcon>
              <ListItemText primary="Secure admin login system for easy content management" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <BuildIcon />
              </ListItemIcon>
              <ListItemText primary="Responsive design for better accessibility across devices" />
            </ListItem>
          </List>
          <Typography variant="h3" gutterBottom>
            Project Resources
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <GitHubIcon />
              </ListItemIcon>
              <ListItemText
                primary={
                  <MuiLink
                    href="https://github.com/2020-opportunity-hack/Team-02"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    GitHub Repository
                  </MuiLink>
                }
                secondary="Explore the project's code and development history"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <LinkIcon />
              </ListItemIcon>
              <ListItemText
                primary={
                  <MuiLink
                    href="https://www.ohack.org/about/history/2020-fall-global-hackathon/2020-fall-non-profits#h.e11jkzh61o8i"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    2020 Fall Global Hackathon Presentation
                  </MuiLink>
                }
                secondary="View the project presentation and details"
              />
            </ListItem>
          </List>
          <Typography variant="h3" gutterBottom>
            Impact Highlight
          </Typography>
          <Typography paragraph>
            The new website significantly improved Vidyodaya's online presence,
            making it easier for visitors to find information and engage with
            the organization. The admin functionality allows for easier content
            management, potentially increasing engagement with their audience
            and better showcasing their mission to improve education for Adivasi
            children.
          </Typography>
        </StyledPaper>

        <Grid
          container
          spacing={4}
          justifyContent="center"
          marginTop={4}
          marginBottom={4}
        >
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
