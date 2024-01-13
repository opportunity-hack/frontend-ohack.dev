import React from "react";
import { Grid } from "@mui/material";
import { Typography } from "@mui/material";
import { Button } from "@mui/material";
import { useEnv } from '../../context/env.context';
import { useAuth0 } from '@auth0/auth0-react';
import { styled } from '@mui/material/styles';
import { LoginButton } from "../Navbar/styles";
import ReactPixel from 'react-facebook-pixel';
import * as ga from '../../lib/ga';


function ThePlaceWhere() {
  const { slackSignupUrl } = useEnv();
  const { isAuthenticated, loginWithRedirect } = useAuth0();

  const openCodeSample = () => {        
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

    return(
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
              fontSize: '3em'                
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
              fontSize: '3em'                
            }}>
            unite
            </span>
          </Grid>                  
        </Grid>

        <Grid right={'true'} container style={{color: "#425466",
            maxWidth: "390px"}}>
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
          
          <Grid container style={{display: "flex",
            flexDirection: "column",
            width: "auto",
            gap: "1rem",}}>
          {/* Disable for new nonprofit form instead
            <ButtonStyled
              onClick={gaButton('button_build_ohack', 'find_a_problem')}
              href='/nonprofit/tRK5YPrc8vpHQabMYIDO'
            >
              Help us build ohack.dev
            </ButtonStyled>
            */
          }
            
            <Button onClick={openCodeSample} style={{borderRadius: "2rem",
              paddingLeft: "1.5rem",
              paddingRight: "1.5rem",
              fontWeight: 600,
              fontSize: "15px",
              textTransform: "unset !important",
              backgroundColor: "#FFD700",
              color: "#000000",
              minWidth: "25rem",

              "&:hover": {
                backgroundColor: `var(--blue)`,
              },}}>
              1. Create an OHack Slack account
            </Button>

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

            {isAuthenticated && <Button
              onClick={gaButton('button_profile', 'clicked to see profile')}
              href='/profile'
              style={{ borderRadius: "2rem",
  paddingLeft: "1.5rem",
  paddingRight: "1.5rem",
  fontWeight: 600,
  fontSize: "15px",
  textTransform: "unset !important",
  backgroundColor: "#E0E0E0",
  color: "#000000",
  minWidth: "25rem",

  "&:hover": {
    backgroundColor: `var(--blue)`,
  },}}
            >
              2. View your profile
            </Button>
            }
            
            <Button 
              style={{ borderRadius: "2rem",
  paddingLeft: "1.5rem",
  paddingRight: "1.5rem",
  fontWeight: 600,
  fontSize: "15px",
  textTransform: "unset !important",
  backgroundColor: "#E0E0E0",
  color: "#000000",
  minWidth: "25rem",

  "&:hover": {
    backgroundColor: `var(--blue)`,
  },}}
              onClick={gaButton('button_see_all', 'see_all_nonprofit_projects')}
              href='/nonprofits'
            >
              3. See all nonprofit projects
            </Button>
          </Grid>
        </Grid>
      </Grid>
    );
}
export default ThePlaceWhere;