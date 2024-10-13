import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import Head from "next/head";
import {
  Typography,
  Button,
  Grid,
  Box,
  useMediaQuery,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import Image from "next/image";
import Link from "next/link";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { initFacebookPixel, trackEvent } from "../../lib/ga";
import { useEnv } from "../../context/env.context";

const StyledBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
  maxWidth: "1200px",
  margin: "0 auto",
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2),
  },
}));

const StyledHeading = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  marginBottom: theme.spacing(2),
}));

const StyledSubheading = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  marginBottom: theme.spacing(2),
}));

const StyledButton = styled(Button)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  padding: theme.spacing(1, 3),
}));

const StyledSection = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(6),
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
}));

export default function Signup() {
  const router = useRouter();
  const previousPage = router.query.previousPage;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { slackSignupUrl } = useEnv();

  useEffect(() => {
    initFacebookPixel();
  }, []);

  const handleSignupClick = () => {
    trackEvent({ action: "CompleteRegistration" });

    if (isMobile) {
      window.open(slackSignupUrl, "_blank");
    } else {
      router.push(slackSignupUrl);
    }
  };

  return (
    <>
      <Head>
        <title>
          Join Opportunity Hack: Connect, Collaborate, and Code for Good
        </title>
        <meta
          name="description"
          content="Sign up for Opportunity Hack's community. Connect with developers, collaborate on nonprofit projects, and make a positive impact through technology."
        />
        <meta
          name="keywords"
          content="Opportunity Hack, community signup, tech volunteering, nonprofit coding, developer community, Slack"
        />
        <meta
          property="og:title"
          content="Join Opportunity Hack: Connect, Collaborate, and Code for Good"
        />
        <meta
          property="og:description"
          content="Sign up for Opportunity Hack's community. Connect with developers, collaborate on nonprofit projects, and make a positive impact through technology."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://ohack.dev/signup" />
        <meta
          property="og:image"
          content="https://cdn.ohack.dev/ohack.dev/2023_hackathon_3.webp"
        />
        <link rel="canonical" href="https://ohack.dev/signup" />
      </Head>
      <StyledBox>
        <Grid container mt={10} spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <StyledHeading variant="h2">Join Opportunity Hack</StyledHeading>
            <StyledSubheading variant="h2">
              Connect, Collaborate, and Code for Good
            </StyledSubheading>
            <Typography variant="body1" paragraph>
              Join our vibrant community to collaborate with fellow developers,
              get support for your nonprofit projects, and stay updated on
              Opportunity Hack events.
            </Typography>
            <StyledButton
              variant="contained"
              color="primary"
              size="large"
              onClick={handleSignupClick}
            >
              Sign Up Now
            </StyledButton>
            {previousPage && (
              <Typography variant="body1">
                <Link href={previousPage}>Return to the previous page</Link>
              </Typography>
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                borderRadius: theme.shape.borderRadius,
                overflow: "hidden",
              }}
            >
              <Image
                src="/join_slack_1.png"
                width={797}
                height={607}
                alt="Opportunity Hack Community Signup Process"
                layout="responsive"
                priority
              />
            </Box>
          </Grid>
        </Grid>

        <StyledSection>
          <StyledSubheading variant="h3">
            Why Join Our Community?
          </StyledSubheading>
          <List>
            {[
              "Connect with like-minded developers passionate about social impact",
              "Get real-time support for your nonprofit coding projects",
              "Stay informed about hackathons, workshops, and other events",
              "Collaborate on innovative solutions for nonprofits",
              "Share your expertise and learn from others in the community",
            ].map((item, index) => (
              <ListItem key={index} disableGutters>
                <ListItemIcon>
                  <CheckCircleOutlineIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary={item} />
              </ListItem>
            ))}
          </List>
        </StyledSection>

        <StyledSection>
          <StyledSubheading variant="h3">
            How to Join Our Community
          </StyledSubheading>
          <List>
            {[
              'Click the "Sign Up Now" button above',
              "Sign in with Google, Apple, or enter your email address",
              "Complete your profile with your name and optional photo",
              "Join our Slack workspace to connect with the community",
            ].map((item, index) => (
              <ListItem key={index} disableGutters>
                <ListItemIcon>
                  <CheckCircleOutlineIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary={item} />
              </ListItem>
            ))}
          </List>
        </StyledSection>
      </StyledBox>
    </>
  );
}
