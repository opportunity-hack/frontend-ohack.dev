import axios from "axios";
import { useEnv } from "../context/env.context";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuthInfo } from '@propelauth/react';


export default function useProblemstatements(problem_statement_id){

    const default_problem_statement = useMemo(()=>{
        return {
            "title": "",
            "description": "",
            "github": ""
        }
    }, []);

    const { apiServerUrl } = useEnv();
    const [problem_statements, setProblemStatements] = useState([]);
    const [problem_statement, setProblemStatement] = useState(default_problem_statement);
    const { user, accessToken } = useAuthInfo();


    const fetchProblemStatements = useCallback(async (options) => {
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