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
import * as ga from "../../lib/ga";
// Lazy load non-critical components


const HeroBanner = ({ children }) => {
  const { slackSignupUrl } = useEnv();
  const { isLoggedIn } = useAuthInfo();
  const { redirectToLoginPage } = useRedirectFunctions();
  const enabled = useFeatureIsOn("afeature");

  useEffect(() => {
    // Initialize tracking
    ga.initFacebookPixel();
    
    // Track hero banner view as content engagement
    ga.trackContentEngagement(
      'home_page',
      'hero_banner',
      ga.EventAction.VIEW,
      { has_feature_enabled: enabled }
    );
  }, [enabled]);

  /**
   * Enhanced tracking for button clicks using the new structured approach
   */
  const trackButtonClick = React.useCallback((buttonId, buttonText, additionalParams = {}) => {
    ga.trackStructuredEvent(
      ga.EventCategory.NAVIGATION,
      ga.EventAction.CLICK,
      buttonId,
      null,
      {
        button_text: buttonText,
        ...additionalParams
      }
    );
  }, []);
  
  /**
   * Track conversion events for high-value actions
   */
  const trackConversion = React.useCallback((actionType, actionDetail) => {
    ga.trackStructuredEvent(
      ga.EventCategory.CONVERSION, 
      actionType,
      actionDetail
    );
  }, []);
  
  const openCodeSample = React.useCallback(() => {
    // Track both as navigation and conversion event (joining Slack is a key metric)
    trackButtonClick("slack_signup_button", "Create an OHack Slack account");
    trackConversion("community_join", "slack_signup");
    
    // Also track as part of user journey
    ga.trackJourneyStep(
      'volunteer',
      'join_slack',
      { source: 'hero_banner' }
    );
    
    window.open(slackSignupUrl, "_blank", "noopener noreferrer");
  }, [slackSignupUrl, trackButtonClick, trackConversion]);
  
  const handleLoginClick = React.useCallback(() => {
    trackButtonClick("login_button", "Log In", { user_status: "anonymous" });
    redirectToLoginPage();
  }, [redirectToLoginPage, trackButtonClick]);

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
              onClick={() => {
                trackButtonClick(
                  "nonprofit_apply_button", 
                  "Send us a project",
                  { destination: "nonprofits/apply" }
                );
                
                // Track as part of nonprofit journey
                ga.trackJourneyStep(
                  ga.JourneyTypes.NONPROFIT.name,
                  ga.JourneyTypes.NONPROFIT.steps.VIEW_APPLY,
                  { source: 'hero_banner' }
                );
              }}
              href="/nonprofits/apply"
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
                onClick={handleLoginClick}
                className="login-button"
              >
                Log In
              </LoginButton>
            )}

            {isLoggedIn && (
              <ButtonBasicStyle
                style={{ color: "white", backgroundColor: "#FFC107" }}
                onClick={() => {
                  trackButtonClick("profile_button", "View your profile", { 
                    user_status: "logged_in",
                    destination: "profile" 
                  });
                }}
                href="/profile"
              >
                View your profile
              </ButtonBasicStyle>
            )}

            <ButtonBasicStyle
              onClick={() => {
                trackButtonClick("donate_button", "Donate with PayPal");
                trackConversion("donation_click", "paypal");
                
                // Track as part of donation journey
                ga.trackJourneyStep(
                  ga.JourneyTypes.DONATION.name,
                  ga.JourneyTypes.DONATION.steps.VIEW_DONATE,
                  { source: 'hero_banner', button: 'paypal' }
                );
              }}
              style={{ color: "white", backgroundColor: "blue" }}
              target="_blank"
              rel="noopener noreferrer"
              href="https://www.paypal.com/donate/?campaign_id=WWL4VPVBUS4SA"
            >
              Donate with PayPal
            </ButtonBasicStyle>

            <ButtonBasicStyle
              onClick={() => {
                trackButtonClick("hackathon_request_button", "Request a hackathon");
                
                // Track as part of hackathon journey
                ga.trackJourneyStep(
                  ga.JourneyTypes.HACKATHON.name,
                  ga.JourneyTypes.HACKATHON.steps.VIEW_INFO,
                  { source: 'hero_banner' }
                );
              }}
              href="/hack/request"
            >
              Request a hackathon
            </ButtonBasicStyle>

            <ButtonBasicStyle
              onClick={() => {
                trackButtonClick("all_projects_button", "All projects you can work on", {
                  destination: "nonprofits"
                });
                
                // Track as part of volunteer journey
                ga.trackJourneyStep(
                  ga.JourneyTypes.VOLUNTEER.name,
                  ga.JourneyTypes.VOLUNTEER.steps.VIEW_OPPORTUNITIES,
                  { source: 'hero_banner' }
                );
              }}
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
