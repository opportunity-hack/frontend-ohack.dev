import React, {useEffect} from "react";
import { useAuthInfo, useRedirectFunctions } from "@propelauth/react";
import { useFeatureIsOn } from "@growthbook/growthbook-react";
import {
  BlankContainer,
  ButtonBasicStyle,
  ButtonContainers,
  ButtonGoldStyle,
  CaptionContainer,
  GridStyled,
  TextStyled,
} from "./styles";
import SponsorMinimal from "../Sponsors/SponsorMinimal";
import { LoginButton } from "../Navbar/styles";
import { useEnv } from "../../context/env.context";
import { trackEvent, initFacebookPixel } from "../../lib/ga";
// Lazy load non-critical components


const HeroBanner = ({ children }) => {
  const { slackSignupUrl } = useEnv();
  const { isLoggedIn } = useAuthInfo();
  const { redirectToLoginPage } = useRedirectFunctions();
  const enabled = useFeatureIsOn("afeature");

  useEffect(() => {
    initFacebookPixel();
  }, []);

  const openCodeSample = React.useCallback(() => {
    gaButton("slack_button", "open_join_slack");
    window.open(slackSignupUrl, "_blank", "noopener noreferrer");
  }, [slackSignupUrl]);

  const gaButton = React.useCallback(async (action, actionName) => {
    trackEvent(action, actionName);
  }, []);

  return (
    <GridStyled container direction="row" justifyContent="center" spacing={2}>
      <BlankContainer xs={12} md={7} lg={7}>
        {children}
        <CaptionContainer right={true} container>
          {enabled && (
            <TextStyled>
              Want to code for social good?
              <br />
              Join us!
            </TextStyled>
          )}

          <ButtonContainers container>
            <ButtonBasicStyle
              onClick={() =>
                gaButton(
                  "button_submit_project",
                  "Submit new nonprofit project"
                )
              }
              href="/nonprofits/apply"
              style={{ color: "white", backgroundColor: "#0070BA" }}
            >
              Send us a project
            </ButtonBasicStyle>

            <ButtonGoldStyle onClick={openCodeSample}>
              Create an OHack Slack account
            </ButtonGoldStyle>

            {!isLoggedIn && (
              <LoginButton
                variant="contained"
                disableElevation
                onClick={() => redirectToLoginPage()}
                className="login-button"
              >
                Log In
              </LoginButton>
            )}

            {isLoggedIn && (
              <ButtonBasicStyle
                style={{ color: "white", backgroundColor: "#FFC107" }}
                onClick={() =>
                  gaButton("button_profile", "clicked to see profile")
                }
                href="/profile"
              >
                View your profile
              </ButtonBasicStyle>
            )}

            <ButtonBasicStyle
              onClick={() => gaButton("button_donate", "donate")}
              style={{ color: "white", backgroundColor: "blue" }}
              target="_blank"
              rel="noopener noreferrer"
              href="https://www.paypal.com/donate/?campaign_id=WWL4VPVBUS4SA"
            >
              Donate with PayPal
            </ButtonBasicStyle>

            <ButtonBasicStyle
              onClick={() => gaButton("button_about", "about us")}
              href="/about"
            >
              Read more about us
            </ButtonBasicStyle>

            <ButtonBasicStyle
              onClick={() =>
                gaButton("button_see_all", "see_all_nonprofit_projects")
              }
              href="/nonprofits"
            >
              All projects you can work on
            </ButtonBasicStyle>
          </ButtonContainers>

          <SponsorMinimal />
        </CaptionContainer>
      </BlankContainer>
    </GridStyled>
  );
};

export default React.memo(HeroBanner);
