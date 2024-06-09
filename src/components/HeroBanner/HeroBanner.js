
import {
  ButtonBasicStyle,
  ButtonGoldStyle,
  GridStyled,
  TextStyled,
  TitleContainer,
  CaptionContainer,
  ButtonContainers,
  BlankContainer,
} from './styles';
import { LoginButton } from "../Navbar/styles";
import { Grid } from '@mui/material';
import React, { Suspense, useEffect } from 'react';
import * as ga from '../../lib/ga';
import { useRedirectFunctions } from "@propelauth/react";
import { useAuthInfo } from '@propelauth/react';
import { useEnv } from '../../context/env.context';
import ReactPixel from 'react-facebook-pixel';
import dynamic from 'next/dynamic';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';

const LeadForm = dynamic(() => import('../LeadForm/LeadForm'), {
  ssr: false,
});
const BackgroundGrid = React.lazy(() => import('./BackgroundGridComponent'));
const TitleStyled = dynamic(() => import('./TitleStyledComponent'), { ssr: true });
function HeroBanner() {
  const { slackSignupUrl } = useEnv();
  const { isLoggedIn } = useAuthInfo();
  const { redirectToLoginPage } = useRedirectFunctions();
  const options = {
    autoConfig: true,
    debug: false,
  };
  const advancedMatching = undefined;
  useEffect(() => {
    if (typeof window !== 'undefined') {
      ReactPixel.init(process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID, advancedMatching, options);
    }
  }, []);
  const openCodeSample = () => {
    gaButton('slack_button', 'open_join_slack');
    window.open(slackSignupUrl, '_blank', 'noopener noreferrer');
  };
  const gaButton = async (action, actionName) => {
    ReactPixel.track(action, { action_name: actionName });
    ga.event({
      action: "conversion",
      params: {
        send_to: "AW-11474351176/JCk6COG-q4kZEMjost8q"
      }
    });
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
      spacing={2} 
    >
      <Suspense fallback={<div>Loading...</div>}>
        <BackgroundGrid />
      </Suspense>
      {/* Left Container */}
      <BlankContainer xs={12} md={7} lg={7}>
        <TitleContainer container>
          <Grid key="mainTitleAndLeadForm" direction='row'>
            <TitleStyled />
            <LeadForm />
          </Grid>
        </TitleContainer>
        <CaptionContainer right={'true'} container>
          <TextStyled>
            Want to code for social good?
            <br />
            Join us!
          </TextStyled>
          
          {/* Carousel and Buttons */}
          <Grid container justifyContent="center" alignItems="center">
            <Grid item xs={12} md={12} lg={12}> {/* Adjust width as needed */}
              <Carousel showThumbs={true} autoPlay={false} infiniteLoop={true} showIndicators={false}>
                <div>
                  <ButtonBasicStyle
                    onClick={() => gaButton('button_donate', 'donate via PayPal')}
                    href='https://www.paypal.com/fundraiser/charity/4119839'
                    target="_blank"
                    style={{ color: 'white', backgroundColor: '#2767E9', width: '80%' }}
                  >
                    0. Donate via PayPal
                  </ButtonBasicStyle>
                </div>
                <div>
                  <ButtonGoldStyle onClick={openCodeSample} style={{ color: 'white', backgroundColor: '#7F1AE9', width: '80%' }}>
                    1. Create an OHack Slack account
                    
                  </ButtonGoldStyle>
                </div>
                <div>
                  {!isLoggedIn && <LoginButton
                    variant="contained"
                    disableElevation
                    onClick={() => redirectToLoginPage()}
                    style={{ color: 'white', backgroundColor: '#2767E9', width: '80%' }}
                    className="login-button"
                  >
                    2. Log In
                  </LoginButton>}
                </div>
                {/* <div>
                  {isLoggedIn && <ButtonBasicStyle
                    onClick={() => gaButton('button_profile', 'clicked to see profile')}
                    style={{ color: 'white', backgroundColor: '#0070BA', width: '80%' }}
                    href='/profile'
                  >
                    2. View your profile
                  </ButtonBasicStyle>}
                </div> */}
                <div>
                  <ButtonBasicStyle
                    onClick={() => gaButton('button_about', 'about us')}
                    href='/about'
                    style={{ color: 'white', backgroundColor: '#7F1AE9', width: '80%' }}
                  >
                    3. Read more about us
                  </ButtonBasicStyle>
                </div>
                <div>
                  <ButtonBasicStyle
                    onClick={() => gaButton('button_see_all', 'see_all_nonprofit_projects')}
                    href='/nonprofits'
                    style={{ color: 'white', backgroundColor: '#2767E9', width: '80%' }}
                  >
                    4. See all nonprofit projects
                  </ButtonBasicStyle>
                </div>
              </Carousel>
            </Grid>
          </Grid>
        </CaptionContainer>
      </BlankContainer>
      {/* Right Container */}
      <BlankContainer xs={12} md={5} lg={5} justifyContent="center" alignItems="center">
      </BlankContainer>
    </GridStyled>
  );
}
export default HeroBanner;
