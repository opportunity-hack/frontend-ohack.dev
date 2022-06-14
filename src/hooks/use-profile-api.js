import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import { useState } from "react";
import { useEnv } from "../context/env.context";


export const useProfileApi = () => {
    const [badges, setBadges] = useState("");

    const { getAccessTokenSilently, user } = useAuth0();
    const { apiServerUrl } = useEnv();



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

    
        /*
    User is already signed in via Auth0 SDK
    Pass profile data to backend to save the fact that they have logged in
    Also allow backend to link together data from other sources like GitHub/DevPost, etc.

    */
    const getUserInfo = async () => {
        if(!user)
            return null;

        const config = {
            url: `${apiServerUrl}/api/messages/profile/${user.sub}`,
            method: "GET",
            headers: {
                "content-type": "application/json",
            },
        };

        const data = await makeRequest({ config, authenticated: true });
        console.log("====")
        console.log(data);
        console.log(data.text.badges);
        console.log("====")
        return data;
    };

    return {        
        badges,        
        getUserInfo
    };
};
