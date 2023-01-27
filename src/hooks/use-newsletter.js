import { useEnv } from "../context/env.context";
import { useState, useEffect, useCallback } from "react";
import useProfileApi from "./use-profile-api";

export default function useNewsLetterAPI() {
  const { apiServerUrl } = useEnv();
  const [subscribers, setSubscribers] = useState([]);
  const { fetchUser } = useProfileApi();
  useEffect(() => {

    
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



  async function submit_email(subject, message, is_html) {
    const email_data = {
      body: message,
      is_html: is_html,
      subject: subject,
      addresses: subscribers
    };
    console.log(email_data);

    const config = {
      url: `${apiServerUrl}/api/newsletter/send_newsletter`,
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      data: email_data
    };

    const data = await fetchUser({ config, authenticated: true });

    if (data) {
      // console.log(data);
      // subscribers = data["active"]
      // console.log(subscribers)
      console.log("successfully sent");
    } else {
      console.log("error");
      // subscribers = []
    }
  }

  return {
    subscribers,
    submit_email
  };
}
