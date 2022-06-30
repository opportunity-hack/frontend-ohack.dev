import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import { useEnv } from "../context/env.context";
import { useState, useEffect, useCallback } from "react";


export const useAdmin = () => {
    const { getAccessTokenSilently, user } = useAuth0();
    const { apiServerUrl } = useEnv();
    const [isAdmin, setIsAdmin ] = useState(false);

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

  


    useEffect(() => {
        const getIsAdmin = async () => {
            if (!user)
                return null;

            const config = {
                url: `${apiServerUrl}/api/messages/admin`,
                method: "GET",
                headers: {
                    "content-type": "application/json",
                },
            };

            const data = await fetchUser({ config, authenticated: true });

            if (data) {      
                if(data.status && data.status === 403)
                {
                    setIsAdmin(false);
                }
                else
                {
                    setIsAdmin(true);
                }
            }
            else {
                setIsAdmin(false);
            }
        };

        getIsAdmin();
    }, [user, apiServerUrl, fetchUser]);



    return{
        isAdmin
    }
}