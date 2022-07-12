import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import { useEnv } from "../context/env.context";
import { useState, useEffect, useCallback } from "react";


export const useNonprofit = ( nonprofit_id ) => {
    
    const { getAccessTokenSilently, user } = useAuth0();
    const { apiServerUrl } = useEnv();
    const [nonprofits, setNonprofits] = useState([]);
    const [nonprofit, setNonprofit] = useState({
        "name":"",
        "description":"",
        "slack_channel":""
    });


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
            var config = null;
            if (nonprofit_id)
            {
                config = {
                    url: `${apiServerUrl}/api/messages/npo/${nonprofit_id}`,                    
                    method: "GET",
                    headers: {
                        "content-type": "application/json",
                    },
                };
            }
            else {
                config = {
                    url: `${apiServerUrl}/api/messages/npos`,
                    method: "GET",
                    headers: {
                        "content-type": "application/json",
                    },
                };
            }
            

            // Publically available, so authenticated: false here
            const data = await fetchNpoList({ config, authenticated: false });

            if (data) {
                if (data.status && data.status === 403) {
                    setNonprofits([]);
                }
                else {                   
                    if (nonprofit_id)
                    {
                        setNonprofit(data.nonprofits);
                    }
                    else {
                        setNonprofits(data.nonprofits);
                    }
                    
                }
            }
            else {
                setNonprofits([])
                setNonprofit({
                    "name": "",
                    "description": "",
                    "slack_channel": ""
                });
            }
        };

        getNonprofits();
    }, [user, apiServerUrl, fetchNpoList, nonprofit_id]);



    return {
        nonprofits,        
        nonprofit
    }
}