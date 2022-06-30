import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import { useEnv } from "../context/env.context";
import { useState, useEffect, useCallback } from "react";


export const useNonprofit = () => {
    const { getAccessTokenSilently, user } = useAuth0();
    const { apiServerUrl } = useEnv();
    const [nonprofits, setNonprofits] = useState([]);

    const fetchNpoList = useCallback(async (options) => {
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
        const getNonprofits = async () => {
            

            const config = {
                url: `${apiServerUrl}/api/messages/npos`,
                method: "GET",
                headers: {
                    "content-type": "application/json",
                },
            };

            // Publically available, so authenticated: false here
            const data = await fetchNpoList({ config, authenticated: false });

            if (data) {
                if (data.status && data.status === 403) {
                    setNonprofits([]);
                }
                else {
                    console.log("data!!");
                    console.log(data);
                    setNonprofits(data.nonprofits);
                }
            }
            else {
                setNonprofits([])
            }
        };

        getNonprofits();
    }, [user, apiServerUrl, fetchNpoList]);



    return {
        nonprofits
    }
}