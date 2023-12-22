import React, { useEffect, useState } from 'react';
import {
  ButtonStyled,
  ButtonBasicStyle,
  ButtonGoldStyle,
  GridStyled,
  TextStyled,
  TitleStyled,
  TitleContainer,
  CaptionContainer,
  ButtonContainers,
  SpanText,
  BlankContainer,
  BackgroundGrid,
} from './styles';
import Typewriter from 'typewriter-effect';
import Logo from './Logo'
import { useEnv } from '../../context/env.context';
import ReactPixel from 'react-facebook-pixel';

import * as ga from '../../lib/ga';

function HeroBanner() {
  const { slackSignupUrl } = useEnv();

  const options = {
    autoConfig: true, // set pixel's autoConfig. More info: https://developers.facebook.com/docs/facebook-pixel/advanced/
    debug: false, // enable logs
  };
  const advancedMatching = null; // { em: 'someemail@.com' }; // optional
  ReactPixel.init(process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID, advancedMatching, options);
  

  const openCodeSample = () => {    
    gaButton('slack_button', 'open_join_slack');
    window.open(slackSignupUrl, '_blank', 'noopener noreferrer');
  };

  const gaButton = (action, actionName) => {
    ReactPixel.track(action, { action_name: actionName });

    ga.event({
      action: action,
      params: {
        action_name: actionName,
      },
    });
  };

  
  return (
    <GridStyled
      container
      direction='row'
      justifyContent='center'
      alignItem='center'
    >
      <BackgroundGrid />
      {/* Left Container */}
      <BlankContainer xs={12} md={7} lg={7}>
        <TitleContainer container>
          <TitleStyled>
            The place where
            <SpanText>
              <Typewriter
                options={{
                  strings: ['Nonprofits', 'Hackers', 'Mentors', 'Volunteers'],
                  autoStart: true,
                  loop: true,
                  delay: 1,
                  pauseFor: 300,
                }}
              />
            </SpanText>
            unite
          </TitleStyled>
        </TitleContainer>

        <CaptionContainer right={'true'} container>
          <TextStyled>
            Want to code for social good?
            <br/>
            Join us!
          </TextStyled>
          
          <ButtonContainers container>
          {/* Disable for new nonprofit form instead
            <ButtonStyled
              onClick={gaButton('button_build_ohack', 'find_a_problem')}
              href='/nonprofit/tRK5YPrc8vpHQabMYIDO'
            >
              Help us build ohack.dev
            </ButtonStyled>
            */
          }
            <ButtonStyled
              onClick={gaButton('October Hackathon', 'button_october_hack')}
              href='/hack/2023_fall'
            >
              ⭐️ October Hackathon
            </ButtonStyled>
            <ButtonGoldStyle onClick={openCodeSample}>
              Join us on Slack to get involved
            </ButtonGoldStyle>
            <ButtonBasicStyle
              onClick={gaButton('button_see_all', 'see_all_nonprofit_projects')}
              href='/nonprofits'
            >
              See all nonprofit projects
            </ButtonBasicStyle>
          </ButtonContainers>
        </CaptionContainer>
      </BlankContainer>
      {/* Right Container */}
      <BlankContainer xs={12} md={5} lg={5} flex justifyContent="center" alignItems="center">
  
  
  <Logo />
         
  
  
      </BlankContainer>
    </GridStyled>
  );
}

export default HeroBanner;
