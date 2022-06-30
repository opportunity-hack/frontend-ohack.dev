import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import { useState } from "react";
import { useEnv } from "../context/env.context";

export const AccessControlLevel = {
  PUBLIC: "public",
  PROTECTED: "requires-authentication",
  RBAC: "requires-role-permission",
  CORS: "requires-cors-allowed-method",
};

export const useExternalApi = () => {
  const [apiEndpoint, setApiEndpoint] = useState("");
  const [apiResponse, setApiResponse] = useState(
    "Click a button to make an API request..."
  );
  const [selectedAccessControlLevel, setSelectedAccessControlLevel] =
    useState(null);

  const [badges, setBadges] = useState("");

  const { getAccessTokenSilently } = useAuth0();
  
  const { apiServerUrl } = useEnv();

 // Moved this over to Python backend 
  const getAToken = async() => {
    const config = {
      url: `https://${process.env.REACT_APP_AUTH0_DOMAIN}/oauth/token`,
      method: "POST",
      data: {
        client_id: process.env.REACT_APP_AUTH0_USER_MGMT_CLIENT_ID,
        client_secret: process.env.REACT_APP_AUTH0_USER_MGMT_SECRET,
        grant_type: "client_credentials",
        audience: `https://${process.env.REACT_APP_AUTH0_DOMAIN}/api/v2/`,
      },
      headers: {
        "content-type": "application/json",
      },
    };

    const response = await axios(config);
    
    return response.data.access_token;
  };

  // Moved this over to Python backend 
  const makeUserManagementRequest = async (options) => {    
    try {      
      const token = await getAToken();

      options.config.headers = {
        ...options.config.headers,
        Authorization: `Bearer ${token}`,
      };
    
      const response = await axios(options.config);      
      const { data } = response;

      console.log(data);
      console.log(data.app_metadata);
      console.log(data.created_at);
      console.log(data.email);
      console.log(data.email_verified);
      console.log(data.name);

      if( data.app_metadata["something"] === 123355 )
      {
        setBadges("pie");
      }
      else {
        setBadges("cake");
      }

      return data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data;
      }
      
      return error.message;
    }    
  };


  const makeRequest = async (options) => {
    console.log("makeRequest Start");
    try {
      if (options.authenticated) {
        const token = await getAccessTokenSilently();

        options.config.headers = {
          ...options.config.headers,
          Authorization: `Bearer ${token}`,
        };
      }

      const response = await axios(options.config);
      console.log(response);
      const { data } = response;

      console.log("makeRequest End");
      return data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data;
      }

      return error.message;
    }
  };

  const getUserInfo = async () => {
    setSelectedAccessControlLevel(AccessControlLevel.PUBLIC);

    setApiEndpoint("GET /api/v2/users/google-oauth2|105444089205394472498");

    const config = {
      url: `https://${process.env.REACT_APP_AUTH0_DOMAIN}/api/v2/users/google-oauth2|105444089205394472498`,
      method: "GET",
      headers: {
        "content-type": "application/json",
      },
    };

    const data = await makeUserManagementRequest({ config });

    setApiResponse(JSON.stringify(data, null, 2));
  };

  const getPublicResource = async () => {
    setSelectedAccessControlLevel(AccessControlLevel.PUBLIC);

    setApiEndpoint("GET /api/messages/public");

    const config = {
      url: `${apiServerUrl}/api/messages/public`,
      method: "GET",
      headers: {
        "content-type": "application/json",
      },
    };

    const data = await makeRequest({ config });

    setApiResponse(JSON.stringify(data, null, 2));
  };


  /*
  User is already signed in via Auth0 SDK
  Pass profile data to backend to save the fact that they have logged in
  Also allow backend to link together data from other sources like GitHub/DevPost, etc.

  */
  const getProtectedResource = async () => {
    setSelectedAccessControlLevel(AccessControlLevel.PROTECTED);


    setApiEndpoint("GET /api/messages/profile");

    const config = {
      url: `${apiServerUrl}/api/messages/profile`,
      method: "GET",
      headers: {
        "content-type": "application/json",
      },
    };

    const data = await makeRequest({ config, authenticated: true });

    setApiResponse(JSON.stringify(data, null, 2));
  };

  const getRbacResource = async () => {
    setSelectedAccessControlLevel(AccessControlLevel.RBAC);

    setApiEndpoint("GET /api/messages/admin");

    const config = {
      url: `${apiServerUrl}/api/messages/admin`,
      method: "GET",
      headers: {
        "content-type": "application/json",
      },
    };

    const data = await makeRequest({ config, authenticated: true });

    setApiResponse(JSON.stringify(data, null, 2));
  };

  const checkCorsAllowedMethod = async () => {
    setSelectedAccessControlLevel(AccessControlLevel.CORS);

    setApiEndpoint("DELETE /api/messages/public");

    const config = {
      url: `${apiServerUrl}/api/messages/public`,
      method: "DELETE",
      headers: {
        "content-type": "application/json",
      },
    };

    const data = await makeRequest({ config, authenticated: true });

    setApiResponse(JSON.stringify(data, null, 2));
  };

  return {
    selectedAccessControlLevel,
    apiEndpoint,
    apiResponse,
    badges,
    getPublicResource,
    getProtectedResource,
    getRbacResource,
    checkCorsAllowedMethod,
    getUserInfo
  };
};
