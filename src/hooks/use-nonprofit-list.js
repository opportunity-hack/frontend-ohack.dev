import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import { useEnv } from "../context/env.context";

export default function useNonProfitList() {
    const { apiServerUrl } = useEnv();
    const { getAccessTokenSilently } = useAuth0();
    const [nonprofits, setNonprofits] = useState([]);
    
    // Call ${apiServerUrl}/api/messages/npo
    // Get the list of nonprofits
    useEffect(() => {
        const getNonprofits = async () => {
            const token = await getAccessTokenSilently();

            const response = await axios.get(`${apiServerUrl}/api/messages/npos`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log(response.data.nonprofits);
            setNonprofits(response.data.nonprofits);
        };
        getNonprofits();
    }, [getAccessTokenSilently, apiServerUrl]);

    // Return the list of nonprofits
    return { nonprofits };
}