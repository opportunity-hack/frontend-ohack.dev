import axios from "axios";
import { useEnv } from "../context/env.context";
import { useAuthInfo } from '@propelauth/react';
import { useState, useEffect, useMemo, useCallback } from "react";

export default function useProfileApi(){
    
    const { user } = useAuthInfo();
    
    const { apiServerUrl } = useEnv();

    const [badges, setBadges] = useState(null);
    const [hackathons, setHackathons] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
     
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
            url: `${apiServerUrl}/api/users/profile`,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            data: {
                metadata: metadata
            }
        });

        const { data } = response;

        // The canonical endpoint returns the updated flat profile dict.
        // Keep the profile state fresh, and keep the historical onComplete
        // contract (a status string) stable for all existing callers.
        if (data && data.id) {
            setProfile({ ...data, profile_url: `/profile/${data.id}` });
        }
        onComplete("Saved Profile Metadata");
        return data;
    };


    const handle_help_toggle = async (status, problem_statement_id, mentor_or_hacker, npo_id) => {
        if (!user)
            return null;

        if (!status || !problem_statement_id || !mentor_or_hacker || !npo_id){
            console.error("handle_help_toggle: Missing required parameters");
            console.error("status: ", status);
            console.error("problem_statement_id: ", problem_statement_id);
            console.error("mentor_or_hacker: ", mentor_or_hacker);
            console.error("npo_id: ", npo_id);
            return null;
        }
        
        const response = await axios({
            url: `${apiServerUrl}/api/users/profile/helping`,
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

    /*
    User is already signed in via Auth0 SDK
    Pass profile data to backend to save the fact that they have logged in
    Also allow backend to link together data from other sources like GitHub/DevPost, etc.
    */

    useEffect(() => {
        const getProfileDetails = async () => {
            setIsLoading(true);
            
            if (!user) {
                setIsLoading(false);
                return null;
            }

            try {
                const response = await axios({
                    url: `${apiServerUrl}/api/users/profile`,
                    method: "GET",
                    headers: {
                        "content-type": "application/json",
                    },
                });

                const { data } = response;

                if (data && data.id) {
                    setBadges(data.badges);
                    setHackathons(data.hackathons);

                    // The canonical endpoint returns the full flat profile —
                    // spread it instead of hand-projecting fields (the old
                    // projection silently dropped anything it didn't list,
                    // which is exactly the bug class the backend registry
                    // now guards against).
                    setProfile({
                        ...data,
                        profile_url: `/profile/${data.id}`, // /profile/<db id>
                    });
                    setFeedbackUrl(`/feedback/${data.id}`);
                }
                else {
                    setBadges(null);
                    setHackathons(null);
                    setProfile(default_profile);
                    setFeedbackUrl("");
                }
            } catch (error) {
                console.error("Error fetching profile details:", error);
                setBadges(null);
                setHackathons(null);
                setProfile(default_profile);
                setFeedbackUrl("");
            } finally {
                setIsLoading(false);
            }
        };

        getProfileDetails();
    }, [user, apiServerUrl, default_profile]);
    

    return {
        badges,
        hackathons,
        profile,
        feedback_url,
        handle_help_toggle,
        update_profile_metadata,
        isLoading
    };
};
