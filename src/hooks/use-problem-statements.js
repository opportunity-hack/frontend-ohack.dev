import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import { useEnv } from "../context/env.context";
import { useState, useEffect, useCallback, useMemo } from "react";


export default function useProblemstatements(problem_statement_id){

    const default_problem_statement = useMemo(()=>{
        return {
            "title": "",
            "description": "",
            "github": ""
        }
    }, []);

    const { getAccessTokenSilently, user } = useAuth0();
    const { apiServerUrl } = useEnv();
    const [problem_statements, setProblemStatements] = useState([]);
    const [problem_statement, setProblemStatement] = useState(default_problem_statement);


    const fetchProblemStatements = useCallback(async (options) => {
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




    useEffect(() => {
        const getProblemStatements = async () => {
            var config = null;
            if (problem_statement_id) {
                config = {
                    url: `${apiServerUrl}/api/messages/problem_statement/${problem_statement_id}`,
                    method: "GET",
                    headers: {
                        "content-type": "application/json",
                    },
                };
            }
            else {
                config = {
                    url: `${apiServerUrl}/api/messages/problem_statements`,
                    method: "GET",
                    headers: {
                        "content-type": "application/json",
                    },
                };
            }


            // Publically available, so authenticated: false here
            const data = await fetchProblemStatements({ config, authenticated: false });

            if (data) {
                if (data.status && data.status === 403) {
                    setProblemStatements([]);
                }
                else {
                    if (problem_statement_id) {
                        setProblemStatement(data);
                    }
                    else {
                        setProblemStatements(data.problem_statements);
                    }

                }
            }
            else {
                setProblemStatements([])
                setProblemStatement(default_problem_statement);
            }
        };

        getProblemStatements();
    }, [user, apiServerUrl, fetchProblemStatements, problem_statement_id, default_problem_statement]);



    return {
        problem_statements,
        problem_statement
    }
}