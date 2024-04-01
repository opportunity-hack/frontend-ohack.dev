import axios from "axios";
import { useEnv } from "../context/env.context";
import { useState, useEffect, useCallback } from "react";
import { useAuthInfo } from '@propelauth/react';

export default function useHackathonEvents( currentOnly ){

    const { isLoggedIn, user, accessToken } = useAuthInfo();
    const { apiServerUrl } = useEnv();
    const [hackathons, setHackathons] = useState([]);


    const makeRequest = useCallback(async (options) => {
        try {
            if (options.authenticated) {                

                options.config.headers = {
                    ...options.config.headers,
                    Authorization: `Bearer ${accessToken}`,
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
    }, [accessToken]);


    const handle_get_hackathon = async (event_id, onComplete) => {        
        const config = {
            url: `${apiServerUrl}/api/messages/hackathon/${event_id}`,
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }            
        };

        const data = await makeRequest({ config, authenticated: false });        
        onComplete(data); 
        return data;
    };

    const handle_get_hackathon_id = async (id, onComplete) => {        
        const config = {
            url: `${apiServerUrl}/api/messages/hackathon/id/${id}`,
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }            
        };

        const data = await makeRequest({ config, authenticated: false });        
        onComplete(data); 
        return data;
    };

    const handle_problem_statement_to_event_link_update = async (mapping, onComplete) => {
        if (!user)
            return null;

        const config = {
            url: `${apiServerUrl}/api/messages/problem_statements/events`,
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            data: {
                mapping
            }
        };

        const data = await makeRequest({ config, authenticated: true });
        onComplete(data.text); // Comes from backend, something like "Updated NPO" when successful
        return data;
    };

    useEffect(() => {
        const getHackathons = async () => {
            var config = {
                url: `${apiServerUrl}/api/messages/hackathons`,
                method: "GET",
                params: {
                    current: currentOnly
                },
                headers: {
                    "content-type": "application/json",
                },
            };


            // Publically available, so authenticated: false here
            const data = await makeRequest({ config, authenticated: false });
            if (data) {
                if (data.status && data.status === 403) {
                    setHackathons([]);
                }
                else {
                    setHackathons(data.hackathons);
                }
            }
            else {
                setHackathons([])
            }
        };

        getHackathons();
    }, [currentOnly, user, apiServerUrl, makeRequest]);



    return {
        hackathons,
        handle_get_hackathon,
        handle_get_hackathon_id,
        handle_problem_statement_to_event_link_update
    }
}