
import React, { useEffect } from 'react';
import {useRedirectFunctions} from "@propelauth/react"
import { useAuthInfo } from '@propelauth/react'
import { Alert, AlertTitle, Stack, Typography } from '@mui/material';
import { SocialLoginProvider } from "@propelauth/frontend-apis";
import { useAuthFrontendApis } from "@propelauth/frontend-apis-react";
import { useEnv } from "../../context/env.context";


// Import ga
import { initFacebookPixel, trackEvent } from '../../lib/ga';

import {
    ButtonStyled,
    ButtonStyledWithLink
} from "./styles";

export default function LoginOrRegister({ introText, previousPage }) {
    const { isLoggedIn, user } = useAuthInfo();
    const { redirectToLoginPage } = useRedirectFunctions();
    const { loginWithSocialProvider } = useAuthFrontendApis();
    const { slackSignupUrl } = useEnv();

    const options = {
        autoConfig: true, // set pixel's autoConfig. More info: https://developers.facebook.com/docs/facebook-pixel/advanced/
        debug: false, // enable logs
    };
    const advancedMatching = null; // { em: 'some@email.com' }; // optional, more info: https://developers.facebook.com/docs/facebook-pixel/advanced/advanced-matching
    
    useEffect(() => {
        initFacebookPixel();
    }, []);

    const handleLoginClick = () => {
        trackEvent('login_slack', { current_page: window.location.pathname });        

        loginWithSocialProvider(SocialLoginProvider.SLACK);        
    };

    const handleSignupClick = () => {
        trackEvent('signup_slack', { current_page: window.location.pathname });
    };

    if(user) {
        return(
        <Stack alignItems="center" paddingTop={5}>        
        <ButtonStyled href={`/profile`}>
            Go to your profile
        </ButtonStyled>
        </Stack>
        );
    } else {    
    return (
      <Stack alignItems="center" paddingTop={5}>
        <Alert variant="outlined" severity="info">
          <AlertTitle>{introText}</AlertTitle>
          <Stack alignItems="center" spacing={2}>
            <Stack direction="column" spacing={1}>
              <ButtonStyled onClick={handleLoginClick}>
                Log In to opportunity-hack.slack.com
              </ButtonStyled>
              <Typography>
                We use Slack to collaborate, login if you already have an account
              </Typography>
            </Stack>
            <Stack direction="column" spacing={1}>
              <ButtonStyled onClick={handleSignupClick}>
                <ButtonStyledWithLink href={`${slackSignupUrl}`} target="_blank" rel="noopener noreferrer">
                  Create a Slack account
                </ButtonStyledWithLink>
              </ButtonStyled>
              <Typography>
                If you don't have an account, you will need to create an account
              </Typography>
            </Stack>
          </Stack>
        </Alert>
      </Stack>
    );
    }
};