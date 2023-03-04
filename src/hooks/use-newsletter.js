import { useEnv } from "../context/env.context";
import { useState, useEffect, useCallback } from "react";
import useProfileApi from "./use-profile-api";

export default function useNewsLetterAPI() {
  const { apiServerUrl } = useEnv();
  const [subscribers, setSubscribers] = useState([]);
  const { fetchUser } = useProfileApi();

  // every time the newsletter API is called, fetch the list of subscribers 
  useEffect(() => {
    /**
     * fetches all 
     */
    const getSubscriptions = async () => {
      const config = {
        url: `${apiServerUrl}/api/newsletter/`,
        method: "GET",
        headers: {
          "content-type": "application/json"
        }
      };

      const data = await fetchUser({ config, authenticated: true });
      
      if (data) {
        setSubscribers(data.active);
      } else {
        setSubscribers([]);
      }
    };

    getSubscriptions();
  }, []);


  async function get_subscriber_list(){
    const config = {
      url: `${apiServerUrl}/api/newsletter/`,
      method: "GET",
      headers: {
        "content-type": "application/json"
      }
    };

    const data = await fetchUser({ config, authenticated: true });

    if (data) {
     return data.active;
    } else {
      return []
    }
  };

  async function submit_email(subject, message,addresses, role) {
    const email_data = {
      body: message,
      subject: subject,
      addresses: addresses,
      role: role
    };
    const config = {
      url: `${apiServerUrl}/api/newsletter/send_newsletter`,
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      data: email_data
    };

    const data = await fetchUser({ config, authenticated: true });
    // the api returns either "True" or "False"
    return data.toLowerCase() == String(true)
   
  }


  async function preview_newsletter( message, is_html) {
    const email_data = {
      body: message,
      is_html: is_html,
    };

    const config = {
      url: `${apiServerUrl}/api/newsletter/preview_newsletter`,
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      data: email_data
    };

    const data = await fetchUser({ config, authenticated: true });

    return data
  }


  return {
    subscribers,
    submit_email,
    preview_newsletter, 
    get_subscriber_list
  };
}


