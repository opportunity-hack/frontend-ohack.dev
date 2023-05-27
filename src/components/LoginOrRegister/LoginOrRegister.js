
import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Alert, AlertTitle, Button, Stack, Typography } from '@mui/material';
import { styled as styling } from "@mui/material";
import Link from "next/link";

import {
    ButtonStyled,
    ButtonStyledWithLink
} from "./styles";

export default function LoginOrRegister({introText}) {
    const { loginWithRedirect } = useAuth0();

    return(
    <Stack alignItems="center" paddingTop={5}>
        <Alert variant="outlined" severity="warning">
            <AlertTitle>{introText}</AlertTitle>

            <Stack alignItems="center" spacing={2}>
                <Stack direction="column" spacing={1}>
                    <ButtonStyled
                        onClick={() =>
                            loginWithRedirect({
                                appState: {
                                    returnTo: window.location.pathname,
                                    redirectUri: window.location.pathname,
                                },
                            })
                        }
                    >
                        Log In
                    </ButtonStyled>

                    <Typography>
                        We use Slack to collaborate, if you already have an account, login with Slack
                    </Typography>
                </Stack>

                <Stack direction="column" spacing={1}>
                    <ButtonStyled><ButtonStyledWithLink href="/signup?previousPage=/nonprofits/apply">Create a Slack account</ButtonStyledWithLink></ButtonStyled>

                    <Typography>
                        If you don't have an account, you will need to create an account
                    </Typography>
                </Stack>
            </Stack>
        </Alert>
    </Stack>
    );
};