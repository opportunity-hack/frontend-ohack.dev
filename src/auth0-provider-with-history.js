import { Auth0Provider } from "@auth0/auth0-react";
import React from "react";
import { useEnv } from "./context/env.context";
import Router from 'next/router'


export const Auth0ProviderWithHistory = ({ children }) => {
  const { domain, clientId, audience } = useEnv();

  const onRedirectCallback = (appState) => {
    Router.push(appState?.returnTo || window.location.pathname);
  };

  if (!(domain && clientId && audience)) {
    return null;
  }

  if (typeof window !== 'undefined') {
    return (
      <Auth0Provider
        domain={domain}
        clientId={clientId}
        audience={audience}
        authorizationParams={{
          redirect_uri: window.location.origin          
        }}        
        onRedirectCallback={onRedirectCallback}              
      >
        {children}
      </Auth0Provider>
    );
  } else {
    return (<div></div>);
  }
};
