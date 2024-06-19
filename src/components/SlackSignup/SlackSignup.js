// Create page
import React, { useEffect } from "react";
import Link from "next/link";
import { Stack } from "@mui/material";
import { Typography } from "@mui/material";
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
    autoConfig: true, // set pixel's autoConfig. More info: https://developers.facebook.com/docs/facebook-pixel/advanced/
    debug: false, // enable logs
  };
  const advancedMatching = undefined; // { em: 'some@email.com' }; // optional, more info: https://developers.facebook.com/docs/facebook-pixel/advanced/advanced-matching

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
    // Ref: https://developers.facebook.com/docs/meta-pixel/reference#standard-events
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
      <InnerContainer container>
        <Head>
          <title>Slack Signup - Opportunity Hack Developer Portal</title>
        </Head>
        <SlackSignupContainer>
          <SlackSignupHeader container>
            <SlackSignupHeadline>
              <Typography variant="h1">Slack Signup</Typography>
            </SlackSignupHeadline>
          </SlackSignupHeader>
          <SlackSignupDetailText>
            <Typography variant="h5">
              Click the button to register for a Slack account and join the
              Opportunity Hack Slack workspace.
            </Typography>
          </SlackSignupDetailText>
          <br />
          <Stack direction="column" spacing={1}>
            <Link
              target="_blank"
              rel="noopener noreferrer"
              href={slackSignupUrl}
            >
              <ButtonStyled
                onClick={handleSignupClick}
                href={`${slackSignupUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                variant="contained"
                color="primary"
              >
                Signup for Opportunity Hack Slack
              </ButtonStyled>
            </Link>
          </Stack>

          <br />
          <br />
          <Typography variant="h2" style={{ backgroundColor: "lightblue" }}>
            Why Slack?
          </Typography>
          <Typography variant="h4">
            Slack is a great tool for communicating with your team and the rest
            of the Opportunity Hack community. We use Slack to share important
            information, answer questions, and provide support. We also use
            Slack to have meetings and share other important information.
          </Typography>
          <br />
          <Typography variant="h2" style={{ backgroundColor: "lightblue" }}>
            What do you need to do?
          </Typography>
          <Typography>
            <Typography variant="h4">
              <strong>Step 1:</strong> Click on the "Signup for Opportunity Hack
              Slack" button above to open the Slack signup page in a new tab.
            </Typography>
            <Typography variant="h4">
              <strong>Step 2:</strong> Sign in with Google, Apple, or enter your
              email address and click on the "Next" button.
            </Typography>
            <Typography variant="h4">
              <strong>Step 3:</strong> Fill in your details. You can use your
              real name or a nickname. You can also upload a profile picture if
              you want.
            </Typography>
          </Typography>
          {previousPage && (
            <Typography variant="h4">
              <strong>Step 4:</strong>{" "}
              <Link href={previousPage}>
                <SlackLink>
                  Head back to the page you were on and sign in.
                </SlackLink>
              </Link>
            </Typography>
          )}
          <br />
          <ImageBorder>
            <Image
              src="/join_slack_1.png"
              width={797}
              height={607}
              alt="Slack Signup 1"
              layout="responsive"
            />
          </ImageBorder>
        </SlackSignupContainer>
      </InnerContainer>
    </LayoutContainer>
  );
}
