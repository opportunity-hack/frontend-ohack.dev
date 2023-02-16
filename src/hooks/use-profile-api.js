import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import { useEnv } from "../context/env.context";


import { useState, useEffect, useCallback, useMemo } from "react";

export default function useProfileApi(){
    const { getAccessTokenSilently, user } = useAuth0();
    const { apiServerUrl } = useEnv();

    const [badges, setBadges] = useState(null);
    const [hackathons, setHackathons] = useState(null);
     
    const default_profile = useMemo(() => {
        return {
            "profile_url": "",
            "profile_image": "https://i.imgur.com/RdOsE7s.png"
        }
    }, []);

    const [profile, setProfile] = useState(default_profile);
    const [feedback_url, setFeedbackUrl] = useState("");


    const makeRequest = useCallback(async (options) => {
        try {
            if (options.authenticated) {
                const token = await getAccessTokenSilently();

                options.config.headers = {
                    ...options.config.headers,
                    Authorization: `Bearer ${token}`,
                };
            }

            const response = await axios(options.config);
            const { data } = response;

            return data;
        } catch (error) {

            if (axios.isAxiosError(error) && error.response) {
                return error.response;
            }

            return error.message;
        }
    }, [getAccessTokenSilently]);

    const handle_help_toggle = async (status, problem_statement_id, mentor_or_hacker, npo_id) => {
        if (!user)
            return null;
        
        console.log(user);

        const config = {
            url: `${apiServerUrl}/api/messages/profile/helping`,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            data: {
                user_id: user.sub, // Slack User ID (since we get this from the Auth0 Session)
                status: status, // helping or not_helping
                problem_statement_id: problem_statement_id,
                type: mentor_or_hacker, // mentor or hacker
                npo_id: npo_id
            }
        };

        const data = await makeRequest({ config, authenticated: true });
        // onComplete(data.text); // Comes from backend, something like "Updated NPO" when successful
        return data;
    };

    const fetchUser = useCallback(async (options) => {
        try {
            if (options.authenticated) {
                const token = await getAccessTokenSilently();

                options.config.headers = {
                    ...options.config.headers,
                    Authorization: `Bearer ${token}`,
                };
            }

            const response = await axios(options.config);
            const { data } = response;

            return data;
        } catch (error) {

            if (axios.isAxiosError(error) && error.response) {
                return error.response;
            }

            return error.message;
        }
    }, [getAccessTokenSilently]);


    
    /*
    User is already signed in via Auth0 SDK
    Pass profile data to backend to save the fact that they have logged in
    Also allow backend to link together data from other sources like GitHub/DevPost, etc.
    */

    useEffect(() => {
    
        const getProfileDetails = async () => {
            if (!user)
                return null;

            const config = {
                url: `${apiServerUrl}/api/messages/profile`,
                method: "GET",
                headers: {
                    "content-type": "application/json",
                },
            };

            const data = await fetchUser({ config, authenticated: true });

            if (data) {
                console.log(data);

                if (data.text && data.text.badges && data.text.hackathons) {                    
                    setBadges(data.text.badges);
                    setHackathons(data.text.hackathons);

                    var profileData = data.text;
                    profileData["profile_url"] = window.location.href + "/" + data.text.id;
                    setProfile(profileData);
                    setFeedbackUrl(window.location.href.replace("profile", "feedback") + "/" + data.text.id);

                }
                else {
                    setBadges(null);
                    setHackathons(null);
                    setProfile(default_profile);
                    setFeedbackUrl("");
                }
            }
        };

        getProfileDetails();
    }, [user, apiServerUrl, fetchUser, default_profile]);
    

    return {              
        badges,
        hackathons,
        profile,
        feedback_url,
        handle_help_toggle
    };
};
