import useNewsLetterAPI from "../../../hooks/use-newsletter";
import { useRouter } from "next/router";
import { useState } from "react";
import NewsletterSubscriptionButton from "../../../components/buttons/newsletter-button";
import NewsletterResponses from "../../../components/newsletter";
export default function Subscribe_to_newsletter() {
  const router = useRouter();
  const { user_Id } = router.query;
 
  return (
    <NewsletterResponses type="subscribe" message="We're happy you'd like to subscribe. Accept out newsletter terms(idk about this one)"></NewsletterResponses>
  );

}


