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
import { useRedirectFunctions } from "@propelauth/react"
import { useAuthInfo } from '@propelauth/react'



import { useEnv } from '../../context/env.context';
import ReactPixel from 'react-facebook-pixel';

// Assuming you're using Next.js for SSR
import dynamic from 'next/dynamic';


const LeadForm = dynamic(() => import('../LeadForm/LeadForm'), {
  ssr: false,
});


const BackgroundGrid = React.lazy(() => import('./BackgroundGridComponent'));
// Lazy load the TitleStyled and SpanText components
const TitleStyled = dynamic(() => import('./TitleStyledComponent'), { ssr: true });


function HeroBanner() {
  const { slackSignupUrl } = useEnv();  
  const { isLoggedIn } = useAuthInfo();
  const { redirectToLoginPage } = useRedirectFunctions();

  const options = {
    autoConfig: true, // set pixel's autoConfig. More info: https://developers.facebook.com/docs/facebook-pixel/advanced/
    debug: false, // enable logs
  };
  const advancedMatching = undefined; // { em: 'someemail@.com' }; // optional
  
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
    >
      <Suspense fallback={<div>Loading...</div>}>
        <BackgroundGrid />
      </Suspense>

      {/* Left Container */}
      <BlankContainer xs={12} md={7} lg={7}>
        
        <TitleContainer container>
        
        <Grid key="mainTitleAndLeadForm" direction='row'>        
          <TitleStyled/>                                        
          <LeadForm />        
        </Grid>

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
            
            <ButtonBasicStyle 
              onClick={() => gaButton('button_donate', 'donate via PayPal')}
              href='https://www.paypal.com/fundraiser/charity/4119839'
              target="_blank"
              style={{ color: 'white', backgroundColor: '#0070BA' }}
            >
              0. Donate via PayPal
            </ButtonBasicStyle>

            <ButtonGoldStyle onClick={openCodeSample}>
              1. Create an OHack Slack account
            </ButtonGoldStyle>

            {!isLoggedIn && <LoginButton
                variant="contained"
                disableElevation
                  onClick={() => redirectToLoginPage()}
                className="login-button"
              >
                2. Log In                                                  
              </LoginButton> 
            }

            {isLoggedIn && <ButtonBasicStyle
              style={{ color: 'white', backgroundColor: '#FFC107' }}
              onClick={() => gaButton('button_profile', 'clicked to see profile')}
              href='/profile'              
            >
              2. View your profile
            </ButtonBasicStyle>
            }
            
            <ButtonBasicStyle
              onClick={() => gaButton('button_about', 'about us')}
              href='/about'
            >
              3. Read more about us
            </ButtonBasicStyle>

            <ButtonBasicStyle
              onClick={() => gaButton('button_see_all', 'see_all_nonprofit_projects')}
              href='/nonprofits'
            >
              4. See all nonprofit projects
            </ButtonBasicStyle>

          </ButtonContainers>
        </CaptionContainer>
      </BlankContainer>
      {/* Right Container */}
      <BlankContainer xs={12} md={5} lg={5}  justifyContent="center" alignItems="center">
          
      </BlankContainer>
    </GridStyled>
  );
}

export default HeroBanner;