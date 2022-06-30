import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import { useEnv } from "../context/env.context";


import { useState, useEffect } from "react";

export const useProfileApi = () => {
    const { getAccessTokenSilently, user } = useAuth0();
    const { apiServerUrl } = useEnv();

    const [badges, setBadges] = useState(null);
    const [hackathons, setHackathons] = useState(null);
    const [profile_url, setProfileUrl] = useState("");

    


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

    useEffect(() => {
        const public_profile_url = () => {            
            if (user == null || !user.hasOwnProperty("sub"))  {
                setProfileUrl("");
            }
            else {
                setProfileUrl(window.location.href + "/" + user.sub)                
            }

        };

        const getProfileDetails = async () => {
            if (!user)
                return null;

            const config = {
                url: `${apiServerUrl}/api/messages/profile/`,
                method: "GET",
                headers: {
                    "content-type": "application/json",
                },
            };

            const data = await makeRequest({ config, authenticated: true });

            if (data) {
                if (data.text && data.text.badges && data.text.hackathons) {                    
                    setBadges(data.text.badges);
                    setHackathons(data.text.hackathons);
                }
                else {
                    setBadges(null);
                    setHackathons(null);
                }
            }
        };

        public_profile_url();
        getProfileDetails();
    });
    

    return {              
        badges,
        hackathons,
        profile_url
    };
};
