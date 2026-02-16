import React, { useEffect } from "react";
import { useRedirectFunctions } from "@propelauth/react";
import { useAuthInfo } from "@propelauth/react";
import { Alert, AlertTitle, Stack, Typography } from "@mui/material";

// Import ga
import { initFacebookPixel, trackEvent } from "../../lib/ga";

import { ButtonStyled, ButtonStyledWithLink } from "./styles";

export default function LoginOrRegister({ introText, previousPage }) {
  const { isLoggedIn, user } = useAuthInfo();
  const { redirectToLoginPage } = useRedirectFunctions();

  useEffect(() => {
    initFacebookPixel();
  }, []);

  const handleSlackLoginClick = () => {
    trackEvent("login_slack", { current_page: window.location.pathname });

    redirectToLoginPage({
      postLoginRedirectUrl: window.location.href,
    });
  };

  const handleGoogleLoginClick = () => {
    trackEvent("login_google", { current_page: window.location.pathname });

    // Direct navigation to PropelAuth Google login
    const authUrl = process.env.NEXT_PUBLIC_REACT_APP_AUTH_URL;

    if (!authUrl) {
      console.error("NEXT_PUBLIC_REACT_APP_AUTH_URL is not configured");
      return;
    }

    window.location.href = `${authUrl}/google/login`;
  };

  const handleSignupClick = () => {
    trackEvent("signup_slack", { current_page: window.location.pathname });
  };

  if (user) {
    return (
      <Stack alignItems="center" paddingTop={5}>
        <ButtonStyled href={`/profile`}>Go to your profile</ButtonStyled>
      </Stack>
    );
  } else {
    return (
      <Stack alignItems="center" paddingTop={5}>
        <Alert variant="outlined" severity="info">
          <AlertTitle>{introText}</AlertTitle>
          <Stack alignItems="center" spacing={2}>
            <Stack direction="column" spacing={1}>
              <ButtonStyled onClick={handleGoogleLoginClick}>
                Log In with Google
              </ButtonStyled>
              <Typography>Sign in with your Google account</Typography>
            </Stack>
            <Stack direction="column" spacing={1}>
              <ButtonStyled onClick={handleSlackLoginClick}>
                Log In with Slack
              </ButtonStyled>
              <Typography>
                We use Slack to collaborate, if you already have an account,
                login with Slack
              </Typography>
            </Stack>
            <Stack direction="column" spacing={1}>
              <ButtonStyled onClick={handleSignupClick}>
                <ButtonStyledWithLink
                  href={`/signup?previousPage=${previousPage}`}
                >
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
}
