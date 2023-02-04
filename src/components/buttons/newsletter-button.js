import React from "react";
import useNewsLetterSubscriptionAPI from "../../hooks/use-newsletter-subscription"
import toast, { Toaster } from 'react-hot-toast';

export default function NewsletterSubscriptionButton(props) {
  const { subscribe, check_subscription_status } = useNewsLetterSubscriptionAPI();
  const notify = (value) => toast(value);
  const error = (value) => toast.error(value);
  const loading = () => toast.loading("loading");
  const success = (value) => toast.success(value);
  return (
    <button
      className="button dark-text locked light-text"
      onClick={(e) => {
        
        check_subscription_status(props.user_id).then((subscribed) => {
          if(subscribed == "Login required"){
            error("Login Required")
          }
          else{
            if (
              (subscribed && props.text == "unsubscribe") ||
              (!subscribed && props.text == "subscribe")
            ) {
              subscribe(props.text, props.user_id).then((data) => {
                success(
                  `Successfully ${
                    data["subscribed"] ? "subscribed to" : "unsubscribed from"
                  } Opportunity hack`
                );
              });
            } else {
              error(
                props.text == "subscribe"
                  ? "Sorry, you are already subscribed"
                  : "Sorry, your subscription status is currently inactive"
              );
            }
          }
         
        });
      }}
    >
      {props.text}
      <Toaster />
    </button>
  );
}
