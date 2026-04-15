import React, {useEffect} from "react";
import PropTypes from "prop-types";
import { useAuthInfo, useRedirectFunctions } from "@propelauth/react";
import {
  ButtonPrimary,
  ButtonSecondary,
  ButtonTertiary,
  ButtonContainers,
  ButtonRow,
  ButtonRowInline,
} from "./styles";
import SponsorMinimal from "../Sponsors/SponsorMinimal";
import { useEnv } from "../../context/env.context";
import { JourneyTypes } from "../JourneyTracker";
import * as ga from "../../lib/ga";


const HeroBanner = ({ children }) => {
  const { slackSignupUrl } = useEnv();
  const { isLoggedIn } = useAuthInfo();
  const { redirectToLoginPage } = useRedirectFunctions();

  useEffect(() => {
    ga.initFacebookPixel();

    ga.trackContentEngagement(
      'home_page',
      'hero_banner',
      ga.EventAction.VIEW,
      { has_feature_enabled: false }
    );
  }, []);

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

  const trackConversion = React.useCallback((actionType, actionDetail) => {
    ga.trackStructuredEvent(
      ga.EventCategory.CONVERSION,
      actionType,
      actionDetail
    );
  }, []);

  const openCodeSample = React.useCallback(() => {
    trackButtonClick("slack_signup_button", "Join our Slack");
    trackConversion("community_join", "slack_signup");

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
    <>
      <ButtonContainers>
        {children}

        {/* Primary CTA */}
        <ButtonPrimary
          onClick={() => {
            trackButtonClick(
              "view_events_button",
              "View Upcoming Events",
              { destination: "hack" }
            );
          }}
          href="/hack"
        >
          View Upcoming Events
        </ButtonPrimary>

        {/* Secondary row */}
        <ButtonRow>
          <ButtonSecondary
            onClick={() => {
              trackButtonClick(
                "nonprofit_apply_button",
                "Send us a project",
                { destination: "nonprofits/apply" }
              );

              ga.trackJourneyStep(
                JourneyTypes.NONPROFIT.name,
                JourneyTypes.NONPROFIT.steps.VIEW_APPLY,
                { source: "hero_banner" }
              );
            }}
            href="/nonprofits/apply"
          >
            Send us a project
          </ButtonSecondary>

          <ButtonSecondary
            onClick={openCodeSample}
          >
            Join our Slack
          </ButtonSecondary>
        </ButtonRow>

        {/* Login / Profile */}
        {!isLoggedIn && (
          <ButtonSecondary
            onClick={handleLoginClick}
          >
            Log In
          </ButtonSecondary>
        )}

        {isLoggedIn && (
          <ButtonSecondary
            onClick={() => {
              trackButtonClick("profile_button", "View your profile", {
                user_status: "logged_in",
                destination: "profile",
              });
            }}
            href="/profile"
          >
            View your profile
          </ButtonSecondary>
        )}

        {/* Tertiary row — stays inline on all screen sizes */}
        <ButtonRowInline>
          <ButtonTertiary
            onClick={() => {
              trackButtonClick(
                "all_projects_button",
                "All projects",
                {
                  destination: "projects",
                }
              );

              ga.trackJourneyStep(
                JourneyTypes.VOLUNTEER.name,
                JourneyTypes.VOLUNTEER.steps.VIEW_OPPORTUNITIES,
                { source: "hero_banner" }
              );
            }}
            href="/projects"
          >
            All projects
          </ButtonTertiary>

          <ButtonTertiary
            onClick={() => {
              trackButtonClick("donate_button", "Donate");
              trackConversion("donation_click", "paypal");

              ga.trackJourneyStep(
                JourneyTypes.DONATION.name,
                JourneyTypes.DONATION.steps.VIEW_DONATE,
                { source: "hero_banner", button: "paypal" }
              );
            }}
            target="_blank"
            rel="noopener noreferrer"
            href="https://givebutter.com/a5MSes"
          >
            Donate
          </ButtonTertiary>

          <ButtonTertiary
            onClick={() => {
              trackButtonClick(
                "hackathon_request_button",
                "Request a hackathon"
              );

              ga.trackJourneyStep(
                JourneyTypes.HACKATHON.name,
                JourneyTypes.HACKATHON.steps.VIEW_INFO,
                { source: "hero_banner" }
              );
            }}
            href="/hack/request"
          >
            Request a hackathon
          </ButtonTertiary>
        </ButtonRowInline>
      </ButtonContainers>

      <SponsorMinimal />
    </>
  );
};

HeroBanner.propTypes = {
  children: PropTypes.node,
};

export default React.memo(HeroBanner);
