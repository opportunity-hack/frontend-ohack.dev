import axios from "axios";
import { useEnv } from "../context/env.context";
import { useAuthInfo } from '@propelauth/react';



import { useState, useEffect, useCallback, useMemo } from "react";

export default function useProfileApi(){
    
    const { user, accessToken } = useAuthInfo();
    
    

    
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


    const update_profile_metadata = async (metadata, onComplete) => {
        if (!user)
            return null;

        const response = await axios({
            // TODO: Cut over to this eventually
            //url: `${apiServerUrl}/api/users/profile`,
            url: `${apiServerUrl}/api/messages/profile`,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            data: {
                // user_id: user_id,
                metadata: metadata
            }
        });
            
        const { data } = response;

        // TODO: When we cut over to the user service, this will return a profile object. There won't be a "text" field.
        onComplete(data.text); // Comes from backend, something like "Updated NPO" when successful
        return data;
    };


    const handle_help_toggle = async (status, problem_statement_id, mentor_or_hacker, npo_id) => {
        if (!user)
            return null;
                
        const response = await axios({
            url: `${apiServerUrl}/api/messages/profile/helping`,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            data: {
                // user_id: user_id,
                status: status, // helping or not_helping
                problem_statement_id: problem_statement_id,
                type: mentor_or_hacker, // mentor or hacker
                npo_id: npo_id
            }
        });

        const { data } = response;
        // onComplete(data.text); // Comes from backend, something like "Updated NPO" when successful
        return data;
    };

    // Handle calling /profile/ endpoint by user id using the db id of the user (not the Propel ID or the Slack ID)
    const get_user_by_id = async (user_id, onComplete) => {
        if (!user_id)
            return null;
        
        const response = await axios({  
            url: `${apiServerUrl}/api/users/${user_id}/profile`,
            method: "GET",
            headers: {
                "content-type": "application/json",
            },
        });

        const { data } = response;

        onComplete(data);
        return data;
    };
    
    /*
    User is already signed in via Auth0 SDK
    Pass profile data to backend to save the fact that they have logged in
    Also allow backend to link together data from other sources like GitHub/DevPost, etc.
    */

    useEffect(() => {
        const getProfileDetails = async () => {
            console.log("*** getProfileDetails user_id: ", user);
            
            if (!user)
                return null;

            const response = await axios({  
                url: `${apiServerUrl}/api/messages/profile`,
                method: "GET",
                headers: {
                    "content-type": "application/json",
                },
            });

            const { data } = response;

            if (data) {     
                console.log("*** getProfileDetails data: ", data);               
                // TODO: update backend user service to return badges and consume them here
                setBadges(data.text.badges);
                // TODO: update backend user service to return hackathons and consume them here
                setHackathons(data.text.hackathons);

                /* profileData is expected to have the form:
                    {role: '', education: '', shirt_size: '', profile_url: ''}
                */

                var profileData = {
                    role: data.text.role,
                    education: data.text.education,
                    shirt_size: data.text.shirt_size,
                    expertise: data.text.expertise,
                    why: data.text.why,
                    company: data.text.company,
                    github: data.text.github,
                    history: data.text.history,
                    profile_url: window.location.href + "/" + data.text.id  // /profile/<db id>
                };

                setProfile(profileData);
                setFeedbackUrl(window.location.href.replace("profile", "feedback") + "/" + data.id);

            }
            else {
                setBadges(null);
                setHackathons(null);
                setProfile(default_profile);
                setFeedbackUrl("");
            }
            
        };

        getProfileDetails();
    }, [user, apiServerUrl, default_profile]);
    

    return {              
        badges,
        hackathons,
        profile,
        get_user_by_id,
        feedback_url,
        handle_help_toggle,
        update_profile_metadata
    };
};
