
import React, { useEffect } from 'react';
import {useRedirectFunctions} from "@propelauth/react"
import { useAuthInfo } from '@propelauth/react'

import { Alert, AlertTitle, Stack, Typography } from '@mui/material';
import ReactPixel from 'react-facebook-pixel';

// Import ga
import * as ga from '../../lib/ga';

import {
    ButtonStyled,
    ButtonStyledWithLink
} from "./styles";

export default function LoginOrRegister({ introText, previousPage }) {
    const { isLoggedIn, user } = useAuthInfo();
    const { redirectToLoginPage } = useRedirectFunctions();

    const options = {
        autoConfig: true, // set pixel's autoConfig. More info: https://developers.facebook.com/docs/facebook-pixel/advanced/
        debug: false, // enable logs
    };
    const advancedMatching = null; // { em: 'some@email.com' }; // optional, more info: https://developers.facebook.com/docs/facebook-pixel/advanced/advanced-matching
    
    useEffect(() => {
       if (typeof window !== 'undefined') {
      ReactPixel.init(process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID, advancedMatching, options);
    }
    }, []);

    const handleLoginClick = () => {
        ReactPixel.track('Login Slack');
        ga.event({
            action: "login_slack",
            params: {
                current_page: window.location.pathname
            }
        });

        redirectToLoginPage({
            postLoginRedirectUrl: window.location.href
        })
        
    };

    const handleSignupClick = () => {
        ReactPixel.track('Signup Slack');
        ga.event({
            action: "signup_slack",
            params: {
                current_page: window.location.pathname
            }
        });
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