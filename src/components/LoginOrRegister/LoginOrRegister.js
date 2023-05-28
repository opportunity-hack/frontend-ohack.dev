
import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Alert, AlertTitle, Stack, Typography } from '@mui/material';

// Import ga
import * as ga from '../../lib/ga';

import {
    ButtonStyled,
    ButtonStyledWithLink
} from "./styles";

export default function LoginOrRegister({introText, previousPage}) {
    const { loginWithRedirect } = useAuth0();

    const handleLoginClick = () => {
        ga.event({
            action: "login_slack",
            params: {
                current_page: window.location.pathname
            }
        });

        loginWithRedirect({
            appState: {
                returnTo: window.location.pathname,
                redirectUri: window.location.pathname,
            },
        });
    };

    const handleSignupClick = () => {
        ga.event({
            action: "signup_slack",
            params: {
                current_page: window.location.pathname
            }
        });
    };


    return(
    <Stack alignItems="center" paddingTop={5}>
        <Alert variant="outlined" severity="warning">
            <AlertTitle>{introText}</AlertTitle>

            <Stack alignItems="center" spacing={2}>
                <Stack direction="column" spacing={1}>
                    <ButtonStyled onClick={handleLoginClick}>Log In</ButtonStyled>

                    <Typography>
                        We use Slack to collaborate, if you already have an account, login with Slack
                    </Typography>
                </Stack>

                <Stack direction="column" spacing={1}>
                        <ButtonStyled onClick={handleSignupClick}><ButtonStyledWithLink href={`/signup?previousPage=${previousPage}`}>Create a Slack account</ButtonStyledWithLink></ButtonStyled>

                    <Typography>
                        If you don't have an account, you will need to create an account
                    </Typography>
                </Stack>
            </Stack>
        </Alert>
    </Stack>
    );
};