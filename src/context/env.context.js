import React from "react";

const apiServerUrl = process.env.NEXT_PUBLIC_API_SERVER_URL;
const apiNodeJsServerUrl = process.env.NEXT_PUBLIC_API_NODEJS_SERVER_URL;
const slackSignupUrl = process.env.NEXT_PUBLIC_SLACK_SIGNUP_LINK;
const recaptchaSiteKey = process.env.NEXT_PUBLIC_GOOGLE_CAPTCHA_SITE_KEY;

const isEnvValid = apiServerUrl && apiNodeJsServerUrl && slackSignupUrl;

// reCAPTCHA is optional but recommended
if (!isEnvValid) {
  throw new Error("Missing required environment variables.");
}

const dotenv = {  
  apiServerUrl: apiServerUrl,
  apiNodeJsServerUrl: apiNodeJsServerUrl,
  slackSignupUrl: slackSignupUrl,
  recaptchaSiteKey: recaptchaSiteKey
};

export const EnvContext = React.createContext(dotenv);

export const useEnv = () => {
  const context = React.useContext(EnvContext);
  if (!context) {
    throw new Error(`useEnv must be used within a EnvProvider`);
  }
  return context;
};

export const EnvProvider = (props) => {
  return <EnvContext.Provider value={dotenv} {...props} />;
};
