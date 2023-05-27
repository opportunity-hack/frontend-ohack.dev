import React from "react";

const domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN;
const clientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID;
const audience = process.env.NEXT_PUBLIC_AUTH0_AUDIENCE;
const apiServerUrl = process.env.NEXT_PUBLIC_API_SERVER_URL;
const apiNodeJsServerUrl = process.env.NEXT_PUBLIC_API_NODEJS_SERVER_URL;
const slackSignupUrl = process.env.NEXT_PUBLIC_SLACK_SIGNUP_LINK;

const isEnvValid = domain && clientId && audience && apiServerUrl && apiNodeJsServerUrl && slackSignupUrl;

if (!isEnvValid) {
  throw new Error("Missing environment variables.");
}

const dotenv = {
  domain: domain,
  clientId: clientId,
  audience: audience,
  apiServerUrl: apiServerUrl,
  apiNodeJsServerUrl: apiNodeJsServerUrl,
  slackSignupUrl: slackSignupUrl
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
