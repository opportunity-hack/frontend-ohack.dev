
import React, { useEffect } from 'react';
import {useRedirectFunctions} from "@propelauth/react"
import { useAuthInfo } from '@propelauth/react'
import { Alert, AlertTitle, Stack, Typography } from '@mui/material';


// Import ga
import { initFacebookPixel, trackEvent } from '../../lib/ga';

import {
    ButtonStyled,
    ButtonStyledWithLink
} from "./styles";
import { track } from 'react-facebook-pixel';

export default function LoginOrRegister({ introText, previousPage }) {
    const { isLoggedIn, user } = useAuthInfo();
    const { redirectToLoginPage } = useRedirectFunctions();

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

        redirectToLoginPage({
            postLoginRedirectUrl: window.location.href
        })
        
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
                <AlertTitle>
                    {introText}
                </AlertTitle>
                <Stack alignItems="center" spacing={2}>
                    <Stack direction="column" spacing={1}>
                        <ButtonStyled onClick={handleLoginClick}>Log In</ButtonStyled>
                        <Typography>
                            We use Slack to collaborate, if you already have an account, login with Slack
                        </Typography>
                    </Stack>
                    <Stack direction="column" spacing={1}>
                        <ButtonStyled onClick={handleSignupClick}>
                            <ButtonStyledWithLink href={`/signup?previousPage=${previousPage}`}>
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