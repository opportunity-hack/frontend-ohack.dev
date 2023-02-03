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
        console.log(data.active["no role"])
        setSubscribers(data.active);
      } else {
        setSubscribers([]);
      }
    };

    getSubscriptions();
  }, []);

/**
 * calls either the unsubscribe or subscribe based on the param
 * @param {subscribe, user_id} strings
 */
  async function subscribe(subscription_state, user_id){
    const config = {
      url: `${apiServerUrl}/api/newsletter/${subscription_state}/${user_id}`,
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
    };
    const data = await fetchUser({ config, authenticated: true });

    if (data) {
      console.log(`successfully ${subscription_state}d >>>>>` + JSON.stringify(data));
      var new_data = JSON.parse(JSON.stringify(data))
      new_data["subscribed"] =  new_data["subscribed"] == "true"
      return new_data
      // TODO: return boolean to stop loader if any
    } else {
      console.log("error");
      return undefined
    }
  }


  async function check_subscription_status(user_id){
    const config = {
      url: `${apiServerUrl}/api/newsletter/verify/${user_id}`,
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
    };
    const data = await fetchUser({ config, authenticated: true });

    if (data) {
      var new_data = JSON.parse(JSON.stringify(data))
      return new_data["is_subscribed"] == "true"
      // TODO: return boolean to stop loader if any
    } else {
      console.log("error");
    }
  }
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
      console.log(data.active)
     return data.active;
    } else {
      return []
    }
  };

  async function submit_email(subject, message, is_html,addresses) {
    const email_data = {
      body: message,
      is_html: is_html,
      subject: subject,
      addresses: addresses
    };
    console.log(email_data);
    // console.log(addresses)

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
      return true
    } else {
      return false
    }
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
    subscribe,
    check_subscription_status,
    get_subscriber_list
  };
}
