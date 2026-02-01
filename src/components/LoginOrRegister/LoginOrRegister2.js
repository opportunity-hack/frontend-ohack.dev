import React, { useEffect } from "react";
import { useRedirectFunctions } from "@propelauth/react";
import { useAuthInfo } from "@propelauth/react";
import {
  Alert,
  AlertTitle,
  Stack,
  Typography,
  Box,
  Divider,
} from "@mui/material";
import { useEnv } from "../../context/env.context";

// Import ga
import { initFacebookPixel, trackEvent } from "../../lib/ga";

import { ButtonStyled, ButtonStyledWithLink } from "./styles";

export default function LoginOrRegister({ introText, previousPage }) {
  const { isLoggedIn, user } = useAuthInfo();
  const { redirectToLoginPage } = useRedirectFunctions();
  const { slackSignupUrl } = useEnv();

  const options = {
    autoConfig: true, // set pixel's autoConfig. More info: https://developers.facebook.com/docs/facebook-pixel/advanced/
    debug: false, // enable logs
  };
  const advancedMatching = null; // { em: 'some@email.com' }; // optional, more info: https://developers.facebook.com/docs/facebook-pixel/advanced/advanced-matching

  useEffect(() => {
    initFacebookPixel();
  }, []);

  const handleSlackLoginClick = () => {
    trackEvent("login_slack", { current_page: window.location.pathname });

    // Direct navigation to PropelAuth Slack login with teams parameter
    const authUrl = process.env.NEXT_PUBLIC_REACT_APP_AUTH_URL;
    const slackTeamId = process.env.NEXT_PUBLIC_SLACK_TEAM_ID || "T1Q7936BH"; // Opportunity Hack workspace ID
    window.location.href = `${authUrl}/slack/login?external_param_team=${slackTeamId}`;
  };

  const handleGoogleLoginClick = () => {
    trackEvent("login_google", { current_page: window.location.pathname });

    // Direct navigation to PropelAuth Google login
    const authUrl = process.env.NEXT_PUBLIC_REACT_APP_AUTH_URL;
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
      <Stack alignItems="center" paddingTop={5} maxWidth={600} margin="0 auto">
        <Alert variant="outlined" severity="info" sx={{ width: "100%" }}>
          <AlertTitle sx={{ fontSize: "1.2rem", fontWeight: 600 }}>
            {introText}
          </AlertTitle>

          <Box sx={{ mt: 2, mb: 3 }}>
            <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
              <strong>Why Slack?</strong> Opportunity Hack uses Slack as our
              community hub where volunteers, nonprofits, and mentors
              collaborate year-round. By joining, you'll get access to:
            </Typography>
            <Typography component="ul" sx={{ pl: 2, mb: 0 }}>
              <li>Direct communication with team members and nonprofits</li>
              <li>Project updates and hackathon announcements</li>
              <li>Networking with 1000+ volunteers and tech professionals</li>
              <li>Mentorship opportunities and career advice</li>
            </Typography>
          </Box>

          <Stack spacing={3}>
            {/* Existing Users Section */}
            <Box>
              <Typography
                variant="h6"
                sx={{ mb: 1, fontWeight: 600, color: "primary.main" }}
              >
                Already have an account?
              </Typography>
              <Stack direction="column" spacing={2} alignItems="center">
                <Stack
                  direction="column"
                  spacing={1}
                  alignItems="center"
                  width="100%"
                >
                  <ButtonStyled
                    onClick={handleGoogleLoginClick}
                    sx={{ minWidth: 280 }}
                  >
                    Continue with Google
                  </ButtonStyled>
                  <Typography variant="body2" color="text.secondary">
                    Sign in with your Google account
                  </Typography>
                </Stack>

                <Divider sx={{ width: "100%" }}>OR</Divider>

                <Stack
                  direction="column"
                  spacing={1}
                  alignItems="center"
                  width="100%"
                >
                  <ButtonStyled
                    onClick={handleSlackLoginClick}
                    sx={{ minWidth: 280 }}
                  >
                    Continue with Slack
                  </ButtonStyled>
                  <Typography variant="body2" color="text.secondary">
                    Sign in to opportunity-hack.slack.com
                  </Typography>
                </Stack>
              </Stack>
            </Box>

            <Divider sx={{ my: 2 }}>NEW USER?</Divider>

            {/* New Users Section */}
            <Box>
              <Typography
                variant="h6"
                sx={{ mb: 1, fontWeight: 600, color: "secondary.main" }}
              >
                New to Opportunity Hack?
              </Typography>
              <Stack direction="column" spacing={1} alignItems="center">
                <ButtonStyled
                  onClick={handleSignupClick}
                  sx={{ minWidth: 280 }}
                >
                  <ButtonStyledWithLink
                    href={`${slackSignupUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Join Our Slack Community
                  </ButtonStyledWithLink>
                </ButtonStyled>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  textAlign="center"
                >
                  Create your free account to get started.
                  <br />
                  After joining Slack, come back here to sign in.
                </Typography>
              </Stack>
            </Box>
          </Stack>

          <Box sx={{ mt: 3, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
            >
              <strong>Need help?</strong> Slack is free and takes less than 2
              minutes to set up. No credit card required.
            </Typography>
          </Box>
        </Alert>
      </Stack>
    );
  }
}
