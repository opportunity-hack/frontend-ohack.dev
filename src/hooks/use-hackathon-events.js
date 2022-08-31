import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import { useEnv } from "../context/env.context";
import { useState, useEffect, useCallback } from "react";


export const useHackathonEvents = () => {

    const { getAccessTokenSilently, user } = useAuth0();
    const { apiServerUrl } = useEnv();
    const [hackathons, setHackathons] = useState([]);


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
    }, [user, apiServerUrl, makeRequest]);



    return {
        hackathons,
        handle_problem_statement_to_event_link_update
    }
}