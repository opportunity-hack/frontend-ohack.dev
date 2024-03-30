import React from "react";

const apiServerUrl = process.env.NEXT_PUBLIC_API_SERVER_URL;
const apiNodeJsServerUrl = process.env.NEXT_PUBLIC_API_NODEJS_SERVER_URL;
const slackSignupUrl = process.env.NEXT_PUBLIC_SLACK_SIGNUP_LINK;

const isEnvValid =  apiServerUrl && apiNodeJsServerUrl && slackSignupUrl;

if (!isEnvValid) {
  throw new Error("Missing environment variables.");
}

const dotenv = {  
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
