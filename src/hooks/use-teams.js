import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import { useEnv } from "../context/env.context";
import { useState, useEffect, useCallback } from "react";


export default function useTeams(){

    const { getAccessTokenSilently, user } = useAuth0();
    const { apiServerUrl } = useEnv();
    const [teams, setTeams] = useState([]);
    

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

    // Get a single team
    const handle_get_team = async (team_id, onComplete) => {
        const config = {
            url: `${apiServerUrl}/api/messages/team/${team_id}`,
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


    const handle_new_team_submission = async (teamName, teamSlackChannel, problemStatementId, eventId, userId, onComplete) => {
        if (!user)
            return null;

        const config = {
            url: `${apiServerUrl}/api/messages/team`,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            data: {
                name: teamName,
                userId: userId,
                eventId: eventId,
                problemStatementId: problemStatementId,
                slackChannel: teamSlackChannel                      
            }
        };

        const data = await makeRequest({ config, authenticated: true });
        onComplete(data);
        return data;
    };

    const handle_join_team = async (teamId, onComplete) => {
        if (!user)
            return null;

        const config = {
            url: `${apiServerUrl}/api/messages/team`,
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            data: {
                teamId: teamId                                       
            }
        };

        const data = await makeRequest({ config, authenticated: true });
        onComplete(data.text);
        return data;
    };

    const handle_unjoin_a_team = async (teamId, onComplete) => {
        if (!user)
            return null;

        const config = {
            url: `${apiServerUrl}/api/messages/team`,
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            data: {
                teamId: teamId                                       
            }
        };

        const data = await makeRequest({ config, authenticated: true });
        onComplete(data.text);
        return data;
    };

    /*
    // TODO: Finish this method
    const handle_npo_problem_statement_edit = async (id, checked_problem_statements, onComplete) => {
        if (!user)
            return null;

        const config = {
            url: `${apiServerUrl}/api/messages/team/edit`,
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            data: {
                id: id,
                // We send just the ID to the backend, it will convert this to an object
                // Ref: https://stackoverflow.com/a/59394211
                problem_statements: checked_problem_statements.map(item => {
                    return `${item}`
                })
            }
        };

        const data = await makeRequest({ config, authenticated: true });
        onComplete(data.text); // Comes from backend, something like "Updated NPO" when successful
        return data;
    };    
    */

    useEffect(() => {
        const getTeams = async () => {
            var config = {
                    url: `${apiServerUrl}/api/messages/teams`,
                    method: "GET",
                    headers: {
                        "content-type": "application/json",
                    },
                };


            // Publically available, so authenticated: false here
            const data = await makeRequest({ config, authenticated: false });

            if (data) {

                if (data.status && data.status === 403) {
                    setTeams([]);
                }
                else {                  
                    setTeams(data.teams);
                }
            }
            else {
                setTeams([])                
            }
        };

        getTeams();
    }, [user, apiServerUrl, makeRequest]);



    return {
        teams,
        handle_new_team_submission,
        handle_unjoin_a_team,
        handle_join_team,
        handle_get_team
    }
}