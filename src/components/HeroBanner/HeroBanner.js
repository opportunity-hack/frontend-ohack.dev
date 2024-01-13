import {
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
import { LoginButton } from "../Navbar/styles";
import { Typography } from "@mui/material";

import { useEnv } from '../../context/env.context';
import ReactPixel from 'react-facebook-pixel';
import { Grid } from "@mui/material";

import * as ga from '../../lib/ga';
import { useAuth0 } from '@auth0/auth0-react';

function HeroBanner() {
  const { slackSignupUrl } = useEnv();
  const { isAuthenticated, loginWithRedirect } = useAuth0();
  

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
    <Grid
      container
      direction='row'
      justifyContent='center'
      alignItem='center'
      style={{
        padding: "8rem 6rem 6rem 6rem",
  height: "100%",
  width: "80%",
  margin: "auto"    
      }}
    >
      <BackgroundGrid />

      
      {/* Left Container */}
      <Grid xs={12} md={7} lg={7}>
        <Grid container style={{
          padding: "1rem 5% 0px 0px",
          marginTop: "3rem",
        }}>
          
          <Grid style={{
            padding: "1rem 5% 0px 0px",
            marginTop: "3rem",      
          }}>
            <span style={{              
              fontSize: '1.8em'                
            }}>
            The place where
            </span>
            <div>
            <span style={{
              color: 'var(--blue)',
              fontSize: '1.6em'              
            }}>Nonprofits, Hackers, Mentors, Volunteers   
            </span>
            </div>
            <span style={{              
              fontSize: '1.8em'                
            }}>
            unite
            </span>
          </Grid>                  

        </Grid>

        <CaptionContainer right={'true'} container>
          <Typography style={{
            fontSize: "2.0rem",  
            marginTop: "0.8rem",
            marginBottom: "0.8rem",
            width: "100%",
          }}>
            Want to code for social good?
            <br/>
            Join us!
          </Typography>
          
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
                <svg
                  fill="none"
                  viewBox="0 0 10 10"
                  stroke="currentColor"
                  height="1em"
                  width="1em"
                >
                  <path className="arrow" d="M3,2 L6,5 L3,8" />
                  <path className="line" d="M3,5 L8,5" />
                </svg>
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
      </Grid>
      {/* Right Container */}
      <Grid xs={12} md={5} lg={5} flex justifyContent="center" alignItems="center">
          
      </Grid>
    </Grid>
  );
}

export default HeroBanner;
