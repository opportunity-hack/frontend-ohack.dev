import React, { Suspense, useEffect, useState } from "react";
import { Grid, Skeleton } from "@mui/material";
import { useAuthInfo, useRedirectFunctions } from "@propelauth/react";
import * as ga from "../../lib/ga";
import { LoginButton } from "../Navbar/styles";
import { useFeatureIsOn } from "@growthbook/growthbook-react";
import SponsorMinimal from "../Sponsors/SponsorMinimal";
import {
  BlankContainer,
  ButtonBasicStyle,
  ButtonContainers,
  ButtonGoldStyle,
  CaptionContainer,
  GridStyled,
  TextStyled,
  TitleContainer,
} from "./styles";
import { useEnv } from "../../context/env.context";
import ReactPixel from "react-facebook-pixel";
import dynamic from "next/dynamic";
import "react-responsive-carousel/lib/styles/carousel.min.css";

const LeadForm = dynamic(() => import("../LeadForm/LeadForm"), {
  ssr: false,
});
const BackgroundGrid = React.lazy(() => import("./BackgroundGridComponent"));
const TitleStyled = dynamic(() => import("./TitleStyledComponent"), {
  ssr: true,
});

function HeroBanner() {
  const { slackSignupUrl } = useEnv();
  const { isLoggedIn } = useAuthInfo();
  const { redirectToLoginPage } = useRedirectFunctions();
  const enabled = useFeatureIsOn("afeature");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay (remove this in production)
    const timer = setTimeout(() => setLoading(false), 1550);
    return () => clearTimeout(timer);
  }, []);

  const openCodeSample = () => {
    gaButton("slack_button", "open_join_slack");
    window.open(slackSignupUrl, "_blank", "noopener noreferrer");
  };

  const gaButton = async (action, actionName) => {
    ReactPixel.track(action, { action_name: actionName });
    ga.event({
      action: "conversion",
      params: {
        send_to: "AW-11474351176/JCk6COG-q4kZEMjost8q",
      },
    });
    ga.event({
      action: action,
      params: {
        action_name: actionName,
      },
    });
  };

  const renderSkeleton = () => (
    <BlankContainer xs={12} md={7} lg={7}>
      <TitleContainer container>
        <Grid direction="row">
          <Skeleton
            variant="rectangular"
            width="80%"
            height={60}
            style={{ marginBottom: "20px" }}
          />
          <Skeleton
            variant="rectangular"
            width="100%"
            height={100}
            style={{ marginBottom: "20px" }}
          />
        </Grid>
      </TitleContainer>
      <CaptionContainer right="true" container>
        <Skeleton variant="text" width="70%" style={{ marginBottom: "10px" }} />
        <Skeleton variant="text" width="60%" style={{ marginBottom: "20px" }} />
        <ButtonContainers container>
          {[1, 2, 3, 4].map((_, index) => (
            <Skeleton
              key={index}
              variant="rectangular"
              width={150}
              height={40}
              style={{ margin: "0 10px 10px 0" }}
            />
          ))}
        </ButtonContainers>
        <Skeleton
          variant="rectangular"
          width="100%"
          height={50}
          style={{ marginTop: "20px" }}
        />
      </CaptionContainer>
    </BlankContainer>
  );

  return (
    <GridStyled container direction="row" justifyContent="center" spacing={2}>
      <Suspense fallback={<div>Loading...</div>}>
        <BackgroundGrid />
      </Suspense>
      {loading ? (
        renderSkeleton()
      ) : (
        <BlankContainer xs={12} md={7} lg={7}>
          <TitleContainer container>
            <Grid key="mainTitleAndLeadForm" direction="row">
              <TitleStyled />
              <LeadForm />
            </Grid>
          </TitleContainer>
          <CaptionContainer right="true" container>
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
      )}
    </GridStyled>
  );
}

export default HeroBanner;
