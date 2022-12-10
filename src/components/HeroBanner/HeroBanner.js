import React, { useEffect, useState } from "react";
import {
  MainContainer,
  ButtonStyled,
  GridStyled,
  TextStyled,
  TitleStyled,
  TitleContainer,
  CaptionContainer,
  ButtonContainers,
  SpanText,
  BlankContainer,
  BackgroundGrid,
} from "./styles";
import Typewriter from "typewriter-effect";
import { Player } from "@lottiefiles/react-lottie-player";

function HeroBanner() {
  const JOIN_SLACK_LINK =
    "https://join.slack.com/t/opportunity-hack/shared_invite/zt-1db1ehglc-2tR6zpmszc5898MhiSxHig";
  const openCodeSample = () => {
    gaButton("open_code_sample");
    window.open(JOIN_SLACK_LINK, "_blank", "noopener noreferrer");
  };

  const gaButton = (actionName) => {
    ga.event({
      action: "button",
      params: {
        action_name: actionName,
      },
    });
  };

  const [width, setWidth] = useState();
  const functionName = () => {
    setInterval(() => {
      setWidth(screen.width);
    }, 500);
  };

  window.addEventListener("resize", functionName);

  useEffect(() => {
    setWidth(screen.width);
  }, []);

  return (
    <GridStyled
      container
      direction="row"
      justifyContent="center"
      alignItem="center"
    >
      <BackgroundGrid />
      {/* Left Container */}
      <BlankContainer xs={12} md={7} lg={7}>
        <TitleContainer container>
          <TitleStyled variant="h1">
            The place where
            <SpanText>
              <Typewriter
                options={{
                  strings: ["Nonprofits", "Hackers", "Mentors", "Volunteers"],
                  autoStart: true,
                  loop: true,
                }}
              />
            </SpanText>
            unite
          </TitleStyled>
        </TitleContainer>

        <CaptionContainer right={"true"} container>
          <TextStyled>
            Interested in joining? Clicks these to find out more!
          </TextStyled>
          <ButtonContainers container>
            <ButtonStyled>Find a problem to work on </ButtonStyled>
            <ButtonStyled>Join us on slack to get involved</ButtonStyled>
          </ButtonContainers>
        </CaptionContainer>
      </BlankContainer>
      {/* Right Container */}
      <BlankContainer
        xs={12}
        md={5}
        lg={5}
      >
        {width >= 900 && (
          <Player
            src="https://assets1.lottiefiles.com/packages/lf20_vnikrcia.json"
            className="player"
            loop
            autoplay
            speed={1}
            style={{
              width: width >= 1200 ? "100%" : "100%",
              height: "50rem",
              padding: "0 0",
			  right: "0",
			  position: "absolute",
            }}
          />
        )}
      </BlankContainer>
    </GridStyled>
  );
}

export default HeroBanner;
