import React, { useEffect } from "react";
import Link from "next/link";
import { Stack, Typography } from "@mui/material";
import Head from "next/head";
import { useEnv } from "../../context/env.context";
import Image from "next/image";
import ReactPixel from "react-facebook-pixel";
import * as ga from "../../lib/ga";

import {
  InnerContainer,
  LayoutContainer,
  SlackSignupContainer,
  SlackSignupDetailText,
  SlackSignupHeader,
  SlackSignupHeadline,
  SlackLink,
  ImageBorder,
  ButtonStyled,
} from "./styles";

export default function SlackSignup({ previousPage }) {
  const { slackSignupUrl } = useEnv();

  const options = {
    autoConfig: true,
    debug: false,
  };
  const advancedMatching = undefined;

  useEffect(() => {
    if (typeof window !== "undefined") {
      ReactPixel.init(
        process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID,
        advancedMatching,
        options
      );
    }
  }, []);

  const handleSignupClick = () => {
    ReactPixel.track("CompleteRegistration");
    ga.event({
      action: "CompleteRegistration",
      params: {
        current_page: window.location.pathname,
      },
    });
  };

  return (
    <LayoutContainer container>
      <Head>
        <title>Join Opportunity Hack on Slack: Connect, Collaborate, and Code for Good</title>
        <meta name="description" content="Sign up for Opportunity Hack's Slack community. Connect with fellow developers, collaborate on nonprofit projects, and make a positive impact through technology." />
        <meta name="keywords" content="Opportunity Hack, Slack signup, tech volunteering, nonprofit coding, developer community" />
        <meta property="og:title" content="Join Opportunity Hack on Slack: Connect, Collaborate, and Code for Good" />
        <meta property="og:description" content="Sign up for Opportunity Hack's Slack community. Connect with fellow developers, collaborate on nonprofit projects, and make a positive impact through technology." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://ohack.dev/slack-signup" />
        <meta property="og:image" content="https://cdn.ohack.dev/ohack.dev/2023_hackathon_3.webp" />
        <link rel="canonical" href="https://ohack.dev/slack-signup" />
      </Head>
      <InnerContainer container>
        <SlackSignupContainer>
          <SlackSignupHeader container>
            <SlackSignupHeadline>
              <Typography variant="h1">Join Opportunity Hack on Slack</Typography>
            </SlackSignupHeadline>
          </SlackSignupHeader>
          <SlackSignupDetailText>
            <Typography variant="h2">
              Connect, Collaborate, and Code for Good
            </Typography>
          </SlackSignupDetailText>
          <Typography variant="body1" paragraph>
            Join our vibrant Slack community to collaborate with fellow developers, get support for your nonprofit projects, and stay updated on Opportunity Hack events.
          </Typography>
          <Stack direction="column" spacing={1}>
            <Link href={slackSignupUrl} passHref>
              <ButtonStyled
                onClick={handleSignupClick}
                target="_blank"
                rel="noopener noreferrer"
                variant="contained"
                color="primary"
              >
                Sign Up for Opportunity Hack Slack
              </ButtonStyled>
            </Link>
          </Stack>

          <Typography variant="h2" style={{ backgroundColor: "lightblue", marginTop: "2rem" }}>
            Why Join Our Slack Community?
          </Typography>
          <Typography variant="body1" component="ul">
            <li>Connect with like-minded developers passionate about social impact</li>
            <li>Get real-time support for your nonprofit coding projects</li>
            <li>Stay informed about hackathons, workshops, and other events</li>
            <li>Collaborate on innovative solutions for nonprofits</li>
            <li>Share your expertise and learn from others in the community</li>
          </Typography>

          <Typography variant="h2" style={{ backgroundColor: "lightblue", marginTop: "2rem" }}>
            How to Join Our Slack Workspace
          </Typography>
          <Typography component="ol">
            <li>
              <Typography variant="h4">
                Click the "Sign Up for Opportunity Hack Slack" button above
              </Typography>
            </li>
            <li>
              <Typography variant="h4">
                Sign in with Google, Apple, or enter your email address
              </Typography>
            </li>
            <li>
              <Typography variant="h4">
                Complete your profile with your name and optional photo
              </Typography>
            </li>
            {previousPage && (
              <li>
                <Typography variant="h4">
                  <Link href={previousPage}>
                    <SlackLink>
                      Return to the previous page and sign in
                    </SlackLink>
                  </Link>
                </Typography>
              </li>
            )}
          </Typography>

          <ImageBorder>
            <Image
              src="/join_slack_1.png"
              width={797}
              height={607}
              alt="Opportunity Hack Slack Signup Process"
              layout="responsive"
            />
          </ImageBorder>
        </SlackSignupContainer>
      </InnerContainer>
    </LayoutContainer>
  );
}