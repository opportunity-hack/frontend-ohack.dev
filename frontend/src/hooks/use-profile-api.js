import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import { useState } from "react";
import { useEnv } from "../context/env.context";


export const useProfileApi = () => {
    const [badges, setBadges] = useState("");

    const { getAccessTokenSilently } = useAuth0();
    const { apiServerUrl } = useEnv();


    const getAToken = async () => {
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

            if (data.app_metadata["something"] == 123355) {
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

            return data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                return error.response.data;
            }

            return error.message;
        }
    };

    const getUserInfo = async () => {

        const config = {
            url: `https://${process.env.REACT_APP_AUTH0_DOMAIN}/api/v2/users/google-oauth2|105444089205394472498`,
            method: "GET",
            headers: {
                "content-type": "application/json",
            },
        };

        const data = await makeUserManagementRequest({ config });

    };


    return {        
        badges,        
        getUserInfo
    };
};
