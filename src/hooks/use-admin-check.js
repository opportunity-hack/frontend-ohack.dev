import { useAuthInfo } from '@propelauth/react'
import axios from "axios";
import { useEnv } from "../context/env.context";
import { useState, useEffect, useCallback } from "react";


export default function useAdmin() {
  const { user, accessToken } = useAuthInfo();
    const { apiServerUrl } = useEnv();
    const [isAdmin, setIsAdmin ] = useState(false);

    const fetchUser = useCallback(async (options) => {
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



    return {
        isAdmin
    }
}

