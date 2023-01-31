import React from "react";
import useNewsLetterAPI from "../../hooks/use-newsletter";

export default function NewsletterSubscriptionButton(props) {
  const { subscribe, check_subscription_status } = useNewsLetterAPI();

  return (
    <button
      className="button button--primary"
      onClick={(e) => {
        check_subscription_status(props.user_id).then((subscribed) => {
          if (
            (subscribed && props.text == "unsubscribe") ||
            (!subscribed && props.text == "subscribe")
          ) {
            subscribe(props.text, props.user_id).then((data) => {
              alert(
                `Successfully ${
                  data["subscribed"] ? "subscribed to" : "unsubscribed from"
                } Opportunity hack`
              );
            });
          } else {
            alert(
              props.text == "subscribe"
                ? "Sorry, you are already subscribed"
                : "Sorry, your subscription status is inactive"
            );
          }
        });
      }}
    >
      {props.text}
    </button>
  );
}
