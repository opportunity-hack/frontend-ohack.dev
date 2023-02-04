import { useEnv } from "../context/env.context";
import useProfileApi from "./use-profile-api";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import { useState, useEffect, useCallback } from "react";

export default function useNewsLetterSubscriptionAPI(){

  const { apiServerUrl } = useEnv();
  const { fetchUser } = useProfileApi();
  const { getAccessTokenSilently, user } = useAuth0();

  

  const makeRequest = useCallback(async (options) => {
    
      try {
        
          if (options.authenticated) {
              const token = await getAccessTokenSilently();
             
              options.config.headers = {
                  ...options.config.headers,
                  Authorization: `Bearer ${token}`,
              };
          }
          const return_val = await axios(options.config)
          const { data } = return_val
          return {data}

      } catch (error) {

          if (axios.isAxiosError(error) && error.response) {
              return error.response;
          }

          return error.message;
      }
  }, [getAccessTokenSilently]);

  /**
   * calls either the unsubscribe or subscribe based on the param
   * @param {subscribe, user_id} strings
   */
  async function subscribe(subscription_state, user_id){
    const config = {
      url: `${apiServerUrl}/api/newsletter-subs/${subscription_state}/${user_id}`,
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
    };
    const data = await makeRequest({ config, authenticated: true });
  
    if (data) {
      console.log(  `${apiServerUrl}/api/newsletter-subs/${subscription_state}/${user_id}`, data)
      var new_data = data.data
      new_data["subscribed"] =  new_data["subscribed"] == "true"
      console.log(new_data)
      return new_data
    } else {
      return undefined
    }
  }
  
  
  async function check_subscription_status(user_id){
    const config = {
      url: `${apiServerUrl}/api/newsletter-subs/verify/${user_id}`,
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
    };
    const data = await makeRequest({ config, authenticated: true });
    if(data == "Login required"){
      return data
    }
    console.log(".............",data.data)
    if (data) {
      
      var new_data = data.data
      console.log(new_data["is_subscribed"] , "true")
      return new_data["is_subscribed"] == "true"
      // TODO: return boolean to stop loader if any
    } else {
      console.log("error");
    }
  }
  return{
    subscribe,
    check_subscription_status
  };
  }