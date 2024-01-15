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

import React, { Suspense, useEffect } from 'react';



import { useEnv } from '../../context/env.context';
import ReactPixel from 'react-facebook-pixel';

// Assuming you're using Next.js for SSR
import dynamic from 'next/dynamic';
import * as ga from '../../lib/ga';
import { useAuth0 } from '@auth0/auth0-react';


const BackgroundGrid = React.lazy(() => import('./BackgroundGridComponent'));



function HeroBanner() {
  const { slackSignupUrl } = useEnv();
  const { isAuthenticated, loginWithRedirect } = useAuth0();

  const options = {
    autoConfig: true, // set pixel's autoConfig. More info: https://developers.facebook.com/docs/facebook-pixel/advanced/
    debug: false, // enable logs
  };
  const advancedMatching = null; // { em: 'someemail@.com' }; // optional
  
  const initializeReactPixel = async () => {
    await ReactPixel.init(process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID, advancedMatching, options);
  };
  
  useEffect(() => {
    initializeReactPixel();
  }, []);
  

  const openCodeSample = () => {    
    gaButton('slack_button', 'open_join_slack');
    window.open(slackSignupUrl, '_blank', 'noopener noreferrer');
  };


  const gaButton = async (action, actionName) => {
    await ReactPixel.track(action, { action_name: actionName });

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
    >
      <Suspense fallback={<div>Loading...</div>}>
        <BackgroundGrid />
      </Suspense>

      {/* Left Container */}
      <BlankContainer xs={12} md={7} lg={7}>               
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
            
            <ButtonGoldStyle onClick={openCodeSample}>
              1. Create an OHack Slack account
            </ButtonGoldStyle>

            {!isAuthenticated && <LoginButton
                variant="contained"
                disableElevation
                  onClick={() => loginWithRedirect({
                    appState: {
                      returnTo: window.location.pathname,
                      redirectUri: window.location.pathname,
                    },
                  })}
                className="login-button"
              >
                2. Log In                                                  
              </LoginButton> 
            }

            {isAuthenticated && <ButtonBasicStyle
              onClick={gaButton('button_profile', 'clicked to see profile')}
              href='/profile'
            >
              2. View your profile
            </ButtonBasicStyle>
            }
            
            <ButtonBasicStyle
              onClick={gaButton('button_see_all', 'see_all_nonprofit_projects')}
              href='/nonprofits'
            >
              3. See all nonprofit projects
            </ButtonBasicStyle>
          </ButtonContainers>
        </CaptionContainer>
      </BlankContainer>
      {/* Right Container */}
      <BlankContainer xs={12} md={5} lg={5} flex justifyContent="center" alignItems="center">
          
      </BlankContainer>
    </GridStyled>
  );
}

export default HeroBanner;